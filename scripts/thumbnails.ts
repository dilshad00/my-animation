/**
 * Renders YouTube thumbnails (1280×720 JPG) from projects/<id>/thumbnails.json.
 * Each thumbnail is an engine scene (same art as the video) plus bold overlay text.
 *
 *   npm run thumbnails -- <project-id> [--only=t1,t2] [--full]   (--full = 1920×1080 PNG too)
 *
 * Output: renders/<project-id>-thumbnails/<thumb-id>.jpg
 */
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { ThumbFile } from "../src/utils/thumbnail-schema";
import { parseProject } from "../src/utils/project";
import { readJson, RENDERS_DIR, ROOT, storyboardFile } from "./lib/files";

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith("--"));
if (!id) {
  console.error("Usage: npm run thumbnails -- <project-id> [--only=t1,t2] [--full]");
  process.exit(1);
}
const onlyArg = args.find((a) => a.startsWith("--only="));
const only = onlyArg ? onlyArg.slice(7).split(",").filter(Boolean) : null;
const full = args.includes("--full");

const specFile = path.join(ROOT, "projects", id, "thumbnails.json");
if (!fs.existsSync(specFile)) {
  console.error(`No ${path.relative(ROOT, specFile)} yet.`);
  process.exit(1);
}
const project = parseProject(readJson(storyboardFile(id)));
const parsed = ThumbFile.safeParse(readJson(specFile));
if (!parsed.success) {
  console.error(`✗ thumbnails.json is invalid:\n${parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n")}`);
  process.exit(1);
}
const thumbs = parsed.data.thumbnails.filter((t) => !only || only.some((o) => t.id.startsWith(o)));
const outDir = path.join(RENDERS_DIR, `${id}-thumbnails`);
fs.mkdirSync(outDir, { recursive: true });

const main = async () => {
  console.log("Bundling…");
  const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src", "index.ts"), publicDir: path.join(ROOT, "public") });
  for (const spec of thumbs) {
    const inputProps = { spec, theme: project.theme, cast: project.cast, fps: project.fps };
    const composition = await selectComposition({ serveUrl, id: "Thumbnail", inputProps, timeoutInMilliseconds: 120000 });
    const frame = Math.round(spec.at * project.fps);
    const common = { composition, serveUrl, frame, inputProps, timeoutInMilliseconds: 120000 };
    const jpg = path.join(outDir, `${spec.id}.jpg`);
    await renderStill({ ...common, output: jpg, imageFormat: "jpeg", jpegQuality: 92, scale: 1280 / 1920 });
    if (full) await renderStill({ ...common, output: path.join(outDir, `${spec.id}-1080p.png`), imageFormat: "png" });
    const kb = Math.round(fs.statSync(jpg).size / 1024);
    console.log(`✓ ${path.relative(ROOT, jpg)}  (${kb} KB${kb > 2000 ? " – over YouTube's 2 MB limit!" : ""})`);
  }
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
