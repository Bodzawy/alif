import { describe, expect, it } from "vitest";

import { buildAssessment, discriminationScore, hasUsableAzureScores, NO_MATCHING_RULE } from "@/lib/pronunciation/assessment";
import { LETTER_RULES, VOCABULARY_RULES } from "@/lib/pronunciation/rules";
import type { AzureAssessment } from "@/lib/pronunciation/types";

function azure(overrides: Partial<AzureAssessment> = {}): AzureAssessment & { accuracy: number; pronunciation: number } {
  return {
    referenceText: "باء",
    recognized: "باء.",
    accuracy: 88,
    pronunciation: 85,
    fluency: 90,
    completeness: 100,
    firstSoundScore: 80,
    words: [],
    ...overrides,
  } as AzureAssessment & { accuracy: number; pronunciation: number };
}

describe("buildAssessment", () => {
  it("ALIF Speaking: Azure's minimum scores alone decide, for any target and any IQRA answer", () => {
    for (const target of ["باء", "أَ", "أُ"]) {
      const right = buildAssessment({ target, primary: azure({ accuracy: 65, firstSoundScore: 30 }), iqra: null, track: "speaking" });
      expect(right).toMatchObject({ passed: true, failureReason: null, feedback: { rule: "excellent", message: "ممتاز 👏" } });
      expect(right.conditionEvaluation).toMatchObject({ matchedRule: "excellent", conditions: [] });
      // Phonemes ALIF Pronunciation would reject change nothing here.
      expect(buildAssessment({ target, primary: azure(), iqra: { phonemes: ["s", "ii"] }, track: "speaking" }).passed).toBe(true);
    }
    expect(buildAssessment({ target: "باء", primary: azure({ accuracy: 64 }), iqra: null, track: "speaking" })).toMatchObject({
      passed: false,
      failureReason: "low_accuracy",
      feedback: { rule: "needs_improvement", message: "حاول مرة أخرى" },
    });
    expect(buildAssessment({ target: "باء", primary: azure({ firstSoundScore: 29 }), iqra: null, track: "speaking" })).toMatchObject({
      passed: false,
      failureReason: "weak_first_sound",
    });
  });

  it("passes only when the matched rule is 'excellent'", () => {
    const result = buildAssessment({ target: "باء", primary: azure(), iqra: { phonemes: ["b", "aa"] } });
    expect(result.passed).toBe(true);
    expect(result.failureReason).toBeNull();
    expect(result.feedback).toEqual({ rule: "excellent", message: LETTER_RULES["باء"]!.excellent!.message });
    expect(result.conditionEvaluation).toMatchObject({ matchedRule: "excellent", iqraPhonemes: ["b", "aa"], azureAccuracy: 88 });
    expect(result.details).not.toHaveProperty("masaar");
  });

  it("fails with rule_not_matched when a non-excellent rule matches despite good legacy scores", () => {
    const result = buildAssessment({ target: "ثاء", primary: azure({ referenceText: "ثاء" }), iqra: { phonemes: ["s", "aa"] } });
    expect(result.passed).toBe(false);
    expect(result.failureReason).toBe("rule_not_matched");
    expect(result.conditionEvaluation.matchedRule).toBe("said_sin");
  });

  it("keeps the accuracy failure reason and rejects a non-excellent rule", () => {
    expect(buildAssessment({ target: "باء", primary: azure({ accuracy: 60 }), iqra: { phonemes: ["b"] } }).failureReason).toBe("low_accuracy");
    const wrong = buildAssessment({ target: "باء", primary: azure({ accuracy: 68, firstSoundScore: 40 }), iqra: { phonemes: ["b"] } });
    expect(wrong.failureReason).toBe("rule_not_matched");
    expect(wrong.conditionEvaluation.matchedRule).toBe("wrong");
    expect(wrong.passed).toBe(false);
  });

  it("passes an excellent rule when first sound is at least 30", () => {
    const result = buildAssessment({ target: "باء", primary: azure({ accuracy: 75, firstSoundScore: 40 }), iqra: { phonemes: ["b", "aa"] } });
    expect(result.passed).toBe(true);
    expect(result.failureReason).toBeNull();
  });

  it("rejects an excellent rule when first sound is below 30", () => {
    const result = buildAssessment({ target: "باء", primary: azure({ accuracy: 75, firstSoundScore: 27 }), iqra: { phonemes: ["b", "aa"] } });
    expect(result.passed).toBe(false);
    expect(result.failureReason).toBe("weak_first_sound");
  });

  it("never passes when no rule matches; message depends on IQRA availability", () => {
    const withoutIqra = buildAssessment({ target: "باء", primary: azure(), iqra: null });
    expect(withoutIqra.passed).toBe(false);
    expect(withoutIqra.failureReason).toBe("rule_not_matched");
    expect(withoutIqra.conditionEvaluation.matchedRule).toBe(NO_MATCHING_RULE);
    expect(withoutIqra.conditionEvaluation.message).toContain("IQRA");

    const withIqra = buildAssessment({ target: "باء", primary: azure(), iqra: { phonemes: ["x"] } });
    expect(withIqra.conditionEvaluation.message).toBe("لم تنطبق شروط تقييم هذا الحرف. حاول مرة أخرى.");
  });

  it("falls back for missing fluency/completeness exactly like the original", () => {
    const result = buildAssessment({ target: "ألف", primary: azure({ fluency: null, completeness: null }), iqra: null });
    expect(result.scores).toEqual({ accuracy: 88, pronunciation: 85, fluency: 88, completeness: 100 });
  });

  it("evaluates Lesson 1 vocabulary with Azure >= 70 and the word's IQRA gate", () => {
    const asad = { sequence: "< a s a d", phonemes: ["<", "a", "s", "a", "d"] };
    const good = buildAssessment({ target: "أسد", primary: azure({ referenceText: "أسد", accuracy: 72 }), iqra: asad });
    expect(good.passed).toBe(true);
    expect(good.feedback.message).toBe(VOCABULARY_RULES["أسد"]!.excellent!.message);
    const wrongSound = buildAssessment({ target: "أسد", primary: azure({ referenceText: "أسد", accuracy: 92 }), iqra: { phonemes: ["<", "a", "s", "a", "t"] } });
    expect(wrongSound.passed).toBe(false);
    expect(wrongSound.conditionEvaluation.matchedRule).toBe("said_wrong_sound");
    const weak = buildAssessment({ target: "أسد", primary: azure({ referenceText: "أسد", accuracy: 64 }), iqra: asad });
    expect(weak.passed).toBe(false);
    expect(weak.conditionEvaluation.matchedRule).toBe("needs_improvement");
    const noIqra = buildAssessment({ target: "أسد", primary: azure({ referenceText: "أسد", accuracy: 92 }), iqra: null });
    expect(noIqra.passed).toBe(false);
    expect(noIqra.conditionEvaluation.matchedRule).toBe(NO_MATCHING_RULE);
  });
});

describe("helpers", () => {
  it("computes the discrimination score as 80 % first sound + 20 % accuracy", () => {
    expect(discriminationScore(azure({ firstSoundScore: 50, accuracy: 100 }))).toBe(60);
    expect(discriminationScore(azure({ firstSoundScore: null, accuracy: 77 }))).toBe(77);
  });

  it("detects unusable Azure results (no speech recognised)", () => {
    expect(hasUsableAzureScores(azure({ accuracy: null }))).toBe(false);
    expect(hasUsableAzureScores(azure({ pronunciation: null }))).toBe(false);
    expect(hasUsableAzureScores(azure())).toBe(true);
  });
});
