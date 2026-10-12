"use client";

import { useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type MouseEvent } from "react";
import { CheckCircle2, Eye, RotateCcw, SearchCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { LetterFind } from "@/data/types";
import { checkFind, findLines, targetKeys, tileByKey, type FindResult, type FindWord } from "@/lib/arabic/letter-find";
import { getLessonProgress, markLessonCompleted, subscribeProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

// Step type "letter-find" ("Lies den Dialog und unterstreiche …"): the
// dialogue as real text; the learner taps a letter to underline it (tap again
// to remove), then "Prüfen": right marks turn green, wrong ones red (with the
// letter they really are), and how many are still missing. Corrections are
// always possible; the step is done when every occurrence – and nothing else –
// is underlined. An exercise may span several dialogues (`more`), and may offer
// further letters to look for afterwards (`extra`, "repeat with the other
// letters") – those are practice only, the step is done with the book's letter.
//
// Each word stays ONE string, so the browser shapes the joins itself (as in
// ShapedWord): marks are a coloured copy of the word clipped to the measured
// box of the letter. A tap on the word marks the letter whose centre is nearest
// to the finger (so a thin ا is as easy to hit as a wide letter); keyboard and
// screen-reader users have one button per letter, laid over its glyph.

type Tone = "selected" | "correct" | "wrong" | "missing";
const TONE: Record<Tone, { text: string; bar: string }> = {
  selected: { text: "text-primary", bar: "bg-primary" },
  correct: { text: "text-success", bar: "bg-success" },
  wrong: { text: "text-destructive", bar: "bg-destructive" },
  missing: { text: "text-warning", bar: "border-b-[3px] border-dashed border-warning bg-transparent" },
};

const noop = () => () => undefined;

export function LetterFindStep({ find, progressKey }: { find: LetterFind; progressKey: string }) {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const completedBefore = useSyncExternalStore(subscribeProgress, () => Boolean(getLessonProgress(progressKey).completedAt), () => false);
  /** -1: the book's letter; otherwise the index of an extra letter. */
  const [targetIndex, setTargetIndex] = useState(-1);
  const target = targetIndex < 0 ? { letter: find.letter, name: find.name, accepts: find.accepts } : find.extra![targetIndex]!;
  const dialogues = useMemo(() => [find.dialogue, ...(find.more ?? [])], [find]);
  const allLines = useMemo(() => dialogues.flatMap((dialogue) => dialogue.lines), [dialogues]);
  const lines = useMemo(() => findLines(allLines, target.accepts), [allLines, target.accepts]);
  const total = useMemo(() => targetKeys(lines).length, [lines]);
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());
  const [result, setResult] = useState<FindResult | null>(null);
  const [reveal, setReveal] = useState(false);
  const done = result?.done ?? false;

  function toggle(key: string) {
    if (done) return;
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setResult(null);
  }

  function check() {
    const checked = checkFind(lines, selected);
    setResult(checked);
    if (checked.done) {
      setReveal(false);
      if (targetIndex < 0) markLessonCompleted(progressKey);
    }
  }

  function chooseTarget(index: number) {
    setTargetIndex(index);
    again();
  }

  function again() {
    setSelected(new Set());
    setResult(null);
    setReveal(false);
  }

  const toneOf = (key: string): Tone | null => {
    if (selected.has(key)) return result ? (result.wrong.includes(key) ? "wrong" : "correct") : "selected";
    if (reveal && targetKeys(lines).includes(key)) return "missing";
    return null;
  };

  const wrongLetters = result ? [...new Set(result.wrong.map((key) => tileByKey(lines, key)!.letter))] : [];
  const speakerName = (id: string) => dialogues.flatMap((d) => d.speakers).find((s) => s.id === id)?.name ?? "";
  const lineIndex = new Map(allLines.map((line, i) => [line.id, i]));

  return (
    <div data-testid="letter-find" data-letter={target.letter} data-done={done ? "true" : "false"}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold" data-testid="find-goal">
          Finde alle <span className="font-bold text-primary">{total}</span> ×{" "}
          <span lang="ar" className="font-arabic text-2xl font-bold text-primary">
            {target.letter}
          </span>{" "}
          ({target.name}) {dialogues.length > 1 ? "in den Dialogen" : "im Dialog"}.
        </p>
        {hydrated && (done || completedBefore) && (
          <p className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow" data-testid="step-completed">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Geschafft
          </p>
        )}
      </div>

      {find.extra && find.extra.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2" data-testid="find-targets">
          <span className="text-sm text-muted-foreground">Buchstabe:</span>
          {[{ letter: find.letter, name: find.name }, ...find.extra].map((option, i) => (
            <button
              key={option.letter}
              type="button"
              onClick={() => chooseTarget(i - 1)}
              aria-pressed={targetIndex === i - 1}
              data-testid={`find-target-${i}`}
              className={cn(
                "inline-flex min-h-11 items-center gap-1 rounded-full border px-3 text-sm font-medium transition focus-ring",
                targetIndex === i - 1 ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
              )}
            >
              <span lang="ar" className="font-arabic text-xl leading-none">{option.letter}</span> {option.name}
              {i > 0 && <span className="sr-only"> (freiwillig)</span>}
            </button>
          ))}
          {targetIndex >= 0 && <span className="text-xs text-muted-foreground" data-testid="find-extra-note">Freiwillige Wiederholung – „Geschafft“ zählt für den Buchstaben aus dem Buch.</span>}
        </div>
      )}

      <div className="flex flex-col gap-5" data-testid="find-lines">
        {dialogues.map((dialogue) => (
          <ol key={dialogue.id} className="flex flex-col gap-3 rounded-[2rem] border border-primary/10 bg-card/60 p-3 sm:p-5" aria-label={dialogues.length > 1 ? dialogue.intro : "Dialog"} data-testid={`find-dialogue-${dialogue.id}`}>
            {dialogues.length > 1 && <p className="px-1 text-sm font-semibold text-muted-foreground">{dialogue.intro}</p>}
            {dialogue.lines.map((line) => (
              <li key={line.id} className="rounded-3xl border bg-card px-4 py-3 shadow-card sm:px-5" data-testid={`find-line-${line.id}`}>
                <p className="text-xs font-semibold text-muted-foreground">{speakerName(line.speaker)}</p>
                <p lang="ar" dir="rtl" className="font-arabic text-4xl font-bold leading-[2.2]">
                  {lines[lineIndex.get(line.id)!]!.words.map((word, w) => (
                    <span key={word.key}>
                      {w > 0 && " "}
                      <FindableWord word={word} toneOf={toneOf} onToggle={toggle} disabled={done} />
                    </span>
                  ))}
                </p>
                <p className="text-sm text-muted-foreground">{line.german}</p>
              </li>
            ))}
          </ol>
        ))}
      </div>

      <div className="mt-5 flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-muted-foreground" aria-live="polite" data-testid="find-count">
          Markiert: {selected.size}
        </p>
        {result && !done && (
          <div role="status" data-testid="find-feedback" className="w-full max-w-xl rounded-2xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm">
            <p className="font-semibold">
              {result.correct.length} von {total} richtig.
              {result.missing.length > 0 && ` Es fehlen noch ${result.missing.length}.`}
            </p>
            {result.wrong.length > 0 && (
              <p data-testid="find-wrong">
                {result.wrong.length} falsch markiert (rot) – tippe sie an, um sie zu entfernen.{" "}
                {wrongLetters.map((letter) => (
                  <span key={letter} className="mr-2 inline-block">
                    <span lang="ar" className="font-arabic text-lg font-bold">
                      {letter}
                    </span>{" "}
                    ist kein{" "}
                    <span lang="ar" className="font-arabic text-lg font-bold">
                      {target.letter}
                    </span>
                    .
                  </span>
                ))}
              </p>
            )}
          </div>
        )}
        {done && (
          <div role="status" data-testid="find-done" className="w-full max-w-xl animate-fade-in rounded-3xl border border-success/40 bg-card p-5 shadow-card">
            <p lang="ar" className="font-arabic text-3xl font-bold text-success">
              مُمْتَاز! 👏
            </p>
            <p className="mt-1 text-muted-foreground">
              Du hast alle {total} gefunden – und nichts anderes markiert.
            </p>
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          {!done && (
            <Button size="lg" onClick={check} disabled={selected.size === 0} data-testid="find-check" className="min-h-12">
              <SearchCheck className="h-5 w-5" aria-hidden /> Prüfen
            </Button>
          )}
          {result && !done && !reveal && (
            <Button variant="secondary" size="lg" onClick={() => setReveal(true)} data-testid="find-reveal" className="min-h-12">
              <Eye className="h-5 w-5" aria-hidden /> Hilfe: fehlende zeigen
            </Button>
          )}
          {(done || selected.size > 0) && (
            <Button variant="secondary" size="lg" onClick={again} data-testid="find-again" className="min-h-12">
              <RotateCcw className="h-5 w-5" aria-hidden /> {done ? "Nochmal" : "Alles löschen"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

type Box = { left: number; right: number; top: number; bottom: number };
/** Measured letter boxes, relative to the word (px). */
type Layout = { width: number; height: number; letters: Record<string, Box> };

/** The tap surface reaches this far beyond the word on both sides (px). */
const TAP_MARGIN = 6;

export function FindableWord({ word, toneOf, onToggle, disabled }: { word: FindWord; toneOf: (key: string) => Tone | null; onToggle: (key: string) => void; disabled: boolean }) {
  const wrapper = useRef<HTMLSpanElement>(null);
  const base = useRef<HTMLSpanElement>(null);
  const [layout, setLayout] = useState<Layout | null>(null);
  const text = word.tiles.map((t) => t.text).join("");
  const from = word.tiles.map((_, i) => word.tiles.slice(0, i).reduce((n, t) => n + t.text.length, 0));
  const tilesKey = JSON.stringify(word.tiles.map((t) => [t.key, t.text]));

  useLayoutEffect(() => {
    const tiles = JSON.parse(tilesKey) as Array<[string, string]>;
    const measure = () => {
      const node = base.current?.firstChild;
      const outer = wrapper.current?.getBoundingClientRect();
      if (!node || !outer || typeof document.createRange !== "function") return;
      const letters: Record<string, Box> = {};
      let offset = 0;
      for (const [key, tile] of tiles) {
        const range = document.createRange();
        range.setStart(node, offset);
        range.setEnd(node, offset + tile.length);
        offset += tile.length;
        const r = typeof range.getBoundingClientRect === "function" ? range.getBoundingClientRect() : null;
        if (!r || r.width <= 0) return; // not laid out (yet): keep the accessible fallback
        letters[key] = { left: r.left - outer.left, right: r.right - outer.left, top: r.top - outer.top, bottom: r.bottom - outer.top };
      }
      setLayout({ width: outer.width, height: outer.height, letters });
    };
    measure();
    let cancelled = false;
    document.fonts?.ready.then(() => !cancelled && measure()).catch(() => undefined);
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(measure);
    if (observer && wrapper.current) observer.observe(wrapper.current);
    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, [tilesKey]);

  /** A tap anywhere on the word marks the letter whose centre is nearest – so even a thin ا is easy to hit. */
  function tapWord(event: MouseEvent<HTMLSpanElement>) {
    if (disabled || !layout || !wrapper.current) return;
    const x = event.clientX - wrapper.current.getBoundingClientRect().left;
    let best: string | null = null;
    let distance = Infinity;
    for (const tile of word.tiles) {
      const box = layout.letters[tile.key];
      if (!tile.isLetter || !box) continue;
      const d = Math.abs(x - (box.left + box.right) / 2);
      if (d < distance) [best, distance] = [tile.key, d];
    }
    if (best) onToggle(best);
  }

  return (
    <span className="inline-block whitespace-nowrap" data-testid={`find-word-${word.key}`}>
      <span ref={wrapper} className="relative inline-block">
        <span ref={base}>{text}</span>
        {layout &&
          word.tiles.map((tile) => {
            const tone = toneOf(tile.key);
            const box = layout.letters[tile.key];
            if (!tone || !box) return null;
            return (
              <span key={tile.key} aria-hidden data-mark={tone}>
                <span className={cn("pointer-events-none absolute inset-0", TONE[tone].text)} style={{ clipPath: `inset(0px ${Math.max(0, layout.width - box.right - 1)}px 0px ${Math.max(0, box.left - 1)}px)` }}>
                  {text}
                </span>
                <span className={cn("pointer-events-none absolute bottom-1 h-[3px] rounded-full", TONE[tone].bar)} style={{ left: box.left, width: Math.max(4, box.right - box.left) }} />
              </span>
            );
          })}
        {layout && (
          // Pointer input only; keyboard and screen readers use the letter buttons below.
          <span aria-hidden data-testid={`find-surface-${word.key}`} onClick={tapWord} className={cn("absolute inset-y-0 cursor-pointer", disabled && "cursor-default")} style={{ left: -TAP_MARGIN, right: -TAP_MARGIN }} />
        )}
        {word.tiles
          .map((tile, t) => ({ tile, at: from[t]! }))
          .filter(({ tile }) => tile.isLetter)
          .map(({ tile, at }, i) => {
            const box = layout?.letters[tile.key];
            const tone = toneOf(tile.key);
            return (
              <button
                key={tile.key}
                type="button"
                onClick={() => onToggle(tile.key)}
                disabled={disabled}
                aria-pressed={tone === "selected" || tone === "correct" || tone === "wrong"}
                aria-label={`Buchstabe ${i + 1} von ${text}: ${tile.text}${tone === "wrong" ? " – falsch" : tone === "correct" ? " – richtig" : ""}`}
                data-testid={`find-tile-${tile.key}`}
                data-target={tile.target ? "true" : "false"}
                data-from={at}
                data-length={tile.text.length}
                data-tone={tone ?? ""}
                className={cn("rounded-md focus-ring", box ? "pointer-events-none absolute top-0 h-full" : "sr-only")}
                style={box ? { left: box.left, width: Math.max(1, box.right - box.left) } : undefined}
              />
            );
          })}
      </span>
      {word.trailing}
    </span>
  );
}
