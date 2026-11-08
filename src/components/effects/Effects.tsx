import React from "react";
import { ATMOSPHERE } from "./Atmosphere";
import { DIVINE } from "./Divine";
import { emit, r } from "./emit";
import { mix, withAlpha } from "../../utils/color";
import { useScene } from "../../scenes/context";
import type { EffectElementT } from "../../utils/schema";
import { useSvgId } from "../../utils/svg";

export type EffectProps = {
  el: EffectElementT;
  /** seconds since the effect appeared */
  local: number;
  w: number;
  h: number;
  intensity: number;
  seed: string;
  color?: string;
};


const Fire: React.FC<EffectProps> = ({ local, w, h, intensity, seed }) => {
  const glow = useSvgId("fg");
  const n = Math.round(28 * intensity);
  const flick = 1 + Math.sin(local * 17) * 0.05 + Math.sin(local * 29) * 0.04;
  /** one flame tongue: a teardrop whose tip sways */
  const tongue = (xOff: number, scale: number, phase: number, fill: string) => {
    const sway = Math.sin(local * 7 + phase) * w * 0.12 + Math.sin(local * 13 + phase * 2) * w * 0.05;
    const hh = h * scale * (0.92 + 0.08 * Math.sin(local * 11 + phase));
    const ww = w * 0.36 * scale;
    return (
      <path
        d={`M${xOff - ww},0 C${xOff - ww * 1.1},${-hh * 0.45} ${xOff + sway - ww * 0.3},${-hh * 0.7} ${xOff + sway},${-hh}
          C${xOff + sway + ww * 0.3},${-hh * 0.7} ${xOff + ww * 1.1},${-hh * 0.45} ${xOff + ww},0 Q${xOff},${ww * 0.35} ${xOff - ww},0 Z`}
        fill={fill}
      />
    );
  };
  return (
    <g>
      <defs>
        <radialGradient id={glow}>
          <stop offset="0" stopColor="#ffb703" stopOpacity={0.5} />
          <stop offset="1" stopColor="#ff5400" stopOpacity={0} />
        </radialGradient>
      </defs>
      <ellipse cx={0} cy={-h * 0.3} rx={w * 1.2 * flick} ry={h * 0.75 * flick} fill={`url(#${glow})`} />
      {tongue(-w * 0.2, 0.62, 1.3, "#e85d04")}
      {tongue(w * 0.22, 0.55, 2.7, "#e85d04")}
      {tongue(0, 0.85, 0, "#f48c06")}
      {tongue(-w * 0.08, 0.58, 4.1, "#ffba08")}
      {tongue(w * 0.06, 0.4, 5.2, "#fff3b0")}
      {emit(n, 1.1, local, seed, (i, age, k, gen) => {
        const x0 = (r(seed, `x${i}${gen}`) - 0.5) * w * 0.7;
        const x = x0 * (1 - k * 0.5) + Math.sin(age * 9 + i) * w * 0.08;
        const y = -h * 0.35 - k * h * 0.9;
        const size = 3 + r(seed, `s${i}`) * 5;
        const c = k < 0.4 ? "#ffd166" : mix("#ff7b00", "#d00000", (k - 0.4) / 0.6);
        return <circle cx={x} cy={y} r={size * (1 - k * 0.6)} fill={c} opacity={(1 - k)} />;
      })}
    </g>
  );
};

const Smoke: React.FC<EffectProps> = ({ local, w, h, intensity, seed, color }) => {
  const c = color ?? "#9aa0a6";
  return (
    <g>
      {emit(Math.round(22 * intensity), 3.2, local, seed, (i, age, k, gen) => {
        const drift = (r(seed, `d${i}${gen}`) - 0.3) * w * 0.8;
        const x = (r(seed, `x${i}${gen}`) - 0.5) * w * 0.3 + drift * k + Math.sin(age * 1.5 + i) * 15;
        const y = -k * h;
        const size = w * 0.15 + k * w * 0.45;
        return <circle cx={x} cy={y} r={size} fill={c} opacity={0.42 * Math.sin(Math.min(1, k * 1.3) * Math.PI) * (0.6 + r(seed, `o${i}`) * 0.4)} />;
      })}
    </g>
  );
};

const Star4: React.FC<{ x: number; y: number; s: number; c: string; o: number; rot: number }> = ({ x, y, s, c, o, rot }) => (
  <path d={`M0,${-s} Q${s * 0.15},${-s * 0.15} ${s},0 Q${s * 0.15},${s * 0.15} 0,${s} Q${-s * 0.15},${s * 0.15} ${-s},0 Q${-s * 0.15},${-s * 0.15} 0,${-s} Z`} fill={c} opacity={o} transform={`translate(${x} ${y}) rotate(${rot})`} />
);

const Sparkles: React.FC<EffectProps> = ({ local, w, h, intensity, seed, color }) => (
  <g>
    {emit(Math.round(26 * intensity), 1.6, local, seed, (i, _age, k, gen) => {
      const x = (r(seed, `x${i}${gen}`) - 0.5) * w;
      const y = (r(seed, `y${i}${gen}`) - 0.5) * h;
      const s = (10 + r(seed, `s${i}`) * 22) * Math.sin(k * Math.PI);
      return <Star4 x={x} y={y} s={s} c={color ?? (i % 3 ? "#fff6c9" : "#ffd166")} o={0.95} rot={k * 90} />;
    })}
  </g>
);

const Confetti: React.FC<EffectProps> = ({ local, w, h, intensity, seed }) => {
  const cols = ["#ff006e", "#ffbe0b", "#3a86ff", "#06d6a0", "#8338ec", "#fb5607"];
  return (
    <g>
      {Array.from({ length: Math.round(90 * intensity) }).map((_, i) => {
        const vx = (r(seed, "vx" + i) - 0.5) * w * 0.9;
        const vy = -h * (0.7 + r(seed, "vy" + i) * 0.6);
        const tt = local;
        const x = vx * tt * 0.6 + Math.sin(tt * 4 + i) * 20;
        const y = vy * tt * 1.2 + 0.5 * h * 1.4 * tt * tt;
        const rot = tt * (200 + r(seed, "rot" + i) * 400);
        const flip = Math.abs(Math.cos(tt * 6 + i));
        return <rect key={i} x={x - 7} y={y - 4} width={14} height={9} fill={cols[i % cols.length]} transform={`rotate(${rot} ${x} ${y}) scale(1 ${flip})`} opacity={Math.max(0, 1 - Math.max(0, tt - 2.4))} style={{ transformBox: "fill-box", transformOrigin: "center" }} />;
      })}
    </g>
  );
};

const Bubbles: React.FC<EffectProps> = ({ local, w, h, intensity, seed }) => (
  <g>
    {emit(Math.round(24 * intensity), 3, local, seed, (i, age, k, gen) => {
      const x = (r(seed, `x${i}${gen}`) - 0.5) * w + Math.sin(age * 3 + i) * 14;
      const y = -k * h;
      const s = 5 + r(seed, `s${i}`) * 14;
      return (
        <g opacity={Math.min(1, (1 - k) * 3)}>
          <circle cx={x} cy={y} r={s} fill="#e0fbff" fillOpacity={0.15} stroke="#e0fbff" strokeWidth={2} />
          <circle cx={x - s * 0.35} cy={y - s * 0.35} r={s * 0.25} fill="#fff" opacity={0.8} />
        </g>
      );
    })}
  </g>
);

const Drift: React.FC<EffectProps & { kind: "dust" | "embers" | "fireflies" }> = ({ local, w, h, intensity, seed, kind, color }) => {
  const n = Math.round((kind === "dust" ? 50 : 34) * intensity);
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const sp = 0.2 + r(seed, "sp" + i) * 0.5;
        const x = (r(seed, "x" + i) - 0.5) * w + Math.sin(local * sp * 2 + i) * 40;
        const rise = kind === "embers" ? ((local * (40 + r(seed, "v" + i) * 80) + r(seed, "y" + i) * h) % h) : 0;
        const y = (r(seed, "y" + i) - 0.5) * h - rise + (kind !== "embers" ? Math.cos(local * sp * 1.6 + i) * 30 : h / 2);
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(local * (1 + sp * 3) + i));
        const c = color ?? (kind === "embers" ? "#ffb703" : kind === "fireflies" ? "#d9ff7a" : "#fff8e7");
        const s = kind === "dust" ? 2 + r(seed, "s" + i) * 3 : 3 + r(seed, "s" + i) * 4;
        return (
          <g key={i} opacity={tw}>
            {kind !== "dust" ? <circle cx={x} cy={y} r={s * 4} fill={c} opacity={0.2} /> : null}
            <circle cx={x} cy={y} r={s} fill={c} />
          </g>
        );
      })}
    </g>
  );
};

const Leaves: React.FC<EffectProps> = ({ local, w, h, intensity, seed }) => {
  const cols = ["#e76f51", "#f4a261", "#e9c46a", "#bc6c25"];
  return (
    <g>
      {emit(Math.round(18 * intensity), 4, local, seed, (i, age, k, gen) => {
        const x = (r(seed, `x${i}${gen}`) - 0.5) * w + Math.sin(age * 2 + i) * 60;
        const y = -h / 2 + k * h;
        return <path d="M0,-14 Q12,0 0,14 Q-12,0 0,-14 Z" fill={cols[i % 4]} transform={`translate(${x} ${y}) rotate(${age * 160 + i * 30})`} opacity={Math.min(1, (1 - k) * 4)} />;
      })}
    </g>
  );
};

const Explosion: React.FC<EffectProps> = ({ local, w, seed, intensity }) => {
  const R = w / 2;
  const k = Math.min(1, local / 1.2);
  const flash = Math.max(0, 1 - local / 0.25);
  return (
    <g>
      <circle r={R * (0.3 + k * 1.2)} fill="#fff3b0" opacity={flash * 0.9} />
      <circle r={R * (0.2 + k * 1.0)} fill="none" stroke="#ffd166" strokeWidth={30 * (1 - k)} opacity={1 - k} />
      {Array.from({ length: Math.round(16 * intensity) }).map((_, i) => {
        const a = r(seed, "a" + i) * Math.PI * 2;
        const sp = 0.6 + r(seed, "s" + i) * 0.8;
        const d = R * sp * (1 - Math.pow(1 - k, 3)) * 1.3;
        const size = R * 0.28 * (1 - k * 0.5) * (0.5 + r(seed, "z" + i));
        const c = k < 0.3 ? "#ffd166" : k < 0.6 ? "#f77f00" : "#6c757d";
        return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d - k * R * 0.4} r={size} fill={c} opacity={(1 - k) * 0.9} />;
      })}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2 + r(seed, "b" + i);
        const d = R * 1.6 * Math.min(1, local / 0.6);
        return <line key={"l" + i} x1={Math.cos(a) * d * 0.6} y1={Math.sin(a) * d * 0.6} x2={Math.cos(a) * d} y2={Math.sin(a) * d} stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={Math.max(0, 1 - local / 0.6)} />;
      })}
    </g>
  );
};

const Glow: React.FC<EffectProps> = ({ local, w, color }) => {
  const id = useSvgId("glw");
  const c = color ?? "#ffd166";
  const pulse = 0.8 + 0.2 * Math.sin(local * 3);
  return (
    <g>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={c} stopOpacity={0.75} />
          <stop offset="0.4" stopColor={c} stopOpacity={0.25} />
          <stop offset="1" stopColor={c} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={(w / 2) * pulse} fill={`url(#${id})`} style={{ mixBlendMode: "screen" }} />
    </g>
  );
};

const SpeedLines: React.FC<EffectProps> = ({ local, w, h, intensity, seed, color }) => (
  <g>
    {Array.from({ length: Math.round(22 * intensity) }).map((_, i) => {
      const sp = 1500 + r(seed, "v" + i) * 1500;
      const len = 120 + r(seed, "l" + i) * 260;
      const x = w / 2 - ((local * sp + r(seed, "x" + i) * w * 2) % (w * 1.5));
      const y = (r(seed, "y" + i) - 0.5) * h;
      return <line key={i} x1={x} y1={y} x2={x + len} y2={y} stroke={color ?? "#ffffff"} strokeWidth={2 + r(seed, "s" + i) * 4} opacity={0.5} strokeLinecap="round" />;
    })}
  </g>
);

const Lightning: React.FC<EffectProps> = ({ local, w, seed, color }) => {
  const frameSeed = Math.floor(local * 20);
  const c = color ?? "#9bf6ff";
  let d = `M${-w / 2},0`;
  const n = 12;
  for (let i = 1; i <= n; i++) {
    const x = -w / 2 + (i / n) * w;
    const y = i === n ? 0 : (r(seed, `${frameSeed}-${i}`) - 0.5) * 80;
    d += ` L${x},${y}`;
  }
  return (
    <g>
      <path d={d} stroke={c} strokeWidth={22} fill="none" opacity={0.25} strokeLinejoin="round" />
      <path d={d} stroke="#ffffff" strokeWidth={5} fill="none" strokeLinejoin="round" />
      <circle cx={-w / 2} cy={0} r={18} fill={c} opacity={0.6} />
      <circle cx={w / 2} cy={0} r={18} fill={c} opacity={0.6} />
    </g>
  );
};

const Ripple: React.FC<EffectProps> = ({ local, w, color }) => (
  <g>
    {[0, 1, 2].map((i) => {
      const k = ((local * 0.6 + i / 3) % 1);
      return <ellipse key={i} rx={(w / 2) * k} ry={(w / 2) * k * 0.35} fill="none" stroke={color ?? "#ffffff"} strokeWidth={5 * (1 - k)} opacity={1 - k} />;
    })}
  </g>
);

const Energy: React.FC<EffectProps> = ({ local, w, h, seed, color }) => {
  const c = color ?? "#4cc9f0";
  return (
    <g>
      {Array.from({ length: 5 }).map((_, i) => {
        const y = (i - 2) * (h / 6);
        const dash = (local * 400 + i * 60) % 120;
        return <line key={i} x1={-w / 2} y1={y} x2={w / 2} y2={y} stroke={c} strokeWidth={4} strokeDasharray="40 80" strokeDashoffset={-dash} opacity={0.4 + r(seed, "e" + i) * 0.5} strokeLinecap="round" />;
      })}
    </g>
  );
};

export const EFFECTS: Record<string, { component: React.FC<EffectProps>; w: number; h: number; description: string }> = {
  fire: { component: Fire, w: 200, h: 320, description: "Flickering flame, origin at its base" },
  smoke: { component: Smoke, w: 200, h: 500, description: "Rising smoke column, origin at its base" },
  sparkles: { component: Sparkles, w: 400, h: 300, description: "Twinkling stars over an area" },
  confetti: { component: Confetti, w: 600, h: 600, description: "One-shot confetti burst" },
  bubbles: { component: Bubbles, w: 300, h: 600, description: "Rising bubbles" },
  dust: { component: (p) => <Drift {...p} kind="dust" />, w: 1920, h: 1080, description: "Floating dust motes" },
  embers: { component: (p) => <Drift {...p} kind="embers" />, w: 800, h: 700, description: "Rising glowing embers" },
  fireflies: { component: (p) => <Drift {...p} kind="fireflies" />, w: 1600, h: 700, description: "Glowing fireflies" },
  leaves: { component: Leaves, w: 1600, h: 1000, description: "Falling leaves" },
  explosion: { component: Explosion, w: 500, h: 500, description: "One-shot explosion burst" },
  glow: { component: Glow, w: 500, h: 500, description: "Pulsing light glow" },
  speedlines: { component: SpeedLines, w: 1920, h: 1080, description: "Motion streaks" },
  lightning: { component: Lightning, w: 600, h: 100, description: "Electric arc between two points (width = length)" },
  ripple: { component: Ripple, w: 400, h: 140, description: "Expanding rings" },
  ...ATMOSPHERE,
  ...DIVINE,
  energy: { component: Energy, w: 600, h: 120, description: "Flowing energy lines" },
};

export const EffectView: React.FC<{ el: EffectElementT; local: number }> = ({ el, local }) => {
  const scene = useScene();
  const def = EFFECTS[el.type.toLowerCase()];
  if (!def) {
    throw new Error(`Scene "${scene.sceneId}": unknown effect "${el.type}". Available: ${Object.keys(EFFECTS).join(", ")}`);
  }
  const C = def.component;
  return <C el={el} local={local} w={el.width ?? def.w} h={el.height ?? def.h} intensity={el.intensity ?? 1} seed={`${el.type}${el.seed ?? 0}${el.id ?? ""}`} color={el.color} />;
};

export const glowOf = (c: string) => withAlpha(c, 0.3);
