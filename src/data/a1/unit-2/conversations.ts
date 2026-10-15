import type { A1Lesson, ClozeItem, Dialogue, DialogueSpeaker, GapItem, MatchContent } from "@/data/types";

import { lines } from "../sabah-al-khayr";
import { dictationItem, gaps2 } from "../lesson-2/letter-entry";

// Unit 2 of the book ("وجدي.pdf"): the conversations, grammar and exercises.
//   تقديم (١) "هَلْ أَنْتَ وَجْدِي؟" (PDF 19–20, book 62–63): two conversations
//     with three speakers each, "لاحظ القواعد" (هَلْ + أَنْتَ / أَنْتِ), exercises 1–6.
//   مراجعة عامة (PDF 39, book 82): the general review, exercises 1–3.
//   تقديم (٢) "مَنْ أَنْتَ؟" (PDF 40–46, book 83–89): presentations (أ) and (ب),
//     "لاحظ القواعد" (مَنْ / مَا, personal pronouns), exercises 1–7 and "تذكر".
// Text, speakers and order as in the book; names without case endings as
// printed. The book names no-one who asks in تقديم (٢): he is "Der Fragende".

const IMG = "/images/a1/unit-2";
const sp = (id: string, name: string, voice: DialogueSpeaker["voice"], alt: string): DialogueSpeaker => ({ id, name, voice, avatar: { src: `${IMG}/${id}.svg`, alt } });

// ---------------------------------------------------------------------------
// تقديم (١)

export const wajdiDialogue: Dialogue = {
  id: "shadi-wajdi",
  intro: "Schadi sucht Wagdi. Er fragt zuerst Walid, dann Wagdi.",
  speakers: [
    sp("shadi", "Schadi", "male-1", "Schadi, ein Mann mit dunkler Jacke"),
    sp("walid", "Walid", "male-2", "Walid, ein junger Mann mit Hemd"),
    sp("wajdi", "Wagdi", "male-2", "Wagdi, ein Mann mit kariertem Hemd und Mantel"),
  ],
  lines: lines([
    ["u2-1-shadi-1", "shadi", "هَلْ أَنْتَ وَجْدِي؟", "هل أنت وجدي", "Hal anta Wajdī?", "Bist du Wagdi?"],
    ["u2-1-walid", "walid", "لَا. أَنَا وَلِيد.", "لا أنا وليد", "Lā. Ana Walīd.", "Nein. Ich bin Walid."],
    ["u2-1-shadi-2", "shadi", "هَلْ أَنْتَ وَجْدِي؟", "هل أنت وجدي", "Hal anta Wajdī?", "Bist du Wagdi?"],
    ["u2-1-wajdi", "wajdi", "نَعَمْ. أَنَا وَجْدِي.", "نعم أنا وجدي", "Naʿam. Ana Wajdī.", "Ja. Ich bin Wagdi."],
  ]),
  question: { prompt: "مَنْ فِي الصُّورَةِ؟ – Wer ist auf dem Bild (zwei Männer begrüßen sich)?", options: ["Schadi und Wagdi.", "Schadi und Walid.", "Walid und Wagdi."], answer: 0 },
};

export const suziDialogue: Dialogue = {
  id: "teriz-suzi",
  intro: "Teresa sucht Susi. Sie fragt zuerst Esther, dann Susi.",
  speakers: [
    sp("teriz", "Teresa", "female-1", "Teresa, eine Frau mit Locken und Brille"),
    sp("ester", "Esther", "female-2", "Esther, eine junge Frau mit langen Haaren"),
    sp("suzi", "Susi", "female-2", "Susi, eine Frau mit dunklen Haaren"),
  ],
  lines: lines([
    ["u2-2-teriz-1", "teriz", "هَلْ أَنْتِ سُوزِي؟", "هل أنت سوزي", "Hal anti Sūzī?", "Bist du Susi?"],
    ["u2-2-ester", "ester", "لَا. أَنَا إِسْتَر.", "لا أنا إستر", "Lā. Ana Ister.", "Nein. Ich bin Esther."],
    ["u2-2-teriz-2", "teriz", "هَلْ أَنْتِ سُوزِي؟", "هل أنت سوزي", "Hal anti Sūzī?", "Bist du Susi?"],
    ["u2-2-suzi", "suzi", "نَعَمْ. أَنَا سُوزِي.", "نعم أنا سوزي", "Naʿam. Ana Sūzī.", "Ja. Ich bin Susi."],
  ]),
  question: { prompt: "مَنْ فِي الصُّورَةِ؟ – Wer ist auf dem Bild (zwei Frauen begrüßen sich)?", options: ["Teresa und Susi.", "Teresa und Esther.", "Esther und Susi."], answer: 0 },
};

/** تدريب ٣: the names; the first and the last letter (as written). */
const NAMES: Array<[arabic: string, german: string, first: string, last: string, distractors: string[]]> = [
  ["يَحْيَى", "Yahya", "ي", "ى", ["ب", "ا"]],
  ["جِرْجِس", "Girgis", "ج", "س", ["ح", "ش"]],
  ["حَبِيب", "Habib", "ح", "ب", ["ج", "ت"]],
  ["سِيزَا", "Siza", "س", "ا", ["ش", "ز"]],
  ["جُورْج", "George", "ج", "ج", ["خ", "ر"]],
  ["سَيِّد", "Sayyid", "س", "د", ["ص", "ذ"]],
  ["صَابِر", "Sabir", "ص", "ر", ["س", "ز"]],
  ["رَابِح", "Rabih", "ر", "ح", ["ز", "خ"]],
  ["آسِر", "Asir", "آ", "ر", ["أ", "ز"]],
  ["صُبْحِي", "Subhi", "ص", "ي", ["ض", "ب"]],
  ["سَارَة", "Sara", "س", "ة", ["ش", "ر"]],
];
const sorted = (letters: string[]) => [...new Set(letters)].sort((a, b) => a.localeCompare(b, "ar"));

/** تدريب ٤: the book's letters (in its order) and the name they make. */
const ARRANGE: Array<[letters: string[], spoken: string, german: string]> = [
  [["ب", "ح", "ي", "ب"], "حَبِيب", "Habib"],
  [["س", "ج", "ر", "ج"], "جِرْجِس", "Girgis"],
  [["ا", "س", "ي", "ز"], "سِيزَا", "Siza"],
  [["ر", "ص", "ب", "ا"], "صَابِر", "Sabir"],
  [["ي", "ص", "ح", "ب"], "صُبْحِي", "Subhi"],
  [["ا", "د", "و", "د"], "دَاوُد", "Dawud"],
  [["ة", "س", "ر", "ا"], "سَارَة", "Sara"],
  [["ر", "آ", "س"], "آسِر", "Asir"],
];
const arrangeItem = ([letters, spoken, german]: (typeof ARRANGE)[number], n: number): GapItem => {
  const word = spoken.replace(/[ً-ْ]/g, "");
  return { id: `arrange-name-${n + 1}`, arabic: word, spoken, german, pattern: "_".repeat(Array.from(word).length), bare: true, choices: [...new Set(letters)] };
};

export const a1Wajdi: A1Lesson = {
  slug: "hal-anta-wajdi",
  kind: "phrase",
  label: "هَلْ أَنْتَ وَجْدِي؟",
  labelGerman: "Bist du Wagdi?",
  steps: [
    { kind: "dialogue", mode: "listen", slug: "step-1", title: "Anhören 1: Schadi, Walid, Wagdi", navLabel: "Anhören 1", instruction: { arabic: "اِسْمَعِ الْحِوَارَ وَأَجِبْ: مَنْ فِي الصُّورَةِ؟ · حِوَار (١)", german: "Hör die Unterhaltung und antworte: Wer ist auf dem Bild?" }, dialogue: wajdiDialogue },
    { kind: "dialogue", mode: "repeat", slug: "step-2", title: "Nachsprechen 1", navLabel: "Nachsprechen 1", instruction: { arabic: "حِوَار (١)", german: "Sprich jede Zeile nach – so oft du willst, bis sie richtig ist." }, dialogue: wajdiDialogue },
    { kind: "dialogue", mode: "listen", slug: "step-3", title: "Anhören 2: Teresa, Esther, Susi", navLabel: "Anhören 2", instruction: { arabic: "اِسْمَعِ الْحِوَارَ وَأَجِبْ: مَنْ فِي الصُّورَةِ؟ · حِوَار (٢)", german: "Hör die Unterhaltung und antworte: Wer ist auf dem Bild?" }, dialogue: suziDialogue },
    { kind: "dialogue", mode: "repeat", slug: "step-4", title: "Nachsprechen 2", navLabel: "Nachsprechen 2", instruction: { arabic: "حِوَار (٢)", german: "Sprich jede Zeile nach – so oft du willst, bis sie richtig ist." }, dialogue: suziDialogue },
    {
      kind: "table",
      slug: "step-5",
      title: "Grammatik: nach Personen fragen (هَلْ)",
      navLabel: "Grammatik",
      instruction: { arabic: "لَاحِظِ الْقَوَاعِدَ: لِلسُّؤَالِ عَنِ الْأَشْخَاصِ", german: "Achte auf die Regeln: So fragst du, ob jemand eine bestimmte Person ist – zu einem Mann und zu einer Frau." },
      tables: [
        {
          id: "hal",
          titleArabic: "لِلسُّؤَالِ عَنِ الْأَشْخَاصِ:",
          title: "Nach Personen fragen",
          columns: [
            { arabic: "السُّؤَالُ", german: "Frage" },
            { arabic: "الْإِجَابَةُ بِنَعَمْ", german: "Antwort mit Ja" },
            { arabic: "الْإِجَابَةُ بِالنَّفْيِ", german: "Antwort mit Nein" },
          ],
          rows: [
            [{ arabic: "هَلْ أَنْتَ صَابِر؟", german: "Bist du Sabir?", gender: "m" }, { arabic: "نَعَمْ، أَنَا صَابِر.", german: "Ja, ich bin Sabir." }, { arabic: "لَا، أَنَا وَجْدِي.", german: "Nein, ich bin Wagdi." }],
            [{ arabic: "هَلْ أَنْتِ سُوزِي؟", german: "Bist du Susi?", gender: "f" }, { arabic: "نَعَمْ، أَنَا سُوزِي.", german: "Ja, ich bin Susi." }, { arabic: "لَا، أَنَا إِسْتَر.", german: "Nein, ich bin Esther." }],
          ],
          note: "هَلْ macht aus einem Satz eine Ja-/Nein-Frage. أَنْتَ (anta) fragt einen Mann, أَنْتِ (anti) eine Frau. Die Aussprache-Bewertung prüft diesen letzten Vokal nicht – achte selbst darauf.",
        },
      ],
      quiz: [
        { id: "man", prompt: "Du fragst einen Mann, ob er Sabir ist:", options: ["هَلْ أَنْتَ صَابِر؟", "هَلْ أَنْتِ صَابِر؟"], answer: 0 },
        { id: "woman", prompt: "Du fragst eine Frau, ob sie Susi ist:", options: ["هَلْ أَنْتَ سُوزِي؟", "هَلْ أَنْتِ سُوزِي؟"], answer: 1 },
        { id: "no", prompt: "„Bist du Wagdi?“ – Du bist aber Walid. Du sagst:", options: ["نَعَمْ، أَنَا وَجْدِي.", "لَا، أَنَا وَلِيد."], answer: 1 },
      ],
    },
    {
      kind: "dialogue",
      mode: "roleplay",
      slug: "step-6",
      title: "Rollenspiel 1: Übung 1 – Schadi, Walid, Wagdi",
      navLabel: "Rollenspiel 1",
      instruction: {
        arabic: "تَدْرِيبٌ (١): اِقْرَأْ كُلَّ حِوَارٍ مَعَ زَمِيلِكَ وَكَرِّرْهُ.",
        german: "Übung 1: Lies jede Unterhaltung mit deinem Lernpartner und wiederhole sie. Hier spricht Alif die anderen Rollen.",
        note: "Übung 2 im Buch („mit echten Namen“) und Übung 6 brauchen eine Klasse: deinen eigenen Namen kann die Bewertung nicht kennen. Übe dafür die Rollenspiele mit verschiedenen Rollen.",
      },
      dialogue: wajdiDialogue,
    },
    { kind: "dialogue", mode: "roleplay", slug: "step-7", title: "Rollenspiel 2: Übung 1 – Teresa, Esther, Susi", navLabel: "Rollenspiel 2", instruction: { arabic: "تَدْرِيبٌ (١): اِقْرَأْ كُلَّ حِوَارٍ مَعَ زَمِيلِكَ وَكَرِّرْهُ.", german: "Übung 1: die zweite Unterhaltung. Alif spricht die anderen Rollen." }, dialogue: suziDialogue },
    {
      kind: "quiz",
      slug: "step-8",
      title: "Übung 3: erster und letzter Buchstabe",
      navLabel: "Übung 3",
      instruction: { arabic: "تَدْرِيبٌ (٣): اِسْمَعِ الْمُدَرِّسَ وَعَيِّنِ الْحَرْفَ الْأَوَّلَ وَالْأَخِيرَ مِنْ كُلِّ اسْمٍ مِنَ الْأَسْمَاءِ التَّالِيَةِ.", german: "Übung 3: Hör jeden Namen und bestimme seinen ersten und seinen letzten Buchstaben." },
      items: NAMES.map(([arabic, german, first, last, distractors], n) => ({
        id: `name-${n + 1}`,
        arabic,
        german,
        questions: [
          { prompt: "Erster Buchstabe:", options: sorted([first, last, ...distractors]), answer: sorted([first, last, ...distractors]).indexOf(first) },
          { prompt: "Letzter Buchstabe:", options: sorted([first, last, ...distractors]), answer: sorted([first, last, ...distractors]).indexOf(last) },
        ],
      })),
    },
    {
      kind: "gaps",
      slug: "step-9",
      title: "Übung 4: Namen bilden",
      navLabel: "Übung 4",
      instruction: { arabic: "تَدْرِيبٌ (٤): كَوِّنْ أَسْمَاءً مِنَ الْحُرُوفِ التَّالِيَةِ. صَحِّحِ الْأَسْمَاءَ مِنَ التَّدْرِيبِ السَّابِقِ.", german: "Übung 4: Bilde Namen aus den Buchstaben – leg sie von rechts nach links in die Felder.", note: "Übung 5 im Buch ist ein Klassenspiel in zwei Teams („bildet weitere arabische Namen“) – dafür braucht es eine Klasse." },
      gaps: gaps2("picture", ["ب", "ح", "ي"], ARRANGE.map(arrangeItem), { clip: "shared/arrange_intro", text: "Ordne die Buchstaben: Leg sie von rechts nach links in die Felder, so dass ein Name entsteht." }),
    },
  ],
};

// ---------------------------------------------------------------------------
// مراجعة عامة

const sOrSad = (word: string, pattern: string, german: string, id: string, family: [string, string]) => {
  const item = dictationItem(id, pattern, word, german);
  const tiles = (["َ", "ِ", "ُ", "ْ"] as const).flatMap((mark) => family.map((l) => l + mark));
  return { ...item, gapChoices: item.gapChoices!.map((own) => [...new Set([...tiles, ...own.filter((t) => family.some((l) => t.startsWith(l)))])]) };
};

const REVIEW_MATCH: MatchContent = {
  promptTitle: "صِلِ الْحُرُوفَ لِتُكَوِّنَ كَلِمَةً",
  optionTitle: "صِلْ بِالْكَلِمَةِ الصَّحِيحَةِ",
  prompts: [
    { id: "maktab", arabic: "م – ك – ت – ب", answer: "maktab", example: true, result: { arabic: "مَكْتَب", german: "Schreibtisch" } },
    { id: "nujum", arabic: "ن – ج – و – م", answer: "nujum", result: { arabic: "نُجُوم", german: "Sterne" } },
    { id: "risala", arabic: "ر – س – ا – ل – ة", answer: "risala", result: { arabic: "رِسَالَة", german: "Brief" } },
    { id: "taj", arabic: "ت – ا – ج", answer: "taj", result: { arabic: "تَاج", german: "Krone" } },
    { id: "kas", arabic: "ك – أ – س", answer: "kas", result: { arabic: "كَأْس", german: "Glas" } },
    { id: "laymun", arabic: "ل – ي – م – و – ن", answer: "laymun", result: { arabic: "لَيْمُون", german: "Zitronen" } },
    { id: "antuma", arabic: "أ – ن – ت – م – ا", answer: "antuma", result: { arabic: "أَنْتُمَا", german: "ihr beide" } },
  ],
  // The book's right-hand column, top to bottom.
  options: [
    { id: "risala", label: "رِسَالَة", arabic: "رِسَالَة" },
    { id: "taj", label: "تَاج", arabic: "تَاج" },
    { id: "nujum", label: "نُجُوم", arabic: "نُجُوم" },
    { id: "antuma", label: "أَنْتُمَا", arabic: "أَنْتُمَا" },
    { id: "laymun", label: "لَيْمُون", arabic: "لَيْمُون" },
    { id: "kas", label: "كَأْس", arabic: "كَأْس" },
    { id: "maktab", label: "مَكْتَب", arabic: "مَكْتَب" },
  ],
};

export const a1Review2: A1Lesson = {
  slug: "muraja-amma",
  kind: "review",
  label: "مُرَاجَعَةٌ عَامَّة",
  labelGerman: "Allgemeine Wiederholung",
  steps: [
    { kind: "match", slug: "step-1", title: "Übung 1: Buchstaben verbinden", navLabel: "Übung 1", instruction: { arabic: "مُرَاجَعَةٌ عَامَّةٌ عَلَى الْحُرُوفِ الَّتِي سَبَقَ دِرَاسَتُهَا · تَدْرِيبٌ (١)", german: "Übung 1: Verbinde die Buchstaben zu einem Wort und ordne es dem richtigen Wort zu – wie im Beispiel م – ك – ت – ب = مَكْتَب." }, match: REVIEW_MATCH },
    {
      kind: "gaps",
      slug: "step-2",
      title: "Übung 2: Hören – س oder ص",
      navLabel: "Übung 2",
      instruction: { arabic: "تَدْرِيبٌ (٢): اِسْمَعْ مِنَ الْمُدَرِّسِ وَاكْتُبْ (سَ أَوْ صَ).", german: "Übung 2: Hör zu und schreib س oder ص – mit dem Vokalzeichen, das du hörst.", note: "Die Lösungswörter stehen im Buch unter „حَلُّ تَدْرِيبِ (٢)“." },
      gaps: gaps2(
        "listen",
        ["سَ", "صَ"],
        (
          [
            ["_مَك", "سَمَك", "Fische"],
            ["_بَاح", "صَبَاح", "Morgen"],
            ["قَمِي_", "قَمِيصْ", "Hemd"],
            ["_ينِيَّة", "صِينِيَّة", "Tablett"],
            ["عُ_فُور", "عُصْفُور", "Spatz"],
            ["ا_مَك", "اسْمَك", "dein Name"],
            ["_بُّورَة", "سُبُّورَة", "Tafel"],
            ["_وَر", "صُوَر", "Bilder"],
            ["_نْدُوق", "صُنْدُوق", "Kiste"],
            ["_تَارَة", "سِتَارَة", "Vorhang"],
          ] as Array<[string, string, string]>
        ).map(([pattern, word, german], n) => sOrSad(word, pattern, german, `s-${n + 1}`, ["س", "ص"]))
      ),
    },
    {
      kind: "gaps",
      slug: "step-3",
      title: "Übung 3: Hören – د oder ض",
      navLabel: "Übung 3",
      instruction: { arabic: "تَدْرِيبٌ (٣): اِسْمَعْ مِنَ الْمُدَرِّسِ وَاكْتُبْ (دَ أَوْ ضَ).", german: "Übung 3: Hör zu und schreib د oder ض – mit dem Vokalzeichen, das du hörst.", note: "Die Lösungswörter stehen im Buch unter „حَلُّ تَدْرِيبِ (٣)“." },
      gaps: gaps2(
        "listen",
        ["دَ", "ضَ"],
        (
          [
            ["_ولَاب", "دُولَاب", "Schrank"],
            ["_يْف", "ضَيْف", "Gast"],
            ["_وَاء", "دَوَاء", "Medizin"],
            ["_بَّاط", "ضُبَّاط", "Offiziere"],
            ["_يك", "دِيك", "Hahn"],
            ["_يُوف", "ضُيُوف", "Gäste"],
            ["_لْع", "ضِلْع", "Rippe"],
            ["حَ_ي_", "حَدِيدْ", "Eisen"],
            ["مَ_رَسَة", "مَدْرَسَة", "Schule"],
            ["_رْس", "ضِرْس", "Backenzahn"],
          ] as Array<[string, string, string]>
        ).map(([pattern, word, german], n) => sOrSad(word, pattern, german, `d-${n + 1}`, ["د", "ض"]))
      ),
    },
  ],
};

// ---------------------------------------------------------------------------
// تقديم (٢) "مَنْ أَنْتَ؟"

const ASKER = sp("asker", "Der Fragende", "male-1", "Ein junger Mann mit Locken und dunkler Jacke");
const groupSpeakers: DialogueSpeaker[] = [
  sp("naji", "Nagi", "male-2", "Nagi, ein junger Mann"),
  sp("nirmin", "Nirmin", "female-1", "Nirmin, eine junge Frau"),
  sp("nasim-nushi", "Nasim und Nushi", "male-2", "Zwei junge Männer"),
  sp("nivin-shirin", "Nivin und Schirin", "female-2", "Zwei junge Frauen, eine mit Kopftuch"),
  sp("nadi-husni-nasir", "Nadi, Husni und Nasir", "male-2", "Drei junge Männer"),
  sp("nisma-nura-nisrin", "Nisma, Nura und Nisrin", "female-1", "Drei junge Frauen"),
];
const ANSWERS: Array<[id: string, arabic: string, target: string, translit: string, german: string]> = [
  ["naji", "أَنَا نَاجِي.", "أنا ناجي", "Ana Nājī.", "Ich bin Nagi."],
  ["nirmin", "أَنَا نِرْمِين.", "أنا نرمين", "Ana Nirmīn.", "Ich bin Nirmin."],
  ["nasim-nushi", "نَحْنُ نَسِيم وَنُصْحِي.", "نحن نسيم ونصحي", "Naḥnu Nasīm wa-Nuṣḥī.", "Wir sind Nasim und Nushi."],
  ["nivin-shirin", "نَحْنُ نِيفِين وَشِيرِين.", "نحن نيفين وشيرين", "Naḥnu Nīfīn wa-Shīrīn.", "Wir sind Nivin und Schirin."],
  ["nadi-husni-nasir", "نَحْنُ نَادِي وَحُسْنِي وَنَاصِر.", "نحن نادي وحسني وناصر", "Naḥnu Nādī wa-Ḥusnī wa-Nāṣir.", "Wir sind Nadi, Husni und Nasir."],
  ["nisma-nura-nisrin", "نَحْنُ نِسْمَة وَنُورَا وَنِسْرِين.", "نحن نسمة ونورا ونسرين", "Naḥnu Nisma wa-Nūrā wa-Nisrīn.", "Wir sind Nisma, Nura und Nisrin."],
];
/** The questions of (أ) and (ب), by the person(s) asked. */
const QUESTIONS: Array<[a: string, aTarget: string, aTranslit: string, aGerman: string, b: string, bTarget: string, bTranslit: string, bGerman: string]> = [
  ["مَنْ أَنْتَ؟", "من أنت", "Man anta?", "Wer bist du? (zu einem Mann)", "مَنْ أَنْتَ؟ مَا اسْمُكَ؟", "من أنت ما اسمك", "Man anta? Ma-smuka?", "Wer bist du? Wie heißt du? (zu einem Mann)"],
  ["مَنْ أَنْتِ؟", "من أنت", "Man anti?", "Wer bist du? (zu einer Frau)", "مَنْ أَنْتِ؟ مَا اسْمُكِ؟", "من أنت ما اسمك", "Man anti? Ma-smuki?", "Wer bist du? Wie heißt du? (zu einer Frau)"],
  ["مَنْ أَنْتُمَا؟", "من أنتما", "Man antumā?", "Wer seid ihr beide? (zu zwei Männern)", "مَنْ أَنْتُمَا؟ مَا اسْمَاكُمَا؟", "من أنتما ما اسماكما", "Man antumā? Ma-smākumā?", "Wer seid ihr beide? Wie heißt ihr? (zu zwei Männern)"],
  ["مَنْ أَنْتُمَا؟", "من أنتما", "Man antumā?", "Wer seid ihr beide? (zu zwei Frauen)", "مَنْ أَنْتُمَا؟ مَا اسْمَاكُمَا؟", "من أنتما ما اسماكما", "Man antumā? Ma-smākumā?", "Wer seid ihr beide? Wie heißt ihr? (zu zwei Frauen)"],
  ["مَنْ أَنْتُمْ؟", "من أنتم", "Man antum?", "Wer seid ihr? (zu mehreren Männern)", "مَنْ أَنْتُمْ؟ مَا أَسْمَاؤُكُمْ؟", "من أنتم ما أسماؤكم", "Man antum? Mā asmāʾukum?", "Wer seid ihr? Wie heißt ihr? (zu mehreren Männern)"],
  ["مَنْ أَنْتُنَّ؟", "من أنتن", "Man antunna?", "Wer seid ihr? (zu mehreren Frauen)", "مَنْ أَنْتُنَّ؟ مَا أَسْمَاؤُكُنَّ؟", "من أنتن ما أسماؤكن", "Man antunna? Mā asmāʾukunna?", "Wer seid ihr? Wie heißt ihr? (zu mehreren Frauen)"],
];

const presentation = (variant: "a" | "b"): Dialogue => ({
  id: `man-anta-${variant}`,
  intro: variant === "a" ? "Ein junger Mann fragt einen Mann, eine Frau, zwei Männer, zwei Frauen, drei Männer und drei Frauen: Wer bist du / seid ihr?" : "Dieselben Begegnungen – jetzt fragt er auch nach dem Namen.",
  speakers: [ASKER, ...groupSpeakers] as Dialogue["speakers"],
  roles: [
    { id: "asker", name: "Der Fragende", speakers: ["asker"], avatar: ASKER.avatar },
    { id: "answers", name: "Die Antwortenden", speakers: groupSpeakers.map((s) => s.id), avatar: { src: `${IMG}/answers.svg`, alt: "Mehrere junge Leute" } },
  ],
  lines: lines(
    QUESTIONS.flatMap(([a, aT, aTr, aG, b, bT, bTr, bG], n) => {
      const [who, answer, target, translit, german] = ANSWERS[n]!;
      return [
        variant === "a" ? [`man-${variant}-q${n + 1}`, "asker", a, aT, aTr, aG] : [`man-${variant}-q${n + 1}`, "asker", b, bT, bTr, bG],
        [`man-${variant}-a${n + 1}`, who, answer, target, translit, german],
      ] as Array<[string, string, string, string, string, string]>;
    })
  ),
  question:
    variant === "a"
      ? { prompt: "Wie fragt er drei Frauen?", options: ["مَنْ أَنْتُمْ؟", "مَنْ أَنْتُنَّ؟", "مَنْ أَنْتُمَا؟"], answer: 1 }
      : { prompt: "Wie fragt er zwei Männer nach ihren Namen?", options: ["مَا اسْمُكَ؟", "مَا اسْمَاكُمَا؟", "مَا أَسْمَاؤُكُمْ؟"], answer: 1 },
});

export const manAntaA = presentation("a");
export const manAntaB = presentation("b");

const COLS = [
  { arabic: "مُفْرَدٌ مُذَكَّرٌ", german: "ein Mann" },
  { arabic: "مُفْرَدٌ مُؤَنَّثٌ", german: "eine Frau" },
  { arabic: "مُثَنًّى مُذَكَّرٌ", german: "zwei Männer" },
  { arabic: "مُثَنًّى مُؤَنَّثٌ", german: "zwei Frauen" },
  { arabic: "جَمْعٌ مُذَكَّرٌ", german: "mehrere Männer" },
  { arabic: "جَمْعٌ مُؤَنَّثٌ", german: "mehrere Frauen" },
];
const SECOND = ["أَنْتَ", "أَنْتِ", "أَنْتُمَا", "أَنْتُمَا", "أَنْتُمْ", "أَنْتُنَّ"];
const FIRST = ["أَنَا", "أَنَا", "نَحْنُ", "نَحْنُ", "نَحْنُ", "نَحْنُ"];
const NAME_Q = ["مَا اسْمُكَ؟", "مَا اسْمُكِ؟", "مَا اسْمَاكُمَا؟", "مَا اسْمَاكُمَا؟", "مَا أَسْمَاؤُكُمْ؟", "مَا أَسْمَاؤُكُنَّ؟"];
const NAME_A = ["اسْمِي", "اسْمِي", "اسْمَانَا", "اسْمَانَا", "أَسْمَاؤُنَا", "أَسْمَاؤُنَا"];
const SECOND_DE = ["du (Mann)", "du (Frau)", "ihr beide", "ihr beide", "ihr (Männer)", "ihr (Frauen)"];
const gender = (i: number) => (i % 2 === 0 ? "m" : "f") as "m" | "f";

const PRONOUN_MATCH: MatchContent = {
  promptTitle: "الضَّمِيرُ",
  optionTitle: "السُّؤَالُ",
  prompts: [
    { id: "anta", arabic: "أَنْتَ", answer: "q-ka" },
    { id: "anti", arabic: "أَنْتِ", answer: "q-ki" },
    { id: "antuma-1", arabic: "أَنْتُمَا", answer: "q-kuma-1", accept: ["q-kuma-2"] },
    { id: "antuma-2", arabic: "أَنْتُمَا", answer: "q-kuma-2", accept: ["q-kuma-1"] },
    { id: "antum", arabic: "أَنْتُمْ", answer: "q-kum" },
    { id: "antunna", arabic: "أَنْتُنَّ", answer: "q-kunna" },
  ],
  // The book's right-hand column, top to bottom.
  options: [
    { id: "q-kuma-1", label: "مَا اسْمَاكُمَا؟", arabic: "مَا اسْمَاكُمَا؟" },
    { id: "q-kunna", label: "مَا أَسْمَاؤُكُنَّ؟", arabic: "مَا أَسْمَاؤُكُنَّ؟" },
    { id: "q-kuma-2", label: "مَا اسْمَاكُمَا؟", arabic: "مَا اسْمَاكُمَا؟" },
    { id: "q-ka", label: "مَا اسْمُكَ؟", arabic: "مَا اسْمُكَ؟" },
    { id: "q-ki", label: "مَا اسْمُكِ؟", arabic: "مَا اسْمُكِ؟" },
    { id: "q-kum", label: "مَا أَسْمَاؤُكُمْ؟", arabic: "مَا أَسْمَاؤُكُمْ؟" },
  ],
};

const ANSWER_MATCH: MatchContent = {
  promptTitle: "الضَّمِيرُ",
  optionTitle: "الْإِجَابَةُ",
  prompts: [
    { id: "ana", arabic: "أَنَا", answer: "ismi" },
    { id: "nahnu", arabic: "نَحْنُ", answer: "asmauna" },
  ],
  options: [
    { id: "asmauna", label: "أَسْمَاؤُنَا", arabic: "أَسْمَاؤُنَا" },
    { id: "ismi", label: "اسْمِي", arabic: "اسْمِي" },
  ],
};

const Q_OPTIONS = ["مَا اسْمُكَ؟", "مَا اسْمُكِ؟", "مَا اسْمَاكُمَا؟", "مَا أَسْمَاؤُكُمْ؟", "مَا أَسْمَاؤُكُنَّ؟"];
const gap = (accept: string[], options: string[]) => ({ accept, options });

/** تدريب ٤: the missing question (and the missing word of the answer). */
const MISSING_QUESTIONS: ClozeItem[] = [
  { id: "q1", lines: [{ label: "أ", parts: [gap(["مَا اسْمُكِ؟"], Q_OPTIONS)] }, { label: "ب", parts: ["اسْمِي نَادِيَة."] }] },
  { id: "q2", lines: [{ label: "أ", parts: [gap(["مَا اسْمَاكُمَا؟"], Q_OPTIONS)] }, { label: "ب", parts: ["اسْمَانَا رَابِحَة وَنَاهِد."] }] },
  { id: "q3", lines: [{ label: "أ", parts: [gap(["مَا اسْمُكَ؟"], Q_OPTIONS)] }, { label: "ب", parts: [gap(["اسْمِي"], ["اسْمِي", "اسْمَانَا", "أَسْمَاؤُنَا"]), " عَبْدُ اللهِ."] }] },
  { id: "q4", lines: [{ label: "أ", parts: [gap(["مَا أَسْمَاؤُكُمْ؟"], Q_OPTIONS)] }, { label: "ب", parts: [gap(["أَسْمَاؤُنَا"], ["اسْمِي", "اسْمَانَا", "أَسْمَاؤُنَا"]), " نَاجِي وَرَمْزِي وَحُسَيْن."] }] },
  { id: "q5", lines: [{ label: "أ", parts: [gap(["مَا اسْمَاكُمَا؟"], Q_OPTIONS)] }, { label: "ب", parts: [gap(["اسْمَانَا"], ["اسْمِي", "اسْمَانَا", "أَسْمَاؤُنَا"]), " مُصْطَفَى وَطَلَال."] }] },
  { id: "q6", lines: [{ label: "أ", parts: [gap(["مَا أَسْمَاؤُكُنَّ؟"], Q_OPTIONS)] }, { label: "ب", parts: [gap(["أَسْمَاؤُنَا"], ["اسْمِي", "اسْمَانَا", "أَسْمَاؤُنَا"]), " نَادِين وَفَاطِمَة وَزَيْنَب."] }] },
];

const WHO = ["مَنْ أَنْتَ؟", "مَنْ أَنْتِ؟", "مَنْ أَنْتُمَا؟", "مَنْ أَنْتُمْ؟", "مَنْ أَنْتُنَّ؟"];
const NAMES_M = ["وَجْدِي", "شَادِي", "نَاجِي", "وَلِيد"];
const NAMES_F = ["سُوزِي", "إِسْتَر", "نِرْمِين", "تِرِيز"];
/** تدريب ٥: a question and an answer for each of the book's six pictures (names: any of the names studied). */
const PICTURES: ClozeItem[] = [
  { id: "p1", image: { src: `${IMG}/ex5-1.svg`, alt: "Ein Mann spricht eine Frau an" }, hint: "Ein Mann fragt eine Frau.", lines: [{ label: "أ", parts: [gap(["مَنْ أَنْتِ؟"], WHO)] }, { label: "ب", parts: ["أَنَا ", gap(NAMES_F, [...NAMES_F, ...NAMES_M])] }] },
  { id: "p2", image: { src: `${IMG}/ex5-2.svg`, alt: "Ein Mann spricht drei Frauen an" }, hint: "Ein Mann fragt drei Frauen.", lines: [{ label: "أ", parts: [gap(["مَنْ أَنْتُنَّ؟"], WHO)] }, { label: "ب", parts: ["نَحْنُ نِسْمَة وَنُورَا وَنِسْرِين."] }] },
  { id: "p3", image: { src: `${IMG}/ex5-3.svg`, alt: "Zwei Männer begrüßen sich" }, hint: "Ein Mann fragt einen Mann.", lines: [{ label: "أ", parts: [gap(["مَنْ أَنْتَ؟"], WHO)] }, { label: "ب", parts: ["أَنَا ", gap(NAMES_M, [...NAMES_M, ...NAMES_F])] }] },
  { id: "p4", image: { src: `${IMG}/ex5-4.svg`, alt: "Zwei Frauen begrüßen sich" }, hint: "Eine Frau fragt eine Frau.", lines: [{ label: "أ", parts: [gap(["مَنْ أَنْتِ؟"], WHO)] }, { label: "ب", parts: ["أَنَا ", gap(NAMES_F, [...NAMES_F, ...NAMES_M])] }] },
  { id: "p5", image: { src: `${IMG}/ex5-5.svg`, alt: "Zwei Männer im Mantel begrüßen sich" }, hint: "Ein Mann fragt einen Mann.", lines: [{ label: "أ", parts: [gap(["مَنْ أَنْتَ؟"], WHO)] }, { label: "ب", parts: ["أَنَا ", gap(NAMES_M, [...NAMES_M, ...NAMES_F])] }] },
  { id: "p6", image: { src: `${IMG}/ex5-6.svg`, alt: "Zwei Frauen begrüßen sich" }, hint: "Eine Frau fragt eine Frau.", lines: [{ label: "أ", parts: [gap(["مَنْ أَنْتِ؟"], WHO)] }, { label: "ب", parts: ["أَنَا ", gap(NAMES_F, [...NAMES_F, ...NAMES_M])] }] },
];

/** تدريب ٦: the missing parts of each exchange. */
const MISSING_DIALOGUE: ClozeItem[] = [
  { id: "d1", lines: [{ label: "أ", parts: [gap(["هَلْ أَنْتَ"], ["هَلْ أَنْتَ", "هَلْ أَنْتِ", "مَنْ أَنْتَ"]), " عَلِيّ؟"] }, { label: "ب", parts: ["لَا، أَنَا اسْمِي مَحْمُود."] }] },
  { id: "d2", lines: [{ label: "أ", parts: [gap(["هَلْ أَنْتَ"], ["هَلْ أَنْتَ", "هَلْ أَنْتِ", "مَنْ أَنْتَ"]), " خَالِد؟"] }, { label: "ب", parts: ["نَعَمْ، ", gap(["أَنَا خَالِد."], ["أَنَا خَالِد.", "أَنَا عَلِيّ.", "نَحْنُ خَالِد."])] }] },
  { id: "d3", lines: [{ label: "أ", parts: ["هَلْ اسْمَاكُمَا عَلْيَاء وَدِينَا؟"] }, { label: "ب", parts: [gap(["لَا،"], ["لَا،", "نَعَمْ،"]), " اسْمَانَا نَوَال وَ", gap(["سُوزِي.", "إِسْتَر.", "نِرْمِين."], ["سُوزِي.", "إِسْتَر.", "نِرْمِين.", "دِينَا."])] }] },
  { id: "d4", lines: [{ label: "أ", parts: [gap(["هَلْ اسْمُكَ مِدْحَت؟"], ["هَلْ اسْمُكَ مِدْحَت؟", "هَلْ اسْمُكِ مِدْحَت؟", "مَا اسْمُكَ؟"])] }, { label: "ب", parts: ["نَعَمْ، اسْمِي مِدْحَت."] }] },
  { id: "d5", lines: [{ label: "أ", parts: [gap(["هَلْ"], ["هَلْ", "مَنْ"]), " أَسْمَاؤُكُمْ نَاجِي وَنَسِيم وَنَادِي؟"] }, { label: "ب", parts: ["لَا، ", gap(["أَسْمَاؤُنَا"], ["اسْمِي", "اسْمَانَا", "أَسْمَاؤُنَا"]), " حُسْنِي وَنَاصِر وَنُصْحِي."] }] },
  { id: "d6", lines: [{ label: "أ", parts: [gap(["هَلْ أَسْمَاؤُكُنَّ هُدَى وَإِيمَان وَنَبِيلَة؟"], ["هَلْ أَسْمَاؤُكُنَّ هُدَى وَإِيمَان وَنَبِيلَة؟", "هَلْ أَسْمَاؤُكُمْ هُدَى وَإِيمَان وَنَبِيلَة؟", "هَلْ اسْمَاكُمَا هُدَى وَإِيمَان وَنَبِيلَة؟"])] }, { label: "ب", parts: ["نَعَمْ، ", gap(["أَسْمَاؤُنَا"], ["اسْمِي", "اسْمَانَا", "أَسْمَاؤُنَا"]), " هُدَى وَإِيمَان وَنَبِيلَة."] }] },
];

export const a1ManAnta: A1Lesson = {
  slug: "man-anta",
  kind: "phrase",
  label: "مَنْ أَنْتَ؟",
  labelGerman: "Wer bist du?",
  steps: [
    { kind: "dialogue", mode: "listen", slug: "step-1", title: "Anhören (أ): Wer bist du?", navLabel: "Anhören (أ)", instruction: { arabic: "الْمُحَادَثَةُ · تَقْدِيمٌ (أ): اِسْمَعْ وَكَرِّرْ بَعْدَ الْمُدَرِّسِ.", german: "Hör zu: Wer bist du? – zu einem, zu zwei und zu mehreren, zu Männern und zu Frauen." }, dialogue: manAntaA },
    { kind: "dialogue", mode: "repeat", slug: "step-2", title: "Nachsprechen (أ)", navLabel: "Nachsprechen (أ)", instruction: { arabic: "تَقْدِيمٌ (أ): اِسْمَعْ وَكَرِّرْ بَعْدَ الْمُدَرِّسِ.", german: "Sprich jede Zeile nach – so oft du willst, bis sie richtig ist.", note: "Die Bewertung kann مَنْ أَنْتُمْ und مَنْ أَنْتُنَّ (‑um / ‑unna) nicht sicher unterscheiden, ebenso ‑ta / ‑ti. Achte selbst auf die Endung." }, dialogue: manAntaA },
    { kind: "dialogue", mode: "listen", slug: "step-3", title: "Anhören (ب): Wie heißt du?", navLabel: "Anhören (ب)", instruction: { arabic: "تَقْدِيمٌ (ب): اِسْمَعْ وَكَرِّرْ بَعْدَ الْمُدَرِّسِ.", german: "Hör zu: Wer bist du? Wie heißt du?" }, dialogue: manAntaB },
    { kind: "dialogue", mode: "repeat", slug: "step-4", title: "Nachsprechen (ب)", navLabel: "Nachsprechen (ب)", instruction: { arabic: "تَقْدِيمٌ (ب): اِسْمَعْ وَكَرِّرْ بَعْدَ الْمُدَرِّسِ.", german: "Sprich jede Zeile nach – so oft du willst, bis sie richtig ist." }, dialogue: manAntaB },
    {
      kind: "table",
      slug: "step-5",
      title: "Grammatik: مَنْ und مَا, die Personalpronomen",
      navLabel: "Grammatik",
      instruction: { arabic: "لَاحِظِ الْقَوَاعِدَ", german: "Achte auf die Regeln: مَنْ fragt nach Personen, مَا nach Dingen (z. B. dem Namen). Die Form hängt davon ab, wen du fragst." },
      tables: [
        {
          id: "man",
          titleArabic: "١) لِلسُّؤَالِ عَنِ الْأَشْخَاصِ (لِلْعَاقِلِ) بِأَدَاةِ الِاسْتِفْهَامِ «مَنْ»؟",
          title: "Nach Personen fragen: مَنْ – wer?",
          columns: COLS,
          rows: [SECOND.map((p, i) => ({ arabic: `${p}؟`, german: SECOND_DE[i], gender: gender(i) })), [{ arabic: "أَنَا مُحَمَّد", german: "Ich bin Muhammad." }, { arabic: "أَنَا سُعَاد", german: "Ich bin Suad." }, ...[2, 3, 4, 5].map(() => ({ arabic: "نَحْنُ …", german: "Wir sind …", listen: false }))]],
          note: "Erste Zeile: ضَمِيرُ الْمُخَاطَبِ (du / ihr). Zweite Zeile, die Antwort: ضَمِيرُ الْمُتَكَلِّمِ (ich / wir).",
        },
        {
          id: "ma",
          titleArabic: "٢) لِلسُّؤَالِ عَنْ غَيْرِ الْعَاقِلِ (الْأَشْيَاءِ – الْمَوْضُوعَاتِ – الْأَسْمَاءِ …) نَسْتَخْدِمُ أَدَاةَ الِاسْتِفْهَامِ «مَا»؟",
          title: "Nach Dingen fragen (z. B. dem Namen): مَا – was?",
          columns: COLS,
          rows: [SECOND.map((p, i) => ({ arabic: p, german: SECOND_DE[i], gender: gender(i) })), NAME_Q.map((q) => ({ arabic: q, german: "Wie heißt …?" }))],
        },
        {
          id: "answer",
          titleArabic: "٣) لِلْإِجَابَةِ:",
          title: "Die Antwort",
          columns: COLS,
          rows: [FIRST.map((p) => ({ arabic: p })), NAME_A.map((a) => ({ arabic: a, german: a === "اسْمِي" ? "mein Name" : a === "اسْمَانَا" ? "unsere (zwei) Namen" : "unsere Namen" }))],
        },
      ],
      quiz: [
        { id: "who-f", prompt: "„Wer bist du?“ zu einer Frau:", options: ["مَنْ أَنْتَ؟", "مَنْ أَنْتِ؟", "مَنْ أَنْتُنَّ؟"], answer: 1 },
        { id: "who-fpl", prompt: "„Wer seid ihr?“ zu drei Frauen:", options: ["مَنْ أَنْتُمْ؟", "مَنْ أَنْتُمَا؟", "مَنْ أَنْتُنَّ؟"], answer: 2 },
        { id: "name-dual", prompt: "Zwei Personen nach ihren Namen fragen:", options: ["مَا اسْمُكَ؟", "مَا اسْمَاكُمَا؟", "مَا أَسْمَاؤُكُمْ؟"], answer: 1 },
        { id: "answer-pl", prompt: "Drei Freunde antworten: „Unsere Namen sind …“", options: ["اسْمِي", "اسْمَانَا", "أَسْمَاؤُنَا"], answer: 2 },
      ],
    },
    {
      kind: "dialogue",
      mode: "roleplay",
      slug: "step-6",
      title: "Rollenspiel: Übung 1 – Präsentation (أ)",
      navLabel: "Rollenspiel (أ)",
      instruction: { arabic: "تَدْرِيبٌ (١): اِقْرَأْ وَكَرِّرِ الْحِوَارَ فِي تَقْدِيمِ (أ) مَعَ زَمِيلِكَ.", german: "Übung 1: Lies und wiederhole die Unterhaltung aus (أ) mit deinem Lernpartner. Wähle: Du fragst – oder du antwortest. Alif spricht die anderen." },
      dialogue: manAntaA,
    },
    { kind: "match", slug: "step-7", title: "Übung 2: Pronomen und Frage", navLabel: "Übung 2", instruction: { arabic: "تَدْرِيبٌ (٢): صِلِ الضَّمِيرَ بِالسُّؤَالِ الْمُنَاسِبِ.", german: "Übung 2: Welche Frage passt zu welchem Pronomen?" }, match: PRONOUN_MATCH },
    { kind: "match", slug: "step-8", title: "Übung 3: Pronomen und Antwort", navLabel: "Übung 3", instruction: { arabic: "تَدْرِيبٌ (٣): صِلِ الضَّمِيرَ بِالْإِجَابَةِ الْمُنَاسِبَةِ.", german: "Übung 3: Welche Antwort passt zu welchem Pronomen?" }, match: ANSWER_MATCH },
    { kind: "cloze", slug: "step-9", title: "Übung 4: die fehlende Frage", navLabel: "Übung 4", instruction: { arabic: "تَدْرِيبٌ (٤): اُكْتُبِ السُّؤَالَ النَّاقِصَ بِضَمِيرِ الْمُخَاطَبِ.", german: "Übung 4: Ergänze die fehlende Frage – mit der passenden Form für die Person(en)." }, items: MISSING_QUESTIONS },
    { kind: "cloze", slug: "step-10", title: "Übung 5: Frage und Antwort zum Bild", navLabel: "Übung 5", instruction: { arabic: "تَدْرِيبٌ (٥): اُكْتُبْ سُؤَالًا وَإِجَابَةً تَحْتَ كُلِّ صُورَةٍ. اِسْتَخْدِمْ بَعْضَ الْأَسْمَاءِ الَّتِي دَرَسْتَهَا.", german: "Übung 5: Schreib zu jedem Bild eine Frage und eine Antwort. Nimm Namen, die du schon kennst.", note: "Teil 2 im Buch („lest Frage und Antwort abwechselnd mit eurem Partner“) braucht einen Partner; hier kannst du jede richtige Zeile anhören." }, items: PICTURES },
    { kind: "cloze", slug: "step-11", title: "Übung 6: die fehlenden Teile", navLabel: "Übung 6", instruction: { arabic: "تَدْرِيبٌ (٦): اُكْتُبِ الْحِوَارَ النَّاقِصَ.", german: "Übung 6: Ergänze die fehlenden Teile der Unterhaltungen.", note: "Wo das Buch einen Namen offen lässt, ist jeder passende Name richtig." }, items: MISSING_DIALOGUE },
    {
      kind: "dialogue",
      mode: "roleplay",
      slug: "step-12",
      title: "Rollenspiel: Übung 7 – Präsentation (ب)",
      navLabel: "Rollenspiel (ب)",
      instruction: {
        arabic: "تَدْرِيبٌ (٧): كَرِّرِ الْحِوَارَ فِي تَقْدِيمِ (ب) مَعَ زُمَلَائِكَ.",
        german: "Übung 7: Wiederhole die Unterhaltung aus (ب). Wähle eine Rolle – Alif spricht die anderen.",
        note: "Im Buch sollt ihr dabei eure echten Namen bzw. andere Namen nehmen. Eigene Namen kann die Bewertung nicht prüfen; hier sprichst du die Namen aus dem Buch.",
      },
      dialogue: manAntaB,
    },
    {
      kind: "table",
      slug: "step-13",
      title: "Merke: هَلْ, مَنْ, مَا, die Pronomen",
      navLabel: "Merke",
      instruction: { arabic: "تَذَكَّرْ", german: "Merke: das Wichtigste von Unit 2 auf einen Blick." },
      tables: [
        {
          id: "hal",
          titleArabic: "١) أَدَاةُ الِاسْتِفْهَامِ لِلسُّؤَالِ بِـ «هَلْ» عَنِ الْأَشْخَاصِ:",
          title: "هَلْ – Ja-/Nein-Frage nach einer Person",
          columns: [{ arabic: "السُّؤَالُ", german: "Frage" }, { arabic: "الْإِجَابَةُ", german: "Antwort" }],
          rows: [
            [{ arabic: "هَلْ + أَنْتَ …؟", german: "Bist du …?", listen: false }, { arabic: "نَعَمْ، أَنَا …", german: "Ja, ich bin …", listen: false }],
            [{ arabic: "هَلْ + ضَمِير", german: "هَلْ + Pronomen", listen: false }, { arabic: "لَا، أَنَا …", german: "Nein, ich bin …", listen: false }],
          ],
        },
        {
          id: "man",
          titleArabic: "٢) أَدَاةُ الِاسْتِفْهَامِ «مَنْ» لِلسُّؤَالِ عَنِ الْعَاقِلِ: مَنْ + الضَّمِيرُ أَوِ الِاسْمُ",
          title: "مَنْ – wer? (nach Personen)",
          columns: [{ arabic: "السُّؤَالُ", german: "Frage" }, { arabic: "الْإِجَابَةُ", german: "Antwort" }],
          rows: [[{ arabic: "مَنْ أَنْتِ؟", german: "Wer bist du? (Frau)", gender: "f" }, { arabic: "أَنَا …", german: "Ich bin …", listen: false }]],
        },
        {
          id: "ma",
          titleArabic: "٣) أَدَاةُ الِاسْتِفْهَامِ لِلسُّؤَالِ عَنْ غَيْرِ الْعَاقِلِ: الْمَوْضُوعُ + الضَّمِيرُ",
          title: "مَا – was? (nach Dingen, z. B. dem Namen)",
          columns: [{ arabic: "السُّؤَالُ", german: "Frage" }],
          rows: [[{ arabic: "مَا اسْمُكَ؟", german: "Wie heißt du? (Mann)", gender: "m" }]],
        },
        { id: "second", titleArabic: "٤) ضَمَائِرُ الْمُخَاطَبِ", title: "Pronomen der 2. Person (du / ihr)", columns: COLS, rows: [SECOND.map((p, i) => ({ arabic: p, german: SECOND_DE[i], gender: gender(i) }))] },
        { id: "first", titleArabic: "٥) ضَمَائِرُ الْمُتَكَلِّمِ", title: "Pronomen der 1. Person (ich / wir)", columns: COLS, rows: [FIRST.map((p) => ({ arabic: p, german: p === "أَنَا" ? "ich" : "wir" }))] },
        {
          id: "possessive",
          titleArabic: "٦) تَصْرِيفُ الضَّمَائِرِ لِلْمِلْكِيَّةِ:",
          title: "Wem gehört der Name? (mein / dein / euer …)",
          columns: [{ arabic: "الضَّمِيرُ", german: "Pronomen" }, { arabic: "السُّؤَالُ", german: "Frage" }, { arabic: "الْإِجَابَةُ", german: "Antwort" }],
          rows: SECOND.map((p, i) => [{ arabic: p, german: SECOND_DE[i], gender: gender(i) }, { arabic: NAME_Q[i]! }, { arabic: `${FIRST[i]} ${NAME_A[i]}` }]),
        },
      ],
      quiz: [
        { id: "hal", prompt: "Du willst wissen, ob ein Mann Sabir ist:", options: ["مَنْ أَنْتَ؟", "هَلْ أَنْتَ صَابِر؟", "مَا اسْمُكَ؟"], answer: 1 },
        { id: "ma", prompt: "Nach dem Namen fragt man mit …", options: ["مَنْ", "مَا", "هَلْ"], answer: 1 },
        { id: "nahnu", prompt: "„wir“ heißt …", options: ["أَنَا", "نَحْنُ", "أَنْتُمْ"], answer: 1 },
        { id: "kum", prompt: "Die Antwort auf مَا أَسْمَاؤُكُمْ؟ beginnt mit …", options: ["نَحْنُ أَسْمَاؤُنَا", "أَنَا اسْمِي", "نَحْنُ اسْمَانَا"], answer: 0 },
      ],
    },
  ],
};
