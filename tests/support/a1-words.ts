import { A1_LEVEL } from "@/data/a1";
import type { VocabularyItem } from "@/data/types";

/** Every word of every A1 lesson, in lesson order. */
export function a1Words(): VocabularyItem[] {
  return A1_LEVEL.lessons.flatMap((lesson) =>
    lesson.steps.flatMap((step) => (step.kind === "sound-words" ? step.groups.flatMap((group) => group.words) : []))
  );
}
