import { taWriting } from "@/data/letters/ta";

import { letterLesson } from "../letter-lesson";

// A1 · Lektion 1 · Ta – book pages 6 and 7 (Lesson1.pdf). Words, spellings and
// order exactly as in the lesson brief. Pictures: the letter's own files in
// public/images/a1/<letter>/, or an existing picture of the same thing.

export const a1Ta = letterLesson({
  letter: { id: "ta", glyph: "ت", name: "Ta", latin: "t" },
  words: {
    fatha: [
      ["taj", "تَاج", "Krone", "Tāj", ["/images/vocabulary/taj.svg", "Eine goldene Krone"]],
      ["tamr", "تَمْر", "Datteln", "Tamr", "Datteln"],
      ["tall", "تَلّ", "Hügel", "Tall", "Ein grüner Hügel"],
    ],
    kasra: [
      ["tilifun", "تِلِيفُون", "Telefon", "Tilīfūn", ["/images/vocabulary/hatif.svg", "Ein Telefon"]],
      ["timthal", "تِمْثَال", "Statue", "Timthāl", "Eine Statue"],
      ["tin", "تِين", "Feigen", "Tīn", "Feigen"],
    ],
    damma: [
      ["tuffaha", "تُفَّاحَة", "Apfel", "Tuffāḥa", ["/images/vocabulary/tuffaha.svg", "Ein roter Apfel mit Blatt"]],
      ["tut", "تُوت", "Beeren", "Tūt", "Beeren"],
      ["tuna", "تُونَة", "Thunfisch", "Tūna", "Ein Thunfisch"],
    ],
  },
  forms: {
    start: ["tilifun", "تِلِيفُونُ", "Telefon"],
    middle: ["kitab", "كِتَاب", "Buch"],
    end: ["bint", "بِنْت", "Mädchen"],
    separate: ["banat", "بَنَات", "Mädchen (Plural)"],
    sukun: ["fatq", "فَتْق", "Riss"],
  },
  writing: taWriting,
  formsPictures: {
    kitab: ["/images/vocabulary/kitab.svg", "Ein aufgeschlagenes Buch"],
    bint: ["/images/a1/ba/bint.svg", "Ein Mädchen"],
    banat: ["/images/a1/ba/banat.svg", "Zwei Mädchen"],
    fatq: "Ein Riss in einem Stoff",
  },
  gaps: {
    // Ergänzen – book تدريب ٢, in book order.
    fill: [
      ["فَ_ق", "فَتْق", "fatq"],
      ["_ين", "تِين", "tin"],
      ["_اج", "تَاج", "taj"],
      ["_مْر", "تَمْر", "tamr"],
      ["_مْثَال", "تِمْثَال", "timthal"],
      ["_ونَة", "تُونَة", "tuna"],
      ["_لِيفُونُ", "تِلِيفُونُ", "tilifun"],
      ["_فَّاحَة", "تُفَّاحَة", "tuffaha"],
      ["_وت", "تُوت", "tut"],
    ],
    // Hören – book تدريب ٣, in book order.
    listen: [
      ["_مْر", "تَمْر", "tamr"],
      ["_لِيفُونُ", "تِلِيفُونُ", "tilifun"],
      ["_اج", "تَاج", "taj"],
      ["_ونَة", "تُونَة", "tuna"],
      ["_مْثَال", "تِمْثَال", "timthal"],
      ["_فَّاحَة", "تُفَّاحَة", "tuffaha"],
      ["_لّ", "تَلّ", "tall"],
      ["_ين", "تِين", "tin"],
      ["_وت", "تُوت", "tut"],
      ["فَ_ق", "فَتْق", "fatq"],
    ],
  },
  // "Mädchen (Plural)" is not a sentence to read aloud.
  texts: { e_separate_a: "Das letzte Wort bedeutet: viele Mädchen. Hier sind seine Buchstaben. Jetzt setzen wir sie zusammen." },
});
