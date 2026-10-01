import { CheckCircle2 } from "lucide-react";

import { PronunciationExercise } from "@/components/pronunciation/pronunciation-exercise";
import type { LessonLetter } from "@/data/types";
import type { StudentFeedback } from "@/lib/pronunciation/client";

export function LetterHero({
  letter,
  passed,
  locked,
  onBusyChange,
  onResult,
}: {
  letter: LessonLetter;
  passed: boolean;
  locked: boolean;
  onBusyChange: (busy: boolean) => void;
  onResult: (feedback: StudentFeedback) => void;
}) {
  return (
    <section aria-labelledby="letter-heading" className="overflow-hidden rounded-3xl border bg-card shadow-card">
      <div className="grid md:grid-cols-[1.1fr_1fr]">
        <div className="pattern-dots relative flex flex-col items-center justify-center bg-primary-soft/60 px-6 py-10 sm:py-14">
          {passed && (
            <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Geschafft
            </span>
          )}
          <div
            lang="ar"
            dir="rtl"
            data-testid="lesson-letter"
            aria-label={`Der Buchstabe ${letter.name}`}
            className="select-none font-arabic pt-4 text-[9rem] font-bold leading-[1.45] text-primary sm:text-[11rem]"
          >
            {letter.glyph}
          </div>
          {letter.forms && (
            <ul className="mt-2 flex flex-wrap justify-center gap-2" aria-label="Buchstabenformen">
              {letter.forms.map((form) => (
                <li key={form.label} className="flex min-w-16 flex-col items-center rounded-xl bg-card/80 px-3 py-1.5 shadow-sm">
                  <span lang="ar" dir="rtl" className="text-2xl leading-tight">{form.glyph}</span>
                  <span className="text-[11px] font-medium text-muted-foreground">{form.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col justify-center gap-5 p-6 sm:p-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Schritt 1 · Der Buchstabe</p>
            <h2 id="letter-heading" className="mt-1 flex flex-wrap items-baseline gap-x-3 text-3xl font-bold tracking-tight">
              {letter.name}
              <span lang="ar" dir="rtl" className="text-3xl font-normal text-muted-foreground">{letter.nameArabic}</span>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Laut: <span className="font-semibold text-foreground">„{letter.transliteration}“</span>
            </p>
            <p className="mt-3 leading-relaxed text-foreground/80">{letter.soundHint}</p>
          </div>

          <div className="rounded-2xl bg-muted/60 p-4">
            <p className="mb-3 text-sm font-medium">
              Hör dir den Namen des Buchstabens an und sprich ihn nach: <span lang="ar" dir="rtl" className="text-lg">{letter.exercise.modelText}</span>
            </p>
            <PronunciationExercise exercise={letter.exercise} locked={locked} onBusyChange={onBusyChange} onResult={onResult} />
          </div>
        </div>
      </div>
    </section>
  );
}
