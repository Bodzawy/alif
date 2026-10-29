import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { existsSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// A1 · Lektion 2 "مَسَاءُ الْخَيْر" – checked against the book ("مساء الخير.pdf",
// pages 23–41): the four letters, their words and pictures, every exercise in
// book order, the long and short vowels, the two evening conversations, the
// grammar tables and the final exercises; and the new step types.
// MOCKED here: /api/tts (speakArabic) and the narration audio element. Nothing
// here calls a real speech service; the dialogues' listen / repeat / role-play
// flows (with mocked microphone and evaluation) are in a1-dialogue.test.tsx.

const tts = vi.hoisted(() => ({ spoken: [] as string[], fail: false }));
vi.mock("@/lib/tts/player", () => ({
  speakLocal: vi.fn(async () => undefined),
  speakArabic: vi.fn(async (text: string) => {
    if (tts.fail) throw new Error("down");
    tts.spoken.push(text);
  }),
  speechUrl: vi.fn(async (text: string) => `blob:${text}`),
  stopSpeaking: vi.fn(),
}));

import A1StepPage from "@/app/a1/[unit]/[lesson]/[step]/page";
import { CompareStep } from "@/components/a1/compare/compare-step";
import { GapsStep } from "@/components/a1/gaps/gaps-step";
import { LetterFindStep } from "@/components/a1/letter-find/letter-find-step";
import { MatchStep } from "@/components/a1/match/match-step";
import { PositionsStep } from "@/components/a1/positions/positions-step";
import { TableStep } from "@/components/a1/table/table-step";
import { WordPickStep } from "@/components/a1/word-pick/word-pick-step";
import { pickTokens } from "@/lib/arabic/word-pick";
import { A1_LEVEL, a1LessonExercises, a1SpokenTexts, getA1Lesson, getA1Unit, nextA1Entry } from "@/data/a1";

import { dictationChoices, letterPattern } from "@/data/a1/lesson-2/letter-entry";
import { adnanKhalidDialogue, nazikDinaDialogue } from "@/data/a1/lesson-2/masa-al-khayr";
import type { A1Lesson, A1Step } from "@/data/types";
import { alignPattern, gapTask } from "@/lib/arabic/gap";
import { findLines, targetKeys } from "@/lib/arabic/letter-find";
import { hasMadd, maddLetters } from "@/lib/arabic/madd";
import { getLessonProgress } from "@/lib/progress";
import { CONDITION_RULES, SOUND_RULES } from "@/lib/pronunciation/rules";
import { isAllowedTarget, isAllowedTtsText } from "@/lib/pronunciation/targets";
import { withTanwin } from "@/lib/arabic/tanwin";

// The units as the app shows them (vocabulary words with Tanwin, src/data/vocabulary-tanwin.ts).
const a1Unit2 = getA1Unit("lesson-2")!;

const PUBLIC = path.join(process.cwd(), "public");
const entry = (slug: string) => getA1Lesson("lesson-2", slug)!;
const stepOf = <K extends A1Step["kind"]>(lesson: A1Lesson, slug: string, kind: K) => {
  const step = lesson.steps.find((s) => s.slug === slug)!;
  if (step.kind !== kind) throw new Error(`${lesson.slug}/${slug} must be ${kind}, is ${step.kind}`);
  return step as Extract<A1Step, { kind: K }>;
};
const KEY = "a1/lesson-2/test/step-x";

class FakeAudio {
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  paused = true;
  src = "";
  play() {
    const src = this.src;
    this.paused = false;
    setTimeout(() => !this.paused && this.src === src && this.onended?.(), 5);
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
}

beforeEach(() => {
  tts.spoken.length = 0;
  tts.fail = false;
  window.localStorage.clear();
  vi.stubGlobal("Audio", FakeAudio);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

// ---------------------------------------------------------------------------
describe("Lektion 2 – placement and order", () => {
  it("is the second A1 lesson; its six entries in book order: د ذ و ي, the long vowels, the evening conversations", () => {
    expect(A1_LEVEL.units.slice(0, 4).map((u) => [u.slug, u.number, u.title, u.titleGerman])).toEqual([
      ["lesson-1", 1, "صَبَاحُ الْخَيْر", "Guten Morgen"],
      ["lesson-2", 2, "مَسَاءُ الْخَيْر", "Guten Abend"],
      ["lesson-3", 3, "هَلْ أَنْتَ وَجْدِي؟", "Bist du Wagdi?"],
      ["lesson-4", 4, "مَنْ أَنْتَ؟", "Wer bist du?"],
    ]);
    expect(a1Unit2.lessons.map((l) => [l.slug, l.kind, l.label, l.labelGerman])).toEqual([
      ["dal", "letter", "د", "Dal"],
      ["dhal", "letter", "ذ", "Dhal"],
      ["waw", "letter", "و", "Waw"],
      ["ya", "letter", "ي", "Ya"],
      ["huruf-al-madd", "topic", "حُرُوفُ الْمَدّ", "Lange und kurze Vokale"],
      ["masa-al-khayr", "phrase", "مَسَاءُ الْخَيْر", "Guten Abend"],
    ]);
  });

  it("the last entry of Lektion 1 leads on to the first of Lektion 2; inside Lektion 2 entry by entry; the last one ends", () => {
    expect(nextA1Entry("lesson-1", "tahiyya-wa-taqdim")).toMatchObject({ unit: { slug: "lesson-2" }, lesson: { slug: "dal" } });
    expect(nextA1Entry("lesson-1", "sabah-al-khayr")?.lesson.slug).toBe("tahiyya-wa-taqdim"); // Lektion 1 unchanged
    // The last entry of Lektion 2 leads on to Lektion 3 (the book's Unit 2).
    expect(a1Unit2.lessons.map((l) => nextA1Entry("lesson-2", l.slug)?.lesson.slug)).toEqual(["dhal", "waw", "ya", "huruf-al-madd", "masa-al-khayr", "ra"]);
  });

  it("the step page of the last step of Lektion 1 shows \"Weiter: Lektion 2 · د Dal\"", async () => {
    render(await A1StepPage({ params: Promise.resolve({ unit: "lesson-1", lesson: "tahiyya-wa-taqdim", step: "step-6" }) }));
    const next = screen.getByTestId("next-entry");
    expect(next).toHaveAttribute("href", "/a1/lesson-2/dal");
    expect(next).toHaveTextContent("Lektion 2");
    expect(next).toHaveTextContent("Dal");
  });
});

// ---------------------------------------------------------------------------
// The four letters.

const LETTER_STEPS = ["Wörter", "Formen", "Schreiben", "Ergänzen", "Hören", "Nachsprechen & schreiben", "Aussprechen", "Diktat"];
const BOOK_EXERCISE = [undefined, undefined, "(١)", "(٢)", "(٣)", "(٤)", "(٨)", "(٩)"];

/** (١) النطق – the words of each letter page, per vowel row, right to left: [Arabic, German, picture file]. */
const WORDS: Record<string, Array<[string, Array<[string, string, string]>]>> = {
  dal: [
    ["دَ", [["دَوَاء", "Medizin", "/images/a1/dal/dawaa.svg"], ["دَرَّاجَة", "Fahrrad", "/images/vocabulary/darraja.svg"], ["دَقِيق", "Mehl", "/images/a1/dal/daqiq.svg"]]],
    ["دِ", [["دِيك", "Hahn", "/images/a1/dal/dik.svg"], ["دِهَان", "Farbe (zum Streichen)", "/images/a1/dal/dihan.svg"], ["دِينَا", "Dina (Name)", "/images/a1/dal/dina.svg"]]],
    ["دُ", [["دُرْج", "Schublade", "/images/a1/dal/durj.svg"], ["دُولَاب", "Schrank", "/images/a1/dal/dulab.svg"], ["دُبّ", "Bär", "/images/vocabulary/dubb.svg"]]],
  ],
  dhal: [
    ["ذَ", [["ذَقْن", "Kinn", "/images/a1/dhal/dhaqn.svg"], ["ذَهَب", "Gold", "/images/a1/dhal/dhahab.svg"], ["ذَيْل", "Schwanz", "/images/a1/dhal/dhayl.svg"]]],
    ["ذِ", [["ذِئْب", "Wolf", "/images/vocabulary/dhib.svg"], ["ذِرَاع", "Arm", "/images/a1/dhal/dhiraa.svg"], ["ذِئَاب", "Wölfe", "/images/a1/dhal/dhiab.svg"]]],
    ["ذُ", [["ذُرَة", "Mais", "/images/vocabulary/dhura.svg"], ["ذُبَابَة", "Fliege", "/images/vocabulary/dhubaba.svg"], ["ذُبَاب", "Fliegen", "/images/a1/dhal/dhubab.svg"]]],
  ],
  waw: [
    ["وَ", [["وَرْدَة", "Rose", "/images/vocabulary/warda.svg"], ["وَلَد", "Junge", "/images/vocabulary/walad.svg"], ["وَرَقَة", "Blatt Papier", "/images/a1/waw/waraqa.svg"]]],
    ["وِ", [["وِئَام", "Wiam (Name; „Eintracht“)", "/images/a1/waw/wiam.svg"], ["وِسَادَة", "Kissen", "/images/vocabulary/wisada.svg"], ["وِعَاء", "Krug, Gefäß", "/images/a1/waw/wiaa.svg"]]],
    ["وُ", [["وُرُود", "Blumen, Rosen", "/images/a1/waw/wurud.svg"], ["وُصُول", "Ankunft", "/images/a1/waw/wusul.svg"], ["وُجُوه", "Gesichter", "/images/a1/waw/wujuh.svg"]]],
  ],
  ya: [
    ["يَ", [["يَمِين", "rechts", "/images/a1/ya/yamin.svg"], ["يَد", "Hand", "/images/vocabulary/yad.svg"], ["يَوْم", "Tag", "/images/a1/ya/yawm.svg"]]],
    ["يِ", [["يِن", "Yen (japanisches Geld)", "/images/a1/ya/yin.svg"]]],
    ["يُ", [["يُوسُفِي", "Mandarinen", "/images/a1/ya/yusufi.svg"], ["يُسْرَا", "Yusra (Name)", "/images/a1/ya/yusra.svg"], ["الْيُونَان", "Griechenland", "/images/a1/ya/al-yunan.svg"]]],
  ],
};

describe.each(["dal", "dhal", "waw", "ya"])("the letter %s", (slug) => {
  const lesson = entry(slug);

  it("has the eight steps in book order, each with the book's instruction", () => {
    expect(lesson.steps.map((s) => [s.slug, s.navLabel])).toEqual(LETTER_STEPS.map((label, i) => [`step-${i + 1}`, label]));
    lesson.steps.forEach((step, i) => {
      expect(step.instruction?.german, step.slug).toBeTruthy();
      if (BOOK_EXERCISE[i]) expect(step.instruction?.arabic, step.slug).toContain(`تَدْرِيبٌ ${BOOK_EXERCISE[i]}`);
    });
    expect(lesson.steps[0]!.instruction?.arabic).toContain("(١) النُّطْقُ");
    expect(lesson.steps[1]!.instruction?.arabic).toContain("(٢) كِتَابَةُ");
    // تدريب ٥–٧ ("go to the website") have no content in the book – said, not invented.
    expect(lesson.steps[5]!.instruction?.note).toContain("Übungen 5–7");
  });

  it("(١) النطق: the sound with Fatha, Kasra, Damma, then exactly the book's words – Arabic, German, transliteration, the right picture", () => {
    const words = stepOf(lesson, "step-1", "sound-words");
    expect(words.groups.map((g) => [g.sound.glyph, g.words.map((w) => [w.arabic, w.german, w.image?.src])])).toEqual(
      WORDS[slug]!.map(([glyph, words]) => [glyph, words.map(([arabic, ...rest]) => [withTanwin(arabic), ...rest])])
    );
    for (const group of words.groups) {
      expect(CONDITION_RULES[group.sound.exercise.target], group.sound.glyph).toBeDefined();
      expect(isAllowedTarget(group.sound.exercise.target)).toBe(true);
      for (const word of group.words) {
        expect(word.arabic.startsWith(group.sound.glyph) || word.arabic.startsWith(`الْ${group.sound.glyph}`), word.arabic).toBe(true);
        expect(word.transliteration, word.id).toMatch(/^[\p{Script=Latin}ʾʿ-]+$/u);
        expect(existsSync(path.join(PUBLIC, word.image!.src)), word.image!.src).toBe(true);
        expect(word.image!.alt.length).toBeGreaterThan(3);
        expect(isAllowedTarget(word.exercise.target), word.exercise.target).toBe(true);
        expect(isAllowedTtsText(word.exercise.modelText), word.exercise.modelText).toBe(true);
      }
    }
  });

  it("تدريب ٢ (with pictures) and ٣ (listening): every gap fits, its answer is offered, the vowel choices are the book's", () => {
    const fill = stepOf(lesson, "step-4", "gaps");
    const listen = stepOf(lesson, "step-5", "gaps");
    const letter = lesson.letter!.glyph;
    expect(fill.gaps.choices).toEqual([letter + "َ", letter + "ِ", letter + "ُ", letter + "ْ"]);
    expect([fill.gaps.mode, listen.gaps.mode]).toEqual(["picture", "listen"]);
    for (const step of [fill, listen, stepOf(lesson, "step-6", "gaps"), stepOf(lesson, "step-8", "gaps")]) {
      for (const item of step.gaps.items) {
        const task = gapTask(item);
        task.gaps.forEach((gap, i) => expect(item.gapChoices?.[i] ?? item.choices ?? step.gaps.choices, `${step.slug} ${item.arabic}`).toContain(gap.answer));
        expect(isAllowedTtsText(item.spoken ?? item.arabic), item.arabic).toBe(true);
      }
    }
    for (const item of fill.gaps.items) expect(existsSync(path.join(PUBLIC, item.image!.src)), item.id).toBe(true);
    expect(stepOf(lesson, "step-6", "gaps").gaps.repeat).toBe(true);
  });

  it("تدريب ٨: the letter with its vowels, as in the book, each evaluated by its sound rule", () => {
    const step = stepOf(lesson, "step-7", "phrases");
    const expected = { dal: ["دُ", "دَ", "دِ"], dhal: ["ذُ", "ذَ", "ذِ"], waw: ["وُ", "وِ", "وَ"], ya: ["يَ", "يُ", "يِ", "يِ", "يَ", "يُ"] }[slug]!;
    const items = step.groups.flatMap((g) => g.items);
    expect(items.map((i) => i.arabic)).toEqual(expected);
    for (const item of items) {
      expect(SOUND_RULES[item.exercise.target], item.arabic).toBeDefined();
      expect(isAllowedTarget(item.exercise.target)).toBe(true);
    }
    expect(new Set(items.map((i) => i.exercise.id)).size).toBe(items.length); // يَ twice = two exercises
  });

  it("Schreiben: the book's forms, right to left", () => {
    const writing = stepOf(lesson, "step-3", "writing");
    const forms = { dal: ["د", "ـد"], dhal: ["ذ", "ـذ"], waw: ["و", "ـو"], ya: ["يـ", "ـيـ", "ـي", "ي"] }[slug]!;
    expect(writing.letterSet.forms.map((f) => f.glyph)).toEqual(forms);
    for (const form of writing.letterSet.forms) expect(form.strokes.length).toBeGreaterThan(0);
  });
});

describe("the exercises of each letter page, exactly as in the book", () => {
  const items = (slug: string, step: string) => stepOf(entry(slug), step, "gaps").gaps.items.map((i) => i.arabic);

  it("د: تدريب ٢، ٣، ٤، ٩", () => {
    expect(items("dal", "step-4")).toEqual(["دَوَاء", "دَرَّاجَة", "دُولَاب", "دِهَان", "دَقِيق", "دِيك", "دُرْج", "دِينَا", "دُبّ"]);
    expect(items("dal", "step-5")).toEqual(["دُرْج", "دِينَا", "دِيك", "دُبّ", "دَقِيق", "دَرَّاجَة", "دِهَان", "دَوَاء", "دُولَاب", "مَدْرَسَة"]);
    expect(items("dal", "step-6").map((w) => w.replace(/ْ$/, ""))).toEqual(["دَرْس", "مَدْفَأَة", "دَجَاجَة", "تَدُقّ", "مَسْجِد", "مَدْرَسَة", "شَاهِد", "جَدِيدَة", "جَدّ", "دَار", "حَدِيد", "دِيَارِي", "دُبّ", "الدُّنْيَا", "وَرْدَة", "الْأَحَد", "مَدِيحَة", "حَدِيقَة", "عِيدِي"]);
    // تدريب ٩: the book's patterns and its solution ("حل تدريب ٩").
    const dictation = stepOf(entry("dal"), "step-8", "gaps").gaps.items;
    expect(dictation.map((i) => [i.pattern, i.arabic])).toEqual([
      ["_امِر", "تَامِر"], ["_وْم", "ثَوْم"], ["_بْرِيق", "إِبْرِيق"], ["_رْتُقَال", "بُرْتُقَال"], ["_يَار", "خِيَار"], ["_رْج", "بُرْج"],
      ["_فَّاحَة", "تُفَّاحَة"], ["تَمَا_يل", "تَمَاثِيل"], ["_صَان", "حِصَان"], ["_رُوف", "خَرُوف"], ["_رْج", "دُرْج"], ["__يقَة", "حَدِيقَة"],
    ]);
  });

  it("ذ: تدريب ٢، ٣، ٤ (with the book's repeated words), ٩ (whole words)", () => {
    expect(items("dhal", "step-4")).toEqual(["ذِرَاع", "ذُبَابَة", "ذَقْن", "ذَهَب", "ذَيْل", "ذِئْب", "ذُرَة", "ذُبَاب", "ذِئَاب"]);
    expect(items("dhal", "step-5")).toEqual(["ذَهَب", "ذُبَابَة", "ذَيْل", "ذِرَاع", "ذُبَاب", "ذِئَاب", "ذَقْن", "ذِئْب", "ذُرَة", "إِذْن"]);
    expect(items("dhal", "step-6")).toHaveLength(21);
    expect(items("dhal", "step-6").filter((w) => w === "بُذُور")).toHaveLength(2);
    expect(items("dhal", "step-8").map((w) => w.replace(/ْ$/, ""))).toEqual(["بِذَار", "حَذَفَ", "تَاج", "أَخَذَ", "ثَوَاب", "ذُبَاب", "تَابَ", "ابْن", "خَابَ", "دَار"]);
  });

  it("و: تدريب ٢، ٣ (a long ū is the plain و), ٤، ٩ (whole words)", () => {
    expect(items("waw", "step-4")).toEqual(["وَلَد", "وِعَاء", "وَرْدَة", "وُرُود", "وِسَادَة", "وَرَقَة", "وُصُول", "وُجُوه", "وِئَام"]);
    const wurud = stepOf(entry("waw"), "step-4", "gaps").gaps.items[3]!;
    expect(alignPattern(wurud.arabic, wurud.pattern!, wurud.bare).map((g) => [g.answer, g.vowel])).toEqual([["وُ", "u"], ["و", "none"]]);
    expect(wurud.choices).toEqual(["وَ", "وِ", "وُ", "وْ", "و"]);
    expect(items("waw", "step-5")).toEqual(["وِسَادَة", "وُصُول", "وَرْدَة", "وِئَام", "وَرَقَة", "وِعَاء", "وَلَد", "وُرُود", "وُجُوه", "ثَوْر"]);
    expect(items("waw", "step-6").map((w) => w.replace(/ْ$/, ""))).toEqual(["وَصَلَ", "مَوْرِد", "وَرْدَة", "وِلَادَة", "وَائِل", "ثَوْر", "وَقَفَ", "وَلِيد", "عُود", "وَضَعَ", "مَوْضُوع", "دَلْو", "قُرُوش", "وُجُوه"]);
    expect(items("waw", "step-8").map((w) => w.replace(/ْ$/, ""))).toEqual(["ثَوَاب", "جُحَا", "دُود", "ذُو", "دَاوُد", "وُجُود", "ثَوْب", "دُرْج", "خَبَر", "ذَابَ"]);
    expect(stepOf(entry("waw"), "step-8", "gaps").gaps.items.every((i) => /^_+$/.test(i.pattern!))).toBe(true); // "اكتب الكلمة"
  });

  it("ي: تدريب ٢، ٣، ٤، ٩", () => {
    expect(items("ya", "step-4")).toEqual(["يَاسَمِين", "يِن", "يَوْم", "الْيُونَان", "يُوسُفِي", "يَد", "يَمِين", "يُسْرَا"]);
    expect(items("ya", "step-5")).toEqual(["يَوْم", "الْيُونَان", "يَمِين", "يُسْرَا", "يِن", "يُوسُفِي", "يَد", "بَيْت"]);
    expect(items("ya", "step-6")).toHaveLength(19);
    expect(items("ya", "step-8").map((w) => w.replace(/ْ$/, ""))).toEqual(["بَيْت", "جَيْب", "يَد", "خُرُوج", "دَلْو", "السَّادَات", "جَمِيل"]);
  });

  it("the dictation offers, per gap, the letter with every sign and its look-alikes; ا و ي for a letter without sign", () => {
    expect(dictationChoices("ثَ")).toEqual(["ثَ", "ثِ", "ثُ", "ثْ", "بَ", "تَ"]);
    expect(dictationChoices("ذُ")).toEqual(["ذَ", "ذِ", "ذُ", "ذْ", "دُ"]);
    expect(dictationChoices("ا")).toEqual(["ا", "و", "ي"]);
    expect(dictationChoices("إِ")).toEqual(["أَ", "إِ", "أُ", "أْ"]);
    expect(letterPattern("حَدِيد", "د")).toBe("حَ_ي_");
  });
});

// ---------------------------------------------------------------------------
describe("(٢) كتابة + (٣) النطق مع السكون", () => {
  it("د ذ و (no Hand): the book's table – position, shape, example word – and the Sukun word", () => {
    const table = (slug: string) => {
      const p = stepOf(entry(slug), "step-2", "positions").positions;
      return [...p.items.map((i) => [i.label, i.shape, i.word]), ["sukun", p.sukun.glyph, p.sukun.word]];
    };
    // The example words are shown and spoken with Tanwin (a verb such as أَخَذَ has none); the Sukun word keeps its pausal form.
    expect(table("dal")).toEqual([["فِي أَوَّلِ الْكَلِمَةِ", "د", "دُولَابٌ"], ["فِي آخِرِ الْكَلِمَةِ", "ـد", "فَرِيدٌ"], ["مُنْفَصِلَة", "د", "دُرْجٌ"], ["sukun", "دْ", "مَدْرَسَة"]]);
    expect(table("dhal")).toEqual([["فِي أَوَّلِ الْكَلِمَةِ", "ذ", "ذَقْنٌ"], ["فِي آخِرِ الْكَلِمَةِ", "ـذ", "أَخَذَ"], ["مُنْفَصِلَة", "ذ", "ذُرَةٌ"], ["sukun", "ذْ", "إِذْن"]]);
    expect(table("waw")).toEqual([["فِي أَوَّلِ الْكَلِمَةِ", "و", "وَلَدٌ"], ["فِي الْمُنْتَصَفِ", "ـو", "وُصُولٌ"], ["فِي آخِرِ الْكَلِمَةِ", "ـو", "عَفْوٌ"], ["مُنْفَصِلَة", "و", "دَوَاءٌ"], ["sukun", "وْ", "ثَوْر"]]);
  });

  it("ي (with a Hand): the Formen step with the book's words يَد، يَمِين، يُوسُفِي، مَجْدِي and بَيْت", () => {
    const forms = stepOf(entry("ya"), "step-2", "forms").forms;
    expect(forms.explain.map((w) => w.arabic)).toEqual(["يَد", "يَمِين", "يُوسُفِي", "مَجْدِي"]);
    expect(forms.sort.map((w) => w.arabic)).toEqual(["يَد", "يَمِين", "يُوسُفِي", "مَجْدِي", "بَيْت"]);
    expect(forms.letter?.glyph).toBe("ي");
  });

  it("PositionsStep: tap the letter in each word – a wrong letter is named, the other و of وُصُول is explained; done when all are found", async () => {
    const positions = stepOf(entry("waw"), "step-2", "positions").positions;
    render(<PositionsStep positions={positions} progressKey={KEY} />);
    expect(screen.getByTestId("positions-count")).toHaveTextContent("0 von 5 gefunden");
    expect(screen.getByTestId("positions-rule")).toHaveTextContent("Das Waw verbindet sich nur");
    const tile = (card: string, n: number) => within(screen.getByTestId(`position-${card}`)).getAllByRole("button", { name: /^Buchstabe/ })[n]!;
    // وُصُول: the first و is not the one "in der Mitte".
    fireEvent.click(tile("middle", 0));
    expect(screen.getByTestId("position-feedback-middle")).toHaveTextContent("Das ist auch ein و – gesucht ist das و in der Mitte.");
    fireEvent.click(tile("middle", 1)); // ص
    expect(screen.getByTestId("position-feedback-middle")).toHaveTextContent("Das ist ص, kein و.");
    fireEvent.click(tile("middle", 2));
    expect(screen.getByTestId("position-middle")).toHaveAttribute("data-found", "true");
    fireEvent.click(tile("start", 0));
    fireEvent.click(tile("end", 2));
    fireEvent.click(tile("separate", 1));
    expect(getLessonProgress(KEY).completedAt).toBeUndefined();
    fireEvent.click(tile("sukun", 1));
    expect(screen.getByTestId("positions-count")).toHaveTextContent("5 von 5 gefunden");
    expect(getLessonProgress(KEY).completedAt).toBeTruthy();
    fireEvent.click(screen.getByTestId("position-listen-middle"));
    await waitFor(() => expect(tts.spoken).toEqual(["وُصُولٌ"]));
  });
});

// ---------------------------------------------------------------------------
describe("حروف المد – long and short vowels", () => {
  const madd = entry("huruf-al-madd");

  it("the book's three parts (Alif, Waw, Ya), then exercises 1, 2, 3, 5, 6, 7, 8, 9 (4 is the website)", () => {
    expect(madd.steps.map((s) => [s.slug, s.kind, s.navLabel])).toEqual([
      ["step-1", "compare", "Langes ā"],
      ["step-2", "compare", "Langes ū"],
      ["step-3", "compare", "Langes ī"],
      ["step-4", "gaps", "Übung 1"],
      ["step-5", "gaps", "Übung 2"],
      ["step-6", "gaps", "Übung 3"],
      ["step-7", "match", "Übung 5"],
      ["step-8", "gaps", "Übung 6"],
      ["step-9", "word-pick", "Übung 7"],
      ["step-10", "match", "Übung 8"],
      ["step-11", "gaps", "Übung 9"],
    ]);
    expect(stepOf(madd, "step-6", "gaps").instruction?.note).toContain("Übung 4");
  });

  it("listen and compare: the book's pairs and rows, long and short marked", () => {
    const rows = (slug: string) => stepOf(madd, slug, "compare").sections.map((s) => s.rows.map((r) => r.map((i) => `${i.arabic}${i.tag ? `:${i.tag}` : ""}`)));
    const alif = rows("step-1");
    expect(alif[0]).toEqual([["بَاب:long", "بَب:short"], ["تَاب:long", "تَب:short"], ["عَامِل:long", "عَمَل:short"], ["كِتَاب:long", "كَتَبَ:short"]]);
    expect(alif[1]).toEqual([["سَأَلَ:hamza", "سَالَ:long"], ["بَدَأَ:hamza", "بَدَا:long"]]);
    expect(alif[2]!.flat()).toEqual(["أَخ", "أُخْت", "أُسْتَاذ", "سَأَلَ", "رَأْس"].map((w) => `${w}:hamza`));
    expect(alif[3]!.flat().map((w) => w.split(":")[0])).toEqual(["بَابَا", "مَامَا", "آخِر", "آمِن", "هُنَا", "أَنَا", "سَالَ", "مَالَ", "عَاجَ", "عَامِل", "مَهَا"]);
    expect(alif[4]!.flat().map((w) => w.split(":")[0])).toEqual(["بَا", "تَا", "ثَا", "جَا", "حَا", "خَا", "دَا", "ذَا", "وَا", "يَا"]);
    const waw = rows("step-2");
    expect(waw[0]).toEqual([["صُورَة:long", "صُرَّة:short"], ["طُيُور:long", "طُيُر:short"], ["سُوق:long", "سُق:short"]]);
    expect(waw[1]!.map((r) => r.map((w) => w.split(":")[0]))).toEqual([["وَصَلَ", "وُصُول"], ["وَجَدَ", "وُجُود"], ["وَلَدَ", "وُلُود"], ["وَرْد", "وُرُود"]]);
    expect(waw[2]!.flat().map((w) => w.split(":")[0])).toEqual(["بُو", "تُو", "ثُو", "جُو", "حُو", "خُو", "دُو", "ذُو", "وُو", "يُو"]);
    const ya = rows("step-3");
    expect(ya[0]).toEqual([["دِيك:long", "دِك:short"], ["يَاسَمِينُ:long", "يَاسَمِنُ:short"], ["يَمِين:long", "يَمِن:short"]]);
    expect(ya[1]!.map((r) => r.map((w) => w.split(":")[0]))).toEqual([["الْيَمَن", "الْيَمِين"], ["يُسْرَا", "يَسِير"], ["يَجِد", "يُجْدِي"]]);
    expect(ya[2]!.flat().map((w) => w.split(":")[0])).toEqual(["هُدَى", "مَجْدِي"]);
    expect(ya[3]!.flat().map((w) => w.split(":")[0])).toEqual(["بِي", "تِي", "جِي", "حِي", "خِي", "دِي", "ذِي", "وِي", "يِي"]);
    expect(stepOf(madd, "step-3", "compare").sections[4]!.rows[0]!.map((i) => [i.label, i.arabic])).toEqual([["يَاءُ الْمَدِّ", "سَمِير"], ["يَاءُ كَسْرَةٍ", "يِن"], ["يَاءٌ سَاكِنَةٌ", "بَيْت"]]);
    // Every long item has a Dehnungsbuchstabe; in a long – short pair the long word has one more;
    // a Hamza example has a Hamza. (The tag is what the example shows: يَاسَمِنُ is "short" for its i,
    // although its ā is long.)
    for (const step of madd.steps.filter((s) => s.kind === "compare")) {
      for (const row of step.sections.flatMap((s) => s.rows)) {
        const long = row.find((i) => i.tag === "long");
        const short = row.find((i) => i.tag === "short");
        if (long && short && row.length === 2) expect(maddLetters(long.arabic).length, `${long.arabic} – ${short.arabic}`).toBe(maddLetters(short.arabic).length + 1);
      }
      for (const item of step.sections.flatMap((s) => s.rows.flat())) {
        if (item.tag === "long") expect(hasMadd(item.arabic), item.arabic).toBe(true);
        if (item.tag === "hamza") expect(item.arabic, item.arabic).toMatch(/[أإؤئء]/);
        expect(isAllowedTtsText(item.arabic), item.arabic).toBe(true);
      }
    }
  });

  it("CompareStep: every example can be heard (also as a pair); done when all were heard; a TTS failure is shown, not hidden", async () => {
    const sections = stepOf(madd, "step-2", "compare").sections;
    render(<CompareStep sections={sections} progressKey={KEY} />);
    const total = sections.flatMap((s) => s.rows.flat()).length;
    expect(screen.getByTestId("compare-count")).toHaveTextContent(`0 von ${total} angehört`);
    fireEvent.click(screen.getByTestId(`compare-pair-${sections[0]!.id}-0`));
    await waitFor(() => expect(tts.spoken).toEqual(["صُورَة", "صُرَّة"]));
    expect(screen.getByTestId("compare-count")).toHaveTextContent(`2 von ${total} angehört`);
    tts.fail = true;
    const first = sections[0]!.rows[1]![0]!;
    fireEvent.click(screen.getByTestId(`compare-listen-${first.id}`));
    await screen.findByTestId(`compare-listen-${first.id}-error`);
    tts.fail = false;
    for (const item of sections.flatMap((s) => s.rows.flat())) fireEvent.click(screen.getByTestId(`compare-listen-${item.id}`));
    await waitFor(() => expect(getLessonProgress(KEY).completedAt).toBeTruthy());
    expect(screen.getByTestId("compare-count")).toHaveTextContent(`${total} von ${total} angehört`);
  });

  it("تدريب ١ and ٢: the book's words, gaps and pictures; ٢ offers ا و ي", () => {
    const one = stepOf(madd, "step-4", "gaps").gaps.items;
    expect(one.map((i) => [i.pattern, i.arabic.replace(/ْ$/, "")])).toEqual([
      ["__ك", "دِيك"], ["صُ_رَة", "صُورَة"], ["___", "بَاب"], ["عَ_مِل", "عَامِل"], ["طُ_ور", "طُيُور"], ["__سَمِ_نُ", "يَاسَمِينُ"], ["كِ___", "كِتَاب"], ["فِ_ل", "فِيل"],
    ]);
    for (const item of one) expect(existsSync(path.join(PUBLIC, item.image!.src)), item.id).toBe(true);
    const two = stepOf(madd, "step-5", "gaps");
    expect(two.gaps.mode).toBe("listen");
    expect(two.gaps.items.map((i) => i.arabic)).toEqual(["صُورَة", "كِتَاب", "عَامِل", "دِيك", "سَبُّورَة", "بَابَا", "طُيُور", "يَاسَمِين", "بَاب", "سُوق"]);
    for (const item of two.gaps.items) {
      expect(item.choices).toEqual(["ا", "و", "ي"]);
      for (const gap of gapTask(item).gaps) expect(["ا", "و", "ي"]).toContain(gap.answer);
    }
  });

  it("تدريب ٣: the 16 words – repeat, then write the whole word with its signs", () => {
    const three = stepOf(madd, "step-6", "gaps").gaps;
    expect(three.repeat).toBe(true);
    expect(three.items.map((i) => i.arabic.replace(/ْ$/, ""))).toEqual(["فِيل", "وُصُول", "جَمِيل", "سَفِينَة", "بُيُوت", "كِتَاب", "سَبُّورَة", "وُرُود", "تِين", "خَوْخ", "أَخِي", "أُخْتِي", "بَاتَ", "مَجْدِي", "جَابِي", "مُنَى"]);
  });

  it("تدريب ٥: the nine words and the book's pictures (أ) … (ط); تاج = أ is the model", () => {
    const match = stepOf(madd, "step-7", "match").match;
    const label = (id: string) => match.options.find((o) => o.id === id)!.label;
    expect(match.prompts.map((p) => [p.arabic, label(p.answer)])).toEqual([
      ["تَاج", "أ"], ["صُورَة", "و"], ["طُيُور", "ج"], ["دِيك", "د"], ["يَاسَمِين", "ز"], ["بَاب", "ب"], ["كِتَاب", "ح"], ["عَامِل", "ط"], ["فِيل", "هـ"],
    ]);
    expect(match.prompts.filter((p) => p.example).map((p) => p.arabic)).toEqual(["تَاج"]);
    for (const option of match.options) expect(existsSync(path.join(PUBLIC, option.image!.src)), option.label).toBe(true);
  });

  it("تدريب ٦: the book's letters give exactly the solution words", () => {
    const six = stepOf(madd, "step-8", "gaps").gaps.items;
    expect(six.map((i) => [i.spoken, i.choices!.join("")])).toEqual([
      ["تَاج", "جات"], ["فِيل", "فلي"], ["بَاب", "اب"], ["كِتَاب", "بكات"], ["عَامِل", "علام"], ["يَاسَمِين", "يسمنا"], ["دِيك", "كدي"],
    ]);
    for (const item of six) expect(item.arabic).toBe(item.spoken!.replace(/[ً-ْ]/g, ""));
  });

  it("تدريب ٧: 24 words to read; the words WITHOUT a Dehnungsbuchstabe are بَيْت، أَخَذَ، بَخْت", () => {
    const pick = stepOf(madd, "step-9", "word-pick").pick;
    expect(pick.words).toHaveLength(24);
    expect(pickTokens(pick).filter((t) => t.target).map((t) => t.word)).toEqual(["بَيْت", "أَخَذَ", "بَخْت"]);
  });

  it("تدريب ٨: separated letters → the book's word column (ر – ض – ا = رِضَا is the model)", () => {
    const match = stepOf(madd, "step-10", "match").match;
    expect(match.options.map((o) => o.arabic)).toEqual(["رِضَا", "تَحْتِي", "جَاب", "يَدِي", "أُخْتِي", "وَجْدِي", "ثَوْبِي", "بَيْتِي", "وَحِيدٌ", "تُوتٌ"]);
    for (const prompt of match.prompts) {
      const word = match.options.find((o) => o.id === prompt.answer)!.arabic!;
      // The separated letters, joined, are the word (without its signs).
      expect(prompt.arabic.split(" – ").join(""), prompt.id).toBe(word.replace(/[ً-ْ]/g, ""));
      expect(prompt.result?.arabic).toBe(word);
    }
  });

  it("تدريب ٩: a dictation of words from تدريب ٧ only", () => {
    const read = new Set(stepOf(madd, "step-9", "word-pick").pick.words!.map((w) => w.arabic));
    for (const item of stepOf(madd, "step-11", "gaps").gaps.items) expect(read.has(item.arabic.replace(/ْ$/, "")), item.arabic).toBe(true);
  });

  it("the Dehnungsbuchstabe is computed from the vocalised word", () => {
    expect(maddLetters("دِينَا").map((m) => m.kind)).toEqual(["ya", "alif"]);
    expect(maddLetters("آخِر").map((m) => m.kind)).toEqual(["alif"]);
    expect(hasMadd("الْخَيْرِ")).toBe(false); // ي with Sukun: a consonant
    expect(hasMadd("وَرْد")).toBe(false); // و with Fatha: a consonant
    expect(hasMadd("اسْمُكَ")).toBe(false); // the Alif at the start is not a long vowel
    expect(hasMadd("هُدَى")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
describe("مساء الخير – the two evening conversations, grammar and final exercises", () => {
  const masa = entry("masa-al-khayr");

  it("conversation 1: Adnan and Khalid – exactly the book's seven lines", () => {
    expect(adnanKhalidDialogue.speakers.map((s) => [s.id, s.name, s.voice])).toEqual([["adnan", "Adnan", "male-1"], ["khalid", "Khalid", "male-2"]]);
    expect(adnanKhalidDialogue.lines.map((l) => [l.speaker, l.arabic, l.german])).toEqual([
      ["adnan", "مَسَاءُ الْخَيْرِ.", "Guten Abend!"],
      ["khalid", "مَسَاءُ النُّورِ.", "Guten Abend!"],
      ["adnan", "كَيْفَ حَالُكَ؟", "Wie geht es dir?"],
      ["khalid", "بِخَيْرٍ، الْحَمْدُ لِلَّهِ.", "Gut, Gott sei Dank."],
      ["adnan", "مَا اسْمُكَ؟", "Wie heißt du?"],
      ["khalid", "اسْمِي خَالِد، وَأَنْتَ؟", "Ich heiße Khalid. Und du?"],
      ["adnan", "اسْمِي عَدْنَان.", "Ich heiße Adnan."],
    ]);
    expect(adnanKhalidDialogue.question!.prompt).toContain("مَا اسْمُ الرَّجُلَيْنِ؟");
    expect(adnanKhalidDialogue.question!.options[adnanKhalidDialogue.question!.answer]).toBe("Adnan und Khalid.");
  });

  it("conversation 2: Nazik and Dina – the book's seven lines with the feminine forms", () => {
    expect(nazikDinaDialogue.speakers.map((s) => [s.id, s.name, s.voice])).toEqual([["nazik", "Nazik", "female-1"], ["dina", "Dina", "female-2"]]);
    expect(nazikDinaDialogue.lines.map((l) => [l.speaker, l.arabic])).toEqual([
      ["nazik", "مَسَاءُ الْخَيْرِ."],
      ["dina", "مَسَاءُ النُّورِ."],
      ["nazik", "كَيْفَ حَالُكِ؟"],
      ["dina", "بِخَيْرٍ، الْحَمْدُ لِلَّهِ."],
      ["nazik", "مَا اسْمُكِ؟"],
      ["dina", "اسْمِي دِينَا، وَأَنْتِ؟"],
      ["nazik", "اسْمِي نَازِك."],
    ]);
    for (const line of nazikDinaDialogue.lines) expect(line.arabic).not.toMatch(/حَالُكَ|اسْمُكَ|أَنْتَ/);
    expect(nazikDinaDialogue.question!.prompt).toContain("مَا اسْمُ الْمَرْأَتَيْنِ؟");
    // Avatars exist and differ.
    for (const s of [...adnanKhalidDialogue.speakers, ...nazikDinaDialogue.speakers]) expect(existsSync(path.join(PUBLIC, s.avatar.src)), s.avatar.src).toBe(true);
  });

  it("book order: listen and repeat each conversation, grammar, exercise 1 (role-play, both), 2 (د / ذ), 3 (و / ي), the long vowels, تذكر", () => {
    expect(masa.steps.map((s) => [s.slug, s.kind, s.kind === "dialogue" ? `${s.mode}:${s.dialogue.id}` : s.navLabel])).toEqual([
      ["step-1", "dialogue", "listen:adnan-khalid"],
      ["step-2", "dialogue", "repeat:adnan-khalid"],
      ["step-3", "dialogue", "listen:nazik-dina"],
      ["step-4", "dialogue", "repeat:nazik-dina"],
      ["step-5", "table", "Grammatik"],
      ["step-6", "dialogue", "roleplay:adnan-khalid"],
      ["step-7", "dialogue", "roleplay:nazik-dina"],
      ["step-8", "letter-find", "Übung 2"],
      ["step-9", "letter-find", "Übung 3"],
      ["step-10", "word-pick", "Lange Vokale"],
      ["step-11", "table", "Merke"],
    ]);
    expect(stepOf(masa, "step-6", "dialogue").instruction?.arabic).toContain("كَرِّرِ الْمُحَادَثَةَ مَعَ زَمِيلِكَ / زَمِيلَتِكَ");
    // Every line is evaluated with an allowed target and a rule; masculine and feminine share where only the vowel differs.
    const targets = a1LessonExercises(masa).map((e) => e.target);
    for (const target of targets) {
      expect(isAllowedTarget(target), target).toBe(true);
      expect(CONDITION_RULES[target], target).toBeDefined();
    }
    expect(adnanKhalidDialogue.lines[2]!.exercise.target).toBe(nazikDinaDialogue.lines[2]!.exercise.target);
  });

  it("لاحظ القواعد: the evening greeting and its answer; asking the name – masculine and feminine", () => {
    const grammar = stepOf(masa, "step-5", "table");
    expect(grammar.tables.map((t) => [t.titleArabic, t.rows.map((r) => r.map((c) => `${c.arabic}${c.gender ? `:${c.gender}` : ""}`))])).toEqual([
      ["١) لِلتَّحِيَّةِ فِي الْمَسَاءِ:", [["مَسَاءُ الْخَيْرِ", "مَسَاءُ النُّورِ"]]],
      ["٢) لِلسُّؤَالِ عَنِ الِاسْمِ", [["مَا اسْمُكَ؟:m", "مَا اسْمُكِ؟:f"]]],
    ]);
    expect(grammar.tables[1]!.columns.map((c) => c.arabic)).toEqual(["الْمُفْرَدُ الْمُذَكَّرُ", "الْمُفْرَدُ الْمُؤَنَّثُ"]);
  });

  it("تذكر: long and short vowels, greeting and getting to know each other, asking the name", () => {
    const remember = stepOf(masa, "step-11", "table");
    expect(remember.tables.map((t) => t.rows.map((r) => r.map((c) => c.arabic)))).toEqual([
      [["بَا", "بَ"], ["بُو", "بُ"], ["بِي", "بِ"]],
      [["صَبَاحُ الْخَيْرِ.", "صَبَاحُ النُّورِ."], ["مَسَاءُ الْخَيْرِ.", "مَسَاءُ النُّورِ."], ["كَيْفَ حَالُكَ؟", "بِخَيْرٍ، الْحَمْدُ لِلَّهِ."], ["كَيْفَ حَالُكِ؟", "بِخَيْرٍ، الْحَمْدُ لِلَّهِ."]],
      [["مَا اسْمُكَ؟", "اسْمِي …"], ["مَا اسْمُكِ؟", "اسْمِي …"]],
    ]);
    for (const cell of remember.tables.flatMap((t) => t.rows.flat())) if (cell.listen !== false) expect(isAllowedTtsText(cell.arabic), cell.arabic).toBe(true);
  });

  it("Übung 2 and 3 look in BOTH conversations: 5 × د (no ذ there), 15 × و / ي; the other letters as an optional repeat", () => {
    const two = stepOf(masa, "step-8", "letter-find").find;
    const three = stepOf(masa, "step-9", "letter-find").find;
    const count = (find: typeof two, accepts = find.accepts) => targetKeys(findLines([find.dialogue, ...(find.more ?? [])].flatMap((d) => d.lines), accepts)).length;
    expect(count(two)).toBe(5);
    expect(count(two, ["ذ"])).toBe(0);
    expect(count(three)).toBe(15);
    expect(three.extra!.map((e) => e.letter)).toEqual(["ا", "ب", "ت", "ث", "ج", "ح", "خ"]);
  });

  it("the teacher's note: the words with a long vowel in the conversations, and which letter makes it long", () => {
    const pick = stepOf(masa, "step-10", "word-pick").pick;
    const found = pickTokens(pick).filter((t) => t.target);
    expect([...new Set(found.map((t) => t.word))]).toEqual(["مَسَاءُ", "النُّورِ", "حَالُكَ", "مَا", "اسْمِي", "خَالِد", "عَدْنَان", "حَالُكِ", "دِينَا", "نَازِك"]);
    expect(found.find((t) => t.word === "دِينَا")!.madd).toEqual(["ya", "alif"]);
    expect(found.find((t) => t.word === "النُّورِ")!.madd).toEqual(["waw"]);
  });
});

// ---------------------------------------------------------------------------
describe("the new step types", () => {
  it("MatchStep: a wrong pair is marked and can be changed – as often as needed; done when all are right; the joined word appears", () => {
    const match = stepOf(entry("huruf-al-madd"), "step-10", "match").match;
    render(<MatchStep match={match} progressKey={KEY} />);
    expect(screen.getByTestId("match-prompt-rida")).toHaveAttribute("data-status", "example");
    expect(screen.getByTestId("match-check")).toBeDisabled();
    // The first open row is active; give it a wrong word, then the rest right.
    fireEvent.click(screen.getByTestId("match-option-jab")); // tut ← جَاب (wrong)
    for (const p of match.prompts.filter((p) => !p.example && p.id !== "tut")) {
      fireEvent.click(screen.getByTestId(`match-prompt-${p.id}`));
      fireEvent.click(screen.getByTestId(`match-option-${p.answer}`));
    }
    fireEvent.click(screen.getByTestId("match-check"));
    expect(screen.getByTestId("match-prompt-tut")).toHaveAttribute("data-status", "wrong");
    expect(screen.getByTestId("match-feedback")).toHaveTextContent("9 von 10 richtig");
    expect(getLessonProgress(KEY).completedAt).toBeUndefined();
    fireEvent.click(screen.getByTestId("match-prompt-tut"));
    fireEvent.click(screen.getByTestId("match-option-tut"));
    fireEvent.click(screen.getByTestId("match-check"));
    expect(screen.getByTestId("match-done")).toBeInTheDocument();
    expect(screen.getByTestId("match-result-tut")).toHaveTextContent("تُوت");
    expect(getLessonProgress(KEY).completedAt).toBeTruthy();
  });

  it("WordPickStep (تدريب ٧): a wrong word is shown red and can be removed; done with exactly the three words", () => {
    const pick = stepOf(entry("huruf-al-madd"), "step-9", "word-pick").pick;
    render(<WordPickStep pick={pick} progressKey={KEY} />);
    const word = (arabic: string) => screen.getAllByTestId(/^pick-word-/).find((b) => b.textContent === arabic)!;
    fireEvent.click(word("بَيْت"));
    fireEvent.click(word("بَاب")); // has an ā
    fireEvent.click(screen.getByTestId("pick-check"));
    expect(screen.getByTestId("pick-feedback")).toHaveTextContent("1 von 3 richtig. Es fehlen noch 2.");
    expect(screen.getByTestId("pick-wrong")).toHaveTextContent("diese Wörter haben einen Dehnungsbuchstaben");
    expect(word("بَاب")).toHaveAttribute("data-tone", "wrong");
    fireEvent.click(word("بَاب"));
    fireEvent.click(word("أَخَذَ"));
    fireEvent.click(word("بَخْت"));
    fireEvent.click(screen.getByTestId("pick-check"));
    expect(screen.getByTestId("pick-done")).toBeInTheDocument();
    expect(getLessonProgress(KEY).completedAt).toBeTruthy();
  });

  it("WordPickStep (long vowels in the conversations): find the words, then say ا, و or ي for each", () => {
    const pick = stepOf(entry("masa-al-khayr"), "step-10", "word-pick").pick;
    render(<WordPickStep pick={pick} progressKey={KEY} />);
    for (const t of pickTokens(pick).filter((t) => t.target)) fireEvent.click(screen.getByTestId(`pick-word-${t.key}`));
    fireEvent.click(screen.getByTestId("pick-check"));
    expect(screen.getByTestId("pick-kinds")).toBeInTheDocument();
    expect(getLessonProgress(KEY).completedAt).toBeUndefined();
    const words = [...new Map(pickTokens(pick).filter((t) => t.target).map((t) => [t.word, t])).values()];
    // One wrong answer first.
    fireEvent.click(screen.getByTestId("pick-kind-دِينَا-ya"));
    fireEvent.click(screen.getByTestId("pick-kinds-check"));
    expect(screen.getByTestId("pick-kind-دِينَا")).toHaveAttribute("data-verdict", "wrong"); // ي AND ا
    for (const t of words) for (const kind of t.madd) if (!(t.word === "دِينَا" && kind === "ya")) fireEvent.click(screen.getByTestId(`pick-kind-${t.word}-${kind}`));
    fireEvent.click(screen.getByTestId("pick-kinds-check"));
    expect(screen.getByTestId("pick-done")).toBeInTheDocument();
    expect(getLessonProgress(KEY).completedAt).toBeTruthy();
  });

  it("TableStep: the tables with masculine / feminine marks and Anhören; the check needs every answer right", async () => {
    const grammar = stepOf(entry("masa-al-khayr"), "step-5", "table");
    render(<TableStep tables={grammar.tables} quiz={grammar.quiz} progressKey={KEY} />);
    expect(screen.getByTestId("table-cell-name-0-0")).toHaveAttribute("data-gender", "m");
    expect(screen.getByTestId("table-cell-name-0-1")).toHaveAttribute("data-gender", "f");
    fireEvent.click(within(screen.getByTestId("table-cell-evening-0-1")).getByRole("button"));
    await waitFor(() => expect(tts.spoken).toEqual(["مَسَاءُ النُّورِ"]));
    fireEvent.click(screen.getByTestId("quiz-reply-option-1")); // صَبَاحُ النُّورِ – wrong
    expect(screen.getByTestId("quiz-reply")).toHaveAttribute("data-correct", "false");
    fireEvent.click(screen.getByTestId("quiz-reply-option-0"));
    fireEvent.click(screen.getByTestId("quiz-ask-man-option-1"));
    expect(getLessonProgress(KEY).completedAt).toBeUndefined();
    fireEvent.click(screen.getByTestId("quiz-ask-woman-option-0"));
    expect(screen.getByTestId("table-quiz-count")).toHaveTextContent("3 von 3 richtig");
    expect(getLessonProgress(KEY).completedAt).toBeTruthy();
  });

  it("LetterFindStep over both conversations; an extra letter is practice only", () => {
    const find = stepOf(entry("masa-al-khayr"), "step-9", "letter-find").find;
    render(<LetterFindStep find={find} progressKey={KEY} />);
    expect(screen.getByTestId("find-goal")).toHaveTextContent("Finde alle 15 × و / ي (Waw und Ya) in den Dialogen.");
    expect(screen.getByTestId("find-dialogue-adnan-khalid")).toBeInTheDocument();
    expect(screen.getByTestId("find-dialogue-nazik-dina")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("find-target-2")); // ب
    expect(screen.getByTestId("find-extra-note")).toBeInTheDocument();
    const bas = document.querySelectorAll('[data-testid^="find-tile-"][data-target="true"]');
    expect(bas).toHaveLength(2); // بِخَيْرٍ twice
    bas.forEach((b) => fireEvent.click(b));
    fireEvent.click(screen.getByTestId("find-check"));
    expect(screen.getByTestId("find-done")).toBeInTheDocument();
    expect(getLessonProgress(KEY).completedAt).toBeUndefined(); // not the book's letter
    fireEvent.click(screen.getByTestId("find-target-0"));
    document.querySelectorAll('[data-testid^="find-tile-"][data-target="true"]').forEach((b) => fireEvent.click(b));
    fireEvent.click(screen.getByTestId("find-check"));
    expect(getLessonProgress(KEY).completedAt).toBeTruthy();
  });

  it("GapsStep (dictation): each gap offers its own tiles; a long vowel letter without sign is explained", async () => {
    const step = stepOf(entry("dhal"), "step-8", "gaps");
    const gaps = { ...step.gaps, items: [step.gaps.items[7]!] }; // ابْن: ا (no sign), then بْ
    render(<GapsStep gaps={gaps} availableAudio={[]} progressKey={KEY} />);
    fireEvent.click(await screen.findByTestId("start-button"));
    const choices = () => screen.getAllByTestId(/^choice-/).map((c) => c.getAttribute("data-choice"));
    await waitFor(() => expect(choices()).toEqual(["ا", "و", "ي"]));
    const answer = (c: string) => {
      fireEvent.click(document.querySelector(`[data-choice="${c}"]`)!);
      fireEvent.click(document.querySelector('[data-testid="gap-slot"][data-active="true"]')!);
    };
    answer("و");
    answer("ي"); // second wrong → explanation for a letter without sign
    await waitFor(() => expect(screen.getByTestId("gap-caption")).toHaveTextContent("ohne Vokalzeichen"));
    answer("ا");
    await waitFor(() => expect(choices()).toEqual(["بَ", "بِ", "بُ", "بْ", "تْ", "ثْ"]));
    answer("بْ");
    expect(screen.getByTestId("gap-shaped")).toHaveTextContent("ابْن");
  });
});

describe("audio texts", () => {
  it("every text Lektion 2 speaks is on the TTS allow-list (no other text can be synthesised)", () => {
    const texts = a1SpokenTexts();
    for (const lesson of a1Unit2.lessons) {
      for (const exercise of a1LessonExercises(lesson)) expect(isAllowedTtsText(exercise.modelText), exercise.modelText).toBe(true);
    }
    for (const text of ["دُولَاب", "مَدْرَسَة", "بَب", "يَاسَمِنُ", "تُوت", "مَسَاءُ الْخَيْرِ", "بِي", "تَاج"]) expect(texts, text).toContain(text);
    expect(isAllowedTtsText("ein beliebiger Text")).toBe(false);
  });
});
