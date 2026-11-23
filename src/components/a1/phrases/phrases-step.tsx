"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import { CheckCircle2 } from "lucide-react";

import { GuidedSteps } from "@/components/a1/guided/guided-sound-words";
import type { GuidedBlock } from "@/components/a1/guided/guided-flow";
import type { GuidedView } from "@/components/a1/sound-words-step";
import { usePracticeSession } from "@/components/a1/use-practice-session";
import { PronunciationExercise } from "@/components/pronunciation/pronunciation-exercise";
import { MixedText } from "@/components/ui/mixed-text";
import type { PhraseGroup, PhraseItem } from "@/data/types";
import { getLessonProgress, markExercisePassed, markLessonCompleted, subscribeProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { useT } from "@/i18n/use-locale";

// Step type "phrases": the expressions of a textbook table as cards – Arabic,
// transliteration, German, who says it (masculine / feminine form) – each with
// "Anhören" and "Aufnehmen" (PronunciationExercise: the same /api/pronunciation
// evaluation as every A1 exercise). The step is done when every expression was
// right once; passed expressions stay marked.
// GuidedPhrases: the same cards in guided mode (guided/guided-sound-words.tsx) –
// after one tap each expression is played in its speaker's voice and the child
// repeats it, without buttons; the buttons are the fallback.

const noop = () => () => undefined;

const GENDER = {
  m: { sign: "♂", className: "border-primary/50 bg-primary-soft text-primary" },
  f: { sign: "♀", className: "border-accent/60 bg-accent-soft text-accent-foreground" },
} as const;

/** The expressions in book order, each played as in "Anhören" (the speaker's recording). */
export function phraseBlocks(groups: PhraseGroup[]): GuidedBlock[] {
  return groups.flatMap((group) => group.items.map(({ exercise }) => ({ id: exercise.id, text: exercise.modelText, target: exercise.target, voice: exercise.voice, line: exercise.line })));
}

export function GuidedPhrases({ groups, progressKey }: { groups: PhraseGroup[]; progressKey: string }) {
  const blocks = useMemo(() => phraseBlocks(groups), [groups]);
  return (
    <GuidedSteps blocks={blocks} progressKey={progressKey} intro="Hör zu und sprich nach – Ausdruck für Ausdruck. Das Mikrofon hört dir zu." arrows="bottom">
      {(guided) => <PhrasesStep groups={groups} progressKey={progressKey} guided={guided} />}
    </GuidedSteps>
  );
}

export function PhrasesStep({ groups, progressKey, guided }: { groups: PhraseGroup[]; progressKey: string; guided?: GuidedView }) {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const stored = useSyncExternalStore(subscribeProgress, () => getLessonProgress(progressKey), () => null);
  const session = usePracticeSession();
  const t = useT();
  const items = useMemo(() => groups.flatMap((group) => group.items), [groups]);
  const isPassed = (item: PhraseItem) => (guided ? guided.passed(item.exercise.id) : session.passed.has(item.exercise.id) || Boolean(stored?.passed.includes(item.id)));
  const passedCount = items.filter(isPassed).length;
  const completed = Boolean(stored?.completedAt) || passedCount === items.length;

  useEffect(() => {
    for (const id of session.passed) markExercisePassed(progressKey, id);
    if (items.every((item) => session.passed.has(item.exercise.id) || getLessonProgress(progressKey).passed.includes(item.id))) markLessonCompleted(progressKey);
  }, [session.passed, items, progressKey]);

  return (
    <div data-testid="phrases-step">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-muted-foreground" data-testid="phrases-count" aria-live="polite">
          {hydrated ? t("{n} von {total} richtig gesprochen", { n: passedCount, total: items.length }) : `${items.length}`}
        </p>
        {hydrated && completed && !guided && (
          <p className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow" data-testid="step-completed">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> {t("Geschafft")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-8">
        {groups.map((group) => (
          <section key={group.id} aria-labelledby={`group-${group.id}`} data-testid={`phrase-group-${group.id}`}>
            <h2 id={`group-${group.id}`} className="mb-3 text-lg font-bold">
              {t(group.title)}
            </h2>
            {group.image && <Image src={group.image.src} alt={t(group.image.alt)} width={1200} height={800} unoptimized className="mx-auto mb-4 h-auto w-full max-w-xl rounded-3xl border bg-card" data-testid={`phrase-group-image-${group.id}`} />}
            {group.flow && guided ? (
              <FlowText group={group} guided={guided} />
            ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {group.items.map((item) => {
                const card = (
                  <div
                    className={cn("flex h-full flex-col rounded-3xl border bg-card p-4 shadow-card sm:p-5", guided && "pb-16 pt-16 sm:pb-16 sm:pt-16", isPassed(item) && hydrated && "border-success/50")}
                    data-testid={`phrase-${item.id}`}
                    data-gender={item.gender}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {item.tag ? (
                        // Whom it is said to (zu einem Mann / zu einer Frau): large and coloured, so the form is not missed.
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-3 py-1",
                            item.gender ? cn("border-2 text-sm font-bold sm:text-base", GENDER[item.gender].className) : "border bg-muted text-xs font-semibold text-muted-foreground"
                          )}
                          data-testid={`phrase-tag-${item.id}`}
                        >
                          {item.gender && (
                            <span aria-hidden className="text-base sm:text-lg">
                              {GENDER[item.gender].sign}
                            </span>
                          )}
                          {t(item.tag)}
                        </span>
                      ) : (
                        <span />
                      )}
                      {hydrated && isPassed(item) && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-success" data-testid={`phrase-passed-${item.id}`}>
                          <CheckCircle2 className="h-4 w-4" aria-hidden /> {t("Richtig")}
                        </span>
                      )}
                    </div>
                    <p lang="ar" dir="rtl" className="mt-2 text-right font-arabic text-4xl font-bold leading-[1.9]" data-testid={`phrase-arabic-${item.id}`}>
                      {item.arabic}
                    </p>
                    <p className="text-sm font-medium italic text-muted-foreground" data-testid={`phrase-translit-${item.id}`}>
                      {item.transliteration}
                    </p>
                    <p className="font-semibold" data-testid={`phrase-german-${item.id}`}>
                      {t(item.german)}
                      {item.literal && (
                        <span className="font-normal text-muted-foreground">
                          {" "}
                          ({t("wörtlich")}: {t(item.literal)})
                        </span>
                      )}
                    </p>
                    {!guided && (
                      <PronunciationExercise
                        exercise={item.exercise}
                        locked={session.isLocked(item.exercise.id)}
                        onBusyChange={session.busyHandler(item.exercise.id)}
                        onResult={session.resultHandler(item.exercise.id)}
                        className="mt-auto pt-4"
                        simpleFeedback
                      />
                    )}
                  </div>
                );
                return (
                  <li key={item.id} className="grid">
                    {guided ? guided.frame(item.exercise.id, card) : card}
                  </li>
                );
              })}
            </ul>
            )}
            {group.note && (
              <p className="mt-3 rounded-2xl border border-primary/15 bg-primary-soft px-4 py-3 text-sm" data-testid={`phrase-note-${group.id}`}>
                <MixedText text={t(group.note)} />
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}

/**
 * A running text (group.flow) in guided mode: all sentences as ONE passage. The sentence whose turn it is
 * is larger and coloured (and scrolled into view); the ones already said turn green. Below it the
 * transliteration and the German of that sentence.
 */
function FlowText({ group, guided }: { group: PhraseGroup; guided: GuidedView }) {
  const t = useT();
  const spans = useRef(new Map<string, HTMLSpanElement>());
  const firstOpen = group.items.find((item) => guided.mark(item.exercise.id) !== "done") ?? group.items[0]!;
  const current = group.items.find((item) => item.exercise.id === guided.active);
  const shown = current ?? null;

  useEffect(() => {
    if (!guided.active) return;
    const el = spans.current.get(guided.active);
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top >= 80 && r.bottom <= window.innerHeight - 120) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
  }, [guided.active]);

  const card = (
    <div className="rounded-3xl border bg-card p-5 pb-16 pt-14 shadow-card sm:p-8 sm:pb-16 sm:pt-14" data-testid={`flow-${group.id}`}>
      <p lang="ar" dir="rtl" className="text-right font-arabic text-2xl font-bold leading-[2.4] sm:text-3xl sm:leading-[2.4]">
        {group.items.map((item) => {
          const id = item.exercise.id;
          const mark = guided.mark(id);
          const isActive = id === guided.active;
          return (
            <span key={item.id}>
              <span
                ref={(el) => {
                  if (el) spans.current.set(id, el);
                  else spans.current.delete(id);
                }}
                data-testid={`flow-${item.id}`}
                data-state={isActive ? "active" : (mark ?? "waiting")}
                className={cn(
                  "rounded-xl px-1 transition-[font-size,color,background-color] duration-300",
                  isActive && "bg-primary-soft text-[1.35em] text-primary",
                  !isActive && mark === "done" && "text-success",
                  !isActive && mark === "practice" && "text-accent-foreground",
                  !isActive && !mark && (guided.active ? "text-foreground/70" : "text-foreground")
                )}
              >
                {item.arabic}
              </span>{" "}
            </span>
          );
        })}
      </p>
      {shown && (
        <div className="mt-4 border-t pt-3" data-testid="flow-current">
          <p className="text-sm font-medium italic text-muted-foreground">{shown.transliteration}</p>
          <p className="font-semibold">{t(shown.german)}</p>
        </div>
      )}
    </div>
  );
  return <div>{guided.frame((guided.active ?? firstOpen.exercise.id), card, true)}</div>;
}
