// Builds the recording batches from the code – the texts the app actually speaks.
//   npx vite-node -c vitest.config.mts scripts/audio/batches-from-code.ts
//
// 1. docs/audio-replacement/scope-words-letters.csv: every Arabic letter name, letter
//    sound, single word and the feedback cue that /api/tts may speak (ALLOWED_TTS_TEXTS).
//    A text keeps its id from the old list (or a batch); a new text gets the next free id.
// 2. Recorded clips (src/lib/tts/recorded-manifest.json) whose text is no longer spoken
//    (e.g. أَسَد, now أَسَدٌ) are taken out of the manifest and listed in rejected.txt, so
//    install_clips.py leaves them out; the word's new text goes into batch-rerecord, with
//    the replacements of clips rejected before (e.g. خَسٌّ for w0186).
// 3. Every other text without a recording goes into batch-04, batch-05 … (100 each).
//    batch-01 … 03 (recorded and installed) are left as they are, and so are the hand-made
//    re-recordings (batch-tanwin: ب ت ج with an audible Tanwin); their texts are not repeated.
// Each batch: batch-NN.json (ids in order, for split_batch.py) and batch-NN.txt (paste
// into Google AI Studio with the style in STYLE-gemini.md: one text per line, a blank
// line between texts).
import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";

import { withTanwin } from "@/lib/arabic/tanwin";
import { FEEDBACK_CUES } from "@/lib/pronunciation/cues";
import { ARABIC_LETTERS } from "@/lib/pronunciation/letters";
import { ALLOWED_TTS_TEXTS } from "@/lib/pronunciation/targets";

const ROOT = path.resolve(__dirname, "..", "..");
const AR = path.join(ROOT, "docs", "audio-replacement");
const BATCHES = path.join(AR, "batches");
const SCOPE = path.join(AR, "scope-words-letters.csv");
const REJECTED = path.join(AR, "rejected.txt");
const MANIFEST = path.join(ROOT, "src", "lib", "tts", "recorded-manifest.json");
const RECORDED_BATCHES = ["batch-01", "batch-02", "batch-03"];
/** Re-recordings of clips that are installed but not good enough; installed after the batches above, so they win. */
const MANUAL_BATCHES = ["batch-tanwin"];
const SIZE = 100;

type Item = { id: string; kind: string; text: string };
const ARABIC = /[؀-ۿ]/;
const HARAKAT = /[ً-ْٰـ]/g;

// --- 1. the scope, from the code ------------------------------------------------------
const letterNames = new Set(ARABIC_LETTERS.map((letter) => letter.modelText));
const cues = new Set<string>(Object.values(FEEDBACK_CUES));
const kindOf = (text: string) =>
  letterNames.has(text) ? "letter-name" : cues.has(text) ? "cue" : Array.from(text.replace(HARAKAT, "")).length === 1 ? "letter-sound" : "word";
const texts = [...ALLOWED_TTS_TEXTS].filter((text) => ARABIC.test(text) && (cues.has(text) || text.trim().split(/\s+/).length === 1));

const csvRows = (file: string): Item[] =>
  readFileSync(file, "utf8")
    .replace(/^﻿/, "")
    .trim()
    .split("\n")
    .slice(1)
    .map((line) => {
      const [, id, kind, text] = /^([^,]+),([^,]+),"?(.*?)"?$/.exec(line)!;
      return { id: id!, kind: kind!, text: text! };
    });
const batchItems = (name: string): Item[] => JSON.parse(readFileSync(path.join(BATCHES, `${name}.json`), "utf8")).items;

const known = new Map<string, Item>();
for (const item of csvRows(SCOPE)) known.set(item.text, item);
for (const file of readdirSync(BATCHES).filter((f) => f.endsWith(".json") && !f.startsWith("_"))) for (const item of batchItems(file.replace(/\.json$/, ""))) if (!known.has(item.text)) known.set(item.text, item);
let next = Math.max(...[...known.values()].map((item) => Number(item.id.slice(1))).filter((n) => n < 9000)) + 1;
const scope: Item[] = texts.map((text) => known.get(text) ?? { id: `w${String(next++).padStart(4, "0")}`, kind: kindOf(text), text });
scope.sort((a, b) => a.id.localeCompare(b.id));
writeFileSync(SCOPE, "﻿id,kind,text\n" + scope.map((item) => `${item.id},${item.kind},"${item.text}"`).join("\n") + "\n");

// --- 2. recorded clips: still spoken, or to be recorded again ---------------------------
const manifest = JSON.parse(readFileSync(MANIFEST, "utf8")) as { clips: Record<string, string> };
const inScope = new Set(scope.map((item) => item.text));
const stale = Object.entries(manifest.clips).filter(([text]) => !inScope.has(text));
for (const [text] of stale) delete manifest.clips[text];
// Same layout as install_clips.py writes it: one clip per line.
writeFileSync(MANIFEST, `{\n"clips": {\n${Object.entries(manifest.clips).map(([text, file]) => `${JSON.stringify(text)}: ${JSON.stringify(file)}`).join(",\n")}\n}\n}\n`);

const rejectedIds = new Set(
  readFileSync(REJECTED, "utf8")
    .split("\n")
    .map((line) => line.replace(/#.*/, "").trim())
    .filter(Boolean)
);
const newRejections = stale.map(([text, file]) => file.split(".")[0]!).filter((id) => !rejectedIds.has(id));
if (newRejections.length) {
  const lines = stale.filter(([, file]) => newRejections.includes(file.split(".")[0]!)).map(([text, file]) => `${file.split(".")[0]}  # ${text}: no longer spoken (now ${withTanwin(text)}), re-recorded in batch-rerecord`);
  writeFileSync(REJECTED, readFileSync(REJECTED, "utf8").replace(/\n?$/, "\n") + lines.join("\n") + "\n");
}

const recorded = new Set(Object.keys(manifest.clips));
const byText = new Map(scope.map((item) => [item.text, item]));
const rerecordTexts = new Set<string>();
// The word's new form – unless it is recorded already (e.g. جَمَلٌ from the letter lesson ج).
for (const [text] of stale) if (byText.has(withTanwin(text)) && !recorded.has(withTanwin(text))) rerecordTexts.add(withTanwin(text));
// Replacements of clips rejected before (rejected.txt), e.g. w9001 خَسٌّ for w0186 خَسٌ.
if (existsSync(path.join(BATCHES, "batch-fix1.json"))) for (const item of batchItems("batch-fix1")) if (byText.has(item.text) && !recorded.has(item.text)) rerecordTexts.add(item.text);
// Kept from an earlier run (its stale clips are out of the manifest by now).
if (existsSync(path.join(BATCHES, "batch-rerecord.json"))) for (const item of batchItems("batch-rerecord")) if (byText.has(item.text) && !recorded.has(item.text)) rerecordTexts.add(item.text);
const rerecord = scope.filter((item) => rerecordTexts.has(item.text));
const manual = new Set(MANUAL_BATCHES.filter((name) => existsSync(path.join(BATCHES, `${name}.json`))).flatMap((name) => batchItems(name).map((item) => item.text)));

// --- 3. the batches ---------------------------------------------------------------------
const inRecordedBatches = new Set(RECORDED_BATCHES.flatMap((name) => batchItems(name).map((item) => item.text)));
const todo = scope.filter((item) => !recorded.has(item.text) && !rerecordTexts.has(item.text) && !manual.has(item.text) && item.text.trim().split(/\s+/).length === 1);
const unrecordedInRecordedBatches = todo.filter((item) => inRecordedBatches.has(item.text));

for (const file of readdirSync(BATCHES)) {
  const name = file.replace(/\.(json|txt)$/, "");
  if (!RECORDED_BATCHES.includes(name) && !MANUAL_BATCHES.includes(name) && !name.startsWith("_")) unlinkSync(path.join(BATCHES, file));
}
const write = (name: string, items: Item[]) => {
  writeFileSync(path.join(BATCHES, `${name}.json`), JSON.stringify({ batch: name, items }, null, 1) + "\n");
  writeFileSync(path.join(BATCHES, `${name}.txt`), items.map((item) => item.text).join("\n\n") + "\n");
};
write("batch-rerecord", rerecord);
const batches: string[] = [];
for (let i = 0; i < todo.length; i += SIZE) {
  const name = `batch-${String(4 + i / SIZE).padStart(2, "0")}`;
  write(name, todo.slice(i, i + SIZE));
  batches.push(name);
}

console.log(`scope: ${scope.length} texts (${scope.filter((i) => !known.has(i.text)).length} new ids)`);
console.log(`recorded and still spoken: ${recorded.size}; no longer spoken: ${stale.length} (taken out of the manifest, in rejected.txt)`);
console.log(`batch-rerecord: ${rerecord.length} texts`);
console.log(`new batches: ${batches[0]} … ${batches.at(-1)} (${todo.length} texts)`);
if (unrecordedInRecordedBatches.length) console.log(`(rejected earlier, recorded again in these batches: ${unrecordedInRecordedBatches.map((i) => i.text).join(" ")})`);
if (!existsSync(path.join(AR, "STYLE-gemini.md"))) console.log("note: STYLE-gemini.md is missing");
