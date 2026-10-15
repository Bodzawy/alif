import { baseLetter, splitTiles } from "./letter-form";

// "اكتبها بحروف منفصلة" (Unit 2 · تدريب ١٠): the letters of a word written
// apart, in reading order – e.g. جَرَس → ج ر س, تِبْر → ت ب ر. The vowel signs
// are left out (the book's example: "جرس: ج – ر – س"); shadda is a sign too,
// so a doubled letter is written once (as in the book's examples).

export function spellLetters(word: string): string[] {
  return splitTiles(word)
    .map(baseLetter)
    .filter((letter) => /[ء-يٱآ]/.test(letter));
}

/** The letter tiles offered for a word: its own letters plus look-alikes, each once, in a fixed order. */
export function spellChoices(word: string, extra: readonly string[] = []): string[] {
  const own = spellLetters(word);
  const LOOK: Record<string, string> = { ب: "ت", ت: "ث", ث: "ب", ج: "ح", ح: "خ", خ: "ج", د: "ذ", ذ: "د", ر: "ز", ز: "ر", س: "ش", ش: "س", ص: "ض", ض: "ص", ط: "ظ", ظ: "ط", ع: "غ", غ: "ع", ف: "ق", ق: "ف", ك: "ل", ل: "ك", م: "ن", ن: "م", ا: "و", و: "ي", ي: "ا" };
  const set = [...new Set([...own, ...own.map((l) => LOOK[l]).filter((l): l is string => Boolean(l)), ...extra])];
  // Arabic alphabetical order: stable and gives nothing away.
  return set.sort((a, b) => a.localeCompare(b, "ar"));
}
