/**
 * "Premium 2D anime" style kit — shared colour tokens and small helpers.
 *
 * Cel-shading rule used across the kit: every surface has exactly three tones
 * (base, shadow, highlight) plus a warm/cool rim light that depends on the scene grade.
 */
import { interpolate } from "remotion";

export const ANIME = {
  skin: { base: "#ffe6d8", shadow: "#f4b8a6", deep: "#e3907f", blush: "#ff8f9a" },
  hair: { base: "#2b2f5c", shadow: "#171a3a", mid: "#3f4a8a", shine: "#8fa6ff", rim: "#ffb47a" },
  eye: { dark: "#1c1446", mid: "#6b3fd1", light: "#c46cff", glow: "#ffd2f4", white: "#fbf7ff" },
  uniform: { navy: "#1f2950", navyShade: "#131a36", white: "#f7f6ff", whiteShade: "#c9c6e6", scarf: "#e8344e", scarfShade: "#a91d38" },
  line: "#2a1830",
  sunset: { top: "#2a1b5e", mid: "#a2368a", low: "#ff6f61", horizon: "#ffc46b", sun: "#fff3c4" },
  night: { top: "#050a24", mid: "#13205a", low: "#2d3d8c", horizon: "#6a5bb5" },
  sakura: ["#ffd1e1", "#ffb7d0", "#ffe4ee", "#ff9fc2"],
} as const;

export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0→1 between frames a and b, clamped, with optional easing */
export const prog = (f: number, a: number, b: number, e: (t: number) => number = (t) => t) =>
  e(interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeIn = (t: number) => t * t * t;
export const easeBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/** Mixes two #rrggbb colours */
export const mix = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return `#${pa.map((v, i) => Math.round(lerp(v, pb[i], clamp01(t))).toString(16).padStart(2, "0")).join("")}`;
};
