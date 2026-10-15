import type { A1Unit } from "@/data/types";

import { A1_GROUPS } from "../groups";
import { a1Review10 } from "./review";
import { a1Terms } from "./terms";
import { a1Taqs, a1Usra } from "./usra";

// Unit 10 of the book "لغتنا الفصحى 1" (book pages 267–290, PDF pages 299–322):
//   Lektion 19 = الوحدة العاشرة · تقديم (١) "أَنَا وَأُسْرَتِي – أُسْرَتِي وَالْعَمَلُ"
//   Lektion 20 = الوحدة العاشرة · تقديم (٢) "مَا / كَيْفَ حَالَةُ الطَّقْسِ الْيَوْمَ؟" and the general
//     review of units 6–10 (book pages 291–301).

export const a1Unit19: A1Unit = {
  slug: "lesson-19",
  group: A1_GROUPS.unit10,
  number: 19,
  bookLabel: "الْوَحْدَةُ الْعَاشِرَةُ – تَقْدِيمٌ (١)",
  title: "أَنَا وَأُسْرَتِي",
  titleGerman: "Ich und meine Familie",
  lessons: [a1Usra],
};

export const a1Unit20: A1Unit = {
  slug: "lesson-20",
  group: A1_GROUPS.unit10,
  number: 20,
  bookLabel: "الْوَحْدَةُ الْعَاشِرَةُ – تَقْدِيمٌ (٢)",
  title: "كَيْفَ حَالَةُ الطَّقْسِ؟",
  titleGerman: "Wie ist das Wetter?",
  lessons: [a1Taqs, a1Review10, a1Terms],
};
