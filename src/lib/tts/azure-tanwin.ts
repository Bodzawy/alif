import "server-only";

import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

import type { AzureConfig } from "@/lib/pronunciation/config";

import { TANWIN_CUT_MARK, cutWav } from "./tanwin-cut";

const TIMEOUT_MS = 15_000;

/**
 * Synthesises SSML that contains the Tanwin bookmark (tanwin-cut.ts) and
 * returns the audio up to the bookmark as a WAV. Throws when Azure fails or
 * the bookmark is not reported – the caller then falls back to plain TTS.
 */
export function synthesizeTanwinWord(ssml: string, azure: AzureConfig): Promise<Buffer> {
  const config = SpeechSDK.SpeechConfig.fromSubscription(azure.key, azure.region);
  config.speechSynthesisOutputFormat = SpeechSDK.SpeechSynthesisOutputFormat.Riff24Khz16BitMonoPcm;
  const synthesizer = new SpeechSDK.SpeechSynthesizer(config, null);
  let cutTicks: number | null = null;
  synthesizer.bookmarkReached = (_sender, event) => {
    if (event.text === TANWIN_CUT_MARK) cutTicks = event.audioOffset;
  };

  return new Promise<Buffer>((resolve, reject) => {
    const timer = setTimeout(() => {
      synthesizer.close();
      reject(new Error("Azure TTS (Tanwin) timed out"));
    }, TIMEOUT_MS);
    synthesizer.speakSsmlAsync(
      ssml,
      (result) => {
        clearTimeout(timer);
        synthesizer.close();
        if (result.reason !== SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
          reject(new Error(`Azure TTS (Tanwin) failed: ${result.errorDetails ?? result.reason}`));
          return;
        }
        if (cutTicks === null) {
          reject(new Error("Azure TTS (Tanwin): bookmark not reported"));
          return;
        }
        // audioOffset is in ticks of 100 ns.
        resolve(cutWav(Buffer.from(result.audioData), cutTicks / 10_000_000));
      },
      (error) => {
        clearTimeout(timer);
        synthesizer.close();
        reject(new Error(`Azure TTS (Tanwin) failed: ${error}`));
      }
    );
  });
}
