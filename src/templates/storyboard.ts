/**
 * Starting points for new videos, used by `npm run new`.
 * Each scene template gives a scene a sensible first layout that you (or
 * Claude) then refine in storyboard.json.
 */
import type { ProjectInput } from "../utils/schema";

type SceneInput = ProjectInput["scenes"][number];

/** Background music + subtitles + transitions every new video starts with. */
export const projectTemplate = (id: string, title: string, scenes: SceneInput[]): ProjectInput & { $schema: string } => ({
  $schema: "../../storyboard.schema.json",
  id,
  title,
  topic: "",
  audio: {
    wordsPerMinute: 155,
    music: { src: "music/calm-explainer.wav", volume: 0.18, duckTo: 0.07 },
  },
  subtitles: { enabled: true, position: "bottom", maxWords: 7, size: 46 },
  cast: {},
  defaultTransition: { type: "fade", duration: 0.6 },
  scenes,
});

const ENV_CYCLE = ["studio", "city", "lab", "apartment", "forest", "space", "office", "ocean"];

export const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 30);

/** A draft scene for one script section: a presenter talking in a cycling environment. */
export const draftScene = (n: number, narration: string, name?: string, notes: string[] = []): SceneInput => ({
  id: `s${String(n).padStart(2, "0")}${name && slug(name) ? "-" + slug(name) : ""}`,
  notes: [name, ...notes].filter(Boolean).join(" — ") || "TODO: describe the visuals for this scene",
  narration,
  environment: { type: ENV_CYCLE[(n - 1) % ENV_CYCLE.length], time: "day" },
  elements: [{ kind: "character", who: "alex", x: 760, speaks: true, expressions: [{ t: 0, is: "happy" }] }],
});

/** Title-card scene: presenter walks in, title appears. */
export const titleScene = (title: string, narration: string): SceneInput => ({
  id: "s01-hook",
  notes: "Opening hook",
  narration,
  environment: { type: "city", time: "sunset" },
  camera: { keys: [{ t: 0, zoom: 1.2 }, { t: "end", zoom: 1, ease: "inOut" }] },
  elements: [
    { kind: "character", who: "alex", x: 300, path: [{ t: 0.3, x: 300 }, { t: 2.5, x: 820 }], speaks: true, expressions: [{ t: 0, is: "happy" }] },
    { kind: "text", text: title, style: "title", y: 230, at: 0.5 },
  ],
});

/** Presenter + chart scene, showing narration cues. */
export const chartScene = (): SceneInput => ({
  id: "s02-explain",
  notes: "Main explanation with a diagram",
  narration: "Use cues like the word energy to time animations to the narration.",
  // eslint-disable-next-line @remotion/non-pure-animation -- data, not a CSS transition
  transition: { type: "slide", direction: "left" },
  environment: { type: "studio" },
  elements: [
    { kind: "character", who: "drlee", x: 380, speaks: true, actions: [{ t: "@energy", do: "present" }] },
    { kind: "diagram", type: "bar", x: 1200, y: 480, at: "@energy", title: "Example chart", data: [{ label: "A", value: 3 }, { label: "B", value: 7 }, { label: "C", value: 5 }] },
  ],
});

/** script.md written for a brand-new project. */
export const scriptTemplate = (title: string) => `# ${title}

<!--
Voiceover script. Each "## Scene name" section is one scene.
The plain text under a heading is the narration: record it exactly as written.
Lines starting with ">" are visual notes and are not narrated.
-->

## Hook
> Presenter walks into a city at sunset, title appears.
Replace this with the first lines of your script.

## Explanation
> Presenter next to a chart.
Use cues like the word energy to time animations to the narration.
`;
