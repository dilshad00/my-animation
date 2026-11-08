/**
 * Engine unit tests:  npm test
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { samplePath } from "../src/utils/keyframes";
import {
  alignWords,
  buildTimeline,
  captionsToWords,
  estimateWords,
  normalizeWord,
  resolveTime,
  timeScriptWords,
} from "../src/utils/narration";
import { normalizeCaptionsJson, parseProject, projectTimeline } from "../src/utils/project";
import { paginate } from "../src/components/typography/Subtitles";

const FPS = 30;

test("estimateWords: monotonic, punctuation adds pauses", () => {
  const w = estimateWords("Hello there. How are you, friend?", 150);
  assert.equal(w.length, 6);
  for (let i = 1; i < w.length; i++) assert.ok(w[i].start >= w[i - 1].end);
  const gapAfterPeriod = w[2].start - w[1].end;
  const normalGap = w[3].start - w[2].end;
  assert.ok(gapAfterPeriod > normalGap + 0.3, "sentence pause");
});

test("captionsToWords merges whisper sub-word tokens", () => {
  const words = captionsToWords([
    { text: " Elec", startMs: 0, endMs: 200 },
    { text: "tricity", startMs: 200, endMs: 500 },
    { text: " is", startMs: 600, endMs: 700 },
    { text: ".", startMs: 700, endMs: 720 },
  ]);
  assert.deepEqual(
    words.map((w) => w.text),
    ["Electricity", "is."],
  );
  assert.equal(words[0].end, 0.5);
});

test("captionsToWords splits multi-word (SRT style) captions", () => {
  const words = captionsToWords([{ text: "one two three", startMs: 0, endMs: 3000 }]);
  assert.equal(words.length, 3);
  assert.ok(Math.abs(words[2].end - 3) < 1e-9);
});

test("alignWords tolerates transcription errors, insertions and deletions", () => {
  const script = "the quick brown fox jumps over the lazy dog".split(" ").map(normalizeWord);
  const heard = "uh the quick brown box jumps over lazy dog".split(" ").map(normalizeWord);
  const map = alignWords(script, heard);
  assert.equal(map[0], 1); // "the" ← skips "uh"
  assert.equal(map[3], 4); // fox ↔ box (substitution)
  assert.equal(map[8], 8); // dog
  assert.equal(map[6], -1); // second "the" was not spoken
});

test("timeScriptWords interpolates unheard words between neighbours", () => {
  const heard = [
    { text: "alpha", start: 0, end: 0.5 },
    { text: "gamma", start: 2, end: 2.5 },
  ];
  const t = timeScriptWords(["alpha", "beta", "gamma"], heard);
  assert.ok(t[1].start >= 0.5 && t[1].end <= 2);
});

test("buildTimeline (estimate): transitions overlap scenes and frames add up", () => {
  const tl = buildTimeline({
    fps: FPS,
    captions: null,
    wordsPerMinute: 150,
    scenes: [
      { id: "a", narration: "First scene narration here.", transitionSeconds: 0 },
      { id: "b", narration: "Second scene.", transitionSeconds: 0.5 },
      { id: "c", duration: 3, transitionSeconds: 1 },
    ],
  });
  assert.equal(tl.mode, "estimate");
  const [a, b, c] = tl.scenes;
  assert.equal(b.transitionIn, 15);
  assert.equal(b.from, a.from + a.durationInFrames - 15);
  assert.equal(c.from, b.from + b.durationInFrames - 30);
  assert.ok(c.durationInFrames >= 90);
  assert.equal(tl.totalFrames, c.from + c.durationInFrames);
  // narration starts after the transition-in finishes
  assert.ok(b.words[0].start >= b.transitionIn / FPS);
  // the last word of a scene finishes before the next transition begins
  const lastA = a.words[a.words.length - 1].end * FPS;
  assert.ok(lastA <= a.durationInFrames - b.transitionIn);
});

test("buildTimeline (captions): per-scene voiceover slices are ordered and non-overlapping", () => {
  const words = "One two three four. Five six seven eight. Nine ten.".split(" ");
  const captions = words.map((w, i) => ({ text: " " + w, startMs: 500 + i * 400 + (i >= 4 ? 800 : 0) + (i >= 8 ? 800 : 0), endMs: 800 + i * 400 + (i >= 4 ? 800 : 0) + (i >= 8 ? 800 : 0) }));
  const tl = buildTimeline({
    fps: FPS,
    captions,
    wordsPerMinute: 150,
    scenes: [
      { id: "a", narration: "One two three four.", transitionSeconds: 0 },
      { id: "title", duration: 2, transitionSeconds: 0.5 },
      { id: "b", narration: "Five six seven eight.", transitionSeconds: 0.5 },
      { id: "c", narration: "Nine ten.", transitionSeconds: 0.5 },
    ],
  });
  assert.equal(tl.mode, "captions");
  assert.equal(tl.warnings.length, 0, tl.warnings.join("\n"));
  const slices = tl.scenes.filter((s) => s.audio).map((s) => s.audio!);
  assert.equal(slices.length, 3);
  for (let i = 1; i < slices.length; i++) assert.ok(slices[i].start >= slices[i - 1].end - 1e-9);
  // word "Five" is the first word of scene b, at narrationStart + small lead
  const b = tl.scenes[2];
  assert.equal(b.words[0].text, "Five");
  assert.ok(b.words[0].start - b.narrationStart < 0.25);
  // every word fits inside its scene and before the next transition
  tl.scenes.forEach((s, i) => {
    const next = tl.scenes[i + 1];
    for (const w of s.words) assert.ok(w.end * FPS <= s.durationInFrames - (next?.transitionIn ?? 0) + 1);
  });
});

test("buildTimeline warns when the script does not match the recording", () => {
  const tl = buildTimeline({
    fps: FPS,
    captions: [{ text: " completely different words here", startMs: 0, endMs: 2000 }],
    wordsPerMinute: 150,
    scenes: [{ id: "a", narration: "Nothing in this sentence matches at all", transitionSeconds: 0 }],
  });
  assert.ok(tl.warnings.some((w) => w.includes("matched")));
});

test("resolveTime: numbers, cues, occurrences, offsets, end", () => {
  const words = estimateWords("The sun warms the planet and the sun sets.", 150);
  const ctx = { words, duration: 10, sceneId: "x" };
  assert.equal(resolveTime(2.5, ctx), 2.5);
  assert.equal(resolveTime("3", ctx), 3);
  assert.equal(resolveTime("@sun", ctx), words[1].start);
  assert.equal(resolveTime("@sun#2", ctx), words[7].start);
  assert.ok(Math.abs(resolveTime("@sun+0.5", ctx) - (words[1].start + 0.5)) < 1e-9);
  assert.ok(Math.abs(resolveTime("@planet-0.2", ctx) - (words[4].start - 0.2)) < 1e-9);
  assert.equal(resolveTime("@sun:end", ctx), words[1].end);
  assert.equal(resolveTime("@the planet", ctx), words[3].start);
  assert.equal(resolveTime("@planets", { ...ctx, words: estimateWords("planets", 150) }), 0);
  assert.equal(resolveTime("end", ctx), 10);
  assert.equal(resolveTime("end-1.5", ctx), 8.5);
  assert.throws(() => resolveTime("@moon", ctx), /not found/);
  assert.throws(() => resolveTime("soon", ctx), /cannot understand/);
});

test("samplePath: base pose then keyframe targets", () => {
  const r = (v: unknown) => Number(v);
  const base = { x: 100, y: 500 };
  const path = [
    { t: 1, x: 100 },
    { t: 3, x: 500, ease: "linear" as const },
    { t: 2, scale: 2, ease: "linear" as const },
  ];
  assert.equal(samplePath(base, path, 0.5, r).x, 100);
  assert.equal(samplePath(base, path, 2, r).x, 300);
  assert.equal(samplePath(base, path, 5, r).x, 500);
  assert.equal(samplePath(base, path, 1, r).scale, 1.5);
  assert.equal(samplePath(base, path, 4, r).y, 500);
});

test("paginate: breaks on sentence ends and max words", () => {
  const words = estimateWords("One two three four five six seven eight nine. Ten eleven.", 150);
  const pages = paginate(words, 4);
  assert.deepEqual(
    pages.map((p) => p.words.length),
    [4, 4, 1, 2],
  );
  for (let i = 1; i < pages.length; i++) assert.ok(pages[i - 1].end <= pages[i].start + 1e-9);
});

test("normalizeCaptionsJson accepts Caption[] and {captions}", () => {
  assert.equal(normalizeCaptionsJson([{ text: "a", startMs: 0, endMs: 1 }]).length, 1);
  assert.equal(normalizeCaptionsJson({ captions: [{ text: "a", start: 0, end: 1 }] })[0].endMs, 1000);
  assert.throws(() => normalizeCaptionsJson({ nope: 1 }));
});

test("parseProject: demo project is valid; errors are readable", () => {
  const raw = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "../projects/demo/storyboard.json"), "utf8"));
  const p = parseProject(raw);
  const tl = projectTimeline(p, null);
  assert.ok(tl.totalFrames / p.fps >= 30, "demo is at least 30 seconds");
  assert.throws(() => parseProject({ id: "bad id!", title: "x", scenes: [] }), /id|scenes/);
  assert.throws(
    () => parseProject({ id: "x", title: "x", scenes: [{ id: "a", narration: "hi" }, { id: "a", narration: "hi" }] }),
    /duplicate scene id/,
  );
});

test("parseScript: ## sections become scenes, > lines and comments are notes", async () => {
  const { parseScript } = await import("../scripts/lib/files");
  const r = parseScript("# My Video\n<!-- ignore me -->\n## Hook\n> city at night\nFirst line.\nSecond line.\n\n## The Sun\nIt begins far away.\n");
  assert.equal(r.title, "My Video");
  assert.equal(r.scenes.length, 2);
  assert.deepEqual(r.scenes[0], { name: "Hook", narration: "First line. Second line.", notes: ["city at night"] });
  assert.equal(r.scenes[1].narration, "It begins far away.");
  const plain = parseScript("One paragraph.\n\nTwo paragraph.");
  assert.equal(plain.scenes.length, 2);
});

test("tween helpers: constants, keyframes and colours", async () => {
  const { tweenNum, tweenColor } = await import("../src/utils/tween");
  assert.equal(tweenNum(3, 10, 0), 3);
  assert.equal(tweenNum(undefined, 1, 7), 7);
  const keys = [[0, 0], [2, 10]];
  assert.equal(tweenNum(keys, -1, 5), 0);
  assert.equal(tweenNum(keys, 1, 5), 5); // inOut ease is symmetric at the midpoint
  assert.equal(tweenNum(keys, 9, 5), 10);
  assert.equal(tweenColor([[0, "#000000"], [1, "#ffffff"]], 1, "#123456"), "#ffffff");
  assert.equal(tweenColor("not-a-colour", 0, "#123456"), "#123456");
});
