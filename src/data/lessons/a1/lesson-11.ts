import type { Lesson } from "@/data/types";

// A1 · Lesson 11 – the letter Zay (ز).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson11: Lesson = {
  slug: "lesson-11",
  number: 11,
  title: "Der Buchstabe Zay",
  subtitle: "Das summende „s“ – und drei Wörter, die mit Zay beginnen.",
  minutes: 10,
  letter: {
    glyph: "ز",
    name: "Zay",
    nameArabic: "زَاي",
    transliteration: "z",
    soundHint:
      "Ein summendes, stimmhaftes „s“ wie in „Sonne“ – nicht wie das deutsche „z“ in „Zug“.",
    forms: [
      { label: "Allein", glyph: "ز" },
      { label: "Anfang", glyph: "ز" },
      { label: "Mitte", glyph: "ـز" },
      { label: "Ende", glyph: "ـز" },
    ],
    exercise: { id: "letter", target: "زاي", modelText: "زَاي" },
  },
  vocabulary: [
    {
      id: "zarafa",
      arabic: "زَرَافَة",
      german: "die Giraffe",
      transliteration: "zarāfa",
      image: { src: "/images/vocabulary/zarafa.svg", alt: "Eine Giraffe" },
      exercise: { id: "zarafa", target: "زرافة", modelText: "زَرَافَة" },
    },
    {
      id: "zaituna",
      arabic: "زَيْتُونَة",
      german: "die Olive",
      transliteration: "zaitūna",
      image: { src: "/images/vocabulary/zaituna.svg", alt: "Grüne Oliven an einem Zweig" },
      exercise: { id: "zaituna", target: "زيتونة", modelText: "زَيْتُونَة" },
    },
    {
      id: "zahra",
      arabic: "زَهْرَة",
      german: "die Blume",
      transliteration: "zahra",
      image: { src: "/images/vocabulary/zahra.svg", alt: "Eine Blume" },
      exercise: { id: "zahra", target: "زهرة", modelText: "زَهْرَة" },
    },
  ],
};
