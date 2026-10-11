import { a1Entries } from "@/data/a1";
import type { A1Word } from "@/data/types";

/**
 * Every evaluated word and phrase of every A1 entry ("Wörter" and the dialogue
 * lines – each line once), in lesson order.
 */
export function a1Words(): A1Word[] {
  const all = a1Entries().flatMap(({ lesson }) =>
    lesson.steps.flatMap((step): A1Word[] =>
      step.kind === "sound-words"
        ? step.groups.flatMap((group) => group.words)
        : step.kind === "dialogue"
          ? step.dialogue.lines.map(({ id, arabic, german, transliteration, exercise }) => ({ id, arabic, german, transliteration, exercise }))
          : []
    )
  );
  return all.filter((word, i) => all.findIndex((other) => other.exercise.id === word.exercise.id) === i);
}
