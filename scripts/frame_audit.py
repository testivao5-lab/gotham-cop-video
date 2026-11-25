#!/usr/bin/env python3
"""PREVENTION: framing audit scanner.
Reads a low-res render made with --props '{"audit":true}'. Frames where any component reported a framing
violation carry a pure-magenta tag in the top-left corner (src/lib/audit.tsx). Prints violation ranges
(global frames) and exits 1 if any exist."""
import subprocess, sys, json
video, start, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
W = H = 8
raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", video, "-vf", f"crop={W}:{H}:2:2", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], capture_output=True, check=True).stdout
n = len(raw) // (W * H * 3)
bad = []
for i in range(n):
    px = raw[i * W * H * 3:(i + 1) * W * H * 3]
    r = sum(px[0::3]) / (W * H); g = sum(px[1::3]) / (W * H); b = sum(px[2::3]) / (W * H)
    if r > 190 and b > 190 and g < 80:
        bad.append(start + i)
ranges = []
for fr in bad:
    if ranges and fr == ranges[-1][1] + 1: ranges[-1][1] = fr
    else: ranges.append([fr, fr])
scenes = json.load(open("src/data/scenes.json")) if True else []
def scene_of(fr):
    try:
        from_ts = [s for s in scenes if s.get("start", -1) <= fr <= s.get("end", -1)]
        return from_ts[0]["id"] if from_ts else "?"
    except Exception: return "?"
lines = [f"frames scanned: {n}", f"violating frames: {len(bad)}"] + [f"{a}-{b} ({b-a+1}f) {scene_of(a)}" for a, b in ranges]
open(out, "w").write("\n".join(lines) + "\n")
open(out + ".firsts", "w").write(",".join(str(a + min(3, (b - a) // 2)) for a, b in ranges[:16]))
print("\n".join(lines))
sys.exit(1 if bad else 0)
