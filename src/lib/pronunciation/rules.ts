import letterConditions from "./letter_conditions.json";
import soundConditions from "./sound_conditions.json";
import vocabularyConditions from "./vocabulary_conditions.json";

export type Rule = {
  conditions: string[];
  message: string;
};

export type RuleSet = Record<string, Rule>;

/** Rules keyed by pronunciation target (the Azure reference text). */
export const LETTER_RULES = letterConditions as Record<string, RuleSet>;

/**
 * Alif addition: rules for whole vocabulary words. They use the exact
 * condition syntax and the same 70 % Azure threshold as the letter rules, so
 * the unchanged condition engine evaluates them.
 */
export const VOCABULARY_RULES = vocabularyConditions as Record<string, RuleSet>;

function mergeRules(...sources: Array<Record<string, RuleSet>>): Record<string, RuleSet> {
  const merged: Record<string, RuleSet> = {};
  for (const source of sources) {
    for (const [target, rules] of Object.entries(source)) {
      // A vocabulary entry must never silently replace a letter's rules.
      if (Object.prototype.hasOwnProperty.call(merged, target)) {
        throw new Error(`Duplicate pronunciation rules for target "${target}".`);
      }
      merged[target] = rules;
    }
  }
  return merged;
}

/**
 * A1 addition: rules for the vocalised sounds "أَ", "إِ", "أُ". They are decided
 * by the vowel IQRA hears (a / i / u, short or long, and neither of the other
 * two). Azure accuracy is not used: with real Azure, a clean إِ scored 100
 * against the أَ and أُ references and a clean أَ only 56 against its own, while
 * IQRA reported the right vowel every time. Same condition syntax, unchanged
 * engine; an empty IQRA result matches no rule (service message, not a mistake).
 */
export const SOUND_RULES = soundConditions as Record<string, RuleSet>;

export const CONDITION_RULES: Record<string, RuleSet> = mergeRules(LETTER_RULES, VOCABULARY_RULES, SOUND_RULES);

export function hasRulesFor(target: string): boolean {
  return Object.prototype.hasOwnProperty.call(CONDITION_RULES, target);
}
