import React from "react";
import { SvgLayer } from "../camera/Camera";
import { darken, lighten, mix, withAlpha } from "../../utils/color";
import { lit } from "../../utils/lighting";
import { smoothPath, useSvgId, type Pt } from "../../utils/svg";
import { tweenColor, tweenNum } from "../../utils/tween";
import { ObjectView } from "../objects/registry";
import { Clouds, Ground, Hills, rnd, Sky, WORLD_L, WORLD_R, type EnvProps } from "./common";

const Obj: React.FC<{ type: string; x: number; y: number; s?: number; t: number; color?: string; props?: Record<string, unknown>; flip?: boolean; rot?: number; seed?: string; opacity?: number }> = ({
  type,
  x,
  y,
  s = 1,
  t,
  color,
  props,
  flip,
  rot = 0,
  seed,
  opacity = 1,
}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${flip ? -s : s} ${s})`} opacity={opacity}>
    <ObjectView type={type} t={t} color={color} props={props} seed={seed ?? `${type}${x}`} />
  </g>
);

/** Healthy → dying vegetation colour. life 1 = lush, 0 = dead. */
const vegColor = (base: string, life: number) => mix(mix(base, "#7d6b3a", 0.75), base, Math.max(0, Math.min(1, life)));

const ribbon = (top: Pt[], bottom: Pt[]) => `${smoothPath(top, false)} L${bottom[bottom.length - 1].join(",")} ${smoothPath([...bottom].reverse(), false).replace(/^M/, "L")} Z`;

/** Reeds / grass tufts that sway in the wind */
const Reeds: React.FC<{ x: number; y: number; s: number; t: number; color: string; seed: number; k: string }> = ({ x, y, s, t, color, seed, k }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {Array.from({ length: 7 }).map((_, i) => {
      const h = 90 + rnd(seed, k + "rh" + i) * 80;
      const bx = (i - 3) * 9;
      const sway = Math.sin(t * 1.6 + i * 0.7 + x * 0.01) * 10;
      return (
        <g key={i}>
          <path d={`M${bx},0 Q${bx + sway * 0.4},${-h * 0.5} ${bx + sway},${-h}`} stroke={color} strokeWidth={5} fill="none" strokeLinecap="round" />
          {i % 3 === 1 ? <ellipse cx={bx + sway} cy={-h + 14} rx={6} ry={20} fill={darken(color, 0.45)} transform={`rotate(${sway * 0.8} ${bx + sway} ${-h + 14})`} /> : null}
        </g>
      );
    })}
  </g>
);

// ===================================================================== RIVER
/**
 * River seen from its bank. Props (all animatable with [[t, v], …] keyframes):
 *   water: "#3d8fc4" water colour     flow: 1 flow speed      life: 1 (0 = dead banks)
 *   fish: 3 jumping fish              dead: 0 floating dead fish
 *   murk: 0 (0..1 cloudiness)         reflect: true
 */
export const River: React.FC<EnvProps> = ({ palette: p, t, seed, spec }) => {
  const pr = spec.props ?? {};
  const water = lit(p, tweenColor(pr.water, t, "#3d8fc4"));
  const flow = tweenNum(pr.flow, t, 1);
  const life = tweenNum(pr.life, t, 1);
  const fish = Math.round(tweenNum(pr.fish, t, 3));
  const dead = Math.round(tweenNum(pr.dead, t, 0));
  const murk = tweenNum(pr.murk, t, 0);
  const wg = useSvgId("rw");
  const top = 735;
  const bot = 925;
  const raining = p.weather === "rain" || p.weather === "storm";
  const farBank: Pt[] = [[WORLD_L - 900, top], [0, top - 8], [900, top + 6], [1800, top - 6], [2700, top + 4], [WORLD_R + 900, top]];
  const nearBank: Pt[] = [[WORLD_L - 900, bot], [300, bot + 12], [1100, bot - 8], [2000, bot + 10], [WORLD_R + 900, bot]];
  // distance travelled by the current (px)
  const travel = t * 90 * flow;
  return (
    <>
      <Sky p={p} t={t} horizon={640} seed={seed} sunX={1450} />
      <Clouds p={p} t={t} seed={seed} count={6} depth={0.06} y={70} />
      <Hills p={p} seed={seed} color="#6c9a8b" baseY={650} amp={120} depth={0.18} haze={0.5} keyName="rv1" step={420} />
      <Hills p={p} seed={seed} color={vegColor("#52906b", life)} baseY={705} amp={70} depth={0.3} haze={0.3} keyName="rv2" step={360} />
      <SvgLayer depth={0.42}>
        {Array.from({ length: 16 }).map((_, i) => (
          <Obj key={i} type={i % 3 === 0 ? "pine" : "tree"} x={WORLD_L + i * 320 + rnd(seed, "rt" + i) * 120} y={728} s={0.42 + rnd(seed, "rts" + i) * 0.2} t={t} color={vegColor(["#40916c", "#52b788", "#2d6a4f"][i % 3], life)} />
        ))}
      </SvgLayer>
      <SvgLayer depth={0.6}>
        <defs>
          <linearGradient id={wg} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={mix(lighten(water, 0.18), p.skyBottom, 0.25)} />
            <stop offset="0.45" stopColor={water} />
            <stop offset="1" stopColor={darken(water, 0.3)} />
          </linearGradient>
        </defs>
        {/* far bank strip */}
        <path d={`${smoothPath(farBank.map(([x, y]) => [x, y - 26] as Pt), false)} L${WORLD_R + 900},${top + 30} L${WORLD_L - 900},${top + 30} Z`} fill={lit(p, vegColor("#74a860", life))} />
        {/* water body */}
        <path d={`${smoothPath(farBank, false)} L${WORLD_R + 900},${bot + 60} L${WORLD_L - 900},${bot + 60} Z`} fill={`url(#${wg})`} />
        {/* reflections of far trees */}
        {pr.reflect !== false
          ? Array.from({ length: 16 }).map((_, i) => {
              const x = WORLD_L + i * 320 + rnd(seed, "rt" + i) * 120;
              return (
                <g key={i} opacity={0.22}>
                  {[0, 1, 2, 3].map((k) => (
                    <rect key={k} x={x - 34 + k * 4 + Math.sin(t * 1.6 + i + k) * 5} y={top + 8 + k * 12} width={68 - k * 10} height={7} rx={3.5} fill={darken(water, 0.35)} />
                  ))}
                </g>
              );
            })
          : null}
        {/* current streaks */}
        {Array.from({ length: 60 }).map((_, i) => {
          const lane = rnd(seed, "rl" + i);
          const y = top + 20 + lane * (bot - top - 20);
          const span = 5600;
          const sp = 0.6 + lane * 0.8; // nearer = faster
          const x = ((rnd(seed, "rx" + i) * span + travel * sp) % span) + WORLD_L - 900;
          const w = 40 + rnd(seed, "rw" + i) * 110 * (0.5 + lane);
          return <rect key={i} x={x} y={y} width={w} height={2 + lane * 3} rx={2} fill={lighten(water, 0.35)} opacity={0.18 + 0.25 * lane} />;
        })}
        {/* rain rings on the surface */}
        {raining
          ? Array.from({ length: 40 }).map((_, i) => {
              const ph = (t * 1.6 + rnd(seed, "rr" + i)) % 1;
              const lane = rnd(seed, "rry" + i);
              const x = WORLD_L + rnd(seed, "rrx" + i) * (WORLD_R - WORLD_L);
              const y = top + 18 + lane * (bot - top - 20);
              return <ellipse key={i} cx={x} cy={y} rx={(6 + ph * 26) * (0.5 + lane)} ry={(2 + ph * 6) * (0.5 + lane)} fill="none" stroke={lighten(water, 0.45)} strokeWidth={2} opacity={0.6 * (1 - ph)} />;
            })
          : null}
        {/* murk / sediment haze */}
        {murk > 0 ? <path d={`${smoothPath(farBank, false)} L${WORLD_R + 900},${bot + 60} L${WORLD_L - 900},${bot + 60} Z`} fill={lit(p, "#4a3b22")} opacity={murk * 0.45} /> : null}
        {/* floating dead fish, drifting with the current */}
        {Array.from({ length: dead }).map((_, i) => {
          const lane = 0.2 + rnd(seed, "df" + i) * 0.7;
          const y = top + 30 + lane * (bot - top - 50);
          const x = ((rnd(seed, "dfx" + i) * 2400 + travel * (0.5 + lane * 0.6)) % 2400) - 240;
          const bob = Math.sin(t * 2 + i) * 3;
          return (
            <g key={i} transform={`translate(${x} ${y + bob}) rotate(${180 + Math.sin(t + i) * 6}) scale(${0.32 + lane * 0.2})`} opacity={0.9}>
              <ObjectView type="fish" t={0} color={mix("#c9c3b0", water, 0.25)} seed={"dfo" + i} props={{ dead: true }} />
            </g>
          );
        })}
        {/* jumping fish */}
        {Array.from({ length: fish }).map((_, i) => {
          const period = 3.2 + rnd(seed, "jp" + i) * 2.5;
          const ph = ((t + rnd(seed, "jo" + i) * period) % period) / 0.9; // 0..1 during the 0.9 s jump
          if (ph > 1) return null;
          const lane = 0.25 + rnd(seed, "jl" + i) * 0.6;
          const y0 = top + 40 + lane * (bot - top - 60);
          const x0 = 200 + rnd(seed, "jx" + i) * 1500;
          const x = x0 + ph * 160;
          const y = y0 - Math.sin(ph * Math.PI) * 120 * (0.6 + lane * 0.5);
          const rot = (ph - 0.5) * 80;
          return (
            <g key={"j" + i}>
              <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${0.3 + lane * 0.2})`}>
                <ObjectView type="fish" t={t} color={["#e9c46a", "#9bd4e4", "#f4a261"][i % 3]} seed={"jf" + i} />
              </g>
              {ph < 0.15 || ph > 0.85 ? <ellipse cx={ph < 0.5 ? x0 : x0 + 160} cy={y0} rx={30} ry={7} fill="none" stroke={lighten(water, 0.5)} strokeWidth={3} opacity={0.8} /> : null}
            </g>
          );
        })}
      </SvgLayer>
      <Ground p={p} y={bot + 20} color={vegColor("#7cb86a", life)} haze={0} />
      <SvgLayer depth={1}>
        <path d={ribbon(nearBank.map(([x, y]) => [x, y - 6] as Pt), nearBank.map(([x, y]) => [x, y + 34] as Pt))} fill={lit(p, "#8d6e4f")} />
        {Array.from({ length: 9 }).map((_, i) => (
          <Reeds key={i} x={WORLD_L + 120 + i * 560 + rnd(seed, "rd" + i) * 200} y={bot + 28} s={0.9 + rnd(seed, "rds" + i) * 0.5} t={t} color={lit(p, vegColor("#5a9e4b", life))} seed={seed} k={"r" + i} />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <Obj key={i} type="rock" x={WORLD_L + 400 + i * 820 + rnd(seed, "rk" + i) * 200} y={bot + 50} s={0.5 + rnd(seed, "rks" + i) * 0.4} t={t} />
        ))}
      </SvgLayer>
    </>
  );
};

// ====================================================================== FARM
const Barn: React.FC<{ L: (c: string) => string; t: number }> = ({ L }) => (
  <g>
    <rect x={-160} y={-230} width={320} height={230} fill={L("#b5302a")} />
    <path d="M-185,-225 L-110,-330 L110,-330 L185,-225 Z" fill={L("#7f1d1d")} />
    <path d="M-110,-330 L0,-390 L110,-330 Z" fill={L("#6b1717")} />
    <rect x={-60} y={-150} width={120} height={150} fill={L("#f1e8d8")} />
    <path d="M-52,-142 L52,-8 M52,-142 L-52,-8" stroke={L("#b5302a")} strokeWidth={12} />
    <rect x={-28} y={-290} width={56} height={46} fill={L("#f1e8d8")} />
    <rect x={-20} y={-282} width={40} height={30} fill={L("#3b2a20")} />
    <rect x={-160} y={-230} width={320} height={10} fill={L("#f1e8d8")} />
    {[-130, 100].map((x) => (
      <g key={x}>
        <rect x={x} y={-190} width={36} height={40} fill={L("#f1e8d8")} />
        <rect x={x + 5} y={-185} width={26} height={30} fill={L("#3b2a20")} />
      </g>
    ))}
  </g>
);

const Silo: React.FC<{ L: (c: string) => string }> = ({ L }) => (
  <g>
    <rect x={-62} y={-420} width={124} height={420} fill={L("#c9cfd6")} />
    {Array.from({ length: 9 }).map((_, i) => (
      <rect key={i} x={-62} y={-400 + i * 46} width={124} height={4} fill={L("#9aa3ad")} />
    ))}
    <rect x={-62} y={-420} width={30} height={420} fill={L("#e6eaee")} opacity={0.6} />
    <path d="M-66,-418 Q0,-500 66,-418 Z" fill={L("#8d99a6")} />
  </g>
);

/**
 * Farmland: crop fields in perspective, barn, silo, fence. Props (animatable):
 *   crop: 1 (crop health 1 = green, 0 = rotten brown)   flood: 0 (0..1 water pooling in the rows)
 *   water: "#5c8fbf" pooled water colour                barn: true
 */
export const Farm: React.FC<EnvProps> = ({ palette: p, t, seed, spec }) => {
  const pr = spec.props ?? {};
  const crop = tweenNum(pr.crop, t, 1);
  const flood = tweenNum(pr.flood, t, 0);
  const water = tweenColor(pr.water, t, spec.rainColor ?? "#5c8fbf");
  const L = (c: string) => lit(p, c);
  const cropC = vegColor("#6fbf4a", crop);
  const wheat = vegColor("#e9c46a", 0.4 + crop * 0.6);
  const horizon = 690;
  const vx = 960; // vanishing point x for crop rows
  return (
    <>
      <Sky p={p} t={t} horizon={horizon - 40} seed={seed} sunX={1500} />
      <Clouds p={p} t={t} seed={seed} count={6} depth={0.06} y={70} />
      <Hills p={p} seed={seed} color="#7ea886" baseY={650} amp={110} depth={0.16} haze={0.5} keyName="fm1" step={460} />
      <Hills p={p} seed={seed} color={vegColor("#8cbf6a", crop)} baseY={690} amp={50} depth={0.28} haze={0.3} keyName="fm2" step={380} />
      <SvgLayer depth={0.4}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Obj key={i} type="tree" x={WORLD_L + 200 + i * 420 + rnd(seed, "ft" + i) * 160} y={700} s={0.35 + rnd(seed, "fts" + i) * 0.15} t={t} color={vegColor("#40916c", crop)} />
        ))}
        {/* distant wheat field band */}
        <rect x={WORLD_L - 900} y={700} width={WORLD_R - WORLD_L + 1800} height={60} fill={L(wheat)} />
        {Array.from({ length: 50 }).map((_, i) => (
          <rect key={i} x={WORLD_L - 900 + i * 140} y={706 + (i % 3) * 16} width={90} height={3} rx={1.5} fill={L(darken(wheat, 0.15))} opacity={0.6} />
        ))}
      </SvgLayer>
      <SvgLayer depth={0.62}>
        <g transform="translate(1380 770) scale(0.55)">
          <Silo L={L} />
        </g>
        <g transform="translate(1180 772) scale(0.6)">
          {pr.barn !== false ? <Barn L={L} t={t} /> : null}
        </g>
        <g transform="translate(560 770) scale(0.4)">
          <ObjectView type="windturbine" t={t} />
        </g>
      </SvgLayer>
      <Ground p={p} y={760} color={vegColor("#7a5c3e", 1)} haze={0.05} />
      <SvgLayer depth={0.85}>
        {/* crop rows converging to the vanishing point */}
        {Array.from({ length: 34 }).map((_, i) => {
          const xb = -1900 + i * 170;
          const x0 = vx + (xb - vx) * 0.12;
          const sway = Math.sin(t * 1.8 + i * 0.4) * 3;
          return (
            <g key={i}>
              <path d={`M${x0 - 3},768 L${x0 + 3},768 L${xb + 46 + sway},1300 L${xb - 46 + sway},1300 Z`} fill={L(cropC)} />
              <path d={`M${x0},768 L${xb + sway},1300`} stroke={L(darken(cropC, 0.25))} strokeWidth={6} opacity={0.5} />
              {flood > 0 ? (
                <path
                  d={`M${x0 + 4},770 L${x0 + 12},770 L${xb + 124},1300 L${xb + 124 - 70 * flood},1300 Z`}
                  fill={L(lighten(water, 0.12))}
                  opacity={Math.min(1, flood * 1.4)}
                />
              ) : null}
            </g>
          );
        })}
      </SvgLayer>
      <SvgLayer depth={1}>
        <g transform="translate(-200 1010)">
          {Array.from({ length: 7 }).map((_, i) => (
            <g key={i} transform={`translate(${i * 400} 0)`}>
              <ObjectView type="fence" t={t} props={{ posts: 8 }} />
            </g>
          ))}
        </g>
        {Array.from({ length: 8 }).map((_, i) => (
          <Reeds key={i} x={WORLD_L + 300 + i * 620 + rnd(seed, "fr" + i) * 200} y={1080} s={0.7} t={t} color={L(vegColor("#6aa84f", crop))} seed={seed} k={"f" + i} />
        ))}
      </SvgLayer>
      {flood > 0.5 ? (
        <SvgLayer depth={1}>
          <rect x={WORLD_L - 900} y={1040} width={WORLD_R - WORLD_L + 1800} height={60} fill={withAlpha(water, 0.5 * (flood - 0.5) * 2)} />
        </SvgLayer>
      ) : null}
    </>
  );
};
