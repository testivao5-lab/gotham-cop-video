import React, { createContext, useContext } from "react";
import { AbsoluteFill } from "remotion";

export type Cam = { x: number; y: number; zoom: number; rot?: number; shakeX?: number; shakeY?: number };
const CamCtx = createContext<Cam>({ x: 0, y: 0, zoom: 1 });

/** Virtual camera. Planes read it and apply depth-scaled parallax (storyboard 5-plane setup). */
export const Stage: React.FC<{ cam: Cam; children: React.ReactNode; bg?: string }> = ({ cam, children, bg = "#05070c" }) => (
  <CamCtx.Provider value={cam}>
    <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `rotate(${cam.rot ?? 0}deg) translate(${cam.shakeX ?? 0}px, ${cam.shakeY ?? 0}px)` }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  </CamCtx.Provider>
);

/** depth p: 0.25 far sky … 1 ground … 1.35 foreground */
export const Plane: React.FC<{ p: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ p, children, style }) => {
  const c = useContext(CamCtx);
  const z = 1 + (c.zoom - 1) * p;
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${-c.x * p}px, ${-c.y * p}px) scale(${z})`,
        transformOrigin: "50% 55%",
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** full-frame svg helper (1920x1080 design space) */
export const Svg: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; viewBox?: string }> = ({ children, style, viewBox = "0 0 1920 1080" }) => (
  <svg viewBox={viewBox} width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible", ...style }}>
    {children}
  </svg>
);
