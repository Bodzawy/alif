import type { Narrator } from "./narration";

// Waits for a narration clip – or, when it cannot play (missing file, muted,
// blocked, cut off by another sound), for `fallbackMs` instead, so a flow that
// waits for narration never gets stuck. A cap protects against clips that
// never report their end. Cancelled through `signal` (stops the clip).

const MAX_CLIP_MS = 20_000;

export function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (signal.aborted || ms <= 0) return resolve();
    const timer = setTimeout(done, ms);
    function done() {
      clearTimeout(timer);
      signal.removeEventListener("abort", done);
      resolve();
    }
    signal.addEventListener("abort", done);
  });
}

export async function narrateWithFallback(narrator: Narrator, name: string, fallbackMs: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) return;
  const started = Date.now();
  let pending = true;
  const onAbort = () => pending && narrator.stop();
  signal.addEventListener("abort", onAbort);
  const result = await Promise.race([narrator.playClip(name), sleep(MAX_CLIP_MS, signal).then(() => "ended" as const)]);
  pending = false;
  signal.removeEventListener("abort", onAbort);
  if (signal.aborted || result === "ended") return;
  await sleep(fallbackMs - (Date.now() - started), signal);
}

/**
 * A word: its recording when there is one (narrator.has), otherwise the model
 * pronunciation of `text` from /api/tts – through the same audio element. If
 * neither can play, waits `fallbackMs` like a missing clip.
 */
export async function sayWithFallback(
  narrator: Narrator,
  word: { audio?: string; text: string },
  fallbackMs: number,
  signal: AbortSignal,
  speech: (text: string) => Promise<string>
): Promise<void> {
  if (signal.aborted) return;
  if (word.audio && narrator.has(word.audio)) return narrateWithFallback(narrator, word.audio, fallbackMs, signal);
  const started = Date.now();
  const onAbort = () => narrator.stop();
  signal.addEventListener("abort", onAbort);
  try {
    const url = await speech(word.text);
    if (!signal.aborted) {
      const result = await Promise.race([narrator.playUrl(url), sleep(MAX_CLIP_MS, signal).then(() => "ended" as const)]);
      if (result === "ended") return;
    }
  } catch {
    // /api/tts unavailable: like a missing recording.
  } finally {
    signal.removeEventListener("abort", onAbort);
  }
  await sleep(fallbackMs - (Date.now() - started), signal);
}
