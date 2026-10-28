import { expect, test } from "@playwright/test";

import { collectPageErrors } from "./support/helpers";

// The learner's language: asked first on the first visit (before the programme), then the
// lesson in that language; switchable in the header.

test.use({ storageState: { cookies: [], origins: [] }, viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

test("first visit: the language first, then the programme – both in the chosen language; Lektion 1 in Turkish", async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.goto("/a1/lesson-1/tahiyya-wa-taqdim/step-1");
  const language = page.getByTestId("language-dialog");
  await expect(language).toBeVisible();
  await expect(page.getByTestId("track-dialog")).toBeHidden();
  await page.keyboard.press("Escape");
  await expect(language).toBeVisible();
  await page.getByTestId("language-option-tr").tap();
  await expect(language).toBeHidden();
  await expect(page.getByTestId("track-dialog")).toContainText("Alif'e hoş geldin! Programını seç");
  await page.getByTestId("track-option-pronunciation").tap();

  await expect(page.getByTestId("step-position")).toHaveText("Adım 1 / 6");
  await expect(page.getByTestId("step-instruction-german")).toContainText("Her ifadeyi dinle ve tekrar et.");
  await expect(page.getByTestId("phrase-tag-p-kayfa-haluka")).toContainText("bir erkeğe");
  expect(await page.evaluate(() => [document.documentElement.lang, localStorage.getItem("alif:lang")])).toEqual(["tr", "tr"]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

  // The header switch: French.
  await page.getByTestId("language-switch").first().tap();
  await page.getByTestId("language-option-fr").tap();
  await expect(page.getByTestId("step-position")).toHaveText("Étape 1 sur 6");
  await page.reload();
  await expect(page.getByTestId("language-dialog")).toBeHidden();
  await expect(page.getByTestId("step-position")).toHaveText("Étape 1 sur 6");
  expect(errors).toEqual([]);
});
