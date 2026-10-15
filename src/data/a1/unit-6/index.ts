import type { A1Unit } from "@/data/types";

import { a1MaAlYawm } from "./ma-al-yawm";
import { a1MaRaqm } from "./ma-raqm";

// Unit 6 of the book "لغتنا الفصحى 1" (book pages 179–205, PDF pages 211–237):
//   Lektion 11 = الوحدة السادسة · تقديم (١) "مَا الرَّقْمُ؟"
//   Lektion 12 = الوحدة السادسة · تقديم (٢) "مَا الْيَوْمُ؟"

export const a1Unit11: A1Unit = {
  slug: "lesson-11",
  number: 11,
  bookLabel: "الْوَحْدَةُ السَّادِسَةُ – تَقْدِيمٌ (١)",
  title: "مَا الرَّقْمُ؟",
  titleGerman: "Wie ist die Nummer?",
  lessons: [a1MaRaqm],
};

export const a1Unit12: A1Unit = {
  slug: "lesson-12",
  number: 12,
  bookLabel: "الْوَحْدَةُ السَّادِسَةُ – تَقْدِيمٌ (٢)",
  title: "مَا الْيَوْمُ؟",
  titleGerman: "Welcher Tag ist heute?",
  lessons: [a1MaAlYawm],
};
