# Alif – architecture and origin of the pronunciation system

## 1. What was taken from Masaar

The reference implementation is `Bodzawy/masaar` (branch `master`, commit `edea012`). Its pronunciation feature consists of these parts:

| Masaar file | Role | In Alif |
| --- | --- | --- |
| `src/app/api/pronunciation/route.ts` | Azure + MASAAR + IQRA in parallel, legacy scores, condition engine, response | Split into `lib/pronunciation/services/azure.ts`, `services/models.ts`, `assessment.ts` and a thin `app/api/pronunciation/route.ts` |
| `src/lib/pronunciation/condition-engine.ts` | Rule evaluation (`azure_accuracy`, `azure_recognized`, `iqra_phonemes contains / does not contain`) | `lib/pronunciation/condition-engine.ts`: identical logic |
| `src/lib/pronunciation/letter_conditions.json` | Rules and Arabic feedback for the 28 letters | Byte-identical copy |
| `src/lib/pronunciation/letters.ts` | Alphabet: reference text for Azure and the rules, vocalised TTS text | `lib/pronunciation/letters.ts`: same data |
| `src/lib/audio/wav.ts` | Browser recording → 16 kHz mono 16-bit WAV | `lib/audio/wav.ts`: same algorithm |
| `src/app/api/tts/route.ts` | Azure TTS, `ar-SA-ZariyahNeural`, rate −8 %, MP3 24 kHz | `app/api/tts/route.ts` + `lib/tts/ssml.ts`: same voice, prosody and format |
| `src/components/trainer/pronunciation-trainer.tsx` | Newest recorder: unprocessed mic, 3.5 s max, 0.4 s min, 30 s timeout, cleanup | `components/pronunciation/use-pronunciation-exercise.ts` + `lib/audio/recording.ts` |
| `src/app/student/pronunciation/learn/page.tsx` | Older learn page: spoken cue "مُمْتَاز" / "حاول مرة أخرى" after a result | Same cues (`lib/pronunciation/cues.ts`) |
| `next.config.mjs` → `serverExternalPackages` | Prevents bundling the Azure SDK, which otherwise breaks it in production | Same setting |

The following Masaar parts were **not** taken over, because the pronunciation feature does not need them: authentication (JWT/bcrypt/Prisma), middleware, student/teacher/admin areas, database, the host-based trainer rewrite for `dev.dz2s.de`, and dead code in the old route (`CONFUSION_REFERENCES`, `WRONG_LETTER_MARGIN`; both were unused).

## 2. Preserved behaviour (parity)

- **Azure:** `ar-EG`, `HundredMark`, `Phoneme` granularity, miscue on, `fromWavFileInput`, same mapping of words and phonemes, `firstSoundScore` = first phoneme of the first word.
- **MASAAR / IQRA:** `POST <URL>/predict`, multipart field `audio` named `voice.wav`, `X-Internal-Api-Key` only when it is configured, 8 s timeout, `null` on failure or `{ ok: false }`, and IQRA phonemes filtered to strings. MASAAR is evaluated and returned but, as in Masaar, it does not influence the result.
- **Decision:** legacy thresholds `MIN_ACCURACY = 65` and `MIN_FIRST_SOUND_SCORE = 55` set only `failureReason`. The condition rules decide `passed`, and only the `excellent` rule passes. If no rule matches, the attempt never passes; the response carries `no_matching_rule` and the original Arabic fallback message.
- **Response shape:** identical (`target, recognized, passed, failureReason, scores, details{masaar,azure,iqra}, conditionEvaluation, discrimination, words`).
- **Condition engine:** verified against the Masaar engine on 43,500 randomised inputs across all 28 letters, with identical results.

## 3. Deliberate differences (each with a concrete reason)

| Change | Reason |
| --- | --- |
| Response also contains `feedback: {rule, message}` | Masaar's learn page read `feedback.message`, but the API never sent it, so students only saw a generic "✅ ممتاز!". The value equals `conditionEvaluation.message`. |
| Vocabulary rules in a separate `vocabulary_conditions.json` | Lesson 1 needs words (أسد, أرنب, أناناس), and Masaar only had rules for letter names. The words use the same syntax and the same 70 % Azure threshold as the letter rule for ألف. The letter file is untouched, and merging fails loudly on any duplicate key. |
| Upload validation (RIFF/WAVE header, ≤ 2 MB, ≥ 100 ms) | Invalid audio is rejected with a clear message before paid services are called. |
| Azure timeout of 20 s (the HTTP layer answers 504) | Masaar's `recognizeOnceAsync` had no upper bound and could hang until the platform killed the request. |
| Error answers carry `{ error (German), code }` with status 400/413/422/429/502/503/504 | Students never see a bare "Error". Technical details are logged on the server only. |
| `/api/tts` accepts only texts from the curriculum and the feedback cues | Without a login, an open TTS endpoint would be a free Azure proxy. |
| Per-IP in-memory rate limits | Same reason: protects the paid Azure endpoints. |
| `AudioContext` is closed on conversion errors too | Avoids leaking one context per failed attempt. |

## 4. Structure

```
src/
  app/
    page.tsx                     home: level overview
    [level]/page.tsx             lesson list (A0)
    [level]/[lesson]/page.tsx    lesson (statically generated from the curriculum)
    api/pronunciation/route.ts   evaluation pipeline
    api/tts/route.ts             model pronunciation
    api/health/route.ts          configuration check (booleans only)
  components/
    lessons/                     LessonPlayer, LetterHero, VocabularyCard, LessonComplete, status, progress hook
    pronunciation/               exercise hook (state machine), record button, feedback panel
    audio/                       listen button
    ui/                          header, footer, button, logo
  data/
    types.ts                     Level / Lesson / VocabularyItem / PronunciationExercise
    curriculum.ts                registry of all levels and lessons
    lessons/a0/lesson-1.ts       Lesson 1 content
  lib/
    audio/                       WAV encoding (browser), WAV header check (server), recording constants
    pronunciation/               condition engine, rules, letters, targets, assessment, client mapping, errors, config
    pronunciation/services/      azure.ts, models.ts (MASAAR + IQRA), server-only
    tts/                         SSML builder, browser player with cache
    progress.ts                  per-browser lesson progress (swap for a server store when accounts exist)
    rate-limit.ts
```

Server-only modules import `server-only`. A production build check confirmed that no keys, rule data or SDK code end up in `.next/static`.

## 5. Authentication later

Nothing in the lesson flow depends on a user identity. To add accounts:

1. Add an auth layer (e.g. a session cookie) and middleware.
2. Replace `lib/progress.ts` (localStorage) with an API backed by a database.
3. Use the user id instead of the IP as the rate-limit key.
