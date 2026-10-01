import { expect, test } from "@playwright/test";

import { recordExercise } from "./support/helpers";

// Full production chain against a real deployment:
//   ALIF_E2E_LIVE_URL=https://alif.example.com \
//   ALIF_E2E_FAKE_AUDIO=/path/to/alif-letter.wav \   (a recording of "أَلِف")
//   npx playwright test live
// Set ALIF_E2E_EXPECT_PASS=1 if the recording should be rated "excellent".
const liveUrl = process.env.ALIF_E2E_LIVE_URL;

test.skip(!liveUrl, "set ALIF_E2E_LIVE_URL to run against a deployment with real services");
test.use({ baseURL: liveUrl });

test("live: microphone → Alif API → Azure + MASAAR + IQRA → conditions → feedback", async ({ page }) => {
  await page.goto("/a0/lesson-1");
  const apiCall = page.waitForResponse((r) => r.url().endsWith("/api/pronunciation") && r.request().method() === "POST", { timeout: 60_000 });
  await recordExercise(page, "letter", 2500);
  const response = await apiCall;
  expect(response.status()).toBe(200);

  const body = await response.json();
  expect(body.details.azure.accuracy).toEqual(expect.any(Number));
  expect(body.details.masaar, "MASAAR returned no result").toBeTruthy();
  expect(body.details.iqra?.phonemes?.length, "IQRA returned no phonemes").toBeGreaterThan(0);
  await expect(page.getByTestId("exercise-letter-feedback-message")).toHaveText(body.conditionEvaluation.message.trim());
  if (process.env.ALIF_E2E_EXPECT_PASS === "1") expect(body.conditionEvaluation.matchedRule).toBe("excellent");
});
