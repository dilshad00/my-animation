import React from "react";
import { darken, lighten } from "../../utils/color";
import { ease } from "../../utils/easing";
import { smoothPath, useSvgId, type Pt } from "../../utils/svg";
import type { EffectProps } from "./Effects";
import { emit, r } from "./emit";

/*
 * Atmospheric / story effects. Each is drawn around the element's origin;
 * `width`/`height` set the area, `intensity` the density, `color` the tint.
 */

/** Wavy smell wisps drifting to the right (origin = source). */
const Scent: React.FC<EffectProps> = ({ local, w, h, intensity, seed, color }) => {
  const c = color ?? "#b5838d";
  return (
    <g>
      {emit(Math.round(7 * intensity), 2.6, local, seed, (i, age, k, gen) => {
        const y0 = (r(seed, `y${i}${gen}`) - 0.5) * h * 0.6;
        const x0 = k * w * 0.9;
        const pts: Pt[] = Array.from({ length: 6 }).map((_, j) => [x0 - j * 34, y0 + Math.sin(age * 3 + j * 0.9 + i) * 18 - k * h * 0.25]);
        return <path d={smoothPath(pts, false)} stroke={c} strokeWidth={9 - k * 4} fill="none" strokeLinecap="round" opacity={0.75 * Math.sin(Math.min(1, k * 1.2) * Math.PI)} />;
      })}
    </g>
  );
};

/** Drops running down a pane of glass (area w×h centred on origin). */
const GlassDrips: React.FC<EffectProps> = ({ local, w, h, intensity, seed, color }) => {
  const c = color ?? "#9b111e";
  return (
    <g>
      {Array.from({ length: Math.round(40 * intensity) }).map((_, i) => {
        const x = (r(seed, "bx" + i) - 0.5) * w;
        const y = (r(seed, "by" + i) - 0.5) * h;
        const s = 3 + r(seed, "bs" + i) * 6;
        return <ellipse key={"b" + i} cx={x} cy={y} rx={s} ry={s * 1.15} fill={c} opacity={0.75} />;
      })}
      {emit(Math.round(16 * intensity), 2.8, local, seed, (i, _age, k, gen) => {
        const x = (r(seed, `x${i}${gen}`) - 0.5) * w;
        const y0 = -h / 2 + r(seed, `y${i}${gen}`) * h * 0.3;
        const y = y0 + ease("in", k) * (h - (y0 + h / 2));
        const tail = Math.min(y - y0, 180);
        const ww = 6 + r(seed, `w${i}`) * 5;
        return (
          <g>
            <path d={`M${x - ww * 0.22},${y - tail} L${x + ww * 0.22},${y - tail} L${x + ww * 0.35},${y} L${x - ww * 0.35},${y} Z`} fill={c} opacity={0.55} />
            <ellipse cx={x} cy={y + ww * 0.4} rx={ww * 0.8} ry={ww} fill={darken(c, 0.1)} />
            <circle cx={x - ww * 0.25} cy={y + ww * 0.1} r={ww * 0.25} fill="#fff" opacity={0.55} />
          </g>
        );
      })}
    </g>
  );
};

/** A buzzing swarm of flies around the origin (area w×h). */
const Swarm: React.FC<EffectProps> = ({ local, w, h, intensity, seed, color }) => {
  const body = color ?? "#26262d";
  const n = Math.round(24 * intensity);
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const sp = 0.8 + r(seed, "s" + i) * 1.6;
        const ph = r(seed, "p" + i) * 6.28;
        const x = Math.sin(local * sp + ph) * w * 0.4 + Math.sin(local * sp * 2.7 + ph * 2) * w * 0.08;
        const y = Math.cos(local * sp * 1.3 + ph) * h * 0.35 + Math.sin(local * 5 + i) * 6;
        const dir = Math.cos(local * sp + ph) >= 0 ? 1 : -1;
        const flap = Math.sin(local * 80 + i) > 0 ? 1 : 0.3;
        const s = 0.6 + r(seed, "z" + i) * 0.5;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${dir * s} ${s})`}>
            <ellipse cx={-2} cy={-9} rx={10} ry={6 * flap} fill="#e7f1ff" opacity={0.7} />
            <ellipse cx={0} cy={0} rx={10} ry={6} fill={body} />
            <circle cx={9} cy={-1} r={5} fill={darken(body, 0.2)} />
          </g>
        );
      })}
    </g>
  );
};

/** Spray of liquid shooting to the right from the origin (rotate the element to aim). */
const Spray: React.FC<EffectProps> = ({ local, w, h, intensity, seed, color }) => {
  const c = color ?? "#9cc3e6";
  return (
    <g>
      {emit(Math.round(40 * intensity), 0.9, local, seed, (i, _age, k, gen) => {
        const spread = (r(seed, `a${i}${gen}`) - 0.5) * h * 0.6;
        const x = k * w;
        const y = spread * k + k * k * h * 0.5;
        const s = 3 + k * 9 * (0.5 + r(seed, `s${i}`));
        return <circle cx={x} cy={y} r={s} fill={i % 4 ? c : lighten(c, 0.5)} opacity={0.85 * (1 - k * 0.8)} />;
      })}
      <path d={`M0,-6 Q${w * 0.25},-4 ${w * 0.35},${h * 0.05} L${w * 0.35},${h * 0.09} Q${w * 0.2},6 0,6 Z`} fill={c} opacity={0.7} />
    </g>
  );
};

/** A rolling wall of dust blowing left → right across the area (centred on origin). */
const DustStorm: React.FC<EffectProps> = ({ local, w, h, intensity, seed, color }) => {
  const c = color ?? "#c8945a";
  const puff = useSvgId("puff");
  const haze = useSvgId("haze");
  const dens = Math.min(1, 0.35 + intensity * 0.35);
  return (
    <g>
      <defs>
        <radialGradient id={puff}>
          <stop offset="0" stopColor={c} stopOpacity={0.55} />
          <stop offset="0.6" stopColor={c} stopOpacity={0.25} />
          <stop offset="1" stopColor={c} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={haze} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={c} stopOpacity={0.25 * dens} />
          <stop offset="0.6" stopColor={c} stopOpacity={0.55 * dens} />
          <stop offset="1" stopColor={darken(c, 0.1)} stopOpacity={0.8 * dens} />
        </linearGradient>
      </defs>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={`url(#${haze})`} />
      {Array.from({ length: Math.round(40 * intensity) }).map((_, i) => {
        const lane = r(seed, "l" + i);
        const x = ((r(seed, "x" + i) * w * 1.6 + local * (160 + (1 - lane) * 300)) % (w * 1.6)) - w * 0.8;
        const y = h / 2 - Math.pow(lane, 1.4) * h * 0.95 + Math.sin(local * 0.7 + i) * 20;
        const s = 160 + r(seed, "s" + i) * 260 * (1.2 - lane * 0.6);
        return <ellipse key={i} cx={x} cy={y} rx={s * 1.4} ry={s} fill={`url(#${puff})`} />;
      })}
      {Array.from({ length: Math.round(70 * intensity) }).map((_, i) => {
        const x = ((r(seed, "gx" + i) * w * 1.3 + local * (500 + r(seed, "gv" + i) * 400)) % (w * 1.3)) - w * 0.65;
        const y = (r(seed, "gy" + i) - 0.5) * h;
        return <rect key={"g" + i} x={x} y={y} width={18 + r(seed, "gw" + i) * 30} height={2.5} rx={1.2} fill={darken(c, 0.25)} opacity={0.55} />;
      })}
    </g>
  );
};

/** Algae bloom spreading outward from the origin over ~4 s / intensity (top-down, on water). */
const Bloom: React.FC<EffectProps> = ({ local, w, h, intensity, seed, color }) => {
  const c = color ?? "#7cb518";
  const k = ease("out", (local * Math.max(0.2, intensity)) / 4);
  const blob = (key: string, cx: number, cy: number, rad: number) => {
    const pts: Pt[] = Array.from({ length: 12 }).map((_, j) => {
      const a = (j / 12) * Math.PI * 2;
      const rr = rad * (0.7 + r(seed, `${key}${j}`) * 0.5) * (1 + Math.sin(local * 0.8 + j) * 0.03);
      return [cx + Math.cos(a) * rr * (w / h > 1 ? 1 : 0.8), cy + Math.sin(a) * rr * (h / w > 1 ? 1 : 0.55)];
    });
    return smoothPath(pts, true, 0.5);
  };
  return (
    <g>
      <path d={blob("main", 0, 0, (Math.min(w, h * 1.6) / 2) * k)} fill={c} opacity={0.55} />
      {Array.from({ length: 14 }).map((_, i) => {
        const a = r(seed, "a" + i) * 6.28;
        const d = r(seed, "d" + i) * 0.9;
        const kk = ease("out", (k - d * 0.6) / 0.4);
        if (kk <= 0) return null;
        const cx = Math.cos(a) * d * w * 0.45;
        const cy = Math.sin(a) * d * h * 0.45;
        return <path key={i} d={blob("b" + i, cx, cy, (40 + r(seed, "s" + i) * 90) * kk)} fill={i % 3 ? lighten(c, 0.15) : darken(c, 0.15)} opacity={0.6} />;
      })}
      {Array.from({ length: 30 }).map((_, i) => {
        const a = r(seed, "fa" + i) * 6.28;
        const d = Math.sqrt(r(seed, "fd" + i)) * k;
        return <circle key={"f" + i} cx={Math.cos(a) * d * w * 0.45} cy={Math.sin(a) * d * h * 0.45} r={3 + r(seed, "fr" + i) * 5} fill={lighten(c, 0.4)} opacity={0.7 * k} />;
      })}
    </g>
  );
};

/** Local shower of rain inside the area (origin = centre), e.g. under a cloud object. */
const Rainfall: React.FC<EffectProps> = ({ local, w, h, intensity, seed, color }) => {
  const c = color ?? "#cfe3ff";
  return (
    <g>
      {Array.from({ length: Math.round(70 * intensity) }).map((_, i) => {
        const sp = 900 + r(seed, "v" + i) * 500;
        const y = ((r(seed, "y" + i) * h + local * sp) % h) - h / 2;
        const x = (r(seed, "x" + i) - 0.5) * w - (y + h / 2) * 0.1;
        const len = 26 + r(seed, "l" + i) * 30;
        return <line key={i} x1={x} y1={y} x2={x - len * 0.1} y2={y + len} stroke={c} strokeWidth={3} strokeLinecap="round" opacity={0.75} />;
      })}
    </g>
  );
};

export const ATMOSPHERE: Record<string, { component: React.FC<EffectProps>; w: number; h: number; description: string }> = {
  scent: { component: Scent, w: 500, h: 220, description: "Wavy smell wisps drifting right from the origin. color = tint" },
  glassdrips: { component: GlassDrips, w: 900, h: 600, description: "Beads and running drops on a pane of glass. color = liquid" },
  swarm: { component: Swarm, w: 500, h: 300, description: "Buzzing fly swarm around the origin" },
  spray: { component: Spray, w: 500, h: 160, description: "Liquid spray jetting right (use rotate to aim). color = liquid" },
  duststorm: { component: DustStorm, w: 1920, h: 1080, description: "Rolling wall of dust blowing left→right. color = dust tint" },
  rainfall: { component: Rainfall, w: 800, h: 700, description: "Local rain shower inside the area (centre origin). color = drops" },
  bloom: { component: Bloom, w: 800, h: 400, description: "Algae bloom spreading outward from the origin over ~4 s. color = algae" },
};
