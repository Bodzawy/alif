"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { CheckCircle2, Loader2, Mic, Play, Volume2, VolumeX } from "lucide-react";

import { SoundWordsStep } from "@/components/a1/sound-words-step";
import { Button } from "@/components/ui/button";
import type { SoundItem, VocabularyItem } from "@/data/types";
import { openGuidedMic, type GuidedMic } from "@/lib/audio/guided-mic";
import { sleep } from "@/lib/audio/narrate";
import { createNarrator, readMuted, type Narrator } from "@/lib/audio/narration";
import { getLessonProgress, markExercisePassed, markExerciseSkipped, markLessonCompleted, subscribeProgress } from "@/lib/progress";
import { speechUrl } from "@/lib/tts/player";
import { cn } from "@/lib/utils";

import { evaluateUtterance } from "./evaluate";
import { useGuidedFlow, type BlockMark, type GuidedBlock, type GuidedDeps } from "./guided-flow";

// Guided mode for A1 · Schritt 2 "Wörter mit أَ · إِ · أُ": after one tap the
// page runs by itself, block by block (right to left, row by row): the block
// is played (the same audio as "Anhören"), the child repeats, the recording is
// checked by the same evaluation as "Aufnehmen". Without a microphone, or when
// the evaluation keeps failing, the page falls back to the buttons.

type Groups = { sound: SoundItem; words: VocabularyItem[] }[];

/** The 12 blocks in the order the child sees them: per row the sound, then its words (RTL). */
export function guidedBlocks(groups: Groups): GuidedBlock[] {
  return groups.flatMap(({ sound, words }) => [
    { id: sound.id, text: sound.exercise.modelText, target: sound.exercise.target },
    ...words.map((word) => ({ id: word.id, text: word.exercise.modelText, target: word.exercise.target })),
  ]);
}

/** When the model audio cannot play (muted, offline): give the child a moment before listening. */
const SILENT_PLAY_MS = 800;

const CAPTION = {
  play: "Hör zu …",
  retry: "Noch einmal",
  listen: "Jetzt du!",
  check: "Einen Moment …",
  right: "Richtig!",
} as const;

const NOTE = {
  mic: "Das Mikrofon ist nicht verfügbar. Du kannst die Knöpfe benutzen.",
  service: "Die Auswertung ist gerade nicht erreichbar. Du kannst die Knöpfe benutzen.",
} as const;

const noop = () => () => undefined;

export function GuidedSoundWords({ groups, progressKey }: { groups: Groups; progressKey: string }) {
  const blocks = useMemo(() => guidedBlocks(groups), [groups]);
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const completed = useSyncExternalStore(subscribeProgress, () => Boolean(getLessonProgress(progressKey).completedAt), () => false);
  const [mode, setMode] = useState<"start" | "guided" | "fallback">("start");
  const [note, setNote] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const narrator = useRef<Narrator | null>(null);
  const mic = useRef<GuidedMic | null>(null);
  const frames = useRef(new Map<string, HTMLDivElement>());

  if (!narrator.current && hydrated) narrator.current = createNarrator({ baseUrl: "", available: [] });

  const releaseMic = useCallback(() => {
    mic.current?.release();
    mic.current = null;
  }, []);

  useEffect(() => {
    setMuted(readMuted());
    return () => {
      narrator.current?.stop();
      releaseMic();
    };
  }, [releaseMic]);

  const deps: GuidedDeps = useMemo(
    () => ({
      async play(block, signal) {
        const n = narrator.current;
        let result: "ended" | "skipped" | "interrupted" = "skipped";
        if (n) {
          const onAbort = () => n.stop();
          signal.addEventListener("abort", onAbort);
          try {
            const url = await speechUrl(block.text);
            if (signal.aborted) return;
            result = await n.playUrl(url);
          } catch {
            result = "skipped"; // text-to-speech not reachable: go on without the model audio
          } finally {
            signal.removeEventListener("abort", onAbort);
          }
        }
        if (result !== "ended") await sleep(SILENT_PLAY_MS, signal);
      },
      record: (signal) => mic.current?.record(signal) ?? Promise.resolve(null),
      evaluate: (utterance, block, signal) => evaluateUtterance(utterance, block.target, signal),
    }),
    []
  );

  const flow = useGuidedFlow(blocks, deps, {
    onMark: (id, mark) => (mark === "done" ? markExercisePassed(progressKey, id) : markExerciseSkipped(progressKey, id)),
    onFinished: () => {
      markLessonCompleted(progressKey);
      releaseMic(); // the browser's microphone indicator turns off
    },
    onFallback: () => {
      releaseMic();
      setNote(NOTE.service);
      setMode("fallback");
    },
  });

  async function start() {
    // Inside the tap: unlock audio (one reused element) and ask for the microphone.
    narrator.current?.unlock();
    try {
      mic.current = await openGuidedMic();
    } catch {
      setNote(NOTE.mic);
      setMode("fallback");
      return;
    }
    const saved = getLessonProgress(progressKey);
    const marks: Record<string, BlockMark> = {};
    for (const id of saved.skipped ?? []) marks[id] = "practice";
    for (const id of saved.passed) marks[id] = "done";
    setMode("guided");
    flow.start(marks);
  }

  function toggleMute() {
    const value = !muted;
    setMuted(value);
    narrator.current?.setMuted(value);
  }

  // Before the start: the saved state; afterwards the flow's.
  const savedMarks = useSyncExternalStore(
    subscribeProgress,
    () => JSON.stringify(getLessonProgress(progressKey)),
    () => "{}"
  );
  const marks: Record<string, BlockMark> = useMemo(() => {
    if (mode === "guided") return flow.state.marks;
    const saved = JSON.parse(savedMarks) as { passed?: string[]; skipped?: string[] };
    const result: Record<string, BlockMark> = {};
    for (const id of saved.skipped ?? []) result[id] = "practice";
    for (const id of saved.passed ?? []) result[id] = "done";
    return result;
  }, [mode, flow.state.marks, savedMarks]);
  const firstOpen = blocks.find((b) => marks[b.id] !== "done")?.id ?? null;
  const active = mode === "guided" ? flow.active : null;
  const stage = flow.state.stage;
  const finished = mode === "guided" && stage === "finished";

  // Bring the active block into view – smoothly, and only when it is not fully visible.
  useEffect(() => {
    if (!active || stage !== "focus") return;
    const el = frames.current.get(active);
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top >= 0 && r.bottom <= window.innerHeight) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
  }, [active, stage]);

  const caption =
    stage === "play" || stage === "focus" ? (flow.state.retry ? CAPTION.retry : CAPTION.play) : stage === "listen" ? CAPTION.listen : stage === "check" ? CAPTION.check : stage === "right" ? CAPTION.right : "";

  const frame = (id: string, card: ReactNode) => {
    const mark = marks[id];
    const isActive = id === active;
    // Before the start (and on the start card) only the first open block is sharp.
    const sharp = isActive || mark !== undefined || finished || (mode === "start" && id === firstOpen);
    const state = isActive ? "active" : mark === "done" ? "done" : mark === "practice" ? "practice" : sharp ? "next" : "waiting";
    return (
      <div
        ref={(el) => {
          if (el) frames.current.set(id, el);
          else frames.current.delete(id);
        }}
        data-testid={`block-${id}`}
        data-state={state}
        aria-current={isActive ? "step" : undefined}
        className={cn(
          "crossfade relative grid rounded-3xl transition-[filter,opacity,transform,box-shadow] duration-[400ms] ease-out",
          !sharp && "pointer-events-none opacity-60 blur-[6px]",
          sharp && !isActive && "pointer-events-none",
          isActive && "z-10 shadow-lift motion-safe:scale-[1.05]"
        )}
      >
        {card}
        {(mark === "done" || mark === "practice") && (
          <span aria-hidden data-testid={`tint-${id}`} className={cn("pointer-events-none absolute inset-0 rounded-3xl", mark === "done" ? "bg-success/10" : "bg-accent/10")} />
        )}
        {isActive && stage === "listen" && (
          // Listening sign on the block (a microphone in a pulsing ring – shape, not colour only; static
          // when motion is reduced). The words "Jetzt du!" are in the caption below the block.
          <span data-testid="listening-sign" role="img" aria-label="Das Mikrofon hört zu" className="pointer-events-none absolute left-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-card shadow">
            <span aria-hidden className="absolute inset-1 rounded-full border-2 border-primary motion-safe:animate-pulse-ring" />
            <Mic className="relative h-5 w-5 text-primary" aria-hidden />
          </span>
        )}
        {isActive && stage === "check" && (
          <span data-testid="checking-sign" role="img" aria-label="Wird geprüft" className="pointer-events-none absolute left-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-card text-muted-foreground shadow">
            <Loader2 className="h-5 w-5 motion-safe:animate-spin" aria-hidden />
          </span>
        )}
        {isActive && caption && (
          <span data-testid="guided-caption" dir="ltr" className="pointer-events-none absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-card px-3 py-1 text-sm font-semibold shadow">
            {stage === "play" || stage === "focus" ? <Volume2 className="h-4 w-4 text-primary" aria-hidden /> : null}
            {caption}
          </span>
        )}
      </div>
    );
  };

  if (mode === "fallback") {
    return (
      <div data-testid="guided-fallback">
        {note && (
          <p role="status" data-testid="guided-note" className="mb-4 rounded-2xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm">
            {note}
          </p>
        )}
        <SoundWordsStep groups={groups} />
      </div>
    );
  }

  return (
    <div data-testid="guided-step" data-mode={mode} data-stage={stage} data-active={active ?? ""}>
      <div className="mb-4 flex items-center justify-between gap-3">
        {hydrated && (completed || finished) ? (
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

      {mode === "start" && (
        <div className="mb-6 flex flex-col items-center justify-center gap-4 rounded-3xl border bg-card p-8 text-center shadow-card" data-testid="start-overlay">
          <p className="max-w-sm text-muted-foreground">Hör zu und sprich nach – Wort für Wort. Das Mikrofon hört dir zu.</p>
          <Button size="lg" onClick={() => void start()} disabled={!narrator.current} data-testid="start-button" className="min-h-14">
            <Play className="h-5 w-5" aria-hidden /> Los geht&apos;s!
          </Button>
        </div>
      )}

      {finished && (
        <div data-testid="guided-done" className="mb-6 animate-fade-in rounded-3xl border border-success/40 bg-card p-6 text-center shadow-card">
          <span className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Geschafft
          </span>
          <p lang="ar" className="mt-3 font-arabic text-4xl font-bold text-success">
            مُمْتَاز! 👏
          </p>
        </div>
      )}

      <p aria-live="polite" className="sr-only" data-testid="guided-live">
        {caption.replace(" …", "").replace("!", "")}
      </p>

      <SoundWordsStep groups={groups} guided={{ frame, passed: (id) => marks[id] === "done" }} />
    </div>
  );
}
