import { existsSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { a1LessonExercises, a1Unit1, A1_LEVEL, stepSpokenTexts } from "@/data/a1";
import { formsFallbackTexts } from "@/data/a1/forms-fallback";
import { translate } from "@/i18n/translate";
import { splitTiles } from "@/lib/arabic/hamza-alif";
import { LOCALE_ORDER } from "@/lib/locale";
import { isAllowedTtsText } from "@/lib/pronunciation/targets";
import manifest from "@/lib/tts/recorded-manifest.json";

// Review 11/2026 (Lektion 1): letter names and symbols, the section tabs, and exercises that stayed
// silent. The data was right where the reviewer saw "ال" for ث and "السام" for الجيم (Chrome's page
// translation rewrote the page, see src/app/layout.tsx) – these checks keep the data right, and make
// sure every text an exercise plays has a recording or is allowed by /api/tts.

const clips = manifest.clips as Record<string, string>;
const AUDIO_DIR = path.join(process.cwd(), "public/audio/ar");

/** The player plays the text: its recording, or Azure through /api/tts (only for allowed texts). */
const playable = (text: string) => text in clips || isAllowedTtsText(text);

describe("Lektion 1: the letters", () => {
  const LETTERS: [slug: string, glyph: string, arabicName: string][] = [
    ["alif", "أ", "الألف"],
    ["ba", "ب", "الباء"],
    ["ta", "ت", "التاء"],
    ["tha", "ث", "الثاء"],
    ["jim", "ج", "الجيم"],
    ["hha", "ح", "الحاء"],
    ["kha", "خ", "الخاء"],
  ];

  it("the lesson's letter row is أ ب ت ث ج ح خ, in book order", () => {
    const letters = a1Unit1.lessons.filter((lesson) => lesson.kind === "letter");
    expect(letters.map((lesson) => lesson.label)).toEqual(LETTERS.map(([, glyph]) => glyph));
  });

  for (const [slug, glyph, arabicName] of LETTERS) {
    it(`${glyph}: symbol and name (${arabicName})`, () => {
      const lesson = a1Unit1.lessons.find((entry) => entry.slug === slug)!;
      expect(lesson.label).toBe(glyph);
      expect(lesson.letter?.glyph).toBe(glyph);
      expect(translate(lesson.labelGerman, "ar")).toBe(arabicName);
      expect(translate(lesson.letter!.name, "ar")).toBe(arabicName);
    });

    it(`${glyph}: the section tabs are Wörter, Formen, Schreiben, Ergänzen, Hören`, () => {
      const lesson = a1Unit1.lessons.find((entry) => entry.slug === slug)!;
      expect(lesson.steps.map((step) => translate(step.navLabel ?? step.title, "ar"))).toEqual(["الكلمات", "الأشكال", "الكتابة", "أكمل", "الاستماع"]);
    });
  }
});

describe("A1: every exercise can be heard", () => {
  for (const unit of A1_LEVEL.units) {
    for (const lesson of unit.lessons) {
      it(`${unit.slug}/${lesson.slug}: every word and sentence has a recording or is allowed by /api/tts`, () => {
        const texts = [
          ...a1LessonExercises(lesson).map((exercise) => exercise.modelText),
          ...lesson.steps.flatMap(stepSpokenTexts),
          ...lesson.steps.flatMap((step) => (step.kind === "forms" ? Object.values(formsFallbackTexts(step.forms)).filter((text) => /[؀-ۿ]/.test(text)) : [])),
        ];
        expect(texts.filter((text) => !playable(text))).toEqual([]);
      });
    }
  }

  it("the narration of a letter's Formen is allowed in every language (Nachbarn: كب, فت were silent)", () => {
    const narration = A1_LEVEL.units
      .flatMap((unit) => unit.lessons)
      .flatMap((lesson) => lesson.steps)
      .flatMap((step) => (step.kind === "forms" ? Object.values(formsFallbackTexts(step.forms)).filter((text) => !/[؀-ۿ]/.test(text)) : []));
    expect(narration.length).toBeGreaterThan(0);
    const silent = narration.flatMap((text) => LOCALE_ORDER.map((locale) => translate(text, locale)).filter((spoken) => !isAllowedTtsText(spoken)));
    expect(silent).toEqual([]);
  });

  it.skipIf(!existsSync(AUDIO_DIR))("every recording in the manifest is installed (public/audio/ar)", () => {
    const missing = Object.entries(clips).filter(([, file]) => !existsSync(path.join(AUDIO_DIR, `${file}.mp3`)));
    expect(missing).toEqual([]);
  });
});

describe("A1: what is heard is what is written", () => {
  const SUKUN = "ْ";
  const TANWIN = /[ً-ٍ]/;

  it("a gap in the LAST letter (أَ_ → أَبْ): the word is shown and spoken in pause, with Sukun, never with Tanwin", () => {
    const items = A1_LEVEL.units
      .flatMap((unit) => unit.lessons)
      .flatMap((lesson) => lesson.steps)
      .flatMap((step) => (step.kind === "gaps" ? step.gaps.items : []))
      .filter((item) => item.pattern && splitTiles(item.pattern).at(-1) === "_")
      // Words written with their harakat (an unvocalised تاج shows no ending to contradict).
      .filter((item) => /[\u064E-\u0652]/.test(item.arabic));
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      // On the last letter (شَذًا keeps its book spelling: the Tanwin is on the ذ, the gap is the Alif).
      expect(TANWIN.test(splitTiles(item.arabic).at(-1)!), item.arabic).toBe(false);
      expect(item.spoken ?? item.arabic, item.arabic).toBe(item.arabic);
    }
    const ab = items.find((item) => item.arabic.startsWith("أَبْ"));
    expect(ab?.arabic.endsWith(SUKUN)).toBe(true);
  });

  it("طَبَخَ is a verb: Fatha on the Cha, no Damma and no Tanwin", () => {
    const kha = a1Unit1.lessons.find((lesson) => lesson.slug === "kha")!;
    const forms = kha.steps.find((step) => step.kind === "forms");
    const words = forms?.kind === "forms" ? [...forms.forms.explain, ...forms.forms.build].map((word) => word.arabic) : [];
    expect(words).toContain("طَبَخَ");
    expect(words.filter((word) => word.startsWith("طَبَخ") && word !== "طَبَخَ")).toEqual([]);
  });

  it("نَضَجَ has no recording until it is re-recorded (the old clip was reported as نضد)", () => {
    expect("نَضَجَ" in clips).toBe(false);
  });
});
