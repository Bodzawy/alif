// A single letter with a short vowel (بَ بِ بُ – the sound card before each row
// of words, the "Aussprechen" exercises) is read by Azure as a clipped, barely
// audible syllable. For the voice only, the vowel is written long: بَ → بَا,
// بِ → بِي, بُ → بُو (أَ → آ, as أَ + ا is written). The card, the exercise
// target and the pronunciation rules keep the short form.

const FATHA = "\u064E";
const DAMMA = "\u064F";
const KASRA = "\u0650";

const LONG: Readonly<Record<string, string>> = { [FATHA]: "ا", [KASRA]: "ي", [DAMMA]: "و" };

// One Arabic letter (ء … غ, ف … ي; not the tatweel U+0640), then exactly one short vowel.
const LETTER_WITH_SHORT_VOWEL = /^([\u0621-\u063A\u0641-\u064A])([\u064E\u064F\u0650])$/;

/** The long-vowel text for the voice, or null when `text` is not exactly one letter + Fatha/Kasra/Damma. */
export function longVowelSound(text: string): string | null {
  const match = LETTER_WITH_SHORT_VOWEL.exec(text.trim());
  if (!match) return null;
  const [, letter, vowel] = match as unknown as [string, string, string];
  if (letter === "أ" && vowel === FATHA) return "آ";
  return letter + vowel + LONG[vowel];
}
