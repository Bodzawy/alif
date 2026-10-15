import type { A1Lesson, A1LessonLetter, A1Step, GapItem, LetterPositions, SoundItem, WritingLetterSet } from "@/data/types";

import { alignPattern } from "@/lib/arabic/gap";
import { splitTiles } from "@/lib/arabic/letter-form";

import { picture, unvocalised, type LetterWordSpec } from "../letter-lesson";
import { dictationItem, gaps2, letterPattern, needsBare, vowelTiles, WRITE_INTRO } from "../lesson-2/letter-entry";

// A1 · Unit 2 of the book ("وجدي.pdf", book pages 44–81): one entry per
// letter (ر ز س ش ص ض – تقديم ١; ف ق ك ل م ن – تقديم ٢). Every letter page has
// the same parts, in book order:
//   (١) النطق                          → 1 Wörter (each row starts with its sound)
//   (٢) كتابة الحرف + (٣) السكون        → 2 Formen (the book's table: tap the letter in each word)
//   تدريب ١ تتبع بالقلم                 → 3 Schreiben
//   تدريب ٢ اكتب الحرف الناقص بالتشكيل  → 4 Ergänzen (with pictures)
//   تدريب ٣ اسمع واكتب الحرف الناقص     → 5 Hören
//   تدريب ٤ اسمع وكرر واكتب الحرف        → 6 Nachsprechen & schreiben
//   تدريب ٥–٧ ادخل إلى الموقع           → no content in the book (publisher's website)
//   تدريب ٨ اكتب الحرف مع مد … / انطق    → 7 Mit Dehnung schreiben, 8 Aussprechen
//   تدريب ٩ اسمع واكتب (+ حل تدريب ٩)    → 9 Diktat
//   تدريب ١٠ اقرأ … أعد الكتابة … بحروف منفصلة → 10 Getrennt schreiben
// Words, order and exercises are the book's. Vowel signs are completed where
// the book leaves them open (the learner writes the letter WITH its sign); a
// word-final consonant gets a Sukun, as in Lektion 1 and 2.

type Gap = [arabic: string, id: string, german?: string];

export type Unit2LetterSpec = {
  letter: A1LessonLetter & { latin: string; nameArabic: string; bookPages: string };
  /** (١) النطق – book order, each row right to left. */
  words: { fatha: LetterWordSpec[]; kasra: LetterWordSpec[]; damma: LetterWordSpec[] };
  /** (٢) كتابة + (٣) النطق مع السكون – the book's table. */
  positions: Omit<LetterPositions, "letter" | "name">;
  writing: WritingLetterSet;
  /** تدريب ٢: word ids of "Wörter", in book order (every occurrence of the letter is a gap). */
  fill: string[];
  /** تدريب ٣: word ids, then the book's tenth word (the Sukun word). */
  listen: Array<string | Gap>;
  /** تدريب ٤: the words in book order. */
  repeatWrite: Gap[];
  /** تدريب ٨: the vocalised letters of "انطق الحرف", in book order. */
  pronounce: string[];
  /** تدريب ٩: [book pattern ("_" for a letter to write), solution from "حل تدريب ٩", id, German]. */
  dictation: Array<[pattern: string, arabic: string, id: string, german: string]>;
  /** The letters the book names in تدريب ٩, e.g. "أ … ر". */
  dictationLetters: string;
  /** Extra German notes by step (e.g. the book's remark on لا / الـ). */
  notes?: Partial<Record<"positions" | "dictation" | "spell" | "listen", string>>;
};

const VOWELS = {
  fatha: { mark: "َ", latin: "a", name: { arabic: "فَتْحَة", german: "Fatha" } },
  kasra: { mark: "ِ", latin: "i", name: { arabic: "كَسْرَة", german: "Kasra" } },
  damma: { mark: "ُ", latin: "u", name: { arabic: "ضَمَّة", german: "Damma" } },
} as const;
type Vowel = keyof typeof VOWELS;
const MARKS: Record<string, Vowel> = { "َ": "fatha", "ِ": "kasra", "ُ": "damma" };

type StepInput = A1Step extends infer S ? (S extends A1Step ? Omit<S, "slug"> : never) : never;

/** The long syllables of تدريب ٨: the letter with Damma + و, Fatha + ا, Kasra + ي (book order: و، ا، ي). */
export const longSyllables = (letter: string) => [letter + VOWELS.damma.mark + "و", letter + VOWELS.fatha.mark + "ا", letter + VOWELS.kasra.mark + "ي"];

export function unit2Letter(spec: Unit2LetterSpec): A1Lesson {
  const { letter } = spec;
  const audio = (id: string) => `${letter.id}/uebungen/${id}`;
  const allWords = [...spec.words.fatha, ...spec.words.kasra, ...spec.words.damma];
  const wordById = new Map(allWords.map((w) => [w[0], w]));
  const choices = vowelTiles(letter.glyph);

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
    const tiles = [...new Set([...choices, ...withAnswers(arabic, pattern, bare)])];
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
  const note = spec.notes ?? {};

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
    instruction: { arabic: `(٢) كِتَابَةُ ${letter.nameArabic} · النُّطْقُ مَعَ السُّكُونِ`, german: `So steht das ${letter.name} im Wort – und so klingt es mit Sukun.`, note: note.positions },
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
      arabic: `تَدْرِيبٌ (٣): اِسْمَعْ مِنَ الْمُدَرِّسِ وَاكْتُبِ الْحَرْفَ النَّاقِصَ (${choices.join(" / ")}) بِالتَّشْكِيلِ.`,
      german: "Übung 3: Hör zu und ergänze den fehlenden Buchstaben mit Vokalzeichen.",
      note: note.listen ?? "Im Buch: „صَحِّحْ مَعَ زَمِيلِكَ“ – vergleiche mit deinem Lernpartner. Hier prüft Alif deine Antwort sofort.",
    },
    gaps: gaps2("listen", choices, spec.listen.map(letterGap("listen", false))),
  });

  add({
    kind: "gaps",
    title: "Hören, nachsprechen, schreiben",
    navLabel: "Nachsprechen & schreiben",
    instruction: {
      arabic: "تَدْرِيبٌ (٤): اِسْمَعْ وَكَرِّرْ بَعْدَ الْمُدَرِّسِ وَاكْتُبِ الْحَرْفَ بِالتَّشْكِيلِ.",
      german: `Übung 4: Hör zu, sprich nach und schreib das ${letter.name} mit seinem Vokalzeichen.`,
      note: "Die Übungen 5–7 im Buch („اُدْخُلْ إِلَى الْمَوْقِعِ“) verweisen auf die Website des Buchverlags; im Buch selbst stehen dazu keine Aufgaben.",
    },
    gaps: { ...gaps2("listen", choices, spec.repeatWrite.map(letterGap("repeat", false))), repeat: true },
  });

  const long = longSyllables(letter.glyph);
  add({
    kind: "gaps",
    title: `Mit Dehnung schreiben: ${long.join(" · ")}`,
    navLabel: "Mit Dehnung",
    instruction: {
      arabic: `تَدْرِيبٌ (٨): اُكْتُبِ الْحَرْفَ مَعَ مَدٍّ بِالْوَاوِ: ${letter.glyph} + و = … · بِالْأَلِفِ: ${letter.glyph} + ا = … · بِالْيَاءِ: ${letter.glyph} + ي = …`,
      german: `Übung 8 (Teil 1): Schreib das ${letter.name} mit einem langen Vokal – mit و, ا oder ي – und sprich die Silbe nach.`,
    },
    gaps: {
      ...gaps2(
        "listen",
        ["ا", "و", "ي"],
        long.map((syllable, n): GapItem => ({ id: `long-${n + 1}`, arabic: syllable, german: ["langes ū", "langes ā", "langes ī"][n]!, pattern: `${Array.from(syllable).slice(0, 2).join("")}_`, bare: true }))
      ),
      repeat: true,
    },
  });

  add({
    kind: "phrases",
    title: `Aussprechen: ${spec.pronounce.join(" · ")}`,
    navLabel: "Aussprechen",
    instruction: {
      arabic: "تَدْرِيبٌ (٨): اُنْطُقِ الْحَرْفَ بَعْدَ كِتَابَتِهِ. لَاحِظْ فَرْقَ النُّطْقِ فِي الصَّوْتِ بَيْنَ الْحَرَكَاتِ الطَّوِيلَةِ وَالْقَصِيرَةِ.",
      german: `Übung 8 (Teil 2): Sprich das ${letter.name} mit kurzem Vokal. Achte auf den Unterschied zu den langen Silben (${long.join("، ")}).`,
      note: "Die Bewertung prüft den Vokal (a, i, u); ob du ihn kurz oder lang sprichst, kann sie nicht sicher unterscheiden.",
    },
    groups: [
      {
        id: `${letter.id}-pronounce`,
        title: "Kurz: der Buchstabe mit seinem Vokal",
        items: spec.pronounce.map((glyph, n) => {
          const vowel = MARKS[Array.from(glyph).find((c) => MARKS[c])!]!;
          const id = `${letter.id}-p8-${n + 1}`;
          return { id, arabic: glyph, transliteration: letter.latin + VOWELS[vowel].latin, german: `${letter.name} mit ${VOWELS[vowel].name.german} (kurz)`, exercise: { id, target: glyph, modelText: glyph } };
        }),
      },
    ],
  });

  add({
    kind: "gaps",
    title: `Diktat: ${spec.dictationLetters}`,
    navLabel: "Diktat",
    instruction: {
      arabic: `تَدْرِيبٌ (٩): اِسْمَعْ وَاكْتُبْ مَعَ التَّشْكِيلِ (الْحُرُوفُ مِنْ ${spec.dictationLetters} + حُرُوفُ الْمَدِّ).`,
      german: "Übung 9: Diktat – hör zu und schreib die fehlenden Buchstaben mit ihren Zeichen.",
      note: note.dictation ?? "Die Lösungswörter stehen im Buch unter „حَلُّ تَدْرِيبِ (٩)“. Ein Buchstabe am Wortende ohne Vokal wird mit Sukun geschrieben.",
    },
    gaps: gaps2(
      "listen",
      [letter.glyph],
      spec.dictation.map(([pattern, arabic, id, german], n) => dictationItem(`dictation-${n + 1}-${id}`, pattern, arabic, german, audio(id))),
      WRITE_INTRO
    ),
  });

  add({
    kind: "spell",
    title: "Getrennt schreiben",
    navLabel: "Getrennt schreiben",
    instruction: {
      arabic: "تَدْرِيبٌ (١٠): اِقْرَأِ الْكَلِمَاتِ … أَعِدْ كِتَابَتَهَا … اِسْمَعِ الْكَلِمَاتِ مَرَّةً أُخْرَى وَاكْتُبْهَا بِحُرُوفٍ مُنْفَصِلَةٍ.",
      german: "Übung 10: Lies die Wörter aus dem Diktat, hör sie noch einmal und schreib sie mit getrennten Buchstaben – z. B. جَرَس: ج – ر – س.",
      note: note.spell,
    },
    words: spec.dictation.map(([, arabic, id, german]) => ({ id: `spell-${id}`, arabic, german })),
  });

  return { slug: letter.id, kind: "letter", label: letter.glyph, labelGerman: letter.name, letter: { id: letter.id, glyph: letter.glyph, name: letter.name }, steps };
}

/** The answers of a pattern – added to the tiles when one is not a plain vowel tile (e.g. "رَّ" with shadda). */
const withAnswers = (arabic: string, pattern: string, bare: boolean) => alignPattern(arabic, pattern, bare).map((gap) => gap.answer);

/**
 * A dictation pattern: every tile of the word is a gap ("_") except those the
 * book prints (tile indices in `keep`, e.g. the ة of شُورْبَة).
 */
export function blank(word: string, keep: number[] = []): string {
  return splitTiles(word)
    .map((tile, i) => (keep.includes(i) ? tile : "_"))
    .join("");
}
