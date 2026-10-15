import type { A1Lesson, A1Word, ClozeItem, ClozePart, Dialogue, DialogueSpeaker, MatchContent, PhraseItem } from "@/data/types";
import { transliterate } from "@/lib/arabic/transliterate";

import { unvocalised } from "../letter-lesson";
import { lines } from "../sabah-al-khayr";

// Unit 8 (book pages 225–245, PDF 257–277):
//   تقديم (١) "أَيْنَ الْحَقِيبَةُ؟" (pp. 226–236): the living room (9 questions),
//   negation, لاحظ القواعد, تدريب ١–٦ (٣: the department store, ٤: Nada's
//   kitchen, ٥: the airport, ٦: Salim's party), المحادثة (airport information).
//   تقديم (٢) "أَيْنَ الصَّيْدَلِيَّةُ؟" (pp. 237–245): places on the map,
//   directions, the tourist, لاحظ القواعد, تدريب ١–٥, المحادثة ١–٢, تذكر.

const IMG = "/images/a1/unit-8";
const gap = (accept: string[], options: string[]): ClozePart => ({ accept, options });
const sorted = (xs: string[]) => [...new Set(xs)].sort((a, b) => a.localeCompare(b, "ar"));
const sp = (id: string, name: string, voice: DialogueSpeaker["voice"], alt: string): DialogueSpeaker => ({ id, name, voice, avatar: { src: `${IMG}/${id}.svg`, alt } });
const phrase = (id: string, arabic: string, german: string): PhraseItem => ({ id, arabic, transliteration: transliterate(arabic), german, exercise: { id, target: unvocalised(arabic).replace(/[.؟?!،,:()–-]/g, " ").replace(/\s+/g, " ").trim(), modelText: arabic } });
const word = (id: string, arabic: string, german: string, src: string): A1Word => ({ id, arabic, german, transliteration: transliterate(arabic), image: { src, alt: german }, exercise: { id, target: unvocalised(arabic).replace(/[()]/g, "").replace(/\s+/g, " ").trim(), modelText: arabic } });

const PREPS = ["فَوْقَ", "تَحْتَ", "أَمَامَ", "خَلْفَ", "بَيْنَ", "فِي", "عَلَى", "مَعَ", "بِجَانِبِ"];
const prepGap = (accept: string[]) => gap(accept, sorted([...accept, ...PREPS.filter((p) => !accept.includes(p)).slice(0, 3)]));

/** (١) the nine questions about the living room; the prepositions read from the picture. */
const ROOM: Array<[thing: string, prep: string[], where: string, de: string]> = [
  ["الْحِذَاءُ", ["تَحْتَ"], "الْكُرْسِيِّ.", "die Schuhe – unter dem Sessel"],
  ["الْجَوْرَبُ", ["فَوْقَ", "عَلَى"], "الْكَنَبَةِ (الْأَرِيكَةِ).", "die Socken – auf dem Sofa"],
  ["الْقَمِيصُ", ["فَوْقَ", "عَلَى"], "التِّلِفِزْيُونِ.", "das Hemd – auf dem Fernseher"],
  ["الْبَنْطَلُونُ", ["تَحْتَ"], "التِّلِيفُونِ.", "die Hose – unter dem Telefon"],
  ["الْحَقِيبَةُ", ["خَلْفَ", "بِجَانِبِ"], "الْبَابِ.", "die Tasche – hinter der Tür"],
  ["الْمِحْفَظَةُ", ["أَمَامَ"], "التِّلِفِزْيُونِ.", "die Brieftasche – vor dem Fernseher"],
  ["النَّظَّارَةُ", ["بَيْنَ"], "التِّلِفِزْيُونِ وَالْمِصْبَاحِ.", "die Brille – zwischen Fernseher und Lampe"],
  ["الْمَفَاتِيحُ", ["أَمَامَ", "مَعَ"], "مُصْطَفَى.", "die Schlüssel – vor Mustafa"],
  ["الْجَرِيدَةُ", ["فِي"], "الْحَقِيبَةِ.", "die Zeitung – in der Tasche"],
];
const ROOM_ITEMS: ClozeItem[] = ROOM.map(([thing, prep, where, de], n) => ({
  id: `r${n + 1}`,
  hint: de.split(" – ")[0],
  image: n === 0 ? { src: `${IMG}/living-room.svg`, alt: "Ein Wohnzimmer: Ahmad liest Zeitung, Mustafa sucht auf dem Boden" } : undefined,
  lines: [{ label: "س", parts: [`أَيْنَ ${thing.replace(/ُ$/, "")}؟`] }, { label: "ج", parts: [`${thing} `, prepGap(prep), ` ${where}`] }],
}));

const PREP_WORDS: Array<[string, string]> = [["فَوْقَ", "über, auf"], ["تَحْتَ", "unter"], ["أَمَامَ", "vor"], ["خَلْفَ", "hinter"], ["بَيْنَ", "zwischen"], ["فِي", "in"], ["عَلَى", "auf"], ["مَعَ", "mit, bei"], ["بِجَانِبِ", "neben"]];

/** تدريب ٣: the department store (listening text, pp. 230–231). */
export const storeDialogue: Dialogue = {
  id: "store",
  intro: "Im Kaufhaus: Eine Kundin fragt den Verkäufer, wo die Abteilungen sind.",
  speakers: [sp("bai", "Der Verkäufer", "male-1", "Ein Verkäufer"), sp("zabuna", "Die Kundin", "female-1", "Eine Kundin mit Kopftuch")],
  lines: lines([
    ["u8-st-1", "bai", "أَنَا فِي الْخِدْمَةِ.", "أنا في الخدمة", "Ana fi l-khidma.", "Ich stehe zu Diensten."],
    ["u8-st-2", "zabuna", "لَوْ سَمَحْتَ، أَيْنَ قِسْمُ الْكَامِيرَاتِ؟", "لو سمحت أين قسم الكاميرات", "Law samaḥta, ayna qismu l-kāmīrāt?", "Entschuldigung, wo ist die Kamera-Abteilung?"],
    ["u8-st-3", "bai", "قِسْمُ الْكَامِيرَاتِ بِجَانِبِ الْخَزِينَةِ.", "قسم الكاميرات بجانب الخزينة", "Qismu l-kāmīrāti bi-jānibi l-khazīna.", "Die Kamera-Abteilung ist neben der Kasse."],
    ["u8-st-4", "zabuna", "وَأَيْنَ قِسْمُ الثَّلَّاجَاتِ؟ أَمَامَ الْمِصْعَدِ؟", "وأين قسم الثلاجات أمام المصعد", "Wa-ayna qismu th-thallājāt? Amāma l-miṣʿad?", "Und wo ist die Kühlschrank-Abteilung? Vor dem Aufzug?"],
    ["u8-st-5", "bai", "لَا، قِسْمُ الثَّلَّاجَاتِ لَيْسَ أَمَامَ الْمِصْعَدِ، قِسْمُ الثَّلَّاجَاتِ أَمَامَ حَمَّامِ السَّيِّدَاتِ.", "لا قسم الثلاجات ليس أمام المصعد قسم الثلاجات أمام حمام السيدات", "Lā, qismu th-thallājāti laysa amāma l-miṣʿad, qismu th-thallājāti amāma ḥammāmi s-sayyidāt.", "Nein, nicht vor dem Aufzug – vor der Damentoilette."],
    ["u8-st-6", "zabuna", "وَأَيْنَ قِسْمُ التِّلِفِزْيُونَاتِ؟", "وأين قسم التلفزيونات", "Wa-ayna qismu t-tilifizyūnāt?", "Und wo ist die Fernseh-Abteilung?"],
    ["u8-st-7", "bai", "قِسْمُ التِّلِفِزْيُونَاتِ خَلْفَ قِسْمِ الثَّلَّاجَاتِ.", "قسم التلفزيونات خلف قسم الثلاجات", "Qismu t-tilifizyūnāti khalfa qismi th-thallājāt.", "Die Fernseh-Abteilung ist hinter der Kühlschrank-Abteilung."],
    ["u8-st-8", "zabuna", "وَأَيْنَ قِسْمُ الْغَسَّالَاتِ؟", "وأين قسم الغسالات", "Wa-ayna qismu l-ghassālāt?", "Und wo ist die Waschmaschinen-Abteilung?"],
    ["u8-st-9", "bai", "قِسْمُ الْغَسَّالَاتِ بَيْنَ حَمَّامِ السَّيِّدَاتِ وَحَمَّامِ الرِّجَالِ.", "قسم الغسالات بين حمام السيدات وحمام الرجال", "Qismu l-ghassālāti bayna ḥammāmi s-sayyidāti wa-ḥammāmi r-rijāl.", "Zwischen der Damen- und der Herrentoilette."],
    ["u8-st-10", "zabuna", "وَأَيْنَ الْكَافِتِيرْيَا؟", "وأين الكافتيريا", "Wa-ayna l-kāfitīryā?", "Und wo ist die Cafeteria?"],
    ["u8-st-11", "bai", "الْكَافِتِيرْيَا خَلْفَ قِسْمِ الْكُمْبِيُوتَرَاتِ. أَيُّ خِدْمَةٍ أُخْرَى؟", "الكافتيريا خلف قسم الكمبيوترات أي خدمة أخرى", "Al-kāfitīryā khalfa qismi l-kumbiyūtarāt. Ayyu khidmatin ukhrā?", "Die Cafeteria ist hinter der Computer-Abteilung. Noch etwas?"],
    ["u8-st-12", "zabuna", "لَا، شُكْرًا. أَنَا أُرِيدُ حَمَّامَ السَّيِّدَاتِ.", "لا شكرا أنا أريد حمام السيدات", "Lā, shukran. Ana urīdu ḥammāma s-sayyidāt.", "Nein, danke. Ich suche die Damentoilette."],
  ]),
  question: { prompt: "أَيْنَ قِسْمُ الْكَامِيرَاتِ؟", options: ["بِجَانِبِ الْخَزِينَةِ", "أَمَامَ الْمِصْعَدِ", "خَلْفَ قِسْمِ الثَّلَّاجَاتِ"], answer: 0 },
};

/** تدريب ٤: the things in Nada's kitchen. */
const KITCHEN: Array<[q: string, thing: string, prep: string[], where: string]> = [
  ["أَيْنَ السِّكِّينُ يَا نَدَى؟", "السِّكِّينُ", ["فَوْقَ", "عَلَى"], "الطَّاوِلَةِ."],
  ["وَأَيْنَ فِنْجَانُ الشَّايِ؟", "فِنْجَانُ الشَّايِ", ["فِي"], "دُولَابِ الْمَطْبَخِ."],
  ["أَيْنَ الْخُبْزُ؟", "الْخُبْزُ", ["فَوْقَ", "عَلَى"], "الطَّبَقِ."],
  ["أَيْنَ سَلَّةُ الْمُهْمَلَاتِ؟", "سَلَّةُ الْمُهْمَلَاتِ", ["تَحْتَ", "بِجَانِبِ"], "الْكُرْسِيِّ."],
  ["أَيْنَ الْمِكْنَسَةُ؟", "الْمِكْنَسَةُ", ["خَلْفَ", "بِجَانِبِ"], "الْبَابِ."],
  ["أَيْنَ عُلْبَةُ اللَّبَنِ؟", "عُلْبَةُ اللَّبَنِ", ["فَوْقَ", "عَلَى"], "الطَّاوِلَةِ."],
  ["أَيْنَ الثَّلَّاجَةُ؟", "الثَّلَّاجَةُ", ["بِجَانِبِ"], "الْمَوْقِدِ."],
];

/** تدريب ٥: the airport places (pp. 232–233). */
const AIRPORT: Array<[string, string]> = [
  ["الْحَقَائِب", "Gepäck(ausgabe)"], ["الْجَمَارِك", "Zoll"], ["الْجَوَازَات", "Passkontrolle"], ["دَوْرَة مِيَاه", "Toiletten"], ["صَالَة وُصُول", "Ankunftshalle"], ["السُّوق الْحُرَّة", "Duty-free"],
  ["بَوَّابَة", "Gate"], ["صَالَة التَّرَانْزِيت", "Transithalle"], ["وَزْن الْحَقَائِب", "Gepäckwaage"], ["مَكْتَب الْأَمْن", "Sicherheitsbüro"], ["مَكْتَب السِّيَاحَة", "Touristenbüro"], ["اسْتِعْلَامَات الْمَطَار", "Flughafen-Information"],
];
/** The airport information board: name – where. */
export const BOARD: Array<[name: string, where: string]> = [
  ["صَالَةُ التَّرَانْزِيت", "الدَّوْرُ الثَّانِي بِجَانِبِ الْكَافِتِيرْيَا رَقْم (١)"],
  ["صَالَةُ السَّفَرِ", "الدَّوْرُ الْأَرْضِيُّ أَمَامَ الْجَوَازَاتِ"],
  ["صَالَةُ الْوُصُولِ", "أَمَامَ بَوَّابَةِ ١٤"],
  ["مَكْتَبُ السِّيَاحَةِ", "الدَّوْرُ الثَّالِثُ"],
  ["دَوْرَاتُ الْمِيَاهِ", "الدَّوْرُ الْأَوَّلُ وَالثَّانِي وَالثَّالِثُ"],
  ["الْحَقَائِبُ", "الدَّوْرُ الْأَرْضِيُّ خَلْفَ صَالَةِ الْوُصُولِ"],
  ["الْجَرَاجُ", "تَحْتَ الدَّوْرِ الْأَرْضِيِّ"],
  ["مَكْتَبُ الْأَمْنِ", "الدَّوْرُ الرَّابِعُ بِجَانِبِ الْكَافِتِيرْيَا رَقْم (٢)"],
  ["اسْتِعْلَامَاتُ الْمَطَارِ", "الدَّوْرُ الْأَرْضِيُّ وَالْأَوَّلُ أَمَامَ الْبَوَّابَاتِ"],
  ["وَزْنُ الْحَقَائِبِ", "الدَّوْرُ الْأَرْضِيُّ بَعْدَ الْجَوَازَاتِ وَصَالَةِ السَّفَرِ"],
  ["السُّوقُ الْحُرَّةُ", "الدَّوْرُ الثَّالِثُ أَمَامَ مَكْتَبِ السِّيَاحَةِ"],
];
const BOARD_WHERE = BOARD.map((b) => b[1]);

/** تدريب ٦: Salim's party (listening text p. 235). */
export const partyDialogue: Dialogue = {
  id: "party",
  intro: "Salims Geburtstagsfeier: Hamid, Salims Freund aus Libyen, fragt nach Salims Freunden.",
  speakers: [sp("hamid", "Hamid", "male-2", "Hamid, ein junger Mann"), sp("salim", "Salim", "male-1", "Salim, der Gastgeber")],
  lines: lines([
    ["u8-p-1", "hamid", "مَنْ بَيْنَ سَلْوَى وَعَبْلَة؟", "من بين سلوى وعبلة", "Man bayna Salwā wa-ʿAbla?", "Wer ist zwischen Salwa und Abla?"],
    ["u8-p-2", "salim", "بَيْنَ سَلْوَى وَعَبْلَة مَاجِد.", "بين سلوى وعبلة ماجد", "Bayna Salwā wa-ʿAbla Mājid.", "Zwischen Salwa und Abla ist Majid."],
    ["u8-p-3", "hamid", "وَمَنْ أَمَامَ سَمِيح؟", "ومن أمام سميح", "Wa-man amāma Samīḥ?", "Und wer ist vor Samih?"],
    ["u8-p-4", "salim", "مُهَاب أَمَامَ سَمِيح.", "مهاب أمام سميح", "Muhāb amāma Samīḥ.", "Muhab ist vor Samih."],
    ["u8-p-5", "hamid", "وَمَنْ فَوْقَ الْكُرْسِيِّ؟", "ومن فوق الكرسي", "Wa-man fawqa l-kursiyy?", "Und wer ist auf dem Stuhl?"],
    ["u8-p-6", "salim", "دُعَاء فَوْقَ الْكُرْسِيِّ.", "دعاء فوق الكرسي", "Duʿāʾ fawqa l-kursiyy.", "Duaa ist auf dem Stuhl."],
    ["u8-p-7", "hamid", "وَمَنْ خَلْفَ زِيَاد؟", "ومن خلف زياد", "Wa-man khalfa Ziyād?", "Und wer ist hinter Ziyad?"],
    ["u8-p-8", "salim", "هَادِيَة خَلْفَ زِيَاد – وَهَذِهِ شَيْمَاء عَلَى الْأَرِيكَةِ.", "هادية خلف زياد وهذه شيماء على الأريكة", "Hādiya khalfa Ziyād – wa-hādhihi Shaymāʾ ʿala l-arīka.", "Hadia ist hinter Ziyad – und das ist Schaimaa auf dem Sofa."],
  ]),
  question: { prompt: "مَنْ بَيْنَ سَلْوَى وَعَبْلَة؟", options: ["مَاجِد", "مُهَاب", "زِيَاد"], answer: 0 },
};
const PARTY_NAMES = ["مَاجِد", "مُهَاب", "دُعَاء", "هَادِيَة", "شَيْمَاء"];
const PARTY_PLACES = ["بَيْنَ سَلْوَى وَعَبْلَة", "أَمَامَ سَمِيح", "فَوْقَ الْكُرْسِيِّ", "خَلْفَ زِيَاد", "عَلَى الْأَرِيكَةِ"];

export const airportDialogue: Dialogue = {
  id: "airport-info",
  intro: "An der Flughafen-Information: Eine Reisende fragt nach dem Duty-free.",
  speakers: [sp("rakiba", "Die Reisende", "female-2", "Eine Reisende"), sp("muwazzaf", "Der Angestellte", "male-1", "Ein Angestellter in Uniform")],
  lines: lines([
    ["u8-a-1", "rakiba", "لَوْ سَمَحْتَ، أَيْنَ السُّوقُ الْحُرَّةُ؟", "لو سمحت أين السوق الحرة", "Law samaḥta, ayna s-sūqu l-ḥurra?", "Entschuldigung, wo ist der Duty-free?"],
    ["u8-a-2", "muwazzaf", "السُّوقُ الْحُرَّةُ فِي الدَّوْرِ الثَّالِثِ أَمَامَ مَكْتَبِ السِّيَاحَةِ.", "السوق الحرة في الدور الثالث أمام مكتب السياحة", "As-sūqu l-ḥurratu fi d-dawri th-thālith amāma maktabi s-siyāḥa.", "Im dritten Stock vor dem Touristenbüro."],
  ]),
  question: { prompt: "أَيْنَ السُّوقُ الْحُرَّةُ؟", options: ["فِي الدَّوْرِ الثَّالِثِ أَمَامَ مَكْتَبِ السِّيَاحَةِ", "فِي الدَّوْرِ الْأَرْضِيِّ", "أَمَامَ بَوَّابَةِ ١٤"], answer: 0 },
};

export const a1Ayna: A1Lesson = {
  slug: "ayna-al-haqiba",
  kind: "phrase",
  label: "أَيْنَ الْحَقِيبَةُ؟",
  labelGerman: "Wo ist die Tasche?",
  steps: [
    {
      kind: "phrases",
      slug: "step-1",
      title: "Wo? – die Präpositionen",
      navLabel: "Präpositionen",
      instruction: { arabic: "تَقْدِيمٌ (١): أَيْنَ الْحَقِيبَةُ؟ ١) اُنْظُرْ إِلَى الصُّورَةِ وَكَرِّرْ بَعْدَ الْمُدَرِّسِ.", german: "Hör zu und sprich nach: die Wörter, die sagen, wo etwas ist." },
      groups: [{ id: "preps", title: "أَمَام – خَلْف – فِي – مَعَ – بَيْنَ – بِجَانِب – عَلَى – فَوْق – تَحْت", items: PREP_WORDS.map(([a, g], n) => phrase(`prep-${n + 1}`, a, g)) }],
    },
    { kind: "cloze", slug: "step-2", title: "Wo ist …? – im Wohnzimmer", navLabel: "Wohnzimmer", instruction: { arabic: "١) اُنْظُرْ إِلَى الصُّورَةِ وَكَرِّرْ بَعْدَ الْمُدَرِّسِ. اُكْتُبْ أَمَاكِنَ الْأَشْيَاءِ.", german: "Schau auf das Bild: Mustafa sucht seine Sachen. Wo ist was? Ergänze die Präposition.", note: "Wo zwei Wörter zum Bild passen (auf / über, hinter / neben), ist beides richtig." }, items: ROOM_ITEMS },
    {
      kind: "phrases",
      slug: "step-3",
      title: "Nachsprechen: Wo ist …?",
      navLabel: "Nachsprechen",
      instruction: { arabic: "١) … وَكَرِّرْ بَعْدَ الْمُدَرِّسِ.", german: "Sprich die Fragen und Antworten nach." },
      groups: [{ id: "room", title: "أَيْنَ …؟", items: ROOM.map(([thing, prep, where, de], n) => phrase(`room-${n + 1}`, `${thing} ${prep[0]} ${where}`, de)) }],
    },
    {
      kind: "table",
      slug: "step-4",
      title: "Grammatik: nach dem Ort fragen",
      navLabel: "Grammatik",
      instruction: { arabic: "لَاحِظِ الْقَوَاعِدَ: لِلسُّؤَالِ عَنْ أَمَاكِنِ الْأَشْيَاءِ ١ – نَسْتَخْدِمُ أَدَاةَ الِاسْتِفْهَامِ أَيْنَ ٢ – لَاحِظِ التَّشْكِيلَ ٣ – لِلنَّفْيِ", german: "Achte auf die Regeln: أَيْنَ + Nomen mit الـ fragt nach dem Ort. Nach der Präposition (أَمَامَ, خَلْفَ …) endet das Nomen auf ‑i." },
      tables: [
        { id: "where", titleArabic: "١ – أَيْنَ الْـ … ؟ (أَيْنَ + اسْم)", title: "Wo ist …?", columns: [{ arabic: "لِلسُّؤَالِ", german: "Frage" }, { arabic: "لِلْإِجَابَةِ", german: "Antwort" }], rows: [[{ arabic: "أَيْنَ الْكِتَابُ؟" }, { arabic: "الْكِتَابُ عَلَى / فَوْقَ / تَحْتَ / أَمَامَ / خَلْفَ / فِي / مَعَ / بَيْنَ / بِجَانِبِ …", listen: false }]] },
        { id: "case", titleArabic: "٢ – لَاحِظِ التَّشْكِيلَ: أَمَامَ الْمَكْتَبَةِ / خَلْفَ الْبَابِ … ظَرْفُ الْمَكَانِ مَنْصُوبٌ بِالْفَتْحَةِ + الِاسْمُ بَعْدَهُ يَنْتَهِي بِالْكَسْرَةِ", title: "Die Endungen", columns: [{ arabic: "", german: "" }], rows: [[{ arabic: "أَمَامَ الْمَكْتَبَةِ" }], [{ arabic: "خَلْفَ الْبَابِ" }]] },
        { id: "neg", titleArabic: "٣ – لِلنَّفْيِ: لَيْسَ / لَيْسَتْ + فَوْقَ / تَحْتَ", title: "Verneinung", columns: [{ arabic: "السُّؤَالُ", german: "Frage" }, { arabic: "النَّفْيُ", german: "Verneinung" }], rows: [[{ arabic: "هَلِ الْحِذَاءُ فَوْقَ الْكُرْسِيِّ؟" }, { arabic: "لَا، الْحِذَاءُ لَيْسَ فَوْقَ الْكُرْسِيِّ، الْحِذَاءُ تَحْتَ الْكُرْسِيِّ." }], [{ arabic: "هَلِ الْكِتَابُ تَحْتَ الطَّاوِلَةِ؟" }, { arabic: "لَا، الْكِتَابُ لَيْسَ تَحْتَ الطَّاوِلَةِ، الْكِتَابُ فَوْقَ الطَّاوِلَةِ." }]] },
      ],
      quiz: [
        { id: "behind", prompt: "„hinter der Tür“", options: ["خَلْفَ الْبَابِ", "أَمَامَ الْبَابِ", "بَيْنَ الْبَابِ"], answer: 0 },
        { id: "case", prompt: "„vor der Bibliothek“", options: ["أَمَامَ الْمَكْتَبَةُ", "أَمَامَ الْمَكْتَبَةِ", "أَمَامُ الْمَكْتَبَةَ"], answer: 1 },
        { id: "neg", prompt: "„Die Tasche ist nicht auf dem Tisch.“", options: ["الْحَقِيبَةُ لَيْسَ فَوْقَ الطَّاوِلَةِ.", "الْحَقِيبَةُ لَيْسَتْ فَوْقَ الطَّاوِلَةِ."], answer: 1 },
      ],
    },
    {
      kind: "cloze",
      slug: "step-5",
      title: "Übung 1: Frage und Antwort zum Bild",
      navLabel: "Übung 1",
      instruction: { arabic: "التَّدْرِيبَاتُ · تَدْرِيبٌ (١): ١) اُكْتُبِ السُّؤَالَ وَالْإِجَابَةَ تَحْتَ كُلِّ صُورَةٍ: أ – أَيْنَ الْجَوَارِبُ؟ ب – الْجَوَارِبُ تَحْتَ السَّرِيرِ.", german: "Übung 1: Wo ist es? Schreib die Antwort zum Bild.", note: "Teil 2 (mit dem Partner wiederholen) braucht einen Partner. Übung 2 (Bilder ohne Text, Fragen an den Partner) braucht einen Partner." },
      items: [
        { id: "socks", hint: "Beispiel im Buch", image: { src: "/images/a1/unit-4/sarir.svg", alt: "Socken unter dem Bett" }, lines: [{ label: "أ", parts: ["أَيْنَ الْجَوَارِبُ؟"] }, { label: "ب", parts: ["الْجَوَارِبُ تَحْتَ السَّرِيرِ."] }] },
        { id: "jacket", image: { src: "/images/a1/kaf/kursi.svg", alt: "Eine Jacke auf einem Stuhl" }, lines: [{ label: "أ", parts: [gap(["أَيْنَ"], ["أَيْنَ", "مَنْ", "هَلْ"]), " الْجَاكِتَّةُ؟"] }, { label: "ب", parts: ["الْجَاكِتَّةُ ", prepGap(["فَوْقَ", "عَلَى"]), " الْكُرْسِيِّ."] }] },
        { id: "glasses", image: { src: "/images/a1/unit-7/tilifizyun.svg", alt: "Eine Brille auf dem Fernseher" }, lines: [{ label: "أ", parts: ["أَيْنَ ", gap(["النَّظَّارَةُ؟"], ["النَّظَّارَةُ؟", "الْجَوَارِبُ؟", "التِّلِفِزْيُونُ؟"])] }, { label: "ب", parts: ["النَّظَّارَةُ ", prepGap(["فَوْقَ", "عَلَى"]), " التِّلِفِزْيُونِ."] }] },
        { id: "nadim", image: { src: `${IMG}/three-men.svg`, alt: "Drei junge Männer, Nadim in der Mitte" }, lines: [{ label: "أ", parts: ["أَيْنَ نَدِيم؟"] }, { label: "ب", parts: ["نَدِيم ", prepGap(["بَيْنَ"]), " صَدِيقَيْهِ."] }] },
        { id: "hala", image: { src: "/images/a1/unit-7/hujrat-taam.svg", alt: "Hala im Esszimmer" }, lines: [{ label: "أ", parts: ["أَيْنَ هَالَة؟"] }, { label: "ب", parts: ["هَالَة ", prepGap(["فِي"]), " حُجْرَةِ السُّفْرَةِ."] }] },
        { id: "muhammad", image: { src: "/images/vocabulary/sayyara.svg", alt: "Muhammad neben dem Auto" }, lines: [{ label: "أ", parts: [gap(["أَيْنَ"], ["أَيْنَ", "مَا"]), " مُحَمَّد؟"] }, { label: "ب", parts: ["مُحَمَّد ", prepGap(["بِجَانِبِ"]), " السَّيَّارَةِ."] }] },
        { id: "fridge", image: { src: "/images/a1/unit-3/thallaja.svg", alt: "Ein Kühlschrank neben dem Herd" }, lines: [{ label: "أ", parts: ["أَيْنَ الثَّلَّاجَةُ؟"] }, { label: "ب", parts: ["الثَّلَّاجَةُ ", prepGap(["بِجَانِبِ"]), " الْمَوْقِدِ."] }] },
        { id: "sink", image: { src: "/images/a1/unit-7/hawd.svg", alt: "Ein Waschbecken hinter der Tür" }, lines: [{ label: "أ", parts: ["أَيْنَ الْحَوْضُ؟"] }, { label: "ب", parts: ["الْحَوْضُ ", prepGap(["خَلْفَ", "بِجَانِبِ"]), " الْبَابِ."] }] },
      ],
    },
    { kind: "dialogue", mode: "listen", slug: "step-6", title: "Übung 3: Im Kaufhaus", navLabel: "Übung 3 (hören)", instruction: { arabic: "تَدْرِيبٌ (٣): ١) اِسْتَمِعْ إِلَى الْحِوَارِ وَاكْتُبْ أَسْمَاءَ الْأَشْيَاءِ عَلَى الرَّسْمِ. اِسْتَخْدِمِ الْكَلِمَاتِ: كَامِيرَات – تِلِفِزْيُونَات – ثَلَّاجَات – كُمْبِيُوتَرَات – غَسَّالَات", german: "Übung 3: Hör die Unterhaltung im Kaufhaus.", note: "Nützliche Wörter: قِسْم (Abteilung) – سَلَالِم (Treppe) – مِصْعَد (Aufzug) – خَزِينَة (Kasse) – أُرِيدُ (ich möchte) – حَمَّامُ سَيِّدَاتٍ / رِجَالٍ – مَلَابِس." }, dialogue: storeDialogue },
    {
      kind: "quiz",
      slug: "step-7",
      title: "Übung 3: Wo ist welche Abteilung?",
      navLabel: "Übung 3 (Plan)",
      instruction: { arabic: "… وَاكْتُبْ أَسْمَاءَ الْأَشْيَاءِ عَلَى الرَّسْمِ.", german: "Wo ist welche Abteilung? Antworte mit dem Gespräch." },
      items: (
        [["قِسْمُ الْكَامِيرَاتِ", "بِجَانِبِ الْخَزِينَةِ"], ["قِسْمُ الثَّلَّاجَاتِ", "أَمَامَ حَمَّامِ السَّيِّدَاتِ"], ["قِسْمُ التِّلِفِزْيُونَاتِ", "خَلْفَ قِسْمِ الثَّلَّاجَاتِ"], ["قِسْمُ الْغَسَّالَاتِ", "بَيْنَ حَمَّامِ السَّيِّدَاتِ وَحَمَّامِ الرِّجَالِ"], ["الْكَافِتِيرْيَا", "خَلْفَ قِسْمِ الْكُمْبِيُوتَرَاتِ"]] as Array<[string, string]>
      ).map(([what, where], n, all) => {
        const options = sorted(all.map((a) => a[1]));
        return { id: `dept-${n + 1}`, arabic: `أَيْنَ ${what}؟`, questions: [{ prompt: "Wo?", options, answer: options.indexOf(where) }] };
      }),
    },
    { kind: "dialogue", mode: "roleplay", slug: "step-8", title: "Übung 3: Rollenspiel", navLabel: "Übung 3 (Rolle)", instruction: { arabic: "٢) تَبَادَلْ حِوَارًا مُمَاثِلًا مَعَ زَمِيلِكَ.", german: "Spiel die Unterhaltung: Verkäufer oder Kundin." }, dialogue: storeDialogue },
    {
      kind: "cloze",
      slug: "step-9",
      title: "Übung 4: In der Küche",
      navLabel: "Übung 4",
      instruction: { arabic: "تَدْرِيبٌ (٤): فِي الْمَطْبَخِ · هَذَا مَطْبَخُ نَدَى. مَطْبَخُهَا وَاسِعٌ وَجَمِيلٌ. هَذَا هِشَام زَوْجُ نَدَى. ١) اُكْتُبْ جُمَلًا لِأَسْئِلَةِ هِشَام عَنِ الْأَشْيَاءِ الَّتِي عَلَيْهَا أَرْقَامٌ فِي الْمَطْبَخِ.", german: "Übung 4: Hischam fragt seine Frau Nada, wo die Sachen in der Küche sind. Antworte mit dem Bild.", note: "Nützliche Wörter: سِكِّين (Messer) – فِنْجَان (Tasse) – مِنْشَفَة (Handtuch) – خُبْز (Brot) – طَبَق (Teller) – سَلَّةُ مُهْمَلَاتٍ (Mülleimer) – عُلْبَةُ لَبَنٍ (Milchpackung) – مِكْنَسَة (Besen) – زُجَاجَةُ مَاءٍ (Wasserflasche). Die ersten beiden Antworten stehen im Buch." },
      items: KITCHEN.map(([q, thing, prep, where], n) => ({ id: `k${n + 1}`, lines: [{ label: "طَالِب (أ)", parts: [q] }, { label: "طَالِب (ب)", parts: n < 2 ? [`${thing} ${prep[0]} ${where}`] : [`${thing} `, prepGap(prep), ` ${where}`] }] })),
    },
    {
      kind: "phrases",
      slug: "step-10",
      title: "Übung 5: Am Flughafen",
      navLabel: "Übung 5 (Orte)",
      instruction: { arabic: "تَدْرِيبٌ (٥): فِي الْمَطَارِ · ١) اِقْرَأْ أَسْمَاءَ هَذِهِ الْأَمَاكِنِ فِي الْمَطَارِ.", german: "Übung 5: Lies die Namen der Orte am Flughafen und sprich nach." },
      groups: [{ id: "airport", title: "فِي الْمَطَارِ", items: AIRPORT.map(([a, g], n) => phrase(`air-${n + 1}`, a, g)) }],
    },
    {
      kind: "quiz",
      slug: "step-11",
      title: "Übung 5 (2): die Hinweistafel",
      navLabel: "Übung 5 (Tafel)",
      instruction: { arabic: "٢) اِقْرَأْ لَوْحَةَ إِرْشَادَاتِ الْمَطَارِ.", german: "Lies die Hinweistafel des Flughafens: Wo ist …?" },
      items: BOARD.map(([name, where], n) => {
        const options = sorted([where, BOARD_WHERE[(n + 3) % BOARD.length]!, BOARD_WHERE[(n + 7) % BOARD.length]!]);
        return { id: `board-${n + 1}`, arabic: `أَيْنَ ${name}؟`, questions: [{ prompt: "Wo?", options, answer: options.indexOf(where) }] };
      }),
    },
    {
      kind: "cloze",
      slug: "step-12",
      title: "Übung 5 (3): eine Nachricht",
      navLabel: "Übung 5 (Nachricht)",
      instruction: { arabic: "٣) اُتْرُكْ رِسَالَةً لِصَدِيقِكَ فِي مَكْتَبِ الِاسْتِعْلَامَاتِ أَوْ رِسَالَةً تِلِيفُونِيَّةً عَنْ مَكَانِكَ كَالْمِثَالِ: عَزِيزِي خَالِد: أَنَا فِي السُّوقِ الْحُرَّةِ، بِالدَّوْرِ الثَّالِثِ بِجَانِبِ مَكْتَبِ السِّيَاحَةِ. الطَّائِرَةُ السَّاعَةَ ٩,١٠ بِالضَّبْطِ، بَوَّابَة رَقْم ٦١. لَا تَتَأَخَّرْ! وَلِيد", german: "Ergänze die Nachricht mit der Hinweistafel: Wo bist du?", note: "„لَا تَتَأَخَّرْ“ = Komm nicht zu spät! Ort und Uhrzeit wählst du frei; hier: die Transithalle." },
      items: [{
        id: "note",
        lines: [
          { label: "", parts: ["عَزِيزِي خَالِد:"] },
          { label: "", parts: ["أَنَا فِي صَالَةِ التَّرَانْزِيت، ", gap(["بِالدَّوْرِ الثَّانِي"], ["بِالدَّوْرِ الثَّانِي", "بِالدَّوْرِ الثَّالِثِ", "بِالدَّوْرِ الْأَرْضِيِّ"]), " ", gap(["بِجَانِبِ"], ["بِجَانِبِ", "تَحْتَ", "خَلْفَ"]), " الْكَافِتِيرْيَا رَقْم (١)."] },
          { label: "", parts: ["لَا تَتَأَخَّرْ! وَلِيد"] },
        ],
      }],
    },
    { kind: "dialogue", mode: "listen", slug: "step-13", title: "Übung 6: Salims Feier", navLabel: "Übung 6 (hören)", instruction: { arabic: "تَدْرِيبٌ (٦): هَذَا حَفْلُ عِيدِ مِيلَادِ سَالِم. حَمِيد صَدِيقُ سَالِم مِنْ لِيبْيَا، هُوَ يَسْأَلُ عَنْ أَصْدِقَاءِ سَالِم فِي الْحَفْلِ.", german: "Übung 6: Salims Geburtstagsfeier. Hamid fragt, wer wo ist. Hör zu.", note: "Nützliche Wörter: حَفْل (Feier) – عِيدُ مِيلَادٍ (Geburtstag) – يَسْأَلُ (er fragt). Der Hörtext steht im Buch auf S. 235." }, dialogue: partyDialogue },
    {
      kind: "quiz",
      slug: "step-14",
      title: "Übung 6: Wer ist wo?",
      navLabel: "Übung 6 (Tabelle)",
      instruction: { arabic: "١) اِسْمَعْ وَاكْتُبِ اسْمَ الشَّخْصِ. ٢) اِسْمَعْ وَاكْتُبْ فِي الْجَدْوَلِ مَكَانَ الْأَصْدِقَاءِ. مِثَال: ١ مَاجِد – بَيْنَ سَلْوَى وَعَبْلَة", german: "Wer ist wo? Wähle den Ort jeder Person." },
      items: PARTY_NAMES.map((name, n) => {
        const options = sorted(PARTY_PLACES);
        return { id: `party-${n + 1}`, arabic: name, german: n === 0 ? "Beispiel im Buch" : undefined, questions: [{ prompt: "الْمَكَانُ:", options, answer: options.indexOf(PARTY_PLACES[n]!) }] };
      }),
    },
    { kind: "dialogue", mode: "listen", slug: "step-15", title: "Gespräch: An der Information", navLabel: "Gespräch (hören)", instruction: { arabic: "الْمُحَادَثَةُ: ١) اِسْتَخْدِمْ أَسْمَاءَ الْأَمَاكِنِ فِي تَدْرِيبِ ٤ وَلَوْحَةَ إِرْشَادَاتِ الْمَطَارِ لِتَسْأَلَ عَنْ بَعْضِ الْأَمَاكِنِ كَالْمِثَالِ: (طَالِب (أ) مُوَظَّفُ اسْتِعْلَامَاتِ الْمَطَارِ وَطَالِب (ب) رَاكِبٌ)", german: "Hör das Beispiel: Eine Reisende fragt an der Information nach dem Duty-free." }, dialogue: airportDialogue },
    { kind: "dialogue", mode: "roleplay", slug: "step-16", title: "Gespräch: Rollenspiel", navLabel: "Gespräch (Rolle)", instruction: { arabic: "٢) اِعْكِسُوا الْأَدْوَارَ وَكَرِّرُوا النَّشَاطَ.", german: "Spiel die Reisende oder den Angestellten.", note: "Teil 3 und 4 (über den Flughafen in deinem Land sprechen und schreiben) sind frei." }, dialogue: airportDialogue },
  ],
};

// ---------------------------------------------------------------------------
// تقديم (٢): أَيْنَ الصَّيْدَلِيَّةُ؟

/** (١) the eight places on the map with their numbers (the key of the book's arrows). */
const PLACES: Array<[n: number, id: string, arabic: string, german: string]> = [
  [1, "maktab-barid", "مَكْتَبُ بَرِيدٍ", "Postamt"],
  [2, "saydaliyya", "صَيْدَلِيَّة", "Apotheke"],
  [3, "maghsala", "مَغْسَلَة", "Wäscherei"],
  [4, "maqha", "مَقْهًى", "Café"],
  [5, "masjid", "مَسْجِد", "Moschee"],
  [6, "kanisa", "كَنِيسَة", "Kirche"],
  [7, "matam", "مَطْعَم", "Restaurant"],
  [8, "masrah", "مَسْرَح", "Theater"],
];
const DIRECTIONS: Array<[string, string]> = [
  ["مَيْدَان", "Platz"], ["دُرْ = لِفَّ", "dreh um, geh herum"], ["أَمَام", "geradeaus"], ["يَمِين", "rechts"], ["شِمَال", "links"], ["اُدْخُلْ", "bieg ein"],
  ["نَاصِيَة", "Ecke"], ["قَبْلَ التَّقَاطُعِ", "vor der Kreuzung"], ["بَعْدَ التَّقَاطُعِ مَعَ …", "nach der Kreuzung mit …"], ["اُدْخُلْ يَمِينًا وَاسْتَمِرَّ حَتَّى آخِرِ الشَّارِعِ", "bieg rechts ein und geh bis zum Ende der Straße"],
];

export const touristDialogue: Dialogue = {
  id: "tourist",
  intro: "Eine Touristin fragt einen Mann nach dem Weg zur Post.",
  speakers: [sp("saiha", "Die Touristin", "female-1", "Eine Touristin mit Stadtplan und Kamera"), sp("rajul", "Der Mann", "male-1", "Ein Mann auf der Straße")],
  lines: lines([
    ["u8-t-1", "saiha", "لَوْ سَمَحْتَ، أَيْنَ مَكْتَبُ الْبَرِيدِ؟", "لو سمحت أين مكتب البريد", "Law samaḥta, ayna maktabu l-barīd?", "Entschuldigung, wo ist die Post?"],
    ["u8-t-2", "rajul", "أَنْتِ الْآنَ فِي شَارِعِ مِصْرَ وَالسُّودَانِ، اُدْخُلِي يَمِينًا فِي شَارِعِ كِلْيُوبَاتْرَا.", "أنت الآن في شارع مصر والسودان ادخلي يمينا في شارع كليوباترا", "Anti l-āna fī shāriʿi Miṣra wa-s-Sūdān, udkhulī yamīnan fī shāriʿi Kilyūbātrā.", "Sie sind jetzt in der Misr-und-Sudan-Straße; biegen Sie rechts in die Kleopatra-Straße ein."],
    ["u8-t-3", "saiha", "يَمِينًا فِي شَارِعِ كِلْيُوبَاتْرَا. حَسَنًا.", "يمينا في شارع كليوباترا حسنا", "Yamīnan fī shāriʿi Kilyūbātrā. Ḥasanan.", "Rechts in die Kleopatra-Straße. Gut."],
    ["u8-t-4", "rajul", "اسْتَمِرِّي فِي شَارِعِ كِلْيُوبَاتْرَا حَتَّى بَعْدَ التَّقَاطُعِ مَعَ شَارِعِ رَمْسِيس، الصَّيْدَلِيَّةُ عَلَى الْيَمِينِ وَعَلَى النَّاصِيَةِ.", "استمري في شارع كليوباترا حتى بعد التقاطع مع شارع رمسيس الصيدلية على اليمين وعلى الناصية", "Istamirrī fī shāriʿi Kilyūbātrā ḥattā baʿda t-taqāṭuʿi maʿa shāriʿi Ramsīs, aṣ-ṣaydaliyyatu ʿala l-yamīni wa-ʿala n-nāṣiya.", "Gehen Sie die Kleopatra-Straße entlang bis nach der Kreuzung mit der Ramses-Straße; die Apotheke ist rechts an der Ecke."],
    ["u8-t-5", "saiha", "الصَّيْدَلِيَّةُ عَلَى الْيَمِينِ. عَلَى النَّاصِيَةِ. شُكْرًا.", "الصيدلية على اليمين على الناصية شكرا", "Aṣ-ṣaydaliyyatu ʿala l-yamīn. ʿAla n-nāṣiya. Shukran.", "Die Apotheke ist rechts. An der Ecke. Danke."],
    ["u8-t-6", "rajul", "عَفْوًا.", "عفوا", "ʿAfwan.", "Bitte."],
  ]),
  question: { prompt: "أَيْنَ السَّائِحَةُ؟", options: ["فِي شَارِعِ مِصْرَ وَالسُّودَانِ", "فِي شَارِعِ رَمْسِيس", "فِي شَارِعِ كِلْيُوبَاتْرَا"], answer: 0 },
};

/** تدريب ١: the six places of the book (Moschee is the model). */
const T1_PLACES: Array<[id: string, arabic: string, de: string]> = [
  ["masjid", "مَسْجِد", "Moschee"], ["matam", "مَطْعَم", "Restaurant"], ["maktaba-ammah", "مَكْتَبَة", "Bibliothek"],
  ["qism-shurta", "قِسْمُ الْبُولِيس", "Polizeiwache"], ["mathaf", "الْمَتْحَف", "Museum"], ["mahattat-utubis", "مَحَطَّةُ أُوتُوبِيس", "Bushaltestelle"],
];
const T1_OPTIONS = T1_PLACES.map((p) => p[1]);

/** تدريب ٢: the map – sentence (أ) with (ب). */
const MAP_MATCH: MatchContent = {
  promptTitle: "(أ)",
  optionTitle: "(ب)",
  prompts: [
    { id: "maghsala", arabic: "١ – الْمَغْسَلَةُ", answer: "o4" },
    { id: "markaz", arabic: "٢ – الْمَرْكَزُ التِّجَارِيُّ (٢)", answer: "o1" },
    { id: "sifara", arabic: "٣ – السِّفَارَةُ", answer: "o6" },
    { id: "maqha", arabic: "٤ – الْمَقْهَى", answer: "o3" },
    { id: "kanisa", arabic: "٥ – الْكَنِيسَةُ", answer: "o2" },
    { id: "shurta", arabic: "٦ – قِسْمُ الْبُولِيسِ (الشُّرْطَةِ)", answer: "o5" },
  ],
  // The book's column (ب), top to bottom.
  options: [
    { id: "o1", label: "فِي شَارِعِ (١) بِجَانِبِ الْحَدِيقَةِ.", arabic: "فِي شَارِعِ وَاحِد بِجَانِبِ الْحَدِيقَةِ." },
    { id: "o2", label: "عَلَى نَاصِيَةِ شَارِعِ ٥ وَشَارِعِ ٢ بِجَانِبِ وَيَمِينِ الْمَكْتَبَةِ.", arabic: "عَلَى نَاصِيَةِ شَارِعِ خَمْسَة وَشَارِعِ اثْنَيْن بِجَانِبِ وَيَمِينِ الْمَكْتَبَةِ." },
    { id: "o3", label: "فِي شَارِعِ ٣ عَلَى نَاصِيَةِ الْمَيْدَانِ وَيَسَارَ مَحَطَّةِ الْأُوتُوبِيسِ.", arabic: "فِي شَارِعِ ثَلَاثَة عَلَى نَاصِيَةِ الْمَيْدَانِ وَيَسَارَ مَحَطَّةِ الْأُوتُوبِيسِ." },
    { id: "o4", label: "فِي شَارِعِ ٣ بِجَانِبِ الْمَرْكَزِ التِّجَارِيِّ رَقْم (١).", arabic: "فِي شَارِعِ ثَلَاثَة بِجَانِبِ الْمَرْكَزِ التِّجَارِيِّ رَقْم وَاحِد." },
    { id: "o5", label: "فِي شَارِعِ ١ وَعَلَى نَاصِيَةِ شَارِعِ ٤، ٥ وَخَلْفَ الْمُتْحَفِ وَالسِّينِمَا.", arabic: "فِي شَارِعِ وَاحِد وَعَلَى نَاصِيَةِ شَارِعِ أَرْبَعَة وَخَمْسَة وَخَلْفَ الْمُتْحَفِ وَالسِّينِمَا." },
    { id: "o6", label: "عَلَى نَاصِيَةِ شَارِعِ ٣، ٤ أَمَامَ الْجَامِعَةِ.", arabic: "عَلَى نَاصِيَةِ شَارِعِ ثَلَاثَة وَأَرْبَعَة أَمَامَ الْجَامِعَةِ." },
  ],
};

const SHADI_Q: ClozeItem[] = [
  { id: "addr", lines: [{ label: "١", parts: ["عُنْوَانُ شَادِي: ", gap(["٦٥"], ["٦٥", "٤٦", "٣"]), " شَارِعُ ", gap(["الثَّوْرَةِ"], ["الثَّوْرَةِ", "أَحْمَد حُسَيْن", "الْمُهَنْدِسِين"]), "، الدَّوْرُ ", gap(["الثَّالِثُ"], ["الثَّالِثُ", "الثَّانِي", "الْأَوَّلُ"]), "، شَقَّةُ رَقْم ", gap(["٤٦"], ["٤٦", "٦٥", "١٢"])] }] },
  { id: "way", lines: [{ label: "٢", parts: ["طَرِيقَةُ الْوُصُولِ: ", gap(["اُدْخُلْ شَارِعَ أَحْمَد حُسَيْن – اسْتَمِرَّ فِي الشَّارِعِ حَتَّى التَّقَاطُعِ – الْعِمَارَةُ عَلَى النَّاصِيَةِ."], ["اُدْخُلْ شَارِعَ أَحْمَد حُسَيْن – اسْتَمِرَّ فِي الشَّارِعِ حَتَّى التَّقَاطُعِ – الْعِمَارَةُ عَلَى النَّاصِيَةِ.", "اُدْخُلْ شَارِعَ الثَّوْرَةِ – الْعِمَارَةُ خَلْفَ الْمَسْجِدِ.", "الْعِمَارَةُ أَمَامَ الْمَسْجِدِ فِي شَارِعِ مُصْطَفَى مَحْمُود."])] }] },
  { id: "where", lines: [{ label: "٣", parts: ["الْعِمَارَةُ ", gap(["بِجَانِبِ مَسْجِدِ الصِّدِّيقِ أَمَامَ الْمَرْكَزِ التِّجَارِيِّ."], ["بِجَانِبِ مَسْجِدِ الصِّدِّيقِ أَمَامَ الْمَرْكَزِ التِّجَارِيِّ.", "خَلْفَ الْمَرْكَزِ التِّجَارِيِّ.", "بَيْنَ الْمَسْجِدِ وَالْمَدْرَسَةِ."])] }] },
];

const PARTY_INVITE: ClozeItem[] = [
  { id: "when", lines: [{ label: "", parts: ["مَوْعِدُ الْحَفْلَةِ: يَوْمَ ", gap(["الْخَمِيسِ"], ["الْخَمِيسِ", "الْجُمْعَةِ", "السَّبْتِ"]), " السَّاعَةَ ", gap(["السَّادِسَةَ مَسَاءً."], ["السَّادِسَةَ مَسَاءً.", "السَّادِسَةَ صَبَاحًا.", "السَّابِعَةَ مَسَاءً."])] }] },
  { id: "way", lines: [{ label: "١", parts: ["وَصْفُ الطَّرِيقِ: الْبَيْتُ فِي آخِرِ شَارِعِ مُصْطَفَى مَحْمُود ", gap(["بِجِوَارِ مُسْتَشْفَى الْحُرِّيَّةِ"], ["بِجِوَارِ مُسْتَشْفَى الْحُرِّيَّةِ", "خَلْفَ مُسْتَشْفَى الْحُرِّيَّةِ"]), "، أَمَامَ صَيْدَلِيَّةِ النُّورِ ", gap(["بَعْدَ التَّقَاطُعِ"], ["بَعْدَ التَّقَاطُعِ", "قَبْلَ التَّقَاطُعِ"]), " مَعَ شَارِعِ أَحْمَد رَجَب."] }] },
  { id: "addr", lines: [{ label: "٢", parts: ["الْعُنْوَانُ: شَارِعُ مُصْطَفَى مَحْمُود – الدَّوْرُ ", gap(["الثَّانِي"], ["الثَّانِي", "الثَّالِثُ"]), "، شَقَّةُ ", gap(["١٢"], ["١٢", "٢١"]), " – مَحْمُول: ", gap(["٠١٢٢٤٥٦٧٤٩"], ["٠١٢٢٤٥٦٧٤٩", "٠١٢٢٤٦٥٧٤٩"])] }] },
];

/** المحادثة ٢: places in Mohandessin / Dokki on the map of p. 244. */
const CITY: Array<[q: string, a: string, wrong: string[]]> = [
  ["أَيْنَ شَارِعُ التَّحْرِيرِ؟", "فِي الدُّقِّي.", ["فِي الزَّمَالِك.", "فِي الْعَجُوزَة."]],
  ["أَيْنَ الْمَدْرَسَةُ الْأَلْمَانِيَّةُ؟", "فِي الْجِيزَةِ بِجَانِبِ فُنْدُقِ كُونْكُورْد.", ["فِي الزَّمَالِك بِجَانِبِ نَادِي الزَّمَالِك.", "فِي الْمُهَنْدِسِين أَمَامَ الْمُتْحَفِ الزِّرَاعِيِّ."]],
  ["أَيْنَ شَارِعُ جَامِعَةِ الدُّوَلِ الْعَرَبِيَّةِ؟", "فِي الْمُهَنْدِسِين.", ["فِي الدُّقِّي.", "فِي الْجِيزَة."]],
  ["أَيْنَ مُسْتَشْفَى السَّلَامِ؟", "فِي الْمُهَنْدِسِين بِجَانِبِ مَيْدَانِ لُبْنَان.", ["فِي الْجِيزَةِ بِجَانِبِ الْمَدْرَسَةِ الْأَلْمَانِيَّةِ.", "فِي الْعَجُوزَةِ بِجَانِبِ النِّيلِ."]],
  ["أَيْنَ الْمُتْحَفُ الزِّرَاعِيُّ؟", "فِي الدُّقِّي بِجَانِبِ نَادِي الصَّيْدِ.", ["فِي الزَّمَالِك.", "فِي الْجِيزَةِ بِجَانِبِ فُنْدُقِ كُونْكُورْد."]],
  ["أَيْنَ نَادِي الصَّيْدِ؟", "فِي الدُّقِّي بِجَانِبِ الْمُتْحَفِ الزِّرَاعِيِّ.", ["فِي الْمُهَنْدِسِين بِجَانِبِ مُسْتَشْفَى السَّلَامِ.", "فِي الزَّمَالِك."]],
];

export const a1AynaSaydaliyya: A1Lesson = {
  slug: "ayna-as-saydaliyya",
  kind: "phrase",
  label: "أَيْنَ الصَّيْدَلِيَّةُ؟",
  labelGerman: "Wo ist die Apotheke?",
  steps: [
    { kind: "words", slug: "step-1", title: "Orte in der Stadt", navLabel: "Orte", instruction: { arabic: "تَقْدِيمٌ (٢): أَيْنَ الصَّيْدَلِيَّةُ؟ ١) اُدْرُسْ هَذِهِ الْكَلِمَاتِ.", german: "Lerne die Wörter: Orte in der Stadt. Hör zu und sprich nach." }, groups: [{ id: "places", title: "الْأَمَاكِنُ", words: PLACES.map(([, id, a, g]) => word(`place-${id}`, a, g, `${IMG}/${id}.svg`)) }] },
    {
      kind: "quiz",
      slug: "step-2",
      title: "Die Nummer auf dem Stadtplan",
      navLabel: "Stadtplan",
      instruction: { arabic: "اُكْتُبِ الرَّقْمَ أَمَامَ الِاسْمِ: --- مَكْتَبُ بَرِيدٍ --- صَيْدَلِيَّة --- مَغْسَلَة --- مَقْهًى --- مَسْجِد --- كَنِيسَة --- مَطْعَم --- مَسْرَح · اِسْمَعْ لِتُصَحِّحَ إِجَابَتَكَ.", german: "Welche Nummer hat jeder Ort auf dem Stadtplan des Buchs? (Die Pfeile zeigen von den Bildern zu den Nummern.)", note: "Auf dem Plan: Ramses-, Kleopatra-, Misr-und-Sudan-, Damaskus-, Libanon-Straße. Die Nummern sind aus den Pfeilen des Buchs abgelesen." },
      items: PLACES.map(([n, id, a, g]) => ({ id: `num-${id}`, arabic: a, german: g, image: { src: `${IMG}/${id}.svg`, alt: g }, questions: [{ prompt: "Die Nummer:", options: ["١", "٢", "٣", "٤", "٥", "٦", "٧", "٨"], answer: n - 1 }] })),
    },
    { kind: "phrases", slug: "step-3", title: "Den Weg beschreiben", navLabel: "Wegwörter", instruction: { arabic: "اُدْرُسِ الْكَلِمَاتِ:", german: "Lerne die Wörter für den Weg – hör zu und sprich nach." }, groups: [{ id: "dirs", title: "وَصْفُ الطَّرِيقِ", items: DIRECTIONS.map(([a, g], n) => phrase(`dir-${n + 1}`, a, g)) }] },
    { kind: "dialogue", mode: "listen", slug: "step-4", title: "Anhören: Wo ist die Post?", navLabel: "Anhören", instruction: { arabic: "اُنْظُرْ إِلَى الْخَرِيطَةِ السَّابِقَةِ · ٢) اِقْرَأِ الْحِوَارَ، ثُمَّ أَجِبْ: «أَيْنَ السَّائِحَةُ؟»", german: "Schau auf den Stadtplan und hör zu: Wo ist die Touristin?", note: "Die Touristin fragt nach der Post – der Mann beschreibt aber den Weg zur Apotheke; so steht es im Buch. Danach: „Wo ist die Apotheke?“" }, dialogue: touristDialogue },
    { kind: "dialogue", mode: "repeat", slug: "step-5", title: "Nachsprechen", navLabel: "Nachsprechen", instruction: { arabic: "كَرِّرِ الْحِوَارَ مَعَ زَمِيلِكَ وَأَجِبْ أَيْنَ الصَّيْدَلِيَّةُ؟", german: "Sprich jede Zeile nach." }, dialogue: touristDialogue },
    { kind: "dialogue", mode: "roleplay", slug: "step-6", title: "Rollenspiel", navLabel: "Rollenspiel", instruction: { arabic: "كَرِّرِ الْحِوَارَ مَعَ زَمِيلِكَ.", german: "Spiel die Touristin oder den Mann." }, dialogue: touristDialogue },
    {
      kind: "table",
      slug: "step-7",
      title: "Grammatik: nach dem Weg fragen",
      navLabel: "Grammatik",
      instruction: { arabic: "لَاحِظِ الْقَوَاعِدَ: ١) لِلسُّؤَالِ عَنِ الطَّرِيقِ ٢) لِلِاسْتِفْسَارِ عَنْ صِحَّةِ الْمَعْلُومَةِ", german: "Achte auf die Regeln: So fragst du nach dem Weg – und so fragst du nach, ob eine Angabe stimmt." },
      tables: [
        {
          id: "way",
          titleArabic: "١) لِلسُّؤَالِ عَنِ الطَّرِيقِ: أَيْنَ الْـ + اسْم؟",
          title: "Nach dem Weg fragen",
          columns: [{ arabic: "السُّؤَالُ", german: "Frage" }, { arabic: "الْإِجَابَةُ", german: "Antwort" }],
          rows: [
            [{ arabic: "أَيْنَ الصَّيْدَلِيَّةُ؟" }, { arabic: "اُدْخُلْ فِي شَارِعِ … – اسْتَمِرَّ حَتَّى شَارِعِ …", listen: false }],
            [{ arabic: "", listen: false }, { arabic: "لِفَّ (دُرْ) الْمَيْدَانَ – اُدْخُلْ يَمِينًا / يَسَارًا" }],
            [{ arabic: "", listen: false }, { arabic: "الصَّيْدَلِيَّةُ عَلَى الْيَمِينِ / الْيَسَارِ – عَلَى النَّاصِيَةِ" }],
            [{ arabic: "", listen: false }, { arabic: "قَبْلَ تَقَاطُعِ شَارِعِ … – بَعْدَ تَقَاطُعِ شَارِعِ …", listen: false }],
          ],
        },
        {
          id: "check",
          titleArabic: "٢) لِلِاسْتِفْسَارِ عَنْ صِحَّةِ الْمَعْلُومَةِ",
          title: "Nachfragen",
          columns: [{ arabic: "السُّؤَالُ", german: "Frage" }, { arabic: "الْإِجَابَةُ", german: "Antwort" }],
          rows: [
            [{ arabic: "هَلِ الصَّيْدَلِيَّةُ عَلَى الْيَمِينِ؟" }, { arabic: "لَا، الصَّيْدَلِيَّةُ لَيْسَتْ عَلَى الْيَمِينِ، الصَّيْدَلِيَّةُ عَلَى الْيَسَارِ." }],
            [{ arabic: "", listen: false }, { arabic: "نَعَمْ، عَلَى الْيَمِينِ." }],
          ],
        },
      ],
      quiz: [
        { id: "right", prompt: "„Bieg rechts ein.“", options: ["اُدْخُلْ يَمِينًا.", "اُدْخُلْ يَسَارًا.", "لِفَّ الْمَيْدَانَ."], answer: 0 },
        { id: "corner", prompt: "„an der Ecke“", options: ["عَلَى النَّاصِيَةِ", "بَعْدَ التَّقَاطُعِ", "حَتَّى آخِرِ الشَّارِعِ"], answer: 0 },
        { id: "neg", prompt: "„Die Apotheke ist nicht rechts.“", options: ["الصَّيْدَلِيَّةُ لَيْسَ عَلَى الْيَمِينِ.", "الصَّيْدَلِيَّةُ لَيْسَتْ عَلَى الْيَمِينِ."], answer: 1 },
      ],
    },
    {
      kind: "cloze",
      slug: "step-8",
      title: "Übung 1: Wie heißen die Orte?",
      navLabel: "Übung 1",
      instruction: { arabic: "التَّدْرِيبَاتُ · تَدْرِيبٌ (١): اُكْتُبْ أَسْمَاءَ هَذِهِ الْأَمَاكِنِ.", german: "Übung 1: Schreib den Namen jedes Orts – Beispiel im Buch: هَذَا مَسْجِد.", note: "Nützliche Wörter: قِسْمُ الْبُولِيسِ – الْمَتْحَف – مَحَطَّةُ أُوتُوبِيس – مَسْجِد." },
      items: T1_PLACES.map(([id, a, g], n) => ({ id: `t1-${id}`, image: { src: `${IMG}/${id}.svg`, alt: g }, lines: [{ label: "", parts: n === 0 ? [`هَذَا ${a}`] : [gap([a], sorted([a, T1_OPTIONS[(n + 1) % 6]!, T1_OPTIONS[(n + 3) % 6]!]))] }] })),
    },
    { kind: "match", slug: "step-9", title: "Übung 2: Wo liegt es auf dem Plan?", navLabel: "Übung 2", instruction: { arabic: "تَدْرِيبٌ (٢): ١) صِلْ جُمْلَةَ (أ) مَعَ (ب) حَسَبَ الْخَرِيطَةِ.", german: "Übung 2: Verbinde jeden Ort (أ) mit seiner Lage auf dem Plan (ب).", note: "Nützliche Wörter: سِفَارَة (Botschaft) – حَلَّاق (Friseur) – جَامِعَة (Universität) – حَدِيقَة (Park) – كَنِيسَة (Kirche). Teil 2 (nach den anderen Orten fragen) braucht einen Partner; Übung 3 ist auf der Website des Verlags." }, match: MAP_MATCH },
    {
      kind: "phrases",
      slug: "step-10",
      title: "Übung 4: Schadis Nachricht",
      navLabel: "Übung 4 (lesen)",
      instruction: { arabic: "تَدْرِيبٌ (٤): هَذِهِ رِسَالَةٌ قَصِيرَةٌ لِصَدِيقٍ، اِقْرَأِ النَّصَّ وَأَجِبْ عَنِ الْأَسْئِلَةِ: ١ – أَيْنَ بَيْتُ شَادِي؟", german: "Übung 4: Lies Schadis Nachricht an seinen Freund Mufdi." },
      groups: [{
        id: "shadi",
        title: "عَزِيزِي مُفْدِي",
        items: [
          ["بَيْتِي الْجَدِيدُ فِي مِنْطَقَةِ الْمُهَنْدِسِين بِالْقَاهِرَةِ.", "Mein neues Haus ist im Viertel al-Muhandisin in Kairo."],
          ["عُنْوَانِي ٦٥ شَارِعُ الثَّوْرَةِ، الدَّوْرُ الثَّالِثُ، شَقَّةُ ٤٦.", "Meine Adresse: ath-Thaura-Straße 65, dritter Stock, Wohnung 46."],
          ["الْعِمَارَةُ بِجَانِبِ مَسْجِدِ الصِّدِّيقِ أَمَامَ الْمَرْكَزِ التِّجَارِيِّ.", "Das Haus ist neben der as-Siddiq-Moschee, gegenüber dem Einkaufszentrum."],
          ["اُدْخُلْ شَارِعَ أَحْمَد حُسَيْن – اسْتَمِرَّ فِي الشَّارِعِ حَتَّى التَّقَاطُعِ – الْعِمَارَةُ عَلَى النَّاصِيَةِ.", "Bieg in die Ahmad-Husain-Straße ein, geh bis zur Kreuzung – das Haus ist an der Ecke."],
          ["شَادِي", "Schadi"],
        ].map(([a, g], n) => phrase(`shadi-${n + 1}`, a!.replace(/٦٥/, "خَمْسَة وَسِتُّونَ").replace(/٤٦/, "سِتَّة وَأَرْبَعُونَ"), g!)),
      }],
    },
    { kind: "cloze", slug: "step-11", title: "Übung 4: Fragen zur Nachricht", navLabel: "Übung 4 (Fragen)", instruction: { arabic: "اِقْرَأْ مَرَّةً ثَانِيَةً وَأَجِبْ: ١ – عُنْوَانُ شَادِي ٢ – طَرِيقَةُ الْوُصُولِ ٣ – اُكْتُبِ اسْمَ الشَّارِعِ وَارْسُمْ مَكَانَ الْعِمَارَةِ عَلَى الْخَرِيطَةِ.", german: "Antworte mit der Nachricht.", note: "Das Haus auf der kleinen Karte einzeichnen (Teil 3) machst du im Buch." }, items: SHADI_Q },
    { kind: "cloze", slug: "step-12", title: "Übung 5: Heute ist eine Feier", navLabel: "Übung 5", instruction: { arabic: "تَدْرِيبٌ (٥): الْيَوْمَ حَفْلَةٌ · هَذِهِ دَعْوَةُ زَمِيلٍ فِي الْفَصْلِ لِحَفْلَةٍ. اِقْرَأِ الدَّعْوَةَ. مَتَى مَوْعِدُ الْحَفْلَةِ؟ ١ – مَا وَصْفُ الطَّرِيقِ؟ ٢ – مَا عُنْوَانُ صَاحِبِ الْحَفْلَةِ؟", german: "Übung 5: Lies die Einladung: Wann ist die Feier? Wie ist der Weg? Wie ist die Adresse?", note: "بِجَانِبِ = بِجِوَارِ (neben). Die Einladung im Buch: „Die Feier ist am Donnerstag um 18 Uhr. Das Haus ist am Ende der Mustafa-Mahmud-Straße neben dem al-Hurriyya-Krankenhaus, gegenüber der Apotheke an-Nur nach der Kreuzung mit der Ahmad-Ragab-Straße. Adresse: Mustafa-Mahmud-Straße, 2. Stock, Wohnung 12. Handy: ٠١٢٢٤٥٦٧٤٩.“ Teil 3 (deine eigene Einladung) ist frei." }, items: PARTY_INVITE },
    {
      kind: "quiz",
      slug: "step-13",
      title: "Gespräch 1: Hier ist mein Haus",
      navLabel: "Gespräch 1",
      instruction: { arabic: "الْمُحَادَثَةُ · تَدْرِيبٌ (١): هُنَا بَيْتِي · ١) صِفْ طَرِيقَ بَيْتِكَ لِزَمِيلِكَ. اِسْتَخْدِمِ الْخَرِيطَةَ.", german: "Gespräch 1: Auf dem Plan steht „أَنْتَ هُنَا“ (du bist hier) und „بَيْتِي“ (mein Haus). Welche Beschreibung führt zum Haus?", note: "Auf dem Plan: Ramses-Straße mit zwei Plätzen; das Haus liegt hinter dem zweiten Platz neben der Apotheke. Teil 2 und 3 (dein eigenes Haus) brauchen einen Partner." },
      items: [{ id: "home", arabic: "صِفْ طَرِيقَ بَيْتِكَ.", questions: [{ prompt: "Der Weg:", options: ["اُدْخُلْ فِي شَارِعِ رَمْسِيس، لِفَّ الْمَيْدَانَ الْأَوَّلَ وَالثَّانِيَ، بَيْتِي بِجَانِبِ الصَّيْدَلِيَّةِ.", "اُدْخُلْ يَمِينًا، بَيْتِي أَمَامَ الْمُسْتَشْفَى.", "بَيْتِي خَلْفَ قِسْمِ الْبُولِيسِ."], answer: 0 }] }],
    },
    {
      kind: "quiz",
      slug: "step-14",
      title: "Gespräch 2: Orte auf dem Stadtplan",
      navLabel: "Gespräch 2",
      instruction: { arabic: "تَدْرِيبٌ (٢): تَبَادَلُوا السُّؤَالَ عَنْ هَذِهِ الْأَمَاكِنِ ثُمَّ اكْتُبُوا الْإِجَابَةَ أَمَامَ كُلِّ مَكَانٍ. اِسْتَخْدِمُوا الْخَرِيطَةَ التَّالِيَةَ لِوَصْفِ هَذِهِ الْأَمَاكِنِ.", german: "Gespräch 2: Wo ist …? Antworte mit dem Stadtplan (Mohandessin, Dokki, Giza) im Buch, S. 244.", note: "Die Antworten sind aus dem Stadtplan des Buchs (englisch beschriftet) abgelesen." },
      items: CITY.map(([q, a, wrong], n) => {
        const options = sorted([a, ...wrong]);
        return { id: `city-${n + 1}`, arabic: q, questions: [{ prompt: "Wo?", options, answer: options.indexOf(a) }] };
      }),
    },
    {
      kind: "table",
      slug: "step-15",
      title: "Merke: Ort, Verneinung, Weg",
      navLabel: "Merke",
      instruction: { arabic: "تَذَكَّرْ", german: "Merke: das Wichtigste von Unit 8 auf einen Blick." },
      tables: [
        { id: "where", titleArabic: "١) السُّؤَالُ عَنِ الْأَمَاكِنِ:", title: "Nach dem Ort fragen", columns: [{ arabic: "السُّؤَالُ", german: "Frage" }, { arabic: "الْإِجَابَةُ", german: "Antwort" }], rows: [[{ arabic: "أَيْنَ الْقَلَمُ؟" }, { arabic: "الْقَلَمُ تَحْتَ الطَّاوِلَةِ." }], [{ arabic: "هَلِ الْقَلَمُ فَوْقَ الطَّاوِلَةِ؟" }, { arabic: "لَا، الْقَلَمُ لَيْسَ فَوْقَ الطَّاوِلَةِ. الْقَلَمُ تَحْتَ الطَّاوِلَةِ." }], [{ arabic: "هَلِ الْحَقِيبَةُ فَوْقَ الطَّاوِلَةِ؟" }, { arabic: "لَا، الْحَقِيبَةُ لَيْسَتْ فَوْقَ الطَّاوِلَةِ. الْحَقِيبَةُ تَحْتَ الطَّاوِلَةِ." }]] },
        { id: "neg", titleArabic: "٢) لِلنَّفْيِ:", title: "Verneinung", columns: [{ arabic: "مُذَكَّر", german: "männlich" }, { arabic: "مُؤَنَّث", german: "weiblich" }], rows: [[{ arabic: "لَيْسَ" }, { arabic: "لَيْسَتْ + فَوْقَ الطَّاوِلَةِ" }]] },
        { id: "way", titleArabic: "٣) لِوَصْفِ الطَّرِيقِ:", title: "Den Weg beschreiben", columns: [{ arabic: "", german: "" }], rows: [[{ arabic: "اُدْخُلْ فِي شَارِعِ … اسْتَمِرَّ حَتَّى … اُدْخُلْ يَمِينًا / يَسَارًا", listen: false }], [{ arabic: "لِفَّ حَوْلَ الْمَيْدَانِ – قَبْلَ / بَعْدَ التَّقَاطُعِ" }], [{ arabic: "الْمَكْتَبُ عَلَى الْيَمِينِ – عَلَى الْيَسَارِ" }]] },
      ],
      quiz: [
        { id: "under", prompt: "„Der Stift ist unter dem Tisch.“", options: ["الْقَلَمُ تَحْتَ الطَّاوِلَةِ.", "الْقَلَمُ فَوْقَ الطَّاوِلَةِ."], answer: 0 },
        { id: "around", prompt: "„um den Platz herum“", options: ["حَوْلَ الْمَيْدَانِ", "بَعْدَ التَّقَاطُعِ", "عَلَى الْيَسَارِ"], answer: 0 },
      ],
    },
  ],
};
