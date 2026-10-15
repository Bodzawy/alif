import type { WritingForm, WritingLetterSet, WritingStroke } from "@/data/types";

import { dotStroke } from "./dots";

// The letters of Unit 3 of the book (book pages 92–106) – "تدريب (١) تتبع
// بالقلم" of ه ط ظ ع غ. Letters with the same body share it and differ only in
// their dot (ط ظ · ع غ); the body first, then the dot (a tap). Drawn by hand
// in the 240 × 320 box (baseline 262): approximations that the teacher still
// has to confirm (?debug=1 shows the sampled points). Joining strokes of
// middle and end forms come in from the right edge.

const A = (a: number, b: number, off = 24) => ({ a, b, off });
const body = (d: string, arrow = A(0.05, 0.5), label?: string): WritingStroke => ({ d, arrow, ...(label ? { label } : {}) });
const form = (id: string, glyph: string, name: string, strokes: WritingStroke[]): WritingForm => ({ id, glyph, name, strokes });
/** Written start, middle, end, alone – shown in the book's order: alone, start, middle, end. */
const bookOrder = (forms: WritingForm[]) => [forms[3]!, forms[0]!, forms[1]!, forms[2]!];

// ---------------------------------------------------------------- ه (and ة)
// The book (page 93) shows هـ ، ـهـ ، ـه and ه / ة, right to left.
export const haWriting: WritingLetterSet = {
  id: "ha",
  orderHint: "Zuerst das Hā, dann die zwei Punkte.",
  forms: [
    form("ha-start", "هـ", "das Hā am Wortanfang", [body("M152 196 C120 228 104 250 110 260 C118 270 150 262 154 244 C158 228 136 224 126 240 C120 250 124 262 136 262 L30 262", A(0.03, 0.4))]),
    form("ha-middle", "ـهـ", "das Hā in der Wortmitte", [body("M214 262 L152 262 C140 250 146 216 132 208 C120 216 120 250 116 262 C112 286 128 296 136 286 C144 276 132 262 120 262 L26 262", A(0.02, 0.25))]),
    form("ha-end", "ـه", "das Hā am Wortende", [body("M214 262 L156 262 C156 226 116 214 106 240 C98 262 128 268 156 262", A(0.03, 0.4))]),
    form("ha", "ه", "das Hā allein", [body("M150 222 C120 208 92 230 96 252 C100 270 132 268 146 256 C156 246 150 228 136 230 C122 232 120 252 130 262", A(0.03, 0.4))]),
    form("ta-marbuta", "ة", "das Ta marbuta", [
      body("M150 222 C120 208 92 230 96 252 C100 270 132 268 146 256 C156 246 150 228 136 230 C122 232 120 252 130 262", A(0.03, 0.4)),
      dotStroke("den rechten Punkt oben", 134, 196),
      dotStroke("den linken Punkt oben", 112, 196),
    ]),
  ],
};

// ---------------------------------------------------------------- ط ظ (the loop on the line, then the upright stroke)
const UPRIGHT = (x: number): WritingStroke => body(`M${x} 136 L${x} 256`, A(0.1, 0.8, -20), "den senkrechten Strich");
const TA = {
  start: body("M96 262 C100 232 148 222 174 244 C184 256 170 262 148 262 L30 262", A(0.03, 0.4)),
  middle: body("M214 262 L96 262 C100 232 148 222 174 244 C184 256 170 262 148 262 L26 262", A(0.02, 0.25)),
  end: body("M214 262 L58 262 C62 232 108 222 138 236 C158 246 158 260 138 262", A(0.02, 0.3)),
  separate: body("M186 262 L50 262 C56 232 104 216 148 230 C176 240 180 258 160 262", A(0.02, 0.3)),
};
const taForms = (id: "tta" | "zza", glyph: string, name: string, dot: (x: number) => WritingStroke[]) =>
  bookOrder([
    form(`${id}-start`, `${glyph}ـ`, `das ${name} am Wortanfang`, [TA.start, UPRIGHT(114), ...dot(140)]),
    form(`${id}-middle`, `ـ${glyph}ـ`, `das ${name} in der Wortmitte`, [TA.middle, UPRIGHT(114), ...dot(140)]),
    form(`${id}-end`, `ـ${glyph}`, `das ${name} am Wortende`, [TA.end, UPRIGHT(84), ...dot(110)]),
    form(id, glyph, `das ${name} allein`, [TA.separate, UPRIGHT(84), ...dot(112)]),
  ]);
export const ttaWriting: WritingLetterSet = { id: "tta", orderHint: "Zuerst den Bogen auf der Linie, dann den senkrechten Strich.", forms: taForms("tta", "ط", "Ṭa", () => []) };
export const zzaWriting: WritingLetterSet = {
  id: "zza",
  orderHint: "Zuerst den Bogen, dann den senkrechten Strich, dann den Punkt.",
  forms: taForms("zza", "ظ", "Ẓa", (x) => [dotStroke("den Punkt oben", x, 210)]),
};

// ---------------------------------------------------------------- ع غ (the open head, then the tail)
const AIN = {
  start: body("M158 210 C140 194 114 204 116 226 C118 246 140 258 122 262 L30 262", A(0.04, 0.4)),
  middle: body("M214 262 L162 262 C150 232 132 222 120 238 C112 252 134 262 146 262 L26 262", A(0.02, 0.25)),
  end: body("M214 262 L162 262 C150 232 124 226 122 246 C122 262 150 262 140 262 C100 270 84 290 96 306 C108 318 150 316 176 304", A(0.02, 0.25)),
  separate: body("M152 200 C126 186 104 206 120 226 C132 240 150 238 162 236 C114 246 86 272 98 296 C110 318 152 316 178 304", A(0.03, 0.35)),
};
const ainForms = (id: "ain" | "ghain", glyph: string, name: string, dot: (x: number, y: number) => WritingStroke[]) =>
  bookOrder([
    form(`${id}-start`, `${glyph}ـ`, `das ${name} am Wortanfang`, [AIN.start, ...dot(136, 178)]),
    form(`${id}-middle`, `ـ${glyph}ـ`, `das ${name} in der Wortmitte`, [AIN.middle, ...dot(136, 206)]),
    form(`${id}-end`, `ـ${glyph}`, `das ${name} am Wortende`, [AIN.end, ...dot(136, 206)]),
    form(id, glyph, `das ${name} allein`, [AIN.separate, ...dot(132, 168)]),
  ]);
export const ainWriting: WritingLetterSet = { id: "ain", forms: ainForms("ain", "ع", "ʿAin", () => []) };
export const ghainWriting: WritingLetterSet = {
  id: "ghain",
  orderHint: "Zuerst das Ghain, dann den Punkt.",
  forms: ainForms("ghain", "غ", "Ghain", (x, y) => [dotStroke("den Punkt oben", x, y)]),
};
