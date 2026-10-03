import { buildAssessment } from "../../src/lib/pronunciation/assessment";
import letterRules from "../../src/lib/pronunciation/letter_conditions.json";

// /api/pronunciation answers for browser tests, produced by Alif's real
// decision logic and the Masaar letter rules (only the Azure/IQRA inputs are
// simulated, because those services need credentials).
type Rules = Record<string, Record<string, { conditions: string[] }>>;

function excellentPhonemes(target: string) {
  return ((letterRules as Rules)[target]?.excellent?.conditions ?? [])
    .map((c) => c.match(/^iqra_phonemes\s+contains\s+(.+)$/)?.[1])
    .filter((list): list is string => Boolean(list))
    .flatMap((list) => list.replace(/[\[\]'\s]/g, "").split(",").filter(Boolean));
}

export type AnswerMode = "correct" | "incorrect" | "iqra-unavailable";

export function pronunciationAnswer(target: string, mode: AnswerMode) {
  const accuracy = mode === "incorrect" ? 55 : 88;
  const phonemes = excellentPhonemes(target);
  return buildAssessment({
    target,
    primary: { referenceText: target, recognized: target, accuracy, pronunciation: accuracy, fluency: 90, completeness: 100, firstSoundScore: 80, words: [] },
    masaar: null,
    iqra: mode === "iqra-unavailable" ? null : { sequence: phonemes.join(" "), phonemes, duration: 0.8 },
  });
}
