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


WARM_LP = {"static": 3200, "rain_bed": 4200, "chain": 5200, "lock": 5200, "click": 5200, "switch": 5200}


def write(name, x, peak=0.9):
    """every file: warm low-pass (no white-noise hiss / harsh highs), DC/rumble high-pass, 15 ms edge fades"""
    if x.ndim == 1:
        x = stereo(x)
    cut = WARM_LP.get(name, 4600)
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


# ---------------- one-shots ----------------
def thunder():
    d = 6
    n = int(SR * d)
    crack = hp(rng.standard_normal(n), 1500) * env(n, 0.003, 0.25, 5)
    rumble = lp(np.cumsum(rng.standard_normal(n)) * 0.01, 160) * env(n, 0.25, 5.5, 3.5)
    roll = lp(pink(n), 400) * env(n, 0.4, 4.5, 3) * (0.6 + 0.4 * np.sin(2 * np.pi * 1.3 * t_(d)))
    write("thunder", stereo(crack * 0.4 + rumble * 2 + roll, crack * 0.3 + np.roll(rumble, 400) * 2 + roll))


def land():
    d = 1.2
    n = int(SR * d)
    t = t_(d)
    boom = np.sin(2 * np.pi * (50 + 40 * np.exp(-t * 20)) * t) * env(n, 0.002, 0.5, 6)
    splash = bp(rng.standard_normal(n), 800, 6000) * env(n, 0.004, 0.35, 7)
    write("land", boom + splash * 0.6)


def cloth():
    d = 0.7
    n = int(SR * d)
    x = bp(pink(n), 500, 4000) * np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    write("cloth", x, 0.6)


def grab():
    d = 0.5
    n = int(SR * d)
    clack = bp(rng.standard_normal(n), 1200, 5000) * env(n, 0.001, 0.05, 8)
    leather = bp(pink(n), 300, 1800) * env(n, 0.01, 0.2, 5)
    write("grab", clack + leather * 0.8)


def static():
    d = 1.0
    n = int(SR * d)
    hiss = bp(pink(n), 900, 2800) * env(n, 0.02, 0.9, 3)
    crk = np.zeros(n)
    for p in rng.integers(0, n - 300, 40):
        crk[p : p + 120] += rng.standard_normal(120) * rng.uniform(0.5, 1.5)
    write("static", hiss + bp(crk, 800, 3000) * 0.4, 0.6)


def thud():
    d = 0.45
    n = int(SR * d)
    t = t_(d)
    low = np.sin(2 * np.pi * (85 + 30 * np.exp(-t * 30)) * t) * env(n, 0.002, 0.25, 6)
    glass = (np.sin(2 * np.pi * 1730 * t) + 0.6 * np.sin(2 * np.pi * 2610 * t)) * env(n, 0.001, 0.18, 7) * 0.12
    slap = bp(rng.standard_normal(n), 300, 2500) * env(n, 0.001, 0.04, 8) * 0.6
    write("thud", low + glass + slap)


def chain():
    d = 1.4
    n = int(SR * d)
    t = t_(d)
    x = np.zeros(n)
    for p in np.sort(rng.integers(0, int(n * 0.7), 14)):
        m = n - p
        part = np.zeros(m)
        for f in rng.uniform(2200, 6800, 3):
            part += np.sin(2 * np.pi * f * t[:m]) * rng.uniform(0.3, 1)
        x[p:] += part * env(m, 0.0005, 0.12, 7) * rng.uniform(0.4, 1)
    write("chain", stereo(x, np.roll(x, 300)), 0.7)


def whoosh():
    d = 1.3
    n = int(SR * d)
    w = pink(n)
    sweep = np.sin(np.pi * np.linspace(0, 1, n)) ** 2
    out = bp(w, 200, 900) * (1 - sweep) + bp(w, 1200, 7000) * sweep
    out = out * np.sin(np.pi * np.linspace(0, 1, n)) ** 1.5
    write("whoosh", stereo(out * np.linspace(1, 0.4, n), out * np.linspace(0.4, 1, n)), 0.7)


def click_(name, d=0.12, f0=3200, extra=0.0):
    n = int(SR * d)
    t = t_(d)
    c = bp(rng.standard_normal(n), f0 * 0.6, f0 * 1.6) * env(n, 0.0003, 0.012, 8)
    body = np.sin(2 * np.pi * 900 * t) * env(n, 0.0005, 0.03, 8) * 0.3
    hum = extra * np.sin(2 * np.pi * 120 * t) * env(n, 0.01, d, 2)
    write(name, c + body + hum, 0.7)


def lock():
    d = 0.6
    n = int(SR * d)
    x = np.zeros(n)
    for p, g in ((0.0, 0.7), (0.18, 1.0), (0.24, 0.5)):
        i = int(p * SR)
        m = n - i
        x[i:] += bp(rng.standard_normal(m), 1500, 6000) * env(m, 0.0004, 0.03, 8) * g
        x[i:] += np.sin(2 * np.pi * 620 * t_(m / SR)) * env(m, 0.0005, 0.06, 7) * 0.3 * g
    write("lock", x, 0.7)


def step():
    d = 0.35
    n = int(SR * d)
    t = t_(d)
    heel = np.sin(2 * np.pi * (70 + 50 * np.exp(-t * 40)) * t) * env(n, 0.002, 0.12, 6)
    wet = bp(rng.standard_normal(n), 900, 7000) * env(n, 0.005, 0.15, 6) * 0.5
    write("step", heel + wet, 0.6)


def rattle():
    d = 0.9
    n = int(SR * d)
    x = np.zeros(n)
    for p in np.cumsum(rng.uniform(0.04, 0.09, 10)):
        i = int(p * SR)
        if i >= n - 600:
            break
        m = n - i
        x[i:] += bp(rng.standard_normal(m), 2000, 7000) * env(m, 0.0003, 0.01, 8) * rng.uniform(0.5, 1)
    write("rattle", x, 0.6)


def crowd():
    d = 10
    n = int(SR * d)
    chans = []
    for c in range(2):
        x = np.zeros(n)
        for k in range(14):  # many indistinct voices = formant-band noise with syllabic AM
            f = rng.uniform(250, 900)
            am = np.clip(np.sin(2 * np.pi * rng.uniform(2.5, 5) * t_(d) + rng.uniform(0, 6)), 0, 1) ** 2
            x += bp(pink(n), f, f * 2.2) * am * rng.uniform(0.4, 1)
        x += drops(n, 3, 1500, 5000, 0.05) * 0.3  # distant claps
        chans.append(x * np.minimum(1, t_(d) / 0.8) * np.minimum(1, (d - t_(d)) / 1.5))
    write("crowd", np.stack(chans, 1), 0.5)


if __name__ == "__main__":
    for fn in (rain_bed, room, pad, thunder, land, cloth, grab, static, thud, chain, whoosh, lock, step, rattle, crowd):
        fn()
    click_("click", 0.12, 3200)
    click_("switch", 0.6, 2400, extra=0.15)
