import { expect, test, type Locator, type Page } from "@playwright/test";

import { a1Unit2 } from "../src/data/a1/lesson-2";
import { adnanKhalidDialogue, nazikDinaDialogue } from "../src/data/a1/lesson-2/masa-al-khayr";
import { positionCards } from "../src/lib/arabic/positions";
import { pickTokens } from "../src/lib/arabic/word-pick";
import type { A1Lesson, A1Step, Dialogue } from "../src/data/types";
import { hasHand, splitTiles } from "../src/lib/arabic/letter-form";
import { buildAssessment } from "../src/lib/pronunciation/assessment";
import { toneWav } from "./support/audio";
import { collectPageErrors, openButtonMode, parseUpload, recordExercise, refuseGuidedMicrophone } from "./support/helpers";
import type { GapItem } from "../src/data/types";
import { gapTask } from "../src/lib/arabic/gap";
import { boardPoints, excellentPhonemes, noHorizontalScroll, scrollY, syntheticVoice, touchStroke } from "./support/letters";

// A1 · Lektion 2 "مَسَاءُ الْخَيْر" on a phone (390 px) and on a desktop – from the
// lesson data only: Lektion 1 → Lektion 2; every letter (د ذ و ي) step by step
// (Wörter with pictures and evaluated sounds, Formen, Schreiben with every form
// traced, Ergänzen, Hören, Nachsprechen & schreiben, Aussprechen, Diktat); the
// long vowels (listen and compare, exercises 1–9); both evening conversations
// (listen, repeat with a wrong answer first, role-play), grammar, exercises 2
// and 3 with finger taps on the letters, the long vowels in the conversations
// and "تذكر". TTS and the pronunciation evaluation are MOCKED (answers built by
// the app's real rules from simulated IQRA input); the browser, the microphone
// path (synthetic voice / fake device), the WAV upload, the geometry and the
// flow are real.

const entry = (slug: string) => a1Unit2.lessons.find((l) => l.slug === slug)!;
const stepOf = <K extends A1Step["kind"]>(lesson: A1Lesson, slug: string, kind: K) => {
  const step = lesson.steps.find((s) => s.slug === slug)!;
  if (step.kind !== kind) throw new Error(`${lesson.slug}/${slug} must be ${kind}`);
  return step as Extract<A1Step, { kind: K }>;
};
const progress = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem("alif:progress:v1") ?? "{}"));

type Calls = { tts: Array<{ text: string; voice: string }>; uploads: string[] };

/** /api/tts records text + voice; /api/pronunciation answers "excellent" (from the target's own rule) unless the queue says false. */
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
      masaar: null,
      iqra: { sequence: phonemes.join(" "), phonemes, duration: 0.6 },
    });
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
  });
  return calls;
}

/** Answers every item of a gap step (tile, then the active gap; several gaps right to left) and waits for the result. */
async function answerGaps(page: Page, items: GapItem[]) {
  for (const [i, item] of items.entries()) {
    await expect(page.getByTestId("gap-item")).toHaveAttribute("data-item", item.id, { timeout: 15_000 });
    expect(await noHorizontalScroll(page), item.arabic).toBe(true);
    // The word's row fits the card: no slot sticks out of it.
    const card = (await page.getByTestId("gap-item").boundingBox())!;
    for (const box of await page.getByTestId("gap-slot").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON())))
      expect(box.left >= card.x - 1 && box.right <= card.x + card.width + 1, `${item.arabic}: slot inside the card`).toBe(true);
    for (const gap of gapTask(item).gaps) {
      await page.locator(`[data-choice="${gap.answer}"]`).tap();
      await page.locator('[data-testid="gap-slot"][data-active="true"]').tap();
    }
    await expect(page.getByTestId("gap-shaped")).toContainText(item.arabic);
    expect(await noHorizontalScroll(page), item.arabic).toBe(true);
    if (i < items.length - 1) await page.getByTestId("gap-next").tap();
  }
  await expect(page.getByTestId("gap-result")).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("step-completed")).toHaveText(/Geschafft/);
}

/** A finger tap on the middle of a letter's glyph (the letter buttons lie exactly on their glyphs). */
async function tapLetter(page: Page, letter: Locator) {
  await letter.scrollIntoViewIfNeeded();
  const box = (await letter.boundingBox())!;
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height * 0.6);
}

async function next(page: Page, lesson: A1Lesson, n: number) {
  await page.getByTestId("step-next").tap();
  await expect(page).toHaveURL(new RegExp(`/a1/lesson-2/${lesson.slug}/step-${n}$`));
  await expect(page.getByTestId("step-position")).toHaveText(`Schritt ${n} von ${lesson.steps.length}`);
}

async function schreiben(page: Page, lesson: A1Lesson, slug: string) {
  const { letterSet } = stepOf(lesson, slug, "writing");
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
  expect(await noHorizontalScroll(page)).toBe(true);
}

/** The Formen step of Lektion 1 (for ي): Zuschauen, Baue das Wort, Wer hält fest?, Wo steht das …? */
async function formen(page: Page, lesson: A1Lesson) {
  const { forms } = stepOf(lesson, "step-2", "forms");
  await page.getByTestId("start-button").tap();
  const nextButton = page.getByTestId("explain-next");
  for (let i = 0; i < 5 && !/Weiter zur Übung/.test(await nextButton.innerText()); i++) await nextButton.tap();
  await nextButton.tap();
  for (const word of forms.build) {
    for (const [i, tile] of splitTiles(word.arabic).entries()) {
      await page.getByTestId(`tile-${tile}`).first().tap();
      await page.getByTestId(`slot-${i}`).tap();
    }
    await expect(page.getByTestId(`build-word-${word.id}`)).toHaveAttribute("data-phase", "done");
    expect(await noHorizontalScroll(page), `built ${word.id}`).toBe(true);
    await page.getByTestId("build-next").tap();
  }
  const withHand = forms.neighbors.find(hasHand)!;
  const without = forms.neighbors.find((n) => !hasHand(n))!;
  const drop = async (letter: string, side: "left" | "right") => {
    await page.getByTestId(`neighbor-${letter}`).tap();
    await page.getByTestId(`zone-${side}`).tap();
  };
  await drop(without, "left");
  await drop(withHand, "right");
  await drop(without, "right");
  await drop(withHand, "left");
  await expect(page.getByTestId("rule-card")).toContainText("Das Ya hat eine Hand.");
  await page.getByTestId("neighbors-next").tap();
  for (let i = 0; i < forms.sort.length; i++) {
    const word = page.getByTestId("sort-word");
    await expect(word).toHaveAttribute("data-phase", "ask");
    await page.getByTestId(`basket-${await word.getAttribute("data-expected")}`).tap();
    await expect(page.getByTestId("sort-shaped")).toBeVisible();
    if (i < forms.sort.length - 1) await expect(word).toHaveAttribute("data-phase", "ask", { timeout: 5000 });
  }
  await expect(page.getByTestId("sort-done")).toBeVisible();
}

test.describe("phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("from the end of Lektion 1 to Lektion 2; its contents in book order", async ({ page }) => {
    const errors = collectPageErrors(page);
    await mock(page);
    await page.goto("/a1/lesson-1/tahiyya-wa-taqdim/step-6");
    await expect(page.getByTestId("next-entry")).toContainText("Lektion 2");
    await page.getByTestId("next-entry").tap();
    await expect(page).toHaveURL(/\/a1\/lesson-2\/dal\/step-1$/);
    await page.goto("/a1");
    await expect(page.getByTestId("a1-lesson-lesson-2")).toContainText("مَسَاءُ الْخَيْر");
    await expect(page.getByTestId("a1-lesson-lesson-2-letters")).toHaveText("د · ذ · و · ي");
    await page.getByTestId("a1-lesson-lesson-2").tap();
    await expect(page).toHaveURL(/\/a1\/lesson-2$/);
    await expect(page.getByTestId("unit-title")).toHaveText("مَسَاءُ الْخَيْر");
    await expect(page.locator('[data-testid^="unit-entry-"][data-testid$="-label"]')).toHaveText(["د", "ذ", "و", "ي", "حُرُوفُ الْمَدّ", "مَسَاءُ الْخَيْر"]);
    expect(await noHorizontalScroll(page)).toBe(true);
    // Lektion 1 still has its ten entries and its routes.
    await page.goto("/a1/lesson-1");
    await expect(page.locator('[data-testid^="unit-entry-"][data-testid$="-label"]')).toHaveCount(10);
    expect(errors).toEqual([]);
  });

  for (const slug of ["dal", "dhal", "waw", "ya"]) {
    test(`${slug}: every step – Wörter, Formen, Schreiben, Ergänzen, Hören, Nachsprechen & schreiben, Aussprechen, Diktat`, async ({ page }) => {
      test.setTimeout(420_000);
      const lesson = entry(slug);
      const errors = collectPageErrors(page);
      const calls = await mock(page);
      await refuseGuidedMicrophone(page);

      await page.goto("/a1/lesson-2");
      await page.getByTestId(`unit-entry-${slug}`).tap();
      await expect(page).toHaveURL(new RegExp(`/a1/lesson-2/${slug}/step-1$`));
      await expect(page.getByTestId("step-instruction-arabic")).toContainText("النُّطْقُ");

      // 1 Wörter: every picture loads; the three sounds are spoken and evaluated (button page).
      const { groups } = stepOf(lesson, "step-1", "sound-words");
      for (const word of groups.flatMap((g) => g.words)) {
        const img = page.getByTestId(`vocab-image-${word.id}`);
        await expect(img).toHaveAttribute("src", word.image!.src);
        await img.scrollIntoViewIfNeeded();
        await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0), { message: word.image!.src }).toBe(true);
      }
      expect(await noHorizontalScroll(page)).toBe(true);
      await openButtonMode(page);
      for (const { sound } of groups) {
        await recordExercise(page, sound.id, 800);
        await expect(page.getByTestId(`exercise-${sound.id}-feedback-headline`)).toHaveText("مُمْتَاز! 👏");
      }
      expect(calls.uploads).toEqual(groups.map((g) => g.sound.glyph));
      // One word too: its own rule.
      const firstWord = groups[0]!.words[0]!;
      await recordExercise(page, firstWord.id, 800);
      await expect(page.getByTestId(`exercise-${firstWord.id}-feedback-headline`)).toHaveText("مُمْتَاز! 👏");
      expect(calls.uploads.at(-1)).toBe(firstWord.exercise.target);

      // 2 Formen.
      await next(page, lesson, 2);
      if (slug === "ya") {
        await formen(page, lesson);
      } else {
        const positions = stepOf(lesson, "step-2", "positions").positions;
        const cards = positionCards(positions);
        // A wrong letter first (in the first word, the letter after the target).
        const wrong = page.getByTestId(`find-tile-${cards[0]!.id}:0:1`);
        await tapLetter(page, wrong);
        await expect(page.getByTestId(`position-feedback-${cards[0]!.id}`)).toContainText(`kein ${positions.letter}`);
        for (const card of cards) {
          await tapLetter(page, page.getByTestId(`find-tile-${card.targetKey}`));
          await expect(page.getByTestId(`position-${card.id}`)).toHaveAttribute("data-found", "true");
        }
        await expect(page.getByTestId("step-completed")).toBeVisible();
        await page.getByTestId(`position-listen-${cards[0]!.id}`).tap();
        await expect.poll(() => calls.tts.map((t) => t.text)).toContain(cards[0]!.word);
      }
      expect(await noHorizontalScroll(page)).toBe(true);

      // 3 Schreiben – every form.
      await next(page, lesson, 3);
      await schreiben(page, lesson, "step-3");

      // 4 Ergänzen, 5 Hören, 6 Nachsprechen & schreiben.
      for (const n of [4, 5, 6]) {
        await next(page, lesson, n);
        if (n === 6) await expect(page.getByTestId("step-instruction-note")).toContainText("Übungen 5–7");
        await page.getByTestId("start-button").tap();
        if (n === 6) await expect(page.getByTestId("gap-repeat")).toContainText("nicht bewertet");
        await answerGaps(page, stepOf(lesson, `step-${n}`, "gaps").gaps.items);
      }

      // 7 Aussprechen (تدريب ٨): every vocalised letter, evaluated by its sound rule.
      await next(page, lesson, 7);
      const items = stepOf(lesson, "step-7", "phrases").groups.flatMap((g) => g.items);
      calls.uploads.length = 0;
      for (const item of items) {
        await recordExercise(page, item.id, 800);
        await expect(page.getByTestId(`phrase-passed-${item.id}`)).toBeVisible({ timeout: 15_000 });
      }
      expect(calls.uploads).toEqual(items.map((i) => i.arabic));
      await expect(page.getByTestId("step-completed")).toBeVisible();

      // 8 Diktat (تدريب ٩): each gap with its own tiles.
      await next(page, lesson, 8);
      await page.getByTestId("start-button").tap();
      await answerGaps(page, stepOf(lesson, "step-8", "gaps").gaps.items);

      // The last step: back to the lesson, or on to the next entry.
      await expect(page.getByTestId("next-entry")).toHaveAttribute("href", `/a1/lesson-2/${a1Unit2.lessons[a1Unit2.lessons.indexOf(lesson) + 1]!.slug}`);
      const p = await progress(page);
      // Wörter (step 1) is complete once every word was spoken right in the guided flow (as in Lektion 1);
      // here only the sounds and one word were evaluated on the button page.
      for (let n = 2; n <= 8; n++) expect(p[`a1/lesson-2/${slug}/step-${n}`]?.completedAt, `step-${n}`).toBeTruthy();
      // Refreshing keeps the progress.
      await page.reload();
      expect((await progress(page))[`a1/lesson-2/${slug}/step-8`]?.completedAt).toBeTruthy();
      expect(errors).toEqual([]);
    });
  }

  test("long vowels: listen and compare, then exercises 1, 2, 3, 5, 6, 7, 8, 9", async ({ page }) => {
    test.setTimeout(420_000);
    const lesson = entry("huruf-al-madd");
    const errors = collectPageErrors(page);
    const calls = await mock(page);
    await page.goto("/a1/lesson-2/huruf-al-madd/step-1");

    // 1–3: every example heard (pairs one after the other).
    for (const n of [1, 2, 3]) {
      if (n > 1) await next(page, lesson, n);
      const sections = stepOf(lesson, `step-${n}`, "compare").sections;
      const pair = sections[0]!.rows[0]!;
      calls.tts.length = 0;
      await page.getByTestId(`compare-pair-${sections[0]!.id}-0`).tap();
      await expect.poll(() => calls.tts.map((t) => t.text)).toEqual(pair.map((i) => i.arabic));
      for (const item of sections.flatMap((s) => s.rows.flat())) {
        const button = page.getByTestId(`compare-listen-${item.id}`);
        await button.scrollIntoViewIfNeeded();
        await button.tap();
        await expect(page.getByTestId(`compare-item-${item.id}`)).toHaveAttribute("data-heard", "true");
      }
      await expect(page.getByTestId("step-completed")).toBeVisible();
      expect(await noHorizontalScroll(page)).toBe(true);
    }

    // 4–6: Ergänzen, Hören (ا و ي), Nachsprechen & schreiben.
    for (const n of [4, 5, 6]) {
      await next(page, lesson, n);
      await page.getByTestId("start-button").tap();
      await answerGaps(page, stepOf(lesson, `step-${n}`, "gaps").gaps.items);
    }

    // 7: pictures ↔ words.
    await next(page, lesson, 7);
    const pictures = stepOf(lesson, "step-7", "match").match;
    for (const p of pictures.prompts.filter((p) => !p.example)) {
      await page.getByTestId(`match-prompt-${p.id}`).tap();
      await page.getByTestId(`match-option-${p.answer}`).tap();
    }
    await page.getByTestId("match-check").tap();
    await expect(page.getByTestId("match-done")).toBeVisible();
    expect(await noHorizontalScroll(page)).toBe(true);

    // 8: arrange the letters.
    await next(page, lesson, 8);
    await page.getByTestId("start-button").tap();
    await answerGaps(page, stepOf(lesson, "step-8", "gaps").gaps.items);

    // 9: underline the words without a long vowel (one wrong first).
    await next(page, lesson, 9);
    const pick = stepOf(lesson, "step-9", "word-pick").pick;
    const tokens = pickTokens(pick);
    await page.getByTestId(`pick-word-${tokens.find((t) => !t.target)!.key}`).tap();
    for (const t of tokens.filter((t) => t.target)) await page.getByTestId(`pick-word-${t.key}`).tap();
    await page.getByTestId("pick-check").tap();
    await expect(page.getByTestId("pick-wrong")).toBeVisible();
    await page.getByTestId(`pick-word-${tokens.find((t) => !t.target)!.key}`).tap();
    await page.getByTestId("pick-check").tap();
    await expect(page.getByTestId("pick-done")).toBeVisible();

    // 10: separated letters ↔ words; 11: the dictation.
    await next(page, lesson, 10);
    const letters = stepOf(lesson, "step-10", "match").match;
    for (const p of letters.prompts.filter((p) => !p.example)) {
      await page.getByTestId(`match-prompt-${p.id}`).tap();
      await page.getByTestId(`match-option-${p.answer}`).tap();
    }
    await page.getByTestId("match-check").tap();
    await expect(page.getByTestId("match-result-tut")).toContainText("تُوت");
    await next(page, lesson, 11);
    await page.getByTestId("start-button").tap();
    await answerGaps(page, stepOf(lesson, "step-11", "gaps").gaps.items);

    const p = await progress(page);
    for (let n = 1; n <= 11; n++) expect(p[`a1/lesson-2/huruf-al-madd/step-${n}`]?.completedAt, `step-${n}`).toBeTruthy();
    expect(errors).toEqual([]);
  });

  test("مساء الخير: both conversations (listen, repeat – a wrong answer stays –, role-play), grammar, exercises 2 and 3, long vowels, تذكر", async ({ page }) => {
    test.setTimeout(600_000);
    const lesson = entry("masa-al-khayr");
    const errors = collectPageErrors(page);
    await syntheticVoice(page);
    const calls = await mock(page, [true, false]); // conversation 1, line 2: wrong once – it stays, then right

    const listen = async (d: Dialogue) => {
      await expect(page.getByTestId("dialogue-lines").locator('[data-testid^="dialogue-line-"]')).toHaveCount(7);
      calls.tts.length = 0;
      await page.getByTestId("dialogue-play-all").tap();
      await expect(page.getByTestId("dialogue-question")).toBeVisible({ timeout: 30_000 });
      const voiceOf = (speaker: string) => d.speakers.find((s) => s.id === speaker)!.voice;
      expect(calls.tts.filter((t) => t.text !== "Super!").map((t) => `${t.voice}|${t.text}`)).toEqual(d.lines.map((l) => `${voiceOf(l.speaker)}|${l.arabic}`));
      await page.getByTestId(`answer-${d.question!.answer}`).tap();
      await expect(page.getByTestId("step-completed")).toBeVisible();
    };
    const repeat = async (d: Dialogue) => {
      calls.uploads.length = 0;
      await page.getByTestId("start-button").tap();
      await expect(page.getByTestId("dialogue-done")).toBeVisible({ timeout: 180_000 });
      expect([...new Set(calls.uploads)]).toEqual([...new Set(d.lines.map((l) => l.exercise.target))]);
    };

    await page.goto("/a1/lesson-2/masa-al-khayr/step-1");
    await expect(page.getByTestId("step-instruction-arabic")).toContainText("كَرِّرْ بَعْدَ الْمُدَرِّسِ ثُمَّ أَجِبْ");
    await listen(adnanKhalidDialogue);
    await next(page, lesson, 2);
    await repeat(adnanKhalidDialogue);
    expect(calls.uploads.filter((t) => t === adnanKhalidDialogue.lines[1]!.exercise.target)).toHaveLength(2); // the wrong one was repeated
    await next(page, lesson, 3);
    await listen(nazikDinaDialogue);
    await next(page, lesson, 4);
    await repeat(nazikDinaDialogue);
    expect(await noHorizontalScroll(page)).toBe(true);

    // 5 Grammatik.
    await next(page, lesson, 5);
    await expect(page.getByTestId("table-cell-name-0-0")).toHaveAttribute("data-gender", "m");
    await page.getByTestId("quiz-reply-option-0").tap();
    await page.getByTestId("quiz-ask-man-option-1").tap();
    await page.getByTestId("quiz-ask-woman-option-0").tap();
    await expect(page.getByTestId("step-completed")).toBeVisible();
    expect(await noHorizontalScroll(page)).toBe(true);

    // 6, 7 Übung 1 – role-play: Khalid (the app is Adnan), then Nazik (the app is Dina).
    for (const [n, d, role] of [[6, adnanKhalidDialogue, "khalid"], [7, nazikDinaDialogue, "nazik"]] as const) {
      await next(page, lesson, n);
      await page.reload(); // fresh, so every line the app speaks is a new /api/tts request
      calls.tts.length = 0;
      calls.uploads.length = 0;
      await page.getByTestId(`role-${role}`).tap();
      await page.getByTestId("start-button").tap();
      await expect(page.getByTestId("dialogue-done")).toBeVisible({ timeout: 180_000 });
      expect(calls.uploads).toEqual(d.lines.filter((l) => l.speaker === role).map((l) => l.exercise.target));
      expect(calls.tts.filter((t) => t.text !== "Super!").map((t) => t.text)).toEqual(d.lines.filter((l) => l.speaker !== role).map((l) => l.arabic));
      await expect(page.getByTestId("step-completed")).toBeVisible();
    }

    // 8, 9 Übung 2 and 3: finger taps on the letters in both conversations.
    for (const n of [8, 9]) {
      await next(page, lesson, n);
      const targets = page.locator('[data-testid^="find-tile-"][data-target="true"]');
      const count = await targets.count();
      expect(count).toBe(n === 8 ? 5 : 15);
      for (let i = 0; i < count; i++) await tapLetter(page, targets.nth(i));
      await page.getByTestId("find-check").tap();
      await expect(page.getByTestId("find-done")).toBeVisible();
      expect(await noHorizontalScroll(page)).toBe(true);
    }

    // 10 the long vowels in the conversations, and their letter.
    await next(page, lesson, 10);
    const pick = stepOf(lesson, "step-10", "word-pick").pick;
    const found = pickTokens(pick).filter((t) => t.target);
    for (const t of found) await page.getByTestId(`pick-word-${t.key}`).tap();
    await page.getByTestId("pick-check").tap();
    for (const t of [...new Map(found.map((t) => [t.word, t])).values()]) for (const kind of t.madd) await page.getByTestId(`pick-kind-${t.word}-${kind}`).tap();
    await page.getByTestId("pick-kinds-check").tap();
    await expect(page.getByTestId("pick-done")).toBeVisible();

    // 11 تذكر.
    await next(page, lesson, 11);
    await page.getByTestId("quiz-long-option-1").tap();
    await page.getByTestId("quiz-short-option-2").tap();
    await page.getByTestId("quiz-morning-option-1").tap();
    await page.getByTestId("quiz-woman-option-1").tap();
    await expect(page.getByTestId("step-completed")).toBeVisible();
    await expect(page.getByTestId("back-to-unit-end")).toHaveAttribute("href", "/a1/lesson-2");
    await expect(page.getByTestId("next-entry")).toHaveCount(0); // the last entry of A1 so far

    const p = await progress(page);
    for (let n = 1; n <= 11; n++) expect(p[`a1/lesson-2/masa-al-khayr/step-${n}`]?.completedAt, `step-${n}`).toBeTruthy();
    expect(errors).toEqual([]);
  });
});

for (const [name, viewport] of [["phone", { width: 390, height: 844 }], ["desktop", { width: 1366, height: 900 }]] as const) {
  test(`${name}: every step of Lektion 2 renders without errors and without horizontal scrolling`, async ({ page }) => {
    test.setTimeout(300_000);
    await page.setViewportSize(viewport);
    const errors = collectPageErrors(page);
    await mock(page);
    for (const lesson of a1Unit2.lessons) {
      for (const step of lesson.steps) {
        await page.goto(`/a1/lesson-2/${lesson.slug}/${step.slug}`);
        await expect(page.getByTestId("entry-title")).toContainText(lesson.labelGerman);
        if (step.instruction) await expect(page.getByTestId("step-instruction-german")).toBeVisible();
        expect(await noHorizontalScroll(page), `${lesson.slug}/${step.slug}`).toBe(true);
      }
    }
    expect(errors).toEqual([]);
  });
}

test.describe("desktop", () => {
  test.use({ viewport: { width: 1366, height: 900 } });

  test("layouts: positions as a grid, the matching in two columns, tables right to left, the conversation as chat bubbles", async ({ page }) => {
    await mock(page);
    await page.goto("/a1/lesson-2/waw/step-2");
    const a = (await page.getByTestId("position-start").boundingBox())!;
    const b = (await page.getByTestId("position-middle").boundingBox())!;
    expect(Math.round(a.y)).toBe(Math.round(b.y)); // side by side
    expect(a.x).toBeGreaterThan(b.x); // book order right to left
    await page.goto("/a1/lesson-2/huruf-al-madd/step-7");
    const prompts = (await page.getByTestId("match-prompts").boundingBox())!;
    const options = (await page.getByTestId("match-options").boundingBox())!;
    expect(Math.abs(prompts.y - options.y)).toBeLessThan(60);
    await page.goto("/a1/lesson-2/masa-al-khayr/step-5");
    const m = (await page.getByTestId("table-cell-name-0-0").boundingBox())!;
    const f = (await page.getByTestId("table-cell-name-0-1").boundingBox())!;
    expect(m.x).toBeGreaterThan(f.x); // masculine column on the right, as in the book
    await page.goto("/a1/lesson-2/masa-al-khayr/step-1");
    const adnan = (await page.getByTestId("avatar-adnan").first().boundingBox())!;
    const khalid = (await page.getByTestId("avatar-khalid").first().boundingBox())!;
    expect(adnan.x).toBeGreaterThan(khalid.x);
    for (const src of ["/images/a1/masa-al-khayr/adnan.svg", "/images/a1/masa-al-khayr/nazik.svg"]) expect((await page.request.get(src)).status()).toBe(200);
  });
});
