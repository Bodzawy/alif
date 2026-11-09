import type { WritingLetterSet } from "@/data/types";

import { dotStroke } from "./dots";
import { HAA_BODY } from "./hha";

// Dschim – the four forms of "تدريب (١)" (Lesson1.pdf, page 11), in book order
// (right to left): جـ ، ـجـ ، ـج ، ج. Three strokes, as numbered in the book:
// 1 the top part from right to left, 2 the curve down, 3 the dot.
// The dots sit where the lesson font (Noto Naskh Arabic) puts them: under the
// head for جـ / ـجـ, inside the bowl for ـج / ج.

const point = (x: number, y: number) => dotStroke("den Punkt", x, y);

export const jimWriting: WritingLetterSet = {
  id: "jim",
  orderHint: "Zuerst den Strich oben, dann den Bogen, dann den Punkt.",
  forms: [
    { id: "jim-start", glyph: "جـ", name: "das Dschim am Wortanfang", strokes: [...HAA_BODY.start, point(150, 293)] },
    { id: "jim-middle", glyph: "ـجـ", name: "das Dschim in der Wortmitte", strokes: [...HAA_BODY.middle, point(119, 294)] },
    { id: "jim-end", glyph: "ـج", name: "das Dschim am Wortende", strokes: [...HAA_BODY.end, point(92, 275)] },
    { id: "jim", glyph: "ج", name: "das Dschim allein", strokes: [...HAA_BODY.separate, point(133, 269)] },
  ],
};
