import { expect, test, type Page } from "@playwright/test";

import { getA1Lesson } from "../src/data/a1";
import { menDialogue, womenDialogue } from "../src/data/a1/sabah-al-khayr";
import type { Dialogue } from "../src/data/types";
import { buildAssessment } from "../src/lib/pronunciation/assessment";
import dialogueManifest from "../src/lib/tts/dialogue-manifest.json";
import { toneWav } from "./support/audio";
import { collectPageErrors, parseUpload } from "./support/helpers";
import { answerGaps, noHorizontalScroll, syntheticVoice } from "./support/letters";

// A1 · Lektion 1 · "صَبَاحُ الْخَيْر" on a phone (and the layout on a desktop):
// both textbook conversations (Ahmad / Ali, Nabila / Fatima), each Anhören →
// Nachsprechen → Rollenspiel, then Buchstaben finden. TTS and the
// evaluation are MOCKED (answers built by the app's real rules from simulated
// IQRA input); the browser, the microphone path (synthetic voice), the WAV
// upload and the flow are real.

type Calls = { tts: Array<{ text: string; voice: string }>; uploads: string[] };

/** A dialogue line with a recording (src/lib/tts/dialogue-manifest.json) plays it instead of /api/tts. */
const recorded: Record<string, { voice: string; text: string; file: string }> = dialogueManifest.lines;
const byFile = new Map(Object.values(recorded).map((entry) => [entry.file, entry]));

/**
 * /api/tts and the dialogue recordings record what is spoken (text + voice); /api/pronunciation answers
 * from the list (false = wrong), then right.
 */
async function mock(page: Page, answers: boolean[] = []) {
  const calls: Calls = { tts: [], uploads: [] };
  await page.route("**/api/tts", async (route) => {
    const body = route.request().postDataJSON();
    calls.tts.push({ text: body.text, voice: body.voice ?? "default" });
    await route.fulfill({ status: 200, contentType: "audio/wav", body: toneWav(250) });
  });
  await page.route("**/audio/ar/d-*.mp3", async (route) => {
    const entry = byFile.get(new URL(route.request().url()).pathname.replace(/^\/audio\/ar\//, "").replace(/\.mp3$/, ""))!;
    calls.tts.push({ text: entry.text, voice: entry.voice });
    await route.fulfill({ status: 200, contentType: "audio/wav", body: toneWav(250) });
  });
  await page.route("**/api/pronunciation", async (route) => {
    const target = parseUpload(route.request()).target!;
    calls.uploads.push(target);
    const right = answers.shift() ?? true;
    const body = buildAssessment({
      target,
      primary: { referenceText: target, recognized: target, accuracy: right ? 92 : 40, pronunciation: 90, fluency: 90, completeness: 100, firstSoundScore: 80, words: [] },
      iqra: { sequence: "S a", phonemes: right ? ["S", "b", "H", "x", "n", "r", "k", "y", "f", "l", "m", "d", "s", "E", "w", "T"] : ["a"], duration: 0.6 },
    });
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });
  return calls;
}

const voices = (calls: Calls) => calls.tts.filter((t) => t.text !== "Super!").map((t) => `${t.voice}|${t.text}`);

test.describe("phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  /** Listen (all 7 lines, two voices, in order), repeat (all 7), role-play (one role, then – green – the other) – steps `first` … `first + 2`. */
  async function conversation(page: Page, calls: Calls, d: Dialogue, first: number, role: string) {
    const voiceOf = (speaker: string) => d.speakers.find((s) => s.id === speaker)!.voice;
    await expect(page).toHaveURL(new RegExp(`step-${first}$`));
    await expect(page.getByTestId("dialogue-lines").locator('[data-testid^="dialogue-line-"]')).toHaveCount(7);
    calls.tts.length = 0;
    await page.getByTestId("dialogue-play-all").tap();
    await expect(page.getByTestId("dialogue-question")).toBeVisible({ timeout: 30_000 });
    expect(voices(calls)).toEqual(d.lines.map((l) => `${voiceOf(l.speaker)}|${l.arabic}`));
    expect(await noHorizontalScroll(page)).toBe(true);
    await page.getByTestId(`answer-${d.question!.answer}`).tap();
    await expect(page.getByTestId("step-completed")).toBeVisible();
    await page.getByTestId("step-next").tap();

    // Repeat: all seven lines (answers as queued by the caller).
    await expect(page).toHaveURL(new RegExp(`step-${first + 1}$`));
    calls.uploads.length = 0;
    await page.getByTestId("start-button").tap();
    await expect(page.getByTestId("dialogue-done")).toBeVisible({ timeout: 180_000 });
    expect([...new Set(calls.uploads)]).toEqual([...new Set(d.lines.map((l) => l.exercise.target))]);
    expect(await noHorizontalScroll(page)).toBe(true);
    // Role-play: loaded fresh, so every line the app speaks is a new /api/tts request (no browser cache).
    await expect(page.getByTestId("step-next")).toHaveAttribute("href", `/a1/lesson-1/sabah-al-khayr/step-${first + 2}`);
    await page.goto(`/a1/lesson-1/sabah-al-khayr/step-${first + 2}`);

    // Role-play: the learner's lines only; the app speaks the other role (and never the learner's voice).
    // One role, then the other one (the first is marked done): only both complete the step.
    const other = d.speakers.find((s) => s.id !== role)!.id;
    for (const [k, speaker] of [role, other].entries()) {
      calls.tts.length = 0;
      calls.uploads.length = 0;
      if (k === 0) await page.getByTestId(`role-${speaker}`).tap();
      else {
        await page.getByTestId("dialogue-next-role").tap();
        await expect(page.getByTestId(`role-done-${role}`)).toBeVisible();
        await expect(page.getByTestId(`role-${speaker}`)).toHaveAttribute("aria-pressed", "true");
      }
      await page.getByTestId("start-button").tap();
      await expect(page.getByTestId("dialogue-done")).toBeVisible({ timeout: 180_000 });
      expect(calls.uploads).toEqual(d.lines.filter((l) => l.speaker === speaker).map((l) => l.exercise.target));
      expect(calls.tts.filter((t) => t.voice === voiceOf(speaker))).toEqual([]);
      expect(calls.tts.filter((t) => t.text !== "Super!").map((t) => t.text)).toEqual(d.lines.filter((l) => l.speaker !== speaker).map((l) => l.arabic));
      if (k === 0) await expect(page.getByTestId("step-completed")).toBeHidden();
    }
    await expect(page.getByTestId("step-completed")).toBeVisible();
    await page.getByTestId("step-next").tap();
  }

  test("both conversations: Anhören → Nachsprechen → Rollenspiel, then Buchstaben finden", async ({ page }) => {
    test.setTimeout(600_000);
    const errors = collectPageErrors(page);
    await syntheticVoice(page);
    const calls = await mock(page, [true, false]); // men, line 2: one wrong attempt first – it stays, then it is right

    await page.goto("/a1/lesson-1");
    await page.getByTestId("unit-entry-sabah-al-khayr").tap();
    await expect(page).toHaveURL(/\/a1\/lesson-1\/sabah-al-khayr\/step-1$/);
    await expect(page.locator('[data-testid^="step-tab-"]')).toHaveText([/Anhören 1/, /Nachsprechen 1/, /Rollenspiel 1/, /Anhören 2/, /Nachsprechen 2/, /Rollenspiel 2/, /Buchstaben finden/]);
    // Ahmad (first speaker) on the right, Ali on the left.
    const ahmad = (await page.getByTestId("avatar-ahmad").first().boundingBox())!;
    const ali = (await page.getByTestId("avatar-ali").first().boundingBox())!;
    expect(ahmad.x).toBeGreaterThan(ali.x);

    await conversation(page, calls, menDialogue, 1, "ali");
    await conversation(page, calls, womenDialogue, 4, "nabila");

    // The letters (unchanged), now step 7.
    await expect(page).toHaveURL(/step-7$/);
    await page.getByTestId("start-button").tap();
    const find = getA1Lesson("lesson-1", "sabah-al-khayr")!.steps[6]!;
    if (find.kind !== "gaps") throw new Error("step-7 must be the letters");
    await answerGaps(page, find.gaps.items);

    const progress = await page.evaluate(() => JSON.parse(localStorage.getItem("alif:progress:v1") ?? "{}"));
    for (const n of [1, 2, 3, 4, 5, 6, 7]) expect(progress[`a1/lesson-1/sabah-al-khayr/step-${n}`]?.completedAt, `step-${n}`).toBeTruthy();
    expect(errors).toEqual([]);
  });

  test("Nachsprechen without a microphone: buttons with the same evaluation", async ({ page }) => {
    await page.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException("denied", "NotAllowedError"));
    });
    await mock(page);
    await page.goto("/a1/lesson-1/sabah-al-khayr/step-5");
    await page.getByTestId("start-button").tap();
    await expect(page.getByTestId("dialogue-note")).toContainText("Das Mikrofon ist nicht verfügbar.");
    for (const line of womenDialogue.lines) await expect(page.getByTestId(`exercise-${line.id}-record`)).toBeVisible();
    expect(await noHorizontalScroll(page)).toBe(true);
  });
});

test.describe("desktop", () => {
  test.use({ viewport: { width: 1366, height: 900 } });

  test("the conversation as chat bubbles: Arabic RTL, transliteration and German LTR, speakers on both sides", async ({ page }) => {
    await page.goto("/a1/lesson-1/sabah-al-khayr/step-4");
    const first = womenDialogue.lines[0]!.id;
    await expect(page.getByTestId(`line-arabic-${first}`)).toHaveAttribute("dir", "rtl");
    await expect(page.getByTestId(`line-translit-${first}`)).toHaveAttribute("dir", "ltr");
    await expect(page.getByTestId(`line-german-${first}`)).toHaveAttribute("dir", "ltr");
    const bubble = (await page.getByTestId(`dialogue-line-${first}`).boundingBox())!;
    const fatima = (await page.getByTestId("avatar-fatima").first().boundingBox())!;
    const nabila = (await page.getByTestId("avatar-nabila").first().boundingBox())!;
    expect(nabila.x).toBeGreaterThan(fatima.x);
    expect(bubble.width).toBeGreaterThan(500);
    await expect(page.getByTestId("dialogue-lines").locator('[data-testid^="dialogue-line-"]')).toHaveCount(7);
    expect(await noHorizontalScroll(page)).toBe(true);
  });
});
