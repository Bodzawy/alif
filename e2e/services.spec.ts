import { expect, test } from "@playwright/test";

import { installFakeVoice, recordExercise } from "./support/helpers";

// Real browser → real Alif API (:3211) → real Azure Speech SDK + MASAAR/IQRA.
// MASAAR and IQRA are local stand-ins speaking the production contract
// (e2e/support/mock-model-server.mjs). Azure is the real service: with valid
// ALIF_E2E_AZURE_KEY/REGION and network access the full chain must succeed;
// otherwise the test verifies the outage is reported honestly.

const MODELS = "http://127.0.0.1:3299";
const realAzure = Boolean(process.env.ALIF_E2E_AZURE_KEY);

test.use({ baseURL: "http://127.0.0.1:3211" });

test("recording is sent to Azure, MASAAR and IQRA through Alif's API", async ({ page, request }) => {
  await request.post(`${MODELS}/__reset`);
  await page.goto("/a1/lesson-1");

  const apiCall = page.waitForResponse((r) => r.url().endsWith("/api/pronunciation") && r.request().method() === "POST", { timeout: 60_000 });
  await recordExercise(page, "letter");
  const response = await apiCall;

  // MASAAR and IQRA were reached with the WAV and the internal API key.
  const hits = (await (await request.get(`${MODELS}/__hits`)).json()) as Array<Record<string, unknown>>;
  for (const service of ["MASAAR", "IQRA"]) {
    expect(hits.find((hit) => hit.service === service), service).toMatchObject({
      apiKey: "e2e-internal-key",
      hasAudioField: true,
      wav: { channels: 1, sampleRate: 16000, bits: 16 },
    });
  }

  if (response.status() === 200) {
    // Azure answered: the condition engine produced feedback, shown in the UI.
    const body = await response.json();
    expect(body.details.masaar).toMatchObject({ letter: "أ" });
    expect(body.details.iqra.phonemes).toEqual(["<", "a", "l", "i", "f"]);
    expect(body.conditionEvaluation.matchedRule).toBeTruthy();
    await expect(page.getByTestId("exercise-letter-feedback")).toBeVisible();
    await expect(page.getByTestId("exercise-letter-feedback-message")).toHaveText(body.conditionEvaluation.message.trim());
    test.info().annotations.push({ type: "azure", description: `reached – rule ${body.conditionEvaluation.matchedRule}` });
  } else {
    expect(realAzure, `Azure was configured but the API answered ${response.status()}`).toBe(false);
    // Invalid key / blocked network: honest outage message, no fake success.
    expect([422, 502, 504]).toContain(response.status());
    await expect(page.getByTestId("exercise-letter-error")).toBeVisible();
    await expect(page.getByTestId("exercise-letter-feedback")).toHaveCount(0);
    test.info().annotations.push({ type: "azure", description: `NOT reachable – API answered ${response.status()}` });
  }
});

test("A0 letter page uses the same /api/pronunciation pipeline (Azure, MASAAR, IQRA)", async ({ page, request }) => {
  await request.post(`${MODELS}/__reset`);
  await installFakeVoice(page);
  const apiCall = page.waitForResponse((r) => r.url().endsWith("/api/pronunciation") && r.request().method() === "POST", { timeout: 60_000 });
  await page.goto("/a0/letters/alif");
  const response = await apiCall;

  const hits = (await (await request.get(`${MODELS}/__hits`)).json()) as Array<Record<string, unknown>>;
  for (const service of ["MASAAR", "IQRA"]) {
    expect(hits.find((hit) => hit.service === service), service).toMatchObject({ apiKey: "e2e-internal-key", hasAudioField: true, wav: { channels: 1, sampleRate: 16000, bits: 16 } });
  }

  if (response.status() === 200) {
    const body = await response.json();
    await expect(page.getByTestId("drill-feedback").or(page.getByTestId("drill-error")).first()).toBeVisible();
    if (body.passed) await expect(page.getByTestId("drill-feedback")).toHaveAttribute("data-result", "correct");
  } else if (response.status() === 422) {
    // Azure heard no speech in the synthetic tone: not counted, it listens again.
    await expect(page.getByTestId("drill-status")).toContainText("nicht verstanden");
    await expect(page.getByTestId("drill-attempt")).toHaveCount(0);
  } else {
    expect(realAzure, `Azure was configured but the API answered ${response.status()}`).toBe(false);
    await expect(page.getByTestId("drill-error")).toBeVisible();
    await expect(page.getByTestId("drill-feedback")).toHaveCount(0);
  }
});
