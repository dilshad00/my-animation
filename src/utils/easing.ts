import { Easing } from "remotion";
import type { EaseName } from "./schema";

export const EASES: Record<EaseName, (t: number) => number> = {
  linear: (t) => t,
  in: Easing.bezier(0.55, 0, 0.9, 0.4),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  smooth: Easing.bezier(0.45, 0.05, 0.25, 1),
  spring: (t) => {
    // critically-damped-ish spring with a small overshoot
    if (t >= 1) return 1;
    return 1 - Math.exp(-6.5 * t) * Math.cos(7.5 * t);
  },
  back: Easing.bezier(0.34, 1.56, 0.64, 1),
  bounce: Easing.bounce,
};

export const ease = (name: EaseName | undefined, t: number) =>
  EASES[name ?? "smooth"](Math.max(0, Math.min(1, t)));

export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

/** Map v from [a,b] to [0,1] clamped */
export const progress = (v: number, a: number, b: number) =>
  b === a ? (v >= b ? 1 : 0) : clamp01((v - a) / (b - a));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
