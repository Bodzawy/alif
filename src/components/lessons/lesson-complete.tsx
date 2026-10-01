import Link from "next/link";
import { ArrowRight, RotateCcw, Trophy } from "lucide-react";

import { Button, buttonClasses } from "@/components/ui/button";
import type { Lesson } from "@/data/types";

export function LessonComplete({
  lesson,
  levelHref,
  levelCode,
  nextLessonHref,
  onRepeat,
}: {
  lesson: Lesson;
  levelHref: string;
  levelCode: string;
  nextLessonHref?: string;
  onRepeat: () => void;
}) {
  return (
    <div className="container max-w-2xl py-10 sm:py-16" data-testid="lesson-complete">
      <div className="animate-fade-in rounded-3xl border bg-card p-6 text-center shadow-lift sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <Trophy className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight">Lektion {lesson.number} geschafft!</h1>
        <p className="mt-2 text-muted-foreground">
          Du kennst jetzt den Buchstaben <span className="font-semibold text-foreground">{lesson.letter.name}</span> und{" "}
          {lesson.vocabulary.length} neue Wörter.
        </p>

        <ul className="mt-6 grid gap-2 text-left sm:grid-cols-2">
          <li className="flex items-center justify-between rounded-2xl bg-primary-soft px-4 py-3">
            <span className="font-medium">{lesson.letter.name}</span>
            <span lang="ar" dir="rtl" className="text-3xl text-primary">{lesson.letter.glyph}</span>
          </li>
          {lesson.vocabulary.map((item) => (
            <li key={item.id} className="flex items-center justify-between rounded-2xl bg-muted px-4 py-3">
              <span>
                <span className="font-medium">{item.german}</span>
                <span className="block text-xs italic text-muted-foreground">{item.transliteration}</span>
              </span>
              <span lang="ar" dir="rtl" className="text-2xl text-primary">{item.arabic}</span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="secondary" size="lg" onClick={onRepeat}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            Nochmal üben
          </Button>
          {nextLessonHref ? (
            <Link href={nextLessonHref} className={buttonClasses({ size: "lg" })}>
              Nächste Lektion <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          ) : (
            <Link href={levelHref} className={buttonClasses({ size: "lg" })} data-testid="back-to-level">
              Zurück zu {levelCode} <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
