"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { blobTo16KhzMonoWav } from "@/lib/audio/wav";
import {
  MAX_RECORDING_MS,
  MIC_CONSTRAINTS,
  MIN_RECORDING_MS,
  microphoneErrorMessage,
  recordingSupported,
} from "@/lib/audio/recording";
import { VOICE_ACTIVITY, watchVoiceActivity, type VoiceActivityWatcher } from "@/lib/audio/voice-activity";
import {
  PronunciationRequestError,
  REQUEST_TIMEOUT_MS,
  submitRecording,
  toStudentFeedback,
  type StudentFeedback,
} from "@/lib/pronunciation/client";
import { stopSpeaking } from "@/lib/tts/player";

// Record → convert to 16 kHz mono WAV → POST /api/pronunciation → feedback.
// The state machine and its safeguards (min/max duration, unprocessed mic
// audio, request timeout, cleanup on unmount, single in-flight attempt) are
// those of the original standalone pronunciation trainer.
//
// `handsFree` (A0): the attempt ends by itself when the student stops
// speaking. Listening windows without any speech are discarded and restarted,
// so silence is never sent for evaluation. Where the browser cannot analyse
// the microphone level, it falls back to a fixed MAX_RECORDING_MS recording.

export type ExercisePhase = "idle" | "recording" | "processing" | "result" | "error";

/** Why an attempt failed without an evaluation. */
export type ExerciseErrorCode =
  /** Nothing usable was heard: too short, or Azure recognised no speech. */
  | "no_speech"
  /** Microphone missing, denied or unsupported. */
  | "microphone"
  /** Network, service or conversion failure. */
  | "technical";

export type ExerciseState = {
  phase: ExercisePhase;
  feedback: StudentFeedback | null;
  error: string | null;
  errorCode: ExerciseErrorCode | null;
  /** Hands-free only: the student is speaking right now. */
  speaking: boolean;
};

const IDLE: ExerciseState = { phase: "idle", feedback: null, error: null, errorCode: null, speaking: false };

function requestErrorCode(error: PronunciationRequestError): ExerciseErrorCode {
  if (error.code === "audio_too_short" || error.code === "unclear_audio" || error.status === 422) return "no_speech";
  return "technical";
}

export function usePronunciationExercise({
  target,
  onResult,
  onError,
  handsFree = false,
}: {
  target: string;
  onResult?: (feedback: StudentFeedback) => void;
  onError?: (code: ExerciseErrorCode, message: string) => void;
  handsFree?: boolean;
}) {
  const [state, setState] = useState<ExerciseState>(IDLE);

  const busyRef = useRef(false);
  const processingRef = useRef(false);
  const mountedRef = useRef(true);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const voiceRef = useRef<VoiceActivityWatcher | null>(null);
  /** What the recorder's onstop does: evaluate, start a fresh listening window, or drop the audio. */
  const onStopRef = useRef<"submit" | "relisten" | "discard">("submit");
  const startedAtRef = useRef(0);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const releaseStream = useCallback(() => {
    clearTimer();
    voiceRef.current?.stop();
    voiceRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, [clearTimer]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
      const recorder = recorderRef.current;
      if (recorder && recorder.state === "recording") {
        recorder.onstop = null;
        recorder.stop();
      }
      releaseStream();
    };
  }, [releaseStream]);

  const fail = useCallback(
    (message: string, code: ExerciseErrorCode) => {
      releaseStream();
      busyRef.current = false;
      if (!mountedRef.current) return;
      setState({ ...IDLE, phase: "error", error: message, errorCode: code });
      onErrorRef.current?.(code, message);
    },
    [releaseStream]
  );

  const submit = useCallback(
    async (chunks: Blob[], mimeType: string) => {
      releaseStream();
      if (!mountedRef.current) return;
      processingRef.current = true;
      setState({ ...IDLE, phase: "processing" });

      const duration = Date.now() - startedAtRef.current;
      if (chunks.length === 0 || duration < MIN_RECORDING_MS) {
        processingRef.current = false;
        fail("Die Aufnahme war zu kurz. Tippe auf das Mikrofon, sprich deutlich und tippe dann auf Stopp.", "no_speech");
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        let wav: Blob;
        try {
          wav = await blobTo16KhzMonoWav(new Blob(chunks, { type: mimeType || "audio/webm" }));
        } catch (error) {
          console.error("Audio conversion failed:", error);
          fail("Die Aufnahme konnte nicht verarbeitet werden. Bitte nimm noch einmal auf.", "technical");
          return;
        }

        const response = await submitRecording(wav, target, { signal: controller.signal });
        const feedback = toStudentFeedback(response);

        busyRef.current = false;
        if (!mountedRef.current) return;
        setState({ ...IDLE, phase: "result", feedback });
        onResultRef.current?.(feedback);
      } catch (error) {
        if (error instanceof PronunciationRequestError) {
          fail(error.message, requestErrorCode(error));
        } else {
          console.error("Pronunciation evaluation failed:", error);
          fail("Deine Aussprache konnte nicht bewertet werden. Bitte versuche es noch einmal.", "technical");
        }
      } finally {
        processingRef.current = false;
        clearTimeout(timeout);
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [fail, releaseStream, target]
  );

  const stop = useCallback(() => {
    clearTimer();
    const recorder = recorderRef.current;
    if (recorder && recorder.state === "recording") recorder.stop();
  }, [clearTimer]);

  /** Hands-free: one listening window on the already open stream. */
  const listen = useCallback(
    (stream: MediaStream) => {
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = () => {
        const next = onStopRef.current;
        onStopRef.current = "submit";
        if (next === "submit") void submit(chunks, recorder.mimeType);
        else if (next === "relisten" && mountedRef.current && streamRef.current === stream) listen(stream);
      };
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      recorder.start();

      clearTimer();
      if (voiceRef.current) {
        // No speech in this window: drop it and listen again.
        timerRef.current = setTimeout(() => {
          onStopRef.current = "relisten";
          stop();
        }, VOICE_ACTIVITY.idleWindowMs);
      } else {
        timerRef.current = setTimeout(stop, MAX_RECORDING_MS);
      }
    },
    [clearTimer, stop, submit]
  );

  const onVoice = useCallback(
    (event: "speech-start" | "speech-end") => {
      if (recorderRef.current?.state !== "recording") return;
      if (event === "speech-start") {
        clearTimer();
        timerRef.current = setTimeout(stop, MAX_RECORDING_MS);
        setState((s) => (s.phase === "recording" ? { ...s, speaking: true } : s));
      } else {
        stop();
      }
    },
    [clearTimer, stop]
  );

  const start = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    stopSpeaking();
    setState(IDLE);

    if (!recordingSupported()) {
      fail("Dein Browser unterstützt keine Audioaufnahme. Nutze bitte eine aktuelle Version von Chrome, Safari, Edge oder Firefox.", "microphone");
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: MIC_CONSTRAINTS });
    } catch (error) {
      fail(microphoneErrorMessage(error), "microphone");
      return;
    }

    if (!mountedRef.current || !busyRef.current) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    try {
      streamRef.current = stream;
      onStopRef.current = "submit";
      if (handsFree) {
        voiceRef.current = await watchVoiceActivity(stream, onVoice);
        if (!mountedRef.current || streamRef.current !== stream) {
          voiceRef.current?.stop();
          voiceRef.current = null;
          return;
        }
        listen(stream);
        setState({ ...IDLE, phase: "recording" });
        return;
      }

      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = () => {
        void submit(chunks, recorder.mimeType);
      };

      recorderRef.current = recorder;
      startedAtRef.current = Date.now();
      recorder.start();
      setState({ ...IDLE, phase: "recording" });
      timerRef.current = setTimeout(stop, MAX_RECORDING_MS);
    } catch (error) {
      console.error("Recording failed to start:", error);
      fail("Die Aufnahme konnte nicht gestartet werden. Bitte versuche es erneut.", "technical");
    }
  }, [fail, handsFree, listen, onVoice, stop, submit]);

  /** Ends a running recording without evaluating it (e.g. the tab was hidden). */
  const cancel = useCallback(() => {
    if (processingRef.current) return;
    const recorder = recorderRef.current;
    if (recorder && recorder.state === "recording") {
      onStopRef.current = "discard";
      recorder.stop();
    }
    releaseStream();
    busyRef.current = false;
    if (mountedRef.current) setState(IDLE);
  }, [releaseStream]);

  const reset = useCallback(() => {
    if (busyRef.current) return;
    setState(IDLE);
  }, []);

  return { ...state, start, stop, cancel, reset };
}
