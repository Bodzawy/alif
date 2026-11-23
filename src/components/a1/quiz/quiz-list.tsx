"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { Check, X } from "lucide-react";

import { ListenButton } from "@/components/a1/listen-button";
import { Sheet, SheetHeader, SheetRow, TaskBand, arabicNumber } from "@/components/a1/worksheet";
import type { QuizItem } from "@/data/types";
import { getLessonProgress, markLessonCompleted, subscribeProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

// All the questions of a page on ONE sheet (see worksheet.tsx): the book's task lines as bands, every
// question as a row (number · question · answers). A wrong answer is marked and can be changed; the
// step is done when every question is answered right.

const noop = () => () => undefined;

export function QuizList({ items, progressKey }: { items: QuizItem[]; progressKey: string }) {
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

  /** 1, 2, 3 … – starts again with 1 at every item that has a task line. */
  const numberOf = (index: number) => {
    let start = 0;
    for (let n = 0; n <= index; n++) if (items[n]!.section) start = n;
    return index - start + 1;
  };

  return (
    <Sheet testId="quiz-list">
      <SheetHeader label={`${right} von ${keys.length} richtig`} ratio={keys.length ? right / keys.length : 0} done={hydrated && (completedBefore || right === keys.length)} testId="quiz-count" />
      <div role="list">
        {items.map((item, i) => {
          const itemRight = item.questions.every((q, n) => answers[`${item.id}:${n}`] === q.answer);
          return (
            <div key={item.id} role="listitem" data-testid={`quiz-item-${item.id}`}>
              {item.section && <TaskBand arabic={item.section.arabic} german={item.section.german} first={i === 0} testId={`quiz-section-${item.id}`} />}
              <SheetRow number={arabicNumber(numberOf(i))} state={itemRight ? "right" : "open"} ruled={!item.section && i > 0}>
                <div className="flex items-start justify-between gap-3">
                  {item.show !== false && (
                    <p lang="ar" className="font-arabic text-2xl font-bold leading-[1.8] sm:text-3xl" data-testid={`quiz-word-${item.id}`}>
                      {item.arabic}
                    </p>
                  )}
                  <ListenButton text={item.spoken ?? item.arabic} compact label={`Anhören: ${item.german ?? item.arabic}`} testId={`quiz-listen-${item.id}`} />
                </div>
                {item.german && (
                  <p dir="ltr" className="text-right text-sm text-muted-foreground">
                    {item.german}
                  </p>
                )}
                {item.image && (
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    width={item.image.wide ? 1200 : 160}
                    height={item.image.wide ? 800 : 120}
                    unoptimized
                    className={item.image.wide ? "mt-3 h-auto w-full max-w-md rounded-2xl border" : "mt-3 rounded-2xl"}
                    data-testid={`quiz-image-${item.id}`}
                  />
                )}
                {item.questions.map((q, n) => {
                  const key = `${item.id}:${n}`;
                  const chosen = answers[key];
                  const short = q.options.every((option) => option.length <= 10);
                  return (
                    <div key={key} className="mt-4" data-testid={`quiz-${item.id}-${n}`} data-correct={chosen === undefined ? "" : chosen === q.answer ? "true" : "false"}>
                      <div className={cn("gap-2.5", short ? "flex flex-wrap" : "flex flex-col")}>
                        {q.options.map((option, o) => {
                          const picked = chosen === o;
                          const ok = o === q.answer;
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => choose(key, o)}
                              aria-pressed={picked}
                              data-testid={`quiz-${item.id}-${n}-option-${o}`}
                              className={cn(
                                "flex min-h-12 items-center justify-between gap-3 rounded-2xl border px-4 py-2 text-start font-arabic text-xl font-bold leading-[1.7] transition focus-ring sm:text-2xl",
                                short && "min-w-32 justify-center",
                                picked ? (ok ? "border-success bg-success-soft text-success" : "border-destructive bg-destructive/10 text-destructive") : "bg-background hover:border-primary/50 hover:bg-primary-soft/50"
                              )}
                            >
                              {option.startsWith("/images/") ? <Image src={option} alt={`Bild ${o + 1}`} width={96} height={72} unoptimized /> : <span lang="ar">{option}</span>}
                              {picked && (ok ? <Check className="h-5 w-5 shrink-0" aria-label="richtig" /> : <X className="h-5 w-5 shrink-0" aria-label="falsch – wähle neu" />)}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </SheetRow>
            </div>
          );
        })}
      </div>
    </Sheet>
  );
}
