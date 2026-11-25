import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { rand, noise } from "../lib/anim";

/** Layered rain. One <path> per layer keeps the DOM light. angle in deg (negative leans left). */
export const Rain: React.FC<{
  count?: number; speed?: number; len?: number; angle?: number; opacity?: number; width?: number;
  seed?: number; color?: string; region?: [number, number, number, number];
}> = ({ count = 260, speed = 48, len = 46, angle = -11, opacity = 0.35, width = 1.4, seed = 1, color = "#b9cbe6", region = [-200, -100, 2320, 1240] }) => {
  const f = useCurrentFrame();
  const [rx, ry, rw, rh] = region;
  const rad = (angle * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = Math.cos(rad);
  let d = "";
  for (let i = 0; i < count; i++) {
    const s = rand(i * 3.1 + seed * 17);
    const sp = speed * (0.75 + 0.5 * rand(i * 7.7 + seed));
    const l = len * (0.6 + 0.8 * rand(i * 1.3 + seed * 3));
    const travel = (rand(i * 9.1 + seed * 5) * (rh + l) + sp * f) % (rh + l);
    const y = ry + travel - l;
    const x = rx + s * rw + dx * travel;
    d += `M${x.toFixed(1)} ${y.toFixed(1)}l${(dx * l).toFixed(1)} ${(dy * l).toFixed(1)}`;
  }
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <path d={d} stroke={color} strokeWidth={width} strokeLinecap="round" opacity={opacity} />
    </svg>
  );
};

/** puddle / ground splashes inside a horizontal band */
export const Splashes: React.FC<{ y0: number; y1: number; count?: number; seed?: number; color?: string; opacity?: number }> = ({ y0, y1, count = 40, seed = 3, color = "#c9d8f0", opacity = 0.5 }) => {
  const f = useCurrentFrame();
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: count }).map((_, i) => {
        const period = 10 + Math.floor(rand(i + seed) * 14);
        const phase = Math.floor(rand(i * 2.3 + seed) * period);
        const cycle = Math.floor((f + phase) / period);
        const t = ((f + phase) % period) / period;
        const x = rand(i * 5.1 + cycle * 1.7 + seed) * 1920;
        const y = y0 + rand(i * 3.3 + cycle * 2.9 + seed) * (y1 - y0);
        const persp = 0.4 + 0.6 * ((y - y0) / Math.max(1, y1 - y0));
        const r = (3 + t * 16) * persp;
        return <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.28} fill="none" stroke={color} strokeWidth={1.2 * persp} opacity={(1 - t) * opacity} />;
      })}
    </svg>
  );
};

/** drifting fog banks made of soft radial blobs */
export const Fog: React.FC<{ y?: number; height?: number; opacity?: number; color?: string; seed?: number; drift?: number }> = ({ y = 700, height = 260, opacity = 0.25, color = "160,180,210", seed = 2, drift = 0.6 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 7 }).map((_, i) => {
        const w = 700 + rand(i + seed) * 700;
        const x = ((rand(i * 4.4 + seed) * 2600 + f * drift * (0.5 + rand(i))) % 2800) - 600;
        const yy = y + (rand(i * 2.2 + seed) - 0.5) * height;
        return (
          <div key={i} style={{
            position: "absolute", left: x - w / 2, top: yy - height / 2, width: w, height,
            background: `radial-gradient(ellipse at center, rgba(${color},${opacity}) 0%, rgba(${color},0) 70%)`,
          }} />
        );
      })}
    </AbsoluteFill>
  );
};

/** cone of light (street lamp / flashlight / searchlight). Points: apex -> spread at distance. */
export const LightCone: React.FC<{
  x: number; y: number; angle: number; length: number; spread: number; color?: string; opacity?: number; id: string;
}> = ({ x, y, angle, length, spread, color = "255,214,150", opacity = 0.35, id }) => {
  const half = spread / 2;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={`rgb(${color})`} stopOpacity={opacity} />
          <stop offset="1" stopColor={`rgb(${color})`} stopOpacity={0} />
        </linearGradient>
      </defs>
      <g transform={`translate(${x} ${y}) rotate(${angle})`}>
        <path d={`M-6 0 L6 0 L${half} ${length} L${-half} ${length} Z`} fill={`url(#${id})`} />
        <path d={`M-3 0 L3 0 L${half * 0.45} ${length * 0.9} L${-half * 0.45} ${length * 0.9} Z`} fill={`url(#${id})`} opacity={0.6} />
      </g>
    </svg>
  );
};

/** soft glow disc (practical light source) */
export const Glow: React.FC<{ x: number; y: number; r: number; color?: string; opacity?: number }> = ({ x, y, r, color = "255,200,120", opacity = 0.6 }) => (
  <div style={{
    position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%",
    background: `radial-gradient(circle, rgba(${color},${opacity}) 0%, rgba(${color},${opacity * 0.35}) 30%, rgba(${color},0) 70%)`,
    mixBlendMode: "screen", pointerEvents: "none",
  }} />
);

/** film grain — animated turbulence tile */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const f = useCurrentFrame();
  const seed = f % 9;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='${seed}' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='300' height='300' filter='url(#n)'/></svg>`;
  return (
    <AbsoluteFill style={{
      backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`,
      opacity, mixBlendMode: "overlay", pointerEvents: "none",
    }} />
  );
};

export const Vignette: React.FC<{ strength?: number; color?: string }> = ({ strength = 0.55, color = "0,0,0" }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 48%, rgba(${color},0) 45%, rgba(${color},${strength}) 100%)`, pointerEvents: "none" }} />
);

/** colour grade overlay */
export const Grade: React.FC<{ color: string; opacity: number; blend?: React.CSSProperties["mixBlendMode"] }> = ({ color, opacity, blend = "soft-light" }) => (
  <AbsoluteFill style={{ background: color, opacity, mixBlendMode: blend, pointerEvents: "none" }} />
);

/** distant lightning flash envelope 0..1 */
export const lightning = (f: number, at: number[]) => {
  let v = 0;
  for (const a of at) {
    const d = f - a;
    if (d >= 0 && d < 14) v = Math.max(v, d < 2 ? 1 : d < 4 ? 0.3 : d < 6 ? 0.8 : Math.max(0, 1 - (d - 6) / 8) * 0.5);
  }
  return v;
};

/** standard post stack */
export const Post: React.FC<{ vignette?: number; grain?: number; tintColor?: string; tintOpacity?: number }> = ({ vignette = 0.6, grain = 0.07, tintColor = "#1e3460", tintOpacity = 0.18 }) => (
  <>
    <Grade color={tintColor} opacity={tintOpacity} />
    <Vignette strength={vignette} />
    <Grain opacity={grain} />
  </>
);

/** subtle handheld drift */
export const handheld = (f: number, amt = 1, seed = 0) => ({
  x: noise(f * 0.04, seed) * 6 * amt,
  y: noise(f * 0.05, seed + 3) * 4 * amt,
  rot: noise(f * 0.03, seed + 9) * 0.25 * amt,
});
