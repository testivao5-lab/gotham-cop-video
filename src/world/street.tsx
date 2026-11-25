import React from "react";
import { useCurrentFrame } from "remotion";
import { rand, mix, shade, tint, noise } from "../lib/anim";

/* ---------- brownstone / tenement row with fire escapes ---------- */
export const StreetFacades: React.FC<{
  seed?: number; baseY: number; x0?: number; x1?: number; brick?: string; trim?: string; litP?: number;
  heightMin?: number; heightMax?: number; key_?: string; fireEscapes?: boolean; shopFronts?: boolean; dark?: number;
}> = ({ seed = 4, baseY, x0 = -200, x1 = 2200, brick = "#3a2a2e", trim = "#5b4a52", litP = 0.3, heightMin = 420, heightMax = 640, fireEscapes = true, shopFronts = true, dark = 0.18 }) => {
  const f = useCurrentFrame();
  const blds: { x: number; w: number; h: number; s: number }[] = [];
  let x = x0, i = 0;
  while (x < x1) { const w = 260 + rand(seed + i * 3.3) * 200; blds.push({ x, w, h: heightMin + rand(seed + i * 5.1) * (heightMax - heightMin), s: seed * 10 + i }); x += w; i++; }
  const id = `fac${seed}`;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tint(brick, 0.12)} />
          <stop offset="1" stopColor={shade(brick, 0.45)} />
        </linearGradient>
        <pattern id={`${id}brick`} width="28" height="12" patternUnits="userSpaceOnUse">
          <path d="M0 11.5 H28 M14 0 V6 M0 6 H28 M7 6 V12 M21 6 V12" stroke="#000" strokeOpacity="0.18" strokeWidth="1" />
        </pattern>
        <linearGradient id={`${id}win`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffd98a" />
          <stop offset="1" stopColor="#c7792e" />
        </linearGradient>
      </defs>
      {blds.map((b) => {
        const top = baseY - b.h;
        const tone = mix(brick, "#0e1424", 0.15 + rand(b.s) * 0.25 + dark);
        const floors = Math.floor((b.h - 120) / 95);
        const cols = Math.max(2, Math.floor(b.w / 78));
        const cw = b.w / cols;
        return (
          <g key={b.s}>
            <rect x={b.x} y={top} width={b.w} height={b.h} fill={tone} />
            <rect x={b.x} y={top} width={b.w} height={b.h} fill={`url(#${id}g)`} opacity={0.55} />
            <rect x={b.x} y={top} width={b.w} height={b.h} fill={`url(#${id}brick)`} />
            {/* cornice */}
            <rect x={b.x - 6} y={top - 14} width={b.w + 12} height={18} fill={shade(trim, 0.2 + dark)} />
            <rect x={b.x - 6} y={top - 14} width={b.w + 12} height={3} fill={tint(trim, 0.2)} opacity={0.6} />
            {Array.from({ length: floors }).map((_, fl) =>
              Array.from({ length: cols }).map((_, c) => {
                const wx = b.x + c * cw + cw * 0.22, wy = top + 40 + fl * 95, ww = cw * 0.56, wh = 58;
                const on = rand(b.s * 7 + fl * 13 + c * 3 + (rand(b.s + Math.floor(f / 60)) > 0.97 ? 1 : 0)) < litP;
                const fl2 = on ? 0.85 + 0.15 * noise(f * 0.2, b.s + fl + c) : 1;
                return (
                  <g key={`${fl}-${c}`}>
                    <rect x={wx - 4} y={wy - 6} width={ww + 8} height={6} fill={shade(trim, 0.1)} />
                    <rect x={wx} y={wy} width={ww} height={wh} fill={on ? `url(#${id}win)` : "#0b0f1a"} opacity={on ? fl2 : 1} />
                    {on && <rect x={wx} y={wy} width={ww} height={wh * 0.45} fill="#3a2418" opacity={0.35} />}
                    <line x1={wx + ww / 2} y1={wy} x2={wx + ww / 2} y2={wy + wh} stroke="#0a0c12" strokeWidth={2.5} />
                    <line x1={wx} y1={wy + wh * 0.45} x2={wx + ww} y2={wy + wh * 0.45} stroke="#0a0c12" strokeWidth={2.5} />
                    <rect x={wx - 3} y={wy + wh} width={ww + 6} height={5} fill={tint(trim, 0.05)} opacity={0.8} />
                  </g>
                );
              })
            )}
            {fireEscapes && rand(b.s * 3) > 0.35 && (
              <FireEscape x={b.x + b.w * 0.18} w={b.w * 0.64} top={top + 30} floors={floors} />
            )}
            {shopFronts && (
              <g>
                <rect x={b.x + 10} y={baseY - 110} width={b.w - 20} height={110} fill="#0a0d16" />
                <rect x={b.x + 22} y={baseY - 96} width={b.w - 44} height={70} fill={rand(b.s * 9) > 0.5 ? "#1c2a3e" : "#3b2a1a"} opacity={0.9} />
                <path d={`M${b.x + 4} ${baseY - 118} h${b.w - 8} l-14 26 h${-(b.w - 36)} Z`} fill={rand(b.s) > 0.5 ? "#5a1e22" : "#1e3a3a"} />
                {Array.from({ length: Math.floor(b.w / 30) }).map((_, k) => (
                  <rect key={k} x={b.x + 18 + k * 30} y={baseY - 92} width={15} height={2} fill="#000" opacity={0.25} />
                ))}
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export const FireEscape: React.FC<{ x: number; w: number; top: number; floors: number }> = ({ x, w, top, floors }) => {
  const col = "#0b0e16";
  const parts: React.ReactNode[] = [];
  for (let fl = 0; fl < floors; fl++) {
    const y = top + 70 + fl * 95;
    parts.push(
      <g key={fl}>
        <rect x={x} y={y} width={w} height={4} fill={col} />
        <rect x={x} y={y - 26} width={w} height={2} fill={col} />
        {Array.from({ length: 9 }).map((_, k) => <rect key={k} x={x + (k * w) / 8} y={y - 26} width={2} height={26} fill={col} />)}
        {fl < floors - 1 && (
          <path d={fl % 2 === 0 ? `M${x + w * 0.15} ${y} L${x + w * 0.62} ${y + 95}` : `M${x + w * 0.85} ${y} L${x + w * 0.38} ${y + 95}`} stroke={col} strokeWidth={5} />
        )}
        <rect x={x} y={y - 0.5} width={w} height={1.5} fill="#6f86ad" opacity={0.35} />
      </g>
    );
  }
  return <g>{parts}</g>;
};

/* ---------- wet street with sidewalk, curb, reflections ---------- */
export type Reflect = { x: number; color: string; w?: number; strength?: number };
export const WetStreet: React.FC<{ horizonY: number; curbY?: number; reflections?: Reflect[]; asphalt?: string; laneY?: number; seed?: number }> = ({ horizonY, curbY, reflections = [], asphalt = "#0d121e", laneY, seed = 1 }) => {
  const f = useCurrentFrame();
  const cy = curbY ?? horizonY + 40;
  const id = `ws${seed}`;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id={`${id}a`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tint(asphalt, 0.1)} />
          <stop offset="1" stopColor={shade(asphalt, 0.5)} />
        </linearGradient>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a3346" />
          <stop offset="1" stopColor="#141a28" />
        </linearGradient>
        {reflections.map((r, i) => (
          <linearGradient key={i} id={`${id}r${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={r.color} stopOpacity={0.55 * (r.strength ?? 1)} />
            <stop offset="1" stopColor={r.color} stopOpacity="0" />
          </linearGradient>
        ))}
      </defs>
      <rect x="0" y={horizonY} width="1920" height={cy - horizonY} fill={`url(#${id}s)`} />
      <rect x="0" y={cy} width="1920" height="10" fill="#3c465c" />
      <rect x="0" y={cy + 10} width="1920" height={1080 - cy} fill={`url(#${id}a)`} />
      <defs><filter id={`${id}rb`} x="-50%" y="-10%" width="200%" height="120%"><feGaussianBlur stdDeviation="6 2" /></filter></defs>
      {/* paving seams */}
      {Array.from({ length: 24 }).map((_, i) => <line key={i} x1={i * 90} y1={horizonY} x2={i * 90 - 30} y2={cy} stroke="#000" strokeOpacity="0.25" />)}
      {laneY !== undefined && Array.from({ length: 14 }).map((_, i) => <rect key={i} x={i * 160 - 40} y={laneY} width={90} height={6} fill="#c9b67a" opacity={0.35} />)}
      {/* reflections: wobbling vertical streaks */}
      {reflections.map((r, i) => {
        const w = r.w ?? 40;
        const segs = 9;
        return (
          <g key={i} style={{ mixBlendMode: "screen" }}>
            <rect x={r.x - w / 2 + noise(f * 0.1, seed + i) * 4} y={cy + 8} width={w} height={1080 - cy} fill={`url(#${id}r${i})`} opacity={0.55} filter={`url(#${id}rb)`} />
            {Array.from({ length: segs * 2 }).map((_, k) => {
              const y = cy + 16 + k * ((1080 - cy) / (segs * 2));
              const wob = noise(f * 0.15 + k * 0.7, seed + i) * 12;
              const ww = w * (0.5 + rand(k * 3 + i) * 0.7);
              return <rect key={k} x={r.x - ww / 2 + wob} y={y} width={ww} height={2.5} rx={1.2} fill={r.color} opacity={(1 - k / (segs * 2)) * 0.5 * (r.strength ?? 1)} />;
            })}
          </g>
        );
      })}
      {/* puddles */}
      {Array.from({ length: 6 }).map((_, i) => (
        <ellipse key={i} cx={rand(i + seed) * 1920} cy={cy + 60 + rand(i * 3 + seed) * (1000 - cy)} rx={90 + rand(i * 5) * 160} ry={10 + rand(i * 7) * 14} fill="#4f6a96" opacity={0.12} />
      ))}
    </svg>
  );
};

/* ---------- deco street lamp ---------- */
export const StreetLamp: React.FC<{ x: number; baseY: number; h?: number; on?: number; scale?: number }> = ({ x, baseY, h = 520, on = 1, scale = 1 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
    <g transform={`translate(${x} ${baseY}) scale(${scale})`}>
      <rect x="-14" y="-30" width="28" height="30" fill="#0a0d14" />
      <rect x="-6" y={-h} width="12" height={h - 30} fill="#0e121c" />
      <rect x="-3" y={-h} width="3" height={h - 30} fill="#5a6f96" opacity="0.4" />
      <path d={`M0 ${-h} q0 -40 60 -48`} stroke="#0e121c" strokeWidth="8" fill="none" />
      <path d={`M44 ${-h - 52} h36 l-6 18 h-24 Z`} fill="#0e121c" />
      <ellipse cx="62" cy={-h - 30} rx="16" ry="9" fill={on > 0 ? "#ffe2a6" : "#2a2a2a"} opacity={0.4 + on * 0.6} />
    </g>
  </svg>
);

/* ---------- school bus (side view, front on the right) ---------- */
export const SchoolBus: React.FC<{
  x: number; y: number; scale?: number; fog?: number; wire?: boolean; interior?: number; childWindow?: number;
  ledOn?: boolean; lit?: number; childNode?: React.ReactNode; doorOpen?: number;
}> = ({ x, y, scale = 1, fog = 0, wire = false, interior = 0.4, ledOn = false, lit = 1, childNode, doorOpen = 0 }) => {
  const W = 850, H = 300;
  const yellow = mix("#d9a520", "#1b2a4a", 0.45 - lit * 0.15);
  const yDark = shade(yellow, 0.45);
  const wins = 8;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id="busBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tint(yellow, 0.18)} />
          <stop offset="0.55" stopColor={yellow} />
          <stop offset="1" stopColor={yDark} />
        </linearGradient>
        <linearGradient id="busWin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={mix("#1a2236", "#e0b070", interior)} />
          <stop offset="1" stopColor={mix("#0c101a", "#8a5a30", interior)} />
        </linearGradient>
        <radialGradient id="hub"><stop offset="0" stopColor="#c8d0dc" /><stop offset="1" stopColor="#4a5262" /></radialGradient>
      </defs>
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        {/* shadow */}
        <ellipse cx={W / 2} cy={H + 6} rx={W * 0.55} ry={18} fill="#000" opacity={0.5} />
        {/* body */}
        <path d={`M0 30 Q0 0 30 0 H${W - 150} Q${W - 120} 0 ${W - 115} 30 L${W - 105} 120 H${W - 20} Q${W} 122 ${W} 150 V${H - 40} H0 Z`} fill="url(#busBody)" />
        <rect x="0" y={H - 40} width={W} height={22} fill="#141414" />
        {/* stripes */}
        <rect x="0" y="150" width={W - 105} height="8" fill="#0d0d0d" opacity="0.85" />
        <rect x="0" y="190" width={W} height="8" fill="#0d0d0d" opacity="0.85" />
        <text x={(W - 105) / 2} y="182" textAnchor="middle" fontFamily="Arial Black, Arial" fontWeight={900} fontSize="22" fill="#111" opacity="0.85" letterSpacing="3">GOTHAM CITY SCHOOLS</text>
        {/* windows */}
        {Array.from({ length: wins }).map((_, i) => {
          const wx = 26 + i * 76, ww = 62;
          return (
            <g key={i}>
              <rect x={wx} y={26} width={ww} height={92} rx={6} fill="#111" />
              <rect x={wx + 4} y={30} width={ww - 8} height={84} rx={4} fill="url(#busWin)" />
              <rect x={wx + 4} y={70} width={ww - 8} height={3} fill="#111" />
              <path d={`M${wx + 8} 34 l18 0 l-14 40 l-8 0 Z`} fill="#fff" opacity={0.08} />
            </g>
          );
        })}
        {childNode}
        {/* fog on glass */}
        {fog > 0 && Array.from({ length: wins }).map((_, i) => (
          <rect key={i} x={30 + i * 76} y={30} width={54} height={84} rx={4} fill="#c9d6e6" opacity={fog * 0.75} />
        ))}
        {/* door (front right) */}
        <g>
          <rect x={W - 205} y={24} width={80} height={H - 66} rx={4} fill="#111" />
          <rect x={W - 200 - doorOpen * 30} y={30} width={34} height={H - 78} rx={3} fill="url(#busWin)" />
          <rect x={W - 162 + doorOpen * 30} y={30} width={34} height={H - 78} rx={3} fill="url(#busWin)" />
          {fog > 0 && <rect x={W - 200} y={30} width={72} height={H - 78} fill="#c9d6e6" opacity={fog * 0.6} />}
          <rect x={W - 166} y={30} width={4} height={H - 78} fill="#111" />
        </g>
        {wire && (
          <g>
            <path d={`M${W - 208} 70 C${W - 220} 120 ${W - 214} 170 ${W - 206} 220 L${W - 128} 222 C${W - 118} 170 ${W - 124} 110 ${W - 126} 72`} stroke="#b0161c" strokeWidth="4" fill="none" />
            <path d={`M${W - 204} 74 C${W - 214} 124 ${W - 208} 172 ${W - 202} 216`} stroke="#151515" strokeWidth="3" fill="none" />
            <rect x={W - 230} y={150} width={30} height={40} rx={4} fill="#1c1c22" stroke="#444" />
            <circle cx={W - 215} cy={160} r={5} fill={ledOn ? "#ff2a2a" : "#4a0a0a"} />
            {ledOn && <circle cx={W - 215} cy={160} r={16} fill="#ff2a2a" opacity={0.3} />}
          </g>
        )}
        {/* hood */}
        <rect x={W - 105} y={120} width={100} height={H - 160} fill="url(#busBody)" />
        <rect x={W - 10} y={150} width={12} height={70} fill="#222" />
        <circle cx={W - 4} cy={140} r={9} fill="#ffe8b0" opacity={0.85 * lit} />
        {/* stop arm */}
        <rect x={W - 250} y={140} width={10} height={40} fill="#8a1010" />
        {/* lights */}
        <circle cx="16" cy="14" r="7" fill="#c03020" opacity="0.8" />
        <circle cx={W - 132} cy="14" r="7" fill="#d0a020" opacity="0.8" />
        {/* wheels */}
        {[150, W - 170].map((wx) => (
          <g key={wx}>
            <path d={`M${wx - 70} ${H - 40} a70 70 0 0 1 140 0`} fill="#0c0c0c" />
            <circle cx={wx} cy={H - 18} r={50} fill="#151515" />
            <circle cx={wx} cy={H - 18} r={24} fill="url(#hub)" />
            <circle cx={wx} cy={H - 18} r={8} fill="#2a2a2a" />
          </g>
        ))}
        {/* rim light on roof */}
        <path d={`M20 2 H${W - 150}`} stroke="#9fb6dc" strokeWidth="3" opacity="0.5" />
      </g>
    </svg>
  );
};

/* ---------- police cruiser (side view, facing left) ---------- */
export const Cruiser: React.FC<{ x: number; y: number; scale?: number; flip?: boolean; lightsOn?: boolean }> = ({ x, y, scale = 1, flip = false, lightsOn = true }) => {
  const f = useCurrentFrame();
  const red = lightsOn && Math.floor(f / 6) % 2 === 0;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id="crB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a3448" /><stop offset="1" stopColor="#07090f" /></linearGradient>
        <linearGradient id="crW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c7ccd6" /><stop offset="1" stopColor="#5d6474" /></linearGradient>
      </defs>
      <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
        <ellipse cx="225" cy="160" rx="250" ry="14" fill="#000" opacity="0.5" />
        <path d="M10 95 Q12 70 60 66 L120 62 Q150 20 200 18 H300 Q340 20 365 62 L420 70 Q448 76 450 100 V130 H10 Z" fill="url(#crB)" />
        <path d="M130 66 Q155 28 200 26 H245 V66 Z" fill="#1b2638" />
        <path d="M252 26 H298 Q330 28 352 66 H252 Z" fill="#1b2638" />
        <path d="M140 64 Q160 34 198 32" stroke="#8fa6cc" strokeWidth="2" opacity="0.5" fill="none" />
        <rect x="160" y="70" width="170" height="58" fill="url(#crW)" />
        <text x="245" y="106" textAnchor="middle" fontFamily="Georgia" fontWeight={700} fontSize="18" fill="#10131c">GCPD</text>
        <rect x="190" y="6" width="110" height="14" rx="4" fill="#111" />
        <rect x="192" y="8" width="52" height="10" rx="3" fill={red ? "#ff2a2a" : "#4a0d0d"} />
        <rect x="246" y="8" width="52" height="10" rx="3" fill={!red && lightsOn ? "#2a6aff" : "#0d1a4a"} />
        {[95, 360].map((wx) => (
          <g key={wx}><circle cx={wx} cy="132" r="32" fill="#0b0b0b" /><circle cx={wx} cy="132" r="14" fill="#8a93a3" /></g>
        ))}
        <circle cx="14" cy="96" r="7" fill="#ffe9b8" />
      </g>
    </svg>
  );
};
