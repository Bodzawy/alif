// Audit of the recorded model audio (src/lib/tts/recorded-manifest.json): does each
// recording say the consonants of its text? A recording that says another word
// (e.g. نَضَجَ recorded as "نضد") teaches the wrong sound, and no rule can catch it
// at runtime. Each clip is sent to IQRA /predict; a clip is flagged when one of
// the consonants IQRA recognises reliably (docs/iqra-reliability.md: ≥ 90 % on
// clean speech) is missing from what IQRA heard. A flag is a candidate to listen
// to, not a verdict – IQRA still misses a reliable consonant now and then.
//
// Results are cached in results/recording-audit.jsonl (an interrupted run continues).
//
//   npx tsx --env-file=.env.local scripts/audit-recordings.ts [--words] [--limit=N]
//     --words   only single words (no spaces)
import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

import manifest from "../src/lib/tts/recorded-manifest.json";
import { CONSONANT } from "./iqra-phonemes";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "results");
const JSONL = path.join(OUT, "recording-audit.jsonl");

/** Consonants IQRA hears at their place in ≥ 90 % of clean clips (docs/iqra-reliability.md). */
const RELIABLE = new Set(["$", "r", "E", "b", "t", "z", "m", "d", "l", "*", "f", "j", "s", "k"]);
/** What IQRA may write instead for the same letter (emphatic / doubled / a neighbour it confuses on clean speech). */
const SAME: Record<string, string[]> = { t: ["t", "tt", "T"], d: ["d", "dd", "D"], s: ["s", "ss", "S"], z: ["z", "zz", "Z"], "*": ["*", "**", "z", "Z"], k: ["k", "kk", "q"] };

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const env = (name: string) => process.env[name]?.trim() || undefined;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const iqraBase = env("IQRA_URL")?.replace(/\/+$/, "");
if (!iqraBase) throw new Error("IQRA_URL is not set (run with --env-file=.env.local).");

/** The consonants of a text that IQRA should hear reliably, in order (ة at the end is silent, ال before a sun letter too). */
function reliableConsonants(text: string): string[] {
  const letters = Array.from(text.replace(/[ً-ْٰ.،؟?!:]/g, ""));
  const out: string[] = [];
  letters.forEach((ch, i) => {
    if (ch === "ة" && (i === letters.length - 1 || letters[i + 1] === " ")) return;
    if (ch === "ل" && letters[i - 1] === "ا" && (i === 1 || letters[i - 2] === " ")) return; // the article's ل: often assimilated
    if (ch === "و" || ch === "ي" || ch === "ا" || ch === "ى") return; // long vowels or glides: not counted
    const token = CONSONANT[ch];
    if (token && RELIABLE.has(token)) out.push(token);
  });
  return out;
}

function missing(expected: string[], heard: string[]): string[] {
  const used = new Set<number>();
  return expected.filter((token) => {
    const ok = SAME[token] ?? [token, token + token];
    const at = heard.findIndex((h, i) => !used.has(i) && ok.includes(h));
    if (at < 0) return true;
    used.add(at);
    return false;
  });
}

function toWav(file: string): Buffer {
  const out = spawnSync("ffmpeg", ["-loglevel", "error", "-i", file, "-ar", "16000", "-ac", "1", "-sample_fmt", "s16", "-f", "wav", "pipe:1"], { maxBuffer: 64 * 1024 * 1024 });
  if (out.status !== 0) throw new Error(`ffmpeg: ${out.stderr.toString()}`);
  return out.stdout;
}

async function iqra(wav: Buffer): Promise<string[] | null> {
  const key = env("INTERNAL_API_KEY");
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

type Row = { text: string; file: string; expected: string[]; heard: string[] | null; missing: string[] };

async function main() {
  mkdirSync(OUT, { recursive: true });
  const done = new Map<string, Row>();
  if (existsSync(JSONL)) for (const line of readFileSync(JSONL, "utf8").split("\n").filter(Boolean)) {
    const row = JSON.parse(line) as Row;
    done.set(row.file, row);
  }
  const clips = Object.entries((manifest as { clips: Record<string, string> }).clips).filter(([text]) => !process.argv.includes("--words") || !/\s/.test(text.trim()));
  const limit = Number(arg("limit") ?? Infinity);
  let n = 0;
  for (const [text, file] of clips) {
    if (n >= limit) break;
    if (done.has(file)) continue;
    const expected = reliableConsonants(text);
    if (expected.length === 0) continue;
    n++;
    const heard = await iqra(toWav(path.join(ROOT, "public", "audio", "ar", `${file}.mp3`)));
    const row: Row = { text, file, expected, heard, missing: heard ? missing(expected, heard) : [] };
    appendFileSync(JSONL, JSON.stringify(row) + "\n");
    done.set(file, row);
    if (row.missing.length) console.log(`FLAG ${file}  ${text}  missing ${row.missing.join(" ")}  heard ${heard?.join(" ")}`);
    await sleep(2100); // IQRA's nginx allows 30 requests a minute from outside the server
  }
  const flagged = [...done.values()].filter((r) => r.missing.length > 0);
  console.log(`\n${done.size} clips checked, ${flagged.length} flagged.`);
  for (const r of flagged.sort((a, b) => b.missing.length - a.missing.length)) console.log(`${r.file}\t${r.text}\tmissing ${r.missing.join(" ")}\theard ${r.heard?.join(" ")}`);
}

void main();
