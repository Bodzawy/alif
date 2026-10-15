import type { A1Unit } from "@/data/types";

import { a1Ijaza, a1Yawm } from "./yawm";

// Unit 9 of the book "لغتنا الفصحى 1" (book pages 247–265, PDF pages 279–297):
//   Lektion 17 = الوحدة التاسعة · تقديم (١) "يَوْمٌ فِي حَيَاةِ بَاسِم"
//   Lektion 18 = الوحدة التاسعة · تقديم (٢) "الْإِجَازَةُ الْأُسْبُوعِيَّةُ"

export const a1Unit17: A1Unit = {
  slug: "lesson-17",
  number: 17,
  bookLabel: "الْوَحْدَةُ التَّاسِعَةُ – تَقْدِيمٌ (١)",
  title: "يَوْمٌ فِي حَيَاةِ بَاسِم",
  titleGerman: "Ein Tag im Leben von Basim",
  lessons: [a1Yawm],
};

export const a1Unit18: A1Unit = {
  slug: "lesson-18",
  number: 18,
  bookLabel: "الْوَحْدَةُ التَّاسِعَةُ – تَقْدِيمٌ (٢)",
  title: "الْإِجَازَةُ الْأُسْبُوعِيَّةُ",
  titleGerman: "Das Wochenende",
  lessons: [a1Ijaza],
};
