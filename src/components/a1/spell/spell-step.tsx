"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { ArrowRight, CheckCircle2, Delete, RotateCcw } from "lucide-react";

import { ListenButton } from "@/components/a1/listen-button";
import { Button } from "@/components/ui/button";
import type { SpellWord } from "@/data/types";
import { spellChoices, spellLetters } from "@/lib/arabic/spell";
import { getLessonProgress, markExercisePassed, markLessonCompleted, subscribeProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

// Step type "spell" – Unit 2 · تدريب (١٠): "read the corrected words, write
// them again, listen and write them in separate letters" (example: جرس: ج – ر – س).
// One word at a time: listen, read it, then put its letters into the boxes
// from right to left by tapping the letter tiles. A wrong letter is shown in
// red and can be removed; "Weiter" once the word is right. Unlimited tries.

const noop = () => () => undefined;

export function SpellStep({ words, progressKey }: { words: SpellWord[]; progressKey: string }) {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const stored = useSyncExternalStore(subscribeProgress, () => getLessonProgress(progressKey), () => null);
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState<string[]>([]);
  const word = words[index]!;
  const letters = useMemo(() => spellLetters(word.arabic), [word.arabic]);
  const choices = useMemo(() => spellChoices(word.arabic), [word.arabic]);
  const right = typed.length === letters.length && typed.every((l, i) => l === letters[i]);
  const wrongAt = typed.findIndex((l, i) => l !== letters[i]);
  const doneCount = words.filter((w) => stored?.passed.includes(w.id)).length;
  const allDone = hydrated && (Boolean(stored?.completedAt) || doneCount === words.length);

  function type(letter: string) {
    if (right || typed.length >= letters.length) return;
    const next = [...typed, letter];
    setTyped(next);
    if (next.length === letters.length && next.every((l, i) => l === letters[i])) {
      markExercisePassed(progressKey, word.id);
      if (words.every((w) => w.id === word.id || getLessonProgress(progressKey).passed.includes(w.id))) markLessonCompleted(progressKey);
    }
  }

  function go(to: number) {
    setIndex(to);
    setTyped([]);
  }

  return (
    <div data-testid="spell-step" data-word={word.id}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-muted-foreground" data-testid="spell-progress">
          Wort {index + 1} von {words.length}
          {hydrated && ` · ${doneCount} geschafft`}
        </p>
        {allDone && (
          <p className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow" data-testid="step-completed">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Geschafft
          </p>
        )}
      </div>

      <section className="rounded-3xl border bg-card p-5 text-center shadow-card sm:p-8" aria-label={`Wort ${index + 1}`}>
        <p lang="ar" dir="rtl" className="font-arabic text-6xl font-bold leading-[1.8]" data-testid="spell-word">
          {word.arabic}
        </p>
        <p className="font-semibold">{word.german}</p>
        <ListenButton text={word.arabic} label={`Anhören: ${word.german}`} className="mt-2" testId="spell-listen" />

        <p className="mt-5 text-sm text-muted-foreground">Schreib die Buchstaben getrennt – von rechts nach links.</p>
        <ol dir="rtl" className="mt-2 flex flex-wrap justify-center gap-2" aria-label="Buchstaben" data-testid="spell-slots">
          {letters.map((_, i) => {
            const value = typed[i];
            const bad = value !== undefined && value !== letters[i];
            return (
              <li key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-2xl text-muted-foreground" aria-hidden>–</span>}
                <span
                  className={cn(
                    "flex h-16 w-14 items-center justify-center rounded-2xl border-2 font-arabic text-4xl font-bold",
                    value === undefined ? "border-dashed border-border bg-muted/40" : bad ? "border-destructive bg-destructive/10 text-destructive" : "border-success/50 bg-success-soft"
                  )}
                  data-testid={`spell-slot-${i}`}
                  data-state={value === undefined ? "empty" : bad ? "wrong" : "right"}
                  lang="ar"
                >
                  {value ?? ""}
                </span>
              </li>
            );
          })}
        </ol>

        <p aria-live="polite" className="mt-3 min-h-6 text-sm font-semibold" data-testid="spell-feedback">
          {right ? (
            <span className="text-success">Richtig! {letters.join(" – ")}</span>
          ) : wrongAt >= 0 ? (
            <span className="text-destructive">Der rote Buchstabe passt nicht. Lösch ihn und versuch es noch einmal.</span>
          ) : (
            ""
          )}
        </p>

        <ul dir="rtl" className="mt-3 flex flex-wrap justify-center gap-2" aria-label="Buchstaben zum Antippen">
          {choices.map((letter) => (
            <li key={letter}>
              <button
                type="button"
                onClick={() => type(letter)}
                disabled={right}
                data-testid={`spell-choice-${letter}`}
                aria-label={`Buchstabe ${letter}`}
                className="flex h-14 min-w-12 items-center justify-center rounded-2xl border bg-card px-3 font-arabic text-3xl font-bold shadow-sm transition focus-ring hover:bg-muted disabled:opacity-50"
              >
                <span lang="ar">{letter}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button variant="secondary" onClick={() => setTyped(typed.slice(0, -1))} disabled={typed.length === 0 || right} className="min-h-12" data-testid="spell-delete">
            <Delete className="h-5 w-5" aria-hidden /> Löschen
          </Button>
          {right && index < words.length - 1 && (
            <Button size="lg" onClick={() => go(index + 1)} data-testid="spell-next">
              Weiter <ArrowRight className="h-5 w-5" aria-hidden />
            </Button>
          )}
          {right && index === words.length - 1 && (
            <Button variant="secondary" size="lg" onClick={() => go(0)} data-testid="spell-again">
              <RotateCcw className="h-5 w-5" aria-hidden /> Nochmal von vorn
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
