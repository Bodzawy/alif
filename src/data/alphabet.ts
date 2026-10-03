import type { PronunciationExercise } from "@/data/types";
import { ARABIC_LETTERS, type ArabicLetter } from "@/lib/pronunciation/letters";

// A0 – the Arabic alphabet. Everything pronunciation-related comes unchanged
// from the legacy Masaar letter list (src/lib/pronunciation/letters.ts):
//   order        – ARABIC_LETTERS order
//   target       – referenceText (Azure reference + key into letter_conditions.json)
//   spoken name  – modelText (sent to /api/tts, shown as the Arabic letter name)
// The only A0 addition is how a letter is displayed.

/** Display glyph where it differs from Masaar's `letter` (A0 shows alif with hamza). */
const DISPLAY_GLYPH: Partial<Record<string, string>> = { alif: "أ" };

export type AlphabetLetter = ArabicLetter & {
  /** 1-based position in the alphabet. */
  position: number;
  /** Glyph shown to the student. */
  glyph: string;
  /** Pronunciation exercise for /api/pronunciation and /api/tts. */
  exercise: PronunciationExercise;
};

export const ALPHABET: AlphabetLetter[] = ARABIC_LETTERS.map((letter, index) => ({
  ...letter,
  position: index + 1,
  glyph: DISPLAY_GLYPH[letter.id] ?? letter.letter,
  exercise: { id: letter.id, target: letter.referenceText, modelText: letter.modelText },
}));

export const ALPHABET_LEVEL = {
  slug: "a0",
  code: "A0",
  title: "Das arabische Alphabet",
  description: "Alle 28 Buchstaben kennenlernen: hören, nachsprechen und Buchstabe für Buchstabe meistern.",
  /** Key under which A0 progress is stored (see src/lib/progress.ts). */
  progressKey: "a0/alphabet",
} as const;

export function alphabetLetterHref(id: string) {
  return `/${ALPHABET_LEVEL.slug}/letters/${id}`;
}

export function getAlphabetLetter(id: string): AlphabetLetter | undefined {
  return ALPHABET.find((letter) => letter.id === id);
}
