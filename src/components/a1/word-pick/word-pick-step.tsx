"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { CheckCircle2, Eye, RotateCcw, SearchCheck } from "lucide-react";

import { ListenButton } from "@/components/a1/listen-button";
import { Button } from "@/components/ui/button";
import type { WordPick } from "@/data/types";
import { MADD_NAME, type MaddKind } from "@/lib/arabic/madd";
import { pickTokens, type PickToken } from "@/lib/arabic/word-pick";
import { getLessonProgress, markLessonCompleted, subscribeProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { T } from "@/i18n/use-locale";

// Step type "word-pick" – "ضع خطًّا تحت الكلمات …": tap whole words to underline
// them. Which words count is computed from the vocalised text
// (src/lib/arabic/madd.ts): words with a Dehnungsbuchstabe (ا و ي after its
// short vowel) or words without one. Check, correct, check again – no limit.
// For the words WITH a long vowel the book's teacher also asks which letter
// makes it long: a second part asks ا, و or ي for every word found.

const noop = () => () => undefined;

const KINDS: MaddKind[] = ["alif", "waw", "ya"];

export function WordPickStep({ pick, progressKey }: { pick: WordPick; progressKey: string }) {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const completedBefore = useSyncExternalStore(subscribeProgress, () => Boolean(getLessonProgress(progressKey).completedAt), () => false);
  const tokens = useMemo(() => pickTokens(pick), [pick]);
  const total = tokens.filter((t) => t.target).length;
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());
  const [checked, setChecked] = useState(false);
  const [reveal, setReveal] = useState(false);
  const askKinds = pick.find === "madd";
  /** Part 2: the chosen Dehnungsbuchstaben per distinct word. */
  const [kinds, setKinds] = useState<Record<string, MaddKind[]>>({});
  const [kindsChecked, setKindsChecked] = useState(false);

  const wrong = checked ? tokens.filter((t) => selected.has(t.key) && !t.target) : [];
  const missing = checked ? tokens.filter((t) => t.target && !selected.has(t.key)) : [];
  const right = checked ? tokens.filter((t) => t.target && selected.has(t.key)) : [];
  const found = checked && wrong.length === 0 && missing.length === 0;
  const distinct = useMemo(() => [...new Map(tokens.filter((t) => t.target).map((t) => [t.word, t])).values()], [tokens]);
  const kindRight = (t: PickToken) => {
    const chosen = kinds[t.word] ?? [];
    return chosen.length === t.madd.length && t.madd.every((k) => chosen.includes(k));
  };
  const done = found && (!askKinds || (kindsChecked && distinct.every(kindRight)));

  function toggle(key: string) {
    if (found) return;
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setChecked(false);
  }

  function check() {
    setChecked(true);
    const ok = tokens.every((t) => t.target === selected.has(t.key));
    if (ok) {
      setReveal(false);
      if (!askKinds) markLessonCompleted(progressKey);
    }
  }

  function toggleKind(word: string, kind: MaddKind) {
    setKinds((current) => {
      const list = current[word] ?? [];
      return { ...current, [word]: list.includes(kind) ? list.filter((k) => k !== kind) : [...list, kind] };
    });
    setKindsChecked(false);
  }

  function checkKinds() {
    setKindsChecked(true);
    if (distinct.every(kindRight)) markLessonCompleted(progressKey);
  }

  function again() {
    setSelected(new Set());
    setChecked(false);
    setReveal(false);
    setKinds({});
    setKindsChecked(false);
  }

  const tone = (t: PickToken) => {
    if (selected.has(t.key)) return checked ? (t.target ? "right" : "wrong") : "selected";
    if (reveal && t.target) return "missing";
    return null;
  };

  const chip = (t: PickToken) => {
    const state = tone(t);
    return (
      <button
        type="button"
        onClick={() => toggle(t.key)}
        disabled={found}
        aria-pressed={selected.has(t.key)}
        data-testid={`pick-word-${t.key}`}
        data-target={t.target ? "true" : "false"}
        data-tone={state ?? ""}
        className={cn(
          "rounded-xl px-1.5 font-arabic text-4xl font-bold leading-[2] transition focus-ring disabled:cursor-default",
          state === "selected" && "text-primary underline decoration-primary decoration-[3px] underline-offset-[10px]",
          state === "right" && "text-success underline decoration-success decoration-[3px] underline-offset-[10px]",
          state === "wrong" && "text-destructive underline decoration-destructive decoration-[3px] underline-offset-[10px]",
          state === "missing" && "text-warning underline decoration-warning decoration-dashed decoration-[3px] underline-offset-[10px]"
        )}
      >
        <span lang="ar">{t.shown}</span>
      </button>
    );
  };

  return (
    <div data-testid="word-pick" data-done={done ? "true" : "false"}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold" data-testid="pick-goal">
          {pick.goal} <span className="text-muted-foreground">({total} Wörter)</span>
        </p>
        {hydrated && (done || completedBefore) && (
          <p className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow" data-testid="step-completed">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Geschafft
          </p>
        )}
      </div>

      {pick.words ? (
        <ul dir="rtl" className="flex flex-wrap justify-center gap-x-3 gap-y-2 rounded-[2rem] border border-primary/10 bg-card/60 p-3 sm:p-5" data-testid="pick-words">
          {tokens.map((t) => (
            <li key={t.key} className="flex items-center gap-1 rounded-2xl border bg-card px-2 shadow-sm">
              {chip(t)}
              <ListenButton text={t.word} compact label={`Anhören: ${t.word}`} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col gap-5" data-testid="pick-dialogues">
          {(pick.dialogues ?? []).map((dialogue) => (
            <ol key={dialogue.id} className="flex flex-col gap-2 rounded-[2rem] border border-primary/10 bg-card/60 p-3 sm:p-5" aria-label={dialogue.intro}>
              <p className="px-1 text-sm font-semibold text-muted-foreground">{dialogue.intro}</p>
              {dialogue.lines.map((line) => (
                <li key={line.id} className="rounded-3xl border bg-card px-4 py-2 shadow-card">
                  <p className="text-xs font-semibold text-muted-foreground">{dialogue.speakers.find((s) => s.id === line.speaker)?.name}</p>
                  <p dir="rtl" className="flex flex-wrap gap-x-1">
                    {tokens.filter((t) => t.key.startsWith(`${line.id}:`)).map((t) => (
                      <span key={t.key}>{chip(t)}</span>
                    ))}
                  </p>
                </li>
              ))}
            </ol>
          ))}
        </div>
      )}

      <div className="mt-5 flex flex-col items-center gap-3 text-center">
        {checked && !found && (
          <div role="status" className="w-full max-w-xl rounded-2xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm" data-testid="pick-feedback">
            <p className="font-semibold">
              {right.length} von {total} richtig.{missing.length > 0 && ` Es fehlen noch ${missing.length}.`}
            </p>
            {wrong.length > 0 && (
              <p data-testid="pick-wrong">
                {wrong.length} falsch unterstrichen (rot) – {pick.find === "no-madd" ? "diese Wörter haben einen Dehnungsbuchstaben" : "diese Wörter haben keinen Dehnungsbuchstaben"}. Tippe sie an, um sie zu entfernen.
              </p>
            )}
          </div>
        )}

        {found && askKinds && (
          <section className="w-full max-w-2xl rounded-3xl border bg-card p-4 text-right shadow-card" aria-label="Welcher Dehnungsbuchstabe?" data-testid="pick-kinds">
            <p dir="ltr" className="mb-3 text-center font-semibold">
              Alle gefunden! Welcher Buchstabe macht den Vokal lang – <span lang="ar" className="font-arabic">ا</span>, <span lang="ar" className="font-arabic">و</span> oder <span lang="ar" className="font-arabic">ي</span>? (Manche Wörter haben zwei.)
            </p>
            <ul className="flex flex-col gap-2">
              {distinct.map((t) => {
                const verdict = kindsChecked ? (kindRight(t) ? "right" : "wrong") : null;
                return (
                  <li key={t.word} dir="rtl" className={cn("flex flex-wrap items-center justify-between gap-2 rounded-2xl border px-3 py-1", verdict === "right" && "border-success bg-success-soft", verdict === "wrong" && "border-destructive bg-destructive/10")} data-testid={`pick-kind-${t.word}`} data-verdict={verdict ?? ""}>
                    <span lang="ar" className="font-arabic text-3xl font-bold leading-[1.9]">
                      {t.word}
                    </span>
                    <span className="flex gap-2">
                      {KINDS.map((kind) => (
                        <button
                          key={kind}
                          type="button"
                          onClick={() => toggleKind(t.word, kind)}
                          aria-pressed={(kinds[t.word] ?? []).includes(kind)}
                          aria-label={`${MADD_NAME[kind].german} bei ${t.word}`}
                          data-testid={`pick-kind-${t.word}-${kind}`}
                          disabled={done}
                          className={cn("h-12 w-12 rounded-xl border font-arabic text-2xl font-bold transition focus-ring", (kinds[t.word] ?? []).includes(kind) ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted")}
                        >
                          {MADD_NAME[kind].letter}
                        </button>
                      ))}
                    </span>
                    {verdict === "right" && (
                      <span dir="ltr" className="w-full text-left text-xs text-success">
                        {t.madd.map((k) => MADD_NAME[k].german).join(" und ")}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
            {!done && (
              <div className="mt-3 flex justify-center">
                <Button size="lg" onClick={checkKinds} data-testid="pick-kinds-check" className="min-h-12">
                  <SearchCheck className="h-5 w-5" aria-hidden /> Prüfen
                </Button>
              </div>
            )}
          </section>
        )}

        {done && (
          <div role="status" data-testid="pick-done" className="w-full max-w-xl animate-fade-in rounded-3xl border border-success/40 bg-card p-5 shadow-card">
            <p className="text-3xl font-bold text-success">
              <T>Ausgezeichnet!</T> 👏
            </p>
            <p className="mt-1 text-muted-foreground">Alles richtig.</p>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-3">
          {!found && (
            <Button size="lg" onClick={check} disabled={selected.size === 0} data-testid="pick-check" className="min-h-12">
              <SearchCheck className="h-5 w-5" aria-hidden /> Prüfen
            </Button>
          )}
          {checked && !found && !reveal && (
            <Button variant="secondary" size="lg" onClick={() => setReveal(true)} data-testid="pick-reveal" className="min-h-12">
              <Eye className="h-5 w-5" aria-hidden /> Hilfe: fehlende zeigen
            </Button>
          )}
          {(done || selected.size > 0) && (
            <Button variant="secondary" size="lg" onClick={again} data-testid="pick-again" className="min-h-12">
              <RotateCcw className="h-5 w-5" aria-hidden /> {done ? "Nochmal" : "Alles löschen"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
