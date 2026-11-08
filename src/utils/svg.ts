import { useId } from "react";

export type Pt = [number, number];

/** Catmull-Rom spline through points → smooth SVG path */
export const smoothPath = (pts: Pt[], closed = true, tension = 0.5): string => {
  if (pts.length < 2) return "";
  const p = (i: number): Pt => {
    if (closed) return pts[(i + pts.length) % pts.length];
    return pts[Math.max(0, Math.min(pts.length - 1, i))];
  };
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  const n = closed ? pts.length : pts.length - 1;
  for (let i = 0; i < n; i++) {
    const p0 = p(i - 1);
    const p1 = p(i);
    const p2 = p(i + 1);
    const p3 = p(i + 2);
    const t = tension / 3;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return closed ? d + "Z" : d;
};

/** Unit vector for a limb angle: 0° = straight down, positive = forward (+x). */
export const dir = (deg: number): Pt => {
  const r = (deg * Math.PI) / 180;
  return [Math.sin(r), Math.cos(r)];
};

export const add = (a: Pt, b: Pt, k = 1): Pt => [a[0] + b[0] * k, a[1] + b[1] * k];

/** SVG-safe unique id (React ids contain characters not allowed in url(#…)) */
export const useSvgId = (prefix: string) =>
  prefix + useId().replace(/[^a-zA-Z0-9]/g, "");

export const poly = (pts: Pt[]) => pts.map((p) => p.join(",")).join(" ");
