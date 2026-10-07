import { expect, test, type Page } from "@playwright/test";

import { alifWriting } from "../src/data/letters/alif";
import { collectPageErrors } from "./support/helpers";

// A1 · Lektion 1 · Schritt 4 "Schreiben": tracing on the board with simulated
// pointer strokes (mouse and touch), on a phone-sized viewport.

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

const form = (id: string) => alifWriting.forms.find((f) => f.id === id)!;

/** Points of an SVG path in the 240 × 320 writing box, sampled by the browser. */
async function pathPoints(page: Page, d: string, n = 40) {
  return page.evaluate(
    ([d, n]) => {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", d);
      svg.appendChild(path);
      document.body.appendChild(svg);
      const L = path.getTotalLength();
      const out = Array.from({ length: n + 1 }, (_, i) => path.getPointAtLength((L * i) / n)).map((q) => ({ x: q.x, y: q.y }));
      svg.remove();
      return out;
    },
    [d, n] as const
  );
}

async function toScreen(page: Page, pts: { x: number; y: number }[]) {
  const board = page.getByTestId("writing-board");
  await board.scrollIntoViewIfNeeded();
  const r = (await board.boundingBox())!;
  return pts.map((p) => ({ x: r.x + (p.x / 240) * r.width, y: r.y + (p.y / 320) * r.height }));
}

/** A stroke with the mouse (pointer events). */
async function mouseStroke(page: Page, d: string, reverse = false) {
  let pts = await toScreen(page, await pathPoints(page, d));
  if (reverse) pts = pts.reverse();
  await page.mouse.move(pts[0]!.x, pts[0]!.y);
  await page.mouse.down();
  for (const p of pts.slice(1)) await page.mouse.move(p.x, p.y);
  await page.mouse.up();
}

/** A stroke with a finger, through Chrome's touch input (touch → pointer events). */
async function touchStroke(page: Page, d: string) {
  const pts = await toScreen(page, await pathPoints(page, d));
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [pts[0]!] });
  for (const p of pts.slice(1)) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [p] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

const step = (page: Page) => page.getByTestId("writing-step");
const instruction = (page: Page) => page.getByTestId("writing-instruction");

test("trace with mouse and finger, get hints for wrong strokes, finish → Geschafft", async ({ page }) => {
  test.setTimeout(120_000);
  const errors = collectPageErrors(page);
  await page.goto("/a1/lesson-1/step-4");
  await expect(page.getByTestId("step-position")).toHaveText("Schritt 4 von 6");
  await expect(page.getByTestId("step-next")).toHaveText(/Weiter: Ergänzen/);
  // A fresh visit is not "Geschafft" – step 4 completes only after the last form.
  await expect(step(page)).toHaveAttribute("data-ready", "true");
  await expect(page.getByTestId("step-completed")).toHaveCount(0);
  await expect(step(page)).toHaveAttribute("data-current", "alif");
  await expect(instruction(page)).toHaveText("Fahr das Alif nach. Fang beim grünen Punkt an.");

  // Wrong direction → hint, nothing is marked.
  await mouseStroke(page, form("alif").strokes[0]!.d, true);
  await expect(instruction(page)).toHaveText("Andersrum! Folge dem Pfeil.");
  await expect(instruction(page)).toHaveText("Fahr das Alif nach. Fang beim grünen Punkt an.", { timeout: 3000 });

  // ا traced correctly with the mouse → green stroke, stars, the next form.
  await mouseStroke(page, form("alif").strokes[0]!.d);
  await expect(page.getByTestId("writing-toast")).toBeVisible();
  await expect(page.getByTestId("gray-alif")).toHaveAttribute("data-done", "traced");
  expect(Number(await page.getByTestId("gray-alif").getAttribute("data-stars"))).toBeGreaterThanOrEqual(1);
  await expect(step(page)).toHaveAttribute("data-current", "alif-end", { timeout: 3000 });

  // ـا traced with a finger; the page must not scroll while drawing.
  const scrollBefore = await page.evaluate(() => window.scrollY);
  await touchStroke(page, form("alif-end").strokes[0]!.d);
  expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore);
  await expect(page.getByTestId("gray-alif-end")).toHaveAttribute("data-done", "traced");
  await expect(step(page)).toHaveAttribute("data-current", "alif-hamza", { timeout: 3000 });

  // أ: the Hamza first → "Zuerst das Alif, dann die Hamza."; then body and Hamza in order.
  await mouseStroke(page, form("alif-hamza").strokes[1]!.d);
  await expect(instruction(page)).toHaveText("Zuerst das Alif, dann die Hamza.");
  await expect(instruction(page)).toHaveText("Fahr das Alif mit Hamza nach. Fang beim grünen Punkt an.", { timeout: 3000 });
  await mouseStroke(page, form("alif-hamza").strokes[0]!.d);
  await expect(instruction(page)).toHaveText("Gut! Jetzt die Hamza oben. Fang beim grünen Punkt ٢ an.");
  await mouseStroke(page, form("alif-hamza").strokes[1]!.d);
  await expect(page.getByTestId("gray-alif-hamza")).toHaveAttribute("data-done", "traced");
  await expect(step(page)).toHaveAttribute("data-current", "alif-hamza-end", { timeout: 3000 });

  // ـأ: skipped (keyboard path) → done without stars, the exercise is complete.
  await page.getByTestId("writing-skip").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("gray-alif-hamza-end")).toHaveAttribute("data-done", "skipped");
  await expect(page.getByTestId("gray-alif-hamza-end")).toHaveAttribute("data-stars", "0");
  await expect(step(page)).toHaveAttribute("data-complete", "true");
  await expect(instruction(page)).toHaveText("Super! Du hast alle vier Formen nachgefahren. Übung 1 geschafft!");
  await expect(page.getByTestId("writing-done")).toContainText("Geschafft");
  await expect(page.getByTestId("writing-done")).toContainText("مُمْتَاز! 👏");
  await expect(page.getByTestId("step-completed")).toBeVisible();
  await expect(page.getByTestId("writing-skip")).toBeDisabled();
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem("alif:progress:v1") ?? "{}"));
  expect(progress["a1/lesson-1/step-4"].completedAt).toBeTruthy();

  // Still "Geschafft" after a reload.
  await page.reload();
  await expect(page.getByTestId("step-completed")).toBeVisible();

  expect(errors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("tapping a grey letter loads it and brings the board into view; the model letter plays the demo", async ({ page }) => {
  await page.goto("/a1/lesson-1/step-4");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByTestId("gray-alif-hamza").tap();
  await expect(step(page)).toHaveAttribute("data-current", "alif-hamza");
  await expect(page.getByTestId("gray-alif-hamza")).toHaveAttribute("aria-pressed", "true");
  await expect.poll(async () => {
    const r = (await page.getByTestId("writing-board").boundingBox())!;
    return r.y >= 0 && r.y + r.height <= 844 + 1;
  }).toBe(true);
  // Board canvas: no page scrolling while drawing, tap targets ≥ 48 px.
  expect(await page.getByTestId("writing-board").evaluate((el) => getComputedStyle(el).touchAction)).toBe("none");
  for (const id of ["model-alif", "gray-alif", "writing-demo", "writing-next", "writing-skip"]) {
    const box = (await page.getByTestId(id).boundingBox())!;
    expect(Math.min(box.width, box.height), id).toBeGreaterThanOrEqual(48);
  }
  await page.getByTestId("writing-demo").tap(); // runs without errors; tracing waits for it
});

test("production build: ?debug=1 shows no debug panel; reduced motion: no pop animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/a1/lesson-1/step-4?debug=1");
  await expect(step(page)).toHaveAttribute("data-ready", "true");
  await expect(page.getByTestId("writing-debug")).toHaveCount(0);
  await mouseStroke(page, form("alif").strokes[0]!.d);
  const toast = page.getByTestId("writing-toast");
  await expect(toast).toBeVisible();
  expect(await toast.evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
});
