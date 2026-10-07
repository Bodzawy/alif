import { expect, test, type Page } from "@playwright/test";

import { buildAssessment } from "../src/lib/pronunciation/assessment";
import { CONDITION_RULES } from "../src/lib/pronunciation/rules";
import { toneWav } from "./support/audio";
import { collectPageErrors, openButtonMode, parseUpload, recordExercise, refuseGuidedMicrophone } from "./support/helpers";

// A1 · Lesson 1 – صَبَاحُ الْخَيْر. Recording, WAV conversion and upload are
// real; /api/pronunciation answers come from Alif's real decision logic and
// rules, with simulated Azure/IQRA inputs.

const SOUNDS = [
  ["alif-fatha", "أَ"],
  ["alif-kasra", "إِ"],
  ["alif-damma", "أُ"],
] as const;

const GROUPS = [
  ["alif-fatha", [["ab", "أَب", "أب", "Vater", "Ab"], ["ana", "أَنَا", "أنا", "ich", "Anā"], ["amir", "أَمِير", "أمير", "Prinz", "Amīr"]]],
  ["alif-kasra", [["ibra", "إِبْرَة", "إبرة", "Nadel", "Ibra"], ["isba", "إِصْبَع", "إصبع", "Finger", "Iṣbaʿ"], ["ibriq", "إِبْرِيق", "إبريق", "Kanne", "Ibrīq"]]],
  ["alif-damma", [["udhun", "أُذُن", "أذن", "Ohr", "Udhun"], ["umm", "أُمّ", "أم", "Mutter", "Umm"], ["usra", "أُسْرَة", "أسرة", "Familie", "Usra"]]],
] as const;

/** IQRA phonemes that satisfy a target's "excellent" rule (first alternative of every "contains"). */
function excellentPhonemes(target: string) {
  return (CONDITION_RULES[target]?.excellent?.conditions ?? [])
    .map((condition) => condition.match(/^iqra_phonemes\s+contains\s+(.+)$/)?.[1])
    .filter((list): list is string => Boolean(list))
    .flatMap((list) => list.replace(/[\[\]'\s]/g, "").split(",").map((token) => token.split("|")[0]!));
}

/** The initial vowel an A1 word's "excellent" rule requires, if any. */
function initialVowel(target: string) {
  return (CONDITION_RULES[target]?.excellent?.conditions ?? []).map((c) => c.match(/^iqra_initial_vowel\s*==\s*([aiu])$/)?.[1]).find(Boolean);
}

function answer(target: string, correct: boolean) {
  const vowel = initialVowel(target);
  const phonemes = correct ? ["<", ...(vowel ? [vowel] : []), ...excellentPhonemes(target)] : ["<", "x", "o"];
  return buildAssessment({
    target,
    primary: { referenceText: target, recognized: target, accuracy: correct ? 90 : 50, pronunciation: 80, fluency: 90, completeness: 100, firstSoundScore: 80, words: [] },
    masaar: null,
    iqra: { sequence: phonemes.join(" "), phonemes, duration: 0.6 },
  });
}

async function stubServices(page: Page, wrongOnce: string[] = []) {
  const stub = { uploads: [] as ReturnType<typeof parseUpload>[], tts: [] as string[], wrong: new Set(wrongOnce) };
  await page.route("**/api/tts", async (route) => {
    stub.tts.push(route.request().postDataJSON().text);
    await route.fulfill({ status: 200, contentType: "audio/wav", body: toneWav(200) });
  });
  await page.route("**/api/pronunciation", async (route) => {
    const upload = parseUpload(route.request());
    stub.uploads.push(upload);
    const correct = !stub.wrong.delete(upload.target!);
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(answer(upload.target!, correct)) });
  });
  return stub;
}

test("/a1 lists الدرس الأول – صباح الخير; the card opens step 1", async ({ page }) => {
  await page.goto("/a1");
  const card = page.getByTestId("a1-lesson-lesson-1");
  await expect(card).toContainText("الدرس الأول");
  await expect(card).toContainText("صَبَاحُ الْخَيْر");
  await expect(card).toContainText("Lektion 1 · Guten Morgen");
  await expect(page.locator('[data-testid^="a1-lesson-"]')).toHaveCount(1);
  await card.click();
  await expect(page).toHaveURL(/\/a1\/lesson-1\/step-1$/);
  await expect(page.getByTestId("lesson-title")).toHaveText("صَبَاحُ الْخَيْر");
  await expect(page.getByTestId("step-position")).toHaveText("Schritt 1 von 6");
});

test("step 1: أَ → إِ → أُ, each with listen and speak through /api/tts and /api/pronunciation, then step 2", async ({ page }) => {
  const errors = collectPageErrors(page);
  const stub = await stubServices(page, ["إِ"]);
  await page.goto("/a1/lesson-1/step-1");

  for (const [index, [id, glyph]] of SOUNDS.entries()) {
    await expect(page.getByTestId(`sound-glyph-${id}`)).toHaveText(glyph);

    const tts = page.waitForRequest((r) => r.url().endsWith("/api/tts") && r.postDataJSON().text === glyph);
    await page.getByTestId(`exercise-${id}-listen`).click();
    await tts;

    await recordExercise(page, id, 600);
    if (glyph === "إِ") {
      const feedback = page.getByTestId(`exercise-${id}-feedback`);
      await expect(feedback).toHaveAttribute("data-passed", "false");
      // Simple learner feedback: no accuracy, no rule text, no service names.
      await expect(feedback).not.toContainText("%");
      await expect(feedback).not.toContainText(/IQRA|Azure|نريد/);
      await page.getByTestId(`exercise-${id}-feedback-retry`).click();
      await expect(page.getByTestId(`exercise-${id}`)).toHaveAttribute("data-phase", "recording");
      await page.waitForTimeout(600);
      await page.getByTestId(`exercise-${id}-record`).click();
    }
    await expect(page.getByTestId(`exercise-${id}-feedback-headline`)).toHaveText("مُمْتَاز! 👏");
    await expect(page.getByTestId(`exercise-${id}-feedback`)).not.toContainText("%");
    expect(stub.uploads.at(-1)).toMatchObject({ target: glyph, fileName: "voice.wav", riff: "RIFF", wave: "WAVE", channels: 1, sampleRate: 16000, bits: 16 });

    if (index < SOUNDS.length - 1) await page.getByTestId("sound-next").click();
  }

  await page.getByTestId("step-next").click();
  await expect(page).toHaveURL(/\/a1\/lesson-1\/step-2$/);
  expect(stub.uploads.map((u) => u.target)).toEqual(["أَ", "إِ", "إِ", "أُ"]);
  expect(errors).toEqual([]);
});

test("step 2: three vowel sections, nine word cards (image, Arabic, German, Franco), listen and speak for every vowel and word", async ({ page }) => {
  test.setTimeout(180_000);
  const errors = collectPageErrors(page);
  const stub = await stubServices(page);
  // The button page (guided mode has its own tests in a1-guided.spec.ts).
  await refuseGuidedMicrophone(page);
  await page.goto("/a1/lesson-1/step-2");
  await openButtonMode(page);

  const sections = page.locator('[data-testid^="word-group-"]');
  await expect(sections).toHaveCount(3);
  await expect(page.locator('[data-testid^="vocab-card-"]')).toHaveCount(9);

  for (const [soundId, words] of GROUPS) {
    const section = page.getByTestId(`word-group-${soundId}`);
    const glyph = SOUNDS.find(([id]) => id === soundId)![1];
    await expect(section.getByTestId(`sound-glyph-${soundId}`)).toHaveText(glyph);
    await section.getByTestId(`exercise-${soundId}-listen`).click();
    await expect.poll(() => stub.tts).toContain(glyph);
    await recordExercise(page, soundId, 600);
    await expect(section.getByTestId(`exercise-${soundId}-feedback-headline`)).toHaveText("مُمْتَاز! 👏");

    const cards = section.locator('[data-testid^="vocab-card-"]');
    expect(await cards.evaluateAll((els) => els.map((el) => el.getAttribute("data-testid")))).toEqual(words.map(([id]) => `vocab-card-${id}`));

    for (const [id, arabic, target, german, franco] of words) {
      const card = section.getByTestId(`vocab-card-${id}`);
      await expect(card.getByTestId(`vocab-arabic-${id}`)).toHaveText(arabic);
      await expect(card).toContainText(german);
      await expect(card).toContainText(franco);
      const image = card.locator("img");
      await expect(image).toHaveAttribute("src", `/images/a1/lesson-1/${id}.svg`);
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);

      await card.getByTestId(`exercise-${id}-listen`).click();
      await expect.poll(() => stub.tts).toContain(arabic);
      await recordExercise(page, id, 500);
      await expect(card.getByTestId(`exercise-${id}-feedback-headline`)).toHaveText("مُمْتَاز! 👏");
      await expect(card).toContainText("Geschafft");
      expect(stub.uploads.at(-1)!.target).toBe(target);
    }
  }

  expect(stub.uploads).toHaveLength(12);
  await expect(page.getByTestId("step-next")).toHaveAttribute("href", "/a1/lesson-1/step-3");
  await expect(page.getByTestId("step-next")).toHaveText(/Weiter: Formen/);
  await page.getByTestId("step-prev").click();
  await expect(page).toHaveURL(/\/a1\/lesson-1\/step-1$/);
  expect(errors).toEqual([]);
});

test("the real API accepts every A1 target and TTS text (no invalid_target)", async ({ request }) => {
  // :3211 is configured (invalid Azure key), so requests pass validation and then fail at Azure.
  const base = "http://127.0.0.1:3211";
  const targets = [...SOUNDS.map(([, glyph]) => glyph), ...GROUPS.flatMap(([, words]) => words.map((w) => w[2]))];
  const texts = [...SOUNDS.map(([, glyph]) => glyph), ...GROUPS.flatMap(([, words]) => words.map((w) => w[1]))];
  for (const target of targets) {
    const response = await request.post(`${base}/api/pronunciation`, {
      multipart: { target, audio: { name: "voice.wav", mimeType: "audio/wav", buffer: toneWav(800) } },
    });
    expect(response.status(), target).not.toBe(400);
  }
  for (const text of texts) {
    const response = await request.post(`${base}/api/tts`, { data: { text } });
    expect(response.status(), text).not.toBe(400);
  }
  const rejected = await request.post(`${base}/api/pronunciation`, { multipart: { target: "صباح", audio: { name: "voice.wav", mimeType: "audio/wav", buffer: toneWav(800) } } });
  expect(rejected.status()).toBe(400);
});

test.describe("A1 layout", () => {
  test("desktop: one row per vowel, like the lesson sheet – vowel on the right, then its three words right to left", async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 900 });
    await refuseGuidedMicrophone(page);
    await page.goto("/a1/lesson-1/step-2");
    // The same rows in guided mode (before the start) and on the button page.
    for (const mode of ["guided", "buttons"]) {
      if (mode === "buttons") await openButtonMode(page);
      const rows: number[] = [];
      for (const [soundId, words] of GROUPS) {
        const sound = (await page.getByTestId(`sound-card-${soundId}`).boundingBox())!;
        const cards = await Promise.all(words.map(([id]) => page.getByTestId(`vocab-card-${id}`).boundingBox()));
        // Same row: vowel and all three cards share their top edge.
        expect(new Set([sound, ...cards].map((b) => Math.round(b!.y))).size).toBe(1);
        // RTL: vowel rightmost, then word 1, word 2, word 3 towards the left.
        expect(sound.x).toBeGreaterThan(cards[0]!.x);
        expect(cards[0]!.x).toBeGreaterThan(cards[1]!.x);
        expect(cards[1]!.x).toBeGreaterThan(cards[2]!.x);
        // The vowel is a narrower column, not a header above the pictures.
        expect(sound.width).toBeLessThan(cards[0]!.width);
        expect(sound.y).toBeGreaterThanOrEqual(cards[0]!.y - 1);
        rows.push(sound.y);
      }
      expect(rows[0]!).toBeLessThan(rows[1]!);
      expect(rows[1]!).toBeLessThan(rows[2]!);
      const image = await page.getByTestId("vocab-card-ab").locator("img").boundingBox();
      expect(image!.width).toBeGreaterThan(260);
    }
    // Listen and speak buttons keep their icons and labels inside the narrow vowel column.
    for (const id of ["alif-fatha-listen", "alif-fatha-record"]) {
      const button = page.getByTestId(`exercise-${id}`);
      expect(await button.evaluate((el) => el.scrollWidth <= el.clientWidth + 1), id).toBe(true);
      expect((await button.locator("svg").boundingBox())!.width).toBeGreaterThanOrEqual(18);
    }
  });

  test("mobile: cards stack, images stay large, no horizontal scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await refuseGuidedMicrophone(page);
    for (const path of ["/a1", "/a1/lesson-1/step-1", "/a1/lesson-1/step-2"]) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), path).toBe(true);
    }
    await openButtonMode(page);
    const boxes = await Promise.all(["ab", "ana", "amir"].map((id) => page.getByTestId(`vocab-card-${id}`).boundingBox()));
    expect(new Set(boxes.map((b) => Math.round(b!.x))).size).toBe(1);
    expect(boxes[0]!.y).toBeLessThan(boxes[1]!.y);
    const image = await page.getByTestId("vocab-card-ab").locator("img").boundingBox();
    expect(image!.width).toBeGreaterThan(300);
    for (const id of ["alif-fatha-listen", "alif-fatha-record"]) {
      const button = page.getByTestId(`exercise-${id}`);
      expect(await button.evaluate((el) => el.scrollWidth <= el.clientWidth + 1), id).toBe(true);
    }
    await expect(page.getByTestId("word-group-alif-fatha")).toHaveAttribute("dir", "rtl");
    await expect(page.getByTestId("sound-card-alif-fatha")).toHaveAttribute("dir", "rtl");
  });
});
