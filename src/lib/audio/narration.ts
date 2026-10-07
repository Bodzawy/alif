// Plays pre-recorded narration files (WAV under public/). One sequence at a
// time: starting a new one interrupts whatever is playing. Files that are not
// in the `available` list are skipped without a request, so a missing file
// never shows an error or a 404 in the console.
//
// All clips go through ONE reused audio element. iOS Safari only lets a page
// play sound after a tap, and that permission belongs to the element that was
// played in the tap: unlock() (called from the tap handler) plays a short
// silence on it, so later clips can follow one another without further taps.

const MUTE_KEY = "alif:audio-muted";
const SILENCE = "data:audio/wav;base64,UklGRjQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YRAAAAAAAAAAAAAAAAAAAAAAAAAA";

/** ended – played to the end; skipped – missing, muted, blocked or broken; interrupted – a newer sound or stop(). */
export type ClipResult = "ended" | "skipped" | "interrupted";

export type Narrator = {
  /**
   * Plays the files one after another. Resolves `true` when the sequence ran
   * to the end (or there was nothing to play, or sound is muted) and `false`
   * when a newer sequence or stop() interrupted it.
   */
  play: (names: readonly string[]) => Promise<boolean>;
  /** Plays one file and tells how it went (for animations that wait for the narration). */
  playClip: (name: string) => Promise<ClipResult>;
  /** Plays any audio URL (e.g. text-to-speech) through the same element, mute and interruption rules. */
  playUrl: (url: string) => Promise<ClipResult>;
  /** Call from a tap handler: allows the following clips to play without another tap (iOS). */
  unlock: () => void;
  stop: () => void;
  has: (name: string) => boolean;
  isMuted: () => boolean;
  setMuted: (muted: boolean) => void;
};

export function readMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeMuted(muted: boolean) {
  try {
    if (muted) window.localStorage.setItem(MUTE_KEY, "1");
    else window.localStorage.removeItem(MUTE_KEY);
  } catch {
    // Storage blocked: the choice lasts for this page only.
  }
}

export function createNarrator({
  baseUrl,
  available,
  extension = "wav",
  createAudio = () => new Audio(),
}: {
  baseUrl: string;
  available: readonly string[];
  extension?: string;
  createAudio?: () => HTMLAudioElement;
}): Narrator {
  const files = new Set(available);
  let muted = typeof window === "undefined" ? false : readMuted();
  let element: HTMLAudioElement | null = null;
  let current: ((result: ClipResult) => void) | null = null;
  let generation = 0;

  const audio = () => (element ??= createAudio());

  function stopCurrent() {
    if (!current) return;
    const finish = current;
    current = null;
    audio().pause();
    finish("interrupted");
  }

  function playOne(name: string): Promise<ClipResult> {
    return playSource(`${baseUrl}/${name}.${extension}`);
  }

  function playSource(url: string): Promise<ClipResult> {
    return new Promise((resolve) => {
      const el = audio();
      let finished = false;
      const done = (result: ClipResult) => {
        if (finished) return;
        finished = true;
        el.onended = el.onerror = null;
        if (current === done) current = null;
        if (result !== "ended") el.pause();
        resolve(result);
      };
      current = done;
      el.onended = () => done("ended");
      el.onerror = () => done("skipped");
      el.src = url;
      // Autoplay refused or decoding failed: skip quietly.
      el.play()?.catch?.(() => done("skipped"));
    });
  }

  return {
    async play(names) {
      generation += 1;
      const token = generation;
      stopCurrent();
      if (muted) return true;
      for (const name of names) {
        if (!files.has(name)) continue;
        const result = await playOne(name);
        if (token !== generation || result === "interrupted") return false;
      }
      return token === generation;
    },
    async playClip(name) {
      generation += 1;
      stopCurrent();
      if (muted || !files.has(name)) return "skipped";
      return playOne(name);
    },
    async playUrl(url) {
      generation += 1;
      stopCurrent();
      if (muted) return "skipped";
      return playSource(url);
    },
    unlock() {
      const el = audio();
      if (current) return; // already playing: the element is unlocked
      el.src = SILENCE;
      el.play()?.catch?.(() => undefined);
    },
    stop() {
      generation += 1;
      stopCurrent();
    },
    has: (name) => files.has(name),
    isMuted: () => muted,
    setMuted(value) {
      muted = value;
      writeMuted(value);
      if (value) {
        generation += 1;
        stopCurrent();
      }
    },
  };
}
