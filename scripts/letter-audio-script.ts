// Writes docs/audio-scripts/<letter-id>.md (recording script for Google AI Studio) from a
// letter lesson's data, or docs/audio-scripts/shared.md (the shared clips of
// "Ergänzen" / "Hören"). Usage:
//   npx vite-node -c vitest.config.mts scripts/letter-audio-script.ts ba
//   npx vite-node -c vitest.config.mts scripts/letter-audio-script.ts shared
import { writeFileSync } from "node:fs";
import { LETTER_NARRATION_FILES } from "@/components/a1/forms/content";
import { a1Entries, getA1Lesson } from "@/data/a1";
import { A1_AUDIO_BASE } from "@/data/a1/letter-lesson";
import type { GapItem } from "@/data/types";

const id = process.argv[2]!;
if (id === "shared") {
  writeShared();
  process.exit(0);
}
const lesson = getA1Lesson("lesson-1", id)!;
const step = lesson.steps.find((s) => s.kind === "forms");
if (!step || step.kind !== "forms" || !step.forms.letter) throw new Error("no letter forms");
const { forms } = step;
const letter = forms.letter!;
const words = forms.sort;
/** The words of "Ergänzen" and "Hören" (each once), recorded into public/audio/a1/<letter>/uebungen/. */
const gapWords = lesson.steps
  .flatMap((s) => (s.kind === "gaps" ? s.gaps.items : []))
  .filter((item, i, all) => all.findIndex((other) => other.audio === item.audio) === i) as Array<GapItem & { audio: string }>;
const out = `# Aufnahme-Skript: ${letter.name} (${letter.glyph}) – A1 · Lektion 1 · „Formen", „Ergänzen", „Hören"

Folder for all files: \`public${forms.audioBase}/\` (WAV). The page plays only files that exist at build time; a missing file is skipped silently.
Generated from the lesson data (\`src/data/a1/letters/${id}.ts\`, texts from \`letterFormsTexts\` in \`src/data/a1/letter-lesson.ts\`). If a text changes there, change it here too (a unit test checks that both match).

"Wörter" needs no recordings: like Alif, it plays the model pronunciation through /api/tts. The words of "Ergänzen" and "Hören" (section 3) are spoken by /api/tts until their recordings exist. Their German narration is shared by all letters (\`docs/audio-scripts/shared.md\`).

---

## 1. German narration (${LETTER_NARRATION_FILES.length} clips)

### Style instructions (paste first)

\`\`\`
Read the following German texts as a warm, friendly teacher speaking to children aged 5 to 8.
Speak slowly and clearly, with short natural pauses after each sentence.
Pronounce the Arabic letter name "${letter.name}" the Arabic way (as an Arabic speaker says the letter name), not the German way.
Leave about 2 seconds of silence between paragraphs. Read every paragraph exactly once, in this order. Do not add anything.
\`\`\`

### Texts (one paragraph per clip, in this order)

\`\`\`
${LETTER_NARRATION_FILES.map((name) => letter.texts[name]).join("\n\n")}
\`\`\`

### File names (same order)

${LETTER_NARRATION_FILES.map((name, i) => `${i + 1}. \`${name}.wav\` – ${letter.texts[name]}`).join("\n")}

---

## 2. Arabic words (${words.length} recordings)

### Style instructions (paste first)

\`\`\`
Read the following Arabic words in Modern Standard Arabic, exactly as written, with all vowel marks.
Speak slowly and clearly. Read each line exactly once, in this order.
Leave about 2 seconds of silence between lines. Do not add anything.
\`\`\`

### Lines (in this order)

\`\`\`
${words.map((w) => w.arabic).join("\n")}
\`\`\`

### File names (same order)

${words.map((w, i) => `${i + 1}. \`${w.audio}.wav\` – ${w.arabic} (${w.german})`).join("\n")}

---

## 3. Arabic words of "Ergänzen" and "Hören" (${gapWords.length} recordings, optional)

Folder: \`public${A1_AUDIO_BASE}/${id}/uebungen/\` (WAV). Same style instructions as section 2.

### Lines (in this order)

\`\`\`
${gapWords.map((w) => w.arabic).join("\n")}
\`\`\`

### File names (same order)

${gapWords.map((w, i) => `${i + 1}. \`${w.audio.split("/").pop()}.wav\` – ${w.arabic} (${w.german})`).join("\n")}
`;
writeFileSync(`docs/audio-scripts/${id}.md`, out);

function writeShared() {
  const clips = new Map<string, string>();
  for (const { lesson } of a1Entries()) {
    for (const step of lesson.steps) {
      if (step.kind !== "gaps" || !step.gaps.texts) continue;
      const g = step.gaps;
      for (const name of [g.narration.intro, g.narration.done, g.clips!.ok, g.clips!.hint, ...Object.values(g.clips!.reveal)]) {
        if (name.startsWith("shared/") && g.texts![name]) clips.set(name.slice("shared/".length), g.texts![name]!);
      }
    }
  }
  const list = [...clips.entries()].sort(([a], [b]) => a.localeCompare(b));
  writeFileSync(
    "docs/audio-scripts/shared.md",
    `# Aufnahme-Skript: geteilte Clips – A1 · Lektion 1 · „Ergänzen" und „Hören"

Folder: \`public${A1_AUDIO_BASE}/shared/\` (WAV). Used by the letters ب ت ث ج ح خ, the review and „صَبَاحُ الْخَيْر". The page plays only files that exist at build time; a missing file is skipped silently (the caption is always shown).
The Alif files \`public/audio/a1/lesson-1/uebungen/g_ok.wav\`, \`g_hint.wav\` and \`g6_intro.wav\` have the same text and may be copied here.
Generated by \`scripts/letter-audio-script.ts shared\` from the lesson data.

---

## German narration (${list.length} clips)

### Style instructions (paste first)

\`\`\`
Read the following German texts as a warm, friendly teacher speaking to children aged 5 to 8.
Speak slowly and clearly, with short natural pauses after each sentence.
Leave about 2 seconds of silence between paragraphs. Read every paragraph exactly once, in this order. Do not add anything.
\`\`\`

### Texts (one paragraph per clip, in this order)

\`\`\`
${list.map(([, text]) => text).join("\n\n")}
\`\`\`

### File names (same order)

${list.map(([name, text], i) => `${i + 1}. \`${name}.wav\` – ${text}`).join("\n")}
`
  );
}
