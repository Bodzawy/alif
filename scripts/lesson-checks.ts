// Content checks for every lesson, shared by tests/unit/lessons.test.ts and
// `npm run lessons:status`. Reads only local data and files – never calls
// Azure, TTS or the pronunciation API.
import { existsSync } from "node:fs";
import path from "node:path";

import { LEVELS } from "@/data/curriculum";
import type { Lesson } from "@/data/types";
import { ARABIC_LETTERS } from "@/lib/pronunciation/letters";
import { CONDITION_RULES, LETTER_RULES } from "@/lib/pronunciation/rules";
import { isAllowedTarget, isAllowedTtsText } from "@/lib/pronunciation/targets";

export const WORDS_PER_LESSON = 3;

const HARAKAT = /[\u064B-\u0652\u0670]/g;
const HAS_HARAKA = /[\u064B-\u0652\u0670]/;
const PUBLIC_DIR = path.join(process.cwd(), "public");

export type LessonCheck = {
  level: string;
  number: number;
  slug: string;
  glyph: string;
  name: string;
  /** Problems with the words' data (count, fields, harakat, targets, rules). */
  wordIssues: string[];
  /** Problems with "Anhören" (text not speakable through /api/tts). */
  audioIssues: string[];
  /** Missing picture files. */
  pictureIssues: string[];
  introVideo: boolean;
  introIssues: string[];
};

function publicFileExists(src: string) {
  return src.startsWith("/") && existsSync(path.join(PUBLIC_DIR, src));
}

export function stripHarakat(text: string) {
  return text.replace(HARAKAT, "");
}

function checkLesson(levelSlug: string, lesson: Lesson): LessonCheck {
  const wordIssues: string[] = [];
  const audioIssues: string[] = [];
  const pictureIssues: string[] = [];
  const introIssues: string[] = [];

  if (lesson.vocabulary.length !== WORDS_PER_LESSON) {
    wordIssues.push(`${lesson.vocabulary.length} words instead of ${WORDS_PER_LESSON}`);
  }
  const letterExercise = lesson.letter.exercise;
  if (!CONDITION_RULES[letterExercise.target]) wordIssues.push(`letter target ${letterExercise.target} has no rules`);
  if (!isAllowedTtsText(letterExercise.modelText)) audioIssues.push(`letter ${letterExercise.modelText} not speakable`);
  for (const field of ["glyph", "name", "nameArabic", "transliteration", "soundHint"] as const) {
    if (!lesson.letter[field]?.trim()) wordIssues.push(`letter.${field} is empty`);
  }

  for (const word of lesson.vocabulary) {
    const label = word.id || "(no id)";
    for (const field of ["id", "arabic", "german", "transliteration"] as const) {
      if (!word[field]?.trim()) wordIssues.push(`${label}: ${field} is empty`);
    }
    if (!/^(der|die|das) /.test(word.german)) wordIssues.push(`${label}: German meaning without article`);
    if (!HAS_HARAKA.test(word.arabic)) wordIssues.push(`${label}: Arabic is not voweled`);
    if (word.exercise.id !== word.id) wordIssues.push(`${label}: exercise id differs from word id`);
    if (word.exercise.modelText !== word.arabic) wordIssues.push(`${label}: modelText differs from the shown word`);
    if (word.exercise.target !== stripHarakat(word.arabic)) wordIssues.push(`${label}: target is not the unvoweled word`);
    if (!stripHarakat(word.arabic).startsWith(stripHarakat(lesson.letter.glyph))) {
      wordIssues.push(`${label}: does not start with ${lesson.letter.glyph}`);
    }
    if (!isAllowedTarget(word.exercise.target)) wordIssues.push(`${label}: no pronunciation rules for ${word.exercise.target}`);
    if (!isAllowedTtsText(word.exercise.modelText)) audioIssues.push(`${label}: not speakable through /api/tts`);
    if (!word.image.alt.trim()) pictureIssues.push(`${label}: picture has no alt text`);
    if (!publicFileExists(word.image.src)) pictureIssues.push(`${label}: missing ${word.image.src}`);
  }

  if (lesson.introVideo) {
    for (const src of [lesson.introVideo.src, lesson.introVideo.poster]) {
      if (!publicFileExists(src)) introIssues.push(`missing ${src}`);
    }
  }

  return {
    level: levelSlug,
    number: lesson.number,
    slug: lesson.slug,
    glyph: lesson.letter.glyph,
    name: lesson.letter.name,
    wordIssues,
    audioIssues,
    pictureIssues,
    introVideo: Boolean(lesson.introVideo),
    introIssues,
  };
}

export function checkAllLessons(): LessonCheck[] {
  return LEVELS.flatMap((level) => level.lessons.map((lesson) => checkLesson(level.slug, lesson)));
}

/** Problems that span lessons: duplicate targets, ids, titles. */
export function crossLessonIssues(): string[] {
  const issues: string[] = [];
  const letterTargets = new Set([...ARABIC_LETTERS.map((letter) => letter.referenceText), ...Object.keys(LETTER_RULES)]);
  const seenTargets = new Map<string, string>();
  const seenImages = new Map<string, string>();
  const seenTitles = new Map<string, string>();

  for (const level of LEVELS) {
    for (const lesson of level.lessons) {
      const where = `${level.slug}/${lesson.slug}`;
      const title = seenTitles.get(lesson.title);
      if (title) issues.push(`title "${lesson.title}" used by ${title} and ${where}`);
      seenTitles.set(lesson.title, where);

      for (const word of lesson.vocabulary) {
        const target = word.exercise.target;
        if (letterTargets.has(target)) issues.push(`${where} ${word.id}: target ${target} equals a letter-name target`);
        const other = seenTargets.get(target);
        if (other) issues.push(`${where} ${word.id}: target ${target} already used by ${other}`);
        seenTargets.set(target, `${where} ${word.id}`);

        const image = seenImages.get(word.image.src);
        if (image) issues.push(`${where} ${word.id}: picture ${word.image.src} already used by ${image}`);
        seenImages.set(word.image.src, `${where} ${word.id}`);
      }
    }
  }
  return issues;
}
