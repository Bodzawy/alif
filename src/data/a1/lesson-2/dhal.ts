import { dhalWriting } from "@/data/letters/dhal";

import { lesson2Letter } from "./letter-entry";

// A1 · Lektion 2 · Dhal (ذ) – "مساء الخير.pdf", pages 26–28. Words, order and
// exercises as in the book; تدريب ٤ keeps the book's repeated words (بُذُور and
// ذَهَبَ appear twice). Completed signs: the Dhal of every word in تدريب ٤,
// هَذِهِ (book: هَذه), حَذِرَ (book: حَذرَ), a word-final consonant with Sukun.
// The pronunciation check cannot hear ذ itself (IQRA does not output it
// reliably): ذ-words are checked by their other consonants.

export const a1Dhal = lesson2Letter({
  letter: { id: "dhal", glyph: "ذ", name: "Dhal", nameArabic: "الذَّالِ", latin: "dh" },
  words: {
    fatha: [
      ["dhaqn", "ذَقْن", "Kinn", "Dhaqn", "Ein Kinn mit Bart"],
      ["dhahab", "ذَهَب", "Gold", "Dhahab", "Goldbarren"],
      ["dhayl", "ذَيْل", "Schwanz", "Dhayl", "Der Schweif eines Pferdes"],
    ],
    kasra: [
      ["dhib", "ذِئْب", "Wolf", "Dhiʾb", ["/images/vocabulary/dhib.svg", "Ein grauer Wolf"]],
      ["dhiraa", "ذِرَاع", "Arm", "Dhirāʿ", "Ein ausgestreckter Arm"],
      ["dhiab", "ذِئَاب", "Wölfe", "Dhiʾāb", "Drei Wölfe"],
    ],
    damma: [
      ["dhura", "ذُرَة", "Mais", "Dhura", ["/images/vocabulary/dhura.svg", "Ein Maiskolben"]],
      ["dhubaba", "ذُبَابَة", "Fliege", "Dhubāba", ["/images/vocabulary/dhubaba.svg", "Eine Fliege"]],
      ["dhubab", "ذُبَاب", "Fliegen", "Dhubāb", "Viele Fliegen"],
    ],
  },
  positions: {
    rule: { arabic: "يُلَاحَظُ: الْحَرْفُ لَا يَقْبَلُ الِاتِّصَالَ إِلَّا مِنَ الْيَمِينِ.", german: "Beachte: Das Dhal verbindet sich nur mit dem Buchstaben rechts davor – nie mit dem nächsten." },
    items: [
      { id: "start", label: "فِي أَوَّلِ الْكَلِمَةِ", labelGerman: "am Wortanfang", shape: "ذ", word: "ذَقْن", german: "Kinn" },
      { id: "end", label: "فِي آخِرِ الْكَلِمَةِ", labelGerman: "am Wortende", shape: "ـذ", word: "أَخَذَ", german: "er nahm" },
      { id: "separate", label: "مُنْفَصِلَة", labelGerman: "allein", shape: "ذ", word: "ذُرَة", german: "Mais" },
    ],
    sukun: { glyph: "ذْ", word: "إِذْن", german: "Erlaubnis" },
  },
  writing: dhalWriting,
  fill: [
    ["_رَاع", "ذِرَاع", "dhiraa"],
    ["_بَابَة", "ذُبَابَة", "dhubaba"],
    ["_قْن", "ذَقْن", "dhaqn"],
    ["_هَب", "ذَهَب", "dhahab"],
    ["_يْل", "ذَيْل", "dhayl"],
    ["_ئْب", "ذِئْب", "dhib"],
    ["_رَة", "ذُرَة", "dhura"],
    ["_بَاب", "ذُبَاب", "dhubab"],
    ["_ئَاب", "ذِئَاب", "dhiab"],
  ],
  listenChoicesLabel: "(ذَ / ذِ / ذُ / ذْ)",
  listen: [
    ["_هَب", "ذَهَب", "dhahab"],
    ["_بَابَة", "ذُبَابَة", "dhubaba"],
    ["_يْل", "ذَيْل", "dhayl"],
    ["_رَاع", "ذِرَاع", "dhiraa"],
    ["_بَاب", "ذُبَاب", "dhubab"],
    ["_ئَاب", "ذِئَاب", "dhiab"],
    ["_قْن", "ذَقْن", "dhaqn"],
    ["_ئْب", "ذِئْب", "dhib"],
    ["_رَة", "ذُرَة", "dhura"],
    ["إِ_ن", "إِذْن", "idhn", "Erlaubnis"],
  ],
  repeatWrite: [
    ["بُذُور", "budhur", "Samen"],
    ["ذَيْل", "dhayl", "Schwanz"],
    ["هَذَا", "hadha", "dieser"],
    ["هَذِهِ", "hadhihi", "diese"],
    ["ذَهَبَ", "dhahaba", "er ging"],
    ["ذُبَاب", "dhubab", "Fliegen"],
    ["بُذُور", "budhur", "Samen"],
    ["حِذَاء", "hidhaa", "Schuh"],
    ["ذَبَحَ", "dhabaha", "er schlachtete"],
    ["نَذَرَ", "nadhara", "er gelobte"],
    ["خَذَلَ", "khadhala", "er ließ im Stich"],
    ["قَذَفَ", "qadhafa", "er warf"],
    ["حَذِرَ", "hadhira", "er war vorsichtig"],
    ["ذُو", "dhu", "Besitzer von"],
    ["ذِي", "dhi", "Besitzer von (andere Form)"],
    ["أَخَذَ", "akhadha", "er nahm"],
    ["ذَهَبَ", "dhahaba", "er ging"],
    ["ذَهَاب", "dhahaab", "das Gehen"],
    ["لَذِيذْ", "ladhidh", "lecker"],
    ["حَذَفَ", "hadhafa", "er strich (weg)"],
    ["ذَا", "dha", "dieser (in Ausdrücken wie مَاذَا)"],
  ],
  pronounce: ["ذُ", "ذَ", "ذِ"],
  dictationLetters: ["أ", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ"],
  notes: {
    dictation:
      "Im Buch fehlen hier ganze Wörter (nur ein paar Buchstaben stehen schon da). Die Lösungswörter stehen unter „حَلُّ تَدْرِيبِ (٩)“. Ein Buchstabe am Wortende ohne Vokal wird mit Sukun geschrieben.",
  },
  dictation: [
    ["___ر", "بِذَار", "bidhar", "Saatgut"],
    ["__فَ", "حَذَفَ", "hadhafa", "er strich (weg)"],
    ["___", "تَاجْ", "taj", "Krone"],
    ["___", "أَخَذَ", "akhadha", "er nahm"],
    ["_وَ__", "ثَوَابْ", "thawab", "Belohnung"],
    ["____", "ذُبَابْ", "dhubab", "Fliegen"],
    ["___", "تَابَ", "taba", "er bereute"],
    ["__ن", "ابْن", "ibn", "Sohn"],
    ["___", "خَابَ", "khaba", "er scheiterte"],
    ["__ر", "دَار", "dar", "Haus"],
  ],
});
