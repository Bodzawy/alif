// ALIF Speaking (Beginner): the IQRA condition of every target checks EVERY letter that is spoken,
// each with the sounds agreed for that letter – the condition of the letter's own name in
// beginner_conditions.json (باء: b or p, ر: r or g / x …). Azure decides first (src/lib/pronunciation/
// assessment.ts); this condition is only asked when Azure did not let the answer pass.
//
//   npx vite-node -c vitest.config.mts scripts/beginner-conditions.ts
//
// Not checked: Alif, Alif Maqsura, Ta Marbuta and the Hamza (the letter ألف has no condition), و / ي as
// long vowels (no mark of their own), the ل of ال before a sun letter (not spoken). Every letter once.
// The 28 letter names keep their own condition, and so do أَ إِ أُ (Azure alone). Sounds a target already
// accepts (edited by hand, e.g. تين: t or d, f, s, k) are kept.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { beginnerLetterTokens, BEGINNER_FILE, type RuleFile } from "../src/lib/pronunciation/beginner-letters";
import { allExercises } from "../src/data/curriculum";
import { ARABIC_LETTERS } from "../src/lib/pronunciation/letters";

const FILE = path.resolve(__dirname, "..", BEGINNER_FILE);
const rules = JSON.parse(readFileSync(FILE, "utf8")) as RuleFile;

const letterNames = new Set(ARABIC_LETTERS.map((letter) => letter.referenceText));
const VOWELS_ONLY = new Set(["أَ", "إِ", "أُ"]);
/** The vocalised text of each target (the first one the app speaks). */
const spoken = new Map<string, string>();
for (const exercise of allExercises()) if (!spoken.has(exercise.target)) spoken.set(exercise.target, exercise.modelText);

const CONTAINS = /^iqra_phonemes contains \[(.+)\]$/;
const tokensOf = (condition: string) => (CONTAINS.exec(condition)?.[1] ?? "").replace(/['\s]/g, "").split(",").filter(Boolean);

let changed = 0;
const missing: string[] = [];
for (const [target, rule] of Object.entries(rules)) {
  if (letterNames.has(target) || VOWELS_ONLY.has(target)) continue;
  const text = spoken.get(target) ?? target;
  if (!spoken.has(target)) missing.push(target);
  const before = rule.excellent.conditions.flatMap(tokensOf);
  const claimed = new Set<string>();
  const tokens = beginnerLetterTokens(text, rules).map(({ alternatives }) => {
    // Sounds added by hand to this letter stay: the old token that starts with the letter's own sound and
    // is closest to its agreed sounds (ث and ف both start with f), each old token for one letter only.
    const distance = (token: string) => {
      const set = new Set(token.split("|"));
      return [...set].filter((alt) => !alternatives.includes(alt)).length + alternatives.filter((alt) => !set.has(alt)).length;
    };
    const own = before
      .filter((token) => !claimed.has(token) && token.split("|")[0] === alternatives[0])
      .sort((a, b) => distance(a) - distance(b))[0];
    if (own) claimed.add(own);
    return own ? [...new Set([...alternatives, ...own.split("|")])].join("|") : alternatives.join("|");
  });
  const conditions = tokens.length ? [`iqra_phonemes contains [${tokens.map((t) => `'${t}'`).join(",")}]`] : [];
  if (JSON.stringify(conditions) !== JSON.stringify(rule.excellent.conditions)) changed++;
  rule.excellent.conditions = conditions;
}

writeFileSync(FILE, JSON.stringify(rules, null, 2) + "\n");
console.log(`${changed} targets changed; ${Object.keys(rules).length} in all`);
if (missing.length) console.log(`no vocalised text (spelling used): ${missing.join(" ")}`);
