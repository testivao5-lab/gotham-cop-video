import { Easing, interpolate, random, spring } from "remotion";

export const E = Easing.bezier(0.25, 0.1, 0.25, 1);
export const EIO = Easing.inOut(Easing.cubic);
export const EOUT = Easing.out(Easing.cubic);

/** clamped interpolate (storyboard safeInterpolate) */
export const safeRange = (inp: number[]) => {
  const r = inp.slice();
  for (let i = 1; i < r.length; i++) if (!(r[i] > r[i - 1])) r[i] = r[i - 1] + 0.001; // force a < b < c
  return r;
};
export const ci = (f: number, inp: number[], out: number[], easing: (t: number) => number = E) =>
  interpolate(f, safeRange(inp), out, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });
export const safeInterpolate = ci;

export const sp = (frame: number, start: number, cfg: { mass?: number; damping?: number; stiffness?: number } = {}) =>
  Math.min(1.08, spring({ frame: Math.max(0, frame - start), fps: 24, config: { mass: 1, damping: 18, stiffness: 100, ...cfg } }));

/** deterministic pseudo random 0..1 */
export const rand = (seed: number) => random(`gc-${seed}`); // remotion deterministic random('seed')

/** smooth 1D value noise, -1..1 */
export const noise = (t: number, seed = 0) => {
  const i = Math.floor(t);
  const f = t - i;
  const u = f * f * (3 - 2 * f);
  const a = rand(i + seed * 101.3) * 2 - 1;
  const b = rand(i + 1 + seed * 101.3) * 2 - 1;
  return a + (b - a) * u;
};

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** colour helpers */
const hex = (c: string) => {
  const h = c.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
};
const toHex = (r: number[]) =>
  "#" + r.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
export const mix = (a: string, b: string, t: number) => {
  const A = hex(a), B = hex(b);
  return toHex(A.map((v, i) => v + (B[i] - v) * t));
};
export const shade = (c: string, t: number) => mix(c, "#000000", t);
export const tint = (c: string, t: number) => mix(c, "#ffffff", t);
/** push a colour toward the noir night palette */
export const night = (c: string, t = 0.45, key = "#1b2a4a") => mix(c, key, t);

/** flicker for practical lights */
export const flicker = (frame: number, seed = 0, depth = 0.25) => {
  const n = noise(frame * 0.35, seed) * 0.5 + noise(frame * 1.7, seed + 7) * 0.5;
  return 1 - depth * Math.max(0, n);
};
