import React from "react";
import { AbsoluteFill, random } from "remotion";
import { SvgLayer } from "../camera/Camera";
import type { Palette } from "../../utils/lighting";
import { useSvgId } from "../../utils/svg";
import { darken, mix } from "../../utils/color";
import { Cloud } from "./common";

type W = { t: number; seed: number; p: Palette; intensity?: number };

const Rain: React.FC<W & { heavy?: boolean }> = ({ t, seed, heavy, intensity = 1, p }) => {
  // coloured rain: darker drops need more density, opacity and a thicker stroke to read on screen
  const coloured = Boolean(p.rainColor);
  const n = Math.round((heavy ? 260 : 160) * intensity * (coloured ? 1.45 : 1));
  const dropColor = p.rainColor ? mix(p.rainColor, "#ff3344", 0.3) : "#cfe3ff";
  const strokeW = coloured ? 3.6 : 2;
  const baseOp = coloured ? 0.7 : 0.35;
  const drops = Array.from({ length: n }).map((_, i) => {
    const speed = 1500 + random(`${seed}rs${i}`) * 700;
    const x0 = random(`${seed}rx${i}`) * 2600 - 340;
    const y = ((random(`${seed}ry${i}`) * 1300 + t * speed) % 1300) - 120;
    const x = x0 - (y + 120) * 0.18;
    const len = (coloured ? 40 : 30) + random(`${seed}rl${i}`) * 40;
    return (
      <line key={i} x1={x} y1={y} x2={x - len * 0.18} y2={y + len} stroke={dropColor} strokeWidth={strokeW} opacity={baseOp + random(`${seed}ro${i}`) * 0.35} strokeLinecap="round" />
    );
  });
  const splashes = Array.from({ length: Math.round(30 * intensity) }).map((_, i) => {
    const ph = (t * 3 + random(`${seed}sp${i}`)) % 1;
    const x = random(`${seed}sx${i}`) * 2200 - 140;
    const y = 900 + random(`${seed}sy${i}`) * 160;
    return <ellipse key={"s" + i} cx={x} cy={y} rx={4 + ph * 16} ry={1 + ph * 4} fill="none" stroke={dropColor} strokeWidth={coloured ? 2 : 1.5} opacity={(coloured ? 0.7 : 0.5) * (1 - ph)} />;
  });
  return (
    <SvgLayer depth={1.15}>
      {drops}
      {splashes}
    </SvgLayer>
  );
};

const Snow: React.FC<W> = ({ t, seed, intensity = 1 }) => (
  <SvgLayer depth={1.1}>
    {Array.from({ length: Math.round(170 * intensity) }).map((_, i) => {
      const speed = 60 + random(`${seed}ss${i}`) * 90;
      const y = ((random(`${seed}sy${i}`) * 1250 + t * speed) % 1250) - 100;
      const x = random(`${seed}sx${i}`) * 2500 - 300 + Math.sin(t * (0.8 + random(`${seed}sw${i}`)) + i) * 30;
      const r = 2 + random(`${seed}sr${i}`) * 5;
      return <circle key={i} cx={x} cy={y} r={r} fill="#ffffff" opacity={0.85} />;
    })}
  </SvgLayer>
);

const Fog: React.FC<W> = ({ t, intensity = 1 }) => {
  const id = useSvgId("fog");
  return (
    <SvgLayer depth={0.9}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#e9eef3" stopOpacity={0} />
          <stop offset="0.6" stopColor="#e9eef3" stopOpacity={0.32 * intensity} />
          <stop offset="1" stopColor="#e9eef3" stopOpacity={0.18 * intensity} />
        </linearGradient>
      </defs>
      <rect x={-2000} y={200} width={6000} height={1200} fill={`url(#${id})`} />
      {Array.from({ length: 8 }).map((_, i) => (
        <ellipse key={i} cx={((i * 500 + t * (20 + i * 4)) % 4200) - 1200} cy={700 + (i % 3) * 90} rx={600} ry={70} fill="#f1f5f9" opacity={0.1 * intensity} />
      ))}
    </SvgLayer>
  );
};

const Wind: React.FC<W> = ({ t, seed }) => (
  <SvgLayer depth={1.1}>
    {Array.from({ length: 26 }).map((_, i) => {
      const speed = 380 + random(`${seed}ws${i}`) * 300;
      const x = ((random(`${seed}wx${i}`) * 2600 + t * speed) % 2600) - 340;
      const y = 200 + random(`${seed}wy${i}`) * 800 + Math.sin(t * 3 + i) * 40;
      const rot = t * 300 + i * 40;
      return (
        <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}>
          <path d="M0,-12 Q10,0 0,12 Q-10,0 0,-12 Z" fill={["#e76f51", "#f4a261", "#e9c46a", "#90be6d"][i % 4]} />
        </g>
      );
    })}
    {Array.from({ length: 8 }).map((_, i) => {
      const x = ((random(`${seed}gx${i}`) * 2600 + t * 900) % 2600) - 340;
      const y = 150 + random(`${seed}gy${i}`) * 700;
      return <path key={"g" + i} d={`M${x},${y} q120,-20 240,0`} stroke="#ffffff" strokeWidth={3} fill="none" opacity={0.35} strokeLinecap="round" />;
    })}
  </SvgLayer>
);

/** Lightning flash schedule for storms. Returns 0..1 brightness. */
export const lightningAt = (t: number, seed: number) => {
  for (let i = 0; i < 40; i++) {
    const at = 1.5 + i * 3.2 + random(`${seed}lt${i}`) * 2.5;
    const d = t - at;
    if (d >= 0 && d < 0.5) {
      return d < 0.08 ? 1 : d < 0.14 ? 0.3 : d < 0.22 ? 0.8 : Math.max(0, 1 - (d - 0.22) / 0.28) * 0.5;
    }
  }
  return 0;
};

/** Drawn inside the Sky layer (behind everything else). */
export const Bolt: React.FC<{ t: number; seed: number }> = ({ t, seed }) => {
  const f = lightningAt(t, seed);
  if (f < 0.25) return null;
  const idx = Math.floor((t - 1.5) / 3.2);
  const x = 300 + random(`${seed}bx${idx}`) * 1300;
  let d = `M${x},-50`;
  let cx = x;
  for (let y = 40; y < 640; y += 70) {
    cx += (random(`${seed}b${idx}${y}`) - 0.5) * 140;
    d += ` L${cx},${y}`;
  }
  return (
    <g>
      <path d={d} stroke="#ffffff" strokeWidth={6} fill="none" opacity={f} strokeLinejoin="round" />
      <path d={d} stroke="#bde0fe" strokeWidth={18} fill="none" opacity={f * 0.35} strokeLinejoin="round" />
    </g>
  );
};

/** Overcast cloud deck, drawn inside the Sky layer. */
export const WeatherClouds: React.FC<{ p: Palette; t: number; seed: number }> = ({ p, t, seed }) => {
  const grey = p.time === "night" ? "#2c3555" : "#9aa3b2";
  const base = p.rainColor ? mix(grey, darken(p.rainColor, 0.35), 0.45) : grey;
  const c = p.weather === "cloudy" ? (p.time === "night" ? "#3a4677" : "#e9eef4") : base;
  return (
    <g>
      {Array.from({ length: 16 }).map((_, i) => {
        const x = ((random(`${seed}wc${i}`) * 4400 + t * (10 + i)) % 4400) - 1200;
        const y = -60 + random(`${seed}wcy${i}`) * 300;
        const s = 0.9 + random(`${seed}wcs${i}`) * 1.2;
        return <Cloud key={i} x={x} y={y} s={s} color={c} shade={darken(c, 0.12)} />;
      })}
    </g>
  );
};

/** Front layers (precipitation, fog, flashes) rendered over the scene. */
export const WeatherFront: React.FC<{ weather?: string; t: number; seed: number; p: Palette; intensity?: number }> = ({ weather, t, seed, p, intensity = 1 }) => {
  if (!weather || weather === "clear" || weather === "cloudy") return null;
  const flash = weather === "storm" ? lightningAt(t, seed) : 0;
  const overlay = p.rainColor ? mix("#1b2a4a", darken(p.rainColor, 0.55), 0.6) : "#1b2a4a";
  return (
    <>
      {weather === "rain" || weather === "storm" ? (
        <>
          <AbsoluteFill style={{ background: overlay, opacity: (weather === "storm" ? 0.28 : 0.16) * Math.min(1.4, 0.6 + intensity * 0.4) }} />
          <Rain t={t} seed={seed} p={p} heavy={weather === "storm"} intensity={intensity} />
        </>
      ) : null}
      {weather === "snow" ? <Snow t={t} seed={seed} p={p} intensity={intensity} /> : null}
      {weather === "fog" ? <Fog t={t} seed={seed} p={p} intensity={intensity} /> : null}
      {weather === "wind" ? <Wind t={t} seed={seed} p={p} /> : null}
      {flash > 0 ? <AbsoluteFill style={{ background: "#e8f0ff", opacity: flash * 0.55, mixBlendMode: "screen" }} /> : null}
    </>
  );
};
