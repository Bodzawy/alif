// When does the Alif with Hamza (أ) look "held" (ـأ) inside a word?
// One rule: the Alif never connects to the NEXT letter, but the letter BEFORE
// it holds it – if that letter connects forward (has a "Hand").
// Used by A1 · Lektion 1 · Schritt 3 and meant for later lessons.

import { baseLetter, joins } from "./letter-form";

// The tile helpers live in the general util; re-exported for the Alif code.
export { baseLetter, hasHand, NON_CONNECTING, splitTiles } from "./letter-form";

/** Alif forms carrying a hamza. */
const HAMZA_ALIF: ReadonlySet<string> = new Set(["أ", "إ"]);

/** Index of the Hamza-Alif tile, or -1. */
export function hamzaIndex(tiles: readonly string[]): number {
  return tiles.findIndex((tile) => HAMZA_ALIF.has(baseLetter(tile)));
}

/** The Hamza-Alif is held when it is not first and the tile before it has a Hand. */
export function isHamzaHeld(tiles: readonly string[], index = hamzaIndex(tiles)): boolean {
  return index >= 0 && joins(tiles, index).previous;
}

/**
 * Where the Hamza-Alif stands, as the lesson names it:
 *   start    – first letter (في أول الكلمة)
 *   middle   – held, inside the word (في المنتصف)
 *   end      – held, last letter (في آخر الكلمة)
 *   separate – after a letter without a Hand, so it stands alone (منفصلة)
 */
export type HamzaPosition = "start" | "middle" | "end" | "separate";

export function hamzaPosition(tiles: readonly string[]): HamzaPosition {
  const index = hamzaIndex(tiles);
  if (index < 0) throw new Error(`No Hamza-Alif in "${tiles.join("")}"`);
  if (index === 0) return "start";
  if (!isHamzaHeld(tiles, index)) return "separate";
  return index === tiles.length - 1 ? "end" : "middle";
}

/** Why the Alif looks the way it does: at the start, after a letter without a Hand, or held. */
export type HamzaReason = "start" | "nohand" | "hold";

export function hamzaReason(tiles: readonly string[]): HamzaReason {
  const index = hamzaIndex(tiles);
  if (index <= 0) return "start";
  return isHamzaHeld(tiles, index) ? "hold" : "nohand";
}
