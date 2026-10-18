import { expect, type Locator, type Page } from "@playwright/test";

import type { GapItem } from "../../src/data/types";
import { gapTask } from "../../src/lib/arabic/gap";

import { buildAssessment } from "../../src/lib/pronunciation/assessment";
import { CONDITION_RULES } from "../../src/lib/pronunciation/rules";
import { toneWav } from "./audio";
import { parseUpload } from "./helpers";

// Shared by the A1 letter lessons' e2e tests (e2e/a1-ba.spec.ts, e2e/a1-letters.spec.ts):
// mocked services, a synthetic voice, touch input and the writing board.

/** IQRA phonemes that satisfy a target's "excellent" rule (first alternative of every "contains"). */
export function excellentPhonemes(target: string) {
  return (CONDITION_RULES[target]?.excellent?.conditions ?? [])
    .map((condition) => condition.match(/^iqra_phonemes\s+contains\s+(.+)$/)?.[1])
    .filter((list): list is string => Boolean(list))
    .flatMap((list) => list.replace(/[\[\]'\s]/g, "").split(",").map((token) => token.split("|")[0]!));
}

export async function mockServices(page: Page) {
  const calls = { uploads: [] as string[], tts: [] as string[] };
  await page.route("**/api/tts", async (route) => {
    calls.tts.push(route.request().postDataJSON().text);
    await route.fulfill({ status: 200, contentType: "audio/wav", body: toneWav(200) });
  });
  await page.route("**/api/pronunciation", async (route) => {
    const target = parseUpload(route.request()).target!;
    calls.uploads.push(target);
    const phonemes = excellentPhonemes(target);
    const body = buildAssessment({
      target,
      primary: { referenceText: target, recognized: target, accuracy: 90, pronunciation: 80, fluency: 90, completeness: 100, firstSoundScore: 80, words: [] },
      iqra: { sequence: phonemes.join(" "), phonemes, duration: 0.6 },
    });
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });
  return calls;
}

/** A child that "speaks" (a 0.6 s tone) every 3 s – for the guided mode's voice detection. */
export async function syntheticVoice(page: Page) {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      const ctx = new AudioContext();
      await ctx.resume();
      const osc = ctx.createOscillator();
      osc.frequency.value = 220;
      const gain = ctx.createGain();
      const dest = ctx.createMediaStreamDestination();
      osc.connect(gain).connect(dest);
      const t = ctx.currentTime;
      gain.gain.setValueAtTime(0, t);
      for (let k = 0; k < 200; k++) {
        gain.gain.setValueAtTime(0.5, t + 0.8 + k * 3);
        gain.gain.setValueAtTime(0, t + 1.4 + k * 3);
      }
      osc.start();
      return dest.stream;
    };
  });
}

export const noHorizontalScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
export const scrollY = (page: Page) => page.evaluate(() => window.scrollY);

/** A touch drag through Chrome's input pipeline (touch → pointer events). */
export async function touchDrag(page: Page, from: Locator, to: Locator) {
  const cdp = await page.context().newCDPSession(page);
  const a = (await from.boundingBox())!;
  const b = (await to.boundingBox())!;
  const [x0, y0, x1, y1] = [a.x + a.width / 2, a.y + a.height / 2, b.x + b.width / 2, b.y + b.height / 2];
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: x0, y: y0 }] });
  for (let i = 1; i <= 10; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x0 + ((x1 - x0) * i) / 10, y: y0 + ((y1 - y0) * i) / 10 }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

/** Points of an SVG path in the 240 × 320 writing box, as screen points on the board. */
export async function boardPoints(page: Page, d: string, n = 40) {
  const pts = await page.evaluate(
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
  const r = (await page.getByTestId("writing-board").boundingBox())!;
  return pts.map((p) => ({ x: r.x + (p.x / 240) * r.width, y: r.y + (p.y / 320) * r.height }));
}

export async function touchStroke(page: Page, pts: { x: number; y: number }[]) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [pts[0]!] });
  for (const p of pts.slice(1)) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [p] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

/**
 * Answers every item of a gap step (taps: tile, then the active gap; several
 * gaps right to left) and waits for the result screen. Checks on the way:
 * no horizontal scrolling; the pieces of _ا_ and نَ_ق in their joined shape.
 */
export async function answerGaps(page: Page, items: GapItem[]) {
  for (const [i, item] of items.entries()) {
    await expect(page.getByTestId("gap-item")).toHaveAttribute("data-item", item.id, { timeout: 15_000 });
    expect(await noHorizontalScroll(page), item.arabic).toBe(true);
    if (item.arabic === "بَابْ") await expect(page.getByTestId("gap-piece")).toHaveText(["ـا"]);
    if (item.arabic === "نَبْق") await expect(page.getByTestId("gap-piece")).toHaveText(["نَـ", "ـق"]);
    for (const gap of gapTask(item).gaps) {
      await page.locator(`[data-choice="${gap.answer}"]`).tap();
      await page.locator('[data-testid="gap-slot"][data-active="true"]').tap();
    }
    await expect(page.getByTestId("gap-shaped")).toContainText(item.arabic);
    expect(await noHorizontalScroll(page), item.arabic).toBe(true);
    if (i < items.length - 1) await page.getByTestId("gap-next").tap();
  }
  await expect(page.getByTestId("gap-result")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("step-completed")).toHaveText(/Geschafft/);
}
