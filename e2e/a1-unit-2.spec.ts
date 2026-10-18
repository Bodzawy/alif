import { expect, test, type Locator, type Page } from "@playwright/test";

import { a1Unit3, a1Unit4 } from "../src/data/a1/unit-2";
import { manAntaA, manAntaB, suziDialogue, wajdiDialogue } from "../src/data/a1/unit-2/conversations";
import type { A1Lesson, A1Step, Dialogue, GapItem } from "../src/data/types";
import { gapTask } from "../src/lib/arabic/gap";
import { positionCards } from "../src/lib/arabic/positions";
import { spellLetters } from "../src/lib/arabic/spell";
import { buildAssessment } from "../src/lib/pronunciation/assessment";
import { toneWav } from "./support/audio";
import { collectPageErrors, openButtonMode, parseUpload, recordExercise, refuseGuidedMicrophone } from "./support/helpers";
import { boardPoints, excellentPhonemes, noHorizontalScroll, scrollY, syntheticVoice, touchStroke } from "./support/letters";

// A1 · Lektion 3 und 4 = the book's Unit 2 ("وجدي.pdf") on a phone (390 px)
// and a desktop – from the lesson data only: every letter (ر … ن) through all
// ten steps (pictures load, sounds evaluated, the letter tapped in each word,
// EVERY form traced stroke by stroke with real touch input, all gap exercises,
// the long syllables, the short sounds, the dictation, the separate letters);
// both conversation entries (listen, repeat with a wrong answer first, role-play
// including the role groups), the grammar, the quiz and cloze exercises; the
// general review; and every step rendered without errors or horizontal
// scrolling. TTS and the pronunciation evaluation are MOCKED (answers built by
// the app's real rules from simulated IQRA input); browser, microphone path,
// WAV upload, geometry and flow are real.

const stepOf = <K extends A1Step["kind"]>(lesson: A1Lesson, slug: string, kind: K) => {
  const step = lesson.steps.find((s) => s.slug === slug)!;
  if (step.kind !== kind) throw new Error(`${lesson.slug}/${slug} must be ${kind}`);
  return step as Extract<A1Step, { kind: K }>;
};
const progress = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("alif:progress:v1") ?? "{}"));
type Calls = { tts: Array<{ text: string; voice: string }>; uploads: string[] };

async function mock(page: Page, answers: boolean[] = []) {
  const calls: Calls = { tts: [], uploads: [] };
  await page.route("**/api/tts", async (route) => {
    const body = route.request().postDataJSON();
    calls.tts.push({ text: body.text, voice: body.voice ?? "default" });
    await route.fulfill({ status: 200, contentType: "audio/wav", body: toneWav(200) });
  });
  await page.route("**/api/pronunciation", async (route) => {
    const target = parseUpload(route.request()).target!;
    calls.uploads.push(target);
    const right = answers.shift() ?? true;
    const phonemes = right ? excellentPhonemes(target) : ["a"];
    const body = buildAssessment({
      target,
      primary: { referenceText: target, recognized: target, accuracy: right ? 90 : 40, pronunciation: 80, fluency: 90, completeness: 100, firstSoundScore: 80, words: [] },
      iqra: { sequence: phonemes.join(" "), phonemes, duration: 0.6 },
    });
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });
  return calls;
}

async function tapLetter(page: Page, letter: Locator) {
  await letter.scrollIntoViewIfNeeded();
  const box = (await letter.boundingBox())!;
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height * 0.6);
}

async function answerGaps(page: Page, items: GapItem[]) {
  for (const [i, item] of items.entries()) {
    await expect(page.getByTestId("gap-item")).toHaveAttribute("data-item", item.id, { timeout: 15_000 });
    expect(await noHorizontalScroll(page), item.arabic).toBe(true);
    const card = (await page.getByTestId("gap-item").boundingBox())!;
    for (const box of await page.getByTestId("gap-slot").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON())))
      expect(box.left >= card.x - 1 && box.right <= card.x + card.width + 1, `${item.arabic}: slot inside the card`).toBe(true);
    for (const gap of gapTask(item).gaps) {
      await page.locator(`[data-choice="${gap.answer}"]`).tap();
      await page.locator('[data-testid="gap-slot"][data-active="true"]').tap();
    }
    await expect(page.getByTestId("gap-shaped")).toContainText(item.arabic);
    if (i < items.length - 1) await page.getByTestId("gap-next").tap();
  }
  await expect(page.getByTestId("gap-result")).toBeVisible({ timeout: 15_000 });
}

async function next(page: Page, unit: string, lesson: A1Lesson, n: number) {
  await page.getByTestId("step-next").tap();
  await expect(page).toHaveURL(new RegExp(`/a1/${unit}/${lesson.slug}/step-${n}$`));
}

async function schreiben(page: Page, lesson: A1Lesson) {
  const { letterSet } = stepOf(lesson, "step-3", "writing");
  await expect(page.getByTestId("writing-step")).toHaveAttribute("data-ready", "true");
  await page.getByTestId("writing-board").scrollIntoViewIfNeeded();
  for (const form of letterSet.forms) {
    await expect(page.getByTestId("writing-step")).toHaveAttribute("data-current", form.id, { timeout: 5000 });
    await page.waitForTimeout(400);
    const scrolled = await scrollY(page);
    for (const stroke of form.strokes) {
      if (stroke.dot) {
        const center = (await boardPoints(page, stroke.d, 8))[0]!;
        await touchStroke(page, [{ x: center.x - 3, y: center.y + 2 }]);
      } else {
        await touchStroke(page, await boardPoints(page, stroke.d));
      }
      expect(await scrollY(page)).toBe(scrolled);
    }
    await expect(page.getByTestId(`gray-${form.id}`), form.id).toHaveAttribute("data-done", "traced");
  }
  await expect(page.getByTestId("writing-done")).toBeVisible({ timeout: 5000 });
}

test.describe("phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("A1 shows Lektion 3 and 4 with the book's labels; their contents in book order", async ({ page }) => {
    const errors = collectPageErrors(page);
    await page.goto("/a1");
    await expect(page.getByTestId("a1-group-unit-2")).toContainText("الْوَحْدَةُ الثَّانِيَةُ");
    await expect(page.getByTestId("a1-lesson-lesson-3-letters").getByRole("listitem")).toHaveText(["ر", "ز", "س", "ش", "ص", "ض"]);
    await expect(page.getByTestId("a1-lesson-lesson-4-letters").getByRole("listitem")).toHaveText(["ف", "ق", "ك", "ل", "م", "ن"]);
    await page.getByTestId("a1-lesson-lesson-4").tap();
    await expect(page.locator('[data-testid^="unit-entry-"][data-testid$="-label"]')).toHaveText(["ف", "ق", "ك", "ل", "م", "ن", "مُرَاجَعَةٌ عَامَّة", "مَنْ أَنْتَ؟"]);
    expect(await noHorizontalScroll(page)).toBe(true);
    expect(errors).toEqual([]);
  });

  for (const [unit, lesson] of [...a1Unit3.lessons.map((l) => ["lesson-3", l] as const), ...a1Unit4.lessons.map((l) => ["lesson-4", l] as const)].filter(([, l]) => l.kind === "letter")) {
    test(`${lesson.slug}: all ten steps`, async ({ page }) => {
      test.setTimeout(420_000);
      const errors = collectPageErrors(page);
      const calls = await mock(page);
      await refuseGuidedMicrophone(page);
      await page.goto(`/a1/${unit}`);
      await page.getByTestId(`unit-entry-${lesson.slug}`).tap();
      await expect(page).toHaveURL(new RegExp(`/a1/${unit}/${lesson.slug}/step-1$`));

      // 1 Wörter: pictures load; the three sounds and one word evaluated.
      const { groups } = stepOf(lesson, "step-1", "sound-words");
      for (const word of groups.flatMap((g) => g.words)) {
        const img = page.getByTestId(`vocab-image-${word.id}`);
        await img.scrollIntoViewIfNeeded();
        await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0), { message: word.image!.src }).toBe(true);
      }
      expect(await noHorizontalScroll(page)).toBe(true);
      await openButtonMode(page);
      for (const { sound } of groups) {
        await recordExercise(page, sound.id, 700);
        await expect(page.getByTestId(`exercise-${sound.id}-feedback-headline`)).toHaveText("مُمْتَاز! 👏");
      }
      const firstWord = groups[0]!.words[0]!;
      await recordExercise(page, firstWord.id, 700);
      await expect(page.getByTestId(`exercise-${firstWord.id}-feedback-headline`)).toHaveText("مُمْتَاز! 👏");
      expect(calls.uploads).toEqual([...groups.map((g) => g.sound.glyph), firstWord.exercise.target]);

      // 2 Formen: the letter tapped in every word of the book's table.
      await next(page, unit, lesson, 2);
      for (const card of positionCards(stepOf(lesson, "step-2", "positions").positions)) {
        await tapLetter(page, page.getByTestId(`find-tile-${card.targetKey}`));
        await expect(page.getByTestId(`position-${card.id}`)).toHaveAttribute("data-found", "true");
      }
      await expect(page.getByTestId("step-completed")).toBeVisible();

      // 3 Schreiben: every form.
      await next(page, unit, lesson, 3);
      await schreiben(page, lesson);

      // 4–7 gap exercises.
      for (const n of [4, 5, 6, 7]) {
        await next(page, unit, lesson, n);
        await page.getByTestId("start-button").tap();
        await answerGaps(page, stepOf(lesson, `step-${n}`, "gaps").gaps.items);
      }

      // 8 Aussprechen.
      await next(page, unit, lesson, 8);
      for (const item of stepOf(lesson, "step-8", "phrases").groups.flatMap((g) => g.items)) {
        await recordExercise(page, item.id, 700);
        await expect(page.getByTestId(`phrase-passed-${item.id}`)).toBeVisible({ timeout: 15_000 });
      }

      // 9 Diktat.
      await next(page, unit, lesson, 9);
      await page.getByTestId("start-button").tap();
      const dictation = stepOf(lesson, "step-9", "gaps").gaps.items;
      await answerGaps(page, dictation);

      // 10 Getrennt schreiben.
      await next(page, unit, lesson, 10);
      for (const [i, word] of stepOf(lesson, "step-10", "spell").words.entries()) {
        await expect(page.getByTestId("spell-word")).toHaveText(word.arabic);
        for (const l of spellLetters(word.arabic)) await page.getByTestId(`spell-choice-${l}`).tap();
        await expect(page.getByTestId("spell-feedback")).toContainText("Richtig!");
        expect(await noHorizontalScroll(page)).toBe(true);
        if (i < dictation.length - 1) await page.getByTestId("spell-next").tap();
      }
      await expect(page.getByTestId("step-completed")).toBeVisible();

      const p = await progress(page);
      for (let n = 2; n <= 10; n++) expect(p[`a1/${unit}/${lesson.slug}/step-${n}`]?.completedAt, `step-${n}`).toBeTruthy();
      await page.reload();
      expect((await progress(page))[`a1/${unit}/${lesson.slug}/step-10`]?.completedAt).toBeTruthy();
      expect(errors).toEqual([]);
    });
  }

  /** Lines the page has fetched from /api/tts so far (they are cached by text and voice). */
  const fetched = new Set<string>();
  async function listen(page: Page, calls: Calls, d: Dialogue) {
    await expect(page.getByTestId("dialogue-lines").locator('[data-testid^="dialogue-line-"]')).toHaveCount(d.lines.length);
    calls.tts.length = 0;
    await page.getByTestId("dialogue-play-all").tap();
    await expect(page.getByTestId("dialogue-question")).toBeVisible({ timeout: 60_000 });
    const voiceOf = (id: string) => d.speakers.find((s) => s.id === id)!.voice;
    // In order; a line the app already fetched in this page (the same text and voice – the question asked
    // twice, or the answers of (ب) that (أ) had) comes from its cache.
    const expected = [...new Set(d.lines.map((l) => `${voiceOf(l.speaker)}|${l.arabic}`))].filter((x) => !fetched.has(x));
    expect(calls.tts.map((t) => `${t.voice}|${t.text}`)).toEqual(expected);
    for (const x of expected) fetched.add(x);
    await page.getByTestId(`answer-${d.question!.answer}`).tap();
    await expect(page.getByTestId("step-completed")).toBeVisible();
  }
  async function repeat(page: Page, calls: Calls, d: Dialogue) {
    calls.uploads.length = 0;
    await page.getByTestId("start-button").tap();
    await expect(page.getByTestId("dialogue-done")).toBeVisible({ timeout: 180_000 });
    expect([...new Set(calls.uploads)]).toEqual([...new Set(d.lines.map((l) => l.exercise.target))]);
  }
  async function roleplay(page: Page, calls: Calls, d: Dialogue, role: string, mine: (speaker: string) => boolean) {
    await page.reload();
    calls.tts.length = 0;
    calls.uploads.length = 0;
    await page.getByTestId(`role-${role}`).tap();
    await page.getByTestId("start-button").tap();
    await expect(page.getByTestId("dialogue-done")).toBeVisible({ timeout: 240_000 });
    expect(calls.uploads).toEqual(d.lines.filter((l) => mine(l.speaker)).map((l) => l.exercise.target));
    expect(calls.tts.filter((t) => t.text !== "Super!").map((t) => t.text)).toEqual([...new Set(d.lines.filter((l) => !mine(l.speaker)).map((l) => l.arabic))]);
  }

  test("هَلْ أَنْتَ وَجْدِي؟: both conversations, grammar, role-plays, Übung 3 and 4", async ({ page }) => {
    test.setTimeout(600_000);
    fetched.clear();
    const lesson = a1Unit3.lessons.at(-1)!;
    const errors = collectPageErrors(page);
    await syntheticVoice(page);
    const calls = await mock(page, [true, false]); // conversation 1, line 2: wrong once – it stays
    await page.goto(`/a1/lesson-3/${lesson.slug}/step-1`);
    await listen(page, calls, wajdiDialogue);
    await next(page, "lesson-3", lesson, 2);
    await repeat(page, calls, wajdiDialogue);
    await next(page, "lesson-3", lesson, 3);
    await listen(page, calls, suziDialogue);
    await next(page, "lesson-3", lesson, 4);
    await repeat(page, calls, suziDialogue);
    await next(page, "lesson-3", lesson, 5);
    for (const q of stepOf(lesson, "step-5", "table").quiz) await page.getByTestId(`quiz-${q.id}-option-${q.answer}`).tap();
    await expect(page.getByTestId("step-completed")).toBeVisible();
    await next(page, "lesson-3", lesson, 6);
    await roleplay(page, calls, wajdiDialogue, "walid", (s) => s === "walid");
    await next(page, "lesson-3", lesson, 7);
    await roleplay(page, calls, suziDialogue, "teriz", (s) => s === "teriz");
    await next(page, "lesson-3", lesson, 8);
    for (const item of stepOf(lesson, "step-8", "quiz").items) for (const [n, q] of item.questions.entries()) await page.getByTestId(`quiz-${item.id}-${n}-option-${q.answer}`).tap();
    await expect(page.getByTestId("step-completed")).toBeVisible();
    expect(await noHorizontalScroll(page)).toBe(true);
    await next(page, "lesson-3", lesson, 9);
    await page.getByTestId("start-button").tap();
    await answerGaps(page, stepOf(lesson, "step-9", "gaps").gaps.items);
    await expect(page.getByTestId("next-entry")).toHaveAttribute("href", "/a1/lesson-4/fa");
    const p = await progress(page);
    for (let n = 1; n <= 9; n++) expect(p[`a1/lesson-3/${lesson.slug}/step-${n}`]?.completedAt, `step-${n}`).toBeTruthy();
    expect(errors).toEqual([]);
  });

  test("مراجعة عامة and مَنْ أَنْتَ؟: review, presentations (أ) and (ب), grammar, role groups, Übung 2–7, تذكر", async ({ page }) => {
    test.setTimeout(900_000);
    fetched.clear();
    const errors = collectPageErrors(page);
    await syntheticVoice(page);
    const calls = await mock(page);
    const review = a1Unit4.lessons.find((l) => l.slug === "muraja-amma")!;
    await page.goto("/a1/lesson-4/muraja-amma/step-1");
    const m = stepOf(review, "step-1", "match").match;
    for (const p of m.prompts.filter((p) => !p.example)) {
      await page.getByTestId(`match-prompt-${p.id}`).tap();
      await page.getByTestId(`match-option-${p.answer}`).tap();
    }
    await page.getByTestId("match-check").tap();
    await expect(page.getByTestId("match-done")).toBeVisible();
    for (const n of [2, 3]) {
      await next(page, "lesson-4", review, n);
      await page.getByTestId("start-button").tap();
      await answerGaps(page, stepOf(review, `step-${n}`, "gaps").gaps.items);
    }

    const lesson = a1Unit4.lessons.at(-1)!;
    await page.goto(`/a1/lesson-4/${lesson.slug}/step-1`);
    await listen(page, calls, manAntaA);
    await next(page, "lesson-4", lesson, 2);
    await repeat(page, calls, manAntaA);
    await next(page, "lesson-4", lesson, 3);
    await listen(page, calls, manAntaB);
    await next(page, "lesson-4", lesson, 4);
    await repeat(page, calls, manAntaB);
    await next(page, "lesson-4", lesson, 5);
    for (const q of stepOf(lesson, "step-5", "table").quiz) await page.getByTestId(`quiz-${q.id}-option-${q.answer}`).tap();
    expect(await noHorizontalScroll(page)).toBe(true);
    await next(page, "lesson-4", lesson, 6);
    await roleplay(page, calls, manAntaA, "answers", (s) => s !== "asker");
    for (const n of [7, 8]) {
      await next(page, "lesson-4", lesson, n);
      for (const p of stepOf(lesson, `step-${n}`, "match").match.prompts) {
        await page.getByTestId(`match-prompt-${p.id}`).tap();
        await page.getByTestId(`match-option-${p.answer}`).tap();
      }
      await page.getByTestId("match-check").tap();
      await expect(page.getByTestId("match-done")).toBeVisible();
    }
    for (const n of [9, 10, 11]) {
      await next(page, "lesson-4", lesson, n);
      for (const item of stepOf(lesson, `step-${n}`, "cloze").items) {
        let g = 0;
        for (const line of item.lines)
          for (const part of line.parts) {
            if (typeof part === "string") continue;
            await page.getByTestId(`cloze-gap-${item.id}:${g++}`).tap();
            await page.getByTestId(`cloze-options-${item.id}`).getByTestId(`cloze-option-${part.accept[0]}`).tap();
          }
        await page.getByTestId(`cloze-check-${item.id}`).tap();
        await expect(page.getByTestId(`cloze-${item.id}`)).toHaveAttribute("data-verdict", "right");
      }
      await expect(page.getByTestId("step-completed")).toBeVisible();
      expect(await noHorizontalScroll(page)).toBe(true);
    }
    await next(page, "lesson-4", lesson, 12);
    await roleplay(page, calls, manAntaB, "asker", (s) => s === "asker");
    await next(page, "lesson-4", lesson, 13);
    for (const q of stepOf(lesson, "step-13", "table").quiz) await page.getByTestId(`quiz-${q.id}-option-${q.answer}`).tap();
    await expect(page.getByTestId("step-completed")).toBeVisible();
    await expect(page.getByTestId("next-entry")).toHaveAttribute("href", "/a1/lesson-5/ha");
    const p = await progress(page);
    for (let n = 1; n <= 13; n++) expect(p[`a1/lesson-4/${lesson.slug}/step-${n}`]?.completedAt, `step-${n}`).toBeTruthy();
    expect(errors).toEqual([]);
  });
});

for (const [name, viewport] of [["phone", { width: 390, height: 844 }], ["desktop", { width: 1366, height: 900 }]] as const) {
  test(`${name}: every step of Lektion 3 and 4 renders without errors and without horizontal scrolling; all pictures load`, async ({ page }) => {
    test.setTimeout(420_000);
    await page.setViewportSize(viewport);
    const errors = collectPageErrors(page);
    await mock(page);
    for (const unit of [a1Unit3, a1Unit4])
      for (const lesson of unit.lessons)
        for (const step of lesson.steps) {
          await page.goto(`/a1/${unit.slug}/${lesson.slug}/${step.slug}`);
          await expect(page.getByTestId("entry-title")).toContainText(lesson.labelGerman);
          expect(await noHorizontalScroll(page), `${lesson.slug}/${step.slug}`).toBe(true);
          const broken = await page.evaluate(async () => {
            const imgs = [...document.images];
            for (const i of imgs) {
              i.loading = "eager";
              await new Promise((r) => (i.complete ? r(null) : ((i.onload = r), (i.onerror = r))));
            }
            return imgs.filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => i.src);
          });
          expect(broken, `${lesson.slug}/${step.slug}`).toEqual([]);
        }
    expect(errors).toEqual([]);
  });
}
