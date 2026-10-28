import type { Locale } from "@/lib/locale";
import { localSpeechUrl, speechUrl } from "@/lib/tts/player";

// The recorded narration of a step (German WAVs) in the learner's language:
// in German the recordings play as before; in another language every clip
// with a German text is spoken from its translation instead (Azure, in a
// voice of that language), while recorded Arabic words still play their file.
// `texts`: clip name → what the clip says (German, or the Arabic word).

const ARABIC_SCRIPT = /[؀-ۿ]/;

export function localNarration(available: readonly string[], texts: Readonly<Record<string, string>>, locale: Locale) {
  const german = (name: string) => texts[name] !== undefined && !ARABIC_SCRIPT.test(texts[name]!);
  return {
    available: locale === "de" ? available : available.filter((name) => !german(name)),
    /** A clip without a file: its text, spoken (an Arabic word in the lesson voice, German in the learner's language). */
    fallback: async (name: string) => {
      const text = texts[name];
      if (!text) return null;
      return ARABIC_SCRIPT.test(text) ? speechUrl(text) : localSpeechUrl(text);
    },
  };
}
