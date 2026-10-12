import type { A1Lesson, CompareItem, GapItem, MatchContent } from "@/data/types";

import { dictationItem, gaps2, WRITE_INTRO } from "./letter-entry";

// A1 · Lektion 2 · "حُرُوفُ الْمَدّ – الفرق بين الحركات الطويلة والقصيرة"
// ("مساء الخير.pdf", pages 35–39): the long vowels ā ū ī, written with ا و ي,
// against the short vowel signs – listen and compare (Alif, Waw, Ya), then the
// book's exercises 1–9 in book order. Exercise 4 ("ادخل إلى الموقع") sends the
// learner to the publisher's website and has no content in the book.
// Whether a word has a long vowel is computed (src/lib/arabic/madd.ts).
// Nothing here is evaluated by the pronunciation engine: the book asks to
// listen, read and write, and IQRA's long / short vowels were not verified.

const IMG = "/images/a1/huruf-al-madd";

type ItemSpec = [arabic: string, german?: string, tag?: CompareItem["tag"], label?: string];
let counter = 0;
const row = (...items: ItemSpec[]): CompareItem[] =>
  items.map(([arabic, german, tag, label]) => ({ id: `m${++counter}`, arabic, ...(german ? { german } : {}), ...(tag ? { tag } : {}), ...(label ? { label } : {}) }));
/** A reading row "اقرأ": the long syllables. */
const readRow = (syllables: string) => row(...syllables.split(" ").map((s): ItemSpec => [s, undefined, "long"]));

const picture = (file: string, alt: string, label: string) => ({ src: file.startsWith("/") ? file : `${IMG}/${file}.svg`, alt, label });

// ---------------------------------------------------------------------------
// Exercise 5 (pictures) and 1 share the pictures of the section.

const PICTURES = {
  taj: { src: "/images/vocabulary/taj.svg", alt: "Eine Krone" },
  bab: { src: "/images/vocabulary/bab.svg", alt: "Eine Tür" },
  tuyur: { src: `${IMG}/tuyur.svg`, alt: "Vögel auf einem Ast" },
  dik: { src: "/images/a1/dal/dik.svg", alt: "Ein Hahn" },
  fil: { src: "/images/vocabulary/fil.svg", alt: "Ein Elefant" },
  sura: { src: `${IMG}/sura.svg`, alt: "Ein Bild: ein Segelboot auf dem Fluss" },
  yasamin: { src: `${IMG}/yasamin.svg`, alt: "Eine Frau mit langen Haaren (Yasmin)" },
  kitab: { src: "/images/vocabulary/kitab.svg", alt: "Ein aufgeschlagenes Buch" },
  amil: { src: `${IMG}/amil.svg`, alt: "Ein Arbeiter mit Werkzeugkoffer" },
};

/** Exercise 1 (with pictures): write the missing letters – each gap gets its own tiles. */
const fillItem = (n: number, pattern: string, arabic: string, german: string, image: { src: string; alt: string }): GapItem => ({ ...dictationItem(`fill-${n}`, pattern, arabic, german), image });

/** Exercise 2: listen and write the missing ا، و or ي. */
const longItem = (n: number, pattern: string, arabic: string, german: string): GapItem => ({ ...dictationItem(`long-${n}`, pattern, arabic, german), gapChoices: undefined, choices: ["ا", "و", "ي"] });

/** Exercise 6: the book's letters (without signs) put in order. `spoken` is the vocalised word. */
const arrangeItem = (n: number, word: string, spoken: string, german: string, letters: string[]): GapItem => ({
  id: `arrange-${n}`,
  arabic: word,
  spoken,
  german,
  pattern: "_".repeat(Array.from(word).length),
  bare: true,
  choices: [...new Set(letters)],
});

/** Exercise 7: the words to read (book order). */
const READ_WORDS = [
  "جَاب", "ذُو", "دُود", "بَيْت", "وَجْدِي", "بَاب", "دُودِي", "يَدِي", "أَخِي", "بِيَدِي", "دَوَاب", "أَخَذَ", "ذِي",
  "ذَا", "ذَات", "ذَاتِي", "خَاب", "بَخْت", "تَحْتِي", "بِذَاتِي", "وَحْدِي", "ثَوْبِي", "بَيْتِي", "أُخْتِي",
];

const MATCH_PICTURES: MatchContent = {
  promptTitle: "Wort",
  optionTitle: "Bilder",
  prompts: [
    { id: "taj", arabic: "تَاج", answer: "a", example: true },
    { id: "sura", arabic: "صُورَة", answer: "w" },
    { id: "tuyur", arabic: "طُيُور", answer: "j" },
    { id: "dik", arabic: "دِيك", answer: "d" },
    { id: "yasamin", arabic: "يَاسَمِين", answer: "z" },
    { id: "bab", arabic: "بَاب", answer: "b" },
    { id: "kitab", arabic: "كِتَاب", answer: "h" },
    { id: "amil", arabic: "عَامِل", answer: "t" },
    { id: "fil", arabic: "فِيل", answer: "he" },
  ],
  options: [
    { id: "a", label: "أ", image: PICTURES.taj },
    { id: "b", label: "ب", image: PICTURES.bab },
    { id: "j", label: "ج", image: PICTURES.tuyur },
    { id: "d", label: "د", image: PICTURES.dik },
    { id: "he", label: "هـ", image: PICTURES.fil },
    { id: "w", label: "و", image: PICTURES.sura },
    { id: "z", label: "ز", image: PICTURES.yasamin },
    { id: "h", label: "ح", image: PICTURES.kitab },
    { id: "t", label: "ط", image: PICTURES.amil },
  ],
};

const MATCH_LETTERS: MatchContent = {
  promptTitle: "Die Buchstaben (getrennt)",
  optionTitle: "Die Wörter",
  prompts: [
    { id: "tut", arabic: "ت – و – ت", answer: "tut", result: { arabic: "تُوت", german: "Maulbeeren" } },
    { id: "jab", arabic: "ج – ا – ب", answer: "jab", result: { arabic: "جَاب", german: "er durchwanderte" } },
    { id: "yadi", arabic: "ي – د – ي", answer: "yadi", result: { arabic: "يَدِي", german: "meine Hand" } },
    { id: "bayti", arabic: "ب – ي – ت – ي", answer: "bayti", result: { arabic: "بَيْتِي", german: "mein Haus" } },
    { id: "wajdi", arabic: "و – ج – د – ي", answer: "wajdi", result: { arabic: "وَجْدِي", german: "Wagdi (Name)" } },
    { id: "thawbi", arabic: "ث – و – ب – ي", answer: "thawbi", result: { arabic: "ثَوْبِي", german: "mein Gewand" } },
    { id: "ukhti", arabic: "أ – خ – ت – ي", answer: "ukhti", result: { arabic: "أُخْتِي", german: "meine Schwester" } },
    { id: "tahti", arabic: "ت – ح – ت – ي", answer: "tahti", result: { arabic: "تَحْتِي", german: "unter mir" } },
    { id: "rida", arabic: "ر – ض – ا", answer: "rida", example: true, result: { arabic: "رِضَا", german: "Rida (Name)" } },
    { id: "wahid", arabic: "و – ح – ي – د", answer: "wahid", result: { arabic: "وَحِيد", german: "allein; Wahid (Name)" } },
  ],
  // The book's word column, top to bottom.
  options: [
    { id: "rida", label: "رِضَا", arabic: "رِضَا" },
    { id: "tahti", label: "تَحْتِي", arabic: "تَحْتِي" },
    { id: "jab", label: "جَاب", arabic: "جَاب" },
    { id: "yadi", label: "يَدِي", arabic: "يَدِي" },
    { id: "ukhti", label: "أُخْتِي", arabic: "أُخْتِي" },
    { id: "wajdi", label: "وَجْدِي", arabic: "وَجْدِي" },
    { id: "thawbi", label: "ثَوْبِي", arabic: "ثَوْبِي" },
    { id: "bayti", label: "بَيْتِي", arabic: "بَيْتِي" },
    { id: "wahid", label: "وَحِيد", arabic: "وَحِيد" },
    { id: "tut", label: "تُوت", arabic: "تُوت" },
  ],
};

export const a1HurufAlMadd: A1Lesson = {
  slug: "huruf-al-madd",
  kind: "topic",
  label: "حُرُوفُ الْمَدّ",
  labelGerman: "Lange und kurze Vokale",
  steps: [
    {
      kind: "compare",
      slug: "step-1",
      title: "Langes ā: بَا · بَ",
      navLabel: "Langes ā",
      instruction: { arabic: "أَوَّلًا: الْمَدُّ بِالْأَلِفِ", german: "Lange Vokale (حُرُوفُ الْمَدّ): ein langes ā wird mit Alif geschrieben – ein kurzes a nur mit der Fatha." },
      sections: [
        {
          id: "alif-pairs",
          titleArabic: "١) اِسْمَعْ وَلَاحِظِ الْفَرْقَ فِي الصَّوْتِ:",
          title: "Hör zu und achte auf den Unterschied: lang – kurz",
          note: "Lang: Fatha + Alif (بَا). Kurz: nur die Fatha (بَ). Das Alif hat dabei kein eigenes Zeichen.",
          pictures: [picture(PICTURES.bab.src, "Eine Tür", "بَاب"), picture(PICTURES.amil.src, "Ein Arbeiter mit Werkzeugkoffer", "عَامِل")],
          rows: [row(["بَاب", "Tür", "long"], ["بَب", undefined, "short"]), row(["تَاب", "er bereute", "long"], ["تَب", undefined, "short"]), row(["عَامِل", "Arbeiter", "long"], ["عَمَل", "Arbeit", "short"]), row(["كِتَاب", "Buch", "long"], ["كَتَبَ", "er schrieb", "short"])],
        },
        {
          id: "alif-hamza",
          titleArabic: "٢) الْفَرْقُ فِي الْكِتَابَةِ وَالنُّطْقِ بَيْنَ «أَلِفِ الْهَمْزَةِ» وَ«أَلِفِ الْمَدِّ»:",
          title: "Alif mit Hamza oder Alif als Dehnung?",
          note: "Das Alif mit Hamza (أ) ist ein Konsonant: ein kurzer Stopp im Hals. Das Alif ohne Hamza (ا) nach einer Fatha macht das a lang.",
          rows: [row(["سَأَلَ", "er fragte", "hamza"], ["سَالَ", "es floss", "long"]), row(["بَدَأَ", "er begann", "hamza"], ["بَدَا", "es schien", "long"])],
        },
        {
          id: "hamza",
          titleArabic: "لَاحِظْ فَرْقَ النُّطْقِ: ١) الْهَمْزَةُ",
          title: "Achte auf die Aussprache: die Hamza",
          rows: [row(["أَخ", "Bruder", "hamza"], ["أُخْت", "Schwester", "hamza"], ["أُسْتَاذ", "Lehrer", "hamza"], ["سَأَلَ", "er fragte", "hamza"], ["رَأْس", "Kopf", "hamza"])],
        },
        {
          id: "alif-long",
          titleArabic: "٢) الْمَدُّ بِالْأَلِفِ:",
          title: "Langes ā mit Alif",
          note: "Am Wortanfang schreibt man ein langes ā mit Madda: آ (آخِر، آمِن). In der Mitte und am Ende steht ا nach der Fatha (بَابَا، هُنَا). Die Hamza (أ) dagegen ist ein eigener Laut.",
          rows: [
            row(["بَابَا", "Papa", "long"], ["مَامَا", "Mama", "long"], ["آخِر", "letzter", "long"], ["آمِن", "sicher", "long"]),
            row(["هُنَا", "hier", "long"], ["أَنَا", "ich", "long"], ["سَالَ", "es floss", "long"], ["مَالَ", "es neigte sich", "long"]),
            row(["عَاجَ", "Elfenbein", "long"], ["عَامِل", "Arbeiter", "long"], ["مَهَا", "Maha (Name)", "long"]),
          ],
        },
        { id: "alif-read", titleArabic: "اِقْرَأْ:", title: "Lies", rows: [readRow("بَا تَا ثَا جَا حَا خَا دَا ذَا وَا يَا")] },
      ],
    },
    {
      kind: "compare",
      slug: "step-2",
      title: "Langes ū: بُو · بُ",
      navLabel: "Langes ū",
      instruction: { arabic: "ثَانِيًا: الْمَدُّ بِالْوَاوِ", german: "Ein langes ū wird mit Waw geschrieben – ein kurzes u nur mit der Damma." },
      sections: [
        {
          id: "waw-pairs",
          titleArabic: "١- اِسْمَعْ وَلَاحِظِ الْفَرْقَ فِي الصَّوْتِ:",
          title: "Hör zu und achte auf den Unterschied: lang – kurz",
          note: "Lang: Damma + Waw (بُو). Kurz: nur die Damma (بُ).",
          pictures: [picture(PICTURES.sura.src, PICTURES.sura.alt, "صُورَة"), picture(PICTURES.tuyur.src, PICTURES.tuyur.alt, "طُيُور")],
          rows: [row(["صُورَة", "Bild", "long"], ["صُرَّة", "Bündel", "short"]), row(["طُيُور", "Vögel", "long"], ["طُيُر", undefined, "short"]), row(["سُوق", "Markt", "long"], ["سُق", undefined, "short"])],
        },
        {
          id: "waw-letter",
          titleArabic: "٢- الْفَرْقُ فِي الصَّوْتِ بَيْنَ (و) الْحَرْفِ وَ(و) الْمَدِّ:",
          title: "و als Konsonant (w) oder als langes ū?",
          note: "Mit eigenem Vokalzeichen (وَ) ist das Waw ein Konsonant: w. Ohne Zeichen nach einer Damma (ـُو) macht es das u lang.",
          rows: [row(["وَصَلَ", "er kam an", "consonant"], ["وُصُول", "Ankunft", "long"]), row(["وَجَدَ", "er fand", "consonant"], ["وُجُود", "Dasein", "long"]), row(["وَلَدَ", "sie gebar", "consonant"], ["وُلُود", "kinderreich", "long"]), row(["وَرْد", "Rosen", "consonant"], ["وُرُود", "Blumen", "long"])],
        },
        { id: "waw-read", titleArabic: "اِقْرَأْ:", title: "Lies", rows: [readRow("بُو تُو ثُو جُو حُو خُو دُو ذُو وُو يُو")] },
      ],
    },
    {
      kind: "compare",
      slug: "step-3",
      title: "Langes ī: بِي · بِ",
      navLabel: "Langes ī",
      instruction: { arabic: "ثَالِثًا: الْمَدُّ بِالْيَاءِ", german: "Ein langes ī wird mit Ya geschrieben – ein kurzes i nur mit der Kasra." },
      sections: [
        {
          id: "ya-pairs",
          titleArabic: "١- اِسْمَعْ وَلَاحِظِ الْفَرْقَ فِي الصَّوْتِ:",
          title: "Hör zu und achte auf den Unterschied: lang – kurz",
          note: "Lang: Kasra + Ya (بِي). Kurz: nur die Kasra (بِ).",
          pictures: [picture(PICTURES.dik.src, PICTURES.dik.alt, "دِيك"), picture(PICTURES.yasamin.src, PICTURES.yasamin.alt, "يَاسَمِين")],
          rows: [row(["دِيك", "Hahn", "long"], ["دِك", undefined, "short"]), row(["يَاسَمِينُ", "Jasmin; Yasmin (Name)", "long"], ["يَاسَمِنُ", undefined, "short"]), row(["يَمِين", "rechts", "long"], ["يَمِن", undefined, "short"])],
        },
        {
          id: "ya-letter",
          titleArabic: "٢- الْفَرْقُ فِي الصَّوْتِ بَيْنَ (ي) الْحَرْفِ وَ(ي) الْمَدِّ",
          title: "ي als Konsonant (y) oder als langes ī?",
          note: "Mit eigenem Vokalzeichen (يَ، يُ) ist das Ya ein Konsonant: y. Ohne Zeichen nach einer Kasra (ـِي) macht es das i lang.",
          rows: [row(["الْيَمَن", "Jemen", "consonant"], ["الْيَمِين", "die rechte Seite", "long"]), row(["يُسْرَا", "Yusra (Name)", "consonant"], ["يَسِير", "leicht", "long"]), row(["يَجِد", "er findet", "consonant"], ["يُجْدِي", "es nützt", "long"])],
        },
        {
          id: "ya-huda",
          titleArabic: "٣- لَاحِظْ نُطْقَ هُدَى – مَجْدِي",
          title: "Achte auf die Aussprache: هُدَى – مَجْدِي",
          note: "Beide Namen enden lang: هُدَى auf ā (geschrieben mit ى ohne Punkte), مَجْدِي auf ī (mit ي). Mehr dazu in der nächsten Lektion.",
          rows: [row(["هُدَى", "Huda (Name)", "long"], ["مَجْدِي", "Magdi (Name)", "long"])],
        },
        { id: "ya-read", titleArabic: "اِقْرَأْ:", title: "Lies", rows: [readRow("بِي تِي جِي حِي خِي دِي ذِي وِي يِي")] },
        {
          id: "ya-three",
          titleArabic: "٤- لَاحِظِ الْفَرْقَ فِي الصَّوْتِ:",
          title: "Drei Arten von ي",
          note: "ي als Dehnung (langes ī), ي mit Kasra (yi) und ي mit Sukun (ay, wie in „bayt“).",
          rows: [row(["سَمِير", "Samir (Name)", "long", "يَاءُ الْمَدِّ"], ["يِن", "Yen", "consonant", "يَاءُ كَسْرَةٍ"], ["بَيْت", "Haus", "consonant", "يَاءٌ سَاكِنَةٌ"])],
        },
      ],
    },
    {
      kind: "gaps",
      slug: "step-4",
      title: "Übung 1: Ergänzen",
      navLabel: "Übung 1",
      instruction: { arabic: "تَدْرِيبٌ (١): اُكْتُبِ الْحَرْفَ النَّاقِصَ بِالتَّشْكِيلِ.", german: "Übung 1: Schreib die fehlenden Buchstaben – mit ihren Zeichen.", note: "Die Lösungswörter stehen im Buch auf Seite 39. Ein Buchstabe am Wortende ohne Vokal wird mit Sukun geschrieben." },
      gaps: gaps2(
        "picture",
        ["ا", "و", "ي"],
        [
          fillItem(1, "__ك", "دِيك", "Hahn", PICTURES.dik),
          fillItem(2, "صُ_رَة", "صُورَة", "Bild", PICTURES.sura),
          fillItem(3, "___", "بَابْ", "Tür", PICTURES.bab),
          fillItem(4, "عَ_مِل", "عَامِل", "Arbeiter", PICTURES.amil),
          fillItem(5, "طُ_ور", "طُيُور", "Vögel", PICTURES.tuyur),
          fillItem(6, "__سَمِ_نُ", "يَاسَمِينُ", "Jasmin; Yasmin (Name)", PICTURES.yasamin),
          fillItem(7, "كِ___", "كِتَابْ", "Buch", PICTURES.kitab),
          fillItem(8, "فِ_ل", "فِيل", "Elefant", PICTURES.fil),
        ],
        WRITE_INTRO
      ),
    },
    {
      kind: "gaps",
      slug: "step-5",
      title: "Übung 2: Hören – ا · و · ي",
      navLabel: "Übung 2",
      instruction: { arabic: "تَدْرِيبٌ (٢): اِسْمَعْ مِنَ الْمُدَرِّسِ وَاكْتُبِ الْحَرْفَ (ا، و، ي) النَّاقِصَ بِالتَّشْكِيلِ.", german: "Übung 2: Hör zu und ergänze das fehlende ا, و oder ي.", note: "Im Buch steht سُبُّورَة; hier steht die übliche Form سَبُّورَة (Tafel)." },
      gaps: gaps2("listen", ["ا", "و", "ي"], [
        longItem(1, "صُ_رَة", "صُورَة", "Bild"),
        longItem(2, "كِتَ_ب", "كِتَاب", "Buch"),
        longItem(3, "عَ_مِل", "عَامِل", "Arbeiter"),
        longItem(4, "دِ_ك", "دِيك", "Hahn"),
        longItem(5, "سَبُّ_رَة", "سَبُّورَة", "Tafel"),
        longItem(6, "بَ_بَ_", "بَابَا", "Papa"),
        longItem(7, "طُيُ_ر", "طُيُور", "Vögel"),
        longItem(8, "يَاسَمِ_ن", "يَاسَمِين", "Jasmin; Yasmin (Name)"),
        longItem(9, "بَ_ب", "بَاب", "Tür"),
        longItem(10, "سُ_ق", "سُوق", "Markt"),
      ]),
    },
    {
      kind: "gaps",
      slug: "step-6",
      title: "Übung 3: Nachsprechen & schreiben",
      navLabel: "Übung 3",
      instruction: {
        arabic: "تَدْرِيبٌ (٣): كَرِّرْ بَعْدَ الْمُدَرِّسِ وَاكْتُبِ التَّشْكِيلَ.",
        german: "Übung 3: Sprich die langen Vokale nach und schreib das Wort mit seinen Zeichen.",
        note: "Die Übung 4 im Buch („اُدْخُلْ إِلَى الْمَوْقِعِ“) verweist auf die Website des Buchverlags; im Buch stehen dazu keine Aufgaben. Die Endung ة steht hier schon da.",
      },
      gaps: {
        ...gaps2(
          "listen",
          ["ا", "و", "ي"],
          (
            [
              ["___", "فِيلْ", "Elefant"],
              ["____", "وُصُولْ", "Ankunft"],
              ["____", "جَمِيلْ", "schön"],
              ["____ة", "سَفِينَة", "Schiff"],
              ["____", "بُيُوتْ", "Häuser"],
              ["____", "كِتَابْ", "Buch"],
              ["____ة", "سَبُّورَة", "Tafel"],
              ["____", "وُرُودْ", "Blumen"],
              ["___", "تِينْ", "Feigen"],
              ["___", "خَوْخْ", "Pfirsiche"],
              ["___", "أَخِي", "mein Bruder"],
              ["____", "أُخْتِي", "meine Schwester"],
              ["___", "بَاتَ", "er übernachtete"],
              ["____", "مَجْدِي", "Magdi (Name)"],
              ["____", "جَابِي", "Kassierer"],
              ["___", "مُنَى", "Muna (Name)"],
            ] as Array<[string, string, string]>
          ).map(([pattern, arabic, german], n) => dictationItem(`write-${n + 1}`, pattern, arabic, german)),
          WRITE_INTRO
        ),
        repeat: true,
      },
    },
    {
      kind: "match",
      slug: "step-7",
      title: "Übung 5: Bild und Wort",
      navLabel: "Übung 5",
      instruction: { arabic: "تَدْرِيبٌ (٥): اُكْتُبْ رَقْمَ الصُّورَةِ أَمَامَ الْكَلِمَةِ الصَّحِيحَةِ كَمَا فِي الْمِثَالِ.", german: "Übung 5: Welches Bild gehört zu welchem Wort? Wie im Beispiel: تَاج = (أ)." },
      match: MATCH_PICTURES,
    },
    {
      kind: "gaps",
      slug: "step-8",
      title: "Übung 6: Buchstaben ordnen",
      navLabel: "Übung 6",
      instruction: { arabic: "تَدْرِيبٌ (٦): رَتِّبِ الْحُرُوفَ لِتُكَوِّنَ كَلِمَةً وَاكْتُبْهَا.", german: "Übung 6: Ordne die Buchstaben zu einem Wort und schreib es – von rechts nach links." },
      gaps: gaps2(
        "picture",
        ["ت", "ا", "ج"],
        [
          arrangeItem(1, "تاج", "تَاج", "Krone", ["ج", "ا", "ت"]),
          arrangeItem(2, "فيل", "فِيل", "Elefant", ["ف", "ل", "ي"]),
          arrangeItem(3, "باب", "بَاب", "Tür", ["ا", "ب", "ب"]),
          arrangeItem(4, "كتاب", "كِتَاب", "Buch", ["ب", "ك", "ا", "ت"]),
          arrangeItem(5, "عامل", "عَامِل", "Arbeiter", ["ع", "ل", "ا", "م"]),
          arrangeItem(6, "ياسمين", "يَاسَمِين", "Jasmin; Yasmin (Name)", ["ي", "س", "م", "ن", "ا", "ي"]),
          arrangeItem(7, "ديك", "دِيك", "Hahn", ["ك", "د", "ي"]),
        ],
        { clip: "shared/arrange_intro", text: "Ordne die Buchstaben: Leg sie von rechts nach links in die Felder, so dass ein Wort entsteht." }
      ),
    },
    {
      kind: "word-pick",
      slug: "step-9",
      title: "Übung 7: Lesen und unterstreichen",
      navLabel: "Übung 7",
      instruction: {
        arabic: "تَدْرِيبٌ (٧): ١) اِقْرَأْ هَذِهِ الْكَلِمَاتِ. ٢) ضَعْ خَطًّا تَحْتَ الْكَلِمَاتِ الَّتِي لَيْسَتْ بِهَا حُرُوفُ مَدٍّ.",
        german: "Übung 7: Lies die Wörter (tippe auf 🔊 zum Anhören). Dann unterstreiche die Wörter OHNE Dehnungsbuchstaben.",
      },
      pick: { find: "no-madd", goal: "Unterstreiche die Wörter ohne Dehnungsbuchstaben (ohne langes ā, ū, ī).", words: READ_WORDS.map((arabic, n) => ({ id: `w${n + 1}`, arabic })) },
    },
    {
      kind: "match",
      slug: "step-10",
      title: "Übung 8: Buchstaben verbinden",
      navLabel: "Übung 8",
      instruction: { arabic: "تَدْرِيبٌ (٨): صِلِ الْحُرُوفَ لِتُكَوِّنَ كَلِمَةً ثُمَّ صِلْهَا بِالْكَلِمَةِ الصَّحِيحَةِ.", german: "Übung 8: Verbinde die Buchstaben zu einem Wort und ordne es dem richtigen Wort zu – wie im Beispiel ر – ض – ا = رِضَا." },
      match: MATCH_LETTERS,
    },
    {
      kind: "gaps",
      slug: "step-11",
      title: "Übung 9: Diktat",
      navLabel: "Übung 9",
      instruction: {
        arabic: "تَدْرِيبٌ (٩): اُكْتُبْ مَا يُمْلَى عَلَيْكَ.",
        german: "Übung 9: Diktat – hör zu und schreib das ganze Wort.",
        note: "Im Buch wählt der Lehrer Wörter aus Übung 7. Alif diktiert diese zehn Wörter aus Übung 7 (nur Buchstaben, die du schon kennst).",
      },
      gaps: gaps2(
        "listen",
        ["ا", "و", "ي"],
        (
          [
            ["__", "ذُو", "Besitzer von"],
            ["___", "دُودْ", "Würmer"],
            ["___", "بَيْتْ", "Haus"],
            ["___", "بَابْ", "Tür"],
            ["___", "يَدِي", "meine Hand"],
            ["___", "أَخِي", "mein Bruder"],
            ["___", "أَخَذَ", "er nahm"],
            ["___", "ذَاتْ", "Wesen; selbst"],
            ["___", "خَابْ", "er scheiterte"],
            ["___", "بَخْتْ", "Glück"],
          ] as Array<[string, string, string]>
        ).map(([pattern, arabic, german], n) => dictationItem(`dictation-${n + 1}`, pattern, arabic, german)),
        WRITE_INTRO
      ),
    },
  ],
};
