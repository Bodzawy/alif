import { describe, expect, it } from "vitest";

import { evaluateLetterConditions, matchesCondition } from "@/lib/pronunciation/condition-engine";
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
