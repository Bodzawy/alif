import type { LessonProgress } from "@/lib/progress";

// A0 progression on top of the pronunciation result. Mastery is only ever
// granted by the pronunciation API (`passed: true`, i.e. the Masaar
// condition engine matched "excellent"); skipping is a technical escape hatch
// that opens the next letter but never counts as mastery.

export type LetterStatus = "mastered" | "skipped" | "available" | "locked";

export function letterStatuses(letterIds: readonly string[], progress: LessonProgress): Record<string, LetterStatus> {
  const mastered = new Set(progress.passed);
  const skipped = new Set(progress.skipped ?? []);
  const statuses: Record<string, LetterStatus> = {};

  letterIds.forEach((id, index) => {
    if (mastered.has(id)) statuses[id] = "mastered";
    else if (skipped.has(id)) statuses[id] = "skipped";
    else {
      const previous = letterIds[index - 1];
      const previousDone = previous === undefined || mastered.has(previous) || skipped.has(previous);
      statuses[id] = previousDone ? "available" : "locked";
    }
  });

  return statuses;
}

export function alphabetSummary(letterIds: readonly string[], progress: LessonProgress) {
  const statuses = letterStatuses(letterIds, progress);
  const mastered = letterIds.filter((id) => statuses[id] === "mastered");
  const notMastered = letterIds.filter((id) => statuses[id] === "skipped");
  const last = letterIds[letterIds.length - 1];
  return {
    statuses,
    masteredCount: mastered.length,
    /** Letters the student moved past without mastering them. */
    notMastered,
    /** First letter the student should work on next (an open or skipped one). */
    nextToPractice: letterIds.find((id) => statuses[id] === "available") ?? notMastered[0],
    /** Every letter mastered. */
    complete: mastered.length === letterIds.length,
    /** The last letter was mastered or skipped – the alphabet was gone through once. */
    reachedEnd: last !== undefined && (statuses[last] === "mastered" || statuses[last] === "skipped"),
  };
}
