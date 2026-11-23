/**
 * UG-003 2D motion graphics. All components are pure functions of `f` (frame inside the scene)
 * and absolute cue frames passed in by the timeline.
 */
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { pr, sp } from "../ug/blocks";
import { clamp } from "../ug/fx";
import { C, DISPLAY, INTER, MONO } from "../ug/theme";

export const U = (p: string) => staticFile(`ug-003/${p}`);
const rnd = (n: number) => {
  const v = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return v - Math.floor(v);
};

/* ------------------------------------------------------------------ text atoms */
export const Big: React.FC<{ f: number; at?: number; size?: number; color?: string; children: React.ReactNode; glow?: boolean; align?: "left" | "center" | "right"; weight?: number }> = ({
  f,
  at = 0,
  size = 120,
  color = C.ink,
  children,
  glow = false,
  align = "left",
  weight = 700,
}) => {
  const s = sp(f, at, 15, 190);
  if (f < at) return null;
  return (
    <div
      style={{
        fontFamily: DISPLAY,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1.0,
        letterSpacing: 2,
        color,
        textAlign: align,
        opacity: Math.min(1, s * 1.5),
        transform: `translateY(${(1 - s) * 36}px) scale(${0.94 + 0.06 * s})`,
        textShadow: glow ? `0 0 60px ${color}88, 0 8px 30px rgba(0,0,0,0.7)` : "0 8px 30px rgba(0,0,0,0.7)",
        whiteSpace: "pre-line",
      }}
    >
      {children}
    </div>
  );
};

export const Tag: React.FC<{ f: number; at?: number; color?: string; children: React.ReactNode; size?: number }> = ({ f, at = 0, color = C.teal, children, size = 26 }) => {
  if (f < at) return null;
  const a = pr(f, at, at + 10);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "8px 18px", borderRadius: 999, background: "rgba(5,7,10,0.72)", border: `1.5px solid ${color}88`, color, fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: 2, textTransform: "uppercase", opacity: a, transform: `translateX(${(1 - a) * -24}px)`, whiteSpace: "nowrap", boxShadow: `0 0 30px ${color}22` }}>
      <span style={{ width: 10, height: 10, borderRadius: 5, background: color, boxShadow: `0 0 14px ${color}` }} />
      {children}
    </div>
  );
};

/** Odometer-style number that rolls between values. */
export const Roll: React.FC<{ f: number; from: number; to: number; at: number; len?: number; dec?: number; size?: number; color?: string; prefix?: string; suffix?: string; comma?: boolean }> = ({
  f,
  from,
  to,
  at,
  len = 20,
  dec = 0,
  size = 160,
  color = C.ink,
  prefix = "",
  suffix = "",
  comma = false,
}) => {
  const p = interpolate(f, [at, at + len], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const v = from + (to - from) * p;
  let s = v.toFixed(dec);
  if (comma) s = Number(s).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const kick = f >= at && f < at + len + 6 ? 1 + 0.04 * Math.sin(((f - at) / (len + 6)) * Math.PI) : 1;
  return (
    <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: size, color, textShadow: `0 0 60px ${color}66`, display: "inline-block", transform: `scale(${kick})`, transformOrigin: "left center", whiteSpace: "nowrap" }}>
      {prefix}
      {s}
      {suffix}
    </span>
  );
};

/** Leader-line callout from a point (x,y) to a label box offset by (dx,dy). */
export const Callout: React.FC<{ f: number; at: number; x: number; y: number; dx?: number; dy?: number; color?: string; title: string; sub?: string; until?: number }> = ({
  f,
  at,
  x,
  y,
  dx = 160,
  dy = -120,
  color = C.teal,
  title,
  sub,
  until = 1e9,
}) => {
  if (f < at || f > until + 10) return null;
  const a = pr(f, at, at + 14);
  const out = pr(f, until, until + 10);
  const ex = x + dx * a;
  const ey = y + dy * a;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: 1 - out }}>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <circle cx={x} cy={y} r={9 * a} fill="none" stroke={color} strokeWidth={3} />
        <circle cx={x} cy={y} r={4} fill={color} />
        <line x1={x} y1={y} x2={ex} y2={ey} stroke={color} strokeWidth={2.5} />
        <line x1={ex} y1={ey} x2={ex + (dx >= 0 ? 40 : -40) * pr(f, at + 10, at + 18)} y2={ey} stroke={color} strokeWidth={2.5} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: dx >= 0 ? ex + 50 : undefined,
          right: dx < 0 ? 1920 - ex + 50 : undefined,
          top: ey - 30,
          opacity: pr(f, at + 10, at + 20),
          textAlign: dx >= 0 ? "left" : "right",
        }}
      >
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, color: C.ink, letterSpacing: 1.5, textShadow: "0 4px 20px rgba(0,0,0,0.9)", whiteSpace: "nowrap" }}>{title}</div>
        {sub ? <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 22, color, letterSpacing: 2, textTransform: "uppercase", marginTop: 4, whiteSpace: "nowrap" }}>{sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

/** Glass panel. */
export const Panel: React.FC<{ f: number; at?: number; w?: number; h?: number; children: React.ReactNode; border?: string; pad?: number; style?: React.CSSProperties }> = ({ f, at = 0, w, h, children, border = C.line, pad = 36, style }) => {
  const a = pr(f, at, at + 14);
  if (f < at) return null;
  return (
    <div style={{ width: w, height: h, padding: pad, borderRadius: 24, background: "linear-gradient(180deg, rgba(24,30,38,0.9), rgba(8,11,15,0.94))", border: `1.5px solid ${border}`, boxShadow: "0 30px 80px rgba(0,0,0,0.6)", opacity: a, transform: `translateY(${(1 - a) * 30}px) scale(${0.97 + 0.03 * a})`, boxSizing: "border-box", ...style }}>
      {children}
    </div>
  );
};

/* ------------------------------------------------------------------ padlock */
export const Padlock: React.FC<{ size?: number; open?: number; color?: string; shake?: number; broken?: number }> = ({ size = 220, open = 0, color = C.red, shake = 0, broken = 0 }) => {
  const sx = shake ? Math.sin(shake * 2.7) * 8 * Math.min(1, shake / 4) : 0;
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 100 115" style={{ transform: `translateX(${sx}px)`, overflow: "visible", filter: `drop-shadow(0 0 30px ${color}88)` }}>
      <g transform={`translate(${open * 14} ${-open * 14}) rotate(${open * 25} 72 45)`}>
        <path d="M28 50 V34 a22 22 0 0 1 44 0 V50" fill="none" stroke={color} strokeWidth={9} strokeLinecap="round" />
      </g>
      <g transform={`translate(${-broken * 10} ${broken * 6}) rotate(${-broken * 12} 20 110)`}>
        <rect x={14} y={48} width={broken ? 36 : 72} height={58} rx={10} fill={`${color}22`} stroke={color} strokeWidth={6} />
      </g>
      {broken ? (
        <g transform={`translate(${broken * 12} ${broken * 10}) rotate(${broken * 14} 86 110)`}>
          <rect x={50} y={48} width={36} height={58} rx={10} fill={`${color}22`} stroke={color} strokeWidth={6} />
        </g>
      ) : null}
      {broken ? null : (
        <>
          <circle cx={50} cy={72} r={7} fill={color} />
          <rect x={47} y={74} width={6} height={16} rx={3} fill={color} />
        </>
      )}
    </svg>
  );
};

/* ------------------------------------------------------------------ hook: tools trio */
export const ToolTrio: React.FC<{ f: number; at: [number, number, number] }> = ({ f, at }) => {
  const items = [
    { n: "2", t: "THIN WIRES", c: C.amber },
    { n: "$8", t: "CHIP", c: C.teal },
    { n: "1", t: "TIMED GLITCH", c: C.green },
  ];
  return (
    <div style={{ display: "flex", gap: 26 }}>
      {items.map((it, i) => {
        if (f < at[i]) return <div key={i} style={{ width: 300 }} />;
        const s = sp(f, at[i], 12, 220);
        return (
          <div key={i} style={{ width: 300, padding: "22px 26px", borderRadius: 20, background: "rgba(6,9,12,0.82)", border: `2px solid ${it.c}`, boxShadow: `0 0 40px ${it.c}44`, transform: `scale(${0.7 + 0.3 * s}) translateY(${(1 - s) * 40}px)`, opacity: Math.min(1, s * 1.5) }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 92, color: it.c, lineHeight: 1 }}>{it.n}</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, color: C.ink, letterSpacing: 2, marginTop: 8 }}>{it.t}</div>
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ price clash */
export const PriceClash: React.FC<{ f: number; at: number; at2: number }> = ({ f, at, at2 }) => {
  const a = sp(f, at, 13, 200);
  const b = sp(f, at2, 11, 240);
  const hit = f >= at2 && f < at2 + 10 ? Math.sin(((f - at2) / 10) * Math.PI) : 0;
  const tag = (label: string, price: string, sub: string, col: string, s: number, x: number) => (
    <div style={{ position: "absolute", left: x, top: 300, width: 680, transform: `translateY(${(1 - s) * 80}px) rotate(${(x < 900 ? -3 : 3) * s}deg)`, opacity: Math.min(1, s * 1.4) }}>
      <div style={{ padding: "36px 44px", borderRadius: 28, background: "rgba(8,11,15,0.9)", border: `3px solid ${col}`, boxShadow: `0 0 70px ${col}44` }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, color: col, letterSpacing: 4 }}>{label}</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 150, color: C.ink, lineHeight: 1.05, textShadow: `0 0 50px ${col}55` }}>{price}</div>
        <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 32, color: C.mute }}>{sub}</div>
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{ transform: `translateX(${hit * 14}px)` }}>
      {tag("USED MINING CARD", "~$2,500", "CMP 170HX · 8 GB", C.amber, a, 150)}
      {tag("NVIDIA A100 80GB", "$20,000+", "data-centre AI GPU", C.green, b, 1090)}
      {f >= at2 ? (
        <div style={{ position: "absolute", left: 870, top: 420, fontFamily: DISPLAY, fontWeight: 700, fontSize: 120, color: C.ink, opacity: b, transform: `scale(${1.6 - 0.6 * b})` }}>≈</div>
      ) : null}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ benchmark bars */
export type Bar = { label: string; sub?: string; v: number; color: string; at: number };
export const BenchBars: React.FC<{ f: number; bars: Bar[]; max: number; unit?: string; w?: number; title?: string; titleAt?: number }> = ({ f, bars, max, unit = "TFLOPS", w = 1180, title, titleAt = 0 }) => (
  <div style={{ width: w }}>
    {title ? (
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.mute, letterSpacing: 4, marginBottom: 26, opacity: pr(f, titleAt, titleAt + 10) }}>{title}</div>
    ) : null}
    {bars.map((b, i) => {
      const p = interpolate(f, [b.at, b.at + 26], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
      if (f < b.at) return <div key={i} style={{ height: 132 }} />;
      return (
        <div key={i} style={{ marginBottom: 26, opacity: pr(f, b.at, b.at + 8) }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontFamily: INTER, fontWeight: 700, fontSize: 34, color: C.ink, marginBottom: 10 }}>
            <span>
              {b.label} {b.sub ? <span style={{ color: C.mute, fontWeight: 500, fontSize: 26 }}>{b.sub}</span> : null}
            </span>
            <span style={{ fontFamily: MONO, color: b.color }}>
              {(b.v * p).toFixed(1)} <span style={{ fontSize: 22, color: C.mute }}>{unit}</span>
            </span>
          </div>
          <div style={{ height: 54, borderRadius: 12, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
            <div style={{ width: `${(b.v / max) * 100 * p}%`, height: "100%", borderRadius: 12, background: `linear-gradient(90deg, ${b.color}66, ${b.color})`, boxShadow: `0 0 40px ${b.color}88` }} />
          </div>
        </div>
      );
    })}
  </div>
);

/* ------------------------------------------------------------------ oscilloscope */
/**
 * Voltage trace. mode: "stable" flat line; dips: list of [x0..1, depth 0..1, width] drawn after `dipAt`.
 * scan: 0..1 how much of the trace is drawn. trigger: show trigger marker at x.
 */
export const Scope: React.FC<{
  f: number;
  w?: number;
  h?: number;
  scan: number;
  dips?: { x: number; depth: number; wd: number }[];
  noise?: number;
  trigger?: number;
  label?: string;
  color?: string;
  grid?: boolean;
  xLabels?: [string, string];
}> = ({ f, w = 1300, h = 520, scan, dips = [], noise = 0.004, trigger, label, color = C.green, grid = true, xLabels }) => {
  const N = 400;
  const base = 0.28; // fraction from top for nominal voltage
  const pts: string[] = [];
  for (let i = 0; i <= N * Math.max(0, Math.min(1, scan)); i++) {
    const x = i / N;
    let v = base;
    for (const d of dips) {
      const k = Math.abs(x - d.x) / d.wd;
      if (k < 1) v += d.depth * 0.6 * (1 - k * k) ** 0.6;
    }
    v += (rnd(i + Math.floor(f / 2) * 0.37) - 0.5) * noise * 2;
    pts.push(`${(x * w).toFixed(1)},${(v * h).toFixed(1)}`);
  }
  const headX = scan * w;
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: 18, background: "rgba(3,10,8,0.85)", border: `2px solid ${color}44`, overflow: "hidden", boxShadow: `inset 0 0 80px ${color}11, 0 30px 80px rgba(0,0,0,0.6)` }}>
      {grid ? (
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(${color}18 1px, transparent 1px), linear-gradient(90deg, ${color}18 1px, transparent 1px)`,
            backgroundSize: `${w / 10}px ${h / 8}px`,
          }}
        />
      ) : null}
      <svg width={w} height={h} style={{ position: "absolute" }}>
        <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={4} style={{ filter: `drop-shadow(0 0 8px ${color})` }} />
        {scan < 1 ? <circle cx={headX} cy={base * h} r={7} fill={color} /> : null}
        {trigger !== undefined ? (
          <g>
            <line x1={trigger * w} y1={0} x2={trigger * w} y2={h} stroke={C.amber} strokeWidth={3} strokeDasharray="10 8" />
            <text x={trigger * w + 12} y={h - 22} fill={C.amber} fontFamily={MONO} fontWeight={700} fontSize={24}>
              TRIGGER
            </text>
          </g>
        ) : null}
      </svg>
      {label ? <div style={{ position: "absolute", left: 24, top: 18, fontFamily: MONO, fontWeight: 700, fontSize: 24, color, letterSpacing: 3 }}>{label}</div> : null}
      {xLabels ? (
        <>
          <div style={{ position: "absolute", left: 16, bottom: 10, fontFamily: MONO, fontSize: 20, color: C.mute }}>{xLabels[0]}</div>
          <div style={{ position: "absolute", right: 16, bottom: 10, fontFamily: MONO, fontSize: 20, color: C.mute }}>{xLabels[1]}</div>
        </>
      ) : null}
    </div>
  );
};

/* ------------------------------------------------------------------ automation loop */
export const LoopRing: React.FC<{ f: number; speed: number; at: number }> = ({ f, speed, at }) => {
  const steps = ["SLEEP", "WAKE", "GLITCH", "CHECK"];
  const cols = [C.teal, C.green, C.amber, C.ink];
  const t = Math.max(0, f - at) * speed;
  const cur = Math.floor(t / 12) % 4;
  const R = 250;
  const a = pr(f, at, at + 16);
  return (
    <div style={{ position: "relative", width: 700, height: 700, opacity: a, transform: `scale(${0.9 + 0.1 * a})` }}>
      <svg width={700} height={700} style={{ position: "absolute" }}>
        <circle cx={350} cy={350} r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={6} />
        <circle cx={350} cy={350} r={R} fill="none" stroke={cols[cur]} strokeWidth={8} strokeDasharray={`${(Math.PI * 2 * R) / 4 - 20} ${Math.PI * 2 * R}`} transform={`rotate(${-90 + cur * 90 + 2} 350 350)`} style={{ filter: `drop-shadow(0 0 12px ${cols[cur]})` }} />
      </svg>
      {steps.map((s, i) => {
        const ang = -Math.PI / 2 + (i * Math.PI) / 2;
        const x = 350 + Math.cos(ang) * R;
        const y = 350 + Math.sin(ang) * R;
        const on = i === cur;
        return (
          <div key={s} style={{ position: "absolute", left: x - 110, top: y - 40, width: 220, height: 80, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 34, letterSpacing: 3, color: on ? "#05070a" : C.ink, background: on ? cols[i] : "rgba(8,11,15,0.9)", border: `2px solid ${cols[i]}`, boxShadow: on ? `0 0 40px ${cols[i]}` : "none", transform: `scale(${on ? 1.08 : 1})` }}>
            {s}
          </div>
        );
      })}
    </div>
  );
};

/** Glitch hours clock (1 h → 48 h). */
export const HoursClock: React.FC<{ f: number; at: number; len: number }> = ({ f, at, len }) => {
  const p = interpolate(f, [at, at + len], [0, 1], { ...clamp, easing: (t) => t * t });
  const hrs = 1 + 47 * p;
  const a = pr(f, at, at + 12);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 30, opacity: a }}>
      <svg width={180} height={180} viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={44} fill="rgba(8,11,15,0.9)" stroke={C.amber} strokeWidth={4} />
        <line x1={50} y1={50} x2={50 + Math.sin(hrs * Math.PI * 2) * 34} y2={50 - Math.cos(hrs * Math.PI * 2) * 34} stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
        <line x1={50} y1={50} x2={50 + Math.sin((hrs / 12) * Math.PI * 2) * 22} y2={50 - Math.cos((hrs / 12) * Math.PI * 2) * 22} stroke={C.amber} strokeWidth={5} strokeLinecap="round" />
        <circle cx={50} cy={50} r={4} fill={C.amber} />
      </svg>
      <div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 120, color: C.amber, lineHeight: 1 }}>
          1–{Math.round(hrs)}h
        </div>
        <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 32, color: C.mute }}>of glitching, per card</div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ wafer / binning */
export const Wafer: React.FC<{ f: number; at: number; defAt: number; offAt: number }> = ({ f, at, defAt, offAt }) => {
  const a = pr(f, at, at + 20);
  const dies: { x: number; y: number; bad: boolean; i: number }[] = [];
  let i = 0;
  for (let y = -6; y <= 6; y++)
    for (let x = -6; x <= 6; x++) {
      if (x * x + y * y > 38) continue;
      dies.push({ x, y, bad: rnd(i * 7.1) < 0.28, i: i++ });
    }
  const spin = f * 0.08;
  return (
    <div style={{ position: "relative", width: 620, height: 620, opacity: a, transform: `rotate(${spin}deg) scale(${0.85 + 0.15 * a})` }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #5a6a86 0%, #232a38 45%, #0d1118 100%)", boxShadow: "0 0 80px rgba(40,215,255,0.25), inset 0 0 40px rgba(0,0,0,0.6)" }} />
      {dies.map((d) => {
        const bad = d.bad && f >= defAt + (d.i % 9) * 2;
        const off = d.bad && f >= offAt;
        const col = off ? "rgba(255,182,72,0.85)" : bad ? "rgba(255,61,82,0.9)" : "rgba(53,242,154,0.25)";
        return <div key={d.i} style={{ position: "absolute", left: 310 + d.x * 44 - 20, top: 310 + d.y * 44 - 20, width: 40, height: 40, borderRadius: 4, background: col, border: "1px solid rgba(255,255,255,0.25)", boxShadow: bad ? `0 0 16px ${col}` : undefined }} />;
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ VRAM fit */
export const VramFit: React.FC<{ f: number; at: number; at80: number }> = ({ f, at, at80 }) => {
  const cards = [
    { gb: 8, label: "8 GB", at: at, col: C.red },
    { gb: 16, label: "16 GB", at: at + 8, col: C.red },
    { gb: 80, label: "80 GB", at: at80, col: C.green },
  ];
  const MODEL = 40; // illustrative "big model" size, GB
  return (
    <div style={{ display: "flex", gap: 70, alignItems: "flex-end" }}>
      {cards.map((c, i) => {
        if (f < c.at) return <div key={i} style={{ width: 240 }} />;
        const a = pr(f, c.at, c.at + 16);
        const H = 560;
        const over = c.gb < MODEL;
        return (
          <div key={i} style={{ width: 240, opacity: a, transform: `translateY(${(1 - a) * 50}px)` }}>
            <div style={{ position: "relative", height: H, borderRadius: 18, border: `3px solid ${c.col}`, background: "rgba(8,11,15,0.88)", overflow: "visible" }}>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${(c.gb / 80) * 100}%`, background: "rgba(255,255,255,0.06)", borderTop: `2px dashed ${c.col}` }} />
              <div style={{ position: "absolute", left: 10, right: 10, bottom: 10, height: H * (MODEL / 80) * pr(f, c.at + 6, c.at + 26) - 10, borderRadius: 10, background: over ? "linear-gradient(0deg, rgba(255,61,82,0.6), rgba(255,61,82,0.25))" : "linear-gradient(0deg, rgba(53,242,154,0.7), rgba(53,242,154,0.3))", border: `2px solid ${over ? C.red : C.green}` }} />
              {over && f > c.at + 20 ? (
                <div style={{ position: "absolute", top: -64, left: 0, right: 0, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, color: C.red }}>DOESN'T FIT</div>
              ) : null}
              {!over && f > c.at + 24 ? (
                <div style={{ position: "absolute", top: -64, left: 0, right: 0, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, color: C.green }}>FITS ✓</div>
              ) : null}
            </div>
            <div style={{ textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 54, color: c.col, marginTop: 16 }}>{c.label}</div>
          </div>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------------ terminal */
export const Terminal: React.FC<{ f: number; at: number; lines: { t: string; at: number; color?: string }[]; w?: number; title?: string; cps?: number }> = ({ f, at, lines, w = 1300, title = "kate@lab: ~", cps = 2.2 }) => {
  const a = pr(f, at, at + 12);
  return (
    <div style={{ width: w, borderRadius: 18, overflow: "hidden", background: "rgba(4,6,8,0.95)", border: "1.5px solid rgba(255,255,255,0.12)", boxShadow: "0 40px 100px rgba(0,0,0,0.7)", opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>
      <div style={{ height: 48, display: "flex", alignItems: "center", gap: 10, padding: "0 18px", background: "rgba(255,255,255,0.05)" }}>
        {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
          <span key={c} style={{ width: 14, height: 14, borderRadius: 7, background: c }} />
        ))}
        <span style={{ marginLeft: 16, fontFamily: MONO, fontSize: 20, color: C.mute }}>{title}</span>
      </div>
      <div style={{ padding: "24px 30px", fontFamily: MONO, fontSize: 30, lineHeight: 1.55, color: C.ink, minHeight: 200 }}>
        {lines.map((l, i) => {
          if (f < l.at) return null;
          const n = Math.floor((f - l.at) * cps * 2);
          const txt = l.t.slice(0, n);
          const typing = n < l.t.length;
          return (
            <div key={i} style={{ color: l.color ?? C.ink, whiteSpace: "pre" }}>
              {txt}
              {typing && f % 16 < 8 ? "▍" : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ quote card */
export const Quote: React.FC<{ f: number; at: number; text: string; who: string; src: string; hi?: string; size?: number }> = ({ f, at, text, who, src, hi, size = 64 }) => {
  const a = pr(f, at, at + 16);
  const words = text.split(" ");
  const shown = Math.floor((f - at) / 2.2);
  return (
    <div style={{ width: 1400, opacity: a }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 220, lineHeight: 0.6, color: C.amber, opacity: 0.8 }}>“</div>
      <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: size, lineHeight: 1.22, color: C.ink }}>
        {words.map((w, i) => {
          const isHi = hi && hi.split(" ").includes(w.replace(/[^A-Za-z]/g, ""));
          return (
            <span key={i} style={{ opacity: i < shown ? 1 : 0.12, color: isHi ? C.green : C.ink, textShadow: isHi && i < shown ? `0 0 30px ${C.green}88` : undefined }}>
              {w}{" "}
            </span>
          );
        })}
      </div>
      <div style={{ marginTop: 34, display: "flex", gap: 20, alignItems: "center", opacity: pr(f, at + 20, at + 32) }}>
        <div style={{ width: 60, height: 4, background: C.amber }} />
        <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 34, color: C.ink }}>{who}</div>
        <div style={{ fontFamily: MONO, fontSize: 24, color: C.mute }}>{src}</div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ override record table */
export const Records: React.FC<{ f: number; at: number; newAt: number; bootAt: number }> = ({ f, at, newAt, bootAt }) => {
  const rows = [
    { k: "OPT_FBP_DISABLE", v: "0x852", note: "factory: memory partitions OFF", at: at + 6 },
    { k: "OPT_SM_DISABLE", v: "0x…", note: "factory: SMs OFF", at: at + 14 },
  ];
  const nw = f >= newAt;
  const boot = f >= bootAt ? (f - bootAt) % 60 : -1;
  return (
    <Panel f={f} at={at} w={1320} pad={34} border="rgba(40,215,255,0.35)">
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontWeight: 700, fontSize: 24, color: C.teal, letterSpacing: 3, marginBottom: 18 }}>
        <span>FUSE OVERRIDE RECORDS</span>
        {boot >= 0 ? <span style={{ color: C.amber }}>BOOT · READING ROW {Math.min(3, Math.floor(boot / 12) + 1)}…</span> : <span style={{ color: C.mute }}>replayed at every boot</span>}
      </div>
      {rows.map((r, i) =>
        f < r.at ? null : (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 420px 200px 1fr", alignItems: "center", padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.08)", fontFamily: MONO, fontSize: 32, opacity: nw && i === 0 ? 0.35 : pr(f, r.at, r.at + 8), textDecoration: nw && i === 0 ? "line-through" : "none", background: boot >= 0 && Math.floor(boot / 12) === i ? "rgba(255,182,72,0.08)" : undefined }}>
            <span style={{ color: C.mute }}>{i + 1}</span>
            <span style={{ color: C.ink }}>{r.k}</span>
            <span style={{ color: C.red }}>{r.v}</span>
            <span style={{ color: C.mute, fontFamily: INTER, fontSize: 26 }}>{r.note}</span>
          </div>
        ),
      )}
      {nw ? (
        <div style={{ display: "grid", gridTemplateColumns: "60px 420px 200px 1fr", alignItems: "center", padding: "16px 0", borderTop: "1px solid rgba(255,255,255,0.08)", fontFamily: MONO, fontSize: 32, opacity: pr(f, newAt, newAt + 8), background: "rgba(53,242,154,0.08)", transform: `translateX(${(1 - pr(f, newAt, newAt + 12)) * 60}px)` }}>
          <span style={{ color: C.green }}>3</span>
          <span style={{ color: C.ink }}>OPT_FBP_DISABLE</span>
          <span style={{ color: C.green }}>0x840</span>
          <span style={{ color: C.green, fontFamily: INTER, fontSize: 26, fontWeight: 700 }}>NEWER → overrides row 1</span>
        </div>
      ) : null}
      <div style={{ marginTop: 14, fontFamily: INTER, fontSize: 20, color: C.mute }}>Values from Kate's write-up (one card). Simplified.</div>
    </Panel>
  );
};

/* ------------------------------------------------------------------ memory bar 8 / 64 / 80 */
export const MemBar: React.FC<{ f: number; at: number; soft: number; full?: number; lockedLabel?: string }> = ({ f, at, soft, full = -1, lockedLabel = "LOCKED BY FUSES" }) => {
  const W = 1400;
  const p8 = pr(f, at, at + 14);
  const p64 = pr(f, soft, soft + 24);
  const p80 = full >= 0 ? pr(f, full, full + 24) : 0;
  const gb = 8 + 56 * p64 + 16 * p80;
  return (
    <div style={{ width: W }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 110, color: p64 > 0.5 ? C.amber : C.ink }}>{Math.round(gb)} GB</span>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.mute }}>of 80 GB on the card</span>
      </div>
      <div style={{ position: "relative", height: 90, borderRadius: 16, background: "rgba(255,255,255,0.05)", border: "2px solid rgba(255,255,255,0.12)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(8 / 80) * 100 * p8}%`, background: C.teal, boxShadow: `0 0 30px ${C.teal}` }} />
        <div style={{ position: "absolute", left: "10%", top: 0, bottom: 0, width: `${(56 / 80) * 100 * p64}%`, background: `linear-gradient(90deg, ${C.teal}, ${C.amber})` }} />
        <div style={{ position: "absolute", left: "80%", top: 0, bottom: 0, width: `${20 * p80}%`, background: C.green }} />
        {p80 < 1 ? (
          <div style={{ position: "absolute", left: "80%", top: 0, bottom: 0, right: 0, background: "repeating-linear-gradient(45deg, rgba(255,61,82,0.35) 0 14px, rgba(0,0,0,0) 14px 28px)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 24, color: C.red, opacity: 1 - p80 }}>
            🔒
          </div>
        ) : null}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontFamily: MONO, fontSize: 26, color: C.mute }}>
        <span style={{ color: C.teal }}>8 GB stock</span>
        <span style={{ color: C.amber, opacity: p64 }}>64 GB · earlier software trick</span>
        <span style={{ color: C.red, opacity: 1 - p80 }}>{lockedLabel}</span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ results grid labels */
export const ResultChip: React.FC<{ f: number; at: number; gb: number; x: number; y: number }> = ({ f, at, gb, x, y }) => {
  if (f < at) return null;
  const s = sp(f, at, 11, 240);
  const col = gb === 80 ? C.green : C.amber;
  return (
    <div style={{ position: "absolute", left: x - 90, top: y - 30, width: 180, textAlign: "center", padding: "8px 0", borderRadius: 12, background: "rgba(5,7,10,0.85)", border: `2px solid ${col}`, fontFamily: MONO, fontWeight: 800, fontSize: 40, color: col, boxShadow: `0 0 30px ${col}66`, transform: `scale(${s})` }}>
      {gb} GB
    </div>
  );
};

/* ------------------------------------------------------------------ stat row */
export const StatRow: React.FC<{ f: number; at: number; label: string; from: string; to: string; note?: string; color?: string }> = ({ f, at, label, from, to, note, color = C.green }) => {
  if (f < at) return null;
  const a = pr(f, at, at + 14);
  const arrow = pr(f, at + 8, at + 22);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 260px 120px 1fr", alignItems: "center", padding: "26px 0", borderBottom: "1px solid rgba(255,255,255,0.08)", opacity: a, transform: `translateX(${(1 - a) * -40}px)` }}>
      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.mute, letterSpacing: 3 }}>{label}</span>
      <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 64, color: C.red, textDecoration: arrow > 0.9 ? "line-through" : "none", opacity: 1 - arrow * 0.45 }}>{from}</span>
      <span style={{ fontFamily: DISPLAY, fontSize: 64, color: C.mute, opacity: arrow }}>→</span>
      <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 64, color, opacity: arrow, textShadow: `0 0 40px ${color}66` }}>
        {to} {note ? <span style={{ fontFamily: INTER, fontWeight: 600, fontSize: 26, color: C.mute }}>{note}</span> : null}
      </span>
    </div>
  );
};

/* ------------------------------------------------------------------ checklist */
export const Checks: React.FC<{ f: number; items: { t: string; at: number; ok?: boolean }[]; size?: number }> = ({ f, items, size = 50 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
    {items.map((it, i) => {
      if (f < it.at) return null;
      const s = sp(f, it.at, 12, 220);
      const col = it.ok === false ? C.red : it.ok === true ? C.green : C.amber;
      return (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 24, opacity: Math.min(1, s * 1.4), transform: `translateX(${(1 - s) * -50}px)` }}>
          <div style={{ width: size * 1.2, height: size * 1.2, borderRadius: 14, border: `3px solid ${col}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: INTER, fontWeight: 800, fontSize: size * 0.8, color: col, boxShadow: `0 0 24px ${col}55` }}>{it.ok === false ? "✕" : it.ok === true ? "✓" : "!"}</div>
          <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: size, color: C.ink }}>{it.t}</div>
        </div>
      );
    })}
  </div>
);

/* ------------------------------------------------------------------ crypto timeline */
export const CryptoTimeline: React.FC<{ f: number; at: number; at2022: number; atPaper: number }> = ({ f, at, at2022, atPaper }) => {
  const W = 1500;
  const H = 420;
  const draw = interpolate(f, [at, atPaper + 20], [0, 1], clamp);
  const N = 120;
  const pts: string[] = [];
  for (let i = 0; i <= N * draw; i++) {
    const x = i / N;
    // illustrative mining-demand curve: boom in 2021, collapse in late 2022
    const y = x < 0.55 ? 0.75 - 0.55 * Math.sin((x / 0.55) * Math.PI * 0.55) - (rnd(i) - 0.5) * 0.05 : 0.2 + (x - 0.55) * 4 * 0.9 + (rnd(i) - 0.5) * 0.03;
    pts.push(`${x * W},${Math.min(0.94, y) * H}`);
  }
  const m22 = pr(f, at2022, at2022 + 12);
  return (
    <div style={{ position: "relative", width: W, height: H + 80 }}>
      <svg width={W} height={H} style={{ position: "absolute", overflow: "visible" }}>
        <line x1={0} y1={H} x2={W} y2={H} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
        <polyline points={pts.join(" ")} fill="none" stroke={draw > 0.6 ? C.red : C.amber} strokeWidth={6} style={{ filter: `drop-shadow(0 0 10px ${draw > 0.6 ? C.red : C.amber})` }} />
        <line x1={W * 0.6} y1={0} x2={W * 0.6} y2={H} stroke={C.red} strokeWidth={3} strokeDasharray="10 10" opacity={m22} />
      </svg>
      <div style={{ position: "absolute", left: W * 0.12, top: H + 20, fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.amber }}>2021 · CRYPTO BOOM</div>
      <div style={{ position: "absolute", left: W * 0.6 + 20, top: 30, opacity: m22, fontFamily: INTER, fontWeight: 800, fontSize: 40, color: C.red, width: 560 }}>
        2022 · Ethereum stops
        <br />
        mining with GPUs
      </div>
      <div style={{ position: "absolute", left: 0, top: -50, fontFamily: MONO, fontSize: 22, color: C.mute, letterSpacing: 2 }}>GPU MINING DEMAND (ILLUSTRATIVE)</div>
    </div>
  );
};

/* ------------------------------------------------------------------ karaoke captions */
export type Cap = [number, number, [string, number][]];
export const Karaoke: React.FC<{ caps: Cap[] }> = ({ caps }) => {
  const f = useCurrentFrame();
  const now = f / 30;
  const c = caps.find((x) => now >= x[0] - 0.05 && now <= x[1] + 0.3);
  if (!c) return null;
  const o = interpolate(now, [c[0] - 0.05, c[0] + 0.06, c[1] + 0.18, c[1] + 0.3], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, display: "flex", justifyContent: "center", opacity: o, pointerEvents: "none" }}>
      <div style={{ maxWidth: 1500, padding: "10px 26px", borderRadius: 14, background: "rgba(5,7,10,0.66)", fontFamily: INTER, fontWeight: 800, fontSize: 46, letterSpacing: 0.2, textAlign: "center", lineHeight: 1.25 }}>
        {c[2].map(([w, s], i) => {
          const active = now >= s - 0.02 && (i + 1 >= c[2].length || now < c[2][i + 1][1] - 0.02);
          const past = now >= s - 0.02;
          return (
            <span key={i} style={{ color: active ? C.green : past ? C.ink : "rgba(243,246,248,0.55)", textShadow: active ? `0 0 22px ${C.green}99` : "0 2px 8px rgba(0,0,0,0.6)", display: "inline-block", transform: active ? "translateY(-2px) scale(1.06)" : "none", marginRight: 12 }}>
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ chapter tag (corner, over the scene) */
export const ChapterTag: React.FC<{ n: number; title: string }> = ({ n, title }) => {
  const f = useCurrentFrame();
  const len = 96;
  if (f > len + 12) return null;
  const a = pr(f, 0, 12);
  const out = pr(f, len, len + 12);
  const line = pr(f, 4, 26);
  return (
    <div style={{ position: "absolute", left: 80, top: 70, opacity: a * (1 - out), transform: `translateX(${(1 - a) * -50 - out * 50}px)` }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, color: C.amber, letterSpacing: 6 }}>CHAPTER {n}</div>
      <div style={{ height: 3, width: 420 * line, background: C.amber, margin: "10px 0", boxShadow: `0 0 16px ${C.amber}` }} />
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: C.ink, letterSpacing: 2, textShadow: "0 6px 30px rgba(0,0,0,0.8)" }}>{title}</div>
    </div>
  );
};

/* ------------------------------------------------------------------ end screen */
export const EndScreen: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const a = pr(f, at, at + 18);
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <div style={{ position: "absolute", left: 140, top: 250, width: 900 }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, color: C.teal, letterSpacing: 5, marginBottom: 18 }}>WATCH NEXT</div>
        <div style={{ width: 880, height: 495, borderRadius: 22, overflow: "hidden", border: `3px solid ${C.teal}`, boxShadow: `0 0 70px ${C.teal}55` }}>
          <Img src={U("img/ug001_thumb.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 36, color: C.ink, marginTop: 20 }}>GPU & RAM Prices Are Finally Dropping… Right?</div>
      </div>
      <div style={{ position: "absolute", right: 170, top: 330, width: 520, textAlign: "center", opacity: pr(f, at + 12, at + 28) }}>
        <div style={{ width: 300, height: 300, margin: "0 auto", borderRadius: "50%", border: `4px solid ${C.green}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: C.ink, boxShadow: `0 0 60px ${C.green}55` }}>UG</div>
        <div style={{ marginTop: 30, display: "inline-block", padding: "16px 40px", borderRadius: 14, background: C.red, fontFamily: INTER, fontWeight: 800, fontSize: 40, color: "#fff" }}>SUBSCRIBE</div>
      </div>
    </AbsoluteFill>
  );
};
