import type { A1Lesson, A1Word, GapItem } from "@/data/types";

import { sharedGapsContent } from "./letter-lesson";

// "صَبَاحُ الْخَيْر" – the phrase of Lektion 1 (the book unit's title): listen
// and say it, then find the letters of the lesson in it (ب ح خ).

const IMG = "/images/a1/sabah-al-khayr";
const ARABIC = "صَبَاحُ الْخَيْر";
const image = { src: `${IMG}/sabah-al-khayr.svg`, alt: "Ein Kind grüßt am Morgen, die Sonne geht auf" };

export const sabahAlKhayr: A1Word = {
  id: "sabah-al-khayr",
  arabic: ARABIC,
  german: "Guten Morgen",
  transliteration: "Ṣabāḥ al-khayr",
  image,
  exercise: { id: "sabah-al-khayr", target: "صباح الخير", modelText: ARABIC },
};

const item = (id: string, pattern: string, choices: string[]): GapItem => ({ id, arabic: ARABIC, german: "Guten Morgen", pattern, choices, image });

export const a1SabahAlKhayr: A1Lesson = {
  slug: "sabah-al-khayr",
  kind: "phrase",
  label: ARABIC,
  labelGerman: "Guten Morgen",
  steps: [
    { kind: "phrases", slug: "step-1", title: `Sprechen: ${ARABIC}`, navLabel: "Sprechen", phrases: [sabahAlKhayr] },
    {
      kind: "gaps",
      slug: "step-2",
      title: "Buchstaben finden: ب · ح · خ",
      navLabel: "Buchstaben finden",
      gaps: sharedGapsContent("picture", [], [
        item("sabah-ba", "صَ_احُ الْخَيْر", ["أَ", "بَ", "تَ", "ثَ"]),
        item("sabah-hha", "صَبَا_ الْخَيْر", ["أُ", "جُ", "حُ", "خُ"]),
        item("sabah-kha", "صَبَاحُ الْ_يْر", ["أَ", "جَ", "حَ", "خَ"]),
      ]),
    },
  ],
};
