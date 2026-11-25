/**
 * Preview stills for the REXUZ promo: npx tsx scripts/rexuz-stills.ts <outDir> <publicDir> <Comp:f,f,f> [<Comp:f,f>…]
 */
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const [outDir, publicDir, ...jobs] = process.argv.slice(2);
const main = async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const serveUrl = await bundle({ entryPoint: path.join(process.cwd(), "src", "index.ts"), publicDir });
  for (const job of jobs) {
    const [id, list] = job.split(":");
    const composition = await selectComposition({ serveUrl, id });
    for (const fr of list.split(",").map(Number)) {
      const file = path.join(outDir, `${id}-${String(fr).padStart(5, "0")}.jpg`);
      await renderStill({ composition, serveUrl, frame: fr, output: file, imageFormat: "jpeg", jpegQuality: 80, scale: 0.5 });
      console.log("ok", file);
    }
  }
};
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
