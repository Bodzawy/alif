import type { A1Lesson, Dialogue, DialogueSpeaker, PhraseItem, PronunciationExercise } from "@/data/types";

import { lines, menDialogue, womenDialogue } from "./sabah-al-khayr";

// The textbook page after the "صَبَاحُ الْخَيْر" conversations (Lektion 1):
//   التَّحِيَّةُ فِي الصَّبَاحِ – the morning greeting, with the masculine and the
//     feminine "how are you", and the answers;
//   تَقْدِيمُ النَّفْسِ – "أَنَا مَاجِدٌ." / "وَأَنَا فَاطِمَةُ.";
//   التَّدْرِيبَاتُ – (1) repeat the dialogue with a classmate and ask for the
//     name, (2) underline ا, (3) underline ب in the dialogue.
// The content follows the learner's description of the page (the page itself
// was not available here); see the report for what had to be decided.
//
// Exercise 1: there is no second human learner in Alif, so the partner is
// spoken by the app (role-play, as in "صَبَاحُ الْخَيْر"). Its conversation is
// built only from the page's expressions and the book's question "مَا اسْمُكَ؟"
// (Majid speaks to a woman: حَالُكِ، وَأَنْتِ – Fatima to a man: حَالُكَ، اسْمُكَ).
// Exercises 2 and 3 use the book's two conversations of the lesson unchanged.

const IMG = "/images/a1/sabah-al-khayr";

/** "Anhören" in a speaker's voice: the text, voice and recording (line) it plays. */
type Say = Pick<PronunciationExercise, "modelText" | "voice" | "line">;
type Spec = [id: string, arabic: string, target: string, transliteration: string, german: string, extra?: Partial<Pick<PhraseItem, "literal" | "tag" | "gender">> & { say?: Say }];
const phrase = ([id, arabic, target, transliteration, german, extra]: Spec): PhraseItem => {
  const { say, ...rest } = extra ?? {};
  return { id, arabic, transliteration, german, ...rest, exercise: { id, target, modelText: arabic, ...say } };
};

const speaker = (id: string, name: string, voice: DialogueSpeaker["voice"], alt: string): DialogueSpeaker => ({ id, name, voice, avatar: { src: `${IMG}/${id}.svg`, alt } });

/** Exercise 1: Majid and Fatima – greeting, "how are you" (both forms), names. */
export const majidFatimaDialogue: Dialogue = {
  id: "majid-fatima",
  intro: "Majid und Fatima begrüßen sich am Morgen und fragen nach dem Namen.",
  speakers: [speaker("majid", "Majid", "male-1", "Majid, ein Mann mit kurzem Bart und orangem Hemd"), speaker("fatima", "Fatima", "female-2", "Fatima, eine Frau mit orangem Kopftuch und Brille")],
  lines: lines([
    ["t-sabah-al-khayr", "majid", "صَبَاحُ الْخَيْرِ.", "صباح الخير", "Ṣabāḥu l-khayri.", "Guten Morgen!"],
    ["t-sabah-an-nur", "fatima", "صَبَاحُ النُّورِ.", "صباح النور", "Ṣabāḥu n-nūri.", "Guten Morgen!", "Morgen des Lichts"],
    ["t-kayfa-haluki", "majid", "كَيْفَ حَالُكِ؟", "كيف حالك", "Kayfa ḥāluki?", "Wie geht es dir? (zu einer Frau)"],
    ["t-bi-khayr-f", "fatima", "بِخَيْرٍ، الْحَمْدُ لِلَّهِ.", "بخير الحمد لله", "Bi-khayrin, al-ḥamdu li-llāhi.", "Gut, Gott sei Dank."],
    ["t-kayfa-haluka", "fatima", "كَيْفَ حَالُكَ؟", "كيف حالك", "Kayfa ḥāluka?", "Wie geht es dir? (zu einem Mann)"],
    ["t-bi-khayr-m", "majid", "بِخَيْرٍ، الْحَمْدُ لِلَّهِ.", "بخير الحمد لله", "Bi-khayrin, al-ḥamdu li-llāhi.", "Gut, Gott sei Dank."],
    ["t-ma-smuka", "fatima", "مَا اسْمُكَ؟", "ما اسمك", "Ma-smuka?", "Wie heißt du? (zu einem Mann)"],
    ["t-ana-majid", "majid", "أَنَا مَاجِدٌ، وَأَنْتِ؟", "أنا ماجد وأنت", "Ana Mājidun, wa-anti?", "Ich heiße Majid. Und du? (zu einer Frau)"],
    ["t-wa-ana-fatima", "fatima", "وَأَنَا فَاطِمَةُ.", "وأنا فاطمة", "Wa-ana Fāṭimatu.", "Und ich heiße Fatima."],
  ]),
  question: {
    prompt: "Wie heißen die beiden?",
    options: ["Majid und Fatima.", "Ahmad und Ali.", "Nabila und Fatima."],
    answer: 0,
  },
};

/** The expression as Majid or Fatima says it in the dialogue – with their recording. */
function saidIn(lineId: string): Say {
  const line = majidFatimaDialogue.lines.find((l) => l.id === lineId)!;
  return { modelText: line.exercise.modelText, voice: majidFatimaDialogue.speakers.find((s) => s.id === line.speaker)!.voice, line: line.id };
}

const ROLEPLAY_GERMAN = "Spiele den Dialog mit deinem Lernpartner nach und frage nach seinem oder ihrem Namen.";

export const a1Tahiyya: A1Lesson = {
  slug: "tahiyya-wa-taqdim",
  kind: "phrase",
  label: "التَّحِيَّةُ وَتَقْدِيمُ النَّفْسِ",
  labelGerman: "Begrüßen und sich vorstellen",
  steps: [
    {
      kind: "phrases",
      slug: "step-1",
      title: "Begrüßung am Morgen",
      navLabel: "Begrüßung",
      instruction: { arabic: "التَّحِيَّةُ فِي الصَّبَاحِ", german: "Hör jeden Ausdruck an und sprich ihn nach. Achte darauf, ob du mit einem Mann oder einer Frau sprichst." },
      groups: [
        {
          id: "gruss",
          title: "Der Gruß und die Antwort",
          items: [
            phrase(["p-sabah-al-khayr", "صَبَاحُ الْخَيْرِ", "صباح الخير", "Ṣabāḥu l-khayri", "Guten Morgen!", { tag: "Gruß – zu Mann und Frau gleich", literal: "Morgen des Guten", say: saidIn("t-sabah-al-khayr") }]),
            phrase(["p-sabah-an-nur", "صَبَاحُ النُّورِ", "صباح النور", "Ṣabāḥu n-nūri", "Guten Morgen!", { tag: "Antwort", literal: "Morgen des Lichts", say: saidIn("t-sabah-an-nur") }]),
          ],
        },
        {
          id: "befinden",
          title: "Wie geht es dir?",
          note: "Die Frage hat zwei Formen. Nur der letzte Vokal ändert sich: حَالُكَ (ḥālu-ka) sagst du zu einem Mann, حَالُكِ (ḥālu-ki) zu einer Frau. Die Antwort ist für beide gleich.",
          items: [
            phrase(["p-kayfa-haluka", "كَيْفَ حَالُكَ؟", "كيف حالك", "Kayfa ḥāluka?", "Wie geht es dir?", { tag: "zu einem Mann", gender: "m", say: saidIn("t-kayfa-haluka") }]),
            phrase(["p-kayfa-haluki", "كَيْفَ حَالُكِ؟", "كيف حالك", "Kayfa ḥāluki?", "Wie geht es dir?", { tag: "zu einer Frau", gender: "f", say: saidIn("t-kayfa-haluki") }]),
            phrase(["p-bi-khayr", "بِخَيْرٍ، الْحَمْدُ لِلَّهِ.", "بخير الحمد لله", "Bi-khayrin, al-ḥamdu li-llāhi.", "Gut, Gott sei Dank.", { tag: "Antwort", literal: "Gut, das Lob gebührt Gott", say: saidIn("t-bi-khayr-f") }]),
          ],
        },
      ],
    },
    {
      kind: "phrases",
      slug: "step-2",
      title: "Sich vorstellen",
      instruction: { arabic: "تَقْدِيمُ النَّفْسِ", german: "So sagst du, wie du heißt. Hör zu und sprich nach." },
      groups: [
        {
          id: "vorstellen",
          title: "Ich heiße …",
          note: "Auf Arabisch sagst du einfach „Ich (bin) Majid“ – ein Wort für „bin“ gibt es hier nicht. وَ (wa) heißt „und“.",
          items: [
            phrase(["p-ana-majid", "أَنَا مَاجِدٌ.", "أنا ماجد", "Ana Mājidun.", "Ich heiße Majid.", { literal: "Ich (bin) Majid", say: { modelText: "أَنَا مَاجِدٌ.", voice: "male-1", line: "p-ana-majid" } }]),
            phrase(["p-wa-ana-fatima", "وَأَنَا فَاطِمَةُ.", "وأنا فاطمة", "Wa-ana Fāṭimatu.", "Und ich heiße Fatima.", { literal: "Und ich (bin) Fatima", say: saidIn("t-wa-ana-fatima") }]),
          ],
        },
      ],
    },
    { kind: "dialogue", mode: "listen", slug: "step-3", title: "Anhören: Majid und Fatima", navLabel: "Anhören", dialogue: majidFatimaDialogue },
    {
      kind: "dialogue",
      mode: "roleplay",
      slug: "step-4",
      title: "Übung 1: Rollenspiel",
      navLabel: "Rollenspiel",
      instruction: {
        arabic: "كَرِّرِ الْمُحَادَثَةَ مَعَ زَمِيلِكَ أَوْ زَمِيلَتِكَ، وَاسْأَلْ عَنِ اسْمِهِ / اسْمِهَا.",
        german: ROLEPLAY_GERMAN,
        note: "Dein Lernpartner ist hier die App: Sie spricht die andere Rolle. Als Majid fragst du eine Frau (حَالُكِ، وَأَنْتِ؟), als Fatima einen Mann (حَالُكَ، مَا اسْمُكَ؟).",
      },
      dialogue: majidFatimaDialogue,
    },
    {
      kind: "letter-find",
      slug: "step-5",
      title: "Übung 2: Finde ا",
      navLabel: "Finde ا",
      instruction: {
        arabic: "اِقْرَأِ الْحِوَارَ، وَضَعْ خَطًّا تَحْتَ حَرْفِ الْأَلِفِ.",
        german: "Lies den Dialog und unterstreiche jedes Alif (ا). Tippe dazu auf den Buchstaben.",
        note: "Jedes Alif zählt – auch mit Hamza (أ) und das Alif von ال.",
      },
      find: { letter: "ا", name: "Alif", accepts: ["ا", "أ", "إ", "آ"], dialogue: menDialogue },
    },
    {
      kind: "letter-find",
      slug: "step-6",
      title: "Übung 3: Finde ب",
      navLabel: "Finde ب",
      instruction: {
        arabic: "اِقْرَأِ الْحِوَارَ، وَضَعْ خَطًّا تَحْتَ حَرْفِ الْبَاءِ.",
        german: "Lies den Dialog und unterstreiche jedes Ba (ب). Tippe dazu auf den Buchstaben.",
        note: "Vorsicht: ت، ث، ن und ي sehen ähnlich aus – das Ba hat genau einen Punkt unten.",
      },
      find: { letter: "ب", name: "Ba", accepts: ["ب"], dialogue: womenDialogue },
    },
  ],
};
