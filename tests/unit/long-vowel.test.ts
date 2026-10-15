import { describe, expect, it } from "vitest";

import { a1Entries } from "@/data/a1";
import { longVowelSound } from "@/lib/tts/long-vowel";
import { buildSsml } from "@/lib/tts/ssml";

describe("longVowelSound: a letter with a short vowel is read long by Azure", () => {
  it.each([
    ["بَ", "بَا"],
    ["بِ", "بِي"],
    ["بُ", "بُو"],
    ["أَ", "آ"],
    ["إِ", "إِي"],
    ["أُ", "أُو"],
    ["دُ", "دُو"],
  ])("%s → %s", (glyph, spoken) => {
    expect(longVowelSound(glyph)).toBe(spoken);
  });

  it.each(["بْ", "بَيْتٌ", "أَنَا", "بَا", "Super!", "بَ بِ"])("%s stays as it is", (text) => {
    expect(longVowelSound(text)).toBeNull();
  });

  it("every sound card of the A1 letter lessons reaches Azure long – the card and its target stay short", () => {
    let checked = 0;
    for (const { lesson } of a1Entries()) {
      if (lesson.kind !== "letter") continue;
      for (const step of lesson.steps) {
        if (step.kind !== "sound-words") continue;
        for (const { sound } of step.groups) {
          checked++;
          expect(sound.exercise.modelText, sound.id).toBe(sound.glyph);
          expect(sound.exercise.target, sound.id).toBe(sound.glyph);
          const long = longVowelSound(sound.glyph);
          expect(long, sound.id).not.toBeNull();
          expect(buildSsml(sound.exercise.modelText), sound.id).toContain(long!);
        }
      }
    }
    expect(checked).toBeGreaterThan(80);
  });
});
