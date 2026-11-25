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
console.log(warns.join("\n"));
if (errors.length) { console.error("LAW GATE FAILED\n" + errors.join("\n")); process.exit(1); }
console.log(`LAW GATE PASSED (${files.length} files)`);
