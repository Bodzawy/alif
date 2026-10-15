import type { A1Lesson, ClozeItem, ClozePart, Dialogue, DialogueSpeaker, MatchContent, PhraseItem, TableCell } from "@/data/types";
import { transliterate } from "@/lib/arabic/transliterate";

import { unvocalised } from "../letter-lesson";
import { lines } from "../sabah-al-khayr";

// Unit 5 · تقديم (١) "كِتَابُ مَنْ هَذَا؟" (book pages 151–159, PDF 183–191):
//   the presentation (Khalid's class, 9 sentences), لاحظ القواعد (ownership,
//   هَذِهِ for plurals of things, ة and Tanwin), تدريب ١–٧ (٤: the text
//   "صَدِيقِي زَيْد", ٥: the listening text of p. 159), المحادثة تدريب ١–٣ (class).

const IMG = "/images/a1/unit-5";
const gap = (accept: string[], options: string[]): ClozePart => ({ accept, options });
const sorted = (xs: string[]) => [...new Set(xs)].sort((a, b) => a.localeCompare(b, "ar"));
const sp = (id: string, name: string, voice: DialogueSpeaker["voice"], alt: string): DialogueSpeaker => ({ id, name, voice, avatar: { src: `${IMG}/${id}.svg`, alt } });

/** The pronoun endings: [pronoun, ending after a consonant, ending after ة (ـتـ)]. */
const SUFFIX: Record<string, [string, string]> = {
  "هُوَ": ["هُ", "ـهُ"], "هِيَ": ["هَا", "ـهَا"], "هُمَا": ["هُمَا", "ـهُمَا"], "هُمْ": ["هُمْ", "ـهُمْ"], "هُنَّ": ["هُنَّ", "ـهُنَّ"],
  "أَنَا": ["ي", "ـي"], "نَحْنُ": ["نَا", "ـنَا"], "أَنْتَ": ["كَ", "ـكَ"],
};

/** The presentation: [question, answer, short answer] – the gaps of the book (rows 2–4 leave the thing open: Alif uses كِتَاب). */
const PRESENTATION: ClozeItem[] = [
  { id: "p1", hint: "Beispiel im Buch", lines: [{ label: "١", parts: ["مِفْتَاحُ مَنْ هَذَا؟"] }, { label: "", parts: ["هَذَا مِفْتَاحُ مَاجِدَة."] }, { label: "", parts: ["هَذَا مِفْتَاحُهَا."] }] },
  { id: "p2", hint: "Wail – ein Mann", lines: [{ label: "٢", parts: ["كِتَابُ مَنْ هَذَا؟"] }, { label: "", parts: ["هَذَا كِتَابُ وَائِل."] }, { label: "", parts: [gap(["هَذَا كِتَابُهُ."], sorted(["هَذَا كِتَابُهُ.", "هَذَا كِتَابُهَا.", "هَذَا كِتَابِي."]))] }] },
  { id: "p3", hint: "du (ein Mann)", lines: [{ label: "٣", parts: ["كِتَابُ مَنْ هَذَا؟"] }, { label: "", parts: ["هَذَا كِتَابُ … أَنْتَ."] }, { label: "", parts: [gap(["هَذَا كِتَابُكَ."], sorted(["هَذَا كِتَابُكَ.", "هَذَا كِتَابِي.", "هَذَا كِتَابُهُ."]))] }] },
  { id: "p4", hint: "ich", lines: [{ label: "٤", parts: ["كِتَابُ مَنْ هَذَا؟"] }, { label: "", parts: ["هَذَا كِتَابُ … أَنَا."] }, { label: "", parts: [gap(["هَذَا كِتَابِي."], sorted(["هَذَا كِتَابِي.", "هَذَا كِتَابُكَ.", "هَذَا كِتَابُنَا."]))] }] },
  { id: "p5", hint: "Walaa und Suad – zwei Frauen", lines: [{ label: "٥", parts: ["طَاوِلَةُ مَنْ هَذِهِ؟"] }, { label: "", parts: ["هَذِهِ ", gap(["طَاوِلَةُ"], ["طَاوِلَةُ", "طَاوِلَتُهُمَا"]), " وَلَاء وَسُعَاد."] }, { label: "", parts: ["هَذِهِ ", gap(["طَاوِلَتُهُمَا."], sorted(["طَاوِلَتُهُمَا.", "طَاوِلَتُهُنَّ.", "طَاوِلَتُهَا."]))] }] },
  { id: "p6", hint: "Adil und Talal – zwei Männer", lines: [{ label: "٦", parts: ["أَوْرَاقُ مَنْ هَذِهِ؟"] }, { label: "", parts: ["هَذِهِ ", gap(["أَوْرَاقُ"], ["أَوْرَاقُ", "أَوْرَاقُهُمَا"]), " عَادِل وَطَلَال."] }, { label: "", parts: ["هَذِهِ ", gap(["أَوْرَاقُهُمَا."], sorted(["أَوْرَاقُهُمَا.", "أَوْرَاقُهُمْ.", "أَوْرَاقُهُ."]))] }] },
  { id: "p7", hint: "Muhammad, Nagi und Ibrahim – drei Männer", lines: [{ label: "٧", parts: ["صُوَرُ مَنْ هَذِهِ؟"] }, { label: "", parts: ["هَذِهِ ", gap(["صُوَرُ"], ["صُوَرُ", "صُوَرُهُمْ"]), " مُحَمَّد وَنَاجِي وَإِبْرَاهِيم."] }, { label: "", parts: ["هَذِهِ ", gap(["صُوَرُهُمْ."], sorted(["صُوَرُهُمْ.", "صُوَرُهُنَّ.", "صُوَرُهُمَا."]))] }] },
  { id: "p8", hint: "Alyaa, Amina und Nada – drei Frauen", lines: [{ label: "٨", parts: ["كَرَاسِي مَنْ هَذِهِ؟"] }, { label: "", parts: ["هَذِهِ ", gap(["كَرَاسِي"], ["كَرَاسِي", "كَرَاسِيهِنَّ"]), " عَلْيَاء وَأَمِينَة وَنَدَى."] }, { label: "", parts: ["هَذِهِ ", gap(["كَرَاسِيهِنَّ."], sorted(["كَرَاسِيهِنَّ.", "كَرَاسِيهِمْ.", "كَرَاسِيهَا."]))] }] },
  { id: "p9", hint: "wir", lines: [{ label: "٩", parts: ["فَصْلُ مَنْ هَذَا؟"] }, { label: "", parts: ["هَذَا ", gap(["فَصْلُ"], ["فَصْلُ", "فَصْلُنَا"]), " نَحْنُ."] }, { label: "", parts: ["هَذَا ", gap(["فَصْلُنَا."], sorted(["فَصْلُنَا.", "فَصْلِي.", "فَصْلُكُمْ."]))] }] },
];

/** لاحظ القواعد (٢): كِتَابُ مَنْ هَذَا؟ (masculine) – حَقِيبَةُ مَنْ هَذِهِ؟ (feminine), by pronoun. */
const OWNERSHIP: Array<[pronoun: string, kitab: string, haqiba: string, de: string]> = [
  ["هُوَ", "هَذَا كِتَابُ أَحْمَد. هَذَا كِتَابُهُ.", "هَذِهِ حَقِيبَتُهُ.", "er"],
  ["هِيَ", "هَذَا كِتَابُ زَيْنَب. هَذَا كِتَابُهَا.", "هَذِهِ حَقِيبَتُهَا.", "sie"],
  ["هُمَا", "هَذَا كِتَابُ عَلَاء وَنَادِر. هَذَا كِتَابُهُمَا.", "هَذِهِ حَقِيبَتُهُمَا.", "die beiden (Männer)"],
  ["هُمَا", "هَذَا كِتَابُ لَيْلَى وَفَاطِمَة. هَذَا كِتَابُهُمَا.", "هَذِهِ حَقِيبَتُهُمَا.", "die beiden (Frauen)"],
  ["هُمْ", "هَذَا كِتَابُ سَمِير وَهَانِي وَعَلِيّ. هَذَا كِتَابُهُمْ.", "هَذِهِ حَقِيبَتُهُمْ.", "sie (Männer)"],
  ["هُنَّ", "هَذَا كِتَابُ عَائِشَة وَنَادِيَة وَسُوزِي. هَذَا كِتَابُهُنَّ.", "هَذِهِ حَقِيبَتُهُنَّ.", "sie (Frauen)"],
  ["أَنَا", "(كِتَاب + أَنَا) هَذَا كِتَابِي.", "هَذِهِ حَقِيبَتِي.", "ich"],
  ["نَحْنُ", "(كِتَاب + نَحْنُ) هَذَا كِتَابُنَا.", "هَذِهِ حَقِيبَتُنَا.", "wir"],
];
const spoken = (s: string) => s.replace(/^\([^)]*\)\s*/, "");

const phrase = (id: string, arabic: string, german: string): PhraseItem => ({ id, arabic, transliteration: transliterate(arabic), german, exercise: { id, target: unvocalised(arabic).replace(/[.؟?]/g, ""), modelText: arabic } });

/** تدريب ١: (أ) question – (ب) answer – (ج) short answer. */
const T1: Array<[q: string, a: string, c: string]> = [
  ["قَلَمُ مَنْ هَذَا؟", "هَذَا قَلَمُ هَانِي.", "هَذَا قَلَمُهُ."],
  ["حَقِيبَةُ مَنْ هَذِهِ؟", "هَذِهِ حَقِيبَةُ سِهَام.", "هَذِهِ حَقِيبَتُهَا."],
  ["كُرَّاسَاتُ مَنْ هَذِهِ؟", "هَذِهِ كُرَّاسَاتُ نَبِيلَة وَإِلْهَام.", "هَذِهِ كُرَّاسَاتُهُمَا."],
  ["مِفْتَاحُ مَنْ هَذَا؟", "هَذَا مِفْتَاح + أَنَا.", "هَذَا مِفْتَاحِي."],
  ["طَاوِلَةُ مَنْ هَذِهِ؟", "هَذِهِ طَاوِلَةُ مَاجِد وَرَؤُوف.", "هَذِهِ طَاوِلَتُهُمَا."],
  ["فَصْلُ مَنْ هَذَا؟", "هَذَا فَصْل + نَحْنُ.", "هَذَا فَصْلُنَا."],
  ["صُوَرُ مَنْ هَذِهِ؟", "هَذِهِ صُوَرُ مُنَى وَشَادِيَة وَأَمَل.", "هَذِهِ صُوَرُهُنَّ."],
  ["كُتُبُ مَنْ هَذِهِ؟", "هَذِهِ كُتُبُ أَيْمَن وَأَحْمَد وَعَلِيّ.", "هَذِهِ كُتُبُهُمْ."],
];
// The book's columns (ب) and (ج), top to bottom.
const T1_B = ["هَذِهِ كُرَّاسَاتُ نَبِيلَة وَإِلْهَام.", "هَذَا فَصْل + نَحْنُ.", "هَذَا قَلَمُ هَانِي.", "هَذِهِ حَقِيبَةُ سِهَام.", "هَذِهِ صُوَرُ مُنَى وَشَادِيَة وَأَمَل.", "هَذِهِ كُتُبُ أَيْمَن وَأَحْمَد وَعَلِيّ.", "هَذَا مِفْتَاح + أَنَا.", "هَذِهِ طَاوِلَةُ مَاجِد وَرَؤُوف."];
const T1_C = ["هَذَا فَصْلُنَا.", "هَذِهِ طَاوِلَتُهُمَا.", "هَذِهِ صُوَرُهُنَّ.", "هَذَا مِفْتَاحِي.", "هَذِهِ كُرَّاسَاتُهُمَا.", "هَذَا قَلَمُهُ.", "هَذِهِ حَقِيبَتُهَا.", "هَذِهِ كُتُبُهُمْ."];
const T1_AB: MatchContent = {
  promptTitle: "(أ)",
  optionTitle: "(ب)",
  prompts: T1.map(([q, a], n) => ({ id: `a${n + 1}`, arabic: q, answer: `b${T1_B.indexOf(a) + 1}` })),
  options: T1_B.map((b, n) => ({ id: `b${n + 1}`, label: b, arabic: b.replace(" + ", " ") })),
};
const T1_BC: MatchContent = {
  promptTitle: "(ب)",
  optionTitle: "(ج)",
  prompts: T1.map(([, a, c], n) => ({ id: `b${n + 1}`, arabic: a, answer: `c${T1_C.indexOf(c) + 1}`, result: { arabic: c, german: "" } })),
  options: T1_C.map((c, n) => ({ id: `c${n + 1}`, label: c, arabic: c })),
};

/** تدريب ٢: the school and the class – one sentence each for every pronoun (هُوَ is the book's model). */
const T2_PRONOUNS: Array<[pronoun: string, school: string, cls: string]> = [
  ["هُوَ", "هَذِهِ مَدْرَسَتُهُ.", "هَذَا فَصْلُهُ."],
  ["هِيَ", "هَذِهِ مَدْرَسَتُهَا.", "هَذَا فَصْلُهَا."],
  ["أَنَا", "هَذِهِ مَدْرَسَتِي.", "هَذَا فَصْلِي."],
  ["نَحْنُ", "هَذِهِ مَدْرَسَتُنَا.", "هَذَا فَصْلُنَا."],
  ["هُمَا", "هَذِهِ مَدْرَسَتُهُمَا.", "هَذَا فَصْلُهُمَا."],
  ["هُنَّ", "هَذِهِ مَدْرَسَتُهُنَّ.", "هَذَا فَصْلُهُنَّ."],
  ["هُمَا", "هَذِهِ مَدْرَسَتُهُمَا.", "هَذَا فَصْلُهُمَا."],
  ["هُمْ", "هَذِهِ مَدْرَسَتُهُمْ.", "هَذَا فَصْلُهُمْ."],
];
const SCHOOLS = T2_PRONOUNS.map((r) => r[1]);
const CLASSES = T2_PRONOUNS.map((r) => r[2]);
const T2: ClozeItem[] = [
  {
    id: "school",
    image: { src: `${IMG}/school.svg`, alt: "Eine Schule; davor viele Schüler" },
    lines: [{ label: "مَا هَذِهِ؟", parts: [gap(["هَذِهِ مَدْرَسَةٌ."], ["هَذِهِ مَدْرَسَةٌ.", "هَذَا فَصْلٌ."])] }, { label: "", parts: ["هَذِهِ مَدْرَسَةُ مَنْ؟"] }],
  },
  {
    id: "class",
    image: { src: `${IMG}/class.svg`, alt: "Ein Klassenzimmer: ein Lehrer an der Tafel, Schüler an Tischen" },
    lines: [{ label: "مَا هَذَا؟", parts: [gap(["هَذَا فَصْلٌ."], ["هَذِهِ مَدْرَسَةٌ.", "هَذَا فَصْلٌ."])] }, { label: "", parts: ["هَذَا فَصْلُ مَنْ؟"] }],
  },
  ...T2_PRONOUNS.map(([pronoun, school, cls], n) => ({
    id: `pr${n + 1}`,
    hint: n === 0 ? "Beispiel im Buch" : undefined,
    lines: [{ label: pronoun, parts: n === 0 ? [school, " ", cls] : [gap([school], sorted([school, ...SCHOOLS.filter((x) => x !== school).slice(n % 3, (n % 3) + 2)])), " ", gap([cls], sorted([cls, ...CLASSES.filter((x) => x !== cls).slice((n + 1) % 3, ((n + 1) % 3) + 2)]))] }],
  })),
];

/** تدريب ٣: question and answer under each picture; the owner under the picture. */
const T3: Array<[id: string, thing: string, m: boolean, owner: string, answer: string, src: string, alt: string]> = [
  ["hidha", "حِذَاء", true, "أَنَا", "هَذَا حِذَائِي.", "/images/a1/hha/hidha.svg", "Schuhe"],
  ["kutub", "كُتُب", false, "هُمْ", "هَذِهِ كُتُبُهُمْ.", "/images/a1/kaf/kutub.svg", "Bücher"],
  ["haqiba", "حَقِيبَة", false, "أَنَا", "هَذِهِ حَقِيبَتِي.", "/images/a1/hha/haqiba.svg", "Eine Aktentasche"],
  ["aqlam", "أَقْلَام", false, "هُنَّ", "هَذِهِ أَقْلَامُهُنَّ.", `${IMG}/aqlam.svg`, "Zwei Füller"],
  ["nazzara", "نَظَّارَة", false, "هِيَ", "هَذِهِ نَظَّارَتُهَا.", "/images/a1/unit-3/nazzara.svg", "Eine Brille"],
  ["nuqud", "نُقُود", false, "نَحْنُ", "هَذِهِ نُقُودُنَا.", "/images/a1/fa/fulus.svg", "Geldscheine und Münzen"],
  ["bait", "بَيْت", true, "هُمَا", "هَذَا بَيْتُهُمَا.", "/images/vocabulary/bait.svg", "Ein Haus"],
  ["mihfaza", "مِحْفَظَة", false, "هُوَ", "هَذِهِ مِحْفَظَتُهُ.", `${IMG}/mihfaza.svg`, "Eine Brieftasche"],
  ["awraq", "أَوْرَاق", false, "هُمَا", "هَذِهِ أَوْرَاقُهُمَا.", `${IMG}/awraq.svg`, "Ein Stapel Papier"],
];
const T3_ITEMS: ClozeItem[] = T3.map(([id, thing, m, owner, answer, src, alt], n) => {
  const q = `${m ? "هَذَا" : "هَذِهِ"} ${thing} مَنْ؟`;
  const wrong = Object.entries(SUFFIX).filter(([p]) => p !== owner).slice(n % 4, (n % 4) + 2).map(([, [s]]) => answer.replace(/(هُمَا|هُنَّ|هُمْ|هَا|هُ|ي|نَا)\.$/, `${s}.`));
  return {
    id,
    image: { src, alt },
    hint: `(${owner})`,
    lines: [
      { label: "سُؤَال", parts: n === 0 ? [q] : [gap([q], [q, `${m ? "هَذِهِ" : "هَذَا"} ${thing} مَنْ؟`])] },
      { label: "إِجَابَة", parts: n === 0 ? [answer] : [gap([answer], sorted([answer, ...wrong]))] },
    ],
  };
});

/** تدريب ٤: the text "صَدِيقِي زَيْد", sentence by sentence. */
const ZAID: Array<[arabic: string, german: string]> = [
  ["أَنَا اسْمِي خَالِد.", "Ich heiße Khalid."],
  ["صَدِيقِي اسْمُهُ زَيْد، زَيْد مِنَ الْكُوَيْتِ.", "Mein Freund heißt Zaid, Zaid kommt aus Kuwait."],
  ["هُوَ كُوَيْتِيّ.", "Er ist Kuwaiter."],
  ["نَحْنُ فِي بَيْتِ صَدِيقِي زَيْد.", "Wir sind im Haus meines Freundes Zaid."],
  ["هَذَا مَكْتَبُ صَدِيقِي زَيْد. هَذَا مَكْتَبُهُ.", "Das ist der Schreibtisch meines Freundes Zaid. Das ist sein Schreibtisch."],
  ["هُوَ زَمِيلِي فِي جَامِعَةِ الْقَاهِرَةِ.", "Er ist mein Kommilitone an der Universität Kairo."],
  ["هُوَ صَدِيقُ عَلَاء وَطَلَال وَشَيْمَاء وَسَمَر.", "Er ist der Freund von Alaa, Talal, Schaimaa und Samar."],
  ["هُوَ زَمِيلُهُمْ أَيْضًا.", "Er ist auch ihr Kommilitone."],
];
const ZAID_MATCH: MatchContent = {
  promptTitle: "(أ)",
  optionTitle: "(ب)",
  prompts: [
    { id: "z1", arabic: "١ – هَذَا مَكْتَبُ", answer: "zaid" },
    { id: "z2", arabic: "٢ – هُوَ زَمِيلِي", answer: "cairo" },
    { id: "z3", arabic: "٣ – هُوَ صَدِيقُ", answer: "alaa", accept: ["shaimaa"] },
    { id: "z4", arabic: "٤ – هُوَ", answer: "also" },
    { id: "z5", arabic: "٥ – هُوَ صَدِيقُ", answer: "shaimaa", accept: ["alaa"] },
    { id: "z6", arabic: "٦ – هَذَا", answer: "maktabuhu" },
  ],
  // The book's column (ب), top to bottom.
  options: [
    { id: "alaa", label: "عَلَاء وَطَلَال", arabic: "عَلَاء وَطَلَال" },
    { id: "shaimaa", label: "شَيْمَاء وَسَمَر", arabic: "شَيْمَاء وَسَمَر" },
    { id: "maktabuhu", label: "مَكْتَبُهُ", arabic: "مَكْتَبُهُ" },
    { id: "cairo", label: "فِي جَامِعَةِ الْقَاهِرَةِ", arabic: "فِي جَامِعَةِ الْقَاهِرَةِ" },
    { id: "zaid", label: "زَيْد", arabic: "زَيْد" },
    { id: "also", label: "زَمِيلُهُمْ أَيْضًا", arabic: "زَمِيلُهُمْ أَيْضًا" },
  ],
};
const ZAID_CLOZE: ClozeItem[] = [
  { id: "q1", lines: [{ label: "١", parts: ["بَيْتُ مَنْ هَذَا؟"] }, { label: "", parts: [gap(["هَذَا بَيْتُ زَيْد."], ["هَذَا بَيْتُ زَيْد.", "هَذَا بَيْتُ خَالِد.", "هَذَا بَيْتُ عَلَاء."])] }] },
  { id: "q2", lines: [{ label: "٢", parts: ["هَذَا مَكْتَبُ زَيْد. هَذَا ", gap(["مَكْتَبُهُ."], ["مَكْتَبُهُ.", "مَكْتَبِي.", "مَكْتَبُهُمْ."])] }] },
  { id: "q3", lines: [{ label: "٣", parts: ["زَيْد زَمِيلُ خَالِد. هُوَ زَمِيلُهُ."] }, { label: "", parts: ["زَيْد زَمِيلُ ", gap(["عَلَاء"], ["عَلَاء", "زَيْد"]), " وَ", gap(["طَلَال."], ["طَلَال.", "خَالِد."]), " هُوَ ", gap(["زَمِيلُهُمَا."], ["زَمِيلُهُمَا.", "زَمِيلُهُ.", "زَمِيلُهُنَّ."])] }] },
  { id: "q4", lines: [{ label: "٤", parts: ["زَيْد صَدِيقُ ", gap(["شَيْمَاء"], ["شَيْمَاء", "خَالِد"]), " وَ", gap(["سَمَر."], ["سَمَر.", "طَلَال."]), " هُوَ ", gap(["صَدِيقُهُمَا."], ["صَدِيقُهُمَا.", "صَدِيقُهَا.", "صَدِيقُهُمْ."])] }, { label: "", parts: ["زَيْد صَدِيقُ خَالِد. هُوَ ", gap(["صَدِيقُهُ."], ["صَدِيقُهُ.", "صَدِيقِي.", "صَدِيقُهَا."])] }] },
  { id: "q5", lines: [{ label: "٥", parts: ["مِنْ أَيْنَ زَيْد؟"] }, { label: "", parts: ["زَيْد مِنَ ", gap(["الْكُوَيْتِ."], ["الْكُوَيْتِ.", "الْقَاهِرَةِ.", "مِصْرَ."]), " هُوَ ", gap(["كُوَيْتِيّ."], ["كُوَيْتِيّ.", "مِصْرِيّ.", "كُوَيْتِيَّة."])] }] },
];

const sk = (id: string, name: string, voice: DialogueSpeaker["voice"], alt: string) => sp(id, name, voice, alt);
export const khalidShaimaa: Dialogue = {
  id: "khalid-shaimaa",
  intro: "In Zaids Zimmer: Khalid fragt Schaimaa, wem die Dinge gehören.",
  speakers: [sk("khalid", "Khalid", "male-1", "Khalid, ein junger Mann"), sk("shaimaa", "Schaimaa", "female-1", "Schaimaa, eine junge Frau")],
  lines: lines([
    ["u5-ks-1", "khalid", "مِحْفَظَةُ مَنْ هَذِهِ؟ هَذِهِ مِحْفَظَةُ مَنْ؟", "محفظة من هذه هذه محفظة من", "Miḥfaẓatu man hādhihi? Hādhihi miḥfaẓatu man?", "Wessen Brieftasche ist das?"],
    ["u5-ks-2", "shaimaa", "هَذِهِ مِحْفَظَةُ زَيْد. هَذِهِ مِحْفَظَتُهُ.", "هذه محفظة زيد هذه محفظته", "Hādhihi miḥfaẓatu Zayd. Hādhihi miḥfaẓatuhu.", "Das ist Zaids Brieftasche. Das ist seine Brieftasche."],
    ["u5-ks-3", "khalid", "وَأَوْرَاقُ مَنْ هَذِهِ؟", "وأوراق من هذه", "Wa-awrāqu man hādhihi?", "Und wessen Papiere sind das?"],
    ["u5-ks-4", "shaimaa", "هَذِهِ أَوْرَاقُ طَلَال وَعَلِيّ.", "هذه أوراق طلال وعلي", "Hādhihi awrāqu Ṭalāl wa-ʿAlī.", "Das sind die Papiere von Talal und Ali."],
    ["u5-ks-5", "khalid", "وَنَظَّارَةُ مَنْ هَذِهِ؟", "ونظارة من هذه", "Wa-naẓẓāratu man hādhihi?", "Und wessen Brille ist das?"],
    ["u5-ks-6", "shaimaa", "هَذِهِ نَظَّارَتِي.", "هذه نظارتي", "Hādhihi naẓẓāratī.", "Das ist meine Brille."],
    ["u5-ks-7", "khalid", "وَكَامِيرَا مَنْ هَذِهِ؟", "وكاميرا من هذه", "Wa-kāmīrā man hādhihi?", "Und wessen Kamera ist das?"],
    ["u5-ks-8", "shaimaa", "هَذِهِ كَامِيرَا سَمَر.", "هذه كاميرا سمر", "Hādhihi kāmīrā Samar.", "Das ist Samars Kamera."],
  ]),
  question: { prompt: "نَظَّارَةُ مَنْ هَذِهِ؟ – Wem gehört die Brille?", options: ["Schaimaa.", "Zaid.", "Samar."], answer: 0 },
};

const ASKED = [
  ["مِحْفَظَة", true], ["أَوْرَاق", true], ["نَظَّارَة", true], ["كَامِيرَا", true], ["طَبَق", false], ["كُوب", false], ["زُجَاجَة", false], ["حِذَاء", false],
] as const;

/** تدريب ٦: the other things in the picture – the book lets you choose the owner; Alif names one. */
const T6: Array<[thing: string, m: boolean, owner: string, poss: string, de: string]> = [
  ["طَبَق", true, "زَيْد", "طَبَقُهُ", "Teller"],
  ["كُوب", true, "سَمَر", "كُوبُهَا", "Becher"],
  ["زُجَاجَة", false, "عَلَاء", "زُجَاجَتُهُ", "Flasche"],
  ["مِطْوَاة", false, "طَلَال", "مِطْوَاتُهُ", "Taschenmesser"],
  ["حِذَاء", true, "شَيْمَاء", "حِذَاؤُهَا", "Schuhe"],
  ["أَوْرَاق", false, "زَيْد وَخَالِد", "أَوْرَاقُهُمَا", "Papiere"],
];
const T6_ITEMS: ClozeItem[] = T6.map(([thing, m, owner, poss, de], n) => {
  const d = m ? "هَذَا" : "هَذِهِ";
  const stem = poss.replace(/(هُمَا|هُ|هَا)$/, "");
  return {
    id: `t6-${n + 1}`,
    hint: `${de} – ${owner === "زَيْد وَخَالِد" ? "Zaid und Khalid" : owner}`,
    lines: [
      { label: "س", parts: n === 0 ? [`${thing} مَنْ ${d}؟`] : [gap([`${thing} مَنْ ${d}؟`], [`${thing} مَنْ هَذَا؟`, `${thing} مَنْ هَذِهِ؟`])] },
      { label: "ج", parts: n === 0 ? [`${d} ${thing} ${owner}. ${d} ${poss}.`] : [`${d} ${thing} ${owner}. ${d} `, gap([`${poss}.`], sorted([`${poss}.`, `${stem}هُ.`, `${stem}هَا.`, `${stem}هُمَا.`]))] },
    ],
  };
});

export const a1KitabMan: A1Lesson = {
  slug: "kitab-man-hadha",
  kind: "phrase",
  label: "كِتَابُ مَنْ هَذَا؟",
  labelGerman: "Wessen Buch ist das?",
  steps: [
    {
      kind: "cloze",
      slug: "step-1",
      title: "Wessen … ist das? (Khalids Klasse)",
      navLabel: "Wessen?",
      instruction: { arabic: "كِتَابُ مَنْ هَذَا؟ · هَذَا فَصْلُ خَالِد – خَالِد سَأَلَ عَنْ مَاذَا؟ اِقْرَأِ السُّؤَالَ وَالْإِجَابَةَ وَاكْتُبْ … مِثَال: خَالِد: كِتَابُ مَنْ هَذَا؟ هَذَا كِتَابُ حُسَيْن. هَذَا كِتَابُهُ. – كُرَّاسَةُ مَنْ هَذِهِ؟ هَذِهِ كُرَّاسَةُ إِيمَان. هَذِهِ كُرَّاسَتُهَا.", german: "Khalid fragt in seiner Klasse: Wem gehört das? Ergänze die Antworten – zuerst mit dem Namen, dann kurz mit der Endung (sein / ihr / unser …).", note: "Nützliche Wörter: مِسْطَرَة (Lineal) – مِقْلَمَة (Federmäppchen) – أَوْرَاق (Papiere) – كُرَّاسَة (Heft) – صُوَر (Bilder). In Zeile 2–4 lässt das Buch das Ding offen; Alif nimmt كِتَاب." },
      items: PRESENTATION,
    },
    {
      kind: "table",
      slug: "step-2",
      title: "Grammatik: Wem gehört es?",
      navLabel: "Grammatik",
      instruction: { arabic: "لَاحِظِ الْقَوَاعِدَ: لِلتَّعْبِيرِ عَنْ مِلْكِيَّةِ الْأَشْيَاءِ: ١) هَذَا كِتَابُ أَحْمَد = هَذَا كِتَابُهُ · هَذِهِ حَقِيبَةُ زَيْنَب = هَذِهِ حَقِيبَتُهَا", german: "Achte auf die Regeln: „Ahmads Buch“ = كِتَابُ أَحْمَد, kurz كِتَابُهُ (sein Buch). Die Endung zeigt, wem es gehört." },
      tables: [
        {
          id: "ownership",
          titleArabic: "٢) لِلسُّؤَالِ عَنْ مِلْكِيَّةِ الْأَشْيَاءِ:",
          title: "Wessen Buch? Wessen Tasche?",
          columns: [{ arabic: "ضَمِير", german: "Person" }, { arabic: "كِتَابُ مَنْ هَذَا؟ (لِلْمُذَكَّرِ)", german: "männlich" }, { arabic: "حَقِيبَةُ مَنْ هَذِهِ؟ (لِلْمُؤَنَّثِ)", german: "weiblich" }],
          rows: OWNERSHIP.map(([p, k, h, de]) => [{ arabic: p, german: de }, { arabic: k }, { arabic: h }] satisfies TableCell[]),
        },
        {
          id: "notes",
          titleArabic: "٣) صُوَرُ مَنْ هَذِهِ؟ هَذِهِ صُوَرُ نَاجِي وَإِبْرَاهِيم وَنَبِيل. هَذِهِ صُوَرُهُمْ.",
          title: "Merke",
          columns: [{ arabic: "", german: "" }, { arabic: "", german: "" }],
          rows: [
            [{ arabic: "لَاحِظْ كَلِمَاتِ الْجَمْعِ: «هَذِهِ» اسْمُ إِشَارَةٍ لِلْمُفْرَدِ الْمُؤَنَّثِ وَلِجَمْعِ الْأَشْيَاءِ.", german: "هَذِهِ steht für weibliche Wörter und für die Mehrzahl von Dingen (هَذِهِ صُوَر).", listen: false }, { arabic: "هَذِهِ صُوَرُهُمْ." }],
            [{ arabic: "٤) لَاحِظْ نُطْقَ التَّاءِ الْمَرْبُوطَةِ: «هَذِهِ سَاعَةُ أَحْمَد» – عِنْدَ الْإِضَافَةِ يَجِبُ أَنْ نَنْطِقَ التَّاءَ.", german: "Das ة spricht man als „t“, wenn ein Besitzer folgt: sāʿatu Aḥmad.", listen: false }, { arabic: "هَذِهِ سَاعَةُ أَحْمَد." }],
            [{ arabic: "٥) لَاحِظِ التَّنْوِينَ: «هَذِهِ سَاعَةٌ» (نَكِرَة + تَنْوِين) – «هَذِهِ سَاعَةُ أَحْمَد» (إِضَافَة)", german: "Tanwin (‑un) nur ohne Besitzer: hādhihi sāʿatun – aber sāʿatu Aḥmad.", listen: false }, { arabic: "هَذِهِ سَاعَةٌ." }],
          ],
        },
      ],
      quiz: [
        { id: "hiya", prompt: "„ihr Buch“ (eine Frau):", options: ["كِتَابُهُ", "كِتَابُهَا", "كِتَابِي"], answer: 1 },
        { id: "nahnu", prompt: "„unsere Tasche“:", options: ["حَقِيبَتُنَا", "حَقِيبَتِي", "حَقِيبَتُهُمْ"], answer: 0 },
        { id: "plural", prompt: "Bilder (صُوَر) – du zeigst darauf mit …", options: ["هَذَا", "هَذِهِ"], answer: 1 },
        { id: "ta", prompt: "Wie spricht man سَاعَةُ أَحْمَد?", options: ["sāʿa Aḥmad", "sāʿatu Aḥmad", "sāʿatun Aḥmad"], answer: 1 },
      ],
    },
    {
      kind: "phrases",
      slug: "step-3",
      title: "Nachsprechen: sein Buch, ihr Buch …",
      navLabel: "Nachsprechen",
      instruction: { arabic: "٢) لِلسُّؤَالِ عَنْ مِلْكِيَّةِ الْأَشْيَاءِ – اِسْمَعْ وَكَرِّرْ.", german: "Hör zu und sprich die kurzen Sätze der Tabelle nach.", note: "Die Bewertung prüft die Konsonanten; ob du ‑hu, ‑hā, ‑humā … sagst, kann sie nicht sicher unterscheiden. Achte selbst auf die Endung." },
      groups: [
        { id: "kitab", title: "كِتَابُ مَنْ هَذَا؟", items: OWNERSHIP.filter((_, i) => i !== 3).map(([, k, , de], n) => phrase(`own-k-${n + 1}`, spoken(k).split(". ").at(-1)!.replace(/\.?$/, "."), `${de}: sein / ihr Buch`)) },
        { id: "haqiba", title: "حَقِيبَةُ مَنْ هَذِهِ؟", items: OWNERSHIP.filter((_, i) => i !== 3).map(([, , h, de], n) => phrase(`own-h-${n + 1}`, h, `${de}: seine / ihre Tasche`)) },
      ],
    },
    { kind: "match", slug: "step-4", title: "Übung 1 (1): Frage und Antwort", navLabel: "Übung 1 (أ–ب)", instruction: { arabic: "تَدْرِيبٌ (١): ١ – صِلْ أ، ب، ج لِتُكَوِّنَ جُمْلَةً صَحِيحَةً.", german: "Übung 1: Verbinde zuerst jede Frage (أ) mit der passenden Antwort (ب).", note: "Nützliche Wörter: خِطَابَات (Briefe) – كُتُب (Bücher)." }, match: T1_AB },
    { kind: "match", slug: "step-5", title: "Übung 1 (2): Antwort und Kurzantwort", navLabel: "Übung 1 (ب–ج)", instruction: { arabic: "… ب، ج … ٢) اِقْرَأِ الْجُمَلَ بِالتَّبَادُلِ مَعَ زَمِيلِكَ وَصَحِّحْ.", german: "Übung 1: Verbinde jetzt jede Antwort (ب) mit der kurzen Antwort (ج)." }, match: T1_BC },
    { kind: "cloze", slug: "step-6", title: "Übung 2: Schule und Klasse", navLabel: "Übung 2", instruction: { arabic: "تَدْرِيبٌ (٢): ١ – أَجِبْ عَنِ السُّؤَالِ ثُمَّ اكْتُبْ جُمْلَةً أَمَامَ كُلِّ ضَمِيرٍ.", german: "Übung 2: Was ist das? Dann: Schule und Klasse für jede Person – هَذِهِ مَدْرَسَتُهُ، هَذَا فَصْلُهُ." }, items: T2 },
    { kind: "cloze", slug: "step-7", title: "Übung 3: Frage und Antwort zum Bild", navLabel: "Übung 3", instruction: { arabic: "تَدْرِيبٌ (٣): اُكْتُبْ سُؤَالًا وَإِجَابَةً لِكُلِّ صُورَةٍ كَالْمِثَالِ: هَذَا حِذَاءُ مَنْ؟ (أَنَا) هَذَا حِذَائِي.", german: "Übung 3: Frage und Antwort zu jedem Bild – die Person steht darunter." }, items: T3_ITEMS },
    {
      kind: "phrases",
      slug: "step-8",
      title: "Übung 4: Text „صَدِيقِي زَيْد“",
      navLabel: "Text lesen",
      instruction: { arabic: "تَدْرِيبٌ (٤): صَدِيقِي زَيْد · اُنْظُرْ إِلَى الصُّورَةِ وَاقْرَأِ النَّصَّ ثُمَّ أَجِبْ: مَنِ الْكَاتِبُ؟", german: "Übung 4: Lies den Text Satz für Satz, hör ihn an und lies laut. Wer schreibt den Text? (Khalid)", note: "Nützliche Wörter: زَمِيل (Kommilitone) – صَدِيق (Freund) – جَامِعَة (Universität) – أَيْضًا (auch)." },
      groups: [{ id: "zaid", title: "صَدِيقِي زَيْد", items: ZAID.map(([a, g], n) => phrase(`zaid-${n + 1}`, a, g)) }],
    },
    { kind: "cloze", slug: "step-9", title: "Übung 4: Fragen zum Text", navLabel: "Übung 4 (1–5)", instruction: { arabic: "١ – اِقْرَأْ مَرَّةً أُخْرَى وَأَجِبْ: بَيْتُ مَنْ هَذَا؟ ٢ – أَكْمِلْ … ٥ – مِنْ أَيْنَ زَيْد؟", german: "Übung 4, Fragen 1–5: Antworte mit dem Text." }, items: ZAID_CLOZE },
    { kind: "match", slug: "step-10", title: "Übung 4: Sätze verbinden", navLabel: "Übung 4 (6)", instruction: { arabic: "٦ – صِلْ (أ) مَعَ (ب) لِتُكَوِّنَ جُمْلَةً كَامِلَةً. صَحِّحْ مِنَ النَّصِّ.", german: "Übung 4, Frage 6: Verbinde (أ) und (ب) zu einem Satz aus dem Text.", note: "„هُوَ صَدِيقُ“ steht zweimal: beide Freundespaare passen." }, match: ZAID_MATCH },
    { kind: "dialogue", mode: "listen", slug: "step-11", title: "Übung 5: Khalid fragt – Anhören", navLabel: "Übung 5 (hören)", instruction: { arabic: "تَدْرِيبٌ (٥): خَالِد يَسْأَلُ عَنْ أَصْحَابِ هَذِهِ الْأَشْيَاءِ. اِسْمَعْ وَأَجِبْ.", german: "Übung 5: Khalid fragt, wem die Dinge gehören. Hör zu.", note: "Neue Wörter: طَبَق (Teller) – كُوب (Becher) – زُجَاجَة (Flasche) – مِطْوَاة (Taschenmesser). Der Hörtext steht im Buch auf S. 159. Die Liste aller Dinge im Bild (Teil 1) ist eine freie Aufgabe." }, dialogue: khalidShaimaa },
    {
      kind: "quiz",
      slug: "step-12",
      title: "Übung 5 (1): Wonach fragt Khalid?",
      navLabel: "Übung 5 (✓)",
      instruction: { arabic: "١ – ضَعْ عَلَامَةَ (✓) أَمَامَ الْأَشْيَاءِ الَّتِي سَأَلَ عَنْهَا.", german: "Übung 5, Teil 1: Hat Khalid nach diesem Ding gefragt?" },
      items: ASKED.map(([thing, asked], n) => ({ id: `asked-${n + 1}`, arabic: thing, questions: [{ prompt: "Hat Khalid danach gefragt?", options: ["✓ ja", "✗ nein"], answer: asked ? 0 : 1 }] })),
    },
    {
      kind: "cloze",
      slug: "step-13",
      title: "Übung 5 (2): Hör noch einmal und schreib",
      navLabel: "Übung 5 (schreiben)",
      instruction: { arabic: "٢ – اِسْمَعْ مَرَّةً أُخْرَى وَاكْتُبْ مِثْلَ الْمِثَالِ: أ – هَذِهِ مِحْفَظَةُ زَيْد. هَذِهِ مِحْفَظَتُهُ.", german: "Übung 5, Teil 2: Wessen Ding ist es – mit Namen und kurz mit der Endung." },
      items: [
        { id: "a", hint: "Beispiel", lines: [{ label: "أ", parts: ["هَذِهِ مِحْفَظَةُ زَيْد. هَذِهِ مِحْفَظَتُهُ."] }] },
        { id: "b", lines: [{ label: "ب", parts: ["هَذِهِ أَوْرَاقُ ", gap(["طَلَال وَعَلِيّ."], ["طَلَال وَعَلِيّ.", "زَيْد.", "سَمَر."]), " هَذِهِ ", gap(["أَوْرَاقُهُمَا."], ["أَوْرَاقُهُمَا.", "أَوْرَاقُهُ.", "أَوْرَاقُهُمْ."])] }] },
        { id: "c", lines: [{ label: "ج", parts: ["هَذِهِ ", gap(["نَظَّارَةُ شَيْمَاء."], ["نَظَّارَةُ شَيْمَاء.", "نَظَّارَةُ سَمَر.", "نَظَّارَةُ زَيْد."]), " هَذِهِ ", gap(["نَظَّارَتُهَا."], ["نَظَّارَتُهَا.", "نَظَّارَتُهُ.", "نَظَّارَتِي."])] }] },
        { id: "d", lines: [{ label: "د", parts: ["هَذِهِ ", gap(["كَامِيرَا سَمَر."], ["كَامِيرَا سَمَر.", "كَامِيرَا زَيْد.", "كَامِيرَا طَلَال."]), " هَذِهِ ", gap(["كَامِيرَتُهَا."], ["كَامِيرَتُهَا.", "كَامِيرَتُهُ.", "كَامِيرَتُهُمَا."])] }] },
      ],
    },
    { kind: "dialogue", mode: "roleplay", slug: "step-14", title: "Rollenspiel: Khalid und Schaimaa", navLabel: "Rollenspiel", instruction: { arabic: "الْمُحَادَثَةُ · تَدْرِيبٌ (٣): اِسْتَخْدِمِ الْجُمَلَ … لِتَعْمَلَ حِوَارًا مَعَ زَمِيلِكَ.", german: "Spiel die Unterhaltung: du fragst als Khalid oder antwortest als Schaimaa." }, dialogue: khalidShaimaa },
    {
      kind: "cloze",
      slug: "step-15",
      title: "Übung 6: die anderen Dinge im Bild",
      navLabel: "Übung 6",
      instruction: { arabic: "تَدْرِيبٌ (٦): اُكْتُبْ سُؤَالًا وَإِجَابَةً كَالتَّدْرِيبِ السَّابِقِ لِبَاقِي الْأَشْيَاءِ فِي صُورَةِ تَدْرِيبِ (٤) وَاخْتَرْ صَاحِبَهَا: س: طَبَقُ مَنْ هَذَا؟ ج: هَذَا طَبَقُ زَيْد. هَذَا طَبَقُهُ.", german: "Übung 6: Frag nach den anderen Dingen im Bild – der Besitzer steht beim Bild.", note: "Im Buch wählst du den Besitzer selbst; Alif gibt ihn vor, damit die Endung geprüft werden kann. Übung 7 (über deinen eigenen Freund schreiben) und die Gruppenspiele der „المحادثة“ (تدريب ١–٣) brauchen eine Klasse." },
      items: T6_ITEMS,
    },
  ],
};
