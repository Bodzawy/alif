import type { A1Lesson, A1Word, ClozeItem, ClozePart, Dialogue, DialogueSpeaker, GapItem, MatchContent, PhraseItem, QuizItem } from "@/data/types";
import { transliterate } from "@/lib/arabic/transliterate";

import { unvocalised } from "../letter-lesson";
import { gaps2 } from "../lesson-2/letter-entry";
import { lines } from "../sabah-al-khayr";

// Unit 7 · تقديم (٢ أ) "مَا لَوْنُ هَذَا الْقَلَمِ؟" and (٢ ب) "هَذِهِ شَقَّتِي"
// (book pages 217–224, PDF 249–256): the colours, masculine and feminine, the
// rooms of the flat, Samir and Sharif, لاحظ القواعد, تدريب ١–٧ (٦: Hossam's
// flat), المحادثة (flat adverts), تذكر.

const IMG = "/images/a1/unit-7";
const gap = (accept: string[], options: string[]): ClozePart => ({ accept, options });
const sorted = (xs: string[]) => [...new Set(xs)].sort((a, b) => a.localeCompare(b, "ar"));
const sp = (id: string, name: string, voice: DialogueSpeaker["voice"], alt: string): DialogueSpeaker => ({ id, name, voice, avatar: { src: `${IMG}/${id}.svg`, alt } });
const phrase = (id: string, arabic: string, german: string): PhraseItem => ({ id, arabic, transliteration: transliterate(arabic), german, exercise: { id, target: unvocalised(arabic).replace(/[.؟?!،,:()]/g, "").replace(/\s+/g, " ").trim(), modelText: arabic } });
const word = (id: string, arabic: string, german: string, src: string, alt = german): A1Word => ({ id, arabic, german, transliteration: transliterate(arabic), image: { src, alt }, exercise: { id, target: unvocalised(arabic).replace(/[()]/g, "").replace(/\s+/g, " ").trim(), modelText: arabic } });

/** The colours: [id, masculine, feminine, German]. */
export const COLOURS: Array<[id: string, m: string, f: string, de: string]> = [
  ["ahmar", "أَحْمَر", "حَمْرَاء", "rot"], ["abyad", "أَبْيَض", "بَيْضَاء", "weiß"], ["akhdar", "أَخْضَر", "خَضْرَاء", "grün"], ["asfar", "أَصْفَر", "صَفْرَاء", "gelb"],
  ["aswad", "أَسْوَد", "سَوْدَاء", "schwarz"], ["azraq", "أَزْرَق", "زَرْقَاء", "blau"], ["fiddi", "فِضِّيّ", "فِضِّيَّة", "silbern"], ["dhahabi", "ذَهَبِيّ", "ذَهَبِيَّة", "golden"], ["burtuqali", "بُرْتُقَالِيّ", "بُرْتُقَالِيَّة", "orange"],
];

/** (٦) كَرِّرْ: the book's sixteen sentences (right column masculine, left column feminine). */
const REPEAT: Array<[arabic: string, german: string]> = [
  ["هَذَا قَمِيصٌ أَبْيَضُ.", "Das ist ein weißes Hemd."], ["هَذَا بَنْطَلُونٌ أَصْفَرُ.", "Das ist eine gelbe Hose."], ["هَذَا جَوْرَبٌ أَخْضَرُ.", "Das ist eine grüne Socke."], ["هَذَا فُسْتَانٌ أَحْمَرُ.", "Das ist ein rotes Kleid."],
  ["هَذَا حِذَاءٌ أَزْرَقُ.", "Das ist ein blauer Schuh."], ["هَذَا قَلَمٌ فِضِّيٌّ.", "Das ist ein silberner Stift."], ["هَذَا قَلَمٌ ذَهَبِيٌّ.", "Das ist ein goldener Stift."], ["هَذَا قَلَمٌ بُرْتُقَالِيٌّ.", "Das ist ein orangefarbener Stift."],
  ["هَذِهِ بُلُوزَةٌ بَيْضَاءُ.", "Das ist eine weiße Bluse."], ["هَذِهِ حَقِيبَةٌ صَفْرَاءُ.", "Das ist eine gelbe Tasche."], ["هَذِهِ جَاكِتَّةٌ (سُتْرَةٌ) خَضْرَاءُ.", "Das ist eine grüne Jacke."], ["هَذِهِ بَدْلَةٌ حَمْرَاءُ.", "Das ist ein roter Anzug."],
  ["هَذِهِ سَيَّارَةٌ زَرْقَاءُ.", "Das ist ein blaues Auto."], ["هَذِهِ حَقِيبَةٌ فِضِّيَّةٌ.", "Das ist eine silberne Tasche."], ["هَذِهِ حَقِيبَةٌ ذَهَبِيَّةٌ.", "Das ist eine goldene Tasche."], ["هَذِهِ حَقِيبَةٌ بُرْتُقَالِيَّةٌ.", "Das ist eine orangefarbene Tasche."],
];

/** (٢ ب) the flat, room by room (book order): [id, Arabic, German, picture]. */
const ROOMS: Array<[id: string, title: string, de: string, src: string, things: Array<[string, string, string, string]>]> = [
  ["nawm", "هَذِهِ حُجْرَةُ النَّوْمِ", "Das ist das Schlafzimmer", `${IMG}/hujrat-nawm.svg`, [
    ["sarir", "سَرِير", "Bett", "/images/a1/unit-4/sarir.svg"], ["sajjada", "سَجَّادَة", "Teppich", "/images/a1/unit-4/sajjada.svg"], ["dulab", "دُولَاب", "Schrank", "/images/a1/dal/dulab.svg"],
    ["shubbak", "شُبَّاك (نَافِذَة)", "Fenster", "/images/a1/unit-4/nafidha.svg"], ["misbah", "مِصْبَاح", "Lampe", "/images/a1/unit-4/misbah.svg"], ["maktab", "مَكْتَب", "Schreibtisch", "/images/a1/mim/maktab.svg"],
  ]],
  ["maisha", "هَذِهِ حُجْرَةُ الْمَعِيشَةِ", "Das ist das Wohnzimmer", `${IMG}/hujrat-maisha.svg`, [
    ["kanaba", "كَنَبَة (أَرِيكَة)", "Sofa", `${IMG}/kanaba.svg`], ["maqad", "مَقْعَد (كُرْسِيّ)", "Sessel, Stuhl", "/images/a1/kaf/kursi.svg"], ["tawila", "طَاوِلَة", "Tisch", "/images/a1/unit-4/tawila.svg"], ["maktaba-tv", "مَكْتَبَة وَتِلِفِزْيُون", "Regal und Fernseher", `${IMG}/tilifizyun.svg`],
  ]],
  ["salon", "هَذِهِ حُجْرَةُ الِاسْتِقْبَالِ (الصَّالُون)", "Das ist der Salon", `${IMG}/salon.svg`, [
    ["kanaba-2", "كَنَبَة", "Sofa", `${IMG}/kanaba.svg`], ["sura", "صُورَة", "Bild", "/images/a1/huruf-al-madd/sura.svg"], ["midfaa", "مِدْفَأَة", "Kamin, Heizung", `${IMG}/midfaa.svg`], ["sitara", "سِتَارَة", "Vorhang", "/images/a1/sin/sitara.svg"],
  ]],
  ["matbakh", "هَذَا الْمَطْبَخُ", "Das ist die Küche", `${IMG}/matbakh.svg`, [
    ["hawd", "حَوْض", "Spüle", `${IMG}/hawd.svg`], ["dulab-2", "دُولَاب", "Schrank", "/images/a1/dal/dulab.svg"], ["thallaja", "ثَلَّاجَة", "Kühlschrank", "/images/a1/unit-3/thallaja.svg"], ["ghassala", "غَسَّالَة", "Waschmaschine", "/images/vocabulary/ghassala.svg"], ["butagaz", "بُوتَاجَاز (مَوْقِد)", "Gasherd", `${IMG}/butagaz.svg`],
  ]],
  ["hammam", "هَذَا الْحَمَّامُ", "Das ist das Bad", `${IMG}/hammam.svg`, [
    ["hawd-2", "حَوْض", "Waschbecken", `${IMG}/hawd.svg`], ["banyu", "بَانْيُو", "Badewanne", `${IMG}/banyu.svg`], ["dush", "دُشّ", "Dusche", `${IMG}/dush.svg`], ["sakhkhan", "سَخَّان", "Warmwasserboiler", `${IMG}/sakhkhan.svg`],
  ]],
  ["taam", "هَذِهِ حُجْرَةُ الطَّعَامِ", "Das ist das Esszimmer", `${IMG}/hujrat-taam.svg`, [
    ["dulab-sufra", "دُولَابُ السُّفْرَةِ", "Geschirrschrank", `${IMG}/dulab-sufra.svg`], ["sufra", "سُفْرَة", "Esstisch", `${IMG}/sufra.svg`], ["karasi", "كَرَاسِي", "Stühle", `${IMG}/karasi.svg`],
  ]],
];

export const samirSharif: Dialogue = {
  id: "samir-sharif",
  intro: "Samir fragt Scharif nach den Farben in seiner Wohnung.",
  speakers: [sp("samir", "Samir", "male-1", "Samir, ein junger Mann"), sp("sharif", "Scharif", "male-2", "Scharif, ein Mann mit Brille")],
  lines: lines([
    ["u7-ss-1", "samir", "مَا لَوْنُ حُجْرَةِ النَّوْمِ يَا شَرِيفُ؟", "ما لون حجرة النوم يا شريف", "Mā lawnu ḥujrati n-nawmi yā Sharīf?", "Welche Farbe hat das Schlafzimmer, Scharif?"],
    ["u7-ss-2", "sharif", "حُجْرَةُ النَّوْمِ لَوْنُهَا أَخْضَرُ. حُجْرَةُ نَوْمِي خَضْرَاءُ.", "حجرة النوم لونها أخضر حجرة نومي خضراء", "Ḥujratu n-nawmi lawnuhā akhḍar. Ḥujratu nawmī khaḍrāʾ.", "Das Schlafzimmer ist grün. Mein Schlafzimmer ist grün."],
    ["u7-ss-3", "samir", "وَمَا لَوْنُ سَرِيرِكَ؟", "وما لون سريرك", "Wa-mā lawnu sarīrik?", "Und welche Farbe hat dein Bett?"],
    ["u7-ss-4", "sharif", "لَوْنُ سَرِيرِي أَبْيَضُ.", "لون سريري أبيض", "Lawnu sarīrī abyaḍ.", "Mein Bett ist weiß."],
    ["u7-ss-5", "samir", "وَهَلْ مَكْتَبُكَ لَوْنُهُ أَخْضَرُ؟", "وهل مكتبك لونه أخضر", "Wa-hal maktabuka lawnuhu akhḍar?", "Und ist dein Schreibtisch grün?"],
    ["u7-ss-6", "sharif", "لَا، مَكْتَبِي لَيْسَ لَوْنُهُ أَخْضَرَ، مَكْتَبِي لَوْنُهُ أَبْيَضُ.", "لا مكتبي ليس لونه أخضر مكتبي لونه أبيض", "Lā, maktabī laysa lawnuhu akhḍara, maktabī lawnuhu abyaḍ.", "Nein, mein Schreibtisch ist nicht grün, mein Schreibtisch ist weiß."],
  ]),
  question: { prompt: "مَا لَوْنُ مَكْتَبِ شَرِيف؟", options: ["أَبْيَض", "أَخْضَر", "أَزْرَق"], answer: 0 },
};

/** تدريب ١: (أ) and (ب) – several endings fit some beginnings. */
const T1: MatchContent = {
  promptTitle: "(أ)",
  optionTitle: "(ب)",
  prompts: [
    { id: "p1", arabic: "١) هَذَا قَلَمٌ", answer: "j", example: true, result: { arabic: "هَذَا قَلَمٌ لَوْنُهُ أَسْوَدُ.", german: "Das ist ein Stift, er ist schwarz." } },
    { id: "p2", arabic: "٢) هَذِهِ الْحُجْرَةُ", answer: "d" },
    { id: "p3", arabic: "٣) الْأَرِيكَةُ (الْكَنَبَةُ)", answer: "w", accept: ["h2"] },
    { id: "p4", arabic: "٤) هَذَا لَيْسَ", answer: "a" },
    { id: "p5", arabic: "٥) هَذِهِ لَيْسَتْ", answer: "b" },
    { id: "p6", arabic: "٦) هَذَا حَمَّامٌ", answer: "z", accept: ["h"] },
    { id: "p7", arabic: "٧) هَذَا دُولَابٌ", answer: "h", accept: ["z"] },
    { id: "p8", arabic: "٨) هَذِهِ لَيْسَتْ", answer: "h2", accept: ["w"] },
  ],
  // The book's column (ب), top to bottom.
  options: [
    { id: "a", label: "أ – مَطْبَخًا أَحْمَرَ.", arabic: "مَطْبَخًا أَحْمَرَ." },
    { id: "b", label: "ب – طَاوِلَةً صَفْرَاءَ.", arabic: "طَاوِلَةً صَفْرَاءَ." },
    { id: "j", label: "ج – لَوْنُهُ أَسْوَدُ.", arabic: "لَوْنُهُ أَسْوَدُ." },
    { id: "d", label: "د – لَوْنُهَا أَخْضَرُ.", arabic: "لَوْنُهَا أَخْضَرُ." },
    { id: "h", label: "هـ – لَوْنُهُ ذَهَبِيٌّ.", arabic: "لَوْنُهُ ذَهَبِيٌّ." },
    { id: "w", label: "و – صَفْرَاءُ.", arabic: "صَفْرَاءُ." },
    { id: "z", label: "ز – لَوْنُهُ أَبْيَضُ.", arabic: "لَوْنُهُ أَبْيَضُ." },
    { id: "h2", label: "هـ – زَرْقَاءُ.", arabic: "زَرْقَاءُ." },
  ],
};

/** تدريب ٣: the scrambled letters of the book and the words. */
const ARRANGE: Array<[letters: string[], spoken: string, german: string, src: string]> = [
  [["خ", "م", "ط", "ب"], "مَطْبَخ", "Küche", `${IMG}/matbakh.svg`],
  [["م", "ح", "م", "ا"], "حَمَّام", "Bad", `${IMG}/hammam.svg`],
  [["ض", "و", "ح"], "حَوْض", "Waschbecken", `${IMG}/hawd.svg`],
  // The book prints two-word names as two letter groups ("ر–ج–ح–ة / ع–ي–ش–م–ة"): one task each.
  [["ة", "ح", "ج", "ر"], "حُجْرَة", "Zimmer (Schlafzimmer)", `${IMG}/hujrat-nawm.svg`],
  [["م", "ن", "و"], "نَوْم", "Schlaf (Schlafzimmer)", `${IMG}/hujrat-nawm.svg`],
  [["ح", "ر", "ة", "ج"], "حُجْرَة", "Zimmer (Esszimmer)", `${IMG}/hujrat-taam.svg`],
  [["ر", "س", "ف", "ة"], "سُفْرَة", "Essen, Esstisch (Esszimmer)", `${IMG}/hujrat-taam.svg`],
  [["ر", "ج", "ح", "ة"], "حُجْرَة", "Zimmer (Wohnzimmer)", `${IMG}/hujrat-maisha.svg`],
  [["ع", "ي", "ش", "م", "ة"], "مَعِيشَة", "Leben (Wohnzimmer)", `${IMG}/hujrat-maisha.svg`],
  [["ح", "م", "ب", "ا", "ص"], "مِصْبَاح", "Lampe", "/images/a1/unit-4/misbah.svg"],
  [["ك", "ة", "ن", "ب"], "كَنَبَة", "Sofa", `${IMG}/kanaba.svg`],
  [["ل", "ا", "ج", "ث", "ة"], "ثَلَّاجَة", "Kühlschrank", "/images/a1/unit-3/thallaja.svg"],
];
const arrangeItem = ([letters, spoken, german, src]: (typeof ARRANGE)[number], n: number): GapItem => {
  const bare = unvocalised(spoken);
  return { id: `arrange-room-${n + 1}`, arabic: bare, spoken, german, image: { src, alt: german }, pattern: Array.from(bare).map((c) => (c === " " ? " " : "_")).join(""), bare: true, choices: [...new Set(letters)] };
};

/** تدريب ٣ (2): the sentences – the colour the book prints for each picture. */
const SENTENCES: Array<[noun: string, m: boolean, colour: string]> = [
  ["مَطْبَخٌ", true, "ahmar"], ["حَمَّامٌ", true, "abyad"], ["حَوْضٌ", true, "azraq"], ["حُجْرَةُ نَوْمٍ", false, "asfar"], ["حُجْرَةُ سُفْرَةٍ", false, "ahmar"], ["حُجْرَةُ مَعِيشَةٍ", false, "aswad"], ["مِصْبَاحٌ", true, "asfar"],
];
const colourOf = (id: string, m: boolean, ending = "ُ") => {
  const c = COLOURS.find((x) => x[0] === id)!;
  return `${m ? c[1] : c[2]}${ending}`;
};
const SENTENCE_ITEMS: ClozeItem[] = SENTENCES.map(([noun, m, colour], n) => {
  const right = `${m ? "هَذَا" : "هَذِهِ"} ${noun} ${colourOf(colour, m)}.`;
  const wrongGender = `${m ? "هَذَا" : "هَذِهِ"} ${noun} ${colourOf(colour, !m)}.`;
  const wrongDem = `${m ? "هَذِهِ" : "هَذَا"} ${noun} ${colourOf(colour, m)}.`;
  return { id: `s${n + 1}`, hint: n === 0 ? "Beispiel im Buch: هَذَا مَطْبَخٌ. … هَذَا مَطْبَخٌ أَحْمَرُ." : undefined, lines: [{ label: String(n + 1), parts: n === 0 ? [right] : [gap([right], sorted([right, wrongGender, wrongDem]))] }] };
});

/** تدريب ٤: the answer may be yes or no – it must agree with the noun. */
const T4: Array<[q: string, yes: string, no: string, wrong: string]> = [
  ["هَلْ هَذِهِ أَرِيكَةٌ (كَنَبَةٌ) خَضْرَاءُ؟", "نَعَمْ، هَذِهِ أَرِيكَةٌ خَضْرَاءُ.", "لَا، هَذِهِ لَيْسَتْ أَرِيكَةً خَضْرَاءَ.", "نَعَمْ، هَذِهِ أَرِيكَةٌ أَخْضَرُ."],
  ["مَا لَوْنُ هَذَا الْحَمَّامِ؟", "هَذَا الْحَمَّامُ لَوْنُهُ أَبْيَضُ.", "هَذَا الْحَمَّامُ لَوْنُهُ أَزْرَقُ.", "هَذَا الْحَمَّامُ لَوْنُهَا بَيْضَاءُ."],
  ["هَلْ هَذَا مَوْقِدٌ (بُوتَاجَازٌ) فِضِّيٌّ؟", "نَعَمْ، هَذَا مَوْقِدٌ فِضِّيٌّ.", "لَا، هَذَا لَيْسَ مَوْقِدًا فِضِّيًّا.", "لَا، هَذِهِ لَيْسَتْ مَوْقِدًا فِضِّيَّةً."],
  ["مَا لَوْنُ هَذِهِ الثَّلَّاجَةِ؟", "هَذِهِ الثَّلَّاجَةُ لَوْنُهَا أَبْيَضُ.", "هَذِهِ الثَّلَّاجَةُ لَوْنُهَا فِضِّيٌّ.", "هَذِهِ الثَّلَّاجَةُ لَوْنُهُ أَبْيَضُ."],
  ["هَلْ هَذِهِ سَجَّادَةٌ سَوْدَاءُ؟", "نَعَمْ، هَذِهِ سَجَّادَةٌ سَوْدَاءُ.", "لَا، هَذِهِ لَيْسَتْ سَجَّادَةً سَوْدَاءَ.", "نَعَمْ، هَذِهِ سَجَّادَةٌ أَسْوَدُ."],
];

/** تدريب ٥: the answers – and the questions. */
const T5: Array<[answer: string, q: string, wrong: string[]]> = [
  ["هَذِهِ سَتَارَةٌ لَوْنُهَا ذَهَبِيٌّ.", "مَا لَوْنُ هَذِهِ السِّتَارَةِ؟", ["مَا لَوْنُ هَذَا السِّتَارَةِ؟", "هَلْ هَذَا سِتَارَةٌ؟"]],
  ["لَا، هَذِهِ لَيْسَتْ حُجْرَةَ نَوْمٍ صَفْرَاءَ. هَذِهِ حُجْرَةٌ خَضْرَاءُ.", "هَلْ هَذِهِ حُجْرَةُ نَوْمٍ صَفْرَاءُ؟", ["مَا لَوْنُ حُجْرَةِ النَّوْمِ؟", "هَلْ هَذِهِ حُجْرَةُ نَوْمٍ خَضْرَاءُ؟"]],
  ["هَذَا مَكْتَبٌ لَوْنُهُ أَسْوَدُ.", "مَا لَوْنُ هَذَا الْمَكْتَبِ؟", ["مَا لَوْنُ هَذِهِ الْمَكْتَبِ؟", "هَلْ هَذَا مَكْتَبٌ أَبْيَضُ؟"]],
  ["هَذِهِ مِدْفَأَةٌ بَيْضَاءُ.", "مَا هَذِهِ؟", ["مَا هَذَا؟", "مَا لَوْنُ هَذَا؟"]],
  ["لَا، هَذِهِ لَيْسَتْ مَكْتَبَةً سَوْدَاءَ. هَذِهِ مَكْتَبَةٌ خَضْرَاءُ.", "هَلْ هَذِهِ مَكْتَبَةٌ سَوْدَاءُ؟", ["هَلْ هَذِهِ مَكْتَبَةٌ خَضْرَاءُ؟", "هَلْ هَذَا مَكْتَبٌ أَسْوَدُ؟"]],
];

const HOSSAM: Array<[string, string]> = [
  ["شَقَّتِي جَمِيلَةٌ وَوَاسِعَةٌ.", "Meine Wohnung ist schön und geräumig."],
  ["شَقَّتِي بِهَا ٣ حُجُرَاتٍ – حُجْرَةُ النَّوْمِ وَحُجْرَةُ السُّفْرَةِ وَحُجْرَةُ مَعِيشَةٍ وَاسِعَةٌ.", "Meine Wohnung hat drei Zimmer – das Schlafzimmer, das Esszimmer und ein geräumiges Wohnzimmer."],
  ["الْحَمَّامُ لَوْنُهُ أَخْضَرُ، وَلَكِنِ الْمَطْبَخُ لَوْنُهُ أَبْيَضُ.", "Das Bad ist grün, aber die Küche ist weiß."],
  ["حُجْرَةُ نَوْمِي لَوْنُهَا أَبْيَضُ أَيْضًا، وَلَكِنْ حُجْرَةُ السُّفْرَةِ لَوْنُهَا أَخْضَرُ.", "Mein Schlafzimmer ist auch weiß, aber das Esszimmer ist grün."],
  ["وَحُجْرَةُ الْمَعِيشَةِ لَوْنُهَا أَحْمَرُ جَمِيلٌ.", "Und das Wohnzimmer hat ein schönes Rot."],
];
const HOSSAM_MATCH: MatchContent = {
  promptTitle: "(أ)",
  optionTitle: "(ب)",
  prompts: [
    { id: "h1", arabic: "١) الْحَمَّامُ لَوْنُهُ أَخْضَرُ", answer: "kitchen", example: true, result: { arabic: "الْحَمَّامُ لَوْنُهُ أَخْضَرُ، وَلَكِنِ الْمَطْبَخُ لَوْنُهُ أَبْيَضُ.", german: "Das Bad ist grün, aber die Küche ist weiß." } },
    { id: "h2", arabic: "٢) شَقَّتِي", answer: "nice", accept: ["three"] },
    { id: "h3", arabic: "٣) شَقَّتِي", answer: "three", accept: ["nice"] },
    { id: "h4", arabic: "٤) حُجْرَةُ الْمَعِيشَةِ", answer: "red" },
    { id: "h5", arabic: "٥) حُجْرَةُ السُّفْرَةِ", answer: "green" },
  ],
  options: [
    { id: "red", label: "لَوْنُهَا أَحْمَرُ جَمِيلٌ.", arabic: "لَوْنُهَا أَحْمَرُ جَمِيلٌ." },
    { id: "green", label: "لَوْنُهَا أَخْضَرُ.", arabic: "لَوْنُهَا أَخْضَرُ." },
    { id: "nice", label: "جَمِيلَةٌ وَوَاسِعَةٌ.", arabic: "جَمِيلَةٌ وَوَاسِعَةٌ." },
    { id: "kitchen", label: "وَلَكِنِ الْمَطْبَخُ لَوْنُهُ أَبْيَضُ.", arabic: "وَلَكِنِ الْمَطْبَخُ لَوْنُهُ أَبْيَضُ." },
    { id: "three", label: "٣ حُجُرَاتٍ.", arabic: "ثَلَاثُ حُجُرَاتٍ." },
  ],
};

/** المحادثة: the three adverts (right to left). */
const ADS: Array<[id: string, text: string, rooms: string, bath: string, price: string]> = [
  ["ad1", "شَقَّةٌ ٣ غُرَفٍ وَاسِعَةٌ: حُجْرَةُ نَوْمٍ – مَكْتَبٌ – حُجْرَةُ مَعِيشَةٍ وَصَالَةٌ. حَمَّامٌ أَخْضَرُ – مَطْبَخٌ أَبْيَضُ. مَطْلُوبٌ: ٣٠٠٠ جُنَيْهٍ.", "٣", "أَخْضَر", "٣٠٠٠"],
  ["ad2", "شَقَّةٌ جَمِيلَةٌ وَرَخِيصَةٌ: حُجْرَةُ نَوْمٍ – صَالَةٌ. حَمَّامٌ وَاسِعٌ أَزْرَقُ – مَطْبَخٌ لَوْنُهُ أَحْمَرُ. مَطْلُوبٌ: ١٥٠٠ جُنَيْهٍ.", "١", "أَزْرَق", "١٥٠٠"],
  ["ad3", "شَقَّةٌ جَمِيلَةٌ ٥ غُرَفٍ وَصَالَةٌ: ٢ حُجْرَةُ نَوْمٍ، حُجْرَةُ سُفْرَةٍ زَرْقَاءُ، حُجْرَةُ مَعِيشَةٍ خَضْرَاءُ، حُجْرَةُ مَكْتَبٍ سَوْدَاءُ. مَطْبَخٌ وَاسِعٌ – حَمَّامٌ لَوْنُهُ أَبْيَضُ. مَطْلُوبٌ: ٥٥٠٠ جُنَيْهٍ.", "٥", "أَبْيَض", "٥٥٠٠"],
];
const ADS_QUIZ: QuizItem[] = ADS.map(([id, text, rooms, bath, price], n) => ({
  id,
  arabic: text,
  german: `Anzeige ${n + 1}`,
  questions: [
    { prompt: "كَمْ حُجْرَةً فِي الشَّقَّةِ؟", options: ["١", "٣", "٥"], answer: ["١", "٣", "٥"].indexOf(rooms) },
    { prompt: "مَا لَوْنُ الْحَمَّامِ؟", options: ["أَبْيَض", "أَخْضَر", "أَزْرَق"], answer: ["أَبْيَض", "أَخْضَر", "أَزْرَق"].indexOf(bath) },
    { prompt: "مَا سِعْرُ الشَّقَّةِ؟", options: ["١٥٠٠", "٣٠٠٠", "٥٥٠٠"], answer: ["١٥٠٠", "٣٠٠٠", "٥٥٠٠"].indexOf(price) },
  ],
}));

export const a1MaLawn: A1Lesson = {
  slug: "ma-lawn",
  kind: "phrase",
  label: "مَا لَوْنُ هَذَا الْقَلَمِ؟",
  labelGerman: "Welche Farbe hat dieser Stift?",
  steps: [
    {
      kind: "phrases",
      slug: "step-1",
      title: "Welche Farbe hat der Stift?",
      navLabel: "Farbe",
      instruction: { arabic: "تَقْدِيمٌ (٢ أ): مَا لَوْنُ هَذَا الْقَلَمِ؟ ١) مَا هَذَا؟ هَذَا قَلَمٌ. مَا لَوْنُ الْقَلَمِ؟", german: "Der Lehrer zeigt einen Stift und eine Tasche: Was ist das? Welche Farbe hat es? Hör zu und sprich nach." },
      groups: [{
        id: "pres",
        title: "تَقْدِيمٌ (٢ أ)",
        items: [
          ["مَا هَذَا؟ هَذَا قَلَمٌ.", "Was ist das? Das ist ein Stift."],
          ["مَا لَوْنُ الْقَلَمِ؟ لَوْنُ الْقَلَمِ أَسْوَدُ.", "Welche Farbe hat der Stift? Der Stift ist schwarz."],
          ["هَذَا الْقَلَمُ لَوْنُهُ أَسْوَدُ.", "Dieser Stift ist schwarz."],
          ["هَلْ هَذَا قَلَمٌ أَسْوَدُ؟ نَعَمْ، هَذَا قَلَمٌ أَسْوَدُ.", "Ist das ein schwarzer Stift? Ja."],
          ["هَذِهِ الْحَقِيبَةُ سَوْدَاءُ.", "Diese Tasche ist schwarz."],
          ["مَا لَوْنُ هَذِهِ الْحَقِيبَةِ؟ هَذِهِ الْحَقِيبَةُ لَوْنُهَا أَسْوَدُ.", "Welche Farbe hat diese Tasche? Sie ist schwarz."],
          ["هَلْ هَذِهِ حَقِيبَةٌ سَوْدَاءُ؟ لَا، هَذِهِ لَيْسَتْ حَقِيبَةً سَوْدَاءَ، هَذِهِ حَقِيبَةٌ زَرْقَاءُ.", "Ist das eine schwarze Tasche? Nein, sie ist blau."],
          ["هَلْ هَذَا قَلَمٌ أَسْوَدُ؟ لَا، هَذَا لَيْسَ قَلَمًا أَسْوَدَ، هَذَا قَلَمٌ أَزْرَقُ.", "Ist das ein schwarzer Stift? Nein, er ist blau."],
        ].map(([a, g], n) => phrase(`pres-${n + 1}`, a!, g!)),
      }],
    },
    {
      kind: "words",
      slug: "step-2",
      title: "Die Farben",
      navLabel: "Farben",
      instruction: { arabic: "اُدْخُلْ إِلَى الْمَوْقِعِ لِتَتَعَرَّفَ عَلَى هَذِهِ الْأَلْوَانِ: أَحْمَر – أَبْيَض – أَخْضَر – أَصْفَر – أَسْوَد – أَزْرَق – فِضِّيّ – ذَهَبِيّ – بُرْتُقَالِيّ", german: "Die Farben (männliche Form). Im Buch lernt man sie auf der Website des Verlags; hier mit Bild und Aussprache." },
      groups: [{ id: "colours", title: "الْأَلْوَانُ", words: COLOURS.map(([id, m, f, de]) => word(`colour-${id}`, m, `${de} (weiblich: ${f})`, `${IMG}/color-${id}.svg`, de)) }],
    },
    {
      kind: "phrases",
      slug: "step-3",
      title: "Männlich und weiblich",
      navLabel: "Nachsprechen",
      instruction: { arabic: "٦) كَرِّرْ:", german: "Sprich nach: die Farbe richtet sich nach dem Ding – أَحْمَر (männlich), حَمْرَاء (weiblich)." },
      groups: [
        { id: "m", title: "هَذَا … (مُذَكَّر)", items: REPEAT.slice(0, 8).map(([a, g], n) => phrase(`rep-m-${n + 1}`, a, g)) },
        { id: "f", title: "هَذِهِ … (مُؤَنَّث)", items: REPEAT.slice(8).map(([a, g], n) => phrase(`rep-f-${n + 1}`, a, g)) },
      ],
    },
    ...ROOMS.map(([id, title, de, , things], n) => ({
      kind: "words" as const,
      slug: `step-${4 + n}`,
      title: `${de}`,
      navLabel: n === 0 ? "Wohnung" : de.replace(/^Das ist (das|die|der) /, ""),
      instruction: n === 0
        ? { arabic: "تَقْدِيمٌ (٢ ب): هَذِهِ شَقَّتِي · ١) اِقْرَأْ وَتَابِعِ الصُّورَةَ: أَنَا اسْمِي شَرِيف وَهَذِهِ شَقَّتِي.", german: "Scharif zeigt seine Wohnung, Zimmer für Zimmer. Hör die Wörter und sprich nach.", note: "Teil 2 im Buch: die Nummer jedes Dings ins Bild schreiben." }
        : { arabic: `${title}:`, german: `${de}. Hör die Wörter und sprich nach.` },
      groups: [{ id, title: `${title}`, words: [word(`room-${id}`, title.replace(/^هَذِهِ |^هَذَا /, ""), de.replace("Das ist ", ""), ROOMS[n]![3]), ...things.map(([tid, a, g, src]) => word(`thing-${tid}`, a, g, src))] }],
    })),
    { kind: "dialogue", mode: "listen", slug: "step-10", title: "Anhören: Samir und Scharif", navLabel: "Anhören", instruction: { arabic: "٣) اِقْرَأِ الْحِوَارَ:", german: "Hör die Unterhaltung: Welche Farben hat Scharifs Wohnung?" }, dialogue: samirSharif },
    { kind: "dialogue", mode: "repeat", slug: "step-11", title: "Nachsprechen", navLabel: "Nachsprechen 2", instruction: { arabic: "٣) اِقْرَأِ الْحِوَارَ:", german: "Sprich jede Zeile nach." }, dialogue: samirSharif },
    { kind: "dialogue", mode: "roleplay", slug: "step-12", title: "Rollenspiel", navLabel: "Rollenspiel", instruction: { arabic: "٣) اِقْرَأِ الْحِوَارَ:", german: "Spiel die Unterhaltung als Samir oder Scharif." }, dialogue: samirSharif },
    {
      kind: "table",
      slug: "step-13",
      title: "Grammatik: nach der Farbe fragen",
      navLabel: "Grammatik",
      instruction: { arabic: "لَاحِظِ الْقَوَاعِدَ: ١) لِلسُّؤَالِ عَنِ اللَّوْنِ ٢) تَأْنِيثُ وَتَذْكِيرُ الْأَلْوَانِ ٣) الْأَلْوَانُ صِفَاتٌ تَتْبَعُ الْمَوْصُوفَ ٤) السُّؤَالُ: هَلْ هَذَا سَرِيرٌ أَخْضَرُ؟", german: "Achte auf die Regeln: Die Farbe ist ein Adjektiv und richtet sich nach dem Ding (männlich / weiblich)." },
      tables: [
        {
          id: "ask",
          titleArabic: "١) لِلسُّؤَالِ عَنِ اللَّوْنِ:",
          title: "Nach der Farbe fragen",
          columns: [{ arabic: "السُّؤَالُ", german: "Frage" }, { arabic: "الْإِجَابَةُ", german: "Antwort" }],
          rows: [
            [{ arabic: "مَا لَوْنُ هَذَا الْقَمِيصِ؟" }, { arabic: "لَوْنُ هَذَا الْقَمِيصِ أَحْمَرُ. لَوْنُهُ أَحْمَرُ." }],
            [{ arabic: "مَا لَوْنُ هَذِهِ الْحَقِيبَةِ؟" }, { arabic: "لَوْنُ هَذِهِ الْحَقِيبَةِ أَحْمَرُ. لَوْنُهَا أَحْمَرُ." }],
            [{ arabic: "هَلْ هَذَا قَمِيصٌ أَحْمَرُ؟" }, { arabic: "نَعَمْ، هَذَا قَمِيصٌ أَحْمَرُ. / لَا، هَذَا لَيْسَ قَمِيصًا أَحْمَرَ. هَذَا قَمِيصٌ أَبْيَضُ." }],
            [{ arabic: "هَلْ هَذِهِ حَقِيبَةٌ سَوْدَاءُ؟" }, { arabic: "نَعَمْ، هَذِهِ حَقِيبَةٌ سَوْدَاءُ. / لَا، هَذِهِ لَيْسَتْ حَقِيبَةً سَوْدَاءَ." }],
          ],
        },
        { id: "gender", titleArabic: "٢) تَأْنِيثُ وَتَذْكِيرُ الْأَلْوَانِ: هَذَا كِتَابٌ أَحْمَرُ – هَذِهِ سَيَّارَةٌ حَمْرَاءُ.", title: "Männlich und weiblich", columns: [{ arabic: "مُذَكَّر", german: "männlich" }, { arabic: "مُؤَنَّث", german: "weiblich" }], rows: COLOURS.map(([, m, f, de]) => [{ arabic: m, german: de }, { arabic: f }]) },
        {
          id: "follow",
          titleArabic: "٣) الْأَلْوَانُ صِفَاتٌ تَتْبَعُ الْمَوْصُوفَ · ٤) النَّفْيُ: لَيْسَ + سَرِيرًا + أَخْضَرَ",
          title: "Mit Verneinung",
          columns: [{ arabic: "الْإِيجَابُ", german: "Ja" }, { arabic: "النَّفْيُ", german: "Nein" }],
          rows: [
            [{ arabic: "هَذَا قَمِيصٌ أَحْمَرُ." }, { arabic: "هَذَا لَيْسَ قَمِيصًا أَحْمَرَ." }],
            [{ arabic: "هَذِهِ حَقِيبَةٌ حَمْرَاءُ." }, { arabic: "هَذِهِ لَيْسَتْ حَقِيبَةً حَمْرَاءَ." }],
            [{ arabic: "نَعَمْ، هَذَا سَرِيرٌ أَخْضَرُ." }, { arabic: "لَا، هَذَا لَيْسَ سَرِيرًا أَخْضَرَ." }],
          ],
        },
      ],
      quiz: [
        { id: "car", prompt: "Ein rotes Auto:", options: ["سَيَّارَةٌ أَحْمَرُ", "سَيَّارَةٌ حَمْرَاءُ"], answer: 1 },
        { id: "book", prompt: "Ein grünes Buch:", options: ["كِتَابٌ أَخْضَرُ", "كِتَابٌ خَضْرَاءُ"], answer: 0 },
        { id: "q", prompt: "„Welche Farbe hat diese Tasche?“", options: ["مَا لَوْنُ هَذِهِ الْحَقِيبَةِ؟", "مَا لَوْنُ هَذَا الْحَقِيبَةِ؟", "مَا سِعْرُ هَذِهِ الْحَقِيبَةِ؟"], answer: 0 },
        { id: "neg", prompt: "„Das ist kein weißes Hemd.“", options: ["هَذَا لَيْسَ قَمِيصٌ أَبْيَضُ.", "هَذَا لَيْسَ قَمِيصًا أَبْيَضَ.", "هَذِهِ لَيْسَتْ قَمِيصًا بَيْضَاءَ."], answer: 1 },
      ],
    },
    { kind: "match", slug: "step-14", title: "Übung 1: Sätze verbinden", navLabel: "Übung 1", instruction: { arabic: "التَّدْرِيبَاتُ · تَدْرِيبٌ (١): صِلْ لِتُكَوِّنَ جُمْلَةً.", german: "Übung 1: Verbinde (أ) und (ب) zu einem Satz. Achte auf männlich / weiblich.", note: "Wo mehrere Enden grammatisch passen, ist jedes richtig. Übung 2 im Buch („اُدْخُلْ إِلَى الْمَوْقِعِ“) ist auf der Website des Verlags." }, match: T1 },
    { kind: "gaps", slug: "step-15", title: "Übung 3 (1): die Wörter", navLabel: "Übung 3 (Wörter)", instruction: { arabic: "تَدْرِيبٌ (٣): اُكْتُبِ الِاسْمَ (هَذَا … / هَذِهِ …) ثُمَّ اكْتُبِ الْجُمَلَ كَالْمِثَالِ.", german: "Übung 3: Ordne die Buchstaben zum Wort – von rechts nach links." }, gaps: gaps2("picture", ["م"], ARRANGE.map(arrangeItem), { clip: "shared/arrange_intro", text: "Ordne die Buchstaben: Leg sie von rechts nach links in die Felder, so dass das Wort zum Bild entsteht." }) },
    { kind: "cloze", slug: "step-16", title: "Übung 3 (2): die Sätze", navLabel: "Übung 3 (Sätze)", instruction: { arabic: "… ثُمَّ اكْتُبِ الْجُمَلَ كَالْمِثَالِ: هَذَا مَطْبَخٌ. هَلْ هَذَا مَطْبَخٌ لَوْنُهُ أَخْضَرُ؟ لَا، هَذَا لَيْسَ مَطْبَخًا أَخْضَرَ. هَذَا مَطْبَخٌ أَحْمَرُ.", german: "Schreib den letzten Satz – mit der Farbe, die das Buch angibt, männlich oder weiblich.", note: "Die Frage mit هَلْ … ؟ und das „Nein“ wählst du im Buch selbst; die Farbe am Ende ist vorgegeben (bei Sofa und Kühlschrank druckt das Buch keine)." }, items: SENTENCE_ITEMS },
    {
      kind: "cloze",
      slug: "step-17",
      title: "Übung 4: ganze Antworten",
      navLabel: "Übung 4",
      instruction: { arabic: "تَدْرِيبٌ (٤): ١) أَجِبْ عَنِ الْأَسْئِلَةِ التَّالِيَةِ إِجَابَةً كَامِلَةً. ٢) تَبَادَلْ مَعَ زَمِيلِكَ الْأَسْئِلَةَ لِتَعْرِفَ إِجَابَتَهُ.", german: "Übung 4: Antworte in ganzen Sätzen. Ja oder Nein – beides ist richtig, wenn die Form stimmt.", note: "Die Bilder des Buchs sind schwarz-weiß; die Farbe ist frei." },
      items: T4.map(([q, yes, no, wrong], n) => ({ id: `t4-${n + 1}`, lines: [{ label: String(n + 1), parts: [q] }, { label: "", parts: [gap([yes, no], sorted([yes, no, wrong]))] }] })),
    },
    { kind: "cloze", slug: "step-18", title: "Übung 5: die Fragen zu den Antworten", navLabel: "Übung 5", instruction: { arabic: "تَدْرِيبٌ (٥): ١) اُكْتُبْ أَسْئِلَةً لِهَذِهِ الْإِجَابَاتِ. ٢) تَبَادَلِ السُّؤَالَ وَالْإِجَابَةَ مَعَ زَمِيلِكَ لِتُصَحِّحَ إِجَابَتَكَ.", german: "Übung 5: Welche Frage passt zur Antwort?" }, items: T5.map(([answer, q, wrong], n) => ({ id: `t5-${n + 1}`, lines: [{ label: String(n + 1), parts: [gap([q], sorted([q, ...wrong]))] }, { label: "", parts: [answer] }] })) },
    { kind: "phrases", slug: "step-19", title: "Übung 6: Hossams Wohnung", navLabel: "Übung 6 (lesen)", instruction: { arabic: "تَدْرِيبٌ (٦): شَقَّةُ حُسَام · اِقْرَأْ مَاذَا كَتَبَ حُسَام عَنْ شَقَّتِهِ ثُمَّ أَجِبْ عَنِ الْأَسْئِلَةِ.", german: "Übung 6: Lies, was Hossam über seine Wohnung schreibt, Satz für Satz.", note: "Nützliche Wörter: جَمِيلَة / جَمِيل (schön) – وَاسِع / وَاسِعَة (geräumig) – لَكِنْ (aber)." }, groups: [{ id: "hossam", title: "شَقَّةُ حُسَام", items: HOSSAM.map(([a, g], n) => phrase(`hossam-${n + 1}`, a, g)) }] },
    {
      kind: "cloze",
      slug: "step-20",
      title: "Übung 6: Fragen zum Text",
      navLabel: "Übung 6 (Fragen)",
      instruction: { arabic: "١) فِي شَقَّةِ حُسَام … حُجُرَات ٢) أ – حُجْرَة … ب – حُجْرَة … ج – حُجْرَة … ٣) مَا لَوْنُ حَمَّامِ حُسَام؟ ٤) هَلْ حُجْرَةُ النَّوْمِ لَوْنُهَا أَسْوَدُ؟ ٥) مَا لَوْنُ حُجْرَةِ الْمَعِيشَةِ؟ ٦) هَلِ الشَّقَّةُ جَمِيلَةٌ؟", german: "Antworte mit dem Text." },
      items: [
        { id: "q1", lines: [{ label: "١", parts: ["فِي شَقَّةِ حُسَام ", gap(["٣"], ["٢", "٣", "٥"]), " حُجُرَاتٍ."] }] },
        { id: "q2", lines: [{ label: "٢", parts: ["حُجْرَةُ ", gap(["النَّوْمِ"], ["النَّوْمِ", "الْمَطْبَخِ"]), " – حُجْرَةُ ", gap(["السُّفْرَةِ"], ["السُّفْرَةِ", "الْحَمَّامِ"]), " – حُجْرَةُ ", gap(["الْمَعِيشَةِ"], ["الْمَعِيشَةِ", "الْمَكْتَبِ"])] }] },
        { id: "q3", lines: [{ label: "٣", parts: ["حَمَّامُ حُسَام لَوْنُهُ ", gap(["أَخْضَرُ."], ["أَخْضَرُ.", "أَبْيَضُ.", "أَحْمَرُ."])] }] },
        { id: "q4", lines: [{ label: "٤", parts: [gap(["لَا، حُجْرَةُ النَّوْمِ لَوْنُهَا أَبْيَضُ."], ["لَا، حُجْرَةُ النَّوْمِ لَوْنُهَا أَبْيَضُ.", "نَعَمْ، حُجْرَةُ النَّوْمِ لَوْنُهَا أَسْوَدُ.", "لَا، حُجْرَةُ النَّوْمِ لَوْنُهَا أَخْضَرُ."])] }] },
        { id: "q5", lines: [{ label: "٥", parts: ["حُجْرَةُ الْمَعِيشَةِ لَوْنُهَا ", gap(["أَحْمَرُ جَمِيلٌ."], ["أَحْمَرُ جَمِيلٌ.", "أَخْضَرُ.", "أَبْيَضُ."])] }] },
        { id: "q6", lines: [{ label: "٦", parts: [gap(["نَعَمْ، الشَّقَّةُ جَمِيلَةٌ وَوَاسِعَةٌ."], ["نَعَمْ، الشَّقَّةُ جَمِيلَةٌ وَوَاسِعَةٌ.", "لَا، الشَّقَّةُ لَيْسَتْ جَمِيلَةً."])] }] },
      ],
    },
    { kind: "match", slug: "step-21", title: "Übung 6: Sätze verbinden", navLabel: "Übung 6 (verbinden)", instruction: { arabic: "اِقْرَأْ مَرَّةً أُخْرَى وَصِلِ الْجُمَلَ لِتُكَوِّنَ جُمْلَةً صَحِيحَةً.", german: "Lies noch einmal und verbinde zu richtigen Sätzen.", note: "Übung 7 – deine eigene Wohnung beschreiben – schreibst du frei." }, match: HOSSAM_MATCH },
    { kind: "quiz", slug: "step-22", title: "Gespräch: Wohnungsanzeigen", navLabel: "Anzeigen", instruction: { arabic: "الْمُحَادَثَةُ: اِقْرَأْ هَذِهِ الْإِعْلَانَاتِ عَنِ الشُّقَقِ: اِخْتَرْ إِعْلَانًا لِشَقَّتِكَ ثُمَّ تَبَادَلِ الْمَعْلُومَاتِ مَعَ زَمِيلِكَ. ١ – كَمْ حُجْرَةً فِي شَقَّتِكَ؟ ٢ – مَا هِيَ؟ ٣ – مَا لَوْنُ الْحَمَّامِ؟ ٤ – مَا سِعْرُ شَقَّتِكَ؟", german: "Lies die drei Wohnungsanzeigen und beantworte die Fragen des Beispiel-Dialogs für jede Anzeige.", note: "Nützliche Wörter: غُرْفَة / غُرَف (Zimmer) – رَخِيص / رَخِيصَة (billig) – صَالَة (Diele) – لِلْإِيجَارِ (zu vermieten)." }, items: ADS_QUIZ },
    {
      kind: "table",
      slug: "step-23",
      title: "Merke: Zahl, Preis, Farbe",
      navLabel: "Merke",
      instruction: { arabic: "تَذَكَّرْ", german: "Merke: das Wichtigste von Unit 7 auf einen Blick." },
      tables: [
        { id: "count", titleArabic: "١) لِلْعَدَدِ:", title: "Zählen", columns: [{ arabic: "", german: "" }, { arabic: "", german: "" }], rows: [[{ arabic: "١ = جُنَيْه" }, { arabic: "كَلِمَةٌ مُفْرَدَةٌ", listen: false }], [{ arabic: "٢ = جُنَيْهَان" }, { arabic: "كَلِمَةٌ مُثَنًّى", listen: false }], [{ arabic: "٣ – ١٠ = جُنَيْهَات" }, { arabic: "كَلِمَةُ جَمْعٍ", listen: false }], [{ arabic: "١١ – ٩٩ = جُنَيْهًا" }, { arabic: "كَلِمَةٌ مُفْرَدَةٌ", listen: false }]] },
        { id: "price", titleArabic: "٢) لِلسُّؤَالِ عَنِ السِّعْرِ: مَا سِعْرُ هَذَا / هَذِهِ …؟", title: "Nach dem Preis fragen", columns: [{ arabic: "", german: "" }], rows: [[{ arabic: "مَا سِعْرُ هَذَا الْقَمِيصِ؟" }], [{ arabic: "مَا سِعْرُ هَذِهِ الْحَقِيبَةِ؟" }]] },
        {
          id: "colour",
          titleArabic: "٣) لِلسُّؤَالِ عَنِ الْأَلْوَانِ · ٤) تَأْنِيثُ وَتَذْكِيرُ اللَّوْنِ: هَذَا كِتَابٌ أَسْوَدُ – هَذِهِ مَكْتَبَةٌ سَوْدَاءُ.",
          title: "Nach der Farbe fragen",
          columns: [{ arabic: "السُّؤَالُ", german: "Frage" }, { arabic: "الْإِجَابَةُ", german: "Antwort" }],
          rows: [
            [{ arabic: "مَا لَوْنُ هَذَا الْحِذَاءِ؟" }, { arabic: "هَذَا الْحِذَاءُ لَوْنُهُ …", listen: false }],
            [{ arabic: "مَا لَوْنُ هَذِهِ الْحَقِيبَةِ؟" }, { arabic: "هَذِهِ الْحَقِيبَةُ لَوْنُهَا …", listen: false }],
            [{ arabic: "هَلْ هَذَا حِذَاءٌ أَحْمَرُ؟" }, { arabic: "لَا، هَذَا لَيْسَ حِذَاءً أَحْمَرَ، هَذَا حِذَاءٌ أَسْوَدُ." }],
            [{ arabic: "هَلْ هَذِهِ حَقِيبَةٌ حَمْرَاءُ؟" }, { arabic: "لَا، هَذِهِ لَيْسَتْ حَقِيبَةً حَمْرَاءَ، هَذِهِ حَقِيبَةٌ سَوْدَاءُ." }],
          ],
        },
      ],
      quiz: [
        { id: "eleven", prompt: "11 Pfund:", options: ["أَحَدَ عَشَرَ جُنَيْهَات", "أَحَدَ عَشَرَ جُنَيْهًا"], answer: 1 },
        { id: "shoe", prompt: "„Dieser Schuh ist …“", options: ["هَذَا الْحِذَاءُ لَوْنُهُ", "هَذَا الْحِذَاءُ لَوْنُهَا"], answer: 0 },
        { id: "black", prompt: "Ein schwarzes Regal (مَكْتَبَة):", options: ["مَكْتَبَةٌ أَسْوَدُ", "مَكْتَبَةٌ سَوْدَاءُ"], answer: 1 },
      ],
    },
  ],
};
