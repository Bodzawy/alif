import { expect, test, type Page } from "@playwright/test";

import { a1Entries, a1StepHref } from "../src/data/a1";
import { tableStacking } from "../src/components/a1/table/layout";
import { collectPageErrors } from "./support/helpers";
import { noHorizontalScroll } from "./support/letters";

// A1 · every grammar table ("لاحظ القواعد", "تذكر") at phone, tablet and
// desktop width. Checking only the page's horizontal scrolling missed tables
// whose words overlapped: the table's frame clips what does not fit. Here every
// visible cell is measured – no text wider than its box, nothing sticking out
// of its cell, the table not wider than its frame – and on small screens a wide
// table must be shown as one card per column (heading on top, the column's
// cells below), on larger screens as the table.

const tableSteps = a1Entries().flatMap(({ unit, lesson }) =>
  lesson.steps.flatMap((step) => (step.kind === "table" ? [{ url: a1StepHref(unit, lesson, step.slug), tables: step.tables }] : []))
);

const BREAKPOINT = { sm: 640, md: 768, lg: 1024 } as const;

/** Cells (table cells, card lines, card headings) whose content does not fit, and tables that scroll inside their frame. */
function misfits(page: Page) {
  return page.evaluate(() => {
    const out: string[] = [];
    for (const section of document.querySelectorAll<HTMLElement>('[data-testid="table-step"] section[data-testid^="table-"]:not([data-testid="table-quiz"])')) {
      const id = section.dataset.testid!.replace(/^table-/, "");
      for (const cell of section.querySelectorAll<HTMLElement>('td, th, [data-testid^="table-card-cell-"], [data-testid^="table-card-heading-"]')) {
        if (cell.getClientRects().length === 0) continue;
        const box = cell.getBoundingClientRect();
        const bad = [...cell.querySelectorAll<HTMLElement>("*")].some((el) => {
          if (el.getClientRects().length === 0) return false;
          const r = el.getBoundingClientRect();
          return (el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1) || r.right > box.right + 1 || r.left < box.left - 1;
        });
        if (bad) out.push(`${id}: ${cell.dataset.testid ?? cell.tagName}`);
      }
      const frame = section.querySelector<HTMLElement>('[data-testid^="table-frame-"]');
      if (frame && frame.getClientRects().length > 0 && frame.scrollWidth > frame.clientWidth + 1) out.push(`${id}: wider than its frame`);
    }
    return out;
  });
}

for (const width of [360, 390, 700, 900, 1366]) {
  test(`${width} px: every grammar table fits – no overlapping or cut-off words; cards per column where the table is too wide`, async ({ page }) => {
    test.setTimeout(300_000);
    await page.setViewportSize({ width, height: 900 });
    const errors = collectPageErrors(page);
    for (const { url, tables } of tableSteps) {
      await page.goto(url);
      await expect(page.getByTestId("table-step")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      expect(await misfits(page), url).toEqual([]);
      expect(await noHorizontalScroll(page), url).toBe(true);
      for (const table of tables) {
        const stack = tableStacking(table);
        const cards = stack !== null && width < BREAKPOINT[stack];
        await expect(page.getByTestId(`table-frame-${table.id}`), `${url} #${table.id}`).toBeVisible({ visible: !cards });
        if (stack !== null) await expect(page.getByTestId(`table-cards-${table.id}`), `${url} #${table.id}`).toBeVisible({ visible: cards });
      }
    }
    expect(errors).toEqual([]);
  });
}

test.describe("phone", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test("مَنْ أَنْتَ؟: one card per column – مُفْرَدٌ مُذَكَّرٌ on top, أَنْتَ؟ and below it أَنَا مُحَمَّد; Anhören beside each word", async ({ page }) => {
    await page.goto("/a1/lesson-4/man-anta/step-5");
    await expect(page.getByTestId("table-frame-man")).toBeHidden();
    const card = page.getByTestId("table-card-man-0");
    await expect(page.getByTestId("table-card-heading-man-0")).toContainText("مُفْرَدٌ مُذَكَّرٌ");
    await expect(page.getByTestId("table-card-heading-man-0")).toContainText("ein Mann");
    const question = card.getByTestId("table-card-cell-man-0-0");
    const reply = card.getByTestId("table-card-cell-man-1-0");
    await expect(question).toContainText("أَنْتَ؟");
    await expect(question).toContainText("du (Mann)");
    await expect(question).toContainText("zu einem Mann");
    await expect(question).toHaveAttribute("data-gender", "m");
    await expect(reply).toContainText("أَنَا مُحَمَّد");
    await expect(reply).toContainText("Ich bin Muhammad.");
    const q = (await question.boundingBox())!;
    const a = (await reply.boundingBox())!;
    expect(a.y).toBeGreaterThanOrEqual(q.y + q.height - 1); // the answer below the question
    const c0 = (await card.boundingBox())!;
    const c1 = (await page.getByTestId("table-card-man-1").boundingBox())!;
    expect(c1.y).toBeGreaterThan(c0.y + c0.height); // the next column's card below
    expect(c0.width).toBeGreaterThan(330); // the full width of the screen
    await expect(page.getByTestId("table-card-heading-man-1")).toContainText("eine Frau");
    const listen = (await question.getByRole("button").boundingBox())!;
    const word = (await question.locator('span[lang="ar"]').boundingBox())!;
    expect(listen.x + listen.width).toBeLessThan(word.x); // the button on the left, the word on the right
  });

  test("the alphabet stays a table (single letters fit side by side)", async ({ page }) => {
    await page.goto("/a1/lesson-6/al-huruf/step-1");
    await expect(page.getByTestId("table-alphabet").locator("thead")).toBeVisible();
    const a = (await page.getByTestId("table-cell-alphabet-1-0").boundingBox())!;
    const b = (await page.getByTestId("table-cell-alphabet-1-1").boundingBox())!;
    expect(Math.round(a.y)).toBe(Math.round(b.y)); // side by side
  });
});
