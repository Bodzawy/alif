# Aufnahme-Skript: Tha (ث) – A1 · Lektion 1 · „Formen", „Ergänzen", „Hören"

Folder for all files: `public/audio/a1/tha/formen/` (WAV). The page plays only files that exist at build time; until a clip is recorded, text-to-speech reads its text (German narration: Azure de-DE-KatjaNeural; words: the lesson voice).
Generated from the lesson data (`src/data/a1/letters/tha.ts`, texts from `letterFormsTexts` in `src/data/a1/letter-lesson.ts`). If a text changes there, change it here too (a unit test checks that both match).

"Wörter" needs no recordings: like Alif, it plays the model pronunciation through /api/tts. The words of "Ergänzen" and "Hören" (section 3) are spoken by /api/tts until their recordings exist. Their German narration is shared by all letters (`docs/audio-scripts/shared.md`).

---

## 1. German narration (31 clips)

### Style instructions (paste first)

```
Read the following German texts as a warm, friendly teacher speaking to children aged 5 to 8.
Speak slowly and clearly, with short natural pauses after each sentence.
Pronounce the Arabic letter name "Tha" the Arabic way (as an Arabic speaker says the letter name), not the German way.
Leave about 2 seconds of silence between paragraphs. Read every paragraph exactly once, in this order. Do not add anything.
```

### Texts (one paragraph per clip, in this order)

```
Heute lernst du die Formen vom Tha. Das Tha sieht nicht immer gleich aus. Hör gut zu und mach mit!

Zuerst schauen wir vier Wörter an. Dann übst du selbst. Schau genau zu.

Das erste Wort bedeutet: Gewand. Hier sind seine Buchstaben. Wir lesen von rechts nach links. Jetzt setzen wir sie zusammen.

Das Tha steht am Anfang. Vor ihm steht nichts. Aber das Tha hat eine Hand. Es hält den nächsten Buchstaben fest.

Das zweite Wort bedeutet: Dienstag. Hier sind seine Buchstaben. Jetzt setzen wir sie zusammen.

Das Tha steht in der Mitte. Der Nachbar davor hält das Tha fest. Und das Tha hält den nächsten Buchstaben fest.

Das dritte Wort bedeutet: Drittel. Hier sind seine Buchstaben. Jetzt setzen wir sie zusammen.

Das Tha steht am Ende. Der Nachbar davor hält das Tha fest. Nach dem Tha kommt nichts mehr.

Das letzte Wort bedeutet: Möbel. Hier sind seine Buchstaben. Jetzt setzen wir sie zusammen.

Auch hier steht ein Nachbar vor dem Tha. Aber er hat keine Hand. Und nach dem Tha kommt nichts mehr. Darum steht das Tha allein.

Hast du es gesehen? Das Tha hat immer eine Hand für den nächsten Buchstaben. Und der Nachbar davor hält es fest, wenn er eine Hand hat. Jetzt bist du dran!

Baue das Wort! Leg die Buchstaben von rechts nach links in die Felder.

Hmm, der passt hier nicht. Versuch einen anderen.

Super! Du hast alle vier Wörter gebaut.

Richtig! Das Tha steht am Anfang. Es hält den nächsten Buchstaben fest.

Richtig! Das Tha steht in der Mitte. Es wird festgehalten und hält selbst fest.

Richtig! Das Tha steht am Ende. Der Nachbar davor hält es fest.

Richtig! Das Tha steht allein. Der Nachbar davor hat keine Hand.

Wer hält fest? Leg einen Nachbarn rechts neben das Tha. Dort steht der Buchstabe davor. Oder leg ihn links daneben. Dort steht der Buchstabe danach.

Der Nachbar hat eine Hand. Er hält das Tha fest.

Dieser Nachbar hat keine Hand. Er hält das Tha nicht fest.

Das Tha hat eine Hand. Es hält den nächsten Buchstaben fest.

Das Tha hat eine Hand. Es hält immer den nächsten Buchstaben fest. Und der Nachbar davor hält das Tha fest, wenn er eine Hand hat.

Wo steht das Tha? Am Anfang, in der Mitte, am Ende oder allein? Leg jedes Wort in den richtigen Korb.

Richtig! Das Tha steht am Anfang.

Richtig! Das Tha steht in der Mitte.

Richtig! Das Tha steht am Ende.

Richtig! Das Tha steht allein.

Fast! Schau genau: Wer hält das Tha fest? Und hält das Tha einen Buchstaben fest?

Schau noch einmal genau hin. Dann versuch es noch einmal.

Toll! Du kennst jetzt alle Formen vom Tha.
```

### File names (same order)

1. `f_intro.wav` – Heute lernst du die Formen vom Tha. Das Tha sieht nicht immer gleich aus. Hör gut zu und mach mit!
2. `e_intro.wav` – Zuerst schauen wir vier Wörter an. Dann übst du selbst. Schau genau zu.
3. `e_start_a.wav` – Das erste Wort bedeutet: Gewand. Hier sind seine Buchstaben. Wir lesen von rechts nach links. Jetzt setzen wir sie zusammen.
4. `e_start_b.wav` – Das Tha steht am Anfang. Vor ihm steht nichts. Aber das Tha hat eine Hand. Es hält den nächsten Buchstaben fest.
5. `e_middle_a.wav` – Das zweite Wort bedeutet: Dienstag. Hier sind seine Buchstaben. Jetzt setzen wir sie zusammen.
6. `e_middle_b.wav` – Das Tha steht in der Mitte. Der Nachbar davor hält das Tha fest. Und das Tha hält den nächsten Buchstaben fest.
7. `e_end_a.wav` – Das dritte Wort bedeutet: Drittel. Hier sind seine Buchstaben. Jetzt setzen wir sie zusammen.
8. `e_end_b.wav` – Das Tha steht am Ende. Der Nachbar davor hält das Tha fest. Nach dem Tha kommt nichts mehr.
9. `e_separate_a.wav` – Das letzte Wort bedeutet: Möbel. Hier sind seine Buchstaben. Jetzt setzen wir sie zusammen.
10. `e_separate_b.wav` – Auch hier steht ein Nachbar vor dem Tha. Aber er hat keine Hand. Und nach dem Tha kommt nichts mehr. Darum steht das Tha allein.
11. `e_outro.wav` – Hast du es gesehen? Das Tha hat immer eine Hand für den nächsten Buchstaben. Und der Nachbar davor hält es fest, wenn er eine Hand hat. Jetzt bist du dran!
12. `b_intro.wav` – Baue das Wort! Leg die Buchstaben von rechts nach links in die Felder.
13. `b_wrong.wav` – Hmm, der passt hier nicht. Versuch einen anderen.
14. `b_all.wav` – Super! Du hast alle vier Wörter gebaut.
15. `b_done_start.wav` – Richtig! Das Tha steht am Anfang. Es hält den nächsten Buchstaben fest.
16. `b_done_middle.wav` – Richtig! Das Tha steht in der Mitte. Es wird festgehalten und hält selbst fest.
17. `b_done_end.wav` – Richtig! Das Tha steht am Ende. Der Nachbar davor hält es fest.
18. `b_done_separate.wav` – Richtig! Das Tha steht allein. Der Nachbar davor hat keine Hand.
19. `n_intro.wav` – Wer hält fest? Leg einen Nachbarn rechts neben das Tha. Dort steht der Buchstabe davor. Oder leg ihn links daneben. Dort steht der Buchstabe danach.
20. `n_hold.wav` – Der Nachbar hat eine Hand. Er hält das Tha fest.
21. `n_nohold.wav` – Dieser Nachbar hat keine Hand. Er hält das Tha nicht fest.
22. `n_next.wav` – Das Tha hat eine Hand. Es hält den nächsten Buchstaben fest.
23. `n_rule.wav` – Das Tha hat eine Hand. Es hält immer den nächsten Buchstaben fest. Und der Nachbar davor hält das Tha fest, wenn er eine Hand hat.
24. `s_intro.wav` – Wo steht das Tha? Am Anfang, in der Mitte, am Ende oder allein? Leg jedes Wort in den richtigen Korb.
25. `s_ok_start.wav` – Richtig! Das Tha steht am Anfang.
26. `s_ok_middle.wav` – Richtig! Das Tha steht in der Mitte.
27. `s_ok_end.wav` – Richtig! Das Tha steht am Ende.
28. `s_ok_separate.wav` – Richtig! Das Tha steht allein.
29. `s_hint.wav` – Fast! Schau genau: Wer hält das Tha fest? Und hält das Tha einen Buchstaben fest?
30. `s_replay.wav` – Schau noch einmal genau hin. Dann versuch es noch einmal.
31. `s_done.wav` – Toll! Du kennst jetzt alle Formen vom Tha.

---

## 2. Arabic words (5 recordings)

### Style instructions (paste first)

```
Read the following Arabic words in Modern Standard Arabic, exactly as written, with all vowel marks.
Speak slowly and clearly. Read each line exactly once, in this order.
Leave about 2 seconds of silence between lines. Do not add anything.
```

### Lines (in this order)

```
ثَوْب
الثُّلَاثَاءُ
ثُلُث
أَثَاث
أَثْنَاءَ
```

### File names (same order)

1. `thawb.wav` – ثَوْب (Gewand)
2. `aththulatha.wav` – الثُّلَاثَاءُ (Dienstag)
3. `thuluth.wav` – ثُلُث (Drittel)
4. `athath.wav` – أَثَاث (Möbel)
5. `athna.wav` – أَثْنَاءَ (während)

---

## 3. Arabic words of "Ergänzen" and "Hören" (10 recordings, optional)

Folder: `public/audio/a1/tha/uebungen/` (WAV). Same style instructions as section 2.

### Lines (in this order)

```
ثَلَاثَة
ثِمَار
ثَوْم
ثِيَاب
ثُعْبَان
ثُلُث
ثُقْب
ثَوْب
ثِقَاب
أَثْنَاء
```

### File names (same order)

1. `thalatha.wav` – ثَلَاثَة (drei)
2. `thimar.wav` – ثِمَار (Früchte)
3. `thawm.wav` – ثَوْم (Knoblauch)
4. `thiyab.wav` – ثِيَاب (Kleider)
5. `thuban.wav` – ثُعْبَان (Schlange)
6. `thuluth.wav` – ثُلُث (Drittel)
7. `thuqb.wav` – ثُقْب (Loch)
8. `thawb.wav` – ثَوْب (Gewand)
9. `thiqab.wav` – ثِقَاب (Streichhölzer)
10. `athna.wav` – أَثْنَاء (während)
