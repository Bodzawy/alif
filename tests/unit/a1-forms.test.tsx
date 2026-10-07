import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { existsSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EXPLAIN_FILES, EXPLAIN_TEXT, NARRATION_FILES, POSITION_LABEL, POSITION_LABEL_GERMAN, RULE_REVEAL } from "@/components/a1/forms/content";
import { ExplainActivity, explainReducer, FALLBACK_MS, JOIN_MS, TILE_STEP_MS } from "@/components/a1/forms/explain-activity";
import { FormsStep } from "@/components/a1/forms/forms-step";
import { shuffled } from "@/components/a1/forms/use-pick-and-drop";
import { getA1Lesson } from "@/data/a1";
import type { FormsContent } from "@/data/types";
import { hamzaPosition, hasHand, isHamzaHeld, splitTiles } from "@/lib/arabic/hamza-alif";
import { createNarrator } from "@/lib/audio/narration";
import { getLessonProgress } from "@/lib/progress";

const step = getA1Lesson("lesson-1")!.steps.find((s) => s.slug === "step-3")!;
if (step.kind !== "forms") throw new Error("step-3 must be the forms step");
const forms: FormsContent = step.forms;
const PUBLIC = path.join(process.cwd(), "public");
const BOOK_WORDS = ["أَنَا", "سَأَلَ", "سَبَأَ", "قَرَأَ"];

describe("A1 · Schritt 3 Formen – content (lesson book only)", () => {
  it("explains and builds the four book words; position and label are computed", () => {
    expect(step.title).toBe("Formen: أ · ـأ");
    expect(step.navLabel).toBe("Formen");
    for (const list of [forms.explain, forms.build]) {
      expect(list.map((w) => [w.arabic, splitTiles(w.arabic), hamzaPosition(splitTiles(w.arabic)), w.german, w.audio])).toEqual([
        ["أَنَا", ["أَ", "نَ", "ا"], "start", "ich", "ana"],
        ["سَأَلَ", ["سَ", "أَ", "لَ"], "middle", "er fragte", "saala"],
        ["سَبَأَ", ["سَ", "بَ", "أَ"], "end", "Saba (Königreich)", "saba"],
        ["قَرَأَ", ["قَ", "رَ", "أَ"], "separate", "er las", "qaraa"],
      ]);
    }
    expect(forms.explain.map((w) => POSITION_LABEL[hamzaPosition(splitTiles(w.arabic))])).toEqual(["في أول الكلمة", "في المنتصف", "في آخر الكلمة", "منفصلة"]);
    expect(forms.explain.map((w) => POSITION_LABEL_GERMAN[hamzaPosition(splitTiles(w.arabic))])).toEqual(["am Wortanfang", "in der Mitte", "am Wortende", "getrennt"]);
    expect(forms.explain.find((w) => w.id === "saba")!.image).toBeUndefined();
  });

  it("uses exactly five neighbours from the book words: four with a Hand, one without", () => {
    expect(forms.neighbors).toEqual(["س", "ب", "ن", "ق", "ر"]);
    expect(forms.neighbors.filter(hasHand)).toEqual(["س", "ب", "ن", "ق"]);
    expect(forms.neighbors.filter((l) => !hasHand(l))).toEqual(["ر"]);
    // Every neighbour is a letter of a book word.
    const letters = new Set([...BOOK_WORDS, "رَأْس"].flatMap((w) => splitTiles(w).map((t) => t[0])));
    for (const letter of forms.neighbors) expect(letters.has(letter), letter).toBe(true);
    expect(RULE_REVEAL).toEqual({ hold: 3, nohold: 1 });
  });

  it("sorts exactly five words; alone and held are computed", () => {
    const sort = Object.fromEntries(forms.sort.map((w) => [w.arabic, isHamzaHeld(splitTiles(w.arabic)) ? "held" : "alone"]));
    expect(sort).toEqual({ "أَنَا": "alone", "قَرَأَ": "alone", "رَأْس": "alone", "سَأَلَ": "held", "سَبَأَ": "held" });
    expect(forms.sort.map((w) => [w.german, w.audio])).toEqual([["ich", "ana"], ["er fragte", "saala"], ["Saba (Königreich)", "saba"], ["er las", "qaraa"], ["Kopf", "ras"]]);
    expect([...forms.build, ...forms.sort].filter((w) => w.image).map((w) => w.id)).toEqual(["ana", "ana"]);
  });

  it("expects five word recordings and no others", () => {
    const words = new Set([...forms.explain, ...forms.build, ...forms.sort].map((w) => w.audio));
    expect([...words].sort()).toEqual(["ana", "qaraa", "ras", "saala", "saba"]);
  });

  it("has the 21 exercise and the 10 Zuschauen narration files; every Zuschauen clip has its German text", () => {
    expect(NARRATION_FILES).toHaveLength(21);
    expect(EXPLAIN_FILES).toEqual(["e_intro", "e_start_a", "e_start_b", "e_middle_a", "e_middle_b", "e_end_a", "e_end_b", "e_separate_a", "e_separate_b", "e_outro"]);
    for (const name of [...NARRATION_FILES, ...EXPLAIN_FILES]) expect(existsSync(path.join(PUBLIC, forms.audioBase, `${name}.wav`)), name).toBe(true);
    for (const key of EXPLAIN_FILES) expect(EXPLAIN_TEXT[key], key).toMatch(/\S/);
    expect(Object.keys(EXPLAIN_TEXT).sort()).toEqual([...EXPLAIN_FILES].sort());
    expect(EXPLAIN_TEXT.e_middle_b).toBe("Die Hamza steht in der Mitte. Der Nachbar davor streckt seine Hand aus und hält sie fest.");
  });

  it("shuffles without returning the original order", () => {
    const items = ["a", "b", "c", "d"];
    for (let i = 0; i < 20; i++) {
      const result = shuffled(items);
      expect([...result].sort()).toEqual(items);
      expect(result).not.toEqual(items);
    }
  });
});

// A stand-in for the ONE reused audio element: records what plays, "ends" after `clipMs`.
const played: string[] = [];
let created = 0;
let clipMs = 5;
class FakeAudio {
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  paused = true;
  src = "";
  private timer: ReturnType<typeof setTimeout> | null = null;
  constructor() {
    created += 1;
  }
  play() {
    const src = this.src;
    if (!src.startsWith("data:")) played.push(src.split("/").pop()!.replace(".wav", ""));
    this.paused = false;
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (!this.paused && this.src === src) this.onended?.();
    }, src.startsWith("data:") ? 1 : clipMs);
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
}

beforeEach(() => {
  played.length = 0;
  created = 0;
  clipMs = 5;
  window.localStorage.clear();
  vi.stubGlobal("Audio", FakeAudio);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("narration player", () => {
  it("uses one audio element for everything, skips missing files, and a new sequence interrupts the old one", async () => {
    const narrator = createNarrator({ baseUrl: "/x", available: ["a", "b", "c"] });
    narrator.unlock();
    expect(await narrator.play(["missing", "a", "b"])).toBe(true);
    expect(played).toEqual(["a", "b"]);
    played.length = 0;
    const first = narrator.play(["a", "b"]);
    const second = narrator.play(["c"]);
    expect(await first).toBe(false);
    expect(await second).toBe(true);
    expect(played).toEqual(["a", "c"]);
    expect(created).toBe(1);
  });

  it("playClip tells ended / skipped / interrupted", async () => {
    const narrator = createNarrator({ baseUrl: "/x", available: ["a", "b"] });
    expect(await narrator.playClip("a")).toBe("ended");
    expect(await narrator.playClip("missing")).toBe("skipped");
    const cut = narrator.playClip("a");
    narrator.stop();
    expect(await cut).toBe("interrupted");
    narrator.setMuted(true);
    expect(await narrator.playClip("b")).toBe("skipped");
  });

  it("remembers mute; muted sequences resolve at once without sound", async () => {
    const narrator = createNarrator({ baseUrl: "/x", available: ["a"] });
    narrator.setMuted(true);
    expect(await narrator.play(["a"])).toBe(true);
    expect(played).toEqual([]);
    expect(createNarrator({ baseUrl: "/x", available: ["a"] }).isMuted()).toBe(true);
  });
});

describe("Zuschauen – scene state machine", () => {
  it("moves through the stages in order; scene 4 ends with the outro", () => {
    let state = { scene: 0, stage: "intro" as const, run: 0 } as Parameters<typeof explainReducer>[0];
    const stages: string[] = [state.stage];
    for (let i = 0; i < 5; i++) stages.push((state = explainReducer(state, { type: "advance", last: false })).stage);
    expect(stages).toEqual(["intro", "letters", "join", "word", "explain", "ready"]);
    state = explainReducer({ scene: 3, stage: "explain", run: 9 }, { type: "advance", last: true });
    expect(state.stage).toBe("outro");
    expect(explainReducer(state, { type: "advance", last: true }).stage).toBe("ready");
    expect(explainReducer({ scene: 1, stage: "word", run: 2 }, { type: "restart" })).toEqual({ scene: 1, stage: "letters", run: 3 });
    expect(explainReducer({ scene: 1, stage: "word", run: 2 }, { type: "next" })).toEqual({ scene: 2, stage: "letters", run: 3 });
  });

  it("with every audio file missing, each scene still reaches 'ready' on the fallback timers", async () => {
    vi.useFakeTimers();
    const narrator = createNarrator({ baseUrl: "/x", available: [] });
    const onReachedEnd = vi.fn();
    render(<ExplainActivity words={forms.explain} narrator={narrator} withPageIntro onReachedEnd={onReachedEnd} onFinish={vi.fn()} />);
    const section = () => screen.getByTestId("explain-activity");
    const at = async (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));

    expect(section()).toHaveAttribute("data-stage", "intro");
    expect(screen.getByTestId("explain-caption")).toHaveTextContent(EXPLAIN_TEXT.e_intro!);
    await at(FALLBACK_MS.intro - 50);
    expect(section()).toHaveAttribute("data-stage", "intro");
    await at(100);
    expect(section()).toHaveAttribute("data-stage", "letters");

    for (const [i, word] of forms.explain.entries()) {
      const position = hamzaPosition(splitTiles(word.arabic));
      if (i > 0) {
        fireEvent.click(screen.getByTestId("explain-next"));
        await at(0);
      }
      expect(section()).toHaveAttribute("data-scene", String(i + 1));
      expect(screen.getByTestId("explain-caption")).toHaveTextContent(EXPLAIN_TEXT[`e_${position}_a`]!);
      // Tiles appear right to left, one after another.
      await at(150 + TILE_STEP_MS);
      expect(screen.getByTestId("explain-tiles").querySelectorAll('[data-shown="true"]')).toHaveLength(2);
      await at(FALLBACK_MS.letters - 150 - TILE_STEP_MS);
      expect(section()).toHaveAttribute("data-stage", "join");
      await at(JOIN_MS);
      expect(section()).toHaveAttribute("data-stage", "word");
      expect(screen.getByTestId(`explain-word-${word.id}`)).toHaveTextContent(word.arabic);
      await at(FALLBACK_MS.word);
      expect(section()).toHaveAttribute("data-stage", "explain");
      expect(screen.getByTestId("explain-caption")).toHaveTextContent(EXPLAIN_TEXT[`e_${position}_b`]!);
      expect(screen.getByTestId("explain-label")).toHaveTextContent(POSITION_LABEL[position]);
      expect(screen.getByTestId("explain-meaning")).toHaveTextContent(word.german);
      await at(FALLBACK_MS.explain);
      if (i < 3) {
        expect(section()).toHaveAttribute("data-stage", "ready");
        expect(screen.getByTestId("explain-next")).toHaveAttribute("data-ready", "true");
        expect(screen.getByTestId("explain-next")).toHaveTextContent("Weiter");
      } else {
        expect(section()).toHaveAttribute("data-stage", "outro");
        expect(onReachedEnd).toHaveBeenCalled();
        expect(screen.getByTestId("explain-caption")).toHaveTextContent(EXPLAIN_TEXT.e_outro!);
        await at(FALLBACK_MS.outro);
        expect(section()).toHaveAttribute("data-stage", "ready");
        expect(screen.getByTestId("explain-next")).toHaveTextContent("Weiter zur Übung");
      }
    }
    expect(played).toEqual([]);
  });

  it("advances on the audio's end event (not the fallback) and plays the clips in order", async () => {
    vi.useFakeTimers();
    clipMs = 300;
    const narrator = createNarrator({ baseUrl: "/x", available: [...EXPLAIN_FILES, "f_intro", "ana"] });
    render(<ExplainActivity words={forms.explain} narrator={narrator} withPageIntro onReachedEnd={vi.fn()} onFinish={vi.fn()} />);
    const at = async (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));
    await at(700); // f_intro + e_intro, 300 ms each
    expect(screen.getByTestId("explain-activity")).toHaveAttribute("data-stage", "letters");
    await at(150 + 3 * TILE_STEP_MS + 10); // the letters take longer than the clip
    expect(screen.getByTestId("explain-activity")).toHaveAttribute("data-stage", "join");
    // word (300 ms clip) and explain (300 ms clip) follow their clips' end. With the fallbacks
    // they would need at least JOIN_MS + 300 + FALLBACK_MS.explain.
    let elapsed = 0;
    while (screen.getByTestId("explain-activity").getAttribute("data-stage") !== "ready" && elapsed < 10_000) {
      await at(100);
      elapsed += 100;
    }
    expect(screen.getByTestId("explain-activity")).toHaveAttribute("data-stage", "ready");
    expect(elapsed).toBeLessThan(JOIN_MS + 300 + FALLBACK_MS.explain);
    expect(played).toEqual(["f_intro", "e_intro", "e_start_a", "ana", "e_start_b"]);
  });

  it("'Nochmal ansehen' and 'Weiter' cancel the running stage, its timers and its sound", async () => {
    vi.useFakeTimers();
    clipMs = 10_000;
    const narrator = createNarrator({ baseUrl: "/x", available: [...EXPLAIN_FILES] });
    render(<ExplainActivity words={forms.explain} narrator={narrator} withPageIntro={false} onReachedEnd={vi.fn()} onFinish={vi.fn()} />);
    const at = async (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));
    fireEvent.click(screen.getByTestId("explain-next")); // skip the intro
    await at(1000);
    expect(screen.getByTestId("explain-activity")).toHaveAttribute("data-stage", "letters");
    fireEvent.click(screen.getByTestId("explain-replay"));
    await at(0);
    expect(screen.getByTestId("explain-tiles").querySelectorAll('[data-shown="true"]')).toHaveLength(0);
    fireEvent.click(screen.getByTestId("explain-next"));
    await at(0);
    expect(screen.getByTestId("explain-activity")).toHaveAttribute("data-scene", "2");
    expect(played).toEqual(["e_intro", "e_start_a", "e_start_a", "e_middle_a"]);
    await at(20_000);
    // The old scene never advanced the new one: still scene 2.
    expect(screen.getByTestId("explain-activity")).toHaveAttribute("data-scene", "2");
  });
});

const EXERCISE_AUDIO = [...NARRATION_FILES]; // no Zuschauen files, no word recordings → fallbacks

async function tapTile(tile: string, slot: number) {
  fireEvent.click(screen.getByTestId(`tile-${tile}`));
  fireEvent.click(screen.getByTestId(`slot-${slot}`));
}

/** "Weiter" through the scenes (from wherever Zuschauen is), then "Weiter zur Übung". */
async function skipExplain() {
  for (let i = 0; i < 5 && !/Weiter zur Übung/.test(screen.getByTestId("explain-next").textContent ?? ""); i++) {
    fireEvent.click(screen.getByTestId("explain-next"));
  }
  expect(screen.getByTestId("explain-activity")).toHaveAttribute("data-scene", "4");
  fireEvent.click(screen.getByTestId("explain-next"));
}

describe("A1 · Schritt 3 Formen – the four parts", () => {
  it("start → Zuschauen (exercises locked) → build four words → who holds → sort five words → Geschafft", async () => {
    render(<FormsStep forms={forms} availableAudio={[...EXERCISE_AUDIO, ...EXPLAIN_FILES]} progressKey="a1/lesson-1/step-3" />);

    // Start: autoplay needs a tap; then f_intro, e_intro and scene 1.
    expect(played).toEqual([]);
    fireEvent.click(await screen.findByTestId("start-button"));
    await waitFor(() => expect(played.slice(0, 2)).toEqual(["f_intro", "e_intro"]));
    expect(played).not.toContain("b_intro");
    expect(screen.getByTestId("activity-tab-0")).toHaveTextContent("Zuschauen");
    for (const i of [1, 2, 3]) expect(screen.getByTestId(`activity-tab-${i}`)).toBeDisabled();

    // "Weiter zur Übung" opens Activity 1 and plays b_intro.
    played.length = 0;
    await skipExplain();
    await waitFor(() => expect(screen.getByTestId("build-activity")).toBeInTheDocument());
    await waitFor(() => expect(played.at(-1)).toBe("b_intro"));
    await act(() => new Promise((r) => setTimeout(r, 50)));
    expect(played.at(-1)).toBe("b_intro"); // Zuschauen stopped: nothing of it plays after the switch
    for (const i of [0, 1, 2, 3]) expect(screen.getByTestId(`activity-tab-${i}`)).toBeEnabled();

    // Activity 1. Word 1: a wrong tile first.
    played.length = 0;
    fireEvent.click(screen.getByTestId("tile-نَ"));
    fireEvent.click(screen.getByTestId("slot-0"));
    await waitFor(() => expect(played).toEqual(["b_wrong"]));
    expect(screen.getByTestId("slot-0")).toHaveAttribute("data-filled", "false");

    const positions = ["start", "middle", "end", "separate"];
    for (const [w, word] of forms.build.entries()) {
      played.length = 0;
      for (const [i, tile] of splitTiles(word.arabic).entries()) await tapTile(tile, i);
      await waitFor(() => expect(screen.getByTestId(`build-word-${word.id}`)).toHaveAttribute("data-phase", "done"));
      expect(screen.getByTestId("build-position")).toHaveTextContent(Object.values(POSITION_LABEL)[w]!);
      expect(screen.getByTestId(`built-word-${word.id}`)).toHaveTextContent(word.arabic);
      // Word recording missing → only the narration plays, nothing breaks.
      await waitFor(() => expect(played).toEqual([`b_done_${positions[w]}`]));
      fireEvent.click(screen.getByTestId("build-next"));
    }
    await waitFor(() => expect(screen.getByTestId("neighbors-activity")).toBeInTheDocument());
    expect(played.slice(-2)).toEqual(["b_all", "n_intro"]);

    // Activity 2: five neighbours; the rule after three with a Hand and the one without.
    expect(screen.getAllByTestId(/^neighbor-/)).toHaveLength(5);
    const drop = async (letter: string, side: "left" | "right") => {
      played.length = 0;
      fireEvent.click(screen.getByTestId(`neighbor-${letter}`));
      fireEvent.click(screen.getByTestId(`zone-${side}`));
      await waitFor(() => expect(played.length).toBeGreaterThan(0));
    };
    await drop("ب", "left");
    expect(played).toEqual(["n_left"]);
    await drop("ب", "right");
    expect(played).toEqual(["n_hold"]);
    expect(screen.getByTestId("pair")).toHaveTextContent("بأ");
    await drop("ر", "right");
    expect(played).toEqual(["n_nohold"]);
    expect(screen.getByTestId("pair")).toHaveAttribute("data-held", "false");
    await drop("س", "right");
    expect(screen.queryByTestId("rule-card")).toBeNull(); // two with a Hand are not enough
    await drop("ق", "right");
    await waitFor(() => expect(played).toEqual(["n_hold", "n_rule"]));
    expect(screen.getByTestId("rule-card")).toHaveTextContent("Das Alif hält sich nie am nächsten Buchstaben fest.");
    played.length = 0;
    fireEvent.click(screen.getByTestId("neighbors-next"));
    await waitFor(() => expect(played).toEqual(["s_intro"]));

    // Activity 3: five words, one wrong answer, then all right.
    const expected: Record<string, "alone" | "held"> = { ana: "alone", qaraa: "alone", ras: "alone", saala: "held", saba: "held" };
    const reason: Record<string, string> = { ana: "start", qaraa: "nohand", ras: "nohand", saala: "hold", saba: "hold" };
    const seen: string[] = [];
    /** While answering: only separate letter tiles (RTL order), never the joined word. */
    const expectTilesOnly = (id: string) => {
      const word = forms.sort.find((w) => w.id === id)!;
      expect(screen.queryByTestId("sort-shaped")).toBeNull();
      // No element holds the word as one string: every Arabic text node is a single tile.
      const arabic = Array.from(screen.getByTestId("sort-card").querySelectorAll("[lang=ar]")).map((el) => el.textContent);
      expect(arabic).toEqual(splitTiles(word.arabic));
      const tiles = within(screen.getByTestId("sort-tiles")).getAllByTestId(/^sort-tile-/);
      expect(tiles.map((t) => t.textContent)).toEqual(splitTiles(word.arabic));
      expect(screen.getByTestId("sort-tiles")).toHaveAttribute("dir", "rtl");
    };
    const heldByUtil = (id: string) => String(isHamzaHeld(splitTiles(forms.sort.find((w) => w.id === id)!.arabic)));
    for (let i = 0; i < 5; i++) {
      await waitFor(() => expect(screen.getByTestId("sort-word")).toHaveAttribute("data-phase", "ask"));
      expect(screen.getByTestId("sort-progress")).toHaveTextContent(`Wort ${i + 1} von 5`);
      const id = screen.getByTestId("sort-word").getAttribute("data-word")!;
      seen.push(id);
      expectTilesOnly(id);
      if (i === 0) {
        played.length = 0;
        fireEvent.click(screen.getByTestId(`basket-${expected[id] === "alone" ? "held" : "alone"}`));
        await waitFor(() => expect(screen.getByTestId("sort-word")).toHaveAttribute("data-phase", "apart"), { timeout: 3000 });
        expect(screen.queryByTestId("sort-shaped")).toBeNull();
        // The replay joins the tiles into the shaped word …
        await waitFor(() => expect(screen.getByTestId("sort-word")).toHaveAttribute("data-phase", "rebuild"), { timeout: 4000 });
        const shaped = screen.getByTestId("sort-shaped");
        expect(shaped).toHaveTextContent(forms.sort.find((w) => w.id === id)!.arabic);
        if (id !== "ana") expect(shaped).toHaveAttribute("data-held", heldByUtil(id));
        // … then the tiles come back for the next try.
        await waitFor(() => expect(screen.getByTestId("sort-word")).toHaveAttribute("data-phase", "ask"), { timeout: 4000 });
        expectTilesOnly(id);
        expect(played).toEqual([id === "ana" ? "s_hint_start" : "s_hint", "s_replay"]);
      }
      played.length = 0;
      fireEvent.click(screen.getByTestId(`basket-${expected[id]}`));
      // Right: the shaped word appears, held exactly as the util says.
      await waitFor(() => expect(screen.getByTestId("sort-shaped")).toBeInTheDocument());
      expect(screen.getByTestId("sort-word")).toHaveAttribute("data-phase", "correct");
      if (id !== "ana") expect(screen.getByTestId("sort-shaped")).toHaveAttribute("data-held", heldByUtil(id));
      else expect(screen.getByTestId("sort-shaped")).not.toHaveAttribute("data-held");
      await waitFor(() => expect(played).toEqual([`s_ok_${reason[id]}`]));
      await waitFor(() => expect(screen.queryByTestId("sort-word")?.getAttribute("data-word") !== id || screen.queryByTestId("sort-done")).toBeTruthy(), { timeout: 3000 });
    }
    expect(seen.sort()).toEqual(["ana", "qaraa", "ras", "saala", "saba"]);
    const done = await screen.findByTestId("sort-done");
    expect(within(done).getByText("مُمْتَاز! 👏")).toBeInTheDocument();
    await waitFor(() => expect(played).toContain("s_done"));
    expect(getLessonProgress("a1/lesson-1/step-3").completedAt).toBeTruthy();
    expect(created).toBe(1);
  }, 40_000);

  it("Nochmal hören replays the current intro (Zuschauen restarts); the mute toggle silences and is remembered", async () => {
    render(<FormsStep forms={forms} availableAudio={[...EXERCISE_AUDIO, ...EXPLAIN_FILES]} progressKey="k" />);
    fireEvent.click(await screen.findByTestId("start-button"));
    await waitFor(() => expect(played.slice(0, 2)).toEqual(["f_intro", "e_intro"]));
    played.length = 0;
    fireEvent.click(screen.getByTestId("replay-intro"));
    await waitFor(() => expect(played[0]).toBe("e_intro"));
    await skipExplain();
    await waitFor(() => expect(played.at(-1)).toBe("b_intro"));
    played.length = 0;
    fireEvent.click(screen.getByTestId("replay-intro"));
    await waitFor(() => expect(played).toEqual(["b_intro"]));
    fireEvent.click(screen.getByTestId("mute-toggle"));
    expect(screen.getByTestId("mute-toggle")).toHaveAttribute("aria-pressed", "true");
    expect(window.localStorage.getItem("alif:audio-muted")).toBe("1");
    played.length = 0;
    fireEvent.click(screen.getByTestId("replay-intro"));
    fireEvent.click(screen.getByTestId("tile-نَ"));
    fireEvent.click(screen.getByTestId("slot-0"));
    await act(() => new Promise((r) => setTimeout(r, 30)));
    expect(played).toEqual([]);
  });

  it("a drag that ends without a click does not swallow the next tap", async () => {
    render(<FormsStep forms={forms} availableAudio={EXERCISE_AUDIO} progressKey="k" />);
    fireEvent.click(await screen.findByTestId("start-button"));
    await skipExplain();
    const tile = await screen.findByTestId("tile-نَ");
    fireEvent.pointerDown(tile, { pointerId: 1, clientX: 10, clientY: 10, button: 0, pointerType: "touch" });
    fireEvent.pointerMove(tile, { pointerId: 1, clientX: 60, clientY: 80, pointerType: "touch" });
    fireEvent.pointerUp(tile, { pointerId: 1, clientX: 60, clientY: 80, pointerType: "touch" });
    // Touch drags are not followed by a click; the next tap must pick the tile up.
    fireEvent.pointerDown(tile, { pointerId: 2, clientX: 10, clientY: 10, button: 0, pointerType: "touch" });
    fireEvent.pointerUp(tile, { pointerId: 2, clientX: 10, clientY: 10, pointerType: "touch" });
    fireEvent.click(tile);
    expect(tile).toHaveAttribute("aria-pressed", "true");
  });

  it("tiles are at least 48px tap targets with touch-action none; Arabic is marked RTL", async () => {
    render(<FormsStep forms={forms} availableAudio={EXERCISE_AUDIO} progressKey="k" />);
    fireEvent.click(await screen.findByTestId("start-button"));
    expect(screen.getByTestId("explain-caption")).toHaveAttribute("aria-live", "polite");
    fireEvent.click(screen.getByTestId("explain-next"));
    expect(screen.getByTestId("explain-tiles")).toHaveAttribute("dir", "rtl");
    expect(screen.getByTestId("explain-next").className).toMatch(/\bh-14\b/); // 56 px
    expect(screen.getByTestId("explain-replay").className).toMatch(/\bh-14\b/);
    await skipExplain();
    for (const tile of splitTiles("أَنَا")) {
      const button = await screen.findByTestId(`tile-${tile}`);
      expect(button.className).toMatch(/\bh-16\b/);
      expect(button.style.touchAction).toBe("none");
      expect(button.querySelector("[lang=ar]")).not.toBeNull();
    }
    expect(screen.getByTestId("slot-0").parentElement).toHaveAttribute("dir", "rtl");
  });
});
