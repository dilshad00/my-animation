/** UG-006 timeline core: cue lookup + shot windows (absolute frames) with crossfades. */
import React from "react";
import { AbsoluteFill } from "remotion";
import { CUE } from "./ug006.data";
import { E, lin } from "./Look6";

export const c = (k: string) => {
  const v = CUE[k];
  if (v === undefined) throw new Error(`cue ${k}`);
  return v;
};
export const XF = 8;

/**
 * A shot active in [a, b). Fades in over `fin` frames (0 = hard cut) and keeps rendering XF frames past
 * b so the next shot can crossfade over it. Children get (lf = local frame, d = length).
 * look: CSS filter on the whole shot (grading per shot), z: stacking.
 */
export const Shot: React.FC<{ f: number; a: number; b: number; fin?: number; fout?: number; children: (lf: number, d: number) => React.ReactNode; filter?: string; style?: React.CSSProperties }> = ({
  f,
  a,
  b,
  fin = XF,
  fout = XF,
  children,
  filter,
  style,
}) => {
  if (f < a || f >= b + fout) return null;
  const o = Math.min(fin > 0 ? E.io(f, a, a + fin) : 1, fout > 0 ? 1 - lin(f, b, b + fout) : 1);
  return <AbsoluteFill style={{ opacity: o, filter, ...style }}>{children(f - a, b - a)}</AbsoluteFill>;
};

/** Camera path helper: eased interpolation between keyframes [frame, value][] (power3.inOut). */
export const path = (f: number, keys: [number, number][]) => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [fa, va] = keys[i];
    const [fb, vb] = keys[i + 1];
    if (f <= fb) return va + (vb - va) * E.io(f, fa, fb);
  }
  return keys[keys.length - 1][1];
};
export const pathV = (f: number, keys: [number, [number, number, number]][]): [number, number, number] => [0, 1, 2].map((k) => path(f, keys.map(([fr, v]) => [fr, v[k]]))) as [number, number, number];
