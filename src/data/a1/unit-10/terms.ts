import type { A1Lesson } from "@/data/types";

// "مصطلحات مفيدة – Useful Grammar Terms" (book page 303, PDF 335), the book's
// order; German instead of the book's English. The glossary that follows
// (pp. 304–322, Arabic – English) is not reproduced: every word of it is
// taught in the lessons.

const TERMS: Array<[arabic: string, english: string, german: string]> = [
  ["قَوَاعِدُ الْعَرَبِيَّةِ", "Arabic grammar", "arabische Grammatik"],
  ["مُذَكَّر", "Masculine", "männlich"],
  ["مُؤَنَّث", "Feminine", "weiblich"],
  ["اسْمُ الْإِشَارَةِ", "Demonstrative pronoun", "Demonstrativpronomen (hādhā / hādhihi)"],
  ["صِفَةُ النَّسَبِ", "Relative adjective", "Nisba-Adjektiv (Herkunft)"],
  ["حَرْف", "Letter", "Buchstabe"],
  ["كَلِمَة", "Word", "Wort"],
  ["سُؤَال", "Question", "Frage"],
  ["جُمْلَة", "Sentence", "Satz"],
  ["أَدَوَاتُ الِاسْتِفْهَامِ", "Interrogation", "Fragewörter"],
  ["نَفْي", "Negation", "Verneinung"],
  ["ضَمِيرٌ مُنْفَصِلٌ", "Independent pronoun", "selbstständiges Pronomen (anā, huwa …)"],
  ["ضَمِيرٌ مُتَّصِلٌ", "Bound pronoun", "angehängtes Pronomen (‑ī, ‑hu …)"],
  ["ضَمِيرُ مِلْكِيَّةٍ", "Possessive pronoun", "Possessivendung"],
  ["مُفْرَد", "Singular", "Einzahl"],
  ["مُثَنًّى", "Dual", "Zweizahl"],
  ["جَمْع", "Plural", "Mehrzahl"],
  ["ظَرْفُ الْمَكَانِ", "Preposition of place", "Ortsangabe (amāma, khalfa …)"],
  ["حَرْفُ جَرٍّ", "Preposition", "Präposition (fī, ʿalā …)"],
  ["نَكِرَة", "Indefinite", "unbestimmt"],
  ["مَعْرِفَة", "Definite", "bestimmt"],
  ["حُرُوفٌ شَمْسِيَّةٌ", "Sun letters", "Sonnenbuchstaben"],
  ["حُرُوفٌ قَمَرِيَّةٌ", "Moon letters", "Mondbuchstaben"],
  ["اسْم", "Noun", "Nomen"],
];

export const a1Terms: A1Lesson = {
  slug: "mustalahat",
  kind: "review",
  label: "مُصْطَلَحَاتٌ مُفِيدَةٌ",
  labelGerman: "Grammatikbegriffe",
  steps: [
    {
      kind: "table",
      slug: "step-1",
      title: "Nützliche Grammatikbegriffe",
      navLabel: "Begriffe",
      instruction: { arabic: "مُصْطَلَحَاتٌ مُفِيدَةٌ", german: "Die Grammatikbegriffe des Buchs – arabisch und deutsch (im Buch englisch).", note: "Das Wörterverzeichnis des Buchs (S. 304–322, Arabisch – Englisch) ist hier nicht abgebildet; alle Wörter kommen in den Lektionen vor." },
      tables: [{ id: "terms", titleArabic: "مُصْطَلَحَاتٌ مُفِيدَةٌ – Useful Grammar Terms", title: "Grammatikbegriffe", columns: [{ arabic: "الْمُصْطَلَحُ", german: "arabisch" }, { arabic: "English", german: "englisch (im Buch)" }], rows: TERMS.map(([a, e, g]) => [{ arabic: a, german: g }, { arabic: e, listen: false }]) }],
      quiz: [
        { id: "dual", prompt: "„Zweizahl“", options: ["مُفْرَد", "مُثَنًّى", "جَمْع"], answer: 1 },
        { id: "neg", prompt: "„Verneinung“", options: ["نَفْي", "سُؤَال", "نَكِرَة"], answer: 0 },
        { id: "sun", prompt: "„Sonnenbuchstaben“", options: ["حُرُوفٌ قَمَرِيَّةٌ", "حُرُوفٌ شَمْسِيَّةٌ"], answer: 1 },
      ],
    },
  ],
};
