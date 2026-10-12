import { wawWriting } from "@/data/letters/waw";

import { lesson2Letter } from "./letter-entry";

// A1 · Lektion 2 · Waw (و) – "مساء الخير.pdf", pages 29–31. Words, order and
// exercises as in the book. A و that makes a long ū (وُرُود، وُصُول، عُود …) is a
// Dehnungsbuchstabe: it is written WITHOUT a sign, so those gaps are the plain
// و (offered next to وَ وِ وُ وْ). Completed signs: the Waw of every word in
// تدريب ٤, a word-final consonant with Sukun (دَلْوْ، ثَوْبْ …).

export const a1Waw = lesson2Letter({
  letter: { id: "waw", glyph: "و", name: "Waw", nameArabic: "الْوَاوِ", latin: "w" },
  words: {
    fatha: [
      ["warda", "وَرْدَة", "Rose", "Warda", ["/images/vocabulary/warda.svg", "Eine Rose"]],
      ["walad", "وَلَد", "Junge", "Walad", ["/images/vocabulary/walad.svg", "Ein Junge"]],
      ["waraqa", "وَرَقَة", "Blatt Papier", "Waraqa", "Ein Blatt Papier"],
    ],
    kasra: [
      ["wiam", "وِئَام", "Wiam (Name; „Eintracht“)", "Wiʾām", "Eine Frau mit langen Haaren"],
      ["wisada", "وِسَادَة", "Kissen", "Wisāda", ["/images/vocabulary/wisada.svg", "Ein Kissen"]],
      ["wiaa", "وِعَاء", "Krug, Gefäß", "Wiʿāʾ", "Ein Krug mit Blumenmuster"],
    ],
    damma: [
      ["wurud", "وُرُود", "Blumen, Rosen", "Wurūd", "Ein Strauß Blumen"],
      ["wusul", "وُصُول", "Ankunft", "Wuṣūl", "Reisende kommen am Flughafen an"],
      ["wujuh", "وُجُوه", "Gesichter", "Wujūh", "Viele Gesichter"],
    ],
  },
  positions: {
    rule: {
      arabic: "يُلَاحَظُ: يُكْتَبُ الْحَرْفُ مُنْفَصِلًا فِي الْأَوَّلِ أَوْ فِي الْآخِرِ، وَيَتَّصِلُ مِنَ الْيَمِينِ فَقَطْ.",
      german: "Beachte: Das Waw verbindet sich nur mit dem Buchstaben rechts davor – nie mit dem nächsten.",
    },
    items: [
      { id: "start", label: "فِي أَوَّلِ الْكَلِمَةِ", labelGerman: "am Wortanfang", shape: "و", word: "وَلَد", german: "Junge" },
      { id: "middle", label: "فِي الْمُنْتَصَفِ", labelGerman: "in der Mitte", shape: "ـو", word: "وُصُول", german: "Ankunft", occurrence: -1 },
      { id: "end", label: "فِي آخِرِ الْكَلِمَةِ", labelGerman: "am Wortende", shape: "ـو", word: "عَفْو", german: "Verzeihung" },
      { id: "separate", label: "مُنْفَصِلَة", labelGerman: "allein", shape: "و", word: "دَوَاء", german: "Medizin" },
    ],
    sukun: { glyph: "وْ", word: "ثَوْر", german: "Stier" },
  },
  writing: wawWriting,
  fill: [
    ["_لَد", "وَلَد", "walad"],
    ["_عَاء", "وِعَاء", "wiaa"],
    ["_رْدَة", "وَرْدَة", "warda"],
    ["_رُ_د", "وُرُود", "wurud"],
    ["_سَادَة", "وِسَادَة", "wisada"],
    ["_رَقَة", "وَرَقَة", "waraqa"],
    ["_صُ_ل", "وُصُول", "wusul"],
    ["_جُ_ه", "وُجُوه", "wujuh"],
    ["_ئَام", "وِئَام", "wiam"],
  ],
  listenChoicesLabel: "(وَ / وِ / وُ / وْ)",
  notes: { fill: "Im Buch: „صَحِّحْ مَعَ زَمِيلِكَ“ – vergleiche mit deinem Lernpartner. Hier prüft Alif deine Antwort sofort. Ein langes ū (وُرُود) schreibt man mit و ohne Zeichen." },
  listen: [
    ["_سَادَة", "وِسَادَة", "wisada"],
    ["_صُول", "وُصُول", "wusul"],
    ["_رْدَة", "وَرْدَة", "warda"],
    ["_ئَام", "وِئَام", "wiam"],
    ["_رَقَة", "وَرَقَة", "waraqa"],
    ["_عَاء", "وِعَاء", "wiaa"],
    ["_لَد", "وَلَد", "walad"],
    ["_رُ_د", "وُرُود", "wurud"],
    ["_جُ_ه", "وُجُوه", "wujuh"],
    ["ثَ_ر", "ثَوْر", "thawr", "Stier"],
  ],
  repeatWrite: [
    ["وَصَلَ", "wasala", "er kam an"],
    ["مَوْرِد", "mawrid", "Quelle"],
    ["وَرْدَة", "warda", "Rose"],
    ["وِلَادَة", "wilada", "Geburt"],
    ["وَائِل", "wail", "Wael (Name)"],
    ["ثَوْر", "thawr", "Stier"],
    ["وَقَفَ", "waqafa", "er stand"],
    ["وَلِيد", "walid", "Walid (Name)"],
    ["عُود", "ud", "Oud (Laute); Holz"],
    ["وَضَعَ", "wadaa", "er legte"],
    ["مَوْضُوع", "mawdu", "Thema"],
    ["دَلْوْ", "dalw", "Eimer"],
    ["قُرُوش", "qurush", "Piaster (Münzen)"],
    ["وُجُوه", "wujuh", "Gesichter"],
  ],
  pronounce: ["وُ", "وِ", "وَ"],
  dictationLetters: ["أ", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "و"],
  dictationWholeWord: true,
  dictation: [
    ["____", "ثَوَابْ", "thawab", "Belohnung"],
    ["___", "جُحَا", "juha", "Dschuha (Figur aus Geschichten)"],
    ["___", "دُودْ", "dud", "Würmer"],
    ["__", "ذُو", "dhu", "Besitzer von"],
    ["____", "دَاوُدْ", "dawud", "Dawud (David)"],
    ["____", "وُجُودْ", "wujud", "Dasein"],
    ["___", "ثَوْبْ", "thawb", "Gewand"],
    ["___", "دُرْجْ", "durj", "Schublade"],
    ["___", "خَبَرْ", "khabar", "Nachricht"],
    ["___", "ذَابَ", "dhaba", "es schmolz"],
  ],
});
