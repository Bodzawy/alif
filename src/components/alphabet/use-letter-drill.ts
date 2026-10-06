"use client";

import { useCallback, useEffect, useState } from "react";

import { usePronunciationExercise, type ExerciseErrorCode } from "@/components/pronunciation/use-pronunciation-exercise";
import { ALPHABET, alphabetLetterHref } from "@/data/alphabet";
import type { LetterResult } from "@/lib/alphabet-score";
import type { StudentFeedback } from "@/lib/pronunciation/client";
import { FEEDBACK_CUES } from "@/lib/pronunciation/cues";
import { speakArabic, stopSpeaking } from "@/lib/tts/player";

// The hands-free A0 round: letter → its name is spoken → the student speaks →
// evaluation → "ممتاز" and on to the next letter, or the student tries again
// (the name is spoken again before every attempt) – as often as needed. No letter is passed over unless a
// technical problem forces a skip; every extra attempt lowers the round score
// (src/lib/alphabet-score.ts).
//
//   listening ─ result passed ──────▶ correct ──▶ listening (next letter) … completed
//       │     ─ result not passed ──▶ incorrect ─▶ listening (same letter)
//       │     ─ nothing heard ──────▶ listening (not counted; paused after a few in a row)
//       │     ─ technical error ────▶ error ─ "Erneut versuchen" ▶ listening
//       └──── tab hidden ───────────▶ paused ─ tab visible ──────▶ listening
//
// The microphone part (`listening` = recording/processing) is
// usePronunciationExercise in hands-free mode, i.e. the unchanged
// /api/pronunciation pipeline.

export type DrillPhase = "listening" | "correct" | "incorrect" | "paused" | "error" | "completed";

type DrillState = {
  /** Index into ALPHABET of the current letter. */
  index: number;
  phase: DrillPhase;
  /** Bumped to (re)start listening. */
  run: number;
  /** Evaluated attempts on the current letter. */
  attempts: number;
  results: LetterResult[];
  /** The last attempt was not understood (not counted as an attempt). */
  unclear: boolean;
  noSpeechStreak: number;
  error: string | null;
  pausedBy: "hidden" | "no_speech" | null;
};

/** Attempts in a row without usable speech before the round waits for a tap. */
const MAX_NO_SPEECH_STREAK = 3;
const CORRECT_PAUSE_MS = 900;
const INCORRECT_PAUSE_MS = 400;
const TTS_TIMEOUT_MS = 4000;
const START_DELAY_MS = 150;

const ANALYSIS_UNAVAILABLE =
  "Die Lautanalyse ist gerade nicht verfügbar, deshalb konnte deine Aussprache nicht bewertet werden. Bitte versuche es gleich noch einmal.";

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Speaks a cue; never fails and never blocks the round for long. */
function say(text: string) {
  return Promise.race([speakArabic(text).catch(() => undefined), delay(TTS_TIMEOUT_MS)]);
}

function initialState(index: number): DrillState {
  return { index, phase: "listening", run: 0, attempts: 0, results: [], unclear: false, noSpeechStreak: 0, error: null, pausedBy: null };
}

function listenAgain(s: DrillState): DrillState {
  return { ...s, phase: "listening", run: s.run + 1, error: null, pausedBy: null };
}

/** Closes the current letter and moves on (or completes the round). */
function advance(s: DrillState, attempts: number | null): DrillState {
  const results = [...s.results, { id: ALPHABET[s.index]!.id, attempts }];
  if (s.index + 1 >= ALPHABET.length) return { ...s, results, phase: "completed" };
  return { ...listenAgain(s), results, index: s.index + 1, attempts: 0, unclear: false, noSpeechStreak: 0 };
}

export function useLetterDrill({
  startIndex,
  canStart,
  onMastered,
  onSkipped,
}: {
  startIndex: number;
  /** Progress is loaded and the start letter is not locked. */
  canStart: boolean;
  onMastered: (letterId: string) => void;
  onSkipped: (letterId: string) => void;
}) {
  const [state, setState] = useState<DrillState>(() => initialState(startIndex));
  /** The letter's name is being spoken before an attempt. */
  const [prompting, setPrompting] = useState(false);
  const letter = ALPHABET[state.index]!;

  const onResult = useCallback(
    (feedback: StudentFeedback) => {
      if (feedback.analysisUnavailable) {
        setState((s) => ({ ...s, phase: "error", error: ANALYSIS_UNAVAILABLE }));
        return;
      }
      if (feedback.passed) onMastered(letter.id);
      setState((s) => ({ ...s, phase: feedback.passed ? "correct" : "incorrect", attempts: s.attempts + 1, unclear: false, noSpeechStreak: 0 }));
    },
    [letter.id, onMastered]
  );

  const onError = useCallback((code: ExerciseErrorCode, message: string) => {
    setState((s) => {
      if (code !== "no_speech") return { ...s, phase: "error", error: message };
      const noSpeechStreak = s.noSpeechStreak + 1;
      if (noSpeechStreak >= MAX_NO_SPEECH_STREAK) return { ...s, phase: "paused", pausedBy: "no_speech", unclear: false, noSpeechStreak };
      return { ...listenAgain(s), unclear: true, noSpeechStreak };
    });
  }, []);

  const exercise = usePronunciationExercise({ target: letter.exercise.target, onResult, onError, handsFree: true });
  const { start, cancel } = exercise;

  // listening: say the letter's name first, then open the microphone (only
  // after playback, so the model voice is never recorded as the attempt).
  useEffect(() => {
    if (!canStart || state.phase !== "listening") return;
    if (document.hidden) {
      setState((s) => ({ ...s, phase: "paused", pausedBy: "hidden" }));
      return;
    }
    let active = true;
    setPrompting(true);
    void say(letter.modelText)
      .then(() => delay(START_DELAY_MS))
      .then(() => {
        if (!active) return;
        setPrompting(false);
        void start();
      });
    return () => {
      active = false;
      setPrompting(false);
    };
  }, [canStart, state.phase, state.run, start, letter.modelText]);

  // correct: "ممتاز", then straight on to the next letter.
  // incorrect: show the letter's name briefly, then the next attempt begins.
  useEffect(() => {
    if (state.phase !== "correct" && state.phase !== "incorrect") return;
    let active = true;
    const correct = state.phase === "correct";
    void Promise.all([correct ? say(FEEDBACK_CUES.success) : undefined, delay(correct ? CORRECT_PAUSE_MS : INCORRECT_PAUSE_MS)]).then(() => {
      if (!active) return;
      setState((s) => (correct ? advance(s, s.attempts) : listenAgain(s)));
    });
    return () => {
      active = false;
    };
  }, [state.phase, state.run]);

  // Keep the address bar on the current letter, so a reload resumes there.
  useEffect(() => {
    const href = alphabetLetterHref(letter.id);
    if (window.location.pathname !== href) window.history.replaceState(window.history.state, "", href);
  }, [letter.id]);

  // Never listen in a background tab.
  useEffect(() => {
    function onVisibility() {
      if (document.hidden) {
        cancel();
        setState((s) => (s.phase === "listening" ? { ...s, phase: "paused", pausedBy: "hidden" } : s));
      } else {
        setState((s) => (s.phase === "paused" && s.pausedBy === "hidden" ? listenAgain(s) : s));
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [cancel]);

  useEffect(() => stopSpeaking, []);

  /** After a technical error or a pause: listen again (not counted as an attempt). */
  const resume = useCallback(() => setState((s) => ({ ...listenAgain(s), unclear: false, noSpeechStreak: 0 })), []);

  /** Technical escape hatch: the letter stays "nicht gemeistert" and scores 0. */
  const skip = useCallback(() => {
    onSkipped(letter.id);
    setState((s) => advance(s, null));
  }, [letter.id, onSkipped]);

  /** Starts the round again from its first letter. */
  const restart = useCallback(() => {
    cancel();
    setState((s) => ({ ...initialState(startIndex), run: s.run + 1 }));
  }, [cancel, startIndex]);

  return {
    letter,
    phase: state.phase,
    attempts: state.attempts,
    results: state.results,
    unclear: state.unclear,
    error: state.error,
    pausedBy: state.pausedBy,
    /** Microphone state while `phase === "listening"`. */
    mic: exercise.phase,
    prompting,
    speaking: exercise.speaking,
    resume,
    skip,
    restart,
  };
}
