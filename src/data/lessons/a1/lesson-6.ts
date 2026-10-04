import type { Lesson } from "@/data/types";

// A1 · Lesson 6 – the letter Ḥa (ح).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson6: Lesson = {
  slug: "lesson-6",
  number: 6,
  title: "Der Buchstabe Ḥa · das gehauchte H",
  subtitle: "Das gehauchte H aus der Kehle – und drei Wörter, die mit Ḥa beginnen.",
  minutes: 10,
  letter: {
    glyph: "ح",
    name: "Ḥa",
    nameArabic: "حَاء",
    transliteration: "ḥ",
    soundHint:
      "Ein kräftig gehauchtes „h“ aus der verengten Kehle – wie beim Anhauchen einer Brille, nur gepresster. Einen solchen Laut gibt es im Deutschen nicht.",
    forms: [
      { label: "Allein", glyph: "ح" },
      { label: "Anfang", glyph: "حـ" },
      { label: "Mitte", glyph: "ـحـ" },
      { label: "Ende", glyph: "ـح" },
    ],
    exercise: { id: "letter", target: "حاء", modelText: "حَاء" },
  },
  vocabulary: [
    {
      id: "hisan",
      arabic: "حِصَان",
      german: "das Pferd",
      transliteration: "ḥiṣān",
      image: { src: "/images/vocabulary/hisan.svg", alt: "Ein braunes Pferd" },
      exercise: { id: "hisan", target: "حصان", modelText: "حِصَان" },
    },
    {
      id: "hut",
      arabic: "حُوت",
      german: "der Wal",
      transliteration: "ḥūt",
      image: { src: "/images/vocabulary/hut.svg", alt: "Ein blauer Wal im Meer" },
      exercise: { id: "hut", target: "حوت", modelText: "حُوت" },
    },
    {
      id: "halib",
      arabic: "حَلِيب",
      german: "die Milch",
      transliteration: "ḥalīb",
      image: { src: "/images/vocabulary/halib.svg", alt: "Ein Glas Milch" },
      exercise: { id: "halib", target: "حليب", modelText: "حَلِيب" },
    },
  ],
};
