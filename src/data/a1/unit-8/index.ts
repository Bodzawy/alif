import type { A1Unit } from "@/data/types";

import { a1Ayna, a1AynaSaydaliyya } from "./ayna";

// Unit 8 of the book "لغتنا الفصحى 1" (book pages 225–245, PDF pages 257–277):
//   Lektion 15 = الوحدة الثامنة · تقديم (١) "أَيْنَ الْحَقِيبَةُ؟"
//   Lektion 16 = الوحدة الثامنة · تقديم (٢) "أَيْنَ الصَّيْدَلِيَّةُ؟"

export const a1Unit15: A1Unit = {
  slug: "lesson-15",
  number: 15,
  bookLabel: "الْوَحْدَةُ الثَّامِنَةُ – تَقْدِيمٌ (١)",
  title: "أَيْنَ الْحَقِيبَةُ؟",
  titleGerman: "Wo ist die Tasche?",
  lessons: [a1Ayna],
};

export const a1Unit16: A1Unit = {
  slug: "lesson-16",
  number: 16,
  bookLabel: "الْوَحْدَةُ الثَّامِنَةُ – تَقْدِيمٌ (٢)",
  title: "أَيْنَ الصَّيْدَلِيَّةُ؟",
  titleGerman: "Wo ist die Apotheke?",
  lessons: [a1AynaSaydaliyya],
};
