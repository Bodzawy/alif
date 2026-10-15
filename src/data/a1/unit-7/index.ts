import type { A1Unit } from "@/data/types";

import { a1MaAsSir } from "./ma-as-sir";
import { a1MaLawn } from "./ma-lawn";

// Unit 7 of the book "لغتنا الفصحى 1" (book pages 207–224, PDF pages 239–256):
//   Lektion 13 = الوحدة السابعة · تقديم (١) "مَا السِّعْرُ؟"
//   Lektion 14 = الوحدة السابعة · تقديم (٢) "مَا لَوْنُ هَذَا الْقَلَمِ؟ – هَذِهِ شَقَّتِي"

export const a1Unit13: A1Unit = {
  slug: "lesson-13",
  number: 13,
  bookLabel: "الْوَحْدَةُ السَّابِعَةُ – تَقْدِيمٌ (١)",
  title: "مَا السِّعْرُ؟",
  titleGerman: "Was kostet das?",
  lessons: [a1MaAsSir],
};

export const a1Unit14: A1Unit = {
  slug: "lesson-14",
  number: 14,
  bookLabel: "الْوَحْدَةُ السَّابِعَةُ – تَقْدِيمٌ (٢)",
  title: "مَا لَوْنُ هَذَا الْقَلَمِ؟",
  titleGerman: "Welche Farbe hat dieser Stift?",
  lessons: [a1MaLawn],
};
