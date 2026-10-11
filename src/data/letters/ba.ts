import type { WritingLetterSet } from "@/data/types";

import { dotStroke } from "./dots";

// Ba – the four forms of workbook exercise "تدريب (١)" (Lesson1.pdf, page 4),
// in book order (right to left): بـ ، ـبـ ، ـب ، ب. Each form: the body first,
// written from the top right, then the dot below (a tap).
//
// The paths were drawn by hand in the 240 × 320 box (baseline 262): they are
// approximations that the teacher still has to confirm (?debug=1 shows the
// sampled points). The joining strokes of ـبـ and ـب come in from the right
// edge, like the Alif end forms.

/** The body of each form; ت and ث have the same bodies with other dots. */
export const BA_BODY = {
  start: { d: "M150 208 C152 234 150 252 138 259 C130 263 118 262 104 262 L30 262", arrow: { a: 0.06, b: 0.6, off: 24 } },
  middle: { d: "M214 262 L140 262 C133 262 130 257 130 248 L130 206 L128 248 C128 258 124 262 114 262 L26 262", arrow: { a: 0.04, b: 0.3, off: 24 } },
  end: { d: "M214 262 L192 262 C160 266 94 268 66 262 C50 258 42 246 44 220", arrow: { a: 0.12, b: 0.62, off: 24 } },
  separate: { d: "M196 208 C198 236 196 254 182 260 C160 268 86 268 60 262 C46 258 40 246 42 220", arrow: { a: 0.3, b: 0.72, off: 24 } },
};

const below = (x: number, y: number) => dotStroke("den Punkt unten", x, y);

export const baWriting: WritingLetterSet = {
  id: "ba",
  orderHint: "Zuerst das Ba, dann den Punkt.",
  forms: [
    {
      id: "ba-start",
      glyph: "بـ",
      name: "das Ba am Wortanfang",
      strokes: [BA_BODY.start, below(140, 296)],
    },
    {
      id: "ba-middle",
      glyph: "ـبـ",
      name: "das Ba in der Wortmitte",
      strokes: [BA_BODY.middle, below(129, 296)],
    },
    {
      id: "ba-end",
      glyph: "ـب",
      name: "das Ba am Wortende",
      strokes: [BA_BODY.end, below(128, 296)],
    },
    {
      id: "ba",
      glyph: "ب",
      name: "das Ba allein",
      strokes: [BA_BODY.separate, below(120, 296)],
    },
  ],
};
