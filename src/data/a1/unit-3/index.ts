import type { A1Unit } from "@/data/types";

import { a1Ain, a1Ghain, a1Ha, a1Tta, a1Zza } from "./letters";
import { a1ManHuwa } from "./man-huwa";
import { a1Alphabet, a1MinAyna, a1Review3, a1Shadda } from "./min-ayna";

// Unit 3 of the book "لغتنا الفصحى 1" (book pages 91–121, PDF pages 123–153):
// two presentations, each an A1 lesson of its own, in book order.
//   Lektion 5 = الوحدة الثالثة · تقديم (١): ه ط ظ ع غ and "مَنْ هُوَ؟"
//   Lektion 6 = الوحدة الثالثة · تقديم (٢): الشدة والتاء المربوطة, the general
//     review, "مِنْ أَيْنَ أَنْتَ؟" and the alphabet in all its forms.

export const a1Unit5: A1Unit = {
  slug: "lesson-5",
  number: 5,
  bookLabel: "الْوَحْدَةُ الثَّالِثَةُ – تَقْدِيمٌ (١)",
  title: "مَنْ هُوَ؟",
  titleGerman: "Wer ist er?",
  lessons: [a1Ha, a1Tta, a1Zza, a1Ain, a1Ghain, a1ManHuwa],
};

export const a1Unit6: A1Unit = {
  slug: "lesson-6",
  number: 6,
  bookLabel: "الْوَحْدَةُ الثَّالِثَةُ – تَقْدِيمٌ (٢)",
  title: "مِنْ أَيْنَ أَنْتَ؟",
  titleGerman: "Woher kommst du?",
  lessons: [a1Shadda, a1Review3, a1MinAyna, a1Alphabet],
};
