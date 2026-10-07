import type { Lesson } from "@/data/types";

// A1 · Lesson 22 – the letter Kaf (ك).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson22: Lesson = {
  slug: "lesson-22",
  number: 22,
  title: "Der Buchstabe Kaf",
  subtitle: "Das arabische „k“ – und drei Wörter, die mit Kaf beginnen.",
  minutes: 10,
  letter: {
    glyph: "ك",
    name: "Kaf",
    nameArabic: "كَاف",
    transliteration: "k",
    soundHint:
      "Wie das deutsche „k“ in „Kind“.",
    forms: [
      { label: "Allein", glyph: "ك" },
      { label: "Anfang", glyph: "كـ" },
      { label: "Mitte", glyph: "ـكـ" },
      { label: "Ende", glyph: "ـك" },
    ],
    exercise: { id: "letter", target: "كاف", modelText: "كَاف" },
  },
  vocabulary: [
    {
      id: "kalb",
      arabic: "كَلْب",
      german: "der Hund",
      transliteration: "kalb",
      image: { src: "/images/vocabulary/kalb.svg", alt: "Ein Hund" },
      exercise: { id: "kalb", target: "كلب", modelText: "كَلْب" },
    },
    {
      id: "kitab",
      arabic: "كِتَاب",
      german: "das Buch",
      transliteration: "kitāb",
      image: { src: "/images/vocabulary/kitab.svg", alt: "Ein aufgeschlagenes Buch" },
      exercise: { id: "kitab", target: "كتاب", modelText: "كِتَاب" },
    },
    {
      id: "kura",
      arabic: "كُرَة",
      german: "der Ball",
      transliteration: "kura",
      image: { src: "/images/vocabulary/kura.svg", alt: "Ein bunter Ball" },
      exercise: { id: "kura", target: "كرة", modelText: "كُرَة" },
    },
  ],
};
