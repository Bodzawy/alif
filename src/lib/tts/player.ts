// Plays Arabic model pronunciations. Texts with a professional recording
// (recorded-manifest.json, files under /audio/ar/, see DEPLOY-AUDIO.md) play that
// recording, and so do dialogue lines with one in their speaker's voice
// (dialogue-manifest.json); every other text – and any recording that cannot be loaded – is
// spoken by Alif's /api/tts (Azure). Audio is kept per text for the lifetime of
// the page, so repeated "Anhören" clicks load nothing again. Only one sound
// plays at a time.

import { translate } from "@/i18n/translate";
import { currentLocale } from "@/lib/locale";

const TTS_CACHE_REVISION = "recorded-v1";

type RecordedManifest = { clips: Record<string, string> };
let manifestPromise: Promise<RecordedManifest> | null = null;

function recordedManifest(): Promise<RecordedManifest> {
  manifestPromise ??= import("./recorded-manifest.json")
    .then((m) => m.default as RecordedManifest)
    .catch(() => ({ clips: {} }));
  return manifestPromise;
}

type DialogueManifest = { lines: Record<string, { voice: string; text: string; file: string }> };
let dialogueManifestPromise: Promise<DialogueManifest> | null = null;

function dialogueManifest(): Promise<DialogueManifest> {
  dialogueManifestPromise ??= import("./dialogue-manifest.json")
    .then((m) => m.default as DialogueManifest)
    .catch(() => ({ lines: {} }));
  return dialogueManifestPromise;
}

/** The recording of a dialogue line – only while it was made for this very text and voice. */
async function dialogueFile(line: string, text: string, voice: SpeechVoice): Promise<string | undefined> {
  const entry = (await dialogueManifest()).lines[line];
  return entry && entry.text === text && entry.voice === voice ? entry.file : undefined;
}

/** Object URL of the recording of `text`, or null when there is none (or it cannot be loaded). */
async function fetchRecordedUrl(text: string, voice?: SpeechVoice, line?: string): Promise<string | null> {
  // A dialogue voice: the recording of that line only (lines of a dialogue without recordings stay on Azure,
  // so one speaker never changes voice within a dialogue). The default voice: the text's recording.
  const file = voice ? line && (await dialogueFile(line, text, voice)) : (await recordedManifest()).clips[text];
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

async function fetchAudioUrl(text: string, voice?: SpeechVoice, line?: string): Promise<string> {
  const recorded = await fetchRecordedUrl(text, voice, line);
  if (recorded) return recorded;
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

function audioUrl(text: string, voice?: SpeechVoice, line?: string): Promise<string> {
  const key = `${TTS_CACHE_REVISION}\u0000${voice ? `${voice}\u0000${line ?? ""}\u0000` : ""}${text}`;
  let pending = cache.get(key);
  if (!pending) {
    pending = fetchAudioUrl(text, voice, line);
    cache.set(key, pending);
    // Failed requests must not be cached.
    pending.catch(() => cache.delete(key));
  }
  return pending;
}

/**
 * URL of the spoken text (same cached audio as speakArabic), for players that reuse their own element.
 * `line`: the dialogue line (DialogueLine.id) whose recording to play, if it has one in this voice.
 */
export function speechUrl(text: string, voice?: SpeechVoice, line?: string): Promise<string> {
  return audioUrl(text, voice, line);
}

export function stopSpeaking() {
  if (current) {
    current.pause();
    current = null;
  }
}

/**
 * A German text of Alif's own (an instruction, "Super!") in the learner's language, spoken by Azure in a
 * voice of that language. Cached like every other text.
 */
export function localSpeechUrl(text: string): Promise<string> {
  const locale = currentLocale();
  const spoken = translate(text, locale);
  const key = `${TTS_CACHE_REVISION}\u0000lang:${locale}\u0000${spoken}`;
  let pending = cache.get(key);
  if (!pending) {
    pending = (async () => {
      const response = await fetch("/api/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: spoken, lang: locale }) });
      if (!response.ok) throw new TtsError(translate("Die Aussprache konnte gerade nicht geladen werden. Bitte versuche es gleich noch einmal.", locale));
      return URL.createObjectURL(await response.blob());
    })();
    cache.set(key, pending);
    pending.catch(() => cache.delete(key));
  }
  return pending;
}

/** Resolves when playback has finished (or was interrupted). `voice` / `line`: as for speechUrl. */
export async function speakArabic(text: string, voice?: SpeechVoice, line?: string): Promise<void> {
  const url = await audioUrl(text, voice, line);
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
