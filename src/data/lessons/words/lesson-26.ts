import type { Lesson } from "@/data/types";

// A1 · Lesson 26 – the letter Ha (ه).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson26: Lesson = {
  slug: "lesson-26",
  number: 26,
  title: "Der Buchstabe Ha · das leichte H",
  subtitle: "Das leichte H – und drei Wörter, die mit Ha beginnen.",
  minutes: 10,
  letter: {
    glyph: "ه",
    name: "Ha",
    nameArabic: "هَاء",
    transliteration: "h",
    soundHint:
      "Wie das deutsche „h“ in „Haus“ – leicht gehaucht, aber auch in der Wortmitte und am Wortende hörbar.",
    forms: [
      { label: "Allein", glyph: "ه" },
      { label: "Anfang", glyph: "هـ" },
      { label: "Mitte", glyph: "ـهـ" },
      { label: "Ende", glyph: "ـه" },
    ],
    exercise: { id: "letter", target: "هاء", modelText: "هَاء" },
  },
  vocabulary: [
    {
      id: "hilal",
      arabic: "هِلَال",
      german: "der Halbmond",
      transliteration: "hilāl",
      image: { src: "/images/vocabulary/hilal.svg", alt: "Eine Mondsichel am Nachthimmel" },
      exercise: { id: "hilal", target: "هلال", modelText: "هِلَال" },
    },
    {
      id: "hatif",
      arabic: "هَاتِف",
      german: "das Telefon",
      transliteration: "hātif",
      image: { src: "/images/vocabulary/hatif.svg", alt: "Ein Telefon" },
      exercise: { id: "hatif", target: "هاتف", modelText: "هَاتِف" },
    },
    {
      id: "haram",
      arabic: "هَرَم",
      german: "die Pyramide",
      transliteration: "haram",
      image: { src: "/images/vocabulary/haram.svg", alt: "Eine Pyramide in der Wüste" },
      exercise: { id: "haram", target: "هرم", modelText: "هَرَم" },
    },
  ],
};
