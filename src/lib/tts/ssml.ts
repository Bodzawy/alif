import { GERMAN_CUES } from "@/lib/pronunciation/cues";
import { endsInTanwin, withCutTail } from "@/lib/tts/tanwin-cut";

// Same voice, prosody and output format as the original /api/tts.
export const TTS_VOICE = "ar-SA-ZariyahNeural";
/** Only for the German cues (e.g. "Super!"): an Arabic voice would mispronounce them. */
export const TTS_VOICE_GERMAN = "de-DE-KatjaNeural";
const GERMAN_TEXTS: ReadonlySet<string> = new Set(Object.values(GERMAN_CUES));

/**
 * The voices a request may ask for (dialogue speakers; DialogueVoice in
 * src/data/types.ts). Only these keys are accepted by /api/tts – never a free
 * Azure voice name. Two different male and two different female Azure neural
 * voices that read Modern Standard Arabic.
 */
export const TTS_DIALOGUE_VOICES = {
  "male-1": "ar-SA-HamedNeural",
  "male-2": "ar-AE-HamdanNeural",
  // female-1 is the lesson voice (TTS_VOICE), the one Alif has always used.
  "female-1": "ar-SA-ZariyahNeural",
  "female-2": "ar-AE-FatimaNeural",
} as const;
export type TtsVoiceKey = keyof typeof TTS_DIALOGUE_VOICES;

export function isTtsVoiceKey(value: unknown): value is TtsVoiceKey {
  return typeof value === "string" && Object.hasOwn(TTS_DIALOGUE_VOICES, value);
}
export const TTS_OUTPUT_FORMAT = "audio-24khz-96kbitrate-mono-mp3";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function buildSsml(text: string, voice?: TtsVoiceKey): string {
  const german = GERMAN_TEXTS.has(text);
  return `
      <speak version="1.0"
             xmlns="http://www.w3.org/2001/10/synthesis"
             xml:lang="${german ? "de-DE" : "ar-SA"}">
        <voice name="${german ? TTS_VOICE_GERMAN : voice ? TTS_DIALOGUE_VOICES[voice] : TTS_VOICE}">
          <prosody rate="-8%">
            ${endsInTanwin(text) ? withCutTail(escapeXml(text)) : escapeXml(text)}
          </prosody>
        </voice>
      </speak>
    `.trim();
}
