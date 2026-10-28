"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CheckCircle2, Lock, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formsFallbackTexts } from "@/data/a1/forms-fallback";
import type { FormsContent } from "@/data/types";
import { useLocale, useT } from "@/i18n/use-locale";
import { localNarration } from "@/lib/audio/local-narration";
import { createNarrator, readMuted, type Narrator } from "@/lib/audio/narration";
import { getLessonProgress, markLessonCompleted, subscribeProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

import { BuildActivity } from "./build-activity";
import { ALIF_NARRATION_TEXT, LETTER_NARRATION, NARRATION } from "./content";
import { ExplainActivity } from "./explain-activity";
import { LetterNeighborsActivity } from "./letter-neighbors-activity";
import { LetterSortActivity } from "./letter-sort-activity";
import { NeighborsActivity } from "./neighbors-activity";
import { SortActivity } from "./sort-activity";
import { formGlyph, LETTER_FORMS } from "@/lib/arabic/letter-form";

// Part 0 is "Zuschauen" (explanation only); it plays its own intro.
const PARTS = [
  { title: "Zuschauen", intro: NARRATION.explain.intro },
  { title: "Baue das Wort", intro: NARRATION.build.intro },
  { title: "Wer hält fest?", intro: NARRATION.neighbors.intro },
  { title: "Mit Hand oder ohne?", intro: NARRATION.sort.intro },
] as const;

/** A letter lesson: the same four parts; Activity 3 sorts into the letter's four forms. */
const letterParts = (name: string) => [
  PARTS[0],
  PARTS[1],
  { title: "Wer hält fest?", intro: LETTER_NARRATION.neighbors.intro },
  { title: "Wo steht das {name}?", name, intro: LETTER_NARRATION.sort.intro },
];

const noop = () => () => undefined;

// Step type "forms" (A1 · Lektion 1 · Schritt 3): the Alif with Hamza alone
// (أ) or held by the letter before it (ـأ). First "Zuschauen" explains the four
// book words, then three exercises – unlocked once the explanation was watched
// to the end. The narration is pre-recorded; browsers only allow sound after a
// tap, hence the start overlay. `availableAudio` lists the files that exist
// (checked at build time).
//
// With `forms.letter` the step is a letter lesson's (ب ت ث ج ح خ – a letter
// with a Hand of its own): Zuschauen and Baue das Wort are shared, "Wer hält
// fest?" and the sorting have their own variants (two sides, four baskets).
export function FormsStep({ forms, availableAudio, progressKey }: { forms: FormsContent; availableAudio: string[]; progressKey: string }) {
  const narrator = useRef<Narrator | null>(null);
  const narratorLocale = useRef<string | null>(null);
  const locale = useLocale();
  const t = useT();
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);
  const [part, setPart] = useState(0);
  const [explainDone, setExplainDone] = useState(false);
  /** Remounts "Zuschauen" (tab, "Nochmal hören"); 0 = first visit after "Los geht's!". */
  const [explainRun, setExplainRun] = useState(0);
  const completed = useSyncExternalStore(subscribeProgress, () => Boolean(getLessonProgress(progressKey).completedAt), () => false);
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const exercisesOpen = explainDone || completed;
  const letter = forms.letter;
  const parts = letter ? letterParts(letter.name) : PARTS;

  // Created after hydration (it needs the browser), so server and client render alike – and again for another language.
  if (hydrated && (!narrator.current || narratorLocale.current !== locale)) {
    narrator.current?.stop();
    // Until a letter lesson is recorded, text-to-speech reads each missing clip (its caption, or the word);
    // in another language than German every narration clip is spoken from its translation.
    const texts = letter ? formsFallbackTexts(forms) : { ...formsFallbackTexts(forms), ...ALIF_NARRATION_TEXT };
    narrator.current = createNarrator({ baseUrl: forms.audioBase, ...localNarration(availableAudio, texts, locale) });
    narratorLocale.current = locale;
  }

  useEffect(() => {
    setMuted(readMuted());
    return () => narrator.current?.stop();
  }, []);

  function start() {
    // In the tap itself: lets the narration chain play on iOS without further taps.
    narrator.current?.unlock();
    setStarted(true);
  }

  function goTo(next: number) {
    setPart(next);
    if (next === 0) setExplainRun((run) => run + 1);
    else void narrator.current?.play([parts[next]!.intro]);
  }

  function replayIntro() {
    if (part === 0) setExplainRun((run) => run + 1);
    else void narrator.current?.play([parts[part]!.intro]);
  }

  function toggleMute() {
    const value = !muted;
    setMuted(value);
    narrator.current?.setMuted(value);
  }

  const n = narrator.current;

  return (
    <div data-testid="forms-step" data-part={part} data-started={started}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <ol className="flex flex-wrap gap-2" aria-label={t("Teile")}>
          {parts.map((item, i) => {
            const locked = i > 0 && !exercisesOpen;
            const title = t(item.title, "name" in item && item.name ? { name: item.name } : undefined);
            return (
              <li key={item.title}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  disabled={!started || locked}
                  aria-current={i === part ? "step" : undefined}
                  aria-label={locked ? t("{title} – erst nach „Zuschauen“", { title }) : title}
                  data-testid={`activity-tab-${i}`}
                  className={cn(
                    "inline-flex min-h-12 items-center gap-2 rounded-full border px-3 text-sm font-medium transition focus-ring disabled:cursor-not-allowed disabled:opacity-50",
                    i === part ? "border-primary bg-primary-soft text-primary" : "bg-card text-muted-foreground hover:bg-muted"
                  )}
                >
                  {locked ? <Lock className="h-3.5 w-3.5" aria-hidden /> : i > 0 && <span className="font-bold">{i}</span>} {title}
                </button>
              </li>
            );
          })}
        </ol>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={replayIntro} disabled={!started} className="min-h-12" data-testid="replay-intro">
            <RotateCcw className="h-4 w-4" aria-hidden /> {t("Nochmal hören")}
          </Button>
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
      </div>

      {hydrated && completed && (
        <p className="mb-4 inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow" data-testid="step-completed">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> {t("Geschafft")}
        </p>
      )}

      <div className="relative">
        {!started || !n ? (
          <div className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-3xl border bg-card p-8 text-center shadow-card" data-testid="start-overlay">
            {letter ? (
              <>
                <p lang="ar" dir="rtl" className="font-arabic text-5xl font-bold leading-[1.8] sm:text-7xl">
                  {LETTER_FORMS.map((form, i) => (
                    <span key={form}>
                      {i > 0 && " · "}
                      <span className="text-primary">{formGlyph(letter.glyph, form)}</span>
                    </span>
                  ))}
                </p>
                <p className="max-w-sm text-muted-foreground">{t("Das {name} sieht nicht immer gleich aus. Hör gut zu und mach mit!", { name: letter.name })}</p>
              </>
            ) : (
              <>
                <p lang="ar" dir="rtl" className="font-arabic text-7xl font-bold leading-[1.6]">
                  <span className="text-primary">أ</span> · <span className="text-primary">ـأ</span>
                </p>
                <p className="max-w-sm text-muted-foreground">{t("Das Alif mit Hamza sieht nicht immer gleich aus. Hör gut zu und mach mit!")}</p>
              </>
            )}
            <Button size="lg" onClick={start} disabled={!n} data-testid="start-button" className="min-h-14">
              <Play className="h-5 w-5" aria-hidden /> {t("Los geht's!")}
            </Button>
          </div>
        ) : part === 0 ? (
          <ExplainActivity
            key={explainRun}
            words={forms.explain}
            letter={letter}
            narrator={n}
            withPageIntro={explainRun === 0}
            onReachedEnd={() => setExplainDone(true)}
            onFinish={() => {
              setExplainDone(true);
              goTo(1);
            }}
          />
        ) : part === 1 ? (
          <BuildActivity words={forms.build} letter={letter} narrator={n} onComplete={() => goTo(2)} />
        ) : part === 2 ? (
          letter ? (
            <LetterNeighborsActivity letter={letter} neighbors={forms.neighbors} narrator={n} onComplete={() => goTo(3)} />
          ) : (
            <NeighborsActivity neighbors={forms.neighbors} narrator={n} onComplete={() => goTo(3)} />
          )
        ) : letter ? (
          <LetterSortActivity letter={letter} words={forms.sort} narrator={n} onComplete={() => markLessonCompleted(progressKey)} />
        ) : (
          <SortActivity words={forms.sort} narrator={n} onComplete={() => markLessonCompleted(progressKey)} />
        )}
      </div>
    </div>
  );
}
