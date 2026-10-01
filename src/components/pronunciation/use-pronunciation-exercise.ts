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

export type ExercisePhase = "idle" | "recording" | "processing" | "result" | "error";

export type ExerciseState = {
  phase: ExercisePhase;
  feedback: StudentFeedback | null;
  error: string | null;
};

export function usePronunciationExercise({
  target,
  onResult,
}: {
  target: string;
  onResult?: (feedback: StudentFeedback) => void;
}) {
  const [state, setState] = useState<ExerciseState>({ phase: "idle", feedback: null, error: null });

  const busyRef = useRef(false);
  const mountedRef = useRef(true);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const startedAtRef = useRef(0);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  const releaseStream = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

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
    (message: string) => {
      releaseStream();
      busyRef.current = false;
      if (!mountedRef.current) return;
      setState({ phase: "error", feedback: null, error: message });
    },
    [releaseStream]
  );

  const submit = useCallback(
    async (chunks: Blob[], mimeType: string) => {
      releaseStream();
      if (!mountedRef.current) return;
      setState({ phase: "processing", feedback: null, error: null });

      const duration = Date.now() - startedAtRef.current;
      if (chunks.length === 0 || duration < MIN_RECORDING_MS) {
        fail("Die Aufnahme war zu kurz. Tippe auf das Mikrofon, sprich deutlich und tippe dann auf Stopp.");
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
          fail("Die Aufnahme konnte nicht verarbeitet werden. Bitte nimm noch einmal auf.");
          return;
        }

        const response = await submitRecording(wav, target, { signal: controller.signal });
        const feedback = toStudentFeedback(response);

        busyRef.current = false;
        if (!mountedRef.current) return;
        setState({ phase: "result", feedback, error: null });
        onResultRef.current?.(feedback);
      } catch (error) {
        if (error instanceof PronunciationRequestError) {
          fail(error.message);
        } else {
          console.error("Pronunciation evaluation failed:", error);
          fail("Deine Aussprache konnte nicht bewertet werden. Bitte versuche es noch einmal.");
        }
      } finally {
        clearTimeout(timeout);
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [fail, releaseStream, target]
  );

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const recorder = recorderRef.current;
    if (recorder && recorder.state === "recording") recorder.stop();
  }, []);

  const start = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    stopSpeaking();
    setState({ phase: "idle", feedback: null, error: null });

    if (!recordingSupported()) {
      fail("Dein Browser unterstützt keine Audioaufnahme. Nutze bitte eine aktuelle Version von Chrome, Safari, Edge oder Firefox.");
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: MIC_CONSTRAINTS });
    } catch (error) {
      fail(microphoneErrorMessage(error));
      return;
    }

    if (!mountedRef.current) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    try {
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = () => {
        void submit(chunks, recorder.mimeType);
      };

      recorderRef.current = recorder;
      streamRef.current = stream;
      startedAtRef.current = Date.now();
      recorder.start();
      setState({ phase: "recording", feedback: null, error: null });
      timerRef.current = setTimeout(stop, MAX_RECORDING_MS);
    } catch (error) {
      console.error("Recording failed to start:", error);
      stream.getTracks().forEach((track) => track.stop());
      fail("Die Aufnahme konnte nicht gestartet werden. Bitte versuche es erneut.");
    }
  }, [fail, stop, submit]);

  const reset = useCallback(() => {
    if (busyRef.current) return;
    setState({ phase: "idle", feedback: null, error: null });
  }, []);

  return { ...state, start, stop, reset };
}
