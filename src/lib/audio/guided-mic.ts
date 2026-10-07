// Microphone for the guided mode of A1 · Schritt 2: opened ONCE on the start
// tap (browsers allow it only after a gesture), then one utterance at a time is
// recorded and cut by simple voice detection (RMS level from an AnalyserNode,
// the existing speech gate of voice-activity.ts).

import { recordingSupported } from "./recording";
import { createSpeechGate } from "./voice-activity";

/** As requested for guided mode. (The button mode keeps MIC_CONSTRAINTS from recording.ts: unprocessed audio.) */
export const GUIDED_MIC_CONSTRAINTS: MediaTrackConstraints = { echoCancellation: true, noiseSuppression: true, autoGainControl: true };

/** Voice detection – to be tuned on real children's voices. */
export const GUIDED_VAD = {
  /** Stop this long after the child stopped speaking. */
  endSilenceMs: 1000,
  /** Stop at the latest this long after speech started. */
  maxSpeechMs: 4000,
  /** No speech within this time: "no answer" (the evaluation is not called). */
  noSpeechMs: 5000,
  /** Sound must stay above the threshold this long to count as speech (ignores clicks). */
  minSpeechMs: 120,
  /** Lowest RMS level that can count as speech … */
  minLevel: 0.015,
  /** … and it must be this many times louder than the running noise floor. */
  noiseFactor: 3,
  /** How often the level is read. */
  pollMs: 30,
} as const;

export type Utterance = { kind: "speech"; blob: Blob; mimeType: string } | { kind: "silence" };

export type GuidedMic = {
  /** Records one utterance; resolves null when cancelled through `signal`. */
  record: (signal: AbortSignal) => Promise<Utterance | null>;
  /** Stops the tracks (the browser's microphone indicator turns off) and closes the audio context. */
  release: () => void;
};

export class MicUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MicUnavailableError";
  }
}

/** Call from the tap handler. Throws MicUnavailableError when the microphone is denied, missing or unsupported. */
export async function openGuidedMic(): Promise<GuidedMic> {
  const AudioContextCtor =
    typeof window === "undefined" ? undefined : window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!recordingSupported() || !AudioContextCtor) throw new MicUnavailableError("unsupported");
  // Created inside the gesture, so it may start running.
  const context = new AudioContextCtor();
  void context.resume().catch(() => undefined);
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: GUIDED_MIC_CONSTRAINTS });
  } catch (error) {
    void context.close().catch(() => undefined);
    throw new MicUnavailableError(error instanceof Error ? error.name : "denied");
  }
  const source = context.createMediaStreamSource(stream);
  const analyser = context.createAnalyser();
  analyser.fftSize = 1024;
  source.connect(analyser);
  const samples = new Float32Array(analyser.fftSize);
  let released = false;

  const level = () => {
    analyser.getFloatTimeDomainData(samples);
    let sum = 0;
    for (const sample of samples) sum += sample * sample;
    return Math.sqrt(sum / samples.length);
  };

  return {
    record(signal) {
      return new Promise((resolve) => {
        if (released || signal.aborted) return resolve(null);
        const recorder = new MediaRecorder(stream);
        const chunks: Blob[] = [];
        const gate = createSpeechGate({ endSilenceMs: GUIDED_VAD.endSilenceMs, minSpeechMs: GUIDED_VAD.minSpeechMs, minLevel: GUIDED_VAD.minLevel, noiseFactor: GUIDED_VAD.noiseFactor });
        let outcome: "speech" | "silence" | "aborted" | null = null;
        let maxTimer: ReturnType<typeof setTimeout> | null = null;
        const noSpeechTimer = setTimeout(() => finish("silence"), GUIDED_VAD.noSpeechMs);
        const poll = setInterval(() => {
          const event = gate.update(level(), Date.now());
          if (event === "speech-start") {
            clearTimeout(noSpeechTimer);
            maxTimer = setTimeout(() => finish("speech"), GUIDED_VAD.maxSpeechMs);
          } else if (event === "speech-end") finish("speech");
        }, GUIDED_VAD.pollMs);
        const onAbort = () => finish("aborted");
        signal.addEventListener("abort", onAbort);

        function finish(kind: "speech" | "silence" | "aborted") {
          if (outcome) return;
          outcome = kind;
          clearTimeout(noSpeechTimer);
          if (maxTimer) clearTimeout(maxTimer);
          clearInterval(poll);
          signal.removeEventListener("abort", onAbort);
          if (recorder.state === "recording") recorder.stop();
          else settle();
        }
        function settle() {
          if (outcome === "speech" && chunks.length > 0) resolve({ kind: "speech", blob: new Blob(chunks, { type: recorder.mimeType || "audio/webm" }), mimeType: recorder.mimeType });
          else if (outcome === "aborted") resolve(null);
          else resolve({ kind: "silence" });
        }
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        };
        recorder.onstop = settle;
        recorder.start();
      });
    },
    release() {
      if (released) return;
      released = true;
      stream.getTracks().forEach((track) => track.stop());
      source.disconnect();
      void context.close().catch(() => undefined);
    },
  };
}
