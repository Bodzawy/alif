// Shapes shared by the pronunciation API and the Alif UI.

/** Rule name reported when no condition rule matched the attempt. */
export const NO_MATCHING_RULE = "no_matching_rule";

export type WordAssessment = {
  word: string;
  accuracy: number | null;
  errorType: string;
  phonemes: Array<{ phoneme: string | null; accuracy: number | null }>;
};

/** Result of Azure pronunciation assessment for one recording. */
export type AzureAssessment = {
  referenceText: string;
  recognized: string;
  accuracy: number | null;
  pronunciation: number | null;
  fluency: number | null;
  completeness: number | null;
  firstSoundScore: number | null;
  words: WordAssessment[];
};

/** Response of the MASAAR letter-classification service (/predict). */
export type MasaarResult = {
  letter?: string;
  confidence?: number;
  top3?: Array<{ label?: string; letter?: string; confidence?: number; score?: number }>;
};

/** Response of the IQRA phoneme-recognition service (/predict). */
export type IqraResult = {
  sequence?: string;
  phonemes?: string[];
  duration?: number;
};

export type FailureReason = "low_accuracy" | "weak_first_sound" | "wrong_letter" | "rule_not_matched";

export type ConditionEvaluationResult = {
  target: string;
  azureAccuracy: number;
  azureRecognized: string;
  iqraPhonemes: string[];
  matchedRule: string;
  message: string;
  conditions: string[];
};

/** Successful /api/pronunciation response (same shape as the original system, plus `feedback`). */
export type PronunciationResponse = {
  target: string;
  recognized: string;
  passed: boolean;
  failureReason: FailureReason | null;
  scores: {
    accuracy: number;
    pronunciation: number;
    fluency: number;
    completeness: number;
  };
  feedback: { rule: string; message: string };
  details: {
    masaar: MasaarResult | null;
    azure: { recognized: string; accuracy: number };
    iqra: IqraResult | null;
  };
  conditionEvaluation: ConditionEvaluationResult;
  discrimination: {
    targetScore: number | null;
    firstSoundScore: number | null;
    closestAlternative: null;
    alternativeScore: null;
    margin: null;
  };
  words: WordAssessment[];
};
