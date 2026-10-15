import type { A1Lesson, A1Word, ClozeItem, ClozePart, Dialogue, DialogueSpeaker, PhraseItem, QuizItem, TableCell } from "@/data/types";
import { numberWord, spokenDigits, toArabicDigits, TENS } from "@/lib/arabic/numbers";
import { transliterate } from "@/lib/arabic/transliterate";

import { unvocalised } from "../letter-lesson";
import { lines } from "../sabah-al-khayr";

// Unit 6 · تقديم (٢) "مَا الْيَوْمُ؟" (book pages 196–205, PDF 228–237): the
// calendar, the numbers 40–100, the time (كَمِ السَّاعَةُ؟), لاحظ القواعد,
// تدريب ١–٥ (٥: Raif's train), المحادثة ١ (Majid Ziyad's diary – info gap),
// ٢ (train tickets – info gap), تذكر.

const IMG = "/images/a1/unit-6";
const gap = (accept: string[], options: string[]): ClozePart => ({ accept, options });
const sorted = (xs: string[]) => [...new Set(xs)].sort((a, b) => a.localeCompare(b, "ar"));
const sp = (id: string, name: string, voice: DialogueSpeaker["voice"], alt: string): DialogueSpeaker => ({ id, name, voice, avatar: { src: `${IMG}/${id}.svg`, alt } });
const phrase = (id: string, arabic: string, german: string): PhraseItem => ({ id, arabic, transliteration: transliterate(arabic), german, exercise: { id, target: unvocalised(arabic).replace(/[.؟?!،,:]/g, "").replace(/\s+/g, " ").trim(), modelText: arabic } });

export const DAYS: Array<[arabic: string, german: string]> = [
  ["الْأَحَد", "Sonntag"], ["الِاثْنَيْن", "Montag"], ["الثُّلَاثَاء", "Dienstag"], ["الْأَرْبِعَاء", "Mittwoch"], ["الْخَمِيس", "Donnerstag"], ["الْجُمْعَة", "Freitag"], ["السَّبْت", "Samstag"],
];

/** The hour as the book writes it (feminine ordinal: السَّاعَةُ الْعَاشِرَةُ). */
const HOURS = ["", "الْوَاحِدَة", "الثَّانِيَة", "الثَّالِثَة", "الرَّابِعَة", "الْخَامِسَة", "السَّادِسَة", "السَّابِعَة", "الثَّامِنَة", "التَّاسِعَة", "الْعَاشِرَة", "الْحَادِيَة عَشْرَة", "الثَّانِيَة عَشْرَة"];
const next = (h: number) => (h % 12) + 1;
/** The book's way of telling the time (pages 197, 198, 205). */
export function timeWords(h: number, m: number): string {
  const H = HOURS[h]!;
  switch (m) {
    case 0: return `${H} بِالضَّبْطِ`;
    case 5: return `${H} وَخَمْسُ دَقَائِقَ`;
    case 10: return `${H} وَعَشْرُ دَقَائِقَ`;
    case 15: return `${H} وَالرُّبْعُ`;
    case 20: return `${H} وَالثُّلْثُ`;
    case 25: return `${H} وَالنِّصْفُ إِلَّا خَمْسَ دَقَائِقَ`;
    case 30: return `${H} وَالنِّصْفُ`;
    case 35: return `${H} وَالنِّصْفُ وَخَمْسُ دَقَائِقَ`;
    case 40: return `${HOURS[next(h)]} إِلَّا الثُّلْثَ`;
    case 45: return `${HOURS[next(h)]} إِلَّا الرُّبْعَ`;
    case 50: return `${HOURS[next(h)]} إِلَّا عَشْرَ دَقَائِقَ`;
    default: throw new Error(`timeWords ${h}:${m}`);
  }
}
const clock = (h: number, m: number) => ({ src: `${IMG}/clock-${String(h).padStart(2, "0")}${String(m).padStart(2, "0")}.svg`, alt: `Eine Uhr: ${h}:${String(m).padStart(2, "0")}` });
const hm = (h: number, m: number) => `${toArabicDigits(h)},${toArabicDigits(String(m).padStart(2, "0"))}`;
const DE_TIME = (h: number, m: number) => `${h}:${String(m).padStart(2, "0")} Uhr`;

const timeWord = (h: number, m: number, n: number, prefix = true): A1Word => {
  const arabic = `${prefix ? "السَّاعَةُ " : ""}${timeWords(h, m)}`;
  const id = `time-${n}-${h}-${m}`;
  return { id, arabic, german: DE_TIME(h, m), transliteration: transliterate(arabic), image: clock(h, m), exercise: { id, target: unvocalised(arabic), modelText: arabic } };
};

/** (٢) the numbers 40–100: the book prints the tens and some compounds; the other numbers are the gaps. */
const GIVEN = new Set([41, 56, 64, 68, 75, 87]);
const decadeItem = (t: number): ClozeItem => {
  const nums = Array.from({ length: 9 }, (_, k) => t * 10 + k + 1).filter((n) => n < 100);
  return {
    id: `d${t}`,
    hint: `${toArabicDigits(t * 10)} – ${toArabicDigits(t * 10 + 9)}`,
    lines: [
      { label: toArabicDigits(t * 10), parts: [TENS[t]!] },
      ...nums.map((n) => ({ label: toArabicDigits(n), parts: GIVEN.has(n) ? [numberWord(n)] : [gap([numberWord(n)], sorted([numberWord(n), numberWord(n + (n % 10 === 9 ? -1 : 1)), `${numberWord(n % 10 || 1)} وَ${TENS[(t % 9) + 1]}`]))] })),
    ],
  };
};

/** تدريب ١: Alif says one of the two times (the book's CD; its key gives only (أ) ٨,١٥ – Alif speaks the first time of each pair). */
const PAIRS: Array<[a: [number, number], b: [number, number]]> = [
  [[8, 15], [8, 20]], [[9, 30], [9, 40]], [[8, 5], [6, 5]], [[11, 20], [11, 30]], [[12, 25], [12, 35]], [[4, 15], [4, 50]],
];
const LETTERS = ["أ", "ب", "ج", "د", "هـ", "و"];
const LISTEN_TIMES: QuizItem[] = PAIRS.map(([a, b], n) => {
  const options = [hm(...a), hm(...b)];
  return { id: `t${n + 1}`, arabic: `(${LETTERS[n]})`, spoken: `السَّاعَةُ ${timeWords(...a)}`, show: true, german: n === 0 ? "Beispiel im Buch: ٨,١٥ ✓" : undefined, questions: [{ prompt: "Welche Uhrzeit hörst du?", options, answer: 0 }] };
});

/** تدريب ٢: the five clocks of the book (right to left), read from the drawings. */
const CLOCKS_EX2: Array<[number, number]> = [[2, 0], [6, 35], [7, 15], [10, 5], [12, 0]];
/** تدريب ٣: read the time – and find the clock. */
const EX3: Array<[number, number]> = [[1, 30], [5, 15], [8, 25], [10, 40], [2, 35]];
const EX3_DISTRACT: Record<string, Array<[number, number]>> = { "1:30": [[6, 5], [1, 0]], "5:15": [[3, 25], [5, 0]], "8:25": [[5, 40], [8, 0]], "10:40": [[8, 50], [10, 20]], "2:35": [[7, 10], [2, 0]] };
const clockSrc = ([h, m]: [number, number]) => clock(h, m).src;

export const raifMuna: Dialogue = {
  id: "raif-muna",
  intro: "Am Bahnhof: Herr Raif fragt Fräulein Muna nach der Abfahrt des Zuges.",
  speakers: [sp("raif", "Raif", "male-1", "Herr Raif, ein Reisender mit Brille"), sp("muna", "Muna", "female-1", "Fräulein Muna, eine junge Frau")],
  lines: lines([
    ["u6-rm-1", "raif", "يَا آنِسَة مُنَى، مَا مَوْعِدُ قِيَامِ الْقِطَارِ؟", "يا آنسة منى ما موعد قيام القطار", "Yā ānisa Munā, mā mawʿidu qiyāmi l-qiṭār?", "Fräulein Muna, wann fährt der Zug ab?"],
    ["u6-rm-2", "muna", "مَوْعِدُ قِيَامِ الْقِطَارِ السَّاعَةُ السَّابِعَةُ مَسَاءً.", "موعد قيام القطار الساعة السابعة مساء", "Mawʿidu qiyāmi l-qiṭāri s-sāʿatu s-sābiʿatu masāʾan.", "Der Zug fährt um sieben Uhr abends ab."],
  ]),
  question: { prompt: "مَا مَوْعِدُ قِيَامِ الْقِطَارِ؟", options: ["السَّابِعَةُ مَسَاءً", "السَّابِعَةُ صَبَاحًا", "السَّادِسَةُ مَسَاءً"], answer: 0 },
};

/** The two tickets: (ب) Alexandria → Cairo (pages 201 and 203), (أ) Sohag → Cairo (page 203). */
const TICKET_B = { from: "الْإِسْكَنْدَرِيَّة", to: "الْقَاهِرَة", train: "٩٢٦", coach: "٦", seat: "٥٥", time: "السَّابِعَة مَسَاءً (١٩,٠٠)", cls: "أُولَى مُكَيَّفَة", price: "٤٦ جُنَيْهًا", serial: "١٣٩٨٤٥٦١١٣", date: "٦/٩/٢٠٠٨" };
const TICKET_A = { from: "سُوهَاج", to: "الْقَاهِرَة", train: "٩٨٣", coach: "٧", seat: "٣٠", time: "الثَّالِثَة عَصْرًا (١٥,٠٠)", cls: "ثَانِيَة مُكَيَّفَة", price: "٣٨ جُنَيْهًا" };

const TICKET_QUESTIONS: ClozeItem[] = [
  { id: "train", lines: [{ label: "١", parts: ["مَا رَقْمُ الْقِطَارِ؟ ", gap([TICKET_B.train], [TICKET_B.train, "٠٥٥", "٠٦"])] }] },
  { id: "coach", lines: [{ label: "٢", parts: ["مَا رَقْمُ الْعَرَبَةِ؟ ", gap([TICKET_B.coach], [TICKET_B.coach, "٥٥", "٩٢٦"])] }] },
  { id: "seat", lines: [{ label: "٣", parts: ["مَا رَقْمُ الْمَقْعَدِ؟ ", gap([TICKET_B.seat], [TICKET_B.seat, "٦", "٤٦"])] }] },
  { id: "route", lines: [{ label: "٤", parts: ["الرِّحْلَةُ مِنْ ", gap([TICKET_B.from], [TICKET_B.from, TICKET_B.to, "سُوهَاج"]), " إِلَى ", gap([TICKET_B.to], [TICKET_B.to, TICKET_B.from, "أَسْوَان"])] }] },
  { id: "serial", lines: [{ label: "٥", parts: ["مُسَلْسَلُ التَّذْكِرَةِ: ", gap([TICKET_B.serial], [TICKET_B.serial, "١٣٩٨٤٥٦١٣١", "٠٠٠٠٠٨٣٩٧٩٩٥٨٢"])] }] },
  { id: "date", lines: [{ label: "٦", parts: ["تَارِيخُ الْإِصْدَارِ: ", gap([TICKET_B.date], [TICKET_B.date, "٧/١١/٢٠٠٨", "٩/٦/٢٠٠٨"])] }] },
  { id: "class", lines: [{ label: "٧", parts: ["الدَّرَجَةُ: ", gap([TICKET_B.cls], [TICKET_B.cls, "ثَانِيَة مُكَيَّفَة", "ثَالِثَة"])] }] },
  { id: "price", lines: [{ label: "٨", parts: ["السِّعْرُ: ", gap([TICKET_B.price], [TICKET_B.price, "٣٨ جُنَيْهًا", "٥٥ جُنَيْهًا"])] }] },
];

/** المحادثة · تدريب ١: Majid Ziyad's diary – student (أ) asks about the appointments on student (ب)'s page. */
const DIARY_B: Array<[day: number, date: number, what: string, time: string, de: string]> = [
  [0, 1, "النَّادِي", "٨,٣٠ مَسَاءً", "Klub"],
  [4, 5, "مَكْتَب الْمُحَامِي", "٢,٣٠ ظُهْرًا", "Anwaltsbüro"],
  [6, 7, "تِنِس", "٦,١٥ صَبَاحًا", "Tennis"],
  [3, 11, "طَبِيب الْأَسْنَان", "٩,١٥ مَسَاءً", "Zahnarzt"],
  [5, 13, "زِيَارَة", "٥,٣٠ مَسَاءً", "Besuch"],
  [0, 15, "سِينِمَا", "٧ مَسَاءً", "Kino"],
  [3, 18, "مَكْتَب الشَّرِكَة", "١٢ ظُهْرًا", "Firmenbüro"],
  [5, 20, "شَرِكَة السَّلَام", "١,٣٠ ظُهْرًا", "Firma as-Salam"],
  [6, 21, "أَسْوَان", "٦ صَبَاحًا", "Assuan"],
  [2, 24, "الْبَنْك", "١٢ ظُهْرًا", "Bank"],
];
const WHATS = DIARY_B.map((d) => d[2]);
const DIARY_QUIZ: QuizItem[] = DIARY_B.map(([day, date, what, time], n) => {
  const options = sorted([what, WHATS[(n + 3) % WHATS.length]!, WHATS[(n + 6) % WHATS.length]!]);
  return {
    id: `diary-${n + 1}`,
    arabic: `مَا الْمَوْعِدُ يَوْمَ ${DAYS[day]![0]} ${toArabicDigits(date)}؟`,
    spoken: spokenDigits(`مَا الْمَوْعِدُ يَوْمَ ${DAYS[day]![0]} ${date}؟ ${DAYS[day]![0]} ${date} مَوْعِدٌ: ${what}، ${time.replace(/[٠-٩]+,[٠-٩]+|[٠-٩]+/, (t) => t)}`.replace(/,/g, " وَ")),
    german: `Termin am ${DAYS[day]![1]}, den ${date}. – ${time}`,
    show: true,
    questions: [{ prompt: "Was ist der Termin?", options, answer: options.indexOf(what) }],
  };
});

const TICKET_GAP: QuizItem[] = (
  [
    ["السَّفَرُ مِنْ … إِلَى …", `${TICKET_A.from} → ${TICKET_A.to}`, [`${TICKET_B.from} → ${TICKET_B.to}`, `${TICKET_A.to} → ${TICKET_A.from}`]],
    ["رَقْمُ الْمَقْعَدِ", TICKET_A.seat, ["٧", "٥٥"]],
    ["رَقْمُ الْعَرَبَةِ", TICKET_A.coach, ["٣٠", "٦"]],
    ["رَقْمُ الْقِطَارِ", TICKET_A.train, ["٩٢٦", "٣٨"]],
    ["مَوْعِدُ الْقِطَارِ", TICKET_A.time, [TICKET_B.time]],
    ["الدَّرَجَةُ", TICKET_A.cls, [TICKET_B.cls]],
    ["السِّعْرُ", TICKET_A.price, [TICKET_B.price]],
  ] as Array<[string, string, string[]]>
).map(([q, right, wrong], n) => {
  const options = sorted([right, ...wrong]);
  return { id: `ticket-${n + 1}`, arabic: q, spoken: spokenDigits(`${q.replace(/ … /g, " ")}: ${right.replace("→", "إِلَى").replace(/[()]/g, "").replace(/,/g, " وَ")}`), show: true, german: "Frag deinen Partner nach seiner Fahrkarte (Student أ, S. 203).", questions: [{ prompt: "Die Antwort:", options, answer: options.indexOf(right) }] };
});

/** تذكر (٤): the ordinals 1–20 as the book prints them. */
const ORD_1_20 = [
  "الْأَوَّل", "الثَّانِي", "الثَّالِث", "الرَّابِع", "الْخَامِس", "السَّادِس", "السَّابِع", "الثَّامِن", "التَّاسِع", "الْعَاشِر",
  "الْحَادِي عَشَرَ", "الثَّانِي عَشَرَ", "الثَّالِث عَشَرَ", "الرَّابِع عَشَرَ", "الْخَامِس عَشَرَ", "السَّادِس عَشَرَ", "السَّابِع عَشَرَ", "الثَّامِن عَشَرَ", "التَّاسِع عَشَرَ", "الْعِشْرُون",
];

const NINE: Array<[number, number]> = [[9, 0], [9, 10], [9, 15], [9, 20], [9, 25], [9, 30], [9, 35], [9, 40], [9, 45], [9, 50]];

export const a1MaAlYawm: A1Lesson = {
  slug: "ma-al-yawm",
  kind: "phrase",
  label: "مَا الْيَوْمُ؟",
  labelGerman: "Welcher Tag ist heute?",
  steps: [
    {
      kind: "phrases",
      slug: "step-1",
      title: "Der Kalender: die Wochentage",
      navLabel: "Wochentage",
      instruction: { arabic: "تَقْدِيمٌ (٢): مَا الْيَوْمُ؟ ١ – اِقْرَأْ نَتِيجَةَ الشَّهْرِ.", german: "Lies den Monatskalender: die Wochentage – Sonntag ist der erste Tag der Woche. Hör zu und sprich nach.", note: "Im Kalender: شَهْر (Monat) – يَوْم (Tag) – أُسْبُوع (Woche) – سَنَة (Jahr). Unter einigen Daten steht das Zahlwort: ٢٠ عِشْرُون، ٢١ وَاحِد وَعِشْرُون، ٢٢ اثْنَان وَعِشْرُون، ٣٠ ثَلَاثُون، ٣١ وَاحِد وَثَلَاثُون." },
      groups: [
        { id: "days", title: "أَيَّامُ الْأُسْبُوعِ", items: DAYS.map(([a, g], n) => phrase(`day-${n + 1}`, a, g)) },
        { id: "words", title: "يَوْم – شَهْر – سَنَة – أُسْبُوع", items: [["يَوْم", "Tag"], ["أَيَّام", "Tage"], ["شَهْر", "Monat"], ["سَنَة", "Jahr"], ["أُسْبُوع", "Woche"]].map(([a, g], n) => phrase(`cal-${n + 1}`, a!, g!)) },
      ],
    },
    {
      kind: "cloze",
      slug: "step-2",
      title: "Die Zahlen 40–100: Lücken füllen",
      navLabel: "Zahlen 40–100",
      instruction: { arabic: "٢ – أ) اُكْتُبِ الْأَرْقَامَ النَّاقِصَةَ.", german: "Schreib die fehlenden Zahlwörter – Einer zuerst, dann die Zehner: ٤٣ = ثَلَاثَة وَأَرْبَعُون." },
      items: [4, 5, 6, 7, 8, 9].map(decadeItem),
    },
    {
      kind: "phrases",
      slug: "step-3",
      title: "Die Zahlen 40–100: nachsprechen",
      navLabel: "Zahlen sprechen",
      instruction: { arabic: "ب) كَرِّرِ الْأَرْقَامَ بَعْدَ الْمُدَرِّسِ.", german: "Sprich die Zahlen nach." },
      groups: [{ id: "tens", title: "الْعُقُود", items: [40, 41, 50, 56, 60, 64, 68, 70, 75, 80, 87, 90, 100].map((n) => phrase(`num-${n}`, numberWord(n), toArabicDigits(n))) }],
    },
    {
      kind: "words",
      slug: "step-4",
      title: "Wie spät ist es?",
      navLabel: "Uhrzeit",
      instruction: { arabic: "٣) كَمِ السَّاعَةُ الْآنَ مِنْ فَضْلِكَ؟ أ) اِسْمَعْ وَكَرِّرْ بَعْدَ الْمُدَرِّسِ.", german: "Hör zu und sprich nach: die Uhrzeiten der Bilder 1–9." },
      groups: [
        { id: "a", title: "(١) – (٣)", words: [timeWord(2, 0, 1), timeWord(10, 0, 2), timeWord(10, 10, 3)] },
        { id: "b", title: "(٤) – (٧)", words: [timeWord(10, 15, 4, false), timeWord(10, 20, 5, false), timeWord(10, 30, 6, false), timeWord(10, 45, 7, false)] },
        { id: "c", title: "(٨) – (٩)", words: [timeWord(10, 35, 8), timeWord(10, 25, 9)] },
      ],
    },
    {
      kind: "table",
      slug: "step-5",
      title: "Grammatik: Tage, Zehner, Uhrzeit",
      navLabel: "Grammatik",
      instruction: { arabic: "لَاحِظِ الْقَوَاعِدَ: ١) يَوْم ← أَيَّام، وَلِلسُّؤَالِ عَنِ الْيَوْمِ: مَا الْيَوْمُ مِنْ فَضْلِكَ؟ ٢) الْأَعْدَادُ ٣) سُؤَالٌ عَنِ الْوَقْتِ: كَمِ السَّاعَةُ الْآنَ مِنْ فَضْلِكَ؟", german: "Achte auf die Regeln: nach dem Tag fragen, die Zehner, und so sagt man die Uhrzeit (دَقِيقَة = Minute, Mehrzahl دَقَائِق)." },
      tables: [
        { id: "days", titleArabic: "١) يَوْم ← أَيَّام – مَا الْيَوْمُ مِنْ فَضْلِكَ؟", title: "Die Wochentage", columns: DAYS.map((_, n) => ({ arabic: toArabicDigits(n + 1), german: "" })), rows: [DAYS.map(([a, g]) => ({ arabic: a, german: g }))] },
        { id: "tens", titleArabic: "٢) الْأَعْدَادُ", title: "Die Zehner", columns: [{ arabic: "", german: "" }, { arabic: "", german: "" }], rows: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((n) => [{ arabic: toArabicDigits(n), listen: false }, { arabic: numberWord(n) }]) },
        { id: "time", titleArabic: "٣) سُؤَالٌ عَنِ الْوَقْتِ: كَمِ السَّاعَةُ الْآنَ مِنْ فَضْلِكَ؟", title: "Die Uhrzeit", columns: [{ arabic: "", german: "" }, { arabic: "السَّاعَةُ الْآنَ", german: "Es ist …" }], rows: ([[6, 0], [6, 5], [6, 15], [6, 20], [6, 30], [6, 25], [6, 35]] as Array<[number, number]>).map(([h, m]) => [{ arabic: hm(h, m), listen: false }, { arabic: `السَّاعَةُ ${timeWords(h, m)}`, german: DE_TIME(h, m) }] satisfies TableCell[]) },
      ],
      quiz: [
        { id: "thu", prompt: "Donnerstag:", options: ["الْخَمِيس", "الْجُمْعَة", "الْخَامِس"], answer: 0 },
        { id: "quarter", prompt: "6:15 Uhr:", options: ["السَّادِسَةُ وَالثُّلْثُ", "السَّادِسَةُ وَالرُّبْعُ", "السَّادِسَةُ وَالنِّصْفُ"], answer: 1 },
        { id: "seventy", prompt: "٧٠", options: ["سَبْعَة", "سَبْعَةَ عَشَرَ", "سَبْعُون"], answer: 2 },
        { id: "to", prompt: "10:45 Uhr:", options: ["الْعَاشِرَةُ إِلَّا الرُّبْعَ", "الْحَادِيَةَ عَشْرَةَ إِلَّا الرُّبْعَ", "الْعَاشِرَةُ وَالرُّبْعُ"], answer: 1 },
      ],
    },
    { kind: "quiz", slug: "step-6", title: "Übung 1: Welche Uhrzeit hörst du?", navLabel: "Übung 1", instruction: { arabic: "التَّدْرِيبَاتُ · تَدْرِيبٌ (١): ١) اِسْمَعْ وَضَعْ (✓) عَلَى الْوَقْتِ الصَّحِيحِ.", german: "Übung 1: Hör zu und wähle die Uhrzeit, die du hörst.", note: "Das Buch druckt die Lösung nur für (أ) – ٨,١٥. Die Aufnahme ist auf der CD; Alif spricht in jeder Zeile die erste Uhrzeit. Teil 2 (dein Partner liest vor) braucht einen Partner." }, items: LISTEN_TIMES },
    {
      kind: "cloze",
      slug: "step-7",
      title: "Übung 2: Wie spät ist es?",
      navLabel: "Übung 2",
      instruction: { arabic: "تَدْرِيبٌ (٢): ١) اِسْأَلْ زَمِيلَكَ بِالتَّبَادُلِ كَمِ السَّاعَةُ الْآنَ. اُكْتُبِ الْوَقْتَ تَحْتَ كُلِّ سَاعَةٍ.", german: "Übung 2: Lies jede Uhr und schreib die Uhrzeit darunter.", note: "Die Uhrzeiten sind aus den Zeichnungen des Buchs abgelesen (von rechts nach links)." },
      items: CLOCKS_EX2.map(([h, m], n) => ({ id: `c${n + 1}`, image: clock(h, m), lines: [{ label: "", parts: ["السَّاعَةُ ", gap([timeWords(h, m)], sorted([timeWords(h, m), timeWords(next(h), m), timeWords(h, m === 0 ? 30 : 0)]))] }] })),
    },
    {
      kind: "quiz",
      slug: "step-8",
      title: "Übung 3: Lies die Zeit – welche Uhr?",
      navLabel: "Übung 3",
      instruction: { arabic: "تَدْرِيبٌ (٣): اِقْرَأِ الْوَقْتَ ثُمَّ ارْسُمِ السَّاعَةَ. كَمِ السَّاعَةُ الْآنَ؟", german: "Übung 3: Lies die Uhrzeit und wähle die Uhr, die sie zeigt.", note: "Im Buch zeichnest du die Zeiger selbst ein. Teil 2 (mit dem Partner) und Übung 4 (eigene Uhrzeiten zeichnen) brauchen einen Partner bzw. sind frei." },
      items: EX3.map(([h, m], n) => {
        const options = [clockSrc([h, m]), ...EX3_DISTRACT[`${h}:${String(m).padStart(2, "0")}`]!.map(clockSrc)].sort();
        return { id: `e3-${n + 1}`, arabic: `السَّاعَةُ ${timeWords(h, m)}`, german: DE_TIME(h, m), questions: [{ prompt: "Welche Uhr?", options, answer: options.indexOf(clockSrc([h, m])) }] };
      }),
    },
    { kind: "dialogue", mode: "listen", slug: "step-9", title: "Übung 5: Herr Raif auf Reisen", navLabel: "Übung 5 (hören)", instruction: { arabic: "تَدْرِيبٌ (٥): الْأُسْتَاذُ رَائِف مُسَافِرٌ فِي رِحْلَةٍ · ١) اِسْتَمِعْ لِلْحِوَارِ ثُمَّ أَجِبْ: مَا مَوْعِدُ قِيَامِ الْقِطَارِ؟", german: "Übung 5: Hör zu – wann fährt der Zug ab?", note: "Nützliche Wörter: آنِسَة (Fräulein) – مَوْعِد (Termin, Abfahrtszeit) – رِحْلَة (Reise) – دَرَجَة (Klasse) – قِطَار (Zug) – قِيَام (Abfahrt) – مَقْعَد (Sitz) – مُسَلْسَل (Seriennummer) – مِنْ / إِلَى – عَرَبَة (Wagen) – مَحَطَّةُ الْقِطَارِ (Bahnhof)." }, dialogue: raifMuna },
    {
      kind: "quiz",
      slug: "step-10",
      title: "Übung 5 (2): Welcher Tag?",
      navLabel: "Übung 5 (Tag)",
      instruction: { arabic: "٢) اِقْرَأْ تَذْكِرَةَ الْقِطَارِ ثُمَّ أَجِبْ: ١ – فِي أَيِّ يَوْمِ الرِّحْلَةُ؟ ضَعْ عَلَامَةَ (✓) عَلَى الْيَوْمِ.", german: "Lies die Fahrkarte (Datum: ٦/٩/٢٠٠٨): An welchem Wochentag ist die Reise?", note: "Der 6. September 2008 war ein Samstag." },
      items: [{ id: "day", arabic: "فِي أَيِّ يَوْمٍ الرِّحْلَةُ؟", questions: [{ prompt: "Der Tag:", options: DAYS.map((d) => d[0]), answer: 6 }] }],
    },
    { kind: "cloze", slug: "step-11", title: "Übung 5 (3): die Fahrkarte", navLabel: "Übung 5 (Karte)", instruction: { arabic: "٣) اِقْرَأْ مَرَّةً أُخْرَى ثُمَّ أَجِبْ.", german: "Lies die Fahrkarte noch einmal: Zug, Wagen, Sitz, Strecke, Seriennummer, Ausgabedatum, Klasse, Preis.", note: "Die Angaben stehen auf der Fahrkarte im Buch (S. 201): Zug ٠٩٢٦, Wagen ٠٦, Sitz ٠٥٥, Abfahrt ١٩,٠٠." }, items: TICKET_QUESTIONS },
    { kind: "dialogue", mode: "roleplay", slug: "step-12", title: "Übung 5: Rollenspiel", navLabel: "Rollenspiel", instruction: { arabic: "الْأُسْتَاذُ رَائِف وَالْآنِسَةُ مُنَى", german: "Spiel die kurze Unterhaltung als Raif oder Muna." }, dialogue: raifMuna },
    { kind: "quiz", slug: "step-13", title: "Gespräch 1: Majid Ziyads Termine", navLabel: "Terminkalender", instruction: { arabic: "الْمُحَادَثَةُ · تَدْرِيبٌ (١): هَذِهِ أَجِنْدَةُ السَّيِّدِ مَاجِد زِيَاد، اِسْأَلْ عَنِ الْمَوَاعِيدِ وَاكْتُبْهَا فِي الْيَوْمِ الْمُنَاسِبِ كَالْمِثَالِ: طَالِب (أ): مَا الْمَوْعِدُ يَوْمَ الْأَرْبِعَاءِ؟ طَالِب (ب): الْأَرْبِعَاء ١١ مَوْعِدٌ مَعَ طَبِيبِ الْأَسْنَانِ السَّاعَةَ التَّاسِعَةَ وَالرُّبْعَ مَسَاءً.", german: "Du bist Student (أ): Frag nach den Terminen, die auf der Seite deines Partners (ب) stehen, und hör seine Antwort.", note: "Nützliche Wörter: صَبَاحًا (morgens) – ظُهْرًا (mittags) – مَسَاءً (abends) – النَّادِي (der Klub). Die Termine stehen auf der Seite von Student (ب) im Buch (S. 202); die Fragen von Student (ب) brauchen einen Partner." }, items: DIARY_QUIZ },
    { kind: "quiz", slug: "step-14", title: "Gespräch 2: die Fahrkarte des Partners", navLabel: "Fahrkarten", instruction: { arabic: "تَدْرِيبٌ (٢): هَذِهِ تَذَاكِرُ قِطَارٍ. طَالِب (ب): اِسْأَلْ طَالِب (أ) عَنْ مَوْعِدِ قِطَارِهِ، وَرَقْمِ الْمَقْعَدِ، وَالْقِطَارِ، وَالْعَرَبَةِ.", german: "Du bist Student (ب): Frag nach der Fahrkarte von Student (أ) (Sohag → Kairo) und hör die Antworten.", note: "Die Fahrkarte von Student (أ) steht im Buch auf S. 203: Zug ٠٩٨٣, Wagen ٠٧, Sitz ٠٣٠, ١٥,٠٠ Uhr, ٧/١١/٢٠٠٨, ثانية مكيفة, ٣٨ Pfund." }, items: TICKET_GAP },
    {
      kind: "table",
      slug: "step-15",
      title: "Merke: Nummern, Adressen, Zahlen, Zeit",
      navLabel: "Merke",
      instruction: { arabic: "تَذَكَّرْ", german: "Merke: das Wichtigste von Unit 6 auf einen Blick." },
      tables: [
        { id: "phone", titleArabic: "١) لِلسُّؤَالِ عَنْ رَقْمِ التِّلِيفُونِ: مَا رَقْمُ تِلِيفُونِكَ / ـكِ / ـهُ / ـهَا / ـكُمَا / ـهُمَا / ـكُمْ / ـهُمْ / ـهُنَّ؟", title: "Telefonnummer", columns: [{ arabic: "", german: "" }], rows: [[{ arabic: "مَا رَقْمُ تِلِيفُونِكَ؟" }], [{ arabic: "مَا رَقْمُ تِلِيفُونِهِمْ؟" }]] },
        { id: "address", titleArabic: "٢) لِلسُّؤَالِ عَنِ الْعُنْوَانِ:", title: "Adresse", columns: [{ arabic: "السُّؤَالُ", german: "Frage" }, { arabic: "الْإِجَابَةُ", german: "Antwort" }], rows: [[{ arabic: "مَا عُنْوَانُ الْمَنْزِلِ؟" }, { arabic: "الْعُنْوَانُ: … شَارِعُ …", listen: false }], [{ arabic: "أَيُّ دَوْرٍ؟" }, { arabic: "الدَّوْرُ الْأَوَّلُ / الثَّانِي / الثَّالِثُ / الرَّابِعُ / الْخَامِسُ" }], [{ arabic: "مَا رَقْمُ الشَّقَّةِ؟" }, { arabic: "رَقْمُ الشَّقَّةِ: …", listen: false }]] },
        { id: "maths", titleArabic: "٣) لِلْعَمَلِيَّاتِ الْحِسَابِيَّةِ:", title: "Rechnen", columns: [{ arabic: "", german: "" }, { arabic: "", german: "" }], rows: [[{ arabic: "+ زَائِد" }, { arabic: "– نَاقِص" }], [{ arabic: "× فِي" }, { arabic: "÷ عَلَى" }]] },
        { id: "numbers", titleArabic: "٤) الْأَرْقَامُ:", title: "Ordnungszahlen und Zahlen 1–20", columns: [{ arabic: "", german: "" }, { arabic: "", german: "" }, { arabic: "", german: "" }, { arabic: "", german: "" }], rows: ORD_1_20.slice(0, 10).map((o, k) => [{ arabic: o }, { arabic: numberWord(k + 1) }, { arabic: ORD_1_20[k + 10]! }, { arabic: numberWord(k + 11) }]) },
        { id: "dates", titleArabic: "٧) كَلِمَاتٌ خَاصَّةٌ بِالتَّارِيخِ: يَوْم / أَيَّام – شَهْر – سَنَة – أُسْبُوع", title: "Wörter zum Datum", columns: DAYS.map(() => ({ arabic: "", german: "" })), rows: [DAYS.map(([a]) => ({ arabic: a }))] },
        { id: "time", titleArabic: "٨) لِلسُّؤَالِ عَنِ الْوَقْتِ: س: كَمِ السَّاعَةُ الْآنَ لَوْ سَمَحْتَ؟ (دَقِيقَة – دَقَائِق)", title: "Die Uhrzeit von 9:00 bis 10:00", columns: [{ arabic: "", german: "" }, { arabic: "الْإِجَابَةُ", german: "Antwort" }], rows: [...NINE.map(([h, m]) => [{ arabic: hm(h, m), listen: false }, { arabic: timeWords(h, m), german: DE_TIME(h, m) }] satisfies TableCell[]), [{ arabic: hm(10, 0), listen: false }, { arabic: timeWords(10, 0), german: DE_TIME(10, 0) }]] },
      ],
      quiz: [
        { id: "minus", prompt: "„minus“ heißt …", options: ["زَائِد", "نَاقِص", "عَلَى"], answer: 1 },
        { id: "9-40", prompt: "9:40 Uhr:", options: ["التَّاسِعَةُ وَالثُّلْثُ", "الْعَاشِرَةُ إِلَّا الثُّلْثَ", "الْعَاشِرَةُ إِلَّا الرُّبْعَ"], answer: 1 },
        { id: "week", prompt: "„Woche“", options: ["شَهْر", "سَنَة", "أُسْبُوع"], answer: 2 },
      ],
    },
  ],
};
