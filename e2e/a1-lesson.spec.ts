import { expect, test } from "@playwright/test";

import { a1Unit1, getA1Lesson } from "../src/data/a1";
import type { A1Lesson } from "../src/data/types";
import { collectPageErrors, recordExercise } from "./support/helpers";
import { answerGaps, mockServices, noHorizontalScroll } from "./support/letters";

// A1 · Lektion 1 as ONE lesson: /a1 → its contents (أ ب ت ث ج ح خ, مراجعة,
// صَبَاحُ الْخَيْر) → every entry; the review and the phrase played through;
// the image-first word cards on a phone and on a desktop. TTS and the
// pronunciation evaluation are MOCKED.

const gapsSteps = (lesson: A1Lesson) => lesson.steps.filter((s): s is Extract<A1Lesson["steps"][number], { kind: "gaps" }> => s.kind === "gaps");

test.describe("phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("the contents list the nine entries in book order; each opens its first step and leads back", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto("/a1");
    await expect(page.locator('a[data-testid^="a1-lesson-"]')).toHaveCount(1);
    expect(await noHorizontalScroll(page)).toBe(true);
    await page.getByTestId("a1-lesson-lesson-1").tap();
    await expect(page).toHaveURL(/\/a1\/lesson-1$/);
    expect(await noHorizontalScroll(page)).toBe(true);
    const labels = await page.locator('[data-testid^="unit-entry-"][data-testid$="-label"]').allTextContents();
    expect(labels).toEqual(["أ", "ب", "ت", "ث", "ج", "ح", "خ", "مُرَاجَعَة", "صَبَاحُ الْخَيْر"]);
    for (const lesson of a1Unit1.lessons) {
      await page.getByTestId(`unit-entry-${lesson.slug}`).tap();
      await expect(page).toHaveURL(new RegExp(`/a1/lesson-1/${lesson.slug}/step-1$`));
      await expect(page.getByTestId("entry-title")).toContainText(lesson.labelGerman);
      await expect(page.getByTestId("step-position")).toHaveText(`Schritt 1 von ${lesson.steps.length}`);
      expect(await noHorizontalScroll(page), lesson.slug).toBe(true);
      await page.getByTestId("back-to-unit").tap();
      await expect(page).toHaveURL(/\/a1\/lesson-1$/);
    }
    expect(errors).toEqual([]);
  });

  test("مراجعة: Ergänzen (pictures) and Hören over all seven letters, each item with its own four tiles → Geschafft", async ({ page }) => {
    test.setTimeout(180_000);
    const errors = collectPageErrors(page);
    const calls = await mockServices(page);
    const review = getA1Lesson("lesson-1", "review")!;
    const [fill, listen] = gapsSteps(review);
    await page.goto("/a1/lesson-1/review/step-1");
    await page.getByTestId("start-button").tap();
    await expect(page.getByTestId("gap-image")).toBeVisible();
    await expect(page.locator("[data-choice]")).toHaveText(fill!.gaps.items[0]!.choices!);
    await answerGaps(page, fill!.gaps.items);
    await page.getByTestId("step-next").tap();
    await page.getByTestId("start-button").tap();
    await expect.poll(() => calls.tts).toContain(listen!.gaps.items[0]!.arabic);
    await answerGaps(page, listen!.gaps.items);
    await expect(page.getByTestId("next-entry")).toHaveAttribute("href", "/a1/lesson-1/sabah-al-khayr");
    expect(errors).toEqual([]);
  });

  test("صَبَاحُ الْخَيْر: say the phrase (evaluated), then find ب ح خ in it → Geschafft", async ({ page }) => {
    test.setTimeout(120_000);
    const errors = collectPageErrors(page);
    const calls = await mockServices(page);
    await page.goto("/a1/lesson-1/sabah-al-khayr/step-1");
    const card = page.getByTestId("vocab-card-sabah-al-khayr");
    const img = card.getByTestId("vocab-image-sabah-al-khayr");
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    await card.getByTestId("exercise-sabah-al-khayr-listen").tap();
    await expect.poll(() => calls.tts).toContain("صَبَاحُ الْخَيْر");
    await recordExercise(page, "sabah-al-khayr", 900);
    await expect(page.getByTestId("exercise-sabah-al-khayr-feedback-headline")).toHaveText("مُمْتَاز! 👏");
    expect(calls.uploads).toEqual(["صباح الخير"]);
    await expect(page.getByTestId("phrases-step")).toHaveAttribute("data-done", "true");
    expect(await noHorizontalScroll(page)).toBe(true);
    await page.getByTestId("step-next").tap();
    await page.getByTestId("start-button").tap();
    const [find] = gapsSteps(getA1Lesson("lesson-1", "sabah-al-khayr")!);
    await expect(page.getByTestId("gap-piece")).toHaveText(["صَـ", "ـاحُ الْخَيْر"]);
    await answerGaps(page, find!.gaps.items);
    await expect(page.getByTestId("back-to-unit-end")).toBeVisible();
    await expect(page.getByTestId("next-entry")).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test("word cards: the picture first and large (not cropped, not distorted), then Arabic, German, transliteration, controls", async ({ page }) => {
    await page.goto("/a1/lesson-1/kha/step-1");
    for (const id of ["khas", "khatam", "khubz"]) {
      const card = page.getByTestId(`vocab-card-${id}`);
      await card.scrollIntoViewIfNeeded();
      const img = card.getByTestId(`vocab-image-${id}`);
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
      const box = (await img.boundingBox())!;
      const arabic = (await card.getByTestId(`vocab-arabic-${id}`).boundingBox())!;
      expect(box.width).toBeGreaterThan(300);
      expect(box.y + box.height).toBeLessThanOrEqual(arabic.y + 1);
      expect(await img.evaluate((el: HTMLImageElement) => getComputedStyle(el).objectFit)).toBe("contain");
      // The 4:3 frame matches the 4:3 pictures: nothing is cut off or stretched.
      expect(Math.abs(box.width / box.height - 4 / 3)).toBeLessThan(0.02);
    }
    expect(await noHorizontalScroll(page)).toBe(true);
  });
});

test.describe("desktop", () => {
  test.use({ viewport: { width: 1366, height: 900 } });

  test("contents as a list (one full-width row per entry, in book order); word cards in rows of three with large pictures above the words", async ({ page }) => {
    await page.goto("/a1/lesson-1");
    const first = (await page.getByTestId("unit-entry-alif").boundingBox())!;
    const second = (await page.getByTestId("unit-entry-ba").boundingBox())!;
    expect(second.y).toBeGreaterThan(first.y + first.height - 1); // ب below أ
    expect(Math.round(first.x)).toBe(Math.round(second.x));
    expect(first.width).toBeGreaterThan(600);
    await page.goto("/a1/lesson-1/tha/step-1");
    const ids = ["thawb", "thawm", "thalatha"];
    const boxes = await Promise.all(ids.map((id) => page.getByTestId(`vocab-image-${id}`).boundingBox()));
    expect(new Set(boxes.map((b) => Math.round(b!.y))).size).toBe(1);
    for (const b of boxes) expect(b!.width).toBeGreaterThan(220);
    expect(await noHorizontalScroll(page)).toBe(true);
  });
});
