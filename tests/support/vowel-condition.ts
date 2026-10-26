const QUALITY_TOKENS = {
  a: ["a", "aa", "A", "AA"],
  i: ["i", "ii", "I", "II"],
  u: ["u", "uu", "U", "UU"],
} as const;

/**
 * Writes the list form of an initial-vowel condition as its short form, so a
 * test can compare either: "iqra_initial_vowel == ['i|ii|I|II|iey']" →
 * "iqra_initial_vowel == i" when the list holds every short, long and
 * emphatic token of each vowel it names (other tokens are ignored); two
 * vowels read "i|u" (إصبع accepts both). Any other condition is returned unchanged.
 */
export function shortVowelCondition(condition: string): string {
  const match = condition.match(/^iqra_initial_vowel\s*(==|!=)\s*\[(.*)\]$/);
  if (!match) return condition;
  const tokens = match[2]!.replace(/['\s]/g, "").split(/[|,]/);
  const vowels = (Object.keys(QUALITY_TOKENS) as Array<keyof typeof QUALITY_TOKENS>).filter((vowel) =>
    QUALITY_TOKENS[vowel].some((token) => tokens.includes(token))
  );
  if (vowels.length === 0 || !vowels.every((vowel) => QUALITY_TOKENS[vowel].every((token) => tokens.includes(token)))) return condition;
  return `iqra_initial_vowel ${match[1]} ${vowels.join("|")}`;
}
