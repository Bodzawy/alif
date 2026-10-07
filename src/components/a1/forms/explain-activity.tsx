"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { ArrowRight, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { FormsWord } from "@/data/types";
import { hamzaPosition, splitTiles, type HamzaPosition } from "@/lib/arabic/hamza-alif";
import type { Narrator } from "@/lib/audio/narration";
import { cn } from "@/lib/utils";

import { EXPLAIN_TEXT, LETTER_TILE, NARRATION, POSITION_LABEL, POSITION_LABEL_GERMAN } from "./content";
import { ShapedWord } from "./shaped-word";

// "Zuschauen": the four book words, explained one per scene – no exercise.
// Each scene runs through stages; every stage starts its sound and timers in
// one effect and cancels them in that effect's cleanup (scene change,
// "Nochmal ansehen", "Weiter", tab change, unmount).
//
//   intro ─▶ letters ─▶ join ─▶ word ─▶ explain ─▶ ready          (scenes 1–3)
//                                            └──▶ outro ─▶ ready   (scene 4)
//
// A stage that waits for narration moves on at the clip's end. If the clip
// cannot play (missing file, muted, blocked) it waits for a fallback time
// instead, so the animation always finishes.

export type ExplainStage = "intro" | "letters" | "join" | "word" | "explain" | "outro" | "ready";

/** Fallback durations when a clip cannot be played. */
export const FALLBACK_MS = { letters: 4000, explain: 3500, word: 800, intro: 3500, outro: 3500 } as const;
/** Time between two letter tiles appearing. */
export const TILE_STEP_MS = 600;
/** Tiles slide together, then the shaped word fades in. */
export const JOIN_MS = 900;
/** Safety net: a clip that never reports its end does not hold the scene. */
const MAX_CLIP_MS = 20_000;

type State = { scene: number; stage: ExplainStage; run: number };
type Action = { type: "advance"; last: boolean } | { type: "restart" } | { type: "next" };

export function explainReducer(state: State, action: Action): State {
  switch (action.type) {
    case "restart":
      return { ...state, stage: "letters", run: state.run + 1 };
    case "next":
      return { scene: state.scene + 1, stage: "letters", run: state.run + 1 };
    case "advance": {
      const next: Record<ExplainStage, ExplainStage> = {
        intro: "letters",
        letters: "join",
        join: "word",
        word: "explain",
        explain: action.last ? "outro" : "ready",
        outro: "ready",
        ready: "ready",
      };
      return { ...state, stage: next[state.stage] };
    }
  }
}

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (signal.aborted || ms <= 0) return resolve();
    const timer = setTimeout(done, ms);
    function done() {
      clearTimeout(timer);
      signal.removeEventListener("abort", done);
      resolve();
    }
    signal.addEventListener("abort", done);
  });
}

/** Plays a clip and waits for its end – or for `fallbackMs` when it cannot be played. */
async function narrate(narrator: Narrator, name: string, fallbackMs: number, signal: AbortSignal) {
  if (signal.aborted) return;
  const started = Date.now();
  let pending = true;
  const onAbort = () => pending && narrator.stop();
  signal.addEventListener("abort", onAbort);
  const result = await Promise.race([narrator.playClip(name), sleep(MAX_CLIP_MS, signal).then(() => "ended" as const)]);
  pending = false;
  signal.removeEventListener("abort", onAbort);
  if (signal.aborted || result === "ended") return;
  // Skipped, or cut off by another sound (mute, "Nochmal hören"): let the picture take its time.
  await sleep(fallbackMs - (Date.now() - started), signal);
}

type Scene = { word: FormsWord; tiles: string[]; position: HamzaPosition };

export function ExplainActivity({
  words,
  narrator,
  withPageIntro,
  onReachedEnd,
  onFinish,
}: {
  words: FormsWord[];
  narrator: Narrator;
  /** First visit right after "Los geht's!": play f_intro before e_intro. */
  withPageIntro: boolean;
  /** Scene 4 has been explained (the exercises unlock). */
  onReachedEnd: () => void;
  /** "Weiter zur Übung". */
  onFinish: () => void;
}) {
  const scenes: Scene[] = useMemo(
    () => words.map((word) => ({ word, tiles: splitTiles(word.arabic), position: hamzaPosition(splitTiles(word.arabic)) })),
    [words]
  );
  const [state, dispatch] = useReducer(explainReducer, { scene: 0, stage: "intro", run: 0 });
  const [shown, setShown] = useState(0);
  const pageIntro = useRef(withPageIntro);
  const onReachedEndRef = useRef(onReachedEnd);
  onReachedEndRef.current = onReachedEnd;

  const scene = scenes[state.scene]!;
  const last = state.scene === scenes.length - 1;

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    const advance = () => !signal.aborted && dispatch({ type: "advance", last });

    switch (state.stage) {
      case "intro":
        void (async () => {
          if (pageIntro.current) await narrate(narrator, NARRATION.pageIntro, 0, signal);
          pageIntro.current = false;
          await narrate(narrator, NARRATION.explain.intro, FALLBACK_MS.intro, signal);
          advance();
        })();
        break;
      case "letters": {
        // Right to left, one tile every TILE_STEP_MS, while the "_a" clip plays.
        setShown(0);
        const timers = scene.tiles.map((_, i) => setTimeout(() => setShown(i + 1), 150 + i * TILE_STEP_MS));
        signal.addEventListener("abort", () => timers.forEach(clearTimeout));
        void Promise.all([
          narrate(narrator, NARRATION.explain.letters(scene.position), FALLBACK_MS.letters, signal),
          sleep(150 + scene.tiles.length * TILE_STEP_MS, signal),
        ]).then(advance);
        break;
      }
      case "join":
        void sleep(JOIN_MS, signal).then(advance);
        break;
      case "word":
        void narrate(narrator, scene.word.audio, FALLBACK_MS.word, signal).then(advance);
        break;
      case "explain":
        void narrate(narrator, NARRATION.explain.why(scene.position), FALLBACK_MS.explain, signal).then(advance);
        break;
      case "outro":
        onReachedEndRef.current();
        void narrate(narrator, NARRATION.explain.outro, FALLBACK_MS.outro, signal).then(advance);
        break;
      case "ready":
        if (last) onReachedEndRef.current();
        break;
    }
    return () => controller.abort();
  }, [state.scene, state.stage, state.run, narrator, scene, last]);

  const stage = state.stage;
  const tilesVisible = stage === "letters" || stage === "join";
  const wordVisible = stage !== "intro" && stage !== "letters";
  const explained = stage === "explain" || stage === "outro" || stage === "ready";
  const captionKey =
    stage === "intro"
      ? NARRATION.explain.intro
      : stage === "outro" || (stage === "ready" && last)
        ? NARRATION.explain.outro
        : explained
          ? NARRATION.explain.why(scene.position)
          : NARRATION.explain.letters(scene.position);

  return (
    <section data-testid="explain-activity" data-scene={state.scene + 1} data-stage={stage} aria-label="Zuschauen" className="rounded-3xl border bg-card p-5 text-center shadow-card sm:p-8">
      <ol className="mb-5 flex justify-center gap-2" aria-label={`Wort ${state.scene + 1} von ${scenes.length}`}>
        {scenes.map((item, i) => (
          <li
            key={item.word.id}
            data-testid={`explain-dot-${i}`}
            data-state={i < state.scene ? "done" : i === state.scene ? "current" : "open"}
            className={cn("h-3 w-3 rounded-full", i < state.scene ? "bg-success" : i === state.scene ? "bg-primary" : "bg-muted")}
          />
        ))}
      </ol>

      {/* Tiles and the finished word share one place: the tiles slide together, then the word fades in. */}
      <div className="grid min-h-36 place-items-center" aria-hidden={stage === "intro"}>
        {stage !== "intro" && (
          <div
            dir="rtl"
            className={cn(
              "crossfade col-start-1 row-start-1 flex justify-center transition-all duration-500 motion-reduce:transition-none",
              stage === "join" ? "gap-0" : "gap-5 sm:gap-8",
              !tilesVisible && "opacity-0"
            )}
            data-testid="explain-tiles"
          >
            {scene.tiles.map((tile, i) => (
              <span
                key={`${state.run}-${i}`}
                lang="ar"
                data-shown={i < shown}
                className={cn(
                  LETTER_TILE,
                  "crossfade transition-all duration-500",
                  i < shown ? "opacity-100" : "opacity-0 motion-safe:-translate-x-3",
                  stage === "join" && "rounded-none border-transparent bg-transparent"
                )}
              >
                {tile}
              </span>
            ))}
          </div>
        )}
        <div className={cn("crossfade col-start-1 row-start-1 transition-opacity delay-300 duration-500", wordVisible ? "opacity-100" : "pointer-events-none opacity-0")}>
          {wordVisible && (
            <ShapedWord
              key={`${scene.word.id}-${explained}`}
              tiles={scene.tiles}
              highlight={explained}
              gap
              className="text-6xl leading-[1.8] text-foreground sm:text-7xl"
              testId={`explain-word-${scene.word.id}`}
            />
          )}
        </div>
      </div>

      <div className="mt-2 min-h-16" data-testid="explain-meaning">
        {explained && (
          <div className="flex animate-fade-in flex-col items-center gap-1">
            <p className="text-lg font-semibold">{scene.word.german}</p>
            <p className="text-sm text-muted-foreground">
              <span lang="ar" dir="rtl" className="font-arabic text-xl font-bold text-primary" data-testid="explain-label">
                {POSITION_LABEL[scene.position]}
              </span>{" "}
              · {POSITION_LABEL_GERMAN[scene.position]}
            </p>
          </div>
        )}
      </div>

      <p aria-live="polite" data-testid="explain-caption" data-key={captionKey} className="mx-auto mt-4 min-h-12 max-w-md rounded-2xl bg-muted/60 px-4 py-3 text-sm leading-relaxed">
        {EXPLAIN_TEXT[captionKey]}
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <Button variant="secondary" size="lg" onClick={() => dispatch({ type: "restart" })} disabled={stage === "intro"} data-testid="explain-replay">
          <RotateCcw className="h-5 w-5" aria-hidden /> Nochmal ansehen
        </Button>
        <Button
          size="lg"
          // During the intro "Weiter" skips to the first word, otherwise to the next one.
          onClick={() => (stage === "intro" ? dispatch({ type: "advance", last }) : last ? onFinish() : dispatch({ type: "next" }))}
          data-testid="explain-next"
          data-ready={stage === "ready"}
          className={cn(stage === "ready" && "motion-safe:animate-pulse")}
        >
          {last ? "Weiter zur Übung" : "Weiter"} <ArrowRight className="h-5 w-5" aria-hidden />
        </Button>
      </div>
    </section>
  );
}
