import type { Lesson } from "@/data/types";

// A1 · Lesson 27 – the letter Waw (و).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson27: Lesson = {
  slug: "lesson-27",
  number: 27,
  title: "Der Buchstabe Waw",
  subtitle: "Das „w“ wie im englischen „water“ – und drei Wörter, die mit Waw beginnen.",
  minutes: 10,
  letter: {
    glyph: "و",
    name: "Waw",
    nameArabic: "وَاو",
    transliteration: "w",
    soundHint:
      "Wie das englische „w“ in „water“, mit gerundeten Lippen – nicht wie das deutsche „w“. Als langer Vokal klingt es wie „u“.",
    forms: [
      { label: "Allein", glyph: "و" },
      { label: "Anfang", glyph: "و" },
      { label: "Mitte", glyph: "ـو" },
      { label: "Ende", glyph: "ـو" },
    ],
    exercise: { id: "letter", target: "واو", modelText: "وَاو" },
  },
  vocabulary: [
    {
      id: "warda",
      arabic: "وَرْدَة",
      german: "die Rose",
      transliteration: "warda",
      image: { src: "/images/vocabulary/warda.svg", alt: "Eine rote Rose" },
      exercise: { id: "warda", target: "وردة", modelText: "وَرْدَة" },
    },
    {
      id: "walad",
      arabic: "وَلَد",
      german: "der Junge",
      transliteration: "walad",
      image: { src: "/images/vocabulary/walad.svg", alt: "Ein Junge" },
      exercise: { id: "walad", target: "ولد", modelText: "وَلَد" },
    },
    {
      id: "wisada",
      arabic: "وِسَادَة",
      german: "das Kissen",
      transliteration: "wisāda",
      image: { src: "/images/vocabulary/wisada.svg", alt: "Ein Kissen" },
      exercise: { id: "wisada", target: "وسادة", modelText: "وِسَادَة" },
    },
  ],
};
