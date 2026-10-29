import { describe, expect, it } from "vitest";

import { allExercises } from "@/data/curriculum";
import { beginnerLetterTokens, spokenLetters, syllableVowel, type RuleFile } from "@/lib/pronunciation/beginner-letters";
import { ARABIC_LETTERS } from "@/lib/pronunciation/letters";
import { BEGINNER_RULES, CONDITION_RULES } from "@/lib/pronunciation/rules";

// beginner_conditions.json (ALIF Speaking): one entry per target of the
// ALIF Pronunciation rules, gentle conditions only, in the engine's syntax:
// every spoken letter, each with the sounds agreed for that letter (the
// condition of the letter's name, e.g. باء: b or p), written by
// scripts/beginner-conditions.ts; a letter with a short vowel (بَ, أَ …) needs its vowel too, in any form.

const KNOWN = [/^iqra_phonemes contains \[('[^']+',?)+\]$/, /^iqra_phonemes is not empty$/];

describe("beginner_conditions.json", () => {
  it("covers the targets of the ALIF Pronunciation rules and nothing else", () => {
    for (const target of Object.keys(BEGINNER_RULES)) expect(CONDITION_RULES[target], target).toBeDefined();
    expect(Object.keys(BEGINNER_RULES).length).toBeGreaterThan(1000);
  });

  it("every spoken letter of the word, each with the sounds agreed for that letter; a syllable's vowel too", () => {
    const rules = BEGINNER_RULES as unknown as RuleFile;
    const spoken = new Map<string, string>();
    for (const exercise of allExercises()) if (!spoken.has(exercise.target)) spoken.set(exercise.target, exercise.modelText);
    const letterNames = new Set(ARABIC_LETTERS.map((letter) => letter.referenceText));
    let words = 0;
    for (const [target, rule] of Object.entries(BEGINNER_RULES)) {
      if (letterNames.has(target)) continue;
      const tokens = rule.excellent!.conditions.flatMap((c) => (/\[(.+)\]$/.exec(c)?.[1] ?? "").replace(/['\s]/g, "").split(",").filter(Boolean));
      const letters = beginnerLetterTokens(syllableVowel(target) ? target : (spoken.get(target) ?? target), rules);
      expect(tokens.length, target).toBe(letters.length);
      letters.forEach(({ alternatives }, i) => {
        for (const alt of alternatives) expect(tokens[i]!.split("|"), `${target}: ${alternatives[0]}`).toContain(alt);
      });
      words++;
    }
    expect(words).toBeGreaterThan(1000);
    // The syllables: the letter and its vowel – every form of it (short, long, emphatic), the three apart.
    const syllable = (target: string) => BEGINNER_RULES[target]!.excellent!.conditions;
    expect(syllable("أَ")).toEqual(["iqra_phonemes contains ['a|aa|A|AA|aah|Aah']"]);
    expect(syllable("إِ")).toEqual(["iqra_phonemes contains ['i|ii|I|II|iey|Iey']"]);
    expect(syllable("أُ")).toEqual(["iqra_phonemes contains ['u|uu|U|UU']"]);
    expect(syllable("بَ")).toEqual(["iqra_phonemes contains ['b|bb|p|pp','a|aa|A|AA|aah|Aah']"]);
    expect(syllable("خُ")).toEqual(["iqra_phonemes contains ['x|xx|H|HH|h|hh','u|uu|U|UU']"]);
    const syllables = Object.keys(BEGINNER_RULES).filter((target) => syllableVowel(target));
    expect(syllables).toHaveLength(84);
    for (const target of syllables) expect(syllable(target).join(), target).toMatch(/'(a|i|u)\|/);
    expect(BEGINNER_RULES["بيت"]!.excellent!.conditions).toEqual(["iqra_phonemes contains ['b|bb|p|pp','y|yy','t|tt|T|TT|s']"]);
    // Sounds added by hand stay (تين: t or d, f, s, k; its n or m).
    expect(BEGINNER_RULES["تين"]!.excellent!.conditions).toEqual(["iqra_phonemes contains ['t|tt|T|TT|s|d|dd|f|ff|k','n|nn|m|mm']"]);
    // Not checked: the Hamza, long vowels, the ل of ال before a sun letter; ث and ف are two letters.
    expect(spokenLetters("أَمِيرٌ")).toEqual(["م", "ر"]);
    expect(spokenLetters("الشَّمْسُ")).toEqual(["ش", "م", "س"]);
    expect(spokenLetters("صَبَاحُ الْخَيْرِ")).toEqual(["ص", "ب", "ح", "ل", "خ", "ي", "ر"]);
    expect(BEGINNER_RULES["ثلاثة آلاف"]!.excellent!.conditions).toEqual(["iqra_phonemes contains ['f|ff|v|vv|s|ss|t|tt','l|ll','f|ff|v|vv']"]);
    // The letters: the sounds a beginner says instead count too (ب p, ت s, ج g, ذ z, ر g / x, غ j).
    const letter = (name: string) => BEGINNER_RULES[name]!.excellent!.conditions;
    expect(letter("باء")).toEqual(["iqra_phonemes contains ['b|bb|p|pp']"]);
    expect(letter("تاء")).toEqual(["iqra_phonemes contains ['t|tt|T|TT|s']"]);
    expect(letter("جيم")).toEqual(["iqra_phonemes contains ['j|jj|g|gg','m|mm']"]);
    expect(letter("ذال")).toEqual(["iqra_phonemes contains ['*|z|Z']"]);
    expect(letter("راء")).toEqual(["iqra_phonemes contains ['r|rr|g|gg|x|xx']"]);
    expect(letter("غين")).toEqual(["iqra_phonemes contains ['g|gg|x|xx|j','y|yy']"]);
  });

  it("every target: excellent first, then needs_improvement; only gentle conditions the engine knows", () => {
    for (const [target, rules] of Object.entries(BEGINNER_RULES)) {
      expect(Object.keys(rules), target).toEqual(["excellent", "needs_improvement"]);
      for (const rule of Object.values(rules)) {
        expect(rule.message, target).toBeTruthy();
        for (const condition of rule.conditions) {
          expect(KNOWN.some((pattern) => pattern.test(condition)), `${target}: ${condition}`).toBe(true);
        }
      }
    }
  });
});
