import type { Lesson } from "@/data/types";

// A1 · Lesson 17 – the letter Ẓa (ظ).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson17: Lesson = {
  slug: "lesson-17",
  number: 17,
  title: "Der Buchstabe Ẓa",
  subtitle: "Das dunkle Dh – und drei Wörter, die mit Ẓa beginnen.",
  minutes: 10,
  letter: {
    glyph: "ظ",
    name: "Ẓa",
    nameArabic: "ظَاء",
    transliteration: "ẓ",
    soundHint:
      "Ein dunkles, „schweres“ dh: Die Zungenspitze liegt zwischen den Zähnen wie beim englischen „th“ in „this“, dazu hebt sich der hintere Zungenrücken. Die Vokale danach klingen dunkler.",
    forms: [
      { label: "Allein", glyph: "ظ" },
      { label: "Anfang", glyph: "ظـ" },
      { label: "Mitte", glyph: "ـظـ" },
      { label: "Ende", glyph: "ـظ" },
    ],
    exercise: { id: "letter", target: "ظاء", modelText: "ظَاء" },
  },
  vocabulary: [
    {
      id: "zarf",
      arabic: "ظَرْف",
      german: "der Briefumschlag",
      transliteration: "ẓarf",
      image: { src: "/images/vocabulary/zarf.svg", alt: "Ein Briefumschlag" },
      exercise: { id: "zarf", target: "ظرف", modelText: "ظَرْف" },
    },
    {
      id: "zufr",
      arabic: "ظُفْر",
      german: "der Fingernagel",
      transliteration: "ẓufr",
      image: { src: "/images/vocabulary/zufr.svg", alt: "Ein Finger mit Fingernagel" },
      exercise: { id: "zufr", target: "ظفر", modelText: "ظُفْر" },
    },
    {
      id: "zaby",
      arabic: "ظَبْي",
      german: "die Gazelle",
      transliteration: "ẓabj",
      image: { src: "/images/vocabulary/zaby.svg", alt: "Eine Gazelle" },
      exercise: { id: "zaby", target: "ظبي", modelText: "ظَبْي" },
    },
  ],
};
