"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { ArrowRight, Check, CheckCircle2, Circle, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";

import { ShapedWord } from "@/components/a1/forms/shaped-word";
import { usePickAndDrop } from "@/components/a1/forms/use-pick-and-drop";
import { Button } from "@/components/ui/button";
import type { GapsClips, GapsContent } from "@/data/types";
import { gapTask, type GapTask } from "@/lib/arabic/gap";
import { playChime, unlockChime } from "@/lib/audio/chime";
import { narrateWithFallback, sayWithFallback } from "@/lib/audio/narrate";
import { useLocale, useT } from "@/i18n/use-locale";
import { localNarration } from "@/lib/audio/local-narration";
import { createNarrator, readMuted, type Narrator } from "@/lib/audio/narration";
import { getLessonProgress, markLessonCompleted, subscribeProgress } from "@/lib/progress";
import { speechUrl } from "@/lib/tts/player";
import { cn } from "@/lib/utils";

import { GAPS_FALLBACK_MS, GAPS_NARRATION, GAPS_TEXT, gapStars } from "./content";

// Step type "gaps" ("Ergänzen", "Hören"): one word at a time with letters left
// out – the Alif lesson's Hamza-Alif, or the gaps of the book pattern (one or
// more, filled from right to left). The child puts the right tile into the
// gap – drag, tap tile then gap, or keyboard (as in "Baue das Wort"). First
// wrong answer: a hint; second: the right tile is shown with the reason, and
// the child still places it. The result screen ("Korrigieren") lists every word.
// Differences between the steps come only from the data (`mode`, choices,
// clips). A word without a recording is spoken by /api/tts. Every item starts
// with its word (after the intro on the first one), in "Ergänzen" too.

type Phase = "ask" | "correct" | "result";
type Result = { id: string; firstTry: boolean };

const noop = () => () => undefined;

/** The Alif lesson's clips (GapsContent.clips is not set there). */
const ALIF_CLIPS: GapsClips = {
  ok: GAPS_NARRATION.ok,
  hint: GAPS_NARRATION.hint,
  reveal: { a: GAPS_NARRATION.reveal("a"), i: GAPS_NARRATION.reveal("i"), u: GAPS_NARRATION.reveal("u"), sukun: GAPS_NARRATION.reveal("sukun") },
};

export function GapsStep({ gaps, availableAudio, progressKey }: { gaps: GapsContent; availableAudio: string[]; progressKey: string }) {
  const narrator = useRef<Narrator | null>(null);
  const narratorLocale = useRef<string | null>(null);
  const locale = useLocale();
  const t = useT();
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const completed = useSyncExternalStore(subscribeProgress, () => Boolean(getLessonProgress(progressKey).completedAt), () => false);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("ask");
  const [wrong, setWrong] = useState(0);
  /** Gaps of the current word filled so far (right to left). */
  const [filled, setFilled] = useState(0);
  /** A wrong answer anywhere in the current word. */
  const [missed, setMissed] = useState(false);
  const [shake, setShake] = useState<string | null>(null);
  const [caption, setCaption] = useState<string | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  /** Bumped by "Nochmal" (restart) so the item effect runs again. */
  const [run, setRun] = useState(0);
  const flow = useRef<AbortController | null>(null);

  // Created after hydration (it needs the browser), so server and client render alike – and again for another
  // language: then every narration clip is spoken from its translation (the word recordings stay).
  if (hydrated && (!narrator.current || narratorLocale.current !== locale)) {
    narrator.current?.stop();
    narrator.current = createNarrator({ baseUrl: gaps.audioBase, ...localNarration(availableAudio, gaps.texts ?? GAPS_TEXT, locale) });
    narratorLocale.current = locale;
  }
  const n = narrator.current;

  useEffect(() => {
    setMuted(readMuted());
    return () => {
      flow.current?.abort();
      narrator.current?.stop();
    };
  }, []);

  const items = useMemo(() => gaps.items.map((item) => ({ item, task: gapTask(item) })), [gaps.items]);
  const current = items[index]!;
  const gap = current.task.gaps[Math.min(filled, current.task.gaps.length - 1)]!;
  const choices = current.item.gapChoices?.[Math.min(filled, current.task.gaps.length - 1)] ?? current.item.choices ?? gaps.choices;
  const clips = gaps.clips ?? ALIF_CLIPS;
  const texts = gaps.texts ?? GAPS_TEXT;
  const revealed = wrong >= 2;
  const listen = gaps.mode === "listen";
  /** The finished word: the letter lessons highlight their (first) gap; Alif its Hamza-Alif. */
  const target = current.item.pattern ? current.task.gaps[0]!.index : undefined;
  /** Long items (e.g. the phrase صَبَاحُ الْخَيْر) get smaller letters, so they fit a phone. */
  const long = current.task.tiles.length > 7;
  /**
   * A word written letter by letter (3 or more gaps, e.g. a dictation of Lektion 2):
   * narrower slots and letters, so the whole row fits a phone (390 px). Items
   * with one or two gaps keep the normal sizes.
   */
  const slotCount = current.task.gaps.length;
  const textLetters = current.task.pieces.reduce((n, piece) => n + (piece.kind === "text" ? piece.text.replace(/[\u064B-\u0652\u0640]/g, "").length : 0), 0);
  const density = slotCount < 3 ? "normal" : slotCount + 0.6 * textLetters <= 4.5 ? "dense" : "tight";

  const newFlow = () => {
    flow.current?.abort();
    flow.current = new AbortController();
    return flow.current.signal;
  };
  const sayWord = useCallback(
    (signal: AbortSignal, fallbackMs: number = GAPS_FALLBACK_MS.clip) => {
      const nr = narrator.current;
      const { item } = items[index]!;
      return nr ? sayWithFallback(nr, { audio: item.audio, text: item.spoken ?? item.arabic }, fallbackMs, signal, speechUrl) : Promise.resolve();
    },
    [items, index]
  );
  const playWord = useCallback(() => {
    void sayWord(newFlow(), 0);
    // newFlow only reads a ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sayWord]);

  // Intro on the first item; then every item starts with its word – no tap needed.
  const introDone = useRef(false);
  useEffect(() => {
    if (!started || phase !== "ask" || !narrator.current) return;
    const nr = narrator.current;
    const signal = newFlow();
    void (async () => {
      if (!introDone.current) {
        introDone.current = true;
        setCaption(gaps.narration.intro);
        await narrateWithFallback(nr, gaps.narration.intro, GAPS_FALLBACK_MS.intro, signal);
      }
      if (!signal.aborted) void sayWord(signal, 0);
    })();
    // Runs when an item appears (or after "Nochmal"), not on every answer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, index, run]);

  function finishStep(all: Result[]) {
    setResults(all);
    setPhase("result");
    setCaption(gaps.narration.done);
    markLessonCompleted(progressKey);
    void narrator.current?.play([gaps.narration.done]);
  }

  function next(all: Result[]) {
    flow.current?.abort();
    if (index === items.length - 1) return finishStep(all);
    setIndex(index + 1);
    setWrong(0);
    setFilled(0);
    setMissed(false);
    setPhase("ask");
  }

  function answer(choice: string) {
    if (phase !== "ask" || !narrator.current) return;
    const nr = narrator.current;
    if (choice === gap.answer) {
      // More gaps in this word: on to the next one (right to left).
      if (filled < current.task.gaps.length - 1) {
        flow.current?.abort();
        nr.stop();
        playChime();
        setFilled(filled + 1);
        setWrong(0);
        setCaption(null);
        return;
      }
      const all = [...results, { id: current.item.id, firstTry: wrong === 0 && !missed }];
      setResults(all);
      setFilled(current.task.gaps.length);
      setPhase("correct");
      setCaption(clips.ok);
      playChime();
      const signal = newFlow();
      void (async () => {
        await sayWord(signal);
        await narrateWithFallback(nr, clips.ok, GAPS_FALLBACK_MS.clip, signal);
        if (!signal.aborted) next(all);
      })();
      return;
    }
    const count = wrong + 1;
    setWrong(count);
    setMissed(true);
    setShake(choice);
    if (count === 1) {
      setCaption(clips.hint);
      const signal = newFlow();
      void (async () => {
        const complete = await nr.play([clips.hint]);
        if (complete && !signal.aborted) await sayWord(signal, 0);
      })();
    } else {
      const reveal = (gap.vowel === "none" ? clips.reveal.none : clips.reveal[gap.vowel]) ?? clips.hint;
      setCaption(reveal);
      void nr.play([reveal]);
    }
  }

  const { itemProps, targetProps, selectedKey } = usePickAndDrop<string>({ onDrop: (choice) => answer(choice) });

  function start() {
    // In the tap itself: lets the narration play on iOS without further taps.
    narrator.current?.unlock();
    unlockChime();
    setStarted(true);
  }

  function restart() {
    flow.current?.abort();
    narrator.current?.stop();
    setResults([]);
    setIndex(0);
    setWrong(0);
    setFilled(0);
    setMissed(false);
    setCaption(null);
    setPhase("ask");
    setRun((r) => r + 1);
  }

  function toggleMute() {
    const value = !muted;
    setMuted(value);
    narrator.current?.setMuted(value);
  }

  const total = items.length;

  return (
    <div data-testid="gaps-step" data-mode={gaps.mode} data-phase={phase} data-started={started}>
      <div className="mb-4 flex items-center justify-between gap-3">
        {hydrated && (completed || phase === "result") ? (
          <p className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow" data-testid="step-completed">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> {t("Geschafft")}
          </p>
        ) : (
          <span />
        )}
        <Button
          variant="secondary"
          onClick={toggleMute}
          aria-pressed={muted}
          aria-label={muted ? t("Ton einschalten") : t("Ton ausschalten")}
          className="min-h-12 min-w-12"
          data-testid="mute-toggle"
        >
          {muted ? <VolumeX className="h-5 w-5" aria-hidden /> : <Volume2 className="h-5 w-5" aria-hidden />}
        </Button>
      </div>

      {!started || !n ? (
        <div className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-3xl border bg-card p-8 text-center shadow-card" data-testid="start-overlay">
          <p lang="ar" dir="rtl" className="font-arabic text-6xl font-bold leading-[1.6] text-primary">
            {gaps.choices.join(" · ")}
          </p>
          <p className="max-w-sm text-muted-foreground">{listen ? t("Hör genau zu und finde den fehlenden Buchstaben.") : t("Welcher Buchstabe fehlt? Finde ihn!")}</p>
          <Button size="lg" onClick={start} disabled={!n} data-testid="start-button" className="min-h-14">
            <Play className="h-5 w-5" aria-hidden /> {t("Los geht's!")}
          </Button>
        </div>
      ) : phase === "result" ? (
        <ResultScreen items={items} results={results} onRestart={restart} />
      ) : (
        <section aria-label={t("Aufgabe {n} von {total}", { n: index + 1, total })} data-testid="gap-item" data-item={current.item.id} data-wrong={wrong} className="rounded-3xl border bg-card p-5 text-center shadow-card sm:p-8">
          <p className="text-sm text-muted-foreground" data-testid="gap-progress">
            {t("Aufgabe {n} von {total}", { n: index + 1, total })}
          </p>
          <ol className="mt-2 flex flex-wrap justify-center gap-1.5" aria-hidden>
            {items.map(({ item }, i) => (
              <li key={`${item.id}-${i}`} className={cn("h-2.5 w-2.5 rounded-full", i < index ? "bg-success" : i === index ? "bg-primary" : "bg-muted")} />
            ))}
          </ol>

          {current.item.image && (
            <Image src={current.item.image.src} alt={t(current.item.image.alt)} width={200} height={150} className="mx-auto mt-4 rounded-2xl" unoptimized data-testid="gap-image" />
          )}
          {current.item.hint && (
            <p lang="ar" dir="rtl" className="mt-3 font-arabic text-3xl font-bold leading-[1.8] text-muted-foreground" data-testid="gap-hint">
              {current.item.hint}
            </p>
          )}

          {/* The word: the rest in pieces around the gap (cut only after letters without a Hand), or – once solved – shaped as one string. */}
          <div className="mt-4 grid min-h-28 place-items-center">
            <div
              dir="rtl"
              data-testid="gap-pieces"
              aria-hidden={phase === "correct"}
              data-density={density}
              className={cn("crossfade col-start-1 row-start-1 flex items-center justify-center transition-opacity duration-500", density === "tight" ? "gap-1" : density === "dense" ? "gap-1.5" : "gap-2", phase === "correct" && "opacity-0")}
            >
              {current.task.pieces.map((piece, i) => {
                if (piece.kind === "text")
                  return (
                    <span key={i} lang="ar" data-testid="gap-piece" className={cn("whitespace-nowrap font-arabic font-bold leading-[1.8]", long || density !== "normal" ? "text-4xl sm:text-6xl" : "text-6xl")}>
                      {piece.text}
                    </span>
                  );
                const done = piece.gap < filled || phase === "correct";
                const active = piece.gap === filled && phase !== "correct";
                const answer = current.task.gaps[piece.gap]!.answer;
                return (
                  <button
                    key={i}
                    type="button"
                    {...(active ? targetProps("gap") : {})}
                    disabled={!active}
                    data-testid="gap-slot"
                    data-gap={piece.gap}
                    data-active={active}
                    data-filled={done}
                    aria-label={`${t("Lücke")}: ${done ? answer : active ? t("hier ablegen") : t("danach")}`}
                    className={cn(
                      "flex h-20 w-16 shrink-0 items-center justify-center rounded-2xl border-2 font-arabic text-4xl font-bold transition focus-ring sm:h-24 sm:w-20 sm:text-5xl",
                      long && "h-16 w-14 text-3xl",
                      density === "dense" && "h-16 w-12 text-3xl sm:h-20 sm:w-16 sm:text-4xl",
                      density === "tight" && "h-14 w-10 text-2xl sm:h-20 sm:w-14 sm:text-4xl",
                      done ? "border-primary/30 bg-primary-soft" : !active ? "border-dashed border-border bg-muted/40" : selectedKey ? "border-dashed border-primary bg-primary-soft/60" : "border-dashed border-primary bg-card"
                    )}
                  >
                    {done && <span lang="ar">{answer}</span>}
                  </button>
                );
              })}
            </div>
            {phase === "correct" && (
              <span className="col-start-1 row-start-1 animate-crossfade-in">
                <ShapedWord tiles={current.task.tiles} target={target} highlight className={cn("leading-[1.8] text-foreground", long ? "text-5xl sm:text-6xl" : "text-6xl")} testId="gap-shaped" />
              </span>
            )}
          </div>
          <p className="font-semibold" data-testid="gap-german">
            {t(current.item.german)}
          </p>

          {gaps.repeat && (
            <p className="mx-auto mt-3 max-w-md rounded-2xl border border-primary/15 bg-primary-soft px-4 py-2 text-sm" data-testid="gap-repeat">
              {t("Sprich das Wort laut nach – dann schreib den Buchstaben.")} <span className="text-muted-foreground">{t("(Das Nachsprechen wird hier nicht bewertet.)")}</span>
            </p>
          )}

          <div className="mt-3 flex justify-center">
            <Button variant="secondary" onClick={playWord} className="min-h-12" data-testid="gap-listen" aria-label={`${listen ? t("Nochmal hören") : t("Anhören")}: ${t(current.item.german)}`}>
              <Volume2 className="h-5 w-5" aria-hidden /> {listen ? t("Nochmal hören") : t("Anhören")}
            </Button>
          </div>

          <ul className="mt-5 flex flex-wrap justify-center gap-3" aria-label={t("Buchstaben")}>
            {choices.map((choice, i) => {
              const isAnswer = choice === gap.answer;
              return (
                <li key={choice}>
                  <button
                    type="button"
                    {...itemProps(choice, choice, phase !== "ask")}
                    onAnimationEnd={() => setShake(null)}
                    data-testid={`choice-${i}`}
                    data-choice={choice}
                    data-reveal={revealed && isAnswer ? "true" : undefined}
                    aria-label={`${t("Buchstabe")} ${choice}${revealed && isAnswer ? ` – ${t("der richtige")}` : ""}`}
                    className={cn(
                      "flex h-16 min-w-14 cursor-grab select-none items-center justify-center rounded-2xl border bg-card px-3 font-arabic text-4xl font-bold shadow-sm transition focus-ring active:cursor-grabbing disabled:cursor-default sm:h-20 sm:min-w-16",
                      selectedKey === choice && "border-primary ring-2 ring-primary",
                      revealed && isAnswer && "border-success bg-success-soft ring-2 ring-success",
                      shake === choice && "animate-shake border-destructive"
                    )}
                  >
                    <span lang="ar">{choice}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <p aria-live="polite" data-testid="gap-caption" data-key={caption ?? ""} className="mx-auto mt-5 min-h-12 max-w-md rounded-2xl bg-muted/60 px-4 py-3 text-sm leading-relaxed">
            {caption ? t(texts[caption] ?? "") : ""}
          </p>

          {phase === "correct" && (
            <div className="mt-4 flex justify-center">
              <Button size="lg" onClick={() => next(results)} data-testid="gap-next">
                {t("Weiter")} <ArrowRight className="h-5 w-5" aria-hidden />
              </Button>
            </div>
          )}
        </section>
      )}

      {phase === "result" && caption && (
        <p aria-live="polite" data-testid="gap-caption" data-key={caption} className="mx-auto mt-4 max-w-md rounded-2xl bg-muted/60 px-4 py-3 text-center text-sm leading-relaxed">
          {t(texts[caption] ?? "")}
        </p>
      )}
    </div>
  );
}

function ResultScreen({ items, results, onRestart }: { items: Array<{ item: GapsContent["items"][number]; task: GapTask }>; results: Result[]; onRestart: () => void }) {
  const t = useT();
  const firstTry = results.filter((r) => r.firstTry).length;
  const stars = gapStars(firstTry, items.length);
  return (
    <section data-testid="gap-result" data-stars={stars} data-first-try={firstTry} aria-label={t("Korrigieren")} className="animate-fade-in rounded-3xl border border-success/40 bg-card p-5 text-center shadow-card sm:p-8">
      <h2 className="text-2xl font-bold">{t("Korrigieren")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        <Check className="inline h-4 w-4 text-success" aria-hidden /> {t("beim ersten Versuch richtig")} · <Circle className="inline h-3 w-3 fill-warning text-warning" aria-hidden /> {t("mit Hilfe")}
      </p>
      <ul dir="rtl" className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map(({ item, task }, i) => {
          const ok = results[i]?.firstTry ?? false;
          return (
            <li key={`${item.id}-${i}`} data-testid={`result-${item.id}`} data-first-try={ok} className="relative flex flex-col items-center rounded-2xl border bg-background/60 px-2 py-3">
              <span className="absolute end-2 top-2" aria-label={ok ? t("beim ersten Versuch richtig") : t("mit Hilfe")}>
                {ok ? <Check className="h-5 w-5 text-success" aria-hidden /> : <Circle className="h-3 w-3 fill-warning text-warning" aria-hidden />}
              </span>
              <ShapedWord tiles={task.tiles} target={item.pattern ? task.gaps[0]!.index : undefined} highlight className="text-4xl leading-[1.8] text-foreground" />
              <span dir="ltr" className="text-sm font-medium">
                {t(item.german)}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-5 text-4xl leading-none tracking-widest text-accent" aria-label={t("{n} von 3 Sternen", { n: stars })} data-testid="gap-stars">
        {"★".repeat(stars)}
        <span className="text-border">{"★".repeat(3 - stars)}</span>
      </p>
      <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow">
        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> {t("Geschafft")}
      </span>
      <p lang="ar" className="mt-3 font-arabic text-4xl font-bold text-success">
        مُمْتَاز! 👏
      </p>
      <Button variant="secondary" size="lg" onClick={onRestart} className="mt-5" data-testid="gap-restart">
        <RotateCcw className="h-5 w-5" aria-hidden /> {t("Nochmal")}
      </Button>
    </section>
  );
}
