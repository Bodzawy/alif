import { GERMAN_CUES } from "@/lib/pronunciation/cues";

// Same voice, prosody and output format as the original /api/tts.
export const TTS_VOICE = "ar-SA-ZariyahNeural";
/** Only for the German cues (e.g. "Super!"): an Arabic voice would mispronounce them. */
export const TTS_VOICE_GERMAN = "de-DE-KatjaNeural";
const GERMAN_TEXTS: ReadonlySet<string> = new Set(Object.values(GERMAN_CUES));
export const TTS_OUTPUT_FORMAT = "audio-24khz-96kbitrate-mono-mp3";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function buildSsml(text: string): string {
  const german = GERMAN_TEXTS.has(text);
  return `
      <speak version="1.0"
             xmlns="http://www.w3.org/2001/10/synthesis"
             xml:lang="${german ? "de-DE" : "ar-SA"}">
        <voice name="${german ? TTS_VOICE_GERMAN : TTS_VOICE}">
          <prosody rate="-8%">
            ${escapeXml(text)}
          </prosody>
        </voice>
      </speak>
    `.trim();
}
