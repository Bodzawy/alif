import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { A1_LEVEL, a1Entries, a1Unit1, getA1Lesson } from "@/data/a1";
import { a1Unit2 } from "@/data/a1/lesson-2";
import { a1Unit3, a1Unit4 } from "@/data/a1/unit-2";
import { a1Unit5, a1Unit6 } from "@/data/a1/unit-3";
import { a1Unit7, a1Unit8 } from "@/data/a1/unit-4";
import { a1Unit9, a1Unit10 } from "@/data/a1/unit-5";
import { a1Unit11, a1Unit12 } from "@/data/a1/unit-6";
import { a1Unit13, a1Unit14 } from "@/data/a1/unit-7";
import { a1Unit15, a1Unit16 } from "@/data/a1/unit-8";
import { a1Unit17, a1Unit18 } from "@/data/a1/unit-9";
import { a1Unit19, a1Unit20 } from "@/data/a1/unit-10";
import { WORDS_LEVEL } from "@/data/curriculum";
import { NO_TANWIN, withTanwin } from "@/lib/arabic/tanwin";
import { ALLOWED_TTS_TEXTS } from "@/lib/pronunciation/targets";
import manifest from "@/lib/tts/recorded-manifest.json";

// The vocabulary words (src/data/vocabulary-tanwin.ts) are shown and spoken with Tanwin,
// in every lesson: what a card shows is what it speaks, what /api/tts may say and what a
// recording is filed under. The recording batches are made from the same texts.

const TANWIN = /[ًٌٍ]/;
const BATCHES = path.join(process.cwd(), "docs", "audio-replacement", "batches");

/** Every vocabulary word of the app, where it is. */
function vocabulary() {
  const words: Array<{ where: string; shown: string; spoken: string }> = [];
  for (const lesson of WORDS_LEVEL.lessons) for (const v of lesson.vocabulary) words.push({ where: `a0/${lesson.slug}`, shown: v.arabic, spoken: v.exercise.modelText });
  for (const { unit, lesson } of a1Entries())
    for (const step of lesson.steps) {
      const where = `${unit.slug}/${lesson.slug}/${step.slug}`;
      if (step.kind === "words" || step.kind === "sound-words") for (const g of step.groups) for (const w of g.words) words.push({ where, shown: w.arabic, spoken: w.exercise.modelText });
      if (step.kind === "match") for (const p of step.match.prompts) if (p.result) words.push({ where, shown: p.result.arabic, spoken: p.result.arabic });
      if (step.kind === "positions") for (const i of step.positions.items) words.push({ where, shown: i.word, spoken: i.word });
    }
  return words;
}

const batch = (file: string): Array<{ id: string; text: string }> => JSON.parse(readFileSync(path.join(BATCHES, file), "utf8")).items;

describe("vocabulary words with Tanwin", () => {
  it("in every lesson: shown = spoken = allowed for /api/tts, and with Tanwin wherever the word can take it", () => {
    const words = vocabulary();
    expect(words.length).toBeGreaterThan(500);
    for (const { where, shown, spoken } of words) {
      expect(spoken, where).toBe(shown);
      expect(ALLOWED_TTS_TEXTS.has(spoken), `${where}: ${spoken}`).toBe(true);
      expect(withTanwin(shown), `${where}: ${shown}`).toBe(shown); // nothing left to add
    }
  });

  it("samples from A0, Lektion 2, 5, 8, 14 and 20 – and no Tanwin for verbs, colours, particles and names", () => {
    expect(WORDS_LEVEL.lessons[0]!.vocabulary.map((v) => v.arabic)).toEqual(["أَسَدٌ", "أَرْنَبٌ", "أَنَانَاسٌ"]);
    expect(WORDS_LEVEL.lessons[0]!.vocabulary[0]!.transliteration).toMatch(/un$/);
    const step = (unit: string, entry: string, slug: string) => getA1Lesson(unit, entry)!.steps.find((s) => s.slug === slug)!;
    const room = step("lesson-8", "hadhihi-hujrati", "step-1");
    if (room.kind !== "words") throw new Error();
    expect(room.groups[0]!.words.slice(0, 3).map((w) => [w.arabic, w.exercise.target])).toEqual([["سَرِيرٌ", "سرير"], ["طَالِبٌ", "طالب"], ["مَكْتَبٌ", "مكتب"]]);
    const colours = step("lesson-14", "ma-lawn", "step-2");
    if (colours.kind !== "words") throw new Error();
    const shown = colours.groups.flatMap((g) => g.words.map((w) => w.arabic));
    expect(shown).toEqual(expect.arrayContaining(["أَبْيَض", "أَخْضَر", "أَزْرَق", "أَسْوَد", "أَصْفَر", "فِضِّيٌّ", "ذَهَبِيٌّ", "بُرْتُقَالِيٌّ"]));
    const weather = step("lesson-20", "hal-at-taqs", "step-1");
    if (weather.kind !== "words") throw new Error();
    expect(weather.groups.flatMap((g) => g.words.map((w) => w.arabic))).toEqual(expect.arrayContaining(["حَارٌّ", "بَارِدٌ", "مُمْطِرٌ"]));
    for (const word of ["أَخَذَ", "نَطَقَ", "قِفْ", "مِنْ", "مَعَ", "عِنْدَه", "عَفَاف", "شُبَاط"]) expect(NO_TANWIN.has(word), word).toBe(true);
  });

  it("left as they are (the very same data): spelling, letter completion, tables, comparison, dialogues …; and the Sukun words", () => {
    const raw = [a1Unit1, a1Unit2, a1Unit3, a1Unit4, a1Unit5, a1Unit6, a1Unit7, a1Unit8, a1Unit9, a1Unit10, a1Unit11, a1Unit12, a1Unit13, a1Unit14, a1Unit15, a1Unit16, a1Unit17, a1Unit18, a1Unit19, a1Unit20];
    let checked = 0;
    raw.forEach((unit, u) =>
      unit.lessons.forEach((lesson, l) =>
        lesson.steps.forEach((step, s) => {
          const shown = A1_LEVEL.units[u]!.lessons[l]!.steps[s]!;
          if (!["words", "sound-words", "match", "positions"].includes(step.kind)) {
            expect(shown, `${unit.slug}/${lesson.slug}/${step.slug}`).toBe(step);
            checked++;
          }
          if (step.kind === "positions" && shown.kind === "positions") expect(shown.positions.sukun).toBe(step.positions.sukun);
        })
      )
    );
    expect(checked).toBeGreaterThan(300);
  });
});

describe("recordings and batches made from the code", () => {
  it("every recording is filed under a text the app still speaks", () => {
    for (const text of Object.keys(manifest.clips)) expect(ALLOWED_TTS_TEXTS.has(text), text).toBe(true);
  });

  it("every batch text is spoken by the app, single, not recorded yet, and in one batch only", () => {
    const recorded = new Set(Object.keys(manifest.clips));
    const seen = new Map<string, string>();
    for (const file of readdirSync(BATCHES).filter((f) => f.endsWith(".json") && !f.startsWith("_") && !/^batch-0[123]\./.test(f))) {
      const items = batch(file);
      expect(readFileSync(path.join(BATCHES, file.replace(".json", ".txt")), "utf8").trim().split("\n\n"), file).toEqual(items.map((i) => i.text));
      for (const { text } of items) {
        expect(ALLOWED_TTS_TEXTS.has(text), `${file}: ${text}`).toBe(true);
        expect(recorded.has(text), `${file}: ${text} is recorded`).toBe(false);
        expect(seen.get(text), `${text} in ${file}`).toBeUndefined();
        seen.set(text, file);
      }
    }
    // Every vocabulary word with Tanwin has a recording or is in a batch.
    for (const { shown } of vocabulary()) if (TANWIN.test(shown) && shown.trim().split(/\s+/).length === 1) expect(recorded.has(shown) || seen.has(shown), shown).toBe(true);
  });

  it("batch-rerecord: the new form of each recording that no longer matches (e.g. أَسَدٌ for أَسَد)", () => {
    const texts = batch("batch-rerecord.json").map((i) => i.text);
    expect(texts).toEqual(expect.arrayContaining(["أَسَدٌ", "نَمِرٌ", "خَسٌّ"]));
    for (const text of texts) expect(TANWIN.test(text), text).toBe(true);
  });
});
