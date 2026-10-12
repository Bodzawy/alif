"use client";

import { useState } from "react";
import { Loader2, Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { speakArabic } from "@/lib/tts/player";
import { cn } from "@/lib/utils";

// "Anhören" for one Arabic text of the new step types (positions, compare,
// match, word-pick, table): the model pronunciation from /api/tts – the same
// cached TTS as every other A1 word. A playback error is shown in German and
// never blocks the step. `onPlayed` reports a successful (finished) playback.

export function ListenButton({
  text,
  label,
  onPlayed,
  className,
  compact = false,
  testId,
}: {
  text: string;
  /** Accessible name, e.g. "Anhören: دُولَاب". */
  label?: string;
  onPlayed?: () => void;
  className?: string;
  /** Icon only (for tight rows). */
  compact?: boolean;
  testId?: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  async function play() {
    setState("loading");
    try {
      await speakArabic(text);
      setState("idle");
      onPlayed?.();
    } catch {
      setState("error");
    }
  }

  return (
    <span className={cn("inline-flex flex-col items-center gap-1", className)}>
      <Button
        type="button"
        variant="secondary"
        onClick={play}
        disabled={state === "loading"}
        aria-label={label ?? `Anhören: ${text}`}
        className={cn("min-h-11", compact ? "min-w-11 px-0" : "")}
        data-testid={testId}
        data-state={state}
      >
        {state === "loading" ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Volume2 className="h-5 w-5" aria-hidden />}
        {!compact && "Anhören"}
      </Button>
      {state === "error" && (
        <span role="status" className="text-xs text-destructive" data-testid={testId ? `${testId}-error` : undefined}>
          Ton nicht verfügbar – versuch es später noch einmal.
        </span>
      )}
    </span>
  );
}
