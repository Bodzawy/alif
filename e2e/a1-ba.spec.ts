import { expect, test } from "@playwright/test";

import { getA1Lesson } from "../src/data/a1";
import { baWriting } from "../src/data/letters/ba";
import { collectPageErrors } from "./support/helpers";
import { answerGaps, boardPoints, mockServices, noHorizontalScroll, scrollY, syntheticVoice, touchDrag, touchStroke } from "./support/letters";

// A1 · Lektion 1 · Ba on a phone (390 px): /a1 → the lesson's contents → ب,
// then the five steps Wörter (guided, fake media) → Formen → Schreiben (a form
// with its dot) → Ergänzen (the double gap _ا_) → Hören (the medial gap نَ_ق)
// → back to the lesson. Text-to-speech and the pronunciation evaluation are
// MOCKED (answers from Alif's real rules with simulated IQRA input) – the real
// services are never called.

test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test("Ba: /a1 → Lektion 1 → ب → Wörter (guided) → Formen → Schreiben with a dot → Ergänzen → Hören → Zur Lektion 1", async ({ page }) => {
  test.setTimeout(300_000);
  const errors = collectPageErrors(page);
  await syntheticVoice(page);
  const calls = await mockServices(page);

  // /a1: one lesson; its contents: ب after أ.
  await page.goto("/a1");
  await page.getByTestId("a1-lesson-lesson-1").tap();
  await expect(page).toHaveURL(/\/a1\/lesson-1$/);
  const entry = page.getByTestId("unit-entry-ba");
  await expect(entry).toContainText("ب");
  await expect(entry).toContainText("Ba");
  await expect(entry).toContainText("5 Schritte");
  expect(await noHorizontalScroll(page)).toBe(true);
  await entry.tap();
  await expect(page).toHaveURL(/\/a1\/lesson-1\/ba\/step-1$/);
  await expect(page.getByTestId("step-position")).toHaveText("Schritt 1 von 5");

  // Schritt 1 – Wörter, guided: every row starts with its sound (the former Laute); picture cards; runs by itself.
  const picture = page.getByTestId("vocab-image-banat");
  await expect(picture).toHaveAttribute("src", "/images/a1/ba/banat.svg");
  await expect.poll(() => picture.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await page.getByTestId("start-button").tap();
  await expect(page.getByTestId("guided-done")).toBeVisible({ timeout: 120_000 });
  expect(calls.uploads).toEqual(["بَ", "بنات", "بيت", "باب", "بِ", "بنت", "بئر", "بطاقة", "بُ", "بندقية", "برتقال", "برج"]);
  expect(await noHorizontalScroll(page)).toBe(true);
  await page.getByTestId("step-next").tap();

  // Schritt 2 – Formen.
  await expect(page).toHaveURL(/\/a1\/lesson-1\/ba\/step-2$/);
  await expect(page.getByTestId("step-position")).toHaveText("Schritt 2 von 5");
  await page.getByTestId("start-button").tap();
  const next = page.getByTestId("explain-next");
  for (let i = 0; i < 5 && !/Weiter zur Übung/.test(await next.innerText()); i++) await next.tap();
  await next.tap();

  // Baue das Wort – the first tile by a finger drag (the page must not scroll), the rest by taps.
  const words = [["bitaqa", ["بِ", "طَ", "ا", "قَ", "ة"]], ["shubbak", ["شِ", "بَّ", "ا", "ك"]], ["kalb", ["كَ", "لْ", "ب"]], ["kitab", ["كِ", "تَ", "ا", "ب"]]] as const;
  for (const [w, [id, tiles]] of words.entries()) {
    for (const [i, tile] of tiles.entries()) {
      if (w === 0 && i === 0) {
        const before = await scrollY(page);
        await touchDrag(page, page.getByTestId(`tile-${tile}`), page.getByTestId("slot-0"));
        expect(await scrollY(page)).toBe(before);
      } else {
        await page.getByTestId(`tile-${tile}`).tap();
        await page.getByTestId(`slot-${i}`).tap();
      }
    }
    await expect(page.getByTestId(`build-word-${id}`)).toHaveAttribute("data-phase", "done");
    await page.getByTestId("build-next").tap();
  }

  // Wer hält fest? – right: only with a Hand; left: always held.
  await expect(page.getByTestId("neighbors-activity")).toHaveAttribute("data-variant", "letter");
  expect(await noHorizontalScroll(page)).toBe(true);
  const drop = async (letter: string, side: "left" | "right") => {
    await page.getByTestId(`neighbor-${letter}`).tap();
    await page.getByTestId(`zone-${side}`).tap();
  };
  await drop("ا", "left");
  await expect(page.getByTestId("pair")).toHaveAttribute("data-holds-next", "true");
  await drop("ط", "right");
  await expect(page.getByTestId("pair")).toHaveAttribute("data-held", "true");
  await drop("ا", "right");
  await expect(page.getByTestId("pair")).toHaveAttribute("data-held", "false");
  const before = await scrollY(page);
  await touchDrag(page, page.getByTestId("neighbor-ك"), page.getByTestId("zone-left"));
  expect(await scrollY(page)).toBe(before);
  await expect(page.getByTestId("rule-card")).toContainText("Das Ba hat eine Hand.");
  await page.getByTestId("neighbors-next").tap();

  // Wo steht das Ba? – four baskets; the word stays tiles until answered.
  for (let i = 0; i < 5; i++) {
    const word = page.getByTestId("sort-word");
    await expect(word).toHaveAttribute("data-phase", "ask");
    await expect(page.getByTestId("sort-shaped")).toHaveCount(0);
    const expected = await word.getAttribute("data-expected");
    await page.getByTestId(`basket-${expected}`).tap();
    await expect(page.getByTestId("sort-shaped")).toBeVisible();
    if (i < 4) await expect(word).toHaveAttribute("data-phase", "ask", { timeout: 5000 });
  }
  await expect(page.getByTestId("sort-done")).toBeVisible();
  await expect(page.getByTestId("step-completed")).toBeVisible();
  expect(await noHorizontalScroll(page)).toBe(true);
  await page.getByTestId("step-next").tap();

  // Schritt 3 – Schreiben: بـ traced with a finger, then its dot tapped.
  await expect(page).toHaveURL(/\/a1\/lesson-1\/ba\/step-3$/);
  await expect(page.getByTestId("step-position")).toHaveText("Schritt 3 von 5");
  await expect(page.getByTestId("writing-step")).toHaveAttribute("data-ready", "true");
  await expect(page.getByTestId("writing-step")).toHaveAttribute("data-current", "ba-start");
  await page.getByTestId("writing-board").scrollIntoViewIfNeeded();
  const [body, dot] = baWriting.forms[0]!.strokes;
  const scrolled = await scrollY(page);
  await touchStroke(page, await boardPoints(page, body!.d));
  expect(await scrollY(page)).toBe(scrolled);
  await expect(page.getByTestId("writing-instruction")).toHaveText("Gut! Jetzt den Punkt unten. Tippe auf den grünen Punkt ٢.");
  const center = (await boardPoints(page, dot!.d, 8))[0]!;
  await touchStroke(page, [{ x: center.x - 4, y: center.y }]);
  expect(await scrollY(page)).toBe(scrolled);
  await expect(page.getByTestId("gray-ba-start")).toHaveAttribute("data-done", "traced");
  for (let i = 0; i < 3; i++) {
    await expect(page.getByTestId("writing-skip")).toBeEnabled();
    await page.waitForTimeout(1300); // the praise toast of the traced form
    await page.getByTestId("writing-skip").tap();
  }
  await expect(page.getByTestId("writing-done")).toBeVisible();
  expect(await noHorizontalScroll(page)).toBe(true);

  await page.getByTestId("step-next").tap();

  // Schritt 4 – Ergänzen (pictures): every word; the double gap _ا_ → بَابْ is filled right to left.
  const ba = getA1Lesson("lesson-1", "ba")!;
  const [fill, listen] = ba.steps.filter((s) => s.kind === "gaps") as Array<Extract<(typeof ba.steps)[number], { kind: "gaps" }>>;
  await expect(page).toHaveURL(/\/a1\/lesson-1\/ba\/step-4$/);
  await page.getByTestId("start-button").tap();
  await expect(page.getByTestId("gap-image")).toBeVisible();
  await answerGaps(page, fill!.gaps.items);
  await page.getByTestId("step-next").tap();

  // Schritt 5 – Hören: the word plays first (/api/tts until it is recorded); the medial gap نَ_ق.
  await expect(page).toHaveURL(/\/a1\/lesson-1\/ba\/step-5$/);
  await page.getByTestId("start-button").tap();
  await expect.poll(() => calls.tts).toContain(listen!.gaps.items[0]!.arabic);
  await expect(page.getByTestId("gap-image")).toHaveCount(0);
  await answerGaps(page, listen!.gaps.items);
  expect(calls.tts).toContain("بَابْ");

  // The last step leads back to the lesson, or on to ت.
  await expect(page.getByTestId("next-entry")).toHaveAttribute("href", "/a1/lesson-1/ta");
  await page.getByTestId("back-to-unit-end").tap();
  await expect(page).toHaveURL(/\/a1\/lesson-1$/);

  const progress = await page.evaluate(() => JSON.parse(localStorage.getItem("alif:progress:v1") ?? "{}"));
  for (const key of [1, 2, 3, 4, 5].map((n) => `a1/lesson-1/ba/step-${n}`)) expect(progress[key]?.completedAt, key).toBeTruthy();
  expect(errors).toEqual([]);
});

test("Ba Schreiben: tapping the dot first asks for the order; a long stroke on the dot is not a dot", async ({ page }) => {
  await page.goto("/a1/lesson-1/ba/step-3");
  await expect(page.getByTestId("writing-step")).toHaveAttribute("data-ready", "true");
  await page.getByTestId("writing-board").scrollIntoViewIfNeeded();
  const [body, dot] = baWriting.forms[0]!.strokes;
  const center = (await boardPoints(page, dot!.d, 8))[0]!;
  await touchStroke(page, [center]);
  await expect(page.getByTestId("writing-instruction")).toHaveText("Zuerst das Ba, dann den Punkt.");
  await page.waitForTimeout(1400);
  await touchStroke(page, await boardPoints(page, body!.d));
  await expect(page.getByTestId("writing-instruction")).toHaveText(/Jetzt den Punkt unten/);
  const r = (await page.getByTestId("writing-board").boundingBox())!;
  await touchStroke(page, Array.from({ length: 12 }, (_, i) => ({ x: center.x - i * (r.width / 24), y: center.y })));
  await expect(page.getByTestId("writing-instruction")).toHaveText("Tippe nur kurz auf den Punkt.");
});
