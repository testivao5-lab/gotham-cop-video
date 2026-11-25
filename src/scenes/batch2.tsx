import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { Stage, Plane } from "../lib/Camera";
import { ci, rand } from "../lib/anim";
import { sceneDur } from "../lib/cues";
import { metric } from "../lib/world";
import { Post, Rain, Fog, Glow, handheld, Splashes, LightCone, lightning } from "../fx/fx";
import { Character, walkDist, breathe, anchor } from "../characters/Character";
import { Sky, DecoSkyline } from "../world/sky";
import { StreetFacades, WetStreet, StreetLamp, Cruiser, FireEscape } from "../world/street";
import { Precinct, ShopFront } from "../world/places";
import { Caption, EdgeFade, Sfx, Shot, ForegroundRain, TimeJump } from "./common";
import { BankRuins, Barricade, PressPack, PrecinctInterior, GiftBox, ToyCop, CruiserCabin, Parapet, Phone, EZ, cq } from "./kit";

/** granite step / crate a figure sits on (seat top = hip height of the seated pose) */
export const SeatBlock: React.FC<{ x: number; w: number; top: number; bottom: number; color?: string }> = ({ x, w, top, bottom, color = "#5a5660" }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
    <ellipse cx={x + w / 2} cy={bottom + 4} rx={w * 0.6} ry={10} fill="#000" opacity={0.5} />
    <rect x={x} y={top} width={w} height={bottom - top} fill={color} stroke="#0a0a0e" strokeWidth={3} />
    <rect x={x} y={top} width={w} height={8} fill="#8a8690" opacity={0.6} />
    <path d={`M${x + w * 0.3} ${top + 10} l10 ${(bottom - top) * 0.5} M${x + w * 0.7} ${top + 20} l-6 ${(bottom - top) * 0.4}`} stroke="#2a2830" strokeWidth={2} />
  </svg>
);

/** shared night street (far skyline -> facades -> wet street). All sizes from the shot metric. */
export const NightStreet: React.FC<{ hz: number; seed?: number; blackout?: number; sky?: "night" | "storm" | "blackout" | "dawn"; lamps?: number[]; lampOn?: number; facadeY?: number; batSignal?: { x: number; y: number; fromX: number; fromY: number; on: number }; reflections?: { x: number; color: string; w: number; strength?: number }[] }> = ({ hz, seed = 3, blackout = 0, sky = "night", lamps = [], lampOn = 1, facadeY, batSignal, reflections = [] }) => {
  const fy = facadeY ?? hz + 110;
  return (
    <>
      <Plane p={0.12}><Sky variant={sky} seed={seed} moon={sky === "storm" ? undefined : [1500, 160, 40]} horizonY={hz} batSignal={batSignal} /></Plane>
      <Plane p={0.3}><DecoSkyline seed={seed * 7} baseY={hz + 20} hMin={260} hMax={560} haze={0.5} litP={0.2 * (1 - blackout)} count={30} /></Plane>
      <Plane p={0.55}><StreetFacades seed={seed + 2} baseY={fy} litP={0.32 * (1 - blackout)} heightMin={560} heightMax={820} dark={0.12 + blackout * 0.3} /></Plane>
      <Plane p={1}>
        <WetStreet horizonY={fy} curbY={fy + 46} laneY={fy + 200} reflections={reflections} seed={seed} />
        {lamps.map((lx, i) => <StreetLamp key={i} x={lx} baseY={fy + 46} on={lampOn * (1 - blackout)} />)}
        {lampOn * (1 - blackout) > 0 && lamps.map((lx, i) => <LightCone key={`c${i}`} id={`ns${seed}${i}`} x={lx + 62} y={fy + 46 - 500} angle={0} length={540} spread={380} opacity={0.18 * lampOn * (1 - blackout)} />)}
      </Plane>
    </>
  );
};

/* ============ S11 — Damaged bank and reporters (truck past the ruin) ============ */
export const Scene11: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(11);
  const cR = cq(11, "reporters", 0.45);
  const M = metric(640, 190);
  const S = M.human(1000);
  const AX0 = 1700, ax = ci(f, [0, D], [AX0, 980]), mx = ax + 170;
  const cam = { x: ci(f, [0, D], [160, -80], EZ), y: ci(f, [0, D], [-10, 10]), zoom: ci(f, [0, D], [1.0, 1.08], EZ) };
  return (
    <Stage cam={cam}>
      <Plane p={0.12}><Sky variant="night" seed={21} moon={[300, 130, 36]} horizonY={640} /></Plane>
      <Plane p={0.3}><DecoSkyline seed={31} baseY={700} hMin={300} hMax={600} haze={0.5} /></Plane>
      <Plane p={0.7}><BankRuins baseY={780} /></Plane>
      <Plane p={0.85}>
        {/* metric: press at feet 900 -> 1.75 m = 0.6 of a 350 u reporter; barricade 1.1 m */}
        <PressPack x={420} y={900} n={8} s={M.ppm(900) * 1.75 / 350} aim={ci(f, [cR, cR + 30], [0, 1])} flashOn={f > cR ? 1 : 0.3} />
        <Barricade x={360} y={930} w={760} s={M.ppm(930) * 1.1 / 110} />
        <Glow x={360} y={820} r={160} color={Math.floor(f / 8) % 2 ? "255,40,40" : "60,90,255"} opacity={0.35} />
      </Plane>
      <Plane p={1}>
        <WetStreet horizonY={940} curbY={960} laneY={1060} reflections={[{ x: 560, color: "#ffd9a0", w: 80, strength: 0.4 }, { x: 360, color: "#ff3030", w: 40, strength: 0.3 }]} seed={11} />
        <Character id="s11alex" kind="alex" x={ax} y={1000} scale={S} facing={-1} lightSide={-1} nightTint={0.25} shoulderRadio pose={{ ...walkDist(AX0 - ax, "alex", S, 0.85), head: f > cR ? 10 : 4, eyeX: -0.6 }} />
        <Character id="s11mara" kind="mara" x={mx} y={1000} scale={S} facing={-1} lightSide={-1} nightTint={0.25} shoulderRadio pose={{ ...walkDist(AX0 + 170 - mx, "mara", S, 0.85), head: -2, brow: -0.2 }} />
        <Splashes y0={960} y1={1080} count={30} />
      </Plane>
      <Plane p={1.1}><Rain count={140} opacity={0.2} /></Plane>
      <Fog y={760} height={220} opacity={0.18} />
      <Post />
      <EdgeFade inF={8} dur={D} />
      <Sfx name="crowd" at={4} gain={0.5} />
      {[10, 34, 58, 82, 106].map((t, k) => <Sfx key={k} name="step" at={t} gain={0.25} />)}
    </Stage>
  );
};

/* ============ S12 — Mara approaches the employee on the curb ============ */
export const Scene12: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(12);
  const cB = cq(12, "brother", 0.55);
  const M = metric(600, 230);
  const G = 1010, S = M.human(G);
  const stop = 120;
  const mx = ci(f, [0, stop], [-120, 760], Easing.out(Easing.sin));
  const cam = { x: ci(f, [0, stop], [-160, 40], EZ) + ci(f, [stop, D], [0, 30]), y: 0, zoom: ci(f, [0, D], [1.0, 1.12], EZ) };
  return (
    <Stage cam={cam}>
      <Plane p={0.15}><Sky variant="night" seed={22} horizonY={600} /></Plane>
      <Plane p={0.5}><BankRuins baseY={720} work={0.6} /></Plane>
      <Plane p={0.7}><PressPack x={-200} y={820} n={6} s={M.ppm(820) * 1.75 / 350} flashOn={0.6} /></Plane>
      <Plane p={1}>
        <WetStreet horizonY={900} curbY={950} laneY={1060} reflections={[{ x: 900, color: "#ffd9a0", w: 90, strength: 0.4 }]} seed={12} />
        {/* the employee sits on the bank's granite step (seat = hip height 0.4 m): feet on the pavement at G, y = G + thigh * scale */}
        <SeatBlock x={860} w={260} top={G - 92 * S} bottom={G} />
        <Character id="s12emp" kind="employee" x={980} y={G + 94 * S} groundY={G} scale={S} facing={-1} lightSide={-1} nightTint={0.3}
          pose={{ legNear: [82, 92], legFar: [78, 96], lean: 14, head: 22, neck: 8, eyeY: 0.9, armNear: [40, 70], armFar: [34, 76], handNear: "open", handFar: "open", brow: 0.6, smile: -0.4 }} />
        <Character id="s12mara" kind="mara" x={mx} y={G} scale={S} facing={1} lightSide={-1} nightTint={0.25} shoulderRadio
          pose={f < stop ? { ...walkDist(mx + 120, "mara", S, 0.8), head: 4 } : { head: 10 + ci(f, [cB, cB + 20], [0, 6]), eyeY: 0.6, brow: 0.5, lean: ci(f, [stop, stop + 30], [0, 6]) }} />
      </Plane>
      <Plane p={1.15}><Rain count={110} opacity={0.18} /></Plane>
      <Post />
      <Caption text="HER BROTHER WORKED INSIDE" from={cB} to={cB + 60} y={150} />
      <EdgeFade inF={6} dur={D} />
      {[8, 30, 52, 74, 96].map((t, k) => <Sfx key={k} name="step" at={t} gain={0.25} />)}
    </Stage>
  );
};

/* ============ S13 — Mara hands Alex a bottle of water ============ */
export const Scene13: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(13);
  const cH = cq(13, "hands", 0.35);
  const M = metric(560, 300);
  const G = 1000, S = M.human(G);
  const AXA = 700, MXA = 1120;
  const give = ci(f, [cH, cH + 18], [0, 1], EZ), take = ci(f, [cH + 18, cH + 30], [0, 1], EZ);
  const bottle: [number, number] = [AXA + 200 + (1 - give) * 60 - take * 40, 700 - give * 10];
  const hh = handheld(f, 0.5, 13);
  return (
    <Stage cam={{ x: hh.x + ci(f, [0, D], [-20, 20]), y: hh.y, zoom: ci(f, [0, D], [1.06, 1.14]) }}>
      <Plane p={0.3}><BankRuins baseY={640} work={0.5} /></Plane>
      <Plane p={0.5}><AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,7,14,0.6), rgba(5,7,14,0.1))" }} /></Plane>
      <Plane p={1}>
        <WetStreet horizonY={860} curbY={900} laneY={1060} reflections={[{ x: 960, color: "#ff3030", w: 50, strength: 0.25 }]} seed={13} />
        <Character id="s13alex" kind="alex" x={AXA} y={G} scale={S} facing={1} lightSide={1} nightTint={0.22} shoulderRadio
          reachNear={take > 0 ? bottle : undefined} prop={take > 0.5 ? "bottle" : "none"}
          pose={{ head: f < cH ? -4 + Math.sin(f * 0.05) * 3 : 4, eyeX: f < cH ? -0.5 : 0.4, brow: f < cH ? -0.3 : 0.2, handNear: take > 0.5 ? "grip" : "open" }} />
        <Character id="s13mara" kind="mara" x={MXA} y={G} scale={S} facing={-1} lightSide={1} nightTint={0.22} shoulderRadio
          reachNear={take < 1 ? bottle : undefined} prop={take <= 0.5 ? "bottle" : "none"}
          pose={{ head: 6, eyeX: 0.3, brow: 0.2, handNear: "grip" }} />
      </Plane>
      <Plane p={1.15}><Rain count={100} opacity={0.18} /></Plane>
      <Post />
      <EdgeFade dur={D} outF={6} />
      <Sfx name="grab" at={cH + 20} gain={0.4} />
    </Stage>
  );
};

/* ============ S14 — Mara returns with the hospital news (time jump) ============ */
export const Scene14: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(14);
  const cA = cq(14, "alive", 0.5);
  const M = metric(600, 230);
  const G = 1010, S = M.human(G);
  const mx = ci(f, [8, 90], [1900, 1260], Easing.out(Easing.sin));
  const rel = ci(f, [cA, cA + 30], [0, 1], EZ);
  return (
    <Stage cam={{ x: ci(f, [0, D], [40, -20]), y: 0, zoom: ci(f, [0, D], [1.04, 1.12], EZ) }}>
      <Plane p={0.15}><Sky variant="night" seed={24} horizonY={600} /></Plane>
      <Plane p={0.5}><BankRuins baseY={720} work={0.6} /></Plane>
      <Plane p={1}>
        <WetStreet horizonY={900} curbY={950} laneY={1060} reflections={[]} seed={14} />
        <SeatBlock x={860} w={260} top={G - 92 * S} bottom={G} />
        <Character id="s14emp" kind="employee" x={980} y={G + 94 * S} groundY={G} scale={S} facing={1} lightSide={-1} nightTint={0.3}
          pose={{ legNear: [82, 92], legFar: [78, 96], lean: 14 - rel * 12, head: 18 - rel * 30, eyeY: 0.6 - rel, armNear: [40 + rel * 20, 70 + rel * 30], armFar: [34, 76], brow: 0.6 - rel * 0.2, smile: -0.4 + rel * 0.5 }} />
        <Character id="s14alex" kind="alex" x={720} y={G} scale={S} facing={1} lightSide={-1} nightTint={0.25} shoulderRadio prop="bottle" pose={{ head: 6 - rel * 4, eyeX: 0.6, handNear: "grip", armNear: [10, 30] }} />
        <Character id="s14mara" kind="mara" x={mx} y={G} scale={S} facing={-1} lightSide={-1} nightTint={0.25} shoulderRadio
          pose={f < 90 ? { ...walkDist(1900 - mx, "mara", S, 0.8) } : { head: 12, eyeY: 0.6, smile: 0.25 * rel, lean: 6 }} />
      </Plane>
      <Plane p={1.15}><Rain count={90} opacity={0.16} /></Plane>
      <Post />
      <TimeJump at={0} />
      <Caption text="20 MINUTES LATER" from={4} to={56} y={150} />
      <EdgeFade dur={D} outF={6} />
    </Stage>
  );
};

/* ============ S15 — Reporters film the hole, not the reunion ============ */
export const Scene15: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(15);
  const cL = cq(15, "reporters", 0.5);
  const M = metric(620, 210);
  const G = 1000;
  const rack = ci(f, [cL - 10, cL + 20], [0, 1], EZ);
  return (
    <Stage cam={{ x: ci(f, [0, D], [-60, 120], EZ), y: 0, zoom: ci(f, [0, D], [1.0, 1.1], EZ) }}>
      <Plane p={0.15}><Sky variant="night" seed={25} horizonY={620} /></Plane>
      <Plane p={0.6}>
        <BankRuins baseY={780} work={1} />
      </Plane>
      <Plane p={0.85}>
        {/* the two women (dark, un-lit, no cameras) on the left; press pack aimed at the hole on the right */}
        <AbsoluteFill style={{ filter: `blur(${rack * 3}px)` }}>
          <Character id="s15emp" kind="employee" x={330} y={900} scale={M.human(900)} facing={1} lightSide={1} nightTint={0.45} pose={{ head: -6, smile: 0.2, armNear: [60, 60], armFar: [50, 70] }} />
          <Character id="s15mara" kind="mara" x={460} y={900} scale={M.human(900)} facing={-1} lightSide={1} nightTint={0.45} shoulderRadio pose={{ head: 8, armNear: [70, 50] }} />
        </AbsoluteFill>
      </Plane>
      <Plane p={1}>
        <WetStreet horizonY={940} curbY={960} laneY={1060} reflections={[{ x: 1300, color: "#ffffff", w: 160, strength: 0.4 }]} seed={15} />
        <PressPack x={900} y={G} n={8} s={M.ppm(G) * 1.75 / 350} aim={-0.6} flashOn={1} />
        <Glow x={700} y={500} r={460} color="255,250,235" opacity={0.18 * (0.8 + 0.2 * Math.sin(f * 0.3))} />
      </Plane>
      <Plane p={1.1}><Rain count={120} opacity={0.18} /></Plane>
      <Post />
      <EdgeFade dur={D} outF={10} />
      <Sfx name="crowd" at={2} gain={0.45} />
      {[20, 66, 90, 130].map((t, k) => <Sfx key={k} name="click" at={t} gain={0.3} />)}
    </Stage>
  );
};

/* ============ S16 — Bat-Signal on the clouds ============ */
export const Scene16: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(16);
  const cT = cq(16, "traffic", 0.7);
  const on = ci(f, [6, 30], [0, 1], EZ);
  const slow = ci(f, [cT, cT + 40], [1, 0.25], EZ);
  const M = metric(820, 130);
  const S = M.human(1000);
  const tilt = ci(f, [0, 90], [-260, 0], EZ);
  return (
    <Stage cam={{ x: 0, y: tilt, zoom: ci(f, [0, D], [1.0, 1.06]) }}>
      <Plane p={0.1}><Sky variant="night" seed={16} horizonY={820} clouds={14} batSignal={{ x: 1180, y: 220, fromX: 1500, fromY: 900, on }} /></Plane>
      <Plane p={0.3}><DecoSkyline seed={63} baseY={860} hMin={220} hMax={520} haze={0.4} litP={0.26} /></Plane>
      <Plane p={0.6}>
        {/* traffic stream on the avenue below: headlight pairs decelerate when the signal lights */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <rect x={-400} y={900} width={2720} height={700} fill="#0b0e18" />
          {Array.from({ length: 16 }).map((_, i) => {
            const sp = (3 + rand(i) * 3) * slow;
            const x = ((rand(i * 3) * 2600 + f * sp * (i % 2 ? 1 : -1)) % 2600 + 2600) % 2600 - 340;
            const y = 930 + (i % 2) * 40;
            return <g key={i}><circle cx={x} cy={y} r={5} fill={i % 2 ? "#fff3d0" : "#ff3a2a"} /><circle cx={x + 16} cy={y} r={5} fill={i % 2 ? "#fff3d0" : "#ff3a2a"} /><ellipse cx={x + 8} cy={y + 16} rx={20} ry={4} fill={i % 2 ? "#fff3d0" : "#ff3a2a"} opacity={0.25} /></g>;
          })}
        </svg>
      </Plane>
      <Plane p={1}>
        <Parapet y={1000} />
        <Character id="s16alex" kind="alex" x={420} y={1530} crop="waist" scale={3.2} facing={1} lightSide={1} nightTint={0.35} rim="#cfd8ff" shoulderRadio viewAngle="back"
          pose={{ head: -18, neck: -10, eyeY: -1 }} />
      </Plane>
      <Plane p={1.1}><Rain count={50} opacity={0.12} /></Plane>
      <Post />
      <EdgeFade inF={10} dur={D} />
      <Sfx name="switch" at={6} gain={0.4} />
    </Stage>
  );
};

/* ============ S17 — Mara drives, Alex looks up ============ */
export const Scene17: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(17);
  const cM = cq(17, "maybe", 0.55);
  const cP = cq(17, "phones", 0.85);
  const hh = handheld(f, 0.5, 17);
  return (
    <Stage cam={{ x: hh.x, y: hh.y, zoom: ci(f, [0, D], [1.0, 1.06]) }}>
      <CruiserCabin signal={0.6}>
        {/* front seats seen through the windshield: Mara driving (left), Alex leaning to look up (right) */}
        <Character id="s17mara" kind="mara" x={620} y={1480} crop="waist" scale={3.0} facing={1} lightSide={1} nightTint={0.3} shoulderRadio
          reachNear={[640, 1010]} reachFar={[560, 1010]} pose={{ head: f > cM ? 10 + Math.sin(f * 0.05) * 2 : 2, eyeX: f > cM ? 0.8 : 0, brow: 0.2, smile: f > cP ? 0.15 : 0, handNear: "grip", handFar: "grip" }} />
        <Character id="s17alex" kind="alex" x={1320} y={1480} crop="waist" scale={3.0} facing={-1} lightSide={-1} nightTint={0.3} shoulderRadio
          pose={{ head: f < cM ? -20 : -6, neck: f < cM ? -12 : -4, eyeY: f < cM ? -1 : 0, eyeX: f < cM ? 0 : 0.7, lean: -4 }} />
      </CruiserCabin>
      <Glow x={1300} y={130} r={300} color="255,240,200" opacity={0.12} />
      <Post tintOpacity={0.14} />
      <EdgeFade inF={6} dur={D} />
      <Sfx name="static" at={cP} gain={0.3} />
    </Stage>
  );
};

/* ============ S18 — Robber hangs upside down from the fire escape ============ */
export const Scene18: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(18);
  const cH = cq(18, "hanging", 0.5);
  const M = metric(560, 240);
  const G = 1000, S = M.human(G);
  const sway = Math.sin(f * 0.07) * 6;
  const arr = ci(f, [0, cH], [0, 1], EZ);
  return (
    <Stage cam={{ floor: G, x: ci(f, [0, D], [-80, 60]), y: ci(f, [cH, cH + 60], [0, -140], EZ), zoom: ci(f, [0, D], [1.0, 1.1], EZ) }}>
      <Plane p={0.1}><Sky variant="night" seed={18} horizonY={560} /></Plane>
      <Plane p={0.7}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <rect x={-200} y={-600} width={1400} height={1500} fill="#2e1e20" />
          {Array.from({ length: 40 }).map((_, i) => <path key={i} d={`M-200 ${-600 + i * 38} H1200`} stroke="#000" strokeOpacity={0.25} />)}
          {Array.from({ length: 4 }).map((_, r) => [80, 420, 760].map((x) => <rect key={`${r}${x}`} x={x} y={-500 + r * 300} width={130} height={170} fill={rand(r * 3 + x) > 0.5 ? "#e8b860" : "#141418"} stroke="#0a0a0e" strokeWidth={6} />))}
        </svg>
        {/* fire escape (FireEscape is an svg <g> — it must live inside an <svg>; landings line up with the window rows) */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {[-220, 80, 380].map((ly, k) => <g key={ly}>
            <rect x={260} y={ly} width={700} height={8} fill="#0b0e16" />
            <rect x={260} y={ly - 92} width={700} height={5} fill="#0b0e16" />
            {Array.from({ length: 15 }).map((_, b) => <rect key={b} x={260 + b * 50} y={ly - 92} width={3} height={92} fill="#0b0e16" />)}
            <rect x={260} y={ly} width={700} height={2} fill="#6f86ad" opacity={0.35} />
            {k < 2 && <path d={k % 2 === 0 ? `M${360} ${ly} L${640} ${ly + 300}` : `M${860} ${ly} L${580} ${ly + 300}`} stroke="#0b0e16" strokeWidth={7} />}
            {k < 2 && Array.from({ length: 9 }).map((_, r) => { const t = (r + 1) / 10; const x0 = k % 2 === 0 ? 360 + 280 * t : 860 - 280 * t; return <path key={r} d={`M${x0 - 16} ${ly + 300 * t} h32`} stroke="#0b0e16" strokeWidth={3} />; })}
          </g>)}
          {/* bracket bolts into the brick */}
          {[-220, 80, 380].map((ly) => [300, 920].map((bx) => <path key={`${ly}${bx}`} d={`M${bx} ${ly + 8} l-30 50`} stroke="#0b0e16" strokeWidth={5} />))}
        </svg>
        {/* the robber, cable-wrapped, hanging by his ankles from the lowest landing */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <g transform={`translate(${620 + sway} 410) rotate(${sway * 0.6})`}>
            <path d="M0 -20 V30" stroke="#1a1a1a" strokeWidth={5} />
          </g>
        </svg>
        <div style={{ position: "absolute", inset: 0, transform: `rotate(${180 + sway * 0.6}deg)`, transformOrigin: `${620 + sway}px 440px` }}>
          <Character id="s18rob" kind="robber" x={620 + sway} y={440} scale={M.human(860)} facing={1} lightSide={1} nightTint={0.25} crop="transit" shadow={0}
            pose={{ armNear: [176, 10], armFar: [-176, 10], handNear: "fist", handFar: "fist", legNear: [2, 0], legFar: [-2, 0], head: Math.sin(f * 0.09) * 8, brow: 0.8, smile: -0.5 }} />
        </div>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {/* cable wraps */}
          {Array.from({ length: 6 }).map((_, k) => <ellipse key={k} cx={620 + sway} cy={470 + k * 34} rx={34} ry={7} fill="none" stroke="#2a2a2a" strokeWidth={5} transform={`rotate(${sway * 0.6} ${620 + sway} 440)`} />)}
          {/* stolen bag lying untouched below */}
          <g transform="translate(600 870)"><ellipse cx={0} cy={6} rx={70} ry={10} fill="#000" opacity={0.5} /><path d="M-56 0 Q-60 -50 -30 -56 H30 Q60 -50 56 0 Z" fill="#3a3024" stroke="#0a0a0e" strokeWidth={3} /><path d="M-24 -56 Q0 -86 24 -56" stroke="#1a1410" strokeWidth={6} fill="none" /><text x={0} y={-18} textAnchor="middle" fontFamily="Georgia" fontWeight={700} fontSize={26} fill="#c9a640">$</text></g>
        </svg>
      </Plane>
      <Plane p={1}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}><rect x={-400} y={880} width={2720} height={800} fill="#121420" /></svg>
        <Cruiser x={ci(f, [0, 60], [2200, 1300], Easing.out(Easing.cubic))} y={990 - 164 * M.car(990)} scale={M.car(990)} />
        <Character id="s18alex" kind="alex" x={ci(f, [50, 110], [1700, 1220])} y={G} scale={S} facing={-1} lightSide={-1} nightTint={0.25} shoulderRadio
          pose={f < 110 ? { ...walkDist(1700 - ci(f, [50, 110], [1700, 1220]), "alex", S, 1) } : { head: -14, eyeY: -0.8 }} />
        <Character id="s18mara" kind="mara" x={ci(f, [60, 120], [1800, 1420])} y={G} scale={S} facing={-1} lightSide={-1} nightTint={0.25} shoulderRadio
          pose={f < 120 ? { ...walkDist(1800 - ci(f, [60, 120], [1800, 1420]), "mara", S, 1) } : { head: -8, eyeY: -0.5 }} />
        <Glow x={1300 + 220} y={860} r={240} color={Math.floor(f / 6) % 2 ? "255,40,40" : "60,90,255"} opacity={0.3 * arr} />
      </Plane>
      <Plane p={1.1}><Rain count={120} opacity={0.18} /></Plane>
      <Post />
      <EdgeFade inF={8} dur={D} />
      <Sfx name="whoosh" at={20} gain={0.4} />
      <Sfx name="chain" at={cH} gain={0.3} />
    </Stage>
  );
};

/* ============ S19 — A cape disappears over the roof edge ============ */
export const Scene19: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(19);
  const cC = cq(19, "cape", 0.3);
  const gone = ci(f, [cC, cC + 14], [0, 1], Easing.in(Easing.quad));
  return (
    <Stage cam={{ x: 0, y: ci(f, [0, cC], [120, 0], EZ), zoom: ci(f, [0, D], [1.0, 1.12], EZ) + ci(f, [cC, cC + 6], [0, 0.04]) }}>
      <Plane p={0.1}><Sky variant="night" seed={19} horizonY={900} moon={[1240, 260, 70]} clouds={10} /></Plane>
      <Plane p={0.6}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {/* worm's-eye: brick wall rising to a roof edge with a cornice */}
          <path d="M-200 1400 L200 520 L1720 520 L2120 1400 Z" fill="#2a1c20" />
          {Array.from({ length: 22 }).map((_, i) => <path key={i} d={`M${-200 + i * 110} 1400 L${200 + i * 70} 520`} stroke="#000" strokeOpacity={0.2} />)}
          <rect x={160} y={500} width={1600} height={30} fill="#3a2a2e" stroke="#0a0a0e" strokeWidth={3} />
          {/* the cape: a black scalloped shape whipping over the edge */}
          {gone < 1 && (
            <g transform={`translate(${980 + gone * 180} ${500 - gone * 90})`} opacity={1 - gone * 0.3}>
              <path d={`M-160 0 C-120 -60 -40 -90 40 -80 C120 -70 180 -30 200 10 L170 0 L150 26 L120 4 L90 30 L60 8 L30 34 L0 10 L-40 30 L-70 6 L-110 26 Z`} fill="#06070c" />
              <path d="M-120 -30 C-60 -70 40 -80 140 -40" stroke="#3a4560" strokeWidth={3} fill="none" opacity={0.6} />
            </g>
          )}
        </svg>
      </Plane>
      <Plane p={1}>
        <Character id="s19alex" kind="alex" x={380} y={1530} crop="waist" scale={3.2} facing={1} lightSide={1} nightTint={0.35} rim="#cfd8ff" shoulderRadio
          pose={{ head: -24, neck: -14, eyeY: -1, brow: f > cC + 10 ? 0.7 : 0.2, mouth: 0 }} />
      </Plane>
      <Plane p={1.1}><Rain count={70} opacity={0.14} /></Plane>
      <Post />
      <EdgeFade dur={D} outF={8} />
      <Sfx name="cloth" at={cC} gain={0.5} />
    </Stage>
  );
};

/* ============ S20 — Paramedics check the robber ============ */
export const Scene20: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(20);
  const cS = cq(20, "smile", 0.8);
  const M = metric(600, 240);
  const G = 1000, S = M.human(G);
  return (
    <Stage cam={{ x: ci(f, [0, D], [-30, 40]), y: 0, zoom: ci(f, [0, D], [1.02, 1.1], EZ) }}>
      <Plane p={0.12}><Sky variant="night" seed={20} horizonY={600} /></Plane>
      <Plane p={0.6}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <rect x={-400} y={-200} width={2720} height={1000} fill="#2a1c20" />
          {Array.from({ length: 30 }).map((_, i) => <path key={i} d={`M-400 ${-200 + i * 34} H2320`} stroke="#000" strokeOpacity={0.22} />)}
          {/* ambulance rear: open doors, warm interior */}
          <g transform="translate(1180 560)">
            {[90, 470].map((wx) => <g key={wx}><circle cx={wx} cy={340} r={46} fill="#111" /><circle cx={wx} cy={340} r={18} fill="#8a93a3" /></g>)}
            <rect x={-10} y={320} width={580} height={16} fill="#2a2a30" />
            <rect x={0} y={0} width={560} height={330} fill="#e8e4dc" stroke="#0a0a0e" strokeWidth={4} />
            <rect x={60} y={40} width={440} height={260} fill="#ffeccc" />
            <rect x={80} y={210} width={400} height={30} fill="#c8c0b0" />
            <path d="M200 120 h30 v-30 h30 v30 h30 v30 h-30 v30 h-30 v-30 h-30 Z" fill="#d02020" />
            <rect x={0} y={-30} width={560} height={30} fill="#d02020" />
            <circle cx={60} cy={-44} r={16} fill={Math.floor(f / 7) % 2 ? "#ff3030" : "#601010"} /><circle cx={500} cy={-44} r={16} fill={Math.floor(f / 7) % 2 ? "#601010" : "#ff3030"} />
          </g>
        </svg>
      </Plane>
      <Plane p={1}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}><rect x={-400} y={900} width={2720} height={800} fill="#14161f" /></svg>
        {/* robber, now on the ground, yelling, cradling his arm; paramedic kneels to check it */}
        <SeatBlock x={720} w={220} top={G - 96 * S} bottom={G} color="#3a3a44" />
        <Character id="s20rob" kind="robber" x={820} y={G + 100 * S} groundY={G} scale={S} facing={1} lightSide={1} nightTint={0.25}
          pose={{ legNear: [84, 90], legFar: [76, 96], lean: -6 + Math.sin(f * 0.3) * 3, head: -10 + Math.sin(f * 0.4) * 5, brow: 0.9, smile: -0.6, armNear: [60, 120], armFar: [40, 100], handNear: "fist" }} />
        <Character id="s20alex" kind="alex" x={380} y={G} scale={S} facing={1} lightSide={1} nightTint={0.25} shoulderRadio pose={{ head: 4, smile: f > cS ? 0.35 : 0, eyeX: 0.4 }} />
        <Character id="s20mara" kind="mara" x={560} y={G} scale={S} facing={1} lightSide={1} nightTint={0.25} shoulderRadio pose={{ head: f > cS ? -8 : 2, eyeX: f > cS ? -0.6 : 0.4, brow: 0.3 }} />
        <Character id="s20med" kind="reporter" x={1080} y={G} scale={S} facing={-1} lightSide={1} nightTint={0.2} reachNear={[930, G - 230 * S]} pose={{ lean: 22, head: 18, eyeY: 0.6, handNear: "open" }} />
      </Plane>
      <Plane p={1.1}><Rain count={90} opacity={0.16} /></Plane>
      <Post />
      <EdgeFade dur={D} outF={6} />
    </Stage>
  );
};

/* ============ S21 — Residents watch the roof ============ */
export const Scene21: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(21);
  const cR = cq(21, "roof", 0.45);
  const cG = cq(21, "gotham", 0.7);
  const M = metric(640, 220);
  const S = M.human(1000);
  return (
    <>
      <Shot from={0} to={cR + 30}>
        <Stage cam={{ x: ci(f, [0, cR + 30], [0, 60]), y: ci(f, [0, cR + 30], [60, -80], EZ), zoom: ci(f, [0, cR + 30], [1.0, 1.08]) }}>
          <Plane p={0.1}><Sky variant="night" seed={21} horizonY={300} /></Plane>
          <Plane p={0.8}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <rect x={-200} y={160} width={2320} height={1200} fill="#2e2024" />
              <rect x={-200} y={140} width={2320} height={26} fill="#3a2c30" />
              {Array.from({ length: 4 }).map((_, r) => Array.from({ length: 9 }).map((_, c) => {
                const x = 40 + c * 210, y = 240 + r * 220, lit = rand(r * 9 + c + 4) > 0.3;
                const look = ci(f, [20 + c * 4, 40 + c * 4], [0, 1]);
                return (
                  <g key={`${r}${c}`}>
                    <rect x={x} y={y} width={120} height={150} fill={lit ? "#e8b860" : "#141418"} stroke="#0a0a0e" strokeWidth={6} />
                    {lit && rand(r * 13 + c) > 0.25 && (
                      <g transform={`translate(${x + 60} ${y + 150})`}>
                        <path d="M-34 0 C-34 -40 -24 -54 0 -56 C24 -54 34 -40 34 0 Z" fill="#1a1418" />
                        <g transform={`rotate(${-look * 14})`}><ellipse cx={0} cy={-76} rx={20} ry={23} fill="#1a1418" /></g>
                      </g>
                    )}
                    <path d={`M${x} ${y + 75} H${x + 120}`} stroke="#0a0a0e" strokeWidth={5} />
                  </g>
                );
              }))}
            </svg>
          </Plane>
          <Post />
        </Stage>
      </Shot>
      <Shot from={cR + 30} to={D + 1}>
        <Stage cam={{ x: ci(f, [cR + 30, D], [0, 30]), y: 0, zoom: ci(f, [cR + 30, D], [1.04, 1.12], EZ) }}>
          <NightStreet hz={640} seed={8} lamps={[260]} />
          <Plane p={1}>
            <Character id="s21mara" kind="mara" x={1060} y={1000} scale={S} facing={-1} lightSide={-1} nightTint={0.25} shoulderRadio
              pose={{ head: f > cG ? -10 : 4, eyeY: f > cG ? -0.6 : 0, armNear: f < cG ? [150, 20] : [10, 20], handNear: f < cG ? "point" : "open", brow: 0.4 }} />
            <Character id="s21alex" kind="alex" x={760} y={1000} scale={S} facing={1} lightSide={-1} nightTint={0.25} shoulderRadio pose={{ head: -12, eyeY: -0.6, brow: 0.4 }} />
          </Plane>
          <Plane p={1.1}><Rain count={100} opacity={0.16} /></Plane>
          <Post />
        </Stage>
      </Shot>
      <Caption text="EVEN THE GOOD NEWS MAKES PEOPLE AFRAID TO LOOK UP" from={cG} to={D - 8} y={150} />
      <EdgeFade dur={D} outF={12} />
    </>
  );
};

/* ============ S22 — Red-ribbon package at the precinct ============ */
export const Scene22: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(22);
  const cC = cq(22, "clears", 0.75);
  const M = metric(560, 260);
  const S = M.human(1000);
  const clear = ci(f, [cC, cC + 40], [0, 1], EZ);
  return (
    <Stage cam={{ floor: 1000, x: ci(f, [0, D], [0, 40]), y: 0, zoom: ci(f, [0, cC], [1.0, 1.25], EZ) + ci(f, [cC, D], [0, -0.1]) }}>
      <Plane p={0.6}><PrecinctInterior lights={1} /></Plane>
      <Plane p={0.6}><GiftBox x={620} y={764} s={0.62} /></Plane>
      <Plane p={1}>
        <Character id="s22alex" kind="alex" x={ci(f, [cC, cC + 40], [520, 200])} y={1000} scale={S} facing={1} lightSide={1} nightTint={0.12} shoulderRadio pose={{ head: 6, eyeY: 0.4, brow: 0.4, ...(clear > 0 && clear < 1 ? walkDist(clear * 320, "alex", S, 0.7) : {}) }} />
        <Character id="s22mara" kind="mara" x={ci(f, [cC, cC + 40], [1360, 1700])} y={1000} scale={S} facing={-1} lightSide={1} nightTint={0.12} shoulderRadio pose={{ head: 8, eyeY: 0.4, brow: 0.5, armNear: clear > 0 ? [60, 40] : [8, 14] }} />
        <Character id="s22spec" kind="specialist" x={ci(f, [cC + 30, cC + 90], [2100, 1500])} y={1000} scale={S} facing={-1} lightSide={1} nightTint={0.12} pose={{ ...walkDist(2100 - ci(f, [cC + 30, cC + 90], [2100, 1500]), "specialist", S, 0.8) }} />
      </Plane>
      <Post tintOpacity={0.1} />
      <EdgeFade inF={8} dur={D} />
      <Sfx name="thud" at={4} gain={0.3} />
      {[cC + 2, cC + 22].map((t, k) => <Sfx key={k} name="step" at={t} gain={0.3} />)}
    </Stage>
  );
};

/* ============ S23 — Specialist releases the wind-up toy ============ */
export const Scene23: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(23);
  const cR = cq(23, "releases", 0.55);
  const cF = cq(23, "falls", 0.9);
  const lid = ci(f, [6, 40], [0, 1], EZ);
  const march = ci(f, [cR, cF], [0, 1]);
  const tx = 760 + march * 520;
  const tip = ci(f, [cF, cF + 10], [0, 1], Easing.in(Easing.quad));
  const S = 1.3;
  return (
    <Stage cam={{ x: ci(f, [0, cR], [0, 0]) + march * 140, y: 0, zoom: ci(f, [0, D], [1.0, 1.1], EZ) }}>
      <Plane p={0.4}><PrecinctInterior lights={0.9} clear={1} /></Plane>
      <Plane p={1}>
        {/* bomb-squad specialist BEHIND the table: winds the key, then lets go (table top hides him below the chest) */}
        <Character id="s23spec" kind="specialist" x={560} y={1060} crop="closeup" scale={1.6} facing={1} lightSide={1} nightTint={0.1}
          reachNear={f < cR ? [736, 650] : [660, 640]} reachFar={f < cR ? [700, 680] : [620, 690]} pose={{ head: 16, eyeY: 0.8, handNear: f < cR ? "grip" : "open", handFar: "open" }} />
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {/* metal table (0.75 m), back-stop wall block at the far end */}
          <rect x={-200} y={700} width={2320} height={40} fill="#8a909c" stroke="#0a0a0e" strokeWidth={3} />
          <rect x={-200} y={740} width={2320} height={500} fill="#3a3e48" />
          <rect x={1340} y={560} width={60} height={140} fill="#5a4c40" stroke="#0a0a0e" strokeWidth={3} />
        </svg>
        <GiftBox x={380} y={700} s={0.7} lid={lid} />
        <ToyCop x={march > 0 ? Math.min(tx, 1318) : 760} y={700} s={2.4} keyRot={march > 0 && tip < 1 ? -f * 18 : 0} step={march > 0 && tip < 0.1 ? f * 0.9 : 0} tip={tip} />

      </Plane>
      <Post tintOpacity={0.08} />
      <EdgeFade dur={D} outF={6} />
      {Array.from({ length: 12 }).map((_, k) => <Sfx key={k} name="click" at={cR - 40 + k * 3} gain={0.2} />)}
      <Sfx name="thud" at={cF} gain={0.35} />
    </Stage>
  );
};

/* ============ S24 — Message taped to the toy ============ */
export const Scene24: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(24);
  const cH = cq(24, "how", 0.3);
  const cL = cq(24, "let's", 0.75);
  const zoom = ci(f, [0, cH], [1.0, 1.8], EZ);
  return (
    <Stage cam={{ x: 0, y: 0, zoom }}>
      <Plane p={0.3}><AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #3a3e48, #0c0e14)" }} /></Plane>
      <Plane p={1}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <rect x={-400} y={760} width={2720} height={700} fill="#5a606c" />
        </svg>
        <ToyCop x={700} y={780} s={4.4} tip={1} note={1} />
      </Plane>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ background: "#f4f0e2", padding: "40px 60px", transform: `rotate(-3deg) scale(${ci(f, [cH - 6, cH + 8], [0.6, 1], EZ)})`, opacity: ci(f, [cH - 6, cH + 4], [0, 1]), boxShadow: "0 20px 60px #000", fontFamily: "'Courier New', monospace", color: "#1a1a1a", fontSize: 46, textAlign: "center" }}>
          HOW MANY COPS DOES IT TAKE<br />TO SAVE GOTHAM?
          <div style={{ color: "#c01020", fontSize: 58, marginTop: 24, opacity: ci(f, [cL, cL + 8], [0, 1]), fontFamily: "'Brush Script MT', cursive" }}>Let's find out.</div>
        </div>
      </AbsoluteFill>
      <Post tintOpacity={0.08} />
      <EdgeFade dur={D} outF={8} />
    </Stage>
  );
};

/* ============ S25 — Toy sealed in evidence; Mara sends Alex home ============ */
export const Scene25: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(25);
  const cM = cq(25, "mara", 0.7);
  const M = metric(560, 260);
  const S = M.human(1000);
  return (
    <Stage cam={{ x: ci(f, [0, D], [80, -40]), y: 0, zoom: ci(f, [0, D], [1.12, 1.04], EZ) }}>
      <Plane p={0.6}><PrecinctInterior lights={0.8} /></Plane>
      <Plane p={0.9}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {/* evidence bag on the desk (toy inside, red EVIDENCE strip) */}
          <g transform="translate(560 760) rotate(-4)">
            <rect x={-60} y={-90} width={120} height={90} fill="#dfe8ee" opacity={0.55} stroke="#8a9aa8" strokeWidth={2} />
            <rect x={-60} y={-90} width={120} height={16} fill="#c01020" />
            <text x={0} y={-78} textAnchor="middle" fontFamily="Arial" fontWeight={700} fontSize={11} fill="#fff">EVIDENCE</text>
            <g transform="rotate(80) translate(-40 -10) scale(0.9)"><rect x={-12} y={-50} width={24} height={40} rx={6} fill="#2a3e7a" /><circle cx={0} cy={-60} r={10} fill="#f4dcc4" /></g>
          </g>
        </svg>
      </Plane>
      <Plane p={1}>
        <Character id="s25alex" kind="alex" x={900} y={1000} scale={S} facing={1} lightSide={1} nightTint={0.12} shoulderRadio pose={{ head: f < cM ? 10 : 2, eyeY: f < cM ? 0.8 : 0, eyeX: f < cM ? -0.6 : 0.5, brow: 0.4 }} />
        <Character id="s25mara" kind="mara" x={1240} y={1000} scale={S} facing={-1} lightSide={1} nightTint={0.12} shoulderRadio reachNear={f > cM ? anchor("alex", 900, 1000, S, 1, "shoulderFar") : undefined} pose={{ head: 4, smile: f > cM ? 0.2 : 0, brow: 0.3 }} />
        <Character id="s25bg" kind="reporter" x={1680} y={1000} scale={S} facing={-1} lightSide={1} nightTint={0.3} pose={{ head: 20, eyeY: 0.8, eyeX: -0.8 }} />
      </Plane>
      <Post tintOpacity={0.12} />
      <EdgeFade dur={D} outF={8} />
    </Stage>
  );
};

/* ============ S26 — Alex calls his father at the shop; line goes dead ============ */
export const Scene26: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(26);
  const cS = cq(26, "shop", 0.25);
  const cP = cq(26, "promise", 0.55);
  const cD = cq(26, "dead", 0.9);
  const flick = f > cS && f < cP ? (Math.floor(f / 4) % 5 === 0 ? 0.3 : 1) : 1;
  const M = metric(560, 300);
  const S = M.human(1000);
  return (
    <>
      <Shot from={0} to={cS}>
        <Stage cam={{ x: 0, y: 0, zoom: ci(f, [0, cS], [1.05, 1.15]) }}>
          <Plane p={0.6}><PrecinctInterior lights={0.6} /></Plane>
          <Plane p={1}>
            <Character id="s26alexA" kind="alex" x={900} y={1000} scale={S} facing={1} lightSide={1} nightTint={0.15} shoulderRadio prop="phone" propOn={1}
              reachNear={anchor("alex", 900, 1000, S, 1, "radio")} pose={{ head: 6, eyeY: 0.3, smile: 0.1, handNear: "grip" }} />
          </Plane>
          <Post />
        </Stage>
      </Shot>
      <Shot from={cS} to={D + 1}>
        <Stage cam={{ x: ci(f, [cS, D], [0, 40]), y: 0, zoom: ci(f, [cS, D], [1.0, 1.12], EZ) }}>
          <Plane p={0.12}><Sky variant="night" seed={26} horizonY={640} /></Plane>
          <Plane p={0.3}><DecoSkyline seed={26} baseY={700} hMin={300} hMax={600} haze={0.5} /></Plane>
          <Plane p={1}>
            <ShopFront baseY={940} lamp={f > cD ? 0 : flick} doorLight={0.6 * flick} />
            <WetStreet horizonY={940} curbY={970} laneY={1060} reflections={[{ x: 960, color: "#ffd9a0", w: 120, strength: 0.5 * flick }]} seed={26} />
          </Plane>
          <Plane p={1.1}><Rain count={120} opacity={0.18} /></Plane>
          <Post />
        </Stage>
      </Shot>
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        {f < cS && <Phone x={1660} y={860} s={0.9} speaker={1} />}
      </AbsoluteFill>
      {f >= cD && f < cD + 30 && <AbsoluteFill style={{ background: "#000", opacity: ci(f, [cD, cD + 3, cD + 30], [0, 0.6, 0]) }} />}
      <EdgeFade dur={D} outF={10} />
      <Sfx name="static" at={cD} gain={0.4} />
    </>
  );
};

/* ============ S27 — Blackout rolls across the city ============ */
export const Scene27: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(27);
  const cF = cq(27, "first", 0.25);
  const cT = cq(27, "traffic", 0.45);
  const cS = cq(27, "signal", 0.75);
  const black = ci(f, [cF, cT + 60], [0, 1]);
  const sigOn = f < cS + 10 ? 1 : 0;
  const sweep = ci(f, [0, cS + 10], [960, 1260]);
  return (
    <Stage cam={{ x: ci(f, [0, D], [-60, 60]), y: 0, zoom: ci(f, [0, D], [1.0, 1.1], EZ) }}>
      <Plane p={0.1}><Sky variant={black > 0.6 ? "blackout" : "night"} seed={27} horizonY={760} clouds={12} batSignal={{ x: sweep, y: 200, fromX: 1600, fromY: 760, on: sigOn }} /></Plane>
      {sigOn === 0 && f < cS + 60 && <AbsoluteFill style={{ background: `radial-gradient(circle at ${sweep / 19.2}% 18.5%, rgba(200,210,230,${0.15 * ci(f, [cS + 10, cS + 60], [1, 0])}) 0%, rgba(0,0,0,0) 12%)` }} />}
      <Plane p={0.3}><DecoSkyline seed={71} baseY={800} hMin={300} hMax={640} haze={0.4} litP={0.3} blackout={black} /></Plane>
      <Plane p={0.55}><DecoSkyline seed={72} baseY={860} hMin={200} hMax={480} haze={0.2} litP={0.34} blackout={Math.min(1, black * 1.3)} body="#0e1424" /></Plane>
      <Plane p={0.8}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <rect x={-400} y={860} width={2720} height={800} fill="#080a12" />
          {/* traffic lights wink out left to right */}
          {Array.from({ length: 8 }).map((_, i) => {
            const off = black * 10 > i + 1;
            return <g key={i}><rect x={100 + i * 240} y={800} width={6} height={80} fill="#111" /><rect x={88 + i * 240} y={760} width={30} height={50} rx={5} fill="#1a1a1a" /><circle cx={103 + i * 240} cy={775} r={7} fill={off ? "#200" : "#ff3030"} /><circle cx={103 + i * 240} cy={795} r={7} fill={off ? "#020" : "#30ff60"} opacity={0.6} /></g>;
          })}
        </svg>
      </Plane>
      <Post />
      <EdgeFade inF={8} dur={D} />
      <Sfx name="thud" at={cF} gain={0.3} />
      <Sfx name="thud" at={cF + 40} gain={0.3} />
      <Sfx name="switch" at={cS + 10} gain={0.4} />
    </Stage>
  );
};

/* ============ S28 — Dispatch calls flood the cruiser radio ============ */
export const Scene28: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(28);
  const cB = cq(28, "bus", 0.7);
  const cC = cq(28, "closest", 0.9);
  const hh = handheld(f, 0.6, 28);
  return (
    <Stage cam={{ x: hh.x, y: hh.y, zoom: ci(f, [0, D], [1.0, 1.08]) }}>
      <CruiserCabin dark={0.85} signal={0.5 + 0.5 * Math.abs(Math.sin(f * 0.4))} speed={f > cC ? 2.2 : 1}>
        <Character id="s28mara" kind="mara" x={620} y={1480} crop="waist" scale={3.0} facing={1} lightSide={1} nightTint={0.35} shoulderRadio
          reachNear={[640, 1010]} reachFar={f > cB ? [940, 950] : [560, 1010]} pose={{ head: f > cB ? 14 : 0, eyeX: f > cB ? 0.8 : 0, brow: 0.5, handNear: "grip", handFar: "grip" }} />
        <Character id="s28alex" kind="alex" x={1320} y={1480} crop="waist" scale={3.0} facing={-1} lightSide={-1} nightTint={0.35} shoulderRadio
          reachNear={anchor("alex", 1320, 1480, 3.0, -1, "radio")} pose={{ head: 10, eyeY: 0.4, brow: 0.6, handNear: "grip" }} />
      </CruiserCabin>
      <AbsoluteFill style={{ background: Math.floor(f / 10) % 2 ? "rgba(255,30,30,0.06)" : "rgba(30,60,255,0.06)", mixBlendMode: "screen" }} />
      <Post tintOpacity={0.14} />
      <EdgeFade dur={D} outF={6} />
      {[4, 60, 120, 180].map((t, k) => <Sfx key={k} name="static" at={t} gain={0.35} />)}
    </Stage>
  );
};
