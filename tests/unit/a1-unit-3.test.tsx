import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// A1 · Lektion 5 and 6 = Unit 3 of "لغتنا الفصحى 1" (book pages 91–121, PDF
// 123–153), checked against the book: the letters ه ط ظ ع غ with their words
// and every exercise, "مَنْ هُوَ؟", الشدة والتاء المربوطة, the general review,
// "مِنْ أَيْنَ أَنْتَ؟" with the two Lam, تذكر and the alphabet; the new step
// type "order". MOCKED: /api/tts (speakArabic).

vi.mock("@/lib/tts/player", () => ({
  speakArabic: vi.fn(async () => undefined),
  speechUrl: vi.fn(async (text: string) => `blob:${text}`),
  stopSpeaking: vi.fn(),
}));

import { OrderStep } from "@/components/a1/order/order-step";
import { getA1Lesson, getA1Unit, nextA1Entry } from "@/data/a1";

import { isSunLetterWord } from "@/data/a1/unit-3/min-ayna";
import type { A1Lesson, A1Step } from "@/data/types";
import { transliterate } from "@/lib/arabic/transliterate";
import { getLessonProgress } from "@/lib/progress";
import { withTanwin } from "@/lib/arabic/tanwin";

// The units as the app shows them (vocabulary words with Tanwin, src/data/vocabulary-tanwin.ts).
const a1Unit5 = getA1Unit("lesson-5")!;
const a1Unit6 = getA1Unit("lesson-6")!;

const KEY = "a1/lesson-5/test/step-x";
const stepOf = <K extends A1Step["kind"]>(lesson: A1Lesson, slug: string, kind: K) => {
  const step = lesson.steps.find((s) => s.slug === slug)!;
  if (step.kind !== kind) throw new Error(`${lesson.slug}/${slug} must be ${kind}, is ${step.kind}`);
  return step as Extract<A1Step, { kind: K }>;
};
const entry = (unit: string, slug: string) => getA1Lesson(unit, slug)!;
const words = (unit: string, slug: string, step: string) => {
  const s = entry(unit, slug).steps.find((x) => x.slug === step)!;
  if (s.kind !== "gaps") throw new Error("gaps expected");
  return s.gaps.items.map((i) => i.arabic);
};

beforeEach(() => window.localStorage.clear());
afterEach(cleanup);

describe("placement and order", () => {
  it("Unit 3 is Lektion 5 (تقديم ١) and 6 (تقديم ٢) with the book's labels, after Lektion 4", () => {
    expect([a1Unit5, a1Unit6].map((u) => [u.slug, u.number, u.bookLabel, u.title])).toEqual([
      ["lesson-5", 5, "الْوَحْدَةُ الثَّالِثَةُ – تَقْدِيمٌ (١)", "مَنْ هُوَ؟"],
      ["lesson-6", 6, "الْوَحْدَةُ الثَّالِثَةُ – تَقْدِيمٌ (٢)", "مِنْ أَيْنَ أَنْتَ؟"],
    ]);
    expect(a1Unit5.lessons.map((l) => [l.slug, l.label])).toEqual([["ha", "ه"], ["tta", "ط"], ["zza", "ظ"], ["ain", "ع"], ["ghain", "غ"], ["man-huwa", "مَنْ هُوَ؟"]]);
    expect(a1Unit6.lessons.map((l) => l.slug)).toEqual(["shadda", "muraja-amma", "min-ayna-anta", "al-huruf"]);
    expect(nextA1Entry("lesson-5", "man-huwa")).toMatchObject({ unit: { slug: "lesson-6" }, lesson: { slug: "shadda" } });
  });
});

// (١) النطق: the book's nine words per letter, rows Fatha / Kasra / Damma, right to left.
const WORDS: Record<string, string[][]> = {
  ha: [["هَرَم", "هَمْزَة", "هَدِيَّة"], ["هِلَال", "هِنْدِي", "هِلْب"], ["هُنُود", "هُدْهُد", "هُدَى"]],
  tta: [["طَمَاطِم", "طَائِرَة", "طَبَق"], ["طِفْل", "طِين", "طِشْت"], ["طُيُور", "طُبُول", "طُورْبِيد"]],
  zza: [["ظَرْف", "ظَبْي", "ظَهْر"], ["ظِلّ", "ظِلَال", "ظِلْف"], ["ظُرُوف", "ظُفْر", "ظُهْر"]],
  ain: [["عَلَم", "عَيْن", "عَظْمَة"], ["عِمَارَة", "عِمَارَات", "عِظَام"], ["عُود", "عُمْلَة", "عُلْبَة"]],
  ghain: [["غَيْمَة", "غَسَّالَة", "غَزَال"], ["غِزْلَان", "غِرْبَان", "غِرَاء"], ["غُصْن", "غُيُوم", "غُرْفَة"]],
};
// تدريب ٨ – the words of „حل تدريب ٨“ (final consonants with Sukun).
const DICTATION: Record<string, string[]> = {
  ha: ["هُوَ", "هِشَامْ", "إِلْهَامْ", "مُهِمّ", "هُنَاكْ", "وُجُوهْ", "عِنْدَهُمْ", "لَهُ", "قَمِيصُهُ", "قَصْرُهُ"],
  tta: ["طَارِقْ", "إِفْطَارْ", "طَرِيقْ", "مَطَرْ", "بَطَاطِسْ", "طَمَاطِمْ", "طَبَقْ", "أَطْبَاقْ", "طُورْبِيدْ", "بَطَاطَا"],
  zza: ["ظَرِيفْ", "أَظْهَرْ", "ظِلَالْ", "قَيْظْ", "الظُّهُورْ", "الظَّهْرْ", "ظُرُوفْ", "ظَاهِرْ"],
  ain: ["عَامِلْ", "وَاعِظْ", "عِمَارَاتْ", "عِظَامْ", "الْعِلْمْ", "ضِلْعْ", "ذِرَاعْ"],
  ghain: ["أَغْصَانْ", "غِزْلَانْ", "حُجُرَاتْ", "فَرَاغْ", "غَالِي", "صَمْغْ", "يُصْغِي", "أَسْمَاكْ"],
};
// تدريب ٩ – the difference between two letters: the pairs of „حل تدريب ٩“.
const PAIRS: Record<string, string[]> = {
  ha: ["هِشَام", "حُسَام", "هَرَم", "حَرَم", "هِلَال", "حِمَار", "حُوت", "هِلْب", "مُهِمّ", "مُحْتَرَم", "حَيَاة", "هُيَام"],
  tta: ["تِمْثَال", "طَرِيق", "تُونَة", "طُيُور", "تِين", "طِين", "تَمْر", "طَبَق", "طِفْل", "تَلّ", "طُورْبِيد", "تُوت", "تَاج", "طَمَاطِم", "تِلِيفُون", "طُبُول"],
  zza: ["ذُبَاب", "ظِبَاء", "ذُيُول", "ظُرُوف", "ظَرْف", "ذَيْل", "ذِرَاع", "ظِلَال", "ظُهْر", "ذَقْن", "ظَهْر", "ذُرَة", "ظِلّ", "ذِئْب"],
  ain: ["عَادِل", "أَحْمَد", "عُيُون", "أُسَامَة", "أُمّ", "عُمْلَة", "عَمَل", "أَمَل", "إِنَارَة", "عِمَارَة"],
};

describe.each(Object.keys(WORDS))("the letter %s", (slug) => {
  const lesson = entry("lesson-5", slug);
  const letter = lesson.letter!.glyph;

  it("(١) النطق: the sound with Fatha, Kasra, Damma and the book's nine words", () => {
    const step = stepOf(lesson, "step-1", "sound-words");
    expect(step.groups.map((g) => g.sound.glyph)).toEqual([letter + "َ", letter + "ِ", letter + "ُ"]);
    expect(step.groups.map((g) => g.words.map((w) => w.arabic))).toEqual(WORDS[slug]!.map((g) => g.map(withTanwin)));
  });

  it("steps in book order: Wörter, Formen, Schreiben (١), Ergänzen (٢), Hören (٣), (٤), Diktat (٨), then (٩)", () => {
    const labels = lesson.steps.map((s) => s.navLabel);
    expect(labels.slice(0, 5)).toEqual(["Wörter", "Formen", "Schreiben", "Ergänzen", "Hören"]);
    expect(labels).toContain("Diktat");
    expect(labels.at(-1)).toBe(slug === "ghain" ? "Alle Buchstaben" : "Unterschied");
    expect(lesson.steps.find((s) => s.navLabel?.startsWith("Nachsprechen"))!.instruction?.note).toContain("Übungen 5–7");
  });

  it("تدريب ٨: the dictation words of „حل تدريب ٨“, every letter a gap", () => {
    const dictation = lesson.steps.find((s) => s.navLabel === "Diktat")!;
    expect(dictation.kind === "gaps" && dictation.gaps.items.map((i) => [i.arabic, i.pattern!.replace(/_/g, "").length])).toEqual(DICTATION[slug]!.map((w) => [w, 0]));
  });

  if (PAIRS[slug]) {
    it("تدريب ٩: the pairs of „حل تدريب ٩“; both letters are offered for every gap", () => {
      const step = lesson.steps.at(-1)!;
      if (step.kind !== "gaps") throw new Error("gaps");
      expect(step.gaps.items.map((i) => i.arabic)).toEqual(PAIRS[slug]);
      for (const item of step.gaps.items) expect(item.gapChoices!.flat().join("")).toMatch(new RegExp(`${letter}`));
    });
  }
});

describe("exercise lists exactly as in the book (samples)", () => {
  it("ه: تدريب ٤ – the 15 names and words; the Sukun word أَهْلاً is the tenth of تدريب ٣", () => {
    expect(words("lesson-5", "ha", "step-6")).toEqual(["هِشَام", "هَانِم", "مُهَاب", "هِبَة", "إِلْهَام", "سِهَام", "هَانِي", "أَهْلاً وَسَهْلاً", "مُهِمّ", "هُمُوم", "هُوَ", "هِيَ", "هُمْ", "هُمَا", "هَنَاء"]);
    expect(words("lesson-5", "ha", "step-5").at(-1)).toBe("أَهْلاً");
    // تدريب ٨ (ب): read the words again and pronounce them (evaluated)
    expect(stepOf(entry("lesson-5", "ha"), "step-8", "phrases").groups[0]!.items.map((i) => i.arabic)).toEqual(DICTATION.ha!.map((w) => w.replace(/ْ$/, "")));
  });

  it("ظ: تدريب ٢ in the book's order; تدريب ٤ only asks to repeat (no writing): an evaluated phrase step", () => {
    expect(words("lesson-5", "zza", "step-4")).toEqual(["ظِلّ", "ظَرْف", "ظَبْي", "ظَهْر", "ظُرُوف", "ظُفْر", "ظِلْف", "ظِلَال", "ظُهْر"]);
    expect(words("lesson-5", "zza", "step-5")).toEqual(["ظُرُوف", "ظِلّ", "ظَهْر", "ظِلَال", "ظُهْر", "ظِلْف", "ظَبْي", "ظُفْر", "ظَرْف", "أَظْهَر"]);
    expect(stepOf(entry("lesson-5", "zza"), "step-6", "phrases").groups[0]!.items.map((i) => i.arabic)).toEqual(["ظُهُور", "ظَرِيف", "عَظْم", "وَعْظ", "ظَاهِر", "ظُرُوف", "ظِبَاء", "عَظِيم", "عَظَمَة", "ظُفْر"]);
  });

  it("ع and غ: تدريب ٣ with the Sukun word أَعْلَم / أَغْصَان; غ ends with the general drill on all letters (16 words)", () => {
    expect(words("lesson-5", "ain", "step-5")).toEqual(["عِظَام", "عَلَم", "عِمَارَة", "عُود", "عَيْن", "عُلْبَة", "عِمَارَات", "عُمْلَة", "عَظْمَة", "أَعْلَم"]);
    expect(words("lesson-5", "ghain", "step-5")).toEqual(["غُصْن", "غَيْمَة", "غَزَال", "غُرْفَة", "غَسَّالَة", "غِرْبَان", "غِرَاء", "غِزْلَان", "غُيُوم", "أَغْصَان"]);
    expect(words("lesson-5", "ghain", "step-8")).toEqual(["بَابْ", "مَكْتَبْ", "غَزَالْ", "ثَلَاثِينْ", "جُنُودْ", "حُجُرَاتْ", "خِطَابْ", "ذِرَاعْ", "يُوسُفِيّ", "هَرَمْ", "قَمِيصْ", "طَمَاطِمْ", "ظُهْرْ", "شِيبْسِي", "ضَابِطْ", "ضَبْعْ"]);
  });

  it("the positions tables: ه has no dots at the end (note); ع ends with وَدَع", () => {
    const ha = stepOf(entry("lesson-5", "ha"), "step-2", "positions").positions;
    expect(ha.rule?.german).toContain("keine zwei Punkte");
    // With Tanwin where a noun takes it (not the particles عِنْدَه, مَعَ, nor الْعَلَم with its article).
    expect(ha.items.map((i) => i.word)).toEqual(["هَرَمٌ", "سِهَامٌ", "وَجْهٌ", "عِنْدَه"]);
    expect(stepOf(entry("lesson-5", "ain"), "step-2", "positions").positions.items.map((i) => i.word)).toEqual(["عَلَمٌ", "الْعَلَم", "مَعَ", "وَدَعٌ"]);
  });
});

describe("مَنْ هُوَ؟ – conversation and exercises", () => {
  const lesson = entry("lesson-5", "man-huwa");

  it("presentations (أ) and (ب): questions about one, two and three people – the book's lines", () => {
    const a = stepOf(lesson, "step-1", "dialogue").dialogue;
    expect(a.lines.map((l) => l.arabic)).toEqual([
      "مَنْ هُوَ؟ مَا اسْمُهُ؟", "هُوَ أَحْمَد. اسْمُهُ أَحْمَد.",
      "مَنْ هُمَا؟ مَا اسْمَاهُمَا؟", "هُمَا سَمِير وَمَجْدِي. اسْمَاهُمَا سَمِير وَمَجْدِي.",
      "مَنْ هُمْ؟ مَا أَسْمَاؤُهُمْ؟", "هُمْ نَبِيل وَرِفْعَت وَمُصْطَفَى. أَسْمَاؤُهُمْ نَبِيل وَرِفْعَت وَمُصْطَفَى.",
    ]);
    const b = stepOf(lesson, "step-3", "dialogue").dialogue;
    expect(b.lines.filter((_, i) => i % 2 === 1).map((l) => l.arabic)).toEqual([
      "هِيَ سَلْوَى. اسْمُهَا سَلْوَى.", "هُمَا نَرْمِين وَإِيمَان. اسْمَاهُمَا نَرْمِين وَإِيمَان.", "هُنَّ حَنَان وَنَجْوَى وَفَاطِمَة. أَسْمَاؤُهُنَّ حَنَان وَنَجْوَى وَفَاطِمَة.",
    ]);
    expect(lesson.steps.map((s) => s.kind)).toEqual(["dialogue", "dialogue", "dialogue", "dialogue", "dialogue", "dialogue", "table", "order", "cloze", "cloze", "cloze"]);
  });

  it("grammar: the pronouns of the 3rd person with their possessive forms", () => {
    const table = stepOf(lesson, "step-7", "table").tables[0]!;
    expect(table.rows.map((r) => r.slice(1).map((c) => c.arabic))).toEqual([
      ["هُوَ", "اسْمُهُ", "هُمَا", "اسْمَاهُمَا", "هُمْ", "أَسْمَاؤُهُمْ"],
      ["هِيَ", "اسْمُهَا", "هُمَا", "اسْمَاهُمَا", "هُنَّ", "أَسْمَاؤُهُنَّ"],
    ]);
  });

  it("تدريب ٢: the four printed lines; both orders (Q → A) are right", () => {
    const { order } = stepOf(lesson, "step-8", "order");
    expect(order.items.map((i) => i.arabic)).toEqual(["هُوَ اسْمُهُ خَالِد.", "يَا عَلِيُّ! مَنْ هُوَ؟ مَا اسْمُهُ؟", "هِيَ اسْمُهَا زَيْنَب.", "يَا فَاطِمَةُ – مَنْ هِيَ؟ مَا اسْمُهَا؟"]);
    expect(order.solutions).toEqual([["line-2", "line-1", "line-4", "line-3"], ["line-4", "line-3", "line-2", "line-1"]]);
  });

  it("تدريب ٣ and ٤: the question for one / two / three men or women", () => {
    const pictures = stepOf(lesson, "step-10", "cloze").items;
    const firstGap = (item: (typeof pictures)[number]) => item.lines[0]!.parts.find((p) => typeof p !== "string") as { accept: string[] } | undefined;
    expect(pictures.map((p) => firstGap(p)?.accept[0] ?? "model")).toEqual(["model", "مَا اسْمُهَا؟", "مَا أَسْمَاؤُهُنَّ؟", "مَا اسْمُهُ؟", "مَا اسْمَاهُمَا؟", "مَا أَسْمَاؤُهُمْ؟"]);
    const questions = stepOf(lesson, "step-11", "cloze").items;
    expect(questions.map((q) => [(q.lines[0]!.parts[0] as { accept: string[] }).accept[0], q.lines[1]!.parts[0]])).toEqual([
      ["مَا أَسْمَاؤُهُمْ؟", "نَاجِي وَعَادِل وَمُصْطَفَى."],
      ["مَا أَسْمَاؤُهُنَّ؟", "زَيْنَب وَفَرِيدَة وَإِيمَان."],
      ["مَا اسْمَاهُمَا؟", "أَحْمَد وَعَلِيّ."],
      ["مَا اسْمُهُ؟", "سَمِير."],
      ["مَا اسْمُهَا؟", "هِنْد."],
      ["مَا اسْمَاهُمَا؟", "دَلَال وَعُلَا."],
    ]);
  });
});

describe("Lektion 6 – Shadda, review, مِنْ أَيْنَ أَنْتَ؟, alphabet", () => {
  it("الشدة والتاء المربوطة: the nine words in book order; تدريب ٢ writes the printed letters as one word", () => {
    const lesson = entry("lesson-6", "shadda");
    expect(stepOf(lesson, "step-1", "words").groups[0]!.words.map((w) => w.arabic)).toEqual(["سَبُّورَة", "نَظَّارَة", "سَيَّارَة", "سَيِّدَة", "غَسَّالَة", "ثَلَّاجَة", "هَدِيَّة", "شُبَّاك", "سُكَّر"].map(withTanwin));
    expect(stepOf(lesson, "step-4", "gaps").gaps.items.map((i) => [i.hint, i.arabic])).toEqual([
      ["س ب ب و ر ة", "سَبُّورَة"], ["غ س س ا ل ة", "غَسَّالَة"], ["س ك ك ر", "سُكَّرْ"], ["ت ف ف ا ح ة", "تُفَّاحَة"], ["ث ل ل ا ج ة", "ثَلَّاجَة"],
    ]);
  });

  it("the general review: خ or غ – the solutions of the book", () => {
    expect(words("lesson-6", "muraja-amma", "step-1")).toEqual(["غَزَال", "غِرْبَان", "بَطِّيخْ", "غُيُوم", "خَاتَم", "غِرَاء", "خَرُوف", "خِيَار"]);
  });

  it("the two conversations: Ahmad / Abdullah and Farida / Hana", () => {
    const lesson = entry("lesson-6", "min-ayna-anta");
    expect(stepOf(lesson, "step-1", "dialogue").dialogue.lines.map((l) => l.speaker)).toEqual(["ahmad", "abdullah", "ahmad", "abdullah", "ahmad", "abdullah"]);
    expect(stepOf(lesson, "step-4", "dialogue").dialogue.lines[3]!.arabic).toBe("أَنَا مِنَ الْمَغْرِبِ.");
  });

  it("the two Lam: the book's tables (14 moon, 13 sun) and the classification of تدريب ١ and ٣", () => {
    const lesson = entry("lesson-6", "min-ayna-anta");
    const tables = stepOf(lesson, "step-7", "table").tables;
    expect(tables.find((t) => t.id === "moon")!.rows.flat()).toHaveLength(14);
    expect(tables.find((t) => t.id === "sun")!.rows.flat().filter((c) => c.arabic)).toHaveLength(13);
    const sun = (items: { arabic: string; questions: { answer: number }[] }[]) => items.filter((i) => i.questions[0]!.answer === 0).map((i) => i.arabic);
    expect(sun(stepOf(lesson, "step-8", "quiz").items)).toEqual(["التَّحْرِير", "الدُّقِّي", "الزَّمَالِك", "الشِّيشَان", "السُّودَان", "الرِّيَاض", "الظَّهْرَان", "الدَّوْحَة", "الشَّارِقَة", "الضَّبْعَة"]);
    const article = stepOf(lesson, "step-9", "quiz").items;
    expect(article).toHaveLength(31);
    expect(sun(article)).toHaveLength(16);
    expect(isSunLetterWord("الْقَمَر")).toBe(false);
    expect(isSunLetterWord("الشَّمْس")).toBe(true);
    expect(isSunLetterWord("اللَّيْمُون")).toBe(true);
  });

  it("the alphabet: 28 letters with four forms each", () => {
    const table = stepOf(entry("lesson-6", "al-huruf"), "step-1", "table").tables[0]!;
    expect(table.rows).toHaveLength(28);
    expect(table.rows.every((r) => r.length === 4)).toBe(true);
  });
});

describe("transliteration (Alif's convention)", () => {
  it.each([
    ["رُخْصَة", "Rukhṣa"],
    ["شُرْطِيّ", "Shurṭiyy"],
    ["الصِّين", "Aṣ-ṣīn"],
    ["أَهْلاً وَسَهْلاً", "Ahlan wasahlan"],
    ["هُدَى", "Hudā"],
    ["مَنْ هُوَ؟ مَا اسْمُهُ؟", "Man huwa? Ma-smuhu?"],
    ["عِنْدَهُم", "ʿIndahum"],
  ])("%s → %s", (arabic, latin) => expect(transliterate(arabic)).toBe(latin));
});

describe("OrderStep (اقرأ ورتب الحوار)", () => {
  const order = { items: [{ id: "a", arabic: "جَوَاب", german: "Antwort" }, { id: "q", arabic: "سُؤَال؟", german: "Frage" }], solutions: [["q", "a"]] };

  it("a line that cannot come next is marked and not taken; the right order completes the step; unlimited tries", () => {
    render(<OrderStep order={order} progressKey={KEY} />);
    fireEvent.click(screen.getByTestId("order-item-a"));
    expect(screen.getByTestId("order-item-a")).toHaveAttribute("data-state", "wrong");
    expect(screen.getByTestId("order-wrong")).toBeInTheDocument();
    expect(screen.queryByTestId("order-chosen-a")).toBeNull();
    fireEvent.click(screen.getByTestId("order-item-q"));
    expect(screen.getByTestId("order-chosen-q")).toBeInTheDocument();
    expect(getLessonProgress(KEY).completedAt).toBeUndefined();
    fireEvent.click(screen.getByTestId("order-item-a"));
    expect(screen.getByTestId("order-chosen-a")).toBeInTheDocument();
    expect(getLessonProgress(KEY).completedAt).toBeDefined();
    expect(screen.getByTestId("step-completed")).toBeInTheDocument();
  });

  it("Neu anfangen clears the order", () => {
    render(<OrderStep order={order} progressKey={KEY} />);
    fireEvent.click(screen.getByTestId("order-item-q"));
    fireEvent.click(screen.getByTestId("order-reset"));
    expect(screen.queryByTestId("order-chosen-q")).toBeNull();
  });
});
