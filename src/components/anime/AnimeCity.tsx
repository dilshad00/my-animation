/**
 * Anime city backdrops: layered skyline silhouettes with lit windows (parallax-ready)
 * and the classic school-rooftop foreground (chain-link fence, rail, concrete floor).
 */
import React from "react";
import { random } from "remotion";

type Layer = { seed: string; base: number; minH: number; maxH: number; color: string; window: string; windowChance: number; w: [number, number] };

const buildings = (l: Layer) => {
  const out: { x: number; w: number; h: number; antenna: boolean; i: number }[] = [];
  let x = -200;
  let i = 0;
  while (x < 2400) {
    const w = l.w[0] + random(`${l.seed}w${i}`) * (l.w[1] - l.w[0]);
    const h = l.minH + random(`${l.seed}h${i}`) ** 1.6 * (l.maxH - l.minH);
    out.push({ x, w, h, antenna: random(`${l.seed}a${i}`) > 0.8, i });
    x += w + 4;
    i++;
  }
  return out;
};

const SkylineLayer: React.FC<{ layer: Layer; offset: number; frame: number; blink?: boolean }> = ({ layer, offset, frame, blink }) => (
  <g transform={`translate(${offset} 0)`}>
    {buildings(layer).map((b) => {
      const top = layer.base - b.h;
      const cols = Math.floor(b.w / 18);
      const rows = Math.floor(b.h / 22);
      return (
        <g key={b.i}>
          <rect x={b.x} y={top} width={b.w} height={b.h + 400} fill={layer.color} />
          {b.antenna && <rect x={b.x + b.w / 2 - 2} y={top - 50} width={4} height={50} fill={layer.color} />}
          {b.antenna && blink && <circle cx={b.x + b.w / 2} cy={top - 52} r={5} fill="#ff4a5a" opacity={Math.floor(frame / 20 + b.i) % 2 ? 1 : 0.15} />}
          {Array.from({ length: rows * cols }, (_, k) => {
            const c = k % cols;
            const r = Math.floor(k / cols);
            if (random(`${layer.seed}${b.i}win${k}`) > layer.windowChance) return null;
            return <rect key={k} x={b.x + 6 + c * 18} y={top + 10 + r * 22} width={9} height={12} fill={layer.window} opacity={0.55 + random(`${layer.seed}${b.i}o${k}`) * 0.45} />;
          })}
        </g>
      );
    })}
  </g>
);

export const AnimeSkyline: React.FC<{ frame: number; pan?: number; night?: boolean; day?: boolean; horizon?: number }> = ({ frame, pan = 0, night = false, day = false, horizon = 860 }) => {
  const layers: Layer[] = day
    ? [
        { seed: "far", base: horizon, minH: 60, maxH: 260, color: "#a9c4ec", window: "#e9f3ff", windowChance: 0.1, w: [50, 110] },
        { seed: "mid", base: horizon + 70, minH: 80, maxH: 330, color: "#7f9fd6", window: "#d6e8ff", windowChance: 0.18, w: [70, 150] },
        { seed: "near", base: horizon + 160, minH: 120, maxH: 420, color: "#5873b4", window: "#c4dcff", windowChance: 0.25, w: [100, 200] },
      ]
    : night
    ? [
        { seed: "far", base: horizon, minH: 60, maxH: 260, color: "#2a2a6e", window: "#ffd98a", windowChance: 0.18, w: [50, 110] },
        { seed: "mid", base: horizon + 70, minH: 80, maxH: 330, color: "#1a1a4a", window: "#ffe7a3", windowChance: 0.3, w: [70, 150] },
        { seed: "near", base: horizon + 160, minH: 120, maxH: 420, color: "#0e0f2e", window: "#ffd27a", windowChance: 0.35, w: [100, 200] },
      ]
    : [
        { seed: "far", base: horizon, minH: 60, maxH: 260, color: "#b5578f", window: "#ffd7a0", windowChance: 0.08, w: [50, 110] },
        { seed: "mid", base: horizon + 70, minH: 80, maxH: 330, color: "#7a3a80", window: "#ffc785", windowChance: 0.15, w: [70, 150] },
        { seed: "near", base: horizon + 160, minH: 120, maxH: 420, color: "#40275e", window: "#ffbf73", windowChance: 0.22, w: [100, 200] },
      ];
  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id={`haze-${night}-${day}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={day ? "#e6f1ff" : night ? "#6a5bb5" : "#ffb37a"} stopOpacity="0" />
          <stop offset="1" stopColor={day ? "#e6f1ff" : night ? "#6a5bb5" : "#ffb37a"} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {layers.map((l, i) => (
        <g key={l.seed}>
          <SkylineLayer layer={l} offset={pan * (0.3 + i * 0.35)} frame={frame} blink={i === 1} />
          {i < 2 && <rect x={0} y={l.base - 300} width={1920} height={500} fill={`url(#haze-${night}-${day})`} />}
        </g>
      ))}
    </svg>
  );
};

/** School rooftop: fence across the frame + rail + floor. `light` tints the rim (sunset/night). */
export const RooftopFence: React.FC<{ y?: number; night?: boolean; day?: boolean; pan?: number }> = ({ y = 640, night = false, day = false, pan = 0 }) => {
  const frameCol = day ? "#3d4a78" : night ? "#1d1f45" : "#3b2450";
  const rim = day ? "#ffffff" : night ? "#8fa6ff" : "#ffb47a";
  const mesh = day ? "#8ea6d6" : night ? "#5560a8" : "#c98aa8";
  const posts = Array.from({ length: 9 }, (_, i) => i * 300 - 200 + (pan % 300));
  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <pattern id={`mesh-${night}-${day}`} width="34" height="34" patternUnits="userSpaceOnUse" patternTransform={`translate(${pan} 0) rotate(45)`}>
          <path d="M0 0 L34 0 M0 0 L0 34" stroke={mesh} strokeWidth="2.2" opacity="0.55" />
        </pattern>
        <linearGradient id={`floor-${night}-${day}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={day ? "#a7b3cf" : night ? "#2b2d5c" : "#8b5a7a"} />
          <stop offset="1" stopColor={day ? "#5f6a8c" : night ? "#0d0e26" : "#3a2346"} />
        </linearGradient>
      </defs>
      <rect x={0} y={y - 360} width={1920} height={360 + 70} fill={`url(#mesh-${night}-${day})`} />
      <rect x={0} y={y - 372} width={1920} height={14} fill={frameCol} />
      <rect x={0} y={y - 372} width={1920} height={4} fill={rim} opacity={0.8} />
      {posts.map((px, i) => (
        <g key={i}>
          <rect x={px} y={y - 372} width={16} height={450} fill={frameCol} />
          <rect x={px + 12} y={y - 372} width={4} height={450} fill={rim} opacity={0.7} />
        </g>
      ))}
      <rect x={0} y={y + 60} width={1920} height={1080 - y} fill={`url(#floor-${night}-${day})`} />
      <rect x={0} y={y + 60} width={1920} height={6} fill={rim} opacity={0.55} />
      {/* floor tile seams in perspective */}
      {Array.from({ length: 13 }, (_, i) => (
        <line key={i} x1={960 + (i - 6) * 170} y1={y + 66} x2={960 + (i - 6) * 520} y2={1080} stroke="#000" strokeOpacity="0.15" strokeWidth="3" />
      ))}
    </svg>
  );
};
