"use client";

import { useEffect, useReducer, useRef } from "react";

import type { Utterance } from "@/lib/audio/guided-mic";
import { sleep } from "@/lib/audio/narrate";

import type { Verdict } from "./evaluate";

// Guided mode of A1 · Schritt 2: the blocks run one after another by
// themselves. One stage at a time; each stage's effect starts its work and
// cancels it in its cleanup (next stage, pause, unmount).
//
//   focus ─▶ play ─▶ listen ─▶ check ─▶ right ─▶ (next block) focus …
//                      │          └──▶ wrong / no answer ─▶ play again (max 3 per block and round)
//                      └── no speech in 5 s = no answer (no evaluation call)
//   after the last block: one extra round for the "needs practice" blocks, then finished.

export type GuidedBlock = { id: string; text: string; target: string };
export type BlockMark = "done" | "practice";
export type Stage = "idle" | "focus" | "play" | "listen" | "check" | "right" | "paused" | "finished" | "fallback";

export const GUIDED_TIMING = {
  /** Blur fades, the block grows. */
  focusMs: 400,
  /** Pause between the end of the model audio and the start of recording (the speaker must not be recorded). */
  afterPlayMs: 300,
  /** The green tint is shown before the next block. */
  rightMs: 700,
  /** Wrong / no answer attempts per block and round. */
  maxAttempts: 3,
  /** Evaluation errors in a row before falling back to the buttons. */
  maxErrors: 2,
} as const;

export type GuidedState = {
  stage: Stage;
  /** Blocks still to do in this round; the active one is queue[0]. */
  queue: string[];
  round: 1 | 2;
  attempts: number;
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
  | { type: "fallback" };

export const initialGuidedState: GuidedState = { stage: "idle", queue: [], round: 1, attempts: 0, retry: false, marks: {}, practice: [], errors: 0, run: 0 };

function fail(s: GuidedState): GuidedState {
  const attempts = s.attempts + 1;
  if (attempts < GUIDED_TIMING.maxAttempts) return { ...s, stage: "play", attempts, retry: true, run: s.run + 1 };
  // Three times without success: "needs practice", then move on.
  const id = s.queue[0]!;
  const marked = { ...s, marks: { ...s.marks, [id]: "practice" as const }, practice: s.round === 1 ? [...s.practice, id] : s.practice };
  return next(marked);
}

function next(s: GuidedState): GuidedState {
  const queue = s.queue.slice(1);
  const base = { ...s, attempts: 0, retry: false, run: s.run + 1 };
  if (queue.length > 0) return { ...base, queue, stage: "focus" };
  if (s.round === 1 && s.practice.length > 0) return { ...base, queue: s.practice, round: 2, stage: "focus" };
  return { ...base, queue: [], stage: "finished" };
}

export function guidedReducer(s: GuidedState, a: Action): GuidedState {
  switch (a.type) {
    case "start": {
      const queue = a.order.filter((id) => a.marks[id] !== "done");
      return { ...initialGuidedState, marks: a.marks, queue, stage: queue.length ? "focus" : "finished", run: s.run + 1 };
    }
    case "advance":
      return s.stage === "focus" ? { ...s, stage: "play" } : s.stage === "play" ? { ...s, stage: "listen" } : s;
    case "heard":
      return a.silence ? fail(s) : { ...s, stage: "check" };
    case "verdict":
      if (a.verdict === "right") return { ...s, stage: "right", errors: 0, marks: { ...s.marks, [s.queue[0]!]: "done" } };
      if (a.verdict === "wrong") return fail({ ...s, errors: 0 });
      // Service error: not the child's fault – listen again, unless it keeps failing.
      return s.errors + 1 >= GUIDED_TIMING.maxErrors ? { ...s, stage: "fallback", errors: s.errors + 1 } : { ...s, stage: "play", errors: s.errors + 1, run: s.run + 1 };
    case "next":
      return next(s);
    case "pause":
      return ["focus", "play", "listen", "check"].includes(s.stage) ? { ...s, stage: "paused" } : s;
    case "resume":
      return s.stage === "paused" ? { ...s, stage: "play", run: s.run + 1 } : s;
    case "fallback":
      return { ...s, stage: "fallback" };
  }
}

export type GuidedDeps = {
  /** Plays the block's model audio; resolves when it ended (or could not play). */
  play: (block: GuidedBlock, signal: AbortSignal) => Promise<void>;
  record: (signal: AbortSignal) => Promise<Utterance | null>;
  evaluate: (utterance: Extract<Utterance, { kind: "speech" }>, block: GuidedBlock, signal: AbortSignal) => Promise<Verdict>;
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
        void sleep(GUIDED_TIMING.rightMs, signal).then(() => live() && dispatch({ type: "next" }));
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
  };
}
