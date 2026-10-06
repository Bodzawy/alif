// Score of one A0 training round. Every letter is repeated until it is
// pronounced correctly; the score reflects how many attempts that took.
//   attempt 1 → 100, attempt 2 → 90, attempt 3 → 80, … never below 0.
// A letter skipped for technical reasons scores 0. The round score is the
// average over its letters, rounded down, so 100 % means every letter was
// right on the first attempt.

export const ATTEMPT_PENALTY = 10;

/** `attempts` = evaluated attempts up to and including the correct one; null = skipped. */
export type LetterResult = { id: string; attempts: number | null };

export function letterScore(attempts: number | null): number {
  if (attempts === null || attempts < 1) return 0;
  return Math.max(0, 100 - ATTEMPT_PENALTY * (attempts - 1));
}

export function roundScore(results: readonly LetterResult[]): number {
  if (results.length === 0) return 0;
  const total = results.reduce((sum, result) => sum + letterScore(result.attempts), 0);
  return Math.floor(total / results.length);
}

export type ScoreRating = { arabic: string; german: string };

export function scoreRating(score: number): ScoreRating {
  if (score >= 100) return { arabic: "ممتاز جدًا", german: "Hervorragend – alles beim ersten Versuch!" };
  if (score >= 90) return { arabic: "ممتاز", german: "Sehr gut" };
  if (score >= 80) return { arabic: "جيد جدًا", german: "Gut" };
  return { arabic: "يحتاج إلى مزيد من التدريب", german: "Übe diese Runde noch einmal" };
}
