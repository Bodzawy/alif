import type { Lesson } from "@/data/types";

// A1 · Lesson 18 – the letter ʿAin (ع).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson18: Lesson = {
  slug: "lesson-18",
  number: 18,
  title: "Der Buchstabe ʿAin",
  subtitle: "Der gepresste Kehllaut – und drei Wörter, die mit ʿAin beginnen.",
  minutes: 10,
  letter: {
    glyph: "ع",
    name: "ʿAin",
    nameArabic: "عَيْن",
    transliteration: "ʿ",
    soundHint:
      "Ein gepresster, stimmhafter Laut tief aus der Kehle, den es im Deutschen nicht gibt: Die Kehle wird kurz eng, die Stimme klingt dabei weiter. Hör ihn dir oft an und ahme ihn nach.",
    forms: [
      { label: "Allein", glyph: "ع" },
      { label: "Anfang", glyph: "عـ" },
      { label: "Mitte", glyph: "ـعـ" },
      { label: "Ende", glyph: "ـع" },
    ],
    exercise: { id: "letter", target: "عين", modelText: "عَيْن" },
  },
  vocabulary: [
    {
      id: "inab",
      arabic: "عِنَب",
      german: "die Weintrauben",
      transliteration: "ʿinab",
      image: { src: "/images/vocabulary/inab.svg", alt: "Eine Rebe mit lila Weintrauben" },
      exercise: { id: "inab", target: "عنب", modelText: "عِنَب" },
    },
    {
      id: "usfur",
      arabic: "عُصْفُور",
      german: "der Spatz",
      transliteration: "ʿuṣfūr",
      image: { src: "/images/vocabulary/usfur.svg", alt: "Ein kleiner Spatz auf einem Ast" },
      exercise: { id: "usfur", target: "عصفور", modelText: "عُصْفُور" },
    },
    {
      id: "asal",
      arabic: "عَسَل",
      german: "der Honig",
      transliteration: "ʿasal",
      image: { src: "/images/vocabulary/asal.svg", alt: "Ein Glas Honig" },
      exercise: { id: "asal", target: "عسل", modelText: "عَسَل" },
    },
  ],
};
