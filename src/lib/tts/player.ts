// Plays Arabic model pronunciations from Alif's /api/tts. Generated audio is
// kept per text for the lifetime of the page, so repeated "Anhören" clicks do
// not hit Azure again. Only one sound plays at a time.

const cache = new Map<string, Promise<string>>();
let current: HTMLAudioElement | null = null;

export class TtsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TtsError";
  }
}

async function fetchAudioUrl(text: string): Promise<string> {
  const response = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    throw new TtsError("Die Aussprache konnte gerade nicht geladen werden. Bitte versuche es gleich noch einmal.");
  }
  return URL.createObjectURL(await response.blob());
}

function audioUrl(text: string): Promise<string> {
  let pending = cache.get(text);
  if (!pending) {
    pending = fetchAudioUrl(text);
    cache.set(text, pending);
    // Failed requests must not be cached.
    pending.catch(() => cache.delete(text));
  }
  return pending;
}

/** URL of the spoken text (same cached /api/tts audio as speakArabic), for players that reuse their own element. */
export function speechUrl(text: string): Promise<string> {
  return audioUrl(text);
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
