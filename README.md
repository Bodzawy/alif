# Alif

**Alif** (أَلِف) is a standalone website where German-speaking learners learn Arabic, starting from the very first letter. Every letter and word can be heard, recorded and evaluated, and the student gets immediate pronunciation feedback.

```
Alif
├── A0 · Buchstaben und erste Wörter     /a0 (choose a part)
│   ├── حروف · Buchstaben                 /a0/letters, /a0/letters/<id>
│   │   └── 28 letters أ … ي, hands-free: letter → its name is spoken → student speaks → result → next letter (only after passing)
│   └── كلمات · Wörter                    /a0/words, /a0/words/lesson-N[/intro]
│       └── 28 lessons, one per letter, e.g. Lektion 1 · Der Buchstabe Alif (أَ)
│           ├── Schritt 1: the letter: listen · record · feedback
│           └── Schritt 2: vocabulary: أَسَد · أَرْنَب · أَنَانَاس (image, German, transliteration, listen, record)
└── A1 · Lektionen                       /a1 (one card per lesson)
    └── الدرس الأول – صَبَاحُ الْخَيْر        /a1/lesson-1 (the lesson's contents)
        ├── أ ب ت ث ج ح خ                    /a1/lesson-1/<alif|ba|ta|tha|jim|hha|kha>/step-1 … step-5
        │   └── Wörter (each row starts with its sound) · Formen · Schreiben · Ergänzen · Hören
        ├── مراجعة                           /a1/lesson-1/review/step-1 … step-2 (Ergänzen · Hören over all seven letters)
        └── صَبَاحُ الْخَيْر                    /a1/lesson-1/sabah-al-khayr/step-1 … step-7 (two conversations: Anhören · Nachsprechen · Rollenspiel each; Buchstaben finden)
    └── الدرس الثاني – مَسَاءُ الْخَيْر        /a1/lesson-2 (the lesson's contents)
        ├── د ذ و ي                          /a1/lesson-2/<dal|dhal|waw|ya>/step-1 … step-8
        │   └── Wörter · Formen · Schreiben · Ergänzen · Hören · Nachsprechen & schreiben · Aussprechen · Diktat
        ├── حُرُوفُ الْمَدّ                      /a1/lesson-2/huruf-al-madd/step-1 … step-11 (lang ā ū ī, Übungen 1–9)
        └── مَسَاءُ الْخَيْر                    /a1/lesson-2/masa-al-khayr/step-1 … step-11 (two conversations, grammar, Übungen 1–3, تذكر)
    ├── الوحدة الثانية – تقديم (١) هَلْ أَنْتَ وَجْدِي؟   /a1/lesson-3 (ر ز س ش ص ض, 10 steps each; the conversations)
    └── الوحدة الثانية – تقديم (٢) مَنْ أَنْتَ؟        /a1/lesson-4 (ف ق ك ل م ن; مراجعة عامة; presentations, grammar, Übungen, تذكر)
```

A0 is a progression layer over the unchanged pronunciation pipeline: a letter
counts as mastered only when `/api/pronunciation` answers `passed: true` (the
legacy Masaar condition engine matched `excellent`). Training is hands-free
(`use-letter-drill.ts`): before every attempt the letter's name is spoken, then
the microphone opens by itself and the attempt ends when the student stops
speaking. A correct letter is followed by "مُمْتَاز" and the next letter, a
wrong one by a new attempt – as often as needed. Each extra attempt costs 10 points for that letter (never below 0); the
round score is the average (`src/lib/alphabet-score.ts`). Silence and unclear
audio are not counted. Technical errors (microphone, network, Azure, IQRA
unavailable) stop the loop with a message; only then is *Überspringen* offered:
it opens the next letter, but the skipped letter stays "nicht gemeistert".
The word lessons were A1 until October 2026. `/a1/lesson-N[/intro]` and the
older `/a0/lesson-1` redirect (307, so A1 can reuse the URLs later) to
`/a0/words/…`. Their progress (key `a1/lesson-N`) is copied once per browser to
`a0/words/lesson-N` (`src/lib/progress.ts`); the old entries are not deleted.
Intro videos keep their URLs `/videos/a1/lesson-N/…` (served by nginx).

The pronunciation system was taken over from the Masaar platform and reimplemented here. Alif has no dependency on the Masaar website. There is no redirect, no iframe and no shared login. Its only external dependencies are the evaluation services behind its own API.

## How pronunciation works

```
Browser (MediaRecorder, unprocessed mic audio, max 3.5 s)
  → 16 kHz · mono · 16-bit PCM WAV (Web Audio, in the browser)
  → POST /api/pronunciation  (multipart: audio=voice.wav, target=<reference text>)
       ├─ Azure Speech: pronunciation assessment, ar-EG, phoneme granularity   (required)
       └─ IQRA: phoneme recogniser   POST $IQRA_URL/predict                    (best effort, 8 s;
                                     not waited for when Azure alone decides the rule, e.g. accuracy < 70)
  → condition engine (letter_conditions.json + vocabulary_conditions.json)
  → { passed, feedback{rule,message}, scores, details, conditionEvaluation, … }
  → Alif UI: German headline + tip, original Arabic rule message, accuracy bar, retry
```

Only an attempt that matches an explicit `excellent` rule counts as a pass. A lesson's **Weiter** button unlocks after every exercise in it has passed. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the full design and the parity notes.

## Local setup

Requirements: Node.js ≥ 18.18 (20 recommended; see `.nvmrc`).

```bash
npm install
cp .env.example .env.local    # then fill in the values (see below)
npm run dev                   # http://localhost:3000
```

Without any configuration the site still runs. Listening and evaluating then show a clear "nicht verfügbar" message.
`GET /api/health` reports which services are configured. It never returns the values.

## Environment variables

All variables are read on the server only. None of them reaches the browser bundle.

| Variable | Required | Purpose |
| --- | --- | --- |
| `AZURE_SPEECH_KEY` | **yes** | Azure Speech resource key, used for assessment and TTS |
| `AZURE_SPEECH_REGION` | **yes** | Azure region of that resource, e.g. `germanywestcentral` |
| `IQRA_URL` | recommended | Base URL of the IQRA phoneme service, **without** `/predict`. Most letter rules need its phonemes. Without IQRA, those attempts are reported as "not evaluable" and never pass. |
| `INTERNAL_API_KEY` | if the model server uses one | Sent as `X-Internal-Api-Key` to IQRA. It must equal the key configured on that server. |

## Scripts

```bash
npm run dev         # development server
npm run build       # production build
npm start           # serve the production build (PORT env or -p)
npm run typecheck   # tsc --noEmit
npm run lint        # ESLint (next/core-web-vitals + next/typescript)
npm test            # Vitest: unit, API integration and legacy-Masaar parity tests
npm run test:e2e    # Playwright E2E (run `npm run build` first)
```

### E2E tests

`npm run test:e2e` starts three local processes on its own:

- `:3210` runs Alif without any service configuration. It covers the full student journey (the API answer is stubbed) and the real error paths.
- `:3211` runs Alif with the real Azure SDK, plus an IQRA stand-in (`e2e/support/mock-model-server.mjs`) that speak the production contract.
- `:3299` is that stand-in model server.

To include real Azure in the `:3211` run, set `ALIF_E2E_AZURE_KEY` and `ALIF_E2E_AZURE_REGION`. To test a deployed instance with all real services:

```bash
ALIF_E2E_LIVE_URL=https://your-alif.example.com \
ALIF_E2E_FAKE_AUDIO=/path/to/recording-of-alif.wav \
npx playwright test live
```

## Deployment

Alif is a standard Next.js 15 app. It needs no database and no other part of Masaar.

**Vercel** (a `vercel.json` with region `fra1` is included):

1. Import the `Bodzawy/alif` repository in Vercel. It detects Next.js automatically.
2. Set `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`, `IQRA_URL` and `INTERNAL_API_KEY` under *Settings → Environment Variables*.
3. Deploy. Then open `https://<domain>/api/health`: `azureSpeech` and `iqra` should both be `true`.
4. Make sure the IQRA server accepts requests from Vercel (public HTTPS URL and matching `INTERNAL_API_KEY`).

**Any Node host / VPS / Docker:**

```bash
npm ci
npm run build
PORT=3000 npm start          # put it behind HTTPS (the microphone requires a secure context)
```

Notes:

- The microphone only works on `https://` (or `localhost`).
- `/api/pronunciation` may take up to roughly 20 s if Azure is slow. Allow at least 30 s for function or proxy timeouts (`maxDuration = 30` is set for Vercel).
- `microsoft-cognitiveservices-speech-sdk` must stay in `serverExternalPackages` (see `next.config.mjs`). If it is bundled, Azure cancels every assessment in production.
- The API rate limits (30 assessments/min and 60 TTS calls/min per IP) are kept in memory per instance. Use a shared store if you scale out and need strict limits.

## A1 · Lektion 1: structure, routes, old URLs

`src/data/a1/index.ts` holds the lessons (`A1Unit`): Lektion 1 has ten entries
(`A1Lesson`, `kind` letter / review / phrase). Routes: `/a1` → `/a1/<unit>` (contents)
→ `/a1/<unit>/<entry>` (redirects to its first step) → `/a1/<unit>/<entry>/step-N`.
Progress key = the step URL without the leading slash (`a1/lesson-1/ba/step-2`).
The last step of an entry links back to the lesson and on to its next entry.

There is no separate "Laute" step any more: each row of "Wörter" starts with its
sound card (glyph, vowel name, transliteration, listen, speak, feedback). Old URLs
still work (307): `/a1/lesson-1/step-N` → `/a1/lesson-1/alif/step-(N−1)` (step 1 →
Wörter), `/a1/<letter>` → `/a1/lesson-1/<letter>`. Saved progress of Alif's old
steps is copied once per browser to the new keys (`copyMovedA1Progress`).

The words of "Wörter" in every letter entry are **spoken with Tanwin**
(بَيْتٌ, بِطَاقَةٌ, أُمٌّ, مُسْتَشْفًى): `exercise.modelText = withTanwin(arabic)`
(`src/lib/arabic/tanwin.ts`). The card and the pronunciation target stay pausal
(بَيْت / `بيت`), so the rules are unchanged. No Tanwin for words that cannot
take it: pronouns, the article ال, names and question words ending in ا,
indeclinable loanwords (رَادْيُو) and the diptotes in `NO_TANWIN`. Gap steps
(Ergänzen, Hören, Diktat) keep the pausal word: their answer is the final
letter's sign. `npx tsx --env-file=.env.local scripts/verify-tanwin-audio.ts`
checks the real audio (Azure TTS → IQRA phonemes: the word must end in ‑un).

## A1 · Lektion 1: the conversations "صَبَاحُ الْخَيْر"

The two textbook conversations (Ahmad / Ali, Nabila / Fatima – seven lines
each, with the feminine forms حَالُكِ، اسْمُكِ، أَنْتِ for the women) are one
`Dialogue` object each (`src/data/a1/sabah-al-khayr.ts`: two speakers with a
voice each, the lines with Arabic, transliteration, German and the exercise).
Each serves three steps of type `dialogue` (`src/components/a1/dialogue/`):

- **listen** – the whole dialogue or single lines, pause / continue / again,
  translation and transliteration switches, then a comprehension question.
- **repeat** – every line on the guided flow of "Wörter": the model, the
  microphone listens, the SAME evaluation (`/api/pronunciation`: Azure,
  IQRA, condition rules), "Super!", the next line; wrong or silent = again,
  without limit. No microphone / repeated service errors → buttons
  (`PronunciationExercise`).
- **roleplay** – the learner picks a speaker; the app speaks the other role and
  answers only after an accepted line; at the end it closes the conversation.

Voices: `/api/tts` takes an optional `voice` – only `male-1`, `male-2`,
`female-1`, `female-2` (`TTS_DIALOGUE_VOICES` in `src/lib/tts/ssml.ts`);
without it, the lesson voice. Each line's target (unvocalised, no punctuation)
has a rule in `vocabulary_conditions.json`; masculine and feminine lines that
differ only in a vowel (كيف حالك، ما اسمك) share their target. The rules require
only sounds IQRA reliably outputs: the suffix -ka / -ki and a final k / t are
not required (tested against the real IQRA service).

## A1 · Lektion 2: "مَسَاءُ الْخَيْر"

The second book lesson ("مساء الخير.pdf", book pages 23–41), in book order:
`src/data/a1/lesson-2/` (`a1Unit2`, slug `lesson-2`; listed after Lektion 1 in
`A1_LEVEL.units`). The last step of Lektion 1 links on to its first entry
(`nextA1Entry`). The old URL `/a1/lesson-2` (a former word lesson) is now this
lesson; `/a1/lesson-3` … still lead to A0 → Wörter.

- **د ذ و ي** (`dal.ts` … `ya.ts`, built by `lesson2Letter()` in `letter-entry.ts`):
  (١) النطق → Wörter · (٢) كتابة + (٣) سكون → Formen · تدريب ١ → Schreiben ·
  ٢ → Ergänzen · ٣ → Hören · ٤ → Nachsprechen & schreiben (the word plays, the
  learner says it – not evaluated – and writes the letter) · ٨ → Aussprechen
  (evaluated by `sound_conditions.json`) · ٩ → Diktat (each gap has its own
  tiles: the letter with every sign and its look-alikes, `dictationChoices`).
  تدريب ٥–٧ only send the learner to the publisher's website and have no content.
  د ذ و have no "Hand": their Formen step is the book's table (`kind: "positions"` –
  tap the letter in each example word); ي uses the Formen step of Lektion 1.
  Writing sets: `src/data/letters/{dal,dhal,waw,ya}.ts`.
- **حُرُوفُ الْمَدّ** (`huruf-al-madd.ts`): listen and compare (`kind: "compare"`),
  then exercises 1, 2, 3, 5 (`match`), 6, 7 (`word-pick`), 8 (`match`), 9.
  Whether a word has a Dehnungsbuchstabe is computed (`src/lib/arabic/madd.ts`).
  A gap may be a letter without a sign (`GapItem.bare`): a long ا و ي.
- **مَسَاءُ الْخَيْر** (`masa-al-khayr.ts`): Adnan / Khalid and Nazik / Dina
  (seven lines each, feminine forms for the women), Anhören and Nachsprechen
  each, the grammar (`kind: "table"` with a short check), Übung 1 = role-play of
  both, Übung 2 / 3 (`letter-find` over both conversations; Übung 3 offers the
  other letters as practice), the long vowels in the conversations, تذكر.

Pronunciation: one rule per new word and line in `vocabulary_conditions.json`
(same pattern; ذ, a long ī / ū, a final k are not required) and the sounds
دَ … يُ in `sound_conditions.json` (ذ: the vowel only). These gates were NOT yet
checked against real IQRA output. Long vs. short vowels and the -ka / -ki
ending are not evaluated. Every text the new steps speak is on the TTS
allow-list (`a1SpokenTexts`). Pictures: `public/images/a1/{dal,dhal,waw,ya,huruf-al-madd,masa-al-khayr}/`
(hand-drawn SVGs; existing pictures reused where the word is the same).
No recordings exist yet: words are spoken by `/api/tts`, narration clips show as captions.

## A1 · Lektion 3 und 4: Unit 2 of the book ("وجدي.pdf")

`src/data/a1/unit-2/`: the book's Unit 2 as two A1 lessons (its two
presentations; `A1Unit.bookLabel` shows "الوحدة الثانية – تقديم (١/٢)").
Every letter (ر ز س ش ص ض · ف ق ك ل م ن – the unit has no ط ظ ع غ lessons) is
built by `unit2Letter()` (`letter-entry.ts`) in book order: Wörter · Formen (the
book's table) · Schreiben · Ergänzen (تدريب ٢) · Hören (٣) · Nachsprechen &
schreiben (٤) · Mit Dehnung schreiben + Aussprechen (٨) · Diktat (٩, solution
words of "حل تدريب ٩") · Getrennt schreiben (١٠, step type `spell`). Exercises
5–7 point to the publisher's website. Writing sets: `src/data/letters/unit-2.ts`.
`conversations.ts`: the conversations (three speakers each in تقديم ١; one
questioner and six groups in تقديم ٢, role-play by **role groups**,
`Dialogue.roles`), the grammar tables, the review (مراجعة عامة) and the
exercises (step types `quiz` and `cloze`; free name choices accept every
fitting name). Page-by-page mapping: `docs/a1-unit-2-checklist.md`.
Pronunciation: one rule per new word and line (same pattern; no ث / ذ, no long
ī / ū, no final k / t, no pronoun endings – أنتم and أنتن, ‑ta / ‑ti are not
told apart) and the sounds رَ … نُ – not yet checked against real IQRA output.

## A1 · Formen (أ / ـأ): words and audio

The step is data in `src/data/a1/lesson-1.ts` (`kind: "forms"`), rendered by
`src/components/a1/forms/`. It has four parts: **Zuschauen** (an explanation of
the four book words, one scene each – the exercises unlock after it), then
Baue das Wort, Wer hält fest? and Mit Hand oder ohne?. Whether the Hamza-Alif
is held, where it stands (start / middle / end / separate) and which narration
fits are derived from the Arabic text by `src/lib/arabic/hamza-alif.ts` – never
hard-coded. Content comes only from the lesson book (Lesson1.pdf, page 1).

- **Add a word:** add a `formsWord(id, "<vocalised Arabic>", "<German>", "<audio name>", image?)`
  and put it into `explain` (Zuschauen), `build` (Activity 1, in order) or `sort`
  (Activity 3, shown shuffled). Tiles are the letters with their harakat. Give
  `image` only if the picture exists. Neighbours for Activity 2 are in `neighbors`.
- **Audio:** all recordings are WAV files in `public/audio/a1/lesson-1/formen/`
  (`FORMS_AUDIO_BASE`): the 21 exercise clips and the 10 Zuschauen clips listed in
  `components/a1/forms/content.ts`, and one file per word, named after its `audio`
  field: `ana`, `saala`, `saba`, `qaraa`, `ras`.
  The page lists the folder at build time; a missing file is simply never played
  (no request, no error) – add the file and rebuild to enable it. Zuschauen then
  runs on fallback times, so the animation always finishes.
- **Zuschauen texts:** `EXPLAIN_TEXT` in `content.ts` holds the German text of every
  Zuschauen clip. It is shown as the caption and is the script for (re-)recording.
- All narration goes through one reused audio element, unlocked by the "Los geht's!"
  tap, so iOS Safari can play the clips one after another.
- Progress: finishing Activity 3 marks `a1/lesson-1/alif/step-2` as completed (`src/lib/progress.ts`).

## A1 · Schreiben: adding a letter

The handwriting page (`src/components/a1/writing/`) is a port of the prototype
`docs/reference/alif-uebung1.html`. It takes a **letter set** as a prop; a new
letter needs only a data file – no component changes.

1. **Data file:** create `src/data/letters/<letter>.ts` exporting a `WritingLetterSet`
   (`src/data/types.ts`): `{ id, forms: [{ id, glyph, name, strokes: [{ d, arrow, thin? }] }] }`.
   - `forms` in workbook order (right to left); `name` is German and completes
     "Fahr {name} nach." (e.g. "das Alif am Wortende").
   - `strokes` in writing order. A two-stroke form (e.g. أ) has the body first and
     the Hamza second; tracing the second stroke first gives the hint "Zuerst …".
2. **SVG paths (`d`):** drawn in the writing box 240 × 320 with the baseline at
   y = 262 (`WRITING_BOX` in `src/lib/writing/trace.ts`), in the direction the pen
   moves. Easiest: put the workbook screenshot into an SVG editor (Inkscape, Figma)
   on a 240 × 320 artboard, draw each stroke with the pen tool in writing order, and
   copy the path's `d`. Use absolute coordinates; the shapes are approximations that
   the teacher should confirm.
3. **Arrow:** `arrow: { a, b, off }` draws the guide arrow along the part `a → b` of
   the stroke (0–1 of its length), `off` px to the side (negative = the other side).
   Start with `{ a: 0.08, b: 0.55, off: -30 }` and adjust while looking at the page.
4. **thin:** `thin: true` draws a stroke with a thinner pen (62 %), e.g. the Hamza.
5. Add a `kind: "writing"` step with `letterSet` to the lesson in `src/data/a1/`.

Tracing tolerances are in `TRACE_TOL` (`src/lib/writing/trace.ts`), one commented
object, to be tuned on real children's handwriting. In development, `?debug=1`
shows the sampled template points and the last check's values (off in production
builds). Narration can be added in `writing-narration.ts`; the success chime is
synthesised (`src/lib/audio/chime.ts`) and follows the app's mute setting.
Finishing all forms marks the step (e.g. `a1/lesson-1/alif/step-3`) as completed (`src/lib/progress.ts`).

## A1 · Lektion 1: adding a letter (ب ت ث ج ح خ)

Alif is `src/data/a1/lesson-1.ts`; every further letter is a small spec in
`src/data/a1/letters/<id>.ts`, turned into the same five steps as Alif by
`letterLesson()` in `src/data/a1/letter-lesson.ts`: Wörter, Formen, Schreiben,
Ergänzen, Hören. The review (`review.ts`) and the phrase (`sabah-al-khayr.ts`)
reuse the same step types with words of the lesson.

To add a letter – data only:

1. `src/data/a1/letters/<id>.ts`: `letterLesson({ letter, words, forms, writing, formsPictures, gaps })` –
   the words exactly as in the book (`[id, Arabic, German, transliteration, picture]`),
   the four Formen words by position plus the sukun word (`occurrence: -1` when the
   letter appears twice and the book means the last one), and the book's "Ergänzen" /
   "Hören" items as `[pattern, full word, id]` – `"_"` per missing letter, e.g.
   `["_ا_", "بَابْ", "bab"]`; the answers are computed (`src/lib/arabic/gap.ts`).
   List the letter in `a1Unit1.lessons` in `src/data/a1/index.ts`.
2. `src/data/letters/<id>.ts`: the writing set (four forms, book order right to left;
   body first, then `dot: true` strokes with a `label`, e.g. "den Punkt unten", and an
   `orderHint`). Dots are a tap or a short scribble within `TRACE_TOL.dot.radius`
   (`dotStroke()` in `src/data/letters/dots.ts`). Letters with the same body share it:
   ت ث use `BA_BODY` (ba.ts), ج خ use `HAA_BODY` (hha.ts: 1 the top part, 2 the curve).
3. Pronunciation rules: `sound_conditions.json` (the three vocalised sounds) and
   `vocabulary_conditions.json` (each word: Azure ≥ 70 and its consonants in IQRA –
   no initial-vowel gate, which only works for words that begin with a hamza).
   A word that already has a rule (e.g. بيت from A0) shares it.
4. Pictures: `public/images/a1/<id>/<word id>.svg` (400 × 300 illustrations), the
   picture spec is its alt text – or `[src, alt]` for an existing picture of the same
   thing (e.g. an A0 word). `tests/unit/a1-lesson-structure.test.tsx` fails for a
   word without a picture file. If a picture cannot load, the card shows the word
   instead (never a broken image) and logs `Vocabulary picture missing: …`.
5. Recordings: `public/audio/a1/<id>/formen/` – the narration clips
   (`LETTER_NARRATION_FILES`) and one file per Formen word (`<audio id>.wav`).
   The German texts come from `letterFormsTexts()` (caption = recording script;
   override single texts with `texts`). Write the recording script with
   `npx vite-node -c vitest.config.mts scripts/letter-audio-script.ts <id>`
   (→ `docs/audio-scripts/<id>.md`; `… letter-audio-script.ts shared` writes
   `shared.md`). "Ergänzen" / "Hören" use the SHARED clips in `public/audio/a1/shared/`
   and the letter's word recordings in `public/audio/a1/<id>/uebungen/<id>.wav`;
   a word without a recording is spoken by `/api/tts`.

Form, neighbours and basket answers are computed by `src/lib/arabic/letter-form.ts`
(a letter is joined to the one before it when that one has a Hand, and to the next
one when it has a Hand itself). Formen uses the letter variants of "Wer hält fest?"
(slots on both sides) and of the sorting (four baskets) when the step has `forms.letter`.

## Adding a lesson

1. Create `src/data/lessons/words/lesson-N.ts` (A0 → Wörter) that exports a `Lesson` (letter, vocabulary, exercise targets).
2. Register it in `src/data/curriculum.ts`.
3. For new vocabulary words, add rules to `src/lib/pronunciation/vocabulary_conditions.json`: Azure ≥ 70 plus an IQRA gate with the word's important consonants (copy an existing word; see `docs/ARCHITECTURE.md`). Letters already have rules in `letter_conditions.json`.
4. Put images in `public/images/vocabulary/`.
5. Optional intro video: put `de.mp4` and `poster.jpg` in `public/videos/a1/lesson-N/` and set `introVideo` in the lesson. With a video, the lesson card opens `/a1/lesson-N/intro`; without one, it opens the lesson directly and `/intro` is a 404. The mp4 files are not committed (only posters are); in production nginx serves them from outside the repo – see `DEPLOY-VIDEOS.md` for compressing, uploading and cache busting.

Lessons unlock in order (lesson N after lesson N-1 is completed). Switch to "all open" with `LESSONS_UNLOCK_IN_ORDER` in `src/data/lesson-unlock.ts`.

Routes, the TTS allow-list and the API's accepted targets are all derived from the curriculum. `npm test` fails if any lesson is incomplete (3 voweled words, rules, pictures, intro files) or if a word target collides with a letter name or another word.

`npm run lessons:status` prints one line per lesson (words, audio, pictures, intro video) and exits with 1 on any problem. It only reads local files; nothing calls Azure. Content still waiting for native-speaker review is listed in `REVIEW.md`; decisions taken while building lessons 2–28 are in `DECISIONS.md`.

## A1 · Lektion 5–20: the rest of the book „لغتنا الفصحى 1“

From Lektion 5 on, every presentation (تقديم) of the book is one A1 lesson, in
book order (units 3–10, book pages 91–303). Data: `src/data/a1/unit-3/` …
`unit-10/`; page-by-page coverage: `docs/a1-unit-N-checklist.md`; overview and
resume notes: `docs/book-progress.md`.

- New step kinds: `order` (اقرأ ورتب الحوار), `words` (picture words without a
  sound row); quiz items may have `spoken`, `image` and picture options; gap
  items may show the printed letters (`hint`).
- Helpers: `src/lib/arabic/transliterate.ts` (Alif's transliteration),
  `src/lib/arabic/numbers.ts` (number words, phone numbers, prices).
- Pronunciation rules for new words and lines: `npx tsx scripts/a1-rules.ts --write`
  (same scheme as the Unit 2 gates; existing rules are never changed).
- Tests: `tests/unit/a1-book.test.tsx` (every step of every book lesson renders
  and is solvable), `tests/unit/a1-unit-3.test.tsx`, `a1-unit-4.test.tsx`
  (content checks against the book), `e2e/a1-book.spec.ts` (every entry worked
  through on a phone, every step rendered on a desktop). When adding a lesson:
  update `tests/support/a1-units.ts` and `WORD_COUNT` in
  `tests/unit/vocabulary-iqra-gates.test.ts`.
