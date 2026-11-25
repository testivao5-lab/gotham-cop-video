import scenes from "./data/scenes.json";

export const FPS = 24;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export type SceneInfo = {
  id: string;
  title: string;
  start: number; // global start frame (storyboard estimate, retimed after alignment)
  end: number; // inclusive end frame
  cast: string[];
  lens: string | null;
  narration: string;
};

export const SCENES = scenes as SceneInfo[];
export const TOTAL_FRAMES = SCENES[SCENES.length - 1].end + 1;
