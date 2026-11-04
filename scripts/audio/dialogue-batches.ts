// Recording batches for the dialogue lines of the A1 lessons from Lektion N on, one batch per voice:
//   npx vite-node -c vitest.config.mts scripts/audio/dialogue-batches.ts -- --from=2
//
// A dialogue line is spoken in its speaker's voice (male-1, male-2, female-1, female-2), so each voice gets
// batches of its own, recorded with its own Gemini voice (the same as Lektion 1: male-1 Achird,
// male-2 Algieba, female-1 Sulafat, female-2 Leda; STYLE-gemini.md). A text said several times in one voice
// is recorded once and serves every line (item.lines). Lines that have their recording already are left out.
// Writes _dialogue-lN-<voice>-01.json / .txt, -02 … (40 lines each), then record each .txt and
//   python3 scripts/audio/split_batch.py docs/audio-replacement/batches/_dialogue-l2-male-1-01.json <recording>
//   python3 scripts/audio/install_dialogue_clips.py
import { readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";

import { A1_LEVEL } from "@/data/a1";

const ROOT = path.resolve(__dirname, "..", "..");
const BATCHES = path.join(ROOT, "docs", "audio-replacement", "batches");
const MANIFEST = path.join(ROOT, "src", "lib", "tts", "dialogue-manifest.json");
const SIZE = 40;
const SHORT = { "male-1": "m1", "male-2": "m2", "female-1": "f1", "female-2": "f2" } as Record<string, string>;

const from = Number(/--from=(\d+)/.exec(process.argv.join(" "))?.[1] ?? 2);
const recorded = (JSON.parse(readFileSync(MANIFEST, "utf8")) as { lines: Record<string, { voice: string; text: string }> }).lines;

type Item = { text: string; lines: string[]; speakers: Set<string>; lesson: number };
const byVoice = new Map<string, Map<string, Item>>();
let total = 0;
let done = 0;
for (const unit of A1_LEVEL.units.filter((unit) => unit.number >= from)) {
  for (const lesson of unit.lessons) {
    for (const step of lesson.steps) {
      if (step.kind !== "dialogue") continue;
      const { dialogue } = step;
      for (const line of dialogue.lines) {
        total++;
        const speaker = dialogue.speakers.find((s) => s.id === line.speaker);
        if (!speaker?.voice) throw new Error(`${dialogue.id} ${line.id}: speaker ${line.speaker} has no voice`);
        const text = line.exercise.modelText.trim();
        const old = recorded[line.id];
        if (old && old.voice === speaker.voice && old.text === text) {
          done++;
          continue;
        }
        const items = byVoice.get(speaker.voice) ?? new Map<string, Item>();
        byVoice.set(speaker.voice, items);
        const item = items.get(text) ?? { text, lines: [], speakers: new Set<string>(), lesson: unit.number };
        items.set(text, item);
        if (!item.lines.includes(line.id)) item.lines.push(line.id);
        item.speakers.add(`${speaker.name} (${dialogue.id})`);
      }
    }
  }
}

for (const file of readdirSync(BATCHES)) if (file.startsWith(`_dialogue-l${from}-`)) unlinkSync(path.join(BATCHES, file));
console.log(`Lektion ${from} on: ${total} dialogue lines, ${done} recorded already`);
for (const voice of ["male-1", "male-2", "female-1", "female-2"]) {
  const items = [...(byVoice.get(voice)?.values() ?? [])];
  for (let i = 0; i < items.length; i += SIZE) {
    const name = `_dialogue-l${from}-${voice}-${String(1 + i / SIZE).padStart(2, "0")}`;
    const slice = items.slice(i, i + SIZE);
    const spec = {
      batch: name,
      voice,
      speakers: [...new Set(slice.flatMap((item) => [...item.speakers]))],
      items: slice.map((item, n) => ({ id: `d${from}-${SHORT[voice]}-${String(i + n + 1).padStart(3, "0")}`, kind: "dialogue", voice, text: item.text, lines: item.lines })),
    };
    writeFileSync(path.join(BATCHES, `${name}.json`), JSON.stringify(spec, null, 1) + "\n");
    writeFileSync(path.join(BATCHES, `${name}.txt`), slice.map((item) => item.text).join("\n\n") + "\n");
    console.log(`  ${name}: ${slice.length} texts, ${slice.reduce((sum, item) => sum + item.lines.length, 0)} lines (Lektion ${slice[0]!.lesson}–${slice.at(-1)!.lesson})`);
  }
}
