import type { Lesson } from "@/data/types";

// A1 · Lesson 7 – the letter Cha (خ).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson7: Lesson = {
  slug: "lesson-7",
  number: 7,
  title: "Der Buchstabe Cha",
  subtitle: "Das „ch“ wie in „Bach“ – und drei Wörter, die mit Cha beginnen.",
  minutes: 10,
  letter: {
    glyph: "خ",
    name: "Cha",
    nameArabic: "خَاء",
    transliteration: "ch",
    soundHint:
      "Wie das „ch“ in „Bach“ oder „lachen“ – ein rauer Reibelaut hinten am Gaumen.",
    forms: [
      { label: "Allein", glyph: "خ" },
      { label: "Anfang", glyph: "خـ" },
      { label: "Mitte", glyph: "ـخـ" },
      { label: "Ende", glyph: "ـخ" },
    ],
    exercise: { id: "letter", target: "خاء", modelText: "خَاء" },
  },
  vocabulary: [
    {
      id: "khubz",
      arabic: "خُبْز",
      german: "das Brot",
      transliteration: "chubz",
      image: { src: "/images/vocabulary/khubz.svg", alt: "Ein Laib Brot" },
      exercise: { id: "khubz", target: "خبز", modelText: "خُبْز" },
    },
    {
      id: "kharuf",
      arabic: "خَرُوف",
      german: "das Schaf",
      transliteration: "charūf",
      image: { src: "/images/vocabulary/kharuf.svg", alt: "Ein weißes Schaf auf der Wiese" },
      exercise: { id: "kharuf", target: "خروف", modelText: "خَرُوف" },
    },
    {
      id: "khiyar",
      arabic: "خِيَار",
      german: "die Gurke",
      transliteration: "chijār",
      image: { src: "/images/vocabulary/khiyar.svg", alt: "Eine grüne Gurke" },
      exercise: { id: "khiyar", target: "خيار", modelText: "خِيَار" },
    },
  ],
};
