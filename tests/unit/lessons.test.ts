import { describe, expect, it } from "vitest";

import { a1Words } from "../support/a1-words";
import { LEVELS } from "@/data/curriculum";
import { CONDITION_RULES, VOCABULARY_RULES } from "@/lib/pronunciation/rules";

import { WORDS_PER_LESSON, checkAllLessons, crossLessonIssues, stripHarakat } from "../../scripts/lesson-checks";

// Validates every lesson's data and files. Purely local: no Azure, TTS or
// pronunciation API calls. `npm run lessons:status` prints the same checks.
const checks = checkAllLessons();

describe("lesson content", () => {
  it.each(checks.map((check) => [`${check.level}/${check.slug} (${check.glyph})`, check] as const))(
    "%s: words with all fields, rules, speakable text, pictures and intro files",
    (_, check) => {
      expect(check.wordIssues).toEqual([]);
      expect(check.audioIssues).toEqual([]);
      expect(check.pictureIssues).toEqual([]);
      expect(check.introIssues).toEqual([]);
    }
  );

  it(`gives every lesson exactly ${WORDS_PER_LESSON} words`, () => {
    for (const level of LEVELS) for (const lesson of level.lessons) expect(lesson.vocabulary).toHaveLength(WORDS_PER_LESSON);
  });

  it("has no word target equal to a letter-name target or another word, no shared pictures and unique titles", () => {
    expect(crossLessonIssues()).toEqual([]);
  });

  it("merges letter and word rules without throwing and has a word rule for every word", () => {
    const words = [...LEVELS.flatMap((level) => level.lessons.flatMap((lesson) => lesson.vocabulary)), ...a1Words()];
    expect(Object.keys(VOCABULARY_RULES)).toHaveLength(words.length);
    for (const word of words) {
      const conditions = VOCABULARY_RULES[word.exercise.target]?.excellent?.conditions;
      expect(conditions?.[0]).toBe("azure_accuracy >= 70");
      expect(conditions?.[1]).toMatch(/^iqra_phonemes contains \[.+\]$/);
      expect(CONDITION_RULES[word.exercise.target]).toBe(VOCABULARY_RULES[word.exercise.target]);
    }
  });

  it("builds word targets by removing the harakat", () => {
    expect(stripHarakat("بَطَّة")).toBe("بطة");
    expect(stripHarakat("ذِئْب")).toBe("ذئب");
  });
});
