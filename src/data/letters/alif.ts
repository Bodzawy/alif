import type { WritingLetterSet } from "@/data/types";

// Alif – the four forms of workbook exercise "تدريب (١)" (Lesson1.pdf),
// in the worksheet's order (right to left). Ported unchanged from the
// prototype docs/reference/alif-uebung1.html.
//
// The stroke shapes were drawn after a screenshot of the workbook: they are
// approximations that the teacher still has to confirm.
// Two-stroke forms: the Alif body is stroke 1, the Hamza stroke 2.

export const alifWriting: WritingLetterSet = {
  id: "alif",
  forms: [
    {
      id: "alif",
      glyph: "ا",
      name: "das Alif",
      strokes: [{ d: "M121 92 C120 150 118 210 117 262", arrow: { a: 0.08, b: 0.55, off: -30 } }],
    },
    {
      id: "alif-end",
      glyph: "ـا",
      name: "das Alif am Wortende",
      strokes: [{ d: "M200 262 L114 262 Q98 262 98 246 C98 190 99 140 100 92", arrow: { a: 0.06, b: 0.62, off: 26 } }],
    },
    {
      id: "alif-hamza",
      glyph: "أ",
      name: "das Alif mit Hamza",
      strokes: [
        { d: "M121 122 C120 172 118 218 117 262", arrow: { a: 0.08, b: 0.55, off: -30 } },
        { d: "M140 46 C128 30 104 36 108 54 C111 66 128 68 150 59 L104 100", arrow: { a: 0.0, b: 0.38, off: 20 }, thin: true },
      ],
    },
    {
      id: "alif-hamza-end",
      glyph: "ـأ",
      name: "das Alif mit Hamza am Wortende",
      strokes: [
        { d: "M200 262 L114 262 Q98 262 98 246 C98 200 99 160 100 122", arrow: { a: 0.06, b: 0.62, off: 26 } },
        { d: "M119 46 C107 30 83 36 87 54 C90 66 107 68 129 59 L83 100", arrow: { a: 0.0, b: 0.38, off: 20 }, thin: true },
      ],
    },
  ],
};
