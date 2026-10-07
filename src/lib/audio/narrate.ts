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
