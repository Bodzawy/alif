# Letters ب – خ: files (phase 1: ب · phase 2: ت ث ج ح خ)

Nothing is committed. Not listed: `docs/reports/schritt-2-guided-files.md` and
`tests/unit/a1-guided.test.tsx` had uncommitted changes before this task and were
not touched; `src/components/a1/guided/guided-sound-words.tsx` also had uncommitted
changes before – only its type import and `Groups` type (2 lines) were changed here.

## New

| File | What |
|---|---|
| `src/lib/arabic/letter-form.ts` | General util: tiles, Hand, target letter, form (start / middle / end / separate), shapes with tatweel, neighbours |
| `src/data/a1/letter-lesson.ts` | `letterLesson()`: a letter spec → the four steps; German Formen texts (`letterFormsTexts`) |
| `src/data/a1/letters/ba.ts` | Ba: words, Formen words, sukun word (book pages 4–5) |
| `src/data/letters/ba.ts` | Ba writing set: four forms, body + dot (approximate paths, teacher check) |
| `src/components/a1/forms/word-shape.ts` | Tiles / target / position of a Formen word for Alif or for a letter |
| `src/components/a1/forms/letter-neighbors-activity.tsx` | "Wer hält fest?" for a letter with a Hand: slots on both sides |
| `src/components/a1/forms/letter-sort-activity.tsx` | Activity 3 with four baskets (بـ ـبـ ـب ب); phase 2: narrow tiles for words with > 5 tiles |
| `scripts/letter-audio-script.ts` | Writes `docs/audio-scripts/<id>.md` from the lesson data |
| `docs/audio-scripts/ba.md` | Recording script for Ba (German narration, Arabic words) |
| `docs/reports/letters-ba-kha-files.md` | This list |
| `tests/unit/letter-form.test.ts` | Util: all Formen + sukun words of the six letters, neighbours |
| `tests/unit/writing-dot.test.ts` | Dot stroke type, Ba writing data |
| `tests/unit/a1-letters.test.tsx` | Ba data, titles, URLs, progress keys, /a1 cards, navigation, rules, Formen flow, Alif fixture, recording script |
| `tests/fixtures/a1/lesson-1.json` | Alif lesson data as it was before this task |
| `e2e/a1-ba.spec.ts` | Ba on a 390 px phone: card → four steps → back to /a1; dot order / long stroke; phase 2: 7 cards, helpers from `e2e/support/letters.ts` |
| `src/data/a1/letters/{ta,tha,jim,hha,kha}.ts` | Phase 2: the five letter specs (words, Formen words, sukun word) |
| `src/data/letters/{ta,tha,jim,hha,kha}.ts` | Phase 2: writing sets (ت ث: Ba body + dots above; ح: two strokes; ج خ: ح body + dot) |
| `src/data/letters/dots.ts` | Phase 2: `dot()` / `dotStroke()` shared by the writing sets |
| `docs/audio-scripts/{ta,tha,jim,hha,kha}.md` | Phase 2: recording scripts (generated) |
| `tests/unit/a1-letter-set.test.tsx` | Phase 2: data, rules, writing, script, step pages and Formen flow of each new letter; long-word layout only for new words |
| `e2e/a1-letters.spec.ts` | Phase 2: each new letter on a 390 px phone: card → Laute → Wörter → Formen → every writing form traced → /a1 |
| `e2e/support/letters.ts` | Phase 2: helpers moved out of `e2e/a1-ba.spec.ts` (mocks, touch, writing board) |

## Modified

| File | What |
|---|---|
| `src/data/types.ts` | `A1Word` (optional picture), `FormsLetter`, `FormsWord.occurrence`, `FormsContent.letter`, `WritingStroke.dot` / `label`, `WritingLetterSet.orderHint`, `A1Lesson.letter` |
| `src/data/a1/index.ts` | Ba registered after Alif; phase 2: ت ث ج ح خ |
| `src/app/a1/page.tsx` | Letter cards: letter chip and name (Alif card unchanged) |
| `src/lib/arabic/hamza-alif.ts` | Uses the general util (same exports, same results) |
| `src/components/a1/forms/content.ts` | Letter narration file names, rule text, basket labels; phase 2: `isLongWord`, `LONG_ROW`, `LONG_TILE` |
| `src/components/a1/forms/forms-step.tsx` | Chooses the letter variants when `forms.letter` is set |
| `src/components/a1/forms/explain-activity.tsx` | Optional letter (target, captions); phase 2: narrow tiles for words with > 5 tiles |
| `src/components/a1/forms/build-activity.tsx` | Optional letter (target, position); phase 2: narrow slots for words with > 5 tiles |
| `src/components/a1/forms/shaped-word.tsx` | Optional `target`; the letter's own Hand ("own") |
| `src/components/a1/writing/writing-step.tsx` | Dot strokes, next-stroke text from `label`, `orderHint` |
| `src/components/a1/writing/draw.ts` | Dots: number instead of arrow, start dot at the centre |
| `src/lib/writing/trace.ts` | `TRACE_TOL.dot`, `evaluateDot`, `evaluateStroke`, fail reason "dot" |
| `src/components/lessons/vocabulary-card.tsx` | Text-only card when there is no picture |
| `src/components/a1/sound-words-step.tsx` | Type `A1Word` |
| `src/components/a1/guided/guided-sound-words.tsx` | Type `A1Word` (2 lines) |
| `src/lib/pronunciation/sound_conditions.json` | Rules for بَ بِ بُ; phase 2: the 15 sounds of ت ث ج ح خ |
| `src/lib/pronunciation/vocabulary_conditions.json` | Rules for بنات بنت بئر بطاقة بندقية برتقال برج; phase 2: 37 more words |
| `README.md` | "A1 · Lektion 1: adding a letter" (phase 2: shared bodies and dots) |
| `tests/support/a1-words.ts` | Type `A1Word` |
| `tests/unit/a1.test.tsx` | Lesson list (all seven); exercise and image checks scoped to lesson 1; sound-rule keys incl. ب – خ |
| `tests/unit/a1-gaps.test.tsx` | `image?.src` (optional picture type) |
| `tests/unit/lessons.test.ts` | Counts rule targets, not words (بيت and باب share the A0 rules) |
| `tests/unit/vocabulary-iqra-gates.test.ts` | Expected tokens of the new words; 147 words (84 A0 + 63 A1) |
| `e2e/a1.spec.ts` | /a1 has 7 cards |
| `src/data/letters/ba.ts` | Phase 2: bodies exported as `BA_BODY` (for ت ث), dots via `dotStroke` – same paths |
| `tests/unit/a1-letters.test.tsx` | Phase 2: lesson list and /a1 cards for all seven |
