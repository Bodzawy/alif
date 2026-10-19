#!/usr/bin/env python3
"""Builds the paste-ready batches for the ElevenLabs web UI from docs/audio-replacement/scope-words-letters.csv.
Each batch: batches/batch-NN.txt (paste this) + batches/batch-NN.json (expected order, used by split_batch.py).
Only single-token texts (letters, sounds, single words) go in: multi-word texts have internal pauses and cannot be
split reliably by silence. Format: each text, blank line, '[pause]', blank line, next text (the layout that gives clear stops in ElevenLabs)."""
import csv, json, os, sys
root = os.path.join(os.path.dirname(__file__), "..", "..", "docs", "audio-replacement")
size = int(sys.argv[1]) if len(sys.argv) > 1 else 100
rows = [r for r in csv.DictReader(open(os.path.join(root, "scope-words-letters.csv"), encoding="utf-8-sig"))]
single = [r for r in rows if len(r["text"].split()) == 1]
skipped = [r["text"] for r in rows if len(r["text"].split()) != 1]
os.makedirs(os.path.join(root, "batches"), exist_ok=True)
n = 0
for i in range(0, len(single), size):
    n += 1
    chunk = single[i:i + size]
    name = f"batch-{n:02d}"
    with open(os.path.join(root, "batches", name + ".txt"), "w", encoding="utf-8") as f:
        f.write("\n\n[pause]\n\n".join(r["text"] for r in chunk) + "\n")
    json.dump({"batch": name, "items": [{"id": r["id"], "kind": r["kind"], "text": r["text"]} for r in chunk]},
              open(os.path.join(root, "batches", name + ".json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"{len(single)} texts -> {n} batches of up to {size}; skipped (multi-word): {skipped}")
