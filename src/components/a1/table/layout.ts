import type { TableBlock } from "@/data/types";

// How a grammar table is laid out on small screens (shared by the table step
// and the step page, which is a server component – so not in table-step.tsx).
//
// Two columns always fit side by side. With three or four, every column becomes
// its own card on phones (below 640 px); with five to seven also on small
// tablets (below 768 px); with eight and more below 1024 px – those also get a
// wider page.

export type TableStacking = "sm" | "md" | "lg";

export function tableStacking(table: Pick<TableBlock, "columns" | "keepTable">): TableStacking | null {
  const n = table.columns.length;
  if (table.keepTable || n <= 2) return null;
  return n <= 4 ? "sm" : n <= 7 ? "md" : "lg";
}

/** A step with a table this wide needs more room than the usual step width. */
export function hasWideTable(tables: ReadonlyArray<Pick<TableBlock, "columns" | "keepTable">>): boolean {
  return tables.some((table) => tableStacking(table) === "lg");
}

/** Text without a single Arabic letter or digit (e.g. the book's English terms) is not set in the large Arabic type. */
export function isArabicScript(text: string): boolean {
  return /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/.test(text);
}
