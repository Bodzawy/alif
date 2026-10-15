import type { A1Lesson, ClozeItem, Dialogue, DialogueSpeaker } from "@/data/types";

import { lines } from "../sabah-al-khayr";

// Unit 3 · تقديم (١) "مَنْ هُوَ؟" – the conversation and its exercises (book
// pages 107–110, PDF pages 139–142):
//   المحادثة: تقديم (أ) مَنْ هُوَ؟ مَا اسْمُهُ؟ and تقديم (ب) مَنْ هِيَ؟ مَا اسْمُهَا؟
//   لاحظ القواعد: ضمير الغائب + ضمير الملكية; مَنْ for persons.
//   تدريب ١ (website), ٢ (order the dialogue, answer), ٣ (question and answer
//   for each picture), ٤ (the matching question), ٥ (celebrities – a class
//   activity).
// In the pictures of (أ) and (ب) a woman and a man point at other people; the
// book does not say who asks: here the woman asks and the man answers.

const IMG = "/images/a1/unit-3";
const sp = (id: string, name: string, voice: DialogueSpeaker["voice"], alt: string): DialogueSpeaker => ({ id, name, voice, avatar: { src: `${IMG}/${id}.svg`, alt } });
const ASKER = sp("asker-f", "Die Fragende", "female-1", "Eine junge Frau mit dunklen Locken, sie zeigt auf jemanden");
const ANSWER = sp("answer-m", "Der Antwortende", "male-1", "Ein junger Mann mit Schnurrbart und kariertem Hemd");

export const manHuwaA: Dialogue = {
  id: "man-huwa-a",
  intro: "Eine Frau und ein Mann zeigen auf Leute: auf einen Mann, auf zwei Männer, auf drei Männer. Wer ist das? Wie heißt er?",
  speakers: [ASKER, ANSWER],
  lines: lines([
    ["u3-a-q1", "asker-f", "مَنْ هُوَ؟ مَا اسْمُهُ؟", "من هو ما اسمه", "Man huwa? Ma-smuhu?", "Wer ist er? Wie heißt er?"],
    ["u3-a-a1", "answer-m", "هُوَ أَحْمَد. اسْمُهُ أَحْمَد.", "هو أحمد اسمه أحمد", "Huwa Aḥmad. Ismuhu Aḥmad.", "Das ist Ahmad. Er heißt Ahmad."],
    ["u3-a-q2", "asker-f", "مَنْ هُمَا؟ مَا اسْمَاهُمَا؟", "من هما ما اسماهما", "Man humā? Ma-smāhumā?", "Wer sind die beiden? Wie heißen sie?"],
    ["u3-a-a2", "answer-m", "هُمَا سَمِير وَمَجْدِي. اسْمَاهُمَا سَمِير وَمَجْدِي.", "هما سمير ومجدي اسماهما سمير ومجدي", "Humā Samīr wa-Majdī. Ismāhumā Samīr wa-Majdī.", "Das sind Samir und Magdi. Sie heißen Samir und Magdi."],
    ["u3-a-q3", "asker-f", "مَنْ هُمْ؟ مَا أَسْمَاؤُهُمْ؟", "من هم ما أسماؤهم", "Man hum? Mā asmāʾuhum?", "Wer sind sie (die Männer)? Wie heißen sie?"],
    ["u3-a-a3", "answer-m", "هُمْ نَبِيل وَرِفْعَت وَمُصْطَفَى. أَسْمَاؤُهُمْ نَبِيل وَرِفْعَت وَمُصْطَفَى.", "هم نبيل ورفعت ومصطفى أسماؤهم نبيل ورفعت ومصطفى", "Hum Nabīl wa-Rifʿat wa-Muṣṭafā. Asmāʾuhum Nabīl wa-Rifʿat wa-Muṣṭafā.", "Das sind Nabil, Rifat und Mustafa. Sie heißen Nabil, Rifat und Mustafa."],
  ]),
  question: { prompt: "مَنْ هُوَ؟ – Wie heißt der Mann im ersten Bild?", options: ["Ahmad.", "Samir.", "Nabil."], answer: 0 },
};

export const manHiyaB: Dialogue = {
  id: "man-hiya-b",
  intro: "Jetzt zeigen sie auf Frauen: auf eine Frau, auf zwei Frauen, auf drei Frauen. Wer ist das? Wie heißt sie?",
  speakers: [ASKER, ANSWER],
  lines: lines([
    ["u3-b-q1", "asker-f", "مَنْ هِيَ؟ مَا اسْمُهَا؟", "من هي ما اسمها", "Man hiya? Ma-smuhā?", "Wer ist sie? Wie heißt sie?"],
    ["u3-b-a1", "answer-m", "هِيَ سَلْوَى. اسْمُهَا سَلْوَى.", "هي سلوى اسمها سلوى", "Hiya Salwā. Ismuhā Salwā.", "Das ist Salwa. Sie heißt Salwa."],
    ["u3-b-q2", "asker-f", "مَنْ هُمَا؟ مَا اسْمَاهُمَا؟", "من هما ما اسماهما", "Man humā? Ma-smāhumā?", "Wer sind die beiden? Wie heißen sie?"],
    ["u3-b-a2", "answer-m", "هُمَا نَرْمِين وَإِيمَان. اسْمَاهُمَا نَرْمِين وَإِيمَان.", "هما نرمين وإيمان اسماهما نرمين وإيمان", "Humā Narmīn wa-Īmān. Ismāhumā Narmīn wa-Īmān.", "Das sind Narmin und Iman. Sie heißen Narmin und Iman."],
    ["u3-b-q3", "asker-f", "مَنْ هُنَّ؟ مَا أَسْمَاؤُهُنَّ؟", "من هن ما أسماؤهن", "Man hunna? Mā asmāʾuhunna?", "Wer sind sie (die Frauen)? Wie heißen sie?"],
    ["u3-b-a3", "answer-m", "هُنَّ حَنَان وَنَجْوَى وَفَاطِمَة. أَسْمَاؤُهُنَّ حَنَان وَنَجْوَى وَفَاطِمَة.", "هن حنان ونجوى وفاطمة أسماؤهن حنان ونجوى وفاطمة", "Hunna Ḥanān wa-Najwā wa-Fāṭima. Asmāʾuhunna Ḥanān wa-Najwā wa-Fāṭima.", "Das sind Hanan, Nagwa und Fatima. Sie heißen Hanan, Nagwa und Fatima."],
  ]),
  question: { prompt: "مَنْ هِيَ؟ – Wie heißt die Frau im ersten Bild?", options: ["Narmin.", "Salwa.", "Fatima."], answer: 1 },
};

const COLS = [
  { arabic: "ضَمِيرُ الْمُفْرَدِ", german: "eine Person" },
  { arabic: "لِلْمِلْكِيَّةِ", german: "sein / ihr Name" },
  { arabic: "ضَمِيرُ الْمُثَنَّى", german: "zwei Personen" },
  { arabic: "لِلْمِلْكِيَّةِ", german: "ihre (zwei) Namen" },
  { arabic: "ضَمِيرُ الْجَمْعِ", german: "mehrere Personen" },
  { arabic: "لِلْمِلْكِيَّةِ", german: "ihre Namen" },
];

const gap = (accept: string[], options: string[]) => ({ accept, options });
const Q = ["مَا اسْمُهُ؟", "مَا اسْمُهَا؟", "مَا اسْمَاهُمَا؟", "مَا أَسْمَاؤُهُمْ؟", "مَا أَسْمَاؤُهُنَّ؟"];
const POSS = ["اسْمُهُ", "اسْمُهَا", "اسْمَاهُمَا", "أَسْمَاؤُهُمْ", "أَسْمَاؤُهُنَّ"];
const MEN = ["أَحْمَد", "سَامِي", "سَمِير", "مَجْدِي", "نَبِيل", "رِفْعَت", "مُصْطَفَى", "خَالِد", "عَلِيّ"];
const WOMEN = ["سَلْوَى", "نَرْمِين", "إِيمَان", "حَنَان", "نَجْوَى", "فَاطِمَة", "زَيْنَب"];

/** تدريب ٣: the six pictures – two men point at one, two or three people (the first one is the book's model). */
const PICTURES: ClozeItem[] = [
  {
    id: "p1",
    image: { src: `${IMG}/ex3-1.svg`, alt: "Zwei Männer am Nebentisch zeigen auf zwei Männer" },
    hint: "Beispiel im Buch: zwei Männer.",
    lines: [{ label: "أ", parts: ["مَا اسْمَاهُمَا؟"] }, { label: "ب", parts: ["اسْمَاهُمَا أَحْمَد وَسَامِي."] }],
  },
  {
    id: "p2",
    image: { src: `${IMG}/ex3-2.svg`, alt: "Zwei Männer zeigen auf eine Frau, die liest" },
    hint: "Eine Frau.",
    lines: [{ label: "أ", parts: [gap(["مَا اسْمُهَا؟"], Q)] }, { label: "ب", parts: [gap(["اسْمُهَا"], POSS), " ", gap(WOMEN.map((n) => `${n}.`), [...WOMEN.slice(0, 4), ...MEN.slice(0, 3)].map((n) => `${n}.`))] }],
  },
  {
    id: "p3",
    image: { src: `${IMG}/ex3-3.svg`, alt: "Zwei Männer zeigen auf drei Frauen an einem Tisch" },
    hint: "Drei Frauen.",
    lines: [{ label: "أ", parts: [gap(["مَا أَسْمَاؤُهُنَّ؟"], Q)] }, { label: "ب", parts: [gap(["أَسْمَاؤُهُنَّ"], POSS), " ", gap(["حَنَان وَنَجْوَى وَفَاطِمَة."], ["حَنَان وَنَجْوَى وَفَاطِمَة.", "سَلْوَى وَإِيمَان.", "نَبِيل وَرِفْعَت وَمُصْطَفَى."])] }],
  },
  {
    id: "p4",
    image: { src: `${IMG}/ex3-4.svg`, alt: "Zwei Männer zeigen auf einen Mann, der Zeitung liest" },
    hint: "Ein Mann.",
    lines: [{ label: "أ", parts: [gap(["مَا اسْمُهُ؟"], Q)] }, { label: "ب", parts: [gap(["اسْمُهُ"], POSS), " ", gap(MEN.map((n) => `${n}.`), [...MEN.slice(0, 4), ...WOMEN.slice(0, 3)].map((n) => `${n}.`))] }],
  },
  {
    id: "p5",
    image: { src: `${IMG}/ex3-5.svg`, alt: "Zwei Männer zeigen auf zwei Frauen an einem Tisch" },
    hint: "Zwei Frauen.",
    lines: [{ label: "أ", parts: [gap(["مَا اسْمَاهُمَا؟"], Q)] }, { label: "ب", parts: [gap(["اسْمَاهُمَا"], POSS), " ", gap(["نَرْمِين وَإِيمَان."], ["نَرْمِين وَإِيمَان.", "سَمِير وَمَجْدِي.", "سَلْوَى."])] }],
  },
  {
    id: "p6",
    image: { src: `${IMG}/ex3-6.svg`, alt: "Zwei Männer zeigen auf drei Männer an einem Tisch" },
    hint: "Drei Männer.",
    lines: [{ label: "أ", parts: [gap(["مَا أَسْمَاؤُهُمْ؟"], Q)] }, { label: "ب", parts: [gap(["أَسْمَاؤُهُمْ"], POSS), " ", gap(["نَبِيل وَرِفْعَت وَمُصْطَفَى."], ["نَبِيل وَرِفْعَت وَمُصْطَفَى.", "حَنَان وَنَجْوَى وَفَاطِمَة.", "أَحْمَد وَسَامِي."])] }],
  },
];

/** تدريب ٤: the book's answers (ب) – write the matching question (أ). */
const ANSWERS: Array<[answer: string, question: string]> = [
  ["نَاجِي وَعَادِل وَمُصْطَفَى.", "مَا أَسْمَاؤُهُمْ؟"],
  ["زَيْنَب وَفَرِيدَة وَإِيمَان.", "مَا أَسْمَاؤُهُنَّ؟"],
  ["أَحْمَد وَعَلِيّ.", "مَا اسْمَاهُمَا؟"],
  ["سَمِير.", "مَا اسْمُهُ؟"],
  ["هِنْد.", "مَا اسْمُهَا؟"],
  ["دَلَال وَعُلَا.", "مَا اسْمَاهُمَا؟"],
];
const QUESTIONS: ClozeItem[] = ANSWERS.map(([answer, question], n) => ({ id: `q${n + 1}`, lines: [{ label: "أ", parts: [gap([question], Q)] }, { label: "ب", parts: [answer] }] }));

const ARRANGE_GERMAN = ["Er heißt Khalid.", "Ali! Wer ist er? Wie heißt er?", "Sie heißt Zainab.", "Fatima – wer ist sie? Wie heißt sie?"];

export const a1ManHuwa: A1Lesson = {
  slug: "man-huwa",
  kind: "phrase",
  label: "مَنْ هُوَ؟",
  labelGerman: "Wer ist er?",
  steps: [
    { kind: "dialogue", mode: "listen", slug: "step-1", title: "Anhören (أ): Wer ist er?", navLabel: "Anhören (أ)", instruction: { arabic: "الْمُحَادَثَةُ: مَنْ هُوَ؟ · تَقْدِيمٌ (أ): مَنْ هُوَ؟ مَا اسْمُهُ؟ اِقْرَأْ وَكَرِّرْ بَعْدَ الْمُدَرِّسِ.", german: "Hör zu: Wer ist er? Wie heißt er? – über einen, zwei und drei Männer." }, dialogue: manHuwaA },
    { kind: "dialogue", mode: "repeat", slug: "step-2", title: "Nachsprechen (أ)", navLabel: "Nachsprechen (أ)", instruction: { arabic: "تَقْدِيمٌ (أ): اِقْرَأْ وَكَرِّرْ بَعْدَ الْمُدَرِّسِ.", german: "Sprich jede Zeile nach – so oft du willst, bis sie richtig ist.", note: "Die Bewertung kann ‑hu / ‑hā und ‑hum / ‑hunna nicht sicher unterscheiden. Achte selbst auf die Endung." }, dialogue: manHuwaA },
    { kind: "dialogue", mode: "listen", slug: "step-3", title: "Anhören (ب): Wer ist sie?", navLabel: "Anhören (ب)", instruction: { arabic: "تَقْدِيمٌ (ب): مَنْ هِيَ؟ مَا اسْمُهَا؟ اِقْرَأْ وَكَرِّرْ بَعْدَ الْمُدَرِّسِ.", german: "Hör zu: Wer ist sie? Wie heißt sie? – über eine, zwei und drei Frauen." }, dialogue: manHiyaB },
    { kind: "dialogue", mode: "repeat", slug: "step-4", title: "Nachsprechen (ب)", navLabel: "Nachsprechen (ب)", instruction: { arabic: "تَقْدِيمٌ (ب): اِقْرَأْ وَكَرِّرْ بَعْدَ الْمُدَرِّسِ.", german: "Sprich jede Zeile nach – so oft du willst, bis sie richtig ist." }, dialogue: manHiyaB },
    {
      kind: "dialogue",
      mode: "roleplay",
      slug: "step-5",
      title: "Rollenspiel (أ)",
      navLabel: "Rollenspiel (أ)",
      instruction: {
        arabic: "١) كَرِّرِ الْحِوَارَ مَعَ زَمِيلِكَ ثُمَّ أَجِبْ: مَنْ فِي الصُّورَةِ؟ مَنْ هُوَ؟ مَا اسْمُهُ؟ ٢) مَنْ فِي الصُّورَةِ؟ مَنْ هُمَا؟ مَا اسْمَاهُمَا؟ ٣) كَرِّرِ النَّشَاطَ مَعَ بَاقِي الصُّوَرِ.",
        german: "Wiederhole die Unterhaltung mit deinem Lernpartner: Du fragst – oder du antwortest. Alif spricht die andere Rolle.",
      },
      dialogue: manHuwaA,
    },
    { kind: "dialogue", mode: "roleplay", slug: "step-6", title: "Rollenspiel (ب)", navLabel: "Rollenspiel (ب)", instruction: { arabic: "٣) كَرِّرِ النَّشَاطَ مَعَ بَاقِي الصُّوَرِ.", german: "Dasselbe mit den Bildern von (ب): Wer ist sie? Wie heißt sie?" }, dialogue: manHiyaB },
    {
      kind: "table",
      slug: "step-7",
      title: "Grammatik: er, sie, die beiden, sie alle – und ihre Namen",
      navLabel: "Grammatik",
      instruction: { arabic: "لَاحِظِ الْقَوَاعِدَ: ١) ضَمِيرُ الْغَائِبِ (لِلشَّخْصِ الثَّالِثِ) ٢) لِلسُّؤَالِ عَنِ الْأَشْخَاصِ", german: "Achte auf die Regeln: die Pronomen der 3. Person (er / sie / die beiden / sie) und die Endung für „sein / ihr Name“." },
      tables: [
        {
          id: "third",
          titleArabic: "١) ضَمِيرُ الْغَائِبِ (لِلشَّخْصِ الثَّالِثِ – Third Person):",
          title: "Pronomen der 3. Person und „sein / ihr Name“",
          columns: [{ arabic: "", german: "" }, ...COLS],
          rows: [
            [{ arabic: "الْمُذَكَّرُ", german: "männlich", listen: false }, { arabic: "هُوَ", german: "er" }, { arabic: "اسْمُهُ", german: "sein Name" }, { arabic: "هُمَا", german: "die beiden" }, { arabic: "اسْمَاهُمَا", german: "ihre (zwei) Namen" }, { arabic: "هُمْ", german: "sie (Männer)" }, { arabic: "أَسْمَاؤُهُمْ", german: "ihre Namen" }],
            [{ arabic: "الْمُؤَنَّثُ", german: "weiblich", listen: false }, { arabic: "هِيَ", german: "sie" }, { arabic: "اسْمُهَا", german: "ihr Name" }, { arabic: "هُمَا", german: "die beiden" }, { arabic: "اسْمَاهُمَا", german: "ihre (zwei) Namen" }, { arabic: "هُنَّ", german: "sie (Frauen)" }, { arabic: "أَسْمَاؤُهُنَّ", german: "ihre Namen" }],
          ],
          note: "Für zwei Personen gibt es nur eine Form: هُمَا – für zwei Männer und für zwei Frauen.",
        },
        {
          id: "man",
          titleArabic: "٢) لِلسُّؤَالِ عَنِ الْأَشْخَاصِ: «مَنْ هُوَ؟» أَدَاةُ الِاسْتِفْهَامِ «مَنْ؟» لِلسُّؤَالِ عَنِ الْأَشْخَاصِ.",
          title: "مَنْ – wer? fragt nach Personen",
          columns: [{ arabic: "السُّؤَالُ", german: "Frage" }, { arabic: "الْإِجَابَةُ", german: "Antwort" }],
          rows: [[{ arabic: "مَنْ هُوَ؟", german: "Wer ist er?" }, { arabic: "هُوَ أَحْمَد.", german: "Das ist Ahmad." }]],
        },
      ],
      quiz: [
        { id: "she", prompt: "„Wie heißt sie?“ (eine Frau)", options: ["مَا اسْمُهُ؟", "مَا اسْمُهَا؟", "مَا اسْمَاهُمَا؟"], answer: 1 },
        { id: "dual", prompt: "Zwei Frauen: „Wer sind die beiden?“", options: ["مَنْ هُنَّ؟", "مَنْ هُمَا؟", "مَنْ هِيَ؟"], answer: 1 },
        { id: "men", prompt: "Drei Männer: „Ihre Namen sind …“", options: ["أَسْمَاؤُهُنَّ", "اسْمَاهُمَا", "أَسْمَاؤُهُمْ"], answer: 2 },
      ],
    },
    {
      kind: "order",
      slug: "step-8",
      title: "Übung 2: Ordne die Unterhaltung",
      navLabel: "Übung 2 (ordnen)",
      instruction: {
        arabic: "تَدْرِيبٌ (٢): اِقْرَأْ وَرَتِّبِ الْحِوَارَ وَأَجِبْ.",
        german: "Übung 2: Lies die vier Zeilen und bring sie in die richtige Reihenfolge – erst die Frage, dann die Antwort.",
        note: "Übung 1 im Buch („اُدْخُلْ إِلَى الْمَوْقِعِ“) ist auf der Website des Verlags. Beide Reihenfolgen der zwei Fragen sind richtig.",
      },
      order: {
        items: ["هُوَ اسْمُهُ خَالِد.", "يَا عَلِيُّ! مَنْ هُوَ؟ مَا اسْمُهُ؟", "هِيَ اسْمُهَا زَيْنَب.", "يَا فَاطِمَةُ – مَنْ هِيَ؟ مَا اسْمُهَا؟"].map((arabic, n) => ({ id: `line-${n + 1}`, arabic, german: ARRANGE_GERMAN[n]! })),
        solutions: [
          ["line-2", "line-1", "line-4", "line-3"],
          ["line-4", "line-3", "line-2", "line-1"],
        ],
      },
    },
    {
      kind: "cloze",
      slug: "step-9",
      title: "Übung 2 (أ): Wie heißen die beiden?",
      navLabel: "Übung 2 (antworten)",
      instruction: {
        arabic: "أ – مَا اسْمُهُ؟ مَا اسْمَاهُمَا؟ · ب – كَرِّرِ الْحِوَارَ مَعَ زَمِيلٍ / زَمِيلَةٍ عَنْ طَلَبَةٍ آخَرِينَ فِي الْفَصْلِ.",
        german: "Übung 2 (a): Im Bild sprechen Ali und Fatima. Wie heißt er? Wie heißen die beiden?",
        note: "Teil (b) im Buch – die Unterhaltung über andere Leute in deiner Klasse – braucht eine Klasse.",
      },
      items: [
        { id: "ismuhu", image: { src: `${IMG}/ex2.svg`, alt: "Ein Mann und eine Frau mit Büchern unterhalten sich vor der Universität" }, hint: "Der Mann im Bild.", lines: [{ label: "أ", parts: ["مَا اسْمُهُ؟"] }, { label: "ب", parts: [gap(["اسْمُهُ"], POSS), " ", gap(["عَلِيّ."], ["عَلِيّ.", "خَالِد.", "فَاطِمَة."])] }] },
        { id: "ismahuma", hint: "Die beiden im Bild.", lines: [{ label: "أ", parts: ["مَا اسْمَاهُمَا؟"] }, { label: "ب", parts: [gap(["اسْمَاهُمَا"], POSS), " ", gap(["عَلِيّ وَفَاطِمَة.", "فَاطِمَة وَعَلِيّ."], ["عَلِيّ وَفَاطِمَة.", "خَالِد وَزَيْنَب.", "فَاطِمَة وَعَلِيّ."])] }] },
      ],
    },
    {
      kind: "cloze",
      slug: "step-10",
      title: "Übung 3: Frage und Antwort zu jedem Bild",
      navLabel: "Übung 3",
      instruction: {
        arabic: "تَدْرِيبٌ (٣): ١) اُكْتُبْ تَحْتَ كُلِّ صُورَةٍ السُّؤَالَ وَالْإِجَابَةَ، اِسْتَخْدِمْ أَسْمَاءً مِنَ الَّتِي دَرَسْتَهَا. ٢) كَرِّرْ مَا كَتَبْتَهُ مِنْ حِوَارٍ مَعَ زَمِيلِكَ.",
        german: "Übung 3: Zwei Männer zeigen auf Leute im Café. Schreib zu jedem Bild die Frage und die Antwort – mit Namen, die du schon kennst.",
        note: "Wo das Buch die Namen offen lässt, ist jeder passende Name richtig. Teil 2 (mit dem Partner wiederholen): Hör dir jede richtige Zeile an und sprich sie nach.",
      },
      items: PICTURES,
    },
    {
      kind: "cloze",
      slug: "step-11",
      title: "Übung 4: die passende Frage",
      navLabel: "Übung 4",
      instruction: { arabic: "تَدْرِيبٌ (٤): اُكْتُبِ السُّؤَالَ الْمُنَاسِبَ.", german: "Übung 4: Hier stehen die Antworten (ب). Welche Frage (أ) passt?", note: "Übung 5 im Buch – „schreib die Namen von vier berühmten Personen und frag deinen Partner: مَا اسْمُهُ؟ / مَا اسْمُهَا؟“ – braucht einen Partner und eigene Namen; dafür gibt es hier keine Bewertung." },
      items: QUESTIONS,
    },
  ],
};
