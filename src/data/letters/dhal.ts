import type { WritingLetterSet } from "@/data/types";

import { DAL_BODY } from "./dal";
import { dotStroke } from "./dots";

// Dhal – "تدريب (١) تتبع بالقلم" of "مساء الخير.pdf" (page 27), in book order
// (right to left): ذ ، ـذ. The Dal body, then the dot above (a tap).
// Approximations: the teacher still has to confirm them (?debug=1).

const above = (x: number, y: number) => dotStroke("den Punkt oben", x, y);

export const dhalWriting: WritingLetterSet = {
  id: "dhal",
  orderHint: "Zuerst das Dhal, dann den Punkt.",
  forms: [
    { id: "dhal", glyph: "ذ", name: "das Dhal allein", strokes: [DAL_BODY.separate, above(138, 150)] },
    { id: "dhal-end", glyph: "ـذ", name: "das Dhal am Wortende", strokes: [DAL_BODY.end, above(140, 154)] },
  ],
};
