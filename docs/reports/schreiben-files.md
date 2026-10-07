# Schreiben (A1 · Lektion 1 · Schritt 4) – files

Everything below was created or changed for the "Schreiben" step only, on top of
the uncommitted Formen/Zuschauen work (no commit, no stash, no branch). Line
numbers refer to the working tree as of 6 Oct 2026, after this task.

## New

| File | What it is |
|---|---|
| `docs/reference/alif-uebung1.html` | The prototype (copy of `~/Downloads/alif-uebung1.html`; `alif-uebung1_1.html` is byte-identical) |
| `src/data/letters/alif.ts` | Letter data: the four Alif forms (SVG paths, arrows, `thin`) – unchanged from the prototype's `FORMS` |
| `src/lib/writing/trace.ts` | Pure util: `WRITING_BOX`, `TRACE_TOL`, `dist`/`minDist`/`pathLen`/`resample`, `evaluate`, `starsFor`, `arrowPoints`, demo timing, `debugEnabled` |
| `src/lib/audio/chime.ts` | Synthesised success chime (prototype oscillators), honours the app's mute setting via `readMuted()` |
| `src/components/a1/writing/writing-step.tsx` | The page component (sheet, board, one RAF loop, pointer input, completion, debug panel) |
| `src/components/a1/writing/draw.ts` | Canvas drawing (poly, baseline, arrows, start dot, demo) and the token palette |
| `src/components/a1/writing/sample-path.ts` | Browser-only path sampling (`getTotalLength`) |
| `src/components/a1/writing/writing-narration.ts` | Empty narration hook `useWritingNarration()` – the place to add recordings later |
| `tests/unit/writing-trace.test.ts` | Unit tests for `evaluate()` and helpers (synthetic polylines) |
| `tests/unit/a1-writing-step.test.tsx` | Step registration, pills, Formen → Schreiben navigation |
| `e2e/a1-writing.spec.ts` | E2E (390 px): mouse + touch strokes, hints, skip, Geschafft, debug off in prod, reduced motion |
| `docs/reports/schreiben-files.md` | This list |

## Modified (shared files – only these parts)

| File | Change |
|---|---|
| `src/data/types.ts` | Lines 147–150: new union member `kind: "writing"` with `letterSet` in `A1Step`. Lines 152–190 (end of file): new types `WritingStroke`, `WritingForm`, `WritingLetterSet` with their comment block. Nothing else. |
| `src/data/a1/lesson-1.ts` | Line 1: `import { alifWriting } from "@/data/letters/alif";`. Lines 110–116: the `step-4` object (`kind: "writing"`, title `Schreiben: ا · ـا · أ · ـأ`, `navLabel: "Schreiben"`, `letterSet`). Formen content untouched. |
| `src/app/a1/[lesson]/[step]/page.tsx` | Line 10: `import { WritingStep }`. Line 57: container width – added `step.kind === "writing" ? "max-w-5xl"` to the ternary. Lines 97–101: the `forms` branch became `step.kind === "forms" ? (…FormsStep…) : (<WritingStep …/>)` (the FormsStep line itself is unchanged). The back/next buttons needed no change ("Weiter: Schreiben" comes from `navLabel`). |
| `tailwind.config.ts` | Line 34: keyframes `pop`; lines 43–44: animation `pop` (stars toast). |
| `README.md` | Lines 158–187: new section "A1 · Schritt 4 "Schreiben": adding a letter" (inserted before "## Adding a lesson"). |
| `tests/unit/a1.test.tsx` | Lines 26–30: the lesson now has four steps (`step-4`, `writing`). |
| `e2e/a1.spec.ts` | Line 73: "Schritt 1 von 4". |
| `e2e/a1-forms.spec.ts` | Lines 47–57 (navigation test only): title, "Schritt 3 von 4", bottom-right is now "Weiter: Schreiben" → `/a1/lesson-1/step-4` (was "Zurück zu A1"). |
| `e2e/levels.spec.ts` | Lines 83 and 88: `/a1/lesson-1/step-4` added to the link check. |

Not changed: Formen/Zuschauen components, their data and audio, `src/lib/audio/narration.ts`
(only `readMuted` is imported), `src/lib/progress.ts` (used as is), `globals.css`.
