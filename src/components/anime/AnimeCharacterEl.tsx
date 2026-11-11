/**
 * Engine adapter: renders a storyboard `"kind": "character"` element as an anime bust
 * when the project uses `"style": "anime"`.
 *
 * The bust is anchored at its bottom-centre (= the element's x/y; default y is just
 * below the frame) and is 800×960 px at scale 1. The classic cast look is translated
 * (hair → length, outfit → anime outfit) unless animeHair / animeOutfit are set.
 * Expressions, narration lip-sync, blinking, look direction and the actions
 * nod / think / react / cheer / jump / shrug / wave / point / present / walk / run
 * are all mapped onto the bust performance.
 */
import React, { useMemo } from "react";
import { random } from "remotion";
import { useScene } from "../../scenes/context";
import { distanceTravelled, velocityX } from "../../utils/keyframes";
import type { CharacterElementT, CharacterLook, ExpressionName } from "../../utils/schema";
import { mouthFromWords } from "../characters/AnimatedCharacter";
import { resolveLook } from "../characters/presets";
import { AnimeCharacter, type AnimeHair, type AnimeLook, type AnimeOutfit, type MouthShape } from "./AnimeCharacter";
import { mix } from "./palette";

export const ANIME_BUST_W = 800;
export const ANIME_BUST_H = 960;

const HAIR_MAP: Record<string, AnimeHair> = {
  long: "long", ponytail: "medium", bun: "medium", bob: "medium",
  short: "short", side: "short", spiky: "short", curly: "short", afro: "short", bald: "short",
};
const OUTFIT_MAP: Record<string, AnimeOutfit> = {
  dress: "sailor", suit: "blazer", labcoat: "blazer", jacket: "blazer", hoodie: "hoodie",
  tshirt: "casual", shirt: "casual", overalls: "casual", robe: "casual", armor: "gakuran", spacesuit: "casual", hivis: "casual",
};

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const toAnimeLook = (l: CharacterLook): AnimeLook => {
  const hair = l.animeHair ?? HAIR_MAP[l.hair] ?? "short";
  const eye = luminance(l.eyeColor) < 0.18 ? mix(l.eyeColor, "#b07a4a", 0.55) : l.eyeColor;
  return {
    hairColor: l.hairColor,
    eyeColor: eye,
    skin: l.skin,
    hair,
    outfit: l.animeOutfit ?? OUTFIT_MAP[l.outfit] ?? "casual",
    top: l.top,
    accent: l.accent ?? "#e8344e",
    lashes: l.lashes ?? ["long", "bob", "ponytail", "bun"].includes(l.hair),
    clip: l.hairClip ?? false,
    glasses: l.glasses,
  };
};

type Face = { brow: number; pupil: number; blush: number; sweat: number; lookY: number; tilt: number; shape: MouthShape; eyes: "normal" | "happy"; wink: boolean; open: number };

const FACE: Record<ExpressionName, Face> = {
  neutral: { brow: 0, pupil: 1, blush: 0.6, sweat: 0, lookY: 0, tilt: 0, shape: "smile", eyes: "normal", wink: false, open: 0 },
  happy: { brow: 0, pupil: 1, blush: 1, sweat: 0, lookY: 0, tilt: 2, shape: "grin", eyes: "normal", wink: false, open: 0.3 },
  joy: { brow: 0, pupil: 1, blush: 1.2, sweat: 0, lookY: 0, tilt: 3, shape: "grin", eyes: "happy", wink: false, open: 0.55 },
  sad: { brow: -0.9, pupil: 0.95, blush: 0.3, sweat: 0, lookY: 8, tilt: -3, shape: "frown", eyes: "normal", wink: false, open: 0 },
  angry: { brow: 1, pupil: 0.78, blush: 0.4, sweat: 0, lookY: 0, tilt: 0, shape: "flat", eyes: "normal", wink: false, open: 0 },
  surprised: { brow: 0, pupil: 0.66, blush: 0.6, sweat: 0, lookY: -2, tilt: 0, shape: "o", eyes: "normal", wink: false, open: 0.6 },
  thinking: { brow: 0, pupil: 1, blush: 0.5, sweat: 0, lookY: -10, tilt: 5, shape: "flat", eyes: "normal", wink: false, open: 0 },
  worried: { brow: -0.7, pupil: 0.82, blush: 0.4, sweat: 1, lookY: 4, tilt: -2, shape: "frown", eyes: "normal", wink: false, open: 0 },
  confident: { brow: 0.45, pupil: 1, blush: 0.6, sweat: 0, lookY: 0, tilt: 4, shape: "smile", eyes: "normal", wink: false, open: 0 },
  wink: { brow: 0, pupil: 1, blush: 1, sweat: 0, lookY: 0, tilt: 4, shape: "grin", eyes: "normal", wink: true, open: 0.35 },
};

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

export const AnimeCharacterEl: React.FC<{ el: CharacterElementT; t: number }> = ({ el, t }) => {
  const scene = useScene();
  const look = useMemo(() => toAnimeLook(resolveLook(el.who, scene.cast)), [el.who, scene.cast]);
  const seed = el.id ?? el.who;
  const frame = Math.round(t * scene.fps);

  // expressions (numeric parts blend over 0.25 s)
  const exprs = (el.expressions ?? []).map((e) => ({ is: e.is, start: scene.resolve(e.t) })).sort((a, b) => a.start - b.start);
  let cur: ExpressionName = el.expression ?? "neutral";
  let prev: ExpressionName = cur;
  let since = 10;
  for (const e of exprs) {
    if (e.start <= t) {
      prev = cur;
      cur = e.is;
      since = t - e.start;
    }
  }
  const k = Math.min(1, since / 0.25);
  const A = FACE[prev];
  const B = FACE[cur];
  const f = {
    brow: lerp(A.brow, B.brow, k), pupil: lerp(A.pupil, B.pupil, k), blush: lerp(A.blush, B.blush, k),
    sweat: lerp(A.sweat, B.sweat, k), lookY: lerp(A.lookY, B.lookY, k), tilt: lerp(A.tilt, B.tilt, k), open: lerp(A.open, B.open, k),
  };
  const shape = k < 0.5 ? A.shape : B.shape;
  const eyes = k < 0.5 ? A.eyes : B.eyes;
  const wink = k < 0.5 ? A.wink : B.wink;

  // lip-sync
  const speaking = (() => {
    if (!el.speaks) return false;
    if (el.speaks === true) return true;
    return el.speaks.some(([a, b]) => t >= scene.resolve(a) && t <= scene.resolve(b));
  })();
  const talk = speaking ? mouthFromWords(scene.words, t) : 0;

  // blinking
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

  // actions → body motion
  const actions = (el.actions ?? []).map((a) => ({ ...a, start: scene.resolve(a.t) })).sort((a, b) => a.start - b.start);
  let act = "idle";
  let actStart = 0;
  for (const a of actions) if (a.start <= t) { act = a.do; actStart = a.start; }
  const local = t - actStart;
  const base = { x: el.x ?? 960, y: el.y ?? 1120 };
  const vx = velocityX(base, el.path, t, scene.resolve);
  const dist = distanceTravelled(base, el.path, t, scene.resolve);
  let bob = Math.abs(vx) > 18 ? -Math.abs(Math.sin(dist / 60)) * (Math.abs(vx) > 520 ? 26 : 12) : 0;
  let tilt = f.tilt + Math.sin(t * 1.3 + random(seed) * 6) * 0.8;
  let lookX = el.look === "left" ? -12 : el.look === "right" ? 12 : 0;
  let lookY = f.lookY + (el.look === "up" ? -10 : el.look === "down" ? 8 : 0);
  let pupil = f.pupil;
  let windBoost = 0;
  const pulse = Math.max(0, 1 - local / 0.6);
  switch (act) {
    case "nod":
      bob += Math.sin(local * 9) * 10 * Math.max(0, 1 - local / 1.4);
      lookY += 3;
      break;
    case "think":
      lookX = 10;
      lookY = -10;
      tilt += 5;
      break;
    case "react":
      pupil = Math.min(pupil, 0.72);
      bob -= Math.sin(Math.min(1, local / 0.35) * Math.PI) * 24;
      windBoost = pulse;
      break;
    case "cheer":
    case "jump":
      bob -= Math.abs(Math.sin(local * 5)) * 36;
      windBoost = 0.7;
      break;
    case "shrug":
      tilt -= 6 * Math.min(1, local / 0.3);
      bob -= 10 * Math.min(1, local / 0.3);
      break;
    case "wave":
    case "point":
    case "present":
      tilt += 3 * Math.sin(Math.min(1, local / 0.4) * Math.PI * 0.5);
      break;
    default:
      break;
  }

  const p = scene.palette;
  const light = p.time === "night" ? "night" : p.time === "sunset" || p.time === "dawn" ? "sunset" : "day";
  const wind = (p.weather === "wind" || p.weather === "storm" ? 1.6 : 0.55) + windBoost;
  const breath = Math.sin(t * 1.6 + random(seed + "br") * 6) * 4;

  return (
    <div style={{ position: "absolute", left: -ANIME_BUST_W / 2, top: -ANIME_BUST_H + bob + breath, width: ANIME_BUST_W, height: ANIME_BUST_H }}>
      <AnimeCharacter
        frame={frame}
        look={look}
        id={`ac-${seed}`}
        wind={wind}
        blink={eyes === "happy" ? 0 : blink}
        wink={wink}
        mouth={Math.max(talk * 0.85, f.open)}
        mouthShape={shape}
        eyes={eyes}
        brow={f.brow}
        look2={[lookX, lookY]}
        tilt={tilt}
        light={light}
        pupil={pupil}
        sweat={f.sweat}
        blush={f.blush}
      />
    </div>
  );
};
