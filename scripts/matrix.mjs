// Builds a GitHub Actions matrix of frame chunks.
// usage: node scripts/matrix.mjs <sceneRange|all> <chunks>
import fs from "fs";
const scenes = JSON.parse(fs.readFileSync("src/data/scenes.json", "utf8"));
const [range = "all", chunksArg = "20"] = process.argv.slice(2);
let a = 1, b = scenes.length;
if (range !== "all") { const m = range.split("-").map(Number); a = m[0]; b = m[1] ?? m[0]; }
const start = scenes[a - 1].start, end = scenes[b - 1].end;
const n = Math.max(1, Math.min(Number(chunksArg), Math.ceil((end - start + 1) / 60)));
const size = Math.ceil((end - start + 1) / n);
const chunks = [];
for (let i = 0; i < n; i++) {
  const s = start + i * size, e = Math.min(end, s + size - 1);
  if (s <= e) chunks.push({ idx: String(i).padStart(3, "0"), from: s, to: e });
}
const out = { include: chunks };
const stills = scenes.slice(a - 1, b).map((s) => `${s.id}:${Math.round(s.start + (s.end - s.start) * 0.55)}`).join(",");
fs.appendFileSync(process.env.GITHUB_OUTPUT || "/dev/stdout", `matrix=${JSON.stringify(out)}\nstart=${start}\nend=${end}\nstills=${stills}\n`);
