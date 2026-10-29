import type { FormsContent } from "@/data/types";

/**
 * A Formen step's clips without recordings: what text-to-speech reads instead –
 * the words (the Alif lesson's narration is recorded, its words are not) and, in
 * a letter lesson, the German narration (its caption). Clip name → text. Kept
 * apart from the lesson index so the page can use it without loading every lesson.
 */
export function formsFallbackTexts(forms: FormsContent): Record<string, string> {
  const words = Object.fromEntries([...forms.explain, ...forms.build, ...forms.sort].map((word) => [word.audio, word.arabic]));
  return { ...words, ...forms.letter?.texts };
}
