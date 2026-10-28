import { sleep } from "@/lib/audio/narrate";
import type { Narrator } from "@/lib/audio/narration";
import { localSpeechUrl, speechUrl, type SpeechVoice } from "@/lib/tts/player";

/** Alif's own words (e.g. "Super!") – no Arabic script: spoken in the learner's language. */
const ARABIC_SCRIPT = /[\u0600-\u06FF]/;

/** Upper limit for fetching + playing one line: a stalled request or player must not stop a flow. */
export const MAX_LINE_MS = 10_000;

/**
 * Speaks a text on the page's ONE audio element (so nothing overlaps) – in a
 * dialogue speaker's voice (the line's recording when it has one, else
 * /api/tts), or the default voice. Resolves
 * "ended" when it played to the end, "skipped" when it could not play
 * (/api/tts unreachable, muted, autoplay refused), "interrupted" when stopped.
 */
export async function speakLine(narrator: Narrator, text: string, voice: SpeechVoice | undefined, signal: AbortSignal, line?: string): Promise<"ended" | "skipped" | "interrupted"> {
  if (signal.aborted) return "interrupted";
  const onAbort = () => narrator.stop();
  signal.addEventListener("abort", onAbort);
  const cap = new AbortController();
  try {
    const playing = (async () => {
      const url = await (voice || ARABIC_SCRIPT.test(text) ? speechUrl(text, voice, line) : localSpeechUrl(text));
      if (signal.aborted || cap.signal.aborted) return "interrupted" as const;
      return narrator.playUrl(url);
    })().catch(() => "skipped" as const);
    const result = await Promise.race([playing, sleep(MAX_LINE_MS, cap.signal).then(() => (cap.signal.aborted ? ("interrupted" as const) : ("skipped" as const)))]);
    if (result === "skipped" && !signal.aborted) narrator.stop();
    return signal.aborted ? "interrupted" : result;
  } finally {
    cap.abort();
    signal.removeEventListener("abort", onAbort);
  }
}
