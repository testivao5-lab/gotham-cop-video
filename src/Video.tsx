import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from "remotion";
import { SCENES, SceneInfo } from "./timeline";

// Placeholder scene card — replaced by real noir scenes in step 3.
const PlaceholderScene: React.FC<{ scene: SceneInfo }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at 30% 20%, #2a3550 0%, #0b0e17 70%)",
        color: "#E9C7A5",
        fontFamily: "Georgia, serif",
        justifyContent: "center",
        alignItems: "center",
        opacity,
      }}
    >
      <div style={{ fontSize: 36, letterSpacing: 6, color: "#7FA4CC" }}>{scene.id.replace("_", " ")}</div>
      <div style={{ fontSize: 64, marginTop: 20, textAlign: "center", maxWidth: 1500 }}>{scene.title}</div>
      <div style={{ fontSize: 30, marginTop: 40, textAlign: "center", maxWidth: 1400, color: "#A68172" }}>
        {scene.narration}
      </div>
    </AbsoluteFill>
  );
};

export const GothamCop: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#05070c" }}>
    <Audio src={staticFile("narration.wav")} />
    {SCENES.map((s) => (
      <Sequence key={s.id} from={s.start} durationInFrames={s.end - s.start + 1} name={s.id}>
        <PlaceholderScene scene={s} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
