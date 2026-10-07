import type { Lesson } from "@/data/types";

// A1 · Lesson 8 – the letter Dal (د).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson8: Lesson = {
  slug: "lesson-8",
  number: 8,
  title: "Der Buchstabe Dal",
  subtitle: "Das arabische „d“ – und drei Wörter, die mit Dal beginnen.",
  minutes: 10,
  letter: {
    glyph: "د",
    name: "Dal",
    nameArabic: "دَال",
    transliteration: "d",
    soundHint:
      "Wie das deutsche „d“ in „Dach“ – auch am Wortende weich (nie wie „t“).",
    forms: [
      { label: "Allein", glyph: "د" },
      { label: "Anfang", glyph: "د" },
      { label: "Mitte", glyph: "ـد" },
      { label: "Ende", glyph: "ـد" },
    ],
    exercise: { id: "letter", target: "دال", modelText: "دَال" },
  },
  vocabulary: [
    {
      id: "dubb",
      arabic: "دُبّ",
      german: "der Bär",
      transliteration: "dubb",
      image: { src: "/images/vocabulary/dubb.svg", alt: "Ein brauner Bär" },
      exercise: { id: "dubb", target: "دب", modelText: "دُبّ" },
    },
    {
      id: "dajaja",
      arabic: "دَجَاجَة",
      german: "das Huhn",
      transliteration: "dadschādscha",
      image: { src: "/images/vocabulary/dajaja.svg", alt: "Ein Huhn" },
      exercise: { id: "dajaja", target: "دجاجة", modelText: "دَجَاجَة" },
    },
    {
      id: "darraja",
      arabic: "دَرَّاجَة",
      german: "das Fahrrad",
      transliteration: "darrādscha",
      image: { src: "/images/vocabulary/darraja.svg", alt: "Ein Fahrrad" },
      exercise: { id: "darraja", target: "دراجة", modelText: "دَرَّاجَة" },
    },
  ],
  // No chapters: the video has no chapter marks to take them from.
  introVideo: {
    src: "/videos/a1/lesson-8/de.mp4",
    poster: "/videos/a1/lesson-8/poster.jpg",
  },
};
