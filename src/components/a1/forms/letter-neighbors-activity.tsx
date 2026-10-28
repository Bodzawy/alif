"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, Hand } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { FormsLetter } from "@/data/types";
import { hasHand } from "@/lib/arabic/letter-form";
import type { Narrator } from "@/lib/audio/narration";
import { cn } from "@/lib/utils";

import { LETTER_NARRATION, letterRuleText } from "./content";
import { ShapedWord } from "./shaped-word";
import { shuffled, usePickAndDrop } from "./use-pick-and-drop";
import { useT } from "@/i18n/use-locale";

type Side = "left" | "right";
/** What the child has tried: a side, with a neighbour that has a Hand or not. */
type Try = `${Side}-${"hand" | "nohand"}`;

// Activity 2 "Wer hält fest?" for a letter that connects forward (ب ت ث ج ح خ):
// the big letter in the middle, a slot on the RIGHT (the letter before it) and
// one on the LEFT (the letter after it).
//   right – a neighbour with a Hand holds the letter; one without stays apart;
//   left  – always held: the letter's own Hand holds the next letter.
// The shape of [right, letter, left] is drawn by the browser each time, with
// the Hands highlighted. The rule appears once both sides were tried with a
// neighbour that has a Hand and one that has none (as far as the neighbours allow).
export function LetterNeighborsActivity({
  letter,
  neighbors,
  narrator,
  onComplete,
}: {
  letter: FormsLetter;
  neighbors: string[];
  narrator: Narrator;
  onComplete: () => void;
}) {
  const t = useT();
  const order = useMemo(() => shuffled(neighbors), [neighbors]);
  const [right, setRight] = useState<string | null>(null);
  const [left, setLeft] = useState<string | null>(null);
  const [last, setLast] = useState<{ side: Side; holds: boolean } | null>(null);
  const [tried, setTried] = useState<ReadonlySet<Try>>(() => new Set());
  const [ruleShown, setRuleShown] = useState(false);
  const name = letter.name;

  // Only combinations the neighbours allow are needed for the rule.
  const needed = useMemo(() => {
    const kinds = new Set(neighbors.map((n) => (hasHand(n) ? "hand" : "nohand")));
    return (["right", "left"] as const).flatMap((side) => [...kinds].map((kind) => `${side}-${kind}` as Try));
  }, [neighbors]);

  const { itemProps, targetProps, selectedKey } = usePickAndDrop<string>({
    onDrop(neighbor, side) {
      if (side !== "left" && side !== "right") return;
      const hand = hasHand(neighbor);
      // Left: the letter holds the next one, whoever it is.
      const holds = side === "left" ? true : hand;
      const next = new Set(tried).add(`${side}-${hand ? "hand" : "nohand"}`);
      const reveal = !ruleShown && needed.every((t) => next.has(t));
      if (side === "right") setRight(neighbor);
      else setLeft(neighbor);
      setLast({ side, holds });
      setTried(next);
      if (reveal) setRuleShown(true);
      const clip = side === "left" ? LETTER_NARRATION.neighbors.next : holds ? LETTER_NARRATION.neighbors.hold : LETTER_NARRATION.neighbors.nohold;
      void narrator.play([clip, ...(reveal ? [LETTER_NARRATION.neighbors.rule] : [])]);
    },
  });

  const tiles = [...(right ? [right] : []), letter.glyph, ...(left ? [left] : [])];
  const target = right ? 1 : 0;

  const zone = (side: Side) => (
    <button
      type="button"
      {...targetProps(side)}
      data-testid={`zone-${side}`}
      aria-label={side === "right" ? t("Rechts neben das {name} legen (der Buchstabe davor)", { name }) : t("Links neben das {name} legen (der Buchstabe danach)", { name })}
      className={cn(
        "flex h-28 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed text-xs font-semibold text-muted-foreground transition focus-ring sm:h-32 sm:w-28",
        selectedKey !== null ? "border-primary bg-primary-soft/60 text-primary" : "border-border bg-muted/30"
      )}
    >
      <span>{side === "right" ? "rechts" : "links"}</span>
      <span className="font-normal">{side === "right" ? "davor" : "danach"}</span>
    </button>
  );

  return (
    <div data-testid="neighbors-activity" data-variant="letter" className="rounded-3xl border bg-card p-4 text-center shadow-card sm:p-8">
      {/* Physical sides matter here, so this row is laid out left to right. */}
      <div dir="ltr" className="flex items-center justify-center gap-2 sm:gap-6">
        {zone("left")}
        <div
          className="flex min-h-32 min-w-24 flex-1 items-center justify-center overflow-hidden sm:flex-none"
          data-testid="alif-center"
          data-right={right ?? ""}
          data-left={left ?? ""}
          data-pair={tiles.join("")}
        >
          <ShapedWord
            key={tiles.join("")}
            tiles={tiles}
            target={target}
            highlight={tiles.length > 1}
            gap
            className={cn("text-7xl leading-[1.6] sm:text-8xl", tiles.length > 1 ? "animate-fade-in text-foreground" : "text-primary")}
            testId="pair"
          />
        </div>
        {zone("right")}
      </div>

      <p className="mt-3 min-h-10 text-sm font-semibold" aria-live="polite" data-testid="pair-feedback" data-side={last?.side ?? ""} data-holds={last ? last.holds : undefined}>
        {last &&
          (last.side === "left" ? (
            <span className="inline-flex items-center gap-1 text-accent-foreground">
              <Hand className="h-4 w-4 shrink-0 text-accent" aria-hidden /> Das {name} streckt seine Hand aus und hält den nächsten Buchstaben fest.
            </span>
          ) : last.holds ? (
            <span className="inline-flex items-center gap-1 text-accent-foreground">
              <Hand className="h-4 w-4 shrink-0 text-accent" aria-hidden /> {t("Der Nachbar davor streckt seine Hand aus und hält das {name} fest.", { name })}
            </span>
          ) : (
            <span className="text-muted-foreground">{t("Dieser Nachbar hat keine Hand – er hält das {name} nicht fest.", { name })}</span>
          ))}
      </p>

      <p className="mt-3 text-sm text-muted-foreground">
        {t("Lege einen Nachbarn rechts neben das {name} (davor) oder links daneben (danach).", { name })}
      </p>
      <ul className="mt-4 flex flex-wrap justify-center gap-3" aria-label={t("Nachbarn")}>
        {order.map((neighbor) => {
          const placed = neighbor === right || neighbor === left;
          return (
            <li key={neighbor}>
              <button
                type="button"
                {...itemProps(neighbor, neighbor)}
                data-testid={`neighbor-${neighbor}`}
                data-placed={placed}
                aria-label={`${t("Nachbar")} ${neighbor}`}
                className={cn(
                  "relative flex h-16 w-16 cursor-grab select-none items-center justify-center rounded-2xl border bg-card font-arabic text-4xl font-bold shadow-sm transition focus-ring active:cursor-grabbing sm:h-20 sm:w-20",
                  selectedKey === neighbor && "border-primary ring-2 ring-primary"
                )}
              >
                <span lang="ar">{neighbor}</span>
                {placed && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-success text-success-foreground">
                    <Check className="h-3 w-3" aria-hidden />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {ruleShown && (
        <div className="mt-6 animate-fade-in rounded-2xl border border-accent/40 bg-accent-soft p-4 text-left" data-testid="rule-card" role="note">
          <p className="flex items-start gap-2 font-semibold">
            <Hand className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
            {t(letterRuleText(name))}
          </p>
          <div className="mt-4 flex justify-end">
            <Button size="lg" onClick={onComplete} data-testid="neighbors-next">
              {t("Weiter")} <ArrowRight className="h-5 w-5" aria-hidden />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
