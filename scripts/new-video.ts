/**
 * Creates (or fills in) a video project in projects/<id>/.
 *
 *   npm run new -- <project-id> "Video title"
 *
 * - If projects/<id>/script.md already exists, every "## Scene" section of it
 *   becomes one draft scene in storyboard.json (narration = that section).
 * - Otherwise a script.md template and a two-scene starter storyboard are written.
 * storyboard.json is never overwritten.
 */
import fs from "node:fs";
import path from "node:path";
import { draftScene, chartScene, projectTemplate, scriptTemplate, titleScene } from "../src/templates/storyboard";
import type { ElementT } from "../src/utils/schema";
import { parseScript, projectDir, rel, scriptFile, storyboardFile } from "./lib/files";

const positional = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const [id, titleArg] = positional;
if (!id || !/^[a-zA-Z0-9-]+$/.test(id)) {
  console.error('Usage: npm run new -- <project-id> "Video title" [--anime]\n(project-id: letters, numbers and dashes only; --anime = premium 2D anime style)');
  process.exit(1);
}
const sb = storyboardFile(id);
if (fs.existsSync(sb)) {
  console.error(`✗ ${rel(sb)} already exists – not overwriting.`);
  process.exit(1);
}
fs.mkdirSync(projectDir(id), { recursive: true });

const sf = scriptFile(id);
let title = titleArg ?? "Untitled video";
let scenes;
if (fs.existsSync(sf)) {
  const parsed = parseScript(fs.readFileSync(sf, "utf8"));
  title = titleArg ?? parsed.title ?? title;
  if (!parsed.scenes.length) {
    console.error(`✗ ${rel(sf)} has no narration. Add "## Scene" sections with text under them.`);
    process.exit(1);
  }
  scenes = parsed.scenes.map((s, i) => draftScene(i + 1, s.narration, s.name, s.notes));
  console.log(`Created ${scenes.length} draft scenes from ${rel(sf)}.`);
} else {
  fs.writeFileSync(sf, scriptTemplate(title));
  scenes = [titleScene(title, "Replace this with the first lines of your script."), chartScene()];
  console.log(`✓ Wrote ${rel(sf)} (template)`);
}

const project = projectTemplate(id, title, scenes);
if (process.argv.includes("--anime")) {
  // premium 2D anime style: anime environments + anime presenter (see docs/ANIME.md)
  const ANIME_ENVS = ["anime-city", "anime-rooftop", "anime-classroom", "anime-closeup", "anime-sky"];
  const TIMES = ["sunset", "day", "day", "day", "night"] as const;
  project.style = "anime";
  project.scenes.forEach((s, i) => {
    s.environment = { type: ANIME_ENVS[i % ANIME_ENVS.length], time: TIMES[i % TIMES.length] };
    const els = ((s.elements ?? []) as ElementT[]).map((e): ElementT => (e.kind === "character" ? { ...e, who: "hikari", x: 960, path: undefined, actions: undefined } : e));
    s.elements = els;
    els.forEach((e) => {
      if (e.kind === "text" && e.style === "title") e.style = "anime";
    });
  });
  console.log("✓ Anime style: style=anime, anime-* environments, presenter = hikari");
}
fs.writeFileSync(sb, JSON.stringify(project, null, 2) + "\n");
console.log(`✓ Created ${rel(sb)}`);
console.log(`  Next: npm run dev   (open "Videos/${id}")`);
console.log(`        add your voiceover as ${rel(path.join(projectDir(id), "narration.mp3"))}, then npm run transcribe -- ${id}`);
