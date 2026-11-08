import React from "react";
import { SvgLayer } from "../camera/Camera";
import { darken, lighten, mix } from "../../utils/color";
import { lit } from "../../utils/lighting";
import { smoothPath, useSvgId, type Pt } from "../../utils/svg";
import { tweenNum } from "../../utils/tween";
import { ObjectView } from "../objects/registry";
import { Clouds, Ground, Hills, rnd, Sky, WORLD_L, WORLD_R, type EnvProps } from "./common";


// =================================================================== OLYMPUS
/** Mount Olympus rising from dark foothills, summit near x=960, y=210. */
export const Olympus: React.FC<EnvProps> = ({ palette: p, t, seed }) => {
  const rock = lit(p, "#59606f");
  const snow = lit(p, "#dfe6f1");
  return (
    <>
      <Sky p={p} t={t} horizon={760} seed={seed} noSun={p.time === "night"} />
      <Clouds p={p} t={t} seed={seed} count={5} depth={0.06} y={120} />
      <Hills p={p} seed={seed} color="#5c6a7d" baseY={700} amp={120} depth={0.14} haze={0.6} keyName="ol1" step={380} />
      <SvgLayer depth={0.4}>
        <path d="M-1200,1200 L120,700 L420,560 L640,420 L800,330 L960,210 L1090,320 L1250,410 L1480,560 L1760,690 L3100,1200 Z" fill={rock} />
        <path d="M800,330 L880,380 L930,330 L990,392 L1040,340 L1090,320 L960,210 Z" fill={snow} />
        <path d="M640,420 L720,500 L840,470 L760,620 L920,540 L880,760 L1020,560 L1120,720 L1140,520 L1270,620 L1250,410 L1090,320 L960,210 L800,330 Z" fill={lit(p, "#464d5c")} opacity={0.55} />
      </SvgLayer>
      <Ground p={p} y={930} color="#39402f" haze={0.1} />
    </>
  );
};

// =================================================================== VILLAGE
/** Greek mountain village with white houses; Olympus behind. */
export const Village: React.FC<EnvProps> = ({ palette: p, t, seed }) => {
  const houses = Array.from({ length: 12 }).map((_, i) => ({
    x: WORLD_L + 180 + i * 420 + rnd(seed, "vx" + i) * 90,
    w: 240 + rnd(seed, "vw" + i) * 110,
    h: 170 + rnd(seed, "vh" + i) * 120,
  }));
  return (
    <>
      <Sky p={p} t={t} horizon={700} seed={seed} />
      <Clouds p={p} t={t} seed={seed} count={4} depth={0.06} />
      <SvgLayer depth={0.12}>
        <path d="M-800,900 L400,520 L760,330 L960,220 L1160,340 L1600,540 L2800,900 Z" fill={lit(p, "#79869c")} />
      </SvgLayer>
      <Hills p={p} seed={seed} color="#587055" baseY={720} amp={70} depth={0.3} haze={0.3} keyName="vl1" step={360} />
      <Ground p={p} y={800} color="#b6a98b" haze={0.05} />
      <SvgLayer depth={0.75}>
        {houses.map((h, i) => (
          <g key={i} transform={`translate(${h.x} 810)`}>
            <rect x={-h.w / 2} y={-h.h} width={h.w} height={h.h} fill={lit(p, "#f1ebdd")} />
            <path d={`M${-h.w / 2 - 20},${-h.h} L0,${-h.h - 70} L${h.w / 2 + 20},${-h.h} Z`} fill={lit(p, "#b5563a")} />
            <rect x={-22} y={-96} width={44} height={96} fill={lit(p, "#4c6b8a")} />
            {[-1, 1].map((d) => (
              <rect key={d} x={d * (h.w / 3) - 19} y={-h.h + 34} width={38} height={48} fill={lit(p, "#3f5671")} />
            ))}
          </g>
        ))}
      </SvgLayer>
    </>
  );
};

// =================================================================== RUINS
/**
 * Temple of Olympian Zeus: a row of columns with a modern city behind.
 * Props (animatable): { columns: 15, built: 1 (0..1 height) }, { city: false } hides the skyline.
 */
export const Ruins: React.FC<EnvProps> = ({ palette: p, t, seed, spec }) => {
  const pr = spec.props ?? {};
  const columns = tweenNum(pr.columns, t, 15);
  const built = tweenNum(pr.built, t, 1);
  return (
    <>
      <Sky p={p} t={t} horizon={740} seed={seed} />
      <Clouds p={p} t={t} seed={seed} count={4} depth={0.06} />
      {pr.city === false ? null : (
        <SvgLayer depth={0.2}>
          {Array.from({ length: 34 }).map((_, i) => {
            const w = 60 + rnd(seed, "cw" + i) * 80;
            const h = 60 + rnd(seed, "ch" + i) * 150;
            return <rect key={i} x={-900 + i * 112} y={760 - h} width={w} height={h} fill={lit(p, "#a8a59b")} />;
          })}
        </SvgLayer>
      )}
      <Ground p={p} y={790} color="#bdaf8e" haze={0.06} />
      <SvgLayer depth={0.8}>
        {Array.from({ length: 15 }).map((_, i) => {
          const vis = Math.max(0, Math.min(1, columns - i));
          if (vis <= 0) return null;
          return (
            <g key={i} opacity={vis} transform={`translate(${180 + i * 112} 850) scale(0.82 ${0.82 * Math.max(0.03, built)})`}>
              <ObjectView type="column" t={t} seed={"col" + i} props={{ height: 620 }} />
            </g>
          );
        })}
      </SvgLayer>
    </>
  );
};

// =================================================================== ACROPOLIS
/** The Acropolis hill with the Parthenon under scaffolding. Props: { scaffold: true } */
export const Acropolis: React.FC<EnvProps> = ({ palette: p, t, seed, spec }) => {
  const marble = lit(p, "#e0d6bd");
  const shade = lit(p, "#b8ad93");
  return (
    <>
      <Sky p={p} t={t} horizon={720} seed={seed} />
      <Clouds p={p} t={t} seed={seed} count={4} depth={0.06} />
      <SvgLayer depth={0.5}>
        <path d="M-1400,1200 L-300,760 L180,650 L1760,640 L2200,760 L3400,1200 Z" fill={lit(p, "#8d7d62")} />
        <rect x={420} y={590} width={1080} height={50} fill={shade} />
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x={448 + i * 88} y={344} width={50} height={246} fill={marble} />
        ))}
        <rect x={420} y={296} width={1080} height={50} fill={shade} />
        <path d="M410,296 L960,196 L1510,296 Z" fill={marble} />
        <path d="M1010,296 L1130,250 L1160,296 L1270,240 L1280,330 Z" fill={lit(p, "#8d7d62")} />
        {spec.props?.scaffold === false
          ? null
          : Array.from({ length: 9 }).map((_, i) => (
              <g key={i} stroke={lit(p, "#6a7280")} strokeWidth={7}>
                <line x1={1060 + i * 56} y1={196} x2={1060 + i * 56} y2={640} />
                <line x1={1040} y1={230 + i * 46} x2={1540} y2={230 + i * 46} />
              </g>
            ))}
      </SvgLayer>
      <Ground p={p} y={930} color="#a08c66" haze={0.05} />
    </>
  );
};

// =================================================================== OLYMPIA
/** Low sanctuary ruins with an empty statue base at the centre. */
export const Olympia: React.FC<EnvProps> = ({ palette: p, t, seed }) => (
  <>
    <Sky p={p} t={t} horizon={700} seed={seed} />
    <Clouds p={p} t={t} seed={seed} count={4} depth={0.06} />
    <Hills p={p} seed={seed} color="#6f8a63" baseY={690} amp={90} depth={0.18} haze={0.4} keyName="oly" step={420} />
    <Ground p={p} y={800} color="#bca97e" haze={0.05} />
    <SvgLayer depth={0.9}>
      {Array.from({ length: 16 }).map((_, i) => (
        <rect key={i} x={-300 + i * 200 + rnd(seed, "ox" + i) * 60} y={810 + (i % 3) * 34} width={120 + rnd(seed, "ow" + i) * 90} height={50} rx={6} fill={lit(p, "#d0c4a4")} />
      ))}
      <rect x={640} y={720} width={640} height={130} fill={lit(p, "#c9bd9c")} />
      <rect x={600} y={850} width={720} height={30} fill={lit(p, "#a79c7d")} />
    </SvgLayer>
  </>
);

// =================================================================== SEA
/**
 * Open Aegean with a small bare island at x=1200.
 * Props (animatable): { island: 0..1, boil: 0..1, flat: 0..1 }
 */
export const Aegean: React.FC<EnvProps> = ({ palette: p, t, seed, spec }) => {
  const pr = spec.props ?? {};
  const island = tweenNum(pr.island, t, 1);
  const boil = tweenNum(pr.boil, t, 0);
  const flat = tweenNum(pr.flat, t, 0);
  const water = useSvgId("sea");
  const horizon = 610;
  const top = lit(p, "#3c8fb8");
  const bottom = lit(p, "#0f3f62");
  return (
    <>
      <Sky p={p} t={t} horizon={horizon} seed={seed} />
      <Clouds p={p} t={t} seed={seed} count={4} depth={0.05} />
      <SvgLayer depth={0.4}>
        <defs>
          <linearGradient id={water} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={top} />
            <stop offset="1" stopColor={bottom} />
          </linearGradient>
        </defs>
        <rect x={WORLD_L - 1200} y={horizon} width={WORLD_R - WORLD_L + 2400} height={1200} fill={`url(#${water})`} />
        {island > 0 ? (
          <g transform={`translate(1200 ${horizon + 34}) scale(${island})`} opacity={island}>
            <path d="M-210,0 C-150,-90 -60,-150 20,-120 C110,-100 170,-40 220,0 Z" fill={lit(p, "#8b7f6c")} />
          </g>
        ) : null}
        {Array.from({ length: 42 }).map((_, i) => {
          const y = horizon + 24 + (i % 14) * 34;
          const amp = (1 - flat) * (10 + i * 0.25);
          const x = WORLD_L + rnd(seed, "w" + i) * (WORLD_R - WORLD_L) + Math.sin(t * 0.7 + i) * 60;
          const pts: Pt[] = [
            [x - 150, y],
            [x - 60, y - amp],
            [x + 60, y + amp],
            [x + 150, y],
          ];
          return <path key={i} d={smoothPath(pts, false)} fill="none" stroke={lighten(top, 0.22)} strokeWidth={4} opacity={0.3 * (1 - flat * 0.9)} strokeLinecap="round" />;
        })}
        {boil > 0
          ? Array.from({ length: 80 }).map((_, i) => {
              const k = (t * (0.5 + rnd(seed, "bs" + i)) + rnd(seed, "bo" + i)) % 1;
              return <circle key={i} cx={rnd(seed, "bx" + i) * 2000 - 40} cy={horizon + 30 + rnd(seed, "by" + i) * 430 - k * 40} r={(8 + rnd(seed, "br" + i) * 24) * (0.4 + k)} fill="#f7fbff" opacity={(1 - k) * boil * 0.7} />;
            })
          : null}
      </SvgLayer>
    </>
  );
};

// =================================================================== FRIEZE
/** Terracotta black-figure background with Greek-key borders: every GREEK MYTH scene. color tints the clay. */
export const Frieze: React.FC<EnvProps> = ({ spec, seed }) => {
  const clay = spec.color ?? "#c8703c";
  const dark = "#17110d";
  const g = useSvgId("clay");
  const Key: React.FC<{ y: number; h: number }> = ({ y, h }) => (
    <g>
      <rect x={WORLD_L - 1400} y={y} width={WORLD_R - WORLD_L + 2800} height={h} fill={dark} />
      {Array.from({ length: 80 }).map((_, i) => {
        const x = WORLD_L - 1400 + i * 94;
        const s = h / 90;
        return (
          <path
            key={i}
            d={`M${x},${y + 74 * s} L${x},${y + 14 * s} L${x + 72},${y + 14 * s} L${x + 72},${y + 60 * s} L${x + 26},${y + 60 * s} L${x + 26},${y + 38 * s} L${x + 48},${y + 38 * s}`}
            fill="none"
            stroke={clay}
            strokeWidth={7}
          />
        );
      })}
    </g>
  );
  return (
    <>
      <SvgLayer depth={0.02}>
        <defs>
          <radialGradient id={g} cx="0.5" cy="0.48" r="0.82">
            <stop offset="0" stopColor={lighten(clay, 0.14)} />
            <stop offset="1" stopColor={darken(clay, 0.2)} />
          </radialGradient>
        </defs>
        <rect x={-2000} y={-1500} width={6000} height={4000} fill={`url(#${g})`} />
      </SvgLayer>
      <SvgLayer depth={0.5}>
        {Array.from({ length: 34 }).map((_, i) => (
          <path key={i} d={`M${WORLD_L + i * 150 + rnd(seed, "cr" + i) * 80},${160 + (i % 5) * 150} q40,-16 90,0`} fill="none" stroke={mix(clay, dark, 0.28)} strokeWidth={3} opacity={0.35} />
        ))}
      </SvgLayer>
      <SvgLayer depth={1}>
        <Key y={0} h={92} />
        <Key y={988} h={92} />
      </SvgLayer>
    </>
  );
};

// =================================================================== HALL
/** Indoor official room. Props: { kind: "council" | "press" | "control" }, color = wall */
export const Hall: React.FC<EnvProps> = ({ palette: p, spec, t, seed }) => {
  const kind = (spec.props?.kind as string) ?? "council";
  const wall = lit(p, spec.color ?? (kind === "press" ? "#2a3a55" : kind === "control" ? "#101620" : "#37425a"));
  const floor = lit(p, kind === "control" ? "#0a0e14" : "#3a3028");
  return (
    <SvgLayer depth={1}>
      <rect x={WORLD_L - 1000} y={-1200} width={WORLD_R - WORLD_L + 2000} height={3200} fill={wall} />
      {kind !== "control"
        ? Array.from({ length: 22 }).map((_, i) => (
            <g key={i}>
              <rect x={WORLD_L + i * 260} y={120} width={140} height={520} fill={lighten(wall, 0.09)} />
              <rect x={WORLD_L + i * 260 + 62} y={120} width={16} height={520} fill={darken(wall, 0.12)} />
            </g>
          ))
        : Array.from({ length: 12 }).map((_, i) => <rect key={i} x={WORLD_L + i * 420} y={250 + ((i * 3) % 4) * 22} width={300} height={170} rx={8} fill={lighten(wall, 0.05 + 0.03 * Math.abs(Math.sin(t + i + seed)))} />)}
      <rect x={WORLD_L - 1000} y={760} width={WORLD_R - WORLD_L + 2000} height={1400} fill={floor} />
      <rect x={WORLD_L - 1000} y={748} width={WORLD_R - WORLD_L + 2000} height={14} fill={darken(wall, 0.3)} />
      {kind === "council" ? <rect x={260} y={700} width={1400} height={56} rx={10} fill={lit(p, "#5b3d29")} /> : null}
      {kind === "press" ? <rect x={700} y={560} width={520} height={200} rx={8} fill={lit(p, "#1a2436")} /> : null}
    </SvgLayer>
  );
};

// =================================================================== KITCHEN
/** A tiny flat lit by one warm bulb, table and window. */
export const Kitchen: React.FC<EnvProps> = ({ palette: p, t }) => {
  const wall = lit(p, "#6a5240");
  const g = useSvgId("bulb");
  return (
    <SvgLayer depth={1}>
      <defs>
        <radialGradient id={g}>
          <stop offset="0" stopColor="#ffd9a0" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ffd9a0" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect x={WORLD_L - 1000} y={-1200} width={WORLD_R - WORLD_L + 2000} height={3200} fill={wall} />
      <rect x={1270} y={180} width={380} height={330} fill={lit(p, "#122037")} />
      <path d="M1460,180 V510 M1270,345 H1650" stroke={lit(p, "#3d2c21")} strokeWidth={14} />
      <rect x={1252} y={162} width={416} height={366} fill="none" stroke={lit(p, "#3d2c21")} strokeWidth={20} />
      <rect x={WORLD_L - 1000} y={850} width={WORLD_R - WORLD_L + 2000} height={1200} fill={lit(p, "#3b2c23")} />
      <rect x={120} y={540} width={420} height={320} fill={lit(p, "#4c3a2d")} />
      <rect x={110} y={528} width={440} height={22} fill={lit(p, "#8a7a68")} />
      <line x1={880} y1={-200} x2={880} y2={130} stroke="#1c1612" strokeWidth={6} />
      <circle cx={880} cy={150} r={26} fill="#ffe9c0" />
      <circle cx={880} cy={150} r={760 + Math.sin(t * 2) * 6} fill={`url(#${g})`} />
    </SvgLayer>
  );
};

// =================================================================== WALL
/** Plain exterior wall and pavement for door close-ups. color = wall */
export const Wall: React.FC<EnvProps> = ({ palette: p, spec }) => {
  const wall = lit(p, spec.color ?? "#55606e");
  return (
    <SvgLayer depth={1}>
      <rect x={WORLD_L - 1000} y={-1200} width={WORLD_R - WORLD_L + 2000} height={3200} fill={wall} />
      {Array.from({ length: 180 }).map((_, i) => (
        <rect key={i} x={WORLD_L + (i % 30) * 170 + (Math.floor(i / 30) % 2) * 85} y={-40 + Math.floor(i / 30) * 150} width={164} height={144} fill={i % 4 ? lighten(wall, 0.05) : darken(wall, 0.05)} />
      ))}
      <rect x={WORLD_L - 1000} y={950} width={WORLD_R - WORLD_L + 2000} height={1200} fill={lit(p, "#3f3d3b")} />
    </SvgLayer>
  );
};

