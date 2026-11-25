#!/usr/bin/env python3
"""Motion / acting / audio audit of a rendered preview (runs in CI, never locally).

Per scene:
  * cam    - global (camera) motion, px/frame at 320x180, via phase correlation
  * act    - residual motion after removing the camera shift = what the characters/props actually do
  * dead%  - share of frames whose residual motion is ~0 (screen looks like a painting with a pan on it)
  * a heat map (where anything moved during the scene) and an 8-frame film strip
Audio:
  * per scene loudness of the mix, every SFX onset with its level above the bed and spectral centroid
  * per SFX asset: centroid, crest factor, duration, tonality (how synthetic / beepy it is)
"""
import json, os, sys, wave, subprocess
import numpy as np
import cv2

VID = sys.argv[1]
OUT = sys.argv[2]
os.makedirs(f"{OUT}/heat", exist_ok=True)
os.makedirs(f"{OUT}/strips", exist_ok=True)
S = json.load(open("src/data/scenes.json"))

cap = cv2.VideoCapture(VID)
W, H = 320, 180
prev = None
cam, act, frames = [], [], []
heat = None
cur = 0
strips = {s["id"]: [] for s in S}
want = {}
for s in S:
    n = s["end"] - s["start"] + 1
    for k in range(8):
        want[s["start"] + int((k + 0.5) * n / 8)] = s["id"]
i = 0
heats = {}
while True:
    ok, fr = cap.read()
    if not ok:
        break
    g = cv2.cvtColor(cv2.resize(fr, (W, H), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY).astype(np.float32)
    if i in want:
        strips[want[i]].append(cv2.resize(fr, (384, 216), interpolation=cv2.INTER_AREA))
    if prev is not None:
        (dx, dy), _ = cv2.phaseCorrelate(prev, g)
        M = np.float32([[1, 0, dx], [0, 1, dy]])
        warped = cv2.warpAffine(prev, M, (W, H), borderMode=cv2.BORDER_REPLICATE)
        r = np.abs(g - warped)
        r[:6, :] = 0; r[-6:, :] = 0; r[:, :6] = 0; r[:, -6:] = 0
        cam.append(float(np.hypot(dx, dy)))
        act.append(float(np.mean(r > 6)))  # share of pixels that changed beyond the camera move
        sid = next((s["id"] for s in S if s["start"] <= i <= s["end"]), None)
        if sid:
            heats.setdefault(sid, np.zeros((H, W), np.float32))
            heats[sid] += (r > 6)
    else:
        cam.append(0.0); act.append(0.0)
    prev = g
    i += 1
cap.release()
cam, act = np.array(cam), np.array(act)

rows = []
for s in S:
    a, b = s["start"], min(s["end"], len(act) - 1)
    A = act[a:b + 1]; C = cam[a:b + 1]
    dead = float(np.mean(A < 0.004)) * 100
    rows.append({"id": s["id"], "title": s["title"], "sec": round((b - a + 1) / 24, 1),
                 "cam": round(float(np.mean(C)), 3), "act": round(float(np.mean(A)) * 100, 2), "dead": round(dead, 1)})
    h = heats.get(s["id"])
    if h is not None:
        h = np.clip(h / max(1, (b - a + 1)) * 8, 0, 1)
        col = cv2.applyColorMap((h * 255).astype(np.uint8), cv2.COLORMAP_INFERNO)
        mid = strips[s["id"]][len(strips[s["id"]]) // 2] if strips[s["id"]] else None
        if mid is not None:
            base = cv2.resize(mid, (W, H))
            col = cv2.addWeighted(base, 0.45, col, 0.75, 0)
        cv2.imwrite(f"{OUT}/heat/{s['id']}.jpg", cv2.resize(col, (640, 360)))
    st = strips[s["id"]]
    if st:
        row = np.concatenate(st, axis=1)
        cv2.putText(row, s["id"], (8, 30), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 0, 255), 2)
        cv2.imwrite(f"{OUT}/strips/{s['id']}.jpg", row, [cv2.IMWRITE_JPEG_QUALITY, 80])

# ---------------- audio ----------------
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", VID, "-ac", "1", "-ar", "24000", f"{OUT}/mix.wav"], check=True)
with wave.open(f"{OUT}/mix.wav") as w:
    x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
SR = 24000
hop = SR // 24  # one video frame
nfr = len(x) // hop
rms = np.array([np.sqrt(np.mean(x[k * hop:(k + 1) * hop] ** 2) + 1e-12) for k in range(nfr)])
db = 20 * np.log10(rms + 1e-9)
# onsets: frame louder than the median of the previous second by > 6 dB
onsets = []
for k in range(24, nfr):
    base = np.median(db[k - 24:k])
    if db[k] - base > 6 and (not onsets or k - onsets[-1][0] > 6):
        seg = x[k * hop:k * hop + SR // 4]
        spec = np.abs(np.fft.rfft(seg * np.hanning(len(seg)))) if len(seg) > 64 else np.zeros(2)
        fq = np.fft.rfftfreq(len(seg), 1 / SR) if len(seg) > 64 else np.zeros(2)
        cen = float(np.sum(fq * spec) / (np.sum(spec) + 1e-9))
        onsets.append((k, round(float(db[k] - base), 1), int(cen)))
for r in rows:
    s = next(t for t in S if t["id"] == r["id"])
    seg = db[s["start"]:s["end"] + 1]
    r["loud_db"] = round(float(np.mean(seg)), 1) if len(seg) else None
    r["sfx_hits"] = [(k - s["start"], jump, cen) for (k, jump, cen) in onsets if s["start"] <= k <= s["end"]]

json.dump(rows, open(f"{OUT}/motion.json", "w"), indent=1)
with open(f"{OUT}/motion.md", "w") as fh:
    fh.write("| scene | s | camera px/f | acting % px | dead % frames | loud dB | sfx hits (+dB, centroid Hz) |\n|---|---|---|---|---|---|---|\n")
    for r in rows:
        fh.write(f"| {r['id']} | {r['sec']} | {r['cam']} | {r['act']} | {r['dead']} | {r['loud_db']} | {' '.join(f'{j}/{c}' for _, j, c in r['sfx_hits'])} |\n")
print(open(f"{OUT}/motion.md").read())
