"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type PointerEvent as ReactPointerEvent } from "react";
import { CheckCircle2, Eye, SkipForward, StepForward } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { WritingLetterSet } from "@/data/types";
import { playChime, unlockChime } from "@/lib/audio/chime";
import { getLessonProgress, markLessonCompleted, subscribeProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";
import { debugEnabled, demoTotal, evaluate, starsFor, WRITING_BOX, type FailReason, type Point, type StrokeTemplate, type TraceResult } from "@/lib/writing/trace";

import { arrowFor, baseline, drawDemo, poly, readPalette, startDot, strokeWidth, type Palette } from "./draw";
import { sampleLetterSet } from "./sample-path";
import { useWritingNarration } from "./writing-narration";

// "Schreiben" – trace the forms of a letter (workbook "تدريب (١)", "Fahr die
// Linie nach"). Ported from the prototype docs/reference/alif-uebung1.html:
// a sheet with a model row (tap = writing demo) and a grey row (tap = load into
// the board), and a large board on which the child traces with finger, pen or
// mouse. Each stroke is checked by evaluate() (src/lib/writing/trace.ts).
// All nine canvases share one requestAnimationFrame loop.

const { W, H } = WRITING_BOX;

const TXT = {
  go: (name: string) => `Fahr ${name} nach. Fang beim grünen Punkt an.`,
  hamza: "Gut! Jetzt die Hamza oben. Fang beim grünen Punkt ٢ an.",
  allDone: "Super! Du hast alle vier Formen nachgefahren. Übung 1 geschafft!",
  praise: ["Toll gemacht!", "Super!", "Prima!", "Klasse!"],
  fail: {
    tooShort: "Fahr die ganze Linie nach, bis zum Ende.",
    reverse: "Andersrum! Folge dem Pfeil.",
    start: "Fang beim grünen Punkt an.",
    order: "Zuerst das Alif, dann die Hamza.",
    end: "Fast! Zieh die Linie bis zum Ende.",
    cover: "Fast! Bleib auf der grauen Spur.",
    acc: "Fast! Bleib auf der grauen Spur.",
  } satisfies Record<FailReason, string>,
};

/** A finished form: the child's strokes and stars (0 = skipped). */
type Done = { strokes: Point[][]; stars: number };
type View = { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; kind: "model" | "gray" | "board"; form: number; scale: number; demoStart: number };

const noop = () => () => undefined;

export function WritingStep({ letterSet, progressKey, onComplete }: { letterSet: WritingLetterSet; progressKey: string; onComplete?: () => void }) {
  const forms = letterSet.forms;
  const narrate = useWritingNarration();
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const completedBefore = useSyncExternalStore(subscribeProgress, () => Boolean(getLessonProgress(progressKey).completedAt), () => false);

  const [cur, setCur] = useState(0);
  const [instr, setInstr] = useState(() => TXT.go(forms[0]!.name));
  const [done, setDone] = useState<(Done | null)[]>(() => forms.map(() => null));
  const [toast, setToast] = useState<{ key: number; stars: number; word: string } | null>(null);
  const [allDone, setAllDone] = useState(false);
  const [debug, setDebug] = useState(false);
  const [lastEval, setLastEval] = useState<TraceResult | null>(null);

  // Everything the animation loop and the pointer handlers read lives in refs.
  const tpls = useRef<StrokeTemplate[][] | null>(null);
  const palette = useRef<Palette | null>(null);
  const reduceMotion = useRef(false);
  const debugRef = useRef(false);
  const views = useRef(new Map<string, View>());
  const resizeObserver = useRef<ResizeObserver | null>(null);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const boardWrap = useRef<HTMLDivElement>(null);
  const st = useRef({
    cur: 0,
    stroke: 0,
    user: [] as Point[],
    committed: [] as Point[][],
    scores: [] as number[],
    drawing: false,
    busy: false,
    ink: "draw" as "draw" | "good" | "bad",
    badAt: 0,
    flashUntil: 0,
    done: forms.map(() => null) as (Done | null)[],
  });
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const later = useCallback((fn: () => void, ms: number) => {
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      fn();
    }, ms);
    timers.current.add(timer);
  }, []);

  // Browser-only setup: templates, colours, motion preference, debug flag.
  useEffect(() => {
    try {
      tpls.current = sampleLetterSet(letterSet);
    } catch (error) {
      // No SVG geometry (very old browser, test DOM): nothing to trace, but no crash.
      console.warn("Schreiben: letter paths could not be measured.", error);
      tpls.current = null;
    }
    palette.current = readPalette();
    reduceMotion.current = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    debugRef.current = debugEnabled(window.location.search, process.env.NODE_ENV);
    setDebug(debugRef.current);
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, [letterSet]);

  // Canvases: size to the CSS box × devicePixelRatio.
  useEffect(() => {
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const view = [...views.current.values()].find((v) => v.canvas === entry.target);
        if (!view) continue;
        const r = view.canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        view.canvas.width = Math.max(1, Math.round(r.width * dpr));
        view.canvas.height = Math.max(1, Math.round(r.height * dpr));
        view.scale = view.canvas.width / W;
      }
    });
    resizeObserver.current = observer;
    views.current.forEach((v) => observer.observe(v.canvas));
    return () => observer.disconnect();
  }, []);

  // Stable ref callbacks (one per canvas), so re-renders never re-register a canvas.
  const canvasRefs = useRef(new Map<string, (canvas: HTMLCanvasElement | null) => void>());
  const registerCanvas = useCallback((id: string, kind: View["kind"], form: number) => {
    let ref = canvasRefs.current.get(id);
    if (!ref) {
      ref = (canvas) => {
        const existing = views.current.get(id);
        if (!canvas) {
          if (existing) resizeObserver.current?.unobserve(existing.canvas);
          views.current.delete(id);
          return;
        }
        if (existing?.canvas === canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        views.current.set(id, { canvas, ctx, kind, form, scale: 1, demoStart: 0 });
        resizeObserver.current?.observe(canvas);
      };
      canvasRefs.current.set(id, ref);
    }
    return ref;
  }, []);

  // One animation loop for all canvases.
  useEffect(() => {
    let frame = 0;
    const render = (now: number) => {
      const T = tpls.current;
      const c = palette.current;
      if (T && c) {
        const s = st.current;
        for (const v of views.current.values()) {
          const f = forms[v.form]!;
          const tpl = T[v.form]!;
          const { ctx } = v;
          ctx.setTransform(v.scale, 0, 0, v.scale, 0, 0);
          ctx.clearRect(0, 0, W, H);
          baseline(ctx, c);
          const demoOn = v.demoStart > 0 && now - v.demoStart < demoTotal(tpl.map((t) => t.len));
          if (v.kind === "model") {
            if (demoOn) drawDemo(ctx, c, f, tpl, now - v.demoStart, 14, now, reduceMotion.current);
            else {
              tpl.forEach((t, i) => poly(ctx, t.pts, t.pts.length, c.ink, strokeWidth(f, i, 14)));
              tpl.forEach((_, i) => arrowFor(ctx, f, tpl, i, c.ink, 0.85, true));
            }
          } else if (v.kind === "gray") {
            tpl.forEach((t, i) => poly(ctx, t.pts, t.pts.length, c.ghost, strokeWidth(f, i, 14)));
            tpl.forEach((_, i) => arrowFor(ctx, f, tpl, i, c.ghost, 1, true));
            const d = s.done[v.form];
            if (d) {
              d.strokes.forEach((stroke, i) => poly(ctx, stroke, stroke.length, c.ok, strokeWidth(f, i, 10)));
              ctx.save();
              ctx.fillStyle = c.star;
              ctx.font = "800 30px sans-serif";
              ctx.textAlign = "center";
              ctx.fillText("★".repeat(d.stars), W / 2, 300);
              ctx.restore();
            }
          } else if (demoOn) {
            drawDemo(ctx, c, f, tpl, now - v.demoStart, 16, now, reduceMotion.current);
          } else {
            tpl.forEach((t, i) => poly(ctx, t.pts, t.pts.length, c.ghost, strokeWidth(f, i, 30), 0.75));
            tpl.forEach((t) => poly(ctx, t.pts, t.pts.length, c.muted, 2, 0.45, [6, 8]));
            if (now < s.flashUntil) tpl.forEach((t, i) => poly(ctx, t.pts, t.pts.length, c.ok, strokeWidth(f, i, 30), 0.35));
            s.committed.forEach((stroke, i) => poly(ctx, stroke, stroke.length, c.ok, strokeWidth(f, i, 14)));
            if (!s.busy && s.stroke < tpl.length) {
              arrowFor(ctx, f, tpl, s.stroke, c.muted, 0.9, false);
              startDot(ctx, c, tpl[s.stroke]!.pts[0]!, s.stroke, now, reduceMotion.current);
            }
            if (s.user.length) {
              let color = c.ink;
              let alpha = 1;
              if (s.ink === "good") color = c.ok;
              if (s.ink === "bad") {
                color = c.bad;
                alpha = Math.max(0, 1 - (now - s.badAt) / 700);
              }
              poly(ctx, s.user, s.user.length, color, strokeWidth(f, s.stroke, 14), alpha);
            }
            if (debugRef.current) {
              // Debug: the sampled template points.
              ctx.save();
              ctx.fillStyle = c.bad;
              tpl.forEach((t) => t.pts.forEach((p) => ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3)));
              ctx.restore();
            }
          }
        }
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, [forms]);

  const board = () => views.current.get("board");

  const resetAttempt = () => {
    const s = st.current;
    s.user = [];
    s.committed = [];
    s.stroke = 0;
    s.scores = [];
    s.ink = "draw";
  };

  const select = useCallback(
    (i: number) => {
      const s = st.current;
      s.cur = i;
      const b = views.current.get("board");
      if (b) {
        b.form = i;
        b.demoStart = 0;
      }
      resetAttempt();
      s.busy = false;
      setCur(i);
      setInstr(TXT.go(forms[i]!.name));
      narrate({ type: "go", form: forms[i]! });
    },
    [forms, narrate]
  );

  /** After a form is finished (traced or skipped): the next open form, or the end. */
  const advance = useCallback(() => {
    const s = st.current;
    const next = s.done.findIndex((d) => !d);
    if (next === -1) {
      resetAttempt();
      setInstr(TXT.allDone);
      setAllDone(true);
      markLessonCompleted(progressKey);
      narrate({ type: "allDone" });
      onCompleteRef.current?.();
    } else select(next);
  }, [narrate, progressKey, select]);

  function finish() {
    const s = st.current;
    if (!s.drawing || !tpls.current) return;
    s.drawing = false;
    const f = forms[s.cur]!;
    const tpl = tpls.current[s.cur]!;
    const r = evaluate(s.user, tpl, s.stroke);
    const now = performance.now();
    if (debugRef.current) setLastEval(r);
    if (r.ok) {
      s.committed.push(s.user);
      s.user = [];
      s.scores = s.scores.concat(r.score);
      if (s.stroke < tpl.length - 1) {
        s.stroke++;
        setInstr(TXT.hamza);
        narrate({ type: "nextStroke", form: f, stroke: s.stroke });
        return;
      }
      const stars = starsFor(s.scores);
      s.done[s.cur] = { strokes: s.committed.slice(), stars };
      setDone([...s.done]);
      s.busy = true;
      s.flashUntil = now + 900;
      playChime();
      setToast({ key: now, stars, word: TXT.praise[Math.floor(Math.random() * TXT.praise.length)]! });
      narrate({ type: "formDone", form: f, stars });
      later(() => {
        s.busy = false;
        setToast(null);
        advance();
      }, 1100);
    } else {
      s.ink = "bad";
      s.badAt = now;
      s.busy = true;
      setInstr(TXT.fail[r.msg]);
      narrate({ type: "fail", reason: r.msg });
      later(() => {
        resetAttempt();
        s.busy = false;
        setInstr(TXT.go(forms[s.cur]!.name));
      }, 1300);
    }
  }

  const toBox = (e: { clientX: number; clientY: number }, canvas: HTMLCanvasElement): Point => {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };
  const demoRunning = () => {
    const b = board();
    return Boolean(b && tpls.current && b.demoStart && performance.now() - b.demoStart < demoTotal(tpls.current[b.form]!.map((t) => t.len)));
  };

  function onPointerDown(e: ReactPointerEvent<HTMLCanvasElement>) {
    unlockChime();
    const s = st.current;
    if (s.busy || demoRunning() || allDone) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    s.drawing = true;
    s.ink = "draw";
    s.user = [toBox(e, e.currentTarget)];
  }
  function onPointerMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    const s = st.current;
    if (!s.drawing) return;
    const native = e.nativeEvent;
    const events = typeof native.getCoalescedEvents === "function" ? native.getCoalescedEvents() : [];
    for (const ev of events.length ? events : [native]) s.user.push(toBox(ev, e.currentTarget));
  }
  function onPointerCancel() {
    const s = st.current;
    s.drawing = false;
    s.user = [];
  }

  function onModel(i: number) {
    unlockChime();
    const v = views.current.get(`model-${i}`);
    if (v) v.demoStart = performance.now();
  }
  function onGray(i: number) {
    unlockChime();
    select(i);
    // On a phone the board is below the sheet: bring it into view.
    const r = boardWrap.current?.getBoundingClientRect();
    if (r && (r.bottom > window.innerHeight || r.top < 0)) {
      boardWrap.current?.scrollIntoView({ block: "center", behavior: reduceMotion.current ? "auto" : "smooth" });
    }
  }
  function onDemo() {
    const s = st.current;
    if (s.busy || s.drawing) return;
    resetAttempt();
    const b = board();
    if (b) b.demoStart = performance.now();
  }
  /** Keyboard / no-tracing path: marks the current form as done without stars. */
  function onSkip() {
    const s = st.current;
    if (s.busy || s.drawing || allDone) return;
    s.done[s.cur] = { strokes: [], stars: 0 };
    setDone([...s.done]);
    advance();
  }

  const doneCount = done.filter(Boolean).length;

  return (
    <div data-testid="writing-step" data-current={forms[cur]!.id} data-done={doneCount} data-complete={allDone} data-ready={hydrated}>
      {hydrated && (completedBefore || allDone) && (
        <p className="mb-4 inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow" data-testid="step-completed">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Geschafft
        </p>
      )}

      <div className="grid items-start gap-5 min-[880px]:grid-cols-[1.15fr_1fr]">
        <section aria-label="Arbeitsblatt" className="rounded-3xl border bg-card p-5 shadow-card">
          <div className="mb-1 flex items-baseline justify-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">Übung 1</h2>
            <span lang="ar" dir="rtl" className="font-arabic text-2xl font-bold">
              تدريب (١)
            </span>
          </div>
          <div className="mx-1 mb-2 flex items-baseline justify-between gap-3">
            <span className="font-semibold">Fahr die Linie nach.</span>
            <span lang="ar" dir="rtl" className="font-arabic text-xl">
              تَتَبَّعْ بِالْقَلَمِ.
            </span>
          </div>
          <p className="mx-1 mb-1 text-sm text-muted-foreground">Tippe auf einen Buchstaben, um zu sehen, wie man ihn schreibt.</p>
          <div dir="rtl" className="mb-2 grid grid-cols-4" data-testid="model-row">
            {forms.map((f, i) => (
              <button key={f.id} type="button" onClick={() => onModel(i)} aria-label={`${f.glyph}: vorzeigen`} data-testid={`model-${f.id}`} className="rounded-2xl focus-ring">
                <canvas ref={registerCanvas(`model-${i}`, "model", i)} className="block aspect-[3/4] w-full" aria-hidden />
              </button>
            ))}
          </div>
          <p className="mx-1 mb-1 text-sm text-muted-foreground">Tippe auf einen grauen Buchstaben und fahr ihn nach.</p>
          <div dir="rtl" className="grid grid-cols-4" data-testid="gray-row">
            {forms.map((f, i) => {
              const d = done[i];
              const status = d ? (d.stars ? `, geschafft, ${d.stars} ${d.stars === 1 ? "Stern" : "Sterne"}` : ", übersprungen") : "";
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onGray(i)}
                  aria-label={`${f.glyph}: nachfahren${status}`}
                  aria-pressed={i === cur}
                  data-testid={`gray-${f.id}`}
                  data-done={d ? (d.stars ? "traced" : "skipped") : "open"}
                  data-stars={d?.stars ?? 0}
                  className={cn("relative rounded-2xl focus-ring", i === cur && "shadow-[inset_0_0_0_3px_hsl(var(--primary))]")}
                >
                  <canvas ref={registerCanvas(`gray-${i}`, "gray", i)} className="block aspect-[3/4] w-full" aria-hidden />
                  {d && !d.stars && <span className="absolute inset-x-0 bottom-1 text-center text-[10px] font-semibold text-muted-foreground">übersprungen</span>}
                </button>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-3" aria-label="Nachfahren">
          <p aria-live="polite" data-testid="writing-instruction" className="min-h-[3em] text-lg font-semibold leading-snug">
            {instr}
          </p>
          <div ref={boardWrap} className="relative aspect-[3/4] w-[min(100%,380px,calc(62vh*0.75))] self-center">
            <canvas
              ref={registerCanvas("board", "board", 0)}
              data-testid="writing-board"
              aria-label={`Schreibfläche: ${forms[cur]!.glyph}`}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={finish}
              onPointerCancel={onPointerCancel}
              className="block h-full w-full cursor-crosshair touch-none select-none rounded-[26px] bg-card shadow-[0_0_0_2px_hsl(var(--border))] [-webkit-touch-callout:none]"
            />
            {toast && (
              <div key={toast.key} aria-hidden data-testid="writing-toast" className="pointer-events-none absolute inset-0 grid place-content-center justify-items-center gap-1 motion-safe:animate-pop">
                <div className="text-5xl leading-none tracking-widest text-accent">
                  {"★".repeat(toast.stars)}
                  <span className="text-border">{"★".repeat(3 - toast.stars)}</span>
                </div>
                <div className="rounded-full bg-card px-4 py-0.5 text-2xl font-bold text-success shadow-[0_0_0_2px_hsl(var(--border))]">{toast.word}</div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="lg" onClick={onDemo} className="flex-1" data-testid="writing-demo">
              <Eye className="h-5 w-5" aria-hidden /> Vorzeigen
            </Button>
            <Button size="lg" onClick={() => select((st.current.cur + 1) % forms.length)} className="flex-1" data-testid="writing-next">
              <StepForward className="h-5 w-5" aria-hidden /> Nächster Buchstabe
            </Button>
          </div>
          <Button variant="ghost" size="lg" onClick={onSkip} disabled={allDone} data-testid="writing-skip" className="self-center">
            <SkipForward className="h-5 w-5" aria-hidden /> Überspringen
          </Button>
          {allDone && (
            <div data-testid="writing-done" className="animate-fade-in rounded-3xl border border-success/40 bg-card p-6 text-center shadow-card">
              <span className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-success-foreground shadow">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Geschafft
              </span>
              <p lang="ar" className="mt-3 font-arabic text-4xl font-bold text-success">
                مُمْتَاز! 👏
              </p>
            </div>
          )}
          {debug && (
            <pre data-testid="writing-debug" className="overflow-x-auto rounded-2xl bg-muted p-3 text-xs">
              {lastEval
                ? [
                    `result: ${lastEval.ok ? `ok, score ${lastEval.score.toFixed(3)}` : lastEval.msg}`,
                    `cover:  ${lastEval.debug.cover?.toFixed(3) ?? "–"}  (min ${lastEval.debug.coverMin})`,
                    `acc:    ${lastEval.debug.acc?.toFixed(3) ?? "–"}  (min ${lastEval.debug.accMin})`,
                    `start:  ${lastEval.debug.startDist.toFixed(1)}  (tol ${lastEval.debug.startTol.toFixed(1)})`,
                    `end:    ${lastEval.debug.endDist.toFixed(1)}  (tol ${lastEval.debug.endTol.toFixed(1)})`,
                  ].join("\n")
                : "debug: noch kein Strich"}
            </pre>
          )}
        </section>
      </div>
    </div>
  );
}
