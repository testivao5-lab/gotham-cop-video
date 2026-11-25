import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, interpolate } from "remotion";
import { SCENES, SceneInfo, TOTAL_FRAMES } from "./timeline";
import { AuditOverlay } from "./lib/audit";
import { Scene01, Scene02, Scene03, Scene04, Scene05, Scene06, Scene07, Scene08, Scene09, Scene10 } from "./scenes/batch1";
import { Scene11, Scene12, Scene13, Scene14, Scene15, Scene16, Scene17, Scene18, Scene19, Scene20, Scene21, Scene22, Scene23, Scene24, Scene25, Scene26, Scene27, Scene28 } from "./scenes/batch2";
import { Scene29, Scene30, Scene31, Scene32, Scene33, Scene34, Scene35, Scene36, Scene37, Scene38, Scene39, Scene40, Scene41, Scene42, Scene43, Scene44 } from "./scenes/batch3";
import { Scene45, Scene46, Scene47, Scene48, Scene49, Scene50, Scene51, Scene52, Scene53, Scene54, Scene55, Scene56, Scene57, Scene58, Scene59, Scene60 } from "./scenes/batch4";

const REGISTRY: Record<string, React.FC> = {
  Scene_01: Scene01, Scene_02: Scene02, Scene_03: Scene03, Scene_04: Scene04, Scene_05: Scene05,
  Scene_06: Scene06, Scene_07: Scene07, Scene_08: Scene08, Scene_09: Scene09, Scene_10: Scene10,
  Scene_11: Scene11, Scene_12: Scene12, Scene_13: Scene13, Scene_14: Scene14, Scene_15: Scene15, Scene_16: Scene16, Scene_17: Scene17, Scene_18: Scene18, Scene_19: Scene19, Scene_20: Scene20, Scene_21: Scene21, Scene_22: Scene22, Scene_23: Scene23, Scene_24: Scene24, Scene_25: Scene25, Scene_26: Scene26, Scene_27: Scene27, Scene_28: Scene28, Scene_29: Scene29, Scene_30: Scene30, Scene_31: Scene31, Scene_32: Scene32, Scene_33: Scene33, Scene_34: Scene34, Scene_35: Scene35, Scene_36: Scene36, Scene_37: Scene37, Scene_38: Scene38, Scene_39: Scene39, Scene_40: Scene40, Scene_41: Scene41, Scene_42: Scene42, Scene_43: Scene43, Scene_44: Scene44, Scene_45: Scene45, Scene_46: Scene46, Scene_47: Scene47, Scene_48: Scene48, Scene_49: Scene49, Scene_50: Scene50, Scene_51: Scene51, Scene_52: Scene52, Scene_53: Scene53, Scene_54: Scene54, Scene_55: Scene55, Scene_56: Scene56, Scene_57: Scene57, Scene_58: Scene58, Scene_59: Scene59, Scene_60: Scene60,
};

const PlaceholderScene: React.FC<{ scene: SceneInfo }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 30% 20%, #2a3550 0%, #0b0e17 70%)", color: "#E9C7A5", fontFamily: "Georgia, serif", justifyContent: "center", alignItems: "center", opacity }}>
      <div style={{ fontSize: 36, letterSpacing: 6, color: "#7FA4CC" }}>{scene.id.replace("_", " ")}</div>
      <div style={{ fontSize: 64, marginTop: 20, textAlign: "center", maxWidth: 1500 }}>{scene.title}</div>
      <div style={{ fontSize: 30, marginTop: 40, textAlign: "center", maxWidth: 1400, color: "#A68172" }}>{scene.narration}</div>
    </AbsoluteFill>
  );
};

/** [from, to) global frame ranges where a bed is audible; 18-frame ramps (overhaul audio envelope) */
const RAIN: [number, number][] = [[0, 700], [843, 1001], [1311, 1378], [1779, 1968], [1968, 4654], [6036, 13355], [14442, 14634]];
const ROOM: [number, number][] = [[1001, 1311], [4654, 6036], [13790, 14171], [14634, 15045], [15313, 15924]];
const envAt = (fr: number, ranges: [number, number][]) => {
  let v = 0;
  for (const [a, b] of ranges) v = Math.max(v, Math.min(1, (fr - a + 18) / 18, (b - fr + 18) / 18, fr / 18, (TOTAL_FRAMES - fr) / 18));
  return Math.max(0, v);
};

export const GothamCop: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#05070c" }}>
    <Audio src={staticFile("narration.wav")} volume={1} />
    {/* continuous beds (procedural, scripts/sfx.py): never a dead-silent gap between narration lines */}
    <Audio src={staticFile("sfx/rain_bed.wav")} loop volume={(fr) => 0.045 * envAt(fr, RAIN)} />
    <Audio src={staticFile("sfx/room.wav")} loop volume={(fr) => 0.035 * envAt(fr, ROOM)} />
    <Audio src={staticFile("sfx/pad.wav")} loop volume={(fr) => 0.03 * Math.max(0, Math.min(1, fr / 18, (TOTAL_FRAMES - fr) / 18))} />
    {SCENES.map((s) => {
      const C = REGISTRY[s.id];
      return (
        <Sequence key={s.id} from={s.start} durationInFrames={s.end - s.start + 1} name={s.id}>
          {C ? <C /> : <PlaceholderScene scene={s} />}
        </Sequence>
      );
    })}
    <AuditOverlay />
  </AbsoluteFill>
);
