import type { Lesson } from "@/data/types";

// A1 · Lesson 9 – the letter Dhal (ذ).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson9: Lesson = {
  slug: "lesson-9",
  number: 9,
  title: "Der Buchstabe Dhal",
  subtitle: "Das stimmhafte „th“ wie im englischen „this“ – und drei Wörter, die mit Dhal beginnen.",
  minutes: 10,
  letter: {
    glyph: "ذ",
    name: "Dhal",
    nameArabic: "ذَال",
    transliteration: "dh",
    soundHint:
      "Wie das englische „th“ in „this“: Die Zungenspitze liegt zwischen den Zähnen, dabei schwingt die Stimme mit.",
    forms: [
      { label: "Allein", glyph: "ذ" },
      { label: "Anfang", glyph: "ذ" },
      { label: "Mitte", glyph: "ـذ" },
      { label: "Ende", glyph: "ـذ" },
    ],
    exercise: { id: "letter", target: "ذال", modelText: "ذَال" },
  },
  vocabulary: [
    {
      id: "dhib",
      arabic: "ذِئْب",
      german: "der Wolf",
      transliteration: "dhiʾb",
      image: { src: "/images/vocabulary/dhib.svg", alt: "Ein grauer Wolf heult den Mond an" },
      exercise: { id: "dhib", target: "ذئب", modelText: "ذِئْب" },
    },
    {
      id: "dhura",
      arabic: "ذُرَة",
      german: "der Mais",
      transliteration: "dhura",
      image: { src: "/images/vocabulary/dhura.svg", alt: "Ein Maiskolben" },
      exercise: { id: "dhura", target: "ذرة", modelText: "ذُرَة" },
    },
    {
      id: "dhubaba",
      arabic: "ذُبَابَة",
      german: "die Fliege",
      transliteration: "dhubāba",
      image: { src: "/images/vocabulary/dhubaba.svg", alt: "Eine Fliege mit durchsichtigen Flügeln" },
      exercise: { id: "dhubaba", target: "ذبابة", modelText: "ذُبَابَة" },
    },
  ],
};
