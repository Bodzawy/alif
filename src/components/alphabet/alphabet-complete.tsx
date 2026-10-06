import Link from "next/link";
import { ArrowRight, RotateCcw, Trophy } from "lucide-react";

import { Button, buttonClasses } from "@/components/ui/button";
import { ALPHABET, ALPHABET_LEVEL, alphabetLetterHref, getAlphabetLetter } from "@/data/alphabet";
import type { alphabetSummary } from "@/lib/alphabet-progress";
import { letterScore, roundScore, scoreRating, type LetterResult } from "@/lib/alphabet-score";
import { cn } from "@/lib/utils";

export function AlphabetComplete({
  summary,
  nextLevelHref,
  round,
  onRestart,
}: {
  summary: ReturnType<typeof alphabetSummary>;
  nextLevelHref: string;
  /** Letters of the training round that just ended, with their attempts. */
  round: LetterResult[];
  onRestart: () => void;
}) {
  const open = summary.notMastered.map((id) => getAlphabetLetter(id)!);
  const score = roundScore(round);
  const rating = scoreRating(score);

  return (
    <div className="container max-w-2xl py-10 sm:py-16" data-testid="alphabet-complete" data-complete={summary.complete}>
      <div className="animate-fade-in rounded-3xl border bg-card p-6 text-center shadow-lift sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <Trophy className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight">
          {summary.complete ? "Alphabet gemeistert!" : "Ende des Alphabets erreicht"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Du hast {summary.masteredCount} von {ALPHABET.length} Buchstaben gemeistert.
        </p>

        <div className="mt-6 rounded-2xl bg-muted p-5" data-testid="round-result" data-score={score}>
          <p lang="ar" dir="rtl" className="font-arabic text-2xl font-bold">
            أحسنت!
          </p>
          <p className="mt-1 text-4xl font-bold tracking-tight" data-testid="round-score">
            Dein Ergebnis: {score} %
          </p>
          <p className="mt-2 font-semibold" data-testid="round-rating">
            <span lang="ar" dir="rtl" className="font-arabic text-lg">{rating.arabic}</span> · {rating.german}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Jeder zusätzliche Versuch kostet 10 Punkte pro Buchstabe. 100 % heißt: jeder Buchstabe beim ersten Versuch richtig.
          </p>
          <ul dir="rtl" className="mt-4 flex flex-wrap justify-center gap-1.5" aria-label="Ergebnis pro Buchstabe">
            {round.map(({ id, attempts }) => {
              const points = letterScore(attempts);
              return (
                <li
                  key={id}
                  data-testid={`round-letter-${id}`}
                  data-attempts={attempts ?? "skipped"}
                  title={attempts === null ? "Übersprungen" : `${attempts} ${attempts === 1 ? "Versuch" : "Versuche"} · ${points} Punkte`}
                  className={cn(
                    "flex w-11 flex-col items-center rounded-lg bg-card py-1 shadow-sm",
                    points === 100 ? "text-success" : points >= 80 ? "text-primary" : "text-warning"
                  )}
                >
                  <span lang="ar" className="font-arabic text-xl leading-snug">{getAlphabetLetter(id)!.glyph}</span>
                  <span dir="ltr" className="text-[10px] font-semibold">{points}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {open.length > 0 && (
          <div className="mt-6 rounded-2xl bg-warning-soft p-4 text-left" data-testid="alphabet-open-letters">
            <p className="text-sm font-semibold text-warning">Noch nicht gemeistert:</p>
            <ul dir="rtl" className="mt-3 flex flex-wrap gap-2">
              {open.map((letter) => (
                <li key={letter.id}>
                  <Link href={alphabetLetterHref(letter.id)} className="flex h-12 w-12 items-center justify-center rounded-xl bg-card font-arabic text-2xl text-primary shadow-sm hover:bg-primary-soft focus-ring">
                    {letter.glyph}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <Button variant="secondary" size="lg" onClick={onRestart} data-testid="round-restart">
            <RotateCcw className="h-5 w-5" aria-hidden /> Runde wiederholen
          </Button>
          <Link href={`/${ALPHABET_LEVEL.slug}`} className={buttonClasses({ variant: "secondary", size: "lg" })}>
            Zur Übersicht
          </Link>
          <Link href={nextLevelHref} className={buttonClasses({ size: "lg" })} data-testid="go-to-a1">
            Weiter zu A1 <ArrowRight className="h-5 w-5" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
