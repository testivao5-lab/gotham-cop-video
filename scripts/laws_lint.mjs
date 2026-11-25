// Static gate for the 12 Remotion anti-bug laws. Fails CI before any frame is rendered.
import fs from "fs";
import path from "path";
const files = [];
const walk = (d) => fs.readdirSync(d).forEach((n) => { const p = path.join(d, n); fs.statSync(p).isDirectory() ? walk(p) : /\.(tsx?|css)$/.test(n) && files.push(p); });
walk("src");
const errors = [], warns = [];
const err = (f, l, m) => errors.push(`${f}:${l}  ${m}`);
for (const f of files) {
  const lines = fs.readFileSync(f, "utf8").split("\n");
  lines.forEach((t, i) => {
    const L = i + 1;
    if (/Math\.random\(/.test(t)) err(f, L, "LAW3 Math.random() — use random('seed')");
    if (/\btransition\s*:|@keyframes|setTimeout\(|setInterval\(|requestAnimationFrame\(/.test(t)) err(f, L, "LAW3 CSS/timer animation");
    if (/\binterpolate\(/.test(t) && !/import/.test(t) && !(/extrapolateLeft:\s*"clamp"/.test(t) && /extrapolateRight:\s*"clamp"/.test(t))) err(f, L, "LAW2 interpolate without both clamps (use ci/safeInterpolate)");
    if (/feGaussianBlur/.test(t)) err(f, L, "LAW12 heavy SVG blur — use CSS filter: blur()");
    if (/allowMouth(=\{true\}|\s|\/>)/.test(t) && !/allowMouth=\{false\}/.test(t) && f.includes("scenes")) err(f, L, "LAW10 mouth enabled during narrator-only scene");
    const g = t.match(/<Sfx[^>]*gain=\{([0-9.]+)\}/); if (g && f.includes("scenes") && !fs.readFileSync("src/scenes/common.tsx", "utf8").includes("sfxGain(gain)")) err(f, L, "LAW12 SFX not clamped");
  });
}
// LAW12: exact versions
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
for (const [k, v] of Object.entries({ ...pkg.dependencies, ...pkg.devDependencies })) if (/^[\^~]/.test(v)) err("package.json", 0, `LAW12 unpinned ${k}@${v}`);
const common = fs.readFileSync("src/scenes/common.tsx", "utf8");
if (!/Math\.max\(0\.04, Math\.min\(0\.08/.test(common)) err("src/scenes/common.tsx", 0, "AUDIO SafeSFX clamp 0.04-0.08 missing");
if (!/Math\.max\(0\.03, Math\.min\(0\.05/.test(common)) err("src/scenes/common.tsx", 0, "AUDIO ambience clamp 0.03-0.05 missing");
if (!/FADE = 18/.test(common)) err("src/scenes/common.tsx", 0, "AUDIO 18-frame fade envelope missing");
// AUDIO: no raw <Audio> volume above 0.08 except the narration (1.0)
for (const f of files) fs.readFileSync(f, "utf8").split("\n").forEach((t, i) => {
  if (!/<Audio/.test(t) || /narration/.test(t)) return;
  const m = t.match(/volume=\{\(?[^0-9]*([0-9]*\.?[0-9]+)/); if (m && parseFloat(m[1]) > 0.08) err(f, i + 1, `AUDIO volume ${m[1]} > 0.08`);
});
// OVERHAUL: rig hands and overlay hands never together; no pipe stripes
const b1 = fs.existsSync("src/scenes/batch1.tsx") ? fs.readFileSync("src/scenes/batch1.tsx", "utf8") : "";
if (/<Palm at=\{palmN\}/.test(b1) && /kind="nia"[^>]*reachNear=\{palmN\}/.test(b1)) err("batch1.tsx", 0, "OVERHAUL rig hands + overlay hands together");
const ch = fs.readFileSync("src/characters/Character.tsx", "utf8");
for (const [re, m] of [[/cl\(p\.armNear\[1\], 0, 140\)/, "LAW4 elbow clamp"], [/cl\(p\.legNear\[1\], 0, 135\)/, "LAW4 knee clamp"], [/cl\(p\.head, -35, 35\)/, "LAW4 neck clamp"], [/clipPath id=\{`\$\{id\}\$\{uid\}-scl`\}/, "LAW10 pupil clip"], [/useId\(/, "LAW10 useId"], [/p\.bob \+= breathe/, "LAW6 life wave"]]) if (!re.test(ch)) err("Character.tsx", 0, `${m} missing`);
// ================= PREVENTION RULES (v8, after user QA of v7) =================
const sceneFiles = files.filter((f) => f.includes(`${path.sep}scenes${path.sep}`));
const src = (f) => fs.readFileSync(f, "utf8");
// P1 LAMP: the shop lamp has ONE design (BrassDomeLamp in world/places.tsx). No inline lamp drawings anywhere else.
for (const f of files) {
  if (f.endsWith("places.tsx")) continue;
  src(f).split("\n").forEach((t, i) => {
    if (/(lamp|shade)/i.test(t) && /<path[^>]*d="M-?\d+ -?\d+ L-?\d+ -?\d+ L-?\d+ -?\d+ L-?\d+ -?\d+ Z"/.test(t) && !/LightCone|cone|beam/i.test(t)) err(f, i + 1, "P1 inline lamp shade — use <BrassDomeLamp/>");
  });
  const lines = src(f).split("\n");
  lines.forEach((t, i) => { if (/\{\/\*.*\blamp\b.*\*\/\}/i.test(t) && !/BrassDomeLamp|LightCone|Glow|StreetLamp|lampOn|cone|pool|glow/i.test(lines.slice(i, i + 12).join(" ")) && !/street lamp/i.test(t)) err(f, i + 1, "P1 lamp comment without <BrassDomeLamp/> nearby"); });
}
// P2 FRAMING: every <Character> with a literal y beyond the floor line must declare its crop (runtime audit checks the rest)
for (const f of sceneFiles) src(f).split("\n").forEach((t, i) => {
  const m = t.match(/<Character[^>]*\sy=\{(\d+)\}/); if (m && +m[1] > 1040 && !/crop=/.test(t)) err(f, i + 1, `P2 Character at y=${m[1]} without crop= (feet below frame)`);
});
// P3 GROUND OVERSCAN: ground/street/floor layers must overdraw past the frame (Plane zoom/pan exposes anything ending at 1080/1920)
for (const f of files.filter((f) => /world[\\/](street|places)\.tsx$/.test(f))) src(f).split("\n").forEach((t, i) => {
  if (/<rect[^>]*height=\{1080 - /.test(t) && /width="?\{?1920/.test(t) && !/opacity/.test(t)) err(f, i + 1, "P3 ground rect ends exactly at 1080 — overscan to >=1600 and x -400..2320");
});
// P4 SKYLINE: DecoSkyline only runs below its base (toBottom) in shots WITHOUT a ground plane in front
for (const f of sceneFiles) {
  const s = src(f); const shots = s.split(/<Shot |export const /);
  shots.forEach((sh) => { if (/<DecoSkyline toBottom/.test(sh) && /<(WetStreet|ShopFront|Precinct|BusStreetSet)/.test(sh)) err(f, 0, "P4 DecoSkyline toBottom in a shot that has a street/ground plane (skyline bleeds under the street)"); });
}
if (!/toBottom \? Math\.max\(baseY, 1500\) : baseY/.test(src("src/world/sky.tsx"))) err("src/world/sky.tsx", 0, "P4 DecoSkyline must end at baseY unless toBottom");
// P5 SCALE (L7): characters sharing a Plane in one shot share one scale (child/adult difference comes from BUILD heights)
for (const f of sceneFiles) {
  const s = src(f);
  for (const blk of s.split(/<Plane p=\{/).slice(1)) {
    const body = blk.split("</Plane>")[0];
    const sc = [...body.matchAll(/<Character[^>]*scale=\{([^}]+)\}/g)].map((m) => m[1].trim());
    if (new Set(sc).size > 1 && !/scale-ok:/.test(body)) {
      const nums = sc.map(Number); const ok = nums.every((n) => !isNaN(n)) && Math.max(...nums) / Math.min(...nums) <= 1.06;
      if (!ok) err(f, 0, `P5 mixed character scales in one plane: ${sc.join(", ")} (add // scale-ok: reason if deliberate depth)`);
    }
  }
}
// P6 OVERLAY HANDS: tiny figures drawn inside a vehicle/window (childNode) must have 5-finger hands (no ellipse 'paws')
for (const f of files) { const s = src(f); const re = /childNode=\{[\s\S]*?\) : undefined\}/g; let m; while ((m = re.exec(s))) { const body = m[0]; if (/hand/i.test(body) && !/M-6 8 Q-7 -2 -5 -8 M-2 6 L-2 -11/.test(body)) err(f, 0, "P6 window figure hands must be the 5-finger palm glyph"); if (/<ellipse[^>]*rx=\{[4-9]\}[^>]*ry=\{[3-9]\}[^>]*fill="#[a-f0-9]{6}"[^>]*\/>\s*<ellipse/.test(body)) err(f, 0, "P6 paired ellipse 'paws' in a window figure"); } }
// P7 PROP GRIP: cards/props must overlap the fingers (no prop balanced above a fingertip) — Joker card centre must sit inside the finger span
{ const pl = src("src/world/places.tsx"); const m = pl.match(/card \*\/\}\s*<g transform="translate\((-?\d+) (-?\d+)\)/); if (!m || +m[2] < -100) err("src/world/places.tsx", 0, "P7 Joker card not gripped (centre must be within the finger span, y >= -100)"); }
// P8 AUDIT HOOKS present (runtime framing audit + overlay rendered last)
if (!/auditReport\(/.test(ch) || !/useScreenProj\(\)/.test(ch)) err("Character.tsx", 0, "P8 framing audit hook missing");
if (!/<AuditOverlay \/>\s*<\/AbsoluteFill>/.test(src("src/Video.tsx"))) err("src/Video.tsx", 0, "P8 AuditOverlay must be the last child of the root");
console.log(warns.join("\n"));
// P14: svg-fragment components (return a bare <g>) render NOTHING outside an <svg> — S18 fire escape vanished this way
const SVG_FRAGMENTS = ["FireEscape"];
for (const f of files.filter((x) => x.includes("scenes"))) {
  const src = fs.readFileSync(f, "utf8");
  for (const name of SVG_FRAGMENTS) {
    let k = -1;
    while ((k = src.indexOf(`<${name}`, k + 1)) >= 0) {
      const before = src.slice(0, k);
      const open = (before.match(/<svg[\s>]/g) || []).length - (before.match(/<\/svg>/g) || []).length;
      if (open <= 0) err(f, before.split("\n").length, `P14 <${name}> is an svg <g> fragment used outside <svg>`);
    }
  }
}
// P15: Camera floor clamp (feet-in-frame prevention) must stay wired into Stage
if (!/clampCam\(cam0\)/.test(fs.readFileSync("src/lib/Camera.tsx", "utf8"))) err("src/lib/Camera.tsx", 0, "P15 Stage must apply clampCam (cam.floor feet-in-frame guard)");
if (errors.length) { console.error("LAW GATE FAILED\n" + errors.join("\n")); process.exit(1); }
// ================= PREVENTION RULES (v9, after user QA of v8: door/human scale, kid/window ratio, backward torch) =================
{
  const w = fs.existsSync("src/lib/world.ts") ? src("src/lib/world.ts") : "";
  if (!/export const WORLD_METRICS/.test(w) || !/export const DEPTH_PLANES/.test(w)) err("src/lib/world.ts", 0, "P9 WORLD_METRICS / DEPTH_PLANES config missing");
  if (!/guardDoor/.test(w) || !/guardWindowHead/.test(w)) err("src/lib/world.ts", 0, "P9 metric scale guards missing");
  const ch2 = src("src/characters/Character.tsx");
  const fb = ch2.slice(ch2.indexOf('if (type === "flashlight")'), ch2.indexOf('if (type === "key")'));
  if (/rotate\(-90\)/.test(fb) || !/rotate\(90\)/.test(fb)) err("Character.tsx", 0, "P10 flashlight must point forward out of the fist (rotate(90): lens away from the wrist)");
  if (!/radialGradient/.test(fb) || !/screen/.test(fb) || !/blur\(/.test(fb)) err("Character.tsx", 0, "P10 flashlight beam must be volumetric (radialGradient + screen + blur)");
  const b1s = src("src/scenes/batch1.tsx");
  if (!/guardWindowHead\(/.test(b1s)) err("batch1.tsx", 0, "P11 bus window close-up must call guardWindowHead (window : head >= 4)");
  if (!/guardDoor\(/.test(b1s)) err("batch1.tsx", 0, "P11 precinct shot must call guardDoor (door >= 1.2 x human at the same depth)");
  const st = src("src/world/street.tsx");
  if (!/clipPath=\{`url\(#\$\{clipId\}\)`\}/.test(st)) err("street.tsx", 0, "P12 bus childNode must be clipped to the window openings");
  // P13: full-figure characters (no crop) never get a hand-typed scale > 1.2 — size comes from the shot metric (M.human / BM.human / S)
  for (const f of sceneFiles.filter((f) => !f.includes("lookdev"))) src(f).split("\n").forEach((t, i) => {
    const m = t.match(/<Character[^>]*\sscale=\{([0-9.]+)\}/);
    if (m && +m[1] > 1.2 && !/crop=/.test(t) && !/scale-ok/.test(t)) err(f, i + 1, `P13 literal scale ${m[1]} on an uncropped figure — use metric().human(y)`);
  });
}
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`LAW GATE PASSED (${files.length} files, P1-P15)`);
