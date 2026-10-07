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
  /** Share of trace points that must be accurate. */
  acc: 0.8,
  /** Short strokes get tighter distances: factor = clamp(length / ref, min, max). */
  scale: { ref: 200, min: 0.6, max: 1 },
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
} as const;

export type TraceTolerances = typeof TRACE_TOL;

/** A stroke template: its sampled points and their length. */
export type StrokeTemplate = { pts: Point[]; len: number };

export type FailReason = "tooShort" | "reverse" | "start" | "order" | "end" | "cover" | "acc";

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
