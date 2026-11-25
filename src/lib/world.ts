/**
 * WORLD_METRICS + DEPTH_PLANES — unified real-world scale (metres) and true perspective.
 * Every object on screen is sized from metres through pxPerM(groundY): objects standing on the
 * same ground line share ONE px-per-metre, so a kid can never out-size a bus window, a person can
 * never out-size a building at the same depth, and things only grow when they are closer to the lens.
 */
export const WORLD_METRICS = {
  flashlight: 0.2,
  kid: { height: 1.25, seatedVisible: 0.55, head: 0.2 },
  nia: { height: 1.05 },
  adult: 1.75,
  car: { height: 1.45, length: 4.5 },
  bus: { height: 3.2, length: 10.5, window: 0.95, wheel: 1.0 },
  streetlamp: 6.2,
  tree: 8,
  floor: 3.5, // building storey
  door: 2.1,
  window: 1.2,
  table: 0.75,
  chair: 0.45,
} as const;

/** rig units per metre for each drawable (local SVG units / real metres) */
export const UNITS_PER_M = {
  human: 400 / 1.75, // Character BUILD: alex H=400 units = 1.75 m (every kind keeps its real ratio)
  bus: 850 / 10.5, // SchoolBus W=850
  cruiser: 450 / 4.5, // Cruiser W=450
  lamp: 520 / 6.2, // StreetLamp h=520
} as const;

/** eye level / horizon of the default street camera (1080p) */
export const HORIZON_Y = 680;

/** optical depth planes: scale = focal / Z, ground line from the horizon, parallax = scale */
export const DEPTH_PLANES = {
  extremeForeground: { z: 2, scale: 2.5, parallax: 2.5, groundY: 1150, blur: 6 },
  subject: { z: 5, scale: 1.0, parallax: 1.0, groundY: 920, blur: 0 },
  nearSidewalk: { z: 8, scale: 0.65, parallax: 0.65, groundY: 820, blur: 0 },
  midBuildings: { z: 18, scale: 0.35, parallax: 0.35, groundY: 740, blur: 0 },
  farSkyline: { z: 60, scale: 0.12, parallax: 0.08, groundY: 680, blur: 0 },
  sky: { z: Infinity, scale: 0, parallax: 0.01, groundY: 680, blur: 0 },
} as const;

/** px per metre at the subject plane (Z = 5 m) */
export const PPM_SUBJECT = 200;

/** px per metre for anything whose ground contact is at screen y (true perspective from the horizon) */
export const pxPerM = (groundY: number, horizon = HORIZON_Y, ref = DEPTH_PLANES.subject.groundY, ppm = PPM_SUBJECT) =>
  (ppm * Math.max(1, groundY - horizon)) / (ref - horizon);

/** component scale for something standing at groundY */
export const scaleAt = (what: keyof typeof UNITS_PER_M, groundY: number, horizon = HORIZON_Y) => pxPerM(groundY, horizon) / UNITS_PER_M[what];

/** metres -> px at a ground line */
export const m2px = (m: number, groundY: number, horizon = HORIZON_Y) => m * pxPerM(groundY, horizon);

/** per-shot metric camera: horizon line + px-per-metre at y=1000. Everything in the shot is sized through it. */
export const metric = (horizon: number, ppm1000: number) => {
  const ppm = (y: number) => (ppm1000 * Math.max(1, y - horizon)) / (1000 - horizon);
  return {
    ppm,
    /** Character scale for a figure whose feet are at y (BUILD alex H 400 = 1.75 m) */
    human: (y: number) => (ppm(y) * 1.75) / 400,
    /** SchoolBus scale (W 850 = 10.5 m) */
    bus: (y: number) => (ppm(y) * 10.5) / 850,
    /** Cruiser scale (W 450 = 4.5 m) */
    car: (y: number) => (ppm(y) * 4.5) / 450,
    px: (m: number, y: number) => m * ppm(y),
  };
};

/** HARD scale guard (throws => CI render fails): a door must be >= 1.2x the height of a human standing at the same depth */
export const guardDoor = (doorPx: number, doorGroundY: number, humanPx: number, humanGroundY: number, horizon = HORIZON_Y, tag = "") => {
  const humanAtDoor = humanPx * (doorGroundY - horizon) / Math.max(1, humanGroundY - horizon);
  if (doorPx < 1.2 * humanAtDoor) throw new Error(`SCALE GUARD ${tag}: door ${doorPx.toFixed(0)}px < 1.2 x human-at-door ${humanAtDoor.toFixed(0)}px`);
};
/** HARD guard: window : head >= 4 (bus window 0.95 m vs 0.20 m head) */
export const guardWindowHead = (windowPx: number, headPx: number, tag = "") => {
  if (windowPx / headPx < 4) throw new Error(`SCALE GUARD ${tag}: window/head ${(windowPx / headPx).toFixed(2)} < 4`);
};
