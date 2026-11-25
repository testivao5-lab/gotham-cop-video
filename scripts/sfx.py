#!/usr/bin/env python3
"""Procedural, licence-free sound design for Gotham Cop (runs in CI, writes public/sfx/*.wav).

All sounds are synthesised from noise + oscillators, 48 kHz stereo 16-bit.
Beds (rain_bed, pad, room) are seamless loops so <Audio loop> never clicks.
"""
import os, wave
import numpy as np
from scipy.signal import butter, lfilter, sosfilt

SR = 48000
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "sfx")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)


def t_(d):
    return np.arange(int(SR * d)) / SR


def bp(x, lo, hi, order=2):
    sos = butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    return sosfilt(sos, x)


def lp(x, hi, order=2):
    return sosfilt(butter(order, hi, btype="low", fs=SR, output="sos"), x)


def hp(x, lo, order=2):
    return sosfilt(butter(order, lo, btype="high", fs=SR, output="sos"), x)


def env(n, a, d, curve=4.0):
    """attack seconds, decay seconds (exponential)"""
    t = np.arange(n) / SR
    e = np.minimum(1, t / max(a, 1e-4)) * np.exp(-np.maximum(0, t - a) * curve / max(d, 1e-4))
    return e


def norm(x, peak=0.9):
    m = np.max(np.abs(x)) or 1
    return x / m * peak


def stereo(l, r=None, width=0.0):
    if r is None:
        d = int(SR * 0.0007 * width)
        r = np.concatenate([np.zeros(d), l])[: len(l)] if d else l
    return np.stack([l, r], axis=1)


def loopify(x, xf=2.0):
    """crossfade the tail into the head -> seamless loop"""
    n = int(SR * xf)
    body, tail = x[:-n].copy(), x[-n:]
    w = np.linspace(0, 1, n)[:, None] if x.ndim == 2 else np.linspace(0, 1, n)
    body[:n] = body[:n] * w + tail * (1 - w)
    return body


WARM_LP = {"static": 3000, "rain_bed": 4200, "chain": 4200, "lock": 4200, "click": 4200, "switch": 4200, "whoosh": 3400, "rattle": 4000}


def write(name, x, peak=0.9):
    """every file: warm low-pass (no white-noise hiss / harsh highs), DC/rumble high-pass, 15 ms edge fades"""
    if x.ndim == 1:
        x = stereo(x)
    cut = WARM_LP.get(name.rsplit("_", 1)[0] if name[-2:-1] == "_" else name, 4200)
    x = np.stack([hp(lp(x[:, c], cut, 4), 35) for c in range(x.shape[1])], 1)
    k = min(len(x) // 4, int(SR * 0.015))
    if k > 1:
        ramp = np.linspace(0, 1, k)[:, None]
        x[:k] *= ramp
        x[-k:] *= ramp[::-1]
    x = norm(x, peak)
    pcm = (np.clip(x, -1, 1) * 32767).astype("<i2")
    with wave.open(os.path.join(OUT, name + ".wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    print("sfx", name, f"{len(x)/SR:.2f}s")


def pink(n):
    w = rng.standard_normal(n)
    b = [0.049922035, -0.095993537, 0.050612699, -0.004408786]
    a = [1, -2.494956002, 2.017265875, -0.522189400]
    return lfilter(b, a, w)


def drops(n, rate, lo, hi, dec=0.004):
    """sparse droplet ticks"""
    x = np.zeros(n)
    k = rng.poisson(rate * n / SR)
    pos = rng.integers(0, n - 2000, k)
    tick = bp(rng.standard_normal(600), lo, hi) * env(600, 0.0003, dec, 6)
    for p in pos:
        x[p : p + 600] += tick * rng.uniform(0.2, 1)
    return x


# ---------------- beds ----------------
def rain_bed():
    d = 22
    n = int(SR * d)
    chans = []
    for c in range(2):
        hiss = bp(pink(n), 300, 4000) * 0.4
        body = lp(pink(n), 700) * 0.6
        gust = 0.75 + 0.25 * np.sin(2 * np.pi * t_(d) * (1 / 11) + c) * np.sin(2 * np.pi * t_(d) / 22)
        chans.append((hiss + body) * gust + drops(n, 60, 2500, 7000) * 0.35 + drops(n, 18, 300, 1200, 0.01) * 0.5)
    write("rain_bed", loopify(np.stack(chans, 1)), 0.7)


def room():
    d = 22
    n = int(SR * d)
    hum = 0.25 * np.sin(2 * np.pi * 60 * t_(d)) + 0.08 * np.sin(2 * np.pi * 120 * t_(d))
    tone = lp(pink(n), 300) * 0.5 + hum * 0.2
    muffled_rain = lp(pink(n), 900) * 0.25 + lp(drops(n, 20, 200, 900, 0.02), 1200) * 0.3
    x = tone + muffled_rain
    write("room", loopify(stereo(x, np.roll(x, 900))), 0.5)


def pad():
    """dark-deco minor drone, frequencies chosen to be periodic in 32 s -> perfect loop"""
    d = 32
    t = t_(d)
    def q(f):
        return round(f * d) / d
    notes = [(73.42, 0.5), (110.0, 0.35), (174.61, 0.22), (220.0, 0.12), (146.83, 0.25), (261.63, 0.06)]  # D2 A2 F3 A3 D3 C4
    L = np.zeros_like(t)
    R = np.zeros_like(t)
    for i, (f, a) in enumerate(notes):
        for det, pan in ((-0.6, 0.8), (0.6, 0.2)):
            ff = q(f + det * f / 440)
            lfo = 0.7 + 0.3 * np.sin(2 * np.pi * (i + 1) / d * t + i)
            s = a * lfo * (np.sin(2 * np.pi * ff * t) + 0.18 * np.sin(2 * np.pi * 2 * ff * t))
            L += s * pan
            R += s * (1 - pan)
    swell = 0.8 + 0.2 * np.sin(2 * np.pi * t / 16)
    write("pad", np.stack([lp(L * swell, 1800), lp(R * swell, 1800)], 1), 0.6)


# ---------------- one-shots (v14: foley-style, NO pure sine tones, 4 random variants each) ----------------
# Every one-shot is built from shaped noise with real transients; pitched "beep" components were removed
# (they were what made the v13 SFX sound synthetic and annoying). Each sound gets variants _0.._3 with
# different random micro-timing / filter centres / pitch so repeated hits never sound identical.
VAR = 4


def thump(n, f_lo, f_hi, dec):
    """noise-based low thump (instead of a sine 'boom')"""
    return lp(bp(rng.standard_normal(n), f_lo, f_hi), f_hi, 2) * env(n, 0.002, dec, 6)


def resonant_noise(n, fc, q, dec):
    """short metallic resonance from narrow-band noise (inharmonic, never a clean tone)"""
    return bp(rng.standard_normal(n), fc * (1 - 1 / q), fc * (1 + 1 / q), 2) * env(n, 0.0006, dec, 7)


def thunder(v=0):
    d = 6
    n = int(SR * d)
    crack = hp(rng.standard_normal(n), 900) * env(n, 0.004, 0.3, 5)
    rumble = lp(np.cumsum(rng.standard_normal(n)) * 0.01, 140) * env(n, 0.3, 5.5, 3.5)
    roll = lp(pink(n), 380) * env(n, 0.4, 4.5, 3) * (0.6 + 0.4 * np.sin(2 * np.pi * rng.uniform(0.8, 1.6) * t_(d)))
    return stereo(crack * 0.25 + rumble * 2 + roll, crack * 0.2 + np.roll(rumble, 400) * 2 + roll)


def land(v=0):
    n = int(SR * 1.0)
    body = thump(n, 40, rng.uniform(160, 220), 0.32)
    splash = bp(pink(n), 500, 3500) * env(n, 0.006, 0.4, 6)
    grit = bp(rng.standard_normal(n), 1500, 4000) * env(n, 0.002, 0.06, 8) * 0.3
    return body * 1.4 + splash * 0.7 + grit


def cloth(v=0):
    n = int(SR * rng.uniform(0.45, 0.7))
    x = bp(pink(n), rng.uniform(350, 600), rng.uniform(2200, 3200)) * np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    x *= 0.7 + 0.3 * np.abs(np.sin(2 * np.pi * rng.uniform(5, 9) * np.linspace(0, len(x) / SR, n)))
    return x


def grab(v=0):
    n = int(SR * 0.45)
    clack = bp(rng.standard_normal(n), 900, 3200) * env(n, 0.001, 0.04, 8)
    leather = bp(pink(n), 250, 1500) * env(n, 0.008, 0.18, 5)
    return clack * 0.6 + leather


def static(v=0):
    n = int(SR * rng.uniform(0.6, 0.9))
    hiss = bp(pink(n), 700, 2600) * env(n, 0.03, 0.7, 3)
    crk = np.zeros(n)
    for q in rng.integers(0, n - 300, 25):
        crk[q:q + 90] += rng.standard_normal(90) * rng.uniform(0.3, 1.2)
    # squelch: noise gated in syllable-like bursts (radio voice texture, not a tone)
    gate = np.clip(np.sin(2 * np.pi * rng.uniform(4, 7) * np.linspace(0, n / SR, n)), 0, 1) ** 0.5
    return hiss * (0.5 + 0.5 * gate) + bp(crk, 700, 2600) * 0.35


def thud(v=0):
    n = int(SR * 0.4)
    low = thump(n, 45, rng.uniform(220, 320), 0.18)
    slap = bp(rng.standard_normal(n), 300, 2000) * env(n, 0.001, 0.035, 8)
    return low * 1.3 + slap * 0.5


def chain(v=0):
    n = int(SR * 1.2)
    x = np.zeros(n)
    for q in np.sort(rng.integers(0, int(n * 0.65), 11)):
        m = n - q
        x[q:] += (resonant_noise(m, rng.uniform(1800, 3400), 9, 0.05) + bp(rng.standard_normal(m), 800, 3000) * env(m, 0.0005, 0.012, 8)) * rng.uniform(0.3, 1)
    return stereo(x, np.roll(x, 240))


def whoosh(v=0):
    n = int(SR * rng.uniform(0.8, 1.1))
    w = pink(n)
    sweep = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    out = bp(w, 150, 700) * (1 - sweep) + bp(w, 500, 2400) * sweep   # air, not a whistle
    out = out * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.6
    return stereo(out * np.linspace(1, 0.5, n), out * np.linspace(0.5, 1, n))


def click(v=0):
    n = int(SR * 0.08)
    return bp(rng.standard_normal(n), rng.uniform(1200, 1800), rng.uniform(3200, 4200)) * env(n, 0.0003, 0.008, 8) \
        + bp(rng.standard_normal(n), 300, 900) * env(n, 0.0005, 0.015, 8) * 0.5


def switch(v=0):
    """light switch / lamp: two-stage plastic snap, no mains hum"""
    n = int(SR * 0.25)
    x = np.zeros(n)
    for q, g in ((0, 0.5), (int(SR * rng.uniform(0.012, 0.02)), 1.0)):
        m = n - q
        x[q:] += bp(rng.standard_normal(m), 900, 3500) * env(m, 0.0003, 0.012, 8) * g
    return x + thump(n, 60, 250, 0.03) * 0.4


def lock(v=0):
    n = int(SR * 0.55)
    x = np.zeros(n)
    for q, g in ((0.0, 0.6), (rng.uniform(0.14, 0.2), 1.0), (rng.uniform(0.22, 0.27), 0.45)):
        i = int(q * SR)
        m = n - i
        x[i:] += bp(rng.standard_normal(m), 1200, 4200) * env(m, 0.0004, 0.025, 8) * g
        x[i:] += resonant_noise(m, rng.uniform(700, 1100), 6, 0.04) * 0.35 * g
    return x


def step(v=0):
    n = int(SR * 0.3)
    heel = thump(n, 50, rng.uniform(250, 380), 0.07)
    wet = bp(rng.standard_normal(n), 700, 4000) * env(n, 0.004, 0.11, 6) * rng.uniform(0.25, 0.45)
    return heel * 1.2 + wet


def rattle(v=0):
    n = int(SR * 0.8)
    x = np.zeros(n)
    for q in np.cumsum(rng.uniform(0.04, 0.09, 10)):
        i = int(q * SR)
        if i >= n - 600:
            break
        m = n - i
        x[i:] += bp(rng.standard_normal(m), 1200, 4000) * env(m, 0.0003, 0.012, 8) * rng.uniform(0.4, 1)
    return x


def crowd(v=0):
    d = 10
    n = int(SR * d)
    chans = []
    for c in range(2):
        x = np.zeros(n)
        for k in range(16):
            f = rng.uniform(250, 900)
            am = np.clip(np.sin(2 * np.pi * rng.uniform(2.5, 5) * t_(d) + rng.uniform(0, 6)), 0, 1) ** 2
            x += bp(pink(n), f, f * 2.2) * am * rng.uniform(0.4, 1)
        chans.append(x * np.minimum(1, t_(d) / 0.8) * np.minimum(1, (d - t_(d)) / 1.5))
    return np.stack(chans, 1)


PEAK = {"cloth": 0.6, "static": 0.55, "chain": 0.6, "whoosh": 0.6, "click": 0.6, "switch": 0.6, "lock": 0.65, "step": 0.6, "rattle": 0.55, "crowd": 0.5}

if __name__ == "__main__":
    for fn in (rain_bed, room, pad):
        fn()
    for fn in (thunder, land, cloth, grab, static, thud, chain, whoosh, click, switch, lock, step, rattle, crowd):
        for v in range(VAR):
            x = fn(v)
            write(f"{fn.__name__}_{v}", x, PEAK.get(fn.__name__, 0.85))
            if v == 0:
                write(fn.__name__, x, PEAK.get(fn.__name__, 0.85))
