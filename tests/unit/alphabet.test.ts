import { beforeEach, describe, expect, it } from "vitest";

import { ALPHABET, ALPHABET_LEVEL, alphabetLetterHref, getAlphabetLetter } from "@/data/alphabet";
import { alphabetSummary, letterStatuses } from "@/lib/alphabet-progress";
import { getLessonProgress, markExercisePassed, markExerciseSkipped } from "@/lib/progress";
import { isAllowedTarget, isAllowedTtsText } from "@/lib/pronunciation/targets";
import { LETTER_RULES } from "@/lib/pronunciation/rules";

const EXPECTED_ORDER = "أ ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي".split(" ");
const EXPECTED_NAMES = "أَلِف بَاء تَاء ثَاء جِيم حَاء خَاء دَال ذَال رَاء زَاي سِين شِين صَاد ضَاد طَاء ظَاء عَيْن غَيْن فَاء قَاف كَاف لَام مِيم نُون هَاء وَاو يَاء".split(" ");
const IDS = ALPHABET.map((letter) => letter.id);

describe("A0 alphabet data", () => {
  it("contains all 28 letters in the agreed order", () => {
    expect(ALPHABET).toHaveLength(28);
    expect(ALPHABET.map((letter) => letter.glyph)).toEqual(EXPECTED_ORDER);
    expect(ALPHABET.map((letter) => letter.position)).toEqual(Array.from({ length: 28 }, (_, i) => i + 1));
  });

  it("shows the correct Arabic name for every letter", () => {
    expect(ALPHABET.map((letter) => letter.modelText)).toEqual(EXPECTED_NAMES);
  });

  it("evaluates every letter with its Masaar letter rules and speaks its name via /api/tts", () => {
    for (const letter of ALPHABET) {
      expect(letter.exercise.target).toBe(letter.referenceText);
      expect(LETTER_RULES[letter.exercise.target]?.excellent, letter.id).toBeDefined();
      expect(isAllowedTarget(letter.exercise.target), letter.id).toBe(true);
      expect(letter.exercise.modelText).toBe(letter.modelText);
      expect(isAllowedTtsText(letter.exercise.modelText), letter.id).toBe(true);
    }
  });

  it("has one practice route per letter", () => {
    expect(alphabetLetterHref("alif")).toBe("/a0/letters/alif");
    expect(alphabetLetterHref("yaa")).toBe("/a0/letters/yaa");
    expect(new Set(IDS).size).toBe(28);
    expect(getAlphabetLetter("nope")).toBeUndefined();
    expect(ALPHABET_LEVEL.slug).toBe("a0");
  });

  it("contains no vocabulary", () => {
    for (const letter of ALPHABET) {
      expect(Object.keys(letter).sort()).toEqual(["exercise", "glyph", "id", "letter", "modelText", "position", "referenceText"]);
    }
  });
});

describe("A0 progression", () => {
  it("starts with only the first letter available", () => {
    const statuses = letterStatuses(IDS, { passed: [] });
    expect(statuses.alif).toBe("available");
    expect(IDS.slice(1).every((id) => statuses[id] === "locked")).toBe(true);
  });

  it("unlocks the next letter only after mastery", () => {
    expect(letterStatuses(IDS, { passed: ["alif"] })).toMatchObject({ alif: "mastered", baa: "available", taa: "locked" });
  });

  it("a skip opens the next letter but never counts as mastered", () => {
    const summary = alphabetSummary(IDS, { passed: ["alif"], skipped: ["baa"] });
    expect(summary.statuses).toMatchObject({ alif: "mastered", baa: "skipped", taa: "available", thaa: "locked" });
    expect(summary.masteredCount).toBe(1);
    expect(summary.notMastered).toEqual(["baa"]);
    expect(summary.nextToPractice).toBe("taa");
  });

  it("mastering a skipped letter later replaces the skip", () => {
    expect(letterStatuses(IDS, { passed: ["alif", "baa"], skipped: ["baa"] }).baa).toBe("mastered");
  });

  it("is complete only when all 28 letters are mastered", () => {
    const allButOne = alphabetSummary(IDS, { passed: IDS.slice(0, 27), skipped: ["yaa"] });
    expect(allButOne.reachedEnd).toBe(true);
    expect(allButOne.complete).toBe(false);
    expect(allButOne.notMastered).toEqual(["yaa"]);

    const all = alphabetSummary(IDS, { passed: [...IDS] });
    expect(all.complete).toBe(true);
    expect(all.reachedEnd).toBe(true);
    expect(all.nextToPractice).toBeUndefined();
  });
});

describe("progress storage for skips", () => {
  beforeEach(() => window.localStorage.clear());

  it("records skips separately and ignores skips of mastered letters", () => {
    const key = ALPHABET_LEVEL.progressKey;
    markExerciseSkipped(key, "baa");
    markExerciseSkipped(key, "baa");
    expect(getLessonProgress(key)).toEqual({ passed: [], skipped: ["baa"] });

    markExercisePassed(key, "alif");
    markExerciseSkipped(key, "alif");
    expect(getLessonProgress(key)).toEqual({ passed: ["alif"], skipped: ["baa"] });
  });
});
