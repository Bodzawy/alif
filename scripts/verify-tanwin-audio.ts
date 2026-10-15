// Checks that the model audio of the A1 letter words ("Wörter") really ends in
// Tanwin – a 200 from /api/tts proves nothing about what is spoken. The Tanwin
// audio comes from the running app's /api/tts (Azure + the cut at the bookmark,
// src/lib/tts/tanwin-cut.ts), the pausal word on the card (بَيْت) straight from
// Azure with the same SSML; both → 16 kHz mono 16-bit WAV (what the browser
// sends to /api/pronunciation) → IQRA's phonemes. A word passes when the Tanwin audio ends
// in -un (-an for ـًى: IQRA u|U … / a|A … followed by n), is longer than the
// pausal audio and has more phonemes than it. Words without Tanwin (أَنَا,
// الصِّين …) are skipped: their spoken text is the word on the card.
//
// usage (repo root; ffmpeg on the PATH):
//   npm run dev   (in another terminal)
//   npx tsx --env-file=.env.local scripts/verify-tanwin-audio.ts [--all] [--app=http://localhost:3000] [--keep=<dir>]
//   needs AZURE_SPEECH_KEY, AZURE_SPEECH_REGION and IQRA_URL (+ INTERNAL_API_KEY if IQRA uses one).
//   --app   where the app runs (default http://localhost:3000), e.g. the deployed site
//   --all   every word of every letter entry instead of the sample below
//   --keep  writes both WAVs of each word there, to listen to them
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { a1Entries } from "@/data/a1";
import type { A1Word } from "@/data/types";
import { TTS_OUTPUT_FORMAT, buildSsml } from "@/lib/tts/ssml";

// Words of several letters, one per kind of ending: consonant, ة, Shadda, Nisba, ء, ن, long ū + ن, ـًى.
const SAMPLE = ["أَب", "أُمّ", "بَيْت", "بِطَاقَة", "تُفَّاحَة", "جُنْدِيّ", "خَس", "دَوَاء", "ظَبْي", "قَلَم", "كِتَاب", "لِسَان", "لَيْمُون", "مُسْتَشْفَى", "سُكَّر"];

const arg = (name: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const env = (name: string) => process.env[name]?.trim() || undefined;

const azureKey = env("AZURE_SPEECH_KEY");
const azureRegion = env("AZURE_SPEECH_REGION");
const iqraUrl = env("IQRA_URL")?.replace(/\/+$/, "");
const appUrl = (arg("app") ?? "http://localhost:3000").replace(/\/+$/, "");
const keep = arg("keep");

const missing = [!azureKey && "AZURE_SPEECH_KEY", !azureRegion && "AZURE_SPEECH_REGION", !iqraUrl && "IQRA_URL"].filter(Boolean);
if (missing.length) {
  console.error(`Not verified: ${missing.join(", ")} not set (e.g. npx tsx --env-file=.env.local scripts/verify-tanwin-audio.ts).`);
  process.exit(2);
}

const words: A1Word[] = [];
for (const { lesson } of a1Entries()) {
  if (lesson.kind !== "letter") continue;
  for (const step of lesson.steps) {
    if (step.kind !== "sound-words" && step.kind !== "words") continue;
    for (const word of step.groups.flatMap((g) => g.words)) if (!words.some((w) => w.arabic === word.arabic)) words.push(word);
  }
}
const selected = process.argv.includes("--all") ? words : SAMPLE.map((arabic) => words.find((w) => w.arabic === arabic)!).filter(Boolean);

async function azureMp3(text: string): Promise<Buffer> {
  const response = await fetch(`https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: { "Ocp-Apim-Subscription-Key": azureKey!, "Content-Type": "application/ssml+xml", "X-Microsoft-OutputFormat": TTS_OUTPUT_FORMAT, "User-Agent": "Alif" },
    body: buildSsml(text),
  });
  if (!response.ok) throw new Error(`Azure TTS ${response.status} for ${text}`);
  return Buffer.from(await response.arrayBuffer());
}

async function appAudio(text: string): Promise<Buffer> {
  const response = await fetch(`${appUrl}/api/tts`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
  if (!response.ok) throw new Error(`${appUrl}/api/tts ${response.status} for ${text}: ${await response.text()}`);
  return Buffer.from(await response.arrayBuffer());
}

/** MP3 or WAV → 16 kHz mono 16-bit PCM WAV, as the browser records for /api/pronunciation. */
function toWav(audio: Buffer): Buffer {
  const out = spawnSync("ffmpeg", ["-loglevel", "error", "-i", "pipe:0", "-ar", "16000", "-ac", "1", "-sample_fmt", "s16", "-f", "wav", "pipe:1"], { input: audio, maxBuffer: 64 * 1024 * 1024 });
  if (out.status !== 0) throw new Error(`ffmpeg: ${out.stderr.toString()}`);
  return out.stdout;
}

const seconds = (wav: Buffer) => (wav.length - 44) / 32_000;

async function iqraPhonemes(wav: Buffer): Promise<string[]> {
  const form = new FormData();
  form.append("audio", new Blob([new Uint8Array(wav)]), "voice.wav");
  const key = env("INTERNAL_API_KEY");
  const response = await fetch(`${iqraUrl}/predict`, { method: "POST", body: form, headers: key ? { "X-Internal-Api-Key": key } : undefined });
  if (!response.ok) throw new Error(`IQRA ${response.status}`);
  const data = (await response.json()) as { phonemes?: unknown };
  return Array.isArray(data.phonemes) ? data.phonemes.filter((p): p is string => typeof p === "string") : [];
}

const U = new Set(["u", "uu", "U", "UU"]);
const A = new Set(["a", "aa", "A", "AA"]);
const N = new Set(["n", "nn"]);
const endsIn = (phonemes: string[], vowels: Set<string>) => phonemes.length >= 2 && vowels.has(phonemes.at(-2)!) && N.has(phonemes.at(-1)!);

async function main() {
  let failed = 0;
  let checked = 0;
  for (const word of selected) {
    const spoken = word.exercise.modelText;
    if (spoken === word.arabic) {
      console.log(`SKIP  ${word.arabic}  no Tanwin (spoken as on the card)`);
      continue;
    }
    checked++;
    const pausalWav = toWav(await azureMp3(word.arabic));
    const spokenWav = toWav(await appAudio(spoken));
    const [pausal, heard] = await Promise.all([iqraPhonemes(pausalWav), iqraPhonemes(spokenWav)]);
    if (keep) {
      mkdirSync(keep, { recursive: true });
      writeFileSync(path.join(keep, `${word.id}-pausal.wav`), pausalWav);
      writeFileSync(path.join(keep, `${word.id}-tanwin.wav`), spokenWav);
    }
    const vowels = spoken.includes("\u064B") ? A : U;
    const ok = endsIn(heard, vowels) && heard.length > pausal.length && seconds(spokenWav) > seconds(pausalWav);
    if (!ok) failed++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${word.arabic} → ${spoken}  ${seconds(pausalWav).toFixed(2)} s → ${seconds(spokenWav).toFixed(2)} s · [${pausal.join(" ")}] → [${heard.join(" ")}]`);
  }
  console.log(`${checked - failed}/${checked} words end in Tanwin (Tanwin audio from ${appUrl}/api/tts).`);
  process.exit(failed ? 1 : 0);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(2);
});
