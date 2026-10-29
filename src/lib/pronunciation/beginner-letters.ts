import { ARABIC_LETTERS } from "./letters";

// ALIF Speaking (Beginner): which letters of a target IQRA must hear, and the sounds each may be
// heard as – the condition of the letter's own name in beginner_conditions.json (e.g. باء: b or p).
// Used by scripts/beginner-conditions.ts (which writes the file) and by its tests.

export const BEGINNER_FILE = "src/lib/pronunciation/beginner_conditions.json";

export type RuleFile = Record<string, { excellent: { conditions: string[]; message: string }; needs_improvement: { conditions: string[]; message: string } }>;

/** Not checked: Alif, Alif Maqsura, Ta Marbuta and the Hamza (the letter ألف has no condition either). */
const SILENT = new Set(["ا", "ى", "ة", "أ", "إ", "آ", "ؤ", "ئ", "ء", "ٱ"]);
const LETTER = /[ء-ي]/;
const MARK = /[ً-ْٰ]/;
const SHADDA = "ّ";

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

/** The tokens of a target's Beginner condition: every spoken letter with its agreed sounds. */
export function beginnerLetterTokens(text: string, rules: RuleFile): Array<{ letter: string; alternatives: string[] }> {
  return spokenLetters(text).flatMap((letter) => {
    const alternatives = letterSounds(letter, rules);
    return alternatives ? [{ letter, alternatives }] : [];
  });
}
