# A1 · Lektion 1 · Schritt 2 – geführter Modus: Dateien

Nichts wurde committet; der Git-Zustand wurde nicht angefasst.

## Neu

- `src/lib/audio/guided-mic.ts` – Mikrofon für den geführten Modus: einmal beim Start-Tipp geöffnet (`GUIDED_MIC_CONSTRAINTS` = `MIC_CONSTRAINTS` aus `recording.ts`: `channelCount` 1, `echoCancellation`, `noiseSuppression`, `autoGainControl` = false – die Browser-Filter haben kurze Laute verzerrt, z. B. die Hamza in أُ, und die Echo-Unterdrückung hat den Anfang der Antwort nach dem Vorsprech-Ton verschluckt), Sprach-Erkennung per RMS aus einem `AnalyserNode` (Werte in `GUIDED_VAD`), `release()` stoppt die Spuren.
- `src/components/a1/guided/evaluate.ts` – schickt eine Aufnahme an dieselbe Auswertung wie „Aufnehmen“ (`blobTo16KhzMonoWav` → `submitRecording` → `toStudentFeedback(...).passed`); unterscheidet richtig / falsch / Dienstfehler.
- `src/components/a1/guided/guided-flow.ts` – Zustandsmaschine (Reducer + `useGuidedFlow`): focus → play → listen → check → right („Super!“) / noch einmal – unbegrenzt viele Versuche (kein „needs practice“ mehr), Pause bei `visibilitychange`, Rückfall nach 2 Dienstfehlern.
- `src/components/a1/guided/guided-sound-words.tsx` – Start-Karte „Los geht's!“, Blöcke (Unschärfe, Vergrößerung, Tönungen, Hör-Zeichen, Beschriftungen, aria-live), Speichern / Fortsetzen, Rückfall auf die Knopf-Seite.
- `tests/unit/a1-guided.test.tsx` – Unit-Tests (falsche Uhr, falsches Mikrofon, gemockte Auswertung).
- `e2e/a1-guided.spec.ts` – E2E bei 390 px mit Fake-Media und gemockten Routen `/api/pronunciation` und `/api/tts`.
- `docs/reports/schritt-2-guided-files.md` – diese Liste.

## Geändert

- `src/app/a1/[lesson]/[step]/page.tsx` – Schritt-Art „sound-words“ rendert jetzt `GuidedSoundWords` (statt direkt `SoundWordsStep`) mit dem bestehenden Fortschritts-Schlüssel `a1/lesson-1/step-2`.
- `src/components/a1/sound-words-step.tsx` – optionale Eigenschaft `guided` (Rahmen um jede Karte, Knöpfe versteckt). Ohne sie ist die Seite unverändert (so im Rückfall).
- `src/components/a1/sound-card.tsx` – optionale Eigenschaft `hideControls` (Standard: false → unverändert).
- `src/components/lessons/vocabulary-card.tsx` (geteilt mit A0 · Wörter) – optionale Eigenschaft `hideControls` (Standard: false → A0 unverändert).
- `src/lib/audio/narration.ts` (geteilt) – neue Methode `playUrl(url)`: spielt eine beliebige URL über dasselbe eine Audio-Element mit denselben Stumm- und Unterbrechungs-Regeln. Bestehende Methoden unverändert.
- `src/lib/tts/player.ts` (geteilt) – neuer Export `speechUrl(text)`: liefert die bereits vorhandene, gecachte `/api/tts`-URL. `speakArabic` unverändert.
- `src/lib/audio/voice-activity.ts` (geteilt, A0) – nur der Typ der Optionen von `createSpeechGate` wurde zu `SpeechGateOptions` erweitert (vorher an die festen A0-Werte gebunden); Logik und A0-Werte unverändert.
- `e2e/support/helpers.ts` – zwei Helfer: `refuseGuidedMicrophone` (lehnt nur die Mikrofon-Anfrage des geführten Modus ab) und `openButtonMode`.
- `e2e/a1.spec.ts` – die bestehenden Schritt-2-Tests der Knöpfe öffnen jetzt zuerst die Knopf-Seite (Rückfall); der Desktop-Layout-Test prüft die Reihen in beiden Modi. Die Prüfungen selbst sind gleich geblieben.
