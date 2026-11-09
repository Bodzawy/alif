import type { Track } from "@/lib/track";

import { containsShare, evaluateLetterConditions, normalizedText } from "./condition-engine";
import { BEGINNER_RULES } from "./rules";
import { NO_MATCHING_RULE } from "./types";
import type { AzureAssessment, FailureReason, IqraResult, PronunciationResponse } from "./types";

// The scoring/decision step of the original /api/pronunciation route, moved
// into a pure function so it can be unit-tested. Thresholds, order of checks,
// the "only an explicit `excellent` rule passes" policy and the fallback
// messages are unchanged.

/** Legacy thresholds – they only decide `failureReason`, not `passed`. */
export const MIN_ACCURACY = 65;
export const MIN_FIRST_SOUND_SCORE = 30;

/**
 * Azure recognised exactly the target: every recognised word, without harakat
 * and punctuation, is the target (a repeated sound, "أُ أُ", counts too).
 */
export function recognizedTarget(recognized: string, target: string): boolean {
  const expected = normalizedText(target);
  // A sentence (صباح الخير): the recognised words together are the target (normalizedText drops the spaces,
  // so comparing word by word could never match).
  if (isSentence(target)) return expected !== "" && normalizedText(recognized) === expected;
  const words = recognized.split(/\s+/).map(normalizedText).filter(Boolean);
  return expected !== "" && words.length > 0 && words.every((word) => word === expected);
}

/** ALIF Speaking: Azure's part – its minimum scores, or it recognised exactly the target. */
export function speakingAzurePassed(primary: Pick<AzureAssessment, "accuracy" | "firstSoundScore" | "recognized">, target: string): boolean {
  const accuracyPassed = primary.accuracy !== null && primary.accuracy >= MIN_ACCURACY;
  const firstSoundPassed = primary.firstSoundScore === null || primary.firstSoundScore >= MIN_FIRST_SOUND_SCORE;
  return recognizedTarget(primary.recognized, target) || (accuracyPassed && firstSoundPassed);
}

/** A target of several words: a dialogue line or an expression (صباح الخير). */
export function isSentence(target: string): boolean {
  return /\s/.test(target.trim());
}

/**
 * ALIF Speaking, a sentence: the share of its sounds IQRA must hear. The beginner rule lists EVERY
 * spoken letter; on a sentence of 7–14 letters a single miss of IQRA (ص ح خ are heard in only
 * ~2 of 3 clean clips, docs/iqra-reliability.md) failed the whole line again and again – the
 * learner heard "Fast geschafft" whatever they said, and the partner never answered.
 */
export const SENTENCE_SOUND_SHARE = 2 / 3;

/** A sentence whose beginner rule failed: enough of its sounds were heard anyway (Azure already passed it). */
export function sentenceSoundsHeard(target: string, phonemes: string[]): boolean {
  if (!isSentence(target)) return false;
  const conditions = BEGINNER_RULES[target]?.excellent?.conditions ?? [];
  const shares = conditions.map((condition) => containsShare(condition, phonemes));
  // Only rules made of "contains" conditions (every beginner rule today); anything else stays strict.
  if (shares.length === 0 || shares.some((share) => share === null)) return false;
  return shares.every((share) => share!.found >= Math.ceil(share!.total * SENTENCE_SOUND_SHARE));
}

function beginnerExcellent(target: string) {
  const rule = BEGINNER_RULES[target]!.excellent!;
  return { rule: "excellent", message: rule.message, conditions: rule.conditions };
}

/** ALIF Speaking asks IQRA only when the target's beginner rule checks sounds. */
export function speakingNeedsIqra(target: string): boolean {
  return (BEGINNER_RULES[target]?.excellent?.conditions ?? []).some((condition) => condition.startsWith("iqra_"));
}

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
  /** "speaking" (ALIF Speaking – Beginner): Azure first, then the gentle BEGINNER_RULES (when IQRA answered). */
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

  const accuracyPassed = primary.accuracy >= MIN_ACCURACY;
  const firstSoundPassed = primary.firstSoundScore === null || primary.firstSoundScore >= MIN_FIRST_SOUND_SCORE;
  // ALIF Speaking also accepts the word whenever Azure recognised exactly the target, whatever its scores.
  const azurePassed = track === "speaking" ? speakingAzurePassed(primary, target) : accuracyPassed && firstSoundPassed;

  let passed = azurePassed;
  let failureReason: FailureReason | null = null;

  if (!azurePassed && !accuracyPassed) {
    failureReason = "low_accuracy";
  } else if (!azurePassed && !firstSoundPassed) {
    failureReason = "weak_first_sound";
  }

  const iqraPhonemes = iqra?.phonemes ?? [];

  // ALIF Speaking: once Azure passed it, the gentle beginner rule checks the sounds IQRA heard.
  // Without such a rule or without IQRA's phonemes, Azure's verdict stands.
  const strictBeginner =
    track === "speaking" && azurePassed && iqraPhonemes.length > 0
      ? evaluateLetterConditions({ target, azureAccuracy: primary.accuracy, azureRecognized: primary.recognized, iqraPhonemes }, BEGINNER_RULES)
      : null;
  const beginner = strictBeginner && strictBeginner.rule !== "excellent" && sentenceSoundsHeard(target, iqraPhonemes) ? beginnerExcellent(target) : strictBeginner;
  const speakingRule = passed ? "excellent" : "needs_improvement";
  const feedback =
    track === "speaking"
      ? (beginner ?? { rule: speakingRule, message: SPEAKING_FEEDBACK[speakingRule], conditions: [] })
      : evaluateLetterConditions({
          target,
          azureAccuracy: primary.accuracy,
          azureRecognized: primary.recognized,
          iqraPhonemes,
        });

  if (feedback) {
    // The conditions file, not the legacy score alone, decides whether this
    // attempt passes, but Azure's minimum score checks remain mandatory.
    passed = feedback.rule === "excellent" && azurePassed;
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
