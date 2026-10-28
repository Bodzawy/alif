"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

import type { FormsLetter, FormsWord } from "@/data/types";
import type { HamzaPosition } from "@/lib/arabic/hamza-alif";
import { formGlyph, LETTER_FORMS } from "@/lib/arabic/letter-form";
import type { Narrator } from "@/lib/audio/narration";
import { cn } from "@/lib/utils";

import { BASKET_LABEL, isLongWord, LETTER_NARRATION, LETTER_TILE, LONG_TILE } from "./content";
import { ShapedWord } from "./shaped-word";
import { shuffled, usePickAndDrop } from "./use-pick-and-drop";
import { wordShape } from "./word-shape";
import { useT } from "@/i18n/use-locale";

type Phase = "ask" | "correct" | "apart" | "rebuild";
const MIN_STEP_MS = 900;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Activity 3 for a letter that connects forward: one word at a time into one of
// four baskets – Am Anfang بـ, In der Mitte ـبـ, Am Ende ـب, Allein ب. The
// right basket is computed (src/lib/arabic/letter-form.ts). As in the Alif
// lesson, the word stays separate tiles while the child answers (the joined
// shape would give the answer away) and is joined only after an answer. Wrong:
// a hint, the word falls apart and is built again highlighted, then a new try.
export function LetterSortActivity({ letter, words, narrator, onComplete }: { letter: FormsLetter; words: FormsWord[]; narrator: Narrator; onComplete: () => void }) {
  const t = useT();
  const order = useMemo(() => shuffled(words), [words]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("ask");
  const [finished, setFinished] = useState(false);
  const busy = useRef(false);
  const word = order[index]!;
  const { tiles, target, position: expected } = useMemo(() => wordShape(word, letter), [word, letter]);
  const joined = phase === "correct" || phase === "rebuild";

  async function answer(basket: HamzaPosition) {
    if (busy.current || finished) return;
    busy.current = true;
    if (basket === expected) {
      setPhase("correct");
      await Promise.all([narrator.play([LETTER_NARRATION.sort.ok(expected)]), wait(MIN_STEP_MS)]);
      if (index === order.length - 1) {
        setFinished(true);
        onComplete();
        void narrator.play([LETTER_NARRATION.sort.done]);
      } else {
        setIndex(index + 1);
        setPhase("ask");
      }
    } else {
      setPhase("apart");
      await Promise.all([narrator.play([LETTER_NARRATION.sort.hint]), wait(MIN_STEP_MS)]);
      setPhase("rebuild");
      await Promise.all([narrator.play([LETTER_NARRATION.sort.replay]), wait(MIN_STEP_MS)]);
      setPhase("ask");
    }
    busy.current = false;
  }

  const { itemProps, targetProps, selectedKey } = usePickAndDrop<string>({ onDrop: (_, basket) => void answer(basket as HamzaPosition) });

  if (finished) {
    return (
      <div data-testid="sort-done" className="animate-fade-in rounded-3xl border border-success/40 bg-card p-8 text-center shadow-card">
        <span className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> {t("Geschafft")}
        </span>
        <p lang="ar" className="mt-4 font-arabic text-4xl font-bold text-success">مُمْتَاز! 👏</p>
        <p className="mt-2 text-muted-foreground">{t("Du erkennst die vier Formen vom {name}.", { name: letter.name })}</p>
      </div>
    );
  }

  return (
    <div data-testid="sort-activity" data-variant="letter" className="rounded-3xl border bg-card p-4 text-center shadow-card sm:p-8">
      <p className="text-sm text-muted-foreground" data-testid="sort-progress">
        Wort {index + 1} von {order.length}
      </p>
      <div className="mt-3 flex flex-col items-center gap-2" data-testid="sort-word" data-word={word.id} data-phase={phase} data-expected={expected}>
        {word.image && <Image src={word.image.src} alt={word.image.alt} width={160} height={120} className="rounded-2xl" unoptimized />}
        <button
          key={word.id}
          type="button"
          {...itemProps(word.id, word.id, phase !== "ask")}
          aria-label={t("Wort {arabic}, {german} – in einen Korb legen", { arabic: word.arabic, german: t(word.german) })}
          data-testid="sort-card"
          className={cn("max-w-full cursor-grab rounded-2xl px-1 transition focus-ring active:cursor-grabbing disabled:cursor-default", isLongWord(tiles) && "w-full", selectedKey && "ring-2 ring-primary")}
        >
          <span className={cn("grid min-h-24 place-items-center sm:min-h-28", isLongWord(tiles) && "grid-cols-1")}>
            <span
              dir="rtl"
              data-testid="sort-tiles"
              aria-hidden={joined}
              className={cn(
                "crossfade col-start-1 row-start-1 flex flex-wrap justify-center transition-all duration-500 motion-reduce:transition-none",
                joined ? "gap-0 opacity-0" : "gap-2 sm:gap-4",
                isLongWord(tiles) && "w-full flex-nowrap",
                isLongWord(tiles) && !joined && "gap-1 sm:gap-2"
              )}
            >
              {tiles.map((tile, i) => (
                <span
                  key={i}
                  lang="ar"
                  data-testid={`sort-tile-${i}`}
                  className={cn(LETTER_TILE, "h-16 min-w-12 text-4xl transition-all duration-500 sm:h-24 sm:min-w-20 sm:text-5xl", isLongWord(tiles) && LONG_TILE, joined && "rounded-none border-transparent bg-transparent")}
                >
                  {tile}
                </span>
              ))}
            </span>
            {joined && (
              <span className="col-start-1 row-start-1 animate-crossfade-in">
                <ShapedWord tiles={tiles} target={target} highlight className="text-6xl leading-[1.8] text-foreground" testId="sort-shaped" />
              </span>
            )}
          </span>
        </button>
        <p className="font-semibold">{t(word.german)}</p>
      </div>

      {/* Book order, right to left: Anfang, Mitte, Ende, Allein. */}
      <div dir="rtl" className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {LETTER_FORMS.map((form) => (
          <button
            key={form}
            type="button"
            {...targetProps(form)}
            onClick={() => void answer(form)}
            disabled={phase !== "ask"}
            data-testid={`basket-${form}`}
            aria-label={`${t(BASKET_LABEL[form])}: ${formGlyph(letter.glyph, form)}`}
            className={cn(
              "flex min-h-28 flex-col items-center justify-center gap-1 rounded-3xl border-2 border-dashed p-3 transition focus-ring disabled:cursor-default",
              phase === "correct" && expected === form ? "border-success bg-success-soft" : selectedKey ? "border-primary bg-primary-soft/60" : "border-border bg-muted/30 hover:bg-muted"
            )}
          >
            <span dir="ltr" className="text-sm font-semibold">{t(BASKET_LABEL[form])}</span>
            <span lang="ar" dir="rtl" className="font-arabic text-5xl font-bold leading-[1.6] text-primary">{formGlyph(letter.glyph, form)}</span>
          </button>
        ))}
      </div>
      <p className="mt-3 min-h-5 text-sm font-semibold" aria-live="polite" data-testid="sort-feedback">
        {phase === "correct" ? <span className="text-success">{t("Richtig!")}</span> : phase === "apart" || phase === "rebuild" ? <span className="text-muted-foreground">{t("Schau genau hin …")}</span> : ""}
      </p>
    </div>
  );
}
