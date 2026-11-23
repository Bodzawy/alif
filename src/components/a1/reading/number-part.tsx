"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

import { Sheet, SheetHeader } from "@/components/a1/worksheet";
import type { NumberWord } from "@/data/types";
import { stem } from "./stem";
import { getLessonProgress, markExercisePassed, markLessonCompleted, subscribeProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

// "استخرج من النص المفرد أو الجمع": the learner taps a word of the text and says whether it is a
// singular or a plural. A right answer lights the word up everywhere in the text and writes the pair
// into the table (المفرد | الجمع) as in the book; the part is done when every word was found.

const noop = () => () => undefined;

export function NumberPart({ lines, words, progressKey }: { lines: string[]; words: NumberWord[]; progressKey: string }) {
  const stored = useSyncExternalStore(subscribeProgress, () => getLessonProgress(progressKey), () => null);
  const [selected, setSelected] = useState<number | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const hydrated = useSyncExternalStore(noop, () => true, () => false);

  const tokens = lines.flatMap((line) => line.split(/\s+/)).filter(Boolean);
  const tagOf = (token: string) => words.findIndex((word) => stem(word.arabic) === stem(token));
  const foundIds = new Set(stored?.passed ?? []);
  const isFound = (index: number) => words[index]?.example === true || foundIds.has(`nw${index}`);
  const required = words.map((_, i) => i).filter((i) => !words[i]!.example);
  const found = required.filter((i) => isFound(i));
  const allFound = hydrated && found.length === required.length;

  useEffect(() => {
    if (allFound) markLessonCompleted(progressKey);
  }, [allFound, progressKey]);

  function answer(number: "singular" | "plural") {
    if (selected === null) return;
    const index = tagOf(tokens[selected]!);
    if (index < 0) {
      setNote("Dieses Wort zählt hier nicht – such ein anderes Nomen im Singular oder Plural.");
      setSelected(null);
    } else if (words[index]!.number === number) {
      markExercisePassed(progressKey, `nw${index}`);
      setNote(null);
      setSelected(null);
    } else {
      setNote("Nicht ganz – überlege noch einmal: Einzahl oder Mehrzahl?");
    }
  }

  const rows = words.map((word, i) => ({ word, i })).filter(({ i }) => isFound(i));
  const chosen = selected !== null ? tokens[selected]!.replace(/[.,،؟!:؛]/g, "") : null;

  return (
    <div className="flex flex-col gap-5" data-testid="number-part">
      <Sheet>
      <article className="px-6 py-7 sm:px-10">
        <p lang="ar" dir="rtl" className="font-arabic text-3xl font-bold leading-[2.3]" data-testid="number-text">
          {tokens.map((token, n) => {
            const tag = tagOf(token);
            const done = tag >= 0 && isFound(tag);
            return (
              <span key={n}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(n);
                    setNote(null);
                  }}
                  aria-pressed={selected === n}
                  data-testid={`number-token-${n}`}
                  className={cn(
                    "rounded-lg px-1 transition focus-ring hover:bg-primary-soft",
                    selected === n && "bg-primary-soft text-primary ring-2 ring-primary",
                    done && "bg-success-soft text-success"
                  )}
                >
                  {token}
                </button>{" "}
              </span>
            );
          })}
        </p>
      </article>
      </Sheet>

      <div className="min-h-24 rounded-3xl border bg-card p-5 shadow-card" aria-live="polite" data-testid="number-choice">
        {chosen ? (
          <div className="flex flex-wrap items-center gap-3">
            <span lang="ar" dir="rtl" className="font-arabic text-3xl font-bold">
              {chosen}
            </span>
            <span className="text-sm font-semibold text-muted-foreground">Einzahl oder Mehrzahl?</span>
            <div className="flex gap-2" dir="rtl">
              <button type="button" onClick={() => answer("singular")} data-testid="number-singular" className="min-h-12 rounded-2xl border bg-background px-5 font-arabic text-2xl font-bold transition focus-ring hover:border-primary hover:bg-primary-soft">
                مُفْرَدٌ
              </button>
              <button type="button" onClick={() => answer("plural")} data-testid="number-plural" className="min-h-12 rounded-2xl border bg-background px-5 font-arabic text-2xl font-bold transition focus-ring hover:border-primary hover:bg-primary-soft">
                جَمْعٌ
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Tippe im Text ein Nomen an und sag, ob es Einzahl (مُفْرَدٌ) oder Mehrzahl (جَمْعٌ) ist.</p>
        )}
        {note && (
          <p className="mt-2 text-sm font-semibold text-muted-foreground" data-testid="number-note">
            {note}
          </p>
        )}
      </div>

      <Sheet>
        <SheetHeader label={`${found.length} von ${required.length} gefunden`} ratio={required.length ? found.length / required.length : 0} done={allFound} testId="number-count" />
        <table dir="rtl" className="w-full text-center">
          <thead>
            <tr className="border-b font-arabic text-xl font-bold">
              <th className="w-1/2 px-4 py-3">الْمُفْرَدُ</th>
              <th className="w-1/2 px-4 py-3">الْجَمْعُ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ word, i }) => (
              <tr key={i} className={cn("border-b last:border-b-0", word.example && "bg-muted/30")} data-testid={`number-row-${i}`}>
                <td lang="ar" className="px-4 py-3 font-arabic text-3xl font-bold">
                  {word.number === "singular" ? word.arabic : word.other}
                </td>
                <td lang="ar" className="px-4 py-3 font-arabic text-3xl font-bold">
                  {word.number === "plural" ? word.arabic : word.other}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Sheet>
    </div>
  );
}
