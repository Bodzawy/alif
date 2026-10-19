import { describe, expect, it } from "vitest";

import { a1Entries } from "@/data/a1";
import { WORDS_LEVEL } from "@/data/curriculum";
import type { A1Step, Dialogue } from "@/data/types";
import { clozeLineText } from "@/lib/arabic/cloze";
import { hasRulesFor } from "@/lib/pronunciation/rules";

// What is spoken with Tanwin is shown with Tanwin (src/lib/arabic/tanwin.ts): every
// displayed text is paired with the text "Anhören" speaks for it, word by word. A
// spoken word with Tanwin needs its Tanwin on screen, and a word shown with Tanwin
// must be spoken with it.
// Not checked: the last word of a text of several words (Azure reads it pausal, so
// its Tanwin is not heard), and spoken words that are not on screen at all (a quiz
// answer, a number written in digits).

/** Gap items whose gap is the last tile, a letter with Sukun: shown pausal, only the voice says the Tanwin. */
const SUKUN_GAPS = new Set(["lesson-1/ba/step-4/bab", "lesson-1/ba/step-5/ab", "lesson-1/ba/step-5/bab", "lesson-1/tha/step-5/thuluth"]);

type Pair = { key: string; displayed: string; spoken: string; transliteration?: string };

function pairs(): Pair[] {
  const out: Pair[] = [];
  const add = (key: string, displayed: string, spoken: string, transliteration?: string) => out.push({ key, displayed, spoken, transliteration });
  const dialogue = (key: string, d: Dialogue) => d.lines.forEach((l) => add(`${key}/${d.id}/${l.id}`, l.arabic, l.exercise.modelText, l.transliteration));
  for (const lesson of WORDS_LEVEL.lessons) for (const v of lesson.vocabulary) add(`a0/${lesson.slug}/${v.id}`, v.arabic, v.exercise.modelText, v.transliteration);
  const step = (key: string, s: A1Step) => {
    switch (s.kind) {
      case "sound-words":
      case "words":
        s.groups.flatMap((g) => g.words).forEach((w) => add(`${key}/${w.id}`, w.arabic, w.exercise.modelText, w.transliteration));
        break;
      case "phrases":
        s.groups.flatMap((g) => g.items).forEach((i) => add(`${key}/${i.id}`, i.arabic, i.exercise.modelText, i.transliteration));
        break;
      case "dialogue":
        dialogue(key, s.dialogue);
        break;
      case "letter-find":
        [s.find.dialogue, ...(s.find.more ?? [])].forEach((d) => dialogue(key, d));
        break;
      case "gaps":
        s.gaps.items.forEach((i) => add(`${key}/${i.id}`, i.arabic, i.spoken ?? i.arabic));
        break;
      case "quiz":
        s.items.forEach((i) => add(`${key}/${i.id}`, i.arabic, i.spoken ?? i.arabic));
        break;
      case "word-pick":
        (s.pick.words ?? []).forEach((w) => add(`${key}/${w.id}`, w.arabic, w.arabic.replace(/[.،؟!:]+$/, "")));
        (s.pick.dialogues ?? []).forEach((d) => dialogue(key, d));
        break;
      case "cloze":
        s.items.forEach((i) => i.lines.forEach((l, n) => add(`${key}/${i.id}/${n}`, clozeLineText(l.parts), clozeLineText(l.parts))));
        break;
      default:
        break; // the other steps show exactly the text they speak
    }
  };
  for (const { unit, lesson } of a1Entries()) for (const s of lesson.steps) step(`${unit.slug}/${lesson.slug}/${s.slug}`, s);
  return out;
}

const HARAKAT = /[ً-ْٰـ]/g;
const TANWIN = /[ً-ٍ]/;
const PUNCT = /[.،؟?!:«»"()\-–—,؛=]/g;
const words = (t: string) => t.split(/\s+/).map((w) => w.replace(PUNCT, "")).filter((w) => w.replace(HARAKAT, ""));
// The letters of a word; the Alif of a Tanwin -an (جُنَيْهًا) does not count.
const skeleton = (w: string) => w.replace(/ًا$/, "").replace(/اً$/, "").replace(HARAKAT, "");
const ENDING: Record<string, string> = { "ً": "an", "ٌ": "un", "ٍ": "in" };

type Mismatch = { key: string; word: string; shown: string };

/** Spoken words with Tanwin shown without it (spokenOnly), and shown words with Tanwin spoken without it (shownOnly). */
function mismatches() {
  const spokenOnly: Mismatch[] = [];
  const shownOnly: Mismatch[] = [];
  for (const p of pairs()) {
    const spoken = words(p.spoken);
    const shown = words(p.displayed);
    const aligned = spoken.length === shown.length && spoken.every((w, i) => skeleton(w) === skeleton(shown[i]!));
    const used = new Set<number>();
    spoken.forEach((w, i) => {
      const j = aligned ? i : shown.findIndex((d, k) => !used.has(k) && skeleton(d) === skeleton(w));
      if (j < 0) return; // not on screen
      used.add(j);
      const audible = spoken.length === 1 || i < spoken.length - 1 || w.includes("ةٌ");
      if (TANWIN.test(w) && !TANWIN.test(shown[j]!) && audible) spokenOnly.push({ key: p.key, word: w, shown: shown[j]! });
      if (!TANWIN.test(w) && TANWIN.test(shown[j]!)) shownOnly.push({ key: p.key, word: w, shown: shown[j]! });
    });
  }
  return { spokenOnly, shownOnly };
}

describe("Tanwin: what is spoken is what is shown", () => {
  const { spokenOnly, shownOnly } = mismatches();

  it("every word spoken with Tanwin is shown with it – except the Sukun gaps", () => {
    expect(spokenOnly.filter((m) => !SUKUN_GAPS.has(m.key))).toEqual([]);
    // the exceptions are still what they are: pausal on screen, Tanwin in the voice
    expect(new Set(spokenOnly.map((m) => m.key))).toEqual(SUKUN_GAPS);
  });

  it("no word is shown with Tanwin but spoken without it", () => {
    expect(shownOnly).toEqual([]);
  });

  it("the transliteration of a word shown with Tanwin ends in -un / -an / -in", () => {
    const wrong = pairs()
      .filter((p) => p.transliteration && words(p.displayed).length === 1 && TANWIN.test(p.displayed))
      .filter((p) => {
        const mark = Array.from(p.displayed).reverse().find((c) => ENDING[c])!;
        return !p.transliteration!.replace(/[.,?!]+$/, "").endsWith(ENDING[mark]!);
      })
      .map((p) => `${p.key}: ${p.displayed} "${p.transliteration}"`);
    expect(wrong).toEqual([]);
  });

  it("diptotes and the adverb أَثْنَاء are neither shown nor spoken with Tanwin", () => {
    const keys = ["lesson-1/hha/step-5/ahmar", "lesson-1/jim/step-5/ajmal", "lesson-1/tha/step-5/athna"];
    const found = pairs().filter((p) => keys.includes(p.key));
    expect(found.map((p) => p.key).sort()).toEqual([...keys].sort());
    for (const p of found) {
      expect(TANWIN.test(p.displayed), p.key).toBe(false);
      expect(TANWIN.test(p.spoken), p.key).toBe(false);
    }
  });

  it("خَسٌّ keeps its Shadda on screen and in the voice", () => {
    const khas = pairs().filter((p) => p.key.endsWith("/khas"));
    expect(khas.length).toBeGreaterThan(0);
    for (const p of khas) {
      expect(p.displayed, p.key).toBe("خَسٌّ");
      expect(p.spoken, p.key).toBe("خَسٌّ");
    }
  });
});

describe("Tanwin on screen does not touch the pronunciation targets", () => {
  it("every word card's target is unvocalised and has rules", () => {
    for (const { unit, lesson } of a1Entries()) {
      for (const s of lesson.steps) {
        if (s.kind !== "sound-words" && s.kind !== "words") continue;
        for (const w of s.groups.flatMap((g) => g.words)) {
          const label = `${unit.slug}/${lesson.slug}/${w.id}`;
          expect(w.exercise.target, label).not.toMatch(HARAKAT);
          expect(w.exercise.target, label).toBe(w.arabic.replace(HARAKAT, "").replace(/[؟?()]/g, "").replace(/\s+/g, " ").trim());
          expect(hasRulesFor(w.exercise.target), label).toBe(true);
        }
      }
    }
  });
});
