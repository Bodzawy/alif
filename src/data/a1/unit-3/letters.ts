import { ainWriting, ghainWriting, haWriting, ttaWriting, zzaWriting } from "@/data/letters/unit-3";
import { transliterate } from "@/lib/arabic/transliterate";

import type { LetterWordSpec, PictureSpec } from "../letter-lesson";
import { unit3Letter } from "./letter-entry";

// Unit 3 · تقديم (١) "مَنْ هُوَ؟" – the letters ه ط ظ ع غ (book pages 92–106,
// PDF pages 124–138), every part in book order. Pictures: the letter's own
// files in public/images/a1/<letter>/, or an existing picture of the same thing.

const V = "/images/vocabulary";
const w = (id: string, arabic: string, german: string, pic: PictureSpec): LetterWordSpec => [id, arabic, german, transliterate(arabic), pic];

const POS = {
  start: { id: "start", label: "فِي أَوَّلِ الْكَلِمَةِ", labelGerman: "am Wortanfang" },
  middle: { id: "middle", label: "فِي الْمُنْتَصَفِ", labelGerman: "in der Mitte" },
  end: { id: "end", label: "فِي آخِرِ الْكَلِمَةِ", labelGerman: "am Wortende" },
  separate: { id: "separate", label: "مُنْفَصِل", labelGerman: "allein" },
} as const;

// ---------------------------------------------------------------- ه (book pages 92–94)
export const a1Ha = unit3Letter({
  letter: { id: "ha", glyph: "ه", name: "Hā", nameArabic: "الْهَاءِ", latin: "h", bookPages: "92–94" },
  words: {
    fatha: [
      w("haram", "هَرَم", "Pyramide", [`${V}/haram.svg`, "Die Pyramiden"]),
      w("hamza", "هَمْزَة", "Hamza (das Zeichen ء)", "Das Zeichen Hamza (ء)"),
      w("hadiyya", "هَدِيَّة", "Geschenk", "Ein Geschenk mit Schleife"),
    ],
    kasra: [
      w("hilal", "هِلَال", "Mondsichel", [`${V}/hilal.svg`, "Eine Mondsichel"]),
      w("hindi", "هِنْدِي", "Ureinwohner Amerikas (im Buch mit Federschmuck)", "Ein Mann mit Federschmuck"),
      w("hilb", "هِلْب", "Anker", "Ein Anker"),
    ],
    damma: [
      w("hunud", "هُنُود", "Ureinwohner Amerikas (Mehrzahl)", "Drei Männer mit Federschmuck"),
      w("hudhud", "هُدْهُد", "Wiedehopf", "Ein Wiedehopf"),
      w("huda", "هُدَى", "Huda (Name)", "Eine junge Frau"),
    ],
  },
  positions: {
    rule: {
      arabic: "مُلَاحَظَةٌ: الْهَاءُ فِي نِهَايَةِ الْكَلِمَةِ بِدُونِ نُقْطَتَيْنِ (ـه / ه)؛ بِنُقْطَتَيْنِ هِيَ التَّاءُ الْمَرْبُوطَةُ (ـة / ة).",
      german: "Achtung: Das Hā am Wortende hat keine zwei Punkte (ـه / ه). Mit zwei Punkten ist es das Ta marbuta (ـة / ة).",
    },
    items: [
      { ...POS.start, shape: "هـ", word: "هَرَم", german: "Pyramide" },
      { ...POS.middle, shape: "ـهـ", word: "سِهَام", german: "Pfeile; Siham (Name)" },
      { ...POS.end, shape: "ـه", word: "وَجْه", german: "Gesicht" },
      { ...POS.separate, shape: "ه", word: "عِنْدَه", german: "bei ihm", occurrence: -1 },
    ],
    sukun: { glyph: "هْ", word: "أَهْلاً", german: "Willkommen" },
  },
  writing: haWriting,
  fill: ["hamza", "hilal", "haram", "hadiyya", "hudhud", "huda", "hindi", "hunud", "hilb"],
  listen: ["hamza", "hilal", "haram", "hadiyya", "hudhud", "huda", "hindi", "hunud", "hilb", ["أَهْلاً", "ahlan", "Willkommen"]],
  notes: {
    listen: "Im Buch sind die Zeilen 1–9 leer: Der Lehrer diktiert die Wörter noch einmal („يقوم المدرس بإملاء الكلمات مرة أخرى“). Alif diktiert die Wörter aus Übung 2; Zeile 10 ist im Buch „ـلاً“ (أَهْلاً).",
  },
  repeat: {
    write: true,
    words: [
      ["هِشَام", "hisham", "Hischam (Name)"],
      ["هَانِم", "hanim", "Hanim (Name)"],
      ["مُهَاب", "muhab", "Muhab (Name)"],
      ["هِبَة", "hiba", "Hiba (Name)"],
      ["إِلْهَام", "ilham", "Ilham (Name)"],
      ["سِهَام", "siham", "Siham (Name)"],
      ["هَانِي", "hani", "Hani (Name)"],
      ["أَهْلاً وَسَهْلاً", "ahlan-wa-sahlan", "Herzlich willkommen"],
      ["مُهِمّ", "muhimm", "wichtig"],
      ["هُمُوم", "humum", "Sorgen"],
      ["هُوَ", "huwa", "er"],
      ["هِيَ", "hiya", "sie"],
      ["هُمْ", "hum", "sie (Mehrzahl, männlich)"],
      ["هُمَا", "huma", "sie beide"],
      ["هَنَاء", "hanaa", "Hanaa (Name)"],
    ],
  },
  dictation: [
    ["هُوَ", "huwa", "er"],
    ["هِشَامْ", "hisham", "Hischam (Name)"],
    ["إِلْهَامْ", "ilham", "Ilham (Name)"],
    ["مُهِمّ", "muhimm", "wichtig"],
    ["هُنَاكْ", "hunak", "dort"],
    ["وُجُوهْ", "wujuh", "Gesichter"],
    ["عِنْدَهُمْ", "indahum", "bei ihnen"],
    ["لَهُ", "lahu", "für ihn"],
    ["قَمِيصُهُ", "qamisuhu", "sein Hemd"],
    ["قَصْرُهُ", "qasruhu", "sein Palast"],
  ],
  readAloud: true,
  difference: {
    letters: ["ه", "ح"],
    pairs: [
      [["_شَام", "هِشَام", "hisham", "Hischam (Name)"], ["_سَام", "حُسَام", "husam", "Husam (Name)"]],
      [["_رَم", "هَرَم", "haram", "Pyramide"], ["_رَم", "حَرَم", "haram-h", "heiliger Bezirk"]],
      [["_لَال", "هِلَال", "hilal", "Mondsichel"], ["_مَار", "حِمَار", "himar", "Esel"]],
      [["_وت", "حُوت", "hut", "Wal"], ["_لْب", "هِلْب", "hilb", "Anker"]],
      [["مُ_مّ", "مُهِمّ", "muhimm", "wichtig"], ["مُ_تَرَم", "مُحْتَرَم", "muhtaram", "geachtet, höflich"]],
      [["_يَاة", "حَيَاة", "hayah", "Leben"], ["_يَام", "هُيَام", "huyam", "Huyam (Name); große Liebe"]],
    ],
  },
});

// ---------------------------------------------------------------- ط (book pages 95–97)
export const a1Tta = unit3Letter({
  letter: { id: "tta", glyph: "ط", name: "Ṭa", nameArabic: "الطَّاءِ", latin: "ṭ", bookPages: "95–97" },
  words: {
    fatha: [
      w("tamatim", "طَمَاطِم", "Tomaten", "Drei Tomaten"),
      w("taira", "طَائِرَة", "Flugzeug", [`${V}/taira.svg`, "Ein Flugzeug"]),
      w("tabaq", "طَبَق", "Teller", "Ein Teller"),
    ],
    kasra: [
      w("tifl", "طِفْل", "Baby, Kind", "Ein Baby auf einem Kissen"),
      w("tiin", "طِين", "Schlamm, Lehm", "Ein Schuh tritt in Schlamm"),
      w("tisht", "طِشْت", "Waschschüssel", "Eine flache Waschschüssel"),
    ],
    damma: [
      w("tuyur", "طُيُور", "Vögel", ["/images/a1/huruf-al-madd/tuyur.svg", "Vögel"]),
      w("tubul", "طُبُول", "Trommeln", "Mehrere Trommeln"),
      w("turbid", "طُورْبِيد", "Torpedo", "Ein Torpedo"),
    ],
  },
  positions: {
    items: [
      { ...POS.start, shape: "طـ", word: "طَبْل", german: "Trommel" },
      { ...POS.middle, shape: "ـطـ", word: "نَطَقَ", german: "er sprach aus" },
      { ...POS.end, shape: "ـط", word: "بَطّ", german: "Enten" },
      { ...POS.separate, shape: "ط", word: "شُبَاط", german: "Februar" },
    ],
    sukun: { glyph: "طْ", word: "عُطْلَة", german: "Ferien" },
  },
  writing: ttaWriting,
  fill: ["tuyur", "tamatim", "turbid", "tiin", "tifl", "taira", "tabaq", "tubul", "tisht"],
  listen: ["tuyur", "taira", "turbid", "tiin", "tifl", "tamatim", "tabaq", "tubul", "tisht", ["عُطْلَة", "utla", "Ferien"]],
  notes: {
    listen: "Im Buch sind die meisten Zeilen leer: Der Lehrer diktiert die Wörter noch einmal. Gedruckt sind nur Zeile 2 (ـ ـ ئـ ـ ة = طَائِرَة) und Zeile 10 (عُـ ـلَة = عُطْلَة). Alif diktiert die Wörter aus Übung 2.",
  },
  repeat: {
    write: true,
    words: [
      ["طَبْلَة", "tabla", "kleine Trommel"],
      ["عُطْلَة", "utla", "Ferien"],
      ["تَعْطِيل", "tatil", "Ausfall, Störung"],
      ["عِطْر", "itr", "Parfüm"],
      ["عُطُور", "utur", "Parfüms"],
      ["مَطَر", "matar", "Regen"],
      ["طَرِيق", "tariq", "Weg, Straße"],
      ["طَارِق", "tariq-name", "Tarek (Name)"],
      ["بَطّ", "batt", "Enten"],
      ["طُرُق", "turuq", "Wege"],
      ["مُصْطَفَى", "mustafa", "Mustafa (Name)"],
      ["طَابُور", "tabur", "Warteschlange"],
      ["أَمْطَار", "amtar", "Regenfälle"],
      ["بَطِّيخ", "battikh", "Wassermelone"],
      ["بَطَاطِس", "batatis", "Kartoffeln"],
      ["شَاطِئ", "shati", "Strand"],
      ["أَطْبَاق", "atbaq", "Teller (Mehrzahl)"],
    ],
  },
  dictation: [
    ["طَارِقْ", "tariq-name", "Tarek (Name)"],
    ["إِفْطَارْ", "iftar", "Frühstück"],
    ["طَرِيقْ", "tariq", "Weg, Straße"],
    ["مَطَرْ", "matar", "Regen"],
    ["بَطَاطِسْ", "batatis", "Kartoffeln"],
    ["طَمَاطِمْ", "tamatim", "Tomaten"],
    ["طَبَقْ", "tabaq", "Teller"],
    ["أَطْبَاقْ", "atbaq", "Teller (Mehrzahl)"],
    ["طُورْبِيدْ", "turbid", "Torpedo"],
    ["بَطَاطَا", "batata", "Süßkartoffeln"],
  ],
  difference: {
    letters: ["ت", "ط"],
    pairs: [
      [["_مْثَال", "تِمْثَال", "timthal", "Statue"], ["_رِيق", "طَرِيق", "tariq", "Weg, Straße"]],
      [["_ونَة", "تُونَة", "tuna", "Thunfisch"], ["_يُور", "طُيُور", "tuyur", "Vögel"]],
      [["_ين", "تِين", "tin-fig", "Feigen"], ["_ين", "طِين", "tiin", "Schlamm, Lehm"]],
      [["_مْر", "تَمْر", "tamr", "Datteln"], ["_بَق", "طَبَق", "tabaq", "Teller"]],
      [["_فْل", "طِفْل", "tifl", "Baby, Kind"], ["_لّ", "تَلّ", "tall", "Hügel"]],
      [["_ورْبِيد", "طُورْبِيد", "turbid", "Torpedo"], ["_وت", "تُوت", "tut", "Beeren"]],
      [["_اج", "تَاج", "taj", "Krone"], ["_مَا_م", "طَمَاطِم", "tamatim", "Tomaten"]],
      [["_لِيفُون", "تِلِيفُون", "tilifun", "Telefon"], ["_بُول", "طُبُول", "tubul", "Trommeln"]],
    ],
  },
});

// ---------------------------------------------------------------- ظ (book pages 98–100)
export const a1Zza = unit3Letter({
  letter: { id: "zza", glyph: "ظ", name: "Ẓa", nameArabic: "الظَّاءِ", latin: "ẓ", bookPages: "98–100" },
  words: {
    fatha: [
      w("zarf", "ظَرْف", "Briefumschlag", "Ein geschlossener Briefumschlag mit Briefmarke"),
      w("zaby", "ظَبْي", "Gazelle (im Buch: ein Hirsch)", [`${V}/zaby.svg`, "Eine Gazelle"]),
      w("zahr", "ظَهْر", "Rücken", "Ein Junge von hinten, ein Pfeil zeigt auf den Rücken"),
    ],
    kasra: [
      w("zill", "ظِلّ", "Schatten", "Ein Mann und sein Schatten"),
      w("zilal", "ظِلَال", "Schatten (Mehrzahl)", "Bäume und ihre Schatten"),
      w("zilf", "ظِلْف", "Huf", "Ein Huf"),
    ],
    damma: [
      w("zuruf", "ظُرُوف", "Briefumschläge", "Mehrere Briefumschläge"),
      w("zufr", "ظُفْر", "Fingernagel", [`${V}/zufr.svg`, "Ein Fingernagel"]),
      w("zuhr", "ظُهْر", "Mittag", "Die Sonne und eine Uhr: 12 Uhr mittags"),
    ],
  },
  positions: {
    items: [
      { ...POS.start, shape: "ظـ", word: "ظَرْف", german: "Briefumschlag" },
      { ...POS.middle, shape: "ـظـ", word: "الظَّهْر", german: "der Rücken" },
      { ...POS.end, shape: "ـظ", word: "لَاحِظْ", german: "beachte!" },
      { ...POS.separate, shape: "ظ", word: "وُعَّاظ", german: "Prediger (Mehrzahl)" },
    ],
    sukun: { glyph: "ظْ", word: "أَظْهَر", german: "deutlicher; er zeigte" },
  },
  writing: zzaWriting,
  fill: ["zill", "zarf", "zaby", "zahr", "zuruf", "zufr", "zilf", "zilal", "zuhr"],
  listen: ["zuruf", "zill", "zahr", "zilal", "zuhr", "zilf", "zaby", "zufr", "zarf", ["أَظْهَر", "azhar", "deutlicher; er zeigte"]],
  notes: { listen: "Im Buch steht „ـهْر“ zweimal (Zeile 3 und 5): einmal ظَهْر (Rücken), einmal ظُهْر (Mittag) – hör genau auf den Vokal." },
  repeat: {
    write: false,
    words: [
      ["ظُهُور", "zuhur", "Erscheinen"],
      ["ظَرِيف", "zarif", "nett, witzig"],
      ["عَظْم", "azm", "Knochen"],
      ["وَعْظ", "waz", "Predigt"],
      ["ظَاهِر", "zahir", "sichtbar"],
      ["ظُرُوف", "zuruf", "Briefumschläge; Umstände"],
      ["ظِبَاء", "ziba", "Gazellen"],
      ["عَظِيم", "azim", "großartig"],
      ["عَظَمَة", "azama", "Größe"],
      ["ظُفْر", "zufr", "Fingernagel"],
    ],
  },
  dictation: [
    ["ظَرِيفْ", "zarif", "nett, witzig"],
    ["أَظْهَرْ", "azhar", "deutlicher; er zeigte"],
    ["ظِلَالْ", "zilal", "Schatten (Mehrzahl)"],
    ["قَيْظْ", "qayz", "Sommerhitze"],
    ["الظُّهُورْ", "az-zuhur", "das Erscheinen"],
    ["الظَّهْرْ", "az-zahr", "der Rücken"],
    ["ظُرُوفْ", "zuruf", "Briefumschläge"],
    ["ظَاهِرْ", "zahir", "sichtbar"],
  ],
  difference: {
    letters: ["ذ", "ظ"],
    pairs: [
      [["_بَاب", "ذُبَاب", "dhubab", "Fliegen"], ["_بَاء", "ظِبَاء", "ziba", "Gazellen"]],
      [["_يُول", "ذُيُول", "dhuyul", "Schwänze"], ["_رُوف", "ظُرُوف", "zuruf", "Briefumschläge"]],
      [["_رْف", "ظَرْف", "zarf", "Briefumschlag"], ["_يْل", "ذَيْل", "dhayl", "Schwanz"]],
      [["_رَاع", "ذِرَاع", "dhiraa", "Arm"], ["_لَال", "ظِلَال", "zilal", "Schatten (Mehrzahl)"]],
      [["_هْر", "ظُهْر", "zuhr", "Mittag"], ["_قْن", "ذَقْن", "dhaqn", "Kinn"]],
      [["_هْر", "ظَهْر", "zahr", "Rücken"], ["_رَة", "ذُرَة", "dhura", "Mais"]],
      [["_لّ", "ظِلّ", "zill", "Schatten"], ["_ئْب", "ذِئْب", "dhib", "Wolf"]],
    ],
  },
});

// ---------------------------------------------------------------- ع (book pages 101–103)
export const a1Ain = unit3Letter({
  letter: { id: "ain", glyph: "ع", name: "ʿAin", nameArabic: "الْعَيْنِ", latin: "ʿ", bookPages: "101–103" },
  words: {
    fatha: [
      w("alam", "عَلَم", "Fahne", "Eine Fahne"),
      w("ayn", "عَيْن", "Auge", "Ein Auge"),
      w("azma", "عَظْمَة", "Knochen", "Ein Knochen"),
    ],
    kasra: [
      w("imara", "عِمَارَة", "Wohnhaus, Gebäude", "Ein hohes Wohnhaus"),
      w("imarat", "عِمَارَات", "Gebäude (Mehrzahl)", "Mehrere hohe Häuser"),
      w("izam", "عِظَام", "Knochen (Mehrzahl)", "Ein Skelett aus Knochen"),
    ],
    damma: [
      w("ud", "عُود", "Oud (Laute)", "Eine Oud"),
      w("umla", "عُمْلَة", "Währung, Geld", "Geldscheine und Münzen"),
      w("ulba", "عُلْبَة", "Schachtel", "Eine Schachtel"),
    ],
  },
  positions: {
    items: [
      { ...POS.start, shape: "عـ", word: "عَلَم", german: "Fahne" },
      { ...POS.middle, shape: "ـعـ", word: "الْعَلَم", german: "die Fahne" },
      { ...POS.end, shape: "ـع", word: "مَعَ", german: "mit" },
      { ...POS.separate, shape: "ع", word: "وَدَع", german: "Kaurimuscheln" },
    ],
    sukun: { glyph: "عْ", word: "أَعْلَم", german: "wissender; ich weiß" },
  },
  writing: ainWriting,
  fill: ["imara", "alam", "ayn", "azma", "ulba", "imarat", "izam", "umla", "ud"],
  listen: ["izam", "alam", "imara", "ud", "ayn", "ulba", "imarat", "umla", "azma", ["أَعْلَم", "alam-sukun", "wissender; ich weiß"]],
  repeat: {
    write: true,
    words: [
      ["وَعْظ", "waz", "Predigt"],
      ["عِصَابَة", "isaba", "Bande"],
      ["عُمْلَة", "umla", "Währung, Geld"],
      ["عُمَّال", "ummal", "Arbeiter (Mehrzahl)"],
      ["وَاعِظ", "waiz", "Prediger"],
      ["عَظِيم", "azim", "großartig"],
      ["عِيَادَة", "iyada", "Arztpraxis"],
    ],
  },
  dictation: [
    ["عَامِلْ", "amil", "Arbeiter"],
    ["وَاعِظْ", "waiz", "Prediger"],
    ["عِمَارَاتْ", "imarat", "Gebäude (Mehrzahl)"],
    ["عِظَامْ", "izam", "Knochen (Mehrzahl)"],
    ["الْعِلْمْ", "al-ilm", "das Wissen"],
    ["ضِلْعْ", "dil", "Rippe"],
    ["ذِرَاعْ", "dhiraa", "Arm"],
  ],
  difference: {
    letters: ["أ", "ع"],
    pairs: [
      [["_ادِل", "عَادِل", "adil", "Adil (Name)"], ["_حْمَد", "أَحْمَد", "ahmad", "Ahmad (Name)"]],
      [["_يُون", "عُيُون", "uyun", "Augen"], ["_سَامَة", "أُسَامَة", "usama", "Usama (Name)"]],
      [["_مّ", "أُمّ", "umm", "Mutter"], ["_مْلَة", "عُمْلَة", "umla", "Währung, Geld"]],
      [["_مَل", "عَمَل", "amal-work", "Arbeit"], ["_مَل", "أَمَل", "amal-hope", "Hoffnung"]],
      [["_نَارَة", "إِنَارَة", "inara", "Beleuchtung"], ["_مَارَة", "عِمَارَة", "imara", "Wohnhaus, Gebäude"]],
    ],
  },
});

// ---------------------------------------------------------------- غ (book pages 104–106)
export const a1Ghain = unit3Letter({
  letter: { id: "ghain", glyph: "غ", name: "Ghain", nameArabic: "الْغَيْنِ", latin: "gh", bookPages: "104–106" },
  words: {
    fatha: [
      w("ghayma", "غَيْمَة", "Wolke", [`${V}/ghaima.svg`, "Eine Wolke"]),
      w("ghassala", "غَسَّالَة", "Waschmaschine", [`${V}/ghassala.svg`, "Eine Waschmaschine"]),
      w("ghazal", "غَزَال", "Gazelle", "Eine Gazelle"),
    ],
    kasra: [
      w("ghizlan", "غِزْلَان", "Gazellen", "Drei Gazellen"),
      w("ghirban", "غِرْبَان", "Raben", "Mehrere Raben"),
      w("ghiraa", "غِرَاء", "Klebstoff", "Eine Dose Klebstoff"),
    ],
    damma: [
      w("ghusn", "غُصْن", "Zweig", "Ein Zweig mit Blättern"),
      w("ghuyum", "غُيُوم", "Wolken", "Viele Wolken und die Sonne"),
      w("ghurfa", "غُرْفَة", "Zimmer", "Ein Wohnzimmer mit Sesseln"),
    ],
  },
  positions: {
    items: [
      { ...POS.start, shape: "غـ", word: "غَيْمَة", german: "Wolke" },
      { ...POS.middle, shape: "ـغـ", word: "الْغَزَال", german: "die Gazelle" },
      { ...POS.end, shape: "ـغ", word: "صَمْغ", german: "Harz, Gummi" },
      { ...POS.separate, shape: "غ", word: "فَرَاغ", german: "Leere; freie Zeit" },
    ],
    sukun: { glyph: "غْ", word: "أَغْصَان", german: "Zweige" },
  },
  writing: ghainWriting,
  fill: ["ghassala", "ghusn", "ghayma", "ghuyum", "ghirban", "ghiraa", "ghurfa", "ghizlan", "ghazal"],
  listen: ["ghusn", "ghayma", "ghazal", "ghurfa", "ghassala", "ghirban", "ghiraa", "ghizlan", "ghuyum", ["أَغْصَان", "aghsan", "Zweige"]],
  repeat: {
    write: true,
    words: [
      ["غَالِي", "ghali", "teuer; Ghali (Name)"],
      ["يُصْغِي", "yusghi", "er hört zu"],
      ["صَمْغ", "samgh", "Harz, Gummi"],
      ["أَغْصَان", "aghsan", "Zweige"],
      ["غِرَاء", "ghiraa", "Klebstoff"],
      ["غُرَاب", "ghurab", "Rabe"],
      ["فَرَاغ", "faragh", "Leere; freie Zeit"],
      ["غَنِيّ", "ghaniyy", "reich"],
    ],
  },
  dictation: [
    ["أَغْصَانْ", "aghsan", "Zweige"],
    ["غِزْلَانْ", "ghizlan", "Gazellen"],
    ["حُجُرَاتْ", "hujurat", "Zimmer (Mehrzahl)"],
    ["فَرَاغْ", "faragh", "Leere; freie Zeit"],
    ["غَالِي", "ghali", "teuer"],
    ["صَمْغْ", "samgh", "Harz, Gummi"],
    ["يُصْغِي", "yusghi", "er hört zu"],
    ["أَسْمَاكْ", "asmak", "Fische"],
  ],
  alphabet: [
    ["بَابْ", "bab", "Tür"],
    ["مَكْتَبْ", "maktab", "Schreibtisch, Büro"],
    ["غَزَالْ", "ghazal", "Gazelle"],
    ["ثَلَاثِينْ", "thalathin", "dreißig"],
    ["جُنُودْ", "junud", "Soldaten"],
    ["حُجُرَاتْ", "hujurat", "Zimmer (Mehrzahl)"],
    ["خِطَابْ", "khitab", "Brief, Rede"],
    ["ذِرَاعْ", "dhiraa", "Arm"],
    ["يُوسُفِيّ", "yusufi", "Mandarinen"],
    ["هَرَمْ", "haram", "Pyramide"],
    ["قَمِيصْ", "qamis", "Hemd"],
    ["طَمَاطِمْ", "tamatim", "Tomaten"],
    ["ظُهْرْ", "zuhr", "Mittag"],
    ["شِيبْسِي", "shibsi", "Chips"],
    ["ضَابِطْ", "dabit", "Offizier"],
    ["ضَبْعْ", "dab", "Hyäne"],
  ],
});
