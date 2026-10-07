// The short success chime of the handwriting page (three sine tones, as in
// the prototype docs/reference/alif-uebung1.html). Synthesised, so no audio
// file is needed. Respects the app's mute setting (src/lib/audio/narration.ts).

import { readMuted } from "./narration";

let context: AudioContext | null = null;

/** Call from a tap / pointer handler: browsers only start audio after a gesture. */
export function unlockChime() {
  try {
    const Ctor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    context ??= new Ctor();
    if (context.state === "suspended") void context.resume();
  } catch {
    // No audio: the page works without the chime.
  }
}

export function playChime() {
  if (!context || readMuted()) return;
  const t = context.currentTime;
  [660, 880, 1175].forEach((frequency, i) => {
    const oscillator = context!.createOscillator();
    const gain = context!.createGain();
    const start = t + i * 0.11;
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
    oscillator.connect(gain).connect(context!.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.4);
  });
}
