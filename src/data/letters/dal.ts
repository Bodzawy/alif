import type { WritingLetterSet } from "@/data/types";

// Dal – "تدريب (١) تتبع بالقلم" of "مساء الخير.pdf" (page 24), in book order
// (right to left): د ، ـد. The Dal never joins the next letter, so it has only
// these two shapes. Book numbering: 1 the slanting stroke from the top, 2 the
// base to the left (one stroke here); ـد comes in from the right edge, goes up
// to the tip and back down.
// Drawn by hand in the 240 × 320 box (baseline 262): approximations that the
// teacher still has to confirm (?debug=1 shows the sampled points).

/** The bodies; ذ has the same bodies with a dot. */
export const DAL_BODY = {
  separate: { d: "M140 186 C152 210 166 236 162 252 C158 262 132 262 84 262", arrow: { a: 0.05, b: 0.55, off: 26 } },
  // In from the right, up to the tip, back down along the same stroke and out to the left.
  end: { d: "M214 262 L172 262 C166 246 156 222 144 196 C154 218 164 240 160 254 C156 264 130 262 84 262", arrow: { a: 0.04, b: 0.3, off: 24 } },
};

export const dalWriting: WritingLetterSet = {
  id: "dal",
  forms: [
    { id: "dal", glyph: "د", name: "das Dal allein", strokes: [DAL_BODY.separate] },
    { id: "dal-end", glyph: "ـد", name: "das Dal am Wortende", strokes: [DAL_BODY.end] },
  ],
};
