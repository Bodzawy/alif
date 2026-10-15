// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { TRIM_SILENCE, trimSilence } from "@/lib/audio/trim-silence";

const RATE = 16000;
const ms = (n: number) => Math.round((RATE * n) / 1000);

/** Deterministic noise in [-level, level]. */
function noise(length: number, level: number, seed = 1) {
  let x = seed;
  return Float32Array.from({ length }, () => {
    x = (x * 1103515245 + 12345) % 2147483648;
    return level * ((x / 2147483648) * 2 - 1);
  });
}

function concat(...parts: Float32Array[]) {
  const out = new Float32Array(parts.reduce((n, p) => n + p.length, 0));
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

const tone = (durationMs: number, amplitude = 0.3) => Float32Array.from({ length: ms(durationMs) }, (_, i) => amplitude * Math.sin((2 * Math.PI * 220 * i) / RATE));
const silence = (durationMs: number) => new Float32Array(ms(durationMs));

/** 16-bit PCM mono WAV → samples (walks the chunks; afconvert adds a FLLR chunk). */
function readWav(file: string) {
  const bytes = readFileSync(file);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const id = bytes.toString("latin1", offset, offset + 4);
    const size = view.getUint32(offset + 4, true);
    if (id === "fmt ") {
      expect(view.getUint16(offset + 10, true), "mono").toBe(1);
      expect(view.getUint32(offset + 12, true), "16 kHz").toBe(RATE);
    }
    if (id === "data") return Float32Array.from({ length: size / 2 }, (_, i) => view.getInt16(offset + 8 + i * 2, true) / 0x8000);
    offset += 8 + size + (size % 2);
  }
  throw new Error(`no data chunk in ${file}`);
}

/** First/last sample of real sound in a clean recording: a much lower threshold than trimSilence uses. */
function speechSpan(samples: Float32Array, level = 0.002) {
  let first = 0;
  while (first < samples.length && Math.abs(samples[first]!) < level) first++;
  let last = samples.length - 1;
  while (last > first && Math.abs(samples[last]!) < level) last--;
  return { first, last };
}

describe("trimSilence", () => {
  it("cuts the silence before and after the speech and keeps padMs (500 ms) on each side", () => {
    const recording = concat(silence(1200), tone(400), silence(1500));
    const result = trimSilence(recording, RATE);
    expect(TRIM_SILENCE.padMs).toBe(500);
    expect(result.trimmed).toBe(true);
    expect(result.originalMs).toBeCloseTo(3100, 0);
    expect(result.startMs).toBeCloseTo(1200 - TRIM_SILENCE.padMs, -1);
    expect(result.endMs).toBeCloseTo(1600 + TRIM_SILENCE.padMs, -1);
    expect(result.samples.length).toBe(ms(result.endMs) - ms(result.startMs));
  });

  it("keeps the original samples unchanged (no gain, no filter, no resampling)", () => {
    const recording = concat(silence(800), tone(300, 0.12), noise(ms(200), 0.02, 7), silence(900));
    const result = trimSilence(recording, RATE);
    expect(result.trimmed).toBe(true);
    expect(Array.from(result.samples)).toEqual(Array.from(recording.subarray(ms(result.startMs), ms(result.endMs))));
  });

  it("does not cut when there is nothing to cut (speech from start to end)", () => {
    const recording = tone(900);
    const result = trimSilence(recording, RATE);
    expect(result.trimmed).toBe(false);
    expect(result.samples).toBe(recording);
  });

  it("sends the recording unchanged when it finds no speech (the server decides, as before)", () => {
    for (const recording of [silence(2000), noise(ms(2000), 0.004)]) {
      const result = trimSilence(recording, RATE);
      expect(result.trimmed).toBe(false);
      expect(result.samples).toBe(recording);
    }
  });

  it("keeps a final consonant after a short silent closure (ق → ف, بيت)", () => {
    const burst = noise(ms(60), 0.03, 11);
    const recording = concat(silence(700), tone(300), silence(90), burst, silence(1200));
    const result = trimSilence(recording, RATE);
    expect(result.endMs).toBeGreaterThanOrEqual(700 + 300 + 90 + 60 + 150);
  });

  it("ignores a short click (the tap on Stopp) after the speech", () => {
    const click = Float32Array.from({ length: ms(15) }, () => 0.6);
    const recording = concat(silence(600), tone(400), silence(900), click, silence(300));
    const result = trimSilence(recording, RATE);
    expect(result.endMs).toBeCloseTo(1000 + TRIM_SILENCE.padMs, -1);
  });

  it("keeps quiet edges: a soft consonant (10× quieter than the vowel) right before and after the loud part", () => {
    const soft = (d: number) => noise(ms(d), 0.01, 3);
    const recording = concat(silence(700), soft(120), tone(300, 0.3), soft(150), silence(800));
    const result = trimSilence(recording, RATE);
    expect(result.startMs).toBeLessThanOrEqual(700);
    expect(result.endMs).toBeGreaterThanOrEqual(700 + 120 + 300 + 150);
  });

  it("adapts to background noise: speech above a noisy floor is still found, the noise around it is cut", () => {
    const recording = concat(noise(ms(1000), 0.01, 5), tone(400, 0.2), noise(ms(1000), 0.01, 9));
    const result = trimSilence(recording, RATE);
    expect(result.trimmed).toBe(true);
    expect(result.startMs).toBeLessThanOrEqual(1000);
    expect(result.endMs).toBeGreaterThanOrEqual(1400);
    expect(result.endMs - result.startMs).toBeLessThan(400 + 2 * TRIM_SILENCE.padMs + 30);
  });

  it("handles very short recordings and other sample rates", () => {
    expect(trimSilence(new Float32Array(10), RATE).trimmed).toBe(false);
    const at48k = Float32Array.from({ length: 48000 * 2 }, (_, i) => (i > 48000 * 0.8 && i < 48000 * 1.2 ? 0.3 * Math.sin(i / 20) : 0));
    const result = trimSilence(at48k, 48000);
    expect(result.startMs).toBeCloseTo(800 - TRIM_SILENCE.padMs, -1);
    expect(result.endMs).toBeCloseTo(1200 + TRIM_SILENCE.padMs, -1);
  });
});

// Real Arabic speech (scripts/make-speech-fixtures.sh): letters and words with
// quiet edges – hamza, ف ث ه ح خ ع, final consonants. Put into 1–1.5 s of
// silence or background noise (as a student's recording is), trimSilence must
// keep every sample of the speech and cut the rest.
describe("trimSilence with real Arabic letters and words", () => {
  const dir = path.join(__dirname, "../fixtures/arabic-speech");
  const files = readdirSync(dir).filter((f) => f.endsWith(".wav"));

  it("has the fixtures", () => {
    expect(files.length).toBeGreaterThanOrEqual(13);
  });

  const backgrounds = [
    { name: "quiet room", level: 0 },
    { name: "light noise", level: 0.002 },
    { name: "noisy room", level: 0.006 },
  ];

  for (const file of files) {
    for (const background of backgrounds) {
      it(`${file} · ${background.name}: no speech is cut, the silence is`, () => {
        const speech = readWav(path.join(dir, file));
        const { first, last } = speechSpan(speech);
        const lead = ms(1000);
        const trail = ms(1500);
        const recording = concat(silence(1000), speech, silence(1500));
        const bed = noise(recording.length, background.level, file.length);
        for (let i = 0; i < recording.length; i++) recording[i]! += bed[i]!;

        const result = trimSilence(recording, RATE);
        const start = ms(result.startMs);
        const end = ms(result.endMs);

        // Every sample of the speech is kept …
        expect(start, "start").toBeLessThanOrEqual(lead + first);
        expect(end, "end").toBeGreaterThan(lead + last);
        // … with a margin before and after it (in noise, the faintest end of a sound is below the noise itself) …
        expect(lead + first - start, "margin before").toBeGreaterThanOrEqual(ms(background.level > 0.004 ? 50 : 100));
        expect(end - (lead + last), "margin after").toBeGreaterThanOrEqual(ms(background.level > 0.004 ? 50 : 100));
        // … and the silence is gone: at most the speech plus 2 × padMs (+ one frame each side).
        expect(result.trimmed).toBe(true);
        expect(end - start).toBeLessThanOrEqual(last - first + ms(2 * TRIM_SILENCE.padMs + 2 * TRIM_SILENCE.frameMs + TRIM_SILENCE.maxGapMs));
        expect(result.originalMs - (result.endMs - result.startMs)).toBeGreaterThan(900);
      });
    }
  }
});
