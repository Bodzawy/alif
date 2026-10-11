import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import A1Page from "@/app/a1/page";
import A1UnitPage from "@/app/a1/[unit]/page";
import A1StepPage from "@/app/a1/[unit]/[lesson]/[step]/page";
import { EXPLAIN_FILES, LETTER_NARRATION_FILES, letterRuleText } from "@/components/a1/forms/content";
import { FormsStep } from "@/components/a1/forms/forms-step";
import { SoundWordsStep } from "@/components/a1/sound-words-step";
import { a1LessonExercises, a1StepHref, a1StepKey, a1Unit1, getA1Lesson } from "@/data/a1";
import { baWriting } from "@/data/letters/ba";
import type { A1Lesson } from "@/data/types";
import { analyzeWord, hasHand, splitTiles } from "@/lib/arabic/letter-form";
import { getLessonProgress } from "@/lib/progress";
import { buildAssessment } from "@/lib/pronunciation/assessment";
import { CONDITION_RULES } from "@/lib/pronunciation/rules";
import { isAllowedTarget, isAllowedTtsText } from "@/lib/pronunciation/targets";

// A1 · Lektion 1, the letter entries (ب here; ت ث ج ح خ in a1-letter-set.test.tsx).
// Five steps each, like Alif: Wörter (each row starts with its sound), Formen,
// Schreiben, Ergänzen, Hören.

const ba = getA1Lesson("lesson-1", "ba")!;
const step = <K extends A1Lesson["steps"][number]["kind"]>(lesson: A1Lesson, slug: string, kind: K) => {
  const found = lesson.steps.find((s) => s.slug === slug)!;
  if (found.kind !== kind) throw new Error(`${slug} must be ${kind}`);
  return found as Extract<A1Lesson["steps"][number], { kind: K }>;
};

describe("Ba – lesson data", () => {
  it("is the entry after Alif in Lektion 1 (الدرس الأول – صَبَاحُ الْخَيْر)", () => {
    expect(a1Unit1.lessons.map((l) => l.slug)).toEqual(["alif", "ba", "ta", "tha", "jim", "hha", "kha", "review", "sabah-al-khayr"]);
    expect(a1Unit1).toMatchObject({ slug: "lesson-1", number: 1, title: "صَبَاحُ الْخَيْر", titleGerman: "Guten Morgen" });
    expect(ba).toMatchObject({ slug: "ba", kind: "letter", label: "ب", labelGerman: "Ba", letter: { id: "ba", glyph: "ب", name: "Ba" } });
  });

  it("has five steps with the book titles, URLs and progress keys", () => {
    expect(ba.steps.map((s) => [s.slug, s.kind, s.title, s.navLabel ?? null])).toEqual([
      ["step-1", "sound-words", "Wörter mit بَ · بِ · بُ", "Wörter"],
      ["step-2", "forms", "Formen: بـ · ـبـ · ـب · ب", "Formen"],
      ["step-3", "writing", "Schreiben: بـ · ـبـ · ـب · ب", "Schreiben"],
      ["step-4", "gaps", "Ergänzen: بَ · بِ · بُ · بْ", "Ergänzen"],
      ["step-5", "gaps", "Hören: بَ · بِ · بُ · بْ", "Hören"],
    ]);
    expect(ba.steps.map((s) => a1StepHref(a1Unit1, ba, s.slug))).toEqual([1, 2, 3, 4, 5].map((n) => `/a1/lesson-1/ba/step-${n}`));
    expect(ba.steps.map((s) => a1StepKey(a1Unit1, ba, s.slug))).toEqual([1, 2, 3, 4, 5].map((n) => `a1/lesson-1/ba/step-${n}`));
  });

  it("Wörter rows start with بَ بِ بُ and their vowel names (the former step Laute)", () => {
    const sounds = step(ba, "step-1", "sound-words").groups.map((g) => g.sound);
    expect(sounds.map((s) => [s.id, s.glyph, s.transliteration, s.vowelName.german, s.exercise.target])).toEqual([
      ["ba-fatha", "بَ", "ba", "Fatha", "بَ"],
      ["ba-kasra", "بِ", "bi", "Kasra", "بِ"],
      ["ba-damma", "بُ", "bu", "Damma", "بُ"],
    ]);
  });

  it("Wörter: exactly the book words, in book order, spelled as in the brief; each with its picture", () => {
    const { groups } = step(ba, "step-1", "sound-words");
    expect(groups.map((g) => [g.sound.glyph, g.words.map((w) => [w.id, w.arabic, w.german])])).toEqual([
      ["بَ", [["banat", "بَنَات", "Mädchen (Plural)"], ["bayt", "بَيْت", "Haus"], ["bab", "بَاب", "Tür"]]],
      ["بِ", [["bint", "بِنْت", "Mädchen"], ["bir", "بِئْر", "Brunnen"], ["bitaqa", "بِطَاقَة", "Karte"]]],
      ["بُ", [["bunduqiyya", "بُنْدُقِيَّة", "Gewehr"], ["burtuqal", "بُرْتُقَال", "Orangen"], ["burj", "بُرْج", "Turm"]]],
    ]);
    for (const group of groups) {
      for (const word of group.words) {
        expect(word.arabic.slice(0, 2), word.id).toBe(group.sound.glyph);
        expect(existsSync(path.join(process.cwd(), "public", word.image!.src)), word.id).toBe(true);
        expect(word.exercise).toEqual({ id: word.id, target: word.arabic.replace(/[ً-ْ]/g, ""), modelText: word.arabic });
        expect(word.transliteration).toBeTruthy();
      }
    }
  });

  it("every sound and word is accepted by /api/pronunciation (with rules) and /api/tts", () => {
    const exercises = a1LessonExercises(ba);
    expect(exercises).toHaveLength(12);
    for (const exercise of exercises) {
      expect(CONDITION_RULES[exercise.target]?.excellent, exercise.target).toBeDefined();
      expect(isAllowedTarget(exercise.target), exercise.target).toBe(true);
      expect(isAllowedTtsText(exercise.modelText), exercise.modelText).toBe(true);
    }
  });

  it("sound rules: the ب and its vowel – the right vowel passes, another vowel or no ب fails", () => {
    const assess = (target: string, phonemes: string[]) =>
      buildAssessment({
        target,
        primary: { referenceText: target, recognized: target, accuracy: 90, pronunciation: 90, fluency: 90, completeness: 100, firstSoundScore: 80, words: [] },
        masaar: null,
        iqra: { phonemes },
      });
    const heard = { "بَ": ["b", "aa"], "بِ": ["b", "i"], "بُ": ["b", "u"] } as const;
    for (const target of Object.keys(heard) as Array<keyof typeof heard>) {
      expect(assess(target, [...heard[target]]).passed, target).toBe(true);
      expect(assess(target, [heard[target][1]]).passed, `${target} without b`).toBe(false);
      for (const other of Object.keys(heard) as Array<keyof typeof heard>) {
        if (other !== target) expect(assess(target, [...heard[other]]).passed, `${target} heard as ${other}`).toBe(false);
      }
    }
  });

  it("Formen: the four book words (start, middle, end, separate) and the sukun word, forms computed", () => {
    const { forms } = step(ba, "step-2", "forms");
    expect(forms.audioBase).toBe("/audio/a1/ba/formen");
    expect(forms.explain).toBe(forms.build);
    expect(forms.explain.map((w) => [w.audio, w.arabic, w.german, analyzeWord(w.arabic, "ب").form])).toEqual([
      ["bitaqa", "بِطَاقَة", "Karte", "start"],
      ["shubbak", "شِبَّاك", "Fenster", "middle"],
      ["kalb", "كَلْب", "Hund", "end"],
      ["kitab", "كِتَاب", "Buch", "separate"],
    ]);
    expect(forms.sort.map((w) => w.arabic)).toEqual(["بِطَاقَة", "شِبَّاك", "كَلْب", "كِتَاب", "نَبْق"]);
    expect(analyzeWord("نَبْق", "ب").form).toBe("middle");
  });

  it("Formen: neighbours from the Formen and sukun words – four with a Hand, the Alif without", () => {
    const { forms } = step(ba, "step-2", "forms");
    expect(forms.neighbors).toEqual(["ط", "ق", "ش", "ك", "ا"]);
    expect(forms.neighbors.filter(hasHand)).toHaveLength(4);
    const letters = new Set(forms.sort.flatMap((w) => splitTiles(w.arabic).map((t) => t[0])));
    for (const n of forms.neighbors) expect(letters.has(n), n).toBe(true);
  });

  it("Formen: one German text per narration clip (caption and recording script), the rule as on the card", () => {
    const { forms } = step(ba, "step-2", "forms");
    const texts = forms.letter!.texts;
    expect(Object.keys(texts).sort()).toEqual([...LETTER_NARRATION_FILES].sort());
    expect(new Set(LETTER_NARRATION_FILES).size).toBe(LETTER_NARRATION_FILES.length);
    for (const file of EXPLAIN_FILES) expect(texts[file], file).toBeTruthy();
    expect(texts.n_rule).toBe(letterRuleText("Ba"));
    expect(letterRuleText("Ba")).toBe("Das Ba hat eine Hand. Es hält immer den nächsten Buchstaben fest. Und der Nachbar davor hält das Ba fest, wenn er eine Hand hat.");
    expect(texts.e_start_a).toContain("Karte");
    // Short sentences for young children.
    for (const [file, text] of Object.entries(texts)) for (const sentence of text.split(/[.!?]\s/)) expect(sentence.split(" ").length, `${file}: ${sentence}`).toBeLessThanOrEqual(16);
  });

  it("Schreiben: the Ba letter set", () => {
    expect(step(ba, "step-3", "writing").letterSet).toBe(baWriting);
  });
});

describe("Alif keeps its content", () => {
  it("Alif's steps are the ones it had before (tests/fixtures/a1/lesson-1.json) – without Laute, which is part of Wörter; Formen words got pictures", () => {
    const fixture = JSON.parse(readFileSync(path.join(process.cwd(), "tests/fixtures/a1/lesson-1.json"), "utf8"));
    const [laute, ...rest] = fixture.steps;
    // The Laute content (أَ إِ أُ with listen and speak) is the sound of each Wörter row.
    const words = getA1Lesson("lesson-1", "alif")!.steps[0]!;
    expect(words.kind === "sound-words" && words.groups.map((g) => g.sound)).toEqual(laute.sounds);
    const now = JSON.parse(JSON.stringify(getA1Lesson("lesson-1", "alif")!.steps));
    for (const s of now) {
      if (s.kind === "forms") for (const w of [...s.forms.explain, ...s.forms.build, ...s.forms.sort]) if (w.id !== "ana") delete w.image;
    }
    expect(now.map(({ slug: _slug, ...s }: { slug: string }) => s)).toEqual(rest.map(({ slug: _slug, ...s }: { slug: string }) => s));
    expect(now.map((s: { slug: string }) => s.slug)).toEqual(["step-1", "step-2", "step-3", "step-4", "step-5"]);
  });
});

describe("/a1 and the step pages of a letter", () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("/a1 shows ONE lesson card: الدرس الأول – صَبَاحُ الْخَيْر, leading to its contents", () => {
    render(<A1Page />);
    const cards = screen.getAllByTestId(/^a1-lesson-[^-]+-\d+$/);
    expect(cards.map((c) => c.getAttribute("data-testid"))).toEqual(["a1-lesson-lesson-1"]);
    const card = cards[0]!;
    expect(card).toHaveAttribute("href", "/a1/lesson-1");
    expect(card).toHaveTextContent("الدرس الأول");
    expect(card).toHaveTextContent("صَبَاحُ الْخَيْر");
    expect(card).toHaveTextContent("Lektion 1 · Guten Morgen");
    expect(card).toHaveTextContent("9 Teile");
    expect(within(card).getByTestId("a1-lesson-lesson-1-letters")).toHaveTextContent("أ · ب · ت · ث · ج · ح · خ");
  });

  it("the lesson's contents: أ ب ت ث ج ح خ, مراجعة, صَبَاحُ الْخَيْر – in this order, each leading to its first step", async () => {
    render(await A1UnitPage({ params: Promise.resolve({ unit: "lesson-1" }) }));
    expect(screen.getByTestId("unit-title")).toHaveTextContent("صَبَاحُ الْخَيْر");
    const entries = within(screen.getByTestId("unit-contents")).getAllByRole("link");
    expect(entries.map((e) => e.querySelector("[data-testid$='-label']")!.textContent)).toEqual(["أ", "ب", "ت", "ث", "ج", "ح", "خ", "مُرَاجَعَة", "صَبَاحُ الْخَيْر"]);
    expect(entries.map((e) => e.getAttribute("href"))).toEqual(["alif", "ba", "ta", "tha", "jim", "hha", "kha", "review", "sabah-al-khayr"].map((slug) => `/a1/lesson-1/${slug}`));
    expect(screen.getByTestId("back-to-a1")).toHaveAttribute("href", "/a1");
  });

  const renderStep = async (slug: string) => render(await A1StepPage({ params: Promise.resolve({ unit: "lesson-1", lesson: "ba", step: slug }) }));

  it("Schritt N von 5; Weiter / Zurück between the steps; the last step leads back to the lesson or on to ت", async () => {
    await renderStep("step-2");
    const pills = within(screen.getByRole("list", { name: "Schritte" })).getAllByRole("link");
    expect(pills.map((p) => p.textContent?.replace(/\s+/g, " ").trim())).toEqual([
      "1 Wörter mit بَ · بِ · بُ",
      "2 Formen: بـ · ـبـ · ـب · ب",
      "3 Schreiben: بـ · ـبـ · ـب · ب",
      "4 Ergänzen: بَ · بِ · بُ · بْ",
      "5 Hören: بَ · بِ · بُ · بْ",
    ]);
    expect(screen.getByTestId("lesson-title")).toHaveTextContent("صَبَاحُ الْخَيْر");
    expect(screen.getByTestId("entry-title")).toHaveTextContent("ب Ba");
    expect(screen.getByText("A1 · Lektion 1 · Guten Morgen")).toBeInTheDocument();
    expect(screen.getByTestId("back-to-unit")).toHaveAttribute("href", "/a1/lesson-1");
    expect(screen.getByTestId("step-position")).toHaveTextContent("Schritt 2 von 5");
    expect(screen.getByTestId("step-prev")).toHaveAttribute("href", "/a1/lesson-1/ba/step-1");
    expect(screen.getByTestId("step-prev")).toHaveTextContent("Zurück: Wörter");
    expect(screen.getByTestId("step-next")).toHaveAttribute("href", "/a1/lesson-1/ba/step-3");
    expect(screen.getByTestId("step-next")).toHaveTextContent("Weiter: Schreiben");
    cleanup();

    await renderStep("step-5");
    expect(screen.getByTestId("step-position")).toHaveTextContent("Schritt 5 von 5");
    expect(screen.queryByTestId("step-next")).toBeNull();
    expect(screen.getByTestId("back-to-unit-end")).toHaveAttribute("href", "/a1/lesson-1");
    expect(screen.getByTestId("next-entry")).toHaveAttribute("href", "/a1/lesson-1/ta");
    expect(screen.getByTestId("next-entry")).toHaveTextContent("Weiter: ت Ta");
    cleanup();

    await renderStep("step-1");
    expect(screen.getByTestId("step-position")).toHaveTextContent("Schritt 1 von 5");
    expect(screen.queryByTestId("step-prev")).toBeNull();
    expect(screen.getByTestId("sound-glyph-ba-fatha")).toHaveTextContent("بَ");
  });

  it("Wörter: every card shows its picture above the word, the German meaning and the controls", () => {
    const { groups } = step(ba, "step-1", "sound-words");
    render(<SoundWordsStep groups={groups} />);
    for (const word of groups.flatMap((g) => g.words)) {
      const card = screen.getByTestId(`vocab-card-${word.id}`);
      const img = within(card).getByTestId(`vocab-image-${word.id}`);
      expect(img).toHaveAttribute("src", word.image!.src);
      expect(img).toHaveAttribute("alt", word.image!.alt);
      expect(within(card).queryByTestId(`vocab-text-${word.id}`)).toBeNull();
      // Picture first, then Arabic, German, transliteration and the controls.
      const order = [img, within(card).getByTestId(`vocab-arabic-${word.id}`), within(card).getByTestId(`exercise-${word.id}-record`)];
      for (let i = 1; i < order.length; i++) expect(order[i - 1]!.compareDocumentPosition(order[i]!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(card).toHaveTextContent(word.german);
    }
  });

  it("a picture that fails to load is replaced by the word (no broken image) and reported", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const { groups } = step(ba, "step-1", "sound-words");
    render(<SoundWordsStep groups={groups} />);
    const word = groups[0]!.words[0]!;
    fireEvent.error(screen.getByTestId(`vocab-image-${word.id}`));
    expect(screen.queryByTestId(`vocab-image-${word.id}`)).toBeNull();
    expect(screen.getByTestId(`vocab-text-${word.id}`)).toHaveAttribute("data-broken-image", word.image!.src);
    expect(error).toHaveBeenCalledWith(`Vocabulary picture missing: ${word.image!.src}`);
  });
});

// ---------------------------------------------------------------------------
// Formen of a letter with a Hand of its own (a stand-in for the ONE audio element, as in a1-forms.test.tsx).

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

describe("Ba – Formen, the four parts", () => {
  beforeEach(() => {
    played.length = 0;
    window.localStorage.clear();
    vi.stubGlobal("Audio", FakeAudio);
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  const { forms } = step(ba, "step-2", "forms");
  const drop = async (letter: string, side: "left" | "right") => {
    played.length = 0;
    fireEvent.click(screen.getByTestId(`neighbor-${letter}`));
    fireEvent.click(screen.getByTestId(`zone-${side}`));
    await waitFor(() => expect(played.length).toBeGreaterThan(0));
  };

  it("start → Zuschauen → build the four words → both sides → four baskets → Geschafft", async () => {
    render(<FormsStep forms={forms} availableAudio={[...LETTER_NARRATION_FILES]} progressKey="a1/lesson-1/ba/step-2" />);
    const overlay = await screen.findByTestId("start-overlay");
    expect(overlay).toHaveTextContent("بـ · ـبـ · ـب · ب");
    expect(overlay).toHaveTextContent("Das Ba sieht nicht immer gleich aus.");
    expect(screen.getByTestId("activity-tab-3")).toHaveTextContent("Wo steht das Ba?");
    fireEvent.click(screen.getByTestId("start-button"));
    await waitFor(() => expect(played.slice(0, 2)).toEqual(["f_intro", "e_intro"]));
    // Captions come from the letter's text table.
    await waitFor(() => expect(screen.getByTestId("explain-caption")).toHaveTextContent(forms.letter!.texts.e_start_a!));

    // Zuschauen: skip to the last scene, then on to the exercises.
    for (let i = 0; i < 5 && !/Weiter zur Übung/.test(screen.getByTestId("explain-next").textContent ?? ""); i++) fireEvent.click(screen.getByTestId("explain-next"));
    fireEvent.click(screen.getByTestId("explain-next"));
    await waitFor(() => expect(screen.getByTestId("build-activity")).toBeInTheDocument());

    // Activity 1: a wrong tile, then the four words; the position label is computed.
    played.length = 0;
    fireEvent.click(screen.getByTestId("tile-طَ"));
    fireEvent.click(screen.getByTestId("slot-0"));
    await waitFor(() => expect(played).toEqual(["b_wrong"]));
    const labels = ["في أول الكلمة", "في المنتصف", "في آخر الكلمة", "منفصلة"];
    const positions = ["start", "middle", "end", "separate"];
    for (const [w, word] of forms.build.entries()) {
      played.length = 0;
      for (const [i, tile] of splitTiles(word.arabic).entries()) {
        fireEvent.click(screen.getByTestId(`tile-${tile}`));
        fireEvent.click(screen.getByTestId(`slot-${i}`));
      }
      await waitFor(() => expect(screen.getByTestId(`build-word-${word.id}`)).toHaveAttribute("data-phase", "done"));
      expect(screen.getByTestId("build-position")).toHaveTextContent(labels[w]!);
      const built = screen.getByTestId(`built-word-${word.id}`);
      expect(built).toHaveTextContent(word.arabic);
      expect(built).toHaveAttribute("data-holds-next", String(positions[w] === "start" || positions[w] === "middle"));
      await waitFor(() => expect(played).toEqual([`b_done_${positions[w]}`]));
      fireEvent.click(screen.getByTestId("build-next"));
    }
    await waitFor(() => expect(screen.getByTestId("neighbors-activity")).toHaveAttribute("data-variant", "letter"));
    expect(played.slice(-2)).toEqual(["b_all", "n_intro"]);

    // Activity 2: right side – held only by a neighbour with a Hand; left side – always held.
    expect(screen.getAllByTestId(/^neighbor-/)).toHaveLength(5);
    await drop("ا", "left");
    expect(played).toEqual(["n_next"]);
    expect(screen.getByTestId("pair-feedback")).toHaveAttribute("data-holds", "true");
    expect(screen.getByTestId("pair")).toHaveTextContent("با");
    expect(screen.getByTestId("pair")).toHaveAttribute("data-holds-next", "true");
    await drop("ط", "right");
    expect(played).toEqual(["n_hold"]);
    expect(screen.getByTestId("pair")).toHaveTextContent("طبا");
    expect(screen.getByTestId("pair")).toHaveAttribute("data-held", "true");
    await drop("ا", "right");
    expect(played).toEqual(["n_nohold"]);
    expect(screen.getByTestId("pair")).toHaveAttribute("data-held", "false");
    expect(screen.getByTestId("pair")).toHaveAttribute("data-gap", "true");
    expect(screen.queryByTestId("rule-card")).toBeNull(); // the left side not yet with a Hand
    await drop("ك", "left");
    await waitFor(() => expect(played).toEqual(["n_next", "n_rule"]));
    expect(screen.getByTestId("pair")).toHaveTextContent("ابك");
    expect(screen.getByTestId("rule-card")).toHaveTextContent(letterRuleText("Ba"));
    played.length = 0;
    fireEvent.click(screen.getByTestId("neighbors-next"));
    await waitFor(() => expect(played).toEqual(["s_intro"]));

    // Activity 3: four baskets with the letter's shapes; tiles only while answering.
    for (const [form, glyph] of [["start", "بـ"], ["middle", "ـبـ"], ["end", "ـب"], ["separate", "ب"]]) expect(screen.getByTestId(`basket-${form}`)).toHaveTextContent(glyph!);
    const seen: string[] = [];
    for (let i = 0; i < 5; i++) {
      await waitFor(() => expect(screen.getByTestId("sort-word")).toHaveAttribute("data-phase", "ask"));
      const id = screen.getByTestId("sort-word").getAttribute("data-word")!;
      const word = forms.sort.find((w) => w.id === id)!;
      const expected = analyzeWord(word.arabic, "ب").form;
      seen.push(id);
      expect(screen.queryByTestId("sort-shaped")).toBeNull();
      expect(within(screen.getByTestId("sort-tiles")).getAllByTestId(/^sort-tile-/).map((t) => t.textContent)).toEqual(splitTiles(word.arabic));
      if (i === 0) {
        played.length = 0;
        fireEvent.click(screen.getByTestId(`basket-${expected === "separate" ? "start" : "separate"}`));
        await waitFor(() => expect(screen.getByTestId("sort-word")).toHaveAttribute("data-phase", "rebuild"), { timeout: 4000 });
        expect(screen.getByTestId("sort-shaped")).toHaveTextContent(word.arabic);
        await waitFor(() => expect(screen.getByTestId("sort-word")).toHaveAttribute("data-phase", "ask"), { timeout: 4000 });
        expect(played).toEqual(["s_hint", "s_replay"]);
      }
      played.length = 0;
      fireEvent.click(screen.getByTestId(`basket-${expected}`));
      await waitFor(() => expect(screen.getByTestId("sort-shaped")).toBeInTheDocument());
      await waitFor(() => expect(played).toEqual([`s_ok_${expected}`]));
      await waitFor(() => expect(screen.queryByTestId("sort-word")?.getAttribute("data-word") !== id || screen.queryByTestId("sort-done")).toBeTruthy(), { timeout: 3000 });
    }
    expect(seen.sort()).toEqual(["bitaqa", "kalb", "kitab", "nabq", "shubbak"]);
    expect(await screen.findByTestId("sort-done")).toHaveTextContent("Du erkennst die vier Formen vom Ba.");
    expect(getLessonProgress("a1/lesson-1/ba/step-2").completedAt).toBeTruthy();
  }, 40_000);
});

describe("recording script", () => {
  it("docs/audio-scripts/ba.md lists every narration clip with its text and every Formen word", () => {
    const file = path.join(process.cwd(), "docs/audio-scripts/ba.md");
    expect(existsSync(file)).toBe(true);
    const script = readFileSync(file, "utf8");
    const { forms } = step(ba, "step-2", "forms");
    for (const name of LETTER_NARRATION_FILES) {
      expect(script, name).toContain(`${name}.wav`);
      expect(script, name).toContain(forms.letter!.texts[name]!);
    }
    for (const word of forms.sort) {
      expect(script).toContain(`${word.audio}.wav`);
      expect(script).toContain(word.arabic);
    }
  });
});
