/**
 * Prints scene-relative word timings, for props that take seconds instead of cues
 * (map views, animatable environment props…).
 *
 *   npm run words -- <project-id> [s66,s80]   (scene-id prefixes; all scenes when omitted)
 */
import fs from "node:fs";
import { normalizeCaptionsJson, parseProject, projectTimeline } from "../src/utils/project";
import { captionsFile, readJson, storyboardFile } from "./lib/files";

const [id, filter] = process.argv.slice(2);
if (!id) {
  console.error("Usage: npm run words -- <project-id> [scene-prefix,…]");
  process.exit(1);
}
const project = parseProject(readJson(storyboardFile(id)));
const capFile = captionsFile(id);
if (!fs.existsSync(capFile)) {
  console.error(`No captions for ${id} yet. Run: npm run transcribe -- ${id}`);
  process.exit(1);
}
const timeline = projectTimeline(project, normalizeCaptionsJson(readJson(capFile)));
const prefixes = filter ? filter.split(",").filter(Boolean) : null;
timeline.scenes.forEach((s) => {
  if (prefixes && !prefixes.some((p) => s.id.startsWith(p))) return;
  const dur = s.durationInFrames / timeline.fps;
  console.log(`\n${s.id}  (${dur.toFixed(2)}s)`);
  console.log(s.words.map((w) => `${w.start.toFixed(2)} ${w.text}`).join("  "));
});
