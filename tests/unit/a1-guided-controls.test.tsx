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
import { canSkip, guidedReducer, initialGuidedState, nextBlock, previousBlock, type GuidedState } from "@/components/a1/guided/guided-flow";
import { getA1Lesson } from "@/data/a1";
import { getLessonProgress } from "@/lib/progress";

const step2 = getA1Lesson("lesson-1", "alif")!.steps[0]!;
if (step2.kind !== "sound-words") throw new Error("step-1 must be sound-words");
const groups = step2.groups;
const KEY = "a1/lesson-1/alif/step-1";
const ORDER = ["alif-fatha", "ab", "ana", "amir", "alif-kasra", "ibra", "isba", "ibriq", "alif-damma", "udhun", "umm", "usra"];

// One reused audio element; "ends" 20 ms after play.
const played: string[] = [];
let audioStalls = false;
class FakeAudio {
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  paused = true;
  src = "";
  play() {
    const src = this.src;
    if (!src.startsWith("data:")) played.push(src.replace("blob:", ""));
    this.paused = false;
    if (audioStalls && !src.startsWith("data:")) return new Promise<void>(() => undefined); // neither starts nor fails
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
  audioStalls = false;
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


// A1 "Wörter": the child's own controls – skip after two wrong answers, previous word, start over.

const wrong = (s: GuidedState) => guidedReducer(guidedReducer(s, { type: "heard", silence: false }), { type: "verdict", verdict: "wrong" });
const right = (s: GuidedState) => guidedReducer(guidedReducer(guidedReducer(s, { type: "heard", silence: false }), { type: "verdict", verdict: "right" }), { type: "next" });
const started = () => guidedReducer(initialGuidedState, { type: "start", order: ["x", "y", "z"], marks: {} });

describe("guided flow – skip, previous, restart (reducer)", () => {
  it("skip is offered only from the second wrong answer; silence and service errors do not count", () => {
    let s = started();
    s = guidedReducer(s, { type: "heard", silence: true });
    s = guidedReducer(guidedReducer(s, { type: "heard", silence: false }), { type: "verdict", verdict: "error" });
    expect(s.failures).toBe(0);
    s = wrong(s);
    expect([s.failures, canSkip(s)]).toEqual([1, false]);
    expect(guidedReducer(s, { type: "skip" })).toBe(s); // ignored before the second failure
    s = wrong(s);
    expect([s.failures, canSkip(s), s.queue[0]]).toEqual([2, true, "x"]); // still on the word: the child may keep trying
    s = wrong(s);
    expect([s.failures, canSkip(s), s.queue[0]]).toEqual([3, true, "x"]);
  });

  it("skip: next word, marked 'needs practice' (never done), the counter starts again, not asked again in this run", () => {
    let s = wrong(wrong(started()));
    s = guidedReducer(s, { type: "skip" });
    expect([s.stage, s.queue, s.failures, s.attempts]).toEqual(["focus", ["y", "z"], 0, 0]);
    expect(s.marks).toEqual({ x: "practice" });
    s = right(right(s));
    expect(s.stage).toBe("finished");
  });

  it("skip keeps 'done' on a word that was passed before", () => {
    let s = right(started()); // x done, on y
    s = guidedReducer(s, { type: "previous" }); // back on x
    s = guidedReducer(wrong(wrong(s)), { type: "skip" });
    expect(s.marks).toEqual({ x: "done" });
    expect(s.queue[0]).toBe("y");
  });

  it("previous: none on the first word; otherwise the word before, then on as before; the counter starts again", () => {
    let s = started();
    expect(previousBlock(s)).toBeNull();
    expect(guidedReducer(s, { type: "previous" })).toBe(s);
    s = wrong(right(s)); // x done; one wrong answer on y
    expect([s.queue[0], s.failures, previousBlock(s)]).toEqual(["y", 1, "x"]);
    s = guidedReducer(s, { type: "previous" });
    expect([s.stage, s.queue, s.failures, s.retry]).toEqual(["focus", ["x", "y", "z"], 0, false]);
    s = right(s);
    expect([s.queue[0], s.failures]).toEqual(["y", 0]); // back on y with a fresh counter
  });

  it("forward: at any time to the word after; the word left is 'needs practice' unless done; none on the last word", () => {
    let s = wrong(started()); // one wrong answer on x
    expect(nextBlock(s)).toBe("y");
    s = guidedReducer(s, { type: "forward" });
    expect([s.stage, s.queue, s.failures, s.attempts, s.retry]).toEqual(["focus", ["y", "z"], 0, 0, false]);
    expect(s.marks).toEqual({ x: "practice" });
    s = guidedReducer(s, { type: "previous" }); // back on x, then right → on to y
    s = right(s);
    expect([s.marks, s.queue[0]]).toEqual([{ x: "done" }, "y"]);
    s = guidedReducer(s, { type: "previous" });
    s = guidedReducer(s, { type: "forward" }); // a passed word keeps "done"
    expect([s.marks, s.queue]).toEqual([{ x: "done" }, ["y", "z"]]);
    s = guidedReducer(s, { type: "forward" });
    expect([s.queue, nextBlock(s)]).toEqual([["z"], null]);
    expect(guidedReducer(s, { type: "forward" })).toBe(s); // ignored on the last word
  });

  it("restart: from the first word, no marks, no counters", () => {
    let s = wrong(wrong(right(right(started()))));
    s = guidedReducer(s, { type: "restart" });
    expect([s.stage, s.queue, s.marks, s.failures, s.round]).toEqual(["focus", ["x", "y", "z"], {}, 0, 1]);
  });
});

describe("guided mode – the controls on the page", () => {
  const skip = () => screen.queryByTestId("guided-skip");

  it("no controls before the start; afterwards Previous is disabled on the first word", async () => {
    render(<GuidedSoundWords groups={groups} progressKey={KEY} />);
    await at(0);
    expect(screen.queryByTestId("guided-controls")).toBeNull();
    fireEvent.click(screen.getByTestId("start-button"));
    await at(0);
    expect(screen.getByTestId("guided-previous")).toBeDisabled();
    expect(screen.getByTestId("guided-restart")).toBeEnabled();
  });

  it("fail once → no Skip; fail twice → Skip; skip → next word, saved as skipped, counter starts again", async () => {
    verdicts = [false, false, false];
    await startGuided();
    await until(() => fetchMock.mock.calls.length === 1 && stage() === "play");
    expect(skip()).toBeNull(); // one wrong answer
    await until(() => fetchMock.mock.calls.length === 2 && stage() === "play");
    expect(skip()).toBeInTheDocument(); // two wrong answers
    expect(active()).toBe("alif-fatha");
    fireEvent.click(skip()!);
    await at(0);
    expect(active()).toBe("ab");
    expect(skip()).toBeNull();
    expect(screen.getByTestId("block-alif-fatha")).toHaveAttribute("data-state", "practice");
    expect(getLessonProgress(KEY)).toMatchObject({ passed: [], skipped: ["alif-fatha"] });
    await until(() => fetchMock.mock.calls.length === 3 && stage() === "play");
    expect(skip()).toBeNull(); // the new word's first wrong answer
    expect(screen.getByTestId("guided-previous")).toBeEnabled();
  }, 30_000);

  it("Previous goes back one word and its counter starts again", async () => {
    verdicts = [true, false, false];
    await startGuided();
    await until(() => active() === "ab" && fetchMock.mock.calls.length === 3 && stage() === "play");
    expect(skip()).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("guided-previous"));
    await at(0);
    expect(active()).toBe("alif-fatha");
    expect(skip()).toBeNull();
    expect(screen.getByTestId("guided-previous")).toBeDisabled();
    await until(() => active() === "ab"); // passed again → on to where the child was
  }, 30_000);

  it("arrows on the active word: left → next word at once (saved as skipped), right → the word before", async () => {
    await startGuided();
    const arrows = () => screen.getByTestId("block-alif-fatha").querySelector("[data-testid=guided-arrows]");
    expect(arrows()).not.toBeNull();
    expect(screen.getByTestId("guided-arrow-previous")).toBeDisabled(); // first word
    expect(screen.getAllByTestId("guided-arrow-next")).toHaveLength(1); // only on the active word
    fireEvent.click(screen.getByTestId("guided-arrow-next"));
    await at(0);
    expect(active()).toBe("ab");
    expect(arrows()).toBeNull();
    expect(screen.getByTestId("block-ab").querySelector("[data-testid=guided-arrows]")).not.toBeNull();
    expect(getLessonProgress(KEY)).toMatchObject({ passed: [], skipped: ["alif-fatha"] });
    fireEvent.click(screen.getByTestId("guided-arrow-previous"));
    await at(0);
    expect(active()).toBe("alif-fatha");
  }, 30_000);

  it("the next arrow is disabled on the last word; no arrows while Start over asks", async () => {
    window.localStorage.setItem("alif:progress:v1", JSON.stringify({ [KEY]: { passed: ORDER.slice(0, 11) } }));
    await startGuided();
    expect(active()).toBe("usra");
    expect(screen.getByTestId("guided-arrow-next")).toBeDisabled();
    expect(screen.getByTestId("guided-arrow-previous")).toBeEnabled();
    fireEvent.click(screen.getByTestId("guided-restart"));
    await at(0);
    expect(screen.queryByTestId("guided-arrows")).toBeNull();
  }, 30_000);

  it("Start over asks first; Cancel continues; Yes → word 1, progress of this step deleted", async () => {
    window.localStorage.setItem("alif:progress:v1", JSON.stringify({ [KEY]: { passed: ["alif-fatha", "ab"], skipped: ["ana"] }, other: { passed: ["q"] } }));
    await startGuided();
    expect(active()).toBe("ana");
    fireEvent.click(screen.getByTestId("guided-restart"));
    await at(0);
    expect(screen.getByTestId("guided-restart-confirm")).toHaveTextContent("Von vorn anfangen?");
    expect(stage()).toBe("paused"); // nothing plays or listens meanwhile
    fireEvent.click(screen.getByTestId("guided-restart-cancel"));
    await at(0);
    expect(screen.queryByTestId("guided-restart-confirm")).toBeNull();
    expect([active(), stage()]).toEqual(["ana", "play"]);
    expect(getLessonProgress(KEY).passed).toEqual(["alif-fatha", "ab"]);

    fireEvent.click(screen.getByTestId("guided-restart"));
    await at(0);
    fireEvent.click(screen.getByTestId("guided-restart-yes"));
    await at(0);
    expect(active()).toBe("alif-fatha");
    expect(getLessonProgress(KEY)).toEqual({ passed: [] });
    expect(getLessonProgress("other").passed).toEqual(["q"]); // other exercises untouched
    for (const id of ORDER) expect(screen.getByTestId(`block-${id}`)).not.toHaveAttribute("data-state", "done");
    await until(() => active() === "ab");
    expect(getLessonProgress(KEY).passed).toEqual(["alif-fatha"]); // saved again after the reset
  }, 30_000);

  it("Start over after the end opens the microphone again and starts at word 1", async () => {
    window.localStorage.setItem("alif:progress:v1", JSON.stringify({ [KEY]: { passed: ORDER.slice(0, 11) } }));
    await startGuided();
    await until(() => stage() === "finished");
    expect(mic.released).toBe(1);
    fireEvent.click(screen.getByTestId("guided-restart"));
    await at(0);
    fireEvent.click(screen.getByTestId("guided-restart-yes"));
    await at(0);
    expect(active()).toBe("alif-fatha");
    expect(getLessonProgress(KEY).completedAt).toBeUndefined();
    await until(() => stage() === "listen");
    expect(mic.records).toBeGreaterThan(1);
  }, 30_000);
});
