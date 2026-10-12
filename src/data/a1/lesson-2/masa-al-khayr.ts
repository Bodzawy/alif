import type { A1Lesson, Dialogue, DialogueSpeaker } from "@/data/types";

import { lines } from "../sabah-al-khayr";

// "مَسَاءُ الْخَيْر" – the two conversations of Lektion 2 ("مساء الخير.pdf",
// page 40): two men (عَدْنَان، خَالِد) and two women (نَازِك، دِينَا), seven lines
// each, the women's lines with the feminine forms حَالُكِ، اسْمُكِ، أَنْتِ. Text,
// speakers, order and punctuation as in the book; the book writes the names
// without case ending (اسْمِي خَالِد). Then the book's grammar (لاحظ القواعد),
// the exercises of page 41 and "تذكر".
//
// Each conversation is ONE Dialogue object: listen, repeat and (exercise 1)
// role-play. Targets are the unvocalised text without punctuation, so the
// masculine and feminine lines share a target where only a vowel differs
// (كيف حالك، ما اسمك) – the evaluation does not check that last vowel.

const IMG = "/images/a1/masa-al-khayr";

const speaker = (id: string, name: string, voice: DialogueSpeaker["voice"], alt: string): DialogueSpeaker => ({ id, name, voice, avatar: { src: `${IMG}/${id}.svg`, alt } });

/** Conversation 1: two men. */
export const adnanKhalidDialogue: Dialogue = {
  id: "adnan-khalid",
  intro: "Zwei Männer begrüßen sich am Abend: Adnan und Khalid.",
  speakers: [
    speaker("adnan", "Adnan", "male-1", "Adnan, ein Mann mit weißem Gewand und rot-weißem Kopftuch"),
    speaker("khalid", "Khalid", "male-2", "Khalid, ein Mann mit Bart, weißem Gewand und weißem Kopftuch"),
  ],
  lines: lines([
    ["e-m-masa-al-khayr", "adnan", "مَسَاءُ الْخَيْرِ.", "مساء الخير", "Masāʾu l-khayri.", "Guten Abend!", "Abend des Guten"],
    ["e-m-masa-an-nur", "khalid", "مَسَاءُ النُّورِ.", "مساء النور", "Masāʾu n-nūri.", "Guten Abend!", "Abend des Lichts"],
    ["e-m-kayfa-haluka", "adnan", "كَيْفَ حَالُكَ؟", "كيف حالك", "Kayfa ḥāluka?", "Wie geht es dir?"],
    ["e-m-bi-khayr", "khalid", "بِخَيْرٍ، الْحَمْدُ لِلَّهِ.", "بخير الحمد لله", "Bi-khayrin, al-ḥamdu li-llāhi.", "Gut, Gott sei Dank."],
    ["e-m-ma-smuka", "adnan", "مَا اسْمُكَ؟", "ما اسمك", "Ma-smuka?", "Wie heißt du?"],
    ["e-m-ismi-khalid", "khalid", "اسْمِي خَالِد، وَأَنْتَ؟", "اسمي خالد وأنت", "Ismī Khālid, wa-anta?", "Ich heiße Khalid. Und du?"],
    ["e-m-ismi-adnan", "adnan", "اسْمِي عَدْنَان.", "اسمي عدنان", "Ismī ʿAdnān.", "Ich heiße Adnan."],
  ]),
  question: {
    prompt: "مَا اسْمُ الرَّجُلَيْنِ؟ – Wie heißen die beiden Männer?",
    options: ["Adnan und Khalid.", "Ahmad und Ali.", "Nazik und Dina."],
    answer: 0,
  },
};

/** Conversation 2: two women – the feminine forms. */
export const nazikDinaDialogue: Dialogue = {
  id: "nazik-dina",
  intro: "Zwei Frauen begrüßen sich am Abend: Nazik und Dina.",
  speakers: [
    speaker("nazik", "Nazik", "female-1", "Nazik, eine Frau mit Kopftuch und Umhängetasche"),
    speaker("dina", "Dina", "female-2", "Dina, eine Frau mit kurzen Haaren und Umhängetasche"),
  ],
  lines: lines([
    ["e-w-masa-al-khayr", "nazik", "مَسَاءُ الْخَيْرِ.", "مساء الخير", "Masāʾu l-khayri.", "Guten Abend!", "Abend des Guten"],
    ["e-w-masa-an-nur", "dina", "مَسَاءُ النُّورِ.", "مساء النور", "Masāʾu n-nūri.", "Guten Abend!", "Abend des Lichts"],
    ["e-w-kayfa-haluki", "nazik", "كَيْفَ حَالُكِ؟", "كيف حالك", "Kayfa ḥāluki?", "Wie geht es dir?"],
    ["e-w-bi-khayr", "dina", "بِخَيْرٍ، الْحَمْدُ لِلَّهِ.", "بخير الحمد لله", "Bi-khayrin, al-ḥamdu li-llāhi.", "Gut, Gott sei Dank."],
    ["e-w-ma-smuki", "nazik", "مَا اسْمُكِ؟", "ما اسمك", "Ma-smuki?", "Wie heißt du?"],
    ["e-w-ismi-dina", "dina", "اسْمِي دِينَا، وَأَنْتِ؟", "اسمي دينا وأنت", "Ismī Dīnā, wa-anti?", "Ich heiße Dina. Und du?"],
    ["e-w-ismi-nazik", "nazik", "اسْمِي نَازِك.", "اسمي نازك", "Ismī Nāzik.", "Ich heiße Nazik."],
  ]),
  question: {
    prompt: "مَا اسْمُ الْمَرْأَتَيْنِ؟ – Wie heißen die beiden Frauen?",
    options: ["Nazik und Dina.", "Nabila und Fatima.", "Adnan und Dina."],
    answer: 0,
  },
};

const REPEAT_AND_ANSWER = { arabic: "كَرِّرْ بَعْدَ الْمُدَرِّسِ ثُمَّ أَجِبْ.", german: "Hör zu, sprich nach – und beantworte dann die Frage." };
const EXERCISE_1 = {
  arabic: "١- كَرِّرِ الْمُحَادَثَةَ مَعَ زَمِيلِكَ / زَمِيلَتِكَ.",
  german: "Übung 1: Spiele die Unterhaltung mit deinem Lernpartner oder deiner Lernpartnerin nach.",
  note: "Hier spricht Alif die andere Rolle. Wähle, wer du bist – erst nach deiner richtig gesprochenen Zeile antwortet die andere Person.",
};

export const a1MasaAlKhayr: A1Lesson = {
  slug: "masa-al-khayr",
  kind: "phrase",
  label: "مَسَاءُ الْخَيْر",
  labelGerman: "Guten Abend",
  steps: [
    { kind: "dialogue", mode: "listen", slug: "step-1", title: "Anhören 1: Adnan & Khalid", navLabel: "Anhören 1", instruction: { arabic: `الْمُحَادَثَةُ الْأُولَى: ${REPEAT_AND_ANSWER.arabic}`, german: `Die erste Unterhaltung. ${REPEAT_AND_ANSWER.german}` }, dialogue: adnanKhalidDialogue },
    { kind: "dialogue", mode: "repeat", slug: "step-2", title: "Nachsprechen 1: Adnan & Khalid", navLabel: "Nachsprechen 1", instruction: { arabic: "الْمُحَادَثَةُ الْأُولَى: كَرِّرْ بَعْدَ الْمُدَرِّسِ.", german: "Sprich jede Zeile nach – so oft du willst, bis sie richtig ist." }, dialogue: adnanKhalidDialogue },
    { kind: "dialogue", mode: "listen", slug: "step-3", title: "Anhören 2: Nazik & Dina", navLabel: "Anhören 2", instruction: { arabic: `الْمُحَادَثَةُ الثَّانِيَةُ: ${REPEAT_AND_ANSWER.arabic}`, german: `Die zweite Unterhaltung. ${REPEAT_AND_ANSWER.german}` }, dialogue: nazikDinaDialogue },
    { kind: "dialogue", mode: "repeat", slug: "step-4", title: "Nachsprechen 2: Nazik & Dina", navLabel: "Nachsprechen 2", instruction: { arabic: "الْمُحَادَثَةُ الثَّانِيَةُ: كَرِّرْ بَعْدَ الْمُدَرِّسِ.", german: "Sprich jede Zeile nach – so oft du willst, bis sie richtig ist." }, dialogue: nazikDinaDialogue },
    {
      kind: "table",
      slug: "step-5",
      title: "Grammatik: Begrüßung am Abend, nach dem Namen fragen",
      navLabel: "Grammatik",
      instruction: { arabic: "لَاحِظِ الْقَوَاعِدَ", german: "Achte auf die Regeln: die Begrüßung am Abend und die Frage nach dem Namen – zu einem Mann und zu einer Frau." },
      tables: [
        {
          id: "evening",
          titleArabic: "١) لِلتَّحِيَّةِ فِي الْمَسَاءِ:",
          title: "Die Begrüßung am Abend",
          columns: [
            { arabic: "التَّحِيَّةُ", german: "Gruß" },
            { arabic: "الرَّدُّ", german: "Antwort" },
          ],
          rows: [[{ arabic: "مَسَاءُ الْخَيْرِ", german: "Guten Abend!", transliteration: "Masāʾu l-khayri" }, { arabic: "مَسَاءُ النُّورِ", german: "Guten Abend! (Abend des Lichts)", transliteration: "Masāʾu n-nūri" }]],
        },
        {
          id: "name",
          titleArabic: "٢) لِلسُّؤَالِ عَنِ الِاسْمِ",
          title: "Nach dem Namen fragen",
          columns: [
            { arabic: "الْمُفْرَدُ الْمُذَكَّرُ", german: "zu einem Mann" },
            { arabic: "الْمُفْرَدُ الْمُؤَنَّثُ", german: "zu einer Frau" },
          ],
          rows: [[{ arabic: "مَا اسْمُكَ؟", german: "Wie heißt du?", transliteration: "Ma-smuka?", gender: "m" }, { arabic: "مَا اسْمُكِ؟", german: "Wie heißt du?", transliteration: "Ma-smuki?", gender: "f" }]],
          note: "Nur der letzte Vokal ist anders: ‑ka (كَ) zu einem Mann, ‑ki (كِ) zu einer Frau. Die Aussprache-Bewertung prüft diesen letzten Vokal nicht – achte selbst darauf.",
        },
      ],
      quiz: [
        { id: "reply", prompt: "Jemand sagt am Abend zu dir: مَسَاءُ الْخَيْرِ. Was antwortest du?", options: ["مَسَاءُ النُّورِ", "صَبَاحُ النُّورِ", "اسْمِي …"], answer: 0 },
        { id: "ask-man", prompt: "Du fragst einen Mann nach seinem Namen:", options: ["مَا اسْمُكِ؟", "مَا اسْمُكَ؟"], answer: 1 },
        { id: "ask-woman", prompt: "Du fragst eine Frau nach ihrem Namen:", options: ["مَا اسْمُكِ؟", "مَا اسْمُكَ؟"], answer: 0 },
      ],
    },
    { kind: "dialogue", mode: "roleplay", slug: "step-6", title: "Rollenspiel 1: Übung 1 – Adnan & Khalid", navLabel: "Rollenspiel 1", instruction: EXERCISE_1, dialogue: adnanKhalidDialogue },
    { kind: "dialogue", mode: "roleplay", slug: "step-7", title: "Rollenspiel 2: Übung 1 – Nazik & Dina", navLabel: "Rollenspiel 2", instruction: EXERCISE_1, dialogue: nazikDinaDialogue },
    {
      kind: "letter-find",
      slug: "step-8",
      title: "Übung 2: Finde د / ذ",
      navLabel: "Übung 2",
      instruction: { arabic: "٢- ضَعْ خَطًّا تَحْتَ حَرْفِ (د / ذ) فِي الْحِوَارِ السَّابِقِ.", german: "Übung 2: Unterstreiche jedes د und ذ in den beiden Unterhaltungen." },
      find: { letter: "د / ذ", name: "Dal und Dhal", accepts: ["د", "ذ"], dialogue: adnanKhalidDialogue, more: [nazikDinaDialogue] },
    },
    {
      kind: "letter-find",
      slug: "step-9",
      title: "Übung 3: Finde و / ي",
      navLabel: "Übung 3",
      instruction: {
        arabic: "٣- ضَعْ خَطًّا تَحْتَ حَرْفِ الْوَاوِ وَالْيَاءِ. يُكَرِّرُ التَّمْرِينَ عَلَى بَاقِي الْحُرُوفِ.",
        german: "Übung 3: Unterstreiche jedes و und ي. Danach kannst du die Übung mit den anderen Buchstaben wiederholen.",
      },
      find: {
        letter: "و / ي",
        name: "Waw und Ya",
        accepts: ["و", "ي"],
        dialogue: adnanKhalidDialogue,
        more: [nazikDinaDialogue],
        extra: [
          { letter: "ا", name: "Alif", accepts: ["ا", "أ", "إ", "آ"] },
          { letter: "ب", name: "Ba", accepts: ["ب"] },
          { letter: "ت", name: "Ta", accepts: ["ت"] },
          { letter: "ث", name: "Tha", accepts: ["ث"] },
          { letter: "ج", name: "Dschim", accepts: ["ج"] },
          { letter: "ح", name: "Ha", accepts: ["ح"] },
          { letter: "خ", name: "Kha", accepts: ["خ"] },
        ],
      },
    },
    {
      kind: "word-pick",
      slug: "step-10",
      title: "Lange Vokale in den Unterhaltungen",
      navLabel: "Lange Vokale",
      instruction: {
        arabic: "يَسْأَلُ الْمُدَرِّسُ الطَّلَبَةَ عَنِ الْكَلِمَاتِ الَّتِي تَحْتَوِي عَلَى حُرُوفِ الْمَدِّ فِي الْحِوَارِ السَّابِقِ، وَعَنْ نَوْعِ حَرْفِ الْمَدِّ.",
        german: "Aus dem Lehrerhinweis: Finde die Wörter mit einem langen Vokal – und sag, welcher Buchstabe ihn lang macht.",
      },
      pick: { find: "madd", goal: "Unterstreiche alle Wörter mit einem Dehnungsbuchstaben (langes ā, ū oder ī).", dialogues: [adnanKhalidDialogue, nazikDinaDialogue] },
    },
    {
      kind: "table",
      slug: "step-11",
      title: "Merke: lang und kurz, Begrüßen, nach dem Namen fragen",
      navLabel: "Merke",
      instruction: { arabic: "تَذَكَّرْ", german: "Merke: das Wichtigste aus Lektion 1 und 2 auf einen Blick." },
      tables: [
        {
          id: "long-short",
          titleArabic: "١- الْفَرْقُ بَيْنَ الْحَرَكَاتِ الطَّوِيلَةِ وَالْقَصِيرَةِ",
          title: "Lange und kurze Vokale",
          columns: [
            { arabic: "الْحَرَكَاتُ الطَّوِيلَةُ – حُرُوفُ الْمَدِّ", german: "lange Vokale – Dehnungsbuchstaben" },
            { arabic: "الْحَرَكَاتُ الْقَصِيرَةُ – عَلَامَاتُ التَّشْكِيلِ", german: "kurze Vokale – Vokalzeichen" },
          ],
          rows: [
            [{ arabic: "بَا", german: "مَدٌّ بِالْأَلِفِ – langes ā", transliteration: "bā" }, { arabic: "بَ", german: "Fatha – kurzes a", transliteration: "ba" }],
            [{ arabic: "بُو", german: "مَدٌّ بِالْوَاوِ – langes ū", transliteration: "bū" }, { arabic: "بُ", german: "Damma – kurzes u", transliteration: "bu" }],
            [{ arabic: "بِي", german: "مَدٌّ بِالْيَاءِ – langes ī", transliteration: "bī" }, { arabic: "بِ", german: "Kasra – kurzes i", transliteration: "bi" }],
          ],
        },
        {
          id: "greeting",
          titleArabic: "٢- لِلتَّحِيَّةِ وَالتَّعَارُفِ:",
          title: "Begrüßen und kennenlernen",
          columns: [
            { arabic: "التَّحِيَّةُ", german: "Gruß / Frage" },
            { arabic: "الرَّدُّ", german: "Antwort" },
          ],
          rows: [
            [{ arabic: "صَبَاحُ الْخَيْرِ.", german: "Guten Morgen!" }, { arabic: "صَبَاحُ النُّورِ.", german: "Guten Morgen! (Morgen des Lichts)" }],
            [{ arabic: "مَسَاءُ الْخَيْرِ.", german: "Guten Abend!" }, { arabic: "مَسَاءُ النُّورِ.", german: "Guten Abend! (Abend des Lichts)" }],
            [{ arabic: "كَيْفَ حَالُكَ؟", german: "Wie geht es dir?", gender: "m" }, { arabic: "بِخَيْرٍ، الْحَمْدُ لِلَّهِ.", german: "Gut, Gott sei Dank." }],
            [{ arabic: "كَيْفَ حَالُكِ؟", german: "Wie geht es dir?", gender: "f" }, { arabic: "بِخَيْرٍ، الْحَمْدُ لِلَّهِ.", german: "Gut, Gott sei Dank." }],
          ],
        },
        {
          id: "ask-name",
          titleArabic: "٣- لِلسُّؤَالِ عَنِ الِاسْمِ:",
          title: "Nach dem Namen fragen",
          columns: [
            { arabic: "السُّؤَالُ", german: "Frage" },
            { arabic: "الْجَوَابُ", german: "Antwort" },
          ],
          rows: [
            [{ arabic: "مَا اسْمُكَ؟", german: "Wie heißt du? (مُذَكَّر)", gender: "m" }, { arabic: "اسْمِي …", german: "Ich heiße …", listen: false }],
            [{ arabic: "مَا اسْمُكِ؟", german: "Wie heißt du? (مُؤَنَّث)", gender: "f" }, { arabic: "اسْمِي …", german: "Ich heiße …", listen: false }],
          ],
        },
      ],
      quiz: [
        { id: "long", prompt: "Welche Silbe hat ein langes ū?", options: ["بُ", "بُو", "بِي"], answer: 1 },
        { id: "short", prompt: "Welche Silbe hat ein kurzes i?", options: ["بِي", "بَا", "بِ"], answer: 2 },
        { id: "morning", prompt: "Am Morgen grüßt man mit …", options: ["مَسَاءُ الْخَيْرِ", "صَبَاحُ الْخَيْرِ"], answer: 1 },
        { id: "woman", prompt: "„Wie geht es dir?“ zu einer Frau:", options: ["كَيْفَ حَالُكَ؟", "كَيْفَ حَالُكِ؟"], answer: 1 },
      ],
    },
  ],
};
