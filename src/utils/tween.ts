import { mix } from "./color";
import { EASES } from "./easing";

/**
 * Animatable environment / object prop.
 *
 *   3                          → constant
 *   "#9b111e"                  → constant colour
 *   [[0, 0], [2, 1]]           → keyframes [time, value] (seconds since scene / element start)
 *   [[0, "#3a86c8"], [4, "#7a0f18"]] → colour keyframes (mixed in RGB)
 *
 * Values between keyframes are eased with "inOut".
 */
export type Tweenable<T> = T | [number, T][];

const isKeys = (v: unknown): v is [number, unknown][] =>
  Array.isArray(v) && v.length > 0 && v.every((k) => Array.isArray(k) && k.length === 2 && typeof k[0] === "number");

const sample = <T>(v: unknown, t: number, fallback: T, blend: (a: T, b: T, k: number) => T, ok: (x: unknown) => boolean): T => {
  if (v === undefined || v === null) return fallback;
  if (!isKeys(v)) return ok(v) ? (v as T) : fallback;
  const keys = [...v].filter((k) => ok(k[1])).sort((a, b) => a[0] - b[0]) as [number, T][];
  if (keys.length === 0) return fallback;
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    if (t <= t1) {
      const [t0, v0] = keys[i - 1];
      const k = t1 === t0 ? 1 : EASES.inOut((t - t0) / (t1 - t0));
      return blend(v0, v1, k);
    }
  }
  return keys[keys.length - 1][1];
};

/** Sample a numeric prop (constant or keyframes). */
export const tweenNum = (v: unknown, t: number, fallback: number): number =>
  sample<number>(v, t, fallback, (a, b, k) => a + (b - a) * k, (x) => typeof x === "number" && Number.isFinite(x));

/** Sample a colour prop (constant or keyframes). */
export const tweenColor = (v: unknown, t: number, fallback: string): string =>
  sample<string>(v, t, fallback, (a, b, k) => mix(a, b, k), (x) => typeof x === "string" && /^#[0-9a-f]{3,8}$/i.test(x));
