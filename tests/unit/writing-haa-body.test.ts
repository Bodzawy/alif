import { describe, expect, it } from "vitest";

import { hhaWriting } from "@/data/letters/hha";
import { jimWriting } from "@/data/letters/jim";
import { khaWriting } from "@/data/letters/kha";
import { evaluateJoined, evaluateStroke, evaluateTrace, resample, toTemplate, TRACE_TOL, WRITING_BOX, type Point, type StrokeTemplate } from "@/lib/writing/trace";

// ح ج خ share one body (HAA_BODY). Review 11/2026: the initial Jim "was always wrong" and its shape
// did not look like جـ. These tests trace the forms the way a child does: along the guide, a little
// shaky, and head + curve in one line.

/** Points along an SVG path made of M, L and C (the body strokes) – the test's stand-in for getPointAtLength. */
function pathPoints(d: string): Point[] {
  const nums = (s: string) => s.trim().split(/[\s,]+/).map(Number);
  const out: Point[] = [];
  let cur: Point = { x: 0, y: 0 };
  for (const [, cmd, args] of d.matchAll(/([MLC])([^MLCA]*)/g)) {
    const v = nums(args!);
    if (cmd === "M") {
      cur = { x: v[0]!, y: v[1]! };
      out.push(cur);
    } else if (cmd === "L") {
      const to = { x: v[0]!, y: v[1]! };
      for (let i = 1; i <= 20; i++) out.push({ x: cur.x + ((to.x - cur.x) * i) / 20, y: cur.y + ((to.y - cur.y) * i) / 20 });
      cur = to;
    } else {
      for (let k = 0; k + 5 < v.length; k += 6) {
        const [x1, y1, x2, y2, x, y] = v.slice(k, k + 6) as [number, number, number, number, number, number];
        for (let i = 1; i <= 40; i++) {
          const t = i / 40;
          const m = 1 - t;
          out.push({ x: m * m * m * cur.x + 3 * m * m * t * x1 + 3 * m * t * t * x2 + t * t * t * x, y: m * m * m * cur.y + 3 * m * m * t * y1 + 3 * m * t * t * y2 + t * t * t * y });
        }
        cur = { x, y };
      }
    }
  }
  return out;
}

/** A dot stroke's centre from its circle path "M{x+3} {y} A…". */
const dotCentre = (d: string): Point => {
  const [x, y] = d.slice(1).split(/[\s,A]+/).map(Number);
  return { x: x! - 3, y: y! };
};

const template = (d: string, dot: boolean): StrokeTemplate =>
  dot ? toTemplate(Array.from({ length: 56 }, (_, i) => ({ x: dotCentre(d).x + 3 * Math.cos((2 * Math.PI * i) / 55), y: dotCentre(d).y + 3 * Math.sin((2 * Math.PI * i) / 55) }))) : toTemplate(resample(pathPoints(d), TRACE_TOL.templatePoints));

/** A shaky hand: every point moved up to `amp` box units, smoothly (a slow wave, not noise). */
const shaky = (pts: Point[], amp: number) => pts.map((p, i) => ({ x: p.x + amp * Math.sin(i / 5), y: p.y + amp * Math.cos(i / 7) }));

const sets = [hhaWriting, jimWriting, khaWriting];

describe("ح ج خ: the body", () => {
  for (const set of sets) {
    for (const form of set.forms) {
      const tpls = form.strokes.map((s) => template(s.d, Boolean(s.dot)));
      const dots = form.strokes.map((s) => Boolean(s.dot));

      it(`${form.glyph}: every stroke stays inside the writing box`, () => {
        for (const tpl of tpls) for (const p of tpl.pts) {
          expect(p.x).toBeGreaterThanOrEqual(0);
          expect(p.x).toBeLessThanOrEqual(WRITING_BOX.W);
          expect(p.y).toBeGreaterThanOrEqual(0);
          expect(p.y).toBeLessThanOrEqual(WRITING_BOX.H);
        }
      });

      it(`${form.glyph}: traced along the guide, with a shaky hand, every stroke counts`, () => {
        tpls.forEach((tpl, i) => {
          const user = dots[i] ? [tpl.pts[0]!] : shaky(tpl.pts, 8);
          expect(evaluateStroke(user, tpls, i, dots).ok, `stroke ${i + 1}`).toBe(true);
          // One stroke at a time stays one stroke: the next one is still asked for.
          expect(evaluateTrace(user, tpls, i, dots)).toMatchObject({ result: { ok: true }, strokes: 1 });
        });
      });

      it(`${form.glyph}: head and curve in one line count as both strokes`, () => {
        const oneLine = shaky([...tpls[0]!.pts, ...tpls[1]!.pts.slice(1)], 6);
        const { result, strokes } = evaluateTrace(oneLine, tpls, 0, dots);
        expect(result.ok).toBe(true);
        expect(strokes).toBe(2);
      });

      it(`${form.glyph}: the head drawn backwards is still a mistake`, () => {
        const backwards = [...tpls[0]!.pts].reverse();
        const result = evaluateStroke(backwards, tpls, 0, dots);
        expect(result.ok).toBe(false);
        expect(evaluateJoined(backwards, tpls, 0, dots)?.ok).toBe(false);
      });
    }
  }

  it("the head and the curve meet, so they can be drawn in one line", () => {
    for (const form of hhaWriting.forms) {
      const [head, curve] = form.strokes.map((s) => pathPoints(s.d));
      const end = head!.at(-1)!;
      const start = curve![0]!;
      expect(Math.hypot(end.x - start.x, end.y - start.y)).toBeLessThanOrEqual(TRACE_TOL.joinGap);
    }
  });

  it("a dot is never joined to a line", () => {
    const form = jimWriting.forms[0]!;
    const tpls = form.strokes.map((s) => template(s.d, Boolean(s.dot)));
    expect(evaluateJoined(tpls[1]!.pts, tpls, 1, form.strokes.map((s) => Boolean(s.dot)))).toBeNull();
  });

  it("ج has its dot under the body, خ above it", () => {
    for (const form of jimWriting.forms) expect(dotCentre(form.strokes[2]!.d).y).toBeGreaterThan(250);
    for (const form of khaWriting.forms) expect(dotCentre(form.strokes[2]!.d).y).toBeLessThan(170);
  });
});
