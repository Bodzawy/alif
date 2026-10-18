import { describe, expect, it } from "vitest";

import { evaluateLetterConditions, ruleDecidedWithoutIqra } from "@/lib/pronunciation/condition-engine";
import { CONDITION_RULES } from "@/lib/pronunciation/rules";

// /api/pronunciation answers without waiting for IQRA when ruleDecidedWithoutIqra
// names a rule. That is only correct if the full evaluation would match the same
// rule for ANY IQRA answer – checked here for every target of every rule file.

const azure = (target: string, azureAccuracy: number, azureRecognized = target) => ({ target, azureAccuracy, azureRecognized });

/** IQRA answers to try: none, every token the target's rules mention (alone and all together), and a few typical outputs. */
function iqraAnswers(target: string): string[][] {
  const tokens = new Set<string>();
  for (const { conditions } of Object.values(CONDITION_RULES[target]!)) {
    for (const condition of conditions) {
      const list = condition.match(/^iqra_phonemes\s*(?:does not contain|contains)\s*(.+)$/)?.[1];
      for (const token of list?.replace(/[\[\]'\s]/g, "").split(",") ?? []) for (const alternative of token.split("|")) if (alternative) tokens.add(alternative);
    }
  }
  const all = [...tokens];
  return [[], all, ...all.map((t) => [t]), ["<", "a", "b"], ["<", "i", "s"], ["h", "uu", "m"], ["<", "aa", ...all]];
}

describe("ruleDecidedWithoutIqra", () => {
  it("decides only when every IQRA answer gives the same rule (all targets, accuracies around every threshold)", () => {
    const accuracies = [0, 30, 55, 64, 65, 69, 69.5, 70, 71, 85, 100];
    let decided = 0;
    let checked = 0;
    for (const target of Object.keys(CONDITION_RULES)) {
      for (const accuracy of accuracies) {
        for (const recognized of [target, "", "شيء آخر"]) {
          const rule = ruleDecidedWithoutIqra(azure(target, accuracy, recognized));
          if (rule === null) continue;
          decided++;
          for (const iqraPhonemes of iqraAnswers(target)) {
            checked++;
            expect(evaluateLetterConditions({ ...azure(target, accuracy, recognized), iqraPhonemes })?.rule, `${target}@${accuracy} ${iqraPhonemes.join(" ")}`).toBe(rule);
          }
        }
      }
    }
    expect(decided).toBeGreaterThan(1000);
    expect(checked).toBeGreaterThan(decided);
  });

  it("a weak Azure score decides at once (letters and words); a good one waits for IQRA", () => {
    expect(ruleDecidedWithoutIqra(azure("باء", 52))).toBe("wrong");
    expect(ruleDecidedWithoutIqra(azure("أسد", 64))).toBe("needs_improvement");
    expect(ruleDecidedWithoutIqra(azure("باء", 86))).toBeNull();
    expect(ruleDecidedWithoutIqra(azure("أسد", 92))).toBeNull();
  });

  it("ألف needs Azure only, so it is decided either way", () => {
    expect(ruleDecidedWithoutIqra(azure("ألف", 86))).toBe("excellent");
    expect(ruleDecidedWithoutIqra(azure("ألف", 50))).toBe("correct_letter_needs_improvement");
  });

  it("the vowel sounds (decided by IQRA only) and unknown targets always wait", () => {
    for (const target of ["أَ", "إِ", "أُ"]) for (const accuracy of [0, 50, 100]) expect(ruleDecidedWithoutIqra(azure(target, accuracy))).toBeNull();
    expect(ruleDecidedWithoutIqra(azure("unbekannt", 10))).toBeNull();
  });
});
