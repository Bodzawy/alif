"use client";

import Link from "next/link";
import { AlertTriangle, ArrowLeft, CheckCircle2, Loader2, Lock, Mic, RotateCcw, SkipForward, Volume2 } from "lucide-react";

import { Button, buttonClasses } from "@/components/ui/button";
import { ALPHABET, ALPHABET_LEVEL, alphabetLetterHref, getAlphabetLetter } from "@/data/alphabet";
import { cn } from "@/lib/utils";

import { AlphabetComplete } from "./alphabet-complete";
import { StatusBadge } from "./status-badge";
import { useAlphabetProgress } from "./use-alphabet-progress";
import { useLetterDrill } from "./use-letter-drill";

// A0 training round, hands-free: the letter appears and its name is spoken,
// then the microphone listens, the student speaks, the pronunciation API
// decides. Correct → "ممتاز" and the next letter follows by itself; incorrect →
// the name is spoken again and the microphone listens again, until it is right. A letter counts as
// mastered only when the API answered `passed: true`. "Überspringen" is only
// offered on technical errors and never counts as mastery.
export function LetterPractice({ letterId, nextLevelHref }: { letterId: string; nextLevelHref: string }) {
  const { hydrated, summary, markMastered, markSkipped } = useAlphabetProgress();
  const startLetter = getAlphabetLetter(letterId)!;
  const locked = summary.statuses[startLetter.id] === "locked";

  const drill = useLetterDrill({
    startIndex: startLetter.position - 1,
    canStart: hydrated && !locked,
    onMastered: markMastered,
    onSkipped: markSkipped,
  });

  const { letter } = drill;
  const total = ALPHABET.length;
  const status = summary.statuses[letter.id]!;

  if (drill.phase === "completed") {
    return <AlphabetComplete summary={summary} nextLevelHref={nextLevelHref} round={drill.results} onRestart={drill.restart} />;
  }

  const resume = summary.nextToPractice ? getAlphabetLetter(summary.nextToPractice) : undefined;

  return (
    <div className="container max-w-2xl py-6 sm:py-10">
      <nav aria-label="Brotkrumen" className="mb-5 flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <Link href={`/${ALPHABET_LEVEL.slug}`} className="inline-flex items-center gap-1 rounded-md hover:text-foreground focus-ring">
          <ArrowLeft className="h-4 w-4" aria-hidden /> {ALPHABET_LEVEL.code} · Alphabet
        </Link>
        <span data-testid="letter-position">
          Buchstabe {letter.position} von {total}
        </span>
      </nav>

      <div className="mb-6 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Gemeisterte Buchstaben" aria-valuemin={0} aria-valuemax={total} aria-valuenow={hydrated ? summary.masteredCount : 0}>
        <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${hydrated ? (summary.masteredCount / total) * 100 : 0}%` }} />
      </div>

      <section
        aria-labelledby="letter-name"
        data-testid="letter-practice"
        data-status={hydrated ? status : "loading"}
        className="rounded-3xl border bg-card p-6 text-center shadow-card sm:p-10"
      >
        <div className="mb-6 flex min-h-6 justify-center" data-testid="letter-status">{hydrated && status !== "available" && <StatusBadge status={status} />}</div>

        <div key={letter.id} className="animate-fade-in">
          <div lang="ar" dir="rtl" data-testid="letter-glyph" className="select-none font-arabic text-[9rem] font-bold leading-[1.45] text-primary sm:text-[11rem]">
            {letter.glyph}
          </div>
          <h1 id="letter-name" lang="ar" dir="rtl" data-testid="letter-name" className="font-arabic text-4xl text-foreground">
            {letter.modelText}
          </h1>
        </div>

        {!hydrated ? (
          <div className="mx-auto mt-8 h-24 max-w-sm animate-pulse rounded-2xl bg-muted" aria-hidden />
        ) : locked ? (
          <div data-testid="letter-locked" className="mx-auto mt-8 max-w-sm rounded-2xl bg-muted p-5 text-sm">
            <p className="flex items-center justify-center gap-2 font-semibold">
              <Lock className="h-4 w-4" aria-hidden /> Dieser Buchstabe ist noch gesperrt.
            </p>
            <p className="mt-1 text-muted-foreground">Meistere zuerst die Buchstaben davor.</p>
            {resume && (
              <Link href={alphabetLetterHref(resume.id)} className={buttonClasses({ size: "md", className: "mt-4" })}>
                Weiter mit <span lang="ar" className="font-arabic text-xl leading-none">{resume.glyph}</span>
              </Link>
            )}
          </div>
        ) : (
          <DrillPanel drill={drill} />
        )}
      </section>
    </div>
  );
}

type Drill = ReturnType<typeof useLetterDrill>;

/** What the student sees under the letter: when to speak, and the short result. */
function DrillPanel({ drill }: { drill: Drill }) {
  const { phase, mic, speaking } = drill;
  const indicator =
    phase === "listening"
      ? drill.prompting
        ? "prompting"
        : mic === "processing"
        ? "processing"
        : mic === "recording"
          ? speaking
            ? "speaking"
            : "listening"
          : "ready"
      : phase;

  return (
    <div className="mx-auto mt-8 flex min-h-44 max-w-sm flex-col items-center gap-3" data-testid="drill" data-state={indicator}>
      {phase === "correct" ? (
        <div data-testid="drill-feedback" data-result="correct" className="flex animate-fade-in flex-col items-center gap-2 text-success">
          <CheckCircle2 className="h-14 w-14" aria-hidden />
          <p lang="ar" dir="rtl" className="font-arabic text-3xl font-bold">
            مُمْتَاز! 👏
          </p>
        </div>
      ) : phase === "incorrect" || indicator === "prompting" ? (
        <div
          data-testid={phase === "incorrect" ? "drill-feedback" : "drill-prompt"}
          data-result={phase === "incorrect" ? "incorrect" : undefined}
          className="flex animate-fade-in flex-col items-center gap-2 text-primary"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft">
            <Volume2 className="h-7 w-7 animate-pulse" aria-hidden />
          </span>
          <p lang="ar" dir="rtl" className="font-arabic text-4xl font-bold" data-testid="drill-target">
            {drill.letter.modelText}
          </p>
        </div>
      ) : phase === "error" ? (
        <div role="alert" data-testid="drill-error" className="w-full animate-fade-in rounded-2xl border border-destructive/25 bg-destructive-soft p-4 text-left text-sm text-destructive">
          <p className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{drill.error}</span>
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Button onClick={drill.resume} data-testid="drill-retry" className="w-full">
              <RotateCcw className="h-4 w-4" aria-hidden /> Erneut versuchen
            </Button>
            <Button variant="ghost" size="sm" onClick={drill.skip} data-testid="letter-skip" className="mx-auto">
              <SkipForward className="h-4 w-4" aria-hidden /> Überspringen
            </Button>
            <p className="text-center text-xs text-muted-foreground">Der Buchstabe bleibt dann als „nicht gemeistert“ markiert und zählt in dieser Runde 0 Punkte.</p>
          </div>
        </div>
      ) : phase === "paused" ? (
        <button
          type="button"
          onClick={drill.resume}
          data-testid="drill-resume"
          className="flex w-full animate-fade-in flex-col items-center gap-2 rounded-2xl border border-dashed p-5 text-sm text-muted-foreground transition hover:bg-muted focus-ring"
        >
          <Mic className="h-8 w-8 text-primary" aria-hidden />
          <span className="font-semibold text-foreground">Tippe, wenn du bereit bist</span>
          {drill.pausedBy === "no_speech" && <span>Ich konnte dich nicht hören. Sprich laut und nah am Mikrofon.</span>}
        </button>
      ) : (
        <ListeningIndicator state={indicator} />
      )}

      <p aria-live="polite" className="min-h-5 text-sm text-muted-foreground" data-testid="drill-status">
        {phase === "listening" && drill.unclear && mic !== "processing"
          ? "Ich habe dich nicht verstanden – sprich noch einmal deutlich."
          : indicator === "listening" || indicator === "speaking"
            ? "Sprich jetzt den Buchstaben."
            : indicator === "processing"
              ? "Einen Moment …"
              : indicator === "prompting"
                ? "Hör zu …"
                : ""}
      </p>
      {drill.attempts > 0 && phase !== "correct" && (
        <p className="text-xs text-muted-foreground" data-testid="drill-attempt">
          Versuch {drill.attempts + 1}
        </p>
      )}
    </div>
  );
}

function ListeningIndicator({ state }: { state: string }) {
  const listening = state === "listening" || state === "speaking";
  return (
    <span
      aria-label={state === "processing" ? "Wird bewertet" : listening ? "Mikrofon hört zu" : "Mikrofon startet"}
      role="img"
      className={cn(
        "relative flex h-20 w-20 items-center justify-center rounded-full transition-colors",
        listening ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary"
      )}
    >
      {listening && <span aria-hidden className={cn("absolute inset-0 animate-pulse-ring rounded-full bg-primary/40", state === "speaking" && "bg-success/50")} />}
      {state === "processing" ? <Loader2 className="relative h-8 w-8 animate-spin" aria-hidden /> : <Mic className={cn("relative h-8 w-8", state === "ready" && "opacity-60")} aria-hidden />}
    </span>
  );
}
