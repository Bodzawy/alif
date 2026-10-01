import { allExercises } from "@/data/curriculum";
import { ARABIC_LETTERS } from "./letters";
import { FEEDBACK_CUES } from "./cues";
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
export const ALLOWED_TTS_TEXTS: ReadonlySet<string> = new Set([
  ...ARABIC_LETTERS.map((letter) => letter.modelText),
  ...allExercises().map((exercise) => exercise.modelText),
  ...Object.values(FEEDBACK_CUES),
]);

export function isAllowedTtsText(text: unknown): text is string {
  return typeof text === "string" && ALLOWED_TTS_TEXTS.has(text);
}
