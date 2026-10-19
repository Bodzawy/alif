import type { A1Lesson, A1LessonLetter, A1Step, FormsWord, GapItem, GapsContent, LetterPositions, SoundItem, WritingLetterSet } from "@/data/types";
import { alignPattern } from "@/lib/arabic/gap";
import { baseLetter, formGlyph, LETTER_FORMS, pickNeighbors } from "@/lib/arabic/letter-form";
import { tanwinWord } from "@/lib/arabic/tanwin";

import { letterFormsTexts, picture, SHARED_GAPS_FOLDER, sharedGapsContent, unvocalised, type LetterFormsWordSpec, type LetterWordSpec } from "../letter-lesson";

// A1 · Lektion 2 (مَسَاءُ الْخَيْر) – one entry per letter (د ذ و ي), built from
// the book pages in book order:
//   (١) النطق            → Wörter (each row starts with its sound)
//   (٢) كتابة + (٣) سكون  → Formen: the book's table of positions (د ذ و – letters
//                           without a "Hand") or the Formen step of Lektion 1 (ي)
//   تدريب ١ تتبع بالقلم   → Schreiben
//   تدريب ٢ اكتب الناقص   → Ergänzen (pictures)
//   تدريب ٣ اسمع واكتب    → Hören
//   تدريب ٤ اسمع وكرر واكتب → Hören, nachsprechen, schreiben
//   تدريب ٥–٧ الموقع      → no content in the book (they send the learner to the publisher's website)
//   تدريب ٨ انطق الحرف    → Aussprechen
//   تدريب ٩ اسمع واكتب    → Diktat
// Content only from "مساء الخير.pdf"; where the book leaves a letter without
// its sign, the vocalisation is completed (noted at each spec).

/** A gap item: [book pattern ("_" per missing letter), full vocalised word, id, German, picture (when the word is not one of "Wörter")]. */
export type Gap2Spec = [pattern: string, arabic: string, id: string, german?: string, picture?: LetterWordSpec[4]];

export type Lesson2LetterSpec = {
  letter: A1LessonLetter & { latin: string; nameArabic: string };
  /** (١) النطق – book order, each row right to left. */
  words: { fatha: LetterWordSpec[]; kasra: LetterWordSpec[]; damma: LetterWordSpec[] };
  /** (٢) + (٣) for a letter without a Hand (د ذ و): the book's table. */
  positions?: Omit<LetterPositions, "letter" | "name">;
  /** (٢) + (٣) for a letter with a Hand (ي): the Formen step of Lektion 1. */
  forms?: { start: LetterFormsWordSpec; middle: LetterFormsWordSpec; end: LetterFormsWordSpec; separate: LetterFormsWordSpec; sukun: LetterFormsWordSpec; pictures?: Record<string, LetterWordSpec[4]> };
  writing: WritingLetterSet;
  /** تدريب ٢ (with pictures) and ٣ (listening), in book order. */
  fill: Gap2Spec[];
  listen: Gap2Spec[];
  /** تدريب ٤: the words in book order; every occurrence of the letter is a gap. */
  repeatWrite: Array<[arabic: string, id: string, german: string]>;
  /** تدريب ٨: the vocalised letters in book order. */
  pronounce: string[];
  /** تدريب ٩: book pattern, solution word (from "حل تدريب ٩"), id, German. */
  dictation: Gap2Spec[];
  /** The letters the book lists for تدريب ٩, e.g. "أ ب ت ث ج ح خ د". */
  dictationLetters: string[];
  /** تدريب ٩ asks for the whole word ("اكتب الكلمة") instead of the missing letters. */
  dictationWholeWord?: boolean;
  /** Arabic instructions that differ per letter. */
  listenChoicesLabel: string;
  /** Extra German note on a step (e.g. the book's teacher note), by step slug. */
  notes?: Record<string, string>;
};

/** A step without its slug (the slugs are numbered in order). */
type StepInput = A1Step extends infer S ? (S extends A1Step ? Omit<S, "slug"> : never) : never;

const VOWELS = {
  fatha: { mark: "َ", latin: "a", name: { arabic: "فَتْحَة", german: "Fatha" } },
  kasra: { mark: "ِ", latin: "i", name: { arabic: "كَسْرَة", german: "Kasra" } },
  damma: { mark: "ُ", latin: "u", name: { arabic: "ضَمَّة", german: "Damma" } },
} as const;
type Vowel = keyof typeof VOWELS;
const SUKUN = "ْ";
const MARKS: Record<string, Vowel> = { "َ": "fatha", "ِ": "kasra", "ُ": "damma" };

/** The four tiles of a letter: with Fatha, Kasra, Damma, Sukun – the book's choice "(دَ / دِ / دُ / دْ)". */
export const vowelTiles = (letter: string) => [letter + VOWELS.fatha.mark, letter + VOWELS.kasra.mark, letter + VOWELS.damma.mark, letter + SUKUN];

/** The explanation for a gap letter without a vowel sign (a Dehnungsbuchstabe, or ا). Caption only until it is recorded. */
export const NONE_REVEAL = `${SHARED_GAPS_FOLDER}/r_none`;
export const NONE_REVEAL_TEXT = "Schau genau hin: So wird der Buchstabe hier geschrieben. Ein langes ā, ū oder ī schreibt man mit ا, و oder ي – ohne Vokalzeichen.";

/** A gap step of Lektion 2: the shared clips of Lektion 1, plus the explanation for letters without a sign. */
export function gaps2(mode: GapsContent["mode"], choices: string[], items: GapItem[], intro?: { clip: string; text: string }): GapsContent {
  const content = sharedGapsContent(mode, choices, items);
  return {
    ...content,
    ...(intro ? { narration: { ...content.narration, intro: intro.clip } } : {}),
    clips: { ...content.clips!, reveal: { ...content.clips!.reveal, none: NONE_REVEAL } },
    texts: { ...content.texts, [NONE_REVEAL]: NONE_REVEAL_TEXT, ...(intro ? { [intro.clip]: intro.text } : {}) },
  };
}

/** The intro of a step where the learner writes several letters or a whole word. */
export const WRITE_INTRO = { clip: `${SHARED_GAPS_FOLDER}/w_intro`, text: "Hör gut zu. Schreib die fehlenden Buchstaben mit ihren Zeichen – von rechts nach links. Tippe auf die richtige Kachel." };

/** Letters that look alike (same body, other dots): offered side by side in the dictation. */
const LOOK_ALIKE: string[][] = [
  ["ب", "ت", "ث"],
  ["ج", "ح", "خ"],
  ["د", "ذ"],
  ["ر", "ز"],
  ["س", "ش"],
  ["ص", "ض"],
  ["ط", "ظ"],
  ["ع", "غ"],
  ["ف", "ق"],
];

/** The Dehnungsbuchstaben (and a plain letter without sign). */
const LONG = ["ا", "و", "ي"];

/** Tiles for one gap of a dictation: the letter with every sign, its look-alikes with the same sign; ا و ي for a letter without sign. */
export function dictationChoices(answer: string): string[] {
  const letter = baseLetter(answer);
  const marks = Array.from(answer).filter((char) => char !== letter).join("");
  if (marks === "") return LONG.includes(letter) ? LONG : [...new Set([letter, ...LONG])];
  if (letter === "أ" || letter === "إ") return ["أَ", "إِ", "أُ", "أْ"].includes(answer) ? ["أَ", "إِ", "أُ", "أْ"] : ["أَ", "إِ", "أُ", "أْ", answer];
  const family = LOOK_ALIKE.find((group) => group.includes(letter)) ?? [letter];
  const own = vowelTiles(letter);
  const others = family.filter((l) => l !== letter).map((l) => l + marks);
  return [...new Set([...own, ...(own.includes(answer) ? [] : [answer]), ...others])];
}

/** A gap item whose gaps each get their own tiles (dictationChoices): a dictation, a whole word to write. */
export function dictationItem(id: string, pattern: string, arabic: string, german: string, audio?: string): GapItem {
  const bare = needsBare(arabic, pattern);
  const gaps = alignPattern(arabic, pattern, bare);
  return { id, arabic, german, ...(audio ? { audio } : {}), pattern, ...(bare ? { bare: true } : {}), gapChoices: gaps.map((gap) => dictationChoices(gap.answer)) };
}

/** Every tile that is a gap of the pattern must be offered: the choices plus answers they lack (e.g. دّ). */
function withAnswers(choices: string[], arabic: string, pattern: string, bare: boolean): string[] {
  const answers = alignPattern(arabic, pattern, bare).map((gap) => gap.answer);
  return [...new Set([...choices, ...answers])];
}

/** A gap may be a letter without sign (a Dehnungsbuchstabe, ا) – then the item allows it. */
export function needsBare(arabic: string, pattern: string): boolean {
  try {
    alignPattern(arabic, pattern);
    return false;
  } catch {
    alignPattern(arabic, pattern, true); // throws when the pattern really does not fit
    return true;
  }
}

/** The pattern for "write the letter": every tile of `letter` is a gap. */
export function letterPattern(arabic: string, letter: string): string {
  const parts: string[] = [];
  let tile = "";
  for (const char of arabic) {
    if (/[ً-ْٰ]/.test(char) && tile) tile += char;
    else {
      if (tile) parts.push(baseLetter(tile) === letter ? "_" : tile);
      tile = char;
    }
  }
  if (tile) parts.push(baseLetter(tile) === letter ? "_" : tile);
  return parts.join("");
}

export function lesson2Letter(spec: Lesson2LetterSpec): A1Lesson {
  const { letter } = spec;
  const audio = (id: string) => `${letter.id}/uebungen/${id}`;
  const allWords = [...spec.words.fatha, ...spec.words.kasra, ...spec.words.damma];
  const wordById = new Map(allWords.map((w) => [w[0], w]));

  const sound = (vowel: Vowel): SoundItem => {
    const glyph = letter.glyph + VOWELS[vowel].mark;
    const id = `${letter.id}-${vowel}`;
    return { id, glyph, transliteration: letter.latin + VOWELS[vowel].latin, vowelName: VOWELS[vowel].name, exercise: { id, target: glyph, modelText: glyph } };
  };
  const vowels: Vowel[] = ["fatha", "kasra", "damma"];
  const sounds = vowels.map(sound);
  const choices = vowelTiles(letter.glyph);

  const gapItem =
    (withPicture: boolean, step: string) =>
    ([pattern, arabic, id, german, pic]: Gap2Spec, n: number): GapItem => {
      const word = wordById.get(id);
      const meaning = german ?? word?.[2];
      if (!meaning) throw new Error(`${letter.id}: gap item "${arabic}" needs a German meaning`);
      const bare = needsBare(arabic, pattern);
      const image = withPicture ? picture(letter.id, id, pic ?? word?.[4]) : undefined;
      const own = withAnswers(choices, arabic, pattern, bare);
      return {
        id: `${step}-${n + 1}-${id}`,
        arabic,
        german: meaning,
        audio: audio(id),
        pattern,
        ...(bare ? { bare: true } : {}),
        ...(own.length !== choices.length ? { choices: own } : {}),
        ...(image ? { image } : {}),
      };
    };

  const steps: A1Step[] = [];
  const add = (step: StepInput) => steps.push({ ...step, slug: `step-${steps.length + 1}` } as A1Step);
  const note = (key: string) => spec.notes?.[key];

  // (١) النطق
  add({
    kind: "sound-words",
    title: `Wörter mit ${sounds.map((s) => s.glyph).join(" · ")}`,
    navLabel: "Wörter",
    instruction: { arabic: "(١) النُّطْقُ: كَرِّرْ بَعْدَ الْمُدَرِّسِ", german: "Aussprache: Hör zu und sprich nach – erst den Laut, dann die Wörter." },
    groups: vowels.map((vowel, i) => ({
      sound: sounds[i]!,
      // Shown and spoken with Tanwin; the target is the pausal word without harakat.
      words: spec.words[vowel].map(([id, pausal, german, written, pic]) => {
        const { arabic, spoken, transliteration } = tanwinWord(pausal, written);
        return {
          id,
          arabic,
          german,
          transliteration,
          ...(pic ? { image: picture(letter.id, id, pic) } : {}),
          exercise: { id, target: unvocalised(pausal), modelText: spoken },
        };
      }),
    })),
  });

  // (٢) كتابة الحرف + (٣) النطق مع السكون
  if (spec.positions) {
    add({
      kind: "positions",
      title: `Formen: ${[...new Set(spec.positions.items.map((i) => i.shape))].join(" · ")}`,
      navLabel: "Formen",
      instruction: { arabic: `(٢) كِتَابَةُ ${letter.nameArabic} · (٣) النُّطْقُ مَعَ السُّكُونِ`, german: `So steht das ${letter.name} im Wort – und so klingt es mit Sukun.` },
      positions: { letter: letter.glyph, name: letter.name, ...spec.positions },
    });
  } else if (spec.forms) {
    const { forms } = spec;
    const formsWord = ([id, arabic, german, occurrence]: LetterFormsWordSpec): FormsWord => {
      const pic = forms.pictures?.[id] ?? wordById.get(id)?.[4];
      const image = pic ? picture(letter.id, id, pic) : undefined;
      return { id, arabic, german, audio: id, ...(image ? { image } : {}), ...(occurrence !== undefined ? { occurrence } : {}) };
    };
    const book = [forms.start, forms.middle, forms.end, forms.separate].map(formsWord);
    const sukun = formsWord(forms.sukun);
    add({
      kind: "forms",
      title: `Formen: ${LETTER_FORMS.map((form) => formGlyph(letter.glyph, form)).join(" · ")}`,
      navLabel: "Formen",
      instruction: { arabic: `(٢) كِتَابَةُ ${letter.nameArabic} · (٣) النُّطْقُ مَعَ السُّكُونِ`, german: `So sieht das ${letter.name} am Anfang, in der Mitte, am Ende und allein aus.` },
      forms: {
        audioBase: `/audio/a1/${letter.id}/formen`,
        explain: book,
        build: book,
        neighbors: pickNeighbors([...book, sukun].map((w) => w.arabic), letter.glyph),
        sort: [...book, sukun],
        letter: { glyph: letter.glyph, name: letter.name, texts: letterFormsTexts(letter.name, [book[0]!.german, book[1]!.german, book[2]!.german, book[3]!.german]) },
      },
    });
  }

  // تدريب ١
  add({
    kind: "writing",
    title: `Schreiben: ${spec.writing.forms.map((f) => f.glyph).join(" · ")}`,
    navLabel: "Schreiben",
    instruction: { arabic: "تَدْرِيبٌ (١): تَتَبَّعْ بِالْقَلَمِ.", german: "Übung 1: Fahr die Linie nach – mit dem Finger, dem Stift oder der Maus." },
    letterSet: spec.writing,
  });

  // تدريب ٢ and ٣
  add({
    kind: "gaps",
    title: `Ergänzen: ${choices.join(" · ")}`,
    navLabel: "Ergänzen",
    instruction: { arabic: "تَدْرِيبٌ (٢): اُكْتُبِ الْحَرْفَ النَّاقِصَ بِالتَّشْكِيلِ.", german: "Übung 2: Ergänze den fehlenden Buchstaben – mit seinem Vokalzeichen.", note: note("fill") },
    gaps: gaps2("picture", choices, spec.fill.map(gapItem(true, "fill"))),
  });
  add({
    kind: "gaps",
    title: `Hören: ${choices.join(" · ")}`,
    navLabel: "Hören",
    instruction: {
      arabic: `تَدْرِيبٌ (٣): اِسْمَعْ مِنَ الْمُدَرِّسِ وَاكْتُبِ الْحَرْفَ النَّاقِصَ بِالتَّشْكِيلِ ${spec.listenChoicesLabel}.`,
      german: "Übung 3: Hör zu und ergänze den fehlenden Buchstaben mit Vokalzeichen.",
      note: note("listen") ?? "Im Buch: „صَحِّحْ مَعَ زَمِيلِكَ“ – vergleiche mit deinem Lernpartner. Hier prüft Alif deine Antwort sofort.",
    },
    gaps: gaps2("listen", choices, spec.listen.map(gapItem(false, "listen"))),
  });

  // تدريب ٤
  add({
    kind: "gaps",
    title: `Hören, nachsprechen, schreiben`,
    navLabel: "Nachsprechen & schreiben",
    instruction: {
      arabic: "تَدْرِيبٌ (٤): اِسْمَعْ وَكَرِّرْ بَعْدَ الْمُدَرِّسِ وَاكْتُبِ الْحَرْفَ بِالتَّشْكِيلِ.",
      german: `Übung 4: Hör zu, sprich nach und schreib das ${letter.name} mit seinem Vokalzeichen.`,
      note: "Die Übungen 5–7 im Buch („اُدْخُلْ إِلَى الْمَوْقِعِ“) verweisen auf die Website des Buchverlags; im Buch selbst stehen dazu keine Aufgaben.",
    },
    gaps: {
      ...gaps2(
        "listen",
        choices,
        spec.repeatWrite.map(([arabic, id, german], n) => gapItem(false, "repeat")([letterPattern(arabic, letter.glyph), arabic, id, german], n))
      ),
      repeat: true,
    },
  });

  // تدريب ٨
  add({
    kind: "phrases",
    title: `Aussprechen: ${spec.pronounce.join(" · ")}`,
    navLabel: "Aussprechen",
    instruction: { arabic: "تَدْرِيبٌ (٨): اُنْطُقِ الْحَرْفَ مَعَ حَرَكَتِهِ.", german: `Übung 8: Sprich das ${letter.name} mit seinem Vokal.` },
    groups: [
      {
        id: `${letter.id}-pronounce`,
        title: "Der Buchstabe mit seinem Vokal",
        items: spec.pronounce.map((glyph, n) => {
          const vowel = MARKS[Array.from(glyph).find((c) => MARKS[c])!]!;
          return {
            id: `${letter.id}-p8-${n + 1}`,
            arabic: glyph,
            transliteration: letter.latin + VOWELS[vowel].latin,
            german: `${letter.name} mit ${VOWELS[vowel].name.german}`,
            exercise: { id: `${letter.id}-p8-${n + 1}`, target: glyph, modelText: glyph },
          };
        }),
      },
    ],
  });

  // تدريب ٩
  add({
    kind: "gaps",
    title: `Diktat: ${spec.dictationLetters.join(" ")}`,
    navLabel: "Diktat",
    instruction: {
      arabic: spec.dictationWholeWord
        ? `تَدْرِيبٌ (٩): اِسْمَعْ وَاكْتُبِ الْكَلِمَةَ بِالتَّشْكِيلِ (${spec.dictationLetters.join(" – ")}).`
        : `تَدْرِيبٌ (٩): اِسْمَعْ وَاكْتُبِ الْحَرْفَ النَّاقِصَ بِالتَّشْكِيلِ (${spec.dictationLetters.join(" – ")}).`,
      german: spec.dictationWholeWord ? "Übung 9: Hör zu und schreib das ganze Wort mit Vokalzeichen – Buchstabe für Buchstabe." : "Übung 9: Hör zu und schreib die fehlenden Buchstaben mit Vokalzeichen.",
      note: note("dictation") ?? "Die Lösungswörter stehen im Buch unter „حَلُّ تَدْرِيبِ (٩)“. Ein Buchstabe am Wortende ohne Vokal wird mit Sukun geschrieben.",
    },
    gaps: gaps2(
      "listen",
      spec.dictationLetters,
      spec.dictation.map(([pattern, arabic, id, german], n) => dictationItem(`dictation-${n + 1}-${id}`, pattern, arabic, german!, audio(id))),
      WRITE_INTRO
    ),
  });

  return { slug: letter.id, kind: "letter", label: letter.glyph, labelGerman: letter.name, letter: { id: letter.id, glyph: letter.glyph, name: letter.name }, steps };
}
