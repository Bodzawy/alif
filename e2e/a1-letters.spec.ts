import { expect, test, type Page } from "@playwright/test";

import { getA1Lesson } from "../src/data/a1";
import type { A1Lesson } from "../src/data/types";
import { hasHand, splitTiles } from "../src/lib/arabic/letter-form";
import { collectPageErrors, openButtonMode, recordExercise, refuseGuidedMicrophone } from "./support/helpers";
import { answerGaps, boardPoints, mockServices, noHorizontalScroll, scrollY, touchStroke } from "./support/letters";

// A1 · Lektion 1 · ت ث ج ح خ on a phone (390 px), from the lesson data only:
// the lesson's contents → the letter → Wörter (pictures load; the three sounds
// spoken and evaluated on the button page) → Formen (all four parts) →
// Schreiben (EVERY form traced stroke by stroke, dots tapped, with the real
// evaluation in the browser) → Ergänzen → Hören → back to the lesson. TTS and
// the pronunciation evaluation are MOCKED. The full guided Wörter run is
// covered for ب (e2e/a1-ba.spec.ts).

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

const stepOf = <K extends A1Lesson["steps"][number]["kind"]>(lesson: A1Lesson, kind: K) =>
  lesson.steps.find((s) => s.kind === kind) as Extract<A1Lesson["steps"][number], { kind: K }>;

async function formen(page: Page, lesson: A1Lesson) {
  const { forms } = stepOf(lesson, "forms");
  await page.getByTestId("start-button").tap();
  const next = page.getByTestId("explain-next");
  for (let i = 0; i < 5 && !/Weiter zur Übung/.test(await next.innerText()); i++) {
    expect(await noHorizontalScroll(page), `Zuschauen ${i}`).toBe(true);
    await next.tap();
  }
  await next.tap();

  // Baue das Wort: the tiles of every book word (identical tiles: any of them fits).
  for (const word of forms.build) {
    expect(await noHorizontalScroll(page), `build ${word.id}`).toBe(true);
    for (const [i, tile] of splitTiles(word.arabic).entries()) {
      await page.getByTestId(`tile-${tile}`).first().tap();
      await page.getByTestId(`slot-${i}`).tap();
    }
    await expect(page.getByTestId(`build-word-${word.id}`)).toHaveAttribute("data-phase", "done");
    expect(await noHorizontalScroll(page), `built ${word.id}`).toBe(true);
    await page.getByTestId("build-next").tap();
  }

  // Wer hält fest? – both sides, with and without a Hand.
  await expect(page.getByTestId("neighbors-activity")).toHaveAttribute("data-variant", "letter");
  const withHand = forms.neighbors.find(hasHand)!;
  const without = forms.neighbors.find((n) => !hasHand(n))!;
  const drop = async (letter: string, side: "left" | "right") => {
    await page.getByTestId(`neighbor-${letter}`).tap();
    await page.getByTestId(`zone-${side}`).tap();
  };
  await drop(without, "left");
  await expect(page.getByTestId("pair")).toHaveAttribute("data-holds-next", "true");
  await drop(withHand, "right");
  await expect(page.getByTestId("pair")).toHaveAttribute("data-held", "true");
  await drop(without, "right");
  await expect(page.getByTestId("pair")).toHaveAttribute("data-held", "false");
  await drop(withHand, "left");
  await expect(page.getByTestId("rule-card")).toContainText(`Das ${lesson.letter!.name} hat eine Hand.`);
  expect(await noHorizontalScroll(page)).toBe(true);
  await page.getByTestId("neighbors-next").tap();

  // Wo steht das …? – every word into its basket.
  for (let i = 0; i < forms.sort.length; i++) {
    const word = page.getByTestId("sort-word");
    await expect(word).toHaveAttribute("data-phase", "ask");
    expect(await noHorizontalScroll(page), `sort ${await word.getAttribute("data-word")}`).toBe(true);
    await page.getByTestId(`basket-${await word.getAttribute("data-expected")}`).tap();
    await expect(page.getByTestId("sort-shaped")).toBeVisible();
    expect(await noHorizontalScroll(page)).toBe(true);
    if (i < forms.sort.length - 1) await expect(word).toHaveAttribute("data-phase", "ask", { timeout: 5000 });
  }
  await expect(page.getByTestId("sort-done")).toContainText(`Du erkennst die vier Formen vom ${lesson.letter!.name}.`);
}

async function schreiben(page: Page, lesson: A1Lesson) {
  const { letterSet } = stepOf(lesson, "writing");
  await expect(page.getByTestId("writing-step")).toHaveAttribute("data-ready", "true");
  await page.getByTestId("writing-board").scrollIntoViewIfNeeded();
  for (const form of letterSet.forms) {
    await expect(page.getByTestId("writing-step")).toHaveAttribute("data-current", form.id, { timeout: 5000 });
    await page.waitForTimeout(400);
    const scrolled = await scrollY(page);
    for (const [s, stroke] of form.strokes.entries()) {
      if (s > 0) await expect(page.getByTestId("writing-instruction"), `${form.id} ${s}`).toContainText(`Jetzt ${stroke.label}.`);
      if (stroke.dot) {
        const center = (await boardPoints(page, stroke.d, 8))[0]!;
        await touchStroke(page, [{ x: center.x - 3, y: center.y + 2 }]);
      } else {
        await touchStroke(page, await boardPoints(page, stroke.d));
      }
      expect(await scrollY(page)).toBe(scrolled);
    }
    await expect(page.getByTestId(`gray-${form.id}`), form.id).toHaveAttribute("data-done", "traced");
  }
  await expect(page.getByTestId("writing-done")).toBeVisible({ timeout: 5000 });
  expect(await noHorizontalScroll(page)).toBe(true);
}

for (const slug of ["ta", "tha", "jim", "hha", "kha"]) {
  test(`${slug}: Lektion 1 → the letter → Wörter → Formen → Schreiben (every form) → Ergänzen → Hören → Zur Lektion 1`, async ({ page }) => {
    test.setTimeout(300_000);
    const lesson = getA1Lesson("lesson-1", slug)!;
    const errors = collectPageErrors(page);
    const calls = await mockServices(page);
    await refuseGuidedMicrophone(page);

    await page.goto("/a1/lesson-1");
    const entry = page.getByTestId(`unit-entry-${slug}`);
    await expect(entry.getByTestId(`unit-entry-${slug}-label`)).toHaveText(lesson.letter!.glyph);
    await expect(entry).toContainText(lesson.letter!.name);
    await entry.tap();

    // Schritt 1 – Wörter: nine picture cards (every picture loads), each row starting with its sound.
    await expect(page).toHaveURL(new RegExp(`/a1/lesson-1/${slug}/step-1$`));
    await expect(page.getByTestId("step-position")).toHaveText("Schritt 1 von 5");
    const { groups } = stepOf(lesson, "sound-words");
    for (const word of groups.flatMap((g) => g.words)) {
      const img = page.getByTestId(`vocab-image-${word.id}`);
      await expect(img).toHaveAttribute("src", word.image!.src);
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0), { message: word.image!.src }).toBe(true);
    }
    expect(await noHorizontalScroll(page)).toBe(true);
    // The sounds (the former Laute): spoken and evaluated with the letter's own rules (button page).
    await openButtonMode(page);
    for (const { sound } of groups) {
      await recordExercise(page, sound.id, 800);
      await expect(page.getByTestId(`exercise-${sound.id}-feedback-headline`)).toHaveText("مُمْتَاز! 👏");
    }
    expect(calls.uploads).toEqual(groups.map((g) => g.sound.glyph));
    await page.getByTestId("step-next").tap();

    // Schritt 2 – Formen.
    await expect(page).toHaveURL(new RegExp(`/a1/lesson-1/${slug}/step-2$`));
    await expect(page.getByTestId("step-position")).toHaveText("Schritt 2 von 5");
    await formen(page, lesson);
    await page.getByTestId("step-next").tap();

    // Schritt 3 – Schreiben.
    await expect(page).toHaveURL(new RegExp(`/a1/lesson-1/${slug}/step-3$`));
    await expect(page.getByTestId("step-position")).toHaveText("Schritt 3 von 5");
    await schreiben(page, lesson);
    await page.getByTestId("step-next").tap();

    // Schritt 4 – Ergänzen, 5 – Hören.
    const [fill, listen] = lesson.steps.filter((s) => s.kind === "gaps") as Array<Extract<A1Lesson["steps"][number], { kind: "gaps" }>>;
    await expect(page).toHaveURL(new RegExp(`/a1/lesson-1/${slug}/step-4$`));
    await page.getByTestId("start-button").tap();
    await answerGaps(page, fill!.gaps.items);
    await page.getByTestId("step-next").tap();
    await expect(page).toHaveURL(new RegExp(`/a1/lesson-1/${slug}/step-5$`));
    await page.getByTestId("start-button").tap();
    await answerGaps(page, listen!.gaps.items);

    await page.getByTestId("back-to-unit-end").tap();
    await expect(page).toHaveURL(/\/a1\/lesson-1$/);
    const progress = await page.evaluate(() => JSON.parse(localStorage.getItem("alif:progress:v1") ?? "{}"));
    for (const step of ["step-2", "step-3", "step-4", "step-5"]) expect(progress[`a1/lesson-1/${slug}/${step}`]?.completedAt, step).toBeTruthy();
    expect(errors).toEqual([]);
  });
}
