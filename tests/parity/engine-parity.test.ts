// @vitest-environment node
import { expect, it } from "vitest";

import { evaluateLetterConditions as alif } from "@/lib/pronunciation/condition-engine";
import { evaluateLetterConditions as legacy } from "../fixtures/legacy-masaar/src/lib/pronunciation/condition-engine";
import legacyRules from "../fixtures/legacy-masaar/src/lib/pronunciation/letter_conditions.json";

// Condition engine: Alif must decide exactly like legacy Masaar.
const POOL = ["b","t","f","aa","s","j","ii","m","H","h","x","AA","d","z","r","$","S","D","A","T","Z","E","a","y","g","q","k","l","n","w","*","<","i"];
const RECOGNIZED = ["", "ألف", "أَلِف.", "باء", "ثاء", "سين", "hello", "٣", "ـ", "أَلِفٌ!"];
const ACCURACIES = [0, 1, 64, 65, 69, 70, 71, 99, 100];

it("Alif engine == legacy Masaar engine for all 28 letters (boundary + randomised inputs)", () => {
  let seed = 7;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2 ** 31) / 2 ** 31);
  let cases = 0;
  for (const target of [...Object.keys(legacyRules), "unknown", ""]) {
    const accuracies = [...ACCURACIES, ...Array.from({ length: 40 }, () => Math.floor(rnd() * 101))];
    for (const azureAccuracy of accuracies) {
      for (let i = 0; i < 60; i++) {
        const context = { target, azureAccuracy, azureRecognized: RECOGNIZED[i % RECOGNIZED.length]!, iqraPhonemes: POOL.filter(() => rnd() < 0.15) };
        expect(alif(context), JSON.stringify(context)).toEqual(legacy(context));
        cases++;
      }
    }
  }
  expect(cases).toBe(88_200);
});
