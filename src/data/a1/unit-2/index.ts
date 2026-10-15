import type { A1Unit } from "@/data/types";

import { a1ManAnta, a1Review2, a1Wajdi } from "./conversations";
import { a1Dad, a1Ra, a1Sad, a1Shin, a1Sin, a1Zay } from "./letters-1";
import { a1Fa, a1Kaf, a1Lam, a1Mim, a1Nun, a1Qaf } from "./letters-2";

// Unit 2 of the book ("وجدي.pdf", 46 PDF pages = book pages 44–89): two
// presentations, each an A1 lesson of its own, in book order.
//   Lektion 3 = الوحدة الثانية · تقديم (١): ر ز س ش ص ض and "هَلْ أَنْتَ وَجْدِي؟"
//   Lektion 4 = الوحدة الثانية · تقديم (٢): ف ق ك ل م ن, the general review and "مَنْ أَنْتَ؟"
// (The book teaches no further letters in this unit; ط ظ ع غ only appear in words.)

export const a1Unit3: A1Unit = {
  slug: "lesson-3",
  number: 3,
  bookLabel: "الْوَحْدَةُ الثَّانِيَةُ – تَقْدِيمٌ (١)",
  title: "هَلْ أَنْتَ وَجْدِي؟",
  titleGerman: "Bist du Wagdi?",
  lessons: [a1Ra, a1Zay, a1Sin, a1Shin, a1Sad, a1Dad, a1Wajdi],
};

export const a1Unit4: A1Unit = {
  slug: "lesson-4",
  number: 4,
  bookLabel: "الْوَحْدَةُ الثَّانِيَةُ – تَقْدِيمٌ (٢)",
  title: "مَنْ أَنْتَ؟",
  titleGerman: "Wer bist du?",
  lessons: [a1Fa, a1Qaf, a1Kaf, a1Lam, a1Mim, a1Nun, a1Review2, a1ManAnta],
};
