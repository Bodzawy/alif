"use client";

import { useState, useSyncExternalStore } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";

import { ListenButton } from "@/components/a1/listen-button";
import { Button } from "@/components/ui/button";
import type { OrderContent } from "@/data/types";
import { getLessonProgress, markLessonCompleted, subscribeProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

// Step type "order" – the book's "اقرأ ورتب الحوار": the lines as printed
// (with the book's numbers); tap them in the order of the conversation. A line
// that cannot come next is marked red and not taken; "Neu anfangen" clears the
// order. Done when the whole conversation is in a right order – then it can
// be heard line by line. Unlimited tries.

const noop = () => () => undefined;
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const arabicNumber = (n: number) => String(n).replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)]!);

export function OrderStep({ order, progressKey }: { order: OrderContent; progressKey: string }) {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const completedBefore = useSyncExternalStore(subscribeProgress, () => Boolean(getLessonProgress(progressKey).completedAt), () => false);
  const [chosen, setChosen] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const byId = new Map(order.items.map((item) => [item.id, item]));
  const done = chosen.length === order.items.length;

  function take(id: string) {
    if (chosen.includes(id) || done) return;
    const next = [...chosen, id];
    const fits = order.solutions.some((solution) => next.every((x, i) => solution[i] === x));
    if (!fits) {
      setWrong(id);
      return;
    }
    setWrong(null);
    setChosen(next);
    if (next.length === order.items.length) markLessonCompleted(progressKey);
  }

  return (
    <div data-testid="order-step">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Tippe die Zeilen in der Reihenfolge der Unterhaltung an – zuerst die erste Zeile.</p>
        {hydrated && (completedBefore || done) && (
          <p className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow" data-testid="step-completed">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Geschafft
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section aria-labelledby="order-book">
          <h3 id="order-book" className="mb-2 text-sm font-bold text-muted-foreground">
            Im Buch
          </h3>
          <ul className="grid gap-2">
            {order.items.map((item, n) => {
              const used = chosen.includes(item.id);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => take(item.id)}
                    disabled={used}
                    data-testid={`order-item-${item.id}`}
                    data-state={used ? "used" : wrong === item.id ? "wrong" : "open"}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border bg-card p-3 text-start shadow-card transition focus-ring hover:bg-muted",
                      used && "opacity-40",
                      wrong === item.id && "border-destructive bg-destructive/10"
                    )}
                  >
                    <span lang="ar" dir="rtl" className="flex-1 font-arabic text-2xl leading-[1.9]">
                      {arabicNumber(n + 1)}) {item.arabic}
                    </span>
                    {wrong === item.id && <XCircle className="h-5 w-5 shrink-0 text-destructive" aria-label="passt hier noch nicht" />}
                  </button>
                </li>
              );
            })}
          </ul>
          {wrong && (
            <p className="mt-2 text-sm font-semibold text-destructive" role="status" data-testid="order-wrong">
              Diese Zeile kommt noch nicht. Lies die Fragen und Antworten noch einmal.
            </p>
          )}
        </section>

        <section aria-labelledby="order-dialogue">
          <div className="mb-2 flex items-center justify-between">
            <h3 id="order-dialogue" className="text-sm font-bold text-muted-foreground">
              Deine Unterhaltung
            </h3>
            {chosen.length > 0 && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setChosen([]);
                  setWrong(null);
                }}
                data-testid="order-reset"
              >
                <RotateCcw className="h-4 w-4" aria-hidden /> Neu anfangen
              </Button>
            )}
          </div>
          <ol className="grid gap-2" data-testid="order-result">
            {chosen.map((id) => {
              const item = byId.get(id)!;
              return (
                <li key={id} className="rounded-2xl border border-success bg-success-soft p-3" data-testid={`order-chosen-${id}`}>
                  <div className="flex items-center justify-between gap-2">
                    <ListenButton text={item.arabic} compact label={`Anhören: ${item.german}`} testId={`order-listen-${id}`} />
                    <span lang="ar" dir="rtl" className="font-arabic text-2xl leading-[1.9]">
                      {item.arabic}
                    </span>
                  </div>
                  <p className="mt-1 text-right text-sm text-muted-foreground">{item.german}</p>
                </li>
              );
            })}
            {!done && (
              <li className="rounded-2xl border border-dashed p-3 text-center text-sm text-muted-foreground">
                {chosen.length === 0 ? "Welche Zeile kommt zuerst?" : "Welche Zeile kommt als Nächstes?"}
              </li>
            )}
          </ol>
        </section>
      </div>
    </div>
  );
}
