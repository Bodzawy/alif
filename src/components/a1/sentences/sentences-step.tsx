"use client";

import { useState, useSyncExternalStore } from "react";
import { RotateCcw } from "lucide-react";

import { Sheet, SheetHeader, SheetRow, tileClass } from "@/components/a1/worksheet";
import { Button } from "@/components/ui/button";
import type { SentenceItem } from "@/data/types";
import { getLessonProgress, markLessonCompleted, subscribeProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

// Step type "sentences" – the book's "رتب الكلمات لتكون جملا": all the exercises on one sheet. Every
// exercise is a row: tap the words below in the right order, they line up in the sentence (right to
// left). Tap a word in the sentence to take it out again. A full sentence turns green when it is right
// and red when it is not. Done when every sentence is right.

const noop = () => () => undefined;

export function SentencesStep({ items, progressKey }: { items: SentenceItem[]; progressKey: string }) {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const completedBefore = useSyncExternalStore(subscribeProgress, () => Boolean(getLessonProgress(progressKey).completedAt), () => false);
  /** Per exercise: the indexes of its words, in the order the learner put them. */
  const [placed, setPlaced] = useState<Record<string, number[]>>({});

  const rightIn = (all: Record<string, number[]>, item: SentenceItem) => {
    const mine = all[item.id] ?? [];
    return mine.length === item.words.length && item.solutions.some((solution) => solution.every((word, i) => mine[i] === word));
  };
  const rightCount = items.filter((item) => rightIn(placed, item)).length;

  function set(item: SentenceItem, next: number[]) {
    const all = { ...placed, [item.id]: next };
    setPlaced(all);
    if (items.every((other) => rightIn(all, other))) markLessonCompleted(progressKey);
  }

  return (
    <Sheet testId="sentences-step">
      <SheetHeader label={`${rightCount} von ${items.length} richtig`} ratio={rightCount / items.length} done={hydrated && (completedBefore || rightCount === items.length)} testId="sentences-count" />
      <div role="list">
        {items.map((item, i) => {
          const mine = placed[item.id] ?? [];
          const full = mine.length === item.words.length;
          const right = rightIn(placed, item);
          const left = item.words.map((_, w) => w).filter((w) => !mine.includes(w));
          return (
            <div key={item.id} role="listitem">
              <SheetRow number={item.number} state={right ? "right" : "open"} ruled={i > 0} testId={`sentence-${item.id}`} dataState={right ? "right" : full ? "wrong" : "open"}>
                <div
                  className={cn(
                    "flex min-h-16 flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed px-3 py-2 transition",
                    right && "border-success bg-success-soft",
                    full && !right && "border-destructive bg-destructive/10"
                  )}
                  data-testid={`sentence-line-${item.id}`}
                >
                  {mine.length === 0 && (
                    <span dir="ltr" className="px-1 text-sm text-muted-foreground">
                      Tippe die Wörter in der richtigen Reihenfolge an …
                    </span>
                  )}
                  {mine.map((w) => (
                    <button key={w} type="button" onClick={() => set(item, mine.filter((x) => x !== w))} disabled={right} data-testid={`sentence-placed-${item.id}-${w}`} className={cn(tileClass, "bg-card disabled:cursor-default")}>
                      <span lang="ar">{item.words[w]}</span>
                    </button>
                  ))}
                </div>
                {full && !right && (
                  <p dir="ltr" className="mt-2 text-sm font-semibold text-destructive" role="status" data-testid={`sentence-wrong-${item.id}`}>
                    Nicht ganz – tippe ein Wort im Satz an, um es wieder herauszunehmen.
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <div className="flex flex-1 flex-wrap gap-2">
                    {left.map((w) => (
                      <button key={w} type="button" onClick={() => set(item, [...mine, w])} data-testid={`sentence-word-${item.id}-${w}`} className={tileClass}>
                        <span lang="ar">{item.words[w]}</span>
                      </button>
                    ))}
                  </div>
                  {mine.length > 0 && !right && (
                    <Button type="button" variant="secondary" size="sm" onClick={() => set(item, [])} data-testid={`sentence-reset-${item.id}`}>
                      <RotateCcw className="h-4 w-4" aria-hidden /> Neu
                    </Button>
                  )}
                </div>
              </SheetRow>
            </div>
          );
        })}
      </div>
    </Sheet>
  );
}
