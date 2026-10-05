import { describe, expect, it } from "vitest";

import { LEVELS } from "@/data/curriculum";
import { buildAssessment, NO_MATCHING_RULE } from "@/lib/pronunciation/assessment";
import { LETTER_RULES, VOCABULARY_RULES } from "@/lib/pronunciation/rules";
import type { AzureAssessment, IqraResult } from "@/lib/pronunciation/types";

// Every A1 word passes only with Azure accuracy >= 70 AND its own consonants in
// IQRA's phoneme output. Vowels, hamza, ث and ذ are not required (IQRA does not
// output them reliably). "a|aa" means either token; IQRA writes shadda as a
// doubled token (TT) and sometimes writes r as rr.
const EXPECTED_TOKENS: Record<string, string[]> = {
  "أسد": ["s","d"],
  "أرنب": ["r|rr","n","b"],
  "أناناس": ["n","s"],
  "بيت": ["b","y","t"],
  "باب": ["b"],
  "بطة": ["b","T|TT"],
  "تفاحة": ["t","f|ff","H"],
  "تمساح": ["t","m","s","H"],
  "تاج": ["t","j"],
  "ثعلب": ["E","l","b"],
  "ثوم": ["m"],
  "ثلج": ["l","j"],
  "جمل": ["j","m","l"],
  "جزرة": ["j","z","r|rr"],
  "جبل": ["j","b","l"],
  "حصان": ["H","S","n"],
  "حوت": ["H","t"],
  "حليب": ["H","l","b"],
  "خبز": ["x","b","z"],
  "خروف": ["x","r|rr","f"],
  "خيار": ["x","y","r|rr"],
  "دب": ["d","b|bb"],
  "دجاجة": ["d","j"],
  "دراجة": ["d","r|rr","j"],
  "ذئب": ["b"],
  "ذرة": ["r|rr"],
  "ذبابة": ["b"],
  "رمانة": ["r|rr","m|mm","n"],
  "ريشة": ["r|rr","$"],
  "رجل": ["r|rr","j","l"],
  "زرافة": ["z","r|rr","f"],
  "زيتونة": ["z","y","t","n"],
  "زهرة": ["z","h","r|rr"],
  "سمكة": ["s","m","k"],
  "سيارة": ["s","y|yy","r|rr"],
  "ساعة": ["s","E"],
  "شمس": ["$","m","s"],
  "شجرة": ["$","j","r|rr"],
  "شاي": ["$"],
  "صقر": ["S","q","r|rr"],
  "صندوق": ["S","n","d","q"],
  "صابون": ["S","b","n"],
  "ضفدع": ["D","f","d","E"],
  "ضرس": ["D","r|rr","s"],
  "ضبع": ["D","b","E"],
  "طائرة": ["T","r|rr"],
  "طبل": ["T","b","l"],
  "طاووس": ["T","w","s"],
  "ظرف": ["Z","r|rr","f"],
  "ظفر": ["Z","f","r|rr"],
  "ظبي": ["Z","b"],
  "عنب": ["E","n","b"],
  "عصفور": ["E","S","f","r|rr"],
  "عسل": ["E","s","l"],
  "غراب": ["g","r|rr","b"],
  "غيمة": ["g","y","m"],
  "غسالة": ["g","s|ss","l"],
  "فيل": ["f","l"],
  "فراشة": ["f","r|rr","$"],
  "فراولة": ["f","r|rr","w","l"],
  "قطة": ["q","T|TT"],
  "قمر": ["q","m","r|rr"],
  "قلم": ["q","l","m"],
  "كلب": ["k","l","b"],
  "كتاب": ["k","t","b"],
  "كرة": ["k","r|rr"],
  "ليمونة": ["l","y","m","n"],
  "لسان": ["l","s","n"],
  "لقلق": ["l","q"],
  "موزة": ["m","w","z"],
  "مفتاح": ["m","f","t","H"],
  "مظلة": ["m","Z","l|ll"],
  "نمر": ["n","m","r|rr"],
  "نحلة": ["n","H","l"],
  "نجمة": ["n","j","m"],
  "هلال": ["h","l"],
  "هاتف": ["h","t","f"],
  "هرم": ["h","r|rr","m"],
  "وردة": ["w","r|rr","d"],
  "ولد": ["w","l","d"],
  "وسادة": ["w","s","d"],
  "يد": ["y","d"],
  "يقطين": ["y","q","T","n"],
  "يمامة": ["y","m"],
};

// IQRA's token inventory (sws_arabic.txt of the IqraEval phoneme model).
const IQRA_TOKENS = new Set(
  "bb x yy s r k n ZZ hh EE AA t zz qq T g ww gg m H l I DD D SS j dd II S f nn uu kk y ^^ tt ** $ aa h UU ss u * A < q U z $$ d jj TT ii HH rr i E << xx ll w ^ a mm b ff Z".split(" ")
);

const IQRA_UNAVAILABLE_MESSAGE = "تعذر تحليل أصوات النطق. حاول مرة أخرى بعد التأكد من اتصال IQRA.";

function azure(target: string, accuracy: number): AzureAssessment & { accuracy: number; pronunciation: number } {
  return { referenceText: target, recognized: target, accuracy, pronunciation: accuracy, fluency: 90, completeness: 100, firstSoundScore: 80, words: [] };
}

function assess(target: string, accuracy: number, phonemes: string[] | null) {
  const iqra: IqraResult | null = phonemes ? { sequence: phonemes.join(" "), phonemes, duration: 0.8 } : null;
  return buildAssessment({ target, primary: azure(target, accuracy), masaar: null, iqra });
}

/** A plausible, never-empty IQRA output: the required consonants (chosen alternative) with vowels around them. */
function spoken(tokens: string[], pick: (alternatives: string[]) => string = (alternatives) => alternatives[0]!) {
  return ["a", ...tokens.flatMap((token) => [pick(token.split("|")), "a"])];
}

const words = LEVELS.flatMap((level) => level.lessons.flatMap((lesson) => lesson.vocabulary.map((word) => ({ lesson: lesson.slug, word }))));

describe("vocabulary IQRA gates", () => {
  it("cover all 84 curriculum words, each with its own gate", () => {
    expect(words).toHaveLength(84);
    expect(Object.keys(EXPECTED_TOKENS).sort()).toEqual(words.map(({ word }) => word.exercise.target).sort());
    expect(Object.keys(VOCABULARY_RULES).sort()).toEqual(Object.keys(EXPECTED_TOKENS).sort());
  });

  it("use only tokens IQRA can produce", () => {
    for (const [target, tokens] of Object.entries(EXPECTED_TOKENS)) {
      for (const alternative of tokens.flatMap((token) => token.split("|"))) expect(IQRA_TOKENS.has(alternative), `${target}: ${alternative}`).toBe(true);
    }
  });

  it("leave the letter rules untouched (no alternatives, no emptiness check)", () => {
    for (const rules of Object.values(LETTER_RULES)) {
      for (const condition of Object.values(rules).flatMap((rule) => rule.conditions)) {
        expect(condition).not.toContain("|");
        expect(condition).not.toContain("is not empty");
      }
    }
  });

  describe.each(words.map(({ lesson, word }) => [`${lesson} ${word.exercise.target}`, word.exercise.target] as const))("%s", (_, target) => {
    const tokens = EXPECTED_TOKENS[target]!;
    const list = `[${tokens.map((token) => `'${token}'`).join(",")}]`;

    it("has the agreed rule: Azure >= 70 and IQRA contains the word's consonants", () => {
      expect(VOCABULARY_RULES[target]!.excellent!.conditions).toEqual(["azure_accuracy >= 70", `iqra_phonemes contains ${list}`]);
    });

    it("1. passes with Azure >= 70 and every required sound", () => {
      const result = assess(target, 70, spoken(tokens));
      expect(result.passed).toBe(true);
      expect(result.conditionEvaluation.matchedRule).toBe("excellent");
      if (tokens.some((token) => token.includes("|"))) {
        expect(assess(target, 70, spoken(tokens, (alternatives) => alternatives.at(-1)!)).passed).toBe(true);
      }
    });

    it("2. fails with Azure >= 70 when any single required sound is missing", () => {
      tokens.forEach((_, missing) => {
        const result = assess(target, 95, spoken(tokens.filter((__, i) => i !== missing)));
        expect(result.passed, `${target} without ${tokens[missing]}`).toBe(false);
        expect(result.conditionEvaluation.matchedRule).toBe("said_wrong_sound");
      });
    });

    it("3. fails with Azure < 70 even when IQRA is right", () => {
      const result = assess(target, 69, spoken(tokens));
      expect(result.passed).toBe(false);
      expect(result.conditionEvaluation.matchedRule).toBe("needs_improvement");
    });

    it("4. fails when IQRA returns nothing, through the service path (not a wrong-sound message)", () => {
      for (const phonemes of [null, []]) {
        const result = assess(target, 95, phonemes);
        expect(result.passed).toBe(false);
        expect(result.conditionEvaluation.matchedRule).toBe(NO_MATCHING_RULE);
        expect(result.feedback.message).toBe(IQRA_UNAVAILABLE_MESSAGE);
      }
    });
  });
});
