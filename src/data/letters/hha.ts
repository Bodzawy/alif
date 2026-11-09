import type { WritingLetterSet } from "@/data/types";

// Ha (ح) – the four forms of "تدريب (١)" (Lesson1.pdf, page 14), in book order
// (right to left): حـ ، ـحـ ، ـح ، ح. Two strokes: 1 the head (the slanted
// top part), 2 the curve down – for حـ and ـحـ back along the line, for ـح
// and ح round into the bowl. The joining strokes of ـحـ and ـح come in from
// the right edge and run straight into the head.
// The shapes follow the glyphs of the lesson font (Noto Naskh Arabic) laid
// over the 240 × 320 box (baseline 262): the head starts at its small hook
// on the left and runs down to the right, as it is written in Naskh. The
// earlier approximations looked like a bent line, not like حـ / جـ, and their
// head was so short that the scaled tolerances left almost no room
// (review 11/2026: "initial Jim always wrong").
// A child who draws head and curve in ONE line is accepted as well
// (src/lib/writing/trace.ts, evaluateJoined).

/** The body of each form, in writing order; ج and خ have the same body with a dot. */
export const HAA_BODY = {
  start: [
    { d: "M94 215 C92 199 108 193 122 197 C150 205 178 221 202 231", arrow: { a: 0.1, b: 0.8, off: -20 } },
    { d: "M202 231 C176 239 148 251 122 259 C98 265 60 264 26 264", arrow: { a: 0.08, b: 0.6, off: -22 }, label: "den Bogen" },
  ],
  middle: [
    { d: "M214 262 L192 262 C170 260 154 251 140 241 C116 227 84 221 62 215 C56 207 60 195 74 195 C110 197 148 213 174 229", arrow: { a: 0.04, b: 0.4, off: 24 } },
    { d: "M174 229 C150 235 122 243 98 251 C76 259 44 262 10 262", arrow: { a: 0.08, b: 0.6, off: -22 }, label: "den Bogen" },
  ],
  end: [
    { d: "M214 262 L170 262 C150 259 132 245 118 233 C96 221 60 213 40 211 C34 203 40 193 50 193 C90 195 126 207 150 219", arrow: { a: 0.04, b: 0.4, off: 24 } },
    { d: "M150 219 C118 221 86 233 64 255 C44 277 50 307 72 317 C94 320 124 320 146 313", arrow: { a: 0.08, b: 0.6, off: 24 }, label: "den Bogen" },
  ],
  separate: [
    { d: "M70 209 C66 197 74 189 86 191 C116 193 150 199 180 205", arrow: { a: 0.1, b: 0.8, off: -20 } },
    { d: "M180 205 C150 211 116 221 96 239 C76 259 76 293 94 309 C112 320 150 319 186 311", arrow: { a: 0.08, b: 0.6, off: 24 }, label: "den Bogen" },
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
