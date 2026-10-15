import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { existsSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// A1 · Lektion 3 und 4 = the book's Unit 2 ("وجدي.pdf", 46 PDF pages, book
// pages 44–89) – checked against the book: the letters ر ز س ش ص ض ف ق ك ل م ن
// with their words, pictures and every exercise in book order, the general
// review, all conversations, the grammar and the final exercises; and the new
// step types (spell, quiz, cloze). MOCKED: /api/tts (speakArabic). The
// dialogue flows with mocked microphone and evaluation are in a1-dialogue.test.tsx.

const tts = vi.hoisted(() => ({ spoken: [] as string[] }));
vi.mock("@/lib/tts/player", () => ({
  speakArabic: vi.fn(async (text: string) => void tts.spoken.push(text)),
  speechUrl: vi.fn(async (text: string) => `blob:${text}`),
  stopSpeaking: vi.fn(),
}));

import A1StepPage from "@/app/a1/[unit]/[lesson]/[step]/page";
import { ClozeStep } from "@/components/a1/cloze/cloze-step";
import { QuizStep } from "@/components/a1/quiz/quiz-step";
import { SpellStep } from "@/components/a1/spell/spell-step";
import { A1_LEVEL, a1LessonExercises, getA1Lesson, nextA1Entry } from "@/data/a1";
import { a1Unit3, a1Unit4 } from "@/data/a1/unit-2";
import { manAntaA, manAntaB, suziDialogue, wajdiDialogue } from "@/data/a1/unit-2/conversations";
import { longSyllables } from "@/data/a1/unit-2/letter-entry";
import type { A1Lesson, A1Step } from "@/data/types";
import { gapTask } from "@/lib/arabic/gap";
import { positionCards } from "@/lib/arabic/positions";
import { spellLetters } from "@/lib/arabic/spell";
import { getLessonProgress } from "@/lib/progress";
import { CONDITION_RULES, SOUND_RULES } from "@/lib/pronunciation/rules";
import { isAllowedTarget, isAllowedTtsText } from "@/lib/pronunciation/targets";

const PUBLIC = path.join(process.cwd(), "public");
const KEY = "a1/lesson-3/test/step-x";
const stepOf = <K extends A1Step["kind"]>(lesson: A1Lesson, slug: string, kind: K) => {
  const step = lesson.steps.find((s) => s.slug === slug)!;
  if (step.kind !== kind) throw new Error(`${lesson.slug}/${slug} must be ${kind}, is ${step.kind}`);
  return step as Extract<A1Step, { kind: K }>;
};
const entry = (unit: string, slug: string) => getA1Lesson(unit, slug)!;
const letters = [...a1Unit3.lessons, ...a1Unit4.lessons].filter((l) => l.kind === "letter");

beforeEach(() => {
  tts.spoken.length = 0;
  window.localStorage.clear();
});
afterEach(cleanup);

describe("placement and order", () => {
  it("Unit 2 of the book is A1 · Lektion 3 and 4, after Lektion 1 and 2, with the book's labels", () => {
    expect(A1_LEVEL.units.slice(0, 4).map((u) => [u.slug, u.title, u.bookLabel ?? null])).toEqual([
      ["lesson-1", "صَبَاحُ الْخَيْر", null],
      ["lesson-2", "مَسَاءُ الْخَيْر", null],
      ["lesson-3", "هَلْ أَنْتَ وَجْدِي؟", "الْوَحْدَةُ الثَّانِيَةُ – تَقْدِيمٌ (١)"],
      ["lesson-4", "مَنْ أَنْتَ؟", "الْوَحْدَةُ الثَّانِيَةُ – تَقْدِيمٌ (٢)"],
    ]);
  });

  it("the twelve letters in book order (there are no ط ظ ع غ lessons in this unit), then the review and the conversations", () => {
    expect(a1Unit3.lessons.map((l) => [l.slug, l.kind, l.label])).toEqual([
      ["ra", "letter", "ر"], ["zay", "letter", "ز"], ["sin", "letter", "س"], ["shin", "letter", "ش"], ["sad", "letter", "ص"], ["dad", "letter", "ض"],
      ["hal-anta-wajdi", "phrase", "هَلْ أَنْتَ وَجْدِي؟"],
    ]);
    expect(a1Unit4.lessons.map((l) => [l.slug, l.kind, l.label])).toEqual([
      ["fa", "letter", "ف"], ["qaf", "letter", "ق"], ["kaf", "letter", "ك"], ["lam", "letter", "ل"], ["mim", "letter", "م"], ["nun", "letter", "ن"],
      ["muraja-amma", "review", "مُرَاجَعَةٌ عَامَّة"],
      ["man-anta", "phrase", "مَنْ أَنْتَ؟"],
    ]);
  });

  it("navigation: Lektion 2 → 3 → 4 → 5, entry by entry", () => {
    expect(nextA1Entry("lesson-2", "masa-al-khayr")?.lesson.slug).toBe("ra");
    expect(nextA1Entry("lesson-3", "hal-anta-wajdi")).toMatchObject({ unit: { slug: "lesson-4" }, lesson: { slug: "fa" } });
    expect(nextA1Entry("lesson-4", "man-anta")).toMatchObject({ unit: { slug: "lesson-5" }, lesson: { slug: "ha" } });
  });

  it("the last step of Lektion 2 shows \"Weiter: Lektion 3 · ر Ra\"", async () => {
    render(await A1StepPage({ params: Promise.resolve({ unit: "lesson-2", lesson: "masa-al-khayr", step: "step-11" }) }));
    expect(screen.getByTestId("next-entry")).toHaveAttribute("href", "/a1/lesson-3/ra");
    expect(screen.getByTestId("next-entry")).toHaveTextContent("Lektion 3");
  });
});

// (١) النطق of every letter page: [letter, rows of [Arabic, German]] in book order.
const WORDS: Record<string, string[][]> = {
  ra: [["رَجُل", "رَادْيُو", "رَأْس"], ["رِسَالَة", "رِئَة", "رِجْل"], ["رُمَّان", "رُخْصَة", "رُبْع"]],
  zay: [["زَيْت", "زَمِيل", "زَهْرَة"], ["زِير", "زِرّ", "زِرَاعَة"], ["زُمُرُّد", "زُمَلَاء", "زُهُور"]],
  sin: [["سَاعَة", "سَيَّارَة", "سَيِّدَة"], ["سِيجَارَة", "سِنَّارَة", "سِتَارَة"], ["سُوق", "سُلَّم", "سُور"]],
  shin: [["شَجَرَة", "شَارِع", "شَمْس"], ["شِيبْسِي", "شِتَاء", "شِرَاع"], ["شُرْطِيّ", "شُجَيْرَة", "شُبَّاك"]],
  sad: [["صَارُوخ", "صَدِيق", "صَفْحَة"], ["الصِّين", "صِينِيّ", "صِينِيَّة"], ["صُنْدُوق", "صُورَة", "صُوَر"]],
  dad: [["ضَابِط", "ضَيْف", "ضَرْب"], ["ضِرْس", "ضِيَاء", "ضِلْع"], ["ضُرُوس", "ضُبَّاط", "ضُيُوف"]],
  fa: [["فَرَس", "فَاكِهَة", "فَصْل"], ["فِلْفِل", "فِرْقَة", "فِيل"], ["فُلُوس", "فُرْشَاة", "فُرَش"]],
  qaf: [["قَلَم", "قَصْر", "قَرْيَة"], ["قِرْد", "قِصَّة", "قِصَص"], ["قُرُود", "قُنْفُذ", "قُمَاش"]],
  kaf: [["كَلْب", "كَأْس", "كَاهِن"], ["كِتَاب", "كِيس", "كِيلُو"], ["كُتُب", "كُوب", "كُرْسِيّ"]],
  lam: [["لَوْن", "لَيْمُون", "لَبَن"], ["لِسَان", "لِمَاذَا؟", "لِحْيَة"], ["لُعْبَة", "لُبَان", "لُصُوص"]],
  mim: [["مَكْتَب", "مَوْز", "مَقْلَمَة"], ["مِيكَانِيكِيّ", "مِمْحَاة", "مِفْتَاح"], ["مُدِير", "مُسْتَشْفَى", "مُشْط"]],
  nun: [["نَاس", "نَخْلَة", "نَجْم"], ["نِمْرَة", "نِمْر", "نِسْنَاس"], ["نُور", "نُجُوم", "نُوتَة"]],
};

const STEPS = ["Wörter", "Formen", "Schreiben", "Ergänzen", "Hören", "Nachsprechen & schreiben", "Mit Dehnung", "Aussprechen", "Diktat", "Getrennt schreiben"];
const KINDS = ["sound-words", "positions", "writing", "gaps", "gaps", "gaps", "gaps", "phrases", "gaps", "spell"];
const BOOK_EX = [null, null, "(١)", "(٢)", "(٣)", "(٤)", "(٨)", "(٨)", "(٩)", "(١٠)"];

describe.each(letters.map((l) => [l.slug, l] as const))("the letter %s", (slug, lesson) => {
  const letter = lesson.letter!.glyph;

  it("ten steps in book order, each with the book's instruction (exercises 5–7 are the publisher's website)", () => {
    expect(lesson.steps.map((s) => [s.navLabel, s.kind])).toEqual(STEPS.map((n, i) => [n, KINDS[i]]));
    lesson.steps.forEach((s, i) => {
      expect(s.instruction?.german, s.slug).toBeTruthy();
      if (BOOK_EX[i]) expect(s.instruction?.arabic, s.slug).toContain(`تَدْرِيبٌ ${BOOK_EX[i]}`);
    });
    expect(lesson.steps[5]!.instruction?.note).toContain("Übungen 5–7");
  });

  it("(١) النطق: the sound with Fatha, Kasra, Damma and exactly the book's nine words – each with its own existing picture, German, transliteration, a rule", () => {
    const words = stepOf(lesson, "step-1", "sound-words");
    expect(words.groups.map((g) => g.sound.glyph)).toEqual([letter + "َ", letter + "ِ", letter + "ُ"]);
    expect(words.groups.map((g) => g.words.map((w) => w.arabic))).toEqual(WORDS[slug]);
    for (const w of words.groups.flatMap((g) => g.words)) {
      expect(existsSync(path.join(PUBLIC, w.image!.src)), w.image!.src).toBe(true);
      expect(w.german).not.toMatch(/\b(the|and|with)\b/);
      expect(w.transliteration).toMatch(/^[\p{Script=Latin}ʾʿ?-]+$/u);
      expect(CONDITION_RULES[w.exercise.target], w.exercise.target).toBeDefined();
      expect(isAllowedTarget(w.exercise.target)).toBe(true);
      expect(isAllowedTtsText(w.exercise.modelText)).toBe(true);
    }
    for (const g of words.groups) expect(SOUND_RULES[g.sound.glyph], g.sound.glyph).toBeDefined();
  });

  it("(٢) كتابة: the book's table – position, shape, word – and the letter found in each word", () => {
    const { positions } = stepOf(lesson, "step-2", "positions");
    const cards = positionCards(positions);
    expect(cards.length).toBeGreaterThanOrEqual(5);
    for (const card of cards) expect(card.findWord.tiles.find((t) => t.key === card.targetKey)!.letter).toBe(letter);
    for (const item of [...positions.items.map((i) => i.word), positions.sukun.word]) expect(isAllowedTtsText(item), item).toBe(true);
  });

  it("every gap (تدريب ٢، ٣، ٤، ٨، ٩) fits its word; every answer is offered; a letter to write has its sign", () => {
    for (const step of lesson.steps) {
      if (step.kind !== "gaps") continue;
      for (const item of step.gaps.items) {
        const task = gapTask(item);
        task.gaps.forEach((g, n) => {
          expect(item.gapChoices?.[n] ?? item.choices ?? step.gaps.choices, `${step.slug} ${item.arabic}`).toContain(g.answer);
          if (step.slug !== "step-7" && step.slug !== "step-9") expect(g.vowel, `${step.slug} ${item.arabic}`).not.toBe("none");
        });
        expect(isAllowedTtsText(item.spoken ?? item.arabic), item.arabic).toBe(true);
      }
    }
    const fill = stepOf(lesson, "step-4", "gaps");
    expect(fill.gaps.items).toHaveLength(9);
    for (const item of fill.gaps.items) expect(existsSync(path.join(PUBLIC, item.image!.src))).toBe(true);
    expect(stepOf(lesson, "step-5", "gaps").gaps.items).toHaveLength(10);
  });

  it("تدريب ٨: write the long syllables (و ، ا ، ي) and pronounce the short ones", () => {
    expect(stepOf(lesson, "step-7", "gaps").gaps.items.map((i) => i.arabic)).toEqual(longSyllables(letter));
    expect(stepOf(lesson, "step-8", "phrases").groups[0]!.items.map((i) => i.arabic)).toEqual([letter + "ُ", letter + "َ", letter + "ِ"]);
  });

  it("تدريب ٩ and ١٠: the dictation words of „حل تدريب ٩“, then the same words in separate letters", () => {
    const dictation = stepOf(lesson, "step-9", "gaps").gaps.items;
    const spell = stepOf(lesson, "step-10", "spell").words;
    expect(spell.map((w) => w.arabic)).toEqual(dictation.map((i) => i.arabic));
    expect(dictation.length).toBeGreaterThanOrEqual(9);
  });

  it("Schreiben: four forms (two for ر ز), alone first as in the book", () => {
    const { letterSet } = stepOf(lesson, "step-3", "writing");
    expect(letterSet.forms[0]!.glyph).toBe(letter);
    expect(letterSet.forms).toHaveLength(slug === "ra" || slug === "zay" ? 2 : 4);
  });
});

describe("exercise lists exactly as in the book (samples)", () => {
  const items = (unit: string, slug: string, step: string) => stepOf(entry(unit, slug), step, "gaps").gaps.items.map((i) => i.arabic.replace(/ْ$/, ""));
  it("ر: تدريب ٢ and ٣ (with the Sukun word حَرْب) and the dictation with the book's printed letters", () => {
    expect(items("lesson-3", "ra", "step-4")).toEqual(["رَجُل", "رِجْل", "رُمَّان", "رَأْس", "رَادْيُو", "رُخْصَة", "رِئَة", "رُبْع", "رِسَالَة"]);
    expect(items("lesson-3", "ra", "step-5").at(-1)).toBe("حَرْب");
    const d = stepOf(entry("lesson-3", "ra"), "step-9", "gaps").gaps.items;
    expect(d.map((i) => i.arabic.replace(/ْ$/, ""))).toEqual(["رَصَاص", "سَرِير", "شَجَرَة", "بُرْج", "خَرُوف", "أَحْمَد", "تَامِر", "ثَابِت", "رَادْيُو", "ذُرَة"]);
    expect(d[0]!.pattern).toBe("_صَاص");
  });
  it("ض: تدريب ٣ as printed (ضُرُوس twice)", () => {
    expect(items("lesson-3", "dad", "step-5")).toEqual(["ضِلْع", "ضَرْب", "ضُرُوس", "ضِيَاء", "ضَيْف", "ضَابِط", "ضِرْس", "ضُرُوس", "ضُيُوف", "مِضْرَب"]);
  });
  it("ل: the Sukun word الْبَرَازِيل and the note on لا / الـ", () => {
    const pos = stepOf(entry("lesson-4", "lam"), "step-2", "positions").positions;
    expect(pos.sukun.word).toBe("الْبَرَازِيل");
    expect(pos.rule!.arabic).toContain("لـ + ا = لا");
    expect(items("lesson-4", "lam", "step-5").at(-1)).toBe("الْبَرَازِيل");
  });
  it("ن: the dictation of „حل تدريب ٩“", () => {
    expect(items("lesson-4", "nun", "step-9")).toEqual(["نَجْوَى", "نَوَال", "مُنَى", "نَاجِي", "نَسِيم", "مَنَال", "نَازِك", "نَجْوَان", "إِيمَان", "إِحْسَان"]);
  });
  it("spellLetters writes the letters without signs, e.g. جَرَس → ج ر س, تِبْر → ت ب ر", () => {
    expect(spellLetters("جَرَس")).toEqual(["ج", "ر", "س"]);
    expect(spellLetters("تِبْرْ")).toEqual(["ت", "ب", "ر"]);
    expect(spellLetters("شُورْبَة")).toEqual(["ش", "و", "ر", "ب", "ة"]);
  });
});

describe("the conversations of the book", () => {
  it("حوار ١ and ٢: three speakers each, exactly the book's lines", () => {
    expect(wajdiDialogue.lines.map((l) => [l.speaker, l.arabic])).toEqual([
      ["shadi", "هَلْ أَنْتَ وَجْدِي؟"], ["walid", "لَا. أَنَا وَلِيد."], ["shadi", "هَلْ أَنْتَ وَجْدِي؟"], ["wajdi", "نَعَمْ. أَنَا وَجْدِي."],
    ]);
    expect(suziDialogue.lines.map((l) => [l.speaker, l.arabic])).toEqual([
      ["teriz", "هَلْ أَنْتِ سُوزِي؟"], ["ester", "لَا. أَنَا إِسْتَر."], ["teriz", "هَلْ أَنْتِ سُوزِي؟"], ["suzi", "نَعَمْ. أَنَا سُوزِي."],
    ]);
    expect(wajdiDialogue.question!.prompt).toContain("مَنْ فِي الصُّورَةِ؟");
  });

  it("تقديم (أ) and (ب): one person asks six times – one man, one woman, two men, two women, three men, three women", () => {
    expect(manAntaA.lines.map((l) => l.arabic)).toEqual([
      "مَنْ أَنْتَ؟", "أَنَا نَاجِي.", "مَنْ أَنْتِ؟", "أَنَا نِرْمِين.", "مَنْ أَنْتُمَا؟", "نَحْنُ نَسِيم وَنُصْحِي.",
      "مَنْ أَنْتُمَا؟", "نَحْنُ نِيفِين وَشِيرِين.", "مَنْ أَنْتُمْ؟", "نَحْنُ نَادِي وَحُسْنِي وَنَاصِر.", "مَنْ أَنْتُنَّ؟", "نَحْنُ نِسْمَة وَنُورَا وَنِسْرِين.",
    ]);
    expect(manAntaB.lines.filter((l) => l.speaker === "asker").map((l) => l.arabic)).toEqual([
      "مَنْ أَنْتَ؟ مَا اسْمُكَ؟", "مَنْ أَنْتِ؟ مَا اسْمُكِ؟", "مَنْ أَنْتُمَا؟ مَا اسْمَاكُمَا؟", "مَنْ أَنْتُمَا؟ مَا اسْمَاكُمَا؟", "مَنْ أَنْتُمْ؟ مَا أَسْمَاؤُكُمْ؟", "مَنْ أَنْتُنَّ؟ مَا أَسْمَاؤُكُنَّ؟",
    ]);
    expect(manAntaA.roles!.map((r) => r.id)).toEqual(["asker", "answers"]);
    for (const d of [wajdiDialogue, suziDialogue, manAntaA, manAntaB]) for (const s of d.speakers) expect(existsSync(path.join(PUBLIC, s.avatar.src)), s.avatar.src).toBe(true);
  });

  it("the entries in book order: listen, repeat, grammar, role-play, then the exercises", () => {
    expect(entry("lesson-3", "hal-anta-wajdi").steps.map((s) => s.navLabel)).toEqual(["Anhören 1", "Nachsprechen 1", "Anhören 2", "Nachsprechen 2", "Grammatik", "Rollenspiel 1", "Rollenspiel 2", "Übung 3", "Übung 4"]);
    expect(entry("lesson-4", "muraja-amma").steps.map((s) => s.kind)).toEqual(["match", "gaps", "gaps"]);
    expect(entry("lesson-4", "man-anta").steps.map((s) => s.navLabel)).toEqual(["Anhören (أ)", "Nachsprechen (أ)", "Anhören (ب)", "Nachsprechen (ب)", "Grammatik", "Rollenspiel (أ)", "Übung 2", "Übung 3", "Übung 4", "Übung 5", "Übung 6", "Rollenspiel (ب)", "Merke"]);
    for (const lesson of [entry("lesson-3", "hal-anta-wajdi"), entry("lesson-4", "man-anta")]) for (const ex of a1LessonExercises(lesson)) expect(isAllowedTarget(ex.target), ex.target).toBe(true);
  });

  it("grammar: the six forms of the pronoun, the question with مَا and the answer", () => {
    const g = stepOf(entry("lesson-4", "man-anta"), "step-5", "table");
    expect(g.tables[0]!.rows[0]!.map((c) => c.arabic)).toEqual(["أَنْتَ؟", "أَنْتِ؟", "أَنْتُمَا؟", "أَنْتُمَا؟", "أَنْتُمْ؟", "أَنْتُنَّ؟"]);
    expect(g.tables[1]!.rows[1]!.map((c) => c.arabic)).toEqual(["مَا اسْمُكَ؟", "مَا اسْمُكِ؟", "مَا اسْمَاكُمَا؟", "مَا اسْمَاكُمَا؟", "مَا أَسْمَاؤُكُمْ؟", "مَا أَسْمَاؤُكُنَّ؟"]);
    expect(g.tables[2]!.rows[1]!.map((c) => c.arabic)).toEqual(["اسْمِي", "اسْمِي", "اسْمَانَا", "اسْمَانَا", "أَسْمَاؤُنَا", "أَسْمَاؤُنَا"]);
    const remember = stepOf(entry("lesson-4", "man-anta"), "step-13", "table");
    expect(remember.tables.map((t) => t.id)).toEqual(["hal", "man", "ma", "second", "first", "possessive"]);
  });

  it("the review: تدريب ١ (letters → word; مَكْتَب is the model), ٢ (سَ / صَ) and ٣ (دَ / ضَ) with the book's solutions", () => {
    const review = entry("lesson-4", "muraja-amma");
    const match = stepOf(review, "step-1", "match").match;
    for (const p of match.prompts) expect(p.arabic.split(" – ").join(""), p.id).toBe(p.result!.arabic.replace(/[ً-ْ]/g, ""));
    expect(stepOf(review, "step-2", "gaps").gaps.items.map((i) => i.arabic)).toEqual(["سَمَك", "صَبَاح", "قَمِيصْ", "صِينِيَّة", "عُصْفُور", "اسْمَك", "سُبُّورَة", "صُوَر", "صُنْدُوق", "سِتَارَة"]);
    expect(stepOf(review, "step-3", "gaps").gaps.items.map((i) => i.arabic)).toEqual(["دُولَاب", "ضَيْف", "دَوَاء", "ضُبَّاط", "دِيك", "ضُيُوف", "ضِلْع", "حَدِيدْ", "مَدْرَسَة", "ضِرْس"]);
  });
});

describe("the new step types", () => {
  it("SpellStep: listen, then the letters apart – a wrong letter is red and can be deleted; done after every word", async () => {
    render(<SpellStep words={[{ id: "jaras", arabic: "جَرَس", german: "Glocke" }, { id: "tibr", arabic: "تِبْر", german: "Rohgold" }]} progressKey={KEY} />);
    fireEvent.click(screen.getByTestId("spell-listen"));
    await waitFor(() => expect(tts.spoken).toEqual(["جَرَس"]));
    fireEvent.click(screen.getByTestId("spell-choice-ج"));
    fireEvent.click(screen.getByTestId("spell-choice-ز"));
    expect(screen.getByTestId("spell-slot-1")).toHaveAttribute("data-state", "wrong");
    fireEvent.click(screen.getByTestId("spell-delete"));
    fireEvent.click(screen.getByTestId("spell-choice-ر"));
    fireEvent.click(screen.getByTestId("spell-choice-س"));
    expect(screen.getByTestId("spell-feedback")).toHaveTextContent("Richtig! ج – ر – س");
    fireEvent.click(screen.getByTestId("spell-next"));
    for (const l of ["ت", "ب", "ر"]) fireEvent.click(screen.getByTestId(`spell-choice-${l}`));
    expect(getLessonProgress(KEY).completedAt).toBeTruthy();
  });

  it("QuizStep (Übung 3): first and last letter of each name; wrong answers can be changed", () => {
    const step = stepOf(entry("lesson-3", "hal-anta-wajdi"), "step-8", "quiz");
    render(<QuizStep items={step.items} progressKey={KEY} />);
    expect(step.items.map((i) => i.arabic)).toEqual(["يَحْيَى", "جِرْجِس", "حَبِيب", "سِيزَا", "جُورْج", "سَيِّد", "صَابِر", "رَابِح", "آسِر", "صُبْحِي", "سَارَة"]);
    const first = step.items[0]!.questions[0]!;
    const wrong = first.options.findIndex((_, i) => i !== first.answer);
    fireEvent.click(screen.getByTestId(`quiz-name-1-0-option-${wrong}`));
    expect(screen.getByTestId("quiz-name-1-0")).toHaveAttribute("data-correct", "false");
    for (const item of step.items) item.questions.forEach((q, n) => fireEvent.click(screen.getByTestId(`quiz-${item.id}-${n}-option-${q.answer}`)));
    expect(getLessonProgress(KEY).completedAt).toBeTruthy();
  });

  it("ClozeStep (Übung 4): the missing question – checked, corrected, and the model answer can be heard", async () => {
    const step = stepOf(entry("lesson-4", "man-anta"), "step-9", "cloze");
    render(<ClozeStep items={step.items.slice(0, 1)} progressKey={KEY} />);
    fireEvent.click(screen.getByTestId("cloze-gap-q1:0"));
    fireEvent.click(within(screen.getByTestId("cloze-options-q1")).getByText("مَا اسْمُكَ؟"));
    fireEvent.click(screen.getByTestId("cloze-check-q1"));
    expect(screen.getByTestId("cloze-q1")).toHaveAttribute("data-verdict", "wrong");
    fireEvent.click(screen.getByTestId("cloze-gap-q1:0"));
    fireEvent.click(within(screen.getByTestId("cloze-options-q1")).getByText("مَا اسْمُكِ؟"));
    fireEvent.click(screen.getByTestId("cloze-check-q1"));
    expect(screen.getByTestId("cloze-q1")).toHaveAttribute("data-verdict", "right");
    expect(getLessonProgress(KEY).completedAt).toBeTruthy();
    fireEvent.click(within(screen.getByTestId("cloze-q1")).getAllByRole("button", { name: /^Anhören/ })[0]!);
    await waitFor(() => expect(tts.spoken).toEqual(["مَا اسْمُكِ؟"]));
    expect(isAllowedTtsText("مَا اسْمُكِ؟")).toBe(true);
  });

  it("ClozeStep (Übung 5): where the book leaves a name open, every fitting name is right", () => {
    const step = stepOf(entry("lesson-4", "man-anta"), "step-10", "cloze");
    render(<ClozeStep items={step.items.slice(0, 1)} progressKey={KEY} />);
    fireEvent.click(screen.getByTestId("cloze-gap-p1:0"));
    fireEvent.click(within(screen.getByTestId("cloze-options-p1")).getByText("مَنْ أَنْتِ؟"));
    fireEvent.click(screen.getByTestId("cloze-gap-p1:1"));
    fireEvent.click(within(screen.getByTestId("cloze-options-p1")).getByText("نِرْمِين"));
    fireEvent.click(screen.getByTestId("cloze-check-p1"));
    expect(screen.getByTestId("cloze-p1")).toHaveAttribute("data-verdict", "right");
  });
});
