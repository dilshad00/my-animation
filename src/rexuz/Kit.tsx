/**
 * REXUZ AI promo — shared kit: brand palette, kinetic type, phone frame, recreated chat UI
 * and one self-contained visual per feature. Every visual takes the local frame `f`.
 */
import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadSG } from "@remotion/google-fonts/SpaceGrotesk";
import React from "react";
import { AbsoluteFill, Img, interpolate, OffthreadVideo, random, staticFile, useVideoConfig } from "remotion";
import { clamp, ease } from "../ug/fx";

export const ANTON = loadAnton("normal", { weights: ["400"], subsets: ["latin"] }).fontFamily;
export const SG = loadSG("normal", { weights: ["500", "700"], subsets: ["latin"] }).fontFamily;
export const MONO = loadMono("normal", { weights: ["500"], subsets: ["latin"] }).fontFamily;

export const K = {
  night: "#05040F",
  navy: "#0B0920",
  cyan: "#22D3EE",
  blue: "#6366F1",
  violet: "#8B5CF6",
  magenta: "#D946EF",
  red: "#F43F5E",
  ink: "#F4F2FF",
  dim: "rgba(244,242,255,0.62)",
  glass: "rgba(20,17,44,0.78)",
  line: "rgba(139,92,246,0.45)",
};
export const R = (p: string) => staticFile(`rexuz/${p}`);
export const BAR = 2000 / 30; // one bar at 108 BPM = 66.667 frames
export const bar = (n: number) => Math.round(n * BAR);

export const pr = (f: number, a: number, b: number) => interpolate(f, [a, Math.max(a + 1, b)], [0, 1], { ...clamp, easing: ease });
export const lin = (f: number, a: number, b: number) => interpolate(f, [a, Math.max(a + 1, b)], [0, 1], clamp);
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const typed = (s: string, f: number, at: number, cps = 1.6) => s.slice(0, Math.max(0, Math.floor((f - at) * cps)));
/** Fade/blur in over 12 frames at `a`, out over 10 frames at `b`. */
export const life = (f: number, a: number, b = 1e9) => pr(f, a, a + 12) * (1 - pr(f, b, b + 10));

export const gradText = (f: number): React.CSSProperties => ({
  backgroundImage: `linear-gradient(90deg, ${K.cyan}, ${K.violet} 35%, ${K.magenta} 65%, ${K.cyan})`,
  backgroundSize: "300% 100%",
  backgroundPosition: `${(f * 1.2) % 300}% 0`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
});

/* ---------- background ---------- */
export const Bg: React.FC<{ f: number; tint?: string; grid?: boolean }> = ({ f, tint = "rgba(139,92,246,0.42)", grid = true }) => {
  const { width: W, height: H } = useVideoConfig();
  const blob = (cx: number, cy: number, r: number, col: string, ph: number): React.CSSProperties => ({
    position: "absolute",
    left: cx - r + Math.sin(f / 95 + ph) * W * 0.07,
    top: cy - r + Math.cos(f / 120 + ph) * H * 0.07,
    width: r * 2,
    height: r * 2,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${col} 0%, rgba(0,0,0,0) 66%)`,
  });
  const m = Math.max(W, H);
  return (
    <AbsoluteFill style={{ background: K.night, overflow: "hidden" }}>
      <div style={blob(W * 0.18, H * 0.25, m * 0.42, "rgba(34,211,238,0.22)", 0)} />
      <div style={blob(W * 0.82, H * 0.7, m * 0.48, tint, 2)} />
      <div style={blob(W * 0.6, H * 0.1, m * 0.3, "rgba(217,70,239,0.18)", 4)} />
      {grid ? (
        <AbsoluteFill
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,92,246,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.08) 1px, transparent 1px)",
            backgroundSize: "90px 90px",
            backgroundPosition: `0 ${(f * 0.6) % 90}px`,
            WebkitMaskImage: "radial-gradient(ellipse at 50% 55%, black 25%, transparent 72%)",
            maskImage: "radial-gradient(ellipse at 50% 55%, black 25%, transparent 72%)",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

/** Floating light specks for depth. */
export const Dust: React.FC<{ f: number; n?: number; seed?: string }> = ({ f, n = 40, seed = "d" }) => {
  const { width: W, height: H } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(n).fill(0).map((_, i) => {
        const x = random(`${seed}x${i}`) * W;
        const y = (random(`${seed}y${i}`) * H - f * (0.3 + random(`${seed}s${i}`) * 0.9) + H * 2) % H;
        const s = 2 + random(`${seed}r${i}`) * 4;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(f / 20 + i));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: "50%",
              background: i % 3 === 0 ? K.cyan : i % 3 === 1 ? K.violet : K.magenta,
              opacity: 0.55 * tw,
              boxShadow: `0 0 ${s * 3}px currentColor`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** White/cyan flash centred on frame `at`. */
export const Flash: React.FC<{ f: number; at: number; len?: number; color?: string }> = ({ f, at, len = 10, color = "#fff" }) => {
  const o = f < at ? lin(f, at - 3, at) : 1 - lin(f, at, at + len);
  if (o <= 0) return null;
  return <AbsoluteFill style={{ background: color, opacity: o * 0.85, mixBlendMode: "screen", pointerEvents: "none" }} />;
};

/* ---------- type ---------- */
/**
 * Kinetic words: each word slides up out of a mask. `*word` = brand gradient, `|` = line break.
 */
export const Words: React.FC<{
  f: number;
  at: number;
  text: string;
  size: number;
  out?: number;
  stagger?: number;
  align?: "left" | "center" | "right";
  font?: string;
  color?: string;
  lh?: number;
  spacing?: number;
  glow?: boolean;
}> = ({ f, at, text, size, out, stagger = 4, align = "left", font = ANTON, color = K.ink, lh = 1.02, spacing = 0.01, glow = false }) => {
  const o = out === undefined ? 1 : 1 - pr(f, out, out + 10);
  if (f < at - 1 || o <= 0) return null;
  const parts = text.split(" ");
  let wi = 0;
  return (
    <div
      style={{
        fontFamily: font,
        fontSize: size,
        lineHeight: lh,
        color,
        letterSpacing: `${spacing}em`,
        textTransform: "uppercase",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
        columnGap: size * 0.24,
        opacity: o,
        filter: `blur(${(1 - o) * 12}px)${glow ? ` drop-shadow(0 0 ${size * 0.18}px rgba(139,92,246,0.55))` : ""}`,
        transform: `translateY(${(1 - o) * -size * 0.3}px)`,
      }}
    >
      {parts.map((w, i) => {
        if (w === "|") return <div key={i} style={{ flexBasis: "100%", height: 0 }} />;
        const k = wi++;
        const t = pr(f, at + k * stagger, at + k * stagger + 16);
        const hot = w.startsWith("*");
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", padding: `${size * 0.04}px 0 ${size * 0.08}px` }}>
            <span
              style={{
                display: "inline-block",
                transform: `translateY(${(1 - t) * 115}%) skewY(${(1 - t) * 6}deg)`,
                ...(hot ? gradText(f) : {}),
              }}
            >
              {hot ? w.slice(1) : w}
            </span>
          </span>
        );
      })}
    </div>
  );
};

export const Kicker: React.FC<{ f: number; at: number; text: string; size?: number; out?: number; color?: string; align?: "left" | "center" }> = ({
  f,
  at,
  text,
  size = 30,
  out,
  color = K.cyan,
  align = "left",
}) => {
  const o = life(f, at, out);
  if (o <= 0) return null;
  return (
    <div
      style={{
        fontFamily: SG,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: `${mix(0.6, 0.32, pr(f, at, at + 20))}em`,
        textTransform: "uppercase",
        color,
        opacity: o,
        textAlign: align,
        textShadow: `0 0 ${size * 0.6}px ${color}`,
      }}
    >
      {text}
    </div>
  );
};

/** Small honest label, e.g. "Illustrative. Actual results vary." */
export const Note: React.FC<{ f: number; at: number; text: string; out?: number; style?: React.CSSProperties }> = ({ f, at, text, out, style }) => {
  const o = life(f, at, out);
  if (o <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        fontFamily: SG,
        fontWeight: 500,
        fontSize: 22,
        color: "rgba(244,242,255,0.7)",
        background: "rgba(5,4,15,0.55)",
        border: "1px solid rgba(244,242,255,0.18)",
        borderRadius: 999,
        padding: "8px 18px",
        opacity: o,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

/* ---------- phone + chat ---------- */
export const PHONE_RATIO = 2412 / 1080;
export const Phone: React.FC<{ w: number; children: React.ReactNode; style?: React.CSSProperties; glow?: number }> = ({ w, children, style, glow = 1 }) => {
  const h = w * PHONE_RATIO;
  const pad = w * 0.035;
  return (
    <div
      style={{
        position: "absolute",
        width: w + pad * 2,
        height: h + pad * 2,
        padding: pad,
        borderRadius: w * 0.14,
        background: "linear-gradient(150deg, #3a3170 0%, #0b0920 38%, #0b0920 62%, #2b2160 100%)",
        boxShadow: `0 0 0 2px rgba(139,92,246,0.55), 0 0 ${w * 0.28 * glow}px rgba(99,102,241,${0.45 * glow}), 0 ${w * 0.12}px ${w * 0.35}px rgba(0,0,0,0.85)`,
        ...style,
      }}
    >
      <div style={{ width: w, height: h, borderRadius: w * 0.11, overflow: "hidden", position: "relative", background: K.night }}>{children}</div>
    </div>
  );
};
export const Screen: React.FC<{ src: string; o?: number }> = ({ src, o = 1 }) => (
  <Img src={R(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: o }} />
);

const BUBBLE_USER = "linear-gradient(135deg, #4F46E5, #7C3AED)";
export const ChatPanel: React.FC<{ w: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ w, children, style }) => (
  <div
    style={{
      position: "absolute",
      width: w,
      borderRadius: 40,
      background: "linear-gradient(180deg, rgba(23,19,52,0.94), rgba(9,8,26,0.96))",
      border: "1.5px solid rgba(139,92,246,0.55)",
      boxShadow: "0 0 80px rgba(99,102,241,0.35), 0 40px 120px rgba(0,0,0,0.7)",
      padding: "30px 34px 36px",
      fontFamily: SG,
      color: K.ink,
      ...style,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 26 }}>
      <Img src={R("logo_icon.png")} style={{ width: 52, height: 52, borderRadius: 14 }} />
      <div style={{ fontWeight: 700, fontSize: 36, letterSpacing: "0.02em" }}>
        REX<span style={{ color: "#B388FF" }}>UZ AI</span>
      </div>
      <div style={{ marginLeft: "auto", fontSize: 22, color: K.dim, border: "1px solid rgba(244,242,255,0.2)", borderRadius: 999, padding: "6px 16px" }}>
        on this device
      </div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>{children}</div>
  </div>
);
export const UserMsg: React.FC<{ f: number; at: number; text: string; size?: number }> = ({ f, at, text, size = 32 }) => {
  const t = pr(f, at, at + 12);
  if (t <= 0) return null;
  return (
    <div
      style={{
        alignSelf: "flex-end",
        maxWidth: "82%",
        background: BUBBLE_USER,
        borderRadius: "28px 28px 8px 28px",
        padding: "18px 26px",
        fontSize: size,
        lineHeight: 1.3,
        opacity: t,
        transform: `translateY(${(1 - t) * 30}px) scale(${mix(0.9, 1, t)})`,
        transformOrigin: "right bottom",
      }}
    >
      {text}
    </div>
  );
};
export const BotMsg: React.FC<{ f: number; at: number; children: React.ReactNode; size?: number }> = ({ f, at, children, size = 30 }) => {
  const t = pr(f, at, at + 12);
  if (t <= 0) return null;
  return (
    <div
      style={{
        alignSelf: "flex-start",
        maxWidth: "92%",
        background: "rgba(30,27,58,0.95)",
        border: "1px solid rgba(139,92,246,0.35)",
        borderRadius: "28px 28px 28px 8px",
        padding: "18px 26px",
        fontSize: size,
        lineHeight: 1.38,
        opacity: t,
        transform: `translateY(${(1 - t) * 30}px)`,
      }}
    >
      {children}
    </div>
  );
};
export const Dots: React.FC<{ f: number; label: string }> = ({ f, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, color: K.dim }}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          width: 12,
          height: 12,
          borderRadius: 6,
          background: [K.cyan, K.violet, K.magenta][i],
          transform: `translateY(${Math.sin(f / 4 - i) * 5}px)`,
        }}
      />
    ))}
    <span>{label}</span>
  </div>
);

/* ---------- feature visuals ---------- */

/** Tic-tac-toe board that draws itself, plays X/O and a win line. */
export const GameBoard: React.FC<{ f: number; at: number; size: number }> = ({ f, at, size }) => {
  const c = size / 3;
  const grid = pr(f, at, at + 24);
  const moves: [number, number, "X" | "O"][] = [
    [0, 0, "X"],
    [1, 1, "O"],
    [0, 1, "X"],
    [2, 2, "O"],
    [0, 2, "X"],
  ];
  const win = pr(f, at + 24 + moves.length * 14, at + 24 + moves.length * 14 + 14);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible", filter: `drop-shadow(0 0 ${size * 0.03}px rgba(139,92,246,0.8))` }}>
      {[1, 2].map((i) => (
        <g key={i} stroke={K.violet} strokeWidth={size * 0.02} strokeLinecap="round">
          <line x1={c * i} y1={0} x2={c * i} y2={size * grid} />
          <line x1={0} y1={c * i} x2={size * grid} y2={c * i} />
        </g>
      ))}
      {moves.map(([r, col, m], i) => {
        const t = pr(f, at + 24 + i * 14, at + 24 + i * 14 + 12);
        if (t <= 0) return null;
        const cx = col * c + c / 2;
        const cy = r * c + c / 2;
        const s = c * 0.28;
        if (m === "X") {
          const L = s * 2 * Math.SQRT2;
          return (
            <g key={i} stroke={K.red} strokeWidth={size * 0.028} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${K.red})` }}>
              <line x1={cx - s} y1={cy - s} x2={cx + s} y2={cy + s} strokeDasharray={L} strokeDashoffset={L * (1 - Math.min(1, t * 2))} />
              <line x1={cx + s} y1={cy - s} x2={cx - s} y2={cy + s} strokeDasharray={L} strokeDashoffset={L * (1 - Math.max(0, t * 2 - 1))} />
            </g>
          );
        }
        const C2 = 2 * Math.PI * s;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={s}
            fill="none"
            stroke={K.cyan}
            strokeWidth={size * 0.028}
            strokeDasharray={C2}
            strokeDashoffset={C2 * (1 - t)}
            style={{ filter: `drop-shadow(0 0 10px ${K.cyan})` }}
          />
        );
      })}
      {win > 0 ? (
        <line
          x1={c * 0.2}
          y1={c / 2}
          x2={c * 0.2 + (size - c * 0.4) * win}
          y2={c / 2}
          stroke="#fff"
          strokeWidth={size * 0.035}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 18px ${K.magenta})` }}
        />
      ) : null}
    </svg>
  );
};

/** File card produced in chat. */
export const FileCard: React.FC<{ name: string; kind: string; color: string; w: number; play?: number }> = ({ name, kind, color, w, play }) => (
  <div style={{ width: w, borderRadius: 26, border: "1px solid rgba(244,242,255,0.16)", background: "rgba(12,10,30,0.9)", padding: "20px 24px", fontFamily: SG }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 54, height: 64, borderRadius: 10, background: color, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 17, color: "#fff" }}>
        {kind}
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 700, color: K.ink }}>{name}</div>
        <div style={{ fontSize: 21, color: K.dim }}>made on this phone</div>
      </div>
    </div>
    {play !== undefined ? (
      <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
        <div
          style={{
            background: "#C4B5FD",
            color: "#1E1B4B",
            fontWeight: 700,
            fontSize: 24,
            borderRadius: 999,
            padding: "10px 34px",
            transform: `scale(${1 + 0.06 * Math.max(0, Math.sin(play / 4))})`,
            boxShadow: `0 0 ${20 + 20 * Math.max(0, Math.sin(play / 4))}px rgba(196,181,253,0.7)`,
          }}
        >
          Play
        </div>
        <div style={{ border: "1px solid rgba(244,242,255,0.25)", borderRadius: 999, padding: "10px 26px", fontSize: 24, color: K.dim }}>Share</div>
        <div style={{ border: `1px solid ${K.cyan}`, borderRadius: 999, padding: "10px 26px", fontSize: 24, color: K.cyan }}>Fix it</div>
      </div>
    ) : null}
  </div>
);

/** Fan of produced files (PDF / DOCX / XLSX / code). */
export const FilesFan: React.FC<{ f: number; at: number; scale?: number }> = ({ f, at, scale = 1 }) => {
  const docs = [
    { k: "PDF", c: "#EF4444", t: "Trip plan — Goa", lines: [0.9, 0.7, 0.85, 0.6, 0.8] },
    { k: "DOCX", c: "#3B82F6", t: "Leave letter", lines: [0.8, 0.9, 0.5, 0.75, 0.6] },
    { k: "XLSX", c: "#22C55E", t: "Monthly budget", grid: true, lines: [] as number[] },
    { k: "KT", c: K.violet, t: "Reverse.kt", code: true, lines: [] as number[] },
  ];
  return (
    <div style={{ position: "relative", width: 900 * scale, height: 640 * scale, perspective: 1600 }}>
      {docs.map((d, i) => {
        const t = pr(f, at + i * 6, at + i * 6 + 22);
        const ang = (i - 1.5) * 13 * t + Math.sin(f / 40 + i) * 2;
        const x = (i - 1.5) * 170 * t * scale;
        return (
          <div
            key={d.k}
            style={{
              position: "absolute",
              left: 300 * scale + x,
              top: 40 * scale + Math.abs(i - 1.5) * 26 * t * scale,
              width: 330 * scale,
              height: 440 * scale,
              borderRadius: 22 * scale,
              background: "linear-gradient(180deg, #F8F7FF, #E9E6FB)",
              boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 0 2px ${d.c}`,
              transform: `rotateZ(${ang}deg) rotateY(${(1 - t) * 60}deg) translateY(${(1 - t) * 300}px)`,
              transformOrigin: "50% 120%",
              opacity: t,
              padding: 26 * scale,
              fontFamily: SG,
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 * scale }}>
              <div style={{ background: d.c, color: "#fff", fontWeight: 700, fontSize: 20 * scale, borderRadius: 8 * scale, padding: `${6 * scale}px ${12 * scale}px` }}>{d.k}</div>
              <div style={{ color: "#1E1B4B", fontWeight: 700, fontSize: 22 * scale }}>{d.t}</div>
            </div>
            <div style={{ marginTop: 26 * scale }}>
              {d.grid
                ? new Array(7).fill(0).map((_, r) => (
                    <div key={r} style={{ display: "flex" }}>
                      {new Array(3).fill(0).map((__, cc) => (
                        <div
                          key={cc}
                          style={{
                            flex: 1,
                            height: 40 * scale,
                            border: "1px solid #C7D2FE",
                            background: r === 0 ? "#DCFCE7" : "transparent",
                            fontFamily: MONO,
                            fontSize: 15 * scale,
                            color: "#334155",
                            padding: 6 * scale,
                          }}
                        >
                          {r === 0 ? ["Item", "Plan", "Spent"][cc] : cc === 0 ? ["Rent", "Food", "Travel", "Bills", "Fun", "Total"][r - 1] : `${(((r * 37 + cc * 13) % 90) + 10) * 100}`}
                        </div>
                      ))}
                    </div>
                  ))
                : d.code
                  ? ["fun reverse(s: String)", "  = s.reversed()", "", "fun main() {", '  println(reverse("REXUZ"))', "}"].map((l, r) => (
                      <div key={r} style={{ fontFamily: MONO, fontSize: 17 * scale, color: r % 3 === 0 ? "#7C3AED" : "#0F172A", height: 34 * scale, whiteSpace: "pre" }}>
                        {l}
                      </div>
                    ))
                  : d.lines.map((w, r) => (
                      <div key={r} style={{ height: 14 * scale, width: `${w * 100}%`, borderRadius: 7 * scale, background: r === 0 ? d.c : "#C7C3E8", marginBottom: 22 * scale, opacity: r === 0 ? 0.6 : 1 }} />
                    ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Image "painting" itself: noise + blur resolve in 6 steps. */
export const Paint: React.FC<{ f: number; at: number; src: string; size: number; steps?: number; stepLen?: number }> = ({ f, at, src, size, steps = 6, stepLen = 14 }) => {
  const k = Math.max(0, Math.min(steps, Math.floor((f - at) / stepLen) + 1));
  const done = f >= at + steps * stepLen;
  const q = done ? 1 : k / steps;
  const blur = done ? 0 : mix(40, 4, q);
  return (
    <div style={{ position: "relative", width: size, height: size, borderRadius: 30, overflow: "hidden", boxShadow: "0 0 90px rgba(139,92,246,0.45)" }}>
      <Img src={R(src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: `blur(${blur}px) saturate(${mix(0.3, 1, q)})`, transform: `scale(${1.08 - 0.08 * pr(f, at, at + steps * stepLen + 30)})` }} />
      {!done ? (
        <AbsoluteFill style={{ mixBlendMode: "overlay", opacity: mix(0.95, 0.2, q) }}>
          <svg width="100%" height="100%">
            <filter id={`pn${src}`}>
              <feTurbulence type="fractalNoise" baseFrequency={0.75} numOctaves={2} seed={k + f % 3} />
            </filter>
            <rect width="100%" height="100%" filter={`url(#pn${src})`} />
          </svg>
        </AbsoluteFill>
      ) : null}
      {!done && f >= at ? (
        <div style={{ position: "absolute", left: 24, bottom: 22, fontFamily: SG, fontSize: 26, color: "#fff", background: "rgba(5,4,15,0.65)", borderRadius: 999, padding: "8px 20px" }}>
          Painting… step {k} of {steps}
        </div>
      ) : null}
      {done ? <AbsoluteFill style={{ background: "#fff", opacity: 1 - lin(f, at + steps * stepLen, at + steps * stepLen + 8) }} /> : null}
    </div>
  );
};

/** Angled video frame (Gemini clips, watermark already cropped). */
export const VideoFrame: React.FC<{ src: string; w: number; startFrom?: number; style?: React.CSSProperties }> = ({ src, w, startFrom = 0, style }) => (
  <div
    style={{
      position: "absolute",
      width: w,
      height: (w * 9) / 16,
      borderRadius: 28,
      overflow: "hidden",
      boxShadow: "0 0 0 2px rgba(139,92,246,0.6), 0 0 100px rgba(99,102,241,0.45), 0 40px 120px rgba(0,0,0,0.8)",
      ...style,
    }}
  >
    <OffthreadVideo muted src={R(src)} startFrom={startFrom} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  </div>
);

/** Photo with a scanning line and detection corners. */
export const Scan: React.FC<{ f: number; at: number; src: string; w: number; h: number }> = ({ f, at, src, w, h }) => {
  const y = ((f - at) * 9) % (h * 1.4);
  const box = pr(f, at + 20, at + 34);
  const corner = (s: React.CSSProperties) => <div style={{ position: "absolute", width: 46, height: 46, borderColor: K.cyan, borderStyle: "solid", ...s }} />;
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: 26, overflow: "hidden", boxShadow: "0 0 80px rgba(34,211,238,0.3)" }}>
      <Img src={R(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: y - h * 0.2, height: 6, background: K.cyan, boxShadow: `0 0 30px 8px ${K.cyan}`, opacity: 0.8 }} />
      <div style={{ position: "absolute", left: w * 0.14, top: h * 0.2, width: w * 0.72, height: h * 0.58, opacity: box, transform: `scale(${mix(1.2, 1, box)})` }}>
        {corner({ left: 0, top: 0, borderWidth: "6px 0 0 6px" })}
        {corner({ right: 0, top: 0, borderWidth: "6px 6px 0 0" })}
        {corner({ left: 0, bottom: 0, borderWidth: "0 0 6px 6px" })}
        {corner({ right: 0, bottom: 0, borderWidth: "0 6px 6px 0" })}
        <div style={{ position: "absolute", left: 0, top: -50, fontFamily: MONO, fontSize: 24, color: K.night, background: K.cyan, padding: "4px 12px", borderRadius: 6 }}>sports car · 0.97</div>
      </div>
    </div>
  );
};

/** Mic button with a live waveform ring. */
export const MicRing: React.FC<{ f: number; size: number }> = ({ f, size }) => {
  const n = 64;
  const r = size * 0.34;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {new Array(n).fill(0).map((_, i) => {
        const a = (i / n) * Math.PI * 2;
        const amp = 0.25 + 0.75 * Math.abs(Math.sin(f / 5 + i * 0.7) * Math.cos(f / 11 + i * 0.23));
        const len = size * 0.05 + size * 0.14 * amp;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: size / 2 - 4,
              top: size / 2 - r - len,
              width: 8,
              height: len,
              borderRadius: 4,
              background: `linear-gradient(0deg, ${K.violet}, ${i % 2 ? K.cyan : K.magenta})`,
              transform: `rotate(${(a * 180) / Math.PI}deg)`,
              transformOrigin: `4px ${r + len}px`,
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          left: size / 2 - r * 0.72,
          top: size / 2 - r * 0.72,
          width: r * 1.44,
          height: r * 1.44,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, #A78BFA, #4F46E5 60%, #2E1065)",
          boxShadow: `0 0 ${60 + 30 * Math.sin(f / 6)}px rgba(139,92,246,0.9)`,
          display: "grid",
          placeItems: "center",
        }}
      >
        <svg width={r * 0.6} height={r * 0.6} viewBox="0 0 24 24" fill="#fff">
          <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2z" />
        </svg>
      </div>
    </div>
  );
};

/** PDF page with lines that light up and fly into an answer. */
export const DocPage: React.FC<{ f: number; at: number; scale?: number }> = ({ f, at, scale = 1 }) => {
  const hi = pr(f, at + 20, at + 34);
  return (
    <div
      style={{
        position: "relative",
        width: 420 * scale,
        height: 560 * scale,
        borderRadius: 18 * scale,
        background: "linear-gradient(180deg, #F8F7FF, #ECE9FB)",
        boxShadow: "0 40px 100px rgba(0,0,0,0.6)",
        padding: 34 * scale,
        fontFamily: SG,
        transform: `rotate(-4deg)`,
      }}
    >
      <div style={{ color: "#1E1B4B", fontWeight: 700, fontSize: 26 * scale, marginBottom: 22 * scale }}>Biology notes — Ch. 4</div>
      {new Array(11).fill(0).map((_, i) => (
        <div key={i} style={{ position: "relative", height: 13 * scale, marginBottom: 20 * scale, width: `${60 + ((i * 29) % 38)}%`, borderRadius: 7 * scale, background: "#CBC6EC" }}>
          {i === 4 || i === 5 ? (
            <div style={{ position: "absolute", inset: -6 * scale, borderRadius: 8 * scale, background: "rgba(250,204,21,0.75)", transformOrigin: "left", transform: `scaleX(${hi})` }} />
          ) : null}
        </div>
      ))}
      <div style={{ position: "absolute", right: 24 * scale, bottom: 18 * scale, fontFamily: MONO, fontSize: 18 * scale, color: "#6B7280" }}>p. 12</div>
    </div>
  );
};

/** Wireframe globe of light. */
export const Globe: React.FC<{ f: number; size: number }> = ({ f, size }) => {
  const r = size / 2 - 6;
  const rot = (f * 1.2) % 360;
  return (
    <svg width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} style={{ filter: `drop-shadow(0 0 ${size * 0.04}px ${K.cyan})` }}>
      <defs>
        <radialGradient id="gl" cx="40%" cy="35%">
          <stop offset="0%" stopColor="rgba(99,102,241,0.55)" />
          <stop offset="100%" stopColor="rgba(5,4,15,0.2)" />
        </radialGradient>
      </defs>
      <circle r={r} fill="url(#gl)" stroke={K.cyan} strokeWidth={3} />
      {[-60, -30, 0, 30, 60].map((lat) => {
        const y = r * Math.sin((lat * Math.PI) / 180);
        const rx = r * Math.cos((lat * Math.PI) / 180);
        return <ellipse key={lat} cx={0} cy={y} rx={rx} ry={rx * 0.12} fill="none" stroke="rgba(34,211,238,0.45)" strokeWidth={2} />;
      })}
      {new Array(6).fill(0).map((_, i) => {
        const a = ((rot + i * 30) % 180) - 90;
        const rx = Math.abs(r * Math.sin((a * Math.PI) / 180));
        return <ellipse key={i} cx={0} cy={0} rx={rx} ry={r} fill="none" stroke={i % 2 ? "rgba(217,70,239,0.5)" : "rgba(139,92,246,0.55)"} strokeWidth={2} />;
      })}
      {new Array(14).fill(0).map((_, i) => {
        const a = ((random(`g${i}`) * 360 + rot) * Math.PI) / 180;
        const lat = (random(`gl${i}`) - 0.5) * Math.PI * 0.8;
        const x = r * Math.cos(lat) * Math.sin(a);
        const vis = Math.cos(a) > 0;
        return vis ? <circle key={i} cx={x} cy={r * Math.sin(lat)} r={5} fill="#fff" opacity={0.5 + 0.5 * Math.sin(f / 6 + i)} /> : null;
      })}
    </svg>
  );
};

/** Hardware readout bars (real values from the phone's Hardware screen). */
export const HwPanel: React.FC<{ f: number; at: number; w: number }> = ({ f, at, w }) => {
  const rows = [
    { k: "Memory", v: 14.9, u: "GB RAM", fill: 0.47, c: `linear-gradient(90deg, ${K.violet}, ${K.magenta})` },
    { k: "Storage", v: 223.8, u: "GB", fill: 0.85, c: `linear-gradient(90deg, ${K.blue}, ${K.cyan})` },
    { k: "Processor", v: 8, u: "cores · 3.19 GHz", fill: 1, c: `linear-gradient(90deg, ${K.cyan}, ${K.violet})` },
    { k: "Model budget", v: 10.4, u: "GB for AI models", fill: 0.7, c: `linear-gradient(90deg, ${K.magenta}, ${K.red})` },
  ];
  return (
    <div style={{ width: w, borderRadius: 34, background: K.glass, border: `1.5px solid ${K.line}`, padding: "34px 40px", fontFamily: SG, color: K.ink, boxShadow: "0 0 80px rgba(99,102,241,0.3)" }}>
      <div style={{ fontSize: 26, color: K.dim, marginBottom: 6 }}>OnePlus CPH2413 · Android 15</div>
      <div style={{ fontSize: 34, fontWeight: 700, marginBottom: 26 }}>Live resources</div>
      {rows.map((r, i) => {
        const t = pr(f, at + i * 8, at + i * 8 + 40);
        const val = r.v * t;
        return (
          <div key={r.k} style={{ marginBottom: 26, opacity: pr(f, at + i * 8, at + i * 8 + 10) }}>
            <div style={{ display: "flex", fontSize: 28, marginBottom: 10 }}>
              <span>{r.k}</span>
              <span style={{ marginLeft: "auto", fontFamily: MONO, color: K.cyan }}>
                {r.v % 1 === 0 ? Math.round(val) : val.toFixed(1)} <span style={{ color: K.dim, fontFamily: SG, fontSize: 22 }}>{r.u}</span>
              </span>
            </div>
            <div style={{ height: 14, borderRadius: 7, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${r.fill * t * 100}%`, background: r.c, borderRadius: 7, boxShadow: "0 0 20px rgba(139,92,246,0.8)" }} />
            </div>
          </div>
        );
      })}
      <div style={{ fontSize: 24, color: K.dim, marginTop: 6, opacity: pr(f, at + 50, at + 62) }}>Recommended up to ~14B parameters (4-bit)</div>
    </div>
  );
};

/** One downloadable model card. */
export const ModelCard: React.FC<{ name: string; size: string; badge: string; good?: boolean; w?: number; hot?: number }> = ({ name, size, badge, good = true, w = 420, hot = 0 }) => (
  <div
    style={{
      width: w,
      borderRadius: 26,
      background: K.glass,
      border: `1.5px solid ${hot > 0 ? K.cyan : K.line}`,
      boxShadow: `0 0 ${30 + 60 * hot}px rgba(34,211,238,${0.15 + 0.5 * hot})`,
      padding: "24px 28px",
      fontFamily: SG,
      color: K.ink,
    }}
  >
    <div style={{ fontSize: 34, fontWeight: 700 }}>{name}</div>
    <div style={{ fontSize: 22, color: K.dim, margin: "6px 0 16px" }}>{size}</div>
    <span
      style={{
        fontSize: 20,
        fontWeight: 700,
        letterSpacing: "0.08em",
        color: good ? "#052e1a" : "#fff",
        background: good ? "#4ADE80" : K.red,
        borderRadius: 999,
        padding: "6px 16px",
      }}
    >
      {badge}
    </span>
  </div>
);

/** Memory "fact" card. */
export const Fact: React.FC<{ text: string; o?: number; style?: React.CSSProperties }> = ({ text, o = 1, style }) => (
  <div
    style={{
      position: "absolute",
      fontFamily: SG,
      fontWeight: 500,
      fontSize: 30,
      color: K.ink,
      background: K.glass,
      border: `1.5px solid ${K.line}`,
      borderRadius: 22,
      padding: "16px 26px",
      boxShadow: "0 0 40px rgba(139,92,246,0.35)",
      whiteSpace: "nowrap",
      opacity: o,
      ...style,
    }}
  >
    {text}
  </div>
);

/** Toggle switch. */
export const Toggle: React.FC<{ on: number; label: string; w?: number }> = ({ on, label, w = 520 }) => (
  <div style={{ width: w, display: "flex", alignItems: "center", fontFamily: SG, fontSize: 32, color: K.ink, background: K.glass, border: `1.5px solid ${K.line}`, borderRadius: 26, padding: "22px 30px" }}>
    <span>{label}</span>
    <div style={{ marginLeft: "auto", width: 96, height: 54, borderRadius: 27, background: on > 0.5 ? K.violet : "rgba(255,255,255,0.15)", position: "relative", boxShadow: on > 0.5 ? `0 0 30px ${K.violet}` : "none" }}>
      <div style={{ position: "absolute", top: 6, left: mix(6, 48, on), width: 42, height: 42, borderRadius: 21, background: "#fff" }} />
    </div>
  </div>
);

/** Brand logo (ribbon, screen-blended) with rotating light ring. */
export const Logo: React.FC<{ f: number; at: number; size: number }> = ({ f, at, size }) => {
  const t = pr(f, at, at + 30);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div
        style={{
          position: "absolute",
          inset: -size * 0.12,
          borderRadius: "50%",
          background: `conic-gradient(from ${f * 3}deg, transparent 0deg, ${K.cyan} 40deg, transparent 90deg, ${K.magenta} 200deg, transparent 260deg)`,
          WebkitMaskImage: "radial-gradient(circle, transparent 62%, black 64%, black 66%, transparent 69%)",
          maskImage: "radial-gradient(circle, transparent 62%, black 64%, black 66%, transparent 69%)",
          opacity: t,
          filter: "blur(2px)",
        }}
      />
      <Img
        src={R("logo_ribbon.png")}
        style={{
          width: size,
          height: size,
          mixBlendMode: "screen",
          WebkitMaskImage: "radial-gradient(circle closest-side, black 80%, transparent 97%)",
          maskImage: "radial-gradient(circle closest-side, black 80%, transparent 97%)",
          transform: `scale(${mix(0.55, 1, t)}) rotate(${mix(-40, 0, t)}deg)`,
          opacity: t,
          filter: `drop-shadow(0 0 ${size * 0.08}px rgba(139,92,246,0.9))`,
        }}
      />
    </div>
  );
};

export const Wordmark: React.FC<{ f: number; at: number; size: number }> = ({ f, at, size }) => {
  const t = pr(f, at, at + 24);
  return (
    <div
      style={{
        fontFamily: SG,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: `${mix(0.5, 0.04, t)}em`,
        color: K.ink,
        opacity: t,
        filter: `blur(${(1 - t) * 14}px)`,
        whiteSpace: "nowrap",
      }}
    >
      REX<span style={gradText(f)}>UZ AI</span>
    </div>
  );
};

/** Particles that spiral into the centre (for the logo reveal). */
export const Converge: React.FC<{ f: number; at: number; len: number; cx: number; cy: number; n?: number }> = ({ f, at, len, cx, cy, n = 140 }) => {
  const { width: W, height: H } = useVideoConfig();
  const t = pr(f, at, at + len);
  if (t >= 1) return null;
  return (
    <AbsoluteFill>
      {new Array(n).fill(0).map((_, i) => {
        const a0 = random(`ca${i}`) * Math.PI * 2;
        const d0 = Math.max(W, H) * (0.4 + random(`cd${i}`) * 0.5);
        const a = a0 + t * 2.2;
        const d = d0 * (1 - t);
        const s = 3 + random(`cs${i}`) * 5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx + Math.cos(a) * d,
              top: cy + Math.sin(a) * d,
              width: s,
              height: s,
              borderRadius: "50%",
              background: [K.cyan, K.violet, K.magenta][i % 3],
              boxShadow: `0 0 ${s * 4}px ${[K.cyan, K.violet, K.magenta][i % 3]}`,
              opacity: 1 - t * 0.6,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Server racks with blinking LEDs; `off` 0..1 powers them down row by row. */
export const Racks: React.FC<{ f: number; off: number; cols?: number; rows?: number; w: number }> = ({ f, off, cols = 7, rows = 3, w }) => {
  const rw = w / cols - 18;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26, width: w }}>
      {new Array(rows).fill(0).map((_, r) => {
        const dead = off * rows > rows - 1 - r + 0.0001 ? 1 : 0;
        const fade = Math.min(1, Math.max(0, off * rows - (rows - 1 - r)));
        return (
          <div key={r} style={{ display: "flex", gap: 18, opacity: mix(1, 0.25, fade), transform: `scale(${mix(1 - r * 0.08, 1 - r * 0.08, 0)})` }}>
            {new Array(cols).fill(0).map((__, c) => (
              <div
                key={c}
                style={{
                  width: rw,
                  height: rw * 1.6,
                  borderRadius: 10,
                  background: "linear-gradient(180deg, #1b1838, #0d0b22)",
                  border: "1.5px solid rgba(99,102,241,0.4)",
                  padding: 10,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {new Array(7).fill(0).map((___, s) => {
                  const on = !dead && random(`led${r}${c}${s}${Math.floor(f / 4 + random(`p${r}${c}${s}`) * 9)}`) > 0.35;
                  return (
                    <div key={s} style={{ display: "flex", gap: 6, alignItems: "center", height: rw * 0.12 }}>
                      <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 2 }} />
                      <div style={{ width: 8, height: 8, borderRadius: 4, background: on ? (s % 3 === 0 ? K.cyan : "#4ADE80") : "#1f1d33", boxShadow: on ? `0 0 10px ${K.cyan}` : "none" }} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

/** Device silhouettes for the "coming soon" teaser. */
export const Devices: React.FC<{ f: number; at: number; scale?: number }> = ({ f, at, scale = 1 }) => {
  const t = (i: number) => pr(f, at + i * 8, at + i * 8 + 20);
  const stroke = { border: `3px solid ${K.cyan}`, boxShadow: `0 0 30px rgba(34,211,238,0.6), inset 0 0 30px rgba(34,211,238,0.25)` };
  const link = pr(f, at + 30, at + 60);
  return (
    <div style={{ position: "relative", width: 1100 * scale, height: 460 * scale }}>
      <svg width={1100 * scale} height={460 * scale} style={{ position: "absolute", inset: 0 }}>
        {[
          [190, 250, 550, 220],
          [550, 220, 930, 250],
        ].map(([x1, y1, x2, y2], i) => {
          const L = Math.hypot(x2 - x1, y2 - y1) * scale;
          return (
            <line
              key={i}
              x1={x1 * scale}
              y1={y1 * scale}
              x2={x2 * scale}
              y2={y2 * scale}
              stroke={i ? K.magenta : K.violet}
              strokeWidth={6 * scale}
              strokeDasharray={L}
              strokeDashoffset={L * (1 - link)}
              style={{ filter: `drop-shadow(0 0 10px ${K.violet})` }}
            />
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: 120 * scale, top: 110 * scale, width: 140 * scale, height: 280 * scale, borderRadius: 24 * scale, ...stroke, opacity: t(0) }} />
      <div style={{ position: "absolute", left: 400 * scale, top: 60 * scale, width: 300 * scale, height: 200 * scale, borderRadius: 14 * scale, ...stroke, opacity: t(1) }} />
      <div style={{ position: "absolute", left: 360 * scale, top: 268 * scale, width: 380 * scale, height: 18 * scale, borderRadius: 9 * scale, ...stroke, opacity: t(1) }} />
      <div style={{ position: "absolute", left: 800 * scale, top: 80 * scale, width: 260 * scale, height: 180 * scale, borderRadius: 12 * scale, ...stroke, opacity: t(2) }} />
      <div style={{ position: "absolute", left: 905 * scale, top: 262 * scale, width: 50 * scale, height: 80 * scale, ...stroke, borderTop: "none", opacity: t(2) }} />
    </div>
  );
};

export const Stamp: React.FC<{ f: number; at: number; text: string; size?: number; color?: string }> = ({ f, at, text, size = 60, color = K.magenta }) => {
  const t = pr(f, at, at + 10);
  if (t <= 0) return null;
  return (
    <div
      style={{
        fontFamily: ANTON,
        fontSize: size,
        color,
        border: `${size * 0.08}px solid ${color}`,
        borderRadius: size * 0.2,
        padding: `${size * 0.1}px ${size * 0.4}px`,
        transform: `rotate(-6deg) scale(${mix(2.2, 1, t)})`,
        opacity: t,
        letterSpacing: "0.06em",
        textShadow: `0 0 30px ${color}`,
        boxShadow: `0 0 40px ${color}55`,
        display: "inline-block",
      }}
    >
      {text}
    </div>
  );
};
