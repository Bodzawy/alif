import type { Lesson, Level, PronunciationExercise } from "@/data/types";
import { lesson1 } from "@/data/lessons/a1/lesson-1";

// Registry of the lesson-based (vocabulary) levels. Add a lesson by creating a
// data file under src/data/lessons/<level>/ and listing it here.
// A0 – the alphabet – is a separate kind of level, see src/data/alphabet.ts.
export const LEVELS: Level[] = [
  {
    slug: "a1",
    code: "A1",
    title: "Erste Wörter",
    description: "Erste arabische Wörter hören, nachsprechen und verstehen – mit Bildern und deutscher Übersetzung.",
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

export function previousLesson(levelSlug: string, lessonSlug: string): Lesson | undefined {
  const level = getLevel(levelSlug);
  if (!level) return undefined;
  const index = level.lessons.findIndex((item) => item.slug === lessonSlug);
  return index > 0 ? level.lessons[index - 1] : undefined;
}

export function lessonHref(levelSlug: string, lesson: Pick<Lesson, "slug">) {
  return `/${levelSlug}/${lesson.slug}`;
}

/** Where a lesson starts: its intro video if it has one, otherwise the lesson itself. */
export function lessonEntryHref(levelSlug: string, lesson: Pick<Lesson, "slug" | "introVideo">) {
  return lesson.introVideo ? `${lessonHref(levelSlug, lesson)}/intro` : lessonHref(levelSlug, lesson);
}
