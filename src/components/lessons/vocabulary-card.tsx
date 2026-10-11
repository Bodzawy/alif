"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { PronunciationExercise } from "@/components/pronunciation/pronunciation-exercise";
import type { A1Word } from "@/data/types";
import type { StudentFeedback } from "@/lib/pronunciation/client";
import { cn } from "@/lib/utils";

export function VocabularyCard({
  item,
  passed,
  locked,
  onBusyChange,
  onResult,
  simpleFeedback,
  hideControls = false,
}: {
  /** A word without a picture (or whose picture fails to load) shows the word large instead. */
  item: A1Word;
  passed: boolean;
  locked: boolean;
  onBusyChange: (busy: boolean) => void;
  onResult: (feedback: StudentFeedback) => void;
  simpleFeedback?: boolean;
  /** Guided mode (A1 · Schritt 2): no listen / record buttons. */
  hideControls?: boolean;
}) {
  const [broken, setBroken] = useState(false);
  const picture = item.image && !broken ? item.image : undefined;
  return (
    <article
      data-testid={`vocab-card-${item.id}`}
      className={cn(
        "flex flex-col overflow-hidden rounded-3xl border bg-card shadow-card transition hover:shadow-lift",
        passed && "border-success/40"
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-accent-soft">
        {picture ? (
          // Local SVG illustrations (4:3, like this frame): next/image would not optimise them.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={picture.src}
            alt={picture.alt}
            className="h-full w-full object-contain"
            loading="lazy"
            decoding="async"
            data-testid={`vocab-image-${item.id}`}
            onError={() => {
              // Never a broken-image icon for the child – but loud for development and the tests.
              console.error(`Vocabulary picture missing: ${picture.src}`);
              setBroken(true);
            }}
          />
        ) : (
          // No picture: the word itself, large, with its meaning.
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-4 text-center" data-testid={`vocab-text-${item.id}`} data-broken-image={broken ? item.image?.src : undefined}>
            <p lang="ar" dir="rtl" aria-hidden className="font-arabic text-6xl font-bold leading-[1.6] text-primary/80">
              {item.arabic}
            </p>
            <p className="text-base font-semibold text-accent-foreground">{item.german}</p>
          </div>
        )}
        {passed && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Geschafft
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="text-center">
          <p lang="ar" dir="rtl" className="font-arabic text-5xl font-bold leading-snug text-primary" data-testid={`vocab-arabic-${item.id}`}>
            {item.arabic}
          </p>
          <p className="mt-1 text-lg font-semibold">{item.german}</p>
          <p className="text-sm italic text-muted-foreground">{item.transliteration}</p>
        </div>

        {!hideControls && (
          <PronunciationExercise
            exercise={item.exercise}
            locked={locked}
            onBusyChange={onBusyChange}
            onResult={onResult}
            className="mt-auto"
            simpleFeedback={simpleFeedback}
          />
        )}
      </div>
    </article>
  );
}
