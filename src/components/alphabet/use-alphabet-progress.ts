"use client";

import { useCallback, useSyncExternalStore } from "react";

import { ALPHABET, ALPHABET_LEVEL } from "@/data/alphabet";
import { alphabetSummary } from "@/lib/alphabet-progress";
import {
  getLessonProgress,
  markExercisePassed,
  markExerciseSkipped,
  subscribeProgress,
  type LessonProgress,
} from "@/lib/progress";

const SERVER_SNAPSHOT: LessonProgress = { passed: [] };
const LETTER_IDS = ALPHABET.map((letter) => letter.id);
const noopSubscribe = () => () => undefined;

export function useAlphabetProgress() {
  const key = ALPHABET_LEVEL.progressKey;
  const progress = useSyncExternalStore(subscribeProgress, () => getLessonProgress(key), () => SERVER_SNAPSHOT);
  // Progress lives in the browser: until hydration the gating state is unknown.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const markMastered = useCallback((id: string) => markExercisePassed(key, id), [key]);
  const markSkipped = useCallback((id: string) => markExerciseSkipped(key, id), [key]);

  return { hydrated, progress, summary: alphabetSummary(LETTER_IDS, progress), markMastered, markSkipped };
}
