import { describe, expect, it } from "vitest";

import { BEGINNER_RULES, CONDITION_RULES } from "@/lib/pronunciation/rules";

// beginner_conditions.json (ALIF Speaking): one entry per target of the
// ALIF Pronunciation rules, gentle conditions only, in the engine's syntax.

const KNOWN = [/^iqra_phonemes contains \[('[^']+',?)+\]$/, /^iqra_phonemes is not empty$/, /^iqra_initial_vowel == ([aiu]|\['[^']+'\])$/];

describe("beginner_conditions.json", () => {
  it("covers the targets of the ALIF Pronunciation rules and nothing else", () => {
    for (const target of Object.keys(BEGINNER_RULES)) expect(CONDITION_RULES[target], target).toBeDefined();
    expect(Object.keys(BEGINNER_RULES).length).toBeGreaterThan(1000);
  });

  it("every target: excellent first, then needs_improvement; only gentle conditions the engine knows", () => {
    for (const [target, rules] of Object.entries(BEGINNER_RULES)) {
      expect(Object.keys(rules), target).toEqual(["excellent", "needs_improvement"]);
      for (const rule of Object.values(rules)) {
        expect(rule.message, target).toBeTruthy();
        for (const condition of rule.conditions) {
          expect(KNOWN.some((pattern) => pattern.test(condition)), `${target}: ${condition}`).toBe(true);
          expect(condition, target).not.toMatch(/'r'|\|r\||'r\||\|r'|rr/); // ر is not checked
        }
      }
    }
  });
});
