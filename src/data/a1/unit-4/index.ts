import type { A1Unit } from "@/data/types";

import { a1AnaMisri, a1Drills4, a1Hamza } from "./ana-misri";
import { a1Hujrati } from "./hujrati";

// Unit 4 of the book "لغتنا الفصحى 1" (book pages 123–149, PDF pages 155–181):
//   Lektion 7 = الوحدة الرابعة · تقديم (١) "أَنَا مِصْرِيّ": the Hamza, general
//     drills on letters, the conversation and its exercises.
//   Lektion 8 = الوحدة الرابعة · تقديم (٢) "هَذِهِ حُجْرَتِي": things in the room,
//     مَا هَذَا / هَذِهِ, "مِنْ أَيْنَ هَذِهِ السَّاعَةُ؟", the shop, "مَا الْهِجَاءُ؟", تذكر.

export const a1Unit7: A1Unit = {
  slug: "lesson-7",
  number: 7,
  bookLabel: "الْوَحْدَةُ الرَّابِعَةُ – تَقْدِيمٌ (١)",
  title: "أَنَا مِصْرِيّ",
  titleGerman: "Ich bin Ägypter",
  lessons: [a1Hamza, a1Drills4, a1AnaMisri],
};

export const a1Unit8: A1Unit = {
  slug: "lesson-8",
  number: 8,
  bookLabel: "الْوَحْدَةُ الرَّابِعَةُ – تَقْدِيمٌ (٢)",
  title: "هَذِهِ حُجْرَتِي",
  titleGerman: "Das ist mein Zimmer",
  lessons: [a1Hujrati],
};
