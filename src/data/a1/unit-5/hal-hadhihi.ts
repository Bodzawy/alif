import type { A1Lesson, ClozeItem, ClozePart, Dialogue, DialogueSpeaker, MatchContent, PhraseItem, QuizItem, TableCell } from "@/data/types";
import { transliterate } from "@/lib/arabic/transliterate";

import { unvocalised } from "../letter-lesson";
import { lines } from "../sabah-al-khayr";

// Unit 5 · تقديم (٢) "هَلْ هَذِهِ حَقِيبَةٌ؟ – هَلْ هَذِهِ حَقِيبَتُكَ؟" (book pages
// 160–168, PDF 192–200): presentations (٢ أ) and (٢ ب), لاحظ القواعد (لَيْسَ /
// لَيْسَتْ, ownership questions, Fatha / Tanwin), تدريب ١–٨ (٦: the text
// "عَلَى الشَّاطِئِ"), المحادثة تدريب ١–٢, تذكر; then (book pages 169–178) the
// general review of units 1–5, تدريب ١–١٤.

const IMG = "/images/a1/unit-5";
const gap = (accept: string[], options: string[]): ClozePart => ({ accept, options });
const sorted = (xs: string[]) => [...new Set(xs)].sort((a, b) => a.localeCompare(b, "ar"));
const sp = (id: string, name: string, voice: DialogueSpeaker["voice"], alt: string): DialogueSpeaker => ({ id, name, voice, avatar: { src: `${IMG}/${id}.svg`, alt } });
const phrase = (id: string, arabic: string, german: string): PhraseItem => ({ id, arabic, transliteration: transliterate(arabic), german, exercise: { id, target: unvocalised(arabic).replace(/[.؟?!،,]/g, "").replace(/\s+/g, " ").trim(), modelText: arabic } });

const TEACHER = sp("mudarris", "Der Lehrer", "male-1", "Ein Lehrer mit Schnurrbart am Pult");
const STUDENT_M = sp("talib", "Der Schüler", "male-2", "Ein Schüler");
const STUDENT_F = sp("taliba", "Die Schülerin", "female-1", "Eine Schülerin mit Zopf");

export const presentationA: Dialogue = {
  id: "hal-hadhihi-a",
  intro: "Der Lehrer hält Dinge hoch und fragt.",
  speakers: [TEACHER, STUDENT_M, STUDENT_F],
  lines: lines([
    ["u5-a-1", "mudarris", "هَلْ هَذِهِ نَظَّارَةٌ؟", "هل هذه نظارة", "Hal hādhihi naẓẓāra?", "Ist das eine Brille?"],
    ["u5-a-2", "talib", "لَا، هَذِهِ لَيْسَتْ نَظَّارَةً. هَذِهِ حَقِيبَةٌ.", "لا هذه ليست نظارة هذه حقيبة", "Lā, hādhihi laysat naẓẓāratan. Hādhihi ḥaqība.", "Nein, das ist keine Brille. Das ist eine Tasche."],
    ["u5-a-3", "mudarris", "هَلْ هَذَا كِتَابٌ؟", "هل هذا كتاب", "Hal hādhā kitāb?", "Ist das ein Buch?"],
    ["u5-a-4", "taliba", "لَا، هَذَا لَيْسَ كِتَابًا. هَذَا قَلَمٌ.", "لا هذا ليس كتابا هذا قلم", "Lā, hādhā laysa kitāban. Hādhā qalam.", "Nein, das ist kein Buch. Das ist ein Stift."],
  ]),
  question: { prompt: "هَلْ هَذِهِ نَظَّارَةٌ؟ – Was hält der Lehrer im ersten Bild?", options: ["Eine Tasche.", "Eine Brille.", "Ein Buch."], answer: 0 },
};

export const presentationB: Dialogue = {
  id: "hal-hadhihi-b",
  intro: "Jetzt fragt der Lehrer: Ist das deine Tasche? Ist das dein Stift?",
  speakers: [TEACHER, STUDENT_M, STUDENT_F],
  lines: lines([
    ["u5-b-1", "mudarris", "هَلْ هَذِهِ حَقِيبَتُكَ؟", "هل هذه حقيبتك", "Hal hādhihi ḥaqībatuka?", "Ist das deine Tasche?"],
    ["u5-b-2", "talib", "لَا، هَذِهِ لَيْسَتْ حَقِيبَتِي. هَذِهِ حَقِيبَةُ أَحْمَد. هَذِهِ حَقِيبَتُهُ.", "لا هذه ليست حقيبتي هذه حقيبة أحمد هذه حقيبته", "Lā, hādhihi laysat ḥaqībatī. Hādhihi ḥaqībatu Aḥmad. Hādhihi ḥaqībatuhu.", "Nein, das ist nicht meine Tasche. Das ist Ahmads Tasche. Das ist seine Tasche."],
    ["u5-b-3", "mudarris", "هَلْ هَذَا قَلَمُكِ؟", "هل هذا قلمك", "Hal hādhā qalamuki?", "Ist das dein Stift?"],
    ["u5-b-4", "taliba", "لَا، هَذَا لَيْسَ قَلَمِي. هَذَا قَلَمُ زَيْنَب. هَذَا قَلَمُهَا.", "لا هذا ليس قلمي هذا قلم زينب هذا قلمها", "Lā, hādhā laysa qalamī. Hādhā qalamu Zaynab. Hādhā qalamuhā.", "Nein, das ist nicht mein Stift. Das ist Zainabs Stift. Das ist ihr Stift."],
  ]),
  question: { prompt: "حَقِيبَةُ مَنْ هَذِهِ؟ – Wem gehört die Tasche?", options: ["Ahmad.", "Zainab.", "Dem Lehrer."], answer: 0 },
};

/** تدريب ١: [question, the thing in the picture, masculine?, picture]. */
const T1: Array<[q: string, asked: string, askedM: boolean, shown: string, shownM: boolean, src: string, alt: string]> = [
  ["هَلْ هَذِهِ حَقِيبَةٌ؟", "حَقِيبَةً", false, "سَيَّارَةٌ", false, "/images/vocabulary/sayyara.svg", "Ein Auto"],
  ["هَلْ هَذَا كُرْسِيٌّ؟", "كُرْسِيًّا", true, "مِصْبَاحٌ", true, "/images/a1/unit-4/misbah.svg", "Eine Lampe"],
  ["هَلْ هَذِهِ طَاوِلَةٌ؟", "طَاوِلَةً", false, "كُرَّاسَةٌ", false, "/images/a1/unit-4/kurrasa.svg", "Ein Heft"],
  ["هَلْ هَذَا مِصْبَاحٌ؟", "مِصْبَاحًا", true, "بَابٌ", true, "/images/vocabulary/bab.svg", "Eine Tür"],
  ["هَلْ هَذِهِ سَجَّادَةٌ؟", "سَجَّادَةً", false, "نَافِذَةٌ", false, "/images/a1/unit-4/nafidha.svg", "Ein Fenster"],
  ["هَلْ هَذَا سَرِيرٌ؟", "سَرِيرًا", true, "قَلَمٌ", true, "/images/vocabulary/qalam.svg", "Ein Stift"],
  ["هَلْ هَذِهِ طَاوِلَةٌ؟", "طَاوِلَةً", false, "سِتَارَةٌ", false, "/images/a1/sin/sitara.svg", "Ein Vorhang"],
  ["هَلْ هَذِهِ سَلَّةٌ؟", "سَلَّةً", false, "مَكْتَبَةٌ", false, "/images/a1/unit-4/maktaba.svg", "Bücherregale"],
  ["هَلْ هَذَا طَالِبٌ؟", "طَالِبًا", true, "مَكْتَبٌ", true, "/images/a1/mim/maktab.svg", "Ein Schreibtisch"],
];
const T1_ITEMS: ClozeItem[] = T1.map(([q, asked, askedM, shown, shownM, src, alt], n) => {
  const neg = `${askedM ? "هَذَا لَيْسَ" : "هَذِهِ لَيْسَتْ"} ${asked}،`;
  const wrongNeg = `${askedM ? "هَذَا لَيْسَتْ" : "هَذِهِ لَيْسَ"} ${asked}،`;
  const bare = asked.replace(/[ًٌٍ]$/, "").replace(/ا$/, "");
  const noTanwin = `${askedM ? "هَذَا لَيْسَ" : "هَذِهِ لَيْسَتْ"} ${bare}،`;
  const right = `${shownM ? "هَذَا" : "هَذِهِ"} ${shown}.`;
  return {
    id: `t1-${n + 1}`,
    image: { src, alt },
    hint: n === 0 ? "Beispiel im Buch" : undefined,
    lines: [
      { label: "س", parts: [q] },
      { label: "ج", parts: n === 0 ? [`لَا، ${neg} ${right}`] : ["لَا، ", gap([neg], sorted([neg, wrongNeg, noTanwin])), " ", gap([right], sorted([right, `${shownM ? "هَذِهِ" : "هَذَا"} ${shown}.`]))] },
    ],
  };
});

const T3: QuizItem[] = [
  { id: "bab", arabic: "هَلْ هَذَا بَابٌ؟", german: "Beispiel im Buch (Bild: ein Stift)", questions: [{ prompt: "Die richtige Antwort:", options: ["نَعَمْ، هَذَا كُرْسِيٌّ.", "لَا، هَذَا بَابٌ.", "لَا، هَذَا لَيْسَ بَابًا. هَذَا قَلَمٌ."], answer: 2 }] },
  { id: "mihfaza", arabic: "هَلْ هَذِهِ مِحْفَظَتُكَ؟", questions: [{ prompt: "Die richtige Antwort:", options: ["لَا، هَذِهِ لَيْسَتْ مِحْفَظَتَنَا.", "لَا، هَذِهِ لَيْسَتْ مِحْفَظَتِي.", "لَا، هَذِهِ لَيْسَتْ مِحْفَظَتَكَ."], answer: 1 }] },
  { id: "sayyara", arabic: "هَلْ هَذِهِ سَيَّارَتُكُمْ؟", questions: [{ prompt: "Die richtige Antwort:", options: ["لَا، هَذِهِ لَيْسَتْ سَيَّارَتَنَا. هَذِهِ سَيَّارَتُهُمْ.", "لَا، هَذِهِ لَيْسَتْ سَيَّارَتَكُمَا. هَذِهِ سَيَّارَتُنَا.", "لَا، هَذِهِ لَيْسَتْ سَيَّارَتِي. هَذِهِ سَيَّارَتُهُ."], answer: 0 }] },
  { id: "mudarris", arabic: "هَلْ هَذَا مُدَرِّسُكُنَّ؟", questions: [{ prompt: "Die richtige Antwort:", options: ["لَا، هَذَا لَيْسَ مُدَرِّسَكُمَا. هَذَا مُدَرِّسِي.", "لَا، هَذَا لَيْسَ مُدَرِّسَكَ. هَذَا مُدَرِّسُهُمَا.", "لَا، هَذَا لَيْسَ مُدَرِّسَنَا. هَذَا مُدَرِّسُهُنَّ."], answer: 2 }] },
];

const T4: ClozeItem[] = [
  { id: "kitab", hint: "Beispiel im Buch: zwei Jungen, ein Mädchen zeigt auf das Buch", lines: [{ label: "س", parts: ["هَلْ هَذَا كِتَابُكَ؟"] }, { label: "ج", parts: ["لَا، هَذَا لَيْسَ كِتَابِي. هَذَا كِتَابُهُمَا."] }] },
  { id: "awraq", hint: "Zwei Mädchen und ein Mann mit Papieren", lines: [{ label: "س", parts: ["هَلْ هَذِهِ أَوْرَاقٌ؟"] }, { label: "ج", parts: ["لَا، ", gap(["هَذِهِ لَيْسَتْ أَوْرَاقًا."], ["هَذِهِ لَيْسَتْ أَوْرَاقًا.", "هَذَا لَيْسَ أَوْرَاقًا.", "هَذِهِ لَيْسَتْ أَوْرَاقِي."])] }] },
  { id: "nuqud", hint: "(أَنْتَ) – ein Junge gibt einem anderen Geld", lines: [{ label: "س", parts: ["هَلْ هَذِهِ نُقُودُكَ؟"] }, { label: "ج", parts: ["لَا، ", gap(["هَذِهِ لَيْسَتْ نُقُودِي."], ["هَذِهِ لَيْسَتْ نُقُودِي.", "هَذِهِ لَيْسَتْ نُقُودَكَ.", "هَذَا لَيْسَ نُقُودِي."]), " هَذِهِ ", gap(["نُقُودُكَ."], ["نُقُودُكَ.", "نُقُودِي.", "نُقُودُهُ."]), " (أَنْتَ)"] }] },
];

const T5: Array<[q: string, a: string]> = [
  ["هَلْ هَذَا بَيْتُكُمْ؟", "لَا، هَذَا لَيْسَ بَيْتَنَا."],
  ["هَلْ هَذِهِ سَيَّارَتُهُمْ؟", "لَا، هَذِهِ لَيْسَتْ سَيَّارَتَهُمْ."],
  ["هَلْ هَذَا قَلَمُكَ؟", "لَا، هَذَا لَيْسَ قَلَمِي."],
  ["هَلْ هَذَا بَابٌ؟ (فَصْل)", "لَا، هَذَا لَيْسَ بَابًا. هَذَا فَصْلٌ."],
  ["هَلْ هَذِهِ مِحْفَظَتُكَ؟", "لَا، هَذِهِ لَيْسَتْ مِحْفَظَتِي."],
  ["هَلْ هَذِهِ دَبَّاسَتُكُمَا؟", "لَا، هَذِهِ لَيْسَتْ دَبَّاسَتَنَا."],
  ["هَلْ هَذِهِ نُقُودُكُنَّ؟", "لَا، هَذِهِ لَيْسَتْ نُقُودَنَا."],
];
const wrongOwner = (a: string) => [a.replace(/(نَا|ي)\.$/, "كَ."), a.replace(/(هُمْ|نَا|ي)\.$/, "هُ."), a.replace("لَيْسَتْ", "لَيْسَ").replace("هَذِهِ لَيْسَ", "هَذَا لَيْسَ")];
const T5_ITEMS: ClozeItem[] = T5.map(([q, a], n) => ({
  id: `t5-${n + 1}`,
  hint: n === 0 ? "Beispiel im Buch" : undefined,
  lines: [{ label: String(n + 1), parts: [q] }, { label: "", parts: n === 0 ? [a] : [gap([a], sorted([a, ...wrongOwner(a)]).slice(0, 4).concat(sorted([a, ...wrongOwner(a)]).slice(0, 4).includes(a) ? [] : [a]))] }],
}));

const NADIM: Array<[arabic: string, german: string]> = [
  ["أَنَا اسْمِي نَدِيم.", "Ich heiße Nadim."],
  ["هَذِهِ صُورَةُ أُسْرَتِي.", "Das ist ein Foto meiner Familie."],
  ["أَنَا مِنْ لُبْنَانَ، أَنَا لُبْنَانِيٌّ.", "Ich komme aus dem Libanon, ich bin Libanese."],
  ["أُمِّي اسْمُهَا سَلْوَى، هِيَ لَيْسَتْ لُبْنَانِيَّةً، هِيَ سُورِيَّةٌ.", "Meine Mutter heißt Salwa, sie ist keine Libanesin, sie ist Syrerin."],
  ["نَحْنُ الْآنَ فِي بَيْرُوتَ. نَحْنُ عَلَى الشَّاطِئِ.", "Wir sind jetzt in Beirut. Wir sind am Strand."],
  ["هَذِهِ صَدِيقَتُنَا عَالِيَة.", "Das ist unsere Freundin Aliya."],
  ["هِيَ لَيْسَتْ لُبْنَانِيَّةً، هِيَ سُورِيَّةٌ أَيْضًا وَهَذِهِ أُسْرَتُهَا.", "Sie ist keine Libanesin, sie ist auch Syrerin, und das ist ihre Familie."],
];
const NADIM_Q: ClozeItem[] = [
  { id: "n1", lines: [{ label: "١", parts: ["هَذِهِ صُورَةُ مَنْ؟"] }, { label: "", parts: ["هَذِهِ ", gap(["صُورَةُ أُسْرَةِ نَدِيم."], ["صُورَةُ أُسْرَةِ نَدِيم.", "صُورَةُ أُسْرَةِ عَالِيَة.", "صُورَةُ سَلْوَى."]), " هَذِهِ ", gap(["صُورَةُ أُسْرَتِهِ."], ["صُورَةُ أُسْرَتِهِ.", "صُورَةُ أُسْرَتِهَا.", "صُورَةُ أُسْرَتِي."])] }] },
  { id: "n2", lines: [{ label: "٢", parts: ["مِنْ أَيْنَ هُوَ؟"] }, { label: "", parts: ["هُوَ مِنْ ", gap(["لُبْنَانَ."], ["لُبْنَانَ.", "سُورِيَا.", "بَيْرُوتَ."]), " هُوَ ", gap(["لُبْنَانِيٌّ."], ["لُبْنَانِيٌّ.", "سُورِيٌّ.", "لُبْنَانِيَّةٌ."])] }] },
  { id: "n3", lines: [{ label: "٣", parts: ["هَلْ أُمُّهُ لُبْنَانِيَّةٌ؟"] }, { label: "", parts: [gap(["لَا، هِيَ لَيْسَتْ لُبْنَانِيَّةً، هِيَ سُورِيَّةٌ."], ["لَا، هِيَ لَيْسَتْ لُبْنَانِيَّةً، هِيَ سُورِيَّةٌ.", "نَعَمْ، هِيَ لُبْنَانِيَّةٌ.", "لَا، هُوَ لَيْسَ لُبْنَانِيًّا."])] }] },
  { id: "n4", lines: [{ label: "٤", parts: ["مِنْ أَيْنَ هِيَ؟"] }, { label: "", parts: ["هِيَ مِنْ ", gap(["سُورِيَا."], ["سُورِيَا.", "لُبْنَانَ.", "مِصْرَ."])] }] },
  { id: "n5", lines: [{ label: "٥", parts: ["مَا اسْمُ صَدِيقَتِهِمْ؟"] }, { label: "", parts: ["اسْمُهَا ", gap(["عَالِيَة."], ["عَالِيَة.", "سَلْوَى.", "نَدِيم."])] }] },
  { id: "n6", lines: [{ label: "٦", parts: ["هَلْ صَدِيقَتُهُمْ لُبْنَانِيَّةٌ؟"] }, { label: "", parts: [gap(["لَا، هِيَ لَيْسَتْ لُبْنَانِيَّةً، هِيَ سُورِيَّةٌ."], ["لَا، هِيَ لَيْسَتْ لُبْنَانِيَّةً، هِيَ سُورِيَّةٌ.", "نَعَمْ، هِيَ لُبْنَانِيَّةٌ."])] }] },
  { id: "n7", lines: [{ label: "٧", parts: ["أَيْنَ هُمْ فِي الصُّورَةِ؟"] }, { label: "", parts: ["هُمْ ", gap(["عَلَى الشَّاطِئِ."], ["عَلَى الشَّاطِئِ.", "فِي الْبَيْتِ.", "فِي الْفَصْلِ."])] }] },
];

/** تدريب ٨: Majid on the beach – the blanks of the book; names and places are free. */
const MAJID: ClozeItem[] = [
  { id: "m1", lines: [{ label: "", parts: ["أَنَا اسْمِي ", gap(["مَاجِد."], ["مَاجِد.", "نَدِيم.", "سَلْوَى."]), " هَذِهِ ", gap(["صُورَةُ"], ["صُورَةُ", "صُورَتُهُ"]), " أُسْرَتِي. أَنَا مِنْ مِصْرَ. أَنَا ", gap(["مِصْرِيٌّ."], ["مِصْرِيٌّ.", "مِصْرِيَّةٌ.", "لُبْنَانِيٌّ."])] }] },
  { id: "m2", lines: [{ label: "", parts: ["أُمِّي اسْمُهَا ", gap(["سُعَاد.", "مُنَى.", "فَاطِمَة."], ["سُعَاد.", "مُنَى.", "فَاطِمَة.", "مَاجِد."]), " هِيَ لَيْسَتْ مِصْرِيَّةً، هِيَ ", gap(["سُورِيَّةٌ.", "لُبْنَانِيَّةٌ.", "مَغْرِبِيَّةٌ."], ["سُورِيَّةٌ.", "لُبْنَانِيَّةٌ.", "مَغْرِبِيَّةٌ.", "مِصْرِيَّةٌ."])] }] },
  { id: "m3", lines: [{ label: "", parts: ["نَحْنُ الْآنَ عَلَى ", gap(["شَاطِئِ"], ["شَاطِئِ", "بَيْتِ"]), " الْإِسْكَنْدَرِيَّةِ."] }] },
  { id: "m4", lines: [{ label: "", parts: ["هَذِهِ صُورَةُ صَدِيقِي ", gap(["عَادِل.", "سَمِير.", "خَالِد."], ["عَادِل.", "سَمِير.", "خَالِد.", "سُعَاد."]), " هُوَ لَيْسَ ", gap(["مِصْرِيًّا،"], ["مِصْرِيًّا،", "مِصْرِيٌّ،"]), " هُوَ ", gap(["سُودَانِيٌّ.", "سُعُودِيٌّ.", "أُرْدُنِيٌّ."], ["سُودَانِيٌّ.", "سُعُودِيٌّ.", "أُرْدُنِيٌّ.", "مِصْرِيٌّ."])] }] },
];
const QUESTIONS: ClozeItem[] = [
  ["الِاسْم", "مَا اسْمُكَ؟", ["مَا اسْمُكَ؟", "مِنْ أَيْنَ أَنْتَ؟", "صُورَةُ مَنْ هَذِهِ؟"]],
  ["الصُّورَة", "صُورَةُ مَنْ هَذِهِ؟", ["صُورَةُ مَنْ هَذِهِ؟", "مَا اسْمُكَ؟", "أَيْنَ أَنْتُمْ؟"]],
  ["الْمَكَان", "أَيْنَ أَنْتُمْ؟", ["أَيْنَ أَنْتُمْ؟", "مِنْ أَيْنَ أُمُّكَ؟", "مَا اسْمُ صَدِيقِكَ؟"]],
  ["جِنْسِيَّة الْأُمِّ", "هَلْ أُمُّكَ مِصْرِيَّةٌ؟", ["هَلْ أُمُّكَ مِصْرِيَّةٌ؟", "هَلْ أَنْتَ مِصْرِيٌّ؟", "مَا اسْمُ أُمِّكَ؟"]],
  ["الصَّدِيق", "مَا اسْمُ صَدِيقِكَ؟", ["مَا اسْمُ صَدِيقِكَ؟", "مَا اسْمُكَ؟", "مَنْ هِيَ؟"]],
  ["جِنْسِيَّته", "هَلْ هُوَ مِصْرِيٌّ؟", ["هَلْ هُوَ مِصْرِيٌّ؟", "هَلْ هِيَ مِصْرِيَّةٌ؟", "مِنْ أَيْنَ أَنْتِ؟"]],
].map(([about, right, options], n) => ({ id: `q${n + 1}`, hint: n === 0 ? "Beispiel im Buch" : undefined, lines: [{ label: `سُؤَالٌ عَنْ ${about}:`, parts: n === 0 ? [right as string] : [gap([right as string], sorted(options as string[]))] }] }));

export const nadimAliya: Dialogue = {
  id: "nadim-aliya",
  intro: "Am Strand: Nadim fragt Aliya nach dem Sonnenschirm und dem Spielzeug.",
  speakers: [sp("nadim", "Nadim", "male-2", "Nadim, ein Junge in Badehose"), sp("aliya", "Aliya", "female-2", "Aliya, ein Mädchen auf dem Handtuch")],
  lines: lines([
    ["u5-na-1", "nadim", "يَا عَالِيَةُ! هَلْ هَذِهِ شَمْسِيَّتُكُمْ؟", "يا عالية هل هذه شمسيتكم", "Yā ʿĀliyatu! Hal hādhihi shamsiyyatukum?", "Aliya! Ist das euer Sonnenschirm?"],
    ["u5-na-2", "aliya", "نَعَمْ، هَذِهِ شَمْسِيَّتُنَا.", "نعم هذه شمسيتنا", "Naʿam, hādhihi shamsiyyatunā.", "Ja, das ist unser Sonnenschirm."],
    ["u5-na-3", "nadim", "وَهَلْ هَذِهِ لُعْبَتُكِ؟", "وهل هذه لعبتك", "Wa-hal hādhihi luʿbatuki?", "Und ist das dein Spielzeug?"],
    ["u5-na-4", "aliya", "لَا، هَذِهِ لَيْسَتْ لُعْبَتِي. هَذِهِ لُعْبَةُ فَاطِمَة. هَذِهِ لُعْبَتُهَا.", "لا هذه ليست لعبتي هذه لعبة فاطمة هذه لعبتها", "Lā, hādhihi laysat luʿbatī. Hādhihi luʿbatu Fāṭima. Hādhihi luʿbatuhā.", "Nein, das ist nicht mein Spielzeug. Das ist Fatimas Spielzeug. Das ist ihr Spielzeug."],
  ]),
  question: { prompt: "هَلْ هَذِهِ لُعْبَةُ عَالِيَة؟ – Ist das Aliyas Spielzeug?", options: ["Nein, es gehört Fatima.", "Ja, es ist ihres.", "Nein, es gehört Nadim."], answer: 0 },
};

const G_COLS = [{ arabic: "السُّؤَالُ", german: "Frage" }, { arabic: "الضَّمِيرُ", german: "Person" }, { arabic: "لِلْمُذَكَّرِ", german: "männlich" }, { arabic: "لِلْمُؤَنَّثِ", german: "weiblich" }, { arabic: "الْإِجَابَةُ", german: "Antwort" }];
const askRows = (rows: Array<[p: string, k: string, h: string, a: string]>): TableCell[][] =>
  rows.map(([p, k, h, a]) => [{ arabic: "هَلْ هَذَا / هَلْ هَذِهِ", listen: false }, { arabic: p }, { arabic: `${k}؟` }, { arabic: `${h}؟` }, { arabic: a }]);

export const a1HalHadhihi: A1Lesson = {
  slug: "hal-hadhihi-haqiba",
  kind: "phrase",
  label: "هَلْ هَذِهِ حَقِيبَةٌ؟",
  labelGerman: "Ist das eine Tasche?",
  steps: [
    { kind: "dialogue", mode: "listen", slug: "step-1", title: "Anhören (٢ أ): Ist das eine Brille?", navLabel: "Anhören (أ)", instruction: { arabic: "تَقْدِيمٌ (٢ أ): هَلْ هَذِهِ حَقِيبَةٌ؟ · اِقْرَأِ الْحِوَارَ ثُمَّ أَجِبْ: هَلْ هَذِهِ نَظَّارَةٌ؟ هَلْ هَذَا كِتَابٌ؟", german: "Hör zu: Der Lehrer fragt, ob es eine Brille / ein Buch ist." }, dialogue: presentationA },
    { kind: "dialogue", mode: "repeat", slug: "step-2", title: "Nachsprechen (٢ أ)", navLabel: "Nachsprechen (أ)", instruction: { arabic: "تَقْدِيمٌ (٢ أ)", german: "Sprich jede Zeile nach.", note: "Achte auf لَيْسَ (männlich) und لَيْسَتْ (weiblich) und auf das ‑an am Ende: كِتَابًا." }, dialogue: presentationA },
    { kind: "dialogue", mode: "listen", slug: "step-3", title: "Anhören (٢ ب): Ist das deine Tasche?", navLabel: "Anhören (ب)", instruction: { arabic: "تَقْدِيمٌ (٢ ب): هَلْ هَذِهِ حَقِيبَتُكَ؟", german: "Hör zu: Ist das deine Tasche? Ist das dein Stift?" }, dialogue: presentationB },
    { kind: "dialogue", mode: "repeat", slug: "step-4", title: "Nachsprechen (٢ ب)", navLabel: "Nachsprechen (ب)", instruction: { arabic: "تَقْدِيمٌ (٢ ب)", german: "Sprich jede Zeile nach." }, dialogue: presentationB },
    { kind: "dialogue", mode: "roleplay", slug: "step-5", title: "Rollenspiel (٢ ب)", navLabel: "Rollenspiel", instruction: { arabic: "تَقْدِيمٌ (٢ ب)", german: "Spiel eine Rolle: den Lehrer, den Schüler oder die Schülerin." }, dialogue: presentationB },
    {
      kind: "table",
      slug: "step-6",
      title: "Grammatik: لَيْسَ / لَيْسَتْ – dein, euer …",
      navLabel: "Grammatik",
      instruction: { arabic: "لَاحِظِ الْقَوَاعِدَ: ١) السُّؤَالُ عَنِ الْأَشْيَاءِ وَنَفْيُهَا · ٢) لِلسُّؤَالِ عَنْ مِلْكِيَّةِ الْأَشْيَاءِ وَنَفْيِهَا", german: "Achte auf die Regeln: „Das ist nicht …“ heißt لَيْسَ (männlich) / لَيْسَتْ (weiblich); danach ‑an (كِتَابًا) – außer mit Besitzer-Endung (كِتَابِي)." },
      tables: [
        {
          id: "neg",
          titleArabic: "١) السُّؤَالُ عَنِ الْأَشْيَاءِ وَنَفْيُهَا:",
          title: "Fragen und verneinen",
          columns: [{ arabic: "", german: "" }, { arabic: "السُّؤَالُ", german: "Frage" }, { arabic: "النَّفْيُ", german: "Verneinung" }],
          rows: [
            [{ arabic: "لِلْمُؤَنَّثِ", german: "weiblich", listen: false }, { arabic: "هَلْ هَذِهِ حَقِيبَةٌ؟" }, { arabic: "لَا، هَذِهِ لَيْسَتْ حَقِيبَةً." }],
            [{ arabic: "لِلْمُذَكَّرِ", german: "männlich", listen: false }, { arabic: "هَلْ هَذَا كِتَابٌ؟" }, { arabic: "لَا، هَذَا لَيْسَ كِتَابًا." }],
          ],
        },
        {
          id: "own-sg",
          titleArabic: "٢) أ – ضَمَائِرُ الْمُفْرَدِ (الْمُخَاطَبِ)",
          title: "du",
          columns: [{ arabic: "الضَّمِيرُ", german: "Person" }, { arabic: "كِتَاب (مُذَكَّر)", german: "männlich" }, { arabic: "", german: "Antwort" }, { arabic: "حَقِيبَة (مُؤَنَّث)", german: "weiblich" }, { arabic: "", german: "Antwort" }],
          rows: [
            [{ arabic: "أَنْتَ", gender: "m" }, { arabic: "هَلْ هَذَا كِتَابُكَ؟" }, { arabic: "لَا، هَذَا لَيْسَ كِتَابِي." }, { arabic: "هَلْ هَذِهِ حَقِيبَتُكَ؟" }, { arabic: "لَا، هَذِهِ لَيْسَتْ حَقِيبَتِي." }],
            [{ arabic: "أَنْتِ", gender: "f" }, { arabic: "هَلْ هَذَا كِتَابُكِ؟" }, { arabic: "لَا، هَذَا لَيْسَ كِتَابِي." }, { arabic: "هَلْ هَذِهِ حَقِيبَتُكِ؟" }, { arabic: "لَا، هَذِهِ لَيْسَتْ حَقِيبَتِي." }],
          ],
        },
        {
          id: "own-pl",
          titleArabic: "ب – ضَمَائِرُ الْجَمْعِ (الْمُخَاطَبِ)",
          title: "ihr",
          columns: [{ arabic: "الضَّمِيرُ", german: "Person" }, { arabic: "كِتَاب (مُذَكَّر)", german: "männlich" }, { arabic: "حَقِيبَة (مُؤَنَّث)", german: "weiblich" }],
          rows: [
            [{ arabic: "أَنْتُمَا" }, { arabic: "هَلْ هَذَا كِتَابُكُمَا؟" }, { arabic: "هَلْ هَذِهِ حَقِيبَتُكُمَا؟" }],
            [{ arabic: "أَنْتُمْ" }, { arabic: "هَلْ هَذَا كِتَابُكُمْ؟" }, { arabic: "هَلْ هَذِهِ حَقِيبَتُكُمْ؟" }],
            [{ arabic: "أَنْتُنَّ" }, { arabic: "هَلْ هَذَا كِتَابُكُنَّ؟" }, { arabic: "هَلْ هَذِهِ حَقِيبَتُكُنَّ؟" }],
            [{ arabic: "الْإِجَابَةُ", listen: false }, { arabic: "لَا، هَذَا لَيْسَ كِتَابَنَا." }, { arabic: "لَا، هَذِهِ لَيْسَتْ حَقِيبَتَنَا." }],
          ],
        },
        {
          id: "fatha",
          titleArabic: "٣) كِتَابَةُ الْفَتْحَةِ · ٤) لَاحِظِ التَّنْوِينَ",
          title: "Das ‑an (Tanwin mit Fatha)",
          columns: [{ arabic: "", german: "" }, { arabic: "", german: "" }],
          rows: [
            [{ arabic: "«لَيْسَ كِتَابًا»: الْحَرْفُ الْأَخِيرُ يَتَّصِلُ ← ـًا", german: "Der letzte Buchstabe verbindet sich: ـًا", listen: false }, { arabic: "لَيْسَ كِتَابًا" }],
            [{ arabic: "«لَيْسَ سَرِيرًا»: الْحَرْفُ الْأَخِيرُ لَا يَتَّصِلُ ← رًا", german: "Er verbindet sich nicht: ا allein", listen: false }, { arabic: "لَيْسَ سَرِيرًا" }],
            [{ arabic: "«هَذَا لَيْسَ كِتَابًا» ✓ تَنْوِينٌ بِالْفَتْحَةِ (نَكِرَة)", german: "Tanwin bei einem unbestimmten Wort", listen: false }, { arabic: "هَذَا لَيْسَ كِتَابًا." }],
            [{ arabic: "«هَذَا لَيْسَ كِتَابَنَا» ✗ تَنْوِينٌ بِسَبَبِ الْإِضَافَةِ إِلَى الضَّمِيرِ", german: "Kein Tanwin mit Besitzer-Endung", listen: false }, { arabic: "هَذَا لَيْسَ كِتَابَنَا." }],
          ],
          note: "Die Bewertung der Aussprache hört Tanwin (‑an) und die Endungen nicht sicher; achte selbst darauf.",
        },
      ],
      quiz: [
        { id: "laysat", prompt: "„Das ist keine Tasche.“", options: ["هَذِهِ لَيْسَ حَقِيبَةً.", "هَذِهِ لَيْسَتْ حَقِيبَةً.", "هَذَا لَيْسَتْ حَقِيبَةً."], answer: 1 },
        { id: "tanwin", prompt: "„Das ist kein Bett.“", options: ["هَذَا لَيْسَ سَرِيرٌ.", "هَذَا لَيْسَ سَرِيرًا.", "هَذَا لَيْسَتْ سَرِيرًا."], answer: 1 },
        { id: "kum", prompt: "„Ist das euer Buch?“ (mehrere Männer)", options: ["هَلْ هَذَا كِتَابُكُمْ؟", "هَلْ هَذَا كِتَابُكُنَّ؟", "هَلْ هَذَا كِتَابُكَ؟"], answer: 0 },
        { id: "no-tanwin", prompt: "„Das ist nicht unser Buch.“", options: ["هَذَا لَيْسَ كِتَابًا.", "هَذَا لَيْسَ كِتَابَنَا.", "هَذَا لَيْسَ كِتَابِي."], answer: 1 },
      ],
    },
    { kind: "cloze", slug: "step-7", title: "Übung 1: Nein, das ist …", navLabel: "Übung 1", instruction: { arabic: "تَدْرِيبٌ (١): أ – اُكْتُبِ الْإِجَابَةَ تَحْتَ كُلِّ صُورَةٍ كَالْمِثَالِ. ب – اِسْتَخْدِمِ السُّؤَالَ وَالْإِجَابَةَ مَعَ زَمِيلِكَ لِلتَّصْحِيحِ وَالْمُحَادَثَةِ.", german: "Übung 1: Antworte unter jedem Bild: Nein, das ist kein …, das ist …", note: "Übung 2 im Buch („اُدْخُلْ إِلَى الْمَوْقِعِ“) ist auf der Website des Verlags." }, items: T1_ITEMS },
    { kind: "quiz", slug: "step-8", title: "Übung 3: die richtige Antwort", navLabel: "Übung 3", instruction: { arabic: "تَدْرِيبٌ (٣): اِخْتَرِ الْإِجَابَةَ الصَّحِيحَةَ.", german: "Übung 3: Wähle die richtige Antwort." }, items: T3 },
    { kind: "cloze", slug: "step-9", title: "Übung 4: Frage und Antwort zum Bild", navLabel: "Übung 4", instruction: { arabic: "تَدْرِيبٌ (٤): اُكْتُبْ سُؤَالًا وَإِجَابَةً تَحْتَ كُلِّ صُورَةٍ كَالْمِثَالِ.", german: "Übung 4: Frage und Antwort zu den Bildern.", note: "Drei der sechs Bilder haben im Buch keine vorgegebenen Wörter; dafür denkst du dir mit deinem Partner eine Frage aus." }, items: T4 },
    { kind: "cloze", slug: "step-10", title: "Übung 5: Antworte mit Nein", navLabel: "Übung 5", instruction: { arabic: "تَدْرِيبٌ (٥): اُكْتُبْ جَوَابًا بِالنَّفْيِ لِهَذِهِ الْأَسْئِلَةِ: لَا، هَذَا لَيْسَ بَيْتَنَا.", german: "Übung 5: Antworte jedes Mal mit Nein – achte auf die Person." }, items: T5_ITEMS },
    {
      kind: "phrases",
      slug: "step-11",
      title: "Übung 6: Text „عَلَى الشَّاطِئِ“",
      navLabel: "Text lesen",
      instruction: { arabic: "تَدْرِيبٌ (٦): عَلَى الشَّاطِئِ · اِقْرَأِ النَّصَّ ثُمَّ أَجِبْ عَنْ هَذِهِ الْأَسْئِلَةِ.", german: "Übung 6: Lies den Text Satz für Satz, hör ihn an und lies laut.", note: "Nützliche Wörter: أُسْرَة (Familie) – عَلَى الشَّاطِئِ (am Strand)." },
      groups: [{ id: "nadim", title: "عَلَى الشَّاطِئِ", items: NADIM.map(([a, g], n) => phrase(`nadim-${n + 1}`, a, g)) }],
    },
    { kind: "cloze", slug: "step-12", title: "Übung 6: Fragen zum Text", navLabel: "Übung 6 (Fragen)", instruction: { arabic: "١ – هَذِهِ صُورَةُ مَنْ؟ … ٧ – أَيْنَ هُمْ فِي الصُّورَةِ؟", german: "Übung 6: Antworte auf die sieben Fragen zum Text.", note: "Übung 7 im Buch („اُدْخُلْ إِلَى الْمَوْقِعِ“) ist auf der Website des Verlags." }, items: NADIM_Q },
    { kind: "cloze", slug: "step-13", title: "Übung 8: Majid am Strand", navLabel: "Übung 8", instruction: { arabic: "تَدْرِيبٌ (٨): مَاجِد عَلَى الشَّاطِئِ · ١ – اِمْلَأِ الْفَرَاغَ بِكَلِمَةٍ مُنَاسِبَةٍ.", german: "Übung 8: Fülle die Lücken – so wie Nadim über sich schreibt.", note: "Wo das Buch Namen oder Länder offen lässt, ist jede passende Wahl richtig." }, items: MAJID },
    { kind: "cloze", slug: "step-14", title: "Gespräch: Übung 1 – Fragen stellen", navLabel: "Gespräch 1", instruction: { arabic: "الْمُحَادَثَةُ · تَدْرِيبٌ (١): ٢ – اُكْتُبْ أَسْئِلَةً عَنِ الْمَعْلُومَاتِ الَّتِي كَتَبْتَهَا فِي تَدْرِيبِ (٨) وَاسْأَلْ زَمِيلَكَ عَنْ هَذِهِ الْأَسْئِلَةِ.", german: "Schreib Fragen zu den Informationen aus Übung 8: nach dem Namen, dem Foto, dem Ort, der Nationalität der Mutter, dem Freund und seiner Nationalität." }, items: QUESTIONS },
    { kind: "dialogue", mode: "listen", slug: "step-15", title: "Gespräch: Übung 2 – Nadim und Aliya", navLabel: "Gespräch 2", instruction: { arabic: "تَدْرِيبٌ (٢): اُنْظُرْ مَرَّةً أُخْرَى إِلَى الصُّورَةِ فِي تَدْرِيبِ (٦) وَاسْمَعِ الْحِوَارَ بَيْنَ نَدِيم وَعَالِيَة. ١ – اِسْمَعْ ثُمَّ أَجِبْ: أ – هَذِهِ شَمْسِيَّةُ مَنْ؟ ب – هَلْ هَذِهِ لُعْبَةُ عَالِيَة؟", german: "Hör die Unterhaltung zwischen Nadim und Aliya.", note: "Nützliche Wörter: شَمْسِيَّة (Sonnenschirm) – طَعَام (Essen) – لُعْبَة (Spielzeug) – مِضْرَب (Schläger) – دَلْو (Eimer)." }, dialogue: nadimAliya },
    { kind: "dialogue", mode: "roleplay", slug: "step-16", title: "Gespräch: Rollenspiel", navLabel: "Rollenspiel 2", instruction: { arabic: "٢ – اِسْتَخْدِمِ الْأَسْمَاءَ وَالْأَشْيَاءَ الَّتِي فِي الصُّورَةِ لِتُكَوِّنَ حِوَارًا مُمَاثِلًا.", german: "Spiel die Unterhaltung als Nadim oder Aliya.", note: "Mit anderen Namen und Dingen aus dem Bild – das macht ihr in der Klasse." }, dialogue: nadimAliya },
    {
      kind: "table",
      slug: "step-17",
      title: "Merke: Besitz, Fragen, Verneinung",
      navLabel: "Merke",
      instruction: { arabic: "تَذَكَّرْ", german: "Merke: das Wichtigste von Unit 5 auf einen Blick." },
      tables: [
        {
          id: "idafa",
          titleArabic: "١) لِلتَّعْبِيرِ عَنِ الْمِلْكِيَّةِ بِالْإِضَافَةِ: هَذَا كِتَابُ مَاجِد = هَذَا كِتَابُهُ · هَذِهِ كُرَّاسَةُ نَادِيَة = هَذِهِ كُرَّاسَتُهَا",
          title: "Wessen? – mit Namen oder mit der Endung",
          columns: [{ arabic: "", german: "" }, { arabic: "أَنَا", german: "ich" }, { arabic: "نَحْنُ", german: "wir" }, { arabic: "هُوَ", german: "er" }, { arabic: "هِيَ", german: "sie" }, { arabic: "هُمَا", german: "die beiden" }, { arabic: "هُمْ", german: "sie (m)" }, { arabic: "هُنَّ", german: "sie (f)" }],
          rows: [
            [{ arabic: "هَذَا فَصْلُ مَنْ؟ – هَذَا", listen: false }, { arabic: "فَصْلِي" }, { arabic: "فَصْلُنَا" }, { arabic: "فَصْلُهُ" }, { arabic: "فَصْلُهَا" }, { arabic: "فَصْلُهُمَا" }, { arabic: "فَصْلُهُمْ" }, { arabic: "فَصْلُهُنَّ" }],
            [{ arabic: "هَذِهِ مَدْرَسَةُ مَنْ؟ – هَذِهِ", listen: false }, { arabic: "مَدْرَسَتِي" }, { arabic: "مَدْرَسَتُنَا" }, { arabic: "مَدْرَسَتُهُ" }, { arabic: "مَدْرَسَتُهَا" }, { arabic: "مَدْرَسَتُهُمَا" }, { arabic: "مَدْرَسَتُهُمْ" }, { arabic: "مَدْرَسَتُهُنَّ" }],
          ],
          note: "٣) «هَذِهِ أَوْرَاقٌ» – «هَذِهِ» تُسْتَخْدَمُ لِكَلِمَاتِ الْجَمْعِ لِلْأَشْيَاءِ وَهِيَ مُؤَنَّثَةٌ: هَذِهِ وَرَقَةٌ – هَذِهِ أَوْرَاقٌ.",
        },
        {
          id: "negation",
          titleArabic: "٤) لِلسُّؤَالِ عَنِ الْأَشْيَاءِ وَنَفْيِهَا:",
          title: "Fragen und verneinen",
          columns: [{ arabic: "السُّؤَالُ", german: "Frage" }, { arabic: "الْإِجَابَةُ", german: "Antwort" }],
          rows: [
            [{ arabic: "هَلْ هَذَا كِتَابٌ؟" }, { arabic: "لَا، هَذَا لَيْسَ كِتَابًا. هَذَا قَلَمٌ." }],
            [{ arabic: "هَلْ هَذِهِ حَقِيبَةٌ؟" }, { arabic: "لَا، هَذِهِ لَيْسَتْ حَقِيبَةً. هَذِهِ طَاوِلَةٌ." }],
            [{ arabic: "هَلْ هَذَا كِتَابُ أَحْمَد؟" }, { arabic: "لَا، هَذَا لَيْسَ كِتَابَ أَحْمَد." }],
            [{ arabic: "هَلْ هَذِهِ سَيَّارَةُ لَيْلَى؟" }, { arabic: "لَا، هَذِهِ لَيْسَتْ سَيَّارَةَ لَيْلَى." }],
          ],
          note: "هَذَا لَيْسَ + اسْمٌ نَكِرَةٌ ← تَنْوِينٌ (✓) · هَذِهِ لَيْسَتْ + اسْمٌ مَعْرِفَةٌ ← تَنْوِينٌ (✗)",
        },
        {
          id: "you",
          titleArabic: "٥) لِلسُّؤَالِ عَنْ مِلْكِيَّةِ الْأَشْيَاءِ وَنَفْيِهَا: أ) ضَمِيرُ الْمُخَاطَبِ",
          title: "Ist das dein / euer …?",
          columns: G_COLS,
          rows: askRows([
            ["أَنْتَ", "كِتَابُكَ", "حَقِيبَتُكَ", "لَا، هَذَا لَيْسَ كِتَابِي / هَذِهِ لَيْسَتْ حَقِيبَتِي"],
            ["أَنْتِ", "كِتَابُكِ", "حَقِيبَتُكِ", "لَا، هَذَا لَيْسَ كِتَابِي / هَذِهِ لَيْسَتْ حَقِيبَتِي"],
            ["أَنْتُمَا", "كِتَابُكُمَا", "حَقِيبَتُكُمَا", "لَا، هَذَا لَيْسَ كِتَابَنَا / هَذِهِ لَيْسَتْ حَقِيبَتَنَا"],
            ["أَنْتُمْ", "كِتَابُكُمْ", "حَقِيبَتُكُمْ", "لَا، هَذَا لَيْسَ كِتَابَنَا / هَذِهِ لَيْسَتْ حَقِيبَتَنَا"],
            ["أَنْتُنَّ", "كِتَابُكُنَّ", "حَقِيبَتُكُنَّ", "لَا، هَذَا لَيْسَ كِتَابَنَا / هَذِهِ لَيْسَتْ حَقِيبَتَنَا"],
          ]),
        },
        {
          id: "they",
          titleArabic: "ب) ضَمِيرُ الْغَائِبِ",
          title: "Ist das sein / ihr …?",
          columns: G_COLS,
          rows: askRows([
            ["هُوَ", "كِتَابُهُ", "حَقِيبَتُهُ", "لَا، هَذَا لَيْسَ كِتَابَهُ / هَذِهِ لَيْسَتْ حَقِيبَتَهُ"],
            ["هِيَ", "كِتَابُهَا", "حَقِيبَتُهَا", "لَا، هَذَا لَيْسَ كِتَابَهَا / هَذِهِ لَيْسَتْ حَقِيبَتَهَا"],
            ["هُمَا", "كِتَابُهُمَا", "حَقِيبَتُهُمَا", "لَا، هَذَا لَيْسَ كِتَابَهُمَا / هَذِهِ لَيْسَتْ حَقِيبَتَهُمَا"],
            ["هُمْ", "كِتَابُهُمْ", "حَقِيبَتُهُمْ", "لَا، هَذَا لَيْسَ كِتَابَهُمْ / هَذِهِ لَيْسَتْ حَقِيبَتَهُمْ"],
            ["هُنَّ", "كِتَابُهُنَّ", "حَقِيبَتُهُنَّ", "لَا، هَذَا لَيْسَ كِتَابَهُنَّ / هَذِهِ لَيْسَتْ حَقِيبَتَهُنَّ"],
          ]),
          note: "Im Buch steht bei هِيَ „كِتَابُكِ؟ / حَقِيبَتُكِ؟“; gemeint ist كِتَابُهَا / حَقِيبَتُهَا (wie in der Antwort).",
        },
      ],
      quiz: [
        { id: "hum", prompt: "„Das ist ihr (mehrere Männer) Klassenraum.“", options: ["هَذَا فَصْلُهُمْ.", "هَذَا فَصْلُهُنَّ.", "هَذَا فَصْلُهُمَا."], answer: 0 },
        { id: "awraq", prompt: "„Das sind Papiere.“", options: ["هَذَا أَوْرَاقٌ.", "هَذِهِ أَوْرَاقٌ."], answer: 1 },
        { id: "layla", prompt: "„Das ist nicht Lailas Auto.“", options: ["هَذِهِ لَيْسَتْ سَيَّارَةً لَيْلَى.", "هَذِهِ لَيْسَتْ سَيَّارَةَ لَيْلَى."], answer: 1 },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// مراجعة عامة من الوحدة الأولى إلى الوحدة الخامسة (book pages 169–178)

const NAMES_T1: Array<[pronoun: string, word: string, names: string[], letters: string, de: string]> = [
  ["هِيَ", "اسْمُهَا", ["فَاطِمَة"], "ف ا ط م ة", "sie"],
  ["نَحْنُ", "أَسْمَاؤُنَا", ["زَيْنَب", "نَبِيلَة", "سَلْوَى"], "ز ي ن ب / ن ب ي ل ة / س ل و ى", "wir"],
  ["أَنَا", "اسْمِي", ["عَادِل"], "ع ا د ل", "ich"],
  ["هُمَا", "اسْمَاهُمَا", ["مَاجِد", "طَاهِر"], "م ا ج د / ط ا ه ر", "die beiden"],
  ["هُمْ", "أَسْمَاؤُهُمْ", ["وَائِل", "سَيْف", "فُؤَاد"], "و ا ئ ل / س ي ف / ف ؤ ا د", "sie (Männer)"],
  ["هُوَ", "اسْمُهُ", ["مُصْطَفَى"], "م ص ط ف ى", "er"],
];
const NAME_WORDS = ["اسْمُهَا", "أَسْمَاؤُنَا", "اسْمِي", "اسْمَاهُمَا", "أَسْمَاؤُهُمْ", "اسْمُهُ"];
const R1: ClozeItem[] = NAMES_T1.map(([pronoun, word, names, letters, de], n) => ({
  id: `r1-${n + 1}`,
  hint: `${letters} – ${de}`,
  lines: [{ label: String(n + 1), parts: n === 0 ? [`${pronoun} ${word} ${names.join(" وَ")}.`] : [`${pronoun} `, gap([word], sorted([word, ...NAME_WORDS.filter((w) => w !== word).slice(n % 3, (n % 3) + 2)])), " ", gap([`${names.join(" وَ")}.`], sorted([`${names.join(" وَ")}.`, ...NAMES_T1.filter((_, k) => k !== n).slice(0, 2).map((r) => `${r[2].join(" وَ")}.`)]))] }],
}));

const R2: MatchContent = {
  promptTitle: "(أ)",
  optionTitle: "(ب)",
  prompts: [
    { id: "nadia", arabic: "اسْمِي نَادِيَة.", answer: "ahlan" },
    { id: "salama", arabic: "مَعَ السَّلَامَةِ.", answer: "allah" },
    { id: "kitab", arabic: "هَلْ هَذَا كِتَابُكِ؟", answer: "naam" },
    { id: "raqm", arabic: "مَا رَقْمُ تِلِيفُونِكِ؟", answer: "number" },
    { id: "jinsiyya", arabic: "مَا جِنْسِيَّتُكَ؟", answer: "maghrib" },
  ],
  // The book's column (ب), top to bottom.
  options: [
    { id: "maghrib", label: "أَنَا مِنَ الْمَغْرِبِ، أَنَا مَغْرِبِيٌّ.", arabic: "أَنَا مِنَ الْمَغْرِبِ، أَنَا مَغْرِبِيٌّ." },
    { id: "naam", label: "نَعَمْ، شُكْرًا.", arabic: "نَعَمْ، شُكْرًا." },
    { id: "ahlan", label: "أَهْلًا وَسَهْلًا، مَرْحَبًا بِكِ.", arabic: "أَهْلًا وَسَهْلًا، مَرْحَبًا بِكِ." },
    { id: "allah", label: "اللهُ يُسَلِّمُكَ.", arabic: "اللهُ يُسَلِّمُكَ." },
    { id: "number", label: "٢٤٩٦٧٣٨١", arabic: "اثْنَانِ أَرْبَعَةٌ تِسْعَةٌ سِتَّةٌ سَبْعَةٌ ثَلَاثَةٌ ثَمَانِيَةٌ وَاحِدٌ" },
  ],
};

const PRONOUNS = ["هُمْ", "أَنَا", "هِيَ", "هُنَّ", "هُمَا"];
const R3: QuizItem[] = ([
  ["اسْمُهَا حَنَان.", "هِيَ"],
  ["اسْمُهُنَّ مَاجِدَة وَدَوْلَت وَعَالِيَة.", "هُنَّ"],
  ["اسْمِي مَحْمُود.", "أَنَا"],
  ["اسْمُهُمْ سَمِيح وَرَأْفَت وَخَالِد.", "هُمْ"],
  ["اسْمُهُمَا طَارِق وَعَلِيّ.", "هُمَا"],
] as const).map(([arabic, right], n) => ({ id: `r3-${n + 1}`, arabic, german: n === 0 ? "Beispiel: هِيَ اسْمُهَا حَنَان." : undefined, questions: [{ prompt: "Welches Pronomen?", options: PRONOUNS, answer: PRONOUNS.indexOf(right) }] }));

const R4: ClozeItem[] = ([
  ["نَعَمْ، هَذَا كِتَابُ أَحْمَد.", "هَلْ هَذَا كِتَابُ أَحْمَد؟", ["هَلْ هَذَا كِتَابُ أَحْمَد؟", "كِتَابُ مَنْ هَذَا؟", "مَا هَذَا؟"]],
  ["اسْمُهُ رَؤُوف.", "مَا اسْمُهُ؟", ["مَا اسْمُهُ؟", "مَنْ أَنْتَ؟", "مَا اسْمُكَ؟"]],
  ["لَا، هَذِهِ لَيْسَتْ حَقِيبَةَ مُنَى.", "هَلْ هَذِهِ حَقِيبَةُ مُنَى؟", ["هَلْ هَذِهِ حَقِيبَةُ مُنَى؟", "حَقِيبَةُ مَنْ هَذِهِ؟", "هَلْ هَذِهِ حَقِيبَتُكِ؟"]],
  ["هَذَا فَصْلُنَا.", "فَصْلُ مَنْ هَذَا؟", ["فَصْلُ مَنْ هَذَا؟", "مَا هَذِهِ؟", "هَلْ هَذَا فَصْلٌ؟"]],
  ["لَا، أَنَا لَسْتُ سُودَانِيًّا. أَنَا سُعُودِيٌّ.", "هَلْ أَنْتَ سُودَانِيٌّ؟", ["هَلْ أَنْتَ سُودَانِيٌّ؟", "مِنْ أَيْنَ أَنْتَ؟", "هَلْ أَنْتَ سُعُودِيٌّ؟"]],
] as Array<[string, string, string[]]>).map(([answer, q, options], n) => ({ id: `r4-${n + 1}`, lines: [{ label: "س", parts: [gap([q], sorted(options))] }, { label: "ج", parts: [answer] }] }));

const BOX = ["مِحْفَظَتِي", "لَسْتُ", "آسِفَة", "لُبْنَانِيَّة", "أَنْتِ", "مِحْفَظَتُكَ", "أَنَا", "اسْمِي", "أَنْتَ"];
const box = (right: string) => gap([right], BOX);
const R5: ClozeItem[] = [
  { id: "r5-1", lines: [
    { label: "نَوَال", parts: ["مِنْ فَضْلِكَ!! هَلْ ", box("أَنْتَ"), " السَّيِّدُ مُحْسِن عَلِيّ؟"] },
    { label: "مُخْتَار", parts: ["لَا، أَنَا ", box("لَسْتُ"), " مُحْسِن عَلِيّ. أَنَا مُخْتَار فَهْمِي."] },
    { label: "نَوَال", parts: [box("أَنَا"), " ", box("آسِفَة"), " جِدًّا."] },
  ] },
  { id: "r5-2", lines: [
    { label: "نَوَال", parts: ["مِنْ فَضْلِكَ يَا سَيِّد مُخْتَار، هَلْ هَذِهِ ", box("مِحْفَظَتُكَ"), "؟"] },
    { label: "مُخْتَار", parts: ["نَعَمْ، هَذِهِ ", box("مِحْفَظَتِي"), ". شُكْرًا. مَا اسْمُكِ؟"] },
    { label: "نَوَال", parts: [box("اسْمِي"), " نَوَال."] },
    { label: "مُخْتَار", parts: ["هَلْ ", box("أَنْتِ"), " سُورِيَّةٌ يَا نَوَال؟"] },
    { label: "نَوَال", parts: ["لَا. أَنَا ", box("لَسْتُ"), " سُورِيَّةً، أَنَا مِنْ لُبْنَانَ. أَنَا ", box("لُبْنَانِيَّة"), "."] },
  ] },
];

/** تدريب ٦: the word webs – which word belongs to the circle? (the book's example words are given). */
const WEBS: Array<[circle: string, right: string, wrong: string[], example: string]> = [
  ["جِنْسِيَّات", "مِصْرِيّ", ["مَكْتَب", "هِيَ"], "إِنْجِلِيزِيّ"],
  ["جِنْسِيَّات", "يَابَانِيّ", ["سَرِير", "صَبَاحُ الْخَيْرِ"], "إِنْجِلِيزِيّ"],
  ["فِي الْفَصْلِ", "سَبُّورَة", ["فَرَنْسِيّ", "نَحْنُ"], "مَكْتَب"],
  ["فِي الْفَصْلِ", "كُرْسِيّ", ["مَسَاءُ الْخَيْرِ", "حَقِيبَتُهَا"], "مَكْتَب"],
  ["ضَمَائِر", "نَحْنُ", ["سَرِير", "سُورِيّ"], "أَنَا"],
  ["ضَمَائِر", "هُمْ", ["حَقِيبَتِي", "قَلَم"], "أَنَا"],
  ["فِي الْغُرْفَةِ", "مِصْبَاح", ["أَنْتُمْ", "كَنَدِيّ"], "سَرِير"],
  ["فِي الْغُرْفَةِ", "سِتَارَة", ["مَعَ السَّلَامَةِ", "هُنَّ"], "سَرِير"],
  ["تَحِيَّات", "مَسَاءُ الْخَيْرِ", ["نَافِذَة", "حَقِيبَتُكَ"], "صَبَاحُ الْخَيْرِ / اللهُ يُسَلِّمُكَ"],
  ["تَحِيَّات", "مَعَ السَّلَامَةِ", ["كُرَّاسَة", "هُوَ"], "صَبَاحُ الْخَيْرِ / اللهُ يُسَلِّمُكَ"],
  ["تَصْرِيفُ حَقِيبَة", "حَقِيبَتُهَا", ["مِصْبَاح", "أَلْمَانِيّ"], "حَقِيبَتُهُ"],
  ["تَصْرِيفُ حَقِيبَة", "حَقِيبَتُنَا", ["أَهْلًا", "أَنْتِ"], "حَقِيبَتُهُ"],
];
const R6: QuizItem[] = WEBS.map(([circle, right, wrong, example], n) => {
  const options = sorted([right, ...wrong]);
  return { id: `r6-${n + 1}`, arabic: circle, german: `Im Buch steht schon: ${example}`, questions: [{ prompt: "Welches Wort gehört dazu?", options, answer: options.indexOf(right) }] };
});

const R7: ClozeItem[] = [
  { id: "keys", image: { src: `${IMG}/mafatih.svg`, alt: "Schlüssel" }, lines: [{ label: "أ", parts: ["هَلْ هَذِهِ نَظَّارَةٌ؟"] }, { label: "ب", parts: [gap(["لَا، هَذِهِ لَيْسَتْ نَظَّارَةً. هَذِهِ مَفَاتِيحُ."], ["لَا، هَذِهِ لَيْسَتْ نَظَّارَةً. هَذِهِ مَفَاتِيحُ.", "نَعَمْ، هَذِهِ نَظَّارَةٌ.", "لَا، هَذَا لَيْسَ مِفْتَاحًا."])] }] },
  { id: "china", image: { src: `${IMG}/passport.svg`, alt: "Ein Mann hält einen amerikanischen Reisepass" }, lines: [{ label: "أ", parts: ["هَلْ هُوَ مِنَ الصِّينِ؟"] }, { label: "ب", parts: [gap(["لَا، هُوَ لَيْسَ مِنَ الصِّينِ. هُوَ مِنْ أَمْرِيكَا."], ["لَا، هُوَ لَيْسَ مِنَ الصِّينِ. هُوَ مِنْ أَمْرِيكَا.", "نَعَمْ، هُوَ مِنَ الصِّينِ.", "لَا، هِيَ لَيْسَتْ مِنَ الصِّينِ."])] }] },
  { id: "sami", image: { src: `${IMG}/sami.svg`, alt: "Ein Junge mit dem Namen „سامي“ auf dem T-Shirt" }, lines: [{ label: "أ", parts: ["هَلِ اسْمُهُ مُصْطَفَى؟"] }, { label: "ب", parts: [gap(["لَا، اسْمُهُ سَامِي."], ["لَا، اسْمُهُ سَامِي.", "نَعَمْ، اسْمُهُ مُصْطَفَى.", "لَا، اسْمُهَا سَامِيَة."])] }] },
  { id: "us", image: { src: `${IMG}/us-shirt.svg`, alt: "Ein Mann mit „U.S.“ auf dem Pullover" }, lines: [{ label: "أ", parts: ["هَلْ هُوَ يَابَانِيٌّ؟"] }, { label: "ب", parts: [gap(["لَا، هُوَ لَيْسَ يَابَانِيًّا. هُوَ أَمْرِيكِيٌّ."], ["لَا، هُوَ لَيْسَ يَابَانِيًّا. هُوَ أَمْرِيكِيٌّ.", "نَعَمْ، هُوَ يَابَانِيٌّ.", "لَا، هُوَ لَيْسَ يَابَانِيٌّ."])] }] },
  { id: "table", image: { src: "/images/a1/unit-4/tawila.svg", alt: "Ein Tisch" }, lines: [{ label: "أ", parts: ["هَلْ هَذَا قَلَمٌ؟"] }, { label: "ب", parts: [gap(["لَا، هَذَا لَيْسَ قَلَمًا. هَذِهِ طَاوِلَةٌ."], ["لَا، هَذَا لَيْسَ قَلَمًا. هَذِهِ طَاوِلَةٌ.", "نَعَمْ، هَذَا قَلَمٌ.", "لَا، هَذِهِ لَيْسَتْ قَلَمًا."])] }] },
  { id: "door", image: { src: "/images/vocabulary/bab.svg", alt: "Eine Tür" }, lines: [{ label: "أ", parts: ["هَلْ هَذِهِ نَافِذَةٌ؟"] }, { label: "ب", parts: [gap(["لَا، هَذِهِ لَيْسَتْ نَافِذَةً. هَذَا بَابٌ."], ["لَا، هَذِهِ لَيْسَتْ نَافِذَةً. هَذَا بَابٌ.", "نَعَمْ، هَذِهِ نَافِذَةٌ.", "لَا، هَذَا لَيْسَ نَافِذَةً."])] }] },
];

/** تدريب ١٠ (٢): the phone numbers – the words are printed right to left, the number is written left to right. */
const DIGIT: Record<string, string> = { "صِفْر": "٠", "وَاحِد": "١", "اثْنَان": "٢", "ثَلَاثَة": "٣", "أَرْبَعَة": "٤", "خَمْسَة": "٥", "سِتَّة": "٦", "سَبْعَة": "٧", "ثَمَانِيَة": "٨", "تِسْعَة": "٩" };
const PHONES: Array<[prefix: string, words: string[]]> = [
  ["٠١٢", ["صِفْر", "ثَلَاثَة", "وَاحِد", "تِسْعَة", "ثَمَانِيَة", "سَبْعَة", "خَمْسَة"]],
  ["٠١٢", ["سَبْعَة", "ثَلَاثَة", "أَرْبَعَة", "صِفْر", "خَمْسَة", "اثْنَان", "وَاحِد"]],
  ["٠١٢", ["تِسْعَة", "صِفْر", "وَاحِد", "أَرْبَعَة", "ثَلَاثَة", "سَبْعَة", "سِتَّة"]],
  ["٠١٦", ["اثْنَان", "سَبْعَة", "صِفْر", "سِتَّة", "خَمْسَة", "ثَلَاثَة", "تِسْعَة"]],
  ["٠١٢", ["سِتَّة", "تِسْعَة", "صِفْر", "صِفْر", "ثَلَاثَة", "أَرْبَعَة", "وَاحِد"]],
  ["٠١٨", ["تِسْعَة", "وَاحِد", "صِفْر", "ثَمَانِيَة", "ثَلَاثَة", "أَرْبَعَة", "وَاحِد"]],
  ["٠١٨", ["ثَمَانِيَة", "ثَلَاثَة", "أَرْبَعَة", "ثَلَاثَة", "اثْنَان", "خَمْسَة", "تِسْعَة"]],
];
export const phoneNumber = ([prefix, words]: (typeof PHONES)[number]) => prefix + [...words].reverse().map((w) => DIGIT[w]).join("");
const swap = (s: string, i: number) => s.slice(0, i) + s[i + 1] + s[i] + s.slice(i + 2);
const R10_PHONES: QuizItem[] = PHONES.map((p, n) => {
  const right = phoneNumber(p);
  const options = sorted([right, prefixWrong(p), swap(right, 5)]).filter((o, i, a) => a.indexOf(o) === i);
  return { id: `phone-${n + 1}`, arabic: `${p[0]} – ${[...p[1]].reverse().join(" – ")}`, german: n === 0 ? "Beispiel im Buch: ٠١٢٥٧٨٩١٣٠" : undefined, questions: [{ prompt: "Die Nummer:", options, answer: options.indexOf(right) }] };
});
function prefixWrong([prefix, words]: (typeof PHONES)[number]) {
  return prefix + words.map((w) => DIGIT[w]).join("");
}
const NUMBERS: MatchContent = {
  promptTitle: "الرَّقْمُ",
  optionTitle: "الْكَلِمَةُ",
  prompts: [
    { id: "28", arabic: "٢٨", answer: "w28" },
    { id: "30", arabic: "٣٠", answer: "w30" },
    { id: "45", arabic: "٤٥", answer: "w45" },
    { id: "9", arabic: "٩", answer: "w9" },
    { id: "76", arabic: "٧٦", answer: "w76" },
    { id: "98", arabic: "٩٨", answer: "w98" },
    { id: "63", arabic: "٦٣", answer: "w63" },
  ],
  // The book's column, top to bottom.
  options: [
    { id: "w45", label: "خَمْسَةٌ وَأَرْبَعُونَ", arabic: "خَمْسَةٌ وَأَرْبَعُونَ" },
    { id: "w76", label: "سِتَّةٌ وَسَبْعُونَ", arabic: "سِتَّةٌ وَسَبْعُونَ" },
    { id: "w28", label: "ثَمَانِيَةٌ وَعِشْرُونَ", arabic: "ثَمَانِيَةٌ وَعِشْرُونَ" },
    { id: "w98", label: "ثَمَانِيَةٌ وَتِسْعُونَ", arabic: "ثَمَانِيَةٌ وَتِسْعُونَ" },
    { id: "w30", label: "ثَلَاثُونَ", arabic: "ثَلَاثُونَ" },
    { id: "w9", label: "تِسْعَةٌ", arabic: "تِسْعَةٌ" },
    { id: "w63", label: "ثَلَاثَةٌ وَسِتُّونَ", arabic: "ثَلَاثَةٌ وَسِتُّونَ" },
  ],
};

const R12: ClozeItem[] = [
  { id: "korea", image: { src: `${IMG}/r12-korea.svg`, alt: "Im Restaurant: eine junge Frau und ein junger Mann mit Tellern" }, lines: [
    { label: "أ", parts: [gap(["هَلْ"], ["هَلْ", "مَا", "مَنْ"]), " أَنْتِ مِنْ كُورِيَا؟"] },
    { label: "ب", parts: ["لَا، ", gap(["أَنَا لَسْتُ"], ["أَنَا لَسْتُ", "هِيَ لَيْسَتْ", "أَنْتِ لَسْتِ"]), " مِنْ كُورِيَا. ", gap(["أَنَا"], ["أَنَا", "هِيَ"]), " مِنَ الصِّينِ. أَنَا ", gap(["صِينِيَّةٌ."], ["صِينِيَّةٌ.", "صِينِيٌّ.", "كُورِيَّةٌ."])] },
  ] },
  { id: "wallet", image: { src: `${IMG}/r12-wallet.svg`, alt: "Im Park: ein Mann gibt einem anderen eine Brieftasche" }, lines: [
    { label: "أ", parts: ["هَلْ ", gap(["هَذِهِ"], ["هَذِهِ", "هَذَا"]), " مِحْفَظَتُكَ؟"] },
    { label: "ب", parts: ["نَعَمْ، ", gap(["هَذِهِ مِحْفَظَتِي."], ["هَذِهِ مِحْفَظَتِي.", "هَذِهِ مِحْفَظَتُكَ.", "هَذَا مِحْفَظَتِي."]), " شُكْرًا."] },
    { label: "أ", parts: ["وَهَلْ هَذِهِ ", gap(["نُقُودُكَ؟"], ["نُقُودُكَ؟", "نُقُودِي؟"])] },
    { label: "ب", parts: ["لَا، هَذِهِ ", gap(["لَيْسَتْ نُقُودِي."], ["لَيْسَتْ نُقُودِي.", "لَيْسَ نُقُودِي.", "نُقُودِي."])] },
  ] },
  { id: "cola", image: { src: `${IMG}/r12-cola.svg`, alt: "Im Laden neben dem Kühlschrank: ein Mann und eine Frau" }, lines: [
    { label: "أ", parts: [gap(["أَيْنَ"], ["أَيْنَ", "مَنْ", "هَلْ"]), " الْكُوكَاكُولَا مِنْ فَضْلِكَ؟"] },
    { label: "ب", parts: ["الْكُوكَاكُولَا ", gap(["فِي"], ["فِي", "مِنْ"]), " الثَّلَّاجَةِ."] },
    { label: "أ", parts: ["شُكْرًا ", gap(["جَزِيلًا."], ["جَزِيلًا.", "بِكَ."])] },
    { label: "ب", parts: [gap(["عَفْوًا."], ["عَفْوًا.", "آسِف.", "مَعَ السَّلَامَةِ."])] },
  ] },
  { id: "photo", image: { src: `${IMG}/r12-photo.svg`, alt: "Ein Mann und eine Frau schauen ein Foto an" }, lines: [
    { label: "أ", parts: ["مَنْ ", gap(["هُمَا؟"], ["هُمَا؟", "هُمْ؟", "هِيَ؟"])] },
    { label: "ب", parts: [gap(["هُمَا"], ["هُمَا", "هُمْ"]), " أَحْمَد وَمُنَى."] },
    { label: "أ", parts: ["وَمَنْ ", gap(["هِيَ؟"], ["هِيَ؟", "هُوَ؟", "هُمَا؟"])] },
    { label: "ب", parts: [gap(["هِيَ"], ["هِيَ", "هُوَ"]), " مَاجِدَة."] },
  ] },
];

const ANSWERS13 = ["لَا، هَذَا كِتَابٌ فَرَنْسِيٌّ.", "نَعَمْ، هَذِهِ مَفَاتِيحُ عَلِيّ.", "لَا، هَذَا لَيْسَ كِتَابًا عَرَبِيًّا. هَذَا قَامُوسٌ.", "الْحَقَائِبُ عَلَى الْحَائِطِ.", "لَا، أَنَا لَسْتُ مُنَى. أَنَا اسْمِي آمَال.", "لَا، هَذِهِ لَيْسَتْ نَظَّارَتِي، هَذِهِ نَظَّارَةُ أَحْمَد."];
const R13: QuizItem[] = ([
  ["هَلْ هَذِهِ نَظَّارَتُكَ؟", 5], ["أَيْنَ الْحَقَائِبُ مِنْ فَضْلِكَ؟", 3], ["هَلْ هَذَا كِتَابٌ عَرَبِيٌّ؟", 2], ["هَلْ أَنْتِ السَّيِّدَةُ مُنَى؟", 4], ["هَلْ هَذِهِ مَفَاتِيحُ عَلِيّ؟", 1], ["هَلْ هَذَا كِتَابٌ إِنْجِلِيزِيٌّ؟", 0],
] as Array<[string, number]>).map(([q, a], n) => ({ id: `r13-${n + 1}`, arabic: q, questions: [{ prompt: "Die passende Antwort:", options: ANSWERS13, answer: a }] }));

const R9: QuizItem[] = ([
  ["حَقِيبَة", "mahmud", "Aktentasche"], ["نَظَّارَة", "suad", "Brille"], ["مَفَاتِيح", "suad", "Schlüssel"], ["أَقْلَام", "mahmud", "Stifte"],
  ["شَمْسِيَّة", "suad", "Schirm"], ["كُرَّاسَة", "mahmud", "Notizbuch"], ["تِلِيفُون", "mahmud", "Telefon"], ["كِتَاب", "suad", "Buch"],
] as Array<[string, "mahmud" | "suad", string]>).map(([thing, owner, de], n) => {
  const m = thing === "تِلِيفُون" || thing === "كِتَاب";
  const d = m ? "هَذَا" : "هَذِهِ";
  const stem = thing.endsWith("ة") ? thing.replace(/ة$/, "تُ") : `${thing}ُ`;
  const opts = [`نَعَمْ، ${d} ${stem}هُ.`, `نَعَمْ، ${d} ${stem}هَا.`];
  return { id: `r9-${n + 1}`, arabic: `هَلْ ${d} ${thing} ${owner === "mahmud" ? "مَحْمُود" : "سُعَاد"}؟`, german: `${de} – ${owner === "mahmud" ? "auf Mahmuds Tisch" : "bei Suad"}`, questions: [{ prompt: "Die Antwort:", options: opts, answer: owner === "mahmud" ? 0 : 1 }] };
});

/** تدريب ٨: put the words of the question in order. */
const R8 = [
  { words: ["اسْمُهُمَا", "سَعِيد", "هَلْ", "وَ", "طَارِق"], order: [2, 0, 1, 3, 4], de: "Heißen die beiden Said und Tarek?" },
  { words: ["حَقِيبَتِكَ", "الْقَلَمُ", "فِي", "هَلْ"], order: [3, 1, 2, 0], de: "Ist der Stift in deiner Tasche?" },
  { words: ["شِكْسْبِير", "إِنْجِلِيزِيٌّ", "هَلْ"], order: [2, 0, 1], de: "Ist Shakespeare Engländer?" },
  { words: ["أَنْتُمْ", "اسْمُكُمْ", "هَلْ", "سَمِير وَخَالِد وَعَادِل"], order: [2, 1, 3], de: "Heißt ihr Samir, Khalid und Adil?" },
];

export const a1Review5: A1Lesson = {
  slug: "muraja-1-5",
  kind: "review",
  label: "مُرَاجَعَةٌ عَامَّة",
  labelGerman: "Wiederholung Unit 1–5",
  steps: [
    { kind: "cloze", slug: "step-1", title: "Übung 1: Namen und Pronomen", navLabel: "Übung 1", instruction: { arabic: "مُرَاجَعَةٌ عَامَّةٌ مِنَ الْوَحْدَةِ الْأُولَى إِلَى الْوَحْدَةِ الْخَامِسَةِ · تَدْرِيبٌ (١): أَكْمِلِ النَّاقِصَ وَاكْتُبِ الِاسْمَ صَحِيحًا.", german: "Übung 1: Ergänze das fehlende Wort (اسْمُهَا, أَسْمَاؤُنَا …) und schreib die Namen aus den Buchstaben." }, items: R1 },
    { kind: "match", slug: "step-2", title: "Übung 2: Was passt?", navLabel: "Übung 2", instruction: { arabic: "تَدْرِيبٌ (٢): صِلِ الْجُمْلَةَ (أ) مَعَ (ب).", german: "Übung 2: Verbinde (أ) mit der passenden Antwort (ب)." }, match: R2 },
    { kind: "quiz", slug: "step-3", title: "Übung 3: das richtige Pronomen", navLabel: "Übung 3", instruction: { arabic: "تَدْرِيبٌ (٣): اِخْتَرِ الضَّمِيرَ الصَّحِيحَ: هُمْ – أَنَا – هِيَ – هُنَّ – هُمَا", german: "Übung 3: Welches Pronomen passt?" }, items: R3 },
    { kind: "cloze", slug: "step-4", title: "Übung 4: die passende Frage", navLabel: "Übung 4", instruction: { arabic: "تَدْرِيبٌ (٤): اُكْتُبِ السُّؤَالَ الْمُنَاسِبَ.", german: "Übung 4: Welche Frage passt zur Antwort?" }, items: R4 },
    { kind: "cloze", slug: "step-5", title: "Übung 5: Nawal und Mukhtar", navLabel: "Übung 5", instruction: { arabic: "تَدْرِيبٌ (٥): اِخْتَرِ الْكَلِمَةَ الْمُنَاسِبَةَ لِتُكْمِلَ الْمُحَادَثَةَ: مِحْفَظَتِي – لَسْتُ – آسِفَة – لُبْنَانِيَّة – أَنْتِ – مِحْفَظَتُكَ – أَنَا – اسْمِي – لَسْتُ – أَنْتَ", german: "Übung 5: Ergänze die Unterhaltung mit den Wörtern aus dem Kasten." }, items: R5 },
    { kind: "quiz", slug: "step-6", title: "Übung 6: Wortnetze", navLabel: "Übung 6", instruction: { arabic: "تَدْرِيبٌ (٦): اُكْتُبِ الْكَلِمَاتِ النَّاقِصَةَ.", german: "Übung 6: Im Buch sind sechs Kreise mit Strahlen – schreib passende Wörter dazu. Hier: Welches Wort gehört in den Kreis?", note: "Das Buch lässt die Wörter offen; Alif fragt je zwei Wörter pro Kreis ab." }, items: R6 },
    { kind: "cloze", slug: "step-7", title: "Übung 7: kurze Antworten", navLabel: "Übung 7", instruction: { arabic: "تَدْرِيبٌ (٧): اِقْرَأِ السُّؤَالَ ثُمَّ اكْتُبِ الْإِجَابَةَ.", german: "Übung 7: Lies die Frage und antworte passend zum Bild." }, items: R7 },
    {
      kind: "order",
      slug: "step-8",
      title: "Übung 8 (1): die Frage ordnen",
      navLabel: "Übung 8 (1)",
      instruction: { arabic: "تَدْرِيبٌ (٨): رَتِّبِ السُّؤَالَ ثُمَّ أَجِبْ عَنْهُ. ١) س: اسْمُهُمَا / سَعِيد / هَلْ / وَ / طَارِق؟", german: "Übung 8, Frage 1: Bring die Wörter in die richtige Reihenfolge.", note: "Die Antwort schreibst du frei (z. B. نَعَمْ، اسْمُهُمَا سَعِيد وَطَارِق)." },
      order: { items: R8[0]!.words.map((w, i) => ({ id: `w${i + 1}`, arabic: w, german: "" })), solutions: [R8[0]!.order.map((i) => `w${i + 1}`)] },
    },
    { kind: "order", slug: "step-9", title: "Übung 8 (2): die Frage ordnen", navLabel: "Übung 8 (2)", instruction: { arabic: "٢) س: حَقِيبَتِكَ / الْقَلَمُ / فِي / هَلْ؟", german: "Übung 8, Frage 2: Bring die Wörter in die richtige Reihenfolge." }, order: { items: R8[1]!.words.map((w, i) => ({ id: `w${i + 1}`, arabic: w, german: "" })), solutions: [R8[1]!.order.map((i) => `w${i + 1}`)] } },
    { kind: "order", slug: "step-10", title: "Übung 8 (3): die Frage ordnen", navLabel: "Übung 8 (3)", instruction: { arabic: "٣) س: شِكْسْبِير / إِنْجِلِيزِيٌّ / هَلْ؟", german: "Übung 8, Frage 3: Bring die Wörter in die richtige Reihenfolge." }, order: { items: R8[2]!.words.map((w, i) => ({ id: `w${i + 1}`, arabic: w, german: "" })), solutions: [R8[2]!.order.map((i) => `w${i + 1}`)] } },
    {
      kind: "order",
      slug: "step-11",
      title: "Übung 8 (4): die Frage ordnen",
      navLabel: "Übung 8 (4)",
      instruction: { arabic: "٤) س: أَنْتُمْ / اسْمُكُمْ / هَلْ / سَمِير وَخَالِد وَعَادِل؟", german: "Übung 8, Frage 4: Bring die Wörter in die richtige Reihenfolge.", note: "Das Buch druckt أَنْتُمْ und اسْمُكُمْ; beide Reihenfolgen nach هَلْ sind richtig." },
      order: { items: R8[3]!.words.map((w, i) => ({ id: `w${i + 1}`, arabic: w, german: "" })), solutions: [["w3", "w1", "w2", "w4"], ["w3", "w2", "w1", "w4"]] },
    },
    { kind: "quiz", slug: "step-12", title: "Übung 9: Wem gehört es?", navLabel: "Übung 9", instruction: { arabic: "تَدْرِيبٌ (٩): اُكْتُبْ سُؤَالًا كَالْمِثَالِ: هَلْ هَذَا كِتَابُ أَحْمَد؟ لَا، هَذَا لَيْسَ كِتَابَهُ. – هَلْ هَذَا كِتَابُ سُعَاد؟ نَعَمْ، هَذَا كِتَابُهَا.", german: "Übung 9: Mahmud und Suad an ihren Tischen. Wem gehört das Ding – ihm oder ihr? Wähle die richtige Antwort.", note: "Im Buch schreibst du die Frage selbst; Alif gibt die Frage und prüft die Antwort." }, items: R9 },
    { kind: "match", slug: "step-13", title: "Übung 10 (1): Zahlen", navLabel: "Übung 10 (1)", instruction: { arabic: "تَدْرِيبٌ (١٠): ١) صِلِ الرَّقْمَ بِالْكَلِمَةِ.", german: "Übung 10, Teil 1: Verbinde die Zahl mit dem Wort." }, match: NUMBERS },
    { kind: "quiz", slug: "step-14", title: "Übung 10 (2): Handynummern", navLabel: "Übung 10 (2)", instruction: { arabic: "٢) اُكْتُبْ رَقْمَ التِّلِيفُونِ الْمَحْمُولِ كَالْمِثَالِ.", german: "Übung 10, Teil 2: Hör die Ziffern und wähle die Nummer. Die Vorwahl (٠١٢) steht zuerst." }, items: R10_PHONES },
    { kind: "cloze", slug: "step-15", title: "Übung 12: Ergänze die Unterhaltungen", navLabel: "Übung 12", instruction: { arabic: "تَدْرِيبٌ (١٢): أَكْمِلِ الْحِوَارَ.", german: "Übung 12: Ergänze die vier Unterhaltungen zu den Bildern.", note: "Übung 11 im Buch ist ein Spiel für zwei Partner (Tic-Tac-Toe mit Bildern) – dafür braucht es einen Partner. Wo das Buch Wörter offen lässt, ist jede passende Wahl richtig." }, items: R12 },
    { kind: "quiz", slug: "step-16", title: "Übung 13: die passende Antwort", navLabel: "Übung 13", instruction: { arabic: "تَدْرِيبٌ (١٣): اِقْرَأِ السُّؤَالَ – ثُمَّ اخْتَرْ إِجَابَةً مُنَاسِبَةً مِنْ أَسْفَلَ.", german: "Übung 13: Welche Antwort passt in die Sprechblase?", note: "Übung 14 im Buch („اُدْخُلْ إِلَى الْمَوْقِعِ“) ist auf der Website des Verlags." }, items: R13 },
  ],
};
