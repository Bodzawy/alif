"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { CheckCircle2 } from "lucide-react";

import { FindableWord } from "@/components/a1/letter-find/letter-find-step";
import { ListenButton } from "@/components/a1/listen-button";
import type { LetterPositions } from "@/data/types";
import { positionCards, type PositionCard } from "@/lib/arabic/positions";
import { getLessonProgress, markExercisePassed, markLessonCompleted, subscribeProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

// Step type "positions" – the book's "كتابة الحرف" and "النطق مع السكون": where
// the letter stands in a word (book labels, its printed shape, the book's
// example word) and the letter with Sukun. For every example the learner taps
// the letter in the word (the one the book means, when it appears twice) and
// can listen to the word. The word stays ONE string (FindableWord), so its
// joins are the browser's own. Done when the letter is found in every word.

const noop = () => () => undefined;

export function PositionsStep({ positions, progressKey }: { positions: LetterPositions; progressKey: string }) {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const stored = useSyncExternalStore(subscribeProgress, () => getLessonProgress(progressKey), () => null);
  const cards = useMemo(() => positionCards(positions), [positions]);
  const [found, setFound] = useState<ReadonlySet<string>>(() => new Set());
  const [wrong, setWrong] = useState<Record<string, { key: string; message: string } | undefined>>({});
  const isFound = (id: string) => found.has(id) || Boolean(stored?.passed.includes(id));
  const count = cards.filter((c) => isFound(c.id)).length;
  const done = hydrated && (count === cards.length || Boolean(stored?.completedAt));

  function tap(c: PositionCard, key: string) {
    if (isFound(c.id)) return;
    if (key === c.targetKey) {
      const next = new Set(found).add(c.id);
      setFound(next);
      setWrong((current) => ({ ...current, [c.id]: undefined }));
      markExercisePassed(progressKey, c.id);
      if (cards.every((other) => next.has(other.id) || getLessonProgress(progressKey).passed.includes(other.id))) markLessonCompleted(progressKey);
      return;
    }
    const tile = c.findWord.tiles.find((t) => t.key === key)!;
    const message = tile.target
      ? `Das ist auch ein ${positions.letter} – gesucht ist das ${positions.letter} ${c.labelGerman}.`
      : `Das ist ${tile.letter}, kein ${positions.letter}. Versuch es noch einmal.`;
    setWrong((current) => ({ ...current, [c.id]: { key, message } }));
  }

  return (
    <div data-testid="positions-step">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold" data-testid="positions-goal">
          Tippe in jedem Wort auf das{" "}
          <span lang="ar" className="font-arabic text-2xl font-bold text-primary">
            {positions.letter}
          </span>{" "}
          ({positions.name}).
        </p>
        <p className="text-sm text-muted-foreground" aria-live="polite" data-testid="positions-count">
          {hydrated ? `${count} von ${cards.length} gefunden` : `${cards.length} Wörter`}
        </p>
      </div>

      {positions.rule && (
        <div className="mb-5 rounded-3xl border border-primary/15 bg-primary-soft px-4 py-3 text-center" data-testid="positions-rule">
          <p lang="ar" dir="rtl" className="font-arabic text-2xl font-bold leading-[1.9] text-primary">
            {positions.rule.arabic}
          </p>
          <p className="text-sm">{positions.rule.german}</p>
        </div>
      )}

      <ul dir="rtl" className="grid gap-4 sm:grid-cols-2">
        {cards.map((c) => {
          const ok = hydrated && isFound(c.id);
          const miss = wrong[c.id];
          return (
            <li key={c.id} className={cn("flex flex-col items-center rounded-3xl border bg-card p-4 text-center shadow-card sm:p-5", ok && "border-success/50")} data-testid={`position-${c.id}`} data-found={ok ? "true" : "false"}>
              <p lang="ar" className="font-arabic text-xl font-bold leading-[1.8]" data-testid={`position-label-${c.id}`}>
                {c.label}
              </p>
              <p dir="ltr" className="text-xs font-semibold text-muted-foreground">
                {c.labelGerman}
              </p>
              <p lang="ar" className="mt-1 font-arabic text-6xl font-bold leading-[1.6] text-primary" data-testid={`position-shape-${c.id}`}>
                {c.shape}
              </p>
              <p lang="ar" className="font-arabic text-5xl font-bold leading-[2]" data-testid={`position-word-${c.id}`}>
                <FindableWord word={c.findWord} toneOf={(key) => (ok && key === c.targetKey ? "correct" : miss?.key === key ? "wrong" : null)} onToggle={(key) => tap(c, key)} disabled={ok} />
              </p>
              <p dir="ltr" className="font-semibold">
                {c.german}
              </p>
              <ListenButton text={c.word} label={`Anhören: ${c.german}`} className="mt-2" testId={`position-listen-${c.id}`} />
              <p dir="ltr" aria-live="polite" className={cn("mt-2 min-h-5 text-sm", ok ? "font-semibold text-success" : "text-destructive")} data-testid={`position-feedback-${c.id}`}>
                {ok ? (
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" aria-hidden /> Richtig!
                  </span>
                ) : (
                  (miss?.message ?? "")
                )}
              </p>
            </li>
          );
        })}
      </ul>

      {done && (
        <div role="status" className="mt-6 flex justify-center" data-testid="step-completed">
          <p className="inline-flex items-center gap-1 rounded-full bg-success px-3 py-1 text-sm font-semibold text-success-foreground shadow">
            <CheckCircle2 className="h-4 w-4" aria-hidden /> Geschafft – du hast das {positions.letter} in jedem Wort gefunden.
          </p>
        </div>
      )}
    </div>
  );
}
