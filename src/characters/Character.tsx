import React, { useId } from "react";
import { useCurrentFrame } from "remotion";
import { mix, shade, tint } from "../lib/anim";
import { useScreenProj } from "../lib/Camera";
import { auditReport } from "../lib/audit";

export type Kind = "alex" | "alexYoung" | "alexDress" | "mara" | "batman" | "father" | "nia" | "mother" | "driver" | "specialist" | "robber" | "employee" | "reporter";

export type Pose = {
  lean: number; bob: number; head: number; neck: number;
  armFar: [number, number]; armNear: [number, number];
  legFar: [number, number]; legNear: [number, number];
  blink: number; brow: number; smile: number; mouth: number; eyeX: number; eyeY: number;
  handNear: "open" | "fist" | "grip" | "point"; handFar: "open" | "fist" | "grip" | "point";
};
export const NEUTRAL: Pose = {
  lean: 0, bob: 0, head: 0, neck: 0, armFar: [-6, 12], armNear: [8, 14], legFar: [-4, 4], legNear: [5, 4],
  blink: 0, brow: 0, smile: 0, mouth: 0, eyeX: 0, eyeY: 0, handNear: "open", handFar: "open",
};

type Pal = { skin: string; hair: string; top: string; top2: string; pants: string; shoes: string; hat?: string; accent: string; };
const PAL: Record<Kind, Pal> = {
  alex: { skin: "#c48a62", hair: "#17110e", top: "#1f2c3f", top2: "#0b0f18", pants: "#18212f", shoes: "#0a0a0e", hat: "#1a2436", accent: "#d9b24a" },
  alexYoung: { skin: "#c48a62", hair: "#17110e", top: "#7a2e2a", top2: "#e0d6c0", pants: "#2e3a56", shoes: "#3a2a20", accent: "#e0d6c0" },
  alexDress: { skin: "#c48a62", hair: "#17110e", top: "#1d2b52", top2: "#c9cfd9", pants: "#1d2b52", shoes: "#060608", hat: "#1d2b52", accent: "#d9b24a" },
  mara: { skin: "#7a4a30", hair: "#2a1410", top: "#2b3654", top2: "#a9bfd8", pants: "#1b2236", shoes: "#0a0a0e", hat: "#22397a", accent: "#d9b24a" },
  batman: { skin: "#c49a7a", hair: "#000", top: "#7d8595", top2: "#161a26", pants: "#7d8595", shoes: "#161a26", hat: "#161a26", accent: "#d8b23a" },
  father: { skin: "#b07a55", hair: "#a7a7a7", top: "#5d4b39", top2: "#cfc6b2", pants: "#3a3a46", shoes: "#2a1d14", accent: "#3f4c3c" },
  nia: { skin: "#a8714d", hair: "#1a120e", top: "#f0c21a", top2: "#d9a50e", pants: "#3a4a6a", shoes: "#c8302a", accent: "#f0c21a" },
  mother: { skin: "#a8714d", hair: "#1a120e", top: "#6b2f3a", top2: "#3c1a22", pants: "#2a2a34", shoes: "#141014", accent: "#d0c0a0" },
  driver: { skin: "#d1a07c", hair: "#5a4a3a", top: "#3e5266", top2: "#22303e", pants: "#2a2f3a", shoes: "#0e0e10", hat: "#2c3d50", accent: "#c0c0c0" },
  specialist: { skin: "#c08a66", hair: "#222", top: "#2e3a2e", top2: "#1a221a", pants: "#2e3a2e", shoes: "#111", hat: "#2a332a", accent: "#e0c040" },
  robber: { skin: "#d2a07e", hair: "#2a1e16", top: "#3a3436", top2: "#1c1a1c", pants: "#1e2430", shoes: "#0e0e0e", hat: "#222", accent: "#888" },
  employee: { skin: "#e0b08e", hair: "#6a3a1e", top: "#c9c3b8", top2: "#3a4256", pants: "#2c3446", shoes: "#141414", accent: "#9a7a5a" },
  reporter: { skin: "#d6a682", hair: "#3a2a1e", top: "#6a6250", top2: "#2a2620", pants: "#3a3630", shoes: "#141414", hat: "#4a4236", accent: "#c0c0c0" },
};

type Build = { H: number; sh: number; waist: number; hipW: number; thigh: number; shin: number; ua: number; fa: number; limb: number; headS: number; female?: boolean; child?: boolean; belly?: number; };
const BUILD: Record<Kind, Build> = {
  alex: { H: 400, sh: 1, waist: 1, hipW: 1, thigh: 100, shin: 98, ua: 78, fa: 72, limb: 1, headS: 1 },
  alexYoung: { H: 320, sh: 0.82, waist: 0.85, hipW: 0.85, thigh: 80, shin: 78, ua: 62, fa: 58, limb: 0.8, headS: 0.95, child: true },
  alexDress: { H: 400, sh: 1, waist: 1, hipW: 1, thigh: 100, shin: 98, ua: 78, fa: 72, limb: 1, headS: 1 },
  mara: { H: 408, sh: 0.86, waist: 0.86, hipW: 1.04, thigh: 104, shin: 102, ua: 76, fa: 70, limb: 0.88, headS: 0.94, female: true },
  batman: { H: 440, sh: 1.32, waist: 1.05, hipW: 1.05, thigh: 108, shin: 106, ua: 84, fa: 78, limb: 1.25, headS: 1.0 },
  father: { H: 380, sh: 1.02, waist: 1.25, hipW: 1.12, thigh: 94, shin: 92, ua: 74, fa: 68, limb: 1.05, headS: 1.02, belly: 14 },
  // WORLD_METRICS kid 1.25 m (alex 400 = 1.75 m)
  nia: { H: 286, sh: 0.7, waist: 0.8, hipW: 0.76, thigh: 64, shin: 62, ua: 54, fa: 50, limb: 0.7, headS: 0.92, child: true, female: true },
  mother: { H: 380, sh: 0.86, waist: 0.92, hipW: 1.05, thigh: 96, shin: 94, ua: 74, fa: 68, limb: 0.9, headS: 0.95, female: true },
  driver: { H: 390, sh: 1.05, waist: 1.25, hipW: 1.1, thigh: 96, shin: 94, ua: 76, fa: 70, limb: 1.05, headS: 1, belly: 18 },
  specialist: { H: 405, sh: 1.25, waist: 1.25, hipW: 1.15, thigh: 100, shin: 98, ua: 78, fa: 72, limb: 1.35, headS: 1.15 },
  robber: { H: 395, sh: 1.0, waist: 1, hipW: 1, thigh: 100, shin: 96, ua: 78, fa: 72, limb: 1, headS: 1 },
  employee: { H: 375, sh: 0.86, waist: 0.9, hipW: 1.05, thigh: 94, shin: 92, ua: 72, fa: 66, limb: 0.88, headS: 0.95, female: true },
  reporter: { H: 395, sh: 1.0, waist: 1.05, hipW: 1, thigh: 100, shin: 96, ua: 78, fa: 72, limb: 1, headS: 1 },
};

/** capsule limb from (0,0) down to (0,L) */
const cap = (L: number, r1: number, r2: number) =>
  `M${-r1} 0 L${-r2} ${L} A${r2} ${r2} 0 0 0 ${r2} ${L} L${r1} 0 A${r1} ${r1} 0 0 0 ${-r1} 0 Z`;

export type CharProps = {
  kind: Kind; x: number; y: number; scale?: number; facing?: 1 | -1; pose?: Partial<Pose>;
  id: string; lightSide?: 1 | -1; silhouette?: number; rim?: string; nightTint?: number;
  prop?: "radio" | "flashlight" | "key" | "phone" | "bottle" | "toolbox" | "none"; propOn?: number; flashBeam?: number;
  /** declared framing crop (framing audit): thigh/waist = cut above the knee on purpose; closeup = extreme close; transit = passes through frame edge during a camera move */
  crop?: "thigh" | "waist" | "closeup" | "transit";
  shoulderRadio?: boolean; capeWind?: number; hood?: boolean; glowEyes?: number; noHat?: boolean; style?: React.CSSProperties;
  /** world-space IK targets for the palm centre (overrides armNear / armFar) */
  reachNear?: [number, number]; reachFar?: [number, number];
  /** world y of the floor for the contact shadow (defaults to y) */
  groundY?: number; allowMouth?: boolean; noLife?: boolean; shadow?: number;
  /** view-angle matrix: "threeQuarter" (default: chest details on the front surface, near arm at the back shoulder),
   *  "side" (same rig, chest details on the profile edge) or "back" (no face features, no chest details, cape covers the back) */
  viewAngle?: "threeQuarter" | "side" | "back";
};

export const BAT_EMBLEM = "M100 30 L92 12 L88 28 C78 26 70 20 66 8 C56 22 30 26 4 22 C22 34 26 50 20 64 C34 56 46 58 54 70 C62 60 72 62 80 72 C86 66 94 68 100 88 C106 68 114 66 120 72 C128 62 138 60 146 70 C154 58 166 56 180 64 C174 50 178 34 196 22 C170 26 144 22 134 8 C130 20 122 26 112 28 L108 12 Z";
const hashStr = (t: string) => { let h = 7; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) % 100003; return h; };

export const Character: React.FC<CharProps> = (props) => {
  const f = useCurrentFrame();
  const { kind, x, y, scale = 1, facing = 1, id, lightSide = 1, silhouette = 0, rim = "#9fc0ff", nightTint = 0.28,
    prop = "none", propOn = 0, flashBeam = 0, shoulderRadio = false, capeWind = 1, glowEyes = 0, noHat = false } = props;
  const p: Pose = { ...NEUTRAL, ...props.pose };
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  // ---- automatic "life": blinks every 3-5 s, breathing, micro head drift; narrator-only => mouths closed
  const hsh = hashStr(id);
  if (!props.noLife) {
    if (props.pose?.blink === undefined) p.blink = blinkAt(f, 76 + (hsh % 44), hsh % 53);
    p.bob += breathe(f + hsh, 0.27, 1.3);
    p.head += Math.sin((f + hsh) * 0.045) * 0.9 + Math.sin((f + hsh) * 0.017) * 0.7;
  }
  if (!props.allowMouth) p.mouth = 0;
  const b = BUILD[kind];
  // ---- PREVENTION: framing audit (feet / shin crops). A body may be (a) fully in frame with feet on the floor,
  // or (b) deliberately cropped ABOVE the knee (declare crop="thigh"|"waist"). Cutting between ankle and knee,
  // or feet hanging below the frame with no declared crop, is reported (CI fails on it).
  const proj = useScreenProj();
  {
    // seated figures: y sits below the floor by thigh*scale while the feet rest on groundY
    const fy = Math.min(y, props.groundY ?? y);
    const feet = proj.y(fy), knee = proj.y(fy - b.shin * scale * 1.08);
    const cutBetweenFootAndKnee = feet > 1066 && knee < 1080 + 24 * proj.z * scale;
    if (props.crop !== "transit" && props.crop !== "closeup" && cutBetweenFootAndKnee) auditReport(`${id}:shin-crop(feet ${feet | 0})`);
    if (!props.crop && feet > 1066 && !cutBetweenFootAndKnee) auditReport(`${id}:undeclared-crop(feet ${feet | 0})`);
  }
  const pal0 = PAL[kind];
  const sil = (c: string) => mix(mix(c, "#1b2a4a", nightTint), "#06080f", silhouette);
  const pal: Pal = Object.fromEntries(Object.entries(pal0).map(([k, v]) => [k, sil(v as string)])) as Pal;
  const ls = lightSide * facing; // light side in local space
  const S = b.H / 400;
  const outline = "#06070b";
  const sw = 2.2 / scale;

  // gradient per material
  const mats: Record<string, string> = { skin: pal.skin, hair: pal.hair, top: pal.top, top2: pal.top2, pants: pal.pants, shoes: pal.shoes, hat: pal.hat ?? pal.top2, accent: pal.accent };
  const g = (m: string) => `url(#${id}-${m})`;
  const defs = (
    <defs>
      {Object.entries(mats).map(([m, c]) => (
        <linearGradient key={m} id={`${id}-${m}`} x1={ls > 0 ? "0" : "1"} y1="0" x2={ls > 0 ? "1" : "0"} y2="0">
          <stop offset="0" stopColor={shade(c, 0.55)} />
          <stop offset="0.5" stopColor={shade(c, 0.3)} />
          <stop offset="0.62" stopColor={c} />
          <stop offset="0.93" stopColor={tint(c, 0.12)} />
          <stop offset="1" stopColor={mix(c, rim, 0.55)} />
        </linearGradient>
      ))}
      <radialGradient id={`${id}-eyeglow`}><stop offset="0" stopColor="#ffffff" stopOpacity="0.9" /><stop offset="1" stopColor="#bfe0ff" stopOpacity="0" /></radialGradient>
      <linearGradient id={`${id}-beam`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff2c8" stopOpacity="0.75" />
        <stop offset="1" stopColor="#fff2c8" stopOpacity="0" />
      </linearGradient>
    </defs>
  );

  const hipY = -(b.thigh + b.shin) * 1.0 + p.bob;
  const torsoLen = 150 * S;
  const shW = 46 * b.sh;
  const wW = 24 * b.waist;
  const hipW = 28 * b.hipW;
  const R = 11 * b.limb; // limb radius

  /* ---------- parts ---------- */
  /** hand drawn along +y from the wrist; local +x = palm-forward side */
  const hand = (type: string, col: string, r: number) => {
    const st = { stroke: outline, strokeWidth: sw } as const;
    if (type === "fist" || type === "grip") {
      // side-view fist: back of hand, four curled fingers stacked on the palm side (middle longest, pinky shortest), thumb wrapped over index/middle
      const fing = [[0.42, 1.0], [0.82, 1.1], [1.22, 1.0], [1.6, 0.82]];
      return (
        <g>
          <path d={`M${-r * 0.95} ${r * 0.05} Q${-r * 1.15} ${r * 1.0} ${-r * 0.82} ${r * 1.78} Q${-r * 0.3} ${r * 2.12} ${r * 0.4} ${r * 2.02} L${r * 0.5} ${r * 0.05} Z`} fill={col} {...st} />
          {fing.map(([t, w], i) => (
            <g key={i}>
              <rect x={r * 0.1} y={r * t} width={r * (0.55 + w * 0.6)} height={r * 0.42} rx={r * 0.21} fill={col} {...st} />
              <path d={`M${r * (0.3 + w * 0.45)} ${r * (t + 0.08)} q${r * 0.12} ${r * 0.13} 0 ${r * 0.26}`} stroke={outline} strokeWidth={sw * 0.6} fill="none" opacity={0.6} />
            </g>
          ))}
          <path d={`M${r * 0.35} ${r * 0.12} C${r * 1.0} ${r * 0.0} ${r * 1.45} ${r * 0.45} ${r * 1.28} ${r * 0.86} C${r * 1.15} ${r * 1.1} ${r * 0.75} ${r * 1.06} ${r * 0.55} ${r * 0.86} Z`} fill={col} {...st} />
          <path d={`M${r * 1.0} ${r * 0.62} q${r * 0.18} ${r * 0.04} ${r * 0.2} ${r * 0.2}`} stroke={outline} strokeWidth={sw * 0.5} fill="none" opacity={0.5} />
        </g>
      );
    }
    if (type === "point")
      return (
        <g>
          <path d={`M${-r * 0.9} ${r * 0.1} Q${-r * 1.1} ${r * 1.1} ${-r * 0.5} ${r * 1.7} Q${r * 0.3} ${r * 2.0} ${r * 0.9} ${r * 1.5} Q${r * 1.1} ${r * 0.8} ${r * 0.85} 0 Z`} fill={col} {...st} />
          <rect x={r * 0.35} y={r * 1.3} width={r * 0.55} height={r * 1.7} rx={r * 0.27} fill={col} {...st} />
          <path d={`M${r * 0.7} ${r * 0.4} Q${r * 1.4} ${r * 0.7} ${r * 1.1} ${r * 1.1}`} stroke={outline} strokeWidth={sw * 0.8} fill="none" />
        </g>
      );
    // open hand: palm + four fingers + thumb
    return (
      <g>
        {[-0.62, -0.2, 0.22, 0.62].map((fx, i) => <rect key={i} x={r * fx - r * 0.24} y={r * 1.3} width={r * 0.48} height={r * (1.25 - Math.abs(fx) * 0.35)} rx={r * 0.24} fill={col} {...st} />)}
        <path d={`M${-r * 0.95} 0 Q${-r * 1.1} ${r * 1.0} ${-r * 0.85} ${r * 1.6} H${r * 0.9} Q${r * 1.1} ${r * 0.9} ${r * 0.9} 0 Z`} fill={col} {...st} />
        <path d={`M${r * 0.8} ${r * 0.3} Q${r * 1.6} ${r * 0.6} ${r * 1.55} ${r * 1.3} Q${r * 1.2} ${r * 1.4} ${r * 0.85} ${r * 1.0}`} fill={col} {...st} />
      </g>
    );
  };
  /** fingers wrapped over a held prop (drawn above it) */
  const gripFingers = (col: string, r: number) => (
    <g>
      {[[0.55, 1.05], [0.95, 1.15], [1.35, 1.05], [1.72, 0.88]].map(([t, w], i) => <rect key={i} x={-r * 0.1} y={r * (t - 0.2)} width={r * w} height={r * 0.42} rx={r * 0.21} fill={col} stroke={outline} strokeWidth={sw * 0.8} />)}
    </g>
  );

  const gloveCol = kind === "batman" ? g("shoes") : kind === "specialist" ? g("top2") : g("skin");
  const sleeveCol = kind === "nia" ? g("top") : kind === "batman" ? g("top") : kind === "father" ? g("top") : g("top");

  const D = Math.PI / 180;
  const dir = (a: number) => [Math.sin(a * D), Math.cos(a * D)];
  /** seamless two-segment limb: upper and lower segments taper into one shared joint radius, outlines drawn first and
   *  covered by the fills (no internal seams, no visible joint circles), shading = thin rim + one soft shadow band
   *  clipped inside the limb (no "pipe" stripes). The shoulder/hip cap has no outline so it blends into the torso. */
  const Limb = ({ L1, L2, a1, a2, r1, r2, col, light, shadowCol, end, cid, lower }: { L1: number; L2: number; a1: number; a2: number; r1: number; r2: number; col: string; light: string; shadowCol: string; end?: React.ReactNode; cid: string; lower?: { t0: number; col: string; light: string; shadow: string; cuff?: string } }) => {
    const [d1x, d1y] = dir(a1); const [d2x, d2y] = dir(a2);
    const ex = d1x * L1, ey = d1y * L1, wx = ex + d2x * L2, wy = ey + d2y * L2;
    const rE = (r1 + r2) / 2;
    const n1: [number, number] = [-d1y, d1x], n2: [number, number] = [-d2y, d2x];
    const lv = [ls, -0.55];
    const s1 = n1[0] * lv[0] + n1[1] * lv[1] >= 0 ? 1 : -1, s2 = n2[0] * lv[0] + n2[1] * lv[1] >= 0 ? 1 : -1;
    const o1 = [-n1[0] * s1, -n1[1] * s1], o2 = [-n2[0] * s2, -n2[1] * s2], oE = [(o1[0] + o2[0]) / 2, (o1[1] + o2[1]) / 2];
    const seg = (ax: number, ay: number, bx: number, by: number, ra: number, rb: number, o: number[], k: number) => {
      const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
      const Ax = ax + o[0] * ra * k, Ay = ay + o[1] * ra * k, Bx = bx + o[0] * rb * k, By = by + o[1] * rb * k;
      return `M${Ax + nx * ra} ${Ay + ny * ra} L${Bx + nx * rb} ${By + ny * rb} L${Bx - nx * rb} ${By - ny * rb} L${Ax - nx * ra} ${Ay - ny * ra} Z`;
    };
    const circ = (cx: number, cy: number, r: number, o: number[], k: number) => { const X = cx + o[0] * r * k, Y = cy + o[1] * r * k; return `M${X - r} ${Y} A${r} ${r} 0 1 0 ${X + r} ${Y} A${r} ${r} 0 1 0 ${X - r} ${Y} Z`; };
    const shapes = (k: number) => [seg(0, 0, ex, ey, r1, rE, o1, k), seg(ex, ey, wx, wy, rE, r2, o2, k), circ(ex, ey, rE, oE, k), circ(wx, wy, r2, o2, k), circ(0, 0, r1, o1, k)];
    const base = shapes(0);
    const fill = (k: number, c: string, op = 1) => <g opacity={op}>{shapes(k).map((d, i) => <path key={i} d={d} fill={c} />)}</g>;
    const cc = `${id}${uid}${cid}`;
    let lowerEl: React.ReactNode = null;
    if (lower) {
      const gx = ex + d2x * L2 * lower.t0, gy2 = ey + d2y * L2 * lower.t0, rg = rE + (r2 - rE) * lower.t0;
      const ls2 = (k: number, c: string) => <g>{[seg(gx, gy2, wx, wy, rg, r2, o2, k), circ(wx, wy, r2, o2, k)].map((d, i) => <path key={i} d={d} fill={c} />)}</g>;
      lowerEl = (
        <g>
          {ls2(0, lower.light)}{ls2(0.25, lower.col)}{ls2(1.45, lower.shadow)}
          <path d={`M${gx + n2[0] * rg * 1.1} ${gy2 + n2[1] * rg * 1.1} L${gx - n2[0] * rg * 1.1} ${gy2 - n2[1] * rg * 1.1}`} stroke={lower.cuff ?? outline} strokeWidth={lower.cuff ? rg * 0.55 : sw} strokeLinecap="round" />
        </g>
      );
    }
    return (
      <g>
        <defs><clipPath id={cc}>{base.map((d, i) => <path key={i} d={d} />)}</clipPath></defs>
        {base.slice(0, 4).map((d, i) => <path key={i} d={d} fill={outline} stroke={outline} strokeWidth={sw * 2} strokeLinejoin="round" />)}
        <g clipPath={`url(#${cc})`}>
          {fill(0, light)}
          {fill(0.25, col)}
          {fill(1.45, shadowCol, 0.9)}
          {lowerEl}
        </g>
        <g transform={`translate(${wx} ${wy}) rotate(${-a2})`}>{end}</g>
      </g>
    );
  };

  const solid = (m: string) => mats[m];
  const lightOf = (m: string) => mix(mats[m], rim, 0.5);

  const Arm = ({ ang, near }: { ang: [number, number]; near: boolean }) => {
    const [s0, e] = ang;
    const handType = near ? p.handNear : p.handFar;
    const isBat = kind === "batman";
    const sleeve = isBat ? "#2b303c" : solid("top");
    const sleeveL = isBat ? "#454d5e" : mix(solid("top"), rim, 0.35);
    const sleeveS = isBat ? "#1b1f28" : shade(solid("top"), 0.38);
    const glove = isBat ? "#14161d" : kind === "specialist" ? pal.top2 : pal.skin;
    const a2 = s0 + e;
    const [d1x, d1y] = dir(s0); const [d2x, d2y] = dir(a2);
    const L1 = b.ua * S, L2 = b.fa * S;
    const ex = d1x * L1, ey = d1y * L1;
    const r1 = R * 1.08, r2 = R * 0.82;
    const handCol = isBat ? glove : kind === "specialist" ? g("top2") : g("skin");
    const handEnd = (
      <g>
        {hand(handType, handCol, R * 0.86)}
        {near && prop !== "none" && <Prop type={prop} on={propOn} beam={flashBeam} r={R} id={id} />}
        {near && prop !== "none" && prop !== "toolbox" && gripFingers(handCol, R * 0.86)}
      </g>
    );
    const lower = isBat
      ? { t0: 0.42, col: glove, light: "#2a2e3a", shadow: "#08090c" }
      : kind === "father"
      ? { t0: 0.38, col: pal.skin, light: mix(pal.skin, rim, 0.3), shadow: shade(pal.skin, 0.35), cuff: shade(pal.top, 0.15) }
      : undefined;
    // outer (ulnar / back) edge of the forearm = away from the elbow crease
    const vx = -d1x + (d1x * d2x + d1y * d2y) * d2x, vy = -d1y + (d1x * d2x + d1y * d2y) * d2y;
    const n2x = -d2y, n2y = d2x;
    const dotv = vx * n2x + vy * n2y;
    const inner = Math.abs(dotv) > 0.08 ? Math.sign(dotv) : Math.sign(n2x || 1);
    const ox = -inner * n2x, oy = -inner * n2y;
    return (
      <g>
        <Limb cid={near ? "an" : "af"} L1={L1} L2={L2} a1={s0} a2={a2} r1={r1} r2={r2} col={sleeve} light={sleeveL} shadowCol={sleeveS} end={handEnd} lower={lower} />
        {isBat && [0.52, 0.66, 0.8].map((t, i) => {
          const rr = (r1 + r2) / 2 + (r2 - (r1 + r2) / 2) * t;
          const px = ex + d2x * L2 * t + ox * rr * 0.9, py = ey + d2y * L2 * t + oy * rr * 0.9;
          return <path key={i} d={`M${px} ${py} L${px + d2x * 12} ${py + d2y * 12} L${px - d2x * 3 + ox * 15} ${py - d2y * 3 + oy * 15} Z`} fill={glove} stroke={outline} strokeWidth={sw * 0.7} strokeLinejoin="round" />;
        })}
        {near && (kind === "alex" || kind === "mara" || kind === "alexDress") && (() => {
          const cx = d1x * L1 * 0.4, cy = d1y * L1 * 0.4, n1x = -d1y, n1y = d1x, w = r1 * 0.62;
          return (
            <g>
              <path d={`M${cx + n1x * w - d1x * 5} ${cy + n1y * w - d1y * 5} L${cx + d1x * 4} ${cy + d1y * 4} L${cx - n1x * w - d1x * 5} ${cy - n1y * w - d1y * 5}`} stroke={pal.accent} strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d={`M${cx + n1x * w + d1x * 2} ${cy + n1y * w + d1y * 2} L${cx + d1x * 11} ${cy + d1y * 11} L${cx - n1x * w + d1x * 2} ${cy - n1y * w + d1y * 2}`} stroke={pal.accent} strokeWidth={3.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <path d={`M${-n1x * r1 * 0.9} ${-n1y * r1 * 0.9} L${n1x * r1 * 0.9} ${n1y * r1 * 0.9}`} stroke={shade(solid("top"), 0.45)} strokeWidth={6} strokeLinecap="round" opacity={0.9} />
              <circle cx={n1x * r1 * 0.5} cy={n1y * r1 * 0.5} r={1.8} fill={pal.accent} />
            </g>
          );
        })()}
      </g>
    );
  };

  const Leg = ({ ang }: { ang: [number, number] }) => {
    const [h, k] = ang;
    const a2 = h - k;
    const [d1x, d1y] = dir(h); const [d2x, d2y] = dir(a2);
    const kx = d1x * b.thigh, ky = d1y * b.thigh;
    const ax = kx + d2x * b.shin, ay = ky + d2y * b.shin;
    const foot = (
      <g transform={`rotate(${a2})`}>
        <path d={`M${-R * 1.0} ${-R * 0.5} Q${-R * 1.15} ${R * 0.9} ${-R * 0.6} ${R * 1.0} H${R * 2.7} Q${R * 3.0} ${R * 0.2} ${R * 1.2} ${-R * 0.6} Z`} fill={g("shoes")} stroke={outline} strokeWidth={sw} />
        <path d={`M${-R * 0.4} ${R * 0.85} H${R * 2.5}`} stroke={tint(pal.shoes, 0.3)} strokeWidth={1.2} opacity={0.5} />
      </g>
    );
    return (
      <g>
        <Limb cid={`lg${Math.round(h * 10)}`} L1={b.thigh} L2={b.shin} a1={h} a2={a2} r1={R * 1.38} r2={R * 1.02} col={solid("pants")} light={mix(solid("pants"), rim, 0.3)} shadowCol={shade(solid("pants"), 0.38)} end={foot} />
        {(kind === "batman" || kind === "nia") && (
          <path d={`M${kx + d2x * b.shin * 0.55} ${ky + d2y * b.shin * 0.55} L${ax} ${ay - 2}`} stroke={pal.shoes} strokeWidth={R * 2.05} strokeLinecap="round" />
        )}
      </g>
    );
  };

  // torso outline (local: hip at 0, up negative)
  const belly = (b.belly ?? 0) * S;
  const fem = b.female ? 1 : 0;
  const torsoPath = kind === "nia" || kind === "mother"
    ? `M${-hipW * 1.35} 34 L${-shW * 0.95} ${-torsoLen + 18} Q${-shW * 0.8} ${-torsoLen - 4} ${-10} ${-torsoLen} H${12} Q${shW * 0.9} ${-torsoLen - 2} ${shW} ${-torsoLen + 20} L${hipW * 1.45} 34 Z`
    : `M${-wW} 6 C${-wW - 4} ${-40} ${-shW - 4} ${-torsoLen + 50} ${-shW} ${-torsoLen + 16} Q${-shW + 2} ${-torsoLen - 2} ${-12} ${-torsoLen} H${14} Q${shW + 2} ${-torsoLen - 2} ${shW + 2} ${-torsoLen + 18} C${shW + 4 + fem * 6} ${-torsoLen + 60} ${wW + 8 + belly * 2} ${-60 + belly} ${wW + 2} 6 Z`;

  const backView = props.viewAngle === "back";
  const cxF = props.viewAngle === "side" ? shW * 0.62 : shW * 0.4; // front centreline (3/4: +0.20 * torsoW)
  const badgeX = props.viewAngle === "side" ? shW * 0.3 : -shW * 0.1; // left pectoral (-0.05 * torsoW)
  const batX = props.viewAngle === "side" ? shW * 0.45 : shW * 0.3; // emblem on the FRONT sternum
  const Torso = (
    <g transform={`rotate(${p.lean})`}>
      {/* pelvis */}
      <path d={`M${-hipW} -18 Q${-hipW - 2} 18 ${-hipW + 6} 22 H${hipW - 6} Q${hipW + 2} 18 ${hipW} -18 Z`} fill={g("pants")} stroke={outline} strokeWidth={sw} />
      <path d={torsoPath} fill={g("top")} stroke={outline} strokeWidth={sw} />
      {/* uniform details (front chest surface only; hidden in back view). 3/4 view: front centreline at +0.20 torsoW */}
      {!backView && (kind === "alex" || kind === "mara") && (
        <g>
          {kind === "mara" && <path d={`M${-wW - 6} 4 L${-shW - 2} ${-torsoLen + 20} Q${cxF - 22} ${-torsoLen - 2} ${cxF - 8} ${-torsoLen} L${cxF - 3} 0 Z`} fill={pal.top} stroke={outline} strokeWidth={sw * 0.6} />}
          {kind === "mara" && <path d={`M${wW + 4} 4 L${shW + 2} ${-torsoLen + 20} Q${cxF + 16} ${-torsoLen - 2} ${cxF + 10} ${-torsoLen} L${cxF + 6} 0 Z`} fill={pal.top} stroke={outline} strokeWidth={sw * 0.6} />}
          {kind === "mara" && <path d={`M${cxF - 8} ${-torsoLen + 2} L${cxF + 1} ${-torsoLen + 30} L${cxF + 10} ${-torsoLen + 2} Z`} fill={pal.top2} stroke={outline} strokeWidth={sw * 0.6} />}
          <path d={`M${cxF - 9} ${-torsoLen + 2} L${cxF + 1} ${-torsoLen + 24} L${cxF + 11} ${-torsoLen + 2}`} fill={pal.top2} stroke={outline} strokeWidth={sw * 0.8} />
          <path d={`M${cxF - 1} ${-torsoLen + 20} L${cxF + 3} ${-torsoLen + 20} L${cxF + 5} ${-56} L${cxF + 1} ${-48} L${cxF - 3} ${-56} Z`} fill={kind === "mara" ? "#1a2238" : pal.top2} />
          <path d={`M${cxF - 2} ${-torsoLen + 34} V${-26}`} stroke={shade(pal.top, 0.35)} strokeWidth={1.2} opacity={0.6} />
          <path d={`M${badgeX - 8} ${-torsoLen + 40} l8 -4 l8 4 l-1 11 l-7 5 l-7 -5 Z`} fill={pal.accent} stroke={outline} strokeWidth={sw * 0.6} />
          <circle cx={badgeX} cy={-torsoLen + 47} r={2} fill={shade(pal.accent, 0.4)} />
          <rect x={shW * 0.5} y={-torsoLen + 50} width={14} height={4} rx={1} fill={pal.accent} opacity={0.85} />
          {kind === "mara" && <g><path d={`M${-shW * 0.95} ${-torsoLen + 8} L${-shW * 0.3} ${-torsoLen + 2} L${-shW * 0.28} ${-torsoLen + 10} L${-shW * 0.95} ${-torsoLen + 16} Z`} fill="#141a2a" stroke={outline} strokeWidth={sw * 0.5} /><circle cx={-shW * 0.36} cy={-torsoLen + 7} r={2.4} fill={pal.accent} /><path d={`M${shW * 0.7} ${-torsoLen + 2} L${shW * 1.0} ${-torsoLen + 8} L${shW * 0.98} ${-torsoLen + 15} L${shW * 0.68} ${-torsoLen + 10} Z`} fill="#141a2a" stroke={outline} strokeWidth={sw * 0.5} /></g>}
        </g>
      )}
      {!backView && kind === "alexDress" && (
        <g>
          <path d={`M${cxF - 9} ${-torsoLen + 2} L${cxF + 1} ${-torsoLen + 30} L${cxF + 11} ${-torsoLen + 2}`} fill={pal.top2} />
          <path d={`M${cxF - 1} ${-torsoLen + 22} L${cxF + 3} ${-torsoLen + 22} L${cxF + 4} ${-80} L${cxF + 1} ${-74} L${cxF - 2} ${-80} Z`} fill="#0b0b10" />
          {[0, 1, 2, 3].map((i) => <circle key={i} cx={cxF + 6} cy={-torsoLen + 40 + i * 26} r={3} fill={pal.accent} />)}
          <path d={`M${badgeX - 8} ${-torsoLen + 40} l8 -4 l8 4 l-1 11 l-7 5 l-7 -5 Z`} fill={pal.accent} />
          <path d={`M${shW * 0.2} ${-torsoLen + 12} q${shW * 0.4} 10 ${shW * 0.7} 2`} stroke={pal.accent} strokeWidth={3} fill="none" opacity={0.85} />
        </g>
      )}
      {!backView && kind === "batman" && (
        <g>
          <ellipse cx={batX} cy={-torsoLen + 52} rx={19} ry={13} fill={pal.accent} stroke={outline} strokeWidth={sw} />
          <g transform={`translate(${batX - 17} ${-torsoLen + 43.5}) scale(0.17)`}><path d={BAT_EMBLEM} fill="#0a0a0f" /></g>
          <path d={`M${-shW + 10} ${-torsoLen + 72} Q${batX} ${-torsoLen + 84} ${shW - 6} ${-torsoLen + 70}`} stroke={shade(pal.top, 0.35)} strokeWidth={2} fill="none" />
        </g>
      )}
      {kind === "father" && (
        <g>
          <path d={`M-4 ${-torsoLen + 2} L4 ${-torsoLen + 34} L12 ${-torsoLen + 2} Z`} fill={pal.top2} />
          <path d={`M${-wW + 2} 0 L${-wW + 6} ${-torsoLen + 60} H${wW + 4 + belly} L${wW + 6 + belly} 0 Z`} fill={pal.accent} opacity={0.9} stroke={outline} strokeWidth={sw * 0.6} />
          <path d={`M${-wW + 6} ${-torsoLen + 60} L-10 ${-torsoLen + 4} M${wW + 4 + belly} ${-torsoLen + 60} L14 ${-torsoLen + 4}`} stroke={pal.accent} strokeWidth={3} />
          <rect x={-6} y={-70} width={20} height={14} fill="none" stroke={shade(pal.accent, 0.4)} strokeWidth={1.5} />
        </g>
      )}
      {kind === "nia" && (
        <g>
          {[0, 1, 2].map((i) => <circle key={i} cx={6} cy={-torsoLen + 34 + i * 26} r={3} fill={shade(pal.top, 0.45)} />)}
          <path d={`M-14 ${-torsoLen + 4} Q2 ${-torsoLen + 18} 18 ${-torsoLen + 4}`} stroke={shade(pal.top, 0.4)} strokeWidth={3} fill="none" />
        </g>
      )}
      {kind === "mother" && <path d={`M-4 ${-torsoLen + 2} L4 ${-torsoLen + 40} L12 ${-torsoLen + 2} Z`} fill={pal.accent} />}
      {kind === "specialist" && (
        <g>
          <rect x={-shW + 6} y={-torsoLen + 20} width={shW * 2 - 8} height={torsoLen - 40} rx={14} fill={g("top2")} stroke={outline} strokeWidth={sw} />
          {[0, 1, 2].map((i) => <rect key={i} x={-shW + 14} y={-torsoLen + 34 + i * 30} width={shW * 2 - 24} height={4} fill={pal.accent} opacity={0.7} />)}
        </g>
      )}
      {/* belt */}
      {kind !== "nia" && kind !== "mother" && kind !== "father" && (
        <g>
          <rect x={-wW - 4} y={-22} width={wW * 2 + 10} height={13} fill={kind === "batman" ? g("accent") : "#0c0c10"} stroke={outline} strokeWidth={sw * 0.6} />
          {kind === "batman" ? [-16, -2, 12].map((bx) => <rect key={bx} x={bx} y={-22} width={10} height={14} rx={2} fill={shade(pal.accent, 0.25)} />) : <rect x={-2} y={-21} width={12} height={10} fill="#b8b8b8" />}
          {(kind === "alex" || kind === "mara") && <rect x={-wW - 10} y={-18} width={14} height={30} rx={3} fill="#121216" />}
        </g>
      )}
      {shoulderRadio && !backView && (
        <g transform={`translate(${shW * 0.66} ${-torsoLen + 16})`}>
          <rect x={-6} y={0} width={12} height={20} rx={3} fill="#15161a" stroke={outline} strokeWidth={sw * 0.6} />
          <path d={`M0 20 C-10 60 -30 80 -26 ${torsoLen - 40}`} stroke="#15161a" strokeWidth={2.5} fill="none" />
        </g>
      )}
      {/* neck + head */}
      <g transform={`translate(${kind === "nia" ? 2 : shW * 0.22} ${-torsoLen + 2}) rotate(${p.neck})`}>
        {kind === "batman"
          ? <path d={`M-17 10 L-13 -12 H14 L19 10 Z`} fill={g("hat")} stroke={outline} strokeWidth={sw} />
          : <path d={`M-11 6 L-10 -10 H11 L12 6 Z`} fill={g("skin")} stroke={outline} strokeWidth={sw} />}
        {kind !== "batman" && <path d={`M-10 -2 Q1 4 11 -2 L12 6 H-11 Z`} fill="#000" opacity={0.18} />}
        {(kind === "alex" || kind === "mara" || kind === "alexDress") && !backView && (
          <g>
            <path d={`M-13 8 L-12 -6 L2 6 Z`} fill={kind === "alexDress" ? pal.top2 : (kind === "mara" ? pal.top2 : pal.top)} stroke={outline} strokeWidth={sw * 0.7} strokeLinejoin="round" />
            <path d={`M14 8 L13 -6 L2 6 Z`} fill={kind === "alexDress" ? pal.top2 : (kind === "mara" ? pal.top2 : pal.top)} stroke={outline} strokeWidth={sw * 0.7} strokeLinejoin="round" />
          </g>
        )}
        <g transform={`translate(0 -6) rotate(${p.head}) scale(${b.headS * (b.child ? 1.3 : 1.14)})`}>
          <Head uid={uid} kind={kind} p={p} pal={pal} g={g} outline={outline} sw={sw / b.headS} f={f} glowEyes={glowEyes} noHat={noHat} id={id} back={backView} />
        </g>
      </g>
    </g>
  );

  // shoulder positions in torso space -> world (approx through lean rotation)
  const rad = (p.lean * Math.PI) / 180;
  const rot = (px: number, py: number) => [px * Math.cos(rad) - py * Math.sin(rad), px * Math.sin(rad) + py * Math.cos(rad)];
  const [fsx, fsy] = rot(shW * 0.64, -torsoLen + 22);
  const [nsx, nsy] = rot(-shW * 0.56, -torsoLen + 22);
  // two-bone IK toward a world-space palm target (no rubber arms: reach is clamped)
  const ik = (target: [number, number] | undefined, sx: number, sy: number, fallback: [number, number]): [number, number] => {
    if (!target) return fallback;
    const lx = (target[0] - x) / (scale * facing), ly = (target[1] - y) / scale - hipY;
    const dx = lx - sx, dy = ly - sy;
    const L1 = b.ua * S, L2 = b.fa * S + R * 0.75;
    const d = Math.max(Math.abs(L1 - L2) + 1, Math.min(L1 + L2 - 0.01, Math.hypot(dx, dy)));
    const th = Math.atan2(dx, dy) / D;
    const al = Math.acos(Math.min(1, Math.max(-1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)))) / D;
    const be = Math.acos(Math.min(1, Math.max(-1, (L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2)))) / D;
    return [th - al, 180 - be];
  };
  p.armNear = ik(props.reachNear, nsx, nsy, p.armNear);
  p.armFar = ik(props.reachFar, fsx, fsy, p.armFar);
  // anatomical hard clamps: elbow bend 0..140, knee 0..135, neck/head -35..35 (never bends backwards)
  const cl = (v: number, a: number, b2: number) => Math.max(a, Math.min(b2, v));
  p.armNear = [p.armNear[0], cl(p.armNear[1], 0, 140)];
  p.armFar = [p.armFar[0], cl(p.armFar[1], 0, 140)];
  p.legNear = [p.legNear[0], cl(p.legNear[1], 0, 135)];
  p.legFar = [p.legFar[0], cl(p.legFar[1], 0, 135)];
  p.head = cl(p.head, -35, 35);
  p.neck = cl(p.neck, -35, 35);
  const gy = ((props.groundY ?? y) - y) / scale;
  const air = Math.max(0, Math.min(1, (gy - 0) / 400));
  const shOp = (props.shadow ?? 1) * (1 - silhouette * 0.4) * (1 - air * 0.7);

  // cape (batman) behind everything
  const cape = kind === "batman" ? (() => {
    const n = 7;
    const [cx0, cy0] = rot(-shW * 0.95, -torsoLen + 6);
    const [cx1, cy1] = rot(shW * 0.7, -torsoLen + 6);
    const hemY = b.thigh + b.shin - 20;
    const back = -60 - 40 * capeWind;
    let d = `M${cx1} ${cy1} Q${cx0 + 10} ${cy0 - 18} ${cx0} ${cy0}`;
    d += ` C${cx0 - 40 * capeWind} ${cy0 + 120} ${back - 20} ${hemY * 0.5} ${back - 30 - Math.sin(f * 0.12) * 8 * capeWind} ${hemY}`;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const hx = back - 30 + t * (shW * 1.9 + 30 - back) + Math.sin(f * 0.12 - i * 0.35) * 3 * capeWind;
      const hy = hemY + Math.sin(f * 0.12 - i * 0.35) * 5 * capeWind;
      d += ` Q${hx - 12} ${hy - 26} ${hx} ${hy}`;
    }
    d += ` C${shW * 1.3} ${hemY * 0.4} ${cx1 + 20} ${cy1 + 80} ${cx1} ${cy1} Z`;
    return <path d={d} transform={`translate(0 ${hipY})`} fill={g("hat")} stroke={outline} strokeWidth={sw} />;
  })() : null;

  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible", ...props.style }}>
      {defs}
      <g transform={`translate(${x} ${y}) scale(${facing * scale} ${scale})`}>
        <radialGradient id={`${id}-ao`}><stop offset="0" stopColor="#000" stopOpacity="0.85" /><stop offset="0.55" stopColor="#000" stopOpacity="0.45" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
        <ellipse cx={-lightSide * facing * 22} cy={gy + 3} rx={(95 + air * 60) * b.sh} ry={16 + air * 6} fill={`url(#${id}-ao)`} opacity={0.75 * shOp} />
        <ellipse cx={-lightSide * facing * 8} cy={gy + 2} rx={48 * b.sh} ry={6} fill="#000" opacity={0.55 * shOp * (1 - air)} />
        {cape}
        <g transform={`translate(0 ${hipY})`}>
          <g transform={`translate(${fsx} ${fsy})`}><Arm ang={p.armFar} near={false} /></g>
          <g transform={`translate(${-hipW * 0.45} 8)`}><Leg ang={p.legFar} /></g>
          <g transform={`translate(${hipW * 0.45} 8)`}><Leg ang={p.legNear} /></g>
          {Torso}
          {kind === "batman" && !backView && (
            <g transform={`rotate(${p.lean})`}>
              <path d={`M${shW * 0.05} ${-torsoLen - 4} Q${-shW * 0.7} ${-torsoLen - 8} ${-shW - 8} ${-torsoLen + 14} L${-shW - 4} ${-torsoLen + 40} Q${-shW * 0.8} ${-torsoLen + 22} ${-shW * 0.35} ${-torsoLen + 12} Q${-shW * 0.1} ${-torsoLen + 6} ${shW * 0.05} ${-torsoLen - 4} Z`} fill={g("hat")} stroke={outline} strokeWidth={sw} strokeLinejoin="round" />
            </g>
          )}
          {kind === "batman" && backView && (
            <g transform={`rotate(${p.lean})`}>
              <path d={`M${-shW - 10} ${-torsoLen + 4} Q0 ${-torsoLen - 14} ${shW + 10} ${-torsoLen + 4} L${shW + 30} ${b.thigh + b.shin - 30} L${-shW - 30} ${b.thigh + b.shin - 30} Z`} fill={g("hat")} stroke={outline} strokeWidth={sw} />
            </g>
          )}
          <g transform={`translate(${nsx} ${nsy})`}><Arm ang={p.armNear} near /></g>
        </g>
      </g>
    </svg>
  );
};

/* ---------------- head ---------------- */
const Head: React.FC<{ kind: Kind; p: Pose; pal: Pal; g: (m: string) => string; outline: string; sw: number; f: number; glowEyes: number; noHat: boolean; id: string; uid?: string; back?: boolean }> = ({ kind, p, pal, g, outline, sw, glowEyes, noHat, id, uid = "", back = false }) => {
  const fem = kind === "mara" || kind === "mother" || kind === "nia" || kind === "employee";
  const child = kind === "nia";
  const face = child
    ? "M-22 -36 C-24 -56 -10 -64 4 -64 C20 -64 28 -54 27 -40 L29 -30 L25 -27 L25 -19 C24 -8 16 -2 6 -2 C-8 -2 -18 -10 -21 -20 C-24 -26 -23 -30 -22 -36 Z"
    : fem
    ? "M-23 -38 C-25 -56 -11 -66 4 -66 C18 -66 26 -56 26 -44 L27 -36 L31 -27 L26 -24 L26 -18 L24 -14 C23 -7 18 -2 10 -1 L-2 -3 C-12 -7 -18 -13 -20 -19 C-23 -25 -23 -31 -23 -38 Z"
    : "M-24 -38 C-26 -56 -12 -66 4 -66 C18 -66 26 -56 26 -44 L27 -36 L33 -26 L27 -23 L27 -17 L25 -13 C25 -6 20 -1 12 0 L-2 -2 C-12 -6 -18 -12 -20 -18 C-24 -24 -24 -30 -24 -38 Z";
  const blink = Math.max(0, Math.min(1, p.blink));
  const eyeY = child ? -34 : -37;
  const brow = p.brow;
  const smileD = p.smile * 3;
  const isBat = kind === "batman";
  return (
    <g>
      {/* back hair / bun / hood back */}
      {kind === "mara" && <g><ellipse cx={-27} cy={-26} rx={15} ry={13} fill={g("hair")} stroke={outline} strokeWidth={sw} /><path d="M-36 -30 q8 -6 18 0 M-38 -22 q10 -5 20 0" stroke="#5a3424" strokeWidth={2} fill="none" /><path d="M-24 -40 C-30 -34 -30 -28 -26 -22" stroke={g("hair")} strokeWidth={6} fill="none" /></g>}
      {kind === "mother" && <path d="M-26 -50 C-36 -30 -34 -6 -24 6 L-6 -10 L-10 -50 Z" fill={g("hair")} stroke={outline} strokeWidth={sw} />}
      {kind === "employee" && <path d="M-26 -50 C-34 -34 -30 -14 -20 -6 L-4 -14 L-8 -50 Z" fill={g("hair")} stroke={outline} strokeWidth={sw} />}
      {child && <path d="M-34 -40 C-38 -70 -10 -82 8 -80 C30 -78 40 -62 38 -40 C38 -20 34 -4 26 4 L-30 4 C-36 -10 -36 -24 -34 -40 Z" fill={shade(pal.top, 0.12)} stroke={outline} strokeWidth={sw} />}
      <path d={face} fill={g("skin")} stroke={outline} strokeWidth={sw} />
      {child && !back && (
        <g>
          <path d="M-22 -40 C-22 -62 0 -70 14 -66 C26 -62 30 -52 28 -44 C22 -50 14 -50 8 -46 C5 -52 -2 -52 -6 -46 C-10 -42 -14 -38 -22 -30 Z" fill={g("hair")} stroke={outline} strokeWidth={sw * 0.8} />
          <path d="M-24 -30 C-28 -20 -28 -8 -24 0" stroke={g("hair")} strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d="M26 -72 C8 -82 -24 -78 -33 -52 C-39 -30 -35 -6 -27 6" stroke={outline} strokeWidth={12} fill="none" strokeLinecap="round" />
          <path d="M26 -72 C8 -82 -24 -78 -33 -52 C-39 -30 -35 -6 -27 6" stroke={pal.top} strokeWidth={8} fill="none" strokeLinecap="round" />
        </g>
      )}
      {kind === "father" && !back && <path d="M2 -56 q10 -3 20 0 M4 -51 q9 -2 17 0 M10 -28 q5 3 10 1 M6 -18 q-2 6 2 10" stroke={pal.skin === "" ? outline : "#6a4228"} strokeWidth={1.3} fill="none" opacity={0.7} />}
      {/* cel shadow on back half of face */}
      <path d={`M-24 -38 C-24 -30 -22 -22 -18 -16 C-10 -6 -2 -2 6 -1 C-2 -10 -4 -26 2 -44 C-6 -52 -16 -54 -24 -38 Z`} fill="#000" opacity={0.18} />
      {/* ear */}
      {!child && !isBat && <g><ellipse cx={-8} cy={-31} rx={5} ry={8} fill={g("skin")} stroke={outline} strokeWidth={sw * 0.8} /><path d="M-9 -35 q3 4 0 8" stroke={outline} strokeWidth={1} fill="none" opacity={0.5} /></g>}
      {/* hair */}
      {(kind === "alex" || kind === "alexYoung" || kind === "alexDress" || kind === "robber" || kind === "reporter" || kind === "driver" || kind === "specialist") && (
        <path d="M-25 -36 C-30 -60 -10 -72 8 -70 C22 -69 30 -60 27 -48 C20 -54 10 -56 2 -52 C-4 -48 -10 -44 -12 -34 C-16 -30 -20 -28 -25 -36 Z" fill={g("hair")} stroke={outline} strokeWidth={sw} />
      )}
      {kind === "father" && (
        <g>
          <path d="M-25 -34 C-28 -44 -24 -52 -18 -54 C-16 -46 -14 -40 -12 -32 Z" fill={g("hair")} />
          <path d="M-22 -58 C-12 -66 8 -68 18 -60" stroke={pal.hair} strokeWidth={2} fill="none" opacity={0.6} />
          <path d="M20 -22 Q26 -20 30 -22 Q28 -17 22 -17 Q18 -18 20 -22 Z" fill="#9a9a9a" stroke={outline} strokeWidth={sw * 0.6} />
        </g>
      )}
      {(fem && !child) && kind !== "mara" && <path d="M-24 -40 C-28 -62 -6 -72 10 -68 C24 -66 30 -56 26 -46 C16 -52 6 -52 -2 -48 C-10 -44 -14 -40 -16 -32 Z" fill={g("hair")} stroke={outline} strokeWidth={sw} />}
      {kind === "mara" && <path d="M-24 -40 C-28 -60 -8 -70 8 -68 C22 -66 28 -58 26 -48 C16 -52 4 -52 -4 -48 C-10 -44 -14 -40 -16 -32 Z" fill={g("hair")} stroke={outline} strokeWidth={sw} />}
      {kind === "mara" && !back && <path d="M-2 -50 C-6 -40 -4 -30 -1 -22 C1 -30 2 -40 3 -48 Z" fill={g("hair")} stroke={outline} strokeWidth={sw * 0.6} />}
      {/* batman cowl */}
      {isBat && (
        <path d="M-25 2 L-25 -40 C-26 -56 -18 -64 -15 -66 L-12 -88 L-4 -68 L8 -68 L13 -88 L18 -64 C26 -58 28 -48 27 -38 L33 -26 L26 -24 L20 -27 L10 -28 L6 -18 L5 -6 L2 3 Z" fill={g("hat")} stroke={outline} strokeWidth={sw} />
      )}
      {back && <path d={face} fill={isBat ? g("hat") : g("hair")} stroke={outline} strokeWidth={sw} />}
      {/* eyes */}
      {back ? null : isBat ? (
        <g>
          <path d={`M9 ${eyeY - 1} L24 ${eyeY - 4 - brow} L22 ${eyeY + 2} L11 ${eyeY + 2} Z`} fill="#f4f7ff" transform={`scale(1 ${1 - blink * 0.9})`} style={{ transformOrigin: `16px ${eyeY}px` }} />
          {glowEyes > 0 && <ellipse cx={16} cy={eyeY} rx={9} ry={5} fill={`url(#${id}-eyeglow)`} opacity={glowEyes * 0.75} />}
        </g>
      ) : (
        <g>
          <g transform={`translate(15 ${eyeY}) scale(1 ${1 - blink})`}>
            <clipPath id={`${id}${uid}-scl`}><path d="M-7 0 Q0 -5 7 -1 Q0 4 -7 0 Z" /></clipPath>
            <path d="M-7 0 Q0 -5 7 -1 Q0 4 -7 0 Z" fill="#f2ece2" />
            <g clipPath={`url(#${id}${uid}-scl)`}>
              <circle cx={1.5 + p.eyeX * 2.5} cy={p.eyeY * 1.5} r={child ? 2.8 : 2.3} fill="#120c0a" />
              <circle cx={2.4 + p.eyeX * 2.5} cy={-0.8 + p.eyeY * 1.5} r={0.8} fill="#fff" opacity={0.8} />
            </g>
          </g>
          {blink > 0.5 && <path d={`M8 ${eyeY} Q15 ${eyeY + 2} 22 ${eyeY - 1}`} stroke={outline} strokeWidth={1.5} fill="none" />}
          <path d={`M7 ${eyeY - 6 - brow * 2} L23 ${eyeY - 7 + brow * 1.2}`} stroke={kind === "father" ? "#8a8a8a" : outline} strokeWidth={fem ? 2 : 3.2} strokeLinecap="round" />
          <path d={`M${7} ${eyeY - 1} Q15 ${eyeY - 6} 23 ${eyeY - 2}`} stroke={outline} strokeWidth={1.4} fill="none" />
          {fem && blink < 0.5 && <path d={`M21 ${eyeY - 2} l4 -2.5 M22.5 ${eyeY - 0.5} l4 -1.2`} stroke={outline} strokeWidth={1.2} strokeLinecap="round" />}
        </g>
      )}
      {kind === "father" && (
        <g fill="none" stroke="#2a2a2a" strokeWidth={1.6}>
          <circle cx={15} cy={eyeY} r={8} />
          <path d={`M23 ${eyeY} L28 ${eyeY - 1} M7 ${eyeY} L-6 ${eyeY - 4}`} />
        </g>
      )}
      {/* nose line + mouth */}
      {!back && !child && <path d="M27 -34 L31 -27 L27 -25" stroke={outline} strokeWidth={1.2} fill="none" opacity={0.6} />}
      {!back && <path d={child ? `M15 ${-15 - smileD} Q19 ${-13 + smileD} 23 ${-15 - smileD}` : `M17 ${-16 - smileD} Q21 ${-15 + smileD} 25 ${-16 - smileD * 0.6}`} stroke={fem ? "#5a2020" : outline} strokeWidth={fem ? 2.2 : 1.8} fill={p.mouth > 0.05 ? "#2a0d0d" : "none"} strokeLinecap="round" />}
      {!back && p.mouth > 0.05 && <ellipse cx={21} cy={-14} rx={4} ry={p.mouth * 4} fill="#2a0d0d" />}
      {/* hats */}
      {!noHat && (kind === "alex" || kind === "mara" || kind === "alexDress") && (
        <g>
          <path d="M-27 -46 C-30 -64 -12 -78 8 -78 C28 -78 36 -66 33 -50 Z" fill={g("hat")} stroke={outline} strokeWidth={sw} />
          <rect x={-26} y={-54} width={58} height={9} fill={shade(pal.hat ?? "#223", 0.4)} stroke={outline} strokeWidth={sw * 0.6} />
          <path d="M20 -46 L46 -41 Q40 -36 18 -40 Z" fill="#07080c" stroke={outline} strokeWidth={sw * 0.6} />
          <path d="M14 -66 l4 -3 l4 3 l-1 6 l-3 2 l-3 -2 Z" fill={pal.accent} />
        </g>
      )}
      {kind === "driver" && (
        <g>
          <path d="M-26 -48 C-26 -64 -10 -72 8 -72 C24 -72 32 -62 30 -50 Z" fill={g("hat")} stroke={outline} strokeWidth={sw} />
          <path d="M22 -50 L42 -46 Q36 -42 20 -44 Z" fill="#07080c" />
        </g>
      )}
      {kind === "specialist" && (
        <g>
          <path d="M-30 -30 C-34 -70 -10 -84 8 -84 C30 -84 42 -66 38 -30 L32 -10 L-28 -10 Z" fill={g("top2")} stroke={outline} strokeWidth={sw} />
          <path d="M6 -56 H34 C38 -44 38 -30 34 -20 H6 Z" fill="#7aa0c8" opacity={0.55} stroke={outline} strokeWidth={sw} />
          <path d="M10 -52 L18 -52 L12 -30 L8 -30 Z" fill="#fff" opacity={0.25} />
        </g>
      )}
      {kind === "reporter" && !noHat && (
        <g>
          <path d="M-24 -50 C-24 -66 -8 -74 8 -74 C24 -74 30 -64 28 -52 Z" fill={g("hat")} stroke={outline} strokeWidth={sw} />
          <path d="M-36 -50 Q4 -58 42 -50 Q4 -44 -36 -50 Z" fill={g("hat")} stroke={outline} strokeWidth={sw} />
        </g>
      )}
    </g>
  );
};

/* ---------------- props held in near hand ---------------- */
const Prop: React.FC<{ type: string; on: number; beam: number; r: number; id: string }> = ({ type, on, beam, r, id }) => {
  const fr = useCurrentFrame();
  const o = "#06070b";
  if (type === "radio")
    return (
      <g transform={`translate(${-r * 0.4} ${r * 0.2})`}>
        <rect x={-7} y={-6} width={16} height={34} rx={3} fill="#1a1b20" stroke={o} strokeWidth={1.5} />
        <rect x={4} y={-22} width={3} height={18} fill="#1a1b20" />
        <rect x={-4} y={2} width={10} height={8} fill="#2c3a2c" />
        <circle cx={1} cy={-2} r={1.6} fill={on > 0 ? "#3aff6a" : "#1a3a1a"} />
      </g>
    );
  if (type === "flashlight") {
    // volumetric beam: soft radial-gradient cone (screen blend + CSS blur), flicker, drifting dust motes
    const fl = 0.86 + 0.14 * Math.abs(Math.sin(fr * 0.9) * Math.sin(fr * 0.37 + 1));
    const B = beam * fl;
    return (
      <g transform={`translate(0 ${r * 1.0}) rotate(90)`}>
        {/* PREVENTION: lens (+x) points AWAY from the wrist along the fingers = forward (gaze direction); handle sits in the fist; never toward the elbow */}
        <defs>
          <radialGradient id={`${id}-beamR`} cx="0" cy="0.5" r="1" fx="0" fy="0.5"><stop offset="0" stopColor="#fff6da" stopOpacity="0.85" /><stop offset="0.35" stopColor="#ffe9b0" stopOpacity="0.35" /><stop offset="1" stopColor="#ffe2a0" stopOpacity="0" /></radialGradient>
          <radialGradient id={`${id}-hot`}><stop offset="0" stopColor="#fffbe8" stopOpacity="1" /><stop offset="1" stopColor="#fff2c8" stopOpacity="0" /></radialGradient>
        </defs>
        {B > 0 && (
          <g style={{ mixBlendMode: "screen" }}>
            <path d="M16 -7 L560 -150 L560 150 L16 7 Z" fill={`url(#${id}-beamR)`} opacity={B * 0.55} style={{ filter: "blur(6px)" }} />
            <path d="M16 -5 L560 -78 L560 78 L16 5 Z" fill={`url(#${id}-beamR)`} opacity={B * 0.7} style={{ filter: "blur(2px)" }} />
            {Array.from({ length: 14 }).map((_, i) => {
              const u = ((i * 0.137 + fr * (0.004 + (i % 5) * 0.0013)) % 1 + 1) % 1, d = 40 + u * 480;
              const v = Math.sin(i * 12.9898) * 0.8 + Math.sin(fr * 0.05 + i) * 0.15;
              return <circle key={i} cx={d} cy={v * d * 0.22} r={1 + (i % 3) * 0.6} fill="#fff8e0" opacity={B * 0.5 * Math.sin(u * Math.PI)} />;
            })}
          </g>
        )}
        <rect x={-26} y={-5} width={34} height={10} rx={2} fill="#6b6f78" stroke={o} strokeWidth={1.4} />
        <path d="M8 -8 H18 V8 H8 Z" fill="#8a8f99" stroke={o} strokeWidth={1.4} />
        <rect x={-12} y={-7} width={6} height={3} fill="#2a2a2a" />
        <path d="M-20 -3 L-8 -2" stroke="#b0b4bb" strokeWidth={1} opacity={0.5} />
        <path d="M-2 2 l4 1" stroke="#3a3a3a" strokeWidth={1} />
        <ellipse cx={18} cy={0} rx={2.5} ry={7} fill={on > 0 ? "#fff6d0" : "#55575c"} opacity={0.5 + on * 0.5} />
        {on > 0 && <circle cx={20} cy={0} r={18} fill={`url(#${id}-hot)`} opacity={0.8 * on * fl} />}
      </g>
    );
  }
  if (type === "key") return <g transform={`translate(2 ${r * 1.1}) rotate(20)`}><circle r={8} fill="none" stroke="#d9b24a" strokeWidth={4} /><circle r={8} fill="none" stroke="#5a4010" strokeWidth={1} /><rect x={7} y={-2.5} width={26} height={5} rx={1.5} fill="#d9b24a" stroke="#5a4010" strokeWidth={1} /><path d="M26 2.5 v6 h3 v-4 h3 v4 h2 v-6" fill="#d9b24a" stroke="#5a4010" strokeWidth={1} /></g>;
  if (type === "phone") return <g transform={`translate(-2 ${r * 0.6})`}><rect x={-6} y={-4} width={12} height={22} rx={2} fill="#151518" stroke={o} /><rect x={-4} y={-1} width={8} height={12} fill={on > 0 ? "#9fd0ff" : "#222"} opacity={0.8} /></g>;
  if (type === "bottle") return <g transform={`translate(0 ${r * 0.4})`}><rect x={-6} y={-12} width={12} height={30} rx={4} fill="#9fc8e8" opacity={0.7} stroke={o} /><rect x={-3} y={-18} width={6} height={7} fill="#2a5aa0" /></g>;
  if (type === "toolbox") return <g transform={`translate(0 ${r * 1.4})`}><rect x={-26} y={0} width={52} height={26} rx={3} fill="#8a1f1a" stroke={o} strokeWidth={1.5} /><path d="M-10 0 V-8 H10 V0" stroke="#222" strokeWidth={3} fill="none" /></g>;
  return null;
};

/* ---------------- pose helpers ---------------- */
export const breathe = (f: number, rate = 0.45, amt = 1.2) => Math.sin((f * 2 * Math.PI * rate) / 24) * amt;
export const blinkAt = (f: number, every = 70, offset = 0) => {
  const t = (f + offset) % every;
  return t < 2 ? 1 : t < 3 ? 0.5 : 0;
};
/** walk cycle pose fragment, phase in [0,1) */
export const walk = (phase: number, amt = 1): Partial<Pose> => {
  const s = Math.sin(phase * Math.PI * 2);
  const c = Math.cos(phase * Math.PI * 2);
  return {
    legNear: [s * 24 * amt, Math.max(0, -c) * 30 * amt + 4],
    legFar: [-s * 24 * amt, Math.max(0, c) * 30 * amt + 4],
    armNear: [-s * 18 * amt, 16],
    armFar: [s * 18 * amt, 16],
    bob: -Math.abs(c) * 6 * amt,
  };
};

/** walk pose from distance travelled (world px) so feet plant instead of sliding.
 *  One full cycle = two steps = 4 * legLength * sin(swing) * scale. */
export const strideOf = (kind: Kind, scale: number, amt = 1) => 4 * (BUILD[kind].thigh + BUILD[kind].shin) * Math.sin((24 * amt * Math.PI) / 180) * scale;
export const walkDist = (dist: number, kind: Kind, scale: number, amt = 1): Partial<Pose> => walk(((Math.abs(dist) / strideOf(kind, scale, amt)) % 1 + 1) % 1, amt);

/** world-space anchor points (lean 0) — for hand contacts: shoulder radio, near/far shoulder, chest, hand-off height */
export const anchor = (kind: Kind, x: number, y: number, scale = 1, facing: 1 | -1 = 1, part: "radio" | "shoulderNear" | "shoulderFar" | "chest" | "waist" | "badge" = "radio"): [number, number] => {
  const b = BUILD[kind];
  const S = b.H / 400;
  const hipY = -(b.thigh + b.shin);
  const torsoLen = 150 * S;
  const shW = 46 * b.sh;
  const lp: Record<string, [number, number]> = {
    radio: [shW * 0.66, hipY - torsoLen + 26],
    shoulderNear: [-shW * 0.56, hipY - torsoLen + 22],
    shoulderFar: [shW * 0.64, hipY - torsoLen + 22],
    chest: [shW * 0.2, hipY - torsoLen * 0.6],
    waist: [0, hipY - torsoLen * 0.1],
    badge: [-shW * 0.1, hipY - torsoLen + 47],
  };
  const [lx, ly] = lp[part];
  return [x + lx * scale * facing, y + ly * scale];
};
