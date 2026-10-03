// Minimal stand-in for microsoft-cognitiveservices-speech-sdk, used by BOTH the
// legacy Masaar route and Alif's route in the parity suite. It replays the
// Azure result in globalThis.__azure and records every parameter a route
// passes to the SDK in globalThis.__azureCalls, so the two can be compared.
export type AzureScenario = {
  reason: "Recognized" | "NoMatch" | "Canceled";
  text?: string;
  accuracy?: number; pronunciation?: number; fluency?: number; completeness?: number;
  json?: string;
};
const g = globalThis as unknown as { __azure: AzureScenario; __azureCalls: Record<string, unknown>[] };

export const ResultReason = { NoMatch: 0, Canceled: 1, RecognizedSpeech: 3 } as const;
export const PronunciationAssessmentGradingSystem = { FivePoint: 0, HundredMark: 1 } as const;
export const PronunciationAssessmentGranularity = { Phoneme: 0, Word: 1, FullText: 2 } as const;
export enum CancellationReason { Error = 0, EndOfStream = 1 }
export enum CancellationErrorCode { NoError = 0, AuthenticationFailure = 1 }
export const PropertyId = { SpeechServiceResponse_JsonResult: "json" } as const;

export class SpeechConfig {
  speechRecognitionLanguage = "";
  constructor(readonly key: string, readonly region: string) {}
  static fromSubscription(key: string, region: string) { return new SpeechConfig(key, region); }
}
export class AudioConfig {
  constructor(readonly bytes: number, readonly name: string) {}
  static fromWavFileInput(buffer: Buffer, name: string) { return new AudioConfig(buffer.length, name); }
  close() {}
}
export class PronunciationAssessmentConfig {
  constructor(readonly referenceText: string, readonly grading: number, readonly granularity: number, readonly miscue: boolean) {}
  applyTo(recognizer: SpeechRecognizer) { recognizer.pa = this; }
}
export class SpeechRecognizer {
  pa?: PronunciationAssessmentConfig;
  constructor(readonly speechConfig: SpeechConfig, readonly audioConfig: AudioConfig) {}
  recognizeOnceAsync(ok: (r: unknown) => void) {
    const s = g.__azure;
    g.__azureCalls.push({
      key: this.speechConfig.key, region: this.speechConfig.region, language: this.speechConfig.speechRecognitionLanguage,
      audioBytes: this.audioConfig.bytes, audioName: this.audioConfig.name,
      referenceText: this.pa?.referenceText, grading: this.pa?.grading, granularity: this.pa?.granularity, miscue: this.pa?.miscue,
    });
    const reason = s.reason === "Recognized" ? ResultReason.RecognizedSpeech : s.reason === "NoMatch" ? ResultReason.NoMatch : ResultReason.Canceled;
    queueMicrotask(() => ok({ reason, text: s.text, scenario: s, properties: { getProperty: () => s.json ?? "" } }));
  }
  close() {}
}
export const CancellationDetails = {
  fromResult: () => ({ reason: CancellationReason.Error, ErrorCode: CancellationErrorCode.AuthenticationFailure, errorDetails: "fake" }),
};
export const PronunciationAssessmentResult = {
  fromResult: (r: { scenario: AzureScenario }) => ({
    accuracyScore: r.scenario.accuracy, pronunciationScore: r.scenario.pronunciation,
    fluencyScore: r.scenario.fluency, completenessScore: r.scenario.completeness,
  }),
};
