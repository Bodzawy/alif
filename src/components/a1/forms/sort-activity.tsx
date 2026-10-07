"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

import type { FormsWord } from "@/data/types";
import { hamzaIndex, hamzaReason, isHamzaHeld, splitTiles } from "@/lib/arabic/hamza-alif";
import type { Narrator } from "@/lib/audio/narration";
import { cn } from "@/lib/utils";

import { LETTER_TILE, NARRATION } from "./content";
import { ShapedWord } from "./shaped-word";
import { shuffled, usePickAndDrop } from "./use-pick-and-drop";

type Basket = "alone" | "held";
type Phase = "ask" | "correct" | "apart" | "rebuild";
const MIN_STEP_MS = 900;
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Activity 3 "Mit Hand oder ohne?": one word at a time into one of two baskets.
// Right: the matching reason is narrated, then the next word. Wrong: a hint,
// then the word falls apart into its letters and is built again with the
// connection highlighted – and the child tries again.
export function SortActivity({ words, narrator, onComplete }: { words: FormsWord[]; narrator: Narrator; onComplete: () => void }) {
  const order = useMemo(() => shuffled(words), [words]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("ask");
  const [finished, setFinished] = useState(false);
  const busy = useRef(false);
  const word = order[index]!;
  const tiles = useMemo(() => splitTiles(word.arabic), [word.arabic]);
  const expected: Basket = isHamzaHeld(tiles) ? "held" : "alone";
  const joined = phase === "correct" || phase === "rebuild";

  async function answer(basket: Basket) {
    if (busy.current || finished) return;
    busy.current = true;
    if (basket === expected) {
      setPhase("correct");
      await Promise.all([narrator.play([NARRATION.sort.ok(hamzaReason(tiles))]), wait(MIN_STEP_MS)]);
      if (index === order.length - 1) {
        setFinished(true);
        onComplete();
        void narrator.play([NARRATION.sort.done]);
      } else {
        setIndex(index + 1);
        setPhase("ask");
      }
    } else {
      setPhase("apart");
      const hint = hamzaIndex(tiles) === 0 ? NARRATION.sort.hintStart : NARRATION.sort.hint;
      await Promise.all([narrator.play([hint]), wait(MIN_STEP_MS)]);
      setPhase("rebuild");
      await Promise.all([narrator.play([NARRATION.sort.replay]), wait(MIN_STEP_MS)]);
      setPhase("ask");
    }
    busy.current = false;
  }

  const { itemProps, targetProps, selectedKey } = usePickAndDrop<string>({ onDrop: (_, basket) => void answer(basket as Basket) });

  if (finished) {
    return (
      <div data-testid="sort-done" className="animate-fade-in rounded-3xl border border-success/40 bg-card p-8 text-center shadow-card">
        <span className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Geschafft
        </span>
        <p lang="ar" className="mt-4 font-arabic text-4xl font-bold text-success">مُمْتَاز! 👏</p>
        <p className="mt-2 text-muted-foreground">Du erkennst, wann das Alif allein steht und wann es festgehalten wird.</p>
      </div>
    );
  }

  const basket = (id: Basket, label: string, glyph: string) => (
    <button
      type="button"
      {...targetProps(id)}
      onClick={() => void answer(id)}
      disabled={phase !== "ask"}
      data-testid={`basket-${id}`}
      aria-label={`${label}: ${id === "alone" ? "Das Alif steht allein" : "Das Alif wird festgehalten"}`}
      className={cn(
        "flex min-h-28 flex-1 flex-col items-center justify-center gap-1 rounded-3xl border-2 border-dashed p-4 transition focus-ring disabled:cursor-default",
        phase === "correct" && expected === id ? "border-success bg-success-soft" : selectedKey ? "border-primary bg-primary-soft/60" : "border-border bg-muted/30 hover:bg-muted"
      )}
    >
      <span className="text-sm font-semibold">{label}</span>
      <span lang="ar" dir="rtl" className="font-arabic text-5xl font-bold leading-[1.6] text-primary">{glyph}</span>
    </button>
  );

  return (
    <div data-testid="sort-activity" className="rounded-3xl border bg-card p-5 text-center shadow-card sm:p-8">
      <p className="text-sm text-muted-foreground" data-testid="sort-progress">
        Wort {index + 1} von {order.length}
      </p>
      <div className="mt-3 flex flex-col items-center gap-2" data-testid="sort-word" data-word={word.id} data-phase={phase}>
        {word.image && <Image src={word.image.src} alt={word.image.alt} width={160} height={120} className="rounded-2xl" unoptimized />}
        {/* While the child answers, the word is only separate letter tiles: the joined
            shape would give the answer away. After an answer (and in the replay after a
            wrong one) the tiles slide together and the shaped word fades in. */}
        <button
          key={word.id}
          type="button"
          {...itemProps(word.id, word.id, phase !== "ask")}
          aria-label={`Wort ${word.arabic}, ${word.german} – in einen Korb legen`}
          data-testid="sort-card"
          className={cn("cursor-grab rounded-2xl px-2 transition focus-ring active:cursor-grabbing disabled:cursor-default", selectedKey && "ring-2 ring-primary")}
        >
          <span className="grid min-h-24 place-items-center sm:min-h-28">
            <span
              dir="rtl"
              data-testid="sort-tiles"
              aria-hidden={joined}
              className={cn(
                "crossfade col-start-1 row-start-1 flex justify-center transition-all duration-500 motion-reduce:transition-none",
                joined ? "gap-0 opacity-0" : "gap-3 sm:gap-5"
              )}
            >
              {tiles.map((tile, i) => (
                <span key={i} lang="ar" data-testid={`sort-tile-${i}`} className={cn(LETTER_TILE, "transition-all duration-500", joined && "rounded-none border-transparent bg-transparent")}>
                  {tile}
                </span>
              ))}
            </span>
            {joined && (
              <span className="col-start-1 row-start-1 animate-crossfade-in">
                <ShapedWord tiles={tiles} highlight className="text-6xl leading-[1.8] text-foreground" testId="sort-shaped" />
              </span>
            )}
          </span>
        </button>
        <p className="font-semibold">{word.german}</p>
      </div>

      <div className="mt-6 flex gap-3 sm:gap-6">
        {basket("alone", "Allein", "أ")}
        {basket("held", "Festgehalten", "ـأ")}
      </div>
      <p className="mt-3 min-h-5 text-sm font-semibold" aria-live="polite" data-testid="sort-feedback">
        {phase === "correct" ? <span className="text-success">Richtig!</span> : phase === "apart" || phase === "rebuild" ? <span className="text-muted-foreground">Schau genau hin …</span> : ""}
      </p>
    </div>
  );
}
