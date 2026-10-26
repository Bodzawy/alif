import type { FormsContent } from "@/data/types";

/**
 * A letter lesson's Formen step without recordings: what text-to-speech reads
 * instead of each clip – the German narration (its caption) and the words.
 * Clip name → text. Empty for the Alif lesson (fully recorded). Kept apart
 * from the lesson index so the page can use it without loading every lesson.
 */
export function formsFallbackTexts(forms: FormsContent): Record<string, string> {
  if (!forms.letter) return {};
  const words = Object.fromEntries([...forms.explain, ...forms.build, ...forms.sort].map((word) => [word.audio, word.arabic]));
  return { ...words, ...forms.letter.texts };
}
