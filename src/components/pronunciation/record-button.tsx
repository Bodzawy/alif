"use client";

import { Loader2, Mic, Square } from "lucide-react";

import { MAX_RECORDING_MS } from "@/lib/audio/recording";
import { cn } from "@/lib/utils";

import type { ExercisePhase } from "./use-pronunciation-exercise";

export function RecordButton({
  phase,
  onStart,
  onStop,
  disabled,
  testId,
}: {
  phase: ExercisePhase;
  onStart: () => void;
  onStop: () => void;
  disabled?: boolean;
  testId?: string;
}) {
  const recording = phase === "recording";
  const processing = phase === "processing";
  const again = phase === "result" || phase === "error";

  return (
    <div className="flex flex-col">
      <button
        type="button"
        data-testid={testId}
        data-phase={phase}
        onClick={recording ? onStop : onStart}
        disabled={processing || (disabled && !recording)}
        aria-label={recording ? "Aufnahme stoppen" : processing ? "Wird bewertet" : "Aufnahme starten"}
        className={cn(
          "relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-2xl px-4 text-sm font-semibold shadow-sm transition focus-ring disabled:cursor-not-allowed",
          recording
            ? "bg-destructive text-destructive-foreground"
            : "bg-primary text-primary-foreground hover:brightness-110 disabled:opacity-50",
          processing && "opacity-80 disabled:opacity-80"
        )}
      >
        {recording && (
          <span
            aria-hidden
            className="record-progress absolute inset-x-0 bottom-0 h-1 bg-white/60"
            style={{ ["--record-ms" as string]: `${MAX_RECORDING_MS}ms` }}
          />
        )}
        {processing ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        ) : recording ? (
          <span className="relative flex h-5 w-5 items-center justify-center" aria-hidden>
            <span className="absolute inset-0 animate-pulse-ring rounded-full bg-white/50" />
            <Square className="relative h-4 w-4 fill-current" />
          </span>
        ) : (
          <Mic className="h-5 w-5" aria-hidden />
        )}
        {recording ? "Stopp" : processing ? "Wird bewertet…" : again ? "Nochmal" : "Aufnehmen"}
      </button>
    </div>
  );
}
