import { describe, expect, it } from "vitest";

import { a1Entries } from "@/data/a1";
import { unvocalised } from "@/data/a1/letter-lesson";
import type { A1Word } from "@/data/types";
import { withTanwin } from "@/lib/arabic/tanwin";
import { hasRulesFor } from "@/lib/pronunciation/rules";
import { isAllowedTtsText } from "@/lib/pronunciation/targets";
import { buildSsml } from "@/lib/tts/ssml";

const TANWIN = /[ً-ٍ]/;

describe("withTanwin", () => {
  it.each([
    ["بَيْت", "بَيْتٌ"],
    ["بِطَاقَة", "بِطَاقَةٌ"],
    ["أُمّ", "أُمٌّ"],
    ["جُنْدِيّ", "جُنْدِيٌّ"],
    ["دَوَاء", "دَوَاءٌ"],
    ["ظَبْي", "ظَبْيٌ"],
    ["فُرْشَاة", "فُرْشَاةٌ"],
    ["مُسْتَشْفَى", "مُسْتَشْفًى"],
    // The Nisba and خَسّ get their Shadda back.
    ["هِنْدِي", "هِنْدِيٌّ"],
    ["خَس", "خَسٌّ"],
  ])("%s → %s", (word, spoken) => {
    expect(withTanwin(word)).toBe(spoken);
  });

  it.each([
    ["أَنَا", "pronoun"],
    ["الْيُونَان", "article"],
    ["الصِّين", "article"],
    ["دِينَا", "name ending in ا"],
    ["لِمَاذَا؟", "question word"],
    ["رَادْيُو", "indeclinable loanword (long ū)"],
    ["شِيبْسِي", "indeclinable loanword (long ī)"],
    ["هُدَى", "female name"],
    ["وِئَام", "female name"],
    ["طَمَاطِم", "diptote pattern"],
    ["زُمَلَاء", "diptote (ـَاء of the feminine)"],
    ["كِتَابٌ", "already with Tanwin"],
  ])("%s stays as it is (%s)", (word) => {
    expect(withTanwin(word)).toBe(word);
  });
});

/** Every word of "Wörter" in an A1 letter entry. */
const letterWords = (): Array<{ entry: string; word: A1Word }> =>
  a1Entries()
    .filter(({ lesson }) => lesson.kind === "letter")
    .flatMap(({ unit, lesson }) =>
      lesson.steps.flatMap((step) =>
        step.kind === "sound-words" || step.kind === "words" ? step.groups.flatMap((g) => g.words.map((word) => ({ entry: `${unit.slug}/${lesson.slug}`, word }))) : []
      )
    );

describe("A1 letter entries: Wörter are spoken with Tanwin", () => {
  const words = letterWords();

  it("covers every letter entry with words", () => {
    expect(new Set(words.map((w) => w.entry)).size).toBe(29);
    expect(words).toHaveLength(259);
  });

  it("only the model audio changes: the shown word and the pronunciation target stay pausal", () => {
    for (const { entry, word } of words) {
      const label = `${entry} ${word.id}`;
      expect(word.exercise.modelText, label).toBe(withTanwin(word.arabic));
      expect(TANWIN.test(word.arabic), label).toBe(false);
      expect(word.exercise.target, label).toBe(unvocalised(word.arabic).replace(/[؟?]/g, ""));
      expect(hasRulesFor(word.exercise.target), label).toBe(true);
    }
  });

  it("every word with Tanwin can be spoken through /api/tts (and is what Azure receives)", () => {
    for (const { word } of words) {
      expect(isAllowedTtsText(word.exercise.modelText), word.id).toBe(true);
      expect(buildSsml(word.exercise.modelText)).toContain(word.exercise.modelText);
    }
  });

  it("the words without Tanwin are exactly the ones that cannot take it", () => {
    expect(words.filter(({ word }) => !TANWIN.test(word.exercise.modelText)).map(({ word }) => word.arabic)).toEqual([
      "أَنَا",
      "دِينَا",
      "وِئَام",
      "يُسْرَا",
      "الْيُونَان",
      "رَادْيُو",
      "زُمَلَاء",
      "شِيبْسِي",
      "الصِّين",
      "كِيلُو",
      "لِمَاذَا؟",
      "هُدَى",
      "طَمَاطِم",
    ]);
  });
});
