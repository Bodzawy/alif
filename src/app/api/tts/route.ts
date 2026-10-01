import { azureConfig } from "@/lib/pronunciation/config";
import { apiError } from "@/lib/pronunciation/errors";
import { isAllowedTtsText } from "@/lib/pronunciation/targets";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { TTS_OUTPUT_FORMAT, buildSsml } from "@/lib/tts/ssml";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TTS_TIMEOUT_MS = 15_000;

const rateLimit = createRateLimiter({ limit: 60, windowMs: 60_000 });

export async function POST(request: Request) {
  try {
    const limited = rateLimit(clientKey(request));
    if (!limited.allowed) {
      return apiError("service_unavailable", 429, { "Retry-After": String(limited.retryAfterSeconds) });
    }

    const azure = azureConfig();
    if (!azure) {
      console.error("TTS: AZURE_SPEECH_KEY / AZURE_SPEECH_REGION are not configured.");
      return apiError("service_not_configured", 503);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("invalid_request", 400);
    }

    const rawText = (body as { text?: unknown } | null)?.text;
    const text = typeof rawText === "string" ? rawText.trim() : "";
    if (!text) {
      return apiError("invalid_request", 400);
    }
    if (!isAllowedTtsText(text)) {
      return apiError("invalid_target", 400);
    }

    const response = await fetch(`https://${azure.region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": azure.key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": TTS_OUTPUT_FORMAT,
        "User-Agent": "Alif",
      },
      body: buildSsml(text),
      signal: AbortSignal.timeout(TTS_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("AZURE TTS ERROR:", response.status, await response.text().catch(() => ""));
      return apiError("tts_failed", 502);
    }

    const audio = await response.arrayBuffer();
    return new Response(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        // Lesson audio is deterministic – let the browser reuse it.
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch (error) {
    console.error("TTS ERROR:", error);
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    return apiError(timedOut ? "service_unavailable" : "internal_error", timedOut ? 504 : 500);
  }
}
