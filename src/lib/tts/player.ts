// Plays Arabic model pronunciations. Texts with a professional recording
// (recorded-manifest.json, files under /audio/ar/, see DEPLOY-AUDIO.md) play that
// recording; every other text – and any recording that cannot be loaded – is
// spoken by Alif's /api/tts (Azure). Audio is kept per text for the lifetime of
// the page, so repeated "Anhören" clicks load nothing again. Only one sound
// plays at a time.

const TTS_CACHE_REVISION = "recorded-v1";

type RecordedManifest = { clips: Record<string, string> };
let manifestPromise: Promise<RecordedManifest> | null = null;

function recordedManifest(): Promise<RecordedManifest> {
  manifestPromise ??= import("./recorded-manifest.json")
    .then((m) => m.default as RecordedManifest)
    .catch(() => ({ clips: {} }));
  return manifestPromise;
}

/** Object URL of the recording of `text`, or null when there is none (or it cannot be loaded). */
async function fetchRecordedUrl(text: string): Promise<string | null> {
  const file = (await recordedManifest()).clips[text];
  if (!file) return null;
  try {
    const response = await fetch(`/audio/ar/${file}.mp3`);
    if (!response.ok) return null;
    return URL.createObjectURL(await response.blob());
  } catch {
    return null;
  }
}

const cache = new Map<string, Promise<string>>();

/** A dialogue speaker's voice (see TTS_DIALOGUE_VOICES); without it the default lesson voice. */
export type SpeechVoice = "male-1" | "male-2" | "female-1" | "female-2";
let current: HTMLAudioElement | null = null;

export class TtsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TtsError";
  }
}

async function fetchAudioUrl(text: string, voice?: SpeechVoice): Promise<string> {
  // Dialogue voices have no recordings yet; lesson texts do (when installed).
  if (!voice) {
    const recorded = await fetchRecordedUrl(text);
    if (recorded) return recorded;
  }
  const response = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(voice ? { text, voice } : { text }),
  });
  if (!response.ok) {
    throw new TtsError("Die Aussprache konnte gerade nicht geladen werden. Bitte versuche es gleich noch einmal.");
  }
  return URL.createObjectURL(await response.blob());
}

function audioUrl(text: string, voice?: SpeechVoice): Promise<string> {
  const key = `${TTS_CACHE_REVISION}\u0000${voice ? `${voice}\u0000` : ""}${text}`;
  let pending = cache.get(key);
  if (!pending) {
    pending = fetchAudioUrl(text, voice);
    cache.set(key, pending);
    // Failed requests must not be cached.
    pending.catch(() => cache.delete(key));
  }
  return pending;
}

/** URL of the spoken text (same cached /api/tts audio as speakArabic), for players that reuse their own element. */
export function speechUrl(text: string, voice?: SpeechVoice): Promise<string> {
  return audioUrl(text, voice);
}

export function stopSpeaking() {
  if (current) {
    current.pause();
    current = null;
  }
}

/** Resolves when playback has finished (or was interrupted). */
export async function speakArabic(text: string): Promise<void> {
  const url = await audioUrl(text);
  stopSpeaking();
  const audio = new Audio(url);
  current = audio;

  await new Promise<void>((resolve, reject) => {
    audio.onended = () => resolve();
    audio.onpause = () => resolve();
    audio.onerror = () => reject(new TtsError("Die Aussprache konnte nicht abgespielt werden."));
    audio.play().catch((error: unknown) => {
      // Autoplay restrictions: nothing was played, which is not worth an error.
      if (error instanceof DOMException && error.name === "NotAllowedError") resolve();
      else reject(new TtsError("Die Aussprache konnte nicht abgespielt werden."));
    });
  }).finally(() => {
    if (current === audio) current = null;
  });
}
