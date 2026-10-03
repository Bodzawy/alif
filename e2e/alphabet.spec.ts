import { expect, test, type Page } from "@playwright/test";

import { toneWav } from "./support/audio";
import { collectPageErrors, parseUpload, recordExercise } from "./support/helpers";
import { pronunciationAnswer, type AnswerMode } from "./support/pronunciation-answers";

// A0 – the alphabet. Recording, WAV conversion and upload are real; the
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
  await expect(page.getByTestId("exercise-baa-record")).toHaveCount(0);
  const response = await page.goto("/a0/letters/unknown");
  expect(response?.status()).toBe(404);
});

test("all 28 letters: listen → record → Masaar result → Weiter only after passed: true → A0 complete → A1", async ({ page }) => {
  test.setTimeout(240_000);
  const errors = collectPageErrors(page);
  const stub = await stubServices(page, { "ألف": ["incorrect", "correct"] });

  await page.goto("/a0");
  await page.getByTestId("alphabet-continue").click();

  for (const [index, [id, glyph, name, target]] of LETTERS.entries()) {
    await expect(page).toHaveURL(new RegExp(`/a0/letters/${id}$`));
    await expect(page.getByTestId("letter-glyph")).toHaveText(glyph);
    await expect(page.getByTestId("letter-name")).toHaveText(name);
    await expect(page.getByTestId("letter-position")).toHaveText(`Buchstabe ${index + 1} von 28`);
    await expect(page.locator("main img")).toHaveCount(0);

    // Listen: /api/tts with the Masaar spoken name of the letter.
    const tts = page.waitForRequest((r) => r.url().endsWith("/api/tts") && r.postDataJSON().text === name);
    await page.getByTestId(`exercise-${id}-listen`).click();
    await tts;

    const next = page.getByTestId("letter-next");
    await expect(next).toBeDisabled();

    if (id === "alif") {
      // Incorrect first: retry, Weiter stays locked.
      await recordExercise(page, id, 700);
      await expect(page.getByTestId(`exercise-${id}-feedback`)).toHaveAttribute("data-passed", "false");
      await expect(page.getByTestId(`exercise-${id}-record`)).toHaveText(/Nochmal/);
      await expect(next).toBeDisabled();
      await page.getByTestId(`exercise-${id}-feedback-retry`).click();
      await expect(page.getByTestId(`exercise-${id}`)).toHaveAttribute("data-phase", "recording");
      await page.waitForTimeout(700);
      await page.getByTestId(`exercise-${id}-record`).click();
    } else {
      await recordExercise(page, id, 600);
    }

    await expect(page.getByTestId(`exercise-${id}-feedback`)).toHaveAttribute("data-passed", "true");
    await expect(page.getByTestId("letter-practice")).toHaveAttribute("data-status", "mastered");
    expect(stub.uploads.at(-1)).toMatchObject({ target, fileName: "voice.wav", riff: "RIFF", wave: "WAVE", channels: 1, sampleRate: 16000, bits: 16 });
    expect(stub.answers.at(-1)).toEqual({ target, passed: true, rule: "excellent" });
    await expect(next).toBeEnabled();
    await next.click();
  }

  await expect(page.getByTestId("alphabet-complete")).toHaveAttribute("data-complete", "true");
  await expect(page.getByTestId("alphabet-complete")).toContainText("Alphabet gemeistert!");
  expect(stub.answers.filter((a) => !a.passed)).toEqual([{ target: "ألف", passed: false, rule: "correct_letter_needs_improvement" }]);
  expect(new Set(stub.uploads.map((u) => u.target))).toEqual(new Set(LETTERS.map((l) => l[3])));

  await page.getByTestId("go-to-a1").click();
  await expect(page).toHaveURL(/\/a1$/);
  await page.goto("/a0");
  await expect(page.getByTestId("alphabet-progress")).toContainText("28 / 28");
  await expect(page.getByTestId("alphabet-complete-banner")).toBeVisible();
  expect(errors).toEqual([]);
});

test("IQRA unavailable: Masaar result kept, Weiter locked; Überspringen opens the next letter but the letter stays not mastered", async ({ page }) => {
  const stub = await stubServices(page, { "باء": ["iqra-unavailable", "correct"] });

  await page.goto("/a0/letters/alif");
  await recordExercise(page, "alif", 600);
  await page.getByTestId("letter-next").click();
  await expect(page).toHaveURL(/\/letters\/baa$/);

  await recordExercise(page, "baa", 600);
  const feedback = page.getByTestId("exercise-baa-feedback");
  await expect(feedback).toHaveAttribute("data-passed", "false");
  await expect(feedback).toHaveAttribute("data-tone", "neutral");
  await expect(page.getByTestId("exercise-baa-feedback-message")).toHaveText("تعذر تحليل أصوات النطق. حاول مرة أخرى بعد التأكد من اتصال IQRA.");
  expect(stub.answers.at(-1)).toEqual({ target: "باء", passed: false, rule: "no_matching_rule" });
  await expect(page.getByTestId("letter-next")).toBeDisabled();

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
  await expect(page.getByTestId("letter-practice")).toHaveAttribute("data-status", "skipped");
  await recordExercise(page, "baa", 600);
  await expect(page.getByTestId("letter-practice")).toHaveAttribute("data-status", "mastered");
  await page.goto("/a0");
  await expect(page.getByTestId("alphabet-tile-baa")).toHaveAttribute("data-status", "mastered");
  await expect(page.getByTestId("alphabet-progress")).toContainText("2 / 28");
});

test("skipping the last letter ends the alphabet without claiming mastery", async ({ page }) => {
  await stubServices(page);
  await page.goto("/a0");
  await page.evaluate((ids) => {
    window.localStorage.setItem("alif:progress:v1", JSON.stringify({ "a0/alphabet": { passed: ids } }));
  }, LETTERS.slice(0, 27).map((l) => l[0]));
  await page.goto("/a0/letters/yaa");
  await page.getByTestId("letter-skip").click();
  await expect(page.getByTestId("alphabet-complete")).toHaveAttribute("data-complete", "false");
  await expect(page.getByTestId("alphabet-open-letters")).toContainText("ي");
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
