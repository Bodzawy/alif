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
  /**
   * "Anhören" in a dialogue speaker's voice: the recording made for `line` (a dialogue line or this
   * item, see src/lib/tts/dialogue-manifest.json) – or, without one, Azure in that voice.
   */
  voice?: DialogueVoice;
  line?: string;
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

/**
 * A word of A1 · Schritt 2. Like VocabularyItem, but the picture is optional:
 * without one the card shows the word large with its German meaning.
 */
export type A1Word = Omit<VocabularyItem, "image"> & { image?: VocabularyItem["image"] };

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
  /** Letter lessons: which occurrence of the letter is meant when it appears twice (0 = first, -1 = last; default 0). */
  occurrence?: number;
};

/**
 * "Formen" of a letter that connects forward (ب ت ث ج ح خ). Without it the
 * step is the Alif lesson's (أ / ـأ).
 */
export type FormsLetter = {
  /** The bare letter, e.g. "ب". */
  glyph: string;
  /** German name, e.g. "Ba" ("das Ba"). */
  name: string;
  /** German text of every narration clip of the step: caption and recording script (file name → text). */
  texts: Record<string, string>;
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
  /** Set for a letter lesson (four baskets, Hands on both sides); absent for the Alif lesson. */
  letter?: FormsLetter;
};

type A1StepBase = {
  /** URL segment, e.g. "step-1". */
  slug: string;
  /** Shown in the step pills, e.g. "Formen: أ · ـأ". */
  title: string;
  /** Short name for the back / next buttons, e.g. "Formen" (default: title). */
  navLabel?: string;
  /** The textbook's instruction (Arabic, as printed) and what it asks in German, shown above the step. */
  instruction?: { arabic?: string; german: string; note?: string };
};

export type A1Step =
  | (A1StepBase & {
      kind: "sound-words";
      /** One group per sound: the sound, then the words that begin with it. */
      groups: { sound: SoundItem; words: A1Word[] }[];
    })
  | (A1StepBase & {
      kind: "words";
      /** Picture words to hear and say, in book order (no sound row), e.g. the words with Shadda. */
      groups: WordGroup[];
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
    })
  | (A1StepBase & {
      kind: "dialogue";
      /** listen: the whole dialogue (both voices); repeat: every line, one after another; roleplay: the learner speaks one role. */
      mode: "listen" | "repeat" | "roleplay";
      dialogue: Dialogue;
    })
  | (A1StepBase & {
      kind: "phrases";
      /** Expressions to listen to and practise, in book order (e.g. a greeting and its answer). */
      groups: PhraseGroup[];
    })
  | (A1StepBase & {
      kind: "letter-find";
      find: LetterFind;
    })
  | (A1StepBase & {
      kind: "positions";
      positions: LetterPositions;
    })
  | (A1StepBase & {
      kind: "compare";
      /** Listen and compare (e.g. long and short vowels), section by section in book order. */
      sections: CompareSection[];
    })
  | (A1StepBase & {
      kind: "match";
      match: MatchContent;
    })
  | (A1StepBase & {
      kind: "word-pick";
      pick: WordPick;
    })
  | (A1StepBase & {
      kind: "spell";
      /** "اكتبها بحروف منفصلة": listen, read and write each word as separate letters. */
      words: SpellWord[];
    })
  | (A1StepBase & {
      kind: "quiz";
      items: QuizItem[];
    })
  | (A1StepBase & {
      kind: "cloze";
      items: ClozeItem[];
    })
  | (A1StepBase & {
      kind: "order";
      order: OrderContent;
    })
  | (A1StepBase & {
      kind: "table";
      tables: TableBlock[];
      /** A short check over the tables (German questions, Arabic answers); the step is done when every answer is right. */
      quiz: TableQuiz[];
    })
;

// ---------------------------------------------------------------------------
// "positions": the book's "كتابة الحرف" – where the letter stands in a word,
// with one example word each – and "النطق مع السكون". The learner finds the
// letter in every example word.

export type PositionItem = {
  id: string;
  /** The book's label, e.g. "في أول الكلمة". */
  label: string;
  /** German, e.g. "am Wortanfang". */
  labelGerman: string;
  /** The printed shape, e.g. "د" or "ـد". */
  shape: string;
  /** Vocalised example word. */
  word: string;
  german: string;
  /** Which occurrence of the letter is meant (0 = first, -1 = last; default 0). */
  occurrence?: number;
};

export type LetterPositions = {
  /** The bare letter, e.g. "د". */
  letter: string;
  /** German name, e.g. "Dal". */
  name: string;
  /** The book's note (e.g. "يُلَاحَظُ الْحَرْفُ لَا يَقْبَلُ الِاتِّصَالَ إِلَّا مِنَ الْيَمِينِ") and its German meaning. */
  rule?: { arabic: string; german: string };
  items: PositionItem[];
  /** "النطق مع السكون": the letter with sukun and the book's word (and further words, when the book gives more). */
  sukun: { glyph: string; word: string; german: string; occurrence?: number; more?: Array<{ word: string; german: string; occurrence?: number }> };
};

// ---------------------------------------------------------------------------
// "compare": listen and notice the difference (long and short vowels).

export type CompareItem = {
  id: string;
  /** Vocalised Arabic as shown and spoken. */
  arabic: string;
  transliteration?: string;
  german?: string;
  /** The book's label of this example, e.g. "يَاءُ الْمَدِّ". */
  label?: string;
  /** What the item shows: a long vowel (Dehnungsbuchstabe), a short vowel, a Hamza, a consonant. */
  tag?: "long" | "short" | "hamza" | "consonant";
};

export type CompareSection = {
  id: string;
  /** The book's heading, e.g. "اِسْمَعْ وَلَاحِظِ الْفَرْقَ فِي الصَّوْتِ". */
  titleArabic?: string;
  /** German heading. */
  title: string;
  /** German explanation (may contain Arabic). */
  note?: string;
  /** The book's pictures of this section. */
  pictures?: Array<{ src: string; alt: string; label: string }>;
  /** Rows; a row of two items is a pair (long – short). */
  rows: CompareItem[][];
};

// ---------------------------------------------------------------------------
// "match": connect each prompt with its answer (pictures, or the joined word).

export type MatchOption = {
  id: string;
  /** Label as in the book, e.g. "أ" for picture (أ). */
  label: string;
  image?: { src: string; alt: string };
  /** An Arabic word as the option (instead of a picture). */
  arabic?: string;
};

export type MatchPrompt = {
  id: string;
  /** What the learner reads: a word, or separated letters ("ت – و – ت"). */
  arabic: string;
  /** The right option. */
  answer: string;
  /** Further options that are just as right (e.g. two identical words in the book's column). */
  accept?: string[];
  /** The book's model answer: shown solved from the start. */
  example?: boolean;
  /** Shown once matched, e.g. the joined word "تُوت" (with its German meaning). */
  result?: { arabic: string; german: string };
};

export type MatchContent = {
  /** German heading of the prompt column and the option column. */
  promptTitle: string;
  optionTitle: string;
  prompts: MatchPrompt[];
  options: MatchOption[];
};

// ---------------------------------------------------------------------------
// "word-pick": tap whole words, e.g. "underline the words WITHOUT a long vowel".

export type WordPick = {
  /** Which words count: those with a Dehnungsbuchstabe (ا و ي), or those without one. */
  find: "madd" | "no-madd";
  /** Words to read (each one tappable and listenable) … */
  words?: Array<{ id: string; arabic: string; german?: string }>;
  /** … or the lines of these dialogues. */
  dialogues?: Dialogue[];
  /** German goal, e.g. "Unterstreiche die Wörter ohne Dehnungsbuchstaben." */
  goal: string;
};

// ---------------------------------------------------------------------------
// "table": the book's grammar tables ("لاحظ القواعد", "تذكر").

export type TableCell = {
  /** Vocalised Arabic as shown; spoken by "Anhören" unless `listen` is false. */
  arabic: string;
  german?: string;
  transliteration?: string;
  /** Masculine / feminine form. */
  gender?: "m" | "f";
  /** A placeholder (e.g. "اسْمِي …") is not spoken. */
  listen?: boolean;
};

export type TableBlock = {
  id: string;
  /** The book's heading, e.g. "لِلتَّحِيَّةِ فِي الْمَسَاءِ". */
  titleArabic: string;
  title: string;
  /** Column headings (book order, right to left). */
  columns: Array<{ arabic: string; german: string }>;
  rows: TableCell[][];
  note?: string;
};

export type TableQuiz = {
  id: string;
  prompt: string;
  options: string[];
  answer: number;
};


// ---------------------------------------------------------------------------
// "phrases": the expressions of a textbook table, each with listen + practise.

export type PhraseItem = {
  id: string;
  /** Vocalised Arabic as shown. */
  arabic: string;
  transliteration: string;
  german: string;
  literal?: string;
  /** Who says it / to whom, e.g. "Antwort" or "zu einem Mann". */
  tag?: string;
  /** Grammatical gender of the person addressed (masculine / feminine form). */
  gender?: "m" | "f";
  /** Evaluated like every other A1 exercise (target = unvocalised, without punctuation). */
  exercise: PronunciationExercise;
};

export type PhraseGroup = {
  id: string;
  /** German heading, e.g. "Wie geht es dir?" */
  title: string;
  /** Arabic heading as in the book, e.g. "التَّحِيَّةُ فِي الصَّبَاحِ". */
  titleArabic?: string;
  /** A short German explanation below the expressions. */
  note?: string;
  items: PhraseItem[];
};

// ---------------------------------------------------------------------------
// "letter-find": read a dialogue and underline every occurrence of one letter.

export type LetterFind = {
  /** The letter as named in the book, e.g. "ا". */
  letter: string;
  /** German name, e.g. "Alif". */
  name: string;
  /** Characters that count as this letter, e.g. ا أ إ آ for the Alif. */
  accepts: string[];
  dialogue: Dialogue;
  /** Further dialogues of the same exercise (e.g. both conversations of "مَسَاءُ الْخَيْر"). */
  more?: Dialogue[];
  /** "يكرر التمرين على باقي الحروف": optional further letters to look for once the book's letters are found. */
  extra?: Array<{ letter: string; name: string; accepts: string[] }>;
};

// ---------------------------------------------------------------------------
// "Fill the gap" (Schritt 5 "Ergänzen", 6 "Hören"): each item is the FULL
// vocalised word; gap, answer and rest are computed (src/lib/arabic/gap.ts).

export type GapItem = {
  id: string;
  /** Full vocalised word, e.g. "أَب". */
  arabic: string;
  german: string;
  image?: { src: string; alt: string };
  /** Recorded word: file name without extension in the step's audio folder. Without a recording the word is spoken by /api/tts. */
  audio?: string;
  /**
   * The book pattern: "_" for each missing letter, e.g. "_ا_" for بَابْ. The
   * answers are the tiles of `arabic` at the gaps (src/lib/arabic/gap.ts).
   * Without a pattern the gap is the word's Hamza-Alif (the Alif lesson).
   */
  pattern?: string;
  /** Answer tiles of this item (default: the step's `choices`), e.g. in the review. */
  choices?: string[];
  /** Gaps may be letters without a vowel sign: a Dehnungsbuchstabe (ا و ي) or an unvocalised word. */
  bare?: boolean;
  /** Answer tiles per gap (right to left), when the gaps need different tiles (e.g. a dictation). */
  gapChoices?: string[][];
  /** What /api/tts speaks when `arabic` is not vocalised (e.g. "Ordne die Buchstaben": تاج → تَاج). */
  spoken?: string;
  /** Arabic shown above the word, as printed in the book (e.g. the letters "س ب ب و ر ة" to be written as one word). */
  hint?: string;
};

/** Narration clip names (in the step's audio folder) for answers and explanations. */
export type GapsClips = {
  ok: string;
  hint: string;
  /** Explanation of the right answer, by its vowel sign ("none": a letter without a sign, e.g. a Dehnungsbuchstabe). */
  reveal: { a: string; i: string; u: string; sukun: string; none?: string };
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
  /** Answer and explanation clips (default: the Alif lesson's g_ok, g_hint, g_reveal_*). */
  clips?: GapsClips;
  /** Captions (= recording texts) of the clips, by clip name (default: the Alif lesson's GAPS_TEXT). */
  texts?: Record<string, string>;
  /** "Hör zu, sprich nach und schreib": after the word, the learner is asked to say it aloud (not evaluated). */
  repeat?: boolean;
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
  /**
   * A dot: `d` is a small circle around the dot's centre. A tap or a short
   * scribble close to the centre counts (TRACE_TOL.dot); the arrow is not drawn.
   */
  dot?: boolean;
  /** For a stroke after the first: what comes next, completing "Gut! Jetzt {label}.", e.g. "den Punkt unten". */
  label?: string;
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
  /** Hint when a later stroke is traced first (default: the Alif's "Zuerst das Alif, dann die Hamza."). */
  orderHint?: string;
};

/**
 * One entry of an A1 lesson (unit): a letter (أ ب ت ث ج ح خ), the review or
 * the lesson's phrase. Its steps live at /a1/<unit>/<entry>/<step>.
 */
export type A1Lesson = {
  /** URL segment, e.g. "alif", "ba", "review". */
  slug: string;
  kind: "letter" | "review" | "phrase" | "topic";
  /** As shown in the lesson's contents, e.g. "أ", "مراجعة", "صَبَاحُ الْخَيْر". */
  label: string;
  /** German name, e.g. "Alif", "Wiederholung", "Guten Morgen". */
  labelGerman: string;
  /** The letter of a letter entry. */
  letter?: A1LessonLetter;
  steps: A1Step[];
};

// ---------------------------------------------------------------------------
// A dialogue (e.g. the greeting of Lektion 1): two speakers, each with their
// own voice, and the lines in order. One object serves "listen", "repeat" and
// "roleplay".

/** The TTS voices a dialogue may use (mapped to Azure voices in src/lib/tts/ssml.ts). */
export type DialogueVoice = "male-1" | "male-2" | "female-1" | "female-2";

export type DialogueSpeaker = {
  id: string;
  /** Shown above the speaker's lines, e.g. "Karim". */
  name: string;
  voice: DialogueVoice;
  avatar: { src: string; alt: string };
};

export type DialogueLine = {
  id: string;
  /** DialogueSpeaker.id */
  speaker: string;
  /** Vocalised Arabic as shown. */
  arabic: string;
  transliteration: string;
  german: string;
  /** Literal meaning, when it helps (e.g. "Morgen des Lichts"). */
  literal?: string;
  /** Evaluated like every other A1 exercise (target = unvocalised, without punctuation). */
  exercise: PronunciationExercise;
};

/**
 * A role of the role-play that is spoken by several speakers, e.g. "the
 * people who answer" in a conversation where one person asks several groups.
 * Without roles, every speaker is a role of its own.
 */
export type DialogueRole = {
  id: string;
  /** German, e.g. "Die Antwortenden". */
  name: string;
  /** DialogueSpeaker ids. */
  speakers: string[];
  avatar: { src: string; alt: string };
};

export type Dialogue = {
  id: string;
  /** One German sentence above the conversation, e.g. "Zwei Männer begrüßen sich." */
  intro: string;
  /** Two or more speakers; the first one is shown on the right. */
  speakers: [DialogueSpeaker, DialogueSpeaker, ...DialogueSpeaker[]];
  /** Role-play roles (default: one per speaker). */
  roles?: DialogueRole[];
  lines: DialogueLine[];
  /** A comprehension question after listening (German). */
  question?: { prompt: string; options: string[]; answer: number };
};

/** An A1 lesson of the book ("الدرس الأول – صَبَاحُ الْخَيْر"): its entries in book order. */
export type A1Unit = {
  /** URL segment, e.g. "lesson-1". */
  slug: string;
  number: number;
  /** The book's own label when it is not "الدرس …", e.g. "الوحدة الثانية – تقديم (١)". */
  bookLabel?: string;
  /** The section of /a1 the lesson belongs to: the book unit (two lessons each), or the beginning. */
  group: A1UnitGroup;
  /** Arabic lesson title, e.g. "صَبَاحُ الْخَيْر". */
  title: string;
  /** German translation of the title. */
  titleGerman: string;
  lessons: A1Lesson[];
};

/** A section of the A1 overview: a unit of the book (e.g. "الْوَحْدَةُ الثَّانِيَةُ" – "Unit 2 · Nach Personen fragen"). */
export type A1UnitGroup = {
  id: string;
  /** Arabic name, e.g. "الْوَحْدَةُ الثَّانِيَةُ". */
  arabic: string;
  /** German name, e.g. "Unit 2 · Nach Personen fragen". */
  german: string;
};

export type A1LessonLetter = {
  /** Same as the lesson slug, e.g. "ba". */
  id: string;
  /** The bare letter, e.g. "ب". */
  glyph: string;
  /** German name, e.g. "Ba". */
  name: string;
};

// ---------------------------------------------------------------------------
// "spell" (Unit 2 · تدريب ١٠): a word as separate letters, e.g. جَرَس → ج – ر – س.

export type SpellWord = {
  id: string;
  /** Vocalised as spoken and shown, e.g. "جَرَس". */
  arabic: string;
  german: string;
};

// ---------------------------------------------------------------------------
// "quiz": a word to listen to (and read), with one or more questions about it.

export type QuizItem = {
  id: string;
  /** Vocalised Arabic, spoken by "Anhören". */
  arabic: string;
  german?: string;
  /** Show the word (false: listen only, e.g. "Hör zu und …"). */
  show?: boolean;
  /** What "Anhören" speaks when it differs from `arabic` (e.g. a phone number read digit by digit). */
  spoken?: string;
  /** A picture above the questions (e.g. a clock). */
  image?: { src: string; alt: string };
  /** Options may be pictures: an option starting with "/images/" is shown as an image. */
  questions: Array<{ prompt: string; options: string[]; answer: number }>;
};

// ---------------------------------------------------------------------------
// "cloze": lines of a short exchange with gaps to fill by choosing a tile.

export type ClozePart = string | { options: string[]; /** Every option that is right (several when the book leaves the choice free, e.g. a name). */ accept: string[] };

export type ClozeItem = {
  id: string;
  /** The book's picture of the situation (optional). */
  image?: { src: string; alt: string };
  /** German hint, e.g. "Ein Mann fragt drei Frauen." */
  hint?: string;
  /** The lines (speaker label "أ" / "ب"), each a sequence of text and gaps. */
  lines: Array<{ label: string; parts: ClozePart[] }>;
};

// ---------------------------------------------------------------------------
// "order": the book's "اقرأ ورتب الحوار" – lines printed out of order, to be
// put in the order of the conversation.

export type OrderContent = {
  /** The lines as the book prints them (its numbering). */
  items: Array<{ id: string; arabic: string; german: string; transliteration?: string }>;
  /** Every right order (ids); several when the book allows more than one. */
  solutions: string[][];
};

/** A group of picture words of the step "words" (optional heading as in the book). */
export type WordGroup = { id: string; title?: string; titleArabic?: string; words: A1Word[] };
