/**
 * Renders the "premium 2D anime" style-kit sheets as 1920×1080 PNG stills.
 *
 *   npx tsx scripts/anime-assets.ts [--only=character,eye] [--frame=demo:450]
 *
 * --frame=<comp>:<n> renders frame n of a composition instead (QC of the demo).
 * Output: renders/anime-style-kit/<sheet>.png
 */
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";
import { RENDERS_DIR, ROOT } from "./lib/files";

const SHEETS = ["character", "expressions", "eye", "sunset", "night", "fx", "palette"];
const args = process.argv.slice(2);
const only = args.find((a) => a.startsWith("--only="))?.slice(7).split(",");
const frames = args.filter((a) => a.startsWith("--frame=")).map((a) => a.slice(8));
const outDir = path.join(RENDERS_DIR, "anime-style-kit");
fs.mkdirSync(outDir, { recursive: true });

const main = async () => {
  const serveUrl = await bundle({ entryPoint: path.join(ROOT, "src", "index.ts"), publicDir: path.join(ROOT, "public") });
  const jobs: { id: string; frame: number; props: Record<string, unknown>; out: string }[] = [];
  if (frames.length) {
    for (const spec of frames) {
      const [, n] = spec.split(":");
      jobs.push({ id: "Anime-Demo", frame: Number(n), props: {}, out: `demo-${n}.png` });
    }
  } else {
    for (const s of SHEETS.filter((s) => !only || only.includes(s))) jobs.push({ id: "Anime-Assets", frame: 0, props: { sheet: s }, out: `${s}.png` });
  }
  for (const j of jobs) {
    const composition = await selectComposition({ serveUrl, id: j.id, inputProps: j.props });
    const output = path.join(outDir, j.out);
    await renderStill({ composition, serveUrl, frame: j.frame, inputProps: j.props, output, imageFormat: "png", timeoutInMilliseconds: 120000 });
    console.log(`✓ ${path.relative(ROOT, output)}`);
  }
};
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
