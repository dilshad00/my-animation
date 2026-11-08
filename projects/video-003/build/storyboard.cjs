// Generates projects/video-003/storyboard.json. Narration is read from timing.md by sentence number.
// Run: node projects/video-003/build/storyboard.cjs
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

// ── mix: levels derive from each file's measured loudness [rms, loudest 100 ms] in dBFS ──
const VOICE = -26.5;
const LOUD = {
  "big-impact": [-22.1, -10.1], "campfire-wind": [-23.5, -16.2], crickets: [-35, -20.5], "deep-impact": [-18.9, -12.1], "drum-hit": [-22.5, -14.5],
  "fire-whoosh": [-22.1, -11], "forest-birds": [-42.8, -28.1], "heart-mystery": [-19.2, -13.8], heartbeat: [-17, -8.3], punch: [-22.1, -17.1],
  "rain-forest": [-28.3, -27.1], "river-birds": [-36.4, -28.6], running: [-33.4, -21.5], "steps-grass": [-45.9, -32.3], "steps-stone": [-42.3, -30.5],
  "stone-hit": [-23, -17.5], "tribal-drums": [-20, -12.3], "wind-forest": [-41.5, -35.4],
  "zeus/whoosh-fast": [-26.1, -19.2], "zeus/whoosh-impact": [-25.6, -13.6], "zeus/sea": [-16.2, -8.5], "zeus/crowd": [-18.8, -14.2], "zeus/army": [-14.6, -9.2], "zeus/thunder-distant": [-21.1, -9.9],
};
const db = (x) => 10 ** (x / 20);
const rd = (x) => Math.round(Math.min(1, x) * 1000) / 1000;
const src = (n) => (n.startsWith("zeus/") ? `sfx/${n}.mp3` : `sfx/tech/${n}.mp3`);
const fx = (n, at = 0) => ({ at, src: src(n), volume: rd(Math.min(db(VOICE - 12 - LOUD[n][0]), db(-30 - LOUD[n][1]))) });
const bed = (n, at = 0) => ({ at, src: src(n), loop: true, volume: rd(Math.min(db(VOICE - 18 - LOUD[n][0]), db(-34 - LOUD[n][1]))) });
// Impacts stay well under the voice: their tails run into the next line of speech.
const hit = (n, at, peak = -30) => ({ at, src: src(n), volume: rd(db(peak - LOUD[n][1])) });
const WHOOSH = fx("zeus/whoosh-fast", 0);
const MUSIC = { vastness: -13.7, "forest-walk": -13.8, "natures-fabric": -15.2, "forest-mist": -17.8, "piano-reflections": -16.1, "epical-drums-03": -20.2, "drawing-the-sky": -17.5 };
const music = (n, from) => ({ src: `music/tech/${n}.mp3`, ...(from ? { from } : {}), volume: rd(db(-34 - MUSIC[n])), duckTo: rd(db(VOICE - 20 - MUSIC[n])) });

// ── helpers ──
const REAL = { text: "REAL HISTORY", color: "#ffffff" };
const WHATIF = { text: "WHAT IF", color: "#5bc0eb" };
const NONE = "none";
const GOLD = "#f2c14e", RED = "#e5383b", BLUE = "#5bc0eb", WARM = "#ffb066";
const push = (z0, z1, x0 = 960, y0 = 540, x1 = x0, y1 = y0) => ({ keys: [{ t: 0, zoom: z0, x: x0, y: y0 }, { t: "end", zoom: z1, x: x1, y: y1, ease: "smooth" }] });
const pan = (x0, x1, z = 1.08, y = 540) => push(z, z, x0, y, x1, y);
const shake = (c, n = 6) => ({ ...c, shake: n });
const FADE = { type: "fade", duration: 0.35 }, CUT = { type: "none" }, WIPE = { type: "wipe", duration: 0.3, direction: "right" }, WHIP = { type: "whip", duration: 0.3, direction: "left" };
const text = (t, at, y, o = {}) => ({ kind: "text", text: t, style: "headline", at, x: 960, y, enter: "rise", maxWidth: 1500, align: "center", ...o });
const label = (t, at, o = {}) => ({ kind: "text", text: t, style: "label", at, x: 960, y: 130, enter: "fade", ...o });
const obj = (type, x, y, scale, o = {}) => ({ kind: "object", type, x, y, scale, ...o });
const eff = (type, x, y, o = {}) => ({ kind: "effect", type, x, y, ...o });
const who = (w, x, o = {}) => ({ kind: "character", who: w, x, y: 900, ...o });
const go = (w, x0, x1, o = {}) => who(w, x0, { actions: [{ t: 0, do: o.run ? "run" : "walk" }], path: [{ t: 0, x: x0 }, { t: "end", x: x1 }], ...o });
const face = (w, x, expression, o = {}) => who(w, x, { y: 1740, scale: 3.6, expression, look: "camera", ...o });
const X = (x, y, at, s = 2.2) => obj("icon", x, y, s, { at, enter: "pop", screen: true, zIndex: 40, color: RED, shadow: false, props: { name: "cross" } });
const map = (views, extra = {}) => ({ kind: "diagram", type: "map", x: 960, y: 540, width: 1920, height: 1080, at: 0, data: { views, ...extra } });
const dia = (type, data, o = {}) => ({ kind: "diagram", type, x: 960, y: 560, width: 1400, height: 620, at: 0.1, data, ...o });
const fire = (x, y, o = {}) => [obj("hearth", x, y, o.s ?? 1), eff("fire", x, y - 12, { width: 150 * (o.s ?? 1), height: 220 * (o.s ?? 1) }), eff("embers", x, y - 120, { width: 240, height: 340 })];
const STUDIO = (c = "#1b2233", c2 = "#07090f") => ({ type: "gradient", color: c, props: { color2: c2 } });
const EARTHY = STUDIO("#3a2a1c", "#120c07");
const BLACK = { type: "gradient", color: "#050508", props: { color2: "#000000" } };
const E = (type, time = "day", extra = {}) => ({ type, time, ...extra });

const project = {
  $schema: "../../storyboard.schema.json",
  id: "video-003",
  title: "What If Technology Never Existed?",
  topic: "Real prehistory and history, then a clearly labelled speculative world that never moved past simple tools.",
  fps: 30, width: 1920, height: 1080,
  theme: { accent: "#f2c14e", accent2: "#5bc0eb", text: "#ffffff", dark: "#0d1321", font: "Poppins" },
  audio: {
    wordsPerMinute: 165, narrationOverlap: 1,
    music: [music("vastness"), music("forest-walk", "s032-band"), music("natures-fabric", "s071-feet"), music("forest-mist", "s081-khipu"), music("piano-reflections", "s098-healers"), music("epical-drums-03", "s112-war"), music("drawing-the-sky", "s126-dark")],
  },
  subtitles: { enabled: true, position: "bottom", maxWords: 7, size: 46 },
  defaultTag: REAL,
  cast: {
    ama: { preset: "zoe", name: "Ama", hair: "long", hairColor: "#2a1a10", outfit: "robe", top: "#8b6a45", bottom: "#6f5236", shoes: "#8a5a3b", skin: "#a9714b", accent: "#c9a66b", glasses: false },
    tavi: { preset: "sam", name: "Tavi", hairColor: "#1e130b", outfit: "robe", top: "#9b7a50", bottom: "#7c603e", shoes: "#8a5a3b", skin: "#a9714b", accent: "#c9a66b", glasses: false },
    hunter: { preset: "jordan", name: "Oru", outfit: "robe", top: "#6f5236", bottom: "#5a4229", shoes: "#6b4227", skin: "#7a4b2e", accent: "#c9a66b", glasses: false },
    elder: { preset: "grandpa", name: "Elder", hair: "long", hairColor: "#c9c4ba", outfit: "robe", top: "#5f5140", bottom: "#4d4134", shoes: "#8a5a3b", skin: "#a9714b", accent: "#8d7a5f", glasses: false },
    healer: { preset: "priya", name: "Healer", hair: "bun", hairColor: "#22160d", outfit: "robe", top: "#5d6b3c", bottom: "#4b5731", shoes: "#8a5a3b", skin: "#8c5a39", accent: "#c9a66b", glasses: false },
    chief: { preset: "marcus", name: "Chief", outfit: "robe", beard: true, top: "#8c3e1f", bottom: "#6d2f18", shoes: "#6b4227", skin: "#8c5a39", accent: "#f2c14e", glasses: false },
    runner: { preset: "alex", name: "Chasqui", hairColor: "#17100a", outfit: "tshirt", top: "#c0392b", bottom: "#e8dcc2", shoes: "#a97c50", skin: "#b0784f", accent: "#f2c14e", glasses: false },
    alex: {}, sam: {},
  },
  defaultTransition: FADE,
  scenes: [],
};

const KEEP = 0.5;
const holdAfter = (last, k) => (starts[last + 1] === undefined ? 0 : Math.max(0, Math.round((starts[last + 1] - ends[last]) * k * 100) / 100));
let TAG = NONE;
// Headlines over painted scenery get a dark backing so they stay legible over clouds and mountains.
const PLATE = "rgba(13,19,33,0.72)";
// Anything placed where the subtitles live is lifted clear of them.
const backed = (els, env) => els.map((e) => {
  if (e.kind !== "text") return e;
  if (typeof e.y === "number" && e.y > 840) return { ...e, y: 835, background: e.style === "headline" ? e.background ?? PLATE : e.background };
  return e.style === "headline" && !e.background && env.type !== "gradient" ? { ...e, background: PLATE } : e;
});
const S = (id, range, environment, camera, elements, o = {}) => project.scenes.push({
  id, narration: say(range), environment, camera, elements: backed(elements.flat(Infinity), environment), tag: TAG, hold: holdAfter(range[1] ?? range[0], KEEP), ...o,
});

// ═══ 1. HOOK ═══
TAG = REAL;
S("s001-earth", [1], E("space", "night"), push(1.0, 1.12), [obj("nightearth", 960, 540, 1, { props: { lights: 1 } }), text("≈ HALF OF HUMANITY", "@half", 180, { color: GOLD })], { sfx: [bed("wind-forest")], transition: FADE });
S("s002-crops", [2], E("farm", "sunset", { props: { crop: [[0, 1], [2.2, 0.05]], barn: true } }), shake(push(1.1, 1.0), 2), [obj("fertiliser", 480, 900, 1.5, { until: "@away", exit: "fade" }), X(480, 720, "@away"), text("BILLIONS", "@billions", 300, { color: RED, enter: "pop" })], { transition: CUT, sfx: [hit("deep-impact", "end-0.4")] });
TAG = WHATIF;
S("s003-everything", [3], E("space", "night"), push(1.15, 1.0), [obj("nightearth", 960, 540, 1, { props: { lights: [[0, 1], [1.8, 0.45]] } }), text("NOW TAKE AWAY EVERYTHING", 0.1, 170)], { transition: CUT });
S("s004-engines", [4], E("city", "day", { props: { traffic: true } }), shake(push(1, 1.1), 3), [text("THE ENGINES", 0, 300, { enter: "pop" }), X(960, 610, 0.2, 1.8)], { transition: CUT, sfx: [fx("stone-hit", 0.2)] });
S("s005-medicine", [5], E("lab", "day"), push(1.15, 1), [obj("microscope", 680, 860, 1.4), obj("flask", 1240, 860, 1.6), text("THE MEDICINE", 0, 300, { enter: "pop" }), X(960, 610, 0.2, 1.8)], { transition: CUT, sfx: [fx("stone-hit", 0.2)] });
S("s006-alphabet", [6], E("classroom", "day", { props: { board: "A B C" } }), push(1, 1.14), [text("THE ALPHABET", 0, 700, { enter: "pop" }), X(1400, 430, 0.2, 1.8)], { transition: CUT, sfx: [fx("stone-hit", 0.2)] });
S("s007-wheel", [7], E("street", "day"), shake(push(1.14, 1), 3), [obj("bicycle", 960, 890, 2.2), text("EVEN THE WHEEL", 0, 300, { enter: "pop", color: GOLD }), X(1270, 700, 0.25, 1.8)], { transition: CUT, sfx: [hit("deep-impact", "end-0.25")] });
S("s008-house", [8], E("suburb", "sunset"), push(1, 1.16), [obj("house", 960, 880, 2, { until: "@gone", exit: "fade" }), text("YOUR HOUSE", 0, 200, { until: "@gone", exit: "fade" })], { transition: CUT });
S("s009-city", [9], E("city", "night"), push(1.16, 1), [eff("smoke", 960, 900, { at: "@gone", width: 1600, height: 900 }), text("YOUR CITY", 0, 200, { until: "@gone", exit: "fade" })], { transition: CUT });
S("s010-you", [10], BLACK, push(1, 1.08), [face("alex", 960, "worried", { until: "end-0.2", exit: "fade" }), obj("phone", 1320, 760, 1.2, { until: "@chance", exit: "fade" })], { transition: CUT, sfx: [fx("heartbeat", 0.2), fx("heartbeat", 1.1)] });
S("s011-title", [11], E("savanna", "dawn"), push(1.2, 1.0, 960, 620), [eff("dust", 960, 620, { width: 1920, height: 900 }), obj("stonetool", 960, 610, 1.5, { at: 0.1, enter: "zoom" }), text("WHAT IF TECHNOLOGY NEVER EXISTED?", "@technology-0.3", 210, { style: "title", color: GOLD, maxWidth: 1600, enter: "zoom" })], { transition: FADE, sfx: [hit("big-impact", "end-0.5"), bed("wind-forest")] });

// ═══ 2. WHAT TECHNOLOGY IS ═══
TAG = REAL;
S("s012-screens", [12, 13], E("apartment", "day"), push(1, 1.12), [who("alex", 760, { expression: "thinking", actions: [{ t: 0, do: "think" }] }), obj("tv", 1320, 700, 1.1, { at: "@technology", enter: "pop" }), obj("phone", 1040, 660, 0.9, { at: "@picture", enter: "pop" }), obj("laptop", 1560, 840, 0.9, { at: "@screens", enter: "pop" })], { tag: NONE, transition: FADE });
const tech = (id, n, o, word) => S(id, [n], EARTHY, push(1, 1.14), [o, text(word, 0.25, 840, { color: GOLD, enter: "pop" }), eff("dust", 960, 540, { width: 1400, height: 800 })], { tag: NONE, transition: WIPE, sfx: [fx("stone-hit", 0.1)] });
tech("s014-knot", 14, obj("knot", 960, 470, 1.5, { enter: "zoom" }), "TECHNOLOGY");
tech("s015-basket", 15, obj("basket", 960, 720, 1.8, { enter: "zoom" }), "TECHNOLOGY");
tech("s016-stick", 16, obj("sharpstick", 960, 460, 1.1, { enter: "zoom", rotate: 72 }), "TECHNOLOGY");
S("s017-older", [17], E("savanna", "sunset"), pan(760, 1160), [text("OLDER THAN WE ARE", 0.1, 280, { color: "#ffffff" })], { sfx: [bed("wind-forest")] });
S("s018-lomekwi", [18], STUDIO(), {}, [map([{ t: 0, center: [20, 5], zoom: 1 }, { t: 3, center: [36, 3.9], zoom: 6, ease: "smooth" }], { pins: [{ lon: 35.9, lat: 3.9, label: "Lomekwi, Kenya", at: "@Lomekwi" }] }), obj("stonetool", 1560, 730, 0.9, { at: "@stone", enter: "pop", screen: true }), text("3.3 MILLION YEARS OLD", "@three", 900, { color: GOLD })], {});
S("s019-genus", [19], STUDIO("#21283b"), push(1, 1.06), [dia("timeline", [{ label: "3.3 M", text: "Oldest stone tools" }, { label: "2.8 M", text: "Earliest known Homo" }, { label: "300 K", text: "Homo sapiens" }, { label: "Now", text: "You" }])], { transition: WIPE });
TAG = WHATIF;
S("s020-nohumans", [20], E("savanna", "day"), pan(1200, 760), [eff("leaves", 960, 300, { width: 1800, height: 800 }), text("NO TOOLS, NO US", "@humans", 280)], { tag: WHATIF, sfx: [bed("forest-birds")] });
S("s021-shaped", [21], E("camp", "sunset"), push(1.25, 1.05, 760, 680, 900, 620), [who("hunter", 780, { scale: 1.5, y: 960, actions: [{ t: 0, do: "present" }], expression: "confident" }), obj("stonetool", 1120, 620, 0.7, { at: 0.2, enter: "pop" })], { tag: REAL });
S("s022-rules", [22], BLACK, push(1, 1.1), [text("WE NEED RULES", 0, 540, { style: "title", enter: "pop" })], { transition: CUT, sfx: [hit("drum-hit", 0)] });
const K = (t, x, at, node) => [node, text(t, at, 830, { style: "label", x, enter: "pop" })];
S("s023-keep", [23], E("camp", "dawn"), pan(830, 1090, 1.03), [
  text("HUMANS KEEP", 0.1, 230, { color: GOLD }),
  K("FIRE", 230, "@fire", [eff("fire", 230, 760, { at: "@fire", width: 130, height: 200 })]),
  K("STONE", 470, "@stone", obj("stonetool", 470, 700, 0.5, { at: "@stone", enter: "pop" })),
  K("WOOD", 700, "@wood", obj("log", 700, 770, 0.7, { at: "@wood", enter: "pop" })),
  K("BONE", 920, "@bone", obj("icon", 920, 690, 1.6, { at: "@bone", enter: "pop", color: "#efe6cf", props: { name: "skull" } })),
  K("ROPE", 1130, "@rope", obj("knot", 1130, 700, 0.42, { at: "@rope", enter: "pop" })),
  K("BOATS", 1370, "@boats", obj("log", 1370, 770, 1, { at: "@boats", enter: "pop", color: "#6d4a2c" })),
  K("FARMING", 1660, "@farming", obj("barley", 1660, 770, 1, { at: "@farming", enter: "pop" })),
], { tag: WHATIF });
S("s024-clock", [24], BLACK, push(1, 1.2), [obj("clock", 960, 700, 2.4, { props: { fast: true }, until: "end-0.1", exit: "fade" })], { tag: WHATIF, transition: CUT, sfx: [hit("deep-impact", "end-0.3")] });
const nope = (x, at, node, t) => [node, X(x + 115, 640, at, 1.3), text(t, at, 790, { style: "label", x, enter: "pop" })];
S("s025-never", [25, 28], STUDIO("#2a1e24", "#0a0709"), push(1, 1.06), [
  nope(330, "@metal", obj("gear", 330, 500, 0.9, { at: 0 }), "NO METAL"),
  nope(760, "@wheel", obj("bicycle", 760, 590, 1.2, { at: 0 }), "NO WHEEL"),
  nope(1180, "@writing", obj("scroll", 1180, 500, 0.9, { at: 0, props: { lines: ["A B C"] } }), "NO WRITING"),
  nope(1600, "@machines", obj("robot", 1600, 640, 0.75, { at: 0 }), "NO MACHINES"),
], { tag: WHATIF, transition: CUT, sfx: [fx("stone-hit", "@metal"), fx("stone-hit", "@wheel"), fx("stone-hit", "@writing"), fx("stone-hit", "@machines")] });
S("s029-ever", [29], BLACK, { keys: [{ t: 0, zoom: 1.06, x: 960, y: 540 }] }, [text("EVER.", 0, 540, { style: "title", color: RED, enter: "zoom" })], { tag: WHATIF, transition: CUT, sfx: [hit("big-impact", 0)] });
S("s030-labels", [30, 31], STUDIO(), push(1, 1.08), [text("REAL HISTORY", "@happened-0.5", 390, { color: "#ffffff", enter: "pop" }), text("\"IN THIS WORLD\" = A GUESS", "@guessing-1.3", 640, { color: BLUE, enter: "pop" })], { tag: NONE });

// ═══ 3. EARLY HUMANS ═══
TAG = REAL;
S("s032-band", [32], E("camp", "day"), pan(760, 1120), [fire(960, 880), who("ama", 700, { actions: [{ t: 0, do: "talk" }], expression: "happy" }), who("tavi", 860, { flip: true }), who("hunter", 1220, { actions: [{ t: 1, do: "wave" }], flip: true }), who("elder", 1460, { flip: true, actions: [{ t: 0, do: "sit" }], y: 890 })], { sfx: [bed("campfire-wind"), bed("forest-birds")] });
S("s033-follow", [33], E("savanna", "sunset"), pan(700, 1240), [go("hunter", 500, 1100, { y: 900 }), go("ama", 340, 940, { y: 910 }), go("tavi", 180, 780, { y: 920 }), obj("wilddog", 1500, 890, 1.1, { props: { walking: true } })], { sfx: [bed("steps-grass")], transition: WIPE });
S("s034-simple", [34], E("camp", "sunset"), push(1, 1.08), [face("ama", 960, "confident")], {});
S("s035-us", [35], STUDIO("#2b2636", "#0b0910"), push(1.05, 1), [who("ama", 720, { scale: 1.5, y: 970, look: "right", expression: "happy" }), who("alex", 1200, { scale: 1.5, y: 970, look: "left", flip: true, expression: "surprised" }), text("BIOLOGICALLY, THEY WERE US", 0.1, 180, { color: GOLD })], { transition: WIPE });
S("s036-baby", [36], E("classroom", "day", { props: { board: "10,000 YEARS AGO" } }), push(1, 1.15, 860, 620), [who("tavi", 860, { scale: 1.3, y: 950, actions: [{ t: "@phone-1", do: "cheer" }], expression: "joy" }), obj("phone", 1140, 700, 0.9, { at: "@phone-0.5", enter: "pop", props: { notify: true } })], { tag: WHATIF });
S("s037-tepe", [37], E("tepe", "day", { props: { raised: [[0, 0.1], [6.5, 1]] } }), push(1.0, 1.12, 960, 640), [label("GÖBEKLI TEPE, TURKEY", 0.2, { y: 110 }), text("SEVERAL TONS EACH", "@weighing", 200, { size: 66 }), eff("dust", 960, 800, { width: 1900, height: 400 })], { transition: FADE, sfx: [bed("wind-forest"), fx("stone-hit", 3), fx("stone-hit", 5)] });
S("s038-haul", [38, 39], E("tepe", "sunset", { props: { raised: 0.72 } }), shake(pan(760, 1000), 1), [go("hunter", 420, 760, { y: 950 }), go("ama", 280, 620, { y: 960 }), go("elder", 140, 480, { y: 955 }), text("NO METAL. NO WHEELS.", "@metal-0.3", 200, { color: GOLD })], { transition: WIPE });
S("s040-hunt", [40], E("savanna", "day"), pan(600, 1320), [go("hunter", 400, 1300, { run: true, y: 930 }), obj("fox", 1560, 910, 1, { props: { running: true } }), eff("speedlines", 960, 700, { width: 1400, height: 500 })], { sfx: [fx("running", 0)] });
S("s041-stone", [41], EARTHY, shake(push(1.1, 1.3), 3), [obj("stonetool", 960, 540, 1.8)], { tag: NONE, transition: CUT, sfx: [fx("stone-hit", 1), fx("stone-hit", 1.5)] });
S("s042-eat", [42], E("camp", "sunset"), push(1.05, 1.2, 960, 640), [who("ama", 820, { scale: 1.3, y: 930, expression: "worried" }), obj("basket", 1160, 920, 0.8), who("tavi", 1420, { flip: true, y: 930, expression: "sad" })], { transition: FADE });

// ═══ 4. FOOD ═══
TAG = REAL;
const mapPin = (lon, lat, label, at) => ({ lon, lat, label, at });
S("s043-origins", [43], STUDIO(), {}, [map([{ t: 0, center: [30, 20], zoom: 1 }], { pins: [mapPin(40, 35, "Fertile Crescent", 1.8), mapPin(113, 34, "China", 2.5), mapPin(-98, 18, "Mexico", 3.1), mapPin(143, -6, "New Guinea", 3.6)] })], { sfx: [fx("zeus/whoosh-fast", 1.6)] });
S("s044-triumph", [44], E("fields", "day"), push(1, 1.08), [who("ama", 960, { scale: 1.35, y: 930, actions: [{ t: 0, do: "cheer" }], expression: "joy" }), text("A TRIUMPH?", 0.2, 230, { color: GOLD })], {});
S("s045-feel", [45], E("fields", "sunset", { props: { crop: 0.25 } }), push(1.08, 1.0), [eff("dust", 960, 720, { width: 1800, height: 500 }), who("ama", 960, { scale: 1.35, y: 930, actions: [{ t: 0, do: "sit" }], expression: "sad" })], { transition: CUT });
S("s046-shorter", [46], STUDIO("#2a2219", "#0e0a06"), push(1, 1.06), [who("hunter", 620, { scale: 1.6, y: 960, expression: "confident" }), who("ama", 1300, { scale: 1.32, y: 960, flip: true, expression: "worried", at: "@farmers" }), text("OFTEN SHORTER AND LESS HEALTHY", "@shorter-0.3", 150, { size: 62 })], { transition: WIPE });
S("s047-more", [47, 48], E("fields", "day"), pan(760, 1160), [obj("crowd", 960, 760, 1, { screen: true, props: { cols: 32, rows: 8, gap: 56, reveal: [[1.8, 0], [4.6, 1]], hero: GOLD } }), text("IT FED MORE PEOPLE", "@fed-0.1", 200, { color: GOLD })], { sfx: [fx("zeus/crowd", 2.4)] });
S("s049-few", [49], E("savanna", "dawn"), pan(1120, 800), [go("hunter", 660, 860, { y: 910 }), who("ama", 1040, { y: 920 }), text("A FEW MILLION PEOPLE", "@million-1", 220)], {});
S("s050-range", [50], STUDIO("#1b2233"), push(1, 1.05), [dia("bar", { unit: "million", items: [{ label: "Low estimate", value: 14 }, { label: "High estimate", value: 45, color: GOLD }] }), text("5,000 YEARS AGO", 0.1, 130, { size: 62 })], { transition: WIPE });
TAG = WHATIF;
S("s051-stall", [51], E("fields", "sunset"), push(1, 1.1, 960, 640), [text("IN THIS WORLD", 0, 180, { color: BLUE, enter: "pop" }), text("THE CLIMB STALLS", "@climb", 300)], { transition: FADE });
const miss = (id, n, node, word) => S(id, [n], E("fields", "day", { props: { crop: 0.5 } }), push(1, 1.1), [node, X(1290, 700, "@No+0.1", 1.9), text(word, 0.1, 240, { color: "#ffffff" })], { transition: CUT, sfx: [fx("stone-hit", 0.3)] });
miss("s052-plough", 52, obj("tractor", 960, 880, 1.7), "NO IRON PLOUGH");
miss("s053-cart", 53, obj("truck", 960, 880, 1.6, { props: { text: "HARVEST" } }), "NO WHEELED CART");
miss("s054-fert", 54, obj("fertiliser", 960, 880, 1.5), "NO FACTORY FERTILISER");
S("s055-back", [55], E("fields", "day", { props: { crop: 0.3 } }), pan(780, 1140, 1.1, 620), [who("ama", 760, { scale: 1.4, y: 950, actions: [{ t: 0, do: "type" }], expression: "worried" }), obj("diggingstick", 1010, 950, 0.9, { at: "@digging", enter: "pop" }), obj("sickle", 1360, 690, 0.8, { at: "@sickle", enter: "pop" }), who("tavi", 1560, { flip: true, y: 945, at: "@back" })], { sfx: [fx("stone-hit", 1), fx("stone-hit", 2.2)] });
S("s056-season", [56], E("fields", "day", { props: { crop: [[0, 0.8], [2.3, 0.03]], dry: [[0, 0], [1, 1]] } }), shake(pan(860, 1100), 2), [eff("duststorm", 960, 620, { width: 1920, height: 800, color: "#c4a56a" }), obj("truck", 1500, 880, 1, { at: "@truck-0.3", enter: "pop", opacity: 0.7 }), X(1500, 760, "@truck", 2.4)], { sfx: [fx("zeus/whoosh-impact", 0.2), bed("wind-forest")] });
S("s057-crowding", [57], E("catal", "dawn"), pan(1200, 840, 1.15, 720), [go("ama", 280, 880, { y: 960 }), go("hunter", 120, 720, { y: 975 }), go("tavi", 40, 620, { y: 985 })], { sfx: [bed("steps-stone")], transition: WIPE });

// ═══ 5. CITIES ═══
TAG = REAL;
S("s058-surprise", [58, 59], E("catal", "day"), pan(760, 1160, 1.06), [text("A TOWN WITH ALMOST NONE OF THIS", "@town-0.4", 180, { size: 62 })], { sfx: [bed("wind-forest")] });
S("s060-catal", [60], STUDIO(), {}, [map([{ t: 0, center: [20, 37], zoom: 2 }, { t: 2.5, center: [32.8, 37.7], zoom: 7, ease: "smooth" }], { pins: [{ lon: 32.83, lat: 37.67, label: "Çatalhöyük", at: 1.4 }] }), text("9,000+ YEARS AGO", 0.2, 900, { color: GOLD })], {});
S("s061-nostreets", [61], E("catal", "day"), shake(push(1.2, 1.0, 960, 720), 1), [text("NO STREETS", "@streets-0.3", 250, { color: RED, enter: "pop" })], { transition: WIPE, sfx: [hit("drum-hit", "@streets-0.2")] });
S("s062-roofs", [62], E("catal", "sunset"), pan(600, 1320, 1.12, 620), [go("ama", 300, 900, { y: 610, scale: 0.75 }), go("hunter", 1420, 1000, { y: 620, scale: 0.75, flip: true }), go("tavi", 80, 620, { y: 625, scale: 0.6 }), obj("ladder", 1160, 1000, 1, { at: "@ladder-1" }), who("elder", 1320, { at: "@climbed", y: 880, flip: true, actions: [{ t: "@climbed", do: "wave" }] })], { sfx: [bed("steps-stone"), bed("zeus/crowd")] });
S("s063-worked", [63, 64], E("catal", "sunset"), push(1.04, 1.16), [obj("clock", 960, 650, 1.6, { props: { fast: true }, at: 0.1, enter: "pop" }), text("≈ 2,000 YEARS", "@thousand-0.5", 280, { color: GOLD, enter: "pop" })], { transition: WIPE });
TAG = WHATIF;
S("s065-limit", [65], E("catal", "night"), push(1.0, 1.14), [text("IN THIS WORLD", 0, 300, { color: BLUE, enter: "pop" }), eff("fireflies", 960, 700, { width: 1800, height: 500 })], { sfx: [bed("crickets")] });
S("s066-enemies", [66], E("catal", "sunset"), pan(700, 1200, 1.15, 640), [
  text("NO FIRED BRICK", "@bricks-0.3", 220, { until: "@settlement", exit: "fade", size: 60 }), text("NO METAL TOOLS", "@metal-0.3", 310, { until: "@settlement", exit: "fade", size: 60 }), text("NO PIPES OR PUMPS", "@pipes-0.3", 400, { until: "@settlement", exit: "fade", size: 60 }),
  eff("rainfall", 500, 520, { at: "@water", width: 780, height: 780, color: "#9fd8ff", zIndex: 8 }), text("WATER", "@water", 280, { x: 420, color: BLUE, enter: "pop" }),
  eff("swarm", 960, 640, { at: "@waste", zIndex: 8 }), text("WASTE", "@waste", 280, { x: 960, color: "#c4d36a", enter: "pop" }),
  eff("fire", 1480, 880, { at: "@fire", width: 460, height: 640, zIndex: 8 }), eff("smoke", 1480, 600, { at: "@fire", width: 520, height: 680, zIndex: 8 }), text("FIRE", "@fire", 280, { x: 1500, color: RED, enter: "pop" }),
], { sfx: [fx("fire-whoosh", "@fire")] });
S("s067-sky", [67], E("city", "day"), shake(push(1, 1.1, 960, 480), 2), [obj("skyscraper", 960, 900, 2, { props: { floors: 16, columns: 6 } }), X(1290, 500, 0.3, 2.2)], { transition: CUT, sfx: [fx("stone-hit", 0.4)] });
S("s068-sewer", [68], E("cutaway", "day", { props: { mode: "street", liquid: "#6f8a3c", level: 0.3, flow: 1 } }), push(1, 1.08), [X(1420, 300, 0.25, 2.2)], { transition: CUT, sfx: [fx("stone-hit", 0.3)] });
S("s069-size", [69], E("fields", "dawn", { props: { crop: 0.5 } }), pan(1240, 720, 1.12, 660), [go("ama", 1400, 800, { y: 950, flip: true, scale: 1.2 }), obj("basket", 1180, 830, 0.5, { path: [{ t: 0, x: 1600 }, { t: "end", x: 1000 }] }), text("A TOWN ONLY GROWS AS FAR AS FOOD CAN BE CARRIED", "@town", 200, { size: 56 })], { sfx: [bed("steps-grass")], transition: FADE });
S("s070-problem", [70], E("savanna", "sunset"), pan(760, 1240), [go("hunter", 540, 1160, { y: 930, scale: 0.9 })], { tag: WHATIF });

// ═══ 6. TRANSPORT ═══
S("s071-feet", [71], E("savanna", "day"), pan(600, 1300, 1.2, 760), [go("ama", 420, 1100, { y: 985, scale: 1.4 })], { tag: WHATIF, transition: WIPE, sfx: [bed("steps-grass")] });
TAG = REAL;
const usa = { pins: [{ lon: -74, lat: 40.7, label: "New York", at: 0.3 }, { lon: -118.2, lat: 34, label: "Los Angeles", at: 0.5 }], route: [[-74, 40.7], [-90, 40], [-104, 38], [-118.2, 34]] };
S("s072-fly", [72], STUDIO(), {}, [map([{ t: 0, center: [-96, 38], zoom: 3.2 }], usa), obj("airplane", 960, 240, 0.9, { screen: true, path: [{ t: 0.6, x: 1500 }, { t: "end", x: 420 }], flip: true }), text("≈ 6 HOURS", "@six-0.2", 910, { color: GOLD, enter: "pop" })], { tag: NONE, sfx: [fx("zeus/whoosh-impact", 0.7)] });
S("s073-walk", [73], STUDIO(), {}, [map([{ t: 0, center: [-96, 38], zoom: 3.2 }], usa), who("ama", 1400, { y: 620, scale: 0.55, flip: true, actions: [{ t: 0, do: "walk" }], path: [{ t: 0, x: 1400 }, { t: "end", x: 1200 }] }), obj("calendar", 1640, 640, 0.6, { props: { day: 150, label: "DAY", tearAt: 0.5 } }), text("≈ 5 MONTHS", "@five-0.2", 910, { color: RED, enter: "pop" })], { tag: NONE, transition: CUT, sfx: [bed("steps-grass")] });
TAG = WHATIF;
S("s074-never", [74], E("fields", "sunset"), push(1.05, 1.2, 960, 620), [who("tavi", 860, { y: 930, scale: 1.2, look: "right", actions: [{ t: 0, do: "think" }], expression: "thinking" }), who("elder", 660, { y: 930, actions: [{ t: 0, do: "talk" }] })], { transition: FADE });
TAG = REAL;
S("s075-andes", [75], E("andes", "dawn"), pan(700, 1240), [text("BUT DISTANCE ISN'T UNBEATABLE", 0.1, 180, { size: 60 })], { sfx: [bed("wind-forest")] });
S("s076-inca", [76], STUDIO(), {}, [map([{ t: 0, center: [-70, -14], zoom: 2.4 }], { highlight: [{ country: "Peru", color: GOLD, at: 0.4, pulse: true }, { country: "Bolivia", color: GOLD, at: 0.8 }, { country: "Ecuador", color: GOLD, at: 1.2 }], labels: [{ lon: -74, lat: -13, text: "Inca Empire", at: 1.4 }] }), obj("icon", 1520, 820, 2, { at: "@horses", enter: "pop", screen: true, color: RED, props: { name: "cross" } }), text("NO HORSES. NO WHEELS.", "@horses-0.2", 930, { color: GOLD })], {});
S("s077-chasqui", [77], E("andes", "day"), pan(460, 1460, 1.2, 760), [go("runner", 340, 1600, { run: true, y: 925, scale: 1.1 }), label("CHASQUI RUNNERS", "@chasqui", { y: 120 })], { sfx: [fx("running", 0.2)], transition: WIPE });
S("s078-relay", [78], E("andes", "sunset"), pan(760, 1320, 1.12, 720), [go("runner", 500, 1040, { run: true, y: 925, scale: 1.1 }), who("hunter", 1220, { y: 925, scale: 1.1, flip: true, actions: [{ t: 0, do: "wave" }] }), text("≈ 150 MILES IN A DAY", "@hundred", 180, { color: GOLD, enter: "pop" })], { sfx: [fx("running", 0.1)] });
S("s079-message", [79], E("andes", "sunset"), push(1.2, 1.5, 960, 660), [who("runner", 960, { y: 925, scale: 1.1, expression: "confident" })], {});
S("s080-string", [80], BLACK, push(1.1, 1.0), [obj("khipu", 960, 280, 1.1, { enter: "drop" })], { transition: FADE, sfx: [fx("zeus/whoosh-fast", 0.2)] });

// ═══ 7. COMMUNICATION ═══
S("s081-khipu", [81], E("andes", "day"), push(1.15, 1.0, 960, 420), [obj("khipu", 960, 200, 1.5), label("KHIPU", "@khipu", { y: 900 })], {});
S("s082-number", [82], EARTHY, push(1.8, 3, 720, 460, 760, 500), [obj("khipu", 960, 200, 1.5), text("= A NUMBER", "@number", 880, { color: GOLD, enter: "pop" })], { transition: CUT });
TAG = WHATIF;
S("s083-memory", [83], E("camp", "night"), push(1, 1.14, 960, 640), [fire(960, 900), who("elder", 660, { y: 900, actions: [{ t: 0, do: "sitTalk" }] }), who("tavi", 1240, { y: 905, flip: true, actions: [{ t: 0, do: "sit" }], look: "left", expression: "surprised" }), text("ONLY MEMORY", "@memory", 200, { color: GOLD })], { sfx: [bed("campfire-wind"), bed("crickets")] });
TAG = REAL;
S("s084-underestimate", [84], E("camp", "night"), push(1.5, 1.7, 640, 620), [fire(960, 900), who("elder", 660, { y: 900, actions: [{ t: 0, do: "sitTalk" }], expression: "confident" })], { transition: CUT, sfx: [bed("campfire-wind")] });
S("s085-shore", [85], E("shore", "day", { props: { level: [[0, 0], [6.5, 1]] } }), pan(720, 1100), [label("AUSTRALIA", 0.2, { y: 120 })], { sfx: [bed("zeus/sea")] });
S("s086-chain", [86], E("shore", "sunset", { props: { level: 0 } }), pan(560, 1240, 1.05), [[220, 520, 820, 1110, 1380].map((x, i) => who(i % 2 ? "ama" : "elder", x, { y: [600, 625, 690, 745, 752][i], scale: 0.7, at: i * 0.6, enter: "fade", actions: [{ t: 0, do: "talk" }], flip: i % 2 === 1 })), text("7,000+ YEARS?", "@seven", 900, { color: GOLD, enter: "pop" })], { sfx: [bed("zeus/sea")] });
S("s087-doubt", [87], STUDIO(), push(1, 1.1), [obj("icon", 960, 420, 2.9, { enter: "pop", color: GOLD, props: { name: "question" } }), text("OTHER SCHOLARS DOUBT IT", 0.1, 780, { size: 58 })], { transition: CUT });
S("s088-weakness", [88], E("camp", "night"), push(1.1, 1.3, 960, 760), [obj("hearth", 960, 890, 1.6), eff("smoke", 960, 860, { width: 300, height: 600 })], { transition: FADE, sfx: [hit("deep-impact", "end-0.3")] });
S("s089-uruk", [89], STUDIO(), {}, [map([{ t: 0, center: [30, 33], zoom: 2.2 }, { t: 2, center: [45.6, 31.3], zoom: 6, ease: "smooth" }], { pins: [{ lon: 45.64, lat: 31.32, label: "Uruk", at: 1.4 }] }), text("NOT POETRY", "@poetry-0.3", 900, { color: RED, enter: "pop" })], {});
S("s090-tablet", [90, 91], EARTHY, push(1.02, 1.3), [obj("claytablet", 960, 480, 1.6, { props: { marks: [[0, 0], [3.2, 1]] } }), text("BARLEY IN. BARLEY OUT.", "@Barley-0.1", 870, { color: GOLD, enter: "pop" })], { sfx: [fx("stone-hit", 0.4), fx("stone-hit", 1.2), fx("stone-hit", 2)] });
S("s092-dull", [92], EARTHY, push(1.3, 1.0), [obj("claytablet", 960, 480, 1.6), eff("sparkles", 960, 480, { at: "@incredible", width: 900, height: 620 })], { transition: CUT });
S("s093-teach", [93], E("apartment", "night"), push(1.05, 1.15), [obj("claytablet", 700, 620, 0.8, { at: 0, enter: "fade" }), who("alex", 1200, { flip: true, look: "left", expression: "surprised", actions: [{ t: 0.4, do: "think" }] }), text("A DEAD PERSON TEACHES A STRANGER", 0.1, 180, { size: 58, color: GOLD })], { transition: WIPE });
TAG = WHATIF;
S("s094-genius", [94], E("hutinside", "night"), push(1.0, 1.2, 860, 620), [fire(1320, 910), who("ama", 840, { scale: 1.35, y: 950, actions: [{ t: 0, do: "think" }], expression: "thinking" }), obj("thought", 1140, 400, 1, { at: "@disease-0.6", enter: "pop", props: { text: "Boil the water..." } })], { sfx: [bed("campfire-wind")] });
S("s095-tells", [95], E("fields", "day"), pan(820, 1080, 1.12, 640), [who("ama", 760, { y: 930, scale: 1.2, actions: [{ t: 0, do: "present" }], expression: "joy" }), who("hunter", 1120, { y: 930, flip: true }), who("elder", 1320, { y: 930, flip: true }), who("tavi", 1500, { y: 935, flip: true })], { transition: CUT });
S("s096-gone", [96], E("fields", "night", { props: { crop: 0.2, dry: 1 } }), push(1.12, 1.0), [["hunter", "elder", "tavi", "ama"].map((w, i) => who(w, 620 + i * 240, { y: 930, flip: true, scale: 1.1, until: `@gone-${1 - i * 0.05}`, exit: "fade" })), eff("dust", 960, 800, { width: 1900, height: 520 })], { transition: FADE, sfx: [bed("wind-forest")] });
S("s097-sick", [97], E("hutinside", "night"), push(1.05, 1.2), [fire(1320, 910), who("tavi", 880, { y: 950, scale: 1.25, actions: [{ t: 0, do: "sit" }], expression: "sad" })], {});

// ═══ 8. MEDICINE ═══
TAG = REAL;
S("s098-healers", [98], E("hutinside", "day"), pan(760, 1120, 1.1, 640), [fire(1460, 910, { s: 0.8 }), who("healer", 780, { y: 950, scale: 1.35, actions: [{ t: 0, do: "talk" }], expression: "confident" }), who("tavi", 1120, { y: 950, flip: true, actions: [{ t: 0, do: "sit" }] })], { transition: FADE, sfx: [bed("campfire-wind")] });
S("s099-skull", [99], EARTHY, push(1.0, 1.28, 1000, 480), [obj("skull", 960, 500, 1.3, { props: { heal: [[3.5, 0], [6.6, 1]] } }), label("PERU", 0.2, { y: 110 }), text("MOST PATIENTS SURVIVED", "@survived-0.7", 930, { color: GOLD, enter: "pop" })], { sfx: [fx("heart-mystery", 0.1)] });
S("s100-germs", [100], E("micro", "day", { props: { bacteria: 16, cocci: 18, spores: 10 } }), push(1.3, 1), [text("GERMS", "@germs-0.1", 180, { color: "#c4d36a", enter: "pop" })], { transition: WIPE });
S("s101-half", [101], BLACK, push(1, 1.06), [[0, 1, 2, 3, 4, 5, 6, 7].map((i) => who("tavi", 260 + i * 200, { y: 860, scale: 1, ...(i % 2 ? { until: `@half+${0.1 + i * 0.1}`, exit: "fade" } : {}) }))], { transition: CUT });
S("s102-word", [102], BLACK, { keys: [{ t: 0, zoom: 1, x: 960, y: 540 }] }, [text("HALF.", 0, 540, { style: "title", color: RED, enter: "zoom" })], { transition: CUT, sfx: [hit("deep-impact", 0)] });
S("s103-class", [103], E("classroom", "day", { props: { board: "" } }), push(1, 1.12), [[0, 1, 2, 3, 4, 5].map((i) => who("sam", 380 + i * 230, { y: 920, ...(i % 2 ? { until: `@second+${0.1 * i}`, exit: "fade" } : {}), expression: i % 2 ? "neutral" : "sad" }))], { tag: NONE, transition: FADE, sfx: [fx("heart-mystery", 0.2)] });
S("s104-smallpox", [104], STUDIO(), {}, [map([{ t: 0, center: [20, 18], zoom: 1 }]), dia("counter", { from: 0, to: 300000000, label: "estimated smallpox deaths, 20th century" }, { y: 520, width: 1200, height: 190, at: 0.8 })], {});
S("s105-vaccine", [105], E("space", "night", {}), push(1, 1.15), [obj("globe", 960, 560, 2.2, { enter: "zoom" }), eff("sparkles", 960, 540, { width: 1200, height: 900, at: "@wipe" }), text("ERADICATED", "@wipe", 180, { color: GOLD, enter: "pop" })], { sfx: [fx("zeus/whoosh-fast", "@wipe-0.2")] });
TAG = WHATIF;
S("s106-none", [106, 108], E("hutinside", "night"), push(1.05, 1.15), [fire(1500, 910, { s: 0.8 }), obj("microscope", 420, 900, 1.2), X(590, 800, "@microscope", 1.3), obj("flask", 830, 880, 1.2), X(970, 800, "@vaccine", 1.3), obj("beaker", 1180, 880, 1.2, { props: { level: 0.6 } }), X(1330, 800, "@antibiotics", 1.3), text("IN THIS WORLD", 0, 160, { color: BLUE, enter: "pop" })], { sfx: [fx("stone-hit", "@microscope"), fx("stone-hit", "@vaccine"), fx("stone-hit", "@antibiotics")] });
S("s109-thorn", [109], E("forest", "day"), push(1.05, 1.25, 700, 620), [who("hunter", 700, { y: 930, scale: 1.05, actions: [{ t: 0.3, do: "react" }], expression: "worried" }), text("A THORN", "@thorn-0.1", 300, { color: RED, enter: "pop", x: 1350 })], { transition: CUT, sfx: [fx("punch", "@cut")] });
S("s110-close", [110, 111], E("camp", "night"), push(1, 1.18, 960, 640), [fire(960, 900), who("elder", 640, { y: 900, actions: [{ t: 0, do: "sit" }], expression: "sad" }), who("ama", 1280, { y: 900, flip: true, actions: [{ t: 0, do: "sit" }], expression: "worried" })], { sfx: [bed("crickets")] });

// ═══ 9. WAR ═══
TAG = REAL;
S("s112-war", [112], E("savanna", "sunset"), shake(push(1, 1.1), 2), [[300, 540, 780].map((x, i) => who(i === 2 ? "chief" : "hunter", x, { y: 920, actions: i === 2 ? [{ t: 0.2, do: "point" }] : [], expression: "angry" })), [1200, 1420, 1640].map((x) => who("hunter", x, { y: 920, flip: true, expression: "angry" })), obj("spear", 140, 640, 0.8, { rotate: 6 }), obj("spear", 1790, 640, 0.8, { rotate: -6 })], { transition: FADE, sfx: [fx("tribal-drums", 0)] });
S("s113-nataruk", [113], E("savanna", "night", { props: { lake: true } }), pan(620, 1300), [label("NATARUK, KENYA", 0.3, { y: 120 }), text("≈ 10,000 YEARS AGO", "@thousand-0.4", 210, { color: GOLD, size: 60 }), obj("flintarrow", 1020, 690, 1, { at: "@projectiles-0.2", enter: "zoom", rotate: 12 })], { sfx: [bed("crickets"), fx("heart-mystery", 0.2)] });
S("s114-dispute", [114], STUDIO(), push(1, 1.1), [obj("icon", 960, 420, 2.9, { enter: "pop", color: GOLD, props: { name: "question" } }), text("SOME DISPUTE THE EVIDENCE", 0.1, 770, { size: 58 })], { transition: CUT });
S("s115-before", [115], EARTHY, push(1.0, 1.15), [obj("spear", 660, 540, 1.2, { rotate: 8 }), obj("stonetool", 1260, 540, 1.2), text("LONG BEFORE METAL", "@metal-0.4", 900, { color: RED, enter: "pop" })], { transition: WIPE, sfx: [fx("stone-hit", 0.8)] });
TAG = WHATIF;
S("s116-smaller", [116], E("savanna", "sunset"), push(1.1, 1), [[560, 760, 1160, 1360].map((x, i) => who("hunter", x, { y: 930, flip: i > 1, scale: 0.85 })), text("SMALLER WARS", "@smaller", 200, { color: BLUE }), obj("icon", 960, 620, 2.4, { at: "@nuclear", enter: "pop", color: RED, props: { name: "cross" } }), text("NO NUCLEAR WEAPONS", "@nuclear", 830, { size: 56 })], {});
S("s117-rare", [117, 118], E("fields", "sunset", { props: { crop: 0.4 } }), shake(pan(620, 1240, 1.1), 3), [go("hunter", 160, 1000, { run: true, y: 930 }), go("chief", 20, 800, { run: true, y: 945 }), eff("fire", 1500, 860, { at: "@revenge", width: 440, height: 620 }), eff("smoke", 1500, 600, { at: "@revenge", width: 460, height: 640 }), text("WATER", "@water", 200, { x: 460, enter: "pop" }), text("FOOD", "@food", 200, { x: 960, enter: "pop", color: GOLD }), text("REVENGE", "@revenge", 200, { x: 1460, enter: "pop", color: RED })], { sfx: [fx("zeus/army", 0.3), fx("fire-whoosh", "@revenge")] });
S("s119-gov", [119, 120], STUDIO("#2a241c", "#0b0906"), push(1, 1.08), [obj("scroll", 960, 500, 1.6, { props: { lines: ["Law code", "Tax records", "Provinces"] } }), X(1310, 660, "@legal", 2), text("NO PAPERWORK. NO PROVINCES.", "@paperwork-0.4", 870, { size: 58 })], { transition: WIPE, sfx: [fx("stone-hit", "@legal")] });
S("s121-chiefs", [121], E("camp", "day"), pan(800, 1080, 1.1, 640), [who("chief", 960, { scale: 1.45, y: 950, actions: [{ t: 0, do: "talk" }], expression: "confident" }), who("elder", 620, { y: 930 }), who("hunter", 1320, { y: 930, flip: true }), who("ama", 1540, { y: 935, flip: true })], { transition: FADE });
S("s122-ruler", [122], E("andes", "day"), pan(600, 1320), [go("runner", 460, 1400, { run: true, y: 925 }), obj("khipu", 1500, 180, 0.8), text("MAYBE...", 0.1, 200, { color: BLUE, enter: "pop", x: 520 })], { sfx: [fx("running", 0.3)] });
S("s123-hold", [123], E("andes", "night"), shake(push(1.0, 1.1), 2), [who("runner", 960, { y: 925, actions: [{ t: 0, do: "sit" }], expression: "sad" }), text("IT MAY NOT HOLD", "@hold-0.5", 200, { color: RED, enter: "pop" })], {});
S("s124-fast", [124, 125], E("space", "night"), push(1.5, 1.0), [obj("nightearth", 960, 540, 1, { props: { lights: 0.03 }, at: 0.1, enter: "zoom" })], { sfx: [fx("zeus/whoosh-impact", 0.1)] });

// ═══ 10. TODAY ═══
S("s126-dark", [126], E("space", "night"), push(1.0, 1.14), [obj("nightearth", 960, 540, 1, { props: { lights: 0.02 } })], { transition: FADE, sfx: [bed("wind-forest")] });
S("s127-eight", [127], STUDIO(), push(1, 1.06), [dia("counter", { from: 0, to: 8000000000, label: "people in the real world" }, { y: 520, width: 1200, height: 165 })], { tag: REAL, transition: WIPE });
S("s128-tens", [128], E("savanna", "dawn"), pan(1240, 640), [go("ama", 760, 1000, { y: 920 }), go("tavi", 600, 840, { y: 925 }), text("TENS OF MILLIONS?", "@tens-0.2", 200, { color: BLUE, enter: "pop" })], {});
S("s129-forest", [129], E("forest", "day"), pan(600, 1320), [eff("leaves", 960, 300, { width: 1800, height: 800 })], { sfx: [bed("forest-birds")], transition: WIPE });
S("s130-river", [130], E("wilds", "day"), push(1, 1.14, 960, 760), [obj("bird", 400, 300, 0.7, { path: [{ t: 0, x: 200 }, { t: "end", x: 1500 }] })], { sfx: [bed("river-birds")], transition: WIPE });
S("s131-climate", [131], E("wilds", "dawn"), pan(760, 1160, 1.06), [obj("factory", 1560, 800, 1.1, { until: "@burning+0.5", exit: "fade" }), X(1560, 620, "@burning", 2.6)], { sfx: [bed("river-birds")], transition: WIPE });
S("s132-milky", [132], E("wilds", "night", { props: { milky: [[0, 0.1], [2.6, 1]] } }), push(1.25, 1.0, 960, 460), [who("tavi", 960, { y: 825, look: "up", actions: [{ t: 0, do: "idle" }], expression: "joy" }), eff("fireflies", 960, 800, { width: 1900, height: 340 })], { transition: FADE, sfx: [bed("crickets")] });
S("s133-paradise", [133], E("wilds", "day"), push(1, 1.1), [text("PARADISE?", 0, 300, { color: GOLD, enter: "pop" })], { transition: CUT });
S("s134-coin", [134], BLACK, push(1, 1.12), [face("tavi", 960, "sad", { y: 1500, scale: 3 }), text("A COIN FLIP", "@chance-0.5", 180, { color: RED, enter: "pop" })], { transition: CUT, sfx: [fx("heartbeat", 0.4), fx("heartbeat", 1.3)] });
S("s135-mother", [135], E("hutinside", "night"), push(1.05, 1.2), [fire(1420, 910, { s: 0.8 }), who("ama", 780, { y: 950, scale: 1.3, actions: [{ t: 0, do: "sit" }], expression: "worried" }), who("healer", 1100, { y: 950, flip: true, actions: [{ t: 0, do: "talk" }], expression: "worried" })], { transition: FADE });
S("s136-harvest", [136], E("fields", "day", { props: { crop: [[0, 0.7], [1.6, 0.02]], dry: 1 } }), shake(pan(1120, 800, 1.06), 2), [eff("duststorm", 960, 620, { width: 1920, height: 800, color: "#c4a56a" })], { transition: WIPE, sfx: [bed("wind-forest")] });
S("s137-illness", [137], E("micro", "day", { props: { bacteria: 24, spores: 18 } }), push(1, 1.3), [obj("icon", 960, 540, 3.4, { at: "@nobody", enter: "pop", color: GOLD, props: { name: "question" } })], { transition: WIPE, sfx: [fx("heart-mystery", 0.2)] });
S("s138-orbit", [138], E("wilds", "night", { props: { milky: 1 } }), pan(760, 1160, 1.05, 420), [obj("sun", 1500, 300, 0.6, { at: 0.5, enter: "fade", opacity: 0.8 }), obj("icon", 1500, 300, 2, { at: "@Sun-0.2", enter: "pop", color: GOLD, props: { name: "question" } })], { transition: FADE });
S("s139-stars", [139], E("wilds", "night", { props: { milky: 1 } }), push(1.05, 1.15, 960, 520), [who("tavi", 960, { y: 825, look: "up", expression: "thinking", actions: [{ t: 0, do: "think" }] })], { transition: CUT });
S("s140-brains", [140], STUDIO("#2b2636", "#0b0910"), push(1.05, 1), [who("ama", 720, { scale: 1.5, y: 970, look: "right", expression: "confident" }), who("alex", 1200, { scale: 1.5, y: 970, look: "left", flip: true, expression: "neutral" })], { transition: WIPE });
S("s141-over", [141], E("camp", "night"), push(1, 1.1), [fire(960, 900), who("elder", 640, { y: 900, actions: [{ t: 0, do: "sitTalk" }] }), who("tavi", 1260, { y: 905, flip: true, actions: [{ t: 0, do: "sit" }] }), text("STARTING OVER, EVERY GENERATION", "@starting-0.2", 200, { size: 58, color: GOLD })], { sfx: [bed("campfire-wind")] });

// ═══ 11. CONCLUSION ═══
TAG = NONE;
S("s142-really", [142], EARTHY, push(1.1, 1.0), [obj("stonetool", 960, 500, 1.3), text("SO WHAT IS TECHNOLOGY, REALLY?", 0.1, 850, { size: 62, color: GOLD })], { transition: FADE });
S("s143-phone", [143], BLACK, push(1, 1.1), [obj("phone", 960, 700, 2.2, { until: "end-0.05", exit: "fade" }), X(1240, 560, "@phone", 2)], { transition: CUT, sfx: [fx("stone-hit", "@phone")] });
S("s144-promise", [144], BLACK, push(1, 1.1), [text("A PROMISE BETWEEN STRANGERS", 0, 540, { style: "title", color: GOLD, enter: "zoom", maxWidth: 1500 })], { transition: CUT, sfx: [hit("deep-impact", 0, -36)] });
S("s145-learned", [145], E("camp", "day"), pan(820, 1120, 1.1, 640), [who("elder", 760, { y: 930, scale: 1.2, actions: [{ t: 0, do: "present" }], expression: "happy" }), who("tavi", 1160, { y: 935, scale: 1.2, flip: true, actions: [{ t: 0.5, do: "nod" }], expression: "joy" }), obj("stonetool", 960, 700, 0.5, { at: 0.5, enter: "pop" })], { transition: FADE });
const chain = [["stonetool", 240, 0.5], ["log", 590, 0.8], ["scroll", 960, 0.55], ["bicycle", 1320, 0.9], ["phone", 1660, 0.9]];
S("s146-chain", [146], STUDIO("#2a2219", "#0e0a06"), pan(1400, 520, 1.02), [dia("timeline", [{ label: "3.3 M", text: "A stone" }, { label: "~5,000", text: "Writing" }, { label: "Now", text: "You" }], { y: 300, width: 1300, height: 240 }), chain.map(([type, x, s], i) => obj(type, x, 720, s, { at: 0.5 + i * 0.8, enter: "pop", ...(type === "scroll" ? { props: { lines: ["A B C"] } } : {}) }))], { sfx: [fx("stone-hit", "end-0.8")] });
S("s147-cures", [147], STUDIO("#1b2233"), push(1, 1.06), [obj("flask", 620, 700, 1.7, { at: "@cures-0.4", enter: "pop" }), text("CURES", "@cures-0.4", 210, { x: 620, color: "#7be0a2", enter: "pop" }), eff("explosion", 1300, 640, { at: "@bombs-0.2", width: 760, height: 760 }), text("BOMBS", "@bombs-0.2", 210, { x: 1300, color: RED, enter: "pop" })], { transition: WIPE, sfx: [fx("zeus/thunder-distant", "@bombs-0.2")] });
S("s148-build", [148, 149], E("wilds", "dawn"), push(1.2, 1.0, 960, 660), [who("alex", 960, { y: 825, scale: 1.3, expression: "thinking", actions: [{ t: 0, do: "think" }] }), text("THAT PART IS UP TO US", "@up-0.6", 200, { color: GOLD })], { transition: FADE, sfx: [bed("river-birds")] });
S("s150-final", [150], E("savanna", "dawn"), push(1.0, 1.25, 960, 620), [who("tavi", 760, { y: 920, scale: 1.2, look: "right" }), obj("stonetool", 1130, 700, 0.6, { at: "@holding", enter: "pop" }), eff("glow", 1130, 700, { at: "@holding", width: 500, height: 500, color: GOLD }), text("WHICH ONE WOULD YOU SAVE?", "@save-0.3", 210, { color: GOLD, enter: "pop", maxWidth: 1500 })], { sfx: [bed("wind-forest")] });
project.scenes.push({ id: "s151-end", duration: 3.5, environment: BLACK, elements: [text("WHAT WOULD YOU SAVE?", 0.3, 480, { style: "title", color: GOLD, enter: "fade", maxWidth: 1500 }), text("TELL US IN THE COMMENTS", 1, 640, { style: "label", enter: "fade" })], tag: NONE, sfx: [hit("drum-hit", 0.1)] });

fs.writeFileSync(path.join(DIR, "storyboard.json"), JSON.stringify(project, null, 2) + "\n");
console.log(`✓ projects/video-003/storyboard.json: ${project.scenes.length} scenes`);
