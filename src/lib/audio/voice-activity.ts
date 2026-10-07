// Hands-free recording for A0: detects when the student starts and stops
// speaking, so an attempt ends on its own instead of with a "Stopp" tap.
// The decision logic (createSpeechGate) is pure and unit-tested; the browser
// part only feeds it microphone levels.

export const VOICE_ACTIVITY = {
  /** Silence after speech that ends the attempt. */
  endSilenceMs: 700,
  /** Sound must stay above the threshold this long to count as speech (ignores clicks). */
  minSpeechMs: 120,
  /** Listening windows without speech are discarded and restarted after this long. */
  idleWindowMs: 3000,
  /** Lowest RMS level that can count as speech. */
  minLevel: 0.015,
  /** Speech must be this many times louder than the running noise floor. */
  noiseFactor: 3,
} as const;

const POLL_MS = 30;

export type SpeechEvent = "speech-start" | "speech-end" | null;

export type SpeechGateOptions = { endSilenceMs: number; minSpeechMs: number; minLevel: number; noiseFactor: number };

export function createSpeechGate(options: SpeechGateOptions = VOICE_ACTIVITY) {
  let noise = options.minLevel / options.noiseFactor;
  let loudSince: number | null = null;
  let lastVoiceAt = 0;
  let speaking = false;

  return {
    get speaking() {
      return speaking;
    },
    update(level: number, now: number): SpeechEvent {
      const loud = level >= Math.max(options.minLevel, noise * options.noiseFactor);

      if (!speaking) {
        if (!loud) {
          loudSince = null;
          noise = noise * 0.95 + level * 0.05;
          return null;
        }
        loudSince ??= now;
        if (now - loudSince < options.minSpeechMs) return null;
        speaking = true;
        lastVoiceAt = now;
        return "speech-start";
      }

      if (loud) {
        lastVoiceAt = now;
        return null;
      }
      if (now - lastVoiceAt < options.endSilenceMs) return null;
      speaking = false;
      loudSince = null;
      return "speech-end";
    },
  };
}

export type VoiceActivityWatcher = { stop: () => void };

/**
 * Watches the microphone level of `stream`. Resolves to null when the browser
 * cannot analyse audio right now (no Web Audio, or an AudioContext that stays
 * suspended because the page has not had a user gesture yet) – the caller then
 * falls back to a fixed-length recording.
 */
export async function watchVoiceActivity(
  stream: MediaStream,
  onEvent: (event: Exclude<SpeechEvent, null>) => void
): Promise<VoiceActivityWatcher | null> {
  const AudioContextConstructor =
    typeof window === "undefined"
      ? undefined
      : window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextConstructor) return null;

  let context: AudioContext;
  try {
    context = new AudioContextConstructor();
  } catch {
    return null;
  }

  if (context.state !== "running") {
    // Without a user gesture resume() never settles in some browsers.
    await Promise.race([context.resume().catch(() => undefined), new Promise((resolve) => setTimeout(resolve, 300))]);
  }
  if (context.state !== "running") {
    await context.close().catch(() => undefined);
    return null;
  }

  const source = context.createMediaStreamSource(stream);
  const analyser = context.createAnalyser();
  analyser.fftSize = 1024;
  source.connect(analyser);
  const samples = new Float32Array(analyser.fftSize);
  const gate = createSpeechGate();

  const interval = setInterval(() => {
    analyser.getFloatTimeDomainData(samples);
    let sum = 0;
    for (const sample of samples) sum += sample * sample;
    const event = gate.update(Math.sqrt(sum / samples.length), Date.now());
    if (event) onEvent(event);
  }, POLL_MS);

  return {
    stop() {
      clearInterval(interval);
      source.disconnect();
      void context.close().catch(() => undefined);
    },
  };
}
