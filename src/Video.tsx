import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from "remotion";
import { SCENES, SceneInfo, TOTAL_FRAMES } from "./timeline";
import { Scene01, Scene02, Scene03, Scene04, Scene05, Scene06, Scene07, Scene08, Scene09, Scene10 } from "./scenes/batch1";

const REGISTRY: Record<string, React.FC> = {
  Scene_01: Scene01, Scene_02: Scene02, Scene_03: Scene03, Scene_04: Scene04, Scene_05: Scene05,
  Scene_06: Scene06, Scene_07: Scene07, Scene_08: Scene08, Scene_09: Scene09, Scene_10: Scene10,
};

const PlaceholderScene: React.FC<{ scene: SceneInfo }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 30% 20%, #2a3550 0%, #0b0e17 70%)", color: "#E9C7A5", fontFamily: "Georgia, serif", justifyContent: "center", alignItems: "center", opacity }}>
      <div style={{ fontSize: 36, letterSpacing: 6, color: "#7FA4CC" }}>{scene.id.replace("_", " ")}</div>
      <div style={{ fontSize: 64, marginTop: 20, textAlign: "center", maxWidth: 1500 }}>{scene.title}</div>
      <div style={{ fontSize: 30, marginTop: 40, textAlign: "center", maxWidth: 1400, color: "#A68172" }}>{scene.narration}</div>
    </AbsoluteFill>
  );
};

/** [from, to) global frame ranges where a bed is audible; 12-frame ramps between them */
const RAIN: [number, number][] = [[0, 700], [843, 1001], [1311, 1378], [1779, 1968]];
const ROOM: [number, number][] = [[1001, 1311]];
const envAt = (fr: number, ranges: [number, number][]) => {
  let v = 0;
  for (const [a, b] of ranges) v = Math.max(v, Math.min(1, (fr - a + 12) / 12, (b - fr + 12) / 12));
  return Math.max(0, v);
};

export const GothamCop: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#05070c" }}>
    <Audio src={staticFile("narration.wav")} />
    {/* continuous beds (procedural, scripts/sfx.py): never a dead-silent gap between narration lines */}
    <Audio src={staticFile("sfx/rain_bed.wav")} loop volume={(fr) => 0.16 * envAt(fr, RAIN)} />
    <Audio src={staticFile("sfx/room.wav")} loop volume={(fr) => 0.14 * envAt(fr, ROOM)} />
    <Audio src={staticFile("sfx/pad.wav")} loop volume={(fr) => 0.07 * Math.min(1, fr / 24, (TOTAL_FRAMES - fr) / 48)} />
    {SCENES.map((s) => {
      const C = REGISTRY[s.id];
      return (
        <Sequence key={s.id} from={s.start} durationInFrames={s.end - s.start + 1} name={s.id}>
          {C ? <C /> : <PlaceholderScene scene={s} />}
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
