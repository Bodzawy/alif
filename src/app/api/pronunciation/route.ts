import { MAX_UPLOAD_BYTES, MIN_AUDIO_MS, readWavHeader } from "@/lib/audio/wav-header";
import { buildAssessment, hasUsableAzureScores } from "@/lib/pronunciation/assessment";
import { ruleDecidedWithoutIqra } from "@/lib/pronunciation/condition-engine";
import { azureConfig, iqraUrl } from "@/lib/pronunciation/config";
import { apiError } from "@/lib/pronunciation/errors";
import { AzureSpeechError, assessWithAzure } from "@/lib/pronunciation/services/azure";
import { assessIqra } from "@/lib/pronunciation/services/models";
import { isAllowedTarget } from "@/lib/pronunciation/targets";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { DEFAULT_TRACK, isTrack } from "@/lib/track";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const rateLimit = createRateLimiter({ limit: 30, windowMs: 60_000 });

/** How long each service took, in ms, for the server log (null: not called / not configured). */
type Timings = { azureMs: number | null; iqraMs: number | null };

/** Resolves like `promise` and writes its duration (also on failure) through `done`. */
async function timed<T>(promise: Promise<T>, done: (ms: number) => void): Promise<T> {
  const start = Date.now();
  try {
    return await promise;
  } finally {
    done(Date.now() - start);
  }
}

/** Length of the recording before the browser cut the silence (sent by submitRecording); log only. */
function recordedMs(value: FormDataEntryValue | null): number | null {
  const ms = typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(ms) && ms >= 0 && ms <= 600_000 ? Math.round(ms) : null;
}

// Browser → Alif → (Azure ‖ IQRA) → condition engine → feedback.
// IQRA is not waited for when Azure alone already decides the rule.
// ALIF Speaking (form field track=speaking): Azure only, IQRA is not called.
export async function POST(request: Request) {
  const startedAt = Date.now();
  /** Cancels the IQRA request once its answer is no longer needed. */
  const iqraCancel = new AbortController();

  try {
    const limited = rateLimit(clientKey(request));
    if (!limited.allowed) {
      return Response.json(
        { error: "Zu viele Versuche in kurzer Zeit. Bitte warte einen Moment.", code: "service_unavailable" },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
      );
    }

    const azure = azureConfig();
    if (!azure) {
      console.error("PRONUNCIATION: AZURE_SPEECH_KEY / AZURE_SPEECH_REGION are not configured.");
      return apiError("service_not_configured", 503);
    }

    const declaredLength = Number(request.headers.get("content-length") ?? 0);
    if (declaredLength > MAX_UPLOAD_BYTES + 64 * 1024) {
      return apiError("audio_too_large", 413);
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return apiError("invalid_request", 400);
    }

    const audio = formData.get("audio");
    const target = formData.get("target");
    const trackField = formData.get("track");
    const track = isTrack(trackField) ? trackField : DEFAULT_TRACK;

    if (!audio || typeof audio === "string") {
      return apiError("invalid_audio", 400);
    }
    if (!isAllowedTarget(target)) {
      return apiError("invalid_target", 400);
    }
    if (audio.size > MAX_UPLOAD_BYTES) {
      return apiError("audio_too_large", 413);
    }

    const audioBuffer = Buffer.from(await audio.arrayBuffer());
    const wav = readWavHeader(audioBuffer);
    if (!wav) {
      console.warn("PRONUNCIATION: rejected upload that is not a RIFF/WAVE file.", { size: audio.size });
      return apiError("invalid_audio", 400);
    }
    if (wav.durationMs < MIN_AUDIO_MS) {
      return apiError("audio_too_short", 400);
    }

    const audioLog = { durationMs: wav.durationMs, recordedMs: recordedMs(formData.get("recordedMs")) };

    // Both evaluations start in parallel. IQRA is best effort (null on
    // failure); Azure is required. Each one is timed for the log.
    const timings: Timings = { azureMs: null, iqraMs: null };
    const iqraPending =
      track === "speaking"
        ? Promise.resolve(null)
        : iqraUrl()
          ? timed(assessIqra(audioBuffer, iqraCancel.signal), (ms) => (timings.iqraMs = ms))
          : assessIqra(audioBuffer, iqraCancel.signal);
    let primary;
    try {
      primary = await timed(assessWithAzure(audioBuffer, target, azure), (ms) => (timings.azureMs = ms));
    } catch (error) {
      if (error instanceof AzureSpeechError) {
        console.error("AZURE SPEECH ERROR:", { kind: error.kind, message: error.message, details: error.details, audio: audioLog, timings });
        return apiError("service_unavailable", error.kind === "timeout" ? 504 : 502);
      }
      throw error;
    }

    if (!hasUsableAzureScores(primary)) {
      console.info("PRONUNCIATION: Azure recognised no speech.", { target, ...audioLog, timings, tookMs: Date.now() - startedAt });
      return apiError("unclear_audio", 422);
    }

    // When Azure alone already decides the rule (e.g. accuracy below the 70 that
    // every passing rule needs), IQRA cannot change the answer: answer now
    // instead of waiting for it. The result is the same; only details.iqra is
    // null and conditionEvaluation.iqraPhonemes empty.
    const decidedWithoutIqra = track === "speaking" || ruleDecidedWithoutIqra({ target, azureAccuracy: primary.accuracy, azureRecognized: primary.recognized }) !== null;
    const iqra = decidedWithoutIqra ? null : await iqraPending;
    const assessment = buildAssessment({ target, primary, iqra, track });

    console.log("ARABIC PRONUNCIATION ASSESSMENT:", {
      target,
      track,
      audio: { ...audioLog, sampleRate: wav.sampleRate, channels: wav.channels },
      services: {
        azure: true,
        iqra: track === "speaking" ? "not used" : !iqraUrl() ? "not configured" : decidedWithoutIqra ? "not needed" : iqra !== null,
      },
      azureAccuracy: primary.accuracy,
      azureRecognized: primary.recognized,
      firstSound: primary.firstSoundScore,
      targetScore: assessment.discrimination.targetScore,
      iqraPhonemes: assessment.conditionEvaluation.iqraPhonemes,
      matchedRule: assessment.conditionEvaluation.matchedRule,
      passed: assessment.passed,
      failureReason: assessment.failureReason,
      timings,
      tookMs: Date.now() - startedAt,
    });

    return Response.json(assessment, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("PRONUNCIATION API ERROR:", error);
    return apiError("internal_error", 500);
  } finally {
    iqraCancel.abort();
  }
}
