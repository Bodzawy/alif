// Length of a recording before and after trimSilence(), kept next to the WAV
// blob so submitRecording() can report it. Only for the server log (to see
// how much silence was cut); it never changes the evaluation.

export type RecordingInfo = { recordedMs: number; sentMs: number };

const info = new WeakMap<Blob, RecordingInfo>();

export function setRecordingInfo(wav: Blob, value: RecordingInfo) {
  info.set(wav, value);
}

export function recordingInfo(wav: Blob): RecordingInfo | undefined {
  return info.get(wav);
}
