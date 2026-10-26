# Aufnahme-Skript: Dschim (ج) – A1 · Lektion 1 · „Formen", „Ergänzen", „Hören"

Folder for all files: `public/audio/a1/jim/formen/` (WAV). The page plays only files that exist at build time; until a clip is recorded, text-to-speech reads its text (German narration: Azure de-DE-KatjaNeural; words: the lesson voice).
Generated from the lesson data (`src/data/a1/letters/jim.ts`, texts from `letterFormsTexts` in `src/data/a1/letter-lesson.ts`). If a text changes there, change it here too (a unit test checks that both match).

"Wörter" needs no recordings: like Alif, it plays the model pronunciation through /api/tts. The words of "Ergänzen" and "Hören" (section 3) are spoken by /api/tts until their recordings exist. Their German narration is shared by all letters (`docs/audio-scripts/shared.md`).

---

## 1. German narration (31 clips)

### Style instructions (paste first)

```
Read the following German texts as a warm, friendly teacher speaking to children aged 5 to 8.
Speak slowly and clearly, with short natural pauses after each sentence.
Pronounce the Arabic letter name "Dschim" the Arabic way (as an Arabic speaker says the letter name), not the German way.
Leave about 2 seconds of silence between paragraphs. Read every paragraph exactly once, in this order. Do not add anything.
```

### Texts (one paragraph per clip, in this order)

```
Heute lernst du die Formen vom Dschim. Das Dschim sieht nicht immer gleich aus. Hör gut zu und mach mit!

Zuerst schauen wir vier Wörter an. Dann übst du selbst. Schau genau zu.

Das erste Wort bedeutet: Kamele. Hier sind seine Buchstaben. Wir lesen von rechts nach links. Jetzt setzen wir sie zusammen.

Das Dschim steht am Anfang. Vor ihm steht nichts. Aber das Dschim hat eine Hand. Es hält den nächsten Buchstaben fest.

Das zweite Wort bedeutet: der Soldat. Hier sind seine Buchstaben. Jetzt setzen wir sie zusammen.

Das Dschim steht in der Mitte. Der Nachbar davor hält das Dschim fest. Und das Dschim hält den nächsten Buchstaben fest.

Das dritte Wort bedeutet: Reife. Hier sind seine Buchstaben. Jetzt setzen wir sie zusammen.

Das Dschim steht am Ende. Der Nachbar davor hält das Dschim fest. Nach dem Dschim kommt nichts mehr.

Das letzte Wort bedeutet: Erleichterung. Hier sind seine Buchstaben. Jetzt setzen wir sie zusammen.

Auch hier steht ein Nachbar vor dem Dschim. Aber er hat keine Hand. Und nach dem Dschim kommt nichts mehr. Darum steht das Dschim allein.

Hast du es gesehen? Das Dschim hat immer eine Hand für den nächsten Buchstaben. Und der Nachbar davor hält es fest, wenn er eine Hand hat. Jetzt bist du dran!

Baue das Wort! Leg die Buchstaben von rechts nach links in die Felder.

Hmm, der passt hier nicht. Versuch einen anderen.

Super! Du hast alle vier Wörter gebaut.

Richtig! Das Dschim steht am Anfang. Es hält den nächsten Buchstaben fest.

Richtig! Das Dschim steht in der Mitte. Es wird festgehalten und hält selbst fest.

Richtig! Das Dschim steht am Ende. Der Nachbar davor hält es fest.

Richtig! Das Dschim steht allein. Der Nachbar davor hat keine Hand.

Wer hält fest? Leg einen Nachbarn rechts neben das Dschim. Dort steht der Buchstabe davor. Oder leg ihn links daneben. Dort steht der Buchstabe danach.

Der Nachbar hat eine Hand. Er hält das Dschim fest.

Dieser Nachbar hat keine Hand. Er hält das Dschim nicht fest.

Das Dschim hat eine Hand. Es hält den nächsten Buchstaben fest.

Das Dschim hat eine Hand. Es hält immer den nächsten Buchstaben fest. Und der Nachbar davor hält das Dschim fest, wenn er eine Hand hat.

Wo steht das Dschim? Am Anfang, in der Mitte, am Ende oder allein? Leg jedes Wort in den richtigen Korb.

Richtig! Das Dschim steht am Anfang.

Richtig! Das Dschim steht in der Mitte.

Richtig! Das Dschim steht am Ende.

Richtig! Das Dschim steht allein.

Fast! Schau genau: Wer hält das Dschim fest? Und hält das Dschim einen Buchstaben fest?

Schau noch einmal genau hin. Dann versuch es noch einmal.

Toll! Du kennst jetzt alle Formen vom Dschim.
```

### File names (same order)

1. `f_intro.wav` – Heute lernst du die Formen vom Dschim. Das Dschim sieht nicht immer gleich aus. Hör gut zu und mach mit!
2. `e_intro.wav` – Zuerst schauen wir vier Wörter an. Dann übst du selbst. Schau genau zu.
3. `e_start_a.wav` – Das erste Wort bedeutet: Kamele. Hier sind seine Buchstaben. Wir lesen von rechts nach links. Jetzt setzen wir sie zusammen.
4. `e_start_b.wav` – Das Dschim steht am Anfang. Vor ihm steht nichts. Aber das Dschim hat eine Hand. Es hält den nächsten Buchstaben fest.
5. `e_middle_a.wav` – Das zweite Wort bedeutet: der Soldat. Hier sind seine Buchstaben. Jetzt setzen wir sie zusammen.
6. `e_middle_b.wav` – Das Dschim steht in der Mitte. Der Nachbar davor hält das Dschim fest. Und das Dschim hält den nächsten Buchstaben fest.
7. `e_end_a.wav` – Das dritte Wort bedeutet: Reife. Hier sind seine Buchstaben. Jetzt setzen wir sie zusammen.
8. `e_end_b.wav` – Das Dschim steht am Ende. Der Nachbar davor hält das Dschim fest. Nach dem Dschim kommt nichts mehr.
9. `e_separate_a.wav` – Das letzte Wort bedeutet: Erleichterung. Hier sind seine Buchstaben. Jetzt setzen wir sie zusammen.
10. `e_separate_b.wav` – Auch hier steht ein Nachbar vor dem Dschim. Aber er hat keine Hand. Und nach dem Dschim kommt nichts mehr. Darum steht das Dschim allein.
11. `e_outro.wav` – Hast du es gesehen? Das Dschim hat immer eine Hand für den nächsten Buchstaben. Und der Nachbar davor hält es fest, wenn er eine Hand hat. Jetzt bist du dran!
12. `b_intro.wav` – Baue das Wort! Leg die Buchstaben von rechts nach links in die Felder.
13. `b_wrong.wav` – Hmm, der passt hier nicht. Versuch einen anderen.
14. `b_all.wav` – Super! Du hast alle vier Wörter gebaut.
15. `b_done_start.wav` – Richtig! Das Dschim steht am Anfang. Es hält den nächsten Buchstaben fest.
16. `b_done_middle.wav` – Richtig! Das Dschim steht in der Mitte. Es wird festgehalten und hält selbst fest.
17. `b_done_end.wav` – Richtig! Das Dschim steht am Ende. Der Nachbar davor hält es fest.
18. `b_done_separate.wav` – Richtig! Das Dschim steht allein. Der Nachbar davor hat keine Hand.
19. `n_intro.wav` – Wer hält fest? Leg einen Nachbarn rechts neben das Dschim. Dort steht der Buchstabe davor. Oder leg ihn links daneben. Dort steht der Buchstabe danach.
20. `n_hold.wav` – Der Nachbar hat eine Hand. Er hält das Dschim fest.
21. `n_nohold.wav` – Dieser Nachbar hat keine Hand. Er hält das Dschim nicht fest.
22. `n_next.wav` – Das Dschim hat eine Hand. Es hält den nächsten Buchstaben fest.
23. `n_rule.wav` – Das Dschim hat eine Hand. Es hält immer den nächsten Buchstaben fest. Und der Nachbar davor hält das Dschim fest, wenn er eine Hand hat.
24. `s_intro.wav` – Wo steht das Dschim? Am Anfang, in der Mitte, am Ende oder allein? Leg jedes Wort in den richtigen Korb.
25. `s_ok_start.wav` – Richtig! Das Dschim steht am Anfang.
26. `s_ok_middle.wav` – Richtig! Das Dschim steht in der Mitte.
27. `s_ok_end.wav` – Richtig! Das Dschim steht am Ende.
28. `s_ok_separate.wav` – Richtig! Das Dschim steht allein.
29. `s_hint.wav` – Fast! Schau genau: Wer hält das Dschim fest? Und hält das Dschim einen Buchstaben fest?
30. `s_replay.wav` – Schau noch einmal genau hin. Dann versuch es noch einmal.
31. `s_done.wav` – Toll! Du kennst jetzt alle Formen vom Dschim.

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
جِمَال
الْجُنْدِي
نُضْج
فَرَج
أَجْمَل
```

### File names (same order)

1. `jimal.wav` – جِمَال (Kamele)
2. `aljundi.wav` – الْجُنْدِي (der Soldat)
3. `nudj.wav` – نُضْج (Reife)
4. `faraj.wav` – فَرَج (Erleichterung)
5. `ajmal.wav` – أَجْمَل (schöner)

---

## 3. Arabic words of "Ergänzen" and "Hören" (10 recordings, optional)

Folder: `public/audio/a1/jim/uebungen/` (WAV). Same style instructions as section 2.

### Lines (in this order)

```
جَرِيدَة
جِلْبَاب
جِبَال
جُنُود
جُبْن
جُنْدِيّ
جِمَال
جَمَل
جَرَس
أَجْمَل
```

### File names (same order)

1. `jarida.wav` – جَرِيدَة (Zeitung)
2. `jilbab.wav` – جِلْبَاب (Gewand)
3. `jibal.wav` – جِبَال (Berge)
4. `junud.wav` – جُنُود (Soldaten)
5. `jubn.wav` – جُبْن (Käse)
6. `jundiyy.wav` – جُنْدِيّ (Soldat)
7. `jimal.wav` – جِمَال (Kamele)
8. `jamal.wav` – جَمَل (Kamel)
9. `jaras.wav` – جَرَس (Glocke)
10. `ajmal.wav` – أَجْمَل (schöner)
