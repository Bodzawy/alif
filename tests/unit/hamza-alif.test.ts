import { describe, expect, it } from "vitest";

import { baseLetter, hamzaIndex, hamzaPosition, hamzaReason, hasHand, isHamzaHeld, NON_CONNECTING, splitTiles } from "@/lib/arabic/hamza-alif";

describe("Hamza-Alif: alone or held", () => {
  it("splits a word into letter tiles with their harakat", () => {
    expect(splitTiles("أَنَا")).toEqual(["أَ", "نَ", "ا"]);
    expect(splitTiles("سَأَلَ")).toEqual(["سَ", "أَ", "لَ"]);
    expect(splitTiles("سَبَأَ")).toEqual(["سَ", "بَ", "أَ"]);
    expect(splitTiles("قَرَأَ")).toEqual(["قَ", "رَ", "أَ"]);
    expect(splitTiles("رَأْس")).toEqual(["رَ", "أْ", "س"]);
    expect(splitTiles("أُمّ")).toEqual(["أُ", "مّ"]);
    expect(baseLetter("مّ")).toBe("م");
  });

  it("knows which letters have a Hand", () => {
    for (const letter of ["ب", "س", "ن", "ك", "ف", "ق", "ل", "م"]) expect(hasHand(letter), letter).toBe(true);
    for (const letter of NON_CONNECTING) expect(hasHand(letter), letter).toBe(false);
    expect(hasHand("رَ")).toBe(false);
    expect(hasHand("بَ")).toBe(true);
  });

  it("classifies the lesson's words (Activity 1)", () => {
    const cases: Array<[string, number, boolean, string, string]> = [
      ["أَنَا", 0, false, "start", "start"],
      ["سَأَلَ", 1, true, "middle", "hold"],
      ["سَبَأَ", 2, true, "end", "hold"],
      ["قَرَأَ", 2, false, "separate", "nohand"],
    ];
    for (const [word, index, held, position, reason] of cases) {
      const tiles = splitTiles(word);
      expect(hamzaIndex(tiles), word).toBe(index);
      expect(isHamzaHeld(tiles), word).toBe(held);
      expect(hamzaPosition(tiles), word).toBe(position);
      expect(hamzaReason(tiles), word).toBe(reason);
    }
  });

  it("computes start, middle, end, separate for the four book words, in this order", () => {
    expect(["أَنَا", "سَأَلَ", "سَبَأَ", "قَرَأَ"].map((word) => hamzaPosition(splitTiles(word)))).toEqual(["start", "middle", "end", "separate"]);
  });

  it("sorts the Activity 3 words (book words only) into alone and held", () => {
    const held = (word: string) => isHamzaHeld(splitTiles(word));
    expect(["أَنَا", "قَرَأَ", "رَأْس"].map(held)).toEqual([false, false, false]);
    expect(["سَأَلَ", "سَبَأَ"].map(held)).toEqual([true, true]);
    expect(hamzaReason(splitTiles("رَأْس"))).toBe("nohand");
    expect(hamzaReason(splitTiles("سَبَأَ"))).toBe("hold");
  });

  it("knows which of the book neighbours hold the Alif", () => {
    expect(["س", "ب", "ن", "ق", "ر"].map(hasHand)).toEqual([true, true, true, true, false]);
  });

  it("handles the Alif with Hamza below and a word without Hamza", () => {
    expect(hamzaIndex(splitTiles("إِبْرَة"))).toBe(0);
    expect(hamzaIndex(splitTiles("بَاب"))).toBe(-1);
    expect(isHamzaHeld(splitTiles("بَاب"))).toBe(false);
    expect(() => hamzaPosition(splitTiles("بَاب"))).toThrow();
  });
});
