import type { Lesson } from "@/data/types";

// A1 · Lesson 3 – the letter Ta (ت).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson3: Lesson = {
  slug: "lesson-3",
  number: 3,
  title: "Der Buchstabe Ta · das normale T",
  subtitle: "Das normale T – und drei Wörter, die mit Ta beginnen.",
  minutes: 10,
  letter: {
    glyph: "ت",
    name: "Ta",
    nameArabic: "تَاء",
    transliteration: "t",
    soundHint:
      "Wie das deutsche „t“ in „Tag“, nur ohne den kleinen Hauch danach. Die Zungenspitze liegt an den oberen Schneidezähnen.",
    forms: [
      { label: "Allein", glyph: "ت" },
      { label: "Anfang", glyph: "تـ" },
      { label: "Mitte", glyph: "ـتـ" },
      { label: "Ende", glyph: "ـت" },
    ],
    exercise: { id: "letter", target: "تاء", modelText: "تَاء" },
  },
  vocabulary: [
    {
      id: "tuffaha",
      arabic: "تُفَّاحَة",
      german: "der Apfel",
      transliteration: "tuffāḥa",
      image: { src: "/images/vocabulary/tuffaha.svg", alt: "Ein roter Apfel mit Blatt" },
      exercise: { id: "tuffaha", target: "تفاحة", modelText: "تُفَّاحَة" },
    },
    {
      id: "timsah",
      arabic: "تِمْسَاح",
      german: "das Krokodil",
      transliteration: "timsāḥ",
      image: { src: "/images/vocabulary/timsah.svg", alt: "Ein grünes Krokodil" },
      exercise: { id: "timsah", target: "تمساح", modelText: "تِمْسَاح" },
    },
    {
      id: "taj",
      arabic: "تَاج",
      german: "die Krone",
      transliteration: "tādsch",
      image: { src: "/images/vocabulary/taj.svg", alt: "Eine goldene Krone" },
      exercise: { id: "taj", target: "تاج", modelText: "تَاج" },
    },
  ],
};
