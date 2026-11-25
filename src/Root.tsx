import React from "react";
import { Composition } from "remotion";
import { GothamCop } from "./Video";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="GothamCop"
    component={GothamCop}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
