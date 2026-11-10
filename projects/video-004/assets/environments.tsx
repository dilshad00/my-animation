// Video-004 environments: a drowned, overgrown world after the fever. Registered additively in src/components/environments/registry.tsx.
import React from "react";
import { SvgLayer } from "../../../src/components/camera/Camera";
import { Clouds, Ground, Hills, rnd, Sky, WORLD_L, WORLD_R, type EnvProps } from "../../../src/components/environments/common";
import { darken, lighten, mix } from "../../../src/utils/color";
import { lit, type Palette } from "../../../src/utils/lighting";
import { useSvgId } from "../../../src/utils/svg";
import { tweenNum } from "../../../src/utils/tween";

const span = WORLD_R - WORLD_L;
const wrap = (v: number, lo: number, hi: number) => lo + ((((v - lo) % (hi - lo)) + (hi - lo)) % (hi - lo));
const fogTint = (p: Palette) => (p.time === "night" ? "#7f93a6" : p.time === "sunset" ? "#c9a79a" : p.time === "dawn" ? "#c7c9d4" : "#d5dde2");

/** Soft drifting fog bank: radial-gradient puffs that slide sideways at their own parallax depth. */
export const FogBank: React.FC<{ p: Palette; t: number; seed: number; y: number; depth: number; amount?: number; speed?: number; count?: number; h?: number; color?: string }> = ({
  p, t, seed, y, depth, amount = 1, speed = 14, count = 9, h = 120, color,
}) => {
  const id = useSvgId("fog");
  if (amount <= 0) return null;
  const c = color ?? fogTint(p);
  return (
    <SvgLayer depth={depth}>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={c} stopOpacity={0.3} />
          <stop offset="0.35" stopColor={c} stopOpacity={0.2} />
          <stop offset="0.7" stopColor={c} stopOpacity={0.07} />
          <stop offset="1" stopColor={c} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g opacity={Math.min(1, amount) * 0.75}>
        {Array.from({ length: count }).map((_, i) => {
          const w = 900 + rnd(seed, `fw${y}${i}`) * 900;
          const x = wrap(WORLD_L + (i / count) * (span + 1800) + t * speed * (0.6 + rnd(seed, `fs${y}${i}`) * 0.8), WORLD_L - 900, WORLD_R + 900);
          return <ellipse key={i} cx={x} cy={y + (rnd(seed, `fy${y}${i}`) - 0.5) * h * 0.6 + Math.sin(t * 0.3 + i) * 8} rx={w / 2} ry={h * (1.2 + rnd(seed, `fh${y}${i}`) * 0.6)} fill={`url(#${id})`} />;
        })}
      </g>
    </SvgLayer>
  );
};

/** Soft round light halo (radial gradient, no hard edge). */
export const Halo: React.FC<{ x: number; y: number; r: number; color: string; a: number }> = ({ x, y, r, color, a }) => {
  const id = useSvgId("halo");
  if (a <= 0) return null;
  return (
    <>
      <defs>
        <radialGradient id={id}>
          <stop offset="0" stopColor={color} stopOpacity={a} />
          <stop offset="0.4" stopColor={color} stopOpacity={a * 0.4} />
          <stop offset="1" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={x} cy={y} r={r} fill={`url(#${id})`} />
    </>
  );
};

/** Reeds and marsh grass, swaying. */
const Reeds: React.FC<{ p: Palette; t: number; seed: number; y: number; depth: number; n: number; tall?: number; color?: string; key2: string }> = ({ p, t, seed, y, depth, n, tall = 1, color = "#3f4a2c", key2 }) => (
  <SvgLayer depth={depth}>
    {Array.from({ length: n }).map((_, i) => {
      const x = WORLD_L - 400 + ((i + rnd(seed, key2 + "x" + i)) / n) * (span + 800);
      const h = (90 + rnd(seed, key2 + "h" + i) * 140) * tall;
      const sw = Math.sin(t * 1.1 + i * 0.7) * 10 * tall;
      const c = lit(p, i % 3 ? color : lighten(color, 0.12));
      return (
        <g key={i}>
          <path d={`M${x},${y} q${sw * 0.4},${-h * 0.5} ${sw},${-h}`} stroke={c} strokeWidth={5 * tall} fill="none" strokeLinecap="round" />
          <path d={`M${x + 8},${y} q${sw * 0.3 - 10},${-h * 0.4} ${sw - 30},${-h * 0.75}`} stroke={c} strokeWidth={4 * tall} fill="none" strokeLinecap="round" />
          {i % 4 === 0 ? <ellipse cx={x + sw} cy={y - h - 14 * tall} rx={6 * tall} ry={20 * tall} fill={lit(p, "#4b3a26")} /> : null}
        </g>
      );
    })}
  </SvgLayer>
);

/** Still water band with drifting light streaks. */
const Water: React.FC<{ p: Palette; t: number; y: number; h: number; depth: number; color?: string; glints?: string }> = ({ p, t, y, h, depth, color = "#2d3f45", glints }) => {
  const id = useSvgId("wat");
  return (
    <SvgLayer depth={depth}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={lit(p, lighten(color, 0.18))} />
          <stop offset="1" stopColor={lit(p, darken(color, 0.25))} />
        </linearGradient>
      </defs>
      <rect x={WORLD_L - 800} y={y} width={span + 1600} height={h} fill={`url(#${id})`} />
      {Array.from({ length: 30 }).map((_, i) => (
        <rect key={i} x={WORLD_L - 600 + i * 190 + Math.sin(t * 0.6 + i) * 30} y={y + 8 + (i % 5) * (h / 6)} width={70 + (i % 3) * 40} height={3} fill={glints ?? lit(p, "#c6d6dc")} opacity={0.35} />
      ))}
    </SvgLayer>
  );
};

/** A broken skyline silhouette row (jagged tops, a few hanging vines). */
const Skyline: React.FC<{ p: Palette; seed: number; base: number; depth: number; color: string; haze: number; n: number; hMin: number; hMax: number; k: string; windows?: boolean; vines?: boolean }> = ({
  p, seed, base, depth, color, haze, n, hMin, hMax, k, windows, vines,
}) => (
  <SvgLayer depth={depth}>
    {Array.from({ length: n }).map((_, i) => {
      const w = 140 + rnd(seed, k + "w" + i) * 160;
      const x = WORLD_L - 300 + (i / n) * (span + 600) + rnd(seed, k + "x" + i) * 60;
      const h = hMin + rnd(seed, k + "h" + i) * (hMax - hMin);
      const bite = rnd(seed, k + "b" + i);
      const top = base - h;
      const jag = bite > 0.45
        ? `L${x + w},${top + 40 + bite * 80} L${x + w * 0.72},${top + 20} L${x + w * 0.55},${top + 70} L${x + w * 0.3},${top} `
        : `L${x + w},${top} `;
      const c = lit(p, color, haze);
      return (
        <g key={i}>
          <path d={`M${x},${base} L${x + w},${base} ${jag}L${x},${top} Z`} fill={c} />
          {windows
            ? Array.from({ length: Math.floor(h / 70) }).map((_, r) =>
                [0.2, 0.5, 0.78].map((fx, j) => (
                  <rect key={`${r}-${j}`} x={x + w * fx - 12} y={top + 60 + r * 70} width={22} height={30} fill={lit(p, rnd(seed, `${k}${i}${r}${j}`) > 0.86 ? "#5b6c66" : darken(color, 0.35), haze)} />
                )),
              )
            : null}
          {vines
            ? Array.from({ length: 3 }).map((_, v) => {
                const vx = x + w * (0.2 + v * 0.3);
                const vh = 80 + rnd(seed, `${k}v${i}${v}`) * 240;
                return <path key={v} d={`M${vx},${top + 30} q-14,${vh * 0.5} 6,${vh}`} stroke={lit(p, "#3b5a32", haze)} strokeWidth={9} fill="none" strokeLinecap="round" />;
              })
            : null}
        </g>
      );
    })}
  </SvgLayer>
);

/** Rusting abandoned car silhouette. */
const DeadCar: React.FC<{ x: number; y: number; s: number; c: string; d: string; flip?: boolean }> = ({ x, y, s, c, d, flip }) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s}) rotate(${flip ? 3 : -2})`}>
    <path d="M-150,-20 L-140,-60 L-80,-66 L-50,-110 L60,-112 L100,-66 L150,-58 L156,-20 Z" fill={c} />
    <path d="M-40,-100 L-20,-70 L50,-70 L70,-100 Z" fill={d} opacity={0.8} />
    <circle cx={-90} cy={-14} r={26} fill={d} />
    <circle cx={96} cy={-14} r={26} fill={d} />
    <path d="M-150,-40 L156,-40" stroke={d} strokeWidth={4} opacity={0.5} />
  </g>
);

/** Empty city reclaimed by vines and fog. props: { fog: 0..1 (animatable), cars: true } */
export const RuinCity: React.FC<EnvProps> = ({ palette: p, t, seed, spec }) => {
  const pr = spec.props ?? {};
  const fog = tweenNum(pr.fog, t, 1);
  return (
    <>
      <Sky p={p} t={t} horizon={760} seed={seed} />
      <Clouds p={p} t={t} seed={seed} count={4} depth={0.05} dense />
      <Skyline p={p} seed={seed} base={780} depth={0.12} color="#4b5560" haze={0.7} n={18} hMin={260} hMax={560} k="r1" />
      <FogBank p={p} t={t} seed={seed} y={700} depth={0.18} amount={fog * 0.9} h={160} />
      <Skyline p={p} seed={seed} base={820} depth={0.32} color="#2f3a3c" haze={0.35} n={14} hMin={300} hMax={640} k="r2" windows vines />
      <FogBank p={p} t={t} seed={seed + 1} y={790} depth={0.4} amount={fog} h={120} speed={20} />
      <Ground p={p} y={850} color="#3d4140" haze={0.1} />
      <SvgLayer depth={1}>
        {Array.from({ length: 16 }).map((_, i) => {
          const x = WORLD_L + i * 330 + rnd(seed, "ck" + i) * 120;
          return <path key={i} d={`M${x},${880 + (i % 4) * 40} l60,18 l30,-10 l70,24`} stroke={lit(p, "#262a29")} strokeWidth={4} fill="none" />;
        })}
        {[0.5, 1, 1.5, 2].map((k, i) => (
          <rect key={i} x={WORLD_L + 200 + i * 1300} y={922} width={260} height={10} fill={lit(p, "#8c8a5a")} opacity={0.45} />
        ))}
        {pr.cars === false
          ? null
          : Array.from({ length: 6 }).map((_, i) => {
              const c = ["#5b3a2c", "#3e4a52", "#6b5a3a", "#47523f"][i % 4];
              return <DeadCar key={i} x={WORLD_L + 500 + i * 820 + rnd(seed, "cx" + i) * 200} y={900 + (i % 2) * 40} s={0.9 + (i % 3) * 0.15} c={lit(p, c)} d={lit(p, darken(c, 0.5))} flip={i % 2 === 1} />;
            })}
      </SvgLayer>
      <Reeds p={p} t={t} seed={seed} y={1080} depth={1.15} n={28} tall={1.1} color="#3c4f2e" key2="rc" />
      <FogBank p={p} t={t} seed={seed + 2} y={1010} depth={1.2} amount={fog * 0.7} h={110} speed={26} count={7} />
    </>
  );
};

/** A row of stacked shipping containers. Returns the wall group. */
const ContainerWall: React.FC<{ p: Palette; t: number; seed: number; base: number; gate: number; lights: number; scale?: number }> = ({ p, t, seed, base, gate, lights, scale = 1 }) => {
  const COLS = ["#8c3b2a", "#2f5d62", "#9a6a2c", "#4d5a3a", "#6b2f2f", "#3a4b63", "#7a4a2a"];
  const cw = 300 * scale, ch = 150 * scale;
  const n = Math.ceil(span / cw) + 4;
  const gx = 960;
  const items: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const x = WORLD_L - 600 + i * cw;
    if (x + cw > gx - 170 * scale && x < gx + 170 * scale) continue;
    for (let r = 0; r < 2; r++) {
      if (r === 1 && rnd(seed, "cr" + i) < 0.18) continue;
      const c = COLS[Math.floor(rnd(seed, `cc${i}${r}`) * COLS.length)];
      const off = r === 1 ? (rnd(seed, "co" + i) - 0.5) * 40 * scale : 0;
      const y = base - (r + 1) * ch;
      items.push(
        <g key={`${i}-${r}`}>
          <rect x={x + off} y={y} width={cw - 6} height={ch - 4} fill={lit(p, c)} />
          {Array.from({ length: 14 }).map((_, k) => (
            <rect key={k} x={x + off + 8 + k * (cw / 14.4)} y={y + 6} width={cw / 40} height={ch - 16} fill={lit(p, darken(c, 0.22))} />
          ))}
          <rect x={x + off} y={y} width={cw - 6} height={8 * scale} fill={lit(p, lighten(c, 0.15))} />
          <rect x={x + off + cw * 0.3} y={y + ch * 0.55} width={cw * 0.5} height={ch * 0.25} fill={lit(p, "#5a3a22")} opacity={0.5} />
        </g>,
      );
    }
    if (i % 3 === 1) {
      const lx = x + cw * 0.5;
      const ly = base - ch * 2 - 34 * scale;
      items.push(
        <g key={"lamp" + i}>
          <rect x={lx - 3} y={ly} width={6} height={34 * scale} fill={lit(p, "#2a2a2a")} />
          <circle cx={lx} cy={ly} r={9 * scale} fill={lights > 0 ? "#ffcf7a" : lit(p, "#776a50")} />
          <Halo x={lx} y={ly} r={(90 + Math.sin(t * 3 + i) * 6) * scale} color="#ffb84d" a={0.45 * lights} />
        </g>,
      );
    }
  }
  // watchtowers
  [gx - 520 * scale, gx + 520 * scale].forEach((tx, k) => {
    items.push(
      <g key={"tw" + k}>
        <path d={`M${tx - 50 * scale},${base - ch * 2} L${tx - 30 * scale},${base - ch * 2 - 220 * scale} L${tx + 30 * scale},${base - ch * 2 - 220 * scale} L${tx + 50 * scale},${base - ch * 2}`} stroke={lit(p, "#3a3430")} strokeWidth={10 * scale} fill="none" />
        <rect x={tx - 70 * scale} y={base - ch * 2 - 300 * scale} width={140 * scale} height={90 * scale} fill={lit(p, "#4a3d33")} />
        <path d={`M${tx - 90 * scale},${base - ch * 2 - 300 * scale} L${tx},${base - ch * 2 - 350 * scale} L${tx + 90 * scale},${base - ch * 2 - 300 * scale} Z`} fill={lit(p, "#2f2925")} />
        <rect x={tx - 46 * scale} y={base - ch * 2 - 284 * scale} width={92 * scale} height={34 * scale} fill={lights > 0 ? "#ffcf7a" : lit(p, "#1e1a17")} opacity={lights > 0 ? 0.6 + 0.3 * lights : 1} />
      </g>,
    );
  });
  // gate: two container doors that swing open (props.gate 0..1), with warm light behind
  const gw = 170 * scale, gh = ch * 2 - 10;
  const op = Math.max(0, Math.min(1, gate));
  items.push(
    <g key="gate">
      <rect x={gx - gw} y={base - gh} width={gw * 2} height={gh} fill={op > 0 ? mix("#2a1d12", "#ffd9a0", p.time === "night" ? 0.5 : 0.75) : "#120d0a"} />
      {op > 0 ? <rect x={gx - gw} y={base - gh} width={gw * 2} height={gh} fill="#fff1d0" opacity={op * 0.35} /> : null}
      <rect x={gx - gw} y={base - gh} width={gw * (1 - op * 0.85)} height={gh} fill={lit(p, "#5c4a3a")} />
      <rect x={gx + gw - gw * (1 - op * 0.85)} y={base - gh} width={gw * (1 - op * 0.85)} height={gh} fill={lit(p, "#5c4a3a")} />
      {[-1, 1].map((sd) => (
        <rect key={sd} x={sd < 0 ? gx - gw + gw * (1 - op * 0.85) * 0.45 : gx + gw - gw * (1 - op * 0.85) * 0.55} y={base - gh + 20} width={8} height={gh - 40} fill={lit(p, "#2c241d")} />
      ))}
      <rect x={gx - gw - 20} y={base - gh - 26} width={gw * 2 + 40} height={30} fill={lit(p, "#3a2f27")} />
    </g>,
  );
  return <>{items}</>;
};

/** Saltmarsh: a settlement walled with shipping containers on the edge of a marsh.
 * props (animatable): { lights: 0..1, gate: 0..1, fog: 0..1 }, { near: true } brings the wall closer. */
export const Saltmarsh: React.FC<EnvProps> = ({ palette: p, t, seed, spec }) => {
  const pr = spec.props ?? {};
  const lights = tweenNum(pr.lights, t, p.lightsOn ? 1 : 0);
  const gate = tweenNum(pr.gate, t, 0);
  const fog = tweenNum(pr.fog, t, 0.8);
  const near = !!pr.near;
  return (
    <>
      <Sky p={p} t={t} horizon={700} seed={seed} />
      <Clouds p={p} t={t} seed={seed} count={4} depth={0.05} dense />
      <Hills p={p} seed={seed} color="#56606a" baseY={650} amp={40} depth={0.1} haze={0.7} keyName="sm1" step={520} />
      <FogBank p={p} t={t} seed={seed} y={640} depth={0.14} amount={fog * 0.8} h={120} />
      <SvgLayer depth={0.38}>
        {Array.from({ length: 22 }).map((_, i) => {
          const x = WORLD_L + i * 230 + rnd(seed, "rf" + i) * 80;
          return <path key={i} d={`M${x},${near ? 520 : 600} l70,-46 l70,46 Z`} fill={lit(p, "#3d3530", 0.3)} />;
        })}
        <g transform={near ? "translate(0 40) scale(1)" : "translate(0 0)"}>
          <ContainerWall p={p} t={t} seed={seed} base={near ? 880 : 800} gate={gate} lights={lights} scale={near ? 1.2 : 0.9} />
        </g>
      </SvgLayer>
      <FogBank p={p} t={t} seed={seed + 3} y={near ? 860 : 790} depth={0.5} amount={fog} h={110} speed={18} />
      <Water p={p} t={t} y={near ? 880 : 800} h={420} depth={0.62} color="#2b3b40" glints={lights > 0 ? "#ffcf7a" : undefined} />
      <Reeds p={p} t={t} seed={seed} y={near ? 960 : 900} depth={0.75} n={36} tall={0.7} color="#4a5434" key2="sr1" />
      <Reeds p={p} t={t} seed={seed + 5} y={1090} depth={1.2} n={22} tall={1.4} color="#33402a" key2="sr2" />
      <FogBank p={p} t={t} seed={seed + 4} y={1020} depth={1.25} amount={fog * 0.6} h={120} speed={28} count={6} />
    </>
  );
};

/** Open salt marsh: dead trees, channels of still water, distant settlement lights.
 * props (animatable): { fog: 0..1, lights: 0..1 }, { settlement: true } */
export const Marsh: React.FC<EnvProps> = ({ palette: p, t, seed, spec }) => {
  const pr = spec.props ?? {};
  const fog = tweenNum(pr.fog, t, 1);
  const lights = tweenNum(pr.lights, t, p.lightsOn ? 1 : 0);
  return (
    <>
      <Sky p={p} t={t} horizon={660} seed={seed} />
      <Clouds p={p} t={t} seed={seed} count={5} depth={0.05} dense />
      {pr.settlement ? (
        <SvgLayer depth={0.12}>
          {Array.from({ length: 14 }).map((_, i) => (
            <rect key={i} x={1300 + i * 46} y={620 - (i % 3) * 22} width={44} height={40 + (i % 3) * 22} fill={lit(p, ["#5c3a30", "#34505a", "#6a5434"][i % 3], 0.5)} />
          ))}
          {lights > 0 ? Array.from({ length: 6 }).map((_, i) => <circle key={i} cx={1320 + i * 110} cy={598} r={5 + Math.sin(t * 2 + i)} fill="#ffcf7a" opacity={lights} />) : null}
          {lights > 0 ? <ellipse cx={1620} cy={620} rx={420} ry={60} fill="#ffb84d" opacity={0.12 * lights} /> : null}
        </SvgLayer>
      ) : null}
      <Water p={p} t={t} y={660} h={600} depth={0.2} color="#33454c" />
      <FogBank p={p} t={t} seed={seed} y={650} depth={0.22} amount={fog} h={110} />
      <SvgLayer depth={0.35}>
        {Array.from({ length: 18 }).map((_, i) => {
          const x = WORLD_L + i * 300 + rnd(seed, "mi" + i) * 120;
          return <ellipse key={i} cx={x} cy={705 + (i % 3) * 12} rx={150 + rnd(seed, "mw" + i) * 120} ry={14} fill={lit(p, "#4e5b3a", 0.4)} />;
        })}
        {Array.from({ length: 7 }).map((_, i) => {
          const x = WORLD_L + 300 + i * 720 + rnd(seed, "dt" + i) * 200;
          const c = lit(p, "#2a2622", 0.35);
          return (
            <g key={i} transform={`translate(${x} 712) scale(${0.6 + rnd(seed, "ds" + i) * 0.5})`}>
              <path d="M-8,0 L-4,-260 L4,-260 L10,0 Z" fill={c} />
              <path d="M-2,-180 L-80,-250 M0,-220 L70,-300 M2,-120 L60,-160 M-2,-250 L-30,-330" stroke={c} strokeWidth={8} strokeLinecap="round" />
            </g>
          );
        })}
      </SvgLayer>
      <FogBank p={p} t={t} seed={seed + 1} y={760} depth={0.45} amount={fog} h={130} speed={20} />
      <SvgLayer depth={0.7}>
        {Array.from({ length: 12 }).map((_, i) => {
          const x = WORLD_L + i * 470 + rnd(seed, "hm" + i) * 160;
          return <ellipse key={i} cx={x} cy={860 + (i % 2) * 30} rx={260 + rnd(seed, "hr" + i) * 160} ry={36} fill={lit(p, "#3d4a2c")} />;
        })}
      </SvgLayer>
      <Reeds p={p} t={t} seed={seed} y={880} depth={0.72} n={40} tall={0.75} color="#4b5535" key2="mr1" />
      <Reeds p={p} t={t} seed={seed + 2} y={1090} depth={1.25} n={20} tall={1.5} color="#2f3b27" key2="mr2" />
      <FogBank p={p} t={t} seed={seed + 3} y={1000} depth={1.3} amount={fog * 0.7} h={140} speed={30} count={6} />
    </>
  );
};

/** Rain streaks drawn inside a rectangle (windows). */
const RainIn: React.FC<{ x: number; y: number; w: number; h: number; t: number; n?: number; c?: string }> = ({ x, y, w, h, t, n = 40, c = "#a9bccb" }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => {
      const rx = x + ((i * 97) % w);
      const ry = y + (((i * 53 + t * 900) % (h + 60)) - 60);
      return <line key={i} x1={rx} y1={ry} x2={rx - 8} y2={ry + 46} stroke={c} strokeWidth={2} opacity={0.45} />;
    })}
  </g>
);

/** Abandoned pharmacy at night: tiled wall, toppled shelves, broken window onto rain, a flickering sign.
 * props: { counter: true, flicker: 1 } */
export const Pharmacy: React.FC<EnvProps> = ({ palette: p, t, seed, spec }) => {
  const pr = spec.props ?? {};
  const flick = (pr.flicker ?? 1) as number;
  const on = Math.sin(t * 23) > 0.6 || Math.sin(t * 3.1) > -0.2 ? 1 : 0.25;
  const glowA = flick ? on : 1;
  const beam = useSvgId("beam");
  return (
    <>
      <SvgLayer depth={0.3}>
        <rect x={WORLD_L} y={-800} width={span} height={2400} fill={lit(p, "#1d2a2b")} />
        {Array.from({ length: 60 }).map((_, i) => (
          <rect key={i} x={WORLD_L + (i % 30) * 170} y={-200 + Math.floor(i / 30) * 4000} width={2} height={1400} fill={lit(p, "#263536")} />
        ))}
        {Array.from({ length: 22 }).map((_, r) => (
          <rect key={"h" + r} x={WORLD_L} y={-200 + r * 70} width={span} height={2} fill={lit(p, "#263536")} />
        ))}
        {/* window onto the rainy street */}
        <rect x={-260} y={120} width={720} height={560} fill="#0d1620" />
        <rect x={-260} y={420} width={720} height={260} fill={lit(p, "#1b2530")} />
        {Array.from({ length: 5 }).map((_, i) => (
          <rect key={i} x={-240 + i * 150} y={300 - (i % 2) * 60} width={110} height={380} fill={lit(p, "#141c24")} />
        ))}
        <RainIn x={-260} y={120} w={720} h={560} t={t} n={60} />
        <path d="M-260,120 L460,120 L460,680 L-260,680 Z M60,120 L-20,330 L120,420 L40,680" fill="none" stroke={lit(p, "#3a4646")} strokeWidth={14} />
        <path d="M-60,120 L40,250 L-80,330 Z M300,560 L380,680 L240,680 Z" fill={lit(p, "#1d2a2b")} />
        {/* sign */}
        <g transform="translate(1180 150)">
          <rect x={-330} y={-60} width={660} height={120} rx={10} fill={lit(p, "#122022")} />
          <text x={-40} y={24} fontSize={64} fontWeight={800} fill={glowA > 0.5 ? "#9ff0c8" : lit(p, "#2c4a3c")} textAnchor="middle" fontFamily="Poppins, sans-serif" letterSpacing={8}>PHARM  CY</text>
          <path d="M240,-30 h24 v24 h24 v24 h-24 v24 h-24 v-24 h-24 v-24 h24 Z" fill={glowA > 0.5 ? "#7be0a2" : lit(p, "#2c4a3c")} />
          <g transform="scale(2.4 1)"><Halo x={0} y={0} r={220} color="#7be0a2" a={glowA > 0.5 ? 0.16 : 0} /></g>
        </g>
        {/* back shelves */}
        {[620, 1020, 1420, 1820, 2220].map((x, i) => (
          <g key={x} transform={`translate(${x} 0)`}>
            <rect x={0} y={260} width={340} height={600} fill={lit(p, "#2b2420")} />
            {[0, 1, 2, 3].map((s) => (
              <g key={s}>
                <rect x={0} y={330 + s * 140} width={340} height={14} fill={lit(p, "#4a3d33")} />
                {Array.from({ length: 7 }).map((_, b) => (rnd(seed, `bt${i}${s}${b}`) > 0.45 ? (
                  <rect key={b} x={16 + b * 46} y={330 + s * 140 - 50 - rnd(seed, `bh${i}${s}${b}`) * 20} width={30} height={50 + rnd(seed, `bh${i}${s}${b}`) * 20} rx={6} fill={lit(p, ["#7a9a8c", "#a26a4a", "#c9c2a3", "#5d7aa0"][b % 4])} />
                ) : null))}
              </g>
            ))}
          </g>
        ))}
      </SvgLayer>
      <SvgLayer depth={0.6}>
        <defs>
          <linearGradient id={beam} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#d8f1ff" stopOpacity={0.22} />
            <stop offset="1" stopColor="#d8f1ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={`M120,120 L360,120 L${820},${980} L${-160},${980} Z`} fill={`url(#${beam})`} opacity={0.8} />
        {/* fallen shelf and boxes */}
        <path d="M1500,900 L1900,760 L1930,800 L1530,940 Z" fill={lit(p, "#3a2f27")} />
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={1580 + i * 70} y={880 - (i % 3) * 18} width={46} height={34} rx={4} fill={lit(p, ["#c9c2a3", "#7a9a8c", "#a26a4a"][i % 3])} transform={`rotate(${(i * 37) % 50 - 25} ${1600 + i * 70} 890)`} />
        ))}
      </SvgLayer>
      <Ground p={p} y={900} color="#2a3231" haze={0} />
      <SvgLayer depth={1}>
        <ellipse cx={420} cy={960} rx={360} ry={26} fill={lit(p, "#4a6270")} opacity={0.5} />
        {[0, 1, 2].map((i) => {
          const k = ((t * 0.7 + i * 0.33) % 1);
          return <ellipse key={i} cx={420 + (i - 1) * 120} cy={960} rx={20 + k * 90} ry={(20 + k * 90) * 0.15} fill="none" stroke="#c6d6dc" strokeWidth={2} opacity={0.5 * (1 - k)} />;
        })}
        {pr.counter ? (
          <g>
            <rect x={1080} y={760} width={760} height={150} fill={lit(p, "#4a3a2e")} />
            <rect x={1060} y={740} width={800} height={26} fill={lit(p, "#6b5440")} />
            <rect x={1080} y={790} width={760} height={6} fill={lit(p, "#2e241c")} />
          </g>
        ) : null}
      </SvgLayer>
      <SvgLayer depth={1.3}>
        {Array.from({ length: 3 }).map((_, i) => {
          const k = ((t * 0.9 + i * 0.37) % 1);
          return <circle key={i} cx={-120 + i * 900} cy={-40 + k * 1100} r={5} fill="#b9d3e0" opacity={0.6} />;
        })}
      </SvgLayer>
    </>
  );
};

/** Clinic inside an old shipping container: ribbed steel, hanging lantern, a porthole window.
 * props: { storm: true (lightning through the window), lamp: 0..1, cot: true } */
export const Clinic: React.FC<EnvProps> = ({ palette: p, t, seed, spec }) => {
  const pr = spec.props ?? {};
  const lamp = tweenNum(pr.lamp, t, 1);
  const flash = pr.storm ? Math.max(0, Math.sin(t * 1.7 + seed) ** 40 + (Math.sin(t * 9) > 0.97 ? 0.4 : 0)) : 0;
  const pool = useSvgId("pool");
  const sway = Math.sin(t * 1.3) * 6;
  return (
    <>
      <SvgLayer depth={0.35}>
        <rect x={WORLD_L} y={-800} width={span} height={2400} fill={lit(p, "#3b4542")} />
        {Array.from({ length: Math.ceil(span / 46) }).map((_, i) => (
          <rect key={i} x={WORLD_L + i * 46} y={-800} width={18} height={2400} fill={lit(p, i % 2 ? "#323b38" : "#435049")} />
        ))}
        <rect x={WORLD_L} y={40} width={span} height={20} fill={lit(p, "#262d2b")} />
        {/* porthole */}
        <g transform="translate(560 330)">
          <circle r={120} fill={lit(p, "#1d2422")} />
          <circle r={96} fill={mix("#0b1420", "#dfe9ff", flash)} />
          {pr.storm ? <RainIn x={-96} y={-96} w={192} h={192} t={t} n={14} c="#8fa6b8" /> : null}
          <circle r={96} fill="none" stroke={lit(p, "#59645f")} strokeWidth={14} />
        </g>
        {/* shelves with jars */}
        <g transform="translate(1380 260)">
          {[0, 1, 2].map((s) => (
            <g key={s}>
              <rect x={0} y={s * 130} width={440} height={12} fill={lit(p, "#5a4634")} />
              {Array.from({ length: 6 }).map((_, j) => (
                <g key={j}>
                  <rect x={18 + j * 70} y={s * 130 - 62} width={44} height={62} rx={8} fill={lit(p, ["#9fc7b8", "#c9a66b", "#b7c5d6"][(j + s) % 3])} opacity={0.85} />
                  <rect x={22 + j * 70} y={s * 130 - 68} width={36} height={10} fill={lit(p, "#4a3d33")} />
                </g>
              ))}
            </g>
          ))}
        </g>
        {/* red cross */}
        <g transform="translate(960 230)" opacity={0.8}>
          <rect x={-60} y={-20} width={120} height={40} fill={lit(p, "#a8322b")} />
          <rect x={-20} y={-60} width={40} height={120} fill={lit(p, "#a8322b")} />
        </g>
      </SvgLayer>
      {flash > 0.05 ? (
        <SvgLayer depth={0.35}>
          <rect x={WORLD_L} y={-800} width={span} height={2400} fill="#dfe9ff" opacity={flash * 0.18} />
        </SvgLayer>
      ) : null}
      <Ground p={p} y={900} color="#3a3530" haze={0} />
      <SvgLayer depth={0.8}>
        <defs>
          <radialGradient id={pool}>
            <stop offset="0" stopColor="#ffc46b" stopOpacity={0.42 * lamp} />
            <stop offset="0.5" stopColor="#ff9f43" stopOpacity={0.16 * lamp} />
            <stop offset="1" stopColor="#ff9f43" stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={960 + sway} cy={560} r={900 + Math.sin(t * 7) * 12} fill={`url(#${pool})`} />
        <line x1={960} y1={-100} x2={960 + sway} y2={250} stroke={lit(p, "#1e1e1e")} strokeWidth={4} />
        <g transform={`translate(${960 + sway} 250)`}>
          <rect x={-30} y={0} width={60} height={14} fill="#2a2a2a" />
          <path d="M-36,14 L36,14 L30,90 L-30,90 Z" fill="#ffe3a3" opacity={0.25 + 0.6 * lamp} />
          <ellipse cx={0} cy={60} rx={10 + Math.sin(t * 12) * 2} ry={18} fill="#fff1c4" opacity={lamp} />
          <rect x={-36} y={90} width={72} height={10} fill="#2a2a2a" />
        </g>
        {pr.cot ? (
          <g>
            <rect x={200} y={760} width={560} height={40} rx={8} fill={lit(p, "#cfd6d0")} />
            <path d="M200,770 Q480,700 760,770 L760,800 L200,800 Z" fill={lit(p, "#6f8a7a")} />
            <rect x={210} y={800} width={14} height={100} fill={lit(p, "#2a2a2a")} />
            <rect x={736} y={800} width={14} height={100} fill={lit(p, "#2a2a2a")} />
            <rect x={200} y={720} width={130} height={46} rx={20} fill={lit(p, "#e8e4d8")} />
          </g>
        ) : null}
      </SvgLayer>
    </>
  );
};

/** Lantern-lit council room: long table, faces lit from below. props: { candles: 5 } */
export const Council: React.FC<EnvProps> = ({ palette: p, t }) => {
  const g = useSvgId("cg");
  return (
    <>
      <SvgLayer depth={0.35}>
        <rect x={WORLD_L} y={-800} width={span} height={2400} fill={lit(p, "#221c18")} />
        {Array.from({ length: Math.ceil(span / 46) }).map((_, i) => (
          <rect key={i} x={WORLD_L + i * 46} y={-800} width={18} height={2400} fill={lit(p, i % 2 ? "#1b1613" : "#2a221d")} />
        ))}
        <g transform="translate(960 260)">
          <rect x={-200} y={-120} width={400} height={240} fill={lit(p, "#3b3026")} />
          <text x={0} y={-50} textAnchor="middle" fontSize={34} fontFamily="Poppins, sans-serif" fontWeight={700} fill={lit(p, "#d8c7a0")}>SALTMARSH</text>
          {[0, 1, 2].map((r) => <rect key={r} x={-160} y={-20 + r * 40} width={320} height={6} fill={lit(p, "#8c7a5a")} opacity={0.6} />)}
        </g>
      </SvgLayer>
      <Ground p={p} y={900} color="#2a221d" haze={0} />
      <SvgLayer depth={0.9}>
        <defs>
          <radialGradient id={g}>
            <stop offset="0" stopColor="#ffbf66" stopOpacity={0.4} />
            <stop offset="1" stopColor="#ffbf66" stopOpacity={0} />
          </radialGradient>
        </defs>
        <ellipse cx={960} cy={760} rx={1100 + Math.sin(t * 6) * 14} ry={520} fill={`url(#${g})`} />
      </SvgLayer>
    </>
  );
};

/** A seaside town where people like Wren live: pastel houses, wind turbines, harbour, gulls. props: { lamps: true } */
export const SeaTown: React.FC<EnvProps> = ({ palette: p, t, seed }) => {
  const COLS = ["#e9c46a", "#f4a261", "#9fd8c9", "#e76f51", "#c9d6df", "#b8c480"];
  return (
    <>
      <Sky p={p} t={t} horizon={640} seed={seed} />
      <Clouds p={p} t={t} seed={seed} count={5} depth={0.06} />
      <Water p={p} t={t} y={600} h={260} depth={0.12} color="#3f7891" glints={p.time === "night" ? "#ffcf7a" : "#f6f1d8"} />
      <SvgLayer depth={0.2}>
        {[-200, 700, 1700, 2600].map((x, i) => (
          <g key={x} transform={`translate(${x} 600)`}>
            <rect x={-5} y={-260} width={10} height={260} fill={lit(p, "#e8e8e8", 0.3)} />
            <g transform={`translate(0 -260) rotate(${t * 40 + i * 30})`}>
              {[0, 120, 240].map((a) => <rect key={a} x={-4} y={-120} width={8} height={120} fill={lit(p, "#f2f2f2", 0.3)} transform={`rotate(${a})`} />)}
            </g>
          </g>
        ))}
      </SvgLayer>
      <Ground p={p} y={760} color="#8a8f6a" haze={0.05} depth={0.45} />
      <SvgLayer depth={0.45}>
        {Array.from({ length: 20 }).map((_, i) => {
          const x = WORLD_L + i * 250 + rnd(seed, "sh" + i) * 40;
          const h = 160 + rnd(seed, "sv" + i) * 110;
          const c = COLS[i % COLS.length];
          return (
            <g key={i}>
              <rect x={x} y={770 - h} width={200} height={h} fill={lit(p, c)} />
              <path d={`M${x - 14},${770 - h} L${x + 100},${700 - h} L${x + 214},${770 - h} Z`} fill={lit(p, darken(c, 0.35))} />
              <rect x={x + 30} y={770 - h + 40} width={44} height={50} fill={p.lightsOn ? "#ffd27a" : lit(p, "#3d5a6a")} />
              <rect x={x + 126} y={770 - h + 40} width={44} height={50} fill={p.lightsOn ? "#ffd27a" : lit(p, "#3d5a6a")} />
              <rect x={x + 80} y={720} width={40} height={50} fill={lit(p, darken(c, 0.5))} />
              <rect x={x + 26} y={770 - h + 92} width={52} height={10} fill={lit(p, "#d65a6a")} />
            </g>
          );
        })}
      </SvgLayer>
      <Ground p={p} y={880} color="#b8a57a" haze={0} />
      <SvgLayer depth={1}>
        {Array.from({ length: 8 }).map((_, i) => {
          const x = WORLD_L + 300 + i * 640;
          return (
            <g key={i}>
              <rect x={x - 4} y={700} width={8} height={190} fill={lit(p, "#2f3a3c")} />
              <circle cx={x} cy={696} r={14} fill={p.lightsOn ? "#ffe0a0" : lit(p, "#d9d2bf")} />
              <Halo x={x} y={696} r={110} color="#ffcf7a" a={p.lightsOn ? 0.4 : 0} />
            </g>
          );
        })}
      </SvgLayer>
      <SvgLayer depth={0.3}>
        {Array.from({ length: 5 }).map((_, i) => {
          const x = wrap(WORLD_L + i * 900 + t * (60 + i * 8), WORLD_L, WORLD_R);
          const y = 260 + i * 40 + Math.sin(t * 2 + i) * 20;
          const f = Math.sin(t * 8 + i) * 10;
          return <path key={i} d={`M${x - 26},${y + f} Q${x - 10},${y - 8} ${x},${y} Q${x + 10},${y - 8} ${x + 26},${y + f}`} stroke={lit(p, "#f4f4f4")} strokeWidth={4} fill="none" strokeLinecap="round" />;
        })}
      </SvgLayer>
    </>
  );
};

/** Dark void with slow fog: for close-ups, inserts and title moments. color = tint. props: { fog: 0..1 } */
export const Void: React.FC<EnvProps> = ({ palette: p, t, seed, spec }) => {
  const g = useSvgId("vd");
  const c = spec.color ?? "#10181c";
  return (
    <>
      <SvgLayer depth={0.05}>
        <defs>
          <radialGradient id={g} cx="0.5" cy="0.45" r="0.75">
            <stop offset="0" stopColor={lighten(c, 0.12)} />
            <stop offset="1" stopColor={darken(c, 0.7)} />
          </radialGradient>
        </defs>
        <rect x={-2000} y={-1500} width={6000} height={4000} fill={`url(#${g})`} />
      </SvgLayer>
      <FogBank p={p} t={t} seed={seed} y={760} depth={0.3} amount={tweenNum(spec.props?.fog, t, 0.6)} h={160} speed={12} color={lighten(c, 0.4)} />
    </>
  );
};

export const ZOMBIE_ENVS = {
  ruincity: { component: RuinCity, groundY: 900, description: 'Empty overgrown city with abandoned cars and fog. props (animatable): { "fog": 0..1 }, { "cars": false }' },
  saltmarsh: { component: Saltmarsh, groundY: 1000, description: 'Container-wall settlement across marsh water. props (animatable): { "lights", "gate", "fog": 0..1 }, { "near": true }' },
  marsh: { component: Marsh, groundY: 900, description: 'Open fog marsh with dead trees. props (animatable): { "fog", "lights" }, { "settlement": true }' },
  pharmacy: { component: Pharmacy, ownWeather: true, groundY: 920, description: 'Abandoned pharmacy at night, rain through a broken window. props: { "counter": true, "flicker": 0|1 }' },
  clinic: { component: Clinic, ownWeather: true, groundY: 920, description: 'Clinic in a shipping container with a hanging lantern. props: { "storm": true, "cot": true, "lamp": 0..1 }' },
  council: { component: Council, ownWeather: true, groundY: 920, description: "Lantern-lit council room." },
  seatown: { component: SeaTown, groundY: 900, description: "Pastel seaside town with turbines and gulls." },
  void: { component: Void, ownWeather: true, groundY: 900, description: 'Dark vignette void with slow fog. color = tint, props: { "fog": 0..1 }' },
};
