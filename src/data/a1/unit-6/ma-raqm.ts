import type { A1Lesson, ClozeItem, ClozePart, Dialogue, DialogueSpeaker, PhraseItem, QuizItem } from "@/data/types";
import { numberWord, ORDINALS, spokenDigits, toArabicDigits } from "@/lib/arabic/numbers";
import { transliterate } from "@/lib/arabic/transliterate";

import { unvocalised } from "../letter-lesson";
import { lines } from "../sabah-al-khayr";

// Unit 6 · تقديم (١) "مَا الرَّقْمُ؟" (book pages 179–195, PDF 211–227): the
// doctor's card, the numbers 0–20, the ordinals, the phone dialogue, لاحظ
// القواعد, تدريب ١ (seven cards – the listening texts of pages 193–194), ٢
// (info gap), ٣ (arithmetic), ٤ (two phone dialogues, pages 194–195), ٥
// (website), ٦ (Hisham's note), ٧ (a note with the institute's card), ٨
// (questions about the card); المحادثة ١ (Diana's form), ٢–٣ (class).

const IMG = "/images/a1/unit-6";
const gap = (accept: string[], options: string[]): ClozePart => ({ accept, options });
const sorted = (xs: string[]) => [...new Set(xs)].sort((a, b) => a.localeCompare(b, "ar"));
const sp = (id: string, name: string, voice: DialogueSpeaker["voice"], alt: string): DialogueSpeaker => ({ id, name, voice, avatar: { src: `${IMG}/${id}.svg`, alt } });
const phrase = (id: string, arabic: string, german: string, spoken = arabic): PhraseItem => ({ id, arabic, transliteration: transliterate(spoken), german, exercise: { id, target: unvocalised(spoken).replace(/[.؟?!،,:]/g, "").replace(/\s+/g, " ").trim(), modelText: spoken } });
/** A number shown in digits (e.g. a phone number); spoken digit by digit. */
const num = (digits: string) => toArabicDigits(digits);

const DE_UNITS = ["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben", "acht", "neun", "zehn", "elf", "zwölf", "dreizehn", "vierzehn", "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn", "zwanzig"];
const DE_ORD = ["", "der erste", "der zweite", "der dritte", "der vierte", "der fünfte", "der sechste", "der siebte", "der achte", "der neunte", "der zehnte", "der elfte", "der zwölfte"];

const CARD_WORDS: Array<[arabic: string, german: string]> = [
  ["طَبِيب – جَرَّاح", "Arzt – Chirurg"],
  ["شَارِع", "Straße"],
  ["الدَّوْر الثَّالِث", "der dritte Stock"],
  ["شَقَّة", "Wohnung"],
  ["الْجِيزَة – الْقَاهِرَة", "Gizeh – Kairo"],
  ["تِلِيفُون عِيَادَة", "Telefon der Praxis"],
  ["مَحْمُول", "Handy"],
];

export const nurseDialogue: Dialogue = {
  id: "patient-nurse",
  intro: "Ein Patient ruft in der Praxis von Dr. Saif Abdullah an und fragt nach seiner Handynummer.",
  speakers: [sp("marid", "Der Patient", "male-1", "Ein Mann am Telefon"), sp("mumarrida", "Die Krankenschwester", "female-1", "Eine Krankenschwester am Telefon")],
  lines: lines([
    ["u6-pn-1", "marid", "أَلُو … عِيَادَةُ الدُّكْتُورِ سَيْف عَبْدِ اللهِ؟", "ألو عيادة الدكتور سيف عبد الله", "Alū … ʿiyādatu d-duktūr Sayf ʿAbdi llāh?", "Hallo … die Praxis von Dr. Saif Abdullah?"],
    ["u6-pn-2", "mumarrida", "نَعَمْ.", "نعم", "Naʿam.", "Ja."],
    ["u6-pn-3", "marid", "مَا رَقْمُ تِلِيفُونِهِ الْمَحْمُولِ لَوْ سَمَحْتِ؟", "ما رقم تليفونه المحمول لو سمحت", "Mā raqmu tilīfūnihi l-maḥmūl law samaḥti?", "Wie ist seine Handynummer, bitte?"],
    ["u6-pn-4", "mumarrida", `رَقْمُ تِلِيفُونِهِ الْمَحْمُولِ ${spokenDigits("0186935214")}.`, "رقم تليفونه المحمول صفر واحد ثمانية ستة تسعة ثلاثة خمسة اثنان واحد أربعة", "Raqmu tilīfūnihi l-maḥmūl: 0186935214.", "Seine Handynummer ist 0186935214."],
  ]),
  question: { prompt: "مَا رَقْمُ تِلِيفُونِ الطَّبِيبِ الْمَحْمُولِ؟", options: ["٠١٨٦٩٣٥٢١٤", "٧٩٨٥٤١٢٦", "٠١٨٦٩٢٥٢١٤"], answer: 0 },
};
/** تدريب ١: the seven cards with the texts of pages 193–194. */
type Card = { id: string; who: string; job: string; text: string; phone: string; mobile?: string; street: string; floor?: string; flat?: string; wrong: string[] };
const CARDS: Card[] = [
  { id: "a", who: "عَبْد الرَّحِيم عَبْد الله", job: "مُحَامٍ", text: "لَوْ سَمَحْتِ مَا رَقْمُ تِلِيفُونِ مَكْتَبِ الْأُسْتَاذِ عَبْدِ الرَّحِيمِ عَبْدِ اللهِ؟ رَقْمُ تِلِيفُونِ الْمَكْتَبِ ٤٧٦٢٣٥٤٩. مَا رَقْمُ الْمَحْمُولِ؟ رَقْمُ الْمَحْمُولِ ٠١٨٦٣٤٥٢٠١. وَمَا الْعُنْوَانُ؟ عُنْوَانُهُ ١٣ شَارِعُ مُصْطَفَى كَامِل، الدَّوْرُ الثَّانِي، شَقَّةُ ٤.", phone: "47623549", mobile: "0186345201", street: "١٣ شَارِع مُصْطَفَى كَامِل", floor: "الثَّانِي", flat: "٤", wrong: ["47263549", "0186345210"] },
  { id: "b", who: "سُعَاد الْمَكْتُوم", job: "صَحَفِيَّة", text: "سُعَاد الْمَكْتُوم – صَحَفِيَّة. رَقْمُ تِلِيفُونِهَا ٣٨٦٤٠٢٢١، الْمَحْمُول ٠١٢٥٤٣٢٦٦٩. عُنْوَانُهَا ١٦ شَارِعُ الرِّيَاضِ، الدَّوْرُ الثَّالِثُ، شَقَّةُ ١٠.", phone: "38640221", mobile: "0125432669", street: "١٦ شَارِع الرِّيَاض", floor: "الثَّالِث", flat: "١٠", wrong: ["38640212", "0125432696"] },
  { id: "c", who: "فَايِز عَبَّاس", job: "حَلَّاق", text: "لَوْ سَمَحْتِ مَا رَقْمُ السَّيِّدِ فَايِز عَبَّاس الْحَلَّاقِ؟ رَقْمُ تِلِيفُونِ الْمَحَلِّ ٣٨٦٧٠٥٥٢، وَرَقْمُ تِلِيفُونِهِ الْمَحْمُولِ ٠١٦٨٨٧٣٢١٥. وَمَا عُنْوَانُهُ لَوْ سَمَحْتِ؟ عُنْوَانُهُ ٢٠ شَارِعُ الْجَزَائِرِ.", phone: "38670552", mobile: "0168873215", street: "٢٠ شَارِع الْجَزَائِر", wrong: ["38607552", "0168873251"] },
  { id: "d", who: "طَلَال فَاسِي", job: "طَبِيب", text: "أَلُو، لَوْ سَمَحْتِ مَا رَقْمُ تِلِيفُونِ الطَّبِيبِ طَلَال فَاسِي؟ رَقْمُ تِلِيفُونِ الْعِيَادَةِ ٣٤٥٦٨٤٢١، وَتِلِيفُونُهُ الْمَحْمُولُ ٠١٢٣٤٣٠٥٧٩. وَمَا عُنْوَانُهُ لَوْ سَمَحْتِ؟ عُنْوَانُهُ ١٢ شَارِعُ مَكَّةَ، الدَّوْرُ الرَّابِعُ، شَقَّةُ ٦.", phone: "34568421", mobile: "0123430579", street: "١٢ شَارِع مَكَّة", floor: "الرَّابِع", flat: "٦", wrong: ["34586421", "0123430597"] },
  { id: "e", who: "مَازِن النَّدِيم", job: "صَيْدَلِيّ", text: "أَلُو، مَا رَقْمُ صَيْدَلِيَّةِ دُكْتُور مَازِن النَّدِيم لَوْ سَمَحْتِ؟ رَقْمُ تِلِيفُونِ الصَّيْدَلِيَّةِ ٢٤٥٦٧٨٠٣.", phone: "24567803", street: "شَارِع دِمَشْق", wrong: ["24567830", "24657803"] },
  { id: "f", who: "حَازِم أَمِين", job: "مُدَرِّس", text: "الْأُسْتَاذُ حَازِم أَمِين الْمُدَرِّسُ. تِلِيفُونُ الْمَنْزِلِ ٢٤٣٥٨٨٢٠، وَرَقْمُ تِلِيفُونِهِ الْمَحْمُولِ ٠١٢٥٤٣٦٢٢٤٩. عُنْوَانُهُ ٩ شَارِعُ عَدَن، الدَّوْرُ الْخَامِسُ، شَقَّةُ ١٥.", phone: "24358820", mobile: "01254362249", street: "٩ شَارِع عَدَن", floor: "الْخَامِس", flat: "١٥", wrong: ["24358802", "01254362294"] },
  { id: "g", who: "رِيَاض حَنَّا", job: "مُهَنْدِس", text: "أَلُو، لَوْ سَمَحْتِ مَا رَقْمُ الْمُهَنْدِسِ رِيَاض حَنَّا؟ رَقْمُ تِلِيفُونِ مَكْتَبِهِ ٣٧٤٨٥٢٣١، وَتِلِيفُونُهُ الْمَحْمُولُ ٠١٨٤٥٣٢٦١٧. وَمَا عُنْوَانُهُ؟ عُنْوَانُهُ ١٨ شَارِعُ النِّيلِ، الدَّوْرُ السَّابِعُ، شَقَّةُ رَقْمِ ٢٠.", phone: "37485231", mobile: "0184532617", street: "١٨ شَارِع النِّيل", floor: "السَّابِع", flat: "٢٠", wrong: ["37485213", "0184532671"] },
];
const pick3 = (right: string, wrong: string) => sorted([right, wrong]);
const CARD_QUIZ: QuizItem[] = CARDS.map((c) => ({
  id: `card-${c.id}`,
  arabic: `(${c.id === "a" ? "أ" : c.id === "b" ? "ب" : c.id === "c" ? "ج" : c.id === "d" ? "د" : c.id === "e" ? "هـ" : c.id === "f" ? "و" : "ز"}) ${c.who} – ${c.job}`,
  spoken: spokenDigits(c.text),
  german: "Hör zu und wähle die Nummern.",
  questions: [
    { prompt: "تِلِيفُون", options: pick3(num(c.phone), num(c.wrong[0]!)), answer: pick3(num(c.phone), num(c.wrong[0]!)).indexOf(num(c.phone)) },
    ...(c.mobile ? [{ prompt: "مَحْمُول", options: pick3(num(c.mobile), num(c.wrong[1]!)), answer: pick3(num(c.mobile), num(c.wrong[1]!)).indexOf(num(c.mobile)) }] : []),
    ...(c.floor ? [{ prompt: "الدَّوْر", options: [c.floor, ...["الثَّانِي", "الثَّالِث", "الرَّابِع", "الْخَامِس", "السَّابِع"].filter((f) => f !== c.floor).slice(0, 2)], answer: 0 }] : []),
    ...(c.flat ? [{ prompt: "شَقَّة", options: sorted([c.flat, toArabicDigits(Number(c.flat.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))) + 2)]), answer: sorted([c.flat, toArabicDigits(Number(c.flat.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))) + 2)]).indexOf(c.flat) }] : []),
  ],
}));

/** تدريب ٢: student (أ) asks about what is missing on their card; the answers are on student (ب)'s card – and back. */
const GAP_A: Array<[q: string, right: string, wrong: string]> = [
  ["مَا رَقْمُ تِلِيفُونِ زَيْدَان عَبَّاس؟", "٠١٢٧٤١٣٩١٨", "٠١٢٧٤١٣٩٨١"],
  ["مَا رَقْمُ مَنْزِلِهِ؟ (زَيْدَان عَبَّاس)", "١٥ شَارِع لِيبْيَا", "٥١ شَارِع لِيبْيَا"],
  ["مَا رَقْمُ تِلِيفُونِ صَفِيَّة عُمْرَان؟", "٠١٨٩٨٦٤٤٣١٢", "٠١٨٩٦٨٤٤٣١٢"],
  ["مَا عُنْوَانُهَا؟ أَيُّ دَوْرٍ؟ (صَفِيَّة عُمْرَان)", "٩ شَارِع الْمَغْرِب، الدَّوْر الْخَامِس", "٩ شَارِع الْمَغْرِب، الدَّوْر الثَّالِث"],
  ["مَا رَقْمُ تِلِيفُونِ سَيِّد عَبْد الْبَاقِي؟", "٠١٨٦٥٤٣٤٨٧", "٠١٨٦٥٤٣٨٤٧"],
  ["مَا عُنْوَانُهُ؟ (سَيِّد عَبْد الْبَاقِي)", "١٢ شَارِع السُّودَان، الدَّوْر الثَّالِث، شَقَّة ١٤", "١٢ شَارِع السُّودَان، الدَّوْر الرَّابِع، شَقَّة ١٤"],
  ["مَا رَقْمُ تِلِيفُونِ زِيَاد شَاهِين؟", "٠١٦٣٥٤٦٨٩٠", "٠١٦٣٥٤٦٩٨٠"],
  ["مَا رَقْمُ مَنْزِلِهِ؟ (زِيَاد شَاهِين)", "١٠ شَارِع الْيَمَن", "١٢ شَارِع الْيَمَن"],
  ["مَا رَقْمُ تِلِيفُونِ أَلْبِير غَسَّان؟", "٠١٦١٧٤٥٥٠٣٦", "٠١٦١٧٤٥٠٥٣٦"],
  ["مَا رَقْمُ مَنْزِلِهِ؟ (أَلْبِير غَسَّان)", "٣ شَارِع فِلَسْطِين", "٨ شَارِع فِلَسْطِين"],
];
const GAP_B: Array<[q: string, right: string, wrong: string]> = [
  ["مَا رَقْمُ تِلِيفُونِ هَاشِم فُؤَاد؟", "٠١٢٣٣٣٩٣٠٦", "٠١٢٣٣٩٣٣٠٦"],
  ["مَا رَقْمُ مَنْزِلِهِ؟ (هَاشِم فُؤَاد)", "١٨ شَارِع نَجِيب مَحْفُوظ", "٨ شَارِع نَجِيب مَحْفُوظ"],
  ["مَا رَقْمُ تِلِيفُونِ يُوسُف لَبِيب؟", "٠١٦٩١٢٤٣٥٦", "٠١٦٩١٢٤٦٥٣"],
  ["مَا عُنْوَانُهُ؟ (يُوسُف لَبِيب)", "١١ شَارِع تُونُس، الدَّوْر الْأَوَّل، شَقَّة ١٢", "١١ شَارِع تُونُس، الدَّوْر الثَّانِي، شَقَّة ٢١"],
  ["مَا رَقْمُ تِلِيفُونِ مَدِيحَة أَبُو سِتَّيْت؟", "٠١٢٣١٩٨٤٩٢", "٠١٢٣١٨٩٤٩٢"],
  ["مَا رَقْمُ مَنْزِلِهَا؟ (مَدِيحَة أَبُو سِتَّيْت)", "١٨ شَارِع الصُّومَال", "١٦ شَارِع الصُّومَال"],
  ["مَا رَقْمُ تِلِيفُونِ نَهْلَة الْخَرَّاط؟", "٠١٨٧٥١٠٢٤٣", "٠١٨٧٥٠١٢٤٣"],
  ["مَا رَقْمُ مَنْزِلِهَا؟ (نَهْلَة الْخَرَّاط)", "٦ شَارِع الْأُرْدُنّ", "٩ شَارِع الْأُرْدُنّ"],
  ["مَا رَقْمُ تِلِيفُونِ هُيَام تَمَّام؟", "٠١٢٢٤٢٥٤٣٩", "٠١٢٢٤٥٢٤٣٩"],
  ["مَا رَقْمُ مَنْزِلِهَا؟ (هُيَام تَمَّام)", "٨ شَارِع سَيْنَاء", "٨٠ شَارِع سَيْنَاء"],
];
const gapQuiz = (side: string) => ([q, right, wrong]: [string, string, string], n: number): QuizItem => {
  const options = sorted([right, wrong]);
  return { id: `${side}-${n + 1}`, arabic: q, spoken: spokenDigits(`${q.replace(/\s*\(.*\)$/, "")} ${right.replace(/،/g, "")}`), german: "Frage – hör die Antwort deines Partners.", show: true, questions: [{ prompt: "Die Antwort:", options, answer: options.indexOf(right) }] };
};

/** تدريب ٣: the arithmetic of the book (1 is the example). */
const SUMS: Array<[a: number, op: "+" | "-" | "÷" | "×", b: number]> = [
  [4, "+", 4], [20, "-", 5], [20, "÷", 2], [6, "÷", 2], [5, "+", 6], [14, "+", 4], [3, "×", 4], [15, "-", 2], [5, "+", 2], [12, "-", 1], [9, "×", 2],
];
const OP_WORD = { "+": "زَائِد", "-": "نَاقِص", "÷": "عَلَى", "×": "فِي" } as const;
const result = (a: number, op: string, b: number) => (op === "+" ? a + b : op === "-" ? a - b : op === "÷" ? a / b : a * b);
const sumLine = ([a, op, b]: (typeof SUMS)[number]) => `${numberWord(a)} ${OP_WORD[op]} ${numberWord(b)} يُسَاوِي ${numberWord(result(a, op, b))}`;
const SUM_ITEMS: ClozeItem[] = SUMS.map(([a, op, b], n) => {
  const r = result(a, op, b);
  const options = sorted([numberWord(r), numberWord(r + 1), numberWord(Math.max(0, r - 2))]);
  return {
    id: `sum-${n + 1}`,
    hint: `${toArabicDigits(a)} ${op} ${toArabicDigits(b)} = ؟`,
    lines: [{ label: toArabicDigits(n + 1), parts: n === 0 ? [sumLine([a, op, b])] : [`${numberWord(a)} ${OP_WORD[op]} ${numberWord(b)} يُسَاوِي `, gap([numberWord(r)], options)] }],
  };
});

export const callNurse: Dialogue = {
  id: "call-clinic",
  intro: "Dialog 1: Eine Frau ruft in der Praxis von Dr. Adham an-Nadim an.",
  speakers: [sp("zubuna", "Die Anruferin", "female-2", "Eine Frau mit langen Haaren am Telefon"), sp("mumarrida", "Die Krankenschwester", "female-1", "Eine Krankenschwester am Schreibtisch")],
  lines: lines([
    ["u6-c1-1", "zubuna", "أَلُو، مَرْحَبًا.", "ألو مرحبا", "Alū, marḥaban.", "Hallo, guten Tag."],
    ["u6-c1-2", "mumarrida", "مَرْحَبًا. أَهْلًا وَسَهْلًا يَا أَفَنْدِم.", "مرحبا أهلا وسهلا يا أفندم", "Marḥaban. Ahlan wa-sahlan yā afandim.", "Guten Tag. Herzlich willkommen, bitte schön."],
    ["u6-c1-3", "zubuna", "هَلْ هَذِهِ عِيَادَةُ دُكْتُور أَدْهَم النَّدِيم؟", "هل هذه عيادة دكتور أدهم النديم", "Hal hādhihi ʿiyādatu duktūr Adham an-Nadīm?", "Ist das die Praxis von Dr. Adham an-Nadim?"],
    ["u6-c1-4", "mumarrida", "نَعَمْ. هَذَا صَحِيحٌ.", "نعم هذا صحيح", "Naʿam. Hādhā ṣaḥīḥ.", "Ja, das stimmt."],
    ["u6-c1-5", "zubuna", "مَا الْعُنْوَانُ وَرَقْمُ الشَّقَّةِ لَوْ سَمَحْتِ؟", "ما العنوان ورقم الشقة لو سمحت", "Ma l-ʿunwānu wa-raqmu sh-shaqqa law samaḥti?", "Wie ist die Adresse und die Wohnungsnummer, bitte?"],
    ["u6-c1-6", "mumarrida", "خَمْسَةَ عَشَرَ شَارِعُ الْبَرَازِيلِ، الدَّوْرُ الرَّابِعُ، شَقَّةُ تِسْعَةَ عَشَرَ.", "خمسة عشر شارع البرازيل الدور الرابع شقة تسعة عشر", "Khamsata ʿashara shāriʿu l-Barāzīl, ad-dawru r-rābiʿ, shaqqatu tisʿata ʿashar.", "Brasilien-Straße 15, vierter Stock, Wohnung 19."],
    ["u6-c1-7", "zubuna", "وَمَا رَقْمُ تِلِيفُونِهِ الْمَحْمُولِ؟", "وما رقم تليفونه المحمول", "Wa-mā raqmu tilīfūnihi l-maḥmūl?", "Und wie ist seine Handynummer?"],
    ["u6-c1-8", "mumarrida", `رَقْمُ تِلِيفُونِهِ ${spokenDigits("0124568911")}.`, "رقم تليفونه صفر واحد اثنان أربعة خمسة ستة ثمانية تسعة واحد واحد", "Raqmu tilīfūnihi 0124568911.", "Seine Nummer ist 0124568911."],
    ["u6-c1-9", "zubuna", "شُكْرًا.", "شكرا", "Shukran.", "Danke."],
    ["u6-c1-10", "mumarrida", "عَفْوًا، أَيَّ خِدْمَةٍ!", "عفوا أي خدمة", "ʿAfwan, ayya khidma!", "Bitte, gern geschehen!"],
  ]),
  question: { prompt: "مَا رَقْمُ تِلِيفُونِ الطَّبِيبِ الْمَحْمُولِ؟", options: ["٠١٢٤٥٦٨٩١١", "٠١٢٤٥٨٦٩١١", "٢٣٤٨٧٦٥٢"], answer: 0 },
};

export const callHospital: Dialogue = {
  id: "call-hospital",
  intro: "Dialog 2: Ein Mann ruft die Auskunft an und fragt nach der Nummer des Krankenhauses „al-Hayat“.",
  speakers: [sp("amil", "Der Anrufer", "male-1", "Ein Mann mit Schnurrbart am Telefon"), sp("amila", "Die Angestellte", "female-2", "Eine Telefonistin mit Headset")],
  lines: lines([
    ["u6-c2-1", "amil", "السَّلَامُ عَلَيْكُمْ.", "السلام عليكم", "As-salāmu ʿalaykum.", "Friede sei mit euch."],
    ["u6-c2-2", "amila", "وَعَلَيْكُمُ السَّلَامُ. أَيَّ خِدْمَةٍ؟", "وعليكم السلام أي خدمة", "Wa-ʿalaykumu s-salām. Ayya khidma?", "Und mit euch sei Friede. Was kann ich für Sie tun?"],
    ["u6-c2-3", "amil", "لَوْ سَمَحْتِ، مَا رَقْمُ تِلِيفُونِ مُسْتَشْفَى الْحَيَاةِ؟", "لو سمحت ما رقم تليفون مستشفى الحياة", "Law samaḥti, mā raqmu tilīfūni mustashfā l-Ḥayāt?", "Entschuldigung, wie ist die Nummer des Krankenhauses al-Hayat?"],
    ["u6-c2-4", "amila", `رَقْمُ تِلِيفُونِهَا ${spokenDigits("23487652")}.`, "رقم تليفونها اثنان ثلاثة أربعة ثمانية سبعة ستة خمسة اثنان", "Raqmu tilīfūnihā 23487652.", "Die Nummer ist 23487652."],
    ["u6-c2-5", "amil", "وَمَا رَقْمُ الْفَاكْسِ؟", "وما رقم الفاكس", "Wa-mā raqmu l-fāks?", "Und die Faxnummer?"],
    ["u6-c2-6", "amila", `رَقْمُ الْفَاكْسِ ${spokenDigits("32564401")}.`, "رقم الفاكس ثلاثة اثنان خمسة ستة أربعة أربعة صفر واحد", "Raqmu l-fāks 32564401.", "Die Faxnummer ist 32564401."],
    ["u6-c2-7", "amil", "شُكْرًا جَزِيلًا.", "شكرا جزيلا", "Shukran jazīlan.", "Vielen Dank."],
    ["u6-c2-8", "amila", "عَفْوًا، مَعَ السَّلَامَةِ.", "عفوا مع السلامة", "ʿAfwan, maʿa s-salāma.", "Bitte, auf Wiedersehen."],
  ]),
  question: { prompt: "مَا رَقْمُ تِلِيفُونِ الْمُسْتَشْفَى؟", options: ["٢٣٤٨٧٦٥٢", "٣٢٥٦٤٤٠١", "٢٣٤٧٨٦٥٢"], answer: 0 },
};

const HISHAM: Array<[arabic: string, german: string]> = [
  ["عَزِيزِي غَسَّان،", "Lieber Ghassan,"],
  ["أَنَا فِي فُنْدُقِ الْوَرْدَةِ الْبَيْضَاءِ الْآنَ. أَنَا فِي حُجْرَةِ رَقْمِ ١٢.", "ich bin jetzt im Hotel „Die weiße Rose“. Ich bin in Zimmer Nr. 12."],
  ["رَقْمُ تِلِيفُونِ الْفُنْدُقِ: ٣٥٤١٣٧٢٨ أَوْ ٣٥٤١٣٧٢٩", "Die Telefonnummer des Hotels: 35413728 oder 35413729"],
  ["وَرَقْمُ تِلِيفُونِي الْمَحْمُولِ: ٠١٨٨٩٥٣٤٢١", "Und meine Handynummer: 0188953421"],
  ["عُنْوَانُ الْفُنْدُقِ: ٢٥ شَارِعُ مَكَّةَ، وَحُجْرَتِي فِي الدَّوْرِ الثَّانِي.", "Die Adresse des Hotels: Mekka-Straße 25, und mein Zimmer ist im zweiten Stock."],
  ["صَدِيقُكَ هِشَام", "Dein Freund Hischam"],
];

export const a1MaRaqm: A1Lesson = {
  slug: "ma-ar-raqm",
  kind: "phrase",
  label: "مَا الرَّقْمُ؟",
  labelGerman: "Wie ist die Nummer?",
  steps: [
    {
      kind: "phrases",
      slug: "step-1",
      title: "Die Visitenkarte",
      navLabel: "Karte",
      instruction: { arabic: "تَقْدِيمٌ (١): مَا الرَّقْمُ؟ ١) اِقْرَأْ هَذِهِ الْبِطَاقَةَ وَادْرُسِ الْكَلِمَاتِ الْجَدِيدَةَ.", german: "Lies die Visitenkarte von Dr. Saif Abdullah und lerne die neuen Wörter. Seine Adresse: Abd-ar-Rahman-ar-Rafii-Straße 12, dritter Stock, Wohnung 3, Gizeh – Kairo. Praxis: ٧٩٨٥٤١٢٦, Handy: ٠١٨٦٩٣٥٢١٤." },
      groups: [{ id: "card", title: "سَيْف عَبْد الله – طَبِيب – جَرَّاح", items: CARD_WORDS.map(([a, g], n) => phrase(`card-${n + 1}`, a, g)) }],
    },
    {
      kind: "phrases",
      slug: "step-2",
      title: "Die Zahlen 0–20",
      navLabel: "Zahlen 0–20",
      instruction: { arabic: "٢) اِقْرَأِ الْأَرْقَامَ.", german: "Lies die Zahlen von 0 bis 20 und sprich sie nach." },
      groups: [
        { id: "0-10", title: "٠ – ١٠", items: Array.from({ length: 11 }, (_, n) => phrase(`n${n}`, numberWord(n), `${toArabicDigits(n)} – ${DE_UNITS[n]}`)) },
        { id: "11-20", title: "١١ – ٢٠", items: Array.from({ length: 10 }, (_, k) => phrase(`n${k + 11}`, numberWord(k + 11), `${toArabicDigits(k + 11)} – ${DE_UNITS[k + 11]}`)) },
      ],
    },
    {
      kind: "phrases",
      slug: "step-3",
      title: "Der erste, der zweite …",
      navLabel: "Ordnungszahlen",
      instruction: { arabic: "٣) الْأَوَّل – الثَّانِي – الثَّالِث – الرَّابِع – الْخَامِس – الْعَاشِر – الْحَادِيَ عَشَرَ – الثَّانِيَ عَشَرَ.", german: "Die Ordnungszahlen: der erste, der zweite … Hör zu und sprich nach." },
      groups: [{ id: "ord", title: "الْأَوَّل … الثَّانِيَ عَشَرَ", items: ORDINALS.slice(1).map((o, n) => phrase(`ord-${n + 1}`, o, DE_ORD[n + 1]!)) }],
    },
    { kind: "dialogue", mode: "listen", slug: "step-4", title: "Anhören: die Handynummer des Arztes", navLabel: "Anhören", instruction: { arabic: "٤) أ – اِسْمَعِ الْحِوَارَ وَأَجِبْ: مَا هُوَ رَقْمُ تِلِيفُونِ الطَّبِيبِ، مَا هُوَ رَقْمُ التِّلِيفُونِ الْمَحْمُولِ؟", german: "Hör die Unterhaltung: Wie ist die Handynummer des Arztes?" }, dialogue: nurseDialogue },
    { kind: "dialogue", mode: "repeat", slug: "step-5", title: "Nachsprechen", navLabel: "Nachsprechen", instruction: { arabic: "ب – اِقْرَأِ الْحِوَارَ وَأَجِبْ.", german: "Sprich jede Zeile nach." }, dialogue: nurseDialogue },
    {
      kind: "cloze",
      slug: "step-6",
      title: "Fragen zur Karte",
      navLabel: "Fragen",
      instruction: { arabic: "١ – كَرِّرْ رَقْمَ الطَّبِيبِ الْمَحْمُولِ مَرَّةً أُخْرَى وَاكْتُبْهُ. ٢ – مَا رَقْمُ الشَّارِعِ؟ ٣ – مَا رَقْمُ الدَّوْرِ؟ مَا رَقْمُ الشَّقَّةِ؟", german: "Antworte mit den Angaben der Karte." },
      items: [
        { id: "mobile", lines: [{ label: "١", parts: ["رَقْمُ الْمَحْمُولِ: ", gap(["٠١٨٦٩٣٥٢١٤"], ["٠١٨٦٩٣٥٢١٤", "٠١٨٦٩٢٥٢١٤", "٧٩٨٥٤١٢٦"])] }] },
        { id: "street", lines: [{ label: "٢", parts: ["رَقْمُ الشَّارِعِ: ", gap(["١٢"], ["١٢", "٣", "٢١"])] }] },
        { id: "floor", lines: [{ label: "٣", parts: ["الدَّوْرُ: ", gap(["الثَّالِث"], ["الثَّالِث", "الثَّانِي", "الْأَوَّل"]), "، رَقْمُ الشَّقَّةِ: ", gap(["٣"], ["٣", "١٢", "٢"])] }] },
      ],
    },
    {
      kind: "table",
      slug: "step-7",
      title: "Grammatik: nach Nummer und Adresse fragen",
      navLabel: "Grammatik",
      instruction: { arabic: "لَاحِظِ الْقَوَاعِدَ: ١) لِلسُّؤَالِ عَنْ رَقْمِ التِّلِيفُونِ · ٢) الْأَوَّل، الثَّانِي … · ٣) لِلسُّؤَالِ عَنْ رَقْمِ الشَّارِعِ أَوِ الْمَنْزِلِ", german: "Achte auf die Regeln: „Wie ist deine / seine / ihre Nummer?“ – und so fragst du nach Straße, Stock und Wohnung." },
      tables: [
        { id: "phone", titleArabic: "١) لِلسُّؤَالِ عَنْ رَقْمِ التِّلِيفُونِ: مَا رَقْمُ تِلِيفُونِكَ؟", title: "Nach der Telefonnummer fragen", columns: [{ arabic: "أَنْتَ", german: "du (Mann)" }, { arabic: "أَنْتِ", german: "du (Frau)" }, { arabic: "هُوَ", german: "er" }, { arabic: "هِيَ", german: "sie" }], rows: [[{ arabic: "مَا رَقْمُ تِلِيفُونِكَ؟", gender: "m" }, { arabic: "مَا رَقْمُ تِلِيفُونِكِ؟", gender: "f" }, { arabic: "مَا رَقْمُ تِلِيفُونِهِ؟" }, { arabic: "مَا رَقْمُ تِلِيفُونِهَا؟" }]] },
        { id: "ordinals", titleArabic: "٢) الْأَوَّل: (١)، الثَّانِي: (٢)، الثَّالِث: (٣)، الرَّابِع: (٤)، الْخَامِس: (٥)، السَّادِس: (٦)، السَّابِع: (٧) … إلخ", title: "Ordnungszahlen", columns: [{ arabic: "", german: "" }, { arabic: "", german: "" }], rows: ORDINALS.slice(1, 8).map((o, n) => [{ arabic: toArabicDigits(n + 1), listen: false }, { arabic: o }]) },
        {
          id: "address",
          titleArabic: "٣) لِلسُّؤَالِ عَنْ رَقْمِ الشَّارِعِ أَوِ الْمَنْزِلِ / الْبَيْتِ:",
          title: "Nach der Adresse fragen",
          columns: [{ arabic: "", german: "" }, { arabic: "السُّؤَالُ", german: "Frage" }],
          rows: [
            [{ arabic: "الشَّارِع / الْمَنْزِل", german: "Straße / Haus", listen: false }, { arabic: "مَا رَقْمُ الشَّارِعِ؟ مَا رَقْمُ الْمَنْزِلِ؟" }],
            [{ arabic: "لِلسُّؤَالِ عَنِ الدَّوْرِ", german: "Stock", listen: false }, { arabic: "أَيُّ دَوْرٍ؟" }],
            [{ arabic: "لِلسُّؤَالِ عَنْ رَقْمِ الشَّقَّةِ", german: "Wohnung", listen: false }, { arabic: "مَا رَقْمُ الشَّقَّةِ؟" }],
          ],
        },
      ],
      quiz: [
        { id: "hiya", prompt: "„Wie ist ihre Telefonnummer?“", options: ["مَا رَقْمُ تِلِيفُونِهِ؟", "مَا رَقْمُ تِلِيفُونِهَا؟", "مَا رَقْمُ تِلِيفُونِكِ؟"], answer: 1 },
        { id: "floor", prompt: "Nach dem Stock fragen:", options: ["أَيُّ دَوْرٍ؟", "مَا رَقْمُ الشَّقَّةِ؟", "مَا الْعُنْوَانُ؟"], answer: 0 },
        { id: "fifth", prompt: "„der fünfte“", options: ["الْخَامِس", "خَمْسَة", "الْخَمِيس"], answer: 0 },
      ],
    },
    { kind: "quiz", slug: "step-8", title: "Übung 1: Hör zu und schreib die Nummern", navLabel: "Übung 1", instruction: { arabic: "التَّدْرِيبَاتُ · تَدْرِيبٌ (١): اِسْتَمِعْ لِلْمَعْلُومَاتِ ثُمَّ اكْتُبِ الْأَرْقَامَ.", german: "Übung 1: Hör dir die Angaben zu jeder Visitenkarte an und wähle die richtigen Nummern.", note: "Die Hörtexte stehen im Buch auf S. 193–194. Bei Karte (هـ) nennt die Aufnahme nur die Telefonnummer." }, items: CARD_QUIZ },
    { kind: "quiz", slug: "step-9", title: "Übung 2 (أ): Frag nach Telefon und Haus", navLabel: "Übung 2 (أ)", instruction: { arabic: "تَدْرِيبٌ (٢): أ – اِسْأَلْ عَنْ رَقْمِ التِّلِيفُونِ وَالْمَنْزِلِ. مِثَال: طَالِب (أ): مَا رَقْمُ تِلِيفُونِ زَيْدَان عَبَّاس؟ … طَالِب (ب): رَقْمُ تِلِيفُونِهِ ٠١٢٧٤١٣٩١٨ … ب – اُكْتُبِ الْمَعْلُومَاتِ النَّاقِصَةَ.", german: "Übung 2: Du bist Student (أ). Auf deiner Karte fehlen Angaben – frag deinen Partner und hör seine Antwort.", note: "Die Antworten stehen auf der Karte von Student (ب) im Buch (S. 184)." }, items: GAP_A.map(gapQuiz("a")) },
    { kind: "quiz", slug: "step-10", title: "Übung 2 (ب): jetzt fragt der Partner", navLabel: "Übung 2 (ب)", instruction: { arabic: "طَالِب (ب)", german: "Jetzt bist du Student (ب): Frag nach den Angaben, die auf deiner Karte fehlen.", note: "Die Antworten stehen auf der Karte von Student (أ) im Buch (S. 183). Bei Nr. 10 (هُيَام تَمَّام) druckt das Buch „١)“." }, items: GAP_B.map(gapQuiz("b")) },
    { kind: "cloze", slug: "step-11", title: "Übung 3: Rechnen", navLabel: "Übung 3", instruction: { arabic: "تَدْرِيبٌ (٣): اُكْتُبِ الرَّقْمَ وَانْطِقْ كَالْمِثَالِ: ٤ + ٤ = أَرْبَعَة زَائِد أَرْبَعَة يُسَاوِي ثَمَانِيَة", german: "Übung 3: Rechne und schreib das Ergebnis als Wort. Dann hör dir den ganzen Satz an.", note: "Nützliche Wörter: + زَائِد, – نَاقِص, ÷ عَلَى, × فِي, = يُسَاوِي." }, items: SUM_ITEMS },
    {
      kind: "phrases",
      slug: "step-12",
      title: "Übung 3: laut rechnen",
      navLabel: "Übung 3 (sprechen)",
      instruction: { arabic: "… وَانْطِقْ.", german: "Sprich jede Rechnung laut – mit dem Ergebnis." },
      groups: [{ id: "sums", title: "Rechnungen", items: SUMS.map((s, n) => phrase(`sum-${n + 1}`, sumLine(s), `${s[0]} ${s[1]} ${s[2]} = ${result(...s)}`)) }],
    },
    {
      kind: "quiz",
      slug: "step-13",
      title: "Übung 4 (1): Welcher Dialog?",
      navLabel: "Übung 4 (1)",
      instruction: { arabic: "تَدْرِيبٌ (٤): ١) اِسْمَعْ وَاكْتُبْ رَقْمَ الْحِوَارِ.", german: "Übung 4: Zwei Bilder, zwei Telefongespräche. Welches Bild gehört zu welchem Dialog?", note: "Nützliche Wörter: مَرْحَبًا – عِيَادَة (Praxis) – يَا أَفَنْدِم (bitte schön, höflich) – مُسْتَشْفَى (Krankenhaus)." },
      items: [
        { id: "pic-right", arabic: "صُورَة: مُمَرِّضَة وَرَجُل عَلَى التِّلِيفُون", german: "Bild rechts: eine Krankenschwester, am Telefon ein Mann", show: true, image: { src: `${IMG}/call-man.svg`, alt: "Eine Krankenschwester telefoniert mit einem Mann" }, questions: [{ prompt: "Dialog:", options: ["حِوَار (١)", "حِوَار (٢)"], answer: 1 }] },
        { id: "pic-left", arabic: "صُورَة: مُمَرِّضَة وَسَيِّدَة عَلَى التِّلِيفُون", german: "Bild links: eine Krankenschwester am Schreibtisch, am Telefon eine Frau", show: true, image: { src: `${IMG}/call-woman.svg`, alt: "Eine Krankenschwester am Schreibtisch telefoniert mit einer Frau" }, questions: [{ prompt: "Dialog:", options: ["حِوَار (١)", "حِوَار (٢)"], answer: 0 }] },
      ],
    },
    { kind: "dialogue", mode: "listen", slug: "step-14", title: "Übung 4 (2): Dialog 1 – Anhören", navLabel: "Dialog 1", instruction: { arabic: "٢) اِسْمَعْ مَرَّةً أُخْرَى ثُمَّ أَجِبْ: [أ] حِوَار (١): ١) مَا رَقْمُ تِلِيفُونِ الطَّبِيبِ الْمَحْمُولِ؟ ٢) مَا عُنْوَانُهُ؟", german: "Hör Dialog 1: Wie ist die Handynummer des Arztes? Wie ist seine Adresse?", note: "Der Text steht im Buch auf S. 194–195." }, dialogue: callNurse },
    { kind: "dialogue", mode: "listen", slug: "step-15", title: "Übung 4 (2): Dialog 2 – Anhören", navLabel: "Dialog 2", instruction: { arabic: "[ب] حِوَار (٢): ١ – مَا رَقْمُ تِلِيفُونِ الْمُسْتَشْفَى؟ ٢ – مَا رَقْمُ الْفَاكْسِ؟", german: "Hör Dialog 2: Wie ist die Nummer des Krankenhauses? Und die Faxnummer?" }, dialogue: callHospital },
    {
      kind: "cloze",
      slug: "step-16",
      title: "Übung 4 (2) und (3): Antworten und Grüße",
      navLabel: "Übung 4 (3)",
      instruction: { arabic: "٣) اُكْتُبْ أَنْوَاعَ التَّحِيَّاتِ الَّتِي سَمِعْتَهَا: التَّحِيَّةُ – الرَّدُّ", german: "Antworte auf die Fragen zu den Dialogen und schreib die Grüße mit ihren Antworten." },
      items: [
        { id: "addr", lines: [{ label: "[أ] ٢", parts: ["عُنْوَانُهُ ", gap(["١٥ شَارِعُ الْبَرَازِيلِ، الدَّوْرُ الرَّابِعُ، شَقَّةُ ١٩."], ["١٥ شَارِعُ الْبَرَازِيلِ، الدَّوْرُ الرَّابِعُ، شَقَّةُ ١٩.", "١٩ شَارِعُ الْبَرَازِيلِ، الدَّوْرُ الرَّابِعُ، شَقَّةُ ١٥.", "١٥ شَارِعُ الْبَرَازِيلِ، الدَّوْرُ الْخَامِسُ، شَقَّةُ ١٩."])] }] },
        { id: "fax", lines: [{ label: "[ب] ٢", parts: ["رَقْمُ الْفَاكْسِ ", gap(["٣٢٥٦٤٤٠١"], ["٣٢٥٦٤٤٠١", "٢٣٤٨٧٦٥٢", "٣٢٥٦٤٠٤١"])] }] },
        { id: "g1", hint: "Beispiel im Buch", lines: [{ label: "التَّحِيَّة", parts: ["مَرْحَبًا."] }, { label: "الرَّدّ", parts: [gap(["مَرْحَبًا. أَهْلًا وَسَهْلًا يَا أَفَنْدِم."], ["مَرْحَبًا. أَهْلًا وَسَهْلًا يَا أَفَنْدِم.", "وَعَلَيْكُمُ السَّلَامُ.", "عَفْوًا."])] }] },
        { id: "g2", lines: [{ label: "التَّحِيَّة", parts: ["السَّلَامُ عَلَيْكُمْ."] }, { label: "الرَّدّ", parts: [gap(["وَعَلَيْكُمُ السَّلَامُ."], ["وَعَلَيْكُمُ السَّلَامُ.", "مَرْحَبًا.", "شُكْرًا."])] }] },
        { id: "g3", lines: [{ label: "التَّحِيَّة", parts: ["شُكْرًا جَزِيلًا."] }, { label: "الرَّدّ", parts: [gap(["عَفْوًا، مَعَ السَّلَامَةِ.", "عَفْوًا، أَيَّ خِدْمَةٍ!"], ["عَفْوًا، مَعَ السَّلَامَةِ.", "عَفْوًا، أَيَّ خِدْمَةٍ!", "وَعَلَيْكُمُ السَّلَامُ."])] }] },
      ],
    },
    {
      kind: "cloze",
      slug: "step-17",
      title: "Übung 4 (4): beim Telefonamt",
      navLabel: "Übung 4 (4)",
      instruction: { arabic: "٤) أَكْمِلْ هَذَا الْحِوَارَ مِثْلَ الْحِوَارَاتِ السَّابِقَةِ مَعَ شَرِكَةِ التِّلِيفُونِ.", german: "Ergänze den Anruf bei der Telefonauskunft – wie in den Dialogen vorher.", note: "Die Nummern lässt das Buch offen; Alif nimmt die Nummern aus Dialog 2 (Krankenhaus al-Hayat → hier al-Schifa)." },
      items: [{
        id: "company",
        lines: [
          { label: "عَمِيل", parts: ["أَلُو، ", gap(["السَّلَامُ عَلَيْكُمْ."], ["السَّلَامُ عَلَيْكُمْ.", "وَعَلَيْكُمُ السَّلَامُ.", "عَفْوًا."])] },
          { label: "عَامِلَة", parts: ["وَعَلَيْكُمُ ", gap(["السَّلَامُ. أَيَّ خِدْمَةٍ؟"], ["السَّلَامُ. أَيَّ خِدْمَةٍ؟", "السَّلَامُ. مَعَ السَّلَامَةِ."])] },
          { label: "عَمِيل", parts: ["لَوْ ", gap(["سَمَحْتِ"], ["سَمَحْتِ", "سَمَحْتَ"]), "، مَا ", gap(["رَقْمُ تِلِيفُونِ"], ["رَقْمُ تِلِيفُونِ", "عُنْوَانُ"]), " مُسْتَشْفَى الشِّفَاءِ؟"] },
          { label: "عَامِلَة", parts: ["رَقْمُ ", gap(["تِلِيفُونِهَا"], ["تِلِيفُونِهَا", "تِلِيفُونِهِ"]), " ٢٣٤٨٧٦٥٢."] },
          { label: "عَمِيل", parts: ["وَمَا ", gap(["عُنْوَانُهَا"], ["عُنْوَانُهَا", "عُنْوَانُهُ"]), "؟ وَمَا هُوَ ", gap(["رَقْمُ الْفَاكْسِ"], ["رَقْمُ الْفَاكْسِ", "الدَّوْرُ"]), "؟"] },
          { label: "عَامِلَة", parts: [gap(["عُنْوَانُهَا"], ["عُنْوَانُهَا", "رَقْمُهَا"]), " شَارِعُ مُرَاد."] },
          { label: "عَمِيل", parts: ["شُكْرًا."] },
          { label: "عَامِلَة", parts: [gap(["عَفْوًا، مَعَ السَّلَامَةِ."], ["عَفْوًا، مَعَ السَّلَامَةِ.", "وَعَلَيْكُمُ السَّلَامُ."])] },
        ],
      }],
    },
    { kind: "dialogue", mode: "roleplay", slug: "step-18", title: "Übung 4 (5): Rollenspiel", navLabel: "Rollenspiel", instruction: { arabic: "٥) كَرِّرِ الْحِوَارَ مَعَ زَمِيلِكَ.", german: "Spiel das Telefongespräch: du rufst an oder du bist die Angestellte.", note: "Übung 5 im Buch („اُدْخُلْ إِلَى الْمَوْقِعِ“) ist auf der Website des Verlags." }, dialogue: callHospital },
    {
      kind: "phrases",
      slug: "step-19",
      title: "Übung 6: Hischams Nachricht",
      navLabel: "Übung 6 (lesen)",
      instruction: { arabic: "تَدْرِيبٌ (٦): اِقْرَأْ هَذِهِ الرِّسَالَةَ مِنْ هِشَام لِصَدِيقِهِ غَسَّان. أَجِبْ: مَا اسْمُ الْفُنْدُقِ؟", german: "Übung 6: Lies Hischams Nachricht an seinen Freund Ghassan und sprich sie nach. Wie heißt das Hotel?", note: "Nützliche Wörter: الْوَرْدَةُ الْبَيْضَاءُ (die weiße Rose) – الْآنَ (jetzt) – عَزِيزِي (mein Lieber)." },
      groups: [{ id: "hisham", title: "عَزِيزِي غَسَّان", items: HISHAM.map(([a, g], n) => phrase(`hisham-${n + 1}`, a, g, spokenDigits(a))) }],
    },
    {
      kind: "cloze",
      slug: "step-20",
      title: "Übung 6: Fragen zur Nachricht",
      navLabel: "Übung 6 (Fragen)",
      instruction: { arabic: "اِقْرَأْ مَرَّةً ثَانِيَةً وَأَجِبْ: ١) مَا رَقْمُ الْحُجْرَةِ؟ وَالدَّوْرُ؟ ٢) مَا رَقْمُ تِلِيفُونِ الْفُنْدُقِ؟ ٣) مَا رَقْمُ تِلِيفُونِهِ الْمَحْمُولِ؟", german: "Lies noch einmal und antworte." },
      items: [
        { id: "hotel", lines: [{ label: "", parts: ["اسْمُ الْفُنْدُقِ: ", gap(["الْوَرْدَةُ الْبَيْضَاءُ"], ["الْوَرْدَةُ الْبَيْضَاءُ", "مَكَّة", "غَسَّان"])] }] },
        { id: "room", lines: [{ label: "١", parts: ["رَقْمُ الْحُجْرَةِ ", gap(["١٢"], ["١٢", "٢٥", "٢"]), "، الدَّوْرُ ", gap(["الثَّانِي"], ["الثَّانِي", "الثَّانِيَ عَشَرَ", "الْخَامِس"])] }] },
        { id: "hphone", lines: [{ label: "٢", parts: ["رَقْمُ تِلِيفُونِ الْفُنْدُقِ: ", gap(["٣٥٤١٣٧٢٨ أَوْ ٣٥٤١٣٧٢٩"], ["٣٥٤١٣٧٢٨ أَوْ ٣٥٤١٣٧٢٩", "٠١٨٨٩٥٣٤٢١", "٣٥٤١٣٨٢٧"])] }] },
        { id: "hmobile", lines: [{ label: "٣", parts: ["رَقْمُ تِلِيفُونِهِ الْمَحْمُولِ: ", gap(["٠١٨٨٩٥٣٤٢١"], ["٠١٨٨٩٥٣٤٢١", "٠١٨٨٩٣٥٤٢١", "٣٥٤١٣٧٢٩"])] }] },
      ],
    },
    {
      kind: "cloze",
      slug: "step-21",
      title: "Übung 7: eine Nachricht mit der Karte des Instituts",
      navLabel: "Übung 7",
      instruction: { arabic: "تَدْرِيبٌ (٧): اُكْتُبْ رِسَالَةً قَصِيرَةً إِلَى صَدِيقِكَ / صَدِيقَتِكَ مِثْلَ الرِّسَالَةِ الَّتِي دَرَسْتَهَا، اِسْتَعْمِلْ بِطَاقَةَ الْمَعْهَدِ الدَّوْلِيِّ لِمَلْءِ الْمَعْلُومَاتِ.", german: "Übung 7: Schreib eine kurze Nachricht mit den Angaben der Karte: International Language Institute, 4 Mahmoud Azmy Street, Tel. 3346 3087 / 3302 8358, Fax 3303 5624.", note: "Nützliche Wörter: الْمَعْهَدُ الدَّوْلِيُّ لِلُّغَاتِ (das Internationale Sprachinstitut) – بِطَاقَة = كَارْت (Karte). Den Namen und deine Handynummer wählst du frei – die Handynummer steht nicht auf der Karte." },
      items: [{
        id: "note",
        lines: [
          { label: "", parts: [gap(["عَزِيزِي", "عَزِيزَتِي"], ["عَزِيزِي", "عَزِيزَتِي"]), " …،"] },
          { label: "", parts: ["أَنَا ", gap(["الْآنَ"], ["الْآنَ", "شَارِع"]), " فِي الْمَعْهَدِ الدَّوْلِيِّ لِلُّغَاتِ وَرَقْمُ تِلِيفُونِ الْمَعْهَدِ ", gap(["٣٣٤٦٣٠٨٧"], ["٣٣٤٦٣٠٨٧", "٣٣٠٣٥٦٢٤", "١٢٤١١"])] },
          { label: "", parts: ["أَوْ ", gap(["٣٣٠٢٨٣٥٨"], ["٣٣٠٢٨٣٥٨", "٣٣٠٣٥٦٢٤"]), "، رَقْمُ الْفَاكْسِ ", gap(["٣٣٠٣٥٦٢٤"], ["٣٣٠٣٥٦٢٤", "٣٣٤٦٣٠٨٧"])] },
          { label: "", parts: ["الْعُنْوَانُ ", gap(["٤"], ["٤", "١٣"]), " شَارِعُ ", gap(["مَحْمُود عَزْمِي"], ["مَحْمُود عَزْمِي", "الصَّحَفِيِّين", "إِمْبَابَة"])] },
        ],
      }],
    },
    {
      kind: "cloze",
      slug: "step-22",
      title: "Übung 8: Fragen zur Karte",
      navLabel: "Übung 8",
      instruction: { arabic: "تَدْرِيبٌ (٨): ١ – كَوِّنْ أَسْئِلَةً مِنَ الْمَعْلُومَاتِ السَّابِقَةِ فِي الْبِطَاقَةِ فِي تَدْرِيبِ (٧). مِثَال: اِسْأَلْ عَنْ رَقْمِ تِلِيفُونِ الْمَعْهَدِ: مَا رَقْمُ تِلِيفُونِ الْمَعْهَدِ؟", german: "Übung 8: Bilde die Fragen zu den Angaben der Karte.", note: "Teil 2 (Student A fragt, Student B antwortet mit der Karte) braucht einen Partner." },
      items: [
        ["رَقْم تِلِيفُون الْمَعْهَد", "مَا رَقْمُ تِلِيفُونِ الْمَعْهَدِ؟"],
        ["الْفَاكْس", "مَا رَقْمُ الْفَاكْسِ؟"],
        ["الْعُنْوَان", "مَا عُنْوَانُ الْمَعْهَدِ؟"],
        ["الْمَحْمُول", "مَا رَقْمُ تِلِيفُونِكَ الْمَحْمُولِ؟"],
      ].map(([about, q], n) => ({ id: `q${n + 1}`, hint: n === 0 ? "Beispiel im Buch" : undefined, lines: [{ label: `اِسْأَلْ عَنْ ${about}:`, parts: n === 0 ? [q!] : [gap([q!], sorted(["مَا رَقْمُ تِلِيفُونِ الْمَعْهَدِ؟", "مَا رَقْمُ الْفَاكْسِ؟", "مَا عُنْوَانُ الْمَعْهَدِ؟", "مَا رَقْمُ تِلِيفُونِكَ الْمَحْمُولِ؟"]))] }] })),
    },
    {
      kind: "quiz",
      slug: "step-23",
      title: "Gespräch: Dianas Anmeldeformular",
      navLabel: "Formular",
      instruction: { arabic: "الْمُحَادَثَةُ · تَدْرِيبٌ (١): اِقْرَأْ هَذِهِ الِاسْتِمَارَةَ ثُمَّ أَجِبْ: ١) مَا اسْمُ الطَّالِبَةِ؟ ٢) مَا اسْمُ جَامِعَتِهَا؟ ٣) ضَعْ عَلَامَةَ ✓ (الِاسْتِمَارَةُ بِهَا): الْعُنْوَان – رَقْم الْمَحْمُول – تَارِيخ الْمِيلَاد. ٥) مَنْ هِيَ دِيَانَا؟", german: "Lies Dianas Anmeldeformular (Familienname: James Wood, Vorname: Diana, Nationalität: Amerikanerin, Beruf: Studentin, Adresse in Kairo: 22 Syria-Straße, al-Muhandisin; Universität: George Washington) und antworte.", note: "Nützliche Wörter: تَارِيخُ الْمِيلَادِ (Geburtsdatum) – بِطَاقَةُ ائْتِمَانٍ (Kreditkarte) – اسْتِمَارَة (Formular) – تَسْجِيل (Anmeldung) – تَخَرُّج (Abschluss). Teil 4, 6 und 7 (eigene Fragen stellen) und Übung 2–3 (dein eigenes Formular, ein Klassenverzeichnis) brauchen deine eigenen Angaben bzw. eine Klasse." },
      items: [
        { id: "name", arabic: "مَا اسْمُ الطَّالِبَةِ؟", questions: [{ prompt: "Die Antwort:", options: ["دِيَانَا جِيمْس وُود", "جُون دِمْيَان", "عَبْد الله السُّوَيْفِي"], answer: 0 }] },
        { id: "uni", arabic: "مَا اسْمُ جَامِعَتِهَا؟", questions: [{ prompt: "Die Antwort:", options: ["جَامِعَةُ الْقَاهِرَةِ", "جَامِعَةُ جُورْج وَاشِنْطُن", "الْمَعْهَدُ الدَّوْلِيُّ"], answer: 1 }] },
        { id: "addr", arabic: "الْعُنْوَانُ", questions: [{ prompt: "Steht es im Formular?", options: ["✓ ja", "✗ nein"], answer: 0 }] },
        { id: "mobile", arabic: "رَقْمُ الْمَحْمُولِ", questions: [{ prompt: "Steht es im Formular?", options: ["✓ ja", "✗ nein"], answer: 0 }] },
        { id: "birth", arabic: "تَارِيخُ الْمِيلَادِ", questions: [{ prompt: "Steht es im Formular?", options: ["✓ ja", "✗ nein"], answer: 1 }] },
        { id: "who", arabic: "مَنْ هِيَ دِيَانَا؟", questions: [{ prompt: "Wer ist Diana? (Sie ist Studentin.)", options: ["(١) eine ältere Frau", "(٢) ein Mann im Anzug", "(٣) ein Mädchen", "(٤) eine junge Frau"], answer: 3 }] },
      ],
    },
  ],
};

