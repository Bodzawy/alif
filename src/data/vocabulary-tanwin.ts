import type { A1Lesson, A1Step, A1Unit, A1Word, Lesson } from "@/data/types";
import { tanwinWord, withTanwin } from "@/lib/arabic/tanwin";

// The vocabulary words are shown and spoken with Tanwin al-Damm (سَرِيرٌ, نَافِذَةٌ,
// كُرْسِيٌّ), as Lektion 1's letter lessons already do (tanwin.ts): the word cards
// (A0 → Wörter, A1 "Wörter"), the words of "Zuordnen" and the example words
// of "Wo steht der Buchstabe?". What is shown is what is spoken – and what a
// recording is filed under (recorded-manifest.json). The transliteration gets
// -un / -an / -in; the pronunciation target stays the pausal word without harakat.
// Unchanged on purpose: spelling, letter completion (Ergänzen / Hören), tables,
// sound comparison, dialogues and the sukun words of "Wo steht …" – their pausal
// spelling is the exercise. Words that cannot take Tanwin are in NO_TANWIN.

function card<T extends A1Word>(word: T): T {
  // Only a card that speaks exactly what it shows (one form for both).
  if (word.exercise.modelText !== word.arabic) return word;
  const { arabic, spoken, transliteration } = tanwinWord(word.arabic, word.transliteration);
  return arabic === word.arabic ? word : { ...word, arabic, transliteration, exercise: { ...word.exercise, modelText: spoken } };
}

/** The same array when no item changed (lessons without such words stay the very same objects). */
function mapped<T>(items: T[], f: (item: T) => T): T[] {
  const out = items.map(f);
  return out.some((item, i) => item !== items[i]) ? out : items;
}

function groups<G extends { words: A1Word[] }>(list: G[]): G[] {
  return mapped(list, (group) => {
    const words = mapped(group.words, card);
    return words === group.words ? group : { ...group, words };
  });
}

function step(s: A1Step): A1Step {
  switch (s.kind) {
    case "words":
    case "sound-words": {
      const next = groups<(typeof s.groups)[number]>(s.groups);
      return next === s.groups ? s : ({ ...s, groups: next } as A1Step);
    }
    case "match": {
      // The joined word after a match, and the same word in the word column (one form in both places).
      const prompts = mapped(s.match.prompts, (p) => (p.result && withTanwin(p.result.arabic) !== p.result.arabic ? { ...p, result: { ...p.result, arabic: withTanwin(p.result.arabic) } } : p));
      const options = mapped(s.match.options, (o) => (o.arabic && withTanwin(o.arabic) !== o.arabic ? { ...o, arabic: withTanwin(o.arabic) } : o));
      return prompts === s.match.prompts && options === s.match.options ? s : { ...s, match: { ...s.match, prompts, options } };
    }
    case "positions": {
      const items = mapped(s.positions.items, (item) => (withTanwin(item.word) !== item.word ? { ...item, word: withTanwin(item.word) } : item));
      return items === s.positions.items ? s : { ...s, positions: { ...s.positions, items } };
    }
    default:
      return s;
  }
}

/** An A1 lesson (book unit) with its vocabulary words in their Tanwin form (the same object when none changes). */
export function vocabularyTanwin(unit: A1Unit): A1Unit {
  const lessons = mapped(unit.lessons, (lesson: A1Lesson) => {
    const steps = mapped(lesson.steps, step);
    return steps === lesson.steps ? lesson : { ...lesson, steps };
  });
  return lessons === unit.lessons ? unit : { ...unit, lessons };
}

/** An A0 → Wörter lesson with its word cards in their Tanwin form. */
export function lessonVocabularyTanwin(lesson: Lesson): Lesson {
  const vocabulary = mapped(lesson.vocabulary, card);
  return vocabulary === lesson.vocabulary ? lesson : { ...lesson, vocabulary };
}
