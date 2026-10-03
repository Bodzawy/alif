"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Lock, SkipForward } from "lucide-react";

import { PronunciationExercise } from "@/components/pronunciation/pronunciation-exercise";
import { Button, buttonClasses } from "@/components/ui/button";
import { ALPHABET, ALPHABET_LEVEL, alphabetLetterHref, getAlphabetLetter } from "@/data/alphabet";
import type { StudentFeedback } from "@/lib/pronunciation/client";

import { AlphabetComplete } from "./alphabet-complete";
import { StatusBadge } from "./status-badge";
import { useAlphabetProgress } from "./use-alphabet-progress";

// One A0 letter: listen, record, see the result. "Weiter" unlocks only when the
// pronunciation API answered `passed: true`; "Überspringen" is a technical
// escape hatch that opens the next letter without counting this one as mastered.
export function LetterPractice({ letterId, nextLevelHref }: { letterId: string; nextLevelHref: string }) {
  const router = useRouter();
  const { hydrated, summary, markMastered, markSkipped } = useAlphabetProgress();
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(false);

  const letter = getAlphabetLetter(letterId)!;
  const next = ALPHABET[letter.position];
  const total = ALPHABET.length;
  const status = summary.statuses[letter.id]!;
  const mastered = status === "mastered";

  const onResult = useCallback(
    (feedback: StudentFeedback) => {
      if (feedback.passed) markMastered(letter.id);
    },
    [letter.id, markMastered]
  );

  function goNext() {
    if (next) router.push(alphabetLetterHref(next.id));
    else {
      setFinished(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function skip() {
    markSkipped(letter.id);
    goNext();
  }

  if (finished) return <AlphabetComplete summary={summary} nextLevelHref={nextLevelHref} />;

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

      <section aria-labelledby="letter-name" data-testid="letter-practice" data-status={hydrated ? status : "loading"} className="rounded-3xl border bg-card p-6 text-center shadow-card sm:p-10">
        <div className="mb-6 flex min-h-6 justify-center" data-testid="letter-status">{hydrated && status !== "available" && <StatusBadge status={status} />}</div>

        <div lang="ar" dir="rtl" data-testid="letter-glyph" className="select-none font-arabic text-[9rem] font-bold leading-[1.45] text-primary sm:text-[11rem]">
          {letter.glyph}
        </div>
        <h1 id="letter-name" lang="ar" dir="rtl" data-testid="letter-name" className="font-arabic text-4xl text-foreground">
          {letter.modelText}
        </h1>

        {!hydrated ? (
          <div className="mx-auto mt-8 h-24 max-w-sm animate-pulse rounded-2xl bg-muted" aria-hidden />
        ) : status === "locked" ? (
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
          <>
            <PronunciationExercise exercise={letter.exercise} onBusyChange={setBusy} onResult={onResult} className="mx-auto mt-8 w-full max-w-sm" />

            <div className="mx-auto mt-6 flex max-w-sm flex-col gap-2">
              <Button size="lg" onClick={goNext} disabled={!mastered || busy} data-testid="letter-next" className="w-full">
                {mastered ? null : <Lock className="h-4 w-4" aria-hidden />}
                Weiter
                {mastered ? <ArrowRight className="h-5 w-5" aria-hidden /> : null}
              </Button>
              {!mastered && (
                <>
                  <p className="text-xs text-muted-foreground">„Weiter“ wird frei, sobald deine Aussprache als richtig bewertet wurde.</p>
                  <Button variant="ghost" size="sm" onClick={skip} disabled={busy} data-testid="letter-skip" className="mx-auto mt-2">
                    <SkipForward className="h-4 w-4" aria-hidden />
                    Überspringen
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Nur bei technischen Problemen: Der Buchstabe bleibt als „nicht gemeistert“ markiert und du kannst jederzeit zurückkommen.
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
