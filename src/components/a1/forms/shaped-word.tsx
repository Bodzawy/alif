"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { hamzaIndex, isHamzaHeld } from "@/lib/arabic/hamza-alif";
import { cn } from "@/lib/utils";

type Box = { top: number; right: number; bottom: number; left: number };
type Range2 = [from: number, to: number];
/** What to colour inside one run of text (character offsets into that run). */
type Mark = { kind: "alif"; at: Range2 } | { kind: "muted"; at: Range2 } | { kind: "hand"; alif: Range2; neighbor: Range2 };

const MARK_CLASS = { alif: "text-primary", hand: "text-accent", muted: "text-muted-foreground" } as const;

// An Arabic word written as ONE string, so the browser shapes every join itself.
// Highlights never split the text into spans (that can break the shaping in
// some browsers): the same string is drawn again on top, in colour, and clipped
// to the measured box of the Hamza-Alif ("alif") and of the connecting stroke
// of the letter before it ("hand").
//
// `gap`: when the Alif is NOT held by the letter before it, show that with a
// visible gap and the neighbour muted (as in "Wer hält fest?"). Splitting the
// text there is safe: a letter without a Hand never joins the next one.
export function ShapedWord({
  tiles,
  highlight = false,
  gap = false,
  className,
  testId,
}: {
  tiles: readonly string[];
  /** Colour the Hamza-Alif and, when it is held, the neighbour's Hand. */
  highlight?: boolean;
  /** Show a gap and a muted neighbour when the Alif is not held. */
  gap?: boolean;
  className?: string;
  testId?: string;
}) {
  const index = hamzaIndex(tiles);
  const held = index > 0 && isHamzaHeld(tiles, index);
  const split = highlight && gap && index > 0 && !held;
  const before = tiles.slice(0, Math.max(0, index)).join("");
  const [measured, setMeasured] = useState<Record<number, boolean>>({});
  const onMeasured = (run: number) => (ok: boolean) => setMeasured((current) => (current[run] === ok ? current : { ...current, [run]: ok }));

  let runs: Array<{ text: string; marks: Mark[] }>;
  if (!highlight || index < 0) {
    runs = [{ text: tiles.join(""), marks: [] }];
  } else if (split) {
    const neighbor = tiles[index - 1]!;
    runs = [
      { text: before, marks: [{ kind: "muted", at: [before.length - neighbor.length, before.length] }] },
      { text: tiles.slice(index).join(""), marks: [{ kind: "alif", at: [0, tiles[index]!.length] }] },
    ];
  } else {
    const alif: Range2 = [before.length, before.length + tiles[index]!.length];
    const marks: Mark[] = [{ kind: "alif", at: alif }];
    if (held) marks.push({ kind: "hand", alif, neighbor: [before.length - tiles[index - 1]!.length, before.length] });
    runs = [{ text: tiles.join(""), marks }];
  }

  const highlighted = runs.some((run, i) => run.marks.length > 0 && measured[i]);

  return (
    <span
      lang="ar"
      dir="rtl"
      data-testid={testId}
      data-held={index > 0 ? held : undefined}
      data-gap={split ? "true" : undefined}
      data-highlighted={highlighted ? "true" : "false"}
      className={cn("relative inline-flex items-baseline whitespace-nowrap font-arabic font-bold", split && "gap-[0.35em]", className)}
    >
      {runs.map((run, i) => (
        <Run key={`${runs.length}-${i}`} text={run.text} marks={run.marks} onMeasured={onMeasured(i)} handTestId={testId ? `${testId}-hand` : undefined} />
      ))}
    </span>
  );
}

function Run({ text, marks, onMeasured, handTestId }: { text: string; marks: Mark[]; onMeasured: (ok: boolean) => void; handTestId?: string }) {
  const wrapper = useRef<HTMLSpanElement>(null);
  const base = useRef<HTMLSpanElement>(null);
  const baseline = useRef<HTMLSpanElement>(null);
  const [boxes, setBoxes] = useState<Array<{ kind: Mark["kind"]; box: Box }>>([]);
  // Effect inputs by content, not by object identity.
  const markKey = JSON.stringify(marks);
  const onMeasuredRef = useRef(onMeasured);
  onMeasuredRef.current = onMeasured;

  useLayoutEffect(() => {
    const wanted = JSON.parse(markKey) as Mark[];
    if (wanted.length === 0) {
      setBoxes([]);
      return;
    }
    const measure = () => {
      const node = base.current?.firstChild;
      const outer = wrapper.current?.getBoundingClientRect();
      if (!node || !outer || typeof document.createRange !== "function") return;
      const rect = ([from, to]: Range2) => {
        const range = document.createRange();
        range.setStart(node, from);
        range.setEnd(node, to);
        const r = typeof range.getBoundingClientRect === "function" ? range.getBoundingClientRect() : null;
        return r && r.width > 0 ? r : null;
      };
      const toBox = (left: number, right: number): Box => ({
        top: 0,
        bottom: 0,
        left: Math.max(0, left - outer.left),
        right: Math.max(0, outer.right - right),
      });
      const result: Array<{ kind: Mark["kind"]; box: Box }> = [];
      for (const mark of wanted) {
        if (mark.kind !== "hand") {
          const r = rect(mark.at);
          if (r) result.push({ kind: mark.kind, box: toBox(r.left - 1, r.right + 1) });
          continue;
        }
        // RTL: the neighbour stands right of the Alif; its Hand is its left end,
        // the joining stroke along the baseline (dots and harakat stay out).
        const alif = rect(mark.alif);
        const neighbor = rect(mark.neighbor);
        if (!alif || !neighbor) continue;
        const box = toBox(alif.right - 2, alif.right + Math.max(6, neighbor.width * 0.42));
        const line = baseline.current?.getBoundingClientRect().top;
        const size = parseFloat(getComputedStyle(wrapper.current!).fontSize) || 0;
        if (line !== undefined && size > 0) {
          box.top = Math.max(0, line - outer.top - size * 0.24);
          box.bottom = Math.max(0, outer.bottom - (line + size * 0.1));
        }
        result.push({ kind: "hand", box });
      }
      setBoxes(result);
      onMeasuredRef.current(result.length > 0);
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
  }, [markKey, text]);

  const clip = (box: Box) => `inset(${box.top}px ${box.right}px ${box.bottom}px ${box.left}px)`;
  // Muted first, then the Alif, then the Hand on top.
  const order = { muted: 0, alif: 1, hand: 2 } as const;

  return (
    <span ref={wrapper} className="relative inline-block">
      <span ref={base}>{text}</span>
      {/* Baseline marker after the text: never between letters, so it cannot break a join. */}
      <span ref={baseline} aria-hidden className="inline-block h-0 w-0 align-baseline" />
      {[...boxes]
        .sort((a, b) => order[a.kind] - order[b.kind])
        .map(({ kind, box }) => (
          <span
            key={kind}
            aria-hidden
            data-mark={kind}
            data-testid={kind === "hand" ? handTestId : undefined}
            className={cn("pointer-events-none absolute inset-0", MARK_CLASS[kind])}
            style={{ clipPath: clip(box) }}
          >
            {text}
          </span>
        ))}
    </span>
  );
}
