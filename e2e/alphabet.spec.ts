import { expect, test, type Page } from "@playwright/test";

import { toneWav } from "./support/audio";
import { collectPageErrors, installFakeVoice, parseUpload } from "./support/helpers";
import { pronunciationAnswer, type AnswerMode } from "./support/pronunciation-answers";

// A0 – the alphabet, hands-free. Recording, voice detection, WAV conversion and
// upload are real (the microphone is a synthetic voice); the
// /api/pronunciation answer is produced by Alif's real decision logic with the
// Masaar letter rules (support/pronunciation-answers.ts).

const LETTERS = [
  ["alif", "أ", "أَلِف", "ألف"], ["baa", "ب", "بَاء", "باء"], ["taa", "ت", "تَاء", "تاء"], ["thaa", "ث", "ثَاء", "ثاء"],
  ["jeem", "ج", "جِيم", "جيم"], ["haa", "ح", "حَاء", "حاء"], ["khaa", "خ", "خَاء", "خاء"], ["daal", "د", "دَال", "دال"],
  ["dhaal", "ذ", "ذَال", "ذال"], ["raa", "ر", "رَاء", "راء"], ["zaay", "ز", "زَاي", "زاي"], ["seen", "س", "سِين", "سين"],
  ["sheen", "ش", "شِين", "شين"], ["saad", "ص", "صَاد", "صاد"], ["daad", "ض", "ضَاد", "ضاد"], ["taa-heavy", "ط", "طَاء", "طاء"],
  ["zaa-heavy", "ظ", "ظَاء", "ظاء"], ["ayn", "ع", "عَيْن", "عين"], ["ghayn", "غ", "غَيْن", "غين"], ["faa", "ف", "فَاء", "فاء"],
  ["qaaf", "ق", "قَاف", "قاف"], ["kaaf", "ك", "كَاف", "كاف"], ["laam", "ل", "لَام", "لام"], ["meem", "م", "مِيم", "ميم"],
  ["noon", "ن", "نُون", "نون"], ["haa-final", "ه", "هَاء", "هاء"], ["waaw", "و", "وَاو", "واو"], ["yaa", "ي", "يَاء", "ياء"],
] as const;

type Stub = { modes: Record<string, AnswerMode[]>; uploads: ReturnType<typeof parseUpload>[]; tts: string[]; answers: Array<{ target: string; passed: boolean; rule: string }> };

async function stubServices(page: Page, modes: Record<string, AnswerMode[]> = {}): Promise<Stub> {
  const stub: Stub = { modes, uploads: [], tts: [], answers: [] };
  await page.route("**/api/tts", async (route) => {
    stub.tts.push(route.request().postDataJSON().text);
    await route.fulfill({ status: 200, contentType: "audio/wav", body: toneWav(200) });
  });
  await page.route("**/api/pronunciation", async (route) => {
    const upload = parseUpload(route.request());
    stub.uploads.push(upload);
    const mode = stub.modes[upload.target!]?.shift() ?? "correct";
    const answer = pronunciationAnswer(upload.target!, mode);
    stub.answers.push({ target: upload.target!, passed: answer.passed, rule: answer.conditionEvaluation.matchedRule });
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(answer) });
  });
  return stub;
}

test("overview lists all 28 letters in order; only أ is open at the start", async ({ page }) => {
  await page.goto("/a0");
  await expect(page.getByRole("heading", { name: "Das arabische Alphabet" })).toBeVisible();
  const tiles = page.locator('[data-testid^="alphabet-tile-"]');
  await expect(tiles).toHaveCount(28);
  expect(await tiles.evaluateAll((els) => els.map((el) => el.getAttribute("data-testid")!.replace("alphabet-tile-", "")))).toEqual(LETTERS.map((l) => l[0]));
  for (const [id, glyph, name] of LETTERS) {
    const tile = page.getByTestId(`alphabet-tile-${id}`);
    await expect(tile).toContainText(glyph);
    await expect(tile).toContainText(name);
  }
  await expect(page.getByTestId("alphabet-tile-alif")).toHaveAttribute("data-status", "available");
  await expect(page.getByTestId("alphabet-tile-baa")).toHaveAttribute("data-status", "locked");
  await expect(page.getByTestId("alphabet-tile-yaa")).toHaveAttribute("data-status", "locked");
  await expect(page.locator("main img")).toHaveCount(0); // no vocabulary images in A0
});

test("a locked letter cannot be practised via its URL; unknown letters are 404", async ({ page }) => {
  await page.goto("/a0/letters/baa");
  await expect(page.getByTestId("letter-locked")).toBeVisible();
  await expect(page.getByTestId("drill")).toHaveCount(0);
  const response = await page.goto("/a0/letters/unknown");
  expect(response?.status()).toBe(404);
});

test("all 28 letters hands-free: speak → Masaar result → wrong: the name is spoken and it listens again → right: ممتاز and the next letter by itself → score → A1", async ({ page }) => {
  test.setTimeout(300_000);
  const errors = collectPageErrors(page);
  await installFakeVoice(page);
  const stub = await stubServices(page, { "ألف": ["incorrect", "correct"] });

  await page.goto("/a0");
  await page.getByTestId("alphabet-continue").click();

  for (const [index, [id, glyph, name, target]] of LETTERS.entries()) {
    await expect(page).toHaveURL(new RegExp(`/a0/letters/${id}$`));
    await expect(page.getByTestId("letter-glyph")).toHaveText(glyph);
    await expect(page.getByTestId("letter-name")).toHaveText(name);
    await expect(page.getByTestId("letter-position")).toHaveText(`Buchstabe ${index + 1} von 28`);
    await expect(page.locator("main img")).toHaveCount(0);
    // No manual controls: no Record, Listen, Try again or Weiter.
    await expect(page.getByTestId("letter-practice").getByRole("button")).toHaveCount(0);

    // The letter's name is spoken before the student's turn.
    await expect.poll(() => stub.tts).toContain(name);

    if (id === "alif") {
      // Wrong first: the name is shown and spoken again, the same letter listens again.
      await expect(page.getByTestId("drill-feedback")).toHaveAttribute("data-result", "incorrect");
      await expect(page.getByTestId("drill-target")).toHaveText(name);
      await expect(page.getByTestId("drill-attempt")).toHaveText("Versuch 2");
      await expect(page.getByTestId("letter-glyph")).toHaveText(glyph);
    }

    await expect(page.getByTestId("drill-feedback")).toHaveAttribute("data-result", "correct");
    await expect(page.getByTestId("letter-practice")).toHaveAttribute("data-status", "mastered");
    expect(stub.uploads.at(-1)).toMatchObject({ target, fileName: "voice.wav", riff: "RIFF", wave: "WAVE", channels: 1, sampleRate: 16000, bits: 16 });
    expect(stub.answers.at(-1)).toEqual({ target, passed: true, rule: "excellent" });
  }

  await expect(page.getByTestId("alphabet-complete")).toHaveAttribute("data-complete", "true");
  await expect(page.getByTestId("alphabet-complete")).toContainText("Alphabet gemeistert!");
  // 27 letters on the first attempt, أ on the second: (27 × 100 + 90) / 28 = 99.6 → 99 %.
  await expect(page.getByTestId("round-result")).toHaveAttribute("data-score", "99");
  await expect(page.getByTestId("round-score")).toHaveText("Dein Ergebnis: 99 %");
  await expect(page.getByTestId("round-letter-alif")).toHaveAttribute("data-attempts", "2");
  expect(stub.answers.filter((a) => !a.passed)).toEqual([{ target: "ألف", passed: false, rule: "correct_letter_needs_improvement" }]);
  expect(stub.uploads.map((u) => u.target)).toEqual(["ألف", ...LETTERS.map((l) => l[3])]);
  expect(stub.tts).toContain("مُمْتَاز");
  // Every letter name was requested before that letter's first upload (later repeats come from the player's cache).
  expect(stub.tts.filter((text) => text !== "مُمْتَاز")).toEqual(LETTERS.map((l) => l[2]));

  await page.getByTestId("go-to-a1").click();
  await expect(page).toHaveURL(/\/a1$/);
  await page.goto("/a0");
  await expect(page.getByTestId("alphabet-progress")).toContainText("28 / 28");
  await expect(page.getByTestId("alphabet-complete-banner")).toBeVisible();
  expect(errors).toEqual([]);
});

test("IQRA unavailable is a technical error, not a mistake: retry, then Überspringen opens the next letter but the letter stays not mastered", async ({ page }) => {
  await installFakeVoice(page);
  const stub = await stubServices(page, { "باء": ["iqra-unavailable", "iqra-unavailable", "correct"], "تاء": Array(30).fill("incorrect") });

  await page.goto("/a0/letters/alif");
  await expect(page).toHaveURL(/\/letters\/baa$/);

  await expect(page.getByTestId("drill-error")).toContainText("Lautanalyse ist gerade nicht verfügbar");
  expect(stub.answers.at(-1)).toEqual({ target: "باء", passed: false, rule: "no_matching_rule" });
  await expect(page.getByTestId("drill-attempt")).toHaveCount(0);
  await page.getByTestId("drill-retry").click();
  await expect.poll(() => stub.answers.filter((a) => a.target === "باء").length).toBe(2);
  await expect(page.getByTestId("drill-error")).toBeVisible();

  await page.getByTestId("letter-skip").click();
  await expect(page).toHaveURL(/\/letters\/taa$/);
  await expect(page.getByTestId("letter-practice")).toHaveAttribute("data-status", "available");

  await page.goto("/a0");
  await expect(page.getByTestId("alphabet-tile-baa")).toHaveAttribute("data-status", "skipped");
  await expect(page.getByTestId("alphabet-tile-baa")).toContainText("Nicht gemeistert");
  await expect(page.getByTestId("alphabet-tile-taa")).toHaveAttribute("data-status", "available");
  await expect(page.getByTestId("alphabet-tile-thaa")).toHaveAttribute("data-status", "locked");
  await expect(page.getByTestId("alphabet-progress")).toContainText("1 / 28");
  await expect(page.getByTestId("alphabet-not-mastered-banner")).toBeVisible();

  // Return to the skipped letter later and master it.
  await page.getByTestId("alphabet-tile-baa").locator("a").click();
  await expect(page.getByTestId("drill-feedback")).toHaveAttribute("data-result", "correct");
  await page.goto("/a0");
  await expect(page.getByTestId("alphabet-tile-baa")).toHaveAttribute("data-status", "mastered");
  await expect(page.getByTestId("alphabet-progress")).toContainText("2 / 28");
});

test("skipping the last letter ends the alphabet without claiming mastery", async ({ page }) => {
  await installFakeVoice(page);
  await stubServices(page, { "ياء": ["iqra-unavailable"] });
  await page.goto("/a0");
  await page.evaluate((ids) => {
    window.localStorage.setItem("alif:progress:v1", JSON.stringify({ "a0/alphabet": { passed: ids } }));
  }, LETTERS.slice(0, 27).map((l) => l[0]));
  await page.goto("/a0/letters/yaa");
  await page.getByTestId("letter-skip").click();
  await expect(page.getByTestId("alphabet-complete")).toHaveAttribute("data-complete", "false");
  await expect(page.getByTestId("alphabet-open-letters")).toContainText("ي");
  await expect(page.getByTestId("round-score")).toHaveText("Dein Ergebnis: 0 %");
  await expect(page.getByTestId("go-to-a1")).toBeVisible();
});

test("old /a0/lesson-1 URL redirects permanently to /a1/lesson-1", async ({ page, request }) => {
  const response = await request.get("/a0/lesson-1", { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  expect(response.headers()["location"]).toBe("/a1/lesson-1");
  await page.goto("/a0/lesson-1");
  await expect(page).toHaveURL(/\/a1\/lesson-1$/);
  await expect(page.getByTestId("vocab-card-asad")).toBeVisible();
});
