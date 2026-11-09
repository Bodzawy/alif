// Phase 2 of the IQRA reliability study: reads what scripts/measure-iqra.ts
// measured (results/iqra-measure.jsonl) and writes docs/iqra-reliability.md
// and results/iqra-analysis.json.
//   1. Per phoneme, on CORRECT clips: how often IQRA outputs the expected token
//      at its place (in order – an edit-distance alignment, not membership).
//   2. On WRONG clips: does IQRA hear the change (its output is closer to the
//      wrong text than to the correct one), per kind of change and per phoneme.
//   3. The CURRENT rules (buildAssessment, unchanged) on the same clips:
//      false accepts (wrong clip passes) and false rejects (correct clip fails).
// usage: npx tsx scripts/analyse-iqra.ts
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { buildAssessment, hasUsableAzureScores } from "@/lib/pronunciation/assessment";
import type { AzureAssessment } from "@/lib/pronunciation/types";

import { expectedPhonemes } from "./iqra-phonemes";

const ROOT = process.cwd();
const JSONL = path.join(ROOT, "results", "iqra-measure.jsonl");

type Row = {
  group: "letter" | "sound" | "word"; target: string; source: string; features: string[];
  variant: string; kind: "correct" | "wrong"; text: string; voice: string; rate: string;
  expected: string[]; iqra: string[] | null;
  azure: { accuracy: number | null; pronunciation: number | null; fluency: number | null; completeness: number | null; firstSoundScore: number | null; recognized: string } | null;
  error?: string;
};

function readRows(): Row[] {
  if (!existsSync(JSONL)) throw new Error("results/iqra-measure.jsonl not found – run scripts/measure-iqra.ts first");
  const rows = new Map<string, Row>();
  for (const line of readFileSync(JSONL, "utf8").split("\n")) {
    if (!line.trim()) continue;
    const r = JSON.parse(line) as Row;
    r.expected = expectedPhonemes(r.text); // always the current converter
    rows.set(`${r.target}|${r.text}|${r.voice}|${r.rate}`, r);
  }
  return [...rows.values()];
}

// ---------------------------------------------------------------------------
// Tokens and alignment.

/** IQRA writes vowels next to emphatic letters in capitals (A, UU …); the quality is the same. */
const norm = (t: string) => (/^(A|AA|I|II|U|UU)$/.test(t) ? t.toLowerCase() : t);
const isVowel = (t: string) => /^(a|aa|i|ii|u|uu)$/.test(norm(t));
const isLong = (t: string) => /^(aa|ii|uu)$/.test(norm(t));
const isDoubled = (t: string) => !isVowel(t) && t.length === 2 && t[0] === t[1];

type Op = { kind: "match" | "sub" | "del" | "ins"; exp?: string; got?: string };

/** Levenshtein alignment of expected → heard (normalised tokens), with the operations in order. */
export function align(expected: string[], heard: string[]): Op[] {
  const e = expected.map(norm), h = heard.map(norm);
  const d: number[][] = Array.from({ length: e.length + 1 }, (_, i) => Array.from({ length: h.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= e.length; i++)
    for (let j = 1; j <= h.length; j++)
      d[i]![j] = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + (e[i - 1] === h[j - 1] ? 0 : 1));
  const ops: Op[] = [];
  let i = e.length, j = h.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && d[i]![j] === d[i - 1]![j - 1]! + (e[i - 1] === h[j - 1] ? 0 : 1)) {
      ops.push({ kind: e[i - 1] === h[j - 1] ? "match" : "sub", exp: e[i - 1], got: h[j - 1] });
      i--; j--;
    } else if (i > 0 && d[i]![j] === d[i - 1]![j]! + 1) {
      ops.push({ kind: "del", exp: e[i - 1] });
      i--;
    } else {
      ops.push({ kind: "ins", got: h[j - 1] });
      j--;
    }
  }
  return ops.reverse();
}
const distance = (a: string[], b: string[]) => align(a, b).filter((o) => o.kind !== "match").length;

// ---------------------------------------------------------------------------
// Letters for the tables.

const LETTER_OF: Record<string, string> = {
  "<": "ء (Hamza)", b: "ب", t: "ت", "^": "ث", j: "ج", H: "ح", x: "خ", d: "د", "*": "ذ", r: "ر", z: "ز", s: "س", $: "ش",
  S: "ص", D: "ض", T: "ط", Z: "ظ", E: "ع", g: "غ", f: "ف", q: "ق", k: "ك", l: "ل", m: "م", n: "ن", h: "ه", w: "و", y: "ي",
  a: "Fatha a", i: "Kasra i", u: "Damma u", aa: "long ā", ii: "long ī", uu: "long ū",
};
const label = (t: string) => (isDoubled(t) ? `${LETTER_OF[t[0]!] ?? t[0]} with Shadda (${t})` : `${LETTER_OF[t] ?? t} (${t})`);

const pct = (n: number, of: number) => (of ? `${Math.round((100 * n) / of)} %` : "–");
const top = (counts: Map<string, number>, n = 3) => [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k}×${v}`).join(", ");

// ---------------------------------------------------------------------------

function main() {
  const measured = readRows();
  // Configurations (voice, rate) with at least a quarter of the clips; others (e.g. a few early test clips) are left out unless --all-configs.
  const perConfig = new Map<string, number>();
  for (const r of measured) perConfig.set(`${r.voice} ${r.rate}`, (perConfig.get(`${r.voice} ${r.rate}`) ?? 0) + 1);
  const maxPerConfig = Math.max(...perConfig.values());
  const used = new Set([...perConfig].filter(([, n]) => process.argv.includes("--all-configs") || n >= maxPerConfig / 4).map(([c]) => c));
  const all = measured.filter((r) => used.has(`${r.voice} ${r.rate}`));
  const leftOut = measured.length - all.length;
  // Texts with digits are left out: the TTS reads the number too, the converter cannot.
  const rows = all.filter((r) => !r.error && r.iqra !== null && r.azure !== null && !/[0-9٠-٩]/.test(r.text));
  const correct = rows.filter((r) => r.kind === "correct");
  const wrong = rows.filter((r) => r.kind === "wrong");
  const configs = [...new Set(rows.map((r) => `${r.voice} ${r.rate}`))];

  // 1. Per expected token on correct clips.
  type Stat = { n: number; match: number; subs: Map<string, number>; dels: number };
  const perToken = new Map<string, Stat>();
  for (const r of correct) {
    for (const op of align(r.expected, r.iqra!)) {
      if (op.kind === "ins") continue;
      const s = perToken.get(op.exp!) ?? { n: 0, match: 0, subs: new Map(), dels: 0 };
      s.n++;
      if (op.kind === "match") s.match++;
      else if (op.kind === "del") s.dels++;
      else s.subs.set(op.got!, (s.subs.get(op.got!) ?? 0) + 1);
      perToken.set(op.exp!, s);
    }
  }
  const tokenRows = [...perToken.entries()].filter(([, s]) => s.n >= 5).sort((a, b) => a[1].match / a[1].n - b[1].match / b[1].n);

  // Category summaries (correct clips).
  const cat = (pred: (t: string) => boolean) => {
    let n = 0, m = 0;
    for (const [t, s] of perToken) if (pred(t)) { n += s.n; m += s.match; }
    return { n, m };
  };
  const shortV = cat((t) => /^[aiu]$/.test(t));
  const longV = cat(isLong);
  const shadda = cat(isDoubled);
  const hamza = cat((t) => t === "<");
  const thaDhal = cat((t) => t === "^" || t === "*");
  const consonants = cat((t) => !isVowel(t) && !isDoubled(t) && t !== "<");
  // Shadda heard at least as the single consonant:
  let shaddaSingle = 0, shaddaN = 0;
  for (const r of correct) for (const op of align(r.expected, r.iqra!)) if (op.exp && isDoubled(op.exp)) { shaddaN++; if (op.kind === "match" || op.got === op.exp[0]) shaddaSingle++; }
  // Tanwin: correct (model) clips with tanwin – does IQRA end in vowel + n?
  const tanwinClips = correct.filter((r) => /[ً-ٍ]/.test(r.text));
  const endsVn = (p: string[]) => p.length >= 2 && isVowel(p.at(-2)!) && (p.at(-1) === "n" || p.at(-1) === "nn");
  const tanwinHeard = tanwinClips.filter((r) => endsVn(r.iqra!)).length;
  const pausalOfTanwin = correct.filter((r) => r.group === "word" && r.variant === "correct" && r.features.includes("tanwin"));
  const pausalEndsVn = pausalOfTanwin.filter((r) => endsVn(r.iqra!)).length;

  // 2. Wrong clips: is IQRA closer to the wrong text than to the correct one?
  const correctExpected = new Map<string, string[]>();
  for (const r of rows) if (r.variant === "correct") correctExpected.set(r.target, r.expected);
  type Det = { n: number; heard: number; tie: number };
  const byKind = new Map<string, Det>();
  const byChange = new Map<string, Det>();
  const kindOf = (v: string) => (v.startsWith("vowel") ? "short vowel swapped" : v.startsWith("short→long") ? "short → long" : v.startsWith("long→short") ? "long → short" : v.startsWith("consonant") || v.startsWith("letter") ? "consonant swapped" : v.startsWith("drop") ? "last syllable dropped" : v);
  for (const r of wrong) {
    const ce = correctExpected.get(r.target);
    if (!ce) continue;
    const toWrong = distance(r.expected, r.iqra!);
    const toCorrect = distance(ce, r.iqra!);
    const k = `${r.group} · ${kindOf(r.variant)}`;
    const d = byKind.get(k) ?? { n: 0, heard: 0, tie: 0 };
    d.n++;
    if (toWrong < toCorrect) d.heard++;
    else if (toWrong === toCorrect) d.tie++;
    byKind.set(k, d);
    // the change itself, e.g. "a→i" or "ت→ط"
    const m = r.variant.match(/(?:vowel|consonant|letter) (\S+→\S+)/);
    if (m) {
      const c = byChange.get(m[1]!) ?? { n: 0, heard: 0, tie: 0 };
      c.n++;
      if (toWrong < toCorrect) c.heard++;
      else if (toWrong === toCorrect) c.tie++;
      byChange.set(m[1]!, c);
    }
  }

  // 3. Current rules.
  type RuleStat = { correct: number; falseReject: number; wrong: number; falseAccept: number; noSpeechCorrect: number; noSpeechWrong: number; azureOnlyFR: number; azureOnlyFA: number };
  const ruleStats = new Map<string, RuleStat>();
  const rejectedBy = new Map<string, Map<string, number>>();
  for (const r of rows) {
    const s = ruleStats.get(r.group) ?? { correct: 0, falseReject: 0, wrong: 0, falseAccept: 0, noSpeechCorrect: 0, noSpeechWrong: 0, azureOnlyFR: 0, azureOnlyFA: 0 };
    const primary: AzureAssessment = { referenceText: r.target, words: [], ...r.azure! };
    const isCorrect = r.kind === "correct";
    if (isCorrect) s.correct++; else s.wrong++;
    if (!hasUsableAzureScores(primary)) {
      // The route answers 422 "unclear audio": counts as not passed.
      if (isCorrect) { s.noSpeechCorrect++; s.falseReject++; s.azureOnlyFR++; } else s.noSpeechWrong++;
      ruleStats.set(r.group, s);
      continue;
    }
    const result = buildAssessment({ target: r.target, primary, iqra: { phonemes: r.iqra! } });
    const azurePass = (primary.accuracy ?? 0) >= 70;
    if (isCorrect && !result.passed) {
      s.falseReject++;
      const reason = (primary.accuracy ?? 0) < 70 ? "Azure < 70" : result.failureReason === "rule_not_matched" ? `rule "${result.feedback.rule}"` : String(result.failureReason);
      const m = rejectedBy.get(r.group) ?? new Map();
      m.set(reason, (m.get(reason) ?? 0) + 1);
      rejectedBy.set(r.group, m);
    }
    if (!isCorrect && result.passed) s.falseAccept++;
    if (isCorrect && !azurePass) s.azureOnlyFR++;
    if (!isCorrect && azurePass) s.azureOnlyFA++;
    ruleStats.set(r.group, s);
  }

  // Azure accuracy: correct vs wrong distribution.
  const quantiles = (xs: number[]) => {
    const s = [...xs].sort((a, b) => a - b);
    const q = (p: number) => s[Math.min(s.length - 1, Math.floor(p * s.length))] ?? NaN;
    return s.length ? `${q(0.1)} / ${q(0.5)} / ${q(0.9)}` : "–";
  };
  const acc = (rs: Row[]) => rs.map((r) => r.azure!.accuracy).filter((a): a is number => a !== null);

  // Notable model audio: correct sound clips where IQRA hears much more than the sound (the TTS may read something else).
  // Azure's transcript does not help here: it repeats the reference text.
  const odd = correct.filter((r) => r.group === "sound" && r.iqra!.length >= r.expected.length + 2);

  // ---------------------------------------------------------------------------
  const md: string[] = [];
  md.push("# IQRA reliability (phase 1 + 2)", "");
  md.push(`Generated by \`scripts/analyse-iqra.ts\` from \`results/iqra-measure.jsonl\` (${rows.length} clips; ${all.length - rows.length} failed to measure and are left out${leftOut ? `; ${leftOut} clips of other configurations (early test runs) are not counted` : ""}). Configurations (voice, rate): ${configs.join(", ")}.`, "");
  md.push("## What these numbers are – and are not", "");
  md.push(
    "- Every clip is **Azure TTS** (the app's own SSML via `buildSsml`), converted to 16 kHz mono WAV as the browser sends it. A synthetic voice is clean, adult, studio-quality and pronounces exactly the written text. Children are noisier, quieter, slower, have higher pitch and make partial errors (a vowel half-way between two, a mumbled ending).",
    "- So **correct-clip numbers are an upper bound**: if IQRA misses a phoneme on clean TTS, it will miss it at least as often on children. **Wrong-clip numbers measure only clean, complete substitutions**; real mistakes are subtler and harder to detect.",
    "- A wrong variant is generated from the text (e.g. Fatha → Kasra). The TTS sometimes 'repairs' an impossible spelling, so a few wrong clips may sound correct – this inflates false accepts slightly.",
    "- 'Expected phonemes' come from a simple converter in `scripts/measure-iqra.ts` (pausal reading, ة silent at the end, Shadda = doubled token). Where the converter is wrong, IQRA is counted wrong too; phase 3 replaces it with a tested module.",
    configs.length < 8
      ? `- Pilot: ${configs.length === 1 ? "ONE configuration" : `${configs.length} configurations`} (${configs.join(", ")}). Robustness across the other voices and speeds is **not** measured yet.`
      : "- All four voices at two speeds.",
    ""
  );

  // Summary: phonemes by how often IQRA outputs them at their place on correct clips.
  const share = (t: string) => perToken.get(t)!.match / perToken.get(t)!.n;
  const named = tokenRows.map(([t]) => t);
  const band = (lo: number, hi: number) => named.filter((t) => share(t) >= lo && share(t) < hi).map(label).join(", ") || "–";
  md.push("## Summary", "");
  md.push(`- **Reliable (≥ 90 % at their place):** ${band(0.9, 1.01)}`);
  md.push(`- **Usable with tolerance (75–90 %):** ${band(0.75, 0.9)}`);
  md.push(`- **Unreliable (< 75 %):** ${band(0, 0.75)}`);
  md.push(`- **Tanwin** is audible to IQRA in ${pct(tanwinHeard, tanwinClips.length)} of the clips spoken with it; **Shadda** comes out as a doubled token in ${pct(shadda.m, shadda.n)}.`);
  md.push("");

  md.push("## 1. IQRA on correct clips – by category", "");
  md.push("| Category | expected tokens | IQRA outputs it at its place |", "|---|---:|---:|");
  md.push(`| consonants (without hamza, without Shadda) | ${consonants.n} | ${pct(consonants.m, consonants.n)} |`);
  md.push(`| ث / ذ | ${thaDhal.n} | ${pct(thaDhal.m, thaDhal.n)} |`);
  md.push(`| hamza (<) | ${hamza.n} | ${pct(hamza.m, hamza.n)} |`);
  md.push(`| short vowels a / i / u | ${shortV.n} | ${pct(shortV.m, shortV.n)} |`);
  md.push(`| long vowels aa / ii / uu | ${longV.n} | ${pct(longV.m, longV.n)} |`);
  md.push(`| Shadda as doubled token | ${shadda.n} | ${pct(shadda.m, shadda.n)} (at least the single consonant: ${pct(shaddaSingle, shaddaN)}) |`);
  md.push(`| Tanwin: clip spoken WITH tanwin ends in vowel + n | ${tanwinClips.length} clips | ${pct(tanwinHeard, tanwinClips.length)} |`);
  md.push(`| (control) same words read pausal end in vowel + n | ${pausalOfTanwin.length} clips | ${pct(pausalEndsVn, pausalOfTanwin.length)} |`, "");

  md.push("## 2. IQRA on correct clips – per phoneme", "", "Sorted from least to most reliable (tokens seen at least 5 times).", "");
  md.push("| phoneme | n | correct | deleted | heard instead (top 3) |", "|---|---:|---:|---:|---|");
  for (const [t, s] of tokenRows) md.push(`| ${label(t)} | ${s.n} | ${pct(s.match, s.n)} | ${pct(s.dels, s.n)} | ${top(s.subs)} |`);
  md.push("");

  md.push("## 3. Does IQRA hear a wrong pronunciation?", "", "A wrong clip counts as *heard* when IQRA's output is closer (edit distance) to the wrong text than to the correct one; *tie* = equally close (IQRA does not tell them apart).", "");
  md.push("| group · change | clips | heard | tie | missed |", "|---|---:|---:|---:|---:|");
  for (const [k, d] of [...byKind.entries()].sort()) md.push(`| ${k} | ${d.n} | ${pct(d.heard, d.n)} | ${pct(d.tie, d.n)} | ${pct(d.n - d.heard - d.tie, d.n)} |`);
  md.push("", "Per substitution (at least 4 clips):", "", "| change | clips | heard | tie |", "|---|---:|---:|---:|");
  for (const [k, d] of [...byChange.entries()].filter(([, d]) => d.n >= 4).sort((a, b) => a[1].heard / a[1].n - b[1].heard / b[1].n)) md.push(`| ${k} | ${d.n} | ${pct(d.heard, d.n)} | ${pct(d.tie, d.n)} |`);
  md.push("");

  md.push("## 4. The CURRENT rules on these clips", "", "`buildAssessment` exactly as the app runs it (conditions files + Azure ≥ 65/70 gates). A clip where Azure recognised no speech is a 422 in the app and counts as *not passed*.", "");
  md.push("| group | correct clips | false reject | wrong clips | false accept | Azure-only (≥ 70) FR / FA |", "|---|---:|---:|---:|---:|---:|");
  for (const g of ["letter", "sound", "word"]) {
    const s = ruleStats.get(g);
    if (!s) continue;
    md.push(`| ${g} | ${s.correct} | ${s.falseReject} (${pct(s.falseReject, s.correct)}) | ${s.wrong} | ${s.falseAccept} (${pct(s.falseAccept, s.wrong)}) | ${pct(s.azureOnlyFR, s.correct)} / ${pct(s.azureOnlyFA, s.wrong)} |`);
  }
  md.push("", "Why correct clips were rejected:", "");
  for (const [g, m] of rejectedBy) md.push(`- **${g}**: ${top(m, 6)}`);
  md.push("", "Azure accuracy (10th / 50th / 90th percentile):", "", "| group | correct clips | wrong clips |", "|---|---|---|");
  for (const g of ["letter", "sound", "word"]) md.push(`| ${g} | ${quantiles(acc(correct.filter((r) => r.group === g)))} | ${quantiles(acc(wrong.filter((r) => r.group === g)))} |`);
  md.push("");
  if (odd.length) {
    md.push("## 5. Model audio worth checking", "", "Correct sound clips where IQRA hears at least two tokens more than the sound – listen to them; the TTS may read more than the sound (e.g. a letter name):", "");
    // same file name as scripts/measure-iqra.ts (synthesize)
    const clip = (r: Row) => `results/clips/${createHash("sha1").update(`${r.voice}|${r.rate}|${r.text}`).digest("hex").slice(0, 16)}.wav`;
    md.push("| sound | expected | IQRA | clip |", "|---|---|---|---|");
    for (const r of odd) md.push(`| ${r.target} | ${r.expected.join(" ")} | ${r.iqra!.join(" ")} | \`${clip(r)}\` |`);
    md.push("");
  }

  writeFileSync(path.join(ROOT, "docs", "iqra-reliability.md"), md.join("\n"));
  writeFileSync(
    path.join(ROOT, "results", "iqra-analysis.json"),
    JSON.stringify({
      clips: rows.length,
      perToken: Object.fromEntries(tokenRows.map(([t, s]) => [t, { n: s.n, match: s.match, deleted: s.dels, subs: Object.fromEntries(s.subs) }])),
      detection: Object.fromEntries(byKind),
      perChange: Object.fromEntries(byChange),
      rules: Object.fromEntries(ruleStats),
    }, null, 1)
  );
  console.log(md.join("\n"));
}

main();
