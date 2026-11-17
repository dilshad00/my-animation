// Generates projects/video-005/storyboard.json (anime style). Narration is read from timing.md by sentence number.
// Run: node projects/video-005/build/storyboard.cjs
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

// ── mix: same files and method as video-004 (rms of loudest 30 %, loudest 100 ms, dBFS). Narration (Chatterbox, -16 LUFS) = [-13.4, -8.2].
const VOICE = -13.4;
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
const hit = (n, at, peak = VOICE - 4) => ({ at, src: src(n), volume: rd(db(Math.min(peak, VOICE - 6) - 2 - LOUD[n][1])) });
const MUSIC = { echoes: -18.1, "piano-horror": -17.2, "night-sky": -11.8, "dark-shadows": -10.3, "fright-night": -15.9, delirium: -8.7, "silent-descent": -14.6, "drawing-the-sky": -14.5 };
const music = (n, from, o = {}) => ({ src: n === "drawing-the-sky" ? `music/tech/${n}.mp3` : `music/zombie/${n}.mp3`, ...(from ? { from } : {}), volume: rd(db(VOICE - 11 - MUSIC[n])), duckTo: rd(db(VOICE - 21 - MUSIC[n])), ...o });

// ── look ──
const STORY = { text: "STORY", color: "#9ff0c8" };
const REAL = { text: "REAL SCIENCE", color: "#ffffff" };
const NONE = "none";
const MINT = "#9ff0c8", RED = "#ff4a5a", PALE = "#eef4ff", GOLD = "#ffd36a", SKY = "#8fc8ff", LIME = "#c8ff6a";
const push = (z0, z1, x0 = 960, y0 = 540, x1 = x0, y1 = y0) => ({ keys: [{ t: 0, zoom: z0, x: x0, y: y0 }, { t: "end", zoom: z1, x: x1, y: y1, ease: "smooth" }] });
const pan = (x0, x1, z = 1.08, y = 540) => push(z, z, x0, y, x1, y);
const hold = (z = 1, x = 960, y = 540) => ({ keys: [{ t: 0, zoom: z, x, y }] });
const shake = (c, n = 4) => ({ ...c, shake: n });
const FADE = { type: "fade", duration: 0.5 }, SLOW = { type: "fade", duration: 1 }, CUT = { type: "none" }, WIPE = { type: "wipe", duration: 0.4, direction: "left" }, IRIS = { type: "iris", duration: 0.6 }, ZOOM = { type: "zoom", duration: 0.45 }, WHIP = { type: "whip", duration: 0.3, direction: "left" };
const PLATE = "rgba(8,8,20,0.66)";
const text = (t, at, y, o = {}) => ({ kind: "text", text: t, style: "anime", at, x: 960, y, enter: "rise", maxWidth: 1500, align: "center", ...o });
const label = (t, at, o = {}) => ({ kind: "text", text: t, style: "label", at, x: 960, y: 130, enter: "fade", ...o });
const obj = (type, x, y, scale, o = {}) => ({ kind: "object", type, x, y, scale, ...o });
const eff = (type, o = {}) => ({ kind: "effect", type, ...o });
// anime busts: bottom-centre at x, default y 1120. Medium shot = scale 1; close-up = scale 1.5, y 1500.
const who = (w, x, o = {}) => ({ kind: "character", who: w, x, ...o });
const close = (w, x, expression, o = {}) => who(w, x, { y: 1500, scale: 1.5, expression, ...o });
const zed = (x, y, scale, props = {}, o = {}) => obj("zzombie", x, y, scale, { props, ...o });
const day = (t, sub, color = RED) => obj("zdaycard", 960, 470, 1, { at: 0.15, until: 2.9, exit: "fade", screen: true, color, props: { text: t, sub } });
const E = (type, time = "night", extra = {}) => ({ type, time, ...extra });
const CLOSE = (color = "#141a34", time = "night") => ({ type: "anime-closeup", time, color });
const BOARD = (board = "", time = "day") => ({ type: "anime-classroom", time, props: { board } });

const project = {
  $schema: "../../storyboard.schema.json",
  id: "video-005",
  title: "What If a Zombie Outbreak Started Tonight?",
  topic: "Anime-style what-if: a fictional zombie outbreak followed day by day through two students, with real science (rabies, Ophiocordyceps, Munz 2009, Cornell 2015, CDC 2011).",
  style: "anime",
  fps: 30, width: 1920, height: 1080,
  theme: { accent: MINT, accent2: RED, text: "#ffffff", dark: "#070914", font: "Poppins" },
  audio: { wordsPerMinute: 130, narrationOverlap: 1, music: [] },
  subtitles: { enabled: true, position: "bottom", maxWords: 7, size: 46 },
  defaultTag: STORY,
  cast: {
    hikari: {},
    ren: {},
  },
  defaultTransition: FADE,
  scenes: [],
};

const KEEP = 0.6;
const holdAfter = (last, k) => (starts[last + 1] === undefined ? 0 : Math.max(0, Math.round((starts[last + 1] - ends[last]) * k * 100) / 100));
let TAG = STORY;
const META = {};
// text over painted scenery gets a dark plate; anything low is lifted clear of the subtitles
const backed = (els) => els.map((e) => {
  if (e.kind !== "text") return e;
  if (typeof e.y === "number" && e.y > 840) return { ...e, y: 835 };
  return e;
});
const S = (id, range, environment, camera, elements, o = {}) => (META[id] = range, project.scenes.push({
  id, narration: say(range), environment, camera, elements: backed(elements.flat(Infinity)), tag: TAG, hold: holdAfter(range[1] ?? range[0], KEEP) + (o.extra ?? 0), ...o, extra: undefined,
}));

// ═════════════════════════ SCENES ═════════════════════════
require("./scenes.cjs")({ S, project, setTag: (t) => (TAG = t), STORY, REAL, NONE, MINT, RED, PALE, GOLD, SKY, LIME, push, pan, hold, shake, FADE, SLOW, CUT, WIPE, IRIS, ZOOM, WHIP, text, label, obj, eff, who, close, zed, day, E, CLOSE, BOARD, fx, bed, hit, music, VOICE, PLATE });

// ── "@word" / "end" inside animatable prop tracks are resolved here (the engine only resolves at/until/sfx),
// with the same slicing the engine uses (narrationOverlap 1 → scene time 0 = start of the narration slice).
const normW = (w) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
const CAP = JSON.parse(fs.readFileSync(path.join(DIR, "captions.json"), "utf8")).map((w) => ({ t: normW(w.text), s: w.startMs / 1000, e: w.endMs / 1000 }));
project.scenes.forEach((sc, i) => {
  const r = META[sc.id];
  if (!r) return;
  const words0 = CAP.filter((w) => w.s >= starts[r[0]] - 0.15 && w.e <= ends[r[1] ?? r[0]] + 0.15);
  if (!words0.length) throw new Error(sc.id + ": no caption words");
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
  const fixTracks = (props) => {
    if (!props) return;
    for (const [k, v] of Object.entries(props)) {
      if (Array.isArray(v) && v.length && v.every((p) => Array.isArray(p) && p.length === 2)) props[k] = v.map(([t, x]) => [rt(t), x]);
    }
  };
  for (const el of sc.elements) fixTracks(el.props);
  fixTracks(sc.environment?.props);
});

fs.writeFileSync(path.join(DIR, "storyboard.json"), JSON.stringify(project, null, 2) + "\n");
const n = Object.keys(sentences).length;
const used = new Set(Object.values(META).flatMap(([a, b = a]) => Array.from({ length: b - a + 1 }, (_, i) => a + i)));
const missing = Object.keys(sentences).map(Number).filter((k) => !used.has(k));
console.log(`✓ projects/video-005/storyboard.json: ${project.scenes.length} scenes, ${used.size}/${n} sentences` + (missing.length ? `, MISSING: ${missing.join(",")}` : ""));
