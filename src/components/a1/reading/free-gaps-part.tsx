"use client";

import { useEffect, useState } from "react";

import { CheckBar, Sheet, SheetHeader, SheetRow, VerdictNote } from "@/components/a1/worksheet";
import type { FreeGapItem } from "@/data/types";
import { markLessonCompleted } from "@/lib/progress";

import { finalVerdict } from "./ai-check";
import { checkGap, type CheckContext, type Verdict } from "./writing-check";

// "أكمل الجمل بكلمات من عندك": sentences with gaps the learner fills with his own words (typing). "Prüfen"
// checks every gap (Arabic letters, a known word, an adjective that agrees with its noun) and shows a model
// sentence. A sentence counts when no gap is wrong; the part is done when all sentences count.

type Result = { level: Verdict["level"]; messages: string[]; model?: string };

export function FreeGapsPart({ items, task, check, progressKey }: { items: FreeGapItem[]; task?: string; check: CheckContext; progressKey: string }) {
  const [busy, setBusy] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, Result>>({});
  const gapKeys = (item: FreeGapItem) => item.parts.flatMap((part, n) => (part === null ? [`${item.id}:${n}`] : []));
  const doneCount = items.filter((item) => results[item.id] && results[item.id]!.level !== "wrong").length;
  const done = doneCount === items.length;

  useEffect(() => {
    if (done) markLessonCompleted(progressKey);
  }, [done, progressKey]);

  function modelOf(item: FreeGapItem) {
    let gap = 0;
    return item.parts.map((part) => (part === null ? (item.gaps?.[gap++]?.model ?? "…") : part)).join(" ");
  }

  async function runCheck() {
    setBusy(true);
    const entries = await Promise.all(
      items.map(async (item): Promise<[string, Result]> => {
        const verdicts = gapKeys(item).map((key, g) => checkGap(values[key] ?? "", item.gaps?.[g]?.agrees, check));
        const local = verdicts.find((v) => v.level === "wrong") ?? verdicts.find((v) => v.level === "hint") ?? verdicts[0]!;
        let gap = 0;
        const filled = item.parts.map((part) => (part === null ? (values[gapKeys(item)[gap++]!] ?? "").trim() : part)).join(" ");
        const sentence = item.parts.map((part) => part ?? "___").join(" ");
        const final = await finalVerdict(local, { task, sentence, answer: filled, model: item.gaps ? modelOf(item) : undefined });
        return [item.id, { level: final.level, messages: final.messages, model: item.gaps ? modelOf(item) : undefined }];
      })
    );
    setResults(Object.fromEntries(entries));
    setBusy(false);
  }

  return (
    <Sheet testId="free-gaps-part">
      <SheetHeader label={`${doneCount} von ${items.length} Sätzen geprüft und in Ordnung`} ratio={doneCount / items.length} done={done} testId="free-gaps-count" />
      <div role="list">
        {items.map((item, i) => {
          const result = results[item.id];
          return (
            <div key={item.id} role="listitem">
              <SheetRow number={item.number} state={result && result.level !== "wrong" ? "right" : "open"} ruled={i > 0} testId={`free-gaps-${item.id}`}>
                <p lang="ar" className="flex flex-wrap items-baseline gap-x-2 gap-y-3 font-arabic text-2xl font-bold leading-[1.9] sm:text-3xl">
                  {item.parts.map((part, n) =>
                    part === null ? (
                      <input
                        key={n}
                        lang="ar"
                        dir="rtl"
                        value={values[`${item.id}:${n}`] ?? ""}
                        onChange={(event) => {
                          setValues((all) => ({ ...all, [`${item.id}:${n}`]: event.target.value }));
                          setResults((all) => Object.fromEntries(Object.entries(all).filter(([id]) => id !== item.id)));
                        }}
                        aria-label={`Satz ${item.number}, Lücke ${n + 1}`}
                        data-testid={`free-gap-${item.id}-${n}`}
                        className="w-44 rounded-lg border-b-2 border-primary/40 bg-background px-2 text-center font-arabic text-2xl font-bold transition focus-ring focus:border-primary"
                      />
                    ) : (
                      <span key={n}>{part}</span>
                    )
                  )}
                </p>
                {result && <VerdictNote level={result.level} messages={result.messages} model={result.model} testId={`free-gaps-verdict-${item.id}`} />}
              </SheetRow>
            </div>
          );
        })}
      </div>
      <CheckBar onCheck={() => void runCheck()} disabled={busy} busy={busy}>Schreib in jede Lücke ein Wort und tippe dann auf „Prüfen“.</CheckBar>
    </Sheet>
  );
}
