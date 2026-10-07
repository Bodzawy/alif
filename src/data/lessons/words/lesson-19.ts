import type { Lesson } from "@/data/types";

// A1 · Lesson 19 – the letter Ghain (غ).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson19: Lesson = {
  slug: "lesson-19",
  number: 19,
  title: "Der Buchstabe Ghain",
  subtitle: "Das gegurgelte „r“ – und drei Wörter, die mit Ghain beginnen.",
  minutes: 10,
  letter: {
    glyph: "غ",
    name: "Ghain",
    nameArabic: "غَيْن",
    transliteration: "gh",
    soundHint:
      "Wie ein weiches, gegurgeltes Rachen-„r“, ähnlich dem französischen „r“ in „Paris“ – die stimmhafte Schwester von Cha (خ).",
    forms: [
      { label: "Allein", glyph: "غ" },
      { label: "Anfang", glyph: "غـ" },
      { label: "Mitte", glyph: "ـغـ" },
      { label: "Ende", glyph: "ـغ" },
    ],
    exercise: { id: "letter", target: "غين", modelText: "غَيْن" },
  },
  vocabulary: [
    {
      id: "ghurab",
      arabic: "غُرَاب",
      german: "der Rabe",
      transliteration: "ghurāb",
      image: { src: "/images/vocabulary/ghurab.svg", alt: "Ein schwarzer Rabe" },
      exercise: { id: "ghurab", target: "غراب", modelText: "غُرَاب" },
    },
    {
      id: "ghaima",
      arabic: "غَيْمَة",
      german: "die Wolke",
      transliteration: "ghaima",
      image: { src: "/images/vocabulary/ghaima.svg", alt: "Eine weiße Wolke am blauen Himmel" },
      exercise: { id: "ghaima", target: "غيمة", modelText: "غَيْمَة" },
    },
    {
      id: "ghassala",
      arabic: "غَسَّالَة",
      german: "die Waschmaschine",
      transliteration: "ghassāla",
      image: { src: "/images/vocabulary/ghassala.svg", alt: "Eine Waschmaschine" },
      exercise: { id: "ghassala", target: "غسالة", modelText: "غَسَّالَة" },
    },
  ],
};
