import { expect, test, type Page } from "@playwright/test";

import { collectPageErrors, recordExercise } from "./support/helpers";
import { chosenLanguage } from "./support/track";

// ALIF Speaking (Beginner) / ALIF Pronunciation (Advanced): the choice on the
// first visit, the switch in the header and what the evaluation is told.

test.use({ storageState: chosenLanguage("http://127.0.0.1:3210", "http://127.0.0.1:3211") }); // a first visit (the language is asked before, see language.spec.ts)

const SHOTS = process.env.ALIF_E2E_SHOTS;
const shot = async (page: Page, name: string) => {
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/${name}.png` });
};
const dialog = (page: Page) => page.getByTestId("track-dialog");

test.describe("phone 390", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("first visit: the choice opens by itself and stays until one is chosen; then it is remembered", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto("/");
    await expect(dialog(page)).toBeVisible();
    await expect(dialog(page)).toContainText("ALIF Speaking – Beginner");
    await expect(dialog(page)).toContainText("ALIF Pronunciation – Advanced");
    await expect(page.getByTestId("track-close")).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await shot(page, "track-1-first-visit");
    await page.keyboard.press("Escape");
    await expect(dialog(page)).toBeVisible();

    await page.getByTestId("track-option-speaking").tap();
    await expect(dialog(page)).toBeHidden();
    expect(await page.evaluate(() => localStorage.getItem("alif:track"))).toBe("speaking");
    await page.reload();
    await page.waitForTimeout(300);
    await expect(dialog(page)).toBeHidden();
    await page.getByTestId("mobile-menu").locator("summary").tap();
    await expect(page.getByTestId("mobile-menu").getByTestId("track-switch")).toContainText("Beginner");
    expect(errors).toEqual([]);
  });

  test("a direct link to a lesson asks too; the header switch changes the programme and the evaluation", async ({ page }) => {
    const sent: string[] = [];
    await page.route("**/api/pronunciation", async (route) => {
      sent.push(/name="track"\r\n\r\n(\w+)/.exec(route.request().postDataBuffer()?.toString("latin1") ?? "")?.[1] ?? "");
      await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ code: "service_not_configured" }) });
    });
    await page.goto("/a0/letters");
    await expect(dialog(page)).toBeVisible();
    await page.getByTestId("track-option-pronunciation").tap();
    const chip = page.getByTestId("track-switch");
    await expect(chip).toContainText("Advanced");

    await chip.tap();
    await expect(dialog(page)).toBeVisible();
    await expect(page.getByTestId("track-option-pronunciation")).toHaveAttribute("aria-pressed", "true");
    await shot(page, "track-2-switch");
    await page.getByTestId("track-option-speaking").tap();
    await expect(chip).toContainText("Beginner");
    await shot(page, "track-3-header");

    // The evaluation is told the programme.
    await page.goto("/a0/words/lesson-1");
    await recordExercise(page, "letter", 1500);
    await expect.poll(() => sent).toEqual(["speaking"]);
  });
});
