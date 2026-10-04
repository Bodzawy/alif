import type { Lesson } from "@/data/types";

// A1 · Lesson 28 – the letter Ya (ي).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson28: Lesson = {
  slug: "lesson-28",
  number: 28,
  title: "Der Buchstabe Ya",
  subtitle: "Das „j“ wie in „ja“ – und drei Wörter, die mit Ya beginnen.",
  minutes: 10,
  letter: {
    glyph: "ي",
    name: "Ya",
    nameArabic: "يَاء",
    transliteration: "j",
    soundHint:
      "Wie das deutsche „j“ in „ja“. Als langer Vokal klingt es wie „i“.",
    forms: [
      { label: "Allein", glyph: "ي" },
      { label: "Anfang", glyph: "يـ" },
      { label: "Mitte", glyph: "ـيـ" },
      { label: "Ende", glyph: "ـي" },
    ],
    exercise: { id: "letter", target: "ياء", modelText: "يَاء" },
  },
  vocabulary: [
    {
      id: "yad",
      arabic: "يَد",
      german: "die Hand",
      transliteration: "jad",
      image: { src: "/images/vocabulary/yad.svg", alt: "Eine offene Hand" },
      exercise: { id: "yad", target: "يد", modelText: "يَد" },
    },
    {
      id: "yaqtin",
      arabic: "يَقْطِين",
      german: "der Kürbis",
      transliteration: "jaqṭīn",
      image: { src: "/images/vocabulary/yaqtin.svg", alt: "Ein orangefarbener Kürbis" },
      exercise: { id: "yaqtin", target: "يقطين", modelText: "يَقْطِين" },
    },
    {
      id: "yamama",
      arabic: "يَمَامَة",
      german: "die Taube",
      transliteration: "jamāma",
      image: { src: "/images/vocabulary/yamama.svg", alt: "Eine Taube" },
      exercise: { id: "yamama", target: "يمامة", modelText: "يَمَامَة" },
    },
  ],
};
