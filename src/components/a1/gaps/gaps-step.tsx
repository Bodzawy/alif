"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { ArrowRight, Check, CheckCircle2, Circle, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";

import { ShapedWord } from "@/components/a1/forms/shaped-word";
import { usePickAndDrop } from "@/components/a1/forms/use-pick-and-drop";
import { Button } from "@/components/ui/button";
import type { GapsContent } from "@/data/types";
import { gapPieces, gapWord } from "@/lib/arabic/gap";
import { playChime, unlockChime } from "@/lib/audio/chime";
import { narrateWithFallback } from "@/lib/audio/narrate";
import { createNarrator, readMuted, type Narrator } from "@/lib/audio/narration";
import { getLessonProgress, markLessonCompleted, subscribeProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

import { GAPS_FALLBACK_MS, GAPS_NARRATION, GAPS_TEXT, gapStars } from "./content";

// Step type "gaps" (Schritt 5 "Ergänzen", 6 "Hören"): one word at a time with
// its Hamza-Alif left out; the child puts the right tile into the gap – drag,
// tap tile then gap, or keyboard (as in "Baue das Wort"). First wrong answer:
// a hint; second: the right tile is shown with the reason, and the child still
// places it. The result screen ("Korrigieren") lists every word.
// Differences between the two steps come only from the data (`mode`).

type Phase = "ask" | "correct" | "result";
type Result = { id: string; firstTry: boolean };

const noop = () => () => undefined;

export function GapsStep({ gaps, availableAudio, progressKey }: { gaps: GapsContent; availableAudio: string[]; progressKey: string }) {
  const narrator = useRef<Narrator | null>(null);
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const completed = useSyncExternalStore(subscribeProgress, () => Boolean(getLessonProgress(progressKey).completedAt), () => false);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("ask");
  const [wrong, setWrong] = useState(0);
  const [shake, setShake] = useState<string | null>(null);
  const [caption, setCaption] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  /** Bumped by "Nochmal" (restart) so the item effect runs again. */
  const [run, setRun] = useState(0);
  const flow = useRef<AbortController | null>(null);

  // Created after hydration (it needs the browser), so server and client render alike.
  if (!narrator.current && hydrated) {
    narrator.current = createNarrator({ baseUrl: gaps.audioBase, available: availableAudio });
  }
  const n = narrator.current;

  useEffect(() => {
    setMuted(readMuted());
    return () => {
      flow.current?.abort();
      narrator.current?.stop();
    };
  }, []);

  const items = useMemo(() => gaps.items.map((item) => ({ item, gap: gapWord(item.arabic) })), [gaps.items]);
  const current = items[index]!;
  const revealed = wrong >= 2;
  const listen = gaps.mode === "listen";

  const newFlow = () => {
    flow.current?.abort();
    flow.current = new AbortController();
    return flow.current.signal;
  };
  const playWord = useCallback(() => {
    const audio = items[index]!.item.audio;
    if (audio) void narrator.current?.play([audio]);
  }, [items, index]);

  // Intro on the first item; in "Hören" every item starts with its word.
  const introDone = useRef(false);
  useEffect(() => {
    if (!started || phase !== "ask" || !narrator.current) return;
    const nr = narrator.current;
    const signal = newFlow();
    void (async () => {
      if (!introDone.current) {
        introDone.current = true;
        setCaption(gaps.narration.intro);
        await narrateWithFallback(nr, gaps.narration.intro, GAPS_FALLBACK_MS.intro, signal);
      }
      if (!signal.aborted && listen) playWord();
    })();
    // Runs when an item appears (or after "Nochmal"), not on every answer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, index, run]);

  function finishStep(all: Result[]) {
    setResults(all);
    setPhase("result");
    setCaption(gaps.narration.done);
    markLessonCompleted(progressKey);
    void narrator.current?.play([gaps.narration.done]);
  }

  function next(all: Result[]) {
    flow.current?.abort();
    if (index === items.length - 1) return finishStep(all);
    setIndex(index + 1);
    setWrong(0);
    setPhase("ask");
  }

  function answer(choice: string) {
    if (phase !== "ask" || !narrator.current) return;
    const nr = narrator.current;
    if (choice === current.gap.answer) {
      const all = [...results, { id: current.item.id, firstTry: wrong === 0 }];
      setResults(all);
      setPhase("correct");
      setCaption(GAPS_NARRATION.ok);
      playChime();
      const signal = newFlow();
      void (async () => {
        if (current.item.audio) await narrateWithFallback(nr, current.item.audio, GAPS_FALLBACK_MS.clip, signal);
        await narrateWithFallback(nr, GAPS_NARRATION.ok, GAPS_FALLBACK_MS.clip, signal);
        if (!signal.aborted) next(all);
      })();
      return;
    }
    const count = wrong + 1;
    setWrong(count);
    setShake(choice);
    if (count === 1) {
      setCaption(GAPS_NARRATION.hint);
      void nr.play([GAPS_NARRATION.hint, ...(current.item.audio ? [current.item.audio] : [])]);
    } else {
      const reveal = GAPS_NARRATION.reveal(current.gap.vowel);
      setCaption(reveal);
      void nr.play([reveal]);
    }
  }

  const { itemProps, targetProps, selectedKey } = usePickAndDrop<string>({ onDrop: (choice) => answer(choice) });

  function start() {
    // In the tap itself: lets the narration play on iOS without further taps.
    narrator.current?.unlock();
    unlockChime();
    setStarted(true);
  }

  function restart() {
    flow.current?.abort();
    narrator.current?.stop();
    setResults([]);
    setIndex(0);
    setWrong(0);
    setCaption(null);
    setPhase("ask");
    setRun((r) => r + 1);
  }

  function toggleMute() {
    const value = !muted;
    setMuted(value);
    narrator.current?.setMuted(value);
  }

  const total = items.length;

  return (
    <div data-testid="gaps-step" data-mode={gaps.mode} data-phase={phase} data-started={started}>
      <div className="mb-4 flex items-center justify-between gap-3">
        {hydrated && (completed || phase === "result") ? (
          <p className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow" data-testid="step-completed">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Geschafft
          </p>
        ) : (
          <span />
        )}
        <Button
          variant="secondary"
          onClick={toggleMute}
          aria-pressed={muted}
          aria-label={muted ? "Ton einschalten" : "Ton ausschalten"}
          className="min-h-12 min-w-12"
          data-testid="mute-toggle"
        >
          {muted ? <VolumeX className="h-5 w-5" aria-hidden /> : <Volume2 className="h-5 w-5" aria-hidden />}
        </Button>
      </div>

      {!started || !n ? (
        <div className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-3xl border bg-card p-8 text-center shadow-card" data-testid="start-overlay">
          <p lang="ar" dir="rtl" className="font-arabic text-6xl font-bold leading-[1.6] text-primary">
            {gaps.choices.join(" · ")}
          </p>
          <p className="max-w-sm text-muted-foreground">{listen ? "Hör genau zu und finde den fehlenden Buchstaben." : "Welcher Buchstabe fehlt? Finde ihn!"}</p>
          <Button size="lg" onClick={start} disabled={!n} data-testid="start-button" className="min-h-14">
            <Play className="h-5 w-5" aria-hidden /> Los geht&apos;s!
          </Button>
        </div>
      ) : phase === "result" ? (
        <ResultScreen items={items} results={results} onRestart={restart} />
      ) : (
        <section aria-label={`Aufgabe ${index + 1} von ${total}`} data-testid="gap-item" data-item={current.item.id} data-wrong={wrong} className="rounded-3xl border bg-card p-5 text-center shadow-card sm:p-8">
          <p className="text-sm text-muted-foreground" data-testid="gap-progress">
            Aufgabe {index + 1} von {total}
          </p>
          <ol className="mt-2 flex flex-wrap justify-center gap-1.5" aria-hidden>
            {items.map(({ item }, i) => (
              <li key={`${item.id}-${i}`} className={cn("h-2.5 w-2.5 rounded-full", i < index ? "bg-success" : i === index ? "bg-primary" : "bg-muted")} />
            ))}
          </ol>

          {current.item.image && (
            <Image src={current.item.image.src} alt={current.item.image.alt} width={200} height={150} className="mx-auto mt-4 rounded-2xl" unoptimized data-testid="gap-image" />
          )}

          {/* The word: the rest in pieces around the gap (cut only after letters without a Hand), or – once solved – shaped as one string. */}
          <div className="mt-4 grid min-h-28 place-items-center">
            <div
              dir="rtl"
              data-testid="gap-pieces"
              aria-hidden={phase === "correct"}
              className={cn("crossfade col-start-1 row-start-1 flex items-center justify-center gap-2 transition-opacity duration-500", phase === "correct" && "opacity-0")}
            >
              {gapPieces(current.gap).map((piece, i) =>
                piece.kind === "text" ? (
                  <span key={i} lang="ar" data-testid="gap-piece" className="font-arabic text-6xl font-bold leading-[1.8]">
                    {piece.text}
                  </span>
                ) : (
                  <button
                    key={i}
                    type="button"
                    {...targetProps("gap")}
                    data-testid="gap-slot"
                    data-filled={phase === "correct"}
                    aria-label={phase === "correct" ? `Lücke: ${current.gap.answer}` : "Lücke: hier ablegen"}
                    className={cn(
                      "flex h-20 w-16 items-center justify-center rounded-2xl border-2 font-arabic text-4xl font-bold transition focus-ring sm:h-24 sm:w-20 sm:text-5xl",
                      phase === "correct" ? "border-primary/30 bg-primary-soft" : selectedKey ? "border-dashed border-primary bg-primary-soft/60" : "border-dashed border-primary bg-card"
                    )}
                  >
                    {phase === "correct" && <span lang="ar">{current.gap.answer}</span>}
                  </button>
                )
              )}
            </div>
            {phase === "correct" && (
              <span className="col-start-1 row-start-1 animate-crossfade-in">
                <ShapedWord tiles={current.gap.tiles} highlight className="text-6xl leading-[1.8] text-foreground" testId="gap-shaped" />
              </span>
            )}
          </div>
          <p className="font-semibold" data-testid="gap-german">
            {current.item.german}
          </p>

          <div className="mt-3 flex justify-center">
            <Button variant="secondary" onClick={playWord} className="min-h-12" data-testid="gap-listen" aria-label={`${listen ? "Nochmal hören" : "Anhören"}: ${current.item.german}`}>
              <Volume2 className="h-5 w-5" aria-hidden /> {listen ? "Nochmal hören" : "Anhören"}
            </Button>
          </div>

          <ul className="mt-5 flex flex-wrap justify-center gap-3" aria-label="Buchstaben">
            {gaps.choices.map((choice, i) => {
              const isAnswer = choice === current.gap.answer;
              return (
                <li key={choice}>
                  <button
                    type="button"
                    {...itemProps(choice, choice, phase !== "ask")}
                    onAnimationEnd={() => setShake(null)}
                    data-testid={`choice-${i}`}
                    data-choice={choice}
                    data-reveal={revealed && isAnswer ? "true" : undefined}
                    aria-label={`Buchstabe ${choice}${revealed && isAnswer ? " – der richtige" : ""}`}
                    className={cn(
                      "flex h-16 min-w-14 cursor-grab select-none items-center justify-center rounded-2xl border bg-card px-3 font-arabic text-4xl font-bold shadow-sm transition focus-ring active:cursor-grabbing disabled:cursor-default sm:h-20 sm:min-w-16",
                      selectedKey === choice && "border-primary ring-2 ring-primary",
                      revealed && isAnswer && "border-success bg-success-soft ring-2 ring-success",
                      shake === choice && "animate-shake border-destructive"
                    )}
                  >
                    <span lang="ar">{choice}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <p aria-live="polite" data-testid="gap-caption" data-key={caption ?? ""} className="mx-auto mt-5 min-h-12 max-w-md rounded-2xl bg-muted/60 px-4 py-3 text-sm leading-relaxed">
            {caption ? GAPS_TEXT[caption] : ""}
          </p>

          {phase === "correct" && (
            <div className="mt-4 flex justify-center">
              <Button size="lg" onClick={() => next(results)} data-testid="gap-next">
                Weiter <ArrowRight className="h-5 w-5" aria-hidden />
              </Button>
            </div>
          )}
        </section>
      )}

      {phase === "result" && caption && (
        <p aria-live="polite" data-testid="gap-caption" data-key={caption} className="mx-auto mt-4 max-w-md rounded-2xl bg-muted/60 px-4 py-3 text-center text-sm leading-relaxed">
          {GAPS_TEXT[caption]}
        </p>
      )}
    </div>
  );
}

function ResultScreen({ items, results, onRestart }: { items: Array<{ item: GapsContent["items"][number]; gap: ReturnType<typeof gapWord> }>; results: Result[]; onRestart: () => void }) {
  const firstTry = results.filter((r) => r.firstTry).length;
  const stars = gapStars(firstTry, items.length);
  return (
    <section data-testid="gap-result" data-stars={stars} data-first-try={firstTry} aria-label="Korrigieren" className="animate-fade-in rounded-3xl border border-success/40 bg-card p-5 text-center shadow-card sm:p-8">
      <h2 className="text-2xl font-bold">Korrigieren</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        <Check className="inline h-4 w-4 text-success" aria-hidden /> beim ersten Versuch richtig · <Circle className="inline h-3 w-3 fill-warning text-warning" aria-hidden /> mit Hilfe
      </p>
      <ul dir="rtl" className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map(({ item, gap }, i) => {
          const ok = results[i]?.firstTry ?? false;
          return (
            <li key={`${item.id}-${i}`} data-testid={`result-${item.id}`} data-first-try={ok} className="relative flex flex-col items-center rounded-2xl border bg-background/60 px-2 py-3">
              <span className="absolute end-2 top-2" aria-label={ok ? "beim ersten Versuch richtig" : "mit Hilfe"}>
                {ok ? <Check className="h-5 w-5 text-success" aria-hidden /> : <Circle className="h-3 w-3 fill-warning text-warning" aria-hidden />}
              </span>
              <ShapedWord tiles={gap.tiles} highlight className="text-4xl leading-[1.8] text-foreground" />
              <span dir="ltr" className="text-sm font-medium">
                {item.german}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-5 text-4xl leading-none tracking-widest text-accent" aria-label={`${stars} von 3 Sternen`} data-testid="gap-stars">
        {"★".repeat(stars)}
        <span className="text-border">{"★".repeat(3 - stars)}</span>
      </p>
      <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Geschafft
      </span>
      <p lang="ar" className="mt-3 font-arabic text-4xl font-bold text-success">
        مُمْتَاز! 👏
      </p>
      <Button variant="secondary" size="lg" onClick={onRestart} className="mt-5" data-testid="gap-restart">
        <RotateCcw className="h-5 w-5" aria-hidden /> Nochmal
      </Button>
    </section>
  );
}
