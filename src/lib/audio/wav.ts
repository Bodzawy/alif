// Browser-side conversion of a MediaRecorder recording (webm/ogg/mp4…) into
// the format the pronunciation services expect: 16 kHz, mono, 16-bit PCM WAV.
// Ported from masaar: src/lib/audio/wav.ts. Alif addition: the silence before
// and after the speech is cut (trimSilence) – shorter audio, faster evaluation.

import { setRecordingInfo } from "./recording-info";
import { trimSilence } from "./trim-silence";

export const TARGET_SAMPLE_RATE = 16000;

/**
 * TEMPORARY switch for the before/after measurement: localStorage
 * "alif:trim-silence" = "off" sends the recording untrimmed. Remove after the
 * measurement.
 */
export const TRIM_SILENCE_SWITCH = "alif:trim-silence";

function trimSilenceEnabled(): boolean {
  try {
    return window.localStorage.getItem(TRIM_SILENCE_SWITCH) !== "off";
  } catch {
    return true;
  }
}

export async function blobTo16KhzMonoWav(blob: Blob): Promise<Blob> {
  const input = await blob.arrayBuffer();

  const AudioContextConstructor =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextConstructor) {
    throw new Error("AudioContext is not supported.");
  }

  const audioContext = new AudioContextConstructor();

  try {
    const decoded = await audioContext.decodeAudioData(input.slice(0));

    const sampleRate = TARGET_SAMPLE_RATE;
    const frameCount = Math.max(1, Math.ceil(decoded.duration * sampleRate));

    const offlineContext = new OfflineAudioContext(1, frameCount, sampleRate);
    const source = offlineContext.createBufferSource();
    source.buffer = decoded;
    source.connect(offlineContext.destination);
    source.start();

    const rendered = await offlineContext.startRendering();
    const channel = rendered.getChannelData(0);
    const trimmed = trimSilenceEnabled()
      ? trimSilence(channel, sampleRate)
      : { samples: channel, startMs: 0, endMs: (channel.length / sampleRate) * 1000, originalMs: (channel.length / sampleRate) * 1000 };
    const wav = encodeWav(trimmed.samples, sampleRate);
    setRecordingInfo(wav, { recordedMs: trimmed.originalMs, sentMs: trimmed.endMs - trimmed.startMs });
    return wav;
  } finally {
    // Masaar closed the context only on success; closing it on failure too
    // avoids leaking an AudioContext per failed attempt.
    await audioContext.close().catch(() => undefined);
  }
}

export function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const bytesPerSample = 2;
  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true); // byte rate
  view.setUint16(32, bytesPerSample, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * bytesPerSample, true);

  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i] ?? 0));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, text: string) {
  for (let i = 0; i < text.length; i++) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}
