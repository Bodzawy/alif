import { dadWriting, raWriting, sadWriting, shinWriting, sinWriting, zayWriting } from "@/data/letters/unit-2";

import { blank, unit2Letter } from "./letter-entry";

// Unit 2 · تقديم (١) "هَلْ أَنْتَ وَجْدِي؟" – the letters ر ز س ش ص ض
// ("وجدي.pdf", PDF pages 1–18 = book pages 44–61), every part in book order.
// Pictures: the letter's own files in public/images/a1/<letter>/, or an
// existing picture of the same thing. The book prints some words twice and
// leaves others out in تدريب ٣ (ض: ضُرُوس twice) – kept as printed.

const V = "/images/vocabulary";

const NON_CONNECTING_RULE = (word1: string, word2: string, word3: string, name: string) => ({
  arabic: `الْحَرْفُ فِي الْأَوَّلِ مُنْفَصِلٌ (${word1}) وَفِي الْآخِرِ مُتَّصِلٌ (${word2}) أَوْ مُنْفَصِلٌ (${word3}).`,
  german: `Das ${name} verbindet sich nur mit dem Buchstaben rechts davor – nie mit dem nächsten. Am Wortanfang steht es allein, am Ende verbunden oder allein.`,
});

export const a1Ra = unit2Letter({
  letter: { id: "ra", glyph: "ر", name: "Ra", nameArabic: "الرَّاءِ", latin: "r", bookPages: "44–46" },
  words: {
    fatha: [
      ["rajul", "رَجُل", "Mann", "Rajul", [`${V}/rajul.svg`, "Ein Mann"]],
      ["radyu", "رَادْيُو", "Radio", "Rādyū", "Ein altes Radio"],
      ["ras", "رَأْس", "Kopf", "Raʾs", ["/images/a1/lesson-1/ras.svg", "Ein Kopf"]],
    ],
    kasra: [
      ["risala", "رِسَالَة", "Brief", "Risāla", "Ein Briefumschlag mit Brief"],
      ["ria", "رِئَة", "Lunge", "Riʾa", "Eine Lunge"],
      ["rijl", "رِجْل", "Bein", "Rijl", "Ein Bein mit Fuß"],
    ],
    damma: [
      ["rumman", "رُمَّان", "Granatäpfel", "Rummān", [`${V}/rummana.svg`, "Granatäpfel"]],
      ["rukhsa", "رُخْصَة", "Führerschein", "Rukhṣa", "Ein Führerschein mit Foto"],
      ["rub", "رُبْع", "Viertel", "Rubʿ", "Ein Kreis, ein Viertel davon ist farbig"],
    ],
  },
  positions: {
    rule: NON_CONNECTING_RULE("رَجُل", "سَرِير", "أَشْجَار", "Ra"),
    items: [
      { id: "start", label: "فِي أَوَّلِ الْكَلِمَةِ", labelGerman: "am Wortanfang", shape: "ر", word: "رَجُل", german: "Mann" },
      { id: "middle", label: "فِي الْمُنْتَصَفِ", labelGerman: "in der Mitte", shape: "ـر", word: "سَرِير", german: "Bett" },
      { id: "end", label: "فِي آخِرِ الْكَلِمَةِ", labelGerman: "am Wortende", shape: "ـر", word: "حَرِير", german: "Seide", occurrence: -1 },
      { id: "separate", label: "مُنْفَصِل", labelGerman: "allein", shape: "ر", word: "أَشْجَار", german: "Bäume" },
    ],
    sukun: { glyph: "رْ", word: "حَرْب", german: "Krieg" },
  },
  writing: raWriting,
  fill: ["rajul", "rijl", "rumman", "ras", "radyu", "rukhsa", "ria", "rub", "risala"],
  listen: ["risala", "rukhsa", "rajul", "ras", "radyu", "ria", "rumman", "rijl", "rub", ["حَرْب", "harb", "Krieg"]],
  repeatWrite: [
    ["حُجْرَة", "hujra", "Zimmer"],
    ["شَارِع", "shari", "Straße"],
    ["رِفْعَت", "rifat", "Rifat (Name)"],
    ["صُورَة", "sura", "Bild"],
    ["طُيُورْ", "tuyur", "Vögel"],
    ["وَرْدَة", "warda", "Rose"],
    ["وَرَقَة", "waraqa", "Blatt Papier"],
    ["وُرُود", "wurud", "Blumen"],
    ["ذِرَاع", "dhiraa", "Arm"],
    ["ذُرَة", "dhura", "Mais"],
    ["دُرْج", "durj", "Schublade"],
    ["خِيَارْ", "khiyar", "Gurke"],
    ["خَرُوف", "kharuf", "Schaf"],
    ["جَرِيدَة", "jarida", "Zeitung"],
    ["خُضَارْ", "khudar", "Gemüse"],
    ["بُرْتُقَال", "burtuqal", "Orangen"],
    ["بُرْج", "burj", "Turm"],
    ["أَرْنَب", "arnab", "Hase"],
    ["سَرِيرْ", "sarir", "Bett"],
  ],
  pronounce: ["رُ", "رَ", "رِ"],
  dictationLetters: "أ … ي",
  notes: { dictation: "Die Lösungswörter stehen im Buch unter „حَلُّ تَدْرِيبِ (٩)“. Die Buchstaben, die das Buch schon zeigt, stehen schon da. Ein Buchstabe am Wortende ohne Vokal wird mit Sukun geschrieben." },
  dictation: [
    [blank("رَصَاص", [1, 2, 3]), "رَصَاص", "rasas", "Blei"],
    [blank("سَرِيرْ", [0]), "سَرِيرْ", "sarir", "Bett"],
    [blank("شَجَرَة", [0, 3]), "شَجَرَة", "shajara", "Baum"],
    [blank("بُرْجْ"), "بُرْجْ", "burj", "Turm"],
    [blank("خَرُوف", [3]), "خَرُوف", "kharuf", "Schaf"],
    [blank("أَحْمَدْ", [2]), "أَحْمَدْ", "ahmad", "Ahmad (Name)"],
    [blank("تَامِرْ", [2]), "تَامِرْ", "tamir", "Tamer (Name)"],
    [blank("ثَابِتْ"), "ثَابِتْ", "thabit", "Thabit (Name); fest"],
    [blank("رَادْيُو"), "رَادْيُو", "radyu", "Radio"],
    [blank("ذُرَة", [2]), "ذُرَة", "dhura", "Mais"],
  ],
});

export const a1Zay = unit2Letter({
  letter: { id: "zay", glyph: "ز", name: "Zay", nameArabic: "الزَّايِ", latin: "z", bookPages: "47–49" },
  words: {
    fatha: [
      ["zayt", "زَيْت", "Öl", "Zayt", "Eine Flasche Öl"],
      ["zamil", "زَمِيل", "Mitschüler, Kollege", "Zamīl", "Zwei Schüler an einem Tisch"],
      ["zahra", "زَهْرَة", "Blume", "Zahra", [`${V}/zahra.svg`, "Eine Blume"]],
    ],
    kasra: [
      ["zir", "زِير", "Wasserkrug (aus Ton)", "Zīr", "Ein großer Tonkrug"],
      ["zirr", "زِرّ", "Knopf", "Zirr", "Ein Knopf"],
      ["ziraa", "زِرَاعَة", "Landwirtschaft", "Zirāʿa", "Ein Feld mit Pflanzen"],
    ],
    damma: [
      ["zumurrud", "زُمُرُّد", "Smaragd", "Zumurrud", "Ein grüner Edelstein"],
      ["zumalaa", "زُمَلَاء", "Mitschüler, Kollegen", "Zumalāʾ", "Eine Gruppe von Schülern"],
      ["zuhur", "زُهُور", "Blumen", "Zuhūr", "Ein Topf mit Blumen"],
    ],
  },
  positions: {
    rule: NON_CONNECTING_RULE("زَيْت", "عَزِيز", "أَرُز", "Zay"),
    items: [
      { id: "start", label: "فِي أَوَّلِ الْكَلِمَةِ", labelGerman: "am Wortanfang", shape: "ز", word: "زَيْت", german: "Öl" },
      { id: "middle", label: "فِي الْمُنْتَصَفِ", labelGerman: "in der Mitte", shape: "ـز", word: "عَزِيز", german: "lieb; Aziz (Name)" },
      { id: "end", label: "فِي الْآخِرِ", labelGerman: "am Wortende", shape: "ـز", word: "أَزِيز", german: "Summen", occurrence: -1 },
      { id: "separate", label: "مُنْفَصِل", labelGerman: "allein", shape: "ز", word: "أَرُز", german: "Reis" },
    ],
    sukun: { glyph: "زْ", word: "أَزْهَار", german: "Blüten" },
  },
  writing: zayWriting,
  fill: ["zumurrud", "zamil", "ziraa", "zahra", "zir", "zirr", "zumalaa", "zayt", "zuhur"],
  listen: ["zamil", "zir", "zahra", "zayt", "zirr", "zumurrud", "ziraa", "zumalaa", "zuhur", ["أَزْهَار", "azhar", "Blüten"]],
  repeatWrite: [
    ["زَيْنَب", "zaynab", "Zainab (Name)"],
    ["أَزْهَار", "azhar", "Blüten"],
    ["عَزِيزْ", "aziz", "lieb; Aziz (Name)"],
    ["زُهُور", "zuhur", "Blumen"],
    ["زَيْد", "zayd", "Zaid (Name)"],
    ["زِيَاد", "ziyad", "Ziad (Name)"],
    ["عَزَفَ", "azafa", "er spielte (ein Instrument)"],
    ["زِيَادَة", "ziyada", "Zunahme"],
    ["زَارَ", "zara", "er besuchte"],
    ["يَزُورُ", "yazuru", "er besucht"],
    ["عَزَمَ", "azama", "er beschloss"],
    ["جَزِيرَة", "jazira", "Insel"],
    ["جَزَرْ", "jazar", "Karotten"],
    ["أَرُزُّ", "aruzz", "Reis"],
    ["زُمُرُّدْ", "zumurrud", "Smaragd"],
  ],
  pronounce: ["زُ", "زَ", "زِ"],
  dictationLetters: "أ … ي",
  dictation: [
    [blank("تِبْرْ"), "تِبْرْ", "tibr", "Rohgold"],
    [blank("خَرَزْ"), "خَرَزْ", "kharaz", "Perlen"],
    [blank("إِبْرِيزْ"), "إِبْرِيزْ", "ibriz", "reines Gold"],
    [blank("حَرِيرْ", [0]), "حَرِيرْ", "harir", "Seide"],
    [blank("غَزِيرْ", [0]), "غَزِيرْ", "ghazir", "reichlich"],
    [blank("جَدِيرْ"), "جَدِيرْ", "jadir", "würdig"],
    [blank("رَبَابْ"), "رَبَابْ", "rabab", "Rebab (Instrument)"],
    [blank("عَزَفَ", [0, 2]), "عَزَفَ", "azafa", "er spielte"],
    [blank("وَجْدِي"), "وَجْدِي", "wajdi", "Wagdi (Name)"],
    [blank("زُهُورْ", [1]), "زُهُورْ", "zuhur", "Blumen"],
  ],
  notes: { spell: "Beispiel aus dem Buch: تِبْر: ت – ب – ر." },
});

export const a1Sin = unit2Letter({
  letter: { id: "sin", glyph: "س", name: "Sin", nameArabic: "السِّينِ", latin: "s", bookPages: "50–52" },
  words: {
    fatha: [
      ["saa", "سَاعَة", "Uhr", "Sāʿa", [`${V}/saa.svg`, "Eine Uhr"]],
      ["sayyara", "سَيَّارَة", "Auto", "Sayyāra", [`${V}/sayyara.svg`, "Ein Auto"]],
      ["sayyida", "سَيِّدَة", "Dame", "Sayyida", "Eine Dame mit Hut und Tasche"],
    ],
    kasra: [
      ["sijara", "سِيجَارَة", "Zigarette", "Sījāra", "Eine Zigarette"],
      ["sinnara", "سِنَّارَة", "Angel", "Sinnāra", "Eine Angel mit Haken"],
      ["sitara", "سِتَارَة", "Vorhang", "Sitāra", "Ein Vorhang am Fenster"],
    ],
    damma: [
      ["suq", "سُوق", "Markt", "Sūq", "Ein Marktstand mit Obst"],
      ["sullam", "سُلَّم", "Leiter", "Sullam", "Eine Leiter"],
      ["sur", "سُور", "Mauer", "Sūr", "Eine Steinmauer"],
    ],
  },
  positions: {
    items: [
      { id: "start", label: "فِي أَوَّلِ الْكَلِمَةِ", labelGerman: "am Wortanfang", shape: "سـ", word: "سَاعَة", german: "Uhr" },
      { id: "middle", label: "فِي الْمُنْتَصَفِ", labelGerman: "in der Mitte", shape: "ـسـ", word: "حُسَام", german: "Hussam (Name)" },
      { id: "end", label: "فِي الْآخِرِ", labelGerman: "am Wortende", shape: "ـس", word: "لُبْس", german: "Kleidung" },
      { id: "separate", label: "مُنْفَصِل", labelGerman: "allein", shape: "س", word: "جَرَس", german: "Glocke" },
    ],
    sukun: { glyph: "سْ", word: "إِسْتَر", german: "Esther (Name)", more: [{ word: "قِسْم", german: "Abteilung" }, { word: "مَسْجِد", german: "Moschee" }] },
  },
  writing: sinWriting,
  fill: ["sijara", "sayyara", "sitara", "sayyida", "saa", "sullam", "suq", "sinnara", "sur"],
  listen: ["saa", "suq", "sinnara", "sayyida", "sullam", "sur", "sayyara", "sitara", "sijara", ["إِسْتَر", "ester", "Esther (Name)"]],
  repeatWrite: [
    ["سُعَاد", "suad", "Suad (Name)"],
    ["سُور", "sur", "Mauer"],
    ["سِهَام", "siham", "Siham (Name)"],
    ["سَامِي", "sami", "Sami (Name)"],
    ["إِسْتَر", "ester", "Esther (Name)"],
    ["سِيَادَة", "siyada", "Herrschaft"],
    ["سُكَّر", "sukkar", "Zucker"],
    ["سِينِمَا", "sinima", "Kino"],
    ["سُلَّم", "sullam", "Leiter"],
    ["نِسْرِين", "nisrin", "Nisrin (Name)"],
    ["سَامِيَة", "samiya", "Samia (Name)"],
    ["اِسْتِرَاحَة", "istiraha", "Pause"],
    ["سَلَامْ", "salam", "Frieden"],
  ],
  pronounce: ["سُ", "سَ", "سِ"],
  dictationLetters: "أ … س",
  dictation: [
    [blank("سُرُورْ"), "سُرُورْ", "surur", "Freude"],
    [blank("سَارَ"), "سَارَ", "sara", "er ging"],
    [blank("حَارِسْ"), "حَارِسْ", "haris", "Wächter"],
    [blank("سَحَرْ"), "سَحَرْ", "sahar", "Morgendämmerung"],
    [blank("جَرَسْ"), "جَرَسْ", "jaras", "Glocke"],
    [blank("سِيجَارْ"), "سِيجَارْ", "sijar", "Zigarre"],
    [blank("سَاخِرْ"), "سَاخِرْ", "sakhir", "spöttisch"],
    [blank("سِيزَارْ"), "سِيزَارْ", "sizar", "Cäsar (Name)"],
    [blank("بِيتْسَا"), "بِيتْسَا", "pizza", "Pizza"],
    [blank("دَرْسْ"), "دَرْسْ", "dars", "Unterrichtsstunde"],
  ],
  notes: { spell: "Beispiel aus dem Buch: جَرَس: ج – ر – س." },
});

export const a1Shin = unit2Letter({
  letter: { id: "shin", glyph: "ش", name: "Schin", nameArabic: "الشِّينِ", latin: "sh", bookPages: "53–55" },
  words: {
    fatha: [
      ["shajara", "شَجَرَة", "Baum", "Shajara", [`${V}/shajara.svg`, "Ein Baum"]],
      ["shari", "شَارِع", "Straße", "Shāriʿ", "Eine Straße mit Autos"],
      ["shams", "شَمْس", "Sonne", "Shams", [`${V}/shams.svg`, "Die Sonne"]],
    ],
    kasra: [
      ["shibsi", "شِيبْسِي", "Chips", "Shībsī", "Eine Tüte Chips"],
      ["shitaa", "شِتَاء", "Winter", "Shitāʾ", "Regen und Wolken: Winter"],
      ["shiraa", "شِرَاع", "Segel", "Shirāʿ", "Ein Segelboot"],
    ],
    damma: [
      ["shurti", "شُرْطِيّ", "Polizist", "Shurṭiyy", "Ein Polizist mit Mütze"],
      ["shujayra", "شُجَيْرَة", "kleiner Baum, Strauch", "Shujayra", "Eine junge Pflanze"],
      ["shubbak", "شُبَّاك", "Fenster", "Shubbāk", ["/images/a1/ba/shubbak.svg", "Ein offenes Fenster"]],
    ],
  },
  positions: {
    items: [
      { id: "start", label: "فِي أَوَّلِ الْكَلِمَةِ", labelGerman: "am Wortanfang", shape: "شـ", word: "شَجَرَة", german: "Baum" },
      { id: "middle", label: "فِي الْمُنْتَصَفِ", labelGerman: "in der Mitte", shape: "ـشـ", word: "الشَّجَرَة", german: "der Baum" },
      { id: "end", label: "فِي الْآخِرِ", labelGerman: "am Wortende", shape: "ـش", word: "الْعَيْش", german: "das Brot; das Leben" },
      { id: "separate", label: "مُنْفَصِلًا", labelGerman: "allein", shape: "ش", word: "عَاش", german: "er lebte" },
    ],
    sukun: { glyph: "شْ", word: "أَشْجَار", german: "Bäume" },
  },
  writing: shinWriting,
  fill: ["shari", "shajara", "shams", "shibsi", "shitaa", "shiraa", "shurti", "shujayra", "shubbak"],
  listen: ["shari", "shujayra", "shiraa", "shams", "shubbak", "shurti", "shajara", "shibsi", "shitaa", ["أَشْجَار", "ashjar", "Bäume"]],
  repeatWrite: [
    ["شَمْعَة", "shama", "Kerze"],
    ["شُورْبَة", "shurba", "Suppe"],
    ["شُكْرًا", "shukran", "danke"],
    ["عَشَرَة", "ashara", "zehn"],
    ["شُرْطِيّ", "shurti", "Polizist"],
    ["شَبَاب", "shabab", "Jugend"],
    ["أَشْجَار", "ashjar", "Bäume"],
    ["أَشْرَف", "ashraf", "Aschraf (Name)"],
    ["شَرِيف", "sharif", "Scharif (Name)"],
    ["هِشَام", "hisham", "Hischam (Name)"],
    ["شِرَاع", "shiraa", "Segel"],
    ["شَوَارِع", "shawari", "Straßen"],
    ["شُبْرَا", "shubra", "Schubra (Stadtteil von Kairo)"],
  ],
  pronounce: ["شُ", "شَ", "شِ"],
  dictationLetters: "أ … ش",
  dictation: [
    [blank("شُورْبَة", [4]), "شُورْبَة", "shurba", "Suppe"],
    [blank("جَيْشْ"), "جَيْشْ", "jaysh", "Armee"],
    [blank("شَرَابْ"), "شَرَابْ", "sharab", "Getränk"],
    [blank("شَرِبَ"), "شَرِبَ", "shariba", "er trank"],
    [blank("خَشَبْ"), "خَشَبْ", "khashab", "Holz"],
    [blank("أَخْشَابْ"), "أَخْشَابْ", "akhshab", "Hölzer"],
    [blank("جُيُوشْ"), "جُيُوشْ", "juyush", "Armeen"],
    [blank("شَذًا"), "شَذًا", "shadhan", "Duft"],
    [blank("بَيْتِي"), "بَيْتِي", "bayti", "mein Haus"],
    [blank("بُذُورْ"), "بُذُورْ", "budhur", "Samen"],
  ],
});

export const a1Sad = unit2Letter({
  letter: { id: "sad", glyph: "ص", name: "Sad", nameArabic: "الصَّادِ", latin: "ṣ", bookPages: "56–58" },
  words: {
    fatha: [
      ["sarukh", "صَارُوخ", "Rakete", "Ṣārūkh", "Eine Rakete"],
      ["sadiq", "صَدِيق", "Freund", "Ṣadīq", "Zwei Freunde umarmen sich"],
      ["safha", "صَفْحَة", "Seite (im Buch)", "Ṣafḥa", "Eine aufgeschlagene Seite"],
    ],
    kasra: [
      ["as-sin", "الصِّين", "China", "Aṣ-Ṣīn", "China auf der Karte mit einer Laterne"],
      ["sini", "صِينِيّ", "Chinese", "Ṣīniyy", "Ein Mann aus China"],
      ["siniyya", "صِينِيَّة", "Tablett", "Ṣīniyya", "Ein Tablett mit Gläsern"],
    ],
    damma: [
      ["sunduq", "صُنْدُوق", "Kiste", "Ṣundūq", [`${V}/sunduq.svg`, "Eine Kiste"]],
      ["sura", "صُورَة", "Bild", "Ṣūra", ["/images/a1/huruf-al-madd/sura.svg", "Ein Bild im Rahmen"]],
      ["suwar", "صُوَر", "Bilder, Fotos", "Ṣuwar", "Mehrere Fotos"],
    ],
  },
  positions: {
    items: [
      { id: "start", label: "فِي أَوَّلِ الْكَلِمَةِ", labelGerman: "am Wortanfang", shape: "صـ", word: "صُورَة", german: "Bild" },
      { id: "middle", label: "فِي الْمُنْتَصَفِ", labelGerman: "in der Mitte", shape: "ـصـ", word: "الصِّين", german: "China" },
      { id: "end", label: "فِي الْآخِرِ", labelGerman: "am Wortende", shape: "ـص", word: "قَمِيص", german: "Hemd" },
      { id: "separate", label: "مُنْفَصِلًا", labelGerman: "allein", shape: "ص", word: "رَصَاص", german: "Blei", occurrence: -1 },
    ],
    sukun: { glyph: "صْ", word: "إِصْبَع", german: "Finger" },
  },
  writing: sadWriting,
  fill: ["sadiq", "as-sin", "sura", "sarukh", "suwar", "sunduq", "sini", "safha", "siniyya"],
  listen: ["siniyya", "sarukh", "suwar", "as-sin", "sura", "sini", "safha", "sunduq", "sadiq", ["إِصْبَع", "isba", "Finger"]],
  repeatWrite: [
    ["صُبْح", "subh", "Morgen"],
    ["الصُّوَر", "as-suwar", "die Bilder"],
    ["صَبَاح", "sabah", "Morgen"],
    ["قَمِيصْ", "qamis", "Hemd"],
    ["رَصَاصْ", "rasas", "Blei"],
    ["صَدِيق", "sadiq", "Freund"],
    ["مِقَصُّ", "miqass", "Schere"],
    ["صَابِر", "sabir", "Sabir (Name)"],
    ["صُخُور", "sukhur", "Felsen"],
    ["صَخْرَة", "sakhra", "Felsen"],
    ["أَصْفَر", "asfar", "gelb"],
    ["إِصْبَع", "isba", "Finger"],
  ],
  pronounce: ["صُ", "صَ", "صِ"],
  dictationLetters: "أ … ص",
  dictation: [
    [blank("أَشْجَارْ"), "أَشْجَارْ", "ashjar", "Bäume"],
    [blank("رَأْسْ"), "رَأْسْ", "ras", "Kopf"],
    [blank("أَصْحَابْ"), "أَصْحَابْ", "ashab", "Freunde"],
    [blank("سُورْ"), "سُورْ", "sur", "Mauer"],
    [blank("صَبَاحْ"), "صَبَاحْ", "sabah", "Morgen"],
    [blank("رَجُلْ"), "رَجُلْ", "rajul", "Mann"],
    [blank("بِنْتْ"), "بِنْتْ", "bint", "Mädchen"],
    [blank("ثِيَابْ"), "ثِيَابْ", "thiyab", "Kleider"],
    [blank("ثُلُثْ"), "ثُلُثْ", "thuluth", "Drittel"],
    [blank("حِذَاء"), "حِذَاء", "hidhaa", "Schuh"],
    [blank("خِيَارْ"), "خِيَارْ", "khiyar", "Gurke"],
    [blank("دَوَاء"), "دَوَاء", "dawaa", "Medizin"],
  ],
});

export const a1Dad = unit2Letter({
  letter: { id: "dad", glyph: "ض", name: "Dad", nameArabic: "الضَّادِ", latin: "ḍ", bookPages: "59–61" },
  words: {
    fatha: [
      ["dabit", "ضَابِط", "Offizier", "Ḍābiṭ", "Ein Offizier in Uniform"],
      ["dayf", "ضَيْف", "Gast", "Ḍayf", "Ein Gast auf dem Sofa, ihm wird Tee gebracht"],
      ["darb", "ضَرْب", "Schlagen", "Ḍarb", "Eine Hand, die schlägt"],
    ],
    kasra: [
      ["dirs", "ضِرْس", "Backenzahn", "Ḍirs", [`${V}/dirs.svg`, "Ein Backenzahn"]],
      ["diyaa", "ضِيَاء", "Diaa (Name; „Licht“)", "Ḍiyāʾ", "Ein junger Mann (Diaa)"],
      ["dil", "ضِلْع", "Rippe", "Ḍilʿ", "Rippen"],
    ],
    damma: [
      ["durus", "ضُرُوس", "Backenzähne", "Ḍurūs", "Eine Reihe Backenzähne"],
      ["dubbat", "ضُبَّاط", "Offiziere", "Ḍubbāṭ", "Mehrere Offiziere"],
      ["duyuf", "ضُيُوف", "Gäste", "Ḍuyūf", "Gäste im Wohnzimmer"],
    ],
  },
  positions: {
    items: [
      { id: "start", label: "فِي أَوَّلِ الْكَلِمَةِ", labelGerman: "am Wortanfang", shape: "ضـ", word: "ضَابِط", german: "Offizier" },
      { id: "middle", label: "فِي الْمُنْتَصَفِ", labelGerman: "in der Mitte", shape: "ـضـ", word: "الضَّابِط", german: "der Offizier" },
      { id: "end", label: "فِي الْآخِرِ", labelGerman: "am Wortende", shape: "ـض", word: "بَيْض", german: "Eier" },
      { id: "separate", label: "مُنْفَصِلًا", labelGerman: "allein", shape: "ض", word: "عَرْض", german: "Vorführung" },
    ],
    sukun: { glyph: "ضْ", word: "مِضْرَب", german: "Schläger" },
  },
  writing: dadWriting,
  fill: ["dirs", "darb", "durus", "dubbat", "dabit", "dayf", "diyaa", "duyuf", "dil"],
  // Book: ضُرُوس twice (3 and 8), ضُبَّاط not in this exercise – as printed.
  listen: ["dil", "darb", "durus", "diyaa", "dayf", "dabit", "dirs", "durus", "duyuf", ["مِضْرَب", "midrab", "Schläger"]],
  repeatWrite: [
    ["ضَبُع", "dabu", "Hyäne"],
    ["ضِبَاع", "dibaa", "Hyänen"],
    ["ضِلْع", "dil", "Rippe"],
    ["ضُلُوع", "duluu", "Rippen"],
    ["مِضْرَب", "midrab", "Schläger"],
    ["ضَوْءْ", "daw", "Licht"],
    ["ضِيَاء", "diyaa", "Licht"],
    ["ضَبْط", "dabt", "Genauigkeit"],
    ["اِضْرِبْ", "idrib", "schlag!"],
    ["بَعْضْ", "bad", "einige"],
    ["بَعُوضَة", "bauda", "Mücke"],
    ["ضِفْدَع", "difda", "Frosch"],
    ["ضَفَادِع", "fadadi", "Frösche"],
  ],
  pronounce: ["ضُ", "ضَ", "ضِ"],
  dictationLetters: "أ … ض",
  dictation: [
    [blank("حَوْضْ"), "حَوْضْ", "hawd", "Becken"],
    [blank("ضِرْسْ"), "ضِرْسْ", "dirs", "Backenzahn"],
    [blank("بَيْضْ"), "بَيْضْ", "bayd", "Eier"],
    [blank("ضَادْ"), "ضَادْ", "dad", "der Buchstabe Dad"],
    [blank("ضَرْبْ"), "ضَرْبْ", "darb", "Schlagen"],
    [blank("ضَارْ"), "ضَارْ", "dar", "schädlich"],
    [blank("أَبْيَضْ"), "أَبْيَضْ", "abyad", "weiß"],
    [blank("اِضْرِبْ"), "اِضْرِبْ", "idrib", "schlag!"],
    [blank("ضَرَرْ"), "ضَرَرْ", "darar", "Schaden"],
    [blank("بَاضَتْ"), "بَاضَتْ", "badat", "sie legte (ein Ei)"],
  ],
});
