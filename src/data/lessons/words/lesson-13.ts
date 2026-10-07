import type { Lesson } from "@/data/types";

// A1 · Lesson 13 – the letter Schin (ش).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson13: Lesson = {
  slug: "lesson-13",
  number: 13,
  title: "Der Buchstabe Schin",
  subtitle: "Das „sch“ wie in „Schule“ – und drei Wörter, die mit Schin beginnen.",
  minutes: 10,
  letter: {
    glyph: "ش",
    name: "Schin",
    nameArabic: "شِين",
    transliteration: "sch",
    soundHint:
      "Wie das deutsche „sch“ in „Schule“.",
    forms: [
      { label: "Allein", glyph: "ش" },
      { label: "Anfang", glyph: "شـ" },
      { label: "Mitte", glyph: "ـشـ" },
      { label: "Ende", glyph: "ـش" },
    ],
    exercise: { id: "letter", target: "شين", modelText: "شِين" },
  },
  vocabulary: [
    {
      id: "shams",
      arabic: "شَمْس",
      german: "die Sonne",
      transliteration: "schams",
      image: { src: "/images/vocabulary/shams.svg", alt: "Eine lachende Sonne" },
      exercise: { id: "shams", target: "شمس", modelText: "شَمْس" },
    },
    {
      id: "shajara",
      arabic: "شَجَرَة",
      german: "der Baum",
      transliteration: "schadschara",
      image: { src: "/images/vocabulary/shajara.svg", alt: "Ein Baum mit grüner Krone" },
      exercise: { id: "shajara", target: "شجرة", modelText: "شَجَرَة" },
    },
    {
      id: "shay",
      arabic: "شَاي",
      german: "der Tee",
      transliteration: "schāi",
      image: { src: "/images/vocabulary/shay.svg", alt: "Ein Glas Tee" },
      exercise: { id: "shay", target: "شاي", modelText: "شَاي" },
    },
  ],
};
