import { endsInTanwin, withCutTail } from "@/lib/tts/tanwin-cut";
import { GERMAN_CUES } from "@/lib/pronunciation/cues";

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

// Change this whenever the lesson pronunciation/SSML changes so an already
// open page does not keep reusing an older generated clip for the same text.
export const TTS_CACHE_REVISION = "tanwin-cut-v1";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

// Full-word IPA overrides make the tanwin audible on standalone tāʾ marbūṭa
// words; Azure otherwise applies pausal pronunciation and drops the ending.
const TANWEEN_IPA: Readonly<Record<string, string>> = {
  // The Alif step-1 word the user reported: force the final -un to be spoken.
  "أَبٌ": "ʔa.bun",
  "إِبْرَةٌ": "ʔib.ra.tun",
  "أُسْرَةٌ": "ʔus.ra.tun",
  "بِطَاقَةٌ": "bi.tˤaː.qa.tun",
  "بُنْدُقِيَّةٌ": "bun.du.qij.ja.tun",
  "تُفَّاحَةٌ": "tuf.faː.ħa.tun",
  "تُونَةٌ": "tuː.na.tun",
  "ثَلَاثَةٌ": "θa.laː.θa.tun",
  "جَرِيدَةٌ": "dʒa.riː.da.tun",
  "حَقِيبَةٌ": "ħa.qiː.ba.tun",
  "حَدِيقَةٌ": "ħa.diː.qa.tun",
  "حَفْلَةٌ": "ħaf.la.tun",
  "حِجَارَةٌ": "ħi.jaː.ra.tun",
  "حُجْرَةٌ": "ħu.jra.tun",
  "خَمْسَةٌ": "xam.sa.tun",
  "خُوذَةٌ": "xuː.ða.tun",
  "نَخْلَةٌ": "nax.la.tun",
};

/** Force audible tanwin on the A1 standalone letter-lesson words. */
function speechText(text: string) {
  if (endsInTanwin(text)) return withCutTail(escapeXml(text));
  const ipa = TANWEEN_IPA[text];
  if (ipa) return `<phoneme alphabet="ipa" ph="${ipa}">${escapeXml(text)}</phoneme>`;
  return text
    .split("ةٌ")
    .map(escapeXml)
    .join('<phoneme alphabet="ipa" ph="tun">ةٌ</phoneme>');
}

export function buildSsml(text: string, voice?: TtsVoiceKey): string {
  const german = GERMAN_TEXTS.has(text);
  return `
      <speak version="1.0"
             xmlns="http://www.w3.org/2001/10/synthesis"
             xml:lang="${german ? "de-DE" : "ar-SA"}">
        <voice name="${german ? TTS_VOICE_GERMAN : voice ? TTS_DIALOGUE_VOICES[voice] : TTS_VOICE}">
          <prosody rate="-8%">
            ${speechText(text)}
          </prosody>
        </voice>
      </speak>
    `.trim();
}
