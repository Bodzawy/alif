import { yaWriting } from "@/data/letters/ya";

import { lesson2Letter } from "./letter-entry";

// A1 · Lektion 2 · Ya (ي) – "مساء الخير.pdf", pages 32–34. Words, order and
// exercises as in the book; the Kasra row has one word (يِن). The Ya has a
// "Hand", so its Formen step is the one of Lektion 1 (the book's table: يَد،
// يَمِين، يُوسُفِي، مَجْدِي and بَيْت). A ي that makes a long ī is written WITHOUT
// a sign (plain ي, offered next to يَ يِ يُ يْ). Completed signs: the Ya of
// every word in تدريب ٤, a word-final consonant with Sukun.

export const a1Ya = lesson2Letter({
  letter: { id: "ya", glyph: "ي", name: "Ya", nameArabic: "الْيَاءِ", latin: "y" },
  words: {
    fatha: [
      ["yamin", "يَمِين", "rechts", "Yamīn", "Ein Pfeil nach rechts"],
      ["yad", "يَد", "Hand", "Yad", ["/images/vocabulary/yad.svg", "Eine Hand"]],
      ["yawm", "يَوْم", "Tag", "Yawm", "Ein Kalenderblatt"],
    ],
    kasra: [["yin", "يِن", "Yen (japanisches Geld)", "Yin", "Die Flagge Japans und Yen-Geld"]],
    damma: [
      ["yusufi", "يُوسُفِي", "Mandarinen", "Yūsufī", "Zwei Mandarinen"],
      ["yusra", "يُسْرَا", "Yusra (Name)", "Yusrā", "Eine Frau mit Haarband"],
      ["al-yunan", "الْيُونَان", "Griechenland", "Al-Yūnān", "Die Flagge Griechenlands"],
    ],
  },
  forms: {
    start: ["yad", "يَد", "Hand"],
    middle: ["yamin", "يَمِين", "rechts", -1],
    end: ["yusufi", "يُوسُفِي", "Mandarinen", -1],
    separate: ["majdi", "مَجْدِي", "Magdi (Name)"],
    sukun: ["bayt", "بَيْت", "Haus"],
    pictures: { bayt: ["/images/vocabulary/bait.svg", "Ein kleines Haus mit rotem Dach"] },
  },
  writing: yaWriting,
  fill: [
    // Not a word of the Ya page: the picture of يَاسَمِين from the long vowels (حروف المد).
    ["_اسَمِ_ن", "يَاسَمِين", "yasamin", "Jasmin; Yasmin (Name)", ["/images/a1/huruf-al-madd/yasamin.svg", "Eine Frau mit langen Haaren (Yasmin)"]],
    ["_ن", "يِن", "yin"],
    ["_وْم", "يَوْم", "yawm"],
    ["الْ_ونَان", "الْيُونَان", "al-yunan"],
    ["_وسُفِ_", "يُوسُفِي", "yusufi"],
    ["_د", "يَد", "yad"],
    ["_مِ_ن", "يَمِين", "yamin"],
    ["_سْرَا", "يُسْرَا", "yusra"],
  ],
  listenChoicesLabel: "(يَ / يِ / يُ / يْ)",
  listen: [
    ["_وْم", "يَوْم", "yawm"],
    ["الْ_ونَان", "الْيُونَان", "al-yunan"],
    ["_مِ_ن", "يَمِين", "yamin"],
    ["_سْرَا", "يُسْرَا", "yusra"],
    ["_ن", "يِن", "yin"],
    ["_وسُفِ_", "يُوسُفِي", "yusufi"],
    ["_د", "يَد", "yad"],
    ["بَ_ت", "بَيْت", "bayt", "Haus"],
  ],
  repeatWrite: [
    ["يَكْتُب", "yaktub", "er schreibt"],
    ["وَلِيد", "walid", "Walid (Name)"],
    ["تِين", "tin", "Feigen"],
    ["يُوحَنَّا", "yuhanna", "Johannes"],
    ["عَيْن", "ayn", "Auge"],
    ["عُيُون", "uyun", "Augen"],
    ["سَرِير", "sarir", "Bett"],
    ["سِيَادَة", "siyada", "Souveränität"],
    ["عِنْدِي", "indi", "ich habe"],
    ["يُونَان", "yunan", "Griechenland"],
    ["يَاسِر", "yasir", "Yasser (Name)"],
    ["بَيْت", "bayt", "Haus"],
    ["جُنَيْه", "junayh", "Pfund (Geld)"],
    ["عَيْب", "ayb", "Schande, Fehler"],
    ["حَدِيقَة", "hadiqa", "Garten"],
    ["حَقِيبَة", "haqiba", "Tasche"],
    ["سِيجَارَة", "sijara", "Zigarette"],
    ["مَفْدِيّ", "mafdiyy", "erlöst"],
    ["سَفِينَة", "safina", "Schiff"],
  ],
  pronounce: ["يَ", "يُ", "يِ", "يِ", "يَ", "يُ"],
  dictationLetters: ["أ", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "و", "ي"],
  notes: {
    dictation:
      "Die Lösungswörter stehen im Buch unter „حَلُّ تَدْرِيبِ (٩)“. Ein Buchstabe am Wortende ohne Vokal wird mit Sukun geschrieben. Hinweis aus dem Buch: Das ي in مَجْدِي ist ein Buchstabe – das ى in يَحْيَى ist ein langes ā (Alif maqsura); mehr dazu in der nächsten Lektion.",
  },
  dictation: [
    ["___", "بَيْتْ", "bayt", "Haus"],
    ["___", "جَيْبْ", "jayb", "Tasche (an der Kleidung)"],
    ["__", "يَدْ", "yad", "Hand"],
    ["_رُ__", "خُرُوجْ", "khuruj", "das Hinausgehen"],
    ["_لْ_", "دَلْوْ", "dalw", "Eimer"],
    ["السَّ____", "السَّادَاتْ", "as-sadat", "die Herren"],
    ["_مِ_ل", "جَمِيل", "jamil", "schön"],
  ],
});
