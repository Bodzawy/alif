import { describe, expect, it } from "vitest";

import { arrowPoints, debugEnabled, evaluate, pathLen, resample, starsFor, toTemplate, TRACE_TOL, type Point } from "@/lib/writing/trace";

/** n evenly spaced points from a to b. */
const line = (a: Point, b: Point, n = 56): Point[] =>
  Array.from({ length: n }, (_, i) => ({ x: a.x + ((b.x - a.x) * i) / (n - 1), y: a.y + ((b.y - a.y) * i) / (n - 1) }));
const shift = (pts: Point[], dx: number, dy: number) => pts.map((p) => ({ x: p.x + dx, y: p.y + dy }));

// Synthetic templates in the 240 × 320 box: an Alif body (top → baseline) and a
// small Hamza above it (a short zig-zag), like the two strokes of أ.
const alifBody = line({ x: 120, y: 92 }, { x: 118, y: 262 });
const hamza = [...line({ x: 140, y: 46 }, { x: 108, y: 54 }, 20), ...line({ x: 108, y: 54 }, { x: 150, y: 59 }, 20).slice(1), ...line({ x: 150, y: 59 }, { x: 104, y: 100 }, 17).slice(1)];
const single = [toTemplate(alifBody)];
const twoStrokes = [toTemplate(line({ x: 120, y: 122 }, { x: 118, y: 262 })), toTemplate(hamza)];

describe("evaluate()", () => {
  it("passes a correct trace with a high score", () => {
    const result = evaluate(alifBody, single, 0);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.score).toBeGreaterThan(TRACE_TOL.stars.three);
  });

  it("passes a trace that is offset but close to the line", () => {
    const result = evaluate(shift(alifBody, 12, 6), single, 0);
    expect(result.ok).toBe(true);
  });

  it("returns 'reverse' for a trace drawn the wrong way round", () => {
    expect(evaluate([...alifBody].reverse(), single, 0)).toMatchObject({ ok: false, msg: "reverse" });
  });

  it("returns 'start' when the trace begins far from the start point", () => {
    const fromMiddle = line({ x: 119, y: 180 }, { x: 118, y: 262 });
    expect(evaluate(fromMiddle, single, 0)).toMatchObject({ ok: false, msg: "start" });
  });

  it("returns 'tooShort' for too few points or too short a stroke", () => {
    expect(evaluate(alifBody.slice(0, 3), single, 0)).toMatchObject({ ok: false, msg: "tooShort" });
    expect(evaluate(line({ x: 120, y: 92 }, { x: 120, y: 130 }), single, 0)).toMatchObject({ ok: false, msg: "tooShort" });
  });

  it("returns 'order' when the Hamza is traced first on a two-stroke form", () => {
    expect(evaluate(hamza, twoStrokes, 0)).toMatchObject({ ok: false, msg: "order" });
    // The right order works: body first, then the Hamza as stroke 2.
    expect(evaluate(twoStrokes[0]!.pts, twoStrokes, 0).ok).toBe(true);
    expect(evaluate(hamza, twoStrokes, 1).ok).toBe(true);
  });

  it("tells 'end' from 'cover' when the trace stops early or wanders off", () => {
    expect(evaluate(alifBody.slice(0, 40), single, 0)).toMatchObject({ ok: false, msg: "end" });
    const wander = alifBody.map((p, i) => (i > 15 && i < 45 ? { x: p.x + 60, y: p.y } : p));
    expect(evaluate(wander, single, 0)).toMatchObject({ ok: false });
  });

  it("reports the measured values for the debug view", () => {
    const result = evaluate(shift(alifBody, 10, 0), single, 0);
    expect(result.debug.startDist).toBeCloseTo(10);
    expect(result.debug.cover).toBeGreaterThan(0.85);
    expect(result.debug.acc).toBeGreaterThan(0.8);
    expect(result.debug.startTol).toBeCloseTo(TRACE_TOL.startTol * Math.min(1, pathLen(alifBody) / 200));
  });
});

describe("helpers", () => {
  it("resample spaces points evenly and keeps the count", () => {
    const pts = resample([{ x: 0, y: 0 }, { x: 0, y: 10 }, { x: 0, y: 100 }], 11);
    expect(pts).toHaveLength(11);
    expect(pts[5]!.y).toBeCloseTo(50);
  });

  it("gives 1–3 stars from the average score", () => {
    expect(starsFor([0.99, 0.97])).toBe(3);
    expect(starsFor([0.93])).toBe(2);
    expect(starsFor([0.86])).toBe(1);
  });

  it("puts the arrow beside the stroke", () => {
    const pts = arrowPoints(alifBody, { a: 0, b: 0.5, off: -30 });
    expect(pts.length).toBeGreaterThan(10);
    expect(Math.abs(pts[5]!.x - alifBody[5]!.x)).toBeCloseTo(30, 0);
  });

  it("debug view only with ?debug=1 and never in production builds", () => {
    expect(debugEnabled("?debug=1", "development")).toBe(true);
    expect(debugEnabled("?debug=1", "production")).toBe(false);
    expect(debugEnabled("", "development")).toBe(false);
  });
});
