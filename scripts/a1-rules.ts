// Pronunciation rules for A1 targets that have none yet (the scheme of the
// Unit 2 gates): Azure >= 70 and the word's consonants in IQRA's output.
// Not required: vowels, Hamza, ث / ذ, a long و / ي, a final ك / ت / ه, a final
// ـِيّ, pronoun suffixes (ـهُ، ـهَا، ـهُمْ …, ـكَ، ـكُمْ …) and the ل of the
// article before a sun letter (that letter is then "X|XX"); ر is "r|rr", a
// letter with Shadda "X|XX". Existing rules are never changed; new ones are
// appended to vocabulary_conditions.json / sound_conditions.json and to
// EXPECTED_TOKENS in tests/unit/vocabulary-iqra-gates.test.ts.
// usage (from the repo root): npx tsx scripts/a1-rules.ts [--write]
import { readFileSync, writeFileSync } from "node:fs";
import { a1Entries } from "@/data/a1";
import { VOCABULARY_RULES, SOUND_RULES, LETTER_RULES } from "@/lib/pronunciation/rules";
import { a1Words } from "../tests/support/a1-words";

const ROOT = process.cwd();
const MAP: Record<string, string> = { ب: "b", ت: "t", ج: "j", ح: "H", خ: "x", د: "d", ر: "r", ز: "z", س: "s", ش: "$", ص: "S", ض: "D", ط: "T", ظ: "Z", ع: "E", غ: "g", ف: "f", ق: "q", ك: "k", ل: "l", م: "m", ن: "n", ه: "h", و: "w", ي: "y" };
const VOW = /[َُِ]/;
const SUFFIXES = ["هُمَا", "كُمَا", "هُنَّ", "كُنَّ", "هُمْ", "كُمْ", "هُم", "كُم", "هَا", "هُ", "كَ", "كِ"];
type U = { b: string; m: string };
const units = (w: string): U[] => { const o: U[] = []; for (const c of Array.from(w)) { if (/[ً-ْٰ]/.test(c) && o.length) o[o.length - 1]!.m += c; else o.push({ b: c, m: "" }); } return o; };

export function tokensOf(model: string): string[] {
  const out: string[] = [];
  const add = (t: string) => {
    const base = t.split("|")[0]!;
    const at = out.findIndex((x) => x.split("|")[0] === base);
    if (at < 0) out.push(t);
    else if (t.includes("|") && !out[at]!.includes("|")) out[at] = t;
  };
  for (const raw of model.replace(/[.,،؟?!:–-]/g, " ").split(/\s+/).filter(Boolean)) {
    let w = raw;
    // a pronoun suffix at the end of a longer word is not required
    let cut = 0;
    for (const s of SUFFIXES) { if (w.endsWith(s) && units(w).length - units(s).length >= 2 && !/^(هُوَ|هِيَ|هُمْ|هُنَّ|هُمَا)$/.test(w)) { cut = units(s).length; break; } }
    let u = units(w);
    if (cut) u = u.slice(0, u.length - cut);
    let i = 0;
    let sunNext = false;
    if (u.length > 2 && (u[0]!.b === "ا" || u[0]!.b === "أ") && u[1]!.b === "ل" && !VOW.test(u[1]!.m)) {
      if (u[2]!.m.includes("ّ") && !u[1]!.m.includes("ْ")) { sunNext = true; } else add("l");
      i = 2;
    }
    for (; i < u.length; i++) {
      const { b, m } = u[i]!;
      const prev = u[i - 1];
      const last = i === u.length - 1 && !cut;
      const tok = MAP[b];
      if (!tok) continue;
      const own = VOW.test(m) || m.includes("ّ") || /[ً-ٍ]/.test(m);
      if (b === "و" && !own && !m.includes("ْ") && prev?.m.includes("ُ")) continue;
      if (b === "ي" && !own && !m.includes("ْ") && prev?.m.includes("ِ")) continue;
      if (last && (b === "ك" || b === "ت") && u.length > 2) continue;
      if (last && b === "ه" && u.length > 2) continue;
      if (last && b === "ي" && m.includes("\u0651") && prev?.m.includes("\u0650")) continue;
      const doubled = m.includes("ّ") || (sunNext && i === 2);
      const t = b === "ر" ? "r|rr" : doubled ? `${tok}|${tok}${tok}` : tok;
      add(t);
    }
  }
  return out;
}

export function a1WordsOf(lesson: ReturnType<typeof a1Entries>[number]["lesson"]): string[] {
  return lesson.steps.flatMap((step) =>
    step.kind === "sound-words" || step.kind === "words"
      ? step.groups.flatMap((g) => g.words.map((w) => w.exercise.target))
      : step.kind === "dialogue"
        ? step.dialogue.lines.map((l) => l.exercise.target)
        : step.kind === "phrases"
          ? step.groups.flatMap((g) => g.items.map((i) => i.exercise.target)).filter((t) => !/[\u064B-\u0652]/.test(t))
          : []
  );
}

const vowelToken = { "َ": "a|aa|A|AA", "ِ": "i|ii|I|II", "ُ": "u|uu|U|UU" } as const;
function soundRule(glyph: string) {
  const base = Array.from(glyph)[0]!; const mark = Array.from(glyph)[1] as keyof typeof vowelToken;
  const others = Object.entries(vowelToken).filter(([k]) => k !== mark).map(([, v]) => v);
  return { excellent: { conditions: [`iqra_phonemes contains ['${MAP[base]}']`, `iqra_phonemes contains ['${vowelToken[mark]}']`, ...others.map((o) => `iqra_phonemes does not contain ['${o}']`)], message: `ممتاز 👏 نطقت ${glyph} بشكل صحيح` }, needs_improvement: { conditions: ["iqra_phonemes is not empty"], message: `حاول مرة أخرى، نريد ${glyph}` } };
}
function vocabRule(target: string, tokens: string[]) {
  const list = `[${tokens.map((t) => `'${t}'`).join(",")}]`;
  return { excellent: { conditions: ["azure_accuracy >= 70", `iqra_phonemes contains ${list}`], message: `ممتاز 👏 نطقت كلمة ${target} بشكل صحيح` }, said_wrong_sound: { conditions: ["azure_accuracy >= 70", "iqra_phonemes is not empty", `iqra_phonemes does not contain ${list}`], message: `حاول مرة أخرى، انتبه لأصوات كلمة ${target}` }, needs_improvement: { conditions: ["azure_accuracy < 70"], message: `حاول مرة أخرى، نريد كلمة ${target}` } };
}

const newVocab = new Map<string, string[]>();
for (const w of a1Words()) {
  const t = w.exercise.target;
  if (VOCABULARY_RULES[t] || LETTER_RULES[t] || newVocab.has(t)) continue;
  newVocab.set(t, tokensOf(w.exercise.modelText));
}
const newSounds: string[] = [];
for (const { lesson } of a1Entries()) for (const step of lesson.steps) if (step.kind === "sound-words") for (const g of step.groups) if (!SOUND_RULES[g.sound.glyph] && !newSounds.includes(g.sound.glyph)) newSounds.push(g.sound.glyph);

for (const [t, tok] of newVocab) console.log(JSON.stringify(t), JSON.stringify(tok));
console.log("sounds:", newSounds.join(" "));
console.log(`${newVocab.size} new vocabulary rules, ${newSounds.length} new sound rules`);

const append = (file: string, entries: Array<[string, unknown]>) => {
  if (!entries.length) return;
  let text = readFileSync(file, "utf8").replace(/\s*}\s*$/, "");
  for (const [k, v] of entries) {
    const body = JSON.stringify(v, null, 2).split("\n").map((l, n) => (n === 0 ? l : "  " + l)).join("\n");
    text += `,\n\n  ${JSON.stringify(k)}: ${body}`;
  }
  writeFileSync(file, text + "\n}\n");
};
if (process.argv.includes("--write")) {
  append(`${ROOT}/src/lib/pronunciation/vocabulary_conditions.json`, [...newVocab].map(([t, tok]) => [t, vocabRule(t, tok)]));
  append(`${ROOT}/src/lib/pronunciation/sound_conditions.json`, newSounds.map((g) => [g, soundRule(g)]));
  // the test's EXPECTED_TOKENS
  const test = `${ROOT}/tests/unit/vocabulary-iqra-gates.test.ts`;
  let src = readFileSync(test, "utf8");
  const lines = [...newVocab].map(([t, tok]) => `  ${JSON.stringify(t)}: [${tok.map((x) => JSON.stringify(x)).join(",")}],`).join("\n");
  src = src.replace(/\n};\n\n\/\/ IQRA's token inventory/, () => `\n${lines}\n};\n\n// IQRA's token inventory`);
  writeFileSync(test, src);
  console.log("written");
}
