#!/usr/bin/env python3
"""Automated QA gate for a rendered preview/final (runs in CI).

usage: python3 scripts/qa.py video.mp4 [outdir]
Checks (see docs/QA_CHECKLIST.md):
  1. one-frame flashes (luma spike vs both neighbours)
  2. frozen picture runs > 1.5 s (freezedetect)
  3. audio: stereo, 48 kHz, integrated loudness -14 LUFS +-1, no silent gaps > 0.4 s
  4. contact sheets every 0.5 s for manual text / hands / continuity review
Writes qa_report.md (+ GitHub step summary) and sheets/*.jpg. Exit code 1 if any hard check fails.
"""
import json, os, re, subprocess, sys

src = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else "qa"
os.makedirs(os.path.join(out, "sheets"), exist_ok=True)
FPS = 24


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


rep, fails = [], 0


def line(ok, name, detail=""):
    global fails
    if ok is False:
        fails += 1
    tag = "PASS" if ok else ("FAIL" if ok is False else "INFO")
    rep.append(f"| {tag} | {name} | {detail} |")


# ---- probe
pr = json.loads(run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", src]).stdout)
v = next(s for s in pr["streams"] if s["codec_type"] == "video")
a = next((s for s in pr["streams"] if s["codec_type"] == "audio"), None)
dur = float(pr["format"]["duration"])
line(True if int(v["width"]) >= 1920 else None, "resolution", f'{v["width"]}x{v["height"]}, {v.get("avg_frame_rate")}, {dur:.2f}s, {int(pr["format"].get("bit_rate", 0))//1000} kb/s')

# ---- 1. luma per frame -> flashes
yfile = os.path.join(out, "yavg.txt")
run(["ffmpeg", "-v", "error", "-i", src, "-vf", f"scale=192:108,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file={yfile}", "-f", "null", "-"])
Y = [float(m) for m in re.findall(r"YAVG=([\d.]+)", open(yfile).read())]
flashes = [i for i in range(1, len(Y) - 1) if (Y[i] - max(Y[i - 1], Y[i + 1]) > 22) or (min(Y[i - 1], Y[i + 1]) - Y[i] > 22)]
line(len(flashes) == 0, "no 1-frame flashes", ", ".join(f"f{i} ({i/FPS:.2f}s)" for i in flashes[:20]) or f"{len(Y)} frames scanned")

# ---- 2. frozen runs
fz = run(["ffmpeg", "-v", "info", "-i", src, "-vf", "scale=160:90:flags=area,freezedetect=n=0.0015:d=1.5", "-map", "0:v", "-f", "null", "-"]).stderr
starts = [float(x) for x in re.findall(r"freeze_start: ([\d.]+)", fz)]
durs = [float(x) for x in re.findall(r"freeze_duration: ([\d.]+)", fz)]
line(len(starts) == 0, "no frozen hold > 1.5 s", ", ".join(f"{s:.2f}s for {d:.2f}s" for s, d in zip(starts, durs)) or "none")

# ---- 3. audio
if a is None:
    line(False, "audio present", "no audio stream")
else:
    line(int(a.get("channels", 0)) == 2 and int(a.get("sample_rate", 0)) == 48000, "stereo 48 kHz", f'{a.get("channels")} ch, {a.get("sample_rate")} Hz, {a.get("codec_name")}')
    eb = run(["ffmpeg", "-v", "info", "-nostats", "-i", src, "-map", "0:a", "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr
    m = re.findall(r"I:\s+(-?[\d.]+) LUFS", eb)
    tp = re.findall(r"Peak:\s+(-?[\d.]+) dBFS", eb)
    lufs = float(m[-1]) if m else -99
    line(abs(lufs + 14) <= 1.0, "loudness -14 LUFS (+-1)", f"I = {lufs} LUFS, true peak {tp[-1] if tp else '?'} dBFS")
    sd = run(["ffmpeg", "-v", "info", "-i", src, "-map", "0:a", "-af", "silencedetect=n=-45dB:d=0.4", "-f", "null", "-"]).stderr
    sil = re.findall(r"silence_start: ([\d.]+)", sd)
    line(len(sil) == 0, "no audio dropouts (< -45 dB for 0.4 s)", ", ".join(f"{float(s):.2f}s" for s in sil[:20]) or "continuous")

# ---- 4. contact sheets (0.5 s cadence, 6x5 per sheet, timestamps burned in for review only)
run(["ffmpeg", "-v", "error", "-i", src, "-vf",
     "fps=2,scale=384:216,drawtext=text='%{pts\\:hms}':x=6:y=6:fontsize=18:fontcolor=yellow:box=1:boxcolor=black@0.6,tile=6x5:padding=4:color=black",
     os.path.join(out, "sheets", "sheet_%02d.jpg")])
line(None, "contact sheets", f'{len(os.listdir(os.path.join(out, "sheets")))} sheets for manual check of text / hands / continuity')

md = ["# Automated QA report", "", f"`{os.path.basename(src)}`", "", "| result | check | detail |", "|---|---|---|", *rep, "",
      f"**{'GATE PASSED' if fails == 0 else f'GATE FAILED ({fails})'}** — manual items in docs/QA_CHECKLIST.md still apply."]
open(os.path.join(out, "qa_report.md"), "w").write("\n".join(md) + "\n")
if os.environ.get("GITHUB_STEP_SUMMARY"):
    open(os.environ["GITHUB_STEP_SUMMARY"], "a").write("\n".join(md) + "\n")
print("\n".join(md))
sys.exit(1 if fails else 0)
