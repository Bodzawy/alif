"use client";

import { useSyncExternalStore } from "react";

import { LESSONS_UNLOCK_IN_ORDER } from "@/data/lesson-unlock";
import { getLessonProgress, lessonKey, subscribeProgress } from "@/lib/progress";

const noopSubscribe = () => () => {};

/**
 * Whether a lesson is open. With LESSONS_UNLOCK_IN_ORDER a lesson opens once the
 * lesson before it is completed; the first lesson is always open.
 * Progress lives in the browser, so the server render (and hydration) treat a
 * gated lesson as locked and `hydrated` is false until the client has read it.
 */
export function useLessonUnlocked(levelSlug: string, previousLessonSlug: string | undefined) {
  const gated = LESSONS_UNLOCK_IN_ORDER && previousLessonSlug !== undefined;
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const previousCompleted = useSyncExternalStore(
    subscribeProgress,
    () => (gated ? Boolean(getLessonProgress(lessonKey(levelSlug, previousLessonSlug ?? "")).completedAt) : true),
    () => !gated
  );
  return { hydrated: hydrated || !gated, unlocked: !gated || previousCompleted };
}
