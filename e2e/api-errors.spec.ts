import { expect, test } from "@playwright/test";

import { recordExercise } from "./support/helpers";

// Real browser → real Alif API, on a server WITHOUT service configuration.
// Verifies that failures reach the student as clear German messages.

test("pronunciation: unconfigured services → clear message, retry possible", async ({ page }) => {
  await page.goto("/a1/lesson-1");
  const apiCall = page.waitForResponse((r) => r.url().endsWith("/api/pronunciation") && r.request().method() === "POST");
  await recordExercise(page, "letter");
  const response = await apiCall;
  expect(response.status()).toBe(503);
  expect(await response.json()).toMatchObject({ code: "service_not_configured" });

  const alert = page.getByTestId("exercise-letter-error");
  await expect(alert).toHaveText(/Aussprache-Bewertung ist gerade nicht verfügbar/);
  await expect(alert).not.toHaveText(/^Error$/);
  await expect(page.getByTestId("exercise-letter-record")).toHaveText(/Nochmal/);
  await expect(page.getByTestId("exercise-letter-record")).toBeEnabled();
});

test("A0 letter: real API unavailable → clear message, Weiter stays locked, Überspringen offered", async ({ page }) => {
  await page.goto("/a0/letters/alif");
  const apiCall = page.waitForResponse((r) => r.url().endsWith("/api/pronunciation") && r.request().method() === "POST");
  await recordExercise(page, "alif");
  expect((await apiCall).status()).toBe(503);
  await expect(page.getByTestId("exercise-alif-error")).toHaveText(/Aussprache-Bewertung ist gerade nicht verfügbar/);
  await expect(page.getByTestId("letter-next")).toBeDisabled();
  await expect(page.getByTestId("letter-skip")).toBeEnabled();
});

test("listen: unconfigured TTS → clear message", async ({ page }) => {
  await page.goto("/a1/lesson-1");
  await page.getByTestId("exercise-asad-listen").click();
  await expect(page.getByTestId("vocab-card-asad")).toContainText("Die Aussprache konnte gerade nicht geladen werden");
});

test("microphone denied → explained in German", async ({ browser }) => {
  const context = await browser.newContext({ permissions: [] });
  const page = await context.newPage();
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException("Permission denied", "NotAllowedError"));
  });
  await page.goto("http://127.0.0.1:3210/a1/lesson-1");
  await page.getByTestId("exercise-letter-record").click();
  await expect(page.getByTestId("exercise-letter-error")).toContainText("Mikrofonzugriff wurde nicht erlaubt");
  await context.close();
});

test("health endpoint reports configuration without exposing values", async ({ request }) => {
  const health = await request.get("/api/health");
  expect(await health.json()).toEqual({
    status: "degraded",
    services: { azureSpeech: false, masaar: false, iqra: false, internalApiKey: false },
  });
});
