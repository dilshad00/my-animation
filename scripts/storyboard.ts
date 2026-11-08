/**
 * Renders one (or more) still frames per scene and an HTML contact sheet,
 * so a whole 10–15 minute video can be reviewed in seconds.
 *
 *   npm run storyboard -- <project-id> [--per-scene=3] [--scale=0.5] [--only=s0,s1]
 *
 * Output: renders/<project-id>/storyboard/index.html
 */
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { RENDERS_DIR, ROOT } from "./lib/files";
import type { Timeline } from "../src/utils/narration";
import type { ProjectT } from "../src/utils/schema";

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith("--"));
if (!id) {
  console.error("Usage: npm run storyboard -- <project-id> [--per-scene=3] [--scale=0.5]");
  process.exit(1);
}
const opt = (name: string, d: number) => {
  const a = args.find((x) => x.startsWith(`--${name}=`));
  return a ? Number(a.split("=")[1]) : d;
};
const perScene = Math.max(1, opt("per-scene", 1));
const scale = opt("scale", 0.5);
/** --only=s0,s1  → only scenes whose id starts with one of these prefixes */
const onlyArg = args.find((x) => x.startsWith("--only="));
const only = onlyArg ? onlyArg.slice(7).split(",").filter(Boolean) : null;

const root = ROOT;
const outDir = path.join(RENDERS_DIR, id, "storyboard");
fs.mkdirSync(outDir, { recursive: true });

const main = async () => {
console.log("Bundling…");
const serveUrl = await bundle({ entryPoint: path.join(root, "src", "index.ts"), publicDir: path.join(root, "public") });
const composition = await selectComposition({ serveUrl, id, inputProps: { projectId: id } });
const props = composition.props as { project: ProjectT; timeline: Timeline };
const { project, timeline } = props;

const shots: { scene: string; frame: number; file: string; text: string }[] = [];
for (const [i, s] of timeline.scenes.entries()) {
  if (only && !only.some((p) => s.id.startsWith(p))) continue;
  for (let k = 0; k < perScene; k++) {
    // sample after the transition-in, spread across the scene
    const usable = s.durationInFrames - s.transitionIn;
    const frame = s.from + s.transitionIn + Math.floor((usable * (k + 1)) / (perScene + 1));
    const file = `${String(i + 1).padStart(3, "0")}-${s.id}-${k + 1}.jpg`;
    shots.push({ scene: s.id, frame, file, text: project.scenes[i].narration ?? "" });
  }
}

for (const [n, shot] of shots.entries()) {
  process.stdout.write(`\rRendering ${n + 1}/${shots.length}  (${shot.scene})            `);
  await renderStill({
    composition,
    serveUrl,
    frame: shot.frame,
    output: path.join(outDir, shot.file),
    imageFormat: "jpeg",
    jpegQuality: 85,
    scale,
    inputProps: { projectId: id },
  });
}

const fmt = (f: number) => {
  const s = f / project.fps;
  return `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;
};
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(project.title)} – storyboard</title>
<style>body{font-family:system-ui,sans-serif;background:#0f1220;color:#e8ecf5;margin:24px}h1{margin:0 0 4px}p.meta{opacity:.7;margin:0 0 24px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(420px,1fr));gap:18px}.card{background:#1a1f35;border-radius:14px;overflow:hidden}
.card img{width:100%;display:block}.card div{padding:10px 14px}.id{font-weight:700}.t{opacity:.6;font-size:13px}.n{font-size:14px;line-height:1.4;opacity:.9;margin-top:6px}</style></head>
<body><h1>${esc(project.title)}</h1><p class="meta">${timeline.scenes.length} scenes · ${fmt(timeline.totalFrames)} · timing: ${timeline.mode}</p><div class="grid">
${shots
  .map((s) => `<div class="card"><img src="${s.file}"><div><div class="id">${esc(s.scene)}</div><div class="t">frame ${s.frame} · ${fmt(s.frame)}</div><div class="n">${esc(s.text)}</div></div></div>`)
  .join("\n")}
</div></body></html>`;
fs.writeFileSync(path.join(outDir, "index.html"), html);
console.log(`\n✓ Storyboard: ${path.relative(root, path.join(outDir, "index.html"))}`);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
