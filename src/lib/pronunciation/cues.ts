/** Spoken after an evaluation in the alphabet drill (A0), in Arabic (same phrases as the original learn page). */
export const FEEDBACK_CUES = {
  success: "مُمْتَاز",
  retry: "حاول مرة أخرى",
} as const;

/**
 * Spoken after an evaluation in the A1 lessons (guided mode, "Aufnehmen") – German texts, spoken by /api/tts
 * in the learner's language (src/i18n/).
 */
export const GERMAN_CUES = {
  super: "Super!",
  retry: "Nochmal versuchen",
} as const;
