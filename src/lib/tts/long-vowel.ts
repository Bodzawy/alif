// A letter with a short vowel on its own (بَ، بِ، بُ – the sound cards of the
// letter lessons, "Aussprechen"): Azure clips a short vowel at the end of a
// text. For Azure only, the vowel is written long – Fatha + ا, Kasra + ي,
// Damma + و: بَ → بَا, بِ → بِي, بُ → بُو (أَ → آ). The card, the
// pronunciation target and its rules stay بَ.

const FATHA = "َ";
const LONG: Readonly<Record<string, string>> = { [FATHA]: "ا", "ِ": "ي", "ُ": "و" };
const LETTER_WITH_SHORT_VOWEL = /^([ء-ي])([َ-ِ])$/u;

/** The text Azure reads for one letter with a short vowel; null for any other text. */
export function longVowelSound(text: string): string | null {
  const m = LETTER_WITH_SHORT_VOWEL.exec(text);
  if (!m) return null;
  const [, letter, vowel] = m;
  if (letter === "أ" && vowel === FATHA) return "آ"; // أَ + ا is written آ
  return `${letter}${vowel}${LONG[vowel!]}`;
}
