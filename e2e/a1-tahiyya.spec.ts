import { expect, test, type Locator, type Page } from "@playwright/test";

import { a1Tahiyya, majidFatimaDialogue } from "../src/data/a1/tahiyya";
import dialogueManifest from "../src/lib/tts/dialogue-manifest.json";
import { collectPageErrors, recordExercise } from "./support/helpers";
import { mockServices, noHorizontalScroll, syntheticVoice } from "./support/letters";

// A1 · Lektion 1 · the textbook page after "صَبَاحُ الْخَيْر": Begrüßung, Sich
// vorstellen, Anhören, Übung 1 (Rollenspiel), Übung 2 (ا), Übung 3 (ب).
// TTS and the evaluation are MOCKED (answers built by the app's real rules
// from simulated IQRA input that satisfies them); the browser, the microphone
// path (fake voice), the WAV upload, the letter geometry and the flow are real.

const BASE = "/a1/lesson-1/tahiyya-wa-taqdim";
const progress = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("alif:progress:v1") ?? "{}"));
const recorded: Record<string, { file: string }> = dialogueManifest.lines;

/** What the page loads to speak a dialogue line: its recording (public/audio/ar/), or – without one – /api/tts. */
function heardLines(page: Page, tts: string[]) {
  const files: string[] = [];
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname;
    if (path.startsWith("/audio/ar/d-")) files.push(path);
  });
  return (lines: Array<{ id: string; arabic: string }>) =>
    lines.map((line) => (recorded[line.id] ? files.includes(`/audio/ar/${recorded[line.id]!.file}.mp3`) : tts.includes(line.arabic)));
}

/** A finger tap on the middle of a letter's glyph (the letter buttons lie exactly on their glyphs). */
async function tapLetter(page: Page, letter: Locator) {
  await letter.scrollIntoViewIfNeeded();
  const box = (await letter.boundingBox())!;
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height * 0.6);
}

test.describe("phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("from the end of صَبَاحُ الْخَيْر to the new entry; Begrüßung and Sich vorstellen guided: played, repeated, checked – no buttons", async ({ page }) => {
    test.setTimeout(240_000);
    const errors = collectPageErrors(page);
    const calls = await mockServices(page);
    await syntheticVoice(page);

    await page.goto("/a1/lesson-1/sabah-al-khayr/step-7");
    await page.getByTestId("next-entry").tap();
    await expect(page).toHaveURL(new RegExp(`${BASE}/step-1$`)); // the entry opens at its first step
    await page.goto("/a1/lesson-1");
    await page.getByTestId("unit-entry-tahiyya-wa-taqdim").tap();
    await expect(page).toHaveURL(new RegExp(`${BASE}/step-1$`));
    await expect(page.locator('[data-testid^="step-tab-"]')).toHaveCount(6);
    await expect(page.getByTestId("step-instruction-arabic")).toHaveText("التَّحِيَّةُ فِي الصَّبَاحِ");

    // Masculine and feminine side by side, marked as such.
    await expect(page.getByTestId("phrase-tag-p-kayfa-haluka")).toHaveText(/zu einem Mann/);
    await expect(page.getByTestId("phrase-tag-p-kayfa-haluki")).toHaveText(/zu einer Frau/);
    await expect(page.getByTestId("phrase-arabic-p-kayfa-haluki")).toHaveText("كَيْفَ حَالُكِ؟");
    await expect(page.getByTestId("phrase-german-p-bi-khayr")).toContainText("Gut, Gott sei Dank.");
    expect(await noHorizontalScroll(page)).toBe(true);

    // One tap, then every expression by itself: played (in the speaker's voice – Majid's recording of
    // حَالُكِ, or /api/tts in his voice without it), repeated, checked, tinted; no listen / record buttons.
    const heard = page.waitForRequest(
      (r) => r.url().includes(`/audio/ar/${recorded["t-kayfa-haluki"]!.file}.mp3`) || (r.url().endsWith("/api/tts") && (r.postData() ?? "").includes("حَالُكِ")),
      { timeout: 120_000 }
    );
    await expect(page.getByTestId("start-overlay")).toBeVisible();
    await expect(page.getByTestId("exercise-p-kayfa-haluki-listen")).toHaveCount(0);
    await page.getByTestId("start-button").tap();
    await expect(page.getByTestId("guided-step")).toHaveAttribute("data-mode", "guided");
    await heard;
    const step1 = a1Tahiyya.steps[0]!;
    if (step1.kind !== "phrases") throw new Error("step-1 must be phrases");
    await expect(page.getByTestId("guided-step")).toHaveAttribute("data-stage", "finished", { timeout: 150_000 });
    for (const item of step1.groups.flatMap((g) => g.items)) await expect(page.getByTestId(`block-${item.id}`)).toHaveAttribute("data-state", "done");
    expect(calls.uploads).toEqual(["صباح الخير", "صباح النور", "كيف حالك", "كيف حالك", "بخير الحمد لله"]);
    await expect(page.getByTestId("step-completed")).toBeVisible();

    await page.getByTestId("step-next").tap();
    await expect(page).toHaveURL(new RegExp(`${BASE}/step-2$`));
    await expect(page.getByTestId("phrase-arabic-p-ana-majid")).toHaveText("أَنَا مَاجِدٌ.");
    await expect(page.getByTestId("phrase-arabic-p-wa-ana-fatima")).toHaveText("وَأَنَا فَاطِمَةُ.");
    await page.getByTestId("start-button").tap();
    await expect(page.getByTestId("guided-step")).toHaveAttribute("data-stage", "finished", { timeout: 60_000 });
    expect(calls.uploads.slice(-2)).toEqual(["أنا ماجد", "وأنا فاطمة"]);
    const p = await progress(page);
    for (const n of [1, 2]) expect(p[`a1/lesson-1/tahiyya-wa-taqdim/step-${n}`]?.completedAt, `step-${n}`).toBeTruthy();
    expect(await noHorizontalScroll(page)).toBe(true);
    expect(errors).toEqual([]);
  });

  test("Übung 1: role-play as Majid – the app speaks Fatima; Majid asks her name; then (green) Fatima", async ({ page }) => {
    test.setTimeout(420_000);
    const errors = collectPageErrors(page);
    await syntheticVoice(page);
    const calls = await mockServices(page);
    const heard = heardLines(page, calls.tts);
    await page.goto(`${BASE}/step-4`);
    await expect(page.getByTestId("step-instruction-german")).toHaveText("Spiele den Dialog mit deinem Lernpartner nach und frage nach seinem oder ihrem Namen.");
    await expect(page.getByTestId("role-majid")).toHaveAttribute("aria-pressed", "true"); // the first role is chosen already
    await page.getByTestId("start-button").tap();
    await expect(page.getByTestId("dialogue-done")).toBeVisible({ timeout: 180_000 });
    const majid = majidFatimaDialogue.lines.filter((l) => l.speaker === "majid");
    const fatima = majidFatimaDialogue.lines.filter((l) => l.speaker === "fatima");
    expect(calls.uploads).toEqual(majid.map((l) => l.exercise.target));
    expect(heard(fatima)).toEqual(fatima.map(() => true));
    // One role is not the whole exercise: Majid is green, Fatima is next.
    expect((await progress(page))["a1/lesson-1/tahiyya-wa-taqdim/step-4"]?.completedAt).toBeFalsy();
    await page.getByTestId("dialogue-next-role").tap();
    await expect(page.getByTestId("role-done-majid")).toBeVisible();
    await expect(page.getByTestId("role-fatima")).toHaveAttribute("aria-pressed", "true");
    await page.getByTestId("start-button").tap();
    await expect(page.getByTestId("dialogue-done")).toBeVisible({ timeout: 180_000 });
    expect(calls.uploads.slice(majid.length)).toEqual(fatima.map((l) => l.exercise.target));
    expect((await progress(page))["a1/lesson-1/tahiyya-wa-taqdim/step-4"]?.completedAt).toBeTruthy();
    expect(await noHorizontalScroll(page)).toBe(true);
    expect(errors).toEqual([]);
  });

  test("Übung 2 and 3: tap letters in the real text; a wrong one is named and removed; done when all are found", async ({ page }) => {
    test.setTimeout(120_000);
    const errors = collectPageErrors(page);
    await page.goto(`${BASE}/step-5`);
    await expect(page.getByTestId("find-goal")).toContainText("Finde alle 14");
    // The words stay whole strings (one text node each); the letter buttons are laid over the glyphs.
    await expect(page.locator('[data-testid^="find-tile-"]').first()).not.toHaveClass(/sr-only/);
    expect(await page.locator('[data-testid^="find-word-"] > span > span:first-child').evaluateAll((els) => els.every((e) => e.childNodes.length === 1 && e.firstChild!.nodeType === 3))).toBe(true);
    const tiles = page.locator('[data-testid^="find-tile-"]');
    const alifs = page.locator('[data-testid^="find-tile-"][data-target="true"]');
    await expect(alifs).toHaveCount(14);

    const wrong = tiles.and(page.locator('[data-target="false"]')).first();
    await tapLetter(page, wrong);
    await tapLetter(page, alifs.first());
    await page.getByTestId("find-check").tap();
    await expect(page.getByTestId("find-feedback")).toContainText("1 von 14 richtig. Es fehlen noch 13.");
    await expect(page.getByTestId("find-wrong")).toContainText("ist kein");
    await expect(wrong).toHaveAttribute("data-tone", "wrong");
    await tapLetter(page, wrong); // removed again
    await expect(wrong).toHaveAttribute("aria-pressed", "false");
    for (let i = 1; i < 14; i++) await tapLetter(page, alifs.nth(i));
    await page.getByTestId("find-check").tap();
    await expect(page.getByTestId("find-done")).toBeVisible();
    expect(await noHorizontalScroll(page)).toBe(true);

    await page.getByTestId("step-next").tap();
    await expect(page).toHaveURL(new RegExp(`${BASE}/step-6$`));
    const bas = page.locator('[data-testid^="find-tile-"][data-target="true"]');
    await expect(bas).toHaveCount(4);
    for (let i = 0; i < 4; i++) await tapLetter(page, bas.nth(i));
    await page.getByTestId("find-check").tap();
    await expect(page.getByTestId("find-done")).toBeVisible();
    // The last entry of the lesson: back to the contents.
    await expect(page.getByTestId("back-to-unit-end")).toBeVisible();
    const p = await progress(page);
    for (const n of [5, 6]) expect(p[`a1/lesson-1/tahiyya-wa-taqdim/step-${n}`]?.completedAt, `step-${n}`).toBeTruthy();
    expect(errors).toEqual([]);
  });
});

test.describe("desktop", () => {
  test.use({ viewport: { width: 1366, height: 900 } });

  test("the greeting as two columns of cards; the Majid / Fatima conversation as chat bubbles", async ({ page }) => {
    await page.goto(`${BASE}/step-1`);
    const m = (await page.getByTestId("phrase-p-kayfa-haluka").boundingBox())!;
    const f = (await page.getByTestId("phrase-p-kayfa-haluki").boundingBox())!;
    expect(Math.round(m.y)).toBe(Math.round(f.y));
    await page.goto(`${BASE}/step-3`);
    await expect(page.getByTestId("dialogue-lines").locator('[data-testid^="dialogue-line-"]')).toHaveCount(9);
    expect((await page.request.get("/images/a1/sabah-al-khayr/majid.svg")).status()).toBe(200);
    expect(await noHorizontalScroll(page)).toBe(true);
  });
});
