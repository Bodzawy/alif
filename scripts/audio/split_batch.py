#!/usr/bin/env python3
"""Cuts one ElevenLabs recording (audio-in/batch-NN.mp3) into one clip per text, in the order of batches/batch-NN.json.
Method: find every silence, keep the N-1 LONGEST gaps as the borders between the N texts (single words have no long
internal gaps). It refuses to continue if the result looks ambiguous, so a wrong cut is never installed silently.
usage: split_batch.py batches/batch-01.json audio-in/batch-01.mp3
writes: audio-out/batch-01/<id>.mp3, audio-out/batch-01/report.json, audio-out/batch-01/review.html"""
import json, math, os, re, subprocess, sys, html, tempfile

TARGET_MEAN_DB = -22.0   # clips are levelled to the same average loudness
PAD_BEFORE, PAD_AFTER = 0.06, 0.12
# Clear pauses (clear_pauses): the region is found at -50 … -35 dB, but a word's quiet edges – the nasal -un of the
# Tanwin, a breath before it – lie lower (-55 … -70 dB) and would be cut off, then made audible by the levelling.
# There is room: keep more around the word (never past the middle of the pause), and fade in / out against clicks.
CLEAR_PAD_BEFORE, CLEAR_PAD_AFTER, FADE = 0.25, 0.35, 0.015

def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)

def duration(path):
    return float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).stdout)

def silences(path, noise_db, d):
    out = run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", f"silencedetect=noise={noise_db}dB:d={d}", "-f", "null", "-"]).stderr
    starts = [float(x) for x in re.findall(r"silence_start: (-?[\d.]+)", out)]
    ends = [float(x) for x in re.findall(r"silence_end: (-?[\d.]+)", out)]
    return list(zip(starts, ends[:len(starts)]))

def speech_regions(path, total):
    # ElevenLabs pauses between texts are near-digital silence (about -80 dB) while stop closures inside a word are not,
    # so the deepest threshold is tried first; every kept region is real speech of at least 60 ms
    for noise, d in ((-72, 0.06), (-65, 0.06), (-58, 0.06), (-50, 0.10)):
        sil = silences(path, noise, d)
        regions, pos = [], 0.0
        for s, e in sil:
            s = max(s, 0.0)
            if s - pos >= 0.06: regions.append([pos, s])
            pos = max(pos, e)
        if total - pos >= 0.06: regions.append([pos, total])
        yield (noise, d), regions

def clear_pauses(path, total, n):
    """Recordings with clear pauses between the texts (Google AI Studio with [long pause]): their pauses are quiet but
    not digital silence. When some threshold finds exactly n speech regions apart by at least 0.3 s, that is the cut."""
    for noise in (-50, -45, -40, -35):
        regions, pos = [], 0.0
        for s, e in silences(path, noise, 0.3):
            s = max(s, 0.0)
            if s - pos >= 0.06: regions.append([pos, s])
            pos = max(pos, e)
        if total - pos >= 0.06: regions.append([pos, total])
        if len(regions) == n:
            return (noise, 0.3), regions
    return None

HARAKAT = re.compile("[\u064B-\u0652\u0670]")

def pred_dur(text, scale):
    """Expected speech length of a single word: 0.268 s + 0.108 s per base letter (fitted on an approved test recording)."""
    return scale * (0.268 + 0.108 * len(HARAKAT.sub("", text)))

def _p_border(g):
    return 1.0 / (1.0 + math.exp(-(g - 0.17) / 0.03))

def border_cost(g):
    return -math.log(max(_p_border(g), 1e-6))

def internal_cost(g):
    return -math.log(max(1.0 - _p_border(g), 1e-6))

def segment(regions, texts, scale):
    """Assign the speech regions to the N texts in order (dynamic programming). A gap is more likely a border the longer it is,
    and a text is more likely when its length matches the expected length of that word."""
    R, N, INF = len(regions), len(texts), 1e18
    dp = [[INF] * (R + 1) for _ in range(N + 1)]
    bp = [[None] * (R + 1) for _ in range(N + 1)]
    dp[0][0] = 0.0
    for k in range(1, N + 1):
        pr = pred_dur(texts[k - 1], scale)
        for j in range(k, R + 1):
            for i in range(max(k - 1, j - 6), j):
                if dp[k - 1][i] >= INF: continue
                dur = regions[j - 1][1] - regions[i][0]
                z = (math.log(dur) - math.log(pr)) / 0.30
                c = dp[k - 1][i] + z * z / 2
                if i > 0: c += border_cost(regions[i][0] - regions[i - 1][1])
                for t in range(i, j - 1): c += internal_cost(regions[t + 1][0] - regions[t][1])
                if c < dp[k][j]: dp[k][j], bp[k][j] = c, i
    if dp[N][R] >= INF: return None
    groups, j = [], R
    for k in range(N, 0, -1):
        i = bp[k][j]; groups.append((i, j)); j = i
    groups.reverse()
    return [[regions[i][0], regions[j - 1][1]] for i, j in groups]

def volume(path):
    err = run(["ffmpeg", "-hide_banner", "-nostats", "-i", path, "-af", "volumedetect", "-f", "null", "-"]).stderr
    m = re.search(r"mean_volume: (-?[\d.]+) dB", err); x = re.search(r"max_volume: (-?[\d.]+) dB", err)
    return (float(m.group(1)) if m else TARGET_MEAN_DB, float(x.group(1)) if x else -3.0)

TMPDIR = tempfile.mkdtemp()

def main():
    spec_path, audio_path = sys.argv[1], sys.argv[2]
    spec = json.load(open(spec_path, encoding="utf-8"))
    items, name = spec["items"], spec["batch"]
    n = len(items)
    total = duration(audio_path)
    chosen = clear_pauses(audio_path, total, n)
    clear = chosen is not None
    pad_before, pad_after = (CLEAR_PAD_BEFORE, CLEAR_PAD_AFTER) if clear else (PAD_BEFORE, PAD_AFTER)
    for setting, regions in ([] if chosen else speech_regions(audio_path, total)):
        if len(regions) >= n:
            chosen = (setting, regions); break
        last = (setting, regions)
    if chosen is None:
        print(f"FAIL: only {len(last[1])} speech regions found for {n} texts (even at the most sensitive setting). "
              f"The recording is missing words or the pauses are too short. Nothing was cut."); sys.exit(2)
    setting, regions = chosen
    texts = [it["text"] for it in items]
    scale = 1.0
    for _ in range(4):
        cut = segment(regions, texts, scale)
        if cut is None:
            print("FAIL: could not assign the speech to the texts."); sys.exit(2)
        ratios = sorted((b - a) / pred_dur(t, 1.0) for (a, b), t in zip(cut, texts))
        scale = ratios[len(ratios) // 2]
    regions = cut
    kept = [regions[i + 1][0] - regions[i][1] for i in range(len(regions) - 1)]
    warnings = []
    out_dir = os.path.join(os.path.dirname(os.path.abspath(spec_path)), "..", "audio-out", name)
    os.makedirs(out_dir, exist_ok=True)
    report = []
    for i, ((a, b), it) in enumerate(zip(regions, items)):
        lo = (regions[i - 1][1] + a) / 2 if i else 0.0
        hi = (b + regions[i + 1][0]) / 2 if i < n - 1 else total
        s, e = max(lo, a - pad_before), min(hi, b + pad_after)
        tmp = os.path.join(TMPDIR, "_tmp.wav")
        run(["ffmpeg", "-loglevel", "error", "-y", "-ss", f"{s:.3f}", "-to", f"{e:.3f}", "-i", audio_path, "-ac", "1", tmp])
        mean, peak = volume(tmp)
        gain = max(-6.0, min(10.0, TARGET_MEAN_DB - mean)); gain = min(gain, -1.0 - peak)
        dst = os.path.join(out_dir, it["id"] + ".mp3")
        fades = f",afade=t=in:d={FADE},afade=t=out:st={max(0.0, e - s - FADE):.3f}:d={FADE}" if clear else ""
        run(["ffmpeg", "-loglevel", "error", "-y", "-i", tmp, "-af", f"volume={gain:.2f}dB{fades}", "-c:a", "libmp3lame", "-q:a", "2", dst])
        os.remove(tmp)
        dur = b - a
        z = (math.log(dur) - math.log(pred_dur(it["text"], scale))) / 0.30
        flag = "SHORT" if dur < 0.15 else "LONG" if dur > 3.0 else "CHECK-LENGTH" if abs(z) > 1.8 else ""
        gap_before = (a - regions[i - 1][1]) if i else None
        if not flag and gap_before is not None and gap_before < 0.09: flag = "TIGHT-GAP"
        report.append({"id": it["id"], "text": it["text"], "start": round(s, 2), "end": round(e, 2), "speech": round(dur, 2), "expected": round(pred_dur(it["text"], scale), 2), "gain_db": round(gain, 1), "flag": flag})
    flagged = [r for r in report if r["flag"]]
    if flagged: warnings.append(f"{len(flagged)} clips to check by ear: " + ", ".join(f'{r["id"]}({r["flag"]})' for r in flagged[:20]))
    json.dump({"batch": name, "texts": n, "audio_seconds": round(total, 2), "detect": setting, "min_border_gap": round(min(kept), 2) if kept else None, "speed_scale": round(scale, 2), "warnings": warnings, "clips": report},
              open(os.path.join(out_dir, "report.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    rows = "".join(f'<tr><td>{html.escape(r["id"])}</td><td class="ar">{html.escape(r["text"])}</td><td><audio controls preload="none" src="{r["id"]}.mp3"></audio></td>'
                   f'<td>{r["speech"]:.2f}s {r["flag"]}</td><td><input type="checkbox" data-id="{r["id"]}"></td></tr>' for r in report)
    page = f'''<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>{name}</title>
<style>body{{font-family:system-ui,sans-serif;max-width:900px;margin:24px auto;padding:0 16px}}table{{border-collapse:collapse;width:100%}}td,th{{border-bottom:1px solid #ddd;padding:6px 8px;text-align:right}}.ar{{font-size:1.6rem}}button{{padding:8px 14px;margin:8px 0}}</style>
<h1>{name} — {n} clips</h1><p>علّم الغلط (نطق/قطع)، وبعدين دوس "انسخ القايمة" وابعتها لي.</p>
<button onclick="const b=[...document.querySelectorAll('input:checked')].map(x=>x.dataset.id);navigator.clipboard.writeText(JSON.stringify(b));this.textContent='اتنسخت ('+b.length+')'">انسخ قايمة الغلط</button>
<table><tr><th>id</th><th>النص</th><th>الصوت</th><th>المدة</th><th>غلط</th></tr>{rows}</table></html>'''
    open(os.path.join(out_dir, "review.html"), "w", encoding="utf-8").write(page)
    print(f"{name}: {n} clips, detect={setting}, smallest border gap {min(kept):.2f}s, speed scale {scale:.2f}")
    for w in warnings: print("WARNING:", w)
    print("review:", os.path.join(out_dir, "review.html"))

main()
