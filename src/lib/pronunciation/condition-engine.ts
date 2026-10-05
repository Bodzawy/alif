// Ported unchanged from the original pronunciation system
// (masaar: src/lib/pronunciation/condition-engine.ts). The matching logic,
// the condition syntax and the "first rule whose conditions all hold wins"
// order are intentionally identical. The rules come from CONDITION_RULES:
// letter_conditions.json (verbatim copy) merged with Alif's vocabulary rules,
// see ./rules.ts.
//
// Two Alif additions, used only by the vocabulary rules (the letter rules do
// not contain them, so letters behave exactly as in Masaar):
//   - alternatives inside a phoneme list: ['T|TT'] holds when IQRA returned
//     "T" or "TT" (IQRA writes a doubled consonant for shadda);
//   - `iqra_phonemes is not empty`: lets a rule apply only when IQRA actually
//     returned phonemes, so an IQRA outage is not reported as a wrong sound.
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
