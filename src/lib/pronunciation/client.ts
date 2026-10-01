import { API_ERROR_MESSAGES, isApiErrorCode } from "./errors";
import { NO_MATCHING_RULE, type PronunciationResponse } from "./types";

// Browser-side access to Alif's /api/pronunciation and the mapping of its
// answer to what the student sees.

export const REQUEST_TIMEOUT_MS = 30_000;

export class PronunciationRequestError extends Error {
  constructor(message: string, readonly status: number | null) {
    super(message);
    this.name = "PronunciationRequestError";
  }
}

export function messageForFailedResponse(status: number, body: unknown): string {
  const code = (body as { code?: unknown } | null)?.code;
  if (status === 429) return "Zu viele Versuche in kurzer Zeit. Bitte warte einen Moment.";
  if (isApiErrorCode(code)) return API_ERROR_MESSAGES[code];
  if (status === 413) return API_ERROR_MESSAGES.audio_too_large;
  if (status === 422) return API_ERROR_MESSAGES.unclear_audio;
  if (status >= 500) return API_ERROR_MESSAGES.service_unavailable;
  return API_ERROR_MESSAGES.evaluation_failed;
}

export async function submitRecording(
  wav: Blob,
  target: string,
  { signal, fetchImpl = fetch }: { signal?: AbortSignal; fetchImpl?: typeof fetch } = {}
): Promise<PronunciationResponse> {
  const form = new FormData();
  form.append("audio", wav, "voice.wav");
  form.append("target", target);

  let response: Response;
  try {
    response = await fetchImpl("/api/pronunciation", { method: "POST", body: form, signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new PronunciationRequestError("Die Bewertung hat zu lange gedauert. Bitte versuche es noch einmal.", null);
    }
    throw new PronunciationRequestError(
      "Die Aufnahme konnte nicht gesendet werden. Prüfe deine Internetverbindung und versuche es erneut.",
      null
    );
  }

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok || !body || typeof body !== "object") {
    throw new PronunciationRequestError(messageForFailedResponse(response.status, body), response.status);
  }

  return body as PronunciationResponse;
}

export type FeedbackTone = "success" | "retry" | "neutral";

export type StudentFeedback = {
  passed: boolean;
  tone: FeedbackTone;
  /** German headline. */
  headline: string;
  /** German tip on what to do next. */
  tip: string;
  /** Original Arabic feedback message of the matched condition rule. */
  ruleMessage: string;
  rule: string;
  /** Azure accuracy (0–100). */
  accuracy: number | null;
};

// German explanations for the rule names used in the condition files. The
// Arabic rule message itself is always shown unchanged.
function germanTip(rule: string, passed: boolean): string {
  if (passed) return "Genau so klingt es. Weiter so!";
  if (rule === NO_MATCHING_RULE) {
    return "Deine Aussprache konnte diesmal nicht eindeutig zugeordnet werden. Hör dir das Beispiel an und sprich noch einmal deutlich nach.";
  }
  if (rule.startsWith("said_")) {
    return "Das klang nach einem anderen Laut. Hör genau hin, worin sich die Laute unterscheiden, und versuche es erneut.";
  }
  if (rule.includes("tafkh") || rule.includes("tafkheem")) {
    return "Achte auf die Klangfarbe: Manche Laute werden „dunkel“ (betont), andere „hell“ gesprochen.";
  }
  return "Fast! Hör dir das Beispiel noch einmal an und sprich langsam und deutlich nach.";
}

export function toStudentFeedback(response: PronunciationResponse): StudentFeedback {
  const evaluation = response.conditionEvaluation;
  const rule = evaluation?.matchedRule ?? response.feedback?.rule ?? NO_MATCHING_RULE;
  const passed = response.passed === true;
  const tone: FeedbackTone = passed ? "success" : rule === NO_MATCHING_RULE ? "neutral" : "retry";

  return {
    passed,
    tone,
    headline: passed ? "Ausgezeichnet!" : tone === "neutral" ? "Nicht eindeutig" : "Fast geschafft",
    tip: germanTip(rule, passed),
    ruleMessage: (evaluation?.message ?? response.feedback?.message ?? "").trim(),
    rule,
    accuracy: evaluation?.azureAccuracy ?? response.scores?.accuracy ?? null,
  };
}
