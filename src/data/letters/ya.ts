import type { WritingLetterSet } from "@/data/types";

import { BA_BODY } from "./ba";
import { dotStroke } from "./dots";

// Ya – "تدريب (١) تتبع بالقلم" of "مساء الخير.pdf" (page 33), in book order
// (right to left): يـ ، ـيـ ، ـي ، ي. Start and middle have the Ba body, the
// end and the separate form the curved Ya body (book: 1 the head, 2 the bowl
// to the left, 3 back up); then the two dots below, right one first.
// Approximations: the teacher still has to confirm them (?debug=1).

const dots = (x: number, y: number) => [dotStroke("den rechten Punkt unten", x + 11, y), dotStroke("den linken Punkt unten", x - 11, y)];

const YA_BOWL = {
  end: { d: "M214 262 L188 262 C176 262 170 248 158 238 C146 230 134 238 142 250 C150 262 184 264 182 284 C180 306 124 312 84 300 C66 294 60 280 66 266", arrow: { a: 0.04, b: 0.34, off: 24 } },
  separate: { d: "M182 204 C160 192 132 204 140 226 C146 244 184 246 182 272 C180 302 124 312 84 300 C66 294 60 280 66 266", arrow: { a: 0.02, b: 0.4, off: 26 } },
};

export const yaWriting: WritingLetterSet = {
  id: "ya",
  orderHint: "Zuerst das Ya, dann die Punkte.",
  forms: [
    { id: "ya-start", glyph: "يـ", name: "das Ya am Wortanfang", strokes: [BA_BODY.start, ...dots(140, 296)] },
    { id: "ya-middle", glyph: "ـيـ", name: "das Ya in der Wortmitte", strokes: [BA_BODY.middle, ...dots(129, 296)] },
    { id: "ya-end", glyph: "ـي", name: "das Ya am Wortende", strokes: [YA_BOWL.end, ...dots(124, 280)] },
    { id: "ya", glyph: "ي", name: "das Ya allein", strokes: [YA_BOWL.separate, ...dots(124, 280)] },
  ],
};
