// Checking a traced stroke against a letter template – pure geometry, no DOM.
// Ported unchanged from the prototype docs/reference/alif-uebung1.html
// (constants, samplePath resolution, resample, evaluate); only the numbers
// that were written inline are now named in TRACE_TOL.

export type Point = { x: number; y: number };

/** The writing box all letter data is drawn in. */
export const WRITING_BOX = { W: 240, H: 320, BASE: 262 } as const;

/**
 * Tolerances – to be tuned on real children's handwriting. Distances are in
 * box units (px of the 240 × 320 box) and are scaled down for short strokes
 * (see `scale`).
 */
export const TRACE_TOL = {
  /** The trace must start this close to the stroke's start point. */
  startTol: 46,
  /** …and end this close to its end, else "end" (only used to choose the hint). */
  endTol: 52,
  /** A template point counts as covered when the trace passes this close. */
  coverTol: 28,
  /** A trace point counts as accurate when it lies this close to the template. */
  accTol: 36,
  /** Share of template points that must be covered. */
  cover: 0.85,
  /** Share of trace points that must be accurate (prototype 0.8: a child's curve leaves the guide a little). */
  acc: 0.75,
  /**
   * Short strokes get tighter distances: factor = clamp(length / ref, min, max). The prototype's min 0.6
   * left a short head (حـ / جـ) a start circle of 28 px – on a phone about the width of a finger.
   */
  scale: { ref: 200, min: 0.75, max: 1 },
  /** Two strokes count as one line (evaluateJoined) when the first ends this close to where the second starts. */
  joinGap: 12,
  /** "tooShort": fewer points than this … */
  minPoints: 4,
  /** … or shorter than this share of the stroke length. */
  minLengthRatio: 0.35,
  /** "reverse": the trace ends within startTol × this of the start point (and began nearer the end). */
  reverseFactor: 1.3,
  /** Points per template stroke (prototype: samplePath(d, 56)). */
  templatePoints: 56,
  /** The trace is resampled to this many points before measuring. */
  resamplePoints: 64,
  /** Average score above which a form gets 3 / 2 stars (otherwise 1). */
  stars: { three: 0.96, two: 0.9 },
  /**
   * Dots (stroke type "dot"): a tap or a short scribble counts when every point
   * lies within `radius` of the dot's centre and the trace is at most `maxLength`
   * long (a long stroke does not count).
   */
  dot: { radius: 28, maxLength: 60 },
} as const;

export type TraceTolerances = typeof TRACE_TOL;

/** A stroke template: its sampled points and their length. */
export type StrokeTemplate = { pts: Point[]; len: number };

export type FailReason = "tooShort" | "reverse" | "start" | "order" | "end" | "cover" | "acc" | "dot";

/** Measured values for the debug view (in box units; tolerances already scaled). */
export type TraceDebug = {
  startDist: number;
  endDist: number;
  startTol: number;
  endTol: number;
  cover: number | null;
  acc: number | null;
  coverMin: number;
  accMin: number;
};

export type TraceResult = ({ ok: true; score: number } | { ok: false; msg: FailReason }) & { debug: TraceDebug };

export const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export const minDist = (p: Point, arr: readonly Point[]) => {
  let m = Infinity;
  for (const q of arr) {
    const d = dist(p, q);
    if (d < m) m = d;
  }
  return m;
};

export const pathLen = (pts: readonly Point[]) => {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += dist(pts[i - 1]!, pts[i]!);
  return L;
};

/** Evenly spaced points along a polyline (prototype resample, unchanged). */
export function resample(pts: readonly Point[], n: number): Point[] {
  const I = pathLen(pts) / (n - 1);
  if (!I) return pts.slice();
  const src = pts.map((p) => ({ ...p }));
  const out = [src[0]!];
  let D = 0;
  for (let i = 1; i < src.length; i++) {
    const d = dist(src[i - 1]!, src[i]!);
    if (D + d >= I) {
      const t = (I - D) / d;
      const q = { x: src[i - 1]!.x + t * (src[i]!.x - src[i - 1]!.x), y: src[i - 1]!.y + t * (src[i]!.y - src[i - 1]!.y) };
      out.push(q);
      src.splice(i, 0, q);
      D = 0;
    } else D += d;
  }
  while (out.length < n) out.push(src[src.length - 1]!);
  return out;
}

/** Template from already sampled points. */
export const toTemplate = (pts: Point[]): StrokeTemplate => ({ pts, len: pathLen(pts) });

/**
 * Checks the trace of stroke `idx` of a form (prototype evaluate, unchanged).
 * `strokes` are the form's templates in writing order.
 */
export function evaluate(user: readonly Point[], strokes: readonly StrokeTemplate[], idx: number, tol: TraceTolerances = TRACE_TOL): TraceResult {
  const { pts: tpl, len: L } = strokes[idx]!;
  const k = Math.max(tol.scale.min, Math.min(tol.scale.max, L / tol.scale.ref));
  const c = { startTol: tol.startTol * k, endTol: tol.endTol * k, coverTol: tol.coverTol * k, accTol: tol.accTol * k };
  const s = tpl[0]!;
  const e = tpl[tpl.length - 1]!;
  const us = user[0] ?? { x: NaN, y: NaN };
  const ue = user[user.length - 1] ?? us;
  const debug: TraceDebug = {
    startDist: dist(us, s),
    endDist: dist(ue, e),
    startTol: c.startTol,
    endTol: c.endTol,
    cover: null,
    acc: null,
    coverMin: tol.cover,
    accMin: tol.acc,
  };
  const fail = (msg: FailReason): TraceResult => ({ ok: false, msg, debug });

  if (user.length < tol.minPoints || pathLen(user) < L * tol.minLengthRatio) return fail("tooShort");
  if (dist(us, e) < dist(us, s) && dist(ue, s) < c.startTol * tol.reverseFactor) return fail("reverse");
  if (idx === 0 && strokes.length > 1 && dist(us, s) > c.startTol && minDist(us, strokes[1]!.pts) < c.startTol) return fail("order");
  if (dist(us, s) > c.startTol) return fail("start");
  const dense = resample(user, tol.resamplePoints);
  const cover = tpl.filter((p) => minDist(p, dense) < c.coverTol).length / tpl.length;
  const acc = dense.filter((p) => minDist(p, tpl) < c.accTol).length / dense.length;
  debug.cover = cover;
  debug.acc = acc;
  if (cover < tol.cover) return fail(dist(ue, e) > c.endTol ? "end" : "cover");
  if (acc < tol.acc) return fail("acc");
  return { ok: true, score: (cover + acc) / 2, debug };
}

/** Centre of a dot stroke (the mean of its template points, which lie on a small circle). */
export function dotCenter(tpl: StrokeTemplate): Point {
  const n = tpl.pts.length || 1;
  return { x: tpl.pts.reduce((s, p) => s + p.x, 0) / n, y: tpl.pts.reduce((s, p) => s + p.y, 0) / n };
}

/**
 * Checks a dot: a tap (a single point is enough) or a short scribble, all
 * within TRACE_TOL.dot.radius of the centre. Starting outside → "start";
 * leaving the dot or drawing too long a line → "dot". Score 0.9–1 by how
 * close to the centre the farthest point stayed.
 */
export function evaluateDot(user: readonly Point[], tpl: StrokeTemplate, tol: TraceTolerances = TRACE_TOL): TraceResult {
  const c = dotCenter(tpl);
  const us = user[0] ?? { x: NaN, y: NaN };
  const ue = user[user.length - 1] ?? us;
  const far = user.reduce((m, p) => Math.max(m, dist(p, c)), 0);
  const debug: TraceDebug = {
    startDist: dist(us, c),
    endDist: dist(ue, c),
    startTol: tol.dot.radius,
    endTol: tol.dot.radius,
    cover: null,
    acc: null,
    coverMin: tol.cover,
    accMin: tol.acc,
  };
  if (!(dist(us, c) <= tol.dot.radius)) return { ok: false, msg: "start", debug };
  if (far > tol.dot.radius || pathLen(user) > tol.dot.maxLength) return { ok: false, msg: "dot", debug };
  return { ok: true, score: 1 - 0.1 * (far / tol.dot.radius), debug };
}

/**
 * Checks stroke `idx` of a form whose strokes may include dots (`dots[i]`):
 * dots go to evaluateDot, all other strokes to evaluate() unchanged. A failed
 * line that is really a tap on a LATER dot becomes "order" ("Zuerst …").
 */
export function evaluateStroke(user: readonly Point[], strokes: readonly StrokeTemplate[], idx: number, dots: readonly boolean[], tol: TraceTolerances = TRACE_TOL): TraceResult {
  if (dots[idx]) return evaluateDot(user, strokes[idx]!, tol);
  const result = evaluate(user, strokes, idx, tol);
  if (result.ok) return result;
  const tappedLaterDot = strokes.some((tpl, j) => j > idx && dots[j] && evaluateDot(user, tpl, tol).ok);
  return tappedLaterDot ? { ok: false, msg: "order", debug: result.debug } : result;
}

/**
 * A child often draws two strokes that meet (the head of ج and its curve) in ONE line. When stroke `idx`
 * failed, this checks the trace against strokes idx and idx + 1 joined – both lines, the second starting
 * where the first ends. ok → the trace covers both strokes; null when they cannot be joined.
 */
export function evaluateJoined(user: readonly Point[], strokes: readonly StrokeTemplate[], idx: number, dots: readonly boolean[], tol: TraceTolerances = TRACE_TOL): TraceResult | null {
  const a = strokes[idx];
  const b = strokes[idx + 1];
  if (!a || !b || dots[idx] || dots[idx + 1]) return null;
  if (dist(a.pts[a.pts.length - 1]!, b.pts[0]!) > tol.joinGap) return null;
  const joined = toTemplate([...a.pts, ...b.pts.slice(1)]);
  return evaluate(user, [joined], 0, tol);
}

/**
 * Checks stroke `idx` like evaluateStroke, and also as one line with the next stroke (evaluateJoined).
 * The joined reading wins when the single one failed, or when the line is clearly longer than stroke
 * `idx` alone (ـحـ: its curve runs back over the head, so a one-line trace can pass as the head too).
 * `strokes`: how many strokes the trace completed (1 or 2).
 */
export function evaluateTrace(user: readonly Point[], strokes: readonly StrokeTemplate[], idx: number, dots: readonly boolean[], tol: TraceTolerances = TRACE_TOL): { result: TraceResult; strokes: 1 | 2 } {
  const single = evaluateStroke(user, strokes, idx, dots, tol);
  const longer = pathLen(user) > strokes[idx]!.len * 1.25;
  if (single.ok && !longer) return { result: single, strokes: 1 };
  const joined = evaluateJoined(user, strokes, idx, dots, tol);
  if (joined?.ok) return { result: joined, strokes: 2 };
  return { result: single, strokes: 1 };
}

/** Stars for a form from the average score of its strokes (prototype thresholds). */
export function starsFor(scores: readonly number[], tol: TraceTolerances = TRACE_TOL): 1 | 2 | 3 {
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return avg > tol.stars.three ? 3 : avg > tol.stars.two ? 2 : 1;
}

/** Points of a stroke's guide arrow: part a → b of the template, shifted `off` to the side (prototype arrowFor). */
export function arrowPoints(tpl: readonly Point[], arrow: { a: number; b: number; off: number }): Point[] {
  const n = tpl.length;
  const ia = Math.floor(arrow.a * (n - 1));
  const ib = Math.floor(arrow.b * (n - 1));
  const pts: Point[] = [];
  for (let j = ia; j <= ib; j++) {
    const p = tpl[j]!;
    const q = tpl[Math.min(n - 1, j + 1)]!;
    const r = tpl[Math.max(0, j - 1)]!;
    const dx = q.x - r.x;
    const dy = q.y - r.y;
    const L = Math.hypot(dx, dy) || 1;
    pts.push({ x: p.x + (-dy / L) * arrow.off, y: p.y + (dx / L) * arrow.off });
  }
  return pts;
}

/** Demo timing (prototype): ms to draw a stroke of length L, pause between strokes. */
export const strokeMs = (L: number) => 450 + L * 4.2;
export const DEMO_GAP_MS = 300;
export const demoTotal = (lens: readonly number[]) => lens.reduce((s, L) => s + strokeMs(L) + DEMO_GAP_MS, 0);

/** Debug view: only with ?debug=1, never in production builds. */
export function debugEnabled(search: string, nodeEnv: string | undefined): boolean {
  return nodeEnv !== "production" && new URLSearchParams(search).get("debug") === "1";
}
