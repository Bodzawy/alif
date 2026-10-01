import "server-only";

import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

import type { AzureConfig } from "../config";
import type { AzureAssessment, WordAssessment } from "../types";

// Azure Speech pronunciation assessment, ported from the original
// /api/pronunciation route. Language, grading system, granularity and the
// result mapping are unchanged.

export const AZURE_LANGUAGE = "ar-EG";

// Not present in the original: recognizeOnceAsync had no upper bound, so a
// stalled connection kept the request open until the platform killed it.
export const AZURE_TIMEOUT_MS = 20_000;

export class AzureSpeechError extends Error {
  constructor(
    message: string,
    readonly kind: "canceled" | "timeout" | "failed",
    readonly details?: unknown
  ) {
    super(message);
    this.name = "AzureSpeechError";
  }
}

type RawPhoneme = {
  Phoneme?: string;
  PronunciationAssessment?: { AccuracyScore?: number };
};

type RawWord = {
  Word?: string;
  PronunciationAssessment?: { AccuracyScore?: number; ErrorType?: string };
  Phonemes?: RawPhoneme[];
};

type RawAzureResult = {
  NBest?: Array<{ Words?: RawWord[] }>;
};

export function validScore(value: number | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }
  return Math.round(value);
}

export function parseWords(rawJson: string | undefined): WordAssessment[] {
  if (!rawJson) return [];
  const parsed = JSON.parse(rawJson) as RawAzureResult;
  const rawWords = parsed.NBest?.[0]?.Words ?? [];
  return rawWords.map((word) => ({
    word: word.Word ?? "",
    accuracy: validScore(word.PronunciationAssessment?.AccuracyScore),
    errorType: word.PronunciationAssessment?.ErrorType ?? "None",
    phonemes:
      word.Phonemes?.map((phoneme) => ({
        phoneme: phoneme.Phoneme ?? null,
        accuracy: validScore(phoneme.PronunciationAssessment?.AccuracyScore),
      })) ?? [],
  }));
}

function recognizeOnce(recognizer: SpeechSDK.SpeechRecognizer): Promise<SpeechSDK.SpeechRecognitionResult> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new AzureSpeechError("Azure Speech did not respond in time.", "timeout")),
      AZURE_TIMEOUT_MS
    );
    recognizer.recognizeOnceAsync(
      (result) => {
        clearTimeout(timer);
        resolve(result);
      },
      (error) => {
        clearTimeout(timer);
        reject(
          new AzureSpeechError(
            typeof error === "string" ? error : "Azure Speech recognition failed.",
            "failed"
          )
        );
      }
    );
  });
}

export async function assessWithAzure(
  audioBuffer: Buffer,
  referenceText: string,
  { key, region }: AzureConfig
): Promise<AzureAssessment> {
  let audioConfig: SpeechSDK.AudioConfig | null = null;
  let recognizer: SpeechSDK.SpeechRecognizer | null = null;

  try {
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(key, region);
    speechConfig.speechRecognitionLanguage = AZURE_LANGUAGE;

    audioConfig = SpeechSDK.AudioConfig.fromWavFileInput(audioBuffer, "voice.wav");
    recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    const pronunciationConfig = new SpeechSDK.PronunciationAssessmentConfig(
      referenceText,
      SpeechSDK.PronunciationAssessmentGradingSystem.HundredMark,
      SpeechSDK.PronunciationAssessmentGranularity.Phoneme,
      true
    );
    pronunciationConfig.applyTo(recognizer);

    const result = await recognizeOnce(recognizer);

    if (result.reason === SpeechSDK.ResultReason.NoMatch) {
      return {
        referenceText,
        recognized: "",
        accuracy: null,
        pronunciation: null,
        fluency: null,
        completeness: null,
        firstSoundScore: null,
        words: [],
      };
    }

    if (result.reason === SpeechSDK.ResultReason.Canceled) {
      const cancellation = SpeechSDK.CancellationDetails.fromResult(result);
      throw new AzureSpeechError("Azure could not evaluate the recording.", "canceled", {
        referenceText,
        reason: SpeechSDK.CancellationReason[cancellation.reason],
        errorCode: SpeechSDK.CancellationErrorCode[cancellation.ErrorCode],
        errorDetails: cancellation.errorDetails,
      });
    }

    const assessment = SpeechSDK.PronunciationAssessmentResult.fromResult(result);

    let words: WordAssessment[] = [];
    try {
      words = parseWords(result.properties.getProperty(SpeechSDK.PropertyId.SpeechServiceResponse_JsonResult));
    } catch (error) {
      console.warn("Could not read Azure phoneme details:", error);
    }

    return {
      referenceText,
      recognized: result.text ?? "",
      accuracy: validScore(assessment.accuracyScore),
      pronunciation: validScore(assessment.pronunciationScore),
      fluency: validScore(assessment.fluencyScore),
      completeness: validScore(assessment.completenessScore),
      firstSoundScore: words[0]?.phonemes[0]?.accuracy ?? null,
      words,
    };
  } finally {
    try {
      recognizer?.close();
    } catch {}
    try {
      audioConfig?.close();
    } catch {}
  }
}
