// Generates projects/video-004/storyboard.json. Narration is read from timing.md by sentence number.
// Run: node projects/video-004/build/storyboard.cjs
const fs = require("fs");
const path = require("path");
const DIR = path.join(__dirname, "..");
const sentences = {}, starts = {}, ends = {};
const secs = (s) => s.split(":").reduce((a, p) => a * 60 + Number(p), 0);
for (const line of fs.readFileSync(path.join(DIR, "timing.md"), "utf8").split(/\r?\n/)) {
  const m = /^\|\s*(\d+)\s*\|\s*([\d:.]+)\s*\|\s*([\d:.]+)\s*\|\s*(.*?)\s*\|\s*$/.exec(line);
  if (m) { sentences[+m[1]] = m[4].replace(/\s*_\(pause.*?\)_/, ""); starts[+m[1]] = secs(m[2]); ends[+m[1]] = secs(m[3]); }
}
const say = ([a, b = a]) => { const o = []; for (let i = a; i <= b; i++) o.push(sentences[i]); return o.join(" "); };

// ── mix: levels derive from each file's measured loudness [rms of the loudest 30 %, loudest 100 ms] in dBFS ──
// The narration measures [-22.8, -16.9] the same way. Effects sit 11+ dB under the voice, beds 17+ dB under,
// music ducks 19 dB under while she speaks. Narration always wins.
const VOICE = -22.8;
const LOUD = {
  "door-creak": [-18.6, -13.8], "door-knock": [-18.5, -17.5], "gate-open": [-22.8, -19.1], "heartbeat-single": [-12.6, -8.3], "heartbeat-transition": [-13.7, -13],
  "horde-moan": [-26.8, -16.8], "horror-ambience": [-18.4, -15.2], "horror-drum": [-22.7, -15], "horror-impact": [-16.1, -13.1], "marsh-wind": [-19.5, -15.8],
  mob: [-18.4, -14.7], "music-box": [-15.1, -11], "rain-long": [-28.9, -23.5], "rain-roof": [-14.2, -12.4], "scary-wind": [-18.8, -17], "slow-heartbeat": [-9.4, -5.5],
  "terror-sweep": [-18.3, -13.8], "thunder-close": [-18.3, -11.3], "thunder-mid": [-19, -11.6], "tomb-ambience": [-18.1, -14.1], "whoosh-impact": [-14.8, -8.3],
  "wind-howl": [-30.2, -28.6], "zombie-breath": [-13.4, -11.5], "zombie-gasp": [-10.6, -9.6], "zombie-growl": [-14.1, -13.2],
};
const db = (x) => 10 ** (x / 20);
const rd = (x) => Math.round(Math.min(1, x) * 1000) / 1000;
const src = (n) => `sfx/zombie/${n}.mp3`;
const fx = (n, at = 0, o = {}) => ({ at, src: src(n), volume: rd(Math.min(db(VOICE - 14 - LOUD[n][0]), db(VOICE - 8 - LOUD[n][1]))), ...o });
const bed = (n, at = 0, o = {}) => ({ at, src: src(n), loop: true, volume: rd(Math.min(db(VOICE - 20 - LOUD[n][0]), db(VOICE - 13 - LOUD[n][1]))), ...o });
// One-shots in a pause may go a little louder, but their loudest moment stays under the voice's.
const hit = (n, at, peak = VOICE - 4) => ({ at, src: src(n), volume: rd(db(Math.min(peak, VOICE - 6) - 2 - LOUD[n][1])) });
const MUSIC = { echoes: -18.1, "piano-horror": -17.2, "night-sky": -11.8, "dark-shadows": -10.3, "fright-night": -15.9, delirium: -8.7, "silent-descent": -14.6, "drawing-the-sky": -14.5 };
const music = (n, from, o = {}) => ({ src: n === "drawing-the-sky" ? `music/tech/${n}.mp3` : `music/zombie/${n}.mp3`, ...(from ? { from } : {}), volume: rd(db(VOICE - 11 - MUSIC[n])), duckTo: rd(db(VOICE - 21 - MUSIC[n])), ...o });

// ── look ──
const STORY = { text: "STORY", color: "#9fd8c9" };
const REAL = { text: "REAL SCIENCE", color: "#ffffff" };
const NONE = "none";
const TEAL = "#9fd8c9", RED = "#c0392b", PALE = "#dfeee9", GOLD = "#f2c14e", WARM = "#ffb066";
const push = (z0, z1, x0 = 960, y0 = 540, x1 = x0, y1 = y0) => ({ keys: [{ t: 0, zoom: z0, x: x0, y: y0 }, { t: "end", zoom: z1, x: x1, y: y1, ease: "smooth" }] });
const pan = (x0, x1, z = 1.08, y = 540) => push(z, z, x0, y, x1, y);
const hold = (z = 1, x = 960, y = 540) => ({ keys: [{ t: 0, zoom: z, x, y }] });
const shake = (c, n = 4) => ({ ...c, shake: n });
const FADE = { type: "fade", duration: 0.5 }, SLOW = { type: "fade", duration: 1 }, CUT = { type: "none" }, WIPE = { type: "wipe", duration: 0.4, direction: "left" }, IRIS = { type: "iris", duration: 0.6 }, ZOOM = { type: "zoom", duration: 0.45 }, WHIP = { type: "whip", duration: 0.3, direction: "left" };
const text = (t, at, y, o = {}) => ({ kind: "text", text: t, style: "headline", at, x: 960, y, enter: "rise", maxWidth: 1500, align: "center", ...o });
const label = (t, at, o = {}) => ({ kind: "text", text: t, style: "label", at, x: 960, y: 130, enter: "fade", ...o });
const obj = (type, x, y, scale, o = {}) => ({ kind: "object", type, x, y, scale, ...o });
const eff = (type, x, y, o = {}) => ({ kind: "effect", type, x, y, ...o });
const who = (w, x, o = {}) => ({ kind: "character", who: w, x, y: 900, ...o });
const go = (w, x0, x1, o = {}) => who(w, x0, { actions: [{ t: 0, do: o.run ? "run" : "walk" }], path: [{ t: 0, x: x0 }, { t: "end", x: x1 }], ...o });
const face = (w, x, expression, o = {}) => who(w, x, { y: 1740, scale: 3.6, expression, look: "camera", ...o });
const horde = (x, y, s, props, o = {}) => obj("horde", x, y, s, { props, shadow: false, ...o });
const chapter = (n, t) => [label(n, 0.2, { y: 150, until: 2.8, exit: "fade", color: TEAL, size: 30 }), text(t, 0.35, 230, { until: 2.8, exit: "fade", style: "title", size: 72, background: PLATE })];
// Close-up on a child: the head sits lower on a child's body, so the figure is raised to frame the face.
const faceKid = (w, x, expression, o = {}) => face(w, x, expression, { y: 1380, ...o });
const E = (type, time = "night", extra = {}) => ({ type, time, ...extra });
const VOID = (c = "#10181c", fog = 0.6) => ({ type: "void", color: c, props: { fog } });
const BLACK = { type: "gradient", color: "#050608", props: { color2: "#000000" } };

const project = {
  $schema: "../../storyboard.schema.json",
  id: "video-004",
  title: "What If a Zombie and a Human Had a Child?",
  topic: "An original animated horror story, clearly labelled fiction, with two real-science inserts (the zombie-ant fungus and fetal microchimerism).",
  fps: 30, width: 1920, height: 1080,
  theme: { accent: TEAL, accent2: RED, text: "#ffffff", dark: "#07090c", font: "Poppins" },
  audio: {
    wordsPerMinute: 160, narrationOverlap: 1,
    music: [
      music("echoes"),
      music("piano-horror", "s029-pharmacy"),
      music("night-sky", "s051-back"),
      music("dark-shadows", "s071-sick"),
      music("fright-night", "s088-storm"),
      music("delirium", "s106-what"),
      music("silent-descent", "s139-blood"),
      music("drawing-the-sky", "s167-there"),
    ],
  },
  subtitles: { enabled: true, position: "bottom", maxWords: 7, size: 46 },
  defaultTag: STORY,
  cast: {
    mara: { preset: "maya", name: "Mara", skin: "#c08a62", hair: "ponytail", hairColor: "#2a1a12", outfit: "jacket", top: "#5b6b4a", accent: "#8c6a3a", bottom: "#3a3f3a", shoes: "#2e241c", eyeColor: "#5a3a22" },
    maraOld: { preset: "maya", name: "Mara", skin: "#c08a62", hair: "ponytail", hairColor: "#5a4c44", outfit: "jacket", top: "#4d5a3e", accent: "#8c6a3a", bottom: "#3a3f3a", shoes: "#2e241c", eyeColor: "#5a3a22" },
    quiet: { name: "The Quiet One", body: "average", skin: "#9aa597", hair: "short", hairColor: "#2e2b28", outfit: "jacket", top: "#4a4740", accent: "#5e5a50", bottom: "#35332f", shoes: "#1e1c1a", sockets: "#3a3442", eyeColor: "#dfeee9" },
    quietOld: { name: "The Quiet One", body: "elder", skin: "#a3aba0", hair: "short", hairColor: "#a8a59c", beard: true, outfit: "jacket", top: "#3d3a35", accent: "#55514a", bottom: "#2f2d2a", shoes: "#1e1c1a", sockets: "#3a3442", eyeColor: "#dfeee9" },
    zed1: { name: "Infected", body: "slim", skin: "#8f9a8a", hair: "spiky", hairColor: "#3a3530", outfit: "tshirt", top: "#5a5048", bottom: "#3a3a40", shoes: "#222", sockets: "#33303a", eyeColor: "#e2efe9" },
    zed2: { name: "Infected", body: "heavy", skin: "#a0a294", hair: "bald", hairColor: "#555", outfit: "shirt", top: "#4f5a62", bottom: "#2f3036", shoes: "#222", sockets: "#33303a", eyeColor: "#e2efe9" },
    zed3: { name: "Infected", body: "average", skin: "#87917f", hair: "long", hairColor: "#4a3f35", outfit: "hoodie", top: "#5e3b36", bottom: "#33363b", shoes: "#222", sockets: "#33303a", eyeColor: "#e2efe9" },
    wrenKid: { name: "Wren", body: "child", skin: "#e6bfa0", hair: "bob", hairColor: "#2a1d16", hairStreak: "#f4f4f4", eyeColor: "#6b3f22", eyeColor2: "#c9d3d8", mark: "#d8ecf7", outfit: "tshirt", top: "#5f7482", bottom: "#3a3f46", shoes: "#2a2a2a" },
    wrenTeen: { name: "Wren", body: "slim", skin: "#e6bfa0", hair: "long", hairColor: "#2a1d16", hairStreak: "#f4f4f4", eyeColor: "#6b3f22", eyeColor2: "#c9d3d8", mark: "#d8ecf7", outfit: "tshirt", top: "#42525e", bottom: "#2f343a", shoes: "#2a2a2a" },
    wrenAdult: { name: "Wren", body: "slim", skin: "#e6bfa0", hair: "bun", hairColor: "#2a1d16", hairStreak: "#f4f4f4", eyeColor: "#6b3f22", eyeColor2: "#c9d3d8", mark: "#d8ecf7", outfit: "dress", top: "#5e7f86", bottom: "#5e7f86", shoes: "#3a2a20" },
    okafor: { preset: "drlee", name: "Dr. Okafor", body: "average", skin: "#6b4430", hair: "bun", hairColor: "#bdb6ad", outfit: "labcoat", top: "#e9e6dc", bottom: "#3d405b", shoes: "#2a2a2a", glasses: true, eyeColor: "#2b1d14" },
    s1: { preset: "jordan", name: "Survivor", outfit: "jacket", top: "#5a4a38", bottom: "#33363b", shoes: "#2a2a2a" },
    s2: { preset: "ben", name: "Survivor", outfit: "jacket", top: "#6b5a44", bottom: "#3a3a3a", shoes: "#2a2a2a" },
    s3: { preset: "priya", name: "Survivor", outfit: "hoodie", top: "#4a5560", bottom: "#2f343a", shoes: "#2a2a2a" },
    elder: { preset: "grandpa", name: "Councillor", top: "#5f5a50", bottom: "#3a3530" },
    chair: { preset: "marcus", name: "Councillor", outfit: "shirt", top: "#6a3a30", bottom: "#33302c", shoes: "#2a2a2a" },
    kid1: { preset: "sam", name: "Child", top: "#8a7a5a", bottom: "#4a5a6a", shoes: "#3a2a20" },
    kid2: { name: "Child", body: "child", skin: "#8d5524", hair: "ponytail", hairColor: "#140c0a", outfit: "dress", top: "#a65a4a", bottom: "#a65a4a", shoes: "#2a2a2a" },
    newKid: { name: "Child", body: "child", skin: "#d9b49a", hair: "curly", hairColor: "#3a2a1f", hairStreak: "#f4f4f4", eyeColor: "#c9d3d8", mark: "#d8ecf7", outfit: "tshirt", top: "#e9c46a", bottom: "#4a5a6a", shoes: "#3a2a20" },
    newKid2: { name: "Child", body: "child", skin: "#8d5524", hair: "afro", hairColor: "#140c0a", eyeColor: "#c9d3d8", eyeColor2: "#2b1d14", mark: "#d8ecf7", outfit: "tshirt", top: "#9fd8c9", bottom: "#3a3f46", shoes: "#2a2a2a" },
  },
  defaultTransition: FADE,
  scenes: [],
};

const KEEP = 0.6;
const holdAfter = (last, k) => (starts[last + 1] === undefined ? 0 : Math.max(0, Math.round((starts[last + 1] - ends[last]) * k * 100) / 100));
let TAG = STORY;
const PLATE = "rgba(7,9,12,0.66)";
// Headlines get a dark plate over painted scenery; anything where the subtitles live is lifted clear of them.
const backed = (els, env) => els.map((e) => {
  if (e.kind !== "text") return e;
  if (typeof e.y === "number" && e.y > 840) return { ...e, y: 835, background: e.style === "headline" ? e.background ?? PLATE : e.background };
  return e.style === "headline" && !("background" in e) && env.type !== "gradient" && env.type !== "void" ? { ...e, background: PLATE } : e;
});
const META = {};
const UNDEAD = new Set(["quiet", "quietOld", "zed1", "zed2", "zed3"]);
// Scene-wide character fixes: in the ruined city people stand on the near kerb (in front of the wrecked cars),
// and the undead keep a blank, downturned face unless a scene asks for something else.
const people = (els, env) => els.map((e) => {
  if (e.kind !== "character") return e;
  let o = e;
  if (env.type === "ruincity" && typeof o.y === "number" && o.y >= 880 && o.y <= 945 && !o.depth) o = { ...o, y: o.y + 65 };
  if (UNDEAD.has(o.who) && !o.expression) o = { ...o, expression: "sad" };
  return o;
});
const S = (id, range, environment, camera, elements, o = {}) => (META[id] = range, project.scenes.push({
  id, narration: say(range), environment, camera, elements: backed(people(elements.flat(Infinity), environment), environment), tag: TAG, hold: holdAfter(range[1] ?? range[0], KEEP) + (o.extra ?? 0), ...o, extra: undefined,
}));

// ═══ 1. THE HOOK (0:00) ═══
S("s001-beats", [1, 3], VOID("#06110d", 0.3), push(1.0, 1.12), [
  obj("scanmonitor", 960, 540, 1, { screen: true, props: { full: true, traces: 1, label: "♥ 72" }, until: "@human+0.9", exit: "fade" }),
  obj("scanmonitor", 960, 540, 1, { screen: true, at: "@human+0.7", enter: "fade", props: { full: true, traces: 2, label: "♥ 72" } }),
  text("HUMAN", "@human", 330, { color: "#7be0a2", size: 54, x: 420, background: undefined }),
  text("SOMETHING ELSE", "@something", 760, { color: "#bcd7ff", size: 54, x: 1440, background: undefined }),
], { tag: STORY, grade: "cool", vignette: 0.6, transition: { type: "fade", duration: 1 }, sfx: [hit("heartbeat-single", 0.05, VOICE - 2), hit("heartbeat-single", 1.1, VOICE - 4), bed("slow-heartbeat", "@other")] });
S("s004-impossible", [4], E("clinic", "night", { props: { cot: true, lamp: 0.8 } }), push(1.05, 1.22, 960, 560), [obj("scanmonitor", 1500, 900, 0.7)], { grade: "murky", vignette: 0.55, transition: SLOW, sfx: [bed("tomb-ambience")] });
S("s005-dead", [5], E("ruincity", "night", { weather: "fog", props: { fog: 1 } }), push(1.0, 1.15, 960, 640), [horde(960, 960, 1, { count: 13, rows: 3, width: 2200, eyes: 0.9, march: 12 })], { grade: "cool", vignette: 0.55, sfx: [bed("horde-moan"), bed("marsh-wind")] });
S("s006-born", [6], VOID("#2a1a12", 0.4), push(1.25, 1.0, 960, 560), [obj("babyhand", 960, 560, 1.3, { props: { grip: [[0, 0], [2.6, 1]], mark: [[2.2, 0], [3.4, 1]] } }), eff("glow", 640, 640, { at: 2.4, width: 600, height: 400, color: "#dff0ff" })], { grade: "warm", vignette: 0.5, transition: SLOW, sfx: [hit("heartbeat-single", "@born", VOICE - 6)] });
S("s007-fiction", [7], BLACK, hold(1.02), [text("A STORY.", 0.1, 470, { style: "title", color: TEAL, enter: "fade", size: 84 }), text("NOT REAL SCIENCE. NONE OF IT HAPPENED.", "@none", 600, { style: "label", enter: "fade", size: 36 })], { tag: NONE, transition: FADE });
S("s008-ends", [8], E("marsh", "night", { weather: "fog", props: { settlement: true, lights: 1 } }), pan(760, 1160, 1.1, 560), [horde(900, 900, 0.8, { count: 16, rows: 4, width: 2400, turn: [[0, 0], [2.4, 1]], eyes: 0.9 }, { depth: 0.9 })], { grade: "cool", vignette: 0.5, sfx: [bed("marsh-wind"), hit("terror-sweep", 0.4, VOICE - 8)] });
S("s009-title", [9], VOID("#0b1418", 0.8), push(1.12, 1.0, 960, 600), [
  obj("baby", 960, 650, 1.0, { props: { eyes: [[0, 0], [2.4, 0], [2.9, 1]], mark: 1, details: 1 } }),
  text("WHAT IF A ZOMBIE AND A HUMAN HAD A CHILD?", "@zombie-0.4", 150, { style: "title", color: PALE, size: 70, maxWidth: 1600, enter: "zoom" }),
], { tag: NONE, grade: "dramatic", vignette: 0.6, transition: IRIS, sfx: [hit("horror-impact", "end-0.2", VOICE - 2), hit("heartbeat-single", 2.9, VOICE - 8)], extra: 0.8 });

// ═══ 2. THE WORLD AFTER (0:28) ═══
S("s010-fever", [10], VOID("#2a1010", 0.3), push(1.0, 1.1), [chapter("CHAPTER ONE", "THE WORLD AFTER"), obj("newspaper", 960, 560, 1.15, { at: 0.6, enter: "drop", rotate: -3, props: { masthead: "THE COASTAL HERALD", headline: "FEVER SPREADS. NO NAME, NO CURE.", date: "DAY 19" } })], { grade: "crimson", vignette: 0.6, transition: SLOW, sfx: [fx("whoosh-impact", 0.6)] });
S("s011-empty", [11], E("ruincity", "dawn", { weather: "fog" }), pan(620, 1300, 1.06), [obj("crow", 1320, 878, 0.8, { props: { pecking: true } }), obj("crow", 1440, 890, 0.7, { flip: true })], { grade: "murky", sfx: [bed("marsh-wind")] });
S("s012-notdie", [12], E("ruincity", "night", { weather: "fog", seed: 3 }), push(1.0, 1.3, 1160, 640), [who("zed1", 1200, { scale: 0.75, y: 900, flip: true, look: "right" }), eff("glow", 960, 160, { width: 900, height: 500, color: "#9fb7d6", opacity: 0.4 })], { grade: "cool", vignette: 0.6, transition: SLOW, sfx: [bed("tomb-ambience")] });
S("s013-walk", [13, 14], E("ruincity", "night", { weather: "fog", seed: 5 }), pan(700, 1240, 1.12, 600), [go("zed1", 300, 980, { y: 910 }), go("zed2", 80, 700, { y: 935, scale: 1.05 }), go("zed3", -160, 460, { y: 900, scale: 0.9 })], { grade: "cool", vignette: 0.55, sfx: [bed("horde-moan"), bed("marsh-wind")] });
S("s015-hungry", [15], VOID("#141c18", 0.5), push(1.05, 1.18, 960, 520), [face("zed2", 960, "angry", { look: "camera" })], { grade: "murky", vignette: 0.65, transition: CUT, sfx: [fx("zombie-breath", 0.5), fx("zombie-growl", "@hungry-0.2")] });
S("s016-name", [16, 17], BLACK, push(1.0, 1.08), [horde(960, 980, 1.1, { count: 12, rows: 2, width: 2200, eyes: 1, still: 0.6 }, { opacity: 0.55 }), text("ZOMBIES.", "@Zombies-0.05", 470, { style: "title", color: RED, enter: "zoom", size: 120 })], { tag: STORY, grade: "crimson", transition: CUT, sfx: [hit("horror-impact", "@Zombies", VOICE - 2)], extra: 0.4 });
S("s018-saltmarsh", [18, 19], E("saltmarsh", "sunset", { props: { lights: [[0, 0], [4, 1]], fog: 0.7 } }), push(1.2, 1.02, 960, 600, 960, 560), [label("SALTMARSH", "@Saltmarsh", { y: 120, size: 40, color: TEAL })], { grade: "rust", vignette: 0.4, transition: SLOW, sfx: [bed("marsh-wind")] });
S("s020-mara", [20], E("saltmarsh", "sunset", { props: { near: true, lights: 1, fog: 0.5 } }), pan(780, 1080, 1.15, 640), [go("mara", 640, 980, { y: 1000, scale: 1.25 }), label("MARA · MEDIC", "@Mara", { y: 760, x: 1400, size: 34, color: TEAL })], { grade: "warm", sfx: [bed("marsh-wind")] });
S("s021-outside", [21], E("saltmarsh", "dawn", { props: { near: true, gate: [[0, 0], [1.4, 0.75]], lights: 0.3, fog: 0.8 } }), push(1.0, 1.18, 960, 620), [who("mara", 960, { y: 1010, scale: 1.1, at: 1.2, enter: "fade", actions: [{ t: 1.2, do: "walk" }], path: [{ t: 1.2, y: 960, scale: 0.9 }, { t: "end", y: 1060, scale: 1.3 }] })], { grade: "cool", sfx: [fx("gate-open", 0.1), bed("marsh-wind")] });
S("s022-scav", [22, 23], E("ruincity", "day", { weather: "fog", seed: 7 }), pan(600, 1200, 1.1, 620), [
  go("mara", 360, 860, { y: 905, scale: 1.05 }),
  obj("flask", 1220, 360, 0.7, { screen: true, at: "@Medicine", enter: "pop" }), label("MEDICINE", "@Medicine", { x: 1220, y: 470 }),
  obj("battery", 1460, 360, 0.6, { screen: true, at: "@batteries", enter: "pop", props: { level: 0.3 } }), label("BATTERIES", "@batteries", { x: 1460, y: 470 }),
  obj("gift", 1700, 420, 0.6, { screen: true, at: "@seeds", enter: "pop", props: { kind: "seeds" } }), label("SEEDS", "@seeds", { x: 1700, y: 470 }),
], { grade: "murky", transition: WIPE, sfx: [bed("marsh-wind")] });
S("s024-rule", [24], E("saltmarsh", "sunset", { props: { near: true, lights: 1, fog: 0.6 } }), push(1.05, 1.15, 960, 560), [face("mara", 960, "confident", { look: "camera" }), label("RULE #1", "@rule", { y: 300, x: 1500, color: RED, size: 40 })], { grade: "warm", vignette: 0.5, transition: CUT });
S("s025-run", [25], E("ruincity", "night", { weather: "rain", seed: 2, intensity: 0.8 }), shake(pan(500, 1300, 1.12, 620), 3), [go("mara", 700, 1500, { run: true, y: 910 }), go("zed1", 120, 900, { y: 915, at: "@sees" }), eff("speedlines", 960, 600, { at: "@run", width: 1920, height: 900, opacity: 0.5 })], { grade: "cool", transition: WHIP, sfx: [fx("zombie-growl", "@sees"), fx("whoosh-impact", "@run-0.1"), bed("rain-long")] });
S("s026-never", [26, 27], E("ruincity", "night", { weather: "rain", seed: 9, intensity: 0.8 }), shake(pan(400, 1500, 1.18, 640), 3), [go("mara", 200, 1700, { run: true, y: 915, scale: 1.1 }), text("NEVER STOP.", "@stop-0.3", 220, { color: PALE, size: 66, x: 620 }), text("NEVER LOOK BACK.", "@back-0.4", 330, { color: RED, size: 66, x: 1300 })], { grade: "cool", transition: CUT, sfx: [bed("rain-long"), fx("heartbeat-single", "@stop")] });
S("s028-broke", [28], E("ruincity", "night", { weather: "rain", seed: 4, intensity: 1 }), push(1.05, 1.3, 960, 640), [who("mara", 960, { y: 905, scale: 1.2, expression: "worried", turns: [{ t: "@broke-0.2", to: "left" }], look: "camera" }), label("TRIP #400", "@hundredth-0.3", { y: 140, color: PALE, size: 38 })], { grade: "cool", vignette: 0.55, transition: FADE, sfx: [bed("rain-long"), hit("terror-sweep", "@broke-0.3", VOICE - 6)], extra: 0.3 });

// ═══ 3. THE QUIET ONE (1:17) ═══
S("s029-pharmacy", [29], E("pharmacy", "night", { props: { counter: false } }), pan(500, 1300, 1.1, 560), [chapter("CHAPTER TWO", "THE QUIET ONE")], { grade: "murky", vignette: 0.55, transition: SLOW, sfx: [bed("rain-roof"), bed("rain-long")] });
S("s030-zombie", [30, 31], E("pharmacy", "night"), push(1.0, 1.35, 1200, 600, 1300, 560), [who("quiet", 1300, { y: 920, scale: 1.2, flip: true, look: "down" }), eff("glow", 1300, 420, { width: 600, height: 700, color: "#9ff0c8", opacity: 0.25 })], { grade: "murky", vignette: 0.6, sfx: [bed("rain-roof"), hit("heartbeat-single", "@moving", VOICE - 8)] });
S("s032-always", [32, 33], E("ruincity", "night", { weather: "fog", seed: 11 }), shake(push(1.15, 1.0, 960, 640), 3), [horde(960, 990, 1.15, { count: 11, rows: 4, width: 2000, march: -30, eyes: 1 }, { path: [{ t: 0, scale: 1.0 }, { t: "end", scale: 1.25 }] })], { grade: "crimson", vignette: 0.6, transition: CUT, sfx: [bed("horde-moan"), fx("zombie-growl", "@groaned"), fx("zombie-gasp", "@lurched")] });
S("s034-holding", [34], E("pharmacy", "night"), push(1.2, 1.55, 1240, 600, 1220, 640), [who("quiet", 1300, { y: 920, scale: 1.2, flip: true, look: "down", actions: [{ t: 0, do: "present", angle: -20 }] }), obj("musicbox", 1484, 668, 0.35, { props: { open: 0 } })], { grade: "murky", vignette: 0.6, transition: CUT, sfx: [bed("rain-roof")] });
S("s035-box", [35, 37], VOID("#1a1612", 0.3), push(1.0, 1.2, 960, 600), [
  obj("musicbox", 960, 780, 1.6, { until: "@listened-0.1", exit: "fade", props: { open: [[0, 0], [1.2, 1]], turning: true, notes: true, rust: 0.2 } }),
  eff("glow", 960, 560, { width: 900, height: 600, color: WARM, opacity: 0.35, until: "@listened" }),
  face("quiet", 960, "neutral", { at: "@listened-0.1", enter: "fade", look: "down" }),
], { grade: "warm", vignette: 0.65, sfx: [fx("music-box", 0.6, { volume: rd(Math.min(db(VOICE - 13 - LOUD["music-box"][0]), db(VOICE - 7 - LOUD["music-box"][1]))) }), bed("rain-roof")] });
S("s038-watch", [38, 39], E("pharmacy", "night"), push(1.15, 1.3, 520, 600, 600, 600), [who("mara", 420, { y: 920, scale: 1.2, look: "right", expression: "worried" }), who("quiet", 1300, { y: 920, scale: 1.2, flip: true, look: "down", opacity: 0.85 })], { grade: "murky", vignette: 0.55, transition: CUT, sfx: [bed("rain-roof"), bed("slow-heartbeat", 0, { volume: 0.05 })] });
S("s040-saw", [40], VOID("#0e1614", 0.4), push(1.1, 1.25, 960, 520), [face("quiet", 960, "neutral", { look: "camera" }), eff("glow", 960, 470, { width: 700, height: 240, color: PALE, at: "@saw", opacity: 0.4 })], { grade: "cool", vignette: 0.7, transition: CUT, sfx: [hit("horror-impact", "@saw", VOICE - 8)] });
S("s041-tilt", [41, 42], E("pharmacy", "night"), push(1.05, 1.15, 860, 600), [who("mara", 420, { y: 920, scale: 1.2, look: "right", expression: "surprised" }), who("quiet", 1240, { y: 920, scale: 1.2, flip: true, look: "left", actions: [{ t: 0, do: "present", angle: -20 }], path: [{ t: 0, rotate: 0 }, { t: "@tilted", rotate: 0 }, { t: "@tilted+0.8", rotate: -6, ease: "smooth" }] }), obj("musicbox", 1424, 668, 0.35, { props: { open: 1 } })], { grade: "murky", vignette: 0.55, transition: CUT, sfx: [bed("rain-roof")] });
TAG = REAL;
S("s043-fungus", [43], E("forest", "day", { weather: "fog" }), push(1.0, 1.15), [obj("antleaf", 960, 520, 1.25, { props: { stalk: 0 } }), label("REAL SCIENCE", 0.2, { y: 120, color: "#ffffff", size: 34 })], { grade: "clean", transition: ZOOM, sfx: [fx("whoosh-impact", 0)] });
S("s044-bodies", [44, 45], VOID("#16261a", 0.3), push(1.05, 1.3, 960, 460), [obj("antleaf", 960, 560, 1.4, { props: { stalk: [[0, 0], ["@bodies", 0.15], ["end", 1]] } }), label("OPHIOCORDYCEPS · THE ZOMBIE-ANT FUNGUS", 0.3, { y: 120, size: 32 }), text("THE BRAIN STAYS ALIVE", "@brain-0.3", 900, { color: GOLD, size: 56 })], { grade: "clean", transition: CUT });
S("s046-argue", [46], VOID("#16261a", 0.3), push(1.3, 1.1, 960, 480), [obj("antleaf", 960, 560, 1.4, { props: { stalk: 1 } }), obj("icon", 1420, 330, 2.2, { at: "@argue", enter: "pop", screen: true, color: GOLD, props: { name: "question" } })], { grade: "clean", transition: CUT });
TAG = STORY;
S("s047-wonder", [47, 48], E("pharmacy", "night"), push(1.0, 1.25, 700, 600), [who("mara", 520, { y: 920, scale: 1.25, look: "right", expression: "thinking", actions: [{ t: 0.3, do: "think" }] }), who("quiet", 1300, { y: 920, scale: 1.2, flip: true, look: "left" }), eff("glow", 1300, 450, { at: "@still", width: 360, height: 200, color: PALE, opacity: 0.5 })], { grade: "murky", vignette: 0.5, transition: FADE, sfx: [bed("rain-roof")] });
S("s049-quiet", [49, 50], E("pharmacy", "night", { props: { flicker: 0 } }), push(1.15, 1.0, 1100, 560), [who("quiet", 900, { y: 920, scale: 1.15, flip: true, look: "down", actions: [{ t: 0, do: "present", angle: -20 }] }), obj("musicbox", 1078, 680, 0.34, { props: { open: 1 } }), text("THE QUIET ONE", "@Quiet-0.2", 470, { style: "title", color: PALE, size: 80, enter: "fade", x: 1420, background: PLATE })], { grade: "cool", vignette: 0.6, transition: SLOW, sfx: [bed("rain-long")], extra: 0.6 });

// ═══ 4. SOMETHING UNEXPECTED (2:14) ═══
S("s051-back", [51, 52], E("ruincity", "dawn", { weather: "fog", seed: 12 }), pan(500, 1200, 1.1, 600), [chapter("CHAPTER THREE", "SOMETHING UNEXPECTED"), go("mara", 200, 1100, { y: 905 })], { grade: "murky", transition: SLOW, sfx: [bed("marsh-wind")] });
const COUNTER = obj("counter", 1460, 925, 1, { zIndex: 2, shadow: false });
S("s053-waiting", [53], E("pharmacy", "night"), push(1.0, 1.15, 1300, 580), [COUNTER, who("quiet", 1560, { y: 905, scale: 1.05, flip: true, look: "left" })], { grade: "murky", vignette: 0.5, transition: WIPE, sfx: [bed("rain-roof")] });
S("s054-gifts", [54, 57], E("pharmacy", "night"), push(1.25, 1.6, 1300, 640, 1500, 690), [
  COUNTER,
  who("quiet", 1720, { y: 905, scale: 1.05, flip: true, look: "down" }),
  obj("gift", 1160, 743, 0.55, { at: "@bandages-0.3", enter: "pop", zIndex: 3, props: { kind: "bandage" } }),
  obj("gift", 1340, 743, 0.55, { at: "@seeds-0.3", enter: "pop", zIndex: 3, props: { kind: "seeds" } }),
  obj("gift", 1540, 743, 0.6, { at: "@drawing-0.3", enter: "pop", zIndex: 3, props: { kind: "drawing" } }),
], { grade: "warm", vignette: 0.5, transition: CUT, sfx: [bed("rain-roof")] });
S("s058-crowd", [58], E("ruincity", "night", { weather: "fog", seed: 14 }), shake(push(1.0, 1.15, 1100, 620), 4), [horde(1500, 960, 1.05, { count: 10, rows: 4, width: 1300, eyes: 1 }, { path: [{ t: 0, x: 2400 }, { t: "end", x: 1450 }] }), who("mara", 560, { y: 910, look: "right", expression: "surprised" })], { grade: "crimson", vignette: 0.55, transition: CUT, sfx: [bed("horde-moan"), hit("terror-sweep", 0.2, VOICE - 6)] });
S("s059-trapped", [59], VOID("#1c1012", 0.3), shake(push(1.1, 1.22, 960, 520), 3), [face("mara", 960, "worried", { look: "right" })], { grade: "crimson", vignette: 0.7, transition: CUT, sfx: [hit("heartbeat-single", 0.1, VOICE - 4), hit("heartbeat-single", 0.75, VOICE - 6)] });
S("s060-stepped", [60], E("ruincity", "night", { weather: "fog", seed: 14 }), push(1.05, 1.15, 1000, 600), [horde(1600, 960, 1.05, { count: 10, rows: 4, width: 1300, eyes: 1 }), who("mara", 460, { y: 910, look: "right", expression: "worried" }), who("quiet", 1500, { y: 915, scale: 1.05, actions: [{ t: 0.2, do: "walk" }, { t: "@stood", do: "idle" }], path: [{ t: 0.2, x: 1500 }, { t: "@stood", x: 900 }], flip: true, look: "right" })], { grade: "cool", vignette: 0.55, transition: CUT, sfx: [bed("horde-moan")] });
S("s061-stopped", [61, 63], E("ruincity", "night", { weather: "fog", seed: 14 }), push(1.1, 1.0, 1200, 600), [horde(1600, 960, 1.05, { count: 10, rows: 4, width: 1300, eyes: [[0, 1], ["@walked", 0.4]], still: [[0, 0], ["@stopped", 1]], back: [["@walked", 0], ["end", 1]] }), who("quiet", 900, { y: 915, scale: 1.05, look: "right", flip: false }), who("mara", 460, { y: 910, look: "right", expression: "surprised" })], { grade: "cool", vignette: 0.5, sfx: [bed("horde-moan", 0, { until: "@stopped" }), bed("marsh-wind", "@stopped")] });
S("s064-secret", [64, 66], E("saltmarsh", "night", { props: { near: true, lights: 1, fog: 0.6 } }), push(1.0, 1.12, 960, 640), [who("mara", 760, { y: 1000, scale: 1.2, expression: "worried", look: "camera" }), who("s1", 1260, { y: 990, scale: 1.05, flip: true, look: "left", expression: "thinking", at: "@mad", enter: "fade" }), who("s2", 1500, { y: 995, scale: 1.05, flip: true, look: "left", expression: "angry", at: "@infected-0.2", enter: "fade" })], { grade: "cool", vignette: 0.5, transition: FADE, sfx: [bed("marsh-wind")] });
S("s067-grown", [67, 69], E("ruincity", "night", { seed: 16, props: { fog: 0.5, cars: false } }), push(1.0, 1.14, 960, 600), [obj("crate", 690, 970, 0.62), obj("crate", 1250, 970, 0.62), who("mara", 760, { y: 905, actions: [{ t: 0, do: "sit" }], look: "right", expression: "neutral" }), who("quiet", 1180, { y: 905, actions: [{ t: 0, do: "sit" }], flip: true, look: "left" }), eff("fireflies", 960, 700, { width: 1700, height: 500 }), text("NOT A CURE.", "@cure-0.2", 200, { color: PALE, size: 56, x: 620, enter: "fade" }), text("NOT A MIRACLE.", "@miracle-0.2", 200, { color: PALE, size: 56, x: 1320, enter: "fade" })], { grade: "dream", vignette: 0.45, transition: SLOW });
S("s070-trust", [70], E("marsh", "night", { props: { settlement: true, lights: 1, fog: 0.7 } }), push(1.35, 1.0, 960, 700, 960, 560), [obj("crate", 802, 870, 0.34), obj("crate", 1118, 870, 0.34), who("mara", 840, { y: 870, scale: 0.55, actions: [{ t: 0, do: "sit" }], look: "right" }), who("quiet", 1080, { y: 870, scale: 0.55, actions: [{ t: 0, do: "sit" }], flip: true, look: "left" })], { grade: "dream", vignette: 0.5, transition: SLOW, extra: 0.6 });

// ═══ 5. THE IMPOSSIBLE PREGNANCY (2:59) ═══
S("s071-sick", [71, 73], E("clinic", "night", { props: { cot: true, lamp: 0.9 } }), shake(push(1.05, 1.2, 600, 620), 2), [chapter("CHAPTER FOUR", "THE IMPOSSIBLE"), who("mara", 480, { y: 900, actions: [{ t: 0, do: "sit" }], expression: "sad" })], { grade: "murky", vignette: 0.6, transition: SLOW, sfx: [bed("tomb-ambience")] });
S("s074-pregnant", [74, 75], VOID("#141414", 0.3), push(1.1, 1.3, 960, 520), [face("mara", 960, "worried", { expressions: [{ t: "@pregnant-0.2", is: "surprised" }] }), text("PREGNANT", "@pregnant", 180, { color: PALE, size: 60, enter: "pop" })], { grade: "cool", vignette: 0.65, transition: CUT, sfx: [hit("heartbeat-single", "@pregnant", VOICE - 3)], extra: 0.4 });
S("s076-okafor", [76], E("clinic", "night", { props: { lamp: 1 } }), pan(1100, 820, 1.1, 600), [who("okafor", 1100, { y: 920, scale: 1.15, look: "left", actions: [{ t: 0, do: "point", angle: 20 }] }), obj("scanmonitor", 760, 920, 0.6, { props: { traces: 1, label: "" } }), label("DR. OKAFOR", "@Okafor", { y: 760, x: 1500, size: 34, color: TEAL })], { grade: "warm", transition: FADE, sfx: [bed("tomb-ambience")] });
S("s077-tests", [77, 78], E("clinic", "night", { props: { lamp: 1 } }), push(1.1, 1.3, 960, 640), [who("okafor", 1160, { y: 920, scale: 1.15, flip: true, look: "left", expression: "thinking", actions: [{ t: 0, do: "think" }] }), obj("microscope", 760, 900, 1.1), obj("beaker", 560, 900, 1, { props: { level: 0.5, bubbles: true }, color: "#9fd8c9" }), obj("clock", 960, 330, 0.6, { props: { fast: true }, at: "@again-0.5", enter: "pop" })], { grade: "warm", transition: WIPE });
S("s079-scan", [79, 80], VOID("#06110d", 0.2), push(1.0, 1.12), [obj("scanmonitor", 960, 540, 1, { screen: true, props: { full: true, traces: 2, label: "SCAN 1" } }), text("TWO RHYTHMS", "@rhythms", 160, { color: PALE, size: 54, background: undefined })], { grade: "cool", vignette: 0.6, transition: ZOOM, sfx: [bed("slow-heartbeat"), bed("heartbeat-transition", 0.5)] });
S("s081-council", [81, 83], E("council", "night"), push(1.0, 1.12, 960, 620), [obj("table", 960, 920, 1.6), obj("lantern", 960, 800, 0.5), who("okafor", 520, { y: 920, actions: [{ t: 0, do: "talk" }], look: "right", expression: "worried" }), who("elder", 1180, { y: 920, flip: true, look: "left" }), who("chair", 1420, { y: 920, flip: true, look: "left", expression: "thinking" })], { grade: "warm", vignette: 0.6, transition: SLOW, sfx: [bed("tomb-ambience")] });
S("s084-split", [84, 86], E("council", "night"), push(1.1, 1.0, 960, 600), [obj("table", 960, 920, 1.6), obj("lantern", 960, 800, 0.5), who("s2", 460, { y: 920, look: "right", expression: "angry", actions: [{ t: "@thrown-0.5", do: "point" }] }), who("elder", 760, { y: 920, look: "right", expression: "angry" }), who("chair", 1180, { y: 920, flip: true, look: "left", expression: "thinking", actions: [{ t: "@study", do: "think" }] }), who("okafor", 1460, { y: 920, flip: true, look: "left", expression: "worried" }),
  obj("speech", 560, 520, 1, { at: "@thrown-0.6", enter: "pop", props: { text: "Throw her out.", side: "left", width: 360 } }),
  obj("speech", 1300, 520, 1, { at: "@study-0.4", enter: "pop", props: { text: "Study the baby.", side: "right", width: 360 } }),
], { grade: "warm", vignette: 0.6, transition: CUT, sfx: [bed("tomb-ambience")] });
S("s087-lights", [87], E("marsh", "night", { weather: "fog", props: { settlement: true, lights: 1, fog: 0.9 } }), push(1.25, 1.05, 620, 640, 900, 580), [who("quiet", 520, { y: 960, scale: 1.25, look: "right" })], { grade: "cool", vignette: 0.55, transition: SLOW, sfx: [bed("marsh-wind"), fx("music-box", 0.8, { volume: 0.04 })], extra: 0.6 });

// ═══ 6. THE BIRTH (3:50) ═══
S("s088-storm", [88], E("saltmarsh", "night", { weather: "storm", intensity: 1.3, props: { lights: 1, fog: 0.5 } }), shake(push(1.0, 1.15, 960, 560), 2), [chapter("CHAPTER FIVE", "THE BIRTH")], { grade: "dramatic", vignette: 0.55, transition: SLOW, sfx: [bed("rain-long"), hit("thunder-close", 0.3, VOICE - 2), fx("thunder-mid", "@stormy")] });
S("s089-wren", [89], E("clinic", "night", { props: { storm: true, cot: true, lamp: 1 } }), push(1.0, 1.15, 640, 640), [who("mara", 480, { y: 900, actions: [{ t: 0, do: "sit" }], expression: "happy", look: "right" }), who("okafor", 960, { y: 920, flip: true, look: "left", expression: "happy" }), label("WREN", "@Wren", { y: 150, size: 54, color: TEAL })], { grade: "warm", vignette: 0.55, transition: FADE, sfx: [bed("rain-roof")] });
S("s090-perfect", [90, 93], VOID("#2a1d14", 0.3), push(1.0, 1.1, 960, 560), [obj("baby", 960, 620, 1.05, { props: { eyes: 0, details: 0, mark: 0, cry: [[0, 0], ["@Loud-0.05", 1], ["@Perfect-0.1", 0]] } }), text("SMALL.", "@Small", 150, { x: 520, color: PALE, size: 52 }), text("LOUD.", "@Loud", 150, { x: 960, color: PALE, size: 52 }), text("PERFECT.", "@Perfect", 150, { x: 1400, color: TEAL, size: 52 })], { grade: "warm", vignette: 0.6, transition: SLOW, sfx: [bed("rain-roof", 0, { volume: 0.03 })] });
S("s094-details", [94], E("clinic", "night", { props: { storm: true, lamp: 1 } }), push(1.1, 1.25, 960, 520), [face("okafor", 960, "thinking", { look: "down" })], { grade: "warm", vignette: 0.65, transition: CUT, sfx: [bed("rain-roof")] });
S("s095-eyes", [95, 96], VOID("#1a1612", 0.2), push(1.6, 2.4, 960, 470, 960, 470), [obj("baby", 960, 620, 1.05, { props: { eyes: [[0, 0], [0.4, 1]], details: 0, mark: 0 } }), text("BROWN", "@brown", 300, { x: 640, color: "#c08a62", size: 46, background: undefined }), text("PALE GREY", "@pale", 300, { x: 1280, color: PALE, size: 46, background: undefined })], { grade: "cool", vignette: 0.7, transition: CUT, sfx: [hit("heartbeat-single", "@grey", VOICE - 8)] });
S("s097-streak", [97], VOID("#1a1612", 0.2), push(1.8, 2.2, 1000, 330, 1000, 330), [obj("baby", 960, 620, 1.05, { props: { eyes: 1, details: [[0, 0], ["@streak", 0], ["@streak+0.8", 1]], mark: 0.2 } })], { grade: "cool", vignette: 0.7, transition: CUT });
S("s098-mark", [98], VOID("#1a1612", 0.2), push(1.4, 2.2, 900, 640, 760, 740), [obj("baby", 960, 620, 1.05, { props: { eyes: 1, details: 1, mark: [[0, 0.1], ["@silver", 0.1], ["@frost", 1]] } }), eff("sparkles", 760, 740, { at: "@frost", width: 500, height: 260 })], { grade: "cool", vignette: 0.7, transition: CUT });
S("s099-temp", [99, 100], E("clinic", "night", { props: { storm: true, lamp: 1 } }), push(1.0, 1.1), [obj("gauge", 640, 560, 1.4, { screen: true, props: { value: [[0, 0.6], [1.5, 0.12]], label: "TEMP", low: "COLD", high: "HOT" } }), text("TOO COLD FOR A HUMAN", "@human-0.6", 820, { x: 640, size: 42, color: PALE }), obj("scanmonitor", 1340, 760, 0.75, { at: "@heartbeat-0.4", enter: "pop", props: { traces: 1, label: "♥ 190" } }), text("TOO STRONG FOR A ZOMBIE", "@zombie-0.4", 820, { x: 1340, size: 42, color: RED })], { grade: "warm", vignette: 0.6, transition: WIPE, sfx: [bed("rain-roof"), fx("heartbeat-single", "@heartbeat")] });
S("s101-breath", [101], E("clinic", "night", { props: { storm: true, cot: true, lamp: 1 } }), push(1.0, 2.2, 960, 560, 560, 330), [eff("glow", 560, 330, { at: "@outside-0.6", width: 400, height: 400, color: "#dfe9ff", opacity: 0.5 })], { grade: "dramatic", vignette: 0.6, transition: CUT, sfx: [bed("rain-roof"), hit("terror-sweep", "@outside-0.8", VOICE - 4)] });
S("s102-stopped", [102, 103], E("marsh", "night", { weather: "storm", intensity: 1, props: { settlement: true, lights: 1, fog: 0.6 } }), pan(700, 1240, 1.08, 600), [horde(960, 940, 1.0, { count: 22, rows: 6, width: 4200, eyes: 1, still: [[0, 0], ["@stopped", 1]] }, { depth: 0.95 }), text("THOUSANDS", "@Thousands", 180, { color: PALE, size: 60 })], { grade: "cool", vignette: 0.6, transition: CUT, sfx: [bed("horde-moan", 0, { until: "@stopped" }), bed("rain-long"), hit("thunder-mid", "@stopped", VOICE - 6)] });
S("s104-turned", [104], E("marsh", "night", { weather: "storm", intensity: 1, props: { settlement: true, lights: 1, fog: 0.5 } }), shake(push(1.0, 1.2, 1100, 600), 2), [horde(960, 940, 1.05, { count: 22, rows: 6, width: 4200, still: 1, turn: [[0, 0], ["@turned", 0], ["@turned+0.5", 1]], eyes: [[0, 0.6], ["@turned+0.4", 1]] }, { depth: 0.95 })], { grade: "dramatic", vignette: 0.6, transition: CUT, sfx: [hit("horror-impact", "@turned", VOICE - 2), bed("rain-long")] });
S("s105-morning", [105], E("marsh", "dawn", { weather: "fog", props: { settlement: true, lights: 0.4, fog: 1 } }), push(1.25, 1.0, 960, 560), [horde(960, 940, 1.0, { count: 22, rows: 6, width: 4200, still: 1, turn: 1, eyes: 0.8 }, { depth: 0.95 })], { grade: "cool", vignette: 0.55, transition: SLOW, sfx: [bed("marsh-wind"), bed("wind-howl")], extra: 1.2 });

// ═══ 7. HUMAN, ZOMBIE, OR SOMETHING NEW? (4:36) ═══
S("s106-what", [106], VOID("#0b1418", 0.5), push(1.05, 1.15, 960, 560), [chapter("CHAPTER SIX", "SOMETHING NEW"), obj("baby", 960, 700, 0.75, { at: 2.6, enter: "fade", props: { eyes: 1, details: 1, mark: 0.8 } })], { grade: "cool", vignette: 0.6, transition: SLOW, extra: 1.6 });
S("s107-fast", [107, 109], E("saltmarsh", "day", { props: { near: true, lights: 0, fog: 0.3 } }), pan(640, 1160, 1.12, 640), [go("mara", 520, 1080, { y: 1000, scale: 1.1 }), go("wrenKid", 640, 1200, { y: 1005, scale: 0.65 }), text("7 MONTHS: WALKING", "@seven-0.2", 200, { x: 560, size: 46, color: PALE }), text("1 YEAR: TALKING", "@talked-0.2", 200, { x: 1360, size: 46, color: TEAL })], { grade: "clean", transition: WIPE, sfx: [bed("marsh-wind")] });
S("s110-knee", [110], E("saltmarsh", "day", { props: { near: true, lights: 0, fog: 0.3 } }), push(1.2, 1.45, 960, 760), [who("wrenKid", 960, { y: 1000, scale: 1.1, actions: [{ t: 0, do: "sit" }], expression: "sad", expressions: [{ t: "@healed+0.4", is: "surprised" }] }), eff("sparkles", 1010, 960, { at: "@healed", width: 200, height: 140 }), eff("glow", 1010, 960, { at: "@healed", width: 260, height: 200, color: PALE })], { grade: "clean", transition: CUT });
S("s111-dark", [111, 112], VOID("#05080a", 0.2), push(1.0, 1.15, 960, 520), [faceKid("wrenKid", 960, "neutral", { opacity: 0.55 }), eff("glow", 905, 470, { at: "@dark-0.2", width: 150, height: 110, color: "#c08a62", opacity: 0.5 }), eff("glow", 1015, 470, { at: "@dark-0.2", width: 190, height: 140, color: PALE, opacity: 0.95 })], { grade: "cool", vignette: 0.85, transition: FADE, sfx: [hit("heartbeat-single", "@dark", VOICE - 10)] });
S("s113-whispers", [113, 116], VOID("#0d1418", 0.8), push(1.05, 1.3, 960, 520), [horde(960, 1000, 1.0, { count: 14, rows: 3, width: 2400, eyes: 0.8, still: 0.5 }, { opacity: 0.35 }), faceKid("wrenKid", 960, "thinking", { look: "left" })], { grade: "cool", vignette: 0.7, transition: FADE, sfx: [bed("horror-ambience", "@groans"), bed("tomb-ambience")] });
S("s117-afraid", [117, 118], E("saltmarsh", "day", { props: { near: true, lights: 0, fog: 0.3 } }), push(1.0, 1.1, 960, 640), [who("wrenKid", 700, { y: 1000, scale: 0.75, look: "right", expression: "sad" }), who("kid1", 1080, { y: 1000, scale: 0.75, look: "left", flip: true, expression: "worried", actions: [{ t: 0.3, do: "walk" }], path: [{ t: 0.3, x: 1080 }, { t: 1.6, x: 1260 }], facing: "left" }), who("kid2", 1260, { y: 1005, scale: 0.72, look: "left", flip: true, expression: "worried" }), who("s3", 1520, { y: 1000, at: "@parents-0.3", enter: "fade", flip: true, look: "left", expression: "worried" }), who("s1", 1720, { y: 1000, at: "@parents-0.3", enter: "fade", flip: true, look: "left", expression: "angry" })], { grade: "clean", transition: FADE, sfx: [bed("marsh-wind")] });
S("s119-notebooks", [119], E("clinic", "night", { props: { lamp: 1 } }), push(1.0, 1.15, 960, 620), [who("okafor", 1100, { y: 920, scale: 1.15, flip: true, look: "down", expression: "thinking", actions: [{ t: 0, do: "think" }] }), obj("notebook", 700, 780, 0.3, { props: { marks: 1 } }), obj("notebook", 760, 740, 0.3, { props: { marks: 1 }, rotate: -8 }), obj("notebook", 820, 700, 0.3, { at: "@three", enter: "pop", props: { marks: 1 }, rotate: 6 }), label("3 NOTEBOOKS", "@three", { y: 150, color: PALE, size: 36 })], { grade: "warm", vignette: 0.6, transition: FADE });
S("s120-questions", [120, 122], VOID("#2a2219", 0.3), push(1.0, 1.08), [obj("notebook", 960, 600, 1.2, { props: { marks: [[0, 0.1], ["end", 1]] } }), text("HUMAN?", "@human-0.3", 170, { x: 480, color: WARM, size: 54 }), text("ZOMBIE?", "@zombie-0.3", 170, { x: 960, color: RED, size: 54 }), text("SOMETHING NEW?", "@something-0.3", 170, { x: 1440, color: TEAL, size: 54 })], { grade: "warm", vignette: 0.55, transition: CUT, sfx: [fx("heartbeat-single", "@human"), fx("heartbeat-single", "@zombie"), fx("heartbeat-single", "@something")] });
S("s123-both", [123, 124], VOID("#2a2219", 0.3), push(1.0, 1.6, 960, 600, 1180, 600), [obj("notebook", 960, 600, 1.2, { props: { marks: 0.3, word: "Both.", write: [[0, 0], ["@Both-0.2", 0], ["@Both+0.7", 1]] } })], { grade: "warm", vignette: 0.6, transition: CUT, sfx: [hit("horror-drum", "@Both", VOICE - 4)], extra: 1.2 });

// ═══ 8. FEARED BY BOTH WORLDS (5:19) ═══
S("s125-ten", [125], E("saltmarsh", "sunset", { props: { near: true, gate: 0.8, lights: 1, fog: 0.6 } }), push(1.0, 1.15, 960, 640), [chapter("CHAPTER SEVEN", "FEARED BY BOTH"), who("wrenKid", 960, { y: 960, scale: 0.75, at: 1.6, enter: "fade", actions: [{ t: 1.6, do: "walk" }], path: [{ t: 1.6, y: 960, scale: 0.75 }, { t: "end", y: 1050, scale: 1.05 }] }), label("WREN · AGE 10", "@ten", { y: 760, x: 1440, color: TEAL, size: 34 })], { grade: "rust", vignette: 0.5, transition: SLOW, sfx: [fx("gate-open", 1), bed("marsh-wind")] });
S("s126-came", [126], E("marsh", "sunset", { props: { fog: 0.7 } }), push(1.0, 1.1, 960, 600), [who("wrenKid", 560, { y: 905, scale: 0.85, look: "right", expression: "neutral" }), horde(1500, 940, 1.0, { count: 9, rows: 3, width: 1100, eyes: 1 }, { path: [{ t: 0, x: 1800 }, { t: "end", x: 1360 }] })], { grade: "rust", vignette: 0.5, transition: FADE, sfx: [bed("horde-moan"), bed("marsh-wind")] });
S("s127-backed", [127, 128], E("marsh", "sunset", { props: { fog: 0.7 } }), push(1.1, 1.0, 960, 600), [who("wrenKid", 560, { y: 905, scale: 0.85, look: "right", expression: "neutral" }), horde(1360, 940, 1.0, { count: 9, rows: 3, width: 1100, still: [[0, 0], ["@stopped", 1]], back: [["@backed", 0], ["end", 1]] }, { path: [{ t: "@backed", x: 1360 }, { t: "end", x: 1600 }] })], { grade: "rust", vignette: 0.5, transition: CUT, sfx: [bed("horde-moan", 0, { until: "@stopped" }), bed("marsh-wind")] });
S("s129-feared", [129], VOID("#141c18", 0.4), push(1.1, 1.25, 960, 520), [face("zed3", 960, "worried", { look: "left" }), text("AFRAID", "@afraid-0.2", 170, { color: PALE, size: 64 })], { grade: "murky", vignette: 0.7, transition: CUT, sfx: [fx("zombie-gasp", "@afraid-0.4")], extra: 0.3 });
S("s130-terrified", [130, 131], E("saltmarsh", "night", { props: { near: true, lights: 1, fog: 0.5 } }), push(1.0, 1.12, 960, 640), [who("s1", 600, { y: 1000, look: "right", expression: "worried" }), who("s3", 860, { y: 1000, look: "right", expression: "worried", actions: [{ t: 0, do: "talk" }] }), who("s2", 1160, { y: 1000, flip: true, look: "left", expression: "angry" }), who("elder", 1420, { y: 1000, flip: true, look: "left", expression: "worried" }), obj("torch", 1300, 1010, 0.8)], { grade: "cool", vignette: 0.6, transition: FADE, sfx: [bed("marsh-wind")] });
S("s132-cure", [132, 134], E("marsh", "dawn", { weather: "fog", props: { fog: 0.8 } }), pan(600, 1300, 1.1, 600), [text("THE CURE?", "@cure-0.3", 180, { x: 560, color: TEAL, size: 54, until: "@child", exit: "fade" }), text("THE NEXT STAGE?", "@next-0.3", 180, { x: 1360, color: RED, size: 54, until: "@child", exit: "fade" }), who("zed1", 520, { y: 905, scale: 0.9, look: "right" }), who("zed2", 1240, { y: 910, flip: true, look: "left" }), who("zed3", 1540, { y: 900, scale: 0.9, flip: true, look: "left" }), go("wrenKid", 300, 1100, { y: 915, scale: 0.8, at: "@child-0.4", expression: "happy" })], { grade: "murky", vignette: 0.5, transition: FADE, sfx: [bed("marsh-wind")] });
S("s135-mob", [135, 136], E("saltmarsh", "night", { props: { near: true, lights: 1, fog: 0.4 } }), shake(push(1.0, 1.15, 960, 640), 2), [who("s1", 520, { y: 1000, scale: 1.1, look: "right", expression: "angry", actions: [{ t: 0.5, do: "point" }] }), who("s2", 820, { y: 1000, scale: 1.15, look: "right", expression: "angry" }), who("s3", 1120, { y: 1000, scale: 1.05, look: "right", expression: "angry" }), who("chair", 1400, { y: 1000, scale: 1.1, look: "right", expression: "angry", actions: [{ t: "@gone", do: "point" }] }), obj("torch", 680, 1010, 1), obj("torch", 1260, 1010, 1.05), eff("embers", 960, 700, { width: 1400, height: 600 })], { grade: "rust", vignette: 0.6, transition: CUT, sfx: [bed("mob"), bed("marsh-wind")] });
S("s137-door", [137, 138], E("wall", "night", { color: "#4a4038" }), push(1.0, 1.2, 960, 600), [obj("door", 960, 950, 1.5, { props: { lit: 0.5, open: 1 }, color: "#3a2f27" }), who("maraOld", 940, { y: 950, scale: 1.25, look: "camera", expression: "angry" }), who("wrenKid", 1150, { y: 950, scale: 0.8, look: "left", flip: true, expression: "worried" }), obj("torch", 300, 1100, 1.4, { depth: 1.3 }), obj("torch", 1640, 1100, 1.4, { depth: 1.3 })], { grade: "rust", vignette: 0.6, transition: CUT, sfx: [bed("mob", 0, { volume: 0.03 }), fx("music-box", "@Quiet", { volume: 0.04 })], extra: 0.6 });

// ═══ 9. THE SECRET IN THE BLOOD (6:00) ═══
S("s139-blood", [139], E("clinic", "night", { props: { lamp: 1 } }), push(1.05, 1.3, 860, 640), [chapter("CHAPTER EIGHT", "THE SECRET IN THE BLOOD"), who("okafor", 1140, { y: 920, scale: 1.15, flip: true, look: "left", expression: "surprised", actions: [{ t: 0, do: "point", angle: 15 }] }), obj("microscope", 820, 900, 1.2), obj("beaker", 620, 900, 0.9, { color: "#9b1b1b", props: { level: 0.4, label: "M." } })], { grade: "warm", vignette: 0.6, transition: SLOW, sfx: [bed("tomb-ambience")] });
TAG = REAL;
S("s140-cells", [140, 141], VOID("#0f1a22", 0.3), push(1.0, 1.1), [obj("mothercells", 960, 560, 1, { props: { flow: [[0, 0], ["@cross", 0.3], ["end", 1]] } }), label("REAL SCIENCE · FETAL MICROCHIMERISM", 0.3, { y: 120, size: 32 }), text("SOME OF THEM STAY", "@stay-0.2", 900, { color: TEAL, size: 54 })], { grade: "clean", vignette: 0.5, transition: ZOOM, sfx: [fx("whoosh-impact", 0)] });
S("s142-decades", [142, 143], VOID("#0f1a22", 0.3), push(1.1, 1.0), [obj("mothercells", 960, 560, 1, { props: { flow: 1 } }), text("FOUND DECADES LATER", "@decades-0.3", 160, { color: PALE, size: 54 }), obj("icon", 1500, 640, 2, { at: "@why-0.3", enter: "pop", screen: true, color: GOLD, props: { name: "question" } })], { grade: "clean", vignette: 0.5, transition: CUT });
TAG = STORY;
S("s144-fight", [144, 147], E("micro", "day", { props: { cells: 18, spores: [[0, 6], ["@infection", 20]], bacteria: 0, fluid: "#1a2a30" } }), shake(push(1.0, 1.25), 1), [label("IN OUR STORY", 0.2, { y: 120, color: TEAL, size: 32 }), text("WREN'S CELLS", "@cells-0.2", 200, { x: 560, color: TEAL, size: 50 }), eff("glow", 560, 540, { at: "@cells", width: 700, height: 500, color: TEAL, opacity: 0.4 }), text("THE INFECTION", "@infection-0.2", 200, { x: 1360, color: RED, size: 50 }), eff("glow", 1360, 560, { at: "@infection", width: 700, height: 500, color: RED, opacity: 0.35 })], { grade: "cool", vignette: 0.55, transition: WIPE, sfx: [hit("horror-drum", "@infection", VOICE - 4)], extra: 0.4 });
S("s148-secret", [148], VOID("#1a1612", 0.3), push(1.05, 1.2, 960, 520), [face("maraOld", 960, "worried", { look: "down" })], { grade: "murky", vignette: 0.7, transition: SLOW });
S("s149-bitten", [149, 150], VOID("#2a2016", 0.3), push(1.0, 1.25, 960, 540, 1000, 540), [obj("wrist", 960, 560, 1.2, { props: { scar: [[0, 0], ["@bitten-0.3", 0], ["@bitten+0.7", 1]], sleeve: "#4d5a3e" } }), label("YEARS EARLIER", 0.2, { y: 120, color: WARM, size: 32 })], { grade: "sepia", vignette: 0.65, transition: CUT, sfx: [hit("terror-sweep", "@bitten", VOICE - 8)] });
S("s151-never", [151, 153], E("clinic", "night", { props: { lamp: 1, cot: true } }), push(1.0, 1.18, 760, 620), [who("maraOld", 480, { y: 900, actions: [{ t: 0, do: "sit" }], look: "right", expression: "sad" }), who("okafor", 1020, { y: 920, flip: true, look: "left", expression: "thinking", expressions: [{ t: "@knew", is: "surprised" }] })], { grade: "warm", vignette: 0.6, transition: FADE });
S("s154-daughter", [154, 155], VOID("#2a1d14", 0.3), push(1.0, 1.15, 960, 540), [obj("beaker", 960, 760, 1.6, { until: "@daughter-0.2", exit: "fade", props: { level: 0.6 }, color: "#9fd8c9" }), obj("icon", 1180, 560, 2, { at: "@bottle", until: "@daughter-0.2", enter: "pop", exit: "fade", color: RED, props: { name: "cross" }, screen: true }), faceKid("wrenKid", 960, "happy", { at: "@daughter-0.2", enter: "fade", look: "camera" })], { grade: "dream", vignette: 0.55, transition: CUT, extra: 1.0 });

// ═══ 10. THE CHOICE (6:46) ═══
S("s156-choice", [156, 158], E("council", "night"), push(1.0, 1.12, 960, 620), [chapter("CHAPTER NINE", "THE CHOICE"), obj("table", 960, 920, 1.6), obj("lantern", 960, 800, 0.5), who("wrenTeen", 520, { y: 920, scale: 1.05, look: "right", expression: "neutral" }), who("elder", 1180, { y: 920, flip: true, look: "left", expression: "angry" }), who("chair", 1420, { y: 920, flip: true, look: "left", actions: [{ t: "@Stay", do: "talk" }] }), text("STAY AND BE STUDIED", "@Stay-0.2", 300, { x: 600, color: PALE, size: 44 }), text("LEAVE FOREVER", "@walk-0.2", 300, { x: 1320, color: RED, size: 44 })], { grade: "warm", vignette: 0.6, transition: SLOW, sfx: [bed("tomb-ambience")] });
S("s159-neither", [159], VOID("#121a1c", 0.4), push(1.12, 1.2, 960, 520), [face("wrenTeen", 960, "confident", { look: "camera" })], { grade: "cool", vignette: 0.65, transition: CUT, sfx: [hit("horror-drum", "@neither", VOICE - 6)], extra: 0.3 });
S("s160-gate", [160], E("saltmarsh", "dawn", { props: { near: true, gate: [[0, 0], ["@opened-0.8", 0], ["@opened+0.6", 1]], lights: 0.4, fog: 0.9 } }), push(1.0, 1.25, 960, 620), [who("wrenTeen", 960, { y: 975, scale: 1.0, at: "@opened", enter: "fade", look: "camera" }), eff("glow", 960, 760, { at: "@opened", width: 700, height: 500, color: "#fff1d0", opacity: 0.5 })], { grade: "dream", vignette: 0.5, transition: FADE, sfx: [fx("gate-open", "@opened-0.8"), bed("marsh-wind")] });
S("s161-waiting", [161, 162], E("marsh", "dawn", { weather: "fog", props: { fog: 1 } }), pan(620, 1300, 1.1, 600), [horde(960, 940, 1.05, { count: 22, rows: 6, width: 4200, still: 1, turn: 1, eyes: 0.6 }, { depth: 0.95 })], { grade: "cool", vignette: 0.5, transition: FADE, sfx: [bed("wind-howl"), bed("marsh-wind")] });
S("s163-figure", [163], E("marsh", "dawn", { weather: "fog", props: { fog: 0.9 } }), push(1.0, 1.4, 960, 640, 960, 600), [horde(960, 940, 1.0, { count: 18, rows: 5, width: 3600, still: 1, turn: 1, eyes: 0.5 }, { depth: 0.9 }), who("quietOld", 960, { y: 960, scale: 1.2, look: "camera", at: "@front", enter: "fade" }), obj("musicbox", 1060, 870, 0.32, { at: "@rusted", enter: "fade", props: { open: 1, rust: 1 } }), who("wrenTeen", 300, { y: 1040, scale: 1.4, look: "right", depth: 1.15 })], { grade: "cool", vignette: 0.55, transition: CUT, sfx: [bed("marsh-wind")] });
S("s164-handle", [164], VOID("#1c1a16", 0.5), push(1.05, 1.25, 960, 640), [obj("musicbox", 960, 800, 1.6, { props: { open: 1, turning: true, notes: true, rust: 1 } })], { grade: "sepia", vignette: 0.7, transition: CUT, sfx: [fx("music-box", 0, { volume: rd(Math.min(db(VOICE - 12 - LOUD["music-box"][0]), db(VOICE - 6 - LOUD["music-box"][1]))) })] });
S("s165-name", [165, 166], VOID("#141a18", 0.5), push(1.05, 1.35, 960, 520), [face("quietOld", 960, "neutral", { look: "camera", speaks: [["@name-0.2", "@name+0.6"]], expressions: [{ t: "@name", is: "happy" }] }), text("\"Wren.\"", "@name+0.3", 170, { color: PALE, size: 66, enter: "fade", style: "headline" })], { grade: "dream", vignette: 0.7, transition: CUT, sfx: [fx("music-box", 0, { volume: 0.035 })], extra: 1.6 });

// ═══ 11. THE REVELATION (7:19) ═══
S("s167-there", [167, 168], E("seatown", "sunset"), push(1.15, 1.0, 960, 600), [who("wrenAdult", 960, { y: 900, scale: 1.25, look: "camera", expression: "neutral", turns: [{ t: 0.2, to: "right" }], expressions: [{ t: "@Wren", is: "happy" }] }), label("WREN", "@Wren", { y: 760, x: 1380, color: TEAL, size: 40 })], { grade: "warm", vignette: 0.4, transition: SLOW });
S("s169-question", [169, 170], VOID("#1c2224", 0.3), push(1.1, 1.22, 960, 520), [face("wrenAdult", 960, "neutral", { look: "camera" }), text("HUMAN?", "@human-0.2", 180, { x: 560, color: WARM, size: 54 }), text("ONE OF THEM?", "@one-0.2", 180, { x: 1360, color: PALE, size: 54 })], { grade: "cool", vignette: 0.6, transition: CUT });
S("s171-change", [171, 173], E("marsh", "dawn", { props: { fog: [[0, 1], ["end", 0.15]], settlement: true, lights: 0 } }), push(1.0, 1.12, 960, 520), [text("NOT TO END THE WORLD", "@end-0.3", 200, { color: PALE, size: 52, until: "@change-0.3", exit: "fade" }), text("TO CHANGE IT", "@change-0.2", 200, { color: TEAL, size: 60 })], { grade: "dream", vignette: 0.4, transition: SLOW, sfx: [bed("marsh-wind", 0, { volume: 0.03 })] });
S("s174-love", [174, 175], E("ruincity", "night", { seed: 16, props: { fog: 0.4, cars: false } }), push(1.25, 1.0, 960, 640), [obj("crate", 690, 970, 0.62), obj("crate", 1250, 970, 0.62), who("mara", 760, { y: 905, actions: [{ t: 0, do: "sit" }], look: "right" }), who("quiet", 1180, { y: 905, actions: [{ t: 0, do: "sit" }], flip: true, look: "left" }), eff("fireflies", 960, 700, { width: 1700, height: 500 }), text("SOMEONE WILLING TO LOVE WHAT THEY WERE AFRAID OF", "@Someone-0.2", 200, { color: GOLD, size: 50, maxWidth: 1400 })], { grade: "sepia", vignette: 0.5, transition: SLOW });
S("s176-more", [176, 177], E("seatown", "day"), pan(700, 1240, 1.1, 600), [go("newKid", 300, 1100, { run: true, y: 905, scale: 0.75 }), go("newKid2", 120, 900, { run: true, y: 915, scale: 0.72 }), go("kid1", -60, 700, { run: true, y: 925, scale: 0.72 }), who("wrenAdult", 1480, { y: 905, flip: true, look: "left", expression: "happy" }), obj("gull", 600, 260, 0.7, { path: [{ t: 0, x: 300 }, { t: "end", x: 1400 }] })], { grade: "warm", transition: WIPE });
S("s178-monsters", [178, 179], E("seatown", "sunset"), push(1.05, 1.15, 960, 600), [who("newKid", 700, { y: 905, scale: 0.8, look: "camera", expression: "neutral" }), who("newKid2", 1220, { y: 910, scale: 0.78, flip: true, look: "camera", expression: "happy" }), text("MONSTERS", "@monsters-0.2", 200, { x: 560, color: RED, size: 58 }), text("THE FUTURE", "@future-0.2", 200, { x: 1360, color: TEAL, size: 58 })], { grade: "warm", vignette: 0.45, transition: CUT });
S("s180-door", [180, 181], E("wall", "night", { color: "#3a3430" }), push(1.0, 1.25, 960, 600), [obj("door", 960, 950, 1.6, { props: { lit: [[0, 0], ["@open-0.3", 0], ["end", 0.8]], open: [["@open-0.3", 0], ["end", 0.25]] }, color: "#2e2620" }), text("WOULD YOU OPEN IT?", "@open-0.2", 200, { color: PALE, size: 64 })], { grade: "cool", vignette: 0.6, transition: FADE, sfx: [bed("marsh-wind", 0, { volume: 0.03 }), hit("door-knock", "@knocked", VOICE - 6), hit("door-knock", "@knocked+0.9", VOICE - 8), fx("door-creak", "@open")], extra: 1.0 });
project.scenes.push({ id: "s182-end", duration: 4.5, environment: E("window", "night", { props: { view: "sky", open: 1, streaks: 0.4 } }), camera: push(1.1, 1.0, 960, 640), elements: [obj("musicbox", 960, 886, 1.0, { props: { open: 1, turning: true, notes: true, rust: 1 } }), text("WOULD YOU OPEN THE DOOR?", 0.6, 300, { style: "title", color: PALE, enter: "fade", size: 70, background: PLATE }), text("TELL US IN THE COMMENTS", 1.4, 420, { style: "label", enter: "fade", background: PLATE })], tag: NONE, grade: "dream", vignette: 0.55, transition: SLOW, sfx: [fx("music-box", 0, { volume: 0.06 })] });

// ── props are not resolved by the engine, so "@word" / "end" inside animatable prop tracks are resolved here,
// with the same slicing the engine uses (narrationOverlap 1 → scene time 0 = start of the narration slice).
const normW = (w) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
const CAP = JSON.parse(fs.readFileSync(path.join(DIR, "captions.json"), "utf8")).map((w) => ({ t: normW(w.text), s: w.startMs / 1000, e: w.endMs / 1000 }));
project.scenes.forEach((sc, i) => {
  const r = META[sc.id];
  if (!r) return;
  const words0 = CAP.filter((w) => w.s >= starts[r[0]] - 0.15 && w.e <= ends[r[1] ?? r[0]] + 0.15);
  const first = words0[0].s, last = words0[words0.length - 1].e;
  let prevEnd = -Infinity, nextStart = Infinity;
  for (let k = i - 1; k >= 0; k--) { const pr = META[project.scenes[k].id]; if (pr) { prevEnd = ends[pr[1] ?? pr[0]]; break; } }
  for (let k = i + 1; k < project.scenes.length; k++) { const nr = META[project.scenes[k].id]; if (nr) { nextStart = starts[nr[0]]; break; } }
  const s0 = Math.max(0, first - 0.18, (prevEnd + first) / 2), s1 = Math.min(last + 0.45, (last + nextStart) / 2);
  const nx = project.scenes[i + 1], tr = nx ? nx.transition ?? project.defaultTransition : null;
  const nt = !tr || tr.type === "none" ? 0 : tr.duration ?? 0.5;
  const dur = s1 - s0 + Math.max(sc.hold ?? 0.4, nt + 2 / 30);
  const ws = words0.map((w) => ({ ...w, s: w.s - s0 }));
  const rt = (v) => {
    if (typeof v === "number") return v;
    const e = /^end\s*([+-]\s*[\d.]+)?$/.exec(v);
    if (e) return dur + (e[1] ? parseFloat(e[1].replace(/\s/g, "")) : 0);
    const c = /^@([^+-]+?)\s*([+-]\s*[\d.]+)?$/.exec(v);
    if (!c) throw new Error(sc.id + ": bad time " + v);
    const tg = normW(c[1]);
    const w = ws.find((x) => x.t === tg || (x.t.startsWith(tg) && x.t.length - tg.length <= 3));
    if (!w) throw new Error(sc.id + ": cue " + v + " not in narration");
    return Math.round((w.s + (c[2] ? parseFloat(c[2].replace(/\s/g, "")) : 0)) * 100) / 100;
  };
  for (const el of sc.elements) {
    if (!el.props) continue;
    for (const [k, v] of Object.entries(el.props)) {
      if (Array.isArray(v) && v.length && v.every((p) => Array.isArray(p) && p.length === 2)) el.props[k] = v.map(([t, x]) => [rt(t), x]);
    }
  }
  if (sc.environment?.props) for (const [k, v] of Object.entries(sc.environment.props)) {
    if (Array.isArray(v) && v.length && v.every((p) => Array.isArray(p) && p.length === 2)) sc.environment.props[k] = v.map(([t, x]) => [rt(t), x]);
  }
});

fs.writeFileSync(path.join(DIR, "storyboard.json"), JSON.stringify(project, null, 2) + "\n");
const covered = new Set(project.scenes.flatMap((s) => (s.narration ? s.narration.split(" ") : [])));
console.log(`✓ projects/video-004/storyboard.json: ${project.scenes.length} scenes`);
