import { existsSync } from "node:fs";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

import { toneWav } from "./support/audio";
import { collectPageErrors, parseUpload, recordExercise, type UploadInfo } from "./support/helpers";

// Full student journey in the browser. The fake microphone, recording,
// WebM→WAV conversion and upload are real; only the /api/pronunciation and
// /api/tts answers are stubbed here (they need Azure). The real API is
// exercised in api-errors.spec.ts and services.spec.ts.

const RULE_MESSAGES: Record<string, string> = {
  "ألف": "ممتاز 👏 نطقت حرف الألف بشكل صحيح",
  "أسد": "ممتاز 👏 نطقت كلمة أسد بشكل صحيح",
  "أرنب": "ممتاز 👏 نطقت كلمة أرنب بشكل صحيح",
  "أناناس": "ممتاز 👏 نطقت كلمة أناناس بشكل صحيح",
};

function apiAnswer(target: string, passed: boolean) {
  const rule = passed ? "excellent" : target === "ألف" ? "correct_letter_needs_improvement" : "needs_improvement";
  const message = passed ? RULE_MESSAGES[target]! : " حاول تحسين طريقة النطق";
  const accuracy = passed ? 86 : 58;
  return {
    target, recognized: target, passed, failureReason: passed ? null : "low_accuracy",
    scores: { accuracy, pronunciation: accuracy, fluency: accuracy, completeness: 100 },
    feedback: { rule, message },
    details: { masaar: null, azure: { recognized: target, accuracy }, iqra: null },
    conditionEvaluation: { target, azureAccuracy: accuracy, azureRecognized: target, iqraPhonemes: [], matchedRule: rule, message, conditions: [] },
    discrimination: { targetScore: accuracy, firstSoundScore: null, closestAlternative: null, alternativeScore: null, margin: null },
    words: [],
  };
}

test("A0 → Wörter → Lesson 1 → listen → record → feedback → retry → continue", async ({ page }) => {
  const errors = collectPageErrors(page);
  const uploads: UploadInfo[] = [];
  const ttsTexts: string[] = [];
  let failNextLetterAttempt = true;

  await page.route("**/api/tts", async (route) => {
    ttsTexts.push(route.request().postDataJSON().text);
    await route.fulfill({ status: 200, contentType: "audio/wav", body: toneWav() });
  });
  await page.route("**/api/pronunciation", async (route) => {
    const upload = parseUpload(route.request());
    uploads.push(upload);
    const passed = !(upload.target === "ألف" && failNextLetterAttempt);
    if (upload.target === "ألف") failNextLetterAttempt = false;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(apiAnswer(upload.target!, passed)) });
  });

  // 1–3: open Alif, A0, Wörter, Lesson 1 – all on Alif's own origin.
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Arabisch lernen/ })).toBeVisible();
  await page.getByTestId("level-card-a0").click();
  await expect(page).toHaveURL(/\/a0$/);
  await page.getByTestId("a0-part-words").click();
  await expect(page).toHaveURL(/\/a0\/words$/);
  await page.getByTestId("lesson-link-lesson-1").click();
  await expect(page).toHaveURL(/\/a0\/words\/lesson-1\/intro$/);
  const video = page.getByTestId("intro-video");
  await expect(video).toHaveAttribute("src", "/videos/a1/lesson-1/de.mp4");
  await page.getByRole("button", { name: /Der Laut/ }).click();
  // Intro mp4 files are not in git (DEPLOY-VIDEOS.md): only seek where the file exists, i.e. not in CI.
  if (hasLocalVideo(1)) await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThanOrEqual(12);
  await expect(page.getByTestId("intro-skip-seen")).toHaveCount(0);
  await page.getByTestId("intro-continue").click();
  await expect(page).toHaveURL(/\/a0\/words\/lesson-1$/);
  await expect(page.getByTestId("intro-link")).toBeVisible();
  expect(new URL(page.url()).host).toBe("127.0.0.1:3210");
  expect(await page.locator("iframe").count()).toBe(0);

  // 4–5: letter and vocabulary cards.
  await expect(page.getByTestId("lesson-letter")).toHaveText("أَ");
  for (const [id, arabic, german] of [["asad", "أَسَد", "der Löwe"], ["arnab", "أَرْنَب", "der Hase"], ["ananas", "أَنَانَاس", "die Ananas"]]) {
    const card = page.getByTestId(`vocab-card-${id}`);
    await expect(card).toBeVisible();
    await expect(page.getByTestId(`vocab-arabic-${id}`)).toHaveText(arabic!);
    await expect(card).toContainText(german!);
    const image = card.locator("img");
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  }
  await expect(page.getByTestId("continue-button")).toBeDisabled();

  // 6: listen.
  const ttsCall = page.waitForRequest("**/api/tts");
  await page.getByTestId("exercise-letter-listen").click();
  await ttsCall;
  expect(ttsTexts[0]).toBe("أَلِف");
  await expect(page.getByTestId("exercise-letter-listen")).toBeEnabled();

  // 7–10: microphone → recording → WAV upload to /api/pronunciation; first attempt fails.
  await recordExercise(page, "letter");
  await expect(page.getByTestId("exercise-letter")).toHaveAttribute("data-phase", "result");
  expect(uploads[0]).toMatchObject({ target: "ألف", fileName: "voice.wav", riff: "RIFF", wave: "WAVE", channels: 1, sampleRate: 16000, bits: 16 });
  expect(uploads[0]!.bytes).toBeGreaterThan(16000); // > 0.5 s of 16 kHz 16-bit audio

  // 15–16: feedback displayed.
  const feedback = page.getByTestId("exercise-letter-feedback");
  await expect(feedback).toHaveAttribute("data-tone", "retry");
  await expect(feedback).toContainText("Fast geschafft");
  await expect(page.getByTestId("exercise-letter-feedback-message")).toHaveText("حاول تحسين طريقة النطق");
  await expect(feedback).toContainText("58 %");

  // 17: retry.
  await page.getByTestId("exercise-letter-feedback-retry").click();
  await expect(page.getByTestId("exercise-letter")).toHaveAttribute("data-phase", "recording");
  await page.waitForTimeout(1200);
  await page.getByTestId("exercise-letter-record").click();
  await expect(feedback).toHaveAttribute("data-tone", "success");
  await expect(page.getByTestId("exercise-letter-feedback-message")).toHaveText(RULE_MESSAGES["ألف"]!);
  await expect(page.getByTestId("lesson-progress")).toContainText("1 / 4");

  // Vocabulary cards.
  for (const [id, target] of [["asad", "أسد"], ["arnab", "أرنب"], ["ananas", "أناناس"]] as const) {
    await page.getByTestId(`exercise-${id}`).scrollIntoViewIfNeeded();
    await recordExercise(page, id, 1200);
    await expect(page.getByTestId(`exercise-${id}-feedback`)).toHaveAttribute("data-tone", "success");
    await expect(page.getByTestId(`exercise-${id}-feedback-message`)).toHaveText(RULE_MESSAGES[target]!);
    expect(uploads.at(-1)).toMatchObject({ target, sampleRate: 16000, channels: 1 });
  }
  await expect(page.getByTestId("lesson-progress")).toContainText("4 / 4");
  expect(ttsTexts).toContain("مُمْتَاز");

  // 18: continue.
  await page.getByTestId("continue-button").click();
  await expect(page.getByTestId("lesson-complete")).toContainText("Lektion 1 geschafft!");
  // Lesson 2 has an intro video: "Nächste Lektion" opens it. "Zurück zu A0 · Wörter" is only on lesson 28.
  await expect(page.getByRole("link", { name: /Nächste Lektion/ })).toHaveAttribute("href", "/a0/words/lesson-2/intro");
  await expect(page.getByTestId("back-to-level")).toHaveCount(0);
  await page.goto("/a0/words");
  await expect(page.getByTestId("lesson-link-lesson-1")).toContainText("Abgeschlossen");
  // Second visit: the card still opens the intro, now with a prominent skip button.
  await page.getByTestId("lesson-link-lesson-1").click();
  await expect(page).toHaveURL(/\/a0\/words\/lesson-1\/intro$/);
  await expect(page.getByTestId("intro-video")).toBeVisible();
  await expect(page.getByTestId("intro-seen-notice")).toContainText("Du hast dieses Video schon gesehen.");
  await page.getByRole("link", { name: "Intro überspringen" }).click();
  await expect(page).toHaveURL(/\/a0\/words\/lesson-1$/);

  // Lesson 1 completed: lesson 2 is open and starts with its intro video, lesson 3 stays locked.
  await page.goto("/a0/words");
  await expect(page.getByTestId("lesson-link-lesson-3")).toHaveAttribute("data-locked", "true");
  await page.getByTestId("lesson-link-lesson-2").click();
  await expect(page).toHaveURL(/\/a0\/words\/lesson-2\/intro$/);
  await expect(page.getByTestId("intro-video")).toHaveAttribute("src", "/videos/a1/lesson-2/de.mp4");
  await page.getByTestId("intro-continue").click();
  await expect(page).toHaveURL(/\/a0\/words\/lesson-2$/);
  await expect(page.getByTestId("lesson-letter")).toHaveText("ب");
  await expect(page.getByTestId("intro-link")).toBeVisible();

  // Progress survives a reload (per-browser storage).
  await page.goto("/a0/words/lesson-1");
  await expect(page.getByTestId("continue-button")).toBeEnabled();

  expect(errors).toEqual([]);
});

test("only one exercise records at a time", async ({ page }) => {
  await page.goto("/a0/words/lesson-1");
  await page.getByTestId("exercise-letter-record").click();
  await expect(page.getByTestId("exercise-letter")).toHaveAttribute("data-phase", "recording");
  await expect(page.getByTestId("exercise-asad-record")).toBeDisabled();
  await expect(page.getByTestId("exercise-arnab-record")).toBeDisabled();
});

test.describe("responsive layout", () => {
  test("desktop shows three cards in a row", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto("/a0/words/lesson-1");
    const boxes = await Promise.all(["asad", "arnab", "ananas"].map((id) => page.getByTestId(`vocab-card-${id}`).boundingBox()));
    expect(new Set(boxes.map((b) => Math.round(b!.y))).size).toBe(1);
    expect(boxes[0]!.x).toBeLessThan(boxes[1]!.x);
    expect(boxes[1]!.x).toBeLessThan(boxes[2]!.x);
  });

  test("mobile stacks cards vertically without horizontal scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const path of ["/", "/a0", "/a0/letters", "/a0/letters/alif", "/a1", "/a1/lesson-1/step-1", "/a1/lesson-1/step-2", "/a0/words", "/a0/words/lesson-1"]) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
    const boxes = await Promise.all(["asad", "arnab", "ananas"].map((id) => page.getByTestId(`vocab-card-${id}`).boundingBox()));
    expect(new Set(boxes.map((b) => Math.round(b!.x))).size).toBe(1);
    expect(boxes[0]!.y).toBeLessThan(boxes[1]!.y);
    expect(boxes[1]!.y).toBeLessThan(boxes[2]!.y);
  });

  test("Arabic content is marked RTL", async ({ page }) => {
    await page.goto("/a0/words/lesson-1");
    await expect(page.getByTestId("lesson-letter")).toHaveAttribute("dir", "rtl");
    await expect(page.getByTestId("vocab-arabic-asad")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
  });
});

test("unknown routes show Alif's own 404", async ({ page }) => {
  const response = await page.goto("/a0/words/lesson-99");
  expect(response?.status()).toBe(404);
  await expect(page.getByText("Diese Seite gibt es nicht.")).toBeVisible();
});

const PROGRESS_KEY = "alif:progress:v1";

/** Intro mp4 files are gitignored; CI has only the posters. */
function hasLocalVideo(lesson: number) {
  return existsSync(path.join(process.cwd(), "public", "videos", "a1", `lesson-${lesson}`, "de.mp4"));
}

/** Seeds per-browser progress before any page script runs. */
async function seedProgress(page: Page, progress: Record<string, { passed: string[]; completedAt?: string }>) {
  await page.addInitScript(([key, value]) => window.localStorage.setItem(key, value), [PROGRESS_KEY, JSON.stringify(progress)] as const);
}

test("/a0/words lists all 28 letter lessons in alphabet order; at the start only lesson 1 is open", async ({ page }) => {
  await page.goto("/a0/words");
  const cards = page.locator('[data-testid^="lesson-link-lesson-"]');
  await expect(cards).toHaveCount(28);
  await expect(cards.first()).toContainText("Der Buchstabe Alif");
  await expect(cards.nth(1)).toContainText("Der Buchstabe Ba");
  await expect(cards.last()).toContainText("Der Buchstabe Ya");
  await expect(page.getByTestId("lesson-link-lesson-1")).toHaveAttribute("href", "/a0/words/lesson-1/intro");
  for (const n of [2, 15, 28]) {
    await expect(page.getByTestId(`lesson-link-lesson-${n}`)).toHaveAttribute("data-locked", "true");
    await expect(page.getByTestId(`lesson-link-lesson-${n}`)).toContainText("Gesperrt");
  }
});

test("a locked lesson cannot be opened through its URL", async ({ page }) => {
  await page.goto("/a0/words/lesson-2");
  await expect(page.getByTestId("lesson-locked")).toContainText("Diese Lektion ist noch gesperrt.");
  await expect(page.getByTestId("lesson-letter")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Zu Lektion 1" })).toHaveAttribute("href", "/a0/words/lesson-1/intro");
});

test("a lesson without an intro video starts directly and has no /intro page", async ({ page }) => {
  const errors = collectPageErrors(page);
  const done = "2026-10-04T00:00:00.000Z";
  await seedProgress(page, Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => [`a0/words/lesson-${n}`, { passed: [], completedAt: done }])));
  await page.goto("/a0/words");
  await expect(page.getByTestId("lesson-link-lesson-10")).toHaveAttribute("href", "/a0/words/lesson-10");
  await page.getByTestId("lesson-link-lesson-10").click();
  await expect(page).toHaveURL(/\/a0\/words\/lesson-10$/);
  await expect(page.getByTestId("lesson-letter")).toHaveText("ر");
  for (const id of ["rummana", "risha", "rajul"]) await expect(page.getByTestId(`vocab-card-${id}`)).toBeVisible();
  await expect(page.getByTestId("intro-link")).toHaveCount(0);
  const response = await page.goto("/a0/words/lesson-10/intro");
  expect(response?.status()).toBe(404);
  expect(errors).toEqual([]);
});

test("Ba, Ta, Tha, Dschim, Ḥa, Cha, Dal and Dhal open their own intro video: poster, metadata preload, no autoplay, no chapter list", async ({ page }) => {
  const errors = collectPageErrors(page);
  const done = "2026-10-04T00:00:00.000Z";
  await seedProgress(page, Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8].map((n) => [`a0/words/lesson-${n}`, { passed: [], completedAt: done }])));
  await page.goto("/a0/words");
  for (const [n, glyph] of [[2, "ب"], [3, "ت"], [4, "ث"], [5, "ج"], [6, "ح"], [7, "خ"], [8, "د"], [9, "ذ"]] as const) {
    await expect(page.getByTestId(`lesson-link-lesson-${n}`)).toHaveAttribute("href", `/a0/words/lesson-${n}/intro`);
    await page.goto(`/a0/words/lesson-${n}/intro`);
    const video = page.getByTestId("intro-video");
    await expect(video).toHaveAttribute("src", `/videos/a1/lesson-${n}/de.mp4`);
    await expect(video).toHaveAttribute("poster", `/videos/a1/lesson-${n}/poster.jpg`);
    await expect(video).toHaveAttribute("preload", "metadata");
    expect(await video.evaluate((v: HTMLVideoElement) => v.autoplay)).toBe(false);
    await expect(page.getByRole("heading", { name: "Kapitel" })).toHaveCount(0);
    const poster = await page.request.get(`/videos/a1/lesson-${n}/poster.jpg`);
    expect(poster.status()).toBe(200);
    if (hasLocalVideo(n)) {
      await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThanOrEqual(1);
      expect(await video.evaluate((v: HTMLVideoElement) => v.duration)).toBeGreaterThan(100);
    }
    await page.getByTestId("intro-continue").click();
    await expect(page).toHaveURL(new RegExp(`/a0/words/lesson-${n}$`));
    await expect(page.getByTestId("lesson-letter")).toHaveText(glyph);
    await page.goto("/a0/words");
  }
  expect(errors).toEqual([]);
});

test("the last lesson (28) ends with \"Zurück zu A0 · Wörter\"", async ({ page }) => {
  const done = "2026-10-04T00:00:00.000Z";
  const progress: Record<string, { passed: string[]; completedAt?: string }> = {};
  for (let n = 1; n <= 27; n++) progress[`a0/words/lesson-${n}`] = { passed: [], completedAt: done };
  progress["a0/words/lesson-28"] = { passed: ["letter", "yad", "yaqtin", "yamama"] };
  await seedProgress(page, progress);
  await page.goto("/a0/words/lesson-28");
  await expect(page.getByTestId("lesson-letter")).toHaveText("ي");
  await page.getByTestId("continue-button").click();
  await expect(page.getByTestId("lesson-complete")).toContainText("Lektion 28 geschafft!");
  await expect(page.getByRole("link", { name: /Nächste Lektion/ })).toHaveCount(0);
  await page.getByTestId("back-to-level").click();
  await expect(page).toHaveURL(/\/a0\/words$/);
  await expect(page.getByTestId("lesson-link-lesson-28")).toContainText("Abgeschlossen");
});
