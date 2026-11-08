import React from "react";
import { random } from "remotion";
import type { EffectProps } from "./Effects";

/** Jagged line between two heights, re-seeded a few times a second. */
const jag = (seed: string, tick: number, h: number, spread: number, n = 14): string =>
  Array.from({ length: n + 1 })
    .map((_, i) => `${i ? "L" : "M"}${(i === 0 || i === n ? 0 : (random(`${seed}${tick}${i}`) - 0.5) * spread).toFixed(1)},${((-h * i) / n).toFixed(1)}`)
    .join(" ");

/** A bolt that does not fade: a standing column of white fire. Origin at its base. */
const Pillar: React.FC<EffectProps> = ({ local, w, h, intensity, seed, color }) => {
  const c = color ?? "#cfe6ff";
  const tick = Math.floor(local * 14);
  const pulse = 0.85 + 0.15 * Math.sin(local * 26);
  const on = Math.min(1, local / 0.12) * intensity;
  return (
    <g opacity={on}>
      <rect x={(-w * 2.6) / 2} y={-h} width={w * 2.6} height={h} fill={c} opacity={0.12 * pulse} />
      <rect x={-w / 2} y={-h} width={w} height={h} fill={c} opacity={0.5 * pulse} />
      <rect x={-w / 5} y={-h} width={(w * 2) / 5} height={h} fill="#ffffff" />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={jag(seed + i, tick + i, h, w * 3)} fill="none" stroke="#ffffff" strokeWidth={5} opacity={0.75} />
      ))}
      <ellipse cx={0} cy={0} rx={w * 4} ry={w * 0.9} fill={c} opacity={0.5 * pulse} />
    </g>
  );
};

/** One huge strike, bright for about half a second. Origin at its base. */
const Strike: React.FC<EffectProps> = ({ local, w, h, seed, color }) => {
  const c = color ?? "#dcecff";
  const k = Math.max(0, 1 - local / 0.75);
  if (k <= 0) return null;
  const tick = Math.floor(local * 18);
  const d = jag(seed, tick, h, w);
  return (
    <g opacity={k}>
      <path d={d} fill="none" stroke={c} strokeWidth={70} opacity={0.3} strokeLinejoin="round" />
      <path d={d} fill="none" stroke={c} strokeWidth={26} opacity={0.65} strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#ffffff" strokeWidth={11} strokeLinejoin="round" />
    </g>
  );
};

/** Whole-frame flash that eases away. width/height default to more than the stage. */
const Whiteout: React.FC<EffectProps> = ({ local, intensity, color, el }) => {
  const hold = el.width ? el.width / 1000 : 0.08;
  const k = local < hold ? 1 : Math.max(0, 1 - (local - hold) / (0.9 * intensity));
  return <rect x={-3000} y={-3000} width={6000} height={6000} fill={color ?? "#ffffff"} opacity={k} />;
};

/** Small electric arcs crawling round a figure. Origin at the figure's feet. */
const Arcs: React.FC<EffectProps> = ({ local, w, h, intensity, seed, color }) => {
  const tick = Math.floor(local * 10);
  const c = color ?? "#bfe3ff";
  return (
    <g>
      {Array.from({ length: Math.round(4 * intensity) }).map((_, i) => {
        const x = (random(`${seed}x${i}${tick}`) - 0.5) * w;
        const y = -random(`${seed}y${i}${tick}`) * h;
        const a = random(`${seed}a${i}${tick}`) * 360;
        return random(`${seed}o${i}${tick}`) < 0.55 ? <path key={i} d={jag(seed + i, tick, 90, 34, 5)} transform={`translate(${x} ${y}) rotate(${a})`} fill="none" stroke={c} strokeWidth={3} opacity={0.85} /> : null;
      })}
    </g>
  );
};

/** Lightning winking on and off across a disc; used on the night globe. Props via intensity (0 = dark). Origin at centre. */
const Flicker: React.FC<EffectProps> = ({ local, w, intensity, seed, color }) => {
  const c = color ?? "#dff1ff";
  const R = w / 2;
  return (
    <g>
      {Array.from({ length: Math.round(70 * intensity) }).map((_, i) => {
        const a = random(`${seed}a${i}`) * Math.PI * 2;
        const d = Math.sqrt(random(`${seed}d${i}`)) * R;
        const speed = 2 + random(`${seed}s${i}`) * 5;
        const on = Math.sin(local * speed + i * 2.3) > 0.72 ? 1 : 0;
        return on ? <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={7 + random(`${seed}r${i}`) * 12} fill={c} opacity={0.85} /> : null;
      })}
    </g>
  );
};

export const DIVINE: Record<string, { component: React.FC<EffectProps>; w: number; h: number; description: string }> = {
  pillar: { component: Pillar, w: 90, h: 1400, description: "Standing column of white fire, origin at its base" },
  strike: { component: Strike, w: 260, h: 1200, description: "One huge lightning strike, origin at its base" },
  whiteout: { component: Whiteout, w: 0, h: 0, description: "Whole-frame flash that eases away. width = hold in ms, color" },
  arcs: { component: Arcs, w: 260, h: 620, description: "Small electric arcs crawling round a figure" },
  flicker: { component: Flicker, w: 760, h: 760, description: "Lightning winking across a disc, for night-side globes" },
};
