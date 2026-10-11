import type { A1Lesson, A1Unit, PronunciationExercise } from "@/data/types";

import { a1Alif } from "./lesson-1";
import { a1Ba } from "./letters/ba";
import { a1Hha } from "./letters/hha";
import { a1Jim } from "./letters/jim";
import { a1Kha } from "./letters/kha";
import { a1Ta } from "./letters/ta";
import { a1Tha } from "./letters/tha";
import { a1Review } from "./review";
import { a1SabahAlKhayr } from "./sabah-al-khayr";

// A1 – the new curriculum, built lesson by lesson (one book unit each). /a1
// lists the lessons; a lesson's page (/a1/<unit>) lists its entries in book
// order; every entry has its own steps (/a1/<unit>/<entry>/<step>).
// Lektion 1 "صَبَاحُ الْخَيْر": the letters أ ب ت ث ج ح خ (Alif in lesson-1.ts,
// the others in letters/, see letter-lesson.ts), the review and the phrase.
// (The former A1 word lessons are A0 → Wörter, see src/data/curriculum.ts.)

export const a1Unit1: A1Unit = {
  slug: "lesson-1",
  number: 1,
  title: "صَبَاحُ الْخَيْر",
  titleGerman: "Guten Morgen",
  lessons: [a1Alif, a1Ba, a1Ta, a1Tha, a1Jim, a1Hha, a1Kha, a1Review, a1SabahAlKhayr],
};

export const A1_LEVEL = {
  slug: "a1",
  code: "A1",
  title: "Lektionen",
  description: "Lerne Lektion für Lektion – hören, nachsprechen und sofort Feedback bekommen.",
  units: [a1Unit1] as A1Unit[],
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

/** Every exercise of an A1 entry; each exercise once. */
export function a1LessonExercises(lesson: A1Lesson): PronunciationExercise[] {
  const all = lesson.steps.flatMap((step) =>
    step.kind === "sound-words"
      ? step.groups.flatMap((group) => [group.sound.exercise, ...group.words.map((word) => word.exercise)])
      : step.kind === "phrases"
        ? step.phrases.map((phrase) => phrase.exercise)
        : [] // "forms", "writing", "gaps": nothing is evaluated.
  );
  return all.filter((exercise, index) => all.findIndex((other) => other.id === exercise.id) === index);
}

export function a1Exercises(): PronunciationExercise[] {
  return a1Entries().flatMap(({ lesson }) => a1LessonExercises(lesson));
}

/**
 * Words the A1 steps speak through /api/tts besides the exercises: the full
 * words of "Ergänzen" / "Hören" (e.g. بَابْ) as long as they have no recording.
 */
export function a1SpokenTexts(): string[] {
  return [...new Set(a1Entries().flatMap(({ lesson }) => lesson.steps.flatMap((step) => (step.kind === "gaps" ? step.gaps.items.map((item) => item.arabic) : []))))];
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
