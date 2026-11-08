/**
 * Small colour toolkit used by every illustrated asset so lighting/time-of-day
 * tints can be applied consistently across characters, objects and environments.
 */

type RGB = [number, number, number];

const clamp255 = (v: number) => Math.max(0, Math.min(255, Math.round(v)));

export const hexToRgb = (hex: string): RGB => {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const n = parseInt(h.slice(0, 6), 16);
  if (Number.isNaN(n)) {
    return [255, 0, 255];
  }
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export const rgbToHex = ([r, g, b]: RGB): string =>
  "#" +
  [r, g, b]
    .map((v) => clamp255(v).toString(16).padStart(2, "0"))
    .join("");

/** Linear mix between two hex colours. t=0 → a, t=1 → b */
export const mix = (a: string, b: string, t: number): string => {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  return rgbToHex([
    ca[0] + (cb[0] - ca[0]) * t,
    ca[1] + (cb[1] - ca[1]) * t,
    ca[2] + (cb[2] - ca[2]) * t,
  ]);
};

export const darken = (c: string, amount: number) => mix(c, "#000000", amount);
export const lighten = (c: string, amount: number) => mix(c, "#ffffff", amount);

export const withAlpha = (c: string, alpha: number): string => {
  const [r, g, b] = hexToRgb(c);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, alpha))})`;
};

/** Multiply blend – used to tint scene colours by ambient light */
export const multiply = (c: string, light: string): string => {
  const a = hexToRgb(c);
  const l = hexToRgb(light);
  return rgbToHex([(a[0] * l[0]) / 255, (a[1] * l[1]) / 255, (a[2] * l[2]) / 255]);
};
