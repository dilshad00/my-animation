// Video-005 "What if a zombie outbreak started tonight?" — painted ANIME environments.
// Same look as src/components/anime (flat cel tones, soft gradients, rim light, deep night blues),
// tuned for horror: emergency reds, sickly fluorescent greens, smoke and blackout.
// Registered additively in src/components/environments/registry.tsx (types start with "z-").
import React from "react";
import { AbsoluteFill, random } from "remotion";
import { Layer, SvgLayer } from "../../../src/components/camera/Camera";
import type { EnvProps } from "../../../src/components/environments/common";
import { DaySky, NightSky, SunsetSky } from "../../../src/components/anime/AnimeSky";
import { RooftopFence } from "../../../src/components/anime/AnimeCity";
import { mix } from "../../../src/components/anime/palette";
import { useScene } from "../../../src/scenes/context";
import { useSvgId } from "../../../src/utils/svg";
import { tweenNum } from "../../../src/utils/tween";

const GY = 1120; // anime busts stand just below the frame
const LINE = "#1a1024";
type Tod = "day" | "sunset" | "night" | "dawn";
const tod = (s: EnvProps["spec"]): Tod => (s.time === "night" ? "night" : s.time === "sunset" ? "sunset" : s.time === "dawn" ? "dawn" : "day");
const useFrame = (t: number) => Math.round(t * useScene().fps);
const P = (spec: EnvProps["spec"], k: string, t: number, d: number) => tweenNum(spec.props?.[k], t, d);
const R = (k: string) => random(`z5-${k}`);
/** fluorescent flicker: mostly on, with short random drop-outs */
const flick = (frame: number, seed: string, amount: number) => {
  if (amount <= 0) return 1;
  const b = Math.floor(frame / 3);
  return random(`${seed}${b}`) < 0.18 * amount ? 0.25 + random(`${seed}x${b}`) * 0.3 : 1;
};

/** Full-bleed SVG plate; draws 240 px past each edge so camera moves never show a border. */
const Plate: React.FC<{ depth: number; children: React.ReactNode }> = ({ depth, children }) => <SvgLayer depth={depth}>{children}</SvgLayer>;

/** Painted anime sky (kit component) in an over-scaled camera layer, like src/components/anime/environments. */
const SkyPlate: React.FC<{ time: Tod; frame: number; tint?: number; depth?: number }> = ({ time, frame, tint = 0, depth = 0.06 }) => (
  <Layer depth={depth}>
    <AbsoluteFill style={{ transform: "scale(1.14)" }}>
      {time === "night" ? <NightSky frame={frame} shootAt={-999} tint={tint} /> : time === "sunset" ? <SunsetSky frame={frame} /> : time === "dawn" ? <SunsetSky frame={frame} sunX={1500} sunY={900} /> : <DaySky frame={frame} />}
    </AbsoluteFill>
  </Layer>
);

/** Soft round glow (radial gradient, no hard edge). */
const Glow: React.FC<{ cx: number; cy: number; rx: number; ry: number; color: string; a: number }> = ({ cx, cy, rx, ry, color, a }) => {
  const id = useSvgId("gl");
  if (a <= 0) return null;
  return (
    <>
      <defs>
        <radialGradient id={id}><stop offset="0" stopColor={color} stopOpacity={a} /><stop offset="0.45" stopColor={color} stopOpacity={a * 0.35} /><stop offset="1" stopColor={color} stopOpacity={0} /></radialGradient>
      </defs>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id})`} />
    </>
  );
};

/** Rising smoke column (stacked soft puffs, drifting with the wind). */
export const Smoke: React.FC<{ x: number; base: number; h: number; frame: number; color?: string; w?: number; seed: string; glow?: number }> = ({ x, base, h, frame, color = "#2c2a36", w = 90, seed, glow = 0 }) => {
  const id = useSvgId("smk");
  const n = 14;
  return (
    <g>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={color} stopOpacity={0.85} />
          <stop offset="0.6" stopColor={color} stopOpacity={0.45} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <Glow cx={x} cy={base} rx={w * 2.6} ry={w * 1.1} color="#ff6a2a" a={0.55 * glow} />
      {Array.from({ length: n }, (_, i) => {
        const k = ((i / n + frame * 0.0035 + random(`${seed}o`)) % 1);
        const y = base - k * h;
        const dx = k * k * h * 0.45 + Math.sin(frame * 0.02 + i) * 12;
        const r = w * (0.5 + k * 1.6) * (0.8 + random(`${seed}${i}`) * 0.4);
        return <circle key={i} cx={x + dx} cy={y} r={r} fill={`url(#${id})`} opacity={(1 - k) * 0.9} />;
      })}
    </g>
  );
};

/** Distant shambling silhouettes (zombie crowd) along a horizon line. */
export const HordeLine: React.FC<{ y: number; frame: number; n: number; scale: number; color: string; seed: string; x0?: number; x1?: number; eyes?: string }> = ({ y, frame, n, scale, color, seed, x0 = -200, x1 = 2120, eyes }) => (
  <g>
    {Array.from({ length: n }, (_, i) => {
      const x = x0 + (i + random(`${seed}x${i}`) * 0.8) * ((x1 - x0) / n);
      const s = scale * (0.8 + random(`${seed}s${i}`) * 0.4);
      const ph = random(`${seed}p${i}`) * 6.28;
      const lean = Math.sin(frame * 0.05 + ph) * 6 + 8;
      const step = Math.sin(frame * 0.1 + ph) * 6;
      const armUp = random(`${seed}a${i}`) > 0.5;
      return (
        <g key={i} transform={`translate(${x + Math.sin(frame * 0.012 + ph) * 10} ${y}) scale(${s})`}>
          <g transform={`rotate(${lean})`}>
            <path d={`M-14 0 L ${-8 + step} -70 L 8 -70 L ${14 - step} 0 Z`} fill={color} />
            <path d="M-20 -70 C -22 -110, -16 -132, 0 -134 C 16 -132, 22 -110, 20 -70 Z" fill={color} />
            <circle cx={4} cy={-150} r={17} fill={color} />
            {armUp ? <path d={`M10 -124 L 46 ${-118 + step} L 48 ${-112 + step} L 12 -112 Z`} fill={color} /> : <path d="M14 -124 L 22 -80 L 14 -78 L 8 -118 Z" fill={color} />}
            {eyes ? <circle cx={10} cy={-152} r={2.4} fill={eyes} /> : null}
          </g>
        </g>
      );
    })}
  </g>
);

/** Abandoned car, 3/4 rear view, cel-shaded. */
const Car: React.FC<{ x: number; y: number; s: number; body: string; lights?: number; door?: boolean; flip?: boolean }> = ({ x, y, s, body, lights = 0, door, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <ellipse cx={0} cy={4} rx={150} ry={16} fill="#000" opacity={0.35} />
    <path d="M-140 -10 L -138 -70 C -130 -86, -110 -92, -96 -94 L -70 -140 C -60 -152, 60 -152, 70 -140 L 96 -94 C 110 -92, 130 -86, 138 -70 L 140 -10 Z" fill={body} />
    <path d="M-60 -136 L 60 -136 L 82 -96 L -82 -96 Z" fill="#1d2433" />
    <path d="M-52 -130 L 0 -130 L -30 -100 L -72 -100 Z" fill="#ffffff" opacity={0.12} />
    <path d="M-140 -40 L 140 -40 L 140 -10 L -140 -10 Z" fill={mix(body, "#000000", 0.35)} />
    <rect x={-40} y={-62} width={80} height={18} rx={3} fill="#e8e4d0" />
    {[-1, 1].map((sd) => (
      <g key={sd}>
        <rect x={sd * 112 - 22} y={-72} width={44} height={16} rx={4} fill={lights > 0 ? "#ff3b4a" : "#6b1e28"} />
        {lights > 0 ? <ellipse cx={sd * 112} cy={-64} rx={60} ry={22} fill="#ff3b4a" opacity={0.25 * lights} /> : null}
      </g>
    ))}
    <rect x={-128} y={-12} width={40} height={14} rx={4} fill="#111" />
    <rect x={88} y={-12} width={40} height={14} rx={4} fill="#111" />
    {door ? <path d="M140 -88 L 210 -120 L 214 -40 L 140 -20 Z" fill={mix(body, "#ffffff", 0.12)} stroke={LINE} strokeWidth={2} /> : null}
    <path d="M-138 -70 L 138 -70" stroke="#ffffff" strokeOpacity={0.25} strokeWidth={3} />
  </g>
);

/* ───────────────────────── 1. Hospital ER corridor ───────────────────────── */
export const ZHospital: React.FC<EnvProps> = ({ spec, t }) => {
  const frame = useFrame(t);
  const g = useSvgId("hos");
  const fl = flick(frame, "hos", P(spec, "flicker", t, 0.6));
  const alarm = P(spec, "alarm", t, 0);
  const sweep = (Math.sin(frame * 0.18) + 1) / 2;
  const vx = 960, vy = 470;
  const panels = [0.12, 0.3, 0.5, 0.72];
  return (
    <>
      <Plate depth={0.35}>
        <defs>
          <linearGradient id={`${g}w`} x1="0" x2="1"><stop offset="0" stopColor="#3f5e63" /><stop offset="1" stopColor="#8fb1ad" /></linearGradient>
          <linearGradient id={`${g}w2`} x1="1" x2="0"><stop offset="0" stopColor="#3a565b" /><stop offset="1" stopColor="#86a7a3" /></linearGradient>
          <linearGradient id={`${g}f`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6f8f8a" /><stop offset="1" stopColor="#24363a" /></linearGradient>
          <radialGradient id={`${g}l`}><stop offset="0" stopColor="#eaffef" stopOpacity="0.9" /><stop offset="1" stopColor="#eaffef" stopOpacity="0" /></radialGradient>
        </defs>
        {/* ceiling, walls, floor in one-point perspective */}
        <path d={`M-240 -240 H2160 L ${vx + 260} ${vy - 190} H ${vx - 260} Z`} fill="#c9d8d2" />
        <path d={`M-240 -240 L ${vx - 260} ${vy - 190} V ${vy + 150} L -240 1320 Z`} fill={`url(#${g}w)`} />
        <path d={`M2160 -240 L ${vx + 260} ${vy - 190} V ${vy + 150} L 2160 1320 Z`} fill={`url(#${g}w2)`} />
        <path d={`M-240 1320 L ${vx - 260} ${vy + 150} H ${vx + 260} L 2160 1320 Z`} fill={`url(#${g}f)`} />
        {/* floor reflection stripe + tiles */}
        <path d={`M${vx - 60} ${vy + 150} L ${vx + 60} ${vy + 150} L 1260 1320 L 660 1320 Z`} fill="#eaffef" opacity={0.12 * fl} />
        {Array.from({ length: 9 }, (_, i) => {
          const k = (i + 1) / 10;
          const y = vy + 150 + (1320 - vy - 150) * k * k;
          return <line key={i} x1={-240} y1={y} x2={2160} y2={y} stroke="#000" strokeOpacity={0.12} strokeWidth={2} />;
        })}
        {/* handrails + wall stripe */}
        <path d={`M-240 760 L ${vx - 260} ${vy + 40}`} stroke="#d9e6e2" strokeWidth={10} />
        <path d={`M2160 760 L ${vx + 260} ${vy + 40}`} stroke="#d9e6e2" strokeWidth={10} />
        <path d={`M-240 900 L ${vx - 260} ${vy + 80}`} stroke="#2f8f86" strokeWidth={26} opacity={0.7} />
        <path d={`M2160 900 L ${vx + 260} ${vy + 80}`} stroke="#2f8f86" strokeWidth={26} opacity={0.7} />
        {/* side doors */}
        {[0.25, 0.55].map((k, i) => {
          const x = -240 + (vx - 260 + 240) * k;
          const top = -240 + (vy - 190 + 240) * k + 180 * (1 - k);
          const bot = 1320 + (vy + 150 - 1320) * k;
          const w = 210 * (1 - k * 0.8);
          return (
            <g key={i}>
              <path d={`M${x} ${top} L ${x + w} ${top + w * 0.35} L ${x + w} ${bot - w * 0.35} L ${x} ${bot} Z`} fill="#2d4448" />
              <path d={`M${x} ${top} L ${x + w} ${top + w * 0.35} L ${x + w} ${bot - w * 0.35} L ${x} ${bot} Z`} fill="#2a4044" transform="translate(1920 0) scale(-1 1)" />
            </g>
          );
        })}
        {/* end double doors with round windows + red EMERGENCY sign */}
        <rect x={vx - 260} y={vy - 190} width={520} height={340} fill="#a9c2bd" />
        <rect x={vx - 170} y={vy - 120} width={340} height={270} fill="#5c7a7a" stroke={LINE} strokeWidth={4} />
        <line x1={vx} y1={vy - 120} x2={vx} y2={vy + 150} stroke={LINE} strokeWidth={4} />
        {[-1, 1].map((s) => <circle key={s} cx={vx + s * 85} cy={vy - 40} r={34} fill="#cfe9df" opacity={0.6 + 0.4 * fl} stroke={LINE} strokeWidth={4} />)}
        <rect x={vx - 120} y={vy - 180} width={240} height={46} rx={6} fill="#3a0d14" />
        <text x={vx} y={vy - 147} textAnchor="middle" fontSize={30} fontWeight={800} fill="#ff4a5a" fontFamily="Arial, sans-serif" letterSpacing={3} opacity={0.75 + 0.25 * fl}>EMERGENCY</text>
        <ellipse cx={vx} cy={vy - 157} rx={180} ry={60} fill="#ff2a3a" opacity={0.12 * fl} />
        {/* ceiling light panels */}
        {panels.map((k, i) => {
          const y = -240 + (vy - 190 + 240) * k;
          const hw = 380 * (1 - k) + 60;
          const on = i === 1 ? fl : 1;
          return (
            <g key={i}>
              <path d={`M${vx - hw} ${y} L ${vx + hw} ${y} L ${vx + hw * 0.86} ${y + 40 * (1 - k) + 8} L ${vx - hw * 0.86} ${y + 40 * (1 - k) + 8} Z`} fill={on > 0.6 ? "#f4fff6" : "#6d807a"} />
              <ellipse cx={vx} cy={y + 60} rx={hw * 1.4} ry={140 * (1 - k) + 30} fill={`url(#${g}l)`} opacity={0.5 * on} />
            </g>
          );
        })}
      </Plate>
      {/* empty gurney, foreground left */}
      <Plate depth={0.8}>
        <g transform="translate(330 900)">
          <ellipse cx={0} cy={150} rx={300} ry={26} fill="#000" opacity={0.3} />
          <rect x={-280} y={-20} width={560} height={40} rx={10} fill="#e6eeea" stroke={LINE} strokeWidth={3} />
          <path d="M-270 -20 C -200 -50, 120 -60, 270 -24 Z" fill="#f7fbf9" />
          <path d="M-100 -46 C -40 -60, 60 -60, 120 -48 L 110 -20 L -90 -20 Z" fill="#9fc7c0" opacity={0.6} />
          <rect x={-250} y={20} width={14} height={120} fill="#8a9a96" />
          <rect x={236} y={20} width={14} height={120} fill="#8a9a96" />
          <circle cx={-243} cy={146} r={10} fill="#333" />
          <circle cx={243} cy={146} r={10} fill="#333" />
          <path d="M180 -40 L 260 -160" stroke="#b9c8c4" strokeWidth={6} />
          <rect x={240} y={-200} width={40} height={60} rx={8} fill="#cfe8f2" opacity={0.8} />
        </g>
      </Plate>
      {/* red alarm wash */}
      {alarm > 0 ? (
        <Plate depth={0}>
          <rect x={-240} y={-240} width={2400} height={1560} fill="#ff1830" opacity={alarm * (0.1 + 0.18 * sweep)} style={{ mixBlendMode: "screen" }} />
          <ellipse cx={vx + 380} cy={150} rx={30} ry={18} fill="#ff2a3a" opacity={alarm} />
          <path d={`M${vx + 380} 150 L ${vx + 380 + Math.cos(frame * 0.3) * 900} ${150 + 500} L ${vx + 380 + Math.cos(frame * 0.3 + 0.4) * 900} 650 Z`} fill="#ff2a3a" opacity={0.12 * alarm} />
        </Plate>
      ) : null}
    </>
  );
};

/* ───────────────────────── 2. City street (calm → panic → abandoned) ───────────────────────── */
const SHOPS = ["PHARMACY", "24H MART", "CAFE", "BOOKS", "RAMEN", "CLINIC", "ARCADE", "BAKERY"];
export const ZStreet: React.FC<EnvProps> = ({ spec, t }) => {
  const frame = useFrame(t);
  const time = tod(spec);
  const night = time === "night";
  const smoke = P(spec, "smoke", t, 0);
  const fire = P(spec, "fire", t, 0);
  const horde = P(spec, "horde", t, 0);
  const cars = P(spec, "cars", t, 1);
  const police = P(spec, "police", t, 0);
  const lights = P(spec, "lights", t, night ? 1 : 0);
  const g = useSvgId("st");
  const vx = 960, hz = 600;
  const wall = night ? "#1d2140" : time === "sunset" ? "#7a4a6a" : "#9aa8c8";
  const wall2 = night ? "#141733" : time === "sunset" ? "#5e3656" : "#7c8bb0";
  const blink = Math.floor(frame / 8) % 2;
  return (
    <>
      <SkyPlate time={time} frame={frame} tint={smoke * 0.5} />
      <Plate depth={0.2}>
        {/* far towers */}
        {Array.from({ length: 12 }, (_, i) => {
          const w = 70 + R(`stw${i}`) * 90;
          const x = 560 + i * 72 - 40;
          const h = 160 + R(`sth${i}`) * 260;
          return <rect key={i} x={x} y={hz - h} width={w} height={h + 20} fill={night ? "#2a2f62" : time === "sunset" ? "#a0587e" : "#b4c4e4"} opacity={0.9} />;
        })}
        {smoke > 0 ? [[700, 320], [1180, 280], [1500, 260]].map(([x, h], i) => <Smoke key={i} x={x} base={hz - 40} h={h + 380 * smoke} frame={frame} seed={`sts${i}`} w={60 + 30 * smoke} glow={fire} color={night ? "#1a1626" : "#3b3440"} />) : null}
      </Plate>
      <Plate depth={0.5}>
        <defs>
          <linearGradient id={`${g}r`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={night ? "#2a2c48" : "#6d6f88"} /><stop offset="1" stopColor={night ? "#0c0d1c" : "#34354a"} /></linearGradient>
        </defs>
        {/* road + sidewalks */}
        <path d={`M-240 1320 L ${vx - 120} ${hz} H ${vx + 120} L 2160 1320 Z`} fill={`url(#${g}r)`} />
        <path d={`M-240 1100 L ${vx - 120} ${hz} L ${vx - 170} ${hz} L -240 980 Z`} fill={night ? "#3a3c5a" : "#a4a3b4"} />
        <path d={`M2160 1100 L ${vx + 120} ${hz} L ${vx + 170} ${hz} L 2160 980 Z`} fill={night ? "#3a3c5a" : "#a4a3b4"} />
        {Array.from({ length: 7 }, (_, i) => {
          const k1 = Math.pow(i / 7, 2), k2 = Math.pow((i + 0.5) / 7, 2);
          const y1 = hz + (1320 - hz) * k1, y2 = hz + (1320 - hz) * k2;
          return <path key={i} d={`M${vx - 4 - 10 * k1} ${y1} L ${vx + 4 + 10 * k1} ${y1} L ${vx + 4 + 14 * k2} ${y2} L ${vx - 4 - 14 * k2} ${y2} Z`} fill="#f2e7a8" opacity={0.7} />;
        })}
        {/* buildings both sides with shop signs */}
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <path d={sd < 0 ? `M-240 -240 L ${vx - 170} 260 L ${vx - 170} ${hz} L -240 980 Z` : `M2160 -240 L ${vx + 170} 260 L ${vx + 170} ${hz} L 2160 980 Z`} fill={sd < 0 ? wall : wall2} />
            {Array.from({ length: 4 }, (_, i) => {
              const k = i / 4;
              const x = sd < 0 ? -240 + (vx - 170 + 240) * k : 2160 - (2160 - vx - 170) * k;
              const x2 = sd < 0 ? -240 + (vx - 170 + 240) * (k + 0.2) : 2160 - (2160 - vx - 170) * (k + 0.2);
              const yTop = 980 + (hz - 980) * k - 150 * (1 - k);
              const yTop2 = 980 + (hz - 980) * (k + 0.2) - 150 * (1 - k - 0.2);
              const hgt = 70 * (1 - k * 0.7);
              const name = SHOPS[(i + (sd > 0 ? 4 : 0)) % SHOPS.length];
              const lit = lights > R(`sl${sd}${i}`) * 0.9;
              const signC = ["#ff5a7a", "#5ae0ff", "#ffd35a", "#9a7aff"][(i + (sd > 0 ? 2 : 0)) % 4];
              return (
                <g key={i}>
                  <path d={`M${x} ${yTop - hgt} L ${x2} ${yTop2 - hgt * 0.8} L ${x2} ${yTop2} L ${x} ${yTop} Z`} fill={lit ? signC : "#2b2b3a"} opacity={lit ? 0.95 : 0.9} />
                  {lit && night ? <Glow cx={(x + x2) / 2} cy={(yTop + yTop2) / 2 - hgt / 2} rx={Math.abs(x2 - x) * 0.8} ry={hgt * 1.2} color={signC} a={0.45} /> : null}
                  <text x={(x + x2) / 2} y={(yTop + yTop2) / 2 - hgt * 0.35} textAnchor="middle" fontSize={hgt * 0.42} fontWeight={800} fill={lit ? "#ffffff" : "#55556a"} fontFamily="Arial, sans-serif">{name}</text>
                  {/* shop window glow */}
                  <path d={`M${x} ${yTop + 10} L ${x2} ${yTop2 + 8} L ${x2} ${yTop2 + (980 - yTop2) * 0.45} L ${x} ${yTop + (1100 - yTop) * 0.45} Z`} fill={lit ? (night ? "#ffd99a" : "#dfe8ff") : "#14141f"} opacity={lit ? 0.55 : 0.85} />
                </g>
              );
            })}
          </g>
        ))}
        {/* distant horde on the road */}
        {horde > 0 ? <HordeLine y={hz + 30} frame={frame} n={Math.round(6 + 26 * horde)} scale={0.32} color={night ? "#090914" : "#2b2433"} seed="sth" x0={vx - 260} x1={vx + 260} eyes={night ? "#d8ff7a" : undefined} /> : null}
        {/* abandoned cars */}
        {cars > 0 ? (
          <g opacity={Math.min(1, cars)}>
            <Car x={720} y={760} s={0.55} body="#c94a5a" lights={night ? 1 : 0} door />
            <Car x={1290} y={720} s={0.42} body="#4a7ac9" flip />
            <Car x={1010} y={660} s={0.28} body="#e0d6c8" lights={night ? 0.6 : 0} />
          </g>
        ) : null}
        {/* street lamps */}
        {[0.35, 0.6].map((k, i) => [-1, 1].map((sd) => {
          const x = vx + sd * (170 + (1 - k) * 900);
          const yb = hz + (1100 - hz) * (1 - k);
          const h = 520 * (1 - k) + 80;
          return (
            <g key={`${i}${sd}`}>
              <rect x={x - 5} y={yb - h} width={10} height={h} fill={LINE} />
              <path d={`M${x} ${yb - h} q ${-sd * 40} -10 ${-sd * 70} 10`} stroke={LINE} strokeWidth={8} fill="none" />
              {night && lights > 0.2 ? <Glow cx={x - sd * 70} cy={yb - h + 14} rx={90} ry={70} color="#ffe2a0" a={0.6} /> : null}
              <path d={`M${x - sd * 86} ${yb - h + 4} h 32 l -6 10 h -20 Z`} fill={LINE} />
            </g>
          );
        }))}
      </Plate>
      {police > 0 ? (
        <Plate depth={0}>
          <rect x={-240} y={-240} width={2400} height={1560} fill={blink ? "#ff2040" : "#2050ff"} opacity={police * 0.16} style={{ mixBlendMode: "screen" }} />
        </Plate>
      ) : null}
      {fire > 0 ? (
        <Plate depth={0}><rect x={-240} y={600} width={2400} height={720} fill="#ff7a2a" opacity={fire * 0.14 * (0.85 + 0.15 * Math.sin(frame * 0.4))} style={{ mixBlendMode: "screen" }} /></Plate>
      ) : null}
    </>
  );
};

/* ───────────────────────── 3. Jammed bridge ───────────────────────── */
export const ZBridge: React.FC<EnvProps> = ({ spec, t }) => {
  const frame = useFrame(t);
  const time = tod(spec);
  const night = time !== "day";
  const jam = P(spec, "jam", t, 1);
  const smoke = P(spec, "smoke", t, 0.4);
  const hz = 640;
  const cols = ["#c94a5a", "#4a7ac9", "#e0d6c8", "#3a3a48", "#e8c14a", "#6a9a6a", "#b0b6c8"];
  const rows = Math.round(10 * jam);
  return (
    <>
      <SkyPlate time={time} frame={frame} tint={0.3} />
      <Plate depth={0.18}>
        {Array.from({ length: 18 }, (_, i) => {
          const h = 120 + R(`brh${i}`) * 300;
          return <rect key={i} x={-100 + i * 125} y={hz - 30 - h} width={100 + R(`brw${i}`) * 40} height={h} fill={night ? "#262a5c" : "#a8b8dc"} />;
        })}
        {[300, 980, 1600].map((x, i) => <Smoke key={i} x={x} base={hz - 80} h={300 + 300 * smoke} frame={frame} seed={`brs${i}`} w={70} glow={night ? 0.5 * smoke : 0} color={night ? "#1b1828" : "#4a4450"} />)}
        <rect x={-240} y={hz - 30} width={2400} height={200} fill={night ? "#101634" : "#5d7aa8"} />
        {Array.from({ length: 40 }, (_, i) => <rect key={i} x={-240 + i * 62} y={hz - 20 + (i % 3) * 30} width={30} height={3} fill={night ? "#ffcf7a" : "#e6f2ff"} opacity={0.3} />)}
      </Plate>
      <Plate depth={0.55}>
        {/* deck */}
        <path d={`M-240 1320 L 760 ${hz} L 1160 ${hz} L 2160 1320 Z`} fill={night ? "#23243a" : "#7a7c90"} />
        {/* towers + cables */}
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <path d={`M${960 + sd * 330} ${hz} L ${960 + sd * 300} 120 L ${960 + sd * 260} 120 L ${960 + sd * 280} ${hz} Z`} fill={night ? "#2b2c54" : "#b55a4a"} />
            {Array.from({ length: 9 }, (_, i) => <line key={i} x1={960 + sd * 280} y1={140} x2={960 + sd * (300 + i * 210)} y2={hz + (i + 1) * 75} stroke={night ? "#4a4d80" : "#d07a68"} strokeWidth={3} />)}
            <path d={`M${960 + sd * 280} 130 Q ${960 + sd * 900} 420 ${960 + sd * 1400} 360`} stroke={night ? "#4a4d80" : "#c46a58"} strokeWidth={10} fill="none" />
          </g>
        ))}
        {/* rows of stuck cars, far → near */}
        {Array.from({ length: rows }, (_, r) => {
          const k = (rows - r) / (rows + 1);
          const y = hz + (1220 - hz) * (1 - k) ** 1.6 + 20;
          const s = 0.18 + 0.8 * (1 - k) ** 1.6;
          const spread = 200 + 760 * (1 - k) ** 1.6;
          return [-1, 0, 1].map((lane) => {
            const id = `${r}${lane}`;
            if (R(`brc${id}`) > 0.85) return null;
            const brake = night ? 0.6 + 0.4 * (Math.floor(frame / 15 + R(`brb${id}`) * 7) % 5 ? 1 : 0.2) : 0;
            return <Car key={id} x={960 + lane * spread * 0.62 + (R(`brx${id}`) - 0.5) * 40} y={y} s={s} body={cols[Math.floor(R(`brk${id}`) * cols.length)]} lights={brake} door={R(`brd${id}`) > 0.82} flip={lane > 0} />;
          });
        })}
        {/* rails */}
        <path d={`M-240 1180 L 760 ${hz}`} stroke={night ? "#5a5d90" : "#dcdce8"} strokeWidth={14} />
        <path d={`M2160 1180 L 1160 ${hz}`} stroke={night ? "#5a5d90" : "#dcdce8"} strokeWidth={14} />
      </Plate>
    </>
  );
};

/* ───────────────────────── 4. Looted supermarket ───────────────────────── */
const GOODS = ["#e84a4a", "#f2c14a", "#4aa8e8", "#5ac87a", "#f28a3a", "#b07ae8", "#ffffff"];
export const ZMarket: React.FC<EnvProps> = ({ spec, t }) => {
  const frame = useFrame(t);
  const stock = P(spec, "stock", t, 0.3);
  const fl = flick(frame, "mk", P(spec, "flicker", t, 0.4));
  const dark = P(spec, "dark", t, 0);
  const g = useSvgId("mk");
  const vx = 960, vy = 500;
  return (
    <>
      <Plate depth={0.4}>
        <defs>
          <linearGradient id={`${g}f`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c9d0cc" /><stop offset="1" stopColor="#7d8580" /></linearGradient>
        </defs>
        <rect x={-240} y={-240} width={2400} height={1560} fill="#dfe6e2" />
        <path d={`M-240 1320 L ${vx - 140} ${vy + 80} H ${vx + 140} L 2160 1320 Z`} fill={`url(#${g}f)`} />
        {/* ceiling light rows */}
        {[0.1, 0.32, 0.55].map((k, i) => {
          const y = -240 + (vy - 160 + 240) * k;
          const hw = 600 * (1 - k) + 80;
          return <rect key={i} x={vx - hw} y={y} width={hw * 2} height={18 * (1 - k) + 6} fill={i === 1 && fl < 1 ? "#7a807c" : "#ffffff"} />;
        })}
        {/* shelf units both sides, in perspective, items fading by stock */}
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <path d={sd < 0 ? `M-240 -100 L ${vx - 140} ${vy - 140} L ${vx - 140} ${vy + 80} L -240 1320 Z` : `M2160 -100 L ${vx + 140} ${vy - 140} L ${vx + 140} ${vy + 80} L 2160 1320 Z`} fill={sd < 0 ? "#e8eef0" : "#d4dcdf"} />
            {Array.from({ length: 6 }, (_, s) => {
              const yA = -100 + s * 240, yB = vy - 140 + s * 38;
              const xA = sd < 0 ? -240 : 2160, xB = vx + sd * 140;
              const pt = (k: number, yOff = 0): [number, number] => [xA + (xB - xA) * k, yA + (yB - yA) * k + yOff * (1 - k * 0.85)];
              const [x1, y1] = pt(0), [x2, y2] = pt(1);
              return (
                <g key={s}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8c9498" strokeWidth={12 * 1} />
                  {Array.from({ length: 22 }, (_, i) => {
                    const k = i / 22;
                    if (R(`mk${sd}${s}${i}`) > stock) return null;
                    const [x, y] = pt(k + 0.02);
                    const sc = 1 - k * 0.85;
                    const c = GOODS[Math.floor(R(`mkc${sd}${s}${i}`) * GOODS.length)];
                    return <rect key={i} x={x - (sd < 0 ? 0 : 40 * sc)} y={y - 90 * sc} width={34 * sc} height={84 * sc} rx={4 * sc} fill={c} stroke={LINE} strokeWidth={1.5 * sc} />;
                  })}
                </g>
              );
            })}
          </g>
        ))}
        {/* far end: exit sign */}
        <rect x={vx - 140} y={vy - 140} width={280} height={220} fill="#c3ccc8" />
        <rect x={vx - 60} y={vy - 120} width={120} height={40} rx={4} fill="#1e6a3a" />
        <text x={vx} y={vy - 92} textAnchor="middle" fontSize={26} fontWeight={800} fill="#bfffd0" fontFamily="Arial">EXIT</text>
      </Plate>
      {/* foreground: spilled goods, toppled trolley */}
      <Plate depth={0.9}>
        {Array.from({ length: 14 }, (_, i) => (
          <rect key={i} x={300 + R(`sp${i}`) * 1300} y={930 + R(`spy${i}`) * 120} width={46} height={90} rx={6} fill={GOODS[i % GOODS.length]} stroke={LINE} strokeWidth={3}
            transform={`rotate(${R(`spr${i}`) * 180 - 90} ${323 + R(`sp${i}`) * 1300} ${975 + R(`spy${i}`) * 120})`} />
        ))}
        <g transform="translate(1560 1000) rotate(-12)">
          <path d="M-160 -150 L 160 -150 L 130 0 L -130 0 Z" fill="none" stroke="#9aa6b0" strokeWidth={10} />
          {Array.from({ length: 6 }, (_, i) => <line key={i} x1={-150 + i * 60} y1={-150} x2={-125 + i * 50} y2={0} stroke="#9aa6b0" strokeWidth={5} />)}
          <circle cx={-110} cy={40} r={20} fill="#333" /><circle cx={110} cy={40} r={20} fill="#333" />
          <path d="M160 -150 L 230 -200" stroke="#9aa6b0" strokeWidth={10} />
        </g>
      </Plate>
      <Plate depth={0}><rect x={-240} y={-240} width={2400} height={1560} fill="#0a1418" opacity={(1 - fl) * 0.35 + dark * 0.6} /></Plate>
    </>
  );
};

/* ───────────────────────── 5. Dark bedroom with phone glow ───────────────────────── */
export const ZBedroom: React.FC<EnvProps> = ({ spec, t }) => {
  const frame = useFrame(t);
  const glow = P(spec, "glow", t, 1);
  const alert = P(spec, "alert", t, 0);
  const runners = P(spec, "runners", t, 0);
  const g = useSvgId("bd");
  const pulse = (Math.sin(frame * 0.5) + 1) / 2;
  return (
    <>
      <Plate depth={0.15}>
        <rect x={-240} y={-240} width={2400} height={1560} fill="#0d1030" />
        {/* window: night street with lamps */}
        <rect x={1080} y={150} width={600} height={520} fill="#1a2058" />
        {Array.from({ length: 9 }, (_, i) => {
          const h = 120 + R(`bdw${i}`) * 260;
          return <rect key={i} x={1060 + i * 72} y={670 - h} width={64} height={h} fill="#0f1236" />;
        })}
        {Array.from({ length: 40 }, (_, i) => R(`bdl${i}`) > 0.55 ? <rect key={i} x={1070 + (i % 9) * 72 + 14} y={420 + Math.floor(i / 9) * 50} width={12} height={16} fill="#ffd27a" opacity={0.7} /> : null)}
        <Glow cx={1260} cy={600} rx={120} ry={80} color="#ffe2a0" a={0.45} />
        {runners > 0 ? <HordeLine y={660} frame={frame * 3} n={Math.round(1 + 5 * runners)} scale={0.38} color="#05060f" seed="bdr" x0={1100 + ((frame * 6) % 500)} x1={1500 + ((frame * 6) % 500)} /> : null}
      </Plate>
      <Plate depth={0.4}>
        <defs>
          <radialGradient id={`${g}p`} cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#9fd8ff" stopOpacity="0.7" /><stop offset="1" stopColor="#9fd8ff" stopOpacity="0" /></radialGradient>
        </defs>
        {/* wall with window frame, curtains */}
        <path d="M-240 -240 H2160 V1320 H-240 Z M1080 150 V670 H1680 V150 Z" fill="#161a40" fillRule="evenodd" />
        <rect x={1068} y={138} width={624} height={544} fill="none" stroke="#2a2f66" strokeWidth={24} />
        <line x1={1380} y1={150} x2={1380} y2={670} stroke="#2a2f66" strokeWidth={14} />
        <path d={`M1000 120 C ${1060 + Math.sin(frame * 0.03) * 6} 400, 1020 600, 1070 720 L 960 720 L 960 120 Z`} fill="#25295e" />
        <path d={`M1760 120 C ${1700 + Math.sin(frame * 0.03 + 1) * 6} 400, 1740 600, 1690 720 L 1800 720 L 1800 120 Z`} fill="#25295e" />
        {/* bed edge, pillow, desk with books */}
        <path d="M-240 820 C 200 790, 700 800, 1000 840 L 1000 1320 L -240 1320 Z" fill="#2c3170" />
        <path d="M-240 820 C 200 790, 700 800, 1000 840" stroke="#4a52a8" strokeWidth={6} fill="none" />
        <path d="M60 770 C 120 712, 420 712, 480 770 C 470 806, 80 814, 60 770 Z" fill="#3f4690" />
        <rect x={1200} y={760} width={720} height={30} fill="#30285a" />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={1740 + i * 34} y={650} width={28} height={110} fill={["#5a3a7a", "#3a5a8a", "#7a3a4a", "#4a6a5a"][i]} />)}
        {/* phone glow pool on the bed */}
        <ellipse cx={560} cy={880} rx={420} ry={180} fill={`url(#${g}p)`} opacity={glow * (alert > 0 ? 0.7 + 0.3 * pulse : 0.8)} />
      </Plate>
      {alert > 0 ? (
        <Plate depth={0}><rect x={-240} y={-240} width={2400} height={1560} fill="#ff1e3c" opacity={alert * 0.12 * pulse} style={{ mixBlendMode: "screen" }} /></Plate>
      ) : null}
    </>
  );
};

/* ───────────────────────── 6. Power-grid control room ───────────────────────── */
export const ZControl: React.FC<EnvProps> = ({ spec, t }) => {
  const frame = useFrame(t);
  const dark = P(spec, "dark", t, 0); // 0 normal (green) → 0.5 alarms (red) → 1 dead
  const g = useSvgId("cr");
  const red = Math.min(1, dark * 2);
  const off = Math.max(0, dark * 2 - 1);
  const blink = Math.floor(frame / 10) % 2;
  return (
    <>
      <Plate depth={0.3}>
        <defs>
          <linearGradient id={`${g}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mix("#0f3a3a", "#3a0c14", red)} /><stop offset="1" stopColor={mix("#062020", "#1c0408", red)} /></linearGradient>
        </defs>
        <rect x={-240} y={-240} width={2400} height={1560} fill="#0b0f22" />
        {/* video wall: grid map of the city's districts */}
        <rect x={160} y={110} width={1600} height={560} fill={`url(#${g}s)`} stroke="#2a3050" strokeWidth={12} />
        {Array.from({ length: 4 * 8 }, (_, i) => {
          const cx = i % 8, cy = Math.floor(i / 8);
          const k = R(`crd${i}`);
          const failed = dark > k * 0.9 + 0.05;
          const dead = off > k;
          const c = dead ? "#120608" : failed ? (blink ? "#ff3b4a" : "#9a1c28") : "#3affb0";
          return <rect key={i} x={190 + cx * 196} y={140 + cy * 128} width={176} height={108} fill={c} opacity={dead ? 1 : 0.25 + (failed ? 0.5 : 0.15)} stroke={dead ? "#1a0a0e" : c} strokeWidth={2} />;
        })}
        {/* grid lines like a network diagram */}
        {Array.from({ length: 10 }, (_, i) => (
          <path key={i} d={`M${200 + R(`crl${i}`) * 1500} ${140 + R(`crm${i}`) * 500} L ${200 + R(`crn${i}`) * 1500} ${140 + R(`cro${i}`) * 500}`} stroke={red > 0.5 ? "#ff8a8a" : "#9affd8"} strokeWidth={3} opacity={0.5 * (1 - off)} />
        ))}
        <text x={960} y={100} textAnchor="middle" fontSize={34} fontWeight={800} fill={red > 0.4 ? "#ff6a7a" : "#8affd0"} fontFamily="Arial" letterSpacing={6} opacity={1 - off}>{red > 0.4 ? "GRID FAILURE" : "GRID STATUS: NORMAL"}</text>
      </Plate>
      <Plate depth={0.75}>
        {/* consoles + empty chairs */}
        <path d="M-240 820 L 2160 820 L 2160 1320 L -240 1320 Z" fill="#141a34" />
        <path d="M-240 760 L 2160 760 L 2160 840 L -240 840 Z" fill="#232a52" />
        {Array.from({ length: 6 }, (_, i) => (
          <g key={i} transform={`translate(${60 + i * 340} 700)`}>
            <path d="M0 0 L 220 0 L 230 60 L -10 60 Z" fill="#1b2142" />
            <rect x={20} y={-110} width={180} height={110} rx={6} fill="#0a0d1e" stroke="#2c3360" strokeWidth={6} />
            <rect x={30} y={-100} width={160} height={90} fill={off > R(`crc${i}`) ? "#05060c" : red > 0.5 ? "#7a1420" : "#145a4a"} />
            {off <= R(`crc${i}`) ? <path d={`M40 -40 ${Array.from({ length: 8 }, (_, k) => `L ${40 + k * 20} ${-40 - Math.sin(frame * 0.2 + k + i) * 20 * (1 - red)}`).join(" ")}`} stroke={red > 0.5 ? "#ff8a8a" : "#7affd0"} strokeWidth={3} fill="none" /> : null}
            {/* chair, turned away, empty */}
            <g transform={`translate(110 210) rotate(${(R(`crr${i}`) - 0.5) * 30})`}>
              <path d="M-60 -120 C -60 -170, 60 -170, 60 -120 L 50 0 L -50 0 Z" fill="#2b2f58" />
              <rect x={-70} y={0} width={140} height={26} rx={10} fill="#353a6a" />
            </g>
          </g>
        ))}
      </Plate>
      <Plate depth={0}><rect x={-240} y={-240} width={2400} height={1560} fill="#000" opacity={off * 0.55} /></Plate>
    </>
  );
};

/* ───────────────────────── 7. Skyline at night: blackout district by district ───────────────────────── */
export const ZSkyline: React.FC<EnvProps> = ({ spec, t }) => {
  const frame = useFrame(t);
  const time = tod(spec);
  const lights = P(spec, "lights", t, 1);
  const smoke = P(spec, "smoke", t, 0);
  const helis = P(spec, "helis", t, 0);
  const fire = P(spec, "fire", t, 0);
  const base = 860;
  const layers = [
    { k: "a", base: base - 80, minH: 120, maxH: 380, col: "#22265e", win: 0.22, w: [60, 120] },
    { k: "b", base: base, minH: 150, maxH: 520, col: "#151842", win: 0.3, w: [80, 170] },
    { k: "c", base: base + 140, minH: 220, maxH: 600, col: "#0b0d2a", win: 0.34, w: [110, 220] },
  ];
  return (
    <>
      <SkyPlate time={time === "day" ? "night" : time} frame={frame} tint={0.2 + smoke * 0.3} />
      {layers.map((l, li) => (
        <Plate key={l.k} depth={0.12 + li * 0.15}>
          {(() => {
            const out: React.ReactNode[] = [];
            let x = -260, i = 0;
            while (x < 2200) {
              const w = l.w[0] + R(`${l.k}w${i}`) * (l.w[1] - l.w[0]);
              const h = l.minH + Math.pow(R(`${l.k}h${i}`), 1.5) * (l.maxH - l.minH);
              const top = l.base - h;
              const district = (x + 260) / 2460; // blackout rolls across the city left → right with noise
              const on = lights > 0.15 + 0.7 * (district * 0.6 + R(`${l.k}d${i}`) * 0.4) - 0.15;
              const cols = Math.floor(w / 20), rows = Math.floor(h / 26);
              out.push(<rect key={`b${i}`} x={x} y={top} width={w} height={h + 500} fill={l.col} />);
              if (R(`${l.k}an${i}`) > 0.75) out.push(<rect key={`an${i}`} x={x + w / 2 - 2} y={top - 50} width={4} height={50} fill={l.col} />);
              if (on) {
                for (let k = 0; k < rows * cols; k++) {
                  if (R(`${l.k}${i}w${k}`) > l.win) continue;
                  out.push(<rect key={`w${i}-${k}`} x={x + 6 + (k % cols) * 20} y={top + 10 + Math.floor(k / cols) * 26} width={9} height={13} fill="#ffd98a" opacity={0.5 + R(`${l.k}${i}o${k}`) * 0.5} />);
                }
              }
              x += w + 4;
              i++;
            }
            return out;
          })()}
          {li === 0 && smoke > 0 ? [[250, 0], [900, 1], [1550, 2]].map(([sx, j]) => <Smoke key={j} x={sx} base={l.base - 120} h={300 + 400 * smoke} frame={frame} seed={`sk${j}`} w={80} glow={fire} color="#120f1e" />) : null}
        </Plate>
      ))}
      {helis > 0 ? (
        <Plate depth={0.5}>
          {[0, 1].slice(0, helis > 0.5 ? 2 : 1).map((h) => {
            const hx = ((frame * (2.2 + h) + h * 900) % 2600) - 340;
            const hy = 260 + h * 120 + Math.sin(frame * 0.05 + h) * 10;
            const ang = Math.sin(frame * 0.03 + h * 2) * 18;
            return (
              <g key={h}>
                <path d={`M${hx} ${hy} L ${hx - 160 + ang * 8} 1300 L ${hx + 160 + ang * 8} 1300 Z`} fill="#eaf4ff" opacity={0.13} />
                <g transform={`translate(${hx} ${hy})`}>
                  <path d="M-46 0 C -46 -22, 30 -24, 44 -6 L 44 8 L -40 10 Z" fill="#070816" />
                  <path d="M40 -4 L 110 -10 L 112 -2 L 44 4 Z" fill="#070816" />
                  <line x1={-80 + Math.sin(frame * 1.7) * 20} y1={-26} x2={80 - Math.sin(frame * 1.7) * 20} y2={-26} stroke="#070816" strokeWidth={4} />
                  <circle cx={0} cy={12} r={4} fill={Math.floor(frame / 6) % 2 ? "#ff3a4a" : "#300"} />
                </g>
              </g>
            );
          })}
        </Plate>
      ) : null}
    </>
  );
};

/* ───────────────────────── 8. Rooftop survival camp ───────────────────────── */
export const ZCamp: React.FC<EnvProps> = ({ spec, t }) => {
  const frame = useFrame(t);
  const time = tod(spec);
  const water = P(spec, "water", t, 0.5);
  const smoke = P(spec, "smoke", t, 0.5);
  const lights = P(spec, "lights", t, 0.3);
  return (
    <>
      <SkyPlate time={time} frame={frame} tint={0.3} />
      <Plate depth={0.22}>
        {Array.from({ length: 20 }, (_, i) => {
          const h = 140 + R(`cph${i}`) * 300;
          const x = -200 + i * 120;
          const on = lights > R(`cpl${i}`);
          return (
            <g key={i}>
              <rect x={x} y={760 - h} width={110} height={h + 100} fill={time === "night" ? "#151842" : time === "sunset" ? "#5a2f5e" : "#7c90bf"} />
              {on && time !== "day" ? Array.from({ length: 6 }, (_, k) => <rect key={k} x={x + 14 + (k % 3) * 32} y={780 - h + Math.floor(k / 3) * 40} width={12} height={16} fill="#ffd27a" opacity={0.7} />) : null}
            </g>
          );
        })}
        {smoke > 0 ? [[400, 0], [1400, 1]].map(([x, j]) => <Smoke key={j} x={x} base={640} h={300 + 300 * smoke} frame={frame} seed={`cps${j}`} w={70} color={time === "day" ? "#5a5560" : "#1c1828"} />) : null}
      </Plate>
      <Layer depth={0.6}>
        <AbsoluteFill style={{ transform: "scale(1.08)" }}><RooftopFence y={960} night={time === "night"} day={time === "day"} /></AbsoluteFill>
      </Layer>
      <Plate depth={0.85}>
        {/* stairwell hut with the door wedged by a desk */}
        <g transform="translate(1500 940)">
          <path d="M-260 0 L -260 -470 L 260 -470 L 260 0 Z" fill="#8b8fa8" />
          <path d="M-280 -470 L 280 -470 L 280 -500 L -280 -500 Z" fill="#6c7088" />
          <rect x={-90} y={-330} width={180} height={330} fill="#4a5070" stroke={LINE} strokeWidth={4} />
          <circle cx={60} cy={-160} r={9} fill="#d8d8e0" />
          <g transform="translate(-10 -10) rotate(-8)">
            <path d="M-170 -150 L 150 -150 L 170 -120 L -150 -120 Z" fill="#d4a373" stroke={LINE} strokeWidth={3} />
            <rect x={-150} y={-120} width={14} height={120} fill="#5d6175" />
            <rect x={140} y={-120} width={14} height={120} fill="#5d6175" />
          </g>
          <text x={0} y={-400} textAnchor="middle" fontSize={34} fill="#d8dbe6" fontWeight={700} fontFamily="Arial">STAIRS</text>
        </g>
        {/* blue tarp shelter */}
        <path d={`M80 950 L 360 ${700 + Math.sin(frame * 0.06) * 6} L 700 950 Z`} fill="#3a6ad0" stroke={LINE} strokeWidth={4} />
        <path d={`M360 ${700 + Math.sin(frame * 0.06) * 6} L 700 950 L 620 950 Z`} fill="#28509f" />
        <path d="M150 960 C 250 930, 520 930, 640 960 L 640 990 L 150 990 Z" fill="#7a5a8a" />
        {/* rain buckets with water level */}
        {[[860, 1000], [990, 1010], [1110, 995]].map(([bx, by], i) => (
          <g key={i} transform={`translate(${bx} ${by})`}>
            <path d="M-50 -100 L 50 -100 L 40 0 L -40 0 Z" fill={["#e8c14a", "#d84a5a", "#5aa8e8"][i]} stroke={LINE} strokeWidth={4} />
            <ellipse cx={0} cy={-100} rx={50} ry={12} fill="#1d2b4a" />
            <ellipse cx={0} cy={-100 + (1 - water) * 10} rx={46 * (0.9 + 0.1 * water)} ry={10} fill="#9fd0ff" opacity={0.85 * Math.min(1, water * 1.5)} />
            <path d="M-50 -100 C -50 -150, 50 -150, 50 -100" stroke="#3a3a48" strokeWidth={4} fill="none" />
          </g>
        ))}
      </Plate>
    </>
  );
};

/* ───────────────────────── 9. Floodlit shelter gate ───────────────────────── */
export const ZShelter: React.FC<EnvProps> = ({ spec, t }) => {
  const frame = useFrame(t);
  const crowd = P(spec, "crowd", t, 0.8);
  const heli = P(spec, "heli", t, 1);
  const time = tod(spec);
  return (
    <>
      <SkyPlate time={time === "day" ? "night" : time} frame={frame} tint={0.3} />
      <Plate depth={0.3}>
        <path d="M-240 760 L 2160 760 L 2160 1320 L -240 1320 Z" fill="#1d1f34" />
        {/* tents behind the fence */}
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i} transform={`translate(${-80 + i * 250} 740)`}>
            <path d="M-100 0 L 0 -110 L 100 0 Z" fill={i % 2 ? "#3e5a3a" : "#4a6646"} />
            <path d="M0 -110 L 20 0 L -20 0 Z" fill="#1a2418" />
          </g>
        ))}
        {/* floodlight towers */}
        {[260, 1660].map((x, i) => (
          <g key={i}>
            <path d={`M${x} 760 L ${x - 10} 260 L ${x + 10} 260 Z`} fill="#0a0b18" />
            <rect x={x - 40} y={230} width={80} height={36} fill="#0a0b18" />
            <rect x={x - 32} y={236} width={64} height={22} fill="#fffbe0" />
            <path d={`M${x} 250 L ${x + (i ? -700 : 700)} 1320 L ${x + (i ? -200 : 200)} 1320 Z`} fill="#fff6d0" opacity={0.12} />
          </g>
        ))}
        {/* fence + sandbags + gate */}
        <rect x={-240} y={600} width={2400} height={200} fill="none" />
        {Array.from({ length: 30 }, (_, i) => <rect key={i} x={-240 + i * 84} y={560} width={6} height={250} fill="#3a3d5a" />)}
        <rect x={-240} y={560} width={2400} height={250} fill="#5a6088" opacity={0.18} />
        {Array.from({ length: 22 }, (_, i) => <ellipse key={i} cx={-200 + i * 110} cy={815} rx={60} ry={24} fill="#7a6a4a" stroke={LINE} strokeWidth={2} />)}
        <rect x={820} y={560} width={280} height={260} fill="#121424" stroke="#3a3d5a" strokeWidth={10} />
        <text x={960} y={540} textAnchor="middle" fontSize={40} fontWeight={800} fill="#ffe28a" fontFamily="Arial" letterSpacing={4}>SHELTER 7</text>
        {/* crowd waiting at the gate */}
        {crowd > 0 ? <HordeLine y={900} frame={Math.round(frame * 0.3)} n={Math.round(8 + 24 * crowd)} scale={0.6} color="#0a0b16" seed="shc" x0={300} x1={1620} /> : null}
      </Plate>
      {heli > 0 ? (
        <Plate depth={0.5}>
          {(() => {
            const hx = 1200 + Math.sin(frame * 0.01) * 200, hy = 200;
            return (
              <g>
                <path d={`M${hx} ${hy} L ${hx - 260} 1300 L ${hx + 120} 1300 Z`} fill="#eaf4ff" opacity={0.12 * heli} />
                <g transform={`translate(${hx} ${hy}) scale(1.6)`}>
                  <path d="M-46 0 C -46 -22, 30 -24, 44 -6 L 44 8 L -40 10 Z" fill="#070816" />
                  <path d="M40 -4 L 110 -10 L 112 -2 L 44 4 Z" fill="#070816" />
                  <line x1={-80 + Math.sin(frame * 1.7) * 20} y1={-26} x2={80 - Math.sin(frame * 1.7) * 20} y2={-26} stroke="#070816" strokeWidth={4} />
                  <circle cx={0} cy={12} r={4} fill={Math.floor(frame / 6) % 2 ? "#ff3a4a" : "#300"} />
                </g>
              </g>
            );
          })()}
        </Plate>
      ) : null}
    </>
  );
};

/* ───────────────────────── 10. Empty highway north at dawn ───────────────────────── */
export const ZHighway: React.FC<EnvProps> = ({ spec, t }) => {
  const frame = useFrame(t);
  const time = tod(spec);
  const figures = P(spec, "figures", t, 0.6);
  const mist = P(spec, "mist", t, 0.6);
  const g = useSvgId("hw");
  const hz = 620, vx = 1000;
  const warm = time === "day" ? "#d9e6ff" : "#ffcf9a";
  return (
    <>
      <SkyPlate time={time === "night" ? "dawn" : time} frame={frame} />
      <Plate depth={0.15}>
        <path d={`M-240 ${hz} C 200 480, 520 470, 900 560 C 1250 470, 1650 430, 2160 540 L 2160 ${hz + 40} L -240 ${hz + 40} Z`} fill={time === "day" ? "#7a9ac8" : "#8a6a9a"} />
        {/* radio tower, blinking */}
        <g transform="translate(1560 500)">
          <path d="M-22 40 L 0 -260 L 22 40 Z" fill="none" stroke="#3a2a4a" strokeWidth={5} />
          {Array.from({ length: 8 }, (_, i) => <line key={i} x1={-20 + i * 2.5} y1={30 - i * 36} x2={20 - i * 2.5} y2={12 - i * 36} stroke="#3a2a4a" strokeWidth={3} />)}
          <circle cx={0} cy={-262} r={7} fill="#ff3a4a" opacity={Math.floor(frame / 20) % 2 ? 1 : 0.2} />
          <circle cx={0} cy={-262} r={22} fill="#ff3a4a" opacity={Math.floor(frame / 20) % 2 ? 0.3 : 0} />
        </g>
      </Plate>
      <Plate depth={0.45}>
        <defs>
          <linearGradient id={`${g}f`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={time === "day" ? "#8aa860" : "#7a6a58"} /><stop offset="1" stopColor={time === "day" ? "#4a6a38" : "#3a3240"} /></linearGradient>
          <linearGradient id={`${g}m`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={warm} stopOpacity="0" /><stop offset="0.5" stopColor={warm} stopOpacity="0.6" /><stop offset="1" stopColor={warm} stopOpacity="0" /></linearGradient>
        </defs>
        <rect x={-240} y={hz} width={2400} height={720} fill={`url(#${g}f)`} />
        {/* road */}
        <path d={`M100 1320 L ${vx - 30} ${hz} L ${vx + 30} ${hz} L 1900 1320 Z`} fill="#4a4558" />
        {Array.from({ length: 8 }, (_, i) => {
          const k1 = Math.pow(i / 8, 2), k2 = Math.pow((i + 0.45) / 8, 2);
          return <path key={i} d={`M${vx - 3 - 8 * k1} ${hz + (1320 - hz) * k1} L ${vx + 3 + 8 * k1} ${hz + (1320 - hz) * k1} L ${vx + 3 + 14 * k2} ${hz + (1320 - hz) * k2} L ${vx - 3 - 14 * k2} ${hz + (1320 - hz) * k2} Z`} fill="#f0e6c0" opacity={0.75} />;
        })}
        <path d={`M100 1320 L ${vx - 30} ${hz}`} stroke="#c8c2d0" strokeWidth={10} />
        <path d={`M1900 1320 L ${vx + 30} ${hz}`} stroke="#c8c2d0" strokeWidth={10} />
        {/* road sign NORTH */}
        <g transform="translate(1480 700)">
          <rect x={-6} y={0} width={12} height={160} fill="#3a3a48" />
          <rect x={-120} y={-80} width={240} height={90} rx={8} fill="#2a7a4a" stroke="#e8f0e8" strokeWidth={5} />
          <text x={0} y={-22} textAnchor="middle" fontSize={44} fontWeight={800} fill="#ffffff" fontFamily="Arial">NORTH ↑</text>
        </g>
        {/* still figures slumped in the fields */}
        {figures > 0 ? Array.from({ length: Math.round(14 * figures) }, (_, i) => {
          const sd = i % 2 ? 1 : -1;
          const k = R(`hwk${i}`);
          const y = hz + 30 + k * 360;
          const x = vx + sd * (240 + k * 900 + R(`hwx${i}`) * 300);
          const s = 0.25 + k * 0.6;
          const down = R(`hwd${i}`) > 0.4;
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${s})`} opacity={0.85}>
              {down ? <path d="M-60 0 C -50 -26, 40 -30, 60 -10 L 64 0 Z M64 -14 a 16 14 0 1 0 1 0" fill="#2a2234" /> : (
                <g transform={`rotate(${12 + Math.sin(frame * 0.01 + i) * 2})`}>
                  <path d="M-14 0 L -8 -70 L 8 -70 L 14 0 Z" fill="#2a2234" />
                  <path d="M-20 -70 C -22 -110, -16 -132, 0 -134 C 16 -132, 22 -110, 20 -70 Z" fill="#2a2234" />
                  <circle cx={8} cy={-146} r={17} fill="#2a2234" />
                </g>
              )}
            </g>
          );
        }) : null}
        {/* abandoned car on the shoulder */}
        <Car x={640} y={980} s={0.7} body="#8a9ab0" door />
      </Plate>
      {mist > 0 ? (
        <Plate depth={0.3}>
          <rect x={-240} y={hz - 120} width={2400} height={360} fill={`url(#${g}m)`} opacity={mist} />
        </Plate>
      ) : null}
    </>
  );
};

export const OUTBREAK_ENVS = {
  "z-hospital": { component: ZHospital, ownWeather: true, groundY: GY, description: 'ANIME z5: hospital ER corridor at night, fluorescent lights, EMERGENCY doors, empty gurney. props (animatable): { "flicker": 0..1, "alarm": 0..1 }' },
  "z-street": { component: ZStreet, groundY: GY, description: 'ANIME z5: city street with shop signs, perspective road. Follows time. props (animatable): { "cars", "smoke", "fire", "horde", "police", "lights": 0..1 }' },
  "z-bridge": { component: ZBridge, groundY: GY, description: 'ANIME z5: suspension bridge jammed with cars, brake lights, smoke over the city. props: { "jam", "smoke": 0..1 }' },
  "z-market": { component: ZMarket, ownWeather: true, groundY: GY, description: 'ANIME z5: looted supermarket aisle, spilled goods. props (animatable): { "stock": 0..1, "flicker", "dark": 0..1 }' },
  "z-bedroom": { component: ZBedroom, ownWeather: true, groundY: GY, description: 'ANIME z5: dark bedroom lit by a phone, window on the night street. props (animatable): { "glow", "alert", "runners": 0..1 }' },
  "z-control": { component: ZControl, ownWeather: true, groundY: GY, description: 'ANIME z5: power-grid control room, district wall, empty chairs. props (animatable): { "dark": 0 normal → 0.5 red alarms → 1 dead }' },
  "z-skyline": { component: ZSkyline, groundY: GY, description: 'ANIME z5: night skyline; windows go dark district by district. props (animatable): { "lights": 1→0, "smoke", "fire", "helis": 0..1 }' },
  "z-camp": { component: ZCamp, groundY: GY, description: 'ANIME z5: school-roof survival camp: wedged stairwell door, tarp, rain buckets. Follows time. props (animatable): { "water", "smoke", "lights": 0..1 }' },
  "z-shelter": { component: ZShelter, groundY: GY, description: 'ANIME z5: floodlit shelter gate with tents, sandbags, crowd and helicopter. props (animatable): { "crowd", "heli": 0..1 }' },
  "z-highway": { component: ZHighway, groundY: GY, description: 'ANIME z5: empty highway north at dawn, radio tower, still figures in the fields. props (animatable): { "figures", "mist": 0..1 }' },
};
