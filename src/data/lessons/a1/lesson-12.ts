import type { Lesson } from "@/data/types";

// A1 · Lesson 12 – the letter Sin (س).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson12: Lesson = {
  slug: "lesson-12",
  number: 12,
  title: "Der Buchstabe Sin",
  subtitle: "Das scharfe „s“ – und drei Wörter, die mit Sin beginnen.",
  minutes: 10,
  letter: {
    glyph: "س",
    name: "Sin",
    nameArabic: "سِين",
    transliteration: "s",
    soundHint:
      "Ein scharfes, stimmloses „s“ wie in „Bus“ oder „Fluss“.",
    forms: [
      { label: "Allein", glyph: "س" },
      { label: "Anfang", glyph: "سـ" },
      { label: "Mitte", glyph: "ـسـ" },
      { label: "Ende", glyph: "ـس" },
    ],
    exercise: { id: "letter", target: "سين", modelText: "سِين" },
  },
  vocabulary: [
    {
      id: "samaka",
      arabic: "سَمَكَة",
      german: "der Fisch",
      transliteration: "samaka",
      image: { src: "/images/vocabulary/samaka.svg", alt: "Ein Fisch im Wasser" },
      exercise: { id: "samaka", target: "سمكة", modelText: "سَمَكَة" },
    },
    {
      id: "sayyara",
      arabic: "سَيَّارَة",
      german: "das Auto",
      transliteration: "sajjāra",
      image: { src: "/images/vocabulary/sayyara.svg", alt: "Ein rotes Auto" },
      exercise: { id: "sayyara", target: "سيارة", modelText: "سَيَّارَة" },
    },
    {
      id: "saa",
      arabic: "سَاعَة",
      german: "die Uhr",
      transliteration: "sāʿa",
      image: { src: "/images/vocabulary/saa.svg", alt: "Eine Wanduhr" },
      exercise: { id: "saa", target: "ساعة", modelText: "سَاعَة" },
    },
  ],
};
