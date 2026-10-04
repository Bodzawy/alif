import type { Lesson } from "@/data/types";

// A1 · Lesson 4 – the letter Tha (ث).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson4: Lesson = {
  slug: "lesson-4",
  number: 4,
  title: "Der Buchstabe Tha",
  subtitle: "Das „th“ wie im englischen „think“ – und drei Wörter, die mit Tha beginnen.",
  minutes: 10,
  letter: {
    glyph: "ث",
    name: "Tha",
    nameArabic: "ثَاء",
    transliteration: "th",
    soundHint:
      "Wie das englische „th“ in „think“: Die Zungenspitze liegt leicht zwischen den Zähnen, die Luft strömt stimmlos hindurch.",
    forms: [
      { label: "Allein", glyph: "ث" },
      { label: "Anfang", glyph: "ثـ" },
      { label: "Mitte", glyph: "ـثـ" },
      { label: "Ende", glyph: "ـث" },
    ],
    exercise: { id: "letter", target: "ثاء", modelText: "ثَاء" },
  },
  vocabulary: [
    {
      id: "thalab",
      arabic: "ثَعْلَب",
      german: "der Fuchs",
      transliteration: "thaʿlab",
      image: { src: "/images/vocabulary/thalab.svg", alt: "Ein roter Fuchs" },
      exercise: { id: "thalab", target: "ثعلب", modelText: "ثَعْلَب" },
    },
    {
      id: "thum",
      arabic: "ثُوم",
      german: "der Knoblauch",
      transliteration: "thūm",
      image: { src: "/images/vocabulary/thum.svg", alt: "Eine Knolle Knoblauch" },
      exercise: { id: "thum", target: "ثوم", modelText: "ثُوم" },
    },
    {
      id: "thalj",
      arabic: "ثَلْج",
      german: "der Schnee",
      transliteration: "thaldsch",
      image: { src: "/images/vocabulary/thalj.svg", alt: "Schneeflocken über einer verschneiten Landschaft" },
      exercise: { id: "thalj", target: "ثلج", modelText: "ثَلْج" },
    },
  ],
};
