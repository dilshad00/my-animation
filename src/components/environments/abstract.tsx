import React from "react";
import { SvgLayer } from "../camera/Camera";
import { darken, lighten, withAlpha } from "../../utils/color";
import { useSvgId } from "../../utils/svg";
import { rnd, type EnvProps } from "./common";

/**
 * Clean presentation backdrop for diagrams / talking-head moments.
 * Uses spec.color as the base tint.
 */
export const Studio: React.FC<EnvProps> = ({ t, seed, spec }) => {
  const base = (spec.color as string) ?? "#1d3557";
  const bg = useSvgId("st");
  const floor = useSvgId("stf");
  const spot = useSvgId("sts");
  return (
    <>
      <SvgLayer depth={0.02}>
        <defs>
          <radialGradient id={bg} cx="0.5" cy="0.38" r="0.85">
            <stop offset="0" stopColor={lighten(base, 0.25)} />
            <stop offset="1" stopColor={darken(base, 0.45)} />
          </radialGradient>
        </defs>
        <rect x={-2000} y={-1500} width={6000} height={4000} fill={`url(#${bg})`} />
      </SvgLayer>
      <SvgLayer depth={0.15}>
        {Array.from({ length: 9 }).map((_, i) => {
          const x = rnd(seed, "bx" + i) * 2400 - 240 + Math.sin(t * 0.3 + i) * 40;
          const y = rnd(seed, "by" + i) * 900 + Math.cos(t * 0.25 + i) * 30;
          const r = 60 + rnd(seed, "br" + i) * 200;
          return <circle key={i} cx={x} cy={y} r={r} fill={lighten(base, 0.35)} opacity={0.07 + rnd(seed, "bo" + i) * 0.06} />;
        })}
        {Array.from({ length: 14 }).map((_, i) => {
          const x = rnd(seed, "dx" + i) * 2200 - 140;
          const y = (rnd(seed, "dy" + i) * 1000 - t * (8 + i)) % 1100;
          return <circle key={"d" + i} cx={x} cy={y < -50 ? y + 1150 : y} r={4 + (i % 3) * 2} fill="#fff" opacity={0.15} />;
        })}
      </SvgLayer>
      <SvgLayer depth={1}>
        <defs>
          <linearGradient id={floor} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={darken(base, 0.2)} />
            <stop offset="1" stopColor={darken(base, 0.55)} />
          </linearGradient>
          <radialGradient id={spot}>
            <stop offset="0" stopColor="#ffffff" stopOpacity={0.22} />
            <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect x={-1600} y={900} width={5120} height={800} fill={`url(#${floor})`} />
        <rect x={-1600} y={898} width={5120} height={4} fill={lighten(base, 0.4)} opacity={0.4} />
        <ellipse cx={960} cy={930} rx={760} ry={90} fill={`url(#${spot})`} />
      </SvgLayer>
    </>
  );
};

/** Technical blueprint grid backdrop. */
export const Blueprint: React.FC<EnvProps> = ({ t, spec }) => {
  const base = (spec.color as string) ?? "#0b3d91";
  const bg = useSvgId("bp");
  const lines = withAlpha("#ffffff", 0.08);
  const major = withAlpha("#ffffff", 0.16);
  return (
    <>
      <SvgLayer depth={0.02}>
        <defs>
          <radialGradient id={bg} cx="0.5" cy="0.45" r="0.9">
            <stop offset="0" stopColor={lighten(base, 0.12)} />
            <stop offset="1" stopColor={darken(base, 0.5)} />
          </radialGradient>
        </defs>
        <rect x={-2000} y={-1500} width={6000} height={4000} fill={`url(#${bg})`} />
      </SvgLayer>
      <SvgLayer depth={0.5}>
        {Array.from({ length: 110 }).map((_, i) => (
          <line key={"v" + i} x1={-1800 + i * 50} y1={-1200} x2={-1800 + i * 50} y2={2400} stroke={i % 5 ? lines : major} strokeWidth={i % 5 ? 1 : 2} />
        ))}
        {Array.from({ length: 72 }).map((_, i) => (
          <line key={"h" + i} x1={-1800} y1={-1200 + i * 50} x2={3800} y2={-1200 + i * 50} stroke={i % 5 ? lines : major} strokeWidth={i % 5 ? 1 : 2} />
        ))}
        <rect x={-1800} y={((t * 60) % 3600) - 1200} width={5600} height={3} fill="#9bf6ff" opacity={0.25} />
      </SvgLayer>
    </>
  );
};

/** Smooth two-colour gradient – the most neutral backdrop. */
export const Gradient: React.FC<EnvProps> = ({ t, spec }) => {
  const a = (spec.color as string) ?? "#3a0ca3";
  const b = (spec.props?.color2 as string) ?? "#f72585";
  const g = useSvgId("gr");
  return (
    <SvgLayer depth={0}>
      <defs>
        <linearGradient id={g} x1="0" x2="1" y1="0" y2="1" gradientTransform={`rotate(${Math.sin(t * 0.2) * 8} 0.5 0.5)`}>
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
      <rect x={-2000} y={-1500} width={6000} height={4000} fill={`url(#${g})`} />
    </SvgLayer>
  );
};
