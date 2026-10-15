import type { A1Lesson, A1Word, ClozePart, Dialogue, DialogueSpeaker, PhraseItem, QuizItem } from "@/data/types";
import { bigNumberWord, priceWords, toArabicDigits } from "@/lib/arabic/numbers";
import { transliterate } from "@/lib/arabic/transliterate";

import { unvocalised } from "../letter-lesson";
import { lines } from "../sabah-al-khayr";

// Unit 7 · تقديم (١) "مَا السِّعْرُ؟" (book pages 207–216, PDF 239–248): the
// currency, the shop dialogue, the price list, لاحظ القواعد, تدريب ١–٨ (٦:
// the mail-order ad of "مركز السلام التجاري", ٨: a cheque), المحادثة (prices in
// different countries – info gap).

const IMG = "/images/a1/unit-7";
const gap = (accept: string[], options: string[]): ClozePart => ({ accept, options });
const sorted = (xs: string[]) => [...new Set(xs)].sort((a, b) => a.localeCompare(b, "ar"));
const sp = (id: string, name: string, voice: DialogueSpeaker["voice"], alt: string): DialogueSpeaker => ({ id, name, voice, avatar: { src: `${IMG}/${id}.svg`, alt } });
const phrase = (id: string, arabic: string, german: string, spoken = arabic): PhraseItem => ({ id, arabic, transliteration: transliterate(spoken), german, exercise: { id, target: unvocalised(spoken).replace(/[.؟?!،,:=]/g, "").replace(/\s+/g, " ").trim(), modelText: spoken } });

const CURRENCY: Array<[arabic: string, german: string]> = [
  ["رُبْع جُنَيْه", "ein Viertelpfund"], ["نِصْف جُنَيْه", "ein halbes Pfund"], ["جُنَيْه", "ein Pfund"], ["جُنَيْهَان", "zwei Pfund"], ["ثَلَاثَة جُنَيْهَات", "drei Pfund"],
  ["عَشَرَة جُنَيْهَات", "zehn Pfund"], ["أَحَدَ عَشَرَ جُنَيْهًا", "elf Pfund"],
];
const BIG: Array<[number, string]> = [[100, "hundert"], [101, "hunderteins"], [200, "zweihundert"], [300, "dreihundert"], [1000, "tausend"], [2000, "zweitausend"], [3000, "dreitausend"], [10000, "zehntausend"], [11000, "elftausend"], [12000, "zwölftausend"], [13000, "dreizehntausend"], [20000, "zwanzigtausend"]];
const bigWord = (n: number) => (n === 11000 ? "أَحَدَ عَشَرَ أَلْفًا" : n === 12000 ? "اثْنَا عَشَرَ أَلْفًا" : n === 13000 ? "ثَلَاثَةَ عَشَرَ أَلْفًا" : n === 20000 ? "عِشْرُونَ أَلْفًا" : n === 10000 ? "عَشَرَةُ آلَافٍ" : bigNumberWord(n));

export const shopDialogue: Dialogue = {
  id: "shop-prices",
  intro: "Im Laden: Ein Kunde fragt nach den Preisen.",
  speakers: [sp("zabun", "Der Kunde", "male-2", "Ein junger Mann, der Kunde"), sp("bai", "Der Verkäufer", "male-1", "Ein Verkäufer mit Schnurrbart")],
  lines: lines([
    ["u7-s-1", "zabun", "لَوْ سَمَحْتَ، مَا سِعْرُ هَذِهِ الْبَدْلَةِ؟", "لو سمحت ما سعر هذه البدلة", "Law samaḥta, mā siʿru hādhihi l-badla?", "Entschuldigung, was kostet dieser Anzug?"],
    ["u7-s-2", "bai", "سِعْرُ هَذِهِ الْبَدْلَةِ أَلْفٌ وَخَمْسُمِائَةِ جُنَيْهٍ.", "سعر هذه البدلة ألف وخمسمائة جنيه", "Siʿru hādhihi l-badlati alfun wa-khamsumiʾati junayh.", "Dieser Anzug kostet 1500 Pfund."],
    ["u7-s-3", "zabun", "وَمَا سِعْرُ هَذَا الْقَلَمِ؟", "وما سعر هذا القلم", "Wa-mā siʿru hādhā l-qalam?", "Und was kostet dieser Stift?"],
    ["u7-s-4", "bai", "سِعْرُ هَذَا الْقَلَمِ جُنَيْهَانِ.", "سعر هذا القلم جنيهان", "Siʿru hādhā l-qalami junayhān.", "Dieser Stift kostet zwei Pfund."],
    ["u7-s-5", "zabun", "وَمَا سِعْرُ هَذِهِ اللُّعْبَةِ؟", "وما سعر هذه اللعبة", "Wa-mā siʿru hādhihi l-luʿba?", "Und was kostet dieses Spielzeug?"],
    ["u7-s-6", "bai", "سِعْرُ هَذِهِ اللُّعْبَةِ ثَلَاثَةُ جُنَيْهَاتٍ.", "سعر هذه اللعبة ثلاثة جنيهات", "Siʿru hādhihi l-luʿbati thalāthatu junayhāt.", "Dieses Spielzeug kostet drei Pfund."],
  ]),
  question: { prompt: "مَا سِعْرُ الْبَدْلَةِ؟", options: ["١٥٠٠ جُنَيْه", "١٧٠٠ جُنَيْه", "٢ جُنَيْه"], answer: 0 },
};

/** ج) the price list of the picture: [id, Arabic, German, price, picture]. */
const PRICES: Array<[id: string, arabic: string, german: string, price: number, src: string]> = [
  ["badla", "بَدْلَة", "Anzug", 1500, `${IMG}/badla.svg`],
  ["jaket", "جَاكِت", "Jacke", 1700, `${IMG}/jaket.svg`],
  ["qamis", "قَمِيص", "Hemd", 80, `${IMG}/qamis.svg`],
  ["ghassala", "غَسَّالَة", "Waschmaschine", 2700, "/images/vocabulary/ghassala.svg"],
  ["jilbab", "جِلْبَاب", "Galabija", 60, `${IMG}/jilbab.svg`],
  ["bantalun", "بَنْطَلُون", "Hose", 125, `${IMG}/bantalun.svg`],
  ["qalam", "قَلَم", "Stift", 2, "/images/vocabulary/qalam.svg"],
  ["luba", "لُعْبَة", "Spielzeug", 3, `${IMG}/luba.svg`],
  ["jawrab", "جَوْرَب", "Socke(n)", 25, `${IMG}/jawrab.svg`],
  ["fustan", "فُسْتَان", "Kleid", 150, `${IMG}/fustan.svg`],
  ["hidha", "حِذَاء", "Schuhe", 80, "/images/a1/hha/hidha.svg"],
];
const SUN = "تثدذرزسشصضطظلن";
/** The word with the article: الْقَمِيص, but الطَّابِعَة (a sun letter takes the Shadda). */
export const withArticle = (word: string) => (SUN.includes(word[0]!) ? `ال${word[0]}ّ${word.slice(1)}` : `الْ${word}`);
const unitFor = (n: number) => (n === 1 ? "جُنَيْه" : n === 2 ? "جُنَيْهَان" : n <= 10 ? "جُنَيْهَات" : n <= 99 ? "جُنَيْهًا" : "جُنَيْه");
const priceSay = (n: number) => (n === 2 ? "جُنَيْهَان" : `${bigNumberWord(n)} ${unitFor(n % 100 === 0 ? 100 : n % 100 || 100)}`);
const PRICE_WORDS: A1Word[] = PRICES.map(([id, arabic, german, price, src]) => ({
  id: `price-${id}`,
  arabic,
  german: `${german} – ${price} Pfund`,
  transliteration: transliterate(arabic),
  image: { src, alt: german },
  exercise: { id: `price-${id}`, target: unvocalised(arabic), modelText: arabic },
}));

/** تدريب ١: the six prices of the book. */
const READ_PRICES = ["١٥,٠٣٠", "٣٤٩", "١,٢٤٧", "٩٦,٠٧٥", "٢٧٨", "١٠,٠٠٠"];
const readPrice = (p: string) => `${priceWords(p, "")}`.trim();

/** تدريب ٢: the items and the two prices of the book; its key gives only the suit (٤٣٠) – Alif says the first price of each pair. */
const LISTEN: Array<[arabic: string, german: string, a: number, b: number, src: string]> = [
  ["غَسَّالَة", "Waschmaschine", 2516, 2560, "/images/vocabulary/ghassala.svg"],
  ["بَدْلَة", "Anzug", 430, 413, `${IMG}/badla.svg`],
  ["فُسْتَان", "Kleid", 190, 119, `${IMG}/fustan.svg`],
  ["قَمِيص", "Hemd", 17, 70, `${IMG}/qamis.svg`],
  ["كُمْبِيُوتَر", "Laptop", 3080, 3018, `${IMG}/kumbiyutar.svg`],
  ["طَابِعَة", "Drucker", 260, 216, `${IMG}/tabia.svg`],
  ["بَنْطَلُون", "Hose", 90, 29, `${IMG}/bantalun.svg`],
  ["جِلْبَاب", "Galabija", 165, 65, `${IMG}/jilbab.svg`],
];

export const sellerDialogue: Dialogue = {
  id: "seller-buyer",
  intro: "Im Kleidergeschäft: Ein Käufer fragt die Verkäuferin nach den Preisen.",
  speakers: [sp("baia", "Die Verkäuferin", "female-1", "Eine Verkäuferin mit Kopftuch"), sp("mushtari", "Der Käufer", "male-2", "Ein Mann im Anzug")],
  lines: lines([
    ["u7-b-1", "baia", "أَنَا فِي الْخِدْمَةِ.", "أنا في الخدمة", "Ana fi l-khidma.", "Ich stehe zu Diensten."],
    ["u7-b-2", "mushtari", "مَا سِعْرُ هَذَا الْقَمِيصِ لَوْ سَمَحْتِ؟", "ما سعر هذا القميص لو سمحت", "Mā siʿru hādhā l-qamīṣi law samaḥti?", "Was kostet dieses Hemd, bitte?"],
    ["u7-b-3", "baia", "سِعْرُ هَذَا الْقَمِيصِ مِائَةٌ وَعِشْرُونَ جُنَيْهًا.", "سعر هذا القميص مائة وعشرون جنيها", "Siʿru hādhā l-qamīṣi miʾatun wa-ʿishrūna junayhan.", "Dieses Hemd kostet 120 Pfund."],
    ["u7-b-4", "mushtari", "وَمَا سِعْرُ هَذَا الْجَوْرَبِ؟", "وما سعر هذا الجورب", "Wa-mā siʿru hādhā l-jawrab?", "Und was kosten diese Socken?"],
    ["u7-b-5", "baia", "سِعْرُ الْجَوْرَبِ خَمْسَةَ عَشَرَ جُنَيْهًا وَسِتُّونَ قِرْشًا.", "سعر الجورب خمسة عشر جنيها وستون قرشا", "Siʿru l-jawrabi khamsata ʿashara junayhan wa-sittūna qirshan.", "Die Socken kosten 15,60 Pfund."],
    ["u7-b-6", "mushtari", "أُرِيدُ ثَلَاثَةَ جَوَارِبَ مِنْ فَضْلِكِ.", "أريد ثلاثة جوارب من فضلك", "Urīdu thalāthata jawāriba min faḍliki.", "Ich möchte bitte drei Paar Socken."],
  ]),
  question: { prompt: "مَا سِعْرُ الْقَمِيصِ؟", options: ["١٢٠ جُنَيْهًا", "١٥,٦٠ جُنَيْهًا", "٦٨٠ جُنَيْهًا"], answer: 0 },
};

/** The price list on the shop window (تدريب ٣). */
const LIST: Array<[arabic: string, price: string]> = [["بَدْلَة", "٦٨٠,٠٠"], ["قَمِيص", "١٢٠,٠٠"], ["جَوْرَب", "١٥,٦٠"], ["حِذَاء", "١٧٠,٦٠"], ["جَاكِت", "٦٥٠,٠٠"], ["حَقِيبَة", "١٢٠,٠٠"], ["فُسْتَان", "٥٧٠,٢٠"]];

/** تدريب ٦: the ad of "مركز السلام التجاري": [Arabic, German, price as printed, spoken price, code, picture]. */
const AD: Array<[arabic: string, german: string, price: string, spoken: string, code: string, src: string]> = [
  ["بُلُوزَة", "Bluse", "١٤٥,٥٠٠", "١٤٥,٥٠", "٨٧٢٥", `${IMG}/blouza.svg`],
  ["جَاكِت", "Jacke", "٣٢٠", "٣٢٠", "٦٠٧٤١", `${IMG}/jaket.svg`],
  ["بَنْطَلُون", "Hose", "٩٨,٦٠", "٩٨,٦٠", "٢٩٣١", `${IMG}/bantalun.svg`],
  ["كَرَافَتَّة", "Krawatte", "٧٠,٣٠", "٧٠,٣٠", "٥٦٠٨", `${IMG}/krafatta.svg`],
  ["مِكْوَاة", "Bügeleisen", "١٤٠", "١٤٠", "٣٤١٢", `${IMG}/mikwa.svg`],
  ["تِلِيفُون", "Telefon", "٣٠٠", "٣٠٠", "٣٦١٦", `${IMG}/tilifun.svg`],
  ["كُمْبِيُوتَر", "Laptop", "٢٧٢٠,٥٠", "٢٧٢٠,٥٠", "٤٣٧٨", `${IMG}/kumbiyutar.svg`],
  ["كَاسِيت", "Kassettenradio", "٢٢٠", "٢٢٠", "٩١٥٠", `${IMG}/radyu.svg`],
  ["ثَلَّاجَة", "Kühlschrank", "٣٤٥٠", "٣٤٥٠", "٥٤١٢", "/images/a1/unit-3/thallaja.svg"],
  ["غَسَّالَة", "Waschmaschine", "٢٦٠٠", "٢٦٠٠", "٢١٩٨", "/images/vocabulary/ghassala.svg"],
  ["مِدْفَأَة", "Heizgerät", "٧٥", "٧٥", "٢٠١٢", `${IMG}/midfaa.svg`],
  ["مِرْوَحَة", "Ventilator", "١٣٥", "١٣٥", "١٠٤٥", `${IMG}/marwaha.svg`],
];
const AD_PRICES = AD.map((a) => a[2]);
const AD_CODES = AD.map((a) => a[4]);

/** المحادثة: what student (أ) is missing – the answers are in student (ب)'s table. */
const CURRENCY_OF: Record<string, string> = { "السُّعُودِيَّة": "رِيَالًا", "دُبَي": "دِرْهَمًا", "مِصْر": "جُنَيْهًا", "الْيَابَان": "يِنًّا", "أَلْمَانْيَا": "يُورُو", "أَمْرِيكَا": "دُولَارًا", "الصِّين": "يُوَانًا", "فَرَنْسَا": "يُورُو" };
const COUNTRY_GAP: Array<[item: string, country: string, price: number, wrong: number]> = [
  ["التِّلِفِزْيُون", "السُّعُودِيَّة", 796, 769], ["التِّلِفِزْيُون", "الْيَابَان", 1000, 100], ["التِّلِفِزْيُون", "الصِّين", 340, 430],
  ["الْكُمْبِيُوتَر", "السُّعُودِيَّة", 620, 260], ["الْكُمْبِيُوتَر", "دُبَي", 1200, 2100], ["الْكُمْبِيُوتَر", "مِصْر", 4500, 5400], ["الْكُمْبِيُوتَر", "أَلْمَانْيَا", 1200, 1020], ["الْكُمْبِيُوتَر", "فَرَنْسَا", 2020, 2200],
  ["الثَّلَّاجَة", "الْيَابَان", 1520, 1250], ["الثَّلَّاجَة", "أَمْرِيكَا", 600, 6000], ["الثَّلَّاجَة", "الصِّين", 1450, 1540],
  ["الْمَحْمُول", "السُّعُودِيَّة", 340, 430], ["الْمَحْمُول", "مِصْر", 2500, 2050], ["الْمَحْمُول", "أَلْمَانْيَا", 320, 230], ["الْمَحْمُول", "أَمْرِيكَا", 520, 250],
];

export const a1MaAsSir: A1Lesson = {
  slug: "ma-as-sir",
  kind: "phrase",
  label: "مَا السِّعْرُ؟",
  labelGerman: "Was kostet das?",
  steps: [
    {
      kind: "phrases",
      slug: "step-1",
      title: "Die Währung und große Zahlen",
      navLabel: "Währung",
      instruction: { arabic: "تَقْدِيمٌ (١): مَا السِّعْرُ؟ أ) كَرِّرْ بَعْدَ الْمُدَرِّسِ وَادْرُسِ الْعُمْلَةَ.", german: "Sprich nach und lerne die Währung: das ägyptische Pfund (جُنَيْه) – und die großen Zahlen." },
      groups: [
        { id: "currency", title: "الْعُمْلَةُ", items: CURRENCY.map(([a, g], n) => phrase(`cur-${n + 1}`, a, g)) },
        { id: "big", title: "١٠٠ – ٢٠٠٠٠", items: BIG.map(([n, g]) => phrase(`big-${n}`, `${toArabicDigits(n)} – ${bigWord(n)}`, g, bigWord(n))) },
      ],
    },
    { kind: "dialogue", mode: "listen", slug: "step-2", title: "Anhören: Im Laden", navLabel: "Anhören", instruction: { arabic: "ب) اِسْمَعِ الْحِوَارَ وَاقْرَأِ السِّعْرَ.", german: "Hör die Unterhaltung und lies die Preise." }, dialogue: shopDialogue },
    { kind: "dialogue", mode: "repeat", slug: "step-3", title: "Nachsprechen", navLabel: "Nachsprechen", instruction: { arabic: "ب) اِسْمَعِ الْحِوَارَ وَاقْرَأِ السِّعْرَ.", german: "Sprich jede Zeile nach." }, dialogue: shopDialogue },
    {
      kind: "words",
      slug: "step-4",
      title: "Die Preisliste",
      navLabel: "Preise",
      instruction: { arabic: "ج) اِقْرَأْ بَاقِيَ الْأَسْعَارِ مَعَ الْمُدَرِّسِ وَكَرِّرِ الْحِوَارَ.", german: "Die Dinge im Laden mit ihren Preisen. Sprich die Wörter nach – im nächsten Schritt sagst du die Preise." },
      groups: [{ id: "prices", title: "الْأَسْعَارُ", words: PRICE_WORDS }],
    },
    {
      kind: "phrases",
      slug: "step-5",
      title: "Was kostet …?",
      navLabel: "Preise sagen",
      instruction: { arabic: "ج) اِقْرَأْ بَاقِيَ الْأَسْعَارِ مَعَ الْمُدَرِّسِ وَكَرِّرِ الْحِوَارَ.", german: "Sag die Preise der Liste: سِعْرُ … = …" },
      groups: [{ id: "say", title: "سِعْرُ …", items: PRICES.map(([id, arabic, german, price]) => phrase(`say-${id}`, `سِعْرُ ${withArticle(arabic)} = ${toArabicDigits(price)} جُنَيْه`, `${german}: ${price} Pfund`, `سِعْرُ ${withArticle(arabic)} ${priceSay(price)}`)) }],
    },
    {
      kind: "table",
      slug: "step-6",
      title: "Grammatik: Pfund, Preis, Zählen",
      navLabel: "Grammatik",
      instruction: { arabic: "لَاحِظِ الْقَوَاعِدَ: ١) الْعُمْلَةُ ٢) لِلسُّؤَالِ عَنِ السِّعْرِ ٣) لِلْعَدَدِ", german: "Achte auf die Regeln: 1 جُنَيْه, 2 جُنَيْهَان, 3–10 + Mehrzahl (جُنَيْهَات), 11–99 + Einzahl mit ‑an (جُنَيْهًا)." },
      tables: [
        {
          id: "currency",
          titleArabic: "١) الْعُمْلَةُ الْمِصْرِيَّةُ – عُمْلَاتٌ عَرَبِيَّةٌ",
          title: "Ägyptische und andere arabische Währungen",
          columns: [{ arabic: "الرَّقْمُ", german: "Zahl" }, { arabic: "الْعُمْلَةُ الْمِصْرِيَّةُ", german: "ägyptisch" }, { arabic: "عُمْلَاتٌ عَرَبِيَّةٌ", german: "andere" }],
          rows: [
            [{ arabic: "١", listen: false }, { arabic: "جُنَيْه", german: "Einzahl" }, { arabic: "رِيَال / دِينَار / دِرْهَم / لِيرَة" }],
            [{ arabic: "٢", listen: false }, { arabic: "جُنَيْهَان", german: "Zweizahl" }, { arabic: "رِيَالَان / دِينَارَان / دِرْهَمَان / لِيرَتَان" }],
            [{ arabic: "٣", listen: false }, { arabic: "ثَلَاثَة جُنَيْهَات", german: "Mehrzahl" }, { arabic: "ثَلَاثَة رِيَالَات / دِينَارَات / دَرَاهِم / ثَلَاث لِيرَات" }],
            [{ arabic: "٤", listen: false }, { arabic: "أَرْبَعَة جُنَيْهَات" }, { arabic: "", listen: false }],
            [{ arabic: "١٠", listen: false }, { arabic: "عَشَرَة جُنَيْهَات" }, { arabic: "", listen: false }],
            [{ arabic: "١١", listen: false }, { arabic: "أَحَدَ عَشَرَ جُنَيْهًا", german: "Einzahl" }, { arabic: "رِيَالًا / دِينَارًا / لِيرَةً" }],
            [{ arabic: "١٢", listen: false }, { arabic: "اثْنَا عَشَرَ جُنَيْهًا" }, { arabic: "", listen: false }],
            [{ arabic: "١٣", listen: false }, { arabic: "ثَلَاثَةَ عَشَرَ جُنَيْهًا" }, { arabic: "", listen: false }],
            [{ arabic: "٢٠", listen: false }, { arabic: "عِشْرُونَ جُنَيْهًا" }, { arabic: "", listen: false }],
          ],
        },
        { id: "price", titleArabic: "٢) لِلسُّؤَالِ عَنِ السِّعْرِ:", title: "Nach dem Preis fragen", columns: [{ arabic: "السُّؤَالُ", german: "Frage" }, { arabic: "الْإِجَابَةُ", german: "Antwort" }], rows: [[{ arabic: "مَا سِعْرُ هَذِهِ اللُّعْبَةِ؟" }, { arabic: "سِعْرُ هَذِهِ اللُّعْبَةِ …", listen: false }], [{ arabic: "مَا سِعْرُ هَذَا الْكِتَابِ؟" }, { arabic: "سِعْرُ هَذَا الْكِتَابِ …", listen: false }]] },
        {
          id: "count",
          titleArabic: "٣) لِلْعَدَدِ: مُفْرَد – مُثَنًّى – (كَلِمَة جَمْع) ٣–١٠ – مُفْرَد ١١–٩٩",
          title: "Zählen",
          columns: [{ arabic: "مُفْرَد", german: "1" }, { arabic: "مُثَنًّى", german: "2" }, { arabic: "٣ – ١٠", german: "Mehrzahl" }, { arabic: "١١ – ٩٩", german: "Einzahl" }],
          rows: [
            [{ arabic: "كِتَاب" }, { arabic: "كِتَابَان" }, { arabic: "ثَلَاثَةُ كُتُبٍ ← عَشَرَةُ كُتُبٍ" }, { arabic: "أَحَدَ عَشَرَ كِتَابًا ← تِسْعَةٌ وَتِسْعُونَ كِتَابًا" }],
            [{ arabic: "جُنَيْه" }, { arabic: "جُنَيْهَان" }, { arabic: "ثَلَاثَةُ جُنَيْهَاتٍ ← عَشَرَةُ جُنَيْهَاتٍ" }, { arabic: "أَحَدَ عَشَرَ جُنَيْهًا ← تِسْعَةٌ وَتِسْعُونَ جُنَيْهًا" }],
          ],
        },
      ],
      quiz: [
        { id: "two", prompt: "2 Pfund:", options: ["جُنَيْه", "جُنَيْهَان", "جُنَيْهَات"], answer: 1 },
        { id: "five", prompt: "5 Pfund:", options: ["خَمْسَة جُنَيْهَات", "خَمْسَة جُنَيْهًا", "خَمْسَة جُنَيْه"], answer: 0 },
        { id: "fifteen", prompt: "15 Bücher:", options: ["خَمْسَةَ عَشَرَ كُتُبًا", "خَمْسَةَ عَشَرَ كِتَابًا", "خَمْسَةَ عَشَرَ كِتَاب"], answer: 1 },
        { id: "riyal", prompt: "Die Währung Saudi-Arabiens:", options: ["رِيَال", "دِرْهَم", "جُنَيْه"], answer: 0 },
      ],
    },
    {
      kind: "phrases",
      slug: "step-7",
      title: "Übung 1: Preise lesen",
      navLabel: "Übung 1",
      instruction: { arabic: "التَّدْرِيبَاتُ · تَدْرِيبٌ (١): ١) اُنْطُقْ هَذِهِ الْأَسْعَارَ – اِسْمَعِ النُّطْقَ الصَّحِيحَ.", german: "Übung 1: Sprich die Preise aus – dann hör die richtige Aussprache.", note: "Das Komma trennt hier die Tausender: ١٥,٠٣٠ = 15 030. Teil 2 (mit dem Partner abwechselnd lesen) braucht einen Partner." },
      groups: [{ id: "read", title: "الْأَسْعَارُ", items: READ_PRICES.map((p, n) => phrase(`read-${n + 1}`, `${p} جُنَيْهًا`, `${p.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))} Pfund`, `${readPrice(p)} جُنَيْهًا`)) }],
    },
    {
      kind: "quiz",
      slug: "step-8",
      title: "Übung 2: Welchen Preis hörst du?",
      navLabel: "Übung 2",
      instruction: { arabic: "تَدْرِيبٌ (٢): ١) اِسْتَمِعْ إِلَى أَسْعَارِ مَحَلٍّ (لِكُلِّ بَيْتٍ) وَضَعْ (✓) عَلَى السِّعْرِ الَّذِي تَسْمَعُهُ.", german: "Übung 2: Hör den Preis und wähle ihn.", note: "Das Buch nennt als Lösung nur den Anzug (٤٣٠ جُنَيْهًا, im Beispiel von Teil 2). Für die anderen Dinge spricht Alif den ersten Preis." },
      items: LISTEN.map(([arabic, german, a, b, src], n) => {
        const options = [toArabicDigits(a), toArabicDigits(b)];
        return { id: `l${n + 1}`, arabic, german, image: { src, alt: german }, spoken: `سِعْرُ ${withArticle(arabic)} ${bigNumberWord(a)} جُنَيْهًا`, questions: [{ prompt: "Der Preis:", options, answer: 0 }] };
      }),
    },
    { kind: "dialogue", mode: "listen", slug: "step-9", title: "Übung 3: Im Kleidergeschäft", navLabel: "Übung 3 (hören)", instruction: { arabic: "تَدْرِيبٌ (٣): ١ – اِقْرَأْ هَذَا الْحِوَارَ وَكَرِّرْ مَعَ زَمِيلِكَ. ٢ – مَا سِعْرُ الْقَمِيصِ؟", german: "Übung 3: Lies und hör die Unterhaltung: Was kostet das Hemd?", note: "Nützliche Wörter: أُرِيدُ (ich möchte) – جَوْرَب / جَوَارِب – قَمِيص / قُمْصَان – بَدْلَة / بِدَل." }, dialogue: sellerDialogue },
    { kind: "dialogue", mode: "roleplay", slug: "step-10", title: "Übung 3: Rollenspiel", navLabel: "Übung 3 (Rolle)", instruction: { arabic: "١ – اِقْرَأْ هَذَا الْحِوَارَ وَكَرِّرْ مَعَ زَمِيلِكَ.", german: "Spiel die Unterhaltung: Verkäuferin oder Käufer." }, dialogue: sellerDialogue },
    {
      kind: "cloze",
      slug: "step-11",
      title: "Übung 3 (3): Lies die Preisliste",
      navLabel: "Übung 3 (Preise)",
      instruction: { arabic: "٣ – اِقْرَأِ الْأَسْعَارَ ثُمَّ أَجِبْ.", german: `Lies die Preisliste im Schaufenster: ${LIST.map(([a, p]) => `${a} ${p}`).join(" · ")}.` },
      items: [
        { id: "jawrab", lines: [{ label: "", parts: ["سِعْرُ الْجَوْرَبِ = ", gap(["١٥,٦٠"], ["١٥,٦٠", "١٢٠,٠٠", "٤٦,٨٠"])] }] },
        { id: "three", lines: [{ label: "", parts: ["سِعْرُ ٣ جَوَارِب = ", gap(["٤٦,٨٠"], ["٤٦,٨٠", "١٥,٦٠", "٤٥,٦٠"])] }] },
        { id: "badla", lines: [{ label: "", parts: ["سِعْرُ الْبَدْلَةِ = ", gap(["٦٨٠,٠٠"], ["٦٨٠,٠٠", "٦٥٠,٠٠", "٥٧٠,٢٠"])] }] },
        { id: "fustan", lines: [{ label: "", parts: ["سِعْرُ الْفُسْتَانِ = ", gap(["٥٧٠,٢٠"], ["٥٧٠,٢٠", "١٧٠,٦٠", "٦٨٠,٠٠"])] }] },
      ],
    },
    {
      kind: "cloze",
      slug: "step-12",
      title: "Übung 4: andere Kleider bestellen",
      navLabel: "Übung 4",
      instruction: { arabic: "تَدْرِيبٌ (٤): اُنْظُرْ إِلَى لَائِحَةِ الْأَسْعَارِ فِي تَدْرِيبِ (٣) ثُمَّ اطْلُبْ مِنْ زَمِيلِكَ مَلَابِسَ أُخْرَى كَالْحِوَارِ فِي التَّدْرِيبِ السَّابِقِ.", german: "Übung 4: Frag nach anderen Kleidern aus der Liste und bestelle – die Preise stehen in der Liste.", note: "Welches Ding du wählst, ist frei; hier sind es drei der Liste." },
      items: (
        [["الْحِذَاءِ", "١٧٠,٦٠", "حِذَاءً"], ["الْجَاكِتِ", "٦٥٠,٠٠", "جَاكِتًا"], ["الْحَقِيبَةِ", "١٢٠,٠٠", "حَقِيبَةً"]] as Array<[string, string, string]>
      ).map(([item, price, obj], n) => ({
        id: `o${n + 1}`,
        lines: [
          { label: "طَالِب (أ)", parts: ["مَا سِعْرُ ", gap([`${item}؟`], [`${item}؟`, "الْبَدْلَةِ؟", "الْقَمِيصِ؟"])] },
          { label: "طَالِب (ب)", parts: [`سِعْرُ ${item} `, gap([price], sorted([price, "١٥,٦٠", "٥٧٠,٢٠"]))] },
          { label: "طَالِب (أ)", parts: ["أُرِيدُ ", gap([obj], [obj, "جَوَارِب"]), " مِنْ فَضْلِكَ."] },
        ],
      })),
    },
    {
      kind: "quiz",
      slug: "step-13",
      title: "Übung 5: Rechne den Preis aus",
      navLabel: "Übung 5",
      instruction: { arabic: "تَدْرِيبٌ (٥): طَالِب (أ): اُطْلُبْ هَذِهِ الْمُشْتَرَيَاتِ – طَالِب (ب): اُحْسُبِ الثَّمَنَ.", german: "Übung 5: Bestellen und ausrechnen – mit den Preisen aus Übung 3 (Anzug 680, Hemd 120, Socken 15,60, Tasche 120).", note: "Der Besteller sagt: أُرِيدُ خَمْسَ بِدَلٍ وَأَرْبَعَةَ قُمْصَانٍ وَسِتَّةَ جَوَارِبَ." },
      items: [
        { id: "a", arabic: "أُرِيدُ ٥ بِدَل، ٤ قُمْصَان، ٦ جَوَارِب.", spoken: "أُرِيدُ خَمْسَ بِدَلٍ وَأَرْبَعَةَ قُمْصَانٍ وَسِتَّةَ جَوَارِبَ.", german: "5 Anzüge, 4 Hemden, 6 Paar Socken", questions: [{ prompt: "Der Preis:", options: ["٣٩٧٣,٦٠", "٣٨٨٠,٠٠", "١٣٧١,٦٠"], answer: 0 }] },
        { id: "b", arabic: "أُرِيدُ ٦ حَقَائِب، ١١ جَوْرَبًا، ٤ قُمْصَان.", spoken: "أُرِيدُ سِتَّ حَقَائِبَ وَأَحَدَ عَشَرَ جَوْرَبًا وَأَرْبَعَةَ قُمْصَانٍ.", german: "6 Taschen, 11 Paar Socken, 4 Hemden", questions: [{ prompt: "Der Preis:", options: ["٣٩٧٣,٦٠", "١٣٧١,٦٠", "١٢٠٠,٠٠"], answer: 1 }] },
      ],
    },
    {
      kind: "quiz",
      slug: "step-14",
      title: "Übung 6: Einkaufen per Post",
      navLabel: "Übung 6",
      instruction: { arabic: "تَدْرِيبٌ (٦): التَّبَضُّعُ بِالْبَرِيدِ · ١) اِقْرَأِ الْإِعْلَانَ مِنَ الْإِنْتَرْنِت عَنْ مَرْكَزِ السَّلَامِ التِّجَارِيِّ. ٢) تَبَادَلِ السُّؤَالَ مَعَ زَمِيلِكَ عَنِ الْأَسْعَارِ وَرَقْمِ الْكُودِ: مَا سِعْرُ الْبَنْطَلُونِ؟ مَا رَقْمُ الْكُودِ؟", german: "Übung 6: Lies die Anzeige des Kaufhauses „as-Salam“ (Kleidung, Elektrogeräte, Haushalt): Was kostet es? Wie ist die Bestellnummer?", note: "Nützliche Wörter: ثَلَّاجَة – غَسَّالَة – بَنْطَلُون – تِلِيفُون – كُمْبِيُوتَر – مِدْفَأَة (Heizgerät) – مِرْوَحَة (Ventilator) – بُلُوزَة (Bluse). Bei der Bluse druckt das Buch „١٤٥,٥٠٠“ (145,50 Pfund)." },
      items: AD.map(([arabic, german, price, spoken, code, src], n) => {
        const prices = sorted([price, AD_PRICES[(n + 4) % AD.length]!]);
        const codes = sorted([code, AD_CODES[(n + 7) % AD.length]!]);
        return {
          id: `ad-${n + 1}`,
          arabic: `مَا سِعْرُ ${withArticle(arabic)}؟ مَا رَقْمُ الْكُودِ؟`,
          spoken: `سِعْرُ ${withArticle(arabic)} ${priceWords(spoken)}. رَقْمُ الْكُودِ ${code.split("").map((d) => ["صِفْر", "وَاحِد", "اثْنَان", "ثَلَاثَة", "أَرْبَعَة", "خَمْسَة", "سِتَّة", "سَبْعَة", "ثَمَانِيَة", "تِسْعَة"]["٠١٢٣٤٥٦٧٨٩".indexOf(d)]).join(" ")}.`,
          german,
          image: { src, alt: german },
          questions: [
            { prompt: "السِّعْرُ:", options: prices, answer: prices.indexOf(price) },
            { prompt: "رَقْمُ الْكُودِ:", options: codes, answer: codes.indexOf(code) },
          ],
        } satisfies QuizItem;
      }),
    },
    {
      kind: "cloze",
      slug: "step-15",
      title: "Übung 7: die Einkaufsliste",
      navLabel: "Übung 7",
      instruction: { arabic: "تَدْرِيبٌ (٧): ١) اُكْتُبْ فِي الْقَائِمَةِ الْمُشْتَرَيَاتِ الْمَطْلُوبَةَ (اُكْتُبِ اثْنَيْنِ أَوْ أَكْثَرَ مِنْ كُلِّ صِنْفٍ مِنْ تَدْرِيبِ (٦)). ٢) طَالِب (أ) مُشْتَرٍ، طَالِب (ب) بَائِعٌ. مِثَال: لَوْ سَمَحْتَ أُرِيدُ ٤ بَنْطَلُونَات (أَرْبَعَة بَنْطَلُونَات) – رَقْمُ الْكُود …", german: "Übung 7: Bestelle wie im Beispiel – vier Hosen. Wie ist die Bestellnummer, und was kostet alles?", note: "Deine eigene Liste und das Rollenspiel mit dem Partner (Teil 3) sind frei; hier rechnest du das Beispiel aus." },
      items: [{
        id: "list",
        lines: [
          { label: "طَالِب (أ)", parts: ["لَوْ سَمَحْتَ أُرِيدُ ٤ بَنْطَلُونَات (", gap(["أَرْبَعَة بَنْطَلُونَات"], ["أَرْبَعَة بَنْطَلُونَات", "أَرْبَعَة بَنْطَلُونًا", "أَرْبَع بَنْطَلُون"]), ") – رَقْمُ الْكُودِ ", gap(["٢٩٣١"], ["٢٩٣١", "٥٦٠٨", "٨٧٢٥"])] },
          { label: "طَالِب (ب)", parts: ["السِّعْرُ: ", gap(["٣٩٤,٤٠"], ["٣٩٤,٤٠", "٩٨,٦٠", "٣٩٤,٦٠"])] },
        ],
      }],
    },
    {
      kind: "cloze",
      slug: "step-16",
      title: "Übung 8: ein Scheck",
      navLabel: "Übung 8",
      instruction: { arabic: "تَدْرِيبٌ (٨): اُكْتُبْ شِيكًا بِثَمَنِ أَيِّ مُشْتَرَيَاتٍ اخْتَرْتَهَا مِنْ تَدْرِيبِ (٧). مِثَال: «ثَلَاثُمِائَةٍ وَسِتَّةٌ وَأَرْبَعُونَ جُنَيْهًا فَقَطْ لَا غَيْرَ»", german: "Übung 8: Auf einem Scheck steht der Betrag in Worten. Schreib den Betrag für die vier Hosen aus Übung 7 (394,40 Pfund).", note: "Im Beispiel des Buchs: ٣٤٦ = ثَلَاثُمِائَةٍ وَسِتَّةٌ وَأَرْبَعُونَ جُنَيْهًا." },
      items: [
        { id: "example", hint: "Beispiel im Buch: ٣٤٦", lines: [{ label: "", parts: ["ثَلَاثُمِائَةٍ وَسِتَّةٌ وَأَرْبَعُونَ جُنَيْهًا فَقَطْ لَا غَيْرَ"] }] },
        { id: "cheque", hint: "٣٩٤,٤٠", lines: [{ label: "", parts: [gap(["ثَلَاثُمِائَةٍ وَأَرْبَعَةٌ وَتِسْعُونَ جُنَيْهًا وَأَرْبَعُونَ قِرْشًا"], ["ثَلَاثُمِائَةٍ وَأَرْبَعَةٌ وَتِسْعُونَ جُنَيْهًا وَأَرْبَعُونَ قِرْشًا", "ثَلَاثُمِائَةٍ وَتِسْعَةٌ وَأَرْبَعُونَ جُنَيْهًا وَأَرْبَعُونَ قِرْشًا", "أَرْبَعُمِائَةٍ وَأَرْبَعَةٌ وَتِسْعُونَ جُنَيْهًا"]), " فَقَطْ لَا غَيْرَ"] }] },
      ],
    },
    {
      kind: "quiz",
      slug: "step-17",
      title: "Gespräch: Preise in anderen Ländern",
      navLabel: "Gespräch",
      instruction: { arabic: "الْمُحَادَثَةُ: اِسْأَلْ عَنْ أَسْعَارِ هَذِهِ الْأَشْيَاءِ فِي الْبِلَادِ الْمُخْتَلِفَةِ. مِثَال: طَالِب (أ): مَا سِعْرُ التِّلِفِزْيُونِ فِي السُّعُودِيَّةِ؟ طَالِب (ب): سِعْرُ التِّلِفِزْيُونِ ٧٩٦ رِيَالًا (سَبْعُمِائَةٍ وَسِتَّةٌ وَتِسْعُونَ رِيَالًا).", german: "Du bist Student (أ): In deiner Tabelle fehlen Preise. Frag nach ihnen und hör die Antwort aus der Tabelle von Student (ب).", note: "Die Währungen: السعودية = ريال، دبي = درهم، مصر = جنيه، اليابان = ين، فرنسا وألمانيا = يورو، أمريكا = دولار، الصين = يوان." },
      items: COUNTRY_GAP.map(([item, country, price, wrong], n) => {
        const options = sorted([toArabicDigits(price), toArabicDigits(wrong)]);
        return { id: `c${n + 1}`, arabic: `مَا سِعْرُ ${item} فِي ${country}؟`, spoken: `سِعْرُ ${item} فِي ${country} ${bigNumberWord(price)} ${CURRENCY_OF[country]}.`, show: true, questions: [{ prompt: "Der Preis:", options, answer: options.indexOf(toArabicDigits(price)) }] };
      }),
    },
  ],
};
