"use client";

import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { CheckCircle2, SearchCheck } from "lucide-react";

import { ListenButton } from "@/components/a1/listen-button";
import { Button } from "@/components/ui/button";
import { MixedText } from "@/components/ui/mixed-text";
import { clozeLineText } from "@/lib/arabic/cloze";
import type { ClozeItem, ClozePart } from "@/data/types";
import { getLessonProgress, markExercisePassed, markLessonCompleted, subscribeProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

// Step type "cloze" – the book's "write the missing question / answer /
// dialogue" (Unit 2): each item is a short exchange (أ / ب) with gaps. Tap a
// gap, then a tile; "Prüfen" marks every gap right or wrong. Where the book
// leaves a free choice (e.g. a name), every fitting tile is right. Wrong gaps
// can be changed as often as needed; the exchange can be heard once it is
// complete. Done when every item is right.

const noop = () => () => undefined;

type Gap = Extract<ClozePart, { options: string[] }>;
const isGap = (part: ClozePart): part is Gap => typeof part !== "string";



export function ClozeStep({ items, bank, progressKey }: { items: ClozeItem[]; bank?: string[]; progressKey: string }) {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const stored = useSyncExternalStore(subscribeProgress, () => getLessonProgress(progressKey), () => null);
  const [filled, setFilled] = useState<Record<string, string>>({});
  const gapKeys = items.flatMap((item) => item.lines.flatMap((line) => line.parts.filter(isGap)).map((_, n) => `${item.id}:${n}`));
  // With a word bank the first empty gap is taken at once: its question lights up.
  const [active, setActive] = useState<string | null>(bank ? (gapKeys[0] ?? null) : null);
  const currentRef = useRef<HTMLLIElement | null>(null);
  const bankRef = useRef<HTMLDivElement | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const gapsOf = (item: ClozeItem) => item.lines.flatMap((line) => line.parts.filter(isGap));
  const isRight = (item: ClozeItem) => gapsOf(item).every((gap, n) => gap.accept.includes(filled[`${item.id}:${n}`] ?? ""));
  const passed = (item: ClozeItem) => checked[item.id] === true || Boolean(stored?.passed.includes(item.id));
  const doneCount = items.filter(passed).length;

  function choose(key: string, option: string) {
    const next = { ...filled, [key]: option };
    setFilled(next);
    // Bank mode: on to the next empty gap.
    if (bank) {
      const start = gapKeys.indexOf(key);
      const following = [...gapKeys.slice(start + 1), ...gapKeys.slice(0, start)].find((k) => !next[k]);
      setActive(following ?? null);
    }
    const itemId = key.split(":")[0]!;
    setChecked((current) => Object.fromEntries(Object.entries(current).filter(([id]) => id !== itemId)));
  }

  function check(item: ClozeItem) {
    const ok = isRight(item);
    setChecked((current) => ({ ...current, [item.id]: ok }));
    if (ok) {
      markExercisePassed(progressKey, item.id);
      if (items.every((other) => other.id === item.id || getLessonProgress(progressKey).passed.includes(other.id))) markLessonCompleted(progressKey);
    }
  }

  const currentItem = active?.split(":")[0] ?? null;
  useEffect(() => {
    const el = currentRef.current;
    if (!bank || !el) return;
    // The sticky word bank covers the top of the page: keep the current question below it.
    const covered = (bankRef.current?.getBoundingClientRect().bottom ?? 72) + 12;
    const r = el.getBoundingClientRect();
    if (r.top >= covered && r.bottom <= window.innerHeight - 24) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: window.scrollY + r.top - covered, behavior: reduce ? "auto" : "smooth" });
  }, [bank, currentItem]);

  return (
    <div data-testid="cloze-step">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{bank ? "Die leuchtende Aufgabe ist dran: tippe in der Box oben das passende Wort an." : "Tippe auf eine Lücke und dann auf das passende Wort."}</p>
        <p className="text-sm font-semibold text-muted-foreground" aria-live="polite" data-testid="cloze-count">
          {hydrated ? `${doneCount} von ${items.length} richtig` : `${items.length} Aufgaben`}
        </p>
      </div>
      {hydrated && (Boolean(stored?.completedAt) || doneCount === items.length) && (
        <p className="mb-4 inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow" data-testid="step-completed">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Geschafft
        </p>
      )}
      {bank && (
        <div ref={bankRef} className="sticky top-[4.5rem] z-20 mb-5 rounded-3xl border bg-card/95 p-3 shadow-lift backdrop-blur" data-testid="cloze-bank">
          <p className="mb-2 text-xs font-bold text-muted-foreground">Wörter zur Auswahl</p>
          <div dir="rtl" className="flex max-h-[38vh] flex-wrap gap-1.5 overflow-y-auto sm:max-h-none sm:overflow-visible">
            {bank.map((word) => (
              <button
                key={word}
                type="button"
                disabled={!active}
                onClick={() => active && choose(active, word)}
                data-testid={`cloze-bank-${word}`}
                className="min-h-9 rounded-lg border bg-card px-2.5 font-arabic text-lg font-bold leading-tight transition focus-ring enabled:hover:border-primary enabled:hover:bg-primary-soft disabled:opacity-60"
              >
                <span lang="ar">{word}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <ol className="flex flex-col gap-4">
        {items.map((item, i) => {
          let gapIndex = 0;
          const verdict = item.id in checked ? (checked[item.id] ? "right" : "wrong") : passed(item) ? "right" : null;
          const gaps = gapsOf(item);
          /** "Anhören" only for the model answer (other free choices are right, but have no recording). */
          const isModel = gaps.every((gap, n) => filled[`${item.id}:${n}`] === gap.accept[0]);
          const complete = gaps.every((_, n) => filled[`${item.id}:${n}`]);
          const activeGap = active?.startsWith(`${item.id}:`) ? gaps[Number(active.split(":")[1])] : undefined;
          return (
            <li
              key={item.id}
              ref={bank && currentItem === item.id ? currentRef : undefined}
              className={cn(
                "rounded-3xl border bg-card p-4 shadow-card transition-[transform,box-shadow,opacity] duration-300 sm:p-5",
                verdict === "right" && "border-success/50",
                verdict === "wrong" && "border-destructive/50",
                bank && currentItem === item.id && "z-10 border-primary shadow-lift ring-2 ring-primary motion-safe:scale-[1.03]",
                bank && currentItem !== null && currentItem !== item.id && verdict !== "right" && "opacity-75"
              )} data-testid={`cloze-${item.id}`} data-verdict={verdict ?? ""}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <span className="text-sm font-bold text-muted-foreground">{i + 1}</span>
                {item.image && <Image src={item.image.src} alt={item.image.alt} width={200} height={150} unoptimized className="mx-auto rounded-2xl border bg-card sm:mx-0" data-testid={`cloze-image-${item.id}`} />}
                <div className="min-w-0 flex-1">
                  {item.hint && (
                    <p className="mb-2 text-sm text-muted-foreground">
                      <MixedText text={item.hint} />
                    </p>
                  )}
                  {item.lines.map((line, l) => {
                    return (
                      <div key={l} dir="rtl" className="flex flex-wrap items-center gap-x-1 gap-y-2 py-1 font-arabic text-3xl font-bold leading-[1.9]">
                        <span className="ml-2 text-xl text-muted-foreground">{line.label} –</span>
                        {line.parts.map((part, p) => {
                          if (!isGap(part)) return <Fragment key={p}><span lang="ar">{part}</span></Fragment>;
                          const key = `${item.id}:${gapIndex++}`;
                          const value = filled[key];
                          const bad = verdict === "wrong" && !part.accept.includes(value ?? "");
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setActive(key)}
                              aria-pressed={active === key}
                              aria-label={value ? `Lücke: ${value}` : "Lücke: leer"}
                              data-testid={`cloze-gap-${key}`}
                              data-state={bad ? "wrong" : value ? "filled" : "empty"}
                              className={cn(
                                "inline-flex min-h-12 min-w-16 items-center justify-center rounded-xl border-2 border-dashed px-2 text-2xl transition focus-ring",
                                active === key && "border-solid border-primary ring-2 ring-primary",
                                value && "border-solid border-primary/40 bg-primary-soft",
                                bad && "border-destructive bg-destructive/10 text-destructive"
                              )}
                            >
                              <span lang="ar">{value ?? "…"}</span>
                            </button>
                          );
                        })}
                        {verdict === "right" && isModel && <ListenButton text={clozeLineText(line.parts)} compact className="mr-2" />}
                      </div>
                    );
                  })}
                  {activeGap && !bank && (
                    <div dir="rtl" className="mt-3 flex flex-wrap gap-2 rounded-2xl bg-muted/50 p-2" data-testid={`cloze-options-${item.id}`}>
                      {activeGap.options.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => choose(active!, option)}
                          data-testid={`cloze-option-${option}`}
                          className="min-h-12 rounded-xl border bg-card px-3 font-arabic text-2xl font-bold transition focus-ring hover:bg-muted"
                        >
                          <span lang="ar">{option}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Button variant="secondary" onClick={() => check(item)} disabled={!complete || verdict === "right"} className="min-h-12" data-testid={`cloze-check-${item.id}`}>
                      <SearchCheck className="h-5 w-5" aria-hidden /> Prüfen
                    </Button>
                    {verdict === "wrong" && (
                      <span role="status" className="text-sm font-semibold text-destructive">
                        Nicht ganz – tippe auf die rote Lücke und wähle neu.
                      </span>
                    )}
                    {verdict === "right" && (
                      <span role="status" className="inline-flex items-center gap-1 text-sm font-semibold text-success">
                        <CheckCircle2 className="h-4 w-4" aria-hidden /> Richtig!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
