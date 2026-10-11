import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import A1StepPage from "@/app/a1/[unit]/[lesson]/[step]/page";
import { isLongWord, LETTER_NARRATION_FILES, letterRuleText } from "@/components/a1/forms/content";
import { FormsStep } from "@/components/a1/forms/forms-step";
import { a1LessonExercises, a1StepHref, a1StepKey, a1Unit1, getA1Lesson } from "@/data/a1";
import type { A1Lesson } from "@/data/types";
import { analyzeWord, formGlyph, hasHand, LETTER_FORMS, splitTiles } from "@/lib/arabic/letter-form";
import { alignPattern } from "@/lib/arabic/gap";
import { getLessonProgress } from "@/lib/progress";
import { buildAssessment } from "@/lib/pronunciation/assessment";
import { CONDITION_RULES } from "@/lib/pronunciation/rules";
import { isAllowedTarget, isAllowedTtsText } from "@/lib/pronunciation/targets";
import { WRITING_BOX } from "@/lib/writing/trace";

// A1 · Lektion 1 · ت ث ج ح خ (phase 2: data only). Every letter is checked
// against the brief: words and spellings, book order, Formen positions,
// neighbours, rules, writing data, recording script, the four step pages and
// the Formen flow.

type Words = Array<[id: string, arabic: string, german: string]>;
type Expected = {
  glyph: string;
  name: string;
  latin: string;
  words: [Words, Words, Words];
  forms: Array<[id: string, arabic: string, german: string]>;
  neighbors: string[];
  /** Writing: strokes per form (d = a dot) and the order hint. */
  strokes: string;
  orderHint: string;
};

const LETTERS: Record<string, Expected> = {
  ta: {
    glyph: "ت",
    name: "Ta",
    latin: "t",
    words: [
      [["taj", "تَاج", "Krone"], ["tamr", "تَمْر", "Datteln"], ["tall", "تَلّ", "Hügel"]],
      [["tilifun", "تِلِيفُون", "Telefon"], ["timthal", "تِمْثَال", "Statue"], ["tin", "تِين", "Feigen"]],
      [["tuffaha", "تُفَّاحَة", "Apfel"], ["tut", "تُوت", "Beeren"], ["tuna", "تُونَة", "Thunfisch"]],
    ],
    forms: [["tilifun", "تِلِيفُونُ", "Telefon"], ["kitab", "كِتَاب", "Buch"], ["bint", "بِنْت", "Mädchen"], ["banat", "بَنَات", "Mädchen (Plural)"], ["fatq", "فَتْق", "Riss"]],
    neighbors: ["ل", "ي", "ف", "ن", "ا"],
    strokes: "-dd",
    orderHint: "Zuerst das Ta, dann die Punkte.",
  },
  tha: {
    glyph: "ث",
    name: "Tha",
    latin: "th",
    words: [
      [["thawb", "ثَوْب", "Gewand"], ["thawm", "ثَوْم", "Knoblauch"], ["thalatha", "ثَلَاثَة", "drei"]],
      [["thiyab", "ثِيَاب", "Kleider"], ["thimar", "ثِمَار", "Früchte"], ["thiqab", "ثِقَاب", "Streichhölzer"]],
      [["thuluth", "ثُلُث", "Drittel"], ["thuban", "ثُعْبَان", "Schlange"], ["thuqb", "ثُقْب", "Loch"]],
    ],
    forms: [["thawb", "ثَوْب", "Gewand"], ["aththulatha", "الثُّلَاثَاءُ", "Dienstag"], ["thuluth", "ثُلُث", "Drittel"], ["athath", "أَثَاث", "Möbel"], ["athna", "أَثْنَاءَ", "während"]],
    neighbors: ["ب", "ل", "ن", "ا"],
    strokes: "-ddd",
    orderHint: "Zuerst das Tha, dann die Punkte.",
  },
  jim: {
    glyph: "ج",
    name: "Dschim",
    latin: "dsch",
    words: [
      [["jamal", "جَمَل", "Kamel"], ["jarida", "جَرِيدَة", "Zeitung"], ["jaras", "جَرَس", "Glocke"]],
      [["jilbab", "جِلْبَاب", "Gewand"], ["jibal", "جِبَال", "Berge"], ["jimal", "جِمَال", "Kamele"]],
      [["junud", "جُنُود", "Soldaten"], ["jubn", "جُبْن", "Käse"], ["jundiyy", "جُنْدِيّ", "Soldat"]],
    ],
    forms: [["jimal", "جِمَال", "Kamele"], ["aljundi", "الْجُنْدِي", "der Soldat"], ["nudj", "نُضْج", "Reife"], ["faraj", "فَرَج", "Erleichterung"], ["ajmal", "أَجْمَل", "schöner"]],
    neighbors: ["م", "ل", "ن", "ي", "ا"],
    strokes: "--d",
    orderHint: "Zuerst den Strich oben, dann den Bogen, dann den Punkt.",
  },
  hha: {
    glyph: "ح",
    name: "Ha",
    latin: "ḥ",
    words: [
      [["haqiba", "حَقِيبَة", "Tasche"], ["hadiqa", "حَدِيقَة", "Garten"], ["hafla", "حَفْلَة", "Feier"]],
      [["hisan", "حِصَان", "Pferd"], ["hidha", "حِذَاء", "Schuh"], ["hijara", "حِجَارَة", "Steine"]],
      [["hut", "حُوت", "Wal"], ["hujra", "حُجْرَة", "Zimmer"], ["hubub", "حُبُوب", "Körner"]],
    ],
    forms: [["himar", "حِمَار", "Esel"], ["alhafla", "الْحَفْلَة", "die Feier"], ["nasaha", "نَصَحَ", "er riet"], ["farih", "فَرِح", "froh"], ["ahmar", "أَحْمَر", "rot"]],
    neighbors: ["م", "ل", "ف", "ن", "ا"],
    strokes: "--",
    orderHint: "Zuerst den Strich oben, dann den Bogen.",
  },
  kha: {
    glyph: "خ",
    name: "Cha",
    latin: "ch",
    words: [
      [["khas", "خَس", "Salat"], ["khamsa", "خَمْسَة", "fünf"], ["khatam", "خَاتَم", "Ring"]],
      [["khiyar", "خِيَار", "Gurke"], ["khitab", "خِطَاب", "Brief"], ["khiyam", "خِيَام", "Zelte"]],
      [["khudar", "خُضَار", "Gemüse"], ["khudha", "خُوذَة", "Helm"], ["khubz", "خُبْز", "Brot"]],
    ],
    forms: [["khiyar", "خِيَار", "Gurke"], ["alkhubz", "الْخُبْز", "das Brot"], ["tabakh", "طَبَخ", "er kochte"], ["farkh", "فَرْخ", "Küken"], ["nakhla", "نَخْلَة", "Palme"]],
    neighbors: ["ي", "ل", "ب", "ط", "ا"],
    strokes: "--d",
    orderHint: "Zuerst den Strich oben, dann den Bogen, dann den Punkt.",
  },
};

const step = <K extends A1Lesson["steps"][number]["kind"]>(lesson: A1Lesson, kind: K) =>
  lesson.steps.find((s) => s.kind === kind) as Extract<A1Lesson["steps"][number], { kind: K }>;

const VOWELS = ["َ", "ِ", "ُ"];
const POSITIONS = ["start", "middle", "end", "separate"] as const;

describe.each(Object.entries(LETTERS))("%s – lesson data", (slug, x) => {
  const lesson = getA1Lesson("lesson-1", slug)!;

  it("an entry of Lektion 1 with its own letter; five steps like Alif, with the book titles, URLs and progress keys", () => {
    expect(lesson).toMatchObject({ slug, kind: "letter", label: x.glyph, labelGerman: x.name, letter: { id: slug, glyph: x.glyph, name: x.name } });
    const vowelled = VOWELS.map((v) => x.glyph + v).join(" · ");
    const shapes = LETTER_FORMS.map((f) => formGlyph(x.glyph, f)).join(" · ");
    const gapTiles = `${vowelled} · ${x.glyph}ْ`;
    expect(lesson.steps.map((s) => [s.slug, s.kind, s.title])).toEqual([
      ["step-1", "sound-words", `Wörter mit ${vowelled}`],
      ["step-2", "forms", `Formen: ${shapes}`],
      ["step-3", "writing", `Schreiben: ${shapes}`],
      ["step-4", "gaps", `Ergänzen: ${gapTiles}`],
      ["step-5", "gaps", `Hören: ${gapTiles}`],
    ]);
    expect(shapes).toBe(`${x.glyph}ـ · ـ${x.glyph}ـ · ـ${x.glyph} · ${x.glyph}`);
    expect(lesson.steps.map((s) => a1StepHref(a1Unit1, lesson, s.slug))).toEqual([1, 2, 3, 4, 5].map((n) => `/a1/lesson-1/${slug}/step-${n}`));
    expect(lesson.steps.map((s) => a1StepKey(a1Unit1, lesson, s.slug))).toEqual([1, 2, 3, 4, 5].map((n) => `a1/lesson-1/${slug}/step-${n}`));
  });

  it("Wörter rows start with the letter with Fatha, Kasra, Damma (the former step Laute)", () => {
    expect(step(lesson, "sound-words").groups.map(({ sound: s }) => [s.id, s.glyph, s.transliteration, s.exercise.target])).toEqual(
      ["fatha", "kasra", "damma"].map((v, i) => [`${slug}-${v}`, x.glyph + VOWELS[i], x.latin + "aiu"[i], x.glyph + VOWELS[i]])
    );
  });

  it("Wörter: exactly the book words, in book order, spelled as in the brief; every word with a picture file", () => {
    const { groups } = step(lesson, "sound-words");
    expect(groups.map((g) => g.words.map((w) => [w.id, w.arabic, w.german]))).toEqual(x.words);
    for (const [i, group] of groups.entries()) {
      expect(group.sound.glyph).toBe(x.glyph + VOWELS[i]);
      for (const word of group.words) {
        expect(word.arabic.slice(0, 2), word.id).toBe(group.sound.glyph);
        expect(word.image?.alt, word.id).toBeTruthy();
        expect(existsSync(path.join(process.cwd(), "public", word.image!.src)), word.image!.src).toBe(true);
        expect(word.transliteration, word.id).toBeTruthy();
      }
    }
  });

  it("every sound and word is accepted by /api/pronunciation (with rules) and /api/tts", () => {
    const exercises = a1LessonExercises(lesson);
    expect(exercises).toHaveLength(12);
    for (const exercise of exercises) {
      expect(CONDITION_RULES[exercise.target]?.excellent, exercise.target).toBeDefined();
      expect(isAllowedTarget(exercise.target), exercise.target).toBe(true);
      expect(isAllowedTtsText(exercise.modelText), exercise.modelText).toBe(true);
    }
  });

  it("sound rules: the right vowel passes, another vowel fails", () => {
    const assess = (target: string, phonemes: string[]) =>
      buildAssessment({
        target,
        primary: { referenceText: target, recognized: target, accuracy: 90, pronunciation: 90, fluency: 90, completeness: 100, firstSoundScore: 80, words: [] },
        masaar: null,
        iqra: { phonemes },
      }).passed;
    const consonant = { ta: ["t"], tha: [], jim: ["j"], hha: ["H"], kha: ["x"] }[slug]!;
    const vowels = ["aa", "i", "u"];
    for (const [i, mark] of VOWELS.entries()) {
      const target = x.glyph + mark;
      expect(assess(target, [...consonant, vowels[i]!]), target).toBe(true);
      for (const [j, other] of vowels.entries()) if (j !== i) expect(assess(target, [...consonant, other]), `${target} heard as ${other}`).toBe(false);
      if (consonant.length) expect(assess(target, ["b", vowels[i]!]), `${target} without its consonant`).toBe(false);
    }
  });

  it("Ergänzen / Hören: book patterns align with the full words; answers among the four tiles; pictures only in Ergänzen", () => {
    const [fill, listen] = lesson.steps.filter((s) => s.kind === "gaps") as Array<Extract<A1Lesson["steps"][number], { kind: "gaps" }>>;
    expect([fill!.gaps.mode, listen!.gaps.mode]).toEqual(["picture", "listen"]);
    expect([fill!.gaps.items.length, listen!.gaps.items.length]).toEqual([9, 10]);
    const choices = [...VOWELS.map((v) => x.glyph + v), x.glyph + "ْ"];
    for (const { gaps } of [fill!, listen!]) {
      expect(gaps.choices).toEqual(choices);
      expect(gaps.narration).toEqual(gaps.mode === "picture" ? { intro: "shared/g5_intro", done: "shared/g5_done" } : { intro: "shared/g6_intro", done: "shared/g6_done" });
      for (const item of gaps.items) {
        const slots = alignPattern(item.arabic, item.pattern!);
        // The pattern with every "_" replaced by its answer is the full word.
        let k = 0;
        expect(splitTiles(item.pattern!).map((t) => (t === "_" ? slots[k++]!.answer : t)).join(""), item.pattern).toBe(item.arabic);
        expect(slots.length, item.pattern).toBe(item.pattern!.split("_").length - 1);
        for (const slot of slots) expect(choices, `${item.arabic}: ${slot.answer}`).toContain(slot.answer);
        expect(item.german, item.arabic).toBeTruthy();
        expect(item.audio).toBe(`${slug}/uebungen/${item.id}`);
        if (gaps.mode === "picture") expect(existsSync(path.join(process.cwd(), "public", item.image!.src)), item.arabic).toBe(true);
        else expect(item.image, item.arabic).toBeUndefined();
      }
    }
  });

  it("Formen: the four book words in position order and the sukun word; the forms are computed", () => {
    const { forms } = step(lesson, "forms");
    expect(forms.audioBase).toBe(`/audio/a1/${slug}/formen`);
    expect(forms.sort.map((w) => [w.audio, w.arabic, w.german])).toEqual(x.forms);
    expect(forms.explain).toBe(forms.build);
    expect(forms.explain.map((w) => analyzeWord(w.arabic, x.glyph, w.occurrence).form)).toEqual([...POSITIONS]);
    const sukun = forms.sort[4]!;
    expect(splitTiles(sukun.arabic)[analyzeWord(sukun.arabic, x.glyph, sukun.occurrence).index]).toBe(x.glyph + "ْ");
  });

  it("Formen: neighbours from the Formen and sukun words – at least three with a Hand, at least one without", () => {
    const { forms } = step(lesson, "forms");
    expect(forms.neighbors).toEqual(x.neighbors);
    expect(forms.neighbors.filter(hasHand).length).toBeGreaterThanOrEqual(3);
    expect(forms.neighbors.filter((n) => !hasHand(n))).toEqual(["ا"]);
    const letters = new Set(forms.sort.flatMap((w) => splitTiles(w.arabic).map((t) => t[0])));
    for (const n of forms.neighbors) expect(letters.has(n), n).toBe(true);
  });

  it("Formen: one German text per clip, with the letter's name; the rule as in the brief", () => {
    const texts = step(lesson, "forms").forms.letter!.texts;
    expect(Object.keys(texts).sort()).toEqual([...LETTER_NARRATION_FILES].sort());
    expect(texts.n_rule).toBe(letterRuleText(x.name));
    expect(texts.n_rule).toBe(`Das ${x.name} hat eine Hand. Es hält immer den nächsten Buchstaben fest. Und der Nachbar davor hält das ${x.name} fest, wenn er eine Hand hat.`);
    expect(texts.f_intro).toContain(`Formen vom ${x.name}`);
    for (const [file, text] of Object.entries(texts)) {
      expect(text, file).not.toMatch(/\bBa\b/);
      expect(text, file).not.toContain("(");
      for (const sentence of text.split(/[.!?]\s/)) expect(sentence.split(" ").length, `${file}: ${sentence}`).toBeLessThanOrEqual(16);
    }
  });

  it("Schreiben: four forms in book order (right to left), body first, dots last; inside the box", () => {
    const { letterSet } = step(lesson, "writing");
    expect(letterSet.id).toBe(slug);
    expect(letterSet.orderHint).toBe(x.orderHint);
    expect(letterSet.forms.map((f) => f.glyph)).toEqual(LETTER_FORMS.map((f) => formGlyph(x.glyph, f)));
    expect(letterSet.forms.map((f) => f.id)).toEqual([`${slug}-start`, `${slug}-middle`, `${slug}-end`, slug]);
    const numbers = (d: string) => (d.replace(/A3 3 0 1 1/g, "").match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
    const points = (d: string) => {
      const n = numbers(d);
      return Array.from({ length: n.length / 2 }, (_, i) => ({ x: n[2 * i]!, y: n[2 * i + 1]! }));
    };
    for (const form of letterSet.forms) {
      expect(form.name, form.id).toMatch(new RegExp(`^das ${x.name} `));
      expect(form.strokes.map((s) => (s.dot ? "d" : "-")).join(""), form.id).toBe(x.strokes);
      for (const [i, stroke] of form.strokes.entries()) {
        if (i > 0) expect(stroke.label, `${form.id} ${i}`).toBeTruthy();
        for (const p of points(stroke.d)) {
          expect(p.x, form.id).toBeGreaterThanOrEqual(0);
          expect(p.x, form.id).toBeLessThanOrEqual(WRITING_BOX.W);
          expect(p.y, form.id).toBeGreaterThanOrEqual(0);
          expect(p.y, form.id).toBeLessThanOrEqual(WRITING_BOX.H);
        }
        // Lines are written from right to left (start right of the end), except the bowl of ح ج خ, which turns back to the right.
        if (!stroke.dot && stroke.label !== "den Bogen") expect(points(stroke.d)[0]!.x, `${form.id} ${i}`).toBeGreaterThan(points(stroke.d).at(-1)!.x);
      }
      // Dots: the right one before the left one; for ث the top one first.
      const dots = form.strokes.filter((s) => s.dot).map((s) => points(s.d)[0]!);
      if (slug === "tha") expect(dots[0]!.y).toBeLessThan(Math.min(dots[1]!.y, dots[2]!.y));
      const row = slug === "tha" ? dots.slice(1) : dots;
      for (let i = 1; i < row.length; i++) expect(row[i - 1]!.x, form.id).toBeGreaterThan(row[i]!.x);
      for (let i = 0; i < dots.length; i++) for (let j = i + 1; j < dots.length; j++) expect(Math.hypot(dots[i]!.x - dots[j]!.x, dots[i]!.y - dots[j]!.y), `${form.id} dots ${i} ${j}`).toBeGreaterThan(30);
      // Above or below: ت ث خ above the baseline, ج below the head.
      for (const d of dots) {
        if (slug === "jim") expect(d.y, form.id).toBeGreaterThan(240);
        else expect(d.y, form.id).toBeLessThan(WRITING_BOX.BASE - 30);
      }
    }
    for (const id of [`${slug}-middle`, `${slug}-end`]) expect(points(letterSet.forms.find((f) => f.id === id)!.strokes[0]!.d)[0]).toEqual({ x: 214, y: 262 });
  });

  it(`recording script docs/audio-scripts/${slug}.md lists every clip with its text and every Formen word`, () => {
    const file = path.join(process.cwd(), `docs/audio-scripts/${slug}.md`);
    expect(existsSync(file)).toBe(true);
    const script = readFileSync(file, "utf8");
    const { forms } = step(lesson, "forms");
    for (const name of LETTER_NARRATION_FILES) {
      expect(script, name).toContain(`${name}.wav`);
      expect(script, name).toContain(forms.letter!.texts[name]!);
    }
    for (const word of forms.sort) expect(script).toContain(`${word.audio}.wav\` – ${word.arabic}`);
  });
});

describe("long words (more than five tiles) get the narrow tiles; Alif and Ba keep their layout", () => {
  it("only words of the new letters are long", () => {
    const long = (slug: string) => {
      const { forms } = step(getA1Lesson("lesson-1", slug)!, "forms");
      return [...forms.explain, ...forms.build, ...forms.sort].filter((w) => isLongWord(splitTiles(w.arabic))).map((w) => w.arabic);
    };
    expect(long("alif")).toEqual([]);
    expect(long("ba")).toEqual([]);
    expect(new Set(Object.keys(LETTERS).flatMap(long))).toEqual(new Set(["تِلِيفُونُ", "الثُّلَاثَاءُ", "الْجُنْدِي", "الْحَفْلَة"]));
  });
});

describe.each(Object.keys(LETTERS))("%s – step pages", (slug) => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  const renderStep = async (s: string) => render(await A1StepPage({ params: Promise.resolve({ unit: "lesson-1", lesson: slug, step: s }) }));

  it("Schritt N von 5; Weiter / Zurück; the last step leads back to the lesson and on to the next entry", async () => {
    const entries = a1Unit1.lessons.map((l) => l.slug);
    for (const n of [1, 2, 3, 4, 5]) {
      await renderStep(`step-${n}`);
      expect(screen.getByTestId("step-position")).toHaveTextContent(`Schritt ${n} von 5`);
      expect(screen.getByText("A1 · Lektion 1 · Guten Morgen")).toBeInTheDocument();
      expect(screen.getByTestId("back-to-unit")).toHaveAttribute("href", "/a1/lesson-1");
      if (n > 1) expect(screen.getByTestId("step-prev")).toHaveAttribute("href", `/a1/lesson-1/${slug}/step-${n - 1}`);
      if (n < 5) expect(screen.getByTestId("step-next")).toHaveAttribute("href", `/a1/lesson-1/${slug}/step-${n + 1}`);
      if (n === 5) {
        expect(screen.queryByTestId("step-next")).toBeNull();
        expect(screen.getByTestId("back-to-unit-end")).toHaveAttribute("href", "/a1/lesson-1");
        expect(screen.getByTestId("next-entry")).toHaveAttribute("href", `/a1/lesson-1/${entries[entries.indexOf(slug) + 1]}`);
      }
      cleanup();
    }
  });
});

// ---------------------------------------------------------------------------
// The Formen flow of every letter (a stand-in for the ONE audio element, as in a1-letters.test.tsx).

const played: string[] = [];
class FakeAudio {
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  paused = true;
  src = "";
  play() {
    const src = this.src;
    if (!src.startsWith("data:")) played.push(src.split("/").pop()!.replace(".wav", ""));
    this.paused = false;
    setTimeout(() => {
      if (!this.paused && this.src === src) this.onended?.();
    }, src.startsWith("data:") ? 1 : 5);
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
}

describe.each(Object.entries(LETTERS))("%s – Formen, the four parts", (slug, x) => {
  beforeEach(() => {
    played.length = 0;
    window.localStorage.clear();
    vi.stubGlobal("Audio", FakeAudio);
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  const { forms } = step(getA1Lesson("lesson-1", slug)!, "forms");
  const drop = async (letter: string, side: "left" | "right") => {
    played.length = 0;
    fireEvent.click(screen.getByTestId(`neighbor-${letter}`));
    fireEvent.click(screen.getByTestId(`zone-${side}`));
    await waitFor(() => expect(played.length).toBeGreaterThan(0));
  };

  it("start → Zuschauen → build the four words → both sides → four baskets → Geschafft", async () => {
    render(<FormsStep forms={forms} availableAudio={[...LETTER_NARRATION_FILES, ...forms.sort.map((w) => w.audio)]} progressKey={`a1/lesson-1/${slug}/step-2`} />);
    const overlay = await screen.findByTestId("start-overlay");
    expect(overlay).toHaveTextContent(LETTER_FORMS.map((f) => formGlyph(x.glyph, f)).join(" · "));
    expect(screen.getByTestId("activity-tab-3")).toHaveTextContent(`Wo steht das ${x.name}?`);
    fireEvent.click(screen.getByTestId("start-button"));
    await waitFor(() => expect(played.slice(0, 2)).toEqual(["f_intro", "e_intro"]));
    for (let i = 0; i < 5 && !/Weiter zur Übung/.test(screen.getByTestId("explain-next").textContent ?? ""); i++) fireEvent.click(screen.getByTestId("explain-next"));
    fireEvent.click(screen.getByTestId("explain-next"));
    await waitFor(() => expect(screen.getByTestId("build-activity")).toBeInTheDocument());

    for (const [w, word] of forms.build.entries()) {
      played.length = 0;
      for (const [i, tile] of splitTiles(word.arabic).entries()) {
        fireEvent.click(screen.getAllByTestId(`tile-${tile}`)[0]!);
        fireEvent.click(screen.getByTestId(`slot-${i}`));
      }
      await waitFor(() => expect(screen.getByTestId(`build-word-${word.id}`)).toHaveAttribute("data-phase", "done"));
      const built = screen.getByTestId(`built-word-${word.id}`);
      expect(built).toHaveTextContent(word.arabic);
      expect(built).toHaveAttribute("data-holds-next", String(w < 2));
      // The recording of the word, then the narration for its position.
      await waitFor(() => expect(played).toEqual([word.audio, `b_done_${POSITIONS[w]}`]));
      fireEvent.click(screen.getByTestId("build-next"));
    }
    await waitFor(() => expect(screen.getByTestId("neighbors-activity")).toHaveAttribute("data-variant", "letter"));

    const withHand = forms.neighbors.find(hasHand)!;
    await drop("ا", "left");
    expect(played).toEqual(["n_next"]);
    expect(screen.getByTestId("pair")).toHaveAttribute("data-holds-next", "true");
    await drop(withHand, "right");
    expect(played).toEqual(["n_hold"]);
    expect(screen.getByTestId("pair")).toHaveAttribute("data-held", "true");
    await drop("ا", "right");
    expect(played).toEqual(["n_nohold"]);
    expect(screen.getByTestId("pair")).toHaveAttribute("data-held", "false");
    expect(screen.queryByTestId("rule-card")).toBeNull();
    await drop(withHand, "left");
    await waitFor(() => expect(played).toEqual(["n_next", "n_rule"]));
    expect(screen.getByTestId("rule-card")).toHaveTextContent(letterRuleText(x.name));
    played.length = 0;
    fireEvent.click(screen.getByTestId("neighbors-next"));
    await waitFor(() => expect(played).toEqual(["s_intro"]));

    for (const form of POSITIONS) expect(within(screen.getByTestId(`basket-${form}`)).getByText(formGlyph(x.glyph, form))).toBeInTheDocument();
    const seen: string[] = [];
    for (let i = 0; i < forms.sort.length; i++) {
      await waitFor(() => expect(screen.getByTestId("sort-word")).toHaveAttribute("data-phase", "ask"));
      const id = screen.getByTestId("sort-word").getAttribute("data-word")!;
      const word = forms.sort.find((w) => w.id === id)!;
      const expected = analyzeWord(word.arabic, x.glyph, word.occurrence).form;
      expect(screen.getByTestId("sort-word")).toHaveAttribute("data-expected", expected);
      seen.push(id);
      fireEvent.click(screen.getByTestId(`basket-${expected}`));
      await waitFor(() => expect(screen.getByTestId("sort-shaped")).toBeInTheDocument());
      await waitFor(() => expect(screen.queryByTestId("sort-word")?.getAttribute("data-word") !== id || screen.queryByTestId("sort-done")).toBeTruthy(), { timeout: 3000 });
    }
    expect(seen.sort()).toEqual(forms.sort.map((w) => w.id).sort());
    expect(await screen.findByTestId("sort-done")).toHaveTextContent(`Du erkennst die vier Formen vom ${x.name}.`);
    expect(getLessonProgress(`a1/lesson-1/${slug}/step-2`).completedAt).toBeTruthy();
  }, 40_000);
});
