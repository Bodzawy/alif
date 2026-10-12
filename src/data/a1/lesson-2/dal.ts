import { dalWriting } from "@/data/letters/dal";

import { lesson2Letter } from "./letter-entry";

// A1 · Lektion 2 · Dal (د) – "مساء الخير.pdf", pages 23–25. Words, order and
// exercises as in the book. The book leaves some signs open; completed here:
// دُبّ (book: دُب), جَدّ (book: جَد) and the Dal of every word in تدريب ٤ (the
// learner writes it), a word-final consonant with Sukun (as in Lektion 1).

export const a1Dal = lesson2Letter({
  letter: { id: "dal", glyph: "د", name: "Dal", nameArabic: "الدَّالِ", latin: "d" },
  words: {
    fatha: [
      ["dawaa", "دَوَاء", "Medizin", "Dawāʾ", "Medikamente: eine Schachtel, eine Flasche und Tabletten"],
      ["darraja", "دَرَّاجَة", "Fahrrad", "Darrāja", ["/images/vocabulary/darraja.svg", "Ein Fahrrad"]],
      ["daqiq", "دَقِيق", "Mehl", "Daqīq", "Ein Glas mit Mehl"],
    ],
    kasra: [
      ["dik", "دِيك", "Hahn", "Dīk", "Ein Hahn"],
      ["dihan", "دِهَان", "Farbe (zum Streichen)", "Dihān", "Eine Farbdose mit Pinsel und eine Tube"],
      ["dina", "دِينَا", "Dina (Name)", "Dīnā", "Ein Mädchen mit Haarband"],
    ],
    damma: [
      ["durj", "دُرْج", "Schublade", "Durj", "Eine offene Schublade"],
      ["dulab", "دُولَاب", "Schrank", "Dūlāb", "Ein Kleiderschrank"],
      ["dubb", "دُبّ", "Bär", "Dubb", ["/images/vocabulary/dubb.svg", "Ein Bär"]],
    ],
  },
  positions: {
    rule: { arabic: "يُلَاحَظُ: الْحَرْفُ لَا يَقْبَلُ الِاتِّصَالَ إِلَّا مِنَ الْيَمِينِ.", german: "Beachte: Das Dal verbindet sich nur mit dem Buchstaben rechts davor – nie mit dem nächsten." },
    items: [
      { id: "start", label: "فِي أَوَّلِ الْكَلِمَةِ", labelGerman: "am Wortanfang", shape: "د", word: "دُولَاب", german: "Schrank" },
      { id: "end", label: "فِي آخِرِ الْكَلِمَةِ", labelGerman: "am Wortende", shape: "ـد", word: "فَرِيد", german: "Farid (Name)" },
      { id: "separate", label: "مُنْفَصِلَة", labelGerman: "allein", shape: "د", word: "دُرْج", german: "Schublade" },
    ],
    sukun: { glyph: "دْ", word: "مَدْرَسَة", german: "Schule" },
  },
  writing: dalWriting,
  fill: [
    ["_وَاء", "دَوَاء", "dawaa"],
    ["_رَّاجَة", "دَرَّاجَة", "darraja"],
    ["_ولَاب", "دُولَاب", "dulab"],
    ["_هَان", "دِهَان", "dihan"],
    ["_قِيق", "دَقِيق", "daqiq"],
    ["_يك", "دِيك", "dik"],
    ["_رْج", "دُرْج", "durj"],
    ["_ينَا", "دِينَا", "dina"],
    ["_بّ", "دُبّ", "dubb"],
  ],
  listenChoicesLabel: "(دَ / دِ / دُ / دْ)",
  listen: [
    ["_رْج", "دُرْج", "durj"],
    ["_ينَا", "دِينَا", "dina"],
    ["_يك", "دِيك", "dik"],
    ["_بّ", "دُبّ", "dubb"],
    ["_قِيق", "دَقِيق", "daqiq"],
    ["_رَّاجَة", "دَرَّاجَة", "darraja"],
    ["_هَان", "دِهَان", "dihan"],
    ["_وَاء", "دَوَاء", "dawaa"],
    ["_ولَاب", "دُولَاب", "dulab"],
    ["مَ_رَسَة", "مَدْرَسَة", "madrasa", "Schule"],
  ],
  repeatWrite: [
    ["دَرْس", "dars", "Unterrichtsstunde"],
    ["مَدْفَأَة", "madfaa", "Heizofen"],
    ["دَجَاجَة", "dajaja", "Huhn"],
    ["تَدُقّ", "taduqq", "sie klopft"],
    ["مَسْجِدْ", "masjid", "Moschee"],
    ["مَدْرَسَة", "madrasa", "Schule"],
    ["شَاهِدْ", "shahid", "Zeuge"],
    ["جَدِيدَة", "jadida", "neu (weiblich)"],
    ["جَدّ", "jadd", "Großvater"],
    ["دَار", "dar", "Haus"],
    ["حَدِيدْ", "hadid", "Eisen"],
    ["دِيَارِي", "diyari", "meine Heimat"],
    ["دُبّ", "dubb", "Bär"],
    ["الدُّنْيَا", "ad-dunya", "die Welt"],
    ["وَرْدَة", "warda", "Rose"],
    ["الْأَحَدْ", "al-ahad", "Sonntag"],
    ["مَدِيحَة", "madiha", "Madiha (Name)"],
    ["حَدِيقَة", "hadiqa", "Garten"],
    ["عِيدِي", "idi", "mein Fest"],
  ],
  pronounce: ["دُ", "دَ", "دِ"],
  dictationLetters: ["أ", "ب", "ت", "ث", "ج", "ح", "خ", "د"],
  dictation: [
    ["_امِر", "تَامِر", "tamir", "Tamer (Name)"],
    ["_وْم", "ثَوْم", "thawm", "Knoblauch"],
    ["_بْرِيق", "إِبْرِيق", "ibriq", "Kanne"],
    ["_رْتُقَال", "بُرْتُقَال", "burtuqal", "Orangen"],
    ["_يَار", "خِيَار", "khiyar", "Gurke"],
    ["_رْج", "بُرْج", "burj", "Turm"],
    ["_فَّاحَة", "تُفَّاحَة", "tuffaha", "Apfel"],
    ["تَمَا_يل", "تَمَاثِيل", "tamathil", "Statuen"],
    ["_صَان", "حِصَان", "hisan", "Pferd"],
    ["_رُوف", "خَرُوف", "kharuf", "Schaf"],
    ["_رْج", "دُرْج", "durj", "Schublade"],
    ["__يقَة", "حَدِيقَة", "hadiqa", "Garten"],
  ],
});
