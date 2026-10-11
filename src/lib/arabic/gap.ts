// "Fill the gap" words (A1 · Lektion 1 · "Ergänzen" and "Hören"): the gaps,
// the answers and the visible rest of a word are computed from the full
// vocalised word – never stored separately.
//   Alif: the gap is the word's Hamza-Alif tile with its vowel sign (gapWord).
//   Every other item: the book PATTERN, "_" for each missing letter, aligned
//   with the tiles of the full word (gapTask), e.g. "_ا_" → بَابْ.

import { hamzaIndex, hasHand, splitTiles } from "./hamza-alif";
import { joins } from "./letter-form";

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

// ---------------------------------------------------------------------------
// Pattern items (one or more gaps anywhere in the word).

const TATWEEL = "ـ";

export type GapSlot = {
  /** Tile index of the gap. */
  index: number;
  /** The tile that belongs into the gap, e.g. "بَ". */
  answer: string;
  vowel: GapVowel;
};

export type GapPiece = { kind: "text"; text: string } | { kind: "gap"; gap: number };

/** One item of a gap step: the full word's tiles, its gaps (right to left) and the pieces it is drawn in. */
export type GapTask = {
  tiles: string[];
  gaps: GapSlot[];
  pieces: GapPiece[];
};

function vowelOf(tile: string, word: string): GapVowel {
  const mark = Array.from(tile).find((char) => VOWEL_MARK[char]);
  if (!mark) throw new Error(`The gap "${tile}" of "${word}" has no vowel sign`);
  return VOWEL_MARK[mark]!;
}

/**
 * Aligns the book pattern with the tiles of the full word: every "_" stands
 * for exactly one tile (the answer), every other tile of the pattern must be
 * the word's tile at that place. Throws when they do not fit.
 */
export function alignPattern(word: string, pattern: string): GapSlot[] {
  const tiles = splitTiles(word);
  const parts = splitTiles(pattern);
  if (parts.length !== tiles.length) throw new Error(`Pattern "${pattern}" does not fit "${word}" (${parts.length} ≠ ${tiles.length} tiles)`);
  const gaps: GapSlot[] = [];
  parts.forEach((part, i) => {
    if (part === "_") gaps.push({ index: i, answer: tiles[i]!, vowel: vowelOf(tiles[i]!, word) });
    else if (part !== tiles[i]) throw new Error(`Pattern "${pattern}" does not fit "${word}" at tile ${i}: "${part}" ≠ "${tiles[i]}"`);
  });
  if (gaps.length === 0) throw new Error(`Pattern "${pattern}" has no gap`);
  return gaps;
}

/**
 * The pieces around the gaps, each in the SAME joined shape it has in the full
 * word: a short tatweel stands for the join to a gap (فَـ [gap] ـق), so the
 * letters keep their start / middle / end forms although they are drawn apart.
 */
export function patternPieces(tiles: readonly string[], gaps: readonly GapSlot[]): GapPiece[] {
  const gapAt = new Map(gaps.map((gap, n) => [gap.index, n]));
  const pieces: GapPiece[] = [];
  let run: number[] = [];
  const flush = () => {
    if (run.length === 0) return;
    const first = run[0]!;
    const last = run.at(-1)!;
    const lead = gapAt.has(first - 1) && joins(tiles, first).previous ? TATWEEL : "";
    const tail = gapAt.has(last + 1) && joins(tiles, last).next ? TATWEEL : "";
    pieces.push({ kind: "text", text: lead + run.map((i) => tiles[i]).join("") + tail });
    run = [];
  };
  tiles.forEach((_, i) => {
    const n = gapAt.get(i);
    if (n === undefined) {
      run.push(i);
      return;
    }
    flush();
    pieces.push({ kind: "gap", gap: n });
  });
  flush();
  return pieces;
}

/** A gap item as the step shows it: by its pattern, or (Alif) by its Hamza-Alif. */
export function gapTask(item: { arabic: string; pattern?: string }): GapTask {
  if (item.pattern) {
    const tiles = splitTiles(item.arabic);
    const gaps = alignPattern(item.arabic, item.pattern);
    return { tiles, gaps, pieces: patternPieces(tiles, gaps) };
  }
  const gap = gapWord(item.arabic);
  return {
    tiles: gap.tiles,
    gaps: [{ index: gap.index, answer: gap.answer, vowel: gap.vowel }],
    pieces: gapPieces(gap).map((piece) => (piece.kind === "gap" ? { kind: "gap" as const, gap: 0 } : piece)),
  };
}
