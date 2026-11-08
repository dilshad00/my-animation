/**
 * Where everything lives on disk. Shared by every script so the folder
 * layout is defined in exactly one place.
 *
 *   projects/<id>/script.md        voiceover script (one "## Scene" per scene)
 *   projects/<id>/storyboard.json  scenes + visuals (validated by storyboard.schema.json)
 *   projects/<id>/narration.mp3    your recorded voiceover (mp3/wav/m4a/…)
 *   projects/<id>/captions.json    word timestamps, written by `npm run transcribe`
 *   public/audio/<id>/narration.*  copy served to Remotion, written by `npm run sync`
 *   renders/<id>.mp4               final video
 */
import fs from "node:fs";
import path from "node:path";

export const ROOT = path.resolve(import.meta.dirname, "..", "..");
export const PROJECTS_DIR = path.join(ROOT, "projects");
export const PUBLIC_DIR = path.join(ROOT, "public");
export const RENDERS_DIR = path.join(ROOT, "renders");

export const NARRATION_EXT = ["mp3", "wav", "m4a", "aac", "ogg", "flac"];

export const projectDir = (id: string) => path.join(PROJECTS_DIR, id);
export const storyboardFile = (id: string) => path.join(projectDir(id), "storyboard.json");
export const scriptFile = (id: string) => path.join(projectDir(id), "script.md");
export const captionsFile = (id: string) => path.join(projectDir(id), "captions.json");

/** projects/<id>/narration.<ext>, or null if the voiceover hasn't been added yet. */
export const findNarration = (id: string): string | null => {
  const dir = projectDir(id);
  if (!fs.existsSync(dir)) return null;
  const f = fs.readdirSync(dir).find((n) => new RegExp(`^narration\\.(${NARRATION_EXT.join("|")})$`, "i").test(n));
  return f ? path.join(dir, f) : null;
};

/** Path (relative to public/) at which the narration is served to Remotion. */
export const servedNarration = (id: string, narrationFile: string) => `audio/${id}/narration${path.extname(narrationFile).toLowerCase()}`;

export const listProjectIds = (): string[] =>
  fs.existsSync(PROJECTS_DIR)
    ? fs
        .readdirSync(PROJECTS_DIR, { withFileTypes: true })
        .filter((d) => d.isDirectory() && fs.existsSync(storyboardFile(d.name)))
        .map((d) => d.name)
        .sort()
    : [];

export const readJson = (file: string): unknown => JSON.parse(fs.readFileSync(file, "utf8").replace(/^﻿/, ""));

export const rel = (p: string) => path.relative(ROOT, p).split(path.sep).join("/");

/** Parses "## Scene name" sections of a script.md. Lines starting with ">" or inside <!-- --> are notes, not narration. */
export const parseScript = (md: string): { title?: string; scenes: { name?: string; narration: string; notes: string[] }[] } => {
  const text = md.replace(/\r\n/g, "\n").replace(/<!--[\s\S]*?-->/g, "");
  let title: string | undefined;
  const scenes: { name?: string; narration: string; notes: string[] }[] = [];
  let cur: { name?: string; lines: string[]; notes: string[] } | null = null;
  const hasSceneHeadings = /^##\s/m.test(text);
  const flush = () => {
    if (cur) {
      const narration = cur.lines.join(" ").replace(/\s+/g, " ").trim();
      if (narration) scenes.push({ name: cur.name, narration, notes: cur.notes });
    }
    cur = null;
  };
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (/^#\s/.test(t)) {
      title = t.replace(/^#\s*/, "");
      continue;
    }
    if (/^##\s/.test(t)) {
      flush();
      cur = { name: t.replace(/^##\s*/, ""), lines: [], notes: [] };
      continue;
    }
    if (!t) {
      if (!hasSceneHeadings) flush(); // without headings, each paragraph is a scene
      continue;
    }
    cur ??= { lines: [], notes: [] };
    if (t.startsWith(">")) cur.notes.push(t.replace(/^>\s*/, ""));
    else cur.lines.push(t);
  }
  flush();
  return { title, scenes };
};
