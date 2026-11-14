"""Splits a frame spec into render chunks for the Blender workflow matrix.

  python3 blender/plan.py 1-192 20   -> 20 contiguous ranges
  python3 blender/plan.py 1,96,192 1 -> one chunk with those stills (N>1 spreads stills over N chunks)
"""
import json
import sys

spec, n = sys.argv[1], int(sys.argv[2])
if "-" in spec:
    a, b = map(int, spec.split("-"))
    frames = list(range(a, b + 1))
    n = max(1, min(n, len(frames)))
    size = -(-len(frames) // n)
    chunks = [f"{frames[i]}-{frames[min(i + size, len(frames)) - 1]}" for i in range(0, len(frames), size)]
else:  # stills: spread them over up to n chunks
    st = [x for x in spec.split(",") if x]
    n = max(1, min(n, len(st)))
    chunks = [",".join(st[i::n]) for i in range(n)]
print("matrix=" + json.dumps([{"i": i, "frames": c} for i, c in enumerate(chunks)]))
