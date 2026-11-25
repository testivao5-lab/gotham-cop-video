import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { Stage, Plane } from "../lib/Camera";
import { ci, rand } from "../lib/anim";
import { sceneDur } from "../lib/cues";
import { metric, guardWindowHead } from "../lib/world";
import { Post, Rain, Fog, Glow, handheld, Splashes, lightning } from "../fx/fx";
import { Character, walkDist, anchor } from "../characters/Character";
import { Sky, DecoSkyline } from "../world/sky";
import { SchoolBus, Cruiser, StreetFacades, WetStreet } from "../world/street";
import { JokerProfile } from "../world/places";
import { BusStreetSet, Caption, EdgeFade, Sfx, Shot, ForegroundRain } from "./common";
import { BusWindowCloseup } from "./batch1";
import { Hospital, Parapet, Phone, EZ, cq } from "./kit";

/* metric of the bus street set (BusStreetSet: bus scale 0.95, wheels on ground 785): 77 px/m at the bus, horizon 600 */
const BM = metric(600, 166);
const G = 1000, S = BM.human(G);
const cop = (f: number) => (Math.floor(f / 7) % 2 ? "255,40,40" : "60,90,255");

/* ---------------- school bus interior, looking down the aisle to the back bench ----------------
   vanishing point (960, 520). Back wall 2.4 m wide x 2.0 m tall at 170 px/m: x 756..1164, y 420..760.
   Child (1.25 m) seated on the back bench (seat 0.45 m) -> scale = 170 * 1.75 / 400.            */
const BI = { vx: 960, vy: 520, ppm: 170, floor: 760 };
export const BusInterior: React.FC<{ dark?: number; fog?: number; children?: React.ReactNode; front?: React.ReactNode }> = ({ dark = 0.75, fog = 0.4, children, front }) => {
  const f = useCurrentFrame();
  const L = 756, R = 1164, T = 420, B = BI.floor;
  const rows = 6;
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="biWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a3a3c" /><stop offset="1" stopColor="#1a1a1c" /></linearGradient>
          <linearGradient id="biSeat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2f6a4c" /><stop offset="1" stopColor="#163424" /></linearGradient>
          <linearGradient id="biWin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0c1424" /><stop offset="1" stopColor="#1c2a44" /></linearGradient>
        </defs>
        {/* shell: ceiling, side walls (with windows), floor converge to the vanishing point */}
        <path d={`M-200 -200 L${L} ${T} L${R} ${T} L2120 -200 Z`} fill="#2a2a2e" />
        <path d={`M-200 -200 L${L} ${T} L${L} ${B} L-200 1400 Z`} fill="url(#biWall)" />
        <path d={`M2120 -200 L${R} ${T} L${R} ${B} L2120 1400 Z`} fill="url(#biWall)" />
        <path d={`M-200 1400 L${L} ${B} L${R} ${B} L2120 1400 Z`} fill="#1e1c1a" />
        <path d={`M${(L + R) / 2 - 60} ${B} L${(L + R) / 2 + 60} ${B} L1160 1400 L760 1400 Z`} fill="#2a2622" />
        {/* side windows (one per row) with rain outside; dark city beyond */}
        {[-1, 1].map((sd) => Array.from({ length: rows }).map((_, i) => {
          const t0 = i / rows, t1 = (i + 0.78) / rows;
          const ex = sd < 0 ? L : R;
          const X = (t: number) => (sd < 0 ? -200 : 2120) + (ex - (sd < 0 ? -200 : 2120)) * Math.pow(t, 0.6);
          const Yt = (t: number) => -200 * (1 - Math.pow(t, 0.6)) + (T + 30) * Math.pow(t, 0.6) + 40 * (1 - Math.pow(t, 0.6));
          const Yb = (t: number) => 560 * (1 - Math.pow(t, 0.6)) + (T + 160) * Math.pow(t, 0.6);
          return <path key={`${sd}${i}`} d={`M${X(t0)} ${Yt(t0) + 120} L${X(t1)} ${Yt(t1) + 120 * (1 - t1)} L${X(t1)} ${Yb(t1)} L${X(t0)} ${Yb(t0)} Z`} fill="url(#biWin)" stroke="#0a0a0c" strokeWidth={6} />;
        }))}
        {/* back window (where she sits) */}
        <rect x={L + 40} y={T + 30} width={R - L - 80} height={140} rx={10} fill="url(#biWin)" stroke="#0a0a0c" strokeWidth={6} />
        {Array.from({ length: 30 }).map((_, i) => { const x = L + 50 + rand(i) * (R - L - 100); const y = T + 40 + ((rand(i * 3) * 120 + f * (0.6 + rand(i) * 1.4)) % 120); return <path key={i} d={`M${x} ${y} l-1 8`} stroke="#9fb6dc" strokeWidth={1.5} opacity={0.5} />; })}
        {/* back bench */}
        <rect x={L + 10} y={B - 150} width={R - L - 20} height={100} rx={14} fill="url(#biSeat)" stroke="#0a1a12" strokeWidth={4} />
        <rect x={L + 10} y={B - 60} width={R - L - 20} height={30} rx={8} fill="#24543a" stroke="#0a1a12" strokeWidth={3} />
        {/* ceiling dome-light strip, dead (blackout) */}
        <path d={`M${L + 120} ${T - 10} L800 -200 L1120 -200 L${R - 120} ${T - 10} Z`} fill="#3a3a3e" opacity={0.6} />
      </svg>
      <AbsoluteFill>{children}</AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {/* seat rows receding on both sides of the aisle (nearer rows drawn last = larger) */}
        {Array.from({ length: rows }).map((_, k) => {
          const i = rows - 1 - k;
          const t = Math.pow((i + 0.5) / rows, 0.6), sc = 1 / (0.35 + 2.4 * (1 - t));
          return [-1, 1].map((sd) => {
            const cx = BI.vx + sd * (130 + 520 * (1 - t)) * 1.0, top = BI.vy + (B - 140 - BI.vy) * t + 340 * (1 - t) - 60 * sc;
            const w = 180 * sc * 0.55, h = 150 * sc * 0.5;
            return <g key={`${i}${sd}`}><rect x={cx - w} y={top} width={w * 2} height={h} rx={12 * sc * 0.4} fill="url(#biSeat)" stroke="#0a1a12" strokeWidth={3} /><rect x={cx - w} y={top} width={w * 2} height={h * 0.18} rx={8} fill="#3f8a62" opacity={0.6} /></g>;
          });
        })}
        <rect width={1920} height={1080} fill="#050810" opacity={dark * 0.5} />
        <rect width={1920} height={1080} fill="#c8d4e4" opacity={fog * 0.08} />
      </svg>
      {front && <AbsoluteFill>{front}</AbsoluteFill>}
    </AbsoluteFill>
  );
};
/* child on the back bench: feet on the floor (760), seat 0.45 m (77 px) */
const NIA_S = (BI.ppm * 1.75) / 400;
const NiaSeated: React.FC<{ x?: number; pose?: object; flash?: number; reach?: [number, number]; prop?: boolean }> = ({ x = 1060, pose = {}, flash = 1, reach, prop = true }) => (
  <Character id="niaBack" kind="nia" x={x} y={BI.floor + 64 * NIA_S} groundY={BI.floor} scale={NIA_S} facing={1} lightSide={1} nightTint={0.35} rim="#ffe7a8"
    prop={prop ? "flashlight" : "none"} propOn={flash} flashBeam={flash * 0.8} reachNear={reach}
    pose={{ legNear: [84, 88], legFar: [80, 92], handNear: "grip", ...pose }} />
);

/* ============ S29 — Nia alone inside the bus ============ */
export const Scene29: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(29);
  const cS = cq(29, "sitting", 0.5);
  const hh = handheld(f, 0.6, 29);
  return (
    <>
      <Shot from={0} to={cS}>
        <Stage cam={{ x: hh.x + ci(f, [0, cS], [0, 380], EZ), y: hh.y + ci(f, [0, cS], [0, -90], EZ), zoom: ci(f, [0, cS], [1.0, 1.6], EZ) }}>
          <BusStreetSet fog={0.45} nia sky="storm" lamp={0} blackout={1} />
          <Plane p={1}><Glow x={200} y={900} r={500} color={cop(f)} opacity={0.18} /></Plane>
          <ForegroundRain />
          <Post />
        </Stage>
      </Shot>
      <Shot from={cS} to={D + 1}>
        <Stage cam={{ x: ci(f, [cS, D], [-40, 60]), y: ci(f, [cS, D], [0, -20]), zoom: ci(f, [cS, D], [1.0, 1.25], EZ) }}>
          <BusInterior dark={0.6}>
            {/* she presses the small torch against the back window: lens toward the glass */}
            <NiaSeated reach={[1110, 520]} pose={{ head: -6, eyeX: 0.6, brow: 0.6 }} />
          </BusInterior>
          <Glow x={1120} y={520} r={140} color="255,240,200" opacity={0.5} />
          <Post tintOpacity={0.2} />
        </Stage>
      </Shot>
      <EdgeFade inF={8} dur={D} />
      <Sfx name="rattle" at={4} gain={0.3} />
    </>
  );
};

/* ============ S30 — The shaking driver describes the man in purple ============ */
export const Scene30: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(30);
  const cP = cq(30, "purple", 0.4);
  const cL = cq(30, "locked", 0.8);
  const shake = Math.sin(f * 1.7) * 1.6;
  return (
    <Stage cam={{ x: ci(f, [0, D], [-40, 50]), y: 0, zoom: ci(f, [0, D], [1.0, 1.1], EZ) }}>
      <BusStreetSet fog={0.5} nia sky="storm" lamp={0} blackout={1} busX={1060} />
      <Plane p={1}>
        <Glow x={160} y={880} r={520} color={cop(f)} opacity={0.2} />
        <Character id="s30drv" kind="driver" x={980} y={G} scale={S} facing={-1} lightSide={-1} nightTint={0.3}
          pose={{ lean: shake, head: 6 + shake, brow: 0.9, smile: -0.4, armNear: f > cP ? [60 + Math.sin(f * 0.25) * 30, 70] : [20, 80], armFar: f > cL ? [120, 30] : [30, 60], handFar: f > cL ? "point" : "open", eyeX: f > cL ? 0.8 : -0.4 }} />
        <Character id="s30alex" kind="alex" x={560} y={G} scale={S} facing={1} lightSide={-1} nightTint={0.3} shoulderRadio pose={{ head: 4, brow: 0.6, eyeX: f > cL ? 0.8 : 0.3 }} />
        <Character id="s30mara" kind="mara" x={380} y={G} scale={S} facing={1} lightSide={-1} nightTint={0.3} shoulderRadio reachNear={f > cL ? anchor("mara", 380, G, S, 1, "radio") : undefined} pose={{ head: 2, brow: 0.5, handNear: "grip" }} />
      </Plane>
      <ForegroundRain />
      <Post />
      <EdgeFade dur={D} outF={6} />
    </Stage>
  );
};

/* ============ S31 — A phone rings in the driver's pocket ============ */
export const Scene31: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(31);
  const cR = cq(31, "rings", 0.1);
  const cG = cq(31, "gave", 0.5);
  const out = ci(f, [cG - 20, cG + 10], [0, 1], EZ);
  const hh = handheld(f, 0.7, 31);
  return (
    <Stage cam={{ x: hh.x, y: hh.y, zoom: ci(f, [0, D], [1.0, 1.12]) }}>
      <Plane p={0.3}><AbsoluteFill style={{ background: "#0a0d16" }} /></Plane>
      <Plane p={0.5}><SchoolBus x={-200} y={-80} scale={2.2} fog={0.6} interior={0.3} /></Plane>
      <Plane p={1}>
        <Glow x={1700} y={300} r={600} color={cop(f)} opacity={0.15} />
        <Character id="s31drv" kind="driver" x={1160} y={1540} crop="waist" scale={1.8} facing={-1} lightSide={-1} nightTint={0.3}
          reachNear={out > 0 ? [1000 - out * 80, 760 - out * 120] : undefined} prop={out > 0.4 ? "phone" : "none"} propOn={f > cR ? 1 : 0}
          pose={{ head: 10, eyeY: 0.6, brow: 0.9, handNear: "grip", lean: Math.sin(f * 1.7) * 1.2 }} />
        <Character id="s31alex" kind="alex" x={460} y={1540} crop="waist" scale={1.8} facing={1} lightSide={-1} nightTint={0.3} shoulderRadio pose={{ head: 8, eyeY: 0.5, brow: 0.6 }} />
      </Plane>
      {out < 0.4 && <Phone x={1060} y={980} s={0.5} ring={f > cR ? 1 : 0} />}
      <ForegroundRain />
      <Post />
      <EdgeFade dur={D} outF={6} />
      {[cR, cR + 30, cR + 60, cR + 90].map((t, k) => <Sfx key={k} name="click" at={t} gain={0.4} />)}
    </Stage>
  );
};

/* ============ S32 — Mara steps in; Nia bangs on the window ============ */
export const Scene32: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(32);
  const cG = cq(32, "girl", 0.55);
  const step = ci(f, [20, 70], [0, 1], EZ);
  const beat = (f - cG) % 14;
  const pound = f > cG + 20 ? Math.max(0, 1 - beat / 5) : 0;
  return (
    <>
      <Shot from={0} to={cG + 10}>
        <Stage cam={{ x: ci(f, [0, cG], [-30, 40]), y: 0, zoom: ci(f, [0, cG], [1.0, 1.08]) }}>
          <BusStreetSet fog={0.55} nia niaPound={f > cG - 20 ? 1 : 0} sky="storm" lamp={0} blackout={1} busX={1060} />
          <Plane p={1}>
            <Glow x={160} y={880} r={520} color={cop(f)} opacity={0.2} />
            <Character id="s32drv" kind="driver" x={1240} y={G} scale={S} facing={-1} lightSide={-1} nightTint={0.3} prop="phone" pose={{ head: 4, brow: 0.8, handNear: "grip", armNear: [30, 90] }} />
            <Character id="s32mara" kind="mara" x={ci(f, [20, 70], [560, 980])} y={G} scale={S} facing={1} lightSide={-1} nightTint={0.3} shoulderRadio
              reachNear={f > 70 ? anchor("mara", 980, G, S, 1, "radio") : undefined} pose={{ ...(step > 0 && step < 1 ? walkDist(step * 420, "mara", S, 0.8) : {}), head: 4, brow: 0.6, handNear: "grip" }} />
            <Character id="s32alex" kind="alex" x={480} y={G} scale={S} facing={1} lightSide={-1} nightTint={0.3} shoulderRadio pose={{ head: 2, brow: 0.6, armNear: [50, 20], handNear: "open" }} />
          </Plane>
          <ForegroundRain />
          <Post />
        </Stage>
      </Shot>
      <Shot from={cG + 10} to={D + 1}>
        <Stage cam={{ x: handheld(f, 0.6, 32).x, y: handheld(f, 0.6, 32).y, zoom: ci(f, [cG, D], [1.0, 1.08]) }}>
          <BusWindowCloseup fog={0.55} wipe={1} pound={pound} />
          <Post tintOpacity={0.12} vignette={0.55} />
        </Stage>
      </Shot>
      <EdgeFade dur={D} outF={6} />
      {Array.from({ length: 6 }).map((_, k) => <Sfx key={k} name="thud" at={cG + 30 + k * 14} gain={0.4} />)}
      <Sfx name="static" at={72} gain={0.3} />
    </>
  );
};

/* ============ S33 — Mara answers on speaker; the voice ============ */
export const Scene33: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(33);
  const cA = cq(33, "answers", 0.25);
  const cV = cq(33, "voice", 0.6);
  const hh = handheld(f, 0.5, 33);
  const ghost = ci(f, [cV, cV + 40, D - 20, D], [0, 0.35, 0.35, 0]);
  return (
    <Stage cam={{ x: hh.x + ci(f, [0, D], [0, 30]), y: hh.y, zoom: ci(f, [0, D], [1.0, 1.15], EZ) }}>
      <Plane p={0.3}><AbsoluteFill style={{ background: "radial-gradient(circle at 70% 30%, #1a1430, #05060c)" }} /></Plane>
      <Plane p={0.45}>
        <div style={{ position: "absolute", inset: 0, opacity: ghost, filter: "blur(3px)" }}>
          <JokerProfile x={1500} y={900} scale={1.6} laugh={0.6} card={0} />
        </div>
      </Plane>
      <Plane p={1}>
        <Character id="s33mara" kind="mara" x={820} y={1560} crop="waist" scale={1.9} facing={1} lightSide={1} nightTint={0.3} shoulderRadio
          reachNear={f > cA ? [1080, 760] : [960, 900]} pose={{ head: 14, eyeY: 0.7, brow: 0.8, handNear: "grip" }} />
        <Character id="s33alex" kind="alex" x={1380} y={1560} crop="waist" scale={1.9} facing={-1} lightSide={1} nightTint={0.3} shoulderRadio pose={{ head: 16, eyeY: 0.8, brow: 0.9, lean: f > cV ? -6 : 0 }} />
      </Plane>
      <Phone x={1100} y={720} s={1.1} ring={f < cA ? 1 : 0} speaker={f > cA ? 1 : 0} />
      <Glow x={1100} y={700} r={180} color="140,220,170" opacity={f > cA ? 0.3 : 0.1} />
      <ForegroundRain amt={0.6} />
      <Post tintColor="#2a1440" tintOpacity={0.16} />
      <EdgeFade dur={D} outF={6} />
      {[0, 30, 60].map((t, k) => <Sfx key={k} name="click" at={t} gain={0.4} />)}
      <Sfx name="static" at={cA} gain={0.35} />
    </Stage>
  );
};

/* ============ S34 — The door is wired; he laughs and hangs up ============ */
export const Scene34: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(34);
  const cL = cq(34, "laughs", 0.8);
  return (
    <>
      <Shot from={0} to={cL}>
        <Stage cam={{ x: ci(f, [0, cL], [0, 120], EZ), y: ci(f, [0, cL], [0, -40]), zoom: ci(f, [0, cL], [1.0, 1.5], EZ) }}>
          <Plane p={0.3}><AbsoluteFill style={{ background: "#080a12" }} /></Plane>
          <Plane p={1}>
            {/* door end of the bus (wire + blinking LED by the hinge) */}
            <SchoolBus x={-1300} y={-120} scale={3.1} fog={0.65} wire ledOn={Math.floor(f / 12) % 2 === 0} interior={0.3} />
            <Glow x={1300} y={380} r={160} color="255,40,40" opacity={Math.floor(f / 12) % 2 === 0 ? 0.4 : 0.05} />
          </Plane>
          <ForegroundRain />
          <Post />
        </Stage>
      </Shot>
      <Shot from={cL} to={D + 1}>
        <Stage cam={{ x: 0, y: 0, zoom: ci(f, [cL, D], [1.1, 1.2]) }}>
          <Plane p={0.3}><AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #161a26, #05060c)" }} /></Plane>
          <Phone x={960} y={560} s={2} speaker={f < cL + 40 ? 1 : 0} />
          <Post />
        </Stage>
      </Shot>
      <Caption text="CALL ENDED" from={cL + 44} to={D} align="center" y={860} />
      <EdgeFade dur={D} outF={8} />
      <Sfx name="click" at={cL + 40} gain={0.5} />
    </>
  );
};

/* ============ S35 — Nia's flashlight slips and rolls under a seat ============ */
export const Scene35: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(35);
  const cS = cq(35, "slips", 0.6);
  const drop = ci(f, [cS, cS + 14], [0, 1], Easing.in(Easing.quad));
  const roll = ci(f, [cS + 14, cS + 60], [0, 1], Easing.out(Easing.cubic));
  return (
    <Stage cam={{ x: ci(f, [0, D], [40, -20]), y: ci(f, [cS, cS + 40], [0, 60], EZ), zoom: ci(f, [0, D], [1.2, 1.35], EZ) }}>
      <BusInterior dark={0.75} front={drop > 0 ? (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          {/* the small torch falls, bounces, rolls under the bench (beam spins across the floor) */}
          <g transform={`translate(${1110 - roll * 160} ${520 + drop * 230 - Math.abs(Math.sin(roll * Math.PI * 3)) * 14 * (1 - roll)}) rotate(${drop * 120 + roll * 540})`}>
            <rect x={-16} y={-4} width={26} height={8} rx={2} fill="#6b6f78" stroke="#06070b" strokeWidth={1.4} />
            <rect x={10} y={-6} width={8} height={12} fill="#8a8f99" stroke="#06070b" strokeWidth={1.2} />
            <path d="M18 -4 L180 -40 L180 40 L18 4 Z" fill="#fff2c8" opacity={0.25 * (1 - roll)} style={{ mixBlendMode: "screen", filter: "blur(4px)" }} />
          </g>
        </svg>
      ) : undefined}>
        <NiaSeated prop={drop === 0} flash={1} reach={drop === 0 ? [1110, 520] : [1120, 470]} pose={{ head: -4, eyeX: 0.6, brow: 0.7, handNear: drop > 0 ? "open" : "grip", handFar: "open" }} />
      </BusInterior>
      <Post tintOpacity={0.2} />
      <EdgeFade dur={D} outF={6} />
      <Sfx name="thud" at={cS + 14} gain={0.3} />
      <Sfx name="rattle" at={cS + 20} gain={0.25} />
    </Stage>
  );
};

/* ============ S36 — Alex steps toward the bus door ============ */
export const Scene36: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(36);
  const cT = cq(36, "step", 0.85);
  const st = ci(f, [cT, cT + 26], [0, 1], EZ);
  return (
    <Stage cam={{ x: ci(f, [0, D], [-20, 60]), y: 0, zoom: ci(f, [0, D], [1.0, 1.12], EZ) + st * 0.05 }}>
      <BusStreetSet fog={ci(f, [0, D], [0.6, 0.85])} nia sky="storm" lamp={0} blackout={1} busX={1060} />
      <Plane p={1}>
        <Glow x={160} y={880} r={520} color={cop(f)} opacity={0.2} />
        <Character id="s36drv" kind="driver" x={300} y={G} scale={S} facing={1} lightSide={-1} nightTint={0.3} pose={{ head: 4, brow: 0.8 }} />
        <Character id="s36mara" kind="mara" x={520} y={G} scale={S} facing={1} lightSide={-1} nightTint={0.3} shoulderRadio reachNear={anchor("mara", 520, G, S, 1, "radio")} pose={{ head: 2, brow: 0.6, handNear: "grip" }} />
        <Character id="s36alex" kind="alex" x={760 + st * 160} y={G} scale={S} facing={1} lightSide={-1} nightTint={0.3} shoulderRadio pose={{ ...(st > 0 && st < 1 ? walkDist(st * 160, "alex", S, 0.7) : {}), head: -2, brow: 0.7 }} />
      </Plane>
      <ForegroundRain />
      <Post />
      <EdgeFade dur={D} outF={6} />
      <Sfx name="step" at={cT + 4} gain={0.35} />
    </Stage>
  );
};

/* ============ S37 — Batman lands; cape settles; he drops into the street ============ */
export const Scene37: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(37);
  const cL = cq(37, "lands", 0.15);
  const cD = cq(37, "drops", 0.45);
  const cN = cq(37, "nobody", 0.65);
  const land = ci(f, [cL, cL + 10], [0, 1], Easing.in(Easing.quad));
  const drop = ci(f, [cD, cD + 14], [0, 1], Easing.in(Easing.quad));
  const crouch = ci(f, [cD + 14, cD + 18, cD + 40], [0, 1, 0], EZ);
  return (
    <>
      <Shot from={0} to={cD}>
        <Stage cam={{ x: 0, y: ci(f, [0, cL], [80, 0]), zoom: ci(f, [0, cD], [1.0, 1.1]) + (f > cL + 10 && f < cL + 16 ? 0.02 : 0), shakeY: f > cL + 10 && f < cL + 18 ? Math.sin(f * 3) * 6 : 0 }}>
          <Plane p={0.1}><Sky variant="storm" seed={37} horizonY={900} flash={lightning(f, [cL + 6])} /></Plane>
          <Plane p={0.7}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <path d="M-200 1400 L260 560 L1660 560 L2120 1400 Z" fill="#2a1c20" />
              {Array.from({ length: 24 }).map((_, i) => <path key={i} d={`M-200 ${600 + i * 40} H2120`} stroke="#000" strokeOpacity={0.2} />)}
              <rect x={240} y={540} width={1440} height={30} fill="#3a2a2e" stroke="#0a0a0e" strokeWidth={3} />
            </svg>
            <Character id="s37batRoof" kind="batman" x={960} y={560 - (1 - land) * 600} scale={0.9} facing={1} lightSide={1} nightTint={0.4} silhouette={0.7} rim="#9fb6dc" capeWind={1.4 - land * 1.2} crop="transit"
              pose={{ legNear: land >= 1 ? [40, 80] : [10, 10], legFar: land >= 1 ? [-20, 60] : [-10, 10], lean: land >= 1 ? 14 : 0, head: 12, armNear: [30, 40], armFar: [-30, 40] }} />
          </Plane>
          <Plane p={1}><Character id="s37alexA" kind="alex" x={380} y={1300} crop="waist" scale={1.3} facing={1} lightSide={1} nightTint={0.35} shoulderRadio pose={{ head: -24, neck: -14, eyeY: -1, brow: 0.9 }} /></Plane>
          <ForegroundRain />
          <Post />
        </Stage>
      </Shot>
      <Shot from={cD} to={D + 1}>
        <Stage cam={{ x: ci(f, [cD, D], [0, 40]), y: 0, zoom: ci(f, [cD, D], [1.05, 1.12]), shakeY: f > cD + 14 && f < cD + 22 ? Math.sin(f * 3) * 7 : 0 }}>
          <BusStreetSet fog={0.8} nia sky="storm" lamp={0} blackout={1} busX={1160} />
          <Plane p={1}>
            <Glow x={160} y={880} r={520} color={cop(f)} opacity={0.2} />
            <Character id="s37drv" kind="driver" x={ci(f, [cN, cN + 30], [300, 220])} y={G} scale={S} facing={1} lightSide={-1} nightTint={0.3} pose={{ head: -6, brow: 0.9, lean: -8 }} />
            <Character id="s37mara" kind="mara" x={500} y={G} scale={S} facing={1} lightSide={-1} nightTint={0.3} shoulderRadio pose={{ head: f > cN + 20 ? -14 : 0, eyeY: f > cN + 20 ? -0.8 : 0, brow: 0.8 }} />
            <Character id="s37alex" kind="alex" x={760} y={G} scale={S} facing={1} lightSide={-1} nightTint={0.3} shoulderRadio pose={{ head: 0, brow: 0.9, lean: -4 }} />
            <Character id="s37bat" kind="batman" x={1080} y={G - (1 - drop) * 900} groundY={G} scale={S} facing={-1} lightSide={-1} nightTint={0.35} rim="#9fb6dc" capeWind={drop < 1 ? 1.6 : 0.6} crop={drop < 1 ? "transit" : undefined}
              pose={{ legNear: [10 + crouch * 50, crouch * 100], legFar: [-10 + crouch * 30, crouch * 80], lean: crouch * 20, bob: crouch * 60, armNear: [20 + crouch * 30, 30], armFar: [-20, 30], head: 4 }} />
          </Plane>
          <ForegroundRain />
          <Post />
        </Stage>
      </Shot>
      <EdgeFade dur={D} outF={6} />
      <Sfx name="land" at={cL + 10} gain={0.6} />
      <Sfx name="cloth" at={cL + 14} gain={0.5} />
      <Sfx name="land" at={cD + 14} gain={0.7} />
    </>
  );
};

/* ============ S38 — Batman takes the radio and warns dispatch ============ */
export const Scene38: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(38);
  const cT = cq(38, "takes", 0.25);
  const cD = cq(38, "dispatch", 0.45);
  const cM = cq(38, "move", 0.7);
  const BX = 1120, AX = 760;
  const radioAlex = anchor("alex", AX, G, S, 1, "radio");
  const grab = ci(f, [cT, cT + 14], [0, 1], EZ);
  const toMouth = ci(f, [cT + 14, cT + 30], [0, 1], EZ);
  const batMouth: [number, number] = anchor("batman", BX, G, S, -1, "radio");
  const radioPos: [number, number] = [radioAlex[0] + (batMouth[0] - 10 - radioAlex[0]) * toMouth, radioAlex[1] + (batMouth[1] - 30 - radioAlex[1]) * toMouth];
  return (
    <Stage cam={{ x: ci(f, [0, D], [80, -20]), y: 0, zoom: ci(f, [0, cD], [1.25, 1.4], EZ) + ci(f, [cM, D], [0, -0.2], EZ) }}>
      <BusStreetSet fog={0.8} nia sky="storm" lamp={0} blackout={1} busX={1160} wire led />
      <Plane p={1}>
        <Glow x={160} y={880} r={520} color={cop(f)} opacity={0.2} />
        <Character id="s38mara" kind="mara" x={460} y={G} scale={S} facing={1} lightSide={-1} nightTint={0.3} shoulderRadio
          pose={{ head: 4, brow: 0.5, armNear: f > cM ? [100 + Math.sin(f * 0.2) * 20, 30] : [8, 14], armFar: f > cM ? [80, 40] : [-6, 12], handNear: "open", eyeX: f > cM ? -0.8 : 0.5 }} />
        <Character id="s38alex" kind="alex" x={AX} y={G} scale={S} facing={1} lightSide={-1} nightTint={0.3} shoulderRadio={grab < 0.5} pose={{ head: 2, brow: 0.7, armNear: f < cT ? [60 + Math.sin(f * 0.2) * 10, 50] : [8, 14] }} />
        <Character id="s38bat" kind="batman" x={BX} y={G} scale={S} facing={-1} lightSide={-1} nightTint={0.35} rim="#9fb6dc" capeWind={0.5}
          reachNear={grab > 0 ? (toMouth > 0 ? radioPos : [radioAlex[0] + (1 - grab) * 60, radioAlex[1]]) : undefined} prop={grab >= 0.5 ? "radio" : "none"} propOn={1}
          pose={{ head: f < cT ? 8 : 2, eyeX: f < cT ? 0.8 : 0, handNear: "grip", brow: 0.6 }} />
      </Plane>
      <ForegroundRain />
      <Post />
      <Caption text="DON'T OPEN IT." from={cT + 10} to={cT + 50} align="center" y={140} />
      <EdgeFade dur={D} outF={6} />
      <Sfx name="grab" at={cT + 10} gain={0.5} />
      <Sfx name="static" at={cD} gain={0.35} />
    </Stage>
  );
};

/* ============ S39 — Batman scans the rooftops ============ */
export const Scene39: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(39);
  const pan = ci(f, [0, D], [-500, 500], Easing.inOut(Easing.sin));
  return (
    <Stage cam={{ x: pan, y: ci(f, [0, D / 2, D], [-120, -40, -120]), zoom: 1.0 }}>
      <Plane p={0.1}><Sky variant="storm" seed={39} horizonY={640} /></Plane>
      <Plane p={0.35}><DecoSkyline seed={91} baseY={720} hMin={300} hMax={640} haze={0.4} litP={0} blackout={1} /></Plane>
      <Plane p={0.6}><StreetFacades seed={39} baseY={760} litP={0} heightMin={600} heightMax={860} dark={0.5} x0={-1200} x1={3200} /></Plane>
      <Plane p={1}>
        <WetStreet horizonY={760} curbY={806} laneY={960} reflections={[]} seed={39} />
        {[-700, 300, 1500, 2500].map((cx, i) => <Cruiser key={i} x={cx} y={900 - 164 * BM.car(900)} scale={BM.car(900)} lightsOn={false} flip={i % 2 === 1} />)}
      </Plane>
      <Plane p={1.25}>
        <Character id="s39bat" kind="batman" x={960 + pan * 1.25} y={1500} crop="waist" scale={1.6} facing={1} lightSide={1} nightTint={0.4} silhouette={0.5} rim="#9fb6dc" viewAngle="back" capeWind={0.6}
          pose={{ head: -12 + Math.sin(f * 0.04) * 6, neck: -8 }} />
      </Plane>
      <Plane p={1.1}><Rain count={140} opacity={0.18} /></Plane>
      <Post />
      <EdgeFade dur={D} outF={6} />
    </Stage>
  );
};

/* ============ S40 — Batman answers the second call (two problems) ============ */
export const Scene40: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(40);
  const cA = cq(40, "answers", 0.15);
  const cH = cq(40, "hospital", 0.6);
  const cE = Math.min(D, cH + 140);
  return (
    <>
      <Shot from={0} to={cH}>
        <Stage cam={{ x: ci(f, [0, cH], [0, 30]), y: 0, zoom: ci(f, [0, cH], [1.0, 1.12], EZ) }}>
          <Plane p={0.3}><AbsoluteFill style={{ background: "radial-gradient(circle at 30% 30%, #1a2034, #04050a)" }} /></Plane>
          <Plane p={0.5}><SchoolBus x={900} y={140} scale={1.2} fog={0.85} interior={0.3} /></Plane>
          <Plane p={1}>
            <Glow x={200} y={300} r={600} color={cop(f)} opacity={0.12} />
            <Character id="s40bat" kind="batman" x={760} y={1560} crop="waist" scale={1.9} facing={1} lightSide={1} nightTint={0.35} rim="#9fb6dc" capeWind={0.4}
              reachNear={f > cA ? anchor("batman", 760, 1560, 1.9, 1, "radio") : [900, 1000]} prop={f > cA ? "phone" : "none"} propOn={1} pose={{ head: 6, eyeX: 0.4, handNear: "grip" }} />
            <Character id="s40mara" kind="mara" x={1500} y={1560} crop="waist" scale={1.9} facing={-1} lightSide={1} nightTint={0.35} shoulderRadio pose={{ head: 8, brow: 0.7 }} />
          </Plane>
          <ForegroundRain />
          <Post />
        </Stage>
      </Shot>
      <Shot from={cH} to={cE}>
        <Stage cam={{ x: 0, y: 0, zoom: ci(f, [cH, cE], [1.0, 1.1]) }}>
          <Plane p={0.15}><Sky variant="blackout" seed={40} horizonY={800} /></Plane>
          <Plane p={1}><Hospital power={ci(f, [cH, cE], [0.9, 0.15])} /></Plane>
          <Post tintColor="#3a1010" tintOpacity={0.12} />
        </Stage>
      </Shot>
      <Shot from={cE} to={D + 1}>
        <Stage cam={{ x: 0, y: 0, zoom: ci(f, [cE, D], [1.15, 1.25]) }}>
          <Plane p={0.3}><AbsoluteFill style={{ background: "radial-gradient(circle at 30% 30%, #1a2034, #04050a)" }} /></Plane>
          <Plane p={1}>
            <Character id="s40batB" kind="batman" x={760} y={1560} crop="waist" scale={1.9} facing={1} lightSide={1} nightTint={0.35} rim="#9fb6dc" capeWind={0.4}
              reachNear={anchor("batman", 760, 1560, 1.9, 1, "radio")} prop="phone" propOn={1} pose={{ head: 10, eyeY: 0.3, brow: 0.6, handNear: "grip" }} />
          </Plane>
          <ForegroundRain />
          <Post />
        </Stage>
      </Shot>
      <EdgeFade dur={D} outF={6} />
      <Sfx name="click" at={2} gain={0.4} />
      <Sfx name="click" at={30} gain={0.4} />
      <Sfx name="thud" at={cH + 60} gain={0.25} />
    </>
  );
};

/* ============ S41 — "Which hospital?" — "Find out." ============ */
export const Scene41: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(41);
  const cE = cq(41, "ends", 0.85);
  return (
    <Stage cam={{ x: 0, y: 0, zoom: ci(f, [0, D], [1.3, 1.45], EZ) }}>
      <Plane p={0.3}><AbsoluteFill style={{ background: "radial-gradient(circle at 30% 30%, #1a2034, #04050a)" }} /></Plane>
      <Plane p={1}>
        <Character id="s41bat" kind="batman" x={860} y={1640} crop="closeup" scale={2.3} facing={1} lightSide={1} nightTint={0.35} rim="#9fb6dc" capeWind={0.3}
          reachNear={f < cE ? anchor("batman", 860, 1640, 2.3, 1, "radio") : [1000, 1300]} prop="phone" propOn={f < cE ? 1 : 0} pose={{ head: 12, eyeY: 0.4, brow: 0.8, handNear: "grip" }} />
      </Plane>
      <Phone x={1500} y={300} s={0.7} speaker={f < cE ? 1 : 0} />
      <ForegroundRain amt={0.6} />
      <Post />
      <EdgeFade dur={D} outF={6} />
      <Sfx name="click" at={cE} gain={0.5} />
    </Stage>
  );
};

/* ============ S42 — Mara receives the hospital report ============ */
export const Scene42: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(42);
  const cR = cq(42, "report", 0.35);
  return (
    <Stage cam={{ x: ci(f, [0, D], [-40, 40]), y: 0, zoom: ci(f, [0, D], [1.2, 1.3], EZ) }}>
      <BusStreetSet fog={0.85} nia sky="storm" lamp={0} blackout={1} busX={1160} />
      <Plane p={1}>
        <Glow x={160} y={880} r={520} color={cop(f)} opacity={0.2} />
        <Character id="s42mara" kind="mara" x={720} y={G} scale={S} facing={1} lightSide={-1} nightTint={0.3} shoulderRadio reachNear={anchor("mara", 720, G, S, 1, "radio")} pose={{ head: f > cR ? 10 : 4, eyeY: 0.3, brow: 0.7, handNear: "grip", eyeX: f > cR ? 0.8 : -0.4 }} />
        <Character id="s42bat" kind="batman" x={1060} y={G} scale={S} facing={-1} lightSide={-1} nightTint={0.35} rim="#9fb6dc" capeWind={0.5} pose={{ head: 6, eyeX: 0.6 }} />
      </Plane>
      <ForegroundRain />
      <Post />
      <EdgeFade dur={D} outF={6} />
      {[cR, cR + 50].map((t, k) => <Sfx key={k} name="static" at={t} gain={0.35} />)}
    </Stage>
  );
};

/* ============ S43 — Batman looks at the child, then points out the wire ============ */
export const Scene43: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(43);
  const cF = cq(43, "far", 0.25);
  const cW = cq(43, "wire", 0.75);
  const point = ci(f, [cW - 6, cW + 8], [0, 1], EZ);
  return (
    <Stage cam={{ x: ci(f, [0, D], [60, -20]), y: 0, zoom: ci(f, [0, D], [1.1, 1.22], EZ) }}>
      <BusStreetSet fog={0.85} nia sky="storm" lamp={0} blackout={1} busX={1060} wire led />
      <Plane p={1}>
        <Glow x={160} y={880} r={520} color={cop(f)} opacity={0.2} />
        <Character id="s43bat" kind="batman" x={760} y={G} scale={S} facing={1} lightSide={-1} nightTint={0.35} rim="#9fb6dc" capeWind={0.5}
          reachNear={point > 0 ? [760 + 220 * point, G - 300 * S] : undefined} pose={{ head: f < cF ? -6 : f < cW ? 0 : 4, eyeX: f < cF ? 0.6 : f < cW ? -1 : 0.8, handNear: "point" }} />
        <Character id="s43mara" kind="mara" x={480} y={G} scale={S} facing={1} lightSide={-1} nightTint={0.3} shoulderRadio reachNear={f > cW ? anchor("mara", 480, G, S, 1, "radio") : undefined} pose={{ head: 2, brow: 0.6, handNear: "grip" }} />
        <Character id="s43alex" kind="alex" x={300} y={G} scale={S} facing={1} lightSide={-1} nightTint={0.3} shoulderRadio pose={{ head: 0, brow: 0.8, eyeX: f > cF && f < cW ? 0.8 : 0.2 }} />
      </Plane>
      <ForegroundRain />
      <Post />
      <EdgeFade dur={D} outF={6} />
    </Stage>
  );
};

/* ============ S44 — "Stay with her." Grapple away over the rooftops ============ */
export const Scene44: React.FC = () => {
  const f = useCurrentFrame();
  const D = sceneDur(44);
  const cS = cq(44, "stay", 0.2);
  const cF = cq(44, "fires", 0.75);
  const fire = ci(f, [cF, cF + 8], [0, 1]);
  const lift = ci(f, [cF + 12, cF + 40], [0, 1], Easing.in(Easing.cubic));
  return (
    <>
      <Shot from={0} to={cF - 4}>
        <Stage cam={{ x: ci(f, [0, cF], [0, -30]), y: 0, zoom: ci(f, [0, cF], [1.0, 1.12], EZ) }}>
          <Plane p={0.3}><AbsoluteFill style={{ background: "radial-gradient(circle at 60% 30%, #1a2034, #04050a)" }} /></Plane>
          <Plane p={1}>
            <Glow x={1700} y={300} r={600} color={cop(f)} opacity={0.12} />
            <Character id="s44bat" kind="batman" x={1260} y={1560} crop="waist" scale={1.9} facing={-1} lightSide={-1} nightTint={0.35} rim="#9fb6dc" capeWind={0.5} pose={{ head: 10, eyeY: 0.5, brow: 0.6 }} />
            <Character id="s44alex" kind="alex" x={560} y={1560} crop="waist" scale={1.9} facing={1} lightSide={-1} nightTint={0.3} shoulderRadio pose={{ head: -6, eyeY: -0.3, brow: 0.8 }} />
          </Plane>
          <ForegroundRain />
          <Post />
        </Stage>
      </Shot>
      <Shot from={cF - 4} to={D + 1}>
        <Stage cam={{ x: 0, y: ci(f, [cF + 10, D], [0, -200], EZ), zoom: ci(f, [cF, D], [1.0, 1.08]) }}>
          <BusStreetSet fog={0.85} nia sky="storm" lamp={0} blackout={1} busX={1260} />
          <Plane p={1}>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              {fire > 0 && <path d={`M${900} ${G - 380 * S - lift * 900} L${900 + (300 - 900) * fire} ${G - 380 * S + (-500 - (G - 380 * S)) * fire}`} stroke="#d8dce6" strokeWidth={2.5} opacity={0.85} />}
            </svg>
            <Character id="s44batB" kind="batman" x={900 - lift * 300} y={G - lift * 1100} groundY={G} scale={S} facing={-1} lightSide={-1} nightTint={0.35} rim="#9fb6dc" capeWind={0.5 + lift * 1.5} crop={lift > 0 ? "transit" : undefined}
              reachNear={[900 - lift * 300 - 120 * S, G - lift * 1100 - 560 * S]} pose={{ handNear: "grip", head: -14, legNear: [20 * lift, 30 * lift], legFar: [-10 * lift, 50 * lift] }} />
            <Character id="s44alexB" kind="alex" x={560} y={G} scale={S} facing={1} lightSide={-1} nightTint={0.3} shoulderRadio={false} pose={{ head: -6 - lift * 20, eyeY: -lift, brow: 0.8 }} />
          </Plane>
          <ForegroundRain />
          <Post />
        </Stage>
      </Shot>
      <Caption text="STAY WITH HER." from={cS} to={cS + 40} align="center" y={140} />
      <EdgeFade dur={D} outF={8} />
      <Sfx name="whoosh" at={cF} gain={0.6} />
      <Sfx name="cloth" at={cF + 12} gain={0.5} />
    </>
  );
};

export const _unused = { Rain, Fog, Splashes, Parapet, guardWindowHead };
