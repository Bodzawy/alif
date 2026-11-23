"use client";

import { useEffect, useRef, useState } from "react";

import { CheckBar, Sheet, SheetHeader, SheetRow, VerdictNote, arabicNumber, tileClass } from "@/components/a1/worksheet";
import { markLessonCompleted } from "@/lib/progress";
import { cn } from "@/lib/utils";

import { finalVerdict } from "./ai-check";
import { checkText, type CheckContext, type Verdict } from "./writing-check";

// "اكتب …": the learner writes sentences or a text (typing, or tapping the helper words, which are put
// into the text that is being written). "Prüfen" says what can be told for sure (Arabic letters, enough
// words, words of the lesson, agreement after هُوَ / هِيَ). The part is done when no text is wrong.

export function WritePart({
  count,
  words,
  example,
  rows = 2,
  noun = "Sätzen",
  minWords = 2,
  describing = false,
  model,
  task,
  check,
  progressKey,
}: {
  count: number;
  words: string[];
  example?: string;
  rows?: number;
  noun?: string;
  minWords?: number;
  describing?: boolean;
  model?: string;
  task?: string;
  check: CheckContext;
  progressKey: string;
}) {
  const [sentences, setSentences] = useState<string[]>(() => Array.from({ length: count }, () => ""));
  const [verdicts, setVerdicts] = useState<Array<Verdict | null>>(() => Array.from({ length: count }, () => null));
  const [focus, setFocus] = useState(0);
  const [busy, setBusy] = useState(false);
  const fields = useRef<Array<HTMLTextAreaElement | null>>([]);
  const good = verdicts.filter((v) => v && v.level !== "wrong").length;
  const done = good === count;

  useEffect(() => {
    if (done) markLessonCompleted(progressKey);
  }, [done, progressKey]);

  function insert(word: string) {
    edit(focus, (text) => `${text}${text && !text.endsWith(" ") ? " " : ""}${word} `);
    fields.current[focus]?.focus();
  }

  async function runCheck() {
    setBusy(true);
    setVerdicts(
      await Promise.all(
        sentences.map((text) =>
          finalVerdict(checkText(text, check, { minWords, describing }), { task, answer: text, model, note: describing ? "Sentences with هُوَ / هِيَ: the adjectives must agree with the subject." : undefined })
        )
      )
    );
    setBusy(false);
  }

  function edit(index: number, change: (text: string) => string) {
    setSentences((all) => all.map((text, i) => (i === index ? change(text) : text)));
    setVerdicts((all) => all.map((v, i) => (i === index ? null : v)));
  }

  return (
    <Sheet testId="write-part">
      <SheetHeader label={count === 1 ? (done ? "Geprüft" : "Noch nicht geprüft") : `${good} von ${count} ${noun} geprüft und in Ordnung`} ratio={good / count} done={done} testId="write-count" />

      {example && (
        <div dir="rtl" className="flex items-baseline justify-between gap-4 border-b px-5 py-3 sm:px-7">
          <p lang="ar" className="font-arabic text-2xl font-bold leading-[1.8] text-muted-foreground">
            {example}
          </p>
          <p dir="ltr" className="text-sm font-medium text-muted-foreground">
            Beispiel
          </p>
        </div>
      )}

      <div role="list">
        {sentences.map((text, i) => (
          <div key={i} role="listitem">
            <SheetRow number={arabicNumber(i + 1)} state={verdicts[i] && verdicts[i]!.level !== "wrong" ? "right" : "open"} ruled={i > 0}>
              <textarea
                ref={(el) => {
                  fields.current[i] = el;
                }}
                lang="ar"
                dir="rtl"
                rows={rows}
                value={text}
                onFocus={() => setFocus(i)}
                onChange={(event) => edit(i, () => event.target.value)}
                aria-label={`Text ${i + 1}`}
                data-testid={`write-sentence-${i}`}
                className={cn("min-h-20 w-full resize-y rounded-2xl border bg-background px-4 py-2 font-arabic text-2xl font-bold leading-[1.9] transition focus-ring", focus === i && "border-primary")}
              />
              {verdicts[i] && <VerdictNote level={verdicts[i]!.level} messages={verdicts[i]!.messages} model={model} testId={`write-verdict-${i}`} />}
            </SheetRow>
          </div>
        ))}
      </div>

      {words.length > 0 && (
        <div className="border-t bg-muted/30 px-5 py-4 sm:px-7">
          <p className="mb-2 text-sm font-semibold text-muted-foreground">Wörter zur Hilfe – tippe ein Wort an, es kommt in {count === 1 ? "den Text" : `Satz ${focus + 1}`}:</p>
          <div dir="rtl" className="flex flex-wrap gap-1.5">
            {words.map((word) => (
              <button key={word} type="button" onClick={() => insert(word)} data-testid={`write-word-${word}`} className={cn(tileClass, "min-h-9 px-2.5 text-lg leading-tight")}>
                <span lang="ar">{word}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <CheckBar onCheck={() => void runCheck()} disabled={busy} busy={busy}>Schreib {count === 1 ? "deinen Text" : "die Sätze"} und tippe dann auf „Prüfen“.</CheckBar>
    </Sheet>
  );
}
