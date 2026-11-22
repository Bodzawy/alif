import type { A1Lesson, ClozeItem, ClozePart, CompareItem, Dialogue, DialogueSpeaker, MatchContent, PhraseItem, QuizItem, A1Word, WordGroup, TableBlock, TableCell, TableQuiz } from "@/data/types";
import { transliterate } from "@/lib/arabic/transliterate";

import { unvocalised } from "../../a1/letter-lesson";

// A2 · Lektion 1 – الوحدة الأولى · تقديم (١) "شَقَّتِي الْجَدِيدَةُ" (book "لغتنا الفصحى 2", pages 16–34).
//
// Didactic line (CEFR A2), step by step:
//   1  Wortschatz      Gegensätze (adjective pairs) – hear, compare, say          [compare]
//   2  Wortschatz      Die Wohnung: rooms, furniture, places + a quick check      [table]
//   3  Lesen / Hören   Alaas Wohnung (النص), sentence by sentence, read aloud     [phrases]
//   4  Verstehen       Fragen zum Text                                            [quiz]
//   5  Grammatik 1     فِيهِ · فِيهَا · بِهِ · بِهَا (preposition + pronoun)       [table]
//   6  Üben            Wörter verbinden (تدريب ١)                                  [match]
//   7  Grammatik 2     The adjective agrees: number, gender, article, case        [table]
//   8  Üben            Das passende Adjektiv (تدريب ٢)                             [cloze]
//   9  Grammatik 3     Verneinen mit لَيْسَ (and لَيْسَ فِيهِ / بِهِ)              [table]
//  10  Üben            Verneinen (تدريب ٣)                                          [quiz]
//  11  Hören           Dialog 1: Samira and Salwa (تدريب ٨ أ)                      [dialogue · listen]
//  12  Sprechen        Dialog 1 nachsprechen                                        [dialogue · repeat]
//  13  Hören           Dialog 2: Safaa and Nawal (تدريب ٨ ب)                        [dialogue · listen]
//  14  Verstehen       Richtig oder falsch? (the book's question 6)                 [quiz]
//  15  Sprechen        Rollenspiel: Dialog 2                                        [dialogue · roleplay]
//  16  Lesen           Marks Brief aus Kairo (قراءة ١), read aloud                  [phrases]
//  17  Verstehen       Fragen zum Brief                                             [quiz]
//  18  Sprechen        Meine Wohnung beschreiben (تدريب ١٢، ١٣)                     [phrases]
//  19  Abschluss       Hörcheck: was hörst du? (فِيهِ/فِيهَا, لَيْسَ, Adjektive)     [quiz]
// Pronunciation rules of the evaluated lines: scripts/a2-rules.ts.

const IMG = "/images/a2/unit-1";

const gap = (accept: string[], options: string[]): ClozePart => ({ accept, options });
const strip = (arabic: string) => unvocalised(arabic).replace(/[.؟?!،,:()–-]/g, " ").replace(/\s+/g, " ").trim();
const sp = (id: string, name: string, voice: DialogueSpeaker["voice"], alt: string): DialogueSpeaker => ({ id, name, voice, avatar: { src: `${IMG}/${id}.svg`, alt } });
const ph = (id: string, arabic: string, german: string, tag?: string): PhraseItem => ({
  id,
  arabic,
  transliteration: transliterate(arabic),
  german,
  ...(tag ? { tag } : {}),
  exercise: { id, target: strip(arabic), modelText: arabic },
});
const dl = (id: string, speaker: string, arabic: string, german: string): Dialogue["lines"][number] => ({
  id,
  speaker,
  arabic,
  transliteration: transliterate(arabic),
  german,
  exercise: { id, target: strip(arabic), modelText: arabic },
});
const it = (id: string, arabic: string, german: string, tag?: CompareItem["tag"]): CompareItem => ({ id, arabic, german, image: { src: `${IMG}/opposites/${id}.webp`, alt: german }, ...(tag ? { tag } : {}) });
const cell = (arabic: string, german?: string, listen = true): TableCell => ({ arabic, ...(german ? { german } : {}), ...(listen ? {} : { listen: false }) });

// ------------------------------------------------------------------ 1 · Gegensätze
const OPPOSITES = [
  {
    id: "things",
    titleArabic: "الْأَشْيَاءُ وَالْأَمَاكِنُ",
    title: "Dinge und Orte",
    note: "Jeweils zwei Gegensätze nebeneinander: Hör beide an und sprich sie nach. Die Endung ـٌ (Tanwin) ist die Form, die man im Satz oft hört.",
    rows: [
      [it("o-new", "جَدِيدٌ", "neu"), it("o-old", "قَدِيمٌ", "alt")],
      [it("o-high", "عَالٍ", "hoch"), it("o-low", "مُنْخَفِضٌ", "niedrig")],
      [it("o-spacious", "وَاسِعٌ", "weit, geräumig"), it("o-narrow", "ضَيِّقٌ", "eng")],
      [it("o-wide", "عَرِيضٌ", "breit"), it("o-narrow-2", "ضَيِّقٌ", "schmal")],
      [it("o-bright", "مُضِيءٌ", "hell"), it("o-dark", "مُظْلِمٌ", "dunkel")],
      [it("o-clean", "نَظِيفٌ", "sauber"), it("o-dirty", "قَذِرٌ", "schmutzig")],
      [it("o-comfy", "مُرِيحٌ", "bequem, angenehm"), it("o-tiring", "مُتْعِبٌ", "anstrengend")],
    ],
  },
  {
    id: "people",
    titleArabic: "النَّاسُ",
    title: "Menschen",
    note: "Diese Adjektive beschreiben Aussehen und Charakter. Für Frauen kommt ـَةٌ dazu: طَوِيلٌ → طَوِيلَةٌ.",
    rows: [
      [it("p-slim", "رَفِيعٌ", "schlank, dünn"), it("p-fat", "سَمِينٌ", "dick")],
      [it("p-nice", "لَطِيفٌ", "nett, freundlich"), it("p-rude", "فَظٌّ", "unfreundlich, grob")],
      [it("p-active", "نَشِيطٌ", "aktiv, fleißig"), it("p-lazy", "كَسْلَانُ", "faul")],
      [it("p-rich", "غَنِيٌّ", "reich"), it("p-poor", "فَقِيرٌ", "arm")],
    ],
  },
  {
    id: "more",
    titleArabic: "صِفَاتٌ وَعَكْسُهَا",
    title: "Mehr Gegensätze (Übung ٢ des Buches)",
    note: "Lerne immer das Paar zusammen: Wer das Wort kennt, kennt sofort auch sein Gegenteil.",
    rows: [
      [it("t-tall", "طَوِيلٌ", "groß, lang"), it("t-short", "قَصِيرٌ", "klein, kurz")],
      [it("m-many", "كَثِيرٌ", "viel"), it("m-few", "قَلِيلٌ", "wenig")],
      [it("m-big", "كَبِيرٌ", "groß"), it("m-small", "صَغِيرٌ", "klein")],
      [it("m-beautiful", "جَمِيلٌ", "schön"), it("m-ugly", "قَبِيحٌ", "hässlich")],
      [it("m-expensive", "غَالٍ", "teuer"), it("m-cheap", "رَخِيصٌ", "billig")],
      [it("m-crowded", "مُزْدَحِمٌ", "überfüllt, belebt"), it("m-quiet", "هَادِئٌ", "ruhig")],
    ],
  },
];

// ------------------------------------------------------------------ 2 · Wortschatz: die Wohnung
const WORDS_HOME: TableBlock[] = [
  {
    id: "rooms",
    titleArabic: "حُجُرَاتُ الشَّقَّةِ",
    title: "Die Wohnung und ihre Räume",
    columns: [
      { arabic: "الْكَلِمَةُ", german: "Wort" },
      { arabic: "الْكَلِمَةُ", german: "Wort" },
    ],
    rows: [
      [cell("الشَّقَّةُ", "die Wohnung"), cell("حُجْرَةُ النَّوْمِ", "das Schlafzimmer")],
      [cell("حُجْرَةُ الْمَعِيشَةِ", "das Wohnzimmer"), cell("الْمَطْبَخُ", "die Küche")],
      [cell("الْحَمَّامُ", "das Bad"), cell("الْحَدِيقَةُ", "der Garten")],
      [cell("الْفَصْلُ", "das Klassenzimmer"), cell("الْمَكْتَبَةُ", "die Bibliothek")],
    ],
    note: "حُجْرَةُ النَّوْمِ ist wörtlich „Zimmer des Schlafes“: zwei Nomen hintereinander (Idafa).",
  },
  {
    id: "furniture",
    titleArabic: "الْأَثَاثُ وَالْأَدَوَاتُ",
    title: "Möbel und Geräte",
    columns: [
      { arabic: "الْكَلِمَةُ", german: "Wort" },
      { arabic: "الْكَلِمَةُ", german: "Wort" },
    ],
    rows: [
      [cell("الْمَكْتَبُ", "der Schreibtisch"), cell("السَّرِيرُ", "das Bett")],
      [cell("الدُّولَابُ", "der Schrank"), cell("الطَّاوِلَةُ", "der Tisch")],
      [cell("الْكَنَبَةُ", "das Sofa"), cell("الثَّلَّاجَةُ", "der Kühlschrank")],
      [cell("السَّخَّانُ", "der Boiler"), cell("النَّافِذَةُ", "das Fenster")],
      [cell("الْبَابُ", "die Tür"), cell("السُّورُ", "die Mauer, der Zaun")],
    ],
  },
  {
    id: "places",
    titleArabic: "الْأَمَاكِنُ فِي الْمَدِينَةِ",
    title: "Orte in der Stadt",
    columns: [
      { arabic: "الْكَلِمَةُ", german: "Wort" },
      { arabic: "الْكَلِمَةُ", german: "Wort" },
    ],
    rows: [
      [cell("الْمَدِينَةُ", "die Stadt"), cell("الْمِنْطَقَةُ", "das Stadtviertel")],
      [cell("الشَّارِعُ", "die Straße"), cell("الْمَتْحَفُ", "das Museum")],
      [cell("الْجَامِعَةُ", "die Universität"), cell("النَّهْرُ", "der Fluss")],
    ],
  },
];
// The vocabulary steps are "words" steps (A1 · Wörter): every word is listened to and spoken by the learner,
// one card after the other (guided mode). A card with a picture shows it; the others show the word large.
const toWord = (id: string, arabic: string, german: string, image?: { src: string; alt: string }): A1Word => ({
  id,
  arabic,
  german,
  transliteration: transliterate(arabic),
  ...(image ? { image } : {}),
  exercise: { id, target: strip(arabic), modelText: arabic },
});
const oppositeWords = (section: (typeof OPPOSITES)[number]): WordGroup => ({
  id: section.id,
  title: section.title,
  titleArabic: section.titleArabic,
  paired: true,
  words: section.rows.flat().map((item) => toWord(`a2-1-${item.id}`, item.arabic, item.german ?? "", item.image)),
});
// Pictures of the room, furniture and place words (public/images/a2/unit-1/{vocab,scenes}/); a word without one shows the word large.
const HOME_IMAGES: Record<string, string> = {
  "الشَّقَّةُ": "scenes/shaqqati-plan",
  "حُجْرَةُ النَّوْمِ": "vocab/bedroom",
  "حُجْرَةُ الْمَعِيشَةِ": "vocab/living-room",
  "الْمَطْبَخُ": "vocab/kitchen",
  "الْحَمَّامُ": "vocab/bathroom",
  "الْحَدِيقَةُ": "vocab/garden",
  "الْمَكْتَبُ": "vocab/desk",
  "السَّرِيرُ": "vocab/bed",
  "الدُّولَابُ": "vocab/wardrobe",
  "الْكَنَبَةُ": "vocab/sofa",
  "الثَّلَّاجَةُ": "vocab/fridge",
  "السَّخَّانُ": "vocab/boiler",
  "النَّافِذَةُ": "vocab/window",
  "الْمَتْحَفُ": "scenes/egyptian-museum",
  "النَّهْرُ": "scenes/nile",
};
const homeWords = (table: TableBlock): WordGroup => ({
  id: table.id,
  title: table.title,
  titleArabic: table.titleArabic,
  words: table.rows.flat().map((c, n) => toWord(`a2-1-${table.id}-${n + 1}`, c.arabic, c.german ?? "", HOME_IMAGES[c.arabic] ? { src: `${IMG}/${HOME_IMAGES[c.arabic]}.webp`, alt: c.german ?? c.arabic } : undefined)),
});

// ------------------------------------------------------------------ 3 · Alaas Text
const ALAA_TEXT: PhraseItem[] = [
  ph("a2-1-t-1", "أَنَا اسْمِي عَلَاء.", "Ich heiße Alaa."),
  ph("a2-1-t-2", "أَنَا أُرْدُنِّيٌّ وَأَنَا أَسْكُنُ فِي الْقَاهِرَةِ الْآنَ.", "Ich bin Jordanier und wohne jetzt in Kairo."),
  ph("a2-1-t-3", "أَنَا أَدْرُسُ الطِّبَّ فِي جَامِعَةِ الْقَاهِرَةِ.", "Ich studiere Medizin an der Universität Kairo."),
  ph("a2-1-t-4", "هَذِهِ شَقَّتِي فِي مِنْطَقَةِ الْمُهَنْدِسِينَ.", "Das ist meine Wohnung im Viertel Muhandisin."),
  ph("a2-1-t-5", "الشَّقَّةُ بِهَا ثَلَاثُ حُجُرَاتٍ وَهِيَ وَاسِعَةٌ، نَظِيفَةٌ وَمُضِيئَةٌ.", "Die Wohnung hat drei Zimmer; sie ist geräumig, sauber und hell."),
  ph("a2-1-t-6", "حُجْرَةُ النَّوْمِ فِيهَا مَكْتَبٌ كَبِيرٌ وَدُولَابَانِ طَوِيلَانِ وَسَرِيرٌ عَرِيضٌ.", "Im Schlafzimmer gibt es einen großen Schreibtisch, zwei hohe Schränke und ein breites Bett."),
  ph("a2-1-t-7", "بِجَانِبِ السَّرِيرِ طَاوِلَتَانِ صَغِيرَتَانِ.", "Neben dem Bett stehen zwei kleine Tische."),
  ph("a2-1-t-8", "حُجْرَةُ النَّوْمِ لَيْسَ فِيهَا حَمَّامٌ.", "Im Schlafzimmer gibt es kein Bad."),
  ph("a2-1-t-9", "الْحَمَّامُ خَارِجَ الْغُرْفَةِ وَفِيهِ سَخَّانٌ كَبِيرٌ.", "Das Bad liegt außerhalb des Zimmers und hat einen großen Boiler."),
  ph("a2-1-t-10", "الْمَطْبَخُ فِيهِ دُولَابٌ بِهِ أَدَوَاتُ مَطْبَخٍ كَثِيرَةٌ.", "In der Küche steht ein Schrank mit vielen Küchengeräten."),
  ph("a2-1-t-11", "الْمَطْبَخُ بِهِ ثَلَّاجَةٌ جَدِيدَةٌ أَيْضًا.", "Die Küche hat auch einen neuen Kühlschrank."),
  ph("a2-1-t-12", "حُجْرَةُ الْمَعِيشَةِ ضَيِّقَةٌ وَلَيْسَ فِيهَا نَافِذَةٌ كَبِيرَةٌ، لَكِنَّهَا حُجْرَةٌ مُرِيحَةٌ وَفِيهَا كَنَبَتَانِ كَبِيرَتَانِ.", "Das Wohnzimmer ist eng und hat kein großes Fenster, aber es ist gemütlich und hat zwei große Sofas."),
];

const ALAA_QUESTIONS: QuizItem[] = [
  { id: "f1", arabic: "مَا اسْمُ صَاحِبِ الشَّقَّةِ؟", german: "Wie heißt der Besitzer der Wohnung?", questions: [{ prompt: "Antwort", options: ["عَلَاء", "عَادِل", "عَلِيّ"], answer: 0 }] },
  { id: "f2", arabic: "أَيْنَ يَدْرُسُ؟", german: "Wo studiert er?", questions: [{ prompt: "Antwort", options: ["فِي جَامِعَةِ الْقَاهِرَةِ", "فِي جَامِعَةِ عَمَّانَ", "فِي مَدْرَسَةٍ"], answer: 0 }] },
  { id: "f3", arabic: "مَاذَا يَدْرُسُ؟", german: "Was studiert er?", questions: [{ prompt: "Antwort", options: ["يَدْرُسُ الطِّبَّ", "يَدْرُسُ الْهَنْدَسَةَ", "يَدْرُسُ اللُّغَةَ"], answer: 0 }] },
  { id: "f4", arabic: "كَمْ حُجْرَةً فِي الشَّقَّةِ؟", german: "Wie viele Zimmer hat die Wohnung?", questions: [{ prompt: "Antwort", options: ["ثَلَاثُ حُجُرَاتٍ", "حُجْرَتَانِ", "أَرْبَعُ حُجُرَاتٍ"], answer: 0 }] },
  { id: "f5", arabic: "هَلْ فِي حُجْرَةِ النَّوْمِ حَمَّامٌ؟", german: "Gibt es im Schlafzimmer ein Bad?", questions: [{ prompt: "Antwort", options: ["لَا، لَيْسَ فِيهَا حَمَّامٌ.", "نَعَمْ، فِيهَا حَمَّامٌ."], answer: 0 }] },
  { id: "f6", arabic: "مَاذَا فِي الْمَطْبَخِ؟", german: "Was gibt es in der Küche?", questions: [{ prompt: "Antwort", options: ["فِيهِ ثَلَّاجَةٌ جَدِيدَةٌ وَدُولَابٌ.", "فِيهِ سَرِيرٌ عَرِيضٌ.", "فِيهِ كَنَبَتَانِ كَبِيرَتَانِ."], answer: 0 }] },
  { id: "f7", arabic: "كَيْفَ حُجْرَةُ الْمَعِيشَةِ؟", german: "Wie ist das Wohnzimmer?", questions: [{ prompt: "Antwort", options: ["ضَيِّقَةٌ وَلَكِنَّهَا مُرِيحَةٌ", "وَاسِعَةٌ وَمُضِيئَةٌ", "قَذِرَةٌ وَمُظْلِمَةٌ"], answer: 0 }] },
];

// ------------------------------------------------------------------ 5 · Grammatik 1: فِيهِ / فِيهَا / بِهِ / بِهَا
const PRONOUN_TABLES: TableBlock[] = [
  {
    id: "pron",
    titleArabic: "فِي + ضَمِيرٌ · بِـ + ضَمِيرٌ",
    title: "Präposition + Pronomen: „in ihr / in ihm“, „mit ihr / mit ihm“",
    columns: [
      { arabic: "النَّوْعُ", german: "Typ" },
      { arabic: "الِاسْمُ", german: "Nomen" },
      { arabic: "فِي + ضَمِيرٌ", german: "in + Pronomen" },
      { arabic: "بِـ + ضَمِيرٌ", german: "bi + Pronomen" },
      { arabic: "بَاقِي الْجُمْلَةِ", german: "Rest des Satzes" },
    ],
    rows: [
      [cell("الْمُفْرَدُ الْمُذَكَّرُ", "Singular maskulin", false), cell("الْمَطْبَخُ", "die Küche"), cell("فِيهِ"), cell("بِهِ"), cell("ثَلَّاجَةٌ جَدِيدَةٌ")],
      [cell("الْمُثَنَّى الْمُذَكَّرُ", "Dual maskulin", false), cell("الْمَطْبَخَانِ", "zwei Küchen"), cell("فِيهِمَا"), cell("بِهِمَا"), cell("ثَلَّاجَتَانِ")],
      [cell("الْمُفْرَدُ الْمُؤَنَّثُ", "Singular feminin", false), cell("الشَّقَّةُ", "die Wohnung"), cell("فِيهَا"), cell("بِهَا"), cell("ثَلَاثُ حُجُرَاتٍ")],
      [cell("الْمُثَنَّى الْمُؤَنَّثُ", "Dual feminin", false), cell("الشَّقَّتَانِ", "zwei Wohnungen"), cell("فِيهِمَا"), cell("بِهِمَا"), cell("ثَلَاثُ حُجُرَاتٍ")],
      [cell("الْجَمْعُ", "Plural (Dinge)", false), cell("الْكُتُبُ", "die Bücher"), cell("فِيهَا"), cell("بِهَا"), cell("صُوَرٌ كَثِيرَةٌ")],
    ],
    note: "Bedeutung: الشَّقَّةُ فِيهَا ثَلَاثُ حُجُرَاتٍ = الشَّقَّةُ بِهَا ثَلَاثُ حُجُرَاتٍ („Die Wohnung hat drei Zimmer.“). Das Pronomen richtet sich nach dem Nomen davor: maskulin ـهُ, feminin ـهَا, Dual ـهُمَا. Mehrere Dinge (Plural) behandelt das Arabische wie EINE feminine Sache: ـهَا.",
  },
  {
    id: "pron-sentences",
    titleArabic: "أَمْثِلَةٌ",
    title: "Beispiele",
    columns: [
      { arabic: "مِثَالٌ", german: "Beispiel" },
      { arabic: "مِثَالٌ", german: "Beispiel" },
    ],
    rows: [
      [cell("الْمَطْبَخُ فِيهِ سَخَّانٌ كَبِيرٌ.", "Die Küche hat einen großen Boiler."), cell("الْمَكْتَبَةُ بِهَا كُتُبٌ كَثِيرَةٌ.", "Die Bibliothek hat viele Bücher.")],
      [cell("الْحَقِيبَةُ فِيهَا قَلَمٌ صَغِيرٌ.", "In der Tasche ist ein kleiner Stift."), cell("الْمَكْتَبَانِ بِهِمَا مُكَيِّفَانِ.", "Die zwei Büros haben Klimaanlagen.")],
    ],
  },
];
const PRONOUN_QUIZ: TableQuiz[] = [
  { id: "g1", prompt: "الشَّقَّةُ … ثَلَاثُ حُجُرَاتٍ. Welches Wort passt?", options: ["فِيهَا", "فِيهِ", "فِيهِمَا"], answer: 0 },
  { id: "g2", prompt: "الْمَطْبَخُ … ثَلَّاجَةٌ جَدِيدَةٌ.", options: ["بِهَا", "بِهِ", "بِهِمَا"], answer: 1 },
  { id: "g3", prompt: "الْمَطْبَخَانِ … ثَلَّاجَتَانِ.", options: ["فِيهِ", "فِيهَا", "فِيهِمَا"], answer: 2 },
  { id: "g4", prompt: "الْكُتُبُ … صُوَرٌ كَثِيرَةٌ.", options: ["بِهِمَا", "بِهِ", "بِهَا"], answer: 2 },
];

// ------------------------------------------------------------------ 6 · Wörter verbinden (تدريب ١)
const CONNECT: MatchContent = {
  promptTitle: "Das Nomen",
  optionTitle: "Der Rest des Satzes",
  prompts: [
    { id: "c0", arabic: "الْحَقِيبَةُ", answer: "o0", example: true, result: { arabic: "الْحَقِيبَةُ فِيهَا قَلَمٌ صَغِيرٌ.", german: "In der Tasche ist ein kleiner Stift." } },
    { id: "c1", arabic: "الشَّارِعُ", answer: "o1", result: { arabic: "الشَّارِعُ فِيهِ سَيَّارَاتٌ قَدِيمَةٌ وَحَدِيثَةٌ.", german: "In der Straße fahren alte und moderne Autos." } },
    { id: "c2", arabic: "الْحَمَّامُ", answer: "o2", result: { arabic: "الْحَمَّامُ فِيهِ سَخَّانٌ كَبِيرٌ.", german: "Das Bad hat einen großen Boiler." } },
    { id: "c3", arabic: "الْغُرْفَةُ", answer: "o3", result: { arabic: "الْغُرْفَةُ فِيهَا سَرِيرَانِ نَظِيفَانِ.", german: "Im Zimmer stehen zwei saubere Betten." } },
    { id: "c4", arabic: "الْمَطْبَخُ", answer: "o4", result: { arabic: "الْمَطْبَخُ بِهِ دُولَابٌ عَالٍ.", german: "Die Küche hat einen hohen Schrank." } },
    { id: "c5", arabic: "الثَّلَّاجَةُ", answer: "o5", result: { arabic: "الثَّلَّاجَةُ فِيهَا طَعَامٌ كَثِيرٌ.", german: "Im Kühlschrank ist viel Essen." } },
    { id: "c6", arabic: "الْمَكْتَبَةُ", answer: "o6", result: { arabic: "الْمَكْتَبَةُ بِهَا كُتُبٌ قَدِيمَةٌ.", german: "Die Bibliothek hat alte Bücher." } },
    { id: "c7", arabic: "الْجَامِعَةُ", answer: "o7", result: { arabic: "الْجَامِعَةُ فِيهَا فُصُولٌ وَاسِعَةٌ.", german: "Die Universität hat geräumige Klassenzimmer." } },
    { id: "c8", arabic: "الْمَتْحَفُ", answer: "o8", result: { arabic: "الْمَتْحَفُ بِهِ صُوَرٌ كَثِيرَةٌ.", german: "Das Museum hat viele Bilder." } },
  ],
  options: [
    { id: "o0", label: "أ", arabic: "فِيهَا قَلَمٌ صَغِيرٌ" },
    { id: "o1", label: "ب", arabic: "فِيهِ سَيَّارَاتٌ قَدِيمَةٌ وَحَدِيثَةٌ" },
    { id: "o2", label: "ج", arabic: "فِيهِ سَخَّانٌ كَبِيرٌ" },
    { id: "o3", label: "د", arabic: "فِيهَا سَرِيرَانِ نَظِيفَانِ" },
    { id: "o4", label: "هـ", arabic: "بِهِ دُولَابٌ عَالٍ" },
    { id: "o5", label: "و", arabic: "فِيهَا طَعَامٌ كَثِيرٌ" },
    { id: "o6", label: "ز", arabic: "بِهَا كُتُبٌ قَدِيمَةٌ" },
    { id: "o7", label: "ح", arabic: "فِيهَا فُصُولٌ وَاسِعَةٌ" },
    { id: "o8", label: "ط", arabic: "بِهِ صُوَرٌ كَثِيرَةٌ" },
  ],
};

// ------------------------------------------------------------------ 7 · Grammatik 2: Adjektive
const ADJECTIVE_TABLES: TableBlock[] = [
  {
    id: "adj-agree",
    titleArabic: "الصِّفَةُ تَتْبَعُ الْمَوْصُوفَ",
    title: "Das Adjektiv folgt dem Nomen",
    columns: [
      { arabic: "الْمَوْصُوفُ وَالصِّفَةُ", german: "Nomen + Adjektiv" },
      { arabic: "الْمَوْصُوفُ وَالصِّفَةُ", german: "Nomen + Adjektiv" },
    ],
    rows: [
      [cell("كِتَابٌ كَبِيرٌ", "ein großes Buch (Singular)"), cell("كِتَابَانِ كَبِيرَانِ", "zwei große Bücher (Dual)")],
      [cell("كِتَابٌ كَبِيرٌ", "ein großes Buch (maskulin)"), cell("حَقِيبَةٌ كَبِيرَةٌ", "eine große Tasche (feminin)")],
      [cell("كِتَابٌ كَبِيرٌ", "ein großes Buch (unbestimmt)"), cell("الْكِتَابُ الْكَبِيرُ", "das große Buch (bestimmt)")],
      [cell("حَقِيبَةٌ كَبِيرَةٌ", "eine große Tasche"), cell("الْحَقِيبَةُ الْكَبِيرَةُ", "die große Tasche")],
    ],
    note: "Merke: Das Adjektiv steht NACH dem Nomen und stimmt in vier Dingen überein – Zahl (Singular/Dual), Geschlecht (+ ـَةٌ), Bestimmtheit (beide mit ال oder beide ohne) und Fall (hier: beide Nominativ).",
  },
  {
    id: "adj-plural",
    titleArabic: "الْجَمْعُ: الْعَاقِلُ وَغَيْرُ الْعَاقِلِ",
    title: "Plural: Menschen und Dinge",
    columns: [
      { arabic: "غَيْرُ الْعَاقِلِ (Dinge)", german: "Dinge: Adjektiv = feminin Singular" },
      { arabic: "الْعَاقِلُ (Menschen)", german: "Menschen: Adjektiv im Plural" },
    ],
    rows: [
      [cell("كُتُبٌ كَثِيرَةٌ", "viele Bücher"), cell("مُدَرِّسُونَ مُجْتَهِدُونَ", "fleißige Lehrer")],
      [cell("حَقَائِبُ غَالِيَةٌ", "teure Taschen"), cell("مُدَرِّسَاتٌ مُجْتَهِدَاتٌ", "fleißige Lehrerinnen")],
    ],
    note: "Das ist die wichtigste Besonderheit: Für Dinge (und Tiere) im Plural nimmt das Adjektiv die Form „feminin Singular“ (كُتُبٌ كَثِيرَةٌ). Für Menschen bekommt es einen eigenen Plural (ـُونَ für Männer, ـَاتٌ für Frauen).",
  },
  {
    id: "adj-case",
    titleArabic: "الْإِعْرَابُ",
    title: "Auch der Fall wird übernommen",
    columns: [
      { arabic: "الْمَرْفُوعُ", german: "Nominativ" },
      { arabic: "الْمَجْرُورُ", german: "Genitiv (nach Präposition)" },
    ],
    rows: [
      [cell("الْكِتَابُ الْكَبِيرُ", "das große Buch"), cell("فِي الْمَدِينَةِ الْجَمِيلَةِ", "in der schönen Stadt")],
      [cell("كِتَابٌ كَبِيرٌ", "ein großes Buch"), cell("فِي مَدِينَةٍ جَمِيلَةٍ", "in einer schönen Stadt")],
    ],
  },
];
const ADJECTIVE_QUIZ: TableQuiz[] = [
  { id: "a1", prompt: "Welches Adjektiv passt zu حَقِيبَةٌ (Tasche)?", options: ["كَبِيرٌ", "كَبِيرَةٌ", "كَبِيرَانِ"], answer: 1 },
  { id: "a2", prompt: "Welches passt zu كُتُبٌ (Bücher, Dinge)?", options: ["كَثِيرُونَ", "كَثِيرَةٌ", "كَثِيرٌ"], answer: 1 },
  { id: "a3", prompt: "Wie heißt „die großen Lehrer“ (Männer)?", options: ["الْمُدَرِّسُونَ الْكِبَارُ", "الْمُدَرِّسُ الْكَبِيرُ", "الْمُدَرِّسَةُ الْكَبِيرَةُ"], answer: 0 },
  { id: "a4", prompt: "Welche Form ist richtig? (bestimmt!)", options: ["الْبَيْتُ كَبِيرٌ جِدًّا", "الْبَيْتُ الْكَبِيرُ", "بَيْتٌ الْكَبِيرُ"], answer: 1 },
];

// ------------------------------------------------------------------ 8 · Das passende Adjektiv (تدريب ٢)
const adjectiveGaps = (...a: Array<[right: string, wrong: string[]]>): ClozePart[] => a.map(([right, wrong]) => gap([right], [right, ...wrong].sort((x, y) => x.localeCompare(y, "ar"))));
const ADJECTIVE_ITEMS: ClozeItem[] = [
  { id: "ad1", hint: "Das Beispiel aus dem Buch.", lines: [{ label: "١", parts: ["حُجْرَةُ الْمَعِيشَةِ فِي بَيْتِي ", ...adjectiveGaps(["مُضِيئَةٌ", ["مُضِيءٌ", "مُضِيئَانِ"]]), " وَأَيْضًا ", ...adjectiveGaps(["وَاسِعَةٌ", ["وَاسِعٌ", "وَاسِعَانِ"]]), "."] }] },
  { id: "ad2", lines: [{ label: "٢", parts: ["ابْنِي طِفْلٌ ", ...adjectiveGaps(["نَشِيطٌ", ["نَشِيطَةٌ", "نَشِيطَانِ"]]), " وَ", ...adjectiveGaps(["لَطِيفٌ", ["لَطِيفَةٌ", "لَطِيفَانِ"]]), "."] }] },
  { id: "ad3", lines: [{ label: "٣", parts: ["الْمَتْحَفُ بِهِ بَابَانِ ", ...adjectiveGaps(["كَبِيرَانِ", ["كَبِيرٌ", "كَبِيرَةٌ"]]), " وَ", ...adjectiveGaps(["عَالِيَانِ", ["عَالٍ", "عَالِيَةٌ"]]), "."] }] },
  { id: "ad4", lines: [{ label: "٤", parts: ["صَدِيقَتِي ", ...adjectiveGaps(["لَطِيفَةٌ", ["لَطِيفٌ", "لَطِيفُونَ"]]), " جِدًّا."] }] },
  { id: "ad5", lines: [{ label: "٥", parts: ["لَا أُحِبُّ هَذَا الْفُسْتَانَ. هَذَانِ الْفُسْتَانَانِ ", ...adjectiveGaps(["ضَيِّقَانِ", ["ضَيِّقٌ", "ضَيِّقَةٌ"]]), " وَ", ...adjectiveGaps(["قَصِيرَانِ", ["قَصِيرٌ", "قَصِيرَةٌ"]]), "."] }] },
  { id: "ad6", lines: [{ label: "٦", parts: ["مَكْتَبُ الْمُدِيرِ دَائِمًا ", ...adjectiveGaps(["نَظِيفٌ", ["نَظِيفَةٌ", "نَظِيفُونَ"]]), " وَ", ...adjectiveGaps(["كَبِيرٌ", ["كَبِيرَةٌ", "كَبِيرَانِ"]]), "."] }] },
  { id: "ad7", hint: "Dinge im Plural: Adjektiv feminin Singular.", lines: [{ label: "٧", parts: ["الْكُتُبُ فِي الْمَكْتَبَةِ ", ...adjectiveGaps(["كَثِيرَةٌ", ["كَثِيرُونَ", "كَثِيرٌ"]]), " وَ", ...adjectiveGaps(["قَدِيمَةٌ", ["قَدِيمُونَ", "قَدِيمٌ"]]), "."] }] },
  { id: "ad8", hint: "Menschen im Plural: eigener Plural.", lines: [{ label: "٨", parts: ["الْمُدَرِّسُونَ ", ...adjectiveGaps(["مُجْتَهِدُونَ", ["مُجْتَهِدَةٌ", "مُجْتَهِدٌ"]]), "."] }] },
  { id: "ad9", hint: "Menschen im Plural: eigener Plural.", lines: [{ label: "٩", parts: ["الْمُدَرِّسَاتُ ", ...adjectiveGaps(["مُجْتَهِدَاتٌ", ["مُجْتَهِدُونَ", "مُجْتَهِدَةٌ"]]), "."] }] },
];

// ------------------------------------------------------------------ 9 · Grammatik 3: Verneinen
const NEGATION_TABLES: TableBlock[] = [
  {
    id: "neg-is",
    titleArabic: "النَّفْيُ بِـ لَيْسَ",
    title: "Verneinen mit لَيْسَ: „ist nicht“",
    columns: [
      { arabic: "لِلْمُؤَنَّثِ", german: "feminin" },
      { arabic: "لِلْمُذَكَّرِ", german: "maskulin" },
    ],
    rows: [
      [cell("هَلْ هَذِهِ سَيِّدَةٌ طَوِيلَةٌ؟", "Ist das eine große Frau?"), cell("هَلْ هَذَا رَجُلٌ طَوِيلٌ؟", "Ist das ein großer Mann?")],
      [cell("هَذِهِ لَيْسَتْ سَيِّدَةً طَوِيلَةً.", "Das ist keine große Frau."), cell("لَا، هَذَا لَيْسَ رَجُلًا طَوِيلًا.", "Nein, das ist kein großer Mann.")],
      [cell("هَلْ هَذِهِ نَافِذَةٌ كَبِيرَةٌ؟", "Ist das ein großes Fenster?"), cell("هَلْ هَذَا كِتَابٌ كَبِيرٌ؟", "Ist das ein großes Buch?")],
      [cell("لَا، هَذِهِ لَيْسَتْ نَافِذَةً كَبِيرَةً.", "Nein, das ist kein großes Fenster."), cell("لَا، هَذَا لَيْسَ كِتَابًا كَبِيرًا.", "Nein, das ist kein großes Buch.")],
    ],
    note: "Regel: لَيْسَ + Nomen im Akkusativ (ـًا) + Adjektiv im Akkusativ (ـًا). Für Frauen und Dinge (feminin) heißt es لَيْسَتْ. Achte auf das ـًا: ein Wort mit Tanwin Fatha wird zum Verneinen – رَجُلٌ → رَجُلًا.",
  },
  {
    id: "neg-has",
    titleArabic: "لَيْسَ فِيهِ / بِهِ",
    title: "„Es gibt kein …“: لَيْسَ فِيهِ / لَيْسَ بِهِ",
    columns: [
      { arabic: "النَّفْيُ", german: "Verneinung" },
      { arabic: "الْإِثْبَاتُ", german: "Bejahung" },
    ],
    rows: [
      [cell("الشَّقَّةُ لَيْسَ فِيهَا ثَلَاثُ حُجُرَاتٍ.", "Die Wohnung hat nicht drei Zimmer."), cell("الشَّقَّةُ فِيهَا ثَلَاثُ حُجُرَاتٍ.", "Die Wohnung hat drei Zimmer.")],
      [cell("الشَّقَّتَانِ لَيْسَ فِيهِمَا ثَلَاثُ حُجُرَاتٍ.", "Die zwei Wohnungen haben nicht drei Zimmer."), cell("الشَّقَّتَانِ فِيهِمَا ثَلَاثُ حُجُرَاتٍ.", "Die zwei Wohnungen haben drei Zimmer.")],
      [cell("الْمَطْبَخُ لَيْسَ فِيهِ سَخَّانٌ كَبِيرٌ.", "Die Küche hat keinen großen Boiler."), cell("الْمَطْبَخُ فِيهِ سَخَّانٌ كَبِيرٌ.", "Die Küche hat einen großen Boiler.")],
      [cell("الْكُتُبُ لَيْسَ بِهَا صُوَرٌ مُلَوَّنَةٌ.", "In den Büchern sind keine bunten Bilder."), cell("الْكُتُبُ بِهَا صُوَرٌ مُلَوَّنَةٌ.", "In den Büchern sind bunte Bilder.")],
    ],
    note: "Hier bleibt لَيْسَ immer in der Grundform (لَيْسَ), und der Pronomen-Teil (فِيهَا / فِيهِ / بِهِمَا …) richtet sich wie vorhin nach dem Nomen.",
  },
];
const NEGATION_QUIZ: TableQuiz[] = [
  { id: "n1", prompt: "هَذَا رَجُلٌ طَوِيلٌ → Verneinen: هَذَا لَيْسَ …", options: ["رَجُلًا طَوِيلًا", "رَجُلٌ طَوِيلٌ", "رَجُلٍ طَوِيلٍ"], answer: 0 },
  { id: "n2", prompt: "هَذِهِ نَافِذَةٌ كَبِيرَةٌ → Verneinen: هَذِهِ …", options: ["لَيْسَ نَافِذَةً كَبِيرَةً", "لَيْسَتْ نَافِذَةً كَبِيرَةً", "لَيْسَتْ نَافِذَةٌ كَبِيرَةٌ"], answer: 1 },
  { id: "n3", prompt: "الْمَطْبَخُ فِيهِ سَخَّانٌ → Verneinen:", options: ["الْمَطْبَخُ لَيْسَ فِيهِ سَخَّانٌ", "الْمَطْبَخُ لَيْسَتْ فِيهِ سَخَّانٌ", "الْمَطْبَخُ فِيهِ لَيْسَ سَخَّانٌ"], answer: 0 },
];

// ------------------------------------------------------------------ 10 · Verneinen (تدريب ٣)
const neg = (id: string, arabic: string, right: string, wrong: [string, string]): QuizItem => ({
  id,
  arabic,
  german: "Verneine den Satz.",
  questions: [{ prompt: "Der verneinte Satz", options: [right, ...wrong].sort((a, b) => a.localeCompare(b, "ar")), answer: [right, ...wrong].sort((a, b) => a.localeCompare(b, "ar")).indexOf(right) }],
});
const NEGATION_ITEMS: QuizItem[] = [
  neg("ng1", "هَذِهِ سَيِّدَةٌ لَطِيفَةٌ.", "هَذِهِ لَيْسَتْ سَيِّدَةً لَطِيفَةً.", ["هَذِهِ لَيْسَ سَيِّدَةً لَطِيفَةً.", "هَذِهِ لَيْسَتْ سَيِّدَةٌ لَطِيفَةٌ."]),
  neg("ng2", "هَذِهِ الْحُجْرَةُ نَظِيفَةٌ جِدًّا.", "هَذِهِ الْحُجْرَةُ لَيْسَتْ نَظِيفَةً جِدًّا.", ["هَذِهِ الْحُجْرَةُ لَيْسَ نَظِيفَةً جِدًّا.", "هَذِهِ الْحُجْرَةُ لَيْسَتْ نَظِيفَةٌ جِدًّا."]),
  neg("ng3", "الْمَكْتَبَانِ بِهِمَا مُكَيِّفَانِ جَدِيدَانِ.", "الْمَكْتَبَانِ لَيْسَ بِهِمَا مُكَيِّفَانِ جَدِيدَانِ.", ["الْمَكْتَبَانِ لَيْسَا بِهِمَا مُكَيِّفَانِ جَدِيدَانِ.", "الْمَكْتَبَانِ لَيْسَ بِهِمَا مُكَيِّفَانِ جَدِيدَيْنِ."]),
  neg("ng4", "الرَّادْيُو صَوْتُهُ مُنْخَفِضٌ.", "الرَّادْيُو لَيْسَ صَوْتُهُ مُنْخَفِضًا.", ["الرَّادْيُو لَيْسَتْ صَوْتُهُ مُنْخَفِضًا.", "الرَّادْيُو لَيْسَ صَوْتُهُ مُنْخَفِضٌ."]),
  neg("ng5", "حَدِيقَةُ الْمَنْزِلِ وَاسِعَةٌ.", "حَدِيقَةُ الْمَنْزِلِ لَيْسَتْ وَاسِعَةً.", ["حَدِيقَةُ الْمَنْزِلِ لَيْسَ وَاسِعَةً.", "حَدِيقَةُ الْمَنْزِلِ لَيْسَتْ وَاسِعَةٌ."]),
  neg("ng6", "الْمَكْتَبَةُ بِهَا كُتُبٌ غَالِيَةٌ وَقَدِيمَةٌ.", "الْمَكْتَبَةُ لَيْسَ بِهَا كُتُبٌ غَالِيَةٌ وَقَدِيمَةٌ.", ["الْمَكْتَبَةُ لَيْسَتْ بِهَا كُتُبٌ غَالِيَةٌ وَقَدِيمَةٌ.", "الْمَكْتَبَةُ لَيْسَ بِهَا كُتُبٌ غَالِيَةً وَقَدِيمَةً."]),
];

// ------------------------------------------------------------------ 11–15 · Dialogues
export const samiraSalwa: Dialogue = {
  id: "a2-1-samira-salwa",
  intro: "Zwei Freundinnen sprechen über Salwas kleine Schwester Nawal und über Samiras Freundin Riham.",
  scene: { src: `${IMG}/scenes/dialogue-1-scene.webp`, alt: "Samira und Salwa sitzen auf einer Parkbank und unterhalten sich" },
  speakers: [sp("samira", "Samira", "female-1", "Samira, eine junge Frau"), sp("salwa", "Salwa", "female-2", "Salwa, eine junge Frau")],
  lines: [
    dl("a2-1-d1-1", "samira", "هَلْ نَوَالُ أُخْتُكِ كَبِيرَةٌ يَا سَلْوَى؟", "Ist deine Schwester Nawal groß, Salwa?"),
    dl("a2-1-d1-2", "salwa", "لَا، هِيَ لَيْسَتْ كَبِيرَةً، هِيَ طِفْلَةٌ صَغِيرَةٌ عُمْرُهَا سَبْعُ سَنَوَاتٍ.", "Nein, sie ist nicht groß, sie ist ein kleines Kind, sieben Jahre alt."),
    dl("a2-1-d1-3", "samira", "إِمْ، وَمَا شَكْلُهَا؟", "Hm … und wie sieht sie aus?"),
    dl("a2-1-d1-4", "salwa", "هِيَ قَصِيرَةٌ، سَمِينَةٌ، وَشَعْرُهَا طَوِيلٌ. وَمَا شَكْلُ صَدِيقَتِكِ رِيهَام؟", "Sie ist klein und dick, und ihr Haar ist lang. Und wie sieht deine Freundin Riham aus?"),
    dl("a2-1-d1-5", "samira", "صَدِيقَتِي رِيهَام رَفِيعَةٌ، قَصِيرَةٌ أَيْضًا، شَعْرُهَا طَوِيلٌ، عُمْرُهَا حَوَالَيْ عِشْرِينَ سَنَةً.", "Meine Freundin Riham ist schlank, auch klein, ihr Haar ist lang, sie ist etwa zwanzig Jahre alt."),
  ],
  question: { prompt: "مَا شَكْلُ رِيهَام؟", options: ["رَفِيعَةٌ وَقَصِيرَةٌ وَشَعْرُهَا طَوِيلٌ", "سَمِينَةٌ وَقَصِيرَةٌ", "طَوِيلَةٌ وَرَفِيعَةٌ"], answer: 0 },
};

export const safaaNawal: Dialogue = {
  id: "a2-1-safaa-nawal",
  intro: "Safaa fragt Nawal nach ihrer neuen Freundin Hanaa, nach ihrem Aussehen und ihrem Haus.",
  scene: { src: `${IMG}/scenes/dialogue-2-scene.webp`, alt: "Safaa und Nawal unterhalten sich auf dem Sofa" },
  speakers: [sp("safaa", "Safaa", "female-1", "Safaa, eine junge Frau"), sp("nawal", "Nawal", "female-2", "Nawal, eine junge Frau")],
  lines: [
    dl("a2-1-d2-1", "safaa", "كَيْفَ حَالُ صَدِيقَتِكِ الْجَدِيدَةِ يَا نَوَالُ؟", "Wie geht es deiner neuen Freundin, Nawal?"),
    dl("a2-1-d2-2", "nawal", "صَدِيقَتِي الْجَدِيدَةُ بِخَيْرٍ، اسْمُهَا هَنَاء.", "Meiner neuen Freundin geht es gut, sie heißt Hanaa."),
    dl("a2-1-d2-3", "safaa", "هَلْ تَسْكُنُ فِي شَقَّةٍ صَغِيرَةٍ؟", "Wohnt sie in einer kleinen Wohnung?"),
    dl("a2-1-d2-4", "nawal", "لَا، هِيَ لَا تَسْكُنُ فِي شَقَّةٍ صَغِيرَةٍ. هِيَ غَنِيَّةٌ وَتَسْكُنُ فِي بَيْتٍ غَالٍ كَبِيرٍ وَاسِعٍ وَلَهَا أُخْتَانِ صَغِيرَتَانِ.", "Nein, sie wohnt nicht in einer kleinen Wohnung. Sie ist reich, wohnt in einem teuren, großen, geräumigen Haus und hat zwei kleine Schwestern."),
    dl("a2-1-d2-5", "safaa", "وَمَا شَكْلُهَا؟ طَوِيلَةٌ؟ قَصِيرَةٌ؟", "Und wie sieht sie aus? Groß? Klein?"),
    dl("a2-1-d2-6", "nawal", "هَنَاء جَمِيلَةٌ، شَعْرُهَا طَوِيلٌ وَهِيَ أَيْضًا رَفِيعَةٌ وَعَيْنَاهَا سَوْدَاوَانِ.", "Hanaa ist schön, ihr Haar ist lang, sie ist auch schlank, und ihre Augen sind schwarz."),
    dl("a2-1-d2-7", "safaa", "وَهَلْ هِيَ نَشِيطَةٌ؟", "Und ist sie aktiv?"),
    dl("a2-1-d2-8", "nawal", "نَعَمْ، هِيَ نَشِيطَةٌ جِدًّا، هِيَ تَجْرِي كِيلُومِتْرَيْنِ كُلَّ يَوْمٍ، وَلَكِنَّ نَادِيَةَ أُخْتَ هَنَاء كَسْلَانَةٌ.", "Ja, sie ist sehr aktiv, sie läuft jeden Tag zwei Kilometer, aber Nadia, Hanaas Schwester, ist faul."),
    dl("a2-1-d2-9", "safaa", "وَمَا شَكْلُ نَادِيَةَ أُخْتِ هَنَاء؟", "Und wie sieht Nadia, Hanaas Schwester, aus?"),
    dl("a2-1-d2-10", "nawal", "نَادِيَةُ صَغِيرَةٌ، قَصِيرَةٌ وَبَدِينَةٌ أَيْضًا.", "Nadia ist klein, kurz und auch ein bisschen rundlich."),
    dl("a2-1-d2-11", "safaa", "وَمَا شَكْلُ بَيْتِ هَنَاء؟", "Und wie sieht Hanaas Haus aus?"),
    dl("a2-1-d2-12", "nawal", "بَيْتُهَا بِهِ حَدِيقَةٌ صَغِيرَةٌ وَضَيِّقَةٌ، لَيْسَتْ كَبِيرَةً. الْحَدِيقَةُ بِهَا أَشْجَارُ فَاكِهَةٍ، وَفِيهَا زُهُورٌ مُلَوَّنَةٌ أَيْضًا، وَحَوْلَ الْبَيْتِ سُورٌ عَالٍ وَعَرِيضٌ.", "Ihr Haus hat einen kleinen, schmalen Garten, nicht groß. Im Garten gibt es Obstbäume und auch bunte Blumen, und rund um das Haus steht eine hohe, breite Mauer."),
  ],
  question: { prompt: "مَاذَا فِي حَدِيقَةِ هَنَاء؟", options: ["أَشْجَارُ فَاكِهَةٍ وَزُهُورٌ مُلَوَّنَةٌ", "نَهْرٌ صَغِيرٌ", "سَيَّارَاتٌ قَدِيمَةٌ"], answer: 0 },
};

// ------------------------------------------------------------------ 14 · Richtig oder falsch?
const RIGHT = "صَحِيحٌ ✓";
const WRONG = "خَطَأٌ ✗";
const tf = (id: string, arabic: string, german: string, ok: boolean, image?: QuizItem["image"]): QuizItem => ({ id, arabic, german, ...(image ? { image } : {}), questions: [{ prompt: "Richtig oder falsch?", options: [RIGHT, WRONG], answer: ok ? 0 : 1 }] });
const TRUE_FALSE: QuizItem[] = [
  tf("tf1", "حَدِيقَةُ هَنَاء ضَيِّقَةٌ.", "Hanaas Garten ist schmal.", true, { src: `${IMG}/scenes/hana-house.webp`, alt: "Hanaas Haus mit Garten, Obstbäumen, Blumen und einer hohen Mauer", wide: true }),
  tf("tf2", "حَدِيقَةُ هَنَاء وَاسِعَةٌ.", "Hanaas Garten ist geräumig.", false),
  tf("tf3", "فِي الْحَدِيقَةِ زُهُورٌ مُلَوَّنَةٌ.", "Im Garten gibt es bunte Blumen.", true),
  tf("tf4", "حَدِيقَةُ هَنَاء فِيهَا نَهْرٌ صَغِيرٌ.", "In Hanaas Garten gibt es einen kleinen Fluss.", false),
  tf("tf5", "حَوْلَ الْبَيْتِ سُورٌ عَالٍ.", "Um das Haus steht eine hohe Mauer.", true),
  tf("tf6", "هَنَاء كَسْلَانَةٌ.", "Hanaa ist faul.", false),
  tf("tf7", "نَادِيَةُ أُخْتُ هَنَاء كَسْلَانَةٌ.", "Nadia, Hanaas Schwester, ist faul.", true),
  tf("tf8", "هَنَاء تَسْكُنُ فِي شَقَّةٍ صَغِيرَةٍ.", "Hanaa wohnt in einer kleinen Wohnung.", false),
];

// ------------------------------------------------------------------ 16 · Marks Brief
const LETTER: PhraseItem[] = [
  ph("a2-1-l-1", "أُسْرَتِي الْعَزِيزَةُ، بَعْدَ التَّحِيَّةِ،", "Liebe Familie, nach dem Gruß,"),
  ph("a2-1-l-2", "أَنَا فِي مِصْرَ الْآنَ.", "ich bin jetzt in Ägypten."),
  ph("a2-1-l-3", "الْقَاهِرَةُ مَدِينَةٌ كَبِيرَةٌ وَضَخْمَةٌ.", "Kairo ist eine große, riesige Stadt."),
  ph("a2-1-l-4", "بِهَا مَنَاطِقُ كَثِيرَةٌ مِثْلُ الْمُهَنْدِسِينَ وَشُبْرَا وَمِصْرَ الْجَدِيدَةِ وَالنُّزْهَةِ وَالدُّقِّي وَغَيْرِهَا.", "Sie hat viele Viertel, wie Muhandisin, Schubra, Heliopolis, Nuzha, Dokki und andere."),
  ph("a2-1-l-5", "الْمَدِينَةُ بِهَا نَهْرٌ طَوِيلٌ اسْمُهُ نَهْرُ النِّيلِ.", "In der Stadt fließt ein langer Fluss namens Nil."),
  ph("a2-1-l-6", "الْقَاهِرَةُ فِيهَا آثَارٌ فِرْعَوْنِيَّةٌ مِثْلُ الْأَهْرَامِ وَأَبِي الْهَوْلِ فِي مِنْطَقَةِ الْجِيزَةِ وَالْمَتْحَفِ الْمِصْرِيِّ فِي مَيْدَانِ التَّحْرِيرِ.", "In Kairo gibt es pharaonische Denkmäler wie die Pyramiden und die Sphinx in Gizeh und das Ägyptische Museum am Tahrir-Platz."),
  ph("a2-1-l-7", "الْقَاهِرَةُ بِهَا آثَارٌ إِسْلَامِيَّةٌ رَائِعَةٌ فِي مِنْطَقَةِ الْأَزْهَرِ وَخَانِ الْخَلِيلِيِّ.", "Kairo hat auch herrliche islamische Denkmäler im Viertel al-Azhar und im Khan al-Khalili."),
  ph("a2-1-l-8", "مِنْطَقَةُ مِصْرَ الْقَدِيمَةِ بِهَا آثَارٌ قِبْطِيَّةٌ مِثْلُ الْكَنِيسَةِ الْمُعَلَّقَةِ وَالْمَتْحَفِ الْقِبْطِيِّ.", "Im Viertel Alt-Kairo gibt es koptische Denkmäler wie die Hängende Kirche und das Koptische Museum."),
  ph("a2-1-l-9", "الْجَوُّ مُعْتَدِلٌ فِي الْخَرِيفِ.", "Das Wetter ist im Herbst mild."),
  ph("a2-1-l-10", "أَنَا سَعِيدٌ بِدِرَاسَةِ اللُّغَةِ الْعَرَبِيَّةِ هُنَا.", "Ich freue mich, hier Arabisch zu lernen."),
  ph("a2-1-l-11", "الْمِصْرِيُّونَ يُحِبُّونَ الضُّيُوفَ وَالسُّيَّاحَ. ابْنُكُمْ مَارِك.", "Die Ägypter lieben Gäste und Touristen. Euer Sohn Mark."),
];
const LETTER_QUESTIONS: QuizItem[] = [
  { id: "q1", arabic: "أَيْنَ مَارِك الْآنَ؟", german: "Wo ist Mark jetzt?", questions: [{ prompt: "Antwort", options: ["فِي مِصْرَ", "فِي الْأُرْدُنِّ", "فِي أَلْمَانْيَا"], answer: 0 }] },
  { id: "q2", arabic: "مَا اسْمُ النَّهْرِ الطَّوِيلِ فِي الْقَاهِرَةِ؟", german: "Wie heißt der lange Fluss in Kairo?", image: { src: `${IMG}/scenes/nile.webp`, alt: "Ein Fluss bei Sonnenuntergang mit Segelboot", wide: true }, questions: [{ prompt: "Antwort", options: ["نَهْرُ النِّيلِ", "نَهْرُ الْأَمَازُونِ", "نَهْرُ الْفُرَاتِ"], answer: 0 }] },
  { id: "q3", arabic: "أَيْنَ الْأَهْرَامُ وَأَبُو الْهَوْلِ؟", german: "Wo stehen die Pyramiden und die Sphinx?", image: { src: `${IMG}/scenes/pyramids-sphinx.webp`, alt: "Die Pyramiden und die Sphinx in der Wüste", wide: true }, questions: [{ prompt: "Antwort", options: ["فِي مِنْطَقَةِ الْجِيزَةِ", "فِي مَيْدَانِ التَّحْرِيرِ", "فِي خَانِ الْخَلِيلِيِّ"], answer: 0 }] },
  { id: "q4", arabic: "كَيْفَ الْجَوُّ فِي الْخَرِيفِ؟", german: "Wie ist das Wetter im Herbst?", questions: [{ prompt: "Antwort", options: ["مُعْتَدِلٌ", "بَارِدٌ جِدًّا", "حَارٌّ جِدًّا"], answer: 0 }] },
  { id: "q5", arabic: "مَاذَا يُحِبُّ الْمِصْرِيُّونَ؟", german: "Was mögen die Ägypter?", questions: [{ prompt: "Antwort", options: ["الضُّيُوفَ وَالسُّيَّاحَ", "الطَّقْسَ الْبَارِدَ", "الْمُتْحَفَ الْقِبْطِيَّ فَقَطْ"], answer: 0 }] },
];

// ------------------------------------------------------------------ 18 · Meine Wohnung beschreiben
const MY_FLAT: PhraseItem[] = [
  ph("a2-1-m-1", "شَقَّتِي فِيهَا ثَلَاثُ حُجُرَاتٍ.", "Meine Wohnung hat drei Zimmer."),
  ph("a2-1-m-2", "حُجْرَةُ النَّوْمِ وَاسِعَةٌ وَمُضِيئَةٌ.", "Das Schlafzimmer ist geräumig und hell."),
  ph("a2-1-m-3", "الْمَطْبَخُ فِيهِ ثَلَّاجَةٌ جَدِيدَةٌ.", "In der Küche steht ein neuer Kühlschrank."),
  ph("a2-1-m-4", "حُجْرَةُ الْمَعِيشَةِ لَيْسَتْ كَبِيرَةً لَكِنَّهَا مُرِيحَةٌ.", "Das Wohnzimmer ist nicht groß, aber gemütlich."),
  ph("a2-1-m-5", "الْحَمَّامُ نَظِيفٌ وَلَيْسَ فِيهِ نَافِذَةٌ.", "Das Bad ist sauber und hat kein Fenster."),
  ph("a2-1-m-6", "الْحَدِيقَةُ بِهَا أَشْجَارٌ عَالِيَةٌ وَزُهُورٌ مُلَوَّنَةٌ.", "Im Garten gibt es hohe Bäume und bunte Blumen."),
];

// ------------------------------------------------------------------ 19 · Hörcheck
const hear = (id: string, spoken: string, wrong: [string, string]): QuizItem => {
  const options = [spoken, ...wrong].sort((a, b) => a.localeCompare(b, "ar"));
  return { id, arabic: spoken, show: false, questions: [{ prompt: "Was hörst du?", options, answer: options.indexOf(spoken) }] };
};
const HEAR: QuizItem[] = [
  hear("h1", "الشَّقَّةُ بِهَا ثَلَاثُ حُجُرَاتٍ.", ["الشَّقَّةُ بِهِ ثَلَاثُ حُجُرَاتٍ.", "الشَّقَّتَانِ بِهِمَا ثَلَاثُ حُجُرَاتٍ."]),
  hear("h2", "الْمَطْبَخُ فِيهِ ثَلَّاجَةٌ جَدِيدَةٌ.", ["الْمَطْبَخُ فِيهَا ثَلَّاجَةٌ جَدِيدَةٌ.", "الْمَطْبَخَانِ فِيهِمَا ثَلَّاجَتَانِ جَدِيدَتَانِ."]),
  hear("h3", "هَذِهِ لَيْسَتْ سَيِّدَةً طَوِيلَةً.", ["هَذَا لَيْسَ رَجُلًا طَوِيلًا.", "هَذِهِ سَيِّدَةٌ طَوِيلَةٌ."]),
  hear("h4", "الْكُتُبُ كَثِيرَةٌ.", ["الْكُتُبُ كَثِيرُونَ.", "الْكِتَابُ كَثِيرٌ."]),
  hear("h5", "الْمَكْتَبَانِ جَدِيدَانِ.", ["الْمَكْتَبُ جَدِيدٌ.", "الْمَكْتَبَةُ جَدِيدَةٌ."]),
  hear("h6", "الْغُرْفَةُ مُضِيئَةٌ وَلَيْسَتْ ضَيِّقَةً.", ["الْغُرْفَةُ مُظْلِمَةٌ وَضَيِّقَةٌ.", "الْغُرْفَةُ مُضِيئَةٌ وَضَيِّقَةٌ."]),
];

// ------------------------------------------------------------------ the lesson
export const a2Shaqqati: A1Lesson = {
  slug: "shaqqati",
  kind: "topic",
  label: "شَقَّتِي الْجَدِيدَةُ",
  labelGerman: "Meine neue Wohnung",
  steps: [
    {
      slug: "step-1",
      kind: "words",
      title: "Wortschatz: Dinge und Orte",
      navLabel: "Dinge & Orte",
      instruction: {
        arabic: "اِسْمَعِ الْكَلِمَةَ ثُمَّ كَرِّرْهَا.",
        german: "Hör jedes Wort an und sprich es nach. Die Wörter stehen als Gegensatzpaare nebeneinander – lerne immer beide zusammen.",
        note: "Ziel dieser Lektion: Du beschreibst Dinge, Orte und Menschen – und du kannst sagen, was etwas hat oder nicht hat.",
      },
      groups: [oppositeWords(OPPOSITES[0]!)],
    },
    {
      slug: "step-2",
      kind: "words",
      title: "Wortschatz: Menschen",
      navLabel: "Menschen",
      instruction: {
        arabic: "اِسْمَعِ الْكَلِمَةَ ثُمَّ كَرِّرْهَا.",
        german: "Jetzt die Adjektive für Menschen: Aussehen und Charakter. Hör zu und sprich nach.",
        note: "Für Frauen kommt ـَةٌ dazu: طَوِيلٌ → طَوِيلَةٌ.",
      },
      groups: [oppositeWords(OPPOSITES[1]!)],
    },
    {
      slug: "step-3",
      kind: "words",
      title: "Wortschatz: Mehr Adjektive",
      navLabel: "Mehr Adjektive",
      instruction: {
        arabic: "اِسْمَعِ الْكَلِمَةَ ثُمَّ كَرِّرْهَا.",
        german: "Noch mehr Paare aus Übung 2 des Buches: Lerne das Wort und sein Gegenteil zusammen.",
      },
      groups: [oppositeWords(OPPOSITES[2]!)],
    },
    {
      slug: "step-4",
      kind: "words",
      title: "Wortschatz: Räume der Wohnung",
      navLabel: "Räume",
      instruction: {
        arabic: "اِسْمَعِ الْكَلِمَةَ ثُمَّ كَرِّرْهَا.",
        german: "Hör die Wörter für die Räume der Wohnung an und sprich sie nach.",
        note: "حُجْرَةُ النَّوْمِ ist wörtlich „Zimmer des Schlafes“: zwei Nomen hintereinander (Idafa).",
      },
      groups: [homeWords(WORDS_HOME[0]!)],
    },
    {
      slug: "step-5",
      kind: "words",
      title: "Wortschatz: Möbel und Geräte",
      navLabel: "Möbel",
      instruction: {
        arabic: "اِسْمَعِ الْكَلِمَةَ ثُمَّ كَرِّرْهَا.",
        german: "Hör die Wörter für Möbel und Geräte an und sprich sie nach.",
      },
      groups: [homeWords(WORDS_HOME[1]!)],
    },
    {
      slug: "step-6",
      kind: "words",
      title: "Wortschatz: Orte in der Stadt",
      navLabel: "Orte",
      instruction: {
        arabic: "اِسْمَعِ الْكَلِمَةَ ثُمَّ كَرِّرْهَا.",
        german: "Hör die Wörter für Orte in der Stadt an und sprich sie nach.",
      },
      groups: [homeWords(WORDS_HOME[2]!)],
    },
    {
      slug: "step-7",
      kind: "phrases",
      guided: true,
      title: "Lesen: Alaas Wohnung",
      navLabel: "Text",
      instruction: {
        arabic: "اِقْرَأِ النَّصَّ وَاسْمَعْهُ ثُمَّ كَرِّرْ جُمْلَةً جُمْلَةً.",
        german: "Alaa beschreibt seine Wohnung. Höre jeden Satz, lies mit und sprich ihn nach.",
        note: "Tipp: Lies erst leise, dann höre zu, dann sprich nach. Beim zweiten Durchgang achtest du auf die Adjektive hinter den Nomen.",
      },
      groups: [
        {
          id: "alaa-text",
          image: { src: `${IMG}/scenes/shaqqati-plan.webp`, alt: "Grundriss von Alaas Wohnung: Schlafzimmer, Wohnzimmer, Küche und Bad" },
          title: "Mein Name ist Alaa …",
          titleArabic: "النَّصُّ: شَقَّتِي",
          note: "Achte auf فِيهَا / بِهَا / فِيهِ / بِهِ – das ist die Grammatik der nächsten Schritte.",
          items: ALAA_TEXT,
        },
      ],
    },
    {
      slug: "step-8",
      kind: "quiz",
      title: "Fragen zum Text",
      navLabel: "Fragen",
      instruction: {
        arabic: "اِقْرَأِ النَّصَّ مَرَّةً أُخْرَى وَأَجِبْ.",
        german: "Beantworte die Fragen zu Alaas Text. Tippe auf Anhören, wenn du die Frage hören möchtest.",
      },
      items: ALAA_QUESTIONS,
    },
    {
      slug: "step-9",
      kind: "table",
      title: "Grammatik: فِيهِ · فِيهَا · بِهِ · بِهَا",
      navLabel: "فِيهِ / فِيهَا",
      instruction: {
        arabic: "لَاحِظِ الْقَوَاعِدَ: أَوَّلًا الْمَعْنَى، ثَانِيًا الضَّمِيرُ.",
        german: "Wie sagst du „Die Wohnung hat drei Zimmer“? Mit فِي oder بِـ plus Pronomen. Das Pronomen richtet sich nach dem Nomen.",
      },
      tables: PRONOUN_TABLES,
      quiz: PRONOUN_QUIZ,
    },
    {
      slug: "step-10",
      kind: "match",
      title: "Wörter verbinden",
      navLabel: "Verbinden",
      instruction: {
        arabic: "صِلِ الْكَلِمَاتِ لِتَكُونَ جُمْلَةً صَحِيحَةً. مِثَالٌ: الْحَقِيبَةُ فِيهَا قَلَمٌ صَغِيرٌ.",
        german: "Verbinde jedes Nomen mit dem passenden Satzrest. Prüfe dabei, ob das Pronomen (فِيهِ / فِيهَا / بِهِ / بِهَا) zum Nomen passt.",
      },
      match: CONNECT,
    },
    {
      slug: "step-11",
      kind: "table",
      title: "Grammatik: Das Adjektiv",
      navLabel: "Adjektive",
      instruction: {
        arabic: "لَاحِظِ الْقَوَاعِدَ: الصِّفَاتُ.",
        german: "Das Adjektiv stimmt mit dem Nomen überein – in Zahl, Geschlecht, Bestimmtheit und Fall. Bei Dingen im Plural gilt eine Sonderregel.",
      },
      tables: ADJECTIVE_TABLES,
      quiz: ADJECTIVE_QUIZ,
    },
    {
      slug: "step-12",
      kind: "cloze",
      title: "Das passende Adjektiv",
      navLabel: "Adjektive üben",
      instruction: {
        arabic: "اخْتَرْ كَلِمَةً مُنَاسِبَةً مِنَ الصِّفَاتِ وَأَكْمِلِ الْجُمْلَةَ.",
        german: "Wähle das Adjektiv in der richtigen Form: Zahl, Geschlecht – und denke an die Regel für Dinge und Menschen im Plural.",
      },
      items: ADJECTIVE_ITEMS,
    },
    {
      slug: "step-13",
      kind: "table",
      title: "Grammatik: Verneinen mit لَيْسَ",
      navLabel: "Verneinen",
      instruction: {
        arabic: "لَاحِظِ النَّفْيَ: لَيْسَ + اسْمٌ مَنْصُوبٌ + صِفَةٌ مَنْصُوبَةٌ.",
        german: "Mit لَيْسَ verneinst du Nominalsätze. Das Nomen und sein Adjektiv stehen danach im Akkusativ (ـًا).",
      },
      tables: NEGATION_TABLES,
      quiz: NEGATION_QUIZ,
    },
    {
      slug: "step-14",
      kind: "quiz",
      title: "Verneinen üben",
      navLabel: "Verneinen üben",
      instruction: {
        arabic: "اكْتُبْ هَذِهِ الْجُمَلَ فِي النَّفْيِ كَالْمِثَالِ.",
        german: "Wähle die richtige verneinte Form. Achte auf لَيْسَ / لَيْسَتْ und auf das ـًا.",
      },
      items: NEGATION_ITEMS,
    },
    {
      slug: "step-15",
      kind: "dialogue",
      mode: "listen",
      title: "Hören: Samira und Salwa",
      navLabel: "Dialog 1",
      instruction: {
        arabic: "اِقْرَأْ هَذَا الْحِوَارَ مَعَ زَمِيلِكَ وَكَرِّرْهُ. مَا شَكْلُ رِيهَام؟",
        german: "Zuerst hören, mitlesen, dann die Frage beantworten: Wie sieht Riham aus?",
      },
      dialogue: samiraSalwa,
    },
    {
      slug: "step-16",
      kind: "dialogue",
      mode: "repeat",
      title: "Nachsprechen: Dialog 1",
      navLabel: "Nachsprechen 1",
      instruction: {
        arabic: "كَرِّرْ بَعْدَ الْمُدَرِّسِ.",
        german: "Sprich jede Zeile nach. Achte auf die Endungen der Adjektive (ـَةٌ bei Frauen).",
      },
      dialogue: samiraSalwa,
    },
    {
      slug: "step-17",
      kind: "dialogue",
      mode: "listen",
      title: "Hören: Safaa und Nawal",
      navLabel: "Dialog 2",
      instruction: {
        arabic: "اِسْمَعْ هَذَا الْحِوَارَ: صَدِيقَتُنَا هَنَاء.",
        german: "Hör zu, lies mit und beantworte die Frage.",
        note: "Neue Wörter zum Dialog: فَقِيرٌ (arm) · سُورٌ (Mauer) · أَشْجَارٌ (Bäume) · زُهُورٌ (Blumen) · نَهْرٌ (Fluss) · رَفِيعٌ (schlank) · فَاكِهَةٌ (Obst).",
      },
      dialogue: safaaNawal,
    },
    {
      slug: "step-18",
      kind: "quiz",
      title: "Richtig oder falsch?",
      navLabel: "Richtig / falsch",
      instruction: {
        arabic: "ضَعْ عَلَامَةَ صَحٍّ (✓) أَوْ خَطَأٍ (✗).",
        german: "Hanaa im Dialog: Stimmt die Aussage? Hör sie an und entscheide.",
      },
      items: TRUE_FALSE,
    },
    {
      slug: "step-19",
      kind: "dialogue",
      mode: "roleplay",
      title: "Rollenspiel: Dialog 2",
      navLabel: "Rollenspiel",
      instruction: {
        arabic: "اِسْمَعْ ثُمَّ أَجِبْ: أَنْتَ نَوَالُ.",
        german: "Du übernimmst eine Rolle und sprichst ihre Zeilen. Danach tauschst du die Rollen.",
      },
      dialogue: safaaNawal,
    },
    {
      slug: "step-20",
      kind: "phrases",
      guided: true,
      title: "Lesen: Marks Brief",
      navLabel: "Brief",
      instruction: {
        arabic: "قِرَاءَةٌ (١): مَدِينَةُ الْقَاهِرَةِ.",
        german: "Mark, ein Student, schreibt seiner Familie aus Kairo. Hör jeden Satz, lies mit und sprich nach.",
        note: "Neue Wörter: مَنَاطِقُ (Viertel) · ضَخْمَةٌ (riesig) · آثَارٌ (Denkmäler) · فِرْعَوْنِيَّةٌ (pharaonisch) · قِبْطِيَّةٌ (koptisch) · رَائِعَةٌ (herrlich) · الضُّيُوفُ (Gäste).",
      },
      groups: [{ id: "mark-letter", title: "Ein Brief aus Kairo", titleArabic: "نَصُّ الرِّسَالَةِ", image: { src: `${IMG}/scenes/khan-el-khalili.webp`, alt: "Ein Markt in der Altstadt von Kairo" }, items: LETTER }],
    },
    {
      slug: "step-21",
      kind: "quiz",
      title: "Fragen zum Brief",
      navLabel: "Fragen zum Brief",
      instruction: {
        arabic: "اِقْرَأِ النَّصَّ ثُمَّ أَجِبْ.",
        german: "Beantworte die Fragen zu Marks Brief.",
      },
      items: LETTER_QUESTIONS,
    },
    {
      slug: "step-22",
      kind: "phrases",
      guided: true,
      title: "Sprechen: Meine Wohnung",
      navLabel: "Meine Wohnung",
      instruction: {
        arabic: "صِفْ شَقَّتَكَ.",
        german: "Jetzt bist du dran: Sprich die Sätze nach und tausche danach Wörter gegen deine eigenen aus (Zimmer, Adjektive, Möbel).",
        note: "Beispiel: شَقَّتِي فِيهَا حُجْرَتَانِ. → شَقَّتِي فِيهَا أَرْبَعُ حُجُرَاتٍ. Schreib dir drei eigene Sätze auf – das ist die Aufgabe des Buches (تدريب ١٢).",
      },
      groups: [{ id: "my-flat", title: "Ich beschreibe meine Wohnung", titleArabic: "أَصِفُ شَقَّتِي", items: MY_FLAT }],
    },
    {
      slug: "step-23",
      kind: "quiz",
      title: "Hörcheck",
      navLabel: "Hörcheck",
      instruction: {
        arabic: "اِسْمَعْ وَاخْتَرِ الْجُمْلَةَ الصَّحِيحَةَ.",
        german: "Zum Abschluss: Hör den Satz und wähle, was du gehört hast. Jede falsche Antwort unterscheidet sich nur in einer Endung.",
      },
      items: HEAR,
    },
  ],
};
