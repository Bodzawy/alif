// Every recorded text (src/lib/tts/recorded-manifest.json) must still be a text the
// app speaks (ALLOWED_TTS_TEXTS): a recorded key that is no longer spoken means
// the text changed after recording and needs a new recording.
//   npx tsx scripts/audio/check-manifest.ts
import manifest from "@/lib/tts/recorded-manifest.json";
import { ALLOWED_TTS_TEXTS } from "@/lib/pronunciation/targets";

const keys = Object.keys(manifest.clips);
const stale = keys.filter((text) => !ALLOWED_TTS_TEXTS.has(text));
console.log(`${keys.length} recorded texts, ${keys.length - stale.length} still spoken, ${stale.length} changed or gone:`);
for (const text of stale) console.log(`  ${text}  (${manifest.clips[text as keyof typeof manifest.clips]})`);
process.exitCode = stale.length ? 1 : 0;
