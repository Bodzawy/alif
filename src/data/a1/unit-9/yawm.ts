import type { A1Lesson, ClozeItem, ClozePart, Dialogue, DialogueSpeaker, MatchContent, PhraseItem, QuizItem, TableCell } from "@/data/types";
import { transliterate } from "@/lib/arabic/transliterate";

import { unvocalised } from "../letter-lesson";
import { lines } from "../sabah-al-khayr";

// Unit 9 "أحداث وأفعال يومية أو روتينية" (book pages 247–265, PDF 279–297):
//   تقديم (١) "يَوْمٌ فِي حَيَاةِ بَاسِم" (pp. 248–257): Basim's day (13 pictures),
//   Said and Basim, لاحظ القواعد (the present tense: أنا أنت أنتِ هو هي), تدريب
//   ١–٨ (٤: Safaa, ٧: Magdy's house, ٨: three texts), المحادثة (survey – class).
//   تقديم (٢) "الْإِجَازَةُ الْأُسْبُوعِيَّةُ" (pp. 258–265): Hala and Husain,
//   negation with لا, تدريب ١–٥ (٤: Emad and Fawwaz, ٥: Mrs Asmaa),
//   المحادثة (the family of Mazin as-Sabahi), تذكر.

const IMG = "/images/a1/unit-9";
const gap = (accept: string[], options: string[]): ClozePart => ({ accept, options });
const sorted = (xs: string[]) => [...new Set(xs)].sort((a, b) => a.localeCompare(b, "ar"));
const sp = (id: string, name: string, voice: DialogueSpeaker["voice"], alt: string): DialogueSpeaker => ({ id, name, voice, avatar: { src: `${IMG}/${id}.svg`, alt } });
const phrase = (id: string, arabic: string, german: string): PhraseItem => ({ id, arabic, transliteration: transliterate(arabic), german, exercise: { id, target: unvocalised(arabic).replace(/[.؟?!،,:()–-]/g, " ").replace(/\s+/g, " ").trim(), modelText: arabic } });

/** The verbs of the book's tables: he, I, you (m), you (f), she. */
export const VERBS: Array<[huwa: string, ana: string, anta: string, anti: string, hiya: string, de: string]> = [
  ["يَسْتَيْقِظُ", "أَسْتَيْقِظُ", "تَسْتَيْقِظُ", "تَسْتَيْقِظِينَ", "تَسْتَيْقِظُ", "aufwachen"],
  ["يَشْرَبُ", "أَشْرَبُ", "تَشْرَبُ", "تَشْرَبِينَ", "تَشْرَبُ", "trinken"],
  ["يَقْرَأُ", "أَقْرَأُ", "تَقْرَأُ", "تَقْرَئِينَ", "تَقْرَأُ", "lesen"],
  ["يُفْطِرُ", "أُفْطِرُ", "تُفْطِرُ", "تُفْطِرِينَ", "تُفْطِرُ", "frühstücken"],
  ["يَغْسِلُ", "أَغْسِلُ", "تَغْسِلُ", "تَغْسِلِينَ", "تَغْسِلُ", "waschen"],
  ["يَلْبَسُ", "أَلْبَسُ", "تَلْبَسُ", "تَلْبَسِينَ", "تَلْبَسُ", "anziehen"],
  ["يَرْكَبُ", "أَرْكَبُ", "تَرْكَبُ", "تَرْكَبِينَ", "تَرْكَبُ", "fahren (mit)"],
  ["يَذْهَبُ", "أَذْهَبُ", "تَذْهَبُ", "تَذْهَبِينَ", "تَذْهَبُ", "gehen"],
  ["يَتَغَدَّى", "أَتَغَدَّى", "تَتَغَدَّى", "تَتَغَدَّيْنَ", "تَتَغَدَّى", "zu Mittag essen"],
  ["يَعْمَلُ", "أَعْمَلُ", "تَعْمَلُ", "تَعْمَلِينَ", "تَعْمَلُ", "arbeiten"],
  ["يَرْجِعُ", "أَرْجِعُ", "تَرْجِعُ", "تَرْجِعِينَ", "تَرْجِعُ", "zurückkehren"],
  ["يُشَاهِدُ", "أُشَاهِدُ", "تُشَاهِدُ", "تُشَاهِدِينَ", "تُشَاهِدُ", "fernsehen, ansehen"],
];

/** أ) Basim's day: the 13 sentences of the book, the clock times read from the pictures. */
const DAY: Array<[sentence: string, time: string, timeWords: string, de: string]> = [
  ["يَسْتَيْقِظُ مِنَ النَّوْمِ", "٦ صَبَاحًا", "السَّادِسَةَ صَبَاحًا", "Er wacht um 6 Uhr morgens auf."],
  ["يَشْرَبُ الْقَهْوَةَ وَيَقْرَأُ الْجَرِيدَةَ", "٦,١٥", "السَّادِسَةَ وَالرُّبْعَ", "Er trinkt Kaffee und liest die Zeitung."],
  ["يُفْطِرُ", "٦,٣٠", "السَّادِسَةَ وَالنِّصْفَ", "Er frühstückt."],
  ["يَغْسِلُ وَجْهَهُ", "٧,٠٠", "السَّابِعَةَ", "Er wäscht sich das Gesicht."],
  ["يَلْبَسُ مَلَابِسَهُ", "٧,١٥", "السَّابِعَةَ وَالرُّبْعَ", "Er zieht sich an."],
  ["يَرْكَبُ سَيَّارَتَهُ", "٧,٣٠", "السَّابِعَةَ وَالنِّصْفَ", "Er steigt in sein Auto."],
  ["يَذْهَبُ إِلَى الْعَمَلِ", "٧,٤٥", "الثَّامِنَةَ إِلَّا الرُّبْعَ", "Er fährt zur Arbeit."],
  ["يَتَغَدَّى", "١,٠٠", "الْوَاحِدَةَ", "Er isst zu Mittag."],
  ["يَعْمَلُ إِلَى", "٤,٠٠", "الرَّابِعَةِ", "Er arbeitet bis 4 Uhr."],
  ["يَرْجِعُ إِلَى الْبَيْتِ", "٤,٣٠", "الرَّابِعَةِ وَالنِّصْفِ", "Er kommt nach Hause."],
  ["يُشَاهِدُ التِّلِيفِزْيُونَ", "٨,٠٠", "الثَّامِنَةَ", "Er sieht fern."],
  ["يَتَعَشَّى", "٨,٣٠", "الثَّامِنَةَ وَالنِّصْفَ", "Er isst zu Abend."],
  ["يَنَامُ", "١١,٠٠", "الْحَادِيَةَ عَشْرَةَ", "Er geht schlafen."],
];
const DAY_TIMES = DAY.map((d) => d[1]);

export const saidBasim: Dialogue = {
  id: "said-basim",
  intro: "Said ruft Basim an: Kommt er mit in die Cafeteria?",
  speakers: [sp("said", "Said", "male-2", "Said, ein junger Mann am Telefon"), sp("basim", "Basim", "male-1", "Basim im Büro")],
  lines: lines([
    ["u9-sb-1", "said", "أَلُو، بَاسِم هَلْ تَذْهَبُ مَعِي إِلَى الْكَافِتِيرْيَا الْآنَ؟", "ألو باسم هل تذهب معي إلى الكافتيريا الآن", "Alū, Bāsim, hal tadhhabu maʿī ila l-kāfitīryā l-ān?", "Hallo Basim, kommst du jetzt mit mir in die Cafeteria?"],
    ["u9-sb-2", "basim", "لَا، آسِفٌ يَا سَعِيدُ. أَنَا أَعْمَلُ فِي الْمَكْتَبِ الْآنَ.", "لا آسف يا سعيد أنا أعمل في المكتب الآن", "Lā, āsifun yā Saʿīd. Ana aʿmalu fi l-maktabi l-ān.", "Nein, tut mir leid, Said. Ich arbeite jetzt im Büro."],
  ]),
  question: { prompt: "مَاذَا يَفْعَلُ بَاسِم الْآنَ؟", options: ["يَعْمَلُ فِي الْمَكْتَبِ.", "يَذْهَبُ إِلَى الْكَافِتِيرْيَا.", "يَنَامُ."], answer: 0 },
};

/** تدريب ١: what is Ali doing now? (picture by picture; the first is the book's model). */
const ALI: Array<[right: string, wrong: string[]]> = [
  ["هُوَ يَشْرَبُ الْقَهْوَةَ الْآنَ.", []],
  ["هُوَ يَقْرَأُ الْجَرِيدَةَ.", ["هُوَ يَنَامُ.", "هُوَ يَتَغَدَّى."]],
  ["هُوَ يَسْتَيْقِظُ مِنَ النَّوْمِ.", ["هُوَ يَرْكَبُ السَّيَّارَةَ.", "هُوَ يُشَاهِدُ التِّلِيفِزْيُونَ."]],
  ["هُوَ يَذْهَبُ إِلَى الْعَمَلِ.", ["هُوَ يُفْطِرُ.", "هُوَ يَنَامُ."]],
  ["هُوَ يَغْسِلُ وَجْهَهُ.", ["هُوَ يَشْرَبُ الْقَهْوَةَ.", "هُوَ يَقْرَأُ الْجَرِيدَةَ."]],
  ["هُوَ يُفْطِرُ.", ["هُوَ يَغْسِلُ وَجْهَهُ.", "هُوَ يَلْبَسُ مَلَابِسَهُ."]],
  ["هُوَ يَتَغَدَّى.", ["هُوَ يَرْجِعُ إِلَى الْبَيْتِ.", "هُوَ يَسْتَيْقِظُ."]],
  ["هُوَ يَعْمَلُ.", ["هُوَ يَنَامُ.", "هُوَ يَرْكَبُ الْأُوتُوبِيسَ."]],
  ["هُوَ يَرْكَبُ الْأُوتُوبِيسَ.", ["هُوَ يَعْمَلُ.", "هُوَ يُفْطِرُ."]],
];

/** تدريب ٢: a sentence under each picture with the given pronoun. */
const T2: Array<[pronoun: string, right: string, wrong: string[], de: string]> = [
  ["أَنْتِ", "أَنْتِ تَشْرَبِينَ الشَّايَ.", ["أَنْتِ تَشْرَبُ الشَّايَ.", "أَنْتِ تَقْرَئِينَ كِتَابًا."], "Eine Frau trinkt Tee."],
  ["هِيَ", "هِيَ تَقْرَأُ كِتَابًا السَّاعَةَ التَّاسِعَةَ.", [], "Beispiel im Buch"],
  ["هُوَ", "هُوَ يَلْبَسُ مَلَابِسَهُ.", ["هُوَ تَلْبَسُ مَلَابِسَهُ.", "هُوَ يَرْكَبُ سَيَّارَتَهُ."], "Ein Mann zieht sich an."],
  ["أَنَا", "أَنَا أُشَاهِدُ التِّلِيفِزْيُونَ.", ["أَنَا يُشَاهِدُ التِّلِيفِزْيُونَ.", "أَنَا أَنَامُ."], "Ein Mann vor dem Fernseher"],
  ["أَنْتِ", "أَنْتِ تُفْطِرِينَ.", ["أَنْتِ تُفْطِرُ.", "أَنْتِ تَغْسِلِينَ."], "Eine Mutter füttert ein Kind."],
  ["أَنَا", "أَنَا أَرْكَبُ السَّيَّارَةَ.", ["أَنَا تَرْكَبُ السَّيَّارَةَ.", "أَنَا أَذْهَبُ إِلَى الْبَيْتِ."], "Ein Auto"],
  ["أَنْتَ", "أَنْتَ تَنَامُ.", ["أَنْتَ يَنَامُ.", "أَنْتَ تَنَامِينَ."], "Ein Mann schläft."],
  ["أَنْتَ", "أَنْتَ تَتَغَدَّى.", ["أَنْتَ تَتَغَدَّيْنَ.", "أَنْتَ يَتَغَدَّى."], "Ein Mann isst."],
];

/** تدريب ٣: the right verb for each pronoun (the book's three columns). */
const T3: Array<[pronoun: string, object: string, verbs: [string, string, string, string, string]]> = [
  ["أَنْتَ", "كِتَابًا.", ["تَقْرَأُ", "أَقْرَأُ", "يَقْرَأُ", "تَقْرَئِينَ", "تَقْرَأُ"]],
  ["أَنْتِ", "كِتَابًا.", ["تَقْرَئِينَ", "تَقْرَأُ", "أَقْرَأُ", "يَقْرَأُ", "تَقْرَئِينَ"]],
  ["أَنَا", "كِتَابًا.", ["أَقْرَأُ", "تَقْرَأُ", "يَقْرَأُ", "تَقْرَئِينَ", "أَقْرَأُ"]],
  ["هُوَ", "كِتَابًا.", ["يَقْرَأُ", "تَقْرَأُ", "أَقْرَأُ", "تَقْرَئِينَ", "يَقْرَأُ"]],
  ["هِيَ", "كِتَابًا.", ["تَقْرَأُ", "يَقْرَأُ", "أَقْرَأُ", "تَقْرَئِينَ", "تَقْرَأُ"]],
  ["هِيَ", "قَهْوَةً.", ["تَشْرَبُ", "يَشْرَبُ", "أَشْرَبُ", "تَشْرَبِينَ", "تَشْرَبُ"]],
  ["أَنْتِ", "شَايًا.", ["تَشْرَبِينَ", "تَشْرَبُ", "يَشْرَبُ", "أَشْرَبُ", "تَشْرَبِينَ"]],
  ["أَنَا", "لَبَنًا.", ["أَشْرَبُ", "تَشْرَبُ", "يَشْرَبُ", "تَشْرَبِينَ", "أَشْرَبُ"]],
  ["أَنْتَ", "عَصِيرًا.", ["تَشْرَبُ", "تَشْرَبِينَ", "يَشْرَبُ", "أَشْرَبُ", "تَشْرَبُ"]],
  ["هُوَ", "كُوكَاكُولَا.", ["يَشْرَبُ", "تَشْرَبُ", "أَشْرَبُ", "تَشْرَبِينَ", "يَشْرَبُ"]],
  ["أَنَا", "صَبَاحًا.", ["أُفْطِرُ", "تُفْطِرُ", "يُفْطِرُ", "تُفْطِرِينَ", "أُفْطِرُ"]],
  ["هِيَ", "صَبَاحًا.", ["تُفْطِرُ", "يُفْطِرُ", "أُفْطِرُ", "تُفْطِرِينَ", "تُفْطِرُ"]],
  ["أَنْتِ", "صَبَاحًا.", ["تُفْطِرِينَ", "تُفْطِرُ", "يُفْطِرُ", "أُفْطِرُ", "تُفْطِرِينَ"]],
  ["هُوَ", "صَبَاحًا.", ["يُفْطِرُ", "تُفْطِرُ", "أُفْطِرُ", "تُفْطِرِينَ", "يُفْطِرُ"]],
  ["أَنْتَ", "صَبَاحًا.", ["تُفْطِرُ", "تُفْطِرِينَ", "يُفْطِرُ", "أُفْطِرُ", "تُفْطِرُ"]],
];

/** تدريب ٤: Safaa's day (listening text = the completed paragraph of (٣)). */
const SAFAA_BOX = ["تَعْمَلُ", "تُفْطِرُ", "تَرْجِعُ", "تَذْهَبُ", "تُشَاهِدُ", "تَقْرَأُ", "تَنَامُ", "تَسْتَيْقِظُ", "تَتَغَدَّى", "تَتَعَشَّى", "تَرْكَبُ"];
const box = (right: string) => gap([right], sorted(SAFAA_BOX));
const SAFAA: ClozeItem[] = [
  { id: "s1", lines: [{ label: "", parts: ["صَفَاء ", gap(["مُدَرِّسَةٌ"], ["مُدَرِّسَةٌ", "طَالِبَةٌ"]), " فِي مَدْرَسَةِ السَّيِّدَةِ عَائِشَةَ. هِيَ ", box("تَذْهَبُ"), " إِلَى الْعَمَلِ كُلَّ يَوْمٍ."] }] },
  { id: "s2", lines: [{ label: "", parts: ["الْعُطْلَةُ الْأُسْبُوعِيَّةُ يَوْمَيِ الْجُمْعَةِ وَالسَّبْتِ."] }] },
  { id: "s3", lines: [{ label: "", parts: ["هِيَ ", box("تَسْتَيْقِظُ"), " السَّاعَةَ السَّادِسَةَ صَبَاحًا وَ", box("تُفْطِرُ"), " ثُمَّ ", box("تَرْكَبُ"), " السَّيَّارَةَ إِلَى الْعَمَلِ السَّاعَةَ ٧,٣٠."] }] },
  { id: "s4", lines: [{ label: "", parts: ["وَصَفَاء ", box("تَتَغَدَّى"), " فِي الْمَدْرَسَةِ السَّاعَةَ ١٢ ظُهْرًا."] }] },
  { id: "s5", lines: [{ label: "", parts: ["هِيَ ", box("تَرْجِعُ"), " إِلَى الْبَيْتِ السَّاعَةَ الرَّابِعَةَ. وَ", box("تَتَعَشَّى"), " السَّاعَةَ الْخَامِسَةَ، ثُمَّ ", box("تُشَاهِدُ"), " التِّلِيفِزْيُونَ أَوْ ", box("تَقْرَأُ"), " كِتَابًا."] }] },
  { id: "s6", lines: [{ label: "", parts: ["هِيَ ", box("تَنَامُ"), " السَّاعَةَ الْعَاشِرَةَ مَسَاءً."] }] },
];
const SAFAA_TEXT = "صَفَاء مُدَرِّسَةٌ فِي مَدْرَسَةِ السَّيِّدَةِ عَائِشَةَ. هِيَ تَذْهَبُ إِلَى الْعَمَلِ كُلَّ يَوْمٍ. الْعُطْلَةُ الْأُسْبُوعِيَّةُ يَوْمَيِ الْجُمْعَةِ وَالسَّبْتِ. هِيَ تَسْتَيْقِظُ السَّاعَةَ السَّادِسَةَ صَبَاحًا وَتُفْطِرُ ثُمَّ تَرْكَبُ السَّيَّارَةَ إِلَى الْعَمَلِ السَّاعَةَ السَّابِعَةَ وَالنِّصْفَ. وَصَفَاء تَتَغَدَّى فِي الْمَدْرَسَةِ السَّاعَةَ الثَّانِيَةَ عَشْرَةَ ظُهْرًا. هِيَ تَرْجِعُ إِلَى الْبَيْتِ السَّاعَةَ الرَّابِعَةَ، وَتَتَعَشَّى السَّاعَةَ الْخَامِسَةَ، ثُمَّ تُشَاهِدُ التِّلِيفِزْيُونَ أَوْ تَقْرَأُ كِتَابًا. هِيَ تَنَامُ السَّاعَةَ الْعَاشِرَةَ مَسَاءً.";
const SAFAA_TRUE: Array<[string, boolean]> = [
  ["صَفَاء طَالِبَةٌ.", false], ["صَفَاء مُدَرِّسَةٌ فِي مَدْرَسَةِ الشُّرُوقِ.", false], ["صَفَاء تَسْتَيْقِظُ السَّاعَةَ الْخَامِسَةَ صَبَاحًا.", false], ["صَفَاء تَعْمَلُ ٥ أَيَّامٍ فِي الْأُسْبُوعِ.", true],
  ["هِيَ تَذْهَبُ إِلَى الْعَمَلِ السَّاعَةَ ٧,٣٠ صَبَاحًا.", true], ["هِيَ تَتَعَشَّى السَّاعَةَ ٨:١٥.", false], ["صَفَاء تَنَامُ السَّاعَةَ الْعَاشِرَةَ مَسَاءً.", true],
];

/** تدريب ٥: a fitting verb (the book leaves the choice; one answer per sentence). */
const T5: Array<[before: string, right: string, after: string, options: string[]]> = [
  ["أَحْمَد", "يَعْمَلُ", "حَتَّى السَّاعَةِ الْخَامِسَةِ مَسَاءً.", ["يَعْمَلُ", "تَعْمَلُ", "أَعْمَلُ"]],
  ["نِهَاد", "تَلْبَسُ", "ثَوْبًا جَمِيلًا الْآنَ.", ["تَلْبَسُ", "يَلْبَسُ", "أَلْبَسُ"]],
  ["أَنَا", "أَرْكَبُ", "سَيَّارَةً حَمْرَاءَ.", ["أَرْكَبُ", "تَرْكَبُ", "يَرْكَبُ"]],
  ["مَاذَا", "تَشْرَبِينَ", "يَا سُعَاد؟ قَهْوَةً أَمْ شَايًا؟", ["تَشْرَبِينَ", "تَشْرَبُ", "يَشْرَبُ"]],
  ["سَعِيد", "يَلْبَسُ", "حِذَاءً أَسْوَدَ.", ["يَلْبَسُ", "تَلْبَسُ", "أَلْبَسُ"]],
  ["أَنَا", "أَذْهَبُ", "إِلَى الْعَمَلِ السَّاعَةَ الثَّامِنَةَ صَبَاحًا.", ["أَذْهَبُ", "تَذْهَبُ", "يَذْهَبُ"]],
  ["مَتَى", "تَذْهَبِينَ", "لِلْعَمَلِ كُلَّ يَوْمٍ يَا عَالِيَة؟", ["تَذْهَبِينَ", "تَذْهَبُ", "يَذْهَبُ"]],
  ["هَلْ", "تُشَاهِدِينَ", "التِّلِيفِزْيُونَ كُلَّ يَوْمٍ يَا مَاجِدَة؟", ["تُشَاهِدِينَ", "تُشَاهِدُ", "يُشَاهِدُ"]],
  ["سَمِير", "يَتَغَدَّى", "السَّاعَةَ ٣ ظُهْرًا.", ["يَتَغَدَّى", "تَتَغَدَّى", "أَتَغَدَّى"]],
  ["هَلْ", "تَقْرَأُ", "الْجَرِيدَةَ الْآنَ يَا مُصْطَفَى؟", ["تَقْرَأُ", "تَقْرَئِينَ", "يَقْرَأُ"]],
];

/** تدريب ٧: what is everyone doing in the picture? (Magdy is the book's example). */
const PICTURE7: Array<[name: string, right: string, wrong: string[]]> = [
  ["مَجْدِي", "يَأْخُذُ حَمَّامًا الْآنَ.", []],
  ["سَمِيرَة", "تَطْبُخُ الْآنَ.", ["تَنَامُ الْآنَ.", "تُذَاكِرُ الْآنَ."]],
  ["عُدَيّ", "يَنَامُ الْآنَ.", ["يَطْبُخُ الْآنَ.", "يَرْكَبُ السَّيَّارَةَ الْآنَ."]],
  ["زِيَاد", "يُفْطِرُ الْآنَ.", ["يَنَامُ الْآنَ.", "يُذَاكِرُ الْآنَ."]],
  ["هَانِي", "يُشَاهِدُ التِّلِيفِزْيُونَ الْآنَ.", ["يَأْخُذُ حَمَّامًا الْآنَ.", "يُفْطِرُ الْآنَ."]],
  ["مَاجِدَة", "تَلْبَسُ مَلَابِسَهَا الْآنَ.", ["تَطْبُخُ الْآنَ.", "تَنَامُ الْآنَ."]],
  ["مُصْطَفَى", "يُذَاكِرُ الْآنَ.", ["يَنَامُ الْآنَ.", "يَأْخُذُ حَمَّامًا الْآنَ."]],
  ["جِهَاد", "يَرْكَبُ السَّيَّارَةَ الْآنَ.", ["يُذَاكِرُ الْآنَ.", "يُفْطِرُ الْآنَ."]],
];

/** تدريب ٨: the three texts (listening 12–14). */
const TEXTS: Array<[id: string, title: string, lines: string[], picture: number]> = [
  ["nada", "(أ)", ["أَنَا اسْمِي نَدَى.", "أَنَا أَعْمَلُ سِكْرِتِيرَةً.", "أَتَغَدَّى السَّاعَةَ الْوَاحِدَةَ.", "وَأَشْرَبُ الْقَهْوَةَ فِي الِاسْتِرَاحَةِ.", "أَرْجِعُ إِلَى الْبَيْتِ السَّاعَةَ السَّادِسَةَ مَسَاءً.", "أُشَاهِدُ فِيلْمًا جَمِيلًا بَعْدَ الْعَشَاءِ."], 2],
  ["rajia", "(ب)", ["أَنَا اسْمِي رَاجِيَة.", "أَنَا أَعْمَلُ طَبِيبَةً فِي مُسْتَشْفَى الْهِلَالِ.", "أَذْهَبُ إِلَى الْعَمَلِ السَّاعَةَ التَّاسِعَةَ وَأَرْجِعُ إِلَى الْبَيْتِ السَّاعَةَ الرَّابِعَةَ.", "أَتَغَدَّى ثُمَّ أُشَاهِدُ التِّلِيفِزْيُونَ وَأَقْرَأُ الْأَخْبَارَ فِي الْجَرِيدَةِ، ثُمَّ أَنَامُ السَّاعَةَ الْعَاشِرَةَ مَسَاءً."], 3],
  ["mustafa", "(ج)", ["أَنَا اسْمِي مُصْطَفَى.", "أَنَا أَعْمَلُ مُدَرِّسًا.", "أَسْتَيْقِظُ السَّاعَةَ السَّابِعَةَ وَأُفْطِرُ السَّاعَةَ ٧:٣٠ وَأَشْرَبُ الْقَهْوَةَ السَّاعَةَ ١٢.", "وَأَتَغَدَّى فِي الْمَدْرَسَةِ السَّاعَةَ الْوَاحِدَةَ.", "ثُمَّ أَرْجِعُ إِلَى الْبَيْتِ السَّاعَةَ ٣، ثُمَّ أَذْهَبُ إِلَى النَّادِي وَأَلْعَبُ التِّنِسَ حَتَّى السَّاعَةِ الْخَامِسَةِ."], 1],
];
const DE_TEXT: Record<string, string> = {
  "أَنَا اسْمِي نَدَى.": "Ich heiße Nada.", "أَنَا أَعْمَلُ سِكْرِتِيرَةً.": "Ich arbeite als Sekretärin.", "أَتَغَدَّى السَّاعَةَ الْوَاحِدَةَ.": "Ich esse um ein Uhr zu Mittag.", "وَأَشْرَبُ الْقَهْوَةَ فِي الِاسْتِرَاحَةِ.": "Und ich trinke in der Pause Kaffee.",
  "أَرْجِعُ إِلَى الْبَيْتِ السَّاعَةَ السَّادِسَةَ مَسَاءً.": "Ich komme um sechs Uhr abends nach Hause.", "أُشَاهِدُ فِيلْمًا جَمِيلًا بَعْدَ الْعَشَاءِ.": "Nach dem Abendessen sehe ich einen schönen Film.",
  "أَنَا اسْمِي رَاجِيَة.": "Ich heiße Rajia.", "أَنَا أَعْمَلُ طَبِيبَةً فِي مُسْتَشْفَى الْهِلَالِ.": "Ich arbeite als Ärztin im al-Hilal-Krankenhaus.", "أَذْهَبُ إِلَى الْعَمَلِ السَّاعَةَ التَّاسِعَةَ وَأَرْجِعُ إِلَى الْبَيْتِ السَّاعَةَ الرَّابِعَةَ.": "Ich gehe um neun zur Arbeit und komme um vier nach Hause.",
  "أَتَغَدَّى ثُمَّ أُشَاهِدُ التِّلِيفِزْيُونَ وَأَقْرَأُ الْأَخْبَارَ فِي الْجَرِيدَةِ، ثُمَّ أَنَامُ السَّاعَةَ الْعَاشِرَةَ مَسَاءً.": "Ich esse zu Mittag, sehe fern und lese die Nachrichten in der Zeitung, dann schlafe ich um zehn Uhr abends.",
  "أَنَا اسْمِي مُصْطَفَى.": "Ich heiße Mustafa.", "أَنَا أَعْمَلُ مُدَرِّسًا.": "Ich arbeite als Lehrer.", "أَسْتَيْقِظُ السَّاعَةَ السَّابِعَةَ وَأُفْطِرُ السَّاعَةَ ٧:٣٠ وَأَشْرَبُ الْقَهْوَةَ السَّاعَةَ ١٢.": "Ich wache um sieben auf, frühstücke um 7:30 und trinke um 12 Kaffee.",
  "وَأَتَغَدَّى فِي الْمَدْرَسَةِ السَّاعَةَ الْوَاحِدَةَ.": "Und ich esse um eins in der Schule zu Mittag.", "ثُمَّ أَرْجِعُ إِلَى الْبَيْتِ السَّاعَةَ ٣، ثُمَّ أَذْهَبُ إِلَى النَّادِي وَأَلْعَبُ التِّنِسَ حَتَّى السَّاعَةِ الْخَامِسَةِ.": "Dann komme ich um 3 nach Hause und gehe in den Klub und spiele Tennis bis fünf Uhr.",
};
const spokenTime = (s: string) => s.replace("٧:٣٠", "السَّابِعَةِ وَالنِّصْفِ").replace("السَّاعَةَ ١٢", "السَّاعَةَ الثَّانِيَةَ عَشْرَةَ").replace("السَّاعَةَ ٣", "السَّاعَةَ الثَّالِثَةَ");

const MUSTAFA_Q: ClozeItem[] = [
  { id: "m1", lines: [{ label: "١", parts: ["مَاذَا يَعْمَلُ مُصْطَفَى؟ – ", gap(["هُوَ مُدَرِّسٌ."], ["هُوَ مُدَرِّسٌ.", "هُوَ طَبِيبٌ.", "هُوَ سِكْرِتِيرٌ."])] }] },
  { id: "m2", lines: [{ label: "٢", parts: ["مَتَى يَسْتَيْقِظُ؟ – ", gap(["يَسْتَيْقِظُ السَّاعَةَ السَّابِعَةَ."], ["يَسْتَيْقِظُ السَّاعَةَ السَّابِعَةَ.", "يَسْتَيْقِظُ السَّاعَةَ السَّادِسَةَ.", "يَسْتَيْقِظُ السَّاعَةَ التَّاسِعَةَ."])] }] },
  { id: "m3", lines: [{ label: "٣", parts: ["مَتَى يُفْطِرُ؟ – ", gap(["يُفْطِرُ السَّاعَةَ ٧:٣٠."], ["يُفْطِرُ السَّاعَةَ ٧:٣٠.", "يُفْطِرُ السَّاعَةَ ١٢.", "يُفْطِرُ السَّاعَةَ ٣."])] }] },
  { id: "m4", lines: [{ label: "٤", parts: ["مَاذَا يَعْمَلُ مُصْطَفَى السَّاعَةَ ١٢؟ – ", gap(["يَشْرَبُ الْقَهْوَةَ."], ["يَشْرَبُ الْقَهْوَةَ.", "يَتَغَدَّى.", "يَلْعَبُ التِّنِسَ."])] }] },
  { id: "m5", lines: [{ label: "٥", parts: ["مَتَى يَتَغَدَّى؟ – ", gap(["يَتَغَدَّى السَّاعَةَ الْوَاحِدَةَ فِي الْمَدْرَسَةِ."], ["يَتَغَدَّى السَّاعَةَ الْوَاحِدَةَ فِي الْمَدْرَسَةِ.", "يَتَغَدَّى السَّاعَةَ الثَّالِثَةَ فِي الْبَيْتِ."])] }] },
  { id: "m6", lines: [{ label: "٦", parts: ["مَاذَا يَفْعَلُ مُصْطَفَى السَّاعَةَ الثَّالِثَةَ؟ – ", gap(["يَرْجِعُ إِلَى الْبَيْتِ."], ["يَرْجِعُ إِلَى الْبَيْتِ.", "يَذْهَبُ إِلَى الْعَمَلِ.", "يَنَامُ."])] }] },
  { id: "m7", lines: [{ label: "٧", parts: ["مَاذَا يَفْعَلُ بَعْدَ السَّاعَةِ الثَّالِثَةِ؟ – ", gap(["يَذْهَبُ إِلَى النَّادِي وَيَلْعَبُ التِّنِسَ."], ["يَذْهَبُ إِلَى النَّادِي وَيَلْعَبُ التِّنِسَ.", "يُشَاهِدُ التِّلِيفِزْيُونَ.", "يَشْرَبُ الْقَهْوَةَ."])] }] },
];

const YOU_HE: Array<[string, string]> = [["أَنَا", "ich"], ["أَنْتَ", "du (Mann)"], ["أَنْتِ", "du (Frau)"], ["هُوَ", "er"], ["هِيَ", "sie"]];

export const a1Yawm: A1Lesson = {
  slug: "yawm-fi-hayat-basim",
  kind: "phrase",
  label: "يَوْمٌ فِي حَيَاةِ بَاسِم",
  labelGerman: "Ein Tag im Leben von Basim",
  steps: [
    {
      kind: "quiz",
      slug: "step-1",
      title: "Basims Tag",
      navLabel: "Basims Tag",
      instruction: { arabic: "تَقْدِيمٌ (١): يَوْمٌ فِي حَيَاةِ بَاسِم · أ) اِقْرَأِ الْقِصَّةَ. مَاذَا يَفْعَلُ بَاسِم كُلَّ يَوْمٍ؟", german: "Lies, was Basim jeden Tag macht – und wann. Hör jeden Satz und wähle die Uhrzeit (sie steht im Buch auf den Uhren).", note: "Die Uhrzeiten sind aus den Uhren der Bilder abgelesen; das erste Bild nennt ٦ صَبَاحًا." },
      items: DAY.map(([sentence, time, timeWords, de], n) => {
        const options = sorted([time, DAY_TIMES[(n + 3) % DAY.length]!, DAY_TIMES[(n + 6) % DAY.length]!]);
        return { id: `day-${n + 1}`, arabic: `${sentence} السَّاعَةَ …`, spoken: `${sentence} السَّاعَةَ ${timeWords}.`, german: de, questions: [{ prompt: "Wann?", options, answer: options.indexOf(time) }] } satisfies QuizItem;
      }),
    },
    {
      kind: "phrases",
      slug: "step-2",
      title: "Nachsprechen: Basims Tag",
      navLabel: "Nachsprechen",
      instruction: { arabic: "أ) اِقْرَأِ الْقِصَّةَ.", german: "Sprich jeden Satz nach – mit der Uhrzeit." },
      groups: [{ id: "day", title: "مَاذَا يَفْعَلُ بَاسِم كُلَّ يَوْمٍ؟", items: DAY.map(([sentence, , timeWords, de], n) => phrase(`day-say-${n + 1}`, `${sentence} السَّاعَةَ ${timeWords}.`, de)) }],
    },
    { kind: "dialogue", mode: "listen", slug: "step-3", title: "Was macht Basim jetzt?", navLabel: "Anhören", instruction: { arabic: "ب) اِسْمَعْ: مَاذَا يَفْعَلُ بَاسِم الْآنَ؟", german: "Hör zu: Was macht Basim jetzt?" }, dialogue: saidBasim },
    { kind: "dialogue", mode: "roleplay", slug: "step-4", title: "Rollenspiel", navLabel: "Rollenspiel", instruction: { arabic: "ب) اِسْمَعْ: مَاذَا يَفْعَلُ بَاسِم الْآنَ؟", german: "Spiel Said oder Basim." }, dialogue: saidBasim },
    {
      kind: "table",
      slug: "step-5",
      title: "Grammatik: die Gegenwart",
      navLabel: "Grammatik",
      instruction: { arabic: "لَاحِظِ الْقَوَاعِدَ: ١) زَمَنُ الْفِعْلِ الْمُضَارِعِ لِلْأَعْمَالِ الرُّوتِينِيَّةِ الْيَوْمِيَّةِ: لِلسُّؤَالِ عَنِ الْفِعْلِ نَسْأَلُ بِـ «مَاذَا»؟ مِثَال: مَاذَا يَعْمَلُ كُلَّ يَوْمٍ؟", german: "Achte auf die Regeln: Die Gegenwart (الْمُضَارِع) beschreibt, was man jeden Tag tut. Die Person zeigt sich am Anfang (und am Ende) des Verbs.", note: "Die Bewertung der Aussprache unterscheidet تَشْرَبُ und تَشْرَبِينَ nicht sicher; achte selbst auf die Endung ‑īna." },
      tables: [
        { id: "verbs", titleArabic: "لِتَصْرِيفِ زَمَنِ الْفِعْلِ الْمُضَارِعِ / الْمُضَارِعِ الْمُسْتَمِرِّ: أَنَا (أَ+) – أَنْتَ (تَ+) – أَنْتِ (تَ+ … +ينَ) – هُوَ (يَ+) – هِيَ (تَ+)", title: "Das Verb in der Gegenwart", columns: [{ arabic: "الْفِعْلُ", german: "Verb" }, ...YOU_HE.map(([a, g]) => ({ arabic: a, german: g }))], rows: VERBS.map(([huwa, ana, anta, anti, hiya, de]) => [{ arabic: huwa, german: de }, { arabic: ana }, { arabic: anta }, { arabic: anti }, { arabic: huwa }, { arabic: hiya }] satisfies TableCell[]) },
        { id: "same", titleArabic: "٣) لَاحِظْ تَشَابُهَ التَّصْرِيفِ بَيْنَ الضَّمِيرَيْنِ:", title: "Gleich: „du (Mann)“ und „sie“", columns: [{ arabic: "أَنْتَ", german: "du (Mann)" }, { arabic: "هِيَ", german: "sie" }], rows: [[{ arabic: "أَنْتَ تَغْسِلُ." }, { arabic: "هِيَ تَغْسِلُ." }], [{ arabic: "أَنْتَ تَقْرَأُ." }, { arabic: "هِيَ تَقْرَأُ." }]] },
        { id: "now", titleArabic: "٤) لِلسُّؤَالِ عَنِ الْمُضَارِعِ الْمُسْتَمِرِّ «الْآنَ»:", title: "Was machst du jetzt?", columns: [{ arabic: "السُّؤَالُ", german: "Frage" }, { arabic: "الْإِجَابَةُ", german: "Antwort" }], rows: [[{ arabic: "مَاذَا تَفْعَلُ الْآنَ؟" }, { arabic: "أَنَا أَشْرَبُ الْقَهْوَةَ الْآنَ." }]] },
      ],
      quiz: [
        { id: "ana", prompt: "„Ich trinke“", options: ["أَشْرَبُ", "تَشْرَبُ", "يَشْرَبُ"], answer: 0 },
        { id: "anti", prompt: "„Du (Frau) liest“", options: ["تَقْرَأُ", "تَقْرَئِينَ", "يَقْرَأُ"], answer: 1 },
        { id: "hiya", prompt: "„Sie wäscht“", options: ["يَغْسِلُ", "تَغْسِلُ", "أَغْسِلُ"], answer: 1 },
        { id: "ma", prompt: "„Was macht er jetzt?“", options: ["مَاذَا يَفْعَلُ الْآنَ؟", "مَاذَا تَفْعَلُ الْآنَ؟", "مَتَى يَفْعَلُ؟"], answer: 0 },
      ],
    },
    {
      kind: "phrases",
      slug: "step-6",
      title: "Die Verben: ich – du – er – sie",
      navLabel: "Verben",
      instruction: { arabic: "لِتَصْرِيفِ زَمَنِ الْفِعْلِ الْمُضَارِعِ", german: "Sprich jede Form nach: ich, du (Mann), du (Frau), er, sie." },
      groups: VERBS.slice(0, 6).map(([huwa, ana, anta, anti, hiya, de], n) => ({ id: `verb-${n + 1}`, title: `${huwa} – ${de}`, items: [ana, anta, anti, hiya].map((f, k) => phrase(`verb-${n + 1}-${k + 1}`, `${["أَنَا", "أَنْتَ", "أَنْتِ", "هِيَ"][k]} ${f}`, `${["ich", "du (Mann)", "du (Frau)", "sie"][k]}: ${de}`)) })),
    },
    {
      kind: "cloze",
      slug: "step-7",
      title: "Übung 1: Was macht Ali jetzt?",
      navLabel: "Übung 1",
      instruction: { arabic: "التَّدْرِيبَاتُ · تَدْرِيبٌ (١): ١) اُكْتُبْ جُمْلَةً تَحْتَ كُلِّ صُورَةٍ. مَاذَا يَفْعَلُ عَلِي الْآنَ؟", german: "Übung 1: Was macht Ali jetzt? Wähle den Satz zum Bild (Reihenfolge wie im Buch).", note: "Die Bilder des Buchs zeigen dieselben Tätigkeiten wie Basims Tag; die erste Antwort gibt das Buch vor." },
      items: ALI.map(([right, wrong], n) => ({ id: `ali-${n + 1}`, lines: [{ label: String(n + 1), parts: n === 0 ? [right] : [gap([right], sorted([right, ...wrong]))] }] })),
    },
    {
      kind: "cloze",
      slug: "step-8",
      title: "Übung 2: Ein Satz zu jedem Bild",
      navLabel: "Übung 2",
      instruction: { arabic: "تَدْرِيبٌ (٢): ١) اُكْتُبْ جُمْلَةً تَحْتَ كُلِّ صُورَةٍ.", german: "Übung 2: Ein Satz zu jedem Bild – mit der Person, die darunter steht." },
      items: T2.map(([pronoun, right, wrong, de], n) => ({ id: `t2-${n + 1}`, hint: de, lines: [{ label: pronoun, parts: wrong.length === 0 ? [right] : [gap([right], sorted([right, ...wrong]))] }] })),
    },
    {
      kind: "quiz",
      slug: "step-9",
      title: "Übung 3: das richtige Verb",
      navLabel: "Übung 3",
      instruction: { arabic: "تَدْرِيبٌ (٣): ١) اُكْتُبْ جُمْلَةً صَحِيحَةً.", german: "Übung 3: Welche Verbform passt zur Person? (lesen, trinken, frühstücken)" },
      items: T3.map(([pronoun, object, verbs], n) => {
        const options = sorted(verbs.slice(0, 4));
        return { id: `t3-${n + 1}`, arabic: `${pronoun} … ${object}`, spoken: `${pronoun} ${verbs[0]} ${object}`, questions: [{ prompt: "Das Verb:", options, answer: options.indexOf(verbs[0]) }] } satisfies QuizItem;
      }),
    },
    {
      kind: "quiz",
      slug: "step-10",
      title: "Übung 4: Safaas Tag – richtig oder falsch?",
      navLabel: "Übung 4 (hören)",
      instruction: { arabic: "تَدْرِيبٌ (٤): ١) اِسْمَعْ: مَاذَا تَعْمَلُ صَفَاء كُلَّ يَوْمٍ؟ ٢) اِسْمَعْ مَرَّةً أُخْرَى وَاكْتُبْ (✓) أَوْ (×).", german: "Übung 4: Hör, was Safaa jeden Tag macht. Richtig oder falsch?", note: "Nützliches Wort: عُطْلَةٌ أُسْبُوعِيَّةٌ (Wochenende). Der Hörtext ist der vollständige Text aus Teil 3." },
      items: SAFAA_TRUE.map(([s, ok], n) => ({ id: `safaa-${n + 1}`, arabic: s, spoken: n === 0 ? SAFAA_TEXT : s.replace("٧,٣٠", "السَّابِعَةَ وَالنِّصْفَ").replace("٨:١٥", "الثَّامِنَةَ وَالرُّبْعَ").replace("٥ أَيَّامٍ", "خَمْسَةَ أَيَّامٍ"), questions: [{ prompt: "(✓) oder (×)?", options: ["✓ richtig", "× falsch"], answer: ok ? 0 : 1 }] })),
    },
    { kind: "cloze", slug: "step-11", title: "Übung 4 (3): Safaas Tag ergänzen", navLabel: "Übung 4 (Text)", instruction: { arabic: "٣) أَكْمِلِ النَّصَّ بِالْكَلِمَاتِ الْآتِيَةِ: تَعْمَلُ – تُفْطِرُ – تَرْجِعُ – تَذْهَبُ – تُشَاهِدُ – تَقْرَأُ – تَنَامُ – تَسْتَيْقِظُ – تَتَغَدَّى – تَتَعَشَّى – تَرْكَبُ · صَحِّحْ مِنَ الِاسْتِمَاعِ.", german: "Ergänze den Text mit den Wörtern aus dem Kasten. Prüfe danach mit dem Hörtext.", note: "Wo zwei Verben passen könnten, gilt die Reihenfolge des Hörtexts." }, items: SAFAA },
    {
      kind: "cloze",
      slug: "step-12",
      title: "Übung 5: ein passendes Verb",
      navLabel: "Übung 5",
      instruction: { arabic: "تَدْرِيبٌ (٥): اُكْتُبْ فِعْلًا مُنَاسِبًا.", german: "Übung 5: Ergänze ein passendes Verb – mit der richtigen Form für die Person.", note: "Das Buch lässt das Verb offen; Alif bietet je ein passendes Verb in drei Formen an. Übung 6 ist auf der Website des Verlags." },
      items: T5.map(([before, right, after, options], n) => ({ id: `t5-${n + 1}`, lines: [{ label: String(n + 1), parts: [`${before} `, gap([right], sorted(options)), ` ${after}`] }] })),
    },
    {
      kind: "quiz",
      slug: "step-13",
      title: "Übung 7: Was macht er jetzt?",
      navLabel: "Übung 7",
      instruction: { arabic: "تَدْرِيبٌ (٧): ١) اُنْظُرْ إِلَى الصُّورَةِ وَاسْأَلْ زَمِيلَكَ: أَيْنَ مَجْدِي؟ مَاذَا يَفْعَلُ الْآنَ؟ ٢) اُكْتُبْ جُمَلًا عَنْ كُلِّ صُورَةٍ تَصِفُ مَا فِي الصُّورَةِ. مِثَال: ١ – مَجْدِي يَأْخُذُ حَمَّامًا الْآنَ. الْحَمَّامُ كَبِيرٌ. الْحَوْضُ خَلْفَ الْبَابِ. الْمِنْشَفَةُ عَلَى الْكُرْسِيِّ.", german: "Übung 7: Ein Haus, acht Zimmer: Was macht jede Person gerade?", note: "Nützliche Wörter: يَطْبُخُ (kocht) – يُذَاكِرُ (lernt) – يَأْخُذُ حَمَّامًا (duscht, badet). Die weiteren Sätze zu jedem Bild schreibst du frei." },
      items: PICTURE7.map(([name, right, wrong], n) => {
        const options = n === 0 ? [right] : sorted([right, ...wrong]);
        return { id: `p7-${n + 1}`, arabic: `مَاذَا يَفْعَلُ ${name} الْآنَ؟`, german: n === 0 ? "Beispiel im Buch" : undefined, spoken: `${name} ${right}`, questions: [{ prompt: name, options, answer: options.indexOf(right) }] } satisfies QuizItem;
      }),
    },
    ...TEXTS.map(([id, title, sentences], n) => ({
      kind: "phrases" as const,
      slug: `step-${14 + n}`,
      title: `Übung 8: Text ${title}`,
      navLabel: `Übung 8 ${title}`,
      instruction: n === 0
        ? { arabic: "تَدْرِيبٌ (٨): ١) اِقْرَأْ وَاكْتُبْ رَقْمَ الصُّورَةِ الْمُنَاسِبِ أَمَامَ النَّصِّ الصَّحِيحِ.", german: "Übung 8: Drei Personen erzählen von ihrem Tag. Lies und sprich nach.", note: "Nützliche Wörter: النَّادِي (der Klub) – أَلْعَبُ تِنِسَ (ich spiele Tennis)." }
        : { arabic: `تَدْرِيبٌ (٨): ${title}`, german: "Lies und sprich nach." },
      groups: [{ id, title, items: sentences.map((s, k) => phrase(`${id}-${k + 1}`, spokenTime(s), DE_TEXT[s] ?? "")) }],
    })),
    {
      kind: "quiz",
      slug: "step-17",
      title: "Übung 8: welches Bild?",
      navLabel: "Übung 8 (Bilder)",
      instruction: { arabic: "١) … وَاكْتُبْ رَقْمَ الصُّورَةِ الْمُنَاسِبِ أَمَامَ النَّصِّ الصَّحِيحِ.", german: "Welches Bild gehört zu welchem Text? Bild 1: ein Lehrer an der Tafel – Bild 2: eine Sekretärin am Schreibtisch – Bild 3: eine Ärztin mit einem Kind." },
      items: TEXTS.map(([id, title, sentences, picture]) => ({ id: `pic-${id}`, arabic: `${title} ${sentences[0]}`, questions: [{ prompt: "Das Bild:", options: ["(١) مُدَرِّسٌ", "(٢) سِكْرِتِيرَةٌ", "(٣) طَبِيبَةٌ"], answer: picture - 1 }] })),
    },
    { kind: "cloze", slug: "step-18", title: "Übung 8 (2): Fragen zu Mustafa", navLabel: "Übung 8 (Fragen)", instruction: { arabic: "٢) تَبَادَلْ مَعَ زَمِيلِكَ أَسْئِلَةً عَنْ كُلِّ نَصٍّ كَالْمِثَالِ: ١ – مَاذَا يَعْمَلُ مُصْطَفَى؟ ٢ – مَتَى يَسْتَيْقِظُ؟ …", german: "Antworte auf die Fragen des Buchs zu Mustafas Text (ج).", note: "Die Umfrage der „المحادثة“ (Fragen an vier Mitschüler, eine Tabelle, ein Text über deinen Tag) braucht eine Klasse." }, items: MUSTAFA_Q },
  ],
};

// ---------------------------------------------------------------------------
// تقديم (٢): الْإِجَازَةُ الْأُسْبُوعِيَّةُ

export const halaHusain: Dialogue = {
  id: "hala-husain",
  intro: "Hala und Husain erzählen, was sie am Wochenende machen.",
  speakers: [sp("husain", "Husain", "male-2", "Husain, ein junger Mann"), sp("hala", "Hala", "female-1", "Hala, eine junge Frau")],
  lines: lines([
    ["u9-hh-1", "husain", "مَاذَا تَفْعَلِينَ فِي الْإِجَازَةِ يَا هَالَة؟", "ماذا تفعلين في الإجازة يا هالة", "Mādhā tafʿalīna fi l-ijāzati yā Hāla?", "Was machst du im Urlaub, Hala?"],
    ["u9-hh-2", "hala", "يَوْمَ الْجُمْعَةِ أَنَا أُنَظِّفُ الْبَيْتَ، أَقْرَأُ كِتَابًا، أَدْرُسُ قَلِيلًا ثُمَّ أَلْعَبُ التِّنِسَ بَعْدَ الظُّهْرِ. يَوْمَ السَّبْتِ أَنَا أَزُورُ أَبِي وَأُمِّي.", "يوم الجمعة أنا أنظف البيت أقرأ كتابا أدرس قليلا ثم ألعب التنس بعد الظهر يوم السبت أنا أزور أبي وأمي", "Yawma l-jumʿa ana unaẓẓifu l-bayt, aqraʾu kitāban, adrusu qalīlan thumma alʿabu t-tinis baʿda ẓ-ẓuhr. Yawma s-sabt ana azūru abī wa-ummī.", "Am Freitag putze ich das Haus, lese ein Buch, lerne ein bisschen und spiele nachmittags Tennis. Am Samstag besuche ich meinen Vater und meine Mutter."],
    ["u9-hh-3", "hala", "وَأَنْتَ مَاذَا تَفْعَلُ فِي الْإِجَازَةِ الْأُسْبُوعِيَّةِ يَا حُسَيْن؟", "وأنت ماذا تفعل في الإجازة الأسبوعية يا حسين", "Wa-anta mādhā tafʿalu fi l-ijāzati l-usbūʿiyyati yā Ḥusayn?", "Und du, was machst du am Wochenende, Husain?"],
    ["u9-hh-4", "husain", "يَوْمَ الْجُمْعَةِ أَنَا لَا أُنَظِّفُ الْبَيْتَ وَلَا أَدْرُسُ، وَلَكِنْ أَذْهَبُ إِلَى السِّينِمَا وَأَسْمَعُ مُوسِيقَى. وَيَوْمَ السَّبْتِ أَتَعَشَّى فِي مَطْعَمٍ جَمِيلٍ ثُمَّ أُشَاهِدُ التِّلِيفِزْيُونَ فِي الْبَيْتِ.", "يوم الجمعة أنا لا أنظف البيت ولا أدرس ولكن أذهب إلى السينما وأسمع موسيقى ويوم السبت أتعشى في مطعم جميل ثم أشاهد التليفزيون في البيت", "Yawma l-jumʿa ana lā unaẓẓifu l-bayta wa-lā adrus, wa-lākin adhhabu ila s-sīnimā wa-asmaʿu mūsīqā. Wa-yawma s-sabti ataʿashshā fī maṭʿamin jamīl thumma ushāhidu t-tilifizyūna fi l-bayt.", "Am Freitag putze ich nicht und lerne nicht, sondern gehe ins Kino und höre Musik. Am Samstag esse ich in einem schönen Restaurant zu Abend und sehe dann zu Hause fern."],
  ]),
  question: { prompt: "هَلْ حُسَيْن يُنَظِّفُ الْبَيْتَ يَوْمَ الْجُمْعَةِ؟", options: ["لَا، حُسَيْن لَا يُنَظِّفُ الْبَيْتَ يَوْمَ الْجُمْعَةِ.", "نَعَمْ، حُسَيْن يُنَظِّفُ الْبَيْتَ."], answer: 0 },
};

const NEG_VERBS: Array<[huwa: string, ana: string, anta: string, anti: string, hiya: string, de: string]> = [
  ["يُنَظِّفُ", "أُنَظِّفُ", "تُنَظِّفُ", "تُنَظِّفِينَ", "تُنَظِّفُ", "putzen"],
  ["يَدْرُسُ", "أَدْرُسُ", "تَدْرُسُ", "تَدْرُسِينَ", "تَدْرُسُ", "lernen, studieren"],
  ["يَزُورُ", "أَزُورُ", "تَزُورُ", "تَزُورِينَ", "تَزُورُ", "besuchen"],
  ["يَلْعَبُ", "أَلْعَبُ", "تَلْعَبُ", "تَلْعَبِينَ", "تَلْعَبُ", "spielen"],
  ["يَسْمَعُ", "أَسْمَعُ", "تَسْمَعُ", "تَسْمَعِينَ", "تَسْمَعُ", "hören"],
];

export const emadFawwaz: Dialogue = {
  id: "emad-fawwaz",
  intro: "Samstag: Fawwaz ruft vom Tennisplatz aus Emad an, der noch im Bett liegt.",
  speakers: [sp("fawwaz", "Fawwaz", "male-1", "Fawwaz auf dem Tennisplatz"), sp("imad", "Emad", "male-2", "Emad im Bett")],
  lines: lines([
    ["u9-ef-1", "fawwaz", "السَّلَامُ عَلَيْكُمْ يَا عِمَاد. الْيَوْمَ السَّبْتُ. هَلْ تَذْهَبُ مَعِي إِلَى النَّادِي؟", "السلام عليكم يا عماد اليوم السبت هل تذهب معي إلى النادي", "As-salāmu ʿalaykum yā ʿImād. Al-yawma s-sabt. Hal tadhhabu maʿī ila n-nādī?", "Hallo Emad. Heute ist Samstag. Kommst du mit in den Klub?"],
    ["u9-ef-2", "imad", "وَعَلَيْكُمُ السَّلَامُ. لَا، أَنَا لَا أَذْهَبُ إِلَى النَّادِي يَوْمَ السَّبْتِ.", "وعليكم السلام لا أنا لا أذهب إلى النادي يوم السبت", "Wa-ʿalaykumu s-salām. Lā, ana lā adhhabu ila n-nādī yawma s-sabt.", "Hallo. Nein, samstags gehe ich nicht in den Klub."],
    ["u9-ef-3", "fawwaz", "لِمَاذَا؟", "لماذا", "Li-mādhā?", "Warum?"],
    ["u9-ef-4", "imad", "فِي الْحَقِيقَةِ. أَنَا أَسْتَيْقِظُ مُتَأَخِّرًا. أَجْلِسُ فِي سَرِيرِي أَقْرَأُ، وَأَسْمَعُ مُوسِيقَى، وَأَنْتَ؟", "في الحقيقة أنا أستيقظ متأخرا أجلس في سريري أقرأ وأسمع موسيقى وأنت", "Fi l-ḥaqīqa. Ana astayqiẓu mutaʾakhkhiran. Ajlisu fī sarīrī aqraʾu, wa-asmaʿu mūsīqā, wa-anta?", "Ehrlich gesagt wache ich spät auf. Ich sitze im Bett, lese und höre Musik. Und du?"],
    ["u9-ef-5", "fawwaz", "أَمْ … فِي الْحَقِيقَةِ، أَنَا لَا أَقْرَأُ … وَلَا أَسْمَعُ مُوسِيقَى … أَنَا أُحِبُّ النَّادِي. أَنَا أَذْهَبُ إِلَى النَّادِي، أَلْعَبُ رِيَاضَةً وَأَجْرِي وَأُقَابِلُ أَصْدِقَائِي.", "أم في الحقيقة أنا لا أقرأ ولا أسمع موسيقى أنا أحب النادي أنا أذهب إلى النادي ألعب رياضة وأجري وأقابل أصدقائي", "Hm … ehrlich gesagt lese ich nicht … und höre keine Musik … ich mag den Klub. Ich gehe in den Klub, mache Sport, laufe und treffe meine Freunde.", "Hm … ehrlich gesagt lese ich nicht und höre keine Musik. Ich mag den Klub: Ich treibe Sport, laufe und treffe meine Freunde."],
  ]),
  question: { prompt: "أَيْنَ عِمَاد الْآنَ؟", options: ["فِي سَرِيرِهِ", "فِي النَّادِي", "فِي السِّينِمَا"], answer: 0 },
};
emadFawwaz.lines[4]!.transliteration = "Am … fi l-ḥaqīqa, ana lā aqraʾu … wa-lā asmaʿu mūsīqā … ana uḥibbu n-nādī. Ana adhhabu ila n-nādī, alʿabu riyāḍatan wa-ajrī wa-uqābilu aṣdiqāʾī.";

const EF_TRUE: Array<[string, boolean, string]> = [
  ["عِمَاد يَذْهَبُ إِلَى النَّادِي كُلَّ يَوْمِ سَبْتٍ.", false, "لَا، عِمَاد لَا يَذْهَبُ إِلَى النَّادِي يَوْمَ السَّبْتِ."],
  ["فَوَّاز يَذْهَبُ إِلَى النَّادِي كُلَّ يَوْمِ سَبْتٍ.", true, "نَعَمْ، فَوَّاز يَذْهَبُ إِلَى النَّادِي."],
  ["فَوَّاز يَسْمَعُ الْمُوسِيقَى وَيَقْرَأُ كُتُبًا يَوْمَ السَّبْتِ.", false, "لَا، فَوَّاز لَا يَسْمَعُ الْمُوسِيقَى وَلَا يَقْرَأُ."],
  ["عِمَاد يَلْعَبُ رِيَاضَةً وَيَجْرِي فِي النَّادِي.", false, "لَا، عِمَاد لَا يَلْعَبُ رِيَاضَةً."],
  ["فَوَّاز يُقَابِلُ أَصْدِقَاءَهُ يَوْمَ السَّبْتِ.", true, "نَعَمْ، فَوَّاز يُقَابِلُ أَصْدِقَاءَهُ."],
  ["عِمَاد يُقَابِلُ أَصْدِقَاءَهُ يَوْمَ السَّبْتِ.", false, "لَا، عِمَاد لَا يُقَابِلُ أَصْدِقَاءَهُ."],
  ["فَوَّاز يُحِبُّ النَّادِي.", true, "نَعَمْ، فَوَّاز يُحِبُّ النَّادِي."],
  ["عِمَاد يُحِبُّ النَّادِي.", false, "لَا، عِمَاد لَا يُحِبُّ النَّادِي."],
];

const ASMAA = [
  ["جَارَتِي السَّيِّدَةُ أَسْمَاءُ سَيِّدَةٌ نَشِيطَةٌ طُوَالَ الْأُسْبُوعِ وَلَكِنْ هِيَ كَسْلَانَةٌ جِدًّا فِي إِجَازَتِهَا الْأُسْبُوعِيَّةِ.", "Meine Nachbarin, Frau Asmaa, ist die ganze Woche aktiv, aber im Wochenende sehr faul."],
  ["هِيَ لَا تَسْتَيْقِظُ مُبَكِّرًا فِي الْإِجَازَةِ وَلَكِنْ تَنَامُ حَتَّى السَّاعَةِ الْحَادِيَةَ عَشْرَةَ.", "Am Wochenende steht sie nicht früh auf, sondern schläft bis elf."],
  ["هِيَ لَا تُفْطِرُ فِي الصَّبَاحِ، وَلَكِنْ تَشْرَبُ الْقَهْوَةَ فَقَطْ.", "Sie frühstückt morgens nicht, sie trinkt nur Kaffee."],
  ["جَارَتِي أَسْمَاءُ لَا تَعْمَلُ فِي الْإِجَازَةِ أَبَدًا. لَا تُنَظِّفُ الْبَيْتَ وَلَا تَطْبُخُ.", "Am Wochenende arbeitet sie nie. Sie putzt nicht und kocht nicht."],
  ["هِيَ تَجْلِسُ فِي حُجْرَةِ الْمَعِيشَةِ وَتُشَاهِدُ التِّلِيفِزْيُونَ (التِّلْفَازَ) طُولَ الْوَقْتِ.", "Sie sitzt im Wohnzimmer und sieht die ganze Zeit fern."],
  ["وَهِيَ لَا تُقَابِلُ صَدِيقَاتِهَا وَلَكِنْ تَتَغَدَّى مَعَ زَوْجِهَا وَأَوْلَادِهَا فِي الْمَطْعَمِ.", "Sie trifft ihre Freundinnen nicht, aber isst mit ihrem Mann und ihren Kindern im Restaurant zu Mittag."],
];
const ASMAA_MATCH: MatchContent = {
  promptTitle: "(أ)",
  optionTitle: "(ب)",
  prompts: [
    { id: "a1", arabic: "١ – هِيَ لَا تُفْطِرُ فِي الصَّبَاحِ", answer: "d" },
    { id: "a2", arabic: "٢ – جَارَتِي السَّيِّدَةُ أَسْمَاءُ", answer: "j" },
    { id: "a3", arabic: "٣ – هِيَ تَجْلِسُ فِي حُجْرَةِ الْمَعِيشَةِ", answer: "b" },
    { id: "a4", arabic: "٤ – أَسْمَاءُ لَا تَسْتَيْقِظُ مُبَكِّرًا", answer: "w" },
    { id: "a5", arabic: "٥ – هِيَ لَا تَعْمَلُ فِي الْإِجَازَةِ أَبَدًا", answer: "a" },
    { id: "a6", arabic: "٦ – جَارَتِي أَسْمَاءُ", answer: "h" },
  ],
  options: [
    { id: "a", label: "أ – لَا تُنَظِّفُ الْبَيْتَ وَلَا تَطْبُخُ.", arabic: "لَا تُنَظِّفُ الْبَيْتَ وَلَا تَطْبُخُ." },
    { id: "b", label: "ب – وَتُشَاهِدُ التِّلِيفِزْيُونَ (التِّلْفَازَ) طُولَ الْوَقْتِ.", arabic: "وَتُشَاهِدُ التِّلِيفِزْيُونَ طُولَ الْوَقْتِ." },
    { id: "j", label: "ج – سَيِّدَةٌ نَشِيطَةٌ طُوَالَ الْأُسْبُوعِ.", arabic: "سَيِّدَةٌ نَشِيطَةٌ طُوَالَ الْأُسْبُوعِ." },
    { id: "d", label: "د – وَلَكِنْ تَشْرَبُ الْقَهْوَةَ فَقَطْ.", arabic: "وَلَكِنْ تَشْرَبُ الْقَهْوَةَ فَقَطْ." },
    { id: "h", label: "هـ – كَسْلَانَةٌ جِدًّا فِي إِجَازَتِهَا الْأُسْبُوعِيَّةِ.", arabic: "كَسْلَانَةٌ جِدًّا فِي إِجَازَتِهَا الْأُسْبُوعِيَّةِ." },
    { id: "w", label: "و – وَلَكِنْ تَنَامُ حَتَّى السَّاعَةِ الْحَادِيَةَ عَشْرَةَ.", arabic: "وَلَكِنْ تَنَامُ حَتَّى السَّاعَةِ الْحَادِيَةَ عَشْرَةَ." },
  ],
};

/** المحادثة: the family of Mazin as-Sabahi – what everyone is doing (read from the picture). */
const FAMILY: Array<[q: string, a: string, wrong: string[]]> = [
  ["مَاذَا تَفْعَلُ فَاطِمَةُ الْآنَ؟", "تَلْبَسُ مَلَابِسَهَا.", ["تَطْبُخُ.", "تَنَامُ."]],
  ["أَيْنَ هِيَ؟ (فَاطِمَةُ)", "فِي حُجْرَةِ النَّوْمِ.", ["فِي الْمَطْبَخِ.", "فِي الْحَمَّامِ."]],
  ["مَاذَا تَفْعَلُ كَرِيمَةُ الْآنَ؟", "تَغْسِلُ وَجْهَهَا.", ["تُشَاهِدُ التِّلِيفِزْيُونَ.", "تَتَغَدَّى."]],
  ["أَيْنَ هِيَ؟ (كَرِيمَةُ)", "فِي الْحَمَّامِ.", ["فِي حُجْرَةِ الْمَعِيشَةِ.", "فِي الْمَطْبَخِ."]],
  ["مَاذَا يَفْعَلُ خَالِد؟", "يَنْهَضُ مِنْ فِرَاشِهِ.", ["يَأْخُذُ حَمَّامًا.", "يَلْعَبُ."]],
  ["أَيْنَ هُوَ؟ (خَالِد)", "فِي حُجْرَةِ النَّوْمِ.", ["فِي الْحَمَّامِ.", "فِي الْمَطْبَخِ."]],
  ["مَاذَا يَفْعَلُ حَسَّان الْآنَ؟", "يَسْتَحِمُّ (يَأْخُذُ حَمَّامًا).", ["يَنَامُ.", "يَتَغَدَّى."]],
  ["أَيْنَ هُوَ؟ (حَسَّان)", "فِي الْحَمَّامِ.", ["فِي حُجْرَةِ النَّوْمِ.", "فِي الْمَطْبَخِ."]],
  ["مَاذَا تَفْعَلُ نَبِيلَةُ الْآنَ؟ وَأَيْنَ هِيَ؟", "تَجْلِسُ فِي حُجْرَةِ الْمَعِيشَةِ.", ["تَطْبُخُ فِي الْمَطْبَخِ.", "تَنَامُ فِي حُجْرَةِ النَّوْمِ."]],
  ["مَاذَا يَفْعَلُ مَازِن؟ وَأَيْنَ هُوَ؟", "يُفْطِرُ فِي الْمَطْبَخِ.", ["يَنَامُ فِي حُجْرَةِ النَّوْمِ.", "يَجْلِسُ فِي حُجْرَةِ الْمَعِيشَةِ."]],
  ["مَاذَا تَفْعَلُ مَاجِدَةُ؟ وَأَيْنَ هِيَ؟", "تُفْطِرُ مَعَ مَازِن فِي الْمَطْبَخِ.", ["تَنَامُ فِي حُجْرَةِ النَّوْمِ.", "تَغْسِلُ وَجْهَهَا فِي الْحَمَّامِ."]],
  ["أَيْنَ عَلَاءٌ؟ هَلْ هُوَ صَغِيرٌ أَمْ كَبِيرٌ؟", "فِي الْمَطْبَخِ. هُوَ صَغِيرٌ.", ["فِي الْحَمَّامِ. هُوَ كَبِيرٌ.", "فِي حُجْرَةِ النَّوْمِ. هُوَ كَبِيرٌ."]],
  ["مَاذَا يَفْعَلُ عَلَاءٌ؟", "يَلْعَبُ.", ["يَنَامُ.", "يَقْرَأُ."]],
];

export const a1Ijaza: A1Lesson = {
  slug: "al-ijaza",
  kind: "phrase",
  label: "الْإِجَازَةُ الْأُسْبُوعِيَّةُ",
  labelGerman: "Das Wochenende",
  steps: [
    { kind: "dialogue", mode: "listen", slug: "step-1", title: "Anhören: Hala und Husain", navLabel: "Anhören", instruction: { arabic: "تَقْدِيمٌ (٢): الْإِجَازَةُ الْأُسْبُوعِيَّةُ · اِقْرَأِ الْحِوَارَ وَأَجِبْ عَنِ الْأَسْئِلَةِ.", german: "Hör zu: Was machen Hala und Husain am Wochenende?" }, dialogue: halaHusain },
    { kind: "dialogue", mode: "repeat", slug: "step-2", title: "Nachsprechen", navLabel: "Nachsprechen", instruction: { arabic: "اِقْرَأِ الْحِوَارَ.", german: "Sprich jede Zeile nach." }, dialogue: halaHusain },
    {
      kind: "cloze",
      slug: "step-3",
      title: "Fragen zum Gespräch",
      navLabel: "Fragen",
      instruction: { arabic: "أَجِبْ عَنِ الْأَسْئِلَةِ: ١ – هَلْ حُسَيْن يُنَظِّفُ الْبَيْتَ يَوْمَ الْجُمْعَةِ؟ لَا، حُسَيْن لَا يُنَظِّفُ الْبَيْتَ يَوْمَ الْجُمْعَةِ. ٢ – هَلْ هَالَة تُشَاهِدُ فِيلْمًا فِي الْإِجَازَةِ؟", german: "Antworte auf die Fragen – mit „nein, … nicht“ (لَا + Verb)." },
      items: [
        { id: "q1", hint: "Beispiel im Buch", lines: [{ label: "١", parts: ["هَلْ حُسَيْن يُنَظِّفُ الْبَيْتَ يَوْمَ الْجُمْعَةِ؟"] }, { label: "", parts: ["لَا، حُسَيْن لَا يُنَظِّفُ الْبَيْتَ يَوْمَ الْجُمْعَةِ."] }] },
        { id: "q2", lines: [{ label: "٢", parts: ["هَلْ هَالَة تُشَاهِدُ فِيلْمًا فِي الْإِجَازَةِ؟"] }, { label: "", parts: [gap(["لَا، هَالَة لَا تُشَاهِدُ فِيلْمًا، هَالَة تَزُورُ عَائِلَتَهَا."], ["لَا، هَالَة لَا تُشَاهِدُ فِيلْمًا، هَالَة تَزُورُ عَائِلَتَهَا.", "نَعَمْ، هَالَة تُشَاهِدُ فِيلْمًا.", "لَا، هَالَة لَا يُشَاهِدُ فِيلْمًا."])] }] },
        { id: "q3", lines: [{ label: "٣", parts: ["هَلْ حُسَيْن يَدْرُسُ يَوْمَ الْجُمْعَةِ؟"] }, { label: "", parts: [gap(["لَا، حُسَيْن لَا يَدْرُسُ، حُسَيْن يَذْهَبُ إِلَى السِّينِمَا."], ["لَا، حُسَيْن لَا يَدْرُسُ، حُسَيْن يَذْهَبُ إِلَى السِّينِمَا.", "نَعَمْ، حُسَيْن يَدْرُسُ.", "لَا، حُسَيْن لَا تَدْرُسُ."])] }] },
        { id: "q4", lines: [{ label: "٤", parts: ["مَاذَا تَفْعَلُ هَالَة يَوْمَ السَّبْتِ؟"] }, { label: "", parts: [gap(["هَالَة تَزُورُ أَبَاهَا وَأُمَّهَا."], ["هَالَة تَزُورُ أَبَاهَا وَأُمَّهَا.", "هَالَة تَلْعَبُ التِّنِسَ.", "هَالَة تَتَعَشَّى فِي مَطْعَمٍ."])] }] },
      ],
    },
    {
      kind: "table",
      slug: "step-4",
      title: "Grammatik: die Verneinung mit لَا",
      navLabel: "Grammatik",
      instruction: { arabic: "لَاحِظِ الْقَوَاعِدَ: ١) لِلسُّؤَالِ عَنِ الْفِعْلِ: مَاذَا تَفْعَلُ فِي يَوْمِ الْإِجَازَةِ؟ الْآنَ؟ كُلَّ يَوْمٍ؟ · ٢) لِلنَّفْيِ: لَا + الْفِعْلُ الْمُضَارِعُ الْمَرْفُوعُ", german: "Achte auf die Regeln: „nicht“ vor einem Verb in der Gegenwart heißt لَا: لَا أَدْرُسُ – ich lerne nicht." },
      tables: [
        { id: "neg", titleArabic: "لَاحِظِ التَّصْرِيفَ:", title: "Verneint: ich – du – er – sie", columns: [{ arabic: "الْفِعْلُ", german: "Verb" }, ...YOU_HE.map(([a, g]) => ({ arabic: a, german: g }))], rows: NEG_VERBS.map(([huwa, ana, anta, anti, hiya, de]) => [{ arabic: huwa, german: de }, { arabic: `لَا ${ana}` }, { arabic: anta }, { arabic: anti }, { arabic: huwa }, { arabic: hiya }] satisfies TableCell[]) },
        { id: "q", titleArabic: "٢) لِلنَّفْيِ:", title: "Beispiel", columns: [{ arabic: "السُّؤَالُ", german: "Frage" }, { arabic: "الْإِجَابَةُ", german: "Antwort" }], rows: [[{ arabic: "هَلْ تَدْرُسُ يَوْمَ الْجُمْعَةِ؟" }, { arabic: "لَا، لَا أَدْرُسُ يَوْمَ الْجُمْعَةِ، وَلَكِنْ أَلْعَبُ التِّنِسَ." }]] },
      ],
      quiz: [
        { id: "la", prompt: "„Ich lerne nicht.“", options: ["لَا أَدْرُسُ.", "لَيْسَ أَدْرُسُ.", "لَا تَدْرُسُ."], answer: 0 },
        { id: "she", prompt: "„Sie putzt nicht.“", options: ["هِيَ لَا يُنَظِّفُ.", "هِيَ لَا تُنَظِّفُ.", "هِيَ لَيْسَتْ تُنَظِّفُ."], answer: 1 },
        { id: "but", prompt: "„… sondern ich spiele Tennis.“", options: ["وَلَكِنْ أَلْعَبُ التِّنِسَ.", "وَلَا أَلْعَبُ التِّنِسَ."], answer: 0 },
      ],
    },
    {
      kind: "cloze",
      slug: "step-5",
      title: "Übung 1: Was macht Aliya jetzt?",
      navLabel: "Übung 1",
      instruction: { arabic: "التَّدْرِيبَاتُ · تَدْرِيبٌ (١): أَجِبْ عَنِ السُّؤَالِ مِنَ الصُّورَةِ: مَاذَا تَفْعَلُ عَالِيَة الْآنَ؟ اُكْتُبِ الْإِجَابَةَ كَامِلَةً.", german: "Übung 1: Nein – sie macht etwas anderes. Antworte zu den drei Bildern (Lehrerin an der Tafel, Radio hören, Besuch an der Tür)." },
      items: [
        { id: "coffee", lines: [{ label: "", parts: ["هَلْ تَشْرَبُ الْقَهْوَةَ؟"] }, { label: "", parts: ["لَا، هِيَ لَا ", gap(["تَشْرَبُ الْقَهْوَةَ."], ["تَشْرَبُ الْقَهْوَةَ.", "يَشْرَبُ الْقَهْوَةَ."]), " هِيَ ", gap(["تَعْمَلُ فِي الْمَدْرَسَةِ.", "تَدْرُسُ."], ["تَعْمَلُ فِي الْمَدْرَسَةِ.", "تَنَامُ.", "تَسْمَعُ الرَّادْيُو."])] }] },
        { id: "tennis", lines: [{ label: "", parts: ["هَلْ تَلْعَبُ التِّنِسَ؟"] }, { label: "", parts: ["لَا، هِيَ لَا ", gap(["تَلْعَبُ التِّنِسَ."], ["تَلْعَبُ التِّنِسَ.", "يَلْعَبُ التِّنِسَ."]), " هِيَ ", gap(["تَسْمَعُ الرَّادْيُو."], ["تَسْمَعُ الرَّادْيُو.", "تَزُورُ صَدِيقَتَهَا.", "تُنَظِّفُ الْبَيْتَ."])] }] },
        { id: "radio", lines: [{ label: "", parts: ["هَلْ تَسْمَعُ الرَّادْيُو؟"] }, { label: "", parts: ["لَا، هِيَ لَا ", gap(["تَسْمَعُ الرَّادْيُو."], ["تَسْمَعُ الرَّادْيُو.", "يَسْمَعُ الرَّادْيُو."]), " هِيَ ", gap(["تَزُورُ صَدِيقَتَهَا."], ["تَزُورُ صَدِيقَتَهَا.", "تَلْعَبُ التِّنِسَ.", "تَنَامُ."])] }] },
      ],
    },
    {
      kind: "cloze",
      slug: "step-6",
      title: "Übung 2: Im Urlaub",
      navLabel: "Übung 2",
      instruction: { arabic: "تَدْرِيبٌ (٢): فِي الْإِجَازَةِ · أَكْمِلِ الْإِجَابَةَ.", german: "Übung 2: Ergänze die Antworten zu den sechs Bildern (Musik hören, fernsehen, Tennis, schreiben, lesen, putzen).", note: "Übung 3 im Buch („اُدْخُلْ إِلَى الْمَوْقِعِ“) ist auf der Website des Verlags." },
      items: [
        { id: "i1", lines: [{ label: "١", parts: ["هَلْ أَنَا أَنَامُ الْآنَ؟"] }, { label: "", parts: ["لَا، أَنْتَ لَا ", gap(["تَنَامُ الْآنَ."], ["تَنَامُ الْآنَ.", "تَنَامِينَ الْآنَ.", "يَنَامُ الْآنَ."]), " أَنْتَ ", gap(["تَسْمَعُ الْمُوسِيقَى."], ["تَسْمَعُ الْمُوسِيقَى.", "تُشَاهِدُ التِّلِيفِزْيُونَ."])] }] },
        { id: "i2", lines: [{ label: "٢", parts: ["هَلْ مِدْحَت يَرْكَبُ الْأُوتُوبِيسَ؟"] }, { label: "", parts: ["لَا، ", gap(["مِدْحَت لَا يَرْكَبُ الْأُوتُوبِيسَ."], ["مِدْحَت لَا يَرْكَبُ الْأُوتُوبِيسَ.", "مِدْحَت لَا تَرْكَبُ الْأُوتُوبِيسَ."]), " هُوَ ", gap(["يُشَاهِدُ التِّلِيفِزْيُونَ."], ["يُشَاهِدُ التِّلِيفِزْيُونَ.", "يَلْعَبُ التِّنِسَ."])] }] },
        { id: "i3", lines: [{ label: "٣", parts: ["هَلْ نَبِيلَة تَدْرُسُ؟"] }, { label: "", parts: ["لَا، ", gap(["نَبِيلَة لَا تَدْرُسُ."], ["نَبِيلَة لَا تَدْرُسُ.", "نَبِيلَة لَا يَدْرُسُ."]), " هِيَ ", gap(["تَلْعَبُ التِّنِسَ."], ["تَلْعَبُ التِّنِسَ.", "تَقْرَأُ كِتَابًا."])] }] },
        { id: "i4", lines: [{ label: "٤", parts: ["هَلْ أَنْتِ تَسْمَعِينَ الْمُوسِيقَى الْآنَ؟"] }, { label: "", parts: ["لَا، أَنَا ", gap(["لَا أَسْمَعُ الْمُوسِيقَى."], ["لَا أَسْمَعُ الْمُوسِيقَى.", "لَا تَسْمَعِينَ الْمُوسِيقَى."]), " أَنَا ", gap(["أَكْتُبُ."], ["أَكْتُبُ.", "أَنَامُ."])] }] },
        { id: "i5", lines: [{ label: "٥", parts: ["هَلْ مَاجِدَة تَزُورُ صَدِيقَتَهَا؟"] }, { label: "", parts: ["لَا، ", gap(["مَاجِدَة لَا تَزُورُ صَدِيقَتَهَا."], ["مَاجِدَة لَا تَزُورُ صَدِيقَتَهَا.", "مَاجِدَة لَا يَزُورُ صَدِيقَتَهَا."]), " هِيَ ", gap(["تَقْرَأُ كِتَابًا."], ["تَقْرَأُ كِتَابًا.", "تُنَظِّفُ الْبَيْتَ."])] }] },
        { id: "i6", lines: [{ label: "٦", parts: ["هَلْ أَنْتِ تَلْعَبِينَ التِّنِسَ الْآنَ؟"] }, { label: "", parts: ["لَا، أَنَا ", gap(["لَا أَلْعَبُ التِّنِسَ."], ["لَا أَلْعَبُ التِّنِسَ.", "لَا تَلْعَبِينَ التِّنِسَ."]), " أَنَا ", gap(["أُنَظِّفُ الْبَيْتَ."], ["أُنَظِّفُ الْبَيْتَ.", "أَقْرَأُ كِتَابًا."])] }] },
      ],
    },
    { kind: "dialogue", mode: "listen", slug: "step-7", title: "Übung 4: Samstag", navLabel: "Übung 4 (hören)", instruction: { arabic: "تَدْرِيبٌ (٤): يَوْمُ السَّبْتِ · ١) اِسْمَعِ الْحِوَارَ وَأَجِبْ: أَيْنَ عِمَاد الْآنَ؟", german: "Übung 4: Hör zu – wo ist Emad jetzt?", note: "Nützliche Wörter: يُحِبُّ (mag) – يَجْرِي (läuft) – يَجْلِسُ (sitzt). Der Hörtext steht im Buch auf S. 264." }, dialogue: emadFawwaz },
    {
      kind: "quiz",
      slug: "step-8",
      title: "Übung 4: Ja oder nein?",
      navLabel: "Übung 4 (ja / nein)",
      instruction: { arabic: "اِسْمَعْ مَرَّةً أُخْرَى وَأَجِبْ بِنَعَمْ / لَا وَاكْتُبْ إِجَابَةً كَامِلَةً.", german: "Hör noch einmal: Ja oder nein? Wähle die vollständige Antwort." },
      items: EF_TRUE.map(([s, ok, answer], n) => {
        const options = sorted([answer, ok ? answer.replace(/^نَعَمْ، (\S+) /, "لَا، $1 لَا ") : answer.replace(/^لَا، (\S+) لَا /, "نَعَمْ، $1 ")]);
        return { id: `ef-${n + 1}`, arabic: s, spoken: s, questions: [{ prompt: "Die Antwort:", options, answer: options.indexOf(answer) }] } satisfies QuizItem;
      }),
    },
    { kind: "dialogue", mode: "roleplay", slug: "step-9", title: "Übung 4: Rollenspiel", navLabel: "Rollenspiel", instruction: { arabic: "يَوْمُ السَّبْتِ", german: "Spiel Fawwaz oder Emad." }, dialogue: emadFawwaz },
    { kind: "phrases", slug: "step-10", title: "Übung 5: Meine Nachbarin Asmaa", navLabel: "Übung 5 (lesen)", instruction: { arabic: "تَدْرِيبٌ (٥): ١) اِقْرَأِ النَّصَّ ثُمَّ أَجِبْ: هَلِ السَّيِّدَةُ أَسْمَاءُ نَشِيطَةٌ؟", german: "Übung 5: Lies den Text über die Nachbarin Asmaa und sprich nach. Ist sie aktiv?", note: "Nützliche Wörter: نَشِيطَة (aktiv, fleißig) – كَسْلَانَة (faul) – جَارَة (Nachbarin)." }, groups: [{ id: "asmaa", title: "جَارَتِي أَسْمَاءُ", items: ASMAA.map(([a, g], n) => phrase(`asmaa-${n + 1}`, a!, g!)) }] },
    {
      kind: "quiz",
      slug: "step-11",
      title: "Übung 5 (2) und (4): richtig?",
      navLabel: "Übung 5 (Fragen)",
      instruction: { arabic: "٢) ضَعْ عَلَامَةَ (✓) عَلَى الصُّورَةِ الصَّحِيحَةِ: مَاذَا تَفْعَلُ السَّيِّدَةُ أَسْمَاءُ فِي إِجَازَتِهَا الْأُسْبُوعِيَّةِ؟ ٤) اُكْتُبْ (✓) أَمْ (×) وَأَجِبْ كِتَابَةً إِجَابَةً كَامِلَةً.", german: "Was macht Frau Asmaa am Wochenende? Und: richtig oder falsch?", note: "Teil 5 (drei Zeilen über einen Freund oder Nachbarn) schreibst du frei." },
      items: [
        { id: "picture", arabic: "مَاذَا تَفْعَلُ السَّيِّدَةُ أَسْمَاءُ فِي إِجَازَتِهَا الْأُسْبُوعِيَّةِ؟", questions: [{ prompt: "Das richtige Bild:", options: ["Sie läuft auf der Laufbahn.", "Sie sitzt vor dem Fernseher."], answer: 1 }] },
        { id: "a", arabic: "أ – أَسْمَاءُ تُنَظِّفُ الْبَيْتَ وَتَطْبُخُ.", questions: [{ prompt: "(✓) oder (×)?", options: ["✓", "×"], answer: 1 }] },
        { id: "b", arabic: "ب – هِيَ تَسْتَيْقِظُ مُبَكِّرًا فِي الْإِجَازَةِ.", questions: [{ prompt: "(✓) oder (×)?", options: ["✓", "×"], answer: 1 }] },
        { id: "c", arabic: "ج – هِيَ تُقَابِلُ صَدِيقَاتِهَا.", questions: [{ prompt: "(✓) oder (×)?", options: ["✓", "×"], answer: 1 }] },
      ],
    },
    { kind: "match", slug: "step-12", title: "Übung 5 (3): Sätze verbinden", navLabel: "Übung 5 (verbinden)", instruction: { arabic: "٣) صِلِ الْجُمْلَةَ (أ) مَعَ الْجُمْلَةِ (ب).", german: "Verbinde (أ) mit (ب) zu den Sätzen des Texts." }, match: ASMAA_MATCH },
    {
      kind: "quiz",
      slug: "step-13",
      title: "Gespräch: Die Familie von Mazin as-Sabahi",
      navLabel: "Gespräch",
      instruction: { arabic: "الْمُحَادَثَةُ: عَائِلَةُ السَّيِّدِ مَازِن الصَّبَاحِي · اُنْظُرْ إِلَى الصُّورَةِ. تَبَادَلْ مَعَ زَمِيلِكَ الْأَسْئِلَةَ وَالْإِجَابَاتِ: مَاذَا يَفْعَلُ كُلُّ شَخْصٍ الْآنَ؟ · اِقْرَأِ النَّصَّ: هَذَا مَنْزِلُ السَّيِّدِ مَازِن الصَّبَاحِي وَزَوْجَتِهِ مَاجِدَة. هُوَ كُوَيْتِيٌّ، بَيْتُهُ كَبِيرٌ وَعَائِلَتُهُ كَبِيرَةٌ أَيْضًا.", german: "Das Haus der Familie as-Sabahi: Was macht jeder gerade, und wo ist er?", note: "Nützliche Wörter: يَصْعَدُ (geht hinauf) – يَنْزِلُ (geht hinunter) – يَنْهَضُ مِنْ فِرَاشِهِ (steht auf) – كَبِير / صَغِير – يَسْتَحِمُّ (badet) – عَائِلَة (Familie). Die Antworten sind aus dem Bild abgelesen." },
      items: FAMILY.map(([q, a, wrong], n) => {
        const options = sorted([a, ...wrong]);
        return { id: `fam-${n + 1}`, arabic: q, questions: [{ prompt: "Die Antwort:", options, answer: options.indexOf(a) }] } satisfies QuizItem;
      }),
    },
    {
      kind: "table",
      slug: "step-14",
      title: "Merke: die Gegenwart",
      navLabel: "Merke",
      instruction: { arabic: "تَذَكَّرْ: الْفِعْلُ الْمُضَارِعُ / الْمُضَارِعُ الْمُسْتَمِرُّ يُعَبِّرُ عَنِ الْفِعْلِ فِي الزَّمَنِ الْحَاضِرِ أَوْ لِلْعَادَةِ.", german: "Merke: Die Gegenwart beschreibt, was jetzt geschieht oder was man gewöhnlich tut." },
      tables: [
        { id: "ask", titleArabic: "١ – لِلسُّؤَالِ عَنِ الْفِعْلِ:", title: "Nach der Tätigkeit fragen", columns: [{ arabic: "السُّؤَالُ", german: "Frage" }, { arabic: "الْإِجَابَةُ", german: "Antwort" }], rows: [[{ arabic: "مَاذَا يَفْعَلُ أَحْمَد الْآنَ؟" }, { arabic: "هُوَ يَكْتُبُ الْآنَ." }], [{ arabic: "مَاذَا يَفْعَلُ كُلَّ يَوْمٍ؟" }, { arabic: "هُوَ يَذْهَبُ لِلْعَمَلِ كُلَّ يَوْمٍ." }]] },
        { id: "conj", titleArabic: "٢ – لِتَصْرِيفِ الْفِعْلِ الْمُضَارِعِ:", title: "يَفْعَلُ (فَعَلَ)", columns: [{ arabic: "", german: "" }, ...YOU_HE.map(([a, g]) => ({ arabic: a, german: g }))], rows: [[{ arabic: "يَفْعَلُ", listen: false }, { arabic: "أَفْعَلُ" }, { arabic: "تَفْعَلُ" }, { arabic: "تَفْعَلِينَ" }, { arabic: "يَفْعَلُ" }, { arabic: "تَفْعَلُ" }], [{ arabic: "النَّفْيُ", listen: false }, { arabic: "لَا أَفْعَلُ" }, { arabic: "لَا تَفْعَلُ" }, { arabic: "لَا تَفْعَلِينَ" }, { arabic: "لَا يَفْعَلُ" }, { arabic: "لَا تَفْعَلُ" }], [{ arabic: "أَحْرُفُ الزِّيَادَةِ", listen: false }, { arabic: "أَـ", listen: false }, { arabic: "تَـ", listen: false }, { arabic: "تَـ … ـِينَ", listen: false }, { arabic: "يَـ", listen: false }, { arabic: "تَـ", listen: false }]] },
      ],
      quiz: [
        { id: "habit", prompt: "„Er geht jeden Tag zur Arbeit.“", options: ["هُوَ يَذْهَبُ لِلْعَمَلِ كُلَّ يَوْمٍ.", "هُوَ تَذْهَبُ لِلْعَمَلِ كُلَّ يَوْمٍ."], answer: 0 },
        { id: "neg", prompt: "„Du (Frau) machst nicht …“", options: ["لَا تَفْعَلُ", "لَا تَفْعَلِينَ", "لَا يَفْعَلُ"], answer: 1 },
      ],
    },
  ],
};
