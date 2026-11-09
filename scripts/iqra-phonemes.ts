// Text → expected IQRA phonemes for the IQRA reliability study
// (scripts/measure-iqra.ts, scripts/analyse-iqra.ts). No server imports, so
// the analysis can recompute expected phonemes with the current converter.
import { longVowelSound } from "@/lib/tts/long-vowel";

// Text → expected IQRA phonemes. IQRA writes Buckwalter-like tokens: one token
// per consonant ("b", "$" for ش, "<" for the hamza), a doubled token for Shadda
// ("bb"), "a"/"i"/"u" and long "aa"/"ii"/"uu" (capitals A/U … next to emphatic
// letters). This is the measuring stick of phase 1 – phase 3 replaces it with a
// tested module.

export const CONSONANT: Record<string, string> = {
  ء: "<", أ: "<", إ: "<", آ: "<", ؤ: "<", ئ: "<",
  ب: "b", ت: "t", ث: "^", ج: "j", ح: "H", خ: "x", د: "d", ذ: "*", ر: "r", ز: "z", س: "s", ش: "$",
  ص: "S", ض: "D", ط: "T", ظ: "Z", ع: "E", غ: "g", ف: "f", ق: "q", ك: "k", ل: "l", م: "m", ن: "n",
  ه: "h", و: "w", ي: "y", ة: "t",
};
export const FATHA = "َ", DAMMA = "ُ", KASRA = "ِ", SHADDA = "ّ";
export const FATHATAN = "ً", DAMMATAN = "ٌ", KASRATAN = "ٍ";
export const SHORT: Record<string, string> = { [FATHA]: "a", [KASRA]: "i", [DAMMA]: "u" };
export const TANWIN: Record<string, string> = { [FATHATAN]: "a", [KASRATAN]: "i", [DAMMATAN]: "u" };
const MARKS = /[ً-ْٰ]/;

/** A letter with its marks, e.g. { base: "ب", marks: "َّ" }. */
export type Unit = { base: string; marks: string };
export function units(text: string): Unit[] {
  const out: Unit[] = [];
  for (const ch of Array.from(text)) {
    if (MARKS.test(ch) && out.length) out[out.length - 1]!.marks += ch;
    // آ is أَ + ا (hamza, then a long ā)
    else if (ch === "آ") out.push({ base: "أ", marks: FATHA }, { base: "ا", marks: "" });
    else if (CONSONANT[ch] || ch === "ا" || ch === "ى" || ch === " ") out.push({ base: ch, marks: "" });
  }
  return out;
}
export const join = (us: Unit[]) => us.map((u) => u.base + u.marks).join("");
export const vowelOf = (u: Unit) => Array.from(u.marks).map((m) => SHORT[m]).find(Boolean);
export const longFor: Record<string, string> = { a: "ا", i: "ي", u: "و" };

const SUN = new Set(Array.from("تثدذرزسشصضطظلن"));

/**
 * Expected phonemes of a vocalised (or partly vocalised) text, read pausally like the app's TTS:
 * the article ال is "< a l" (before a sun letter "< a" + the doubled letter), a final ة is "a h",
 * a final Shadda without vowel is a single consonant, a final short vowel is not spoken.
 */
export function expectedPhonemes(text: string): string[] {
  // A lone sound (بَ) is spoken long by the app's TTS (بَا, src/lib/tts/long-vowel.ts).
  const us = units(longVowelSound(text) ?? text);
  const out: string[] = [];
  us.forEach((u, i) => {
    if (u.base === " ") return;
    const prev = us[i - 1];
    const next = us[i + 1];
    const v = vowelOf(u);
    const wordStart = !prev || prev.base === " ";
    // The article: ا (hamzat al-wasl) + ل at the start of a word.
    if (wordStart && u.base === "ا" && next?.base === "ل") {
      out.push("<", "a");
      return;
    }
    if (u.base === "ل" && prev?.base === "ا" && (i === 1 || us[i - 2]?.base === " ") && next && SUN.has(next.base) && next.marks.includes(SHADDA)) {
      return; // assimilated: الشَّمْس → < a $$ …
    }
    // Madd letters: ا / ى after a, ي after i, و after u (no own vowel) lengthen the vowel before.
    const isMadd = !u.marks && prev && ((u.base === "ا" || u.base === "ى") ? true : (u.base === "ي" && vowelOf(prev) === "i") || (u.base === "و" && vowelOf(prev) === "u"));
    if (isMadd || u.base === "ا" || u.base === "ى") {
      if (prev && Array.from(prev.marks).some((m) => TANWIN[m])) return; // ـًا / ـًى: the letter after the tanwin is silent
      const last = out.at(-1);
      if (last && /^[aiu]$/.test(last)) out[out.length - 1] = last + last;
      else if (u.base !== "ا" || i > 0) out.push("aa");
      return;
    }
    const isLast = !next || next.base === " " || (next.base === "ا" && !us[i + 2]);
    if (u.base === "ة" && isLast && !Array.from(u.marks).some((m) => TANWIN[m] || SHORT[m])) {
      if (out.at(-1) !== "a") out.push("a");
      out.push("h"); // pausal ة: …ah
      return;
    }
    // A final Nisba ـِيّ in pause: a long ī (جُنْدِيّ → … d ii).
    if (u.base === "ي" && isLast && u.marks.includes(SHADDA) && !Array.from(u.marks).some((m) => TANWIN[m]) && prev && vowelOf(prev) === "i") {
      out[out.length - 1] = "ii";
      return;
    }
    const c = CONSONANT[u.base]!;
    const tanwin = Array.from(u.marks).map((m) => TANWIN[m]).find(Boolean);
    // A doubled consonant at the very end of a pausal word is spoken single (أُمّ → < u m).
    out.push(u.marks.includes(SHADDA) && !(isLast && !tanwin && us.length > 1) ? c + c : c);
    if (tanwin) out.push(tanwin, "n");
    else if (v && !(isLast && !nextIsMadd(us, i))) out.push(v);
    else if (v && isLast && us.length <= 2) out.push(v); // a lone sound such as بَ is spoken with its vowel
  });
  return out;
}
export const nextIsMadd = (us: Unit[], i: number) => {
  const n = us[i + 1];
  return !!n && !n.marks && (n.base === "ا" || n.base === "ى" || n.base === "ي" || n.base === "و");
};
