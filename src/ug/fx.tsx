import React from "react";
import { AbsoluteFill, Easing, interpolate, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { C, INTER, MONO } from "./theme";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ease = Easing.bezier(0.22, 1, 0.36, 1);
export const easeIn = Easing.bezier(0.55, 0, 0.9, 0.4);

/** Animated film grain (SVG noise, overlay blend). */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.09 }) => {
  const f = useCurrentFrame();
  const seed = f % 9;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "overlay", opacity }}>
      <svg width="100%" height="100%">
        <filter id="ug-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#ug-grain)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.75 }) => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      background: `radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)`,
    }}
  />
);

/** Teal/orange cinematic grade for real footage. */
export const Footage: React.FC<{
  src: string;
  from?: number;
  zoom?: [number, number];
  pan?: [number, number];
  dur: number;
  blur?: number;
  dim?: number;
}> = ({ src, from = 0, zoom = [1.04, 1.14], pan = [0, 0], dur, blur = 0, dim = 0.15 }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, dur], [0, 1], clamp);
  const s = zoom[0] + (zoom[1] - zoom[0]) * p;
  const x = pan[0] + (pan[1] - pan[0]) * p;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: C.bg }}>
      <AbsoluteFill style={{ transform: `scale(${s}) translateX(${x}px)` }}>
        <OffthreadVideo
          src={staticFile(src)}
          muted
          trimBefore={from}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: `contrast(1.12) saturate(0.82) brightness(${1 - dim}) blur(${blur}px)`,
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          mixBlendMode: "soft-light",
          opacity: 0.55,
          background: "linear-gradient(115deg, rgba(0,140,170,0.85) 0%, rgba(0,0,0,0) 50%, rgba(255,140,40,0.7) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Decaying camera shake. */
export const shake = (f: number, at: number, dur = 12, amp = 16) => {
  if (f < at || f > at + dur) return "translate(0px,0px)";
  const k = 1 - (f - at) / dur;
  return `translate(${Math.sin(f * 2.9) * amp * k}px, ${Math.cos(f * 3.7) * amp * 0.7 * k}px)`;
};

/** Small source credit, top-left. */
export const SourceTag: React.FC<{ text: string; at: number; until: number }> = ({ text, at, until }) => {
  const f = useCurrentFrame();
  const fade = Math.max(1, Math.min(8, Math.floor((until - at) / 3)));
  const o = interpolate(f, [at, at + fade, until - fade, until], [0, 1, 1, 0], clamp);
  const x = interpolate(f, [at, at + 10], [-20, 0], { ...clamp, easing: ease });
  return (
    <div
      style={{
        position: "absolute",
        left: 64,
        top: 56,
        opacity: o,
        transform: `translateX(${x}px)`,
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontFamily: MONO,
        fontSize: 22,
        letterSpacing: 1.5,
        color: "rgba(243,246,248,0.9)",
        textTransform: "uppercase",
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 4, background: C.amber, boxShadow: `0 0 12px ${C.amber}` }} />
      <span style={{ color: C.amber, fontWeight: 700 }}>Source</span>
      <span>{text}</span>
    </div>
  );
};

/** Whip-pan exit/enter (horizontal motion-blur). */
export const whip = (f: number, exitAt: number | null, enterAt: number | null, len = 9) => {
  let x = 0;
  let blur = 0;
  if (exitAt !== null && f >= exitAt) {
    const p = interpolate(f, [exitAt, exitAt + len], [0, 1], { ...clamp, easing: easeIn });
    x = -2200 * p;
    blur = 40 * Math.sin(Math.PI * Math.min(1, p));
  }
  if (enterAt !== null && f < enterAt + len) {
    const p = interpolate(f, [enterAt, enterAt + len], [0, 1], { ...clamp, easing: ease });
    x = 2200 * (1 - p);
    blur = 40 * (1 - p);
  }
  return { transform: `translateX(${x}px)`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined };
};

/** RGB-split glitch overlay for a few frames around a cut. */
export const Glitch: React.FC<{ at: number; len?: number }> = ({ at, len = 6 }) => {
  const f = useCurrentFrame();
  if (f < at - 2 || f > at + len) return null;
  const rnd = (n: number) => {
    const v = Math.sin((f + 1) * 12.9898 + n * 78.233) * 43758.5453;
    return v - Math.floor(v);
  };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 7 }, (_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${rnd(i) * 100}%`,
            height: 6 + rnd(i + 9) * 60,
            background: i % 2 ? "rgba(40,215,255,0.35)" : "rgba(255,61,82,0.35)",
            transform: `translateX(${(rnd(i + 3) - 0.5) * 260}px)`,
            mixBlendMode: "screen",
          }}
        />
      ))}
      <AbsoluteFill style={{ background: "white", opacity: f === at ? 0.18 : 0 }} />
    </AbsoluteFill>
  );
};

/** Warm light-leak flash. */
export const LightLeak: React.FC<{ at: number; len?: number }> = ({ at, len = 16 }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [at - len / 2, at, at + len / 2], [0, 1, 0], clamp);
  if (o <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        mixBlendMode: "screen",
        opacity: o,
        background: `radial-gradient(ellipse at ${30 + (f - at) * 3}% 40%, rgba(255,190,110,1) 0%, rgba(255,90,40,0.6) 35%, rgba(0,0,0,0) 70%)`,
      }}
    />
  );
};

/** Burned-in captions (short phrases, bottom centre). */
export type Phrase = { s: number; e: number; t: string };
export const Captions: React.FC<{ phrases: Phrase[] }> = ({ phrases }) => {
  const f = useCurrentFrame();
  const now = f / 30;
  const p = phrases.find((x) => now >= x.s - 0.05 && now <= x.e + 0.25);
  if (!p) return null;
  const o = interpolate(now, [p.s - 0.05, p.s + 0.08, p.e + 0.12, p.e + 0.25], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 74, display: "flex", justifyContent: "center", opacity: o }}>
      <div
        style={{
          fontFamily: INTER,
          fontWeight: 600,
          fontSize: 42,
          color: C.ink,
          padding: "10px 26px",
          borderRadius: 12,
          background: "rgba(5,7,10,0.62)",
          backdropFilter: "blur(6px)",
          textShadow: "0 2px 8px rgba(0,0,0,0.6)",
          letterSpacing: 0.2,
        }}
      >
        {p.t}
      </div>
    </div>
  );
};
