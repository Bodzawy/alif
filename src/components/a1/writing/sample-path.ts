import type { WritingLetterSet } from "@/data/types";
import { toTemplate, TRACE_TOL, type Point, type StrokeTemplate } from "@/lib/writing/trace";

// Browser only: turns the SVG paths of a letter set into evenly spaced
// template points (prototype samplePath, unchanged). Needs the DOM for
// SVGPathElement.getTotalLength, so it runs in an effect, never during SSR.

const SVG_NS = "http://www.w3.org/2000/svg";

export function sampleLetterSet(set: WritingLetterSet, n: number = TRACE_TOL.templatePoints): StrokeTemplate[][] {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.setAttribute("aria-hidden", "true");
  svg.style.position = "absolute";
  document.body.appendChild(svg);
  try {
    return set.forms.map((form) =>
      form.strokes.map((stroke) => {
        const path = document.createElementNS(SVG_NS, "path");
        path.setAttribute("d", stroke.d);
        svg.appendChild(path);
        const L = path.getTotalLength();
        const out: Point[] = [];
        for (let i = 0; i < n; i++) {
          const q = path.getPointAtLength((L * i) / (n - 1));
          out.push({ x: q.x, y: q.y });
        }
        path.remove();
        return toTemplate(out);
      })
    );
  } finally {
    svg.remove();
  }
}
