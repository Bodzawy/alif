"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { CheckCircle2, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MixedText } from "@/components/ui/mixed-text";
import type { Dialogue } from "@/data/types";
import { sleep } from "@/lib/audio/narrate";
import { createNarrator, readMuted, type Narrator } from "@/lib/audio/narration";
import { getLessonProgress, markLessonCompleted, subscribeProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

import { DialogueBubble, DialogueToggles } from "./dialogue-bubble";
import { speakLine } from "./speak";
import { useT } from "@/i18n/use-locale";

// Stage 1 "Gespräch anhören": the whole dialogue, each speaker in their own
// voice, line after line on ONE audio element (no overlap). Every line can be
// played on its own; the dialogue can be paused, continued and replayed.
// After every line was heard, a short question checks understanding; a right
// answer completes the step.

/** Pause between two turns of the dialogue. */
const TURN_GAP_MS = 400;

const noop = () => () => undefined;

export function DialogueListen({ dialogue, progressKey, translation = true, silent = false, textHidden = false, completes = true }: { /** false: hearing/answering does not complete the step (other parts of the page do). */ completes?: boolean; dialogue: Dialogue; progressKey: string; /** true: only the sound – the lines are not shown (listening exercise). */ textHidden?: boolean; /** false: no German translation under the lines. */ translation?: boolean; /** true: the dialogue is only read (no sound, no play buttons); the question is open at once. */ silent?: boolean }) {
  const pictures = dialogue.question?.images;
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const completed = useSyncExternalStore(subscribeProgress, () => Boolean(getLessonProgress(progressKey).completedAt), () => false);
  const narrator = useRef<Narrator | null>(null);
  const run = useRef<AbortController | null>(null);
  /** Where "Weiter" continues after a pause. */
  const resumeAt = useRef(0);
  const [current, setCurrent] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "playing" | "paused">("idle");
  const [heard, setHeard] = useState<ReadonlySet<string>>(() => new Set());
  const [showGerman, setShowGerman] = useState(translation);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [note, setNote] = useState<string | null>(null);
  const [answer, setAnswer] = useState<number | null>(null);
  const t = useT();
  const [muted, setMuted] = useState(false);

  if (!silent && !narrator.current && hydrated) narrator.current = createNarrator({ baseUrl: "", available: [] });

  useEffect(() => {
    setMuted(readMuted());
    return () => {
      run.current?.abort();
      narrator.current?.stop();
    };
  }, []);

  const speakerOf = (id: string) => dialogue.speakers.find((s) => s.id === id)!;
  const allHeard = silent || dialogue.lines.every((line) => heard.has(line.id));

  // Without a question, hearing every line completes the step.
  useEffect(() => {
    if (completes && allHeard && !dialogue.question) markLessonCompleted(progressKey);
  }, [completes, allHeard, dialogue.question, progressKey]);

  async function play(from: number, to: number) {
    const n = narrator.current;
    if (!n) return;
    n.unlock();
    run.current?.abort();
    const controller = new AbortController();
    run.current = controller;
    const { signal } = controller;
    setStatus("playing");
    setNote(null);
    for (let i = from; i <= to; i++) {
      const line = dialogue.lines[i]!;
      resumeAt.current = i;
      setCurrent(i);
      const result = await speakLine(n, line.exercise.modelText, speakerOf(line.speaker).voice, signal, line.id);
      if (signal.aborted) return;
      if (result === "skipped" && !n.isMuted()) setNote("Der Ton konnte gerade nicht geladen werden. Du kannst den Text trotzdem lesen.");
      setHeard((h) => (h.has(line.id) ? h : new Set(h).add(line.id)));
      if (i < to) await sleep(TURN_GAP_MS, signal);
      if (signal.aborted) return;
    }
    resumeAt.current = 0;
    setCurrent(null);
    setStatus("idle");
  }

  function pause() {
    run.current?.abort();
    narrator.current?.stop();
    setStatus("paused");
  }

  function toggleMute() {
    const value = !muted;
    setMuted(value);
    narrator.current?.setMuted(value);
  }

  function choose(i: number) {
    setAnswer(i);
    if (completes && dialogue.question && i === dialogue.question.answer) markLessonCompleted(progressKey);
  }

  const last = dialogue.lines.length - 1;

  /** Like the book page: with pictures that are read (not heard), the question stands above the dialogue. */
  const questionFirst = silent && Boolean(pictures);
  const questionSection = dialogue.question && (allHeard || pictures) && (
        <section className={cn("animate-fade-in rounded-3xl border bg-card p-5 shadow-card sm:p-6", questionFirst ? "mb-6" : "mt-6")} aria-label={t("Frage")} data-testid="dialogue-question">
          <p className="text-lg font-semibold">
            <MixedText text={t(dialogue.question.prompt)} />
          </p>
          <ul className={cn("mt-4 gap-2", pictures ? "grid grid-cols-2 gap-4" : "flex flex-col")}>
            {dialogue.question.options.map((option, i) => {
              const chosen = answer === i;
              const right = i === dialogue.question!.answer;
              return (
                <li key={option}>
                  <button
                    type="button"
                    disabled={!allHeard}
                    onClick={() => choose(i)}
                    data-testid={`answer-${i}`}
                    data-chosen={chosen}
                    className={cn(
                      "min-h-12 w-full rounded-2xl border px-4 py-3 text-left font-medium transition focus-ring disabled:cursor-not-allowed disabled:opacity-70",
                      pictures && "flex h-full flex-col items-center gap-2 text-center",
                      chosen && right ? "border-success bg-success-soft" : chosen ? "border-destructive/50 bg-destructive/5" : "bg-background hover:bg-muted"
                    )}
                  >
                    {pictures?.[i] && <Image src={pictures[i].src} alt={pictures[i].alt} width={210} height={457} unoptimized className="h-56 w-auto rounded-xl border bg-white sm:h-64" data-testid={`answer-image-${i}`} />}
                    {t(option)}
                  </button>
                </li>
              );
            })}
          </ul>
          <p aria-live="polite" className="mt-3 min-h-6 text-sm font-semibold" data-testid="answer-feedback">
            {!allHeard ? <span className="text-muted-foreground">{t("Hör zuerst den ganzen Dialog an, dann wähl das Bild.")}</span> : answer === null ? "" : answer === dialogue.question.answer ? <span className="text-success">{t("Sehr gut! Genau das sagen sie.")}</span> : <span className="text-muted-foreground">{t("Nicht ganz. Hör noch einmal zu und versuch es nochmal.")}</span>}
          </p>
        </section>
      );

  return (
    <div data-testid="dialogue-listen" data-status={status} data-current={current ?? ""}>
      {questionFirst && questionSection}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {hydrated && completed ? (
          <p className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow" data-testid="step-completed">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> {t("Geschafft")}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground" data-testid="dialogue-intro">
            {!silent && `${t("Hör dir das Gespräch an.")} `}{t(dialogue.intro)}
          </p>
        )}
        {!silent && <Button variant="secondary" onClick={toggleMute} aria-pressed={muted} aria-label={muted ? t("Ton einschalten") : t("Ton ausschalten")} className="min-h-12 min-w-12" data-testid="mute-toggle">
          {muted ? <VolumeX className="h-5 w-5" aria-hidden /> : <Volume2 className="h-5 w-5" aria-hidden />}
        </Button>}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        {!silent && (status === "playing" ? (
          <Button size="lg" variant="secondary" onClick={pause} data-testid="dialogue-pause" className="min-h-12">
            <Pause className="h-5 w-5" aria-hidden /> {t("Pause")}
          </Button>
        ) : status === "paused" ? (
          <Button size="lg" onClick={() => void play(resumeAt.current, last)} data-testid="dialogue-resume" className="min-h-12">
            <Play className="h-5 w-5" aria-hidden /> {t("Weiter")}
          </Button>
        ) : (
          <Button size="lg" onClick={() => void play(0, last)} disabled={!narrator.current} data-testid="dialogue-play-all" className="min-h-12">
            <Play className="h-5 w-5" aria-hidden /> {t("Dialog anhören")}
          </Button>
        ))}
        {!silent && (status === "paused" || heard.size > 0) && (
          <Button size="lg" variant="secondary" onClick={() => void play(0, last)} data-testid="dialogue-replay" className="min-h-12">
            <RotateCcw className="h-5 w-5" aria-hidden /> {t("Nochmal")}
          </Button>
        )}
        {!textHidden && <DialogueToggles withGerman={translation} showGerman={showGerman} showTransliteration={showTransliteration} onGerman={() => setShowGerman((v) => !v)} onTransliteration={() => setShowTransliteration((v) => !v)} />}
      </div>

      {note && (
        <p role="status" className="mb-4 rounded-2xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm" data-testid="dialogue-note">
          {t(note)}
        </p>
      )}

      {!textHidden && <ol className="flex flex-col gap-4 rounded-[2rem] border border-primary/10 bg-card/60 p-3 sm:p-5" aria-label={t("Gespräch")} data-testid="dialogue-lines">
        {dialogue.lines.map((line, i) => {
          const speaker = speakerOf(line.speaker);
          return (
            <DialogueBubble
              key={line.id}
              line={line}
              speaker={speaker}
              first={speaker.id === dialogue.speakers[0].id}
              showGerman={showGerman}
              showTransliteration={showTransliteration}
              state={current === i ? "playing" : heard.has(line.id) ? "done" : "idle"}
              actions={silent ? undefined : (
                <Button variant="secondary" size="sm" onClick={() => void play(i, i)} disabled={!narrator.current} data-testid={`play-line-${line.id}`} aria-label={`${t("Anhören")}: ${t(line.german)}`}>
                  <Volume2 className="h-4 w-4" aria-hidden /> {t("Anhören")}
                </Button>
              )}
            />
          );
        })}
      </ol>}

      {!questionFirst && questionSection}
    </div>
  );
}
