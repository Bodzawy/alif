import { describe, expect, it } from "vitest";

import { evaluateLetterConditions, initialVowel, matchesCondition } from "@/lib/pronunciation/condition-engine";
import { LETTER_RULES } from "@/lib/pronunciation/rules";

const ctx = (azureAccuracy: number, iqraPhonemes: string[] = [], azureRecognized = "") => ({
  azureAccuracy,
  azureRecognized,
  iqraPhonemes,
});

describe("condition engine – original behaviour", () => {
  // The two cases from the original repository's tests.
  it("selects the ثاء feedback based on Azure and IQRA results", () => {
    expect(evaluateLetterConditions({ target: "ثاء", ...ctx(84, ["f", "aa"], "ثاء") })).toMatchObject({ rule: "excellent" });
    expect(evaluateLetterConditions({ target: "ثاء", ...ctx(84, ["s", "aa"], "ثاء") })).toMatchObject({ rule: "said_sin" });
    expect(evaluateLetterConditions({ target: "ثاء", ...ctx(62, ["f", "aa"], "ثاء") })).toMatchObject({ rule: "wrong" });
  });

  it("passes ألف on Azure accuracy alone", () => {
    expect(evaluateLetterConditions({ target: "ألف", ...ctx(81, [], "أَلِف.") })).toMatchObject({ rule: "excellent" });
    expect(evaluateLetterConditions({ target: "ألف", ...ctx(69) })).toMatchObject({ rule: "correct_letter_needs_improvement" });
  });

  it("uses 70 as an inclusive threshold", () => {
    expect(evaluateLetterConditions({ target: "ألف", ...ctx(70) })?.rule).toBe("excellent");
    expect(evaluateLetterConditions({ target: "باء", ...ctx(70, ["b"]) })?.rule).toBe("excellent");
    expect(evaluateLetterConditions({ target: "باء", ...ctx(69, ["b"]) })?.rule).toBe("wrong");
  });

  it("returns null when no rule matches (e.g. good accuracy but missing phonemes)", () => {
    expect(evaluateLetterConditions({ target: "باء", ...ctx(90, []) })).toBeNull();
    expect(evaluateLetterConditions({ target: "قاف", ...ctx(90, ["g"]) })).toBeNull();
  });

  it("returns null for unknown targets", () => {
    expect(evaluateLetterConditions({ target: "xyz", ...ctx(99) })).toBeNull();
  });

  it("keeps rule order: the first matching rule wins", () => {
    // Both "excellent" (contains q) and "said_kaf" (contains k) hold → excellent comes first.
    expect(evaluateLetterConditions({ target: "قاف", ...ctx(90, ["q", "k"]) })?.rule).toBe("excellent");
    expect(evaluateLetterConditions({ target: "قاف", ...ctx(90, ["k", "aa"]) })?.rule).toBe("said_kaf");
  });

  it("handles 'does not contain' and multi-phoneme lists", () => {
    expect(evaluateLetterConditions({ target: "جيم", ...ctx(80, ["j", "ii", "m"]) })?.rule).toBe("excellent");
    expect(evaluateLetterConditions({ target: "جيم", ...ctx(80, ["j", "ii"]) })?.rule).toBe("needs_improvement");
    expect(evaluateLetterConditions({ target: "غين", ...ctx(80, ["d"]) })?.rule).toBe("said_jeem");
    expect(evaluateLetterConditions({ target: "غين", ...ctx(80, ["x"]) })?.rule).toBe("needs_improvement");
    expect(evaluateLetterConditions({ target: "ذال", ...ctx(80, ["z", "aa"]) })?.rule).toBe("said_zay");
    expect(evaluateLetterConditions({ target: "ذال", ...ctx(80, ["*", "aa"]) })?.rule).toBe("excellent");
  });

  it("is case-sensitive for phonemes (H ≠ h)", () => {
    expect(evaluateLetterConditions({ target: "حاء", ...ctx(80, ["H"]) })?.rule).toBe("excellent");
    expect(evaluateLetterConditions({ target: "حاء", ...ctx(80, ["h"]) })?.rule).toBe("said_haa");
    expect(evaluateLetterConditions({ target: "هاء", ...ctx(80, ["H"]) })?.rule).toBe("said_haa");
  });

  it("returns the configured message and conditions", () => {
    const result = evaluateLetterConditions({ target: "صاد", ...ctx(75, ["s", "aa"]) });
    expect(result).toEqual({
      rule: "said_sin",
      message: LETTER_RULES["صاد"]!.said_sin!.message,
      conditions: LETTER_RULES["صاد"]!.said_sin!.conditions,
    });
  });

  it("supports every operator and azure_recognized with harakat/punctuation normalised", () => {
    expect(matchesCondition("azure_accuracy > 50", ctx(51))).toBe(true);
    expect(matchesCondition("azure_accuracy <= 50", ctx(50))).toBe(true);
    expect(matchesCondition("azure_accuracy == 50", ctx(50))).toBe(true);
    expect(matchesCondition("azure_accuracy != 50", ctx(50))).toBe(false);
    expect(matchesCondition("azure_recognized == ألف", ctx(0, [], "أَلِف."))).toBe(true);
    expect(matchesCondition("azure_recognized != ألف", ctx(0, [], "باء"))).toBe(true);
    expect(matchesCondition("unknown_condition", ctx(100))).toBe(false);
  });

  it("accepts alternatives inside a phoneme list (Alif addition for shadda and r/rr)", () => {
    expect(matchesCondition("iqra_phonemes contains ['b','T|TT']", ctx(0, ["b", "a", "TT", "a"]))).toBe(true);
    expect(matchesCondition("iqra_phonemes contains ['b','T|TT']", ctx(0, ["b", "a", "T", "a"]))).toBe(true);
    expect(matchesCondition("iqra_phonemes contains ['b','T|TT']", ctx(0, ["b", "a", "t", "a"]))).toBe(false);
    expect(matchesCondition("iqra_phonemes does not contain ['b','T|TT']", ctx(0, ["b", "a", "t"]))).toBe(true);
    expect(matchesCondition("iqra_phonemes does not contain ['b','T|TT']", ctx(0, ["b", "TT"]))).toBe(false);
  });

  it("checks whether IQRA returned any phonemes (Alif addition)", () => {
    expect(matchesCondition("iqra_phonemes is not empty", ctx(0, ["a"]))).toBe(true);
    expect(matchesCondition("iqra_phonemes is not empty", ctx(0, []))).toBe(false);
  });

  it("covers all 28 letters, each with an 'excellent' rule reachable from its own phonemes", () => {
    expect(Object.keys(LETTER_RULES)).toHaveLength(28);
    for (const [target, rules] of Object.entries(LETTER_RULES)) {
      const excellent = rules.excellent;
      expect(excellent, target).toBeDefined();
      const phonemes = excellent!.conditions
        .map((c) => c.match(/^iqra_phonemes\s+contains\s+(.+)$/)?.[1])
        .filter(Boolean)
        .flatMap((list) => list!.replace(/[\[\]'\s]/g, "").split(","));
      expect(evaluateLetterConditions({ target, ...ctx(95, phonemes) })?.rule, target).toBe("excellent");
    }
  });
});

describe("condition engine – iqra_initial_vowel (A1 words that begin with أَ / إِ / أُ)", () => {
  it("reads the vowel right after the initial hamza in real IQRA output", () => {
    // Recorded from the real IQRA service (A1 · Lesson 1 audio).
    expect(initialVowel(["<", "aa", "b", "a"])).toBe("a"); // أَب
    expect(initialVowel(["<", "a", "m", "ii", "r"])).toBe("a"); // أَمِير
    expect(initialVowel(["<", "i", "S", "b", "a", "E"])).toBe("i"); // إِصْبَع
    expect(initialVowel(["<", "u", "*", "u", "n", "aa"])).toBe("u"); // أُذُن
    expect(initialVowel(["h", "uu"])).toBe("u"); // أُ – hamza heard as h
    expect(initialVowel(["a", "m", "ii", "r"])).toBe("a"); // no hamza token
    expect(initialVowel(["<<", "I", "b"])).toBe("i"); // doubled hamza, emphatic vowel
    expect(initialVowel(["<", "UU", "s"])).toBe("u");
  });

  it("never takes a vowel from a later syllable when the initial vowel is missing", () => {
    expect(initialVowel(["b", "r", "a"])).toBeNull(); // إِبْرَة without its i
    expect(initialVowel(["<", "*", "u", "n"])).toBeNull(); // أَذُن: the u belongs to ذُن
    expect(initialVowel(["E", "i", "n"])).toBeNull(); // ع is a consonant, not hamza
    expect(initialVowel(["<"])).toBeNull();
    expect(initialVowel([])).toBeNull();
  });

  it("== / != compare the vowel quality", () => {
    const heard = (...phonemes: string[]) => ctx(90, phonemes);
    expect(matchesCondition("iqra_initial_vowel == u", heard("<", "u", "*", "u", "n"))).toBe(true);
    expect(matchesCondition("iqra_initial_vowel == u", heard("<", "a", "*", "u", "n"))).toBe(false);
    expect(matchesCondition("iqra_initial_vowel == u", heard("<", "i", "*", "u", "n"))).toBe(false);
    expect(matchesCondition("iqra_initial_vowel == u", heard("<", "*", "u", "n"))).toBe(false);
    expect(matchesCondition("iqra_initial_vowel != u", heard("<", "a", "*", "u", "n"))).toBe(true);
    expect(matchesCondition("iqra_initial_vowel != a", heard())).toBe(true);
    expect(matchesCondition("iqra_initial_vowel == e", heard("e"))).toBe(false); // only a / i / u are valid
  });

  it("is not used by any letter rule (letters behave exactly as in Masaar)", () => {
    for (const rules of Object.values(LETTER_RULES)) {
      for (const condition of Object.values(rules).flatMap((rule) => rule.conditions)) expect(condition).not.toContain("iqra_initial_vowel");
    }
  });
});
