import { describe, expect, it } from "vitest";

import { baWriting } from "@/data/letters/ba";
import { dotCenter, evaluate, evaluateDot, evaluateStroke, toTemplate, TRACE_TOL, WRITING_BOX, type Point } from "@/lib/writing/trace";

// Stroke type "dot" (the dots of ب ت ث ج خ): a tap or a short scribble near the
// dot's centre counts, a long stroke does not.

const line = (a: Point, b: Point, n = 56): Point[] =>
  Array.from({ length: n }, (_, i) => ({ x: a.x + ((b.x - a.x) * i) / (n - 1), y: a.y + ((b.y - a.y) * i) / (n - 1) }));
/** Template points of a dot: a small circle (as sampled from the data's circle path). */
const ring = (c: Point, r = 3, n = 56): Point[] => Array.from({ length: n }, (_, i) => ({ x: c.x + r * Math.cos((2 * Math.PI * i) / (n - 1)), y: c.y + r * Math.sin((2 * Math.PI * i) / (n - 1)) }));

const center = { x: 120, y: 296 };
const dotTpl = toTemplate(ring(center));
const body = toTemplate(line({ x: 196, y: 208 }, { x: 42, y: 262 }));

describe("dot strokes", () => {
  it("the centre is the middle of the circle", () => {
    const c = dotCenter(dotTpl);
    expect(c.x).toBeCloseTo(120, 0);
    expect(c.y).toBeCloseTo(296, 0);
  });

  it("a tap counts – one point is enough, also a little off the centre", () => {
    expect(evaluateDot([center], dotTpl).ok).toBe(true);
    expect(evaluateDot([{ x: 140, y: 310 }], dotTpl).ok).toBe(true); // 24 units away
    const r = evaluateDot([center], dotTpl);
    expect(r.ok && r.score).toBeCloseTo(1, 2);
  });

  it("a short scribble inside the radius counts", () => {
    const scribble = [center, { x: 126, y: 300 }, { x: 116, y: 292 }, { x: 124, y: 296 }];
    expect(evaluateDot(scribble, dotTpl).ok).toBe(true);
  });

  it("a tap outside the radius (about 28 units) is 'start'", () => {
    expect(TRACE_TOL.dot.radius).toBe(28);
    expect(evaluateDot([{ x: 150, y: 296 }], dotTpl)).toMatchObject({ ok: false, msg: "start" });
  });

  it("a long stroke does not count, even when it starts on the dot", () => {
    expect(evaluateDot(line(center, { x: 40, y: 296 }, 30), dotTpl)).toMatchObject({ ok: false, msg: "dot" });
    // Circling inside the dot for too long is a line, not a dot.
    const circling = Array.from({ length: 6 }, () => ring(center, 20, 20)).flat();
    expect(evaluateDot(circling, dotTpl)).toMatchObject({ ok: false, msg: "dot" });
  });

  it("evaluateStroke: dots go to the dot check; lines are checked exactly as before", () => {
    const strokes = [body, dotTpl];
    const dots = [false, true];
    expect(evaluateStroke([center], strokes, 1, dots).ok).toBe(true);
    const trace = line({ x: 196, y: 208 }, { x: 42, y: 262 }, 40);
    expect(evaluateStroke(trace, strokes, 0, dots)).toEqual(evaluate(trace, strokes, 0));
    // Without dots it is evaluate() itself (the Alif).
    expect(evaluateStroke(trace, [body], 0, [false])).toEqual(evaluate(trace, [body], 0));
  });

  it("evaluateStroke: tapping the dot before the body asks for the order ('Zuerst …')", () => {
    expect(evaluateStroke([center], [body, dotTpl], 0, [false, true])).toMatchObject({ ok: false, msg: "order" });
    // A plain bad tap elsewhere stays what evaluate() says.
    expect(evaluateStroke([{ x: 20, y: 20 }], [body, dotTpl], 0, [false, true])).toMatchObject({ ok: false, msg: "tooShort" });
  });
});

describe("Ba writing data", () => {
  it("four forms in book order (right to left): بـ ، ـبـ ، ـب ، ب; each body first, then one dot below", () => {
    expect(baWriting.forms.map((f) => f.glyph)).toEqual(["بـ", "ـبـ", "ـب", "ب"]);
    for (const form of baWriting.forms) {
      expect(form.strokes.map((s) => Boolean(s.dot)), form.id).toEqual([false, true]);
      expect(form.strokes[1]!.label).toBe("den Punkt unten");
      expect(form.name.startsWith("das Ba")).toBe(true);
    }
    expect(baWriting.orderHint).toBe("Zuerst das Ba, dann den Punkt.");
  });

  const numbers = (d: string) => (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
  const points = (d: string) => {
    const n = numbers(d.replace(/A3 3 0 1 1/g, ""));
    return Array.from({ length: n.length / 2 }, (_, i) => ({ x: n[2 * i]!, y: n[2 * i + 1]! }));
  };

  it("paths stay in the 240 × 320 box; bodies are written right to left and sit on the baseline; dots lie below it", () => {
    for (const form of baWriting.forms) {
      const [bodyStroke, dotStroke] = form.strokes;
      const pts = points(bodyStroke!.d);
      for (const p of pts) {
        expect(p.x).toBeGreaterThanOrEqual(0);
        expect(p.x).toBeLessThanOrEqual(WRITING_BOX.W);
        expect(p.y).toBeGreaterThanOrEqual(0);
        expect(p.y).toBeLessThanOrEqual(WRITING_BOX.H);
      }
      expect(pts[0]!.x, form.id).toBeGreaterThan(pts.at(-1)!.x);
      expect(Math.max(...pts.map((p) => p.y)), form.id).toBeGreaterThanOrEqual(WRITING_BOX.BASE);
      const dot = points(dotStroke!.d)[0]!;
      expect(dot.y, form.id).toBeGreaterThan(WRITING_BOX.BASE + 20);
    }
    // Middle and end forms come in from the right edge, like the Alif end forms.
    for (const id of ["ba-middle", "ba-end"]) expect(points(baWriting.forms.find((f) => f.id === id)!.strokes[0]!.d)[0]).toEqual({ x: 214, y: 262 });
  });
});
