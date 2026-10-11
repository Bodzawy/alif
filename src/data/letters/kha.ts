import type { WritingLetterSet } from "@/data/types";

import { dotStroke } from "./dots";
import { HAA_BODY } from "./hha";

// Cha – the four forms of "تدريب (١)" (Lesson1.pdf, page 17), in book order
// (right to left): خـ ، ـخـ ، ـخ ، خ. The body as for ح (1 the top part,
// 2 the curve down), then the dot above.
// Approximations: the teacher still has to confirm them (?debug=1).

const above = (x: number, y: number) => dotStroke("den Punkt oben", x, y);

export const khaWriting: WritingLetterSet = {
  id: "kha",
  orderHint: "Zuerst den Strich oben, dann den Bogen, dann den Punkt.",
  forms: [
    { id: "kha-start", glyph: "خـ", name: "das Cha am Wortanfang", strokes: [...HAA_BODY.start, above(140, 156)] },
    { id: "kha-middle", glyph: "ـخـ", name: "das Cha in der Wortmitte", strokes: [...HAA_BODY.middle, above(144, 160)] },
    { id: "kha-end", glyph: "ـخ", name: "das Cha am Wortende", strokes: [...HAA_BODY.end, above(156, 160)] },
    { id: "kha", glyph: "خ", name: "das Cha allein", strokes: [...HAA_BODY.separate, above(136, 152)] },
  ],
};
