import { describe, expect, it } from "vitest";

import { BEGINNER_RULES, CONDITION_RULES } from "@/lib/pronunciation/rules";

// beginner_conditions.json (ALIF Speaking): one entry per target of the
// ALIF Pronunciation rules, gentle conditions only, in the engine's syntax:
// at most the word's two easiest letters (with the sounds a beginner says
// instead), never ر, and nothing at all for the vowels أَ إِ أُ (Azure alone).

const KNOWN = [/^iqra_phonemes contains \[('[^']+',?)+\]$/, /^iqra_phonemes is not empty$/];
// جمل and جبل also check their ج (with the sounds a beginner says instead).
const THREE_LETTERS = new Set(["جمل", "جبل"]);

describe("beginner_conditions.json", () => {
  it("covers the targets of the ALIF Pronunciation rules and nothing else", () => {
    for (const target of Object.keys(BEGINNER_RULES)) expect(CONDITION_RULES[target], target).toBeDefined();
    expect(Object.keys(BEGINNER_RULES).length).toBeGreaterThan(1000);
  });

  it("at most two letters per word; أَ إِ أُ have no IQRA condition", () => {
    for (const [target, rules] of Object.entries(BEGINNER_RULES)) {
      const letters = rules.excellent!.conditions.flatMap((c) => c.match(/'[^']+'/g) ?? []);
      expect(letters.length, target).toBeLessThanOrEqual(THREE_LETTERS.has(target) ? 3 : 2);
    }
    for (const sound of ["أَ", "إِ", "أُ"]) expect(BEGINNER_RULES[sound]!.excellent!.conditions).toEqual([]);
    expect(BEGINNER_RULES["بيت"]!.excellent!.conditions).toEqual(["iqra_phonemes contains ['b|bb','t|tt|T|TT']"]);
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
