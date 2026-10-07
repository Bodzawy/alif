"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, Hand } from "lucide-react";

import { Button } from "@/components/ui/button";
import { hasHand } from "@/lib/arabic/hamza-alif";
import type { Narrator } from "@/lib/audio/narration";
import { cn } from "@/lib/utils";

import { NARRATION, RULE_REVEAL, RULE_TEXT } from "./content";
import { ShapedWord } from "./shaped-word";
import { shuffled, usePickAndDrop } from "./use-pick-and-drop";

const ALIF = "أ";

// Activity 2 "Wer hält fest?": a large أ and the neighbours from the lesson
// data (letters of the book words). A neighbour put on
// the RIGHT of the Alif (where the letter before it stands) either holds it –
// the pair is shaped by the browser and the Hand is highlighted – or stays
// apart with a gap. The LEFT side is wrong: the neighbour bounces back. After
// RULE_REVEAL neighbours of each kind (or all of them) the rule appears.
export function NeighborsActivity({ neighbors, narrator, onComplete }: { neighbors: string[]; narrator: Narrator; onComplete: () => void }) {
  const order = useMemo(() => shuffled(neighbors), [neighbors]);
  const [tried, setTried] = useState<ReadonlySet<string>>(() => new Set());
  const [pair, setPair] = useState<{ letter: string; holds: boolean } | null>(null);
  const [bounce, setBounce] = useState<string | null>(null);
  const [ruleShown, setRuleShown] = useState(false);

  const { itemProps, targetProps, selectedKey } = usePickAndDrop<string>({
    onDrop(letter, side) {
      if (side === "left") {
        setBounce(letter);
        void narrator.play([NARRATION.neighbors.left]);
        return;
      }
      const holds = hasHand(letter);
      const next = new Set(tried).add(letter);
      const holding = [...next].filter(hasHand).length;
      const reveal = !ruleShown && ((holding >= RULE_REVEAL.hold && next.size - holding >= RULE_REVEAL.nohold) || next.size === neighbors.length);
      setTried(next);
      setPair({ letter, holds });
      if (reveal) setRuleShown(true);
      void narrator.play([holds ? NARRATION.neighbors.hold : NARRATION.neighbors.nohold, ...(reveal ? [NARRATION.neighbors.rule] : [])]);
    },
  });

  const zone = (side: "left" | "right") => (
    <button
      type="button"
      {...targetProps(side)}
      data-testid={`zone-${side}`}
      aria-label={side === "right" ? "Rechts neben das Alif legen" : "Links neben das Alif legen"}
      className={cn(
        "flex h-28 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed text-xs font-semibold text-muted-foreground transition focus-ring sm:h-32 sm:w-28",
        selectedKey !== null ? "border-primary bg-primary-soft/60 text-primary" : "border-border bg-muted/30"
      )}
    >
      {side === "right" ? "rechts" : "links"}
    </button>
  );

  return (
    <div data-testid="neighbors-activity" className="rounded-3xl border bg-card p-5 text-center shadow-card sm:p-8">
      {/* Physical sides matter here, so this row is laid out left to right. */}
      <div dir="ltr" className="flex items-center justify-center gap-3 sm:gap-6">
        {zone("left")}
        <div className="flex min-h-32 min-w-28 items-center justify-center" data-testid="alif-center" data-pair={pair ? pair.letter : ""} data-holds={pair ? pair.holds : undefined}>
          {!pair ? (
            <span lang="ar" className="font-arabic text-8xl font-bold leading-[1.6] text-primary">{ALIF}</span>
          ) : pair.holds ? (
            <ShapedWord key={pair.letter} tiles={[pair.letter, ALIF]} highlight className="animate-fade-in text-8xl leading-[1.6] text-foreground" testId="pair" />
          ) : (
            // No Hand: the neighbour stays beside the Alif, with a gap, muted.
            <span dir="rtl" lang="ar" key={pair.letter} data-testid="pair" data-held="false" className="flex animate-fade-in items-center gap-4 font-arabic text-8xl font-bold leading-[1.6]">
              <span className="text-muted-foreground/60">{pair.letter}</span>
              <span className="text-primary">{ALIF}</span>
            </span>
          )}
        </div>
        {zone("right")}
      </div>

      <p className="mt-3 min-h-6 text-sm font-semibold" aria-live="polite" data-testid="pair-feedback">
        {pair &&
          (pair.holds ? (
            <span className="inline-flex items-center gap-1 text-accent-foreground">
              <Hand className="h-4 w-4 text-accent" aria-hidden /> Der Nachbar streckt seine Hand aus und hält das Alif fest.
            </span>
          ) : (
            <span className="text-muted-foreground">Dieser Nachbar hat keine Hand – das Alif bleibt allein.</span>
          ))}
      </p>

      <p className="mt-4 text-sm text-muted-foreground">Lege einen Nachbarn rechts neben das Alif – dort steht der Buchstabe davor.</p>
      <ul className="mt-4 flex flex-wrap justify-center gap-3" aria-label="Nachbarn">
        {order.map((letter) => (
          <li key={letter}>
            <button
              type="button"
              {...itemProps(letter, letter)}
              onAnimationEnd={() => setBounce(null)}
              data-testid={`neighbor-${letter}`}
              data-tried={tried.has(letter)}
              aria-label={`Nachbar ${letter}`}
              className={cn(
                "relative flex h-16 w-16 cursor-grab select-none items-center justify-center rounded-2xl border bg-card font-arabic text-4xl font-bold shadow-sm transition focus-ring active:cursor-grabbing sm:h-20 sm:w-20",
                selectedKey === letter && "border-primary ring-2 ring-primary",
                bounce === letter && "animate-shake"
              )}
            >
              <span lang="ar">{letter}</span>
              {tried.has(letter) && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-success text-success-foreground">
                  <Check className="h-3 w-3" aria-hidden />
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      {ruleShown && (
        <div className="mt-6 animate-fade-in rounded-2xl border border-accent/40 bg-accent-soft p-4 text-left" data-testid="rule-card" role="note">
          <p className="flex items-start gap-2 font-semibold">
            <Hand className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
            {RULE_TEXT}
          </p>
          <div className="mt-4 flex justify-end">
            <Button size="lg" onClick={onComplete} data-testid="neighbors-next">
              Weiter <ArrowRight className="h-5 w-5" aria-hidden />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
