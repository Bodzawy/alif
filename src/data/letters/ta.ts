import type { WritingLetterSet } from "@/data/types";

import { BA_BODY } from "./ba";
import { dotStroke } from "./dots";

// Ta – the four forms of "تدريب (١)" (Lesson1.pdf, page 6), in book order
// (right to left): تـ ، ـتـ ، ـت ، ت. The body is the Ba body; then the two
// dots above, the right one first (Arabic writing goes from right to left).
// Approximations: the teacher still has to confirm them (?debug=1).

const right = (x: number, y: number) => dotStroke("den rechten Punkt oben", x, y);
const left = (x: number, y: number) => dotStroke("den linken Punkt oben", x, y);

export const taWriting: WritingLetterSet = {
  id: "ta",
  orderHint: "Zuerst das Ta, dann die Punkte.",
  forms: [
    { id: "ta-start", glyph: "تـ", name: "das Ta am Wortanfang", strokes: [BA_BODY.start, right(156, 176), left(124, 176)] },
    { id: "ta-middle", glyph: "ـتـ", name: "das Ta in der Wortmitte", strokes: [BA_BODY.middle, right(146, 176), left(114, 176)] },
    { id: "ta-end", glyph: "ـت", name: "das Ta am Wortende", strokes: [BA_BODY.end, right(144, 228), left(112, 228)] },
    { id: "ta", glyph: "ت", name: "das Ta allein", strokes: [BA_BODY.separate, right(136, 226), left(104, 226)] },
  ],
};
