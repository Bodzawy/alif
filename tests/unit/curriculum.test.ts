import { describe, expect, it } from "vitest";

import { LEVELS, allExercises, getLesson, getLevel, lessonEntryHref, lessonExercises, nextLesson, previousLesson } from "@/data/curriculum";
import { ARABIC_LETTERS } from "@/lib/pronunciation/letters";
import { CONDITION_RULES, LETTER_RULES, VOCABULARY_RULES } from "@/lib/pronunciation/rules";
import { ALLOWED_TARGETS, isAllowedTarget, isAllowedTtsText } from "@/lib/pronunciation/targets";
import { existsSync } from "node:fs";
import path from "node:path";

describe("curriculum", () => {
  it("publishes A1 → Lesson 1 with a letter and three vocabulary cards", () => {
    const found = getLesson("a1", "lesson-1");
    expect(found?.level.code).toBe("A1");
    expect(found?.lesson.letter.glyph).toBe("أَ");
    expect(found?.lesson.vocabulary.map((item) => item.exercise.target)).toEqual(["أسد", "أرنب", "أناناس"]);
    expect(getLesson("a1", "lesson-99")).toBeUndefined();
    expect(nextLesson("a1", "lesson-1")?.slug).toBe("lesson-2");
  });

  it("publishes one A1 lesson per letter, in alphabet order; lesson 28 is the last", () => {
    const lessons = getLevel("a1")!.lessons;
    expect(lessons).toHaveLength(28);
    expect(lessons.map((lesson) => lesson.number)).toEqual(Array.from({ length: 28 }, (_, i) => i + 1));
    expect(lessons.map((lesson) => lesson.letter.exercise.target)).toEqual(ARABIC_LETTERS.map((letter) => letter.referenceText));
    expect(nextLesson("a1", "lesson-28")).toBeUndefined();
    expect(previousLesson("a1", "lesson-1")).toBeUndefined();
    expect(previousLesson("a1", "lesson-2")?.slug).toBe("lesson-1");
  });

  it("starts a lesson at its intro video only when it has one", () => {
    expect(lessonEntryHref("a1", getLesson("a1", "lesson-1")!.lesson)).toBe("/a1/lesson-1/intro");
    expect(lessonEntryHref("a1", getLesson("a1", "lesson-2")!.lesson)).toBe("/a1/lesson-2");
  });

  it("no longer serves the vocabulary lesson under A0 (A0 is the alphabet)", () => {
    expect(getLesson("a0", "lesson-1")).toBeUndefined();
    expect(LEVELS.map((level) => level.slug)).toEqual(["a1"]);
  });

  it("gives every exercise condition rules with an 'excellent' rule", () => {
    for (const exercise of allExercises()) {
      expect(CONDITION_RULES[exercise.target]?.excellent, exercise.target).toBeDefined();
      expect(isAllowedTarget(exercise.target)).toBe(true);
      expect(isAllowedTtsText(exercise.modelText)).toBe(true);
    }
  });

  it("uses unique exercise ids within each lesson and existing images", () => {
    for (const level of LEVELS) {
      for (const lesson of level.lessons) {
        const ids = lessonExercises(lesson).map((e) => e.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const item of lesson.vocabulary) {
          expect(existsSync(path.join(process.cwd(), "public", item.image.src)), item.image.src).toBe(true);
        }
        for (const asset of lesson.introVideo ? [lesson.introVideo.src, lesson.introVideo.poster] : []) {
          expect(existsSync(path.join(process.cwd(), "public", asset)), asset).toBe(true);
        }
      }
    }
  });

  it("keeps the letter rules separate from vocabulary rules", () => {
    for (const target of Object.keys(VOCABULARY_RULES)) {
      expect(LETTER_RULES[target]).toBeUndefined();
    }
  });

  it("accepts every letter of the alphabet as a target, like the original API", () => {
    for (const letter of ARABIC_LETTERS) expect(ALLOWED_TARGETS.has(letter.referenceText)).toBe(true);
    expect(isAllowedTarget("hello")).toBe(false);
    expect(isAllowedTarget(null)).toBe(false);
  });

  it("restricts TTS to known lesson texts and feedback cues", () => {
    expect(isAllowedTtsText("مُمْتَاز")).toBe(true);
    expect(isAllowedTtsText("حاول مرة أخرى")).toBe(true);
    expect(isAllowedTtsText("أي نص عشوائي")).toBe(false);
  });
});
