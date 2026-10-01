"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Lesson } from "@/data/types";
import type { StudentFeedback } from "@/lib/pronunciation/client";

import { LessonComplete } from "./lesson-complete";
import { LetterHero } from "./letter-hero";
import { useLessonProgress } from "./use-lesson-progress";
import { VocabularyCard } from "./vocabulary-card";

export function LessonPlayer({
  levelSlug,
  levelCode,
  lesson,
  nextLessonHref,
}: {
  levelSlug: string;
  levelCode: string;
  lesson: Lesson;
  nextLessonHref?: string;
}) {
  const { progress, markPassed, markCompleted } = useLessonProgress(levelSlug, lesson.slug);
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const exerciseIds = useMemo(
    () => [lesson.letter.exercise.id, ...lesson.vocabulary.map((item) => item.exercise.id)],
    [lesson]
  );
  const passedCount = exerciseIds.filter((id) => progress.passed.includes(id)).length;
  const total = exerciseIds.length;
  const canContinue = passedCount === total;

  // One recording at a time across the whole lesson.
  const busyHandlers = useMemo(() => {
    const handlers: Record<string, (busy: boolean) => void> = {};
    for (const id of exerciseIds) {
      handlers[id] = (busy) => setActiveExercise((current) => (busy ? id : current === id ? null : current));
    }
    return handlers;
  }, [exerciseIds]);

  const resultHandler = useCallback(
    (id: string) => (feedback: StudentFeedback) => {
      if (feedback.passed) markPassed(id);
    },
    [markPassed]
  );

  function finish() {
    if (!canContinue) return;
    markCompleted();
    setFinished(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (finished) {
    return (
      <LessonComplete
        lesson={lesson}
        levelHref={`/${levelSlug}`}
        levelCode={levelCode}
        nextLessonHref={nextLessonHref}
        onRepeat={() => setFinished(false)}
      />
    );
  }

  const lockedFor = (id: string) => activeExercise !== null && activeExercise !== id;

  return (
    <div className="container max-w-6xl py-6 sm:py-10">
      <nav aria-label="Brotkrumen" className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/${levelSlug}`} className="inline-flex items-center gap-1 rounded-md hover:text-foreground focus-ring">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {levelCode}
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-foreground">Lektion {lesson.number}</span>
      </nav>

      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">
            {levelCode} · Lektion {lesson.number}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{lesson.title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{lesson.subtitle}</p>
        </div>
        <div className="w-full sm:w-64" data-testid="lesson-progress">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Fortschritt</span>
            <span className="font-semibold">
              {passedCount} / {total}
            </span>
          </div>
          <div
            className="mt-2 h-2.5 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label="Lektionsfortschritt"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={passedCount}
          >
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(passedCount / total) * 100}%` }} />
          </div>
        </div>
      </header>

      <LetterHero
        letter={lesson.letter}
        passed={progress.passed.includes(lesson.letter.exercise.id)}
        locked={lockedFor(lesson.letter.exercise.id)}
        onBusyChange={busyHandlers[lesson.letter.exercise.id]!}
        onResult={resultHandler(lesson.letter.exercise.id)}
      />

      <section aria-labelledby="vocab-heading" className="mt-10 sm:mt-14">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Schritt 2 · Wortschatz</p>
          <h2 id="vocab-heading" className="mt-3 flex items-center gap-2 text-2xl font-bold tracking-tight">
            Wörter mit <span lang="ar" dir="rtl" className="inline-block font-arabic text-3xl leading-[1.6] text-primary">{lesson.letter.glyph}</span>
          </h2>
          <p className="mt-1 text-muted-foreground">Hör dir jedes Wort an, sprich es nach und erhalte direkt Feedback.</p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {lesson.vocabulary.map((item) => (
            <VocabularyCard
              key={item.id}
              item={item}
              passed={progress.passed.includes(item.exercise.id)}
              locked={lockedFor(item.exercise.id)}
              onBusyChange={busyHandlers[item.exercise.id]!}
              onResult={resultHandler(item.exercise.id)}
            />
          ))}
        </div>
      </section>

      <footer className="mt-10 flex flex-col items-center gap-3 rounded-3xl border bg-card p-6 text-center shadow-card sm:mt-14 sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="font-semibold">{canContinue ? "Stark! Du hast alle Übungen geschafft." : "Sprich alle Übungen richtig aus, um weiterzumachen."}</p>
          <p className="text-sm text-muted-foreground">
            {passedCount} von {total} Übungen geschafft
          </p>
        </div>
        <Button size="lg" onClick={finish} disabled={!canContinue} data-testid="continue-button" className="w-full sm:w-auto">
          {canContinue ? null : <Lock className="h-4 w-4" aria-hidden />}
          Weiter
          {canContinue ? <ArrowRight className="h-5 w-5" aria-hidden /> : null}
        </Button>
      </footer>
    </div>
  );
}
