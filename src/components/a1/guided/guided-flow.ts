"use client";

import { useEffect, useReducer, useRef } from "react";

import type { Utterance } from "@/lib/audio/guided-mic";
import { sleep } from "@/lib/audio/narrate";

import type { Verdict } from "./evaluate";

// Guided mode of A1 · Schritt 2: the blocks run one after another by
// themselves. One stage at a time; each stage's effect starts its work and
// cancels it in its cleanup (next stage, pause, unmount).
//
//   focus ─▶ play ─▶ listen ─▶ check ─▶ right ("Super!") ─▶ (next block) focus …
//                      │          └──▶ wrong / no answer ─▶ play again (no limit: until it is right)
//                      └── no speech in 5 s = no answer (no evaluation call)
//   after the last block: one extra round for the "needs practice" blocks, then finished.
//
// The child's own controls (A1 "Wörter", see guided-sound-words.tsx):
//   skip     – after two wrong answers on the block: marked "needs practice", next block
//   previous – the block before the active one (in the page's order), asked again
//   restart  – every block from the first one, without any marks

export type GuidedBlock = { id: string; text: string; target: string };
export type BlockMark = "done" | "practice";
export type Stage = "idle" | "focus" | "play" | "listen" | "check" | "right" | "paused" | "finished" | "fallback";

export const GUIDED_TIMING = {
  /** Blur fades, the block grows. */
  focusMs: 150,
  /** Pause between the end of the model audio and the start of recording (the speaker must not be recorded). */
  afterPlayMs: 0,
  /** The green tint is shown before the next block. */
  rightMs: 700,
  /** Wrong / no answer attempts per block and round. */
  //maxAttempts: 3,
  /** Evaluation errors in a row before falling back to the buttons. */
  maxErrors: 2,
  /** Wrong answers on one block before the child may skip it. */
  skipAfterFailures: 2,
} as const;

export type GuidedState = {
  stage: Stage;
  /** All blocks in the page's order (for "previous" and "restart"). */
  order: string[];
  /** Blocks still to do in this round; the active one is queue[0]. */
  queue: string[];
  round: 1 | 2;
  attempts: number;
  /** Wrong answers on the active block (silence and service errors do not count); reset on every block change. */
  failures: number;
  /** The next attempt replays after a wrong answer ("Noch einmal"). */
  retry: boolean;
  marks: Record<string, BlockMark>;
  /** Blocks marked "needs practice" in round 1 (for round 2). */
  practice: string[];
  errors: number;
  /** Bumped whenever a stage must run again. */
  run: number;
};

type Action =
  | { type: "start"; order: string[]; marks: Record<string, BlockMark> }
  | { type: "advance" }
  | { type: "heard"; silence: boolean }
  | { type: "verdict"; verdict: Exclude<Verdict, "aborted"> }
  | { type: "next" }
  | { type: "pause" }
  | { type: "resume" }
  | { type: "replay" }
  | { type: "fallback" }
  | { type: "skip" }
  | { type: "previous" }
  | { type: "restart" };

export const initialGuidedState: GuidedState = { stage: "idle", order: [], queue: [], round: 1, attempts: 0, failures: 0, retry: false, marks: {}, practice: [], errors: 0, run: 0 };

/** Stages in which a block is being worked on (the child's controls act only then). */
const WORKING: Stage[] = ["focus", "play", "listen", "check", "right", "paused"];

/** The skip button is offered: the active block was answered wrong often enough and is not finished yet. */
export function canSkip(s: GuidedState): boolean {
  return s.failures >= GUIDED_TIMING.skipAfterFailures && ["focus", "play", "listen", "check"].includes(s.stage);
}

/** The block before the active one, or null on the first block. */
export function previousBlock(s: GuidedState): string | null {
  const index = s.order.indexOf(s.queue[0] ?? "");
  return WORKING.includes(s.stage) && index > 0 ? s.order[index - 1]! : null;
}

function fail(s: GuidedState): GuidedState {
  return {
    ...s,
    stage: "play",
    attempts: s.attempts + 1,
    retry: true,
    run: s.run + 1,
  };
}

function next(s: GuidedState): GuidedState {
  const queue = s.queue.slice(1);
  const base = { ...s, attempts: 0, failures: 0, retry: false, run: s.run + 1 };
  if (queue.length > 0) return { ...base, queue, stage: "focus" };
  if (s.round === 1 && s.practice.length > 0) return { ...base, queue: s.practice, round: 2, stage: "focus" };
  return { ...base, queue: [], stage: "finished" };
}

export function guidedReducer(s: GuidedState, a: Action): GuidedState {
  switch (a.type) {
    case "start": {
      const queue = a.order.filter((id) => a.marks[id] !== "done");
      return { ...initialGuidedState, order: a.order, marks: a.marks, queue, stage: queue.length ? "focus" : "finished", run: s.run + 1 };
    }
    case "advance":
      return s.stage === "focus" ? { ...s, stage: "play" } : s.stage === "play" ? { ...s, stage: "listen" } : s;
    case "heard":
      return a.silence ? fail(s) : { ...s, stage: "check" };
    case "verdict":
      if (a.verdict === "right") return { ...s, stage: "right", errors: 0, marks: { ...s.marks, [s.queue[0]!]: "done" } };
      if (a.verdict === "wrong") return fail({ ...s, errors: 0, failures: s.failures + 1 });
      // Service error: not the child's fault – listen again, unless it keeps failing.
      return s.errors + 1 >= GUIDED_TIMING.maxErrors ? { ...s, stage: "fallback", errors: s.errors + 1 } : { ...s, stage: "play", errors: s.errors + 1, run: s.run + 1 };
    case "next":
      return next(s);
    case "pause":
      return ["focus", "play", "listen", "check"].includes(s.stage) ? { ...s, stage: "paused" } : s;
    case "resume":
      return s.stage === "paused" ? { ...s, stage: "play", run: s.run + 1 } : s;
    case "replay":
      // "Nochmal anhören": stop listening (the model must not be recorded) and play the block again – no attempt is counted.
      return ["focus", "play", "listen"].includes(s.stage) ? { ...s, stage: "play", run: s.run + 1 } : s;
    case "fallback":
      return { ...s, stage: "fallback" };
    case "skip": {
      // Never "right": the block is marked "needs practice" (a block passed earlier keeps "done").
      // It is not asked again in this run; it stays open for the next visit to the step.
      if (!canSkip(s)) return s;
      const id = s.queue[0]!;
      return next({ ...s, marks: s.marks[id] === "done" ? s.marks : { ...s.marks, [id]: "practice" } });
    }
    case "previous": {
      const id = previousBlock(s);
      if (!id) return s;
      // The previous block first, then on from the active one as before.
      return { ...s, queue: [id, ...s.queue.filter((q) => q !== id)], stage: "focus", attempts: 0, failures: 0, retry: false, errors: 0, run: s.run + 1 };
    }
    case "restart":
      return { ...initialGuidedState, order: s.order, queue: s.order, stage: s.order.length ? "focus" : "finished", run: s.run + 1 };
  }
}

export type GuidedDeps = {
  /** Plays the block's model audio; resolves when it ended (or could not play). */
  play: (block: GuidedBlock, signal: AbortSignal) => Promise<void>;
  record: (signal: AbortSignal) => Promise<Utterance | null>;
  evaluate: (utterance: Extract<Utterance, { kind: "speech" }>, block: GuidedBlock, signal: AbortSignal) => Promise<Verdict>;
  /** After a right answer: the encouragement; the next block starts when it has finished. */
  praise?: (signal: AbortSignal) => Promise<void>;
};

export function useGuidedFlow(blocks: GuidedBlock[], deps: GuidedDeps, callbacks: { onMark: (id: string, mark: BlockMark) => void; onFinished: () => void; onFallback: () => void }) {
  const [state, dispatch] = useReducer(guidedReducer, initialGuidedState);
  const depsRef = useRef(deps);
  depsRef.current = deps;
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;
  const utterance = useRef<Extract<Utterance, { kind: "speech" }> | null>(null);
  const block = blocks.find((b) => b.id === state.queue[0]);

  useEffect(() => {
    if (!block) return;
    const controller = new AbortController();
    const { signal } = controller;
    const d = depsRef.current;
    const live = () => !signal.aborted;
    switch (state.stage) {
      case "focus":
        void sleep(GUIDED_TIMING.focusMs, signal).then(() => live() && dispatch({ type: "advance" }));
        break;
      case "play":
        void (async () => {
          await d.play(block, signal);
          await sleep(GUIDED_TIMING.afterPlayMs, signal);
          if (live()) dispatch({ type: "advance" });
        })();
        break;
      case "listen":
        void d.record(signal).then((result) => {
          if (!live() || !result) return;
          if (result.kind === "speech") utterance.current = result;
          dispatch({ type: "heard", silence: result.kind === "silence" });
        });
        break;
      case "check":
        if (!utterance.current) break;
        void d.evaluate(utterance.current, block, signal).then((verdict) => live() && verdict !== "aborted" && dispatch({ type: "verdict", verdict }));
        break;
      case "right":
        void Promise.all([sleep(GUIDED_TIMING.rightMs, signal), d.praise?.(signal)]).then(() => live() && dispatch({ type: "next" }));
        break;
    }
    return () => controller.abort();
  }, [state.stage, state.run, block]);

  // Save marks (done / needs practice) as they appear.
  const saved = useRef(new Set<string>());
  useEffect(() => {
    for (const [id, mark] of Object.entries(state.marks)) {
      const key = `${id}:${mark}`;
      if (saved.current.has(key)) continue;
      saved.current.add(key);
      callbacksRef.current.onMark(id, mark);
    }
  }, [state.marks]);

  useEffect(() => {
    if (state.stage === "finished") callbacksRef.current.onFinished();
    if (state.stage === "fallback") callbacksRef.current.onFallback();
  }, [state.stage]);

  // Background tab / app: stop sound and recording; on return, restart the active block from "play".
  useEffect(() => {
    const onVisibility = () => dispatch({ type: document.hidden ? "pause" : "resume" });
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return {
    state,
    active: state.stage === "idle" || state.stage === "finished" || state.stage === "fallback" ? null : (state.queue[0] ?? null),
    start: (marks: Record<string, BlockMark>) => {
      // Marks loaded from storage count as already saved.
      for (const [id, mark] of Object.entries(marks)) saved.current.add(`${id}:${mark}`);
      dispatch({ type: "start", order: blocks.map((b) => b.id), marks });
    },
    fallback: () => dispatch({ type: "fallback" }),
    replay: () => dispatch({ type: "replay" }),
    canSkip: canSkip(state),
    previousBlock: previousBlock(state),
    skip: () => dispatch({ type: "skip" }),
    previous: () => dispatch({ type: "previous" }),
    /** From the first block, without marks; the caller resets the saved progress. */
    restart: () => {
      saved.current.clear();
      dispatch({ type: "restart" });
    },
    /** Stops sound and recording (e.g. while a question is asked); resume() starts the block again from "play". */
    pause: () => dispatch({ type: "pause" }),
    resume: () => dispatch({ type: "resume" }),
  };
}
