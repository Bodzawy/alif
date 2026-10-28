"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { CheckCircle2, Loader2, Mic, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";

import { evaluateUtterance } from "@/components/a1/guided/evaluate";
import { useGuidedFlow, type BlockMark, type GuidedBlock, type GuidedDeps } from "@/components/a1/guided/guided-flow";
import { usePracticeSession } from "@/components/a1/use-practice-session";
import { PronunciationExercise } from "@/components/pronunciation/pronunciation-exercise";
import { Button } from "@/components/ui/button";
import type { Dialogue, DialogueLine } from "@/data/types";
import { openGuidedMic, type GuidedMic } from "@/lib/audio/guided-mic";
import { sleep } from "@/lib/audio/narrate";
import { createNarrator, readMuted, type Narrator } from "@/lib/audio/narration";
import { getLessonProgress, markExercisePassed, markLessonCompleted, subscribeProgress } from "@/lib/progress";
import type { StudentFeedback } from "@/lib/pronunciation/client";
import { GERMAN_CUES } from "@/lib/pronunciation/cues";
import { cn } from "@/lib/utils";

import { AddresseeBadge, DialogueBubble, DialogueToggles, splitAddressee } from "./dialogue-bubble";
import { speakLine } from "./speak";
import { useT } from "@/i18n/use-locale";

// Stage 2 "Nachsprechen" (every line) and stage 3 "Rollenspiel" (the
// learner's role only; the app speaks the other role). Both run on the guided
// flow of A1 "Wörter" (src/components/a1/guided/guided-flow.ts):
//   play (repeat: the line's model · role-play: the partner's line(s))
//   → listen (the microphone hears the learner; silence = try again)
//   → check (the SAME evaluation as every A1 exercise: /api/pronunciation with
//     Azure + IQRA and the condition rules) → right: "Super!", next
//   → wrong: feedback, play again, listen again – as often as needed, never skipped.
// A role-play is done when the learner has spoken EVERY role: first the first
// one, then (marked green) the next – each role is done once all its lines were right.
// Without a microphone, or when the evaluation keeps failing, the step falls
// back to buttons (PronunciationExercise) – the same evaluation, by hand.

type Mode = "repeat" | "roleplay";

/** When nothing can be played (muted, offline, no partner line): a moment before listening. */
const SILENT_PLAY_MS = 800;
/** Pause between two partner lines. */
const TURN_GAP_MS = 400;

const CAPTION = {
  play: "Hör zu …",
  partner: (name: string) => `${name} spricht …`,
  retry: "Nochmal versuchen",
  listen: "Sprich jetzt!",
  check: "Einen Moment …",
  right: "Sehr gut!",
} as const;

const NOTE = {
  mic: "Das Mikrofon ist nicht verfügbar. Erlaube das Mikrofon im Browser – oder benutze die Knöpfe.",
  service: "Die Auswertung ist gerade nicht erreichbar. Dein Fortschritt bleibt gespeichert. Du kannst die Knöpfe benutzen.",
} as const;

const noop = () => () => undefined;

export function DialogueSpeaking({ dialogue, mode, progressKey }: { dialogue: Dialogue; mode: Mode; progressKey: string }) {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const completed = useSyncExternalStore(subscribeProgress, () => Boolean(getLessonProgress(progressKey).completedAt), () => false);
  const stored = useSyncExternalStore(subscribeProgress, () => getLessonProgress(progressKey), () => null);
  const t = useT();
  const [stageMode, setStageMode] = useState<"start" | "guided" | "fallback">("start");
  const [role, setRole] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const [showGerman, setShowGerman] = useState(true);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [feedback, setFeedback] = useState<{ id: string; feedback: StudentFeedback } | null>(null);
  /** Role-play: the partner line being spoken right now. */
  const [speaking, setSpeaking] = useState<string | null>(null);
  /** Role-play: the partner's last lines after the learner's last line, spoken at the end. */
  const [closing, setClosing] = useState<"no" | "playing" | "done">("no");
  const narrator = useRef<Narrator | null>(null);
  const mic = useRef<GuidedMic | null>(null);
  /** Role-play "Satz vorsprechen": the next play speaks the learner's own line once. */
  const hint = useRef<string | null>(null);
  const cards = useRef(new Map<string, HTMLLIElement>());

  if (!narrator.current && hydrated) narrator.current = createNarrator({ baseUrl: "", available: [] });

  const speakerOf = useCallback((id: string) => dialogue.speakers.find((s) => s.id === id)!, [dialogue.speakers]);
  const roleChoices = useMemo(() => dialogue.roles ?? dialogue.speakers.map((s) => ({ id: s.id, name: s.name, speakers: [s.id], avatar: s.avatar })), [dialogue.roles, dialogue.speakers]);
  /** Role-play: a role is done when every line of it was right (in this step). */
  const roleDone = useCallback(
    (id: string, passed: readonly string[] = stored?.passed ?? []) => {
      const speakers = roleChoices.find((r) => r.id === id)?.speakers ?? [];
      return dialogue.lines.filter((l) => speakers.includes(l.speaker)).every((l) => passed.includes(l.id));
    },
    [roleChoices, dialogue.lines, stored]
  );
  const rolesLeft = mode === "roleplay" && hydrated ? roleChoices.filter((r) => !roleDone(r.id)) : [];
  /** Done when every role was spoken (repeat: when every line was). */
  const completeStep = useCallback(() => {
    const passed = getLessonProgress(progressKey).passed;
    if (mode === "repeat" || roleChoices.every((r) => roleDone(r.id, passed))) markLessonCompleted(progressKey);
  }, [mode, roleChoices, roleDone, progressKey]);
  /** The speakers of the learner's role (a speaker, or a role group of several speakers). */
  const mine = useMemo(() => new Set(role ? (dialogue.roles?.find((r) => r.id === role)?.speakers ?? [role]) : []), [role, dialogue.roles]);
  const learnerLines = useMemo(() => (mode === "repeat" ? dialogue.lines : dialogue.lines.filter((l) => mine.has(l.speaker))), [mode, dialogue.lines, mine]);
  const blocks: GuidedBlock[] = useMemo(() => learnerLines.map((l) => ({ id: l.id, text: l.exercise.modelText, target: l.exercise.target })), [learnerLines]);
  const lineById = useCallback((id: string) => dialogue.lines.find((l) => l.id === id)!, [dialogue.lines]);
  /** Role-play: the partner's lines before a learner line (since the learner's previous line). */
  const partnerBefore = useCallback(
    (id: string) => {
      const at = dialogue.lines.findIndex((l) => l.id === id);
      const before: DialogueLine[] = [];
      for (let i = at - 1; i >= 0 && !mine.has(dialogue.lines[i]!.speaker); i--) before.unshift(dialogue.lines[i]!);
      return before;
    },
    [dialogue.lines, mine]
  );
  const closingLines = useMemo(() => {
    if (mode !== "roleplay" || !role) return [];
    const lastLearner = dialogue.lines.map((l) => mine.has(l.speaker)).lastIndexOf(true);
    return dialogue.lines.slice(lastLearner + 1);
  }, [mode, role, mine, dialogue.lines]);

  const releaseMic = useCallback(() => {
    mic.current?.release();
    mic.current = null;
  }, []);

  useEffect(() => {
    setMuted(readMuted());
    return () => {
      narrator.current?.stop();
      releaseMic();
    };
  }, [releaseMic]);

  const deps: GuidedDeps = useMemo(
    () => ({
      async play(block, signal) {
        const n = narrator.current;
        if (!n) return;
        const line = lineById(block.id);
        let played = false;
        if (mode === "repeat" || hint.current === block.id) {
          hint.current = null;
          played = (await speakLine(n, line.exercise.modelText, speakerOf(line.speaker).voice, signal, line.id)) === "ended";
        } else {
          for (const [k, partner] of partnerBefore(block.id).entries()) {
            if (k > 0) await sleep(TURN_GAP_MS, signal);
            setSpeaking(partner.id);
            played = (await speakLine(n, partner.exercise.modelText, speakerOf(partner.speaker).voice, signal, partner.id)) === "ended" || played;
            if (signal.aborted) return;
          }
          setSpeaking(null);
        }
        if (!played) await sleep(SILENT_PLAY_MS, signal);
      },
      record: (signal) => mic.current?.record(signal) ?? Promise.resolve(null),
      evaluate: (utterance, block, signal) =>
        evaluateUtterance(utterance, block.target, signal, (result) => setFeedback(result.passed ? null : { id: block.id, feedback: result })),
      async praise(signal) {
        const n = narrator.current;
        if (n) await speakLine(n, GERMAN_CUES.super, undefined, signal);
      },
    }),
    [mode, lineById, partnerBefore, speakerOf]
  );

  const flow = useGuidedFlow(blocks, deps, {
    onMark: (id, mark) => mark === "done" && markExercisePassed(progressKey, id),
    onFinished: () => {
      releaseMic();
      if (closingLines.length > 0) setClosing("playing");
      else completeStep();
    },
    onFallback: () => {
      releaseMic();
      setNote(NOTE.service);
      setStageMode("fallback");
    },
  });

  // Role-play: after the learner's last line, the partner closes the conversation.
  useEffect(() => {
    if (closing !== "playing") return;
    const controller = new AbortController();
    void (async () => {
      const n = narrator.current;
      for (const [k, line] of closingLines.entries()) {
        if (k > 0) await sleep(TURN_GAP_MS, controller.signal);
        setSpeaking(line.id);
        if (n) await speakLine(n, line.exercise.modelText, speakerOf(line.speaker).voice, controller.signal, line.id);
        if (controller.signal.aborted) return;
      }
      setSpeaking(null);
      setClosing("done");
      completeStep();
    })();
    return () => controller.abort();
  }, [closing, closingLines, speakerOf, completeStep]);

  // Role-play: the next role to speak is chosen already – the first one, then the one not done yet.
  useEffect(() => {
    if (mode !== "roleplay" || !hydrated || stageMode !== "start" || role !== null) return;
    setRole((roleChoices.find((r) => !roleDone(r.id)) ?? roleChoices[0])!.id);
  }, [mode, hydrated, stageMode, role, roleChoices, roleDone]);

  const stage = flow.state.stage;
  const active = stageMode === "guided" ? flow.active : null;
  const finished = stageMode === "guided" && stage === "finished" && (closingLines.length === 0 || closing === "done");

  // Clear the hint of a wrong attempt once the line is right or another line starts.
  useEffect(() => {
    if (feedback && (feedback.id !== active || stage === "right")) setFeedback(null);
  }, [active, stage, feedback]);

  // Keep the active line in view.
  useEffect(() => {
    const id = speaking ?? active;
    if (!id) return;
    const el = cards.current.get(id);
    if (!el) return;
    const r = el.getBoundingClientRect();
    if (r.top >= 0 && r.bottom <= window.innerHeight) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
  }, [active, speaking]);

  async function start() {
    // Inside the tap: unlock audio (one reused element) and ask for the microphone.
    narrator.current?.unlock();
    try {
      mic.current = await openGuidedMic();
    } catch {
      setNote(NOTE.mic);
      setStageMode("fallback");
      return;
    }
    setClosing("no");
    setFeedback(null);
    // Repeat continues where the learner stopped; a role-play always starts at the beginning of the conversation.
    const marks: Record<string, BlockMark> = {};
    if (mode === "repeat") for (const id of getLessonProgress(progressKey).passed) marks[id] = "done";
    setStageMode("guided");
    flow.start(marks);
  }

  function again() {
    narrator.current?.stop();
    releaseMic();
    setStageMode("start");
    setClosing("no");
    setSpeaking(null);
    if (mode === "roleplay") setRole(null);
  }

  function toggleMute() {
    const value = !muted;
    setMuted(value);
    narrator.current?.setMuted(value);
  }

  // Which lines are shown: repeat – all; role-play – the conversation so far.
  const activeIndex = active ? dialogue.lines.findIndex((l) => l.id === active) : -1;
  const visible = (i: number) => mode === "repeat" || finished || closing !== "no" || i <= activeIndex;
  const caption =
    stage === "play" || stage === "focus"
      ? speaking
        ? CAPTION.partner(speakerOf(lineById(speaking).speaker).name)
        : flow.state.retry
          ? CAPTION.retry
          : CAPTION.play
      : stage === "listen"
        ? CAPTION.listen
        : stage === "check"
          ? CAPTION.check
          : stage === "right"
            ? CAPTION.right
            : "";
  const done = (id: string) => flow.state.marks[id] === "done";
  const learnerSpeaker = role ? (roleChoices.find((r) => r.id === role) ?? null) : null;
  const partners = role ? dialogue.speakers.filter((s) => !mine.has(s.id)) : [];
  const partnerSpeaker = partners.length > 0 ? { name: partners.length === 1 ? partners[0]!.name : "Die anderen" } : null;

  if (stageMode === "fallback") return <DialogueFallback dialogue={dialogue} mode={mode} mine={role ? mine : null} note={note} progressKey={progressKey} />;

  return (
    <div data-testid="dialogue-speaking" data-mode={mode} data-stage={stageMode === "guided" ? stage : stageMode} data-active={active ?? ""} data-speaking={speaking ?? ""} data-role={role ?? ""}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        {hydrated && (completed || (finished && rolesLeft.length === 0)) ? (
          <p className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow" data-testid="step-completed">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> {t("Geschafft")}
          </p>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap items-center gap-2">
          <DialogueToggles showGerman={showGerman} showTransliteration={showTransliteration} onGerman={() => setShowGerman((v) => !v)} onTransliteration={() => setShowTransliteration((v) => !v)} />
          <Button variant="secondary" onClick={toggleMute} aria-pressed={muted} aria-label={muted ? t("Ton einschalten") : t("Ton ausschalten")} className="min-h-12 min-w-12" data-testid="mute-toggle">
            {muted ? <VolumeX className="h-5 w-5" aria-hidden /> : <Volume2 className="h-5 w-5" aria-hidden />}
          </Button>
        </div>
      </div>

      {stageMode === "start" && mode === "repeat" && (
        <div className="mb-6 flex flex-col items-center gap-4 rounded-3xl border bg-card p-6 text-center shadow-card sm:p-8" data-testid="start-overlay">
          <p className="max-w-md text-muted-foreground">{t("Hör jeden Satz und sprich ihn nach. Das Mikrofon hört dir zu. Du kannst jeden Satz so oft üben, wie du willst.")}</p>
          <Button size="lg" onClick={() => void start()} disabled={!narrator.current} data-testid="start-button" className="min-h-14">
            <Mic className="h-5 w-5" aria-hidden /> {t("Jetzt nachsprechen")}
          </Button>
        </div>
      )}

      {stageMode === "start" && mode === "roleplay" && (
        <div className="mb-6 rounded-3xl border bg-card p-6 text-center shadow-card sm:p-8" data-testid="start-overlay">
          <p className="font-semibold">
            {hydrated && roleChoices.length > 1 && rolesLeft.length < roleChoices.length && rolesLeft.length > 0
              ? t("Sehr gut! Jetzt sprichst du die andere Rolle: {name}.", { name: t(rolesLeft[0]!.name) })
              : t("Sprich zuerst die eine Rolle, dann die andere. Die App spricht jeweils die andere Rolle.")}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {roleChoices.map((speaker) => {
              const firstLine = dialogue.lines.find((l) => speaker.speakers.includes(l.speaker))!;
              const isDone = hydrated && roleDone(speaker.id);
              return (
                <button
                  key={speaker.id}
                  type="button"
                  onClick={() => setRole(speaker.id)}
                  aria-pressed={role === speaker.id}
                  data-testid={`role-${speaker.id}`}
                  data-done={isDone}
                  className={cn(
                    "relative flex items-center gap-3 rounded-2xl border p-3 text-left transition focus-ring",
                    role === speaker.id ? "border-primary bg-primary-soft ring-2 ring-primary" : isDone ? "border-success/60 bg-success/10 hover:bg-success/15" : "bg-background hover:bg-muted"
                  )}
                >
                  {isDone && (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-success px-2 py-0.5 text-xs font-semibold text-success-foreground shadow" data-testid={`role-done-${speaker.id}`}>
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> {t("Geschafft")}
                    </span>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element -- local SVG avatar */}
                  <img src={speaker.avatar.src} alt="" width={56} height={56} className="h-14 w-14 rounded-full border bg-card" />
                  <span className="min-w-0">
                    <span className="block font-semibold">{t(speaker.name)}</span>
                    <span lang="ar" dir="rtl" className="block font-arabic text-xl leading-[1.8]">
                      {firstLine.arabic}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <Button size="lg" onClick={() => void start()} disabled={!role || !narrator.current} data-testid="start-button" className="mt-5 min-h-14">
            <Play className="h-5 w-5" aria-hidden /> {t("Rollenspiel starten")}
          </Button>
        </div>
      )}

      {finished && (
        <div data-testid="dialogue-done" className="mb-6 animate-fade-in rounded-3xl border border-success/40 bg-card p-6 text-center shadow-card">
          <span className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> {t("Geschafft")}
          </span>
          <p lang="ar" className="mt-3 font-arabic text-4xl font-bold text-success">
            مُمْتَاز! 👏
          </p>
          <p className="mt-2 text-muted-foreground">
            {mode === "repeat" ? t("Du hast alle Sätze nachgesprochen.") : t("Du hast das Gespräch als {name} geführt.", { name: t(learnerSpeaker?.name ?? "") })}
            {rolesLeft.length > 0 && ` ${t("Jetzt sprichst du {name}.", { name: t(rolesLeft[0]!.name) })}`}
          </p>
          {rolesLeft.length > 0 ? (
            <Button size="lg" onClick={again} className="mt-4" data-testid="dialogue-next-role">
              <Play className="h-5 w-5" aria-hidden /> {t("Weiter als {name}", { name: t(rolesLeft[0]!.name) })}
            </Button>
          ) : (
            <Button variant="secondary" size="lg" onClick={again} className="mt-4" data-testid="dialogue-again">
              <RotateCcw className="h-5 w-5" aria-hidden /> {mode === "roleplay" ? t("Nochmal – mit einer Rolle deiner Wahl") : t("Nochmal üben")}
            </Button>
          )}
        </div>
      )}

      <p aria-live="polite" className="sr-only" data-testid="dialogue-live">
        {t(caption)}
      </p>

      <ol className="flex flex-col gap-4 rounded-[2rem] border border-primary/10 bg-card/60 p-3 sm:p-5" aria-label={mode === "repeat" ? t("Sätze") : t("Gespräch")} data-testid="dialogue-lines">
        {dialogue.lines.map((line, i) => {
          if (!visible(i) && stageMode === "guided") return null;
          const speaker = speakerOf(line.speaker);
          const isLearner = mode === "repeat" || mine.has(line.speaker);
          const isActive = line.id === active;
          const state = isActive ? "active" : speaking === line.id ? "playing" : done(line.id) ? "done" : stageMode === "guided" && isLearner && mode === "repeat" ? "waiting" : "idle";
          return (
                <DialogueBubble
                  key={line.id}
                  itemRef={(el) => {
                    if (el) cards.current.set(line.id, el);
                    else cards.current.delete(line.id);
                  }}
                  line={line}
                  speaker={speaker}
                  first={speaker.id === dialogue.speakers[0].id}
                  showGerman={showGerman}
                  showTransliteration={showTransliteration}
                  state={state}
                  label={mode === "roleplay" && mine.has(line.speaker) ? t("Du ({name})", { name: t(speaker.name) }) : undefined}
                  actions={
                    isActive ? (
                      <>
                        <Button variant="secondary" size="sm" onClick={flow.replay} disabled={stage === "check" || stage === "right"} data-testid="replay-line">
                          <Volume2 className="h-4 w-4" aria-hidden /> {t("Nochmal anhören")}
                        </Button>
                        {mode === "roleplay" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              hint.current = line.id;
                              flow.replay();
                            }}
                            disabled={stage === "check" || stage === "right"}
                            data-testid="hint-line"
                          >
                            <Volume2 className="h-4 w-4" aria-hidden /> {t("Satz vorsprechen")}
                          </Button>
                        )}
                      </>
                    ) : undefined
                  }
                >
                  {isActive && caption && (
                    <p dir="ltr" data-testid="dialogue-caption" className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-sm font-semibold shadow">
                      {stage === "listen" ? (
                        <span data-testid="listening-sign" role="img" aria-label={t("Das Mikrofon hört zu")} className="relative flex h-5 w-5 items-center justify-center">
                          <span aria-hidden className="absolute inset-0 rounded-full border-2 border-primary motion-safe:animate-pulse-ring" />
                          <Mic className="relative h-3.5 w-3.5 text-primary" aria-hidden />
                        </span>
                      ) : stage === "check" ? (
                        <Loader2 className="h-4 w-4 motion-safe:animate-spin" aria-hidden />
                      ) : stage === "right" ? (
                        <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
                      ) : (
                        <Volume2 className="h-4 w-4 text-primary" aria-hidden />
                      )}
                      {t(caption)}
                    </p>
                  )}
                  {isActive && feedback?.id === line.id && (
                    <div dir="ltr" role="status" data-testid="dialogue-feedback" className="mt-2 rounded-2xl border border-warning/30 bg-warning-soft px-3 py-2 text-sm">
                      <p className="font-semibold">{feedback.feedback.analysisUnavailable ? t("Nicht eindeutig") : t(feedback.feedback.headline)}</p>
                      <p>{feedback.feedback.analysisUnavailable ? t("Deine Aussprache konnte gerade nicht bewertet werden. Versuch es gleich noch einmal.") : t(feedback.feedback.tip)}</p>
                    </div>
                  )}
                </DialogueBubble>
          );
        })}
      </ol>
      {mode === "roleplay" && partnerSpeaker && stageMode === "guided" && !finished && (
        <p className="mt-3 text-center text-sm text-muted-foreground">
          {t("Du sprichst {name}. {partner} antwortet erst, wenn dein Satz richtig war.", { name: t(learnerSpeaker?.name ?? ""), partner: t(partnerSpeaker.name) })}
        </p>
      )}
    </div>
  );
}

/**
 * Without a microphone (or when the evaluation keeps failing): the same lines
 * with listen and record buttons and the usual feedback. The step is done when
 * every line to speak was right.
 */
function DialogueFallback({ dialogue, mode, mine, note, progressKey }: { dialogue: Dialogue; mode: Mode; mine: ReadonlySet<string> | null; note: string | null; progressKey: string }) {
  const session = usePracticeSession();
  const t = useT();
  const toSpeak = dialogue.lines.filter((l) => mode === "repeat" || !mine || mine.has(l.speaker));
  const allPassed = toSpeak.every((l) => session.passed.has(l.exercise.id) || getLessonProgress(progressKey).passed.includes(l.id));

  useEffect(() => {
    for (const id of session.passed) markExercisePassed(progressKey, id);
    if (allPassed) markLessonCompleted(progressKey);
  }, [session.passed, allPassed, progressKey]);

  return (
    <div data-testid="dialogue-fallback">
      {note && (
        <p role="status" data-testid="dialogue-note" className="mb-4 rounded-2xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm">
          {t(note)}
        </p>
      )}
      <ol className="flex flex-col gap-4" aria-label={t("Sätze")}>
        {dialogue.lines.map((line) => {
          const speaker = dialogue.speakers.find((s) => s.id === line.speaker)!;
          const speak = toSpeak.includes(line);
          const parts = splitAddressee(line.german);
          return (
            <li key={line.id} className={cn("rounded-3xl border bg-card p-4 shadow-card", !speak && "opacity-80")} data-testid={`fallback-line-${line.id}`}>
              <p className="text-xs font-semibold text-muted-foreground">{speak && mode === "roleplay" ? t("Du ({name})", { name: t(speaker.name) }) : t(speaker.name)}</p>
              <p lang="ar" dir="rtl" className="font-arabic text-3xl font-bold leading-[1.8]">
                {line.arabic}
              </p>
              <p className="text-sm italic text-muted-foreground">{line.transliteration}</p>
              {parts.addressee && (
                <p className="mt-1">
                  <AddresseeBadge addressee={parts.addressee} gender={parts.gender} testId={`fallback-addressee-${line.id}`} />
                </p>
              )}
              <p className="font-semibold">{t(parts.german)}</p>
              {speak && (
                <PronunciationExercise
                  exercise={line.exercise}
                  locked={session.isLocked(line.exercise.id)}
                  onBusyChange={session.busyHandler(line.exercise.id)}
                  onResult={session.resultHandler(line.exercise.id)}
                  className="mt-3"
                  simpleFeedback
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
