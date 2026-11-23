"use client";

import { useEffect, useState } from "react";

import { CheckBar, Sheet, SheetHeader, VerdictNote, arabicNumber } from "@/components/a1/worksheet";
import { markLessonCompleted } from "@/lib/progress";

import { finalVerdict } from "./ai-check";
import { checkText, type CheckContext, type Verdict } from "./writing-check";

// A table the learner fills in (e.g. what the partner says about his flat): free text in every cell.
// "Prüfen" looks at the rows that have something in them (Arabic letters, words of the lesson). The part
// is done when one row is filled in completely and has no mistake.

export function FillTablePart({ first, columns, rows, task, check, progressKey }: { first: string; columns: string[]; rows: number; task?: string; check: CheckContext; progressKey: string }) {
  const [cells, setCells] = useState<Record<string, string>>({});
  const [verdicts, setVerdicts] = useState<Record<number, Verdict>>({});
  const [busy, setBusy] = useState(false);
  const filledRows = Array.from({ length: rows }, (_, r) => r).filter((r) => columns.every((_, c) => (cells[`${r}:${c}`] ?? "").trim().length > 0));
  const good = filledRows.filter((r) => verdicts[r] && verdicts[r]!.level !== "wrong").length;
  const done = good >= 1;

  useEffect(() => {
    if (done) markLessonCompleted(progressKey);
  }, [done, progressKey]);

  async function runCheck() {
    setBusy(true);
    const entries = await Promise.all(
      Array.from({ length: rows }, (_, r) => r).map(async (r): Promise<[number, Verdict] | null> => {
        const texts = columns.map((_, c) => (cells[`${r}:${c}`] ?? "").trim());
        if (texts.every((text) => text === "")) return null;
        const parts = texts.map((text) => checkText(text, check, { minWords: 1 }));
        const local = parts.find((v) => v.level === "wrong") ?? parts.find((v) => v.level === "hint") ?? parts[0]!;
        const answer = columns.map((column, c) => `${column}: ${texts[c]}`).join(" | ");
        return [r, await finalVerdict(local, { task, answer, note: `Table row about the partner/flat; each cell answers its column heading (${first}).` })];
      })
    );
    setVerdicts(Object.fromEntries(entries.filter((e): e is [number, Verdict] => e !== null)));
    setBusy(false);
  }

  return (
    <Sheet testId="fill-table-part">
      <SheetHeader label={`${good} von ${rows} Zeilen geprüft (eine reicht)`} ratio={good / rows} done={done} testId="fill-table-count" />
      <div className="overflow-x-auto">
        <table dir="rtl" className="w-full min-w-[32rem] border-collapse text-center">
          <thead>
            <tr className="bg-primary-soft/50 font-arabic text-xl font-bold text-primary">
              <th className="w-24 border-b px-3 py-3">{first}</th>
              {columns.map((column) => (
                <th key={column} className="border-b border-s px-3 py-3 leading-[1.7]">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, r) => (
              <tr key={r} className="border-b last:border-b-0" data-level={verdicts[r]?.level}>
                <td className="px-3 py-2 font-arabic text-xl font-bold text-muted-foreground">{arabicNumber(r + 1)}</td>
                {columns.map((column, c) => (
                  <td key={column} className="border-s p-1.5">
                    <input
                      lang="ar"
                      dir="rtl"
                      value={cells[`${r}:${c}`] ?? ""}
                      onChange={(event) => {
                        setCells((all) => ({ ...all, [`${r}:${c}`]: event.target.value }));
                        setVerdicts((all) => Object.fromEntries(Object.entries(all).filter(([row]) => Number(row) !== r)));
                      }}
                      aria-label={`${first} ${r + 1}: ${column}`}
                      data-testid={`fill-cell-${r}-${c}`}
                      className="min-h-11 w-full rounded-lg bg-background px-2 font-arabic text-xl font-bold transition focus-ring"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {Object.entries(verdicts).map(([r, verdict]) => (
        <div key={r} className="border-t px-5 pb-4 sm:px-7">
          <VerdictNote level={verdict.level} messages={[`Zeile ${Number(r) + 1}: ${verdict.messages.join(" ")}`]} testId={`fill-verdict-${r}`} />
        </div>
      ))}
      <CheckBar onCheck={() => void runCheck()} disabled={busy} busy={busy}>Trag mindestens eine Zeile ein und tippe dann auf „Prüfen“.</CheckBar>
    </Sheet>
  );
}
