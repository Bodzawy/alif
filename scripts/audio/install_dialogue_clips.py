#!/usr/bin/env python3
"""Installs the approved dialogue recordings (one voice per batch, e.g. batches/_dialogue-l1-male-1.json).

For every docs/audio-replacement/audio-out/_dialogue-*/ it copies each clip to public/audio/ar/<id>.<hash>.mp3 and
writes src/lib/tts/dialogue-manifest.json: dialogue line id -> {voice, text, file}. A dialogue line plays its
recording only while its voice and text are still these (src/lib/tts/player.ts); every other line is spoken by
Azure. One clip can serve several lines (صَبَاحُ الْخَيْرِ. of Ahmad and of Majid, both male-1).
Clips listed in docs/audio-replacement/rejected.txt are left out.

    python3 scripts/audio/install_dialogue_clips.py
"""
import glob, hashlib, json, os, shutil

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
AR = os.path.join(ROOT, "docs", "audio-replacement")
DEST = os.path.join(ROOT, "public", "audio", "ar")
MANIFEST = os.path.join(ROOT, "src", "lib", "tts", "dialogue-manifest.json")

def main():
    rejected = set()
    rp = os.path.join(AR, "rejected.txt")
    if os.path.exists(rp):
        for line in open(rp, encoding="utf-8"):
            line = line.split("#")[0].strip()
            if line: rejected.add(line)
    # Entries installed before keep their file when its clip is not here (e.g. on another machine).
    old = json.load(open(MANIFEST, encoding="utf-8"))["lines"] if os.path.exists(MANIFEST) else {}
    os.makedirs(DEST, exist_ok=True)
    lines, installed = {}, 0
    for spec_path in sorted(glob.glob(os.path.join(AR, "batches", "_dialogue-*.json"))):
        spec = json.load(open(spec_path, encoding="utf-8"))
        out_dir = os.path.join(AR, "audio-out", spec["batch"])
        for item in spec["items"]:
            src = os.path.join(out_dir, item["id"] + ".mp3")
            fname = None
            if item["id"] not in rejected and os.path.exists(src):
                fname = f'{item["id"]}.{hashlib.sha1(open(src, "rb").read()).hexdigest()[:8]}'
                out = os.path.join(DEST, fname + ".mp3")
                if not os.path.exists(out): shutil.copyfile(src, out)
                installed += 1
            for line_id in item["lines"]:
                entry = {"voice": item["voice"], "text": item["text"], "file": fname} if fname else old.get(line_id)
                if entry and item["id"] not in rejected and entry["voice"] == item["voice"] and entry["text"] == item["text"]:
                    lines[line_id] = entry
    lines = {k: v for k, v in lines.items() if os.path.exists(os.path.join(DEST, v["file"] + ".mp3"))}
    with open(MANIFEST, "w", encoding="utf-8") as f:
        f.write("{\n\"lines\": {\n" + ",\n".join(f"{json.dumps(k, ensure_ascii=False)}: {json.dumps(v, ensure_ascii=False)}" for k, v in sorted(lines.items())) + "\n}\n}\n")
    print(f"{installed} dialogue clips installed, {len(lines)} dialogue lines with a recording")

if __name__ == "__main__":
    main()
