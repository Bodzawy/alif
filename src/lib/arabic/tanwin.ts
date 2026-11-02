// The words of "Wörter" in the A1 letter entries (and the Lektion 1 words of
// "Ergänzen" / "Hören") are spoken with Tanwin (بَيْتٌ, بِطَاقَةٌ, أُمٌّ, مُسْتَشْفًى),
// and what is spoken is also what is shown: the card shows the word with its
// Tanwin and the transliteration ends in -un / -an / -in (tanwinWord). Only the
// pronunciation target (unvocalised) is built from the pausal word – it is the
// same either way, so the rules in vocabulary_conditions.json are untouched.
// No Tanwin for a word that cannot take it:
//   – with the article ال (الْيُونَان, الصِّين),
//   – ending in ا: pronouns, names, question words (أَنَا, دِينَا, لِمَاذَا؟),
//   – ending in a long ū / ī without Shadda: indeclinable loanwords (رَادْيُو,
//     كِيلُو, شِيبْسِي) – a Nisba ـِيّ needs its Shadda (see SPOKEN),
//   – the diptotes in NO_TANWIN (names, broken plural patterns, ـَاء of the feminine).

const MARK = /[ً-ْٰ]/;
const HARAKAT = /[ً-ْٰ]/g;
const TANWIN = /[ً-ٍ]/;
const FATHA = "َ";
const DAMMA = "ُ";
const KASRA = "ِ";
const FATHATAN = "ً";
const DAMMATAN = "ٌ";
const SHADDA = "ّ";
const TRAILING_PUNCT = /[.،؟?!:]+$/;

/** Diptotes (ممنوع من الصرف) among the A1 words: they never take Tanwin. */
export const NO_TANWIN: ReadonlySet<string> = new Set([
  "وِئَام", // female name
  "هُدَى", // female name
  "طَمَاطِم", // pattern of صِيغَةُ مُنْتَهَى الْجُمُوعِ (فَعَالِل)
  "زُمَلَاء", // فُعَلَاء: ending in the Alif of the feminine (أَلِفُ التَّأْنِيثِ الْمَمْدُودَةُ)
  "أَحْمَر", // أَفْعَل of a colour
  "أَجْمَل", // أَفْعَل of the comparative
  "أَثْنَاء", // "during": used as an adverb, not with Tanwin
  // The vocabulary words of the later lessons (vocabularyTanwin, src/data/vocabulary-tanwin.ts):
  "أَبْيَض", "أَخْضَر", "أَزْرَق", "أَسْوَد", "أَصْفَر", // أَفْعَل of a colour
  "أَخَذَ", "نَطَقَ", "عَاش", "جَاب", // verbs (er lebte, er durchwanderte)
  "قِفْ", "لَاحِظْ", // imperatives
  "مِنْ", "مَعَ", "عِنْدَه", // particles
  "عَفَاف", // female name
  "شُبَاط", // month name: whether it takes Tanwin is disputed – kept pausal
  // Lektion 2 on, the words of Ergänzen, Buchstabieren, Quiz, tables and expressions (vocabularyTanwin):
  // names – female, ending in ة, of the pattern أَفْعَل, or foreign (also with a written Sukun),
  "مَدِيحَة", "زَيْنَب", "دُعَاء", "وَلَاء", "إِيمَان", "إِيمَانْ", "إِحْسَانْ", "هَادِيَة", "سِيزَارْ", "سُعَاد", "سَامِيَة", "أُمَيْمَة", "أَمِينَة", "سَارَة", "مُنَى", "نَجْوَى",
  "نَوَال", "نَوَالْ", "مَنَالْ", "نَازِكْ", "رَبَاب", "رَبَابْ", "إِسْتَر", "هَيْفَاء", "شَيْمَاء", "أَسْمَاء",
  "نَجْلَاء", "هِبَة", "هَانِم", "هُيَام", "إِلْهَام", "إِلْهَامْ", "أُسَامَة", "نِسْرِين", "حَنَانْ", "نَجْوَانْ",
  "أَحْمَد", "أَحْمَدْ", "أَمْجَد", "أَيْمَن", "أَشْرَف", "رِفْعَت", "نَشْأَت",
  "إِسْرَائِيل", "جِبْرَائِيل", "مِيخَائِيل", "جُورْج", "جِرْجِس", "شِكْسْبِير", "دَاوُد", "دَاوُدْ", "أَمُونْ",
  "يَحْيَى", "مُصْطَفَى",
  // countries and months,
  "مِصْر", "يُونَان", "يَنَايِر", "فِبْرَايِر", "مَارِس", "أَبْرِيل", "أُغُسْطُس", "سِبْتَمْبِر", "أُكْتُوبَر", "نُوفَمْبِر", "دِيسَمْبِر",
  // broken plurals of the patterns مَفَاعِل / مَفَاعِيل, فَعْلَاء of a colour, أَفْعَل,
  "دَوَاب", "تَمَاثِيل", "شَوَارِع", "ضَفَادِع", "مَلَابِس", "ضَمَائِر", "بَطَاطِس", "بَطَاطِسْ", "طَمَاطِمْ",
  "حَمْرَاء", "بَيْضَاء", "خَضْرَاء", "صَفْرَاء", "سَوْدَاء", "زَرْقَاء", "أَبْيَضْ",
  "أَفْضَل", "أَعْلَم", "أَظْهَر", "أَظْهَرْ", "آخَر",
  // verbs and imperatives,
  "تَدُقّ", "شَاهِدْ", "يَكْتُب", "يَجِد", "اِضْرِبْ", "اُدْخُلْ", "بَاضَتْ", "لَفَّ", "جَرَى", "خَاب", "خَابْ",
  // pronouns, particles, adverbs and words with a pronoun suffix,
  "أَنْتُمْ", "أَنْتُمْ؟", "أَنْتُنَّ", "أَنْتُنَّ؟", "هُنَّ", "هَلْ", "هُنَاك", "هُنَاكْ", "عَلَى", "أَمَام", "عِنْدَهُم", "اسْمَك", "جَدِّي", "أُمِّي",
  // a letter name,
  "ضَادْ",
  // duals and sound plurals (their ن is not a Tanwin).
  "اثْنَان", "جُنَيْهَان", "مِائَتَان", "أَلْفَان", "كِتَابَان", "آسِفُون", "أَلْمَان",
  "عِشْرُون", "ثَلَاثُون", "أَرْبَعُون", "خَمْسُون", "سِتُّون", "سَبْعُون", "ثَمَانُون", "تِسْعُون", "ثَلَاثِينْ",
]);

/** Words whose pausal spelling hides a sound that comes back with Tanwin: the doubled letter of a Nisba or of خَسّ. */
export const SPOKEN: Readonly<Record<string, string>> = {
  "هِنْدِي": "هِنْدِيٌّ",
  "يُوسُفِي": "يُوسُفِيٌّ",
  "خَس": "خَسٌّ",
  "حَارْ": "حَارٌّ",
  "ضَارْ": "ضَارٌّ",
};

/** The text spoken for a word: with Tanwin al-Damm (-un) when it can take Tanwin, otherwise unchanged. */
export function withTanwin(arabic: string): string {
  if (SPOKEN[arabic]) return SPOKEN[arabic];
  if (NO_TANWIN.has(arabic)) return arabic;
  const punct = TRAILING_PUNCT.exec(arabic)?.[0] ?? "";
  const word = arabic.slice(0, arabic.length - punct.length);
  const bare = word.replace(HARAKAT, "");
  if (!bare || /\s/.test(word) || bare.startsWith("ال") || TANWIN.test(word)) return arabic;

  // The last letter and its marks.
  const chars = Array.from(word);
  let at = chars.length - 1;
  while (at > 0 && MARK.test(chars[at]!)) at--;
  const stem = chars.slice(0, at);
  const letter = chars[at]!;
  const marks = chars.slice(at + 1).join("");

  if (letter === "ا") return arabic;
  // A long ū / ī: و after Damma, ي after Kasra, without a mark of its own (but ظَبْي → ظَبْيٌ).
  const longVowel = (letter === "و" && stem.at(-1) === DAMMA) || (letter === "ي" && stem.at(-1) === KASRA);
  if (longVowel && !MARK.test(marks)) return arabic;
  if (letter === "ى") {
    // مُسْتَشْفَى → مُسْتَشْفًى: the Fatha before the Alif maqsura becomes Fathatan.
    const before = stem.join("");
    return before.endsWith(FATHA) ? `${before.slice(0, -1)}${FATHATAN}${letter}${punct}` : arabic;
  }
  // The pausal ending (Sukun or a vowel) gives way to -un; a Shadda stays (after the vowel sign, as everywhere in the data).
  return `${stem.join("")}${letter}${DAMMATAN}${marks.includes(SHADDA) ? SHADDA : ""}${punct}`;
}

const TANWIN_ENDING: Record<string, string> = { "ً": "an", "ٌ": "un", "ٍ": "in" };
const DIGRAPH = /(sh|kh|th|dh|gh|ch)$/i;

/**
 * The transliteration of a word that gets its Tanwin (`spoken` = withTanwin(`pausal`)), kept in the
 * hand-written convention of the lesson (e.g. "Dsch", "Ch" in Lektion 1): بَيْت "Bayt" → "Baytun",
 * بِطَاقَة "Biṭāqa" → "Biṭāqatun", فُرْشَاة "Furshāh" → "Furshātun", مُسْتَشْفَى "Mustashfā" → "Mustashfan",
 * هِنْدِي "Hindī" → "Hindiyyun", خَس "Chas" → "Chassun".
 */
export function tanwinTransliteration(transliteration: string, pausal: string, spoken: string): string {
  const mark = Array.from(spoken).reverse().find((c) => TANWIN_ENDING[c]);
  if (spoken === pausal || !mark) return transliteration;
  const ending = TANWIN_ENDING[mark]!;
  const word = spoken.replace(TRAILING_PUNCT, "");
  const t = transliteration;
  if (/ة[ً-ٍ]$/.test(word)) return t.replace(/āh$/, "āt").replace(/a$/, "at") + ending;
  if (/[ً-ٍ]ى$/.test(word)) return t.replace(/ā$/, "") + ending;
  // a Nisba ـِيّ: "…iyy" (or "…ī" when the Shadda was not written) + -un
  if (/ِيّ?[ً-ٍ]ّ?$/.test(word)) return t.replace(/ī$/, "iyy") + ending;
  // a Shadda that only the spoken word has (خَس → خَسٌّ): the last consonant is doubled
  if (spoken.includes(SHADDA) && !pausal.includes(SHADDA)) {
    const last = DIGRAPH.exec(t)?.[0] ?? t.slice(-1);
    return t + last.toLowerCase() + ending;
  }
  return t + ending;
}

/**
 * A word that can take Tanwin, as shown and spoken: `arabic` and `spoken` with the Tanwin, the
 * transliteration with -un / -an / -in. The pronunciation target must still be made from the pausal
 * word (it is the same without harakat).
 */
export function tanwinWord(pausal: string, transliteration: string): { arabic: string; spoken: string; transliteration: string } {
  const spoken = withTanwin(pausal);
  return { arabic: spoken, spoken, transliteration: tanwinTransliteration(transliteration, pausal, spoken) };
}
