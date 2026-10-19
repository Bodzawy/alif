#!/usr/bin/env python3
"""Installs the approved ElevenLabs clips into the app.

For every docs/audio-replacement/audio-out/batch-NN/ (not the _test ones) it copies each clip to
public/audio/ar/<id>.<hash>.mp3 and writes src/lib/tts/recorded-manifest.json  (text -> "<id>.<hash>").
The hash is part of the file name, so a re-recorded clip gets a new URL and no browser cache is stale.
Clips listed in docs/audio-replacement/rejected.txt (one id per line, '#' comments allowed) are left out;
they keep being spoken by Azure until a better recording is installed.

    python3 scripts/audio/install_clips.py            # all batches that have an audio-out folder
    python3 scripts/audio/install_clips.py 01 02      # only these batches
"""
import glob, hashlib, json, os, shutil, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
AR = os.path.join(ROOT, "docs", "audio-replacement")
DEST = os.path.join(ROOT, "public", "audio", "ar")
MANIFEST = os.path.join(ROOT, "src", "lib", "tts", "recorded-manifest.json")

def main():
    wanted = set(sys.argv[1:])
    rejected = set()
    rp = os.path.join(AR, "rejected.txt")
    if os.path.exists(rp):
        for line in open(rp, encoding="utf-8"):
            line = line.split("#")[0].strip()
            if line: rejected.add(line)
    os.makedirs(DEST, exist_ok=True)
    clips, skipped = {}, 0
    for d in sorted(glob.glob(os.path.join(AR, "audio-out", "batch-*"))):
        name = os.path.basename(d)
        if wanted and name.split("-")[1] not in wanted: continue
        rep = os.path.join(d, "report.json")
        if not os.path.exists(rep): continue
        for c in json.load(open(rep, encoding="utf-8"))["clips"]:
            src = os.path.join(d, c["id"] + ".mp3")
            if c["id"] in rejected or not os.path.exists(src):
                skipped += 1; continue
            h = hashlib.sha1(open(src, "rb").read()).hexdigest()[:8]
            fname = f'{c["id"]}.{h}'
            out = os.path.join(DEST, fname + ".mp3")
            if not os.path.exists(out): shutil.copyfile(src, out)
            if c["text"] in clips and clips[c["text"]] != fname:
                print(f'note: text {c["text"]!r} appears twice, the later clip wins')
            clips[c["text"]] = fname
    # keep entries of batches that were not requested this time
    if wanted and os.path.exists(MANIFEST):
        old = json.load(open(MANIFEST, encoding="utf-8"))["clips"]
        old.update(clips); clips = old
    # drop manifest entries whose file is gone
    clips = {t: f for t, f in clips.items() if os.path.exists(os.path.join(DEST, f + ".mp3"))}
    with open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump({"clips": dict(sorted(clips.items(), key=lambda kv: kv[1]))}, f, ensure_ascii=False, indent=0)
        f.write("\n")
    used = set(clips.values())
    for p in glob.glob(os.path.join(DEST, "*.mp3")):
        if os.path.basename(p)[:-4] not in used:
            print("unused file (old version):", os.path.basename(p))
    print(f"{len(clips)} recorded texts in the manifest, {skipped} clips left out (rejected or missing)")

if __name__ == "__main__":
    main()
