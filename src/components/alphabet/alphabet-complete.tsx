import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";

import { buttonClasses } from "@/components/ui/button";
import { ALPHABET, ALPHABET_LEVEL, alphabetLetterHref, getAlphabetLetter } from "@/data/alphabet";
import type { alphabetSummary } from "@/lib/alphabet-progress";

export function AlphabetComplete({ summary, nextLevelHref }: { summary: ReturnType<typeof alphabetSummary>; nextLevelHref: string }) {
  const open = summary.notMastered.map((id) => getAlphabetLetter(id)!);

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

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
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
