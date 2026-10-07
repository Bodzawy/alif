# Schritt 2 guided mode – files

## New

- `src/components/a1/guided/evaluate.ts` — adapts the existing WAV conversion and pronunciation API to guided verdicts without changing evaluation rules.
- `src/components/a1/guided/guided-flow.ts` — explicit cancellable state machine, retries, round two, visibility pause, and cleanup.
- `src/components/a1/guided/guided-sound-words.tsx` — start card, guided block frames, narration, microphone lifecycle, progress, and fallback.
- `src/lib/audio/guided-mic.ts` — one permission request and RMS based single utterance recording.
- `src/lib/audio/narration.ts` — shared reusable audio element narrator with mute, unlock, and URL playback.
- `src/lib/audio/narrate.ts` — abortable narration wait helpers.
- `tests/unit/a1-guided.test.tsx` — guided state and flow tests with mocked microphone and evaluation.
- `e2e/a1-guided.spec.ts` — phone viewport guided and fallback tests with mocked services.
- `docs/reports/schritt-2-guided-files.md` — this change inventory.

## Modified

- `src/components/a1/sound-card.tsx` — added optional `hideControls` for guided frames; button mode remains the default.
- `src/components/a1/sound-words-step.tsx` — added guided frame/passed hooks while preserving the existing button layout.
- `src/components/lessons/vocabulary-card.tsx` — added optional hidden controls and simple feedback for guided mode.
- `src/lib/audio/voice-activity.ts` — generalized speech gate option types so guided mode can set its own timing.
- `src/lib/tts/player.ts` — exported the cached speech URL used for playback through the shared narrator.
- `src/app/a1/[lesson]/[step]/page.tsx` — renders guided mode for sound-word steps with the existing progress key.
- `e2e/a1.spec.ts` — opens button fallback before legacy mobile button layout checks.
- `e2e/support/helpers.ts` — helpers to refuse the guided mic request and open the fallback page.
- `src/components/a1/guided/guided-sound-words.tsx` — after speech URL resolution, checks cancellation before starting playback; scrolls only the focused block into view.

## Verification

- Typecheck, lint, production build, and all unit tests passed: 703 tests.
- Guided e2e passed in Chromium (6/6) and Firefox (6/6); the 390 px initial guided layout passed in WebKit (1/1).
- The Playwright WebKit build here rejects microphone access before the guided flow can start, so only its visual entry-layout case can run in this environment.
- The related A1 guided and legacy layout e2e checks passed in Chromium (10/10). The whole existing e2e suite was attempted: 20 passed, 8 failed, 1 interrupted, and 23 were not run. Failures were in existing A1 API validation and A0 alphabet/API flows outside this guided-mode change.
- Voice detection uses RMS 0.015, a 120 ms speech onset, 1,000 ms trailing silence, a 4,000 ms speech cap, a 5,000 ms no-speech timeout, and 30 ms polling. Layout uses 6 px blur, 0.60 opacity, 1.05 scale, 10% success/accent tints, and 400 ms transitions.
- A successful full run makes 12 evaluation calls; the maximum before the run ends is 72 (three wrong spoken attempts for each of 12 blocks in each of two rounds). Silence is never submitted, and two consecutive service errors trigger fallback sooner.
- Real microphone, iPhone/iPad, children's voices, and noisy-room behavior remain unverified.
