import { describe, expect, it } from "vitest";

import { LEVELS, allExercises, getLesson, getLevel, lessonEntryHref, lessonExercises, nextLesson, previousLesson } from "@/data/curriculum";
import { ARABIC_LETTERS } from "@/lib/pronunciation/letters";
import { CONDITION_RULES, LETTER_RULES, VOCABULARY_RULES } from "@/lib/pronunciation/rules";
import { ALLOWED_TARGETS, isAllowedTarget, isAllowedTtsText } from "@/lib/pronunciation/targets";
import { existsSync } from "node:fs";
import path from "node:path";

describe("curriculum", () => {
  it("publishes A0 → Wörter → Lesson 1 with a letter and three vocabulary cards", () => {
    const found = getLesson("a0/words", "lesson-1");
    expect(found?.level.code).toBe("A0 · Wörter");
    expect(found?.lesson.letter.glyph).toBe("أَ");
    expect(found?.lesson.vocabulary.map((item) => item.exercise.target)).toEqual(["أسد", "أرنب", "أناناس"]);
    expect(getLesson("a0/words", "lesson-99")).toBeUndefined();
    expect(nextLesson("a0/words", "lesson-1")?.slug).toBe("lesson-2");
  });

  it("publishes one A0 word lesson per letter, in alphabet order; lesson 28 is the last", () => {
    const lessons = getLevel("a0/words")!.lessons;
    expect(lessons).toHaveLength(28);
    expect(lessons.map((lesson) => lesson.number)).toEqual(Array.from({ length: 28 }, (_, i) => i + 1));
    expect(lessons.map((lesson) => lesson.letter.exercise.target)).toEqual(ARABIC_LETTERS.map((letter) => letter.referenceText));
    expect(nextLesson("a0/words", "lesson-28")).toBeUndefined();
    expect(previousLesson("a0/words", "lesson-1")).toBeUndefined();
    expect(previousLesson("a0/words", "lesson-2")?.slug).toBe("lesson-1");
  });

  it("has intro videos for Alif, Ba, Ta, Tha, Dschim, Ḥa, Cha, Dal and Dhal, without invented chapters", () => {
    const withVideo = getLevel("a0/words")!.lessons.filter((lesson) => lesson.introVideo);
    expect(withVideo.map((lesson) => lesson.letter.glyph)).toEqual(["أَ", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ"]);
    // Video files keep their asset paths (served by nginx from /var/www/alif-videos).
    for (const lesson of withVideo.slice(1)) {
      expect(lesson.introVideo).toEqual({ src: `/videos/a1/${lesson.slug}/de.mp4`, poster: `/videos/a1/${lesson.slug}/poster.jpg` });
    }
  });

  it("starts a lesson at its intro video only when it has one", () => {
    expect(lessonEntryHref("a0/words", getLesson("a0/words", "lesson-1")!.lesson)).toBe("/a0/words/lesson-1/intro");
    for (const n of [2, 3, 4, 5, 6, 7, 8, 9]) expect(lessonEntryHref("a0/words", getLesson("a0/words", `lesson-${n}`)!.lesson)).toBe(`/a0/words/lesson-${n}/intro`);
    expect(lessonEntryHref("a0/words", getLesson("a0/words", "lesson-10")!.lesson)).toBe("/a0/words/lesson-10");
  });

  it("serves the former A1 word lessons only under A0 → Wörter (A1 is the new curriculum in src/data/a1)", () => {
    expect(LEVELS.map((level) => level.slug)).toEqual(["a0/words"]);
    expect(getLesson("a0", "lesson-1")).toBeUndefined();
    expect(getLesson("a1", "lesson-1")).toBeUndefined();
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
