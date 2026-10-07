import type { Lesson } from "@/data/types";

// A1 · Lesson 15 – the letter Ḍad (ض).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson15: Lesson = {
  slug: "lesson-15",
  number: 15,
  title: "Der Buchstabe Ḍad",
  subtitle: "Das dunkle D – und drei Wörter, die mit Ḍad beginnen.",
  minutes: 10,
  letter: {
    glyph: "ض",
    name: "Ḍad",
    nameArabic: "ضَاد",
    transliteration: "ḍ",
    soundHint:
      "Ein dunkles, „schweres“ d: wie „d“, aber der hintere Zungenrücken hebt sich an, und die Vokale danach klingen dunkler. Arabisch heißt auch „die Sprache des Ḍad“.",
    forms: [
      { label: "Allein", glyph: "ض" },
      { label: "Anfang", glyph: "ضـ" },
      { label: "Mitte", glyph: "ـضـ" },
      { label: "Ende", glyph: "ـض" },
    ],
    exercise: { id: "letter", target: "ضاد", modelText: "ضَاد" },
  },
  vocabulary: [
    {
      id: "difda",
      arabic: "ضِفْدَع",
      german: "der Frosch",
      transliteration: "ḍifdaʿ",
      image: { src: "/images/vocabulary/difda.svg", alt: "Ein grüner Frosch auf einem Seerosenblatt" },
      exercise: { id: "difda", target: "ضفدع", modelText: "ضِفْدَع" },
    },
    {
      id: "dirs",
      arabic: "ضِرْس",
      german: "der Backenzahn",
      transliteration: "ḍirs",
      image: { src: "/images/vocabulary/dirs.svg", alt: "Ein Backenzahn" },
      exercise: { id: "dirs", target: "ضرس", modelText: "ضِرْس" },
    },
    {
      id: "dabu",
      arabic: "ضَبُع",
      german: "die Hyäne",
      transliteration: "ḍabuʿ",
      image: { src: "/images/vocabulary/dabu.svg", alt: "Eine gefleckte Hyäne" },
      exercise: { id: "dabu", target: "ضبع", modelText: "ضَبُع" },
    },
  ],
};
