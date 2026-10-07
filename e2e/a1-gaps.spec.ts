import { expect, test, type Locator, type Page } from "@playwright/test";

import { collectPageErrors } from "./support/helpers";

// A1 · Lektion 1 · Schritt 5 "Ergänzen" and 6 "Hören" on a phone: real
// browser, real recorded narration (public/audio/a1/lesson-1/uebungen); plays
// are recorded by wrapping HTMLMediaElement.play. Word recordings are not in
// the repo yet: they must never be requested.

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

const WORD_FILES = /\/(ab|ana|amir|ibra|isba|ibriq|udhun|umm|usra|ras)\.wav$/;

async function recordPlays(page: Page) {
  const played: string[] = [];
  const requested: string[] = [];
  page.on("request", (r) => r.url().includes("/audio/") && requested.push(r.url().split("/").pop()!.replace(".wav", "")));
  await page.exposeFunction("__played", (src: string) => played.push(src.split("/").pop()!.replace(".wav", "")));
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      if (!this.src.startsWith("data:")) (window as unknown as { __played: (s: string) => void }).__played(this.src);
      return play.call(this);
    };
  });
  return { played, requested };
}

async function touchDrag(page: Page, from: Locator, to: Locator) {
  const cdp = await page.context().newCDPSession(page);
  const a = (await from.boundingBox())!;
  const b = (await to.boundingBox())!;
  const [x0, y0, x1, y1] = [a.x + a.width / 2, a.y + a.height / 2, b.x + b.width / 2, b.y + b.height / 2];
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y: y0 }] });
  for (let i = 1; i <= 10; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 + ((x1 - x0) * i) / 10, y: y0 + ((y1 - y0) * i) / 10 }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

const choice = (page: Page, letter: string) => page.locator(`[data-choice="${letter}"]`);

async function tapAnswer(page: Page, letter: string) {
  await choice(page, letter).tap();
  await page.getByTestId("gap-slot").tap();
}

/** Plays a step through: answers (index → letter), with one wrong-wrong-right item and one drag. */
async function playStep(page: Page, step: string, answers: string[], wrongAt: number, wrongLetter: string, reveal: string) {
  const { played, requested } = await recordPlays(page);
  const errors = collectPageErrors(page);
  await page.goto(`/a1/lesson-1/${step}`);
  await page.waitForTimeout(300);
  expect(played).toEqual([]);
  await page.getByTestId("start-button").tap();
  await expect.poll(() => played[0]).toBe(step === "step-5" ? "g5_intro" : "g6_intro");

  for (const [i, answer] of answers.entries()) {
    await expect(page.getByTestId("gap-progress")).toHaveText(`Aufgabe ${i + 1} von ${answers.length}`, { timeout: 15_000 });
    if (i === wrongAt) {
      await tapAnswer(page, wrongLetter);
      await expect.poll(() => played.at(-1)).toBe("g_hint");
      await expect(page.getByTestId("gap-caption")).toHaveText("Fast! Hör noch einmal genau zu.");
      await expect(page.locator('[data-reveal="true"]')).toHaveCount(0);
      // Second wrong answer by touch drag; the page must not scroll.
      const scrollBefore = await page.evaluate(() => window.scrollY);
      await touchDrag(page, choice(page, wrongLetter), page.getByTestId("gap-slot"));
      expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore);
      await expect.poll(() => played.at(-1)).toBe(reveal);
      await expect(page.locator('[data-reveal="true"]')).toHaveAttribute("data-choice", answer);
      await expect(page.getByTestId("gap-shaped")).toHaveCount(0);
    }
    if (i === 1) await touchDrag(page, choice(page, answer), page.getByTestId("gap-slot"));
    else await tapAnswer(page, answer);
    await expect(page.getByTestId("gap-shaped")).toHaveAttribute("data-highlighted", "true");
    await expect.poll(() => played.at(-1), { timeout: 6000 }).toBe("g_ok");
  }

  const result = page.getByTestId("gap-result");
  await expect(result).toBeVisible({ timeout: 15_000 });
  await expect(result).toHaveAttribute("data-first-try", String(answers.length - 1));
  await expect(result).toContainText("مُمْتَاز! 👏");
  await expect.poll(() => played.at(-1)).toBe(step === "step-5" ? "g5_done" : "g6_done");
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem("alif:progress:v1") ?? "{}"));
  expect(progress[`a1/lesson-1/${step}`].completedAt).toBeTruthy();
  expect(requested.filter((f) => WORD_FILES.test(`/${f}.wav`))).toEqual([]);
  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  return { played, requested };
}

test("Schritt 5 Ergänzen: picture, tap and drag, hint and reveal, Korrigieren", async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto("/a1/lesson-1/step-5");
  await expect(page.getByTestId("step-position")).toHaveText("Schritt 5 von 6");
  await expect(page.getByTestId("step-prev")).toHaveText(/Zurück: Schreiben/);
  await expect(page.getByTestId("step-next")).toHaveText(/Weiter: Hören/);
  const { requested } = await playStep(page, "step-5", ["أَ", "أَ", "أَ", "إِ", "إِ", "إِ", "أُ", "أُ", "أُ"], 3, "أُ", "g_reveal_i");
  for (const key of ["g5_intro", "g_hint", "g_reveal_i", "g_ok", "g5_done"]) expect(requested, key).toContain(key);
  await expect(page.getByTestId("result-ibra")).toHaveAttribute("data-first-try", "false");
  await expect(page.getByTestId("gap-stars")).toBeVisible();
});

test("Schritt 6 Hören: no picture, the sukun item in the middle, reveal sukun, Korrigieren", async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto("/a1/lesson-1/step-6");
  await expect(page.getByTestId("step-position")).toHaveText("Schritt 6 von 6");
  await expect(page.getByTestId("step-prev")).toHaveText(/Zurück: Ergänzen/);
  await expect(page.getByTestId("back-to-lessons")).toHaveText(/Zurück zu A1/);
  const { requested } = await playStep(page, "step-6", ["أُ", "إِ", "أَ", "إِ", "أُ", "إِ", "أَ", "أَ", "أُ", "أْ"], 9, "أَ", "g_reveal_sukun");
  for (const key of ["g6_intro", "g_hint", "g_reveal_sukun", "g_ok", "g6_done"]) expect(requested, key).toContain(key);
  await expect(page.getByTestId("result-ras")).toHaveAttribute("data-first-try", "false");
});

test("Hören shows رَ, the gap, then س; no picture; pills fit on two lines", async ({ page }) => {
  await page.goto("/a1/lesson-1/step-6");
  const tops = await page.locator('[data-testid^="step-tab-"]').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
  expect(new Set(tops).size).toBe(2);
  await page.getByTestId("mute-toggle").tap();
  await page.getByTestId("start-button").tap();
  for (const answer of ["أُ", "إِ", "أَ", "إِ", "أُ", "إِ", "أَ", "أَ", "أُ"]) {
    await tapAnswer(page, answer);
    await page.getByTestId("gap-next").tap();
  }
  await expect(page.getByTestId("gap-item")).toHaveAttribute("data-item", "ras");
  await expect(page.getByTestId("gap-image")).toHaveCount(0);
  await expect(page.getByTestId("gap-piece")).toHaveText(["رَ", "س"]);
  // RTL: رَ on the right, then the gap, then س on the left.
  const xs = await Promise.all([page.getByTestId("gap-piece").first(), page.getByTestId("gap-slot"), page.getByTestId("gap-piece").last()].map(async (l) => (await l.boundingBox())!.x));
  expect(xs[0]!).toBeGreaterThan(xs[1]!);
  expect(xs[1]!).toBeGreaterThan(xs[2]!);
});
