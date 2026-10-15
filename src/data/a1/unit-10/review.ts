import type { A1Lesson, ClozeItem, ClozePart, MatchContent, QuizItem } from "@/data/types";

// مراجعة عامة من الوحدة السادسة إلى الوحدة العاشرة (book pages 291–301, PDF
// 323–333): تدريب ١ (clocks), ٢ (times), ٣ (flights – info gap), ٤ (questions
// to pictures), ٥ (descriptions), ٦ (weather – info gap), ٧ (the beach), ٨ (the
// living room), ٩ (Huwaida and her father at the weekend).

const IMG = "/images/a1/unit-6";
const gap = (accept: string[], options: string[]): ClozePart => ({ accept, options });
const sorted = (xs: string[]) => [...new Set(xs)].sort((a, b) => a.localeCompare(b, "ar"));

/** تدريب ١: the six clocks, read from the drawings (the first is the book's example). */
const CLOCKS: Array<[h: number, m: number, words: string]> = [
  [4, 30, "الرَّابِعَةُ وَالنِّصْفُ"],
  [7, 5, "السَّابِعَةُ وَخَمْسُ دَقَائِقَ"],
  [2, 45, "الثَّالِثَةُ إِلَّا الرُّبْعَ"],
  [10, 55, "الْحَادِيَةَ عَشْرَةَ إِلَّا خَمْسَ دَقَائِقَ"],
  [1, 35, "الْوَاحِدَةُ وَالنِّصْفُ وَخَمْسُ دَقَائِقَ"],
  [9, 15, "التَّاسِعَةُ وَالرُّبْعُ"],
];
const WORDS = CLOCKS.map((c) => c[2]);

/** تدريب ٢: (أ) the digits, (ب) the words – the book's columns. */
const TIMES: MatchContent = {
  promptTitle: "(أ)",
  optionTitle: "(ب)",
  prompts: [
    { id: "t1", arabic: "١ – السَّاعَةُ ١٢:٣٠ p.m.", answer: "z" },
    { id: "t2", arabic: "٢ – السَّاعَةُ ٤:١٥ p.m.", answer: "a" },
    { id: "t3", arabic: "٣ – السَّاعَةُ ١٠:٤٥ a.m.", answer: "w" },
    { id: "t4", arabic: "٤ – السَّاعَةُ ٣:٣٠ p.m.", answer: "h" },
    { id: "t5", arabic: "٥ – السَّاعَةُ ٨:٠٥ a.m.", answer: "d" },
    { id: "t6", arabic: "٦ – السَّاعَةُ ٧:٣٥ p.m.", answer: "j" },
    { id: "t7", arabic: "٧ – السَّاعَةُ ٦:٢٠ a.m.", answer: "b" },
    { id: "t8", arabic: "٨ – السَّاعَةُ ٩:٢٥ p.m.", answer: "hh" },
  ],
  options: [
    { id: "a", label: "أ – السَّاعَةُ الرَّابِعَةُ وَالرُّبْعُ ظُهْرًا.", arabic: "السَّاعَةُ الرَّابِعَةُ وَالرُّبْعُ ظُهْرًا." },
    { id: "b", label: "ب – السَّاعَةُ السَّادِسَةُ وَالثُّلْثُ صَبَاحًا.", arabic: "السَّاعَةُ السَّادِسَةُ وَالثُّلْثُ صَبَاحًا." },
    { id: "j", label: "ج – السَّاعَةُ السَّابِعَةُ وَالنِّصْفُ وَخَمْسُ دَقَائِقَ مَسَاءً.", arabic: "السَّاعَةُ السَّابِعَةُ وَالنِّصْفُ وَخَمْسُ دَقَائِقَ مَسَاءً." },
    { id: "d", label: "د – السَّاعَةُ الثَّامِنَةُ وَخَمْسُ دَقَائِقَ صَبَاحًا.", arabic: "السَّاعَةُ الثَّامِنَةُ وَخَمْسُ دَقَائِقَ صَبَاحًا." },
    { id: "h", label: "هـ – السَّاعَةُ الثَّالِثَةُ وَالنِّصْفُ مَسَاءً.", arabic: "السَّاعَةُ الثَّالِثَةُ وَالنِّصْفُ مَسَاءً." },
    { id: "w", label: "و – السَّاعَةُ الْحَادِيَةَ عَشْرَةَ إِلَّا الرُّبْعَ صَبَاحًا.", arabic: "السَّاعَةُ الْحَادِيَةَ عَشْرَةَ إِلَّا الرُّبْعَ صَبَاحًا." },
    { id: "z", label: "ز – السَّاعَةُ الثَّانِيَةَ عَشْرَةَ وَالنِّصْفُ مَسَاءً.", arabic: "السَّاعَةُ الثَّانِيَةَ عَشْرَةَ وَالنِّصْفُ مَسَاءً." },
    { id: "hh", label: "ح – السَّاعَةُ التَّاسِعَةُ وَالنِّصْفُ إِلَّا خَمْسَ دَقَائِقَ مَسَاءً.", arabic: "السَّاعَةُ التَّاسِعَةُ وَالنِّصْفُ إِلَّا خَمْسَ دَقَائِقَ مَسَاءً." },
  ],
};

/** تدريب ٣: student (أ) asks about the gaps of the board; the answers are on student (ب)'s board. */
const FLIGHTS: Array<[q: string, spoken: string, a: string, wrong: string]> = [
  ["مَتَى تَصِلُ رِحْلَةُ رَقْمِ ٢٦٧ مِنَ الْقَاهِرَةِ؟", "تَصِلُ رِحْلَةُ رَقْمِ اثْنَيْنِ سِتَّة سَبْعَة مِنَ الْقَاهِرَةِ السَّاعَةَ السَّادِسَةَ صَبَاحًا.", "٦:٠٠ AM", "٦:٠٠ PM"],
  ["وَمَا رَقْمُ الْبَوَّابَةِ؟ (الْقَاهِرَةُ)", "رَقْمُ الْبَوَّابَةِ سَبْعَة.", "٧", "١٧"],
  ["مَتَى تَصِلُ رِحْلَةُ رَقْمِ ٨٢١ مِنْ بَرْشَلُونَة؟", "تَصِلُ رِحْلَةُ رَقْمِ ثَمَانِيَة اثْنَيْن وَاحِد مِنْ بَرْشَلُونَة السَّاعَةَ السَّابِعَةَ وَالثُّلْثَ مَسَاءً.", "٧:٢٠ PM", "٧:٢٠ AM"],
  ["وَمَا رَقْمُ الْبَوَّابَةِ؟ (بَرْشَلُونَة)", "رَقْمُ الْبَوَّابَةِ اثْنَان.", "٢", "١٢"],
];
const FLIGHTS_B: Array<[q: string, spoken: string, a: string, wrong: string]> = [
  ["مَتَى تَصِلُ رِحْلَةُ رَقْمِ ٤٢٩ مِنْ تُورُنْتُو؟", "تَصِلُ رِحْلَةُ رَقْمِ أَرْبَعَة اثْنَيْن تِسْعَة مِنْ تُورُنْتُو السَّاعَةَ الثَّامِنَةَ وَالنِّصْفَ مَسَاءً.", "٨:٣٠ PM", "٨:٣٠ AM"],
  ["وَمَا رَقْمُ الْبَوَّابَةِ؟ (تُورُنْتُو)", "رَقْمُ الْبَوَّابَةِ عَشَرَة.", "١٠", "١٢"],
  ["مَتَى تَصِلُ رِحْلَةُ رَقْمِ ١٩٨ مِنْ طُوكْيُو؟", "تَصِلُ رِحْلَةُ رَقْمِ وَاحِد تِسْعَة ثَمَانِيَة مِنْ طُوكْيُو السَّاعَةَ الثَّانِيَةَ عَشْرَةَ وَالثُّلْثَ مَسَاءً.", "١٢:٢٠ PM", "١٢:٢٠ AM"],
  ["وَمَا رَقْمُ الْبَوَّابَةِ؟ (طُوكْيُو)", "رَقْمُ الْبَوَّابَةِ أَرْبَعَة.", "٤", "٧"],
  ["مَتَى تَصِلُ رِحْلَةُ رَقْمِ ٦٧٢ مِنْ لُوس أَنْجِلُوس؟", "تَصِلُ رِحْلَةُ رَقْمِ سِتَّة سَبْعَة اثْنَيْن مِنْ لُوس أَنْجِلُوس السَّاعَةَ الْعَاشِرَةَ وَالثُّلْثَ صَبَاحًا.", "١٠:٢٠ AM", "١٠:٢٠ PM"],
  ["وَمَا رَقْمُ الْبَوَّابَةِ؟ (لُوس أَنْجِلُوس)", "رَقْمُ الْبَوَّابَةِ سِتَّة.", "٦", "٢"],
];
const flightQuiz = (side: string) => ([q, spoken, a, w]: [string, string, string, string], n: number): QuizItem => {
  const options = sorted([a, w]);
  return { id: `${side}-${n + 1}`, arabic: q, spoken, show: true, questions: [{ prompt: "Die Antwort deines Partners:", options, answer: options.indexOf(a) }] };
};

/** تدريب ٤: the questions to the pictures – the answers read from them. */
const EX4: Array<[q: string, a: string, wrong: string[]]> = [
  ["هَلِ الْجَوُّ مُعْتَدِلٌ الْآنَ؟", "لَا، الْجَوُّ لَيْسَ مُعْتَدِلًا. الْجَوُّ مُمْطِرٌ.", ["نَعَمْ، الْجَوُّ مُعْتَدِلٌ.", "لَا، الْجَوُّ حَارٌّ."]],
  ["هَلْ يَتَغَدَّى رَؤُوف الْآنَ؟", "لَا، رَؤُوف لَا يَتَغَدَّى. هُوَ يُفْطِرُ.", ["نَعَمْ، رَؤُوف يَتَغَدَّى.", "لَا، رَؤُوف لَا يَتَغَدَّى. هُوَ يَنَامُ."]],
  ["هَلْ يَنَامُ عَلِيّ الْآنَ؟", "لَا، عَلِيّ لَا يَنَامُ. هُوَ يَسْتَيْقِظُ.", ["نَعَمْ، عَلِيّ يَنَامُ.", "لَا، عَلِيّ لَا يَنَامُ. هُوَ يَعْمَلُ."]],
  ["هَلْ يَكْتُبُ مُصْطَفَى الْآنَ؟", "نَعَمْ، مُصْطَفَى يَكْتُبُ.", ["لَا، مُصْطَفَى لَا يَكْتُبُ. هُوَ يَنَامُ.", "لَا، مُصْطَفَى لَا يَكْتُبُ. هُوَ يَلْعَبُ."]],
  ["هَلْ تَلْبَسُ فَاطِمَة فُسْتَانًا؟", "لَا، فَاطِمَة لَا تَلْبَسُ فُسْتَانًا. هِيَ تَلْبَسُ شُورْت وَتِي شِيرْت.", ["نَعَمْ، فَاطِمَة تَلْبَسُ فُسْتَانًا.", "لَا، فَاطِمَة لَا تَلْبَسُ فُسْتَانًا. هِيَ تَلْبَسُ جُونِلَّة."]],
  ["هَلْ تَقْرَأُ سُعَاد الْآنَ؟", "لَا، سُعَاد لَا تَقْرَأُ. هِيَ تُشَاهِدُ التِّلِيفِزْيُونَ.", ["نَعَمْ، سُعَاد تَقْرَأُ.", "لَا، سُعَاد لَا تَقْرَأُ. هِيَ تَنَامُ."]],
];

const EX5: Array<[picture: string, right: string]> = [
  ["(١) Eine Frau mit Brille fährt Auto.", "زَيْنَب لَا تَلْبَسُ سَاعَةً. هِيَ تَلْبَسُ نَظَّارَةً."],
  ["(٢) Eine Frau im Kostüm geht an Schaufenstern vorbei.", "عَائِشَة تَذْهَبُ إِلَى الْعَمَلِ، هِيَ تَلْبَسُ تَايِيرًا جَمِيلًا."],
  ["(٣) Ein Mann und eine Frau gehen im Park spazieren.", "سَمِير يَذْهَبُ مَعَ زَوْجَتِهِ إِلَى الْحَدِيقَةِ فِي الْإِجَازَةِ الْأُسْبُوعِيَّةِ."],
  ["(٤) Ein junger Mann läuft.", "أَحْمَد يَجْرِي فِي النَّادِي. هُوَ يَلْبَسُ حِذَاءً لِلرِّيَاضَةِ."],
];
const EX5_OPTIONS = EX5.map((e) => e[1]);

/** تدريب ٦: student (أ) asks about the empty cells; the answers are in student (ب)'s table. */
const WEATHER6: Array<[q: string, temp: string, w: string, wrongTemp: string]> = [
  ["كَيْفَ حَالُ الْجَوِّ فِي سِيَاتِل فِي شَهْرَيْ يَنَايِر وَفِبْرَايِر؟", "٨°", "ثَلْج", "٢٨°"],
  ["كَيْفَ حَالُ الْجَوِّ فِي سِيدْنِي فِي شَهْرَيْ مَارِس وَأَبْرِيل؟", "٢٨°", "مُمْطِر", "٨°"],
  ["كَيْفَ حَالُ الْجَوِّ فِي مِصْرَ فِي شَهْرَيْ مَايُو وَيُونْيُو؟", "٢٠°", "مُشْمِس", "٢°"],
  ["كَيْفَ حَالُ الْجَوِّ فِي سِيَاتِل فِي شَهْرَيْ مَايُو وَيُونْيُو؟", "١٩°", "مُشْمِس", "٩°"],
  ["كَيْفَ حَالُ الْجَوِّ فِي سِيدْنِي فِي شَهْرَيْ يُولْيُو وَأُغُسْطُس؟", "٢٨°", "مُمْطِر", "١٨°"],
  ["كَيْفَ حَالُ الْجَوِّ فِي مِصْرَ فِي شَهْرَيْ سِبْتَمْبِر وَأُكْتُوبَر؟", "٢٤°", "غَائِم", "٤°"],
  ["كَيْفَ حَالُ الْجَوِّ فِي سِيَاتِل فِي شَهْرَيْ سِبْتَمْبِر وَأُكْتُوبَر؟", "١٦°", "مُشْمِس", "٦°"],
  ["كَيْفَ حَالُ الْجَوِّ فِي سِيدْنِي فِي شَهْرَيْ نُوفَمْبِر وَدِيسَمْبِر؟", "٢٢°", "مُشْمِس", "٢°"],
];
const TEMP_WORD: Record<string, string> = { "٨°": "ثَمَانِي دَرَجَاتٍ", "٢٨°": "ثَمَانٍ وَعِشْرُونَ دَرَجَةً", "٢٠°": "عِشْرُونَ دَرَجَةً", "١٩°": "تِسْعَ عَشْرَةَ دَرَجَةً", "٢٤°": "أَرْبَعٌ وَعِشْرُونَ دَرَجَةً", "١٦°": "سِتَّ عَشْرَةَ دَرَجَةً", "٢٢°": "اثْنَتَانِ وَعِشْرُونَ دَرَجَةً" };

const BEACH: MatchContent = {
  promptTitle: "الِاسْمُ",
  optionTitle: "مَاذَا يَفْعَلُ؟",
  prompts: [
    { id: "sayf", arabic: "١ – سَيْف", answer: "yajri" },
    { id: "siham", arabic: "٢ – سِهَام", answer: "tasbah" },
    { id: "wail", arabic: "٣ – وَائِل", answer: "yalab", accept: ["talab"] },
    { id: "majid", arabic: "٤ – مَاجِد", answer: "yaktub" },
    { id: "abir", arabic: "٥ – عَبِير", answer: "talab", accept: ["yalab"] },
    { id: "tahani", arabic: "٦ – تَهَانِي", answer: "taqra" },
  ],
  options: [
    { id: "yajri", label: "يَجْرِي", arabic: "يَجْرِي" },
    { id: "taqra", label: "تَقْرَأُ", arabic: "تَقْرَأُ" },
    { id: "yaktub", label: "يَكْتُبُ", arabic: "يَكْتُبُ" },
    { id: "yalab", label: "يَلْعَبُ", arabic: "يَلْعَبُ" },
    { id: "talab", label: "تَلْعَبُ", arabic: "تَلْعَبُ" },
    { id: "tasbah", label: "تَسْبَحُ", arabic: "تَسْبَحُ" },
  ],
};

const LIVING: MatchContent = {
  promptTitle: "جُمْلَة (أ)",
  optionTitle: "جُمْلَة (ب)",
  prompts: [
    { id: "sana", arabic: "سَنَاء", answer: "phone" },
    { id: "shakir", arabic: "شَاكِر", answer: "juice" },
    { id: "safwat", arabic: "صَفْوَت", answer: "tv" },
    { id: "salim", arabic: "سَلِيم", answer: "pizza" },
    { id: "tamir", arabic: "تَامِر", answer: "book" },
    { id: "safaa", arabic: "صَفَاء", answer: "letter" },
    { id: "alaa", arabic: "عَلَاء", answer: "sleep" },
  ],
  options: [
    { id: "book", label: "يَقْرَأُ كِتَابًا.", arabic: "يَقْرَأُ كِتَابًا." },
    { id: "juice", label: "يَشْرَبُ عَصِيرًا.", arabic: "يَشْرَبُ عَصِيرًا." },
    { id: "pizza", label: "يَأْكُلُ بِيتْزَا.", arabic: "يَأْكُلُ بِيتْزَا." },
    { id: "sleep", label: "نَائِمٌ عَلَى الْكَنَبَةِ (الْأَرِيكَةِ).", arabic: "نَائِمٌ عَلَى الْكَنَبَةِ." },
    { id: "letter", label: "تَكْتُبُ خِطَابًا.", arabic: "تَكْتُبُ خِطَابًا." },
    { id: "tv", label: "يُشَاهِدُ التِّلِيفِزْيُونَ.", arabic: "يُشَاهِدُ التِّلِيفِزْيُونَ." },
    { id: "phone", label: "تَتَكَلَّمُ فِي التِّلِيفُونِ.", arabic: "تَتَكَلَّمُ فِي التِّلِيفُونِ." },
  ],
};

const LIVING_Q: ClozeItem[] = (
  [
    ["عَلَاء / يَشْرَبُ", "هَلْ عَلَاء يَشْرَبُ؟", "لَا، عَلَاء لَا يَشْرَبُ. هُوَ نَائِمٌ."],
    ["شَاكِر / يَشْرَبُ", "هَلْ شَاكِر يَشْرَبُ؟", "نَعَمْ، شَاكِر يَشْرَبُ عَصِيرًا."],
    ["سَلِيم / يَقْرَأُ", "هَلْ سَلِيم يَقْرَأُ؟", "لَا، سَلِيم لَا يَقْرَأُ. هُوَ يَأْكُلُ بِيتْزَا."],
    ["تَامِر / يَتَكَلَّمُ", "هَلْ تَامِر يَتَكَلَّمُ؟", "لَا، تَامِر لَا يَتَكَلَّمُ. هُوَ يَقْرَأُ كِتَابًا."],
    ["صَفَاء / تُشَاهِدُ التِّلِيفِزْيُونَ", "هَلْ صَفَاء تُشَاهِدُ التِّلِيفِزْيُونَ؟", "لَا، صَفَاء لَا تُشَاهِدُ التِّلِيفِزْيُونَ. هِيَ تَكْتُبُ خِطَابًا."],
    ["سَلْمَى / تَكْتُبُ خِطَابًا", "هَلْ سَلْمَى تَكْتُبُ خِطَابًا؟", "لَا، سَلْمَى لَيْسَتْ فِي الصُّورَةِ؛ صَفَاء تَكْتُبُ خِطَابًا."],
  ] as Array<[string, string, string]>
).map(([cue, q, a], n) => ({
  id: `lq-${n + 1}`,
  hint: cue,
  lines: [
    { label: "س", parts: [q] },
    { label: "ج", parts: [gap([a], sorted([a, a.startsWith("نَعَمْ") ? a.replace(/^نَعَمْ، (\S+) /, "لَا، $1 لَا ") : a.replace(/^لَا، /, "نَعَمْ، ").split(".")[0] + "."]))] },
  ],
}));

/** تدريب ٩: Huwaida and her father – the ✓ / × of the book's pictures. */
const HUWAIDA: Array<[string, boolean]> = [["تُشَاهِدُ التِّلِيفِزْيُونَ.", false], ["تَلْعَبُ رِيَاضَةً.", false], ["تَطْبُخُ.", true], ["تُنَظِّفُ.", true], ["تَقْرَأُ.", false], ["تَسْمَعُ مُوسِيقَى.", false], ["تَكْتُبُ عَلَى الْكُمْبِيُوتَرِ.", true]];
const FATHER: Array<[string, boolean]> = [["يُنَظِّفُ الْمَنْزِلَ.", false], ["يَقْرَأُ الْجَرِيدَةَ.", true], ["يَطْبُخُ.", false], ["يَسْمَعُ الْمُوسِيقَى.", true], ["يَكْتُبُ عَلَى الْكُمْبِيُوتَرِ.", false], ["يُشَاهِدُ التِّلِيفِزْيُونَ.", true], ["يَلْعَبُ تِنِس.", true]];
const tick = (who: string, subject: string, list: Array<[string, boolean]>): QuizItem[] =>
  list.map(([verb, yes], n) => ({
    id: `${who}-${n + 1}`,
    arabic: `${n + 1} – ${verb}`,
    spoken: yes ? `${subject} ${verb.replace(/\.$/, "")} فِي الْإِجَازَةِ.` : `${subject} لَا ${verb.replace(/\.$/, "")} فِي الْإِجَازَةِ.`,
    questions: [{ prompt: "(✓) oder (×)?", options: ["✓", "×"], answer: yes ? 0 : 1 }],
  }));

export const a1Review10: A1Lesson = {
  slug: "muraja-6-10",
  kind: "review",
  label: "مُرَاجَعَةٌ عَامَّة",
  labelGerman: "Wiederholung Unit 6–10",
  steps: [
    {
      kind: "cloze",
      slug: "step-1",
      title: "Übung 1: Wie spät ist es?",
      navLabel: "Übung 1",
      instruction: { arabic: "مُرَاجَعَةٌ عَامَّةٌ مِنَ الْوَحْدَةِ السَّادِسَةِ إِلَى الْوَحْدَةِ الْعَاشِرَةِ · تَدْرِيبٌ (١): ١) كَمِ السَّاعَةُ؟ اُكْتُبِ الْوَقْتَ كَالْمِثَالِ: ١ – السَّاعَةُ الرَّابِعَةُ وَالنِّصْفُ.", german: "Übung 1: Lies jede Uhr und schreib die Uhrzeit.", note: "Die Uhrzeiten 2–6 sind aus den Zeichnungen des Buchs abgelesen." },
      items: CLOCKS.map(([h, m, w], n) => ({
        id: `c${n + 1}`,
        image: { src: `${IMG}/clock-${String(h).padStart(2, "0")}${String(m).padStart(2, "0")}.svg`, alt: `${h}:${String(m).padStart(2, "0")}` },
        lines: [{ label: String(n + 1), parts: n === 0 ? [`السَّاعَةُ ${w}.`] : ["السَّاعَةُ ", gap([`${w}.`], sorted([w, WORDS[(n + 2) % 6]!, WORDS[(n + 4) % 6]!]).map((x) => `${x}.`))] }],
      })),
    },
    { kind: "match", slug: "step-2", title: "Übung 2: Uhrzeiten verbinden", navLabel: "Übung 2", instruction: { arabic: "تَدْرِيبٌ (٢): صِلْ (أ) مَعَ الْوَقْتِ الصَّحِيحِ مِنْ (ب).", german: "Übung 2: Verbinde die Uhrzeit (أ) mit den Wörtern (ب)." }, match: TIMES },
    { kind: "quiz", slug: "step-3", title: "Übung 3 (أ): Ankunftstafel", navLabel: "Übung 3 (أ)", instruction: { arabic: "تَدْرِيبٌ (٣): طَالِب (أ): اِسْأَلْ طَالِب (ب) كَالْحِوَارِ وَاكْتُبِ الْمَعْلُومَاتِ: أ – مَتَى تَصِلُ رِحْلَةُ رَقْمِ ٢٥٩ مِنْ سِيدْنِي؟ ب – السَّاعَةُ ٩:١٥ مَسَاءً. أ – وَمَا رَقْمُ الْبَوَّابَةِ؟ ب – رَقْمُ الْبَوَّابَةِ ١٢.", german: "Übung 3: Du bist Student (أ). Auf deiner Ankunftstafel fehlen Angaben – frag und hör die Antwort.", note: "Die Antworten stehen auf der Tafel von Student (ب)." }, items: FLIGHTS.map(flightQuiz("a")) },
    { kind: "quiz", slug: "step-4", title: "Übung 3 (ب): jetzt fragt der Partner", navLabel: "Übung 3 (ب)", instruction: { arabic: "طَالِب (ب): اِسْأَلْ طَالِب (أ) كَالْحِوَارِ السَّابِقِ وَاكْتُبِ الْمَعْلُومَاتِ النَّاقِصَةَ.", german: "Jetzt bist du Student (ب)." }, items: FLIGHTS_B.map(flightQuiz("b")) },
    { kind: "cloze", slug: "step-5", title: "Übung 4: Fragen zu den Bildern", navLabel: "Übung 4", instruction: { arabic: "تَدْرِيبٌ (٤): أَجِبْ عَنِ الْأَسْئِلَةِ.", german: "Übung 4: Antworte – mit dem, was das Bild zeigt (Regen, Frühstück, Aufwachen, Schulklasse, Shorts, Fernsehen)." }, items: EX4.map(([q, a, w], n) => ({ id: `e4-${n + 1}`, lines: [{ label: String(n + 1), parts: [q] }, { label: "", parts: [gap([a], sorted([a, ...w]))] }] })) },
    {
      kind: "quiz",
      slug: "step-6",
      title: "Übung 5: die richtige Beschreibung",
      navLabel: "Übung 5",
      instruction: { arabic: "تَدْرِيبٌ (٥): ١) اِخْتَرِ الْإِجَابَةَ الصَّحِيحَةَ وَاكْتُبْهَا تَحْتَ الصُّورَةِ الْمُنَاسِبَةِ.", german: "Übung 5: Welche Beschreibung gehört zu welchem Bild?" },
      items: EX5.map(([pic, right], n) => ({ id: `e5-${n + 1}`, arabic: pic, show: true, spoken: right, questions: [{ prompt: "Die Beschreibung:", options: EX5_OPTIONS, answer: EX5_OPTIONS.indexOf(right) }] })),
    },
    {
      kind: "quiz",
      slug: "step-7",
      title: "Übung 6: Das Wetter in drei Städten",
      navLabel: "Übung 6",
      instruction: { arabic: "تَدْرِيبٌ (٦): طَالِب (أ): اِسْأَلْ زَمِيلَكَ ثُمَّ امْلَأِ الْفَرَاغَ، اسْتَخْدِمْ: حَارّ – دَافِئ – مُعْتَدِل – بَارِد – بَارِد جِدًّا كَالْمِثَالِ: أ – كَيْفَ حَالُ الْجَوِّ فِي سِيَاتِل فِي شَهْرَيْ يَنَايِر وَفِبْرَايِر؟ ب – الْجَوُّ مُمْطِرٌ وَحَارٌّ.", german: "Übung 6: Du bist Student (أ). Frag nach den leeren Feldern deiner Tabelle (Ägypten, Sydney, Seattle) – die Antworten stehen in der Tabelle von Student (ب).", note: "Das Beispiel des Buchs passt nicht zur Tabelle (dort: Seattle im Januar 8° mit Schnee). Alif fragt nach Temperatur und Wetter-Zeichen der Tabelle." },
      items: WEATHER6.map(([q, temp, w, wrongT], n) => {
        const options = sorted([temp, wrongT]);
        const ws = sorted([w, w === "مُشْمِس" ? "مُمْطِر" : "مُشْمِس"]);
        return { id: `w6-${n + 1}`, arabic: q, show: true, spoken: `الْجَوُّ ${w === "ثَلْج" ? "بَارِدٌ وَثَلْجٌ" : w}، دَرَجَةُ الْحَرَارَةِ ${TEMP_WORD[temp]}.`, questions: [{ prompt: "دَرَجَةُ الْحَرَارَةِ:", options, answer: options.indexOf(temp) }, { prompt: "الطَّقْسُ:", options: ws, answer: ws.indexOf(w) }] } satisfies QuizItem;
      }),
    },
    {
      kind: "quiz",
      slug: "step-8",
      title: "Übung 7 (1): Wer trägt was?",
      navLabel: "Übung 7 (1)",
      instruction: { arabic: "تَدْرِيبٌ (٧): ١) مَنْ يَلْبَسُ هَذِهِ الْمَلَابِسَ؟ نَظَّارَة – شُورْت – لِبَاسُ الْبَحْرِ (مَايُوه) – حِذَاءُ رِيَاضَةٍ – بَنْطَلُون جِينْز – تِي شِيرْت – جُونِلَّة (تَنُّورَة) – قُبَّعَة · أ – يَلْبَسُ لِبَاسَ الْبَحْرِ وَائِل وَسِهَام وَسَيْف.", german: "Übung 7: Am Strand – wer trägt was? (Das erste beantwortet das Buch.)" },
      items: ([
        ["مَنْ يَلْبَسُ بَنْطَلُونًا طَوِيلًا؟", "مَاجِد", ["سَيْف", "تَهَانِي"]],
        ["مَنْ يَلْبَسُ نَظَّارَةً؟", "مَاجِد", ["سِهَام", "وَائِل"]],
        ["مَنْ تَلْبَسُ جُونِلَّةً؟", "عَبِير", ["سِهَام", "تَهَانِي"]],
        ["مَنْ تَلْبَسُ قُبَّعَةً؟", "عَبِير وَتَهَانِي", ["سِهَام", "مَاجِد"]],
      ] as Array<[string, string, string[]]>).map(([q, a, w], n) => {
        const options = sorted([a, ...w]);
        return { id: `beach-${n + 1}`, arabic: q, questions: [{ prompt: "Die Antwort:", options, answer: options.indexOf(a) }] };
      }),
    },
    { kind: "match", slug: "step-9", title: "Übung 7 (2): Was macht jeder?", navLabel: "Übung 7 (2)", instruction: { arabic: "٢) مَاذَا يَفْعَلُ كُلٌّ مِنْهُمْ؟ يَجْرِي – يَقْرَأُ – يَكْتُبُ – يَلْعَبُ – يَسْبَحُ", german: "Was macht jeder am Strand? (Sayf läuft, Siham schwimmt, Wail und Abir spielen Ball, Magid schreibt, Tahani liest.)", note: "Die Tätigkeiten sind aus dem Bild abgelesen." }, match: BEACH },
    { kind: "match", slug: "step-10", title: "Übung 8 (1): Sätze zum Bild", navLabel: "Übung 8 (1)", instruction: { arabic: "تَدْرِيبٌ (٨): ١) صِلِ الْجُمْلَةَ (أ) مَعَ (ب) لِتُكَوِّنَ جُمَلًا عَنِ الصُّورَةِ.", german: "Übung 8: Verbinde die Namen mit den Sätzen zum Bild (Wohnzimmer)." }, match: LIVING },
    { kind: "cloze", slug: "step-11", title: "Übung 8 (2): Fragen zum Bild", navLabel: "Übung 8 (2)", instruction: { arabic: "٢) اُكْتُبْ سُؤَالًا عَنِ الْأَشْخَاصِ فِي الصُّورَةِ ثُمَّ أَجِبْ عَنِ السُّؤَالِ. اسْتَخْدِمْ: هَلْ / مَاذَا / مَنْ / أَيْنَ؟ مِثَال: هَلْ سَنَاء تَلْعَبُ؟ – لَا، سَنَاء لَا تَلْعَبُ. – مَاذَا تَفْعَلُ سَنَاء؟ – هِيَ تَتَكَلَّمُ فِي التِّلِيفُونِ.", german: "Frage und Antwort zu den Personen im Bild.", note: "Nr. 6 im Buch nennt „سلمى“; im Bild heißt die schreibende Frau صفاء – so steht es gedruckt." }, items: LIVING_Q },
    { kind: "quiz", slug: "step-12", title: "Übung 9 (1): Huwaidas Wochenende", navLabel: "Übung 9 (1)", instruction: { arabic: "تَدْرِيبٌ (٩): ١) مَاذَا تَعْمَلُ هُوَيْدَا فِي الْإِجَازَةِ الْأُسْبُوعِيَّةِ؟ اخْتَرْ (✓) أَوْ (×). مِثَال: هُوَيْدَا لَا تُشَاهِدُ التِّلِيفِزْيُونَ فِي الْإِجَازَةِ.", german: "Übung 9: Was macht Huwaida am Wochenende? Die Kreuze (×) im Bild zeigen, was sie nicht macht." }, items: tick("huwaida", "هُوَيْدَا", HUWAIDA) },
    { kind: "quiz", slug: "step-13", title: "Übung 9 (2): Das Wochenende ihres Vaters", navLabel: "Übung 9 (2)", instruction: { arabic: "٢) مَاذَا يَفْعَلُ وَالِدُ هُوَيْدَا فِي الْإِجَازَةِ الْأُسْبُوعِيَّةِ؟ اخْتَرْ (✓) أَوْ (×). مِثَال: وَالِدُ هُوَيْدَا يَسْمَعُ الْمُوسِيقَى فِي الْإِجَازَةِ.", german: "Und ihr Vater?" }, items: tick("father", "وَالِدُ هُوَيْدَا", FATHER) },
  ],
};
