import type { HamzaPosition, HamzaReason } from "@/lib/arabic/hamza-alif";

// Labels and recorded narration of A1 · Schritt 3 "Formen". File names refer
// to FormsContent.audioBase (without ".wav").

/**
 * One letter (with its harakat) as a separate tile – its own box, so the browser
 * never joins it to the next one. Used by "Zuschauen" and "Mit Hand oder ohne?".
 */
export const LETTER_TILE = "flex h-20 min-w-16 items-center justify-center rounded-2xl border-2 border-primary/30 bg-primary-soft px-2 font-arabic text-5xl font-bold sm:h-24 sm:min-w-20";

/** The lesson book's labels for where the Hamza-Alif stands. */
export const POSITION_LABEL: Record<HamzaPosition, string> = {
  start: "في أول الكلمة",
  middle: "في المنتصف",
  end: "في آخر الكلمة",
  separate: "منفصلة",
};

/** German meaning of the book labels. */
export const POSITION_LABEL_GERMAN: Record<HamzaPosition, string> = {
  start: "am Wortanfang",
  middle: "in der Mitte",
  end: "am Wortende",
  separate: "getrennt",
};

export const RULE_TEXT = "Das Alif hält sich nie am nächsten Buchstaben fest. Aber der Nachbar davor hält es fest, wenn er eine Hand hat.";

/** Activity 2 shows the rule after this many neighbours of each kind (or after all of them). */
export const RULE_REVEAL = { hold: 3, nohold: 1 } as const;

export const NARRATION = {
  pageIntro: "f_intro",
  explain: {
    intro: "e_intro",
    outro: "e_outro",
    /** "_a": the letters of the word; "_b": why the Hamza looks the way it does. */
    letters: (position: HamzaPosition) => `e_${position}_a`,
    why: (position: HamzaPosition) => `e_${position}_b`,
  },
  build: { intro: "b_intro", wrong: "b_wrong", all: "b_all", done: (position: HamzaPosition) => `b_done_${position}` },
  neighbors: { intro: "n_intro", hold: "n_hold", nohold: "n_nohold", left: "n_left", rule: "n_rule" },
  sort: {
    intro: "s_intro",
    ok: (reason: HamzaReason) => `s_ok_${reason}`,
    hint: "s_hint",
    hintStart: "s_hint_start",
    replay: "s_replay",
    done: "s_done",
  },
} as const;

const POSITIONS = ["start", "middle", "end", "separate"] as const;

/**
 * "Zuschauen": the German text of every narration clip – the one source for
 * the on-screen caption and for the recording script.
 */
export const EXPLAIN_TEXT: Record<string, string> = {
  e_intro: "Zuerst schauen wir vier Wörter an. Dann übst du selbst. Schau genau zu.",
  e_start_a: "Das erste Wort bedeutet: ich. Hier sind seine Buchstaben. Wir lesen von rechts nach links. Jetzt setzen wir sie zusammen.",
  e_start_b: "Die Hamza steht am Anfang vom Wort. Vor ihr steht nichts. Darum steht sie allein.",
  e_middle_a: "Das zweite Wort bedeutet: er fragte. Hier sind seine Buchstaben. Jetzt setzen wir sie zusammen.",
  e_middle_b: "Die Hamza steht in der Mitte. Der Nachbar davor streckt seine Hand aus und hält sie fest.",
  e_end_a: "Das dritte Wort ist Saba. Das war ein Königreich. Hier sind seine Buchstaben. Jetzt setzen wir sie zusammen.",
  e_end_b: "Die Hamza steht am Ende. Auch hier hält der Nachbar davor sie fest.",
  e_separate_a: "Das letzte Wort bedeutet: er las. Hier sind seine Buchstaben. Jetzt setzen wir sie zusammen.",
  e_separate_b: "Auch hier steht ein Nachbar vor der Hamza. Aber er hat keine Hand. Darum steht die Hamza allein.",
  e_outro: "Hast du es gesehen? Manchmal steht die Hamza allein. Und manchmal wird sie vom Nachbarn festgehalten. Jetzt bist du dran!",
};

/** The 10 "Zuschauen" clips (alif-hamza-erklaerung.zip). */
export const EXPLAIN_FILES = [
  NARRATION.explain.intro,
  ...POSITIONS.flatMap((position) => [NARRATION.explain.letters(position), NARRATION.explain.why(position)]),
  NARRATION.explain.outro,
];

/** The 21 exercise narration files (alif-hamza-de.zip; word recordings come from the data). */
export const NARRATION_FILES = [
  NARRATION.pageIntro,
  NARRATION.build.intro, NARRATION.build.wrong, NARRATION.build.all,
  ...POSITIONS.map(NARRATION.build.done),
  ...Object.values(NARRATION.neighbors),
  NARRATION.sort.intro, NARRATION.sort.hint, NARRATION.sort.hintStart, NARRATION.sort.replay, NARRATION.sort.done,
  ...(["start", "nohand", "hold"] as const).map(NARRATION.sort.ok),
];
