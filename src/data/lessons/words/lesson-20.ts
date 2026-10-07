import type { Lesson } from "@/data/types";

// A1 · Lesson 20 – the letter Fa (ف).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson20: Lesson = {
  slug: "lesson-20",
  number: 20,
  title: "Der Buchstabe Fa",
  subtitle: "Das arabische „f“ – und drei Wörter, die mit Fa beginnen.",
  minutes: 10,
  letter: {
    glyph: "ف",
    name: "Fa",
    nameArabic: "فَاء",
    transliteration: "f",
    soundHint:
      "Wie das deutsche „f“ in „Fisch“.",
    forms: [
      { label: "Allein", glyph: "ف" },
      { label: "Anfang", glyph: "فـ" },
      { label: "Mitte", glyph: "ـفـ" },
      { label: "Ende", glyph: "ـف" },
    ],
    exercise: { id: "letter", target: "فاء", modelText: "فَاء" },
  },
  vocabulary: [
    {
      id: "fil",
      arabic: "فِيل",
      german: "der Elefant",
      transliteration: "fīl",
      image: { src: "/images/vocabulary/fil.svg", alt: "Ein grauer Elefant" },
      exercise: { id: "fil", target: "فيل", modelText: "فِيل" },
    },
    {
      id: "farasha",
      arabic: "فَرَاشَة",
      german: "der Schmetterling",
      transliteration: "farāscha",
      image: { src: "/images/vocabulary/farasha.svg", alt: "Ein bunter Schmetterling" },
      exercise: { id: "farasha", target: "فراشة", modelText: "فَرَاشَة" },
    },
    {
      id: "farawila",
      arabic: "فَرَاوِلَة",
      german: "die Erdbeere",
      transliteration: "farāwila",
      image: { src: "/images/vocabulary/farawila.svg", alt: "Eine rote Erdbeere" },
      exercise: { id: "farawila", target: "فراولة", modelText: "فَرَاوِلَة" },
    },
  ],
};
