import type { A1Lesson, A1Word, ClozeItem, Dialogue, DialogueSpeaker, PhraseItem, QuizItem, TableCell } from "@/data/types";
import { transliterate } from "@/lib/arabic/transliterate";

import { unvocalised } from "../letter-lesson";
import { dictationItem, gaps2, WRITE_INTRO } from "../lesson-2/letter-entry";
import { lines } from "../sabah-al-khayr";
import { blank } from "../unit-2/letter-entry";
import { differenceItem } from "./letter-entry";

// Unit 3 · تقديم (٢) "مِنْ أَيْنَ أَنْتَ؟" (book pages 111–121, PDF 143–153):
//   الشَّدَّة وَالتَّاء الْمَرْبُوطَة: (١) النطق – nine words, لاحظ القواعد, تدريب ١–٣.
//   مراجعة عامة على الحروف وأصواتها: تدريب ١–٣ (٢: خ / غ).
//   المحادثة "مِنْ أَيْنَ أَنْتَ؟": حوار صورة (١) and (٢), لاحظ القواعد (greeting
//   table; اللام الشمسية / القمرية), تدريب ١–٦, تذكر.
//   The alphabet in all its forms (book pages 119–121).

const V = "/images/vocabulary";
const IMG = "/images/a1/unit-3";

const word = (id: string, arabic: string, german: string, src: string, alt: string): A1Word => ({
  id,
  arabic,
  german,
  transliteration: transliterate(arabic),
  image: { src, alt },
  exercise: { id, target: unvocalised(arabic), modelText: arabic },
});

// ---------------------------------------------------------------------------
// الشَّدَّة وَالتَّاء الْمَرْبُوطَة

const SHADDA_WORDS: A1Word[] = [
  word("sabbura", "سَبُّورَة", "Tafel", `${IMG}/sabbura.svg`, "Eine Tafel auf einem Gestell"),
  word("nazzara", "نَظَّارَة", "Brille", `${IMG}/nazzara.svg`, "Eine Brille"),
  word("sayyara", "سَيَّارَة", "Auto", `${V}/sayyara.svg`, "Ein Auto"),
  word("sayyida", "سَيِّدَة", "Dame", "/images/a1/sin/sayyida.svg", "Eine Dame"),
  word("ghassala", "غَسَّالَة", "Waschmaschine", `${V}/ghassala.svg`, "Eine Waschmaschine"),
  word("thallaja", "ثَلَّاجَة", "Kühlschrank", `${IMG}/thallaja.svg`, "Ein Kühlschrank"),
  word("hadiyya", "هَدِيَّة", "Geschenk", "/images/a1/ha/hadiyya.svg", "Ein Geschenk mit Schleife"),
  word("shubbak", "شُبَّاك", "Fenster", "/images/a1/ba/shubbak.svg", "Ein offenes Fenster"),
  word("sukkar", "سُكَّر", "Zucker", `${IMG}/sukkar.svg`, "Zuckerwürfel auf einem Teller und eine Tasse Tee"),
];
const byId = new Map(SHADDA_WORDS.map((w) => [w.id, w]));


/** تدريب ١: the book's six pictures, in its order (right to left, top to bottom). */
const PICTURE_WORDS = ["sayyida", "nazzara", "hadiyya", "sayyara", "thallaja", "shubbak"];
const PICTURE_OPTIONS = ["سَيَّارَة", "نَظَّارَة", "شُبَّاك", "هَدِيَّة", "ثَلَّاجَة", "سَيِّدَة"];

/** تدريب ٢: the letters as printed, and the word. */
const SPELLED: Array<[letters: string, arabic: string, id: string, german: string]> = [
  ["س ب ب و ر ة", "سَبُّورَة", "sabbura", "Tafel"],
  ["غ س س ا ل ة", "غَسَّالَة", "ghassala", "Waschmaschine"],
  ["س ك ك ر", "سُكَّرْ", "sukkar", "Zucker"],
  ["ت ف ف ا ح ة", "تُفَّاحَة", "tuffaha", "Apfel"],
  ["ث ل ل ا ج ة", "ثَلَّاجَة", "thallaja", "Kühlschrank"],
];

export const a1Shadda: A1Lesson = {
  slug: "shadda",
  kind: "letter",
  label: "ـّ / ة",
  labelGerman: "Schadda und Ta marbuta",
  steps: [
    {
      kind: "words",
      slug: "step-1",
      title: "Wörter mit Schadda ـّ",
      navLabel: "Wörter",
      instruction: { arabic: "الشَّدَّةُ وَالتَّاءُ الْمَرْبُوطَةُ · (١) النُّطْقُ: كَرِّرْ بَعْدَ الْمُدَرِّسِ.", german: "Aussprache: Hör zu und sprich nach. In jedem Wort steht eine Schadda (ـّ) – der Buchstabe wird doppelt gesprochen." },
      groups: [{ id: "shadda-words", words: SHADDA_WORDS }],
    },
    {
      kind: "table",
      slug: "step-2",
      title: "Regeln: Schadda und Ta marbuta",
      navLabel: "Regeln",
      instruction: { arabic: "لَاحِظِ الْقَوَاعِدَ", german: "Achte auf die Regeln: die Schadda verdoppelt einen Buchstaben; das Ta marbuta (ة) zeigt das Femininum." },
      tables: [
        {
          id: "shadda",
          titleArabic: "١) الشَّدَّةُ: هِيَ عَلَامَةٌ تُكْتَبُ فَوْقَ حَرْفٍ نَنْطِقُهُ كَمَا لَوْ كَانَ مُتَكَرِّرًا عَلَى التَّوَالِي فِي نَفْسِ الْكَلِمَةِ.",
          title: "Die Schadda (ـّ) steht über einem Buchstaben, den man so spricht, als stünde er zweimal hintereinander.",
          columns: [{ arabic: "الْكَلِمَةُ", german: "Wort" }, { arabic: "الْحُرُوفُ", german: "Buchstaben" }],
          rows: [
            [{ arabic: "سَبُّورَة", german: "Tafel" }, { arabic: "س ب ب و ر ة", german: "das ب zweimal", listen: false }],
            [{ arabic: "نَظَّارَة", german: "Brille" }, { arabic: "ن ظ ظ ا ر ة", german: "das ظ zweimal", listen: false }],
            [{ arabic: "سُكَّر", german: "Zucker" }, { arabic: "س ك ك ر", german: "das ك zweimal", listen: false }],
          ],
        },
        {
          id: "ta-marbuta",
          titleArabic: "٢) التَّاءُ الْمَرْبُوطَةُ: هِيَ عَلَامَةٌ لِلتَّأْنِيثِ فِي الْأَسْمَاءِ.",
          title: "Das Ta marbuta (ة) ist das Zeichen des Femininums bei Nomen.",
          columns: [{ arabic: "", german: "" }, { arabic: "مِثَال", german: "Beispiel" }],
          rows: [
            [
              { arabic: "أ – تُكْتَبُ مُنْفَصِلَةً مَعَ الْحُرُوفِ الَّتِي لَا تَقْبَلُ الِاتِّصَالَ فِي آخِرِهَا هَكَذَا «ة». الْحُرُوفُ الَّتِي لَا تَقْبَلُ الِاتِّصَالَ هِيَ: أ / د / ذ / ر / ز / و.", german: "Nach ا د ذ ر ز و (sie verbinden sich nicht nach links) steht ة allein.", listen: false },
              { arabic: "سَبُّورَة", german: "Tafel" },
            ],
            [{ arabic: "ب – تُكْتَبُ مُتَّصِلَةً فِي نِهَايَةِ الْأَسْمَاءِ = ـة مَعَ بَاقِي الْحُرُوفِ.", german: "Nach allen anderen Buchstaben ist es verbunden: ـة.", listen: false }, { arabic: "حَقِيبَة", german: "Tasche" }],
          ],
          note: "Im Buch: „مِثَال: حقيبة = حقيبات“. ٣) Das Wort سُكَّر hat eine Schadda (س ك ك ر) – ist es männlich oder weiblich? Schau dir die anderen Wörter an: männlich oder weiblich?",
        },
      ],
      quiz: [
        { id: "sukkar", prompt: "سُكَّر hat kein ة am Ende. Ist es männlich oder weiblich?", options: ["مُذَكَّر – männlich", "مُؤَنَّث – weiblich"], answer: 0 },
        { id: "shubbak", prompt: "Und شُبَّاك?", options: ["مُذَكَّر – männlich", "مُؤَنَّث – weiblich"], answer: 0 },
        { id: "sayyara", prompt: "Und سَيَّارَة?", options: ["مُذَكَّر – männlich", "مُؤَنَّث – weiblich"], answer: 1 },
        { id: "nazzara", prompt: "Welches ة steht allein, weil der Buchstabe davor sich nicht verbindet?", options: ["نَظَّارَة (ر)", "ثَلَّاجَة (ج)", "سَيِّدَة (د) und نَظَّارَة (ر)"], answer: 2 },
      ],
    },
    {
      kind: "cloze",
      slug: "step-3",
      title: "Übung 1: das richtige Wort unter das Bild",
      navLabel: "Übung 1",
      instruction: { arabic: "تَدْرِيبٌ (١): اُكْتُبِ الْكَلِمَةَ الصَّحِيحَةَ تَحْتَ الصُّورَةِ ثُمَّ اقْرَأْهَا أَمَامَ الْفَصْلِ.", german: "Übung 1: Welches Wort gehört unter das Bild? Wähle es und lies es laut vor." },
      items: PICTURE_WORDS.map((id) => {
        const w = byId.get(id)!;
        return { id, image: w.image, lines: [{ label: "", parts: [{ accept: [w.arabic], options: PICTURE_OPTIONS }] }] } satisfies ClozeItem;
      }),
    },
    {
      kind: "gaps",
      slug: "step-4",
      title: "Übung 2: Buchstaben zum Wort",
      navLabel: "Übung 2",
      instruction: { arabic: "تَدْرِيبٌ (٢): اُكْتُبْ هَذِهِ الْكَلِمَاتِ بِطَرِيقَةٍ صَحِيحَةٍ ثُمَّ اقْرَأْهَا.", german: "Übung 2: Schreib die Wörter richtig – zwei gleiche Buchstaben hintereinander werden ein Buchstabe mit Schadda. Dann hör sie dir an und lies sie.", note: "Übung 3 im Buch („اُدْخُلْ إِلَى الْمَوْقِعِ“) ist auf der Website des Verlags." },
      gaps: gaps2(
        "listen",
        ["ّ"],
        SPELLED.map(([letters, arabic, id, german], n) => ({ ...dictationItem(`spelled-${n + 1}-${id}`, blank(arabic), arabic, german), hint: letters })),
        WRITE_INTRO
      ),
    },
  ],
};

// ---------------------------------------------------------------------------
// مراجعة عامة على الحروف وأصواتها

export const a1Review3: A1Lesson = {
  slug: "muraja-amma",
  kind: "review",
  label: "مُرَاجَعَةٌ عَامَّة",
  labelGerman: "Allgemeine Wiederholung",
  steps: [
    {
      kind: "gaps",
      slug: "step-1",
      title: "Übung 2: Hören – خ oder غ",
      navLabel: "Übung 2",
      instruction: {
        arabic: "مُرَاجَعَةٌ عَامَّةٌ عَلَى الْحُرُوفِ وَأَصْوَاتِهَا · تَدْرِيبٌ (٢): اِسْمَعْ مِنَ الْمُدَرِّسِ وَاكْتُبِ الْحَرْفَ النَّاقِصَ (خ – غ).",
        german: "Übung 2: Hör zu und schreib خ oder غ – mit dem Vokalzeichen, das du hörst.",
        note: "Die Übungen 1 und 3 („اُدْخُلْ إِلَى الْمَوْقِعِ“) sind auf der Website des Verlags. Die Lösungswörter stehen im Buch unter „حَلُّ تَدْرِيبِ (٢)“.",
      },
      gaps: gaps2(
        "listen",
        ["خَ", "خِ", "خُ", "غَ", "غِ", "غُ"],
        (
          [
            ["_زَال", "غَزَال", "Gazelle"],
            ["_رْبَان", "غِرْبَان", "Raben"],
            ["بَطِّي_", "بَطِّيخْ", "Wassermelone"],
            ["_يُوم", "غُيُوم", "Wolken"],
            ["_اتَم", "خَاتَم", "Ring"],
            ["_رَاء", "غِرَاء", "Klebstoff"],
            ["_رُوف", "خَرُوف", "Schaf"],
            ["_يَار", "خِيَار", "Gurke"],
          ] as Array<[string, string, string]>
        ).map(([pattern, arabic, german], n) => differenceItem(`kh-gh-${n + 1}`, pattern, arabic, german, ["خ", "غ"]))
      ),
    },
  ],
};

// ---------------------------------------------------------------------------
// المحادثة: مِنْ أَيْنَ أَنْتَ؟

const sp = (id: string, name: string, voice: DialogueSpeaker["voice"], alt: string): DialogueSpeaker => ({ id, name, voice, avatar: { src: `${IMG}/${id}.svg`, alt } });

export const ahmadAbdullah: Dialogue = {
  id: "ahmad-abdullah",
  intro: "Bild 1: Im Büro. Ahmad begrüßt Abdullah und fragt, woher er kommt.",
  speakers: [sp("ahmad", "Ahmad", "male-1", "Ahmad, ein Mann im Anzug mit Brille"), sp("abdullah", "Abdullah", "male-2", "Abdullah, ein Mann mit Kopftuch (Ghutra)")],
  lines: lines([
    ["u3-ah-1", "ahmad", "صَبَاحُ الْخَيْر. أَنَا اسْمِي أَحْمَد. وَأَنْتَ مَا اسْمُكَ؟", "صباح الخير أنا اسمي أحمد وأنت ما اسمك", "Ṣabāḥu l-khayr. Ana -smī Aḥmad. Wa-anta ma-smuka?", "Guten Morgen. Ich heiße Ahmad. Und wie heißt du?", "Im Buch auch höflicher: مَا اسْمُ سِيَادَتِكَ؟ – Wie ist Ihr Name?"],
    ["u3-ah-2", "abdullah", "صَبَاحُ النُّور. أَنَا اسْمِي عَبْدُ اللهِ.", "صباح النور أنا اسمي عبد الله", "Ṣabāḥu n-nūr. Ana -smī ʿAbdu llāh.", "Guten Morgen. Ich heiße Abdullah."],
    ["u3-ah-3", "ahmad", "مِنْ أَيْنَ أَنْتَ يَا عَبْدَ اللهِ؟", "من أين أنت يا عبد الله", "Min ayna anta yā ʿAbda llāh?", "Woher kommst du, Abdullah?"],
    ["u3-ah-4", "abdullah", "أَنَا مِنَ السُّعُودِيَّةِ.", "أنا من السعودية", "Ana mina s-Saʿūdiyya.", "Ich komme aus Saudi-Arabien."],
    ["u3-ah-5", "ahmad", "وَأَنَا مِنْ مِصْر. أَهْلًا وَسَهْلًا بِكَ فِي مِصْر.", "وأنا من مصر أهلا وسهلا بك في مصر", "Wa-ana min Miṣr. Ahlan wa-sahlan bika fī Miṣr.", "Und ich komme aus Ägypten. Herzlich willkommen in Ägypten."],
    ["u3-ah-6", "abdullah", "أَهْلًا بِكَ.", "أهلا بك", "Ahlan bika.", "Danke, willkommen (auch dir)."],
  ]),
  question: { prompt: "مِنْ أَيْنَ عَبْدُ اللهِ؟ – Woher kommt Abdullah?", options: ["Aus Ägypten.", "Aus Saudi-Arabien.", "Aus Marokko."], answer: 1 },
};

export const faridaHana: Dialogue = {
  id: "farida-hana",
  intro: "Bild 2: Am Abend. Farida begrüßt Hana an der Tür und fragt, woher sie kommt.",
  speakers: [sp("farida", "Farida", "female-1", "Farida, eine Frau mit Kopftuch"), sp("hana", "Hana", "female-2", "Hana, eine Frau mit kurzen Haaren und Handtasche")],
  lines: lines([
    ["u3-fh-1", "farida", "مَسَاءُ الْخَيْر. أَنَا اسْمِي فَرِيدَة. وَأَنْتِ مَا اسْمُكِ؟", "مساء الخير أنا اسمي فريدة وأنت ما اسمك", "Masāʾu l-khayr. Ana -smī Farīda. Wa-anti ma-smuki?", "Guten Abend. Ich heiße Farida. Und wie heißt du?", "Im Buch auch höflicher: مَا اسْمُ سِيَادَتِكِ؟ – Wie ist Ihr Name?"],
    ["u3-fh-2", "hana", "مَسَاءُ النُّور. أَنَا اسْمِي هَنَا.", "مساء النور أنا اسمي هنا", "Masāʾu n-nūr. Ana -smī Hanā.", "Guten Abend. Ich heiße Hana."],
    ["u3-fh-3", "farida", "مِنْ أَيْنَ أَنْتِ يَا هَنَا؟", "من أين أنت يا هنا", "Min ayna anti yā Hanā?", "Woher kommst du, Hana?"],
    ["u3-fh-4", "hana", "أَنَا مِنَ الْمَغْرِبِ.", "أنا من المغرب", "Ana mina l-Maghrib.", "Ich komme aus Marokko."],
    ["u3-fh-5", "farida", "وَأَنَا مِنَ الْجَزَائِرِ. أَهْلًا وَسَهْلًا.", "وأنا من الجزائر أهلا وسهلا", "Wa-ana mina l-Jazāʾir. Ahlan wa-sahlan.", "Und ich komme aus Algerien. Herzlich willkommen."],
    ["u3-fh-6", "hana", "أَهْلًا بِكِ.", "أهلا بك", "Ahlan biki.", "Danke, willkommen (auch dir)."],
  ]),
  question: { prompt: "مِنْ أَيْنَ هَنَا؟ – Woher kommt Hana?", options: ["Aus Algerien.", "Aus Ägypten.", "Aus Marokko."], answer: 2 },
};

const NUMBER_COLS = [
  { arabic: "مُفْرَدٌ مُذَكَّرٌ", german: "ein Mann" },
  { arabic: "مُفْرَدٌ مُؤَنَّثٌ", german: "eine Frau" },
  { arabic: "مُثَنًّى مُذَكَّرٌ", german: "zwei Männer" },
  { arabic: "مُثَنًّى مُؤَنَّثٌ", german: "zwei Frauen" },
  { arabic: "جَمْعٌ مُذَكَّرٌ", german: "mehrere Männer" },
  { arabic: "جَمْعٌ مُؤَنَّثٌ", german: "mehrere Frauen" },
];
const BI = ["بِكَ", "بِكِ", "بِكُمَا", "بِكُمَا", "بِكُمْ", "بِكُنَّ"];
const BI_DE = ["dir (Mann)", "dir (Frau)", "euch beiden", "euch beiden", "euch (Männer)", "euch (Frauen)"];
const g = (i: number) => (i % 2 === 0 ? "m" : "f") as "m" | "f";

/** "Anhören" of the Lam tables: the book's words (CD 24 and 25). */
const MOON = ["الْأُرْدُنّ", "الْبَرَازِيل", "الْجَزَائِر", "الْحُسَيْن", "الْخُرْطُوم", "الْعَيْن", "الْغَرْدَقَة", "الْفَيُّوم", "الْقَاهِرَة", "الْكُوَيْت", "الْمَجَر", "الْهِنْد", "الْوَاحَات", "الْيَمَن"];
const SUN = ["التَّحْرِير", "الثَّانِيَة", "الدَّوْحَة", "الذَّهَب", "الرِّيَاض", "الزَّمَالِك", "السُّودَان", "الشَّارِقَة", "الصُّومَال", "الضَّبْعَة", "الطُّور", "الظَّهْرَان", "النِّمْسَا"];
const PLACE_DE: Record<string, string> = {
  "الْأُرْدُنّ": "Jordanien", "الْبَرَازِيل": "Brasilien", "الْجَزَائِر": "Algerien", "الْحُسَيْن": "al-Husain (Stadtviertel in Kairo)", "الْخُرْطُوم": "Khartum", "الْعَيْن": "al-Ain (Stadt in den Emiraten); das Auge",
  "الْغَرْدَقَة": "Hurghada", "الْفَيُّوم": "Fayyum", "الْقَاهِرَة": "Kairo", "الْكُوَيْت": "Kuwait", "الْمَجَر": "Ungarn", "الْهِنْد": "Indien", "الْوَاحَات": "die Oasen", "الْيَمَن": "Jemen",
  "التَّحْرِير": "Tahrir (Platz in Kairo)", "الثَّانِيَة": "die zweite", "الدَّوْحَة": "Doha", "الذَّهَب": "das Gold", "الرِّيَاض": "Riad", "الزَّمَالِك": "Zamalek (Stadtteil von Kairo)", "السُّودَان": "Sudan",
  "الشَّارِقَة": "Schardscha", "الصُّومَال": "Somalia", "الضَّبْعَة": "ad-Dabaa (Ort in Ägypten)", "الطُّور": "at-Tur (Stadt auf dem Sinai)", "الظَّهْرَان": "Dhahran", "النِّمْسَا": "Österreich",
  "الْمُهَنْدِسِين": "al-Muhandisin (Stadtteil von Kairo)", "الدُّقِّي": "Dokki (Stadtteil von Kairo)", "الشِّيشَان": "Tschetschenien", "الْمَغْرِب": "Marokko", "الْهَرَم": "al-Haram (Stadtteil von Gizeh); die Pyramide",
};
const lamCell = (arabic: string, n: number): TableCell => ({ arabic: `${n + 1} – ${arabic}`, german: PLACE_DE[arabic] });


/** تدريب ١: the names of countries and regions; ش or ق on each word. */
const LISTEN_NAMES = ["الْيَمَن", "التَّحْرِير", "الْمُهَنْدِسِين", "الدُّقِّي", "الزَّمَالِك", "الشِّيشَان", "الْمَجَر", "السُّودَان", "الْمَغْرِب", "الْهَرَم", "الرِّيَاض", "الظَّهْرَان", "الدَّوْحَة", "الشَّارِقَة", "الْبَرَازِيل", "الْخُرْطُوم", "الْوَاحَات", "الضَّبْعَة"];
/** تدريب ٣: the words without the article (book order) and with it. */
const ARTICLE_WORDS: Array<[bare: string, withArticle: string, german: string]> = [
  ["تُفَّاح", "التُّفَّاح", "die Äpfel"],
  ["سَيَّارَة", "السَّيَّارَة", "das Auto"],
  ["نَظَّارَة", "النَّظَّارَة", "die Brille"],
  ["سَبُّورَة", "السَّبُّورَة", "die Tafel"],
  ["غَسَّالَة", "الْغَسَّالَة", "die Waschmaschine"],
  ["ثَلَّاجَة", "الثَّلَّاجَة", "der Kühlschrank"],
  ["هَدِيَّة", "الْهَدِيَّة", "das Geschenk"],
  ["شُبَّاك", "الشُّبَّاك", "das Fenster"],
  ["سُكَّر", "السُّكَّر", "der Zucker"],
  ["جِلْبَاب", "الْجِلْبَاب", "die Galabija (langes Gewand)"],
  ["رَجُل", "الرَّجُل", "der Mann"],
  ["عُلْبَة", "الْعُلْبَة", "die Schachtel"],
  ["ظَرْف", "الظَّرْف", "der Briefumschlag"],
  ["نَاس", "النَّاس", "die Leute"],
  ["مَكْتَب", "الْمَكْتَب", "der Schreibtisch"],
  ["لَيْمُون", "اللَّيْمُون", "die Zitronen"],
  ["كُرْسِيّ", "الْكُرْسِيّ", "der Stuhl"],
  ["قَلَم", "الْقَلَم", "der Stift"],
  ["فَاكِهَة", "الْفَاكِهَة", "das Obst"],
  ["ضُبَّاط", "الضُّبَّاط", "die Offiziere"],
  ["صُورَة", "الصُّورَة", "das Bild"],
  ["زَمِيل", "الزَّمِيل", "der Mitschüler"],
  ["يَوْم", "الْيَوْم", "der Tag"],
  ["أَب", "الْأَب", "der Vater"],
  ["وَرْدَة", "الْوَرْدَة", "die Rose"],
  ["بِنْت", "الْبِنْت", "das Mädchen"],
  ["ذُبَابَة", "الذُّبَابَة", "die Fliege"],
  ["دَرَّاجَة", "الدَّرَّاجَة", "das Fahrrad"],
  ["خِطَاب", "الْخِطَاب", "der Brief"],
  ["حَقِيبَة", "الْحَقِيبَة", "die Tasche"],
  ["بَيْت", "الْبَيْت", "das Haus"],
];
/** The article is assimilated (اللام الشمسية) when the ل has no Sukun and the next letter a Shadda. */
export const isSunLetterWord = (withArticle: string) => !withArticle.startsWith("الْ") && /^ال.[\u064B-\u0650]?\u0651/.test(withArticle);

const LAM_OPTIONS = ["ش – شَمْسِيَّة", "ق – قَمَرِيَّة"];
const lamQuiz = (arabic: string, german: string, id: string, bare?: string): QuizItem => ({
  id,
  arabic,
  german: bare ? `${bare} → ${german}` : german,
  questions: [{ prompt: "Welches Lam?", options: LAM_OPTIONS, answer: isSunLetterWord(arabic) ? 0 : 1 }],
});

const COUNTRIES = ["مِنْ مِصْر.", "مِنَ السُّعُودِيَّة.", "مِنَ الْمَغْرِب.", "مِنَ الْجَزَائِر.", "مِنَ الْأُرْدُنّ.", "مِنَ الْيَمَن.", "مِنَ السُّودَان.", "مِنَ الْكُوَيْت."];
const gap = (accept: string[], options: string[]) => ({ accept, options });
const MEN = ["خَالِد", "مُصْطَفَى", "أَحْمَد", "عَلِيّ", "سَمِير"];
const WOMEN = ["فَرِيدَة", "هَنَا", "زَيْنَب", "سَلْوَى", "إِيمَان"];

/** تدريب ٥ (أ): with a (male) partner – the dialogue of picture 1 with other names. */
const COMPLETE_A: ClozeItem = {
  id: "partner-m",
  hint: "Mit einem Lernpartner: Khalid und Mustafa.",
  lines: [
    { label: "١", parts: ["صَبَاحُ ", gap(["الْخَيْر،"], ["الْخَيْر،", "النُّور،"]), " أَنَا ", gap(["اسْمِي"], ["اسْمِي", "اسْمُكَ", "اسْمُهُ"]), " خَالِد، وَأَنْتَ ", gap(["مَا اسْمُكَ؟"], ["مَا اسْمُكَ؟", "مَا اسْمُكِ؟", "مَنْ هُوَ؟"])] },
    { label: "٢", parts: ["صَبَاحُ ", gap(["النُّور."], ["الْخَيْر.", "النُّور."]), " أَنَا ", gap(["اسْمِي"], ["اسْمِي", "اسْمُكَ", "اسْمُهُ"]), " مُصْطَفَى."] },
    { label: "٣", parts: ["مِنْ ", gap(["أَيْنَ"], ["أَيْنَ", "هَلْ", "مَا"]), " أَنْتَ يَا مُصْطَفَى؟"] },
    { label: "٤", parts: ["أَنَا ", gap(COUNTRIES.slice(1), COUNTRIES.slice(0, 5))] },
    { label: "٥", parts: ["وَأَنَا ", gap(["مِنْ مِصْر."], COUNTRIES.slice(0, 4)), " أَهْلًا وَ", gap(["سَهْلًا"], ["سَهْلًا", "النُّور"]), " ", gap(["بِكَ"], BI.slice(0, 2)), " فِي مِصْر."] },
    { label: "٧", parts: ["أَهْلًا ", gap(["بِكَ."], ["بِكَ.", "بِكِ.", "بِكُمْ."])] },
  ],
};
/** تدريب ٥ (ب): with a female partner – the names are free. */
const COMPLETE_B: ClozeItem = {
  id: "partner-f",
  hint: "Mit einer Lernpartnerin: Wähle zwei Frauennamen.",
  lines: [
    { label: "١", parts: ["مَسَاءُ ", gap(["الْخَيْر،"], ["الْخَيْر،", "النُّور،"]), " أَنَا ", gap(WOMEN.map((n) => `اسْمِي ${n}،`), [`اسْمِي ${WOMEN[0]}،`, `اسْمِي ${WOMEN[2]}،`, `اسْمِي ${MEN[0]}،`]), " وَأَنْتِ ", gap(["مَا اسْمُكِ؟"], ["مَا اسْمُكَ؟", "مَا اسْمُكِ؟", "مَنْ هِيَ؟"])] },
    { label: "٢", parts: ["مَسَاءُ ", gap(["النُّور."], ["الْخَيْر.", "النُّور."]), " أَنَا ", gap(WOMEN.map((n) => `اسْمِي ${n}.`), [`اسْمِي ${WOMEN[1]}.`, `اسْمِي ${WOMEN[3]}.`, `اسْمِي ${MEN[1]}.`])] },
    { label: "٣", parts: ["مِنْ ", gap(["أَيْنَ"], ["أَيْنَ", "هَلْ", "مَا"]), " أَنْتِ يَا ", gap(WOMEN.map((n) => `${n}؟`), [`${WOMEN[1]}؟`, `${WOMEN[3]}؟`, `${MEN[1]}؟`])] },
    { label: "٤", parts: ["أَنَا ", gap(COUNTRIES.slice(1), COUNTRIES.slice(0, 5))] },
    { label: "٥", parts: ["وَأَنَا ", gap(["مِنْ مِصْر."], COUNTRIES.slice(0, 4)), " أَهْلًا وَ", gap(["سَهْلًا"], ["سَهْلًا", "النُّور"]), " ", gap(["بِكِ"], BI.slice(0, 2)), " فِي مِصْر."] },
    { label: "٦", parts: ["أَهْلًا ", gap(["بِكِ."], ["بِكَ.", "بِكِ.", "بِكُنَّ."])] },
  ],
};
/** تدريب ٦ (أ): name and country are free. */
const COMPLETE_C: ClozeItem = {
  id: "free",
  hint: "Name und Land kannst du frei wählen.",
  lines: [
    { label: "١", parts: ["صَبَاحُ الْخَيْر، أَنَا ", gap(MEN.map((n) => `${n}،`), MEN.slice(0, 3).map((n) => `${n}،`)), " وَأَنْتَ مَا اسْمُكَ؟"] },
    { label: "٢", parts: ["أَنَا ", gap(MEN.map((n) => n), MEN.slice(2, 5)), " وَمِنْ أَيْنَ أَنْتَ؟"] },
    { label: "٣", parts: ["أَنَا ", gap(COUNTRIES, COUNTRIES.slice(0, 5))] },
  ],
};

const RE_THIRD: TableCell[] = ["هُوَ؟", "هِيَ؟", "هُمَا؟", "هُمَا؟", "هُمْ؟", "هُنَّ؟"].map((p, i) => ({ arabic: `مَنْ ${p}`, gender: g(i) }));
const RE_NAME: TableCell[] = ["اسْمُهُ؟", "اسْمُهَا؟", "اسْمَاهُمَا؟", "اسْمَاهُمَا؟", "أَسْمَاؤُهُمْ؟", "أَسْمَاؤُهُنَّ؟"].map((p, i) => ({ arabic: `مَا ${p}`, gender: g(i) }));

const lamPhrase = ([, withArticle, german]: (typeof ARTICLE_WORDS)[number], n: number): PhraseItem => {
  const id = `lam-${n + 1}`;
  return { id, arabic: withArticle, transliteration: transliterate(withArticle), german, tag: isSunLetterWord(withArticle) ? "اللَّامُ الشَّمْسِيَّةُ" : "اللَّامُ الْقَمَرِيَّةُ", exercise: { id, target: unvocalised(withArticle), modelText: withArticle } };
};

export const a1MinAyna: A1Lesson = {
  slug: "min-ayna-anta",
  kind: "phrase",
  label: "مِنْ أَيْنَ أَنْتَ؟",
  labelGerman: "Woher kommst du?",
  steps: [
    { kind: "dialogue", mode: "listen", slug: "step-1", title: "Anhören 1: Ahmad und Abdullah", navLabel: "Anhören 1", instruction: { arabic: "الْمُحَادَثَةُ: مِنْ أَيْنَ أَنْتَ؟ · حِوَارُ صُورَةِ (١): أ) اِقْرَأِ الْمُحَادَثَةَ ثُمَّ أَجِبْ: مِنْ أَيْنَ أَحْمَد؟ مِنْ أَيْنَ عَبْدُ اللهِ؟", german: "Hör die Unterhaltung und antworte: Woher kommt Ahmad? Woher kommt Abdullah?" }, dialogue: ahmadAbdullah },
    { kind: "dialogue", mode: "repeat", slug: "step-2", title: "Nachsprechen 1", navLabel: "Nachsprechen 1", instruction: { arabic: "حِوَارُ صُورَةِ (١)", german: "Sprich jede Zeile nach – so oft du willst, bis sie richtig ist." }, dialogue: ahmadAbdullah },
    { kind: "dialogue", mode: "roleplay", slug: "step-3", title: "Rollenspiel 1: Ahmad und Abdullah", navLabel: "Rollenspiel 1", instruction: { arabic: "ب) كَرِّرِ الْمُحَادَثَةَ مَعَ زَمِيلِكَ.", german: "Wiederhole die Unterhaltung mit deinem Lernpartner – hier spricht Alif die andere Rolle." }, dialogue: ahmadAbdullah },
    { kind: "dialogue", mode: "listen", slug: "step-4", title: "Anhören 2: Farida und Hana", navLabel: "Anhören 2", instruction: { arabic: "حِوَارُ صُورَةِ (٢): أ) اِقْرَأِ الْمُحَادَثَةَ ثُمَّ أَجِبْ: مِنْ أَيْنَ فَرِيدَة؟ مِنْ أَيْنَ هَنَا؟", german: "Hör die Unterhaltung und antworte: Woher kommt Farida? Woher kommt Hana?" }, dialogue: faridaHana },
    { kind: "dialogue", mode: "repeat", slug: "step-5", title: "Nachsprechen 2", navLabel: "Nachsprechen 2", instruction: { arabic: "حِوَارُ صُورَةِ (٢)", german: "Sprich jede Zeile nach – so oft du willst, bis sie richtig ist." }, dialogue: faridaHana },
    { kind: "dialogue", mode: "roleplay", slug: "step-6", title: "Rollenspiel 2: Farida und Hana", navLabel: "Rollenspiel 2", instruction: { arabic: "ب) كَرِّرِ الْمُحَادَثَةَ مَعَ زَمِيلِكَ.", german: "Wiederhole die Unterhaltung – Alif spricht die andere Rolle." }, dialogue: faridaHana },
    {
      kind: "table",
      slug: "step-7",
      title: "Grammatik: begrüßen – und die zwei Lam",
      navLabel: "Grammatik",
      instruction: { arabic: "لَاحِظِ الْقَوَاعِدَ: ١) لِلتَّحِيَّةِ وَالتَّرْحِيبِ ٢) لَاحِظْ نُطْقَ اللَّامِ", german: "Achte auf die Regeln: „Herzlich willkommen“ für jede Person – und wie man das ل des Artikels الـ spricht." },
      tables: [
        {
          id: "greeting",
          titleArabic: "١) لِلتَّحِيَّةِ وَالتَّرْحِيبِ:",
          title: "Willkommen heißen – und antworten",
          columns: [{ arabic: "", german: "" }, ...NUMBER_COLS],
          rows: [
            [{ arabic: "التَّحِيَّةُ: أَهْلًا وَسَهْلًا", german: "Begrüßung", listen: false }, ...BI.map((b, i) => ({ arabic: `أَهْلًا وَسَهْلًا ${b}`, german: `Willkommen (${BI_DE[i]})`, gender: g(i) }))],
            [{ arabic: "الرَّدُّ: أَهْلًا", german: "Antwort", listen: false }, ...BI.map((b, i) => ({ arabic: `أَهْلًا ${b}`, german: `Danke, willkommen (${BI_DE[i]})`, gender: g(i) }))],
          ],
        },
        {
          id: "moon",
          titleArabic: "٢) لَاحِظْ نُطْقَ اللَّامِ: اللَّامُ الْقَمَرِيَّةُ",
          title: "Das „Mond-Lam“: das ل von الـ wird gesprochen (al-…).",
          columns: [{ arabic: "", german: "" }, { arabic: "", german: "" }],
          rows: MOON.slice(0, 7).map((m, i) => [lamCell(m, i), lamCell(MOON[i + 7]!, i + 7)]),
        },
        {
          id: "sun",
          titleArabic: "اللَّامُ الشَّمْسِيَّةُ",
          title: "Das „Sonnen-Lam“: das ل wird nicht gesprochen, der nächste Buchstabe wird verdoppelt (Schadda).",
          columns: [{ arabic: "", german: "" }, { arabic: "", german: "" }],
          rows: SUN.slice(0, 7).map((s, i) => [lamCell(s, i), ...(SUN[i + 7] ? [lamCell(SUN[i + 7]!, i + 7)] : [{ arabic: "", listen: false }])]),
          note: "Sonnenbuchstaben: ت ث د ذ ر ز س ش ص ض ط ظ ل ن. Bei allen anderen Buchstaben (den Mondbuchstaben) spricht man das ل.",
        },
      ],
      quiz: [
        { id: "bika", prompt: "Du heißt eine Frau willkommen:", options: ["أَهْلًا وَسَهْلًا بِكَ", "أَهْلًا وَسَهْلًا بِكِ", "أَهْلًا وَسَهْلًا بِكُمْ"], answer: 1 },
        { id: "reply", prompt: "Die Antwort auf أَهْلًا وَسَهْلًا بِكُمَا:", options: ["أَهْلًا بِكُمَا", "أَهْلًا بِكَ", "صَبَاحُ النُّور"], answer: 0 },
        { id: "sun", prompt: "In welchem Wort hört man das ل nicht?", options: ["الْقَاهِرَة", "الرِّيَاض", "الْكُوَيْت"], answer: 1 },
        { id: "moon", prompt: "In welchem Wort spricht man das ل?", options: ["السُّودَان", "النِّمْسَا", "الْيَمَن"], answer: 2 },
      ],
    },
    {
      kind: "quiz",
      slug: "step-8",
      title: "Übung 1: Sonnen- oder Mond-Lam?",
      navLabel: "Übung 1",
      instruction: { arabic: "تَدْرِيبٌ (١): اِسْمَعْ أَسْمَاءَ الْبِلَادِ وَالْمَنَاطِقِ وَتَعَرَّفْ عَلَى اللَّامِ الشَّمْسِيَّةِ وَالْقَمَرِيَّةِ بِكِتَابَةِ حَرْفِ (ش) أَوْ (ق) عَلَى كُلِّ كَلِمَةٍ.", german: "Übung 1: Hör die Namen der Länder und Orte. Wird das ل gesprochen? Wähle ش (Sonnen-Lam) oder ق (Mond-Lam).", note: "Übung 2 im Buch („اُدْخُلْ إِلَى الْمَوْقِعِ“) ist auf der Website des Verlags." },
      items: LISTEN_NAMES.map((name, n) => lamQuiz(name, PLACE_DE[name]!, `place-${n + 1}`)),
    },
    {
      kind: "quiz",
      slug: "step-9",
      title: "Übung 3: الـ dazu – welche Tabelle?",
      navLabel: "Übung 3",
      instruction: { arabic: "تَدْرِيبٌ (٣): اُكْتُبْ «الـ» مَعَ الْكَلِمَةِ ثُمَّ انْطِقِ الْكَلِمَةَ. ٢) صَحِّحْ مَعَ زَمِيلِكَ.", german: "Übung 3: So heißen die Wörter mit الـ. Gehören sie in die Tabelle „Sonnen-Lam“ (ش) oder „Mond-Lam“ (ق)?", note: "Im nächsten Schritt sprichst du jedes Wort mit الـ aus." },
      items: ARTICLE_WORDS.map(([bare, withArticle, german], n) => lamQuiz(withArticle, german, `article-${n + 1}`, bare)),
    },
    {
      kind: "phrases",
      slug: "step-10",
      title: "Übung 3: die Wörter mit الـ aussprechen",
      navLabel: "Übung 3 (sprechen)",
      instruction: { arabic: "تَدْرِيبٌ (٣): … ثُمَّ انْطِقِ الْكَلِمَةَ.", german: "Übung 3: Sprich jedes Wort mit الـ aus – beim Sonnen-Lam ohne „l“.", note: "Übung 4 im Buch („اُدْخُلْ إِلَى الْمَوْقِعِ“) ist auf der Website des Verlags." },
      groups: [
        { id: "sun", title: "Sonnen-Lam (اللَّامُ الشَّمْسِيَّةُ)", items: ARTICLE_WORDS.map(lamPhrase).filter((item) => isSunLetterWord(item.arabic)) },
        { id: "moon", title: "Mond-Lam (اللَّامُ الْقَمَرِيَّةُ)", items: ARTICLE_WORDS.map(lamPhrase).filter((item) => !isSunLetterWord(item.arabic)) },
      ],
    },
    {
      kind: "cloze",
      slug: "step-11",
      title: "Übung 5: Ergänze die Unterhaltung",
      navLabel: "Übung 5",
      instruction: { arabic: "تَدْرِيبٌ (٥): أ) أَكْمِلِ الْحِوَارَ ثُمَّ كَرِّرْهُ مَعَ زَمِيلِكَ. ب) أَكْمِلْ وَكَرِّرِ الْحِوَارَ مَعَ زَمِيلَةٍ.", german: "Übung 5: Ergänze die Unterhaltungen – (a) mit einem Lernpartner, (b) mit einer Lernpartnerin.", note: "Wo das Buch Name oder Land offen lässt, ist jede passende Wahl richtig. Die Zeilen 1–7 sind wie im Buch nummeriert (dort fehlt die 6)." },
      items: [COMPLETE_A, COMPLETE_B],
    },
    {
      kind: "cloze",
      slug: "step-12",
      title: "Übung 6: Name und Land",
      navLabel: "Übung 6",
      instruction: { arabic: "تَدْرِيبٌ (٦): أ – أَكْمِلِ الْحِوَارَ وَكَرِّرْهُ مَعَ زَمِيلِكَ. ب – اِخْتَرْ بَلَدًا آخَرَ وَكَرِّرِ الْحِوَارَ مَعَ زُمَلَاءَ آخَرِينَ.", german: "Übung 6: Ergänze die Unterhaltung – mit einem Namen und einem Land deiner Wahl. Dann wähle ein anderes Land und mach es noch einmal.", note: "Teil (b) – mit anderen Lernpartnern – braucht eine Klasse; hier kannst du die Übung mit anderen Wörtern wiederholen." },
      items: [COMPLETE_C],
    },
    {
      kind: "table",
      slug: "step-13",
      title: "Merke: nach Personen und Ländern fragen",
      navLabel: "Merke",
      instruction: { arabic: "تَذَكَّرْ", german: "Merke: das Wichtigste von Unit 3 auf einen Blick." },
      tables: [
        { id: "third", titleArabic: "١ – لِلسُّؤَالِ عَنِ الشَّخْصِ الثَّالِثِ أَوِ الْغَائِبِ: (أَدَاةُ الِاسْتِفْهَامِ: مَنْ)", title: "Nach der 3. Person fragen: مَنْ", columns: NUMBER_COLS, rows: [RE_THIRD] },
        { id: "name", titleArabic: "٢ – لِلسُّؤَالِ عَنِ الِاسْمِ + ضَمِيرِ الْمِلْكِيَّةِ: (أَدَاةُ الِاسْتِفْهَامِ: مَا)", title: "Nach dem Namen fragen: مَا + Endung", columns: NUMBER_COLS, rows: [RE_NAME] },
        { id: "greeting", titleArabic: "٣ – لِلتَّحِيَّةِ: أَهْلًا وَسَهْلًا · الرَّدُّ:", title: "Begrüßen und antworten", columns: NUMBER_COLS, rows: [BI.map((b, i) => ({ arabic: `أَهْلًا ${b}`, german: BI_DE[i], gender: g(i) }))] },
        {
          id: "polite",
          titleArabic: "٤ – لِمُخَاطَبَةِ شَخْصٍ لَا نَعْرِفُهُ:",
          title: "Höflich fragen (jemand, den man nicht kennt)",
          columns: [{ arabic: "", german: "" }],
          rows: [[{ arabic: "مَا اسْمُ سِيَادَتِكَ؟", german: "Wie ist Ihr Name? (zu einem Mann)", gender: "m" }], [{ arabic: "مَا اسْمُ سِيَادَتِكِ؟", german: "Wie ist Ihr Name? (zu einer Frau)", gender: "f" }]],
          note: "Im Buch steht in der zweiten Zeile „مَا اسْمُكِ سِيَادَتِكِ؟“; gemeint ist die höfliche Frage an eine Frau.",
        },
        {
          id: "country",
          titleArabic: "٥ – لِلسُّؤَالِ عَنْ بَلَدِ الشَّخْصِ:",
          title: "Nach dem Land fragen",
          columns: [{ arabic: "السُّؤَالُ", german: "Frage" }, { arabic: "الرَّدُّ", german: "Antwort" }],
          rows: [
            [{ arabic: "مِنْ أَيْنَ أَنْتَ؟", german: "Woher kommst du? (Mann)", gender: "m" }, { arabic: "أَنَا مِنْ …", german: "Ich komme aus …", listen: false }],
            [{ arabic: "مِنْ أَيْنَ أَنْتِ؟", german: "Woher kommst du? (Frau)", gender: "f" }, { arabic: "أَنَا مِنْ …", german: "Ich komme aus …", listen: false }],
            [{ arabic: "مِنْ أَيْنَ أَنْتُمَا؟", german: "Woher kommt ihr beide?" }, { arabic: "نَحْنُ مِنْ …", german: "Wir kommen aus …", listen: false }],
            [{ arabic: "مِنْ أَيْنَ أَنْتُمْ؟", german: "Woher kommt ihr? (Männer)", gender: "m" }, { arabic: "نَحْنُ مِنْ …", german: "Wir kommen aus …", listen: false }],
            [{ arabic: "مِنْ أَيْنَ أَنْتُنَّ؟", german: "Woher kommt ihr? (Frauen)", gender: "f" }, { arabic: "نَحْنُ مِنْ …", german: "Wir kommen aus …", listen: false }],
          ],
        },
      ],
      quiz: [
        { id: "hunna", prompt: "Drei Frauen: „Wer sind sie?“", options: ["مَنْ هُمْ؟", "مَنْ هُنَّ؟", "مَنْ هُمَا؟"], answer: 1 },
        { id: "ismuha", prompt: "„Wie heißt sie?“", options: ["مَا اسْمُهُ؟", "مَا اسْمُهَا؟", "مَا اسْمُكِ؟"], answer: 1 },
        { id: "polite", prompt: "Höflich einen fremden Mann nach dem Namen fragen:", options: ["مَا اسْمُ سِيَادَتِكَ؟", "مَنْ هُوَ؟", "مَا اسْمُهُ؟"], answer: 0 },
        { id: "antum", prompt: "„Woher kommt ihr?“ (mehrere Männer)", options: ["مِنْ أَيْنَ أَنْتُمَا؟", "مِنْ أَيْنَ أَنْتُمْ؟", "مِنْ أَيْنَ أَنْتُنَّ؟"], answer: 1 },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// The alphabet in all its forms (book pages 119–121)

/** Each letter: alone, at the start, in the middle, at the end – the book's four columns (right to left). */
const ALPHABET: Array<[string, string, string, string]> = [
  ["ا", "ا", "ـا", "ـا"], ["ب", "بـ", "ـبـ", "ـب"], ["ت", "تـ", "ـتـ", "ـت"], ["ث", "ثـ", "ـثـ", "ـث"], ["ج", "جـ", "ـجـ", "ـج"], ["ح", "حـ", "ـحـ", "ـح"], ["خ", "خـ", "ـخـ", "ـخ"],
  ["د", "د", "ـد", "ـد"], ["ذ", "ذ", "ـذ", "ـذ"], ["ر", "ر", "ـر", "ـر"], ["ز", "ز", "ـز", "ـز"], ["س", "سـ", "ـسـ", "ـس"], ["ش", "شـ", "ـشـ", "ـش"], ["ص", "صـ", "ـصـ", "ـص"],
  ["ض", "ضـ", "ـضـ", "ـض"], ["ط", "طـ", "ـطـ", "ـط"], ["ظ", "ظـ", "ـظـ", "ـظ"], ["ع", "عـ", "ـعـ", "ـع"], ["غ", "غـ", "ـغـ", "ـغ"], ["ف", "فـ", "ـفـ", "ـف"], ["ق", "قـ", "ـقـ", "ـق"],
  ["ك", "كـ", "ـكـ", "ـك"], ["ل", "لـ", "ـلـ", "ـل"], ["م", "مـ", "ـمـ", "ـم"], ["ن", "نـ", "ـنـ", "ـن"], ["ه / ة", "هـ", "ـهـ", "ـه / ـة"], ["و", "و", "ـو", "ـو"], ["ي / ى", "يـ", "ـيـ", "ـي / ـى"],
];

export const a1Alphabet: A1Lesson = {
  slug: "al-huruf",
  kind: "review",
  label: "الْحُرُوفُ",
  labelGerman: "Alle Buchstaben",
  steps: [
    {
      kind: "table",
      slug: "step-1",
      title: "Das Alphabet: alle Formen",
      navLabel: "Alphabet",
      instruction: { arabic: "الْحُرُوفُ الْعَرَبِيَّةُ", german: "Alle 28 Buchstaben in ihren Formen – wie auf den letzten Seiten der Unit (allein, am Anfang, in der Mitte, am Ende)." },
      tables: [
        {
          id: "alphabet",
          titleArabic: "الْحُرُوفُ: مُنْفَصِل – فِي أَوَّلِ الْكَلِمَةِ – فِي الْمُنْتَصَفِ – فِي آخِرِ الْكَلِمَةِ",
          title: "Die Buchstaben und ihre Formen",
          columns: [
            { arabic: "مُنْفَصِل", german: "allein" },
            { arabic: "فِي الْأَوَّلِ", german: "am Anfang" },
            { arabic: "فِي الْمُنْتَصَفِ", german: "in der Mitte" },
            { arabic: "فِي الْآخِرِ", german: "am Ende" },
          ],
          rows: ALPHABET.map((forms) => forms.map((arabic) => ({ arabic, listen: false }))),
          note: "ا د ذ ر ز و verbinden sich nicht mit dem nächsten Buchstaben: Sie haben am Anfang und in der Mitte keine eigene Form.",
        },
      ],
      quiz: [
        { id: "no-join", prompt: "Welcher Buchstabe verbindet sich nicht mit dem nächsten?", options: ["ب", "ر", "م"], answer: 1 },
        { id: "end-ha", prompt: "Welche Form ist das Hā am Wortende?", options: ["هـ", "ـهـ", "ـه"], answer: 2 },
        { id: "middle-ain", prompt: "Welche Form ist das ʿAin in der Wortmitte?", options: ["عـ", "ـعـ", "ـع"], answer: 1 },
      ],
    },
  ],
};
