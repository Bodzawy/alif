// Scripts to record the A2 lessons in Google AI Studio (Gemini speech), one folder per lesson:
//   npx tsx scripts/audio/a2-scripts.ts            (all A2 lessons)
//   npx tsx scripts/audio/a2-scripts.ts lesson-1   (one unit)
// Writes docs/audio-replacement/a2-scripts/<unit>/ :
//   words.txt                         every single word the lesson speaks (one per item, blank line between)
//   sentences.txt                     every sentence / longer text that is not a dialogue line
//   dialogue-<id>-<speaker>.txt       the lines of ONE speaker in the order of the dialogue (record with that speaker's voice)
//   dialogue-<id>-all.txt             the whole dialogue as "Name: line" (for Gemini's multi-speaker mode)
//   README.txt                        which file, how many items, which voice
// And, next to the texts, the specs the cutting/installing scripts read (docs/audio-replacement/batches/):
//   _batch-a2l<N>.json (words), _batch-a2l<N>s.json (sentences), _dialogue-a2l<N>-<speaker>.json (one per speaker)
//   python3 scripts/audio/split_batch.py docs/audio-replacement/batches/_batch-a2l1.json docs/audio-replacement/audio-in/batch-a2l1.wav
//   python3 scripts/audio/install_clips.py a2l1 a2l1s ;  python3 scripts/audio/install_dialogue_clips.py
// The texts are exactly what the app shows and speaks (with harakat). Style: STYLE-gemini.md.
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

import { A2_LEVEL } from "../../src/data/a2";
import { a1LessonExercises, stepSpokenTexts } from "../../src/data/a1";

const OUT = path.resolve(__dirname, "..", "..", "docs", "audio-replacement", "a2-scripts");
const only = process.argv[2];
const ARABIC = /[؀-ۿ]/;
const BATCHES = path.resolve(__dirname, "..", "..", "docs", "audio-replacement", "batches");
const spec = (file: string, body: object) => writeFileSync(path.join(BATCHES, file), JSON.stringify(body, null, 1) + "\n");
const block = (items: string[]) => items.join("\n\n") + "\n";

for (const unit of A2_LEVEL.units.filter((u) => !only || u.slug === only)) {
  const dir = path.join(OUT, unit.slug);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const readme: string[] = [`${unit.title} – ${unit.titleGerman}`, ""];
  const words: string[] = [];
  const sentences: string[] = [];
  const seen = new Set<string>();

  for (const lesson of unit.lessons) {
    const dialogueTexts = new Set(lesson.steps.flatMap((step) => (step.kind === "dialogue" ? step.dialogue.lines.map((line) => line.exercise.modelText.trim()) : [])));
    const texts = [...a1LessonExercises(lesson).map((e) => e.modelText), ...lesson.steps.flatMap(stepSpokenTexts)].map((t) => t.trim());
    for (const text of texts) {
      if (!ARABIC.test(text) || seen.has(text) || dialogueTexts.has(text)) continue;
      seen.add(text);
      (text.split(/\s+/).length > 1 ? sentences : words).push(text);
    }

    const done = new Set<string>();
    for (const step of lesson.steps) {
      if (step.kind !== "dialogue" || done.has(step.dialogue.id)) continue;
      done.add(step.dialogue.id);
      const { dialogue } = step;
      for (const speaker of dialogue.speakers) {
        const lines = dialogue.lines.filter((line) => line.speaker === speaker.id).map((line) => line.exercise.modelText.trim());
        if (!lines.length) continue;
        const file = `dialogue-${dialogue.id}-${speaker.id}.txt`;
        writeFileSync(path.join(dir, file), block(lines));
        const byText = new Map<string, string[]>();
        for (const line of dialogue.lines.filter((l) => l.speaker === speaker.id)) byText.set(line.exercise.modelText.trim(), [...(byText.get(line.exercise.modelText.trim()) ?? []), line.id]);
        spec(`_dialogue-a2l${unit.number}-${speaker.id}.json`, {
          batch: `_dialogue-a2l${unit.number}-${speaker.id}`,
          voice: speaker.voice,
          speakers: [`${speaker.name} (${dialogue.id})`],
          items: [...byText].map(([text, ids], i) => ({ id: `a2d-${speaker.id}-${dialogue.id}-${String(i + 1).padStart(2, "0")}`, kind: "dialogue", voice: speaker.voice, text, lines: ids })),
        });
        readme.push(`${file}: ${lines.length} lines, voice ${speaker.voice ?? "?"} (${speaker.name})`);
      }
      const nameOf = (id: string) => dialogue.speakers.find((s) => s.id === id)?.name ?? id;
      const file = `dialogue-${dialogue.id}-all.txt`;
      writeFileSync(path.join(dir, file), dialogue.lines.map((line) => `${nameOf(line.speaker)}: ${line.exercise.modelText.trim()}`).join("\n") + "\n");
      readme.push(`${file}: whole dialogue, ${dialogue.lines.length} lines, Name: line`);
    }
  }
  const tag = `a2l${unit.number}`;
  const items = (kind: string, prefix: string, texts: string[]) => texts.map((text, i) => ({ id: `${prefix}${String(i + 1).padStart(3, "0")}`, kind, text }));
  spec(`_batch-${tag}.json`, { batch: `batch-${tag}`, items: items("word", `${tag}w`, words) });
  spec(`_batch-${tag}s.json`, { batch: `batch-${tag}s`, items: items("sentence", `${tag}s`, sentences) });
  writeFileSync(path.join(dir, "words.txt"), block(words));
  writeFileSync(path.join(dir, "sentences.txt"), block(sentences));
  readme.push(`words.txt: ${words.length} words`, `sentences.txt: ${sentences.length} sentences/texts`);
  writeFileSync(path.join(dir, "README.txt"), readme.join("\n") + "\n");
  console.log(readme.join("\n"));
}
