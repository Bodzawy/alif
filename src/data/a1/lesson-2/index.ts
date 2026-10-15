import type { A1Unit } from "@/data/types";

import { A1_GROUPS } from "../groups";
import { a1Dal } from "./dal";
import { a1Dhal } from "./dhal";
import { a1HurufAlMadd } from "./huruf-al-madd";
import { a1MasaAlKhayr } from "./masa-al-khayr";
import { a1Waw } from "./waw";
import { a1Ya } from "./ya";

// A1 · Lektion 2 "مَسَاءُ الْخَيْر" ("مساء الخير.pdf", book pages 23–41), in book
// order: the letters د ذ و ي, the long and short vowels (حروف المد), the two
// evening conversations with grammar, exercises and "تذكر".

export const a1Unit2: A1Unit = {
  slug: "lesson-2",
  group: A1_GROUPS.start,
  number: 2,
  title: "مَسَاءُ الْخَيْر",
  titleGerman: "Guten Abend",
  lessons: [a1Dal, a1Dhal, a1Waw, a1Ya, a1HurufAlMadd, a1MasaAlKhayr],
};
