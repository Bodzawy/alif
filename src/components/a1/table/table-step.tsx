"use client";

import { useState, useSyncExternalStore } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

import { ListenButton } from "@/components/a1/listen-button";
import { MixedText } from "@/components/ui/mixed-text";
import type { TableBlock, TableQuiz } from "@/data/types";
import { getLessonProgress, markLessonCompleted, subscribeProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

// Step type "table" – the book's grammar tables ("لاحظ القواعد", "تذكر"): the
// columns as in the book (right to left), each Arabic cell with its German
// meaning and "Anhören", masculine and feminine forms marked. A short check
// ("Kurzer Check") asks about the tables: German question, Arabic answers.
// Wrong answers can be changed as often as needed; the step is done when every
// question is answered right.

const GENDER = {
  m: { label: "♂ zu einem Mann", className: "border-primary/30 bg-primary-soft text-primary" },
  f: { label: "♀ zu einer Frau", className: "border-accent/40 bg-accent-soft text-accent-foreground" },
} as const;

const noop = () => () => undefined;

export function TableStep({ tables, quiz, progressKey }: { tables: TableBlock[]; quiz: TableQuiz[]; progressKey: string }) {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const completedBefore = useSyncExternalStore(subscribeProgress, () => Boolean(getLessonProgress(progressKey).completedAt), () => false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const right = quiz.filter((q) => answers[q.id] === q.answer).length;
  const done = right === quiz.length;

  function answer(q: TableQuiz, option: number) {
    const next = { ...answers, [q.id]: option };
    setAnswers(next);
    if (quiz.every((item) => next[item.id] === item.answer)) markLessonCompleted(progressKey);
  }

  return (
    <div data-testid="table-step">
      <div className="flex flex-col gap-8">
        {tables.map((table) => (
          <section key={table.id} aria-labelledby={`table-${table.id}`} data-testid={`table-${table.id}`}>
            <p lang="ar" dir="rtl" className="text-right font-arabic text-2xl font-bold leading-[1.9] text-primary">
              {table.titleArabic}
            </p>
            <h2 id={`table-${table.id}`} className="text-lg font-bold">
              {table.title}
            </h2>
            <div className="mt-2 overflow-hidden rounded-3xl border bg-card shadow-card">
              <table dir="rtl" className="w-full table-fixed border-collapse text-center">
                <thead>
                  <tr className="bg-primary-soft">
                    {table.columns.map((column) => (
                      <th key={column.arabic} scope="col" className="border-b px-2 py-2 align-top">
                        <span lang="ar" className="block font-arabic text-xl font-bold leading-[1.8] text-primary">
                          {column.arabic}
                        </span>
                        <span dir="ltr" className="block text-xs font-semibold text-muted-foreground">
                          {column.german}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, r) => (
                    <tr key={r} className="border-b last:border-b-0">
                      {row.map((cell, c) => (
                        <td key={c} className="border-l px-2 py-3 align-top last:border-l-0" data-testid={`table-cell-${table.id}-${r}-${c}`} data-gender={cell.gender}>
                          {cell.gender && (
                            <span dir="ltr" className={cn("mb-1 inline-block rounded-full border px-2 py-0.5 text-xs font-semibold", GENDER[cell.gender].className)}>
                              {GENDER[cell.gender].label}
                            </span>
                          )}
                          <span lang="ar" className="block font-arabic text-3xl font-bold leading-[1.9]">
                            {cell.arabic}
                          </span>
                          {cell.transliteration && (
                            <span dir="ltr" className="block text-sm italic text-muted-foreground">
                              {cell.transliteration}
                            </span>
                          )}
                          {cell.german && (
                            <span dir="ltr" className="block text-sm font-semibold">
                              {cell.german}
                            </span>
                          )}
                          {cell.listen !== false && <ListenButton text={cell.arabic} compact label={`Anhören: ${cell.arabic}`} className="mt-1" />}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {table.note && (
              <p className="mt-2 rounded-2xl border border-primary/15 bg-primary-soft px-4 py-3 text-sm" data-testid={`table-note-${table.id}`}>
                <MixedText text={table.note} />
              </p>
            )}
          </section>
        ))}
      </div>

      <section className="mt-10 rounded-3xl border bg-card p-4 shadow-card sm:p-6" aria-labelledby="table-quiz" data-testid="table-quiz">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="table-quiz" className="text-lg font-bold">
            Kurzer Check
          </h2>
          <p className="text-sm text-muted-foreground" aria-live="polite" data-testid="table-quiz-count">
            {right} von {quiz.length} richtig
          </p>
        </div>
        <ol className="mt-3 flex flex-col gap-5">
          {quiz.map((q, n) => {
            const chosen = answers[q.id];
            return (
              <li key={q.id} data-testid={`quiz-${q.id}`} data-correct={chosen === q.answer ? "true" : chosen === undefined ? "" : "false"}>
                <p className="font-semibold">
                  {n + 1}. <MixedText text={q.prompt} />
                </p>
                <div dir="rtl" className="mt-2 flex flex-wrap gap-2">
                  {q.options.map((option, i) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => answer(q, i)}
                      aria-pressed={chosen === i}
                      data-testid={`quiz-${q.id}-option-${i}`}
                      className={cn(
                        "min-h-12 rounded-2xl border bg-card px-4 font-arabic text-2xl font-bold leading-[1.9] transition focus-ring hover:bg-muted",
                        chosen === i && (i === q.answer ? "border-success bg-success-soft text-success" : "border-destructive bg-destructive/10 text-destructive")
                      )}
                    >
                      <span lang="ar">{option}</span>
                    </button>
                  ))}
                </div>
                {chosen !== undefined && (
                  <p dir="ltr" role="status" className={cn("mt-1 inline-flex items-center gap-1 text-sm font-semibold", chosen === q.answer ? "text-success" : "text-destructive")}>
                    {chosen === q.answer ? <CheckCircle2 className="h-4 w-4" aria-hidden /> : <XCircle className="h-4 w-4" aria-hidden />}
                    {chosen === q.answer ? "Richtig!" : "Nicht ganz – schau noch einmal in die Tabelle und wähle neu."}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
        {hydrated && (done || completedBefore) && (
          <p className="mt-4 inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow" data-testid="step-completed">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Geschafft
          </p>
        )}
      </section>
    </div>
  );
}
