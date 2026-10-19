// Transliteration of vocalised Arabic in Alif's convention (as in Lektion 3
// and 4): sh, kh, gh, th, dh; ḥ ṣ ḍ ṭ ẓ; ʿ for ع and ʾ for the Hamza (not at
// the start of a word); long vowels ā ī ū; shadda doubles the consonant
// (a final ـِيّ is "iyy"); ة is "a" (before a vowel "at"); the article is
// "al-" or assimilated ("aṣ-ṣ…", "an-n…"). Each word starts with a capital
// letter unless `lower` is set. Only the signs that are written are read:
// a word without vowel signs comes out without vowels.

const CONSONANTS: Record<string, string> = {
  ب: "b", ت: "t", ث: "th", ج: "j", ح: "ḥ", خ: "kh", د: "d", ذ: "dh", ر: "r", ز: "z", س: "s", ش: "sh", ص: "ṣ", ض: "ḍ",
  ط: "ṭ", ظ: "ẓ", ع: "ʿ", غ: "gh", ف: "f", ق: "q", ك: "k", ل: "l", م: "m", ن: "n", ه: "h", و: "w", ي: "y",
  ء: "ʾ", أ: "ʾ", إ: "ʾ", ؤ: "ʾ", ئ: "ʾ",
};
const SUN = new Set("تثدذرزسشصضطظلن");
const FATHA = "َ";
const DAMMA = "ُ";
const KASRA = "ِ";
const SUKUN = "ْ";
const SHADDA = "ّ";
const TANWIN: Record<string, string> = { "ً": "an", "ٌ": "un", "ٍ": "in" };
const VOWEL: Record<string, string> = { [FATHA]: "a", [DAMMA]: "u", [KASRA]: "i" };
const isMark = (c: string) => /[ً-ْٰ]/.test(c);

type Unit = { base: string; marks: string };

function units(word: string): Unit[] {
  const out: Unit[] = [];
  for (const c of Array.from(word)) {
    if (isMark(c) && out.length) out[out.length - 1]!.marks += c;
    else out.push({ base: c, marks: "" });
  }
  return out;
}

function word(w: string, lower: boolean): string {
  const u = units(w);
  let i = 0;
  let out = "";
  let assimilated = false;
  // The article: ال (+ a sun letter: assimilated).
  if (u.length > 2 && (u[0]!.base === "ا" || u[0]!.base === "أ") && u[1]!.base === "ل" && !VOWEL[u[1]!.marks.replace(SUKUN, "")]) {
    const next = u[2]!;
    if (SUN.has(next.base) && (next.base !== "ل" || next.marks.includes(SHADDA))) {
      out = `a${CONSONANTS[next.base]}-`;
      assimilated = true;
    } else out = "al-";
    i = 2;
  } else if (u.length > 3 && u[0]!.base === "ا" && u[1]!.base === "ل" && u[1]!.marks === KASRA && u[2]!.base === "ا") {
    // الِاسْتِقْبَال: the article before a Hamzat al-wasl ("al-istiqbāl")
    out = "al-i";
    i = 3;
  } else if (u[0]?.base === "ل" && u[1]?.base === "ل") {
    // لِلْ… (li-l-) is left to the regular reading.
  }
  for (; i < u.length; i++) {
    const { base, marks } = u[i]!;
    const prev = u[i - 1];
    const next = u[i + 1];
    const first = i === 0;
    if (base === "ا") {
      if (first) {
        out += VOWEL[marks.replace(SHADDA, "")] ?? (marks ? "" : "a");
        continue;
      }
      const tanwin = Object.keys(TANWIN).find((m) => marks.includes(m));
      if (tanwin) {
        out = (out.endsWith("a") ? out.slice(0, -1) : out) + TANWIN[tanwin];
        continue;
      }
      if (prev && (prev.marks.includes(FATHA) || prev.marks.includes("ً"))) {
        if (prev.marks.includes("ً")) continue; // the Alif of a Tanwin -an
        out = out.endsWith("a") ? out.slice(0, -1) + "ā" : out + "ā";
      } else if (prev && !prev.marks) out += "ā";
      continue;
    }
    if (base === "آ") {
      out += first ? "ā" : "ʾā";
      continue;
    }
    if (base === "ى") {
      // after Tanwin -an (مُسْتَشْفًى) the ى is only the seat of the Tanwin
      if (prev?.marks.includes("\u064B")) continue;
      out = out.endsWith("a") ? out.slice(0, -1) + "ā" : out + "ā";
      continue;
    }
    if (base === "ة") {
      const v = Object.keys(VOWEL).find((m) => marks.includes(m));
      const t = Object.keys(TANWIN).find((m) => marks.includes(m));
      const stem = out.endsWith("a") ? out.slice(0, -1) : out;
      out = v ? stem + "at" + VOWEL[v] : t ? stem + "at" + TANWIN[t] : stem + "a";
      continue;
    }
    // Long ū / ī: و after Damma, ي after Kasra, without a vowel of their own.
    const ownVowel = Object.keys(VOWEL).some((m) => marks.includes(m)) || marks.includes(SHADDA) || Object.keys(TANWIN).some((m) => marks.includes(m));
    if (base === "و" && !ownVowel && !marks.includes(SUKUN) && prev?.marks.includes(DAMMA)) {
      out = out.endsWith("u") ? out.slice(0, -1) + "ū" : out + "ū";
      continue;
    }
    if (base === "ي" && !ownVowel && !marks.includes(SUKUN) && prev?.marks.includes(KASRA)) {
      out = out.endsWith("i") ? out.slice(0, -1) + "ī" : out + "ī";
      continue;
    }
    if (base === "ي" && marks.includes(SHADDA) && !next && prev?.marks.includes(KASRA)) {
      out += "yy";
      continue;
    }
    const c = CONSONANTS[base];
    if (c === undefined) {
      out += base;
      continue;
    }
    if (first && "ءأإؤئ".includes(base)) {
      // the Hamza at the start of a word is not written
    } else if (assimilated && i === 2) out += c;
    else out += marks.includes(SHADDA) ? c + c : c;
    const v = Object.keys(VOWEL).find((m) => marks.includes(m));
    if (v) out += VOWEL[v];
    else {
      const t = Object.keys(TANWIN).find((m) => marks.includes(m));
      if (t) out += TANWIN[t];
      else if (base === "إ") out += "i";
      else if (base === "أ" && first && !marks.includes(SUKUN)) out += "a";
    }
  }
  if (lower) return out;
  const start = out.search(/[a-zāīūḥṣḍṭẓ]/i);
  if (start < 0) return out;
  return out.slice(0, start) + out[start]!.toUpperCase() + out.slice(start + 1);
}

/** The transliteration of a vocalised Arabic word or phrase (punctuation kept: ؟ → ?, ، → ,). */
export function transliterate(arabic: string, options: { lower?: boolean } = {}): string {
  const parts = arabic.trim().split(/\s+/);
  let out = "";
  let sentenceStart = true;
  for (const [n, raw] of parts.entries()) {
    const open = raw.startsWith("(") ? "(" : "";
    const punct = (raw.match(/[)؟?.!،,:]+$/)?.[0] ?? "").replace(/؟/g, "?").replace(/،/g, ",");
    const bare = raw.replace(/^\(/, "").replace(/[)؟?.!،,:]+$/, "");
    let w = word(bare, options.lower ?? !sentenceStart);
    // Hamzat al-wasl after a vowel: "mā smuhu" → "ma-smuhu", "ṣabāḥu al-khayri" → "ṣabāḥu l-khayri".
    if (n > 0 && !open && /^ا[^\u064E-\u0650]/.test(bare) && /[aiuāīū]$/.test(out)) {
      if (/^ال/.test(bare)) w = w.replace(/^[aA]/, "");
      else {
        out = out.replace(/ā$/, "a").replace(/ī$/, "i").replace(/ū$/, "u") + "-";
        out += w.replace(/^[aiuAIU]/, "").toLowerCase() + punct;
        sentenceStart = /[?.!]/.test(punct);
        continue;
      }
    }
    out += (n > 0 ? " " : "") + open + w + punct;
    sentenceStart = /[?.!]/.test(punct);
  }
  return out;
}
