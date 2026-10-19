import { alifWriting } from "@/data/letters/alif";
import type { A1Lesson, FormsWord, GapItem, SoundItem, VocabularyItem } from "@/data/types";
import { tanwinWord, withTanwin } from "@/lib/arabic/tanwin";

// A1 · Lesson 1 – صَبَاحُ الْخَيْر. Alif with the three short vowels, then the
// words from the lesson sheet that begin with each of them (order as on the sheet).
// Sounds are evaluated against sound_conditions.json, words against
// vocabulary_conditions.json (Azure >= 70 and the word's consonants in IQRA).

const IMG = "/images/a1/lesson-1";

/** Steps 5 "Ergänzen" and 6 "Hören": narration and word recordings (see README → A1 · Ergänzen / Hören). */
export const UEBUNGEN_AUDIO_BASE = "/audio/a1/lesson-1/uebungen";

/**
 * A gap item: the full word as printed in the book. Pictures are the ones of
 * Schritt 2 (same files); word recordings are named after the id.
 */
const gapItem = (id: string, arabic: string, german: string, picture: boolean): GapItem => ({
  id,
  // shown as spoken, with Tanwin (the gap is the Hamza-Alif at the start)
  arabic: withTanwin(arabic),
  spoken: withTanwin(arabic),
  german,
  audio: id,
  ...(picture ? { image: { src: `${IMG}/${id}.svg`, alt: german } } : {}),
});

/** Step 3 "Formen": narration and word recordings (see README → A1 · Formen). */
export const FORMS_AUDIO_BASE = "/audio/a1/lesson-1/formen";

const formsWord = (id: string, arabic: string, german: string, audio: string, image?: FormsWord["image"]): FormsWord => ({ id, arabic, german, audio, image });

const ana = formsWord("ana", "أَنَا", "ich", "ana", { src: `${IMG}/ana.svg`, alt: "Ein Kind zeigt auf sich selbst" });
const saala = formsWord("saala", "سَأَلَ", "er fragte", "saala", { src: `${IMG}/saala.svg`, alt: "Ein Junge fragt etwas" });
const saba = formsWord("saba", "سَبَأَ", "Saba (Königreich)", "saba");
const qaraa = formsWord("qaraa", "قَرَأَ", "er las", "qaraa", { src: `${IMG}/qaraa.svg`, alt: "Ein Junge liest ein Buch" });
// From the book section "النطق مع السكون".
const ras = formsWord("ras", "رَأْس", "Kopf", "ras", { src: `${IMG}/ras.svg`, alt: "Ein Kopf" });

const fatha: SoundItem = {
  id: "alif-fatha",
  glyph: "أَ",
  transliteration: "a",
  vowelName: { arabic: "فَتْحَة", german: "Fatha" },
  exercise: { id: "alif-fatha", target: "أَ", modelText: "أَا" },
};

const kasra: SoundItem = {
  id: "alif-kasra",
  glyph: "إِ",
  transliteration: "i",
  vowelName: { arabic: "كَسْرَة", german: "Kasra" },
  exercise: { id: "alif-kasra", target: "إِ", modelText: "إِي" },
};

const damma: SoundItem = {
  id: "alif-damma",
  glyph: "أُ",
  transliteration: "u",
  vowelName: { arabic: "ضَمَّة", german: "Damma" },
  exercise: { id: "alif-damma", target: "أُ", modelText: "ؤُ" },
};

/** Shown and spoken with Tanwin; `target` is the pausal word without harakat. */
function word(id: string, pausal: string, target: string, german: string, written: string, alt: string): VocabularyItem {
  const { arabic, spoken, transliteration } = tanwinWord(pausal, written);
  return { id, arabic, german, transliteration, image: { src: `${IMG}/${id}.svg`, alt }, exercise: { id, target, modelText: spoken } };
}

/**
 * Alif, the first entry of Lektion 1. The former step 1 "Laute" (أَ إِ أُ on
 * their own) is part of "Wörter": every word row starts with its sound card
 * (glyph, vowel name, transliteration, listen and speak), so nothing is lost.
 */
export const a1Alif: A1Lesson = {
  slug: "alif",
  kind: "letter",
  label: "أ",
  labelGerman: "Alif",
  letter: { id: "alif", glyph: "أ", name: "Alif" },
  steps: [
    {
      kind: "sound-words",
      slug: "step-1",
      title: "Wörter mit أَ · إِ · أُ",
      navLabel: "Wörter",
      groups: [
        {
          sound: fatha,
          words: [
            word("ab", "أَب", "أب", "Vater", "Ab", "Ein Vater"),
            word("ana", "أَنَا", "أنا", "ich", "Anā", "Ein Kind zeigt auf sich selbst"),
            word("amir", "أَمِير", "أمير", "Prinz", "Amīr", "Ein Prinz mit Krone"),
          ],
        },
        {
          sound: kasra,
          words: [
            word("ibra", "إِبْرَة", "إبرة", "Nadel", "Ibra", "Eine Nähnadel mit Faden"),
            word("isba", "إِصْبَع", "إصبع", "Finger", "Iṣbaʿ", "Ein ausgestreckter Zeigefinger"),
            word("ibriq", "إِبْرِيق", "إبريق", "Kanne", "Ibrīq", "Eine Kanne"),
          ],
        },
        {
          sound: damma,
          words: [
            word("udhun", "أُذُن", "أذن", "Ohr", "Udhun", "Ein Ohr"),
            word("umm", "أُمّ", "أم", "Mutter", "Umm", "Eine Mutter"),
            word("usra", "أُسْرَة", "أسرة", "Familie", "Usra", "Eine Familie: Vater, Mutter und Kind"),
          ],
        },
      ],
    },
    {
      kind: "forms",
      slug: "step-2",
      title: "Formen: أ · ـأ",
      navLabel: "Formen",
      forms: {
        audioBase: FORMS_AUDIO_BASE,
        // The four words of the lesson book (Lesson1.pdf, page 1): start, middle, end, separate.
        explain: [ana, saala, saba, qaraa],
        build: [ana, saala, saba, qaraa],
        // Only letters of the book words: four with a Hand, one without.
        neighbors: ["س", "ب", "ن", "ق", "ر"],
        sort: [ana, saala, saba, qaraa, ras],
      },
    },
    {
      kind: "writing",
      slug: "step-3",
      title: "Schreiben: ا · ـا · أ · ـأ",
      navLabel: "Schreiben",
      letterSet: alifWriting,
    },
    {
      // Book exercise "تدريب (٢)" (Lesson1.pdf, page 2), in book order.
      kind: "gaps",
      slug: "step-4",
      title: "Ergänzen: أَ · إِ · أُ",
      navLabel: "Ergänzen",
      gaps: {
        audioBase: UEBUNGEN_AUDIO_BASE,
        mode: "picture",
        choices: ["أَ", "إِ", "أُ"],
        narration: { intro: "g5_intro", done: "g5_done" },
        items: [
          gapItem("ab", "أَب", "Vater", true),
          gapItem("ana", "أَنَا", "ich", true),
          gapItem("amir", "أَمِير", "Prinz", true),
          gapItem("ibra", "إِبْرَة", "Nadel", true),
          gapItem("isba", "إِصْبَع", "Finger", true),
          gapItem("ibriq", "إِبْرِيق", "Kanne", true),
          gapItem("udhun", "أُذُن", "Ohr", true),
          gapItem("umm", "أُمّ", "Mutter", true),
          gapItem("usra", "أُسْرَة", "Familie", true),
        ],
      },
    },
    {
      // Book exercise "تدريب (٣)" (Lesson1.pdf, page 2), in book order. No pictures: the child listens.
      kind: "gaps",
      slug: "step-5",
      title: "Hören: أْ · أَ · إِ · أُ",
      navLabel: "Hören",
      gaps: {
        audioBase: UEBUNGEN_AUDIO_BASE,
        mode: "listen",
        choices: ["أْ", "أَ", "إِ", "أُ"],
        narration: { intro: "g6_intro", done: "g6_done" },
        items: [
          gapItem("udhun", "أُذُن", "Ohr", false),
          gapItem("isba", "إِصْبَع", "Finger", false),
          gapItem("ab", "أَب", "Vater", false),
          gapItem("ibra", "إِبْرَة", "Nadel", false),
          gapItem("umm", "أُمّ", "Mutter", false),
          gapItem("ibriq", "إِبْرِيق", "Kanne", false),
          gapItem("ana", "أَنَا", "ich", false),
          gapItem("amir", "أَمِير", "Prinz", false),
          gapItem("usra", "أُسْرَة", "Familie", false),
          // The only item with sukun; the gap is in the middle: رَ ـ س.
          gapItem("ras", "رَأْس", "Kopf", false),
        ],
      },
    },
  ],
};
