import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { hasWideTable, isArabicScript, tableStacking } from "@/components/a1/table/layout";
import { TableStep } from "@/components/a1/table/table-step";
import { a1Entries, a1StepHref } from "@/data/a1";

// A1 · the grammar tables on small screens: a table of three or more columns is
// shown there as one card per column. The cards must carry exactly the table's
// texts – every heading, word, transliteration, German meaning and masculine /
// feminine mark – and every "Anhören"; nothing left out, nothing added. (The
// layout itself – which width shows what, nothing overlapping – is measured in
// a real browser: e2e/a1-tables.spec.ts.)

afterEach(cleanup);

const tableSteps = a1Entries().flatMap(({ unit, lesson }) =>
  lesson.steps.flatMap((step) => (step.kind === "table" ? [{ url: a1StepHref(unit, lesson, step.slug), step }] : []))
);

/** Every non-empty text in the element, sorted (the order differs: the table by rows, the cards by columns). */
function texts(element: Element) {
  const out: string[] = [];
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const text = walker.currentNode.textContent!.trim();
    if (text) out.push(text);
  }
  return out.sort();
}
const listenLabels = (element: Element) => [...element.querySelectorAll("button")].map((b) => b.getAttribute("aria-label") ?? "").sort();

describe("grammar tables as cards", () => {
  it("there are table steps, and the wide tables become cards", () => {
    expect(tableSteps.length).toBeGreaterThan(30);
    const stacked = tableSteps.flatMap(({ step }) => step.tables.filter((t) => tableStacking(t) !== null));
    expect(stacked.length).toBeGreaterThan(30);
  });

  it.each(tableSteps.map(({ url, step }) => [url, step] as const))("%s: the cards carry every text and every Anhören of the table", (_url, step) => {
    render(<TableStep tables={step.tables} quiz={step.quiz} progressKey="a1/test/tables" />);
    for (const table of step.tables) {
      const frame = screen.getByTestId(`table-frame-${table.id}`);
      const cards = screen.queryByTestId(`table-cards-${table.id}`);
      if (tableStacking(table) === null) {
        expect(cards, table.id).toBeNull();
        continue;
      }
      expect(cards, table.id).not.toBeNull();
      expect(texts(cards!), table.id).toEqual(texts(frame));
      expect(listenLabels(cards!), table.id).toEqual(listenLabels(frame));
      // One card per column, in book order, each with all of the column's cells top to bottom.
      table.columns.forEach((_, c) => {
        const card = screen.getByTestId(`table-card-${table.id}-${c}`);
        const lines = [...card.querySelectorAll('[data-testid^="table-card-cell-"]')].map((li) => li.getAttribute("data-testid"));
        expect(lines, `${table.id} column ${c}`).toEqual(table.rows.flatMap((row, r) => (row[c] ? [`table-card-cell-${table.id}-${r}-${c}`] : [])));
      });
    }
  });

  it("مَنْ أَنْتَ؟ – the first card: مُفْرَدٌ مُذَكَّرٌ · ein Mann, then أَنْتَ؟ (du (Mann)), then أَنَا مُحَمَّد", () => {
    const { step } = tableSteps.find(({ url }) => url === "/a1/lesson-4/man-anta/step-5")!;
    render(<TableStep tables={step.tables} quiz={step.quiz} progressKey="a1/test/tables" />);
    expect(texts(screen.getByTestId("table-card-heading-man-0"))).toEqual(["ein Mann", "مُفْرَدٌ مُذَكَّرٌ"]);
    const lines = [...screen.getByTestId("table-card-man-0").querySelectorAll("li")];
    expect(lines.map((li) => li.textContent)).toEqual(["♂ zu einem Mannأَنْتَ؟du (Mann)", "أَنَا مُحَمَّدIch bin Muhammad."]);
    expect(lines[0]).toHaveAttribute("data-gender", "m");
  });

  it("which tables switch, and where", () => {
    const columns = (n: number) => Array.from({ length: n }, () => ({ arabic: "x", german: "x" }));
    expect(tableStacking({ columns: columns(2) })).toBeNull();
    expect(tableStacking({ columns: columns(3) })).toBe("sm");
    expect(tableStacking({ columns: columns(4) })).toBe("sm");
    expect(tableStacking({ columns: columns(4), keepTable: true })).toBeNull();
    expect(tableStacking({ columns: columns(5) })).toBe("md");
    expect(tableStacking({ columns: columns(7) })).toBe("md");
    expect(tableStacking({ columns: columns(8) })).toBe("lg");
    expect(hasWideTable([{ columns: columns(8) }])).toBe(true);
    expect(hasWideTable([{ columns: columns(7) }])).toBe(false);
    expect(isArabicScript("مُذَكَّرٌ")).toBe(true);
    expect(isArabicScript("١٠")).toBe(true);
    expect(isArabicScript("Possessive pronoun")).toBe(false);
  });
});
