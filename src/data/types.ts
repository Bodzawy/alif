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
  /** Under public/, e.g. "/videos/alif-intro/de.mp4". */
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
  /** URL segment, e.g. "a0". */
  slug: string;
  code: string;
  title: string;
  description: string;
  lessons: Lesson[];
};
