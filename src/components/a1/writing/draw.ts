import type { WritingForm } from "@/data/types";
import { arrowPoints, DEMO_GAP_MS, strokeMs, WRITING_BOX, type Point, type StrokeTemplate } from "@/lib/writing/trace";

// Canvas drawing for the handwriting page – the prototype's primitives
// (poly, baseline, arrowFor, startDot, drawDemo) with the same geometry, in
// the app's colours (read from the design tokens, see readPalette).

export type Palette = {
  paper: string;
  ink: string;
  ghost: string;
  rule: string;
  ok: string;
  star: string;
  muted: string;
  bad: string;
  onOk: string;
};

/** Arabic numerals for stroke numbers. */
export const AR_NUM = ["١", "٢", "٣", "٤"];
const FONT = '"Noto Naskh Arabic", "Geeza Pro", serif';

/** The app's design tokens ("174 64% 27%") as canvas colours. */
export function readPalette(): Palette {
  const cs = getComputedStyle(document.documentElement);
  const token = (name: string, alpha = 1) => {
    const [h = "0", s = "0%", l = "0%"] = cs.getPropertyValue(`--${name}`).trim().split(/\s+/);
    return `hsla(${h}, ${s}, ${l}, ${alpha})`;
  };
  return {
    paper: token("card"),
    ink: token("primary"),
    ghost: token("muted-foreground", 0.32),
    rule: token("foreground", 0.75),
    ok: token("success"),
    star: token("accent"),
    muted: token("muted-foreground"),
    bad: token("destructive"),
    onOk: token("success-foreground"),
  };
}

export function poly(ctx: CanvasRenderingContext2D, pts: readonly Point[], upto: number, color: string, width: number, alpha = 1, dash: number[] | null = null) {
  if (upto < 2) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (dash) ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  for (let i = 1; i < Math.min(upto, pts.length); i++) ctx.lineTo(pts[i]!.x, pts[i]!.y);
  ctx.stroke();
  ctx.restore();
}

export function baseline(ctx: CanvasRenderingContext2D, c: Palette) {
  ctx.save();
  ctx.strokeStyle = c.rule;
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, WRITING_BOX.BASE + 4);
  ctx.lineTo(WRITING_BOX.W, WRITING_BOX.BASE + 4);
  ctx.stroke();
  ctx.restore();
}

export function arrowFor(ctx: CanvasRenderingContext2D, form: WritingForm, tpls: readonly StrokeTemplate[], i: number, color: string, alpha: number, withNum: boolean) {
  const pts = arrowPoints(tpls[i]!.pts, form.strokes[i]!.arrow);
  if (pts.length === 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(pts[0]!.x, pts[0]!.y);
  pts.forEach((p) => ctx.lineTo(p.x, p.y));
  ctx.stroke();
  const b = pts[pts.length - 1]!;
  const a = pts[Math.max(0, pts.length - 4)]!;
  const ang = Math.atan2(b.y - a.y, b.x - a.x);
  ctx.beginPath();
  ctx.moveTo(b.x + Math.cos(ang) * 5, b.y + Math.sin(ang) * 5);
  ctx.lineTo(b.x + Math.cos(ang + 2.5) * 12, b.y + Math.sin(ang + 2.5) * 12);
  ctx.lineTo(b.x + Math.cos(ang - 2.5) * 12, b.y + Math.sin(ang - 2.5) * 12);
  ctx.closePath();
  ctx.fill();
  if (withNum) {
    const s = pts[0]!;
    const q = pts[Math.min(3, pts.length - 1)]!;
    const back = Math.atan2(s.y - q.y, s.x - q.x);
    ctx.font = `700 20px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(AR_NUM[i]!, s.x + Math.cos(back) * 14, s.y + Math.sin(back) * 14);
  }
  ctx.restore();
}

export function startDot(ctx: CanvasRenderingContext2D, c: Palette, p: Point, i: number, now: number, reduceMotion: boolean) {
  const r = 15 + (reduceMotion ? 0 : Math.sin(now / 260) * 2.5);
  ctx.save();
  ctx.fillStyle = c.ok;
  ctx.beginPath();
  ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = c.onOk;
  ctx.font = `700 18px ${FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(AR_NUM[i]!, p.x, p.y + 1);
  ctx.restore();
}

/** Pen width of stroke i (thin strokes such as the Hamza: 62 %). */
export const strokeWidth = (form: WritingForm, i: number, w: number) => (form.strokes[i]?.thin ? w * 0.62 : w);

/** The writing demonstration at time t (ms since start). */
export function drawDemo(ctx: CanvasRenderingContext2D, c: Palette, form: WritingForm, tpls: readonly StrokeTemplate[], t: number, width: number, now: number, reduceMotion: boolean) {
  tpls.forEach((tpl, i) => poly(ctx, tpl.pts, tpl.pts.length, c.ghost, strokeWidth(form, i, width + 10), 0.55));
  let t0 = 0;
  tpls.forEach((tpl, i) => {
    const dur = strokeMs(tpl.len);
    const loc = Math.max(0, Math.min(1, (t - t0) / dur));
    const e = loc < 0.5 ? 2 * loc * loc : 1 - Math.pow(-2 * loc + 2, 2) / 2;
    const upto = Math.max(1, Math.round(e * (tpl.pts.length - 1)) + 1);
    if (loc > 0) poly(ctx, tpl.pts, upto, c.ink, strokeWidth(form, i, width));
    if (loc < 1 && (t >= t0 || i === 0)) {
      arrowFor(ctx, form, tpls, i, c.muted, 0.9, false);
      startDot(ctx, c, tpl.pts[0]!, i, now, reduceMotion);
    }
    if (loc > 0 && loc < 1) {
      const h = tpl.pts[upto - 1]!;
      ctx.save();
      ctx.fillStyle = c.star;
      ctx.beginPath();
      ctx.arc(h.x, h.y, width * 0.75, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    t0 += dur + DEMO_GAP_MS;
  });
}
