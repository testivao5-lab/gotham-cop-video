import React from "react";
import { useCurrentFrame } from "remotion";
import { rand, mix, shade, tint } from "../lib/anim";

export type SkyVariant = "night" | "red" | "dusk" | "storm" | "dawn" | "blackout";
const SKIES: Record<SkyVariant, [string, string, string]> = {
  night: ["#050b1c", "#13274d", "#2c4a7c"],
  storm: ["#04070f", "#0f1a30", "#26395c"],
  red: ["#2a0606", "#8e1b12", "#d2452a"],
  dusk: ["#1a1430", "#5a3550", "#d0805a"],
  dawn: ["#1a2440", "#5d6a8a", "#c9a48a"],
  blackout: ["#020306", "#070b16", "#111a2e"],
};
export const skyHorizon = (v: SkyVariant) => SKIES[v][2];

export const BAT_PATH =
  "M0,50 C20,40 30,20 25,5 C45,20 55,30 70,28 L80,10 L88,25 L100,22 L112,25 L120,10 L130,28 C145,30 155,20 175,5 C170,20 180,40 200,50 C180,52 165,62 160,78 C150,66 135,64 125,72 C115,78 105,85 100,95 C95,85 85,78 75,72 C65,64 50,66 40,78 C35,62 20,52 0,50 Z";

export const Sky: React.FC<{
  variant?: SkyVariant; moon?: [number, number, number]; batSignal?: { x: number; y: number; fromX: number; fromY: number; on: number };
  clouds?: number; seed?: number; horizonY?: number; flash?: number;
}> = ({ variant = "night", moon, batSignal, clouds = 9, seed = 1, horizonY = 760, flash = 0 }) => {
  const f = useCurrentFrame();
  const [top, mid, hor] = SKIES[variant];
  const cloudCol = variant === "red" ? "#f07050" : variant === "dusk" || variant === "dawn" ? "#e8b090" : "#8aa6d6";
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id={`sky${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset={String(horizonY / 1080 * 0.55)} stopColor={mid} />
          <stop offset={String(horizonY / 1080)} stopColor={hor} />
          <stop offset="1" stopColor={shade(hor, 0.3)} />
        </linearGradient>
        <radialGradient id={`cl${seed}`}>
          <stop offset="0" stopColor={cloudCol} stopOpacity="0.55" />
          <stop offset="0.6" stopColor={cloudCol} stopOpacity="0.18" />
          <stop offset="1" stopColor={cloudCol} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`moon${seed}`}>
          <stop offset="0" stopColor="#f4f1e2" />
          <stop offset="0.75" stopColor="#dfe6ee" />
          <stop offset="1" stopColor="#b9c7da" />
        </radialGradient>
        <radialGradient id={`halo${seed}`}>
          <stop offset="0" stopColor="#cfe0ff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#cfe0ff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`beam${seed}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#dfe9ff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#dfe9ff" stopOpacity="0.12" />
        </linearGradient>
      </defs>
      <rect width="1920" height="1080" fill={`url(#sky${seed})`} />
      {moon && (
        <g>
          <circle cx={moon[0]} cy={moon[1]} r={moon[2] * 3.2} fill={`url(#halo${seed})`} />
          <circle cx={moon[0]} cy={moon[1]} r={moon[2]} fill={`url(#moon${seed})`} />
          <circle cx={moon[0] - moon[2] * 0.3} cy={moon[1] - moon[2] * 0.2} r={moon[2] * 0.18} fill="#c8cfd8" opacity="0.5" />
          <circle cx={moon[0] + moon[2] * 0.25} cy={moon[1] + moon[2] * 0.3} r={moon[2] * 0.12} fill="#c8cfd8" opacity="0.4" />
        </g>
      )}
      {/* long airbrushed cloud streaks */}
      {Array.from({ length: clouds }).map((_, i) => {
        const w = 500 + rand(i + seed) * 900;
        const h = 40 + rand(i * 3 + seed) * 70;
        const x = ((rand(i * 7 + seed) * 2600 + f * (0.25 + rand(i) * 0.4)) % 2900) - 500;
        const y = 60 + rand(i * 5 + seed) * (horizonY * 0.6);
        return <ellipse key={i} cx={x} cy={y} rx={w / 2} ry={h / 2} fill={`url(#cl${seed})`} opacity={0.5 + rand(i * 11) * 0.5} />;
      })}
      {batSignal && batSignal.on > 0 && (
        <g opacity={batSignal.on}>
          <path d={`M${batSignal.fromX - 8} ${batSignal.fromY} L${batSignal.fromX + 8} ${batSignal.fromY} L${batSignal.x + 120} ${batSignal.y + 20} L${batSignal.x - 120} ${batSignal.y - 10} Z`} fill={`url(#beam${seed})`} />
          <ellipse cx={batSignal.x} cy={batSignal.y} rx="140" ry="82" fill="#f3ecc0" opacity="0.85" />
          <ellipse cx={batSignal.x} cy={batSignal.y} rx="190" ry="120" fill="#f3ecc0" opacity="0.15" />
          <g transform={`translate(${batSignal.x - 100} ${batSignal.y - 52}) scale(1 1.05)`}>
            <path d={BAT_PATH} fill="#1a1a22" opacity="0.92" />
          </g>
        </g>
      )}
      {flash > 0 && <rect width="1920" height="1080" fill="#cfe0ff" opacity={flash * 0.35} />}
    </svg>
  );
};

/* ---------------- Deco skyline ---------------- */
type Bld = { x: number; w: number; h: number; tiers: number; spire: boolean; pil: number; seed: number };

const makeCity = (seed: number, count: number, x0: number, x1: number, hMin: number, hMax: number): Bld[] => {
  const out: Bld[] = [];
  let x = x0;
  for (let i = 0; x < x1 && i < count; i++) {
    const r = (k: number) => rand(seed * 31 + i * 7.3 + k);
    const w = 70 + r(1) * 150;
    out.push({ x, w, h: hMin + r(2) * (hMax - hMin), tiers: 1 + Math.floor(r(3) * 3), spire: r(4) > 0.72, pil: 2 + Math.floor(r(5) * 5), seed: seed * 13 + i });
    x += w * (0.55 + r(6) * 0.55);
  }
  return out;
};

const winPath = (x: number, y: number, w: number, h: number, cols: number, rows: number, seed: number, litP: number, lit: boolean) => {
  let d = "";
  const cw = w / cols, rh = h / rows;
  for (let c = 0; c < cols; c++)
    for (let r = 0; r < rows; r++) {
      const on = rand(seed * 3.7 + c * 13.1 + r * 7.9) < litP;
      if (on !== lit) continue;
      const ww = cw * 0.38, wh = rh * 0.5;
      d += `M${(x + c * cw + (cw - ww) / 2).toFixed(1)} ${(y + r * rh + (rh - wh) / 2).toFixed(1)}h${ww.toFixed(1)}v${wh.toFixed(1)}h${(-ww).toFixed(1)}Z`;
    }
  return d;
};

/** Dark-deco skyline layer: stepped towers, two-face shading, pilasters, warm windows, atmospheric haze. */
export const DecoSkyline: React.FC<{
  seed?: number; baseY: number; hMin: number; hMax: number; haze?: number; hazeColor?: string;
  body?: string; light?: string; litP?: number; count?: number; x0?: number; x1?: number; windowColor?: string;
  blackout?: number; rimSide?: "left" | "right";
}> = ({ seed = 1, baseY, hMin, hMax, haze = 0.3, hazeColor = "#2c4a7c", body = "#141c30", light = "#3a5684", litP = 0.22, count = 40, x0 = -300, x1 = 2300, windowColor = "#f2cf7a", blackout = 0, rimSide = "left" }) => {
  const f = useCurrentFrame();
  const city = makeCity(seed, count, x0, x1, hMin, hMax);
  const b = mix(body, hazeColor, haze);
  const l = mix(light, hazeColor, haze * 0.8);
  const gid = `dk${seed}`;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id={`${gid}a`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={l} />
          <stop offset="0.55" stopColor={mix(l, b, 0.6)} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <linearGradient id={`${gid}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shade(l, 0.45)} />
          <stop offset="1" stopColor={shade(b, 0.35)} />
        </linearGradient>
      </defs>
      {city.map((bd, i) => {
        const tiers: React.ReactNode[] = [];
        let tw = bd.w, tx = bd.x, yb = Math.max(baseY, 1300); // buildings always run to the bottom edge (never end mid-screen)
        for (let t = 0; t < bd.tiers; t++) {
          const cum = t === bd.tiers - 1 ? 1 : (t + 1) / bd.tiers * (0.75 + rand(bd.seed + t) * 0.2);
          const top = baseY - bd.h * cum;
          tiers.push(<Tier key={t} x={tx} y={top} w={tw} h={yb - top} {...{ gid, bd, t, litP: litP * (1 - blackout), windowColor, f, rimSide, l }} />);
          yb = top;
          const inset = tw * (0.1 + rand(bd.seed * 2 + t) * 0.1);
          tx += inset; tw -= inset * 2;
        }
        return (
          <g key={i}>
            {tiers}
            {bd.spire && <path d={`M${tx + tw / 2 - 6} ${baseY - bd.h} L${tx + tw / 2} ${baseY - bd.h - 50 - rand(bd.seed) * 70} L${tx + tw / 2 + 6} ${baseY - bd.h} Z`} fill={`url(#${gid}a)`} />}
          </g>
        );
      })}
      <rect x="-400" y={Math.max(baseY, 1300)} width="2720" height={400} fill={b} />
    </svg>
  );
};

const Tier: React.FC<{ x: number; y: number; w: number; h: number; gid: string; bd: Bld; t: number; litP: number; windowColor: string; f: number; rimSide: string; l: string }> = ({ x, y, w, h, gid, bd, t, litP, windowColor, f, rimSide, l }) => {
  const split = rimSide === "left" ? 0.58 : 0.42;
  const lx = rimSide === "left" ? x : x + w * split;
  const lw = rimSide === "left" ? w * split : w * (1 - split);
  const sx = rimSide === "left" ? x + w * split : x;
  const sw = w - lw;
  const cols = Math.max(2, Math.round(lw / 14));
  const rows = Math.max(3, Math.round(h / 22));
  const flick = Math.floor(f / 36);
  return (
    <g>
      <rect x={lx} y={y} width={lw} height={h} fill={`url(#${gid}a)`} />
      <rect x={sx} y={y} width={sw} height={h} fill={`url(#${gid}b)`} />
      {/* pilasters */}
      {Array.from({ length: bd.pil }).map((_, k) => (
        <rect key={k} x={lx + ((k + 0.5) * lw) / bd.pil - 1} y={y + 4} width={2} height={h - 4} fill={tint(l, 0.25)} opacity={0.18} />
      ))}
      <line x1={rimSide === "left" ? x + 0.5 : x + w - 0.5} y1={y} x2={rimSide === "left" ? x + 0.5 : x + w - 0.5} y2={y + h} stroke={tint(l, 0.5)} strokeWidth={1.2} opacity={0.5} />
      <line x1={x} y1={y + 0.5} x2={x + w} y2={y + 0.5} stroke={tint(l, 0.5)} strokeWidth={1.2} opacity={0.45} />
      <path d={winPath(lx + 3, y + 10, lw - 6, h - 14, cols, rows, bd.seed + t * 5 + (rand(bd.seed + flick) > 0.93 ? 1 : 0), litP, true)} fill={windowColor} opacity={0.9} />
      <path d={winPath(sx + 2, y + 10, sw - 4, h - 14, Math.max(1, Math.round(sw / 16)), rows, bd.seed + 99 + t, litP * 0.7, true)} fill={windowColor} opacity={0.55} />
    </g>
  );
};
