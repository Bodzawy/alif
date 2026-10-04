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
