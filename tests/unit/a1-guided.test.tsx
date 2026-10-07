import { act, cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// --- mocks: microphone, text-to-speech, WAV conversion (the evaluation is a mocked fetch) ---
const mic = vi.hoisted(() => ({
  script: [] as Array<"speech" | "silence">,
  records: 0,
  released: 0,
  aborted: 0,
  deny: false,
}));
vi.mock("@/lib/audio/guided-mic", () => ({
  MicUnavailableError: class extends Error {},
  openGuidedMic: vi.fn(async () => {
    if (mic.deny) throw new Error("NotAllowedError");
    return {
      record: (signal: AbortSignal) =>
        new Promise((resolve) => {
          mic.records += 1;
          const kind = mic.script.shift() ?? "speech";
          const timer = setTimeout(() => resolve(kind === "speech" ? { kind, blob: new Blob(["voice"]), mimeType: "audio/webm" } : { kind }), 50);
          signal.addEventListener("abort", () => {
            clearTimeout(timer);
            mic.aborted += 1;
            resolve(null);
          });
        }),
      release: () => (mic.released += 1),
    };
  }),
}));
vi.mock("@/lib/tts/player", () => ({ speechUrl: vi.fn(async (text: string) => `blob:${text}`), speakArabic: vi.fn(async () => undefined), stopSpeaking: vi.fn() }));
vi.mock("@/lib/audio/wav", () => ({ blobTo16KhzMonoWav: vi.fn(async () => new Blob(["RIFF"], { type: "audio/wav" })) }));

import { GuidedSoundWords, guidedBlocks } from "@/components/a1/guided/guided-sound-words";
import { GUIDED_TIMING, guidedReducer, initialGuidedState } from "@/components/a1/guided/guided-flow";
import { getA1Lesson } from "@/data/a1";
import { getLessonProgress } from "@/lib/progress";

const step2 = getA1Lesson("lesson-1")!.steps[1]!;
if (step2.kind !== "sound-words") throw new Error("step-2 must be sound-words");
const groups = step2.groups;
const KEY = "a1/lesson-1/step-2";
const ORDER = ["alif-fatha", "ab", "ana", "amir", "alif-kasra", "ibra", "isba", "ibriq", "alif-damma", "udhun", "umm", "usra"];

// One reused audio element; "ends" 20 ms after play.
const played: string[] = [];
class FakeAudio {
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  paused = true;
  src = "";
  play() {
    const src = this.src;
    if (!src.startsWith("data:")) played.push(src.replace("blob:", ""));
    this.paused = false;
    setTimeout(() => !this.paused && this.src === src && this.onended?.(), 20);
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
}

/** Mocked evaluation: answers from a list (true = passed, "error" = server error), then passed. */
let verdicts: Array<boolean | "error"> = [];
const fetchMock = vi.fn(async () => {
  const v = verdicts.shift() ?? true;
  if (v === "error") return { ok: false, status: 502, json: async () => ({ code: "service_unavailable" }) };
  return { ok: true, status: 200, json: async () => ({ passed: v, scores: { accuracy: v ? 90 : 40 }, feedback: { rule: v ? "excellent" : "x", message: "" }, conditionEvaluation: { azureAccuracy: v ? 90 : 40, iqraPhonemes: ["a"], matchedRule: v ? "excellent" : "x", message: "" } }) };
});

const step = () => screen.getByTestId("guided-step");
const at = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));
/** Runs time forward until the active block / stage matches. */
async function until(check: () => boolean, ms = 30_000) {
  for (let t = 0; t < ms && !check(); t += 50) await at(50);
  expect(check()).toBe(true);
}
const active = () => step().getAttribute("data-active");
const stage = () => step().getAttribute("data-stage");

async function startGuided() {
  render(<GuidedSoundWords groups={groups} progressKey={KEY} />);
  await at(0);
  fireEvent.click(screen.getByTestId("start-button"));
  await at(0);
}

beforeEach(() => {
  vi.useFakeTimers();
  Object.assign(mic, { script: [], records: 0, released: 0, aborted: 0, deny: false });
  played.length = 0;
  verdicts = [];
  fetchMock.mockClear();
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

describe("Schritt 2 guided mode", () => {
  it("runs the 12 blocks right to left, row by row, from the data", () => {
    expect(guidedBlocks(groups).map((b) => b.id)).toEqual(ORDER);
    expect(groups.flatMap((g) => [g.sound.glyph, ...g.words.map((w) => w.arabic)])).toEqual([
      "أَ", "أَب", "أَنَا", "أَمِير", "إِ", "إِبْرَة", "إِصْبَع", "إِبْرِيق", "أُ", "أُذُن", "أُمّ", "أُسْرَة",
    ]);
  });

  it("before the start only the first block is sharp; buttons are hidden", async () => {
    render(<GuidedSoundWords groups={groups} progressKey={KEY} />);
    await at(0);
    expect(screen.getByTestId("block-alif-fatha")).toHaveAttribute("data-state", "next");
    for (const id of ORDER.slice(1)) expect(screen.getByTestId(`block-${id}`)).toHaveAttribute("data-state", "waiting");
    expect(screen.getByTestId("block-ab").className).toContain("blur-[6px]");
    expect(screen.queryByText("Aufnehmen")).toBeNull();
    expect(screen.queryByText("Anhören")).toBeNull();
  });

  it("right: plays, listens, checks, tints the block green, saves it and moves on", async () => {
    await startGuided();
    expect(active()).toBe("alif-fatha");
    await until(() => stage() === "listen");
    expect(played).toEqual(["أَ"]);
    expect(screen.getByTestId("listening-sign")).toBeInTheDocument();
    expect(screen.getByTestId("guided-caption")).toHaveTextContent("Jetzt du!");
    await until(() => active() === "ab");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.body as FormData).get("target")).toBe("أَ");
    expect(screen.getByTestId("block-alif-fatha")).toHaveAttribute("data-state", "done");
    expect(screen.getByTestId("tint-alif-fatha").className).toContain("bg-success/10");
    expect(getLessonProgress(KEY).passed).toEqual(["alif-fatha"]);
  });

  it("wrong: \"Noch einmal\", the audio again, listening again", async () => {
    verdicts = [false, true];
    await startGuided();
    await until(() => fetchMock.mock.calls.length === 1);
    await until(() => stage() === "play");
    expect(screen.getByTestId("guided-caption")).toHaveTextContent("Noch einmal");
    await until(() => stage() === "listen");
    expect(played).toEqual(["أَ", "أَ"]);
    await until(() => active() === "ab");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("no speech within the time does not call the evaluation", async () => {
    mic.script = ["silence"];
    await startGuided();
    await until(() => mic.records === 2);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(active()).toBe("alif-fatha");
  });

  it("three failures (any mix) → amber, saved as 'needs practice', next block", async () => {
    mic.script = ["silence", "speech", "silence"];
    verdicts = [false];
    await startGuided();
    await until(() => active() === "ab");
    expect(screen.getByTestId("block-alif-fatha")).toHaveAttribute("data-state", "practice");
    expect(screen.getByTestId("tint-alif-fatha").className).toContain("bg-accent/10");
    expect(getLessonProgress(KEY).skipped).toEqual(["alif-fatha"]);
    expect(fetchMock).toHaveBeenCalledTimes(1); // the two silent attempts were not sent
  });

  it("extra round for the amber blocks, then the step ends and is marked completed", async () => {
    mic.script = ["silence", "silence", "silence"]; // block 1 fails in round 1
    await startGuided();
    await until(() => active() === "ab");
    await until(() => active() === "alif-fatha", 120_000); // round 2: only the amber block
    expect(step()).toHaveAttribute("data-stage", "focus");
    await until(() => stage() === "finished", 30_000);
    expect(screen.getByTestId("block-alif-fatha")).toHaveAttribute("data-state", "done");
    expect(getLessonProgress(KEY).completedAt).toBeTruthy();
    expect(getLessonProgress(KEY).passed).toHaveLength(12);
    expect(screen.getByTestId("guided-done")).toHaveTextContent("Geschafft");
    expect(mic.released).toBe(1); // microphone off at the end
  }, 30_000);

  it("the extra round ends anyway: a block that fails again stays amber", () => {
    let s = guidedReducer(initialGuidedState, { type: "start", order: ["x", "y"], marks: {} });
    for (let i = 0; i < GUIDED_TIMING.maxAttempts; i++) s = guidedReducer(s, { type: "heard", silence: true });
    s = guidedReducer(s, { type: "heard", silence: false });
    s = guidedReducer(s, { type: "verdict", verdict: "right" });
    s = guidedReducer(s, { type: "next" });
    expect([s.round, s.queue]).toEqual([2, ["x"]]);
    for (let i = 0; i < GUIDED_TIMING.maxAttempts; i++) s = guidedReducer(s, { type: "heard", silence: true });
    expect(s.stage).toBe("finished");
    expect(s.marks).toEqual({ x: "practice", y: "done" });
  });

  it("resumes at the first block that is not done", async () => {
    window.localStorage.setItem("alif:progress:v1", JSON.stringify({ [KEY]: { passed: ["alif-fatha", "ab", "ana"] } }));
    render(<GuidedSoundWords groups={groups} progressKey={KEY} />);
    await at(0);
    expect(screen.getByTestId("block-ana")).toHaveAttribute("data-state", "done");
    expect(screen.getByTestId("block-amir")).toHaveAttribute("data-state", "next");
    fireEvent.click(screen.getByTestId("start-button"));
    await at(0);
    expect(active()).toBe("amir");
    await until(() => stage() === "listen");
    expect(played).toEqual(["أَمِير"]);
  });

  it("microphone denied → today's page with buttons and a note", async () => {
    mic.deny = true;
    render(<GuidedSoundWords groups={groups} progressKey={KEY} />);
    await at(0);
    fireEvent.click(screen.getByTestId("start-button"));
    await at(0);
    expect(screen.getByTestId("guided-note")).toHaveTextContent("Das Mikrofon ist nicht verfügbar. Du kannst die Knöpfe benutzen.");
    expect(screen.getAllByText("Aufnehmen").length).toBe(12);
    expect(screen.queryByTestId("block-ab")).toBeNull();
  });

  it("two evaluation errors in a row → buttons, a note, and the progress is kept", async () => {
    verdicts = [true, "error", "error"];
    await startGuided();
    await until(() => active() === "ab");
    await until(() => screen.queryByTestId("guided-note") !== null);
    expect(screen.getByTestId("guided-note")).toHaveTextContent("Die Auswertung ist gerade nicht erreichbar.");
    expect(getLessonProgress(KEY).passed).toEqual(["alif-fatha"]);
    expect(mic.released).toBe(1);
  });

  it("background tab: stops listening; back: restarts the block from 'play'", async () => {
    await startGuided();
    await until(() => stage() === "listen");
    Object.defineProperty(document, "hidden", { value: true, configurable: true });
    act(() => void document.dispatchEvent(new Event("visibilitychange")));
    await at(0);
    expect(stage()).toBe("paused");
    expect(mic.aborted).toBe(1);
    Object.defineProperty(document, "hidden", { value: false, configurable: true });
    act(() => void document.dispatchEvent(new Event("visibilitychange")));
    await at(0);
    expect(stage()).toBe("play");
    await until(() => stage() === "listen");
    expect(played).toEqual(["أَ", "أَ"]);
  });

  it("leaving the page releases the microphone and stops recording", async () => {
    const view = await (async () => {
      const r = render(<GuidedSoundWords groups={groups} progressKey={KEY} />);
      await at(0);
      fireEvent.click(screen.getByTestId("start-button"));
      await at(0);
      return r;
    })();
    await until(() => stage() === "listen");
    view.unmount();
    expect(mic.released).toBe(1);
    expect(mic.aborted).toBe(1);
  });
});
