import { baWriting } from "@/data/letters/ba";

import { letterLesson } from "../letter-lesson";

// A1 · Lektion 1 · Ba – book pages 4 and 5 (Lesson1.pdf). Words, spellings and
// order exactly as in the lesson brief. Pictures: the letter's own files in
// public/images/a1/<letter>/, or an existing picture of the same thing.

export const a1Ba = letterLesson({
  letter: { id: "ba", glyph: "ب", name: "Ba", latin: "b" },
  words: {
    fatha: [
      ["banat", "بَنَات", "Mädchen (Plural)", "Banāt", "Zwei Mädchen"],
      ["bayt", "بَيْت", "Haus", "Bayt", ["/images/vocabulary/bait.svg", "Ein kleines Haus mit rotem Dach"]],
      ["bab", "بَاب", "Tür", "Bāb", ["/images/vocabulary/bab.svg", "Eine geschlossene Holztür"]],
    ],
    kasra: [
      ["bint", "بِنْت", "Mädchen", "Bint", "Ein Mädchen"],
      ["bir", "بِئْر", "Brunnen", "Biʾr", "Ein Brunnen mit Eimer"],
      ["bitaqa", "بِطَاقَة", "Karte", "Biṭāqa", "Eine Karte"],
    ],
    damma: [
      ["bunduqiyya", "بُنْدُقِيَّة", "Gewehr", "Bunduqiyya", "Ein Gewehr"],
      ["burtuqal", "بُرْتُقَال", "Orangen", "Burtuqāl", "Orangen"],
      ["burj", "بُرْج", "Turm", "Burj", "Ein hoher Turm"],
    ],
  },
  forms: {
    start: ["bitaqa", "بِطَاقَة", "Karte"],
    middle: ["shubbak", "شِبَّاك", "Fenster"],
    end: ["kalb", "كَلْب", "Hund"],
    separate: ["kitab", "كِتَاب", "Buch"],
    sukun: ["nabq", "نَبْق", "Nabk-Frucht"],
  },
  writing: baWriting,
  formsPictures: {
    shubbak: "Ein offenes Fenster",
    kalb: ["/images/vocabulary/kalb.svg", "Ein Hund"],
    kitab: ["/images/vocabulary/kitab.svg", "Ein aufgeschlagenes Buch"],
    nabq: "Nabk-Früchte an einem Zweig",
  },
  gaps: {
    // Ergänzen – book تدريب ٢, in book order.
    fill: [
      ["_نَات", "بَنَات", "banat"],
      ["_يْت", "بَيْت", "bayt"],
      ["_ا_", "بَابْ", "bab"],
      ["_نْت", "بِنْت", "bint"],
      ["_ئْر", "بِئْر", "bir"],
      ["_طَاقَة", "بِطَاقَة", "bitaqa"],
      ["_نْدُقِيَّة", "بُنْدُقِيَّة", "bunduqiyya"],
      ["_رْتُقَال", "بُرْتُقَال", "burtuqal"],
      ["_رْج", "بُرْج", "burj"],
    ],
    // Hören – book تدريب ٣, in book order.
    // teacher check: the final ب of بَابْ and أَبْ is set to sukun (the book leaves the vowel of a word-final gap open).
    listen: [
      ["_نْت", "بِنْت", "bint"],
      ["_نْدُقِيَّة", "بُنْدُقِيَّة", "bunduqiyya"],
      ["_يْت", "بَيْت", "bayt"],
      ["أَ_", "أَبْ", "ab", "Vater", ["/images/a1/lesson-1/ab.svg", "Ein Vater"]],
      ["_ئْر", "بِئْر", "bir"],
      ["_رْج", "بُرْج", "burj"],
      ["_طَاقَة", "بِطَاقَة", "bitaqa"],
      ["_نَات", "بَنَات", "banat"],
      ["_ا_", "بَابْ", "bab"],
      ["نَ_ق", "نَبْق", "nabq"],
    ],
  },
});
