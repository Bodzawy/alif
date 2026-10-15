import { describe, expect, it } from "vitest";

import { A1_LEVEL, a1SpokenTexts } from "@/data/a1";
import { longVowelSound } from "@/lib/tts/long-vowel";
import { buildSsml } from "@/lib/tts/ssml";

/** The text Azure reads: the content of <prosody> in the SSML. */
const spoken = (text: string) => /<prosody[^>]*>\s*([\s\S]*?)\s*<\/prosody>/.exec(buildSsml(text))![1];

describe("longVowelSound", () => {
  it.each([
    ["بَ", "بَا"],
    ["بِ", "بِي"],
    ["بُ", "بُو"],
    ["دَ", "دَا"],
    ["سُ", "سُو"],
    ["غِ", "غِي"],
    ["أَ", "آ"],
    ["إِ", "إِي"],
    ["أُ", "أُو"],
  ])("%s → %s", (short, long) => {
    expect(longVowelSound(short)).toBe(long);
    expect(spoken(short)).toBe(long);
  });

  it.each([
    ["a word", "أَبٌ"],
    ["a word without tanwin", "بَاب"],
    ["two letters", "بَتَ"],
    ["letter with sukun", "بْ"],
    ["letter with shadda", "بّ"],
    ["letter with tanwin", "بٌ"],
    ["letter with shadda and vowel", "بَّ"],
    ["bare letter", "ب"],
    ["already long", "بَا"],
    ["a sentence", "أَنَا طَالِبٌ."],
    ["German cue", "Super!"],
    ["tatweel + vowel", "ـَ"],
    ["empty", ""],
  ])("%s stays unchanged (%s)", (_, text) => {
    expect(longVowelSound(text)).toBeNull();
  });

  it("is checked before the tanwin handling and leaves everything else to it", () => {
    expect(spoken("أَبٌ")).not.toBe("أَبٌ"); // the Tanwin SSML still applies to words
    expect(spoken("Super!")).toBe("Super!");
    expect(buildSsml("Super!")).toContain('xml:lang="de-DE"');
  });
});

describe("A1 letter lessons: every sound card is read long, the card stays short", () => {
  const cards = A1_LEVEL.units.flatMap((unit) =>
    unit.lessons.flatMap((lesson) =>
      lesson.steps.flatMap((step) => (step.kind === "sound-words" ? step.groups.map((group) => ({ where: `${unit.slug}/${lesson.slug}`, sound: group.sound })) : []))
    )
  );

  it("finds the sound cards of all letter lessons", () => {
    expect(cards.length).toBeGreaterThanOrEqual(84);
  });

  for (const { where, sound } of cards) {
    const { glyph, exercise } = sound;
    it(`${where} ${glyph}: card, target and rules text stay ${glyph}; the voice reads it long`, () => {
      expect(longVowelSound(glyph), glyph).not.toBeNull();
      expect(exercise.target).toBe(glyph);
      // Alif (Lektion 1) has its own modelText (أَا, إِي, ؤُ), kept unchanged in the data; أَا and
      // إِي are long already, ؤُ is one letter + Damma and is read ؤُو.
      if (exercise.modelText !== glyph) {
        expect(where).toBe("lesson-1/alif");
        expect(spoken(exercise.modelText)).toBe({ "أَا": "أَا", "إِي": "إِي", "ؤُ": "ؤُو" }[exercise.modelText]);
        return;
      }
      expect(spoken(exercise.modelText)).toBe(longVowelSound(glyph));
    });
  }

  it("every text the A1 lessons speak that is one letter + short vowel is read long", () => {
    const singles = a1SpokenTexts().filter((text) => longVowelSound(text) !== null);
    expect(singles.length).toBeGreaterThan(0);
    for (const text of singles) expect(spoken(text), text).toBe(longVowelSound(text));
  });
});
