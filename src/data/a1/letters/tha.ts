import { thaWriting } from "@/data/letters/tha";

import { letterLesson } from "../letter-lesson";

// A1 · Lektion 1 · Tha – book pages 8 and 9 (Lesson1.pdf). Words, spellings and
// order exactly as in the lesson brief. Pictures: the letter's own files in
// public/images/a1/<letter>/, or an existing picture of the same thing.
// ثُلُث and أَثَاث have two ث: the book's position is the last one (-1).

export const a1Tha = letterLesson({
  letter: { id: "tha", glyph: "ث", name: "Tha", latin: "th" },
  words: {
    fatha: [
      ["thawb", "ثَوْب", "Gewand", "Thawb", "Ein langes Gewand"],
      ["thawm", "ثَوْم", "Knoblauch", "Thawm", ["/images/vocabulary/thum.svg", "Eine Knolle Knoblauch"]],
      ["thalatha", "ثَلَاثَة", "drei", "Thalātha", "Drei Äpfel und die Zahl 3"],
    ],
    kasra: [
      ["thiyab", "ثِيَاب", "Kleider", "Thiyāb", "Kleider auf Bügeln"],
      ["thimar", "ثِمَار", "Früchte", "Thimār", "Ein Korb mit Früchten"],
      ["thiqab", "ثِقَاب", "Streichhölzer", "Thiqāb", "Streichhölzer"],
    ],
    damma: [
      ["thuluth", "ثُلُث", "Drittel", "Thuluth", "Ein Kreis, ein Drittel ist gefärbt"],
      ["thuban", "ثُعْبَان", "Schlange", "Thuʿbān", "Eine Schlange"],
      ["thuqb", "ثُقْب", "Loch", "Thuqb", "Ein Loch in einer Wand"],
    ],
  },
  forms: {
    start: ["thawb", "ثَوْب", "Gewand"],
    middle: ["aththulatha", "الثُّلَاثَاءُ", "Dienstag"],
    end: ["thuluth", "ثُلُث", "Drittel", -1],
    separate: ["athath", "أَثَاث", "Möbel", -1],
    sukun: ["athna", "أَثْنَاءَ", "während"],
  },
  writing: thaWriting,
  formsPictures: {
    aththulatha: "Ein Kalenderblatt: Dienstag",
    athath: "Möbel: Sofa, Tisch und Lampe",
  },
  gaps: {
    // Ergänzen – book تدريب ٢, in book order.
    fill: [
      ["_لَا_ة", "ثَلَاثَة", "thalatha"],
      ["_مَار", "ثِمَار", "thimar"],
      ["_وْم", "ثَوْم", "thawm"],
      ["_يَاب", "ثِيَاب", "thiyab"],
      ["_عْبَان", "ثُعْبَان", "thuban"],
      ["_لُث", "ثُلُث", "thuluth"],
      ["_قْب", "ثُقْب", "thuqb"],
      ["_وْب", "ثَوْب", "thawb"],
      ["_قَاب", "ثِقَاب", "thiqab"],
    ],
    // Hören – book تدريب ٣, in book order.
    // teacher check: the final ث of ثُلُثْ in Hören is set to sukun.
    listen: [
      ["_مَار", "ثِمَار", "thimar"],
      ["_وْم", "ثَوْم", "thawm"],
      ["_لُ_", "ثُلُثْ", "thuluth"],
      ["_وْب", "ثَوْب", "thawb"],
      ["_عْبَان", "ثُعْبَان", "thuban"],
      ["_قَاب", "ثِقَاب", "thiqab"],
      ["_يَاب", "ثِيَاب", "thiyab"],
      ["_لَا_ة", "ثَلَاثَة", "thalatha"],
      ["_قْب", "ثُقْب", "thuqb"],
      ["أَ_نَاء", "أَثْنَاء", "athna"],
    ],
  },
});
