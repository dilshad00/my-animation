/**
 * Exports the narration from projects/<id>/script.md as plain text for a
 * text-to-speech tool (headings, visual notes and comments removed), and
 * prints word counts and estimated duration per section.
 *
 *   npm run script:text -- <project-id> [--wpm=150]
 *
 * Output: projects/<id>/narration.txt
 */
import fs from "node:fs";
import path from "node:path";
import { parseScript, projectDir, rel, scriptFile } from "./lib/files";

const args = process.argv.slice(2);
const id = args.find((a) => !a.startsWith("--"));
const wpm = Number(args.find((a) => a.startsWith("--wpm="))?.split("=")[1] ?? 150);
if (!id) {
  console.error("Usage: npm run script:text -- <project-id> [--wpm=150]");
  process.exit(1);
}
const file = scriptFile(id);
if (!fs.existsSync(file)) {
  console.error(`✗ ${rel(file)} not found`);
  process.exit(1);
}

const md = fs.readFileSync(file, "utf8");
const { title, scenes } = parseScript(md);
// keep paragraph breaks inside a section: they become natural pauses in TTS
const paragraphs = (name: string | undefined) => {
  const text = md.replace(/\r\n/g, "\n").replace(/<!--[\s\S]*?-->/g, "");
  const start = name ? text.indexOf(`## ${name}`) : 0;
  const after = text.slice(start).split("\n").slice(name ? 1 : 0);
  const end = after.findIndex((l) => /^##?\s/.test(l.trim()));
  return (end === -1 ? after : after.slice(0, end))
    .filter((l) => !l.trim().startsWith(">"))
    .join("\n")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
};

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, "0")}`;

let total = 0;
let clock = 0;
console.log(`\n${title ?? id}\n${"─".repeat(64)}`);
const out: string[] = [];
for (const s of scenes) {
  const w = words(s.narration);
  total += w;
  const dur = (w / wpm) * 60;
  console.log(`${fmt(clock).padStart(6)}  ${(s.name ?? "(untitled)").padEnd(40)} ${String(w).padStart(5)} words  ~${fmt(dur)}`);
  clock += dur;
  out.push(paragraphs(s.name).join("\n\n"));
}
console.log("─".repeat(64));
const lo = (total / 170) * 60;
const hi = (total / 140) * 60;
console.log(`Total: ${total} words  ≈ ${fmt((total / wpm) * 60)} at ${wpm} wpm  (range ${fmt(lo)}–${fmt(hi)} at 170–140 wpm)\n`);

const dest = path.join(projectDir(id), "narration.txt");
fs.writeFileSync(dest, out.join("\n\n") + "\n");
console.log(`✓ ${rel(dest)} – paste this into ElevenLabs`);
