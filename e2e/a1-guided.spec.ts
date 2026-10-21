import { expect, test, type Page } from "@playwright/test";

import { toneWav } from "./support/audio";
import { collectPageErrors, openButtonMode, recordExercise, refuseGuidedMicrophone } from "./support/helpers";

// A1 · Schritt 2 guided mode on a phone. Chrome runs with fake media
// (--use-fake-ui-for-media-stream, --use-fake-device-for-media-stream, see
// playwright.config.ts). The evaluation and text-to-speech routes are MOCKED –
// the real (paid) services are never called.

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

const ORDER = ["alif-fatha", "ab", "ana", "amir", "alif-kasra", "ibra", "isba", "ibriq", "alif-damma", "udhun", "umm", "usra"];

/** Mocked services; `verdicts` answers the evaluation in order (then passed). */
async function mockServices(page: Page, verdicts: boolean[] = []) {
  const calls = { evaluate: 0, tts: [] as string[] };
  await page.route("**/api/tts", async (route) => {
    calls.tts.push(route.request().postDataJSON().text);
    await route.fulfill({ status: 200, contentType: "audio/wav", body: toneWav(200) });
  });
  await page.route("**/api/pronunciation", async (route) => {
    calls.evaluate += 1;
    const passed = verdicts.shift() ?? true;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ passed, scores: { accuracy: passed ? 90 : 40 }, feedback: { rule: passed ? "excellent" : "x", message: "" }, conditionEvaluation: { azureAccuracy: passed ? 90 : 40, iqraPhonemes: ["a"], matchedRule: passed ? "excellent" : "x", message: "" } }),
    });
  });
  return calls;
}

/** A child that "speaks" (a 0.6 s tone) every 3 s – Chrome's fake device only beeps too briefly to count as speech. */
async function syntheticVoice(page: Page) {
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
      const track = dest.stream.getAudioTracks()[0]!;
      const stop = track.stop.bind(track);
      track.stop = () => {
        stop();
        (window as unknown as { __micReleased: boolean }).__micReleased = true;
        void ctx.close();
      };
      return dest.stream;
    };
  });
}

/** A silent Web Audio stream makes the no-speech path deterministic across browsers. */
async function silentVoice(page: Page) {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      const ctx = new AudioContext();
      await ctx.resume();
      const dest = ctx.createMediaStreamDestination();
      const track = dest.stream.getAudioTracks()[0]!;
      const stop = track.stop.bind(track);
      track.stop = () => {
        stop();
        void ctx.close();
      };
      return dest.stream;
    };
  });
}

const step = (page: Page) => page.getByTestId("guided-step");
const block = (page: Page, id: string) => page.getByTestId(`block-${id}`);

test("guided entry layout: start card and blurred inactive blocks", async ({ page }) => {
  await page.goto("/a1/lesson-1/alif/step-1");
  await expect(page.getByTestId("start-button")).toBeVisible();
  await expect(block(page, "alif-fatha")).toHaveAttribute("data-state", "next");
  await expect(block(page, "ab")).toHaveAttribute("data-state", "waiting");
  await expect.poll(() => block(page, "ab").evaluate((e) => getComputedStyle(e).filter)).toBe("blur(6px)");
  await expect(page.getByText("Aufnehmen")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("blurred blocks, the active block grows, wrong → again, right → light green and the next block", async ({ page }) => {
  test.setTimeout(120_000);
  const errors = collectPageErrors(page);
  await syntheticVoice(page);
  const calls = await mockServices(page, [false, true, true]);
  await page.goto("/a1/lesson-1/alif/step-1");

  // Before the start: only the first block is sharp, all others are blurred and not clickable.
  await expect(block(page, "alif-fatha")).toHaveAttribute("data-state", "next");
  for (const id of ORDER.slice(1)) {
    await expect(block(page, id)).toHaveAttribute("data-state", "waiting");
    await expect.poll(() => block(page, id).evaluate((e) => getComputedStyle(e).filter)).toBe("blur(6px)");
    expect(await block(page, id).evaluate((e) => getComputedStyle(e).pointerEvents)).toBe("none");
  }
  await expect(page.getByText("Aufnehmen")).toHaveCount(0);

  await page.getByTestId("start-button").tap();
  await expect(step(page)).toHaveAttribute("data-active", "alif-fatha");
  await expect.poll(() => block(page, "alif-fatha").evaluate((e) => getComputedStyle(e).transform)).toBe("matrix(1.05, 0, 0, 1.05, 0, 0)");
  expect(await block(page, "alif-fatha").evaluate((e) => getComputedStyle(e).filter)).toBe("none");
  await expect(page.getByTestId("listening-sign")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId("guided-caption")).toHaveText("Jetzt du!");

  // Wrong first: "Noch einmal", played again.
  await expect(page.getByTestId("guided-caption")).toHaveText(/Noch einmal/, { timeout: 15_000 });
  // Then right: light green tint, saved, the next block becomes active.
  await expect(step(page)).toHaveAttribute("data-active", "ab", { timeout: 20_000 });
  await expect(block(page, "alif-fatha")).toHaveAttribute("data-state", "done");
  const tint = await page.getByTestId("tint-alif-fatha").evaluate((e) => getComputedStyle(e).backgroundColor);
  expect(tint).toMatch(/rgba\(\d+, \d+, \d+, 0\.1\)/);
  await expect.poll(() => block(page, "ab").evaluate((e) => getComputedStyle(e).filter)).toBe("none"); // after the 400 ms fade
  expect(await block(page, "ana").evaluate((e) => getComputedStyle(e).filter)).toBe("blur(6px)");
  await expect(step(page)).toHaveAttribute("data-active", "ana", { timeout: 20_000 });

  expect(calls.evaluate).toBe(3);
  // After each right answer "Super!" (German voice) is spoken before the next block; the word أَب is spoken with Tanwin.
  expect(calls.tts.slice(0, 3)).toEqual(["أَ", "Super!", "أَبٌ"]);
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem("alif:progress:v1") ?? "{}"));
  expect(progress["a1/lesson-1/alif/step-1"].passed).toEqual(["alif-fatha", "ab"]);

  // Leaving the page (client-side navigation) turns the microphone off.
  await page.getByTestId("back-to-unit").click();
  await expect(page).toHaveURL(/\/a1\/lesson-1$/);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __micReleased?: boolean }).__micReleased)).toBe(true);
  expect(errors).toEqual([]);
});

test("no speech: no evaluation call; unlimited retries – the block is asked again and again, never amber, never skipped", async ({ page }) => {
  test.setTimeout(120_000);
  await silentVoice(page);
  const calls = await mockServices(page);
  await page.goto("/a1/lesson-1/alif/step-1");
  await page.getByTestId("start-button").tap();
  await expect(step(page)).toHaveAttribute("data-active", "alif-fatha");
  // Well beyond the former three attempts (5 s listening window each).
  await page.waitForTimeout(25_000);
  await expect(step(page)).toHaveAttribute("data-active", "alif-fatha");
  await expect(block(page, "alif-fatha")).not.toHaveAttribute("data-state", "practice");
  // The model audio was played again for every new attempt (cached /api/tts URL, so one request).
  expect(calls.tts.filter((t) => t === "أَ").length).toBeGreaterThanOrEqual(1);
  expect(calls.evaluate).toBe(0);
});

test("resume: done blocks stay green, the flow continues at the first open block", async ({ page }) => {
  await syntheticVoice(page);
  await mockServices(page);
  await page.goto("/a1/lesson-1/alif/step-1");
  await page.evaluate(() => localStorage.setItem("alif:progress:v1", JSON.stringify({ "a1/lesson-1/alif/step-1": { passed: ["alif-fatha", "ab", "ana", "amir"] } })));
  await page.reload();
  for (const id of ORDER.slice(0, 4)) await expect(block(page, id)).toHaveAttribute("data-state", "done");
  await expect(block(page, "alif-kasra")).toHaveAttribute("data-state", "next");
  await page.getByTestId("start-button").tap();
  await expect(step(page)).toHaveAttribute("data-active", "alif-kasra");
});

test("reduced motion: the active block does not grow, the listening sign does not pulse", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await syntheticVoice(page);
  await mockServices(page);
  await page.goto("/a1/lesson-1/alif/step-1");
  await page.getByTestId("start-button").tap();
  await expect(page.getByTestId("listening-sign")).toBeVisible({ timeout: 10_000 });
  expect(await block(page, "alif-fatha").evaluate((e) => getComputedStyle(e).transform)).toBe("none");
  expect(await page.getByTestId("listening-sign").locator("span").first().evaluate((e) => getComputedStyle(e).animationName)).toBe("none");
});

test("fallback: microphone not available → today's page with buttons and a note; the buttons work", async ({ page }) => {
  // Only guided mode's request (with echo cancellation) is refused; the buttons' recording still works.
  await syntheticVoice(page);
  await refuseGuidedMicrophone(page);
  const calls = await mockServices(page);
  await page.goto("/a1/lesson-1/alif/step-1");
  await openButtonMode(page);
  await expect(page.getByTestId("guided-note")).toHaveText("Das Mikrofon ist nicht verfügbar. Du kannst die Knöpfe benutzen.");
  await expect(page.getByTestId("exercise-ab-record")).toBeVisible();
  await recordExercise(page, "ab");
  await expect(page.getByTestId("exercise-ab-feedback-headline")).toHaveText("مُمْتَاز! 👏");
  expect(calls.evaluate).toBe(1);
});

// The child's own controls: skip after two wrong answers, previous word, start over.
const SHOTS = process.env.ALIF_E2E_SHOTS;
const shot = async (page: Page, name: string) => {
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png` });
};
const evaluated = (calls: { evaluate: number }, n: number) => expect.poll(() => calls.evaluate, { timeout: 30_000, intervals: [100] }).toBe(n);

test("controls: fail once → no Skip; fail twice → Skip fades in; skip → next word, saved as skipped, counter starts again", async ({ page }) => {
  test.setTimeout(150_000);
  const errors = collectPageErrors(page);
  await syntheticVoice(page);
  const calls = await mockServices(page, Array(40).fill(false)); // every answer wrong
  await page.goto("/a1/lesson-1/alif/step-1");
  await expect(page.getByTestId("guided-controls")).toHaveCount(0); // not before the start
  await page.getByTestId("start-button").tap();
  await expect(step(page)).toHaveAttribute("data-active", "alif-fatha");
  await expect(page.getByTestId("guided-previous")).toBeDisabled(); // first word
  await expect(page.getByTestId("guided-restart")).toBeEnabled();
  await shot(page, "1-start");

  await evaluated(calls, 1);
  await expect(page.getByTestId("guided-caption")).toHaveText(/Noch einmal/);
  await expect(page.getByTestId("guided-skip")).toHaveCount(0);
  await shot(page, "2-one-failure");

  await evaluated(calls, 2);
  const skip = page.getByTestId("guided-skip");
  await expect(skip).toBeVisible();
  expect(await skip.evaluate((e) => getComputedStyle(e).animationName)).toBe("fade-in");
  await expect(step(page)).toHaveAttribute("data-active", "alif-fatha"); // the child can keep trying
  // Within the screen on a phone, no horizontal scrolling, the Skip button stays secondary (card background, not the primary colour).
  const box = (await page.getByTestId("guided-controls").boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(390);
  expect(box.y + box.height).toBeLessThanOrEqual(844);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const [skipBg, cardBg] = await skip.evaluate((e) => [getComputedStyle(e).backgroundColor, getComputedStyle(document.querySelector("[data-testid=start-button], .bg-card")!).backgroundColor]);
  expect(skipBg).toBe(cardBg);
  await page.waitForTimeout(400);
  await shot(page, "3-two-failures-skip");

  await skip.tap();
  await expect(step(page)).toHaveAttribute("data-active", "ab");
  await expect(page.getByTestId("guided-skip")).toHaveCount(0);
  await expect(block(page, "alif-fatha")).toHaveAttribute("data-state", "practice");
  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem("alif:progress:v1") ?? "{}")["a1/lesson-1/alif/step-1"]);
  expect(progress).toMatchObject({ passed: [], skipped: ["alif-fatha"] });
  await evaluated(calls, 3); // a wrong answer on the new word: the counter started again
  await expect(page.getByTestId("guided-caption")).toHaveText(/Noch einmal/);
  await expect(page.getByTestId("guided-skip")).toHaveCount(0);
  await expect(page.getByTestId("guided-previous")).toBeEnabled();
  await shot(page, "4-after-skip");
  expect(errors).toEqual([]);
});

test("controls: Previous goes back a word; Start over asks first, then back to word 1 with the progress reset", async ({ page }) => {
  test.setTimeout(150_000);
  const errors = collectPageErrors(page);
  await syntheticVoice(page);
  await mockServices(page, [true, true]);
  await page.goto("/a1/lesson-1/alif/step-1");
  await page.getByTestId("start-button").tap();
  await expect(step(page)).toHaveAttribute("data-active", "ana", { timeout: 40_000 });

  await page.getByTestId("guided-previous").tap();
  await expect(step(page)).toHaveAttribute("data-active", "ab");
  await page.getByTestId("guided-previous").tap();
  await expect(step(page)).toHaveAttribute("data-active", "alif-fatha");
  await expect(page.getByTestId("guided-previous")).toBeDisabled();

  await page.getByTestId("guided-restart").tap();
  await expect(page.getByTestId("guided-restart-confirm")).toBeVisible();
  await expect(page.getByTestId("guided-restart-confirm")).toContainText("Von vorn anfangen?");
  await expect(step(page)).toHaveAttribute("data-stage", "paused");
  await page.waitForTimeout(400);
  await shot(page, "5-restart-confirm");
  await page.getByTestId("guided-restart-cancel").tap();
  await expect(page.getByTestId("guided-restart-confirm")).toHaveCount(0);
  await expect(page.getByTestId("guided-restart")).toBeVisible();

  // Move on a word, then start over for real.
  await expect(step(page)).toHaveAttribute("data-active", "ab", { timeout: 40_000 });
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("alif:progress:v1") ?? "{}")["a1/lesson-1/alif/step-1"].passed)).toEqual(["alif-fatha", "ab"]);
  await page.getByTestId("guided-restart").tap();
  await page.getByTestId("guided-restart-yes").tap();
  await expect(step(page)).toHaveAttribute("data-active", "alif-fatha");
  await expect(block(page, "alif-fatha")).not.toHaveAttribute("data-state", "done");
  await expect(block(page, "ab")).not.toHaveAttribute("data-state", "done");
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("alif:progress:v1") ?? "{}")["a1/lesson-1/alif/step-1"] ?? null)).toBeNull();
  await shot(page, "6-after-restart");
  expect(errors).toEqual([]);
});
