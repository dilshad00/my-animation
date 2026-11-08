import React from "react";
import { random } from "remotion";
import { SvgLayer } from "../camera/Camera";
import { darken, lighten, mix, withAlpha } from "../../utils/color";
import type { Palette } from "../../utils/lighting";
import { lit } from "../../utils/lighting";
import type { EnvironmentSpecT } from "../../utils/schema";
import { Bolt, WeatherClouds } from "./weather";
import { smoothPath, useSvgId, type Pt } from "../../utils/svg";

export type EnvProps = {
  spec: EnvironmentSpecT;
  palette: Palette;
  /** scene time, seconds */
  t: number;
  seed: number;
};

/** World extents drawn by depth-1 layers (camera can pan/zoom within these). */
export const WORLD_L = -1500;
export const WORLD_R = 3420;
export const WORLD_W = WORLD_R - WORLD_L;

export const rnd = (seed: number, key: string | number) => random(`${seed}-${key}`);

// ------------------------------------------------------------------ sky
export const Sky: React.FC<{ p: Palette; t: number; horizon?: number; seed?: number; sunX?: number; noSun?: boolean }> = ({
  p,
  t,
  horizon = 700,
  seed = 1,
  sunX = 1380,
  noSun,
}) => {
  const g = useSvgId("sky");
  const glow = useSvgId("glow");
  const sunY =
    p.time === "day" ? 200 : p.time === "sunset" ? horizon - 120 : p.time === "dawn" ? horizon - 80 : 190;
  const isMoon = p.time === "night";
  return (
    <SvgLayer depth={0.02}>
      <defs>
        <linearGradient id={g} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={p.skyTop} />
          <stop offset={String(Math.min(0.95, horizon / 1080))} stopColor={p.skyBottom} />
          <stop offset="1" stopColor={p.skyBottom} />
        </linearGradient>
        <radialGradient id={glow}>
          <stop offset="0" stopColor={p.sun} stopOpacity={isMoon ? 0.35 : 0.85} />
          <stop offset="0.25" stopColor={p.horizonGlow} stopOpacity={isMoon ? 0.12 : 0.4} />
          <stop offset="1" stopColor={p.horizonGlow} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={-2000} y={-1500} width={6000} height={4000} fill={`url(#${g})`} />
      {p.stars > 0 ? <Stars p={p} t={t} seed={seed} /> : null}
      {noSun || (p.weather && p.weather !== "clear" && p.weather !== "wind" && p.weather !== "cloudy") ? null : (
        <>
          <circle cx={sunX} cy={sunY} r={isMoon ? 420 : 620} fill={`url(#${glow})`} />
          {isMoon ? (
            <g>
              <circle cx={sunX} cy={sunY} r={58} fill="#f4f1e6" />
              <circle cx={sunX - 18} cy={sunY - 10} r={12} fill="#dcd8c8" />
              <circle cx={sunX + 20} cy={sunY + 18} r={8} fill="#dcd8c8" />
              <circle cx={sunX + 8} cy={sunY - 26} r={6} fill="#dcd8c8" />
            </g>
          ) : (
            <circle cx={sunX} cy={sunY} r={p.time === "day" ? 70 : 95} fill={lighten(p.sun, 0.3)} />
          )}
        </>
      )}
      {p.weather === "cloudy" || p.weather === "rain" || p.weather === "storm" || p.weather === "snow" ? (
        <WeatherClouds p={p} t={t} seed={seed} />
      ) : null}
      {p.weather === "storm" ? <Bolt t={t} seed={seed} /> : null}
    </SvgLayer>
  );
};

export const Stars: React.FC<{ p: Palette; t: number; seed: number; count?: number }> = ({
  p,
  t,
  seed,
  count = 160,
}) => (
  <g>
    {Array.from({ length: count }).map((_, i) => {
      const x = rnd(seed, "sx" + i) * 4400 - 1200;
      const y = rnd(seed, "sy" + i) * 900 - 300;
      const r = 0.8 + rnd(seed, "sr" + i) * 2.2;
      const tw = 0.55 + 0.45 * Math.sin(t * (1 + rnd(seed, "st" + i) * 2) + i);
      return <circle key={i} cx={x} cy={y} r={r} fill="#ffffff" opacity={p.stars * tw} />;
    })}
  </g>
);

// --------------------------------------------------------------- clouds
export const Cloud: React.FC<{ x: number; y: number; s: number; color: string; shade: string }> = ({
  x,
  y,
  s,
  color,
  shade,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={18} rx={150} ry={34} fill={shade} />
    <circle cx={-70} cy={0} r={48} fill={color} />
    <circle cx={-10} cy={-30} r={66} fill={color} />
    <circle cx={60} cy={-6} r={52} fill={color} />
    <circle cx={110} cy={14} r={34} fill={color} />
    <rect x={-120} y={0} width={250} height={40} rx={20} fill={color} />
  </g>
);

export const Clouds: React.FC<{ p: Palette; t: number; seed: number; count?: number; y?: number; depth?: number; dense?: boolean }> = ({
  p,
  t,
  seed,
  count = 6,
  y = 120,
  depth = 0.1,
  dense,
}) => {
  const base = p.time === "night" ? "#3a4677" : p.time === "sunset" ? "#ffd2b8" : p.time === "dawn" ? "#ffe4dc" : "#ffffff";
  const overcast = p.weather === "rain" || p.weather === "storm" || p.weather === "snow";
  const color = dense || overcast ? mix(base, p.weather === "snow" ? "#c4ccd8" : "#8a94a6", 0.5) : base;
  const shade = darken(color, p.time === "night" ? 0.2 : 0.1);
  return (
    <SvgLayer depth={depth}>
      {Array.from({ length: count }).map((_, i) => {
        const span = 4200;
        const speed = 6 + rnd(seed, "cs" + i) * 10;
        const x = ((rnd(seed, "cx" + i) * span + t * speed) % span) - 1100;
        const yy = y + rnd(seed, "cy" + i) * 220;
        const s = 0.6 + rnd(seed, "csz" + i) * 0.9;
        return <Cloud key={i} x={x} y={yy} s={s} color={color} shade={shade} />;
      })}
    </SvgLayer>
  );
};

// ---------------------------------------------------------------- hills
export const hillPath = (seed: number, key: string, baseY: number, amp: number, x0 = WORLD_L - 600, x1 = WORLD_R + 600, step = 260): string => {
  const pts: Pt[] = [];
  for (let x = x0; x <= x1; x += step) {
    pts.push([x, baseY - rnd(seed, key + x) * amp]);
  }
  const top = smoothPath(pts, false, 0.6);
  return `${top} L${x1},2400 L${x0},2400 Z`;
};

export const Hills: React.FC<{
  p: Palette;
  seed: number;
  color: string;
  baseY: number;
  amp: number;
  depth: number;
  haze: number;
  keyName: string;
  step?: number;
}> = ({ p, seed, color, baseY, amp, depth, haze, keyName, step }) => (
  <SvgLayer depth={depth}>
    <path d={hillPath(seed, keyName, baseY, amp, undefined, undefined, step)} fill={lit(p, color, haze)} />
  </SvgLayer>
);

/** Soft god-rays from the sun / window */
export const LightRays: React.FC<{ x: number; y: number; color: string; t: number; opacity?: number; spread?: number; length?: number; angle?: number }> = ({
  x,
  y,
  color,
  t,
  opacity = 0.18,
  spread = 70,
  length = 1600,
  angle = 20,
}) => {
  const id = useSvgId("ray");
  return (
    <g style={{ mixBlendMode: "screen" }}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity={1} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      {Array.from({ length: 7 }).map((_, i) => {
        const a = angle - spread / 2 + (i * spread) / 6;
        const w = 40 + (i % 3) * 30;
        const o = opacity * (0.5 + 0.5 * Math.sin(t * 0.7 + i * 1.7));
        return (
          <polygon
            key={i}
            points={`${-w / 6},0 ${w / 6},0 ${w},${length} ${-w},${length}`}
            fill={`url(#${id})`}
            opacity={o}
            transform={`translate(${x} ${y}) rotate(${-a})`}
          />
        );
      })}
    </g>
  );
};

/** Ground plane with a subtle gradient towards the horizon. */
export const Ground: React.FC<{ p: Palette; y: number; color: string; depth?: number; haze?: number }> = ({
  p,
  y,
  color,
  depth = 1,
  haze = 0.25,
}) => {
  const id = useSvgId("gnd");
  return (
    <SvgLayer depth={depth}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={lit(p, color, haze)} />
          <stop offset="0.5" stopColor={lit(p, color)} />
          <stop offset="1" stopColor={lit(p, darken(color, 0.15))} />
        </linearGradient>
      </defs>
      <rect x={WORLD_L - 800} y={y} width={WORLD_W + 1600} height={1600} fill={`url(#${id})`} />
    </SvgLayer>
  );
};

export const glowColor = (c: string, a: number) => withAlpha(c, a);
