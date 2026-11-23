import type { A1Lesson, ClozeItem, FreeGapItem, ClozePart, CompareItem, Dialogue, DialogueSpeaker, MatchContent, NumberWord, PhraseItem, QuizItem, A1Word, WordGroup, TableBlock, TableCell } from "@/data/types";
import { transliterate } from "@/lib/arabic/transliterate";

import { unvocalised } from "../../a1/letter-lesson";

// A2 · Lektion 1 – الوحدة الأولى · تقديم (١) "شَقَّتِي الْجَدِيدَةُ" (book "لغتنا الفصحى 2", pages 16–34).
//
// The lesson follows the book page by page, in the book's order – nothing is added that the book does not have:
//   p. 16  تقديم (١)        the seven picture pairs (adjective – opposite)                 [words]
//   p. 17  the flat's plan, "read the text and answer", "read again and complete"        [quiz · cloze]
//   p. 18  النص ٣            Alaa's text                                                  [phrases]
//   p. 19  لاحظ القواعد ٤    فِيهِ / فِيهَا / بِهِ / بِهَا                                  [table]
//   p. 20  القاعدة ٥         النفي: لَيْسَ فِيهِ / بِهِ                                     [table]
//   p. 21  تدريب ١           connect the words                                            [match]
//   p. 22  القواعد ٦ ٧ ٨     the adjective follows the noun                                [table]
//   p. 23  لاحظ: النفي       لَيْسَ + noun + adjective (accusative)                        [table]
//   p. 24  تدريب ٢           the adjectives and their opposites (two tables) + the gaps    [words · cloze]
//   p. 25  تدريب ٣ / ٤       negation; complete the sentence                              [quiz · cloze]
//   p. 26  تدريب ٧           a suitable adjective                                         [cloze]
//   p. 27  تدريب ٨ أ         dialogue Samira · Salwa                                      [dialogue]
//   p. 28  تدريب ٨ ب         dialogue Safaa · Nawal, the questions, true / false          [dialogue · quiz]
//   p. 30  قراءة ١ / تدريب ٩  Mark's letter, the questions                                 [phrases · quiz · cloze · match]
//   p. 32  تدريب ١١ ١٢        put the words in order; complete the sentences (free)         [sentences · worksheet]
//   p. 33  تدريب ١٣          the advertisements and their tasks                           [worksheet]
//   p. 34  تدريب ١٤ ١٥        conversation 1 and 2 (written here: a description, a table)    [worksheet]
// Not in the app (the book has no text to work with): تدريب ٥ ٦ ١٠ (website).
// Pronunciation rules of the evaluated lines: scripts/a1-rules.ts.

const IMG = "/images/a2/unit-1";

const strip = (arabic: string) => unvocalised(arabic).replace(/[.؟?!،,:()–-]/g, " ").replace(/\s+/g, " ").trim();
/** Samira and Salwa have portraits taken from the park-bench picture; the others keep their drawn avatar. */
const PORTRAIT = new Set(["samira", "salwa"]);
const sp = (id: string, name: string, voice: DialogueSpeaker["voice"], alt: string): DialogueSpeaker => ({ id, name, voice, avatar: { src: `${IMG}/${id}.${PORTRAIT.has(id) ? "webp" : "svg"}`, alt } });
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
const toWord = (id: string, arabic: string, german: string, image?: { src: string; alt: string }): A1Word => ({
  id,
  arabic,
  german,
  transliteration: transliterate(arabic),
  ...(image ? { image } : {}),
  exercise: { id, target: strip(arabic), modelText: arabic },
});

/** A gap of a cloze line: the right word(s) plus wrong forms, in Arabic alphabetical order so the position gives nothing away. */
const g = (accept: string[], wrong: string[]): ClozePart => ({ accept, options: [...accept, ...wrong].sort((x, y) => x.localeCompare(y, "ar")) });

// ------------------------------------------------------------------ p. 16 · the seven picture pairs
// "ادرس هذه الكلمات ثم اكتب الرقم أمام الصفة التي تسمعها" – the book's pairs, in its order (right picture first).
const PAIRS_P16: Array<[left: [string, string, string, string], right: [string, string, string, string]]> = [
  [["p16-1a", "قَدِيمٌ", "alt", "o-old"], ["p16-1b", "جَدِيدٌ", "neu", "o-new"]],
  [["p16-2a", "عَرِيضٌ", "breit", "o-wide"], ["p16-2b", "ضَيِّقٌ", "schmal", "o-narrow-2"]],
  [["p16-3a", "مُرْتَفِعٌ", "hoch", "o-high"], ["p16-3b", "مُنْخَفِضٌ", "niedrig", "o-low"]],
  [["p16-4a", "وَاسِعٌ", "weit, geräumig", "o-spacious"], ["p16-4b", "ضَيِّقٌ", "eng", "o-narrow"]],
  [["p16-5a", "مُضِيءٌ", "hell", "o-bright"], ["p16-5b", "مُظْلِمٌ", "dunkel", "o-dark"]],
  [["p16-6a", "نَظِيفٌ", "sauber", "o-clean"], ["p16-6b", "قَذِرٌ", "schmutzig", "o-dirty"]],
  [["p16-7a", "طَوِيلٌ", "groß, lang", "t-tall"], ["p16-7b", "قَصِيرٌ", "klein, kurz", "t-short"]],
];
const P16: WordGroup = {
  id: "p16",
  title: "Die sieben Bildpaare",
  titleArabic: "تَقْدِيمٌ (١)",
  paired: true,
  words: PAIRS_P16.flat().map(([id, arabic, german, image]) => toWord(`a2-1-${id}`, arabic, german, { src: `${IMG}/opposites/${image}.webp`, alt: german })),
};

// ------------------------------------------------------------------ p. 18 · Alaas Text
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

// p. 17: "ما اسم صاحب الشقة؟ أين يدرس؟ ماذا يدرس؟"
const ALAA_QUESTIONS: QuizItem[] = [
  { id: "f1", arabic: "مَا اسْمُ صَاحِبِ الشَّقَّةِ؟", german: "Wie heißt der Besitzer der Wohnung?", questions: [{ prompt: "Antwort", options: ["عَلَاء", "مَارِك", "أَحْمَد"], answer: 0 }] },
  { id: "f2", arabic: "أَيْنَ يَدْرُسُ؟", german: "Wo studiert er?", questions: [{ prompt: "Antwort", options: ["فِي جَامِعَةِ الْقَاهِرَةِ", "فِي جَامِعَةِ تُونُسَ", "فِي الْمُهَنْدِسِينَ"], answer: 0 }] },
  { id: "f3", arabic: "مَاذَا يَدْرُسُ؟", german: "Was studiert er?", questions: [{ prompt: "Antwort", options: ["يَدْرُسُ الطِّبَّ", "يَدْرُسُ اللُّغَةَ", "يَدْرُسُ الْهَنْدَسَةَ"], answer: 0 }] },
];

// p. 17: "اقرأ مرة أخرى وأكمل"
const R = ["مَكْتَبٌ", "دُولَابَانِ", "سَرِيرٌ", "حَمَّامٌ"];
const ALAA_GAPS: ClozeItem[] = [
  {
    id: "ag1",
    lines: [
      {
        label: "١",
        parts: [
          "الشَّقَّةُ فِيهَا ",
          g(["ثَلَاثُ"], ["ثَلَاثَةُ", "ثَلَاثٌ"]),
          " حُجُرَاتٍ. حُجْرَةُ النَّوْمِ فِيهَا ",
          { accept: R.slice(0, 3), options: [...R].sort((x, y) => x.localeCompare(y, "ar")) },
          " وَ",
          { accept: R.slice(0, 3), options: [...R].sort((x, y) => x.localeCompare(y, "ar")) },
          " وَ",
          { accept: R.slice(0, 3), options: [...R].sort((x, y) => x.localeCompare(y, "ar")) },
          " وَلَيْسَ فِيهَا ",
          { accept: [R[3]!], options: [...R].sort((x, y) => x.localeCompare(y, "ar")) },
          ".",
        ],
      },
    ],
  },
  {
    id: "ag2",
    lines: [
      {
        label: "٢",
        parts: [
          "الْحَمَّامُ فِيهِ ",
          g(["سَخَّانٌ"], ["ثَلَّاجَةٌ", "كَنَبَتَانِ", "دُولَابٌ"]),
          ". الْمَطْبَخُ فِيهِ ",
          { accept: ["دُولَابٌ", "ثَلَّاجَةٌ"], options: ["ثَلَّاجَةٌ", "دُولَابٌ", "سَخَّانٌ", "سَرِيرٌ"].sort((x, y) => x.localeCompare(y, "ar")) },
          ".",
        ],
      },
    ],
  },
  {
    id: "ag3",
    lines: [{ label: "٣", parts: ["حُجْرَةُ الْمَعِيشَةِ فِيهَا ", g(["كَنَبَتَانِ"], ["نَافِذَةٌ", "حَمَّامٌ", "مَكْتَبٌ"]), " وَلَيْسَ فِيهَا ", g(["نَافِذَةٌ"], ["كَنَبَتَانِ", "حَمَّامٌ", "مَكْتَبٌ"]), "."] }],
  },
];

// ------------------------------------------------------------------ p. 19 · لاحظ القواعد ٤
const RULE_4: TableBlock[] = [
  {
    id: "r4-meaning",
    titleArabic: "أَوَّلًا: الْمَعْنَى",
    title: "Erstens: die Bedeutung",
    columns: [
      { arabic: "بِهَا", german: "mit بِ" },
      { arabic: "فِيهَا", german: "mit فِي" },
    ],
    rows: [[cell("الشَّقَّةُ بِهَا ثَلَاثُ حُجُرَاتٍ", "Die Wohnung hat drei Zimmer."), cell("الشَّقَّةُ فِيهَا ثَلَاثُ حُجُرَاتٍ", "Die Wohnung hat drei Zimmer.")]],
  },
  {
    id: "r4-pronoun",
    titleArabic: "ثَانِيًا: لَاحِظِ الضَّمِيرَ مَعَ الْمُذَكَّرِ أَوِ الْمُؤَنَّثِ أَوِ الْجَمْعِ مِنَ الْأَشْيَاءِ",
    title: "Zweitens: das Pronomen bei maskulin, feminin und Plural (Dinge)",
    columns: [
      { arabic: "النَّوْعُ", german: "Art" },
      { arabic: "الِاسْمُ", german: "Nomen" },
      { arabic: "الْحَرْفُ + الضَّمِيرُ", german: "Präposition + Pronomen" },
      { arabic: "بَاقِي الْجُمْلَةِ", german: "Rest des Satzes" },
    ],
    rows: [
      [cell("الْمُفْرَدُ الْمُذَكَّرُ", "Singular maskulin", false), cell("الْمَطْبَخُ", "die Küche"), cell("فِيهِ / بِهِ"), cell("ثَلَّاجَةٌ")],
      [cell("الْمُثَنَّى الْمُذَكَّرُ", "Dual maskulin", false), cell("الْمَطْبَخَانِ", "zwei Küchen"), cell("فِيهِمَا / بِهِمَا"), cell("ثَلَّاجَتَانِ")],
      [cell("الْمُفْرَدُ الْمُؤَنَّثُ", "Singular feminin", false), cell("الشَّقَّةُ", "die Wohnung"), cell("فِيهَا / بِهَا"), cell("ثَلَاثُ حُجُرَاتٍ")],
      [cell("الْمُثَنَّى الْمُؤَنَّثُ", "Dual feminin", false), cell("الشَّقَّتَانِ", "zwei Wohnungen"), cell("فِيهِمَا / بِهِمَا"), cell("ثَلَاثُ حُجُرَاتٍ")],
      [cell("الْجَمْعُ", "Plural (Dinge)", false), cell("الْكُتُبُ / الْمَكْتَبَاتُ", "die Bücher / die Bibliotheken"), cell("فِيهَا / بِهَا"), cell("صُوَرٌ كَثِيرَةٌ / كُتُبٌ كَثِيرَةٌ")],
    ],
  },
];

// p. 20 · ثالثًا: النفي ٥
const RULE_5: TableBlock[] = [
  {
    id: "r5-negation",
    titleArabic: "ثَالِثًا: النَّفْيُ",
    title: "Drittens: die Verneinung",
    columns: [
      { arabic: "النَّوْعُ", german: "Art" },
      { arabic: "الْجُمْلَةُ", german: "Satz" },
    ],
    rows: [
      [cell("الْمُفْرَدُ الْمُؤَنَّثُ", "Singular feminin", false), cell("الشَّقَّةُ لَيْسَ فِيهَا / بِهَا ثَلَاثُ حُجُرَاتٍ", "Die Wohnung hat nicht drei Zimmer.")],
      [cell("الْمُثَنَّى الْمُؤَنَّثُ", "Dual feminin", false), cell("الشَّقَّتَانِ لَيْسَ فِيهِمَا / بِهِمَا ثَلَاثُ حُجُرَاتٍ", "Die zwei Wohnungen haben nicht drei Zimmer.")],
      [cell("الْمُفْرَدُ الْمُذَكَّرُ", "Singular maskulin", false), cell("الْمَطْبَخُ لَيْسَ فِيهِ / بِهِ سَخَّانٌ كَبِيرٌ", "Die Küche hat keinen großen Boiler.")],
      [cell("الْمُثَنَّى الْمُذَكَّرُ", "Dual maskulin", false), cell("الْمَطْبَخَانِ لَيْسَ فِيهِمَا / بِهِمَا سَخَّانَانِ كَبِيرَانِ", "Die zwei Küchen haben keine großen Boiler.")],
      [cell("الْجَمْعُ", "Plural (Dinge)", false), cell("الْكُتُبُ لَيْسَ فِيهَا / بِهَا صُوَرٌ مُلَوَّنَةٌ", "In den Büchern sind keine bunten Bilder.")],
      [cell("الْجَمْعُ", "Plural (Dinge)", false), cell("الْمَكْتَبَاتُ لَيْسَ فِيهَا / بِهَا طَاوِلَاتٌ كَثِيرَاتٌ / كَثِيرَةٌ", "In den Bibliotheken gibt es nicht viele Tische.")],
    ],
  },
];

// ------------------------------------------------------------------ p. 21 · تدريب ١
const CONNECT: MatchContent = {
  promptTitle: "Das Wort",
  optionTitle: "Der Rest des Satzes (باقي الجملة)",
  pronouns: { title: "Präposition + Pronomen (الحرف + الضمير)", options: ["فِيهِ", "فِيهَا", "بِهِ", "بِهَا"] },
  prompts: [
    { id: "c0", arabic: "الْحَقِيبَةُ", answer: "o6", example: true, pronoun: ["فِيهَا", "بِهَا"], result: { arabic: "الْحَقِيبَةُ فِيهَا قَلَمٌ صَغِيرٌ.", german: "In der Tasche ist ein kleiner Stift." } },
    { id: "c1", arabic: "الشَّارِعُ", answer: "o3", pronoun: ["فِيهِ", "بِهِ"], result: { arabic: "الشَّارِعُ فِيهِ سَيَّارَاتٌ قَدِيمَةٌ وَحَدِيثَةٌ.", german: "In der Straße fahren alte und moderne Autos." } },
    { id: "c2", arabic: "الْحَمَّامُ", answer: "o2", pronoun: ["فِيهِ", "بِهِ"], result: { arabic: "الْحَمَّامُ فِيهِ نَافِذَتَانِ مُضِيئَتَانِ.", german: "Das Bad hat zwei helle Fenster." } },
    { id: "c3", arabic: "الْمَكْتَبُ", answer: "o11", pronoun: ["فِيهِ", "بِهِ"], result: { arabic: "الْمَكْتَبُ فِيهِ كُرْسِيٌّ مُرِيحٌ.", german: "Am Schreibtisch steht ein bequemer Stuhl." } },
    { id: "c4", arabic: "الْغُرْفَةُ", answer: "o4", accept: ["o5"], pronoun: ["فِيهَا", "بِهَا"] },
    { id: "c5", arabic: "الْمَطْبَخُ", answer: "o7", pronoun: ["فِيهِ", "بِهِ"], result: { arabic: "الْمَطْبَخُ فِيهِ ثَلَّاجَةٌ عَرِيضَةٌ.", german: "In der Küche steht ein breiter Kühlschrank." } },
    { id: "c6", arabic: "حُجْرَةُ النَّوْمِ", answer: "o10", pronoun: ["فِيهَا", "بِهَا"], result: { arabic: "حُجْرَةُ النَّوْمِ فِيهَا سَرِيرَانِ نَظِيفَانِ.", german: "Im Schlafzimmer stehen zwei saubere Betten." } },
    { id: "c7", arabic: "الْفَصْلُ", answer: "o5", accept: ["o4"], pronoun: ["فِيهِ", "بِهِ"] },
    { id: "c8", arabic: "الثَّلَّاجَةُ", answer: "o9", pronoun: ["فِيهَا", "بِهَا"], result: { arabic: "الثَّلَّاجَةُ فِيهَا طَعَامٌ كَثِيرٌ.", german: "Im Kühlschrank ist viel Essen." } },
    { id: "c9", arabic: "الْمَكْتَبَةُ", answer: "o1", pronoun: ["فِيهَا", "بِهَا"], result: { arabic: "الْمَكْتَبَةُ فِيهَا كُتُبٌ قَدِيمَةٌ.", german: "In der Bibliothek stehen alte Bücher." } },
    { id: "c10", arabic: "الْمَتْحَفُ", answer: "o0", pronoun: ["فِيهِ", "بِهِ"], result: { arabic: "الْمَتْحَفُ فِيهِ صُوَرٌ كَثِيرَةٌ.", german: "Im Museum hängen viele Bilder." } },
    { id: "c11", arabic: "الْجَامِعَةُ", answer: "o8", pronoun: ["فِيهَا", "بِهَا"], result: { arabic: "الْجَامِعَةُ فِيهَا فُصُولٌ وَاسِعَةٌ.", german: "Die Universität hat geräumige Klassenzimmer." } },
  ],
  options: [
    { id: "o0", label: "أ", arabic: "صُوَرٌ كَثِيرَةٌ" },
    { id: "o1", label: "ب", arabic: "كُتُبٌ قَدِيمَةٌ" },
    { id: "o2", label: "ج", arabic: "نَافِذَتَانِ مُضِيئَتَانِ" },
    { id: "o3", label: "د", arabic: "سَيَّارَاتٌ قَدِيمَةٌ وَحَدِيثَةٌ" },
    { id: "o4", label: "هـ", arabic: "بَابٌ طَوِيلٌ" },
    { id: "o5", label: "و", arabic: "دُولَابٌ مُرْتَفِعٌ" },
    { id: "o6", label: "ز", arabic: "قَلَمٌ صَغِيرٌ" },
    { id: "o7", label: "ح", arabic: "ثَلَّاجَةٌ عَرِيضَةٌ" },
    { id: "o8", label: "ط", arabic: "فُصُولٌ وَاسِعَةٌ" },
    { id: "o9", label: "ي", arabic: "طَعَامٌ كَثِيرٌ" },
    { id: "o10", label: "ك", arabic: "سَرِيرَانِ نَظِيفَانِ" },
    { id: "o11", label: "ل", arabic: "كُرْسِيٌّ مُرِيحٌ" },
  ],
};

// ------------------------------------------------------------------ p. 22 · القواعد ٦ ٧ ٨
const RULE_6: TableBlock[] = [
  {
    id: "r6-number",
    titleArabic: "التَّطَابُقُ مَعَ الْعَدَدِ",
    title: "Übereinstimmung in der Zahl",
    columns: [
      { arabic: "الْمَوْصُوفُ", german: "Nomen" },
      { arabic: "الصِّفَةُ", german: "Adjektiv" },
    ],
    rows: [
      [cell("كِتَابٌ", "ein Buch"), cell("كَبِيرٌ", "groß")],
      [cell("كِتَابَانِ", "zwei Bücher"), cell("كَبِيرَانِ", "groß (Dual)")],
    ],
  },
  {
    id: "r6-article",
    titleArabic: "الْمَعْرِفَةُ وَالنَّكِرَةُ",
    title: "Bestimmt und unbestimmt",
    columns: [
      { arabic: "الْمَعْرِفَةُ", german: "bestimmt" },
      { arabic: "النَّكِرَةُ", german: "unbestimmt" },
    ],
    rows: [
      [cell("الْكِتَابُ الْكَبِيرُ", "das große Buch"), cell("كِتَابٌ كَبِيرٌ", "ein großes Buch")],
      [cell("الْحَقِيبَةُ الْكَبِيرَةُ", "die große Tasche"), cell("حَقِيبَةٌ كَبِيرَةٌ", "eine große Tasche")],
    ],
  },
];
const RULE_7: TableBlock[] = [
  {
    id: "r7-gender",
    titleArabic: "التَّطَابُقُ مَعَ النَّوْعِ",
    title: "Übereinstimmung im Geschlecht",
    columns: [
      { arabic: "الْمَوْصُوفُ", german: "Nomen" },
      { arabic: "الصِّفَةُ", german: "Adjektiv" },
    ],
    rows: [
      [cell("كِتَابٌ", "ein Buch (maskulin)"), cell("كَبِيرٌ", "groß")],
      [cell("حَقِيبَةٌ", "eine Tasche (feminin)"), cell("كَبِيرَةٌ", "groß")],
    ],
  },
  {
    id: "r7-plural",
    titleArabic: "جَمْعُ غَيْرِ الْعَاقِلِ وَالْعَاقِلِ",
    title: "Plural: Dinge und Menschen",
    columns: [
      { arabic: "جَمْعُ غَيْرِ الْعَاقِلِ", german: "Plural der Dinge" },
      { arabic: "الْعَاقِلُ", german: "Menschen" },
    ],
    rows: [
      [cell("كُتُبٌ كَثِيرَةٌ", "viele Bücher"), cell("مُدَرِّسُونَ مُجْتَهِدُونَ", "fleißige Lehrer")],
      [cell("حَقَائِبُ غَالِيَةٌ", "teure Taschen"), cell("مُدَرِّسَاتٌ مُجْتَهِدَاتٌ", "fleißige Lehrerinnen")],
    ],
  },
];
const RULE_8: TableBlock[] = [
  {
    id: "r8-human",
    titleArabic: "الْعَاقِلُ وَغَيْرُ الْعَاقِلِ",
    title: "Menschen und Dinge",
    columns: [
      { arabic: "الْعَاقِلُ", german: "Menschen" },
      { arabic: "غَيْرُ الْعَاقِلِ", german: "Dinge" },
    ],
    rows: [
      [cell("رَجُلٌ طَوِيلٌ", "ein großer Mann"), cell("بَابٌ طَوِيلٌ", "eine hohe Tür")],
      [cell("سَيِّدَةٌ طَوِيلَةٌ", "eine große Frau"), cell("شَجَرَةٌ طَوِيلَةٌ", "ein hoher Baum")],
      [cell("×", undefined, false), cell("فَصْلٌ وَاسِعٌ", "ein geräumiges Klassenzimmer")],
      [cell("×", undefined, false), cell("شَقَّةٌ وَاسِعَةٌ", "eine geräumige Wohnung")],
    ],
  },
  {
    id: "r8-case",
    titleArabic: "الْإِعْرَابُ",
    title: "Der Fall (Endung)",
    columns: [
      { arabic: "الْمَعْرِفَةُ", german: "bestimmt" },
      { arabic: "النَّكِرَةُ", german: "unbestimmt" },
    ],
    rows: [
      [cell("الْكِتَابُ الْكَبِيرُ", "das große Buch"), cell("كِتَابٌ كَبِيرٌ", "ein großes Buch")],
      [cell("الْحَقِيبَةُ الْكَبِيرَةُ", "die große Tasche"), cell("حَقِيبَةٌ كَبِيرَةٌ", "eine große Tasche")],
      [cell("فِي الْمَدِينَةِ الْجَمِيلَةِ", "in der schönen Stadt"), cell("فِي مَدِينَةٍ جَمِيلَةٍ", "in einer schönen Stadt")],
    ],
  },
];

// p. 23 · لاحظ: النفي
const RULE_NEG: TableBlock[] = [
  {
    id: "neg",
    titleArabic: "لَاحِظِ: النَّفْيَ",
    title: "Beachte: die Verneinung",
    columns: [
      { arabic: "لِلْمُذَكَّرِ", german: "maskulin" },
      { arabic: "لِلْمُؤَنَّثِ", german: "feminin" },
    ],
    rows: [
      [cell("هَلْ هَذَا رَجُلٌ طَوِيلٌ؟", "Ist das ein großer Mann?"), cell("هَلْ هَذِهِ سَيِّدَةٌ طَوِيلَةٌ؟", "Ist das eine große Frau?")],
      [cell("لَا. هَذَا لَيْسَ رَجُلًا طَوِيلًا.", "Nein. Das ist kein großer Mann."), cell("هَذِهِ لَيْسَتْ سَيِّدَةً طَوِيلَةً.", "Das ist keine große Frau.")],
      [cell("هَلْ هَذَا كِتَابٌ كَبِيرٌ؟", "Ist das ein großes Buch?"), cell("هَلْ هَذِهِ نَافِذَةٌ كَبِيرَةٌ؟", "Ist das ein großes Fenster?")],
      [cell("لَا. هَذَا لَيْسَ كِتَابًا كَبِيرًا.", "Nein. Das ist kein großes Buch."), cell("لَا. هَذِهِ لَيْسَتْ نَافِذَةً كَبِيرَةً.", "Nein. Das ist kein großes Fenster.")],
    ],
    note: "لَيْسَ + ـًا  ·  لَيْسَ + اسْمٌ مَنْصُوبٌ + صِفَةٌ مَنْصُوبَةٌ  (nach لَيْسَ stehen das Nomen und das Adjektiv im Akkusativ.)",
  },
];

// ------------------------------------------------------------------ p. 24 · تدريب ٢: the adjectives and their opposites
// The two tables of "كلمات مفيدة: ادرس الصفات وعكسها", in the book's order (the adjective, then its opposite).
const OPPOSITES = [
  {
    id: "table-1",
    titleArabic: "الصِّفَةُ وَالْعَكْسُ (١)",
    title: "Das Adjektiv und sein Gegenteil (Tabelle 1)",
    rows: [
      [it("o-high", "عَالٍ", "hoch"), it("o-low", "مُنْخَفِضٌ", "niedrig")],
      [it("o-spacious", "وَاسِعٌ", "weit, geräumig"), it("o-narrow", "ضَيِّقٌ", "eng")],
      [it("o-comfy", "مُرِيحٌ", "bequem, angenehm"), it("o-tiring", "مُتْعِبٌ", "anstrengend")],
      [it("o-clean", "نَظِيفٌ", "sauber"), it("o-dirty", "قَذِرٌ", "schmutzig")],
      [it("o-bright", "مُضِيءٌ", "hell"), it("o-dark", "مُظْلِمٌ", "dunkel")],
      [it("t-tall", "طَوِيلٌ", "groß, lang"), it("t-short", "قَصِيرٌ", "klein, kurz")],
      [it("o-wide", "عَرِيضٌ", "breit"), it("o-narrow-2", "ضَيِّقٌ", "schmal")],
    ],
  },
  {
    id: "table-2",
    titleArabic: "الصِّفَةُ وَالْعَكْسُ (٢)",
    title: "Das Adjektiv und sein Gegenteil (Tabelle 2)",
    rows: [
      [it("m-many", "كَثِيرٌ", "viel"), it("m-few", "قَلِيلٌ", "wenig")],
      [it("m-big", "كَبِيرٌ", "groß"), it("m-small", "صَغِيرٌ", "klein")],
      [it("o-new", "جَدِيدٌ", "neu"), it("o-old", "قَدِيمٌ", "alt")],
      [it("m-beautiful", "جَمِيلٌ", "schön"), it("m-ugly", "سَيِّئٌ - قَبِيحٌ", "schlecht – hässlich")],
      [it("p-nice", "لَطِيفٌ", "nett, freundlich"), it("p-rude", "فَظٌّ", "unfreundlich, grob")],
      [it("m-crowded", "مُزْدَحِمٌ", "überfüllt, belebt"), it("m-quiet", "هَادِئٌ", "ruhig")],
    ],
  },
];
const oppositeWords = (section: (typeof OPPOSITES)[number]): WordGroup => ({
  id: section.id,
  title: section.title,
  titleArabic: section.titleArabic,
  paired: true,
  words: section.rows.flat().map((item) => toWord(`a2-1-${item.id}`, item.arabic, item.german ?? "", item.image)),
});

// "اختر كلمة مناسبة من الصفات التالية وأكمل الجملة مع التشكيل" – the book gives no key: every adjective that fits
// the sentence (and agrees with its noun) is accepted.
const ADJECTIVE_ITEMS: ClozeItem[] = [
  { id: "ad1", hint: "Das Beispiel aus dem Buch.", lines: [{ label: "١", parts: ["حُجْرَةُ الْمَعِيشَةِ فِي بَيْتِي ", { accept: ["مُضِيئَةٌ", "وَاسِعَةٌ", "نَظِيفَةٌ"], options: ["مُضِيئَةٌ", "وَاسِعَةٌ", "نَظِيفَةٌ", "مُضِيءٌ", "وَاسِعَانِ"].sort((x, y) => x.localeCompare(y, "ar")) }, " وَأَيْضًا ", { accept: ["مُضِيئَةٌ", "وَاسِعَةٌ", "نَظِيفَةٌ"], options: ["مُضِيئَةٌ", "وَاسِعَةٌ", "نَظِيفَةٌ", "مُضِيءٌ", "وَاسِعَانِ"].sort((x, y) => x.localeCompare(y, "ar")) }, "."] }] },
  { id: "ad2", lines: [{ label: "٢", parts: ["ابْنِي طِفْلٌ ", g(["نَشِيطٌ", "لَطِيفٌ", "كَسْلَانُ"], ["نَشِيطَةٌ", "لَطِيفَانِ"]), " وَ", g(["نَشِيطٌ", "لَطِيفٌ", "كَسْلَانُ"], ["نَشِيطَةٌ", "لَطِيفَانِ"]), "."] }] },
  { id: "ad3", lines: [{ label: "٣", parts: ["الْمَتْحَفُ بِهِ بَابَانِ ", g(["عَالِيَانِ", "عَرِيضَانِ", "طَوِيلَانِ"], ["عَالٍ", "عَرِيضٌ"]), " وَ", g(["عَالِيَانِ", "عَرِيضَانِ", "طَوِيلَانِ"], ["عَالٍ", "عَرِيضٌ"]), "."] }] },
  { id: "ad4", lines: [{ label: "٤", parts: ["صَدِيقِي ", g(["لَطِيفٌ", "نَشِيطٌ", "كَسْلَانُ"], ["لَطِيفَةٌ", "لَطِيفُونَ"]), " جِدًّا."] }] },
  { id: "ad5", lines: [{ label: "٥", parts: ["لَا أُحِبُّ هَذَا الْفُسْتَانَ. هَذَانِ الْفُسْتَانَانِ ", g(["ضَيِّقَانِ", "قَصِيرَانِ", "طَوِيلَانِ", "عَرِيضَانِ"], ["ضَيِّقٌ", "قَصِيرَةٌ"]), " وَ", g(["ضَيِّقَانِ", "قَصِيرَانِ", "طَوِيلَانِ", "عَرِيضَانِ"], ["ضَيِّقٌ", "قَصِيرَةٌ"]), "."] }] },
  { id: "ad6", lines: [{ label: "٦", parts: ["مَكْتَبُ الْمُدِيرِ دَائِمًا ", g(["نَظِيفٌ", "مُرِيحٌ", "مُضِيءٌ", "وَاسِعٌ"], ["نَظِيفَةٌ", "مُرِيحَانِ"]), " وَ", g(["نَظِيفٌ", "مُرِيحٌ", "مُضِيءٌ", "وَاسِعٌ"], ["نَظِيفَةٌ", "مُرِيحَانِ"]), "."] }] },
  { id: "ad7", lines: [{ label: "٧", parts: ["هَذَا الْفِيلْمُ ", g(["مُمِلٌّ", "لَطِيفٌ", "مُتْعِبٌ"], ["مُمِلَّةٌ", "مُمِلُّونَ"]), "."] }] },
  { id: "ad8", hint: "Nach لَيْسَ steht der Akkusativ.", lines: [{ label: "٨", parts: ["مُصْطَفَى أَخِي ", g(["نَشِيطٌ"], ["نَشِيطَةٌ", "نَشِيطًا"]), " جِدًّا وَلَيْسَ ", g(["كَسْلَانَ"], ["كَسْلَانُ", "كَسْلَانَةً"]), " هُوَ يَلْعَبُ الرِّيَاضَةَ كُلَّ يَوْمٍ."] }] },
  { id: "ad10", lines: [{ label: "١٠", parts: ["أُمِّي لَا تُحِبُّ الشَّارِعَ بِجَانِبِ السُّوقِ لِأَنَّهُ ", g(["قَذِرٌ", "مُتْعِبٌ", "مُمِلٌّ", "ضَيِّقٌ"], ["قَذِرَةٌ", "مُتْعِبَانِ"]), " وَ", g(["قَذِرٌ", "مُتْعِبٌ", "مُمِلٌّ", "ضَيِّقٌ"], ["قَذِرَةٌ", "مُتْعِبَانِ"]), "."] }] },
  { id: "ad11", lines: [{ label: "١١", parts: ["أُحِبُّ الْجُلُوسَ أَمَامَ التِّلِيفِزْيُونِ عَلَى كُرْسِيِّ أَبِي لِأَنَّهُ ", g(["مُرِيحٌ", "نَظِيفٌ"], ["مُرِيحَةٌ", "مُتْعِبَانِ"]), "."] }] },
  { id: "ad12", lines: [{ label: "١٢", parts: ["هَاتَانِ الْبُلُوزَتَانِ ", g(["غَالِيَتَانِ", "ضَيِّقَتَانِ", "قَصِيرَتَانِ", "طَوِيلَتَانِ"], ["غَالِيَةٌ", "غَالِيَانِ"]), "."] }] },
];

/** Every word the learner can choose in these items, once, in Arabic alphabetical order (the word box). */
const bankOf = (items: ClozeItem[]): string[] =>
  [...new Set(items.flatMap((item) => item.lines.flatMap((line) => line.parts.flatMap((part) => (typeof part === "string" ? [] : part.options)))))].sort((x, y) => unvocalised(x).localeCompare(unvocalised(y), "ar") || x.localeCompare(y, "ar"));

// ------------------------------------------------------------------ p. 25 · تدريب ٣
const neg = (id: string, arabic: string, right: string, wrong: [string, string]): QuizItem => {
  const options = [right, ...wrong].sort((a, b) => a.localeCompare(b, "ar"));
  return { id, arabic, german: "Verneine den Satz.", questions: [{ prompt: "Der verneinte Satz", options, answer: options.indexOf(right) }] };
};
const NEGATION_ITEMS: QuizItem[] = [
  neg("ng1", "هَذِهِ سَيِّدَةٌ لَطِيفَةٌ.", "هَذِهِ لَيْسَتْ سَيِّدَةً لَطِيفَةً.", ["هَذِهِ لَيْسَ سَيِّدَةً لَطِيفَةً.", "هَذِهِ لَيْسَتْ سَيِّدَةٌ لَطِيفَةٌ."]),
  neg("ng2", "هَذِهِ الْحُجْرَةُ نَظِيفَةٌ جِدًّا.", "هَذِهِ الْحُجْرَةُ لَيْسَتْ نَظِيفَةً جِدًّا.", ["هَذِهِ الْحُجْرَةُ لَيْسَ نَظِيفَةً جِدًّا.", "هَذِهِ الْحُجْرَةُ لَيْسَتْ نَظِيفَةٌ جِدًّا."]),
  neg("ng3", "الْمَكْتَبَانِ بِهِمَا مُكَيِّفَانِ جَدِيدَانِ.", "الْمَكْتَبَانِ لَيْسَ بِهِمَا مُكَيِّفَانِ جَدِيدَانِ.", ["الْمَكْتَبَانِ لَيْسَا بِهِمَا مُكَيِّفَانِ جَدِيدَانِ.", "الْمَكْتَبَانِ لَيْسَ بِهِمَا مُكَيِّفَانِ جَدِيدَيْنِ."]),
  neg("ng4", "الرَّادْيُو صَوْتُهُ مُنْخَفِضٌ.", "الرَّادْيُو لَيْسَ صَوْتُهُ مُنْخَفِضًا.", ["الرَّادْيُو لَيْسَتْ صَوْتُهُ مُنْخَفِضًا.", "الرَّادْيُو لَيْسَ صَوْتُهُ مُنْخَفِضٌ."]),
  neg("ng5", "حَدِيقَةُ الْمَنْزِلِ وَاسِعَةٌ.", "حَدِيقَةُ الْمَنْزِلِ لَيْسَتْ وَاسِعَةً.", ["حَدِيقَةُ الْمَنْزِلِ لَيْسَ وَاسِعَةً.", "حَدِيقَةُ الْمَنْزِلِ لَيْسَتْ وَاسِعَةٌ."]),
  neg("ng6", "الْمَكْتَبَةُ بِهَا كُتُبٌ غَالِيَةٌ وَقَدِيمَةٌ.", "الْمَكْتَبَةُ لَيْسَ بِهَا كُتُبٌ غَالِيَةٌ وَقَدِيمَةٌ.", ["الْمَكْتَبَةُ لَيْسَتْ بِهَا كُتُبٌ غَالِيَةٌ وَقَدِيمَةٌ.", "الْمَكْتَبَةُ لَيْسَ بِهَا كُتُبٌ غَالِيَةً وَقَدِيمَةً."]),
];

// p. 25–26 · تدريب ٤: "أكمل الجملة بصفة أو كلام مناسب مع التشكيل" (free completion in the book: several answers are accepted)
const COMPLETE_ITEMS: ClozeItem[] = [
  { id: "cp1", lines: [{ label: "١", parts: ["هَذَانِ الرَّجُلَانِ ", g(["طَوِيلَانِ", "قَصِيرَانِ", "نَشِيطَانِ", "لَطِيفَانِ"], ["طَوِيلٌ", "طَوِيلَةٌ"]), "."] }] },
  { id: "cp2", lines: [{ label: "٢", parts: ["حُجْرَتِي بِهَا ", g(["نَافِذَتَانِ مُضِيئَتَانِ", "سَرِيرَانِ نَظِيفَانِ", "دُولَابٌ مُرْتَفِعٌ", "كُرْسِيٌّ مُرِيحٌ", "بَابٌ طَوِيلٌ"], ["نَافِذَتَانِ مُضِيءٌ", "سَرِيرَانِ نَظِيفٌ"]), "."] }] },
  { id: "cp3", lines: [{ label: "٣", parts: ["الْمَكْتَبَةُ فِيهَا ", g(["كُتُبٌ قَدِيمَةٌ", "صُوَرٌ كَثِيرَةٌ", "كُرْسِيٌّ مُرِيحٌ"], ["كُتُبٌ قَدِيمُونَ", "كُتُبٌ قَدِيمٌ"]), "."] }] },
  { id: "cp4", hint: "Nach لَيْسَ steht der Akkusativ.", lines: [{ label: "٤", parts: ["مَحْمُودٌ لَيْسَ ", g(["كَسْلَانَ", "نَشِيطًا", "طَوِيلًا", "قَصِيرًا", "لَطِيفًا"], ["كَسْلَانُ", "نَشِيطٌ"]), "."] }] },
  { id: "cp5", hint: "Nach لَيْسَتْ steht der Akkusativ.", lines: [{ label: "٥", parts: ["أُسْرَتِي لَيْسَتْ ", g(["كَبِيرَةً", "صَغِيرَةً", "نَشِيطَةً"], ["كَبِيرَةٌ", "كَبِيرًا"]), "."] }] },
  { id: "cp6", lines: [{ label: "٦", parts: ["حَدِيقَةُ الْمَنْزِلِ بِهَا ", g(["أَشْجَارٌ عَالِيَةٌ", "أَشْجَارٌ كَثِيرَةٌ", "زُهُورٌ مُلَوَّنَةٌ"], ["أَشْجَارٌ عَالٍ", "زُهُورٌ مُلَوَّنُونَ"]), "."] }] },
  { id: "cp7", hint: "Nach لَيْسَتْ steht der Akkusativ.", lines: [{ label: "٧", parts: ["لَيْلَى لَيْسَتْ ", g(["طَوِيلَةً", "قَصِيرَةً", "نَشِيطَةً", "كَسْلَانَةً", "لَطِيفَةً"], ["طَوِيلَةٌ", "طَوِيلًا"]), "."] }] },
  { id: "cp8", lines: [{ label: "٨", parts: ["الشَّارِعَانِ فِيهِمَا ", g(["سَيَّارَاتٌ كَثِيرَةٌ", "سَيَّارَاتٌ قَدِيمَةٌ وَحَدِيثَةٌ"], ["سَيَّارَاتٌ كَثِيرُونَ", "سَيَّارَةٌ كَثِيرَةٌ"]), "."] }] },
];

// p. 26 · تدريب ٧: "اكتب صفة مناسبة لهذه الكلمات" (the book gives no key either)
const SUITABLE_ITEMS: ClozeItem[] = [
  { id: "su1", lines: [{ label: "١", parts: ["أَمْرِيكَا بَلَدٌ ", g(["غَنِيٌّ", "كَبِيرٌ"], ["غَنِيَّةٌ", "غَنِيُّونَ"]), " لَكِنَّ الصُّومَالَ بَلَدٌ ", g(["فَقِيرٌ"], ["فَقِيرَةٌ", "فَقِيرَانِ"]), "."] }] },
  { id: "su2", lines: [{ label: "٢", parts: ["هُوَيْدَا صَدِيقَتِي مِنْ سُورِيَا، هِيَ ", g(["سُورِيَّةٌ"], ["سُورِيٌّ", "سُورِيُّونَ"]), "."] }] },
  { id: "su3", lines: [{ label: "٣", parts: ["نِيُويُورْك مَدِينَةٌ ", g(["كَبِيرَةٌ", "ضَخْمَةٌ", "مُزْدَحِمَةٌ"], ["كَبِيرٌ", "كَبِيرَانِ"]), "."] }] },
  { id: "su4", lines: [{ label: "٤", parts: ["عَبْدُ اللَّهِ وَأَحْمَدُ أُسْتَاذَانِ فِي اللُّغَةِ ", g(["مُجْتَهِدَانِ", "مَشْهُورَانِ", "مُتَخَصِّصَانِ"], ["مُجْتَهِدٌ", "مُجْتَهِدُونَ"]), " فِي جَامِعَةِ تُونُسَ."] }] },
  { id: "su5", lines: [{ label: "٥", parts: ["فِي النُّرْوِيجِ الطَّقْسُ فِي الشِّتَاءِ طَقْسٌ ", g(["بَارِدٌ"], ["بَارِدَةٌ", "بَارِدُونَ"]), " جِدًّا."] }] },
  { id: "su6", lines: [{ label: "٦", parts: ["الدُّكْتُورُ أَحْمَد زُوَيْل عَالِمٌ ", g(["مِصْرِيٌّ", "مَشْهُورٌ", "كَبِيرٌ"], ["مِصْرِيَّةٌ", "مِصْرِيُّونَ"]), " مُتَخَصِّصٌ فِي عُلُومِ اللِّيزَر."] }] },
  { id: "su7", lines: [{ label: "٧", parts: ["الْأَهْرَامَاتُ آثَارٌ ", g(["قَدِيمَةٌ", "رَائِعَةٌ", "كَبِيرَةٌ", "ضَخْمَةٌ", "جَمِيلَةٌ", "عَالِيَةٌ"], ["قَدِيمٌ", "رَائِعُونَ"]), " وَ", g(["قَدِيمَةٌ", "رَائِعَةٌ", "كَبِيرَةٌ", "ضَخْمَةٌ", "جَمِيلَةٌ", "عَالِيَةٌ"], ["قَدِيمٌ", "رَائِعُونَ"]), " جِدًّا."] }] },
];

// ------------------------------------------------------------------ p. 27 · تدريب ٨ أ and p. 29 · نص الحوار
export const samiraSalwa: Dialogue = {
  id: "a2-1-samira-salwa",
  intro: "Zwei Freundinnen sprechen über Salwas kleine Schwester Nawal und über Samiras Freundin Riham.",
  speakers: [sp("samira", "Samira", "female-1", "Samira, eine junge Frau"), sp("salwa", "Salwa", "female-2", "Salwa, eine junge Frau")],
  lines: [
    dl("a2-1-d1-1", "samira", "هَلْ نَوَالُ أُخْتُكِ كَبِيرَةٌ يَا سَلْوَى؟", "Ist deine Schwester Nawal groß, Salwa?"),
    dl("a2-1-d1-2", "salwa", "لَا، هِيَ لَيْسَتْ كَبِيرَةً، هِيَ طِفْلَةٌ صَغِيرَةٌ عُمْرُهَا سَبْعُ سَنَوَاتٍ.", "Nein, sie ist nicht groß, sie ist ein kleines Kind, sieben Jahre alt."),
    dl("a2-1-d1-3", "samira", "إِمْ، وَمَا شَكْلُهَا؟", "Hm … und wie sieht sie aus?"),
    dl("a2-1-d1-4", "salwa", "هِيَ قَصِيرَةٌ، سَمِينَةٌ، وَشَعْرُهَا طَوِيلٌ. وَمَا شَكْلُ صَدِيقَتِكِ رِيهَام؟", "Sie ist klein und dick, und ihr Haar ist lang. Und wie sieht deine Freundin Riham aus?"),
    dl("a2-1-d1-5", "samira", "صَدِيقَتِي رِيهَام رَفِيعَةٌ، قَصِيرَةٌ أَيْضًا، شَعْرُهَا طَوِيلٌ، عُمْرُهَا حَوَالَيْ عِشْرِينَ سَنَةً.", "Meine Freundin Riham ist schlank, auch klein, ihr Haar ist lang, sie ist etwa zwanzig Jahre alt."),
  ],
  // Book p. 27: two pictures (a small plump girl, a slim girl) – the learner decides from the description which one is Riham.
  question: {
    prompt: "مَنْ رِيهَام؟ Wer ist Riham? Tippe auf das richtige Bild.",
    options: ["Bild 1", "Bild 2"],
    answer: 1,
    images: [
      { src: `${IMG}/scenes/riham-girl-plump.webp`, alt: "Ein kleines, rundliches Mädchen mit langem Zopf und Schürze" },
      { src: `${IMG}/scenes/riham-girl-slim.webp`, alt: "Eine schlanke Frau mit langem Haar, T-Shirt und langem Rock" },
    ],
  },
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
};

// p. 28 · "اسمع مرة أخرى ثم أجب": 1 صف هناء · 2 صف نادية · 3 هل ماجدة نشيطة؟ · 4 هل ماجدة رفيعة؟ · 5 هل حديقة بيت هناء واسعة؟
// (questions 3 and 4 name "ماجدة", who is not in this dialogue – the book means Hanaa, so they are answered about her)
const HANAA_QUESTIONS: QuizItem[] = [
  {
    id: "hq0",
    section: { arabic: "أَجِبْ عَلَى الْأَسْئِلَةِ:", german: "Beantworte die Fragen:" },
    arabic: "هَلْ هَنَاء كَسْلَانَةٌ؟",
    german: "Ist Hanaa faul?",
    questions: [{ prompt: "Antwort", options: ["لَا، هِيَ نَشِيطَةٌ جِدًّا", "نَعَمْ، هِيَ كَسْلَانَةٌ"], answer: 0 }],
  },
  { id: "hq1", section: { arabic: "اِسْمَعْ مَرَّةً أُخْرَى ثُمَّ أَجِبْ:", german: "Hör noch einmal zu und antworte:" }, arabic: "صِفْ هَنَاء.", german: "Beschreibe Hanaa.", questions: [{ prompt: "Antwort", options: ["هَنَاء جَمِيلَةٌ وَرَفِيعَةٌ، شَعْرُهَا طَوِيلٌ", "هَنَاء قَصِيرَةٌ وَبَدِينَةٌ", "هَنَاء كَسْلَانَةٌ وَصَغِيرَةٌ"], answer: 0 }] },
  { id: "hq2", arabic: "صِفْ نَادِيَةَ أُخْتَ هَنَاء.", german: "Beschreibe Nadia, Hanaas Schwester.", questions: [{ prompt: "Antwort", options: ["نَادِيَةُ صَغِيرَةٌ، قَصِيرَةٌ وَبَدِينَةٌ", "نَادِيَةُ جَمِيلَةٌ وَرَفِيعَةٌ", "نَادِيَةُ نَشِيطَةٌ جِدًّا"], answer: 0 }] },
  {
    id: "hq3",
    arabic: "هَلْ مَاجِدَةُ نَشِيطَةٌ؟",
    german: "Ist Magida aktiv? (Im Dialog heißt sie Hanaa.)",
    questions: [{ prompt: "Antwort", options: ["نَعَمْ، هِيَ نَشِيطَةٌ جِدًّا", "لَا، هِيَ كَسْلَانَةٌ"], answer: 0 }],
  },
  {
    id: "hq4",
    arabic: "هَلْ مَاجِدَةُ رَفِيعَةٌ؟",
    german: "Ist Magida schlank? (Im Dialog heißt sie Hanaa.)",
    questions: [{ prompt: "Antwort", options: ["نَعَمْ، هِيَ رَفِيعَةٌ", "لَا، هِيَ بَدِينَةٌ"], answer: 0 }],
  },
  { id: "hq5", arabic: "هَلْ حَدِيقَةُ بَيْتِ هَنَاء وَاسِعَةٌ؟", german: "Ist der Garten von Hanaas Haus geräumig?", questions: [{ prompt: "Antwort", options: ["لَا، حَدِيقَتُهَا صَغِيرَةٌ وَضَيِّقَةٌ", "نَعَمْ، حَدِيقَتُهَا وَاسِعَةٌ"], answer: 0 }] },
];

// p. 28 · 6: "ضع علامة صح (✓) أو خطأ (✗)" – the book's last statement ("الحديقة بها أشجار عالية") is not decided by the text, so it is left out.
const RIGHT = "صَحِيحٌ ✓";
const WRONG = "خَطَأٌ ✗";
const tf = (id: string, arabic: string, german: string, ok: boolean, image?: QuizItem["image"]): QuizItem => ({ id, arabic, german, ...(image ? { image } : {}), questions: [{ prompt: "Richtig oder falsch?", options: [RIGHT, WRONG], answer: ok ? 0 : 1 }] });
const TRUE_FALSE: QuizItem[] = [
  tf("tf1", "حَدِيقَةُ هَنَاء قَذِرَةٌ.", "Hanaas Garten ist schmutzig.", false),
  tf("tf2", "حَدِيقَةُ هَنَاء ضَيِّقَةٌ.", "Hanaas Garten ist schmal.", true),
  tf("tf3", "حَدِيقَةُ هَنَاء بِهَا أَزْهَارٌ قَلِيلَةٌ.", "In Hanaas Garten gibt es wenige Blumen.", false),
  tf("tf4", "حَدِيقَةُ هَنَاء بِهَا نَهْرٌ صَغِيرٌ.", "In Hanaas Garten gibt es einen kleinen Fluss.", false),
  tf("tf5", "حَدِيقَةُ هَنَاء وَاسِعَةٌ.", "Hanaas Garten ist geräumig.", false),
];

// ------------------------------------------------------------------ p. 31 · نص الرسالة
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
// p. 30 · القراءة الأولى: ١ أين مارك الآن؟
const LETTER_FIRST: QuizItem[] = [
  { id: "q1", arabic: "أَيْنَ مَارِك الْآنَ؟", german: "Wo ist Mark jetzt?", image: { src: `${IMG}/scenes/khan-el-khalili.webp`, alt: "Ein Markt in der Altstadt von Kairo", wide: true }, questions: [{ prompt: "Antwort", options: ["فِي مِصْرَ", "فِي الْأُرْدُنِّ", "فِي أَلْمَانْيَا"], answer: 0 }] },
];
// القراءة الثانية: ٢ القاهرة بها آثار ---- و ---- و ----.
const ATHAR = ["فِرْعَوْنِيَّةٌ", "إِسْلَامِيَّةٌ", "قِبْطِيَّةٌ"];
const LETTER_GAPS: ClozeItem[] = [
  {
    id: "lg1",
    lines: [{ label: "٢", parts: ["الْقَاهِرَةُ بِهَا آثَارٌ ", { accept: ATHAR, options: [...ATHAR, "فِرْعَوْنِيٌّ"].sort((x, y) => x.localeCompare(y, "ar")) }, " وَ", { accept: ATHAR, options: [...ATHAR, "إِسْلَامِيٌّ"].sort((x, y) => x.localeCompare(y, "ar")) }, " وَ", { accept: ATHAR, options: [...ATHAR, "قِبْطِيٌّ"].sort((x, y) => x.localeCompare(y, "ar")) }, "."] }],
  },
];
// ٣ اكتب من النص الاسم والصفة (the book's example: مدينة – كبيرة)
// p. 32 · تدريب ١٢: "أكمل الجمل بكلمات من عندك" – free sentences with gaps
const FREE_GAPS: FreeGapItem[] = [
  { id: "fg1", number: "١", parts: ["سَيَّارَةُ صَدِيقِي", null, "وَبِهَا", null, "."], gaps: [{ model: "جَدِيدَةٌ", agrees: "f" }, { model: "مَقَاعِدُ مُرِيحَةٌ" }] },
  { id: "fg2", number: "٢", parts: ["الْجَوُّ فِي السُّوِيدِ", null, "وَفِيهِ", null, "."], gaps: [{ model: "بَارِدٌ", agrees: "m" }, { model: "ثَلْجٌ" }] },
  { id: "fg3", number: "٣", parts: ["هُوَ مِنْ أَصْلٍ أُرْدُنِّيٍّ وَلَكِنَّ زَوْجَتَهُ لَيْسَتْ", null, "هِيَ", null, "."], gaps: [{ model: "أُرْدُنِّيَّةً", agrees: "f" }, { model: "مِصْرِيَّةٌ", agrees: "f" }] },
  { id: "fg4", number: "٤", parts: ["نَهْرُ الْأَمَازُونِ", null, "."], gaps: [{ model: "طَوِيلٌ", agrees: "m" }] },
  { id: "fg5", number: "٥", parts: ["الْمَتْحَفُ الْمِصْرِيُّ بِهِ", null, "مِنَ الْآثَارِ الْفِرْعَوْنِيَّةِ", null, "."], gaps: [{ model: "كَثِيرٌ" }, { model: "الْقَدِيمَةِ", agrees: "f" }] },
  { id: "fg6", number: "٦", parts: ["جَدِّي", null, "وَ", null, "."], gaps: [{ model: "طَوِيلٌ", agrees: "m" }, { model: "نَشِيطٌ", agrees: "m" }] },
];

// p. 33 · تدريب ١٣: the two advertisements "منازل وشقق للإيجار"
const AD_FLAT = "شَقَّةٌ غَرْبِيَّةٌ تُطِلُّ عَلَى النِّيلِ، ٤ حُجُرَاتٍ وَصَالَةٌ مَفْرُوشَةٌ، ثَلَاثَةُ مُكَيِّفَاتٍ، أَدَوَاتٌ كَهْرَبَائِيَّةٌ كَامِلَةٌ، مُدَّةٌ طَوِيلَةٌ، السِّعْرُ مُنَاسِبٌ، جَرَاجٌ خَاصٌّ.";
const AD_HOUSE = "بَيْتٌ دَوْرَيْنِ، ٦ غُرَفٍ وَصَالَتَيْنِ، ٨ حَمَّامَاتٍ، مَطْبَخٌ حَدِيثٌ، حَدِيقَةٌ وَاسِعَةٌ، وَاجِهَةٌ شَرْقِيَّةٌ بَحْرِيَّةٌ، عَلَى شَارِعٍ عَرِيضٍ.";
const AD_ADJECTIVES = ["غَرْبِيَّةٌ", "مَفْرُوشَةٌ", "كَهْرَبَائِيَّةٌ", "كَامِلَةٌ", "طَوِيلَةٌ", "مُنَاسِبٌ", "خَاصٌّ", "حَدِيثٌ", "وَاسِعَةٌ", "شَرْقِيَّةٌ", "بَحْرِيَّةٌ", "عَرِيضٍ"];
const AD_NUMBERS: NumberWord[] = [
  { arabic: "شَقَّةٌ", number: "singular", other: "شُقَقٌ" },
  { arabic: "حُجُرَاتٌ", number: "plural", other: "حُجْرَةٌ" },
  { arabic: "مُكَيِّفَاتٌ", number: "plural", other: "مُكَيِّفٌ" },
  { arabic: "أَدَوَاتٌ", number: "plural", other: "أَدَاةٌ" },
  { arabic: "بَيْتٌ", number: "singular", other: "بُيُوتٌ" },
  { arabic: "غُرَفٌ", number: "plural", other: "غُرْفَةٌ" },
  { arabic: "حَمَّامَاتٌ", number: "plural", other: "حَمَّامٌ" },
  { arabic: "مَطْبَخٌ", number: "singular", other: "مَطَابِخُ" },
  { arabic: "حَدِيقَةٌ", number: "singular", other: "حَدَائِقُ" },
  { arabic: "شَارِعٌ", number: "singular", other: "شَوَارِعُ" },
];

// تدريب ٩ · ٤: nouns of the letter with their singular / plural (the table "الاسم | الصفة | المفرد | الجمع"; the example row is آثار – أثر)
const LETTER_NUMBERS: NumberWord[] = [
  { arabic: "آثَارٌ", number: "plural", other: "أَثَرٌ", example: true },
  { arabic: "مَدِينَةٌ", number: "singular", other: "مُدُنٌ" },
  { arabic: "مَنَاطِقُ", number: "plural", other: "مِنْطَقَةٌ" },
  { arabic: "مِنْطَقَةٌ", number: "singular", other: "مَنَاطِقُ" },
  { arabic: "نَهْرٌ", number: "singular", other: "أَنْهَارٌ" },
  { arabic: "أَهْرَامٌ", number: "plural", other: "هَرَمٌ" },
  { arabic: "مَتْحَفٌ", number: "singular", other: "مَتَاحِفُ" },
  { arabic: "كَنِيسَةٌ", number: "singular", other: "كَنَائِسُ" },
  { arabic: "ضُيُوفٌ", number: "plural", other: "ضَيْفٌ" },
  { arabic: "سُيَّاحٌ", number: "plural", other: "سَائِحٌ" },
  { arabic: "مِصْرِيُّونَ", number: "plural", other: "مِصْرِيٌّ" },
];
const NAME_ADJECTIVE: MatchContent = {
  promptTitle: "Der Name",
  optionTitle: "Die Eigenschaft",
  prompts: [
    { id: "na0", arabic: "مَدِينَةٌ", answer: "nb0", example: true, result: { arabic: "مَدِينَةٌ كَبِيرَةٌ", german: "eine große Stadt" } },
    { id: "na1", arabic: "مَنَاطِقُ", answer: "nb1", result: { arabic: "مَنَاطِقُ كَثِيرَةٌ", german: "viele Viertel" } },
    { id: "na2", arabic: "نَهْرٌ", answer: "nb2", result: { arabic: "نَهْرٌ طَوِيلٌ", german: "ein langer Fluss" } },
    { id: "na3", arabic: "آثَارٌ", answer: "nb3", result: { arabic: "آثَارٌ فِرْعَوْنِيَّةٌ", german: "pharaonische Denkmäler" } },
    { id: "na4", arabic: "الْجَوُّ", answer: "nb4", result: { arabic: "الْجَوُّ مُعْتَدِلٌ", german: "das Wetter ist mild" } },
  ],
  options: [
    { id: "nb0", label: "أ", arabic: "كَبِيرَةٌ" },
    { id: "nb1", label: "ب", arabic: "كَثِيرَةٌ" },
    { id: "nb2", label: "ج", arabic: "طَوِيلٌ" },
    { id: "nb3", label: "د", arabic: "فِرْعَوْنِيَّةٌ" },
    { id: "nb4", label: "هـ", arabic: "مُعْتَدِلٌ" },
  ],
};

// ------------------------------------------------------------------ p. 32 · تدريب ١١: "رتب الكلمات لتكون جملا مع التشكيل"
// (item 4 is left out: its word "في الدار البيضاء" does not fit a sentence as printed)
const SORT: Array<{ n: string; words: string[]; solutions: number[][] }> = [
  { n: "١", words: ["صَغِيرَةٌ", "حَقِيبَةٌ", "هَلْ هَذِهِ؟"], solutions: [[2, 1, 0]] },
  { n: "٢", words: ["الْحَمْدُ لِلَّهِ", "مُنْخَفِضٌ", "الرَّادْيُو صَوْتُهُ"], solutions: [[0, 2, 1], [2, 1, 0]] },
  { n: "٣", words: ["مَادُونَّا", "جِدًّا", "جَمِيلَةٌ", "مُغَنِّيَةٌ"], solutions: [[0, 3, 2, 1]] },
  { n: "٥", words: ["بَارِيس", "فِي", "طَوِيلٌ", "الشَّانْزِلِيزِيه", "شَارِعٌ"], solutions: [[3, 4, 2, 1, 0]] },
  { n: "٦", words: ["جِبَالُ الْأَلْبِ", "بَيْضَاءُ", "جِبَالٌ", "جَمِيلَةٌ", "وَعَالِيَةٌ"], solutions: [[0, 2, 1, 3, 4], [0, 2, 3, 4, 1]] },
  { n: "٧", words: ["بَلَدٌ", "الصُّومَالُ", "أَفْرِيقِيٌّ", "فَقِيرٌ"], solutions: [[1, 0, 2, 3]] },
];

// ------------------------------------------------------------------ the lesson
const rules = (arabic: string, german: string) => ({ arabic, german });

export const a2Shaqqati: A1Lesson = {
  slug: "shaqqati",
  kind: "topic",
  label: "شَقَّتِي الْجَدِيدَةُ",
  labelGerman: "Meine neue Wohnung",
  adjectives: ["كَبِيرٌ", "صَغِيرٌ", "طَوِيلٌ", "قَصِيرٌ", "جَمِيلٌ", "قَبِيحٌ", "جَدِيدٌ", "قَدِيمٌ", "نَظِيفٌ", "قَذِرٌ", "وَاسِعٌ", "ضَيِّقٌ", "عَالِي", "مُنْخَفِضٌ", "مُرِيحٌ", "مُتْعِبٌ", "مُضِيءٌ", "مُظْلِمٌ", "غَنِيٌّ", "فَقِيرٌ", "نَشِيطٌ", "كَسْلَانُ", "رَفِيعٌ", "سَمِينٌ", "بَدِينٌ", "هَادِئٌ", "مُزْدَحِمٌ", "كَثِيرٌ", "قَلِيلٌ", "غَالِي", "رَخِيصٌ", "لَطِيفٌ", "مُعْتَدِلٌ", "فِرْعَوْنِيّ", "إِسْلَامِيّ", "قِبْطِيّ", "رَائِعٌ", "مَفْرُوشٌ", "كَهْرَبَائِيّ", "كَامِلٌ", "مُنَاسِبٌ", "خَاصٌّ", "حَدِيثٌ", "شَرْقِيّ", "بَحْرِيّ", "عَرِيضٌ", "غَرْبِيّ", "أُرْدُنِّيّ", "مِصْرِيّ", "ضَخْمٌ", "بَارِدٌ", "جَمِيلٌ", "سَعِيدٌ", "مَرِيضٌ"],
  steps: [
    {
      slug: "step-1",
      kind: "words",
      title: "Gegensätze: die Bilder",
      navLabel: "Bilder",
      instruction: rules("اُدْرُسْ هَذِهِ الْكَلِمَاتِ ثُمَّ اكْتُبِ الرَّقْمَ أَمَامَ الصِّفَةِ الَّتِي تَسْمَعُهَا.", "Lerne diese Wörter. Hör jedes Adjektiv und sprich es nach – die zwei Wörter eines Bildpaares stehen zusammen."),
      groups: [P16],
    },
    {
      slug: "step-2",
      kind: "phrases",
      guided: true,
      title: "Lesen: Alaas Wohnung",
      navLabel: "Text",
      instruction: rules("النَّصُّ ٣", "Alaa beschreibt seine Wohnung. Hör jeden Satz, lies mit und sprich ihn nach."),
      groups: [
        {
          id: "alaa-text",
          image: { src: `${IMG}/scenes/shaqqati-plan.webp`, alt: "Grundriss von Alaas Wohnung: Schlafzimmer, Wohnzimmer, Küche und Bad" },
          title: "Mein Name ist Alaa …",
          titleArabic: "النَّصُّ",
          flow: true,
          items: ALAA_TEXT,
        },
      ],
    },
    {
      slug: "step-3",
      kind: "quiz",
      title: "Fragen zum Text",
      navLabel: "Fragen",
      instruction: rules("اِقْرَأِ النَّصَّ فِي الْجُزْءِ الْأَوَّلِ وَأَجِبْ.", "Lies den Text und antworte."),
      items: ALAA_QUESTIONS,
    },
    {
      slug: "step-4",
      kind: "cloze",
      title: "Lies noch einmal und ergänze",
      navLabel: "Ergänzen",
      instruction: rules("اِقْرَأْ مَرَّةً أُخْرَى وَأَكْمِلْ.", "Lies den Text noch einmal und ergänze die Sätze."),
      items: ALAA_GAPS,
    },
    {
      slug: "step-5",
      kind: "table",
      title: "Regel ٤: فِيهِ · فِيهَا · بِهِ · بِهَا",
      navLabel: "Regel ٤",
      instruction: rules("لَاحِظِ الْقَوَاعِدَ ٤", "Beachte die Regeln 4: erstens die Bedeutung, zweitens das Pronomen."),
      tables: RULE_4,
      quiz: [],
    },
    {
      slug: "step-6",
      kind: "table",
      title: "Regel ٥: die Verneinung",
      navLabel: "Regel ٥",
      instruction: rules("ثَالِثًا: النَّفْيُ ٥", "Drittens: die Verneinung."),
      tables: RULE_5,
      quiz: [],
    },
    {
      slug: "step-7",
      kind: "match",
      title: "Übung ١: Wörter verbinden",
      navLabel: "Übung ١",
      instruction: rules("تَدْرِيبٌ (١): صِلِ الْكَلِمَاتِ لِتُكَوِّنَ جُمْلَةً صَحِيحَةً. مِثَالٌ: الْحَقِيبَةُ فِيهَا قَلَمٌ صَغِيرٌ.", "Übung 1: Bilde Sätze wie im Buch – jede Zeile hat das Wort, ein Pronomen (فِيهِ / فِيهَا / بِهِ / بِهَا) und den Rest des Satzes. Das Pronomen richtet sich nach dem Wort. Das Buch gibt keine Lösung – es zählt, was sinnvoll ist."),
      match: CONNECT,
    },
    {
      slug: "step-8",
      kind: "table",
      title: "Regel ٦: das Adjektiv (Zahl, bestimmt)",
      navLabel: "Regel ٦",
      instruction: rules("رَابِعًا: الصِّفَاتُ ٦ – الصِّفَةُ تَتْبَعُ الْمَوْصُوفَ فِي التَّعْرِيفِ وَالتَّنْكِيرِ وَالْعَدَدِ وَالتَّذْكِيرِ وَالتَّأْنِيثِ وَالْإِعْرَابِ.", "Das Adjektiv richtet sich nach dem Nomen: bestimmt/unbestimmt, Zahl, Geschlecht und Fall."),
      tables: RULE_6,
      quiz: [],
    },
    {
      slug: "step-9",
      kind: "table",
      title: "Regel ٧: das Adjektiv (Geschlecht, Plural)",
      navLabel: "Regel ٧",
      instruction: rules("الصِّفَاتُ ٧", "Das Adjektiv: Geschlecht und Plural."),
      tables: RULE_7,
      quiz: [],
    },
    {
      slug: "step-10",
      kind: "table",
      title: "Regel ٨: das Adjektiv (Menschen, Dinge, Fall)",
      navLabel: "Regel ٨",
      instruction: rules("الصِّفَاتُ ٨", "Das Adjektiv: Menschen, Dinge und Fall."),
      tables: RULE_8,
      quiz: [],
    },
    {
      slug: "step-11",
      kind: "table",
      title: "Beachte: die Verneinung mit لَيْسَ",
      navLabel: "لَيْسَ",
      instruction: rules("لَاحِظِ: النَّفْيَ", "Beachte: die Verneinung."),
      tables: RULE_NEG,
      quiz: [],
    },
    {
      slug: "step-12",
      kind: "words",
      title: "Übung ٢: Gegensätze (1)",
      navLabel: "Übung ٢ · 1",
      instruction: rules("تَدْرِيبٌ (٢) كَلِمَاتٌ مُفِيدَةٌ: اُدْرُسِ الصِّفَاتِ وَعَكْسَهَا.", "Übung 2: Lerne die Adjektive und ihre Gegensätze. Hör beide Wörter und sprich sie nach."),
      groups: [oppositeWords(OPPOSITES[0]!)],
    },
    {
      slug: "step-13",
      kind: "words",
      title: "Übung ٢: Gegensätze (2)",
      navLabel: "Übung ٢ · 2",
      instruction: rules("اُدْرُسِ الصِّفَاتِ وَعَكْسَهَا.", "Die zweite Tabelle: Adjektive und ihre Gegensätze."),
      groups: [oppositeWords(OPPOSITES[1]!)],
    },
    {
      slug: "step-14",
      kind: "cloze",
      title: "Übung ٢: das passende Adjektiv",
      navLabel: "Übung ٢ · 3",
      instruction: rules("اخْتَرْ كَلِمَةً مُنَاسِبَةً مِنَ الصِّفَاتِ التَّالِيَةِ وَأَكْمِلِ الْجُمْلَةَ مَعَ التَّشْكِيلِ. مِثَالٌ: حُجْرَةُ الْمَعِيشَةِ فِي بَيْتِي مُضِيئَةٌ وَأَيْضًا وَاسِعَةٌ.", "Wähle ein passendes Adjektiv in der richtigen Form. Das Buch gibt keine Lösung – jedes passende Adjektiv zählt. Die Nummer ٩ fehlt im Buch."),
      items: ADJECTIVE_ITEMS,
      bank: bankOf(ADJECTIVE_ITEMS),
    },
    {
      slug: "step-15",
      kind: "quiz",
      title: "Übung ٣: verneinen",
      navLabel: "Übung ٣",
      instruction: rules("تَدْرِيبٌ (٣): اُكْتُبْ هَذِهِ الْجُمَلَ فِي النَّفْيِ كَالْمِثَالِ مَعَ التَّشْكِيلِ. مِثَالٌ: هَذِهِ سَيِّدَةٌ لَطِيفَةٌ ← هَذِهِ لَيْسَتْ سَيِّدَةً لَطِيفَةً.", "Übung 3: Verneine die Sätze wie im Beispiel."),
      items: NEGATION_ITEMS,
    },
    {
      slug: "step-16",
      kind: "cloze",
      title: "Übung ٤: ergänze den Satz",
      navLabel: "Übung ٤",
      instruction: rules("تَدْرِيبٌ (٤): أَكْمِلِ الْجُمْلَةَ بِصِفَةٍ أَوْ كَلَامٍ مُنَاسِبٍ مَعَ التَّشْكِيلِ.", "Übung 4: Ergänze den Satz mit einem Adjektiv oder passenden Worten. Mehrere Antworten sind richtig."),
      items: COMPLETE_ITEMS,
    },
    {
      slug: "step-17",
      kind: "cloze",
      title: "Übung ٧: ein passendes Adjektiv",
      navLabel: "Übung ٧",
      instruction: rules("تَدْرِيبٌ (٧): اُكْتُبْ صِفَةً مُنَاسِبَةً لِهَذِهِ الْكَلِمَاتِ. كَلِمَاتٌ مُفِيدَةٌ: عَالِمٌ – مُتَخَصِّصٌ – الطَّقْسُ – آثَارٌ.", "Übung 7: Wähle ein passendes Adjektiv. Neue Wörter: عَالِمٌ (Wissenschaftler) · مُتَخَصِّصٌ (Fachmann) · الطَّقْسُ (das Wetter) · آثَارٌ (Denkmäler)."),
      items: SUITABLE_ITEMS,
    },
    {
      slug: "step-18",
      kind: "dialogue",
      mode: "read",
      title: "Übung ٨ أ: Samira und Salwa",
      navLabel: "Dialog 1",
      instruction: rules("تَدْرِيبٌ (٨) أ: اِقْرَأْ هَذَا الْحِوَارَ. اُنْظُرْ إِلَى الصُّوَرِ وَأَجِبْ: مَنْ رِيهَام؟", "Übung 8 a: Lies den Dialog, schau dir die Bilder an und antworte: Wer ist Riham?"),
      dialogue: samiraSalwa,
    },
    {
      slug: "step-19",
      kind: "dialogue",
      mode: "audio",
      title: "Übung ٨ ب: Safaa und Nawal",
      navLabel: "Dialog 2",
      instruction: rules(
        "صَدِيقَتُنَا هَنَاء – اِسْمَعْ هَذَا الْحِوَارَ ثُمَّ أَجِبْ.",
        "Unsere Freundin Hanaa – hör den Dialog (so oft du willst) und antworte."
      ),
      dialogue: safaaNawal,
      quiz: [...HANAA_QUESTIONS, { ...TRUE_FALSE[0]!, section: { arabic: "ضَعْ عَلَامَةَ صَحٍّ (✓) أَوْ خَطَأٍ (✗):", german: "Setze ✓ (richtig) oder ✗ (falsch):" } }, ...TRUE_FALSE.slice(1)],
    },
    {
      slug: "step-20",
      kind: "phrases",
      title: "Lesen: Marks Brief",
      navLabel: "Brief",
      instruction: rules("هَذِهِ الرِّسَالَةُ مِنْ طَالِبٍ أَجْنَبِيٍّ إِلَى أُسْرَتِهِ. اِقْرَأِ النَّصَّ ثُمَّ أَجِبْ:", "Dieser Brief ist von einem ausländischen Studenten an seine Familie. Lies den Text und antworte."),
      groups: [{ id: "mark-letter", title: "Ein Brief aus Kairo", titleArabic: "نَصُّ الرِّسَالَةِ", flow: true, items: LETTER }],
      reading: [
        { heading: { arabic: "الْقِرَاءَةُ الْأُولَى", german: "Erste Lesung" }, kind: "quiz", items: LETTER_FIRST },
        { heading: { arabic: "الْقِرَاءَةُ الثَّانِيَةُ", german: "Zweite Lesung" }, kind: "cloze", items: LETTER_GAPS },
        { heading: { arabic: "٣ – اُكْتُبْ مِنَ النَّصِّ الِاسْمَ وَالصِّفَةَ.", german: "Suche im Brief das Nomen und sein Adjektiv. Das Beispiel: مَدِينَةٌ – كَبِيرَةٌ." }, kind: "match", match: NAME_ADJECTIVE },
        { heading: { arabic: "٤ – اِسْتَخْرِجْ مِنَ النَّصِّ الْمُفْرَدَ أَوِ الْجَمْعَ وَاكْتُبْ فِي الْجَدْوَلِ كَالْمِثَالِ.", german: "Such im Text Nomen im Singular oder Plural: tippe ein Wort an und wähle Einzahl oder Mehrzahl. Das Beispiel: أَثَرٌ – آثَارٌ." }, kind: "number", words: LETTER_NUMBERS },
        {
          heading: { arabic: "٥ – اُكْتُبْ ثَلَاثَ جُمَلٍ. اِسْتَخْدِمْ كَلِمَاتِ الْجَدْوَلِ لِمُسَاعَدَتِكَ.", german: "Schreib drei Sätze. Die Wörter der Tabelle helfen dir." },
          kind: "write",
          count: 3,
          example: "الْقَاهِرَةُ مَدِينَةٌ كَبِيرَةٌ.",
          words: [...new Set([...LETTER_NUMBERS.flatMap((word) => [word.arabic, word.other]), ...NAME_ADJECTIVE.options.flatMap((option) => (option.arabic ? [option.arabic] : [])), "الْقَاهِرَةُ", "بِهَا", "فِيهَا"])],
        },
      ],
    },
    {
      slug: "step-21",
      kind: "sentences",
      title: "Übung ١١: Wörter ordnen",
      navLabel: "Wörter ordnen",
      instruction: rules("تَدْرِيبٌ (١١): رَتِّبِ الْكَلِمَاتِ لِتُكَوِّنَ جُمَلًا مَعَ التَّشْكِيلِ.", "Übung 11: Bring die Wörter in die richtige Reihenfolge, sodass Sätze entstehen."),
      items: SORT.map(({ n, words, solutions }) => ({ id: `s${n}`, number: n, words, solutions })),
    },
    {
      slug: "step-22",
      kind: "worksheet",
      title: "Übung ١٢: Sätze ergänzen",
      navLabel: "Übung ١٢",
      instruction: rules("تَدْرِيبٌ (١٢): أَكْمِلِ الْجُمَلَ بِكَلِمَاتٍ مِنْ عِنْدِكَ:", "Übung 12: Vervollständige die Sätze mit eigenen Wörtern."),
      parts: [{ kind: "free-gaps", items: FREE_GAPS }],
    },
    {
      slug: "step-23",
      kind: "worksheet",
      title: "Übung ١٣: Anzeigen",
      navLabel: "Übung ١٣",
      instruction: rules("تَدْرِيبٌ (١٣) مَنَازِلُ وَشُقَقٌ لِلْإِيجَارِ: اِقْرَأِ الْإِعْلَانَاتِ:", "Übung 13: Häuser und Wohnungen zu vermieten. Lies die Anzeigen."),
      parts: [
        {
          kind: "text",
          blocks: [
            { lines: [AD_FLAT] },
            { lines: [AD_HOUSE], image: { src: `${IMG}/scenes/ad-house.webp`, alt: "Ein Haus mit Balkon und Garten" } },
          ],
        },
        { heading: { arabic: "١ – ضَعْ خَطًّا تَحْتَ الصِّفَاتِ فِي كُلِّ إِعْلَانٍ.", german: "Unterstreiche in jeder Anzeige die Adjektive: tippe sie an." }, kind: "mark", lines: [AD_FLAT, AD_HOUSE], words: AD_ADJECTIVES, label: "Adjektive" },
        {
          heading: { arabic: "٢ – اُذْكُرْ عَنْ كُلِّ إِعْلَانٍ كَالْمِثَالِ: الشَّقَّةُ بِهَا … وَفِيهَا …", german: "Sag zu jeder Anzeige, was die Wohnung / das Haus hat, wie im Beispiel." },
          kind: "free-gaps",
          items: [
            { id: "ad1", number: "١", parts: ["الشَّقَّةُ بِهَا", null, "وَفِيهَا", null, "."], gaps: [{ model: "أَرْبَعُ حُجُرَاتٍ" }, { model: "ثَلَاثَةُ مُكَيِّفَاتٍ" }] },
            { id: "ad2", number: "٢", parts: ["الْبَيْتُ بِهِ", null, "وَفِيهِ", null, "."], gaps: [{ model: "حَدِيقَةٌ وَاسِعَةٌ" }, { model: "ثَمَانِيَةُ حَمَّامَاتٍ" }] },
          ],
        },
        { heading: { arabic: "٣ – اُذْكُرِ الْجَمْعَ أَوِ الْمُفْرَدَ لِلْأَسْمَاءِ الَّتِي فِي الْإِعْلَانِ.", german: "Tippe ein Nomen der Anzeigen an und wähle Einzahl oder Mehrzahl." }, kind: "number", lines: [AD_FLAT, AD_HOUSE], words: AD_NUMBERS },
        { heading: { arabic: "٤ – اُكْتُبْ إِعْلَانًا عَنْ شَقَّتِكَ وَاكْتُبْ وَصْفَ الشَّقَّةِ.", german: "Schreib eine Anzeige über deine Wohnung und beschreibe sie." }, kind: "write", count: 1, rows: 5, words: [], noun: "Anzeigen", minWords: 3, model: "شَقَّةٌ جَدِيدَةٌ، ثَلَاثُ حُجُرَاتٍ وَصَالَةٌ، مَطْبَخٌ نَظِيفٌ، السِّعْرُ مُنَاسِبٌ." },
        { heading: { arabic: "٥ – اُكْتُبْ عَنْ مَدِينَةٍ فِي بَلَدِكَ، صِفْ أَهَمَّ الْأَمَاكِنِ.", german: "Schreib über eine Stadt in deinem Land und beschreibe die wichtigsten Orte." }, kind: "write", count: 1, rows: 5, words: [], noun: "Texten", minWords: 3, model: "الْقَاهِرَةُ مَدِينَةٌ كَبِيرَةٌ، فِيهَا آثَارٌ فِرْعَوْنِيَّةٌ وَنَهْرٌ طَوِيلٌ." },
      ],
    },
    {
      slug: "step-24",
      kind: "worksheet",
      title: "Gespräch: Übung ١٤ und ١٥",
      navLabel: "Gespräch",
      instruction: rules("تَدْرِيبَاتُ الْمُحَادَثَةِ", "Gesprächsübungen: Beschreibe und frage – hier schreibst du deine Antworten auf."),
      parts: [
        {
          heading: { arabic: "تَدْرِيبٌ (١٤) مَنْ هِيَ / هُوَ؟", german: "Übung 14: Wer ist das? Student A beschreibt eine Person der Klasse, Student B rät." },
          kind: "text",
          blocks: [
            {
              lines: ["طَالِبٌ أ: صِفْ لِزَمِيلِكَ مِثْلَ الصُّورَةِ عَنْ شَخْصِيَّاتٍ فِي الْفَصْلِ.", "طَالِبٌ ب: يُحَاوِلُ مَعْرِفَةَ زَمِيلِهِ / تِهِ."],
              image: { src: `${IMG}/scenes/classroom.webp`, alt: "Zwei Schüler an der Tafel: einer beschreibt einen Mitschüler, der andere rät" },
            },
          ],
        },
        { kind: "write", count: 2, rows: 2, noun: "Beschreibungen", describing: true, model: "هِيَ قَصِيرَةٌ وَشَعْرُهَا طَوِيلٌ.", example: "هُوَ طَوِيلٌ وَشَعْرُهُ قَصِيرٌ.", words: ["هُوَ", "هِيَ", "طَوِيلٌ", "طَوِيلَةٌ", "قَصِيرٌ", "قَصِيرَةٌ", "شَعْرُهُ", "شَعْرُهَا", "رَفِيعَةٌ", "سَمِينَةٌ", "جَمِيلَةٌ", "نَشِيطَةٌ", "كَسْلَانَةٌ"] },
        {
          heading: { arabic: "تَدْرِيبٌ (١٥) شَقَّتِي بِهَا … اِسْأَلْ زَمِيلَكَ / زَمِيلَتَكَ عَنْ وَصْفِ شَقَّتِهِ. اُكْتُبِ الْمَعْلُومَاتِ فِي الْجَدْوَلِ.", german: "Übung 15: Frag deinen Partner nach seiner Wohnung und trag die Angaben in die Tabelle ein." },
          kind: "fill-table",
          first: "الطَّالِبُ",
          columns: ["اِتِّجَاهُ الشَّقَّةِ: شَرْقِيَّةٌ …", "الشَّقَّةُ بِهَا / الْمَطْبَخُ لَيْسَ فِيهِ"],
          rows: 5,
        },
      ],
    },
  ],
};
