import { longVowelSound } from "@/lib/tts/long-vowel";
import { endsInTanwin, withCutTail } from "@/lib/tts/tanwin-cut";
import { GERMAN_CUES } from "@/lib/pronunciation/cues";

// Same voice, prosody and output format as the original /api/tts.
export const TTS_VOICE = "ar-SA-ZariyahNeural";
/** Only for German texts (the cues, e.g. "Super!", and unrecorded Formen narration): an Arabic voice would mispronounce them. */
export const TTS_VOICE_GERMAN = "de-DE-KatjaNeural";
/** The learner's language (src/lib/locale.ts): instructions and cues in a voice of that language. */
export const TTS_LOCALE_VOICES = {
  de: { lang: "de-DE", voice: TTS_VOICE_GERMAN },
  en: { lang: "en-US", voice: "en-US-JennyNeural" },
  tr: { lang: "tr-TR", voice: "tr-TR-EmelNeural" },
  sq: { lang: "sq-AL", voice: "sq-AL-AnilaNeural" },
  fr: { lang: "fr-FR", voice: "fr-FR-DeniseNeural" },
} as const;
export type TtsLocale = keyof typeof TTS_LOCALE_VOICES;

export function isTtsLocale(value: unknown): value is TtsLocale {
  return typeof value === "string" && Object.hasOwn(TTS_LOCALE_VOICES, value);
}
const GERMAN_TEXTS: ReadonlySet<string> = new Set(Object.values(GERMAN_CUES));
const ARABIC_SCRIPT = /[\u0600-\u06FF]/;

/** German: a cue, or any (allowed) text without Arabic script. */
export function isGermanText(text: string) {
  return GERMAN_TEXTS.has(text) || !ARABIC_SCRIPT.test(text);
}

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
  // A lone letter with a short vowel is read with the long vowel (بَ → بَا).
  const longVowel = longVowelSound(text);
  if (longVowel) return escapeXml(longVowel);
  if (endsInTanwin(text)) return withCutTail(escapeXml(text));
  const ipa = TANWEEN_IPA[text];
  if (ipa) return `<phoneme alphabet="ipa" ph="${ipa}">${escapeXml(text)}</phoneme>`;
  return text
    .split("ةٌ")
    .map(escapeXml)
    .join('<phoneme alphabet="ipa" ph="tun">ةٌ</phoneme>');
}

/** `lang`: the learner's language for a text without Arabic script (default German). */
export function buildSsml(text: string, voice?: TtsVoiceKey, lang: TtsLocale = "de"): string {
  const local = isGermanText(text) ? TTS_LOCALE_VOICES[lang] : null;
  return `
      <speak version="1.0"
             xmlns="http://www.w3.org/2001/10/synthesis"
             xml:lang="${local ? local.lang : "ar-SA"}">
        <voice name="${local ? local.voice : voice ? TTS_DIALOGUE_VOICES[voice] : TTS_VOICE}">
          <prosody rate="-8%">
            ${speechText(text)}
          </prosody>
        </voice>
      </speak>
    `.trim();
}
