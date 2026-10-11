// The form of any letter inside a word – start, middle, end or separate –
// computed from the vocalised text. One rule for every letter:
//   a letter is joined to the one BEFORE it when that letter connects forward
//   (has a "Hand", i.e. is not in NON_CONNECTING), and joined to the one AFTER
//   it when it connects forward itself and there is a next letter.
// Used by A1 · Schritt 3 "Formen" of every letter (src/lib/arabic/hamza-alif.ts
// builds the Alif lesson's own positions on top of it).

/** Letters that never connect to the following letter (no "Hand"). */
export const NON_CONNECTING: ReadonlySet<string> = new Set(["ا", "أ", "إ", "آ", "د", "ذ", "ر", "ز", "و", "ؤ", "ة", "ء"]);

// Harakat, tanwin, shadda, sukun, dagger alif and the other Arabic combining marks.
const MARK = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/;

/** Splits a word into tiles: each letter together with its harakat. */
export function splitTiles(word: string): string[] {
  const tiles: string[] = [];
  for (const char of word) {
    if (MARK.test(char) && tiles.length > 0) tiles[tiles.length - 1] += char;
    else tiles.push(char);
  }
  return tiles;
}

/** The letter of a tile without its harakat. */
export function baseLetter(tile: string): string {
  return Array.from(tile).find((char) => !MARK.test(char)) ?? "";
}

/** Does this letter (tile) reach out to the next letter? (A space between two words never does.) */
export function hasHand(tile: string): boolean {
  const letter = baseLetter(tile);
  return letter !== "" && letter.trim() !== "" && !NON_CONNECTING.has(letter);
}

const isSpace = (tile: string | undefined) => tile !== undefined && tile.trim() === "";

/** start – joined only to the next letter; middle – both; end – only to the one before; separate – neither. */
export type LetterForm = "start" | "middle" | "end" | "separate";

export const LETTER_FORMS: readonly LetterForm[] = ["start", "middle", "end", "separate"];

/** Index of the `occurrence`-th tile (0 = first, -1 = last) whose letter is `letter`, or -1. */
export function targetIndex(tiles: readonly string[], letter: string, occurrence = 0): number {
  const hits = tiles.flatMap((tile, i) => (baseLetter(tile) === letter ? [i] : []));
  return hits.at(occurrence) ?? -1;
}

/** How the tile at `index` is joined: to the letter before it (its Hand holds it) and to the letter after it (its own Hand). */
export function joins(tiles: readonly string[], index: number): { previous: boolean; next: boolean } {
  return {
    previous: index > 0 && !isSpace(tiles[index]) && hasHand(tiles[index - 1]!),
    next: index < tiles.length - 1 && !isSpace(tiles[index + 1]) && hasHand(tiles[index]!),
  };
}

export function letterForm(tiles: readonly string[], index: number): LetterForm {
  const { previous, next } = joins(tiles, index);
  return previous && next ? "middle" : next ? "start" : previous ? "end" : "separate";
}

/** A word looked at for one target letter. */
export type TargetWord = {
  tiles: string[];
  index: number;
  form: LetterForm;
  previous: boolean;
  next: boolean;
};

export function analyzeWord(word: string, letter: string, occurrence = 0): TargetWord {
  const tiles = splitTiles(word);
  const index = targetIndex(tiles, letter, occurrence);
  if (index < 0) throw new Error(`"${word}" has no ${letter}`);
  return { tiles, index, form: letterForm(tiles, index), ...joins(tiles, index) };
}

const TATWEEL = "ـ";

/** The printed shape of a form, with tatweel for the joins: بـ · ـبـ · ـب · ب. */
export function formGlyph(letter: string, form: LetterForm): string {
  return form === "start" ? letter + TATWEEL : form === "middle" ? TATWEEL + letter + TATWEEL : form === "end" ? TATWEEL + letter : letter;
}

/**
 * Neighbours for "Wer hält fest?": distinct letters of the given words (in the
 * order they appear), without the target letter itself, the Ta marbuta and the
 * lone Hamza (they never stand before another letter). `withHand` letters that
 * connect forward, then `withoutHand` that do not – the plain Alif first when a
 * word has one.
 */
export function pickNeighbors(words: readonly string[], letter: string, count = { withHand: 4, withoutHand: 1 }): string[] {
  const seen = [...new Set(words.flatMap((word) => splitTiles(word).map(baseLetter)))].filter((l) => l !== letter && l !== "ة" && l !== "ء");
  const holding = seen.filter((l) => !NON_CONNECTING.has(l)).slice(0, count.withHand);
  const apart = seen.filter((l) => NON_CONNECTING.has(l)).sort((a, b) => Number(b === "ا") - Number(a === "ا")).slice(0, count.withoutHand);
  return [...holding, ...apart];
}
