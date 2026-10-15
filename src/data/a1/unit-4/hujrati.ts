import type { A1Lesson, A1Word, ClozeItem, ClozePart, Dialogue, DialogueSpeaker, GapItem, PhraseItem } from "@/data/types";
import { transliterate } from "@/lib/arabic/transliterate";

import { unvocalised } from "../letter-lesson";
import { gaps2 } from "../lesson-2/letter-entry";
import { lines } from "../sabah-al-khayr";

// Unit 4 · تقديم (٢) "هَذِهِ حُجْرَتِي" (book pages 139–149, PDF 171–181):
//   (أ) the words of the room, (ب) the name under each picture, (٢) مَا هَذَا؟ /
//   مَا هَذِهِ؟, (٣) هَلْ هَذَا …؟; لاحظ القواعد; تدريب ١–٣; المحادثة "مِنْ أَيْنَ هَذِهِ
//   السَّاعَةُ؟" with تدريب ١ (dialogues), ٢ (the shop "كُلُّ شَيْءٍ لِلْبَيْتِ"), ٣
//   ("مَا الْهِجَاءُ؟"), ٤ (the desk), ٥ (class); تذكر.

const IMG = "/images/a1/unit-4";
const V = "/images/vocabulary";
const gap = (accept: string[], options: string[]): ClozePart => ({ accept, options });

/** (أ) the words in book order: [id, Arabic, German, picture, masculine]. */
const ROOM: Array<[id: string, arabic: string, german: string, src: string, alt: string, m: boolean]> = [
  ["sarir", "سَرِير", "Bett", `${IMG}/sarir.svg`, "Ein Bett", true],
  ["talib", "طَالِب", "Student", `${IMG}/talib.svg`, "Ein Student mit Rucksack", true],
  ["maktab", "مَكْتَب", "Schreibtisch", "/images/a1/mim/maktab.svg", "Ein Schreibtisch", true],
  ["nafidha", "نَافِذَة", "Fenster", `${IMG}/nafidha.svg`, "Ein Fenster mit Vorhang", false],
  ["bab", "بَاب", "Tür", `${V}/bab.svg`, "Eine Tür", true],
  ["kursi", "كُرْسِيّ", "Stuhl", "/images/a1/kaf/kursi.svg", "Ein Stuhl", true],
  ["kitab", "كِتَاب", "Buch", `${V}/kitab.svg`, "Ein Buch", true],
  ["qalam", "قَلَم", "Stift", `${V}/qalam.svg`, "Ein Stift", true],
  ["kurrasa", "كُرَّاسَة", "Heft", `${IMG}/kurrasa.svg`, "Ein aufgeschlagenes Heft", false],
  ["tawila", "طَاوِلَة", "Tisch", `${IMG}/tawila.svg`, "Ein Tisch", false],
  ["sitara", "سِتَارَة", "Vorhang", "/images/a1/sin/sitara.svg", "Ein Vorhang", false],
  ["haqiba", "حَقِيبَة", "Tasche", "/images/a1/hha/haqiba.svg", "Eine Tasche", false],
  ["salla", "سَلَّة", "Korb, Papierkorb", `${IMG}/salla.svg`, "Ein Papierkorb", false],
  ["maktaba", "مَكْتَبَة", "Bücherregal, Bibliothek", `${IMG}/maktaba.svg`, "Bücherregale voller Bücher", false],
  ["sajjada", "سَجَّادَة", "Teppich", `${IMG}/sajjada.svg`, "Ein Teppich", false],
  ["misbah", "مِصْبَاح", "Lampe", `${IMG}/misbah.svg`, "Eine Schreibtischlampe", true],
];
const room = new Map(ROOM.map((r) => [r[0], r]));
const word = (id: string): A1Word => {
  const [, arabic, german, src, alt] = room.get(id)!;
  return { id: `room-${id}`, arabic, german, transliteration: transliterate(arabic), image: { src, alt }, exercise: { id: `room-${id}`, target: unvocalised(arabic), modelText: arabic } };
};
const pic = (id: string) => ({ src: room.get(id)![3], alt: room.get(id)![4] });
const optionsFor = (id: string, n = 4) => {
  const all = ROOM.map((r) => r[0]);
  const at = all.indexOf(id);
  return [...new Set([id, ...[3, 7, 11].map((k) => all[(at + k) % all.length]!)])].slice(0, n).map((x) => room.get(x)![1]).sort((a, b) => a.localeCompare(b, "ar"));
};
const dem = (id: string) => (room.get(id)![5] ? "هَذَا" : "هَذِهِ");

/** (ب): the eight pictures of the book (right to left, top to bottom). */
const PICTURES_B = ["sajjada", "tawila", "sarir", "nafidha", "salla", "kurrasa", "misbah", "haqiba"];
/** (٢): مَا هَذَا؟ (right column) and مَا هَذِهِ؟ (left column), top to bottom. */
const MA_HADHA = ["sarir", "kitab", "qalam", "misbah", "talib", "kursi", "bab", "maktab"];
const MA_HADHIHI = ["maktaba", "tawila", "haqiba", "salla", "kurrasa", "nafidha", "sitara", "sajjada"];

const phrase = (id: string): PhraseItem => {
  const text = `${dem(id)} ${room.get(id)![1]}`;
  const pid = `hadha-${id}`;
  return { id: pid, arabic: text, transliteration: transliterate(text), german: `Das ist ${room.get(id)![5] ? "ein" : "eine"} ${room.get(id)![2]}.`, exercise: { id: pid, target: unvocalised(text), modelText: text } };
};

/** تدريب ٢: the letters as printed and the word (the first is the book's model). */
const ARRANGE: Array<[letters: string[], id: string, spoken: string, german: string]> = [
  [["ح", "م", "ص", "ب", "ا"], "misbah", "مِصْبَاح", "Lampe"],
  [["ة", "س", "ج", "د", "ا"], "sajjada", "سَجَّادَة", "Teppich"],
  [["ب", "ك", "ا", "ت"], "kitab", "كِتَاب", "Buch"],
  [["ة", "ل", "س"], "salla", "سَلَّة", "Korb"],
  [["ب", "ا", "ط", "ل"], "talib", "طَالِب", "Student"],
  [["ة", "ر", "ا", "ك", "س"], "kurrasa", "كُرَّاسَة", "Heft"],
  [["ي", "ة", "ا", "س", "ر"], "sayyara", "سَيَّارَة", "Auto"],
  [["ك", "ت", "م", "ب"], "maktab", "مَكْتَب", "Schreibtisch"],
];
const arrangeItem = ([letters, id, spoken, german]: (typeof ARRANGE)[number], n: number): GapItem => {
  const bare = unvocalised(spoken);
  const image = id === "sayyara" ? { src: `${V}/sayyara.svg`, alt: "Ein Auto" } : pic(id);
  return { id: `arrange-room-${n + 1}`, arabic: bare, spoken, german, image, pattern: "_".repeat(Array.from(bare).length), bare: true, choices: [...new Set(letters)] };
};

/** تدريب ٣: [picture, asked word] – the question with هَلْ, the answer with نَعَمْ / لَا. */
const YES_NO: Array<[shown: string, asked: string]> = [
  ["maktab", "kitab"], ["nafidha", "bab"], ["salla", "haqiba"],
  ["kurrasa", "tawila"], ["qalam", "qalam"], ["sajjada", "sajjada"], ["maktab", "bab"],
  ["sarir", "misbah"], ["kursi", "kursi"], ["bab", "kitab"], ["haqiba", "haqiba"],
  ["tawila", "kurrasa"], ["talib", "mudarris"], ["maktaba", "maktaba"], ["sitara", "salla"],
];
const askedWord = (id: string) => (id === "mudarris" ? { arabic: "مُدَرِّس", m: true } : { arabic: room.get(id)![1], m: room.get(id)![5] });
const yesNoItem = ([shown, asked]: [string, string], n: number): ClozeItem => {
  const a = askedWord(asked);
  const q = `${a.m ? "هَلْ هَذَا" : "هَلْ هَذِهِ"} ${a.arabic}؟`;
  const yes = shown === asked;
  const answer = `${yes ? "نَعَمْ" : "لَا"}، ${dem(shown)} ${room.get(shown)![1]}.`;
  const wrongDem = `${yes ? "نَعَمْ" : "لَا"}، ${dem(shown) === "هَذَا" ? "هَذِهِ" : "هَذَا"} ${room.get(shown)![1]}.`;
  const wrongYes = `${yes ? "لَا" : "نَعَمْ"}، ${dem(shown)} ${room.get(shown)![1]}.`;
  return {
    id: `yn${n + 1}`,
    image: pic(shown),
    lines: [
      { label: "١", parts: n < 3 ? [q] : [gap([a.m ? "هَلْ هَذَا" : "هَلْ هَذِهِ"], ["هَلْ هَذَا", "هَلْ هَذِهِ"]), ` ${a.arabic}؟`] },
      { label: "٢", parts: [gap([answer], [answer, wrongDem, wrongYes].sort((x, y) => x.localeCompare(y, "ar")))] },
    ],
  };
};

const sp = (id: string, name: string, voice: DialogueSpeaker["voice"], alt: string): DialogueSpeaker => ({ id, name, voice, avatar: { src: `${IMG}/${id}.svg`, alt } });

export const shopDialogue: Dialogue = {
  id: "shop",
  intro: "Im Laden „كُلُّ شَيْءٍ لِلْبَيْتِ“ (Alles für das Haus): ein Kunde fragt den Verkäufer.",
  speakers: [sp("zabun", "Der Kunde", "male-1", "Ein junger Mann, der Kunde"), sp("bai", "Der Verkäufer", "male-2", "Ein Verkäufer mit Schnurrbart hinter der Theke")],
  lines: lines([
    ["u4-sh-1", "zabun", "مِنْ أَيْنَ هَذِهِ الدَّرَّاجَةُ؟", "من أين هذه الدراجة", "Min ayna hādhihi d-darrāja?", "Woher kommt dieses Fahrrad?"],
    ["u4-sh-2", "bai", "هَذِهِ الدَّرَّاجَةُ مِنْ أَلْمَانْيَا، هَذِهِ دَرَّاجَةٌ أَلْمَانِيَّةٌ.", "هذه الدراجة من ألمانيا هذه دراجة ألمانية", "Hādhihi d-darrāja min Almānyā, hādhihi darrāja almāniyya.", "Dieses Fahrrad kommt aus Deutschland, es ist ein deutsches Fahrrad."],
  ]),
  question: { prompt: "مِنْ أَيْنَ الدَّرَّاجَةُ؟ – Woher kommt das Fahrrad?", options: ["Aus Deutschland.", "Aus Japan.", "Aus China."], answer: 0 },
};

export const spellingDialogue: Dialogue = {
  id: "spelling",
  intro: "Im Büro: Ein Kunde zeigt der Angestellten etwas und fragt, wie es auf Arabisch heißt.",
  speakers: [sp("amil", "Der Kunde", "male-1", "Ein Mann mit Hemd, er hält einen Hefter"), sp("muwazzafa", "Die Angestellte", "female-1", "Eine Angestellte mit Brille am Telefon")],
  lines: lines([
    ["u4-sp-1", "amil", "لَوْ سَمَحْتِ، مَا هَذِهِ؟ مَا الِاسْمُ بِالْعَرَبِيَّةِ؟", "لو سمحت ما هذه ما الاسم بالعربية", "Law samaḥti, mā hādhihi? Ma-smu bi-l-ʿarabiyya?", "Entschuldigung, was ist das? Wie heißt es auf Arabisch?"],
    ["u4-sp-2", "muwazzafa", "هَذِهِ دَبَّاسَةٌ.", "هذه دباسة", "Hādhihi dabbāsa.", "Das ist ein Hefter."],
    ["u4-sp-3", "amil", "مَا الْهِجَاءُ؟", "ما الهجاء", "Ma l-hijāʾ?", "Wie schreibt man das?"],
    ["u4-sp-4", "muwazzafa", "دَال – بَاء – أَلِف – سِين – تَاء مَرْبُوطَة.", "دال باء ألف سين تاء مربوطة", "Dāl – bāʾ – alif – sīn – tāʾ marbūṭa.", "D – B – A – S – T (marbuta). Im Buch steht nur: د ب ا س ة."],
    ["u4-sp-5", "amil", "شُكْرًا.", "شكرا", "Shukran.", "Danke."],
    ["u4-sp-6", "muwazzafa", "عَفْوًا.", "عفوا", "ʿAfwan.", "Bitte."],
  ]),
  question: { prompt: "عَمَّ يَسْأَلُ الْعَمِيلُ؟ – Wonach fragt der Kunde?", options: ["Nach dem Namen und der Schreibung (dem „Hefter“).", "Nach dem Preis.", "Nach dem Land."], answer: 0 },
};

/** المحادثة: the desk in the picture – each thing with its country tag. */
const DESK: Array<[thing: string, def: string, m: boolean, country: string, nisba: string, de: string]> = [
  ["سَاعَة", "السَّاعَة", false, "الْيَابَان", "يَابَانِيَّة", "Uhr"],
  ["سَجَّادَة", "السَّجَّادَة", false, "إِيرَان", "إِيرَانِيَّة", "Teppich"],
  ["مِحْفَظَة", "الْمِحْفَظَة", false, "إِيطَالْيَا", "إِيطَالِيَّة", "Brieftasche"],
  ["حَقِيبَة", "الْحَقِيبَة", false, "فَرَنْسَا", "فَرَنْسِيَّة", "Tasche"],
  ["خَاتَم", "الْخَاتَم", true, "الْمَكْسِيك", "مَكْسِيكِيّ", "Ring"],
  ["مِصْبَاح", "الْمِصْبَاح", true, "الصِّين", "صِينِيّ", "Lampe"],
  ["كُمْبِيُوتَر", "الْكُمْبِيُوتَر", true, "كُورِيَا", "كُورِيّ", "Computer"],
];
const from = (c: string) => `${c.startsWith("ال") ? "مِنَ" : "مِنْ"} ${c}`;
const deskLine = ([thing, def, m, country, nisba]: (typeof DESK)[number]) => `${m ? "هَذَا" : "هَذِهِ"} ${def} ${from(country)}. ${m ? "هَذَا" : "هَذِهِ"} ${thing} ${nisba}.`;
const NISBAS = DESK.map((d) => d[4]);
const deskItem = (d: (typeof DESK)[number], n: number, solved: boolean): ClozeItem => {
  const [thing, def, m, country, nisba, de] = d;
  const q = `مِنْ أَيْنَ ${m ? "هَذَا" : "هَذِهِ"} ${def}؟`;
  const others = NISBAS.filter((x) => x !== nisba && x.endsWith("ّ") === nisba.endsWith("ّ")).slice(0, 2);
  return {
    id: `desk-${n + 1}`,
    hint: de,
    image: n === 0 ? { src: `${IMG}/desk-countries.svg`, alt: "Ein Schreibtisch; an jedem Ding hängt ein Schild mit einem Land" } : undefined,
    lines: [
      { label: "أ", parts: [q] },
      { label: "ب", parts: solved ? [deskLine(d)] : [`${m ? "هَذَا" : "هَذِهِ"} ${def} ${from(country)}. ${m ? "هَذَا" : "هَذِهِ"} ${thing} `, gap([`${nisba}.`], [nisba, ...others].map((x) => `${x}.`).sort((a, b) => a.localeCompare(b, "ar")))] },
    ],
  };
};

/** تدريب ١ (after the conversation): the book's dialogues 2–4 with the things on the desk; the country is free. */
const COUNTRIES: Array<[country: string, f: string, m: string]> = [
  ["إِيرَان", "إِيرَانِيَّة", "إِيرَانِيّ"], ["سُوِيسْرَا", "سُوِيسْرِيَّة", "سُوِيسْرِيّ"], ["إِيطَالْيَا", "إِيطَالِيَّة", "إِيطَالِيّ"],
  ["فَرَنْسَا", "فَرَنْسِيَّة", "فَرَنْسِيّ"], ["الصِّين", "صِينِيَّة", "صِينِيّ"], ["الْيَابَان", "يَابَانِيَّة", "يَابَانِيّ"],
];
const freeCountry = (thing: string, m: boolean): ClozePart =>
  gap(COUNTRIES.map(([c, f, mm]) => `${from(c)}، ${m ? "هَذَا" : "هَذِهِ"} ${thing} ${m ? mm : f}.`), [COUNTRIES[0]!, COUNTRIES[3]!, COUNTRIES[4]!].map(([c, f, mm]) => `${from(c)}، ${m ? "هَذَا" : "هَذِهِ"} ${thing} ${m ? mm : f}.`).concat([`${from("فَرَنْسَا")}، ${m ? "هَذِهِ" : "هَذَا"} ${thing} ${m ? "فَرَنْسِيَّة" : "فَرَنْسِيّ"}.`]));
const DESK_DIALOGUES: ClozeItem[] = [
  { id: "d1", hint: "Beispiel im Buch", lines: [{ label: "أ", parts: ["هَلْ هَذِهِ سَلَّةٌ؟"] }, { label: "ب", parts: ["لَا، هَذِهِ سَاعَةٌ."] }, { label: "أ", parts: ["مِنْ أَيْنَ هَذِهِ السَّاعَةُ؟"] }, { label: "ب", parts: ["مِنْ سُوِيسْرَا، هَذِهِ سَاعَةٌ سُوِيسْرِيَّةٌ."] }] },
  { id: "d2", lines: [{ label: "أ", parts: ["هَلْ هَذِهِ طَاوِلَةٌ؟"] }, { label: "ب", parts: ["لَا، هَذِهِ سَجَّادَةٌ."] }, { label: "أ", parts: ["مِنْ أَيْنَ ", gap(["هَذِهِ السَّجَّادَةُ؟"], ["هَذِهِ السَّجَّادَةُ؟", "هَذَا السَّجَّادَةُ؟", "هَذِهِ الطَّاوِلَةُ؟"])] }, { label: "ب", parts: [freeCountry("سَجَّادَة", false)] }] },
  { id: "d3", lines: [{ label: "أ", parts: ["هَلْ هَذِهِ كُرَّاسَةٌ؟"] }, { label: "ب", parts: ["لَا، هَذِهِ ", gap(["مِحْفَظَةٌ."], ["مِحْفَظَةٌ.", "كُرَّاسَةٌ.", "مِصْبَاحٌ."])] }, { label: "أ", parts: ["مِنْ أَيْنَ ", gap(["هَذِهِ الْمِحْفَظَةُ؟"], ["هَذِهِ الْمِحْفَظَةُ؟", "هَذَا الْمِحْفَظَةُ؟", "هَذِهِ الْكُرَّاسَةُ؟"])] }, { label: "ب", parts: ["هَذِهِ الْمِحْفَظَةُ ", freeCountry("مِحْفَظَة", false)] }] },
  { id: "d4", lines: [{ label: "أ", parts: ["هَلْ هَذِهِ حَقِيبَةٌ؟"] }, { label: "ب", parts: ["نَعَمْ، ", gap(["هَذِهِ حَقِيبَةٌ."], ["هَذِهِ حَقِيبَةٌ.", "هَذَا حَقِيبَةٌ.", "هَذِهِ سَاعَةٌ."])] }, { label: "أ", parts: ["مِنْ ", gap(["أَيْنَ هَذِهِ الْحَقِيبَةُ؟"], ["أَيْنَ هَذِهِ الْحَقِيبَةُ؟", "أَيْنَ هَذَا الْحَقِيبَةُ؟"])] }, { label: "ب", parts: [freeCountry("حَقِيبَة", false)] }] },
  { id: "d5", lines: [{ label: "أ", parts: ["هَلْ هَذَا بَابٌ؟"] }, { label: "ب", parts: ["لَا، ", gap(["هَذَا مَكْتَبٌ."], ["هَذَا مَكْتَبٌ.", "هَذِهِ مَكْتَبٌ.", "هَذَا بَابٌ."])] }, { label: "أ", parts: ["مِنْ ", gap(["أَيْنَ هَذَا الْمَكْتَبُ؟"], ["أَيْنَ هَذَا الْمَكْتَبُ؟", "أَيْنَ هَذِهِ الْمَكْتَبُ؟"])] }, { label: "ب", parts: [freeCountry("مَكْتَب", true)] }] },
  { id: "d6", hint: "Frei: ein Ding aus dem Bild – hier das Telefon.", lines: [{ label: "أ", parts: ["هَلْ ", gap(["هَذَا تِلِيفُونٌ؟"], ["هَذَا تِلِيفُونٌ؟", "هَذِهِ تِلِيفُونٌ؟"])] }, { label: "ب", parts: ["لَا، ", gap(["هَذَا كُمْبِيُوتَرٌ."], ["هَذَا كُمْبِيُوتَرٌ.", "هَذِهِ كُمْبِيُوتَرٌ."])] }, { label: "أ", parts: ["مِنْ أَيْنَ هَذَا الْكُمْبِيُوتَرُ؟"] }, { label: "ب", parts: [freeCountry("كُمْبِيُوتَر", true)] }] },
  { id: "d7", hint: "Frei: ein Ding aus dem Bild – hier der Ring.", lines: [{ label: "أ", parts: ["هَلْ ", gap(["هَذَا خَاتَمٌ؟"], ["هَذَا خَاتَمٌ؟", "هَذِهِ خَاتَمٌ؟"])] }, { label: "ب", parts: ["نَعَمْ، ", gap(["هَذَا خَاتَمٌ."], ["هَذَا خَاتَمٌ.", "هَذِهِ خَاتَمٌ."])] }, { label: "أ", parts: ["مِنْ أَيْنَ هَذَا الْخَاتَمُ؟"] }, { label: "ب", parts: [freeCountry("خَاتَم", true)] }] },
];

/** تدريب ٢ (the shop): the other things in the picture, the country free. */
const SHOP: Array<[thing: string, def: string, m: boolean, de: string]> = [
  ["تِلِيفُون", "التِّلِيفُون", true, "Telefon"],
  ["تِلِفِزْيُون", "التِّلِفِزْيُون", true, "Fernseher"],
  ["دُولَاب", "الدُّولَاب", true, "Schrank"],
  ["لُعْبَة", "اللُّعْبَة", false, "Spielzeug"],
  ["صُورَة", "الصُّورَة", false, "Bild"],
  ["مِفْتَاح", "الْمِفْتَاح", true, "Schlüssel"],
];
const SHOP_ITEMS: ClozeItem[] = SHOP.map(([thing, def, m, de], n) => ({
  id: `shop-${n + 1}`,
  hint: de,
  lines: [
    { label: "زَبُون", parts: ["مِنْ أَيْنَ ", gap([`${m ? "هَذَا" : "هَذِهِ"} ${def}؟`], [`هَذَا ${def}؟`, `هَذِهِ ${def}؟`])] },
    { label: "بَائِع", parts: [`${m ? "هَذَا" : "هَذِهِ"} ${def} `, freeCountry(thing, m)] },
  ],
}));

/** تدريب ٤: the labelled desk – what each letter shows. */
const LABELS: Array<[letter: string, arabic: string, german: string]> = [
  ["أ", "صُورَة", "Bild (Foto)"], ["ب", "سَلَّة", "Papierkorb"], ["ج", "كُمْبِيُوتَر", "Computer"], ["د", "مَكْتَب", "Schreibtisch"], ["هـ", "نَافِذَة", "Fenster"],
  ["و", "تِلِيفُون", "Telefon"], ["ز", "دَبَّاسَة", "Hefter"], ["ح", "قَلَم", "Stift"], ["ط", "مِصْبَاح", "Lampe"], ["ي", "كُرْسِيّ", "Stuhl"],
];
const LABEL_OPTIONS = LABELS.map((l) => l[1]);

export const a1Hujrati: A1Lesson = {
  slug: "hadhihi-hujrati",
  kind: "phrase",
  label: "هَذِهِ حُجْرَتِي",
  labelGerman: "Das ist mein Zimmer",
  steps: [
    {
      kind: "words",
      slug: "step-1",
      title: "Die Wörter im Zimmer",
      navLabel: "Wörter",
      instruction: { arabic: "أ – اِسْمَعِ الْكَلِمَاتِ وَكَرِّرْ.", german: "Hör die Wörter und sprich sie nach. Im Buch stehen sie unter einem Bild des Zimmers.", note: "Nützliche Wörter: حُجْرَة – غُرْفَة (Zimmer)." },
      groups: [{ id: "room", title: "Im Zimmer", titleArabic: "هَذِهِ حُجْرَتِي", words: ROOM.map((r) => word(r[0])) }],
    },
    {
      kind: "cloze",
      slug: "step-2",
      title: "Der Name unter jedem Bild",
      navLabel: "Bilder",
      instruction: { arabic: "ب – اُكْتُبِ الِاسْمَ تَحْتَ كُلِّ صُورَةٍ.", german: "Welches Wort gehört unter das Bild?" },
      items: PICTURES_B.map((id) => ({ id, image: pic(id), lines: [{ label: "", parts: [gap([room.get(id)![1]], optionsFor(id))] }] })),
    },
    {
      kind: "phrases",
      slug: "step-3",
      title: "مَا هَذَا؟ – مَا هَذِهِ؟",
      navLabel: "Nachsprechen",
      instruction: { arabic: "٢) اِسْمَعْ مَرَّةً أُخْرَى وَكَرِّرْ بَعْدَ الْمُدَرِّسِ ثُمَّ اكْتُبِ الْكَلِمَةَ.", german: "Hör noch einmal und sprich nach: هَذَا für männliche Wörter, هَذِهِ für weibliche." },
      groups: [
        { id: "ma-hadha", title: "مَا هَذَا؟ – männlich", items: MA_HADHA.map(phrase) },
        { id: "ma-hadhihi", title: "مَا هَذِهِ؟ – weiblich", items: MA_HADHIHI.map(phrase) },
      ],
    },
    {
      kind: "cloze",
      slug: "step-4",
      title: "هَذَا … / هَذِهِ … schreiben",
      navLabel: "Schreiben",
      instruction: { arabic: "٢) … ثُمَّ اكْتُبِ الْكَلِمَةَ. ٣) هَلْ هَذَا سَرِيرٌ؟ لَا، هَذَا مَكْتَبٌ. هَلْ هَذَا مَكْتَبٌ؟ نَعَمْ، هَذَا مَكْتَبٌ.", german: "Schreib das Wort zum Bild: هَذَا سَرِير, هَذِهِ مَكْتَبَة … – die ersten beiden gibt das Buch vor." },
      items: [...MA_HADHA, ...MA_HADHIHI].map((id, n) => ({
        id: `w-${id}`,
        image: pic(id),
        lines: [{ label: dem(id) === "هَذَا" ? "مَا هَذَا؟" : "مَا هَذِهِ؟", parts: n === 0 || n === MA_HADHA.length ? [`${dem(id)} ${room.get(id)![1]}`] : [`${dem(id)} `, gap([room.get(id)![1]], optionsFor(id))] }],
      })),
    },
    {
      kind: "table",
      slug: "step-5",
      title: "Grammatik: مَا هَذَا؟ / مَا هَذِهِ؟",
      navLabel: "Grammatik",
      instruction: { arabic: "لَاحِظِ الْقَوَاعِدَ: ١ – لِلسُّؤَالِ عَنِ الْأَشْيَاءِ نَسْتَخْدِمُ أَدَاةَ الِاسْتِفْهَامِ «مَا».", german: "Achte auf die Regeln: Nach Dingen fragt man mit مَا – „مَا هَذَا؟“ für männliche, „مَا هَذِهِ؟“ für weibliche Wörter." },
      tables: [
        {
          id: "hadha",
          titleArabic: "٢ – «مَا هَذَا؟» لِلْمُذَكَّرِ · «مَا هَذِهِ؟» لِلْمُؤَنَّثِ",
          title: "Männlich und weiblich",
          columns: [{ arabic: "«مَا هَذَا؟» لِلْمُذَكَّرِ", german: "männlich" }, { arabic: "«مَا هَذِهِ؟» لِلْمُؤَنَّثِ", german: "weiblich" }],
          rows: [
            [{ arabic: "هَذَا قَلَمٌ.", german: "Das ist ein Stift." }, { arabic: "هَذِهِ طَاوِلَةٌ.", german: "Das ist ein Tisch." }],
            [{ arabic: "هَذَا كِتَابٌ.", german: "Das ist ein Buch." }, { arabic: "هَذِهِ حَقِيبَةٌ.", german: "Das ist eine Tasche." }],
            [{ arabic: "هَذَا مِصْبَاحٌ.", german: "Das ist eine Lampe." }, { arabic: "هَذِهِ مَكْتَبَةٌ.", german: "Das ist ein Bücherregal." }],
          ],
          note: "٣ – لَاحِظِ التَّاءَ الْمَرْبُوطَةَ (عَلَامَةُ التَّأْنِيثِ فِي الْأَسْمَاءِ الْمُؤَنَّثَةِ): Das ة am Ende zeigt ein weibliches Wort.",
        },
        {
          id: "hal",
          titleArabic: "٤ – السُّؤَالُ:",
          title: "Ja-/Nein-Frage",
          columns: [{ arabic: "السُّؤَالُ", german: "Frage" }, { arabic: "الْإِجَابَةُ", german: "Antwort" }],
          rows: [
            [{ arabic: "هَلْ هَذَا سَرِيرٌ؟", german: "Ist das ein Bett?" }, { arabic: "لَا، هَذَا مَكْتَبٌ.", german: "Nein, das ist ein Schreibtisch." }],
            [{ arabic: "هَلْ هَذَا مَكْتَبٌ؟", german: "Ist das ein Schreibtisch?" }, { arabic: "نَعَمْ، هَذَا مَكْتَبٌ.", german: "Ja, das ist ein Schreibtisch." }],
          ],
        },
      ],
      quiz: [
        { id: "salla", prompt: "سَلَّة ist weiblich. Du sagst:", options: ["هَذَا سَلَّة", "هَذِهِ سَلَّة"], answer: 1 },
        { id: "kursi", prompt: "كُرْسِيّ ist männlich. Du fragst:", options: ["مَا هَذَا؟", "مَا هَذِهِ؟"], answer: 0 },
        { id: "no", prompt: "„هَلْ هَذَا سَرِيرٌ؟“ – Es ist aber ein Schreibtisch:", options: ["نَعَمْ، هَذَا سَرِيرٌ.", "لَا، هَذَا مَكْتَبٌ.", "لَا، هَذِهِ مَكْتَبٌ."], answer: 1 },
      ],
    },
    {
      kind: "cloze",
      slug: "step-6",
      title: "Übung 1: هَذَا / هَذِهِ + Wort",
      navLabel: "Übung 1",
      instruction: { arabic: "تَدْرِيبٌ (١): اُكْتُبْ تَحْتَ كُلِّ صُورَةٍ هَذَا / هَذِهِ + الِاسْمَ الصَّحِيحَ.", german: "Übung 1: Schreib unter jedes Bild هَذَا oder هَذِهِ und das Wort. Beispiel im Buch: هَذِهِ حَقِيبَة." },
      items: ["haqiba", "qalam", "nafidha", "salla", "tawila", "sarir"].map((id, n) => ({
        id: `e1-${id}`,
        image: pic(id),
        lines: [{ label: "", parts: n === 0 ? [`${dem(id)} ${room.get(id)![1]}`] : [gap([dem(id)], ["هَذَا", "هَذِهِ"]), " ", gap([room.get(id)![1]], optionsFor(id))] }],
      })),
    },
    {
      kind: "gaps",
      slug: "step-7",
      title: "Übung 2: Buchstaben ordnen",
      navLabel: "Übung 2",
      instruction: { arabic: "تَدْرِيبٌ (٢): رَتِّبِ الْحُرُوفَ وَاكْتُبِ الِاسْمَ تَحْتَ كُلِّ صُورَةٍ.", german: "Übung 2: Ordne die Buchstaben und schreib das Wort zum Bild – von rechts nach links. Beispiel im Buch: هَذَا مِصْبَاح." },
      gaps: gaps2("picture", ["ب"], ARRANGE.map(arrangeItem), { clip: "shared/arrange_intro", text: "Ordne die Buchstaben: Leg sie von rechts nach links in die Felder, so dass das Wort zum Bild entsteht." }),
    },
    {
      kind: "cloze",
      slug: "step-8",
      title: "Übung 3: نَعَمْ oder لَا?",
      navLabel: "Übung 3",
      instruction: { arabic: "تَدْرِيبٌ (٣): ١ – اِسْأَلْ وَأَجِبْ بِـ «نَعَمْ» أَوْ «لَا» كَالْمِثَالِ. ٢ – اُكْتُبِ الْإِجَابَةَ تَحْتَ كُلِّ صُورَةٍ. صَحِّحْ مَعَ زَمِيلِكَ.", german: "Übung 3: Frag mit هَلْ und antworte mit نَعَمْ oder لَا – passend zum Bild.", note: "Im Buch heißt der Mann mit der Tasche vorher طَالِب; gefragt wird hier „هَلْ هَذَا مُدَرِّس؟“ (Lehrer)." },
      items: YES_NO.map(yesNoItem),
    },
    {
      kind: "cloze",
      slug: "step-9",
      title: "Gespräch: Woher kommt diese Uhr?",
      navLabel: "Woher?",
      instruction: { arabic: "الْمُحَادَثَةُ: مِنْ أَيْنَ هَذِهِ السَّاعَةُ؟ · اِقْرَأِ الْجُمَلَ عَنْ حُجْرَةِ حُسَيْن: أ – اُكْتُبِ الِاسْمَ فَوْقَ الصُّورَةِ. ب – أَكْمِلِ الْجُمَلَ النَّاقِصَةَ كَالْمِثَالِ.", german: "Husains Zimmer: An jedem Ding hängt ein Schild mit dem Land. Ergänze die Nationalität – die ersten beiden gibt das Buch vor.", note: "Nützliche Wörter: سَاعَة (Uhr) – حِزَام (Gürtel) – خَاتَم (Ring) – كُمْبِيُوتَر (Computer) – مِحْفَظَة (Brieftasche)." },
      items: DESK.map((d, n) => deskItem(d, n, n < 2)),
    },
    {
      kind: "table",
      slug: "step-10",
      title: "Merke: das Herkunftsland",
      navLabel: "Merke",
      instruction: { arabic: "لَاحِظْ: ١ – صِفَةُ الْبَلَدِ تَتْبَعُ الْمَوْصُوفَ (كِتَابٌ أَمْرِيكِيٌّ / دَرَّاجَةٌ أَلْمَانِيَّةٌ). ٢ – لِلسُّؤَالِ عَنْ أَمَاكِنِ الْأَشْيَاءِ: «مِنْ أَيْنَ هَذَا / هَذِهِ؟»", german: "Achte darauf: Die Nationalität richtet sich nach dem Ding – männlich oder weiblich." },
      tables: [
        {
          id: "follows",
          titleArabic: "صِفَةُ الْبَلَدِ تَتْبَعُ الْمَوْصُوفَ",
          title: "Die Herkunft passt sich an",
          columns: [{ arabic: "لِلْمُذَكَّرِ", german: "männlich" }, { arabic: "لِلْمُؤَنَّثِ", german: "weiblich" }],
          rows: [
            [{ arabic: "كِتَابٌ أَمْرِيكِيٌّ", german: "ein amerikanisches Buch" }, { arabic: "دَرَّاجَةٌ أَلْمَانِيَّةٌ", german: "ein deutsches Fahrrad" }],
            [{ arabic: "مِنْ أَيْنَ هَذَا الْكِتَابُ؟", german: "Woher kommt dieses Buch?" }, { arabic: "مِنْ أَيْنَ هَذِهِ الدَّرَّاجَةُ؟", german: "Woher kommt dieses Fahrrad?" }],
            [{ arabic: "هَذَا الْكِتَابُ مِنْ فَرَنْسَا. هَذَا الْكِتَابُ فَرَنْسِيٌّ.", german: "Dieses Buch kommt aus Frankreich. Es ist ein französisches Buch." }, { arabic: "هَذِهِ الدَّرَّاجَةُ مِنْ أَلْمَانْيَا. هَذِهِ دَرَّاجَةٌ أَلْمَانِيَّةٌ.", german: "Dieses Fahrrad kommt aus Deutschland. Es ist ein deutsches Fahrrad." }],
          ],
        },
      ],
      quiz: [
        { id: "watch", prompt: "سَاعَة aus Japan:", options: ["سَاعَةٌ يَابَانِيٌّ", "سَاعَةٌ يَابَانِيَّةٌ"], answer: 1 },
        { id: "lamp", prompt: "مِصْبَاح aus China:", options: ["مِصْبَاحٌ صِينِيٌّ", "مِصْبَاحٌ صِينِيَّةٌ"], answer: 0 },
      ],
    },
    {
      kind: "cloze",
      slug: "step-11",
      title: "Übung 1: Dialoge zum Schreibtisch",
      navLabel: "Übung 1 (Dialoge)",
      instruction: { arabic: "تَدْرِيبٌ (١): اِسْتَخْدِمِ الصُّورَةَ السَّابِقَةَ مَرَّةً أُخْرَى وَأَكْمِلْ هَذَا الْحِوَارَ عَنْ أَيِّ بَلَدٍ تَخْتَارُهُ. كَرِّرِ الْحِوَارَ مَعَ زَمِيلِكَ بَعْدَ كِتَابَتِهِ.", german: "Übung 1: Ergänze die Dialoge über die Dinge auf dem Schreibtisch. Das Land darfst du frei wählen – die Nationalität muss zum Ding passen.", note: "Dialog 6 und 7 lässt das Buch ganz offen; Alif nimmt dafür Dinge aus dem Bild." },
      items: DESK_DIALOGUES,
    },
    { kind: "dialogue", mode: "listen", slug: "step-12", title: "Übung 2: Im Laden – Anhören", navLabel: "Laden: Anhören", instruction: { arabic: "تَدْرِيبٌ (٢): كُلُّ شَيْءٍ لِلْبَيْتِ · هَذَا مَحَلُّ كُلِّ شَيْءٍ لِلْبَيْتِ. هَذَا بَائِعٌ. ١) هَذَا زَبُونٌ. عَمَّ يَسْأَلُ الزَّبُونُ؟ اِقْرَأِ الْمِثَالَ.", german: "Übung 2: Ein Laden „Alles für das Haus“. Hör zu: Wonach fragt der Kunde?", note: "Nützliche Wörter: دَرَّاجَة (Fahrrad) – لُعْبَة (Spielzeug) – مَحَلّ (Laden) – زَبُون (Kunde) – مُشْط (Kamm) – قِصَّة (Geschichte) – دُولَاب (Schrank) – بَائِع (Verkäufer) – كِبْرِيت (Streichhölzer) – مِفْتَاح (Schlüssel) – صُورَة (Bild) – تِلِفِزْيُون (Fernseher) – تِلِيفُون (Telefon)." }, dialogue: shopDialogue },
    {
      kind: "cloze",
      slug: "step-13",
      title: "Übung 2: Im Laden – fragen und antworten",
      navLabel: "Laden: Dialoge",
      instruction: { arabic: "ب) زَبُونٌ: مِنْ أَيْنَ …؟ بَائِعٌ: … ٢) أَكْمِلِ الْحِوَارَ بِكُلِّ الْأَشْيَاءِ الْمَوْجُودَةِ فِي الصُّورَةِ كِتَابَةً، ثُمَّ كَرِّرِ الْحِوَارَ مَعَ زَمِيلِكَ.", german: "Frag nach den anderen Dingen im Laden und antworte als Verkäufer – das Land wählst du frei." },
      items: SHOP_ITEMS,
    },
    { kind: "dialogue", mode: "listen", slug: "step-14", title: "Übung 3: Wie schreibt man das? – Anhören", navLabel: "Hören: Hefter", instruction: { arabic: "تَدْرِيبٌ (٣): مَا الْهِجَاءُ؟ ١) اِسْمَعِ الْحِوَارَ ثُمَّ قُلْ: عَمَّ يَسْأَلُ الْمُوَظَّفَ؟", german: "Übung 3: Hör die Unterhaltung: Wonach fragt der Kunde?", note: "Nützliche Wörter: دَبَّاسَة (Hefter) – سَمَّاعَة (Kopfhörer) – فَتَّاحَة (Brieföffner) – ظَرْف (Umschlag) – كَيْفَ تَقُولُ بِالْعَرَبِيَّةِ؟ (Wie sagt man auf Arabisch?) – مَا هُوَ الْهِجَاءُ؟ (Wie schreibt man es?) – مِمْحَاة (Radiergummi). Die Liste, nach welchen neun Dingen er auf der CD fragt, druckt das Buch nicht." }, dialogue: spellingDialogue },
    { kind: "dialogue", mode: "roleplay", slug: "step-15", title: "Übung 3: Rollenspiel", navLabel: "Rollenspiel", instruction: { arabic: "٢) اِقْرَأْ وَكَرِّرِ الْحِوَارَ مَعَ زَمِيلِكَ.", german: "Lies und wiederhole die Unterhaltung – du sprichst eine Rolle, Alif die andere." }, dialogue: spellingDialogue },
    {
      kind: "spell",
      slug: "step-16",
      title: "Übung 3: die Schreibung (الهجاء)",
      navLabel: "Buchstabieren",
      instruction: { arabic: "٣) أ – اُكْتُبْ قَائِمَةً بِالْأَشْيَاءِ الْمَوْجُودَةِ عَلَى الْمَكْتَبِ فِي الصُّورَةِ. ب – اِسْأَلْ زَمِيلَكَ عَنْ بَاقِي الْأَشْيَاءِ الَّتِي فِي الصُّورَةِ كَالْحِوَارِ.", german: "„مَا الْهِجَاءُ؟“ – schreib die Dinge vom Schreibtisch Buchstabe für Buchstabe, wie die Angestellte: د – ب – ا – س – ة.", note: "Teil (ج) – eine Liste der Dinge auf deinem eigenen Schreibtisch – und (٤) eigene Sätze machst du ohne Bewertung." },
      words: [
        ["dabbasa", "دَبَّاسَة", "Hefter"], ["sammaa", "سَمَّاعَة", "Kopfhörer"], ["fattaha", "فَتَّاحَة", "Brieföffner"], ["zarf", "ظَرْف", "Umschlag"], ["mimhah", "مِمْحَاة", "Radiergummi"],
        ["kumbiyutar", "كُمْبِيُوتَر", "Computer"], ["tilifun", "تِلِيفُون", "Telefon"], ["misbah", "مِصْبَاح", "Lampe"],
      ].map(([id, arabic, german]) => ({ id: `spell-${id}`, arabic: arabic!, german: german! })),
    },
    {
      kind: "cloze",
      slug: "step-17",
      title: "Übung 4: Was ist auf dem Schreibtisch?",
      navLabel: "Übung 4",
      instruction: { arabic: "تَدْرِيبٌ (٤): ١ – اِسْمَعْ وَاكْتُبِ الِاسْمَ. ٢ – اِخْتَرْ بَلَدًا لِكُلِّ صُورَةٍ، اِسْأَلْ زَمِيلَكَ كَالْمِثَالِ: «مَا هَذَا؟» «هَذَا تِلِيفُونٌ مِنَ الْيَابَانِ. هَذَا تِلِيفُونٌ يَابَانِيٌّ.»", german: "Übung 4: Welches Ding zeigt jeder Buchstabe im Bild? Das erste (أ – صُورَة) gibt das Buch vor.", note: "Übung 5 – die Dinge in deiner Klasse und ihr Herkunftsland – braucht deine Klasse." },
      items: LABELS.map(([letter, arabic, german], n) => ({
        id: `label-${n + 1}`,
        hint: german,
        image: n === 0 ? { src: `${IMG}/desk-labels.svg`, alt: "Ein Schreibtisch mit Buchstaben an den Dingen: أ bis ي" } : undefined,
        lines: [{ label: letter, parts: n === 0 ? [arabic] : [gap([arabic], [arabic, ...LABEL_OPTIONS.filter((o) => o !== arabic).slice(n % 3, (n % 3) + 2)])] }],
      })),
    },
    {
      kind: "table",
      slug: "step-18",
      title: "Merke: Hamza, مَا هَذَا؟, مِنْ أَيْنَ؟",
      navLabel: "Merke (Unit 4)",
      instruction: { arabic: "تَذَكَّرْ", german: "Merke: das Wichtigste von Unit 4 auf einen Blick." },
      tables: [
        {
          id: "hamza",
          titleArabic: "١) كِتَابَةُ الْهَمْزَةِ",
          title: "Die Hamza schreiben",
          columns: [{ arabic: "", german: "" }, { arabic: "", german: "Beispiele" }],
          rows: [
            [{ arabic: "أ – تُكْتَبُ الْهَمْزَةُ فِي أَوَّلِ الْكَلِمَةِ", german: "am Anfang", listen: false }, { arabic: "أَمْجَد – إِيمَان – أُسَامَة" }],
            [{ arabic: "ب – فِي مُنْتَصَفِ الْكَلِمَةِ", german: "in der Mitte", listen: false }, { arabic: "سَأَلَ – بِئْر – فُؤَاد" }],
            [{ arabic: "ج – فِي آخِرِ الْكَلِمَةِ: قَبْلَهَا أَلِفٌ وَفَتْحَةٌ", german: "am Ende nach a", listen: false }, { arabic: "قَرَأَ" }],
            [{ arabic: "قَبْلَهَا بَاءٌ وَكَسْرَةٌ", german: "nach i", listen: false }, { arabic: "مَجِيء" }],
            [{ arabic: "قَبْلَهَا «و» وَضَمَّةٌ", german: "nach u", listen: false }, { arabic: "تَكَافُؤ" }],
            [{ arabic: "قَبْلَهَا حَرْفٌ سَاكِنٌ", german: "nach Sukun", listen: false }, { arabic: "بَدْء" }],
            [{ arabic: "قَبْلَهَا «و» سَاكِنَةٌ", german: "nach و mit Sukun", listen: false }, { arabic: "ضَوْء" }],
            [{ arabic: "قَبْلَهَا أَلِفُ مَدٍّ", german: "nach langem ā", listen: false }, { arabic: "هَنَاء" }],
          ],
        },
        {
          id: "things",
          titleArabic: "٢) لِلسُّؤَالِ عَنِ الْأَشْيَاءِ",
          title: "Nach Dingen fragen",
          columns: [{ arabic: "السُّؤَالُ لِلْمُذَكَّرِ", german: "männlich" }, { arabic: "السُّؤَالُ لِلْمُؤَنَّثِ", german: "weiblich" }],
          rows: [
            [{ arabic: "مَا هَذَا؟", german: "Was ist das?" }, { arabic: "مَا هَذِهِ؟", german: "Was ist das?" }],
            [{ arabic: "هَلْ هَذَا كِتَابٌ؟ لَا، هَذَا قَلَمٌ (نَفْي).", german: "Nein (Verneinung)" }, { arabic: "نَعَمْ، هَذَا كِتَابٌ (إِيجَاب).", german: "Ja (Bejahung)" }],
          ],
        },
        {
          id: "made",
          titleArabic: "٣) لِلسُّؤَالِ عَنْ مَكَانِ الصُّنْعِ أَوْ بَلَدِ الصُّنْعِ لِلْأَشْيَاءِ",
          title: "Woher kommt es?",
          columns: [{ arabic: "لِلْمُذَكَّرِ", german: "männlich" }, { arabic: "لِلْمُؤَنَّثِ", german: "weiblich" }],
          rows: [
            [{ arabic: "مِنْ أَيْنَ هَذَا الْكِتَابُ؟", german: "Woher kommt dieses Buch?" }, { arabic: "مِنْ أَيْنَ هَذِهِ الدَّرَّاجَةُ؟", german: "Woher kommt dieses Fahrrad?" }],
            [{ arabic: "هَذَا الْكِتَابُ مِنْ فَرَنْسَا. هَذَا الْكِتَابُ فَرَنْسِيٌّ.", german: "Es kommt aus Frankreich." }, { arabic: "هَذِهِ الدَّرَّاجَةُ مِنْ أَلْمَانْيَا. هَذِهِ دَرَّاجَةٌ أَلْمَانِيَّةٌ.", german: "Es kommt aus Deutschland." }],
          ],
        },
      ],
      quiz: [
        { id: "end-u", prompt: "Hamza am Ende nach و mit Damma (تَكَافُ…):", options: ["تَكَافُأ", "تَكَافُؤ", "تَكَافُئ"], answer: 1 },
        { id: "q-f", prompt: "Nach einer Tasche fragen:", options: ["مَا هَذَا؟", "مَا هَذِهِ؟"], answer: 1 },
        { id: "made", prompt: "„Dieses Buch ist französisch“:", options: ["هَذَا الْكِتَابُ فَرَنْسِيٌّ.", "هَذِهِ الْكِتَابُ فَرَنْسِيَّةٌ."], answer: 0 },
      ],
    },
  ],
};

