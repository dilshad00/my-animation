// Generates projects/video-002/storyboard.json: project settings + all 118 scenes and the end card.
// Narration is read from timing.md by sentence number, so scene text always matches the recording.
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..");
const FILE = path.join(DIR, "storyboard.json");

const sentences = {};
const starts = {};
const ends = {};
const secs = (s) => s.split(":").reduce((a, p) => a * 60 + Number(p), 0);
for (const line of fs.readFileSync(path.join(DIR, "timing.md"), "utf8").split(/\r?\n/)) {
  const m = /^\|\s*(\d+)\s*\|\s*([\d:.]+)\s*\|\s*([\d:.]+)\s*\|\s*(.*?)\s*\|\s*$/.exec(line);
  if (m) {
    sentences[+m[1]] = m[4].replace(/\s*_\(pause.*?\)_/, "");
    starts[+m[1]] = secs(m[2]);
    ends[+m[1]] = secs(m[3]);
  }
}
const say = ([a, b = a]) => {
  const out = [];
  for (let i = a; i <= b; i++) out.push(sentences[i]);
  return out.join(" ");
};

// ── mix: every level comes from the file's measured loudness (dBFS) ──────────
const VOICE_RMS = -26.4;
const LOUD = {
  "strike-close": [-23.3, -11.3], "thunder-rumble": [-18, -8.6], "thunder-distant": [-21.1, -9.9], "storm-bed": [-26.1, -15.3],
  "wind-mountain": [-21.6, -18.2], "wind-hum": [-16.7, -11.2], "electric-blast": [-23.6, -11.5], "electric-hum": [-37.8, -33.9],
  glitch: [-43.5, -37.4], "whoosh-fast": [-26.1, -19.2], "whoosh-impact": [-25.6, -13.6], shockwave: [-19.7, -8.3], sea: [-16.2, -8.5],
  crowd: [-18.8, -14.2], army: [-14.6, -9.2], knock: [-21.5, -17.5], "door-close": [-18.4, -6.4],
};
const db = (x) => 10 ** (x / 20);
const round = (x) => Math.round(Math.min(1, x) * 1000) / 1000;
const src = (n) => `sfx/zeus/${n}.mp3`;
/** A one-shot under speech: 12 dB below the voice on average, loudest moment still under it. */
const fx = (n, at = 0) => ({ at, src: src(n), volume: round(Math.min(db(VOICE_RMS - 12 - LOUD[n][0]), db(-30 - LOUD[n][1]))) });
/** A looped bed under speech: 18 dB below the voice. */
const bed = (n, at = 0, until) => ({ at, src: src(n), loop: true, ...(until ? { until } : {}), volume: round(Math.min(db(VOICE_RMS - 18 - LOUD[n][0]), db(-34 - LOUD[n][1]))) });
/** A big hit placed in a gap between sentences: loud, but well under the voice's peak. */
const hit = (n, at) => ({ at, src: src(n), volume: round(db(-16 - LOUD[n][1])) });

const MUSIC_RMS = { "silent-descent": -19, fallen: -19.7, "epical-drums-01": -20.1, skyline: -17.3, "epical-drums-05": -21.6, "night-sky": -14.5 };
const music = (n, from) => ({ src: `music/zeus/${n}.mp3`, ...(from ? { from } : {}), volume: round(db(-34 - MUSIC_RMS[n])), duckTo: round(db(VOICE_RMS - 20 - MUSIC_RMS[n])) });

// ── helpers ─────────────────────────────────────────────────────────────────
const MYTH = { text: "GREEK MYTH", color: "#d9a441" };
const HYP = { text: "HYPOTHETICAL", color: "#5bc0eb" };
const REAL = { text: "REAL FACT", color: "#ffffff" };
const GOLD = "#f2c14e";
const ELEC = "#bfe3ff";
const INK = "#17110d";

const push = (z0, z1, x0 = 960, y0 = 540, x1 = x0, y1 = y0) => ({ keys: [{ t: 0, zoom: z0, x: x0, y: y0 }, { t: "end", zoom: z1, x: x1, y: y1, ease: "smooth" }] });
const shake = (cam, n = 10) => ({ ...cam, shake: n });
const FADE = { type: "fade", duration: 0.35 };
const CUT = { type: "none" };
const FLASH = { type: "fade", duration: 0.2 };
const WHIP = { type: "whip", duration: 0.35, direction: "left" };

const text = (t, at, y, o = {}) => ({ kind: "text", text: t, style: "headline", at, x: 960, y, enter: "rise", ...o });
const label = (t, at, o = {}) => ({ kind: "text", text: t, style: "label", at, x: 960, y: 120, enter: "fade", ...o });
const obj = (type, x, y, scale, o = {}) => ({ kind: "object", type, x, y, scale, ...o });
const eff = (type, x, y, o = {}) => ({ kind: "effect", type, x, y, ...o });
const who = (w, x, o = {}) => ({ kind: "character", who: w, x, ...o });
const vase = (x, props = {}, o = {}) => obj("vasefigure", x, 960, o.scale ?? 1, { props, ...o });
const icon = (name, x, y, at, scale = 1.6, color) => obj("icon", x, y, scale, { at, enter: "pop", screen: true, props: { name }, ...(color ? { color } : {}) });
const orb = (x, y, at, until, o = {}) => obj("lightorb", x, y, 1, { at, ...(until ? { until, exit: "fade" } : {}), enter: "fade", color: "#ffe9a8", props: { r: 32 }, ...o });
const map = (views, extra = {}) => ({ kind: "diagram", type: "map", x: 960, y: 540, width: 1920, height: 1080, at: 0, data: { views, ...extra } });

/** Giant Zeus with the arc flicker that is his signature in every modern scene. */
const ZEUS_SCALE = 1.7;
const zeus = (x, o = {}) => {
  const scale = o.scale ?? ZEUS_SCALE;
  return [who("zeus", x, { scale, ...o }), eff("arcs", x, o.y ?? 880, { width: 260 * scale, height: 620 * scale, color: ELEC, zIndex: 40, ...(o.at ? { at: o.at } : {}) })];
};
const zeusFace = (o = {}) => [who("zeus", 960, { y: 1720, scale: 4, expression: "neutral", ...o }), eff("arcs", 960, 1500, { width: 900, height: 1400, color: ELEC, zIndex: 40 })];

const FIELD = { type: "frieze" };
const NIGHT = (type, extra = {}) => ({ type, time: "night", ...extra });
const DAY = (type, extra = {}) => ({ type, time: "day", ...extra });
const DAWN = (type, extra = {}) => ({ type, time: "dawn", ...extra });
const STUDIO = (color = "#141b2e") => ({ type: "gradient", color, props: { color2: "#05070d" } });
const BLACK = { type: "gradient", color: "#04050a", props: { color2: "#000000" } };

const project = {
  $schema: "../../storyboard.schema.json",
  id: "video-002",
  title: "What If Zeus Returned Today?",
  topic: "Greek myth as the rulebook for a clearly fictional modern-day return of Zeus.",
  fps: 30,
  width: 1920,
  height: 1080,
  theme: { accent: "#f2c14e", accent2: "#5bc0eb", text: "#ffffff", dark: "#0d1321", font: "Poppins" },
  audio: {
    wordsPerMinute: 159,
    narrationOverlap: 1,
    music: [
      music("silent-descent"),
      music("fallen", "s028-village"),
      music("epical-drums-01", "s057-titanwar"),
      music("fallen", "s067-globe"),
      music("skyline", "s078-poseidon"),
      music("epical-drums-05", "s098-three"),
      music("night-sky", "s106-wall"),
    ],
  },
  subtitles: { enabled: true, position: "bottom", maxWords: 7, size: 46 },
  defaultTag: HYP,
  cast: {
    zeus: { preset: "grandpa", name: "Zeus", outfit: "robe", hair: "long", hairColor: "#f4f4f4", beard: true, top: "#2c4a78", bottom: "#2c4a78", shoes: "#d9a877", skin: "#d9a877", accent: "#f2c14e", glasses: false },
    oldman: { preset: "grandpa", name: "The old man", outfit: "robe", hair: "long", hairColor: "#b9b4aa", beard: true, top: "#6b5a44", bottom: "#6b5a44", shoes: "#4a3b2c", skin: "#d9a877", accent: "#8d7a5f", glasses: false },
    poseidon: { preset: "marcus", name: "Poseidon", outfit: "robe", hair: "long", hairColor: "#1f7a7a", beard: true, top: "#177e89", bottom: "#0f5e68", accent: "#e8c547" },
    athena: { preset: "zoe", name: "Athena", outfit: "robe", headwear: "helmet", top: "#7c8a55", bottom: "#c7ccd4", accent: "#c7ccd4" },
    hephaestus: { preset: "ben", name: "Hephaestus", outfit: "overalls", beard: true, top: "#b5541a", bottom: "#5a3a26", accent: "#f2a33a" },
    hermes: { preset: "alex", name: "Hermes", outfit: "robe", top: "#2ec4b6", bottom: "#1b9c90", accent: "#f2c14e" },
    ares: { preset: "jordan", name: "Ares", outfit: "armor", headwear: "helmet", accent: "#c1121f" },
    reporter: { preset: "maya" },
    woman: { preset: "zoe", name: "Woman", hair: "bun", hairColor: "#8f8a84", outfit: "shirt", top: "#7a6a5a", bottom: "#4a4038", glasses: false },
    general: { preset: "marcus", name: "General", outfit: "suit", top: "#4b5a3a", bottom: "#3a472d", accent: "#f2c14e" },
    soldier: { preset: "jordan", name: "Soldier", outfit: "shirt", top: "#4f5a44", bottom: "#3d4635" },
    worshipper: { preset: "zoe", outfit: "robe", top: "#e8e3d6", bottom: "#d8d2c2" },
    worshipper2: { preset: "grandpa", outfit: "robe", top: "#d9d2c0", bottom: "#c7c0ae", glasses: false },
    technician: { preset: "alex", outfit: "hivis" },
    drlee: {}, priya: {}, ben: {}, maya: {},
  },
  defaultTransition: FADE,
  scenes: [],
};

/** Keep the recording's own pause after each scene, so the video runs at the voiceover's real pace. */
const PAUSE_KEEP = Number(process.env.PAUSE_KEEP ?? 0.5);
const holdAfter = (last, keep) => (starts[last + 1] === undefined ? 0 : Math.max(0, Math.round((starts[last + 1] - ends[last]) * keep * 100) / 100));
/** Scenes that end on a big hit keep their whole pause, so the hit has clear air. */
const HIT_SCENES = new Set(["s005-clock", "s060-nod", "s063-cairo", "s101-launch"]);

const S = (id, range, environment, camera, elements, o = {}) =>
  project.scenes.push({ id, narration: say(range), environment, camera, elements: elements.flat(), ...o, hold: holdAfter(range[1] ?? range[0], HIT_SCENES.has(id) ? 1 : PAUSE_KEEP) });

const CALM = { tag: "none" };

// ───────────────────── 1. COLD OPEN ─────────────────────
const globe = (flash, extra = []) => [obj("globe", 960, 540, 3.1, { color: "#0b1f3f", speed: 0.5 }), ...(flash ? [eff("flicker", 960, 540, { width: 790, intensity: flash, zIndex: 20 })] : []), ...extra];
S("s001-globe", [1], NIGHT("space"), push(1, 1.09), [globe(1, [text("45 FLASHES EVERY SECOND", "@forty-five", 120, { style: "subtitle", color: ELEC })])], { ...CALM, sfx: [bed("wind-hum")] });
S("s002-stops", [2], NIGHT("space"), push(1.09, 1.18), [globe(0, [eff("flicker", 960, 540, { width: 790, intensity: 1, zIndex: 20, until: "@stops", exit: "fade" })])], { ...CALM, transition: CUT });
S("s003-dark", [3], NIGHT("ocean", { weather: "storm", props: { beach: false } }), push(1.25, 1.05, 960, 400, 960, 540), [], { ...CALM, sfx: [bed("storm-bed"), fx("thunder-distant", 0.2)] });
S("s004-sat", [4], NIGHT("space"), push(1.05, 1.15), [obj("satellite", 620, 360, 1.5, { float: 12 }), obj("monitor", 1260, 620, 1.6, { props: { screen: "off" } }), text("0 FLASHES", 1, 460, { style: "label", x: 1260, color: "#ff5d5d" })], CALM);
const clk = (zoom) => [obj("clock", 960, 700, 2.4, { props: { fast: true } })];
S("s005-clock", [5, 7], STUDIO("#0a0d17"), push(1.0, 1.2), [clk(), text("TEN SECONDS", "@ten", 200, { until: "@minute", exit: "fade" }), text("A MINUTE", "@minute", 200, { until: "@hour", exit: "fade" }), text("AN HOUR", "@hour", 200)], { ...CALM, transition: CUT, hold: 0.1, sfx: [hit("strike-close", "end-0.75")] });
S("s006-bolt", [8], NIGHT("olympus"), shake(push(1.12, 1.0, 960, 480, 960, 540), 8), [eff("strike", 960, 215, { at: "@bolt", height: 1100, zIndex: 30 }), eff("whiteout", 960, 540, { at: "@bolt", intensity: 0.45, zIndex: 50 })], { ...CALM, transition: FLASH, sfx: [fx("thunder-rumble", 0.5)] });
S("s007-pillar", [9, 10], NIGHT("olympus"), push(1, 1.32, 960, 620, 960, 300), [eff("pillar", 960, 215, { height: 1500, width: 110, zIndex: 30 }), eff("embers", 960, 240, { width: 500, height: 600, zIndex: 31 }), text("9:00", "@minutes", 150, { style: "number", color: "#ffffff", x: 1540, size: 110 })], { ...CALM, transition: CUT, sfx: [bed("wind-mountain"), fx("electric-hum")] });
S("s008-figure", [11], NIGHT("olympus"), push(1.4, 1.7, 960, 300, 1090, 460), [eff("pillar", 960, 215, { height: 1500, width: 110, until: "@out", exit: "fade", zIndex: 30 }), eff("embers", 960, 240, { at: "@out", width: 600, height: 500 }), who("zeus", 1010, { y: 380, scale: 0.17, at: "@someone", enter: "fade", path: [{ t: 0, x: 1010, y: 380 }, { t: "end", x: 1130, y: 470 }], actions: [{ t: 0, do: "walk" }] })], { ...CALM, transition: CUT, sfx: [bed("wind-mountain")] });
S("s009-eras", [12], DAY("ancient", { weather: "cloudy" }), push(1.0, 1.15, 500, 540, 1500, 540), [vase(380, { pose: "stand", beard: true, crown: true }, { y: 900, scale: 0.75 }), text("c. 1300 BC", 0.1, 120, { style: "label", x: 380 }), obj("temple", 1020, 860, 0.6), text("MARBLE TEMPLES", "@three", 120, { style: "label", x: 1020 }), obj("sign", 1600, 860, 1.3, { props: { text: "MUSEUM" } })], { ...CALM, transition: FADE });
S("s010-title", [13, 14], NIGHT("olympus", { weather: "storm" }), shake(push(1.12, 1.0), 3), [eff("lightning", 960, 240, { width: 1300, height: 90, color: ELEC, zIndex: 4 }), text("WHAT IF ZEUS RETURNED TODAY?", "@Zeus", 500, { style: "title", color: GOLD, enter: "zoom", maxWidth: 1500, align: "center" })], { ...CALM, hold: 0.4, transition: { type: "wipe", duration: 0.35, direction: "right" }, sfx: [fx("whoosh-impact", "@Zeus-0.2")] });

// ───────────────────── 2. THE MYTHS ─────────────────────
const M = (id, range, cam, els, o = {}) => S(id, range, FIELD, cam, els, { tag: MYTH, grade: "warm", ...o });
M("s011-line", [15, 16], push(1, 1.06), [{ kind: "arrow", from: [960, 120], to: [960, 960], color: GOLD, thickness: 10, at: 0.2, build: 1.1 }, obj("scroll", 1400, 560, 1.15, { at: "@mythology", enter: "rise", props: { lines: ["Hesiod", "Homer", "Ovid"] } })], { sfx: [fx("whoosh-fast")], transition: { type: "wipe", duration: 0.4, direction: "down" } });
M("s012-stories", [17, 18], push(1.06, 1.16), [vase(620, { pose: "walk", beard: true, crown: true }), vase(1300, { pose: "strike", helm: true }, { flip: true }), text("STORIES, NOT HISTORY", "@stories", 240, { color: INK, enter: "pop" })], { transition: CUT });
M("s013-hesiod", [19], push(1.2, 1.0, 620, 600, 960, 540), [vase(460, { pose: "sit", beard: true, long: true }, { scale: 1 }), text("HESIOD, c. 700 BC", 0.2, 170, { style: "label", x: 500, color: INK }), vase(1160, { pose: "strike", crown: true, beard: true }, { scale: 0.75 }), vase(1520, { pose: "raise" }, { scale: 0.75, flip: true })]);
M("s014-cronus", [20], push(1.0, 1.16, 960, 640, 960, 500), [obj("shadowking", 960, 1000, 0.95), ...[0, 1, 2, 3].map((i) => orb(560 + i * 260, 780 - i * 40, 1 + i * 1.1, 1.8 + i * 1.1, { path: [{ t: 0, y: 780 - i * 40 }, { t: 4, y: 280 }] }))], { transition: CUT });
M("s015-stone", [21, 22], push(1.0, 1.12, 700, 620), [vase(420, { pose: "reach", long: true }), obj("shadowking", 1320, 1000, 0.82), obj("clothstone", 760, 500, 1, { at: "@stone", enter: "pop", until: "@swallowed", exit: { type: "zoom", duration: 0.2 }, path: [{ t: "@stone", x: 760, y: 500 }, { t: "@swallowed", x: 1300, y: 340 }] })]);
M("s016-cave", [23], push(1.15, 1.0), [obj("lightorb", 960, 600, 1.5, { color: "#fff1b8", props: { r: 46 } }), text("ZEUS", 0.4, 300, { color: INK, enter: "fade" })], { transition: { type: "iris", duration: 0.4 } });
M("s017-war", [24], shake(push(1.0, 1.1, 500, 540, 1420, 540), 4), [[220, 560, 900].map((x, i) => vase(x, { pose: i % 2 ? "strike" : "walk", crown: i === 2, beard: i === 2 })), [1240, 1540, 1860].map((x, i) => vase(x, { pose: i % 2 ? "raise" : "strike", helm: true }, { flip: true })), text("10 YEARS", "@ten", 180, { color: INK, style: "headline" })].flat(), { sfx: [fx("army", 1)] });
M("s018-cyclopes", [25], push(1.0, 1.15), [vase(460, { pose: "strike", long: true, eye: "#ffb703" }, { scale: 1.1 }), vase(1320, { pose: "raise", crown: true, beard: true }, { flip: true }), obj("thunderbolt", 1100, 360, 1, { at: "@thunderbolt-0.7", enter: "zoom" }), eff("whiteout", 960, 540, { at: "@thunderbolt", intensity: 0.5, zIndex: 40, color: "#fff7cf" })], { sfx: [fx("electric-blast", "@thunderbolt-0.1")] });
M("s019-metis", [26, 27], push(1.0, 1.12), [vase(460, { pose: "sit", crown: true, beard: true }), vase(1260, { pose: "stand", long: true }, { flip: true }), obj("lightorb", 1260, 560, 1.2, { at: 0.2, enter: "fade", color: "#c9f2ff", props: { r: 40 } }), vase(1540, { pose: "stand", crown: true }, { flip: true, at: "@son", enter: "fade", opacity: 0.45, scale: 1.2 })]);
M("s020-swallow", [28, 29], push(1.0, 1.15), [obj("shadowking", 720, 1000, 0.72, { at: 0.1, enter: "fade", opacity: 0.55, props: { eyes: "#ffb703" } }), vase(720, { pose: "reach", crown: true, beard: true }), obj("lightorb", 1240, 560, 1.2, { color: "#c9f2ff", props: { r: 40 }, until: "@swallowed", exit: { type: "zoom", duration: 0.25 } })], { transition: CUT });
M("s021-replace", [30], push(1.0, 1.22, 960, 640), [vase(760, { pose: "sit", crown: true, beard: true }), obj("shadowking", 1290, 1000, 0.9, { enter: "fade", opacity: 0.6 })]);
M("s022-beggar", [31, 32], push(1.1, 1.0, 620, 540, 1200, 540), [vase(1000, { pose: "walk", long: true }), obj("glow", 1000, 620, 1, { opacity: 0 }), eff("glow", 1000, 620, { width: 560, height: 800, color: "#ffe39a" }), text("“All strangers and beggars are from Zeus.”", "@Odyssey", 200, { style: "subtitle", color: INK, maxWidth: 1300 })].filter((x) => x.type !== "glow" || x.kind !== "object"), { transition: FADE });
M("s023-lycaon", [33], shake(push(1.0, 1.1), 3), [vase(480, { pose: "sit", crown: true }), obj("covereddish", 900, 700, 1, { at: 0.8, enter: "pop" }), vase(1400, { pose: "raise", beard: true, crown: true }, { flip: true, at: "@served", enter: "fade" }), eff("duststorm", 960, 720, { at: "@flood", width: 2200, height: 900, color: "#3a7da2", zIndex: 30 })], { sfx: [fx("thunder-rumble", "@flood-0.3")] });
M("s024-cottage", [34], push(1.05, 1.0, 960, 680, 960, 500), [obj("hut", 960, 960, 1.6, { until: "@temple-0.1", exit: "fade" }), vase(540, { pose: "stand", long: true }, { scale: 0.75 }), vase(370, { pose: "stand", beard: true, long: true }, { scale: 0.75 }), obj("temple", 960, 960, 1.0, { at: "@temple", enter: "rise" })]);
M("s025-gods", [35], push(1.1, 1.3), [vase(760, { pose: "stand", beard: true, crown: true }), vase(1180, { pose: "stand" }, { flip: true }), eff("glow", 960, 620, { width: 1200, height: 900, color: "#ffe39a" })], { transition: CUT });
M("s026-door", [36, 37], push(1.0, 1.1, 960, 620), [obj("hut", 960, 960, 1.9), obj("door", 960, 960, 0.75, { color: INK, props: { lit: 1 } })], { grade: "dramatic", vignette: 0.75 });
S("s027-invented", [38, 39], DAWN("olympus"), push(1, 1.08), [obj("scroll", 960, 520, 1.5, { until: "@ours", exit: "fade", props: { lines: ["the ancient stories end"] } }), text("EVERYTHING FROM HERE IS INVENTED", "@invented-0.6", 480, { style: "headline", maxWidth: 1400, align: "center" })], { tag: HYP, transition: { type: "fade", duration: 0.5 }, sfx: [fx("whoosh-impact", 0.2)] });

// ───────────────────── 3. THE ARRIVAL ─────────────────────
const VIEW = { grade: "cool" };
S("s028-village", [40], DAWN("village", { weather: "cloudy" }), push(1.08, 1.0, 900, 520, 1100, 540), [text("LITOCHORO", 0.2, 150, { style: "label" })], { ...VIEW, sfx: [bed("wind-mountain")] });
S("s029-witness", [41], DAWN("village", { weather: "fog" }), push(1.15, 1.0, 1300, 560, 1000, 500), [zeus(1250, { actions: [{ t: 0, do: "walk" }], path: [{ t: 0, x: 1250 }, { t: "end", x: 1050 }], y: 880 }), who("maya", 420, { actions: [{ t: 0, do: "point" }], expression: "surprised", look: "right" }), who("ben", 640, { expression: "worried", actions: [{ t: 0, do: "point" }] }), obj("car", 180, 880, 0.75)], { ...VIEW, sfx: [fx("electric-hum")] });
const phones = (dead) => [0, 1, 2, 3, 4, 5, 6].map((i) => obj("phone", 260 + i * 233, 460 + (i % 2) * 180, 2, { props: { screen: dead && i < 7 ? "off" : "video" }, at: 0 }));
S("s030-phones", [42], STUDIO("#0c1119"), push(1.0, 1.25), [phones(false).map((p, i) => ({ ...p, until: `@dies-${0.5 - i * 0.07}`, exit: "fade" })), phones(true)], { ...VIEW, transition: CUT, sfx: [{ ...fx("glitch", "@dies-0.3"), volume: 0.35 }, { ...fx("glitch", "@dies"), volume: 0.35 }] });
S("s031-billion", [43], STUDIO("#0c1119"), push(1.3, 1.0), [[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => obj("tv", 330 + (i % 3) * 630, 200 + Math.floor(i / 3) * 280, 0.8, { at: 0.2 + i * 0.25, enter: "pop" })), { kind: "diagram", type: "counter", x: 960, y: 960, width: 1000, height: 150, at: "@billion-1", build: 1.4, data: { from: 1000, to: 1000000000, label: "screens" } }], { ...VIEW });
S("s032-fake", [44], STUDIO("#0c1119"), push(1.0, 1.1), [[0, 1, 2, 3, 4, 5].map((i) => text("FAKE", `@fake-${(5 - i) * 0.32}`, 230 + (i % 2) * 300, { x: 300 + i * 260, color: "#ff5d5d", enter: "pop", rotate: -10 + i * 5, style: "headline" }))], { ...VIEW, transition: CUT });
S("s033-route", [45], STUDIO("#0c1119"), push(1, 1.05), [map([{ t: 0, center: [22.4, 39.9], zoom: 28 }, { t: 5.5, center: [23.2, 38.6], zoom: 22 }], { route: [[22.35, 40.09], [22.6, 39.6], [22.9, 38.95], [23.72, 37.98]], labels: [{ lon: 22.35, lat: 40.25, text: "Mount Olympus", at: 0 }, { lon: 23.72, lat: 37.8, text: "Athens", at: 3 }] }), obj("stormhand", 960, 330, 0.7, { at: 1, enter: "fade", screen: true, zIndex: 20, path: [{ t: 1, x: 760, y: 210 }, { t: "end", x: 1160, y: 410 }] })], { ...VIEW, sfx: [fx("thunder-rumble", 0.4)] });
S("s034-gatherer", [46, 47], { type: "gradient", color: "#2b3350", props: { color2: "#0a0d17" } }, push(1, 1.14), [obj("stormhand", 960, 400, 1.05), text("CLOUD-GATHERER", "@Cloud-gatherer", 560, { style: "title", color: GOLD, enter: "zoom", size: 120 })], { tag: MYTH, transition: CUT });
S("s035-athens", [48], DAY("ruins", { weather: "cloudy", props: { columns: 0 } }), push(1.0, 1.08, 800, 540, 1150, 540), [zeus(1250, { path: [{ t: 0, x: 1400 }, { t: "end", x: 1050 }], actions: [{ t: 0, do: "walk" }], y: 880 }), ...[420, 620, 830, 1660].map((x) => who(["maya", "ben", "priya", "drlee"][[420, 620, 830, 1660].indexOf(x)], x, { y: 900, scale: 0.85, expression: "surprised" }))], { ...VIEW, sfx: [bed("crowd")] });
S("s036-build", [49], DAY("ruins", { props: { city: false, built: [[0, 0], [3, 1]], columns: 15 } }), push(1.0, 1.08), [{ kind: "diagram", type: "timeline", x: 960, y: 150, width: 1400, height: 200, at: 0.1, build: 2.6, data: [{ label: "515 BC", text: "begun" }, { label: "AD 131", text: "finished" }] }], { tag: REAL });
S("s037-fifteen", [50], DAY("ruins", { props: { columns: [[0, 15]] } }), push(1.05, 1.2, 860, 500, 1040, 520), [text("15 COLUMNS STILL STAND", "@fifteen", 150, { style: "headline" })], { tag: REAL, transition: CUT });
S("s038-palm", [51], NIGHT("ruins", { props: { city: true } }), push(1.0, 1.14, 960, 520), [zeus(900, { scale: 1.45, y: 880, actions: [{ t: 0, do: "point", angle: 0 }] }), eff("sparkles", 960, 240, { width: 1800, height: 400, intensity: 1.2 })], { ...VIEW, vignette: 0.45, sfx: [bed("wind-mountain")] });
S("s039-sunrise", [52, 53], DAWN("ruins"), push(1.0, 1.16, 960, 600, 860, 480), [zeus(900, { scale: 1.45, y: 880, speaks: false, look: "camera" }), who("drlee", 1480, { y: 890, scale: 0.9, actions: [{ t: 0, do: "think" }], look: "left" })], { ...VIEW });
S("s040-question", [54], BLACK, push(1.0, 1.05), [text("Who is left?", 0.15, 500, { style: "title", enter: "fade" })], { ...CALM, tag: HYP, transition: CUT, hold: 0.3 });

// ───────────────────── 4. THE WORLD HE FINDS ─────────────────────
S("s041-olympia", [55, 56], DAY("olympia"), push(1.2, 1.0, 960, 700, 960, 480), [obj("shadowking", 960, 720, 0.48, { color: "#e9c46a", opacity: 0.55, enter: "fade", exit: "fade", until: "@gone-0.4", props: { eyes: "#ffffff", crown: false } }), text("STATUE OF ZEUS: LOST", "@gone", 140, { style: "label" })], { tag: REAL, transition: FADE });
S("s042-faithful", [57, 58], DAY("ruins"), push(1.08, 1.0), [who("worshipper", 620, { y: 890 }), who("worshipper2", 830, { y: 890 }), who("worshipper", 1040, { y: 890, flip: true }), text("RECOGNISED IN 2017", "@two", 150, { style: "label" })], { tag: REAL });
S("s043-tears", [59, 60], DAY("ruins"), push(1.0, 1.1, 800, 500), [who("worshipper", 620, { y: 890, actions: [{ t: 0, do: "react" }], expression: "sad", look: "up" }), who("worshipper2", 830, { y: 890, expression: "sad", look: "up" }), zeus(1340, { flip: true, y: 880, expression: "sad", look: "left" })], { transition: CUT });
S("s044-up", [61, 62], DAY("gradient", { color: "#1a2f5e", props: { color2: "#020612" } }), push(1, 1.12, 960, 560), [[0, 1, 2, 3, 4, 5, 6, 7].map((i) => obj("satellite", -80, 110 + i * 92, 0.42 + (i % 3) * 0.08, { at: "@machines-0.6", path: [{ t: 0, x: -200 + i * 140 }, { t: "end", x: 1500 + i * 90 }] }))], {});
S("s045-tv", [63], DAY("studio", { color: "#1b2640" }), push(1.08, 1.0), [obj("tv", 660, 560, 2.5), who("priya", 660, { y: 770, scale: 0.72, actions: [{ t: 0, do: "present" }], speaks: true }), obj("altar", 1420, 880, 1.3), text("RAIN: 40%", 1, 180, { x: 660, style: "label", color: GOLD })], { transition: FADE });
S("s046-rod", [64, 65], DAY("city", { weather: "cloudy" }), push(1.0, 1.25, 1000, 540, 1140, 380), [obj("lightningrod", 1120, 960, 1.4), who("technician", 830, { y: 840, actions: [{ t: 0, do: "point" }], look: "right" }), zeus(1600, { y: 960, flip: true, look: "left", expression: "thinking" })], {});
S("s047-rod2", [66], NIGHT("city", { weather: "storm" }), shake(push(1.0, 1.15, 1100, 450, 1100, 700), 3), [obj("lightningrod", 1120, 960, 1.4), eff("strike", 1120, 515, { at: 1.2, height: 1200, zIndex: 30 }), eff("strike", 1120, 515, { at: 3.0, height: 1200, zIndex: 30, seed: 2 }), text("SINCE THE 1750s", "@seventeen", 150, { style: "label" })], { tag: REAL, sfx: [fx("electric-blast", 1.1)] });
S("s048-wires", [67, 68], { type: "cutaway", props: { mode: "street", liquid: "#3d8fc4", level: 0 } }, push(1.0, 1.18, 960, 300, 1280, 700), [eff("energy", 960, 760, { width: 1800, color: ELEC }), obj("phone", 1470, 640, 1.8, { at: "@phones", enter: "pop", props: { screen: "globe" } }), obj("battery", 1200, 660, 1.3, { at: "@phones", enter: "pop", props: { level: 0.8 } })], {});
M("s049-prometheus", [69], shake(push(1.0, 1.1), 2), [vase(620, { pose: "reach", beard: true }, { y: 960 }), eff("fire", 830, 460, { width: 110, height: 180 }), vase(1320, { pose: "stand", beard: true }, { flip: true, at: "@chained", enter: "fade" }), obj("rock", 1320, 1000, 1.6, { at: "@chained" }), obj("bird", 1560, 420, 1.4, { at: "@eagle", enter: "slideLeft", color: INK })], { transition: { type: "wipe", duration: 0.3 }, sfx: [fx("whoosh-fast")] });
S("s050-face", [70, 72], BLACK, push(1, 1.12), [zeusFace({ look: "camera" }), icon("drop", 200, 200, 99), eff("fire", 610, 470, { width: 130, height: 230, at: "@fire", zIndex: 41 }), obj("thunderbolt", 1310, 330, 0.78, { at: "@lightning", enter: "zoom", screen: true, zIndex: 41 })].filter((e) => !(e.kind === "object" && e.type === "icon")), { transition: FADE, sfx: [fx("electric-blast", "@lightning-0.1")] });

// ───────────────────── 5. GOVERNMENTS ─────────────────────
S("s051-council", [73, 76], { type: "hall", time: "day", props: { kind: "council" } }, push(1.0, 1.12), [who("general", 620, { y: 690, scale: 0.8, actions: [{ t: 0, do: "talk" }] }), who("priya", 960, { y: 690, scale: 0.8 }), who("drlee", 1300, { y: 690, scale: 0.8 }), text("EMERGENCY SESSION", "@Emergency", 200, { until: "@Closed", exit: "fade", color: "#ff7070" }), text("AIRSPACE CLOSED", "@Closed", 200, { until: "@Statements", exit: "fade", color: "#ffd166" }), text("OFFICIAL STATEMENT: ████ ████████ ██", "@Statements", 200, { style: "subtitle", maxWidth: 1500 })], { sfx: [bed("crowd")] });
S("s052-scientists", [77, 78], DAY("lab", { color: "#2bd9fe" }), push(1.0, 1.12, 800, 540, 1100, 500), [zeus(1380, { y: 900 }), who("drlee", 520, { actions: [{ t: 0, do: "type" }], look: "right" }), obj("gauge", 880, 400, 1.2, { props: { value: [[0, 0.2], [3, 1]], label: "ENERGY" }, at: "@energy-1.2", enter: "pop", screen: true })], { sfx: [fx("electric-hum")] });
S("s053-report", [79, 80], STUDIO("#0c1119"), push(1.0, 1.22), [obj("newspaper", 960, 620, 2, { props: { masthead: "INTERNATIONAL PANEL", headline: "Findings after one month", date: "Final report" }, until: "@We-0.1", exit: "fade" }), text("WE DO NOT KNOW WHAT THIS IS", "@We", 480, { style: "title", maxWidth: 1450, align: "center", color: "#ffffff" })], {});
S("s054-lawyers", [81, 82], DAY("office"), push(1.0, 1.08), [who("ben", 600, { actions: [{ t: 0, do: "talk" }], speaks: false, expression: "angry" }), who("priya", 1320, { flip: true, actions: [{ t: 2, do: "shrug" }], expression: "thinking" }), obj("sign", 960, 880, 1.5, { props: { text: "ACT OF GOD?" }, at: "@act", enter: "drop" })], { transition: { type: "slide", duration: 0.3, direction: "left" } });
const shrineRow = (at) => [["temple", 300], ["house", 760], ["temple", 1180], ["castle", 1620]].map(([t, x], i) => obj(t, x, 830, t === "temple" ? 0.5 : 0.55, { at: at + i * 0.3, enter: "rise" }));
S("s055-houses", [83, 84], { type: "gradient", color: "#6d4b2f", props: { color2: "#1d1410" } }, push(1, 1.14, 800, 540, 1120, 540), [shrineRow(0.1), { kind: "effect", type: "dust", x: 960, y: 540, intensity: 0.6 }, obj("bus", 1000, 960, 1.2, { at: "@millions", enter: "slideLeft" }), who("ben", 1520, { y: 960, at: "@millions", enter: "fade", actions: [{ t: 0, do: "walk" }] })], { grade: "warm" });
S("s056-general", [85, 86], { type: "hall", time: "night", props: { kind: "council" } }, push(1.0, 1.25, 960, 480), [who("general", 960, { y: 720, actions: [{ t: 0, do: "think" }], expression: "worried" }), text("What can he actually do?", "@What", 210, { style: "headline", color: GOLD })], { vignette: 0.5 });

// ───────────────────── 6. THE DEMONSTRATION ─────────────────────
S("s057-titanwar", [87, 88], { type: "frieze", color: "#b65a2e" }, shake(push(1.0, 1.12), 6), [vase(760, { pose: "raise", crown: true, beard: true }), obj("thunderbolt", 960, 340, 1, { at: "@holding", enter: "zoom" }), eff("fire", 300, 960, { width: 300, height: 420, at: "@seethed" }), eff("fire", 1620, 960, { width: 300, height: 420, at: "@seethed" }), eff("bubbles", 960, 960, { width: 1800, height: 620, at: "@boiled" })], { tag: MYTH, transition: { type: "wipe", duration: 0.3 }, sfx: [fx("thunder-rumble")] });
S("s058-kelvin", [89, 91], STUDIO("#141b2e"), push(1, 1.05), [{ kind: "diagram", type: "bar", x: 960, y: 590, width: 1100, height: 680, at: "@channel", build: 1.4, data: { items: [{ label: "Surface of the Sun", value: 5800, color: "#ffb703" }, { label: "Lightning channel", value: 30000, color: "#bfe3ff" }], unit: " K" } }, text("REAL LIGHTNING", 0.1, 130)], { tag: REAL });
const drones = (n, o) => Array.from({ length: n }).map((_, i) => obj("drone", 180 + (i % 6) * 300, 150 + Math.floor(i / 6) * 150, 0.72, { float: 10, ...o(i) }));
S("s059-drones", [92], DAY("ruins", { weather: "cloudy" }), push(1.0, 1.15, 960, 400), [zeus(960, { y: 880 }), drones(14, (i) => ({ at: 0.2 + i * 0.14, enter: "slideDown" }))], { sfx: [fx("whoosh-fast", 0.4)] });
S("s060-nod", [93], BLACK, { keys: [{ t: 0, zoom: 1, x: 960, y: 540 }] }, [zeusFace({ actions: [{ t: 0.1, do: "nod" }], look: "camera", expression: "confident" })], { transition: CUT, hold: 0.2, sfx: [hit("shockwave", "end-0.4")] });
S("s061-quake", [94, 95], DAY("olympus"), shake(push(1.08, 1.0), 16), [text("“One nod makes Olympus quake”", "@Homer", 150, { style: "subtitle" }), drones(14, (i) => ({ at: 0, until: "@Here", enter: "none", exit: { type: "drop", duration: 0.7 } })).map((d) => ({ ...d, path: [{ t: "@Here", y: d.y }, { t: "@sky", y: 1400, ease: "in" }] }))], { transition: CUT, sfx: [fx("thunder-rumble", 0.1)] });
S("s062-rock", [96], DAY("aegean"), push(1.05, 1.0, 620, 540, 1050, 540), [zeus(440, { y: 880, scale: 1.2, look: "right" })], { grade: "clean", sfx: [bed("sea")] });
S("s063-cairo", [97], DAY("aegean", { props: { island: 1 } }), shake(push(1.0, 1.0, 1100), 22), [eff("strike", 1200, 645, { height: 1400, width: 420, zIndex: 40 }), eff("whiteout", 960, 540, { intensity: 0.8, zIndex: 41, at: 0.05 }), text("VISIBLE FROM CAIRO", 0.2, 200, { style: "label", zIndex: 60 })], { transition: FLASH, hold: 0.3, sfx: [fx("thunder-distant", 0.1), hit("strike-close", "end-0.8")] });
S("s064-gone", [98], DAY("aegean", { weather: "fog", props: { island: 0, boil: [[0, 1], [3, 0]] } }), push(1, 1.1, 1200, 560), [eff("smoke", 1200, 640, { width: 500, height: 800, intensity: 0.6 })], { transition: CUT, sfx: [bed("sea")] });
S("s065-experts", [99, 100], { type: "hall", time: "night", props: { kind: "control" } }, push(1.05, 1.2, 960, 480), [who("drlee", 780, { y: 780, expression: "worried", look: "camera" }), who("general", 1120, { y: 780, flip: true, expression: "worried" }), text("NOBODY DIES", 0.1, 180, { style: "headline", color: "#ffffff", until: "@And", exit: "fade" })], {});
const isles = [[25.1, 37.1], [25.4, 36.4], [25.6, 37.6], [26.9, 37.6], [23.9, 36.8], [24.9, 36.2], [25.3, 37.9], [26.1, 36.7]];
S("s066-knew", [101, 102], STUDIO("#0c1119"), push(1, 1.08), [map([{ t: 0, center: [25.2, 37.2], zoom: 55 }, { t: 3.5, center: [25.2, 37.2], zoom: 70 }], { pins: isles.map(([lon, lat]) => ({ lon, lat, label: "", at: 0.2 })), markers: [{ lon: 24.3, lat: 37.55, object: "icon", size: 0.9, at: 1.5 }], labels: [{ lon: 24.3, lat: 37.8, text: "the empty island", at: 1.7 }] }), text("He knew.", "@knew-0.1", 900, { style: "title", color: GOLD })], {});

// ───────────────────── 7. FAITH AND POWER ─────────────────────
const candles = (n, y) => Array.from({ length: n }).map((_, i) => eff("fire", 140 + i * (1640 / (n - 1)), y, { width: 44, height: 84, at: 0.1 * i, enter: "fade" }));
const W = { grade: "warm" };
S("s067-globe", [103, 104], NIGHT("space"), push(1, 1.1), [obj("globe", 960, 540, 3.1, { color: "#16233f", speed: 0.5 }), eff("fireflies", 960, 540, { width: 760, height: 760, color: "#ffd9a0", intensity: 1.4, zIndex: 30 })], { ...W, transition: FADE });
S("s068-theologians", [105, 106], DAY("studio", { color: "#46311e" }), push(1, 1.1, 700, 540, 1200, 540), [who("drlee", 400, { y: 880, actions: [{ t: 0, do: "talk" }] }), who("priya", 860, { y: 880 }), who("marcus", 1320, { y: 880, actions: [{ t: 2, do: "nod" }] }), text("Enormous power is not the same thing as God.", "@Enormous", 170, { style: "subtitle", maxWidth: 1400 })], W);
S("s069-icons", [107, 109], DAY("studio", { color: "#46311e" }), push(1, 1.06), [{ kind: "diagram", type: "list", x: 960, y: 520, width: 1100, height: 500, at: "@parents-0.4", build: 2.8, data: [{ text: "He had parents", icon: "heart" }, { text: "He seized a throne", icon: "star" }, { text: "He never claimed to make the universe", icon: "cross" }] }], { ...W, transition: CUT });
S("s070-pray", [110], { type: "gradient", color: "#3a2412", props: { color2: "#150c06" } }, push(1, 1.12), [candles(9, 820), eff("glow", 960, 700, { width: 1800, height: 700, color: "#ffc98a", intensity: 0.6 })], W);
S("s071-leaders", [111, 112], { type: "hall", time: "day", props: { kind: "council" } }, push(1.0, 1.16), [[520, 800, 1080, 1360].map((x, i) => who(["general", "priya", "marcus", "ben"][i], x, { y: 690, scale: 0.8, expression: "worried" })), obj("shadowking", 960, 1000, 1.2, { at: "@strongest", enter: { type: "fade", duration: 1.5 }, opacity: 0.68, zIndex: 20, props: { crown: false } })], W);
S("s072-gifts", [113, 115], DAY("farm", { weather: "clear", props: { crop: 0.15 } }), push(1, 1.1), [obj("crate", 330, 840, 1.6, { at: "@gifts", enter: "pop" }), text("GIFTS", "@gifts", 150, { style: "label", x: 330 }), obj("newspaper", 960, 500, 1, { at: "@alliance", enter: "pop", props: { masthead: "TREATY", headline: "Alliance offered", date: "" } }), text("ALLIANCE", "@alliance", 150, { style: "label", x: 960 }), who("alex", 1500, { y: 900, at: "@rain-0.7", enter: "fade", look: "up", expression: "worried" }), text("RAIN", "@rain", 150, { style: "label", x: 1500 })], { ...W, transition: CUT });
S("s073-press", [116], { type: "hall", time: "day", props: { kind: "press" } }, push(1, 1.22, 620, 620, 560, 520), [who("reporter", 520, { y: 860, at: "@stands-0.5", actions: [{ t: "@stands", do: "think" }], look: "right" }), zeus(1430, { y: 880, flip: true })], { sfx: [bed("crowd")] });
const nameCard = (id, range, name, cam) => {};
S("s074-names", [117, 120], BLACK, push(1, 1.04), [text("Io", "@Io-0.05", 500, { style: "title", until: "@Europa-0.08", exit: "fade", enter: "fade" }), text("Europa", "@Europa-0.05", 500, { style: "title", until: "@Callisto-0.08", exit: "fade", enter: "fade" }), text("Callisto", "@Callisto-0.05", 500, { style: "title", until: "@Semele-0.08", exit: "fade", enter: "fade" }), text("Semele", "@Semele-0.05", 500, { style: "title", enter: "fade" })], { transition: CUT, tag: MYTH });
S("s075-women", [121], BLACK, push(1.04, 1.12), [text("Io    Europa    Callisto    Semele", 0.1, 500, { style: "headline", color: "#a8a8a8", enter: "fade" })], { transition: CUT, tag: MYTH });
S("s076-sorry", [122, 124], { type: "hall", time: "night", weather: "storm", props: { kind: "press" } }, push(1, 1.18, 1000, 520), [who("reporter", 520, { y: 860, speaks: false, look: "right" }), zeus(1430, { y: 880, flip: true, look: "left" }), text("Are you sorry?", 0.1, 170, { style: "headline", color: GOLD, until: "@In", exit: "fade" })], { vignette: 0.45, sfx: [bed("storm-bed")] });
S("s077-flat", [125, 127], STUDIO("#0c1119"), push(1, 1.05), [map([{ t: 0, center: [18, 38], zoom: 6 }, { t: 3.5, center: [18, 38], zoom: 7.5 }], { route: [[-5.4, 36.1], [3, 37.6], [12, 37], [20, 34], [28, 33.6], [35.5, 33.9]], labels: [{ lon: -5.4, lat: 35, text: "Gibraltar", at: "@Gibraltar" }, { lon: 35.5, lat: 32.5, text: "Beirut", at: "@Beirut" }] }), text("HE ISN'T ALONE", "@alone", 150, { color: GOLD })], { sfx: [bed("sea")] });

// ───────────────────── 8. THE OLYMPIANS ─────────────────────
S("s078-poseidon", [128], DAY("aegean", { weather: "wind", props: { island: 0 } }), push(1.08, 1.0, 960, 620, 960, 480), [who("poseidon", 960, { y: 930, scale: ZEUS_SCALE, path: [{ t: 0, y: 1500 }, { t: 3, y: 930, ease: "out" }], look: "camera" }), obj("trident", 1240, 930, 1.3, { path: [{ t: 0, y: 1500 }, { t: 3, y: 930, ease: "out" }] }), obj("boat", 400, 680, 1), obj("boat", 1600, 740, 1.2), text("POSEIDON", "@Poseidon", 150, { color: "#6fe3e0" })], { grade: "cool", transition: { type: "wipe", duration: 0.35 }, sfx: [bed("sea"), fx("thunder-rumble", 0.1)] });
const ports = [[-5.4, 36.1], [2.2, 41.4], [5.4, 43.3], [12.3, 41.7], [15.1, 37.5], [23.6, 37.9], [29, 41], [34.8, 32.1], [32.3, 31.2], [13.2, 32.9]];
S("s079-ports", [129], STUDIO("#0c1119"), push(1, 1.05), [map([{ t: 0, center: [16, 38], zoom: 5.5 }], { pins: ports.map(([lon, lat], i) => ({ lon, lat, label: "", at: 0.2 + i * 0.25 })) }), text("EVERY PORT CLOSED", "@closed-0.4", 150, { color: "#ff7070" })], { transition: CUT });
S("s080-athena", [130, 131], DAY("acropolis"), push(1.05, 1.0, 700, 560, 1000, 460), [who("athena", 620, { y: 900, scale: 1.45, actions: [{ t: 0, do: "walk" }], path: [{ t: 0, x: 400 }, { t: 1.2, x: 620 }] }), text("ATHENA", "@Athena", 130, { style: "label", color: "#d4dbc5" }), eff("explosion", 1050, 400, { at: "@shell", width: 760, zIndex: 20 }), text("1687", "@sixteen", 180, { style: "headline", x: 1500, color: "#ffffff", until: "@gunpowder+1", exit: "fade" })], { tag: REAL, sfx: [fx("thunder-distant", "@shell-0.1")] });
S("s081-scaffold", [132, 133], DAY("acropolis"), push(1.16, 1.0, 1100, 360, 960, 500), [who("athena", 1040, { y: 900, scale: 1.45, actions: [{ t: 0, do: "walk" }], path: [{ t: 0, x: 760 }, { t: "@Then", x: 1040 }], expression: "thinking", look: "right" }), obj("chip", 1560, 480, 2, { at: "@machines-0.3", enter: "pop", screen: true })], {});
M("s082-maidens", [134], push(1.05, 1.15), [vase(460, { pose: "strike", beard: true }, { scale: 1 }), eff("fire", 200, 960, { width: 200, height: 320 }), [960, 1300, 1640].map((x, i) => vase(x, { pose: "stand", long: true, eye: "#ffd166" }, { color: "#b58617", at: `@golden+${i * 0.3}`, enter: "fade", flip: true }))], { transition: { type: "wipe", duration: 0.3 }, sfx: [fx("whoosh-fast")] });
S("s083-robot", [135], DAY("lab", { color: "#ffb347" }), push(1, 1.14, 960, 480), [who("hephaestus", 640, { y: 900, scale: 1.45, actions: [{ t: 0, do: "walk" }, { t: "@laughs-0.3", do: "cheer" }], expressions: [{ t: "@laughs-0.3", is: "joy" }], look: "right" }), obj("robot", 1280, 900, 1.6, { at: 0.3, enter: "pop" })], {});
S("s084-hermes", [136], DAY("office"), push(1, 1.28, 700, 540, 880, 480), [who("hermes", 720, { y: 880, actions: [{ t: 0, do: "type" }], until: "@internet", exit: { type: "zoom", duration: 0.4 } }), obj("phone", 960, 640, 1.6, { at: 0.3, enter: "pop", props: { screen: "video" } }), obj("calendar", 1500, 540, 0.8, { at: "@seen-0.4", enter: "pop", screen: true, props: { day: 7, label: "DAY", from: "1", tearAt: 0.3 } })], { transition: CUT });
S("s085-ares", [137, 139], DAY("desert", { weather: "wind" }), { keys: [{ t: 0, zoom: 1.25, x: 760, y: 520 }, { t: "end", zoom: 1.0, x: 1240, y: 540, ease: "smooth" }] }, [who("ares", 620, { y: 900, scale: 1.45, path: [{ t: 0, x: 620 }, { t: "end", x: 1300 }], actions: [{ t: 0, do: "walk" }], expression: "confident" }), eff("smoke", 1760, 800, { width: 360, height: 760, intensity: 1.1 }), text("ARES", "@Ares", 130, { style: "label", color: "#ff8a8a" })], { grade: "rust", sfx: [bed("wind-hum")] });
M("s086-hateful", [140, 141], push(1, 1.12), [vase(600, { pose: "raise", crown: true, beard: true }), vase(1320, { pose: "stand", helm: true }, { flip: true }), text("“Most hateful to me of all the gods”", "@hateful", 180, { style: "subtitle", color: INK })], { transition: CUT });

// ───────────────────── 9. THE JUDGMENT ─────────────────────
const G = { grade: "vintage" };
S("s087-troy", [142, 143], { type: "frieze", color: "#9c6d4d" }, push(1, 1.1, 620, 540, 1100, 540), [vase(1500, { pose: "sit", crown: true, beard: true }), vase(620, { pose: "walk", helm: true }, { path: [{ t: 0, x: 400 }, { t: "end", x: 900 }] })], { tag: MYTH, transition: { type: "wipe", duration: 0.3 }, sfx: [fx("whoosh-fast")] });
S("s088-bloodrain", [144, 145], { type: "frieze", color: "#7a4b35" }, push(1.05, 1.0, 960, 380, 960, 560), [vase(1420, { pose: "reach", crown: true, beard: true }, { flip: true }), eff("rainfall", 960, 500, { width: 2100, height: 1000, color: "#9b111e", at: "@rain", intensity: 0.9 })], { tag: MYTH, transition: CUT, sfx: [bed("storm-bed")] });
const TROJAN = ["Sarpedon", "Hector", "Patroclus", "Pandarus", "Glaucus", "Euphorbus", "Simoeisius", "Antiphus", "Ilioneus", "Harpalion", "Polydorus", "Dolon"];
S("s089-names", [146, 147], { type: "gradient", color: "#6c665d", props: { color2: "#2c2924" } }, push(1, 1.1, 960, 700, 960, 380), [TROJAN.map((n, i) => text(n, 0.1 + i * 0.16, 170 + (i % 6) * 130, { x: 420 + Math.floor(i / 6) * 1080, style: "subtitle", color: "#e7dfc9", enter: "fade" }))], { tag: MYTH, transition: FADE });
S("s090-screen", [148], { type: "hall", time: "night", props: { kind: "control" } }, push(1, 1.16, 1020, 520), [who("soldier", 860, { y: 790, actions: [{ t: 0, do: "type" }], look: "right" }), obj("monitor", 1280, 620, 2, { props: { screen: "off" } }), eff("glow", 1280, 560, { width: 340, height: 280, color: "#ff8a4d", at: "@heat-0.5", intensity: 0.7 }), zeus(560, { y: 880, look: "right" })], { ...G, sfx: [bed("wind-hum")] });
S("s091-who", [149, 150], { type: "hall", time: "night", props: { kind: "control" } }, push(1.2, 1.3, 860, 480), [who("soldier", 860, { y: 790, look: "camera", expression: "worried" }), text("Who was he?", 0.1, 180, { color: GOLD, until: "@The", exit: "fade" })], { ...G, transition: CUT });
S("s092-watchers", [151, 152], DAWN("city", { weather: "fog" }), push(1, 1.1, 700, 540, 1200, 540), [[0, 1, 2, 3, 4, 5].map((i) => orb(220 + i * 300, 300 + (i % 2) * 180, 0.3 + i * 0.3, "@Today", { color: "#e4f0ff" })), [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => obj("cctv", 180 + i * 195, 210 + (i % 3) * 170, 0.65, { at: `@Today+${i * 0.18}`, enter: "pop" })), text("30,000 WATCHERS", 0.4, 100, { style: "label", until: "@Today", exit: "fade" })], G);
S("s093-asks", [153, 155], NIGHT("space"), push(1, 1.1), [obj("globe", 960, 540, 2.7, { color: "#16233f", speed: 0.5 }), text("Why did you come back?", "@Why", 170, { color: GOLD })], G);
const shadow = (o = {}) => obj("shadowking", 960, 1000, 0.9, o);
M("s094-prophecy", [156, 158], push(1, 1.12), [shadow({ enter: "fade", opacity: 0.8 }), vase(500, { pose: "reach", crown: true, beard: true }), orb(1320, 560, "@swallowed", undefined, { color: "#c9f2ff" })], { grade: "dramatic", sfx: [fx("whoosh-fast")] });
const warheads = (at) => Array.from({ length: 9 }).map((_, i) => obj("warheadicon", 240 + i * 180, 780, 0.75, { at: `${at}+${i * 0.14}`, enter: "pop" }));
S("s095-nations", [159, 160], BLACK, push(1, 1.1), [obj("shadowking", 960, 960, 0.8, { color: "#242c3e", enter: "fade", until: "@Nine-0.2", exit: "fade", props: { eyes: "#ffb703" } }), obj("crowd", 960, 420, 0.8, { at: "@Nine-0.1", enter: "fade", color: "#7c8db0", props: { cols: 22, rows: 7, gap: 56, reveal: 1, hero: "#f2c14e" } }), warheads("@Nine")], { ...G, transition: CUT });
S("s096-powers", [161, 163], BLACK, push(1, 1.08), [eff("fire", 400, 720, { width: 180, height: 300, at: "@Fire-0.1" }), obj("thunderbolt", 960, 500, 0.95, { at: "@Lightning-0.1", enter: "zoom", screen: true }), obj("chip", 1520, 520, 2.2, { at: "@Machines-0.1", enter: "pop", screen: true })], { ...G, transition: CUT, sfx: [fx("electric-blast", "@Lightning-0.1")] });
S("s097-feared", [164, 165], NIGHT("city"), push(1, 1.18, 800, 500), [zeus(1250, { y: 880, flip: true, look: "left", expression: "sad" }), text("I should have feared you.", "@should", 200, { style: "headline", color: GOLD })], { ...G, hold: 0.2 });

// ───────────────────── 10. WORSHIP, FEAR, CHALLENGE ─────────────────────
const words = [["WORSHIP", "#ffd166", 340], ["FEAR", "#c9d4e6", 960], ["CHALLENGE", "#ff7070", 1580]];
S("s098-three", [166, 167], BLACK, push(1, 1.06), [words.map(([w, c, x], i) => text(w, `@three-${(2 - i) * 0.3}`, 520, { x, color: c, enter: "pop", size: 92 }))], { transition: FADE });
S("s099-worship", [168, 170], DAY("ruins"), push(1, 1.1, 700, 540, 1200, 540), [who("worshipper", 520, { y: 890, actions: [{ t: "@worship", do: "sit" }], look: "up" }), who("worshipper2", 760, { y: 890, actions: [{ t: "@worship", do: "sit" }], look: "up" }), obj("shelf", 1500, 900, 1.2, { at: "@storing-0.8", enter: "pop", props: { empty: 0, sign: "SUPPLIES" } }), who("maya", 1200, { y: 900, at: "@fear-0.4", enter: "fade", expression: "worried", actions: [{ t: "@storing", do: "point" }], look: "right" })], {});
M("s100-diomedes", [171, 174], push(1, 1.2, 1260, 600), [vase(620, { pose: "strike", helm: true }), vase(1320, { pose: "stand", helm: true, beard: true }, { flip: true }), obj("lightorb", 1250, 520, 0.9, { at: "@bleed-0.2", enter: "pop", color: "#ffe58a", props: { r: 18 } }), text("GODS CAN BLEED", "@bleed", 180, { color: INK, enter: "pop" })], { sfx: [fx("whoosh-fast", 0.1)] });
S("s101-launch", [175], NIGHT("aegean", { props: { island: 0 } }), { keys: [{ t: 0, zoom: 1.0, x: 460, y: 460 }, { t: "end", zoom: 1.0, x: 1340, y: 480, ease: "smooth" }] }, [who("zeus", 1560, { y: 620, scale: 0.32 }), { kind: "arrow", from: [-100, 640], to: [1540, 470], curve: 0.2, color: "#ffd9a0", thickness: 8, at: "@fires", build: 3.2 }], { vignette: 0.55, hold: 0.2, sfx: [bed("wind-hum"), hit("shockwave", "end-0.6")] });
S("s102-light", [176, 177], NIGHT("aegean", { props: { island: 0, flat: 1 } }), push(1, 1.06, 1100, 460), [eff("whiteout", 960, 540, { width: 300, intensity: 1.6, zIndex: 50 }), zeus(1180, { scale: 0.5, y: 720, at: "@still-0.1", enter: "fade" })], { transition: FLASH, sfx: [fx("thunder-distant", 0.3)] });
S("s103-typhon", [178, 179], { type: "frieze", color: "#8c3e1f" }, shake(push(1.0, 1.1, 960, 480), 5), [obj("typhon", 1220, 980, 0.86, { until: "@threw", exit: { type: "drop", duration: 0.7 } }), vase(420, { pose: "strike", crown: true, beard: true }), obj("thunderbolt", 760, 340, 0.85, { at: "@burned", enter: "zoom" }), eff("fire", 1220, 960, { width: 640, height: 620, at: "@burned" })], { tag: MYTH, transition: { type: "wipe", duration: 0.3 }, sfx: [fx("thunder-rumble", 0.3)] });
S("s104-smile", [180, 182], BLACK, push(1.0, 1.15), [zeusFace({ expressions: [{ t: 0.1, is: "happy" }], look: "camera" }), text("Good.", "@Good", 170, { style: "title", color: GOLD, zIndex: 60, enter: "fade" })], { transition: CUT });
S("s105-empty", [183, 185], NIGHT("space"), push(1.1, 1.0), [obj("globe", 960, 540, 3.1, { color: "#0b1f3f", speed: 0.5 }), text("NOT ONE FLASH", "@flash", 120, { style: "subtitle", color: ELEC, enter: "fade" })], { ...CALM, tag: HYP, sfx: [bed("wind-hum")] });

// ───────────────────── 11. THE KNOCK ─────────────────────
const K = { grade: "warm" };
const feed = (i, n) => obj("monitor", 280 + (i % 4) * 450, 240 + Math.floor(i / 4) * 300, 1.1, { at: 0.1 + i * 0.1, enter: "pop", props: { screen: "video" } });
S("s106-wall", [186, 187], { type: "hall", time: "night", props: { kind: "control" } }, push(1, 1.14, 960, 480), [Array.from({ length: 8 }).map((_, i) => feed(i)), who("drlee", 960, { y: 880, look: "up", actions: [{ t: "@notice", do: "point" }] })], { transition: FADE });
S("s107-oldman", [188, 190], { type: "wall", time: "day", color: "#6c7380" }, { keys: [{ t: 0, zoom: 1.15, x: 960, y: 500 }, { t: "@Dusty", zoom: 1.6, x: 960, y: 420 }, { t: "@Ordinary", zoom: 2.1, x: 960, y: 370 }] }, [who("oldman", 960, { y: 950 }), text("ENHANCE", 0.1, 90, { style: "caption", color: "#a7ffb0", x: 220 })], { ...K, tag: HYP, transition: CUT });
S("s108-places", [191, 193], DAY("street"), push(1, 1.08, 800, 540, 1100, 540), [who("oldman", 620, { y: 870 }), obj("bus", 1200, 880, 1, { at: 0 }), text("THESSALONIKI", "@Thessaloniki", 130, { style: "label", until: "@Lagos", exit: "fade" }), text("LAGOS", "@Lagos", 130, { style: "label", until: "@Ohio", exit: "fade" }), text("OHIO", "@Ohio", 130, { style: "label" })], K);
const faceWall = (n) => Array.from({ length: n }).map((_, i) => who("oldman", 140 + (i % 8) * 235, { y: 340 + Math.floor(i / 8) * 330, scale: 0.42, at: 0.1 + i * 0.07, enter: "pop", screen: true }));
S("s109-same", [194], BLACK, push(1, 1.04), [faceWall(24), text("THE SAME HOUR", "@very", 950, { style: "label", color: GOLD, zIndex: 40 })], K);
S("s110-knock", [195], { type: "wall", time: "night", color: "#4d5563" }, push(1.2, 1.05, 860, 520), [obj("door", 1160, 950, 1.1, { color: "#7a4a2b", props: { lit: 0 } }), who("oldman", 680, { y: 950, scale: 1.05, actions: [{ t: 0.4, do: "point", angle: 0 }], look: "right" })], { ...K, sfx: [fx("knock", 0.5)] });
const doors = (at, lit) => Array.from({ length: 7 }).map((_, i) => obj("door", 180 + i * 260, 960, 0.5, { color: ["#6b4226", "#7c5a3a", "#54402f"][i % 3], props: { lit } }));
S("s111-doors", [196, 197], { type: "gradient", color: "#27354e", props: { color2: "#0e1421" } }, push(1, 1.05, 960, 300, 960, 760), [obj("crowd", 960, 150, 0.7, { color: "#6d7c98", props: { cols: 30, rows: 3, gap: 60, reveal: 1 } }), text("WATCHING THE SKY", 0.2, 340, { style: "label" }), Array.from({ length: 7 }).map((_, i) => obj("door", 180 + i * 260, 960, 0.5, { at: `@doors-${(6 - i) * 0.08}`, enter: "fade", color: ["#6b4226", "#7c5a3a", "#54402f"][i % 3], props: { lit: 1 } }))], K);
S("s112-shut", [198], { type: "gradient", color: "#1c2536", props: { color2: "#0e1421" } }, push(1, 1.06), [doors(0, [[0, 1], [0.6, 0]])], { ...K, transition: CUT, sfx: [fx("door-close", 0.1)] });
S("s113-bowl", [199], { type: "kitchen", time: "night" }, push(1.0, 1.18, 860, 560, 1000, 660), [who("woman", 420, { y: 890, actions: [{ t: "@second", do: "point", angle: 20 }], look: "right" }), obj("table", 1040, 900, 1.5), obj("bowl", 900, 700, 1, { at: 0.1, props: { steam: true } }), obj("bowl", 1200, 700, 1, { at: "@second", enter: "pop", props: { steam: true } }), who("oldman", 1560, { y: 890, at: "@second", enter: { type: "fade", duration: 0.8 }, look: "left" })], { ...K, grade: "warm", vignette: 0.35 });
S("s114-return", [200, 202], NIGHT("window", { weather: "rain", props: { open: 1, view: "sky" } }), push(1.2, 1.0), [eff("whiteout", 960, 540, { at: "@storms", width: 80, intensity: 0.35, color: "#c7ddff", zIndex: 30 }), obj("globe", 960, 540, 3.1, { at: "@Forty-five-0.3", enter: "fade", screen: true, zIndex: 40, color: "#0b1f3f", speed: 0.5 }), eff("flicker", 960, 540, { at: "@Forty-five", width: 790, intensity: 1, screen: true, zIndex: 41 }), text("45 FLASHES EVERY SECOND", "@flashes", 120, { style: "subtitle", color: ELEC, zIndex: 50 })], { ...CALM, tag: HYP, sfx: [bed("storm-bed"), fx("thunder-distant", "@storms-0.1")] });
M("s115-jars", [203], push(1, 1.15, 960, 620), [obj("jar", 620, 960, 1.35, { color: "#ffd166", props: { glow: 1 } }), obj("jar", 1300, 960, 1.35, { color: "#3a2a22", props: { glow: 0 } }), text("BLESSINGS", "@blessings", 190, { style: "label", x: 620, color: INK }), text("SORROWS", "@sorrows", 190, { style: "label", x: 1300, color: INK })], { transition: { type: "wipe", duration: 0.3 } });
M("s116-hope", [204, 205], push(1, 1.32, 960, 560), [vase(460, { pose: "reach", long: true }), obj("jar", 1100, 960, 1.35, { color: "#ffd166", props: { glow: 0.25 } }), eff("smoke", 1100, 480, { width: 300, height: 500, until: "@Hope", intensity: 0.5, exit: "fade" }), obj("lightorb", 1100, 500, 1.2, { at: "@Hope-0.3", enter: "zoom", color: "#fff1b8", props: { r: 32 } }), text("HOPE", "@Hope", 150, { style: "headline", color: INK })], { grade: "dramatic", vignette: 0.45, transition: CUT });
S("s117-story", [206, 208], NIGHT("suburb"), push(1, 1.08, 600, 540, 1250, 540), [text("NONE OF THIS HAPPENED", "@None", 130, { style: "label", until: "@Zeus", exit: "fade" }), who("oldman", 500, { y: 900, path: [{ t: 0, x: 500 }, { t: "end", x: 1380 }], actions: [{ t: 0, do: "walk" }], scale: 0.9 })], { ...CALM, tag: HYP, transition: FADE });
S("s118-door", [209, 210], { type: "wall", time: "night", color: "#333b48" }, push(1, 1.1, 960, 560), [eff("whiteout", 960, 540, { intensity: 0.35, color: "#a9c6ff", zIndex: 30 }), obj("door", 960, 950, 1.2, { color: "#6b4226", props: { lit: 0.5 } })], { ...CALM, vignette: 0.65, sfx: [bed("storm-bed", 0, "@knock")] });
project.scenes.push({ id: "s119-end", duration: 4, environment: { type: "wall", time: "night", color: "#333b48" }, camera: push(1.1, 1.12, 960, 560), elements: [obj("door", 960, 950, 1.2, { color: "#6b4226", props: { lit: 0.5 } })], tag: "none", subtitles: false, transition: CUT, vignette: 0.65, sfx: [{ at: 0.6, src: src("knock"), volume: 0.75 }, { at: 1.4, src: src("knock"), volume: 0.75 }] });

// keep everything independently editable and never leave an unset volume
for (const s of project.scenes) {
  s.elements = s.elements.filter(Boolean);
  s.notes = s.notes ?? s.id.replace(/^s\d+-/, "");
}

fs.writeFileSync(FILE, JSON.stringify(project, null, 2) + "\n");
console.log(`✓ ${path.relative(process.cwd(), FILE)}: ${project.scenes.length} scenes`);
