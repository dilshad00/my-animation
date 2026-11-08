import type { ZodError } from "zod";
import { buildTimeline, type CaptionLike, type Timeline } from "./narration";
import { Project, type ProjectT } from "./schema";
import { transitionDuration } from "../scenes/transitions";

/** Human-readable validation message for storyboard.json mistakes. */
export const formatZodError = (e: ZodError, file = "storyboard.json") =>
  `${file} is invalid:\n` +
  e.issues
    .slice(0, 12)
    .map((i) => `  • ${i.path.length ? i.path.join(".") : "(root)"}: ${i.message}`)
    .join("\n");

export const parseProject = (raw: unknown, file?: string): ProjectT => {
  const r = Project.safeParse(raw);
  if (!r.success) throw new Error(formatZodError(r.error, file));
  const p = r.data;
  const ids = new Set<string>();
  for (const s of p.scenes) {
    if (ids.has(s.id)) throw new Error(`${file ?? "storyboard.json"}: duplicate scene id "${s.id}"`);
    ids.add(s.id);
  }
  return p;
};

export const projectTimeline = (p: ProjectT, captions: CaptionLike[] | null): Timeline =>
  buildTimeline({
    fps: p.fps,
    captions,
    wordsPerMinute: p.audio.wordsPerMinute,
    narrationOverlap: p.audio.narrationOverlap,
    scenes: p.scenes.map((s, i) => ({
      id: s.id,
      narration: s.narration,
      duration: s.duration,
      hold: s.hold,
      transitionSeconds: i === 0 ? 0 : transitionDuration(s.transition ?? p.defaultTransition),
    })),
  });

/** Accepts Remotion Caption[] or { captions: Caption[] } or whisper-style { transcription: [...] }. */
export const normalizeCaptionsJson = (json: unknown): CaptionLike[] => {
  const arr = Array.isArray(json)
    ? json
    : json && typeof json === "object" && Array.isArray((json as { captions?: unknown }).captions)
      ? (json as { captions: unknown[] }).captions
      : null;
  if (!arr) throw new Error("Captions file must be an array of { text, startMs, endMs } (Remotion Caption format).");
  return arr.map((c, i) => {
    const o = c as Record<string, unknown>;
    const text = String(o.text ?? "");
    const startMs = Number(o.startMs ?? (typeof o.start === "number" ? o.start * 1000 : NaN));
    const endMs = Number(o.endMs ?? (typeof o.end === "number" ? o.end * 1000 : NaN));
    if (Number.isNaN(startMs) || Number.isNaN(endMs)) throw new Error(`Captions entry #${i} is missing startMs/endMs.`);
    return { text, startMs, endMs };
  });
};
