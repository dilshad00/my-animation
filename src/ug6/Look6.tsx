/**
 * UG-006 2D motion kit: GSAP-driven kinetic type (timelines seeked per frame → deterministic),
 * editorial tags, chapter cards, charts, captions, film finishing (grain, vignette, flares).
 * Palette: charcoal / gunmetal, warm orange + coral, white type.
 */
import gsap from "gsap";
import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame } from "remotion";
import { loadFont as loadBarlow } from "@remotion/google-fonts/BarlowCondensed";
import { INTER, MONO } from "../ug/theme";
import { P } from "./Three6";

export const HEAD = loadBarlow("normal", { weights: ["500", "600", "700", "800"], subsets: ["latin"] }).fontFamily;
export { INTER, MONO };
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const lin = (f: number, a: number, b: number, from = 0, to = 1) => interpolate(f, [a, Math.max(a + 0.001, b)], [from, to], clamp);
const ease = gsap.parseEase("expo.out");
const easeIO = gsap.parseEase("power3.inOut");
const back = gsap.parseEase("back.out(1.7)");
/** GSAP eases as pure functions of progress. */
export const E = {
  out: (f: number, a: number, b: number) => ease(lin(f, a, b)),
  io: (f: number, a: number, b: number) => easeIO(lin(f, a, b)),
  back: (f: number, a: number, b: number) => back(lin(f, a, b)),
  get: (name: string) => gsap.parseEase(name),
};
export const sp = (f: number, at: number, damping = 14, stiffness = 170) => spring({ frame: f - at, fps: 30, config: { damping, stiffness } });

/**
 * Builds a paused GSAP timeline that tweens a plain state object, then seeks it to frame/30.
 * build(tl, s) receives the timeline and the state (keys set from `init`). Returns the state values.
 */
export function useTimeline<T extends Record<string, number>>(f: number, init: T, build: (tl: gsap.core.Timeline, s: T) => void, deps: unknown[] = []): T {
  const { tl, s } = useMemo(() => {
    const s = { ...init };
    const tl = gsap.timeline({ paused: true });
    build(tl, s);
    return { tl, s };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  tl.seek(f / 30, false);
  return { ...s };
}

/* ===================================================================== layout atoms */
export const Pos: React.FC<{ x?: number; y?: number; r?: number; b?: number; w?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, r, b, w, children, style }) => (
  <div style={{ position: "absolute", left: x, top: y, right: r, bottom: b, width: w, ...style }}>{children}</div>
);
export const Center: React.FC<{ y: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ y, children, style }) => (
  <Pos x={0} w={1920} y={y} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", ...style }}>
    {children}
  </Pos>
);

/** Studio backdrop: charcoal gradient + warm pool of light + faint floor horizon. */
export const Backdrop: React.FC<{ f?: number; x?: number; y?: number; warm?: number; cool?: number; base?: string }> = ({ f = 0, x = 50, y = 42, warm = 0.22, cool = 0.08, base = P.bg }) => (
  <AbsoluteFill style={{ backgroundColor: base }}>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 60% at ${x + Math.sin(f * 0.004) * 2}% ${y}%, rgba(255,122,47,${warm}), transparent 70%)` }} />
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 50% 40% at ${100 - x}% 20%, rgba(188,214,255,${cool}), transparent 70%)` }} />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.0) 55%, rgba(0,0,0,0.55) 100%)" }} />
  </AbsoluteFill>
);

/* ===================================================================== kinetic type */
/**
 * Headline that builds word-by-word (mask slide-up, GSAP expo.out, stagger). Words wrapped in [] are
 * accent-coloured. out: frame to start exit (optional).
 */
export const Kinetic: React.FC<{ f: number; at: number; text: string; size?: number; color?: string; accent?: string; stagger?: number; out?: number; align?: "left" | "center" | "right"; weight?: number; track?: number; lh?: number }> = ({
  f,
  at,
  text,
  size = 120,
  color = P.white,
  accent = P.orange,
  stagger = 3,
  out,
  align = "center",
  weight = 800,
  track = 1,
  lh = 0.95,
}) => {
  if (f < at) return null;
  const lines = text.split("\n");
  let idx = 0;
  let inAcc = false;
  const xo = out !== undefined ? E.io(f, out, out + 12) : 0;
  return (
    <div style={{ textAlign: align, fontFamily: HEAD, fontWeight: weight, fontSize: size, lineHeight: lh, letterSpacing: track, textTransform: "uppercase", opacity: 1 - xo, transform: `translateY(${-xo * 30}px)` }}>
      {lines.map((ln, li) => (
        <div key={li}>
          {ln.split(" ").map((w, wi) => {
            const k = idx++;
            const open = w.startsWith("[");
            const close = w.endsWith("]");
            const acc = inAcc || open;
            if (open && !close) inAcc = true;
            if (close) inAcc = false;
            const word = w.replace(/^\[/, "").replace(/\]$/, "");
            const t = E.out(f, at + k * stagger, at + k * stagger + 18);
            return (
              <span key={wi} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", marginRight: size * 0.22, paddingBottom: size * 0.06 }}>
                <span
                  style={{
                    display: "inline-block",
                    transform: `translateY(${(1 - t) * 105}%) skewY(${(1 - t) * 6}deg)`,
                    color: acc ? accent : color,
                    textShadow: acc ? `0 0 40px ${accent}66, 0 6px 30px rgba(0,0,0,0.7)` : "0 6px 30px rgba(0,0,0,0.7)",
                  }}
                >
                  {word}
                </span>
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Metallic brushed type with a moving light sweep (chapter titles, finale). */
export const MetalType: React.FC<{ f: number; at: number; children: React.ReactNode; size?: number; sweepAt?: number; tint?: string }> = ({ f, at, children, size = 180, sweepAt, tint = "#ffffff" }) => {
  if (f < at) return null;
  const a = E.out(f, at, at + 22);
  const sw = lin(f, sweepAt ?? at + 6, (sweepAt ?? at + 6) + 40, -60, 160);
  return (
    <div
      style={{
        fontFamily: HEAD,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 0.92,
        letterSpacing: 2,
        textTransform: "uppercase",
        opacity: a,
        transform: `scale(${1.08 - 0.08 * a})`,
        backgroundImage: `linear-gradient(100deg, transparent ${sw - 12}%, rgba(255,255,255,0.95) ${sw}%, transparent ${sw + 12}%), linear-gradient(180deg, ${tint} 0%, #c9ccd1 38%, #6d727a 52%, #e6e8eb 70%, #9aa0a8 100%)`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.8))",
      }}
    >
      {children}
    </div>
  );
};

/** Split-flap counter (years/numbers). values flip at given frames. */
export const Flap: React.FC<{ f: number; seq: { v: string; at: number }[]; size?: number; color?: string }> = ({ f, seq, size = 160, color = P.orange }) => {
  let cur = seq[0];
  for (const s of seq) if (f >= s.at) cur = s;
  const flip = lin(f, cur.at, cur.at + 5);
  return (
    <div style={{ display: "inline-flex", gap: size * 0.06 }}>
      {cur.v.split("").map((ch, i) => (
        <div
          key={i}
          style={{
            width: size * 0.66,
            height: size * 1.1,
            borderRadius: size * 0.06,
            background: "linear-gradient(180deg, #1d2025 0%, #1d2025 49%, #0c0d10 50%, #16181c 100%)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06), 0 14px 40px rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: HEAD,
            fontWeight: 800,
            fontSize: size,
            color,
            textShadow: `0 0 30px ${color}66`,
            transform: `rotateX(${(1 - flip) * 80}deg)`,
          }}
        >
          {ch}
        </div>
      ))}
    </div>
  );
};

/** Rolling number (counts from→to). */
export const Roll: React.FC<{ f: number; at: number; len: number; from: number; to: number; dec?: number; prefix?: string; suffix?: string; size?: number; color?: string }> = ({
  f,
  at,
  len,
  from,
  to,
  dec = 0,
  prefix = "",
  suffix = "",
  size = 90,
  color = P.white,
}) => {
  const v = from + (to - from) * E.out(f, at, at + len);
  return <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: size, color, fontVariantNumeric: "tabular-nums" }}>{prefix + v.toFixed(dec) + suffix}</span>;
};

/* ===================================================================== tags */
/** Amber stamp-like disclosure tag: REPORTED / ILLUSTRATIVE / SOURCE. */
export const Tag: React.FC<{ f: number; at: number; children: React.ReactNode; color?: string; size?: number; icon?: string }> = ({ f, at, children, color = P.amber, size = 22, icon = "●" }) => {
  if (f < at) return null;
  const a = E.out(f, at, at + 14);
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        padding: `${size * 0.35}px ${size * 0.8}px`,
        borderRadius: 6,
        border: `2px solid ${color}`,
        background: "rgba(11,12,14,0.82)",
        fontFamily: MONO,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: 3,
        color,
        opacity: a,
        transform: `translateX(${(1 - a) * -24}px)`,
        boxShadow: `0 0 24px ${color}33`,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: size * 0.7 }}>{icon}</span>
      {children}
    </div>
  );
};
export const Source: React.FC<{ f: number; at: number; children: React.ReactNode; x?: number; y?: number }> = ({ f, at, children, x = 60, y = 960 }) => {
  if (f < at) return null;
  const a = lin(f, at, at + 12);
  return (
    <Pos x={x} y={y}>
      <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 20, color: "rgba(244,242,238,0.75)", letterSpacing: 1.5, opacity: a, textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>SOURCE · {children}</div>
    </Pos>
  );
};
/** Big stamp (UNAVAILABLE / OUT OF STOCK) — slams in rotated. */
export const Stamp: React.FC<{ f: number; at: number; children: React.ReactNode; color?: string; rot?: number; size?: number }> = ({ f, at, children, color = P.coral, rot = -8, size = 84 }) => {
  if (f < at) return null;
  const s = sp(f, at, 10, 260);
  return (
    <div
      style={{
        display: "inline-block",
        padding: "10px 34px",
        border: `7px solid ${color}`,
        borderRadius: 12,
        fontFamily: HEAD,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: 6,
        color,
        transform: `rotate(${rot}deg) scale(${2.2 - 1.2 * s})`,
        opacity: Math.min(1, s * 1.5),
        background: "rgba(11,12,14,0.55)",
        boxShadow: `0 0 50px ${color}44`,
      }}
    >
      {children}
    </div>
  );
};
/** Lower-third label with a leader line (for 3D callouts). */
export const Label: React.FC<{ f: number; at: number; x: number; y: number; title: string; sub?: string; dx?: number; dy?: number; color?: string; align?: "left" | "right" }> = ({
  f,
  at,
  x,
  y,
  title,
  sub,
  dx = 120,
  dy = -80,
  color = P.orange,
  align = "left",
}) => {
  if (f < at) return null;
  const a = E.out(f, at, at + 16);
  const t = E.out(f, at + 6, at + 22);
  const ex = x + dx * a;
  const ey = y + dy * a;
  return (
    <>
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
        <circle cx={x} cy={y} r={7 * a} fill={color} />
        <circle cx={x} cy={y} r={16 * a} fill="none" stroke={color} strokeOpacity={0.5} strokeWidth={2} />
        <polyline points={`${x},${y} ${ex},${ey} ${ex + (align === "left" ? 60 : -60) * t},${ey}`} fill="none" stroke={color} strokeWidth={2.5} />
      </svg>
      <div style={{ position: "absolute", left: align === "left" ? ex + 72 : undefined, right: align === "right" ? 1920 - ex + 72 : undefined, top: ey - 30, opacity: t, textAlign: align }}>
        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 44, color: P.white, letterSpacing: 1.5, textTransform: "uppercase", textShadow: "0 4px 18px rgba(0,0,0,0.9)", whiteSpace: "nowrap" }}>{title}</div>
        {sub ? <div style={{ fontFamily: MONO, fontWeight: 600, fontSize: 20, color, letterSpacing: 2, marginTop: 2, whiteSpace: "nowrap" }}>{sub}</div> : null}
      </div>
    </>
  );
};

/* ===================================================================== chapter card */
/**
 * Chapter card: big outlined number, metallic title, orange rule, light sweep. variant changes the
 * backdrop (0 brushed metal, 1 laser grid, 2 heat-spreader ribs, 3 numerals, 4 parts, 5 silence).
 */
export const ChapterCard: React.FC<{ f: number; n: number; title: string; variant?: number; len: number }> = ({ f, n, title, variant = 0, len }) => {
  const inA = E.out(f, 0, 20);
  const outA = E.io(f, len - 14, len);
  const rule = E.out(f, 10, 40);
  const drift = lin(f, 0, len, 0, 1);
  return (
    <AbsoluteFill style={{ opacity: 1 - outA }}>
      <Backdrop f={f} warm={0.16} y={60} />
      {variant === 1 ? (
        <AbsoluteFill style={{ perspective: 900 }}>
          <div
            style={{
              position: "absolute",
              left: -600,
              right: -600,
              top: 560,
              height: 1200,
              transform: `rotateX(72deg) translateY(${-drift * 200}px)`,
              backgroundImage: `linear-gradient(rgba(255,122,47,0.35) 2px, transparent 2px), linear-gradient(90deg, rgba(255,122,47,0.35) 2px, transparent 2px)`,
              backgroundSize: "80px 80px",
              maskImage: "linear-gradient(180deg, transparent, black 30%, black 60%, transparent)",
            }}
          />
        </AbsoluteFill>
      ) : variant === 2 ? (
        <AbsoluteFill style={{ opacity: 0.5, backgroundImage: "repeating-linear-gradient(90deg, #1b1d21 0 22px, #2a2d33 22px 26px, #121316 26px 48px)", maskImage: "radial-gradient(ellipse at 50% 55%, black 20%, transparent 75%)" }} />
      ) : variant === 0 ? (
        <AbsoluteFill style={{ opacity: 0.35, backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 3px)", maskImage: "radial-gradient(ellipse at 50% 55%, black 25%, transparent 75%)" }} />
      ) : null}
      <Center y={250}>
        <div
          style={{
            fontFamily: HEAD,
            fontWeight: 800,
            fontSize: 380,
            lineHeight: 0.8,
            color: "transparent",
            WebkitTextStroke: `3px rgba(255,122,47,${0.25 + 0.6 * inA})`,
            transform: `scale(${1.25 - 0.25 * inA + drift * 0.04})`,
            letterSpacing: 10,
          }}
        >
          {String(n).padStart(2, "0")}
        </div>
      </Center>
      <Center y={620}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 12, color: P.orange, opacity: inA }}>CHAPTER {n}</div>
        <div style={{ width: 760 * rule, height: 3, background: P.orange, margin: "18px 0 22px", boxShadow: `0 0 20px ${P.orange}` }} />
        <MetalType f={f} at={6} size={104} sweepAt={18}>
          {title}
        </MetalType>
      </Center>
    </AbsoluteFill>
  );
};

/* ===================================================================== charts */
/** Clean line chart with animated draw. series: values 0..1 (y up). */
export const LineChart: React.FC<{
  f: number;
  at: number;
  w?: number;
  h?: number;
  xLabels: string[];
  series: { vals: number[]; color: string; label: string; dash?: boolean; at?: number; len?: number }[];
  title?: string;
  shadeBetween?: [number, number];
  shadeLabel?: string;
  shadeAt?: number;
}> = ({ f, at, w = 1300, h = 560, xLabels, series, title, shadeBetween, shadeLabel, shadeAt = 0 }) => {
  const a = E.out(f, at, at + 16);
  const xs = (i: number, n: number) => 70 + (i / (n - 1)) * (w - 140);
  const ys = (v: number) => h - 60 - v * (h - 130);
  const pathOf = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${xs(i, vals.length)},${ys(v)}`).join(" ");
  let shade: string | null = null;
  if (shadeBetween) {
    const [ia, ib] = shadeBetween;
    const A = series[ia].vals;
    const B = series[ib].vals;
    shade = A.map((v, i) => `${i ? "L" : "M"}${xs(i, A.length)},${ys(v)}`).join(" ") + " " + [...B].reverse().map((v, i) => `L${xs(B.length - 1 - i, B.length)},${ys(v)}`).join(" ") + " Z";
  }
  return (
    <div style={{ position: "relative", width: w, height: h, opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>
      {title ? <div style={{ position: "absolute", left: 70, top: -6, fontFamily: MONO, fontWeight: 700, fontSize: 24, color: "rgba(244,242,238,0.7)", letterSpacing: 3 }}>{title}</div> : null}
      <svg width={w} height={h} style={{ overflow: "visible" }}>
        {[0, 0.25, 0.5, 0.75, 1].map((g) => (
          <line key={g} x1={70} x2={w - 70} y1={ys(g)} y2={ys(g)} stroke="rgba(255,255,255,0.07)" strokeWidth={1.5} />
        ))}
        <line x1={70} x2={w - 70} y1={ys(0)} y2={ys(0)} stroke="rgba(255,255,255,0.35)" strokeWidth={2} />
        {xLabels.map((l, i) => (
          <text key={l} x={xs(i, xLabels.length)} y={h - 18} fill="rgba(244,242,238,0.75)" fontFamily={MONO} fontSize={22} textAnchor="middle">
            {l}
          </text>
        ))}
        {shade ? <path d={shade} fill={P.coral} opacity={0.22 * E.out(f, shadeAt, shadeAt + 20)} /> : null}
        {series.map((s, si) => {
          const sAt = s.at ?? at + 8;
          const len = s.len ?? 50;
          const t = E.io(f, sAt, sAt + len);
          const d = pathOf(s.vals);
          const n = s.vals.length;
          const last = Math.min(n - 1, t * (n - 1));
          const li = Math.floor(last);
          const fr = last - li;
          const lv = li + 1 < n ? s.vals[li] + (s.vals[li + 1] - s.vals[li]) * fr : s.vals[li];
          return (
            <g key={si}>
              <path d={d} fill="none" stroke={s.color} strokeWidth={6} strokeDasharray={s.dash ? "14 10" : "4000"} strokeDashoffset={s.dash ? 0 : 4000 * (1 - t)} opacity={s.dash ? t : 1} strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 10px ${s.color})` }} />
              {t > 0 ? <circle cx={xs(last, n)} cy={ys(lv)} r={10} fill={s.color} /> : null}
              {t > 0.9 ? (
                <text x={xs(n - 1, n) + 14} y={ys(s.vals[n - 1]) + 8} fill={s.color} fontFamily={HEAD} fontWeight={800} fontSize={30} opacity={lin(t, 0.9, 1)}>
                  {s.label}
                </text>
              ) : null}
            </g>
          );
        })}
        {shadeLabel && shade ? (
          <text x={w / 2 + 120} y={h / 2 - 10} fill={P.coral} fontFamily={HEAD} fontWeight={800} fontSize={34} textAnchor="middle" opacity={E.out(f, shadeAt + 10, shadeAt + 30)}>
            {shadeLabel}
          </text>
        ) : null}
      </svg>
    </div>
  );
};

/** Range bar (e.g. +10% to +15%): an axis 0..max with a growing bar and highlighted band. */
export const RangeBar: React.FC<{ f: number; at: number; lo: number; hi: number; max: number; label: string; w?: number; growAt?: number }> = ({ f, at, lo, hi, max, label, w = 1200, growAt }) => {
  const a = E.out(f, at, at + 14);
  const g0 = growAt ?? at + 10;
  const grow = E.io(f, g0, g0 + 40);
  const band = E.out(f, g0 + 30, g0 + 50);
  const X = (v: number) => (v / max) * w;
  return (
    <div style={{ position: "relative", width: w, height: 260, opacity: a }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: "rgba(244,242,238,0.75)" }}>{label}</div>
      <div style={{ position: "absolute", top: 90, left: 0, width: w, height: 70, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} />
      <div style={{ position: "absolute", top: 90, left: X(lo), width: (X(hi) - X(lo)) * band, height: 70, borderRadius: 8, background: `repeating-linear-gradient(135deg, ${P.orange}55 0 10px, transparent 10px 20px)`, border: `2px solid ${P.orange}` }} />
      <div style={{ position: "absolute", top: 90, left: 0, width: X(lo) * grow, height: 70, borderRadius: "8px 0 0 8px", background: `linear-gradient(90deg, ${P.coral}, ${P.orange})`, boxShadow: `0 0 30px ${P.orange}66` }} />
      {Array.from({ length: max / 5 + 1 }, (_, i) => (
        <div key={i} style={{ position: "absolute", top: 172, left: X(i * 5) - 30, width: 60, textAlign: "center", fontFamily: MONO, fontSize: 22, color: "rgba(244,242,238,0.6)" }}>
          {i * 5}%
        </div>
      ))}
      <div style={{ position: "absolute", top: -16, left: X(lo) - 10, opacity: band, fontFamily: HEAD, fontWeight: 800, fontSize: 92, color: P.orange, textShadow: `0 0 40px ${P.orange}66` }}>
        +{lo}–{hi}%
      </div>
    </div>
  );
};

/* ===================================================================== finishing */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.06 }) => {
  const f = useCurrentFrame();
  const seed = (f * 7919) % 1000;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity, mixBlendMode: "overlay" }}>
      <svg width="1920" height="1080">
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="1920" height="1080" filter={`url(#g${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
export const Vignette: React.FC<{ k?: number }> = ({ k = 0.7 }) => <AbsoluteFill style={{ pointerEvents: "none", background: `radial-gradient(ellipse at 50% 50%, transparent 45%, rgba(0,0,0,${k}) 100%)` }} />;
/** Letterbox bars (cinematic beats). */
export const Bars: React.FC<{ k: number }> = ({ k }) =>
  k <= 0 ? null : (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 120 * k, background: "#000" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120 * k, background: "#000" }} />
    </>
  );
/** Anamorphic horizontal flare streak at (x, y). */
export const Flare: React.FC<{ x: number; y: number; k: number; color?: string; w?: number }> = ({ x, y, k, color = P.orange, w = 1400 }) =>
  k <= 0 ? null : (
    <div style={{ position: "absolute", left: x - w / 2, top: y - 3, width: w, height: 6, opacity: k, background: `linear-gradient(90deg, transparent, ${color}, #fff, ${color}, transparent)`, filter: "blur(2px)", mixBlendMode: "screen", boxShadow: `0 0 40px ${color}` }} />
  );
/** Full-frame light-blade wipe: a bright diagonal blade crossing the frame between a and b. */
export const Blade: React.FC<{ f: number; a: number; b: number; color?: string }> = ({ f, a, b, color = P.orange }) => {
  if (f < a || f > b) return null;
  const t = E.io(f, a, b);
  return <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen", background: `linear-gradient(105deg, transparent ${t * 140 - 30}%, ${color}55 ${t * 140 - 8}%, #fff ${t * 140 - 4}%, ${color}55 ${t * 140}%, transparent ${t * 140 + 20}%)` }} />;
};
/** Depth-of-field helper: blurs its children by px (CSS). */
export const Dof: React.FC<{ px: number; children: React.ReactNode }> = ({ px, children }) => <AbsoluteFill style={{ filter: px > 0.05 ? `blur(${px}px)` : undefined }}>{children}</AbsoluteFill>;
/** Directional motion-blur approximation: N ghost copies offset along (dx, dy). Use sparingly. */
export const MBlur: React.FC<{ dx: number; dy?: number; n?: number; children: React.ReactNode }> = ({ dx, dy = 0, n = 4, children }) => {
  if (Math.abs(dx) + Math.abs(dy) < 2) return <>{children}</>;
  return (
    <AbsoluteFill>
      {Array.from({ length: n }, (_, i) => (
        <AbsoluteFill key={i} style={{ transform: `translate(${(-dx * i) / n}px, ${(-dy * i) / n}px)`, opacity: i === 0 ? 1 : 0.35 / i }}>
          {children}
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};

/* ===================================================================== captions (orange active word) */
export type Cap = [number, number, [string, number][]];
export const Captions: React.FC<{ caps: Cap[]; hide?: (f: number) => boolean }> = ({ caps, hide }) => {
  const f = useCurrentFrame();
  if (hide?.(f)) return null;
  const now = f / 30;
  const c = caps.find((x) => now >= x[0] - 0.05 && now <= x[1] + 0.3);
  if (!c) return null;
  const o = interpolate(now, [c[0] - 0.05, c[0] + 0.06, c[1] + 0.18, c[1] + 0.3], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 64, display: "flex", justifyContent: "center", opacity: o, pointerEvents: "none" }}>
      <div style={{ maxWidth: 1500, padding: "8px 24px", borderRadius: 10, background: "rgba(8,9,11,0.62)", fontFamily: INTER, fontWeight: 800, fontSize: 42, textAlign: "center", lineHeight: 1.25 }}>
        {c[2].map(([w, s], i) => {
          const active = now >= s - 0.02 && (i + 1 >= c[2].length || now < c[2][i + 1][1] - 0.02);
          const past = now >= s - 0.02;
          return (
            <span key={i} style={{ color: active ? P.orange : past ? P.white : "rgba(244,242,238,0.5)", textShadow: active ? `0 0 20px ${P.orange}88` : "0 2px 8px rgba(0,0,0,0.6)", display: "inline-block", marginRight: 11 }}>
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
