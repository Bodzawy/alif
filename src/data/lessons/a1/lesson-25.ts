import type { Lesson } from "@/data/types";

// A1 · Lesson 25 – the letter Nun (ن).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson25: Lesson = {
  slug: "lesson-25",
  number: 25,
  title: "Der Buchstabe Nun",
  subtitle: "Das arabische „n“ – und drei Wörter, die mit Nun beginnen.",
  minutes: 10,
  letter: {
    glyph: "ن",
    name: "Nun",
    nameArabic: "نُون",
    transliteration: "n",
    soundHint:
      "Wie das deutsche „n“ in „Nase“.",
    forms: [
      { label: "Allein", glyph: "ن" },
      { label: "Anfang", glyph: "نـ" },
      { label: "Mitte", glyph: "ـنـ" },
      { label: "Ende", glyph: "ـن" },
    ],
    exercise: { id: "letter", target: "نون", modelText: "نُون" },
  },
  vocabulary: [
    {
      id: "namir",
      arabic: "نَمِر",
      german: "der Tiger",
      transliteration: "namir",
      image: { src: "/images/vocabulary/namir.svg", alt: "Ein Tiger" },
      exercise: { id: "namir", target: "نمر", modelText: "نَمِر" },
    },
    {
      id: "nahla",
      arabic: "نَحْلَة",
      german: "die Biene",
      transliteration: "naḥla",
      image: { src: "/images/vocabulary/nahla.svg", alt: "Eine Biene" },
      exercise: { id: "nahla", target: "نحلة", modelText: "نَحْلَة" },
    },
    {
      id: "najma",
      arabic: "نَجْمَة",
      german: "der Stern",
      transliteration: "nadschma",
      image: { src: "/images/vocabulary/najma.svg", alt: "Ein gelber Stern" },
      exercise: { id: "najma", target: "نجمة", modelText: "نَجْمَة" },
    },
  ],
};
