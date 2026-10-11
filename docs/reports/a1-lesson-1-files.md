# A1 · Lektion 1 as one lesson (9 entries), no "Laute" step, pictures: files

Nothing is committed. Builds on the uncommitted work of the letters ب – خ
(`docs/reports/letters-ba-kha-files.md`). `tests/unit/a1-guided.test.tsx` and
`src/components/a1/guided/guided-sound-words.tsx` had uncommitted changes before;
in `a1-guided.test.tsx` only the lesson lookup and the progress key (3 lines) were changed.

## New

| File | What |
|---|---|
| `src/app/a1/[unit]/page.tsx` | The lesson's contents (أ ب ت ث ج ح خ, مراجعة, صَبَاحُ الْخَيْر); old `/a1/<letter>` and `/a1/lesson-N` redirects (was `src/app/a1/[lesson]/page.tsx`) |
| `src/app/a1/[unit]/[lesson]/page.tsx` | An entry → its first step; old `/a1/lesson-1/step-N` → Alif step N − 1 |
| `src/app/a1/[unit]/[lesson]/[step]/page.tsx` | The step page (was `src/app/a1/[lesson]/[step]/page.tsx`): entry title, back to the lesson, next entry |
| `src/components/a1/phrases-step.tsx` | Step type "phrases": a large card to listen, speak, be evaluated |
| `src/data/a1/review.ts` | مراجعة: Ergänzen + Hören over the seven letters (words of the lesson, own four tiles per item) |
| `src/data/a1/sabah-al-khayr.ts` | صَبَاحُ الْخَيْر: Sprechen + Buchstaben finden (ب ح خ in the phrase) |
| `public/images/a1/{ba,ta,tha,jim,hha,kha}/*.svg` | 53 pictures (42 words, 11 Formen words) |
| `public/images/a1/lesson-1/{ras,saala,qaraa}.svg` | Pictures of Alif's Formen words |
| `public/images/a1/sabah-al-khayr/sabah-al-khayr.svg` | Picture of the phrase |
| `public/audio/a1/shared/{g_ok,g_hint,g6_intro}.wav` | Copies of Alif's clips with the same text (allowed by the brief) |
| `docs/audio-scripts/shared.md` | Recording script of the shared Ergänzen / Hören clips |
| `tests/unit/a1-lesson-structure.test.tsx` | Nine entries, old URLs, progress move, pattern gaps, review, phrase, picture audit (A0 + A1), gap flow with two gaps and /api/tts |
| `e2e/a1-lesson.spec.ts` | Contents → every entry; review and phrase played through; image-first cards on phone and desktop |
| `docs/reports/a1-lesson-1-files.md` | This list |

## Deleted

| File | Why |
|---|---|
| `src/components/a1/sounds-step.tsx` | The separate "Laute" step is gone; its content (sound, vowel name, transliteration, listen, speak, feedback) is the sound card at the start of each "Wörter" row |

## Modified

| File | What |
|---|---|
| `src/data/types.ts` | `A1Unit`; `A1Lesson` = an entry (`kind`, `label`, `labelGerman`); step type "phrases"; no step type "sounds"; `GapItem.pattern` / `choices`; `GapsContent.clips` / `texts` |
| `src/data/a1/index.ts` | `a1Unit1` with nine entries; hrefs, progress keys, `a1SpokenTexts`, `movedStep` |
| `src/data/a1/lesson-1.ts` | Alif = entry "alif", five steps (no "Laute"); pictures for سَأَلَ قَرَأَ رَأْس |
| `src/data/a1/letter-lesson.ts` | Five steps like Alif (+ Ergänzen, Hören from the book patterns), pictures, shared gap clips |
| `src/data/a1/letters/{ba,ta,tha,jim,hha,kha}.ts` | Pictures, Formen pictures, the book's Ergänzen / Hören items |
| `src/app/a1/page.tsx` | One card per lesson (the letters are its contents) |
| `src/app/page.tsx` | Counts A1 lessons |
| `src/components/a1/gaps/gaps-step.tsx` | Several gaps per word, per-item tiles, clips / captions from the data, word by recording or /api/tts, highlighted letter |
| `src/lib/arabic/gap.ts` | `alignPattern`, `patternPieces` (tatweel joins), `gapTask` |
| `src/lib/arabic/letter-form.ts` | A space never joins (the phrase) |
| `src/lib/audio/narrate.ts` | `sayWithFallback`: recording, else /api/tts, else a short pause |
| `src/lib/progress.ts` | Copies Alif's old step progress to the new keys (once, nothing deleted) |
| `src/lib/pronunciation/targets.ts` | /api/tts also accepts the gap words (e.g. بَابْ) |
| `src/lib/pronunciation/vocabulary_conditions.json` | Rule for صباح الخير |
| `src/components/lessons/vocabulary-card.tsx` | Client component; picture `object-contain`; a picture that fails to load → the word, logged |
| `src/components/a1/sound-card.tsx` | Comment only |
| `scripts/letter-audio-script.ts` | Section 3 (Ergänzen / Hören words), `shared` mode |
| `docs/audio-scripts/{ba,ta,tha,jim,hha,kha}.md` | Regenerated |
| `README.md` | A1 structure, routes, old URLs; adding a letter (gaps, pictures) |
| `tests/support/a1-words.ts`, `tests/unit/{a1,a1-gaps,a1-forms,a1-guided,a1-writing-step,a1-letters,a1-letter-set,vocabulary-iqra-gates}.test.ts(x)` | New routes / steps / keys; pictures; the phrase's gate |
| `e2e/{a1,a1-ba,a1-letters,a1-gaps,a1-forms,a1-guided,a1-writing,levels,lesson-flow}.spec.ts`, `e2e/support/letters.ts` | New routes / steps / keys; Ergänzen and Hören for every letter; `answerGaps` |
