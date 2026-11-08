import { random } from "remotion";
import React, { useMemo } from "react";
import { mix } from "../../utils/color";
import { useScene } from "../../scenes/context";
import { distanceTravelled, velocityX } from "../../utils/keyframes";
import { lit } from "../../utils/lighting";
import type { ActionName, CharacterElementT, ExpressionName } from "../../utils/schema";
import { getBuild, legLength } from "./builds";
import { blendFace, FACES } from "./expressions";
import { Figure } from "./Figure";
import { ACTIONS, blendPose, isSeated, type Pose } from "./poses";
import { resolveLook } from "./presets";

const BLEND = 0.3;

const syllables = (w: string) => {
  const m = w.toLowerCase().match(/[aeiouyáéíóúäöü]+/g);
  return Math.max(1, m ? m.length : 1);
};

/** Mouth openness for lip-sync from narration word timings. */
export const mouthFromWords = (
  words: { text: string; start: number; end: number }[],
  t: number,
): number => {
  for (const w of words) {
    if (t < w.start) break;
    if (t <= w.end) {
      const p = (t - w.start) / Math.max(0.05, w.end - w.start);
      const s = syllables(w.text);
      return 0.2 + 0.8 * Math.abs(Math.sin(Math.PI * s * p));
    }
  }
  return 0;
};

export const AnimatedCharacter: React.FC<{
  el: CharacterElementT;
  t: number;
}> = ({ el, t }) => {
  const scene = useScene();
  const look = useMemo(() => resolveLook(el.who, scene.cast), [el.who, scene.cast]);
  const build = getBuild(look.body);
  const base = { x: el.x ?? 960, y: el.y ?? 900 };

  // ----------------------------------------------------------- actions
  const actions = useMemo(
    () =>
      (el.actions ?? [])
        .map((a) => ({ ...a, start: scene.resolve(a.t) }))
        .sort((a, b) => a.start - b.start),
    [el.actions, scene],
  );
  const vx = velocityX(base, el.path, t, scene.resolve);
  const dist = distanceTravelled(base, el.path, t, scene.resolve);
  const phase = (dist / (legLength(build) * 0.95)) * Math.PI;

  const speaking = (() => {
    if (!el.speaks) return false;
    if (el.speaks === true) return true;
    return el.speaks.some(([a, b]) => t >= scene.resolve(a) && t <= scene.resolve(b));
  })();
  const talk = speaking ? mouthFromWords(scene.words, t) : 0;
  const inSpeech =
    speaking &&
    scene.words.some((w) => t >= w.start - 0.2 && t <= w.end + 0.6);

  const seed = el.id ?? el.who;
  const actionAt = (time: number): { name: ActionName; start: number; angle?: number } => {
    let cur: { name: ActionName; start: number; angle?: number } = { name: "idle", start: 0 };
    for (const a of actions) {
      if (a.start <= time) cur = { name: a.do, start: a.start, angle: a.angle };
    }
    return cur;
  };
  const effective = (a: { name: ActionName; start: number; angle?: number }, moving: number) => {
    let name = a.name;
    if ((name === "idle" || name === "talk") && Math.abs(moving) > 18) {
      name = Math.abs(moving) > 520 ? "run" : "walk";
    } else if (name === "idle" && inSpeech) {
      name = "talk";
    } else if (name === "sit" && inSpeech) {
      name = "sitTalk";
    }
    return name;
  };
  const poseFor = (name: ActionName, start: number, angle?: number): Pose =>
    ACTIONS[name]({ local: Math.max(0, t - start), t, phase, build, seed, angle });

  const cur = actionAt(t);
  const curName = effective(cur, vx);
  let pose = poseFor(curName, cur.start, cur.angle);
  // blend from the previous action
  if (t - cur.start < BLEND && cur.start > 0) {
    const prev = actionAt(cur.start - 1e-3);
    const prevName = effective(prev, velocityX(base, el.path, cur.start - 0.05, scene.resolve));
    const k = (t - cur.start) / BLEND;
    pose = blendPose(poseFor(prevName, prev.start, prev.angle), pose, k * k * (3 - 2 * k));
  }
  // smooth walk start/stop
  if (curName === "walk" || curName === "run") {
    const speedK = Math.min(1, Math.abs(vx) / 140);
    pose = blendPose(poseFor("idle", 0), pose, speedK);
  }

  // --------------------------------------------------------- expressions
  const exprs = (el.expressions ?? [])
    .map((e) => ({ is: e.is, start: scene.resolve(e.t) }))
    .sort((a, b) => a.start - b.start);
  let curExpr: ExpressionName = el.expression ?? "neutral";
  let prevExpr: ExpressionName = curExpr;
  let exprStart = -10;
  for (const e of exprs) {
    if (e.start <= t) {
      prevExpr = curExpr;
      curExpr = e.is;
      exprStart = e.start;
    }
  }
  const ek = Math.min(1, (t - exprStart) / 0.25);
  const face = blendFace(FACES[prevExpr], FACES[curExpr], ek);

  // ------------------------------------------------------------- blink
  const blink = (() => {
    let bt = random(seed + "b0") * 2;
    let i = 0;
    while (bt < t + 1 && i < 400) {
      const d = t - bt;
      if (d >= 0 && d < 0.16) return Math.sin((d / 0.16) * Math.PI);
      bt += 2.2 + random(seed + "b" + i) * 2.8;
      i++;
    }
    return 0;
  })();

  // ------------------------------------------------------------ facing
  // facing: initial value, then the most recent of (explicit turn, movement)
  let facingRight = !(el.flip || el.facing === "left");
  let decidedAt = -Infinity;
  for (const turn of el.turns ?? []) {
    const at = scene.resolve(turn.t);
    if (at <= t && at >= decidedAt) {
      facingRight = turn.to === "right";
      decidedAt = at;
    }
  }
  if (el.facing !== "left" && el.facing !== "right" && el.path && el.path.length > 0) {
    for (let s = t; s >= Math.max(-0.01, decidedAt); s -= 0.1) {
      const v = velocityX(base, el.path, Math.max(0, s), scene.resolve);
      if (Math.abs(v) > 15) {
        facingRight = v > 0;
        break;
      }
    }
  }

  const lookX = el.look === "camera" ? -0.6 : el.look === "left" ? -1 : el.look === "right" ? 1 : 0.5;
  const lookY = el.look === "up" ? -1 : el.look === "down" ? 1 : 0;
  const sway =
    Math.sin(t * 1.7 + random(seed) * 6) * 0.5 +
    (curName === "walk" || curName === "run" ? Math.sin(phase) * 0.6 : 0) -
    Math.max(-1, Math.min(1, vx / 600)) * (facingRight ? 1 : -1) * 0.6;

  const p = scene.palette;
  const light = (c: string) => mix(lit(p, c), c, 0.45);
  const lift = Math.max(0, -pose.bodyY);
  const shadowW = build.shoulderW * 0.75 * (1 - Math.min(0.5, lift / 200));

  return (
    <g>
      {!isSeated(curName) ? (
        <ellipse
          cx={0}
          cy={2}
          rx={shadowW}
          ry={shadowW * 0.16}
          fill={p.shadow}
          opacity={0.28 * (1 - Math.min(0.6, lift / 150))}
        />
      ) : null}
      <g transform={facingRight ? undefined : "scale(-1 1)"}>
        <Figure
          look={look}
          pose={{ ...pose, lookY: pose.lookY + lookY }}
          face={face}
          talk={talk}
          blink={blink}
          lookX={lookX}
          sway={sway}
          light={light}
        />
      </g>
    </g>
  );
};
