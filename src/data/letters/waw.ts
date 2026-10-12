import type { WritingLetterSet } from "@/data/types";

// Waw – "تدريب (١) تتبع بالقلم" of "مساء الخير.pdf" (page 30), in book order
// (right to left): و ، ـو. One stroke: the head (a small loop, written
// anticlockwise as the book's arrow shows), then the tail down to the left
// below the line; ـو comes in from the right edge first. The Waw never joins
// the next letter. Approximations: the teacher still has to confirm them.

export const wawWriting: WritingLetterSet = {
  id: "waw",
  forms: [
    {
      id: "waw",
      glyph: "و",
      name: "das Waw allein",
      strokes: [{ d: "M164 232 C170 206 150 190 132 202 C116 214 124 240 148 242 C170 246 170 274 152 292 C136 306 108 312 80 306", arrow: { a: 0.02, b: 0.4, off: 26 } }],
    },
    {
      id: "waw-end",
      glyph: "ـو",
      name: "das Waw am Wortende",
      strokes: [{ d: "M214 262 L170 262 C176 238 160 218 140 224 C122 230 124 256 148 260 C168 266 166 288 150 300 C134 312 106 314 80 306", arrow: { a: 0.04, b: 0.32, off: 24 } }],
    },
  ],
};
