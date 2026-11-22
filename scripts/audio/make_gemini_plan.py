#!/usr/bin/env python3
"""Makes the recording plan for Google AI Studio (Gemini TTS): every text that still has no recording, in parts of a
size one speech generation handles, with the files to paste.

    python3 scripts/audio/make_gemini_plan.py

Reads the pending batches in docs/audio-replacement/batches (those without a folder in audio-out), leaves out every text
that is already in src/lib/tts/recorded-manifest.json / dialogue-manifest.json, and writes to docs/audio-replacement/gemini-plan/:
    NN-<part>.txt   paste into the Text box (one text per paragraph, a blank line between texts)
    NN-<part>.json  the ids of the part, for split_batch.py
    PLAN.md         the order, the voice and style of each part, and what to run after each recording
Safe to run again: the folder is rewritten from the current state.
"""
import glob, json, os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
AR = os.path.join(ROOT, "docs", "audio-replacement")
BATCHES = os.path.join(AR, "batches")
PLAN = os.path.join(AR, "gemini-plan")
HARAKAT = re.compile("[ً-ْٰـ]")
SENTENCE_SECONDS, WORD_MAX = 240, 100   # a sentence part is about 4 minutes of audio; a word part up to 100 words

def load(name):
    p = os.path.join(BATCHES, name + ".json")
    return json.load(open(p, encoding="utf-8")) if os.path.exists(p) else None

def est_seconds(text):
    # speech ~0.095 s per letter + 0.5 s, plus the 3 s pause between sentences
    return 0.095 * len(HARAKAT.sub("", text)) + 0.5 + 3.0

def main():
    rec = json.load(open(os.path.join(ROOT, "src/lib/tts/recorded-manifest.json"), encoding="utf-8"))["clips"]
    dm = json.load(open(os.path.join(ROOT, "src/lib/tts/dialogue-manifest.json"), encoding="utf-8"))["lines"]
    dialogue_done = {(v["voice"], v["text"]) for v in dm.values()}
    seen = set(rec)   # a text is recorded once, in the first part that has it
    parts = []        # (key, kind, voice_key, items)

    def take(items, voice=None):
        out = []
        for it in items:
            key = (voice, it["text"])
            if voice:
                if key in dialogue_done or key in seen: continue
            elif it["text"] in seen: continue
            seen.add(key if voice else it["text"]); out.append(it)
        return out

    # 1. words, in the order of importance
    for name, label in (("_batch-review-fix", "review-fix"), ("_batch-l1-formen", "l1-formen"), ("_batch-l2-fix2", "l2-fix2")):
        b = load(name)
        if not b: continue
        items = take(b["items"])
        n = -(-len(items) // WORD_MAX) if items else 0
        size = -(-len(items) // n) if n else 0
        for i in range(n):
            part = items[i * size:(i + 1) * size]
            parts.append((f"batch-{label}" + (f"-{i + 1:02d}" if n > 1 else ""), "words", None, part))
    # 2. sentences: by estimated length, in lesson order
    b = load("_batch-l2s") or load("batch-l2s")
    if b:
        items, cur, secs, k = take(b["items"]), [], 0.0, 1
        for it in items:
            s = est_seconds(it["text"])
            if cur and (secs + s > SENTENCE_SECONDS or len(cur) >= 45):
                parts.append((f"batch-l2s-{k:02d}", "sentences", None, cur)); k += 1; cur, secs = [], 0.0
            cur.append(it); secs += s
        if cur: parts.append((f"batch-l2s-{k:02d}", "sentences", None, cur))
    # 3. dialogue lines, one part per voice (a pending Lektion 1 line joins the Lektion 2+ part of its voice)
    by_voice = {}
    for f in sorted(glob.glob(os.path.join(BATCHES, "_dialogue-*.json"))):
        b = json.load(open(f, encoding="utf-8"))
        if os.path.isdir(os.path.join(AR, "audio-out", b["batch"])) or not b["items"]: continue
        voice = b["items"][0]["voice"]
        slot = by_voice.setdefault(voice, {"batch": None, "items": []})
        if "-l2-" in b["batch"] or slot["batch"] is None: slot["batch"] = b["batch"]
        slot["items"] += b["items"]
    for voice in ("male-1", "male-2", "female-1", "female-2"):
        slot = by_voice.get(voice)
        items = take(slot["items"], voice) if slot else []
        if items: parts.append((slot["batch"].lstrip("_"), "dialogue", voice, items))
    # dialogue parts keep their original batch name (install_dialogue_clips.py reads batches/_dialogue-*.json)
    # 4. texts of the sheet of missing recordings (sheet-missing.json) that no pending batch holds
    sp = os.path.join(AR, "sheet-missing.json")
    if os.path.exists(sp):
        # a text keeps the id it has in another pending batch (batch-04 … 06 hold words of the sheet too)
        known = {}
        for f in sorted(glob.glob(os.path.join(BATCHES, "*.json"))):
            b = json.load(open(f, encoding="utf-8"))
            if b["batch"].lstrip("_").startswith("dialogue") or os.path.isdir(os.path.join(AR, "audio-out", b["batch"])): continue
            for it in b["items"]: known.setdefault(it["text"], it)
        extra, n = [], 0
        for r in json.load(open(sp, encoding="utf-8")):
            t = r["text"]
            if r["kind"] != "dialogue" and t not in seen:
                seen.add(t)
                if t in known: extra.append({k: known[t][k] for k in ("id", "kind", "text")})
                else: n += 1; extra.append({"id": f"x{n:03d}", "kind": r["kind"], "text": t})
        if extra: parts.append(("batch-extras", "sentences", None, extra))
    os.makedirs(PLAN, exist_ok=True)
    # earlier parts of another run go to _old (files cannot be deleted in a connected folder)
    os.makedirs(os.path.join(PLAN, "_old"), exist_ok=True)
    keep = {f"{i:02d}-{p[0]}" for i, p in enumerate(parts, 1)}
    for old in glob.glob(os.path.join(PLAN, "*")):
        base = os.path.basename(old)
        if os.path.isfile(old) and os.path.splitext(base)[0] not in keep and base != "PLAN.md":
            os.replace(old, os.path.join(PLAN, "_old", base))
    lines = []
    for idx, (key, kind, voice, items) in enumerate(parts, 1):
        stem = f"{idx:02d}-{key}"
        name = key if kind != "dialogue" else "_" + key
        open(os.path.join(PLAN, stem + ".txt"), "w", encoding="utf-8").write("\n\n".join(i["text"] for i in items) + "\n")
        json.dump({"batch": name, "items": items}, open(os.path.join(PLAN, stem + ".json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        mins = sum(est_seconds(i["text"]) if kind != "words" else 2.0 + 0.1 * len(HARAKAT.sub("", i["text"])) for i in items) / 60
        lines.append((stem, name, kind, voice, len(items), mins))
    tot = sum(l[4] for l in lines)
    md = [f"# Recording plan for Google AI Studio\n\n{len(lines)} parts, {tot} texts that have no recording yet (already recorded texts are left out).\nRecord them in this order. For each part: paste `NN-….txt` into the Text box, with the voice and style below, download the audio,\nsave it as `audio-in/<name>.mp3` (a .wav also works if you give the file its real extension), and tell Claude the part number.\n\nStyles: see STYLE-gemini.md (words: pause 1 s; sentences and dialogues: pause 3 s).\n",
          "| # | part | texts | ~minutes | voice | save the audio as |", "|---|---|---|---|---|---|"]
    for stem, name, kind, voice, n, mins in lines:
        v = {"words": "male teacher (Charon), words style", "sentences": "male teacher (Charon), sentences style (3 s pause)"}.get(kind) or {"male-1": "Achird", "male-2": "Algieba", "female-1": "Sulafat", "female-2": "Leda"}.get(voice, voice) + " – dialogue style"
        md.append(f"| {stem[:2]} | `{stem}.txt` | {n} | {mins:.1f} | {v} | `audio-in/{name.lstrip('_')}.mp3` |")
    md += ["", "After a recording (Claude does this):", "", "```bash", "python3 scripts/audio/split_batch.py docs/audio-replacement/gemini-plan/NN-<part>.json docs/audio-replacement/audio-in/<name>.mp3",
           "# listen in docs/audio-replacement/audio-out/<name>/review.html; bad ids -> rejected.txt", "python3 scripts/audio/install_clips.py <key>        # words / sentences, e.g. review, l1, l2, l2s", "python3 scripts/audio/install_dialogue_clips.py   # dialogue parts", "```", ""]
    open(os.path.join(PLAN, "PLAN.md"), "w", encoding="utf-8").write("\n".join(md))
    print(f"{len(lines)} parts, {tot} texts")
    for l in lines: print(f"  {l[0]:<34} {l[2]:<9} {l[4]:>4} texts  ~{l[5]:.1f} min")

if __name__ == "__main__":
    main()
