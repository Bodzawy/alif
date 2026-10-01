"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Volume2 } from "lucide-react";

import { speakArabic } from "@/lib/tts/player";
import { cn } from "@/lib/utils";

export function ListenButton({
  text,
  label = "Anhören",
  disabled,
  className,
  testId,
}: {
  text: string;
  label?: string;
  disabled?: boolean;
  className?: string;
  testId?: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "playing">("idle");
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function play() {
    if (state !== "idle") return;
    setError(null);
    setState("loading");
    try {
      // "loading" covers the request; playback starts right after.
      const playback = speakArabic(text);
      setTimeout(() => mounted.current && setState((s) => (s === "loading" ? "playing" : s)), 350);
      await playback;
    } catch (caught) {
      if (mounted.current) setError(caught instanceof Error ? caught.message : "Die Aussprache konnte nicht abgespielt werden.");
    } finally {
      if (mounted.current) setState("idle");
    }
  }

  return (
    <div className={cn("flex flex-col items-stretch", className)}>
      <button
        type="button"
        onClick={play}
        disabled={disabled}
        data-testid={testId}
        aria-label={`${label}: ${text}`}
        className={cn(
          "inline-flex h-12 items-center justify-center gap-2 rounded-2xl border bg-card px-4 text-sm font-semibold text-foreground shadow-sm transition hover:bg-primary-soft hover:text-primary focus-ring disabled:cursor-not-allowed disabled:opacity-50",
          state !== "idle" && "border-primary/40 bg-primary-soft text-primary"
        )}
      >
        {state === "loading" ? (
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
        ) : (
          <Volume2 className={cn("h-5 w-5", state === "playing" && "animate-pulse")} aria-hidden />
        )}
        {label}
      </button>
      {error && (
        <p role="status" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
