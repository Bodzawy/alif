// Phase 1 of the IQRA reliability study (docs/iqra-reliability.md): how well do
// IQRA's phonemes and Azure's accuracy tell a CORRECT pronunciation from a
// WRONG one? No app behaviour changes – this only measures.
//
// For every letter (28), every sound of sound_conditions.json (84) and a spread
// of ~150 vocabulary words, the script synthesises the correct text and wrong
// variants (a short vowel swapped, short ↔ long vowel, a consonant swapped with
// a confusable one, the last syllable dropped) with the app's own SSML
// (buildSsml) in all four voices of TTS_DIALOGUE_VOICES at two speeds, converts
// each clip to 16 kHz mono 16-bit WAV (what the browser sends) and sends it to
// IQRA /predict and to Azure pronunciation assessment (the app's
// assessWithAzure, reference text = the exercise target).
//
// Clips are cached in results/clips/ (not committed), results are appended to
// results/iqra-measure.jsonl, so an interrupted run continues where it stopped.
// At the end results/iqra-measure.json and results/iqra-measure.csv are written.
//
// usage (repo root; ffmpeg on the PATH; needs AZURE_SPEECH_KEY, AZURE_SPEECH_REGION, IQRA_URL [+ INTERNAL_API_KEY]):
//   npx tsx --conditions=react-server --env-file=.env.local scripts/measure-iqra.ts [--limit=N] [--concurrency=2] [--plan]
//   --voices=female-1,male-1  --rates=-8%   only these voices / speeds (default: all four voices, both speeds)
//   --plan          only print the targets and variants (no network)
//   --probe=a,b,c   only synthesise these texts (default voice) and print IQRA's phonemes
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { WORDS_LEVEL } from "@/data/curriculum";
import { ARABIC_LETTERS } from "@/lib/pronunciation/letters";
import { SOUND_RULES, VOCABULARY_RULES } from "@/lib/pronunciation/rules";
import { assessWithAzure } from "@/lib/pronunciation/services/azure";
import { synthesizeTanwinWord } from "@/lib/tts/azure-tanwin";
import { TANWIN_CUT_MARK } from "@/lib/tts/tanwin-cut";
import { TTS_DIALOGUE_VOICES, TTS_OUTPUT_FORMAT, buildSsml, type TtsVoiceKey } from "@/lib/tts/ssml";

import { a1Words } from "../tests/support/a1-words";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "results");
const CLIPS = path.join(OUT, "clips");
const JSONL = path.join(OUT, "iqra-measure.jsonl");

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const env = (name: string) => process.env[name]?.trim() || undefined;

import {
  DAMMA, FATHA, KASRA, SHADDA, TANWIN, expectedPhonemes, join, longFor, nextIsMadd, units, vowelOf, type Unit,
} from "./iqra-phonemes";

// ---------------------------------------------------------------------------
// Wrong variants.

const CONFUSABLE: Record<string, string[]> = {
  ت: ["ط"], ط: ["ت"], س: ["ص", "ث"], ص: ["س"], ح: ["ه", "خ"], ه: ["ح"], ك: ["ق"], ق: ["ك"],
  د: ["ض", "ذ"], ض: ["د"], ذ: ["ز", "د"], ز: ["ذ"], ث: ["س", "ت"], ظ: ["ذ", "ز"], ع: ["أ"], أ: ["ع"],
  إ: ["ع"], خ: ["ح"], غ: ["خ"], ج: ["ش"], ش: ["س"], ب: ["م"], م: ["ب"], ن: ["م"], ل: ["ر"], ر: ["ل"], ف: ["ث"], و: ["ي"], ي: ["و"],
};
const VOWEL_SIGN: Record<string, string> = { a: FATHA, i: KASRA, u: DAMMA };

export type Variant = { variant: string; kind: "correct" | "wrong" | "tanwin-drop"; text: string };

export function wrongVariants(text: string): Variant[] {
  const us = units(text);
  const out: Variant[] = [];
  const push = (variant: string, changed: Unit[]) => {
    const t = join(changed);
    if (t && t !== text && !out.some((o) => o.text === t)) out.push({ variant, kind: "wrong", text: t });
  };
  const clone = () => us.map((u) => ({ ...u }));
  // a) short vowel swapped: the first and the last vowelled letter, each to both other vowels.
  const vowelled = us.map((u, i) => (vowelOf(u) ? i : -1)).filter((i) => i >= 0);
  for (const at of [...new Set([vowelled[0], vowelled.at(-1)])].filter((i): i is number => i !== undefined)) {
    const v = vowelOf(us[at]!)!;
    for (const w of ["a", "i", "u"].filter((x) => x !== v)) {
      const c = clone();
      c[at]!.marks = c[at]!.marks.replace(VOWEL_SIGN[v]!, VOWEL_SIGN[w]!);
      // a following madd letter would otherwise disagree with the new vowel
      const n = c[at + 1];
      if (n && !n.marks && (n.base === "ا" || n.base === "ي" || n.base === "و")) n.base = longFor[w]!;
      push(`vowel ${v}→${w} @${at}`, c);
    }
  }
  // b) short → long (first short vowel not followed by madd), long → short (first madd letter removed).
  const shortAt = vowelled.find((i) => !nextIsMadd(us, i) && !us[i]!.marks.includes(SHADDA));
  if (shortAt !== undefined) {
    const c = clone();
    c.splice(shortAt + 1, 0, { base: longFor[vowelOf(us[shortAt]!)!]!, marks: "" });
    push(`short→long @${shortAt}`, c);
  }
  const maddAt = us.findIndex((u, i) => i > 0 && nextIsMadd(us, i - 1) && !!vowelOf(us[i - 1]!));
  if (maddAt > 0) {
    const c = clone();
    c.splice(maddAt, 1);
    push(`long→short @${maddAt}`, c);
  }
  // c) one consonant swapped with a confusable one (the first two that have one).
  const swappable = us.map((u, i) => (CONFUSABLE[u.base] && !nextIsMadd([u], -1) ? i : -1)).filter((i) => i >= 0).slice(0, 2);
  for (const at of swappable) {
    const to = CONFUSABLE[us[at]!.base]![0]!;
    const c = clone();
    c[at]!.base = to;
    push(`consonant ${us[at]!.base}→${to} @${at}`, c);
  }
  // d) the last syllable dropped: everything from the last vowelled consonant on (only for 3+ letters).
  const letters = us.filter((u) => u.base !== " ");
  if (letters.length >= 3) {
    let cut = us.length - 1;
    while (cut > 0 && !vowelOf(us[cut]!) && !TANWIN_IN(us[cut]!)) cut--;
    if (cut > 0) push("drop last syllable", us.slice(0, cut));
  }
  return out;
}
const TANWIN_IN = (u: Unit) => Array.from(u.marks).some((m) => TANWIN[m]);

// ---------------------------------------------------------------------------
// Targets.

export type Target = { group: "letter" | "sound" | "word"; target: string; source: string; features: string[]; variants: Variant[] };

const HAS_TANWIN = /[ً-ٍ]/;
function featuresOf(text: string): string[] {
  const f: string[] = [];
  if (HAS_TANWIN.test(text)) f.push("tanwin");
  if (text.includes(SHADDA)) f.push("shadda");
  if (/[أإآؤئء]/.test(text)) f.push("hamza");
  const us = units(text);
  if (us.some((u, i) => i > 0 && nextIsMadd(us, i - 1) && !!vowelOf(us[i - 1]!))) f.push("long");
  if (/[ثذ]/.test(text)) f.push("tha-dhal");
  if (/[صضطظ]/.test(text)) f.push("emphatic");
  return f;
}

function letterTargets(): Target[] {
  return ARABIC_LETTERS.map((l) => {
    // wrong: the names of confusable letters, plus the generic variants of the name
    const confusable = (CONFUSABLE[l.letter] ?? []).map((c) => ARABIC_LETTERS.find((o) => o.letter === c)).filter(Boolean);
    const variants: Variant[] = [
      { variant: "correct", kind: "correct", text: l.modelText },
      ...confusable.map((o) => ({ variant: `letter ${l.letter}→${o!.letter}`, kind: "wrong" as const, text: o!.modelText })),
      ...wrongVariants(l.modelText).filter((v) => !v.variant.startsWith("consonant")),
    ];
    return { group: "letter", target: l.referenceText, source: "letters.ts", features: featuresOf(l.modelText), variants };
  });
}

function soundTargets(): Target[] {
  return Object.keys(SOUND_RULES).map((sound) => {
    const [base] = Array.from(sound);
    const v = vowelOf(units(sound)[0]!)!;
    const variants: Variant[] = [
      { variant: "correct", kind: "correct", text: sound },
      ...["a", "i", "u"].filter((w) => w !== v).map((w) => ({ variant: `vowel ${v}→${w}`, kind: "wrong" as const, text: base + VOWEL_SIGN[w]! })),
      ...(CONFUSABLE[base!] ?? []).slice(0, 1).map((c) => ({ variant: `consonant ${base}→${c}`, kind: "wrong" as const, text: (c === "أ" ? "أ" : c) + VOWEL_SIGN[v]! })),
    ];
    return { group: "sound", target: sound, source: "sound_conditions.json", features: featuresOf(sound), variants };
  });
}

/** ~150 words across all lessons, so that each feature (tanwin, shadda, long, hamza, ث/ذ, emphatic) is well represented. */
function wordTargets(count = 150): Target[] {
  type W = { target: string; arabic: string; model: string; source: string };
  const all: W[] = [];
  for (const lesson of WORDS_LEVEL.lessons) for (const v of lesson.vocabulary) all.push({ target: v.exercise.target, arabic: v.arabic, model: v.exercise.modelText, source: `a0/${lesson.slug}` });
  for (const w of a1Words()) all.push({ target: w.exercise.target, arabic: w.arabic, model: w.exercise.modelText, source: `a1/${w.exercise.id}` });
  // single words with rules only, each target once
  const words = all.filter((w, i) => !/\s/.test(w.target) && VOCABULARY_RULES[w.target] && all.findIndex((o) => o.target === w.target) === i);
  const picked: W[] = [];
  const take = (pool: W[], n: number) => {
    const step = Math.max(1, Math.floor(pool.length / n));
    for (let i = 0; i < pool.length && n > 0; i += step) if (!picked.includes(pool[i]!)) { picked.push(pool[i]!); n--; }
  };
  for (const feature of ["tanwin", "shadda", "hamza", "long", "tha-dhal", "emphatic"]) take(words.filter((w) => featuresOf(w.model).includes(feature)), 22);
  take(words.filter((w) => !picked.includes(w)), Math.max(0, count - picked.length));
  return picked.slice(0, count).map((w) => {
    const variants: Variant[] = [{ variant: "correct", kind: "correct", text: w.arabic }];
    if (w.model !== w.arabic) variants.push({ variant: "correct (model, tanwin)", kind: "correct", text: w.model });
    variants.push(...wrongVariants(w.arabic));
    return { group: "word" as const, target: w.target, source: w.source, features: featuresOf(w.model), variants };
  });
}

// ---------------------------------------------------------------------------
// Audio and services.

const ALL_VOICES = Object.keys(TTS_DIALOGUE_VOICES) as TtsVoiceKey[];
const VOICES = arg("voices") ? (arg("voices")!.split(",") as TtsVoiceKey[]).filter((v) => ALL_VOICES.includes(v)) : ALL_VOICES;
/** The app's rate (-8 %) and a faster one. */
const RATES = arg("rates") ? arg("rates")!.split(",") : ["-8%", "+15%"];

const azureKey = env("AZURE_SPEECH_KEY");
const azureRegion = env("AZURE_SPEECH_REGION");
const iqraBase = env("IQRA_URL")?.replace(/\/+$/, "");

async function synthesize(text: string, voice: TtsVoiceKey, rate: string): Promise<Buffer> {
  const key = createHash("sha1").update(`${voice}|${rate}|${text}`).digest("hex").slice(0, 16);
  const file = path.join(CLIPS, `${key}.wav`);
  if (existsSync(file)) return readFileSync(file);
  // the app's SSML; only the rate is replaced for the second speed
  const ssml = buildSsml(text, voice).replace('rate="-8%"', `rate="${rate}"`);
  // A single word with Tanwin: cut at the bookmark, exactly like /api/tts.
  if (ssml.includes(`mark="${TANWIN_CUT_MARK}"`)) {
    const wav = toWav(await synthesizeTanwinWord(ssml, { key: azureKey!, region: azureRegion! }));
    writeFileSync(file, wav);
    return wav;
  }
  for (let attempt = 0; ; attempt++) {
    const response = await fetch(`https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: { "Ocp-Apim-Subscription-Key": azureKey!, "Content-Type": "application/ssml+xml", "X-Microsoft-OutputFormat": TTS_OUTPUT_FORMAT, "User-Agent": "Alif" },
      body: ssml,
    });
    if (response.ok) {
      const wav = toWav(Buffer.from(await response.arrayBuffer()));
      writeFileSync(file, wav);
      return wav;
    }
    if (attempt >= 4 || (response.status !== 429 && response.status < 500)) throw new Error(`Azure TTS ${response.status} for ${text}`);
    await sleep(1000 * 2 ** attempt);
  }
}

/** MP3 (or Azure's 24 kHz WAV) → 16 kHz mono 16-bit PCM WAV, as the browser records for /api/pronunciation. */
function toWav(mp3: Buffer): Buffer {
  const out = spawnSync("ffmpeg", ["-loglevel", "error", "-i", "pipe:0", "-ar", "16000", "-ac", "1", "-sample_fmt", "s16", "-f", "wav", "pipe:1"], { input: mp3, maxBuffer: 64 * 1024 * 1024 });
  if (out.status !== 0) throw new Error(`ffmpeg: ${out.stderr.toString()}`);
  return out.stdout;
}

async function iqra(wav: Buffer): Promise<string[] | null> {
  const key = env("INTERNAL_API_KEY");
  // Gentle on IQRA (it may be the production instance): back off 2, 4, 8, 16 s.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const form = new FormData();
      form.append("audio", new Blob([new Uint8Array(wav)]), "voice.wav");
      const response = await fetch(`${iqraBase}/predict`, { method: "POST", body: form, headers: key ? { "X-Internal-Api-Key": key } : undefined, signal: AbortSignal.timeout(20_000) });
      if (!response.ok) throw new Error(`IQRA ${response.status}`);
      const data = (await response.json()) as { ok?: boolean; phonemes?: unknown };
      if (data.ok === false) return null;
      return Array.isArray(data.phonemes) ? data.phonemes.filter((p): p is string => typeof p === "string") : [];
    } catch (error) {
      if (attempt === 4) throw error;
      await sleep(2000 * 2 ** attempt);
    }
  }
  return null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type Row = {
  group: Target["group"]; target: string; source: string; features: string[];
  variant: string; kind: Variant["kind"]; text: string; voice: TtsVoiceKey; rate: string;
  expected: string[]; iqra: string[] | null;
  azure: { accuracy: number | null; pronunciation: number | null; fluency: number | null; completeness: number | null; firstSoundScore: number | null; recognized: string } | null;
  error?: string;
};

const rowKey = (r: Pick<Row, "target" | "text" | "voice" | "rate">) => `${r.target}|${r.text}|${r.voice}|${r.rate}`;

async function measure(t: Target, v: Variant, voice: TtsVoiceKey, rate: string): Promise<Row> {
  const base = { group: t.group, target: t.target, source: t.source, features: t.features, variant: v.variant, kind: v.kind, text: v.text, voice, rate, expected: expectedPhonemes(v.text) };
  try {
    const wav = await synthesize(v.text, voice, rate);
    const [phonemes, azure] = await Promise.all([
      iqra(wav),
      assessWithAzure(wav, t.target, { key: azureKey!, region: azureRegion! }).catch((e: unknown) => {
        throw new Error(`Azure assessment: ${e instanceof Error ? e.message : String(e)}`);
      }),
    ]);
    const { accuracy, pronunciation, fluency, completeness, firstSoundScore, recognized } = azure;
    return { ...base, iqra: phonemes, azure: { accuracy, pronunciation, fluency, completeness, firstSoundScore, recognized } };
  } catch (error) {
    return { ...base, iqra: null, azure: null, error: error instanceof Error ? error.message : String(error) };
  }
}

async function pool<T>(items: T[], size: number, work: (item: T, index: number) => Promise<void>) {
  let next = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (next < items.length) {
      const i = next++;
      await work(items[i]!, i);
    }
  }));
}

const csvCell = (v: unknown) => {
  const s = Array.isArray(v) ? v.join(" ") : v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
};

export function writeOutputs(rows: Row[]) {
  writeFileSync(path.join(OUT, "iqra-measure.json"), JSON.stringify({ generated: new Date().toISOString(), voices: VOICES, rates: RATES, rows }, null, 0));
  const header = ["group", "target", "variant", "kind", "text", "voice", "rate", "expected_phonemes", "iqra_phonemes", "azure_accuracy", "azure_recognized", "error"];
  const lines = rows.map((r) => [r.group, r.target, r.variant, r.kind, r.text, r.voice, r.rate, r.expected, r.iqra, r.azure?.accuracy, r.azure?.recognized, r.error].map(csvCell).join(","));
  writeFileSync(path.join(OUT, "iqra-measure.csv"), [header.join(","), ...lines].join("\n") + "\n");
}

export function readRows(): Row[] {
  if (!existsSync(JSONL)) return [];
  const rows = new Map<string, Row>();
  for (const line of readFileSync(JSONL, "utf8").split("\n")) if (line.trim()) { const r = JSON.parse(line) as Row; rows.set(rowKey(r), r); }
  return [...rows.values()];
}

export function allTargets(): Target[] {
  return [...letterTargets(), ...soundTargets(), ...wordTargets()];
}

async function main() {
  const targets = allTargets();
  if (process.argv.includes("--plan")) {
    for (const t of targets) console.log(`${t.group}\t${t.target}\t[${t.features.join(",")}]\t${t.variants.map((v) => `${v.variant}: ${v.text} /${expectedPhonemes(v.text).join(" ")}/`).join(" | ")}`);
    const variants = targets.reduce((n, t) => n + t.variants.length, 0);
    console.log(`${targets.length} targets (${targets.filter((t) => t.group === "letter").length} letters, ${targets.filter((t) => t.group === "sound").length} sounds, ${targets.filter((t) => t.group === "word").length} words), ${variants} texts, ${variants * VOICES.length * RATES.length} clips`);
    return;
  }
  const missing = [!azureKey && "AZURE_SPEECH_KEY", !azureRegion && "AZURE_SPEECH_REGION", !iqraBase && "IQRA_URL"].filter(Boolean);
  if (missing.length) {
    console.error(`Not measured: ${missing.join(", ")} not set (npx tsx --conditions=react-server --env-file=.env.local scripts/measure-iqra.ts).`);
    process.exit(2);
  }
  mkdirSync(CLIPS, { recursive: true });

  const probe = arg("probe");
  if (probe) {
    for (const text of probe.split(",")) {
      const wav = await synthesize(text, "female-1", RATES[0] ?? "-8%");
      console.log(`${text}\texpected /${expectedPhonemes(text).join(" ")}/\tIQRA [${(await iqra(wav))?.join(" ")}]`);
    }
    return;
  }

  const done = new Set(readRows().filter((r) => !r.error).map(rowKey));
  const jobs = targets.flatMap((t) => t.variants.flatMap((v) => VOICES.flatMap((voice) => RATES.map((rate) => ({ t, v, voice, rate })))));
  const open = jobs.filter((j) => !done.has(rowKey({ target: j.t.target, text: j.v.text, voice: j.voice, rate: j.rate })));
  const todo = open.slice(0, Number(arg("limit") ?? Infinity));
  console.log(`${jobs.length} clips in total, ${jobs.length - open.length} already measured, ${todo.length} to go now.`);
  let finished = 0;
  let errors = 0;
  const started = Date.now();
  await pool(todo, Number(arg("concurrency") ?? 2), async ({ t, v, voice, rate }) => {
    const row = await measure(t, v, voice, rate);
    if (row.error) errors++;
    appendFileSync(JSONL, JSON.stringify(row) + "\n");
    if (++finished % 100 === 0 || finished === todo.length) {
      const rate = finished / ((Date.now() - started) / 1000);
      console.log(`${finished}/${todo.length} (${errors} errors) · ${rate.toFixed(1)} clips/s · ~${Math.round((todo.length - finished) / rate / 60)} min left`);
    }
  });
  const rows = readRows();
  writeOutputs(rows);
  console.log(`Wrote results/iqra-measure.json and .csv: ${rows.length} rows, ${rows.filter((r) => r.error).length} with errors.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(ROOT, "scripts/measure-iqra.ts")) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exit(2);
  });
}
