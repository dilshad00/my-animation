import React from "react";
import { SvgLayer } from "../camera/Camera";
import { darken, lighten } from "../../utils/color";
import { smoothPath, useSvgId, type Pt } from "../../utils/svg";
import { ObjectView } from "../objects/registry";
import { rnd, WORLD_L, WORLD_R, WORLD_W, type EnvProps } from "./common";

const StarField: React.FC<{ seed: number; t: number; count: number; key2: string; size: number; spread?: number }> = ({ seed, t, count, key2, size, spread = 1 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => {
      const x = WORLD_L - 600 + rnd(seed, key2 + "x" + i) * (WORLD_W + 1200) * spread;
      const y = -600 + rnd(seed, key2 + "y" + i) * 2200;
      const tw = 0.5 + 0.5 * Math.sin(t * (0.8 + rnd(seed, key2 + "t" + i) * 2.5) + i);
      const r = size * (0.4 + rnd(seed, key2 + "r" + i));
      const tint = rnd(seed, key2 + "c" + i);
      return <circle key={i} cx={x} cy={y} r={r} fill={tint > 0.85 ? "#ffd6a5" : tint > 0.7 ? "#bde0fe" : "#ffffff"} opacity={0.35 + 0.65 * tw} />;
    })}
  </>
);

export const Planet: React.FC<{ x: number; y: number; r: number; color: string; ring?: boolean; t: number; bands?: boolean }> = ({ x, y, r, color, ring, t, bands }) => {
  const g = useSvgId("pl");
  const clip = useSvgId("plc");
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <radialGradient id={g} cx="0.35" cy="0.35" r="0.8">
          <stop offset="0" stopColor={lighten(color, 0.3)} />
          <stop offset="0.6" stopColor={color} />
          <stop offset="1" stopColor={darken(color, 0.6)} />
        </radialGradient>
        <clipPath id={clip}>
          <circle r={r} />
        </clipPath>
      </defs>
      <circle r={r * 1.18} fill={color} opacity={0.12} />
      {ring ? <ellipse rx={r * 1.9} ry={r * 0.42} fill="none" stroke={lighten(color, 0.4)} strokeWidth={r * 0.14} opacity={0.6} transform="rotate(-14)" /> : null}
      <circle r={r} fill={`url(#${g})`} />
      {bands ? (
        <g clipPath={`url(#${clip})`} opacity={0.35}>
          {[-0.5, -0.15, 0.25, 0.55].map((k, i) => (
            <rect key={i} x={-r + ((t * 6) % 40) - 20} y={k * r} width={r * 2 + 40} height={r * 0.12 + i * 4} fill={darken(color, 0.25)} />
          ))}
        </g>
      ) : null}
      {ring ? (
        <path d={`M${-r * 1.9},0 A${r * 1.9},${r * 0.42} 0 0 0 ${r * 1.9},0`} fill="none" stroke={lighten(color, 0.4)} strokeWidth={r * 0.14} opacity={0.75} transform="rotate(-14)" />
      ) : null}
    </g>
  );
};

export const Space: React.FC<EnvProps> = ({ t, seed, spec }) => {
  const bg = useSvgId("spc");
  const neb1 = useSvgId("nb1");
  const neb2 = useSvgId("nb2");
  const showEarth = spec.props?.earth === true;
  return (
    <>
      <SvgLayer depth={0}>
        <defs>
          <radialGradient id={bg} cx="0.5" cy="0.5" r="0.9">
            <stop offset="0" stopColor="#141a3c" />
            <stop offset="1" stopColor="#03040c" />
          </radialGradient>
          <radialGradient id={neb1}>
            <stop offset="0" stopColor="#7b2cbf" stopOpacity={0.55} />
            <stop offset="1" stopColor="#7b2cbf" stopOpacity={0} />
          </radialGradient>
          <radialGradient id={neb2}>
            <stop offset="0" stopColor="#00b4d8" stopOpacity={0.4} />
            <stop offset="1" stopColor="#00b4d8" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect x={-2000} y={-1500} width={6000} height={4000} fill={`url(#${bg})`} />
        <ellipse cx={500} cy={300} rx={700} ry={360} fill={`url(#${neb1})`} transform={`rotate(${-20 + t * 0.3} 500 300)`} />
        <ellipse cx={1500} cy={760} rx={800} ry={300} fill={`url(#${neb2})`} transform={`rotate(${15 - t * 0.2} 1500 760)`} />
        <ellipse cx={1100} cy={420} rx={420} ry={180} fill={`url(#${neb1})`} opacity={0.5} />
      </SvgLayer>
      <SvgLayer depth={0.05}>
        <StarField seed={seed} t={t} count={260} key2="a" size={1.6} />
      </SvgLayer>
      <SvgLayer depth={0.15}>
        <StarField seed={seed} t={t} count={110} key2="b" size={2.6} />
        <Planet x={1520} y={260} r={110} color="#e76f51" ring t={t} bands />
        {/* comet */}
        {(() => {
          const ph = (t * 0.08) % 1;
          const cx = -200 + ph * 2600;
          const cy = 80 + ph * 500;
          return (
            <g opacity={ph < 0.9 ? 1 : (1 - ph) * 10}>
              <path d={`M${cx},${cy} L${cx - 260},${cy - 60} L${cx - 250},${cy - 40} Z`} fill="#bde0fe" opacity={0.5} />
              <circle cx={cx} cy={cy} r={8} fill="#fff" />
            </g>
          );
        })()}
      </SvgLayer>
      <SvgLayer depth={0.35}>
        <Planet x={300} y={820} r={70} color="#8ecae6" t={t} />
        <circle cx={300 + Math.cos(t * 0.5) * 130} cy={820 + Math.sin(t * 0.5) * 40} r={14} fill="#adb5bd" />
      </SvgLayer>
      {showEarth ? (
        <SvgLayer depth={0.6}>
          <g transform="translate(960 1500) scale(5.5)">
            <ObjectView type="globe" t={t} speed={0.15} lighting={0} />
          </g>
          <ellipse cx={960} cy={1500} rx={800} ry={800} fill="none" stroke="#8ecae6" strokeWidth={40} opacity={0.15} />
        </SvgLayer>
      ) : null}
    </>
  );
};

/** Alien / Mars-like planet surface */
export const PlanetSurface: React.FC<EnvProps> = ({ t, seed, spec }) => {
  const sky = useSvgId("ps");
  const ground = (spec.color as string) ?? "#c1440e";
  const hill = (y: number, amp: number, k: string) => {
    const pts: Pt[] = [];
    for (let x = WORLD_L - 900; x <= WORLD_R + 900; x += 300) pts.push([x, y - rnd(seed, k + x) * amp]);
    return `${smoothPath(pts, false)} L${WORLD_R + 900},2400 L${WORLD_L - 900},2400 Z`;
  };
  return (
    <>
      <SvgLayer depth={0.02}>
        <defs>
          <linearGradient id={sky} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#1a0b2e" />
            <stop offset="0.6" stopColor="#7a2e4a" />
            <stop offset="1" stopColor="#f08a5d" />
          </linearGradient>
        </defs>
        <rect x={-2000} y={-1500} width={6000} height={4000} fill={`url(#${sky})`} />
        <StarField seed={seed} t={t} count={120} key2="p" size={1.6} />
        <Planet x={1450} y={250} r={180} color="#5e60ce" ring t={t} bands />
        <circle cx={420} cy={180} r={40} fill="#ffe8d6" opacity={0.9} />
      </SvgLayer>
      <SvgLayer depth={0.2}>
        <path d={hill(640, 200, "a")} fill={darken(ground, 0.45)} opacity={0.85} />
      </SvgLayer>
      <SvgLayer depth={0.5}>
        <path d={hill(760, 120, "b")} fill={darken(ground, 0.25)} />
        <g transform="translate(1700 760)">
          <path d="M-180,0 A180,150 0 0,1 180,0 Z" fill="#dfe7fd" fillOpacity={0.35} stroke="#dfe7fd" strokeWidth={6} />
          <rect x={-60} y={-60} width={120} height={60} fill="#adb5bd" />
          <rect x={-30} y={-40} width={60} height={40} fill="#ffd166" opacity={0.6 + 0.3 * Math.sin(t * 3)} />
        </g>
      </SvgLayer>
      <SvgLayer depth={1}>
        <path d={hill(880, 40, "c")} fill={ground} />
        {Array.from({ length: 10 }).map((_, i) => {
          const x = WORLD_L + i * 520 + rnd(seed, "cr" + i) * 200;
          const y = 940 + rnd(seed, "cy" + i) * 80;
          const r = 40 + rnd(seed, "crr" + i) * 50;
          return (
            <g key={i}>
              <ellipse cx={x} cy={y} rx={r} ry={r * 0.25} fill={darken(ground, 0.3)} />
              <ellipse cx={x} cy={y - 3} rx={r * 0.8} ry={r * 0.18} fill={darken(ground, 0.18)} />
            </g>
          );
        })}
        {Array.from({ length: 8 }).map((_, i) => (
          <g key={"r" + i} transform={`translate(${WORLD_L + 300 + i * 640} ${910 + (i % 2) * 40}) scale(${0.3 + rnd(seed, "rs" + i) * 0.3})`}>
            <ObjectView type="rock" t={t} color={darken(ground, 0.1)} lighting={0} />
          </g>
        ))}
      </SvgLayer>
    </>
  );
};
