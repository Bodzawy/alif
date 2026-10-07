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
└── A1                                   /a1 – placeholder, new content to come
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
       ├─ MASAAR: letter classifier  POST $MASAAR_URL/predict                  (best effort, 8 s)
       └─ IQRA: phoneme recogniser   POST $IQRA_URL/predict                    (best effort, 8 s)
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
| `MASAAR_URL` | recommended | Base URL of the MASAAR model service, **without** `/predict` |
| `IQRA_URL` | recommended | Base URL of the IQRA phoneme service, **without** `/predict`. Most letter rules need its phonemes. Without IQRA, those attempts are reported as "not evaluable" and never pass. |
| `INTERNAL_API_KEY` | if the model server uses one | Sent as `X-Internal-Api-Key` to MASAAR and IQRA. It must equal the key configured on that server. |

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
- `:3211` runs Alif with the real Azure SDK, plus MASAAR and IQRA stand-ins (`e2e/support/mock-model-server.mjs`) that speak the production contract.
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
2. Set `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`, `MASAAR_URL`, `IQRA_URL` and `INTERNAL_API_KEY` under *Settings → Environment Variables*.
3. Deploy. Then open `https://<domain>/api/health`: `azureSpeech`, `masaar` and `iqra` should all be `true`.
4. Make sure the MASAAR/IQRA server accepts requests from Vercel (public HTTPS URL and matching `INTERNAL_API_KEY`).

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

## A1 · Schritt 3 "Formen" (أ / ـأ): words and audio

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
- Progress: finishing Activity 3 marks `a1/lesson-1/step-3` as completed (`src/lib/progress.ts`).

## A1 · Schritt 4 "Schreiben": adding a letter

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
Finishing all forms marks `a1/lesson-1/step-4` as completed (`src/lib/progress.ts`).

## Adding a lesson

1. Create `src/data/lessons/words/lesson-N.ts` (A0 → Wörter) that exports a `Lesson` (letter, vocabulary, exercise targets).
2. Register it in `src/data/curriculum.ts`.
3. For new vocabulary words, add rules to `src/lib/pronunciation/vocabulary_conditions.json`: Azure ≥ 70 plus an IQRA gate with the word's important consonants (copy an existing word; see `docs/ARCHITECTURE.md`). Letters already have rules in `letter_conditions.json`.
4. Put images in `public/images/vocabulary/`.
5. Optional intro video: put `de.mp4` and `poster.jpg` in `public/videos/a1/lesson-N/` and set `introVideo` in the lesson. With a video, the lesson card opens `/a1/lesson-N/intro`; without one, it opens the lesson directly and `/intro` is a 404. The mp4 files are not committed (only posters are); in production nginx serves them from outside the repo – see `DEPLOY-VIDEOS.md` for compressing, uploading and cache busting.

Lessons unlock in order (lesson N after lesson N-1 is completed). Switch to "all open" with `LESSONS_UNLOCK_IN_ORDER` in `src/data/lesson-unlock.ts`.

Routes, the TTS allow-list and the API's accepted targets are all derived from the curriculum. `npm test` fails if any lesson is incomplete (3 voweled words, rules, pictures, intro files) or if a word target collides with a letter name or another word.

`npm run lessons:status` prints one line per lesson (words, audio, pictures, intro video) and exits with 1 on any problem. It only reads local files; nothing calls Azure. Content still waiting for native-speaker review is listed in `REVIEW.md`; decisions taken while building lessons 2–28 are in `DECISIONS.md`.
