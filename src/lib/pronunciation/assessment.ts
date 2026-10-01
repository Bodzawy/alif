import { evaluateLetterConditions } from "./condition-engine";
import { NO_MATCHING_RULE } from "./types";
import type { AzureAssessment, FailureReason, IqraResult, MasaarResult, PronunciationResponse } from "./types";

// The scoring/decision step of the original /api/pronunciation route, moved
// into a pure function so it can be unit-tested. Thresholds, order of checks,
// the "only an explicit `excellent` rule passes" policy and the fallback
// messages are unchanged.

/** Legacy thresholds – they only decide `failureReason`, not `passed`. */
export const MIN_ACCURACY = 65;
export const MIN_FIRST_SOUND_SCORE = 55;

export { NO_MATCHING_RULE };

export function discriminationScore(result: AzureAssessment): number | null {
  if (result.firstSoundScore !== null && result.accuracy !== null) {
    return Math.round(result.firstSoundScore * 0.8 + result.accuracy * 0.2);
  }
  return result.firstSoundScore ?? result.accuracy;
}

export type AssessmentInput = {
  target: string;
  primary: AzureAssessment & { accuracy: number; pronunciation: number };
  masaar: MasaarResult | null;
  iqra: IqraResult | null;
};

/** Azure returned no usable score (no speech recognised) – the original answered 422. */
export function hasUsableAzureScores(
  primary: AzureAssessment
): primary is AzureAssessment & { accuracy: number; pronunciation: number } {
  return primary.accuracy !== null && primary.pronunciation !== null;
}

export function buildAssessment({ target, primary, masaar, iqra }: AssessmentInput): PronunciationResponse {
  const targetScore = discriminationScore(primary);

  const accuracyPassed = primary.accuracy >= MIN_ACCURACY;
  const firstSoundPassed = primary.firstSoundScore === null || primary.firstSoundScore >= MIN_FIRST_SOUND_SCORE;

  let passed = accuracyPassed && firstSoundPassed;
  let failureReason: FailureReason | null = null;

  if (!accuracyPassed) {
    failureReason = "low_accuracy";
  } else if (!firstSoundPassed) {
    failureReason = "weak_first_sound";
  }

  const iqraPhonemes = iqra?.phonemes ?? [];

  const feedback = evaluateLetterConditions({
    target,
    azureAccuracy: primary.accuracy,
    azureRecognized: primary.recognized,
    iqraPhonemes,
  });

  if (feedback) {
    // The conditions file, not the legacy score alone, decides whether this
    // attempt passes. Only an explicit "excellent" rule is a pass.
    passed = feedback.rule === "excellent";
    if (!passed && failureReason === null) {
      failureReason = "rule_not_matched";
    }
  } else {
    // Never report success when the data required by a rule is unavailable.
    passed = false;
    failureReason = "rule_not_matched";
  }

  const resolvedFeedback = feedback ?? {
    rule: NO_MATCHING_RULE,
    message: iqra?.phonemes?.length
      ? "لم تنطبق شروط تقييم هذا الحرف. حاول مرة أخرى."
      : "تعذر تحليل أصوات النطق. حاول مرة أخرى بعد التأكد من اتصال IQRA.",
  };

  return {
    target,
    recognized: primary.recognized,
    passed,
    failureReason,
    scores: {
      accuracy: primary.accuracy,
      pronunciation: primary.pronunciation,
      fluency: primary.fluency ?? primary.accuracy,
      completeness: primary.completeness ?? 100,
    },
    // The original learn page read `feedback.message`, but the original API
    // never sent it, so students only ever saw a generic status. It is the
    // matched rule's message, identical to conditionEvaluation.message.
    feedback: { rule: resolvedFeedback.rule, message: resolvedFeedback.message },
    details: {
      masaar,
      azure: { recognized: primary.recognized, accuracy: primary.accuracy },
      iqra,
    },
    conditionEvaluation: {
      target,
      azureAccuracy: primary.accuracy,
      azureRecognized: primary.recognized,
      iqraPhonemes,
      matchedRule: resolvedFeedback.rule,
      message: resolvedFeedback.message,
      conditions: feedback?.conditions ?? [],
    },
    discrimination: {
      targetScore,
      firstSoundScore: primary.firstSoundScore,
      closestAlternative: null,
      alternativeScore: null,
      margin: null,
    },
    words: primary.words,
  };
}
