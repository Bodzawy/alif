"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { CheckCircle2, RotateCcw, SearchCheck, XCircle } from "lucide-react";

import { ListenButton } from "@/components/a1/listen-button";
import { Button } from "@/components/ui/button";
import type { MatchContent, MatchPrompt } from "@/data/types";
import { getLessonProgress, markLessonCompleted, subscribeProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

// Step type "match" – the book's matching exercises: "write the number of the
// picture next to the right word" and "connect the letters, then match them
// with the right word". Tap a row (it is chosen automatically one after the
// other), then the picture or word that belongs to it. "Prüfen" marks every row
// right or wrong; wrong rows can be changed as often as needed. The book's model
// answer is shown solved. Done when every row is right; then the joined word of
// each row is "written" into its result column.

const noop = () => () => undefined;

export function MatchStep({ match, progressKey }: { match: MatchContent; progressKey: string }) {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const completedBefore = useSyncExternalStore(subscribeProgress, () => Boolean(getLessonProgress(progressKey).completedAt), () => false);
  const initial = useMemo(() => Object.fromEntries(match.prompts.filter((p) => p.example).map((p) => [p.id, p.answer])), [match.prompts]);
  const open = match.prompts.filter((p) => !p.example);
  const [assigned, setAssigned] = useState<Record<string, string>>(initial);
  const [active, setActive] = useState<string | null>(open[0]?.id ?? null);
  const [checked, setChecked] = useState<Record<string, boolean> | null>(null);
  const done = checked !== null && match.prompts.every((p) => checked[p.id]);
  const optionById = new Map(match.options.map((o) => [o.id, o]));

  function assign(optionId: string) {
    if (!active || done) return;
    const next = { ...assigned, [active]: optionId };
    setAssigned(next);
    // A changed row is open again until the next "Prüfen".
    setChecked((current) => (current ? Object.fromEntries(Object.entries(current).filter(([id]) => id !== active)) : current));
    const after = open.find((p) => !next[p.id] && p.id !== active);
    setActive(after?.id ?? null);
  }

  function check() {
    const ok = (p: MatchPrompt) => assigned[p.id] === p.answer || Boolean(p.accept?.includes(assigned[p.id] ?? ""));
    const result = Object.fromEntries(match.prompts.map((p) => [p.id, ok(p)]));
    setChecked(result);
    if (match.prompts.every((p) => result[p.id])) {
      setActive(null);
      markLessonCompleted(progressKey);
    } else {
      setActive(match.prompts.find((p) => !result[p.id])?.id ?? null);
    }
  }

  function again() {
    setAssigned(initial);
    setChecked(null);
    setActive(open[0]?.id ?? null);
  }

  const wrongCount = checked ? match.prompts.filter((p) => checked[p.id] === false).length : 0;
  const allAssigned = match.prompts.every((p) => assigned[p.id]);
  const statusOf = (p: MatchPrompt) => (p.example ? "example" : checked && p.id in checked ? (checked[p.id] ? "right" : "wrong") : assigned[p.id] ? "chosen" : "open");

  return (
    <div data-testid="match-step" data-done={done ? "true" : "false"}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Tippe auf eine Zeile und dann auf {match.options.some((o) => o.image) ? "das passende Bild" : "das passende Wort"}.</p>
        {hydrated && (done || completedBefore) && (
          <p className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow" data-testid="step-completed">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Geschafft
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-label={match.promptTitle}>
          <h2 className="mb-2 text-sm font-bold text-muted-foreground">{match.promptTitle}</h2>
          <ol className="flex flex-col gap-2" data-testid="match-prompts">
            {match.prompts.map((p, i) => {
              const status = statusOf(p);
              const option = assigned[p.id] ? optionById.get(assigned[p.id]!) : undefined;
              const solved = status === "right" || status === "example";
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => !p.example && !done && setActive(p.id)}
                    disabled={p.example || done}
                    aria-pressed={active === p.id}
                    data-testid={`match-prompt-${p.id}`}
                    data-status={status}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border bg-card px-3 py-2 text-right shadow-sm transition focus-ring disabled:cursor-default",
                      active === p.id && "border-primary ring-2 ring-primary",
                      status === "right" && "border-success bg-success-soft",
                      status === "wrong" && "border-destructive bg-destructive/10",
                      status === "example" && "bg-muted/60"
                    )}
                  >
                    <span className="w-6 shrink-0 text-center text-sm font-bold text-muted-foreground">{i + 1}</span>
                    <span lang="ar" dir="rtl" className="flex-1 font-arabic text-3xl font-bold leading-[1.8]">
                      {p.arabic}
                    </span>
                    <span className="text-muted-foreground" aria-hidden>
                      =
                    </span>
                    <span
                      className={cn("flex h-14 min-w-14 items-center justify-center rounded-xl border-2 border-dashed px-2 font-arabic text-2xl font-bold", option && "border-solid border-primary/40 bg-primary-soft")}
                      data-testid={`match-slot-${p.id}`}
                      lang="ar"
                    >
                      {option ? option.label : ""}
                    </span>
                    {status === "right" && <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-label="richtig" />}
                    {status === "wrong" && <XCircle className="h-5 w-5 shrink-0 text-destructive" aria-label="falsch" />}
                    {status === "example" && <span className="shrink-0 text-xs text-muted-foreground">Beispiel</span>}
                  </button>
                  {p.result && solved && (
                    <div className="mt-1 flex items-center justify-end gap-2 pr-2" data-testid={`match-result-${p.id}`}>
                      <span className="text-sm text-muted-foreground">{p.result.german}</span>
                      <span lang="ar" className="font-arabic text-3xl font-bold leading-[1.8] text-success">
                        {p.result.arabic}
                      </span>
                      <ListenButton text={p.result.arabic} compact label={`Anhören: ${p.result.german}`} />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-label={match.optionTitle}>
          <h2 className="mb-2 text-sm font-bold text-muted-foreground">{match.optionTitle}</h2>
          <ul className={cn("grid gap-3", match.options.some((o) => o.image) ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-3")} data-testid="match-options">
            {match.options.map((option) => {
              const users = match.prompts.filter((p) => assigned[p.id] === option.id).map((p) => match.prompts.indexOf(p) + 1);
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => assign(option.id)}
                    disabled={!active || done}
                    data-testid={`match-option-${option.id}`}
                    aria-label={`${option.image ? `Bild ${option.label}: ${option.image.alt}` : option.arabic ?? option.label}${users.length ? ` – bei Zeile ${users.join(", ")}` : ""}`}
                    className="relative flex w-full flex-col items-center gap-1 rounded-2xl border bg-card p-2 shadow-sm transition focus-ring enabled:hover:border-primary disabled:cursor-default"
                  >
                    {option.image && <Image src={option.image.src} alt="" width={160} height={120} unoptimized className="h-auto w-full rounded-xl" />}
                    <span lang="ar" className={cn("font-arabic font-bold", option.image ? "text-xl" : "text-3xl leading-[1.8]")}>
                      {option.image ? `(${option.label})` : (option.arabic ?? option.label)}
                    </span>
                    {users.length > 0 && <span className="absolute left-1 top-1 rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">{users.join(" · ")}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        {checked && !done && (
          <p role="status" className="rounded-2xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm font-semibold" data-testid="match-feedback">
            {match.prompts.length - wrongCount} von {match.prompts.length} richtig. Tippe auf eine rote Zeile und wähle neu.
          </p>
        )}
        {done && (
          <p role="status" lang="ar" className="font-arabic text-3xl font-bold text-success" data-testid="match-done">
            مُمْتَاز! 👏
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          {!done && (
            <Button size="lg" onClick={check} disabled={!allAssigned} data-testid="match-check" className="min-h-12">
              <SearchCheck className="h-5 w-5" aria-hidden /> Prüfen
            </Button>
          )}
          <Button variant="secondary" size="lg" onClick={again} data-testid="match-again" className="min-h-12">
            <RotateCcw className="h-5 w-5" aria-hidden /> {done ? "Nochmal" : "Alles löschen"}
          </Button>
        </div>
      </div>
    </div>
  );
}
