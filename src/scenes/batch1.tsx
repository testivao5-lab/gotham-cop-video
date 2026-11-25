import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { Stage, Plane } from "../lib/Camera";
import { ci, sp, noise, rand } from "../lib/anim";
import { cue, sceneDur } from "../lib/cues";
import { Post, Rain, Fog, Glow, lightning, handheld, Splashes, LightCone } from "../fx/fx";
import { Character, breathe, blinkAt, walk, walkDist, anchor } from "../characters/Character";
import { Sky, DecoSkyline } from "../world/sky";
import { StreetFacades, WetStreet, SchoolBus } from "../world/street";
import { ShopFront, ShopInterior, Academy, Precinct, JokerProfile, BrassDomeLamp } from "../world/places";
import { BusStreetSet, ForegroundRain, Caption, Shot, TimeJump, EdgeFade, Sfx } from "./common";

const mixP = (a: [number, number], b: [number, number], t: number): [number, number] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const EZ = Easing.bezier(0.25, 0.1, 0.25, 1);

/* ============ Scene 1 — Batman appears at rain-soaked bus street ============ */
export const Scene01: React.FC = () => {
  const f = useCurrentFrame();
  const flash = lightning(f, [3, 70]);
  const fall = ci(f, [12, 27], [0, 1], Easing.in(Easing.quad));
  const land = sp(f, 27, { damping: 12 });
  const rise = sp(f, 40, { damping: 16, stiffness: 70 });
  const crouch = f < 27 ? 0.3 : ci(f, [27, 29], [0.3, 1], EZ) * (1 - ci(f, [36, 58], [0, 1], Easing.inOut(Easing.cubic)));
  const shake = f > 27 && f < 36 ? (36 - f) * 1.4 * Math.sin(f * 3) : 0;
  const hh = handheld(f, 0.6, 1);
  const cam = { x: ci(f, [0, sceneDur(1)], [-10, 20]) + hh.x, y: hh.y + shake, zoom: ci(f, [0, sceneDur(1)], [1.0, 1.08]), rot: hh.rot };
  const bY = -500 + fall * 1510; // lands exactly on the shared groundY (1010)
  return (
    <Stage cam={cam}>
      <BusStreetSet flash={flash} fog={0.35} />
      <Plane p={1}>
        <Character id="s1bat" kind="batman" x={1210} y={bY} scale={1.12} facing={-1} lightSide={-1} silhouette={0.35} capeWind={f < 27 ? 2.6 : 1.4 - rise * 0.8} glowEyes={0.8}
          pose={{ lean: 26 * crouch, bob: 70 * crouch, legNear: [36 * crouch + (f < 27 ? 10 : 0), 80 * crouch + 4], legFar: [-10 * crouch, 70 * crouch + 4], armNear: [6 + 44 * crouch, 10 + 20 * crouch], armFar: [-6 - 44 * crouch, 8 + 12 * crouch], head: -6 * crouch, brow: -1, handNear: "fist", handFar: "fist" }} />
        {f >= 27 && f < 45 && <Splashes y0={950} y1={985} count={14} seed={20} opacity={0.9} />}
        <Character id="s1alex" kind="alex" x={520} y={1010} scale={1.18} facing={1} lightSide={1} silhouette={0.25} shoulderRadio
          pose={{ head: -4 - 4 * ci(f, [27, 45], [0, 1]), lean: -3 * ci(f, [27, 35], [0, 1]), brow: 0.4 + 0.5 * ci(f, [27, 40], [0, 1]), smile: ci(f, [70, 100], [0, 0.35]), blink: blinkAt(f, 64, 20), bob: breathe(f, 0.5, 1.5), eyeY: -0.5, armNear: [6, 18], armFar: [-8, 14] }} />
      </Plane>
      <ForegroundRain />
      <Post tintOpacity={0.22} vignette={0.65} />
      <Sfx name="thunder" at={3} gain={0.55} />
      <Sfx name="cloth" at={12} gain={0.4} />
      <Sfx name="land" at={27} gain={0.6} />
    </Stage>
  );
};

/* ============ Scene 2 — Batman takes radio and warns Alex ============ */
export const Scene02: React.FC = () => {
  const f = useCurrentFrame();
  const reach = ci(f, [26, 48], [0, 1], Easing.inOut(Easing.cubic));
  const grip = ci(f, [48, 54], [0, 1], EZ);
  const pull = ci(f, [56, 82], [0, 1], Easing.inOut(Easing.cubic));
  const taken = f >= 54;
  const hh = handheld(f, 0.8, 4);
  const cam = { x: hh.x, y: hh.y, zoom: ci(f, [0, sceneDur(2)], [1.0, 1.06]), rot: hh.rot };
  const S = 1.95;
  const ax = 640 - reach * 10, bx = 1060 - reach * 70 + pull * 30; // Batman steps IN so the arm stays bent
  const radio = anchor("alex", ax, 1360, S, 1, "radio");
  const rest: [number, number] = [bx - 70 * S, 1360 - 168 * S];
  const lift: [number, number] = [bx - 120 * S, 1360 - 300 * S];
  const grab: [number, number] = [radio[0] + 6, radio[1] + 8];
  const ear: [number, number] = [bx - 40 * S, 1360 - 372 * S];
  const toEar = ci(f, [92, 112], [0, 1], Easing.inOut(Easing.cubic)); // listens to the radio after the warning
  const hand = pull > 0 ? mixP(mixP(grab, lift, pull), ear, toEar) : mixP(rest, grab, reach);
  return (
    <Stage cam={cam}>
      <AbsoluteFill style={{ filter: "blur(5px)", transform: "scale(1.15)" }}>
        <BusStreetSet fog={0.45} rain={0.6} />
      </AbsoluteFill>
      <Plane p={1}>
        <Character id="s2alex" kind="alex" x={ax} y={1360} scale={S} crop="thigh" facing={1} lightSide={1} silhouette={0.15} shoulderRadio={!taken}
          pose={{ lean: -5 * reach + 3 * pull, head: -6 - 4 * reach, brow: 0.3 + 0.7 * reach, eyeY: -0.6, eyeX: 0.4, blink: blinkAt(f, 80, 50), bob: breathe(f, 0.6, 2), armNear: [8 + 10 * pull, 20], armFar: [-6, 16] }} />
        <Character id="s2bat" kind="batman" x={bx} y={1360} scale={S} crop="thigh" facing={-1} lightSide={-1} silhouette={0.2} capeWind={0.9} glowEyes={0.5}
          prop={taken ? "radio" : "none"} reachNear={hand}
          pose={{ lean: 6 * reach - 4 * pull, head: 2 - 4 * pull, brow: -1, blink: blinkAt(f, 90, 10), armFar: [-10, 18], handNear: grip > 0.5 || taken ? "grip" : "open", handFar: "fist", bob: breathe(f, 0.25, 1.5) }} />
      </Plane>
      <ForegroundRain amt={0.8} />
      <Post tintOpacity={0.2} vignette={0.7} />
      <Sfx name="cloth" at={24} gain={0.35} />
      <Sfx name="grab" at={51} gain={0.55} />
      <Sfx name="static" at={58} gain={0.25} />
    </Stage>
  );
};

/* ============ Scene 3 — Nia pounds fogged bus window ============ */
/* camera is OUTSIDE the bus looking in: droplets bead on the outer glass; the interior is warm, bright, dry */
const BusWindowCloseup: React.FC<{ fog: number; wipe: number; pound: number }> = ({ fog, wipe, pound }) => {
  const f = useCurrentFrame();
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  // window opening (glass) and sill; everything of the girl below the sill is hidden by the bus body (z30)
  const WX0 = 230, WX1 = 1690, WY0 = 110, SILL = 720;
  const br = breathe(f, 0.3, 3);
  const CX = 960 + Math.sin(f * 0.05) * 4, HY = 410 + br * 0.4 - pound * 6;
  const blink = blinkAt(f, 84, 11);
  // ONE pair of hands only (no rig arms): palms pressed flat on the glass; a pound pulls back then slams
  const pull = 1 - pound;
  const hs = 0.93 + pound * 0.07;
  const palmL: [number, number] = [CX - 270 - pull * 6, 400 + pull * 10];
  const palmR: [number, number] = [CX + 270 + pull * 6, 396 + pull * 10];
  const skin = "#a8714d", skinL = "#c48a62", skinS = "#7a4c30", ol = "#2a170d";
  const coat = "#f0c21a", coatS = "#c4960c", coatD = "#8a6408", coatL = "#ffe27a";
  /** palm facing the camera: thumb toward her midline (side = +1 for screen-left hand) */
  const Palm = ({ at, side }: { at: [number, number]; side: 1 | -1 }) => {
    const fingers = [
      { x: 30, len: 74, w: 21 },  // index (next to thumb)
      { x: 8, len: 84, w: 22 },   // middle
      { x: -14, len: 77, w: 21 }, // ring
      { x: -34, len: 60, w: 18 }, // pinky
    ];
    return (
      <g transform={`translate(${at[0]} ${at[1]}) scale(${side * hs} ${hs})`}>
        {/* forearm/sleeve comes up from below the sill */}
        <path d={`M-30 40 C-34 120 -44 260 -52 ${SILL - at[1] + 60} L44 ${SILL - at[1] + 60} C40 260 34 120 30 40 Z`} fill={skin} stroke={ol} strokeWidth={3.5} />
        <path d={`M-48 ${170} C-50 260 -56 ${SILL - at[1]} -58 ${SILL - at[1] + 60} L50 ${SILL - at[1] + 60} C46 ${SILL - at[1]} 44 260 42 ${170} Q0 ${154} -48 ${170} Z`} fill={coat} stroke={ol} strokeWidth={3.5} />
        <path d={`M-48 ${170} Q0 ${154} 42 ${170} L42 ${188} Q0 ${172} -48 ${188} Z`} fill={coatS} />
        <path d={`M24 ${190} C28 260 30 ${SILL - at[1] - 40} 32 ${SILL - at[1] + 60}`} stroke={coatL} strokeWidth={6} opacity={0.55} fill="none" />
        {/* fingers (drawn under the palm outline so the knuckle line is clean) */}
        {fingers.map((q, i) => (
          <g key={i}>
            <path d={`M${q.x - q.w / 2} -30 L${q.x - q.w * 0.42} ${-30 - q.len + q.w * 0.45} Q${q.x} ${-30 - q.len - q.w * 0.35} ${q.x + q.w * 0.42} ${-30 - q.len + q.w * 0.45} L${q.x + q.w / 2} -30 Z`} fill={skin} stroke={ol} strokeWidth={3.2} strokeLinejoin="round" />
            <ellipse cx={q.x} cy={-30 - q.len + q.w * 0.5} rx={q.w * 0.34} ry={q.w * 0.42} fill="#f1d2bc" opacity={0.35 + pound * 0.3} />
            <path d={`M${q.x - q.w * 0.3} ${-30 - q.len * 0.45} q${q.w * 0.3} 3 ${q.w * 0.6} 0`} stroke={skinS} strokeWidth={1.6} fill="none" />
          </g>
        ))}
        {/* palm */}
        <path d="M-46 -34 Q-48 10 -38 34 Q-20 50 8 48 Q34 46 42 22 L44 -34 Q0 -42 -46 -34 Z" fill={skin} stroke={ol} strokeWidth={3.5} strokeLinejoin="round" />
        {/* thumb toward the midline */}
        <path d="M38 18 C54 6 66 -18 76 -36 Q86 -48 92 -38 C90 -18 74 10 56 34 Q46 44 34 38 Z" fill={skin} stroke={ol} strokeWidth={3.5} strokeLinejoin="round" />
        <ellipse cx={84} cy={-36} rx={7} ry={9} fill="#f1d2bc" opacity={0.35 + pound * 0.3} />
        {/* palm creases + pressure pads (flattened on the glass) */}
        <path d="M-34 -10 Q0 -2 30 -16 M-30 14 Q0 4 34 -2 M24 30 Q8 12 16 -26" stroke={skinS} strokeWidth={1.8} fill="none" opacity={0.75} />
        <ellipse cx={-6} cy={8} rx={30} ry={24} fill="#f4dccb" opacity={0.18 + pound * 0.22} />
        <path d="M-44 -30 Q-46 6 -36 30" stroke={skinL} strokeWidth={3} fill="none" opacity={0.6} />
      </g>
    );
  };
  const beads = Array.from({ length: 46 });
  const eye = (ex: number) => {
    const cid = `nia${uid}${ex > 0 ? "r" : "l"}`;
    const lid = Math.max(0, Math.min(1, blink));
    return (
      <g transform={`translate(${ex} 0) scale(1 ${1 - lid * 0.92})`}>
        <clipPath id={cid}><path d="M-25 0 Q-22 -20 0 -21 Q22 -20 25 0 Q20 15 0 16 Q-20 15 -25 0 Z" /></clipPath>
        <path d="M-25 0 Q-22 -20 0 -21 Q22 -20 25 0 Q20 15 0 16 Q-20 15 -25 0 Z" fill="#f6efe6" stroke={ol} strokeWidth={2.4} />
        <g clipPath={`url(#${cid})`}>
          <circle cx={-ex * 0.04} cy={-1} r={14} fill="#4a2a16" />
          <circle cx={-ex * 0.04} cy={-1} r={7.5} fill="#120a06" />
          <circle cx={-ex * 0.04 + 5} cy={-6} r={4} fill="#fff" />
          <circle cx={-ex * 0.04 - 5} cy={4} r={1.6} fill="#fff" opacity={0.7} />
        </g>
        <path d="M-27 -2 Q-22 -23 0 -24 Q22 -23 27 -2" stroke={ol} strokeWidth={4.5} fill="none" strokeLinecap="round" />
        {[-18, -10, -2].map((lx, i) => <path key={i} d={`M${ex > 0 ? -lx : lx} -21 l${ex > 0 ? 3 : -3} -6`} stroke={ol} strokeWidth={2} strokeLinecap="round" />)}
      </g>
    );
  };
  return (
    <>
      {/* z10 — bright warm dry interior */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="bwIn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f1d9a6" /><stop offset="0.55" stopColor="#c99a62" /><stop offset="1" stopColor="#6a4a2c" /></linearGradient>
          <radialGradient id="bwLamp" cx="0.5" cy="0.05" r="0.7"><stop offset="0" stopColor="#fff6dc" /><stop offset="1" stopColor="#ffe2a6" stopOpacity="0" /></radialGradient>
          <linearGradient id="bwSeat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3f7a5a" /><stop offset="1" stopColor="#1e3e2e" /></linearGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#bwIn)" />
        <rect width="1920" height="1080" fill="url(#bwLamp)" opacity={0.85} />
        <rect x={0} y={128} width={1920} height={22} fill="#fffbe8" opacity={0.75} />
        {[260, 700, 1140, 1580].map((x) => <rect key={x} x={x} y={150} width={14} height={520} fill="#a87c4a" opacity={0.35} />)}
        {/* far-side windows: dark wet night beyond */}
        {[0, 1, 2, 3].map((i) => <g key={i}><rect x={120 + i * 440} y={250} width={360} height={190} rx={18} fill="#1c2840" opacity={0.9} /><rect x={140 + i * 440} y={268} width={60} height={150} fill="#7a9ad0" opacity={0.08} /></g>)}
        <rect x={0} y={232} width={1920} height={10} fill="#8a7050" opacity={0.6} />
        {/* green seat backs (behind her) */}
        {[0, 1, 2].map((i) => <g key={i}><rect x={160 + i * 620} y={470} width={440} height={400} rx={40} fill="url(#bwSeat)" stroke="#12261c" strokeWidth={4} /><rect x={160 + i * 620} y={470} width={440} height={26} rx={13} fill="#5e9c78" /><rect x={176 + i * 620} y={510} width={8} height={300} fill="#ffffff" opacity={0.12} /></g>)}
        <rect width="1920" height="1080" fill="#ffd9a0" opacity={0.08} />
      </svg>
      {/* z20 — Nia, front view: yellow raincoat hood, dark hair with bangs, child face aligned to the camera */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${CX} ${HY})`}>
          {/* coat shoulders + chest */}
          <path d={`M-250 ${420} C-240 ${300 - br} -200 ${220 - br} -96 ${190 - br} L96 ${190 - br} C200 ${220 - br} 240 ${300 - br} 250 ${420} Z`} fill={coat} stroke={ol} strokeWidth={4} />
          <path d={`M-250 ${420} C-240 ${300 - br} -200 ${220 - br} -96 ${190 - br} L-60 ${196 - br} C-150 ${236} -190 ${320} -196 ${420} Z`} fill={coatS} />
          <path d={`M0 ${200 - br} V${420}`} stroke={coatD} strokeWidth={4} />
          {[250, 300].map((y) => <g key={y}><rect x={-26} y={y - 6} width={16} height={12} rx={3} fill="#3a2a10" /><rect x={10} y={y - 6} width={16} height={12} rx={3} fill="#3a2a10" /></g>)}
          {/* hood back (behind the head) */}
          <path d="M-150 60 C-176 -60 -120 -176 0 -180 C120 -176 176 -60 150 60 C150 130 120 196 70 214 L-70 214 C-120 196 -150 130 -150 60 Z" fill={coatS} stroke={ol} strokeWidth={4} />
          <path d="M-128 50 C-146 -48 -96 -150 0 -152 C96 -150 146 -48 128 50 C124 120 96 170 56 186 L-56 186 C-96 170 -124 120 -128 50 Z" fill="#3a2a0c" />
          {/* neck */}
          <path d="M-34 110 L-36 190 Q0 204 36 190 L34 110 Z" fill={skinS} stroke={ol} strokeWidth={3} />
          {/* hair behind the face (side strands falling inside the hood) */}
          <path d="M-112 -20 C-124 40 -116 110 -92 150 L-70 150 C-86 100 -90 40 -84 -10 Z" fill="#1a120e" stroke={ol} strokeWidth={3} />
          <path d="M112 -20 C124 40 116 110 92 150 L70 150 C86 100 90 40 84 -10 Z" fill="#1a120e" stroke={ol} strokeWidth={3} />
          {/* face (front) */}
          <path d="M-96 -30 C-100 -100 -54 -132 0 -132 C54 -132 100 -100 96 -30 C94 30 70 92 30 116 Q0 128 -30 116 C-70 92 -94 30 -96 -30 Z" fill={skin} stroke={ol} strokeWidth={4} />
          <path d="M60 -110 C96 -80 100 -20 90 30 C80 76 56 104 30 116 C58 70 74 10 60 -110 Z" fill={skinS} opacity={0.45} />
          <path d="M-80 -60 C-84 -20 -80 20 -70 46" stroke={skinL} strokeWidth={6} fill="none" opacity={0.5} />
          {/* ears peeking under the hood */}
          <path d="M-96 -14 C-112 -18 -116 14 -98 22" fill={skin} stroke={ol} strokeWidth={3} />
          <path d="M96 -14 C112 -18 116 14 98 22" fill={skinS} stroke={ol} strokeWidth={3} />
          {/* bangs */}
          <path d="M-100 -40 C-104 -112 -48 -146 4 -142 C60 -140 104 -106 100 -40 C92 -64 80 -76 66 -80 C62 -64 52 -56 40 -54 C42 -68 38 -80 30 -86 C20 -66 2 -58 -14 -56 C-8 -70 -10 -80 -14 -88 C-30 -66 -50 -60 -66 -58 C-62 -70 -62 -78 -60 -84 C-80 -74 -94 -60 -100 -40 Z" fill="#1a120e" stroke={ol} strokeWidth={3} strokeLinejoin="round" />
          <path d="M-40 -126 Q0 -136 40 -124" stroke="#4a3426" strokeWidth={5} fill="none" opacity={0.8} />
          {/* hood rim (front edge framing the face) with drawstring */}
          <path d="M-150 60 C-176 -60 -120 -176 0 -180 C120 -176 176 -60 150 60 C150 130 120 196 70 214 L-70 214 C-120 196 -150 130 -150 60 Z M-118 50 C-134 -40 -90 -138 0 -140 C90 -138 134 -40 118 50 C114 110 92 160 56 176 L-56 176 C-92 160 -114 110 -118 50 Z" fill={coat} fillRule="evenodd" stroke={ol} strokeWidth={4} />
          <path d="M-142 40 C-160 -70 -100 -164 0 -168" stroke={coatL} strokeWidth={6} fill="none" opacity={0.6} />
          <path d="M90 176 C120 150 140 100 146 40" stroke={coatD} strokeWidth={8} fill="none" opacity={0.5} />
          <path d="M-46 178 L-50 236 M46 178 L52 236" stroke="#f4efe0" strokeWidth={4} strokeLinecap="round" />
          <rect x={-56} y={232} width={12} height={18} rx={4} fill="#2a2a30" /><rect x={46} y={232} width={12} height={18} rx={4} fill="#2a2a30" />
          {/* eyes (front, worried), brows tilted up at the middle */}
          <g transform="translate(0 -18)">{eye(-44)}{eye(44)}</g>
          <path d="M-72 -64 Q-50 -72 -22 -60" stroke="#1a120e" strokeWidth={6} fill="none" strokeLinecap="round" transform="rotate(-8 -46 -64)" />
          <path d="M72 -64 Q50 -72 22 -60" stroke="#1a120e" strokeWidth={6} fill="none" strokeLinecap="round" transform="rotate(8 46 -64)" />
          {/* small front nose + closed worried mouth (narrator-only) */}
          <path d="M-4 0 Q-12 26 -6 32 Q0 36 8 32" stroke={skinS} strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d="M-20 64 Q0 56 20 64" stroke="#5a2020" strokeWidth={4} fill="none" strokeLinecap="round" />
          <ellipse cx={-62} cy={30} rx={18} ry={10} fill="#d0604a" opacity={0.28} />
          <ellipse cx={62} cy={30} rx={18} ry={10} fill="#d0604a" opacity={0.28} />
        </g>
        <Palm at={palmL} side={1} />
        <Palm at={palmR} side={-1} />
      </svg>
      {/* z25 — outer glass: fog with the wipe + palm clearings, beading droplets (glass area only) */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="bwSoft"><stop offset="0.55" stopColor="#000" stopOpacity="1" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
          <mask id="bwMask">
            <rect width="1920" height="1080" fill="white" />
            <ellipse cx={CX} cy={HY - 10} rx={300 * wipe} ry={230 * wipe} fill="url(#bwSoft)" />
            <ellipse cx={palmL[0]} cy={palmL[1] - 30} rx={92} ry={110} fill="url(#bwSoft)" />
            <ellipse cx={palmR[0]} cy={palmR[1] - 30} rx={92} ry={110} fill="url(#bwSoft)" />
          </mask>
          <radialGradient id="bwFog"><stop offset="0" stopColor="#e4ecf4" stopOpacity="0.85" /><stop offset="1" stopColor="#c4d2e2" stopOpacity="1" /></radialGradient>
          <clipPath id="bwGlass"><rect x={WX0} y={WY0} width={WX1 - WX0} height={SILL - WY0} rx={34} /></clipPath>
        </defs>
        <g clipPath="url(#bwGlass)">
          <rect width="1920" height="1080" fill="url(#bwFog)" opacity={fog * 0.62} mask="url(#bwMask)" />
          {beads.map((_, i) => {
            const slide = rand(i * 3) > 0.86;
            const x0 = WX0 + 20 + rand(i * 11) * (WX1 - WX0 - 40);
            const y = WY0 + ((rand(i * 5) * (SILL - WY0) + (slide ? f * (0.6 + rand(i) * 1.2) : 0)) % (SILL - WY0));
            const r = 2.5 + rand(i * 7) * 5;
            return <g key={i}><circle cx={x0} cy={y} r={r} fill="#eef5ff" opacity={0.22} /><circle cx={x0 - r * 0.3} cy={y - r * 0.3} r={r * 0.35} fill="#fff" opacity={0.5} />{slide && <path d={`M${x0} ${y - 40} Q${x0 + 2} ${y - 20} ${x0} ${y - r}`} stroke="#eef5ff" strokeWidth={1.4} opacity={0.18} fill="none" />}</g>;
          })}
          {pound > 0.2 && [palmL, palmR].map(([hx, hy], i) => <ellipse key={i} cx={hx} cy={hy - 30} rx={100 + (1 - pound) * 30} ry={118 + (1 - pound) * 30} fill="none" stroke="#ffffff" strokeWidth={3} opacity={pound * 0.25} />)}
          <path d={`M${WX0 + 40} ${WY0} l240 0 l-260 ${SILL - WY0} l-90 0 Z`} fill="#fff" opacity={0.06} />
        </g>
      </svg>
      {/* z30 — bus body: window frame, rubber gasket, sill, yellow panel with black rub rails, rain on the outside */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="bwBody" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d9a520" /><stop offset="0.5" stopColor="#b8860e" /><stop offset="1" stopColor="#5e430a" /></linearGradient>
        </defs>
        <path d={`M0 0 H1920 V1080 H0 Z M${WX0 + 34} ${WY0} H${WX1 - 34} Q${WX1} ${WY0} ${WX1} ${WY0 + 34} V${SILL - 34} Q${WX1} ${SILL} ${WX1 - 34} ${SILL} H${WX0 + 34} Q${WX0} ${SILL} ${WX0} ${SILL - 34} V${WY0 + 34} Q${WX0} ${WY0} ${WX0 + 34} ${WY0} Z`} fill="url(#bwBody)" fillRule="evenodd" />
        <path d={`M0 0 H1920 V1080 H0 Z M${WX0 + 34} ${WY0} H${WX1 - 34} Q${WX1} ${WY0} ${WX1} ${WY0 + 34} V${SILL - 34} Q${WX1} ${SILL} ${WX1 - 34} ${SILL} H${WX0 + 34} Q${WX0} ${SILL} ${WX0} ${SILL - 34} V${WY0 + 34} Q${WX0} ${WY0} ${WX0 + 34} ${WY0} Z`} fill="#0e1424" fillRule="evenodd" opacity={0.42} />
        <rect x={WX0} y={WY0} width={WX1 - WX0} height={SILL - WY0} rx={34} fill="none" stroke="#141414" strokeWidth={16} />
        <rect x={WX0 - 14} y={WY0 - 14} width={WX1 - WX0 + 28} height={SILL - WY0 + 28} rx={44} fill="none" stroke="#e8c050" strokeWidth={3} opacity={0.35} />
        <rect x={0} y={SILL + 30} width={1920} height={26} fill="#2a2008" />
        <rect x={0} y={SILL + 30} width={1920} height={6} fill="#ffe08a" opacity={0.3} />
        {[860, 960].map((y) => <g key={y}><rect x={0} y={y} width={1920} height={30} fill="#111" /><rect x={0} y={y} width={1920} height={5} fill="#5a5a5a" opacity={0.6} /></g>)}
        {Array.from({ length: 24 }).map((_, i) => <circle key={i} cx={40 + i * 80} cy={SILL + 70} r={4} fill="#3a2a08" />)}
        <path d={`M${WX0 - 60} 0 V1080 M${WX1 + 60} 0 V1080`} stroke="#3a2a08" strokeWidth={4} opacity={0.6} />
        {/* rain sheeting down the outer body */}
        {Array.from({ length: 30 }).map((_, i) => {
          const x0 = rand(i * 17 + 3) * 1920, y0 = ((rand(i * 13) * 1100 + f * (9 + rand(i) * 6)) % 1100) - 40;
          return <path key={i} d={`M${x0} ${y0} l-2 ${30 + rand(i * 2) * 30}`} stroke="#dfe8ff" strokeWidth={2} opacity={0.22} />;
        })}
        <path d={`M${WX0 - 14} ${SILL + 14} H${WX1 + 14}`} stroke="#ffeaa0" strokeWidth={2} opacity={0.4} />
      </svg>
    </>
  );
};

/** chain wrapped twice around the door handle, padlock hanging from the last link; slight swing + glint */
const ChainLock: React.FC<{ x: number; y: number; scale?: number }> = ({ x, y, scale = 1 }) => {
  const f = useCurrentFrame();
  const sw = Math.sin(f * 0.16) * 4 + Math.sin(f * 0.07) * 1.5;
  const glint = ci((f + 40) % 96, [0, 6, 14], [0, 1, 0]);
  const link = (cx: number, cy: number, rot: number, edge: boolean, k: number) => edge
    ? <rect key={k} x={cx - 15} y={cy - 3.5} width={30} height={7} rx={3.5} fill="#8d939e" stroke="#15171c" strokeWidth={2.5} transform={`rotate(${rot} ${cx} ${cy})`} />
    : <g key={k} transform={`rotate(${rot} ${cx} ${cy})`}><ellipse cx={cx} cy={cy} rx={17} ry={10} fill="none" stroke="#15171c" strokeWidth={9} /><ellipse cx={cx} cy={cy} rx={17} ry={10} fill="none" stroke="#a9b0bb" strokeWidth={5} /><path d={`M${cx - 12} ${cy - 6} q12 -6 24 0`} stroke="#eef" strokeWidth={1.6} fill="none" opacity={0.7} /></g>;
  // two wraps: links follow an ellipse around the bar (back half drawn darker, behind the bar)
  const wrapPts = (phase: number) => Array.from({ length: 10 }).map((_, i) => {
    const t = (i / 10) * Math.PI * 2 + phase;
    return { cx: Math.cos(t) * 44, cy: Math.sin(t) * 30, back: Math.sin(t + Math.PI / 2) < 0, rot: (t * 180) / Math.PI + 90, i };
  });
  const W1 = wrapPts(0).map((p) => ({ ...p, cx: p.cx - 26 })), W2 = wrapPts(0.3).map((p) => ({ ...p, cx: p.cx + 26 }));
  const all = [...W1, ...W2];
  const drop = Array.from({ length: 4 }).map((_, i) => ({ cx: 60 + Math.sin((sw * Math.PI) / 180) * i * 24, cy: 34 + i * 22 }));
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        {all.filter((p) => p.back).map((p, k) => <g key={`b${k}`} opacity={0.55}>{link(p.cx, p.cy, p.rot, k % 2 === 1, k)}</g>)}
        {/* handle bar with mounting posts (contact points) */}
        {/* the two door-leaf grab handles, bolted to each leaf; chain binds them together across the seam */}
        {[-1, 1].map((sd) => <g key={sd}>
          <rect x={sd < 0 ? -112 : 12} y={-14} width={100} height={28} rx={12} fill="#7a7f88" stroke="#111" strokeWidth={3} />
          <rect x={sd < 0 ? -112 : 12} y={-14} width={100} height={8} rx={4} fill="#d8dde6" opacity={0.5} />
          {[sd * 18, sd * 104].map((px) => <g key={px}><rect x={px - 7} y={-30} width={14} height={60} rx={4} fill="#4a4e56" stroke="#111" strokeWidth={3} /><circle cx={px} cy={-20} r={3} fill="#9aa0aa" /><circle cx={px} cy={20} r={3} fill="#9aa0aa" /></g>)}
        </g>)}
        {all.filter((p) => !p.back).map((p, k) => link(p.cx, p.cy, p.rot, k % 2 === 1, 100 + k))}
        {drop.map((d, k) => link(d.cx, d.cy, 90 + sw, k % 2 === 0, 200 + k))}
        {/* padlock sized to the links, hanging from the last link */}
        <g transform={`translate(${drop[3].cx} ${drop[3].cy + 10}) rotate(${sw * 1.5})`}>
          <path d="M-20 18 V2 Q-20 -22 0 -22 Q20 -22 20 2 V18" stroke="#15171c" strokeWidth={12} fill="none" />
          <path d="M-20 18 V2 Q-20 -22 0 -22 Q20 -22 20 2 V18" stroke="#b9c0ca" strokeWidth={7} fill="none" />
          <rect x={-34} y={14} width={68} height={58} rx={9} fill="#b08a2a" stroke="#15171c" strokeWidth={3.5} />
          <rect x={-34} y={14} width={68} height={12} rx={6} fill="#e8c460" opacity={0.6} />
          <circle cx={0} cy={40} r={7} fill="#2a1e08" /><rect x={-2.5} y={42} width={5} height={14} fill="#2a1e08" />
          <g transform="translate(-20 22)" opacity={glint}><path d="M0 -16 L3 -3 L16 0 L3 3 L0 16 L-3 3 L-16 0 L-3 -3 Z" fill="#fffbe6" /></g>
        </g>
      </g>
    </svg>
  );
};

export const Scene03: React.FC = () => {
  const f = useCurrentFrame();
  const cW = cue(3, "windows");
  const cD = cue(3, "door");
  const fog = ci(f, [0, sceneDur(3)], [0.3, 0.82]);
  const hh = handheld(f, 0.7, 6);
  const beat = (f - cW) % 14;
  const pound = f > cW + 30 ? Math.max(0, 1 - beat / 5) : 0;
  return (
    <>
      <Shot from={0} to={cW}>
        <Stage cam={{ x: hh.x + ci(f, [0, cW], [300, 360], EZ), y: hh.y + ci(f, [0, cW], [-20, -40]), zoom: ci(f, [0, cW], [1.55, 1.85], EZ), rot: hh.rot }}>
          <BusStreetSet fog={fog} nia niaPound={1} />
          <Plane p={1.3}>
            <Character id="s3alexfg" kind="alex" x={330} y={1640} scale={2.4} crop="closeup" facing={1} lightSide={-1} silhouette={0.6} rim="#ffcf8a" shoulderRadio={false} pose={{ head: -6, eyeY: -0.4 }} />
          </Plane>
          <ForegroundRain />
          <Post />
        </Stage>
      </Shot>
      <Shot from={cW} to={cD}>
        <Stage cam={{ x: hh.x, y: hh.y, zoom: ci(f, [cW, cD], [1.0, 1.08]) }}>
          <BusWindowCloseup fog={fog} wipe={ci(f, [cW + 6, cW + 24], [0, 1], EZ)} pound={pound} />
          <Post tintOpacity={0.08} vignette={0.5} />
        </Stage>
      </Shot>
      <Shot from={cD} to={sceneDur(3) + 1}>
        <Stage cam={{ x: hh.x, y: hh.y - 120, zoom: ci(f, [cD, sceneDur(3)], [1.45, 1.6], EZ) }}>
          <Plane p={1}>
            <AbsoluteFill style={{ background: "#0a0d16" }} />
            <SchoolBus x={-890} y={-60} scale={2.7} fog={fog} wire={false} interior={0.35} />
            <ChainLock x={962} y={318} scale={0.86} />
          </Plane>
          <Rain count={180} opacity={0.3} />
          <Post />
        </Stage>
      </Shot>
      {Array.from({ length: 8 }).map((_, k) => <Sfx key={k} name="thud" at={cW + 42 + k * 14} gain={0.4} />)}
      <Sfx name="chain" at={cD + 2} gain={0.5} />
    </>
  );
};


/* ============ S4 — 2.5D street canyon seen from the Joker's rooftop ============ */
/* real projection: camera 12 m above the street, focal 1600 px, vanishing point (760, 470).
   Building walls run from the top of frame to the bottom edge (Y 1080); street, angled bus, two cruisers with lightbars, lamps with rain cones, wet reflections. */
const S4Canyon: React.FC<{ led: boolean }> = ({ led }) => {
  const f = useCurrentFrame();
  const VX = 760, VY = 470, FOC = 1600, HC = 12;
  const P = (X: number, Y: number, Z: number): [number, number] => [VX + (FOC * X) / Z, VY + (FOC * (HC - Y)) / Z];
  const poly = (pts: [number, number][]) => "M" + pts.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" L") + " Z";
  const quadX = (X: number, z1: number, z2: number, y1: number, y2: number) => poly([P(X, y1, z1), P(X, y2, z1), P(X, y2, z2), P(X, y1, z2)]);
  // buildings per side, far -> near
  const sides = [-1, 1].map((sd) => {
    const out: { z1: number; z2: number; h: number; body: string; seed: number; fe: boolean; crown: number }[] = [];
    let z = 12;
    let k = 0;
    while (z < 520) {
      const len = 22 + rand(sd * 100 + k * 7) * 40;
      const h = 22 + rand(sd * 50 + k * 13) * 60;
      const bodies = ["#2a2234", "#33263a", "#22283a", "#3a2a2e", "#2a2e3e"];
      out.push({ z1: z, z2: z + len, h, body: bodies[Math.floor(rand(sd * 9 + k) * bodies.length)], seed: sd * 1000 + k * 37, fe: rand(sd * 3 + k * 5) > 0.45, crown: Math.floor(rand(sd * 11 + k * 3) * 3) });
      z += len; k++;
    }
    return out.reverse();
  });
  const Wall = ({ sd, b }: { sd: number; b: (typeof sides)[0][0] }) => {
    const X = sd * 14;
    const floors = Math.floor(b.h / 3.6);
    const cols = Math.max(2, Math.floor((b.z2 - b.z1) / 3.4));
    const zMid = (b.z1 + b.z2) / 2;
    const px = (FOC * 1) / zMid; // px per metre at this depth
    const win: React.ReactNode[] = [];
    if (px > 1.6) {
      for (let fl = 0; fl < floors; fl++) {
        for (let c = 0; c < cols; c++) {
          const za = b.z1 + ((c + 0.25) * (b.z2 - b.z1)) / cols, zb = b.z1 + ((c + 0.75) * (b.z2 - b.z1)) / cols;
          const sty = Math.floor(rand(b.seed + 5) * 3); // 0 grid, 1 paired bays, 2 tall strip windows
          if (sty === 1 && c % 3 === 2) continue;
          if (sty === 2 && fl % 2 === 1) continue;
          const ya = 1.2 + fl * 3.6, yb = ya + (sty === 2 ? 5.6 : 2.0);
          const [, ty] = P(X, yb, za);
          if (ty > 1100) continue;
          const [, by2] = P(X, ya, zb);
          if (by2 < -20) continue;
          const lit = rand(b.seed + fl * 31 + c * 7) < 0.08 + rand(b.seed + 9) * 0.3;
          win.push(<path key={`${fl}-${c}`} d={quadX(X, za, zb, ya, yb)} fill={lit ? (rand(b.seed + fl + c) > 0.5 ? "#f2c66a" : "#e8a24a") : "#141826"} opacity={lit ? 0.95 : 0.85} />);
        }
      }
    }
    const fe: React.ReactNode[] = [];
    if (b.fe && px > 3) {
      const zc = b.z1 + (b.z2 - b.z1) * 0.5, w = Math.min(6, (b.z2 - b.z1) * 0.3);
      const Xo = sd * (14 - 1.3);
      for (let fl = 1; fl < Math.min(floors, 12); fl++) {
        const y = fl * 3.6;
        const a1 = P(Xo, y, zc - w), a2 = P(Xo, y, zc + w), w1 = P(X, y, zc - w), w2 = P(X, y, zc + w);
        fe.push(<g key={fl}>
          <path d={poly([w1, a1, a2, w2])} fill="#0b0c12" opacity={0.85} />
          <path d={`M${a1[0]} ${a1[1]} L${a2[0]} ${a2[1]}`} stroke="#5a5e70" strokeWidth={Math.max(1, px * 0.08)} />
          <path d={(() => { const s1 = P(Xo, y, fl % 2 ? zc - w : zc + w), s2 = P(Xo, y + 3.6, fl % 2 ? zc + w : zc - w); return `M${s1[0]} ${s1[1]} L${s2[0]} ${s2[1]}`; })()} stroke="#3a3e4e" strokeWidth={Math.max(1, px * 0.06)} />
        </g>);
      }
    }
    const top = P(X, b.h, b.z1), top2 = P(X, b.h, b.z2);
    const crownH = 4 + b.crown * 3;
    return (
      <g>
        <path d={quadX(X, b.z1, b.z2, 0, b.h)} fill={b.body} stroke="#07080c" strokeWidth={1.5} />
        {/* vertical deco pilasters */}
        {[0.33, 0.66].map((t) => { const zz = b.z1 + (b.z2 - b.z1) * t; const p1 = P(X, 0, zz), p2 = P(X, b.h, zz); return <path key={t} d={`M${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]}`} stroke="#000" strokeOpacity={0.35} strokeWidth={Math.max(1, px * 0.5)} />; })}
        {win}
        {fe}
        {/* stepped deco crown / spire silhouette on top */}
        <path d={poly([top, P(X, b.h + crownH, b.z1 + (b.z2 - b.z1) * 0.2), P(X, b.h + crownH, b.z1 + (b.z2 - b.z1) * 0.8), top2])} fill={shadeHex(b.body)} stroke="#07080c" strokeWidth={1.2} />
        {b.crown === 2 && (() => { const zz = (b.z1 + b.z2) / 2; const s1 = P(X, b.h + crownH, zz - 2), s2 = P(X, b.h + crownH + 14, zz), s3 = P(X, b.h + crownH, zz + 2); return <path d={poly([s1, s2, s3])} fill="#1a1622" />; })()}
        {b.crown === 1 && (() => { const zz = b.z1 + (b.z2 - b.z1) * 0.7; const c = P(X - sd * 2, b.h + crownH + 3, zz); const r = (FOC * 2.4) / zz; return <g><rect x={c[0] - r} y={c[1] - r * 0.9} width={r * 2} height={r * 1.6} fill="#2a1e1a" stroke="#07080c" strokeWidth={1} /><path d={`M${c[0] - r * 1.1} ${c[1] - r * 0.9} L${c[0]} ${c[1] - r * 1.7} L${c[0] + r * 1.1} ${c[1] - r * 0.9} Z`} fill="#1a1210" /><path d={`M${c[0] - r * 0.8} ${c[1] + r * 0.7} V${c[1] + r * 2} M${c[0] + r * 0.8} ${c[1] + r * 0.7} V${c[1] + r * 2}`} stroke="#1a1210" strokeWidth={Math.max(1, r * 0.15)} /></g>; })()}
        {/* rim light from the street glow */}
        <path d={`M${P(X, 0, b.z2)[0]} ${P(X, 0, b.z2)[1]} L${P(X, b.h, b.z2)[0]} ${P(X, b.h, b.z2)[1]}`} stroke="#c88aff" strokeOpacity={0.18} strokeWidth={2} />
      </g>
    );
  };
  // street furniture
  const lampZ = [30, 46, 62, 80, 104, 136, 180, 240];
  const Box = ({ x0, x1, z0, z1, h, rotDeg, top, side, back, children }: { x0: number; x1: number; z0: number; z1: number; h: number; rotDeg: number; top: string; side: string; back: string; children?: (pp: (X: number, Y: number, Z: number) => [number, number]) => React.ReactNode }) => {
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, a = (rotDeg * Math.PI) / 180;
    const R = (X: number, Z: number): [number, number] => [cx + (X - cx) * Math.cos(a) - (Z - cz) * Math.sin(a), cz + (X - cx) * Math.sin(a) + (Z - cz) * Math.cos(a)];
    const pp = (X: number, Y: number, Z: number) => { const [rx, rz] = R(X, Z); return P(rx, Y, rz); };
    const sideX = (cx > 0 ? x0 : x1);
    return (
      <g>
        <path d={poly([pp(x0, 0, z0), pp(x1, 0, z0), pp(x1, 0, z1), pp(x0, 0, z1)])} fill="#000" opacity={0.55} transform="translate(0 4)" />
        <path d={poly([pp(sideX, 0, z0), pp(sideX, h, z0), pp(sideX, h, z1), pp(sideX, 0, z1)])} fill={side} stroke="#07080c" strokeWidth={2} />
        <path d={poly([pp(x0, 0, z0), pp(x0, h, z0), pp(x1, h, z0), pp(x1, 0, z0)])} fill={back} stroke="#07080c" strokeWidth={2} />
        <path d={poly([pp(x0, h, z0), pp(x1, h, z0), pp(x1, h, z1), pp(x0, h, z1)])} fill={top} stroke="#07080c" strokeWidth={2} />
        {children?.(pp)}
      </g>
    );
  };
  const flash = led ? 1 : 0;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="s4asph" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a2032" /><stop offset="1" stopColor="#0a0d16" /></linearGradient>
        <radialGradient id="s4lamp"><stop offset="0" stopColor="#ffe2a6" stopOpacity="0.75" /><stop offset="1" stopColor="#ffe2a6" stopOpacity="0" /></radialGradient>
        <radialGradient id="s4red"><stop offset="0" stopColor="#ff3030" stopOpacity="0.8" /><stop offset="1" stopColor="#ff3030" stopOpacity="0" /></radialGradient>
        <radialGradient id="s4blue"><stop offset="0" stopColor="#3a6cff" stopOpacity="0.8" /><stop offset="1" stopColor="#3a6cff" stopOpacity="0" /></radialGradient>
        <linearGradient id="s4cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe2a6" stopOpacity="0.35" /><stop offset="1" stopColor="#ffe2a6" stopOpacity="0" /></linearGradient>
        <linearGradient id="s4refl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f2c66a" stopOpacity="0.45" /><stop offset="1" stopColor="#f2c66a" stopOpacity="0" /></linearGradient>
      </defs>
      {/* street + sidewalks */}
      <path d={poly([P(-14, 0, 12), P(14, 0, 12), P(14, 0, 600), P(-14, 0, 600)])} fill="#202634" />
      <path d={poly([P(-11, 0, 12), P(11, 0, 12), P(11, 0, 600), P(-11, 0, 600)])} fill="url(#s4asph)" />
      {[-11, 11].map((X) => <path key={X} d={`M${P(X, 0, 24)[0]} ${P(X, 0, 24)[1]} L${P(X, 0, 600)[0]} ${P(X, 0, 600)[1]}`} stroke="#4a5068" strokeWidth={3} />)}
      {Array.from({ length: 22 }).map((_, i) => { const z0 = 26 + i * 9, z1 = z0 + 4.5; return <path key={i} d={poly([P(-0.15, 0, z0), P(0.15, 0, z0), P(0.15, 0, z1), P(-0.15, 0, z1)])} fill="#d9b030" opacity={0.75} />; })}
      {/* wet reflections: soft elongated pools under each lamp (no hard columns) */}
      {lampZ.map((z, i) => [-1, 1].map((sd) => { const [lx, ly] = P(sd * 9.6, 0, z + 1.5); const w = (FOC * 0.9) / z; return <ellipse key={`${i}${sd}`} cx={lx} cy={ly + w * 1.6} rx={w * 0.9} ry={w * 3.2} fill="url(#s4lamp)" opacity={0.35} />; }))}
      {/* building walls, far -> near */}
      {sides.map((list, si) => list.map((b, k) => <Wall key={`${si}-${k}`} sd={si === 0 ? -1 : 1} b={b} />))}
      {/* street lamps: pole, arm, globe, rain cone + pool */}
      {lampZ.map((z) => [-1, 1].map((sd) => {
        const base = P(sd * 11.6, 0, z), topP = P(sd * 11.6, 6.2, z), head = P(sd * 10.4, 6.2, z), pool = P(sd * 10.4, 0, z);
        const r = (FOC * 0.35) / z;
        return (
          <g key={`${z}${sd}`}>
            <ellipse cx={pool[0]} cy={pool[1]} rx={r * 8} ry={r * 2.4} fill="url(#s4lamp)" opacity={0.7} />
            <path d={`M${head[0] - r * 0.6} ${head[1]} L${pool[0] - r * 5} ${pool[1]} L${pool[0] + r * 5} ${pool[1]} L${head[0] + r * 0.6} ${head[1]} Z`} fill="url(#s4cone)" />
            <path d={`M${base[0]} ${base[1]} L${topP[0]} ${topP[1]} L${head[0]} ${head[1]}`} stroke="#0c0e14" strokeWidth={Math.max(1.2, r * 0.5)} fill="none" />
            <circle cx={head[0]} cy={head[1]} r={Math.max(1.5, r)} fill="#fff1cc" />
            <circle cx={head[0]} cy={head[1]} r={r * 5} fill="url(#s4lamp)" />
          </g>
        );
      }))}
      {/* GCPD cruisers flanking the bus (lightbars alternate red/blue, glow on the wet street) */}
      {[{ x0: -7.6, z0: 45, rot: 18 }, { x0: 2.2, z0: 47, rot: -22 }].map((c, i) => {
        const g0 = P(c.x0 + 0.9, 0, c.z0 + 2.2), gr = (FOC * 3.5) / c.z0;
        const red = (i === 0) === led;
        return (
          <g key={i}>
            <ellipse cx={g0[0]} cy={g0[1]} rx={gr * 1.6} ry={gr * 0.5} fill={red ? "url(#s4red)" : "url(#s4blue)"} opacity={0.55} />
            <rect x={g0[0] - gr * 0.25} y={g0[1]} width={gr * 0.5} height={gr * 1.6} fill={red ? "url(#s4red)" : "url(#s4blue)"} opacity={0.35} />
            <Box x0={c.x0} x1={c.x0 + 1.9} z0={c.z0} z1={c.z0 + 4.6} h={0.85} rotDeg={c.rot} top="#14161e" side="#14161e" back="#0e1018">
              {(pp) => <g>
                <path d={poly([pp(c.x0, 0.55, c.z0), pp(c.x0, 0.85, c.z0), pp(c.x0, 0.85, c.z0 + 4.6), pp(c.x0, 0.55, c.z0 + 4.6)])} fill="#e8ecf2" opacity={0.9} />
                <path d={poly([pp(c.x0 + 1.9, 0.55, c.z0), pp(c.x0 + 1.9, 0.85, c.z0), pp(c.x0 + 1.9, 0.85, c.z0 + 4.6), pp(c.x0 + 1.9, 0.55, c.z0 + 4.6)])} fill="#e8ecf2" opacity={0.9} />
                {[c.z0 + 0.9, c.z0 + 3.7].map((wz, wi) => { const a1 = pp(c.x0 + (c.x0 > 0 ? 0 : 1.9), 0, wz); const wr = (FOC * 0.36) / wz; return <circle key={wi} cx={a1[0]} cy={a1[1] - wr * 0.4} r={wr} fill="#050508" stroke="#3a3e4a" strokeWidth={1.5} />; })}
                {(() => { const h1 = pp(c.x0 + 0.4, 0.6, c.z0), h2 = pp(c.x0 + 1.5, 0.6, c.z0); return <g><circle cx={h1[0]} cy={h1[1]} r={3} fill="#ff2a2a" /><circle cx={h2[0]} cy={h2[1]} r={3} fill="#ff2a2a" /></g>; })()}
              </g>}
            </Box>
            <Box x0={c.x0 + 0.15} x1={c.x0 + 1.75} z0={c.z0 + 1.4} z1={c.z0 + 3.2} h={1.45} rotDeg={c.rot} top="#d8dce4" side="#2a3448" back="#3a4a66">
              {(pp) => (
                <g>
                  <path d={poly([pp(c.x0 + 0.15, 1.46, c.z0 + 1.6), pp(c.x0 + 1.75, 1.46, c.z0 + 1.6), pp(c.x0 + 1.75, 1.46, c.z0 + 3.0), pp(c.x0 + 0.15, 1.46, c.z0 + 3.0)])} fill="#1a2030" />
                  <path d={poly([pp(c.x0 + 0.2, 1.5, c.z0 + 2.1), pp(c.x0 + 0.95, 1.5, c.z0 + 2.1), pp(c.x0 + 0.95, 1.5, c.z0 + 2.4), pp(c.x0 + 0.2, 1.5, c.z0 + 2.4)])} fill={led ? "#ff3a3a" : "#5a1414"} />
                  <path d={poly([pp(c.x0 + 0.95, 1.5, c.z0 + 2.1), pp(c.x0 + 1.7, 1.5, c.z0 + 2.1), pp(c.x0 + 1.7, 1.5, c.z0 + 2.4), pp(c.x0 + 0.95, 1.5, c.z0 + 2.4)])} fill={led ? "#14204a" : "#4a7aff"} />
                  {(() => { const lr = pp(c.x0 + 0.55, 1.6, c.z0 + 2.25), lb = pp(c.x0 + 1.35, 1.6, c.z0 + 2.25); return <g><circle cx={lr[0]} cy={lr[1]} r={gr * 0.7} fill="url(#s4red)" opacity={led ? 0.9 : 0.15} /><circle cx={lb[0]} cy={lb[1]} r={gr * 0.7} fill="url(#s4blue)" opacity={led ? 0.15 : 0.9} /></g>; })()}
                </g>
              )}
            </Box>
          </g>
        );
      })}
      {/* the school bus, pulled over at an angle — readable size, windows, rear emergency door, flashing red warning light */}
      {(() => {
        const x0 = -3.4, z0 = 40, rot = 14;
        return (
          <g>
            <ellipse cx={P(-2.1, 0, 46)[0]} cy={P(-2.1, 0, 46)[1]} rx={160} ry={40} fill="url(#s4lamp)" opacity={0.35} />
            <Box x0={x0} x1={x0 + 2.55} z0={z0} z1={z0 + 11} h={3.1} rotDeg={rot} top="#e0b23a" side="#c9981e" back="#b8860e">
              {(pp) => (
                <g>
                  {/* side windows */}
                  {Array.from({ length: 7 }).map((_, i) => { const za = z0 + 1.2 + i * 1.35, zb = za + 1.0; return <path key={i} d={poly([pp(x0 + 2.55, 1.75, za), pp(x0 + 2.55, 2.75, za), pp(x0 + 2.55, 2.75, zb), pp(x0 + 2.55, 1.75, zb)])} fill={i === 3 ? "#ffe8b0" : "#2a3048"} stroke="#141008" strokeWidth={1.5} />; })}
                  <path d={`M${pp(x0 + 2.55, 1.2, z0)[0]} ${pp(x0 + 2.55, 1.2, z0)[1]} L${pp(x0 + 2.55, 1.2, z0 + 11)[0]} ${pp(x0 + 2.55, 1.2, z0 + 11)[1]}`} stroke="#141008" strokeWidth={4} />
                  {/* black rub rails along the side (classic school-bus read) */}
                  {[0.55, 0.95, 1.55].map((ry) => <path key={ry} d={`M${pp(x0 + 2.55, ry, z0)[0]} ${pp(x0 + 2.55, ry, z0)[1]} L${pp(x0 + 2.55, ry, z0 + 11)[0]} ${pp(x0 + 2.55, ry, z0 + 11)[1]}`} stroke="#141008" strokeWidth={ry === 0.95 ? 3 : 2} />)}
                  {/* wheels in dark arches */}
                  {[z0 + 2.2, z0 + 8.6].map((wz) => { const a1 = pp(x0 + 2.55, 0.5, wz); const wr = (FOC * 0.55) / wz; return <g key={wz}><ellipse cx={a1[0]} cy={a1[1]} rx={wr * 0.55} ry={wr} fill="#0a0806" /><ellipse cx={a1[0]} cy={a1[1]} rx={wr * 0.28} ry={wr * 0.5} fill="#3a3a40" stroke="#0a0a0e" strokeWidth={1.5} /></g>; })}
                  {/* roof: rounded edge highlight + marker lamps */}
                  <path d={`M${pp(x0 + 2.55, 3.1, z0)[0]} ${pp(x0 + 2.55, 3.1, z0)[1]} L${pp(x0 + 2.55, 3.1, z0 + 11)[0]} ${pp(x0 + 2.55, 3.1, z0 + 11)[1]}`} stroke="#fff0b0" strokeWidth={3} opacity={0.55} />
                  {[0.25, 2.3].map((mx) => { const m = pp(x0 + mx, 3.12, z0 + 0.15); return <circle key={mx} cx={m[0]} cy={m[1]} r={3} fill="#ffb030" />; })}
                  {/* rear: black bumper, split rear windows, SCHOOL BUS header */}
                  <path d={poly([pp(x0 - 0.05, 0.2, z0 - 0.05), pp(x0 - 0.05, 0.55, z0 - 0.05), pp(x0 + 2.6, 0.55, z0 - 0.05), pp(x0 + 2.6, 0.2, z0 - 0.05)])} fill="#0e0c0a" stroke="#000" strokeWidth={1.5} />
                  {[[0.15, 0.7], [1.85, 2.4]].map(([a0, a1], wi) => <path key={wi} d={poly([pp(x0 + a0, 1.8, z0), pp(x0 + a0, 2.6, z0), pp(x0 + a1, 2.6, z0), pp(x0 + a1, 1.8, z0)])} fill="#2a3048" stroke="#141008" strokeWidth={2} />)}
                  {(() => { const t = pp(x0 + 1.27, 2.92, z0); const sc = (FOC * 0.012) / z0; return <g transform={`translate(${t[0]} ${t[1]}) scale(${sc}) rotate(${-4})`}><rect x={-60} y={-12} width={120} height={20} fill="#141008" /><text x={0} y={4} textAnchor="middle" fontFamily="Arial Black, Arial" fontWeight={900} fontSize={15} fill="#f2c040" letterSpacing={1}>SCHOOL BUS</text></g>; })()}
                  {/* rear: emergency door + lamps */}
                  <path d={poly([pp(x0 + 0.8, 0.4, z0), pp(x0 + 0.8, 2.8, z0), pp(x0 + 1.75, 2.8, z0), pp(x0 + 1.75, 0.4, z0)])} fill="#a87a10" stroke="#141008" strokeWidth={2} />
                  <path d={poly([pp(x0 + 0.9, 1.8, z0), pp(x0 + 0.9, 2.7, z0), pp(x0 + 1.65, 2.7, z0), pp(x0 + 1.65, 1.8, z0)])} fill="#2a3048" />
                  {(() => { const l1 = pp(x0 + 0.3, 2.85, z0), l2 = pp(x0 + 2.25, 2.85, z0); return <g><circle cx={l1[0]} cy={l1[1]} r={led ? 6 : 3.5} fill={led ? "#ff2a2a" : "#6a1010"} /><circle cx={l2[0]} cy={l2[1]} r={led ? 3.5 : 6} fill={led ? "#6a1010" : "#ff2a2a"} /><circle cx={led ? l1[0] : l2[0]} cy={l1[1]} r={30} fill="url(#s4red)" opacity={0.7} /></g>; })()}
                  {/* the wire on the door handle */}
                  {(() => { const h1 = pp(x0 + 1.75, 1.3, z0), h2 = pp(x0 + 2.55, 1.0, z0 + 0.6); return <path d={`M${h1[0]} ${h1[1]} Q${(h1[0] + h2[0]) / 2} ${h1[1] + 10} ${h2[0]} ${h2[1]}`} stroke="#d0d0d0" strokeWidth={1.6} fill="none" opacity={0.8} />; })()}
                  <path d={poly([pp(x0, 3.1, z0 + 0.4), pp(x0 + 2.55, 3.1, z0 + 0.4), pp(x0 + 2.55, 3.1, z0 + 0.8), pp(x0, 3.1, z0 + 0.8)])} fill="#f4d470" opacity={0.6} />
                </g>
              )}
            </Box>
          </g>
        );
      })()}
      <rect x={0} y={0} width={1920} height={1080} fill="#2a1a3a" opacity={0.12 + flash * 0.02} />
    </svg>
  );
};
const shadeHex = (c: string) => { const n = parseInt(c.slice(1), 16); const r = ((n >> 16) & 255) * 0.7, g = ((n >> 8) & 255) * 0.7, b = (n & 255) * 0.7; return `rgb(${r | 0},${g | 0},${b | 0})`; };

/* ============ Scene 4 — Wire on locked bus; Joker watches unseen ============ */
export const Scene04: React.FC = () => {
  const f = useCurrentFrame();
  const cS = cue(4, "somewhere");
  const cJ = cue(4, "joke");
  const cJk = cue(4, "joker");
  const cWt = cue(4, "watching");
  const hh = handheld(f, 0.6, 8);
  const led = f % 24 < 12;
  return (
    <>
      <Shot from={0} to={cS}>
        <Stage cam={{ x: hh.x, y: hh.y, zoom: ci(f, [0, cS], [1.0, 1.1]) }}>
          <AbsoluteFill style={{ filter: "blur(6px)", transform: "scale(1.2) translateX(-120px)" }}>
            <BusStreetSet fog={0.6} wire led={led} rain={0.6} />
          </AbsoluteFill>
          <Plane p={1}>
            <Character id="s4bat" kind="batman" x={1180} y={1640} scale={2.9} crop="closeup" facing={-1} lightSide={-1} silhouette={0.3} capeWind={0.8} glowEyes={0.9} prop="radio"
              pose={{ armNear: [62 - 50 * ci(f, [14, 34], [0, 1], EZ), 104 + 26 * ci(f, [14, 34], [0, 1], EZ)], handNear: "grip", head: 4 - 8 * ci(f, [16, 30], [0, 1], EZ), eyeX: ci(f, [16, 30], [0.2, -0.6]), brow: -1, blink: blinkAt(f, 100, 30), bob: breathe(f, 0.25, 2), lean: 4 - 3 * ci(f, [30, 60], [0, 1], EZ) }} />
            <Glow x={560} y={430} r={120} color="255,40,40" opacity={led ? 0.35 : 0.08} />
          </Plane>
          <ForegroundRain />
          <Post tintOpacity={0.2} vignette={0.7} />
        </Stage>
      </Shot>
      <Shot from={cS} to={sceneDur(4) + 1}>
        <Stage cam={{ x: ci(f, [cS, sceneDur(4)], [-30, 30]), y: 0, zoom: ci(f, [cS, sceneDur(4)], [1.05, 1.12]) }}>
          <Plane p={0.2}><Sky variant="storm" seed={8} horizonY={480} /></Plane>
          <Plane p={0.35}><DecoSkyline seed={21} baseY={560} hMin={120} hMax={300} haze={0.55} litP={0.2} /></Plane>
          <Plane p={0.6}><S4Canyon led={led} /></Plane>
          <Plane p={0.8}><Rain count={160} opacity={0.25} speed={30} len={30} /></Plane>
          <Plane p={1.2}>
            {/* rooftop parapet he leans on */}
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <defs><linearGradient id="s4par" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2a44" /><stop offset="1" stopColor="#0c0812" /></linearGradient></defs>
              <path d="M980 900 L1960 860 L1960 1100 L980 1100 Z" fill="url(#s4par)" />
              <path d="M980 900 L1960 860" stroke="#b47ad6" strokeWidth={3} opacity={0.45} />
            </svg>
            <JokerProfile x={1360 - 30 * ci(f, [cS, sceneDur(4)], [0, 1])} y={470 + 10 * Math.sin(f * 0.06)} scale={1.05 + 0.08 * ci(f, [cS, sceneDur(4)], [0, 1], EZ)}
              turn={ci(f, [cWt, cWt + 14], [0, 1], EZ)}
              card={ci(f, [cJk + 6, cJk + 14], [0, 1], EZ)}
              laugh={Math.max(ci(f, [cJk + 16, cJk + 22, cJk + 40, cJk + 46], [0, 0.5, 0.5, 0]), ci(f, [cJ - 4, cJ + 4], [0, 1]))} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <path d="M940 930 L1960 884 L1960 1100 L940 1100 Z" fill="#07050a" />
              <path d="M940 930 L1960 884" stroke="#7affa0" strokeWidth={2} opacity={0.25} />
            </svg>
            <Glow x={1460} y={480} r={260} color="80,200,90" opacity={0.12} />
          </Plane>
          <Post tintColor="#3a1a52" tintOpacity={0.22} vignette={0.75} />
        </Stage>
      </Shot>
      <Sfx name="thunder" at={cJk - 2} gain={0.35} />
      <Sfx name="whoosh" at={cJk + 4} gain={0.2} />
    </>
  );
};

/* ============ Scene 5 — Six days earlier: rookie Alex ============ */
export const Scene05: React.FC = () => {
  const f = useCurrentFrame();
  const cR = cue(5, "rookie");
  const cB = cue(5, "badge");
  const polish = Math.sin(f * 0.35);
  const glint = ci(f, [cB, cB + 6, cB + 18], [0, 1, 0]);
  const S = 2.3, X = 760, Y = 1400; // cowboy shot: frame cuts mid-thigh, never at the knee/shin
  const [bx, by] = anchor("alex", X, Y, S, 1, "badge");
  const rub: [number, number] = [bx + 34 + polish * 10, by + 46 + Math.cos(f * 0.35) * 6];
  return (
    <Stage cam={{ x: ci(f, [0, sceneDur(5)], [0, 30]), y: 0, zoom: ci(f, [0, sceneDur(5)], [1.0, 1.08]) }}>
      <Plane p={0.2}><Sky variant="dusk" seed={5} horizonY={760} moon={[1500, 220, 36]} /></Plane>
      <Plane p={0.35}><DecoSkyline toBottom seed={31} baseY={760} hMin={300} hMax={640} haze={0.4} hazeColor="#8a5a6a" light="#c08a7a" body="#2a1a2a" litP={0.3} /></Plane>
      <Plane p={0.55}><DecoSkyline toBottom seed={33} baseY={820} hMin={200} hMax={420} haze={0.15} hazeColor="#5a3a50" light="#8a5a5a" body="#1a1018" litP={0.35} rimSide="right" /></Plane>
      <Plane p={1}>
        <Character id="s5alex" kind="alex" x={X} y={Y} scale={S} crop="thigh" facing={1} lightSide={1} rim="#ffb080" nightTint={0.12} silhouette={0.05}
          reachNear={rub} pose={{ handNear: "fist", armFar: [-8, 14], head: -4 + ci(f, [cB - 10, cB], [0, 6]), smile: 0.45, brow: 0.3, eyeY: ci(f, [cB - 10, cB], [-0.3, 0.8]), blink: blinkAt(f, 70, 30), bob: breathe(f, 0.45, 1.5) }} />
        {glint > 0 && (
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}>
            <g transform={`translate(${bx} ${by}) rotate(${f * 4}) scale(${glint})`}>
              <path d="M0 -70 L8 -8 L70 0 L8 8 L0 70 L-8 8 L-70 0 L-8 -8 Z" fill="#fff6d0" />
              <circle r={22} fill="#fff6d0" opacity={0.6} />
            </g>
          </svg>
        )}
      </Plane>
      <Plane p={1.1}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <defs><linearGradient id="s5par" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6a4450" /><stop offset="1" stopColor="#1a0e14" /></linearGradient></defs>
          <rect x={-200} y={930} width={2400} height={200} fill="url(#s5par)" />
          <rect x={-200} y={922} width={2400} height={14} fill="#a87a7a" opacity={0.7} />
          {Array.from({ length: 16 }).map((_, i) => <path key={i} d={`M${i * 140 - 60} 960 l20 -20 l20 20 v100 h-40 Z`} fill="#2a1820" opacity={0.7} />)}
          <path d="M1480 930 V640 M1440 700 H1520 M1460 760 H1500" stroke="#1a0e14" strokeWidth={8} />
        </svg>
      </Plane>
      <Post tintColor="#a05030" tintOpacity={0.14} vignette={0.5} />
      <Caption text="SIX DAYS EARLIER" from={2} to={Math.max(cR + 18, 2 + 36)} align="center" y={120} size={54} />
      <TimeJump at={0} dur={12} />
      <Sfx name="whoosh" at={0} gain={0.45} />
    </Stage>
  );
};

/* ============ Scene 6 — Father locks shop; lamp in window ============ */
export const Scene06: React.FC = () => {
  const f = useCurrentFrame();
  const cA = cue(6, "apartment");
  const cE = cue(6, "every");
  const cL = cue(6, "locked");
  const cT = cue(6, "twice");
  const cLamp = cue(6, "lamp");
  const turn1 = ci(f, [cL, cL + 6, cL + 12], [0, 1, 0]);
  const turn2 = ci(f, [cT - 4, cT + 2, cT + 8, cT + 14], [0, 1, 0, 1]);
  // blocking: lock door (IK on the lock) -> walk with real travel -> reach the lamp -> contact -> filament flicker on
  const wS = cT + 12, wE = cLamp + 8;
  const DX0 = 1250, DX1 = 560, DS = 1.6, DY = 1000; // feet on the plank floor, fully in frame
  const dx = ci(f, [wS, wE], [DX0, DX1], Easing.inOut(Easing.sin));
  const walking = f >= wS && f < wE;
  const lampPt: [number, number] = [349, 654]; // push switch on the brass lamp base
  const reachL = ci(f, [wE, wE + 8], [0, 1], EZ);
  const touch = wE + 8;
  const lampOn = f < touch ? 0 : ci(f - touch, [0, 1, 2, 3, 4, 5, 6, 8], [0, 0.9, 0.15, 1, 0.4, 1, 0.75, 1]);
  const lockPt: [number, number] = [1440, 600 + (turn1 + turn2) * 6];
  return (
    <>
      <Shot from={0} to={cE}>
        <Stage cam={{ x: 0, y: ci(f, [0, cA, cE], [90, 40, 0], Easing.inOut(Easing.cubic)), zoom: ci(f, [0, cE], [1.0, 1.05]) }}>
          <Plane p={0.2}><Sky variant="night" seed={6} moon={[300, 160, 40]} horizonY={760} /></Plane>
          <Plane p={0.35}><DecoSkyline seed={41} baseY={700} hMin={200} hMax={500} haze={0.5} /></Plane>
          <Plane p={0.7}><StreetFacades seed={9} baseY={820} litP={0.25} heightMin={600} heightMax={760} fireEscapes /></Plane>
          <Plane p={0.85}><ShopFront baseY={830} lamp={0} upstairs={1} sign={1} /></Plane>
          <Plane p={1}><WetStreet horizonY={830} curbY={870} reflections={[{ x: 960, color: "#f5c66a", w: 420, strength: 0.5 }, { x: 650, color: "#ffcf8a", w: 100, strength: 0.5 }]} seed={4} /></Plane>
          <Plane p={1}>
            <Character id="s6alex" kind="alex" x={ci(f, [0, cA], [520, 640], EZ)} y={985} scale={1.0} facing={1} lightSide={1} nightTint={0.2} rim="#ffcf8a" shoulderRadio
              pose={f < cA - 20 ? { ...walkDist(ci(f, [0, cA], [520, 640], EZ) - 520, "alex", 1.0, 0.7), head: -6 } : { head: -16, eyeY: -1, smile: 0.25 }} />
          </Plane>
          <Plane p={1.2}><Rain count={120} opacity={0.2} /></Plane>
          <Post />
          <Caption text="ALEX REYES" from={4} to={cA + 10} x={120} y={880} />
        </Stage>
      </Shot>
      <Shot from={cE} to={sceneDur(6) + 1}>
        <Stage cam={{ x: ci(f, [cE, cLamp, sceneDur(6)], [0, 0, 120]), y: 0, zoom: ci(f, [cE, sceneDur(6)], [1.0, 1.1]) }}>
          <Plane p={0.9}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <defs>
                <linearGradient id="s6wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a1c12" /><stop offset="1" stopColor="#120c08" /></linearGradient>
                <linearGradient id="s6night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d1a33" /><stop offset="1" stopColor="#24395e" /></linearGradient>
                <radialGradient id="s6lamp"><stop offset="0" stopColor="#ffe6a8" stopOpacity="0.95" /><stop offset="0.3" stopColor="#ffb456" stopOpacity="0.45" /><stop offset="1" stopColor="#ff8a2a" stopOpacity="0" /></radialGradient>
              </defs>
              <rect width="1920" height="1080" fill="url(#s6wall)" />
              {/* front door with glass: street outside */}
              <rect x={1080} y={150} width={420} height={800} fill="#1a110a" />
              <rect x={1120} y={190} width={340} height={420} fill="url(#s6night)" />
              {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={1130 + i * 42} y={380 - rand(i) * 120} width={36} height={240} fill="#0a1222" />)}
              {Array.from({ length: 18 }).map((_, i) => <rect key={i} x={1135 + rand(i * 3) * 320} y={320 + rand(i * 7) * 260} width={5} height={7} fill="#f2cf7a" opacity={0.7} />)}
              <text x={1290} y={260} textAnchor="middle" fontFamily="Georgia" fontSize={30} fill="#d9b070" opacity={0.6} letterSpacing={4}>REYES REPAIR</text>
              <rect x={1120} y={640} width={340} height={280} fill="#24170e" stroke="#120a06" strokeWidth={6} />
              <rect x={1430} y={560} width={40} height={60} rx={6} fill="#b89040" />
              <circle cx={1450} cy={600} r={7} fill="#1a110a" />
              {/* window sill with lamp (left) */}
              <rect x={160} y={260} width={600} height={420} fill="url(#s6night)" />
              <rect x={160} y={260} width={600} height={420} fill="none" stroke="#1a0f08" strokeWidth={18} />
              {Array.from({ length: 13 }).map((_, i) => <rect key={`lw${i}`} x={168 + i * 46} y={470 - rand(i + 40) * 170} width={40} height={220 + rand(i + 40) * 170} fill="#0a1222" />)}
              {Array.from({ length: 30 }).map((_, i) => <rect key={`lwl${i}`} x={172 + rand(i * 5 + 1) * 580} y={360 + rand(i * 11 + 2) * 300} width={5} height={7} fill="#f2cf7a" opacity={0.65} />)}
              <rect x={454} y={260} width={12} height={420} fill="#1a0f08" />
              <rect x={160} y={464} width={600} height={12} fill="#1a0f08" />
              {Array.from({ length: 40 }).map((_, i) => <rect key={`ws${i}`} x={i * 48} y={0} width={2} height={950} fill="#000" opacity={0.12} />)}
              <rect x={140} y={680} width={640} height={24} fill="#3a2414" />
              <g transform="translate(330 680)">
                <circle cy={-50} r={420} fill="url(#s6lamp)" opacity={lampOn} />
                <BrassDomeLamp on={lampOn} s={1.05} y={0} />
              </g>
              {/* plank floor in perspective + skirting board (feet stand on it, contact shadow drawn by the rig) */}
              <rect x={-200} y={930} width={2320} height={400} fill="#2a1a10" />
              <rect x={-200} y={918} width={2320} height={14} fill="#1a0f08" />
              {Array.from({ length: 26 }).map((_, i) => <path key={`fp${i}`} d={`M${-300 + i * 100} 932 L${-900 + i * 148} 1080`} stroke="#120a06" strokeWidth={3} opacity={0.7} />)}
              {[968, 1018].map((yy) => <path key={yy} d={`M-200 ${yy} H2120`} stroke="#120a06" strokeWidth={2} opacity={0.5} />)}
              <ellipse cx={330} cy={990} rx={420} ry={60} fill="#ffb456" opacity={0.12 * lampOn} />
            </svg>
          </Plane>
          <Plane p={1}>
            <Character id="s6dad" kind="father" x={dx} y={DY} scale={DS} facing={f < wS ? 1 : -1} lightSide={-1} nightTint={0.12} rim="#ffb46a"
              prop={f < wS ? "key" : "none"}
              reachNear={f < wS ? lockPt : f >= wE ? mixP(anchor("father", dx, DY, DS, -1, "waist"), lampPt, reachL) : undefined}
              pose={f < wS
                ? { handNear: "grip", head: (turn1 + turn2) * 3, brow: -0.2, blink: blinkAt(f, 60), bob: breathe(f) }
                : walking
                ? { ...walkDist(DX0 - dx, "father", DS, 0.8), head: 2 }
                : { handNear: reachL > 0.8 ? "grip" : "open", head: 6, smile: 0.2 * lampOn, eyeY: 0.6, blink: blinkAt(f, 60) }} />
          </Plane>
          <Post tintColor="#3a2010" tintOpacity={0.12 + 0.1 * lampOn} vignette={0.6} />
        </Stage>
      </Shot>
      <Sfx name="lock" at={cL + 4} gain={0.5} />
      <Sfx name="lock" at={cT} gain={0.45} />
      {Array.from({ length: 3 }).map((_, k) => <Sfx key={k} name="step" at={cT + 16 + k * 11} gain={0.3} />)}
      <Sfx name="switch" at={cLamp + 16} gain={0.5} />
    </>
  );
};

/* ============ Scene 7 — Father explains lamp as marker of home ============ */
export const Scene07: React.FC = () => {
  const f = useCurrentFrame();
  const cNo = cue(7, "no");
  const cBut = cue(7, "but");
  const shakeHead = f > cNo && f < cNo + 20 ? Math.sin((f - cNo) * 0.6) * 5 : 0;
  const pat = ci(f, [cNo + 8, cNo + 22], [0, 1], EZ);
  const S7S = 1.4, S7Y = 1000; // same scale for both (L7: child 320 vs adult 380 rig units)
  const kidSh = anchor("alexYoung", 800, S7Y, S7S, 1, "shoulderNear");
  const dadRest = anchor("father", 1010, S7Y, S7S, -1, "waist");
  const dadHand = mixP([dadRest[0] - 40, dadRest[1] + 30], [kidSh[0] + 4, kidSh[1] - 6], pat);
  return (
    <>
      <Shot from={0} to={cBut}>
        <Stage cam={{ x: ci(f, [0, cBut], [-20, 20]), y: 0, zoom: ci(f, [0, cBut], [1.0, 1.06]) }}>
          <Plane p={0.8}><ShopInterior lamp={1} /></Plane>
          <Plane p={1}>
            <Character id="s7kid" kind="alexYoung" x={800} y={S7Y} scale={S7S} facing={1} lightSide={1} nightTint={0.08} rim="#ffb46a"
              reachNear={f < cNo + 4 ? [1290, 560] : undefined}
              pose={{ head: -14, brow: -0.4, eyeY: -1, armNear: [10, 14], handNear: "point", blink: blinkAt(f, 70, 10), bob: breathe(f), smile: -0.1 + 0.4 * pat }} />
            <Character id="s7dad" kind="father" x={1010} y={S7Y} scale={S7S} facing={-1} lightSide={1} nightTint={0.08} rim="#ffb46a"
              reachNear={pat > 0 ? dadHand : undefined}
              pose={{ head: 4 + shakeHead, brow: f > cNo ? 0.2 : -0.2, smile: f > cNo + 20 ? 0.35 : 0, eyeY: 0.5, lean: -9 * pat, armNear: [10, 16], handNear: "open", armFar: [-6, 20], blink: blinkAt(f, 80, 40), bob: breathe(f, 0.35) }} />
          </Plane>
          <Post tintColor="#5a2a10" tintOpacity={0.1} vignette={0.55} />
        </Stage>
      </Shot>
      <Shot from={cBut} to={sceneDur(7) + 1}>
        <Stage cam={{ x: 0, y: ci(f, [cBut, sceneDur(7)], [0, 40]), zoom: ci(f, [cBut, sceneDur(7)], [1.0, 1.35], Easing.inOut(Easing.cubic)) }}>
          <Plane p={0.2}><Sky variant="night" seed={9} horizonY={700} /></Plane>
          <Plane p={0.4}><DecoSkyline seed={51} baseY={600} hMin={220} hMax={500} haze={0.5} litP={0.06} /></Plane>
          <Plane p={0.7}><StreetFacades seed={13} baseY={820} litP={0.04} heightMin={620} heightMax={780} shopFronts={false} dark={0.25} /></Plane>
          <Plane p={0.85}><ShopFront baseY={830} lamp={1} upstairs={0} sign={0} scale={0.72} doorLight={0} /></Plane>
          <Plane p={1}><WetStreet horizonY={830} curbY={870} reflections={[{ x: 1080, color: "#ffb456", w: 120 }]} seed={7} /></Plane>
          <Plane p={1.2}><Rain count={100} opacity={0.18} /></Plane>
          <Post />
        </Stage>
      </Shot>
    </>
  );
};

/* ============ Scene 8 — Graduation flashlight handoff ============ */
const FlashlightCloseup: React.FC<{ beam: number; shake: number; sw: number }> = ({ beam, shake, sw }) => {
  const f = useCurrentFrame();
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="flM" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a4e58" /><stop offset="0.3" stopColor="#c9ced8" /><stop offset="0.5" stopColor="#8a909c" /><stop offset="1" stopColor="#2a2e36" /></linearGradient>
        <linearGradient id="flBeam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff4cc" stopOpacity="0.8" /><stop offset="1" stopColor="#fff4cc" stopOpacity="0" /></linearGradient>
        <linearGradient id="flSkin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d49a70" /><stop offset="1" stopColor="#7a4a30" /></linearGradient>
        <radialGradient id="flBg" cx="0.3" cy="0.4"><stop offset="0" stopColor="#3a3a52" /><stop offset="1" stopColor="#07080e" /></radialGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#flBg)" />
      <g style={{ mixBlendMode: "screen" }}>{Array.from({ length: 22 }).map((_, i) => <circle key={i} cx={(((rand(i) * 2100 - f * (0.6 + rand(i * 2) * 1.6)) % 2100) + 2100) % 2100 - 90} cy={120 + rand(i * 3) * 420 + Math.sin(f * 0.04 + i) * 8} r={18 + rand(i * 5) * 46} fill="#ffcf70" opacity={0.1 + rand(i * 9) * 0.18} />)}</g>
      <g transform={`translate(${860 + Math.sin(f * 0.05) * 14} ${560 + Math.sin(f * 0.083) * 8}) rotate(${-8 + Math.sin(f * 0.04) * 2.5 + shake * Math.sin(f * 2.2) * 4})`}>
        {/* sleeve: dress-uniform cuff + forearm running off the bottom-left edge of the frame (never ends mid-air) */}
        <path d="M-360 -70 L-2000 -260 L-2000 520 L-330 170 C-300 100 -310 0 -360 -70 Z" fill="#1d2b52" stroke="#0a0a0e" strokeWidth={5} strokeLinejoin="round" />
        <path d="M-360 -70 L-2000 -260 L-2000 -170 L-340 -20 Z" fill="#33467a" opacity={0.55} />
        <path d="M-420 120 L-2000 420" stroke="#0e1530" strokeWidth={40} opacity={0.5} />
        <path d="M-392 -62 L-366 168" stroke="#d9b24a" strokeWidth={14} />
        <path d="M-436 -66 L-410 176" stroke="#d9b24a" strokeWidth={6} opacity={0.85} />
        {/* back layer: wrist + palm heel behind/below the barrel, thumb base */}
        {/* wrist (in line with the barrel) + slim palm heel just under the barrel — no ball/disc below the grip */}
        <path d="M-372 -54 C-320 -66 -260 -66 -200 -58 L-40 30 C-20 60 -24 96 -54 110 C-140 124 -260 130 -356 150 C-372 90 -380 20 -372 -54 Z" fill="url(#flSkin)" stroke="#0a0a0e" strokeWidth={4} strokeLinejoin="round" />
        <path d="M-330 128 Q-200 120 -70 104" stroke="#5a3420" strokeWidth={2.5} fill="none" opacity={0.5} />
        {beam > 0 && <path d="M330 -40 L1500 -420 L1500 420 L330 40 Z" fill="url(#flBeam)" opacity={beam} style={{ mixBlendMode: "screen" }} />}
        <rect x={-460} y={-58} width={680} height={116} rx={18} fill="url(#flM)" stroke="#0a0a0e" strokeWidth={5} />
        {Array.from({ length: 22 }).map((_, i) => <path key={i} d={`M${-440 + rand(i) * 640} ${-50 + rand(i * 3) * 100} l${10 + rand(i * 5) * 40} ${(rand(i * 7) - 0.5) * 12}`} stroke="#eef" strokeWidth={1.3} opacity={0.35} />)}
        {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={-420 + i * 26} y={-58} width={6} height={116} fill="#000" opacity={0.15} />)}
        <path d="M220 -80 H330 V80 H220 Z" fill="url(#flM)" stroke="#0a0a0e" strokeWidth={5} />
        <ellipse cx={330} cy={0} rx={18} ry={78} fill={beam > 0 ? "#fff7d8" : "#5a5c62"} stroke="#0a0a0e" strokeWidth={4} />
        {/* loose switch */}
        <rect x={-40} y={-74} width={90} height={20} rx={6} fill="#1a1a1e" />
        <rect x={-30 + sw * 40} y={-82} width={30} height={22} rx={5} fill="#3a3a40" stroke="#0a0a0e" strokeWidth={3} />
        {/* thumb lies along the top of the barrel and presses the switch (from behind the barrel's top edge) */}
        <path d={`M-210 -46 C-160 -66 ${-90 + sw * 20} -76 ${-30 + sw * 34} -84 C${-12 + sw * 34} -88 ${8 + sw * 34} -84 ${8 + sw * 34} -72 C${6 + sw * 34} -62 ${-20 + sw * 34} -58 ${-60 + sw * 20} -54 C-120 -48 -170 -40 -210 -30 Z`} fill="url(#flSkin)" stroke="#0a0a0e" strokeWidth={4} strokeLinejoin="round" />
        <path d={`M${-26 + sw * 34} -86 C${-10 + sw * 34} -90 ${4 + sw * 34} -86 ${5 + sw * 34} -76 C${-6 + sw * 34} -78 ${-18 + sw * 34} -78 ${-28 + sw * 34} -76 Z`} fill="#e9c4a6" stroke="#5a3420" strokeWidth={1.5} />
        <path d={`M-120 -62 q10 4 20 0`} stroke="#5a3420" strokeWidth={2} fill="none" opacity={0.6} />
        {/* four tapered fingers wrap from under the barrel up its near face; index (front) longest-but-one, middle longest, pinky shortest */}
        {[
          { x: -80, w: 48, top: -30 },
          { x: -134, w: 50, top: -40 },
          { x: -188, w: 47, top: -30 },
          { x: -238, w: 41, top: -10 },
        ].map((q, i) => {
          const b0 = 124, mid = (b0 + q.top) / 2 + 6;
          const wl = q.w / 2, wt = q.w * 0.4;
          return (
            <g key={i}>
              <path d={`M${q.x - wl} ${b0} C${q.x - wl - 4} ${mid + 20} ${q.x - wt - 2} ${q.top + 30} ${q.x - wt} ${q.top + 14} Q${q.x - 2} ${q.top - 10} ${q.x + wt} ${q.top + 12} C${q.x + wt + 3} ${q.top + 30} ${q.x + wl + 3} ${mid + 20} ${q.x + wl} ${b0} Z`} fill="url(#flSkin)" stroke="#0a0a0e" strokeWidth={4} strokeLinejoin="round" />
              <path d={`M${q.x - wl * 0.7} ${mid + 6} q${wl * 0.7} 7 ${wl * 1.4} 0`} stroke="#5a3420" strokeWidth={2.4} fill="none" opacity={0.7} />
              <path d={`M${q.x - wt * 0.8} ${q.top + 30} q${wt * 0.8} 5 ${wt * 1.6} 0`} stroke="#5a3420" strokeWidth={2} fill="none" opacity={0.55} />
              <path d={`M${q.x + wt * 0.2} ${q.top + 6} Q${q.x + wt * 0.85} ${q.top + 16} ${q.x + wl * 0.8} ${b0 - 10}`} stroke="#f0caa8" strokeWidth={3} fill="none" opacity={0.45} />
              <path d={`M${q.x - wl} ${b0 - 4} Q${q.x} ${b0 + 10} ${q.x + wl} ${b0 - 4}`} stroke="#0a0a0e" strokeWidth={3} fill="none" opacity={0.5} />
            </g>
          );
        })}
        <path d="M-280 40 Q-160 52 -40 40" stroke="#000" strokeWidth={10} opacity={0.18} fill="none" />
              </g>
    </svg>
  );
};

export const Scene08: React.FC = () => {
  const f = useCurrentFrame();
  const cG = cue(8, "gives");
  const cM = cue(8, "metal");
  const cS = cue(8, "switch");
  const cBm = cue(8, "beam");
  const cSh = cue(8, "shake");
  // hand-off: dad offers (IK) -> Alex's hand arrives at the same point -> swap at contact -> Alex draws it to his chest
  const meet: [number, number] = [962, 1000 - 250 * 1.4]; // flashlight centre at the hand-off
  const offer = ci(f, [cG - 12, cG + 6], [0, 1], EZ);
  const take = ci(f, [cG + 2, cG + 14], [0, 1], EZ);
  const handed = f >= cG + 16;
  const back = ci(f, [cG + 22, cG + 40], [0, 1], EZ);
  const HALF = 26; // hands meet side by side on the same flashlight (prop lives in the grip socket)
  const aRest = anchor("alexDress", 800, 1000, 1.4, 1, "waist");
  const dRest = anchor("father", 1120, 1000, 1.38, -1, "waist");
  const aChest: [number, number] = [aRest[0] + 46, aRest[1] - 64];
  const dHold: [number, number] = [dRest[0] - 40, dRest[1] - 10];
  const dadHand: [number, number] = handed ? mixP([meet[0] + HALF, meet[1]], [dRest[0] - 30, dRest[1] + 40], back) : mixP(dHold, [meet[0] + HALF, meet[1]], offer);
  const alexHand: [number, number] = handed ? mixP([meet[0] - HALF, meet[1]], aChest, back) : mixP([aRest[0] + 30, aRest[1] + 40], [meet[0] - HALF, meet[1]], take);
  const flAng = handed ? -4 - 70 * back : -4; // degrees; rotates up to near-vertical as he draws it in
  const flC: [number, number] = handed ? [alexHand[0] + HALF * Math.cos((flAng * Math.PI) / 180), alexHand[1] + HALF * Math.sin((flAng * Math.PI) / 180)] : [dadHand[0] - HALF, dadHand[1]];
  const fl = ci(f, [cS + 2, cS + 7], [0, 1], EZ) * (0.92 + 0.08 * Math.sin(f * 0.21));
  return (
    <>
      <Shot from={0} to={cM}>
        <Stage cam={{ x: ci(f, [0, cM], [-30, 30]), y: 0, zoom: ci(f, [0, cM], [1.0, 1.08]) }}>
          <Plane p={0.15}><Sky variant="night" seed={11} moon={[1700, 120, 34]} horizonY={900} /></Plane>
          <Plane p={0.7}><Academy /></Plane>
          <Plane p={1}>
            <Character id="s8alex" kind="alexDress" x={800} y={1000} scale={1.4} facing={1} lightSide={1} nightTint={0.15} rim="#ffd890"
              reachNear={alexHand} prop={handed ? "flashlight" : "none"}
              pose={{ handNear: handed || take > 0.85 ? "grip" : "open", smile: 0.5, brow: 0.3, head: -2 - 3 * back, eyeY: 0.4 * back, blink: blinkAt(f, 70, 30), bob: breathe(f) }} />
            <Character id="s8dad" kind="father" x={1120} y={1000} scale={1.38} facing={-1} lightSide={1} nightTint={0.15} rim="#ffd890"
              reachNear={dadHand} prop={handed ? "none" : "flashlight"}
              pose={{ handNear: handed ? "open" : "grip", head: 3, smile: 0.25, eyeY: 0.3, blink: blinkAt(f, 80), bob: breathe(f, 0.35) }} />
          </Plane>
          <Post tintColor="#2a2a50" tintOpacity={0.12} vignette={0.55} />
        </Stage>
      </Shot>
      <Shot from={cM} to={sceneDur(8) + 1}>
        <Stage cam={{ x: 0, y: 0, zoom: ci(f, [cM, sceneDur(8)], [1.0, 1.1]) }}>
          <FlashlightCloseup beam={fl} shake={f > cSh ? 1 : 0} sw={f > cS ? 0.5 + 0.5 * Math.sin(f * 0.9) : 0} />
          <Post tintColor="#2a2a50" tintOpacity={0.1} vignette={0.6} />
        </Stage>
      </Shot>
      <Sfx name="crowd" at={0} gain={0.18} />
      <Sfx name="click" at={cS + 2} gain={0.45} />
      <Sfx name="click" at={cBm} gain={0.4} />
      <Sfx name="rattle" at={cSh + 2} gain={0.4} />
    </>
  );
};

/* ============ Scene 9 — Alex laughs; father remains serious ============ */
export const Scene09: React.FC = () => {
  const f = useCurrentFrame();
  const cHe = cue(9, "he");
  const cK = cue(9, "keep");
  const cL = cue(9, "lights");
  const laugh = f < cHe + 8 ? 1 : ci(f, [cHe + 8, cK + 10], [1, 0]);
  const reach = ci(f, [cK - 4, cK + 14], [0, 1], EZ);
  const aSh = anchor("alexDress", 760, 1360, 2.1, 1, "shoulderNear");
  const dRest = anchor("father", 1100, 1360, 2.05, -1, "waist");
  const dadHand = mixP([dRest[0] - 30, dRest[1] + 50], [aSh[0] + 26, aSh[1] - 30], reach);
  const dim = ci(f, [cL, cL + 4, cL + 30, cL + 50], [0, 1, 1, 0.3]);
  return (
    <Stage cam={{ x: ci(f, [cK - 10, cK + 30], [0, 200], Easing.inOut(Easing.cubic)), y: ci(f, [cK - 10, cK + 30], [0, -60]), zoom: ci(f, [cK - 10, cK + 30], [1.0, 1.25], Easing.inOut(Easing.cubic)) }}>
      <Plane p={0.15}><Sky variant="night" seed={11} moon={[1700, 120, 34]} horizonY={900} /></Plane>
      <AbsoluteFill style={{ filter: "blur(4px)" }}><Plane p={0.7}><Academy lightsDim={dim} /></Plane></AbsoluteFill>
      <Plane p={1}>
        <Character id="s9alex" kind="alexDress" x={760} y={1360} scale={2.1} crop="thigh" facing={1} allowMouth={false} lightSide={1} nightTint={0.15} rim="#ffd890" prop="flashlight"
          reachNear={[anchor("alexDress", 760, 1360, 2.1, 1, "chest")[0] + 60, anchor("alexDress", 760, 1360, 2.1, 1, "chest")[1] + 30 + Math.abs(Math.sin(f * 0.45)) * 5 * laugh]}
          pose={{ handNear: "grip", smile: 0.9 * laugh + 0.1, mouth: laugh * 0.35 * (0.5 + 0.5 * Math.sin(f * 0.9)), head: -14 * laugh + Math.sin(f * 0.9) * 3 * laugh, lean: -5 * laugh, bob: Math.abs(Math.sin(f * 0.45)) * 9 * laugh, brow: -0.6 * laugh - 0.2 * reach, blink: laugh > 0.3 ? 0.85 : blinkAt(f, 70, 30), eyeX: 0.5 }} />
        <Character id="s9dad" kind="father" x={1100} y={1360} scale={2.05} crop="thigh" facing={-1} lightSide={1} nightTint={0.15} rim="#ffd890"
          reachNear={dadHand}
          pose={{ handNear: "open", lean: -5 * reach, head: 2 + 3 * reach, brow: -0.7, smile: -0.25, eyeY: 0.1, blink: blinkAt(f, 90, 50), bob: breathe(f, 0.35) }} />
      </Plane>
      <Post tintColor="#2a2a50" tintOpacity={0.12 + dim * 0.1} vignette={0.6 + dim * 0.15} />
    </Stage>
  );
};

/* ============ Scene 10 — Mara and Alex at reinforced precinct ============ */
export const Scene10: React.FC = () => {
  const f = useCurrentFrame();
  const cO = cue(10, "officer");
  const cR = cue(10, "remember");
  const D = sceneDur(10);
  const AX0 = 150, AX1 = 600, S = 1.15;
  const ax = ci(f, [0, 84], [AX0, AX1], Easing.inOut(Easing.sin));
  const walking = f < 84;
  const tilt = ci(f, [cR, cR + 44], [0, 1], Easing.inOut(Easing.cubic));
  // camera never stops: slow drift + push continues after the tilt
  const cam = { x: ci(f, [0, D], [0, 60]) + tilt * -120, y: -tilt * 150, zoom: ci(f, [0, D], [1.0, 1.06]) + tilt * 0.16 };
  return (
    <Stage cam={cam}>
      <Plane p={0.15}><Sky variant="night" seed={14} moon={[380, 140, 40]} horizonY={700} /></Plane>
      <Plane p={0.35}><DecoSkyline seed={61} baseY={840} hMin={460} hMax={760} haze={0.45} /></Plane>
      <Plane p={0.85}><Precinct /></Plane>
      <Plane p={1}>
        <Character id="s10mara" kind="mara" x={1110} y={1008} scale={S} crop={tilt > 0.02 ? "transit" : undefined} facing={-1} lightSide={-1} nightTint={0.2} shoulderRadio
          pose={{ armNear: [10, 38], armFar: [-14, 44], handNear: "grip", handFar: "grip", head: (f > 50 ? 4 : 0) + 9 * Math.sin(Math.PI * ci(f, [88, 104], [0, 1])) + 9 * Math.sin(Math.PI * ci(f, [104, 118], [0, 1])) * 0.6, brow: -0.2, smile: f > 85 ? 0.15 : 0, eyeY: 0.2, eyeX: f > 40 ? 0.6 : 0, bob: breathe(f, 0.3) }} />
        <Character id="s10alex" kind="alex" x={ax} y={1008} scale={S} crop={tilt > 0.02 ? "transit" : undefined} facing={1} lightSide={-1} nightTint={0.2} shoulderRadio
          pose={walking ? { ...walkDist(ax - AX0, "alex", S, 0.9), head: -2, smile: 0.3 } : { head: -4 + 10 * Math.sin(Math.PI * ci(f, [100, 116], [0, 1])), smile: 0.35, brow: 0.3, bob: breathe(f) }} />
      </Plane>
      <Plane p={1.1}><Rain count={110} opacity={0.2} /></Plane>
      <Plane p={1.2}><Fog y={980} height={160} opacity={0.15} /></Plane>
      <Post />
      <Caption text="OFFICER MARA BENNETT" from={cO} to={cR + 6} align="right" y={150} />
      <EdgeFade outF={10} dur={D} />
      {[10, 38, 66].map((t, k) => <Sfx key={k} name="step" at={t} gain={0.28} />)}
    </Stage>
  );
};

/* lineup for look-dev */
export const Lineup: React.FC = () => {
  const kinds = ["alex", "mara", "batman", "father", "nia", "alexYoung", "alexDress", "mother", "driver", "specialist", "robber", "employee", "reporter"] as const;
  return (
    <Stage cam={{ x: 0, y: 0, zoom: 1 }}>
      <Plane p={0.2}><Sky variant="night" seed={2} horizonY={900} /></Plane>
      {kinds.map((k, i) => (
        <Character key={k} id={`lu${k}`} kind={k} x={90 + i * 145} y={1000} scale={0.95} facing={1} lightSide={1} glowEyes={k === "batman" ? 0.8 : 0}
          pose={{ armNear: [20, 30], armFar: [-10, 20] }} />
      ))}
      <Post />
    </Stage>
  );
};
