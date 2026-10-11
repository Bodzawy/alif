import type { A1Lesson, Dialogue, DialogueLine, DialogueSpeaker, GapItem } from "@/data/types";

import { sharedGapsContent } from "./letter-lesson";

// "صَبَاحُ الْخَيْر" – the two conversations of Lektion 1 (textbook): two men
// (أَحْمَد, عَلِيّ), then two women (نَبِيلَة, فَاطِمَة), seven lines each – greeting,
// "how are you", names. Each conversation is ONE Dialogue object used by three
// steps: listen (two voices), repeat (every line), role-play (one role).
// Afterwards the letters of the lesson are found in the greeting (ب ح خ).
//
// Text, vowel signs and punctuation as given for the textbook dialogues. The
// women's lines use the feminine forms: حَالُكِ، اسْمُكِ، أَنْتِ (men: حَالُكَ، اسْمُكَ، أَنْتَ).
// The pronunciation target is the unvocalised text without punctuation (as for
// every A1 word), so masculine and feminine lines share a target where only the
// vowel differs (كيف حالك, ما اسمك) – see the rules in vocabulary_conditions.json.

const IMG = "/images/a1/sabah-al-khayr";
const GREETING = "صَبَاحُ الْخَيْر";

type LineSpec = [id: string, speaker: string, arabic: string, target: string, transliteration: string, german: string, literal?: string];

const lines = (specs: LineSpec[]): DialogueLine[] =>
  specs.map(([id, speaker, arabic, target, transliteration, german, literal]) => ({
    id,
    speaker,
    arabic,
    transliteration,
    german,
    ...(literal ? { literal } : {}),
    exercise: { id, target, modelText: arabic },
  }));

const speaker = (id: string, name: string, voice: DialogueSpeaker["voice"], alt: string): DialogueSpeaker => ({ id, name, voice, avatar: { src: `${IMG}/${id}.svg`, alt } });

/** Dialogue 1: two men. */
export const menDialogue: Dialogue = {
  id: "ahmad-ali",
  intro: "Zwei Männer begrüßen sich: Ahmad und Ali.",
  speakers: [
    speaker("ahmad", "Ahmad", "male-1", "Ahmad, ein Mann mit Bart und blauem Hemd"),
    speaker("ali", "Ali", "male-2", "Ali, ein Mann mit Brille und grünem Hemd"),
  ],
  lines: lines([
    ["m-sabah-al-khayr", "ahmad", "صَبَاحُ الْخَيْرِ.", "صباح الخير", "Ṣabāḥu l-khayri.", "Guten Morgen!"],
    ["m-sabah-an-nur", "ali", "صَبَاحُ النُّورِ.", "صباح النور", "Ṣabāḥu n-nūri.", "Guten Morgen!", "Morgen des Lichts"],
    ["m-kayfa-haluka", "ahmad", "كَيْفَ حَالُكَ؟", "كيف حالك", "Kayfa ḥāluka?", "Wie geht es dir?"],
    ["m-bi-khayr", "ali", "بِخَيْرٍ، الْحَمْدُ لِلَّهِ.", "بخير الحمد لله", "Bi-khayrin, al-ḥamdu li-llāhi.", "Gut, Gott sei Dank."],
    ["m-ma-smuka", "ahmad", "مَا اسْمُكَ؟", "ما اسمك", "Ma-smuka?", "Wie heißt du?"],
    ["m-ana-ali", "ali", "أَنَا عَلِيٌّ، وَأَنْتَ؟", "أنا علي وأنت", "Ana ʿAliyyun, wa-anta?", "Ich heiße Ali. Und du?"],
    ["m-wa-ana-ahmad", "ahmad", "وَأَنَا أَحْمَدُ.", "وأنا أحمد", "Wa-ana Aḥmadu.", "Und ich heiße Ahmad."],
  ]),
  question: {
    prompt: "Was sagen die beiden Männer zueinander?",
    options: ["Sie begrüßen sich am Morgen und sagen ihre Namen.", "Sie verabschieden sich am Abend.", "Sie kaufen zusammen Brot."],
    answer: 0,
  },
};

/** Dialogue 2: two women – the feminine forms. */
export const womenDialogue: Dialogue = {
  id: "nabila-fatima",
  intro: "Zwei Frauen begrüßen sich: Nabila und Fatima.",
  speakers: [
    speaker("nabila", "Nabila", "female-1", "Nabila, eine Frau mit lila Kopftuch"),
    speaker("fatima", "Fatima", "female-2", "Fatima, eine Frau mit orangem Kopftuch und Brille"),
  ],
  lines: lines([
    ["w-sabah-al-khayr", "nabila", "صَبَاحُ الْخَيْرِ.", "صباح الخير", "Ṣabāḥu l-khayri.", "Guten Morgen!"],
    ["w-sabah-an-nur", "fatima", "صَبَاحُ النُّورِ.", "صباح النور", "Ṣabāḥu n-nūri.", "Guten Morgen!", "Morgen des Lichts"],
    ["w-kayfa-haluki", "nabila", "كَيْفَ حَالُكِ؟", "كيف حالك", "Kayfa ḥāluki?", "Wie geht es dir?"],
    ["w-bi-khayr", "fatima", "بِخَيْرٍ، الْحَمْدُ لِلَّهِ.", "بخير الحمد لله", "Bi-khayrin, al-ḥamdu li-llāhi.", "Gut, Gott sei Dank."],
    ["w-ma-smuki", "nabila", "مَا اسْمُكِ؟", "ما اسمك", "Ma-smuki?", "Wie heißt du?"],
    ["w-ana-fatima", "fatima", "أَنَا فَاطِمَةُ، وَأَنْتِ؟", "أنا فاطمة وأنت", "Ana Fāṭimatu, wa-anti?", "Ich heiße Fatima. Und du?"],
    ["w-wa-ana-nabila", "nabila", "وَأَنَا نَبِيلَةُ.", "وأنا نبيلة", "Wa-ana Nabīlatu.", "Und ich heiße Nabila."],
  ]),
  question: {
    prompt: "Wie heißen die beiden Frauen?",
    options: ["Nabila und Fatima.", "Ahmad und Ali.", "Fatima und Ahmad."],
    answer: 0,
  },
};

const image = { src: `${IMG}/sabah-al-khayr.svg`, alt: "Ein Kind grüßt am Morgen, die Sonne geht auf" };
const item = (id: string, pattern: string, choices: string[]): GapItem => ({ id, arabic: GREETING, german: "Guten Morgen", pattern, choices, image });

export const a1SabahAlKhayr: A1Lesson = {
  slug: "sabah-al-khayr",
  kind: "phrase",
  label: GREETING,
  labelGerman: "Guten Morgen",
  steps: [
    // Dialogue 1 (Ahmad and Ali), then dialogue 2 (Nabila and Fatima): listen, repeat, role-play each.
    { kind: "dialogue", mode: "listen", slug: "step-1", title: "Anhören 1: Ahmad und Ali", navLabel: "Anhören 1", dialogue: menDialogue },
    { kind: "dialogue", mode: "repeat", slug: "step-2", title: "Nachsprechen 1: Ahmad und Ali", navLabel: "Nachsprechen 1", dialogue: menDialogue },
    { kind: "dialogue", mode: "roleplay", slug: "step-3", title: "Rollenspiel 1: Ahmad und Ali", navLabel: "Rollenspiel 1", dialogue: menDialogue },
    { kind: "dialogue", mode: "listen", slug: "step-4", title: "Anhören 2: Nabila und Fatima", navLabel: "Anhören 2", dialogue: womenDialogue },
    { kind: "dialogue", mode: "repeat", slug: "step-5", title: "Nachsprechen 2: Nabila und Fatima", navLabel: "Nachsprechen 2", dialogue: womenDialogue },
    { kind: "dialogue", mode: "roleplay", slug: "step-6", title: "Rollenspiel 2: Nabila und Fatima", navLabel: "Rollenspiel 2", dialogue: womenDialogue },
    {
      kind: "gaps",
      slug: "step-7",
      title: "Buchstaben finden: ب · ح · خ",
      navLabel: "Buchstaben finden",
      gaps: sharedGapsContent("picture", [], [
        item("sabah-ba", "صَ_احُ الْخَيْر", ["أَ", "بَ", "تَ", "ثَ"]),
        item("sabah-hha", "صَبَا_ الْخَيْر", ["أُ", "جُ", "حُ", "خُ"]),
        item("sabah-kha", "صَبَاحُ الْ_يْر", ["أَ", "جَ", "حَ", "خَ"]),
      ]),
    },
  ],
};
