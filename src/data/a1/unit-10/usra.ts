import type { A1Lesson, ClozeItem, ClozePart, Dialogue, DialogueSpeaker, MatchContent, PhraseItem, QuizItem, TableCell } from "@/data/types";
import { transliterate } from "@/lib/arabic/transliterate";

import { unvocalised } from "../letter-lesson";
import { lines } from "../sabah-al-khayr";

// Unit 10 "السؤال عن العائلة ووظائفهم – الكلام عن حالة الطقس" (book pages
// 267–290, PDF 299–322):
//   تقديم (١ أ) "أَنَا وَأُسْرَتِي", (١ ب) "أُسْرَتِي وَالْعَمَلُ" (pp. 268–277):
//   Essam's family, jobs, لاحظ القواعد ١–٧, تدريب ١–٦, المحادثة (class).
//   تقديم (٢) "مَا / كَيْفَ حَالَةُ الطَّقْسِ الْيَوْمَ؟" (pp. 278–290): weather,
//   temperature, seasons, months, تدريب ١–٨, المحادثة ١–٤ (class), تذكر.

const IMG = "/images/a1/unit-10";
const gap = (accept: string[], options: string[]): ClozePart => ({ accept, options });
const sorted = (xs: string[]) => [...new Set(xs)].sort((a, b) => a.localeCompare(b, "ar"));
const sp = (id: string, name: string, voice: DialogueSpeaker["voice"], alt: string): DialogueSpeaker => ({ id, name, voice, avatar: { src: `${IMG}/${id}.svg`, alt } });
const phrase = (id: string, arabic: string, german: string): PhraseItem => ({ id, arabic, transliteration: transliterate(arabic), german, exercise: { id, target: unvocalised(arabic).replace(/[.؟?!،,:()–-]/g, " ").replace(/\s+/g, " ").trim(), modelText: arabic } });

const ESSAM: Array<[string, string]> = [
  ["أُسْرَتِي جَمِيلَةٌ. هَذِهِ هِيَ صُورَةُ أُسْرَتِي.", "Meine Familie ist schön. Das ist das Foto meiner Familie."],
  ["أَنَا اسْمِي عِصَام وَأَبِي اسْمُهُ مَحْمُود وَأُمِّي اسْمُهَا فَاطِمَة، خَدِيجَة هِيَ أُخْتِي، طَارِق أَخِي الْكَبِيرُ.", "Ich heiße Essam, mein Vater heißt Mahmud, meine Mutter Fatima; Khadija ist meine Schwester, Tarek mein großer Bruder."],
  ["أَبِي مَحْمُود ابْنُ صَالِح. صَالِح هُوَ أَبُوهُ.", "Mein Vater Mahmud ist Salihs Sohn. Salih ist sein Vater."],
  ["أَبِي مَحْمُود ابْنُ زَيْنَب. زَيْنَب أُمُّهُ.", "Mein Vater Mahmud ist Zainabs Sohn. Zainab ist seine Mutter."],
  ["صَالِح لَيْسَ أَبِي هُوَ جَدِّي وَزَيْنَب لَيْسَتْ أُمِّي هِيَ جَدَّتِي.", "Salih ist nicht mein Vater, er ist mein Großvater, und Zainab ist nicht meine Mutter, sie ist meine Großmutter."],
];
const KIN = ["جَدُّ", "جَدَّةُ", "أَبُو", "أُمُّ", "ابْنُ", "ابْنَةُ", "أَخُو", "أُخْتُ", "زَوْجُ", "زَوْجَةُ"];
const kin = (right: string) => gap([right], sorted(KIN.filter((k) => k !== right).slice(0, 3).concat(right)));
/** اقرأ مرة أخرى واكتب: the book's 9 sentences (8 and 9 printed complete). */
const ESSAM_Q: Array<[before: string, a: string, mid: string, b: string, after: string]> = [
  ["صَالِح هُوَ ", "جَدُّ", " عِصَام وَهُوَ ", "أَبُو", " مَحْمُود."],
  ["زَيْنَب هِيَ ", "جَدَّةُ", " عِصَام وَهِيَ ", "أُمُّ", " مَحْمُود."],
  ["مَحْمُود هُوَ ", "أَبُو", " عِصَام وَهُوَ ", "ابْنُ", " صَالِح."],
];
const ESSAM_ITEMS: ClozeItem[] = [
  ...ESSAM_Q.map(([b, a, m, c, af], n) => ({ id: `e${n + 1}`, lines: [{ label: String(n + 1), parts: [b, kin(a), m, kin(c), af] }] })),
  { id: "e4", lines: [{ label: "٤", parts: ["أَنَا ", kin("ابْنُ"), " مَحْمُود. هُوَ ", gap(["أَبِي"], ["أَبِي", "أَخِي", "جَدِّي"]), " (أَنَا)."] }] },
  { id: "e5", lines: [{ label: "٥", parts: ["طَارِق ", kin("ابْنُ"), " مَحْمُود. هُوَ ", gap(["أَخِي"], ["أَخِي", "أَبِي", "ابْنِي"]), " (أَنَا)."] }] },
  { id: "e6", lines: [{ label: "٦", parts: ["خَدِيجَة ", kin("ابْنَةُ"), " مَحْمُود. هِيَ ", gap(["أُخْتِي"], ["أُخْتِي", "أُمِّي", "جَدَّتِي"]), " (أَنَا)."] }] },
  { id: "e7", lines: [{ label: "٧", parts: ["طَارِق ", kin("أَخُو"), " خَدِيجَة. هِيَ ", gap(["أُخْتُهُ"], ["أُخْتُهُ", "أُخْتُهَا", "أُمُّهُ"]), " (هُوَ)."] }] },
  { id: "e8", lines: [{ label: "٨", parts: ["فَاطِمَة زَوْجَةُ مَحْمُود. هِيَ زَوْجَتُهُ."] }] },
  { id: "e9", lines: [{ label: "٩", parts: ["مَحْمُود زَوْجُ فَاطِمَة. هُوَ زَوْجُهَا."] }] },
];

/** (١ ب) the jobs of Essam's family. */
const JOBS: Array<[arabic: string, german: string]> = [
  ["جَدِّي صَالِح مُهَنْدِسٌ.", "Mein Großvater Salih ist Ingenieur."], ["أَبِي مَحْمُود ضَابِطٌ.", "Mein Vater Mahmud ist Offizier."], ["أَخِي طَارِق مُحَاسِبٌ.", "Mein Bruder Tarek ist Buchhalter."],
  ["جَدَّتِي زَيْنَب مُدِيرَةٌ.", "Meine Großmutter Zainab ist Direktorin."], ["وَالِدَتِي فَاطِمَة مُدَرِّسَةٌ.", "Meine Mutter Fatima ist Lehrerin."], ["أُخْتِي خَدِيجَة مُمَرِّضَةٌ.", "Meine Schwester Khadija ist Krankenschwester."], ["أَنَا عِصَام مُحَامٍ.", "Ich, Essam, bin Anwalt."],
];

export const essamFamily: Dialogue = {
  id: "essam-family",
  intro: "Fragen über Essams Familie: Arbeitet seine Mutter? Arbeitet sein Großvater?",
  speakers: [sp("sail", "Die Fragende", "female-1", "Eine junge Frau"), sp("essam", "Essam", "male-1", "Essam, ein Anwalt")],
  lines: lines([
    ["u10-e-1", "sail", "هَلْ وَالِدَةُ عِصَام تَعْمَلُ؟", "هل والدة عصام تعمل", "Hal wālidatu ʿIṣām taʿmal?", "Arbeitet Essams Mutter?"],
    ["u10-e-2", "essam", "لَا، هِيَ لَا تَعْمَلُ، هِيَ رَبَّةُ بَيْتٍ.", "لا هي لا تعمل هي ربة بيت", "Lā, hiya lā taʿmal, hiya rabbatu bayt.", "Nein, sie arbeitet nicht, sie ist Hausfrau."],
    ["u10-e-3", "sail", "هَلْ جَدُّ عِصَام يَعْمَلُ؟", "هل جد عصام يعمل", "Hal jaddu ʿIṣām yaʿmal?", "Arbeitet Essams Großvater?"],
    ["u10-e-4", "essam", "لَا، هُوَ لَا يَعْمَلُ هُوَ عَلَى الْمَعَاشِ.", "لا هو لا يعمل هو على المعاش", "Lā, huwa lā yaʿmal, huwa ʿala l-maʿāsh.", "Nein, er arbeitet nicht, er ist in Rente."],
  ]),
  question: { prompt: "هَلْ جَدُّ عِصَام يَعْمَلُ؟", options: ["لَا، هُوَ عَلَى الْمَعَاشِ.", "نَعَمْ، هُوَ مُهَنْدِسٌ."], answer: 0 },
};
essamFamily.intro += " (Im Buch: Fragen und Antworten von der CD; die Mutter ist hier Hausfrau – so steht es auf S. 269.)";

const PRON = ["أَنَا", "أَنْتَ", "أَنْتِ", "أَنْتُمَا", "أَنْتُمْ", "أَنْتُنَّ", "نَحْنُ", "هُوَ", "هِيَ", "هُمَا", "هُمْ", "هُنَّ"];
const SUF = ["ي", "كَ", "كِ", "كُمَا", "كُمْ", "كُنَّ", "نَا", "هُ", "هَا", "هُمَا", "هُمْ", "هُنَّ"];
const withSuf = (stem: string, i: number, long?: string) => (long ? (i === 0 ? stem + "ي" : long + SUF[i]) : stem + (i === 0 ? "ي" : SUF[i]!));
const KIN_TABLE: TableCell[][] = PRON.map((p, i) => [
  { arabic: p, listen: false },
  { arabic: i === 0 ? "جَدِّي" : withSuf("جَدُّ", i) },
  { arabic: i === 0 ? "جَدَّتِي" : withSuf("جَدَّتُ", i) },
  { arabic: i === 0 ? "أَبِي" : withSuf("أَبُو", i) },
  { arabic: i === 0 ? "أُمِّي" : withSuf("أُمُّ", i) },
  { arabic: i === 0 ? "أَخِي" : withSuf("أَخُو", i) },
  { arabic: i === 0 ? "أُخْتِي" : withSuf("أُخْتُ", i) },
]);

/** تدريب ١: Adil's family (the book's 12 sentences, answers as read in the picture and the listening text). */
const ADIL: Array<[a: string, rel: string, b: string, pr: string, short: string]> = [
  ["عَادِل", "زَوْجُ", "سَمِيحَة", "هُوَ", "زَوْجُهَا"],
  ["عَادِل", "ابْنُ", "صَلَاح", "هُوَ", "ابْنُهُ"],
  ["عَادِل", "ابْنُ", "نِعْمَة", "هُوَ", "ابْنُهَا"],
  ["صَلَاح", "أَبُو", "عَادِل", "هُوَ", "أَبُوهُ"],
  ["نِعْمَة", "أُمُّ", "عَادِل", "هِيَ", "أُمُّهُ"],
  ["سَمِيحَة", "زَوْجَةُ", "عَادِل", "هِيَ", "زَوْجَتُهُ"],
  ["دُعَاء", "ابْنَةُ", "سَمِيحَة", "هِيَ", "ابْنَتُهَا"],
  ["وَائِل", "ابْنُ", "عَادِل وَسَمِيحَة", "هُوَ", "ابْنُهُمَا"],
  ["دُعَاء", "أُخْتُ", "وَائِل", "هِيَ", "أُخْتُهُ"],
  ["وَائِل", "أَخُو", "دُعَاء", "هُوَ", "أَخُوهَا"],
  ["صَلَاح", "جَدُّ", "وَائِل وَدُعَاء", "هُوَ", "جَدُّهُمَا"],
  ["نِعْمَة", "جَدَّةُ", "وَائِل وَدُعَاء", "هِيَ", "جَدَّتُهُمَا"],
];
const SHORTS = ADIL.map((a) => a[4]);
const ADIL_ITEMS: ClozeItem[] = ADIL.map(([a, rel, b, pr, short], n) => ({
  id: `adil-${n + 1}`,
  image: n === 0 ? { src: `${IMG}/adil-family.svg`, alt: "Adils Familie auf dem Sofa: Samiha, Adil, Nima, Salah, Duaa, Wail" } : undefined,
  lines: [{ label: String(n + 1), parts: n === 0 ? [`${a} ${rel} ${b}. ${pr} ${short}.`] : [`${a} `, kin(rel), ` ${b}. ${pr} `, gap([`${short}.`], sorted([short, SHORTS[(n + 2) % 12]!, SHORTS[(n + 5) % 12]!]).map((s) => `${s}.`))] }],
}));

const ADIL_JOBS: Array<[q: string, a: string, wrong: string[]]> = [
  ["مَا عَمَلُ صَلَاح جَدِّ دُعَاء؟", "صَلَاح لَا يَعْمَلُ، هُوَ عَلَى الْمَعَاشِ.", []],
  ["مَا عَمَلُ نِعْمَة جَدَّةِ وَائِل؟", "نِعْمَة لَا تَعْمَلُ، هِيَ بِالْمَعَاشِ.", ["نِعْمَة مُدَرِّسَةٌ.", "نِعْمَة طَبِيبَةٌ."]],
  ["مَا عَمَلُ عَادِل وَالِدِ وَائِل؟", "عَادِل مُهَنْدِسٌ.", ["عَادِل ضَابِطٌ.", "عَادِل مُحَاسِبٌ."]],
  ["مَا عَمَلُ سَمِيحَة زَوْجَةِ عَادِل؟", "سَمِيحَة تَعْمَلُ مُدَرِّسَةً.", ["سَمِيحَة تَعْمَلُ طَبِيبَةً.", "سَمِيحَة لَا تَعْمَلُ."]],
  ["مَا عَمَلُ دُعَاء أُخْتِ وَائِل؟", "دُعَاء تَعْمَلُ طَبِيبَةً.", ["دُعَاء تَعْمَلُ مُمَرِّضَةً.", "دُعَاء تَعْمَلُ مُدَرِّسَةً."]],
  ["مَا عَمَلُ وَائِل ابْنِ عَادِل؟", "وَائِل يَعْمَلُ ضَابِطًا.", ["وَائِل يَعْمَلُ مُهَنْدِسًا.", "وَائِل طَالِبٌ."]],
];

const T3: Array<[q: string, a: string, wrong: string[], de: string]> = [
  ["مَا عَمَلُ وَالِدِ عَلِيّ؟", "وَالِدُ عَلِيّ مُهَنْدِسٌ.", [], "Beispiel: ein Mann an Geräten"],
  ["مَا عَمَلُ زَوْجَةِ أَحْمَد؟", "زَوْجَةُ أَحْمَد مُمَرِّضَةٌ.", ["زَوْجَةُ أَحْمَد طَبِيبٌ.", "زَوْجَةُ أَحْمَد مُدَرِّسَةٌ."], "Eine Krankenschwester mit Tablett"],
  ["مَا عَمَلُ أَخِي عِصَام؟", "أَخُو عِصَام مُمَثِّلٌ.", ["أَخُو عِصَام طَيَّارٌ.", "أَخُو عِصَام مُحَامٍ."], "Ein Schauspieler auf der Bühne"],
  ["مَا عَمَلُ زَوْجِ فَاطِمَة؟", "زَوْجُ فَاطِمَة مُحَامٍ.", ["زَوْجُ فَاطِمَة مُدَرِّسٌ.", "زَوْجُ فَاطِمَة طَيَّارٌ."], "Ein Anwalt vor Gericht"],
  ["مَا عَمَلُ ابْنِ هِشَام؟", "ابْنُ هِشَام طَيَّارٌ.", ["ابْنُ هِشَام مُهَنْدِسٌ.", "ابْنُ هِشَام مُمَثِّلٌ."], "Ein Pilot im Cockpit"],
  ["مَا عَمَلُ أُخْتِ مَاجِدَة؟", "أُخْتُ مَاجِدَة مُدَرِّسَةٌ.", ["أُخْتُ مَاجِدَة مُمَرِّضَةٌ.", "أُخْتُ مَاجِدَة مُدِيرَةٌ."], "Eine Lehrerin an der Tafel"],
];

const T4: Array<[q: string, hint: string, a: string, wrong: string[]]> = [
  ["هَلْ وَالِدُ نَبِيل طَبِيبٌ؟", "", "لَا، وَالِدُ نَبِيل لَيْسَ طَبِيبًا. هُوَ مُهَنْدِسٌ.", []],
  ["هَلْ زَوْجُ فَاطِمَة مُدَرِّسٌ؟", "مُحَامٍ", "لَا، زَوْجُ فَاطِمَة لَيْسَ مُدَرِّسًا. هُوَ مُحَامٍ.", ["لَا، زَوْجُ فَاطِمَة لَيْسَ مُدَرِّسٌ. هُوَ مُحَامٍ.", "نَعَمْ، زَوْجُ فَاطِمَة مُدَرِّسٌ."]],
  ["هَلْ جَدُّ حَامِد مُمَثِّلٌ؟", "مُدَرِّسٌ", "لَا، جَدُّ حَامِد لَيْسَ مُمَثِّلًا. هُوَ مُدَرِّسٌ.", ["لَا، جَدُّ حَامِد لَيْسَتْ مُمَثِّلًا. هُوَ مُدَرِّسٌ.", "نَعَمْ، جَدُّ حَامِد مُمَثِّلٌ."]],
  ["هَلْ خَالِد وَالِدُ عَلَاء؟", "أَخُو", "لَا، خَالِد لَيْسَ وَالِدَ عَلَاء. هُوَ أَخُوهُ.", ["لَا، خَالِد لَيْسَ وَالِدًا عَلَاء. هُوَ أَخُوهُ.", "نَعَمْ، خَالِد وَالِدُ عَلَاء."]],
  ["هَلْ مُصْطَفَى جَدُّ حُسَام؟", "أَبُو", "لَا، مُصْطَفَى لَيْسَ جَدَّ حُسَام. هُوَ أَبُوهُ.", ["لَا، مُصْطَفَى لَيْسَتْ جَدَّ حُسَام. هُوَ أَبُوهُ.", "نَعَمْ، مُصْطَفَى جَدُّ حُسَام."]],
  ["هَلْ مَدِيحَة أُخْتُ وَفَاء؟", "أُمّ", "لَا، مَدِيحَة لَيْسَتْ أُخْتَ وَفَاء. هِيَ أُمُّهَا.", ["لَا، مَدِيحَة لَيْسَ أُخْتَ وَفَاء. هِيَ أُمُّهَا.", "نَعَمْ، مَدِيحَة أُخْتُ وَفَاء."]],
  ["هَلْ أَخُو سَيِّد مُدِيرٌ؟", "طَيَّار", "لَا، أَخُو سَيِّد لَيْسَ مُدِيرًا. هُوَ طَيَّارٌ.", ["لَا، أَخُو سَيِّد لَيْسَ مُدِيرٌ. هُوَ طَيَّارٌ.", "نَعَمْ، أَخُو سَيِّد مُدِيرٌ."]],
  ["هَلْ جَدَّةُ هَانِي تَعْمَلُ مُدَرِّسَةً؟", "رَبَّةُ مَنْزِلٍ", "لَا، جَدَّةُ هَانِي لَا تَعْمَلُ. هِيَ رَبَّةُ مَنْزِلٍ.", ["لَا، جَدَّةُ هَانِي لَيْسَ تَعْمَلُ. هِيَ رَبَّةُ مَنْزِلٍ.", "نَعَمْ، جَدَّةُ هَانِي مُدَرِّسَةٌ."]],
  ["هَلْ سَمِيرَة أُمُّ نَجْوَى؟", "جَدَّة", "لَا، سَمِيرَة لَيْسَتْ أُمَّ نَجْوَى. هِيَ جَدَّتُهَا.", ["لَا، سَمِيرَة لَيْسَ أُمَّ نَجْوَى. هِيَ جَدَّتُهَا.", "نَعَمْ، سَمِيرَة أُمُّ نَجْوَى."]],
];

export const hanaShirin: Dialogue = {
  id: "hana-shirin",
  intro: "Schirin und Hanaa sehen sich ein Foto an: Wer steht hinter Hanaa?",
  speakers: [sp("shirin", "Schirin", "female-2", "Schirin, eine junge Frau"), sp("hanaa", "Hanaa", "female-1", "Hanaa, eine Frau mit Kopftuch")],
  lines: lines([
    ["u10-h-1", "shirin", "مَنْ يَقِفُ خَلْفَكِ فِي الصُّورَةِ يَا هَنَاء؟", "من يقف خلفك في الصورة يا هناء", "Man yaqifu khalfaki fi ṣ-ṣūrati yā Hanāʾ?", "Wer steht auf dem Foto hinter dir, Hanaa?"],
    ["u10-h-2", "hanaa", "هَذَا زَوْجِي عِمَاد.", "هذا زوجي عماد", "Hādhā zawjī ʿImād.", "Das ist mein Mann Emad."],
    ["u10-h-3", "shirin", "أَمْ … هُوَ رَجُلٌ طَوِيلٌ. وَمَا عَمَلُهُ؟", "أم هو رجل طويل وما عمله", "Am … huwa rajulun ṭawīl. Wa-mā ʿamaluhu?", "Hm … ein großer Mann. Und was macht er beruflich?"],
    ["u10-h-4", "hanaa", "هُوَ مُحَاسِبٌ فِي الْبَنْكِ الْعَرَبِيِّ.", "هو محاسب في البنك العربي", "Huwa muḥāsibun fi l-banki l-ʿarabiyy.", "Er ist Buchhalter bei der Arabischen Bank."],
    ["u10-h-5", "shirin", "وَهَلْ هَذَا أَخُوكِ؟", "وهل هذا أخوك", "Wa-hal hādhā akhūki?", "Und ist das dein Bruder?"],
    ["u10-h-6", "hanaa", "لَا، هَذَا لَيْسَ أَخِي، هَذَا ابْنِي سَمِير.", "لا هذا ليس أخي هذا ابني سمير", "Lā, hādhā laysa akhī, hādhā bnī Samīr.", "Nein, das ist nicht mein Bruder, das ist mein Sohn Samir."],
    ["u10-h-7", "shirin", "وَهَلْ يَعْمَلُ ابْنُكِ؟", "وهل يعمل ابنك", "Wa-hal yaʿmalu bnuki?", "Und arbeitet dein Sohn?"],
    ["u10-h-8", "hanaa", "لَا، هُوَ لَا يَعْمَلُ. هُوَ طَالِبٌ، يَدْرُسُ فِي الْجَامِعَةِ.", "لا هو لا يعمل هو طالب يدرس في الجامعة", "Lā, huwa lā yaʿmal. Huwa ṭālib, yadrusu fi l-jāmiʿa.", "Nein, er arbeitet nicht. Er ist Student an der Universität."],
  ]),
  question: { prompt: "مَنْ يَقِفُ خَلْفَ هَنَاء؟ مَاذَا يَعْمَلُ زَوْجُ هَنَاء؟", options: ["زَوْجُهَا عِمَاد – مُحَاسِبٌ فِي الْبَنْكِ الْعَرَبِيِّ.", "أَخُوهَا – طَالِبٌ.", "ابْنُهَا سَمِير – مُحَاسِبٌ."], answer: 0 },
};

const NADI: Array<[string, string]> = [
  ["عَزِيزِي غَسَّان، بَعْدَ التَّحِيَّةِ، شُكْرًا لَكَ عَلَى رِسَالَتِكَ الْجَمِيلَةِ.", "Lieber Ghassan, vielen Dank für deinen schönen Brief."],
  ["أَنَا الْآنَ أَعْمَلُ فِي دُبَي فِي وَظِيفَةٍ جَدِيدَةٍ. أَنَا مُهَنْدِسٌ فِي شَرِكَةِ بِنَاءٍ.", "Ich arbeite jetzt in Dubai in einer neuen Stelle. Ich bin Ingenieur bei einer Baufirma."],
  ["وَأَخِي إِبْرَاهِيم مُحَاسِبٌ وَيَعْمَلُ فِي أَبُو ظَبْي. إِجَازَتِي الْأُسْبُوعِيَّةُ يَوْمَ الْجُمْعَةِ.", "Mein Bruder Ibrahim ist Buchhalter und arbeitet in Abu Dhabi. Mein freier Tag ist der Freitag."],
  ["وَأَنَا أَعْمَلُ مِنَ السَّاعَةِ التَّاسِعَةِ إِلَى السَّاعَةِ الْوَاحِدَةِ ظُهْرًا. ثُمَّ أَعْمَلُ مَسَاءً مِنَ السَّاعَةِ الرَّابِعَةِ وَحَتَّى السَّاعَةِ السَّابِعَةِ مَسَاءً.", "Ich arbeite von neun bis ein Uhr mittags, dann abends von vier bis sieben."],
  ["أَبِي يَزُورُ أَخِي الْآنَ فِي أَبُو ظَبْي. وَلَكِنْ أُمِّي وَجَدِّي هُنَا مَعِي فِي دُبَي فِي زِيَارَةٍ قَصِيرَةٍ أَيْضًا.", "Mein Vater besucht gerade meinen Bruder in Abu Dhabi. Aber meine Mutter und mein Großvater sind hier bei mir in Dubai zu einem kurzen Besuch."],
  ["أَخُوكَ، نَادِي", "Dein Bruder Nadi"],
];
const NADI_MATCH: MatchContent = {
  promptTitle: "(أ)",
  optionTitle: "(ب)",
  prompts: [
    { id: "n1", arabic: "١ – أَخِي إِبْرَاهِيم", answer: "acc" },
    { id: "n2", arabic: "٢ – أَنَا", answer: "eng" },
    { id: "n3", arabic: "٣ – أَبِي يَزُورُ", answer: "abu" },
    { id: "n4", arabic: "٤ – إِجَازَتِي الْأُسْبُوعِيَّةُ", answer: "fri" },
    { id: "n5", arabic: "٥ – أُمِّي وَجَدِّي", answer: "here" },
  ],
  options: [
    { id: "here", label: "هُنَا مَعِي فِي دُبَي فِي زِيَارَةٍ قَصِيرَةٍ.", arabic: "هُنَا مَعِي فِي دُبَي فِي زِيَارَةٍ قَصِيرَةٍ." },
    { id: "fri", label: "يَوْمَ الْجُمْعَةِ.", arabic: "يَوْمَ الْجُمْعَةِ." },
    { id: "acc", label: "مُحَاسِبٌ فِي الْبَنْكِ الْعَرَبِيِّ.", arabic: "مُحَاسِبٌ فِي الْبَنْكِ الْعَرَبِيِّ." },
    { id: "abu", label: "أَخِي الْآنَ فِي أَبُو ظَبْي.", arabic: "أَخِي الْآنَ فِي أَبُو ظَبْي." },
    { id: "eng", label: "مُهَنْدِسٌ فِي شَرِكَةِ بِنَاءٍ.", arabic: "مُهَنْدِسٌ فِي شَرِكَةِ بِنَاءٍ." },
  ],
};

export const a1Usra: A1Lesson = {
  slug: "ana-wa-usrati",
  kind: "phrase",
  label: "أَنَا وَأُسْرَتِي",
  labelGerman: "Ich und meine Familie",
  steps: [
    { kind: "phrases", slug: "step-1", title: "Essams Familie", navLabel: "Text", instruction: { arabic: "تَقْدِيمٌ (١ أ): أَنَا وَأُسْرَتِي · اِقْرَأِ النَّصَّ وَاكْتُبِ اسْمَ الشَّخْصِ.", german: "Lies den Text über Essams Familie und sprich nach.", note: "Auf dem Foto im Buch: جَدّ – جَدَّة – أَب (زَوْج) – أُمّ (زَوْجَة) – ابْن / أَخ – ابْنَة / أُخْت." }, groups: [{ id: "essam", title: "أُسْرَتِي", items: ESSAM.map(([a, g], n) => phrase(`essam-${n + 1}`, a, g)) }] },
    { kind: "cloze", slug: "step-2", title: "Wer ist wer?", navLabel: "Fragen", instruction: { arabic: "اِقْرَأْ مَرَّةً أُخْرَى وَاكْتُبْ:", german: "Ergänze die Verwandtschaftswörter: Großvater, Vater, Sohn …" }, items: ESSAM_ITEMS },
    { kind: "phrases", slug: "step-3", title: "Familie und Beruf", navLabel: "Berufe", instruction: { arabic: "تَقْدِيمٌ (١ ب): أُسْرَتِي وَالْعَمَلُ · ١) اِسْمَعِ السُّؤَالَ وَكَرِّرِ الْإِجَابَةَ: مَا عَمَلُ جَدِّكَ / مَا عَمَلُكَ؟", german: "Hör zu und sprich nach: die Berufe in Essams Familie." }, groups: [{ id: "jobs", title: "مَا عَمَلُ …؟", items: JOBS.map(([a, g], n) => phrase(`job-${n + 1}`, a, g)) }] },
    { kind: "dialogue", mode: "listen", slug: "step-4", title: "Anhören: Wer arbeitet?", navLabel: "Anhören", instruction: { arabic: "٢) اِسْمَعِ السُّؤَالَ وَالْإِجَابَةَ عَنْ عَائِلَةِ عِصَام:", german: "Hör die Fragen und Antworten über Essams Familie." }, dialogue: essamFamily },
    { kind: "dialogue", mode: "repeat", slug: "step-5", title: "Nachsprechen", navLabel: "Nachsprechen", instruction: { arabic: "٢) اِسْمَعِ السُّؤَالَ وَالْإِجَابَةَ.", german: "Sprich jede Zeile nach." }, dialogue: essamFamily },
    {
      kind: "table",
      slug: "step-6",
      title: "Grammatik: Familie und Beruf",
      navLabel: "Grammatik",
      instruction: { arabic: "لَاحِظِ الْقَوَاعِدَ: ١) تَصْرِيفُ الْأَلْقَابِ مَعَ ضَمِيرِ الْمِلْكِيَّةِ ٢) لِلسُّؤَالِ وَالْإِجَابَةِ ٣) تَصْرِيفُ زَوْج / زَوْجَة ٤) لِلسُّؤَالِ عَنِ الْعَمَلِ ٥) الْوَظِيفَةُ أَوِ الصِّفَةُ ٦) لِلسُّؤَالِ عَنِ الْوَظِيفَةِ ٧) لِلِاسْتِفْسَارِ وَالتَّأْكِيدِ", german: "Achte auf die Regeln: mein Vater, dein Vater … – „Arbeitet er?“ – „Was ist sein Beruf?“ – männliche und weibliche Berufe." },
      tables: [
        { id: "kin", titleArabic: "١) تَصْرِيفُ الْأَلْقَابِ مَعَ ضَمِيرِ الْمِلْكِيَّةِ:", title: "mein / dein / sein … Großvater, Vater, Mutter, Bruder, Schwester", columns: [{ arabic: "الضَّمِيرُ", german: "" }, { arabic: "جَدّ", german: "Großvater" }, { arabic: "جَدَّة", german: "Großmutter" }, { arabic: "أَب", german: "Vater" }, { arabic: "أُمّ", german: "Mutter" }, { arabic: "أَخ", german: "Bruder" }, { arabic: "أُخْت", german: "Schwester" }], rows: KIN_TABLE, note: "Achtung: أَب und أَخ haben vor der Endung ein langes u: أَبُوكَ، أَخُوهُ (aber: أَبِي، أَخِي). Die Tabelle des Buchs zeigt auch ابْن / ابْنَة." },
        { id: "check", titleArabic: "٢) لِلسُّؤَالِ وَالْإِجَابَةِ:", title: "Nachfragen", columns: [{ arabic: "السُّؤَالُ", german: "" }, { arabic: "الْإِجَابَةُ", german: "" }], rows: [[{ arabic: "هَلْ حُسَام وَالِدُكَ؟" }, { arabic: "لَا، حُسَام لَيْسَ وَالِدِي. حُسَام وَالِدُهُ." }], [{ arabic: "هَلْ نَبِيلَة أُخْتُكَ؟" }, { arabic: "لَا، نَبِيلَة لَيْسَتْ أُخْتِي. نَبِيلَة أُخْتُهُمَا." }], [{ arabic: "هَلْ فَاطِمَة وَالِدَتُكَ؟" }, { arabic: "نَعَمْ، فَاطِمَة وَالِدَتِي. هِيَ أُمِّي." }]] },
        { id: "zawj", titleArabic: "٣) تَصْرِيفُ زَوْج / زَوْجَة:", title: "Ehemann / Ehefrau", columns: [{ arabic: "أَنَا (مُذَكَّر)", german: "" }, { arabic: "أَنَا (مُؤَنَّث)", german: "" }, { arabic: "أَنْتَ", german: "" }, { arabic: "أَنْتِ", german: "" }, { arabic: "هُوَ", german: "" }, { arabic: "هِيَ", german: "" }], rows: [[{ arabic: "زَوْجَتِي" }, { arabic: "زَوْجِي" }, { arabic: "زَوْجَتُكَ" }, { arabic: "زَوْجُكِ" }, { arabic: "زَوْجَتُهُ" }, { arabic: "زَوْجُهَا" }]] },
        { id: "work", titleArabic: "٤) لِلسُّؤَالِ عَنِ الْعَمَلِ:", title: "Arbeitest du?", columns: [{ arabic: "السُّؤَالُ", german: "" }, { arabic: "الْإِجَابَةُ بِنَعَمْ أَوْ لَا", german: "" }], rows: [[{ arabic: "هَلْ أَنْتَ تَعْمَلُ؟" }, { arabic: "نَعَمْ، أَنَا أَعْمَلُ. / لَا، أَنَا لَا أَعْمَلُ." }], [{ arabic: "هَلْ أَنْتِ تَعْمَلِينَ؟" }, { arabic: "نَعَمْ، أَنَا أَعْمَلُ. / لَا، أَنَا لَا أَعْمَلُ." }], [{ arabic: "هَلْ هُوَ يَعْمَلُ؟" }, { arabic: "نَعَمْ، هُوَ يَعْمَلُ. / لَا، هُوَ لَا يَعْمَلُ." }], [{ arabic: "هَلْ هِيَ تَعْمَلُ؟" }, { arabic: "نَعَمْ، هِيَ تَعْمَلُ. / لَا، هِيَ لَا تَعْمَلُ." }]] },
        { id: "jobs", titleArabic: "٥) الْوَظِيفَةُ أَوِ الصِّفَةُ · ٦) لِلسُّؤَالِ عَنِ الْوَظِيفَةِ: مَا عَمَلُكَ؟ عَمَلُكِ؟ عَمَلُهُ؟ عَمَلُهَا؟", title: "Berufe", columns: [{ arabic: "مُذَكَّر", german: "" }, { arabic: "مُؤَنَّث", german: "" }], rows: [["طَبِيب", "طَبِيبَة"], ["مُدِير", "مُدِيرَة"], ["مُمَثِّل", "مُمَثِّلَة"], ["مُحَاسِب", "مُحَاسِبَة"]].map(([m, f]) => [{ arabic: m! }, { arabic: f! }]) },
        { id: "confirm", titleArabic: "٧) لِلِاسْتِفْسَارِ وَالتَّأْكِيدِ عَنْ نَوْعِ الْوَظِيفَةِ أَوِ الْعَمَلِ:", title: "Nachfragen zum Beruf", columns: [{ arabic: "السُّؤَالُ", german: "" }, { arabic: "الْإِجَابَةُ بِالتَّأْكِيدِ", german: "" }, { arabic: "الْإِجَابَةُ بِالنَّفْيِ", german: "" }], rows: [[{ arabic: "هَلْ وَالِدُكَ مُهَنْدِسٌ؟" }, { arabic: "نَعَمْ، وَالِدِي مُهَنْدِسٌ." }, { arabic: "لَا، هُوَ لَيْسَ مُهَنْدِسًا. هُوَ طَبِيبٌ." }], [{ arabic: "هَلْ هِيَ طَبِيبَةٌ؟" }, { arabic: "نَعَمْ، هِيَ طَبِيبَةٌ." }, { arabic: "لَا، هِيَ لَيْسَتْ طَبِيبَةً. هِيَ مُهَنْدِسَةٌ." }]] },
      ],
      quiz: [
        { id: "abuka", prompt: "„dein Vater“ (zu einem Mann)", options: ["أَبُوكَ", "أَبِيكَ", "أَبُكَ"], answer: 0 },
        { id: "zawjuha", prompt: "„ihr Mann“", options: ["زَوْجَتُهَا", "زَوْجُهَا", "زَوْجُهُ"], answer: 1 },
        { id: "doc", prompt: "„Sie ist Ärztin.“", options: ["هِيَ طَبِيبٌ.", "هِيَ طَبِيبَةٌ."], answer: 1 },
        { id: "neg", prompt: "„Er ist kein Ingenieur.“", options: ["هُوَ لَيْسَ مُهَنْدِسًا.", "هُوَ لَا مُهَنْدِسٌ.", "هُوَ لَيْسَتْ مُهَنْدِسًا."], answer: 0 },
      ],
    },
    { kind: "cloze", slug: "step-7", title: "Übung 1: Adils Familie", navLabel: "Übung 1", instruction: { arabic: "التَّدْرِيبَاتُ · تَدْرِيبٌ (١): ١) اُنْظُرْ إِلَى الصُّورَةِ وَأَكْمِلِ الْجُمْلَةَ. اِسْمَعْ وَصَحِّحْ.", german: "Übung 1: Adils Familie – ergänze die Sätze." }, items: ADIL_ITEMS },
    {
      kind: "quiz",
      slug: "step-8",
      title: "Übung 2: Was arbeiten sie?",
      navLabel: "Übung 2",
      instruction: { arabic: "تَدْرِيبٌ (٢): ١) اِسْتَمِعْ وَاكْتُبِ الْمَعْلُومَاتِ النَّاقِصَةَ عَنْ عَائِلَةِ عَادِل.", german: "Übung 2: Hör zu – was arbeiten die Mitglieder von Adils Familie?", note: "Der Hörtext steht im Buch auf S. 276–277." },
      items: ADIL_JOBS.map(([q, a, wrong], n) => {
        const options = wrong.length ? sorted([a, ...wrong]) : [a];
        return { id: `aj-${n + 1}`, arabic: q, spoken: `${q} ${a}`, german: n === 0 ? "Beispiel im Buch" : undefined, questions: [{ prompt: "Die Antwort:", options, answer: options.indexOf(a) }] } satisfies QuizItem;
      }),
    },
    {
      kind: "cloze",
      slug: "step-9",
      title: "Übung 3: Was ist sein Beruf?",
      navLabel: "Übung 3",
      instruction: { arabic: "تَدْرِيبٌ (٣): ثُنَائِيَّاتٌ: تَبَادَلُوا الْأَسْئِلَةَ وَاكْتُبُوا الْإِجَابَةَ كَالْمِثَالِ: مَا عَمَلُ وَالِدِ عَلِيّ؟ وَالِدُ عَلِيّ مُهَنْدِسٌ.", german: "Übung 3: Frage und Antwort zu jedem Bild.", note: "Nützliche Wörter: مُمَثِّل (Schauspieler) – طَيَّار (Pilot)." },
      items: T3.map(([q, a, wrong, de], n) => ({ id: `t3-${n + 1}`, hint: de, lines: [{ label: "س", parts: [q] }, { label: "ج", parts: n === 0 ? [a] : [gap([a], sorted([a, ...wrong]))] }] })),
    },
    {
      kind: "cloze",
      slug: "step-10",
      title: "Übung 4: Antworte mit „nein“",
      navLabel: "Übung 4",
      instruction: { arabic: "تَدْرِيبٌ (٤): أَجِبْ عَنِ السُّؤَالِ بِالنَّفْيِ. اُكْتُبْ إِجَابَةً كَامِلَةً كَالْمِثَالِ.", german: "Übung 4: Antworte mit „nein“ – das richtige Wort steht in Klammern." },
      items: T4.map(([q, hint, a, wrong], n) => ({ id: `t4-${n + 1}`, hint: hint ? `(${hint})` : "Beispiel im Buch", lines: [{ label: String(n + 1), parts: [q] }, { label: "", parts: n === 0 ? [a] : [gap([a], sorted([a, ...wrong]))] }] })),
    },
    { kind: "dialogue", mode: "listen", slug: "step-11", title: "Übung 5: Das Foto", navLabel: "Übung 5 (hören)", instruction: { arabic: "تَدْرِيبٌ (٥): ١) اِسْمَعِ الْحِوَارَ ثُمَّ أَجِبْ: أ – مَنْ يَقِفُ خَلْفَ هَنَاء؟ ب – أَيْنَ يَقِفُ؟ ج – مَاذَا يَعْمَلُ زَوْجُ هَنَاء؟", german: "Übung 5: Hör zu und antworte.", note: "Der Hörtext steht im Buch auf S. 277." }, dialogue: hanaShirin },
    {
      kind: "cloze",
      slug: "step-12",
      title: "Übung 5 (2)–(3): Lücken im Gespräch",
      navLabel: "Übung 5 (Lücken)",
      instruction: { arabic: "٢) اِسْمَعْ مَرَّةً أُخْرَى وَاكْتُبِ الْجُمَلَ النَّاقِصَةَ فِي الْحِوَارِ. ٣) أ – هَلْ سَمِير وَالِدُ هَنَاء؟ ب – هَلْ عِمَاد جَدُّ سَمِير؟", german: "Ergänze das Gespräch und antworte auf die Fragen.", note: "Teil 4 (frag deinen Partner nach seiner Familie) braucht einen Partner." },
      items: [
        { id: "l1", lines: [{ label: "هَنَاء", parts: [gap(["هَذَا زَوْجِي عِمَاد."], ["هَذَا زَوْجِي عِمَاد.", "هَذَا ابْنِي سَمِير.", "هَذَا أَخِي عِمَاد."])] }] },
        { id: "l2", lines: [{ label: "شِيرِين", parts: ["أَمْ … هُوَ رَجُلٌ طَوِيلٌ ", gap(["وَمَا عَمَلُهُ؟"], ["وَمَا عَمَلُهُ؟", "وَمَا عَمَلُهَا؟", "وَمَا اسْمُهُ؟"])] }] },
        { id: "l3", lines: [{ label: "هَنَاء", parts: ["هُوَ ", gap(["مُحَاسِبٌ"], ["مُحَاسِبٌ", "طَالِبٌ", "مُهَنْدِسٌ"]), " فِي ", gap(["الْبَنْكِ"], ["الْبَنْكِ", "الْجَامِعَةِ"]), " الْعَرَبِيِّ."] }] },
        { id: "l4", lines: [{ label: "شِيرِين", parts: ["وَهَلْ ", gap(["هَذَا أَخُوكِ؟"], ["هَذَا أَخُوكِ؟", "هَذَا أَبُوكِ؟", "هَذِهِ أُخْتُكِ؟"])] }] },
        { id: "l5", lines: [{ label: "هَنَاء", parts: ["لَا، هَذَا لَيْسَ ", gap(["أَخِي"], ["أَخِي", "زَوْجِي"]), " هَذَا ", gap(["ابْنِي سَمِير."], ["ابْنِي سَمِير.", "زَوْجِي عِمَاد."])] }] },
        { id: "l6", lines: [{ label: "شِيرِين", parts: ["وَهَلْ يَعْمَلُ ", gap(["ابْنُكِ؟"], ["ابْنُكِ؟", "زَوْجُكِ؟"])] }] },
        { id: "l7", lines: [{ label: "هَنَاء", parts: ["لَا، هُوَ لَا يَعْمَلُ هُوَ ", gap(["طَالِبٌ، يَدْرُسُ"], ["طَالِبٌ، يَدْرُسُ", "مُحَاسِبٌ، يَعْمَلُ"]), " فِي الْجَامِعَةِ."] }] },
        { id: "q3a", lines: [{ label: "أ", parts: ["هَلْ سَمِير وَالِدُ هَنَاء؟ ", gap(["لَا، سَمِير لَيْسَ وَالِدَهَا. هُوَ ابْنُهَا."], ["لَا، سَمِير لَيْسَ وَالِدَهَا. هُوَ ابْنُهَا.", "نَعَمْ، سَمِير وَالِدُهَا."])] }] },
        { id: "q3b", lines: [{ label: "ب", parts: ["هَلْ عِمَاد جَدُّ سَمِير؟ ", gap(["لَا، عِمَاد لَيْسَ جَدَّهُ. هُوَ أَبُوهُ."], ["لَا، عِمَاد لَيْسَ جَدَّهُ. هُوَ أَبُوهُ.", "نَعَمْ، عِمَاد جَدُّهُ."])] }] },
      ],
    },
    { kind: "dialogue", mode: "roleplay", slug: "step-13", title: "Übung 5: Rollenspiel", navLabel: "Rollenspiel", instruction: { arabic: "شِيرِين وَهَنَاء", german: "Spiel Schirin oder Hanaa." }, dialogue: hanaShirin },
    { kind: "phrases", slug: "step-14", title: "Übung 6: Nadis Brief", navLabel: "Übung 6 (lesen)", instruction: { arabic: "تَدْرِيبٌ (٦): ١) اِقْرَأْ رِسَالَةَ نَادِي إِلَى صَدِيقِهِ غَسَّان ثُمَّ أَجِبْ.", german: "Übung 6: Lies Nadis Brief an seinen Freund Ghassan.", note: "Nützliche Wörter: يَزُورُ (besucht) – وَظِيفَة جَدِيدَة (neue Stelle) – شَرِكَة (Firma) – بِنَاء (Bau) – كَذَلِكَ (ebenso)." }, groups: [{ id: "nadi", title: "عَزِيزِي غَسَّان", items: NADI.map(([a, g], n) => phrase(`nadi-${n + 1}`, a, g)) }] },
    {
      kind: "quiz",
      slug: "step-15",
      title: "Übung 6: Fragen zum Brief",
      navLabel: "Übung 6 (Fragen)",
      instruction: { arabic: "١ – أَيْنَ نَادِي الْآنَ؟ ٢ – مَاذَا يَعْمَلُ الْآنَ؟ مَا وَظِيفَتُهُ؟ ٣ – مَنْ يَزُورُ نَادِي؟ ٤ – مَنْ إِبْرَاهِيم؟ ٥ – مَا وَظِيفَتُهُ؟ ٦ – مَنْ يَزُورُ إِبْرَاهِيم؟", german: "Antworte mit dem Brief." },
      items: ([
        ["أَيْنَ نَادِي الْآنَ؟", "فِي دُبَي", ["فِي أَبُو ظَبْي", "فِي الْقَاهِرَةِ"]],
        ["مَا وَظِيفَتُهُ؟", "مُهَنْدِسٌ فِي شَرِكَةِ بِنَاءٍ", ["مُحَاسِبٌ", "طَبِيبٌ"]],
        ["مَنْ يَزُورُ نَادِي؟", "أُمُّهُ وَجَدُّهُ", ["أَبُوهُ", "أَخُوهُ"]],
        ["مَنْ إِبْرَاهِيم؟", "أَخُو نَادِي", ["أَبُو نَادِي", "صَدِيقُ نَادِي"]],
        ["مَا وَظِيفَةُ إِبْرَاهِيم؟", "مُحَاسِبٌ", ["مُهَنْدِسٌ", "مُدَرِّسٌ"]],
        ["مَنْ يَزُورُ إِبْرَاهِيم؟", "أَبُوهُ", ["أُمُّهُ", "غَسَّان"]],
      ] as Array<[string, string, string[]]>).map(([q, a, w], n) => {
        const options = sorted([a, ...w]);
        return { id: `nq-${n + 1}`, arabic: q, questions: [{ prompt: "Die Antwort:", options, answer: options.indexOf(a) }] };
      }),
    },
    { kind: "match", slug: "step-16", title: "Übung 6 (2): Sätze verbinden", navLabel: "Übung 6 (verbinden)", instruction: { arabic: "٢) اِقْرَأْ مَرَّةً ثَانِيَةً ثُمَّ صِلِ الْجُمْلَةَ (أ) مَعَ الْجُمْلَةِ (ب).", german: "Verbinde (أ) mit (ب).", note: "Im Buch steht bei (ب) „مُحَاسِبٌ فِي الْبَنْكِ الْعَرَبِيِّ“ – Ibrahim ist Buchhalter. Teil 3 (dein eigener Brief) und die „المحادثة“ (Klassenumfrage) sind frei bzw. brauchen eine Klasse." }, match: NADI_MATCH },
  ],
};

// ---------------------------------------------------------------------------
// تقديم (٢): مَا / كَيْفَ حَالَةُ الطَّقْسِ الْيَوْمَ؟

const WEATHER: Array<[id: string, arabic: string, german: string]> = [
  ["mumtir", "مُمْطِر", "regnerisch"], ["asif", "عَاصِف", "stürmisch"], ["mushmis", "مُشْمِس", "sonnig"], ["barid", "بَارِد", "kalt"],
  ["mutrib", "مُتْرِب", "staubig"], ["harr", "حَارّ", "heiß"], ["ghaim", "غَائِم", "bewölkt"], ["barid-jiddan", "بَارِد جِدًّا", "sehr kalt"],
  ["dafi", "دَافِئ", "warm"], ["mutadil", "مُعْتَدِل", "mild"],
];
const MONTHS: Array<[string, string]> = [["يَنَايِر", "Januar"], ["فِبْرَايِر", "Februar"], ["مَارِس", "März"], ["أَبْرِيل", "April"], ["مَايُو", "Mai"], ["يُونْيُو", "Juni"], ["يُولْيُو", "Juli"], ["أُغُسْطُس", "August"], ["سِبْتَمْبِر", "September"], ["أُكْتُوبَر", "Oktober"], ["نُوفَمْبِر", "November"], ["دِيسَمْبِر", "Dezember"]];
const SEASONS: Array<[id: string, arabic: string, german: string, months: string, weather: string]> = [
  ["sayf", "الصَّيْف", "Sommer", "يُونْيُو – يُولْيُو – أُغُسْطُس", "الْجَوُّ حَارٌّ – مُمْطِرٌ – مُشْمِسٌ"],
  ["kharif", "الْخَرِيف", "Herbst", "سِبْتَمْبِر – أُكْتُوبَر – نُوفَمْبِر", "الْجَوُّ مُعْتَدِلٌ – مُشْمِسٌ – دَافِئٌ"],
  ["shita", "الشِّتَاء", "Winter", "دِيسَمْبِر – يَنَايِر – فِبْرَايِر", "الْجَوُّ بَارِدٌ – مُمْطِرٌ – غَائِمٌ"],
  ["rabi", "الرَّبِيع", "Frühling", "مَارِس – أَبْرِيل – مَايُو", "الْجَوُّ مُعْتَدِلٌ – مُتْرِبٌ – عَاصِفٌ"],
];
const WIMG = (id: string) => `${IMG}/w-${id}.svg`;

/** (١) the eight pictures (right to left, top to bottom). */
const PICS = ["mumtir", "asif", "mushmis", "barid", "mutrib", "harr", "ghaim", "barid-jiddan"];

export const salwaImad: Dialogue = {
  id: "salwa-imad",
  intro: "Im Büro: Salwa fragt Emad nach seiner Reise.",
  speakers: [sp("salwa", "Salwa", "female-1", "Salwa, eine Kollegin"), sp("imad", "Emad", "male-1", "Emad mit einer Tasse Kaffee")],
  lines: lines([
    ["u10-s-1", "salwa", "إِلَى أَيْنَ تُسَافِرُ فِي رِحْلَتِكَ يَا عِمَاد؟", "إلى أين تسافر في رحلتك يا عماد", "Ilā ayna tusāfiru fī riḥlatika yā ʿImād?", "Wohin reist du, Emad?"],
    ["u10-s-2", "imad", "أَنَا أُسَافِرُ إِلَى الْيَابَانِ.", "أنا أسافر إلى اليابان", "Ana usāfiru ila l-Yābān.", "Ich reise nach Japan."],
    ["u10-s-3", "salwa", "الْيَابَانُ! أَيْنَ فِي الْيَابَانِ؟", "اليابان أين في اليابان", "Al-Yābān! Ayna fi l-Yābān?", "Japan! Wo in Japan?"],
    ["u10-s-4", "imad", "طُوكْيُو.", "طوكيو", "Ṭūkyū.", "Tokio."],
    ["u10-s-5", "salwa", "طُوكْيُو! الْيَابَانُ! مَتَى تُسَافِرُ؟", "طوكيو اليابان متى تسافر", "Ṭūkyū! Al-Yābān! Matā tusāfir?", "Tokio! Japan! Wann reist du?"],
    ["u10-s-6", "imad", "أُسَافِرُ فِي شَهْرِ دِيسَمْبِر وَيَنَايِر. فِي الشِّتَاءِ.", "أسافر في شهر ديسمبر ويناير في الشتاء", "Usāfiru fī shahri Dīsambir wa-Yanāyir. Fi sh-shitāʾ.", "Im Dezember und Januar. Im Winter."],
    ["u10-s-7", "salwa", "وَكَيْفَ حَالَةُ الطَّقْسِ هُنَاكَ فِي الشِّتَاءِ؟ وَمَاذَا تَلْبَسُ؟", "وكيف حالة الطقس هناك في الشتاء وماذا تلبس", "Wa-kayfa ḥālatu ṭ-ṭaqsi hunāka fi sh-shitāʾ? Wa-mādhā talbas?", "Und wie ist das Wetter dort im Winter? Und was ziehst du an?"],
    ["u10-s-8", "imad", "الطَّقْسُ بَارِدٌ جِدًّا. أَنَا أَلْبَسُ مِعْطَفًا وَقُفَّازًا وَقُبَّعَةً أَيْضًا.", "الطقس بارد جدا أنا ألبس معطفا وقفازا وقبعة أيضا", "Aṭ-ṭaqsu bāridun jiddan. Ana albasu miʿṭafan wa-quffāzan wa-qubbaʿatan ayḍan.", "Es ist sehr kalt. Ich ziehe einen Mantel, Handschuhe und auch eine Mütze an."],
  ]),
  question: { prompt: "إِلَى أَيْنَ يُسَافِرُ عِمَاد؟", options: ["إِلَى الْيَابَانِ (طُوكْيُو)", "إِلَى دُبَي", "إِلَى الرِّبَاطِ"], answer: 0 },
};

const REPORT: Array<[city: string, weather: string[], temp: string, text: string]> = [
  ["نِيُويُورْك", ["غَائِم", "ثَلْج"], "٣ تَحْتَ الصِّفْرِ", "مَدِينَةُ نِيُويُورْك: الْجَوُّ غَائِمٌ فِي الصَّبَاحِ وَثَلْجٌ كَثِيرٌ بَعْدَ الظُّهْرِ. دَرَجَةُ الْحَرَارَةِ ثَلَاثُ دَرَجَاتٍ مِئَوِيَّةٍ تَحْتَ الصِّفْرِ."],
  ["دُبَي", ["مُشْمِس", "حَارّ"], "٣٨", "مَدِينَةُ دُبَي: الْجَوُّ مُشْمِسٌ وَحَارٌّ وَدَرَجَةُ الْحَرَارَةِ ثَمَانٍ وَثَلَاثُونَ دَرَجَةً مِئَوِيَّةً."],
  ["الرِّبَاط", ["غَائِم", "عَاصِف", "مُمْطِر"], "٨", "مَدِينَةُ الرِّبَاطِ: الْجَوُّ غَائِمٌ وَعَاصِفٌ وَمُمْطِرٌ. دَرَجَةُ الْحَرَارَةِ ثَمَانِي دَرَجَاتٍ مِئَوِيَّةٍ."],
  ["صَنْعَاء", ["مُمْطِر", "غَائِم", "مُشْمِس"], "١٢", "مَدِينَةُ صَنْعَاءَ: الْجَوُّ مُمْطِرٌ وَغَائِمٌ وَلَكِنْ مُشْمِسٌ بَعْدَ الظُّهْرِ. دَرَجَةُ الْحَرَارَةِ اثْنَتَا عَشْرَةَ دَرَجَةً مِئَوِيَّةً."],
  ["لُوس أَنْجِلُوس", ["مُشْمِس", "حَارّ", "غَائِم"], "٢٨", "مَدِينَةُ لُوس أَنْجِلُوس: الْجَوُّ مُشْمِسٌ صَبَاحًا، حَارٌّ، غَائِمٌ بَعْدَ الظُّهْرِ. دَرَجَةُ الْحَرَارَةِ ثَمَانٍ وَعِشْرُونَ دَرَجَةً مِئَوِيَّةً."],
];
const TEMPS = REPORT.map((r) => r[2]);

const MADIHA: Array<[string, string]> = [
  ["عَزِيزَتِي أَلِيس، أَنَا سَعِيدَةٌ بِزِيَارَتِكِ لِي فِي الشِّتَاءِ.", "Liebe Alice, ich freue mich, dass du mich im Winter besuchst."],
  ["الشِّتَاءُ فِي مِصْرَ جَمِيلٌ. الطَّقْسُ دَافِئٌ وَمُشْمِسٌ وَدَرَجَةُ الْحَرَارَةِ بَيْنَ ١٢ – ٢٢ دَرَجَةً مِئَوِيَّةً.", "Der Winter in Ägypten ist schön. Es ist warm und sonnig, zwischen 12 und 22 Grad."],
  ["الْمَلَابِسُ الْمُنَاسِبَةُ جَاكِت وَبَنْطَلُون. وَمُمْكِنٌ أَيْضًا قَمِيصٌ خَفِيفٌ أَوْ بُلُوزَةٌ مِنْ قُطْنٍ.", "Passende Kleidung: Jacke und Hose. Auch ein leichtes Hemd oder eine Baumwollbluse geht."],
  ["أَهْلًا وَسَهْلًا بِكِ فِي الشِّتَاءِ. أُخْتُكِ، مَدِيحَة", "Herzlich willkommen im Winter. Deine Schwester Madiha"],
];

export const a1Taqs: A1Lesson = {
  slug: "hal-at-taqs",
  kind: "phrase",
  label: "حَالَةُ الطَّقْسِ",
  labelGerman: "Das Wetter",
  steps: [
    { kind: "words", slug: "step-1", title: "Das Wetter", navLabel: "Wetter", instruction: { arabic: "تَقْدِيمٌ (٢): مَا / كَيْفَ حَالَةُ الطَّقْسِ الْيَوْمَ؟ ١) اِسْمَعْ وَاكْتُبِ الْكَلِمَةَ.", german: "Hör zu und sprich nach: Wie ist das Wetter?" }, groups: [{ id: "weather", title: "حَالَةُ الطَّقْسِ", words: WEATHER.map(([id, a, g]) => ({ id: `w-${id}`, arabic: a, german: g, transliteration: transliterate(a), image: { src: WIMG(id), alt: g }, exercise: { id: `w-${id}`, target: unvocalised(a), modelText: a } })) }] },
    {
      kind: "cloze",
      slug: "step-2",
      title: "Das Wort unter jedem Bild",
      navLabel: "Bilder",
      instruction: { arabic: "١) اِسْمَعْ وَاكْتُبِ الْكَلِمَةَ.", german: "Welches Wetterwort gehört unter das Bild?" },
      items: PICS.map((id, n) => {
        const w = WEATHER.find((x) => x[0] === id)!;
        return { id: `pic-${id}`, image: { src: WIMG(id), alt: w[2] }, lines: [{ label: "", parts: [gap([w[1]], sorted([w[1], WEATHER[(n + 3) % 10]![1], WEATHER[(n + 6) % 10]![1]]))] }] } satisfies ClozeItem;
      }),
    },
    {
      kind: "phrases",
      slug: "step-3",
      title: "Temperatur, Jahreszeiten, Monate",
      navLabel: "Jahreszeiten",
      instruction: { arabic: "٢) كَمْ دَرَجَةُ الْحَرَارَةِ؟ ٠ = صِفْر / –٣ = ثَلَاثَةٌ تَحْتَ الصِّفْرِ · ٣) حَالَةُ الطَّقْسِ فِي الْعَالَمِ الْعَرَبِيِّ فِي فُصُولِ السَّنَةِ الْمُخْتَلِفَةِ.", german: "Die Temperatur, die Jahreszeiten mit ihrem Wetter und die Monate. Hör zu und sprich nach.", note: "Auf dem Thermometer: ٤٠ حَارّ – ٣٠ دَافِئ – ٢٠ مُعْتَدِل – ١٠ بَارِد – ٠ بَارِد جِدًّا." },
      groups: [
        { id: "temp", title: "دَرَجَةُ الْحَرَارَةِ", items: [["كَمْ دَرَجَةُ الْحَرَارَةِ الْيَوْمَ؟", "Wie viel Grad sind es heute?"], ["دَرَجَةُ الْحَرَارَةِ ثَلَاثُونَ دَرَجَةً مِئَوِيَّةً.", "Es sind 30 Grad Celsius."], ["صِفْر", "null"], ["أَرْبَعَةٌ تَحْتَ الصِّفْرِ", "vier unter null"]].map(([a, g], n) => phrase(`temp-${n + 1}`, a!, g!)) },
        { id: "seasons", title: "فُصُولُ السَّنَةِ", items: SEASONS.map(([id, a, g, , weather]) => phrase(`season-${id}`, `${a}: ${weather}`, `${g}`)) },
        { id: "months", title: "شُهُورُ السَّنَةِ", items: MONTHS.map(([a, g], n) => phrase(`month-${n + 1}`, a, g)) },
      ],
    },
    {
      kind: "table",
      slug: "step-4",
      title: "Grammatik: nach dem Wetter fragen",
      navLabel: "Grammatik",
      instruction: { arabic: "لَاحِظِ الْقَوَاعِدَ: ١) لِلسُّؤَالِ عَنِ الطَّقْسِ ٢) لِلسُّؤَالِ عَنْ دَرَجَةِ الْحَرَارَةِ ٣) فُصُولُ السَّنَةِ ٤) شُهُورُ السَّنَةِ", german: "Achte auf die Regeln: So fragst du nach dem Wetter und der Temperatur." },
      tables: [
        { id: "ask", titleArabic: "١) لِلسُّؤَالِ عَنِ الطَّقْسِ:", title: "Wie ist das Wetter?", columns: [{ arabic: "السُّؤَالُ", german: "" }, { arabic: "الْإِجَابَةُ", german: "" }], rows: [[{ arabic: "كَيْفَ حَالَةُ الطَّقْسِ الْيَوْمَ؟" }, { arabic: "الطَّقْسُ الْيَوْمَ مُمْطِرٌ / بَارِدٌ / حَارٌّ." }], [{ arabic: "مَا حَالَةُ الطَّقْسِ الْيَوْمَ؟" }, { arabic: "مُعْتَدِلٌ – دَافِئٌ …", listen: false }]] },
        { id: "temp", titleArabic: "٢) لِلسُّؤَالِ عَنْ دَرَجَةِ الْحَرَارَةِ:", title: "Die Temperatur", columns: [{ arabic: "السُّؤَالُ", german: "" }, { arabic: "الْإِجَابَةُ", german: "" }], rows: [[{ arabic: "كَمْ دَرَجَةُ الْحَرَارَةِ الْيَوْمَ؟" }, { arabic: "دَرَجَةُ الْحَرَارَةِ ثَلَاثُونَ دَرَجَةً مِئَوِيَّةً." }], [{ arabic: "٠ = صِفْر", listen: false }, { arabic: "–٤ = أَرْبَعَةٌ تَحْتَ الصِّفْرِ", listen: false }]] },
        { id: "seasons", titleArabic: "٣) فُصُولُ السَّنَةِ · ٤) شُهُورُ السَّنَةِ", title: "Jahreszeiten und Monate", columns: [{ arabic: "الْفَصْلُ", german: "" }, { arabic: "الشُّهُورُ", german: "" }], rows: SEASONS.map(([, a, g, m]) => [{ arabic: a, german: g }, { arabic: m.replace(/ – /g, " ") }]) },
      ],
      quiz: [
        { id: "how", prompt: "„Wie ist das Wetter heute?“", options: ["كَيْفَ حَالَةُ الطَّقْسِ الْيَوْمَ؟", "كَمْ السَّاعَةُ الْآنَ؟", "مَا اسْمُكَ؟"], answer: 0 },
        { id: "winter", prompt: "Winter:", options: ["الصَّيْف", "الشِّتَاء", "الرَّبِيع"], answer: 1 },
        { id: "march", prompt: "März gehört zu …", options: ["الرَّبِيع", "الْخَرِيف", "الشِّتَاء"], answer: 0 },
        { id: "zero", prompt: "–3 °C", options: ["ثَلَاثَةٌ تَحْتَ الصِّفْرِ", "ثَلَاثُونَ", "ثَلَاثَةٌ فَوْقَ الصِّفْرِ"], answer: 0 },
      ],
    },
    {
      kind: "cloze",
      slug: "step-5",
      title: "Übung 1: Wie ist das Wetter?",
      navLabel: "Übung 1",
      instruction: { arabic: "التَّدْرِيبَاتُ · تَدْرِيبٌ (١): أَجِبْ تَحْتَ الصُّورَةِ: مَا حَالَةُ الطَّقْسِ الْيَوْمَ؟ طَالِب (أ): كَيْفَ حَالَةُ الطَّقْسِ الْيَوْمَ؟ طَالِب (ب): الطَّقْسُ الْيَوْمَ بَارِدٌ.", german: "Übung 1: Jedes Bild hat zwei Hälften – antworte für jede Hälfte.", note: "Die Bilder des Buchs: staubig / heiß, bewölkt / regnerisch, stürmisch / kalt, mild / heiß. Übung 2 mit dem Partner abwechselnd." },
      items: ([["mutrib", "harr"], ["ghaim", "mumtir"], ["asif", "barid"], ["mutadil", "harr"]] as Array<[string, string]>).map(([a, b], n) => {
        const wa = WEATHER.find((w) => w[0] === a)!; const wb = WEATHER.find((w) => w[0] === b)!;
        const opts = (r: string) => sorted([r, ...WEATHER.map((w) => w[1]).filter((x) => x !== r).slice(n, n + 2)]).map((x) => `${x}.`);
        return { id: `t1-${n + 1}`, image: { src: WIMG(a), alt: wa[2] }, lines: [{ label: n % 2 ? "مَا حَالَةُ الطَّقْسِ الْيَوْمَ؟" : "كَيْفَ حَالَةُ الطَّقْسِ الْيَوْمَ؟", parts: ["الطَّقْسُ الْيَوْمَ ", gap([`${wa[1]}.`], opts(wa[1]))] }, { label: "", parts: ["وَ… الطَّقْسُ ", gap([`${wb[1]}.`], opts(wb[1]))] }] } satisfies ClozeItem;
      }),
    },
    {
      kind: "cloze",
      slug: "step-6",
      title: "Übung 2: Jahreszeit und Monat",
      navLabel: "Übung 2",
      instruction: { arabic: "تَدْرِيبٌ (٢): اُكْتُبْ جُمْلَةً تَحْتَ كُلِّ صُورَةٍ: هَذَا فَصْلُ … شَهْرُ …", german: "Übung 2: Welche Jahreszeit, welcher Monat? (Sommer, Herbst, Winter, Frühling – wie im Bild)", note: "Nützliche Wörter: فَصْل / فُصُول (Jahreszeit) – دَرَجَةُ الْحَرَارَةِ. Den Monat wählst du aus der Jahreszeit." },
      items: SEASONS.map(([id, a, g, m], n) => ({ id: `s-${id}`, image: { src: WIMG(`season-${id}`), alt: g }, lines: [{ label: "", parts: ["هَذَا فَصْلُ ", gap([a.replace(/^ال/, "ال")], SEASONS.map((s) => s[1])), ". شَهْرُ ", gap(m.split(" – "), [...new Set(MONTHS.map((x) => x[0]).filter((_, k) => k % 3 === n % 3).concat(m.split(" – ")[0]!))]), "."] }] })),
    },
    {
      kind: "quiz",
      slug: "step-7",
      title: "Übung 3: Temperatur und Wetter",
      navLabel: "Übung 3",
      instruction: { arabic: "تَدْرِيبٌ (٣): اِسْأَلْ عَنْ دَرَجَةِ الْحَرَارَةِ وَحَالَةِ الطَّقْسِ الْيَوْمَ؟", german: "Übung 3: Welches Wetter passt zur Temperatur? (Thermometer: 40 heiß, 30 warm, 20 mild, 10 kalt, 0 sehr kalt)" },
      items: ([["٣٠° – ٤٠°", "حَارّ"], ["١٢ تَحْتَ الصِّفْرِ – ٥", "بَارِد جِدًّا"], ["٢٠° – ٣٠°", "دَافِئ"], ["٨° – ١٥°", "بَارِد"]] as Array<[string, string]>).map(([t, w], n) => {
        const options = ["حَارّ", "دَافِئ", "بَارِد", "بَارِد جِدًّا"];
        return { id: `temp-${n + 1}`, arabic: `${t}: الطَّقْسُ …`, spoken: `دَرَجَةُ الْحَرَارَةِ ${t.replace(/°/g, "").replace("١٢ تَحْتَ الصِّفْرِ", "اثْنَتَا عَشْرَةَ تَحْتَ الصِّفْرِ").replace(/[٠-٩]+/g, (d) => ({ "٣٠": "ثَلَاثُونَ", "٤٠": "أَرْبَعُونَ", "٥": "خَمْسٌ", "٢٠": "عِشْرُونَ", "٨": "ثَمَانٍ", "١٥": "خَمْسَ عَشْرَةَ" } as Record<string, string>)[d] ?? d).replace(" – ", " إِلَى ")}.`, questions: [{ prompt: "Das Wetter:", options, answer: options.indexOf(w) }] } satisfies QuizItem;
      }),
    },
    {
      kind: "quiz",
      slug: "step-8",
      title: "Übung 5: Der Wetterbericht",
      navLabel: "Übung 5",
      instruction: { arabic: "تَدْرِيبٌ (٥): اِسْتَمِعْ لِلنَّشْرَةِ الْجَوِّيَّةِ لِكُلِّ مَدِينَةٍ وَاكْتُبْ (✓) فِي الْمَكَانِ الْمُنَاسِبِ ثُمَّ اسْتَمِعْ إِلَى دَرَجَةِ الْحَرَارَةِ.", german: "Übung 5: Hör den Wetterbericht für jede Stadt: Wie viel Grad sind es?", note: "Übung 4 (frag deinen Partner nach dem Wetter in seinem Land) braucht einen Partner. Der Hörtext steht im Buch auf S. 286." },
      items: REPORT.map(([city, , temp, text], n) => {
        const options = sorted([temp, TEMPS[(n + 1) % 5]!, TEMPS[(n + 3) % 5]!]);
        return { id: `rep-${n + 1}`, arabic: city, spoken: text, german: n === 0 ? "Beispiel im Buch: –٣" : undefined, questions: [{ prompt: "دَرَجَةُ الْحَرَارَةِ:", options, answer: options.indexOf(temp) }] } satisfies QuizItem;
      }),
    },
    {
      kind: "quiz",
      slug: "step-9",
      title: "Übung 5: Wetter in jeder Stadt",
      navLabel: "Übung 5 (✓)",
      instruction: { arabic: "… وَاكْتُبْ (✓) فِي الْمَكَانِ الْمُنَاسِبِ.", german: "Welches Wetter nennt der Bericht für die Stadt?" },
      items: REPORT.map(([city, weather, , text], n) => {
        const wrong = ["ثَلْج", "مُشْمِس", "عَاصِف", "مُمْطِر", "حَارّ", "غَائِم"].find((w) => !weather.includes(w))!;
        const options = sorted([weather[0]!, wrong]);
        return { id: `rw-${n + 1}`, arabic: city, spoken: text, questions: [{ prompt: "Das Wetter (morgens):", options, answer: options.indexOf(weather[0]!) }] } satisfies QuizItem;
      }),
    },
    { kind: "dialogue", mode: "listen", slug: "step-10", title: "Übung 6: Emads Reise", navLabel: "Übung 6 (hören)", instruction: { arabic: "تَدْرِيبٌ (٦): اُنْظُرْ إِلَى الصُّورَةِ: أَيْنَ سَلْوَى وَعِمَاد؟ اِقْرَأِ الْحِوَارَ وَأَجِبْ.", german: "Übung 6: Wohin reist Emad – und was zieht er an?", note: "Nützliche Wörter: قُبَّعَة (Mütze) – قُفَّاز (Handschuh) – مِعْطَف (Mantel)." }, dialogue: salwaImad },
    {
      kind: "quiz",
      slug: "step-11",
      title: "Übung 6: Fragen zum Gespräch",
      navLabel: "Übung 6 (Fragen)",
      instruction: { arabic: "١ – إِلَى أَيْنَ يُسَافِرُ عِمَاد؟ ٢ – فِي أَيِّ فَصْلٍ مِنَ السَّنَةِ يُسَافِرُ عِمَاد؟ ٣ – مَا حَالَةُ الطَّقْسِ فِي هَذَا الْفَصْلِ؟ ٤ – مَاذَا يَلْبَسُ عِمَاد فِي هَذَا الْفَصْلِ؟", german: "Antworte mit dem Gespräch.", note: "Übung 7 (Informationen zu Bildern, eine eigene Reise) und Übung 8 (2) sind frei." },
      items: ([
        ["إِلَى أَيْنَ يُسَافِرُ عِمَاد؟", "إِلَى طُوكْيُو فِي الْيَابَانِ", ["إِلَى دُبَي", "إِلَى الرِّبَاطِ"]],
        ["فِي أَيِّ فَصْلٍ يُسَافِرُ؟", "فِي الشِّتَاءِ", ["فِي الصَّيْفِ", "فِي الرَّبِيعِ"]],
        ["مَا حَالَةُ الطَّقْسِ فِي هَذَا الْفَصْلِ؟", "بَارِدٌ جِدًّا", ["حَارٌّ", "مُعْتَدِلٌ"]],
        ["مَاذَا يَلْبَسُ عِمَاد؟", "مِعْطَفًا وَقُفَّازًا وَقُبَّعَةً", ["قَمِيصًا خَفِيفًا", "بُلُوزَةً مِنْ قُطْنٍ"]],
      ] as Array<[string, string, string[]]>).map(([q, a, w], n) => {
        const options = sorted([a, ...w]);
        return { id: `iq-${n + 1}`, arabic: q, questions: [{ prompt: "Die Antwort:", options, answer: options.indexOf(a) }] };
      }),
    },
    { kind: "dialogue", mode: "roleplay", slug: "step-12", title: "Übung 6: Rollenspiel", navLabel: "Rollenspiel", instruction: { arabic: "الْحِوَارُ", german: "Spiel Salwa oder Emad." }, dialogue: salwaImad },
    { kind: "phrases", slug: "step-13", title: "Übung 8: Madihas Brief", navLabel: "Übung 8 (lesen)", instruction: { arabic: "تَدْرِيبٌ (٨): ١ – هَذِهِ رِسَالَةٌ مِنْ صَدِيقَةٍ عَرَبِيَّةٍ لِصَدِيقَةٍ أَجْنَبِيَّةٍ سَتَزُورُ الشَّرْقَ الْأَوْسَطَ فِي الشِّتَاءِ. اِقْرَأِ الرِّسَالَةَ ثُمَّ أَجِبْ: مَا حَالَةُ الطَّقْسِ فِي مِصْرَ فِي فَصْلِ الشِّتَاءِ؟", german: "Übung 8: Lies Madihas Brief an Alice. Wie ist das Wetter im Winter in Ägypten?", note: "Nützliche Wörter: سَتَزُورُ (wird besuchen) – قُطْن (Baumwolle) – خَفِيف (leicht) – زِيَارَة (Besuch) – مُنَاسِبَة (passend). Teil 2 (dein eigener Brief) ist frei." }, groups: [{ id: "madiha", title: "عَزِيزَتِي أَلِيس – الْقَاهِرَة ١٥/٤/٢٠٠٩", items: MADIHA.map(([a, g], n) => phrase(`madiha-${n + 1}`, a.replace("١٢ – ٢٢", "اثْنَتَيْ عَشْرَةَ وَاثْنَتَيْنِ وَعِشْرِينَ"), g)) }] },
    {
      kind: "quiz",
      slug: "step-14",
      title: "Gespräch: Das Wetter in den Bildern",
      navLabel: "Gespräch",
      instruction: { arabic: "الْمُحَادَثَةُ · تَدْرِيبٌ (٢): ١) مَا حَالَةُ الطَّقْسِ فِي كُلِّ صُورَةٍ. عَبِّرْ لِزَمِيلِكَ عَنْ كُلِّ صُورَةٍ وَمَاذَا يَلْبَسُ كُلُّ شَخْصٍ؟", german: "Wie ist das Wetter in jedem Bild? (Frühling, Strand im Sommer, Regen, Sturm im Herbst)", note: "Die Umfragen der „المحادثة“ (تدريب ١ und ٣: Wetter im Land der Mitschüler, Geburtstage) und تدريب ٤ (Website) brauchen eine Klasse." },
      items: ([["الرَّبِيع", "الْجَوُّ مُعْتَدِلٌ."], ["الصَّيْف", "الْجَوُّ حَارٌّ وَمُشْمِسٌ."], ["الشِّتَاء", "الْجَوُّ مُمْطِرٌ."], ["الْخَرِيف", "الْجَوُّ عَاصِفٌ."]] as Array<[string, string]>).map(([season, a], n, all) => {
        const options = sorted(all.map((x) => x[1]));
        return { id: `talk-${n + 1}`, arabic: `صُورَةٌ: ${season}`, questions: [{ prompt: "حَالَةُ الطَّقْسِ:", options, answer: options.indexOf(a) }] };
      }),
    },
    {
      kind: "table",
      slug: "step-15",
      title: "Merke: Familie, Beruf, Wetter",
      navLabel: "Merke",
      instruction: { arabic: "تَذَكَّرْ", german: "Merke: das Wichtigste von Unit 10 auf einen Blick." },
      tables: [
        { id: "kin", titleArabic: "١) أَلْقَابُ الْعَائِلَةِ: أَب = وَالِد · أُمّ = وَالِدَة · أَخ / أُخْت / ابْن / ابْنَة / جَدّ / جَدَّة", title: "Familie", columns: [{ arabic: "", german: "" }], rows: [[{ arabic: "وَالِدِي – وَالِدُكَ – وَالِدُهُ – وَالِدُهَا – وَالِدُهُمَا – وَالِدُهُمْ – وَالِدُنَا" }], [{ arabic: "وَالِدَتِي – وَالِدَتُكَ – وَالِدَتُهُ – وَالِدَتُهَا – وَالِدَتُهُمْ – وَالِدَتُنَا" }]] },
        { id: "ask", titleArabic: "٢) لِلسُّؤَالِ عَنْ أَفْرَادِ الْعَائِلَةِ: هَلْ أَحْمَد وَالِدُكَ؟", title: "Nachfragen", columns: [{ arabic: "", german: "" }], rows: [[{ arabic: "لَا، هُوَ لَيْسَ وَالِدِي، هُوَ وَالِدُ خَالِد." }], [{ arabic: "نَعَمْ، هُوَ وَالِدِي / أَبِي." }]] },
        { id: "zawj", titleArabic: "٣) زَوْج = زَوْجِي – زَوْجُكِ – زَوْجُهَا · زَوْجَة = زَوْجَتِي – زَوْجَتُكَ – زَوْجَتُهُ", title: "Ehepartner", columns: [{ arabic: "", german: "" }], rows: [[{ arabic: "زَوْجِي – زَوْجُكِ – زَوْجُهَا" }], [{ arabic: "زَوْجَتِي – زَوْجَتُكَ – زَوْجَتُهُ" }]] },
        { id: "work", titleArabic: "٤) لِلسُّؤَالِ عَنِ الْعَمَلِ · ٥) لِلسُّؤَالِ عَنِ الْوَظِيفَةِ · ٦) الْوَظِيفَةُ · ٧) لِلِاسْتِفْسَارِ", title: "Beruf", columns: [{ arabic: "السُّؤَالُ", german: "" }, { arabic: "الْإِجَابَةُ", german: "" }], rows: [[{ arabic: "هَلْ تَعْمَلُ؟" }, { arabic: "نَعَمْ، أَنَا أَعْمَلُ. / لَا، أَنَا لَا أَعْمَلُ." }], [{ arabic: "مَا عَمَلُكَ؟" }, { arabic: "هُوَ مُهَنْدِسٌ. / هِيَ مُهَنْدِسَةٌ." }], [{ arabic: "هَلْ مُصْطَفَى طَبِيبٌ؟" }, { arabic: "لَا، هُوَ لَيْسَ طَبِيبًا. هُوَ مُهَنْدِسٌ. / نَعَمْ، هُوَ طَبِيبٌ." }]] },
        { id: "weather", titleArabic: "٨) لِلسُّؤَالِ عَنِ الطَّقْسِ · ٩) دَرَجَةُ الْحَرَارَةِ · ١٠) فُصُولُ السَّنَةِ · ١١) شُهُورُ السَّنَةِ", title: "Wetter", columns: [{ arabic: "السُّؤَالُ", german: "" }, { arabic: "الْإِجَابَةُ", german: "" }], rows: [[{ arabic: "كَيْفَ حَالُ الطَّقْسِ الْيَوْمَ؟" }, { arabic: "الطَّقْسُ الْيَوْمَ مُمْطِرٌ – غَائِمٌ – حَارٌّ – بَارِدٌ – مُتْرِبٌ – عَاصِفٌ – دَافِئٌ – مُعْتَدِلٌ" }], [{ arabic: "كَمْ دَرَجَةُ الْحَرَارَةِ الْيَوْمَ؟" }, { arabic: "دَرَجَةُ الْحَرَارَةِ عِشْرُونَ – ثَلَاثُونَ – خَمْسَةٌ تَحْتَ الصِّفْرِ" }], [{ arabic: "الشِّتَاءُ – الرَّبِيعُ – الصَّيْفُ – الْخَرِيفُ" }, { arabic: MONTHS.map((m) => m[0]).join(" – ") }]] },
      ],
      quiz: [
        { id: "walid", prompt: "„mein Vater“ (zweites Wort)", options: ["وَالِدِي", "وَالِدَتِي", "وَلَدِي"], answer: 0 },
        { id: "eng", prompt: "„Sie ist Ingenieurin.“", options: ["هِيَ مُهَنْدِسَةٌ.", "هِيَ مُهَنْدِسٌ."], answer: 0 },
        { id: "aug", prompt: "August:", options: ["أُغُسْطُس", "أُكْتُوبَر", "أَبْرِيل"], answer: 0 },
      ],
    },
  ],
};
