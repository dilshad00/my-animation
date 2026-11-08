/**
 * Validates a project without opening the Studio:
 *  - schema (types, required fields)
 *  - every environment / object / diagram / effect / character name exists
 *  - every narration cue ("@word") can be found in its scene
 *  - narration/captions exist and the transcript matches the script
 * Prints the scene timing table.
 *
 *   npm run validate -- <project-id>
 */
import fs from "node:fs";
import path from "node:path";
import { PRESETS } from "../src/components/characters/presets";
import { resolveTime } from "../src/utils/narration";
import { normalizeCaptionsJson, parseProject, projectTimeline } from "../src/utils/project";
import type { ElementT, TimeValue } from "../src/utils/schema";
import { CATALOG } from "../src/utils/catalog";
import { LOCAL_SFX, REMOTE_SFX } from "../src/utils/sfx";
import { captionsFile, findNarration, PUBLIC_DIR, readJson, rel, storyboardFile } from "./lib/files";

const id = process.argv[2];
if (!id) {
  console.error("Usage: npm run validate -- <project-id>");
  process.exit(1);
}
const file = storyboardFile(id);
if (!fs.existsSync(file)) {
  console.error(`✗ ${rel(file)} not found`);
  process.exit(1);
}

const errors: string[] = [];
const warnings: string[] = [];
let project;
try {
  project = parseProject(readJson(file), rel(file));
} catch (e) {
  console.error("✗ " + (e as Error).message);
  process.exit(1);
}
if (project.id !== id) warnings.push(`"id" (${project.id}) differs from the folder name (${id}).`);

const pub = (p: string) => path.join(PUBLIC_DIR, p);
const narration = findNarration(id);
const capFile = captionsFile(id);
const captions = fs.existsSync(capFile) ? normalizeCaptionsJson(readJson(capFile)) : null;
if (narration && !captions) warnings.push(`${rel(narration)} is not transcribed yet, so timing is estimated. Run: npm run transcribe -- ${id}`);
if (captions && !narration) errors.push(`${rel(capFile)} exists but there is no projects/${id}/narration.mp3`);
const musicCues = project.audio.music ? (Array.isArray(project.audio.music) ? project.audio.music : [project.audio.music]) : [];
const sceneIds = new Set(project.scenes.map((s) => s.id));
musicCues.forEach((m, i) => {
  if (!/^https?:/.test(m.src) && !fs.existsSync(pub(m.src))) errors.push(`Music file not found: public/${m.src}`);
  if (m.from && !sceneIds.has(m.from)) errors.push(`Music cue ${i + 1} ("${m.src}") starts at unknown scene "${m.from}".`);
  if (i > 0 && !m.from) errors.push(`Music cue ${i + 1} ("${m.src}") needs "from": the scene id where it starts.`);
});
const sfxKnown = (src: string) => /^https?:/.test(src) || (LOCAL_SFX as readonly string[]).includes(src) || src in REMOTE_SFX || fs.existsSync(pub(src));

const timeline = projectTimeline(project, captions);
warnings.push(...timeline.warnings);

const castNames = new Set([...Object.keys(PRESETS), ...Object.keys(project.cast)]);
project.scenes.forEach((scene, i) => {
  const timing = timeline.scenes[i];
  const ctx = { words: timing.words, duration: timing.durationInFrames / project.fps, sceneId: scene.id };
  const check = (v: TimeValue | undefined, where: string) => {
    if (v === undefined) return;
    try {
      const s = resolveTime(v, ctx);
      if (s > ctx.duration + 0.01) warnings.push(`Scene "${scene.id}" ${where}: time ${v} (${s.toFixed(2)}s) is after the scene ends (${ctx.duration.toFixed(2)}s).`);
    } catch (e) {
      errors.push(`${(e as Error).message} (${where})`);
    }
  };
  const env = scene.environment?.type;
  if (env && !CATALOG.environments.includes(env.toLowerCase())) errors.push(`Scene "${scene.id}": unknown environment "${env}".`);
  scene.camera?.keys?.forEach((k, j) => check(k.t, `camera.keys[${j}]`));
  scene.sfx?.forEach((c, j) => {
    check(c.at, `sfx[${j}]`);
    check(c.until, `sfx[${j}].until`);
    if (!sfxKnown(c.src)) errors.push(`Scene "${scene.id}" sfx[${j}]: unknown sound "${c.src}".`);
  });
  if (scene.transition?.sfx && !sfxKnown(scene.transition.sfx)) errors.push(`Scene "${scene.id}" transition: unknown sound "${scene.transition.sfx}".`);
  const walk = (els: ElementT[], prefix: string) =>
    els.forEach((el, j) => {
      const where = `${prefix}[${j}] (${el.kind}${"type" in el ? " " + el.type : ""}${"who" in el ? " " + el.who : ""})`;
      check(el.at, where + ".at");
      check(el.until, where + ".until");
      el.path?.forEach((k, n) => check(k.t, `${where}.path[${n}]`));
      if (el.kind === "character") {
        if (!castNames.has(el.who)) errors.push(`Scene "${scene.id}" ${where}: unknown character "${el.who}".`);
        el.actions?.forEach((a, n) => check(a.t, `${where}.actions[${n}]`));
        el.expressions?.forEach((a, n) => check(a.t, `${where}.expressions[${n}]`));
        if (Array.isArray(el.speaks)) el.speaks.forEach(([a, b]) => (check(a, where + ".speaks"), check(b, where + ".speaks")));
      }
      if (el.kind === "object" && !CATALOG.objects.includes(el.type.toLowerCase())) errors.push(`Scene "${scene.id}" ${where}: unknown object "${el.type}".`);
      if (el.kind === "diagram" && !CATALOG.diagrams.includes(el.type.toLowerCase())) errors.push(`Scene "${scene.id}" ${where}: unknown diagram "${el.type}".`);
      if (el.kind === "effect" && !CATALOG.effects.includes(el.type.toLowerCase())) errors.push(`Scene "${scene.id}" ${where}: unknown effect "${el.type}".`);
      if (el.kind === "image" && !fs.existsSync(pub(el.src))) errors.push(`Scene "${scene.id}" ${where}: image not found public/${el.src}`);
      if (el.kind === "group") walk(el.children, where + ".children");
    });
  walk(scene.elements, "elements");
});

const fmt = (f: number) => {
  const s = f / project.fps;
  return `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;
};
console.log(`\n${project.title}  (${id})`);
console.log(`Timing: ${timeline.mode === "captions" ? "from voiceover word timestamps" : `estimated at ${project.audio.wordsPerMinute} wpm (no voiceover yet)`}`);
console.log("─".repeat(72));
project.scenes.forEach((s, i) => {
  const t = timeline.scenes[i];
  console.log(`${String(i + 1).padStart(3)}. ${s.id.padEnd(28)} ${fmt(t.from).padStart(7)} → ${fmt(t.from + t.durationInFrames).padStart(7)}   ${(t.durationInFrames / project.fps).toFixed(1).padStart(5)}s  ${s.environment?.type ?? "studio"}`);
});
console.log("─".repeat(72));
console.log(`Total: ${fmt(timeline.totalFrames)}  (${timeline.totalFrames} frames @ ${project.fps}fps, ${project.width}×${project.height})\n`);
warnings.forEach((w) => console.log("⚠ " + w));
errors.forEach((e) => console.log("✗ " + e));
if (errors.length) {
  console.log(`\n${errors.length} error(s). Fix them before rendering.`);
  process.exit(1);
}
console.log("✓ Project is valid.");
