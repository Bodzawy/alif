"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { CheckCircle2, Repeat } from "lucide-react";

import { ListenButton } from "@/components/a1/listen-button";
import { Button } from "@/components/ui/button";
import { MixedText } from "@/components/ui/mixed-text";
import type { CompareItem, CompareSection } from "@/data/types";
import { getLessonProgress, markExercisePassed, markLessonCompleted, subscribeProgress } from "@/lib/progress";
import { speakArabic } from "@/lib/tts/player";
import { cn } from "@/lib/utils";

// Step type "compare" – "اسمع ولاحظ الفرق في الصوت" (Lektion 2, حروف المد):
// the book's examples in book order, each with "Anhören"; a row of two is a
// pair (long – short) and can be heard one after the other. The book asks the
// learner to listen and notice – nothing is evaluated here (whether IQRA can
// tell a long from a short vowel was not verified). The step is done when every
// example was heard once; heard examples stay marked.

const TAG = {
  long: { label: "lang", className: "border-primary/30 bg-primary-soft text-primary" },
  short: { label: "kurz", className: "border-accent/40 bg-accent-soft text-accent-foreground" },
  hamza: { label: "Hamza", className: "bg-muted text-muted-foreground" },
  consonant: { label: "Konsonant", className: "bg-muted text-muted-foreground" },
} as const;

const noop = () => () => undefined;

export function CompareStep({ sections, progressKey }: { sections: CompareSection[]; progressKey: string }) {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const stored = useSyncExternalStore(subscribeProgress, () => getLessonProgress(progressKey), () => null);
  const [heard, setHeard] = useState<ReadonlySet<string>>(() => new Set());
  const [pairError, setPairError] = useState<string | null>(null);
  const items = sections.flatMap((section) => section.rows.flat());
  const isHeard = (item: CompareItem) => heard.has(item.id) || Boolean(stored?.passed.includes(item.id));
  const count = items.filter(isHeard).length;
  const done = hydrated && (count === items.length || Boolean(stored?.completedAt));

  function played(item: CompareItem) {
    markExercisePassed(progressKey, item.id);
    setHeard((current) => new Set(current).add(item.id));
    const passed = getLessonProgress(progressKey).passed;
    if (items.every((other) => passed.includes(other.id))) markLessonCompleted(progressKey);
  }

  async function playRow(row: CompareItem[], key: string) {
    setPairError(null);
    try {
      for (const item of row) {
        await speakArabic(item.arabic);
        played(item);
      }
    } catch {
      setPairError(key);
    }
  }

  return (
    <div data-testid="compare-step">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-muted-foreground" aria-live="polite" data-testid="compare-count">
          {hydrated ? `${count} von ${items.length} angehört` : `${items.length} Beispiele`}
        </p>
        {done && (
          <p className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow" data-testid="step-completed">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Geschafft
          </p>
        )}
      </div>

      <div className="flex flex-col gap-8">
        {sections.map((section) => (
          <section key={section.id} aria-labelledby={`compare-${section.id}`} data-testid={`compare-section-${section.id}`}>
            {section.titleArabic && (
              <p lang="ar" dir="rtl" className="text-right font-arabic text-2xl font-bold leading-[1.9] text-primary">
                {section.titleArabic}
              </p>
            )}
            <h2 id={`compare-${section.id}`} className="text-lg font-bold">
              {section.title}
            </h2>
            {section.note && (
              <p className="mt-1 rounded-2xl border border-primary/15 bg-primary-soft px-4 py-3 text-sm" data-testid={`compare-note-${section.id}`}>
                <MixedText text={section.note} />
              </p>
            )}
            {section.pictures && (
              <ul className="mt-3 flex flex-wrap justify-center gap-4">
                {section.pictures.map((picture) => (
                  <li key={picture.src} className="flex flex-col items-center gap-1">
                    <Image src={picture.src} alt={picture.alt} width={200} height={150} unoptimized className="rounded-2xl border bg-card" data-testid="compare-picture" />
                    <span lang="ar" className="font-arabic text-xl font-bold">
                      {picture.label}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <ul className="mt-3 flex flex-col gap-3">
              {section.rows.map((row, r) => {
                const key = `${section.id}-${r}`;
                return (
                  <li key={key} className="rounded-3xl border bg-card p-3 shadow-card sm:p-4" data-testid={`compare-row-${key}`}>
                    <ul dir="rtl" className={cn("grid gap-3", row.length === 2 ? "grid-cols-2" : row.length > 2 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1")}>
                      {row.map((item) => (
                        <li key={item.id} className={cn("flex flex-col items-center rounded-2xl border bg-background/60 px-2 py-3 text-center", hydrated && isHeard(item) && "border-success/50")} data-testid={`compare-item-${item.id}`} data-heard={hydrated && isHeard(item) ? "true" : "false"}>
                          {item.label && (
                            <span lang="ar" className="font-arabic text-lg font-bold leading-[1.8] text-muted-foreground" data-testid={`compare-label-${item.id}`}>
                              {item.label}
                            </span>
                          )}
                          {item.tag && (
                            <span dir="ltr" className={cn("rounded-full border px-2 py-0.5 text-xs font-semibold", TAG[item.tag].className)} data-testid={`compare-tag-${item.id}`}>
                              {TAG[item.tag].label}
                            </span>
                          )}
                          <span lang="ar" className="font-arabic text-4xl font-bold leading-[1.9]" data-testid={`compare-arabic-${item.id}`}>
                            {item.arabic}
                          </span>
                          {item.transliteration && (
                            <span dir="ltr" className="text-sm italic text-muted-foreground">
                              {item.transliteration}
                            </span>
                          )}
                          {item.german && (
                            <span dir="ltr" className="text-sm font-semibold">
                              {item.german}
                            </span>
                          )}
                          <ListenButton text={item.arabic} label={`Anhören: ${item.arabic}`} compact onPlayed={() => played(item)} className="mt-2" testId={`compare-listen-${item.id}`} />
                        </li>
                      ))}
                    </ul>
                    {row.length === 2 && (
                      <div className="mt-2 flex flex-col items-center">
                        <Button variant="ghost" onClick={() => void playRow(row, key)} className="min-h-11" data-testid={`compare-pair-${key}`}>
                          <Repeat className="h-4 w-4" aria-hidden /> Beide nacheinander
                        </Button>
                        {pairError === key && (
                          <span role="status" className="text-xs text-destructive">
                            Ton nicht verfügbar – versuch es später noch einmal.
                          </span>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
