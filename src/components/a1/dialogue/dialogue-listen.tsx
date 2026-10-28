"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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

// Stage 1 "Gespräch anhören": the whole dialogue, each speaker in their own
// voice, line after line on ONE audio element (no overlap). Every line can be
// played on its own; the dialogue can be paused, continued and replayed.
// After every line was heard, a short question checks understanding; a right
// answer completes the step.

/** Pause between two turns of the dialogue. */
const TURN_GAP_MS = 400;

const noop = () => () => undefined;

export function DialogueListen({ dialogue, progressKey }: { dialogue: Dialogue; progressKey: string }) {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const completed = useSyncExternalStore(subscribeProgress, () => Boolean(getLessonProgress(progressKey).completedAt), () => false);
  const narrator = useRef<Narrator | null>(null);
  const run = useRef<AbortController | null>(null);
  /** Where "Weiter" continues after a pause. */
  const resumeAt = useRef(0);
  const [current, setCurrent] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "playing" | "paused">("idle");
  const [heard, setHeard] = useState<ReadonlySet<string>>(() => new Set());
  const [showGerman, setShowGerman] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [note, setNote] = useState<string | null>(null);
  const [answer, setAnswer] = useState<number | null>(null);
  const [muted, setMuted] = useState(false);

  if (!narrator.current && hydrated) narrator.current = createNarrator({ baseUrl: "", available: [] });

  useEffect(() => {
    setMuted(readMuted());
    return () => {
      run.current?.abort();
      narrator.current?.stop();
    };
  }, []);

  const speakerOf = (id: string) => dialogue.speakers.find((s) => s.id === id)!;
  const allHeard = dialogue.lines.every((line) => heard.has(line.id));

  // Without a question, hearing every line completes the step.
  useEffect(() => {
    if (allHeard && !dialogue.question) markLessonCompleted(progressKey);
  }, [allHeard, dialogue.question, progressKey]);

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
    if (dialogue.question && i === dialogue.question.answer) markLessonCompleted(progressKey);
  }

  const last = dialogue.lines.length - 1;

  return (
    <div data-testid="dialogue-listen" data-status={status} data-current={current ?? ""}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {hydrated && completed ? (
          <p className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow" data-testid="step-completed">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Geschafft
          </p>
        ) : (
          <p className="text-sm text-muted-foreground" data-testid="dialogue-intro">Hör dir das Gespräch an. {dialogue.intro}</p>
        )}
        <Button variant="secondary" onClick={toggleMute} aria-pressed={muted} aria-label={muted ? "Ton einschalten" : "Ton ausschalten"} className="min-h-12 min-w-12" data-testid="mute-toggle">
          {muted ? <VolumeX className="h-5 w-5" aria-hidden /> : <Volume2 className="h-5 w-5" aria-hidden />}
        </Button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        {status === "playing" ? (
          <Button size="lg" variant="secondary" onClick={pause} data-testid="dialogue-pause" className="min-h-12">
            <Pause className="h-5 w-5" aria-hidden /> Pause
          </Button>
        ) : status === "paused" ? (
          <Button size="lg" onClick={() => void play(resumeAt.current, last)} data-testid="dialogue-resume" className="min-h-12">
            <Play className="h-5 w-5" aria-hidden /> Weiter
          </Button>
        ) : (
          <Button size="lg" onClick={() => void play(0, last)} disabled={!narrator.current} data-testid="dialogue-play-all" className="min-h-12">
            <Play className="h-5 w-5" aria-hidden /> Dialog anhören
          </Button>
        )}
        {(status === "paused" || heard.size > 0) && (
          <Button size="lg" variant="secondary" onClick={() => void play(0, last)} data-testid="dialogue-replay" className="min-h-12">
            <RotateCcw className="h-5 w-5" aria-hidden /> Nochmal
          </Button>
        )}
        <DialogueToggles showGerman={showGerman} showTransliteration={showTransliteration} onGerman={() => setShowGerman((v) => !v)} onTransliteration={() => setShowTransliteration((v) => !v)} />
      </div>

      {note && (
        <p role="status" className="mb-4 rounded-2xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm" data-testid="dialogue-note">
          {note}
        </p>
      )}

      <ol className="flex flex-col gap-4 rounded-[2rem] border border-primary/10 bg-card/60 p-3 sm:p-5" aria-label="Gespräch" data-testid="dialogue-lines">
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
              actions={
                <Button variant="secondary" size="sm" onClick={() => void play(i, i)} disabled={!narrator.current} data-testid={`play-line-${line.id}`} aria-label={`Anhören: ${line.german}`}>
                  <Volume2 className="h-4 w-4" aria-hidden /> Anhören
                </Button>
              }
            />
          );
        })}
      </ol>

      {dialogue.question && allHeard && (
        <section className="mt-6 animate-fade-in rounded-3xl border bg-card p-5 shadow-card sm:p-6" aria-label="Frage" data-testid="dialogue-question">
          <p className="text-lg font-semibold">
            <MixedText text={dialogue.question.prompt} />
          </p>
          <ul className="mt-4 flex flex-col gap-2">
            {dialogue.question.options.map((option, i) => {
              const chosen = answer === i;
              const right = i === dialogue.question!.answer;
              return (
                <li key={option}>
                  <button
                    type="button"
                    onClick={() => choose(i)}
                    data-testid={`answer-${i}`}
                    data-chosen={chosen}
                    className={cn(
                      "min-h-12 w-full rounded-2xl border px-4 py-3 text-left font-medium transition focus-ring",
                      chosen && right ? "border-success bg-success-soft" : chosen ? "border-destructive/50 bg-destructive/5" : "bg-background hover:bg-muted"
                    )}
                  >
                    {option}
                  </button>
                </li>
              );
            })}
          </ul>
          <p aria-live="polite" className="mt-3 min-h-6 text-sm font-semibold" data-testid="answer-feedback">
            {answer === null ? "" : answer === dialogue.question.answer ? <span className="text-success">Sehr gut! Genau das sagen sie.</span> : <span className="text-muted-foreground">Nicht ganz. Hör noch einmal zu und versuch es nochmal.</span>}
          </p>
        </section>
      )}
    </div>
  );
}
