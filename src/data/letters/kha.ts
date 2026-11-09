import type { WritingLetterSet } from "@/data/types";

import { dotStroke } from "./dots";
import { HAA_BODY } from "./hha";

// Cha – the four forms of "تدريب (١)" (Lesson1.pdf, page 17), in book order
// (right to left): خـ ، ـخـ ، ـخ ، خ. The body as for ح (1 the top part,
// 2 the curve down), then the dot above.
// The dot sits where the lesson font (Noto Naskh Arabic) puts it: over the head.

const above = (x: number, y: number) => dotStroke("den Punkt oben", x, y);

export const khaWriting: WritingLetterSet = {
  id: "kha",
  orderHint: "Zuerst den Strich oben, dann den Bogen, dann den Punkt.",
  forms: [
    { id: "kha-start", glyph: "خـ", name: "das Cha am Wortanfang", strokes: [...HAA_BODY.start, above(137, 162)] },
    { id: "kha-middle", glyph: "ـخـ", name: "das Cha in der Wortmitte", strokes: [...HAA_BODY.middle, above(106, 162)] },
    { id: "kha-end", glyph: "ـخ", name: "das Cha am Wortende", strokes: [...HAA_BODY.end, above(93, 163)] },
    { id: "kha", glyph: "خ", name: "das Cha allein", strokes: [...HAA_BODY.separate, above(124, 157)] },
  ],
};
