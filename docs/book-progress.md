# Alif × „لغتنا الفصحى 1“ – progress record

Source: `~/Downloads/لغتنا الفصحى 1.pdf` – 354 scanned PDF pages (no text layer).
Book page N = PDF page N + 32 (e.g. book p. 91 = PDF p. 123).

The book has 10 units (الوحدة), each with two presentations (تقديم ١ / ٢).
Alif shows every presentation as one A1 "Lektion":

| Book unit | تقديم | Book pages | Alif | Status |
|---|---|---|---|---|
| 1 التحيات والتعارف | ١ صباح الخير | 1–22 | Lektion 1 `/a1/lesson-1` | done (earlier) |
| 1 | ٢ مساء الخير | 23–42 | Lektion 2 `/a1/lesson-2` | done (earlier) |
| 2 السؤال عن الأشخاص | ١ هل أنت وجدي؟ | 43–63 | Lektion 3 `/a1/lesson-3` | done (uncommitted) |
| 2 | ٢ من أنت؟ | 64–90 | Lektion 4 `/a1/lesson-4` | done (uncommitted) |
| 3 من هو؟ من أين أنت؟ | ١ من هو؟ | 91–110 | Lektion 5 `/a1/lesson-5` | done |
| 3 | ٢ من أين أنت؟ | 111–122 | Lektion 6 `/a1/lesson-6` | done |
| 4 الجنسيات والأشياء | ١ أنا مصري | 123–138 | Lektion 7 `/a1/lesson-7` | done |
| 4 | ٢ هذه حجرتي | 139–150 | Lektion 8 `/a1/lesson-8` | done |
| 5 ملكية الأشياء | ١ كتاب من هذا؟ | 151–159 | Lektion 9 `/a1/lesson-9` | done |
| 5 | ٢ هل هذه حقيبة؟ (+ مراجعة ١–٥) | 160–178 | Lektion 10 `/a1/lesson-10` | done |
| 6 أرقام وتواريخ | ١ ما الرقم؟ | 179–195 | Lektion 11 `/a1/lesson-11` | done |
| 6 | ٢ ما اليوم؟ | 196–206 | Lektion 12 `/a1/lesson-12` | done |
| 7 السعر واللون | ١ ما السعر؟ | 207–216 | Lektion 13 `/a1/lesson-13` | done |
| 7 | ٢ ما لون هذا القلم؟ | 217–224 | Lektion 14 `/a1/lesson-14` | done |
| 8 الأماكن والاتجاهات | ١ أين الحقيبة؟ | 225–236 | Lektion 15 `/a1/lesson-15` | done |
| 8 | ٢ أين الصيدلية؟ | 237–246 | Lektion 16 `/a1/lesson-16` | done |
| 9 أحداث يومية | ١ يوم في حياة باسم | 247–257 | Lektion 17 `/a1/lesson-17` | done |
| 9 | ٢ الأجازة الأسبوعية | 258–266 | Lektion 18 `/a1/lesson-18` | done |
| 10 العائلة والطقس | ١ أنا وأسرتي | 267–277 | Lektion 19 `/a1/lesson-19` | done |
| 10 | ٢ كيف حالة الطقس؟ (+ مراجعة ٦–١٠) | 278–302 | Lektion 20 `/a1/lesson-20` | done |
| – | مصطلحات مفيدة / الفهرس | 303–322 | Lektion 20 `mustalahat` | terms done; glossary not reproduced |

Per-unit page checklists: `docs/a1-unit-N-checklist.md`.

## Log

- 2026-10-12: located the PDF, rendered all pages, read the table of contents
  and all of unit 3 (book pp. 91–122). Baseline: tsc OK, vitest 2418 passed.

- 2026-10-12: unit 3 implemented (Lektion 5 and 6, see docs/a1-unit-3-checklist.md).
  New step types: "order" (اقرأ ورتب الحوار), "words" (picture words without a
  sound row). New helpers: src/lib/arabic/transliterate.ts. Rules: 108 words /
  lines + 15 sounds (generated with the Unit 2 token scheme; script kept in the
  session scratchpad, rules are plain JSON). Tests: tests/unit/a1-book.test.tsx
  (generic, every book lesson), tests/unit/a1-unit-3.test.tsx, e2e/a1-book.spec.ts.
  When adding a unit: add its slugs to tests/support/a1-units.ts and raise
  WORD_COUNT in tests/unit/vocabulary-iqra-gates.test.ts.

- 2026-10-12: unit 4 implemented (Lektion 7 and 8, docs/a1-unit-4-checklist.md).
  Rules generated with scripts/a1-rules.ts. Unit tests: 3641 passed. e2e/a1-book.spec.ts
  for unit 3: 12/12 passed.

- 2026-10-12: unit 5 implemented (Lektion 9 and 10, docs/a1-unit-5-checklist.md).
  Unit tests: 3982 passed; lint clean. e2e unit 4: 6/6 passed.

- 2026-10-12: unit 6 implemented (Lektion 11 and 12, docs/a1-unit-6-checklist.md).
  New: src/lib/arabic/numbers.ts; quiz items may have `spoken`, `image` and picture options.
  Unit tests: 4633 passed. e2e unit 5: 4/4 passed.

- 2026-10-12: unit 7 implemented (Lektion 13 and 14, docs/a1-unit-7-checklist.md).
  Unit tests: 5383 passed; lint clean.

- 2026-10-12: unit 8 implemented (Lektion 15 and 16, docs/a1-unit-8-checklist.md). Unit tests: 5850 passed.

- 2026-10-13: unit 9 implemented (Lektion 17 and 18, docs/a1-unit-9-checklist.md). Unit tests: 6259 passed.
  e2e units 6–7: 4/5, the failure (Lektion 14, two-word letter task overflowing on a phone) fixed by
  splitting the task as the book does; a unit test now caps gap slots at 7.

- 2026-10-13: unit 10, review 6–10 and the grammar terms implemented (docs/a1-unit-10-checklist.md).
  Whole book covered. Unit tests: 6707 passed.

## Next step

Final verification: typecheck, lint, all unit tests, production build, full e2e.

## Final verification (2026-10-13)

- typecheck and lint clean; vitest 6708/6710. The 2 failures (`a1.test.tsx` vowel rules,
  `api-parity` matrix) come from an outside edit to `src/lib/pronunciation/assessment.ts`
  (Azure minimum score now required for every "excellent" rule). With HEAD's version both pass.
- Production build OK. The /a1-related e2e specs pass (73/73): a1, a1-lesson, a1-lesson-2,
  a1-unit-2, levels, a1-book.
- Known e2e failures outside this work: home.spec (Jetzt starten now opens /lernweg) and
  lesson-flow responsive. Both come from the landing page commit, not from the book.
- /a1 overview: grouped by unit (`A1Unit.group`, `src/data/a1/groups.ts`), two cards per row,
  identical card skeleton.
- Nothing committed, pushed or deployed.
