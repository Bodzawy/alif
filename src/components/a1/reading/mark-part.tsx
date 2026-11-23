"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { Sheet, SheetHeader } from "@/components/a1/worksheet";
import { getLessonProgress, markExercisePassed, markLessonCompleted, subscribeProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

import { stem } from "./stem";

// "ضع خطا تحت …": the learner taps the words of a text that belong to a group (e.g. the adjectives).
// A right word lights up everywhere in the text; a wrong one is only told it does not belong. The part is
// done when every word of the group was found.

const noop = () => () => undefined;

export function MarkPart({ lines, words, label, progressKey }: { lines: string[]; words: string[]; label: string; progressKey: string }) {
  const stored = useSyncExternalStore(subscribeProgress, () => getLessonProgress(progressKey), () => null);
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const [note, setNote] = useState<string | null>(null);

  const targets = [...new Set(words.map(stem))];
  const found = new Set((stored?.passed ?? []).filter((id) => id.startsWith("mk:")).map((id) => id.slice(3)));
  const allFound = hydrated && targets.every((target) => found.has(target));

  useEffect(() => {
    if (allFound) markLessonCompleted(progressKey);
  }, [allFound, progressKey]);

  function tap(token: string) {
    const bare = stem(token);
    if (targets.includes(bare)) {
      markExercisePassed(progressKey, `mk:${bare}`);
      setNote(null);
    } else {
      setNote(`Das ist kein Wort aus der Gruppe „${label}“ – such weiter.`);
    }
  }

  return (
    <Sheet testId="mark-part">
      <SheetHeader label={`${targets.filter((t) => found.has(t)).length} von ${targets.length} ${label} gefunden`} ratio={targets.length ? targets.filter((t) => found.has(t)).length / targets.length : 0} done={allFound} testId="mark-count" />
      <div className="flex flex-col gap-4 px-6 py-6 sm:px-9">
        {lines.map((line, l) => (
          <p key={l} lang="ar" dir="rtl" className="font-arabic text-2xl font-bold leading-[2.2] sm:text-3xl" data-testid={`mark-line-${l}`}>
            {line.split(/\s+/).filter(Boolean).map((token, n) => {
              const done = found.has(stem(token)) && targets.includes(stem(token));
              return (
                <span key={n}>
                  <button
                    type="button"
                    onClick={() => tap(token)}
                    data-testid={`mark-token-${l}-${n}`}
                    className={cn("rounded-lg px-1 transition focus-ring hover:bg-primary-soft", done && "bg-success-soft text-success underline decoration-2 underline-offset-8")}
                  >
                    {token}
                  </button>{" "}
                </span>
              );
            })}
          </p>
        ))}
        <p className="min-h-5 text-sm font-semibold text-muted-foreground" aria-live="polite" data-testid="mark-note">
          {note ?? ""}
        </p>
      </div>
    </Sheet>
  );
}
