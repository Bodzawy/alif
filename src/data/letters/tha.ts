import type { WritingLetterSet } from "@/data/types";

import { BA_BODY } from "./ba";
import { dotStroke } from "./dots";

// Tha – the four forms of "تدريب (١)" (Lesson1.pdf, page 8), in book order
// (right to left): ثـ ، ـثـ ، ـث ، ث. The body is the Ba body; then the three
// dots above: the top dot first, then the two lower dots from right to left.
// Approximations: the teacher still has to confirm them (?debug=1).

const dots = (x: number, y: number) => [
  dotStroke("den Punkt ganz oben", x, y),
  dotStroke("den rechten Punkt darunter", x + 16, y + 32),
  dotStroke("den linken Punkt darunter", x - 16, y + 32),
];

export const thaWriting: WritingLetterSet = {
  id: "tha",
  orderHint: "Zuerst das Tha, dann die Punkte.",
  forms: [
    { id: "tha-start", glyph: "ثـ", name: "das Tha am Wortanfang", strokes: [BA_BODY.start, ...dots(140, 150)] },
    { id: "tha-middle", glyph: "ـثـ", name: "das Tha in der Wortmitte", strokes: [BA_BODY.middle, ...dots(130, 150)] },
    { id: "tha-end", glyph: "ـث", name: "das Tha am Wortende", strokes: [BA_BODY.end, ...dots(128, 196)] },
    { id: "tha", glyph: "ث", name: "das Tha allein", strokes: [BA_BODY.separate, ...dots(120, 194)] },
  ],
};
