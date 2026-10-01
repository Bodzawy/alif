import "server-only";

import { internalApiKey, iqraUrl, masaarUrl } from "../config";
import type { IqraResult, MasaarResult } from "../types";

// Clients for the self-hosted MASAAR (letter classification) and IQRA
// (phoneme recognition) model services. Ported from the original
// /api/pronunciation route: same /predict endpoint, same multipart field
// ("audio", filename voice.wav), same X-Internal-Api-Key header and the same
// 8-second timeout. Both are best effort: a failure returns null and the
// assessment continues without that service's data.

export const MODEL_TIMEOUT_MS = 8_000;

type ModelService = "MASAAR" | "IQRA";

async function postAudioToModel(
  service: ModelService,
  baseUrl: string | undefined,
  audioBuffer: Buffer
): Promise<unknown | null> {
  if (!baseUrl) {
    console.warn(`${service} URL is not configured.`);
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);

  try {
    const formData = new FormData();
    formData.append("audio", new Blob([new Uint8Array(audioBuffer)]), "voice.wav");

    const apiKey = internalApiKey();
    const response = await fetch(`${baseUrl}/predict`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
      // Only sent when INTERNAL_API_KEY is configured. The services ignore the
      // header when they have no key of their own, so local development works.
      headers: apiKey ? { "X-Internal-Api-Key": apiKey } : undefined,
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`${service} returned ${response.status}.`);
      return null;
    }

    return await response.json();
  } catch (error) {
    const reason =
      error instanceof Error && error.name === "AbortError"
        ? `timed out after ${MODEL_TIMEOUT_MS / 1000} seconds`
        : error;
    console.error(`${service} ERROR:`, reason);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function assessMasaar(audioBuffer: Buffer): Promise<MasaarResult | null> {
  const result = await postAudioToModel("MASAAR", masaarUrl(), audioBuffer);
  if (!result || typeof result !== "object") return null;
  const data = result as MasaarResult & { ok?: boolean };
  return data.ok === false ? null : data;
}

export async function assessIqra(audioBuffer: Buffer): Promise<IqraResult | null> {
  const result = await postAudioToModel("IQRA", iqraUrl(), audioBuffer);
  if (!result || typeof result !== "object") return null;
  const data = result as IqraResult & { ok?: boolean };
  if (data.ok === false) return null;

  return {
    sequence: data.sequence,
    phonemes: Array.isArray(data.phonemes)
      ? data.phonemes.filter((phoneme): phoneme is string => typeof phoneme === "string")
      : [],
    duration: data.duration,
  };
}
