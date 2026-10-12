import { baseLetter, splitTiles } from "./letter-form";

// "حُرُوفُ الْمَدّ" (Lektion 2): the long vowels ā ū ī are written with a
// Dehnungsbuchstabe (ا و ي) after the matching short vowel – ا after a Fatha,
// و after a Damma, ي after a Kasra – and the long letter itself carries no
// vowel sign. A و or ي WITH a sign (وَ، يِ، يْ …) is a consonant; ا at the
// beginning of a word (ال، اسْم) and the Alif with Hamza (أ إ) are not long
// vowels; آ is a Hamza with a long ā. Computed from the vocalised word.

const FATHA = "َ";
const DAMMA = "ُ";
const KASRA = "ِ";
/** Any vowel sign, sukun or shadda: a letter carrying one is not a Dehnungsbuchstabe. */
const SIGN = /[ً-ْ]/;

export type MaddKind = "alif" | "waw" | "ya";

export type Madd = {
  /** Tile index of the Dehnungsbuchstabe. */
  index: number;
  kind: MaddKind;
};

/** The German name of each kind (as in the book: مَدٌّ بِالْأَلِفِ، بِالْوَاوِ، بِالْيَاءِ). */
export const MADD_NAME: Record<MaddKind, { arabic: string; german: string; letter: string }> = {
  alif: { arabic: "مَدٌّ بِالْأَلِفِ", german: "langes ā (mit Alif)", letter: "ا" },
  waw: { arabic: "مَدٌّ بِالْوَاوِ", german: "langes ū (mit Waw)", letter: "و" },
  ya: { arabic: "مَدٌّ بِالْيَاءِ", german: "langes ī (mit Ya)", letter: "ي" },
};

/** Every Dehnungsbuchstabe of a vocalised word, right to left. */
export function maddLetters(word: string): Madd[] {
  const tiles = splitTiles(word);
  const found: Madd[] = [];
  tiles.forEach((tile, i) => {
    const letter = baseLetter(tile);
    if (letter === "آ") {
      found.push({ index: i, kind: "alif" });
      return;
    }
    if (i === 0 || SIGN.test(tile)) return;
    const before = tiles[i - 1]!;
    if ((letter === "ا" || letter === "ى") && before.includes(FATHA)) found.push({ index: i, kind: "alif" });
    else if (letter === "و" && before.includes(DAMMA)) found.push({ index: i, kind: "waw" });
    else if (letter === "ي" && before.includes(KASRA)) found.push({ index: i, kind: "ya" });
  });
  return found;
}

export const hasMadd = (word: string) => maddLetters(word).length > 0;
