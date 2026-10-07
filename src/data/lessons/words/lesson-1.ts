import type { Lesson } from "@/data/types";

// A0 · Lesson 1 – the letter Alif with hamza (أ).
// The letter exercise uses the original letter target "ألف" (rules from
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
export const lesson1: Lesson = {
  slug: "lesson-1",
  number: 1,
  title: "Der Buchstabe Alif",
  subtitle: "Dein erster arabischer Buchstabe und drei Wörter, die mit ihm beginnen.",
  minutes: 10,
  letter: {
    glyph: "أَ",
    name: "Alif",
    nameArabic: "أَلِف",
    transliteration: "a",
    soundHint:
      "Mit Hamza (ء) und Fatha (ـَ) klingt Alif wie das kurze „a“ in „Apfel“ – mit einem kurzen, festen Stimmeinsatz davor, wie in „be-achten“.",
    forms: [
      { label: "Allein", glyph: "أ" },
      { label: "Anfang", glyph: "أ" },
      { label: "Mitte", glyph: "ـأ" },
      { label: "Ende", glyph: "ـأ" },
    ],
    exercise: { id: "letter", target: "ألف", modelText: "أَلِف" },
  },
  vocabulary: [
    {
      id: "asad",
      arabic: "أَسَد",
      german: "der Löwe",
      transliteration: "asad",
      image: { src: "/images/vocabulary/asad.svg", alt: "Ein freundlicher Löwe" },
      exercise: { id: "asad", target: "أسد", modelText: "أَسَد" },
    },
    {
      id: "arnab",
      arabic: "أَرْنَب",
      german: "der Hase",
      transliteration: "arnab",
      image: { src: "/images/vocabulary/arnab.svg", alt: "Ein Hase mit langen Ohren" },
      exercise: { id: "arnab", target: "أرنب", modelText: "أَرْنَب" },
    },
    {
      id: "ananas",
      arabic: "أَنَانَاس",
      german: "die Ananas",
      transliteration: "ananās",
      image: { src: "/images/vocabulary/ananas.svg", alt: "Eine reife Ananas" },
      exercise: { id: "ananas", target: "أناناس", modelText: "أَنَانَاس" },
    },
  ],
  introVideo: {
    src: "/videos/a1/lesson-1/de.mp4",
    poster: "/videos/a1/lesson-1/poster.jpg",
    chapters: [
      { start: 0, title: "Einführung" },
      { start: 5, title: "Der erste Buchstabe" },
      { start: 12, title: "Der Laut" },
      { start: 27, title: "Erstes Wort" },
      { start: 46, title: "Zweites Wort" },
      { start: 60, title: "Drittes Wort" },
      { start: 72, title: "Vergleich" },
      { start: 91, title: "Du bist dran" },
      { start: 114, title: "Los geht's" },
    ],
  },
};
