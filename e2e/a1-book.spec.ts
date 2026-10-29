import { expect, test, type Locator, type Page } from "@playwright/test";

import { A1_LEVEL } from "../src/data/a1";
import type { A1Lesson, A1Step, A1Unit, GapItem } from "../src/data/types";
import { gapTask } from "../src/lib/arabic/gap";
import { positionCards } from "../src/lib/arabic/positions";
import { buildAssessment } from "../src/lib/pronunciation/assessment";
import { toneWav } from "./support/audio";
import { collectPageErrors, openButtonMode, parseUpload, recordExercise } from "./support/helpers";
import { boardPoints, excellentPhonemes, noHorizontalScroll, scrollY, syntheticVoice, touchStroke } from "./support/letters";

// A1 · the lessons made from "لغتنا الفصحى 1" (Lektion 5 on), on a phone
// (390 px) and a desktop – from the lesson data only. Every entry is worked
// through step by step, whatever the step kind: the pictures load, a word is
// evaluated, the letter tapped in each word, every form traced with real touch
// input, every gap exercise, every phrase spoken, every conversation heard,
// repeated and played as a role (the first role), every table quiz, quiz, cloze,
// order and match task solved – and each step must end "done" and be stored.
// Then every step is rendered on a desktop without errors or horizontal
// scrolling. TTS and the pronunciation evaluation are MOCKED (answers built by
// the app's real rules from simulated IQRA input); browser, microphone path,
// WAV upload, geometry and flow are real.

const bookUnits = A1_LEVEL.units.filter((unit) => unit.number >= 5);
const progress = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("alif:progress:v1") ?? "{}"));

async function mock(page: Page) {
  await page.route("**/api/tts", (route) => route.fulfill({ status: 200, contentType: "audio/wav", body: toneWav(150) }));
  await page.route("**/api/pronunciation", async (route) => {
    const target = parseUpload(route.request()).target!;
    const phonemes = excellentPhonemes(target);
    const body = buildAssessment({
      target,
      primary: { referenceText: target, recognized: target, accuracy: 90, pronunciation: 80, fluency: 90, completeness: 100, firstSoundScore: 80, words: [] },
      iqra: { sequence: phonemes.join(" "), phonemes, duration: 0.6 },
    });
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });
}

/**
 * "Wörter" opens in guided mode: its microphone request (made before the button page exists) is refused so the
 * page falls back to the buttons. Dialogues need the same request – so the refusal holds only
 * while localStorage "e2e:refuse-guided" is set (before a "Wörter" step).
 */
async function refuseGuidedMicrophoneWhenFlagged(page: Page) {
  await page.addInitScript(() => {
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = (constraints) =>
      localStorage.getItem("e2e:refuse-guided") === "1" && !document.querySelector('[data-testid="guided-fallback"]')
        ? Promise.reject(new DOMException("denied", "NotAllowedError"))
        : original(constraints);
  });
}

async function tapLetter(page: Page, letter: Locator) {
  await letter.scrollIntoViewIfNeeded();
  const box = (await letter.boundingBox())!;
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height * 0.6);
}

async function answerGaps(page: Page, items: GapItem[]) {
  await page.getByTestId("start-button").tap();
  for (const [i, item] of items.entries()) {
    await expect(page.getByTestId("gap-item")).toHaveAttribute("data-item", item.id, { timeout: 15_000 });
    expect(await noHorizontalScroll(page), item.arabic).toBe(true);
    for (const gap of gapTask(item).gaps) {
      await page.locator(`[data-choice="${gap.answer}"]`).first().tap();
      await page.locator('[data-testid="gap-slot"][data-active="true"]').tap();
    }
    await expect(page.getByTestId("gap-shaped")).toContainText(item.arabic.replace(/[.؟?]/g, ""));
    if (i < items.length - 1) await page.getByTestId("gap-next").tap();
  }
  await expect(page.getByTestId("gap-result")).toBeVisible({ timeout: 15_000 });
}

async function picturesLoaded(page: Page) {
  return page.evaluate(async () => {
    const imgs = [...document.images];
    for (const i of imgs) {
      i.loading = "eager";
      await new Promise((r) => (i.complete ? r(null) : ((i.onload = r), (i.onerror = r))));
    }
    return imgs.filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => i.src);
  });
}

/** Works through one step; returns true when the step has a "done" state that must be stored. */
async function solve(page: Page, step: A1Step): Promise<boolean> {
  switch (step.kind) {
    case "sound-words":
    case "words": {
      expect(await picturesLoaded(page)).toEqual([]);
      await openButtonMode(page);
      const first = step.kind === "sound-words" ? step.groups[0]!.sound : step.groups[0]!.words[0]!;
      await recordExercise(page, first.id, 700);
      await expect(page.getByTestId(`exercise-${first.id}-feedback-headline`)).toHaveText("Ausgezeichnet! 👏");
      return false;
    }
    case "positions":
      for (const card of positionCards(step.positions)) {
        await tapLetter(page, page.getByTestId(`find-tile-${card.targetKey}`));
        await expect(page.getByTestId(`position-${card.id}`)).toHaveAttribute("data-found", "true");
      }
      return true;
    case "writing": {
      await expect(page.getByTestId("writing-step")).toHaveAttribute("data-ready", "true");
      await page.getByTestId("writing-board").scrollIntoViewIfNeeded();
      for (const form of step.letterSet.forms) {
        await expect(page.getByTestId("writing-step")).toHaveAttribute("data-current", form.id, { timeout: 5000 });
        await page.waitForTimeout(400);
        const scrolled = await scrollY(page);
        for (const stroke of form.strokes) {
          if (stroke.dot) {
            const center = (await boardPoints(page, stroke.d, 8))[0]!;
            await touchStroke(page, [{ x: center.x - 3, y: center.y + 2 }]);
          } else await touchStroke(page, await boardPoints(page, stroke.d));
          expect(await scrollY(page)).toBe(scrolled);
        }
        await expect(page.getByTestId(`gray-${form.id}`), form.id).toHaveAttribute("data-done", "traced");
      }
      await expect(page.getByTestId("writing-done")).toBeVisible({ timeout: 5000 });
      return true;
    }
    case "gaps":
      await answerGaps(page, step.gaps.items);
      return true;
    case "phrases":
      for (const item of step.groups.flatMap((g) => g.items)) {
        await recordExercise(page, item.id, 600);
        await expect(page.getByTestId(`phrase-passed-${item.id}`)).toBeVisible({ timeout: 15_000 });
      }
      return true;
    case "dialogue":
      if (step.mode === "listen") {
        await page.getByTestId("dialogue-play-all").tap();
        await expect(page.getByTestId("dialogue-question")).toBeVisible({ timeout: 90_000 });
        await page.getByTestId(`answer-${step.dialogue.question!.answer}`).tap();
      } else {
        if (step.mode === "roleplay") await page.getByTestId(`role-${(step.dialogue.roles ?? step.dialogue.speakers)[0]!.id}`).tap();
        await page.getByTestId("start-button").tap();
        await expect(page.getByTestId("dialogue-done")).toBeVisible({ timeout: 300_000 });
      }
      return true;
    case "table":
      for (const q of step.quiz) await page.getByTestId(`quiz-${q.id}-option-${q.answer}`).tap();
      return true;
    case "quiz":
      for (const item of step.items) for (const [n, q] of item.questions.entries()) await page.getByTestId(`quiz-${item.id}-${n}-option-${q.answer}`).tap();
      return true;
    case "cloze":
      for (const item of step.items) {
        let g = 0;
        for (const line of item.lines)
          for (const part of line.parts) {
            if (typeof part === "string") continue;
            await page.getByTestId(`cloze-gap-${item.id}:${g++}`).tap();
            await page.getByTestId(`cloze-options-${item.id}`).getByTestId(`cloze-option-${part.options.find((o) => part.accept.includes(o))}`).tap();
          }
        await page.getByTestId(`cloze-check-${item.id}`).tap();
        await expect(page.getByTestId(`cloze-${item.id}`)).toHaveAttribute("data-verdict", "right");
      }
      return true;
    case "order":
      // a wrong line first (unlimited tries), then the right order
      if (step.order.solutions.every((s) => s[0] !== step.order.items.at(-1)!.id)) {
        await page.getByTestId(`order-item-${step.order.items.at(-1)!.id}`).tap();
        await expect(page.getByTestId("order-wrong")).toBeVisible();
      }
      for (const id of step.order.solutions[0]!) await page.getByTestId(`order-item-${id}`).tap();
      return true;
    case "match":
      for (const p of step.match.prompts.filter((p) => !p.example)) {
        await page.getByTestId(`match-prompt-${p.id}`).tap();
        await page.getByTestId(`match-option-${p.answer}`).tap();
      }
      await page.getByTestId("match-check").tap();
      await expect(page.getByTestId("match-done")).toBeVisible();
      return true;
    default:
      return false;
  }
}

async function workThrough(page: Page, unit: A1Unit, lesson: A1Lesson) {
  const errors = collectPageErrors(page);
  await mock(page);
  await syntheticVoice(page);
  await refuseGuidedMicrophoneWhenFlagged(page);
  const stored: string[] = [];
  for (const step of lesson.steps) {
    const refuse = step.kind === "sound-words" || step.kind === "words";
    await page.goto(`/a1/${unit.slug}/${lesson.slug}/${step.slug}`);
    if (refuse !== ((await page.evaluate(() => localStorage.getItem("e2e:refuse-guided"))) === "1")) {
      await page.evaluate((on) => (on ? localStorage.setItem("e2e:refuse-guided", "1") : localStorage.removeItem("e2e:refuse-guided")), refuse);
      await page.reload();
    }
    await expect(page.getByTestId("entry-title")).toContainText(lesson.labelGerman);
    expect(await noHorizontalScroll(page), step.slug).toBe(true);
    if (await solve(page, step)) {
      if (step.kind !== "dialogue" || step.mode === "listen") await expect(page.getByTestId("step-completed").first()).toBeVisible({ timeout: 15_000 });
      stored.push(step.slug);
    }
    expect(await noHorizontalScroll(page), step.slug).toBe(true);
  }
  const p = await progress(page);
  for (const slug of stored) expect(p[`a1/${unit.slug}/${lesson.slug}/${slug}`]?.completedAt, `${lesson.slug}/${slug}`).toBeTruthy();
  expect(errors).toEqual([]);
}

test.describe("phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("A1 lists the book's lessons with their labels; each lesson page lists its entries in book order", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto("/a1");
    for (const unit of bookUnits) await expect(page.getByTestId(`a1-group-${unit.group.id}`).getByTestId(`a1-lesson-${unit.slug}`)).toBeVisible();
    for (const unit of bookUnits) await expect(page.getByTestId(`a1-group-${unit.group.id}`)).toContainText(unit.group.arabic);
    for (const unit of bookUnits) {
      await page.goto(`/a1/${unit.slug}`);
      await expect(page.locator('[data-testid^="unit-entry-"][data-testid$="-label"]')).toHaveText(unit.lessons.map((l) => l.label));
      expect(await noHorizontalScroll(page)).toBe(true);
    }
    expect(errors).toEqual([]);
  });

  for (const unit of bookUnits)
    for (const lesson of unit.lessons)
      test(`${unit.slug}/${lesson.slug}: every step worked through`, async ({ page }) => {
        test.setTimeout(900_000);
        await workThrough(page, unit, lesson);
      });
});

test("desktop: every step of the book's lessons renders without errors and without horizontal scrolling; all pictures load", async ({ page }) => {
  test.setTimeout(900_000);
  await page.setViewportSize({ width: 1366, height: 900 });
  const errors = collectPageErrors(page);
  await mock(page);
  for (const unit of bookUnits)
    for (const lesson of unit.lessons)
      for (const step of lesson.steps) {
        await page.goto(`/a1/${unit.slug}/${lesson.slug}/${step.slug}`);
        await expect(page.getByTestId("entry-title")).toContainText(lesson.labelGerman);
        expect(await noHorizontalScroll(page), `${lesson.slug}/${step.slug}`).toBe(true);
        expect(await picturesLoaded(page), `${lesson.slug}/${step.slug}`).toEqual([]);
      }
  expect(errors).toEqual([]);
});
