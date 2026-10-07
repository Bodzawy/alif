import type { Lesson } from "@/data/types";

// A1 · Lesson 21 – the letter Qaf (ق).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson21: Lesson = {
  slug: "lesson-21",
  number: 21,
  title: "Der Buchstabe Qaf",
  subtitle: "Das tiefe K aus dem Rachen – und drei Wörter, die mit Qaf beginnen.",
  minutes: 10,
  letter: {
    glyph: "ق",
    name: "Qaf",
    nameArabic: "قَاف",
    transliteration: "q",
    soundHint:
      "Ein „k“ ganz hinten im Rachen, am Zäpfchen gebildet – tiefer als das deutsche „k“ und ohne Hauch.",
    forms: [
      { label: "Allein", glyph: "ق" },
      { label: "Anfang", glyph: "قـ" },
      { label: "Mitte", glyph: "ـقـ" },
      { label: "Ende", glyph: "ـق" },
    ],
    exercise: { id: "letter", target: "قاف", modelText: "قَاف" },
  },
  vocabulary: [
    {
      id: "qitta",
      arabic: "قِطَّة",
      german: "die Katze",
      transliteration: "qiṭṭa",
      image: { src: "/images/vocabulary/qitta.svg", alt: "Eine Katze" },
      exercise: { id: "qitta", target: "قطة", modelText: "قِطَّة" },
    },
    {
      id: "qamar",
      arabic: "قَمَر",
      german: "der Mond",
      transliteration: "qamar",
      image: { src: "/images/vocabulary/qamar.svg", alt: "Ein Vollmond am Nachthimmel" },
      exercise: { id: "qamar", target: "قمر", modelText: "قَمَر" },
    },
    {
      id: "qalam",
      arabic: "قَلَم",
      german: "der Stift",
      transliteration: "qalam",
      image: { src: "/images/vocabulary/qalam.svg", alt: "Ein Bleistift" },
      exercise: { id: "qalam", target: "قلم", modelText: "قَلَم" },
    },
  ],
};
