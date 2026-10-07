// Content model for Alif. Lessons are plain data: adding Lesson 2 means adding
// one data file and registering it in src/data/curriculum.ts – no component
// or route changes.

/** Something the student can listen to and record. */
export type PronunciationExercise = {
  /** Stable id, unique within a lesson (used for progress tracking). */
  id: string;
  /**
   * Text sent to Azure as the pronunciation reference and used as the key
   * into the condition rules (letter_conditions.json / vocabulary_conditions.json).
   * Unvocalised, exactly like the original system.
   */
  target: string;
  /** Vocalised text spoken by text-to-speech for the "Anhören" button. */
  modelText: string;
};

export type LessonLetter = {
  /** The letter exactly as shown, e.g. "أَ". */
  glyph: string;
  /** German/Latin name of the letter, e.g. "Alif". */
  name: string;
  /** Arabic name of the letter, vocalised, e.g. "أَلِف". */
  nameArabic: string;
  /** How the sound is written in Latin script, e.g. "a". */
  transliteration: string;
  /** Short German explanation of the sound. */
  soundHint: string;
  /** Letter forms (isolated, initial, medial, final) for reference. */
  forms?: { label: string; glyph: string }[];
  exercise: PronunciationExercise;
};

export type VocabularyItem = {
  id: string;
  /** Vocalised Arabic word as displayed. */
  arabic: string;
  /** German translation incl. article, e.g. "der Löwe". */
  german: string;
  /** Latin/Franco transliteration, e.g. "asad". */
  transliteration: string;
  image: { src: string; alt: string };
  exercise: PronunciationExercise;
};

/** Optional video shown on /<level>/<lesson>/intro before the lesson starts. */
export type LessonIntroVideo = {
  /** Under public/, e.g. "/videos/a1/lesson-1/de.mp4". */
  src: string;
  poster: string;
  /** Chapter marks; `start` in seconds. */
  chapters?: { start: number; title: string }[];
};

export type Lesson = {
  /** URL segment, e.g. "lesson-1". */
  slug: string;
  number: number;
  title: string;
  subtitle: string;
  /** Estimated duration in minutes, shown in the lesson list. */
  minutes: number;
  letter: LessonLetter;
  vocabulary: VocabularyItem[];
  introVideo?: LessonIntroVideo;
};

export type Level = {
  /** URL path without the leading slash, e.g. "a0/words"; also the progress key prefix. */
  slug: string;
  code: string;
  title: string;
  description: string;
  lessons: Lesson[];
};

// ---------------------------------------------------------------------------
// A1 (new curriculum, 2026): a lesson is a short sequence of steps. A step
// either practises sounds one after another, or shows each sound with the
// words that begin with it. Words reuse VocabularyItem (image, Arabic,
// German, transliteration, pronunciation exercise).

/** A sound to listen to and pronounce, e.g. Alif with Fatha "أَ". */
export type SoundItem = {
  id: string;
  /** As displayed, vocalised, e.g. "أَ". */
  glyph: string;
  /** Latin sound, e.g. "a". */
  transliteration: string;
  /** Name of the vowel sign, e.g. { arabic: "فَتْحَة", german: "Fatha" }. */
  vowelName: { arabic: string; german: string };
  exercise: PronunciationExercise;
};

/**
 * A word of the "Formen" activities. Its tiles, where the Hamza-Alif stands and
 * whether it is held are derived from the Arabic text (src/lib/arabic/hamza-alif.ts).
 */
export type FormsWord = {
  id: string;
  /** Vocalised, e.g. "أَنَا". */
  arabic: string;
  german: string;
  /** Recorded word: file name without extension in the step's audio folder, e.g. "ana". */
  audio: string;
  image?: { src: string; alt: string };
};

export type FormsContent = {
  /** Folder under public/ with the narration and word recordings (.wav). */
  audioBase: string;
  /** "Zuschauen": the words explained one per scene, in this order (no exercise). */
  explain: FormsWord[];
  /** Activity 1 "Baue das Wort", in this order. */
  build: FormsWord[];
  /** Activity 2 "Wer hält fest?": isolated neighbour letters (shown shuffled). */
  neighbors: string[];
  /** Activity 3 "Mit Hand oder ohne?" (shown shuffled). */
  sort: FormsWord[];
};

type A1StepBase = {
  /** URL segment, e.g. "step-1". */
  slug: string;
  /** Shown in the step pills, e.g. "Formen: أ · ـأ". */
  title: string;
  /** Short name for the back / next buttons, e.g. "Formen" (default: title). */
  navLabel?: string;
};

export type A1Step =
  | (A1StepBase & {
      kind: "sounds";
      /** Practised one after another. */
      sounds: SoundItem[];
    })
  | (A1StepBase & {
      kind: "sound-words";
      /** One group per sound: the sound, then the words that begin with it. */
      groups: { sound: SoundItem; words: VocabularyItem[] }[];
    })
  | (A1StepBase & {
      kind: "forms";
      forms: FormsContent;
    })
  | (A1StepBase & {
      kind: "writing";
      letterSet: WritingLetterSet;
    })
  | (A1StepBase & {
      kind: "gaps";
      gaps: GapsContent;
    });

// ---------------------------------------------------------------------------
// "Fill the gap" (Schritt 5 "Ergänzen", 6 "Hören"): each item is the FULL
// vocalised word; gap, answer and rest are computed (src/lib/arabic/gap.ts).

export type GapItem = {
  id: string;
  /** Full vocalised word, e.g. "أَب". */
  arabic: string;
  german: string;
  image?: { src: string; alt: string };
  /** Recorded word: file name without extension in the step's audio folder. */
  audio?: string;
};

export type GapsContent = {
  /** Folder under public/ with the narration and word recordings (.wav). */
  audioBase: string;
  /** "picture": picture + "Anhören" (Ergänzen); "listen": the word plays first, no picture (Hören). */
  mode: "picture" | "listen";
  /** Answer tiles, in book order. */
  choices: string[];
  /** In book order (not shuffled). */
  items: GapItem[];
  /** Narration keys of this step. */
  narration: { intro: string; done: string };
};

// ---------------------------------------------------------------------------
// Handwriting ("Schreiben"): letter forms to trace. Coordinates are in the
// writing box of src/lib/writing/trace.ts (240 × 320, baseline y = 262).

export type WritingStroke = {
  /** SVG path of the stroke, in writing direction. */
  d: string;
  /** Guide arrow along the part a → b of the stroke (0–1 of its length), `off` px to the side. */
  arrow: { a: number; b: number; off: number };
  /** Thinner pen, e.g. for the Hamza. */
  thin?: boolean;
};

export type WritingForm = {
  id: string;
  /** As printed, e.g. "ـأ". */
  glyph: string;
  /** German, used in the instructions: "Fahr {name} nach." */
  name: string;
  /** In writing order. */
  strokes: WritingStroke[];
};

/** One letter's forms in workbook order (right to left). */
export type WritingLetterSet = {
  id: string;
  forms: WritingForm[];
};

export type A1Lesson = {
  /** URL segment, e.g. "lesson-1". */
  slug: string;
  number: number;
  /** Arabic lesson title, e.g. "صَبَاحُ الْخَيْر". */
  title: string;
  /** German translation of the title. */
  titleGerman: string;
  steps: A1Step[];
};
