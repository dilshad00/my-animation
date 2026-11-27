"""Shrink long pauses in a Shorts narration and remap word timings.
python tighten.py <in.mp3> <pauses.txt> <words.json> <out.wav> <out_words.json> [keep=0.28] [first_keep=0.4]
pauses.txt = ffmpeg silencedetect output (silence_start / silence_end pairs)."""
import json, re, subprocess, sys

src, pauses, words, out, out_words = sys.argv[1:6]
keep = float(sys.argv[6]) if len(sys.argv) > 6 else 0.28
first_keep = float(sys.argv[7]) if len(sys.argv) > 7 else 0.4
txt = open(pauses, encoding="utf8", errors="ignore").read()
st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", txt)]
en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", txt)]
cuts = []  # (cut_from, cut_to) in source seconds
for i, (a, b) in enumerate(zip(st, en)):
    k = first_keep if i == 0 else keep
    if b - a > k + 0.02:
        mid_a, mid_b = a + k / 2, b - k / 2
        cuts.append((mid_a, mid_b))
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src]).decode())
segs, t = [], 0.0
for a, b in cuts:
    segs.append((t, a)); t = b
segs.append((t, dur))
def remap(x):
    removed = 0.0
    for a, b in cuts:
        if x >= b: removed += b - a
        elif x > a: return a - removed
    return x - removed
# short 6 ms crossfade-free join: each kept segment gets 5 ms fades to avoid clicks
parts = "".join(f"[0:a]atrim={a:.4f}:{b:.4f},asetpts=PTS-STARTPTS,afade=t=in:d=0.005,afade=t=out:st={max(0,b-a-0.005):.4f}:d=0.005[s{i}];" for i, (a, b) in enumerate(segs))
graph = parts + "".join(f"[s{i}]" for i in range(len(segs))) + f"concat=n={len(segs)}:v=0:a=1[o]"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-filter_complex", graph, "-map", "[o]", "-ar", "48000", out], check=True)
W = json.load(open(words, encoding="utf8"))
for w in W:
    w["s"], w["e"] = round(remap(w["s"]), 3), round(remap(w["e"]), 3)
json.dump(W, open(out_words, "w", encoding="utf8"), ensure_ascii=False)
print(f"{len(cuts)} pauses shrunk, removed {sum(b - a for a, b in cuts):.2f}s: {dur:.2f}s -> {remap(dur):.2f}s")
