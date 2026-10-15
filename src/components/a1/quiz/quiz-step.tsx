"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { CheckCircle2, XCircle } from "lucide-react";

import { ListenButton } from "@/components/a1/listen-button";
import type { QuizItem } from "@/data/types";
import { getLessonProgress, markLessonCompleted, subscribeProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

// Step type "quiz" – e.g. Unit 2 · "اسمع المدرس وعين الحرف الأول والأخير":
// each word with "Anhören" and its questions (German prompt, Arabic tiles).
// A wrong tile is marked and can be changed; the step is done when every
// question of every word is answered right.

const noop = () => () => undefined;

export function QuizStep({ items, progressKey }: { items: QuizItem[]; progressKey: string }) {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const completedBefore = useSyncExternalStore(subscribeProgress, () => Boolean(getLessonProgress(progressKey).completedAt), () => false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const keys = items.flatMap((item) => item.questions.map((q, n) => ({ key: `${item.id}:${n}`, answer: q.answer })));
  const right = keys.filter((k) => answers[k.key] === k.answer).length;

  function choose(key: string, option: number) {
    const next = { ...answers, [key]: option };
    setAnswers(next);
    if (keys.every((k) => next[k.key] === k.answer)) markLessonCompleted(progressKey);
  }

  return (
    <div data-testid="quiz-step">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-muted-foreground" aria-live="polite" data-testid="quiz-count">
          {right} von {keys.length} richtig
        </p>
        {hydrated && (completedBefore || right === keys.length) && (
          <p className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow" data-testid="step-completed">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Geschafft
          </p>
        )}
      </div>
      <ol className="grid gap-4 sm:grid-cols-2">
        {items.map((item, i) => (
          <li key={item.id} className="rounded-3xl border bg-card p-4 shadow-card" data-testid={`quiz-item-${item.id}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-muted-foreground">{i + 1}</span>
              {item.show !== false && (
                <span lang="ar" dir="rtl" className="font-arabic text-4xl font-bold leading-[1.8]" data-testid={`quiz-word-${item.id}`}>
                  {item.arabic}
                </span>
              )}
              <ListenButton text={item.spoken ?? item.arabic} compact label={`Anhören: ${item.german ?? item.arabic}`} testId={`quiz-listen-${item.id}`} />
            </div>
            {item.image && (
              <Image src={item.image.src} alt={item.image.alt} width={160} height={120} unoptimized className="mx-auto mt-2 rounded-2xl" data-testid={`quiz-image-${item.id}`} />
            )}
            {item.german && <p className="text-right text-sm text-muted-foreground">{item.german}</p>}
            {item.questions.map((q, n) => {
              const key = `${item.id}:${n}`;
              const chosen = answers[key];
              return (
                <div key={key} className="mt-3" data-testid={`quiz-${item.id}-${n}`} data-correct={chosen === undefined ? "" : chosen === q.answer ? "true" : "false"}>
                  <p className="text-sm font-semibold">{q.prompt}</p>
                  <div dir="rtl" className="mt-1 flex flex-wrap gap-2">
                    {q.options.map((option, o) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => choose(key, o)}
                        aria-pressed={chosen === o}
                        data-testid={`quiz-${item.id}-${n}-option-${o}`}
                        className={cn(
                          "flex h-12 min-w-12 items-center justify-center rounded-xl border bg-card px-3 font-arabic text-2xl font-bold transition focus-ring hover:bg-muted",
                          chosen === o && (o === q.answer ? "border-success bg-success-soft text-success" : "border-destructive bg-destructive/10 text-destructive")
                        )}
                      >
                        {option.startsWith("/images/") ? (
                          <Image src={option} alt={`Bild ${o + 1}`} width={96} height={72} unoptimized />
                        ) : (
                          <span lang="ar">{option}</span>
                        )}
                      </button>
                    ))}
                    {chosen !== undefined &&
                      (chosen === q.answer ? <CheckCircle2 className="h-6 w-6 self-center text-success" aria-label="richtig" /> : <XCircle className="h-6 w-6 self-center text-destructive" aria-label="falsch – wähle neu" />)}
                  </div>
                </div>
              );
            })}
          </li>
        ))}
      </ol>
    </div>
  );
}
