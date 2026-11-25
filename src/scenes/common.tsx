import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Sky, DecoSkyline, SkyVariant } from "../world/sky";
import { StreetFacades, WetStreet, StreetLamp, SchoolBus } from "../world/street";
import { Rain, Splashes, Fog, LightCone, Glow } from "../fx/fx";
import { Plane } from "../lib/Camera";
import { ci } from "../lib/anim";

/** Night bus street used by scenes 1–4 and the climax. */
export const BusStreetSet: React.FC<{
  flash?: number; fog?: number; wire?: boolean; led?: boolean; busX?: number; busY?: number; busScale?: number;
  nia?: boolean; niaPound?: number; sky?: SkyVariant; rain?: number; lamp?: number; blackout?: number;
}> = ({ flash = 0, fog = 0.3, wire = false, led = false, busX = 860, busY = 470, busScale = 0.95, nia = true, niaPound = 0, sky = "storm", rain = 1, lamp = 1, blackout = 0 }) => {
  const f = useCurrentFrame();
  const niaY = 60 - Math.abs(Math.sin(niaPound * f * 0.5)) * 6;
  return (
    <>
      <Plane p={0.2}><Sky variant={sky} moon={sky === "storm" ? undefined : [1500, 180, 46]} flash={flash} seed={3} horizonY={700} /></Plane>
      <Plane p={0.3}><DecoSkyline seed={7} baseY={640} hMin={260} hMax={520} haze={0.55} litP={0.18 * (1 - blackout)} count={30} /></Plane>
      <Plane p={0.45}><DecoSkyline seed={12} baseY={680} hMin={180} hMax={420} haze={0.3} litP={0.22 * (1 - blackout)} count={30} body="#0e1424" light="#2e4670" /></Plane>
      <Plane p={0.6}><StreetFacades seed={5} baseY={742} litP={0.3 * (1 - blackout)} heightMin={380} heightMax={560} dark={0.1} /></Plane>
      <Plane p={0.6}>
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(4,6,14,0.55) 0%, rgba(4,6,14,0.15) 45%, rgba(4,6,14,0) 70%)" }} />
        {lamp > 0 && <Glow x={702} y={430} r={420} color="255,200,130" opacity={0.2 * lamp} />}
        <Fog y={700} height={200} opacity={0.18} />
      </Plane>
      <Plane p={1}>
        <WetStreet horizonY={742} curbY={790} laneY={930} reflections={[{ x: 700, color: "#ffd9a0", w: 60 }, { x: 1300, color: "#e8b040", w: 120, strength: 0.6 }, { x: 1650, color: "#ff3030", w: 30, strength: led ? 0.6 : 0.1 }]} />
        <StreetLamp x={640} baseY={790} on={lamp} />
        {lamp > 0 && <LightCone id="bsl" x={702} y={240} angle={0} length={560} spread={420} opacity={0.22 * lamp} />}
        {lamp > 0 && <Glow x={702} y={240} r={70} opacity={0.7 * lamp} />}
        <SchoolBus x={busX} y={busY} scale={busScale} fog={fog} wire={wire} ledOn={led} interior={0.35}
          childNode={nia ? (
            <g transform={`translate(${26 + 6 * 76 + 31} ${niaY})`}>
              <path d="M-22 60 C-22 20 -16 4 0 2 C16 4 22 20 22 60 Z" fill="#c9a018" />
              <circle cx={0} cy={6} r={15} fill="#d9b020" />
              <circle cx={1} cy={9} r={10} fill="#8a5a3c" />
              <ellipse cx={-14} cy={-6 - niaPound * 6} rx={5} ry={7} fill="#8a5a3c" />
              <ellipse cx={14} cy={-8 - niaPound * 6} rx={5} ry={7} fill="#8a5a3c" />
            </g>
          ) : undefined} />
        <Splashes y0={800} y1={1080} count={40 * rain} />
      </Plane>
      <Plane p={1.2}><Rain count={Math.round(240 * rain)} opacity={0.32} seed={1} /></Plane>
    </>
  );
};

export const ForegroundRain: React.FC<{ amt?: number }> = ({ amt = 1 }) => (
  <Plane p={1.35}>
    <Rain count={Math.round(70 * amt)} speed={90} len={110} width={2.6} opacity={0.22} seed={9} />
  </Plane>
);

/** deco caption that types on */
export const Caption: React.FC<{ text: string; from: number; to: number; x?: number; y?: number; size?: number; align?: "left" | "center" }> = ({ text, from, to, x = 120, y = 900, size = 44, align = "left" }) => {
  const f = useCurrentFrame();
  const n = Math.floor(ci(f, [from, from + text.length * 1.2], [0, text.length]));
  const o = ci(f, [to - 10, to], [1, 0]);
  if (f < from || f > to) return null;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: align === "center" ? 0 : x, right: align === "center" ? 0 : undefined, top: y, textAlign: align, opacity: o,
        fontFamily: "Georgia, 'Times New Roman', serif", fontSize: size, letterSpacing: size * 0.28, color: "#f0d9a8", fontWeight: 700,
        textShadow: "0 0 18px rgba(255,190,90,0.35), 0 2px 0 #000" }}>
        {text.slice(0, n)}
        <div style={{ height: 3, width: align === "center" ? 360 : 220, margin: align === "center" ? "14px auto 0" : "14px 0 0", background: "linear-gradient(90deg,#d9b24a,rgba(217,178,74,0))", opacity: ci(f, [from + 6, from + 20], [0, 1]) }} />
      </div>
    </AbsoluteFill>
  );
};

/** hard cut helper: render children only in [from, to) local frames */
export const Shot: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  return f >= from && f < to ? <>{children}</> : null;
};

export const FadeIn: React.FC<{ frames?: number; color?: string }> = ({ frames = 8, color = "#000" }) => {
  const f = useCurrentFrame();
  const o = ci(f, [0, frames], [1, 0]);
  return o > 0 ? <AbsoluteFill style={{ background: color, opacity: o }} /> : null;
};
