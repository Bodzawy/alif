import { expect, test, type Locator, type Page } from "@playwright/test";

import { collectPageErrors } from "./support/helpers";

// A1 · Lektion 1 · Schritt 3 "Formen": Zuschauen + three exercises. Real
// browser, real recorded narration (public/audio/a1/lesson-1/formen); plays are
// recorded by wrapping HTMLMediaElement.play. Word recordings are not in the
// repo yet: they must never be requested.

const WORD_FILES = /\/(ana|saala|saba|qaraa|ras)\.wav$/;

async function recordPlays(page: Page) {
  const played: string[] = [];
  await page.exposeFunction("__played", (src: string) => played.push(src.split("/").pop()!.replace(".wav", "")));
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      // The silent unlock clip (a data: URI) is not narration.
      if (!this.src.startsWith("data:")) (window as unknown as { __played: (s: string) => void }).__played(this.src);
      return play.call(this);
    };
  });
  return played;
}

/** "Weiter" through the remaining scenes, then "Weiter zur Übung". */
async function finishExplain(page: Page) {
  const next = page.getByTestId("explain-next");
  for (let i = 0; i < 5 && !/Weiter zur Übung/.test(await next.innerText()); i++) await next.tap();
  await expect(page.getByTestId("explain-activity")).toHaveAttribute("data-scene", "4");
  await next.tap();
}

/** A touch drag through Chrome's input pipeline (touch → pointer events). */
async function touchDrag(page: Page, from: Locator, to: Locator) {
  const cdp = await page.context().newCDPSession(page);
  const a = (await from.boundingBox())!;
  const b = (await to.boundingBox())!;
  const [x0, y0, x1, y1] = [a.x + a.width / 2, a.y + a.height / 2, b.x + b.width / 2, b.y + b.height / 2];
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y: y0 }] });
  for (let i = 1; i <= 10; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 + ((x1 - x0) * i) / 10, y: y0 + ((y1 - y0) * i) / 10 }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test("Schritt 2 → Weiter: Formen; Schritt 3 of 4 with Zurück: Wörter and Weiter: Schreiben", async ({ page }) => {
  await page.goto("/a1/lesson-1/step-2");
  await expect(page.getByTestId("step-next")).toHaveText(/Weiter: Formen/);
  await expect(page.getByTestId("step-prev")).toHaveText(/Zurück: Laute: أَ · إِ · أُ/);
  await expect(page.getByTestId("step-tab-step-3")).toHaveText(/3\s*Formen: أ · ـأ/);
  await page.getByTestId("step-next").click();
  await expect(page).toHaveURL(/\/a1\/lesson-1\/step-3$/);
  await expect(page.getByTestId("step-position")).toHaveText("Schritt 3 von 6");
  await expect(page.getByTestId("step-prev")).toHaveText(/Zurück: Wörter/);
  await expect(page.getByTestId("step-next")).toHaveText(/Weiter: Schreiben/);
  await expect(page.getByTestId("step-next")).toHaveAttribute("href", "/a1/lesson-1/step-4");
});

test("Zuschauen, then all three activities on a phone: narration chain, touch drag, book content only, progress", async ({ page }) => {
  test.setTimeout(240_000);
  const errors = collectPageErrors(page);
  const wordRequests: string[] = [];
  page.on("request", (r) => WORD_FILES.test(r.url()) && wordRequests.push(r.url()));
  const played = await recordPlays(page);
  await page.goto("/a1/lesson-1/step-3");

  // Autoplay: nothing before the tap. Then f_intro → e_intro → scene 1, with no tap in between.
  await page.waitForTimeout(300);
  expect(played).toEqual([]);
  await page.getByTestId("start-button").tap();
  const explain = page.getByTestId("explain-activity");
  await expect(explain).toHaveAttribute("data-stage", "intro");
  for (const i of [1, 2, 3]) await expect(page.getByTestId(`activity-tab-${i}`)).toBeDisabled();
  await expect.poll(() => played.slice(0, 3), { timeout: 30_000 }).toEqual(["f_intro", "e_intro", "e_start_a"]);
  expect(played).not.toContain("b_intro");

  // Scene 1 with the real recordings: letters right to left, join, word, explanation.
  await expect(page.getByTestId("explain-caption")).toContainText("Das erste Wort bedeutet: ich.");
  await expect(explain).toHaveAttribute("data-stage", "explain", { timeout: 30_000 });
  await expect(page.getByTestId("explain-word-ana")).toHaveAttribute("data-highlighted", "true");
  await expect(page.getByTestId("explain-label")).toHaveText("في أول الكلمة");
  await expect(page.getByTestId("explain-caption")).toContainText("Die Hamza steht am Anfang vom Wort.");
  await expect(explain).toHaveAttribute("data-stage", "ready", { timeout: 20_000 });
  expect(played.slice(2)).toEqual(["e_start_a", "e_start_b"]); // the word recording is missing: skipped

  // Scene 4 shows the gap: قَرَأَ, the neighbour without a Hand muted, the Alif apart.
  await page.getByTestId("explain-next").tap();
  await page.getByTestId("explain-next").tap();
  await page.getByTestId("explain-next").tap();
  await expect(explain).toHaveAttribute("data-scene", "4");
  await expect(explain).toHaveAttribute("data-stage", "explain", { timeout: 30_000 });
  await expect(page.getByTestId("explain-word-qaraa")).toHaveAttribute("data-gap", "true");
  await expect(page.getByTestId("explain-label")).toHaveText("منفصلة");
  await page.getByTestId("explain-next").tap(); // "Weiter zur Übung" – early: cancels the audio
  await expect(page.getByTestId("build-activity")).toBeVisible();
  await expect.poll(() => played.at(-1)).toBe("b_intro");
  for (const i of [0, 1, 2, 3]) await expect(page.getByTestId(`activity-tab-${i}`)).toBeEnabled();

  // Activity 1 – first word by touch drag, a wrong tile first. A drag must not scroll the page
  // (measured on the wrong tile, which returns, so the layout does not change).
  const scrollY = () => page.evaluate(() => window.scrollY);
  await page.getByTestId("tile-نَ").scrollIntoViewIfNeeded();
  const scrollBefore = await scrollY();
  await touchDrag(page, page.getByTestId("tile-نَ"), page.getByTestId("slot-0"));
  await expect.poll(() => played.at(-1)).toBe("b_wrong");
  await expect(page.getByTestId("slot-0")).toHaveAttribute("data-filled", "false");
  expect(await scrollY()).toBe(scrollBefore);
  for (const [i, tile] of ["أَ", "نَ", "ا"].entries()) await touchDrag(page, page.getByTestId(`tile-${tile}`), page.getByTestId(`slot-${i}`));

  const build: Array<[string, string[], string, string]> = [
    ["ana", ["أَ", "نَ", "ا"], "في أول الكلمة", "start"],
    ["saala", ["سَ", "أَ", "لَ"], "في المنتصف", "middle"],
    ["saba", ["سَ", "بَ", "أَ"], "في آخر الكلمة", "end"],
    ["qaraa", ["قَ", "رَ", "أَ"], "منفصلة", "separate"],
  ];
  for (const [n, [id, tiles, label, position]] of build.entries()) {
    if (n > 0) for (const [i, tile] of tiles.entries()) { await page.getByTestId(`tile-${tile}`).tap(); await page.getByTestId(`slot-${i}`).tap(); }
    await expect(page.getByTestId(`build-word-${id}`)).toHaveAttribute("data-phase", "done");
    await expect(page.getByTestId(`built-word-${id}`)).toHaveAttribute("data-highlighted", "true");
    await expect(page.getByTestId("build-position")).toHaveText(label);
    await expect.poll(() => played.at(-1)).toBe(`b_done_${position}`);
    await page.getByTestId("build-next").tap();
  }
  await expect(page.getByTestId("neighbors-activity")).toBeVisible({ timeout: 20_000 });
  await expect.poll(() => played.slice(-2)).toEqual(["b_all", "n_intro"]);

  // Activity 2 – the five book neighbours; the rule after three with a Hand and the one without.
  await expect(page.locator('[data-testid^="neighbor-"]')).toHaveCount(5);
  const scrollNeighbors = await scrollY();
  await touchDrag(page, page.getByTestId("neighbor-ن"), page.getByTestId("zone-left"));
  await expect.poll(() => played.at(-1)).toBe("n_left");
  expect(await scrollY()).toBe(scrollNeighbors);
  await expect(page.getByTestId("alif-center")).toHaveAttribute("data-pair", "");
  for (const [letter, holds] of [["ن", true], ["ر", false], ["س", true]] as const) {
    await page.getByTestId(`neighbor-${letter}`).tap();
    await page.getByTestId("zone-right").tap();
    await expect(page.getByTestId("alif-center")).toHaveAttribute("data-holds", String(holds));
    if (holds) await expect(page.getByTestId("pair")).toHaveAttribute("data-highlighted", "true");
  }
  await expect(page.getByTestId("rule-card")).toHaveCount(0);
  await page.getByTestId("neighbor-ق").tap();
  await page.getByTestId("zone-right").tap();
  await expect(page.getByTestId("rule-card")).toContainText("Das Alif hält sich nie am nächsten Buchstaben fest.");
  await expect.poll(() => played.at(-1), { timeout: 15_000 }).toBe("n_rule");
  await page.getByTestId("neighbors-next").tap();
  await expect.poll(() => played.at(-1)).toBe("s_intro");

  // Activity 3 – the five book words, one wrong answer, the rest right.
  const expected: Record<string, string> = { ana: "alone", qaraa: "alone", ras: "alone", saala: "held", saba: "held" };
  const reason: Record<string, string> = { ana: "start", qaraa: "nohand", ras: "nohand", saala: "hold", saba: "hold" };
  const tilesOf: Record<string, string[]> = { ana: ["أَ", "نَ", "ا"], saala: ["سَ", "أَ", "لَ"], saba: ["سَ", "بَ", "أَ"], qaraa: ["قَ", "رَ", "أَ"], ras: ["رَ", "أْ", "س"] };
  /** While answering, the word is only separate tiles – the joined shape would give the answer away. */
  const expectTilesOnly = async (id: string) => {
    await expect(page.getByTestId("sort-shaped")).toHaveCount(0);
    await expect(page.getByTestId("sort-tiles").locator('[data-testid^="sort-tile-"]')).toHaveText(tilesOf[id]!);
    // Separate boxes, laid out right to left.
    const xs = await page.getByTestId("sort-tiles").locator('[data-testid^="sort-tile-"]').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().x));
    for (let k = 1; k < xs.length; k++) expect(xs[k - 1]!).toBeGreaterThan(xs[k]! + 20);
  };
  for (let i = 0; i < 5; i++) {
    const word = page.getByTestId("sort-word");
    await expect(word).toHaveAttribute("data-phase", "ask", { timeout: 20_000 });
    await expect(page.getByTestId("sort-progress")).toHaveText(`Wort ${i + 1} von 5`);
    const id = (await word.getAttribute("data-word"))!;
    await expectTilesOnly(id);
    if (i === 0) {
      await page.getByTestId(`basket-${expected[id] === "alone" ? "held" : "alone"}`).tap();
      await expect(word).toHaveAttribute("data-phase", "apart");
      await expect.poll(() => played.at(-1)).toBe(id === "ana" ? "s_hint_start" : "s_hint");
      await expect(word).toHaveAttribute("data-phase", "rebuild", { timeout: 20_000 });
      await expect(page.getByTestId("sort-shaped")).toHaveAttribute("data-highlighted", "true");
      await expect.poll(() => played.at(-1)).toBe("s_replay");
      await expect(word).toHaveAttribute("data-phase", "ask", { timeout: 20_000 });
      await expectTilesOnly(id);
    }
    if (i === 1) await touchDrag(page, page.getByTestId("sort-card"), page.getByTestId(`basket-${expected[id]}`));
    else await page.getByTestId(`basket-${expected[id]}`).tap();
    await expect(page.getByTestId("sort-shaped")).toHaveAttribute("data-highlighted", "true");
    if (id !== "ana") await expect(page.getByTestId("sort-shaped")).toHaveAttribute("data-held", String(expected[id] === "held"));
    await expect.poll(() => played.at(-1)).toBe(`s_ok_${reason[id]}`);
  }
  await expect(page.getByTestId("sort-done")).toContainText("مُمْتَاز! 👏", { timeout: 20_000 });
  await expect.poll(() => played.at(-1)).toBe("s_done");
  await expect(page.getByTestId("step-completed")).toBeVisible();
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem("alif:progress:v1") ?? "{}"));
  expect(progress["a1/lesson-1/step-3"].completedAt).toBeTruthy();

  expect(wordRequests).toEqual([]);
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("mute is remembered across visits; Nochmal hören restarts Zuschauen, later replays the exercise intro", async ({ page }) => {
  const played = await recordPlays(page);
  await page.goto("/a1/lesson-1/step-3");
  await page.getByTestId("start-button").tap();
  await expect.poll(() => played[0]).toBe("f_intro");
  await page.getByTestId("replay-intro").tap();
  await expect.poll(() => played.at(-1)).toBe("e_intro");
  await expect(page.getByTestId("explain-activity")).toHaveAttribute("data-stage", "intro");
  await finishExplain(page);
  await expect.poll(() => played.at(-1)).toBe("b_intro");
  await page.getByTestId("replay-intro").tap();
  await expect.poll(() => played.filter((p) => p === "b_intro").length).toBe(2);
  await page.getByTestId("mute-toggle").tap();
  await page.reload();
  await expect(page.getByTestId("mute-toggle")).toHaveAttribute("aria-pressed", "true");
  played.length = 0;
  await page.getByTestId("start-button").tap();
  // Muted: Zuschauen still runs (on its fallback times), silently.
  await expect(page.getByTestId("explain-activity")).toHaveAttribute("data-stage", "letters", { timeout: 10_000 });
  await page.waitForTimeout(500);
  expect(played).toEqual([]);
});

test("reduced motion: tiles only fade in, the join is a crossfade, and the finished word still fades in", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/a1/lesson-1/step-3");
  await page.getByTestId("mute-toggle").tap();
  await page.getByTestId("start-button").tap();
  await page.getByTestId("explain-next").tap(); // skip the intro
  const tiles = page.getByTestId("explain-tiles");
  await expect(tiles).toBeVisible();
  for (const element of [tiles, tiles.locator("span").first()]) {
    expect(await element.evaluate((el) => getComputedStyle(el).transitionProperty)).toBe("opacity");
    expect(await element.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe("0.4s");
    expect(await element.evaluate((el) => getComputedStyle(el).transform)).toBe("none");
  }
  // Activity 1 keeps its crossfade too.
  await finishExplain(page);
  for (const [i, tile] of ["أَ", "نَ", "ا"].entries()) { await page.getByTestId(`tile-${tile}`).tap(); await page.getByTestId(`slot-${i}`).tap(); }
  await expect(page.getByTestId("built-word-ana")).toBeVisible();
  const fade = page.getByTestId("built-word-ana").locator("xpath=..");
  expect(await fade.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe("0.4s");
});
