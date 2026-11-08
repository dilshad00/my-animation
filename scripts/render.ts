/**
 * Renders a project to MP4 (H.264, 1920×1080 by default).
 *
 *   npm run render -- <project-id> [--draft] [--scene=s03-sun] [--from=1:20] [--to=2:05] [--concurrency=4]
 *
 *   --draft         half resolution, faster encode – for quick review
 *   --scene=<id>    render only that scene
 *   --from/--to     render a time range (M:SS or seconds)
 *
 * Output: renders/<project-id>[-suffix].mp4
 */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { normalizeCaptionsJson, parseProject, projectTimeline } from "../src/utils/project";
import { captionsFile, readJson, rel, RENDERS_DIR, ROOT, storyboardFile } from "./lib/files";

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith("--"));
const opt = (n: string) => args.find((a) => a.startsWith(`--${n}=`))?.split("=").slice(1).join("=");
const flag = (n: string) => args.includes(`--${n}`);
if (!id) {
  console.error("Usage: npm run render -- <project-id> [--draft] [--scene=id] [--from=M:SS] [--to=M:SS]");
  process.exit(1);
}
const root = ROOT;
const win = process.platform === "win32";

// 1. registry + validation
execFileSync("npx", ["tsx", path.join(root, "scripts", "sync-projects.ts")], { stdio: "inherit", shell: win });
const v = spawnSync("npx", ["tsx", path.join(root, "scripts", "validate.ts"), id], { stdio: "inherit", shell: win });
if (v.status !== 0) process.exit(v.status ?? 1);

// 2. frame range
const project = parseProject(readJson(storyboardFile(id)));
const captions = fs.existsSync(captionsFile(id)) ? normalizeCaptionsJson(readJson(captionsFile(id))) : null;
const timeline = projectTimeline(project, captions);
const toFrame = (s: string) => Math.round(s.split(":").reduce((a, p) => a * 60 + Number(p), 0) * project.fps);

let range: string | undefined;
let suffix = "";
const sceneId = opt("scene");
if (sceneId) {
  const s = timeline.scenes.find((x) => x.id === sceneId);
  if (!s) {
    console.error(`✗ No scene "${sceneId}". Scenes: ${timeline.scenes.map((x) => x.id).join(", ")}`);
    process.exit(1);
  }
  range = `${s.from}-${s.from + s.durationInFrames - 1}`;
  suffix = `-${sceneId}`;
} else if (opt("from") || opt("to")) {
  const a = opt("from") ? toFrame(opt("from")!) : 0;
  const b = opt("to") ? Math.min(timeline.totalFrames, toFrame(opt("to")!)) - 1 : timeline.totalFrames - 1;
  range = `${a}-${b}`;
  suffix = `-${a}-${b}`;
}
const draft = flag("draft");
if (draft) suffix += "-draft";

// 3. render
fs.mkdirSync(RENDERS_DIR, { recursive: true });
const output = rel(path.join(RENDERS_DIR, `${id}${suffix}.mp4`));
const cli = [
  "remotion",
  "render",
  id,
  output,
  "--codec=h264",
  ...(draft ? ["--scale=0.5", "--crf=28"] : ["--crf=18"]),
  ...(range ? [`--frames=${range}`] : []),
  ...(opt("concurrency") ? [`--concurrency=${opt("concurrency")}`] : []),
];
console.log(`\nRendering "${project.title}"${range ? ` (frames ${range})` : ""} → ${output}\n`);
const r = spawnSync("npx", cli, { stdio: "inherit", shell: win, cwd: root });
if (r.status === 0) console.log(`\n✓ ${output}`);
process.exit(r.status ?? 1);
