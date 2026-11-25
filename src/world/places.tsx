import React from "react";
import { useCurrentFrame } from "remotion";
import { rand, shade, tint, mix, flicker, noise } from "../lib/anim";

/* ================= Reyes repair shop — exterior ================= */
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
          <path d="M-26 0 L26 0 L16 -34 L-16 -34 Z" fill={lamp > 0.1 ? "#f2c27a" : "#4a3a2a"} stroke="#1a120c" strokeWidth={3} />
          <rect x={-3} y={0} width={6} height={58} fill="#2a1d14" />
          <rect x={-18} y={56} width={36} height={8} rx={2} fill="#2a1d14" />
        </g>
        {/* window mullions + glass glare */}
        <rect x={536} y={540} width={8} height={190} fill="#1a120e" />
        <rect x={296} y={536} width={488} height={198} fill="none" stroke="#2c201a" strokeWidth={8} />
        <path d="M320 548 l60 0 l-90 170 l-30 0 Z" fill="#fff" opacity={0.05} />
        {/* door */}
        <rect x={70} y={540} width={180} height={H - 540} fill="#1d1410" stroke="#2c201a" strokeWidth={8} />
        <rect x={92} y={560} width={136} height={110} fill="#ffcf8a" opacity={0.2 + doorLight * 0.5} />
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
        <path d="M-34 -50 L34 -50 L22 -96 L-22 -96 Z" fill={lamp > 0.1 ? "#f6cf8a" : "#5a4630"} stroke="#1a0f08" strokeWidth={3} />
        <rect x={-4} y={-50} width={8} height={44} fill="#2a1a10" />
        <rect x={-20} y={-8} width={40} height={8} rx={2} fill="#2a1a10" />
      </g>
      {/* shelves with radios & clocks */}
      {[0, 1, 2].map((row) => (
        <g key={row}>
          <rect x={60} y={220 + row * 170} width={900} height={14} fill="#1a0f08" />
          {Array.from({ length: 7 }).map((_, i) => {
            const bx = 80 + i * 125 + rand(row * 9 + i) * 20, by = 220 + row * 170;
            const kind = Math.floor(rand(row * 3 + i * 5) * 3);
            if (kind === 0) return <g key={i}><rect x={bx} y={by - 90} width={100} height={90} rx={12} fill={mix("#5a3a22", "#2a1a10", rand(i))} stroke="#0d0805" strokeWidth={3} /><circle cx={bx + 32} cy={by - 46} r={22} fill="#1a110a" /><circle cx={bx + 32} cy={by - 46} r={16} fill="none" stroke="#8a6a3a" strokeWidth={2} /><rect x={bx + 62} y={by - 70} width={26} height={40} fill="#c9a060" opacity={0.6} /></g>;
            if (kind === 1) return <g key={i}><circle cx={bx + 44} cy={by - 46} r={40} fill="#e8dcc0" opacity={0.85} stroke="#2a1a10" strokeWidth={5} /><path d={`M${bx + 44} ${by - 46} l0 -26 M${bx + 44} ${by - 46} l18 8`} stroke="#1a110a" strokeWidth={3} /></g>;
            return <g key={i}><rect x={bx} y={by - 60} width={90} height={60} fill="#2c2c30" stroke="#0d0805" strokeWidth={3} /><rect x={bx + 8} y={by - 52} width={50} height={40} rx={8} fill="#40505a" opacity={0.7} /></g>;
          })}
        </g>
      ))}
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
      <text x={960} y={230} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={46} letterSpacing={12} fill="#d9c79a">GOTHAM POLICE ACADEMY</text>
      {Array.from({ length: 8 }).map((_, i) => (
        <g key={i}>
          <rect x={240 + i * 200} y={270} width={70} height={530} fill="url(#acCol)" />
          <rect x={228 + i * 200} y={262} width={94} height={16} fill="#8a94aa" />
        </g>
      ))}
      {/* tall lit doorway */}
      <rect x={880} y={480} width={160} height={320} fill="#ffd894" opacity={0.85} />
      <rect x={880} y={480} width={160} height={320} fill="none" stroke="#1a1e28" strokeWidth={10} />
      {/* banners */}
      {[560, 1360].map((bx) => (
        <g key={bx}><rect x={bx - 40} y={300} width={80} height={240} fill="#1d2b62" /><path d={`M${bx - 40} 540 L${bx} 510 L${bx + 40} 540 Z`} fill="#0b0f1a" /><circle cx={bx} cy={380} r={24} fill="#d9b24a" /></g>
      ))}
      {/* string lights */}
      {[0, 1].map((k) => {
        const pts = Array.from({ length: 26 }).map((_, i) => {
          const t = i / 25; const xx = 120 + t * 1680; const yy = 330 + k * 70 + Math.sin(t * Math.PI) * 90;
          return [xx, yy];
        });
        return (
          <g key={k}>
            <path d={"M" + pts.map((p) => p.join(" ")).join(" L")} stroke="#0a0a0a" strokeWidth={2} fill="none" />
            {pts.map(([xx, yy], i) => {
              const on = (1 - lightsDim * (rand(i + k * 30 + Math.floor(f / 3)) > 0.3 ? 1 : 0.2));
              return <g key={i}><circle cx={xx} cy={yy + 6} r={5} fill="#ffe2a0" opacity={0.3 + 0.7 * on} /><circle cx={xx} cy={yy + 6} r={18} fill="#ffcf70" opacity={0.18 * on} /></g>;
            })}
          </g>
        );
      })}
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
      <path d="M380 840 V200 Q380 130 520 120 H1140 Q1280 130 1280 200 V840 Z" fill="url(#prF)" />
      <path d="M560 120 Q830 40 1100 120 Z" fill="#2a1e26" />
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
      <rect x={640} y={640} width={380} height={56} fill="#1a1216" stroke="#8a6a60" strokeWidth={3} />
      <text x={830} y={682} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={36} letterSpacing={14} fill="#f0d8a8">POLICE</text>
      <rect x={700} y={704} width={260} height={136} fill="url(#prDoor)" opacity={0.9} />
      <rect x={826} y={704} width={8} height={136} fill="#3a2a20" />
      {/* lamps */}
      {[640, 1020].map((x) => <g key={x}><rect x={x - 4} y={720} width={8} height={120} fill="#111" /><circle cx={x} cy={712} r={13} fill="#fff0c8" /><circle cx={x} cy={712} r={70} fill="url(#prGlow)" opacity={fl} /></g>)}
      {/* steps */}
      {Array.from({ length: 4 }).map((_, i) => <rect key={i} x={640 - i * 40} y={840 + i * 22} width={380 + i * 80} height={22} fill={i % 2 ? "#4a3e44" : "#5a4c52"} />)}
      <rect x={0} y={928} width={1920} height={152} fill="#15121a" />
      <rect x={0} y={928} width={1920} height={6} fill="#3a3440" />
      {/* sandbags */}
      {Array.from({ length: 7 }).map((_, i) => <ellipse key={i} cx={1120 + i * 34} cy={920 - (i % 2) * 18} rx={22} ry={12} fill="#5a5040" stroke="#1a1610" strokeWidth={2} />)}
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
