import type { Lesson } from "@/data/types";

// A1 · Lesson 24 – the letter Mim (م).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson24: Lesson = {
  slug: "lesson-24",
  number: 24,
  title: "Der Buchstabe Mim",
  subtitle: "Das arabische „m“ – und drei Wörter, die mit Mim beginnen.",
  minutes: 10,
  letter: {
    glyph: "م",
    name: "Mim",
    nameArabic: "مِيم",
    transliteration: "m",
    soundHint:
      "Wie das deutsche „m“ in „Mama“.",
    forms: [
      { label: "Allein", glyph: "م" },
      { label: "Anfang", glyph: "مـ" },
      { label: "Mitte", glyph: "ـمـ" },
      { label: "Ende", glyph: "ـم" },
    ],
    exercise: { id: "letter", target: "ميم", modelText: "مِيم" },
  },
  vocabulary: [
    {
      id: "mauza",
      arabic: "مَوْزَة",
      german: "die Banane",
      transliteration: "mauza",
      image: { src: "/images/vocabulary/mauza.svg", alt: "Eine gelbe Banane" },
      exercise: { id: "mauza", target: "موزة", modelText: "مَوْزَة" },
    },
    {
      id: "miftah",
      arabic: "مِفْتَاح",
      german: "der Schlüssel",
      transliteration: "miftāḥ",
      image: { src: "/images/vocabulary/miftah.svg", alt: "Ein Schlüssel" },
      exercise: { id: "miftah", target: "مفتاح", modelText: "مِفْتَاح" },
    },
    {
      id: "mizalla",
      arabic: "مِظَلَّة",
      german: "der Regenschirm",
      transliteration: "miẓalla",
      image: { src: "/images/vocabulary/mizalla.svg", alt: "Ein Regenschirm im Regen" },
      exercise: { id: "mizalla", target: "مظلة", modelText: "مِظَلَّة" },
    },
  ],
};
