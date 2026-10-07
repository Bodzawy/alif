import { blobTo16KhzMonoWav } from "@/lib/audio/wav";
import type { Utterance } from "@/lib/audio/guided-mic";
import { PronunciationRequestError, REQUEST_TIMEOUT_MS, submitRecording, toStudentFeedback } from "@/lib/pronunciation/client";

/** right: passed (the rule that shows "مُمْتَاز" today); wrong: not passed or not understood; error: network / server. */
export type Verdict = "right" | "wrong" | "error" | "aborted";

// The same evaluation as the "Aufnehmen" button: 16 kHz mono WAV →
// POST /api/pronunciation → `passed`. Nothing about the rules changes here.
export async function evaluateUtterance(utterance: Extract<Utterance, { kind: "speech" }>, target: string, signal: AbortSignal): Promise<Verdict> {
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  signal.addEventListener("abort", onAbort);
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const wav = await blobTo16KhzMonoWav(utterance.blob);
    const response = await submitRecording(wav, target, { signal: controller.signal });
    return toStudentFeedback(response).passed ? "right" : "wrong";
  } catch (error) {
    if (signal.aborted) return "aborted";
    if (error instanceof PronunciationRequestError) {
      // Not understood / too short: counts like a wrong answer. Network, timeout, 5xx, rate limit: a service error.
      if (error.status === null || error.status >= 500 || error.status === 429) return "error";
      return "wrong";
    }
    return "error";
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener("abort", onAbort);
  }
}
