import type { A1Lesson, A1LessonLetter, A1Word, FormsWord, GapItem, GapsContent, SoundItem, WritingLetterSet } from "@/data/types";
import { splitTiles } from "@/lib/arabic/hamza-alif";
import { formGlyph, LETTER_FORMS, pickNeighbors } from "@/lib/arabic/letter-form";
import { tanwinWord, withTanwin } from "@/lib/arabic/tanwin";

// A1 · Lektion 1 is one book unit (صَبَاحُ الْخَيْر) with one entry per letter:
// Alif is src/data/a1/lesson-1.ts, every further letter (ب ت ث ج ح خ) is a
// LetterLessonSpec in src/data/a1/letters/<id>.ts, turned into the same five
// steps as Alif here: Wörter, Formen, Schreiben, Ergänzen, Hören. (The former
// step "Laute" is part of "Wörter": each word row starts with its sound.)
// Adding a letter = a spec file, its writing data (src/data/letters/<id>.ts),
// its pronunciation rules, its pictures and recordings – and one line in
// src/data/a1/index.ts.

/**
 * A picture: the alt text of the letter's own file (/images/a1/<letter>/<id>.svg),
 * or [src, alt] for a picture that already exists elsewhere (e.g. an A0 word).
 */
export type PictureSpec = string | [src: string, alt: string];

/** [id, vocalised Arabic, German, transliteration, picture]. */
export type LetterWordSpec = [id: string, arabic: string, german: string, transliteration: string, picture?: PictureSpec];

/**
 * A gap item of "Ergänzen" / "Hören": [book pattern ("_" per missing letter),
 * full vocalised word, id of the word it shows (a word of Schritt "Wörter" or
 * "Formen", for meaning and picture), German (when the id is not one of them),
 * picture (when the id is not one of them)].
 */
export type LetterGapSpec = [pattern: string, arabic: string, id: string, german?: string, picture?: PictureSpec];

/** [audio id, vocalised Arabic, German, which occurrence of the letter (default 0 = first, -1 = last)]. */
export type LetterFormsWordSpec = [id: string, arabic: string, german: string, occurrence?: number];

export type LetterLessonSpec = {
  letter: A1LessonLetter & {
    /** Latin consonant for the sound cards, e.g. "b" (→ "ba", "bi", "bu"). */
    latin: string;
  };
  /** Schritt 2, book order (each row right to left), by the vowel the words begin with. */
  words: { fatha: LetterWordSpec[]; kasra: LetterWordSpec[]; damma: LetterWordSpec[] };
  /** Schritt 3: the four book words by position, and the word of "النطق مع السكون". */
  forms: { start: LetterFormsWordSpec; middle: LetterFormsWordSpec; end: LetterFormsWordSpec; separate: LetterFormsWordSpec; sukun: LetterFormsWordSpec };
  /** Schritt "Schreiben". */
  writing: WritingLetterSet;
  /** Pictures of the Formen words (by audio id), when there is one. */
  formsPictures?: Record<string, PictureSpec>;
  /** "Ergänzen" (book تدريب ٢) and "Hören" (book تدريب ٣), in book order. */
  gaps: { fill: LetterGapSpec[]; listen: LetterGapSpec[] };
  /** German narration of Schritt 3 that differs from the standard texts (letterFormsTexts). */
  texts?: Record<string, string>;
};

const VOWELS = {
  fatha: { mark: "َ", latin: "a", name: { arabic: "فَتْحَة", german: "Fatha" } },
  kasra: { mark: "ِ", latin: "i", name: { arabic: "كَسْرَة", german: "Kasra" } },
  damma: { mark: "ُ", latin: "u", name: { arabic: "ضَمَّة", german: "Damma" } },
} as const;

type Vowel = keyof typeof VOWELS;

const HARAKAT = /[ً-ْٰ]/g;
const SUKUN = "\u0652";

/** The pronunciation target: the word without harakat (as for every word in vocabulary_conditions.json). */
export const unvocalised = (arabic: string) => arabic.replace(HARAKAT, "");

/**
 * A gap item of "Ergänzen" / "Hören", shown as it is spoken (with Tanwin): the
 * book pattern's last tile follows the word. When the book's gap IS the last
 * tile (بَابْ "_ا_", أَبْ "أَ_", ثُلُثْ "_لُ_"), the word stays pausal – the
 * answer is the letter with Sukun – and only the voice says the Tanwin.
 */
export function shownGap(pausal: string, pattern: string): { arabic: string; pattern: string; spoken: string } {
  const spoken = withTanwin(pausal);
  const parts = splitTiles(pattern);
  const tiles = splitTiles(pausal);
  const shown = splitTiles(spoken);
  if (spoken === pausal || parts.at(-1) === "_" || shown.length !== tiles.length) return { arabic: pausal, pattern, spoken };
  return { arabic: spoken, pattern: parts.at(-1) === tiles.at(-1) ? [...parts.slice(0, -1), shown.at(-1)!].join("") : pattern, spoken };
}

export const letterImageBase = (id: string) => `/images/a1/${id}`;
export const letterFormsAudioBase = (id: string) => `/audio/a1/${id}/formen`;

/**
 * "Ergänzen" / "Hören" of the letter lessons: one audio folder for the whole of
 * A1, so the SHARED narration clips (public/audio/a1/shared/) and the letter's
 * word recordings (public/audio/a1/<letter>/uebungen/<id>.wav) are both found.
 * A word without a recording is spoken by /api/tts.
 */
export const A1_AUDIO_BASE = "/audio/a1";
export const SHARED_GAPS_FOLDER = "shared";
const shared = (clip: string) => `${SHARED_GAPS_FOLDER}/${clip}`;

/** The shared clips of "Ergänzen" and "Hören" for all letter lessons (texts from the brief; caption = recording text). */
export const SHARED_GAPS_TEXT: Record<string, string> = {
  [shared("g_ok")]: "Richtig! Gut gemacht.",
  [shared("g_hint")]: "Fast! Hör noch einmal genau zu.",
  [shared("g5_intro")]: "Welcher Buchstabe fehlt? Schau auf das Wort. Zieh den richtigen Buchstaben in die Lücke.",
  [shared("g6_intro")]: "Hör gut zu. Welcher Buchstabe fehlt? Tippe auf den richtigen Buchstaben.",
  [shared("r_fatha")]: "Hier hörst du ein A. Darum steht eine Fatha.",
  [shared("r_kasra")]: "Hier hörst du ein I. Darum steht eine Kasra.",
  [shared("r_damma")]: "Hier hörst du ein U. Darum steht eine Damma.",
  [shared("r_sukun")]: "Hier hörst du keinen Vokal. Darum steht ein Sukun.",
  [shared("g5_done")]: "Geschafft! Du hast alle Lücken gefüllt. Schau dir deine Ergebnisse an.",
  [shared("g6_done")]: "Toll! Du hast alles richtig gehört.",
};

export const SHARED_GAPS_CLIPS = {
  ok: shared("g_ok"),
  hint: shared("g_hint"),
  reveal: { a: shared("r_fatha"), i: shared("r_kasra"), u: shared("r_damma"), sukun: shared("r_sukun") },
} as const;

/** A gap step of the letter lessons, the review and the phrase (shared clips, words in their letter's folder). */
export function sharedGapsContent(mode: GapsContent["mode"], choices: string[], items: GapItem[]): GapsContent {
  const step = mode === "picture" ? "g5" : "g6";
  return {
    audioBase: A1_AUDIO_BASE,
    mode,
    choices,
    narration: { intro: shared(`${step}_intro`), done: shared(`${step}_done`) },
    clips: { ...SHARED_GAPS_CLIPS, reveal: { ...SHARED_GAPS_CLIPS.reveal } },
    texts: SHARED_GAPS_TEXT,
    items,
  };
}

/** The picture of a word: its own file in /images/a1/<letter>/, or a shared one. */
export function picture(letterId: string, id: string, spec: PictureSpec | undefined): A1Word["image"] {
  if (!spec) return undefined;
  return typeof spec === "string" ? { src: `${letterImageBase(letterId)}/${id}.svg`, alt: spec } : { src: spec[0], alt: spec[1] };
}

/**
 * The German narration of a letter's Formen step (one text per clip; caption
 * and recording script). `meanings` are the German meanings of the four book
 * words in Zuschauen order.
 */
export function letterFormsTexts(name: string, meanings: [start: string, middle: string, end: string, separate: string]): Record<string, string> {
  return {
    f_intro: `Heute lernst du die Formen vom ${name}. Das ${name} sieht nicht immer gleich aus. Hör gut zu und mach mit!`,
    e_intro: "Zuerst schauen wir vier Wörter an. Dann übst du selbst. Schau genau zu.",
    e_start_a: `Das erste Wort bedeutet: ${meanings[0]}. Hier sind seine Buchstaben. Wir lesen von rechts nach links. Jetzt setzen wir sie zusammen.`,
    e_start_b: `Das ${name} steht am Anfang. Vor ihm steht nichts. Aber das ${name} hat eine Hand. Es hält den nächsten Buchstaben fest.`,
    e_middle_a: `Das zweite Wort bedeutet: ${meanings[1]}. Hier sind seine Buchstaben. Jetzt setzen wir sie zusammen.`,
    e_middle_b: `Das ${name} steht in der Mitte. Der Nachbar davor hält das ${name} fest. Und das ${name} hält den nächsten Buchstaben fest.`,
    e_end_a: `Das dritte Wort bedeutet: ${meanings[2]}. Hier sind seine Buchstaben. Jetzt setzen wir sie zusammen.`,
    e_end_b: `Das ${name} steht am Ende. Der Nachbar davor hält das ${name} fest. Nach dem ${name} kommt nichts mehr.`,
    e_separate_a: `Das letzte Wort bedeutet: ${meanings[3]}. Hier sind seine Buchstaben. Jetzt setzen wir sie zusammen.`,
    e_separate_b: `Auch hier steht ein Nachbar vor dem ${name}. Aber er hat keine Hand. Und nach dem ${name} kommt nichts mehr. Darum steht das ${name} allein.`,
    e_outro: `Hast du es gesehen? Das ${name} hat immer eine Hand für den nächsten Buchstaben. Und der Nachbar davor hält es fest, wenn er eine Hand hat. Jetzt bist du dran!`,
    b_intro: "Baue das Wort! Leg die Buchstaben von rechts nach links in die Felder.",
    b_wrong: "Hmm, der passt hier nicht. Versuch einen anderen.",
    b_all: "Super! Du hast alle vier Wörter gebaut.",
    b_done_start: `Richtig! Das ${name} steht am Anfang. Es hält den nächsten Buchstaben fest.`,
    b_done_middle: `Richtig! Das ${name} steht in der Mitte. Es wird festgehalten und hält selbst fest.`,
    b_done_end: `Richtig! Das ${name} steht am Ende. Der Nachbar davor hält es fest.`,
    b_done_separate: `Richtig! Das ${name} steht allein. Der Nachbar davor hat keine Hand.`,
    n_intro: `Wer hält fest? Leg einen Nachbarn rechts neben das ${name}. Dort steht der Buchstabe davor. Oder leg ihn links daneben. Dort steht der Buchstabe danach.`,
    n_hold: `Der Nachbar hat eine Hand. Er hält das ${name} fest.`,
    n_nohold: `Dieser Nachbar hat keine Hand. Er hält das ${name} nicht fest.`,
    n_next: `Das ${name} hat eine Hand. Es hält den nächsten Buchstaben fest.`,
    n_rule: `Das ${name} hat eine Hand. Es hält immer den nächsten Buchstaben fest. Und der Nachbar davor hält das ${name} fest, wenn er eine Hand hat.`,
    s_intro: `Wo steht das ${name}? Am Anfang, in der Mitte, am Ende oder allein? Leg jedes Wort in den richtigen Korb.`,
    s_ok_start: `Richtig! Das ${name} steht am Anfang.`,
    s_ok_middle: `Richtig! Das ${name} steht in der Mitte.`,
    s_ok_end: `Richtig! Das ${name} steht am Ende.`,
    s_ok_separate: `Richtig! Das ${name} steht allein.`,
    s_hint: `Fast! Schau genau: Wer hält das ${name} fest? Und hält das ${name} einen Buchstaben fest?`,
    s_replay: "Schau noch einmal genau hin. Dann versuch es noch einmal.",
    s_done: `Toll! Du kennst jetzt alle Formen vom ${name}.`,
  };
}

export function letterLesson(spec: LetterLessonSpec): A1Lesson {
  const { letter } = spec;
  const sound = (vowel: Vowel): SoundItem => {
    const glyph = letter.glyph + VOWELS[vowel].mark;
    const id = `${letter.id}-${vowel}`;
    return { id, glyph, transliteration: letter.latin + VOWELS[vowel].latin, vowelName: VOWELS[vowel].name, exercise: { id, target: glyph, modelText: glyph } };
  };
  // Shown and spoken with Tanwin; the target is the pausal word without harakat.
  const word = ([id, pausal, german, written, pic]: LetterWordSpec): A1Word => {
    const { arabic, spoken, transliteration } = tanwinWord(pausal, written);
    return {
      id,
      arabic,
      german,
      transliteration,
      ...(pic ? { image: picture(letter.id, id, pic) } : {}),
      exercise: { id, target: unvocalised(pausal), modelText: spoken },
    };
  };
  const allWords = [...spec.words.fatha, ...spec.words.kasra, ...spec.words.damma];
  const wordPicture = (id: string) => {
    const found = allWords.find((w) => w[0] === id);
    return found?.[4] ? picture(letter.id, id, found[4]) : undefined;
  };
  const formsWord = ([id, arabic, german, occurrence]: LetterFormsWordSpec): FormsWord => {
    const image = spec.formsPictures?.[id] ? picture(letter.id, id, spec.formsPictures[id]) : wordPicture(id);
    return {
      id,
      arabic,
      german,
      audio: id,
      ...(image ? { image } : {}),
      ...(occurrence !== undefined ? { occurrence } : {}),
    };
  };

  const vowels: Vowel[] = ["fatha", "kasra", "damma"];
  const sounds = vowels.map(sound);
  const book = [spec.forms.start, spec.forms.middle, spec.forms.end, spec.forms.separate].map(formsWord);
  const sukun = formsWord(spec.forms.sukun);
  const shapes = LETTER_FORMS.map((form) => formGlyph(letter.glyph, form)).join(" · ");
  const vowelled = sounds.map((s) => s.glyph).join(" · ");

  const formsWords = [spec.forms.start, spec.forms.middle, spec.forms.end, spec.forms.separate, spec.forms.sukun];
  const gapItem =
    (withPicture: boolean) =>
    ([pattern, arabic, id, german, pic]: LetterGapSpec): GapItem => {
      const meaning = german ?? allWords.find((w) => w[0] === id)?.[2] ?? formsWords.find((w) => w[0] === id)?.[2];
      if (!meaning) throw new Error(`${letter.id}: gap item "${arabic}" needs a German meaning`);
      const image = withPicture ? (pic ? picture(letter.id, id, pic) : (wordPicture(id) ?? (spec.formsPictures?.[id] ? picture(letter.id, id, spec.formsPictures[id]) : undefined))) : undefined;
      return { id, ...shownGap(arabic, pattern), german: meaning, audio: `${letter.id}/uebungen/${id}`, ...(image ? { image } : {}) };
    };
  const gapChoices = [...sounds.map((s) => s.glyph), letter.glyph + SUKUN];

  return {
    slug: letter.id,
    kind: "letter",
    label: letter.glyph,
    labelGerman: letter.name,
    letter: { id: letter.id, glyph: letter.glyph, name: letter.name },
    steps: [
      {
        kind: "sound-words",
        slug: "step-1",
        title: `Wörter mit ${vowelled}`,
        navLabel: "Wörter",
        groups: vowels.map((vowel, i) => ({ sound: sounds[i]!, words: spec.words[vowel].map(word) })),
      },
      {
        kind: "forms",
        slug: "step-2",
        title: `Formen: ${shapes}`,
        navLabel: "Formen",
        forms: {
          audioBase: letterFormsAudioBase(letter.id),
          explain: book,
          build: book,
          // Letters of the four book words and the sukun word (computed, see pickNeighbors).
          neighbors: pickNeighbors([...book, sukun].map((w) => w.arabic), letter.glyph),
          sort: [...book, sukun],
          letter: {
            glyph: letter.glyph,
            name: letter.name,
            texts: { ...letterFormsTexts(letter.name, [book[0]!.german, book[1]!.german, book[2]!.german, book[3]!.german]), ...spec.texts },
          },
        },
      },
      { kind: "writing", slug: "step-3", title: `Schreiben: ${shapes}`, navLabel: "Schreiben", letterSet: spec.writing },
      {
        kind: "gaps",
        slug: "step-4",
        title: `Ergänzen: ${gapChoices.join(" · ")}`,
        navLabel: "Ergänzen",
        gaps: sharedGapsContent("picture", gapChoices, spec.gaps.fill.map(gapItem(true))),
      },
      {
        kind: "gaps",
        slug: "step-5",
        title: `Hören: ${gapChoices.join(" · ")}`,
        navLabel: "Hören",
        gaps: sharedGapsContent("listen", gapChoices, spec.gaps.listen.map(gapItem(false))),
      },
    ],
  };
}
