import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { existsSync } from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import A1StepPage from "@/app/a1/[lesson]/[step]/page";
import { GAPS_FALLBACK_MS, GAPS_NARRATION, GAPS_TEXT, gapStars } from "@/components/a1/gaps/content";
import { GapsStep } from "@/components/a1/gaps/gaps-step";
import { getA1Lesson } from "@/data/a1";
import type { GapsContent } from "@/data/types";
import { gapPieces, gapWord, piecesAreSafe } from "@/lib/arabic/gap";
import { getLessonProgress } from "@/lib/progress";

const lesson = getA1Lesson("lesson-1")!;
const stepOf = (slug: string) => {
  const step = lesson.steps.find((s) => s.slug === slug)!;
  if (step.kind !== "gaps") throw new Error(`${slug} must be a gaps step`);
  return step;
};
const step5 = stepOf("step-5");
const step6 = stepOf("step-6");
const PUBLIC = path.join(process.cwd(), "public");

// The book's table: word, answer, rest (after the gap) – checked against the computed values.
const BOOK5: Array<[string, string, string, string]> = [
  ["أَب", "Vater", "أَ", "ب"],
  ["أَنَا", "ich", "أَ", "نَا"],
  ["أَمِير", "Prinz", "أَ", "مِير"],
  ["إِبْرَة", "Nadel", "إِ", "بْرَة"],
  ["إِصْبَع", "Finger", "إِ", "صْبَع"],
  ["إِبْرِيق", "Kanne", "إِ", "بْرِيق"],
  ["أُذُن", "Ohr", "أُ", "ذُن"],
  ["أُمّ", "Mutter", "أُ", "مّ"],
  ["أُسْرَة", "Familie", "أُ", "سْرَة"],
];
const BOOK6: Array<[string, string, string]> = [
  ["أُذُن", "Ohr", "أُ"],
  ["إِصْبَع", "Finger", "إِ"],
  ["أَب", "Vater", "أَ"],
  ["إِبْرَة", "Nadel", "إِ"],
  ["أُمّ", "Mutter", "أُ"],
  ["إِبْرِيق", "Kanne", "إِ"],
  ["أَنَا", "ich", "أَ"],
  ["أَمِير", "Prinz", "أَ"],
  ["أُسْرَة", "Familie", "أُ"],
  ["رَأْس", "Kopf", "أْ"],
];

describe("Schritt 5 Ergänzen / 6 Hören – content from the book", () => {
  it("are registered with their titles, choices and book order", () => {
    expect([step5, step6].map((s) => [s.slug, s.title, s.navLabel])).toEqual([
      ["step-5", "Ergänzen: أَ · إِ · أُ", "Ergänzen"],
      ["step-6", "Hören: أْ · أَ · إِ · أُ", "Hören"],
    ]);
    expect(step5.gaps.choices).toEqual(["أَ", "إِ", "أُ"]);
    expect(step6.gaps.choices).toEqual(["أْ", "أَ", "إِ", "أُ"]);
    expect(step5.gaps.items.map((i) => [i.arabic, i.german])).toEqual(BOOK5.map(([w, g]) => [w, g]));
    expect(step6.gaps.items.map((i) => [i.arabic, i.german])).toEqual(BOOK6.map(([w, g]) => [w, g]));
    expect([step5.gaps.mode, step6.gaps.mode]).toEqual(["picture", "listen"]);
  });

  it("computes gap, answer and rest for all 19 items; every answer is one of the choices", () => {
    for (const [i, [word, , answer, rest]] of BOOK5.entries()) {
      const gap = gapWord(step5.gaps.items[i]!.arabic);
      expect([gap.index, gap.answer, gap.before, gap.after], word).toEqual([0, answer, "", rest]);
      expect(step5.gaps.choices).toContain(gap.answer);
    }
    for (const [i, [word, , answer]] of BOOK6.entries()) {
      const gap = gapWord(step6.gaps.items[i]!.arabic);
      expect(gap.answer, word).toBe(answer);
      expect(step6.gaps.choices).toContain(gap.answer);
    }
  });

  it("item 10 (رَأْس) has its gap in the middle and the answer أْ", () => {
    const gap = gapWord(step6.gaps.items[9]!.arabic);
    expect([gap.index, gap.answer, gap.vowel, gap.before, gap.after]).toEqual([1, "أْ", "sukun", "رَ", "س"]);
    expect(gapPieces(gap)).toEqual([{ kind: "text", text: "رَ" }, { kind: "gap" }, { kind: "text", text: "س" }]);
  });

  it("cuts the word only after letters that never connect forward, and the pieces make up the word", () => {
    for (const item of [...step5.gaps.items, ...step6.gaps.items]) {
      const gap = gapWord(item.arabic);
      expect(piecesAreSafe(gap), item.arabic).toBe(true);
      const joined = gapPieces(gap).map((p) => (p.kind === "gap" ? gap.answer : p.text)).join("");
      expect(joined).toBe(item.arabic);
    }
    // The guard bites: in سَأَلَ the س holds the Alif, so cutting there would break a join.
    expect(piecesAreSafe(gapWord("سَأَلَ"))).toBe(false);
  });

  it("uses the pictures of Schritt 2 (same files, same spelling) in Ergänzen only", () => {
    const step2 = lesson.steps[1]!;
    if (step2.kind !== "sound-words") throw new Error();
    const words = new Map(step2.groups.flatMap((g) => g.words).map((w) => [w.arabic, w]));
    for (const item of step5.gaps.items) {
      expect(words.get(item.arabic)?.image.src, item.arabic).toBe(item.image?.src);
      expect(words.get(item.arabic)?.german).toBe(item.german);
      expect(existsSync(path.join(PUBLIC, item.image!.src))).toBe(true);
    }
    expect(step6.gaps.items.filter((i) => i.image)).toEqual([]);
  });

  it("text table: every key has a text, every key is used, every key has its file", () => {
    const used = new Set([
      step5.gaps.narration.intro, step5.gaps.narration.done, step6.gaps.narration.intro, step6.gaps.narration.done,
      GAPS_NARRATION.ok, GAPS_NARRATION.hint,
      ...[...step5.gaps.items, ...step6.gaps.items].map((i) => GAPS_NARRATION.reveal(gapWord(i.arabic).vowel)),
    ]);
    expect([...used].sort()).toEqual(Object.keys(GAPS_TEXT).sort());
    for (const key of Object.keys(GAPS_TEXT)) {
      expect(GAPS_TEXT[key], key).toMatch(/\S/);
      expect(existsSync(path.join(PUBLIC, step5.gaps.audioBase, `${key}.wav`)), key).toBe(true);
    }
    expect(Object.keys(GAPS_TEXT)).toHaveLength(10);
    expect(GAPS_TEXT.g_reveal_sukun).toBe("Nach der Hamza hörst du keinen Vokal. Darum steht ein Sukun.");
  });

  it("stars: 3 when all right on the first try, 2 from 70 %, else 1", () => {
    expect(gapStars(9, 9)).toBe(3);
    expect(gapStars(7, 10)).toBe(2);
    expect(gapStars(7, 9)).toBe(2);
    expect(gapStars(6, 10)).toBe(1);
    expect(gapStars(0, 9)).toBe(1);
  });
});

// One reused audio element: records what plays, "ends" after a few ms.
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
    setTimeout(() => !this.paused && this.src === src && this.onended?.(), 5);
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
}

beforeEach(() => {
  played.length = 0;
  window.localStorage.clear();
  vi.stubGlobal("Audio", FakeAudio);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const ALL_FILES = Object.keys(GAPS_TEXT); // narration present, word recordings missing (as in the repo)

const answerWith = (choice: string) => {
  fireEvent.click(screen.getByText(choice, { selector: "button[data-choice] span" }).closest("button")!);
  fireEvent.click(screen.getByTestId("gap-slot"));
};

describe("the gap flow", () => {
  it("wrong → hint, wrong again → reveal (still to be placed), right → word shaped, g_ok, next; result counts helped items", async () => {
    render(<GapsStep gaps={step5.gaps} availableAudio={ALL_FILES} progressKey="a1/lesson-1/step-5" />);
    fireEvent.click(await screen.findByTestId("start-button"));
    await waitFor(() => expect(played).toEqual(["g5_intro"]));
    expect(screen.getByTestId("gap-caption")).toHaveTextContent(GAPS_TEXT.g5_intro!);
    expect(screen.getByTestId("gap-progress")).toHaveTextContent("Aufgabe 1 von 9");
    expect(screen.getByTestId("gap-image")).toHaveAttribute("src", "/images/a1/lesson-1/ab.svg");

    // Item 1 (أَب): wrong, wrong, then right.
    played.length = 0;
    answerWith("إِ");
    await waitFor(() => expect(played).toEqual(["g_hint"])); // word recording missing: skipped
    expect(screen.getByTestId("gap-caption")).toHaveTextContent("Fast! Hör noch einmal genau zu.");
    expect(document.querySelector("[data-reveal]")).toBeNull();
    expect(screen.getByTestId("gap-slot")).toHaveAttribute("data-filled", "false");
    answerWith("أُ");
    await waitFor(() => expect(played.at(-1)).toBe("g_reveal_a"));
    expect(screen.getByTestId("gap-caption")).toHaveTextContent("Hier hörst du ein A. Die Hamza steht oben.");
    expect(document.querySelector('[data-reveal="true"]')).toHaveAttribute("data-choice", "أَ");
    expect(screen.queryByTestId("gap-shaped")).toBeNull(); // still to be placed by the child
    answerWith("أَ");
    expect(screen.getByTestId("gap-shaped")).toHaveTextContent("أَب");
    expect(screen.getByTestId("gap-caption")).toHaveTextContent("Richtig! Gut gemacht.");
    // The word recording is missing: its 2500 ms fallback first, then g_ok.
    await waitFor(() => expect(played.at(-1)).toBe("g_ok"), { timeout: 4000 });
    await waitFor(() => expect(screen.getByTestId("gap-progress")).toHaveTextContent("Aufgabe 2 von 9"), { timeout: 4000 });

    // Items 2–9 right on the first try (with "Weiter" to save time).
    for (const [word, , answer] of BOOK5.slice(1)) {
      await waitFor(() => expect(screen.getByTestId("gap-item")).toHaveAttribute("data-item", step5.gaps.items.find((i) => i.arabic === word)!.id));
      answerWith(answer);
      fireEvent.click(screen.getByTestId("gap-next"));
    }
    const result = await screen.findByTestId("gap-result");
    expect(result).toHaveAttribute("data-first-try", "8");
    expect(result).toHaveAttribute("data-stars", "2");
    expect(screen.getByTestId("result-ab")).toHaveAttribute("data-first-try", "false");
    expect(screen.getByTestId("result-umm")).toHaveAttribute("data-first-try", "true");
    expect(result).toHaveTextContent("مُمْتَاز! 👏");
    await waitFor(() => expect(played.at(-1)).toBe("g5_done"));
    expect(getLessonProgress("a1/lesson-1/step-5").completedAt).toBeTruthy();

    // "Nochmal" restarts.
    fireEvent.click(screen.getByTestId("gap-restart"));
    expect(screen.getByTestId("gap-progress")).toHaveTextContent("Aufgabe 1 von 9");
  }, 20_000);

  it("reaches the result screen with every audio file missing, on the fallback timers (fake timers)", async () => {
    vi.useFakeTimers();
    render(<GapsStep gaps={step6.gaps} availableAudio={[]} progressKey="a1/lesson-1/step-6" />);
    const at = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));
    await at(0);
    fireEvent.click(screen.getByTestId("start-button"));
    await at(0);
    expect(screen.getByTestId("gap-caption")).toHaveTextContent(GAPS_TEXT.g6_intro!);
    for (const [i, [, , answer]] of BOOK6.entries()) {
      expect(screen.getByTestId("gap-progress")).toHaveTextContent(`Aufgabe ${i + 1} von 10`);
      answerWith(answer);
      // Word (2500) and g_ok (2500) both missing → the flow moves on by itself.
      await at(GAPS_FALLBACK_MS.clip * 2 + 10);
    }
    expect(screen.getByTestId("gap-result")).toHaveAttribute("data-stars", "3");
    expect(getLessonProgress("a1/lesson-1/step-6").completedAt).toBeTruthy();
    expect(played).toEqual([]);
  });

  it("Hören: the item's word plays after the intro; the sukun item reveals with g_reveal_sukun", async () => {
    const words = step6.gaps.items.map((i) => i.audio!);
    const gaps: GapsContent = { ...step6.gaps, items: step6.gaps.items.slice(9) }; // only رَأْس
    render(<GapsStep gaps={gaps} availableAudio={[...ALL_FILES, ...words]} progressKey="k" />);
    fireEvent.click(await screen.findByTestId("start-button"));
    await waitFor(() => expect(played).toEqual(["g6_intro", "ras"]));
    expect(screen.queryByTestId("gap-image")).toBeNull();
    expect(Array.from(document.querySelectorAll('[data-testid="gap-piece"]')).map((e) => e.textContent)).toEqual(["رَ", "س"]);
    played.length = 0;
    fireEvent.click(screen.getByTestId("gap-listen"));
    await waitFor(() => expect(played).toEqual(["ras"]));
    answerWith("أَ");
    await waitFor(() => expect(played.slice(-2)).toEqual(["g_hint", "ras"]));
    answerWith("أُ");
    await waitFor(() => expect(played.at(-1)).toBe("g_reveal_sukun"));
    expect(screen.getByTestId("gap-caption")).toHaveTextContent(GAPS_TEXT.g_reveal_sukun!);
  });

  it("mute: nothing plays, and the choice is remembered", async () => {
    render(<GapsStep gaps={step5.gaps} availableAudio={ALL_FILES} progressKey="k" />);
    await screen.findByTestId("start-button");
    fireEvent.click(screen.getByTestId("mute-toggle"));
    expect(window.localStorage.getItem("alif:audio-muted")).toBe("1");
    fireEvent.click(screen.getByTestId("start-button"));
    answerWith("إِ");
    await act(() => new Promise((r) => setTimeout(r, 50)));
    expect(played).toEqual([]);
  });
});

describe("navigation and progress keys", () => {
  const renderStep = async (slug: string) => render(await A1StepPage({ params: Promise.resolve({ lesson: "lesson-1", step: slug }) }));

  it("step-4 → Weiter: Ergänzen; step-5 → Zurück: Schreiben / Weiter: Hören; step-6 → Zurück: Ergänzen / Zurück zu A1", async () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    await renderStep("step-4");
    expect(screen.getByTestId("step-next")).toHaveTextContent("Weiter: Ergänzen");
    cleanup();
    await renderStep("step-5");
    expect(screen.getByTestId("step-position")).toHaveTextContent("Schritt 5 von 6");
    expect(screen.getByTestId("step-prev")).toHaveTextContent("Zurück: Schreiben");
    expect(screen.getByTestId("step-next")).toHaveTextContent("Weiter: Hören");
    expect(screen.getByTestId("step-next")).toHaveAttribute("href", "/a1/lesson-1/step-6");
    cleanup();
    await renderStep("step-6");
    expect(screen.getByTestId("step-position")).toHaveTextContent("Schritt 6 von 6");
    expect(screen.getByTestId("step-prev")).toHaveTextContent("Zurück: Ergänzen");
    expect(screen.getByTestId("back-to-lessons")).toHaveTextContent("Zurück zu A1");
    vi.restoreAllMocks();
  });

  it("completes a1/lesson-1/step-5 and step-6 only on the result screen", async () => {
    render(<GapsStep gaps={{ ...step5.gaps, items: step5.gaps.items.slice(0, 1) }} availableAudio={ALL_FILES} progressKey="a1/lesson-1/step-5" />);
    fireEvent.click(await screen.findByTestId("start-button"));
    expect(getLessonProgress("a1/lesson-1/step-5").completedAt).toBeUndefined();
    answerWith("أَ");
    fireEvent.click(screen.getByTestId("gap-next"));
    await screen.findByTestId("gap-result");
    expect(getLessonProgress("a1/lesson-1/step-5").completedAt).toBeTruthy();
    expect(getLessonProgress("a1/lesson-1/step-6").completedAt).toBeUndefined();
  });
});
