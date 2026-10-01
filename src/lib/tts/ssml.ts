// Same voice, prosody and output format as the original /api/tts.
export const TTS_VOICE = "ar-SA-ZariyahNeural";
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
  return `
      <speak version="1.0"
             xmlns="http://www.w3.org/2001/10/synthesis"
             xml:lang="ar-SA">
        <voice name="${TTS_VOICE}">
          <prosody rate="-8%">
            ${escapeXml(text)}
          </prosody>
        </voice>
      </speak>
    `.trim();
}
