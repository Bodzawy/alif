import { describe, expect, it } from "vitest";

// A1 · Lektion 7 and 8 = Unit 4 of "لغتنا الفصحى 1" (book pages 123–149, PDF
// 155–181), checked against the book: the Hamza table and its exercises with
// the solutions of the book, the general drills, the conversations, the
// Nisba table, the room words, مَا هَذَا / هَذِهِ and the exercises.

import { getA1Lesson, getA1Unit, nextA1Entry } from "@/data/a1";

import { mustafaYamahu, planeDialogue } from "@/data/a1/unit-4/ana-misri";
import type { A1Lesson, A1Step } from "@/data/types";
import { gapTask } from "@/lib/arabic/gap";

// The units as the app shows them (vocabulary words with Tanwin, src/data/vocabulary-tanwin.ts).
const a1Unit7 = getA1Unit("lesson-7")!;
const a1Unit8 = getA1Unit("lesson-8")!;

const stepOf = <K extends A1Step["kind"]>(lesson: A1Lesson, slug: string, kind: K) => {
  const step = lesson.steps.find((s) => s.slug === slug)!;
  if (step.kind !== kind) throw new Error(`${lesson.slug}/${slug} must be ${kind}, is ${step.kind}`);
  return step as Extract<A1Step, { kind: K }>;
};
const entry = (unit: string, slug: string) => getA1Lesson(unit, slug)!;
const answers = (lesson: A1Lesson, slug: string) => stepOf(lesson, slug, "gaps").gaps.items.map((i) => [i.spoken ?? i.arabic, gapTask(i).gaps.map((g) => g.answer).join("")]);

describe("placement", () => {
  it("Unit 4 is Lektion 7 and 8 with the book's labels; Lektion 6 leads to it", () => {
    expect([a1Unit7, a1Unit8].map((u) => [u.slug, u.bookLabel, u.title])).toEqual([
      ["lesson-7", "الْوَحْدَةُ الرَّابِعَةُ – تَقْدِيمٌ (١)", "أَنَا مِصْرِيّ"],
      ["lesson-8", "الْوَحْدَةُ الرَّابِعَةُ – تَقْدِيمٌ (٢)", "هَذِهِ حُجْرَتِي"],
    ]);
    expect(nextA1Entry("lesson-6", "al-huruf")).toMatchObject({ unit: { slug: "lesson-7" }, lesson: { slug: "al-hamza" } });
  });
});

describe("Lektion 7 – the Hamza", () => {
  const lesson = entry("lesson-7", "al-hamza");

  it("the book's table: start, middle and end, with the shapes", () => {
    const table = stepOf(lesson, "step-1", "table").tables[0]!;
    expect(table.rows.map((r) => r.slice(1, 4).map((c) => c.arabic))).toEqual([
      ["أَحْمَد", "سَأَلَ", "بَدَأَ"], ["إِحْسَان", "أَسْئِلَة", "بَطِيء"], ["أُمَيْمَة", "سُؤَال", "تَبَاطُؤ"], ["آسِر", "قُرْآن", "بَدْء"], ["", "", "ضَوْء"], ["", "", "هَنَاء"],
    ]);
    expect(stepOf(lesson, "step-2", "phrases").groups[0]!.items).toHaveLength(14);
  });

  it("تدريب ١: the letters build the names of the right column", () => {
    expect(stepOf(lesson, "step-3", "gaps").gaps.items.map((i) => i.spoken)).toEqual(["أَمْجَد", "إِسْرَائِيل", "إِيمَان", "مُؤْنِس", "هَيْفَاء", "مَأْمُون", "أَيْمَن", "دُعَاء", "جِبْرَائِيل", "شَيْمَاء"]);
    for (const item of stepOf(lesson, "step-3", "gaps").gaps.items) expect([...item.choices!].sort()).toEqual([...new Set(Array.from(item.arabic))].sort());
  });

  it("تدريب ٢ and ٣: the Hamza of „حل تدريب ٢ / ٣“", () => {
    expect(answers(lesson, "step-4").map(([, a]) => a)).toEqual(["ئ", "ئ", "أ", "ئ", "ء", "ؤ", "ء", "ئ", "إ", "ؤ"]);
    expect(answers(lesson, "step-5").map(([, a]) => a)).toEqual(["أ", "آ", "إ", "ئ", "ؤ", "ئ", "أ", "أ", "ؤ", "ء"]);
  });

  it("تدريب ٤ and ٥: eight sentences; (أ) and (ب) matched as in the book", () => {
    expect(stepOf(lesson, "step-6", "cloze").items).toHaveLength(8);
    expect(stepOf(lesson, "step-7", "cloze").items).toHaveLength(10);
    expect(stepOf(lesson, "step-8", "match").match.prompts.map((p) => p.answer)).toEqual(["b5", "b4", "b1", "b2", "b3"]);
  });
});

describe("Lektion 7 – drills and the conversation", () => {
  it("the general drills: ذ / ز / ظ and ق / ك with the book's solutions", () => {
    const drills = entry("lesson-7", "tadribat-amma");
    expect(stepOf(drills, "step-1", "gaps").gaps.items.map((i) => i.arabic)).toEqual(["حِذَاء", "أُرْزْ", "غَزَال", "وَاعِظْ", "مُوزْ", "ذَقْن", "ظَبْي", "زَهْرَة", "ذَيْل", "ظُهْر", "زِرّ"]);
    expect(stepOf(drills, "step-2", "gaps").gaps.items.map((i) => i.arabic)).toEqual(["كِتَاب", "قِطَّة", "كَلْب", "قَلَم", "دِيكْ", "كُرَة", "قِرْد", "صُنْدُوقْ", "قَلْب", "قَنَاة", "كُرَّاسَة", "قَصْر"]);
    const names = stepOf(drills, "step-4", "quiz").items.map((i) => i.questions[0]!.options[i.questions[0]!.answer]);
    expect(names).toEqual(["مَأْمُون", "غَسَّان", "إِسْرَاء", "وَائِل", "شَيْمَاء", "عَلَاء", "عَبَّاس", "عَلِيَّة"]);
  });

  it("the dialogues as printed", () => {
    expect(mustafaYamahu.lines.map((l) => l.speaker)).toEqual(["mustafa", "yamahu", "mustafa", "yamahu", "mustafa", "yamahu", "mustafa"]);
    expect(mustafaYamahu.lines[3]!.arabic).toBe("أَنَا مِنَ الْيَابَانِ. أَنَا يَابَانِيٌّ.");
    expect(planeDialogue.lines.map((l) => l.arabic)).toEqual(["هَلْ أَنْتِ أَمْرِيكِيَّةٌ؟", "لَا، أَنَا كَنَدِيَّةٌ. وَأَنْتِ؟", "أَنَا لُبْنَانِيَّةٌ. هَلْ أَنْتِ فِي إِجَازَةٍ؟", "نَعَمْ، أَنَا فِي إِجَازَةٍ."]);
  });

  it("the Nisba table: eight countries, four forms each (with the book's irregular plurals)", () => {
    const table = stepOf(entry("lesson-7", "ana-misri"), "step-3", "table").tables[0]!;
    expect(table.rows).toHaveLength(8);
    expect(table.rows.map((r) => r[2]!.arabic)).toEqual(["مِصْرِيُّون", "فَرَنْسِيُّون", "إِيطَالِيُّون", "كَنَدِيُّون", "أَلْمَان", "صُومَالِيُّون", "مَغَارِبَة", "إِنْجِلِيز"]);
  });

  it("تدريب ٥: nine flags – the form depends on who holds the flag", () => {
    const items = stepOf(entry("lesson-7", "ana-misri"), "step-9", "cloze").items;
    expect(items.map((i) => i.id)).toEqual(["china", "japan", "canada", "korea", "saudi", "usa", "uk", "russia", "switzerland"]);
    expect((items[1]!.lines[1]!.parts[1] as { accept: string[] }).accept).toEqual(["يَابَانِيَّة."]);
  });
});

describe("Lektion 8 – هَذِهِ حُجْرَتِي", () => {
  const lesson = entry("lesson-8", "hadhihi-hujrati");

  it("the sixteen words of the room in book order", () => {
    expect(stepOf(lesson, "step-1", "words").groups[0]!.words.map((w) => w.arabic)).toEqual([
      // Shown and spoken with Tanwin (src/data/vocabulary-tanwin.ts).
      "سَرِيرٌ", "طَالِبٌ", "مَكْتَبٌ", "نَافِذَةٌ", "بَابٌ", "كُرْسِيٌّ", "كِتَابٌ", "قَلَمٌ", "كُرَّاسَةٌ", "طَاوِلَةٌ", "سِتَارَةٌ", "حَقِيبَةٌ", "سَلَّةٌ", "مَكْتَبَةٌ", "سَجَّادَةٌ", "مِصْبَاحٌ",
    ]);
  });

  it("مَا هَذَا؟ for the masculine, مَا هَذِهِ؟ for the feminine words", () => {
    const [m, f] = stepOf(lesson, "step-3", "phrases").groups;
    expect(m!.items.every((i) => i.arabic.startsWith("هَذَا "))).toBe(true);
    expect(f!.items.every((i) => i.arabic.startsWith("هَذِهِ "))).toBe(true);
    expect(m!.items[0]!.arabic).toBe("هَذَا سَرِير");
    expect(f!.items[0]!.arabic).toBe("هَذِهِ مَكْتَبَة");
  });

  it("تدريب ٢: the letters as printed build the word", () => {
    expect(stepOf(lesson, "step-7", "gaps").gaps.items.map((i) => i.spoken)).toEqual(["مِصْبَاح", "سَجَّادَة", "كِتَاب", "سَلَّة", "طَالِب", "كُرَّاسَة", "سَيَّارَة", "مَكْتَب"]);
  });

  it("تدريب ٣: 15 pictures; the answer says نَعَمْ only when the picture shows the thing asked about", () => {
    const items = stepOf(lesson, "step-8", "cloze").items;
    expect(items).toHaveLength(15);
    const yes = items.filter((i) => (i.lines[1]!.parts[0] as { accept: string[] }).accept[0]!.startsWith("نَعَمْ")).map((i) => i.id);
    expect(yes).toEqual(["yn5", "yn6", "yn9", "yn11", "yn14"]);
  });

  it("the desk: the country tags of the book and the Nisba agreeing with the thing", () => {
    const desk = stepOf(lesson, "step-9", "cloze").items;
    expect(desk.map((d) => d.lines[0]!.parts[0])).toEqual(["مِنْ أَيْنَ هَذِهِ السَّاعَة؟", "مِنْ أَيْنَ هَذِهِ السَّجَّادَة؟", "مِنْ أَيْنَ هَذِهِ الْمِحْفَظَة؟", "مِنْ أَيْنَ هَذِهِ الْحَقِيبَة؟", "مِنْ أَيْنَ هَذَا الْخَاتَم؟", "مِنْ أَيْنَ هَذَا الْمِصْبَاح؟", "مِنْ أَيْنَ هَذَا الْكُمْبِيُوتَر؟"]);
  });
});
