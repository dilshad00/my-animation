/**
 * Anime post/FX layer: sakura petals, god rays, focus (speed) lines, sparkles,
 * lens flare, impact flash, vignette + bloom, film grain. All full-frame overlays.
 */
import React from "react";
import { AbsoluteFill, random } from "remotion";
import { ANIME } from "./palette";

const full: React.CSSProperties = { position: "absolute", inset: 0 };

export const PETAL_PATH = "M0 -14 C 9 -14, 13 -3, 8 8 C 5 13, 2 15, 0 12 C -2 15, -5 13, -8 8 C -13 -3, -9 -14, 0 -14 Z";

export const SakuraPetals: React.FC<{ frame: number; count?: number; wind?: number; speed?: number; seed?: string; size?: number; opacity?: number }> = ({
  frame, count = 60, wind = 1.6, speed = 1, seed = "p", size = 1, opacity = 1,
}) => (
  <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={full}>
    {Array.from({ length: count }, (_, i) => {
      const r = (k: string) => random(`${seed}${k}${i}`);
      const depth = 0.4 + r("d") * 1.2; // nearer petals are bigger, faster, blurrier
      const fall = (1.3 + r("f") * 1.4) * depth * speed;
      const t = frame + r("o") * 2000;
      const y = ((t * fall) % 1300) - 110;
      const x = (((r("x") * 2400 + t * wind * depth * speed + Math.sin(t * 0.03 + i) * 60) % 2300) + 2300) % 2300 - 190;
      const flip = Math.cos(t * (0.05 + r("s") * 0.07));
      const rot = t * (1 + r("r") * 3) * (i % 2 ? 1 : -1);
      return (
        <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip * depth * size} ${depth * size})`} opacity={opacity * (0.55 + 0.45 * Math.min(1, depth))}>
          <path d={PETAL_PATH} fill={ANIME.sakura[i % 4]} />
          <path d="M0 -10 C 3 -4, 3 4, 0 9" stroke="#ff8fb4" strokeWidth="1.4" fill="none" opacity="0.6" />
        </g>
      );
    })}
  </svg>
);

export const GodRays: React.FC<{ frame: number; x: number; y: number; color?: string; opacity?: number; count?: number }> = ({
  frame, x, y, color = "#fff1c9", opacity = 0.35, count = 14,
}) => (
  <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ ...full, mixBlendMode: "screen" }}>
    <defs>
      <radialGradient id="ray-fade" cx={x} cy={y} r={1500} gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor={color} stopOpacity="1" />
        <stop offset="1" stopColor={color} stopOpacity="0" />
      </radialGradient>
    </defs>
    <g transform={`translate(${x} ${y}) rotate(${frame * 0.12})`} opacity={opacity}>
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * 360 + random(`ra${i}`) * 12;
        const w = 2 + random(`rw${i}`) * 5;
        const pulse = 0.5 + 0.5 * Math.sin(frame * 0.04 + i * 1.7);
        return (
          <path key={i} transform={`rotate(${a})`} d={`M0 0 L1600 ${-w * 16} L1600 ${w * 16} Z`} fill="url(#ray-fade)" opacity={0.4 + pulse * 0.6}
            style={{ transformOrigin: "0 0" }} />
        );
      })}
    </g>
  </svg>
);

/** Manga "focus lines": thin wedges converging on (cx, cy), re-randomised every `hold` frames. */
export const SpeedLines: React.FC<{ frame: number; cx?: number; cy?: number; inner?: number; count?: number; color?: string; opacity?: number; hold?: number }> = ({
  frame, cx = 960, cy = 540, inner = 330, count = 90, color = "#ffffff", opacity = 0.85, hold = 2,
}) => {
  const step = Math.floor(frame / hold);
  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={full}>
      {Array.from({ length: count }, (_, i) => {
        const a = ((i + random(`sl${step}-${i}`) * 0.8) / count) * Math.PI * 2;
        const r0 = inner + random(`sr${step}-${i}`) * 220;
        const w = 0.004 + random(`sw${step}-${i}`) * 0.012;
        const R = 1400;
        const p = (ang: number, rad: number) => `${cx + Math.cos(ang) * rad} ${cy + Math.sin(ang) * rad}`;
        return <path key={i} d={`M${p(a, r0)} L${p(a - w, R)} L${p(a + w, R)} Z`} fill={color} opacity={opacity} />;
      })}
    </svg>
  );
};

const Star4: React.FC<{ x: number; y: number; s: number; o: number; color?: string }> = ({ x, y, s, o, color = "#fff" }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <path d="M0 -20 C 2 -4, 4 -2, 20 0 C 4 2, 2 4, 0 20 C -2 4, -4 2, -20 0 C -4 -2, -2 -4, 0 -20 Z" fill={color} />
    <circle r={3} fill="#fff" />
  </g>
);

export const Sparkles: React.FC<{ frame: number; count?: number; area?: [number, number, number, number]; seed?: string; color?: string; size?: number }> = ({
  frame, count = 20, area = [0, 0, 1920, 1080], seed = "sp", color = "#fff6d8", size = 1,
}) => (
  <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={full}>
    {Array.from({ length: count }, (_, i) => {
      const r = (k: string) => random(`${seed}${k}${i}`);
      const period = 40 + r("p") * 50;
      const ph = ((frame + r("o") * period) % period) / period;
      const k = Math.sin(ph * Math.PI);
      return <Star4 key={i} x={area[0] + r("x") * area[2]} y={area[1] + r("y") * area[3]} s={k * (0.5 + r("s")) * size} o={k} color={color} />;
    })}
  </svg>
);

export const LensFlare: React.FC<{ x: number; y: number; opacity?: number }> = ({ x, y, opacity = 1 }) => {
  const dx = 960 - x;
  const dy = 540 - y;
  const ghosts = [
    [0.4, 40, "#ffd29a", 0.25], [0.7, 18, "#ff9ad5", 0.35], [1.1, 70, "#9ad0ff", 0.15], [1.45, 30, "#c7a2ff", 0.3], [1.8, 110, "#ffb0c8", 0.1],
  ] as const;
  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ ...full, mixBlendMode: "screen" }} opacity={opacity}>
      <defs>
        <radialGradient id="flare-core"><stop offset="0" stopColor="#fff" /><stop offset="0.2" stopColor="#fff4d6" stopOpacity="0.8" /><stop offset="1" stopColor="#ffb070" stopOpacity="0" /></radialGradient>
        <linearGradient id="flare-streak" x1="0" x2="1"><stop offset="0" stopColor="#ffd9a8" stopOpacity="0" /><stop offset="0.5" stopColor="#fff" /><stop offset="1" stopColor="#ffd9a8" stopOpacity="0" /></linearGradient>
      </defs>
      <circle cx={x} cy={y} r={260} fill="url(#flare-core)" />
      <rect x={x - 900} y={y - 3} width={1800} height={6} fill="url(#flare-streak)" opacity={0.8} />
      {ghosts.map(([t, r, c, o], i) => (
        <g key={i}>
          <circle cx={x + dx * t} cy={y + dy * t} r={r} fill={c} opacity={o} />
          <circle cx={x + dx * t} cy={y + dy * t} r={r} fill="none" stroke={c} strokeWidth={2} opacity={o * 1.6} />
        </g>
      ))}
    </svg>
  );
};

/** Final grade: bloom tint, vignette and animated grain. */
export const AnimeGrade: React.FC<{ frame: number; warmth?: string; vignette?: number; grain?: number }> = ({ frame, warmth = "#ff9a6b", vignette = 0.55, grain = 0.07 }) => (
  <>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, ${warmth}22 0%, transparent 60%)`, mixBlendMode: "screen" }} />
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, transparent 55%, rgba(10,4,30,${vignette}) 100%)` }} />
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ ...full, opacity: grain, mixBlendMode: "overlay" }}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 12} />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="1920" height="1080" filter="url(#grain)" />
    </svg>
  </>
);

/** Letterbox bars for the cinematic look (0..1 amount). */
export const Letterbox: React.FC<{ amount?: number }> = ({ amount = 1 }) => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 96 * amount, background: "#05030c" }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 96 * amount, background: "#05030c" }} />
  </>
);

export const Flash: React.FC<{ k: number; color?: string }> = ({ k, color = "#fff" }) =>
  k > 0 ? <AbsoluteFill style={{ background: color, opacity: k }} /> : null;
