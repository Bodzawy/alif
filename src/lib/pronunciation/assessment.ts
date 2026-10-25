import type { Track } from "@/lib/track";

import { evaluateLetterConditions } from "./condition-engine";
import { NO_MATCHING_RULE } from "./types";
import type { AzureAssessment, FailureReason, IqraResult, PronunciationResponse } from "./types";

// The scoring/decision step of the original /api/pronunciation route, moved
// into a pure function so it can be unit-tested. Thresholds, order of checks,
// the "only an explicit `excellent` rule passes" policy and the fallback
// messages are unchanged.

/** Legacy thresholds – they only decide `failureReason`, not `passed`. */
export const MIN_ACCURACY = 65;
/** ALIF Speaking has no IQRA check, so Azure alone must be sure the word was said well. */
export const SPEAKING_MIN_ACCURACY = 90;
export const MIN_FIRST_SOUND_SCORE = 30;

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
  iqra: IqraResult | null;
  /** "speaking" (ALIF Speaking – Beginner): Azure's minimum scores alone decide; no condition rules. */
  track?: Track;
};

/** ALIF Speaking: the rule names the condition files use, with general messages. */
export const SPEAKING_FEEDBACK = {
  excellent: "ممتاز 👏",
  needs_improvement: "حاول مرة أخرى",
} as const;

/** Azure returned no usable score (no speech recognised) – the original answered 422. */
export function hasUsableAzureScores(
  primary: AzureAssessment
): primary is AzureAssessment & { accuracy: number; pronunciation: number } {
  return primary.accuracy !== null && primary.pronunciation !== null;
}

export function buildAssessment({ target, primary, iqra, track = "pronunciation" }: AssessmentInput): PronunciationResponse {
  const targetScore = discriminationScore(primary);

  const accuracyPassed = primary.accuracy >= (track === "speaking" ? SPEAKING_MIN_ACCURACY : MIN_ACCURACY);
  const firstSoundPassed = primary.firstSoundScore === null || primary.firstSoundScore >= MIN_FIRST_SOUND_SCORE;

  let passed = accuracyPassed && firstSoundPassed;
  let failureReason: FailureReason | null = null;

  if (!accuracyPassed) {
    failureReason = "low_accuracy";
  } else if (!firstSoundPassed) {
    failureReason = "weak_first_sound";
  }

  const iqraPhonemes = iqra?.phonemes ?? [];

  // Up to here `passed` is Azure's minimum scores alone – all ALIF Speaking asks for.
  const speakingRule = passed ? "excellent" : "needs_improvement";
  const feedback =
    track === "speaking"
      ? { rule: speakingRule, message: SPEAKING_FEEDBACK[speakingRule], conditions: [] }
      : evaluateLetterConditions({
          target,
          azureAccuracy: primary.accuracy,
          azureRecognized: primary.recognized,
          iqraPhonemes,
        });

  if (feedback) {
    // The conditions file, not the legacy score alone, decides whether this
    // attempt passes, but Azure's minimum score checks remain mandatory.
    passed = feedback.rule === "excellent" && accuracyPassed && firstSoundPassed;
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
