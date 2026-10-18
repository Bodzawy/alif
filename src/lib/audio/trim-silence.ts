// Cuts the silence before and after the speech of a recording, before it is
// sent for evaluation. Azure and IQRA take about one second per second of
// audio (production logs: 1 s → 1.6 s, 3 s → 3.1 s), and a recording of one
// letter is mostly silence: the moment before the student starts and the
// pause that ends the recording.
//
// Only whole samples are dropped at both ends; the kept part is the original
// audio, unchanged (no gain, no filtering, no resampling). The loud core of the
// speech is found first; its edges are then extended as long as the sound
// stays clearly above the background (quiet consonants such as ف ث ه ح or a
// hamza can be long), and padMs more is kept on each side. When no speech is
// found, the recording is sent unchanged and the server decides as before.

export const TRIM_SILENCE = {
  /**
   * Audio kept before the first and after the last speech frame. Measured with
   * the real services (Oct 2026, 6 letters × 5): with 200 ms IQRA cut the edges
   * (عين heard as "E", 0/5 instead of 5/5); with 350 and 500 ms every letter
   * passed as often as untrimmed. 500 ms was the safe margin; 350 ms (the
   * shortest value that passed every letter) sends 0.3 s less audio, which
   * Azure and IQRA each answer about 0.3 s sooner.
   */
  padMs: 350,
  /** Analysis frame. */
  frameMs: 10,
  /** Speech must stay above the threshold this long; shorter bursts (a click, the tap on "Stopp") are ignored. */
  minSpeechMs: 50,
  /** Lowest RMS level that can count as speech … */
  minLevel: 0.008,
  /** … and it must be this many times louder than the noise floor. */
  noiseFactor: 3,
  /** Noise floor: this percentile of the frame levels. */
  floorPercentile: 0.1,
  /** The edges of the speech extend while the level stays this many times above the noise floor … */
  edgeFactor: 1.5,
  /** … and above this level (quiet room: the floor is almost 0). */
  edgeMinLevel: 0.002,
  /** A quieter gap this short does not end the speech (the closure before a final ق ت ب ك or ف). */
  maxGapMs: 120,
} as const;

export type TrimResult = {
  samples: Float32Array;
  /** Kept range in the original recording, in ms. */
  startMs: number;
  endMs: number;
  originalMs: number;
  trimmed: boolean;
};

export function trimSilence(samples: Float32Array, sampleRate: number, options: Partial<typeof TRIM_SILENCE> = {}): TrimResult {
  const o = { ...TRIM_SILENCE, ...options };
  const originalMs = (samples.length / sampleRate) * 1000;
  const unchanged: TrimResult = { samples, startMs: 0, endMs: originalMs, originalMs, trimmed: false };

  const frameLength = Math.max(1, Math.round((sampleRate * o.frameMs) / 1000));
  const frameCount = Math.floor(samples.length / frameLength);
  if (frameCount < 3) return unchanged;

  const levels = new Float32Array(frameCount);
  for (let f = 0; f < frameCount; f++) {
    let sum = 0;
    for (let i = f * frameLength; i < (f + 1) * frameLength; i++) sum += samples[i]! * samples[i]!;
    levels[f] = Math.sqrt(sum / frameLength);
  }

  const sorted = Float32Array.from(levels).sort();
  const floor = sorted[Math.floor((sorted.length - 1) * o.floorPercentile)]!;
  const threshold = Math.max(o.minLevel, floor * o.noiseFactor);
  const run = Math.max(1, Math.ceil(o.minSpeechMs / o.frameMs));

  // First frame of the first run of `run` loud frames, last frame of the last run.
  let first = -1;
  for (let f = 0, count = 0; f < frameCount; f++) {
    count = levels[f]! >= threshold ? count + 1 : 0;
    if (count === run) {
      first = f - run + 1;
      break;
    }
  }
  if (first < 0) return unchanged;

  let last = -1;
  for (let f = frameCount - 1, count = 0; f >= 0; f--) {
    count = levels[f]! >= threshold ? count + 1 : 0;
    if (count === run) {
      last = f + run - 1;
      break;
    }
  }

  // Quiet edges of the speech (a soft consonant before or after the loud
  // vowel), across short gaps.
  const edge = Math.max(o.edgeMinLevel, floor * o.edgeFactor);
  const maxGap = Math.round(o.maxGapMs / o.frameMs);
  const extend = (from: number, step: 1 | -1) => {
    let edgeFrame = from;
    for (let f = from + step, gap = 0; f >= 0 && f < frameCount; f += step) {
      if (levels[f]! >= edge) {
        edgeFrame = f;
        gap = 0;
      } else if (++gap > maxGap) break;
    }
    return edgeFrame;
  };
  first = extend(first, -1);
  last = extend(last, 1);

  const pad = Math.round((sampleRate * o.padMs) / 1000);
  const start = Math.max(0, first * frameLength - pad);
  const end = Math.min(samples.length, (last + 1) * frameLength + pad);
  if (start === 0 && end === samples.length) return unchanged;

  return {
    samples: samples.subarray(start, end),
    startMs: (start / sampleRate) * 1000,
    endMs: (end / sampleRate) * 1000,
    originalMs,
    trimmed: true,
  };
}
