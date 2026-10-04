import type { Lesson } from "@/data/types";

// A1 · Lesson 14 – the letter Ṣad (ص).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson14: Lesson = {
  slug: "lesson-14",
  number: 14,
  title: "Der Buchstabe Ṣad",
  subtitle: "Das dunkle S – und drei Wörter, die mit Ṣad beginnen.",
  minutes: 10,
  letter: {
    glyph: "ص",
    name: "Ṣad",
    nameArabic: "صَاد",
    transliteration: "ṣ",
    soundHint:
      "Ein dunkles, „schweres“ s: Die Zungenspitze bildet ein „s“, der hintere Zungenrücken hebt sich dabei an. Dadurch klingen die Vokale danach dunkler.",
    forms: [
      { label: "Allein", glyph: "ص" },
      { label: "Anfang", glyph: "صـ" },
      { label: "Mitte", glyph: "ـصـ" },
      { label: "Ende", glyph: "ـص" },
    ],
    exercise: { id: "letter", target: "صاد", modelText: "صَاد" },
  },
  vocabulary: [
    {
      id: "saqr",
      arabic: "صَقْر",
      german: "der Falke",
      transliteration: "ṣaqr",
      image: { src: "/images/vocabulary/saqr.svg", alt: "Ein Falke" },
      exercise: { id: "saqr", target: "صقر", modelText: "صَقْر" },
    },
    {
      id: "sunduq",
      arabic: "صُنْدُوق",
      german: "die Kiste",
      transliteration: "ṣundūq",
      image: { src: "/images/vocabulary/sunduq.svg", alt: "Eine Holzkiste" },
      exercise: { id: "sunduq", target: "صندوق", modelText: "صُنْدُوق" },
    },
    {
      id: "sabun",
      arabic: "صَابُون",
      german: "die Seife",
      transliteration: "ṣābūn",
      image: { src: "/images/vocabulary/sabun.svg", alt: "Ein Stück Seife mit Schaumblasen" },
      exercise: { id: "sabun", target: "صابون", modelText: "صَابُون" },
    },
  ],
};
