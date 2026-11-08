import { ease } from "./easing";
import type { EaseName, Keyframe, TimeValue } from "./schema";

export type Transform = {
  x: number;
  y: number;
  scale: number;
  rotate: number;
  opacity: number;
};

export const DEFAULT_TRANSFORM: Transform = {
  x: 960,
  y: 540,
  scale: 1,
  rotate: 0,
  opacity: 1,
};

type Resolver = (v: TimeValue | undefined, f?: number) => number;
type ResolvedKey = { t: number; ease?: EaseName } & Partial<Transform>;

const PROPS: (keyof Transform)[] = ["x", "y", "scale", "rotate", "opacity"];

/**
 * Samples an element's transform at scene time `t`.
 *
 * Semantics: the base values (x, y, scale…) describe the pose at t = 0.
 * Each keyframe is a *target* reached at its time, eased with its `ease`.
 * Properties are interpolated independently, so one keyframe may change
 * only `x` while another changes only `scale`.
 *
 *   x: 200, path: [{t: 1, x: 200}, {t: 4, x: 1400}]
 *   → stands still for 1s, then travels to 1400 arriving at 4s.
 */
export const samplePath = (
  base: Partial<Transform>,
  path: Keyframe[] | undefined,
  t: number,
  resolve: Resolver,
): Transform => {
  const out: Transform = { ...DEFAULT_TRANSFORM };
  for (const p of PROPS) {
    if (base[p] !== undefined) out[p] = base[p] as number;
  }
  if (!path || path.length === 0) return out;
  const keys: ResolvedKey[] = path
    .map((k) => ({ ...k, t: resolve(k.t) }))
    .sort((a, b) => a.t - b.t);
  for (const p of PROPS) {
    const defined: { t: number; v: number; ease?: EaseName }[] = keys
      .filter((k) => k[p] !== undefined)
      .map((k) => ({ t: k.t, v: k[p] as number, ease: k.ease }));
    if (defined.length === 0) continue;
    // implicit starting key from the base value
    if (defined[0].t > 0) defined.unshift({ t: 0, v: out[p] });
    if (t <= defined[0].t) {
      out[p] = defined[0].v;
      continue;
    }
    let value = defined[defined.length - 1].v;
    for (let i = 1; i < defined.length; i++) {
      const a = defined[i - 1];
      const b = defined[i];
      if (t <= b.t) {
        const local = (t - a.t) / Math.max(1e-6, b.t - a.t);
        value = a.v + (b.v - a.v) * ease(b.ease, local);
        break;
      }
    }
    out[p] = value;
  }
  return out;
};

/** Horizontal velocity (px/s) at time t – used for auto-walk and facing. */
export const velocityX = (
  base: Partial<Transform>,
  path: Keyframe[] | undefined,
  t: number,
  resolve: Resolver,
) => {
  const dt = 1 / 30;
  return (
    (samplePath(base, path, t + dt, resolve).x -
      samplePath(base, path, t - dt, resolve).x) /
    (2 * dt)
  );
};

/** Total horizontal distance travelled up to time t (for foot-locked walk cycles). */
export const distanceTravelled = (
  base: Partial<Transform>,
  path: Keyframe[] | undefined,
  t: number,
  resolve: Resolver,
) => {
  if (!path || path.length === 0 || t <= 0) return 0;
  const step = 1 / 15;
  let d = 0;
  let prev = samplePath(base, path, 0, resolve).x;
  for (let s = step; s < t; s += step) {
    const x = samplePath(base, path, s, resolve).x;
    d += Math.abs(x - prev);
    prev = x;
  }
  d += Math.abs(samplePath(base, path, t, resolve).x - prev);
  return d;
};
