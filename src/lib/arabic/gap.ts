// "Fill the gap" words (A1 · Lektion 1 · Schritt 5 "Ergänzen" and 6 "Hören"):
// the gap, the answer and the visible rest of a word are computed from the
// full vocalised word – never stored separately. The gap is the word's
// Hamza-Alif tile with its vowel sign.

import { hamzaIndex, hasHand, splitTiles } from "./hamza-alif";

export type GapVowel = "a" | "i" | "u" | "sukun";

const VOWEL_MARK: Record<string, GapVowel> = {
  "\u064E": "a", // fatha
  "\u0650": "i", // kasra
  "\u064F": "u", // damma
  "\u0652": "sukun",
};

export type GapWord = {
  tiles: string[];
  /** Index of the gap (the Hamza-Alif tile). */
  index: number;
  /** The tile that belongs into the gap, e.g. "أَ". */
  answer: string;
  /** Its vowel sign, e.g. "a" (chooses the explanation clip). */
  vowel: GapVowel;
  /** Text before and after the gap, each written as ONE string ("" when empty). */
  before: string;
  after: string;
};

export function gapWord(word: string): GapWord {
  const tiles = splitTiles(word);
  const index = hamzaIndex(tiles);
  if (index < 0) throw new Error(`"${word}" has no Hamza-Alif to leave out`);
  const answer = tiles[index]!;
  const mark = Array.from(answer).find((char) => VOWEL_MARK[char]);
  if (!mark) throw new Error(`The Hamza-Alif of "${word}" has no vowel sign`);
  return {
    tiles,
    index,
    answer,
    vowel: VOWEL_MARK[mark]!,
    before: tiles.slice(0, index).join(""),
    after: tiles.slice(index + 1).join(""),
  };
}

/**
 * The pieces the word is drawn in: before, gap, after (empty pieces left out).
 * Each piece is shaped by the browser on its own, so a cut is only allowed
 * after a letter that never connects forward – otherwise a join would break.
 */
export function gapPieces(gap: GapWord): Array<{ kind: "text"; text: string } | { kind: "gap" }> {
  return [
    ...(gap.before ? [{ kind: "text" as const, text: gap.before }] : []),
    { kind: "gap" as const },
    ...(gap.after ? [{ kind: "text" as const, text: gap.after }] : []),
  ];
}

/** True when every cut between the pieces comes after a letter without a Hand (and the pieces make up the word). */
export function piecesAreSafe(gap: GapWord): boolean {
  const cuts = [gap.index - 1, gap.index].filter((i) => i >= 0 && i < gap.tiles.length - 1);
  return cuts.every((i) => !hasHand(gap.tiles[i]!)) && gap.before + gap.answer + gap.after === gap.tiles.join("");
}
