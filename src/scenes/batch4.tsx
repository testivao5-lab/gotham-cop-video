import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { Stage, Plane } from "../lib/Camera";
import { ci, rand, mix } from "../lib/anim";
import { sceneDur } from "../lib/cues";
import { metric } from "../lib/world";
import { Post, Rain, Glow, handheld, LightCone } from "../fx/fx";
import { Character, walkDist, anchor, blinkAt } from "../characters/Character";
import { Sky, DecoSkyline } from "../world/sky";
import { SchoolBus, StreetFacades, WetStreet, Cruiser } from "../world/street";
import { ShopFront, ShopInterior, BrassDomeLamp } from "../world/places";
import { BusStreetSet, Caption, EdgeFade, Sfx, Shot, ForegroundRain } from "./common";
import { BusWindowCloseup, FlashlightCloseup } from "./batch1";
import { Hospital, Ambulance, PrecinctInterior, CruiserCabin, TVDebate, EndQuestion, Phone, EZ, cq } from "./kit";

const BM = metric(600, 166);
const G = 1000, S = BM.human(G);
/** v14 torch continuity: hand target on the shoulder->window line (elbow keeps a natural ~45deg bend, never a rod),
 *  wrist aims the lens at the window, and the light cone starts AT the lens. */
const torch = (x0: number, wx: number, wy: number) => {
  const shx = x0 - 26 * S, shy = G - 326 * S;
  const ang = Math.atan2(wy - shy, wx - shx);
  const hand: [number, number] = [shx + Math.cos(ang) * 138 * S, shy + Math.sin(ang) * 138 * S];
  const lens: [number, number] = [hand[0] + Math.cos(ang) * 22 * S, hand[1] + Math.sin(ang) * 22 * S];
  return { hand, lens, angle: (Math.atan2(wy - lens[1], wx - lens[0]) * 180) / Math.PI - 90, length: Math.hypot(wx - lens[0], wy - lens[1]) };
};
const cop = (f: number) => (Math.floor(f / 7) % 2 ? "255,40,40" : "60,90,255");
/* screen position of Nia's window in BusStreetSet with busX/busY/scale (window 7 of 8) */
const niaWin = (busX = 860, busY = 470, sc = 0.95): [number, number] => [busX + (26 + 6 * 76 + 31) * sc, busY + 72 * sc];

/* ============ S45 — Alex stares after him; the girl is still at the window ============ */
export const Scene45: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(45);
  const cG = cq(45, "girl", 0.2);
  const rack = ci(f, [cG, cG + 40], [0, 1], EZ);
  return (
    <Stage cam={{ x: ci(f, [0, D], [0, 160], EZ), y: ci(f, [0, cG + 40], [-200, -170], EZ), zoom: ci(f, [0, D], [1.0, 1.22], EZ) }}>
      <BusStreetSet fog={0.75} nia sky="storm" lamp={0} blackout={1} busX={1060} />
      <Plane p={1}><Glow x={160} y={880} r={520} color={cop(f)} opacity={0.2} /></Plane>
      <Plane p={1.3}>
        <div style={{ position: "absolute", inset: 0, filter: `blur(${rack * 4}px)` }}>
          <Character id="s45alex" kind="alex" x={560} y={1560} crop="waist" scale={3.2} facing={1} lightSide={1} nightTint={0.35} rim="#cfd8ff" shoulderRadio={false} viewAngle="back"
            pose={{ head: -18 + rack * 22, neck: -10 + rack * 10 }} />
        </div>
      </Plane>
      <ForegroundRain />
      <Post />
      <EdgeFade dur={D} outF={6} />
    </Stage>
  );
};

/* ============ S46 — Nia cries; memory of the shop lamp ============ */
export const Scene46: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(46);
  const cR = cq(46, "remember", 0.6);
  const sob = Math.max(0, Math.sin(f * 0.5)) * 0.25;
  return (
    <>
      <Shot from={0} to={cR}>
        <Stage cam={{ x: handheld(f, 0.4, 46).x, y: handheld(f, 0.4, 46).y + sob * 8, zoom: ci(f, [0, cR], [1.05, 1.15]) }}>
          <Plane p={1}><BusWindowCloseup fog={0.75} wipe={0.6} pound={sob} /></Plane>
          <Post tintOpacity={0.14} vignette={0.6} />
        </Stage>
      </Shot>
      <Shot from={cR} to={D + 1}>
        <Stage cam={{ x: 0, y: 0, zoom: ci(f, [cR, D], [1.15, 1.3], EZ) }}>
          <Plane p={0.8}><ShopInterior lamp={1} /></Plane>
          <AbsoluteFill style={{ background: "radial-gradient(circle at 68% 52%, rgba(255,210,140,0.25), rgba(40,20,10,0.65) 70%)", mixBlendMode: "multiply" }} />
          <Post tintColor="#6a3a10" tintOpacity={0.22} vignette={0.75} />
        </Stage>
      </Shot>
      <AbsoluteFill style={{ background: "#fff2d8", opacity: ci(f, [cR - 4, cR, cR + 10], [0, 0.4, 0]), mixBlendMode: "screen" }} />
      <EdgeFade dur={D} outF={8} />
    </>
  );
};

/* ============ S47 — The old flashlight: tap, point, raise a hand ============ */
export const Scene47: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(47);
  const cT = cq(47, "tap", 0.3);
  const cP = cq(47, "point", 0.45);
  const cS = cq(47, "sees", 0.7);
  const tap = f > cT && f < cT + 10 ? 1 : 0;
  const flick = f < cT ? (Math.floor(f / 3) % 4 === 0 ? 0.2 : 0.8) : 1;
  const [wx, wy] = niaWin(1160, 470, 0.95);
  return (
    <>
      <Shot from={0} to={cP}>
        <Stage cam={{ x: 0, y: 0, zoom: ci(f, [0, cP], [1.0, 1.1]) }}>
          <Plane p={1}><FlashlightCloseup beam={flick} shake={0.2} sw={tap} /></Plane>
          <Post tintOpacity={0.1} />
        </Stage>
      </Shot>
      <Shot from={cP} to={cS}>
        <Stage cam={{ x: ci(f, [cP, cS], [-60, 0]), y: 0, zoom: ci(f, [cP, cS], [1.0, 1.08]) }}>
          <BusStreetSet fog={0.7} nia sky="storm" lamp={0} blackout={1} busX={1160} />
          <Plane p={1}>
            {/* beam from Alex's torch lens to her window; lens points where he looks */}
            <Character id="s47alex" kind="alex" x={460} y={G} scale={S} facing={1} lightSide={1} nightTint={0.3} rim="#ffe7a8" shoulderRadio={false}
              prop="flashlight" propOn={1} flashBeam={0} reachNear={torch(460, wx, wy).hand} aimAt={[wx, wy]} reachFar={f > cP + 30 ? [430, G - 470 * S] : undefined}
              pose={{ head: -6, eyeX: 0.8, eyeY: -0.3, handNear: "grip", handFar: "open", brow: 0.3 }} />
            <LightCone id="s47b" x={torch(460, wx, wy).lens[0]} y={torch(460, wx, wy).lens[1]} angle={torch(460, wx, wy).angle} length={torch(460, wx, wy).length} spread={120} opacity={0.35} />
            <Glow x={wx} y={wy} r={70} color="255,240,200" opacity={0.55} />
          </Plane>
          <ForegroundRain />
          <Post />
        </Stage>
      </Shot>
      <Shot from={cS} to={D + 1}>
        <Stage cam={{ x: 1000 + handheld(f, 0.4, 47).x, y: -90, zoom: ci(f, [cS, D], [2.5, 2.6], EZ) }}>
          <BusStreetSet fog={0.6} nia niaPound={0.15} sky="storm" lamp={0} blackout={1} />
          <Plane p={1}><Glow x={niaWin()[0]} y={niaWin()[1]} r={60} color="255,240,200" opacity={0.6} /></Plane>
          <Post />
        </Stage>
      </Shot>
      <EdgeFade dur={D} outF={6} />
      <Sfx name="switch" at={cT} gain={0.5} />
    </>
  );
};

/* ============ S48 — Keep the light on her window; specialists at work ============ */
export const Scene48: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(48);
  const cF = cq(48, "flickers", 0.15);
  const cM = cq(48, "mara", 0.35);
  const flick = f > cF && f < cF + 12 ? 0.2 : 1;
  const [wx, wy] = niaWin(1160, 470, 0.95);
  const T = torch(380, wx, wy);
  const sx = ci(f, [cM, cM + 90], [2200, 1500]);
  return (
    <Stage cam={{ x: ci(f, [0, D], [-40, 80]), y: 0, zoom: ci(f, [0, D], [1.0, 1.08], EZ) }}>
      <BusStreetSet fog={ci(f, [0, D], [0.7, 0.55])} nia sky="storm" lamp={0} blackout={1} busX={1160} wire led />
      <Plane p={1}>
        <Glow x={160} y={880} r={520} color={cop(f)} opacity={0.18} />
        <LightCone id="s48b" x={T.lens[0]} y={T.lens[1]} angle={T.angle} length={T.length} spread={120} opacity={0.32 * flick} />
        <Glow x={wx} y={wy} r={70} color="255,240,200" opacity={0.55 * flick} />
        <Character id="s48spec" kind="specialist" x={sx} y={G} scale={S} facing={-1} lightSide={-1} nightTint={0.3} pose={{ ...(sx > 1500 ? walkDist(2200 - sx, "specialist", S, 0.8) : { lean: 24, head: 12, eyeY: 0.7, bob: 36 * ci(f, [cM + 90, cM + 104], [0, 1], EZ), legNear: [35 * ci(f, [cM + 90, cM + 104], [0, 1], EZ), 70 * ci(f, [cM + 90, cM + 104], [0, 1], EZ)], legFar: [-5, 45 * ci(f, [cM + 90, cM + 104], [0, 1], EZ)] }) }} />
        <Character id="s48alex" kind="alex" x={380} y={G} scale={S} facing={1} lightSide={1} nightTint={0.3} rim="#ffe7a8" shoulderRadio={false}
          prop="flashlight" propOn={flick} reachNear={T.hand} aimAt={[wx, wy]} reachFar={f > cF && f < cF + 14 ? [T.hand[0] - 30, T.hand[1] - 6] : undefined} pose={{ head: -6, eyeX: 0.8, eyeY: -0.3, handNear: "grip", handFar: "open" }} />
        <Character id="s48mara" kind="mara" x={720} y={G} scale={S} facing={1} lightSide={-1} nightTint={0.3} shoulderRadio reachNear={anchor("mara", 720, G, S, 1, "radio")} pose={{ head: f > cM ? 4 : -4, eyeX: f > cM ? 0.8 : -0.5, handNear: "grip" }} />
      </Plane>
      <ForegroundRain />
      <Post />
      <EdgeFade dur={D} outF={6} />
      <Sfx name="click" at={cF + 12} gain={0.4} />
      {[cM + 10, cM + 34, cM + 58].map((t, k) => <Sfx key={k} name="step" at={t} gain={0.3} />)}
    </Stage>
  );
};

/* ============ S49 — Device safe; door opens; Nia into her mother's arms; torch goes out ============ */
export const Scene49: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(49);
  const cO = cq(49, "opens", 0.3);
  const cA = cq(49, "arms", 0.45);
  const cX = cq(49, "flashlight", 0.85);
  const door = ci(f, [cO, cO + 20], [0, 1], EZ);
  const climb = ci(f, [cO + 20, cA + 30], [0, 1], EZ);
  const hug = ci(f, [cA + 20, cA + 40], [0, 1], EZ);
  const BX = 700, BY = 470, BS = 0.95;
  const doorX = BX + (850 - 164) * BS, doorY = BY + 332 * BS;
  const nx = doorX + climb * 60, ny = doorY - (1 - climb) * 60;
  return (
    <>
      <Shot from={0} to={cX - 6}>
        <Stage cam={{ x: ci(f, [0, cX], [100, 420], EZ), y: ci(f, [0, cX], [0, -40]), zoom: ci(f, [0, cX], [1.3, 1.75], EZ) }}>
          <BusStreetSet fog={0.4} nia={door < 0.5} sky="storm" lamp={0} blackout={1} busX={BX} busY={BY} />
          <Plane p={1}>
            <Glow x={160} y={880} r={520} color={cop(f)} opacity={0.18} />
            {/* specialist by the door gives the all-clear (hand raised) */}
            <Character id="s49spec" kind="specialist" x={doorX - 160} y={doorY} scale={BM.human(doorY)} facing={1} lightSide={-1} nightTint={0.3} reachNear={f < cO ? [doorX - 160 - 30, doorY - 470 * BM.human(doorY)] : undefined} pose={{ head: -4, handNear: "open" }} />
            {door > 0.5 && <Character id="s49nia" kind="nia" x={nx} y={ny} groundY={doorY} scale={BM.human(doorY)} facing={1} lightSide={-1} nightTint={0.25} reachNear={hug > 0 ? anchor("mother", doorX + 150, doorY, BM.human(doorY), -1, "shoulderNear") : undefined} pose={{ legNear: [20 - climb * 20, 20], head: 4, brow: 0.6, smile: hug * 0.2 }} />}
            {/* scale-ok: mother kneels on the same ground line as the child */}
            <Character id="s49mom" kind="mother" x={doorX + 150} y={doorY} scale={BM.human(doorY)} facing={-1} lightSide={-1} nightTint={0.25}
              reachNear={hug > 0 ? [nx + 10, ny - 180 * BM.human(doorY)] : [doorX + 80, doorY - 260 * BM.human(doorY)]} reachFar={hug > 0 ? [nx - 10, ny - 160 * BM.human(doorY)] : undefined}
              pose={{ legNear: [40 * hug, 90 * hug], legFar: [-10, 80 * hug], bob: hug * 60, lean: 10 + hug * 10, head: 10, brow: 0.6, smile: hug * 0.3, handNear: "open", handFar: "open" }} />
            <Character id="s49ff" kind="driver" x={doorX - 40} y={doorY + 20} scale={BM.human(doorY + 20)} facing={1} lightSide={-1} nightTint={0.3} reachNear={f > cO - 10 && f < cO + 30 ? [doorX + 10, doorY - 200 * BM.human(doorY)] : undefined} pose={{ handNear: "grip", head: 2 }} />
          </Plane>
          <ForegroundRain />
          <Post />
        </Stage>
      </Shot>
      <Shot from={cX - 6} to={D + 1}>
        <Stage cam={{ x: 0, y: 0, zoom: ci(f, [cX, D], [1.0, 1.08]) }}>
          <Plane p={1}><FlashlightCloseup beam={f < cX ? 1 : ci(f, [cX, cX + 6], [1, 0])} shake={0} sw={0} /></Plane>
          <Post tintOpacity={0.12} />
        </Stage>
      </Shot>
      <EdgeFade dur={D} outF={10} />
      <Sfx name="lock" at={cO} gain={0.4} />
      <Sfx name="switch" at={cX} gain={0.4} />
    </>
  );
};

/* ============ S50 — Hospital power restored ============ */
export const Scene50: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(50);
  return (
    <Stage cam={{ x: 0, y: ci(f, [0, D], [0, -30]), zoom: ci(f, [0, D], [1.0, 1.06]) }}>
      <Plane p={0.15}><Sky variant="night" seed={50} horizonY={800} /></Plane>
      <Plane p={1}><Hospital power={ci(f, [6, D - 10], [0.05, 1])} /><Ambulance x={880} y={884} s={0.5} facing={1} lights={1} /></Plane>
      <Post />
      <EdgeFade dur={D} inF={6} outF={6} />
      <Sfx name="switch" at={8} gain={0.4} />
    </Stage>
  );
};

/* ============ S51 — Radio: Joker in custody ============ */
export const Scene51: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(51);
  const cC = cq(51, "custody", 0.8);
  return (
    <Stage cam={{ x: handheld(f, 0.3, 51).x, y: handheld(f, 0.3, 51).y, zoom: ci(f, [0, D], [1.0, 1.08]) }}>
      <CruiserCabin dark={0.3} signal={0.8} wipe={false} speed={0.4}>
        <Character id="s51mara" kind="mara" x={620} y={1545} crop="waist" scale={3.0} facing={1} lightSide={1} nightTint={0.3} shoulderRadio reachNear={[640, 1010]} reachFar={[560, 1010]} pose={{ head: 6, eyeX: 0.6, handNear: "grip", handFar: "grip", smile: f > cC ? 0.1 : 0 }} />
        <Character id="s51alex" kind="alex" x={1320} y={1545} crop="waist" scale={3.0} facing={-1} lightSide={-1} nightTint={0.3} shoulderRadio
          pose={{ head: ci(f, [0, 40, cC - 40, cC - 24, cC + 10, cC + 22], [-14, -14, -8, 14, 14, 8], EZ), eyeX: f > cC - 30 ? 0.7 : -0.6, eyeY: f > cC - 30 ? 0.2 : -0.2, brow: f > cC ? 0 : 0.4, smile: f > cC + 10 ? 0.25 : 0, lean: ci(f, [cC - 40, cC - 20], [0, 6], EZ) }} />
      </CruiserCabin>
      <Post tintOpacity={0.14} />
      <EdgeFade dur={D} inF={8} outF={8} />
      {[10, cC - 20].map((t, k) => <Sfx key={k} name="static" at={t} gain={0.35} />)}
    </Stage>
  );
};

/* ============ S52 — Morning TV debates Batman ============ */
export const Scene52: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(52);
  return (
    <Stage cam={{ x: ci(f, [0, D], [80, -40]), y: 0, zoom: ci(f, [0, D], [1.0, 1.15], EZ) }}>
      <Plane p={0.9}><TVDebate cityMorning={ci(f, [0, D], [0.6, 1])} /></Plane>
      <Plane p={1.15}>
        <Character id="s52alex" kind="alex" x={1640} y={1530} crop="waist" scale={3.2} facing={-1} lightSide={-1} nightTint={0.1} rim="#ffd8a0" shoulderRadio={false} viewAngle="back" noHat pose={{ head: 4 + Math.sin(f * 0.035) * 6 + ci(f, [0.6 * D, 0.6 * D + 12], [0, -8]), lean: ci(f, [0, D], [-2, 6]), bob: Math.sin(f * 0.11) * 2 }} />
      </Plane>
      <Post tintColor="#3a2a20" tintOpacity={0.08} />
      <EdgeFade dur={D} inF={10} outF={8} />
    </Stage>
  );
};

/* ============ S53 — Mother thanks the team; no cameras ============ */
export const Scene53: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(53);
  const cK = cq(53, "knows", 0.85);
  const M = metric(560, 260);
  const s = M.human(1000);
  return (
    <Stage cam={{ x: ci(f, [0, D], [-40, 40]), y: 0, zoom: ci(f, [0, D], [1.0, 1.1], EZ) }}>
      <Plane p={0.12}><Sky variant="dawn" seed={53} horizonY={560} /></Plane>
      <Plane p={0.35}><DecoSkyline seed={53} baseY={640} hMin={300} hMax={600} haze={0.5} hazeColor="#c08a7a" body="#3a3048" light="#8a6a7a" litP={0.1} /></Plane>
      <Plane p={0.6}><StreetFacades seed={53} baseY={720} litP={0.1} heightMin={560} heightMax={800} dark={0.05} /></Plane>
      <Plane p={1}>
        <WetStreet horizonY={720} curbY={770} laneY={930} reflections={[{ x: 1200, color: "#f0c090", w: 200, strength: 0.4 }]} seed={53} asphalt="#2a2a34" />
        <Character id="s53mom" kind="mother" x={960} y={1000} scale={s} facing={-1} lightSide={1} nightTint={0} rim="#ffd8a0" reachNear={[anchor("mara", 640, 1000, s, 1, "chest")[0], anchor("mara", 640, 1000, s, 1, "chest")[1] + 30 + (f < 70 ? Math.sin(f * 0.4) * 10 : 0)]} pose={{ head: 4 + Math.sin(f * 0.07) * 4, smile: 0.55, brow: 0.3, lean: 6, handNear: "grip" }} />
        <Character id="s53nia" kind="nia" x={1120} y={1000} scale={s} facing={-1} lightSide={1} nightTint={0} rim="#ffd8a0" reachNear={anchor("mother", 960, 1000, s, -1, "waist")} pose={{ head: -6 + Math.sin(f * 0.09) * 5, smile: 0.5, armFar: [150 + Math.sin(f * 0.42) * 16, 20 + Math.sin(f * 0.42 + 1) * 22], handFar: "open", bob: Math.abs(Math.sin(f * 0.14)) * -6 }} />
        <Character id="s53mara" kind="mara" x={640} y={1000} scale={s} facing={1} lightSide={1} nightTint={0} rim="#ffd8a0" shoulderRadio reachNear={[anchor("mara", 640, 1000, s, 1, "chest")[0] + 200 * s, anchor("mara", 640, 1000, s, 1, "chest")[1] + 30 + (f < 70 ? Math.sin(f * 0.4) * 10 : 0)]} pose={{ head: 2 + ci(f, [70, 80, 92], [0, 8, 0]), smile: 0.45, brow: 0.2, lean: 4, handNear: "grip" }} />
        <Character id="s53spec" kind="specialist" x={ci(f, [0, 50], [200, 420], EZ)} y={1000} scale={s} facing={1} lightSide={1} nightTint={0} pose={{ head: ci(f, [50, 62, 74, 86], [0, 9, 0, 6]), smile: 0.35, ...(f < 50 ? walkDist(ci(f, [0, 50], [200, 420], EZ) - 200, "specialist", s, 0.8) : {}) }} />
      </Plane>
      <Post tintColor="#a06040" tintOpacity={0.1} vignette={0.45} />
      <Caption text="HER MOTHER KNOWS THEIR NAMES" from={cK} to={D - 6} y={150} />
      <EdgeFade dur={D} inF={8} outF={8} />
    </Stage>
  );
};

/* ============ S54 — Alex reaches the shop at dawn: lights back, window lamp dark ============ */
export const Scene54: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(54);
  const M = metric(640, 230);
  const s = M.human(1000);
  const ax = ci(f, [0, 130], [-120, 640], Easing.out(Easing.sin));
  return (
    <Stage cam={{ x: ci(f, [0, D], [-60, 40]), y: 0, zoom: ci(f, [0, D], [1.0, 1.1], EZ) }}>
      <Plane p={0.12}><Sky variant="dawn" seed={54} horizonY={640} /></Plane>
      <Plane p={0.35}><DecoSkyline seed={54} baseY={700} hMin={300} hMax={600} haze={0.5} hazeColor="#c08a7a" body="#3a3048" light="#8a6a7a" litP={0.1} /></Plane>
      <Plane p={1}>
        <ShopFront baseY={940} lamp={0} doorLight={0.8} />
        <WetStreet horizonY={940} curbY={970} laneY={1060} reflections={[{ x: 960, color: "#f0c090", w: 140, strength: 0.4 }]} seed={54} asphalt="#2a2a34" />
        <Character id="s54alex" kind="alex" x={ax} y={1000} scale={s} facing={1} lightSide={1} nightTint={0.05} rim="#ffd8a0" shoulderRadio
          pose={f < 130 ? { ...walkDist(ax + 120, "alex", s, 0.75) } : { head: ci(f, [130, 146, 186, 204], [-4, -16, -16, 2]), eyeY: ci(f, [130, 146, 186, 204], [0, -0.8, -0.8, 0]), eyeX: 0.6, brow: ci(f, [140, 170], [0.2, 0.7]), smile: ci(f, [186, 210], [0, 0.3]), lean: ci(f, [186, 204], [0, 4]), bob: Math.sin(f * 0.09) * 3 }} />
      </Plane>
      <Post tintColor="#a06040" tintOpacity={0.1} vignette={0.5} />
      <EdgeFade dur={D} inF={8} outF={6} />
      {[10, 36, 62, 88, 114].map((t, k) => <Sfx key={k} name="step" at={t} gain={0.25} />)}
    </Stage>
  );
};

/* shop interior metric: floor 1000, 320 px/m (S7 calibration): bench top 0.75 m = y 760 */
const SS = 1.4; // shop interior: 560 px = 1.75 m
/* ============ S55 — Father asleep; Alex fixes the switch on the lamp ============ */
export const Scene55: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(55);
  const cT = cq(55, "toolbox", 0.55);
  const cF = cq(55, "fix", 0.8);
  return (
    <Stage cam={{ x: ci(f, [0, D], [-40, 60]), y: 0, zoom: ci(f, [0, D], [1.0, 1.12], EZ) }}>
      <Plane p={0.8}><ShopInterior lamp={0} warm={0.6} /></Plane>
      <Plane p={1}>
        {/* armchair (seat 0.45 m) with the sleeping father, chin down */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <ellipse cx={420} cy={1004} rx={220} ry={20} fill="#000" opacity={0.45} />
          <path d="M240 1000 V640 Q240 590 300 590 H540 Q600 590 600 640 V1000 Z" fill="#5a2a22" stroke="#140806" strokeWidth={4} />
          <rect x={220} y={862} width={400} height={64} rx={20} fill="#6a3428" stroke="#140806" strokeWidth={4} />
        </svg>
        <Character id="s55dad" kind="father" x={420} y={1000 + 94 * SS} groundY={1000} scale={SS} facing={1} lightSide={1} nightTint={0.05} rim="#ffd8a0"
          pose={{ legNear: [84, 88], legFar: [78, 94], lean: -9, head: 26, neck: 14, blink: 1, armNear: [12, 96], armFar: [44, 38], handNear: "relaxed", handFar: "relaxed" }} />
        {/* v14: toolbox SET DOWN on the floor before the repair; working hand stays within reach (bent elbow) */}
        {f > cF && <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}><g transform="translate(985 1000)"><ellipse cx={0} cy={2} rx={70} ry={8} fill="#000" opacity={0.45} /><rect x={-60} y={-62} width={120} height={62} rx={6} fill="#b02a22" stroke="#140806" strokeWidth={3} /><rect x={-60} y={-62} width={120} height={14} fill="#8a1e18" /><path d="M-26 -62 V-80 H26 V-62" stroke="#222" strokeWidth={6} fill="none" /></g></svg>}
        <Character id="s55alex" kind="alex" x={1150} y={1000} scale={SS} facing={1} lightSide={1} nightTint={0.05} rim="#ffd8a0" shoulderRadio={false} noHat
          prop={f > cF ? "key" : f > cT ? "toolbox" : "flashlight"} reachNear={f > cF ? [1262 + Math.sin(f * 0.5) * 4, 592] : f > cT ? [1235, 760] : [1205, 760]} reachFar={f > cF ? [1240, 612] : undefined}
          pose={{ head: f > cF ? -10 : 8, eyeY: f > cF ? -0.3 : 0.6, lean: f > cF ? 6 : 0, handNear: "grip", handFar: f > cF ? "grip" : "relaxed" }} />
      </Plane>
      <Post tintColor="#6a3a10" tintOpacity={0.1} vignette={0.55} />
      <EdgeFade dur={D} inF={6} outF={6} />
      <Sfx name="lock" at={cT} gain={0.3} />
      {[cF, cF + 14, cF + 30].map((t, k) => <Sfx key={k} name="click" at={t} gain={0.3} />)}
    </Stage>
  );
};

/* ============ S56 — The lamp glows; father opens one eye ============ */
export const Scene56: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(56);
  const cE = cq(56, "eye", 0.35);
  const on = ci(f, [6, 20], [0, 1], EZ);
  return (
    <>
      <Shot from={0} to={cE}>
        <Stage cam={{ x: 0, y: 0, zoom: ci(f, [0, cE], [2.2, 2.35]) }}>
          <Plane p={0.8}><ShopInterior lamp={on} /></Plane>
          <Post tintColor="#6a3a10" tintOpacity={0.08} />
        </Stage>
      </Shot>
      <Shot from={cE} to={D + 1}>
        <Stage cam={{ floor: 1000, x: -500, y: -40, zoom: ci(f, [cE, D], [1.4, 1.5]) }}>
          <Plane p={0.8}><ShopInterior lamp={1} /></Plane>
          <Plane p={1}>
            <Character id="s56dad" kind="father" x={420} y={1000 + 94 * SS} groundY={1000} scale={SS} facing={1} lightSide={1} nightTint={0.02} rim="#ffd8a0"
              pose={{ legNear: [84, 88], legFar: [80, 90], head: ci(f, [cE, cE + 20], [22, 8]), neck: 6, blink: ci(f, [cE, cE + 10], [1, 0.45]), smile: 0.2, armNear: [30, 60], armFar: [20, 70], eyeX: 0.8 }} />
          </Plane>
          <Post tintColor="#6a3a10" tintOpacity={0.08} />
        </Stage>
      </Shot>
      <Caption text="LONG NIGHT?" from={cE + 30} to={D - 4} align="center" y={150} />
      <EdgeFade dur={D} outF={6} />
      <Sfx name="switch" at={6} gain={0.4} />
    </>
  );
};

/* ============ S57 — Dawn street: delivery driver, a passing bus, clouds turning grey ============ */
export const Scene57: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(57);
  const cB = cq(57, "bus", 0.5);
  const M = metric(620, 220);
  const busY = 860, bs = M.bus(busY);
  // wheels: rotation = distance / r (environment-relative motion)
  const bx = ci(f, [cB - 10, cB + 90], [-1100, 2200]);
  return (
    <Stage cam={{ x: ci(f, [0, D], [-30, 30]), y: 0, zoom: ci(f, [0, D], [1.0, 1.06]) }}>
      <Plane p={0.12}><Sky variant="dawn" seed={57} horizonY={620} /></Plane>
      <Plane p={0.35}><DecoSkyline seed={57} baseY={690} hMin={300} hMax={620} haze={0.5} hazeColor="#c0a090" body="#3a3a4a" light="#8a7a8a" litP={0.05} /></Plane>
      <Plane p={0.6}><StreetFacades seed={57} baseY={760} litP={0.15} heightMin={560} heightMax={800} dark={0.05} /></Plane>
      <Plane p={0.8}>
        {/* across the street the delivery driver unlocks a shop shutter */}
        {/* the shutter rolls up with his hand (shop light spills out underneath) */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <rect x={1400 + 40 * M.human(790)} y={790 - ci(f, [0, cB + 60], [150, 330], EZ) * M.human(790)} width={260 * M.human(790)} height={ci(f, [0, cB + 60], [150, 330], EZ) * M.human(790)} fill="#e8b878" opacity={0.85} />
          {Array.from({ length: 12 }).map((_, i) => <rect key={i} x={1400 + 40 * M.human(790)} y={790 - 360 * M.human(790) + i * 12 * M.human(790)} width={260 * M.human(790)} height={(360 - ci(f, [0, cB + 60], [150, 330], EZ)) * M.human(790) / 12 - 1} fill="#5a5e68" stroke="#2a2c32" strokeWidth={1} />)}
        </svg>
        <Character id="s57drv" kind="reporter" x={1400} y={790} scale={M.human(790)} facing={1} lightSide={1} nightTint={0} reachNear={[1400 + 90 * M.human(790), 790 - ci(f, [0, cB + 60], [150, 330], EZ) * M.human(790)]} pose={{ handNear: "grip", head: ci(f, [0, cB + 60], [12, -10]), lean: ci(f, [0, cB + 60], [6, -4]) }} />
      </Plane>
      <Plane p={1}>
        <WetStreet horizonY={800} curbY={830} laneY={960} reflections={[{ x: 1300, color: "#f0c090", w: 220, strength: 0.4 }]} seed={57} asphalt="#2a2a34" />
        <SchoolBus x={bx} y={busY - 332 * bs} scale={bs} lit={0.4} interior={0.5} />
      </Plane>
      <Plane p={1.2}>
        <Character id="s57alex" kind="alex" x={280} y={1530} crop="waist" scale={3.2} facing={1} lightSide={1} nightTint={0} rim="#ffd8a0" shoulderRadio={false} viewAngle="back" noHat pose={{ head: -4 + ci(f, [cB, cB + 60], [0, 10]) }} />
      </Plane>
      <Post tintColor="#a06040" tintOpacity={0.08} vignette={0.45} />
      <EdgeFade dur={D} inF={6} outF={6} />
      <Sfx name="whoosh" at={cB + 20} gain={0.4} />
    </Stage>
  );
};

/* ============ S58 — Officers answer phones as the city wakes ============ */
export const Scene58: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(58);
  const cS = cq(58, "stand", 0.75);
  const M = metric(560, 260);
  const s = M.human(1000);
  return (
    <Stage cam={{ x: ci(f, [0, D], [100, -60]), y: 0, zoom: ci(f, [0, D], [1.0, 1.12], EZ) }}>
      <Plane p={0.6}><PrecinctInterior lights={0.6} dawn={1} /></Plane>
      <Plane p={1}>
        <Character id="s58mara" kind="mara" x={560} y={1000} scale={s} facing={1} lightSide={1} nightTint={0} rim="#ffd8a0" shoulderRadio reachNear={anchor("mara", 560, 1000, s, 1, "radio")} prop="phone" propOn={1}
          pose={{ head: 6 + Math.sin(f * 0.09) * 5, eyeY: 0.3, eyeX: Math.sin(f * 0.05) * 0.6, handNear: "grip", armFar: [40 + Math.sin(f * 0.12) * 30, 70 + Math.sin(f * 0.17) * 30], handFar: "open", smile: 0.15, lean: Math.sin(f * 0.04) * 3 }} />
        <Character id="s58emp" kind="employee" x={1240} y={1000} scale={s} facing={-1} lightSide={1} nightTint={0} rim="#ffd8a0" pose={{ head: 6 + ci(f, [cS - 20, cS], [0, 8]), brow: 0.6, eyeX: f > cS - 20 ? -0.6 : 0.3, armNear: [40 + Math.sin(f * 0.08) * 6, 60 + Math.sin(f * 0.11) * 10], armFar: [30, 70], lean: Math.sin(f * 0.05) * 2 }} />
        <Character id="s58alex" kind="alex" x={ci(f, [0, 60], [1900, 1460], EZ)} y={1000} scale={s} facing={-1} lightSide={1} nightTint={0} rim="#ffd8a0" shoulderRadio reachNear={f > cS ? anchor("employee", 1240, 1000, s, -1, "shoulderFar") : undefined} pose={{ head: 8, eyeX: 0.6, smile: f > cS ? 0.35 : 0.1, ...(f < 60 ? walkDist(1900 - ci(f, [0, 60], [1900, 1460], EZ), "alex", s, 0.8) : { lean: f > cS ? 6 : 0 }) }} />
      </Plane>
      <Post tintColor="#a06040" tintOpacity={0.08} vignette={0.45} />
      <EdgeFade dur={D} inF={6} outF={6} />
      {[20, 160].map((t, k) => <Sfx key={k} name="click" at={t} gain={0.28} />)}
    </Stage>
  );
};

/* ============ S59 — "I can fix it." — "I know." ============ */
export const Scene59: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(59);
  const cF = cq(59, "fix", 0.5);
  const cK = cq(59, "know", 0.85);
  return (
    <Stage cam={{ floor: 1000, x: ci(f, [0, D], [-40, 40]), y: 0, zoom: ci(f, [0, D], [1.1, 1.2], EZ) }}>
      <Plane p={0.8}><ShopInterior lamp={1} /></Plane>
      <Plane p={1}>
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {/* the dead flashlight on the workbench */}
          <g transform="translate(620 752) rotate(-6)"><rect x={-40} y={-8} width={60} height={16} rx={3} fill="#6b6f78" stroke="#06070b" strokeWidth={2} /><rect x={20} y={-12} width={16} height={24} fill="#8a8f99" stroke="#06070b" strokeWidth={2} /><ellipse cx={36} cy={0} rx={3} ry={11} fill="#55575c" /></g>
        </svg>
        <Character id="s59dad" kind="father" x={860} y={1000} scale={SS} facing={1} lightSide={1} nightTint={0.02} rim="#ffd8a0" reachNear={f > cF - 20 && f < cF + 40 ? [640, 750] : undefined} pose={{ head: f < cF ? 14 : 2, eyeY: f < cF ? 0.7 : 0, eyeX: f > cF ? 0.8 : 0, smile: f > cF ? 0.4 : 0.1, handNear: "open" }} />
        <Character id="s59alex" kind="alex" x={1200} y={1000} scale={SS} facing={-1} lightSide={1} nightTint={0.02} rim="#ffd8a0" shoulderRadio={false} noHat pose={{ head: 4, smile: f > cK - 10 ? 0.6 : 0.2, brow: 0.2 }} />
      </Plane>
      <Post tintColor="#6a3a10" tintOpacity={0.1} vignette={0.5} />
      <Caption text="I CAN FIX IT." from={cF} to={cF + 50} align="center" y={150} />
      <Caption text="I KNOW." from={cK} to={D - 4} align="center" y={150} />
      <EdgeFade dur={D} inF={6} outF={8} />
    </Stage>
  );
};

/* ============ S60 — The waking city; the end question ============ */
export const Scene60: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(60);
  const cW = cq(60, "which", 0.6);
  return (
    <Stage cam={{ x: 0, y: ci(f, [0, D], [0, -60], EZ), zoom: ci(f, [0, D], [1.0, 1.12], EZ) }}>
      <Plane p={0.12}><Sky variant="dawn" seed={60} horizonY={680} /></Plane>
      <Plane p={0.3}><DecoSkyline seed={60} baseY={760} hMin={320} hMax={680} haze={0.55} hazeColor="#d0a090" body="#3a3a4a" light="#a08a8a" litP={0.08} /></Plane>
      <Plane p={0.55}><StreetFacades seed={60} baseY={820} litP={0.12} heightMin={560} heightMax={820} dark={0.05} /></Plane>
      <Plane p={0.4}>
        {/* v14b: the city wakes - a flock of pigeons crosses the dawn sky (scene is never a frozen card) */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 9 }).map((_, i) => {
            const bx = -200 + ((f * (5 + (i % 3)) + i * 260) % 2600), by = 260 + (i % 4) * 46 + Math.sin(f * 0.05 + i) * 18, fl = Math.sin(f * 0.6 + i * 1.7) * 9;
            return <path key={i} d={`M${bx - 14} ${by - fl} Q${bx - 6} ${by - 4} ${bx} ${by} Q${bx + 6} ${by - 4} ${bx + 14} ${by - fl}`} stroke="#2a2430" strokeWidth={3} fill="none" strokeLinecap="round" />;
          })}
        </svg>
      </Plane>
      <Plane p={1}>
        <WetStreet horizonY={860} curbY={890} laneY={1000} reflections={[{ x: 960, color: "#f0c090", w: 260, strength: 0.5 }]} seed={60} asphalt="#2a2a34" />
      </Plane>
      <Plane p={1.15}>
        <Character id="s60alex" kind="alex" x={1400} y={1530} crop="waist" scale={3.2} facing={1} lightSide={1} nightTint={0} rim="#ffd8a0" shoulderRadio={false} viewAngle="back" pose={{ head: ci(f, [0, 40, 70, D], [-10, -10, 6, 10], EZ), lean: ci(f, [0, D], [0, 3]) }} />
      </Plane>
      <Post tintColor="#a06040" tintOpacity={0.08} vignette={0.5} />
      <AbsoluteFill style={{ background: "rgba(5,6,10,0.45)", opacity: ci(f, [10, 40], [0, 1]) }} />
      <EndQuestion t={ci(f, [14, 40], [0, 1], EZ)} t2={ci(f, [cW, cW + 20], [0, 1], EZ)} />
      <EdgeFade dur={D} outF={24} />
    </Stage>
  );
};

export const _u4 = { Rain, rand, mix, blinkAt, Cruiser, BrassDomeLamp, Phone, SchoolBus };
