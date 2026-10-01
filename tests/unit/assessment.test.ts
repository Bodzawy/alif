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
  it("passes only when the matched rule is 'excellent'", () => {
    const result = buildAssessment({ target: "باء", primary: azure(), masaar: { letter: "ب", confidence: 0.9 }, iqra: { phonemes: ["b", "aa"] } });
    expect(result.passed).toBe(true);
    expect(result.failureReason).toBeNull();
    expect(result.feedback).toEqual({ rule: "excellent", message: LETTER_RULES["باء"]!.excellent!.message });
    expect(result.conditionEvaluation).toMatchObject({ matchedRule: "excellent", iqraPhonemes: ["b", "aa"], azureAccuracy: 88 });
    expect(result.details.masaar).toEqual({ letter: "ب", confidence: 0.9 });
  });

  it("fails with rule_not_matched when a non-excellent rule matches despite good legacy scores", () => {
    const result = buildAssessment({ target: "ثاء", primary: azure({ referenceText: "ثاء" }), masaar: null, iqra: { phonemes: ["s", "aa"] } });
    expect(result.passed).toBe(false);
    expect(result.failureReason).toBe("rule_not_matched");
    expect(result.conditionEvaluation.matchedRule).toBe("said_sin");
  });

  it("keeps the legacy failure reasons (accuracy < 65, first sound < 55)", () => {
    expect(buildAssessment({ target: "باء", primary: azure({ accuracy: 60 }), masaar: null, iqra: { phonemes: ["b"] } }).failureReason).toBe("low_accuracy");
    const weak = buildAssessment({ target: "باء", primary: azure({ accuracy: 68, firstSoundScore: 40 }), masaar: null, iqra: { phonemes: ["b"] } });
    expect(weak.failureReason).toBe("weak_first_sound");
    expect(weak.conditionEvaluation.matchedRule).toBe("wrong");
    expect(weak.passed).toBe(false);
  });

  it("lets an 'excellent' rule pass even when the legacy first-sound check failed", () => {
    // Original behaviour: the conditions file decides `passed`; legacy checks only set the reason.
    const result = buildAssessment({ target: "باء", primary: azure({ accuracy: 75, firstSoundScore: 40 }), masaar: null, iqra: { phonemes: ["b"] } });
    expect(result.passed).toBe(true);
    expect(result.failureReason).toBe("weak_first_sound");
  });

  it("never passes when no rule matches; message depends on IQRA availability", () => {
    const withoutIqra = buildAssessment({ target: "باء", primary: azure(), masaar: null, iqra: null });
    expect(withoutIqra.passed).toBe(false);
    expect(withoutIqra.failureReason).toBe("rule_not_matched");
    expect(withoutIqra.conditionEvaluation.matchedRule).toBe(NO_MATCHING_RULE);
    expect(withoutIqra.conditionEvaluation.message).toContain("IQRA");

    const withIqra = buildAssessment({ target: "باء", primary: azure(), masaar: null, iqra: { phonemes: ["x"] } });
    expect(withIqra.conditionEvaluation.message).toBe("لم تنطبق شروط تقييم هذا الحرف. حاول مرة أخرى.");
  });

  it("falls back for missing fluency/completeness exactly like the original", () => {
    const result = buildAssessment({ target: "ألف", primary: azure({ fluency: null, completeness: null }), masaar: null, iqra: null });
    expect(result.scores).toEqual({ accuracy: 88, pronunciation: 85, fluency: 88, completeness: 100 });
  });

  it("evaluates Lesson 1 vocabulary with its own rules (Azure-only, threshold 70)", () => {
    const good = buildAssessment({ target: "أسد", primary: azure({ referenceText: "أسد", accuracy: 72 }), masaar: null, iqra: null });
    expect(good.passed).toBe(true);
    expect(good.feedback.message).toBe(VOCABULARY_RULES["أسد"]!.excellent!.message);
    const weak = buildAssessment({ target: "أسد", primary: azure({ referenceText: "أسد", accuracy: 64 }), masaar: null, iqra: null });
    expect(weak.passed).toBe(false);
    expect(weak.conditionEvaluation.matchedRule).toBe("needs_improvement");
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
