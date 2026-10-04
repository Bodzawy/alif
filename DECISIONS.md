# Decisions – A1: 28 letter lessons

Decisions taken while building the 28 A1 letter lessons without being able to ask.
Each entry: what was decided, alternatives, why, and how to change it.

## Phase 1 – Structure

### D1. Unlock flag lives in its own module
- **Decision:** `LESSONS_UNLOCK_IN_ORDER = true` in `src/data/lesson-unlock.ts`.
- **Alternatives:** put it in `src/data/curriculum.ts`.
- **Why:** the flag is read by client components (card list, lesson gate). `curriculum.ts` imports all 28 lesson files, which would ship every lesson's data to the browser just to read one boolean.
- **Change:** set it to `false` for "all lessons open".

### D2. What "completed" means for unlocking
- **Decision:** lesson N opens when lesson N-1 has `completedAt` (set when the student presses "Weiter" at the end after passing all 4 exercises).
- **Alternatives:** unlock when all exercises passed (without pressing "Weiter"); unlock on first visit.
- **Why:** same meaning as the "Abgeschlossen" badge on the card, so the list is self-explanatory.
- **Change:** `useLessonUnlocked` in `src/components/lessons/use-lesson-unlocked.ts`.

### D3. Locked state before hydration
- **Decision:** progress lives in localStorage, so the server cannot know it. Gated lessons (2–28) render as "Gesperrt" on the server and switch after hydration; a gated lesson/intro page shows a loading block until the client has read progress. Lesson 1 is never gated and renders fully on the server, as before.
- **Alternatives:** render the lesson on the server and lock it after hydration (locked students would briefly see the lesson).
- **Why:** same approach as A0 (`alphabet-overview.tsx`, `letter-practice.tsx`); no hydration mismatch and no flash of locked content.

### D4. Locked lesson and intro pages
- **Decision:** a locked lesson page and its intro page show "Diese Lektion ist noch gesperrt." with a button to the previous lesson (to its intro if it has a video). The URL still returns HTTP 200 (static page); only the content is locked.
- **Why:** progress is per browser; the server cannot return 403/404 per student.

### D5. Phase split
- **Decision:** Phase 1 commit contains the structure only (unlock gate, card, entry links, video move) and still ships lesson 1 alone; the 27 new lessons are added with their content in Phase 2.
- **Why:** a lesson file without its 3 words would fail validation and could not be practised; every commit stays green.

## Phase 2 – Content for lessons 2–28

### D6. Transliteration scheme (German-friendly)
- **Decision:** words and the "Laut" field use a German-reader scheme: ج = dsch, خ = ch, ش = sch, ي = j, diphthongs ai/au, long vowels with macron (ā ī ū), and the usual dotted letters for sounds German lacks (ḥ ṣ ḍ ṭ ẓ, ʿ for ع, ʾ for hamza, q, gh, th, dh). ز stays "z" (the soundHint explains it is a voiced s).
- **Alternatives:** English-style scholarly scheme (j, kh, sh, y) – reads wrongly for Germans ("j" = "y"); DMG (ǧ, ḫ, š) – precise but unfamiliar to beginners.
- **Why:** matches the German letter names (Dschim, Cha, Schin) and lesson 1 ("asad", "ananās") which uses macrons. Listed in REVIEW.md §4.
- **Change:** `transliteration` fields in `src/data/lessons/a1/lesson-N.ts`.

### D7. Letter glyph on cards and in the hero
- **Decision:** lessons 2–28 show the bare letter (ب, ت, …). Lesson 1 keeps "أَ" (alif with hamza and fatha) as before.
- **Why:** a bare consonant is how the letter is named and drawn; Alif needed the hamza to have a sound at all.

### D8. Titles of the look-alike names
- **Decision:** "Der Buchstabe Ta · das normale T", "Der Buchstabe Ṭa · das dunkle T", "Der Buchstabe Ḥa · das gehauchte H", "Der Buchstabe Ha · das leichte H". All 28 titles are unique (checked by the validation test). The subtitle repeats the hint because the card hides the subtitle on phones.

### D9. Word choices
- **Decision:** 3 concrete, drawable, common nouns per letter, all starting with the letter itself (no hamza/alif start for letters other than Alif). Singular (nomen unitatis) where it is the normal beginner form: تُفَّاحَة, رُمَّانَة, زَيْتُونَة, لَيْمُونَة, مَوْزَة, قِطَّة; عِنَب is taught as "die Weintrauben".
- **Avoided:** عَيْن (target equals the letter name عين; the rule merge would throw), animals that cannot be drawn clearly, and duplicate meanings (غَزَال was not used because ظَبْي already is a gazelle).
- **Weak spots:** ض and ظ have very few simple nouns; ضَبُع (hyena), ضِرْس (molar), ظُفْر (fingernail), ظَبْي (gazelle) and لَقْلَق (stork) are less common. Flagged in REVIEW.md §4 with alternatives.
- **Form:** pausal form without case endings, like lesson 1.

### D10. Word pronunciation rules
- **Decision:** one entry per word in `vocabulary_conditions.json`, exactly lesson 1's template (`azure_accuracy >= 70` → excellent, `< 70` → needs_improvement, same Arabic messages with the word). The target is the voweled word with harakat removed.
- **Why:** lesson 1's words have no phoneme conditions either; there is nothing else to copy. No TODO-REVIEW fields were added because the format has no fields that need a speaker's judgement beyond the word itself (covered by REVIEW.md).

### D11. Letter forms
- **Decision:** forms built with Unicode joining and tatweel (ـ): Allein X, Anfang Xـ, Mitte ـXـ, Ende ـX. The six non-connecting letters (ا د ذ ر ز و) use X / X / ـX / ـX, exactly like Alif.

### D12. How the lesson files were produced
- **Decision:** the 27 lesson files and the 81 rule entries were written once by a throw-away script from one table, so all files have exactly lesson 1's shape. The script is not committed; the lesson files are the source of truth and are edited by hand from now on.

### D13. Pictures
- **Decision:** 81 hand-drawn SVGs (400×300, lesson 1's palette, gradients, ground bands, eyes with highlights). Every picture was rendered and looked at; 7 were redrawn after the first look (teapot handle/spout, wolf chest, book page lines, banana, lemon, pillow, thumb). Sizes are 0.8–2.5 KB, slightly smaller than lesson 1's 2.4–3.1 KB because the shapes are simpler.
- **Audio:** no files. Every word plays via `/api/tts` from its `modelText`, like lesson 1. Nothing calls Azure at build or test time.

## Phase 3 – Verification

### D14. Shared checks, one runner already installed
- **Decision:** the content checks live in `scripts/lesson-checks.ts` and are used by both `tests/unit/lessons.test.ts` and `npm run lessons:status` (run with `vite-node`, which ships with vitest – no new dependency).
- **"Audio ok"** means: the word's `modelText` is accepted by `/api/tts` (curriculum allow-list). There are no audio files to check. Nothing calls Azure, TTS or the pronunciation API in tests or at build time.
- **Self-check:** removing a picture and giving a word a letter-name target were both reported and made the command exit with 1.

### D15. No placeholders
- **Decision:** every word got a drawable picture, so no placeholder mechanism was added. If one is ever needed, add a field to the word (e.g. `image.placeholder: true`) and let `lesson-checks.ts` report it as "placeholder" instead of "missing".

### D16. How the locked intro page is tested
- **Decision:** only lesson 1 has an intro video, and lesson 1 is never locked, so a locked intro page cannot be reached in the real app yet. The intro page uses the same `LessonGate` as the lesson page; `tests/unit/lesson-unlock.test.tsx` covers the gate (locked, unlocked, first lesson, card). The e2e tests cover the locked lesson URL, the 28 cards, lesson 2 without intro (direct start, `/intro` is 404) and lesson 28's "Zurück zu A1".

### D17. Visual check
- **Decision:** all 27 new lesson pages were rendered from the production build and looked at, plus close-ups of the letter forms of ب ج ح ع ك و (joining correct; و shows two shapes). No picture needed redrawing at page size; 7 had already been redrawn at the contact-sheet stage (D13).

## Blocked

Nothing was blocked. Not done on purpose: no push, no deploy, no server access, no `.env` changes.
