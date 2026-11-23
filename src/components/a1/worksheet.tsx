import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

import { MixedText } from "@/components/ui/mixed-text";
import { cn } from "@/lib/utils";

// The look of an exercise page, one language for every worksheet-type step (questions, reading,
// sentences, writing): a printed textbook page. The card has a gold rule on top like the book's
// boxes, numbers stand on the RIGHT (Arabic is read from the right), the book's task line is a band
// across the card, and colour is used for one thing each: teal = structure, green / red = verdict.

const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
/** 12 → "١٢" – the numbering of the book. */
export const arabicNumber = (n: number | string) => String(n).replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)]!);

/** A word tile (a choice, a word to put in order): one size and one shape everywhere. */
export const tileClass =
  "min-h-11 rounded-xl border bg-background px-3 font-arabic text-2xl font-bold leading-[1.7] transition focus-ring enabled:hover:border-primary enabled:hover:bg-primary-soft";

export function Sheet({ children, testId }: { children: ReactNode; testId?: string }) {
  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-t-4 border-t-brand-gold bg-card shadow-card" data-testid={testId}>
      {children}
    </div>
  );
}

/** The top of a sheet: "x von n …", a progress bar and the "Geschafft" mark. */
export function SheetHeader({ label, done, ratio, testId }: { label: string; done: boolean; ratio: number; testId?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b px-5 py-3.5 sm:px-7">
      <p className="text-sm font-semibold text-muted-foreground" aria-live="polite" data-testid={testId}>
        {label}
      </p>
      <div className="h-1.5 min-w-24 flex-1 overflow-hidden rounded-full bg-border" role="presentation">
        <div className="h-full rounded-full bg-primary transition-[width] duration-500" style={{ width: `${Math.round(Math.min(1, Math.max(0, ratio)) * 100)}%` }} />
      </div>
      {done && (
        <p className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground" data-testid="step-completed">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Geschafft
        </p>
      )}
    </div>
  );
}

/** The book's task line: Arabic on the right, the German meaning on the left. */
export function TaskBand({ arabic, german, first, testId }: { arabic: string; german: string; first?: boolean; testId?: string }) {
  return (
    <div dir="rtl" className={cn("flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 bg-primary-soft/50 px-5 py-3 sm:px-7", !first && "border-t")} data-testid={testId}>
      <p lang="ar" className="font-arabic text-2xl font-bold leading-[1.7] text-primary">
        {arabic}
      </p>
      <p dir="ltr" className="text-sm font-medium text-muted-foreground">
        <MixedText text={german} />
      </p>
    </div>
  );
}

/** A task line without a card around it (above a block that has its own card). */
export function TaskHeading({ arabic, german }: { arabic: string; german: string }) {
  return (
    <div dir="rtl" className="mb-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-1">
      <p lang="ar" className="font-arabic text-2xl font-bold leading-[1.7]">
        {arabic}
      </p>
      <p dir="ltr" className="text-sm font-medium text-muted-foreground">
        <MixedText text={german} />
      </p>
    </div>
  );
}

/** One exercise of a sheet: its number on the right, the content next to it. */
export function SheetRow({ number, state = "open", ruled = true, children, testId, dataState }: { number: string; state?: "open" | "right"; ruled?: boolean; children: ReactNode; testId?: string; dataState?: string }) {
  return (
    <div dir="rtl" className={cn("flex items-start gap-4 px-5 py-5 sm:px-7", ruled && "border-t")} data-testid={testId} data-state={dataState}>
      <span
        className={cn(
          "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-arabic text-lg font-bold transition",
          state === "right" ? "border-success bg-success text-success-foreground" : "bg-background text-muted-foreground"
        )}
        aria-hidden
      >
        {state === "right" ? "✓" : number}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/** The answer of the check under a free exercise: right / hint (not sure) / wrong, with the reason and a model answer. */
export function VerdictNote({ level, messages, model, testId }: { level: "ok" | "hint" | "wrong"; messages: string[]; model?: string; testId?: string }) {
  const Icon = level === "ok" ? CheckCircle2 : level === "hint" ? AlertTriangle : XCircle;
  return (
    <div
      role="status"
      className={cn(
        "mt-3 rounded-2xl border px-4 py-3 text-sm",
        level === "ok" && "border-success/40 bg-success-soft text-success",
        level === "hint" && "border-warning/40 bg-warning-soft text-warning",
        level === "wrong" && "border-destructive/40 bg-destructive/5 text-destructive"
      )}
      data-testid={testId}
      data-level={level}
    >
      <p className="flex items-start gap-2 font-semibold">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span dir="ltr">{messages.join(" ")}</span>
      </p>
      {model && (
        <p dir="rtl" className="mt-2 border-t border-current/15 pt-2 font-arabic text-xl font-bold leading-[1.8] text-foreground">
          <span dir="ltr" className="me-2 font-sans text-xs font-semibold text-muted-foreground">
            Beispiel:
          </span>
          {model}
        </p>
      )}
    </div>
  );
}

/** The "Prüfen" button under a free exercise. */
export function CheckBar({ onCheck, disabled, busy, children }: { onCheck: () => void; disabled?: boolean; busy?: boolean; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t bg-muted/30 px-5 py-4 sm:px-7">
      <button
        type="button"
        onClick={onCheck}
        disabled={disabled}
        data-testid="check-writing"
        className="min-h-12 rounded-2xl bg-primary px-6 font-semibold text-primary-foreground shadow transition focus-ring enabled:hover:bg-primary/90 disabled:opacity-50"
      >
        {busy ? "Prüfe …" : "Prüfen"}
      </button>
      <p className="text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
