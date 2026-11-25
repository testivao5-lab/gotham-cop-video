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
      {/* the blast hole: jagged, exposing the dark banking hall with hanging cables */}
      <path d={`M270 ${baseY} L270 ${baseY - 300} L330 ${baseY - 340} L380 ${baseY - 310} L450 ${baseY - 380} L520 ${baseY - 330} L600 ${baseY - 360} L690 ${baseY - 300} L760 ${baseY - 320} L840 ${baseY - 250} L880 ${baseY - 150} L900 ${baseY} Z`} fill="url(#bkIn)" stroke={O} strokeWidth={4} strokeLinejoin="round" />
      {[340, 470, 610, 740].map((x, i) => <path key={i} d={`M${x} ${baseY - 330 + (i % 2) * 20} q${10 + i * 4} 60 ${-6 + i * 3} ${120 + i * 20}`} stroke="#111" strokeWidth={3} fill="none" />)}
      {/* interior: toppled counter, safe door ajar, work light */}
      <path d={`M300 ${baseY - 90} L620 ${baseY - 130} L640 ${baseY - 90} L320 ${baseY - 40} Z`} fill="#3a2a22" stroke={O} strokeWidth={2} />
      <circle cx={760} cy={baseY - 140} r={70} fill="#4a4a52" stroke={O} strokeWidth={4} />
      <circle cx={760} cy={baseY - 140} r={52} fill="none" stroke="#7a7a84" strokeWidth={4} />
      {[0, 60, 120, 180, 240, 300].map((a) => <path key={a} d={`M760 ${baseY - 140} l${Math.cos((a * Math.PI) / 180) * 40} ${Math.sin((a * Math.PI) / 180) * 40}`} stroke="#9a9aa4" strokeWidth={4} />)}
      <circle cx={560} cy={baseY - 250} r={220} fill="url(#bkWork)" opacity={0.35 * work * fl} />
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
  const f = useCurrentFrame();
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {Array.from({ length: n }).map((_, i) => {
          const px = i * 92 + (rand(i * 7) - 0.5) * 20, h = 330 + rand(i) * 40, bob = Math.sin(f * 0.08 + i) * 3;
          const coat = ["#2a2e3a", "#3a2e2a", "#1e2a32", "#33302a", "#2a2236"][i % 5];
          const pop = flashOn > 0 && (f + i * 13) % 47 < 2;
          return (
            <g key={i} transform={`translate(${px} ${bob})`}>
              <ellipse cx={0} cy={0} rx={46} ry={8} fill="#000" opacity={0.4} />
              <path d={`M-34 0 L-30 ${-h * 0.5} C-34 ${-h * 0.72} -26 ${-h * 0.8} 0 ${-h * 0.82} C26 ${-h * 0.8} 34 ${-h * 0.72} 30 ${-h * 0.5} L34 0 Z`} fill={coat} stroke={O} strokeWidth={2.5} />
              <ellipse cx={0} cy={-h * 0.9} rx={26} ry={30} fill={i % 3 ? "#2a1c14" : "#4a3a30"} stroke={O} strokeWidth={2.5} />
              {i % 2 === 0 ? (
                <g transform={`translate(${20 + aim * 10} ${-h * 0.86}) rotate(${-8 + aim * 6})`}>
                  <rect x={-10} y={-26} width={74} height={40} rx={5} fill="#15161a" stroke={O} strokeWidth={2} />
                  <rect x={60} y={-20} width={22} height={28} rx={3} fill="#2a2c32" stroke={O} strokeWidth={2} />
                  <circle cx={80} cy={-6} r={9} fill="#3a4a6a" />
                  <path d={`M-8 14 L-26 70`} stroke={coat} strokeWidth={16} strokeLinecap="round" />
                </g>
              ) : (
                <g transform={`translate(${-6} ${-h * 0.98})`}>
                  <path d={`M10 40 L34 -20`} stroke={coat} strokeWidth={14} strokeLinecap="round" />
                  <rect x={24} y={-44} width={30} height={24} rx={3} fill="#111" stroke={O} strokeWidth={2} />
                  <rect x={28} y={-56} width={22} height={10} fill="#ddd" />
                  {pop && <circle cx={39} cy={-50} r={60} fill="#fff8e0" opacity={0.75} />}
                </g>
              )}
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
      <g transform={`translate(0 ${-120 - lid * 120}) rotate(${-lid * 25})`}>
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
        <ellipse cx={0} cy={2} rx={30 - tip * 6} ry={5} fill="#000" opacity={0.5} />
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
      <AbsoluteFill>{children}</AbsoluteFill>
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
export const Hospital: React.FC<{ power: number }> = ({ power }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
    <defs><linearGradient id="hsF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c8c4bc" /><stop offset="1" stopColor="#6a6a70" /></linearGradient></defs>
    <rect x={360} y={180} width={1200} height={660} fill="url(#hsF)" stroke={O} strokeWidth={3} />
    <rect x={340} y={160} width={1240} height={30} fill="#9a9690" stroke={O} strokeWidth={3} />
    <g transform="translate(960 230)"><rect x={-140} y={-30} width={280} height={60} fill="#1a1a1e" /><text x={0} y={14} textAnchor="middle" fontFamily={DISPLAY} fontSize={38} letterSpacing={8} fill={power > 0.5 ? "#ff4a4a" : "#4a1a1a"}>EMERGENCY</text></g>
    <g transform="translate(1440 240)"><rect x={-34} y={-34} width={68} height={68} fill="#fff" stroke={O} strokeWidth={2} /><path d="M-10 -26 h20 v16 h16 v20 h-16 v16 h-20 v-16 h-16 v-20 h16 Z" fill="#d02020" /></g>
    {Array.from({ length: 5 }).map((_, r) => Array.from({ length: 12 }).map((_, c) => {
      const floorOn = power * 6 - (4 - r) > 0.5; // bottom floor first
      const lit = floorOn && rand(r * 13 + c) > 0.2;
      return <rect key={`${r}${c}`} x={400 + c * 96} y={300 + r * 100} width={60} height={60} fill={lit ? "#f4f0d8" : "#1a1e28"} stroke="#3a3a40" strokeWidth={2} />;
    }))}
    <rect x={820} y={760} width={280} height={80} fill={power > 0.2 ? "#ffe8b8" : "#14161c"} stroke={O} strokeWidth={3} />
    <rect x={-400} y={840} width={2720} height={700} fill="#1a1c24" />
    <rect x={-400} y={840} width={2720} height={10} fill="#3a3c48" />
  </svg>
);

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
