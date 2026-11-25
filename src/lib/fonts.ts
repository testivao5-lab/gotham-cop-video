import { continueRender, delayRender, staticFile } from "remotion";

/** One display face for every on-screen word (title + name cards). */
export const DISPLAY = "'Bebas Neue', 'Oswald', 'Arial Narrow', sans-serif";

let loaded = false;
export const ensureFonts = () => {
  if (loaded || typeof document === "undefined") return;
  loaded = true;
  const h = delayRender("Loading Bebas Neue");
  const ff = new FontFace("Bebas Neue", `url(${staticFile("fonts/BebasNeue-Regular.ttf")})`);
  ff.load()
    .then(() => { (document.fonts as any).add(ff); continueRender(h); })
    .catch((e) => { console.error(e); continueRender(h); });
};
