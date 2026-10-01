// Error codes returned by Alif's API routes, with the German message shown to
// the student. Technical details stay in the server log.

export type ApiErrorCode =
  | "invalid_request"
  | "invalid_audio"
  | "audio_too_short"
  | "audio_too_large"
  | "invalid_target"
  | "unclear_audio"
  | "service_not_configured"
  | "service_unavailable"
  | "evaluation_failed"
  | "tts_failed"
  | "internal_error";

export const API_ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  invalid_request: "Die Anfrage war unvollständig. Bitte versuche es noch einmal.",
  invalid_audio: "Die Aufnahme konnte nicht gelesen werden. Bitte nimm noch einmal auf.",
  audio_too_short: "Die Aufnahme war zu kurz. Halte den Knopf etwas länger und sprich deutlich.",
  audio_too_large: "Die Aufnahme ist zu lang. Bitte sprich nur das Wort und stoppe dann die Aufnahme.",
  invalid_target: "Diese Übung ist leider nicht verfügbar. Bitte lade die Seite neu.",
  unclear_audio: "Wir konnten dich nicht deutlich hören. Sprich etwas lauter und näher am Mikrofon.",
  service_not_configured: "Die Aussprache-Bewertung ist gerade nicht verfügbar. Bitte versuche es später noch einmal.",
  service_unavailable: "Die Aussprache-Bewertung ist vorübergehend nicht erreichbar. Bitte versuche es gleich noch einmal.",
  evaluation_failed: "Deine Aussprache konnte nicht bewertet werden. Bitte versuche es noch einmal.",
  tts_failed: "Die Aussprache konnte nicht abgespielt werden. Bitte versuche es noch einmal.",
  internal_error: "Ein vorübergehender Serverfehler ist aufgetreten. Bitte versuche es gleich noch einmal.",
};

export type ApiErrorBody = { error: string; code: ApiErrorCode };

export function apiError(code: ApiErrorCode, status: number, headers?: HeadersInit): Response {
  const body: ApiErrorBody = { error: API_ERROR_MESSAGES[code], code };
  return Response.json(body, { status, headers });
}

export function isApiErrorCode(value: unknown): value is ApiErrorCode {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(API_ERROR_MESSAGES, value);
}
