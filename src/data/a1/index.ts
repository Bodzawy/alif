import type { A1Lesson, PronunciationExercise } from "@/data/types";

import { a1Lesson1 } from "./lesson-1";

// A1 – the new curriculum, built lesson by lesson. Add a lesson by creating
// src/data/a1/lesson-N.ts and listing it here; routes and components follow.
// (The former A1 word lessons are A0 → Wörter, see src/data/curriculum.ts.)

export const A1_LEVEL = {
  slug: "a1",
  code: "A1",
  title: "Lektionen",
  description: "Lerne Lektion für Lektion – hören, nachsprechen und sofort Feedback bekommen.",
  lessons: [a1Lesson1] as A1Lesson[],
} as const;

export function getA1Lesson(slug: string): A1Lesson | undefined {
  return A1_LEVEL.lessons.find((lesson) => lesson.slug === slug);
}

export function a1LessonHref(lesson: Pick<A1Lesson, "slug">) {
  return `/${A1_LEVEL.slug}/${lesson.slug}`;
}

export function a1StepHref(lesson: Pick<A1Lesson, "slug">, stepSlug: string) {
  return `${a1LessonHref(lesson)}/${stepSlug}`;
}

/** Every exercise of an A1 lesson, sounds first; each exercise once. */
export function a1LessonExercises(lesson: A1Lesson): PronunciationExercise[] {
  const all = lesson.steps.flatMap((step) =>
    step.kind === "sounds"
      ? step.sounds.map((sound) => sound.exercise)
      : step.kind === "sound-words"
        ? step.groups.flatMap((group) => [group.sound.exercise, ...group.words.map((word) => word.exercise)])
        : [] // "forms" plays recordings only; nothing is evaluated.
  );
  return all.filter((exercise, index) => all.findIndex((other) => other.id === exercise.id) === index);
}

export function a1Exercises(): PronunciationExercise[] {
  return A1_LEVEL.lessons.flatMap(a1LessonExercises);
}
