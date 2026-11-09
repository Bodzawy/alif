import { allTranslations, translate } from "@/i18n/translate";
import { LOCALE_ORDER } from "@/lib/locale";
import { a1FormsFallbackTexts, a1SpokenTexts } from "@/data/a1";
import { allExercises } from "@/data/curriculum";
import { ARABIC_LETTERS } from "./letters";
import { FEEDBACK_CUES, GERMAN_CUES } from "./cues";
import { hasRulesFor } from "./rules";

// Targets /api/pronunciation accepts: every letter of the alphabet (as in the
// original system) plus every exercise target used by a published lesson.
// Only targets that have condition rules can be evaluated.
export const ALLOWED_TARGETS: ReadonlySet<string> = new Set(
  [...ARABIC_LETTERS.map((letter) => letter.referenceText), ...allExercises().map((exercise) => exercise.target)].filter(
    hasRulesFor
  )
);

export function isAllowedTarget(target: unknown): target is string {
  return typeof target === "string" && ALLOWED_TARGETS.has(target);
}


// /api/tts only synthesises known lesson texts, so the public endpoint cannot
// be used as a free general-purpose Azure TTS proxy.
const LESSON_TTS_TEXTS = [
  ...ARABIC_LETTERS.map((letter) => letter.modelText),
  ...allExercises().map((exercise) => exercise.modelText),
  // The words of A1 "Ergänzen" / "Hören" without a recording (e.g. بَابْ).
  ...a1SpokenTexts(),
  // A letter lesson's Formen narration (German) and words until they are recorded.
  ...a1FormsFallbackTexts(),
  ...Object.values(FEEDBACK_CUES),
  ...Object.values(GERMAN_CUES),
];

const ARABIC_SCRIPT = /[؀-ۿ]/;

export const ALLOWED_TTS_TEXTS: ReadonlySet<string> = new Set([
  ...LESSON_TTS_TEXTS,
  // The same texts in the learner's language (src/i18n/): instructions and cues spoken in en, tr, sq, fr …
  ...allTranslations(),
  // … and each German text as the player translates it (localSpeechUrl → translate()): a text made from a
  // template ("Der Nachbar hat eine Hand. Er hält das Ba fest.") is in no dictionary as it is spoken
  // ("… ويمسك الباء."), so without this the narration of every letter lesson stayed silent outside German.
  ...LESSON_TTS_TEXTS.filter((text) => !ARABIC_SCRIPT.test(text)).flatMap((text) => LOCALE_ORDER.map((locale) => translate(text, locale))),
]);

export function isAllowedTtsText(text: unknown): text is string {
  return typeof text === "string" && ALLOWED_TTS_TEXTS.has(text);
}
