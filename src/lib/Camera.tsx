import React, { createContext, useContext } from "react";
import { AbsoluteFill } from "remotion";

export type Cam = { x: number; y: number; zoom: number; rot?: number; shakeX?: number; shakeY?: number; floor?: number };
/** PREVENTION (feet-in-frame): when `floor` is given, the camera may never tilt/zoom so far that the ground line at
 *  design-y `floor` (Plane p=1) projects below screen-y 1050 — full-body figures standing there keep their feet. */
export const clampCam = (cam: Cam): Cam =>
  cam.floor == null ? cam : { ...cam, y: Math.max(cam.y, 594 + cam.zoom * (cam.floor - 594) - 1050) };
const CamCtx = createContext<Cam>({ x: 0, y: 0, zoom: 1 });
type PlaneInfo = { p: number; z: number; cam: Cam };
const PlaneCtx = createContext<PlaneInfo | null>(null);
/** design-space -> screen-space projection of the current Plane (used by the framing audit) */
export const useScreenProj = () => {
  const pl = useContext(PlaneCtx);
  return {
    y: (y: number) => (pl ? 594 - pl.cam.y * pl.p + pl.z * (y - 594) + (pl.cam.shakeY ?? 0) : y),
    x: (x: number) => (pl ? 960 - pl.cam.x * pl.p + pl.z * (x - 960) + (pl.cam.shakeX ?? 0) : x),
    z: pl ? pl.z : 1,
  };
};

/** Virtual camera. Planes read it and apply depth-scaled parallax (storyboard 5-plane setup). */
export const Stage: React.FC<{ cam: Cam; children: React.ReactNode; bg?: string }> = ({ cam: cam0, children, bg = "#05070c" }) => {
  const cam = clampCam(cam0);
  return (
  <CamCtx.Provider value={cam}>
    <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `rotate(${cam.rot ?? 0}deg) translate(${cam.shakeX ?? 0}px, ${cam.shakeY ?? 0}px)` }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  </CamCtx.Provider>
  );
};

/** depth p: 0.25 far sky … 1 ground … 1.35 foreground */
export const Plane: React.FC<{ p: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ p, children, style }) => {
  const c = useContext(CamCtx);
  const z = 1 + (c.zoom - 1) * p;
  return (
    <PlaneCtx.Provider value={{ p, z, cam: c }}>
      <AbsoluteFill
        style={{
          transform: `translate(${-c.x * p}px, ${-c.y * p}px) scale(${z})`,
          transformOrigin: "50% 55%",
          ...style,
        }}
      >
        {children}
      </AbsoluteFill>
    </PlaneCtx.Provider>
  );
};

/** full-frame svg helper (1920x1080 design space) */
export const Svg: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; viewBox?: string }> = ({ children, style, viewBox = "0 0 1920 1080" }) => (
  <svg viewBox={viewBox} width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible", ...style }}>
    {children}
  </svg>
);
