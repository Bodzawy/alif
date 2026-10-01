// Recording parameters of the original pronunciation trainer (masaar:
// src/components/trainer/pronunciation-trainer.tsx), the newest and most
// robust recording implementation in that codebase.

export const MAX_RECORDING_MS = 3500;
export const MIN_RECORDING_MS = 400;

// Browser gain control, noise suppression and echo cancellation distort short
// phonemes: in testing they clipped the signal or erased the letter entirely,
// and Azure could no longer recognise it. Unprocessed audio scored correctly.
export const MIC_CONSTRAINTS: MediaTrackConstraints = {
  channelCount: 1,
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false,
};

export function microphoneErrorMessage(error: unknown): string {
  const name = error instanceof DOMException || error instanceof Error ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError" || name === "PermissionDeniedError") {
    return "Der Mikrofonzugriff wurde nicht erlaubt. Erlaube das Mikrofon in den Browser-Einstellungen und versuche es erneut.";
  }
  if (name === "NotFoundError" || name === "OverconstrainedError" || name === "DevicesNotFoundError") {
    return "Es wurde kein Mikrofon gefunden. Schließe ein Mikrofon an und versuche es erneut.";
  }
  if (name === "NotReadableError" || name === "TrackStartError") {
    return "Das Mikrofon wird gerade von einer anderen App verwendet. Schließe diese App und versuche es erneut.";
  }
  return "Das Mikrofon konnte nicht gestartet werden. Bitte versuche es erneut.";
}

export function recordingSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== "undefined"
  );
}
