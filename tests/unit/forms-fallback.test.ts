import { describe, expect, it } from "vitest";

import { a1FormsFallbackTexts, getA1Lesson } from "@/data/a1";
import { formsFallbackTexts } from "@/data/a1/forms-fallback";
import { LETTER_NARRATION_FILES } from "@/components/a1/forms/content";
import { isAllowedTtsText } from "@/lib/pronunciation/targets";
import { buildSsml, TTS_VOICE, TTS_VOICE_GERMAN } from "@/lib/tts/ssml";

// A letter lesson's Formen step before its recordings exist: every clip has a
// text that /api/tts may read – German narration in the German voice, the words
// in the lesson voice. The Alif lesson's narration is recorded; only its words are spoken by TTS.

const formsOf = (entry: string) => {
  const step = getA1Lesson("lesson-1", entry)!.steps.find((s) => s.kind === "forms");
  if (step?.kind !== "forms") throw new Error(`${entry}: no forms step`);
  return step.forms;
};

describe("Formen without recordings", () => {
  it.each(["ba", "ta", "tha", "jim", "hha", "kha"])("%s: every narration clip and word has a text /api/tts allows", (entry) => {
    const forms = formsOf(entry);
    const texts = formsFallbackTexts(forms);
    for (const name of [...LETTER_NARRATION_FILES, ...forms.build.map((w) => w.audio), ...forms.sort.map((w) => w.audio)]) {
      expect(texts[name], `${entry}: ${name}`).toBeTruthy();
      expect(isAllowedTtsText(texts[name]), `${entry}: ${name}`).toBe(true);
    }
    expect(texts.f_intro).toContain(forms.letter!.name);
    expect(texts[forms.build[0]!.audio]).toBe(forms.build[0]!.arabic);
  });

  it("German narration is read in the German voice, the words in the lesson voice", () => {
    const texts = formsFallbackTexts(formsOf("ba"));
    expect(buildSsml(texts.e_intro!)).toContain(`<voice name="${TTS_VOICE_GERMAN}">`);
    expect(buildSsml(texts.e_intro!)).toContain('xml:lang="de-DE"');
    expect(buildSsml(texts[formsOf("ba").build[0]!.audio]!)).toContain(`<voice name="${TTS_VOICE}">`);
  });

  it("the Alif lesson: only its words (not recorded), in the lesson voice; the list is only lesson texts", () => {
    const texts = formsFallbackTexts(formsOf("alif"));
    expect(texts).toEqual({ ana: "أَنَا", saala: "سَأَلَ", saba: "سَبَأَ", qaraa: "قَرَأَ", ras: "رَأْس" });
    for (const text of Object.values(texts)) {
      expect(isAllowedTtsText(text), text).toBe(true);
      expect(buildSsml(text)).toContain(`<voice name="${TTS_VOICE}">`);
    }
    expect(a1FormsFallbackTexts().length).toBeGreaterThan(100);
    expect(isAllowedTtsText("Ein beliebiger deutscher Satz.")).toBe(false); // still no free TTS proxy
  });
});
