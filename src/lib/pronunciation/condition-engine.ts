// Ported unchanged from the original pronunciation system
// (masaar: src/lib/pronunciation/condition-engine.ts). The matching logic,
// the condition syntax and the "first rule whose conditions all hold wins"
// order are intentionally identical. The rules come from CONDITION_RULES:
// letter_conditions.json (verbatim copy) merged with Alif's vocabulary rules,
// see ./rules.ts.
//
// Three Alif additions, used only by the vocabulary rules (the letter rules do
// not contain them, so letters behave exactly as in Masaar):
//   - alternatives inside a phoneme list: ['T|TT'] holds when IQRA returned
//     "T" or "TT" (IQRA writes a doubled consonant for shadda);
//   - `iqra_phonemes is not empty`: lets a rule apply only when IQRA actually
//     returned phonemes, so an IQRA outage is not reported as a wrong sound;
//   - `iqra_initial_vowel == a|i|u` (or `!=`): the quality of the vowel the
//     word begins with in IQRA's output, e.g. "a" for ["<", "aa", "b", "a"]
//     (A1 words that begin with أَ / إِ / أُ). See initialVowel(). The list
//     form `iqra_initial_vowel == ['i|ii|I|II']` compares the token itself.
import { CONDITION_RULES, type Rule } from "./rules";

export type ConditionContext = {
  azureAccuracy: number;
  azureRecognized: string;
  iqraPhonemes: string[];
};

export type ConditionEvaluation = {
  rule: string;
  message: string;
  conditions: string[];
};

/** Letters only: without harakat, spaces and punctuation. */
export function normalizedText(value: string) {
  return value
    .replace(/[ً-ٰٟ]/g, "")
    .replace(/[^ء-يa-zA-Z]/g, "");
}

// IQRA's vowel tokens (sws_arabic.txt): short, long (doubled) and the
// emphatic variants written in capitals. Everything else is a consonant or
// hamza ("<"), e.g. ["<", "u", "*", "u", "n"] for أُذُن.
const VOWEL_QUALITY: Record<string, "a" | "i" | "u"> = {
  a: "a", aa: "a", A: "a", AA: "a",
  i: "i", ii: "i", I: "i", II: "i",
  u: "u", uu: "u", U: "u", UU: "u",
};

// IQRA writes the word-initial hamza as "<" (doubled "<<"), and sometimes as
// "h" – e.g. ["h", "uu"] for أُ.
const INITIAL_HAMZA = new Set(["<", "<<", "h"]);

/**
 * Quality (a / i / u) of the vowel the utterance begins with: the first token
 * after an initial hamza. null when that token is not a vowel – IQRA heard no
 * initial vowel (e.g. ["b", "r", "a"] or ["<", "*", "u", "n"]); a vowel from a
 * later syllable never counts as the initial one.
 */
export function initialVowel(phonemes: string[]): "a" | "i" | "u" | null {
  return VOWEL_QUALITY[initialToken(phonemes) ?? ""] ?? null;
}

/** The first token after an initial hamza, e.g. "u" for ["<", "u", "*", "u", "n"]. */
function initialToken(phonemes: string[]): string | null {
  let index = 0;
  while (index < phonemes.length && INITIAL_HAMZA.has(phonemes[index]!)) index++;
  return phonemes[index] ?? null;
}

/**
 * Every expected token (alternatives with |) is found, each in a token of its own: ['n','n'] needs two n –
 * e.g. أَرْنَبٌ "< a r n a b u n", whose Tanwin n must not stand in for the n of the word.
 */
function hasPhonemes(phonemes: string[], expected: string[]) {
  const used = new Set<number>();
  // The narrowest alternatives first, so that n|nn does not take the only n a plain n needs.
  const ordered = [...expected].sort((a, b) => a.split("|").length - b.split("|").length);
  return ordered.every((phoneme) => {
    const alternatives = phoneme.split("|");
    const index = phonemes.findIndex((token, i) => !used.has(i) && alternatives.includes(token));
    if (index < 0) return false;
    used.add(index);
    return true;
  });
}

export function matchesCondition(condition: string, context: ConditionContext) {
  const accuracy = condition.match(/^azure_accuracy\s*(>=|<=|==|!=|>|<)\s*(\d+)$/);
  if (accuracy) {
    const [, operator, rawValue] = accuracy;
    const value = Number(rawValue);
    switch (operator) {
      case ">=": return context.azureAccuracy >= value;
      case "<=": return context.azureAccuracy <= value;
      case "==": return context.azureAccuracy === value;
      case "!=": return context.azureAccuracy !== value;
      case ">": return context.azureAccuracy > value;
      case "<": return context.azureAccuracy < value;
    }
  }

  const recognized = condition.match(/^azure_recognized\s*(==|!=)\s*(.+)$/);
  if (recognized) {
    const [, operator, expected] = recognized;
    const isMatch = normalizedText(context.azureRecognized) === normalizedText((expected ?? "").trim());
    return operator === "==" ? isMatch : !isMatch;
  }

  if (/^iqra_phonemes\s+is not empty$/.test(condition)) {
    return context.iqraPhonemes.length > 0;
  }

  const vowel = condition.match(/^iqra_initial_vowel\s*(==|!=)\s*([aiu])$/);
  if (vowel) {
    const [, operator, expected] = vowel;
    const isMatch = initialVowel(context.iqraPhonemes) === expected;
    return operator === "==" ? isMatch : !isMatch;
  }

  // List form: iqra_initial_vowel == ['i|ii|I|II'] holds when the first token
  // after the initial hamza is one of the listed tokens.
  const vowelTokens = condition.match(/^iqra_initial_vowel\s*(==|!=)\s*(\[.*\])$/);
  if (vowelTokens) {
    const [, operator, rawExpected] = vowelTokens;
    const expected = (rawExpected ?? "").replace(/[\[\]'\s]/g, "").split(/[|,]/).filter(Boolean);
    const isMatch = expected.includes(initialToken(context.iqraPhonemes) ?? "");
    return operator === "==" ? isMatch : !isMatch;
  }

  // The end of the utterance, token by token: iqra_phonemes ends with ['u|U','n|nn'] holds when the last
  // token is n or nn and the one before it u or U – the Tanwin -un (بَيْتٌ "b a y t u n"; not تِين "t ii n").
  const ending = condition.match(/^iqra_phonemes\s*(does not end with|ends with)\s*(\[.*\])$/);
  if (ending) {
    const [, operator, rawExpected] = ending;
    const expected = (rawExpected ?? "").replace(/[\[\]'\s]/g, "").split(",").filter(Boolean);
    const tail = context.iqraPhonemes.slice(-expected.length);
    const found = tail.length === expected.length && expected.every((token, i) => token.split("|").includes(tail[i]!));
    return operator === "ends with" ? found : !found;
  }

  const phoneme = condition.match(/^iqra_phonemes\s*(does not contain|contains)\s*(.+)$/);
  if (phoneme) {
    const [, operator, rawExpected] = phoneme;
    const expected = (rawExpected ?? "")
      .replace(/[\[\]'\s]/g, "")
      .split(",")
      .filter(Boolean);
    const found = hasPhonemes(context.iqraPhonemes, expected);
    return operator === "contains" ? found : !found;
  }

  return false;
}

export function evaluateLetterConditions(
  context: ConditionContext & { target: string },
  /** Another rule set for the same targets (ALIF Speaking: BEGINNER_RULES). */
  rules: Record<string, Record<string, Rule>> = CONDITION_RULES
): ConditionEvaluation | null {
  const letterRules = rules[context.target];
  if (!letterRules) return null;

  for (const [rule, definition] of Object.entries(letterRules)) {
    if (definition.conditions.every((condition) => matchesCondition(condition, context))) {
      return {
        rule,
        message: definition.message,
        conditions: definition.conditions,
      };
    }
  }

  return null;
}

const IQRA_CONDITION = /^iqra_/;

/**
 * Alif addition (speed): the rule evaluateLetterConditions will match whatever
 * IQRA returns, decided from Azure alone – or null when IQRA's answer could
 * still change it. Rules are tried in the engine's order: a rule whose Azure
 * conditions fail can never match; the first rule whose Azure conditions hold
 * decides only when it has no IQRA condition. When no rule can match, the
 * fallback message depends on IQRA, so that is not decided here either.
 * E.g. azure_accuracy 52 for باء → "wrong" (azure_accuracy < 70), before IQRA has answered.
 */
export function ruleDecidedWithoutIqra(context: Omit<ConditionContext, "iqraPhonemes"> & { target: string }): string | null {
  const letterRules = (CONDITION_RULES as Record<string, Record<string, Rule>>)[context.target];
  if (!letterRules) return null;

  for (const [rule, definition] of Object.entries(letterRules)) {
    const azureOnly = definition.conditions.filter((condition) => !IQRA_CONDITION.test(condition));
    if (!azureOnly.every((condition) => matchesCondition(condition, { ...context, iqraPhonemes: [] }))) continue;
    return definition.conditions.some((condition) => IQRA_CONDITION.test(condition)) ? null : rule;
  }

  return null;
}
