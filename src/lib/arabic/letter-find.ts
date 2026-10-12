import { baseLetter, splitTiles } from "./letter-form";

// "Unterstreiche den Buchstaben": a dialogue line split into words, each word
// into tiles (a letter with its harakat, src/lib/arabic/letter-form.ts). The
// letters are what the learner can mark; punctuation is kept apart (it never
// joins a letter, so it can be drawn outside the word without changing its
// shape). A tile counts when its letter is one of `accepts` – e.g. ا أ إ آ
// for the Alif. The dagger alif (ـٰ in لِلَّهِ) is a mark, not a letter: it is
// not written as a letter and does not count.

/** Arabic letters (Hamza … Ya, with the Alif forms and Ta marbuta). */
const LETTER = /[ء-يٱ]/;

export type FindTile = { key: string; text: string; letter: string; isLetter: boolean; target: boolean };
export type FindWord = { key: string; tiles: FindTile[]; trailing: string };
export type FindLine = { key: string; words: FindWord[] };

export function findWords(lineKey: string, text: string, accepts: readonly string[]): FindWord[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((raw, w) => {
      const tiles = splitTiles(raw);
      let end = tiles.length;
      while (end > 0 && !LETTER.test(baseLetter(tiles[end - 1]!))) end--;
      const key = `${lineKey}:${w}`;
      return {
        key,
        tiles: tiles.slice(0, end).map((tile, t) => {
          const letter = baseLetter(tile);
          const isLetter = LETTER.test(letter);
          return { key: `${key}:${t}`, text: tile, letter, isLetter, target: isLetter && accepts.includes(letter) };
        }),
        trailing: tiles.slice(end).join(""),
      };
    });
}

export function findLines(lines: ReadonlyArray<{ id: string; arabic: string }>, accepts: readonly string[]): FindLine[] {
  return lines.map((line) => ({ key: line.id, words: findWords(line.id, line.arabic, accepts) }));
}

export function targetKeys(lines: readonly FindLine[]): string[] {
  return lines.flatMap((line) => line.words.flatMap((word) => word.tiles.filter((tile) => tile.target).map((tile) => tile.key)));
}

export type FindResult = { correct: string[]; wrong: string[]; missing: string[]; done: boolean };

/** Which marks are right, which are wrong, which targets are still missing. */
export function checkFind(lines: readonly FindLine[], selected: ReadonlySet<string>): FindResult {
  const targets = new Set(targetKeys(lines));
  const correct = [...selected].filter((key) => targets.has(key));
  const wrong = [...selected].filter((key) => !targets.has(key));
  const missing = [...targets].filter((key) => !selected.has(key));
  return { correct, wrong, missing, done: wrong.length === 0 && missing.length === 0 };
}

export function tileByKey(lines: readonly FindLine[], key: string): FindTile | undefined {
  for (const line of lines) for (const word of line.words) for (const tile of word.tiles) if (tile.key === key) return tile;
  return undefined;
}
