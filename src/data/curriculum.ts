import type { Lesson, Level, PronunciationExercise } from "@/data/types";
import { lesson1 } from "@/data/lessons/a1/lesson-1";
import { lesson2 } from "@/data/lessons/a1/lesson-2";
import { lesson3 } from "@/data/lessons/a1/lesson-3";
import { lesson4 } from "@/data/lessons/a1/lesson-4";
import { lesson5 } from "@/data/lessons/a1/lesson-5";
import { lesson6 } from "@/data/lessons/a1/lesson-6";
import { lesson7 } from "@/data/lessons/a1/lesson-7";
import { lesson8 } from "@/data/lessons/a1/lesson-8";
import { lesson9 } from "@/data/lessons/a1/lesson-9";
import { lesson10 } from "@/data/lessons/a1/lesson-10";
import { lesson11 } from "@/data/lessons/a1/lesson-11";
import { lesson12 } from "@/data/lessons/a1/lesson-12";
import { lesson13 } from "@/data/lessons/a1/lesson-13";
import { lesson14 } from "@/data/lessons/a1/lesson-14";
import { lesson15 } from "@/data/lessons/a1/lesson-15";
import { lesson16 } from "@/data/lessons/a1/lesson-16";
import { lesson17 } from "@/data/lessons/a1/lesson-17";
import { lesson18 } from "@/data/lessons/a1/lesson-18";
import { lesson19 } from "@/data/lessons/a1/lesson-19";
import { lesson20 } from "@/data/lessons/a1/lesson-20";
import { lesson21 } from "@/data/lessons/a1/lesson-21";
import { lesson22 } from "@/data/lessons/a1/lesson-22";
import { lesson23 } from "@/data/lessons/a1/lesson-23";
import { lesson24 } from "@/data/lessons/a1/lesson-24";
import { lesson25 } from "@/data/lessons/a1/lesson-25";
import { lesson26 } from "@/data/lessons/a1/lesson-26";
import { lesson27 } from "@/data/lessons/a1/lesson-27";
import { lesson28 } from "@/data/lessons/a1/lesson-28";

// Registry of the lesson-based (vocabulary) levels. Add a lesson by creating a
// data file under src/data/lessons/<level>/ and listing it here.
// A0 – the alphabet – is a separate kind of level, see src/data/alphabet.ts.
export const LEVELS: Level[] = [
  {
    slug: "a1",
    code: "A1",
    title: "Erste Wörter",
    description: "Erste arabische Wörter hören, nachsprechen und verstehen – mit Bildern und deutscher Übersetzung.",
    // One lesson per letter, in alphabet order.
    lessons: [
      lesson1, lesson2, lesson3, lesson4, lesson5, lesson6, lesson7,
      lesson8, lesson9, lesson10, lesson11, lesson12, lesson13, lesson14,
      lesson15, lesson16, lesson17, lesson18, lesson19, lesson20, lesson21,
      lesson22, lesson23, lesson24, lesson25, lesson26, lesson27, lesson28,
    ],
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
