"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import { CheckCircle2 } from "lucide-react";

import { usePracticeSession } from "@/components/a1/use-practice-session";
import { PronunciationExercise } from "@/components/pronunciation/pronunciation-exercise";
import { MixedText } from "@/components/ui/mixed-text";
import type { PhraseGroup, PhraseItem } from "@/data/types";
import { getLessonProgress, markExercisePassed, markLessonCompleted, subscribeProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/use-locale";

// Step type "phrases": the expressions of a textbook table as cards – Arabic,
// transliteration, German, who says it (masculine / feminine form) – each with
// "Anhören" and "Aufnehmen" (PronunciationExercise: the same /api/pronunciation
// evaluation as every A1 exercise). The step is done when every expression was
// right once; passed expressions stay marked.

const noop = () => () => undefined;

const GENDER = {
  m: { sign: "♂", className: "border-primary/50 bg-primary-soft text-primary" },
  f: { sign: "♀", className: "border-accent/60 bg-accent-soft text-accent-foreground" },
} as const;

export function PhrasesStep({ groups, progressKey }: { groups: PhraseGroup[]; progressKey: string }) {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const stored = useSyncExternalStore(subscribeProgress, () => getLessonProgress(progressKey), () => null);
  const session = usePracticeSession();
  const t = useT();
  const items = useMemo(() => groups.flatMap((group) => group.items), [groups]);
  const isPassed = (item: PhraseItem) => session.passed.has(item.exercise.id) || Boolean(stored?.passed.includes(item.id));
  const passedCount = items.filter(isPassed).length;
  const completed = Boolean(stored?.completedAt) || passedCount === items.length;

  useEffect(() => {
    for (const id of session.passed) markExercisePassed(progressKey, id);
    if (items.every((item) => session.passed.has(item.exercise.id) || getLessonProgress(progressKey).passed.includes(item.id))) markLessonCompleted(progressKey);
  }, [session.passed, items, progressKey]);

  return (
    <div data-testid="phrases-step">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-muted-foreground" data-testid="phrases-count" aria-live="polite">
          {hydrated ? t("{n} von {total} richtig gesprochen", { n: passedCount, total: items.length }) : `${items.length}`}
        </p>
        {hydrated && completed && (
          <p className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow" data-testid="step-completed">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> {t("Geschafft")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-8">
        {groups.map((group) => (
          <section key={group.id} aria-labelledby={`group-${group.id}`} data-testid={`phrase-group-${group.id}`}>
            <h2 id={`group-${group.id}`} className="mb-3 text-lg font-bold">
              {t(group.title)}
            </h2>
            <ul className="grid gap-4 sm:grid-cols-2">
              {group.items.map((item) => (
                <li key={item.id} className={cn("flex flex-col rounded-3xl border bg-card p-4 shadow-card sm:p-5", isPassed(item) && hydrated && "border-success/50")} data-testid={`phrase-${item.id}`} data-gender={item.gender}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {item.tag ? (
                      // Whom it is said to (zu einem Mann / zu einer Frau): large and coloured, so the form is not missed.
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1",
                          item.gender ? cn("border-2 text-sm font-bold sm:text-base", GENDER[item.gender].className) : "border bg-muted text-xs font-semibold text-muted-foreground"
                        )}
                        data-testid={`phrase-tag-${item.id}`}
                      >
                        {item.gender && (
                          <span aria-hidden className="text-base sm:text-lg">
                            {GENDER[item.gender].sign}
                          </span>
                        )}
                        {t(item.tag)}
                      </span>
                    ) : (
                      <span />
                    )}
                    {hydrated && isPassed(item) && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-success" data-testid={`phrase-passed-${item.id}`}>
                        <CheckCircle2 className="h-4 w-4" aria-hidden /> {t("Richtig")}
                      </span>
                    )}
                  </div>
                  <p lang="ar" dir="rtl" className="mt-2 text-right font-arabic text-4xl font-bold leading-[1.9]" data-testid={`phrase-arabic-${item.id}`}>
                    {item.arabic}
                  </p>
                  <p className="text-sm font-medium italic text-muted-foreground" data-testid={`phrase-translit-${item.id}`}>
                    {item.transliteration}
                  </p>
                  <p className="font-semibold" data-testid={`phrase-german-${item.id}`}>
                    {t(item.german)}
                    {item.literal && (
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        ({t("wörtlich")}: {t(item.literal)})
                      </span>
                    )}
                  </p>
                  <PronunciationExercise
                    exercise={item.exercise}
                    locked={session.isLocked(item.exercise.id)}
                    onBusyChange={session.busyHandler(item.exercise.id)}
                    onResult={session.resultHandler(item.exercise.id)}
                    className="mt-auto pt-4"
                    simpleFeedback
                  />
                </li>
              ))}
            </ul>
            {group.note && (
              <p className="mt-3 rounded-2xl border border-primary/15 bg-primary-soft px-4 py-3 text-sm" data-testid={`phrase-note-${group.id}`}>
                <MixedText text={t(group.note)} />
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
