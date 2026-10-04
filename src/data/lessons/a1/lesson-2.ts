import type { Lesson } from "@/data/types";

// A1 · Lesson 2 – the letter Ba (ب).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson2: Lesson = {
  slug: "lesson-2",
  number: 2,
  title: "Der Buchstabe Ba",
  subtitle: "Das arabische „b“ – und drei Wörter, die mit Ba beginnen.",
  minutes: 10,
  letter: {
    glyph: "ب",
    name: "Ba",
    nameArabic: "بَاء",
    transliteration: "b",
    soundHint:
      "Wie das deutsche „b“ in „Ball“ – aber immer weich und stimmhaft, auch am Wortende (nie wie „p“).",
    forms: [
      { label: "Allein", glyph: "ب" },
      { label: "Anfang", glyph: "بـ" },
      { label: "Mitte", glyph: "ـبـ" },
      { label: "Ende", glyph: "ـب" },
    ],
    exercise: { id: "letter", target: "باء", modelText: "بَاء" },
  },
  vocabulary: [
    {
      id: "bait",
      arabic: "بَيْت",
      german: "das Haus",
      transliteration: "bait",
      image: { src: "/images/vocabulary/bait.svg", alt: "Ein kleines Haus mit rotem Dach" },
      exercise: { id: "bait", target: "بيت", modelText: "بَيْت" },
    },
    {
      id: "bab",
      arabic: "بَاب",
      german: "die Tür",
      transliteration: "bāb",
      image: { src: "/images/vocabulary/bab.svg", alt: "Eine geschlossene Holztür" },
      exercise: { id: "bab", target: "باب", modelText: "بَاب" },
    },
    {
      id: "batta",
      arabic: "بَطَّة",
      german: "die Ente",
      transliteration: "baṭṭa",
      image: { src: "/images/vocabulary/batta.svg", alt: "Eine gelbe Ente auf dem Wasser" },
      exercise: { id: "batta", target: "بطة", modelText: "بَطَّة" },
    },
  ],
};
