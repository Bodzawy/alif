# Recording a batch in Google AI Studio (Gemini TTS)

The batches in `batches/` are made from the code (`scripts/audio/batches-from-code.ts`): every
text is exactly what the app shows and speaks, with its harakat and Tanwin. Record it as written.

1. **Voice:** one male voice for every batch (the same one each time), e.g. Charon or Iapetus.
   Speaker settings: `Adult male teacher, very deep, low-pitched and full voice, Modern Standard Arabic (Fusha), crisp and clear, confident, speaks at a lively pace.`
2. **Style:** paste the block below.
3. **Text:** paste `batches/batch-NN.txt` as it is (one text per line, a blank line between texts).
   Long batches: split into several speech blocks if the model drifts, but keep the order.
4. Download one audio file per batch, save it as `audio-in/batch-NN.mp3`, then:
   `python3 scripts/audio/split_batch.py docs/audio-replacement/batches/batch-NN.json docs/audio-replacement/audio-in/batch-NN.mp3`
   and listen in `audio-out/batch-NN/review.html` (ids of bad clips → `rejected.txt`), then
   `python3 scripts/audio/install_clips.py NN`.

`batch-rerecord` holds the words whose earlier recording no longer matches the app (they are
spoken with Tanwin now) and the replacement of a rejected clip. Record it like any other batch.
Once recorded it is kept as `_batch-rerecord-NN` (clips in `audio-out/batch-rerecord`), and
`batch-rerecord` is only written again when a recording no longer matches.
`_batch-l2-fix` holds the Lektion 2+ words whose clip lost its Tanwin (IQRA heard no -n): record it
like `_batch-l2-NN`.

`batch-tanwin` re-records the words of ب ت ج (Lektion 1): their texts have Tanwin, but in the
installed clips the voice dropped it. The ids are the same, and install_clips.py installs this
folder after batch-01 … 03, so the new clip replaces the old one.

## Style

```
Read in Modern Standard Arabic (Fusha) as an adult male teacher with a very deep, low, full voice and crisp, clear articulation, like a Quran or Arabic-language teacher.
Use classical Fusha pronunciation, never a dialect: ق as a true qaf, ج as jīm, ث and ذ as interdental sounds, ض and ظ and ص and ط fully emphatic, ع and ح from the throat, and every hamza clearly as a glottal stop.
Pronounce every word exactly as it is vowelled: every fatha, kasra, damma, sukun, shadda, hamza and madda.
Where tanwin is written, pronounce it fully and clearly (ـٌ = -un, ـً = -an, ـٍ = -in); do NOT drop it in pause.
A word without a final vowel mark ends in sukun. A single letter with a vowel (بَ) is said as written, short.
Keep a brisk, lively pace – never slow, drawn-out or sleepy – but every sound stays crisp and clear.
Each line is one separate item: say it once, then pause for about 1 second before the next line.
Do not add, repeat, explain or translate anything.
```

## Lektion 2 on (`_batch-l2-NN`, `_batch-l2s`)

`scripts/audio/batches-from-lessons.ts -- --from=2` writes the texts of Lektion 2 … 20 without a
recording, in lesson order: words (`_batch-l2-NN`, style above) and every sentence in one batch,
`_batch-l2s` (the single sentences, then the texts of several sentences). Dialogue lines are not in
it (speakers' voices). It is long: record it in parts, in order, and join the parts into one
`audio-in/batch-l2s` recording before `split_batch.py`.
Record the sentences with the style below: `split_batch.py` finds the borders between the texts
only when the pause between two texts is clearly longer than every pause inside one.
Install: `python3 scripts/audio/install_clips.py l2` (sentences `l2s`).

```
Read in Modern Standard Arabic (Fusha) as an adult male teacher with a very deep, low, full voice and crisp, clear articulation, like a Quran or Arabic-language teacher.
Use classical Fusha pronunciation, never a dialect: ق as a true qaf, ج as jīm, ث and ذ as interdental sounds, ض and ظ and ص and ط fully emphatic, ع and ح from the throat, and every hamza clearly as a glottal stop.
Pronounce every word exactly as it is vowelled: every fatha, kasra, damma, sukun, shadda, hamza and madda, and every case ending that is written. Where tanwin is written, pronounce it fully.
A word without a final vowel mark ends in sukun.
Read each item as one connected utterance at a brisk, lively, natural pace – never slow or drawn-out – with natural sentence intonation (a question as a question). Inside an item, pause only briefly at a comma or full stop – never longer than half a second.
Each item is separated by a blank line: after each item, stay completely silent for about 3 seconds before the next one.
Do not add, repeat, explain or translate anything.
```

## Dialogues (`_dialogue-l2-<voice>`)

`scripts/audio/dialogue-batches.ts -- --from=2` writes the dialogue lines of Lektion 2 … 20, one
batch per speaker voice (male-1, male-2, female-1, female-2). Record each batch with **its own** Gemini voice – the same as in Lektion 1,
so a speaker keeps the voice he or she had there:

| batch | Gemini voice | speaker settings |
|---|---|---|
| `male-1` | Achird | `Adult man, warm and friendly, Modern Standard Arabic (Fusha), clear, natural conversational pace.` |
| `male-2` | Algieba | `Adult man, calm and polite, Modern Standard Arabic (Fusha), clear, natural conversational pace.` |
| `female-1` | Sulafat | `Adult woman, warm and friendly, Modern Standard Arabic (Fusha), clear, natural conversational pace.` |
| `female-2` | Leda | `Young woman, bright and polite, Modern Standard Arabic (Fusha), clear, natural conversational pace.` |

Style (all four):

```
Read in Modern Standard Arabic (Fusha) as a person speaking in an everyday conversation: natural, friendly, with crisp and clear articulation.
Use classical Fusha pronunciation, never a dialect: ق as a true qaf, ج as jīm, ث and ذ as interdental sounds, ض and ظ and ص and ط fully emphatic, ع and ح from the throat, and every hamza clearly as a glottal stop.
Pronounce every word exactly as it is vowelled: every fatha, kasra, damma, sukun, shadda, hamza and madda, and every case ending that is written. Where tanwin is written, pronounce it fully.
A word without a final vowel mark ends in sukun.
Say each item as one connected utterance with natural intonation (a question as a question), at a natural, lively pace – never slow. Inside an item, pause only briefly at a comma or full stop – never longer than half a second.
Each item is separated by a blank line: after each item, stay completely silent for about 3 seconds before the next one.
Do not add, repeat, explain or translate anything.
```

Then `split_batch.py` with the batch's `.json` and `python3 scripts/audio/install_dialogue_clips.py`.
