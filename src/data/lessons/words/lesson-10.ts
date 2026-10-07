import type { Lesson } from "@/data/types";

// A1 · Lesson 10 – the letter Ra (ر).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson10: Lesson = {
  slug: "lesson-10",
  number: 10,
  title: "Der Buchstabe Ra",
  subtitle: "Das gerollte „r“ – und drei Wörter, die mit Ra beginnen.",
  minutes: 10,
  letter: {
    glyph: "ر",
    name: "Ra",
    nameArabic: "رَاء",
    transliteration: "r",
    soundHint:
      "Ein gerolltes „r“ mit der Zungenspitze, wie im Italienischen oder Spanischen – nicht das deutsche Rachen-„r“.",
    forms: [
      { label: "Allein", glyph: "ر" },
      { label: "Anfang", glyph: "ر" },
      { label: "Mitte", glyph: "ـر" },
      { label: "Ende", glyph: "ـر" },
    ],
    exercise: { id: "letter", target: "راء", modelText: "رَاء" },
  },
  vocabulary: [
    {
      id: "rummana",
      arabic: "رُمَّانَة",
      german: "der Granatapfel",
      transliteration: "rummāna",
      image: { src: "/images/vocabulary/rummana.svg", alt: "Ein Granatapfel, aufgeschnitten mit roten Kernen" },
      exercise: { id: "rummana", target: "رمانة", modelText: "رُمَّانَة" },
    },
    {
      id: "risha",
      arabic: "رِيشَة",
      german: "die Feder",
      transliteration: "rīscha",
      image: { src: "/images/vocabulary/risha.svg", alt: "Eine Feder" },
      exercise: { id: "risha", target: "ريشة", modelText: "رِيشَة" },
    },
    {
      id: "rajul",
      arabic: "رَجُل",
      german: "der Mann",
      transliteration: "radschul",
      image: { src: "/images/vocabulary/rajul.svg", alt: "Ein Mann mit Bart" },
      exercise: { id: "rajul", target: "رجل", modelText: "رَجُل" },
    },
  ],
};
