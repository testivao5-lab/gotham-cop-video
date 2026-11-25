import React from "react";
import { DISPLAY } from "../lib/fonts";
import { useCurrentFrame } from "remotion";
import { rand, shade, tint, mix, flicker, noise } from "../lib/anim";

/* ================= Reyes repair shop — exterior ================= */
/** brass dome desk lamp (S6, 7, 46, 54-56): round weighted base, curved gooseneck arm, brass dome shade, push switch on the base */
export const BrassDomeLamp: React.FC<{ on: number; s?: number; y?: number }> = ({ on, s = 1, y = 0 }) => (
  <g transform={`translate(0 ${y}) scale(${s})`}>
    <ellipse cx={0} cy={-6} rx={30} ry={8} fill="#6a4a14" stroke="#1a0f08" strokeWidth={3} />
    <path d="M-30 -6 Q-30 -18 -18 -20 H18 Q30 -18 30 -6 Z" fill="#b8862a" stroke="#1a0f08" strokeWidth={3} />
    <path d="M-22 -16 Q0 -22 20 -17" stroke="#f2d27a" strokeWidth={2.5} fill="none" opacity={0.8} />
    <rect x={14} y={-24} width={9} height={6} rx={2} fill="#2a1a08" stroke="#1a0f08" strokeWidth={1.5} />
    <path d="M-6 -20 C-10 -60 -2 -92 22 -104" stroke="#1a0f08" strokeWidth={9} fill="none" strokeLinecap="round" />
    <path d="M-6 -20 C-10 -60 -2 -92 22 -104" stroke="#a8781e" strokeWidth={5} fill="none" strokeLinecap="round" />
    <g transform="translate(26 -104) rotate(28)">
      {on > 0.1 && <ellipse cx={0} cy={6} rx={28} ry={7} fill="#fff4c8" opacity={0.9 * on} />}
      <path d="M-34 6 C-34 -24 -18 -40 0 -40 C18 -40 34 -24 34 6 Z" fill="#b8862a" stroke="#1a0f08" strokeWidth={3} />
      <path d="M-24 -6 C-22 -24 -10 -32 2 -33" stroke="#f6dc8a" strokeWidth={4} fill="none" opacity={0.85} />
      <path d="M14 -30 C26 -22 32 -10 32 4" stroke="#6a4a10" strokeWidth={5} fill="none" opacity={0.7} />
      <rect x={-36} y={2} width={72} height={6} rx={3} fill="#8a6418" stroke="#1a0f08" strokeWidth={2} />
      <circle cx={0} cy={-42} r={4} fill="#8a6418" stroke="#1a0f08" strokeWidth={1.5} />
    </g>
  </g>
);

export const ShopFront: React.FC<{ x?: number; baseY: number; lamp: number; doorLight?: number; upstairs?: number; sign?: number; scale?: number }> = ({ x = 960, baseY, lamp, doorLight = 0.6, upstairs = 1, sign = 1, scale = 1 }) => {
  const f = useCurrentFrame();
  const W = 820, H = 760;
  const brick = "#4a2c28";
  const fl = flicker(f, 3, 0.15);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id="sfB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={tint(brick, 0.08)} /><stop offset="1" stopColor={shade(brick, 0.55)} /></linearGradient>
        <pattern id="sfBrick" width="30" height="13" patternUnits="userSpaceOnUse"><path d="M0 12.5 H30 M15 0 V6.5 M0 6.5 H30 M7 6.5 V13 M22 6.5 V13" stroke="#000" strokeOpacity="0.22" /></pattern>
        <radialGradient id="sfLamp"><stop offset="0" stopColor="#fff1c0" /><stop offset="0.25" stopColor="#ffc867" stopOpacity="0.9" /><stop offset="1" stopColor="#ff9a3a" stopOpacity="0" /></radialGradient>
        <linearGradient id="sfWin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a2418" /><stop offset="1" stopColor="#0d0b08" /></linearGradient>
        <linearGradient id="sfWarm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd28a" /><stop offset="1" stopColor="#b8642a" /></linearGradient>
      </defs>
      <g transform={`translate(${x - (W * scale) / 2} ${baseY - H * scale}) scale(${scale})`}>
        <rect width={W} height={H} fill="url(#sfB)" />
        <rect width={W} height={H} fill="url(#sfBrick)" />
        {/* cornice deco */}
        <rect x={-14} y={-20} width={W + 28} height={30} fill="#2a1c1c" />
        <rect x={-14} y={-20} width={W + 28} height={4} fill="#8a6a5a" opacity={0.5} />
        {Array.from({ length: 14 }).map((_, i) => <rect key={i} x={i * 60 + 6} y={10} width={20} height={14} fill="#2a1c1c" />)}
        {/* upper floors */}
        {[0, 1].map((row) => [0, 1, 2].map((c) => {
          const wx = 90 + c * 240, wy = 70 + row * 200, ww = 160, wh = 130;
          const home = row === 1 && c === 1;
          const on = home ? upstairs : rand(row * 5 + c) > 0.6 ? 0.5 : 0;
          return (
            <g key={`${row}${c}`}>
              <rect x={wx - 10} y={wy - 14} width={ww + 20} height={14} fill="#2a1a18" />
              <rect x={wx} y={wy} width={ww} height={wh} fill={on > 0 ? "url(#sfWarm)" : "url(#sfWin)"} opacity={on > 0 ? 0.4 + on * 0.6 : 1} />
              {on > 0 && <path d={`M${wx} ${wy} h${ww * 0.35} v${wh} h${-ww * 0.35} Z M${wx + ww * 0.7} ${wy} h${ww * 0.3} v${wh} h${-ww * 0.3} Z`} fill="#5a2a1a" opacity={0.6} />}
              <rect x={wx + ww / 2 - 3} y={wy} width={6} height={wh} fill="#140d0c" />
              <rect x={wx} y={wy + wh / 2 - 3} width={ww} height={6} fill="#140d0c" />
              <rect x={wx - 8} y={wy + wh} width={ww + 16} height={10} fill="#5a4038" />
            </g>
          );
        }))}
        {/* sign */}
        <rect x={60} y={430} width={W - 120} height={70} fill="#16120f" stroke="#6a5240" strokeWidth={4} />
        <text x={W / 2} y={478} textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontWeight={700} fontSize={40} letterSpacing={6} fill={sign > 0 ? "#f5c66a" : "#5a4a30"} opacity={0.6 + 0.4 * sign * fl}>REYES RADIO &amp; REPAIR</text>
        {sign > 0 && <rect x={60} y={430} width={W - 120} height={70} fill="#ffb84a" opacity={0.06 * fl} />}
        {/* shop ground floor */}
        <rect x={20} y={515} width={W - 40} height={H - 515} fill="#120d0b" />
        {/* display window with lamp */}
        <rect x={300} y={540} width={480} height={190} fill="url(#sfWin)" />
        <rect x={300} y={540} width={480} height={190} fill="#ffb060" opacity={lamp * 0.22} />
        {/* shelf silhouettes inside */}
        {Array.from({ length: 7 }).map((_, i) => <rect key={i} x={320 + i * 64} y={640 - (i % 3) * 12} width={40} height={30 + (i % 3) * 12} fill="#060504" opacity={0.85} />)}
        <rect x={310} y={672} width={460} height={8} fill="#060504" />
        {/* the lamp */}
        <g transform="translate(640 600)">
          <circle r={130} fill="url(#sfLamp)" opacity={lamp * 0.9 * fl} />
          <BrassDomeLamp on={lamp} s={0.75} y={64} />
        </g>
        {/* window mullions + glass glare */}
        <rect x={536} y={540} width={8} height={190} fill="#1a120e" />
        <rect x={296} y={536} width={488} height={198} fill="none" stroke="#2c201a" strokeWidth={8} />
        <path d="M320 548 l60 0 l-90 170 l-30 0 Z" fill="#fff" opacity={0.05} />
        {/* door */}
        <rect x={70} y={540} width={180} height={H - 540} fill="#1d1410" stroke="#2c201a" strokeWidth={8} />
        <rect x={92} y={560} width={136} height={110} fill="#ffcf8a" opacity={0.2 + doorLight * 0.5} />
        <rect x={92} y={560} width={136} height={110} fill="#2a1a10" opacity={0.25} />
        {[0, 1, 2].map((r) => <rect key={`ds${r}`} x={100} y={596 + r * 26} width={120} height={5} fill="#120c08" opacity={0.75} />)}
        {[0, 1, 2, 3].map((c) => <rect key={`dr${c}`} x={106 + c * 30} y={578 + (c % 2) * 26} width={18} height={14} rx={2} fill="#120c08" opacity={0.7} />)}
        {Array.from({ length: 9 }).map((_, k) => <rect key={`bl${k}`} x={92} y={562 + k * 12} width={136} height={3} fill="#000" opacity={0.22} />)}
        <path d="M130 560 L142 584 L178 584 L190 560" stroke="#1a110a" strokeWidth={2} fill="none" />
        <rect x={136} y={584} width={48} height={22} rx={2} fill="#efe4c8" stroke="#1a110a" strokeWidth={2} />
        <text x={160} y={600} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={11} fill="#8a1a1a">CLOSED</text>
        <rect x={92} y={560} width={136} height={110} fill="none" stroke="#2c201a" strokeWidth={6} />
        <circle cx={228} cy={700} r={6} fill="#c9a640" />
        <rect x={60} y={H - 12} width={W - 120} height={12} fill="#3a3032" />
      </g>
    </svg>
  );
};

/* ================= shop interior ================= */
export const ShopInterior: React.FC<{ lamp: number; warm?: number }> = ({ lamp, warm = 1 }) => {
  const f = useCurrentFrame();
  const fl = flicker(f, 5, 0.12);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="siWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#24180f" /><stop offset="1" stopColor="#3a2617" /></linearGradient>
        <radialGradient id="siLamp" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffe3a0" stopOpacity="0.95" /><stop offset="0.35" stopColor="#ffb456" stopOpacity="0.45" /><stop offset="1" stopColor="#ff8a2a" stopOpacity="0" /></radialGradient>
        <linearGradient id="siFloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a1c12" /><stop offset="1" stopColor="#0c0806" /></linearGradient>
        <linearGradient id="siNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0c1830" /><stop offset="1" stopColor="#1f3358" /></linearGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#siWall)" />
      {/* wallpaper stripes */}
      {Array.from({ length: 40 }).map((_, i) => <rect key={i} x={i * 48} y={0} width={2} height={820} fill="#000" opacity={0.12} />)}
      {/* back window with night city */}
      <rect x={1160} y={160} width={560} height={420} fill="url(#siNight)" />
      {Array.from({ length: 16 }).map((_, i) => (
        <rect key={i} x={1170 + i * 34} y={420 - rand(i) * 200} width={30} height={200 + rand(i) * 200} fill="#0a1222" />
      ))}
      {Array.from({ length: 50 }).map((_, i) => <rect key={i} x={1175 + rand(i * 3) * 540} y={260 + rand(i * 7) * 300} width={5} height={7} fill="#f2cf7a" opacity={0.7} />)}
      <rect x={1160} y={160} width={560} height={420} fill="none" stroke="#1a0f08" strokeWidth={18} />
      <rect x={1434} y={160} width={12} height={420} fill="#1a0f08" />
      <rect x={1160} y={364} width={560} height={12} fill="#1a0f08" />
      <rect x={1140} y={580} width={600} height={22} fill="#3a2414" />
      {/* lamp on sill */}
      <g transform="translate(1300 580)">
        <circle cy={-40} r={360} fill="url(#siLamp)" opacity={lamp * fl} />
        <BrassDomeLamp on={lamp} s={1} y={0} />
      </g>
      {/* deco wall sconces throwing light cones up the wall (BTAS interior language) */}
      {[340, 980].map((sx, i) => (
        <g key={i}>
          <path d={`M${sx - 22} 150 L${sx - 110} -20 L${sx + 110} -20 L${sx + 22} 150 Z`} fill="#ffdca0" opacity={0.1 * (0.7 + 0.3 * lamp)} />
          <ellipse cx={sx} cy={92} rx={64} ry={84} fill="#ffe6b8" opacity={0.12} />
          <path d={`M${sx - 18} 150 L${sx - 26} 118 H${sx + 26} L${sx + 18} 150 Z M${sx - 8} 150 V170 H${sx + 8} V150`} fill="#b89a60" stroke="#1a0f08" strokeWidth={2} />
          <ellipse cx={sx} cy={116} rx={26} ry={6} fill="#fff1cc" opacity={0.85} />
        </g>
      ))}
      {/* shelves: every object different (size, type, time shown) */}
      {[0, 1, 2].map((row) => (
        <g key={row}>
          <rect x={60} y={260 + row * 160} width={900} height={14} fill="#1a0f08" />
          <rect x={60} y={274 + row * 160} width={900} height={6} fill="#000" opacity={0.35} />
          {Array.from({ length: 6 }).map((_, i) => {
            const seed = row * 11 + i * 7;
            const bx = 80 + i * 145 + rand(seed) * 26, by = 260 + row * 160;
            const kind = [0, 1, 5, 2, 3, 6, 4, 2, 5, 0, 6, 3, 1, 4, 0, 6, 5, 2][row * 6 + i]; // hand-placed: no neighbour repeats
            const hrs = rand(seed + 1) * Math.PI * 2, mins = rand(seed + 2) * Math.PI * 2 + f * 0.0015;
            const wood = mix("#6a4428", "#2e1c10", rand(seed + 4));
            if (kind === 0) { const r = 28 + rand(seed + 5) * 16; return (
              <g key={i}><circle cx={bx + 50} cy={by - r - 6} r={r} fill="#e9dcbc" stroke={wood} strokeWidth={6} /><circle cx={bx + 50} cy={by - r - 6} r={2.5} fill="#1a110a" />
                <path d={`M${bx + 50} ${by - r - 6} l${Math.sin(hrs) * r * 0.5} ${-Math.cos(hrs) * r * 0.5} M${bx + 50} ${by - r - 6} l${Math.sin(mins) * r * 0.8} ${-Math.cos(mins) * r * 0.8}`} stroke="#1a110a" strokeWidth={2.4} strokeLinecap="round" /></g>); }
            if (kind === 1) return (
              <g key={i}><path d={`M${bx} ${by} V${by - 70} Q${bx + 55} ${by - 120} ${bx + 110} ${by - 70} V${by} Z`} fill={wood} stroke="#0d0805" strokeWidth={3} />
                <path d={`M${bx + 18} ${by - 8} V${by - 62} Q${bx + 55} ${by - 96} ${bx + 92} ${by - 62} V${by - 8} Z`} fill="#3a2614" />
                {Array.from({ length: 6 }).map((_, k) => <rect key={k} x={bx + 26 + k * 11} y={by - 70} width={4} height={60} fill="#1a110a" />)}
                <circle cx={bx + 30} cy={by - 16} r={5} fill="#c9a060" /><circle cx={bx + 80} cy={by - 16} r={5} fill="#c9a060" /></g>);
            if (kind === 2) return (
              <g key={i}><rect x={bx} y={by - 64} width={120} height={64} rx={10} fill={mix("#7a6a50", "#3a3a40", rand(seed + 6))} stroke="#0d0805" strokeWidth={3} />
                <rect x={bx + 10} y={by - 54} width={66} height={22} rx={3} fill="#e8c880" opacity={0.75} /><path d={`M${bx + 16 + rand(seed) * 50} ${by - 54} v22`} stroke="#a02010" strokeWidth={2} />
                <circle cx={bx + 96} cy={by - 42} r={11} fill="#1a110a" stroke="#c9a060" strokeWidth={2} /><circle cx={bx + 28} cy={by - 14} r={6} fill="#1a110a" /><circle cx={bx + 56} cy={by - 14} r={6} fill="#1a110a" /></g>);
            if (kind === 3) return (
              <g key={i}><rect x={bx + 20} y={by - 96} width={58} height={96} rx={6} fill={wood} stroke="#0d0805" strokeWidth={3} />
                <circle cx={bx + 49} cy={by - 66} r={20} fill="#efe2c4" /><path d={`M${bx + 49} ${by - 66} l${Math.sin(hrs) * 10} ${-Math.cos(hrs) * 10} M${bx + 49} ${by - 66} l${Math.sin(mins) * 16} ${-Math.cos(mins) * 16}`} stroke="#1a110a" strokeWidth={2} />
                <path d={`M${bx + 30} ${by - 104} Q${bx + 49} ${by - 124} ${bx + 68} ${by - 104} Z`} fill={wood} stroke="#0d0805" strokeWidth={2} /></g>);
            if (kind === 5) return (
              <g key={i}>{/* gramophone: wooden box + brass horn */}
                <rect x={bx + 10} y={by - 40} width={70} height={40} rx={3} fill={wood} stroke="#0d0805" strokeWidth={3} />
                <path d={`M${bx + 46} ${by - 40} L${bx + 54} ${by - 70} C${bx + 70} ${by - 92} ${bx + 104} ${by - 118} ${bx + 120} ${by - 112} C${bx + 126} ${by - 92} ${bx + 102} ${by - 70} ${bx + 60} ${by - 66} Z`} fill="#c9a040" stroke="#3a2808" strokeWidth={2.5} />
                <path d={`M${bx + 70} ${by - 84} Q${bx + 96} ${by - 100} ${bx + 114} ${by - 106}`} stroke="#fff0b0" strokeWidth={2} opacity={0.5} fill="none" />
                <ellipse cx={bx + 40} cy={by - 42} rx={26} ry={4} fill="#1a110a" /></g>);
            if (kind === 6) return (
              <g key={i}>{/* typewriter with paper + vacuum tubes box */}
                <path d={`M${bx} ${by} L${bx + 12} ${by - 34} H${bx + 98} L${bx + 110} ${by} Z`} fill="#2a2e2a" stroke="#0d0805" strokeWidth={3} />
                <rect x={bx + 26} y={by - 64} width={58} height={34} fill="#efe6cc" stroke="#6a5a40" strokeWidth={1.5} />
                {[0, 1, 2].map((k) => <path key={k} d={`M${bx + 32} ${by - 56 + k * 8} H${bx + 76 - k * 10}`} stroke="#6a5a40" strokeWidth={1.2} />)}
                <rect x={bx + 4} y={by - 40} width={102} height={8} rx={4} fill="#1a1a1a" />
                {Array.from({ length: 8 }).map((_, k) => <circle key={k} cx={bx + 20 + k * 10} cy={by - 16} r={3} fill="#d8d0b8" />)}</g>);
            return (
              <g key={i}><rect x={bx} y={by - 70} width={96} height={70} fill="#25262b" stroke="#0d0805" strokeWidth={3} />
                <rect x={bx + 8} y={by - 62} width={56} height={46} rx={10} fill="#3c4c58" opacity={0.85} /><rect x={bx + 12} y={by - 58} width={20} height={10} rx={4} fill="#9ab" opacity={0.25} />
                <circle cx={bx + 80} cy={by - 50} r={6} fill="#777" /><circle cx={bx + 80} cy={by - 28} r={6} fill="#777" /></g>);
          })}
        </g>
      ))}
      {/* tall regulator clock with a swinging pendulum */}
      <g transform="translate(1010 300)">
        <rect x={-50} y={0} width={100} height={420} rx={8} fill="#4a2c16" stroke="#0d0805" strokeWidth={4} />
        <circle cx={0} cy={60} r={38} fill="#efe2c4" stroke="#2a180c" strokeWidth={4} />
        <path d={`M0 60 l${Math.sin(1.1) * 18} ${-Math.cos(1.1) * 18} M0 60 l${Math.sin(4.0 + f * 0.002) * 28} ${-Math.cos(4.0 + f * 0.002) * 28}`} stroke="#1a110a" strokeWidth={3} strokeLinecap="round" />
        <rect x={-34} y={120} width={68} height={270} fill="#1c120a" />
        <g transform={`translate(0 126) rotate(${Math.sin((f / 24) * Math.PI) * 9})`}>
          <rect x={-2} y={0} width={4} height={200} fill="#b8963a" />
          <circle cx={0} cy={210} r={20} fill="#d9b24a" stroke="#6a4a10" strokeWidth={3} />
          <circle cx={-6} cy={204} r={6} fill="#fff4c0" opacity={0.6} />
        </g>
      </g>
      {/* workbench */}
      <rect x={0} y={800} width={1920} height={280} fill="url(#siFloor)" />
      <rect x={100} y={760} width={980} height={30} fill="#4a2e18" />
      <rect x={100} y={790} width={980} height={12} fill="#1a0f08" />
      <rect x={130} y={800} width={24} height={240} fill="#2a1a10" />
      <rect x={1030} y={800} width={24} height={240} fill="#2a1a10" />
      <g transform="translate(300 760)"><rect x={0} y={-70} width={120} height={70} rx={8} fill="#5a3a22" stroke="#0d0805" strokeWidth={3} /><circle cx={40} cy={-36} r={20} fill="#1a110a" /></g>
      <g transform="translate(700 760)"><path d="M0 0 L40 -90 L50 -86 L14 0 Z" fill="#3a3a40" /><circle cx={44} cy={-92} r={22} fill="#e8d8a0" opacity={0.25 + 0.2 * noise(f * 0.1, 2)} /></g>
      {Array.from({ length: 6 }).map((_, i) => <rect key={i} x={480 + i * 30} y={748} width={18} height={12} fill={["#a0a0a8", "#c9a040", "#6a6a70"][i % 3]} />)}
      {/* lamp warmth wash */}
      <rect width="1920" height="1080" fill="#ff9a40" opacity={0.08 * lamp * warm} style={{ mixBlendMode: "soft-light" }} />
    </svg>
  );
};

/* ================= academy graduation exterior ================= */
export const Academy: React.FC<{ lightsDim?: number }> = ({ lightsDim = 0 }) => {
  const f = useCurrentFrame();
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="acF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5a6478" /><stop offset="1" stopColor="#1c2232" /></linearGradient>
        <linearGradient id="acCol" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2a3244" /><stop offset="0.6" stopColor="#7a849a" /><stop offset="1" stopColor="#3a4256" /></linearGradient>
      </defs>
      {/* facade */}
      <rect x={160} y={160} width={1600} height={640} fill="url(#acF)" />
      <path d="M140 160 L960 40 L1780 160 Z" fill="#2a3244" stroke="#8a94aa" strokeWidth={3} />
      <text x={960} y={236} textAnchor="middle" fontFamily={DISPLAY} fontSize={64} letterSpacing={18} fill="#d9c79a">GOTHAM POLICE ACADEMY</text>
      {Array.from({ length: 8 }).map((_, i) => (
        <g key={i}>
          <rect x={240 + i * 200} y={270} width={70} height={530} fill="url(#acCol)" />
          <rect x={228 + i * 200} y={262} width={94} height={16} fill="#8a94aa" />
        </g>
      ))}
      {/* tall lit doorway */}
      <rect x={880} y={480} width={160} height={320} fill="#ffd894" opacity={0.85} />
      <path d="M880 800 L930 690 L990 690 L1040 800 Z" fill="#c89a58" opacity={0.5} />
      <rect x={918} y={560} width={84} height={130} fill="#e8b870" opacity={0.6} />
      <circle cx={960} cy={580} r={16} fill="#fff1c8" opacity={0.9} />
      {[0, 1].map((d) => (
        <g key={`ad${d}`}>
          <rect x={884 + d * 78} y={484} width={74} height={312} fill="#3a2a1c" opacity={0.0} stroke="#2a1e14" strokeWidth={7} />
          {[0, 1, 2, 3].map((r) => <rect key={r} x={892 + d * 78} y={494 + r * 68} width={58} height={60} fill="none" stroke="#2a1e14" strokeWidth={5} />)}
          <rect x={890 + d * 78} y={650} width={62} height={8} rx={3} fill="#c9a640" stroke="#2a1e14" strokeWidth={2} />
        </g>
      ))}
      <rect x={880} y={480} width={160} height={320} fill="none" stroke="#1a1e28" strokeWidth={10} />
      <rect x={866} y={462} width={188} height={20} fill="#3a4258" stroke="#1a1e28" strokeWidth={4} />
      {/* banners: academy crest + GCPD star */}
      {[560, 1360].map((bx, k) => (
        <g key={bx}>
          <rect x={bx - 42} y={300} width={84} height={250} fill={k ? "#5a1420" : "#1d2b62"} />
          <path d={`M${bx - 42} 550 L${bx} 518 L${bx + 42} 550 Z`} fill="#0b0f1a" />
          {k === 0 ? <g><path d={`M${bx} 350 l26 10 v26 q0 24 -26 36 q-26 -12 -26 -36 v-26 Z`} fill="#d9b24a" /><path d={`M${bx} 366 v40`} stroke="#1d2b62" strokeWidth={4} /></g>
            : <path d={`M${bx} 344 l9 22 h23 l-18 14 l7 23 l-21 -13 l-21 13 l7 -23 l-18 -14 h23 Z`} fill="#d9b24a" />}
          <rect x={bx - 42} y={300} width={84} height={250} fill="#000" opacity={0.12 + 0.05 * Math.sin(f * 0.07 + k)} />
        </g>
      ))}
      {/* festoon string lights: catenary swags between column caps */}
      {Array.from({ length: 7 }).map((_, k) => {
        const x0 = 275 + k * 200, x1 = x0 + 200, y0 = 290, sag = 70 + (k % 2) * 14;
        const pts = Array.from({ length: 9 }).map((_, i) => { const t = i / 8; return [x0 + t * 200, y0 + sag * (1 - Math.pow(2 * t - 1, 2)) + Math.sin(f * 0.05 + k) * 2]; });
        return (
          <g key={k}>
            <path d={`M${x0} ${y0} Q${(x0 + x1) / 2} ${y0 + sag * 2} ${x1} ${y0}`} stroke="#0a0a0a" strokeWidth={2} fill="none" />
            {pts.slice(1, 8).map(([xx, yy], i) => {
              const on = 1 - lightsDim * (rand(i + k * 30 + Math.floor(f / 3)) > 0.3 ? 1 : 0.2);
              return <g key={i}><circle cx={xx} cy={yy + 7} r={4.5} fill="#ffe2a0" opacity={0.3 + 0.7 * on} /><circle cx={xx} cy={yy + 7} r={16} fill="#ffcf70" opacity={0.2 * on} /></g>;
            })}
          </g>
        );
      })}
      {/* graduates & families on the steps (soft silhouettes, a cap toss) */}
      {Array.from({ length: 9 }).map((_, i) => {
        const gx = 200 + i * 190 + rand(i * 5) * 60, gy = 830 + (i % 2) * 18, h = 120 + rand(i * 3) * 30;
        const capUp = i === 3 || i === 6 ? Math.max(0, Math.sin(((f + i * 37) % 96) / 96 * Math.PI)) * 160 : 0;
        return (
          <g key={i} opacity={0.75}>
            <path d={`M${gx - 22} ${gy} Q${gx - 26} ${gy - h * 0.6} ${gx - 14} ${gy - h * 0.8} H${gx + 14} Q${gx + 26} ${gy - h * 0.6} ${gx + 22} ${gy} Z`} fill="#141a2a" />
            <circle cx={gx} cy={gy - h * 0.88} r={13} fill="#141a2a" />
            <path d={`M${gx - 16} ${gy - h * 0.95 - capUp} l16 -6 l16 6 l-16 6 Z`} fill="#0a0e18" transform={capUp ? `rotate(${f * 9} ${gx} ${gy - h * 0.95 - capUp})` : undefined} />
          </g>
        );
      })}
      {/* plaza / sidewalk in front of the facade (no gap to the skyline) */}
      <rect x={-400} y={836} width={2720} height={96} fill="#2a2430" />
      {Array.from({ length: 30 }).map((_, i) => <path key={`pz${i}`} d={`M${-200 + i * 90} 836 L${-260 + i * 90} 932`} stroke="#000" strokeOpacity={0.22} />)}
      <rect x={-400} y={836} width={2720} height={4} fill="#4a4250" />
      {/* steps */}
      {Array.from({ length: 5 }).map((_, i) => <rect key={i} x={120 - i * 30} y={800 + i * 28} width={1680 + i * 60} height={28} fill={i % 2 ? "#3a4256" : "#474f66"} />)}
      <rect x={0} y={940} width={1920} height={140} fill="#141822" />
    </svg>
  );
};

/* ================= deco police precinct ================= */
export const Precinct: React.FC<{ mesh?: number }> = ({ mesh = 1 }) => {
  const f = useCurrentFrame();
  const fl = flicker(f, 11, 0.1);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="prF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6a4a46" /><stop offset="0.7" stopColor="#3a2830" /><stop offset="1" stopColor="#1a1218" /></linearGradient>
        <linearGradient id="prSide" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a2030" /><stop offset="1" stopColor="#0d0a10" /></linearGradient>
        <linearGradient id="prDoor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe6b0" /><stop offset="1" stopColor="#d08a40" /></linearGradient>
        <pattern id="prMesh" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M0 0 L10 10 M10 0 L0 10" stroke="#0a0a0e" strokeWidth="1.4" /></pattern>
        <radialGradient id="prGlow"><stop offset="0" stopColor="#ffe0a0" stopOpacity="0.8" /><stop offset="1" stopColor="#ffe0a0" stopOpacity="0" /></radialGradient>
      </defs>
      {/* side block */}
      <rect x={1260} y={120} width={700} height={720} fill="url(#prSide)" />
      {Array.from({ length: 6 }).map((_, r) => Array.from({ length: 8 }).map((_, c) => (
        <rect key={`${r}${c}`} x={1290 + c * 82} y={170 + r * 100} width={44} height={56} fill={rand(r * 9 + c) > 0.6 ? "#e8b860" : "#0d0b10"} opacity={0.8} />
      )))}
      {/* main deco facade */}
      <path d="M380 840 V200 H420 V160 H520 V120 H1140 V160 H1240 V200 H1280 V840 Z" fill="url(#prF)" stroke="#1a1016" strokeWidth={3} />
      {[[380, 200, 1280], [420, 160, 1240], [520, 120, 1140]].map(([x0, yy, x1]) => <path key={yy} d={`M${x0} ${yy} H${x1}`} stroke="#c9a890" strokeWidth={3} opacity={0.5} />)}
      <path d="M560 120 V96 H640 V72 H1020 V96 H1100 V120 Z" fill="#2a1e26" stroke="#8a6a60" strokeWidth={2} />
      <path d="M826 72 V20 M818 30 H834" stroke="#8a6a60" strokeWidth={4} />
      {/* vertical deco fins */}
      {[640, 760, 880, 1000].map((x, i) => (
        <g key={i}>
          <rect x={x} y={150} width={34} height={480} fill="#8a6a60" opacity={0.7} />
          <path d={`M${x + 17} 140 L${x + 34} 190 L${x} 190 Z`} fill="#c9a890" opacity={0.7} />
          <rect x={x + 6} y={200} width={22} height={380} fill="#ffcf8a" opacity={0.22 * fl} />
        </g>
      ))}
      {[440, 1160].map((x) => <path key={x} d={`M${x} 220 L${x + 30} 180 L${x + 60} 220 V620 H${x} Z`} fill="#8a6a60" opacity={0.5} />)}
      {/* windows with reinforcement mesh */}
      {[0, 1, 2].map((r) => [420, 1150].map((x) => (
        <g key={`${r}${x}`}>
          <rect x={x + 6} y={250 + r * 120} width={78} height={80} fill="#e8b060" opacity={0.75} />
          {mesh > 0 && <rect x={x + 6} y={250 + r * 120} width={78} height={80} fill="url(#prMesh)" opacity={mesh} />}
          {mesh > 0 && [0, 1, 2, 3].map((k) => <rect key={k} x={x + 12 + k * 20} y={250 + r * 120} width={4} height={80} fill="#0a0a0e" opacity={mesh} />)}
          <rect x={x} y={330 + r * 120} width={90} height={8} fill="#2a1e22" />
        </g>
      )))}
      {/* POLICE sign + door */}
      {/* POLICE marquee high on the facade, above any head height (BTAS station ref) */}
      <rect x={594} y={196} width={480} height={86} fill="#140e12" stroke="#c9a890" strokeWidth={4} />
      <rect x={604} y={206} width={460} height={66} fill="none" stroke="#8a6a60" strokeWidth={2} />
      <circle cx={834} cy={239} r={170} fill="url(#prGlow)" opacity={0.25 * fl} />
      <text x={838} y={262} textAnchor="middle" fontFamily={DISPLAY} fontSize={70} letterSpacing={22} fill="#ffe6b8">POLICE</text>
      <path d="M594 196 L834 160 L1074 196" fill="#2a1e26" stroke="#c9a890" strokeWidth={3} />
      {/* deco transom over the door */}
      <rect x={660} y={640} width={340} height={56} fill="#1a1216" stroke="#8a6a60" strokeWidth={3} />
      {Array.from({ length: 9 }).map((_, k) => <path key={k} d={`M830 694 L${672 + k * 40} 646`} stroke="#c9a890" strokeWidth={2} opacity={0.5} />)}
      <circle cx={830} cy={694} r={14} fill="#d8b23a" opacity={0.8} />
      <rect x={700} y={704} width={260} height={136} fill="url(#prDoor)" opacity={0.9} />
      <rect x={826} y={704} width={8} height={136} fill="#3a2a20" />
      {/* lamps */}
      {[640, 1020].map((x) => <g key={x}><rect x={x - 4} y={720} width={8} height={120} fill="#111" /><circle cx={x} cy={712} r={13} fill="#fff0c8" /><circle cx={x} cy={712} r={70} fill="url(#prGlow)" opacity={fl} /></g>)}
      {/* steps */}
      {Array.from({ length: 4 }).map((_, i) => <rect key={i} x={640 - i * 40} y={840 + i * 22} width={380 + i * 80} height={22} fill={i % 2 ? "#4a3e44" : "#5a4c52"} />)}
      <rect x={-400} y={928} width={2720} height={700} fill="#15121a" />
      <rect x={-400} y={928} width={2720} height={6} fill="#3a3440" />
      {/* deco stone planters flanking the steps (contact shadow on the plaza) */}
      {[470, 1196].map((x) => (
        <g key={`pl${x}`}>
          <ellipse cx={x} cy={922} rx={70} ry={8} fill="#000" opacity={0.5} />
          <path d={`M${x - 56} 862 H${x + 56} L${x + 46} 920 H${x - 46} Z`} fill="#5a4c52" stroke="#1a1418" strokeWidth={3} />
          <rect x={x - 62} y={854} width={124} height={12} rx={3} fill="#7a6a70" stroke="#1a1418" strokeWidth={2} />
          <path d={`M${x - 40} 868 V914 M${x} 868 V916 M${x + 40} 868 V914`} stroke="#3a2e34" strokeWidth={3} />
          <path d={`M${x - 50} 856 C${x - 60} 820 ${x - 30} 800 ${x - 10} 818 C${x} 790 ${x + 30} 796 ${x + 26} 822 C${x + 56} 812 ${x + 62} 840 ${x + 50} 856 Z`} fill="#1e3a2a" stroke="#0c1a12" strokeWidth={2.5} />
          <path d={`M${x - 30} 830 q10 -10 22 -4 M${x + 6} 816 q10 -6 18 2`} stroke="#3e6a4c" strokeWidth={3} fill="none" />
        </g>
      ))}
    </svg>
  );
};

/* ================= Joker (seen from behind, unseen face) ================= */
export const JokerBack: React.FC<{ x: number; y: number; scale?: number; laugh?: number }> = ({ x, y, scale = 1, laugh = 0 }) => {
  const f = useCurrentFrame();
  const shake = laugh * Math.sin(f * 1.6) * 4;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id="jkC" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#7a3a9a" /><stop offset="0.5" stopColor="#3e1a52" /><stop offset="1" stopColor="#14081c" /></linearGradient>
        <linearGradient id="jkH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#0e3a1a" /><stop offset="1" stopColor="#4ab84a" /></linearGradient>
      </defs>
      <g transform={`translate(${x} ${y + shake}) scale(${scale})`}>
        {/* coat shoulders from behind */}
        <path d="M-260 400 C-250 200 -200 120 -110 100 L-40 90 L40 90 L110 100 C200 120 250 200 260 400 Z" fill="url(#jkC)" stroke="#06040a" strokeWidth={3} />
                {/* neck, ears, nape hair, fedora */}
        <rect x={-34} y={40} width={68} height={60} fill="#cfc8c4" stroke="#06040a" strokeWidth={3} />
        <ellipse cx={0} cy={22} rx={66} ry={70} fill="url(#jkH)" stroke="#06040a" strokeWidth={3} />
        <ellipse cx={-66} cy={20} rx={11} ry={20} fill="#d8d0cc" stroke="#06040a" strokeWidth={2.5} />
        <ellipse cx={66} cy={20} rx={11} ry={20} fill="#d8d0cc" stroke="#06040a" strokeWidth={2.5} />
        {[-40, -20, 0, 20, 40].map((hx) => <path key={hx} d={`M${hx} 0 Q${hx + 6} 40 ${hx * 0.8} 80`} stroke="#0a2a12" strokeWidth={3} fill="none" opacity={0.6} />)}
        <path d="M-58 50 L-42 98 L-28 74 L-14 108 L0 78 L14 108 L28 74 L42 98 L58 50 Z" fill="url(#jkH)" stroke="#06040a" strokeWidth={3} strokeLinejoin="round" />
        <ellipse cx={0} cy={-18} rx={150} ry={30} fill="#3a1450" stroke="#06040a" strokeWidth={3} />
        <ellipse cx={0} cy={-22} rx={150} ry={26} fill="url(#jkC)" />
        <path d="M-84 -20 C-88 -100 -46 -132 0 -130 C46 -132 88 -100 84 -20 Z" fill="url(#jkC)" stroke="#06040a" strokeWidth={3} />
        <path d="M-84 -44 C-40 -36 40 -36 84 -44 L84 -20 C40 -12 -40 -12 -84 -20 Z" fill="#1c0828" />
        <path d="M-20 -126 C-6 -110 6 -110 20 -126" stroke="#1c0828" strokeWidth={4} fill="none" />
        <path d="M60 -110 C76 -90 82 -60 82 -46" stroke="#b07ad0" strokeWidth={3} opacity={0.5} fill="none" />
        {/* upturned collar */}
        <path d="M-110 100 L-60 40 L-30 96 Z M110 100 L60 40 L30 96 Z" fill="#4a1e62" stroke="#06040a" strokeWidth={3} />
        {/* gloved hand holding a playing card */}
        <g transform={`translate(230 ${190 - laugh * 10}) rotate(${-14 + Math.sin(f * 0.05) * 3})`}>
          <rect x={-30} y={-90} width={64} height={92} rx={6} fill="#f2ede0" stroke="#06040a" strokeWidth={2} />
          <text x={2} y={-50} textAnchor="middle" fontFamily="Georgia" fontWeight={700} fontSize={22} fill="#b0161c">JOKER</text>
          <path d="M-16 -30 Q2 -14 20 -30" stroke="#b0161c" strokeWidth={3} fill="none" />
          <path d="M-46 -10 C-40 -40 0 -40 10 -10 L14 30 L-40 30 Z" fill="#6a2a8a" stroke="#06040a" strokeWidth={2} />
        </g>
      </g>
    </svg>
  );
};

/* ================= Joker, BTAS model: 3/4 rear profile at a high window =================
 * Refs: BTAS Joker — purple wide-brim fedora, slicked green hair, chalk-lavender skin with hard
 * two-tone shadow, long pointed chin, sharp nose, huge red-lipped grin with yellowed teeth,
 * purple suit, orange shirt, teal bow tie. Local origin = centre of the head. Faces +x. */
export const JokerProfile: React.FC<{ x: number; y: number; scale?: number; turn?: number; card?: number; laugh?: number }> = ({ x, y, scale = 1, turn = 0, card = 1, laugh = 0 }) => {
  const f = useCurrentFrame();
  const bounce = laugh * Math.abs(Math.sin(f * 0.55)) * 6;
  const o = "#07050a";
  const skin = "#ebe6f4", skinSh = "#a59ac4", skinD = "#6e6290", suit = "#8a4bb0", suitSh = "#4a2068", suitL = "#b47ad6", hat = "#7a3a9e", hatSh = "#3c1652", hair = "#3a9a44", hairSh = "#1d5a26";
  const glove = "#3a1a50", gloveL = "#7a4a9a", gloveS = "#1e0c2c";
  const g = 14 * turn; // grin pulls wider as he turns toward camera
  const open = 6 + laugh * 10;
  const blink = (() => { const t = (f + 31) % 92; return t < 3 ? 1 - Math.abs(t - 1.5) / 1.5 : 0; })();
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id="jkSuit" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={suitSh} /><stop offset="0.55" stopColor={suit} /><stop offset="1" stopColor={suitL} /></linearGradient>
        <linearGradient id="jkRim" x1="0" y1="0" x2="1" y2="0"><stop offset="0.7" stopColor="#5aff8a" stopOpacity="0" /><stop offset="1" stopColor="#7affa0" stopOpacity="0.55" /></linearGradient>
      </defs>
      <g transform={`translate(${x} ${y + bounce}) scale(${scale})`}>
        {/* jacket: shoulders, peaked lapels, orange shirt, teal bow tie, boutonniere */}
        <path d="M-230 520 C-226 330 -190 214 -110 168 L-40 132 L70 142 C150 166 206 240 226 520 Z" fill="url(#jkSuit)" stroke={o} strokeWidth={3} />
        <path d="M-110 168 C-84 236 -60 300 -40 520 L-86 520 C-104 340 -124 260 -150 210 Z" fill={suitSh} opacity={0.7} />
        <path d="M-14 140 L60 140 L96 330 L40 400 L10 360 Z" fill="#f08c1e" stroke={o} strokeWidth={2.5} />
        <path d="M40 160 L52 330 M20 200 L28 360" stroke="#b05a0a" strokeWidth={2} opacity={0.6} />
        {/* far lapel */}
        <path d="M-20 142 L-6 220 L-30 236 L10 400 L-44 400 L-70 196 Z" fill={suitSh} stroke={o} strokeWidth={2.5} strokeLinejoin="round" />
        {/* near lapel: peaked, with the notch */}
        <path d="M66 140 C96 150 120 166 136 186 L176 170 L160 224 L130 238 L70 420 L40 400 L76 250 L58 214 Z" fill={suit} stroke={o} strokeWidth={2.5} strokeLinejoin="round" />
        <path d="M136 186 L176 170 L160 224" stroke={suitL} strokeWidth={2} fill="none" opacity={0.8} />
        <path d="M90 250 L70 400" stroke={suitL} strokeWidth={3} opacity={0.5} />
        <g transform="translate(124 262)"><circle r={13} fill="#f4f0f8" stroke={o} strokeWidth={2} />{[0, 72, 144, 216, 288].map((r) => <ellipse key={r} cx={0} cy={-7} rx={4} ry={7} fill="#ffffff" stroke="#c8c0d8" strokeWidth={1} transform={`rotate(${r})`} />)}<circle r={4} fill="#f4c020" /></g>
        <path d="M20 168 l34 -16 l-6 30 Z M20 168 l-30 -12 l4 28 Z" fill="#26b3a0" stroke={o} strokeWidth={2} strokeLinejoin="round" />
        <circle cx={20} cy={168} r={6} fill="#1a8a7a" stroke={o} strokeWidth={2} />
        {/* neck (in shadow under the jaw) + collar */}
        <path d="M-40 70 C-40 100 -36 126 -30 146 L40 146 C36 126 40 108 50 96 Z" fill={skinSh} stroke={o} strokeWidth={3} />
        <path d="M-30 146 L-8 120 L12 150 Z M40 146 L22 118 L12 150 Z" fill="#f08c1e" stroke={o} strokeWidth={2} strokeLinejoin="round" />
        <g transform={`rotate(${-3 * turn - laugh * 2 * Math.sin(f * 0.55)} 0 60)`}>
          {/* back hair (slicked, green) behind the ear */}
          {/* skull + nape behind the face so the hair sits ON a head (not pasted on) */}
          <path d="M-108 -58 C-128 -8 -120 52 -84 96 C-70 110 -48 108 -38 92 L-30 60 L-40 -60 Z" fill={skinSh} stroke={o} strokeWidth={3} strokeLinejoin="round" />
          <path d="M-110 -60 C-130 -10 -122 46 -88 90 C-74 100 -56 98 -46 86 C-52 52 -52 18 -42 -8 C-30 -30 -4 -44 40 -52 L60 -64 Z" fill={hair} stroke={o} strokeWidth={3} strokeLinejoin="round" />
          {[-98, -84, -70, -58].map((hx, i) => <path key={`sl${i}`} d={`M${hx + 6} -54 C${hx - 8} -10 ${hx - 6} 40 ${hx + 10} ${84 - i * 6}`} stroke={i % 2 ? hairSh : "#6ad07a"} strokeWidth={i % 2 ? 3 : 2} opacity={i % 2 ? 0.9 : 0.55} fill="none" strokeLinecap="round" />)}
          {/* face in profile: forehead, brow ridge, long sharp nose, jutting pointed chin, jaw angle well behind the cheek */}
          <path d="M-40 -60 C0 -66 40 -68 70 -64 C88 -52 96 -38 98 -24 C102 -20 102 -14 98 -8 C110 4 124 16 136 24 C126 30 114 34 104 34 C108 40 110 46 108 52 C112 70 112 86 106 96 C112 112 120 130 124 150 C112 160 96 164 80 160 C50 150 18 128 -8 108 C-20 98 -24 80 -24 60 C-28 30 -34 0 -40 -20 Z" fill={skin} stroke={o} strokeWidth={3.2} strokeLinejoin="round" />
          {/* hard cel shadow: back plane of the face (behind the cheekbone) */}
          <path d="M-40 -20 C-34 0 -28 30 -24 60 C-24 80 -20 98 -8 108 C18 128 50 150 80 160 C56 138 40 116 32 92 C26 70 30 44 46 26 C30 10 4 -6 -40 -20 Z" fill={skinSh} />
          {/* cheekbone ridge + hollow under it */}
          <path d="M46 26 C60 18 78 18 92 24" stroke={skinD} strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d="M44 30 C36 46 34 64 40 80" stroke={skinD} strokeWidth={2} fill="none" opacity={0.6} />
          {/* jaw line accent + chin crease */}
          <path d="M-6 106 C24 128 54 148 80 158" stroke={skinD} strokeWidth={2} fill="none" opacity={0.7} />
          <path d="M104 118 q-10 6 -14 18" stroke={skinD} strokeWidth={2} fill="none" />
          {/* nose shading + nostril */}
          <path d="M98 -6 C108 6 120 16 132 24" stroke="#ffffff" strokeWidth={3} opacity={0.5} fill="none" />
          <path d="M104 30 q-6 -2 -8 -8" stroke={o} strokeWidth={2} fill="none" />
          {/* the grin: wide red lips, two rows of teeth, corner far back on the cheek */}
          <path d={`M${110} ${50} C92 ${58} 64 ${58} ${30 - g} ${44 - g * 0.4} C${36 - g} ${66 + open * 0.3} 64 ${88 + open} 104 ${92 + open * 0.4} C112 ${80} 112 ${62} 110 50 Z`} fill="#c8202c" stroke={o} strokeWidth={2.6} strokeLinejoin="round" />
          <path d={`M106 ${55} C90 ${62} 66 ${62} ${38 - g} ${50 - g * 0.4} C${44 - g} ${62} 68 ${70} 104 ${68} Z`} fill="#f4ecc8" stroke={o} strokeWidth={1.6} />
          <path d={`M${42 - g} ${58 + open * 0.2} C${54 - g * 0.5} ${70 + open} 76 ${80 + open} 102 ${84 + open * 0.4} C104 ${78} 104 ${74} 104 ${72 + open * 0.4} C80 ${74 + open * 0.4} 60 ${68 + open * 0.4} ${42 - g} ${58 + open * 0.2} Z`} fill="#f4ecc8" stroke={o} strokeWidth={1.6} />
          <path d={`M${40 - g} ${54} C60 ${66 + open * 0.2} 84 ${70 + open * 0.3} 104 ${70 + open * 0.2}`} stroke="#3a0a10" strokeWidth={open * 0.5} fill="none" strokeLinecap="round" />
          {[52, 62, 72, 82, 92, 100].map((tx, i) => <path key={i} d={`M${tx - g * (1 - i / 6) * 0.5} ${57 + i * 0.8} l1 ${8}`} stroke="#9a8a5a" strokeWidth={1.4} />)}
          {[60, 72, 84, 96].map((tx, i) => <path key={`l${i}`} d={`M${tx} ${76 + open * 0.6} l1 ${-7}`} stroke="#9a8a5a" strokeWidth={1.4} />)}
          <path d={`M${30 - g} ${44 - g * 0.4} q-10 -2 -14 -16 M${30 - g} ${44 - g * 0.4} q-8 8 -8 20`} stroke={o} strokeWidth={2.6} fill="none" strokeLinecap="round" />
          {/* eye: yellow almond under a heavy lid, thin arched brow */}
          <g transform={`translate(74 -16) scale(1 ${1 - blink * 0.9})`}>
            <path d="M-14 0 C-6 -9 8 -8 16 2 C6 6 -6 6 -14 0 Z" fill="#f4e06a" stroke={o} strokeWidth={2.4} />
            <circle cx={8} cy={0} r={3.2} fill={o} />
            <path d="M-16 -2 C-6 -12 8 -11 18 0" stroke={o} strokeWidth={4} fill="none" strokeLinecap="round" />
          </g>
          <path d="M56 -38 C70 -50 92 -46 104 -30" stroke={o} strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d="M60 -6 C68 0 78 2 88 0" stroke={skinD} strokeWidth={1.6} fill="none" opacity={0.6} />
          {/* ear: behind the jaw hinge (ramus), in front of the slicked back hair */}
          <path d="M-30 8 C-46 2 -56 16 -54 34 C-52 54 -42 66 -30 64 C-24 60 -22 50 -26 42 C-22 30 -22 18 -30 8 Z" fill={skinSh} stroke={o} strokeWidth={2.6} strokeLinejoin="round" />
          <path d="M-34 18 C-44 18 -46 34 -42 46 C-38 54 -32 52 -32 46" stroke={skinD} strokeWidth={2} fill="none" />
          {/* sideburn in front of the ear */}
          <path d="M-40 -20 C-30 -10 -22 6 -20 24 L-26 26 C-30 8 -36 -6 -48 -16 Z" fill={hair} stroke={o} strokeWidth={2} />
          {[-66, -52].map((hx) => <path key={hx} d={`M${hx} -44 Q${hx - 10} 10 ${hx - 2} 60`} stroke={hairSh} strokeWidth={3} fill="none" />)}
          <path d="M-110 -60 C-130 -10 -122 46 -88 90 C-100 50 -100 0 -88 -50 Z" fill={hairSh} />
          <path d="M106 -24 C112 -8 126 10 136 24" stroke="url(#jkRim)" strokeWidth={5} fill="none" />
          {/* fedora */}
          <ellipse cx={14} cy={-62} rx={178} ry={36} fill={hatSh} stroke={o} strokeWidth={3.2} transform="rotate(-7 14 -62)" />
          <path d="M-150 -50 C-80 -36 90 -60 180 -86 L184 -76 C100 -46 -60 -24 -150 -44 Z" fill={hat} opacity={0.9} />
          <path d="M-86 -66 C-90 -110 -84 -146 -66 -166 C-40 -178 -14 -168 4 -156 C24 -170 56 -178 78 -162 C96 -140 98 -110 94 -84 C40 -70 -40 -64 -86 -66 Z" fill={hat} stroke={o} strokeWidth={3.2} strokeLinejoin="round" />
          <path d="M-86 -66 C-90 -110 -84 -146 -66 -166 C-56 -150 -52 -110 -48 -66 Z" fill={hatSh} />
          <path d="M4 -156 C2 -136 6 -118 12 -104" stroke={hatSh} strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d="M60 -150 C70 -132 74 -118 72 -100" stroke={hatSh} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.85} />
          <path d="M-84 -90 C-40 -84 50 -92 94 -104 L94 -84 C40 -70 -40 -64 -86 -66 Z" fill="#2a0e3a" />
        </g>
        {/* gloved 5-finger hand: card pinched between index (front) and middle (behind) fingers */}
        <g transform={`translate(196 236) rotate(${-10 + laugh * 4 * Math.sin(f * 0.55)})`}>
          {/* sleeve + shirt cuff, running down behind the parapet */}
          <path d="M-36 40 C-60 90 -90 160 -110 240 L-10 260 C0 180 10 110 30 44 Z" fill="url(#jkSuit)" stroke={o} strokeWidth={3} />
          <path d="M-38 34 L32 40 L30 54 L-42 48 Z" fill="#f08c1e" stroke={o} strokeWidth={2} />
          {/* middle finger (behind the card) */}
          <path d="M-12 -18 C-14 -50 -14 -80 -12 -100 Q-4 -112 6 -100 C8 -80 8 -50 8 -18 Z" fill={glove} stroke={o} strokeWidth={2.6} />
          {/* card */}
          <g transform="translate(14 -86) rotate(10)">
            {card < 0.5 && (
              <g transform={`scale(${Math.max(0.12, Math.cos(card * Math.PI))} 1)`}>
                <rect x={-44} y={-62} width={88} height={124} rx={8} fill="#7a1a24" stroke={o} strokeWidth={3} />
                <rect x={-36} y={-54} width={72} height={108} rx={5} fill="none" stroke="#e8c060" strokeWidth={2} />
                {Array.from({ length: 5 }).map((_, k) => <path key={k} d={`M-30 ${-44 + k * 20} l10 10 l10 -10 l10 10 l10 -10 l10 10 l10 -10`} stroke="#e8c060" strokeWidth={1.6} fill="none" opacity={0.7} />)}
              </g>
            )}
            {card >= 0.5 && (
              <g transform={`scale(${Math.max(0.12, -Math.cos(card * Math.PI))} 1)`}>
                <rect x={-44} y={-62} width={88} height={124} rx={8} fill="#f5efe2" stroke={o} strokeWidth={3} />
                <rect x={-36} y={-54} width={72} height={108} rx={5} fill="none" stroke="#c8202c" strokeWidth={2} />
                <text x={0} y={-24} textAnchor="middle" fontFamily={DISPLAY} fontSize={26} letterSpacing={3} fill="#c8202c">JOKER</text>
                <path d="M-18 6 q18 -26 36 0 q-6 22 -18 26 q-12 -4 -18 -26 Z" fill="#2a8a3a" />
                <path d="M-10 28 q10 10 20 0" stroke="#c8202c" strokeWidth={3} fill="none" />
                <path d="M-26 -4 l10 -18 l8 14 l8 -16 l8 16 l8 -14 l10 18 Z" fill="#8a4bb0" />
              </g>
            )}
          </g>
          {/* palm / back of the hand */}
          <path d="M-36 40 C-40 10 -36 -12 -26 -22 L28 -22 C36 -6 36 20 30 44 Z" fill={glove} stroke={o} strokeWidth={2.8} strokeLinejoin="round" />
          {/* ring + pinky curled into the palm */}
          <path d="M-30 -18 C-40 -26 -46 -10 -40 4 C-36 12 -28 12 -24 4 Z" fill={glove} stroke={o} strokeWidth={2.4} />
          <path d="M-20 -22 C-30 -34 -38 -16 -32 -2 C-28 6 -20 6 -16 -2 Z" fill={glove} stroke={o} strokeWidth={2.4} />
          {/* thumb folded over the curled fingers */}
          <path d="M28 18 C16 10 0 4 -18 2 Q-26 4 -22 12 C-6 18 10 26 26 32 Z" fill={glove} stroke={o} strokeWidth={2.6} strokeLinejoin="round" />
          {/* thumb tip pinching the card face against the index finger */}
          <path d="M26 30 C40 4 40 -26 26 -48 Q16 -58 8 -48 C16 -30 16 -4 6 18 Z" fill={glove} stroke={o} strokeWidth={2.6} strokeLinejoin="round" />
          <path d="M24 -40 C30 -28 30 -10 24 6" stroke={gloveL} strokeWidth={2} fill="none" opacity={0.7} />
          {/* index finger in front of the card */}
          <path d="M12 -18 C14 -48 18 -74 22 -92 Q30 -102 36 -90 C34 -70 32 -46 30 -18 Z" fill={glove} stroke={o} strokeWidth={2.6} />
          {/* glove stitching + rim light */}
          <path d="M-8 -10 V30 M10 -10 V30" stroke={gloveL} strokeWidth={1.4} opacity={0.6} />
          <path d="M30 -18 C34 -48 32 -72 34 -90 M30 44 C36 20 36 -6 28 -22" stroke={gloveL} strokeWidth={2.5} fill="none" opacity={0.7} />
          <path d="M-36 40 C-40 10 -36 -12 -26 -22" stroke={gloveS} strokeWidth={4} fill="none" opacity={0.7} />
        </g>
      </g>
    </svg>
  );
};
