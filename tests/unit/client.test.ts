import { describe, expect, it, vi } from "vitest";

import { API_ERROR_MESSAGES } from "@/lib/pronunciation/errors";
import { messageForFailedResponse, PronunciationRequestError, submitRecording, toStudentFeedback } from "@/lib/pronunciation/client";
import type { PronunciationResponse } from "@/lib/pronunciation/types";

function response(overrides: Partial<PronunciationResponse> & { rule?: string; message?: string } = {}): PronunciationResponse {
  const { rule = "excellent", message = "ممتاز 👏 نطقت حرف الألف بشكل صحيح", ...rest } = overrides;
  return {
    target: "ألف",
    recognized: "ألف",
    passed: rule === "excellent",
    failureReason: null,
    scores: { accuracy: 82, pronunciation: 80, fluency: 82, completeness: 100 },
    feedback: { rule, message },
    details: { masaar: null, azure: { recognized: "ألف", accuracy: 82 }, iqra: null },
    conditionEvaluation: { target: "ألف", azureAccuracy: 82, azureRecognized: "ألف", iqraPhonemes: [], matchedRule: rule, message, conditions: [] },
    discrimination: { targetScore: 82, firstSoundScore: null, closestAlternative: null, alternativeScore: null, margin: null },
    words: [],
    ...rest,
  };
}

describe("toStudentFeedback", () => {
  it("maps a pass to a German success headline and keeps the Arabic rule message", () => {
    const feedback = toStudentFeedback(response());
    expect(feedback).toMatchObject({ passed: true, tone: "success", headline: "Ausgezeichnet!", accuracy: 82, rule: "excellent" });
    expect(feedback.ruleMessage).toBe("ممتاز 👏 نطقت حرف الألف بشكل صحيح");
  });

  it("maps matched non-excellent rules to retry and missing rules to neutral", () => {
    expect(toStudentFeedback(response({ rule: "said_sin", message: "x", passed: false })).tone).toBe("retry");
    expect(toStudentFeedback(response({ rule: "said_sin", message: "x", passed: false })).tip).toMatch(/anderen Laut/);
    expect(toStudentFeedback(response({ rule: "no_matching_rule", message: "y", passed: false })).tone).toBe("neutral");
  });

  it("trims the rule message (some original messages start with a space)", () => {
    expect(toStudentFeedback(response({ rule: "correct_letter_needs_improvement", message: " حاول تحسين طريقة النطق", passed: false })).ruleMessage).toBe(
      "حاول تحسين طريقة النطق"
    );
  });
});

describe("error messages", () => {
  it("uses the API error code when present", () => {
    expect(messageForFailedResponse(503, { code: "service_not_configured" })).toBe(API_ERROR_MESSAGES.service_not_configured);
    expect(messageForFailedResponse(422, { code: "unclear_audio" })).toBe(API_ERROR_MESSAGES.unclear_audio);
  });

  it("falls back by status – never a bare 'Error'", () => {
    expect(messageForFailedResponse(502, null)).toBe(API_ERROR_MESSAGES.service_unavailable);
    expect(messageForFailedResponse(413, null)).toBe(API_ERROR_MESSAGES.audio_too_large);
    expect(messageForFailedResponse(429, null)).toMatch(/Zu viele Versuche/);
    expect(messageForFailedResponse(400, { code: "nonsense" })).toBe(API_ERROR_MESSAGES.evaluation_failed);
  });
});

describe("submitRecording", () => {
  it("posts the WAV as 'audio' (voice.wav) with the target", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(response()), { status: 200 }));
    const result = await submitRecording(new Blob(["RIFF"], { type: "audio/wav" }), "ألف", { fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(result.passed).toBe(true);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/api/pronunciation");
    const body = init.body as FormData;
    expect(body.get("target")).toBe("ألف");
    expect((body.get("audio") as File).name).toBe("voice.wav");
  });

  it("turns HTTP errors and network failures into German messages", async () => {
    const failing = vi.fn(async () => new Response(JSON.stringify({ code: "unclear_audio" }), { status: 422 }));
    await expect(submitRecording(new Blob(), "ألف", { fetchImpl: failing as unknown as typeof fetch })).rejects.toThrow(API_ERROR_MESSAGES.unclear_audio);

    const offline = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });
    const error = await submitRecording(new Blob(), "ألف", { fetchImpl: offline as unknown as typeof fetch }).catch((e) => e);
    expect(error).toBeInstanceOf(PronunciationRequestError);
    expect(error.message).toMatch(/Internetverbindung/);
  });
});
