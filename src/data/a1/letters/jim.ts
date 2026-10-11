import { jimWriting } from "@/data/letters/jim";

import { letterLesson } from "../letter-lesson";

// A1 · Lektion 1 · Dschim – book pages 11 and 12 (Lesson1.pdf). Words, spellings
// and order exactly as in the lesson brief. Pictures: the letter's own files in
// public/images/a1/<letter>/, or an existing picture of the same thing.

export const a1Jim = letterLesson({
  letter: { id: "jim", glyph: "ج", name: "Dschim", latin: "dsch" },
  words: {
    fatha: [
      ["jamal", "جَمَل", "Kamel", "Dschamal", ["/images/vocabulary/jamal.svg", "Ein Kamel in der Wüste"]],
      ["jarida", "جَرِيدَة", "Zeitung", "Dscharīda", "Eine Zeitung"],
      ["jaras", "جَرَس", "Glocke", "Dscharas", "Eine Glocke"],
    ],
    kasra: [
      ["jilbab", "جِلْبَاب", "Gewand", "Dschilbāb", "Ein langes Gewand für Frauen"],
      ["jibal", "جِبَال", "Berge", "Dschibāl", "Berge mit Schnee"],
      ["jimal", "جِمَال", "Kamele", "Dschimāl", "Zwei Kamele in der Wüste"],
    ],
    damma: [
      ["junud", "جُنُود", "Soldaten", "Dschunūd", "Drei Soldaten"],
      ["jubn", "جُبْن", "Käse", "Dschubn", "Ein Stück Käse"],
      ["jundiyy", "جُنْدِيّ", "Soldat", "Dschundiyy", "Ein Soldat"],
    ],
  },
  forms: {
    start: ["jimal", "جِمَال", "Kamele"],
    middle: ["aljundi", "الْجُنْدِي", "der Soldat"],
    end: ["nudj", "نُضْج", "Reife"],
    separate: ["faraj", "فَرَج", "Erleichterung"],
    sukun: ["ajmal", "أَجْمَل", "schöner"],
  },
  writing: jimWriting,
  formsPictures: {
    aljundi: ["/images/a1/jim/jundiyy.svg", "Ein Soldat"],
  },
  gaps: {
    // Ergänzen – book تدريب ٢, in book order.
    fill: [
      ["_رِيدَة", "جَرِيدَة", "jarida"],
      ["_لْبَاب", "جِلْبَاب", "jilbab"],
      ["_بَال", "جِبَال", "jibal"],
      ["_نُود", "جُنُود", "junud"],
      ["_بْن", "جُبْن", "jubn"],
      ["_نْدِيّ", "جُنْدِيّ", "jundiyy"],
      ["_مَال", "جِمَال", "jimal"],
      ["_مَل", "جَمَل", "jamal"],
      ["_رَس", "جَرَس", "jaras"],
    ],
    // Hören – book تدريب ٣, in book order.
    listen: [
      ["_رَس", "جَرَس", "jaras"],
      ["_مَل", "جَمَل", "jamal"],
      ["_نْدِيّ", "جُنْدِيّ", "jundiyy"],
      ["_مَال", "جِمَال", "jimal"],
      ["_رِيدَة", "جَرِيدَة", "jarida"],
      ["_نُود", "جُنُود", "junud"],
      ["_بْن", "جُبْن", "jubn"],
      ["_بَال", "جِبَال", "jibal"],
      ["_لْبَاب", "جِلْبَاب", "jilbab"],
      ["أَ_مَل", "أَجْمَل", "ajmal"],
    ],
  },
});
