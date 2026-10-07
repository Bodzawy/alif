# Übung 5 "Ergänzen" and 6 "Hören" (A1 · Lektion 1 · Schritt 5/6) – files

Created or changed for steps 5 and 6 only, on top of the uncommitted earlier
work (no commit, no stash, no branch). Line numbers refer to the working tree
as of 7 Oct 2026, after this task.

## New

| File | What it is |
|---|---|
| `public/audio/a1/lesson-1/uebungen/*.wav` | The 10 narration files from `~/Downloads/alif-uebungen-5-6.zip`, unchanged (g5_intro, g6_intro, g_ok, g_hint, g_reveal_a, g_reveal_i, g_reveal_u, g_reveal_sukun, g5_done, g6_done) |
| `src/lib/arabic/gap.ts` | Pure util: gap, answer, vowel, before/after and drawing pieces computed from the full word; `piecesAreSafe` guard |
| `src/lib/audio/narrate.ts` | `narrateWithFallback` / `sleep`: wait for a clip or its fallback time (same logic as Zuschauen, as a shared helper; Zuschauen itself not changed) |
| `src/components/a1/gaps/content.ts` | `GAPS_TEXT` (caption + recording script for the 10 keys), shared clip keys, fallbacks, star rule |
| `src/components/a1/gaps/gaps-step.tsx` | The shared component for both steps (start card, items, drag/tap/keyboard, hint/reveal, result screen "Korrigieren") |
| `tests/unit/a1-gaps.test.tsx` | Unit tests: 19 items, guard, text table, stars, flow (also with all audio missing, fake timers), mute, navigation, progress keys |
| `e2e/a1-gaps.spec.ts` | E2E (390 px): both steps to the result screen, tap and touch drag, no page scroll, narration at each moment, sukun item, pills on two lines |
| `docs/reports/uebung-5-6-files.md` | This list |

## Modified (shared files – only these parts)

| File | Change |
|---|---|
| `src/data/types.ts` | Lines 151–154: new union member `kind: "gaps"` with `gaps: GapsContent` in `A1Step`. Lines 156–181: new types `GapItem` and `GapsContent` with their comment. |
| `src/data/a1/lesson-1.ts` | Line 2: `GapItem` added to the type import. Lines 11–24: `UEBUNGEN_AUDIO_BASE` and the `gapItem()` helper (pictures point to the Schritt 2 files). Lines 131–181: the `step-5` and `step-6` objects. Earlier steps untouched. |
| `src/app/a1/[lesson]/[step]/page.tsx` | Line 10: `import { GapsStep }`. Lines 44–55: `PillTitle` (on phones a pill shows only the part before ":" so six pills fit on two lines; full title from `sm` up and always in the text). Line 70: container width also for `gaps`. Line 99: the pill uses `PillTitle`. Lines 112–116: the `writing` branch became an explicit `step.kind === "writing"` case, new `GapsStep` branch. |
| `tests/unit/a1.test.tsx` | Lines 26–30: six steps. |
| `tests/unit/a1-writing-step.test.tsx` | Pills list (6 pills), "Schritt 3/4 von 6", step-4 now leads to "Weiter: Ergänzen". |
| `e2e/a1.spec.ts` | "Schritt 1 von 6". |
| `e2e/a1-forms.spec.ts` | Navigation test: "Schritt 3 von 6". |
| `e2e/a1-writing.spec.ts` | First test: "Schritt 4 von 6", "Weiter: Ergänzen", and a fresh visit shows no "Geschafft" badge (step-4 check). |
| `e2e/levels.spec.ts` | Link check: `/a1/lesson-1/step-5` and `/a1/lesson-1/step-6` added. |

Not changed: Schritt 2 data and pictures, Formen/Zuschauen, Schreiben components,
`src/lib/audio/narration.ts`, `src/lib/progress.ts`, `src/lib/arabic/hamza-alif.ts`.
