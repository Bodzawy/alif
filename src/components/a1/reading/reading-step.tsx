"use client";

import { useEffect, useMemo, useSyncExternalStore } from "react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

import { ClozeStep } from "@/components/a1/cloze/cloze-step";
import { MatchStep } from "@/components/a1/match/match-step";
import { QuizList } from "@/components/a1/quiz/quiz-list";
import { Sheet, TaskHeading } from "@/components/a1/worksheet";
import type { PhraseGroup, ReadingPart } from "@/data/types";
import { getLessonProgress, markLessonCompleted, subscribeProgress } from "@/lib/progress";

import { FillTablePart } from "./fill-table-part";
import { FreeGapsPart } from "./free-gaps-part";
import { MarkPart } from "./mark-part";
import { NumberPart } from "./number-part";
import { WritePart } from "./write-part";
import type { CheckContext } from "./writing-check";

// A worksheet page: optionally a text that is only READ (no sound, no microphone; step type "phrases"
// with `reading`), and below it ALL its tasks on one page, in book order. Every task keeps its own
// progress (key + "#n"); the page is done when all tasks are done. Parts that only show text ("text")
// have nothing to do and do not count.

/** The book's task line of a part (Arabic and German) – what the teacher is told the exercise asks. */
const taskOf = (part: ReadingPart) => (part.heading ? `${part.heading.arabic} / ${part.heading.german}` : undefined);

const partKey = (progressKey: string, index: number) => `${progressKey}#${index}`;

export function ReadingStep({ group, parts, lexicon, adjectives, progressKey }: { group?: PhraseGroup; parts: ReadingPart[]; /** Stems of the words of the lesson and of its adjectives – for checking what the learner writes. */ lexicon: string[]; adjectives: string[]; progressKey: string }) {
  const check = useMemo<CheckContext>(() => ({ lexicon: new Set(lexicon), adjectives: new Set(adjectives) }), [lexicon, adjectives]);
  const tasks = parts.map((part, i) => i).filter((i) => parts[i]!.kind !== "text");
  const doneCount = useSyncExternalStore(
    subscribeProgress,
    () => tasks.filter((i) => getLessonProgress(partKey(progressKey, i)).completedAt).length,
    () => 0
  );
  const allDone = tasks.length > 0 && doneCount === tasks.length;
  const completed = useSyncExternalStore(subscribeProgress, () => Boolean(getLessonProgress(progressKey).completedAt), () => false);

  useEffect(() => {
    if (allDone) markLessonCompleted(progressKey);
  }, [allDone, progressKey]);

  const [greeting, ...body] = group?.items ?? [];

  return (
    <div className="flex flex-col gap-8" data-testid="reading-step">
      {(allDone || completed) && (
        <p className="inline-flex w-fit items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow" data-testid="step-completed">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Geschafft
        </p>
      )}

      {group && (
        <Sheet testId="reading-text">
          <article className="px-6 py-7 sm:px-10 sm:py-9">
            {group.titleArabic && (
              <h2 lang="ar" dir="rtl" className="mb-5 border-b pb-3 font-arabic text-2xl font-bold text-primary">
                {group.titleArabic}
              </h2>
            )}
            {greeting && (
              <p lang="ar" dir="rtl" className="mb-2 font-arabic text-3xl font-bold leading-[2.1]">
                {greeting.arabic}
              </p>
            )}
            <p lang="ar" dir="rtl" className="font-arabic text-3xl font-bold leading-[2.3] sm:text-[2rem]" data-testid="reading-body">
              {body.map((item) => item.arabic).join(" ")}
            </p>
          </article>
        </Sheet>
      )}

      {parts.map((part, i) => (
        <section key={i} aria-label={part.heading?.german} data-testid={`reading-part-${i}`}>
          {part.heading && <TaskHeading arabic={part.heading.arabic} german={part.heading.german} />}
          {part.kind === "quiz" ? (
            <QuizList items={part.items} progressKey={partKey(progressKey, i)} />
          ) : part.kind === "cloze" ? (
            <ClozeStep items={part.items} bank={part.bank} progressKey={partKey(progressKey, i)} />
          ) : part.kind === "match" ? (
            <MatchStep match={part.match} progressKey={partKey(progressKey, i)} />
          ) : part.kind === "number" ? (
            <NumberPart lines={part.lines ?? (group?.items ?? []).map((item) => item.arabic)} words={part.words} progressKey={partKey(progressKey, i)} />
          ) : part.kind === "write" ? (
            <WritePart count={part.count} words={part.words} example={part.example} rows={part.rows} noun={part.noun} minWords={part.minWords} describing={part.describing} model={part.model} task={taskOf(part)} check={check} progressKey={partKey(progressKey, i)} />
          ) : part.kind === "mark" ? (
            <MarkPart lines={part.lines} words={part.words} label={part.label} progressKey={partKey(progressKey, i)} />
          ) : part.kind === "free-gaps" ? (
            <FreeGapsPart items={part.items} task={taskOf(part)} check={check} progressKey={partKey(progressKey, i)} />
          ) : part.kind === "fill-table" ? (
            <FillTablePart first={part.first} columns={part.columns} rows={part.rows} task={taskOf(part)} check={check} progressKey={partKey(progressKey, i)} />
          ) : (
            <div className="grid gap-4 md:grid-cols-2" data-testid={`reading-blocks-${i}`}>
              {part.blocks.map((block, n) => (
                <div key={n} className="overflow-hidden rounded-3xl border-2 bg-card shadow-card">
                  {block.image && <Image src={block.image.src} alt={block.image.alt} width={900} height={500} unoptimized className="h-auto w-full border-b" />}
                  <div className="px-5 py-4">
                    {block.lines.map((line, l) => (
                      <p key={l} lang="ar" dir="rtl" className="font-arabic text-2xl font-bold leading-[2]">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
