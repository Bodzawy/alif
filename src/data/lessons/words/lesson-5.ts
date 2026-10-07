import type { Lesson } from "@/data/types";

// A1 · Lesson 5 – the letter Dschim (ج).
// Letter exercise: the letter name from src/lib/pronunciation/letters.ts (rules in
// letter_conditions.json); each word has its own rules in vocabulary_conditions.json.
// Words, vowels and texts: see REVIEW.md (needs native-speaker review).
export const lesson5: Lesson = {
  slug: "lesson-5",
  number: 5,
  title: "Der Buchstabe Dschim",
  subtitle: "Das „dsch“ wie in „Dschungel“ – und drei Wörter, die mit Dschim beginnen.",
  minutes: 10,
  letter: {
    glyph: "ج",
    name: "Dschim",
    nameArabic: "جِيم",
    transliteration: "dsch",
    soundHint:
      "Wie „dsch“ in „Dschungel“. In Ägypten klingt es wie ein hartes „g“ – hier lernst du die Hochsprache mit „dsch“.",
    forms: [
      { label: "Allein", glyph: "ج" },
      { label: "Anfang", glyph: "جـ" },
      { label: "Mitte", glyph: "ـجـ" },
      { label: "Ende", glyph: "ـج" },
    ],
    exercise: { id: "letter", target: "جيم", modelText: "جِيم" },
  },
  vocabulary: [
    {
      id: "jamal",
      arabic: "جَمَل",
      german: "das Kamel",
      transliteration: "dschamal",
      image: { src: "/images/vocabulary/jamal.svg", alt: "Ein Kamel in der Wüste" },
      exercise: { id: "jamal", target: "جمل", modelText: "جَمَل" },
    },
    {
      id: "jazara",
      arabic: "جَزَرَة",
      german: "die Karotte",
      transliteration: "dschazara",
      image: { src: "/images/vocabulary/jazara.svg", alt: "Eine orange Karotte mit grünem Kraut" },
      exercise: { id: "jazara", target: "جزرة", modelText: "جَزَرَة" },
    },
    {
      id: "jabal",
      arabic: "جَبَل",
      german: "der Berg",
      transliteration: "dschabal",
      image: { src: "/images/vocabulary/jabal.svg", alt: "Ein Berg mit schneebedeckter Spitze" },
      exercise: { id: "jabal", target: "جبل", modelText: "جَبَل" },
    },
  ],
  // No chapters: the video has no chapter marks to take them from.
  introVideo: {
    src: "/videos/a1/lesson-5/de.mp4",
    poster: "/videos/a1/lesson-5/poster.jpg",
  },
};
