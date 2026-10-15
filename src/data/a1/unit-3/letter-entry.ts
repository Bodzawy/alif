import type { A1Lesson, A1LessonLetter, A1Step, GapItem, LetterPositions, SoundItem, WritingLetterSet } from "@/data/types";

import { alignPattern } from "@/lib/arabic/gap";
import { transliterate } from "@/lib/arabic/transliterate";

import { picture, unvocalised, type LetterWordSpec } from "../letter-lesson";
import { dictationItem, gaps2, letterPattern, needsBare, vowelTiles, WRITE_INTRO } from "../lesson-2/letter-entry";
import { blank } from "../unit-2/letter-entry";

// A1 · the book's Unit 3, تقديم (١) "مَنْ هُوَ؟" (book pages 92–106): one entry
// per letter ه ط ظ ع غ. Every letter page has the same parts, in book order:
//   (١) النطق                              → 1 Wörter (each row starts with its sound)
//   (٢) كتابة الحرف + (٣) النطق مع السكون   → 2 Formen
//   تدريب ١ تتبع بالقلم                     → 3 Schreiben
//   تدريب ٢ اكتب الحرف الناقص بالتشكيل      → 4 Ergänzen (with pictures)
//   تدريب ٣ اسمع … واكتب الكلمة مرة أخرى    → 5 Hören
//   تدريب ٤ اسمع وكرر (واكتب الحرف)         → 6 Nachsprechen (& schreiben)
//   تدريب ٥–٧ ادخل إلى الموقع               → no content in the book (publisher's website)
//   تدريب ٨ اسمع واكتب الكلمة (+ حل تدريب ٨) → 7 Diktat (ه: + 8 Lesen und aussprechen)
//   تدريب ٩ الفرق في الصوت بين … (+ حل)      → Unterschied (غ: تدريب عام على الحروف)
// Words, order and exercises are the book's. Vowel signs are completed where
// the book leaves them open; a word-final consonant to write gets a Sukun.

type Gap = [arabic: string, id: string, german: string];

export type Unit3LetterSpec = {
  letter: A1LessonLetter & { latin: string; nameArabic: string; bookPages: string };
  /** (١) النطق – book order, each row right to left. */
  words: { fatha: LetterWordSpec[]; kasra: LetterWordSpec[]; damma: LetterWordSpec[] };
  /** (٢) كتابة + (٣) النطق مع السكون – the book's table. */
  positions: Omit<LetterPositions, "letter" | "name">;
  writing: WritingLetterSet;
  /** تدريب ٢: word ids of "Wörter", in book order (every occurrence of the letter is a gap). */
  fill: string[];
  /** تدريب ٣: word ids (or other words), in book order; the tenth is the Sukun word. */
  listen: Array<string | Gap>;
  /** تدريب ٤: the words in book order; `write: false` when the book only asks to repeat (ظ). */
  repeat: { words: Gap[]; write: boolean };
  /** تدريب ٨ (أ): the words of „حل تدريب ٨“, written in full. */
  dictation: Gap[];
  /** تدريب ٨ (ب) „أعد قراءة الكلمة وانطقها نطقاً صحيحاً“ – only ه. */
  readAloud?: boolean;
  /** تدريب ٩ – the difference between two letters: [book pattern, solution, id, German] in book order. */
  difference?: { letters: [string, string]; pairs: Array<[[string, string, string, string], [string, string, string, string]]> };
  /** تدريب ٩ of غ: the general drill on the alphabet (solutions of „حل تدريب ٩“). */
  alphabet?: Gap[];
  notes?: Partial<Record<"positions" | "listen" | "repeat" | "dictation", string>>;
};

const VOWELS = {
  fatha: { mark: "َ", latin: "a", name: { arabic: "فَتْحَة", german: "Fatha" } },
  kasra: { mark: "ِ", latin: "i", name: { arabic: "كَسْرَة", german: "Kasra" } },
  damma: { mark: "ُ", latin: "u", name: { arabic: "ضَمَّة", german: "Damma" } },
} as const;
type Vowel = keyof typeof VOWELS;

type StepInput = A1Step extends infer S ? (S extends A1Step ? Omit<S, "slug"> : never) : never;

const WEBSITE_NOTE = "Die Übungen 5–7 im Buch („اُدْخُلْ إِلَى الْمَوْقِعِ“) verweisen auf die Website des Buchverlags; im Buch selbst stehen dazu keine Aufgaben.";

/** The tiles of one letter: with Fatha, Kasra, Damma, Sukun (أ: the Hamza seats). */
export const letterTiles = (letter: string) => (letter === "أ" ? ["أَ", "إِ", "أُ", "أْ"] : vowelTiles(letter));

/** A gap item of تدريب ٩: the word's gaps are the two letters of the drill, each with its signs. */
export function differenceItem(id: string, pattern: string, arabic: string, german: string, family: [string, string], audio?: string): GapItem {
  const item = dictationItem(id, pattern, arabic, german, audio);
  const tiles = family.flatMap(letterTiles);
  return { ...item, gapChoices: item.gapChoices!.map((own) => [...new Set([...tiles, ...own.filter((t) => tiles.includes(t) || family.some((l) => t.startsWith(l)))])]) };
}

export function unit3Letter(spec: Unit3LetterSpec): A1Lesson {
  const { letter } = spec;
  const audio = (id: string) => `${letter.id}/uebungen/${id}`;
  const allWords = [...spec.words.fatha, ...spec.words.kasra, ...spec.words.damma];
  const wordById = new Map(allWords.map((w) => [w[0], w]));
  const choices = vowelTiles(letter.glyph);
  const note = spec.notes ?? {};

  const sound = (vowel: Vowel): SoundItem => {
    const glyph = letter.glyph + VOWELS[vowel].mark;
    const id = `${letter.id}-${vowel}`;
    return { id, glyph, transliteration: letter.latin + VOWELS[vowel].latin, vowelName: VOWELS[vowel].name, exercise: { id, target: glyph, modelText: glyph } };
  };
  const vowels: Vowel[] = ["fatha", "kasra", "damma"];
  const sounds = vowels.map(sound);

  /** A gap item where every occurrence of the letter is a gap (the book's "ـ"). */
  const letterGap = (step: string, withPicture: boolean) => (entry: string | Gap, n: number): GapItem => {
    const [arabic, id, german] = typeof entry === "string" ? [wordById.get(entry)![1], entry, undefined] : entry;
    const word = wordById.get(id);
    const meaning = german ?? word?.[2];
    if (!meaning) throw new Error(`${letter.id}: "${arabic}" needs a German meaning`);
    const pattern = letterPattern(arabic, letter.glyph);
    const bare = needsBare(arabic, pattern);
    const tiles = [...new Set([...choices, ...alignPattern(arabic, pattern, bare).map((gap) => gap.answer)])];
    const image = withPicture && word ? picture(letter.id, id, word[4]) : undefined;
    return {
      id: `${step}-${n + 1}-${id}`,
      arabic,
      german: meaning,
      audio: audio(id),
      pattern,
      ...(bare ? { bare: true } : {}),
      ...(tiles.length !== choices.length ? { choices: tiles } : {}),
      ...(image ? { image } : {}),
    };
  };

  const steps: A1Step[] = [];
  const add = (step: StepInput) => steps.push({ ...step, slug: `step-${steps.length + 1}` } as A1Step);

  add({
    kind: "sound-words",
    title: `Wörter mit ${sounds.map((s) => s.glyph).join(" · ")}`,
    navLabel: "Wörter",
    instruction: { arabic: "(١) النُّطْقُ: كَرِّرْ بَعْدَ الْمُدَرِّسِ", german: "Aussprache: Hör zu und sprich nach – erst den Laut, dann die Wörter." },
    groups: vowels.map((vowel, i) => ({
      sound: sounds[i]!,
      words: spec.words[vowel].map(([id, arabic, german, transliteration, pic]) => ({
        id,
        arabic,
        german,
        transliteration,
        ...(pic ? { image: picture(letter.id, id, pic) } : {}),
        exercise: { id, target: unvocalised(arabic).replace(/[؟?]/g, ""), modelText: arabic },
      })),
    })),
  });

  add({
    kind: "positions",
    title: `Formen: ${[...new Set(spec.positions.items.map((i) => i.shape))].join(" · ")}`,
    navLabel: "Formen",
    instruction: { arabic: `(٢) كِتَابَةُ ${letter.nameArabic} · (٣) النُّطْقُ مَعَ السُّكُونِ`, german: `So steht das ${letter.name} im Wort – und so klingt es mit Sukun.`, note: note.positions },
    positions: { letter: letter.glyph, name: letter.name, ...spec.positions },
  });

  add({
    kind: "writing",
    title: `Schreiben: ${spec.writing.forms.map((f) => f.glyph).join(" · ")}`,
    navLabel: "Schreiben",
    instruction: { arabic: "تَدْرِيبٌ (١): تَتَبَّعْ بِالْقَلَمِ.", german: "Übung 1: Fahr die Linie nach – mit dem Finger, dem Stift oder der Maus." },
    letterSet: spec.writing,
  });

  add({
    kind: "gaps",
    title: `Ergänzen: ${choices.join(" · ")}`,
    navLabel: "Ergänzen",
    instruction: { arabic: "تَدْرِيبٌ (٢): اُكْتُبِ الْحَرْفَ النَّاقِصَ بِالتَّشْكِيلِ.", german: "Übung 2: Ergänze den fehlenden Buchstaben – mit seinem Vokalzeichen." },
    gaps: gaps2("picture", choices, spec.fill.map(letterGap("fill", true))),
  });

  add({
    kind: "gaps",
    title: `Hören: ${choices.join(" · ")}`,
    navLabel: "Hören",
    instruction: {
      arabic: "تَدْرِيبٌ (٣): اِسْمَعْ مِنَ الْمُدَرِّسِ وَاكْتُبِ الْكَلِمَاتِ مَرَّةً أُخْرَى بِالتَّشْكِيلِ.",
      german: `Übung 3: Hör zu und schreib das ${letter.name} mit dem Vokalzeichen, das du hörst.`,
      note: note.listen ?? "Im Buch: „صَحِّحْ مَعَ زَمِيلِكَ“ – vergleiche mit deinem Lernpartner. Hier prüft Alif deine Antwort sofort.",
    },
    gaps: gaps2("listen", choices, spec.listen.map(letterGap("listen", false))),
  });

  if (spec.repeat.write) {
    add({
      kind: "gaps",
      title: "Hören, nachsprechen, schreiben",
      navLabel: "Nachsprechen & schreiben",
      instruction: {
        arabic: "تَدْرِيبٌ (٤): اِسْمَعْ وَكَرِّرْ بَعْدَ الْمُدَرِّسِ وَاكْتُبِ الْحَرْفَ بِالتَّشْكِيلِ.",
        german: `Übung 4: Hör zu, sprich nach und schreib das ${letter.name} mit seinem Vokalzeichen.`,
        note: note.repeat ?? WEBSITE_NOTE,
      },
      gaps: { ...gaps2("listen", choices, spec.repeat.words.map(letterGap("repeat", false))), repeat: true },
    });
  } else {
    add({
      kind: "phrases",
      title: "Hören und nachsprechen",
      navLabel: "Nachsprechen",
      instruction: {
        arabic: "تَدْرِيبٌ (٤): اِسْمَعْ وَكَرِّرْ بَعْدَ الْمُدَرِّسِ مَعَ التَّشْكِيلِ.",
        german: "Übung 4: Hör zu und sprich jedes Wort genau nach – mit allen Vokalen.",
        note: note.repeat ?? WEBSITE_NOTE,
      },
      groups: [
        {
          id: `${letter.id}-repeat`,
          title: "Hören und nachsprechen",
          items: spec.repeat.words.map(([arabic, id, german]) => ({ id: `${letter.id}-t4-${id}`, arabic, transliteration: transliterate(arabic), german, exercise: { id: `${letter.id}-t4-${id}`, target: unvocalised(arabic), modelText: arabic } })),
        },
      ],
    });
  }

  add({
    kind: "gaps",
    title: "Diktat: ganze Wörter",
    navLabel: "Diktat",
    instruction: {
      arabic: "تَدْرِيبٌ (٨): (أ) اِسْمَعْ وَاكْتُبِ الْكَلِمَةَ مَعَ التَّشْكِيلِ.",
      german: "Übung 8: Diktat – hör zu und schreib das ganze Wort mit seinen Zeichen.",
      note: note.dictation ?? "Die Lösungswörter stehen im Buch unter „حَلُّ تَدْرِيبِ (٨)“. Ein Buchstabe am Wortende ohne Vokal wird mit Sukun geschrieben.",
    },
    gaps: gaps2("listen", [letter.glyph], spec.dictation.map(([arabic, id, german], n) => dictationItem(`dictation-${n + 1}-${id}`, blank(arabic), arabic, german, audio(id))), WRITE_INTRO),
  });

  if (spec.readAloud) {
    add({
      kind: "phrases",
      title: "Lesen und richtig aussprechen",
      navLabel: "Aussprechen",
      instruction: { arabic: "تَدْرِيبٌ (٨): (ب) أَعِدْ قِرَاءَةَ الْكَلِمَةِ وَانْطِقْهَا نُطْقًا صَحِيحًا.", german: "Übung 8 (b): Lies die Wörter aus dem Diktat noch einmal und sprich sie richtig aus." },
      groups: [
        {
          id: `${letter.id}-read`,
          title: "Die Wörter aus dem Diktat",
          items: spec.dictation.map(([arabic, id, german]) => {
            const shown = arabic.replace(/ْ$/, "");
            return { id: `${letter.id}-t8-${id}`, arabic: shown, transliteration: transliterate(shown), german, exercise: { id: `${letter.id}-t8-${id}`, target: unvocalised(shown), modelText: shown } };
          }),
        },
      ],
    });
  }

  if (spec.difference) {
    const [a, b] = spec.difference.letters;
    add({
      kind: "gaps",
      title: `Unterschied: ${a} oder ${b}`,
      navLabel: "Unterschied",
      instruction: {
        arabic: `تَدْرِيبٌ (٩): الْفَرْقُ فِي الصَّوْتِ بَيْنَ (${a} / ${b}): اِسْمَعْ مِنَ الْمُدَرِّسِ وَاكْتُبْ (${a}) أَوْ (${b}).`,
        german: `Übung 9: Hör genau hin – ${a} oder ${b}? Schreib den Buchstaben mit seinem Vokalzeichen.`,
        note: "Im Buch stehen immer zwei Wörter nebeneinander; die Lösungen stehen unter „حَلُّ تَدْرِيبِ (٩)“.",
      },
      gaps: gaps2(
        "listen",
        [...letterTiles(a), ...letterTiles(b)],
        spec.difference.pairs.flatMap((pair, n) => pair.map(([pattern, arabic, id, german], k) => differenceItem(`pair-${n + 1}-${k + 1}-${id}`, pattern, arabic, german, [a, b], audio(id))))
      ),
    });
  }

  if (spec.alphabet) {
    add({
      kind: "gaps",
      title: "Alle Buchstaben: Diktat",
      navLabel: "Alle Buchstaben",
      instruction: {
        arabic: "تَدْرِيبٌ (٩): تَدْرِيبٌ عَامٌّ عَلَى الْحُرُوفِ الَّتِي سَبَقَ دِرَاسَتُهَا.",
        german: "Übung 9: Wiederholung aller Buchstaben – hör zu und schreib das ganze Wort.",
        note: "Die Lösungswörter stehen im Buch unter „حَلُّ تَدْرِيبِ (٩)“.",
      },
      gaps: gaps2("listen", [letter.glyph], spec.alphabet.map(([arabic, id, german], n) => dictationItem(`alphabet-${n + 1}-${id}`, blank(arabic), arabic, german, audio(id))), WRITE_INTRO),
    });
  }

  return { slug: letter.id, kind: "letter", label: letter.glyph, labelGerman: letter.name, letter: { id: letter.id, glyph: letter.glyph, name: letter.name }, steps };
}
