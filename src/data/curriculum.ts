import type { Lesson, Level, PronunciationExercise } from "@/data/types";
import { lesson1 } from "@/data/lessons/a0/lesson-1";

// The single registry of all published content. Add a lesson by creating a
// data file under src/data/lessons/<level>/ and listing it here.
export const LEVELS: Level[] = [
  {
    slug: "a0",
    code: "A0",
    title: "Erste Schritte",
    description: "Die arabischen Buchstaben kennenlernen, richtig aussprechen und erste Wörter sagen.",
    lessons: [lesson1],
  },
];

export function getLevel(slug: string): Level | undefined {
  return LEVELS.find((level) => level.slug === slug);
}

export function getLesson(levelSlug: string, lessonSlug: string): { level: Level; lesson: Lesson } | undefined {
  const level = getLevel(levelSlug);
  const lesson = level?.lessons.find((item) => item.slug === lessonSlug);
  return level && lesson ? { level, lesson } : undefined;
}

export function lessonExercises(lesson: Lesson): PronunciationExercise[] {
  return [lesson.letter.exercise, ...lesson.vocabulary.map((item) => item.exercise)];
}

export function allExercises(): PronunciationExercise[] {
  return LEVELS.flatMap((level) => level.lessons.flatMap(lessonExercises));
}

export function nextLesson(levelSlug: string, lessonSlug: string): Lesson | undefined {
  const level = getLevel(levelSlug);
  if (!level) return undefined;
  const index = level.lessons.findIndex((item) => item.slug === lessonSlug);
  return index >= 0 ? level.lessons[index + 1] : undefined;
}
