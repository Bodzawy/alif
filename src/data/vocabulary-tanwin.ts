import type { A1Lesson, A1Step, A1Unit, A1Word, Lesson, PhraseItem } from "@/data/types";
import { shownGap } from "@/data/a1/letter-lesson";
import { gapTask } from "@/lib/arabic/gap";
import { splitTiles } from "@/lib/arabic/hamza-alif";
import { tanwinTransliteration, tanwinWord, withTanwin } from "@/lib/arabic/tanwin";

// The vocabulary words are shown and spoken with Tanwin al-Damm (سَرِيرٌ, نَافِذَةٌ,
// كُرْسِيٌّ), as Lektion 1's letter lessons already do (tanwin.ts): the word cards
// (A0 → Wörter, A1 "Wörter"), the words of "Zuordnen" and the example words
// of "Wo steht der Buchstabe?". What is shown is what is spoken – and what a
// recording is filed under (recorded-manifest.json). The transliteration gets
// -un / -an / -in; the pronunciation target stays the pausal word without harakat.
// Unchanged on purpose: spelling, letter completion (Ergänzen / Hören), tables,
// sound comparison, dialogues and the sukun words of "Wo steht …" – their pausal
// spelling is the exercise. Words that cannot take Tanwin are in NO_TANWIN.
// From Lektion 2 on, a word in pause is spoken and shown with its Tanwin in more steps, as in
// Lektion 1: Ergänzen / Hören (shownGap), Buchstabieren, Quiz, tables, Wörter finden and
// the one-word expressions (laterStep). A word with a written final vowel (كَتَبَ, مَكْتَبُهُ,
// فَوْقَ) is not in pause and stays as it is; so do sound comparison and the sukun word of
// "Wo steht …", cloze and order sentences and the dialogues.

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
      const prompts = mapped(s.match.prompts, (p) => (p.result && pausalTanwin(p.result.arabic) !== p.result.arabic ? { ...p, result: { ...p.result, arabic: pausalTanwin(p.result.arabic) } } : p));
      const options = mapped(s.match.options, (o) => (o.arabic && pausalTanwin(o.arabic) !== o.arabic ? { ...o, arabic: pausalTanwin(o.arabic) } : o));
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

/** A final Fatha, Damma or Kasra (before or after a Shadda): the word is not in pause. */
const VOWEL_END = /(?:[َُِ]ّ?|ّ[َُِ])[.،؟?!:]*$/;
/** The plural of a Nisba (مِصْرِيُّون): its ن is not a Tanwin. */
const NISBA_PLURAL = /ي(?:ُّ|ّ)ُ?ون[.،؟?!:]*$/;
/** هُمْ and the suffixes ـهُمْ / ـكُمْ (كِتَابُكُمْ؟): their م is not a Tanwin either. */
const HUM = /[هك]ُمْ?[.،؟?!:]*$/;

/** Lektion 2 on: a word in pause with its Tanwin; a word with a written final vowel, unchanged. */
function pausalTanwin(arabic: string): string {
  return VOWEL_END.test(arabic) || NISBA_PLURAL.test(arabic) || HUM.test(arabic) ? arabic : withTanwin(arabic);
}

function phrase(item: PhraseItem): PhraseItem {
  // Only an expression that speaks exactly what it shows.
  if (item.exercise.modelText !== item.arabic) return item;
  const arabic = pausalTanwin(item.arabic);
  if (arabic === item.arabic) return item;
  return { ...item, arabic, transliteration: tanwinTransliteration(item.transliteration, item.arabic, arabic), exercise: { ...item.exercise, modelText: arabic } };
}

/** The steps that get the Tanwin from Lektion 2 on, besides those of step(). */
function laterStep(s: A1Step): A1Step {
  switch (s.kind) {
    case "gaps": {
      // An unvocalised word (Buchstaben ordnen: تاج, spoken تَاج) keeps its spelling; only the voice says the Tanwin.
      const items = mapped(s.gaps.items, (item) => {
        // The last tile is a gap (أَبْ "أَ_", a dictation): the answer carries the Sukun, so the voice says the word in pause too.
        if (item.pattern && !item.spoken && splitTiles(item.pattern).at(-1) === "_") return item;
        if (item.spoken) return pausalTanwin(item.spoken) === item.spoken ? item : { ...item, spoken: pausalTanwin(item.spoken) };
        if (!item.pattern) return item;
        const spoken = pausalTanwin(item.arabic);
        if (spoken === item.arabic) return item;
        const shown = { ...item, ...shownGap(item.arabic, item.pattern, spoken) };
        // The Tanwin changes a tile the pattern prints (قُرَى "_رَى" → قُرًى): the word stays as printed, only the voice says it.
        try {
          gapTask(shown);
          return shown;
        } catch {
          return { ...item, spoken };
        }
      });
      return items === s.gaps.items ? s : { ...s, gaps: { ...s.gaps, items } };
    }
    case "spell": {
      const words = mapped(s.words, (word) => (pausalTanwin(word.arabic) !== word.arabic ? { ...word, arabic: pausalTanwin(word.arabic) } : word));
      return words === s.words ? s : { ...s, words };
    }
    case "quiz": {
      const items = mapped(s.items, (item) => (!item.spoken && pausalTanwin(item.arabic) !== item.arabic ? { ...item, arabic: pausalTanwin(item.arabic) } : item));
      return items === s.items ? s : { ...s, items };
    }
    case "table": {
      const tables = mapped(s.tables, (table) => {
        const rows = mapped(table.rows, (row) => mapped(row, (cell) => (cell.listen !== false && pausalTanwin(cell.arabic) !== cell.arabic ? { ...cell, arabic: pausalTanwin(cell.arabic) } : cell)));
        return rows === table.rows ? table : { ...table, rows };
      });
      return tables === s.tables ? s : { ...s, tables };
    }
    case "word-pick": {
      if (!s.pick.words) return s;
      const words = mapped(s.pick.words, (word) => (pausalTanwin(word.arabic) !== word.arabic ? { ...word, arabic: pausalTanwin(word.arabic) } : word));
      return words === s.pick.words ? s : { ...s, pick: { ...s.pick, words } };
    }
    case "phrases": {
      const next = mapped(s.groups, (group) => {
        const items = mapped(group.items, phrase);
        return items === group.items ? group : { ...group, items };
      });
      return next === s.groups ? s : { ...s, groups: next };
    }
    default:
      return s;
  }
}

/** An A1 lesson (book unit) with its vocabulary words in their Tanwin form (the same object when none changes). */
export function vocabularyTanwin(unit: A1Unit): A1Unit {
  const lessons = mapped(unit.lessons, (lesson: A1Lesson) => {
    const steps = mapped(lesson.steps, (s) => (unit.number >= 2 ? laterStep(step(s)) : step(s)));
    return steps === lesson.steps ? lesson : { ...lesson, steps };
  });
  return lessons === unit.lessons ? unit : { ...unit, lessons };
}

/** An A0 → Wörter lesson with its word cards in their Tanwin form. */
export function lessonVocabularyTanwin(lesson: Lesson): Lesson {
  const vocabulary = mapped(lesson.vocabulary, card);
  return vocabulary === lesson.vocabulary ? lesson : { ...lesson, vocabulary };
}
