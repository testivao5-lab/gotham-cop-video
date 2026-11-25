import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { ci, rand, flicker, mix, shade } from "../lib/anim";
import { cue, sceneDur } from "../lib/cues";
import { DISPLAY } from "../lib/fonts";

export const EZ = Easing.bezier(0.25, 0.1, 0.25, 1);
export const mixP = (a: [number, number], b: [number, number], t: number): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
/** safe cue: word start (local frame) or a fraction of the scene if the word is missing from the alignment */
export const cq = (n: number, word: string, frac: number, nth = 1) => {
  try { return cue(n, word, nth); } catch { return Math.round(sceneDur(n) * frac); }
};
/** life drift for static set pieces (never static > 3 frames) */
export const drift = (f: number, seed = 0, amt = 1) => ({ x: Math.sin(f * 0.021 + seed) * 6 * amt, y: Math.sin(f * 0.017 + seed * 2) * 3 * amt });

const O = "#07080c";

/* ---------------- Bank ruins (S11–15): half the deco front wall is gone ---------------- */
export const BankRuins: React.FC<{ baseY?: number; work?: number }> = ({ baseY = 800, work = 1 }) => {
  const f = useCurrentFrame();
  const fl = flicker(f, 7, 0.08);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="bkStone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7a7480" /><stop offset="0.6" stopColor="#4a4652" /><stop offset="1" stopColor="#2a2630" /></linearGradient>
        <linearGradient id="bkIn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0c0a10" /><stop offset="1" stopColor="#2a1c18" /></linearGradient>
        <radialGradient id="bkWork"><stop offset="0" stopColor="#ffe9b8" stopOpacity="0.85" /><stop offset="1" stopColor="#ffe9b8" stopOpacity="0" /></radialGradient>
      </defs>
      {/* building mass: 4 storeys (3.5 m each) */}
      <rect x={260} y={baseY - 560} width={1400} height={560} fill="url(#bkStone)" stroke={O} strokeWidth={3} />
      <rect x={240} y={baseY - 600} width={1440} height={46} fill="#5a5560" stroke={O} strokeWidth={3} />
      <text x={960} y={baseY - 566} textAnchor="middle" fontFamily={DISPLAY} fontSize={40} letterSpacing={18} fill="#d8cfc0">GOTHAM SAVINGS & TRUST</text>
      {/* upper windows */}
      {Array.from({ length: 3 }).map((_, r) => Array.from({ length: 9 }).map((_, c) => {
        const x = 320 + c * 148, y = baseY - 520 + r * 120;
        const broken = c < 4 && r > 0;
        return <g key={`${r}${c}`}><rect x={x} y={y} width={70} height={84} fill={broken ? "#0a0808" : rand(r * 9 + c) > 0.7 ? "#e8b860" : "#1a1c26"} stroke={O} strokeWidth={2} />
          {!broken && <path d={`M${x + 35} ${y} V${y + 84} M${x} ${y + 42} H${x + 70}`} stroke="#3a3640" strokeWidth={3} />}
          {broken && <path d={`M${x} ${y + 10} L${x + 30} ${y + 40} L${x + 20} ${y + 84} M${x + 70} ${y + 20} L${x + 44} ${y + 50}`} stroke="#6a6470" strokeWidth={2} />}</g>;
      }))}
      {/* v14 blast hole: scorch halo, radiating cracks, thick broken stone edge catching light, exposed rebar,
          a readable banking hall behind (back wall, floor line, hanging ceiling slab) and the VAULT set into the back wall */}
      <defs>
        <radialGradient id="bkScorch" cx="0.5" cy="0.6" r="0.6"><stop offset="0.55" stopColor="#000" stopOpacity="0.55" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
        <radialGradient id="bkVault"><stop offset="0" stopColor="#ffe2a0" stopOpacity="0.9" /><stop offset="1" stopColor="#ffb860" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx={585} cy={baseY - 190} rx={420} ry={260} fill="url(#bkScorch)" />
      {[[270, -300, 200, -420], [450, -380, 430, -520], [600, -360, 700, -470], [840, -250, 960, -300], [880, -150, 980, -120], [330, -340, 260, -430]].map(([x1, y1, x2, y2], k) => (
        <path key={k} d={`M${x1} ${baseY + y1} L${(x1 + x2) / 2 + 12} ${baseY + (y1 + y2) / 2 - 6} L${x2} ${baseY + y2}`} stroke="#1a1820" strokeWidth={3} fill="none" opacity={0.85} />
      ))}
      {(() => {
        const hole = `M270 ${baseY} L270 ${baseY - 300} L330 ${baseY - 340} L380 ${baseY - 310} L450 ${baseY - 380} L520 ${baseY - 330} L600 ${baseY - 360} L690 ${baseY - 300} L760 ${baseY - 320} L840 ${baseY - 250} L880 ${baseY - 150} L900 ${baseY} Z`;
        return (
          <g>
            <path d={hole} fill="#9a929c" stroke={O} strokeWidth={4} strokeLinejoin="round" transform={`translate(10 6)`} />
            <path d={hole} fill="url(#bkIn)" stroke={O} strokeWidth={3} strokeLinejoin="round" transform={`translate(${585 * 0.06} ${(baseY - 180) * 0.06}) scale(0.94)`} />
          </g>
        );
      })()}
      {/* back wall of the banking hall + floor line */}
      <path d={`M330 ${baseY - 40} L340 ${baseY - 290} L600 ${baseY - 330} L810 ${baseY - 250} L850 ${baseY - 40} Z`} fill="#241a18" opacity={0.9} />
      <path d={`M300 ${baseY - 40} H880`} stroke="#5a4030" strokeWidth={3} />
      {/* vault set into the back wall: steel frame, open door swung toward camera, warm light from inside */}
      <rect x={680} y={baseY - 222} width={146} height={176} fill="#3a3a42" stroke={O} strokeWidth={4} />
      <rect x={696} y={baseY - 206} width={114} height={146} fill="#ffcf80" opacity={0.85} />
      <circle cx={765} cy={baseY - 140} r={90} fill="url(#bkVault)" opacity={0.7 * work * fl} />
      {[0, 1, 2].map((k) => <rect key={k} x={712 + k * 38} y={baseY - 206} width={30} height={132} fill="#8a6a40" opacity={0.55} />)}
      <g transform={`translate(690 ${baseY - 140})`}>
        <ellipse cx={-34} cy={0} rx={38} ry={86} fill="#5a5a64" stroke={O} strokeWidth={4} />
        <ellipse cx={-34} cy={0} rx={26} ry={64} fill="none" stroke="#8a8a94" strokeWidth={3} />
        <path d="M-34 -30 V30 M-52 0 H-16" stroke="#b0b0ba" strokeWidth={4} strokeLinecap="round" />
      </g>
      {/* hanging ceiling slab + cables */}
      <path d={`M420 ${baseY - 330} L560 ${baseY - 320} L540 ${baseY - 280} L430 ${baseY - 300} Z`} fill="#5a5460" stroke={O} strokeWidth={2.5} />
      {[340, 470, 610].map((x, i) => <path key={i} d={`M${x} ${baseY - 330 + (i % 2) * 20} q${10 + i * 4} 60 ${-6 + i * 3} ${120 + i * 20}`} stroke="#111" strokeWidth={3} fill="none" />)}
      {/* exposed rebar along the broken edge */}
      {[[330, -340, -16, -26], [450, -380, 6, -30], [600, -360, 18, -24], [760, -320, 22, -14], [840, -250, 26, -6], [270, -300, -22, -10]].map(([x, y, dx, dy], k) => (
        <path key={k} d={`M${x} ${baseY + y} l${dx} ${dy} l${dx * 0.3} ${dy * 0.6}`} stroke="#6a3a24" strokeWidth={3} fill="none" strokeLinecap="round" />
      ))}
      {/* interior: toppled counter, work light */}
      <path d={`M320 ${baseY - 70} L600 ${baseY - 110} L620 ${baseY - 70} L340 ${baseY - 30} Z`} fill="#3a2a22" stroke={O} strokeWidth={2} />
      <circle cx={560} cy={baseY - 250} r={220} fill="url(#bkWork)" opacity={0.3 * work * fl} />
      <path d={`M540 ${baseY - 240} l40 0 l-8 24 l-24 0 Z`} fill="#d8c060" stroke={O} strokeWidth={2} />
      <path d={`M560 ${baseY - 216} V${baseY}`} stroke="#222" strokeWidth={4} />
      {/* intact right half: columns + bronze doors */}
      {[980, 1120, 1260, 1400, 1540].map((x) => <g key={x}><rect x={x} y={baseY - 330} width={46} height={330} fill="#8a8490" stroke={O} strokeWidth={2} /><rect x={x - 8} y={baseY - 340} width={62} height={16} fill="#6a6470" stroke={O} strokeWidth={2} />{[8, 20, 32].map((k) => <path key={k} d={`M${x + k} ${baseY - 320} V${baseY - 6}`} stroke="#5a5460" strokeWidth={2} />)}</g>)}
      <rect x={1180} y={baseY - 220} width={200} height={220} fill="#3a2a1a" stroke="#c9a060" strokeWidth={4} />
      <path d={`M1280 ${baseY - 220} V${baseY}`} stroke="#c9a060" strokeWidth={3} />
      {/* rubble spill onto the sidewalk */}
      {Array.from({ length: 26 }).map((_, i) => { const x = 240 + rand(i * 3) * 760, s = 10 + rand(i * 5) * 34; return <path key={i} d={`M${x} ${baseY + 4} l${s * 0.5} ${-s * 0.8} l${s * 0.7} ${s * 0.2} l${s * 0.3} ${s * 0.6} Z`} fill={mix("#6a6470", "#3a3640", rand(i))} stroke={O} strokeWidth={1.5} />; })}
      <rect x={-400} y={baseY} width={2720} height={20} fill="#3a3a44" />
      <rect x={-400} y={baseY + 20} width={2720} height={900} fill="#1a1c26" />
    </svg>
  );
};

/* police sawhorse barricade */
export const Barricade: React.FC<{ x: number; y: number; w?: number; s?: number }> = ({ x, y, w = 360, s = 1 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={w / 2} cy={4} rx={w * 0.55} ry={10} fill="#000" opacity={0.45} />
      {[20, w - 20].map((lx) => <path key={lx} d={`M${lx - 26} 0 L${lx} -110 L${lx + 26} 0`} stroke="#c9ced8" strokeWidth={8} fill="none" />)}
      <rect x={0} y={-104} width={w} height={34} fill="#f0f0f0" stroke={O} strokeWidth={3} />
      {Array.from({ length: Math.floor(w / 40) }).map((_, i) => <path key={i} d={`M${i * 40 + 6} -70 l24 -34 h14 l-24 34 Z`} fill="#c8202c" />)}
      <text x={w / 2} y={-80} textAnchor="middle" fontFamily={DISPLAY} fontSize={20} letterSpacing={6} fill="#111">POLICE LINE</text>
    </g>
  </svg>
);

/* press pack: reporters + cameras seen from behind, flash pops (deterministic) */
export const PressPack: React.FC<{ x: number; y: number; n?: number; s?: number; aim?: number; flashOn?: number }> = ({ x, y, n = 7, s = 1, aim = 0, flashOn = 1 }) => {
  // v14: a real crowd, not one cloned photographer - 6 roles (TV camera, flash photographer, reporter with mic,
  // boom operator, onlooker with umbrella, onlooker filming on a phone), varied height/build/hats/coats,
  // clustered (uneven) spacing, two depth rows (back row smaller, darker, higher), independent timing.
  const f = useCurrentFrame();
  const people = Array.from({ length: n + 3 }).map((_, i) => {
    const back = i >= n;
    const r = (k: number) => rand(i * 17.3 + k * 3.1 + 5);
    const gap = 58 + r(1) * 70 + (r(2) > 0.75 ? 50 : 0);
    return { i, back, r, gap, role: Math.floor(r(3) * 6) };
  });
  let acc = 0;
  const xs = people.map((p) => { if (p.back) return (p.i - (people.length - 3) + 0.5) * ((acc || 400) / 3) + p.r(9) * 40; const v = acc; acc += p.gap; return v; });
  const coats = ["#2a2e3a", "#3a2e2a", "#1e2a32", "#46402f", "#2a2236", "#3a3f46", "#4a2a26", "#24302a"];
  const skins = ["#2a1c14", "#4a3a30", "#6a4a38", "#3a2a20", "#5a4030"];
  const order = people.map((p, k) => k).sort((a, b) => Number(people[b].back) - Number(people[a].back));
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {order.map((k) => {
          const P = people[k], r = P.r, i = P.i;
          const sc = P.back ? 0.86 : 0.92 + r(4) * 0.16;
          const h = 330 * sc + r(5) * 30, wd = 30 + r(6) * 10;
          const bob = Math.sin(f * (0.06 + r(7) * 0.05) + i * 2) * 3;
          const lean = Math.sin(f * 0.03 + i) * 2 + (r(8) - 0.5) * 6;
          const coat = coats[Math.floor(r(10) * coats.length)];
          const skin = skins[Math.floor(r(11) * skins.length)];
          const pop = flashOn > 0 && (f + i * 13) % (37 + (i % 4) * 9) < 2;
          const hat = Math.floor(r(12) * 4); // 0 none, 1 fedora, 2 cap, 3 hood
          const hy = -h * 0.9;
          const dim = P.back ? 0.55 : 1;
          const roleEl = (() => {
            switch (P.role) {
              case 0: return <g transform={`translate(${wd * 0.2} ${hy + 18}) rotate(${-4 + aim * 6})`}><rect x={-6} y={-28} width={92} height={46} rx={6} fill="#15161a" stroke={O} strokeWidth={2} /><rect x={78} y={-20} width={24} height={30} rx={3} fill="#2a2c32" stroke={O} strokeWidth={2} /><circle cx={100} cy={-5} r={10} fill="#3a4a6a" /><rect x={10} y={-38} width={30} height={10} fill="#222" /><circle cx={6} cy={-22} r={4} fill={(f % 30) < 15 ? "#ff3030" : "#401010"} /><path d="M0 20 L-22 70" stroke={coat} strokeWidth={16} strokeLinecap="round" /></g>;
              case 1: return <g transform={`translate(${-6} ${hy - 6 + Math.sin(f * 0.1 + i) * 4})`}><path d="M10 46 L34 -20" stroke={coat} strokeWidth={14} strokeLinecap="round" /><rect x={22} y={-44} width={34} height={26} rx={3} fill="#111" stroke={O} strokeWidth={2} /><rect x={27} y={-58} width={24} height={12} fill="#ddd" />{pop && <circle cx={39} cy={-52} r={70} fill="#fff8e0" opacity={0.75} />}</g>;
              case 2: return <g transform={`translate(${wd * 0.4} ${hy + 44})`}><path d={`M0 0 L${50 + aim * 20} ${-24 - Math.sin(f * 0.07 + i) * 6}`} stroke={coat} strokeWidth={14} strokeLinecap="round" /><rect x={46 + aim * 20} y={-40 - Math.sin(f * 0.07 + i) * 6} width={10} height={26} rx={4} fill="#222" transform={`rotate(-30 ${50 + aim * 20} ${-28})`} /><circle cx={56 + aim * 20} cy={-40 - Math.sin(f * 0.07 + i) * 6} r={8} fill="#555" stroke={O} strokeWidth={1.5} /><rect x={-34} y={10} width={18} height={24} fill="#e8e4d8" stroke={O} strokeWidth={1.5} /></g>;
              case 3: return <g transform={`translate(0 ${hy + 30})`}><path d={`M-6 0 L20 -150`} stroke={coat} strokeWidth={13} strokeLinecap="round" /><path d={`M8 -140 L${150 + Math.sin(f * 0.04 + i) * 10} -190`} stroke="#555" strokeWidth={4} /><rect x={140 + Math.sin(f * 0.04 + i) * 10} y={-206} width={44} height={22} rx={10} fill="#6a6a62" stroke={O} strokeWidth={2} /></g>;
              case 4: return <g transform={`translate(${wd * 0.3} ${hy - 30})`}><path d="M0 50 V-40" stroke="#222" strokeWidth={4} /><path d={`M-70 -30 Q0 ${-96 + Math.sin(f * 0.05 + i) * 3} 70 -30 Q35 -44 0 -40 Q-35 -44 -70 -30 Z`} fill={["#14161c", "#5a1a20", "#1a2a4a"][i % 3]} stroke={O} strokeWidth={2} /></g>;
              default: return <g transform={`translate(${wd * 0.1} ${hy + 30})`}><path d="M6 10 L24 -40" stroke={coat} strokeWidth={13} strokeLinecap="round" /><rect x={16} y={-66} width={18} height={30} rx={3} fill="#111" stroke={O} strokeWidth={1.5} /><rect x={19} y={-62} width={12} height={20} fill="#9ad0ff" opacity={0.8} /><circle cx={25} cy={-52} r={22} fill="#9ad0ff" opacity={0.15} /></g>;
            }
          })();
          return (
            <g key={k} transform={`translate(${xs[k]} ${(P.back ? -26 : 0) + bob}) rotate(${lean} 0 0)`} opacity={1} style={{ filter: P.back ? "brightness(0.55)" : undefined }}>
              <ellipse cx={0} cy={0} rx={wd + 12} ry={8} fill="#000" opacity={0.4 * dim} />
              <path d={`M${-wd} 0 L${-wd + 4} ${-h * 0.5} C${-wd} ${-h * 0.72} ${-wd + 8} ${-h * 0.8} 0 ${-h * 0.82} C${wd - 8} ${-h * 0.8} ${wd} ${-h * 0.72} ${wd - 4} ${-h * 0.5} L${wd} 0 Z`} fill={coat} stroke={O} strokeWidth={2.5} />
              <path d={`M-4 ${-h * 0.8} V-10`} stroke="#000" strokeWidth={2} opacity={0.25} />
              <g transform={`rotate(${(r(13) - 0.5) * 16 + Math.sin(f * 0.02 + i * 3) * 4} 0 ${hy})`}>
                <ellipse cx={0} cy={hy} rx={24 + r(14) * 4} ry={28 + r(14) * 3} fill={hat === 3 ? coat : skin} stroke={O} strokeWidth={2.5} />
                {hat === 1 && <g fill="#1a1a1e" stroke={O} strokeWidth={2}><path d={`M-40 ${hy - 18} Q0 ${hy - 28} 40 ${hy - 18} Q0 ${hy - 10} -40 ${hy - 18} Z`} /><path d={`M-22 ${hy - 20} C-22 ${hy - 46} 22 ${hy - 46} 22 ${hy - 20} Z`} /></g>}
                {hat === 2 && <path d={`M-24 ${hy - 10} C-24 ${hy - 40} 24 ${hy - 40} 24 ${hy - 10} L44 ${hy - 8} L24 ${hy - 4} Z`} fill={coats[(i + 3) % coats.length]} stroke={O} strokeWidth={2} />}
                {hat === 3 && <ellipse cx={4} cy={hy + 4} rx={16} ry={20} fill={skin} />}
              </g>
              {roleEl}
            </g>
          );
        })}
      </g>
    </svg>
  );
};

/* ---------------- Precinct interior bullpen (S22, 25, 58) ---------------- */
export const PrecinctInterior: React.FC<{ lights?: number; dawn?: number; clear?: number }> = ({ lights = 1, dawn = 0, clear = 0 }) => {
  const f = useCurrentFrame();
  const tube = (k: number) => lights * (0.85 + 0.15 * flicker(f, k, 0.2));
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="piWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mix("#2c3a44", "#5a6a7a", dawn * 0.5)} /><stop offset="1" stopColor="#1a2228" /></linearGradient>
        <linearGradient id="piWin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mix("#0c1630", "#c8a0a0", dawn)} /><stop offset="1" stopColor={mix("#1e3050", "#f0c890", dawn)} /></linearGradient>
        <linearGradient id="piFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a3228" /><stop offset="1" stopColor="#14110c" /></linearGradient>
      </defs>
      <rect x={-200} y={-200} width={2320} height={1480} fill="url(#piWall)" />
      <rect x={-200} y={520} width={2320} height={20} fill="#3a2e22" />
      <rect x={-200} y={540} width={2320} height={300} fill="#2a2a24" />
      {/* tall windows with venetian blinds */}
      {[180, 640, 1100, 1560].map((x, i) => (
        <g key={x}>
          <rect x={x} y={120} width={260} height={360} fill="url(#piWin)" stroke="#121820" strokeWidth={10} />
          {Array.from({ length: 6 }).map((_, k) => <rect key={k} x={x + 10 + k * 42} y={300 - rand(i * 7 + k) * 110} width={34} height={180} fill={mix("#0a1222", "#5a4a5a", dawn)} />)}
          {Array.from({ length: 18 }).map((_, k) => <rect key={`b${k}`} x={x} y={124 + k * 20} width={260} height={7} fill="#c8c0a8" opacity={0.55} />)}
        </g>
      ))}
      {/* bulletin board + wanted posters + clock */}
      <rect x={60} y={560} width={260} height={180} fill="#6a4a2a" stroke="#2a1a0a" strokeWidth={6} />
      {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={74 + (i % 3) * 80} y={574 + Math.floor(i / 3) * 80} width={64} height={70} fill={i === 1 ? "#f0e0c0" : "#e8e4d8"} transform={`rotate(${(rand(i) - 0.5) * 8} ${100 + (i % 3) * 80} ${600 + Math.floor(i / 3) * 80})`} />)}
      <g transform="translate(1800 600)"><circle r={44} fill="#efe8d8" stroke="#2a2a2a" strokeWidth={6} /><path d={`M0 0 L0 -30 M0 0 L${Math.sin(f * 0.004 + 2) * 22} ${-Math.cos(f * 0.004 + 2) * 22}`} stroke="#111" strokeWidth={4} strokeLinecap="round" /></g>
      {/* filing cabinets */}
      {[1500, 1600].map((x) => <g key={x}><rect x={x} y={560} width={90} height={280} fill="#5a6470" stroke={O} strokeWidth={3} />{[0, 1, 2, 3].map((k) => <g key={k}><rect x={x + 8} y={570 + k * 68} width={74} height={58} fill="#6a7480" stroke={O} strokeWidth={2} /><rect x={x + 32} y={592 + k * 68} width={26} height={8} fill="#c9ced8" /></g>)}</g>)}
      {/* floor + desks with green bankers lamps and rotary phones */}
      <rect x={-200} y={840} width={2320} height={440} fill="url(#piFloor)" />
      {Array.from({ length: 22 }).map((_, i) => <path key={i} d={`M${-200 + i * 110} 840 L${-700 + i * 160} 1080`} stroke="#000" strokeOpacity={0.25} />)}
      {clear < 1 && [{ x: 420, w: 360 }, { x: 1180, w: 380 }].map((d, i) => (
        <g key={i} opacity={1 - clear}>
          <ellipse cx={d.x + d.w / 2} cy={924} rx={d.w * 0.6} ry={16} fill="#000" opacity={0.5} />
          <rect x={d.x} y={764} width={d.w} height={22} fill="#5a3a22" stroke={O} strokeWidth={3} />
          <rect x={d.x + 10} y={786} width={d.w - 20} height={130} fill="#3a2616" stroke={O} strokeWidth={3} />
          <path d={`M${d.x + d.w * 0.5} 786 V916`} stroke={O} strokeWidth={2} />
          <g transform={`translate(${d.x + 60} 764)`}><rect x={-30} y={-10} width={60} height={10} fill="#2a2a2a" /><path d="M-24 -10 Q0 -46 24 -10 Z" fill="#1e6a3a" stroke={O} strokeWidth={2} /><ellipse cx={0} cy={-8} rx={30} ry={14} fill="#fff1b0" opacity={0.25 * lights} /></g>
          <g transform={`translate(${d.x + d.w - 80} 764)`}><path d="M-28 0 L-22 -22 H22 L28 0 Z" fill="#111" stroke={O} strokeWidth={2} /><path d="M-30 -24 Q0 -40 30 -24" stroke="#111" strokeWidth={10} strokeLinecap="round" /><circle cx={0} cy={-12} r={8} fill="#c9ced8" /></g>
          {Array.from({ length: 4 }).map((_, k) => <rect key={k} x={d.x + 120 + k * 8} y={752 - k * 5} width={90} height={6} fill="#e8e0c8" stroke="#8a8270" strokeWidth={0.8} />)}
        </g>
      ))}
      {/* fluorescent tubes */}
      {[400, 960, 1520].map((x, k) => <g key={x}><rect x={x - 160} y={30} width={320} height={16} rx={6} fill={lights > 0 ? "#f4fbff" : "#3a3e44"} opacity={0.4 + 0.6 * tube(k)} /><path d={`M${x - 160} 46 L${x - 520} 900 L${x + 520} 900 L${x + 160} 46 Z`} fill="#e8f4ff" opacity={0.05 * tube(k)} /></g>)}
    </svg>
  );
};

/* white box with red ribbon (S22) */
export const GiftBox: React.FC<{ x: number; y: number; s?: number; lid?: number }> = ({ x, y, s = 1, lid = 0 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx={0} cy={2} rx={110} ry={14} fill="#000" opacity={0.45} />
      <path d="M-90 0 V-120 H90 V0 Z" fill="#ecebe6" stroke={O} strokeWidth={3} />
      <path d="M90 -120 L120 -138 V-18 L90 0 Z" fill="#c8c6c0" stroke={O} strokeWidth={3} />
      <rect x={-14} y={-120} width={28} height={120} fill="#d01c26" stroke={O} strokeWidth={2} />
      {/* v14: the lid follows a lift-and-set-down arc and comes to REST on the table (never hangs in mid-air) */}
      {lid > 0.85 && <ellipse cx={-235 + 15} cy={3} rx={120} ry={10} fill="#000" opacity={0.4 * (lid - 0.85) / 0.15} />}
      <g transform={`translate(${-235 * lid} ${-120 * (1 - lid) - Math.sin(Math.PI * lid) * 90}) rotate(${-Math.sin(Math.PI * lid) * 22})`}>
        <path d="M-96 0 V-30 H96 V0 Z M96 -30 L126 -48 V-18 L96 0 Z" fill="#f4f3ee" stroke={O} strokeWidth={3} />
        <path d="M-96 -30 L-66 -48 H126 L96 -30 Z" fill="#fbfaf6" stroke={O} strokeWidth={3} />
        <rect x={-14} y={-30} width={28} height={30} fill="#d01c26" stroke={O} strokeWidth={2} />
        <path d="M0 -40 C-50 -100 -90 -40 -10 -36 C-80 -10 -40 30 0 -30 C40 30 80 -10 10 -36 C90 -40 50 -100 0 -40 Z" fill="#e8202c" stroke={O} strokeWidth={2.5} />
        <circle cx={0} cy={-36} r={10} fill="#a0141c" stroke={O} strokeWidth={2} />
      </g>
    </g>
  </svg>
);

/* tin wind-up cop (S23–25): 42 px tall at table scale, key rotation = frame*18deg, painted smile */
export const ToyCop: React.FC<{ x: number; y: number; s?: number; keyRot?: number; step?: number; tip?: number; note?: number; zoomNote?: number }> = ({ x, y, s = 1, keyRot = 0, step = 0, tip = 0, note = 0 }) => {
  const leg = Math.sin(step) * 14;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {/* v14: contact shadow follows the body as it tips over (it lies to the right of the pivot) */}
        <ellipse cx={tip * 62} cy={2} rx={30 + tip * 28} ry={5 + tip * 1.5} fill="#000" opacity={0.5} />
        <g transform={`rotate(${tip * 90} 18 0)`}>
          {/* legs */}
          <g transform={`rotate(${leg} -7 -24)`}><rect x={-12} y={-24} width={9} height={24} rx={2} fill="#1d2b52" stroke={O} strokeWidth={1.5} /><rect x={-14} y={-4} width={13} height={5} rx={2} fill="#111" /></g>
          <g transform={`rotate(${-leg} 6 -24)`}><rect x={2} y={-24} width={9} height={24} rx={2} fill="#24346a" stroke={O} strokeWidth={1.5} /><rect x={0} y={-4} width={13} height={5} rx={2} fill="#111" /></g>
          {/* tin body with rivets + seam */}
          <rect x={-15} y={-62} width={30} height={40} rx={7} fill="#2a3e7a" stroke={O} strokeWidth={1.8} />
          <path d="M0 -62 V-22" stroke="#7a8ac0" strokeWidth={1} opacity={0.7} />
          {[-54, -44, -34].map((ry) => <circle key={ry} cx={-3} cy={ry} r={1.6} fill="#e8c860" />)}
          <path d="M-8 -50 l4 4 l6 -6" fill="#e8c860" />
          <rect x={-15} y={-30} width={30} height={5} fill="#141414" />
          <rect x={-3} y={-31} width={6} height={7} fill="#d8b03a" />
          {/* arms swing */}
          <g transform={`rotate(${-leg * 0.8} -15 -56)`}><rect x={-21} y={-58} width={7} height={22} rx={3} fill="#2a3e7a" stroke={O} strokeWidth={1.4} /><circle cx={-17.5} cy={-34} r={3.6} fill="#f0d8c0" stroke={O} strokeWidth={1} /></g>
          <g transform={`rotate(${leg * 0.8} 15 -56)`}><rect x={14} y={-58} width={7} height={22} rx={3} fill="#2a3e7a" stroke={O} strokeWidth={1.4} /><circle cx={17.5} cy={-34} r={3.6} fill="#f0d8c0" stroke={O} strokeWidth={1} /></g>
          {/* head: painted face, rosy cheeks, fixed smile, peaked cap */}
          <circle cx={0} cy={-74} r={12} fill="#f4dcc4" stroke={O} strokeWidth={1.6} />
          <circle cx={-4} cy={-76} r={1.6} fill="#111" /><circle cx={4} cy={-76} r={1.6} fill="#111" />
          <circle cx={-7} cy={-70} r={2.4} fill="#e88080" opacity={0.7} /><circle cx={7} cy={-70} r={2.4} fill="#e88080" opacity={0.7} />
          <path d="M-5 -69 Q0 -64 5 -69" stroke="#b01020" strokeWidth={1.6} fill="none" />
          <path d="M-14 -82 Q0 -96 14 -82 Z" fill="#1d2b52" stroke={O} strokeWidth={1.6} />
          <rect x={-15} y={-84} width={30} height={5} rx={2} fill="#141414" />
          <circle cx={0} cy={-88} r={2.4} fill="#e8c860" />
          {/* wind-up key on the back */}
          <g transform={`translate(-17 -46) rotate(${keyRot} 0 0)`}>
            <rect x={-8} y={-1.5} width={8} height={3} fill="#c9a640" />
            <path d="M-8 0 C-14 -10 -22 -10 -22 0 C-22 10 -14 10 -8 0 Z" fill="#d9b64a" stroke={O} strokeWidth={1.2} />
          </g>
          {/* taped note (red ink) */}
          {note > 0 && <g opacity={note} transform="translate(-2 -52) rotate(-6)"><rect x={-11} y={-9} width={22} height={18} fill="#f4f0e2" stroke="#8a8270" strokeWidth={0.6} /><rect x={-13} y={-11} width={8} height={4} fill="#e8e0b0" opacity={0.8} /><path d="M-8 -3 h16 M-8 1 h12 M-8 5 h14" stroke="#c01020" strokeWidth={0.9} /></g>}
        </g>
      </g>
    </svg>
  );
};

/* ---------------- Cruiser cabin, front view through the windshield (S17, S28, S51) ----------------
   4 layers: (1) far interior + rear window city  (2) occupants (children)  (3) dashboard, windshield frame, wheel  (4) rain/wipers */
export const CruiserCabin: React.FC<{ children?: React.ReactNode; dark?: number; signal?: number; dawn?: number; wipe?: boolean; speed?: number }> = ({ children, dark = 0, signal = 0, dawn = 0, wipe = true, speed = 1 }) => {
  const f = useCurrentFrame();
  const wa = wipe ? Math.sin(f * 0.11) * 46 : -40;
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="ccSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mix("#070b18", "#4a3a5a", dawn)} /><stop offset="1" stopColor={mix("#1c2a48", "#e0a070", dawn)} /></linearGradient>
          <radialGradient id="ccBokeh"><stop offset="0" stopColor="#ffd890" stopOpacity="0.9" /><stop offset="1" stopColor="#ffd890" stopOpacity="0" /></radialGradient>
        </defs>
        <rect width={1920} height={1080} fill="url(#ccSky)" />
        {/* rear window view: passing city lights (bokeh) scroll by */}
        {Array.from({ length: 34 }).map((_, i) => {
          const x = ((((rand(i) * 2400 - f * (2 + rand(i * 3) * 4) * speed) % 2400) + 2400) % 2400) - 240;
          const lit = rand(i * 5) > dark;
          return lit ? <circle key={i} cx={x} cy={300 + rand(i * 7) * 260} r={14 + rand(i * 9) * 30} fill="url(#ccBokeh)" opacity={0.35} /> : null;
        })}
        {/* seats (far layer) */}
        {[600, 1320].map((x) => <g key={x}><path d={`M${x - 170} 1080 V560 Q${x - 170} 470 ${x - 90} 460 H${x + 90} Q${x + 170} 470 ${x + 170} 560 V1080 Z`} fill="#1c1a1e" stroke={O} strokeWidth={4} /><path d={`M${x - 70} 460 V400 Q${x} 370 ${x + 70} 400 V460 Z`} fill="#242226" stroke={O} strokeWidth={4} /></g>)}
        {/* cage between front and back */}
        <path d="M0 470 H1920" stroke="#2a2a30" strokeWidth={6} />
        {Array.from({ length: 30 }).map((_, i) => <path key={i} d={`M${i * 66} 380 V560`} stroke="#2a2a30" strokeWidth={2} opacity={0.6} />)}
      </svg>
      {/* v14: the car is MOVING - road bumps shake the occupants, passing street lights sweep warm bands through the cabin */}
      <AbsoluteFill style={{ transform: `translate(${Math.sin(f * 0.37) * 1.2 * speed}px, ${(Math.sin(f * 0.9) * 1.4 + Math.max(0, Math.sin(f * 0.13)) ** 12 * 6) * Math.min(1.5, speed + 0.4)}px)` }}>{children}</AbsoluteFill>
      {(() => {
        const P = Math.round(70 / Math.max(0.35, speed)); const ph = (f % P) / P; const bx = -900 + ph * 3700;
        return (
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, mixBlendMode: "screen", pointerEvents: "none" }}>
            <defs><linearGradient id="ccSweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffcf80" stopOpacity="0" /><stop offset="0.5" stopColor="#ffcf80" stopOpacity={0.22 * (1 - dark * 0.5)} /><stop offset="1" stopColor="#ffcf80" stopOpacity="0" /></linearGradient></defs>
            <path d={`M${bx} 0 L${bx + 420} 0 L${bx + 120} 1080 L${bx - 300} 1080 Z`} fill="url(#ccSweep)" />
          </svg>
        );
      })()}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs><linearGradient id="ccDash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a2c34" /><stop offset="1" stopColor="#0a0b0e" /></linearGradient></defs>
        {/* windshield frame (A-pillars, roof, mirror) */}
        <path d="M-20 -20 H1940 V120 Q960 70 -20 120 Z" fill="#0c0d12" />
        <path d="M-20 -20 L240 -20 L80 1100 L-20 1100 Z M1940 -20 L1680 -20 L1840 1100 L1940 1100 Z" fill="#0c0d12" />
        <rect x={880} y={96} width={160} height={44} rx={10} fill="#16181e" stroke="#3a3e48" strokeWidth={3} />
        {/* dashboard + radio + steering wheel */}
        <path d="M-20 900 Q960 840 1940 900 V1100 H-20 Z" fill="url(#ccDash)" />
        <path d="M-20 900 Q960 840 1940 900" stroke="#4a4e5a" strokeWidth={3} fill="none" />
        <g transform="translate(960 950)"><rect x={-90} y={-30} width={180} height={64} rx={6} fill="#141518" stroke="#3a3e48" strokeWidth={3} /><rect x={-70} y={-18} width={100} height={22} fill={signal > 0 ? "#3aff8a" : "#1a3a26"} opacity={0.4 + 0.6 * signal} /><circle cx={56} cy={-6} r={12} fill="#2a2c32" stroke="#5a5e6a" strokeWidth={2} /></g>
        <g transform="translate(600 1020)"><ellipse cx={0} cy={0} rx={190} ry={60} fill="none" stroke="#141518" strokeWidth={30} /><path d="M-60 -10 L0 30 L60 -10" stroke="#141518" strokeWidth={22} fill="none" /></g>
        {/* rain + wipers */}
        {Array.from({ length: 60 }).map((_, i) => { const x = 240 + rand(i) * 1440, y = 140 + rand(i * 3) * 700; const life = ((f + i * 7) % 60) / 60; return <ellipse key={i} cx={x} cy={y + life * 30} rx={3} ry={5} fill="#cfe0ff" opacity={0.35 * (1 - life)} />; })}
        {[520, 1260].map((px, k) => <g key={px} transform={`translate(${px} 900) rotate(${wa + (k ? 0 : -10)})`}><path d="M0 0 L0 -560" stroke="#0a0a0c" strokeWidth={8} /><path d="M-4 -560 L-4 -120" stroke="#141418" strokeWidth={12} /></g>)}
      </svg>
    </AbsoluteFill>
  );
};

/* vintage TV in an apartment (S52) with split-screen debate (narrator-only: pundits gesture, mouths closed) */
export const TVDebate: React.FC<{ cityMorning?: number }> = ({ cityMorning = 1 }) => {
  const f = useCurrentFrame();
  const g1 = Math.sin(f * 0.13) * 10, g2 = Math.sin(f * 0.1 + 2) * 12;
  const head = (x: number, col: string, hair: string, gest: number, tie: string) => (
    <g transform={`translate(${x} 0)`}>
      <path d={`M-70 220 C-70 150 -40 130 0 128 C40 130 70 150 70 220 Z`} fill={col} stroke={O} strokeWidth={2} />
      <path d="M-10 132 L0 180 L10 132 Z" fill={tie} />
      <ellipse cx={0} cy={86} rx={34} ry={42} fill="#d8a882" stroke={O} strokeWidth={2} />
      <path d={`M-34 76 C-34 40 34 40 34 76 C26 60 -26 60 -34 76 Z`} fill={hair} />
      <circle cx={-11} cy={84} r={3} fill="#111" /><circle cx={11} cy={84} r={3} fill="#111" />
      <path d="M-9 108 h18" stroke="#6a3a2a" strokeWidth={2.4} />
      <g transform={`translate(52 170) rotate(${-30 + gest})`}><rect x={-8} y={-50} width={16} height={56} rx={8} fill={col} stroke={O} strokeWidth={2} /><circle cx={0} cy={-54} r={10} fill="#d8a882" stroke={O} strokeWidth={2} /></g>
    </g>
  );
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="tvWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a3a40" /><stop offset="1" stopColor="#1e1618" /></linearGradient>
        <linearGradient id="tvWin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mix("#283a5a", "#f0c8a0", cityMorning)} /><stop offset="1" stopColor={mix("#3a4a6a", "#ffe0b0", cityMorning)} /></linearGradient>
        <radialGradient id="tvGlow"><stop offset="0" stopColor="#bcd8ff" stopOpacity="0.5" /><stop offset="1" stopColor="#bcd8ff" stopOpacity="0" /></radialGradient>
        <clipPath id="tvScr"><rect x={-300} y={-10} width={600} height={430} rx={30} /></clipPath>
      </defs>
      <rect x={-200} y={-200} width={2320} height={1480} fill="url(#tvWall)" />
      <rect x={1340} y={120} width={440} height={520} fill="url(#tvWin)" stroke="#1a1012" strokeWidth={14} />
      {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={1350 + i * 54} y={400 - rand(i + 3) * 160} width={46} height={240 + rand(i + 3) * 160} fill={mix("#141a2a", "#8a6a6a", cityMorning * 0.6)} />)}
      <path d="M1560 120 V640 M1340 380 H1780" stroke="#1a1012" strokeWidth={10} />
      <rect x={-200} y={820} width={2320} height={460} fill="#2a1e18" />
      {/* cabinet TV */}
      <g transform="translate(760 300)">
        <circle cx={0} cy={210} r={560} fill="url(#tvGlow)" opacity={0.6} />
        <rect x={-380} y={-70} width={760} height={600} rx={40} fill="#5a3a22" stroke={O} strokeWidth={5} />
        <rect x={-340} y={-40} width={680} height={500} rx={36} fill="#111" />
        <g clipPath="url(#tvScr)">
          <rect x={-300} y={-10} width={600} height={430} fill="#1e3a5a" />
          <rect x={-300} y={-10} width={300} height={430} fill="#3a2a4a" />
          <g transform="translate(-150 60) scale(1.1)">{head(0, "#2a3a6a", "#2a1a10", g1, "#c02020")}</g>
          <g transform="translate(150 60) scale(1.1)">{head(0, "#5a2a2a", "#c8c0b0", g2, "#2050a0")}</g>
          <rect x={-300} y={340} width={600} height={80} fill="#0a0a10" opacity={0.85} />
          <text x={-280} y={372} fontFamily={DISPLAY} fontSize={26} letterSpacing={3} fill="#f2c040">GCN LIVE</text>
          <text x={-280} y={404} fontFamily={DISPLAY} fontSize={24} letterSpacing={2} fill="#ffffff">BATMAN: HERO OR HAZARD?</text>
          {Array.from({ length: 30 }).map((_, i) => <rect key={i} x={-300} y={-10 + i * 15 + ((f * 2) % 15)} width={600} height={2} fill="#fff" opacity={0.05} />)}
        </g>
        <rect x={-300} y={-10} width={600} height={430} rx={30} fill="none" stroke="#2a2a2a" strokeWidth={8} />
        {[-60, 60].map((kx) => <circle key={kx} cx={kx} cy={500} r={14} fill="#c9a060" stroke={O} strokeWidth={2} />)}
        <path d="M-300 530 L-320 620 M300 530 L320 620" stroke="#3a2412" strokeWidth={14} />
      </g>
      {/* coffee mug + newspaper on a side table */}
      <rect x={1300} y={760} width={420} height={24} fill="#4a2e1a" stroke={O} strokeWidth={3} />
      <path d="M1360 784 V900 M1660 784 V900" stroke="#3a2412" strokeWidth={14} />
      <g transform="translate(1420 760)"><rect x={-26} y={-60} width={52} height={60} rx={6} fill="#e8e0d0" stroke={O} strokeWidth={2} /><path d="M26 -46 q22 4 0 28" stroke="#e8e0d0" strokeWidth={8} fill="none" />{[0, 1, 2].map((k) => <path key={k} d={`M${-10 + k * 10} -70 q${6 + Math.sin(f * 0.1 + k) * 4} -20 0 -40`} stroke="#fff" strokeWidth={3} opacity={0.25} fill="none" />)}</g>
      <g transform="translate(1580 756) rotate(-8)"><rect x={-90} y={-14} width={180} height={14} fill="#e8e4d8" stroke={O} strokeWidth={1.5} /><text x={-80} y={-3} fontFamily={DISPLAY} fontSize={11} fill="#111">GOTHAM GAZETTE · BAT LEAVES BUS?</text></g>
    </svg>
  );
};

/* hospital exterior with power coming back floor by floor (S50) */
/* v14 AMBULANCE (side view): cab with windshield + door, patient box with red band, star of life, light bar,
 * wheel arches, head/tail lights, optional open rear doors with warm interior spill. y = ground line. */
export const Ambulance: React.FC<{ x: number; y: number; s?: number; facing?: 1 | -1; open?: number; lights?: number }> = ({ x, y, s = 1, facing = 1, open = 0, lights = 1 }) => {
  const f = useCurrentFrame();
  const ph = Math.floor(f / 6) % 2;
  const red = "#e0262a", white = "#efede6", shadeW = "#c9c6bd";
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id="ambBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="0.6" stopColor={white} /><stop offset="1" stopColor={shadeW} /></linearGradient>
        <linearGradient id="ambGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3a5070" /><stop offset="1" stopColor="#0c141e" /></linearGradient>
        <radialGradient id="ambGlowR"><stop offset="0" stopColor="#ff3030" stopOpacity="0.8" /><stop offset="1" stopColor="#ff3030" stopOpacity="0" /></radialGradient>
        <radialGradient id="ambGlowB"><stop offset="0" stopColor="#3a70ff" stopOpacity="0.8" /><stop offset="1" stopColor="#3a70ff" stopOpacity="0" /></radialGradient>
      </defs>
      <g transform={`translate(${x} ${y}) scale(${s * facing} ${s})`}>
        <ellipse cx={305} cy={4} rx={330} ry={16} fill="#000" opacity={0.55} />
        {open > 0 && <path d={`M0 -60 L${-260 * open} 0 L0 0 Z`} fill="#ffd9a0" opacity={0.25 * open} />}
        {/* chassis + skirt */}
        <rect x={14} y={-78} width={592} height={34} rx={6} fill="#22252c" stroke={O} strokeWidth={3} />
        {/* patient box */}
        <path d="M0 -70 V-318 Q0 -334 16 -334 H392 Q404 -334 404 -320 V-70 Z" fill="url(#ambBody)" stroke={O} strokeWidth={3.5} />
        {/* cab */}
        <path d="M404 -70 V-250 Q404 -262 416 -262 H478 Q492 -262 502 -250 L582 -158 Q590 -150 602 -146 L612 -142 Q620 -138 620 -126 V-70 Z" fill="url(#ambBody)" stroke={O} strokeWidth={3.5} />
        <path d="M424 -242 H480 Q488 -242 494 -235 L566 -156 H424 Z" fill="url(#ambGlass)" stroke={O} strokeWidth={2.5} />
        <path d="M440 -236 L470 -236 L436 -180 Z" fill="#ffffff" opacity={0.12} />
        <path d="M480 -150 V-74" stroke={O} strokeWidth={2} /><rect x={488} y={-138} width={22} height={6} rx={3} fill="#555" />
        {/* livery: red band, thin dark pinstripe, lettering, star of life */}
        <rect x={2} y={-156} width={616} height={26} fill={red} />
        <rect x={2} y={-128} width={616} height={5} fill="#1a1a22" opacity={0.8} />
        <text x={200} y={-188} textAnchor="middle" fontFamily={DISPLAY} fontSize={42} letterSpacing={3} fill={red} transform={facing < 0 ? "translate(400 0) scale(-1 1)" : undefined}>AMBULANCE</text>
        <g transform="translate(110 -262)">{[0, 60, 120].map((r) => <rect key={r} x={-9} y={-34} width={18} height={68} rx={3} fill="#1f5fc0" transform={`rotate(${r})`} />)}<circle r={9} fill="#fff" /></g>
        <rect x={300} y={-306} width={78} height={56} rx={6} fill="#cfd8e0" stroke={O} strokeWidth={2.5} opacity={0.9} />
        <path d="M10 -96 H396" stroke="#9a978e" strokeWidth={2} />
        {/* rear doors (open = swung out toward the viewer, warm interior behind) */}
        {open > 0 ? (
          <g>
            <rect x={4} y={-316} width={30} height={244} fill="#ffe2b0" />
            <path d={`M0 -318 L${-70 * open} ${-300} L${-70 * open} ${-82} L0 -70 Z`} fill={shadeW} stroke={O} strokeWidth={3} />
            <rect x={-60 * open} y={-280} width={40 * open} height={46} fill="#cfd8e0" opacity={0.8} />
          </g>
        ) : <path d="M8 -318 V-74" stroke={O} strokeWidth={2} />}
        {/* wheel arches + wheels */}
        {[112, 506].map((wx) => (
          <g key={wx}>
            <path d={`M${wx - 62} -70 A62 62 0 0 1 ${wx + 62} -70 Z`} fill="#0c0d10" />
            <circle cx={wx} cy={-44} r={46} fill="#141519" stroke={O} strokeWidth={3} />
            <circle cx={wx} cy={-44} r={22} fill="#9aa2b0" stroke={O} strokeWidth={2} />
            {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={wx + Math.cos((a * Math.PI) / 180) * 12} cy={-44 + Math.sin((a * Math.PI) / 180) * 12} r={2.6} fill="#555" />)}
          </g>
        ))}
        {/* lights: head, tail, roof bar, box corner beacons */}
        <rect x={606} y={-124} width={14} height={18} rx={4} fill="#fff2c0" />
        <rect x={-2} y={-124} width={10} height={26} rx={3} fill="#c01010" />
        <rect x={420} y={-276} width={66} height={14} rx={5} fill="#222" />
        <rect x={424} y={-274} width={28} height={10} rx={4} fill={lights && ph ? "#ff3a3a" : "#5a1010"} />
        <rect x={454} y={-274} width={28} height={10} rx={4} fill={lights && !ph ? "#4a7aff" : "#101a50"} />
        <rect x={6} y={-346} width={24} height={12} rx={4} fill={lights && !ph ? "#ff3a3a" : "#5a1010"} />
        <rect x={372} y={-346} width={24} height={12} rx={4} fill={lights && ph ? "#ff3a3a" : "#5a1010"} />
        {lights > 0 && <g style={{ mixBlendMode: "screen" }}>
          <circle cx={ph ? 438 : 468} cy={-270} r={70} fill={ph ? "url(#ambGlowR)" : "url(#ambGlowB)"} opacity={0.7 * lights} />
          <circle cx={ph ? 384 : 18} cy={-340} r={50} fill="url(#ambGlowR)" opacity={0.6 * lights} />
        </g>}
      </g>
    </svg>
  );
};

/* v14 HOSPITAL: stepped towers with varied windows, GOTHAM GENERAL crown sign, ER wing with canopy, lit glass doors,
 * EMERGENCY fascia sign, ambulance bay with a parked ambulance, sidewalk + street lamps + people for scale. */
export const Hospital: React.FC<{ power: number }> = ({ power }) => {
  const f = useCurrentFrame();
  const win = (x0: number, y0: number, cols: number, rows: number, cw: number, rh: number, w: number, h: number, seed: number, rowOffset: number) =>
    Array.from({ length: rows }).map((_, r) => Array.from({ length: cols }).map((_, c) => {
      const floorOn = power * 9 - (rows - 1 - r + rowOffset) * 0.6 > 0.4;
      const k = rand(seed + r * 17 + c * 3.1);
      const lit = floorOn && k > 0.18;
      const col = !lit ? "#161b26" : k > 0.86 ? "#bfe0ff" : k > 0.7 ? "#fff6dc" : "#f2e2b4";
      return <g key={`${seed}-${r}-${c}`}>
        <rect x={x0 + c * cw} y={y0 + r * rh} width={w} height={h} fill={col} />
        {lit && k > 0.45 && k < 0.6 && <rect x={x0 + c * cw} y={y0 + r * rh} width={w} height={h * 0.45} fill="#8a8070" opacity={0.7} />}
        {lit && k > 0.3 && k < 0.36 && <circle cx={x0 + c * cw + w * 0.5} cy={y0 + r * rh + h * 0.62} r={h * 0.18} fill="#2a2a30" opacity={0.6} />}
      </g>;
    }));
  const sign = power > 0.45;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="hsA" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#d7d3ca" /><stop offset="0.65" stopColor="#b9b5ae" /><stop offset="1" stopColor="#7c7a80" /></linearGradient>
        <linearGradient id="hsB" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8e8c92" /><stop offset="1" stopColor="#5e5e68" /></linearGradient>
        <radialGradient id="hsLamp"><stop offset="0" stopColor="#ffe6b0" stopOpacity="0.55" /><stop offset="1" stopColor="#ffe6b0" stopOpacity="0" /></radialGradient>
      </defs>
      {/* left wing (darker, set back) */}
      <rect x={240} y={330} width={400} height={510} fill="url(#hsB)" stroke={O} strokeWidth={3} />
      <rect x={228} y={318} width={424} height={16} fill="#6e6c72" stroke={O} strokeWidth={2.5} />
      {win(270, 370, 6, 7, 62, 64, 40, 34, 11, 0)}
      {/* main tower with ribbon windows + stepped crown */}
      <rect x={600} y={130} width={640} height={710} fill="url(#hsA)" stroke={O} strokeWidth={3.5} />
      <rect x={680} y={70} width={480} height={64} fill="#a9a59e" stroke={O} strokeWidth={3} />
      <rect x={760} y={36} width={320} height={36} fill="#9a968f" stroke={O} strokeWidth={3} />
      <text x={920} y={118} textAnchor="middle" fontFamily={DISPLAY} fontSize={44} letterSpacing={10} fill={sign ? "#f4f0e0" : "#5a5850"}>GOTHAM GENERAL</text>
      <rect x={1060} y={-6} width={4} height={42} fill="#333" /><circle cx={1062} cy={-8} r={5} fill={(Math.floor(f / 18) % 2) && power > 0.2 ? "#ff3a2a" : "#401010"} />
      {Array.from({ length: 9 }).map((_, r) => <rect key={r} x={626} y={172 + r * 66} width={588} height={38} fill="#20242e" />)}
      {win(632, 176, 12, 9, 48, 66, 40, 30, 23, 0)}
      {Array.from({ length: 5 }).map((_, k) => <rect key={k} x={600 + k * 160} y={130} width={6} height={640} fill="#000" opacity={0.18} />)}
      {/* ER wing (right, low) */}
      <rect x={1200} y={430} width={520} height={410} fill="url(#hsA)" stroke={O} strokeWidth={3} />
      <rect x={1188} y={418} width={544} height={16} fill="#a29e97" stroke={O} strokeWidth={2.5} />
      {win(1232, 462, 8, 3, 60, 62, 42, 34, 37, 6)}
      {/* ER entrance: glass doors with warm interior + figures, canopy slab, red fascia sign, posts */}
      <rect x={1330} y={690} width={300} height={150} fill={power > 0.15 ? "#ffe9bf" : "#1a1c22"} stroke={O} strokeWidth={3} />
      {power > 0.15 && <g fill="#3a3430" opacity={0.75}><rect x={1400} y={742} width={16} height={58} rx={6} /><circle cx={1408} cy={734} r={9} /><rect x={1530} y={748} width={18} height={52} rx={6} /><circle cx={1539} cy={740} r={9} /></g>}
      <path d="M1480 690 V840" stroke={O} strokeWidth={3} /><path d="M1405 690 V840 M1555 690 V840" stroke="#6a7080" strokeWidth={2} />
      <path d="M1290 650 H1700 L1690 690 H1300 Z" fill="#d8d4cc" stroke={O} strokeWidth={3} />
      <rect x={1330} y={652} width={340} height={30} fill={sign ? "#c41a1e" : "#3a1012"} />
      <text x={1500} y={676} textAnchor="middle" fontFamily={DISPLAY} fontSize={26} letterSpacing={7} fill={sign ? "#ffffff" : "#6a4040"}>EMERGENCY</text>
      <rect x={1306} y={690} width={10} height={150} fill="#4a4e58" /><rect x={1684} y={690} width={10} height={150} fill="#4a4e58" />
      {sign && <rect x={1290} y={690} width={410} height={150} fill="#ffd9a0" opacity={0.12} />}
      {/* sidewalk, curb, ambulance bay */}
      <rect x={-400} y={840} width={2720} height={40} fill="#3a3c46" />
      <rect x={-400} y={878} width={2720} height={8} fill="#5a5c68" />
      <rect x={-400} y={886} width={2720} height={700} fill="#16181f" />
      <text x={1520} y={930} textAnchor="middle" fontFamily={DISPLAY} fontSize={22} letterSpacing={8} fill="#e8d060" opacity={0.55} transform="translate(1520 930) scale(1 0.45) translate(-1520 -930)">AMBULANCE ONLY</text>
      {/* street lamps */}
      {[180, 1060].map((lx) => <g key={lx}><rect x={lx} y={560} width={8} height={320} fill="#1c1e24" /><path d={`M${lx + 4} 562 q30 -20 60 0`} stroke="#1c1e24" strokeWidth={6} fill="none" /><rect x={lx + 50} y={558} width={26} height={10} rx={3} fill="#fff0c8" /><circle cx={lx + 63} cy={600} r={150} fill="url(#hsLamp)" /></g>)}
      {/* pedestrians for scale */}
      <g fill="#0e1016"><rect x={420} y={800} width={14} height={44} rx={5} /><circle cx={427} cy={792} r={8} /><rect x={452} y={806} width={12} height={38} rx={5} /><circle cx={458} cy={799} r={7} /></g>
    </svg>
  );
};

/* rooftop parapet foreground (S19, S37, S39, S44) */
export const Parapet: React.FC<{ y?: number; color?: string; tilt?: number }> = ({ y = 900, color = "#1a1620", tilt = 0 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
    <path d={`M-400 ${y + tilt} L2320 ${y - tilt} V1700 H-400 Z`} fill={color} />
    <path d={`M-400 ${y + tilt} L2320 ${y - tilt}`} stroke="#5a5a6e" strokeWidth={4} opacity={0.6} />
    {Array.from({ length: 24 }).map((_, i) => <path key={i} d={`M${-400 + i * 120} ${y + tilt - (i * 120 * tilt * 2) / 2720 + 6} v40`} stroke="#000" strokeOpacity={0.35} strokeWidth={3} />)}
  </svg>
);

/* end title card */
export const EndQuestion: React.FC<{ t: number; t2: number }> = ({ t, t2 }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
    <div style={{ fontFamily: DISPLAY, color: "#f2dcb0", fontSize: 64, letterSpacing: 8, opacity: t, transform: `translateY(${(1 - t) * 20}px)`, textShadow: "0 4px 24px #000" }}>WOULD YOU STAY?</div>
    <div style={{ fontFamily: DISPLAY, color: "#9fb6dc", fontSize: 36, letterSpacing: 10, marginTop: 24, opacity: t2, textShadow: "0 4px 20px #000" }}>WHICH WORLD SHOULD WE ENTER NEXT?</div>
  </AbsoluteFill>
);

/* small helper: a fluorescent-free phone close prop rendered at screen coords */
export const Phone: React.FC<{ x: number; y: number; s?: number; ring?: number; speaker?: number }> = ({ x, y, s = 1, ring = 0, speaker = 0 }) => {
  const f = useCurrentFrame();
  const shake = ring > 0 ? Math.sin(f * 2.4) * 4 * ring : 0;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <g transform={`translate(${x + shake} ${y}) scale(${s}) rotate(${shake})`}>
        <rect x={-40} y={-90} width={80} height={180} rx={14} fill="#1a1b20" stroke="#5a5e6a" strokeWidth={3} />
        <rect x={-30} y={-70} width={60} height={60} rx={4} fill={ring > 0 || speaker > 0 ? "#8ad0a0" : "#1e2a24"} />
        {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={-26 + (i % 3) * 20} y={0 + Math.floor(i / 3) * 20} width={14} height={12} rx={3} fill="#3a3e48" />)}
        <rect x={20} y={-120} width={8} height={34} rx={3} fill="#1a1b20" />
        {ring > 0 && [1, 2, 3].map((k) => <path key={k} d={`M${50 + k * 14} -60 q${12} 30 0 60`} stroke="#c8e8ff" strokeWidth={3} fill="none" opacity={((f + k * 4) % 12 < 6 ? 0.7 : 0.2) * ring} />)}
        {speaker > 0 && <g opacity={speaker}>{[0, 1, 2, 3, 4, 5, 6].map((k) => <rect key={k} x={-24 + k * 8} y={-40 - Math.abs(Math.sin(f * 0.5 + k)) * 18} width={4} height={8 + Math.abs(Math.sin(f * 0.5 + k)) * 36} fill="#2a5a3a" />)}</g>}
      </g>
    </svg>
  );
};

export const shadeOf = shade;
