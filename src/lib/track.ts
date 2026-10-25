// The programme the learner chose on the first visit (per browser, like the
// progress). Both use the same lessons; they differ in how a spoken answer is
// judged (see /api/pronunciation):
//   speaking      – Azure only: understandable Arabic is enough.
//   pronunciation – Azure and IQRA with the condition files: every sound and vowel.
// Each programme keeps its own progress (src/lib/progress.ts).

export type Track = "speaking" | "pronunciation";

export const TRACKS: Record<Track, { name: string; level: string; arabic: string; german: string }> = {
  speaking: {
    name: "ALIF Speaking",
    level: "Beginner",
    arabic: "التحدّث باللغة العربية – مستوى مبتدئ",
    german: "Verständlich Arabisch sprechen. Bewertet wird, ob dein Wort gut zu verstehen ist.",
  },
  pronunciation: {
    name: "ALIF Pronunciation",
    level: "Advanced",
    arabic: "النطق الفصيح للعربية القرآنية – مستوى متقدم",
    german: "Fusha-Aussprache des Korans. Jeder Laut und jeder Vokal wird genau geprüft.",
  },
};

/** Until a programme is chosen (e.g. a direct link to a lesson): today's evaluation. */
export const DEFAULT_TRACK: Track = "pronunciation";

const TRACK_KEY = "alif:track";
const listeners = new Set<() => void>();
let memoryTrack: Track | null = null;

export function isTrack(value: unknown): value is Track {
  return value === "speaking" || value === "pronunciation";
}

/** The chosen programme, or null before the first choice (or without storage). */
export function readTrack(): Track | null {
  try {
    const value = window.localStorage.getItem(TRACK_KEY);
    return isTrack(value) ? value : null;
  } catch {
    return memoryTrack;
  }
}

/** The programme whose evaluation and progress apply now. */
export function currentTrack(): Track {
  return (typeof window === "undefined" ? null : readTrack()) ?? DEFAULT_TRACK;
}

export function chooseTrack(track: Track) {
  memoryTrack = track;
  try {
    window.localStorage.setItem(TRACK_KEY, track);
  } catch {
    // Storage unavailable: the choice lives in memory for this visit.
  }
  listeners.forEach((listener) => listener());
}

export function subscribeTrack(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === TRACK_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}
