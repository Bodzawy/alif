import { MAX_UPLOAD_BYTES, MIN_AUDIO_MS, readWavHeader } from "@/lib/audio/wav-header";
import { buildAssessment, hasUsableAzureScores } from "@/lib/pronunciation/assessment";
import { azureConfig, iqraUrl, masaarUrl } from "@/lib/pronunciation/config";
import { apiError } from "@/lib/pronunciation/errors";
import { AzureSpeechError, assessWithAzure } from "@/lib/pronunciation/services/azure";
import { assessIqra, assessMasaar } from "@/lib/pronunciation/services/models";
import { isAllowedTarget } from "@/lib/pronunciation/targets";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const rateLimit = createRateLimiter({ limit: 30, windowMs: 60_000 });

// Browser → Alif → (Azure ‖ MASAAR ‖ IQRA) → condition engine → feedback.
export async function POST(request: Request) {
  const startedAt = Date.now();

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

    // All three evaluations run in parallel. MASAAR and IQRA are best effort
    // (null on failure); Azure is required.
    let masaar, iqra, primary;
    try {
      [masaar, iqra, primary] = await Promise.all([
        assessMasaar(audioBuffer),
        assessIqra(audioBuffer),
        assessWithAzure(audioBuffer, target, azure),
      ]);
    } catch (error) {
      if (error instanceof AzureSpeechError) {
        console.error("AZURE SPEECH ERROR:", { kind: error.kind, message: error.message, details: error.details });
        return apiError("service_unavailable", error.kind === "timeout" ? 504 : 502);
      }
      throw error;
    }

    if (!hasUsableAzureScores(primary)) {
      console.info("PRONUNCIATION: Azure recognised no speech.", { target, durationMs: wav.durationMs });
      return apiError("unclear_audio", 422);
    }

    const assessment = buildAssessment({ target, primary, masaar, iqra });

    console.log("ARABIC PRONUNCIATION ASSESSMENT:", {
      target,
      audio: { durationMs: wav.durationMs, sampleRate: wav.sampleRate, channels: wav.channels },
      services: {
        azure: true,
        masaar: masaarUrl() ? masaar !== null : "not configured",
        iqra: iqraUrl() ? iqra !== null : "not configured",
      },
      azureAccuracy: primary.accuracy,
      azureRecognized: primary.recognized,
      firstSound: primary.firstSoundScore,
      targetScore: assessment.discrimination.targetScore,
      masaar,
      iqraPhonemes: assessment.conditionEvaluation.iqraPhonemes,
      matchedRule: assessment.conditionEvaluation.matchedRule,
      passed: assessment.passed,
      failureReason: assessment.failureReason,
      tookMs: Date.now() - startedAt,
    });

    return Response.json(assessment, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("PRONUNCIATION API ERROR:", error);
    return apiError("internal_error", 500);
  }
}
