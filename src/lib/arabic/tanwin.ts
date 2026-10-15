// The words of "Wörter" in the A1 letter entries are spoken with Tanwin
// (بَيْتٌ, بِطَاقَةٌ, أُمٌّ, مُسْتَشْفًى) – only the model audio. The word on the
// card (arabic) and the pronunciation target (unvocalised) stay pausal, so the
// rules in vocabulary_conditions.json are untouched.
// No Tanwin for a word that cannot take it:
//   – with the article ال (الْيُونَان, الصِّين),
//   – ending in ا: pronouns, names, question words (أَنَا, دِينَا, لِمَاذَا؟),
//   – ending in a long ū / ī without Shadda: indeclinable loanwords (رَادْيُو,
//     كِيلُو, شِيبْسِي) – a Nisba ـِيّ needs its Shadda (see SPOKEN),
//   – the diptotes in NO_TANWIN (names, broken plural patterns, ـَاء of the feminine).

const MARK = /[ً-ْٰ]/;
const HARAKAT = /[ً-ْٰ]/g;
const TANWIN = /[ً-ٍ]/;
const FATHA = "َ";
const DAMMA = "ُ";
const KASRA = "ِ";
const FATHATAN = "ً";
const DAMMATAN = "ٌ";
const SHADDA = "ّ";
const TRAILING_PUNCT = /[.،؟?!:]+$/;

/** Diptotes (ممنوع من الصرف) among the A1 words: they never take Tanwin. */
export const NO_TANWIN: ReadonlySet<string> = new Set([
  "وِئَام", // female name
  "هُدَى", // female name
  "طَمَاطِم", // pattern of صِيغَةُ مُنْتَهَى الْجُمُوعِ (فَعَالِل)
  "زُمَلَاء", // فُعَلَاء: ending in the Alif of the feminine (أَلِفُ التَّأْنِيثِ الْمَمْدُودَةُ)
]);

/** Words whose pausal spelling hides a sound that comes back with Tanwin: the doubled letter of a Nisba or of خَسّ. */
export const SPOKEN: Readonly<Record<string, string>> = {
  "هِنْدِي": "هِنْدِيٌّ",
  "يُوسُفِي": "يُوسُفِيٌّ",
  "خَس": "خَسٌّ",
};

/** The text spoken for a word: with Tanwin al-Damm (-un) when it can take Tanwin, otherwise unchanged. */
export function withTanwin(arabic: string): string {
  if (SPOKEN[arabic]) return SPOKEN[arabic];
  if (NO_TANWIN.has(arabic)) return arabic;
  const punct = TRAILING_PUNCT.exec(arabic)?.[0] ?? "";
  const word = arabic.slice(0, arabic.length - punct.length);
  const bare = word.replace(HARAKAT, "");
  if (!bare || /\s/.test(word) || bare.startsWith("ال") || TANWIN.test(word)) return arabic;

  // The last letter and its marks.
  const chars = Array.from(word);
  let at = chars.length - 1;
  while (at > 0 && MARK.test(chars[at]!)) at--;
  const stem = chars.slice(0, at);
  const letter = chars[at]!;
  const marks = chars.slice(at + 1).join("");

  if (letter === "ا") return arabic;
  // A long ū / ī: و after Damma, ي after Kasra, without a mark of its own (but ظَبْي → ظَبْيٌ).
  const longVowel = (letter === "و" && stem.at(-1) === DAMMA) || (letter === "ي" && stem.at(-1) === KASRA);
  if (longVowel && !MARK.test(marks)) return arabic;
  if (letter === "ى") {
    // مُسْتَشْفَى → مُسْتَشْفًى: the Fatha before the Alif maqsura becomes Fathatan.
    const before = stem.join("");
    return before.endsWith(FATHA) ? `${before.slice(0, -1)}${FATHATAN}${letter}${punct}` : arabic;
  }
  // The pausal ending (Sukun or a vowel) gives way to -un; a Shadda stays (after the vowel sign, as everywhere in the data).
  return `${stem.join("")}${letter}${DAMMATAN}${marks.includes(SHADDA) ? SHADDA : ""}${punct}`;
}
