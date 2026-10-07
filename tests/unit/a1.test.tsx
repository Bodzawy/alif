import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { existsSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/audio/wav", () => ({
  blobTo16KhzMonoWav: vi.fn(async () => new Blob(["RIFFtest"], { type: "audio/wav" })),
}));
const tts = vi.hoisted(() => ({ speak: vi.fn(async (_text: string) => undefined), stop: vi.fn() }));
vi.mock("@/lib/tts/player", () => ({ speakArabic: tts.speak, stopSpeaking: tts.stop }));

import { SoundWordsStep } from "@/components/a1/sound-words-step";
import { SoundsStep } from "@/components/a1/sounds-step";
import { A1_LEVEL, a1Exercises, a1StepHref, getA1Lesson } from "@/data/a1";
import { arabicLessonLabel } from "@/data/a1/ordinals";
import { buildAssessment } from "@/lib/pronunciation/assessment";
import { CONDITION_RULES, SOUND_RULES } from "@/lib/pronunciation/rules";
import { isAllowedTarget, isAllowedTtsText } from "@/lib/pronunciation/targets";

import { a1Words } from "../support/a1-words";

const lesson = getA1Lesson("lesson-1")!;
const [soundsStep, wordsStep] = lesson.steps;

describe("A1 · Lesson 1 content", () => {
  it("is الدرس الأول – صباح الخير with six steps: vowels, words, forms of أ, writing, filling gaps, listening", () => {
    expect(A1_LEVEL.lessons.map((l) => l.slug)).toEqual(["lesson-1"]);
    expect(arabicLessonLabel(lesson.number)).toBe("الدرس الأول");
    expect(lesson.title).toBe("صَبَاحُ الْخَيْر");
    expect(lesson.steps.map((s) => [s.slug, s.kind])).toEqual([["step-1", "sounds"], ["step-2", "sound-words"], ["step-3", "forms"], ["step-4", "writing"], ["step-5", "gaps"], ["step-6", "gaps"]]);
    expect(soundsStep!.kind === "sounds" && soundsStep!.sounds.map((s) => s.glyph)).toEqual(["أَ", "إِ", "أُ"]);
    expect(a1StepHref(lesson, "step-2")).toBe("/a1/lesson-1/step-2");
  });

  it("has exactly the words of the lesson sheet, in its order, grouped by vowel", () => {
    if (wordsStep!.kind !== "sound-words") throw new Error("step 2 must show sounds with words");
    expect(wordsStep!.groups.map((g) => [g.sound.glyph, g.words.map((w) => w.exercise.target)])).toEqual([
      ["أَ", ["أب", "أنا", "أمير"]],
      ["إِ", ["إبرة", "إصبع", "إبريق"]],
      ["أُ", ["أذن", "أم", "أسرة"]],
    ]);
    for (const group of wordsStep!.groups) {
      for (const word of group.words) {
        // The word begins with the group's vowel (hamza + vowel sign).
        expect(word.arabic.slice(0, 2), word.id).toBe(group.sound.glyph);
        expect(word.german && word.transliteration, word.id).toBeTruthy();
        expect(word.exercise.modelText).toBe(word.arabic);
      }
    }
  });

  it("each word is gated on the initial vowel of its group (أَ → a, إِ → i, أُ → u)", () => {
    if (wordsStep!.kind !== "sound-words") throw new Error();
    const expected = { "أَ": "a", "إِ": "i", "أُ": "u" } as const;
    for (const group of wordsStep!.groups) {
      const vowel = expected[group.sound.glyph as keyof typeof expected];
      expect(group.sound.transliteration).toBe(vowel);
      for (const word of group.words) {
        const rules = CONDITION_RULES[word.exercise.target]!;
        expect(rules.excellent!.conditions, word.id).toContain(`iqra_initial_vowel == ${vowel}`);
        expect(rules.said_wrong_vowel!.conditions, word.id).toContain(`iqra_initial_vowel != ${vowel}`);
        // Real IQRA format: hamza, then the vowel. Right vowel passes, the other two do not.
        const consonants = (rules.excellent!.conditions[1]!.match(/\[(.*)\]/)![1]!).replace(/'/g, "").split(",").map((t) => t.split("|")[0]!);
        for (const heardVowel of ["a", "i", "u"] as const) {
          const phonemes = ["<", heardVowel, ...consonants.flatMap((c) => [c, "a"])];
          const result = buildAssessment({
            target: word.exercise.target,
            primary: { referenceText: word.exercise.target, recognized: word.exercise.target, accuracy: 95, pronunciation: 95, fluency: 90, completeness: 100, firstSoundScore: 80, words: [] },
            masaar: null,
            iqra: { phonemes },
          });
          expect(result.passed, `${word.id} heard with ${heardVowel}`).toBe(heardVowel === vowel);
          if (heardVowel !== vowel) expect(result.conditionEvaluation.matchedRule).toBe("said_wrong_vowel");
        }
      }
    }
  });

  it("every image exists under public/images/a1/lesson-1", () => {
    for (const word of a1Words()) {
      expect(word.image.src).toBe(`/images/a1/lesson-1/${word.id}.svg`);
      expect(existsSync(path.join(process.cwd(), "public", word.image.src)), word.image.src).toBe(true);
    }
  });

  it("every sound and word is accepted by /api/pronunciation (with rules) and /api/tts", () => {
    const exercises = a1Exercises();
    expect(exercises).toHaveLength(12);
    for (const exercise of exercises) {
      expect(CONDITION_RULES[exercise.target]?.excellent, exercise.target).toBeDefined();
      expect(isAllowedTarget(exercise.target), exercise.target).toBe(true);
      expect(isAllowedTtsText(exercise.modelText), exercise.modelText).toBe(true);
    }
  });

  it("vowel rules: decided by the vowel IQRA hears, not by Azure accuracy", () => {
    expect(Object.keys(SOUND_RULES)).toEqual(["أَ", "إِ", "أُ"]);
    const heard = { "أَ": ["<", "aa"], "إِ": ["<", "i"], "أُ": ["h", "uu"] } as const;
    const assess = (target: string, phonemes: string[] | null, accuracy = 90) =>
      buildAssessment({
        target,
        primary: { referenceText: target, recognized: target, accuracy, pronunciation: accuracy, fluency: 90, completeness: 100, firstSoundScore: 80, words: [] },
        masaar: null,
        iqra: phonemes && { phonemes },
      });
    for (const target of Object.keys(SOUND_RULES) as Array<keyof typeof heard>) {
      // Its own vowel passes – even with a low Azure score.
      expect(assess(target, [...heard[target]], 40).passed, target).toBe(true);
      // Any other vowel fails, even with a perfect Azure score.
      for (const other of Object.keys(heard) as Array<keyof typeof heard>) {
        if (other === target) continue;
        const result = assess(target, [...heard[other]], 100);
        expect(result.passed, `${target} heard as ${other}`).toBe(false);
        expect(result.conditionEvaluation.matchedRule).toBe("needs_improvement");
      }
      // Both vowels at once is not a clear answer.
      expect(assess(target, ["a", "i", "u"]).passed).toBe(false);
      // IQRA unavailable: no rule, i.e. the service path – not a pronunciation mistake.
      expect(assess(target, null).conditionEvaluation.matchedRule).toBe("no_matching_rule");
    }
  });
});

class FakeRecorder {
  static instances: FakeRecorder[] = [];
  state: "inactive" | "recording" = "inactive";
  mimeType = "audio/webm";
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  onstop: (() => void) | null = null;
  constructor(public stream: MediaStream) {
    FakeRecorder.instances.push(this);
  }
  start() {
    this.state = "recording";
  }
  stop() {
    this.state = "inactive";
    this.ondataavailable?.({ data: new Blob(["audio-bytes"]) });
    this.onstop?.();
  }
}

const getUserMedia = vi.fn();
const fetchMock = vi.fn();
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const answer = (passed: boolean) => ({
  ok: true,
  status: 200,
  json: async () => ({
    passed,
    scores: { accuracy: passed ? 88 : 52 },
    feedback: { rule: passed ? "excellent" : "needs_improvement", message: passed ? "ممتاز 👏" : "حاول مرة أخرى، نريد أَ" },
    conditionEvaluation: { azureAccuracy: passed ? 88 : 52, iqraPhonemes: ["a"], matchedRule: passed ? "excellent" : "needs_improvement", message: "" },
  }),
});

async function record(id: string) {
  fireEvent.click(screen.getByTestId(`exercise-${id}-record`));
  await waitFor(() => expect(screen.getByTestId(`exercise-${id}`).dataset.phase).toBe("recording"));
  await act(() => wait(450));
  fireEvent.click(screen.getByTestId(`exercise-${id}-record`));
}

beforeEach(() => {
  FakeRecorder.instances = [];
  tts.speak.mockClear();
  getUserMedia.mockReset().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] });
  fetchMock.mockReset().mockResolvedValue(answer(true));
  Object.defineProperty(navigator, "mediaDevices", { value: { getUserMedia }, configurable: true });
  vi.stubGlobal("MediaRecorder", FakeRecorder);
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("A1 step 1: the vowels one after another", () => {
  it("listen and speak each vowel; simple feedback without accuracy; Weiter leads to إِ, أُ and then step 2", async () => {
    if (soundsStep!.kind !== "sounds") throw new Error();
    render(<SoundsStep sounds={soundsStep!.sounds} nextHref="/a1/lesson-1/step-2" nextLabel="Weiter: Wörter" />);

    for (const [i, sound] of soundsStep!.sounds.entries()) {
      expect(screen.getByTestId(`sound-glyph-${sound.id}`)).toHaveTextContent(sound.glyph);
      fireEvent.click(screen.getByTestId(`exercise-${sound.id}-listen`));
      await waitFor(() => expect(tts.speak).toHaveBeenCalledWith(sound.exercise.modelText));

      if (i === 0) fetchMock.mockResolvedValueOnce(answer(false));
      await record(sound.id);
      if (i === 0) {
        const feedback = await screen.findByTestId(`exercise-${sound.id}-feedback`);
        expect(feedback).toHaveAttribute("data-passed", "false");
        expect(feedback).not.toHaveTextContent("%");
        expect(feedback).not.toHaveTextContent("نريد");
        fireEvent.click(screen.getByTestId(`exercise-${sound.id}-feedback-retry`));
        await waitFor(() => expect(screen.getByTestId(`exercise-${sound.id}`).dataset.phase).toBe("recording"));
        await act(() => wait(450));
        fireEvent.click(screen.getByTestId(`exercise-${sound.id}-record`));
      }
      await waitFor(() => expect(screen.getByTestId(`exercise-${sound.id}-feedback-headline`)).toHaveTextContent("مُمْتَاز! 👏"));
      expect(screen.getByTestId(`exercise-${sound.id}-feedback`)).not.toHaveTextContent("%");
      expect(screen.getByTestId(`sound-card-${sound.id}`)).toHaveTextContent("Geschafft");

      const form = (fetchMock.mock.calls.at(-1)![1] as RequestInit).body as FormData;
      expect(form.get("target")).toBe(sound.exercise.target);

      if (i < 2) fireEvent.click(screen.getByTestId("sound-next"));
    }
    expect(screen.getByTestId("step-next")).toHaveAttribute("href", "/a1/lesson-1/step-2");
  });
});

describe("A1 step 2: each vowel with its three word cards", () => {
  it("shows image, Arabic, German, transliteration, listen and speak for every word; one recording at a time", async () => {
    if (wordsStep!.kind !== "sound-words") throw new Error();
    render(<SoundWordsStep groups={wordsStep!.groups} />);

    for (const group of wordsStep!.groups) {
      const section = screen.getByTestId(`word-group-${group.sound.id}`);
      expect(within(section).getByTestId(`sound-glyph-${group.sound.id}`)).toHaveTextContent(group.sound.glyph);
      expect(within(section).getByTestId(`exercise-${group.sound.id}-record`)).toBeInTheDocument();
      for (const word of group.words) {
        const card = within(section).getByTestId(`vocab-card-${word.id}`);
        expect(card.querySelector("img")).toHaveAttribute("src", word.image.src);
        expect(card).toHaveTextContent(word.arabic);
        expect(card).toHaveTextContent(word.german);
        expect(card).toHaveTextContent(word.transliteration);
        expect(within(card).getByTestId(`exercise-${word.id}-listen`)).toBeInTheDocument();
        expect(within(card).getByTestId(`exercise-${word.id}-record`)).toBeInTheDocument();
      }
    }

    // Each row is RTL and starts with its vowel, then the words in sheet order.
    for (const group of wordsStep!.groups) {
      const row = screen.getByTestId(`word-group-${group.sound.id}`);
      expect(row).toHaveAttribute("dir", "rtl");
      const order = Array.from(row.querySelectorAll('[data-testid^="sound-card-"], [data-testid^="vocab-card-"]')).map((el) => el.getAttribute("data-testid"));
      expect(order).toEqual([`sound-card-${group.sound.id}`, ...group.words.map((w) => `vocab-card-${w.id}`)]);
    }

    fireEvent.click(screen.getByTestId("exercise-ab-record"));
    await waitFor(() => expect(screen.getByTestId("exercise-ab").dataset.phase).toBe("recording"));
    expect(screen.getByTestId("exercise-umm-record")).toBeDisabled();
    expect(screen.getByTestId("exercise-alif-fatha-record")).toBeDisabled();
    await act(() => wait(450));
    fireEvent.click(screen.getByTestId("exercise-ab-record"));
    await waitFor(() => expect(screen.getByTestId("exercise-ab-feedback-headline")).toHaveTextContent("مُمْتَاز! 👏"));
    expect(screen.getByTestId("exercise-umm-record")).toBeEnabled();
    expect(screen.getByTestId("vocab-card-ab")).toHaveTextContent("Geschafft");
  });
});
