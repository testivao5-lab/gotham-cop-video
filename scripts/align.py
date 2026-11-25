"""Forced-align the known script to the narration (stable-ts) and retime storyboard scenes.

Outputs:
  src/data/alignment.json  - every script word with start/end seconds + frames
  src/data/scenes.json     - scenes retimed to real audio (est_start/est_end keep the storyboard estimate)
"""
import difflib, json, re, sys, wave

import stable_whisper

FPS = 24
LEAD = 0.20      # seconds a scene starts before its first spoken word
TAIL = 2.0       # seconds held after the final word
MODEL = sys.argv[1] if len(sys.argv) > 1 else "medium.en"
AUDIO = "public/narration.wav"

norm = lambda s: re.findall(r"[a-z0-9']+", s.lower().replace("\u2019", "'"))

scenes = json.load(open("src/data/scenes.json"))
script = open("storyboard/script.txt").read()
script_tokens = norm(script)

with wave.open(AUDIO) as w:
    audio_dur = w.getnframes() / w.getframerate()

model = stable_whisper.load_model(MODEL, device="cpu")
result = model.align(AUDIO, script, language="en")
result.save_as_json("src/data/stable_ts_raw.json")

# flatten aligned words -> normalized tokens carrying timings
aligned = []
for seg in result.segments:
    for wd in seg.words:
        for tok in norm(wd.word):
            aligned.append((tok, float(wd.start), float(wd.end)))

# map script token index -> timing (robust to tokenization differences)
timing = [None] * len(script_tokens)
sm = difflib.SequenceMatcher(None, script_tokens, [a[0] for a in aligned], autojunk=False)
for blk in sm.get_matching_blocks():
    for k in range(blk.size):
        timing[blk.a + k] = aligned[blk.b + k][1:]
missing = sum(t is None for t in timing)
# fill gaps by interpolating neighbours
for i, t in enumerate(timing):
    if t is None:
        prev = next((timing[j] for j in range(i - 1, -1, -1) if timing[j]), (0.0, 0.0))
        nxt = next((timing[j] for j in range(i + 1, len(timing)) if timing[j]), (audio_dur, audio_dur))
        timing[i] = (prev[1], max(prev[1], nxt[0]))

words = [
    {"i": i, "word": tok, "start": round(s, 3), "end": round(e, 3),
     "startFrame": round(s * FPS), "endFrame": round(e * FPS)}
    for i, (tok, (s, e)) in enumerate(zip(script_tokens, timing))
]

# retime scenes
idx, starts = 0, []
for sc in scenes:
    n = len(norm(sc["narration"]))
    sc["wordStart"], sc["wordEnd"] = idx, idx + n - 1
    starts.append(words[idx]["start"])
    idx += n
assert idx == len(words), (idx, len(words))

final_frame = round(max(audio_dur, words[-1]["end"] + TAIL) * FPS)
prev_start = 0
for k, sc in enumerate(scenes):
    sc.setdefault("est_start", sc["start"]); sc.setdefault("est_end", sc["end"])
    st = 0 if k == 0 else max(prev_start + 6, round((starts[k] - LEAD) * FPS))
    sc["start"] = st
    prev_start = st
for k, sc in enumerate(scenes):
    sc["end"] = (scenes[k + 1]["start"] - 1) if k + 1 < len(scenes) else final_frame - 1
    sc["startSec"] = round(sc["start"] / FPS, 3)
    sc["durationSec"] = round((sc["end"] - sc["start"] + 1) / FPS, 3)

json.dump(words, open("src/data/alignment.json", "w"), indent=0)
json.dump(scenes, open("src/data/scenes.json", "w"), indent=1)
print(f"audio {audio_dur:.2f}s  words {len(words)}  unmatched {missing}  total frames {final_frame}")
for sc in scenes:
    print(f'{sc["id"]}  {sc["start"]:>6}-{sc["end"]:<6} ({sc["durationSec"]:6.2f}s, est {(sc["est_end"]-sc["est_start"]+1)/FPS:6.2f}s)  {sc["title"]}')
