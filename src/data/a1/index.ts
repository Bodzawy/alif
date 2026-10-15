import type { A1Lesson, A1Unit, PronunciationExercise } from "@/data/types";
import { clozeLineText } from "@/lib/arabic/cloze";

import { a1Alif } from "./lesson-1";
import { a1Ba } from "./letters/ba";
import { a1Hha } from "./letters/hha";
import { a1Jim } from "./letters/jim";
import { a1Kha } from "./letters/kha";
import { a1Ta } from "./letters/ta";
import { a1Tha } from "./letters/tha";
import { a1Review } from "./review";
import { a1SabahAlKhayr } from "./sabah-al-khayr";
import { a1Unit2 } from "./lesson-2";
import { a1Unit3, a1Unit4 } from "./unit-2";
import { a1Unit5, a1Unit6 } from "./unit-3";
import { a1Unit7, a1Unit8 } from "./unit-4";
import { a1Unit10, a1Unit9 } from "./unit-5";
import { a1Unit11, a1Unit12 } from "./unit-6";
import { a1Unit13, a1Unit14 } from "./unit-7";
import { a1Unit15, a1Unit16 } from "./unit-8";
import { a1Unit17, a1Unit18 } from "./unit-9";
import { a1Unit19, a1Unit20 } from "./unit-10";
import { a1Tahiyya } from "./tahiyya";

// A1 – the new curriculum, built lesson by lesson (one book unit each). /a1
// lists the lessons; a lesson's page (/a1/<unit>) lists its entries in book
// order; every entry has its own steps (/a1/<unit>/<entry>/<step>).
// Lektion 1 "صَبَاحُ الْخَيْر": the letters أ ب ت ث ج ح خ (Alif in lesson-1.ts,
// the others in letters/, see letter-lesson.ts), the review, the phrase and
// the next textbook page: greeting, introducing oneself, exercises (tahiyya.ts).
// Lektion 2 "مَسَاءُ الْخَيْر": the letters د ذ و ي, the long vowels and the
// evening conversations (lesson-2/). Lektion 3 and 4: the book's Unit 2
// ("وجدي.pdf", unit-2/). From Lektion 5 on: the book "لغتنا الفصحى 1", one
// presentation (تقديم) per lesson (unit-3/ …, see docs/book-progress.md).
// (The former A1 word lessons are A0 → Wörter, see src/data/curriculum.ts.)

export const a1Unit1: A1Unit = {
  slug: "lesson-1",
  number: 1,
  title: "صَبَاحُ الْخَيْر",
  titleGerman: "Guten Morgen",
  lessons: [a1Alif, a1Ba, a1Ta, a1Tha, a1Jim, a1Hha, a1Kha, a1Review, a1SabahAlKhayr, a1Tahiyya],
};

export const A1_LEVEL = {
  slug: "a1",
  code: "A1",
  title: "Lektionen",
  description: "Lerne Lektion für Lektion – hören, nachsprechen und sofort Feedback bekommen.",
  units: [a1Unit1, a1Unit2, a1Unit3, a1Unit4, a1Unit5, a1Unit6, a1Unit7, a1Unit8, a1Unit9, a1Unit10, a1Unit11, a1Unit12, a1Unit13, a1Unit14, a1Unit15, a1Unit16, a1Unit17, a1Unit18, a1Unit19, a1Unit20] as A1Unit[],
} as const;

export function getA1Unit(slug: string): A1Unit | undefined {
  return A1_LEVEL.units.find((unit) => unit.slug === slug);
}

export function getA1Lesson(unitSlug: string, slug: string): A1Lesson | undefined {
  return getA1Unit(unitSlug)?.lessons.find((lesson) => lesson.slug === slug);
}

/** Every entry of every A1 lesson, with its lesson. */
export function a1Entries(): Array<{ unit: A1Unit; lesson: A1Lesson }> {
  return A1_LEVEL.units.flatMap((unit) => unit.lessons.map((lesson) => ({ unit, lesson })));
}

export function a1UnitHref(unit: Pick<A1Unit, "slug">) {
  return `/${A1_LEVEL.slug}/${unit.slug}`;
}

export function a1LessonHref(unit: Pick<A1Unit, "slug">, lesson: Pick<A1Lesson, "slug">) {
  return `${a1UnitHref(unit)}/${lesson.slug}`;
}

export function a1StepHref(unit: Pick<A1Unit, "slug">, lesson: Pick<A1Lesson, "slug">, stepSlug: string) {
  return `${a1LessonHref(unit, lesson)}/${stepSlug}`;
}

/** Progress key of a step, e.g. "a1/lesson-1/ba/step-2". */
export function a1StepKey(unit: Pick<A1Unit, "slug">, lesson: Pick<A1Lesson, "slug">, stepSlug: string) {
  return a1StepHref(unit, lesson, stepSlug).slice(1);
}

/** The entry after this one: the next entry of the lesson, or the first entry of the next lesson. */
export function nextA1Entry(unitSlug: string, slug: string): { unit: A1Unit; lesson: A1Lesson } | undefined {
  const entries = a1Entries();
  const at = entries.findIndex(({ unit, lesson }) => unit.slug === unitSlug && lesson.slug === slug);
  return at >= 0 ? entries[at + 1] : undefined;
}

/** Every exercise of an A1 entry; each exercise once. */
export function a1LessonExercises(lesson: A1Lesson): PronunciationExercise[] {
  const all = lesson.steps.flatMap((step) =>
    step.kind === "sound-words"
      ? step.groups.flatMap((group) => [group.sound.exercise, ...group.words.map((word) => word.exercise)])
      : step.kind === "words"
        ? step.groups.flatMap((group) => group.words.map((word) => word.exercise))
      : step.kind === "dialogue"
        ? step.dialogue.lines.map((line) => line.exercise)
        : step.kind === "phrases"
          ? step.groups.flatMap((group) => group.items.map((item) => item.exercise))
          : [] // "forms", "writing", "gaps", "letter-find": nothing is evaluated.
  );
  return all.filter((exercise, index) => all.findIndex((other) => other.id === exercise.id) === index);
}

export function a1Exercises(): PronunciationExercise[] {
  return a1Entries().flatMap(({ lesson }) => a1LessonExercises(lesson));
}

/**
 * Texts the A1 steps speak through /api/tts besides the exercises: the full
 * words of "Ergänzen" / "Hören" (e.g. بَابْ) as long as they have no recording,
 * and the "Anhören" texts of the steps of Lektion 2 (positions, compare, match,
 * word-pick, table).
 */
export function a1SpokenTexts(): string[] {
  return [...new Set(a1Entries().flatMap(({ lesson }) => lesson.steps.flatMap(stepSpokenTexts)))];
}

const PUNCT = /[.،؟!:]+$/;

function stepSpokenTexts(step: A1Lesson["steps"][number]): string[] {
  switch (step.kind) {
    case "gaps":
      return step.gaps.items.map((item) => item.spoken ?? item.arabic);
    case "positions":
      return [...step.positions.items.map((item) => item.word), step.positions.sukun.word];
    case "compare":
      return step.sections.flatMap((section) => section.rows.flat().map((item) => item.arabic));
    case "match":
      return step.match.prompts.flatMap((prompt) => (prompt.result ? [prompt.result.arabic] : []));
    case "word-pick":
      return (step.pick.words ?? []).map((word) => word.arabic.replace(PUNCT, ""));
    case "table":
      return step.tables.flatMap((table) => table.rows.flat().filter((cell) => cell.listen !== false).map((cell) => cell.arabic));
    case "spell":
      return step.words.map((word) => word.arabic);
    case "quiz":
      return step.items.map((item) => item.spoken ?? item.arabic);
    case "cloze":
      return step.items.flatMap((item) => item.lines.map((line) => clozeLineText(line.parts)));
    case "order":
      return step.order.items.map((item) => item.arabic);
    default:
      return [];
  }
}

/**
 * Where a step of an old URL lives now. Alif had six steps at
 * /a1/lesson-1/step-N; its step 1 "Laute" is part of "Wörter" now, so
 * old step N is Alif's step N − 1 (step 1 → Wörter). The letter entries
 * (/a1/<letter>/step-N, never published) had "Laute" first, too.
 */
export function movedStep(oldStep: string): string | undefined {
  const n = /^step-(\d+)$/.exec(oldStep)?.[1];
  return n ? `step-${Math.max(1, Number(n) - 1)}` : undefined;
}
