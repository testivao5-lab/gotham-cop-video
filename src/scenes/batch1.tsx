import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { Stage, Plane } from "../lib/Camera";
import { ci, sp, noise, rand } from "../lib/anim";
import { cue, sceneDur } from "../lib/cues";
import { Post, Rain, Fog, Glow, lightning, handheld, Splashes, LightCone } from "../fx/fx";
import { Character, breathe, blinkAt, walk } from "../characters/Character";
import { Sky, DecoSkyline } from "../world/sky";
import { StreetFacades, WetStreet, SchoolBus } from "../world/street";
import { ShopFront, ShopInterior, Academy, Precinct, JokerBack } from "../world/places";
import { BusStreetSet, ForegroundRain, Caption, Shot, FadeIn } from "./common";

/* ============ Scene 1 — Batman appears at rain-soaked bus street ============ */
export const Scene01: React.FC = () => {
  const f = useCurrentFrame();
  const flash = lightning(f, [3, 70]);
  const fall = ci(f, [12, 27], [0, 1], Easing.in(Easing.quad));
  const land = sp(f, 27, { damping: 12 });
  const rise = sp(f, 40, { damping: 16, stiffness: 70 });
  const crouch = f < 27 ? 0.3 : Math.max(0, land - rise);
  const shake = f > 27 && f < 36 ? (36 - f) * 1.4 * Math.sin(f * 3) : 0;
  const hh = handheld(f, 0.6, 1);
  const cam = { x: ci(f, [0, sceneDur(1)], [-10, 20]) + hh.x, y: hh.y + shake, zoom: ci(f, [0, sceneDur(1)], [1.0, 1.08]), rot: hh.rot };
  const bY = -500 + fall * 1460;
  return (
    <Stage cam={cam}>
      <BusStreetSet flash={flash} fog={0.35} />
      <Plane p={1}>
        <Character id="s1bat" kind="batman" x={1210} y={bY} scale={1.12} facing={-1} lightSide={-1} silhouette={0.35} capeWind={f < 27 ? 2.6 : 1.4 - rise * 0.8} glowEyes={0.8}
          pose={{ lean: 26 * crouch, bob: 70 * crouch, legNear: [36 * crouch + (f < 27 ? 10 : 0), 80 * crouch + 4], legFar: [-10 * crouch, 70 * crouch + 4], armNear: [30 + 20 * crouch, 30], armFar: [-20 - 30 * crouch, 20], head: -6 * crouch, brow: -1, handNear: "fist", handFar: "fist" }} />
        {f >= 27 && f < 45 && <Splashes y0={950} y1={985} count={14} seed={20} opacity={0.9} />}
        <Character id="s1alex" kind="alex" x={520} y={1010} scale={1.18} facing={1} lightSide={1} silhouette={0.25} shoulderRadio
          pose={{ head: -4 - 4 * ci(f, [27, 45], [0, 1]), lean: -3 * ci(f, [27, 35], [0, 1]), brow: 0.4 + 0.5 * ci(f, [27, 40], [0, 1]), smile: ci(f, [70, 100], [0, 0.35]), blink: blinkAt(f, 64, 20), bob: breathe(f, 0.5, 1.5), eyeY: -0.5, armNear: [6, 18], armFar: [-8, 14] }} />
      </Plane>
      <ForegroundRain />
      <Post tintOpacity={0.22} vignette={0.65} />
    </Stage>
  );
};

/* ============ Scene 2 — Batman takes radio and warns Alex ============ */
export const Scene02: React.FC = () => {
  const f = useCurrentFrame();
  const reach = ci(f, [26, 48], [0, 1], Easing.inOut(Easing.cubic));
  const pull = ci(f, [56, 80], [0, 1], Easing.inOut(Easing.cubic));
  const taken = f >= 54;
  const hh = handheld(f, 0.8, 4);
  const cam = { x: hh.x, y: hh.y, zoom: ci(f, [0, sceneDur(2)], [1.0, 1.06]), rot: hh.rot };
  return (
    <Stage cam={cam}>
      <AbsoluteFill style={{ filter: "blur(5px)", transform: "scale(1.15)" }}>
        <BusStreetSet fog={0.45} rain={0.6} />
      </AbsoluteFill>
      <Plane p={1}>
        <Character id="s2alex" kind="alex" x={640 - reach * 10} y={1300} scale={1.95} facing={1} lightSide={1} silhouette={0.15} shoulderRadio={!taken}
          pose={{ lean: -5 * reach, head: -6 - 4 * reach, brow: 0.3 + 0.7 * reach, eyeY: -0.6, eyeX: 0.4, blink: blinkAt(f, 80, 50), bob: breathe(f, 0.6, 2), armNear: [8 + 14 * reach, 20], armFar: [-6, 16] }} />
        <Character id="s2bat" kind="batman" x={1290 - reach * 30} y={1330} scale={1.95} facing={-1} lightSide={-1} silhouette={0.2} capeWind={0.9} glowEyes={0.5}
          prop={taken ? "radio" : "none"}
          pose={{ lean: 6 * reach - 4 * pull, head: 2 - 4 * pull, brow: -1, blink: blinkAt(f, 90, 10), armNear: taken ? [70 - 10 * pull, 40 + 70 * pull] : [10 + 62 * reach, 14 + 26 * reach], armFar: [-10, 18], handNear: taken ? "grip" : reach > 0.7 ? "grip" : "open", handFar: "fist", bob: breathe(f, 0.25, 1.5) }} />
      </Plane>
      <ForegroundRain amt={0.8} />
      <Post tintOpacity={0.2} vignette={0.7} />
    </Stage>
  );
};

/* ============ Scene 3 — Nia pounds fogged bus window ============ */
const BusWindowCloseup: React.FC<{ fog: number; wipe: number; pound: number }> = ({ fog, wipe, pound }) => {
  const f = useCurrentFrame();
  const drops = Array.from({ length: 70 });
  return (
    <>
      {/* interior */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="bwIn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a2a1a" /><stop offset="1" stopColor="#120c08" /></linearGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#bwIn)" />
        {[0, 1, 2].map((i) => <rect key={i} x={200 + i * 600} y={640} width={420} height={300} rx={30} fill="#4a1a14" opacity={0.75} />)}
        <rect x={0} y={120} width={1920} height={30} fill="#d9c090" opacity={0.15} />
      </svg>
      <Character id="s3nia" kind="nia" x={960} y={1260 + pound * 10} scale={3.2} facing={1} lightSide={1} silhouette={0.1}
        pose={{ armNear: [150 + pound * 14, 30 - pound * 30], armFar: [140 + pound * 10, 34 - pound * 24], handNear: "fist", handFar: "fist", brow: 1, head: -6, eyeX: -0.6, blink: blinkAt(f, 50, 5), mouth: 0.25 + pound * 0.2, smile: -0.8, lean: pound * 4 }} />
      {/* glass: fog + droplets */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <mask id="bwMask">
            <rect width="1920" height="1080" fill="white" />
            <ellipse cx={980} cy={520} rx={240 * wipe} ry={160 * wipe} fill="black" />
          </mask>
          <radialGradient id="bwFog"><stop offset="0" stopColor="#d7e2ee" stopOpacity="0.9" /><stop offset="1" stopColor="#b9c9dc" stopOpacity="1" /></radialGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#bwFog)" opacity={fog * 0.8} mask="url(#bwMask)" />
        {drops.map((_, i) => {
          const run = rand(i * 3) > 0.8;
          const y = (rand(i * 5) * 1080 + (run ? f * (4 + rand(i) * 6) : 0)) % 1120;
          const r = 3 + rand(i * 7) * 7;
          return <g key={i}><circle cx={rand(i * 11) * 1920} cy={y} r={r} fill="#e9f2ff" opacity={0.35} /><circle cx={rand(i * 11) * 1920 - r * 0.3} cy={y - r * 0.3} r={r * 0.35} fill="#fff" opacity={0.6} />{run && <rect x={rand(i * 11) * 1920 - 1} y={y - 60} width={2} height={60} fill="#e9f2ff" opacity={0.2} />}</g>;
        })}
        {/* window frame */}
        <path d="M0 0 H1920 V1080 H0 Z M140 90 H1780 Q1820 90 1820 130 V950 Q1820 990 1780 990 H140 Q100 990 100 950 V130 Q100 90 140 90 Z" fill="#141210" fillRule="evenodd" />
        <path d="M0 0 H1920 V60 H0 Z" fill="#b8901c" opacity={0.6} />
        <rect x={100} y={530} width={1720} height={20} fill="#141210" />
        <path d="M150 100 l260 0 l-300 880 l-110 0 Z" fill="#fff" opacity={0.04} />
      </svg>
    </>
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
        <Stage cam={{ x: hh.x + ci(f, [0, cW], [0, 40]), y: hh.y, zoom: ci(f, [0, cW], [1.12, 1.22]), rot: hh.rot }}>
          <BusStreetSet fog={fog} nia niaPound={1} />
          <Plane p={1.3}>
            <Character id="s3alexfg" kind="alex" x={180} y={1560} scale={2.6} facing={1} lightSide={1} silhouette={0.85} shoulderRadio={false} pose={{ head: -4 }} />
          </Plane>
          <ForegroundRain />
          <Post />
        </Stage>
      </Shot>
      <Shot from={cW} to={cD}>
        <Stage cam={{ x: hh.x, y: hh.y, zoom: ci(f, [cW, cD], [1.0, 1.08]) }}>
          <BusWindowCloseup fog={fog} wipe={ci(f, [cW + 6, cW + 24], [0, 1])} pound={pound} />
          <Post tintOpacity={0.12} vignette={0.6} />
        </Stage>
      </Shot>
      <Shot from={cD} to={sceneDur(3) + 1}>
        <Stage cam={{ x: hh.x, y: hh.y, zoom: ci(f, [cD, sceneDur(3)], [1.0, 1.06]) }}>
          <Plane p={1}>
            <AbsoluteFill style={{ background: "#0a0d16" }} />
            <SchoolBus x={-1350} y={-160} scale={2.7} fog={fog} wire={false} interior={0.35} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              {/* chained handle */}
              <rect x={850} y={560} width={120} height={24} rx={8} fill="#7a7f88" stroke="#111" strokeWidth={3} />
              {Array.from({ length: 9 }).map((_, i) => <ellipse key={i} cx={760 + i * 34} cy={575 + Math.sin(i) * 6} rx={18} ry={10} fill="none" stroke="#9aa0aa" strokeWidth={6} />)}
              <rect x={1060} y={560} width={60} height={70} rx={8} fill="#a08a30" stroke="#111" strokeWidth={3} />
              <path d="M1072 562 V538 Q1090 514 1108 538 V562" stroke="#8a8f99" strokeWidth={8} fill="none" />
            </svg>
          </Plane>
          <Rain count={180} opacity={0.3} />
          <Post />
        </Stage>
      </Shot>
    </>
  );
};

/* ============ Scene 4 — Wire on locked bus; Joker watches unseen ============ */
export const Scene04: React.FC = () => {
  const f = useCurrentFrame();
  const cS = cue(4, "somewhere");
  const cJ = cue(4, "joke");
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
              pose={{ armNear: [62, 104], handNear: "grip", head: 4, brow: -1, blink: blinkAt(f, 100, 30), bob: breathe(f, 0.25, 2), lean: 4 }} />
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
              <circle cx={940} cy={780} r={60} fill="#ffd9a0" opacity={0.12} />
            </svg>
          </Plane>
          <Plane p={0.8}><Rain count={160} opacity={0.25} speed={30} len={30} /></Plane>
          <Plane p={1.2}>
            <JokerBack x={1460} y={560} scale={1.55} laugh={ci(f, [cJ, cJ + 8], [0, 1])} />
            <Glow x={1460} y={480} r={260} color="80,200,90" opacity={0.12} />
          </Plane>
          <Post tintColor="#3a1a52" tintOpacity={0.22} vignette={0.75} />
        </Stage>
      </Shot>
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
          pose={{ armNear: [96 + polish * 6, 112 + polish * 6], handNear: "fist", armFar: [-8, 14], head: -4 + ci(f, [cB - 10, cB], [0, 6]), smile: 0.45, brow: 0.3, eyeY: ci(f, [cB - 10, cB], [-0.3, 0.8]), blink: blinkAt(f, 70, 30), bob: breathe(f, 0.45, 1.5) }} />
        {glint > 0 && (
          <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}>
            <g transform={`translate(${bx} ${by}) rotate(${f * 4}) scale(${glint})`}>
              <path d="M0 -70 L8 -8 L70 0 L8 8 L0 70 L-8 8 L-70 0 L-8 -8 Z" fill="#fff6d0" />
              <circle r={22} fill="#fff6d0" opacity={0.6} />
            </g>
          </svg>
        )}
      </Plane>
      <Post tintColor="#a05030" tintOpacity={0.14} vignette={0.5} />
      <Caption text="SIX DAYS EARLIER" from={2} to={cR + 18} align="center" y={120} size={54} />
      <FadeIn frames={10} color="#fff" />
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
  const lampOn = ci(f, [cLamp, cLamp + 10], [0, 1]);
  const turn1 = ci(f, [cL, cL + 6, cL + 12], [0, 1, 0]);
  const turn2 = ci(f, [cT - 4, cT + 2, cT + 8, cT + 14], [0, 1, 0, 1]);
  return (
    <>
      <Shot from={0} to={cE}>
        <Stage cam={{ x: 0, y: ci(f, [0, cA, cE], [140, 60, -60], Easing.inOut(Easing.cubic)), zoom: ci(f, [0, cE], [1.0, 1.06]) }}>
          <Plane p={0.2}><Sky variant="night" seed={6} moon={[300, 160, 40]} horizonY={760} /></Plane>
          <Plane p={0.35}><DecoSkyline seed={41} baseY={700} hMin={200} hMax={500} haze={0.5} /></Plane>
          <Plane p={0.7}><StreetFacades seed={9} baseY={820} litP={0.25} heightMin={600} heightMax={760} fireEscapes /></Plane>
          <Plane p={0.85}><ShopFront baseY={830} lamp={0} upstairs={1} sign={1} /></Plane>
          <Plane p={1}><WetStreet horizonY={830} curbY={870} reflections={[{ x: 960, color: "#f5c66a", w: 420, strength: 0.5 }, { x: 650, color: "#ffcf8a", w: 100, strength: 0.5 }]} seed={4} /></Plane>
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
              <text x={1290} y={260} textAnchor="middle" fontFamily="Georgia" fontSize={30} fill="#d9b070" opacity={0.6} letterSpacing={4} transform="scale(-1 1) translate(-2580 0)">REYES REPAIR</text>
              <rect x={1120} y={640} width={340} height={280} fill="#24170e" stroke="#120a06" strokeWidth={6} />
              <rect x={1430} y={560} width={40} height={60} rx={6} fill="#b89040" />
              <circle cx={1450} cy={600} r={7} fill="#1a110a" />
              {/* window sill with lamp (left) */}
              <rect x={160} y={260} width={600} height={420} fill="url(#s6night)" />
              <rect x={160} y={260} width={600} height={420} fill="none" stroke="#1a0f08" strokeWidth={18} />
              <rect x={454} y={260} width={12} height={420} fill="#1a0f08" />
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
            <Character id="s6dad" kind="father" x={ci(f, [cLamp - 30, cLamp - 6], [1180, 640])} y={1120} scale={1.75} facing={f < cLamp - 30 ? 1 : -1} lightSide={-1} nightTint={0.12} rim="#ffb46a"
              prop={f < cLamp - 30 ? "key" : "none"}
              pose={f < cLamp - 30
                ? { armNear: [92, 26 + (turn1 + turn2) * 12], handNear: "grip", head: (turn1 + turn2) * 3, brow: -0.2, blink: blinkAt(f, 60), bob: breathe(f) }
                : f < cLamp - 6
                ? { ...walk(((f - (cLamp - 30)) / 14) % 1, 0.8), head: 2 }
                : { armNear: [ci(f, [cLamp - 6, cLamp], [10, 70]), 30], handNear: "open", head: 6, smile: 0.2 * lampOn, eyeY: 0.6, blink: blinkAt(f, 60) }} />
          </Plane>
          <Post tintColor="#3a2010" tintOpacity={0.12 + 0.1 * lampOn} vignette={0.6} />
        </Stage>
      </Shot>
    </>
  );
};

/* ============ Scene 7 — Father explains lamp as marker of home ============ */
export const Scene07: React.FC = () => {
  const f = useCurrentFrame();
  const cNo = cue(7, "no");
  const cBut = cue(7, "but");
  const shakeHead = f > cNo && f < cNo + 20 ? Math.sin((f - cNo) * 0.6) * 5 : 0;
  return (
    <>
      <Shot from={0} to={cBut}>
        <Stage cam={{ x: ci(f, [0, cBut], [-20, 20]), y: 0, zoom: ci(f, [0, cBut], [1.0, 1.06]) }}>
          <Plane p={0.8}><ShopInterior lamp={1} /></Plane>
          <Plane p={1}>
            <Character id="s7kid" kind="alexYoung" x={720} y={1060} scale={1.55} facing={1} lightSide={1} nightTint={0.08} rim="#ffb46a"
              pose={{ head: -10, brow: 0.6, eyeY: -0.8, armNear: [30, 60], handNear: "point", blink: blinkAt(f, 70, 10), bob: breathe(f), smile: -0.1 }} />
            <Character id="s7dad" kind="father" x={1180} y={1070} scale={1.6} facing={-1} lightSide={1} nightTint={0.08} rim="#ffb46a"
              pose={{ head: 4 + shakeHead, brow: f > cNo ? 0.2 : -0.2, smile: f > cNo + 20 ? 0.35 : 0, eyeY: 0.5, armNear: [24, 60], armFar: [-6, 20], blink: blinkAt(f, 80, 40), bob: breathe(f, 0.35) }} />
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
      {Array.from({ length: 14 }).map((_, i) => <circle key={i} cx={rand(i) * 1920} cy={rand(i * 3) * 600} r={20 + rand(i * 5) * 40} fill="#ffd890" opacity={0.08} />)}
      <g transform={`translate(860 560) rotate(${-8 + shake * Math.sin(f * 2.2) * 4})`}>
        {beam > 0 && <path d="M330 -40 L1500 -420 L1500 420 L330 40 Z" fill="url(#flBeam)" opacity={beam} style={{ mixBlendMode: "screen" }} />}
        <rect x={-460} y={-58} width={680} height={116} rx={18} fill="url(#flM)" stroke="#0a0a0e" strokeWidth={5} />
        {Array.from({ length: 22 }).map((_, i) => <path key={i} d={`M${-440 + rand(i) * 640} ${-50 + rand(i * 3) * 100} l${10 + rand(i * 5) * 40} ${(rand(i * 7) - 0.5) * 12}`} stroke="#eef" strokeWidth={1.3} opacity={0.35} />)}
        {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={-420 + i * 26} y={-58} width={6} height={116} fill="#000" opacity={0.15} />)}
        <path d="M220 -80 H330 V80 H220 Z" fill="url(#flM)" stroke="#0a0a0e" strokeWidth={5} />
        <ellipse cx={330} cy={0} rx={18} ry={78} fill={beam > 0 ? "#fff7d8" : "#5a5c62"} stroke="#0a0a0e" strokeWidth={4} />
        {/* loose switch */}
        <rect x={-40} y={-74} width={90} height={20} rx={6} fill="#1a1a1e" />
        <rect x={-30 + sw * 40} y={-82} width={30} height={22} rx={5} fill="#3a3a40" stroke="#0a0a0e" strokeWidth={3} />
        {/* hand */}
        <path d="M-300 -70 C-260 -110 -120 -110 -60 -66 L-40 70 C-120 120 -260 110 -310 70 Z" fill="url(#flSkin)" stroke="#0a0a0e" strokeWidth={4} />
        {[0, 1, 2].map((i) => <path key={i} d={`M${-250 + i * 60} -84 C${-240 + i * 60} -20 ${-240 + i * 60} 40 ${-246 + i * 60} 92`} stroke="#5a3420" strokeWidth={3} opacity={0.6} fill="none" />)}
        <path d={`M-70 -70 C-40 -110 ${-10 + sw * 30} -110 ${0 + sw * 30} -84`} stroke="#0a0a0e" strokeWidth={4} fill="url(#flSkin)" />
        <rect x={-430} y={-50} width={160} height={6} fill="#1d2b52" opacity={0.9} />
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
  const handed = f > cG + 22;
  const ext = ci(f, [cG - 10, cG + 10], [0, 1]);
  const fl = f > cBm ? ((Math.floor(f / 2) * 7) % 5 < 3 ? 1 : 0.15) * (f > cSh ? (rand(Math.floor(f / 3)) > 0.4 ? 1 : 0) : 1) : 0;
  return (
    <>
      <Shot from={0} to={cM}>
        <Stage cam={{ x: ci(f, [0, cM], [-30, 30]), y: 0, zoom: ci(f, [0, cM], [1.0, 1.08]) }}>
          <Plane p={0.15}><Sky variant="night" seed={11} moon={[1700, 120, 34]} horizonY={900} /></Plane>
          <Plane p={0.7}><Academy /></Plane>
          <Plane p={1}>
            <Character id="s8alex" kind="alexDress" x={800} y={1040} scale={1.4} facing={1} lightSide={1} nightTint={0.15} rim="#ffd890"
              prop={handed ? "flashlight" : "none"}
              pose={{ armNear: handed ? [60, 50] : [8 + ext * 40, 16 + ext * 20], handNear: handed ? "grip" : "open", smile: 0.5, brow: 0.3, head: -2, blink: blinkAt(f, 70, 30), bob: breathe(f) }} />
            <Character id="s8dad" kind="father" x={1120} y={1040} scale={1.38} facing={-1} lightSide={1} nightTint={0.15} rim="#ffd890"
              prop={!handed ? "flashlight" : "none"}
              pose={{ armNear: !handed ? [10 + ext * 66, 30 - ext * 10] : [10, 20], handNear: "grip", head: 3, smile: 0.25, eyeY: 0.3, blink: blinkAt(f, 80), bob: breathe(f, 0.35) }} />
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
  const reach = ci(f, [cK, cK + 14], [0, 1]);
  const dim = ci(f, [cL, cL + 4, cL + 30, cL + 50], [0, 1, 1, 0.3]);
  return (
    <Stage cam={{ x: ci(f, [cK - 10, cK + 30], [0, 200], Easing.inOut(Easing.cubic)), y: ci(f, [cK - 10, cK + 30], [0, -60]), zoom: ci(f, [cK - 10, cK + 30], [1.0, 1.25], Easing.inOut(Easing.cubic)) }}>
      <Plane p={0.15}><Sky variant="night" seed={11} moon={[1700, 120, 34]} horizonY={900} /></Plane>
      <AbsoluteFill style={{ filter: "blur(4px)" }}><Plane p={0.7}><Academy lightsDim={dim} /></Plane></AbsoluteFill>
      <Plane p={1}>
        <Character id="s9alex" kind="alexDress" x={760} y={1280} scale={1.85} facing={1} lightSide={1} nightTint={0.15} rim="#ffd890" prop="flashlight"
          pose={{ armNear: [50 - reach * 20, 60 + reach * 20], handNear: "grip", smile: 0.9 * laugh + 0.1, mouth: laugh * 0.35 * (0.5 + 0.5 * Math.sin(f * 0.9)), head: -6 * laugh + Math.sin(f * 0.9) * 2 * laugh, bob: Math.abs(Math.sin(f * 0.45)) * 5 * laugh, brow: 0.4 * laugh - 0.2 * reach, blink: laugh > 0.5 ? 0.7 : blinkAt(f, 70, 30), eyeX: 0.5 }} />
        <Character id="s9dad" kind="father" x={1180} y={1270} scale={1.8} facing={-1} lightSide={1} nightTint={0.15} rim="#ffd890"
          pose={{ armNear: [10 + reach * 64, 22 - reach * 12], handNear: "open", head: 2, brow: -0.7, smile: -0.25, eyeY: 0.1, blink: blinkAt(f, 90, 50), bob: breathe(f, 0.35) }} />
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
  const walkT = ci(f, [0, 80], [0, 1], (t) => t);
  const ax = 260 + walkT * 560;
  const walking = f < 80;
  const tilt = ci(f, [cR, cR + 40], [0, 1], Easing.inOut(Easing.cubic));
  return (
    <Stage cam={{ x: ci(f, [0, cR], [0, 40]) + tilt * -220, y: -tilt * 320, zoom: ci(f, [0, cR], [1.0, 1.04]) + tilt * 0.5 }}>
      <Plane p={0.15}><Sky variant="night" seed={14} moon={[380, 140, 40]} horizonY={700} /></Plane>
      <Plane p={0.35}><DecoSkyline seed={61} baseY={640} hMin={260} hMax={560} haze={0.45} /></Plane>
      <Plane p={0.85}><Precinct /></Plane>
      <Plane p={1}>
        <Character id="s10mara" kind="mara" x={1100} y={1000} scale={1.15} facing={-1} lightSide={-1} nightTint={0.2} shoulderRadio
          pose={{ armNear: [40, 104], armFar: [34, 100], handNear: "fist", handFar: "fist", head: f > 60 ? 4 : 0, brow: -0.2, smile: f > 85 ? 0.15 : 0, eyeY: 0.2, blink: blinkAt(f, 80, 20), bob: breathe(f, 0.3) }} />
        <Character id="s10alex" kind="alex" x={ax} y={1010} scale={1.15} facing={1} lightSide={-1} nightTint={0.2} shoulderRadio
          pose={walking ? { ...walk((f / 16) % 1), head: -2, smile: 0.3 } : { head: -4, smile: 0.35, brow: 0.3, blink: blinkAt(f, 70, 10), bob: breathe(f) }} />
      </Plane>
      <Plane p={1.2}><Fog y={980} height={160} opacity={0.15} /></Plane>
      <Post />
      <Caption text="OFFICER MARA BENNETT" from={cO} to={cR + 6} x={1060} y={160} size={38} />
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
