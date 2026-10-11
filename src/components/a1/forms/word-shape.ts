import type { FormsLetter, FormsWord } from "@/data/types";
import { hamzaPosition, splitTiles, type HamzaPosition } from "@/lib/arabic/hamza-alif";
import { analyzeWord } from "@/lib/arabic/letter-form";

/** A Formen word as the activities show it: tiles, the letter that is looked at, and its position. */
export type WordShape = {
  tiles: string[];
  /** Tile index for ShapedWord; undefined in the Alif lesson (ShapedWord finds the Hamza-Alif itself). */
  target: number | undefined;
  position: HamzaPosition;
};

/** Alif lesson: the Hamza-Alif and the lesson's positions. Letter lessons: the letter and its form (src/lib/arabic/letter-form.ts). */
export function wordShape(word: FormsWord, letter?: FormsLetter): WordShape {
  if (!letter) {
    const tiles = splitTiles(word.arabic);
    return { tiles, target: undefined, position: hamzaPosition(tiles) };
  }
  const shape = analyzeWord(word.arabic, letter.glyph, word.occurrence);
  return { tiles: shape.tiles, target: shape.index, position: shape.form };
}
