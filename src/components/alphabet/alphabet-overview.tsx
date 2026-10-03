"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, PartyPopper } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { ALPHABET, ALPHABET_LEVEL, alphabetLetterHref, getAlphabetLetter } from "@/data/alphabet";
import { cn } from "@/lib/utils";

import { StatusBadge } from "./status-badge";
import { useAlphabetProgress } from "./use-alphabet-progress";

export function AlphabetOverview({ nextLevelHref }: { nextLevelHref: string }) {
  const { hydrated, summary } = useAlphabetProgress();
  const total = ALPHABET.length;
  const next = summary.nextToPractice ? getAlphabetLetter(summary.nextToPractice) : undefined;

  return (
    <div className="container max-w-5xl py-8 sm:py-12">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 rounded-md text-sm text-muted-foreground hover:text-foreground focus-ring">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Startseite
      </Link>

      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="rounded-2xl bg-primary px-4 py-3 text-3xl font-bold text-primary-foreground">{ALPHABET_LEVEL.code}</span>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{ALPHABET_LEVEL.title}</h1>
            <p className="mt-1 max-w-xl text-muted-foreground">{ALPHABET_LEVEL.description}</p>
          </div>
        </div>
        <div className="w-full sm:w-64" data-testid="alphabet-progress">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Gemeistert</span>
            <span className="font-semibold">{hydrated ? summary.masteredCount : 0} / {total}</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label="Fortschritt im Alphabet" aria-valuemin={0} aria-valuemax={total} aria-valuenow={hydrated ? summary.masteredCount : 0}>
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${hydrated ? (summary.masteredCount / total) * 100 : 0}%` }} />
          </div>
        </div>
      </header>

      {hydrated && summary.complete && (
        <div data-testid="alphabet-complete-banner" className="mt-6 flex flex-col items-start gap-3 rounded-3xl border border-success/30 bg-success-soft p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 font-semibold text-success">
            <PartyPopper className="h-5 w-5" aria-hidden /> Du hast alle {total} Buchstaben gemeistert!
          </p>
          <Link href={nextLevelHref} className={buttonClasses({ size: "md" })}>
            Weiter zu A1 <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      )}

      {hydrated && !summary.complete && summary.notMastered.length > 0 && (
        <div data-testid="alphabet-not-mastered-banner" className="mt-6 rounded-3xl border border-warning/30 bg-warning-soft p-5 text-sm">
          <p className="font-semibold text-warning">
            {summary.notMastered.length === 1 ? "1 Buchstabe ist" : `${summary.notMastered.length} Buchstaben sind`} noch nicht gemeistert.
          </p>
          <p className="mt-1 text-foreground/80">Übersprungene Buchstaben kannst du jederzeit erneut üben – tippe einfach darauf.</p>
        </div>
      )}

      {hydrated && next && !summary.complete && (
        <Link href={alphabetLetterHref(next.id)} className={buttonClasses({ size: "lg", className: "mt-6 w-full sm:w-auto" })} data-testid="alphabet-continue">
          {summary.masteredCount === 0 && summary.notMastered.length === 0 ? "Mit" : "Weiter mit"}{" "}
          <span lang="ar" dir="rtl" className="font-arabic text-2xl leading-none">{next.glyph}</span>
          <ArrowRight className="h-5 w-5" aria-hidden />
        </Link>
      )}

      <ol dir="rtl" className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-7" aria-label="Die 28 Buchstaben">
        {ALPHABET.map((letter) => {
          const status = hydrated ? summary.statuses[letter.id]! : "locked";
          const content = (
            <>
              <span lang="ar" className={cn("font-arabic text-5xl font-bold leading-[1.4]", status === "locked" ? "text-muted-foreground/50" : "text-primary")}>
                {letter.glyph}
              </span>
              <span lang="ar" className="text-sm text-muted-foreground">{letter.modelText}</span>
              <StatusBadge status={status} className="mt-1.5" />
            </>
          );
          const tileClass = "flex flex-col items-center rounded-2xl border bg-card px-2 pb-3 pt-1 text-center shadow-card transition";
          return (
            <li key={letter.id} data-testid={`alphabet-tile-${letter.id}`} data-status={status}>
              {status === "locked" ? (
                <div aria-disabled className={cn(tileClass, "cursor-not-allowed opacity-70 shadow-none")} aria-label={`${letter.modelText} – gesperrt`}>
                  {content}
                </div>
              ) : (
                <Link
                  href={alphabetLetterHref(letter.id)}
                  className={cn(tileClass, "hover:-translate-y-0.5 hover:shadow-lift focus-ring", status === "mastered" && "border-success/40", status === "skipped" && "border-warning/50")}
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
