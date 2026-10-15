import { A1_UNIT_SLUGS } from "../support/a1-units";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { existsSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const tts = vi.hoisted(() => ({ speechUrl: vi.fn(async (text: string) => `blob:tts/${encodeURIComponent(text)}`) }));
vi.mock("@/lib/tts/player", () => ({ speechUrl: tts.speechUrl, speakArabic: vi.fn(async () => undefined), stopSpeaking: vi.fn() }));

import A1LessonPage from "@/app/a1/[unit]/[lesson]/page";
import A1UnitPage from "@/app/a1/[unit]/page";
import { GapsStep } from "@/components/a1/gaps/gaps-step";
import { a1Entries, a1SpokenTexts, a1Unit1, getA1Lesson, movedStep } from "@/data/a1";
import { SHARED_GAPS_TEXT } from "@/data/a1/letter-lesson";
import { LEVELS } from "@/data/curriculum";
import type { A1Lesson, GapsContent } from "@/data/types";
import { alignPattern, gapTask, patternPieces } from "@/lib/arabic/gap";
import { baseLetter, joins, splitTiles } from "@/lib/arabic/letter-form";
import { copyMovedA1Progress } from "@/lib/progress";
import { CONDITION_RULES } from "@/lib/pronunciation/rules";
import { isAllowedTarget, isAllowedTtsText } from "@/lib/pronunciation/targets";

// A1 · Lektion 1 as one lesson with ten entries; the review; the phrase;
// pattern gaps; and the pictures of every vocabulary item.

type Step = A1Lesson["steps"][number];
const gapsSteps = (lesson: A1Lesson) => lesson.steps.filter((s): s is Extract<Step, { kind: "gaps" }> => s.kind === "gaps");
const PUBLIC = path.join(process.cwd(), "public");

describe("Lektion 1: ten entries in book order", () => {
  it("أ ب ت ث ج ح خ, the review, the phrase – every letter with the same five steps as Alif", () => {
    expect(a1Unit1.lessons.map((l) => [l.slug, l.kind, l.label])).toEqual([
      ["alif", "letter", "أ"],
      ["ba", "letter", "ب"],
      ["ta", "letter", "ت"],
      ["tha", "letter", "ث"],
      ["jim", "letter", "ج"],
      ["hha", "letter", "ح"],
      ["kha", "letter", "خ"],
      ["review", "review", "مُرَاجَعَة"],
      ["sabah-al-khayr", "phrase", "صَبَاحُ الْخَيْر"],
      ["tahiyya-wa-taqdim", "phrase", "التَّحِيَّةُ وَتَقْدِيمُ النَّفْسِ"],
    ]);
    for (const lesson of a1Unit1.lessons.filter((l) => l.kind === "letter")) {
      expect(lesson.steps.map((s) => [s.slug, s.kind]), lesson.slug).toEqual([["step-1", "sound-words"], ["step-2", "forms"], ["step-3", "writing"], ["step-4", "gaps"], ["step-5", "gaps"]]);
      expect(gapsSteps(lesson).map((s) => s.gaps.mode), lesson.slug).toEqual(["picture", "listen"]);
    }
    // No entry has a separate "Laute" step any more.
    for (const { lesson } of a1Entries()) expect(lesson.steps.some((s) => s.title.startsWith("Laute")), lesson.slug).toBe(false);
  });

  it("old URLs lead to the new places: /a1/lesson-1/step-N → Alif step N − 1 (step 1 → Wörter), /a1/ba → /a1/lesson-1/ba", async () => {
    expect(["step-1", "step-2", "step-6", "x"].map(movedStep)).toEqual(["step-1", "step-1", "step-5", undefined]);
    const redirected = async (call: Promise<unknown>) => {
      try {
        await call;
      } catch (error) {
        return String((error as { digest?: string }).digest).split(";")[2];
      }
      return undefined;
    };
    expect(await redirected(A1LessonPage({ params: Promise.resolve({ unit: "lesson-1", lesson: "step-3" }) }))).toBe("/a1/lesson-1/alif/step-2");
    expect(await redirected(A1LessonPage({ params: Promise.resolve({ unit: "lesson-1", lesson: "step-1" }) }))).toBe("/a1/lesson-1/alif/step-1");
    expect(await redirected(A1LessonPage({ params: Promise.resolve({ unit: "lesson-1", lesson: "ba" }) }))).toBe("/a1/lesson-1/ba/step-1");
    expect(await redirected(A1LessonPage({ params: Promise.resolve({ unit: "ba", lesson: "step-4" }) }))).toBe("/a1/lesson-1/ba/step-3");
    expect(await redirected(A1UnitPage({ params: Promise.resolve({ unit: "kha" }) }))).toBe("/a1/lesson-1/kha");
    // lesson-2 is A1 · Lektion 2 now ("مَسَاءُ الْخَيْر"); the next old word-lesson URL still leads to A0.
    expect(await redirected(A1UnitPage({ params: Promise.resolve({ unit: "lesson-2" }) }))).toBeUndefined();
    // Every implemented A1 lesson is shown; the next old word-lesson URLs still lead to A0.
    for (const unit of A1_UNIT_SLUGS) expect(await redirected(A1UnitPage({ params: Promise.resolve({ unit }) })), unit).toBeUndefined();
    const next = `lesson-${A1_UNIT_SLUGS.length + 1}`;
    expect(await redirected(A1UnitPage({ params: Promise.resolve({ unit: next }) }))).toBe(`/a0/words/${next}`);
  });

  it("saved progress of Alif's old steps moves along (step-N → alif/step-(N − 1)); nothing is deleted; Laute has no new place", () => {
    const old = { "a1/lesson-1/step-1": { passed: ["alif-fatha"] }, "a1/lesson-1/step-3": { passed: [], completedAt: "x" }, "a1/lesson-1/step-6": { passed: [], completedAt: "y" } };
    expect(copyMovedA1Progress(old)).toEqual({ ...old, "a1/lesson-1/alif/step-2": old["a1/lesson-1/step-3"], "a1/lesson-1/alif/step-5": old["a1/lesson-1/step-6"] });
    const newer = { ...old, "a1/lesson-1/alif/step-2": { passed: ["new"] } };
    expect(copyMovedA1Progress(newer)["a1/lesson-1/alif/step-2"]).toEqual({ passed: ["new"] });
  });
});

describe("pattern gaps", () => {
  it("align the book pattern with the word; every _ is one tile; a pattern that does not fit throws", () => {
    expect(alignPattern("بَابْ", "_ا_").map((g) => [g.index, g.answer, g.vowel])).toEqual([[0, "بَ", "a"], [2, "بْ", "sukun"]]);
    expect(alignPattern("نَبْق", "نَ_ق").map((g) => g.answer)).toEqual(["بْ"]);
    expect(() => alignPattern("بَابْ", "_ب_")).toThrow();
    expect(() => alignPattern("بَاب", "_ا_")).toThrow(); // no vowel sign on the last ب
  });

  it("draw the rest in its joined shape: a tatweel where a piece joins a gap, none where it does not", () => {
    const pieces = (word: string, pattern: string) => {
      const tiles = splitTiles(word);
      return patternPieces(tiles, alignPattern(word, pattern)).map((p) => (p.kind === "gap" ? `[${p.gap}]` : p.text));
    };
    expect(pieces("فَتْق", "فَ_ق")).toEqual(["فَـ", "[0]", "ـق"]);
    expect(pieces("بَابْ", "_ا_")).toEqual(["[0]", "ـا", "[1]"]); // ا does not hold the next letter
    expect(pieces("ثَلَاثَة", "_لَا_ة")).toEqual(["[0]", "ـلَا", "[1]", "ـة"]);
    expect(pieces("أَثْنَاء", "أَ_نَاء")).toEqual(["أَ", "[0]", "ـنَاء"]);
    expect(pieces("بِنْت", "_نْت")).toEqual(["[0]", "ـنْت"]);
    // A space never joins: the phrase.
    expect(pieces("صَبَاحُ الْخَيْر", "صَبَا_ الْخَيْر")).toEqual(["صَبَا", "[0]", " الْخَيْر"]);
    expect(pieces("صَبَاحُ الْخَيْر", "صَ_احُ الْخَيْر")).toEqual(["صَـ", "[0]", "ـاحُ الْخَيْر"]);
    expect(joins(splitTiles("صَبَاحُ الْخَيْر"), 3)).toEqual({ previous: false, next: false });
  });

  it("every gap item of Lektion 1 fits its pattern, and its answers are among its choices", () => {
    let count = 0;
    for (const lesson of a1Unit1.lessons) {
      for (const { gaps } of gapsSteps(lesson)) {
        for (const item of gaps.items) {
          const task = gapTask(item);
          for (const gap of task.gaps) expect(item.choices ?? gaps.choices, `${lesson.slug}: ${item.arabic}`).toContain(gap.answer);
          count += 1;
        }
      }
    }
    expect(count).toBe(19 + 6 * 19 + 14 + 3);
  });

  it("words without a recording may be spoken by /api/tts (allow-list), e.g. بَابْ, أَبْ, ثُلُثْ", () => {
    for (const text of ["بَابْ", "أَبْ", "ثُلُثْ", "تِلِيفُونُ", "رَأْس", "صَبَاحُ الْخَيْر"]) expect(isAllowedTtsText(text), text).toBe(true);
    expect(a1SpokenTexts()).toContain("نَبْق");
  });
});

describe("مراجعة – the review", () => {
  const review = getA1Lesson("lesson-1", "review")!;

  it("Ergänzen and Hören over all seven letters, with words the child learnt; the first letter is missing", () => {
    const [fill, listen] = gapsSteps(review);
    expect([fill!.gaps.mode, listen!.gaps.mode]).toEqual(["picture", "listen"]);
    const known = new Map(a1Entries().flatMap(({ lesson }) => lesson.steps.flatMap((s) => (s.kind === "sound-words" ? s.groups.flatMap((g) => g.words) : []))).map((w) => [w.id, w]));
    for (const { gaps } of [fill!, listen!]) {
      const letters = gaps.items.map((item) => {
        const word = known.get(item.id)!;
        expect(word.arabic, item.id).toBe(item.arabic);
        expect(word.german).toBe(item.german);
        const [gap] = gapTask(item).gaps;
        expect(gap!.index).toBe(0);
        // Four tiles with the same vowel: the child tells the LETTERS apart.
        expect(item.choices).toHaveLength(4);
        expect(new Set(item.choices!.map((c) => Array.from(c).at(-1)))).toEqual(new Set([Array.from(gap!.answer).at(-1)]));
        if (gaps.mode === "picture") expect(item.image).toEqual(word.image);
        else expect(item.image).toBeUndefined();
        const letter = baseLetter(gap!.answer);
        return letter === "إ" ? "أ" : letter;
      });
      expect(new Set(letters)).toEqual(new Set(["أ", "ب", "ت", "ث", "ج", "ح", "خ"]));
    }
  });
});

describe("صَبَاحُ الْخَيْر – the conversation", () => {
  const phrase = getA1Lesson("lesson-1", "sabah-al-khayr")!;

  it("two conversations (listen, repeat, role-play each), then Buchstaben finden (ب ح خ in the greeting)", () => {
    expect(phrase.steps.map((s) => [s.slug, s.kind, s.kind === "dialogue" ? s.mode : null, s.title])).toEqual([
      ["step-1", "dialogue", "listen", "Anhören 1: Ahmad und Ali"],
      ["step-2", "dialogue", "repeat", "Nachsprechen 1: Ahmad und Ali"],
      ["step-3", "dialogue", "roleplay", "Rollenspiel 1: Ahmad und Ali"],
      ["step-4", "dialogue", "listen", "Anhören 2: Nabila und Fatima"],
      ["step-5", "dialogue", "repeat", "Nachsprechen 2: Nabila und Fatima"],
      ["step-6", "dialogue", "roleplay", "Rollenspiel 2: Nabila und Fatima"],
      ["step-7", "gaps", null, "Buchstaben finden: ب · ح · خ"],
    ]);
    const dialogues = [...new Set(phrase.steps.flatMap((s) => (s.kind === "dialogue" ? [s.dialogue] : [])))];
    expect(dialogues.map((d) => d.lines.length)).toEqual([7, 7]); // one object per conversation, three stages each
    const find = phrase.steps[6]!;
    if (find.kind !== "gaps") throw new Error();
    expect(find.gaps.items.map((i) => gapTask(i).gaps.map((g) => g.answer))).toEqual([["بَ"], ["حُ"], ["خَ"]]);
    for (const line of dialogues.flatMap((d) => d.lines)) {
      expect(CONDITION_RULES[line.exercise.target]?.excellent, line.exercise.target).toBeDefined();
      expect(isAllowedTarget(line.exercise.target), line.exercise.target).toBe(true);
      expect(isAllowedTtsText(line.exercise.modelText), line.exercise.modelText).toBe(true);
    }
  });
});

describe("pictures of every vocabulary item", () => {
  // Formen words that are not things (verbs, adjectives, "during", a kingdom): no picture on purpose.
  const ABSTRACT = new Set(["saba", "athna", "nudj", "faraj", "ajmal", "nasaha", "majdi"]);

  it("A0 → Wörter and every A1 word, phrase, Ergänzen item and concrete Formen word has a picture whose file exists", () => {
    type Picture = [id: string, image: { src: string; alt: string } | undefined];
    const pictures: Picture[] = [
      ...LEVELS.flatMap((level) => level.lessons.flatMap((lesson) => lesson.vocabulary.map((w): Picture => [`a0 ${w.id}`, w.image]))),
      ...a1Entries().flatMap(({ lesson }) =>
        lesson.steps.flatMap((s): Picture[] =>
          s.kind === "sound-words"
            ? s.groups.flatMap((g) => g.words.map((w): Picture => [`${lesson.slug} ${w.id}`, w.image]))
            : s.kind === "gaps" && s.gaps.mode === "picture"
                ? // "Ordne die Buchstaben" (Lektion 2 · حروف المد · تدريب ٦, Unit 2 · تدريب ٤): the book has no pictures there.
                  s.gaps.items.filter((w) => !w.id.startsWith("arrange-")).map((w): Picture => [`${lesson.slug} gap ${w.id}`, w.image])
                : s.kind === "forms"
                  ? [...s.forms.sort].filter((w) => !ABSTRACT.has(w.id)).map((w): Picture => [`${lesson.slug} forms ${w.id}`, w.image])
                  : []
        )
      ),
    ];
    expect(pictures.length).toBeGreaterThan(200);
    for (const [id, image] of pictures) {
      expect(image?.src, id).toMatch(/^\/images\/.+\.svg$/);
      expect(image!.alt.length, id).toBeGreaterThan(2);
      expect(existsSync(path.join(PUBLIC, image!.src)), `${id}: ${image!.src}`).toBe(true);
    }
  });

  it("every A1 word has its OWN picture (no picture shared by two different words)", () => {
    const bySrc = new Map<string, Set<string>>();
    for (const { lesson } of a1Entries()) {
      for (const s of lesson.steps) {
        if (s.kind !== "sound-words") continue;
        for (const w of s.groups.flatMap((g) => g.words)) bySrc.set(w.image!.src, (bySrc.get(w.image!.src) ?? new Set()).add(w.arabic));
      }
    }
    for (const [src, words] of bySrc) expect([...words], src).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// The gap flow with patterns: two gaps, per-item choices, /api/tts for words without a recording.

const played: string[] = [];
class FakeAudio {
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  paused = true;
  src = "";
  play() {
    const src = this.src;
    if (!src.startsWith("data:")) played.push(src.startsWith("blob:tts/") ? `tts:${decodeURIComponent(src.slice("blob:tts/".length))}` : src.split("/").slice(-2).join("/").replace(".wav", ""));
    this.paused = false;
    setTimeout(() => !this.paused && this.src === src && this.onended?.(), 5);
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
}

describe("gap flow – patterns", () => {
  beforeEach(() => {
    played.length = 0;
    tts.speechUrl.mockClear();
    window.localStorage.clear();
    vi.stubGlobal("Audio", FakeAudio);
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  const ba = getA1Lesson("lesson-1", "ba")!;
  const [fill, listen] = gapsSteps(ba);
  const shared = Object.keys(SHARED_GAPS_TEXT);
  const drop = (choice: string) => {
    fireEvent.click(screen.getByTestId(`choice-${screen.getAllByTestId(/^choice-/).findIndex((c) => c.dataset.choice === choice)}`));
    fireEvent.click(screen.getAllByTestId("gap-slot").find((slot) => slot.dataset.active === "true")!);
  };

  it("_ا_ → بَابْ: two gaps, right to left; the word is spoken by /api/tts (no recording); captions from the shared texts", async () => {
    const item = fill!.gaps.items.find((i) => i.arabic === "بَابْ")!;
    const gaps: GapsContent = { ...fill!.gaps, items: [item] };
    render(<GapsStep gaps={gaps} availableAudio={shared} progressKey="a1/lesson-1/ba/step-4" />);
    fireEvent.click(await screen.findByTestId("start-button"));
    await waitFor(() => expect(played).toEqual(["shared/g5_intro"]));
    expect(screen.getByTestId("gap-caption")).toHaveTextContent(SHARED_GAPS_TEXT["shared/g5_intro"]!);
    expect(screen.getByTestId("gap-image")).toHaveAttribute("src", item.image!.src);
    expect(screen.getAllByTestId("gap-piece").map((p) => p.textContent)).toEqual(["ـا"]);
    expect(screen.getAllByTestId("gap-slot").map((s) => s.dataset.active)).toEqual(["true", "false"]);

    drop("بَ");
    await waitFor(() => expect(screen.getAllByTestId("gap-slot").map((s) => s.dataset.filled)).toEqual(["true", "false"]));
    expect(screen.getAllByTestId("gap-slot")[1]).toHaveAttribute("data-active", "true");

    played.length = 0;
    drop("بَ"); // wrong: the second gap is بْ
    await waitFor(() => expect(played).toEqual(["shared/g_hint", "tts:بَابْ"]));
    drop("بِ");
    await waitFor(() => expect(played.at(-1)).toBe("shared/r_sukun"));
    expect(screen.getByTestId("gap-caption")).toHaveTextContent("Hier hörst du keinen Vokal. Darum steht ein Sukun.");
    drop("بْ");
    expect(await screen.findByTestId("gap-shaped")).toHaveTextContent("بَابْ");
    await waitFor(() => expect(played).toContain("shared/g_ok"));
    // The word (by /api/tts), then "Richtig!".
    expect(played.lastIndexOf("tts:بَابْ")).toBe(played.indexOf("shared/g_ok") - 1);
    expect(tts.speechUrl).toHaveBeenCalledWith("بَابْ");
    await screen.findByTestId("gap-result", undefined, { timeout: 4000 });
    expect(screen.getByTestId("result-bab")).toHaveAttribute("data-first-try", "false");
  });

  it("Hören: each word plays first – the recording when it exists, else /api/tts", async () => {
    const items = listen!.gaps.items.slice(0, 2);
    render(<GapsStep gaps={{ ...listen!.gaps, items }} availableAudio={[...shared, `ba/uebungen/${items[0]!.id}`]} progressKey="k" />);
    fireEvent.click(await screen.findByTestId("start-button"));
    await waitFor(() => expect(played).toEqual(["shared/g6_intro", `uebungen/${items[0]!.id}`]));
    expect(screen.queryByTestId("gap-image")).toBeNull();
    drop(gapTask(items[0]!).gaps[0]!.answer);
    fireEvent.click(await screen.findByTestId("gap-next"));
    await waitFor(() => expect(played.at(-1)).toBe(`tts:${items[1]!.arabic}`));
  });

  it("the review shows each item's own four tiles", async () => {
    const [rfill] = gapsSteps(getA1Lesson("lesson-1", "review")!);
    render(<GapsStep gaps={{ ...rfill!.gaps, items: rfill!.gaps.items.slice(0, 2) }} availableAudio={shared} progressKey="k" />);
    fireEvent.click(await screen.findByTestId("start-button"));
    const tiles = () => screen.getAllByTestId(/^choice-/).map((c) => c.dataset.choice);
    await waitFor(() => expect(tiles()).toEqual(rfill!.gaps.items[0]!.choices));
    drop(gapTask(rfill!.gaps.items[0]!).gaps[0]!.answer);
    fireEvent.click(await screen.findByTestId("gap-next"));
    await waitFor(() => expect(tiles()).toEqual(rfill!.gaps.items[1]!.choices));
  });
});
