import type { Lesson } from "@/data/types";

// A1 · Lesson 16 – the letter Ṭa (ط).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson16: Lesson = {
  slug: "lesson-16",
  number: 16,
  title: "Der Buchstabe Ṭa · das dunkle T",
  subtitle: "Das dunkle T – und drei Wörter, die mit Ṭa beginnen.",
  minutes: 10,
  letter: {
    glyph: "ط",
    name: "Ṭa",
    nameArabic: "طَاء",
    transliteration: "ṭ",
    soundHint:
      "Ein dunkles, „schweres“ t ohne Hauch: wie „t“, aber der hintere Zungenrücken hebt sich an. Die Vokale danach klingen dunkler.",
    forms: [
      { label: "Allein", glyph: "ط" },
      { label: "Anfang", glyph: "طـ" },
      { label: "Mitte", glyph: "ـطـ" },
      { label: "Ende", glyph: "ـط" },
    ],
    exercise: { id: "letter", target: "طاء", modelText: "طَاء" },
  },
  vocabulary: [
    {
      id: "taira",
      arabic: "طَائِرَة",
      german: "das Flugzeug",
      transliteration: "ṭāʾira",
      image: { src: "/images/vocabulary/taira.svg", alt: "Ein Flugzeug am Himmel" },
      exercise: { id: "taira", target: "طائرة", modelText: "طَائِرَة" },
    },
    {
      id: "tabl",
      arabic: "طَبْل",
      german: "die Trommel",
      transliteration: "ṭabl",
      image: { src: "/images/vocabulary/tabl.svg", alt: "Eine Trommel mit zwei Schlägeln" },
      exercise: { id: "tabl", target: "طبل", modelText: "طَبْل" },
    },
    {
      id: "tawus",
      arabic: "طَاوُوس",
      german: "der Pfau",
      transliteration: "ṭāwūs",
      image: { src: "/images/vocabulary/tawus.svg", alt: "Ein Pfau mit aufgefächerten Federn" },
      exercise: { id: "tawus", target: "طاووس", modelText: "طَاوُوس" },
    },
  ],
};
