/** Photoreal 2.5D hero layers for UG-003 (AI-generated stills animated: push-in, bloom, light sweep, embers). */
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile } from "remotion";

const img = (n: string) => staticFile(`ug-003/img/${n}`);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Smoky textured background plate (replaces the flat grid stage). */
export const Plate: React.FC<{ f: number; accent?: string; x?: number; y?: number; dim?: number }> = ({ f, accent = "rgba(40,215,255,0.14)", x = 60, y = 45, dim = 0.5 }) => (
  <AbsoluteFill style={{ backgroundColor: "#05070a", overflow: "hidden" }}>
    <Img src={img("plate.jpg")} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", opacity: dim, transform: `scale(${1.12 + Math.sin(f * 0.004) * 0.03}) translate(${Math.sin(f * 0.003) * 14}px, ${Math.cos(f * 0.0025) * 8}px)` }} />
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${x}% ${y}%, ${accent}, transparent 62%)`, mixBlendMode: "screen" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.65) 100%)" }} />
  </AbsoluteFill>
);

/** Deterministic rising embers. */
export const Embers: React.FC<{ f: number; color?: string; n?: number; speed?: number; opacity?: number }> = ({ f, color = "#ff7a3d", n = 46, speed = 1, opacity = 1 }) => (
  <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
    {Array.from({ length: n }, (_, i) => {
      const r = (k: number) => {
        const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
        return v - Math.floor(v);
      };
      const life = 160 + r(1) * 200;
      const t = ((f * speed + r(2) * life) % life) / life;
      const x = r(3) * 1920 + Math.sin(f * 0.02 + i) * 30 * r(4);
      const y = 1120 - t * (700 + r(5) * 600);
      const s = 2 + r(6) * 5;
      const a = Math.sin(t * Math.PI) * (0.4 + r(7) * 0.6);
      return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: "50%", background: color, opacity: a, boxShadow: `0 0 ${s * 3}px ${color}, 0 0 ${s * 6}px ${color}` }} />;
    })}
  </AbsoluteFill>
);

/**
 * A photoreal still animated as a hero shot.
 * k: 0 = image a, 1 = image b (crossfade). zoom/pan animate from→to across [0, d].
 */
export const HeroShot: React.FC<{
  f: number;
  d: number;
  a: string;
  b?: string;
  k?: number;
  zoom?: [number, number];
  pan?: [number, number, number, number];
  origin?: string;
  sweepAt?: number;
  bloom?: number;
  dim?: number;
  tilt?: [number, number];
}> = ({ f, d, a, b, k = 0, tilt = [-5, 4], zoom = [1.04, 1.14], pan = [0, 0, 0, 0], origin = "62% 55%", sweepAt = 10, bloom = 0.35, dim = 0 }) => {
  const t = interpolate(f, [0, Math.max(1, d)], [0, 1], clamp);
  const e = 1 - Math.pow(1 - t, 2.2);
  const z = zoom[0] + (zoom[1] - zoom[0]) * e;
  const px = pan[0] + (pan[2] - pan[0]) * e;
  const py = pan[1] + (pan[3] - pan[1]) * e;
  const ry = (tilt[0] + (tilt[1] - tilt[0]) * e) + Math.sin(f * 0.02) * 0.6;
  const rx = 2 + Math.cos(f * 0.017) * 0.8;
  const tf = `perspective(1400px) translate(${px}px, ${py}px) rotateY(${ry}deg) rotateX(${rx}deg) scale(${z * 1.1})`;
  const sw = interpolate(f, [sweepAt, sweepAt + 34], [-0.4, 1.4], clamp);
  const layer = (src: string, op: number) => (
    <AbsoluteFill style={{ opacity: op }}>
      <Img src={img(src)} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", transform: tf, transformOrigin: origin, filter: `brightness(${1 - dim})` }} />
      {/* bloom: blurred copy screened on top */}
      <Img src={img(src)} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", transform: tf, transformOrigin: origin, filter: "blur(28px) saturate(1.6)", mixBlendMode: "screen", opacity: bloom }} />
    </AbsoluteFill>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      {layer(a, 1)}
      {b ? layer(b, k) : null}
      {/* light sweep */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(105deg, transparent ${sw * 100 - 14}%, rgba(255,255,255,0.55) ${sw * 100}%, transparent ${sw * 100 + 14}%)`,
          mixBlendMode: "overlay",
          opacity: sw > -0.4 && sw < 1.4 ? 1 : 0,
        }}
      />
    </AbsoluteFill>
  );
};
