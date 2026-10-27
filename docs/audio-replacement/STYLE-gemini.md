# Recording a batch in Google AI Studio (Gemini TTS)

The batches in `batches/` are made from the code (`scripts/audio/batches-from-code.ts`): every
text is exactly what the app shows and speaks, with its harakat and Tanwin. Record it as written.

1. **Voice:** one male voice for every batch (the same one each time), e.g. Charon or Iapetus.
   Speaker settings: `Adult male teacher, deep and warm voice, Modern Standard Arabic (Fusha), clear.`
2. **Style:** paste the block below.
3. **Text:** paste `batches/batch-NN.txt` as it is (one text per line, a blank line between texts).
   Long batches: split into several speech blocks if the model drifts, but keep the order.
4. Download one audio file per batch, save it as `audio-in/batch-NN.mp3`, then:
   `python3 scripts/audio/split_batch.py docs/audio-replacement/batches/batch-NN.json docs/audio-replacement/audio-in/batch-NN.mp3`
   and listen in `audio-out/batch-NN/review.html` (ids of bad clips → `rejected.txt`), then
   `python3 scripts/audio/install_clips.py NN`.

`batch-rerecord` holds the words whose earlier recording no longer matches the app (they are
spoken with Tanwin now) and the replacement of a rejected clip. Record it like any other batch.

`batch-tanwin` re-records the words of ب ت ج (Lektion 1): their texts have Tanwin, but in the
installed clips the voice dropped it. The ids are the same, and install_clips.py installs this
folder after batch-01 … 03, so the new clip replaces the old one.

## Style

```
Read in Modern Standard Arabic (Fusha) as an adult male teacher with a clear, deep voice, like a Quran or Arabic-language teacher.
Use classical Fusha pronunciation, never a dialect: ق as a true qaf, ج as jīm, ث and ذ as interdental sounds, ض and ظ and ص and ط fully emphatic, ع and ح from the throat, and every hamza clearly as a glottal stop.
Pronounce every word exactly as it is vowelled: every fatha, kasra, damma, sukun, shadda, hamza and madda.
Where tanwin is written, pronounce it fully and clearly (ـٌ = -un, ـً = -an, ـٍ = -in); do NOT drop it in pause.
A word without a final vowel mark ends in sukun. A single letter with a vowel (بَ) is said as written, short.
Each line is one separate item: say it once, at a natural, brisk teaching pace, then pause for about 1 second before the next line.
Do not add, repeat, explain or translate anything.
```
