#!/bin/sh
# Regenerates tests/fixtures/arabic-speech/*.wav (macOS only): short Arabic
# letters and words spoken by the system voice "Majed", 16 kHz mono 16-bit –
# the format the browser sends. Used by tests/unit/trim-silence.test.ts to
# check that cutting the silence never cuts real speech (hamza, ف ث ه ح,
# final consonants). Not used by the app.
set -e
out="$(dirname "$0")/../tests/fixtures/arabic-speech"
mkdir -p "$out"
tmp="$(mktemp -d)"
while read -r id text; do
  say -v Majed -o "$tmp/$id.aiff" "$text"
  afconvert -f WAVE -d LEI16@16000 -c 1 "$tmp/$id.aiff" "$out/$id.wav"
done <<'LIST'
alif ألف
ba باء
tha ثاء
hha حاء
kha خاء
ain عين
fa فاء
ha هاء
qaf قاف
dad ضاد
asad أسد
saqf سقف
bayt بيت
LIST
rm -rf "$tmp"
