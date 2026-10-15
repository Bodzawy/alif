import type { A1Unit } from "@/data/types";

import { A1_GROUPS } from "../groups";
import { a1HalHadhihi, a1Review5 } from "./hal-hadhihi";
import { a1KitabMan } from "./kitab-man";

// Unit 5 of the book "لغتنا الفصحى 1" (book pages 151–178, PDF pages 183–210):
//   Lektion 9  = الوحدة الخامسة · تقديم (١) "كِتَابُ مَنْ هَذَا؟"
//   Lektion 10 = الوحدة الخامسة · تقديم (٢) "هَلْ هَذِهِ حَقِيبَةٌ؟" and the general
//     review of units 1–5 (book pages 169–178).

export const a1Unit9: A1Unit = {
  slug: "lesson-9",
  group: A1_GROUPS.unit5,
  number: 9,
  bookLabel: "الْوَحْدَةُ الْخَامِسَةُ – تَقْدِيمٌ (١)",
  title: "كِتَابُ مَنْ هَذَا؟",
  titleGerman: "Wessen Buch ist das?",
  lessons: [a1KitabMan],
};

export const a1Unit10: A1Unit = {
  slug: "lesson-10",
  group: A1_GROUPS.unit5,
  number: 10,
  bookLabel: "الْوَحْدَةُ الْخَامِسَةُ – تَقْدِيمٌ (٢)",
  title: "هَلْ هَذِهِ حَقِيبَةٌ؟",
  titleGerman: "Ist das eine Tasche?",
  lessons: [a1HalHadhihi, a1Review5],
};
