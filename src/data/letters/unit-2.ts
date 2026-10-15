import type { WritingForm, WritingLetterSet, WritingStroke } from "@/data/types";

import { BA_BODY } from "./ba";
import { dotStroke } from "./dots";

// The letters of Unit 2 ("وجدي.pdf") – "تدريب (١) تتبع بالقلم" of every letter,
// in book order (right to left). Letters with the same body share it and differ
// only in their dots (ر ز · س ش · ص ض); the body first, then the dots (taps).
// Drawn by hand in the 240 × 320 box (baseline 262): approximations that the
// teacher still has to confirm (?debug=1 shows the sampled points). Joining
// strokes of middle and end forms come in from the right edge. Book order of
// the forms (right to left): alone, start, middle, end.

const A = (a: number, b: number, off = 24) => ({ a, b, off });
const body = (d: string, arrow = A(0.05, 0.5)): WritingStroke => ({ d, arrow });
/** Written start, middle, end, alone – shown in the book's order: alone, start, middle, end. */
const bookOrder = (forms: WritingForm[]) => [forms[3]!, forms[0]!, forms[1]!, forms[2]!];
const form = (id: string, glyph: string, name: string, strokes: WritingStroke[]): WritingForm => ({ id, glyph, name, strokes });

// ---------------------------------------------------------------- ر ز (no Hand: two forms)
const RA = {
  separate: body("M150 226 C158 252 152 286 124 304 C106 314 86 314 70 306", A(0.05, 0.55)),
  end: body("M214 262 L162 262 C160 290 140 306 112 312 C94 315 80 312 70 306", A(0.04, 0.4)),
};
export const raWriting: WritingLetterSet = { id: "ra", forms: [form("ra", "ر", "das Ra allein", [RA.separate]), form("ra-end", "ـر", "das Ra am Wortende", [RA.end])] };
export const zayWriting: WritingLetterSet = {
  id: "zay",
  orderHint: "Zuerst das Zay, dann den Punkt.",
  forms: [form("zay", "ز", "das Zay allein", [RA.separate, dotStroke("den Punkt oben", 150, 196)]), form("zay-end", "ـز", "das Zay am Wortende", [RA.end, dotStroke("den Punkt oben", 162, 226)])],
};

// ---------------------------------------------------------------- س ش (three teeth)
const SIN = {
  start: body("M206 232 C206 254 202 262 190 262 C180 262 176 252 176 238 C176 254 172 262 160 262 C150 262 146 252 146 238 C146 254 142 262 128 262 L30 262", A(0.03, 0.4)),
  middle: body("M214 262 L196 262 C186 262 184 252 184 238 C184 254 180 262 168 262 C158 262 154 252 154 238 C154 254 150 262 138 262 C128 262 124 252 124 238 C124 254 120 262 108 262 L26 262", A(0.02, 0.3)),
  end: body("M214 262 L196 262 C186 262 184 252 184 238 C184 254 180 262 168 262 C158 262 154 252 154 238 L154 262 C154 300 124 316 94 308 C72 302 62 286 64 264", A(0.02, 0.3)),
  separate: body("M206 232 C206 254 202 262 190 262 C180 262 176 252 176 238 C176 254 172 262 160 262 C150 262 146 252 146 238 L146 262 C146 300 116 316 86 308 C64 302 54 286 56 264", A(0.03, 0.35)),
};
const sinForms = (id: string, name: string, extra: (x: number) => WritingStroke[]) => bookOrder([
  form(`${id}-start`, id === "sin" ? "سـ" : "شـ", `das ${name} am Wortanfang`, [SIN.start, ...extra(176)]),
  form(`${id}-middle`, id === "sin" ? "ـسـ" : "ـشـ", `das ${name} in der Wortmitte`, [SIN.middle, ...extra(154)]),
  form(`${id}-end`, id === "sin" ? "ـس" : "ـش", `das ${name} am Wortende`, [SIN.end, ...extra(168)]),
  form(id, id === "sin" ? "س" : "ش", `das ${name} allein`, [SIN.separate, ...extra(176)]),
]);
const threeDots = (x: number) => [dotStroke("den Punkt ganz oben", x, 190), dotStroke("den rechten Punkt darunter", x + 14, 216), dotStroke("den linken Punkt darunter", x - 14, 216)];
export const sinWriting: WritingLetterSet = { id: "sin", forms: sinForms("sin", "Sin", () => []) };
export const shinWriting: WritingLetterSet = { id: "shin", orderHint: "Zuerst das Schin, dann die Punkte.", forms: sinForms("shin", "Schin", threeDots) };

// ---------------------------------------------------------------- ص ض (loop and tooth)
const SAD = {
  start: body("M110 258 C126 224 196 212 204 238 C210 262 150 262 110 262 C104 262 102 256 102 244 C102 256 96 262 84 262 L30 262", A(0.03, 0.45)),
  middle: body("M214 262 L134 262 C148 226 200 216 206 240 C210 262 160 262 130 262 C124 262 122 256 122 244 C122 256 116 262 104 262 L26 262", A(0.02, 0.25)),
  end: body("M214 262 L126 262 C140 226 196 216 202 240 C208 262 156 262 126 262 C120 262 118 256 118 244 L118 262 C118 298 92 314 66 306 C48 300 42 284 46 266", A(0.02, 0.25)),
  separate: body("M118 258 C134 224 198 212 206 238 C212 262 156 262 118 262 C112 262 110 256 110 244 L110 262 C110 298 84 314 58 306 C40 300 34 284 38 266", A(0.03, 0.45)),
};
const sadForms = (id: "sad" | "dad", name: string, dot: (x: number) => WritingStroke[]) => {
  const g = id === "sad" ? "ص" : "ض";
  return bookOrder([
    form(`${id}-start`, `${g}ـ`, `das ${name} am Wortanfang`, [SAD.start, ...dot(156)]),
    form(`${id}-middle`, `ـ${g}ـ`, `das ${name} in der Wortmitte`, [SAD.middle, ...dot(170)]),
    form(`${id}-end`, `ـ${g}`, `das ${name} am Wortende`, [SAD.end, ...dot(164)]),
    form(id, g, `das ${name} allein`, [SAD.separate, ...dot(162)]),
  ]);
};
export const sadWriting: WritingLetterSet = { id: "sad", forms: sadForms("sad", "Sad", () => []) };
export const dadWriting: WritingLetterSet = { id: "dad", orderHint: "Zuerst das Dad, dann den Punkt.", forms: sadForms("dad", "Dad", (x) => [dotStroke("den Punkt oben", x, 196)]) };

// ---------------------------------------------------------------- ف ق (round head)
const head = (x: number) => `M${x} 250 C${x - 4} 226 ${x - 34} 222 ${x - 36} 244 C${x - 38} 262 ${x - 8} 266 ${x} 250`;
export const faWriting: WritingLetterSet = {
  id: "fa",
  orderHint: "Zuerst das Fa, dann den Punkt.",
  forms: bookOrder([
    form("fa-start", "فـ", "das Fa am Wortanfang", [body(`${head(170)} L170 262 L30 262`, A(0.03, 0.4)), dotStroke("den Punkt oben", 152, 200)]),
    form("fa-middle", "ـفـ", "das Fa in der Wortmitte", [body(`M214 262 L178 262 C178 236 146 222 138 244 C132 262 166 266 172 254 L174 262 L26 262`, A(0.03, 0.3)), dotStroke("den Punkt oben", 156, 200)]),
    form("fa-end", "ـف", "das Fa am Wortende", [body(`M214 262 L178 262 C178 236 146 222 138 244 C132 262 166 266 172 254 L174 262 L70 262 C52 262 44 250 46 232`, A(0.03, 0.3)), dotStroke("den Punkt oben", 156, 200)]),
    form("fa", "ف", "das Fa allein", [body(`${head(196)} L196 262 L80 262 C60 262 50 250 52 230`, A(0.03, 0.35)), dotStroke("den Punkt oben", 178, 200)]),
  ]),
};
const twoDots = (x: number, y: number) => [dotStroke("den rechten Punkt oben", x + 10, y), dotStroke("den linken Punkt oben", x - 10, y)];
export const qafWriting: WritingLetterSet = {
  id: "qaf",
  orderHint: "Zuerst das Qaf, dann die Punkte.",
  forms: bookOrder([
    form("qaf-start", "قـ", "das Qaf am Wortanfang", [body(`${head(170)} L170 262 L30 262`, A(0.03, 0.4)), ...twoDots(152, 200)]),
    form("qaf-middle", "ـقـ", "das Qaf in der Wortmitte", [body(`M214 262 L178 262 C178 236 146 222 138 244 C132 262 166 266 172 254 L174 262 L26 262`, A(0.03, 0.3)), ...twoDots(156, 200)]),
    form("qaf-end", "ـق", "das Qaf am Wortende", [body(`M214 262 L178 262 C178 236 146 222 138 244 C132 262 166 266 172 254 L174 262 C176 300 140 318 108 308 C88 300 82 284 86 266`, A(0.03, 0.3)), ...twoDots(156, 200)]),
    form("qaf", "ق", "das Qaf allein", [body(`${head(170)} L170 262 C172 302 136 318 104 308 C84 300 78 284 82 266`, A(0.03, 0.35)), ...twoDots(152, 200)]),
  ]),
};

// ---------------------------------------------------------------- ك
export const kafWriting: WritingLetterSet = {
  id: "kaf",
  orderHint: "Zuerst das Kaf, dann das kleine Zeichen.",
  forms: bookOrder([
    form("kaf-start", "كـ", "das Kaf am Wortanfang", [body("M190 150 L110 214 C150 230 166 244 166 254 C166 262 156 262 140 262 L30 262", A(0.03, 0.4)), { d: "M146 200 C138 190 152 182 156 192 L132 204", arrow: A(0, 0.4, 16), thin: true, label: "das kleine Zeichen" }]),
    form("kaf-middle", "ـكـ", "das Kaf in der Wortmitte", [body("M214 262 L176 262 C186 254 182 240 150 226 L200 156 L130 214", A(0.03, 0.25)), { d: "M162 210 C154 200 168 192 172 202 L148 214", arrow: A(0, 0.4, 16), thin: true, label: "das kleine Zeichen" }]),
    form("kaf-end", "ـك", "das Kaf am Wortende", [body("M214 262 L190 262 L190 140 L190 262 L70 262 C54 262 46 250 48 234", A(0.03, 0.3)), { d: "M136 230 C130 220 144 214 148 224 L126 236", arrow: A(0, 0.4, 16), thin: true, label: "das kleine Zeichen" }]),
    form("kaf", "ك", "das Kaf allein", [body("M180 140 L180 262 L70 262 C54 262 46 250 48 234", A(0.03, 0.35)), { d: "M130 228 C124 218 138 212 142 222 L120 234", arrow: A(0, 0.4, 16), thin: true, label: "das kleine Zeichen" }]),
  ]),
};

// ---------------------------------------------------------------- ل
export const lamWriting: WritingLetterSet = {
  id: "lam",
  forms: bookOrder([
    form("lam-start", "لـ", "das Lam am Wortanfang", [body("M140 120 L140 248 C140 258 134 262 124 262 L30 262", A(0.04, 0.45))]),
    form("lam-middle", "ـلـ", "das Lam in der Wortmitte", [body("M214 262 L162 262 C154 262 150 256 150 248 L150 120 L150 248 C150 258 144 262 134 262 L26 262", A(0.02, 0.2))]),
    form("lam-end", "ـل", "das Lam am Wortende", [body("M214 262 L176 262 C168 262 164 256 164 248 L164 120 L164 266 C164 302 134 316 104 308 C84 302 76 286 80 268", A(0.02, 0.2))]),
    form("lam", "ل", "das Lam allein", [body("M160 120 L160 266 C160 302 130 316 100 308 C80 302 72 286 76 268", A(0.04, 0.5))]),
  ]),
};

// ---------------------------------------------------------------- م
export const mimWriting: WritingLetterSet = {
  id: "mim",
  forms: bookOrder([
    form("mim-start", "مـ", "das Mim am Wortanfang", [body("M140 250 C140 228 110 226 108 248 C106 266 140 266 140 250 L140 262 L30 262", A(0.03, 0.45))]),
    form("mim-middle", "ـمـ", "das Mim in der Wortmitte", [body("M214 262 L150 262 C150 236 120 230 118 250 C116 266 150 266 150 254 L150 262 L26 262", A(0.03, 0.3))]),
    form("mim-end", "ـم", "das Mim am Wortende", [body("M214 262 L150 262 C150 236 120 230 118 250 C116 266 150 266 150 254 L120 262 C112 264 110 280 112 316", A(0.03, 0.3))]),
    form("mim", "م", "das Mim allein", [body("M150 250 C150 228 120 228 118 248 C116 266 150 266 150 252 L122 262 C114 264 112 280 114 316", A(0.03, 0.45))]),
  ]),
};

// ---------------------------------------------------------------- ن (the Ba body at the start and in the middle, a deep bowl at the end)
const NUN_BOWL = {
  end: body("M214 262 L170 262 C168 300 140 316 110 310 C86 304 76 286 78 262", A(0.04, 0.4)),
  separate: body("M170 228 C176 262 170 300 138 312 C110 320 82 304 80 262", A(0.04, 0.5)),
};
export const nunWriting: WritingLetterSet = {
  id: "nun",
  orderHint: "Zuerst das Nun, dann den Punkt.",
  forms: bookOrder([
    form("nun-start", "نـ", "das Nun am Wortanfang", [BA_BODY.start, dotStroke("den Punkt oben", 142, 196)]),
    form("nun-middle", "ـنـ", "das Nun in der Wortmitte", [BA_BODY.middle, dotStroke("den Punkt oben", 129, 196)]),
    form("nun-end", "ـن", "das Nun am Wortende", [NUN_BOWL.end, dotStroke("den Punkt oben", 124, 230)]),
    form("nun", "ن", "das Nun allein", [NUN_BOWL.separate, dotStroke("den Punkt oben", 126, 230)]),
  ]),
};
