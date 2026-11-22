import type { A1Unit } from "@/data/types";

import { A2_GROUPS } from "../groups";
import { a2Shaqqati } from "./shaqqati";

// Unit 1 of the book "لغتنا الفصحى 2" (book pages 16–34): تقديم (١) "شَقَّتِي الْجَدِيدَةُ".
//   Adjectives and their opposites, the apartment text (النص), the grammar notes ٤–٨
//   (فِيهِ / فِيهَا / بِهِ / بِهَا, لَيْسَ, adjective agreement), تدريب ١–٤, ٧, ٨ (listening dialogue),
//   قراءة (١) "مدينة القاهرة", تدريب ١١–١٣ (writing) and the speaking tasks.

export const a2Unit1: A1Unit = {
  slug: "lesson-1",
  group: A2_GROUPS.unit1,
  number: 1,
  bookLabel: "الْوَحْدَةُ الْأُولَى – تَقْدِيمٌ (١)",
  title: "شَقَّتِي الْجَدِيدَةُ",
  titleGerman: "Meine neue Wohnung",
  lessons: [a2Shaqqati],
};
