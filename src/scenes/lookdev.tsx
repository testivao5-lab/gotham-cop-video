import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Stage, Plane } from "../lib/Camera";
import { Character } from "../characters/Character";
import { JokerProfile } from "../world/places";
import { Sky } from "../world/sky";
import { Post } from "../fx/fx";
import { Caption } from "./common";

/** frame 0: IK handshake + hands; frame 1: Joker; frame 2: captions */
export const LookDev: React.FC = () => {
  const f = useCurrentFrame();
  if (f === 1)
    return (
      <Stage cam={{ x: 0, y: 0, zoom: 1 }}>
        <AbsoluteFill style={{ background: "#0b0f1c" }} />
        <JokerProfile x={1150} y={430} scale={1.5} turn={1} card={1} laugh={0} />
        <Post />
      </Stage>
    );
  if (f === 2)
    return (
      <Stage cam={{ x: 0, y: 0, zoom: 1 }}>
        <Plane p={0.2}><Sky variant="dusk" seed={5} horizonY={760} /></Plane>
        <Caption text="SIX DAYS EARLIER" from={-30} to={200} align="center" />
        <Caption text="OFFICER MARA BENNETT" from={-30} to={200} />
      </Stage>
    );
  const meet: [number, number] = [960, 640];
  return (
    <Stage cam={{ x: 0, y: 0, zoom: 1 }}>
      <Plane p={0.2}><Sky variant="night" seed={2} horizonY={900} /></Plane>
      <Character id="ldA" kind="alexDress" x={760} y={1000} scale={1.5} facing={1} reachNear={meet} pose={{ handNear: "grip", smile: 0.4 }} />
      <Character id="ldF" kind="father" x={1170} y={1000} scale={1.48} facing={-1} reachNear={[meet[0] + 6, meet[1] + 4]} pose={{ handNear: "grip", smile: 0.2 }} />
      <Character id="ldB" kind="batman" x={300} y={1000} scale={1.3} facing={1} glowEyes={0.8} prop="radio" reachNear={[420, 560]} pose={{ handNear: "grip" }} />
      <Character id="ldM" kind="mara" x={1600} y={1000} scale={1.3} facing={-1} reachFar={[1500, 700]} pose={{ handNear: "open", handFar: "point" }} />
      <Post />
    </Stage>
  );
};
