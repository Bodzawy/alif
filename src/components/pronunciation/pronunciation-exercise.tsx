"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { ListenButton } from "@/components/audio/listen-button";
import type { PronunciationExercise as Exercise } from "@/data/types";
import type { StudentFeedback } from "@/lib/pronunciation/client";
import { FEEDBACK_CUES } from "@/lib/pronunciation/cues";
import { speakArabic } from "@/lib/tts/player";
import { cn } from "@/lib/utils";

import { FeedbackPanel } from "./feedback-panel";
import { RecordButton } from "./record-button";
import { usePronunciationExercise } from "./use-pronunciation-exercise";

const STATUS: Record<string, string> = {
  recording: "Ich höre zu … sprich jetzt und tippe dann auf Stopp.",
  processing: "Deine Aussprache wird bewertet …",
};

export function PronunciationExercise({
  exercise,
  locked,
  onBusyChange,
  onResult,
  className,
}: {
  exercise: Exercise;
  /** Another exercise is recording/processing – this one must wait. */
  locked?: boolean;
  onBusyChange?: (busy: boolean) => void;
  onResult?: (feedback: StudentFeedback) => void;
  className?: string;
}) {
  const { phase, feedback, error, start, stop } = usePronunciationExercise({
    target: exercise.target,
    onResult: (result) => {
      onResult?.(result);
      // Spoken cue after each evaluation, as in the original learn page.
      speakArabic(result.passed ? FEEDBACK_CUES.success : FEEDBACK_CUES.retry).catch(() => undefined);
    },
  });

  const busy = phase === "recording" || phase === "processing";
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  const testId = `exercise-${exercise.id}`;

  return (
    <div className={cn("flex flex-col gap-3", className)} data-testid={testId} data-phase={phase}>
      <div className="grid grid-cols-2 gap-2">
        <ListenButton text={exercise.modelText} disabled={busy} testId={`${testId}-listen`} />
        <RecordButton phase={phase} onStart={start} onStop={stop} disabled={locked} testId={`${testId}-record`} />
      </div>

      <p aria-live="polite" className="min-h-5 text-center text-sm text-muted-foreground" data-testid={`${testId}-status`}>
        {STATUS[phase] ?? (locked ? "Warte, bis die andere Aufnahme fertig ist." : "")}
      </p>

      {phase === "error" && error && (
        <div role="alert" data-testid={`${testId}-error`} className="flex animate-fade-in items-start gap-2 rounded-2xl border border-destructive/25 bg-destructive-soft p-3 text-left text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      {phase === "result" && feedback && (
        <FeedbackPanel feedback={feedback} onRetry={start} retryDisabled={locked} testId={`${testId}-feedback`} />
      )}
    </div>
  );
}
