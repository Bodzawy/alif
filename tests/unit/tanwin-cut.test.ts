import { describe, expect, it } from "vitest";

import { a1Entries } from "@/data/a1";
import { buildSsml } from "@/lib/tts/ssml";
import { cutWav, endsInTanwin, TANWIN_CUT_MARK, withoutCutTail } from "@/lib/tts/tanwin-cut";

const TANWIN = /[ً-ٍ]/;

function wav(seconds: number, rate = 24_000): Buffer {
  const samples = Math.round(seconds * rate);
  const pcm = Buffer.alloc(samples * 2);
  for (let i = 0; i < samples; i++) pcm.writeInt16LE(10_000, i * 2);
  const header = Buffer.alloc(44);
  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVEfmt ", 8, "ascii");
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36, "ascii");
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

describe("Tanwin cut", () => {
  it.each(["بَيْتٌ", "أَبٌ", "أُمٌّ", "بِطَاقَةٌ", "جُنْدِيٌّ", "مُسْتَشْفًى", "كِتَابًا", "كِتَاباً", "بَيْتٍ"])("%s ends in Tanwin", (word) => {
    expect(endsInTanwin(word)).toBe(true);
  });

  it.each(["أَنَا", "الصِّين", "بَيْت", "هَذَا كِتَابٌ.", "Super!", "أَبُو"])("%s does not", (text) => {
    expect(endsInTanwin(text)).toBe(false);
  });

  it("cuts a WAV at the bookmark (+25 ms) and keeps a valid header", () => {
    const out = cutWav(wav(1.2), 0.5);
    expect(out.toString("ascii", 0, 4)).toBe("RIFF");
    const samples = out.readUInt32LE(40) / 2;
    expect(samples).toBe(Math.round(0.525 * 24_000));
    expect(out.length).toBe(44 + samples * 2);
    expect(out.readUInt32LE(4)).toBe(out.length - 8);
    expect(out.readInt16LE(44 + (samples - 1) * 2)).toBe(0); // faded out
    expect(out.readInt16LE(44)).toBe(10_000); // the word itself untouched
  });

  it("every A1 letter word with Tanwin is sent with the bookmark – and as itself, not as IPA", () => {
    let checked = 0;
    for (const { lesson } of a1Entries()) {
      if (lesson.kind !== "letter") continue;
      for (const step of lesson.steps) {
        if (step.kind !== "sound-words" && step.kind !== "words") continue;
        for (const word of step.groups.flatMap((g) => g.words)) {
          const text = word.exercise.modelText;
          const ssml = buildSsml(text);
          if (!TANWIN.test(text)) {
            expect(ssml, word.id).not.toContain(TANWIN_CUT_MARK);
            continue;
          }
          checked++;
          expect(ssml, word.id).toContain(`${text}<bookmark mark="${TANWIN_CUT_MARK}"/>`);
          expect(ssml, word.id).not.toContain("<phoneme");
          expect(withoutCutTail(ssml), word.id).not.toContain(TANWIN_CUT_MARK);
        }
      }
    }
    expect(checked).toBeGreaterThan(200);
  });
});
