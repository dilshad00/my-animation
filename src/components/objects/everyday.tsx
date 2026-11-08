import React from "react";
import { random } from "remotion";
import { darken, lighten, mix } from "../../utils/color";
import { ease } from "../../utils/easing";
import { FONT_FAMILY } from "../../utils/fonts";
import { tweenColor, tweenNum } from "../../utils/tween";
import type { ObjectDef, ObjectProps } from "./types";
import { num, str } from "./types";

/*
 * Everyday & story props. Animatable props accept [[t, v], …] keyframes in
 * seconds since the object appeared (`local`).
 */

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Ground puddle with rain ripples. Props: { "size": 1, "grow": 0 (s to spread out), "ripples": true } color = liquid */
export const Puddle: React.FC<ObjectProps> = ({ t, local, color, props, L, seed }) => {
  const c = L(tweenColor(color ?? props.color, local, "#4f8fc0"));
  const grow = num(props.grow, 0);
  const k = grow > 0 ? ease("out", local / grow) : 1;
  const sz = tweenNum(props.size, local, 1) * Math.max(0.02, k);
  return (
    <g transform={`scale(${sz} ${sz})`}>
      <path d="M-150,0 Q-160,-22 -90,-26 Q-20,-36 60,-28 Q160,-24 155,-2 Q150,22 60,24 Q-30,32 -110,20 Q-155,14 -150,0 Z" fill={darken(c, 0.12)} />
      <path d="M-138,-2 Q-140,-18 -84,-20 Q-14,-28 58,-22 Q140,-18 138,-2 Q134,14 56,18 Q-26,24 -100,14 Q-138,10 -138,-2 Z" fill={c} />
      <ellipse cx={-40} cy={-10} rx={50} ry={5} fill="#ffffff" opacity={0.25} />
      {props.ripples !== false
        ? Array.from({ length: 4 }).map((_, i) => {
            const ph = (t * 0.9 + random(`${seed}pr${i}`)) % 1;
            const x = -100 + random(`${seed}px${i}`) * 200;
            const y = -10 + random(`${seed}py${i}`) * 20;
            return <ellipse key={i} cx={x} cy={y} rx={6 + ph * 36} ry={2 + ph * 7} fill="none" stroke={lighten(c, 0.5)} strokeWidth={2.5} opacity={0.8 * (1 - ph)} />;
          })
        : null}
    </g>
  );
};

/** Centre-anchored liquid drop that wobbles. color = liquid. Props: { "face": false } */
export const Drop: React.FC<ObjectProps> = ({ t, color, props, L }) => {
  const c = L(color ?? "#4f8fc0");
  const w = 1 + Math.sin(t * 6) * 0.03;
  return (
    <g transform={`scale(${w} ${2 - w})`}>
      <path d="M0,-90 C20,-55 62,-15 62,22 C62,58 34,82 0,82 C-34,82 -62,58 -62,22 C-62,-15 -20,-55 0,-90 Z" fill={c} stroke={darken(c, 0.25)} strokeWidth={5} />
      <path d="M-30,10 C-30,-10 -18,-30 -8,-42" stroke="#ffffff" strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.55} />
      {props.face === true ? (
        <g>
          <circle cx={-18} cy={24} r={6} fill="#1d1d1d" />
          <circle cx={18} cy={24} r={6} fill="#1d1d1d" />
          <path d="M-12,44 Q0,54 12,44" stroke="#1d1d1d" strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
      ) : null}
    </g>
  );
};

/** Ground isometric cube (scale comparisons). Props: { "label": "1 km", "fill": 1 (liquid level 0..1, animatable), "glass": false } color = cube / liquid colour */
export const Cube: React.FC<ObjectProps> = ({ local, color, props, L }) => {
  const c = L(color ?? "#9b111e");
  const glass = props.glass === true;
  const fill = clamp01(tweenNum(props.fill, local, 1));
  const E = 160; // edge length
  // x, z ∈ [0,1] across the base, y ∈ [0,1] up; the front-bottom corner sits on the origin
  const iso = ([x, y, z]: [number, number, number]): string => `${(x - z) * E * 0.87},${(x + z - 2) * E * 0.5 - y * E}`;
  const face = (pts: [number, number, number][]) => pts.map(iso).join(" ");
  const h = glass ? fill : 1;
  return (
    <g>
      <ellipse cx={0} cy={-E * 0.5} rx={E * 1.15} ry={E * 0.5} fill="#000" opacity={0.15} />
      {h > 0 ? (
        <>
          <polygon points={face([[0, 0, 1], [1, 0, 1], [1, h, 1], [0, h, 1]])} fill={darken(c, 0.08)} />
          <polygon points={face([[1, 0, 0], [1, 0, 1], [1, h, 1], [1, h, 0]])} fill={darken(c, 0.28)} />
          <polygon points={face([[0, h, 0], [1, h, 0], [1, h, 1], [0, h, 1]])} fill={lighten(c, 0.12)} />
        </>
      ) : null}
      {glass ? (
        <g fill="none" stroke="#e9f4ff" strokeWidth={4} strokeLinejoin="round" opacity={0.9}>
          <polygon points={face([[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]])} />
          <polyline points={face([[0, 0, 1], [0, 1, 1]])} />
          <polyline points={face([[1, 0, 1], [1, 1, 1]])} />
          <polyline points={face([[1, 0, 0], [1, 1, 0]])} />
          <polyline points={face([[0, 0, 1], [1, 0, 1], [1, 0, 0]])} />
        </g>
      ) : null}
      {props.label ? (
        <text x={E * 1.0} y={-E * 1.55} fontFamily={FONT_FAMILY} fontWeight={800} fontSize={46} fill="#ffffff" stroke="rgba(0,0,0,0.45)" strokeWidth={6} paintOrder="stroke">
          {String(props.label)}
        </text>
      ) : null}
    </g>
  );
};

/** Ground-standing open umbrella with drops sliding off. Props: { "open": 1 (animatable) } color = canopy */
export const Umbrella: React.FC<ObjectProps> = ({ t, local, color, props, L, seed }) => {
  const c = L(color ?? "#264653");
  const open = clamp01(tweenNum(props.open, local, 1));
  const wdt = 30 + open * 170;
  const top = -300 + (1 - open) * 30;
  return (
    <g>
      <rect x={-4} y={top} width={8} height={-top - 30} fill={L("#3d3d3d")} />
      <path d="M4,-30 Q4,0 -20,0 Q-36,0 -36,-16" stroke={L("#5c4033")} strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d={`M${-wdt},${top + 90} Q${-wdt},${top - 10} 0,${top - 20} Q${wdt},${top - 10} ${wdt},${top + 90} Q${wdt * 0.75},${top + 70} ${wdt * 0.5},${top + 90} Q${wdt * 0.25},${top + 70} 0,${top + 90} Q${-wdt * 0.25},${top + 70} ${-wdt * 0.5},${top + 90} Q${-wdt * 0.75},${top + 70} ${-wdt},${top + 90} Z`} fill={c} />
      {[-0.5, 0, 0.5].map((k, i) => (
        <path key={i} d={`M0,${top - 20} Q${wdt * k * 0.9},${top + 10} ${wdt * k},${top + 90}`} stroke={darken(c, 0.2)} strokeWidth={3} fill="none" />
      ))}
      <rect x={-3} y={top - 44} width={6} height={26} rx={3} fill={L("#3d3d3d")} />
      {open > 0.9
        ? [-1, 1].map((side) => {
            const ph = (t * 1.3 + random(`${seed}${side}`)) % 1;
            return <ellipse key={side} cx={side * wdt} cy={top + 95 + ph * 260} rx={5} ry={8} fill={L(props.drip ? String(props.drip) : "#9cc3e6")} opacity={1 - ph} />;
          })
        : null}
    </g>
  );
};

/** Centre-anchored meteor with a fiery trail (flies toward +x, down). Props: { "angle": 30 } */
export const Meteor: React.FC<ObjectProps> = ({ t, props, L, seed }) => {
  const a = num(props.angle, 30);
  return (
    <g transform={`rotate(${a})`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <path key={i} d={`M0,${-30 + i * 15} Q-180,${-40 + i * 20 + Math.sin(t * 20 + i) * 6} ${-380 + i * 30},${-10 + i * 5}`} stroke={["#ffd166", "#f77f00", "#e85d04", "#ffba08", "#dc2f02"][i]} strokeWidth={22 - i * 3} strokeLinecap="round" fill="none" opacity={0.75} />
      ))}
      <circle r={52} fill={L("#5a4a42")} />
      {Array.from({ length: 5 }).map((_, i) => (
        <circle key={i} cx={-24 + random(`${seed}m${i}`) * 48} cy={-24 + random(`${seed}mm${i}`) * 48} r={6 + random(`${seed}r${i}`) * 8} fill={L("#3d322c")} />
      ))}
      <circle r={58} fill="none" stroke="#ffb703" strokeWidth={6} opacity={0.6 + 0.4 * Math.sin(t * 25)} />
    </g>
  );
};

/** Centre-anchored parchment that unrolls. Props: { "lines": ["…", "…"], "unroll": 1 (seconds) } */
export const Scroll: React.FC<ObjectProps> = ({ local, props, L }) => {
  const k = ease("out", local / num(props.unroll, 1));
  const H = 40 + 460 * k;
  const lines = Array.isArray(props.lines) ? (props.lines as string[]) : [];
  return (
    <g>
      <rect x={-200} y={-H / 2} width={400} height={H} fill={L("#f1e3c2")} />
      <rect x={-200} y={-H / 2} width={400} height={H} fill="none" stroke={L("#c9a86a")} strokeWidth={4} />
      <g clipPath="none" opacity={k}>
        {lines.length
          ? lines.map((ln, i) => (
              <text key={i} x={0} y={-H / 2 + 70 + i * 50} textAnchor="middle" fontFamily="Georgia, serif" fontStyle="italic" fontSize={34} fill={L("#5c4033")} opacity={-H / 2 + 70 + i * 50 < H / 2 - 30 ? 1 : 0}>
                {ln}
              </text>
            ))
          : Array.from({ length: 8 }).map((_, i) => {
              const y = -H / 2 + 60 + i * 50;
              return y < H / 2 - 30 ? <path key={i} d={`M-150,${y} Q-50,${y - 6} 40,${y} T150,${y}`} stroke={L("#8a6d45")} strokeWidth={5} fill="none" opacity={0.6} /> : null;
            })}
      </g>
      {[-1, 1].map((side) => (
        <g key={side}>
          <rect x={-220} y={side * H / 2 - 22} width={440} height={44} rx={22} fill={L("#e0c690")} />
          <rect x={-232} y={side * H / 2 - 14} width={464} height={28} rx={14} fill={L("#8a5a3c")} />
        </g>
      ))}
    </g>
  );
};

/** Centre-anchored petri dish (top view); colonies bloom. Props: { "agar": "#b5121b", "colonies": 18, "grow": 4 (s), "colony": "#f4e9c9" } */
export const PetriDish: React.FC<ObjectProps> = ({ local, props, L, seed }) => {
  const agar = L(str(props.agar, "#b5121b"));
  const n = num(props.colonies, 18);
  const grow = num(props.grow, 4);
  const col = L(str(props.colony, "#f4e9c9"));
  return (
    <g>
      <ellipse cx={8} cy={14} rx={250} ry={250} fill="#000" opacity={0.15} />
      <circle r={240} fill="#e9f4ff" opacity={0.5} stroke="#ffffff" strokeWidth={8} />
      <circle r={220} fill={agar} />
      <circle r={220} fill="none" stroke={darken(agar, 0.25)} strokeWidth={6} />
      {Array.from({ length: n }).map((_, i) => {
        const a = random(`${seed}a${i}`) * 6.28;
        const d = Math.sqrt(random(`${seed}d${i}`)) * 180;
        const start = random(`${seed}s${i}`) * grow * 0.6;
        const k = ease("out", (local - start) / (grow * 0.5));
        const r = (8 + random(`${seed}r${i}`) * 26) * k;
        return r > 0.5 ? (
          <g key={i}>
            <circle cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={r + 4} fill={mix(col, agar, 0.55)} />
            <circle cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={r} fill={col} />
          </g>
        ) : null;
      })}
      <path d="M-150,-150 A215,215 0 0 1 60,-205" stroke="#ffffff" strokeWidth={14} fill="none" opacity={0.35} strokeLinecap="round" />
    </g>
  );
};

/** Centre-anchored single bacterium (rod) that wriggles; splits in two at props.divide seconds. color = body */
export const Bacterium: React.FC<ObjectProps> = ({ t, local, color, props, L }) => {
  const c = L(color ?? "#6a994e");
  const div = num(props.divide, -1);
  const k = div >= 0 ? ease("inOut", (local - div) / 1.2) : 0;
  const body = (dx: number, len: number) => (
    <g transform={`translate(${dx} 0)`}>
      <path d={`M${-len / 2 - 10},0 Q${-len / 2 - 40},${Math.sin(t * 10) * 14} ${-len / 2 - 70},0 T${-len / 2 - 130},0`} stroke={darken(c, 0.3)} strokeWidth={5} fill="none" strokeLinecap="round" />
      <rect x={-len / 2} y={-38} width={len} height={76} rx={38} fill={c} stroke={darken(c, 0.25)} strokeWidth={5} />
      <rect x={-len / 2 + 18} y={-24} width={len * 0.5} height={14} rx={7} fill={lighten(c, 0.35)} opacity={0.7} />
      {Array.from({ length: 4 }).map((_, i) => (
        <circle key={i} cx={-len / 2 + 30 + i * (len - 60) / 3} cy={10 + (i % 2) * 8} r={7} fill={darken(c, 0.3)} opacity={0.6} />
      ))}
    </g>
  );
  return (
    <g transform={`rotate(${Math.sin(t * 1.5) * 6})`}>
      {k <= 0 ? body(0, 200 + Math.max(0, Math.min(1, (local - div + 1.5) / 1.5)) * (div >= 0 ? 60 : 0)) : (
        <>
          {body(-75 - k * 60, 150)}
          {body(75 + k * 60, 150)}
        </>
      )}
    </g>
  );
};

/** Centre-anchored red blood cell (biconcave disc) that tumbles slowly. */
export const BloodCell: React.FC<ObjectProps> = ({ t, color, L }) => {
  const c = L(color ?? "#c1121f");
  const tilt = 0.25 + Math.abs(Math.sin(t * 0.8)) * 0.75;
  return (
    <g transform={`scale(1 ${tilt})`}>
      <circle r={110} fill={c} />
      <circle r={110} fill="none" stroke={darken(c, 0.35)} strokeWidth={8} />
      <circle r={60} fill={darken(c, 0.18)} />
      <ellipse cx={-35} cy={-55} rx={40} ry={16} fill="#ffffff" opacity={0.25} />
    </g>
  );
};

/** Centre-anchored red-algae spore (Trentepohlia-like). */
export const Spore: React.FC<ObjectProps> = ({ t, local, color, props, L, seed }) => {
  const c = L(tweenColor(props.tint ?? color, local, "#c2410c"));
  return (
    <g transform={`rotate(${t * 6})`}>
      <circle r={118} fill="#f1d3b3" opacity={0.5} stroke={L("#b5651d")} strokeWidth={4} />
      <circle r={96} fill={c} />
      <circle r={74} cx={-10} cy={-10} fill={lighten(c, 0.18)} opacity={0.8} />
      {Array.from({ length: 16 }).map((_, i) => {
        const a = random(`${seed}g${i}`) * 6.28;
        const d = Math.sqrt(random(`${seed}gd${i}`)) * 70;
        return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={5 + random(`${seed}gr${i}`) * 7} fill={i % 3 ? darken(c, 0.4) : "#fdba74"} opacity={0.75} />;
      })}
      <ellipse cx={-40} cy={-45} rx={22} ry={12} fill="#ffffff" opacity={0.45} transform="rotate(-35 -40 -45)" />
    </g>
  );
};

/** Ground lab beaker with liquid. Props: { "level": 0.6 (animatable), "bubbles": true, "label": "" } color = liquid */
export const Beaker: React.FC<ObjectProps> = ({ t, local, color, props, L, seed }) => {
  const c = L(tweenColor(color ?? props.color, local, "#4f8fc0"));
  const level = clamp01(tweenNum(props.level, local, 0.6));
  const top = -260;
  const ly = -10 + (top + 30) * level;
  return (
    <g>
      <ellipse cx={0} cy={0} rx={110} ry={10} fill="#000" opacity={0.15} />
      <path d={`M-90,${ly} L-90,-14 Q-90,0 -76,0 L76,0 Q90,0 90,-14 L90,${ly} Z`} fill={c} opacity={0.9} />
      <ellipse cx={0} cy={ly} rx={90} ry={8 + Math.sin(t * 3) * 1.5} fill={lighten(c, 0.2)} />
      {props.bubbles !== false
        ? Array.from({ length: 6 }).map((_, i) => {
            const ph = (t * 0.7 + random(`${seed}b${i}`)) % 1;
            const y = -10 + (ly + 10) * ph;
            return <circle key={i} cx={-60 + random(`${seed}bx${i}`) * 120} cy={y} r={4 + random(`${seed}br${i}`) * 6} fill="#ffffff" opacity={0.5 * (1 - ph)} />;
          })
        : null}
      <path d={`M-100,${top} L-90,${top + 14} L-90,-14 Q-90,0 -76,0 L76,0 Q90,0 90,-14 L90,${top + 14} L100,${top}`} fill="none" stroke="#e9f4ff" strokeWidth={7} strokeLinejoin="round" opacity={0.9} />
      {[0.25, 0.5, 0.75].map((k, i) => (
        <path key={i} d={`M60,${-10 + (top + 30) * k} h24`} stroke="#e9f4ff" strokeWidth={4} opacity={0.8} />
      ))}
      <rect x={-78} y={top + 20} width={14} height={-top - 40} rx={7} fill="#ffffff" opacity={0.25} />
      {props.label ? (
        <text x={-20} y={-60} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={34} fill="#ffffff">
          {String(props.label)}
        </text>
      ) : null}
    </g>
  );
};

/** Centre-anchored dial gauge. Props: { "value": 0.8 (0..1, animatable), "label": "O₂", "low": "0", "high": "100%" } — needle colours by zone */
export const Gauge: React.FC<ObjectProps> = ({ t, local, props, L }) => {
  const v = clamp01(tweenNum(props.value, local, 0.7));
  const a = -120 + v * 240 + Math.sin(t * 9) * 1.2;
  const zone = v < 0.25 ? "#e63946" : v < 0.55 ? "#f4a261" : "#2a9d8f";
  const arc = (from: number, to: number, c: string) => {
    const r = 150;
    const p = (deg: number) => [Math.sin((deg * Math.PI) / 180) * r, -Math.cos((deg * Math.PI) / 180) * r];
    const [x0, y0] = p(from);
    const [x1, y1] = p(to);
    return <path d={`M${x0},${y0} A${r},${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x1},${y1}`} stroke={c} strokeWidth={28} fill="none" />;
  };
  return (
    <g>
      <circle r={200} fill={L("#1d2233")} />
      <circle r={186} fill={L("#f8f9fb")} />
      {arc(-120, -60, "#e63946")}
      {arc(-60, 12, "#f4a261")}
      {arc(12, 120, "#2a9d8f")}
      {Array.from({ length: 11 }).map((_, i) => {
        const d = -120 + i * 24;
        return <path key={i} d="M0,-122 L0,-104" stroke="#1d2233" strokeWidth={5} transform={`rotate(${d})`} />;
      })}
      <g transform={`rotate(${a})`}>
        <path d="M-9,0 L0,-140 L9,0 Z" fill={zone} />
        <circle r={20} fill="#1d2233" />
      </g>
      <text y={92} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={54} fill="#1d2233">
        {str(props.label, "")}
      </text>
      <text x={-118} y={140} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={700} fontSize={26} fill="#6c757d">
        {str(props.low, "")}
      </text>
      <text x={118} y={140} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={700} fontSize={26} fill="#6c757d">
        {str(props.high, "")}
      </text>
    </g>
  );
};

/** Centre-anchored newspaper front page. Props: { "masthead": "THE DAILY NEWS", "headline": "…", "date": "" } */
export const Newspaper: React.FC<ObjectProps> = ({ props, L, seed }) => {
  const head = str(props.headline, "BREAKING NEWS");
  const words = head.split(" ");
  const lines: string[] = [];
  words.forEach((w) => {
    const last = lines[lines.length - 1];
    if (last && (last + " " + w).length <= 14) lines[lines.length - 1] = last + " " + w;
    else lines.push(w);
  });
  return (
    <g>
      <rect x={-300} y={-380} width={600} height={780} fill="#000" opacity={0.18} transform="translate(12 14)" />
      <rect x={-300} y={-380} width={600} height={780} fill={L("#f4f1e8")} />
      <text y={-310} textAnchor="middle" fontFamily="Georgia, serif" fontWeight={700} fontSize={50} fill={L("#1d1d1d")}>
        {str(props.masthead, "THE DAILY NEWS")}
      </text>
      <rect x={-270} y={-290} width={540} height={4} fill={L("#1d1d1d")} />
      <text y={-264} textAnchor="middle" fontFamily="Georgia, serif" fontSize={20} fill={L("#444")}>
        {str(props.date, "SPECIAL EDITION")}
      </text>
      <rect x={-270} y={-252} width={540} height={2} fill={L("#1d1d1d")} />
      {lines.slice(0, 3).map((ln, i) => (
        <text key={i} y={-180 + i * 76} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={70} fill={L("#1d1d1d")}>
          {ln}
        </text>
      ))}
      <rect x={-270} y={-180 + lines.slice(0, 3).length * 76 - 40} width={300} height={190} fill={L("#9aa3ad")} />
      <path d={`M-260,${-180 + lines.slice(0, 3).length * 76 + 140} l90,-80 l60,50 l70,-90 l100,120 Z`} fill={L("#6c757d")} />
      {Array.from({ length: 14 }).map((_, i) => {
        const col = i < 7 ? 0 : 1;
        const y = -180 + Math.min(3, lines.length) * 76 - 30 + (i % 7) * 26 + (col === 0 ? 210 : 0);
        const x = col === 0 ? -270 : 50;
        return <rect key={i} x={x} y={y} width={col === 0 ? 300 - random(`${seed}l${i}`) * 60 : 220 - random(`${seed}l${i}`) * 50} height={10} fill={L("#9a9a9a")} />;
      })}
    </g>
  );
};

/** Ground rubbish/sand bag. Props: { "kind": "trash" | "sand" } color = bag */
export const Bag: React.FC<ObjectProps> = ({ t, color, props, L }) => {
  const sand = props.kind === "sand";
  const c = L(color ?? (sand ? "#c9b48a" : "#26262b"));
  const sway = Math.sin(t * 1.5) * 1;
  return (
    <g>
      <ellipse cx={0} cy={0} rx={100} ry={10} fill="#000" opacity={0.18} />
      {sand ? (
        <g>
          <path d="M-110,-6 Q-120,-80 -60,-90 Q0,-100 60,-90 Q120,-80 110,-6 Q0,6 -110,-6 Z" fill={c} />
          <path d="M-100,-50 Q0,-62 100,-50" stroke={darken(c, 0.2)} strokeWidth={4} fill="none" />
        </g>
      ) : (
        <g transform={`rotate(${sway} 0 -150)`}>
          <path d="M-90,0 Q-110,-90 -40,-140 L-20,-150 L20,-150 L40,-140 Q110,-90 90,0 Z" fill={c} />
          <path d="M-20,-150 Q-40,-185 -10,-178 Q0,-160 10,-178 Q40,-185 20,-150 Z" fill={darken(c, 0.1)} />
          <path d="M-60,-30 Q-70,-90 -30,-120" stroke={lighten(c, 0.25)} strokeWidth={8} fill="none" opacity={0.6} strokeLinecap="round" />
        </g>
      )}
      {props.label ? (
        <g transform={`translate(0 ${sand ? -48 : -62})`}>
          <rect x={-78} y={-22} width={156} height={40} rx={8} fill="#fbf8f1" opacity={0.92} />
          <text y={7} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={str(props.label, "").length > 9 ? 20 : 26} fill="#7a0c18">
            {str(props.label, "")}
          </text>
        </g>
      ) : null}
    </g>
  );
};

/** Ground store shelf of water bottles. Props: { "empty": 0 (fraction bought, animatable), "sign": "WATER" } */
export const Shelf: React.FC<ObjectProps> = ({ local, props, L, seed }) => {
  const empty = clamp01(tweenNum(props.empty, local, 0));
  const rows = 3;
  const per = 9;
  return (
    <g>
      <rect x={-300} y={-560} width={600} height={560} fill={L("#e7ecef")} />
      <rect x={-300} y={-560} width={600} height={560} fill="none" stroke={L("#adb5bd")} strokeWidth={10} />
      <rect x={-200} y={-610} width={400} height={56} rx={10} fill={L("#3a86ff")} />
      <text y={-570} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={36} fill="#fff">
        {str(props.sign, "WATER")}
      </text>
      {Array.from({ length: rows }).map((_, r) => {
        const y = -400 + r * 170;
        return (
          <g key={r}>
            {Array.from({ length: per }).map((_, i) => {
              const order = random(`${seed}o${r}${i}`);
              if (order < empty) return null;
              const x = -260 + i * 62;
              return (
                <g key={i} transform={`translate(${x} ${y})`}>
                  <rect x={0} y={-120} width={44} height={120} rx={12} fill={L("#bde0fe")} opacity={0.9} />
                  <rect x={12} y={-140} width={20} height={22} rx={4} fill={L("#1d4e89")} />
                  <rect x={0} y={-80} width={44} height={30} fill={L("#3a86ff")} />
                  <rect x={6} y={-112} width={8} height={90} rx={4} fill="#ffffff" opacity={0.5} />
                </g>
              );
            })}
            <rect x={-300} y={y} width={600} height={16} fill={L("#868e96")} />
          </g>
        );
      })}
    </g>
  );
};

/** Ground water-treatment plant: clarifier tanks, building, pipes. Props: { "water": "#4f8fc0" (animatable), "alarm": false } */
export const TreatmentPlant: React.FC<ObjectProps> = ({ t, local, props, L }) => {
  const w = L(tweenColor(props.water, local, "#4f8fc0"));
  const alarm = props.alarm === true;
  const flash = alarm && Math.sin(t * 10) > 0;
  const tank = (cx: number, rx: number) => (
    <g key={cx}>
      <ellipse cx={cx} cy={-30} rx={rx} ry={rx * 0.32} fill={L("#9aa3ad")} />
      <rect x={cx - rx} y={-60} width={rx * 2} height={30} fill={L("#9aa3ad")} />
      <ellipse cx={cx} cy={-60} rx={rx} ry={rx * 0.32} fill={L("#c9cfd6")} />
      <ellipse cx={cx} cy={-60} rx={rx * 0.9} ry={rx * 0.27} fill={w} />
      <g transform={`translate(${cx} -60) scale(1 0.3) rotate(${t * 20})`}>
        <path d={`M${-rx * 0.88},0 L${rx * 0.88},0`} stroke={L("#6c757d")} strokeWidth={10} />
      </g>
      <ellipse cx={cx} cy={-60} rx={rx * 0.1} ry={rx * 0.04} fill={L("#495057")} />
    </g>
  );
  return (
    <g>
      <ellipse cx={0} cy={0} rx={460} ry={22} fill="#000" opacity={0.12} />
      <rect x={-420} y={-250} width={240} height={250} fill={L("#dee2e6")} />
      <path d="M-430,-250 L-300,-310 L-170,-250 Z" fill={L("#6c757d")} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={-395 + i * 75} y={-200} width={50} height={60} fill={L(flash ? "#ff4d4d" : "#a8dadc")} />
      ))}
      <rect x={-330} y={-80} width={60} height={80} fill={L("#495057")} />
      <rect x={-180} y={-90} width={520} height={18} fill={L("#868e96")} />
      {tank(-40, 110)}
      {tank(250, 140)}
      {alarm ? (
        <g>
          <circle cx={-300} cy={-325} r={18} fill={flash ? "#ff3b3b" : "#7a1d1d"} />
          {flash ? <circle cx={-300} cy={-325} r={50} fill="#ff3b3b" opacity={0.25} /> : null}
        </g>
      ) : null}
    </g>
  );
};

/** Ground wooden log. */
export const Log: React.FC<ObjectProps> = ({ color, L }) => {
  const c = L(color ?? "#8b5e3c");
  return (
    <g>
      <ellipse cx={0} cy={0} rx={190} ry={12} fill="#000" opacity={0.15} />
      <rect x={-170} y={-80} width={320} height={78} rx={10} fill={c} />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M-150,${-60 + i * 20} Q-20,${-66 + i * 20} 130,${-58 + i * 20}`} stroke={darken(c, 0.2)} strokeWidth={4} fill="none" />
      ))}
      <ellipse cx={150} cy={-41} rx={26} ry={39} fill={L("#d4a373")} />
      <ellipse cx={150} cy={-41} rx={16} ry={25} fill="none" stroke={L("#a47148")} strokeWidth={4} />
      <ellipse cx={150} cy={-41} rx={6} ry={10} fill="none" stroke={L("#a47148")} strokeWidth={3} />
      <path d="M-60,-80 q10,-30 30,-34" stroke={L("#6a994e")} strokeWidth={6} fill="none" strokeLinecap="round" />
    </g>
  );
};

/** Ground crop plant (corn/wheat-like). Props: { "health": 1 → 0 wilted (animatable) } */
export const Crop: React.FC<ObjectProps> = ({ t, local, props, L }) => {
  const h = clamp01(tweenNum(props.health, local, 1));
  const c = L(mix("#7a5c2e", "#5aa846", h));
  const droop = (1 - h) * 50;
  const sway = Math.sin(t * 1.6) * 5 * h;
  return (
    <g>
      <ellipse cx={0} cy={0} rx={60} ry={8} fill="#000" opacity={0.15} />
      <path d={`M0,0 Q${sway},-150 ${sway + droop * 0.8},${-290 + droop * 1.2}`} stroke={c} strokeWidth={12} fill="none" strokeLinecap="round" />
      {[0, 1, 2, 3, 4].map((i) => {
        const y = -50 - i * 48;
        const side = i % 2 ? 1 : -1;
        return <path key={i} d={`M${sway * (i / 5)},${y} q${side * 60},${-40 + droop} ${side * 110},${20 + droop * 1.6}`} stroke={c} strokeWidth={10} fill="none" strokeLinecap="round" />;
      })}
      {h > 0.3 ? <ellipse cx={sway + 12} cy={-170} rx={16} ry={40} fill={L(mix("#a68a4a", "#f2cc5b", h))} transform={`rotate(${15 + droop * 0.4} ${sway + 12} -170)`} /> : null}
    </g>
  );
};

const Wheel: React.FC<{ x: number; y: number; r: number; t: number; spin: number; L: (c: string) => string }> = ({ x, y, r, t, spin, L }) => (
  <g transform={`translate(${x} ${y}) rotate(${t * spin})`}>
    <circle r={r} fill={L("#222")} />
    <circle r={r * 0.55} fill={L("#e9c46a")} />
    {[0, 60, 120].map((a) => (
      <rect key={a} x={-r * 0.5} y={-4} width={r} height={8} fill={L("#b08d3a")} transform={`rotate(${a})`} />
    ))}
  </g>
);

/** Ground tractor (faces right). Props: { "moving": true } color = body */
export const Tractor: React.FC<ObjectProps> = ({ t, color, props, L }) => {
  const c = L(color ?? "#2a9d58");
  const spin = props.moving === true ? 200 : 0;
  const bob = props.moving === true ? Math.abs(Math.sin(t * 12)) * 3 : 0;
  return (
    <g>
      <ellipse cx={0} cy={0} rx={200} ry={14} fill="#000" opacity={0.15} />
      <g transform={`translate(0 ${-bob})`}>
        <rect x={-60} y={-200} width={150} height={110} rx={10} fill={c} />
        <rect x={-44} y={-188} width={110} height={70} fill={L("#bde0fe")} opacity={0.85} />
        <rect x={-150} y={-120} width={320} height={70} rx={14} fill={c} />
        <rect x={110} y={-150} width={60} height={40} rx={8} fill={darken(c, 0.15)} />
        <rect x={140} y={-210} width={12} height={70} fill={L("#555")} />
        <rect x={160} y={-100} width={24} height={20} rx={4} fill={L("#ffd166")} />
      </g>
      <Wheel x={-90} y={-82} r={82} t={t} spin={spin} L={L} />
      <Wheel x={130} y={-48} r={48} t={t} spin={spin * 1.7} L={L} />
    </g>
  );
};

/** Ground water tanker truck (faces right). Props: { "moving": false, "spraying": false, "label": "WATER" } color = cab */
export const WaterTruck: React.FC<ObjectProps> = ({ t, color, props, L, seed }) => {
  const c = L(color ?? "#e63946");
  const moving = props.moving === true;
  const spin = moving ? 260 : 0;
  return (
    <g>
      <ellipse cx={0} cy={0} rx={300} ry={16} fill="#000" opacity={0.15} />
      <rect x={-290} y={-90} width={560} height={26} fill={L("#495057")} />
      <rect x={-280} y={-250} width={380} height={160} rx={80} fill={L("#dee2e6")} />
      <rect x={-260} y={-236} width={340} height={20} rx={10} fill="#ffffff" opacity={0.5} />
      <text x={-90} y={-150} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={48} fill={L("#1d4e89")}>
        {str(props.label, "WATER")}
      </text>
      <path d="M120,-90 L120,-220 Q120,-240 140,-240 L220,-240 Q250,-240 262,-200 L290,-130 L290,-90 Z" fill={c} />
      <path d="M150,-225 L215,-225 Q235,-225 244,-195 L256,-165 L150,-165 Z" fill={L("#bde0fe")} />
      <rect x={278} y={-120} width={16} height={14} rx={3} fill={L("#ffd166")} />
      {[-200, -80, 220].map((x) => (
        <g key={x} transform={`translate(${x} -45) rotate(${t * spin})`}>
          <circle r={45} fill={L("#222")} />
          <circle r={20} fill={L("#adb5bd")} />
          <rect x={-18} y={-3} width={36} height={6} fill={L("#6c757d")} />
        </g>
      ))}
      {props.spraying === true
        ? Array.from({ length: 18 }).map((_, i) => {
            const ph = (t * 1.5 + random(`${seed}s${i}`)) % 1;
            return <circle key={i} cx={-290 - ph * 200} cy={-80 + ph * ph * 90 + (random(`${seed}y${i}`) - 0.5) * 30} r={6 + ph * 8} fill={L("#9cc3e6")} opacity={0.8 * (1 - ph)} />;
          })
        : null}
    </g>
  );
};

/** Garden hose nozzle (ground origin = hand grip) spraying to the right. Props: { "spraying": true } color = water */
export const Hose: React.FC<ObjectProps> = ({ t, color, props, L, seed }) => {
  const water = L(color ?? "#9cc3e6");
  return (
    <g>
      <path d="M-200,40 Q-120,40 -80,0 Q-50,-30 -10,-30" stroke={L("#2a9d58")} strokeWidth={22} fill="none" strokeLinecap="round" />
      <rect x={-20} y={-48} width={70} height={36} rx={10} fill={L("#ffb703")} />
      <rect x={46} y={-42} width={26} height={24} rx={4} fill={L("#fb8500")} />
      {props.spraying !== false
        ? Array.from({ length: 26 }).map((_, i) => {
            const ph = (t * 1.8 + random(`${seed}h${i}`)) % 1;
            const spread = (random(`${seed}hs${i}`) - 0.5) * 60 * ph;
            return <circle key={i} cx={78 + ph * 420} cy={-30 + ph * ph * 160 + spread} r={4 + ph * 6} fill={water} opacity={0.85 * (1 - ph * 0.8)} />;
          })
        : null}
    </g>
  );
};

/**
 * A grid of simple people silhouettes centred on the origin, for "everyone alive" beats.
 * Props: { "cols": 41, "rows": 25, "gap": 46, "reveal": 0..1 (animatable — fills from the centre outward), "hero": colour of the centre person }
 * color = tint the crowd's palette leans towards.
 */
export const Crowd: React.FC<ObjectProps> = ({ t, local, color, props, L, seed }) => {
  const cols = Math.max(1, Math.round(num(props.cols, 41)));
  const rows = Math.max(1, Math.round(num(props.rows, 25)));
  const gap = num(props.gap, 46);
  const reveal = clamp01(tweenNum(props.reveal, local, 1));
  const hero = props.hero === undefined ? undefined : str(props.hero, "#e9a23b");
  const tones = ["#e76f51", "#2a9d8f", "#e9c46a", "#457b9d", "#8d99ae", "#f4a261", "#6d597a", "#90be6d"];
  const skins = ["#f1c27d", "#c68642", "#8d5524", "#e0ac69", "#ffdbac"];
  const maxD = Math.hypot((cols - 1) / 2, (rows - 1) / 2) || 1;
  const people: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const dx = c - (cols - 1) / 2;
      const dy = r - (rows - 1) / 2;
      const d = Math.hypot(dx, dy) / maxD;
      const centre = dx === 0 && dy === 0;
      const k = centre ? 1 : clamp01((reveal * 1.15 - d) / 0.15);
      if (k <= 0) continue;
      const key = `${r}_${c}`;
      const shirt = centre && hero ? hero : mix(tones[Math.floor(random(`${seed}t${key}`) * tones.length)], color ?? "#888888", color ? 0.35 : 0);
      const skin = skins[Math.floor(random(`${seed}s${key}`) * skins.length)];
      const bob = Math.sin(t * 2 + random(`${seed}b${key}`) * 6.28) * 1.5;
      const s = (0.85 + random(`${seed}z${key}`) * 0.3) * ease("back", k);
      people.push(
        <g key={key} transform={`translate(${dx * gap + (r % 2) * gap * 0.25} ${dy * gap + bob}) scale(${s})`}>
          <path d="M-12,16 L-12,2 Q-12,-6 0,-6 Q12,-6 12,2 L12,16 Z" fill={L(shirt)} />
          <circle cx={0} cy={-14} r={8.5} fill={L(skin)} />
        </g>,
      );
    }
  }
  return <g>{people}</g>;
};

export const EVERYDAY: Record<string, ObjectDef> = {
  puddle: { component: Puddle, w: 320, h: 60, category: "story", description: 'color = liquid (animatable). props: { "size": 1, "grow": 2, "ripples": true }' },
  drop: { component: Drop, w: 130, h: 180, category: "story", anchor: "center", description: 'Liquid drop. color = liquid. props: { "face": true }' },
  cube: { component: Cube, w: 300, h: 330, category: "story", description: 'Isometric cube for scale. props: { "label": "1 km", "glass": true, "fill": 0..1 (animatable) }' },
  umbrella: { component: Umbrella, w: 420, h: 340, category: "story", description: 'props: { "open": 0..1 (animatable), "drip": "#9b111e" }' },
  meteor: { component: Meteor, w: 460, h: 140, category: "story", anchor: "center", description: 'Flaming meteor. props: { "angle": 30 }' },
  scroll: { component: Scroll, w: 470, h: 560, category: "story", anchor: "center", description: 'Unrolling parchment. props: { "lines": ["…"], "unroll": 1 }' },
  petridish: { component: PetriDish, w: 500, h: 500, category: "science", anchor: "center", description: 'Colonies bloom over time. props: { "agar": "#b5121b", "colonies": 18, "grow": 4, "colony": "#f4e9c9" }' },
  bacterium: { component: Bacterium, w: 360, h: 100, category: "science", anchor: "center", description: 'Wriggling rod bacterium. props: { "divide": 1.5 } splits in two at that time' },
  bloodcell: { component: BloodCell, w: 230, h: 230, category: "science", anchor: "center", description: "Red blood cell, tumbling" },
  spore: { component: Spore, w: 240, h: 240, category: "science", anchor: "center", description: 'Algae spore. props: { "tint": colour or [[t, colour]…] }' },
  beaker: { component: Beaker, w: 220, h: 270, category: "science", description: 'color = liquid. props: { "level": 0..1 (animatable), "bubbles": true, "label": "" }' },
  gauge: { component: Gauge, w: 400, h: 400, category: "science", anchor: "center", description: 'Dial. props: { "value": 0..1 (animatable), "label": "O₂", "low": "0", "high": "100%" }' },
  newspaper: { component: Newspaper, w: 620, h: 800, category: "story", anchor: "center", description: 'props: { "masthead": "THE DAILY NEWS", "headline": "…", "date": "…" }' },
  bag: { component: Bag, w: 240, h: 200, category: "story", description: 'props: { "kind": "trash" | "sand", "label": "BLOOD MEAL" } color = sack' },
  shelf: { component: Shelf, w: 620, h: 620, category: "story", description: 'Store shelf of bottled water. props: { "empty": 0..1 (animatable), "sign": "WATER" }' },
  treatmentplant: { component: TreatmentPlant, w: 920, h: 340, category: "buildings", description: 'Water-treatment plant. props: { "water": colour (animatable), "alarm": true }' },
  log: { component: Log, w: 380, h: 100, category: "nature", description: "Wooden log" },
  crop: { component: Crop, w: 250, h: 300, category: "nature", description: 'Crop plant. props: { "health": 1 → 0 wilted (animatable) }' },
  tractor: { component: Tractor, w: 400, h: 230, category: "vehicles", description: 'props: { "moving": true }' },
  watertruck: { component: WaterTruck, w: 600, h: 260, category: "vehicles", description: 'Water tanker. props: { "moving": true, "spraying": true, "label": "WATER" }' },
  hose: { component: Hose, w: 520, h: 200, category: "story", description: 'Hose nozzle spraying right. props: { "spraying": true } color = water' },
  crowd: { component: Crowd, w: 1900, h: 1160, category: "story", anchor: "center", description: 'Grid of people silhouettes. props: { "cols": 41, "rows": 25, "gap": 46, "reveal": 0..1 (animatable, fills from the centre), "hero": centre-person colour }' },
};
