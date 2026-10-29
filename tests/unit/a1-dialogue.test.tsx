import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// A1 · Lektion 1 · "صَبَاحُ الْخَيْر": the two textbook conversations (Ahmad / Ali,
// Nabila / Fatima), each: Anhören → Nachsprechen → Rollenspiel – and the same for
// the two evening conversations of Lektion 2 · "مَسَاءُ الْخَيْر" (Adnan / Khalid,
// Nazik / Dina).
// MOCKED here: microphone (speech / silence per attempt), /api/tts (speechUrl:
// records text and voice) and the answer of /api/pronunciation (passed / not
// passed / server error). Real: the app's client evaluation code (WAV →
// /api/pronunciation → toStudentFeedback), the flow and the UI.

const mic = vi.hoisted(() => ({ script: [] as Array<"speech" | "silence">, records: 0, released: 0, deny: false }));
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
            resolve(null);
          });
        }),
      release: () => (mic.released += 1),
    };
  }),
}));
const tts = vi.hoisted(() => ({ speechUrl: vi.fn(async (text: string, voice?: string) => `blob:${voice ?? "default"}|${text}`) }));
vi.mock("@/lib/tts/player", () => ({ speechUrl: tts.speechUrl, localSpeechUrl: (text: string) => tts.speechUrl(text), speakArabic: vi.fn(async () => undefined), speakLocal: vi.fn(async () => undefined), stopSpeaking: vi.fn() }));
vi.mock("@/lib/audio/wav", () => ({ blobTo16KhzMonoWav: vi.fn(async () => new Blob(["RIFF"], { type: "audio/wav" })) }));

import { DialogueListen } from "@/components/a1/dialogue/dialogue-listen";
import { DialogueSpeaking } from "@/components/a1/dialogue/dialogue-speaking";
import { getA1Lesson } from "@/data/a1";
import { menDialogue, womenDialogue } from "@/data/a1/sabah-al-khayr";
import { majidFatimaDialogue } from "@/data/a1/tahiyya";
import { adnanKhalidDialogue, nazikDinaDialogue } from "@/data/a1/lesson-2/masa-al-khayr";
import { manAntaA, manAntaB, suziDialogue, wajdiDialogue } from "@/data/a1/unit-2/conversations";
import type { Dialogue } from "@/data/types";
import { getLessonProgress, moveSabahAlKhayrProgress } from "@/lib/progress";
import { CONDITION_RULES } from "@/lib/pronunciation/rules";
import { GERMAN_CUES } from "@/lib/pronunciation/cues";
import { isAllowedTarget, isAllowedTtsText } from "@/lib/pronunciation/targets";

const KEY = "a1/lesson-1/sabah-al-khayr/step-x";
const SUPER = `default|${GERMAN_CUES.super}`;
const voiceOf = (d: Dialogue, speaker: string) => d.speakers.find((s) => s.id === speaker)!.voice;
/** "voice|text" of a line, as the fake audio element records it. */
const said = (d: Dialogue, i: number) => `${voiceOf(d, d.lines[i]!.speaker)}|${d.lines[i]!.arabic}`;

/** What the ONE audio element played: "voice|text". Each clip "ends" after 20 ms. */
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

/** Evaluation answers in order (true = passed, false = not passed, "error" = 502), then passed. */
let verdicts: Array<boolean | "error"> = [];
const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => {
  const v = verdicts.shift() ?? true;
  if (v === "error") return { ok: false, status: 502, json: async () => ({ code: "service_unavailable" }) };
  return {
    ok: true,
    status: 200,
    json: async () => ({ passed: v, scores: { accuracy: v ? 92 : 45 }, feedback: { rule: v ? "excellent" : "said_wrong_sound", message: "" }, conditionEvaluation: { azureAccuracy: v ? 92 : 45, iqraPhonemes: ["S", "a"], matchedRule: v ? "excellent" : "said_wrong_sound", message: "" } }),
  };
});
const targets = () => fetchMock.mock.calls.map(([, init]) => (init!.body as FormData).get("target"));

const at = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));
async function until(check: () => boolean, ms = 60_000) {
  for (let t = 0; t < ms && !check(); t += 25) await at(25);
  expect(check()).toBe(true);
}

beforeEach(() => {
  vi.useFakeTimers();
  Object.assign(mic, { script: [], records: 0, released: 0, deny: false });
  played.length = 0;
  verdicts = [];
  fetchMock.mockClear();
  tts.speechUrl.mockClear();
  tts.speechUrl.mockImplementation(async (text: string, voice?: string) => `blob:${voice ?? "default"}|${text}`);
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

describe("the two textbook conversations", () => {
  it("men: Ahmad and Ali, all seven lines in order – greeting, how are you, the names", () => {
    expect(menDialogue.speakers.map((s) => [s.id, s.name, s.voice])).toEqual([
      ["ahmad", "Ahmad", "male-1"],
      ["ali", "Ali", "male-2"],
    ]);
    expect(menDialogue.lines.map((l) => [l.speaker, l.arabic, l.german])).toEqual([
      ["ahmad", "صَبَاحُ الْخَيْرِ.", "Guten Morgen!"],
      ["ali", "صَبَاحُ النُّورِ.", "Guten Morgen!"],
      ["ahmad", "كَيْفَ حَالُكَ؟", "Wie geht es dir?"],
      ["ali", "بِخَيْرٍ، الْحَمْدُ لِلَّهِ.", "Gut, Gott sei Dank."],
      ["ahmad", "مَا اسْمُكَ؟", "Wie heißt du?"],
      ["ali", "أَنَا عَلِيٌّ، وَأَنْتَ؟", "Ich heiße Ali. Und du?"],
      ["ahmad", "وَأَنَا أَحْمَدُ.", "Und ich heiße Ahmad."],
    ]);
  });

  it("women: Nabila and Fatima, all seven lines in order, with the feminine forms", () => {
    expect(womenDialogue.speakers.map((s) => [s.id, s.name, s.voice])).toEqual([
      ["nabila", "Nabila", "female-1"],
      ["fatima", "Fatima", "female-2"],
    ]);
    expect(womenDialogue.lines.map((l) => [l.speaker, l.arabic, l.german])).toEqual([
      ["nabila", "صَبَاحُ الْخَيْرِ.", "Guten Morgen!"],
      ["fatima", "صَبَاحُ النُّورِ.", "Guten Morgen!"],
      ["nabila", "كَيْفَ حَالُكِ؟", "Wie geht es dir?"],
      ["fatima", "بِخَيْرٍ، الْحَمْدُ لِلَّهِ.", "Gut, Gott sei Dank."],
      ["nabila", "مَا اسْمُكِ؟", "Wie heißt du?"],
      ["fatima", "أَنَا فَاطِمَةُ، وَأَنْتِ؟", "Ich heiße Fatima. Und du?"],
      ["nabila", "وَأَنَا نَبِيلَةُ.", "Und ich heiße Nabila."],
    ]);
  });

  it("masculine حَالُكَ اسْمُكَ أَنْتَ vs feminine حَالُكِ اسْمُكِ أَنْتِ – in the text, the transliteration and the model audio", () => {
    const pairs: Array<[number, string, string, string, string]> = [
      [2, "حَالُكَ", "حَالُكِ", "ḥāluka", "ḥāluki"],
      [4, "اسْمُكَ", "اسْمُكِ", "Ma-smuka", "Ma-smuki"],
      [5, "وَأَنْتَ", "وَأَنْتِ", "wa-anta", "wa-anti"],
    ];
    for (const [i, masc, fem, mT, fT] of pairs) {
      const m = menDialogue.lines[i]!;
      const w = womenDialogue.lines[i]!;
      expect(m.arabic).toContain(masc);
      expect(m.arabic).not.toContain(fem);
      expect(w.arabic).toContain(fem);
      expect(w.arabic).not.toContain(masc);
      expect(m.transliteration).toContain(mT);
      expect(w.transliteration).toContain(fT);
      expect(m.exercise.modelText).toBe(m.arabic); // the model audio speaks -ka / -ki
      expect(w.exercise.modelText).toBe(w.arabic);
      expect(m.exercise.id).not.toBe(w.exercise.id);
    }
    // No men's phrase in the women's dialogue.
    for (const w of womenDialogue.lines) expect(w.arabic).not.toMatch(/حَالُكَ|اسْمُكَ|أَنْتَ|عَلِيٌّ|أَحْمَدُ/);
  });

  it.each([
    ["men", menDialogue],
    ["women", womenDialogue],
    ["evening men", adnanKhalidDialogue],
    ["evening women", nazikDinaDialogue],
  ])("%s: every line – Arabic with vowel signs, Latin transliteration, German; a rule, allowed target and TTS text", (_, d) => {
    expect(d.lines).toHaveLength(7);
    expect(d.lines.map((l) => l.speaker)).toEqual([0, 1, 0, 1, 0, 1, 0].map((k) => d.speakers[k]!.id)); // turns alternate
    for (const line of d.lines) {
      expect(line.arabic, line.id).toMatch(/[ً-ْ]/);
      expect(line.transliteration, line.id).toMatch(/^[\p{Script=Latin}\s,.?'ʾʿ-]+$/u);
      expect(`${line.german} ${line.literal ?? ""}`, line.id).not.toMatch(/\b(good|morning|how|are|you|thanks|god|name|and)\b/i); // German, not English
      expect(line.exercise.target, line.id).toBe(line.arabic.replace(/[ً-ْٰ]/g, "").replace(/[.،؟?,]/g, "").trim());
      expect(CONDITION_RULES[line.exercise.target]?.excellent, line.exercise.target).toBeDefined();
      expect(isAllowedTarget(line.exercise.target), line.exercise.target).toBe(true);
      expect(isAllowedTtsText(line.exercise.modelText), line.exercise.modelText).toBe(true);
    }
  });

  it("the entry: both conversations (listen, repeat, role-play each), then the letters", () => {
    const steps = getA1Lesson("lesson-1", "sabah-al-khayr")!.steps;
    expect(steps.map((s) => [s.slug, s.kind, s.kind === "dialogue" ? `${s.mode}:${s.dialogue.id}` : null])).toEqual([
      ["step-1", "dialogue", "listen:ahmad-ali"],
      ["step-2", "dialogue", "repeat:ahmad-ali"],
      ["step-3", "dialogue", "roleplay:ahmad-ali"],
      ["step-4", "dialogue", "listen:nabila-fatima"],
      ["step-5", "dialogue", "repeat:nabila-fatima"],
      ["step-6", "dialogue", "roleplay:nabila-fatima"],
      ["step-7", "gaps", null],
    ]);
  });
});

describe.each([
  ["men", menDialogue],
  ["women", womenDialogue],
  ["evening men", adnanKhalidDialogue],
  ["evening women", nazikDinaDialogue],
])("Anhören – %s", (_, d) => {
  it("every line is shown; the whole dialogue plays in order, each speaker in their own voice; then the question", async () => {
    render(<DialogueListen dialogue={d} progressKey={KEY} />);
    await at(0);
    expect(screen.getByTestId("dialogue-intro")).toHaveTextContent(d.intro);
    for (const line of d.lines) {
      expect(screen.getByTestId(`line-arabic-${line.id}`)).toHaveTextContent(line.arabic);
      expect(screen.getByTestId(`line-translit-${line.id}`)).toHaveTextContent(line.transliteration);
      expect(screen.getByTestId(`line-german-${line.id}`)).toHaveTextContent(line.german);
      expect(screen.getByTestId(`speaker-name-${line.id}`)).toHaveTextContent(d.speakers.find((s) => s.id === line.speaker)!.name);
    }
    fireEvent.click(screen.getByTestId("dialogue-play-all"));
    await until(() => played.length === 7 && screen.getByTestId("dialogue-listen").dataset.status === "idle");
    expect(played).toEqual(d.lines.map((_l, i) => said(d, i)));
    expect(screen.getByTestId("dialogue-question")).toHaveTextContent(d.question!.prompt);
    fireEvent.click(screen.getByTestId("answer-1"));
    expect(getLessonProgress(KEY).completedAt).toBeUndefined();
    fireEvent.click(screen.getByTestId(`answer-${d.question!.answer}`));
    expect(getLessonProgress(KEY).completedAt).toBeTruthy();
  });
});

describe("Anhören – controls", () => {
  it("one line on its own; pause and continue; Nochmal from the start", async () => {
    const d = menDialogue;
    render(<DialogueListen dialogue={d} progressKey={KEY} />);
    await at(0);
    fireEvent.click(screen.getByTestId(`play-line-${d.lines[5]!.id}`));
    await until(() => screen.getByTestId("dialogue-listen").dataset.status === "idle" && played.length === 1);
    expect(played).toEqual([said(d, 5)]);

    played.length = 0;
    fireEvent.click(screen.getByTestId("dialogue-play-all"));
    await until(() => played.length === 2);
    fireEvent.click(screen.getByTestId("dialogue-pause"));
    await at(500);
    expect(screen.getByTestId("dialogue-listen")).toHaveAttribute("data-status", "paused");
    expect(played).toHaveLength(2);
    fireEvent.click(screen.getByTestId("dialogue-resume"));
    await until(() => screen.getByTestId("dialogue-listen").dataset.status === "idle");
    expect(played).toEqual([said(d, 0), said(d, 1), said(d, 1), said(d, 2), said(d, 3), said(d, 4), said(d, 5), said(d, 6)]);

    played.length = 0;
    fireEvent.click(screen.getByTestId("dialogue-replay"));
    await until(() => screen.getByTestId("dialogue-listen").dataset.status === "idle" && played.length === 7);
    expect(played[0]).toBe(said(d, 0));
  });

  it("translation and transliteration can be hidden and shown", async () => {
    render(<DialogueListen dialogue={womenDialogue} progressKey={KEY} />);
    const id = womenDialogue.lines[2]!.id;
    fireEvent.click(screen.getByTestId("toggle-german"));
    fireEvent.click(screen.getByTestId("toggle-translit"));
    expect(screen.queryByTestId(`line-german-${id}`)).toBeNull();
    expect(screen.queryByTestId(`line-translit-${id}`)).toBeNull();
    expect(screen.getByTestId(`line-arabic-${id}`)).toHaveTextContent("كَيْفَ حَالُكِ؟");
    fireEvent.click(screen.getByTestId("toggle-german"));
    expect(screen.getByTestId(`line-german-${id}`)).toHaveTextContent("Wie geht es dir?");
  });

  it("when /api/tts cannot be reached, the dialogue still runs and says so", async () => {
    tts.speechUrl.mockImplementation(async () => {
      throw new Error("down");
    });
    render(<DialogueListen dialogue={menDialogue} progressKey={KEY} />);
    await at(0);
    fireEvent.click(screen.getByTestId("dialogue-play-all"));
    await until(() => screen.queryByTestId("dialogue-question") !== null, 120_000);
    expect(screen.getByTestId("dialogue-note")).toHaveTextContent("Der Ton konnte gerade nicht geladen werden.");
  });
});

const speaking = () => screen.getByTestId("dialogue-speaking");
const active = () => speaking().dataset.active;
const stage = () => speaking().dataset.stage;

async function startRepeat(d: Dialogue) {
  render(<DialogueSpeaking dialogue={d} mode="repeat" progressKey={KEY} />);
  await at(0);
  fireEvent.click(screen.getByTestId("start-button"));
  await at(0);
}

describe.each([
  ["men", menDialogue],
  ["women", womenDialogue],
  ["evening men", adnanKhalidDialogue],
  ["evening women", nazikDinaDialogue],
])("Nachsprechen – %s", (_, d) => {
  it("ALL seven lines, one at a time: model (speaker's voice) → listen → evaluation → \"Super!\" → next; then done", async () => {
    await startRepeat(d);
    expect(active()).toBe(d.lines[0]!.id);
    await until(() => screen.queryByTestId("dialogue-done") !== null);
    expect(targets()).toEqual(d.lines.map((l) => l.exercise.target));
    expect(played).toEqual(d.lines.flatMap((_l, i) => [said(d, i), SUPER]));
    expect(getLessonProgress(KEY).passed).toEqual(d.lines.map((l) => l.id));
    expect(getLessonProgress(KEY).completedAt).toBeTruthy();
    expect(mic.released).toBe(1);
  });
});

describe("Nachsprechen – retries and errors", () => {
  it("wrong: stays on the line with the hint, plays it again – unlimited, never skipped (5 failures and silence)", async () => {
    const d = womenDialogue;
    // Lines 1 and 2 right; line 3 (كَيْفَ حَالُكِ؟) fails five times, with silence in between.
    verdicts = [true, true, false, false, false, false, false];
    mic.script = ["speech", "speech", "speech", "silence", "speech", "speech", "silence", "speech", "speech"];
    await startRepeat(d);
    await until(() => active() === d.lines[2]!.id);
    await until(() => fetchMock.mock.calls.length === 3);
    await until(() => screen.queryByTestId("dialogue-feedback") !== null);
    expect(screen.getByTestId("dialogue-feedback")).toHaveTextContent("Fast geschafft");
    await until(() => fetchMock.mock.calls.length === 7);
    expect(active()).toBe(d.lines[2]!.id);
    expect(played.filter((p) => p === said(d, 2)).length).toBeGreaterThanOrEqual(7); // the model again before every attempt
    expect(played.filter((p) => p === said(d, 3))).toEqual([]); // the next line has not started
    expect(getLessonProgress(KEY).passed).toEqual([d.lines[0]!.id, d.lines[1]!.id]);
    await until(() => active() === d.lines[3]!.id); // the eighth evaluation passes
    expect(screen.queryByTestId("dialogue-feedback")).toBeNull();
  });

  it("Nochmal anhören while listening: the model plays again, no attempt is counted", async () => {
    await startRepeat(menDialogue);
    await until(() => stage() === "listen");
    fireEvent.click(screen.getByTestId("replay-line"));
    await until(() => stage() === "listen" && played.length === 2);
    expect(played).toEqual([said(menDialogue, 0), said(menDialogue, 0)]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("microphone denied → every line with listen and record buttons (same evaluation) and a note", async () => {
    mic.deny = true;
    await startRepeat(womenDialogue);
    expect(screen.getByTestId("dialogue-note")).toHaveTextContent("Das Mikrofon ist nicht verfügbar.");
    for (const line of womenDialogue.lines) expect(within(screen.getByTestId(`fallback-line-${line.id}`)).getByTestId(`exercise-${line.id}-record`)).toBeInTheDocument();
    expect(getLessonProgress(KEY).completedAt).toBeUndefined();
  });

  it("two evaluation errors in a row → buttons and a note; progress kept; a service error is not a 'wrong' answer", async () => {
    verdicts = [true, "error", "error"];
    await startRepeat(menDialogue);
    await until(() => screen.queryByTestId("dialogue-fallback") !== null);
    expect(screen.getByTestId("dialogue-note")).toHaveTextContent("Die Auswertung ist gerade nicht erreichbar.");
    expect(getLessonProgress(KEY).passed).toEqual([menDialogue.lines[0]!.id]);
    expect(mic.released).toBe(1);
  });

  it("leaving the page stops the microphone", async () => {
    await startRepeat(menDialogue);
    await until(() => stage() === "listen");
    cleanup();
    expect(mic.released).toBe(1);
  });
});

/** After one role: not done yet – the other role is next. */
function expectOneRoleLeft(next: string) {
  expect(getLessonProgress(KEY).completedAt).toBeUndefined();
  expect(screen.queryByTestId("step-completed")).toBeNull();
  expect(screen.getByTestId("dialogue-next-role")).toHaveTextContent(`Weiter als ${next}`);
}

async function startRoleplay(d: Dialogue, role: string) {
  render(<DialogueSpeaking dialogue={d} mode="roleplay" progressKey={KEY} />);
  await at(0);
  // The first role is chosen already (first this one, then the other).
  const firstRole = (d.roles ?? d.speakers)[0]!.id;
  expect(screen.getByTestId(`role-${firstRole}`)).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByTestId("start-button")).toBeEnabled();
  fireEvent.click(screen.getByTestId(`role-${role}`));
  fireEvent.click(screen.getByTestId("start-button"));
  await at(0);
}

describe.each([
  ["men", menDialogue],
  ["women", womenDialogue],
  ["evening men", adnanKhalidDialogue],
  ["evening women", nazikDinaDialogue],
])("Rollenspiel – %s", (_, d) => {
  const [first, second] = d.speakers;
  const linesOf = (id: string) => d.lines.map((l, i) => [l, i] as const).filter(([l]) => l.speaker === id);

  it(`as the second speaker: the app speaks the first speaker's lines (incl. the last line); the learner says lines 2, 4, 6`, async () => {
    await startRoleplay(d, second.id);
    await until(() => screen.queryByTestId("dialogue-done") !== null);
    expect(targets()).toEqual(linesOf(second.id).map(([l]) => l.exercise.target));
    // Strict turn order: app line, (learner, "Super!"), app line, …, and the app closes with line 7.
    expect(played.filter((p) => p !== SUPER)).toEqual(linesOf(first.id).map(([, i]) => said(d, i)));
    expect(played).toEqual([said(d, 0), SUPER, said(d, 2), SUPER, said(d, 4), SUPER, said(d, 6)]);
    expectOneRoleLeft(first.name);
  });

  it(`as the first speaker: the learner starts and ends; the app answers with lines 2, 4, 6`, async () => {
    await startRoleplay(d, first.id);
    await until(() => screen.queryByTestId("dialogue-done") !== null);
    expect(targets()).toEqual(linesOf(first.id).map(([l]) => l.exercise.target));
    expect(played).toEqual([SUPER, said(d, 1), SUPER, said(d, 3), SUPER, said(d, 5), SUPER]);
    expectOneRoleLeft(second.name);
  });

  it("first one role, then (marked green) the other – only both make the step done", async () => {
    await startRoleplay(d, first.id);
    await until(() => screen.queryByTestId("dialogue-done") !== null);
    expect(getLessonProgress(KEY).completedAt).toBeUndefined();
    fireEvent.click(screen.getByTestId("dialogue-next-role"));
    await at(0);
    expect(screen.getByTestId(`role-${first.id}`)).toHaveAttribute("data-done", "true");
    expect(screen.getByTestId(`role-done-${first.id}`)).toHaveTextContent("Geschafft");
    expect(screen.getByTestId(`role-${second.id}`)).toHaveAttribute("aria-pressed", "true"); // the other role is next
    expect(screen.getByTestId("start-overlay")).toHaveTextContent(`Jetzt sprichst du die andere Rolle: ${second.name}`);
    fireEvent.click(screen.getByTestId("start-button"));
    await until(() => screen.queryByTestId("dialogue-done") !== null);
    expect(getLessonProgress(KEY).completedAt).toBeTruthy();
    expect(screen.queryByTestId("dialogue-next-role")).toBeNull();
    expect(screen.getByTestId("step-completed")).toBeInTheDocument();
  });
});

// The next textbook page, Übung 1: Majid and Fatima (a man and a woman). One
// speaker may have two lines in a row (Fatima answers and asks back).
describe("Rollenspiel – Majid und Fatima (Übung 1: nach dem Namen fragen)", () => {
  const d = majidFatimaDialogue;
  it("as Majid: the learner asks a woman (حَالُكِ، وَأَنْتِ؟); the app speaks Fatima, two lines in a row where she has them", async () => {
    await startRoleplay(d, "majid");
    await until(() => screen.queryByTestId("dialogue-done") !== null);
    expect(targets()).toEqual(["صباح الخير", "كيف حالك", "بخير الحمد لله", "أنا ماجد وأنت"]);
    expect(played).toEqual([SUPER, said(d, 1), SUPER, said(d, 3), said(d, 4), SUPER, said(d, 6), SUPER, said(d, 8)]);
    expect(played.filter((p) => p.startsWith("male-1|"))).toEqual([]); // never the learner's voice
    expectOneRoleLeft("Fatima");
  });

  it("as Fatima: the learner asks a man (حَالُكَ، مَا اسْمُكَ؟) and ends with وَأَنَا فَاطِمَةُ", async () => {
    await startRoleplay(d, "fatima");
    await until(() => screen.queryByTestId("dialogue-done") !== null);
    expect(targets()).toEqual(["صباح النور", "بخير الحمد لله", "كيف حالك", "ما اسمك", "وأنا فاطمة"]);
    expect(played).toEqual([said(d, 0), SUPER, said(d, 2), SUPER, SUPER, said(d, 5), SUPER, said(d, 7), SUPER]);
    expectOneRoleLeft("Majid");
  });
});

describe("Rollenspiel – the app waits for an accepted answer", () => {
  it("a wrong answer: the partner's line again, and nothing of the next turn until the answer is right", async () => {
    const d = womenDialogue; // learner = Fatima
    verdicts = [false, false, true];
    await startRoleplay(d, "fatima");
    await until(() => fetchMock.mock.calls.length === 2);
    await until(() => stage() === "listen");
    expect(active()).toBe(d.lines[1]!.id);
    expect(played).toEqual([said(d, 0), said(d, 0), said(d, 0)]);
    expect(screen.queryByTestId(`dialogue-line-${d.lines[2]!.id}`)).toBeNull(); // not shown yet
    await until(() => active() === d.lines[3]!.id);
    await until(() => stage() === "listen");
    expect(played.slice(-2)).toEqual([SUPER, said(d, 2)]);
  });

  it("\"Satz vorsprechen\": the learner's own line once, in their character's voice", async () => {
    await startRoleplay(menDialogue, "ali");
    await until(() => stage() === "listen");
    fireEvent.click(screen.getByTestId("hint-line"));
    await until(() => stage() === "listen" && played.length === 2);
    expect(played).toEqual([said(menDialogue, 0), said(menDialogue, 1)]);
  });
});

describe("progress of the entry", () => {
  it("the published letters step (step-2) moves to step-7; the old step-1 / step-2 are not shown as done", () => {
    const base = "a1/lesson-1/sabah-al-khayr";
    const old = { [`${base}/step-1`]: { passed: ["sabah-al-khayr"], completedAt: "a" }, [`${base}/step-2`]: { passed: [], completedAt: "b" }, other: { passed: [] } };
    expect(moveSabahAlKhayrProgress(old)).toEqual({ [`${base}/step-7`]: old[`${base}/step-2`], other: { passed: [] } });
    expect(moveSabahAlKhayrProgress({ other: { passed: [] } })).toEqual({ other: { passed: [] } });
  });
});

// Unit 2 of the book: conversations with three or more speakers, and role groups
// (the learner speaks "Der Fragende" or "Die Antwortenden"; the app speaks the rest).
describe.each([
  ["Wagdi (3 speakers)", wajdiDialogue],
  ["Susi (3 speakers)", suziDialogue],
  ["Wer bist du? (أ)", manAntaA],
  ["Wer bist du? (ب)", manAntaB],
])("Unit 2 – %s", (_, d) => {
  it("Anhören: every line in order, each speaker in their own voice", async () => {
    render(<DialogueListen dialogue={d} progressKey={KEY} />);
    await at(0);
    fireEvent.click(screen.getByTestId("dialogue-play-all"));
    await until(() => played.length === d.lines.length && screen.getByTestId("dialogue-listen").dataset.status === "idle", 120_000);
    expect(played).toEqual(d.lines.map((_l, i) => said(d, i)));
  });

  it("Nachsprechen: all lines, \"Super!\" after each, nothing skipped", async () => {
    await startRepeat(d);
    await until(() => screen.queryByTestId("dialogue-done") !== null, 120_000);
    expect(targets()).toEqual(d.lines.map((l) => l.exercise.target));
    expect(played).toEqual(d.lines.flatMap((_l, i) => [said(d, i), SUPER]));
    expect(getLessonProgress(KEY).completedAt).toBeTruthy();
  });

  it("every line has an allowed target with a rule, and its model text may be spoken", () => {
    for (const line of d.lines) {
      expect(CONDITION_RULES[line.exercise.target]?.excellent, line.exercise.target).toBeDefined();
      expect(isAllowedTarget(line.exercise.target)).toBe(true);
      expect(isAllowedTtsText(line.exercise.modelText)).toBe(true);
    }
  });
});

describe("Rollenspiel – role groups (Unit 2 · مَنْ أَنْتَ؟)", () => {
  const d = manAntaA;
  const asks = d.lines.filter((l) => l.speaker === "asker");
  const answers = d.lines.filter((l) => l.speaker !== "asker");
  it("the roles are \"Der Fragende\" and \"Die Antwortenden\"", async () => {
    render(<DialogueSpeaking dialogue={d} mode="roleplay" progressKey={KEY} />);
    await at(0);
    expect(screen.getByTestId("role-asker")).toHaveTextContent("Der Fragende");
    expect(screen.getByTestId("role-answers")).toHaveTextContent("Die Antwortenden");
    expect(screen.queryByTestId("role-naji")).toBeNull();
  });

  it("as the answering people: the app asks all six questions, the learner gives all six answers – a wrong answer stays", async () => {
    verdicts = [true, false, true];
    await startRoleplay(d, "answers");
    await until(() => screen.queryByTestId("dialogue-done") !== null, 120_000);
    const t = targets();
    expect(t.filter((x, i) => t.indexOf(x) === i || x !== t[i - 1])).toEqual(answers.map((l) => l.exercise.target));
    expect(t).toHaveLength(answers.length + 1); // the wrong one was asked again
    // The app's lines: every question in order (the one before the wrong answer twice), never an answer.
    const appLines = played.filter((p) => p !== SUPER);
    expect(appLines).toHaveLength(asks.length + 1);
    let at = 0;
    for (const p of appLines) if (p === said(d, d.lines.indexOf(asks[at]!))) at++;
    expect(at).toBe(asks.length);
  });

  it("as the one who asks: the learner asks, the app answers with every group's own voice", async () => {
    await startRoleplay(d, "asker");
    await until(() => screen.queryByTestId("dialogue-done") !== null, 120_000);
    expect(targets()).toEqual(asks.map((l) => l.exercise.target));
    expect(played.filter((p) => p !== SUPER)).toEqual(answers.map((l) => said(d, d.lines.indexOf(l))));
  });
});
