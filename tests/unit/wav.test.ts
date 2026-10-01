// @vitest-environment node
import { describe, expect, it } from "vitest";

import { encodeWav, TARGET_SAMPLE_RATE } from "@/lib/audio/wav";
import { readWavHeader } from "@/lib/audio/wav-header";

async function bytes(blob: Blob) {
  return new Uint8Array(await blob.arrayBuffer());
}

describe("WAV encoding", () => {
  it("writes a 16 kHz mono 16-bit PCM RIFF/WAVE file", async () => {
    const samples = new Float32Array(TARGET_SAMPLE_RATE / 2).map((_, i) => Math.sin(i / 10));
    const blob = encodeWav(samples, TARGET_SAMPLE_RATE);
    expect(blob.type).toBe("audio/wav");
    const data = await bytes(blob);
    expect(data.length).toBe(44 + samples.length * 2);

    const view = new DataView(data.buffer);
    expect(String.fromCharCode(...data.slice(0, 4))).toBe("RIFF");
    expect(String.fromCharCode(...data.slice(8, 12))).toBe("WAVE");
    expect(view.getUint16(20, true)).toBe(1); // PCM
    expect(view.getUint16(22, true)).toBe(1); // mono
    expect(view.getUint32(24, true)).toBe(16000);
    expect(view.getUint16(34, true)).toBe(16);

    expect(readWavHeader(data)).toEqual({ channels: 1, sampleRate: 16000, bitsPerSample: 16, dataBytes: samples.length * 2, durationMs: 500 });
  });

  it("clamps samples to the 16-bit range", async () => {
    const data = await bytes(encodeWav(new Float32Array([2, -2, 0]), 16000));
    const view = new DataView(data.buffer);
    expect(view.getInt16(44, true)).toBe(0x7fff);
    expect(view.getInt16(46, true)).toBe(-0x8000);
    expect(view.getInt16(48, true)).toBe(0);
  });
});

describe("WAV header validation", () => {
  it("rejects non-WAV payloads", () => {
    expect(readWavHeader(new TextEncoder().encode("not a wav file at all, definitely not RIFF data....."))).toBeNull();
    expect(readWavHeader(new Uint8Array(10))).toBeNull();
  });

  it("skips extra chunks between fmt and data", async () => {
    const wav = await bytes(encodeWav(new Float32Array(1600), 16000));
    const list = new Uint8Array([..."LIST"].map((c) => c.charCodeAt(0)).concat([4, 0, 0, 0, 1, 2, 3, 4]));
    const withList = new Uint8Array([...wav.slice(0, 36), ...list, ...wav.slice(36)]);
    expect(readWavHeader(withList)?.durationMs).toBe(100);
  });
});
