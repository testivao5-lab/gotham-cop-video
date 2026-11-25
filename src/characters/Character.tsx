import React from "react";
import { useCurrentFrame } from "remotion";
import { mix, shade, tint } from "../lib/anim";

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
  alex: { skin: "#c48a62", hair: "#17110e", top: "#8f98aa", top2: "#1c2433", pants: "#25407c", shoes: "#0a0a0e", hat: "#22397a", accent: "#d9b24a" },
  alexYoung: { skin: "#c48a62", hair: "#17110e", top: "#7a2e2a", top2: "#e0d6c0", pants: "#2e3a56", shoes: "#3a2a20", accent: "#e0d6c0" },
  alexDress: { skin: "#c48a62", hair: "#17110e", top: "#1d2b52", top2: "#c9cfd9", pants: "#1d2b52", shoes: "#060608", hat: "#1d2b52", accent: "#d9b24a" },
  mara: { skin: "#8a5a3c", hair: "#1d1512", top: "#8f98aa", top2: "#1a2440", pants: "#25407c", shoes: "#0a0a0e", hat: "#22397a", accent: "#d9b24a" },
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
  mara: { H: 384, sh: 0.9, waist: 0.95, hipW: 1.05, thigh: 96, shin: 94, ua: 74, fa: 68, limb: 0.92, headS: 0.96, female: true },
  batman: { H: 440, sh: 1.32, waist: 1.05, hipW: 1.05, thigh: 108, shin: 106, ua: 84, fa: 78, limb: 1.25, headS: 1.0 },
  father: { H: 380, sh: 1.02, waist: 1.25, hipW: 1.12, thigh: 94, shin: 92, ua: 74, fa: 68, limb: 1.05, headS: 1.02, belly: 14 },
  nia: { H: 230, sh: 0.62, waist: 0.75, hipW: 0.7, thigh: 52, shin: 50, ua: 44, fa: 40, limb: 0.62, headS: 0.85, child: true, female: true },
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
  shoulderRadio?: boolean; capeWind?: number; hood?: boolean; glowEyes?: number; noHat?: boolean; style?: React.CSSProperties;
};

export const Character: React.FC<CharProps> = (props) => {
  const f = useCurrentFrame();
  const { kind, x, y, scale = 1, facing = 1, id, lightSide = 1, silhouette = 0, rim = "#9fc0ff", nightTint = 0.28,
    prop = "none", propOn = 0, flashBeam = 0, shoulderRadio = false, capeWind = 1, glowEyes = 0, noHat = false } = props;
  const p: Pose = { ...NEUTRAL, ...props.pose };
  const b = BUILD[kind];
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
  const hand = (type: string, col: string, r: number) => {
    if (type === "fist" || type === "grip") return <ellipse cx={0} cy={r * 0.9} rx={r * 1.05} ry={r * 1.15} fill={col} stroke={outline} strokeWidth={sw} />;
    if (type === "point") return <g><ellipse cx={0} cy={r * 0.8} rx={r} ry={r * 1.1} fill={col} stroke={outline} strokeWidth={sw} /><rect x={-r * 0.25} y={r * 1.4} width={r * 0.5} height={r * 1.6} rx={r * 0.25} fill={col} stroke={outline} strokeWidth={sw} /></g>;
    return <path d={`M${-r} 0 Q${-r * 1.2} ${r * 1.6} ${-r * 0.2} ${r * 2.3} Q${r * 0.9} ${r * 2.2} ${r * 1.05} ${r * 0.9} Q${r * 1.3} ${r * 0.4} ${r} 0 Z`} fill={col} stroke={outline} strokeWidth={sw} />;
  };

  const gloveCol = kind === "batman" ? g("shoes") : kind === "specialist" ? g("top2") : g("skin");
  const sleeveCol = kind === "nia" ? g("top") : kind === "batman" ? g("top") : kind === "father" ? g("top") : g("top");

  const Arm = ({ ang, near }: { ang: [number, number]; near: boolean }) => {
    const [s, e] = ang;
    const handType = near ? p.handNear : p.handFar;
    return (
      <g transform={`rotate(${-s})`}>
        <path d={cap(b.ua * S, R * 1.05, R * 0.9)} fill={sleeveCol} stroke={outline} strokeWidth={sw} />
        {kind === "alex" || kind === "mara" ? <path d={`M${-R * 0.7} ${R * 1.6} h${R * 1.4} v${R * 1.2} h${-R * 1.4} Z`} fill={pal.accent} opacity={near ? 0.85 : 0.4} /> : null}
        <g transform={`translate(0 ${b.ua * S}) rotate(${-e})`}>
          <path d={cap(b.fa * S, R * 0.9, R * 0.72)} fill={sleeveCol} stroke={outline} strokeWidth={sw} />
          {kind === "batman" && <path d={`M${R * 0.7} ${b.fa * S * 0.35} l${R * 0.9} ${R * 0.3} l${-R * 0.8} ${R * 0.6} l${R * 0.9} ${R * 0.3} l${-R * 0.9} ${R * 0.6} Z`} fill={pal.shoes} />}
          {kind === "batman" && <path d={cap(b.fa * S * 0.55, R * 0.86, R * 0.74)} transform={`translate(0 ${b.fa * S * 0.45})`} fill={g("shoes")} />}
          <g transform={`translate(0 ${b.fa * S})`}>
            {hand(handType, gloveCol, R * 0.82)}
            {near && prop !== "none" && <Prop type={prop} on={propOn} beam={flashBeam} r={R} id={id} />}
          </g>
        </g>
      </g>
    );
  };

  const Leg = ({ ang }: { ang: [number, number] }) => {
    const [h, k] = ang;
    const legCol = kind === "nia" ? g("pants") : g("pants");
    return (
      <g transform={`rotate(${-h})`}>
        <path d={cap(b.thigh, R * 1.35, R * 1.05)} fill={legCol} stroke={outline} strokeWidth={sw} />
        <g transform={`translate(0 ${b.thigh}) rotate(${k})`}>
          <path d={cap(b.shin, R * 1.05, R * 0.85)} fill={legCol} stroke={outline} strokeWidth={sw} />
          {(kind === "batman" || kind === "nia") && <path d={cap(b.shin * 0.42, R * 1.0, R * 0.9)} transform={`translate(0 ${b.shin * 0.58})`} fill={g("shoes")} stroke={outline} strokeWidth={sw} />}
          <g transform={`translate(0 ${b.shin}) rotate(${h - k})`}>
            <path d={`M${-R * 1.0} ${-R * 0.4} Q${-R * 1.1} ${R * 0.9} ${-R * 0.6} ${R * 1.0} H${R * 2.6} Q${R * 2.9} ${R * 0.2} ${R * 1.2} ${-R * 0.5} Z`} fill={g("shoes")} stroke={outline} strokeWidth={sw} />
          </g>
        </g>
      </g>
    );
  };

  // torso outline (local: hip at 0, up negative)
  const belly = (b.belly ?? 0) * S;
  const fem = b.female ? 1 : 0;
  const torsoPath = kind === "nia" || kind === "mother"
    ? `M${-hipW * 1.35} 34 L${-shW * 0.95} ${-torsoLen + 18} Q${-shW * 0.8} ${-torsoLen - 4} ${-10} ${-torsoLen} H${12} Q${shW * 0.9} ${-torsoLen - 2} ${shW} ${-torsoLen + 20} L${hipW * 1.45} 34 Z`
    : `M${-wW} 6 C${-wW - 4} ${-40} ${-shW - 4} ${-torsoLen + 50} ${-shW} ${-torsoLen + 16} Q${-shW + 2} ${-torsoLen - 2} ${-12} ${-torsoLen} H${14} Q${shW + 2} ${-torsoLen - 2} ${shW + 2} ${-torsoLen + 18} C${shW + 4 + fem * 6} ${-torsoLen + 60} ${wW + 8 + belly * 2} ${-60 + belly} ${wW + 2} 6 Z`;

  const Torso = (
    <g transform={`rotate(${p.lean})`}>
      {/* pelvis */}
      <path d={`M${-hipW} -18 Q${-hipW - 2} 18 ${-hipW + 6} 22 H${hipW - 6} Q${hipW + 2} 18 ${hipW} -18 Z`} fill={g("pants")} stroke={outline} strokeWidth={sw} />
      <path d={torsoPath} fill={g("top")} stroke={outline} strokeWidth={sw} />
      {/* uniform details */}
      {(kind === "alex" || kind === "mara") && (
        <g>
          <path d={`M-6 ${-torsoLen + 2} L4 ${-torsoLen + 26} L14 ${-torsoLen + 2}`} fill={pal.top2} stroke={outline} strokeWidth={sw * 0.8} />
          <path d={`M2 ${-torsoLen + 22} L6 ${-torsoLen + 22} L8 ${-56} L4 ${-48} L0 ${-56} Z`} fill={pal.top2} />
          <path d={`M${shW * 0.35} ${-torsoLen + 40} l8 -4 l8 4 l-1 11 l-7 5 l-7 -5 Z`} fill={pal.accent} stroke={outline} strokeWidth={sw * 0.6} />
          <circle cx={shW * 0.35 + 8} cy={-torsoLen + 47} r={2} fill={shade(pal.accent, 0.4)} />
          <rect x={-shW * 0.55} y={-torsoLen + 46} width={18} height={12} fill="none" stroke={shade(pal.top, 0.4)} strokeWidth={1.5} />
          {kind === "mara" && <path d={`M${-wW - 6} 4 L${-shW - 2} ${-torsoLen + 20} Q-12 ${-torsoLen - 2} -6 ${-torsoLen} L-2 0 Z`} fill={pal.top2} opacity={0.85} />}
          {kind === "mara" && <path d={`M${wW + 4} 4 L${shW + 2} ${-torsoLen + 20} Q14 ${-torsoLen - 2} 14 ${-torsoLen} L10 0 Z`} fill={pal.top2} opacity={0.85} />}
        </g>
      )}
      {kind === "alexDress" && (
        <g>
          <path d={`M-6 ${-torsoLen + 2} L4 ${-torsoLen + 30} L14 ${-torsoLen + 2}`} fill={pal.top2} />
          <path d={`M2 ${-torsoLen + 22} L6 ${-torsoLen + 22} L7 ${-80} L4 ${-74} L1 ${-80} Z`} fill="#0b0b10" />
          {[0, 1, 2, 3].map((i) => <circle key={i} cx={10} cy={-torsoLen + 40 + i * 26} r={3} fill={pal.accent} />)}
          <path d={`M${shW * 0.4} ${-torsoLen + 40} l8 -4 l8 4 l-1 11 l-7 5 l-7 -5 Z`} fill={pal.accent} />
          <path d={`M${-shW + 6} ${-torsoLen + 14} h${shW * 0.7} v6 h${-shW * 0.7} Z`} fill={pal.accent} opacity={0.8} />
        </g>
      )}
      {kind === "batman" && (
        <g>
          <ellipse cx={8} cy={-torsoLen + 52} rx={22} ry={13} fill={pal.accent} stroke={outline} strokeWidth={sw} />
          <g transform={`translate(${8 - 18} ${-torsoLen + 44}) scale(0.18)`}><path d="M0,50 C20,40 30,20 25,5 C45,20 55,30 70,28 L80,10 L88,25 L100,22 L112,25 L120,10 L130,28 C145,30 155,20 175,5 C170,20 180,40 200,50 C180,52 165,62 160,78 C150,66 135,64 125,72 C115,78 105,85 100,95 C95,85 85,78 75,72 C65,64 50,66 40,78 C35,62 20,52 0,50 Z" fill="#0a0a0f" /></g>
          <path d={`M${-shW + 8} ${-torsoLen + 70} Q0 ${-torsoLen + 84} ${shW - 6} ${-torsoLen + 70}`} stroke={shade(pal.top, 0.35)} strokeWidth={2} fill="none" />
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
      {shoulderRadio && (
        <g transform={`translate(${shW * 0.55} ${-torsoLen + 24})`}>
          <rect x={-6} y={0} width={12} height={20} rx={3} fill="#15161a" stroke={outline} strokeWidth={sw * 0.6} />
          <path d={`M0 20 C-10 60 -30 80 -26 ${torsoLen - 40}`} stroke="#15161a" strokeWidth={2.5} fill="none" />
        </g>
      )}
      {/* neck + head */}
      <g transform={`translate(2 ${-torsoLen + 2}) rotate(${p.neck})`}>
        <path d={`M-9 6 L-8 -10 H10 L11 6 Z`} fill={kind === "batman" ? g("shoes") : g("skin")} stroke={outline} strokeWidth={sw} />
        <g transform={`translate(0 -6) rotate(${p.head}) scale(${b.headS * (b.child ? 1.3 : 1)})`}>
          <Head kind={kind} p={p} pal={pal} g={g} outline={outline} sw={sw / b.headS} f={f} glowEyes={glowEyes} noHat={noHat} id={id} />
        </g>
      </g>
    </g>
  );

  // shoulder positions in torso space -> world (approx through lean rotation)
  const rad = (p.lean * Math.PI) / 180;
  const rot = (px: number, py: number) => [px * Math.cos(rad) - py * Math.sin(rad), px * Math.sin(rad) + py * Math.cos(rad)];
  const [fsx, fsy] = rot(-shW * 0.55, -torsoLen + 22);
  const [nsx, nsy] = rot(shW * 0.6, -torsoLen + 22);

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
        <ellipse cx={0} cy={2} rx={70 * b.sh} ry={10} fill="#000" opacity={0.45 * (1 - silhouette * 0.5)} />
        {cape}
        <g transform={`translate(0 ${hipY})`}>
          <g transform={`translate(${fsx} ${fsy})`}><Arm ang={p.armFar} near={false} /></g>
          <g transform={`translate(${-hipW * 0.45} 8)`}><Leg ang={p.legFar} /></g>
          <g transform={`translate(${hipW * 0.45} 8)`}><Leg ang={p.legNear} /></g>
          {Torso}
          <g transform={`translate(${nsx} ${nsy})`}><Arm ang={p.armNear} near /></g>
        </g>
      </g>
    </svg>
  );
};

/* ---------------- head ---------------- */
const Head: React.FC<{ kind: Kind; p: Pose; pal: Pal; g: (m: string) => string; outline: string; sw: number; f: number; glowEyes: number; noHat: boolean; id: string }> = ({ kind, p, pal, g, outline, sw, glowEyes, noHat, id }) => {
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
      {kind === "mara" && <g><ellipse cx={-24} cy={-30} rx={10} ry={9} fill={g("hair")} stroke={outline} strokeWidth={sw} /><path d="M-26 -34 q-4 6 0 10" stroke="#8a8a8a" strokeWidth={1.5} fill="none" /></g>}
      {kind === "mother" && <path d="M-26 -50 C-36 -30 -34 -6 -24 6 L-6 -10 L-10 -50 Z" fill={g("hair")} stroke={outline} strokeWidth={sw} />}
      {kind === "employee" && <path d="M-26 -50 C-34 -34 -30 -14 -20 -6 L-4 -14 L-8 -50 Z" fill={g("hair")} stroke={outline} strokeWidth={sw} />}
      {child && <path d="M-34 -40 C-38 -70 -10 -82 8 -80 C30 -78 40 -62 38 -40 C38 -20 34 -4 26 4 L-30 4 C-36 -10 -36 -24 -34 -40 Z" fill={g("top")} stroke={outline} strokeWidth={sw} />}
      <path d={face} fill={g("skin")} stroke={outline} strokeWidth={sw} />
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
      {/* batman cowl */}
      {isBat && (
        <path d="M-25 -8 L-25 -40 C-26 -56 -18 -64 -15 -66 L-12 -88 L-4 -68 L8 -68 L13 -88 L18 -64 C26 -58 28 -48 27 -38 L33 -26 L26 -24 L20 -27 L10 -29 L0 -22 L-6 -8 Z" fill={g("hat")} stroke={outline} strokeWidth={sw} />
      )}
      {/* eyes */}
      {isBat ? (
        <g>
          <path d={`M9 ${eyeY - 1} L24 ${eyeY - 4 - brow} L22 ${eyeY + 2} L11 ${eyeY + 2} Z`} fill="#f4f7ff" transform={`scale(1 ${1 - blink * 0.9})`} style={{ transformOrigin: `16px ${eyeY}px` }} />
          {glowEyes > 0 && <circle cx={16} cy={eyeY} r={14} fill={`url(#${id}-eyeglow)`} opacity={glowEyes} />}
        </g>
      ) : (
        <g>
          <g transform={`translate(15 ${eyeY}) scale(1 ${1 - blink})`}>
            <path d="M-7 0 Q0 -5 7 -1 Q0 4 -7 0 Z" fill="#f2ece2" />
            <circle cx={1.5 + p.eyeX * 2.5} cy={p.eyeY * 1.5} r={child ? 2.8 : 2.3} fill="#120c0a" />
            <circle cx={2.4 + p.eyeX * 2.5} cy={-0.8 + p.eyeY * 1.5} r={0.8} fill="#fff" opacity={0.8} />
          </g>
          {blink > 0.5 && <path d={`M8 ${eyeY} Q15 ${eyeY + 2} 22 ${eyeY - 1}`} stroke={outline} strokeWidth={1.5} fill="none" />}
          <path d={`M7 ${eyeY - 6 - brow * 2} L23 ${eyeY - 7 + brow * 1.2}`} stroke={kind === "father" ? "#8a8a8a" : outline} strokeWidth={fem ? 2 : 3.2} strokeLinecap="round" />
          <path d={`M${7} ${eyeY - 1} Q15 ${eyeY - 6} 23 ${eyeY - 2}`} stroke={outline} strokeWidth={1.4} fill="none" />
        </g>
      )}
      {kind === "father" && (
        <g fill="none" stroke="#2a2a2a" strokeWidth={1.6}>
          <circle cx={15} cy={eyeY} r={8} />
          <path d={`M23 ${eyeY} L28 ${eyeY - 1} M7 ${eyeY} L-6 ${eyeY - 4}`} />
        </g>
      )}
      {/* nose line + mouth */}
      {!child && <path d="M27 -34 L31 -27 L27 -25" stroke={outline} strokeWidth={1.2} fill="none" opacity={0.6} />}
      <path d={child ? `M15 ${-15 - smileD} Q19 ${-13 + smileD} 23 ${-15 - smileD}` : `M17 ${-16 - smileD} Q21 ${-15 + smileD} 25 ${-16 - smileD * 0.6}`} stroke={fem ? "#5a2020" : outline} strokeWidth={fem ? 2.2 : 1.8} fill={p.mouth > 0.05 ? "#2a0d0d" : "none"} strokeLinecap="round" />
      {p.mouth > 0.05 && <ellipse cx={21} cy={-14} rx={4} ry={p.mouth * 4} fill="#2a0d0d" />}
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
  if (type === "flashlight")
    return (
      <g transform={`translate(0 ${r * 1.0}) rotate(-90)`}>
        {beam > 0 && <path d={`M10 -6 L520 -120 L520 120 L10 6 Z`} fill={`url(#${id}-beamH)`} opacity={beam} style={{ mixBlendMode: "screen" }} />}
        <defs>
          <linearGradient id={`${id}-beamH`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff2c8" stopOpacity="0.7" />
            <stop offset="1" stopColor="#fff2c8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x={-26} y={-5} width={34} height={10} rx={2} fill="#6b6f78" stroke={o} strokeWidth={1.4} />
        <path d="M8 -8 H18 V8 H8 Z" fill="#8a8f99" stroke={o} strokeWidth={1.4} />
        <rect x={-12} y={-7} width={6} height={3} fill="#2a2a2a" />
        <path d="M-20 -3 L-8 -2" stroke="#b0b4bb" strokeWidth={1} opacity={0.5} />
        <path d="M-2 2 l4 1" stroke="#3a3a3a" strokeWidth={1} />
        <ellipse cx={18} cy={0} rx={2.5} ry={7} fill={on > 0 ? "#fff6d0" : "#55575c"} opacity={0.5 + on * 0.5} />
        {on > 0 && <circle cx={20} cy={0} r={18} fill="#fff2c8" opacity={0.35 * on} />}
      </g>
    );
  if (type === "key") return <g transform={`translate(4 ${r * 1.2})`}><circle r={5} fill="none" stroke="#c9a640" strokeWidth={2.5} /><rect x={4} y={-1.5} width={14} height={3} fill="#c9a640" /></g>;
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
