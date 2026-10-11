"use client";

import { useEffect } from "react";

import { VocabularyCard } from "@/components/lessons/vocabulary-card";
import type { A1Word } from "@/data/types";
import { markLessonCompleted } from "@/lib/progress";

import { usePracticeSession } from "./use-practice-session";

// Step type "phrases": a phrase to listen to and say (e.g. صَبَاحُ الْخَيْر),
// one large card each – picture, Arabic, German, transliteration, then
// "Anhören" and the microphone with the usual evaluation and feedback. The
// step counts as done once every phrase was said correctly.
export function PhrasesStep({ phrases, progressKey }: { phrases: A1Word[]; progressKey: string }) {
  const session = usePracticeSession();
  const done = phrases.every((phrase) => session.passed.has(phrase.exercise.id));

  useEffect(() => {
    if (done) markLessonCompleted(progressKey);
  }, [done, progressKey]);

  return (
    <ol className="mx-auto grid max-w-md gap-6" data-testid="phrases-step" data-done={done} aria-label="Sätze">
      {phrases.map((phrase) => (
        <li key={phrase.id} className="grid">
          <VocabularyCard
            item={phrase}
            passed={session.passed.has(phrase.exercise.id)}
            locked={session.isLocked(phrase.exercise.id)}
            onBusyChange={session.busyHandler(phrase.exercise.id)}
            onResult={session.resultHandler(phrase.exercise.id)}
            simpleFeedback
          />
        </li>
      ))}
    </ol>
  );
}
