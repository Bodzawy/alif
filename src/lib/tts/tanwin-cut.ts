// Azure always reads the LAST word of a text in pausal form (waqf) and drops
// its Tanwin – whether it is written بَيْتٌ, بَيْتُنْ or given as IPA. Inside a
// sentence it speaks the Tanwin. So a single word with Tanwin is sent with a
// short word after it and a bookmark between the two:
//   بَيْتٌ<bookmark mark="tanwin-end"/> وَ
// /api/tts asks Azure where the bookmark is in the audio and cuts the audio
// there: the learner hears بَيْتٌ with its -un and nothing after it.

export const TANWIN_CUT_MARK = "tanwin-end";
const TAIL = `<bookmark mark="${TANWIN_CUT_MARK}"/> وَ`;
const TRAILING_PUNCT = /[.،؟?!:]+$/;
// The word ends in Tanwin (a Shadda may stand before or after it), or in ـًا / ـًى.
const ENDS_IN_TANWIN = /(?:[ً-ٍ]ّ?|ّ[ً-ٍ]|ً[اى]|[اى]ً)$/u;

/** A single word (no space) whose last sound is Tanwin. */
export function endsInTanwin(text: string): boolean {
  const word = text.replace(TRAILING_PUNCT, "");
  return word.length > 0 && !/\s/.test(word) && ENDS_IN_TANWIN.test(word);
}

/** The SSML text for such a word (already XML-escaped): the word, the bookmark, the short word after it. */
export function withCutTail(escapedWord: string): string {
  return `${escapedWord}${TAIL}`;
}

/** The same SSML without the tail – for a plain request when the cut cannot be made. */
export function withoutCutTail(ssml: string): string {
  return ssml.replace(TAIL, "");
}

/** Audio after the bookmark that is kept (the end of the -n), and the fade-out length. */
const KEEP_AFTER_MS = 25;
const FADE_MS = 30;

/**
 * Cuts a 16-bit mono PCM WAV (as Azure's Riff24Khz16BitMonoPcm) at `seconds`
 * (+ KEEP_AFTER_MS), fades the last FADE_MS out and returns a valid WAV.
 */
export function cutWav(wav: Buffer, seconds: number): Buffer {
  if (wav.toString("ascii", 0, 4) !== "RIFF" || wav.toString("ascii", 8, 12) !== "WAVE") throw new Error("not a WAV file");
  let at = 12;
  let rate = 0;
  let bits = 0;
  let channels = 0;
  while (at + 8 <= wav.length) {
    const id = wav.toString("ascii", at, at + 4);
    const size = wav.readUInt32LE(at + 4);
    if (id === "fmt ") {
      channels = wav.readUInt16LE(at + 10);
      rate = wav.readUInt32LE(at + 12);
      bits = wav.readUInt16LE(at + 22);
    }
    if (id === "data") {
      if (bits !== 16 || channels !== 1 || !rate) throw new Error(`unsupported WAV: ${channels} ch, ${bits} bit`);
      const start = at + 8;
      const available = Math.min(size, wav.length - start) >> 1;
      const keep = Math.min(available, Math.round((seconds + KEEP_AFTER_MS / 1000) * rate));
      const pcm = Buffer.from(wav.subarray(start, start + keep * 2));
      const fade = Math.min(keep, Math.round((FADE_MS / 1000) * rate));
      for (let i = 0; i < fade; i++) {
        const offset = (keep - fade + i) * 2;
        pcm.writeInt16LE(Math.round(pcm.readInt16LE(offset) * (1 - (i + 1) / fade)), offset);
      }
      const header = Buffer.alloc(44);
      header.write("RIFF", 0, "ascii");
      header.writeUInt32LE(36 + pcm.length, 4);
      header.write("WAVEfmt ", 8, "ascii");
      header.writeUInt32LE(16, 16);
      header.writeUInt16LE(1, 20);
      header.writeUInt16LE(1, 22);
      header.writeUInt32LE(rate, 24);
      header.writeUInt32LE(rate * 2, 28);
      header.writeUInt16LE(2, 32);
      header.writeUInt16LE(16, 34);
      header.write("data", 36, "ascii");
      header.writeUInt32LE(pcm.length, 40);
      return Buffer.concat([header, pcm]);
    }
    at += 8 + size + (size % 2);
  }
  throw new Error("WAV without data");
}
