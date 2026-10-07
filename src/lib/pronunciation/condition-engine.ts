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
//     (A1 words that begin with أَ / إِ / أُ). See initialVowel().
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

function normalizedText(value: string) {
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
  let index = 0;
  while (index < phonemes.length && INITIAL_HAMZA.has(phonemes[index]!)) index++;
  return VOWEL_QUALITY[phonemes[index] ?? ""] ?? null;
}

function hasPhonemes(phonemes: string[], expected: string[]) {
  return expected.every((phoneme) => phoneme.split("|").some((alternative) => phonemes.includes(alternative)));
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
  context: ConditionContext & { target: string }
): ConditionEvaluation | null {
  const letterRules = (CONDITION_RULES as Record<string, Record<string, Rule>>)[context.target];
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
