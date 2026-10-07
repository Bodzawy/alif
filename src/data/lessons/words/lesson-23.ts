import type { Lesson } from "@/data/types";

// A1 · Lesson 23 – the letter Lam (ل).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson23: Lesson = {
  slug: "lesson-23",
  number: 23,
  title: "Der Buchstabe Lam",
  subtitle: "Das arabische „l“ – und drei Wörter, die mit Lam beginnen.",
  minutes: 10,
  letter: {
    glyph: "ل",
    name: "Lam",
    nameArabic: "لَام",
    transliteration: "l",
    soundHint:
      "Wie das deutsche „l“ in „Licht“.",
    forms: [
      { label: "Allein", glyph: "ل" },
      { label: "Anfang", glyph: "لـ" },
      { label: "Mitte", glyph: "ـلـ" },
      { label: "Ende", glyph: "ـل" },
    ],
    exercise: { id: "letter", target: "لام", modelText: "لَام" },
  },
  vocabulary: [
    {
      id: "laimuna",
      arabic: "لَيْمُونَة",
      german: "die Zitrone",
      transliteration: "laimūna",
      image: { src: "/images/vocabulary/laimuna.svg", alt: "Eine gelbe Zitrone" },
      exercise: { id: "laimuna", target: "ليمونة", modelText: "لَيْمُونَة" },
    },
    {
      id: "lisan",
      arabic: "لِسَان",
      german: "die Zunge",
      transliteration: "lisān",
      image: { src: "/images/vocabulary/lisan.svg", alt: "Ein Gesicht, das die Zunge herausstreckt" },
      exercise: { id: "lisan", target: "لسان", modelText: "لِسَان" },
    },
    {
      id: "laqlaq",
      arabic: "لَقْلَق",
      german: "der Storch",
      transliteration: "laqlaq",
      image: { src: "/images/vocabulary/laqlaq.svg", alt: "Ein Storch" },
      exercise: { id: "laqlaq", target: "لقلق", modelText: "لَقْلَق" },
    },
  ],
};
