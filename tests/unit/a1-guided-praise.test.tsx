import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// A1 guided mode: after a right answer "Super!" is spoken (/api/tts, German
// voice); the next letter or word starts only when it has finished. A wrong
// answer is handled exactly as before (no "Super!").

vi.mock("@/lib/audio/guided-mic", () => ({
  MicUnavailableError: class extends Error {},
  openGuidedMic: vi.fn(async () => ({
    record: (signal: AbortSignal) =>
      new Promise((resolve) => {
        const timer = setTimeout(() => resolve({ kind: "speech", blob: new Blob(["voice"]), mimeType: "audio/webm" }), 50);
        signal.addEventListener("abort", () => {
          clearTimeout(timer);
          resolve(null);
        });
      }),
    release: () => undefined,
  })),
}));
const tts = vi.hoisted(() => ({ speechUrl: vi.fn(async (text: string) => `blob:${text}`) }));
vi.mock("@/lib/tts/player", () => ({ speechUrl: tts.speechUrl, speakArabic: vi.fn(async () => undefined), stopSpeaking: vi.fn() }));
vi.mock("@/lib/audio/wav", () => ({ blobTo16KhzMonoWav: vi.fn(async () => new Blob(["RIFF"], { type: "audio/wav" })) }));

import { GuidedSoundWords } from "@/components/a1/guided/guided-sound-words";
import { getA1Lesson } from "@/data/a1";
import { GERMAN_CUES } from "@/lib/pronunciation/cues";
import { isAllowedTtsText } from "@/lib/pronunciation/targets";
import { buildSsml, TTS_VOICE, TTS_VOICE_GERMAN } from "@/lib/tts/ssml";

const words = getA1Lesson("lesson-1", "alif")!.steps[0]!;
if (words.kind !== "sound-words") throw new Error("step-1 must be sound-words");
const groups = words.groups;

/** "Super!" lasts SUPER_MS, everything else 20 ms. */
const SUPER_MS = 1500;
const played: Array<{ text: string; at: number }> = [];
class FakeAudio {
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  paused = true;
  src = "";
  play() {
    const src = this.src;
    if (!src.startsWith("data:")) played.push({ text: src.replace("blob:", ""), at: Date.now() });
    this.paused = false;
    setTimeout(() => !this.paused && this.src === src && this.onended?.(), src === `blob:${GERMAN_CUES.super}` ? SUPER_MS : 20);
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
}

let verdicts: boolean[] = [];
const fetchMock = vi.fn(async () => {
  const v = verdicts.shift() ?? true;
  return { ok: true, status: 200, json: async () => ({ passed: v, scores: { accuracy: v ? 90 : 40 }, feedback: { rule: v ? "excellent" : "x", message: "" }, conditionEvaluation: { azureAccuracy: v ? 90 : 40, iqraPhonemes: ["a"], matchedRule: v ? "excellent" : "x", message: "" } }) };
});

const step = () => screen.getByTestId("guided-step");
const at = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));
async function until(check: () => boolean, ms = 30_000) {
  for (let t = 0; t < ms && !check(); t += 25) await at(25);
  expect(check()).toBe(true);
}
const active = () => step().getAttribute("data-active");
const stage = () => step().getAttribute("data-stage");
const texts = () => played.map((p) => p.text);

async function startGuided() {
  render(<GuidedSoundWords groups={groups} progressKey="a1/lesson-1/alif/step-1" />);
  await at(0);
  fireEvent.click(screen.getByTestId("start-button"));
  await at(0);
}

beforeEach(() => {
  vi.useFakeTimers();
  played.length = 0;
  verdicts = [];
  fetchMock.mockClear();
  tts.speechUrl.mockClear();
  window.localStorage.clear();
  vi.stubGlobal("Audio", FakeAudio);
  vi.stubGlobal("fetch", fetchMock);
  Object.defineProperty(document, "hidden", { value: false, configurable: true });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("guided mode: \"Super!\" after a right answer", () => {
  it("right: \"Super!\" is spoken; the next letter or word starts only after it has finished", async () => {
    await startGuided();
    expect(active()).toBe("alif-fatha");
    await until(() => texts().includes(GERMAN_CUES.super));
    const superAt = played.find((p) => p.text === GERMAN_CUES.super)!.at;
    expect(texts()).toEqual(["أَ", GERMAN_CUES.super]);
    expect(tts.speechUrl).toHaveBeenCalledWith("Super!");
    expect(stage()).toBe("right");

    // Still "Super!" (1.5 s, longer than the green tint): the next block waits.
    await at(SUPER_MS - 300);
    expect(active()).toBe("alif-fatha");
    expect(texts()).toEqual(["أَ", GERMAN_CUES.super]);

    // "Super!" has ended → the next word (أَب) is played.
    await until(() => texts().includes("أَب"));
    expect(played.find((p) => p.text === "أَب")!.at - superAt).toBeGreaterThanOrEqual(SUPER_MS);
    expect(active()).toBe("ab");
    // Then the next right answer gets its own "Super!".
    await until(() => texts().filter((t) => t === GERMAN_CUES.super).length === 2);
    expect(texts().slice(0, 4)).toEqual(["أَ", GERMAN_CUES.super, "أَب", GERMAN_CUES.super]);
  });

  it("wrong: no \"Super!\" – the audio again and a new attempt, as before", async () => {
    verdicts = [false, true];
    await startGuided();
    await until(() => fetchMock.mock.calls.length === 1);
    await until(() => stage() === "listen" && texts().length === 2);
    expect(texts()).toEqual(["أَ", "أَ"]);
    expect(active()).toBe("alif-fatha");
    await until(() => texts().includes(GERMAN_CUES.super));
    expect(texts()).toEqual(["أَ", "أَ", GERMAN_CUES.super]);
  });

  it("if \"Super!\" cannot be loaded (/api/tts not reachable), the flow goes on anyway", async () => {
    tts.speechUrl.mockImplementation(async (text: string) => {
      if (text === GERMAN_CUES.super) throw new Error("tts down");
      return `blob:${text}`;
    });
    await startGuided();
    await until(() => active() === "ab", 5_000);
    expect(texts()).not.toContain(GERMAN_CUES.super);
    tts.speechUrl.mockImplementation(async (text: string) => `blob:${text}`);
  });
});

describe("\"Super!\" through the existing /api/tts", () => {
  it("is an allowed text, spoken with a German voice; Arabic texts keep the Arabic voice", () => {
    expect(isAllowedTtsText("Super!")).toBe(true);
    expect(buildSsml("Super!")).toContain(`<voice name="${TTS_VOICE_GERMAN}">`);
    expect(buildSsml("Super!")).toContain('xml:lang="de-DE"');
    expect(buildSsml("أَب")).toContain(`<voice name="${TTS_VOICE}">`);
    expect(buildSsml("أَب")).toContain('xml:lang="ar-SA"');
  });
});
