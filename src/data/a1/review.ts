import type { A1Lesson, GapItem } from "@/data/types";
import { alignPattern } from "@/lib/arabic/gap";
import { baseLetter } from "@/lib/arabic/letter-form";

import { SHARED_GAPS_FOLDER, sharedGapsContent } from "./letter-lesson";
import { a1Alif } from "./lesson-1";
import { a1Ba } from "./letters/ba";
import { a1Hha } from "./letters/hha";
import { a1Jim } from "./letters/jim";
import { a1Kha } from "./letters/kha";
import { a1Ta } from "./letters/ta";
import { a1Tha } from "./letters/tha";

// "مراجعة" – the review of Lektion 1 (أ ب ت ث ج ح خ). Only words the child
// already learnt (Schritt "Wörter" of each letter), with their pictures. The
// first letter is missing; the four tiles carry the same vowel, so the child
// has to tell the LETTERS apart – above all the look-alikes ب ت ث and ج ح خ.

type Vowel = "a" | "i" | "u";
const MARK: Record<Vowel, string> = { a: "َ", i: "ِ", u: "ُ" };
const ALIF: Record<Vowel, string> = { a: "أَ", i: "إِ", u: "أُ" };
const tile = (letter: string, vowel: Vowel) => (letter === "أ" ? ALIF[vowel] : letter + MARK[vowel]);

/** The look-alikes of a letter (book order) plus one more, all with the same vowel. */
const FAMILY: Record<string, string[]> = {
  أ: ["أ", "ب", "ت", "ج"],
  ب: ["أ", "ب", "ت", "ث"],
  ت: ["أ", "ب", "ت", "ث"],
  ث: ["أ", "ب", "ت", "ث"],
  ج: ["أ", "ج", "ح", "خ"],
  ح: ["أ", "ج", "ح", "خ"],
  خ: ["أ", "ج", "ح", "خ"],
};

const LESSONS = [a1Alif, a1Ba, a1Ta, a1Tha, a1Jim, a1Hha, a1Kha];

function reviewItem(id: string, pattern: string, withPicture: boolean): GapItem {
  for (const lesson of LESSONS) {
    for (const step of lesson.steps) {
      if (step.kind !== "sound-words") continue;
      const word = step.groups.flatMap((group) => group.words).find((w) => w.id === id);
      if (!word) continue;
      const [gap] = alignPattern(word.arabic, pattern);
      if (!gap || gap.index !== 0 || gap.vowel === "sukun" || gap.vowel === "none") throw new Error(`review: "${pattern}" must leave out the first letter with its vowel`);
      const letter = baseLetter(gap.answer) === "إ" ? "أ" : baseLetter(gap.answer);
      const vowel = gap.vowel;
      return {
        id,
        arabic: word.arabic,
        german: word.german,
        pattern,
        choices: FAMILY[letter]!.map((l) => tile(l, vowel)),
        audio: `${lesson.slug}/uebungen/${id}`,
        ...(withPicture && word.image ? { image: word.image } : {}),
      };
    }
  }
  throw new Error(`review: no word "${id}" in Lektion 1`);
}

/** The review's own explanation clip: the answer is shown, its letter matters (not its vowel). */
const REVEAL = `${SHARED_GAPS_FOLDER}/r_letter`;
const REVIEW_TEXTS = { [REVEAL]: "Schau genau hin: Das ist der richtige Buchstabe. Leg ihn in die Lücke." };

function reviewGaps(mode: "picture" | "listen", items: GapItem[]) {
  const content = sharedGapsContent(mode, [], items);
  return { ...content, clips: { ...content.clips!, reveal: { a: REVEAL, i: REVEAL, u: REVEAL, sukun: REVEAL } }, texts: { ...content.texts, ...REVIEW_TEXTS } };
}

export const a1Review: A1Lesson = {
  slug: "review",
  kind: "review",
  label: "مُرَاجَعَة",
  labelGerman: "Wiederholung",
  steps: [
    {
      kind: "gaps",
      slug: "step-1",
      title: "Ergänzen: أ · ب · ت · ث · ج · ح · خ",
      navLabel: "Ergänzen",
      gaps: reviewGaps("picture", [
        reviewItem("thawm", "_وْم", true),
        reviewItem("ab", "_ب", true),
        reviewItem("khatam", "_اتَم", true),
        reviewItem("bint", "_نْت", true),
        reviewItem("hut", "_وت", true),
        reviewItem("tin", "_ين", true),
        reviewItem("jibal", "_بَال", true),
      ]),
    },
    {
      kind: "gaps",
      slug: "step-2",
      title: "Hören: أ · ب · ت · ث · ج · ح · خ",
      navLabel: "Hören",
      gaps: reviewGaps("listen", [
        reviewItem("jubn", "_بْن", false),
        reviewItem("tamr", "_مْر", false),
        reviewItem("khubz", "_بْز", false),
        reviewItem("ibra", "_بْرَة", false),
        reviewItem("thimar", "_مَار", false),
        reviewItem("haqiba", "_قِيبَة", false),
        reviewItem("burj", "_رْج", false),
      ]),
    },
  ],
};
