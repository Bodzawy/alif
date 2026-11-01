// Recording batches for the Arabic words and sentences of the A1 lessons from Lektion N on
// that have no recording yet (they are still spoken by Azure):
//   npx vite-node -c vitest.config.mts scripts/audio/batches-from-lessons.ts -- --from=2
//
// The texts: every Arabic text one of these lessons speaks – an exercise, an "Anhören" text
// of a step (a1SpokenTexts) or a Formen word. Dialogue lines are left out: they are spoken
// in their speakers' voices (dialogue-manifest.json).
// A word keeps its id from scope-words-letters.csv (batches-from-code.ts); a word that is
// not in it gets the next free id. Sentences are not in it: they get s0001, s0002 … in
// lesson order, apart from the w ids batches-from-code.ts hands out.
// Writes, in lesson order, like _batch-l1-formen:
//   words:     _batch-lN-01.json / .txt, _batch-lN-02 … (100 texts each)
//   sentences: _batch-lNs-01.json / .txt, … (50 texts each; a longer pause, see STYLE-gemini.md)
//   texts of several sentences (they pause inside, at . or ؟): _batch-lNp-01 … (25 each)
// Record each .txt in Google AI Studio (STYLE-gemini.md), then
//   python3 scripts/audio/split_batch.py docs/audio-replacement/batches/_batch-lN-01.json docs/audio-replacement/audio-in/batch-lN-01.mp3
//   python3 scripts/audio/install_clips.py lN      (sentences: lNs, several sentences: lNp)
// The leading _ keeps them apart from batch-04 … (where the same words wait in another order).
import { readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";

import { A1_LEVEL, a1LessonExercises, stepSpokenTexts } from "@/data/a1";
import { formsFallbackTexts } from "@/data/a1/forms-fallback";

const ROOT = path.resolve(__dirname, "..", "..");
const AR = path.join(ROOT, "docs", "audio-replacement");
const BATCHES = path.join(AR, "batches");
const SCOPE = path.join(AR, "scope-words-letters.csv");
const MANIFEST = path.join(ROOT, "src", "lib", "tts", "recorded-manifest.json");
const SIZE = { word: 100, sentence: 50, passage: 25 };

const from = Number(/--from=(\d+)/.exec(process.argv.join(" "))?.[1] ?? 2);

type Item = { id: string; kind: string; text: string; lesson: number };
const ARABIC = /[؀-ۿ]/;
const HARAKAT = /[ً-ْٰـ]/g;
/** A sentence end inside the text: it has several sentences. */
const INNER_END = /[.؟!]\s+\S/;

const known = new Map<string, { id: string; kind: string }>();
for (const line of readFileSync(SCOPE, "utf8").replace(/^﻿/, "").trim().split("\n").slice(1)) {
  const [, id, kind, text] = /^([^,]+),([^,]+),"?(.*?)"?$/.exec(line)!;
  known.set(text!, { id: id!, kind: kind! });
}
let next = Math.max(...[...known.values()].map((item) => Number(item.id.slice(1))).filter((n) => n < 9000)) + 1;
const recorded = new Set(Object.keys((JSON.parse(readFileSync(MANIFEST, "utf8")) as { clips: Record<string, string> }).clips));

const words: Item[] = [];
const sentences: Item[] = [];
const seen = new Set<string>();
let dialogueLines = 0;
for (const unit of A1_LEVEL.units.filter((unit) => unit.number >= from)) {
  for (const lesson of unit.lessons) {
    const dialogue = new Set(lesson.steps.flatMap((step) => (step.kind === "dialogue" ? step.dialogue.lines.map((line) => line.exercise.modelText) : [])));
    const texts = [
      ...a1LessonExercises(lesson).map((exercise) => exercise.modelText),
      ...lesson.steps.flatMap(stepSpokenTexts),
      ...lesson.steps.flatMap((step) => (step.kind === "forms" ? Object.values(formsFallbackTexts(step.forms)) : [])),
    ].map((text) => text.trim());
    for (const text of texts) {
      if (!ARABIC.test(text) || seen.has(text)) continue;
      seen.add(text);
      if (dialogue.has(text)) dialogueLines++;
      else if (!recorded.has(text)) {
        const sentence = text.split(/\s+/).length > 1;
        const old = known.get(text);
        const kind = old?.kind ?? (sentence ? "sentence" : Array.from(text.replace(HARAKAT, "")).length === 1 ? "letter-sound" : "word");
        const id = old?.id ?? (sentence ? `s${String(sentences.length + 1).padStart(4, "0")}` : `w${String(next++).padStart(4, "0")}`);
        (sentence ? sentences : words).push({ id, kind, text, lesson: unit.number });
      }
    }
  }
}

const write = (prefix: string, items: Item[], size: number) => {
  for (const file of readdirSync(BATCHES)) if (file.startsWith(`_${prefix}-`)) unlinkSync(path.join(BATCHES, file));
  for (let i = 0; i < items.length; i += size) {
    const name = `${prefix}-${String(1 + i / size).padStart(2, "0")}`;
    const slice = items.slice(i, i + size);
    writeFileSync(path.join(BATCHES, `_${name}.json`), JSON.stringify({ batch: name, items: slice.map(({ id, kind, text }) => ({ id, kind, text })) }, null, 1) + "\n");
    writeFileSync(path.join(BATCHES, `_${name}.txt`), slice.map((item) => item.text).join("\n\n") + "\n");
    console.log(`  _${name} (Lektion ${slice[0]!.lesson}–${slice.at(-1)!.lesson})`);
  }
};

const newIds = [...words, ...sentences].filter((item) => !known.has(item.text)).length;
console.log(`Lektion ${from} on: ${seen.size} Arabic texts spoken; already recorded: ${seen.size - words.length - sentences.length - dialogueLines}; dialogue lines (left out): ${dialogueLines}`);
const passages = sentences.filter((item) => INNER_END.test(item.text));
console.log(`without a recording: ${words.length} words, ${sentences.length - passages.length} sentences, ${passages.length} texts of several sentences (${newIds} new ids)`);
write(`batch-l${from}`, words, SIZE.word);
write(`batch-l${from}s`, sentences.filter((item) => !passages.includes(item)), SIZE.sentence);
write(`batch-l${from}p`, passages, SIZE.passage);
