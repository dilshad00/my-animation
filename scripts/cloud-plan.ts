/**
 * Splits a project's frames into N equal chunks for parallel rendering
 * (used by .github/workflows/render.yml; also handy locally).
 *
 *   npx tsx scripts/cloud-plan.ts <project-id> [chunks=8] [seconds=0]   (seconds > 0 = only the first N seconds, for test runs)
 *
 * Prints JSON: {"total":21248,"chunks":[{"i":0,"range":"0-2655"},…]}
 */
import fs from "node:fs";
import { normalizeCaptionsJson, parseProject, projectTimeline } from "../src/utils/project";
import { captionsFile, readJson, storyboardFile } from "./lib/files";

const [id, n = "8", secs = "0"] = process.argv.slice(2);
if (!id) {
  console.error("Usage: npx tsx scripts/cloud-plan.ts <project-id> [chunks]");
  process.exit(1);
}
/** Standalone compositions (style experiments) that have no projects/<id>/ folder. */
const STANDALONE: Record<string, { frames: number; fps: number }> = { "Anime-Demo": { frames: 900, fps: 30 }, "UG-Demo": { frames: 945, fps: 30 }, "UG-001": { frames: 18930, fps: 30 },
  "UG-002": { frames: 9773, fps: 30 }, "UG-003": { frames: 15251, fps: 30 }, "UG-004": { frames: 12971, fps: 30 }, "UG-005": { frames: 16960, fps: 30 },
  "REXUZ-YouTube": { frames: 5796, fps: 30 }, "UG-006-Assets": { frames: 1380, fps: 30 }, "UG-006": { frames: 21222, fps: 30 }, "REXUZ-Reel": { frames: 1350, fps: 30 }, };
let full: number;
let fps: number;
/** Shorts engine: "SH-<NAME>" → src/shorts/<name>/data.ts (TOTAL_FRAMES, 30 fps); "-Sheet" variants use the same length. */
const shortData = (() => {
  const m = /^SH-([A-Za-z0-9]+)/.exec(id);
  if (!m) return null;
  const file = `src/shorts/${m[1].toLowerCase()}/data.ts`;
  if (!fs.existsSync(file)) return null;
  const t = /TOTAL_FRAMES = (\d+)/.exec(fs.readFileSync(file, "utf8"));
  return t ? Number(t[1]) : null;
})();
if (STANDALONE[id]) {
  ({ frames: full, fps } = STANDALONE[id]);
} else if (shortData) {
  full = shortData;
  fps = 30;
} else {
  const project = parseProject(readJson(storyboardFile(id)));
  const captions = fs.existsSync(captionsFile(id)) ? normalizeCaptionsJson(readJson(captionsFile(id))) : null;
  full = projectTimeline(project, captions).totalFrames;
  fps = project.fps;
}
const total = Number(secs) > 0 ? Math.min(full, Math.round(Number(secs) * fps)) : full;
const count = Math.max(1, Math.min(Number(n), Math.ceil(total / 30)));
const size = Math.ceil(total / count);
const chunks = Array.from({ length: count }, (_, i) => {
  const a = i * size;
  const b = Math.min(total, a + size) - 1;
  return { i, range: `${a}-${b}` };
}).filter((c) => Number(c.range.split("-")[0]) < total);
console.log(JSON.stringify({ total, chunks }));
