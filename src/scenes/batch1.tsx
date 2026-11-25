import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { Stage, Plane } from "../lib/Camera";
import { ci, sp, noise, rand } from "../lib/anim";
import { cue, sceneDur } from "../lib/cues";
import { Post, Rain, Fog, Glow, lightning, handheld, Splashes, LightCone } from "../fx/fx";
import { Character, breathe, blinkAt, walk, walkDist, anchor } from "../characters/Character";
import { Sky, DecoSkyline } from "../world/sky";
import { StreetFacades, WetStreet, SchoolBus } from "../world/street";
import { ShopFront, ShopInterior, Academy, Precinct, JokerProfile } from "../world/places";
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
  const bY = -500 + fall * 1460;
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
  const radio = anchor("alex", ax, 1300, S, 1, "radio");
  const rest: [number, number] = [bx - 70 * S, 1330 - 168 * S];
  const lift: [number, number] = [bx - 120 * S, 1330 - 300 * S];
  const grab: [number, number] = [radio[0] + 6, radio[1] + 8];
  const hand = pull > 0 ? mixP(grab, lift, pull) : mixP(rest, grab, reach);
  return (
    <Stage cam={cam}>
      <AbsoluteFill style={{ filter: "blur(5px)", transform: "scale(1.15)" }}>
        <BusStreetSet fog={0.45} rain={0.6} />
      </AbsoluteFill>
      <Plane p={1}>
        <Character id="s2alex" kind="alex" x={ax} y={1300} scale={S} facing={1} lightSide={1} silhouette={0.15} shoulderRadio={!taken}
          pose={{ lean: -5 * reach + 3 * pull, head: -6 - 4 * reach, brow: 0.3 + 0.7 * reach, eyeY: -0.6, eyeX: 0.4, blink: blinkAt(f, 80, 50), bob: breathe(f, 0.6, 2), armNear: [8 + 10 * pull, 20], armFar: [-6, 16] }} />
        <Character id="s2bat" kind="batman" x={bx} y={1330} scale={S} facing={-1} lightSide={-1} silhouette={0.2} capeWind={0.9} glowEyes={0.5}
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
  const S = 2.75, NX = 940, NY = 1330 + pound * 6;
  const shN = anchor("nia", NX, NY, S, 1, "shoulderNear");
  const shF = anchor("nia", NX, NY, S, 1, "shoulderFar");
  // palms flat on the glass, arms attached through IK; a pound pulls back then slams
  const back = pound * 18;
  const palmN: [number, number] = [shN[0] + 120, shN[1] - 170 + back * 0.3];
  const palmF: [number, number] = [shF[0] - 120, shF[1] - 170 + back * 0.3];
  const Palm = ({ at, flip }: { at: [number, number]; flip: number }) => (
    <g transform={`translate(${at[0]} ${at[1] - 10}) scale(${flip * (1 + pound * 0.05)} 1)`}>
      <path d="M-30 30 C-36 6 -34 -14 -30 -30 L-28 -62 Q-22 -72 -16 -62 L-14 -34 L-10 -74 Q-3 -84 4 -74 L4 -36 L10 -70 Q17 -79 23 -69 L20 -32 L28 -54 Q35 -60 39 -50 L32 -10 C30 10 22 26 10 34 Z" fill="#b07a56" stroke="#3a2214" strokeWidth={3} strokeLinejoin="round" />
      <path d="M-30 30 C-40 20 -52 4 -56 -12 Q-58 -22 -48 -20 C-40 -10 -34 -2 -28 4" fill="#b07a56" stroke="#3a2214" strokeWidth={3} />
      <ellipse cx={0} cy={0} rx={30} ry={26} fill="#fff" opacity={0.1 + pound * 0.1} />
      <path d="M-24 34 L12 38 L10 60 L-26 56 Z" fill="#f0c21a" stroke="#3a2214" strokeWidth={3} />
    </g>
  );
  const beads = Array.from({ length: 46 });
  return (
    <>
      {/* bright warm dry interior */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="bwIn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f1d9a6" /><stop offset="0.55" stopColor="#c99a62" /><stop offset="1" stopColor="#6a4a2c" /></linearGradient>
          <radialGradient id="bwLamp" cx="0.5" cy="0.05" r="0.7"><stop offset="0" stopColor="#fff6dc" /><stop offset="1" stopColor="#ffe2a6" stopOpacity="0" /></radialGradient>
          <linearGradient id="bwSeat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3f7a5a" /><stop offset="1" stopColor="#1e3e2e" /></linearGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#bwIn)" />
        <rect width="1920" height="1080" fill="url(#bwLamp)" opacity={0.85} />
        {/* ceiling light strip + ribs */}
        <rect x={0} y={128} width={1920} height={22} fill="#fffbe8" opacity={0.75} />
        {[260, 700, 1140, 1580].map((x) => <rect key={x} x={x} y={150} width={14} height={520} fill="#a87c4a" opacity={0.35} />)}
        {/* far-side windows: dark night beyond, rain outside only */}
        {[0, 1, 2, 3].map((i) => <rect key={i} x={120 + i * 440} y={330} width={360} height={190} rx={18} fill="#1c2840" opacity={0.85} />)}
        <rect x={0} y={300} width={1920} height={10} fill="#8a7050" opacity={0.6} />
        {/* green bus seats */}
        {[0, 1, 2].map((i) => <g key={i}><rect x={200 + i * 600} y={660} width={420} height={320} rx={36} fill="url(#bwSeat)" stroke="#12261c" strokeWidth={4} /><rect x={200 + i * 600} y={660} width={420} height={26} rx={13} fill="#5e9c78" /><rect x={214 + i * 600} y={700} width={8} height={260} fill="#ffffff" opacity={0.12} /></g>)}
      </svg>
      <Character id="s3nia" kind="nia" x={NX} y={NY} scale={S} facing={1} lightSide={1} silhouette={0} nightTint={0.02} rim="#fff2cc"
        reachNear={palmN} reachFar={palmF}
        pose={{ handNear: "open", handFar: "open", brow: -1.4, head: -8 + pound * 2, eyeX: 0.7, eyeY: -0.5, blink: 0, smile: -1, lean: pound * 4 }} />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}><Palm at={palmF} flip={-1} /><Palm at={palmN} flip={1} /></svg>
      {/* outer glass: fog, palm clearings exactly under her palms, beading droplets */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <filter id="bwSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter>
          <mask id="bwMask">
            <rect width="1920" height="1080" fill="white" />
            <ellipse cx={950} cy={560} rx={300 * wipe} ry={220 * wipe} fill="black" filter="url(#bwSoft)" />
            <ellipse cx={palmN[0]} cy={palmN[1]} rx={70} ry={84} fill="black" filter="url(#bwSoft)" />
            <ellipse cx={palmF[0]} cy={palmF[1]} rx={70} ry={84} fill="black" filter="url(#bwSoft)" />
          </mask>
          <radialGradient id="bwFog"><stop offset="0" stopColor="#e4ecf4" stopOpacity="0.85" /><stop offset="1" stopColor="#c4d2e2" stopOpacity="1" /></radialGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#bwFog)" opacity={fog * 0.62} mask="url(#bwMask)" />
        {beads.map((_, i) => {
          const slide = rand(i * 3) > 0.86; // a few slow trickles, no falling rain
          const x0 = 120 + rand(i * 11) * 1680;
          const y = 110 + ((rand(i * 5) * 860 + (slide ? f * (0.6 + rand(i) * 1.2) : 0)) % 860);
          const r = 2.5 + rand(i * 7) * 5;
          return <g key={i}><circle cx={x0} cy={y} r={r} fill="#eef5ff" opacity={0.22} /><circle cx={x0 - r * 0.3} cy={y - r * 0.3} r={r * 0.35} fill="#fff" opacity={0.5} />{slide && <path d={`M${x0} ${y - 40} Q${x0 + 2} ${y - 20} ${x0} ${y - r}`} stroke="#eef5ff" strokeWidth={1.4} opacity={0.18} fill="none" />}</g>;
        })}
        {/* pound impact: brief condensation ring around each palm */}
        {pound > 0.2 && [palmN, palmF].map(([hx, hy], i) => <ellipse key={i} cx={hx} cy={hy} rx={80 + (1 - pound) * 30} ry={92 + (1 - pound) * 30} fill="none" stroke="#ffffff" strokeWidth={3} opacity={pound * 0.25} />)}
        {/* window frame */}
        <path d="M0 0 H1920 V1080 H0 Z M140 90 H1780 Q1820 90 1820 130 V950 Q1820 990 1780 990 H140 Q100 990 100 950 V130 Q100 90 140 90 Z" fill="#c9981e" fillRule="evenodd" />
        <path d="M0 0 H1920 V1080 H0 Z M140 90 H1780 Q1820 90 1820 130 V950 Q1820 990 1780 990 H140 Q100 990 100 950 V130 Q100 90 140 90 Z" fill="#141210" fillRule="evenodd" opacity={0.55} />
        <path d="M100 130 Q100 90 140 90 H1780 Q1820 90 1820 130" stroke="#ffe08a" strokeWidth={3} fill="none" opacity={0.35} />
        <path d="M150 100 l260 0 l-300 880 l-110 0 Z" fill="#fff" opacity={0.05} />
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
            <Character id="s3alexfg" kind="alex" x={330} y={1640} scale={2.4} facing={1} lightSide={-1} silhouette={0.6} rim="#ffcf8a" shoulderRadio={false} pose={{ head: -6, eyeY: -0.4 }} />
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
            <Character id="s4bat" kind="batman" x={1180} y={1640} scale={2.9} facing={-1} lightSide={-1} silhouette={0.3} capeWind={0.8} glowEyes={0.9} prop="radio"
              pose={{ armNear: [62 - 30 * ci(f, [14, 34], [0, 1], EZ), 104 - 40 * ci(f, [14, 34], [0, 1], EZ)], handNear: "grip", head: 4 - 8 * ci(f, [16, 30], [0, 1], EZ), eyeX: ci(f, [16, 30], [0.2, -0.6]), brow: -1, blink: blinkAt(f, 100, 30), bob: breathe(f, 0.25, 2), lean: 4 - 3 * ci(f, [30, 60], [0, 1], EZ) }} />
            <Glow x={560} y={430} r={120} color="255,40,40" opacity={led ? 0.35 : 0.08} />
          </Plane>
          <ForegroundRain />
          <Post tintOpacity={0.2} vignette={0.7} />
        </Stage>
      </Shot>
      <Shot from={cS} to={sceneDur(4) + 1}>
        <Stage cam={{ x: ci(f, [cS, sceneDur(4)], [-30, 30]), y: 0, zoom: ci(f, [cS, sceneDur(4)], [1.05, 1.12]) }}>
          <Plane p={0.2}><Sky variant="storm" seed={8} horizonY={500} /></Plane>
          <Plane p={0.35}><DecoSkyline seed={21} baseY={520} hMin={200} hMax={460} haze={0.5} litP={0.2} /></Plane>
          {/* street canyon far below */}
          <Plane p={0.6}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <defs><linearGradient id="cany" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a2438" /><stop offset="1" stopColor="#05070c" /></linearGradient></defs>
              <path d="M0 520 L700 520 L820 1080 L0 1080 Z" fill="url(#cany)" />
              <path d="M1920 520 L1150 520 L1040 1080 L1920 1080 Z" fill="url(#cany)" />
              <path d="M700 520 L1150 520 L1040 1080 L820 1080 Z" fill="#0d1220" />
              {Array.from({ length: 30 }).map((_, i) => <rect key={i} x={rand(i) * 640} y={560 + rand(i * 3) * 480} width={10} height={14} fill="#f2cf7a" opacity={0.6} />)}
              {Array.from({ length: 30 }).map((_, i) => <rect key={i} x={1180 + rand(i * 5) * 700} y={560 + rand(i * 7) * 480} width={10} height={14} fill="#f2cf7a" opacity={0.6} />)}
              {/* tiny bus + flashing lights */}
              <rect x={880} y={800} width={110} height={34} rx={4} fill="#c99a20" />
              {Array.from({ length: 5 }).map((_, i) => <rect key={i} x={886 + i * 20} y={804} width={14} height={12} fill="#2a2010" />)}
              <circle cx={985} cy={812} r={led ? 6 : 3} fill="#ff2a2a" />
              <defs><radialGradient id="s4g"><stop offset="0" stopColor="#ffe2a6" stopOpacity="0.55" /><stop offset="1" stopColor="#ffe2a6" stopOpacity="0" /></radialGradient></defs>
              {[[860, 760], [1010, 900], [900, 980]].map(([lx, ly], i) => <g key={i}><circle cx={lx} cy={ly} r={30} fill="url(#s4g)" /><circle cx={lx} cy={ly} r={3.5} fill="#fff1cc" /></g>)}
              <ellipse cx={935} cy={817} rx={110} ry={40} fill="url(#s4g)" opacity={0.5} />
              <circle cx={960} cy={860} r={5} fill={led ? "#ff3030" : "#3060ff"} /><circle cx={975} cy={860} r={5} fill={led ? "#3060ff" : "#ff3030"} />
            </svg>
          </Plane>
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
  const S = 1.9, X = 760, Y = 1330;
  const bx = X + 24 * S, by = Y - (198 + 106) * S;
  return (
    <Stage cam={{ x: ci(f, [0, sceneDur(5)], [0, 30]), y: 0, zoom: ci(f, [0, sceneDur(5)], [1.0, 1.08]) }}>
      <Plane p={0.2}><Sky variant="dusk" seed={5} horizonY={760} moon={[1500, 220, 36]} /></Plane>
      <Plane p={0.35}><DecoSkyline seed={31} baseY={760} hMin={300} hMax={640} haze={0.4} hazeColor="#8a5a6a" light="#c08a7a" body="#2a1a2a" litP={0.3} /></Plane>
      <Plane p={0.55}><DecoSkyline seed={33} baseY={820} hMin={200} hMax={420} haze={0.15} hazeColor="#5a3a50" light="#8a5a5a" body="#1a1018" litP={0.35} rimSide="right" /></Plane>
      <Plane p={1}>
        <Character id="s5alex" kind="alex" x={X} y={Y} scale={S} facing={1} lightSide={1} rim="#ffb080" nightTint={0.12} silhouette={0.05}
          pose={{ armNear: [22 + polish * 5, 122 + polish * 6], handNear: "fist", armFar: [-8, 14], head: -4 + ci(f, [cB - 10, cB], [0, 6]), smile: 0.45, brow: 0.3, eyeY: ci(f, [cB - 10, cB], [-0.3, 0.8]), blink: blinkAt(f, 70, 30), bob: breathe(f, 0.45, 1.5) }} />
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
  const DX0 = 1180, DX1 = 560, DS = 1.75;
  const dx = ci(f, [wS, wE], [DX0, DX1], Easing.inOut(Easing.sin));
  const walking = f >= wS && f < wE;
  const lampPt: [number, number] = [352, 610];
  const reachL = ci(f, [wE, wE + 8], [0, 1], EZ);
  const touch = wE + 8;
  const lampOn = f < touch ? 0 : ci(f - touch, [0, 1, 2, 3, 4, 5, 6, 8], [0, 0.9, 0.15, 1, 0.4, 1, 0.75, 1]);
  const lockPt: [number, number] = [1440, 600 + (turn1 + turn2) * 6];
  return (
    <>
      <Shot from={0} to={cE}>
        <Stage cam={{ x: 0, y: ci(f, [0, cA, cE], [140, 60, -60], Easing.inOut(Easing.cubic)), zoom: ci(f, [0, cE], [1.0, 1.06]) }}>
          <Plane p={0.2}><Sky variant="night" seed={6} moon={[300, 160, 40]} horizonY={760} /></Plane>
          <Plane p={0.35}><DecoSkyline seed={41} baseY={700} hMin={200} hMax={500} haze={0.5} /></Plane>
          <Plane p={0.7}><StreetFacades seed={9} baseY={820} litP={0.25} heightMin={600} heightMax={760} fireEscapes /></Plane>
          <Plane p={0.85}><ShopFront baseY={830} lamp={0} upstairs={1} sign={1} /></Plane>
          <Plane p={1}><WetStreet horizonY={830} curbY={870} reflections={[{ x: 960, color: "#f5c66a", w: 420, strength: 0.5 }, { x: 650, color: "#ffcf8a", w: 100, strength: 0.5 }]} seed={4} /></Plane>
          <Plane p={1}>
            <Character id="s6alex" kind="alex" x={ci(f, [0, cA], [520, 640], EZ)} y={1040} scale={0.95} facing={1} lightSide={1} nightTint={0.2} rim="#ffcf8a" shoulderRadio
              pose={f < cA - 20 ? { ...walkDist(ci(f, [0, cA], [520, 640], EZ) - 520, "alex", 0.95, 0.7), head: -6 } : { head: -16, eyeY: -1, smile: 0.25 }} />
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
              <rect x={454} y={260} width={12} height={420} fill="#1a0f08" />
              <rect x={160} y={464} width={600} height={12} fill="#1a0f08" />
              {Array.from({ length: 40 }).map((_, i) => <rect key={`ws${i}`} x={i * 48} y={0} width={2} height={950} fill="#000" opacity={0.12} />)}
              <rect x={140} y={680} width={640} height={24} fill="#3a2414" />
              <g transform="translate(330 680)">
                <circle cy={-50} r={420} fill="url(#s6lamp)" opacity={lampOn} />
                <path d="M-36 -52 L36 -52 L24 -100 L-24 -100 Z" fill={lampOn > 0.1 ? "#f6cf8a" : "#5a4630"} stroke="#1a0f08" strokeWidth={3} />
                <rect x={-4} y={-52} width={8} height={46} fill="#2a1a10" />
                <rect x={-20} y={-8} width={40} height={8} rx={2} fill="#2a1a10" />
              </g>
              <rect x={0} y={950} width={1920} height={130} fill="#0c0806" />
            </svg>
          </Plane>
          <Plane p={1}>
            <Character id="s6dad" kind="father" x={dx} y={1120} scale={DS} facing={f < wS ? 1 : -1} lightSide={-1} nightTint={0.12} rim="#ffb46a"
              prop={f < wS ? "key" : "none"}
              reachNear={f < wS ? lockPt : f >= wE ? mixP(anchor("father", dx, 1120, DS, -1, "waist"), lampPt, reachL) : undefined}
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
  const kidSh = anchor("alexYoung", 780, 1060, 1.05, 1, "shoulderNear");
  const dadRest = anchor("father", 990, 1070, 1.6, -1, "waist");
  const dadHand = mixP([dadRest[0] - 40, dadRest[1] + 30], [kidSh[0] + 4, kidSh[1] - 6], pat);
  return (
    <>
      <Shot from={0} to={cBut}>
        <Stage cam={{ x: ci(f, [0, cBut], [-20, 20]), y: 0, zoom: ci(f, [0, cBut], [1.0, 1.06]) }}>
          <Plane p={0.8}><ShopInterior lamp={1} /></Plane>
          <Plane p={1}>
            <Character id="s7kid" kind="alexYoung" x={780} y={1060} scale={1.05} facing={1} lightSide={1} nightTint={0.08} rim="#ffb46a"
              reachNear={f < cNo + 4 ? [1290, 560] : undefined}
              pose={{ head: -14, brow: -0.4, eyeY: -1, armNear: [10, 14], handNear: "point", blink: blinkAt(f, 70, 10), bob: breathe(f), smile: -0.1 + 0.4 * pat }} />
            <Character id="s7dad" kind="father" x={990} y={1070} scale={1.6} facing={-1} lightSide={1} nightTint={0.08} rim="#ffb46a"
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
        {beam > 0 && <path d="M330 -40 L1500 -420 L1500 420 L330 40 Z" fill="url(#flBeam)" opacity={beam} style={{ mixBlendMode: "screen" }} />}
        <rect x={-460} y={-58} width={680} height={116} rx={18} fill="url(#flM)" stroke="#0a0a0e" strokeWidth={5} />
        {Array.from({ length: 22 }).map((_, i) => <path key={i} d={`M${-440 + rand(i) * 640} ${-50 + rand(i * 3) * 100} l${10 + rand(i * 5) * 40} ${(rand(i * 7) - 0.5) * 12}`} stroke="#eef" strokeWidth={1.3} opacity={0.35} />)}
        {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={-420 + i * 26} y={-58} width={6} height={116} fill="#000" opacity={0.15} />)}
        <path d="M220 -80 H330 V80 H220 Z" fill="url(#flM)" stroke="#0a0a0e" strokeWidth={5} />
        <ellipse cx={330} cy={0} rx={18} ry={78} fill={beam > 0 ? "#fff7d8" : "#5a5c62"} stroke="#0a0a0e" strokeWidth={4} />
        {/* loose switch */}
        <rect x={-40} y={-74} width={90} height={20} rx={6} fill="#1a1a1e" />
        <rect x={-30 + sw * 40} y={-82} width={30} height={22} rx={5} fill="#3a3a40" stroke="#0a0a0e" strokeWidth={3} />
        {/* hand: palm behind, four fingers wrapping the barrel, thumb on the switch */}
        <path d="M-330 60 C-360 120 -300 200 -160 210 L-30 200 C10 160 0 90 -20 58 Z" fill="url(#flSkin)" stroke="#0a0a0e" strokeWidth={4} />
        <rect x={-560} y={60} width={260} height={150} fill="#1d2b52" stroke="#0a0a0e" strokeWidth={4} />
        <rect x={-330} y={64} width={30} height={142} fill="#d9b24a" opacity={0.85} />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <path d={`M${-270 + i * 62} 70 C${-284 + i * 62} 20 ${-280 + i * 62} -40 ${-262 + i * 62} -62 C${-250 + i * 62} -76 ${-222 + i * 62} -74 ${-216 + i * 62} -58 C${-226 + i * 62} -30 ${-220 + i * 62} 30 ${-214 + i * 62} 72 Z`} fill="url(#flSkin)" stroke="#0a0a0e" strokeWidth={4} />
            <path d={`M${-262 + i * 62} -40 q12 -6 26 0`} stroke="#5a3420" strokeWidth={2.5} fill="none" opacity={0.7} />
            <path d={`M${-264 + i * 62} 10 q14 -4 28 0`} stroke="#5a3420" strokeWidth={2.5} fill="none" opacity={0.5} />
            <path d={`M${-258 + i * 62} -64 q10 -4 18 0 l-2 10 q-8 -3 -14 0 Z`} fill="#e8c0a0" opacity={0.6} />
          </g>
        ))}
        <path d={`M-30 70 C-20 0 ${-30 + sw * 30} -70 ${-6 + sw * 30} -96 C${12 + sw * 30} -112 ${40 + sw * 30} -100 ${36 + sw * 30} -80 C${20 + sw * 30} -60 10 0 18 60 Z`} fill="url(#flSkin)" stroke="#0a0a0e" strokeWidth={4} />
        <path d={`M${0 + sw * 30} -98 q14 -6 26 2 l-4 10 q-10 -6 -20 -2 Z`} fill="#e8c0a0" opacity={0.6} />
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
  const meet: [number, number] = [962, 1040 - 250 * 1.4]; // flashlight centre at the hand-off
  const offer = ci(f, [cG - 12, cG + 6], [0, 1], EZ);
  const take = ci(f, [cG + 2, cG + 14], [0, 1], EZ);
  const handed = f >= cG + 16;
  const back = ci(f, [cG + 22, cG + 40], [0, 1], EZ);
  const HALF = 58; // dad holds the lens end, Alex takes the handle end
  const aRest = anchor("alexDress", 800, 1040, 1.4, 1, "waist");
  const dRest = anchor("father", 1120, 1040, 1.38, -1, "waist");
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
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <g transform={`translate(${flC[0]} ${flC[1]}) rotate(${flAng})`}>
                <rect x={-80} y={-11} width={128} height={22} rx={5} fill="#9aa0aa" stroke="#0a0a0e" strokeWidth={3} />
                <rect x={-80} y={-11} width={128} height={7} rx={3} fill="#e6eaf0" opacity={0.6} />
                {[-60, -44, -28].map((gx) => <rect key={gx} x={gx} y={-11} width={4} height={22} fill="#000" opacity={0.2} />)}
                <path d="M48 -18 H80 V18 H48 Z" fill="#b8bec8" stroke="#0a0a0e" strokeWidth={3} />
                <ellipse cx={80} cy={0} rx={6} ry={17} fill="#d8dce2" stroke="#0a0a0e" strokeWidth={2.5} />
                <rect x={-14} y={-18} width={20} height={8} rx={3} fill="#2a2a30" />
                <path d="M-70 -2 l22 3 M-30 4 l16 -2" stroke="#fff" strokeWidth={1.2} opacity={0.5} />
              </g>
            </svg>
            <Character id="s8alex" kind="alexDress" x={800} y={1040} scale={1.4} facing={1} lightSide={1} nightTint={0.15} rim="#ffd890"
              reachNear={alexHand}
              pose={{ handNear: handed || take > 0.85 ? "grip" : "open", smile: 0.5, brow: 0.3, head: -2 - 3 * back, eyeY: 0.4 * back, blink: blinkAt(f, 70, 30), bob: breathe(f) }} />
            <Character id="s8dad" kind="father" x={1120} y={1040} scale={1.38} facing={-1} lightSide={1} nightTint={0.15} rim="#ffd890"
              reachNear={dadHand}
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
  const aSh = anchor("alexDress", 760, 1280, 1.85, 1, "shoulderNear");
  const dRest = anchor("father", 1090, 1270, 1.8, -1, "waist");
  const dadHand = mixP([dRest[0] - 30, dRest[1] + 50], [aSh[0] + 26, aSh[1] - 30], reach);
  const dim = ci(f, [cL, cL + 4, cL + 30, cL + 50], [0, 1, 1, 0.3]);
  return (
    <Stage cam={{ x: ci(f, [cK - 10, cK + 30], [0, 200], Easing.inOut(Easing.cubic)), y: ci(f, [cK - 10, cK + 30], [0, -60]), zoom: ci(f, [cK - 10, cK + 30], [1.0, 1.25], Easing.inOut(Easing.cubic)) }}>
      <Plane p={0.15}><Sky variant="night" seed={11} moon={[1700, 120, 34]} horizonY={900} /></Plane>
      <AbsoluteFill style={{ filter: "blur(4px)" }}><Plane p={0.7}><Academy lightsDim={dim} /></Plane></AbsoluteFill>
      <Plane p={1}>
        <Character id="s9alex" kind="alexDress" x={760} y={1280} scale={1.85} facing={1} allowMouth={false} lightSide={1} nightTint={0.15} rim="#ffd890" prop="flashlight"
          reachNear={[anchor("alexDress", 760, 1280, 1.85, 1, "chest")[0] + 60, anchor("alexDress", 760, 1280, 1.85, 1, "chest")[1] + 30 + Math.abs(Math.sin(f * 0.45)) * 5 * laugh]}
          pose={{ handNear: "grip", smile: 0.9 * laugh + 0.1, mouth: laugh * 0.35 * (0.5 + 0.5 * Math.sin(f * 0.9)), head: -14 * laugh + Math.sin(f * 0.9) * 3 * laugh, lean: -5 * laugh, bob: Math.abs(Math.sin(f * 0.45)) * 9 * laugh, brow: -0.6 * laugh - 0.2 * reach, blink: laugh > 0.3 ? 0.85 : blinkAt(f, 70, 30), eyeX: 0.5 }} />
        <Character id="s9dad" kind="father" x={1090} y={1270} scale={1.8} facing={-1} lightSide={1} nightTint={0.15} rim="#ffd890"
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
      <Plane p={0.35}><DecoSkyline seed={61} baseY={640} hMin={260} hMax={560} haze={0.45} /></Plane>
      <Plane p={0.85}><Precinct /></Plane>
      <Plane p={1}>
        <Character id="s10mara" kind="mara" x={1110} y={1000} scale={S} facing={-1} lightSide={-1} nightTint={0.2} shoulderRadio
          pose={{ armNear: [10, 38], armFar: [-14, 44], handNear: "grip", handFar: "grip", head: (f > 50 ? 4 : 0) + 9 * Math.sin(Math.PI * ci(f, [88, 104], [0, 1])) + 9 * Math.sin(Math.PI * ci(f, [104, 118], [0, 1])) * 0.6, brow: -0.2, smile: f > 85 ? 0.15 : 0, eyeY: 0.2, eyeX: f > 40 ? 0.6 : 0, bob: breathe(f, 0.3) }} />
        <Character id="s10alex" kind="alex" x={ax} y={1010} scale={S} facing={1} lightSide={-1} nightTint={0.2} shoulderRadio
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
