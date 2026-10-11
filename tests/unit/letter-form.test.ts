import { describe, expect, it } from "vitest";

import { hamzaPosition } from "@/lib/arabic/hamza-alif";
import { analyzeWord, formGlyph, hasHand, joins, letterForm, pickNeighbors, splitTiles, targetIndex } from "@/lib/arabic/letter-form";

// The general util: the form of any target letter in a word. Expected forms
// are the positions given for the book's Formen words (Lesson1.pdf, unit 1),
// for all six letters – not only the ones built so far.

type Case = [word: string, form: "start" | "middle" | "end" | "separate", occurrence?: number];

const FORMEN: Record<string, { letter: string; words: Case[]; sukun: Case }> = {
  ba: { letter: "ب", words: [["بِطَاقَة", "start"], ["شِبَّاك", "middle"], ["كَلْب", "end"], ["كِتَاب", "separate"]], sukun: ["نَبْق", "middle"] },
  ta: { letter: "ت", words: [["تِلِيفُونُ", "start"], ["كِتَاب", "middle"], ["بِنْت", "end"], ["بَنَات", "separate"]], sukun: ["فَتْق", "middle"] },
  // ثُلُث and أَثَاث have two ث: the book means the last one.
  tha: { letter: "ث", words: [["ثَوْب", "start"], ["الثُّلَاثَاءُ", "middle"], ["ثُلُث", "end", -1], ["أَثَاث", "separate", -1]], sukun: ["أَثْنَاءَ", "start"] },
  jim: { letter: "ج", words: [["جِمَال", "start"], ["الْجُنْدِي", "middle"], ["نُضْج", "end"], ["فَرَج", "separate"]], sukun: ["أَجْمَل", "start"] },
  hha: { letter: "ح", words: [["حِمَار", "start"], ["الْحَفْلَة", "middle"], ["نَصَحَ", "end"], ["فَرِح", "separate"]], sukun: ["أَحْمَر", "start"] },
  kha: { letter: "خ", words: [["خِيَار", "start"], ["الْخُبْز", "middle"], ["طَبَخ", "end"], ["فَرْخ", "separate"]], sukun: ["نَخْلَة", "middle"] },
};

describe("letter form: start, middle, end, separate", () => {
  it.each(Object.entries(FORMEN))("%s: the four book words in book order, and the sukun word", (_, { letter, words, sukun }) => {
    expect(words.map(([word, , occurrence]) => analyzeWord(word, letter, occurrence).form)).toEqual(["start", "middle", "end", "separate"]);
    const [word, form, occurrence] = sukun;
    expect(analyzeWord(word, letter, occurrence).form, word).toBe(form);
    // The sukun word has the letter with sukun.
    expect(splitTiles(word)[analyzeWord(word, letter, occurrence).index], word).toBe(letter + "ْ");
  });

  it("follows the rule: held by a letter with a Hand before it; holds the next letter when it has a Hand itself", () => {
    const shape = analyzeWord("شِبَّاك", "ب");
    expect(shape).toMatchObject({ index: 1, previous: true, next: true, form: "middle" });
    expect(analyzeWord("كِتَاب", "ب")).toMatchObject({ index: 3, previous: false, next: false, form: "separate" });
    expect(analyzeWord("بِطَاقَة", "ب")).toMatchObject({ index: 0, previous: false, next: true, form: "start" });
    expect(analyzeWord("كَلْب", "ب")).toMatchObject({ index: 2, previous: true, next: false, form: "end" });
    // ب ت ث ج ح خ connect forward; the Alif does not.
    for (const letter of ["ب", "ت", "ث", "ج", "ح", "خ"]) expect(hasHand(letter), letter).toBe(true);
    expect(joins(splitTiles("بَاب"), 1)).toEqual({ previous: true, next: false });
    expect(letterForm(splitTiles("بَاب"), 2)).toBe("separate");
  });

  it("finds the first, the last or the n-th occurrence of the letter", () => {
    const tiles = splitTiles("ثُلُث");
    expect(targetIndex(tiles, "ث")).toBe(0);
    expect(targetIndex(tiles, "ث", -1)).toBe(2);
    expect(targetIndex(tiles, "ث", 1)).toBe(2);
    expect(targetIndex(tiles, "ب")).toBe(-1);
    expect(analyzeWord("ثُلُث", "ث").form).toBe("start");
    expect(() => analyzeWord("كَلْب", "ت")).toThrow();
  });

  it("writes the shapes with tatweel", () => {
    expect((["start", "middle", "end", "separate"] as const).map((form) => formGlyph("ب", form))).toEqual(["بـ", "ـبـ", "ـب", "ب"]);
  });

  it("keeps the Alif lesson's own positions (the Alif in سَأَلَ is 'middle' in the book)", () => {
    expect(["أَنَا", "سَأَلَ", "سَبَأَ", "قَرَأَ"].map((w) => hamzaPosition(splitTiles(w)))).toEqual(["start", "middle", "end", "separate"]);
  });
});

describe("neighbours for 'Wer hält fest?'", () => {
  const words = (id: string) => [...FORMEN[id]!.words, FORMEN[id]!.sukun].map(([word]) => word);

  it("Ba: four letters with a Hand and the Alif, all from the Formen and sukun words", () => {
    expect(pickNeighbors(words("ba"), "ب")).toEqual(["ط", "ق", "ش", "ك", "ا"]);
  });

  it.each(Object.keys(FORMEN))("%s: at least three with a Hand, at least one without (the Alif when there is one), each from one of the words", (id) => {
    const { letter } = FORMEN[id]!;
    const neighbors = pickNeighbors(words(id), letter);
    expect(neighbors.filter(hasHand).length).toBeGreaterThanOrEqual(3);
    expect(neighbors.filter((n) => !hasHand(n)).length).toBeGreaterThanOrEqual(1);
    if (words(id).some((w) => splitTiles(w).some((t) => t.startsWith("ا")))) expect(neighbors).toContain("ا");
    expect(neighbors).not.toContain(letter);
    for (const neighbor of neighbors) expect(words(id).some((w) => splitTiles(w).some((t) => t.startsWith(neighbor))), neighbor).toBe(true);
  });
});
