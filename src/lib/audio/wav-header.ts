// Server-safe inspection of an uploaded WAV file. Used by /api/pronunciation
// to reject uploads that are not the RIFF/WAVE file the browser produces,
// before any external service is called.

/** 16 kHz mono 16-bit PCM is 32 KB/s; 2 MB is ~60 s, far above any exercise. */
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
export const MIN_AUDIO_MS = 100;

export type WavInfo = {
  channels: number;
  sampleRate: number;
  bitsPerSample: number;
  dataBytes: number;
  durationMs: number;
};

function ascii(bytes: Uint8Array, start: number, length: number) {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

export function readWavHeader(bytes: Uint8Array): WavInfo | null {
  if (bytes.length < 44) return null;
  if (ascii(bytes, 0, 4) !== "RIFF" || ascii(bytes, 8, 4) !== "WAVE") return null;

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 12;
  let format: Omit<WavInfo, "dataBytes" | "durationMs"> | null = null;

  // Walk the chunks: browsers write "fmt " then "data", but other encoders
  // may insert LIST/fact chunks in between.
  while (offset + 8 <= bytes.length) {
    const id = ascii(bytes, offset, 4);
    const size = view.getUint32(offset + 4, true);
    const body = offset + 8;

    if (id === "fmt " && body + 16 <= bytes.length) {
      format = {
        channels: view.getUint16(body + 2, true),
        sampleRate: view.getUint32(body + 4, true),
        bitsPerSample: view.getUint16(body + 14, true),
      };
    } else if (id === "data") {
      if (!format || format.sampleRate === 0 || format.channels === 0 || format.bitsPerSample === 0) return null;
      const dataBytes = Math.min(size, bytes.length - body);
      const bytesPerSecond = format.sampleRate * format.channels * (format.bitsPerSample / 8);
      return { ...format, dataBytes, durationMs: Math.round((dataBytes / bytesPerSecond) * 1000) };
    }

    offset = body + size + (size % 2);
  }

  return null;
}
