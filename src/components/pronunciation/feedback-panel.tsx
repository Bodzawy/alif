import { AlertCircle, CheckCircle2, RotateCcw, Sparkles } from "lucide-react";

import type { StudentFeedback } from "@/lib/pronunciation/client";
import { cn } from "@/lib/utils";

const toneStyles = {
  success: { box: "border-success/30 bg-success-soft", text: "text-success", bar: "bg-success" },
  retry: { box: "border-warning/30 bg-warning-soft", text: "text-warning", bar: "bg-warning" },
  neutral: { box: "border-border bg-muted", text: "text-foreground", bar: "bg-muted-foreground" },
} as const;

export function FeedbackPanel({
  feedback,
  onRetry,
  retryDisabled,
  testId,
  simple,
}: {
  feedback: StudentFeedback;
  onRetry: () => void;
  retryDisabled?: boolean;
  testId?: string;
  /** Learner view (A1): only a short headline and tip – no accuracy, no rule or service message. */
  simple?: boolean;
}) {
  const style = toneStyles[feedback.tone];
  const headline = simple && feedback.passed ? "مُمْتَاز! 👏" : feedback.headline;
  const tip = simple
    ? feedback.passed
      ? null
      : feedback.analysisUnavailable
        ? "Deine Aussprache konnte gerade nicht bewertet werden. Versuch es gleich noch einmal."
        : feedback.tip
    : feedback.tip;
  const Icon = feedback.tone === "success" ? CheckCircle2 : feedback.tone === "retry" ? Sparkles : AlertCircle;

  return (
    <div
      data-testid={testId}
      data-tone={feedback.tone}
      data-passed={feedback.passed}
      className={cn("animate-fade-in rounded-2xl border p-4 text-left", style.box)}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 h-6 w-6 shrink-0", style.text)} aria-hidden />
        <div className="min-w-0 flex-1">
          <p
            lang={simple && feedback.passed ? "ar" : undefined}
            className={cn("text-base font-bold", simple && feedback.passed && "font-arabic text-xl", style.text)}
            data-testid={testId ? `${testId}-headline` : undefined}
          >
            {headline}
          </p>
          {tip && <p className="mt-1 text-sm text-foreground/80">{tip}</p>}
        </div>
      </div>

      {!simple && feedback.ruleMessage && (
        <p lang="ar" dir="rtl" className="mt-3 rounded-xl bg-card/70 px-3 py-2 text-right text-lg leading-relaxed" data-testid={testId ? `${testId}-message` : undefined}>
          {feedback.ruleMessage}
        </p>
      )}

      {!simple && feedback.accuracy !== null && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <span>Genauigkeit</span>
            <span className={cn("text-sm font-bold", style.text)}>{feedback.accuracy} %</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-card" role="presentation">
            <div className={cn("h-full rounded-full transition-all", style.bar)} style={{ width: `${Math.max(4, Math.min(100, feedback.accuracy))}%` }} />
          </div>
        </div>
      )}

      {!feedback.passed && (
        <button
          type="button"
          onClick={onRetry}
          disabled={retryDisabled}
          data-testid={testId ? `${testId}-retry` : undefined}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-card px-3 py-2 text-sm font-semibold shadow-sm transition hover:bg-muted focus-ring disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Nochmal versuchen
        </button>
      )}
    </div>
  );
}
