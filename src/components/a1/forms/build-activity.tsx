"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Volume2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { FormsWord } from "@/data/types";
import { hamzaIndex, hamzaPosition, splitTiles } from "@/lib/arabic/hamza-alif";
import type { Narrator } from "@/lib/audio/narration";
import { cn } from "@/lib/utils";

import { NARRATION, POSITION_LABEL } from "./content";
import { ShapedWord } from "./shaped-word";
import { shuffled, usePickAndDrop } from "./use-pick-and-drop";

type BankTile = { key: string; tile: string };
const JOIN_MS = 450;

// Activity 1 "Baue das Wort": the word as empty slots (right to left) and a
// shuffled tile bank. Tiles go in from the right; a wrong tile shakes back to
// the bank. A full word slides together and fades into the real, browser-
// shaped word with the Hamza-Alif (and the Hand that holds it) highlighted.
export function BuildActivity({ words, narrator, onComplete }: { words: FormsWord[]; narrator: Narrator; onComplete: () => void }) {
  const [wordIndex, setWordIndex] = useState(0);
  const word = words[wordIndex]!;
  return (
    <div data-testid="build-activity">
      <ol className="mb-5 flex justify-center gap-2" aria-label={`Wort ${wordIndex + 1} von ${words.length}`}>
        {words.map((item, i) => (
          <li
            key={item.id}
            data-testid={`build-dot-${i}`}
            data-state={i < wordIndex ? "done" : i === wordIndex ? "current" : "open"}
            className={cn("h-3 w-3 rounded-full", i < wordIndex ? "bg-success" : i === wordIndex ? "bg-primary" : "bg-muted")}
          />
        ))}
      </ol>
      <BuildWord
        key={word.id}
        word={word}
        narrator={narrator}
        last={wordIndex === words.length - 1}
        onNext={async () => {
          if (wordIndex < words.length - 1) {
            narrator.stop();
            setWordIndex(wordIndex + 1);
          } else {
            await narrator.play([NARRATION.build.all]);
            onComplete();
          }
        }}
      />
    </div>
  );
}

function BuildWord({ word, narrator, last, onNext }: { word: FormsWord; narrator: Narrator; last: boolean; onNext: () => void }) {
  const tiles = useMemo(() => splitTiles(word.arabic), [word.arabic]);
  const position = hamzaPosition(tiles);
  const [placed, setPlaced] = useState<(string | null)[]>(() => tiles.map(() => null));
  const [bank, setBank] = useState<BankTile[]>(() => shuffled(tiles.map((tile, i) => ({ key: `${i}`, tile }))));
  const [shake, setShake] = useState<string | null>(null);
  const [phase, setPhase] = useState<"building" | "joining" | "done">("building");
  const [leaving, setLeaving] = useState(false);
  const active = placed.indexOf(null);

  const { itemProps, targetProps, selectedKey } = usePickAndDrop<BankTile>({
    onDrop(item, target) {
      const slot = Number(target.replace("slot-", ""));
      if (slot !== active) return; // only the next slot (from the right) takes a tile
      if (item.tile !== tiles[slot]) {
        setShake(item.key);
        void narrator.play([NARRATION.build.wrong]);
        return;
      }
      setBank((current) => current.filter((t) => t.key !== item.key));
      setPlaced((current) => current.map((value, i) => (i === slot ? item.tile : value)));
    },
  });

  // All slots filled: slide together …
  useEffect(() => {
    if (phase === "building" && active === -1) setPhase("joining");
  }, [active, phase]);

  // … then show the shaped word and play the word, followed by the narration for its position.
  useEffect(() => {
    if (phase !== "joining") return;
    const timer = setTimeout(() => {
      setPhase("done");
      void narrator.play([word.audio, NARRATION.build.done(position)]);
    }, JOIN_MS);
    return () => clearTimeout(timer);
  }, [phase, narrator, word.audio, position]);

  const joined = phase !== "building";
  const done = phase === "done";

  return (
    <section aria-label={`Baue das Wort: ${word.german}`} data-testid={`build-word-${word.id}`} data-phase={phase} className="rounded-3xl border bg-card p-5 text-center shadow-card sm:p-8">
      {/* Slots and the finished word share one place: the tiles slide together, then the word fades in. */}
      <div className="grid min-h-28 place-items-center">
        <div
          dir="rtl"
          className={cn(
            "crossfade col-start-1 row-start-1 flex justify-center transition-all duration-500 motion-reduce:transition-none",
            joined ? "gap-0" : "gap-2 sm:gap-3",
            done && "opacity-0"
          )}
          aria-hidden={done}
        >
          {tiles.map((tile, i) => (
            <button
              key={i}
              type="button"
              {...targetProps(`slot-${i}`)}
              data-testid={`slot-${i}`}
              data-filled={placed[i] !== null}
              disabled={joined}
              aria-label={placed[i] ? `Feld ${i + 1}: ${placed[i]}` : i === active ? `Feld ${i + 1}: hier ablegen` : `Feld ${i + 1}: leer`}
              className={cn(
                "flex h-20 w-16 items-center justify-center rounded-2xl border-2 font-arabic text-4xl font-bold transition focus-ring sm:h-24 sm:w-20 sm:text-5xl",
                placed[i] ? "border-primary/30 bg-primary-soft text-foreground" : i === active ? "border-dashed border-primary bg-card" : "border-dashed border-border bg-muted/40",
                joined && "rounded-none border-transparent bg-transparent first:rounded-r-2xl last:rounded-l-2xl"
              )}
            >
              <span lang="ar">{placed[i]}</span>
            </button>
          ))}
        </div>
        <div className={cn("crossfade col-start-1 row-start-1 transition-opacity duration-500", done ? "opacity-100" : "pointer-events-none opacity-0")} aria-hidden={!done}>
          {done && <ShapedWord tiles={tiles} highlight className="text-6xl leading-[1.8] text-foreground sm:text-7xl" testId={`built-word-${word.id}`} />}
        </div>
      </div>

      {!done ? (
        <>
          <p className="mt-4 text-sm text-muted-foreground">Ziehe die Steine von rechts nach links in die Felder – oder tippe erst einen Stein und dann das Feld.</p>
          <ul className="mt-5 flex flex-wrap justify-center gap-3" aria-label="Steine">
            {bank.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  {...itemProps(item.key, item, joined)}
                  onAnimationEnd={() => setShake(null)}
                  data-testid={`tile-${item.tile}`}
                  aria-label={`Stein ${item.tile}`}
                  className={cn(
                    "flex h-16 min-w-14 cursor-grab select-none items-center justify-center rounded-2xl border bg-card px-3 font-arabic text-4xl font-bold shadow-sm transition focus-ring active:cursor-grabbing sm:h-20 sm:min-w-16",
                    selectedKey === item.key && "border-primary ring-2 ring-primary",
                    shake === item.key && "animate-shake border-destructive"
                  )}
                >
                  <span lang="ar">{item.tile}</span>
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="mt-4 flex animate-fade-in flex-col items-center gap-3" data-testid="build-result">
          {word.image && (
            <Image src={word.image.src} alt={word.image.alt} width={160} height={120} className="rounded-2xl" unoptimized />
          )}
          <p lang="ar" dir="rtl" className="font-arabic text-2xl font-bold text-primary" data-testid="build-position">
            {POSITION_LABEL[position]}
          </p>
          <p className="text-lg font-semibold">{word.german}</p>
          <span className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Geschafft
          </span>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Button variant="secondary" size="lg" onClick={() => void narrator.play([word.audio])} data-testid="build-listen" aria-label={`Anhören: ${word.german}`}>
              <Volume2 className="h-5 w-5" aria-hidden /> Anhören
            </Button>
            <Button
              size="lg"
              disabled={leaving}
              onClick={() => {
                setLeaving(true);
                onNext();
              }}
              data-testid="build-next"
            >
              {last ? "Weiter" : "Nächstes Wort"} <ArrowRight className="h-5 w-5" aria-hidden />
            </Button>
          </div>
        </div>
      )}
      <span className="sr-only" aria-live="polite">{hamzaIndex(tiles) >= 0 && done ? `${word.german}: ${POSITION_LABEL[position]}` : ""}</span>
    </section>
  );
}
