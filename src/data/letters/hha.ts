import type { WritingLetterSet } from "@/data/types";

// Ha (ح) – the four forms of "تدريب (١)" (Lesson1.pdf, page 14), in book order
// (right to left): حـ ، ـحـ ، ـح ، ح. Two strokes, as the book numbers them
// for ج (same body): 1 the top part from right to left, 2 the curve down.
// The joining strokes of ـحـ and ـح come in from the right edge.
// Approximations: the teacher still has to confirm them (?debug=1).

/** The body of each form, in writing order; ج and خ have the same body with a dot. */
export const HAA_BODY = {
  start: [
    { d: "M176 192 C154 186 128 188 104 200", arrow: { a: 0.1, b: 0.8, off: -20 } },
    { d: "M104 200 C122 224 146 244 150 254 C152 262 140 262 128 262 L30 262", arrow: { a: 0.08, b: 0.5, off: 24 }, label: "den Bogen" },
  ],
  middle: [
    { d: "M214 262 L178 262 C168 248 170 222 180 200 C156 192 130 194 106 206", arrow: { a: 0.04, b: 0.4, off: 24 } },
    { d: "M106 206 C124 228 146 246 150 254 C152 262 140 262 128 262 L26 262", arrow: { a: 0.08, b: 0.5, off: 24 }, label: "den Bogen" },
  ],
  end: [
    { d: "M214 262 L190 262 C182 240 186 214 196 200 C170 192 140 194 112 206", arrow: { a: 0.04, b: 0.4, off: 24 } },
    { d: "M112 206 C74 222 56 252 64 280 C72 306 120 312 176 300", arrow: { a: 0.08, b: 0.6, off: 24 }, label: "den Bogen" },
  ],
  separate: [
    { d: "M172 186 C150 182 124 186 100 198", arrow: { a: 0.1, b: 0.8, off: -20 } },
    { d: "M100 198 C70 214 54 246 62 276 C70 304 120 312 176 300", arrow: { a: 0.08, b: 0.6, off: 24 }, label: "den Bogen" },
  ],
};

export const hhaWriting: WritingLetterSet = {
  id: "hha",
  orderHint: "Zuerst den Strich oben, dann den Bogen.",
  forms: [
    { id: "hha-start", glyph: "حـ", name: "das Ha am Wortanfang", strokes: HAA_BODY.start },
    { id: "hha-middle", glyph: "ـحـ", name: "das Ha in der Wortmitte", strokes: HAA_BODY.middle },
    { id: "hha-end", glyph: "ـح", name: "das Ha am Wortende", strokes: HAA_BODY.end },
    { id: "hha", glyph: "ح", name: "das Ha allein", strokes: HAA_BODY.separate },
  ],
};
