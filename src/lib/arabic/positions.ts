import type { LetterPositions } from "@/data/types";

import { findWords, type FindWord } from "./letter-find";

// "كتابة الحرف" (Lektion 2): the book's example words of a letter's positions,
// each as one findable word (src/lib/arabic/letter-find.ts) with the tile of the
// letter that is meant – the right occurrence when the letter appears twice
// (وُصُول: the second و stands "in der Mitte").

export type PositionCard = {
  id: string;
  label: string;
  labelGerman: string;
  shape: string;
  word: string;
  german: string;
  findWord: FindWord;
  /** The key of the tile that is meant. */
  targetKey: string;
};

function card(id: string, label: string, labelGerman: string, shape: string, word: string, german: string, letter: string, occurrence = 0): PositionCard {
  const [findWord] = findWords(id, word, [letter]);
  if (!findWord) throw new Error(`positions: "${word}" is empty`);
  const hits = findWord.tiles.filter((tile) => tile.target);
  const target = hits.at(occurrence);
  if (!target) throw new Error(`positions: "${word}" has no ${letter} (occurrence ${occurrence})`);
  return { id, label, labelGerman, shape, word, german, findWord, targetKey: target.key };
}

export function positionCards(positions: LetterPositions): PositionCard[] {
  const { letter, sukun } = positions;
  return [
    ...positions.items.map((item) => card(item.id, item.label, item.labelGerman, item.shape, item.word, item.german, letter, item.occurrence)),
    card("sukun", "النُّطْقُ مَعَ السُّكُونِ", "mit Sukun (ohne Vokal)", sukun.glyph, sukun.word, sukun.german, letter, sukun.occurrence),
  ];
}
