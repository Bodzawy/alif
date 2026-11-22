import type { A1Lesson, A1Unit, PronunciationExercise } from "@/data/types";
import { a1LessonExercises, stepSpokenTexts } from "@/data/a1";

import { a2Unit1 } from "./unit-1";

// A2 – the book "لغتنا الفصحى 2", one presentation (تقديم) per lesson, built like A1 (src/data/a1/):
// /a2 lists the lessons; a lesson's page (/a2/<unit>) lists its entries; every entry has its own
// steps (/a2/<unit>/<entry>/<step>). The step components are the A1 ones.
// Lektion 1: الوحدة الأولى · تقديم (١) "شَقَّتِي الْجَدِيدَةُ" (unit-1/).

export const A2_LEVEL = {
  slug: "a2",
  code: "A2",
  title: "Lektionen",
  description: "Beschreibe Dinge, Orte und Menschen – Lektion für Lektion mit Hören, Lesen, Sprechen und Üben.",
  units: [a2Unit1] as A1Unit[],
} as const;

export function getA2Unit(slug: string): A1Unit | undefined {
  return A2_LEVEL.units.find((unit) => unit.slug === slug);
}

export function getA2Lesson(unitSlug: string, slug: string): A1Lesson | undefined {
  return getA2Unit(unitSlug)?.lessons.find((lesson) => lesson.slug === slug);
}

/** Every entry of every A2 lesson, with its lesson. */
export function a2Entries(): Array<{ unit: A1Unit; lesson: A1Lesson }> {
  return A2_LEVEL.units.flatMap((unit) => unit.lessons.map((lesson) => ({ unit, lesson })));
}

export function a2UnitHref(unit: Pick<A1Unit, "slug">) {
  return `/${A2_LEVEL.slug}/${unit.slug}`;
}

export function a2LessonHref(unit: Pick<A1Unit, "slug">, lesson: Pick<A1Lesson, "slug">) {
  return `${a2UnitHref(unit)}/${lesson.slug}`;
}

export function a2StepHref(unit: Pick<A1Unit, "slug">, lesson: Pick<A1Lesson, "slug">, stepSlug: string) {
  return `${a2LessonHref(unit, lesson)}/${stepSlug}`;
}

/** Progress key of a step, e.g. "a2/lesson-1/shaqqati/step-2". */
export function a2StepKey(unit: Pick<A1Unit, "slug">, lesson: Pick<A1Lesson, "slug">, stepSlug: string) {
  return a2StepHref(unit, lesson, stepSlug).slice(1);
}

/** The entry after this one: the next entry of the lesson, or the first entry of the next lesson. */
export function nextA2Entry(unitSlug: string, slug: string): { unit: A1Unit; lesson: A1Lesson } | undefined {
  const entries = a2Entries();
  const at = entries.findIndex(({ unit, lesson }) => unit.slug === unitSlug && lesson.slug === slug);
  return at >= 0 ? entries[at + 1] : undefined;
}

/** Every evaluated exercise of the A2 lessons (dialogue lines, phrases); each exercise once. */
export function a2Exercises(): PronunciationExercise[] {
  const all = a2Entries().flatMap(({ lesson }) => a1LessonExercises(lesson));
  return all.filter((exercise, index) => all.findIndex((other) => other.id === exercise.id) === index);
}

/** Every text the A2 steps speak through /api/tts (allowed in src/lib/pronunciation/targets.ts). */
export function a2SpokenTexts(): string[] {
  return [...new Set(a2Entries().flatMap(({ lesson }) => lesson.steps.flatMap(stepSpokenTexts)))];
}
