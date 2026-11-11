/**
 * Painted anime skies: sunset (gradient + glowing sun + towering lit cumulus)
 * and night (stars, milky band, shooting star). All 1920×1080, pure SVG.
 */
import React from "react";
import { random } from "remotion";
import { ANIME, mix } from "./palette";

type Puff = [number, number, number]; // cx, cy, r (relative to the cloud origin)

/** A cumulus = many overlapping circles sharing one user-space gradient, flat bottom. */
const CUMULUS: Puff[] = [
  [0, 0, 120], [140, -40, 150], [300, -10, 130], [430, 30, 100], [-130, 40, 95], [80, -170, 110],
  [230, -180, 120], [160, -290, 95], [360, -110, 105], [-40, -90, 90], [520, 60, 70], [-230, 70, 60],
];
const SMALL: Puff[] = [[0, 0, 60], [70, -25, 70], [150, 0, 55], [-60, 15, 45], [40, -80, 45], [110, -70, 40]];

export const AnimeCloud: React.FC<{
  x: number; y: number; scale?: number; id: string; puffs?: Puff[];
  lit?: string; body?: string; shade?: string; rim?: string; opacity?: number;
}> = ({ x, y, scale = 1, id, puffs = CUMULUS, lit = "#fff1d6", body = "#f39ab4", shade = "#7b4a9e", rim = "#ffe9a8", opacity = 1 }) => {
  const minY = Math.min(...puffs.map((p) => p[1] - p[2]));
  const maxY = Math.max(...puffs.map((p) => p[1] + p[2] * 0.35));
  const minX = Math.min(...puffs.map((p) => p[0] - p[2]));
  const maxX = Math.max(...puffs.map((p) => p[0] + p[2]));
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <defs>
        <linearGradient id={`${id}-g`} gradientUnits="userSpaceOnUse" x1={0} y1={minY} x2={0} y2={maxY}>
          <stop offset="0" stopColor={lit} />
          <stop offset="0.38" stopColor={body} />
          <stop offset="1" stopColor={shade} />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect x={minX - 10} y={minY - 10} width={maxX - minX + 20} height={maxY - minY + 10} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        {/* rim glow: slightly bigger copies in a warm tone */}
        {puffs.map(([cx, cy, r], i) => <circle key={`r${i}`} cx={cx + 3} cy={cy - 4} r={r + 5} fill={rim} opacity={0.8} />)}
        {puffs.map(([cx, cy, r], i) => <circle key={i} cx={cx} cy={cy} r={r} fill={`url(#${id}-g)`} />)}
        {/* scalloped cel shadow: same puffs, shifted down-left, in the shade tone */}
        <g opacity={0.3}>
          {puffs.map(([cx, cy, r], i) => (
            <circle key={`s${i}`} cx={cx - r * 0.2} cy={cy + r * 0.7} r={r * 0.85} fill={shade} />
          ))}
        </g>
      </g>
    </g>
  );
};

export const SunsetSky: React.FC<{ frame: number; sunX?: number; sunY?: number; drift?: number }> = ({ frame, sunX = 1350, sunY = 760, drift = 0.15 }) => {
  const s = ANIME.sunset;
  const d = frame * drift;
  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="sunset-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={s.top} />
          <stop offset="0.38" stopColor={s.mid} />
          <stop offset="0.7" stopColor={s.low} />
          <stop offset="0.92" stopColor={s.horizon} />
        </linearGradient>
        <radialGradient id="sun-glow">
          <stop offset="0" stopColor="#fffbe8" />
          <stop offset="0.12" stopColor={s.sun} />
          <stop offset="0.35" stopColor="#ffb86b" stopOpacity="0.7" />
          <stop offset="1" stopColor="#ff6f61" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#sunset-sky)" />
      <circle cx={sunX} cy={sunY} r={620} fill="url(#sun-glow)" />
      {/* thin high cirrus streaks */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={((i * 430 + d * 1.6) % 2600) - 500} y={140 + i * 46} width={520 + i * 60} height={5 + (i % 2) * 3} rx={4} fill="#ffc2d6" opacity={0.35} />
      ))}
      <AnimeCloud id="c1" x={330 + d} y={520} scale={1.15} />
      <AnimeCloud id="c2" x={1500 + d * 0.7} y={420} scale={0.85} lit="#fff6dc" />
      <AnimeCloud id="c3" x={980 + d * 1.3} y={640} scale={0.45} puffs={SMALL} body="#ff9db0" />
      <AnimeCloud id="c4" x={80 + d * 1.1} y={210} scale={0.6} puffs={SMALL} body="#d47bb8" shade="#5a3a8a" lit="#ffd9c9" />
      <AnimeCloud id="c5" x={1750 + d * 1.2} y={180} scale={0.5} puffs={SMALL} body="#c873b6" shade="#4d357f" lit="#ffd0d0" />
      <circle cx={sunX} cy={sunY} r={70} fill="#fffaf0" />
    </svg>
  );
};

export const DaySky: React.FC<{ frame: number; drift?: number }> = ({ frame, drift = 0.12 }) => {
  const d = frame * drift;
  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="day-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f6fe0" />
          <stop offset="0.55" stopColor="#5fa8ff" />
          <stop offset="0.9" stopColor="#c9e6ff" />
        </linearGradient>
        <radialGradient id="day-sun"><stop offset="0" stopColor="#ffffff" /><stop offset="0.2" stopColor="#fffbe6" stopOpacity="0.8" /><stop offset="1" stopColor="#ffffff" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#day-sky)" />
      <circle cx={1500} cy={170} r={360} fill="url(#day-sun)" />
      <AnimeCloud id="d1" x={360 + d} y={560} scale={1.1} lit="#ffffff" body="#f4f8ff" shade="#9fb8e6" rim="#ffffff" />
      <AnimeCloud id="d2" x={1460 + d * 0.7} y={470} scale={0.8} lit="#ffffff" body="#eef4ff" shade="#9ab2e0" rim="#ffffff" />
      <AnimeCloud id="d3" x={900 + d * 1.3} y={300} scale={0.5} puffs={SMALL} lit="#ffffff" body="#f2f7ff" shade="#a9bfe8" rim="#ffffff" />
      <AnimeCloud id="d4" x={120 + d * 1.1} y={200} scale={0.45} puffs={SMALL} lit="#ffffff" body="#f2f7ff" shade="#a9bfe8" rim="#ffffff" />
    </svg>
  );
};

export const NightSky: React.FC<{ frame: number; shootAt?: number; tint?: number }> = ({ frame, shootAt = 60, tint = 0 }) => {
  const n = ANIME.night;
  const stars = Array.from({ length: 220 }, (_, i) => ({
    x: random(`sx${i}`) * 1920, y: random(`sy${i}`) * 900, r: 0.6 + random(`sr${i}`) ** 3 * 2.6,
    tw: random(`st${i}`) * Math.PI * 2,
  }));
  const st = frame - shootAt;
  const shoot = st >= 0 && st < 26 ? st / 26 : -1;
  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id="night-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={n.top} />
          <stop offset="0.5" stopColor={n.mid} />
          <stop offset="0.85" stopColor={n.low} />
          <stop offset="1" stopColor={mix(n.horizon, "#ff8fb1", tint)} />
        </linearGradient>
        <linearGradient id="milky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9fb4ff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#d9c6ff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#9fb4ff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="shoot" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
        <filter id="soft"><feGaussianBlur stdDeviation="30" /></filter>
      </defs>
      <rect width="1920" height="1080" fill="url(#night-sky)" />
      <path d="M-100 820 C 400 500, 900 420, 2050 80 L 2050 330 C 1000 620, 500 700, -100 1000 Z" fill="url(#milky)" filter="url(#soft)" />
      {stars.map((s, i) => {
        const a = 0.45 + 0.55 * Math.abs(Math.sin(frame * 0.06 + s.tw));
        return s.r > 2.4 ? (
          <g key={i} transform={`translate(${s.x} ${s.y}) scale(${0.7 + a * 0.5})`} opacity={a}>
            <path d="M0 -9 L1.6 -1.6 L9 0 L1.6 1.6 L0 9 L-1.6 1.6 L-9 0 L-1.6 -1.6 Z" fill="#fff" />
          </g>
        ) : (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#eef0ff" opacity={a} />
        );
      })}
      {shoot >= 0 && (
        <g transform={`translate(${1500 - shoot * 900} ${120 + shoot * 380}) rotate(157)`} opacity={Math.sin(shoot * Math.PI)}>
          <rect x={-320} y={-2} width={320} height={4} rx={2} fill="url(#shoot)" />
          <circle r={5} fill="#fff" />
        </g>
      )}
    </svg>
  );
};
