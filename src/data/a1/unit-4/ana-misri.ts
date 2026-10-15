import type { A1Lesson, ClozeItem, ClozePart, Dialogue, DialogueSpeaker, GapItem, MatchContent, PhraseItem, QuizItem, TableCell } from "@/data/types";
import { transliterate } from "@/lib/arabic/transliterate";

import { unvocalised } from "../letter-lesson";
import { dictationItem, gaps2 } from "../lesson-2/letter-entry";
import { lines } from "../sabah-al-khayr";

// Unit 4 · تقديم (١) "أَنَا مِصْرِيّ" (book pages 123–138, PDF 155–170):
//   أشكال كتابة الهمزة (table, لاحظ القواعد), تدريب ١–٥ (+ solutions);
//   تدريبات عامة على قراءة الحروف وكتابتها: تدريب ١ (ذ ز ظ), ٢ (ق ك), ٣ (listen
//   and underline), ٤ (ask your partner about the names – info gap), ٥–٩
//   (class / website); المحادثة "أَنَا مِصْرِيّ" (Mustafa and Yamahu), لاحظ
//   القواعد (النسبة; التحية والرد), تذكر (الاعتذار), تدريب ١–٨.

const IMG = "/images/a1/unit-4";
const gap = (accept: string[], options: string[]): ClozePart => ({ accept, options });

// ---------------------------------------------------------------------------
// أشكال كتابة الهمزة

const HAMZA_TABLE: Array<[label: string, start: string, middle: string, end: string, endShape: string]> = [
  ["بِالْفَتْحَةِ", "أَحْمَد", "سَأَلَ", "بَدَأَ", "أ"],
  ["بِالْكَسْرَةِ", "إِحْسَان", "أَسْئِلَة", "بَطِيء", "ئ"],
  ["بِالضَّمَّةِ", "أُمَيْمَة", "سُؤَال", "تَبَاطُؤ", "ؤ"],
  ["أَلِفُ مَدٍّ", "آسِر", "قُرْآن", "بَدْء", "ء"],
  ["", "", "", "ضَوْء", "وء"],
  ["", "", "", "هَنَاء", "اء"],
];
const HAMZA_GERMAN: Record<string, string> = {
  "أَحْمَد": "Ahmad (Name)", "سَأَلَ": "er fragte", "بَدَأَ": "er begann", "إِحْسَان": "Ihsan (Name)", "أَسْئِلَة": "Fragen", "بَطِيء": "langsam",
  "أُمَيْمَة": "Umaima (Name)", "سُؤَال": "Frage", "تَبَاطُؤ": "Verlangsamung", "آسِر": "Asir (Name)", "قُرْآن": "Koran", "بَدْء": "Beginn", "ضَوْء": "Licht", "هَنَاء": "Hanaa (Name); Glück",
};
const HAMZA_WORDS = HAMZA_TABLE.flatMap(([, s, m, e]) => [s, m, e]).filter(Boolean);

const hamzaPhrase = (arabic: string, n: number): PhraseItem => {
  const id = `hamza-${n + 1}`;
  return { id, arabic, transliteration: transliterate(arabic), german: HAMZA_GERMAN[arabic]!, exercise: { id, target: unvocalised(arabic), modelText: arabic } };
};

/** The seats of the Hamza (and the Madda) – the tiles of تدريب ٢ and ٣. */
const SEATS = ["أ", "إ", "ؤ", "ئ", "ء", "آ"];
/** A word written without vowel signs, its Hamza a gap (the book prints "–" there). */
const hamzaGap = (id: string, arabic: string, german: string): GapItem => {
  const bare = unvocalised(arabic);
  const tiles = Array.from(bare);
  const at = tiles.findIndex((c) => "أإؤئءآ".includes(c));
  return { id, arabic: bare, spoken: arabic, german, pattern: tiles.map((c, i) => (i === at ? "_" : c)).join(""), bare: true, gapChoices: [SEATS] };
};

/** تدريب ١: the letters as printed and the name; the right column of names (book order). */
const ARRANGE: Array<[letters: string[], spoken: string, german: string]> = [
  [["م", "ج", "أ", "د"], "أَمْجَد", "Amgad"],
  [["ي", "س", "ا", "ر", "ئ", "ل", "إ"], "إِسْرَائِيل", "Israil"],
  [["ن", "إ", "م", "ي", "ا"], "إِيمَان", "Iman"],
  [["ؤ", "م", "ن", "س"], "مُؤْنِس", "Mu'nis"],
  [["ء", "ا", "ه", "ي", "ف"], "هَيْفَاء", "Haifaa"],
  [["أ", "م", "و", "ن", "م"], "مَأْمُون", "Ma'mun"],
  [["ن", "أ", "م", "ي"], "أَيْمَن", "Aiman"],
  [["ء", "ع", "ا", "د"], "دُعَاء", "Duaa"],
  [["ئ", "ي", "ج", "ر", "ا", "ل", "ب"], "جِبْرَائِيل", "Gibrail"],
  [["ء", "ش", "ي", "ا", "م"], "شَيْمَاء", "Schaimaa"],
];
const arrangeItem = ([letters, spoken, german]: (typeof ARRANGE)[number], n: number): GapItem => {
  const word = unvocalised(spoken);
  return { id: `arrange-name-${n + 1}`, arabic: word, spoken, german, pattern: "_".repeat(Array.from(word).length), bare: true, choices: [...new Set(letters)] };
};

/** تدريب ٤: the sentences; every word with a Hamza is a gap with its possible spellings. */
const S = (...parts: ClozePart[]) => parts;
const H = (right: string, ...wrong: string[]) => gap([right], [right, ...wrong].sort((a, b) => a.localeCompare(b, "ar")));
const SENTENCES: ClozePart[][] = [
  S(H("أَنَا", "انَا", "إِنَا"), " اسْمِي ", H("أَحْمَد", "احْمَد", "إِحْمَد"), ". ", H("أَنَا", "انَا", "إِنَا"), " مِنَ الْيَمَنِ."),
  S("هَلْ ", H("أَنْتُمْ", "انْتُمْ", "إِنْتُمْ"), " مِنْ ", H("أُسْتُرَالْيَا", "استرَالْيَا", "إِسْتُرَالْيَا"), "؟"),
  S("هَلِ اسْمُكَ ", H("أَشْرَف", "اشْرَف", "إِشْرَف"), "؟ وَهَلْ ", H("أَنْتَ", "انْتَ", "إِنْتَ"), " مِنَ ", H("الْجَزَائِر", "الْجَزَاير", "الْجَزَاءِر"), "؟"),
  S("مِنْ ", H("أَيْنَ", "ايْنَ", "إِيْنَ"), " ", H("أَنْتَ", "انْتَ", "إِنْتَ"), "؟"),
  S("هُوَ اسْمُهُ ", H("إِسْلَام", "اسْلَام", "أَسْلَام"), "، هُوَ مِنْ ", H("زَائِير", "زَايِير", "زَاءِير"), "."),
  S("هَلْ ", H("أَنْتُنَّ", "انْتُنَّ", "إِنْتُنَّ"), " مِنْ ", H("أَمْسْتَرْدَام", "امْسْتَرْدَام", "إِمْسْتَرْدَام"), "؟"),
  S("نَحْنُ ", H("أَسْمَاؤُنَا", "اسْمَاونَا", "أَسْمَائُنَا"), " ", H("مُؤْنِس", "مُونِس", "مُئْنِس"), " وَ", H("رَؤُوف", "رَوُوف", "رَئُوف"), " وَ", H("أَيْمَن", "ايْمَن", "إِيْمَن"), "."),
  S("هُوَ اسْمُهُ ", H("وَائِل", "وَايِل", "وَاءِل"), ". هُوَ مِنْ ", H("أَسْيُوط", "اسْيُوط", "إِسْيُوط"), "."),
];
const SENTENCES_DE = [
  "Ich heiße Ahmad. Ich komme aus dem Jemen.",
  "Kommt ihr aus Australien?",
  "Heißt du Aschraf? Und kommst du aus Algerien?",
  "Woher kommst du?",
  "Er heißt Islam, er kommt aus Zaire.",
  "Kommt ihr (Frauen) aus Amsterdam?",
  "Wir heißen Mu'nis, Ra'uf und Aiman.",
  "Er heißt Wa'il. Er kommt aus Assiut.",
];

/** تدريب ٥: (أ) and (ب) as printed – first the Hamza, then which lines belong together. */
const DIALOGUE_A = [
  S(H("مَسَاءُ", "مَسَاوُ", "مَسَائُ"), " الْخَيْرِ يَا ", H("رَائِف", "رَايِف", "رَاءِف"), "."),
  S(H("أَهْلًا", "اهْلًا", "إِهْلًا"), " وَسَهْلًا بِكِ يَا ", H("أُمَيْمَة", "امَيْمَة", "إِمَيْمَة"), "."),
  S("هَلْ ", H("أَنْتَ", "انْتَ", "إِنْتَ"), " ", H("الْأُسْتَاذ", "الاسْتَاذ", "الْإِسْتَاذ"), " ", H("وَائِل", "وَايِل", "وَاءِل"), "؟"),
  S("هَلْ ", H("أَنْتُمَا", "انْتُمَا", "إِنْتُمَا"), " مِنْ ", H("زَائِير", "زَايِير", "زَاءِير"), "؟"),
  S(H("أَبِي", "ابِي", "إِبِي"), " مِنْ ", H("أَسْيُوط", "اسْيُوط", "إِسْيُوط"), "."),
];
const DIALOGUE_B = [
  S("لَا. ", H("أَنَا", "انَا", "إِنَا"), " ", H("الْأُسْتَاذ", "الاسْتَاذ", "الْإِسْتَاذ"), " ", H("فُؤَاد", "فُوَاد", "فُئَاد"), "."),
  S("لَا. نَحْنُ مِنَ ", H("الْجَزَائِر", "الْجَزَاير", "الْجَزَاءِر"), "."),
  S("وَ", H("أُمِّي", "امِّي", "إِمِّي"), " مِنْ ", H("أَسْوَان", "اسْوَان", "إِسْوَان"), "."),
  S(H("أَهْلًا", "اهْلًا", "إِهْلًا"), " بِكَ يَا ", H("مُؤْمِنَة", "مُومِنَة", "مُئْمِنَة"), "."),
  S(H("مَسَاءُ", "مَسَاوُ", "مَسَائُ"), " النُّورِ يَا ", H("رَؤُوف", "رَوُوف", "رَئُوف"), "."),
];
const plain = (parts: ClozePart[]) => parts.map((p) => (typeof p === "string" ? p : p.accept[0])).join("");
const DIALOGUE_MATCH: MatchContent = {
  promptTitle: "(أ)",
  optionTitle: "(ب)",
  prompts: [
    { id: "a1", arabic: plain(DIALOGUE_A[0]!), answer: "b5" },
    { id: "a2", arabic: plain(DIALOGUE_A[1]!), answer: "b4" },
    { id: "a3", arabic: plain(DIALOGUE_A[2]!), answer: "b1" },
    { id: "a4", arabic: plain(DIALOGUE_A[3]!), answer: "b2" },
    { id: "a5", arabic: plain(DIALOGUE_A[4]!), answer: "b3" },
  ],
  options: DIALOGUE_B.map((parts, n) => ({ id: `b${n + 1}`, label: plain(parts), arabic: plain(parts) })),
};

export const a1Hamza: A1Lesson = {
  slug: "al-hamza",
  kind: "letter",
  label: "ء",
  labelGerman: "Die Hamza",
  steps: [
    {
      kind: "table",
      slug: "step-1",
      title: "Die Formen der Hamza",
      navLabel: "Formen",
      instruction: { arabic: "أَشْكَالُ كِتَابَةِ الْهَمْزَةِ · اِقْرَأِ الْجَدْوَلَ وَكَرِّرْ بَعْدَ الْمُدَرِّسِ.", german: "So schreibt man die Hamza (ء) – am Anfang, in der Mitte und am Ende des Wortes. Hör dir jedes Wort an." },
      tables: [
        {
          id: "hamza",
          titleArabic: "أَشْكَالُ كِتَابَةِ الْهَمْزَةِ",
          title: "Die Hamza am Anfang, in der Mitte, am Ende",
          columns: [
            { arabic: "", german: "" },
            { arabic: "فِي أَوَّلِ الْكَلِمَةِ", german: "am Anfang" },
            { arabic: "فِي مُنْتَصَفِ الْكَلِمَةِ", german: "in der Mitte" },
            { arabic: "فِي آخِرِ الْكَلِمَةِ", german: "am Ende" },
            { arabic: "", german: "Form" },
          ],
          rows: HAMZA_TABLE.map(([label, s, m, e, shape]) => [
            { arabic: label, listen: false },
            s ? { arabic: s, german: HAMZA_GERMAN[s] } : { arabic: "", listen: false },
            m ? { arabic: m, german: HAMZA_GERMAN[m] } : { arabic: "", listen: false },
            { arabic: e, german: HAMZA_GERMAN[e] },
            { arabic: shape, listen: false },
          ] satisfies TableCell[]),
        },
        {
          id: "rules",
          titleArabic: "لَاحِظِ الْقَوَاعِدَ",
          title: "Die Regeln",
          columns: [{ arabic: "", german: "" }, { arabic: "", german: "Beispiel" }],
          rows: [
            [{ arabic: "١ – فِي أَوَّلِ الْكَلِمَةِ: ء + الْحَرَكَةُ: ء + ـَ = أَ · ء + ـِ = إِ · ء + ـُ = أُ", german: "Am Anfang: auf dem Alif – mit Fatha und Damma darüber, mit Kasra darunter.", listen: false }, { arabic: "أَحْمَد – إِحْسَان – أُمَيْمَة" }],
            [{ arabic: "٢ – فِي مُنْتَصَفِ الْكَلِمَةِ: حَرْفٌ + ء + حَرْفٌ = أ / ئـ / ؤ", german: "In der Mitte: auf ا (nach a), auf ئـ (bei i), auf و (bei u).", listen: false }, { arabic: "سَأَلَ – أَسْئِلَة – سُؤَال" }],
            [{ arabic: "٣ – فِي آخِرِ الْكَلِمَةِ: حَرْفٌ + ء = أ / ئ / ؤ / ء", german: "Am Ende: nach a auf ا, nach i auf ئ, nach u auf و; nach Sukun, nach و mit Sukun und nach ا allein (ء).", listen: false }, { arabic: "بَدَأَ – بَطِيء – تَبَاطُؤ – بَدْء – ضَوْء – هَنَاء" }],
            [{ arabic: "٤ – لَا تُكْتَبُ الْهَمْزَةُ مَعَ كَلِمَةِ: اسْم / ابْن / الـ (الصُّومَال) أَيِ الْكَلِمَاتِ الْمُعَرَّفَةِ بِالـ", german: "Keine Hamza bei اسم, ابن und beim Artikel الـ.", listen: false }, { arabic: "اسْم – ابْن – الصُّومَال" }],
          ],
          note: "آسِر = أ + أَسِر: zwei Alif am Wortanfang werden zu آ (Alif madda).",
        },
      ],
      quiz: [
        { id: "start-i", prompt: "Am Wortanfang mit Kasra steht die Hamza …", options: ["أ", "إ", "ؤ"], answer: 1 },
        { id: "middle-u", prompt: "سُؤَال: in der Mitte, nach u, steht sie auf …", options: ["ا", "و", "ي"], answer: 1 },
        { id: "end-alif", prompt: "Nach ا am Wortende steht sie …", options: ["allein: هَنَاء", "auf ا: هَنَاأ", "auf ي: هَنَائ"], answer: 0 },
        { id: "no-hamza", prompt: "Wo schreibt man keine Hamza?", options: ["أَحْمَد", "اسْم", "أُمَيْمَة"], answer: 1 },
      ],
    },
    {
      kind: "phrases",
      slug: "step-2",
      title: "Nachsprechen: die Wörter der Tabelle",
      navLabel: "Nachsprechen",
      instruction: { arabic: "اِقْرَأِ الْجَدْوَلَ وَكَرِّرْ بَعْدَ الْمُدَرِّسِ.", german: "Lies die Wörter der Tabelle und sprich sie nach.", note: "Die Bewertung prüft die Konsonanten; die Hamza selbst kann sie nicht sicher hören – sprich sie trotzdem deutlich." },
      groups: [{ id: "hamza-words", title: "Die Wörter mit Hamza", items: HAMZA_WORDS.map(hamzaPhrase) }],
    },
    {
      kind: "gaps",
      slug: "step-3",
      title: "Übung 1: Namen aus Buchstaben",
      navLabel: "Übung 1",
      instruction: { arabic: "تَدْرِيبٌ (١): اِسْمَعْ وَرَتِّبِ الْحُرُوفَ لِتُكَوِّنَ أَسْمَاءً ثُمَّ اقْرَأِ الْأَسْمَاءَ.", german: "Übung 1: Hör zu und ordne die Buchstaben zu einem Namen – von rechts nach links.", note: "Im Buch verbindest du das Wort danach mit dem richtigen Namen der rechten Spalte; hier siehst und hörst du den Namen, sobald er stimmt." },
      gaps: gaps2("picture", ["أ"], ARRANGE.map(arrangeItem), { clip: "shared/arrange_intro", text: "Ordne die Buchstaben: Leg sie von rechts nach links in die Felder, so dass ein Name entsteht." }),
    },
    {
      kind: "gaps",
      slug: "step-4",
      title: "Übung 2: die Hamza in Namen",
      navLabel: "Übung 2",
      instruction: { arabic: "تَدْرِيبٌ (٢): اِسْمَعْ وَاكْتُبِ الْهَمْزَةَ ثُمَّ اقْرَأْ أَسْمَاءَ الْأَشْخَاصِ.", german: "Übung 2: Hör zu und schreib die Hamza – auf welchem Träger steht sie?", note: "Die Lösungen stehen im Buch unter „حَلُّ تَدْرِيبِ (٢)“." },
      gaps: gaps2(
        "listen",
        SEATS,
        ([
          ["طَائِل", "Ta'il"], ["رَائِف", "Ra'if"], ["أَسْمَاء", "Asmaa"], ["وِئَام", "Wi'am"], ["وَلَاء", "Walaa"],
          ["فُؤَاد", "Fu'ad"], ["نَجْلَاء", "Nagla"], ["مِيخَائِيل", "Michail"], ["إِلْهَام", "Ilham"], ["رَؤُوف", "Ra'uf"],
        ] as Array<[string, string]>).map(([arabic, name], n) => hamzaGap(`name-${n + 1}`, arabic, `${name} (Name)`))
      ),
    },
    {
      kind: "gaps",
      slug: "step-5",
      title: "Übung 3: die Hamza in Wörtern",
      navLabel: "Übung 3",
      instruction: { arabic: "تَدْرِيبٌ (٣): اِسْمَعِ الْكَلِمَةَ وَاكْتُبِ الْهَمْزَةَ.", german: "Übung 3: Hör das Wort und schreib die Hamza.", note: "Die Lösungen stehen im Buch unter „حَلُّ تَدْرِيبِ (٣)“." },
      gaps: gaps2(
        "listen",
        SEATS,
        ([
          ["أَحْمَر", "rot"], ["آخَر", "anderer"], ["إِبْرَة", "Nadel"], ["ذِئْب", "Wolf"], ["سُؤَال", "Frage"],
          ["الْجَزَائِر", "Algerien"], ["نَشْأَت", "Naschat (Name)"], ["أُسْتَاذ", "Lehrer, Professor"], ["مُؤْمِن", "gläubig; Mu'min (Name)"], ["بَدْء", "Beginn"],
        ] as Array<[string, string]>).map(([arabic, german], n) => hamzaGap(`word-${n + 1}`, arabic, german))
      ),
    },
    {
      kind: "cloze",
      slug: "step-6",
      title: "Übung 4: die Hamza in Sätzen",
      navLabel: "Übung 4",
      instruction: { arabic: "تَدْرِيبٌ (٤): اُكْتُبِ الْهَمْزَةَ فِي الْجُمَلِ الْآتِيَةِ.", german: "Übung 4: Wo fehlt die Hamza? Wähle jedes Wort richtig geschrieben." },
      items: SENTENCES.map((parts, n) => ({ id: `s${n + 1}`, hint: SENTENCES_DE[n], lines: [{ label: String(n + 1), parts }] })),
    },
    {
      kind: "cloze",
      slug: "step-7",
      title: "Übung 5 (1): die Hamza in (أ) und (ب)",
      navLabel: "Übung 5 (Hamza)",
      instruction: { arabic: "تَدْرِيبٌ (٥): ١ – اُكْتُبِ الْهَمْزَةَ فِي الْجُمَلِ الْآتِيَةِ.", german: "Übung 5, Teil 1: Schreib die Hamza in den Sätzen der Spalten (أ) und (ب)." },
      items: [...DIALOGUE_A.map((parts, n) => ({ id: `a${n + 1}`, lines: [{ label: "أ", parts }] })), ...DIALOGUE_B.map((parts, n) => ({ id: `b${n + 1}`, lines: [{ label: "ب", parts }] }))],
    },
    {
      kind: "match",
      slug: "step-8",
      title: "Übung 5 (2): Was gehört zusammen?",
      navLabel: "Übung 5 (verbinden)",
      instruction: { arabic: "٢ – صِلْ (أ) مَعَ (ب) لِتُكَوِّنَ حِوَارًا. اِسْمَعْ وَصَحِّحْ.", german: "Übung 5, Teil 2: Verbinde jede Zeile aus (أ) mit der passenden Antwort aus (ب).", note: "Im Buch heißen die Leute in der Antwort manchmal anders als in der Frage (رَائِف / رَؤُوف, أُمَيْمَة / مُؤْمِنَة) – so ist es gedruckt." },
      match: DIALOGUE_MATCH,
    },
  ],
};

// ---------------------------------------------------------------------------
// تدريبات عامة على قراءة الحروف وكتابتها

const D1: Array<[pattern: string, arabic: string, german: string]> = [
  ["حِ_ا_", "حِذَاء", "Schuh"], ["أُرْ_", "أُرْزْ", "Reis"], ["غَ_ال", "غَزَال", "Gazelle"], ["وَاعِ_", "وَاعِظْ", "Prediger"], ["مُو_", "مُوزْ", "Bananen"], ["_قْن", "ذَقْن", "Kinn"],
  ["_بْي", "ظَبْي", "Gazelle"], ["_هْرَة", "زَهْرَة", "Blume"], ["_يْل", "ذَيْل", "Schwanz"], ["_هْر", "ظُهْر", "Mittag"], ["_رّ", "زِرّ", "Knopf"],
];
const D2: Array<[pattern: string, arabic: string, german: string]> = [
  ["_تَاب", "كِتَاب", "Buch"], ["_طَّة", "قِطَّة", "Katze"], ["_لْب", "كَلْب", "Hund"], ["_لَم", "قَلَم", "Stift"], ["دِي_", "دِيكْ", "Hahn"], ["_رَة", "كُرَة", "Ball"],
  ["_رْد", "قِرْد", "Affe"], ["صُنْدُو_", "صُنْدُوقْ", "Kiste"], ["_لْب", "قَلْب", "Herz"], ["_نَاة", "قَنَاة", "Kanal"], ["_رَّاسَة", "كُرَّاسَة", "Heft"], ["_صْر", "قَصْر", "Palast"],
];
const THREE = ["ذ", "ز", "ظ"];
const tilesOf = (letters: string[]) => letters.flatMap((l) => ["َ", "ِ", "ُ", "ْ"].map((m) => l + m));
const familyItem = (letters: string[]) => ([pattern, arabic, german]: [string, string, string], n: number): GapItem => {
  const item = dictationItem(`t-${n + 1}`, pattern, arabic, german);
  const tiles = tilesOf(letters);
  // A gap of the drilled letters gets their tiles; another gap (e.g. the ء of حِذَاء) keeps its own.
  return { ...item, gapChoices: item.gapChoices!.map((own) => (own.some((t) => letters.some((l) => t.startsWith(l))) ? [...new Set([...tiles, ...own.filter((t) => letters.some((l) => t.startsWith(l)))])] : own)) };
};

/** تدريب ٣: the book prints no solution – Alif speaks the first option of each row (see the note). */
const UNDERLINE: QuizItem[] = [
  { id: "u1", arabic: "أَهْلًا", german: "willkommen", show: false, questions: [{ prompt: "Welches Wort hörst du?", options: ["سَهْلًا", "أَهْلًا", "فِعْلًا"], answer: 1 }] },
  { id: "u2", arabic: "كَيْفَ حَالُكَ؟", german: "Wie geht es dir? (zu einem Mann)", show: false, questions: [{ prompt: "Welche Frage hörst du?", options: ["كَيْفَ حَالُكِ؟", "كَيْفَ ذَلِكَ؟", "كَيْفَ حَالُكَ؟"], answer: 2 }] },
  { id: "u3", arabic: "مَسَاءُ النُّورِ", german: "Guten Abend (Antwort)", show: false, questions: [{ prompt: "Was hörst du?", options: ["صَبَاحُ النُّورِ", "مَسَاءُ النُّورِ", "صَادِقُ نُور"], answer: 1 }] },
];

/** تدريب ٤: the two pictures together give every name (student 1 asks about the empty circles of picture 1 …). */
const STUDENTS: Array<[letter: string, name: string, female: boolean, asks: 1 | 2]> = [
  ["أ", "مَأْمُون", false, 1], ["ج", "غَسَّان", false, 1], ["هـ", "إِسْرَاء", true, 1], ["ح", "وَائِل", false, 1],
  ["ب", "شَيْمَاء", true, 2], ["د", "عَلَاء", false, 2], ["و", "عَبَّاس", false, 2], ["ز", "عَلِيَّة", true, 2],
];
const NAMES = ["مَأْمُون", "غَسَّان", "إِسْرَاء", "وَائِل", "شَيْمَاء", "عَلَاء", "عَبَّاس", "عَلِيَّة", "وَفِيَّة"];

export const a1Drills4: A1Lesson = {
  slug: "tadribat-amma",
  kind: "review",
  label: "تَدْرِيبَاتٌ عَامَّة",
  labelGerman: "Lesen und Schreiben üben",
  steps: [
    {
      kind: "gaps",
      slug: "step-1",
      title: "Übung 1: ذ, ز oder ظ",
      navLabel: "Übung 1",
      instruction: { arabic: "تَدْرِيبَاتٌ عَامَّةٌ عَلَى قِرَاءَةِ الْحُرُوفِ وَكِتَابَتِهَا · تَدْرِيبٌ (١): اِسْمَعْ وَاكْتُبِ الْحَرْفَ النَّاقِصَ (ذ، ز، ظ).", german: "Übung 1: Hör zu und schreib den fehlenden Buchstaben – ذ, ز oder ظ.", note: "Die Lösungen stehen im Buch unter „حَلُّ تَدْرِيبِ (١)“." },
      gaps: gaps2("listen", tilesOf(THREE), D1.map(familyItem(THREE))),
    },
    {
      kind: "gaps",
      slug: "step-2",
      title: "Übung 2: ق oder ك",
      navLabel: "Übung 2",
      instruction: { arabic: "تَدْرِيبٌ (٢): اِسْمَعْ وَاكْتُبِ الْحَرْفَ النَّاقِصَ (ق، ك).", german: "Übung 2: Hör zu und schreib ق oder ك.", note: "Die Lösungen stehen im Buch unter „حَلُّ تَدْرِيبِ (٢)“." },
      gaps: gaps2("listen", tilesOf(["ق", "ك"]), D2.map(familyItem(["ق", "ك"]))),
    },
    {
      kind: "quiz",
      slug: "step-3",
      title: "Übung 3: Welches Wort hörst du?",
      navLabel: "Übung 3",
      instruction: { arabic: "تَدْرِيبٌ (٣): اِسْمَعْ وَضَعْ خَطًّا تَحْتَ الْكَلِمَةِ الصَّحِيحَةِ.", german: "Übung 3: Hör zu und wähle das Wort, das du hörst.", note: "Das Buch druckt hier keine Lösung (die Aufnahme ist auf der CD). Alif spricht in jeder Zeile eines der drei Wörter." },
      items: UNDERLINE,
    },
    {
      kind: "quiz",
      slug: "step-4",
      title: "Übung 4: Wie heißen die Studenten?",
      navLabel: "Übung 4",
      instruction: { arabic: "تَدْرِيبٌ (٤): اِسْأَلْ زَمِيلَكَ عَنِ الْأَسْمَاءِ النَّاقِصَةِ فِي الصُّوَرِ. مِثَال: مَا اسْمُ طَالِبِ أ، مَا اسْمُهُ؟", german: "Übung 4: In Bild 1 fehlen andere Namen als in Bild 2. Frag nach den fehlenden Namen – hier gibt dir Alif die Antwort aus dem Bild deines Partners.", note: "Im Buch arbeiten zwei Lernpartner mit je einem Bild (طَالِب ١ und طَالِب ٢)." },
      items: STUDENTS.map(([letter, name, female, asks]) => ({
        id: `student-${asks}-${letter === "هـ" ? "h" : letter.charCodeAt(0)}`,
        arabic: female ? `مَا اسْمُ طَالِبَةِ ${letter}؟ مَا اسْمُهَا؟` : `مَا اسْمُ طَالِبِ ${letter}؟ مَا اسْمُهُ؟`,
        german: `${asks === 1 ? "Bild 1" : "Bild 2"}: ${female ? "die Studentin" : "der Student"} ${letter}`,
        questions: [{ prompt: female ? "اسْمُهَا …" : "اسْمُهُ …", options: NAMES, answer: NAMES.indexOf(name) }],
      })),
    },
  ],
};

// ---------------------------------------------------------------------------
// المحادثة: أَنَا مِصْرِيّ

const sp = (id: string, name: string, voice: DialogueSpeaker["voice"], alt: string): DialogueSpeaker => ({ id, name, voice, avatar: { src: `${IMG}/${id}.svg`, alt } });

export const mustafaYamahu: Dialogue = {
  id: "mustafa-yamahu",
  intro: "Am Flughafen: Mustafa stößt mit Yamahu zusammen und entschuldigt sich.",
  speakers: [sp("mustafa", "Mustafa", "male-1", "Mustafa, ein Mann mit Schnurrbart und Krawatte"), sp("yamahu", "Yamahu", "male-2", "Yamahu, ein Mann mit Brille und Koffer")],
  lines: lines([
    ["u4-my-1", "mustafa", "آه، عَفْوًا … أَنَا آسِفٌ جِدًّا.", "آه عفوا أنا آسف جدا", "Āh, ʿafwan … ana āsifun jiddan.", "Oh, Entschuldigung … es tut mir sehr leid."],
    ["u4-my-2", "yamahu", "لَا مُشْكِلَةَ. هَلْ أَنْتَ مِنْ مِصْرَ؟", "لا مشكلة هل أنت من مصر", "Lā mushkilata. Hal anta min Miṣra?", "Kein Problem. Kommst du aus Ägypten?"],
    ["u4-my-3", "mustafa", "نَعَمْ، أَنَا مِنْ مِصْرَ. أَنَا مِصْرِيٌّ. وَأَنْتَ؟ مِنْ أَيْنَ أَنْتَ؟", "نعم أنا من مصر أنا مصري وأنت من أين أنت", "Naʿam, ana min Miṣra. Ana miṣriyyun. Wa-anta? Min ayna anta?", "Ja, ich komme aus Ägypten. Ich bin Ägypter. Und du? Woher kommst du?"],
    ["u4-my-4", "yamahu", "أَنَا مِنَ الْيَابَانِ. أَنَا يَابَانِيٌّ.", "أنا من اليابان أنا ياباني", "Ana mina l-Yābān. Ana yābāniyyun.", "Ich komme aus Japan. Ich bin Japaner."],
    ["u4-my-5", "mustafa", "أَهْلًا، تَشَرَّفْنَا، وَأَهْلًا بِكَ فِي مِصْرَ.", "أهلا تشرفنا وأهلا بك في مصر", "Ahlan, tasharrafnā, wa-ahlan bika fī Miṣra.", "Hallo, freut mich – und willkommen in Ägypten."],
    ["u4-my-6", "yamahu", "شُكْرًا. مَعَ السَّلَامَةِ.", "شكرا مع السلامة", "Shukran. Maʿa s-salāma.", "Danke. Auf Wiedersehen."],
    ["u4-my-7", "mustafa", "مَعَ السَّلَامَةِ.", "مع السلامة", "Maʿa s-salāma.", "Auf Wiedersehen."],
  ]),
  question: { prompt: "كَيْفَ اعْتَذَرَ مُصْطَفَى؟ مَا هُوَ الرَّدُّ عَلَى الِاعْتِذَارِ؟ – Wie entschuldigt sich Mustafa, und was ist die Antwort?", options: ["أَنَا آسِفٌ جِدًّا – لَا مُشْكِلَةَ.", "شُكْرًا – مَعَ السَّلَامَةِ.", "أَهْلًا – تَشَرَّفْنَا."], answer: 0 },
};

export const planeDialogue: Dialogue = {
  id: "plane",
  intro: "Im Flugzeug: Zwei Frauen unterhalten sich.",
  speakers: [sp("plane-1", "Erste Frau", "female-1", "Eine Frau mit langen dunklen Haaren"), sp("plane-2", "Zweite Frau", "female-2", "Eine Frau mit blonden Locken")],
  lines: lines([
    ["u4-pl-1", "plane-1", "هَلْ أَنْتِ أَمْرِيكِيَّةٌ؟", "هل أنت أمريكية", "Hal anti amrīkiyya?", "Bist du Amerikanerin?"],
    ["u4-pl-2", "plane-2", "لَا، أَنَا كَنَدِيَّةٌ. وَأَنْتِ؟", "لا أنا كندية وأنت", "Lā, ana kanadiyya. Wa-anti?", "Nein, ich bin Kanadierin. Und du?"],
    ["u4-pl-3", "plane-1", "أَنَا لُبْنَانِيَّةٌ. هَلْ أَنْتِ فِي إِجَازَةٍ؟", "أنا لبنانية هل أنت في إجازة", "Ana lubnāniyya. Hal anti fī ijāza?", "Ich bin Libanesin. Bist du im Urlaub?"],
    ["u4-pl-4", "plane-2", "نَعَمْ، أَنَا فِي إِجَازَةٍ.", "نعم أنا في إجازة", "Naʿam, ana fī ijāza.", "Ja, ich bin im Urlaub."],
  ]),
  question: { prompt: "مِنْ أَيْنَ الْمَرْأَتَانِ؟ – Woher kommen die beiden Frauen?", options: ["Aus Kanada und dem Libanon.", "Aus Amerika und Kanada.", "Aus dem Libanon und Amerika."], answer: 0 },
};

/** لاحظ القواعد (١): النسبة – country, then masculine singular, masculine plural, feminine singular, feminine plural (book order). */
const NISBA: Array<[country: string, ms: string, mp: string, fs: string, fp: string, de: string]> = [
  ["مِصْر", "مِصْرِيّ", "مِصْرِيُّون", "مِصْرِيَّة", "مِصْرِيَّات", "Ägypten"],
  ["فَرَنْسَا", "فَرَنْسِيّ", "فَرَنْسِيُّون", "فَرَنْسِيَّة", "فَرَنْسِيَّات", "Frankreich"],
  ["إِيطَالْيَا", "إِيطَالِيّ", "إِيطَالِيُّون", "إِيطَالِيَّة", "إِيطَالِيَّات", "Italien"],
  ["كَنَدَا", "كَنَدِيّ", "كَنَدِيُّون", "كَنَدِيَّة", "كَنَدِيَّات", "Kanada"],
  ["أَلْمَانْيَا", "أَلْمَانِيّ", "أَلْمَان", "أَلْمَانِيَّة", "أَلْمَانِيَّات", "Deutschland"],
  ["الصُّومَال", "صُومَالِيّ", "صُومَالِيُّون", "صُومَالِيَّة", "صُومَالِيَّات", "Somalia"],
  ["الْمَغْرِب", "مَغْرِبِيّ", "مَغَارِبَة", "مَغْرِبِيَّة", "مَغْرِبِيَّات", "Marokko"],
  ["إِنْجِلْتِرَا", "إِنْجِلِيزِيّ", "إِنْجِلِيز", "إِنْجِلِيزِيَّة", "إِنْجِلِيزِيَّات", "England"],
];
export const nisbaOf = (country: string, form: "ms" | "mp" | "fs" | "fp") => {
  const row = NISBA.find((r) => r[0] === country);
  return row ? row[{ ms: 1, mp: 2, fs: 3, fp: 4 }[form]] : undefined;
};

/** تدريب ٣: short dialogues under the book's four pictures (first words printed). */
const PICTURE_DIALOGUES: ClozeItem[] = [
  { id: "welcome", image: { src: `${IMG}/ex3-welcome.svg`, alt: "Zwei Männer geben sich in einer Hotelhalle die Hand" }, hint: "Begrüßung (Ankunft)", lines: [{ label: "١", parts: ["أَهْلًا وَ", gap(["سَهْلًا."], ["سَهْلًا.", "السَّلَامَة.", "مُشْكِلَة."])] }, { label: "٢", parts: [gap(["أَهْلًا بِكَ."], ["أَهْلًا بِكَ.", "مَعَ السَّلَامَةِ.", "لَا مُشْكِلَةَ."])] }] },
  { id: "sorry", image: { src: `${IMG}/ex3-sorry.svg`, alt: "Ein Kellner hat einem Gast Essen auf die Kleidung geschüttet" }, hint: "Entschuldigung", lines: [{ label: "١", parts: ["آسِف ", gap(["جِدًّا."], ["جِدًّا.", "بِكَ.", "وَسَهْلًا."])] }, { label: "٢", parts: [gap(["لَا مُشْكِلَةَ."], ["لَا مُشْكِلَةَ.", "أَهْلًا بِكَ.", "شُكْرًا جِدًّا."])] }] },
  { id: "goodbye", image: { src: `${IMG}/ex3-goodbye.svg`, alt: "Am Flughafen: Leute verabschieden sich vor dem Flugzeug" }, hint: "Abschied", lines: [{ label: "١", parts: ["مَعَ ", gap(["السَّلَامَةِ."], ["السَّلَامَةِ.", "النُّورِ.", "الْخَيْرِ."])] }, { label: "٢", parts: [gap(["مَعَ السَّلَامَةِ."], ["مَعَ السَّلَامَةِ.", "صَبَاحُ النُّورِ.", "لَا مُشْكِلَةَ."])] }] },
  { id: "bump", image: { src: `${IMG}/ex3-bump.svg`, alt: "Im Park: ein Mann stößt einen anderen an, der hinfällt" }, hint: "Entschuldigung", lines: [{ label: "١", parts: [gap(["آسِف جِدًّا.", "عَفْوًا، أَنَا آسِف."], ["آسِف جِدًّا.", "أَهْلًا وَسَهْلًا.", "عَفْوًا، أَنَا آسِف."])] }, { label: "٢", parts: [gap(["لَا مُشْكِلَةَ."], ["لَا مُشْكِلَةَ.", "مَعَ السَّلَامَةِ.", "أَهْلًا بِكَ."])] }] },
];

/** تدريب ٥: a sentence pair under each flag – who holds it (one / several, man / woman); the four forms of the Nisba. */
const FLAGS: Array<[id: string, country: string, forms: [ms: string, fs: string, mp: string, fp: string], right: number, people: string, alt: string]> = [
  ["china", "الصِّين", ["صِينِيّ", "صِينِيَّة", "صِينِيُّون", "صِينِيَّات"], 2, "Zwei Männer", "Zwei Männer mit der Fahne Chinas"],
  ["japan", "الْيَابَان", ["يَابَانِيّ", "يَابَانِيَّة", "يَابَانِيُّون", "يَابَانِيَّات"], 1, "Eine Frau", "Eine Frau im Kimono mit der Fahne Japans"],
  ["canada", "كَنَدَا", ["كَنَدِيّ", "كَنَدِيَّة", "كَنَدِيُّون", "كَنَدِيَّات"], 2, "Zwei Männer", "Zwei Männer mit der Fahne Kanadas"],
  ["korea", "كُورِيَا", ["كُورِيّ", "كُورِيَّة", "كُورِيُّون", "كُورِيَّات"], 3, "Drei Frauen", "Drei Frauen mit der Fahne Koreas"],
  ["saudi", "السُّعُودِيَّة", ["سُعُودِيّ", "سُعُودِيَّة", "سُعُودِيُّون", "سُعُودِيَّات"], 0, "Ein Mann", "Ein Mann mit Ghutra und der Fahne Saudi-Arabiens"],
  ["usa", "أَمْرِيكَا", ["أَمْرِيكِيّ", "أَمْرِيكِيَّة", "أَمْرِيكِيُّون", "أَمْرِيكِيَّات"], 3, "Zwei Frauen", "Zwei Frauen mit der Fahne der USA"],
  ["uk", "إِنْجِلْتِرَا", ["إِنْجِلِيزِيّ", "إِنْجِلِيزِيَّة", "إِنْجِلِيز", "إِنْجِلِيزِيَّات"], 0, "Ein Mann", "Ein Wachsoldat mit der Fahne Großbritanniens"],
  ["russia", "رُوسْيَا", ["رُوسِيّ", "رُوسِيَّة", "رُوس", "رُوسِيَّات"], 2, "Zwei Männer", "Zwei Männer mit Mützen und der Fahne Russlands"],
  ["switzerland", "سُوِيسْرَا", ["سُوِيسْرِيّ", "سُوِيسْرِيَّة", "سُوِيسْرِيُّون", "سُوِيسْرِيَّات"], 1, "Eine Frau", "Eine Frau mit der Fahne der Schweiz"],
];
const FLAG_ITEMS: ClozeItem[] = FLAGS.map(([id, country, forms, right, people, alt], n) => {
  const p = right <= 1 ? "أَنَا" : "نَحْنُ";
  const min = country.startsWith("ال") ? "مِنَ" : "مِنْ";
  const countries = [country, FLAGS[(n + 1) % FLAGS.length]![1], FLAGS[(n + 4) % FLAGS.length]![1]];
  return {
    id,
    image: { src: `${IMG}/flag-${id}.svg`, alt },
    hint: `${people}.`,
    lines: [
      { label: "١", parts: [`${p} `, gap([`${min} ${country}.`], countries.map((c) => `${c.startsWith("ال") ? "مِنَ" : "مِنْ"} ${c}.`))] },
      { label: "٢", parts: [`${p} `, gap([`${forms[right]}.`], forms.map((f) => `${f}.`))] },
    ],
  };
});

/** تدريب ٦: choose the country (the book's pair) and answer; the first is the book's example. */
const CHOOSE: Array<[question: string, pair: [string, string], pronoun: string, nisba: [right: string, ...wrong: string[]], de: string]> = [
  ["مِنْ أَيْنَ مِيخَالِيس؟", ["الْيُونَان", "الْأَرْجَنْتِين"], "هُوَ", ["يُونَانِيّ", "يُونَانِيَّة", "أَرْجَنْتِينِيَّة"], "Michalis"],
  ["مِنْ أَيْنَ جُون / مَارْك / لُوسِي؟", ["أَمْرِيكَا", "الصِّين"], "هُمْ", ["أَمْرِيكِيُّون", "أَمْرِيكِيّ", "صِينِيَّات"], "John, Mark und Lucy"],
  ["مِنْ أَيْنَ هَايُوسُون؟", ["كُورِيَا", "إِسْبَانْيَا"], "هُوَ", ["كُورِيّ", "كُورِيَّات", "إِسْبَانِيَّة"], "Hayoson"],
  ["مِنْ أَيْنَ جَاكِي وَنَاتَالِي وَلِنْدَا؟", ["إِنْجِلْتِرَا", "الْيَابَان"], "هُنَّ", ["إِنْجِلِيزِيَّات", "إِنْجِلِيزِيّ", "يَابَانِيُّون"], "Jacky, Natalie und Linda"],
  ["مِنْ أَيْنَ سُعَاد؟", ["الْبُرْتُغَال", "سُورِيَا"], "هِيَ", ["سُورِيَّة", "سُورِيّ", "بُرْتُغَالِيُّون"], "Suad"],
];
/** The country each name fits (the book leaves the choice to the learner). */
const CHOSEN = ["الْيُونَان", "أَمْرِيكَا", "كُورِيَا", "إِنْجِلْتِرَا", "سُورِيَا"];
const min = (c: string) => `${c.startsWith("ال") ? "مِنَ" : "مِنْ"} ${c}`;
const CHOOSE_ITEMS: ClozeItem[] = CHOOSE.map(([question, pair, pronoun, [nisba, ...wrong], de], n) => ({
  id: `c${n + 1}`,
  hint: `${de} – (${pair.join(" / ")})`,
  lines: [
    { label: "أ", parts: [question] },
    { label: "ب", parts: [`${pronoun} `, gap([`${min(CHOSEN[n]!)}،`], pair.map((c) => `${min(c)}،`)), ` ${pronoun} `, gap([`${nisba}.`], [nisba, ...wrong].map((x) => `${x}.`))] },
  ],
}));

/** تدريب ٧: Talal and Aliya – Aliya's answers are free (name, country, holiday or study). */
const TALAL: ClozeItem[] = [
  { id: "t1", lines: [{ label: "طَلَال", parts: ["أَنَا طَلَال. أَنَا كُوَيْتِيّ. وَأَنْتِ مَا اسْمُكِ؟"] }, { label: "عَالِيَة", parts: [gap(["أَنَا عَالِيَة.", "اسْمِي عَالِيَة."], ["أَنَا عَالِيَة.", "اسْمِي عَالِيَة.", "أَنَا طَلَال.", "اسْمُكِ عَالِيَة."])] }] },
  { id: "t2", lines: [{ label: "طَلَال", parts: ["مِنْ أَيْنَ أَنْتِ يَا عَالِيَة؟"] }, { label: "عَالِيَة", parts: ["أَنَا مِنْ ", gap(["مِصْر.", "الْأُرْدُنّ.", "سُورِيَا.", "الْمَغْرِب."], ["مِصْر.", "الْأُرْدُنّ.", "سُورِيَا.", "الْمَغْرِب."])] }] },
  { id: "t3", lines: [{ label: "طَلَال", parts: ["هَلْ أَنْتِ فِي إِجَازَةٍ أَوْ دِرَاسَةٍ؟"] }, { label: "عَالِيَة", parts: ["أَنَا فِي ", gap(["إِجَازَةٍ.", "دِرَاسَةٍ."], ["إِجَازَةٍ.", "دِرَاسَةٍ.", "مِصْر."])] }] },
  { id: "t4", lines: [{ label: "طَلَال", parts: ["أَهْلًا وَسَهْلًا. تَشَرَّفْنَا."] }, { label: "عَالِيَة", parts: [gap(["أَهْلًا بِكَ."], ["أَهْلًا بِكَ.", "أَهْلًا بِكِ.", "صَبَاحُ الْخَيْرِ."])] }] },
];

const NISBA_COLS = [
  { arabic: "مِنْ أَيْنَ أَنْتَ", german: "Land" },
  { arabic: "مُفْرَدٌ مُذَكَّرٌ", german: "ein Mann" },
  { arabic: "جَمْعٌ مُذَكَّرٌ", german: "mehrere Männer" },
  { arabic: "مُفْرَدٌ مُؤَنَّثٌ", german: "eine Frau" },
  { arabic: "جَمْعٌ مُؤَنَّثٌ", german: "mehrere Frauen" },
];

export const a1AnaMisri: A1Lesson = {
  slug: "ana-misri",
  kind: "phrase",
  label: "أَنَا مِصْرِيّ",
  labelGerman: "Ich bin Ägypter",
  steps: [
    {
      kind: "dialogue",
      mode: "listen",
      slug: "step-1",
      title: "Anhören: Mustafa und Yamahu",
      navLabel: "Anhören 1",
      instruction: { arabic: "الْمُحَادَثَةُ: أَنَا مِصْرِيّ؟ · ١) اُنْظُرْ إِلَى الصُّورَةِ. أَيْنَ هُمْ؟ – اِسْمَعِ الْحِوَارَ وَأَجِبْ.", german: "Schau auf das Bild: Wo sind sie? (am Flughafen) – Hör die Unterhaltung und antworte.", note: "Nützliche Wörter: مَطَار (Flughafen) – آسِف (es tut mir leid) – لَا مُشْكِلَةَ (kein Problem) – مَعَ السَّلَامَةِ (auf Wiedersehen) – عَاصِمَة / عَوَاصِم (Hauptstadt) – جِنْسِيَّة (Nationalität)." },
      dialogue: mustafaYamahu,
    },
    { kind: "dialogue", mode: "repeat", slug: "step-2", title: "Nachsprechen 1", navLabel: "Nachsprechen 1", instruction: { arabic: "اِسْمَعْ مَرَّةً أُخْرَى. مَا هُوَ سَلَامُ يَامَاهُو وَمَا هُوَ الرَّدُّ؟", german: "Hör noch einmal und sprich jede Zeile nach. Wie verabschieden sie sich am Ende?" }, dialogue: mustafaYamahu },
    {
      kind: "table",
      slug: "step-3",
      title: "Grammatik: Nationalität (النسبة), Gruß und Antwort",
      navLabel: "Grammatik",
      instruction: { arabic: "لَاحِظِ الْقَوَاعِدَ: ١ – لِاسْتِخْدَامِ النِّسْبَةِ كَصِفَةٍ وَالتَّعْبِيرِ عَنِ الْجِنْسِيَّةِ · ٢) التَّحِيَّةُ وَالرَّدُّ", german: "Achte auf die Regeln: Aus dem Land wird die Nationalität (مِصْر → مِصْرِيّ). Achte auf die Endungen für Mann / Frau und Einzahl / Mehrzahl." },
      tables: [
        {
          id: "nisba",
          titleArabic: "١ – لِاسْتِخْدَامِ النِّسْبَةِ كَصِفَةٍ وَالتَّعْبِيرِ عَنِ الْجِنْسِيَّةِ: الصِّفَةُ الْجِنْسِيَّةُ",
          title: "Die Nationalität",
          columns: NISBA_COLS,
          rows: NISBA.map(([country, ms, mp, fs, fp, de]) => [{ arabic: country, german: de }, { arabic: ms, gender: "m" }, { arabic: mp, gender: "m" }, { arabic: fs, gender: "f" }, { arabic: fp, gender: "f" }]),
          note: "لَاحِظْ نِهَايَاتِ الْمُفْرَدِ وَالْجَمْعِ لِلْمُؤَنَّثِ وَالْمُذَكَّرِ: ‑iyy (Mann), ‑iyyūn (Männer), ‑iyya (Frau), ‑iyyāt (Frauen). Ausnahmen: أَلْمَان, مَغَارِبَة, إِنْجِلِيز.",
        },
        {
          id: "greeting",
          titleArabic: "٢) التَّحِيَّةُ وَالرَّدُّ",
          title: "Grüßen und antworten",
          columns: [
            { arabic: "الضَّمِيرُ", german: "Person" },
            { arabic: "التَّحِيَّةُ لِلرَّحِيلِ", german: "beim Gehen" },
            { arabic: "الرَّدُّ", german: "Antwort" },
            { arabic: "التَّحِيَّةُ لِلِاسْتِقْبَالِ", german: "beim Empfang" },
            { arabic: "الرَّدُّ", german: "Antwort" },
          ],
          rows: [
            [{ arabic: "مُذَكَّرٌ", listen: false }, { arabic: "مَعَ السَّلَامَةِ" }, { arabic: "مَعَ السَّلَامَةِ" }, { arabic: "أَهْلًا وَسَهْلًا" }, { arabic: "أَهْلًا بِكَ", gender: "m" }],
            [{ arabic: "مُؤَنَّثٌ", listen: false }, { arabic: "مَعَ السَّلَامَةِ" }, { arabic: "مَعَ السَّلَامَةِ" }, { arabic: "أَهْلًا وَسَهْلًا" }, { arabic: "أَهْلًا بِكِ", gender: "f" }],
            [{ arabic: "جَمْعٌ", listen: false }, { arabic: "مَعَ السَّلَامَةِ" }, { arabic: "مَعَ السَّلَامَةِ" }, { arabic: "أَهْلًا وَسَهْلًا" }, { arabic: "أَهْلًا بِكُمْ" }],
          ],
          note: "Im Buch steht in allen drei Zeilen „أَهْلًا بِك“; die Endung richtet sich nach der Person (Lektion 6). Zum Kennenlernen: أَنَا اسْمِي أَحْمَد / مَا اسْمُكَ؟ – Antwort: تَشَرَّفْنَا وَأَنَا اسْمِي …",
        },
        {
          id: "sorry",
          titleArabic: "تَذَكَّرْ",
          title: "Merke: sich entschuldigen",
          columns: [{ arabic: "الِاعْتِذَارُ", german: "Entschuldigung" }, { arabic: "الرَّدُّ", german: "Antwort" }],
          rows: [
            [{ arabic: "آسِف", german: "es tut mir leid (Mann)", gender: "m" }, { arabic: "لَا مُشْكِلَةَ", german: "kein Problem" }],
            [{ arabic: "آسِفَة", german: "es tut mir leid (Frau)", gender: "f" }, { arabic: "لَا مُشْكِلَةَ", german: "kein Problem" }],
            [{ arabic: "آسِفُون", german: "es tut uns leid" }, { arabic: "لَا مُشْكِلَةَ", german: "kein Problem" }],
          ],
        },
      ],
      quiz: [
        { id: "fs", prompt: "Eine Frau aus Frankreich ist …", options: ["فَرَنْسِيّ", "فَرَنْسِيَّة", "فَرَنْسِيَّات"], answer: 1 },
        { id: "mp", prompt: "Mehrere Männer aus Ägypten sind …", options: ["مِصْرِيُّون", "مِصْرِيَّات", "مِصْرِيّ"], answer: 0 },
        { id: "germans", prompt: "„Deutsche“ (Männer, Mehrzahl):", options: ["أَلْمَانِيُّون", "أَلْمَان", "أَلْمَانِيَّة"], answer: 1 },
        { id: "sorry-f", prompt: "Eine Frau entschuldigt sich:", options: ["آسِف", "آسِفَة", "آسِفُون"], answer: 1 },
      ],
    },
    {
      kind: "dialogue",
      mode: "roleplay",
      slug: "step-4",
      title: "Rollenspiel: Übung 1",
      navLabel: "Rollenspiel 1",
      instruction: { arabic: "تَدْرِيبٌ (١): كَرِّرْ حِوَارَ الْمُحَادَثَةِ فِي التَّقْدِيمِ السَّابِقِ مَعَ تَغْيِيرِ أَسْمَاءِ الْبِلَادِ وَالشَّخْصِيَّاتِ مَعَ زَمِيلِكَ.", german: "Übung 1: Wiederhole die Unterhaltung – du sprichst eine Rolle, Alif die andere.", note: "Im Buch sollst du dabei Länder und Namen ändern; andere Wörter kann die Bewertung nicht prüfen. Übe dafür Übung 5–7." },
      dialogue: mustafaYamahu,
    },
    { kind: "dialogue", mode: "listen", slug: "step-5", title: "Anhören 2: Im Flugzeug", navLabel: "Anhören 2", instruction: { arabic: "تَدْرِيبٌ (٢): اِقْرَأْ هَذَا الْحِوَارَ.", german: "Übung 2: Lies und hör die Unterhaltung.", note: "Nützliches Wort: فِي إِجَازَةٍ – im Urlaub." }, dialogue: planeDialogue },
    { kind: "dialogue", mode: "repeat", slug: "step-6", title: "Nachsprechen 2", navLabel: "Nachsprechen 2", instruction: { arabic: "كَرِّرِ الْحِوَارَ مَعَ زَمِيلِكَ.", german: "Sprich jede Zeile nach." }, dialogue: planeDialogue },
    {
      kind: "dialogue",
      mode: "roleplay",
      slug: "step-7",
      title: "Rollenspiel 2: Im Flugzeug",
      navLabel: "Rollenspiel 2",
      instruction: { arabic: "كَرِّرِ الْحِوَارَ مَرَّةً أُخْرَى مُسْتَخْدِمًا بِلَادًا وَأَسْمَاءً مُخْتَلِفَةً.", german: "Spiel eine Rolle – Alif spricht die andere.", note: "Mit anderen Ländern und Namen: dafür ist Übung 5 und 6 da." },
      dialogue: planeDialogue,
    },
    {
      kind: "cloze",
      slug: "step-8",
      title: "Übung 3: kurze Dialoge zu den Bildern",
      navLabel: "Übung 3",
      instruction: { arabic: "تَدْرِيبٌ (٣): ١ – اُكْتُبْ حِوَارًا قَصِيرًا تَحْتَ كُلِّ صُورَةٍ. ٢ – اِقْرَأِ الْحِوَارَ وَكَرِّرْهُ مَعَ زَمِيلِكَ.", german: "Übung 3: Schreib zu jedem Bild einen kurzen Dialog – das Buch gibt den Anfang vor.", note: "Wo mehrere Antworten passen, ist jede richtig. Teil 3 (Partner wechseln) braucht eine Klasse; hör dir hier jede richtige Zeile an. Übung 4 im Buch (Namen auf der CD heraushören) braucht die CD-Aufnahme, die das Buch nicht abdruckt." },
      items: PICTURE_DIALOGUES,
    },
    {
      kind: "cloze",
      slug: "step-9",
      title: "Übung 5: Sätze unter den Fahnen",
      navLabel: "Übung 5",
      instruction: { arabic: "تَدْرِيبٌ (٥): ١ – اُكْتُبْ تَحْتَ عَلَمِ كُلِّ دَوْلَةٍ جُمَلًا مِثْلَ الْمِثَالِ: أَنَا مِنْ مِصْرَ. أَنَا مِصْرِيٌّ.", german: "Übung 5: Schreib zu jeder Fahne zwei Sätze wie im Beispiel – achte darauf, wer die Fahne hält (ein Mann, eine Frau, mehrere).", note: "Für zwei Personen kennst du noch keine eigene Form: nimm die Mehrzahl. Teil 2 (frag deinen Partner: مِنْ أَيْنَ هُوَ / هِيَ؟) braucht einen Partner." },
      items: FLAG_ITEMS,
    },
    {
      kind: "cloze",
      slug: "step-10",
      title: "Übung 6: Wähle das Land",
      navLabel: "Übung 6",
      instruction: { arabic: "تَدْرِيبٌ (٦): أ – اِخْتَرْ بَلَدًا مِنْ بَيْنِ الْقَوْسَيْنِ وَأَجِبْ عَنِ الْأَسْئِلَةِ. ب – صَحِّحْ وَكَرِّرْ مَعَ زَمِيلِكَ.", german: "Übung 6: Wähle eins der beiden Länder und antworte mit dem Land und der Nationalität.", note: "Das Buch lässt die Wahl offen und gibt nur Nr. 1 vor (هُوَ مِنَ الْيُونَانِ، هُوَ يُونَانِيٌّ). Alif nimmt jeweils das Land, zu dem der Name passt; die Nationalität muss zur Person passen." },
      items: CHOOSE_ITEMS,
    },
    {
      kind: "cloze",
      slug: "step-11",
      title: "Übung 7: Talal und Aliya",
      navLabel: "Übung 7",
      instruction: { arabic: "تَدْرِيبٌ (٧): أَكْمِلِ الْحِوَارَ ثُمَّ كَرِّرْهُ مَعَ زَمِيلِكَ.", german: "Übung 7: Ergänze, was Aliya sagt – vor der Universität.", note: "Aliyas Land und ob sie im Urlaub oder zum Studium da ist, lässt das Buch offen: jede passende Antwort ist richtig. Übung 8 und „اسأل بعض الناس في معهدك“ brauchen deine Klasse." },
      items: TALAL,
    },
  ],
};

