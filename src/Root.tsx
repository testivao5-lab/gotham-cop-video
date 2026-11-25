import React from "react";
import { Composition } from "remotion";
import { GothamCop } from "./Video";
import { Lineup } from "./scenes/batch1";
import { LookDev } from "./scenes/lookdev";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <>
  <Composition
    id="GothamCop"
    component={GothamCop}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
  <Composition id="Lineup" component={Lineup} durationInFrames={48} fps={FPS} width={WIDTH} height={HEIGHT} />
  <Composition id="LookDev" component={LookDev} durationInFrames={3} fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
);
