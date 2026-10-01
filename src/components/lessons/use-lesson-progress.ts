"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  getLessonProgress,
  lessonKey,
  markExercisePassed,
  markLessonCompleted,
  subscribeProgress,
  type LessonProgress,
} from "@/lib/progress";

const SERVER_SNAPSHOT: LessonProgress = { passed: [] };

export function useLessonProgress(levelSlug: string, lessonSlug: string) {
  const key = lessonKey(levelSlug, lessonSlug);
  const progress = useSyncExternalStore(
    subscribeProgress,
    () => getLessonProgress(key),
    () => SERVER_SNAPSHOT
  );

  const markPassed = useCallback((exerciseId: string) => markExercisePassed(key, exerciseId), [key]);
  const markCompleted = useCallback(() => markLessonCompleted(key), [key]);

  return { progress, markPassed, markCompleted };
}
