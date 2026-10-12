import type { WordPick } from "@/data/types";

import { maddLetters, type MaddKind } from "./madd";

// "ضع خطًّا تحت الكلمات …" (Lektion 2): the words of a word-pick step – a list,
// or the words of dialogue lines (punctuation cut off) – and which of them the
// learner has to underline: those with a Dehnungsbuchstabe, or those without.

export type PickToken = { key: string; word: string; shown: string; target: boolean; madd: MaddKind[] };

const PUNCT = /[.،؟!:]+$/;

export function pickTokens(pick: WordPick): PickToken[] {
  const words = pick.words
    ? pick.words.map((w) => ({ key: w.id, shown: w.arabic }))
    : (pick.dialogues ?? []).flatMap((d) => d.lines.flatMap((line) => line.arabic.split(/\s+/).filter(Boolean).map((shown, i) => ({ key: `${line.id}:${i}`, shown }))));
  return words.map(({ key, shown }) => {
    const word = shown.replace(PUNCT, "");
    const madd = [...new Set(maddLetters(word).map((m) => m.kind))];
    return { key, word, shown, madd, target: pick.find === "madd" ? madd.length > 0 : madd.length === 0 };
  });
}
