import { a1Entries } from "@/data/a1";
import type { A1Word } from "@/data/types";

/** A vocalised target is a sound (e.g. دُ of Lektion 2 · "Aussprechen"), not a word: it has a sound rule. */
const isSound = (target: string) => /[\u064B-\u0652]/.test(target);

/**
 * Every evaluated word and phrase of every A1 entry ("Wörter" and the dialogue
 * lines – each line once), in lesson order. Sounds practised as "phrases"
 * (Lektion 2 · تدريب ٨: دُ / دَ / دِ) are not words.
 */
export function a1Words(): A1Word[] {
  const all = a1Entries().flatMap(({ lesson }) =>
    lesson.steps.flatMap((step): A1Word[] =>
      step.kind === "sound-words"
        ? step.groups.flatMap((group) => group.words)
        : step.kind === "dialogue"
          ? step.dialogue.lines.map(({ id, arabic, german, transliteration, exercise }) => ({ id, arabic, german, transliteration, exercise }))
          : step.kind === "phrases"
            ? step.groups.flatMap((group) => group.items.filter((item) => !isSound(item.exercise.target)).map(({ id, arabic, german, transliteration, exercise }) => ({ id, arabic, german, transliteration, exercise })))
            : []
    )
  );
  return all.filter((word, i) => all.findIndex((other) => other.exercise.id === word.exercise.id) === i);
}
