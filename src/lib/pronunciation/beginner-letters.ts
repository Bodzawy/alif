import { ARABIC_LETTERS } from "./letters";

// ALIF Speaking (Beginner): which letters of a target IQRA must hear, and the sounds each may be
// heard as – the condition of the letter's own name in beginner_conditions.json (e.g. باء: b or p).
// A single letter with a short vowel (بَ بِ بُ, أَ إِ أُ) also needs its vowel, in any of its forms.
// أُ is checked in every word too: as u, as o (a beginner's oh) or as the Hamza itself.
// Used by scripts/beginner-conditions.ts (which writes the file) and by its tests.

export const BEGINNER_FILE = "src/lib/pronunciation/beginner_conditions.json";

export type RuleFile = Record<string, { excellent: { conditions: string[]; message: string }; needs_improvement: { conditions: string[]; message: string } }>;

/** Not checked: Alif, Alif Maqsura, Ta Marbuta and the Hamza (the letter ألف has no condition either). */
const SILENT = new Set(["ا", "ى", "ة", "أ", "إ", "آ", "ؤ", "ئ", "ء", "ٱ"]);
const LETTER = /[ء-ي]/;
const MARK = /[ً-ْٰ]/;
const SHADDA = "ّ";

/**
 * The vowel of a letter with Fatha, Kasra or Damma – every form IQRA writes for it counts (short,
 * long, emphatic, gliding), so a beginner's a / aa / ah is right for بَ. The three stay apart.
 */
export const VOWEL_SOUNDS: Readonly<Record<string, readonly string[]>> = {
  "\u064E": ["a", "aa", "A", "AA", "aah", "Aah"],
  "\u0650": ["i", "ii", "I", "II", "iey", "Iey"],
  "\u064F": ["u", "uu", "U", "UU"],
};

/** أُ – the Hamza with Damma, alone or in a word: its Damma in any form, an o, or the Hamza ("<"). */
export const HAMZA_DAMMA = "\u0623\u064F";
export const HAMZA_DAMMA_SOUNDS: readonly string[] = [...VOWEL_SOUNDS["\u064F"]!, "o", "oo", "oh", "<"];

/** The vowel sounds of a single letter with one short vowel (بَ, إِ …), else null. */
export function syllableVowel(text: string): readonly string[] | null {
  const chars = [...text.trim()];
  if (text.trim() === HAMZA_DAMMA) return HAMZA_DAMMA_SOUNDS;
  return chars.length === 2 && LETTER.test(chars[0]!) ? (VOWEL_SOUNDS[chars[1]!] ?? null) : null;
}

/** The sounds of a letter: the first part of its name's condition (جيم: j or g, not its م). */
export function letterSounds(letter: string, rules: RuleFile): string[] | null {
  const name = ARABIC_LETTERS.find((l) => l.letter === letter)?.referenceText;
  const condition = name ? rules[name]?.excellent.conditions[0] : undefined;
  const first = condition && /\[(.+)\]$/.exec(condition)?.[1]?.split(",")[0];
  return first ? first.replace(/['\s]/g, "").split("|") : null;
}

/**
 * The spoken letters of a vocalised text, in order, each once: not the silent letters above, not و / ي
 * as long vowels (no mark of their own), not the ل of ال before a sun letter (the next letter has a Shadda).
 */
export function spokenLetters(text: string): string[] {
  const units: Array<{ letter: string; marks: string }> = [];
  for (const char of text) {
    if (LETTER.test(char)) units.push({ letter: char, marks: "" });
    else if (MARK.test(char) && units.length) units[units.length - 1]!.marks += char;
    else if (/\s/.test(char)) units.push({ letter: " ", marks: "" });
  }
  const out: string[] = [];
  units.forEach(({ letter, marks }, i) => {
    if (letter === " " || SILENT.has(letter)) return;
    if ((letter === "و" || letter === "ي") && !marks) return;
    if (letter === "ل" && !marks && units[i + 1]?.marks.includes(SHADDA)) return;
    if (!out.includes(letter)) out.push(letter);
  });
  return out;
}

/**
 * The tokens of a target's Beginner condition: every spoken letter with its agreed sounds (and a syllable's
 * vowel). A word with أُ (أُمٌّ, أُذُنٌ …) needs it too, once, where it first stands among the letters.
 */
export function beginnerLetterTokens(text: string, rules: RuleFile): Array<{ letter: string; alternatives: string[] }> {
  const letters = spokenLetters(text).flatMap((letter) => {
    const alternatives = letterSounds(letter, rules);
    return alternatives ? [{ letter, alternatives }] : [];
  });
  const vowel = syllableVowel(text);
  if (vowel) return [...letters, { letter: [...text.trim()][1]!, alternatives: [...vowel] }];
  const at = text.indexOf(HAMZA_DAMMA);
  if (at < 0) return letters;
  const before = new Set(spokenLetters(text.slice(0, at)));
  const index = letters.filter(({ letter }) => before.has(letter)).length;
  return [...letters.slice(0, index), { letter: HAMZA_DAMMA, alternatives: [...HAMZA_DAMMA_SOUNDS] }, ...letters.slice(index)];
}
