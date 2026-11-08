import React from "react";
import { SvgLayer } from "../camera/Camera";
import { darken, lighten, mix } from "../../utils/color";
import { lit } from "../../utils/lighting";
import { tweenColor, tweenNum } from "../../utils/tween";
import { smoothPath, useSvgId, type Pt } from "../../utils/svg";
import { ObjectView } from "../objects/registry";
import {
  Clouds,
  Ground,
  hillPath,
  Hills,
  LightRays,
  rnd,
  Sky,
  WORLD_L,
  WORLD_R,
  WORLD_W,
  type EnvProps,
} from "./common";

const Obj: React.FC<{ type: string; x: number; y: number; s?: number; t: number; color?: string; color2?: string; props?: Record<string, unknown>; flip?: boolean; seed?: string }> = ({
  type,
  x,
  y,
  s = 1,
  t,
  color,
  color2,
  props,
  flip,
  seed,
}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <ObjectView type={type} t={t} color={color} color2={color2} props={props} seed={seed ?? `${type}${x}`} />
  </g>
);

// ===================================================================== CITY
const Skyline: React.FC<EnvProps & { depth: number; baseY: number; minH: number; maxH: number; color: string; haze: number; windows: boolean; keyName: string }> = ({
  palette: p,
  seed,
  depth,
  baseY,
  minH,
  maxH,
  color,
  haze,
  windows,
  keyName,
}) => {
  const blds: React.ReactNode[] = [];
  let x = WORLD_L - 400;
  let i = 0;
  while (x < WORLD_R + 400) {
    const w = 110 + rnd(seed, keyName + "w" + i) * 150;
    const h = minH + rnd(seed, keyName + "h" + i) * (maxH - minH);
    const c = lit(p, mix(color, i % 3 === 0 ? "#7a6c9c" : i % 3 === 1 ? "#5c7a9c" : "#6c8a8c", 0.25), haze);
    const roofStyle = rnd(seed, keyName + "r" + i);
    blds.push(
      <g key={i}>
        <rect x={x} y={baseY - h} width={w} height={h} fill={c} />
        <rect x={x + w * 0.7} y={baseY - h} width={w * 0.3} height={h} fill={darken(c, 0.12)} />
        {roofStyle > 0.75 ? <rect x={x + w * 0.3} y={baseY - h - 40} width={w * 0.25} height={40} fill={c} /> : null}
        {roofStyle < 0.2 ? <path d={`M${x},${baseY - h} L${x + w / 2},${baseY - h - 50} L${x + w},${baseY - h} Z`} fill={darken(c, 0.08)} /> : null}
        {windows
          ? Array.from({ length: Math.floor(h / 42) }).map((_, r) =>
              Array.from({ length: Math.floor((w - 20) / 32) }).map((__, k) => {
                const on = p.lightsOn ? rnd(seed, `${keyName}${i}-${r}-${k}`) > 0.45 : false;
                return (
                  <rect
                    key={`${r}-${k}`}
                    x={x + 14 + k * 32}
                    y={baseY - h + 18 + r * 42}
                    width={18}
                    height={24}
                    fill={on ? "#ffd77a" : lighten(c, p.time === "night" ? 0.05 : 0.25)}
                    opacity={on ? 0.95 : 0.6}
                  />
                );
              }),
            )
          : null}
      </g>,
    );
    x += w + 6 + rnd(seed, keyName + "g" + i) * 30;
    i++;
  }
  return <SvgLayer depth={depth}>{blds}</SvgLayer>;
};

const Road: React.FC<EnvProps & { y: number }> = ({ palette: p, y }) => (
  <SvgLayer depth={1}>
    <rect x={WORLD_L - 800} y={y - 90} width={WORLD_W + 1600} height={90} fill={lit(p, "#c4c7cf")} />
    {Array.from({ length: 70 }).map((_, i) => (
      <line key={i} x1={WORLD_L - 800 + i * 110} y1={y - 90} x2={WORLD_L - 830 + i * 110} y2={y} stroke={lit(p, "#aeb2bb")} strokeWidth={3} />
    ))}
    <rect x={WORLD_L - 800} y={y - 8} width={WORLD_W + 1600} height={16} fill={lit(p, "#8d929c")} />
    <rect x={WORLD_L - 800} y={y + 8} width={WORLD_W + 1600} height={600} fill={lit(p, "#3d4150")} />
    {Array.from({ length: 50 }).map((_, i) => (
      <rect key={i} x={WORLD_L - 800 + i * 160} y={y + 96} width={90} height={10} rx={5} fill={lit(p, "#e9ecef")} />
    ))}
  </SvgLayer>
);

const Traffic: React.FC<EnvProps & { y: number }> = ({ t, y }) => {
  const cars = [
    { c: "#e63946", speed: 700, off: 0, dir: 1, type: "car" },
    { c: "#3a86ff", speed: 520, off: 2400, dir: -1, type: "car" },
    { c: "#ffb703", speed: 420, off: 1200, dir: 1, type: "bus" },
  ];
  return (
    <SvgLayer depth={1}>
      {cars.map((car, i) => {
        const span = 5200;
        const raw = (car.off + t * car.speed) % span;
        const x = car.dir > 0 ? WORLD_L - 400 + raw : WORLD_R + 400 - raw;
        return <Obj key={i} type={car.type} x={x} y={y + (car.dir > 0 ? 130 : 60)} s={car.type === "bus" ? 0.8 : 0.9} t={t} color={car.c} flip={car.dir < 0} />;
      })}
    </SvgLayer>
  );
};

export const City: React.FC<EnvProps> = (props) => {
  const { palette: p, t, seed } = props;
  const ground = 860;
  return (
    <>
      <Sky p={p} t={t} horizon={760} seed={seed} />
      <Clouds p={p} t={t} seed={seed} count={5} depth={0.08} />
      <Skyline {...props} depth={0.18} baseY={760} minH={180} maxH={430} color="#7c86b8" haze={0.62} windows={false} keyName="far" />
      <Skyline {...props} depth={0.4} baseY={780} minH={240} maxH={560} color="#5c6f99" haze={0.32} windows keyName="mid" />
      <Skyline {...props} depth={0.7} baseY={790} minH={300} maxH={620} color="#4a5578" haze={0.08} windows keyName="near" />
      <Road {...props} y={ground} />
      <SvgLayer depth={1}>
        {Array.from({ length: 9 }).map((_, i) => (
          <Obj key={i} type="streetlamp" x={WORLD_L + 200 + i * 560} y={ground - 70} s={0.95} t={t} />
        ))}
        <Obj type="trafficlight" x={1560} y={ground - 70} s={0.9} t={t} />
        <Obj type="tree" x={380} y={ground - 74} s={0.75} t={t} />
        <Obj type="bench" x={2400} y={ground - 72} s={0.9} t={t} />
      </SvgLayer>
    </>
  );
};

/** Foreground (drawn in front of characters): passing traffic. */
export const TrafficFront: React.FC<EnvProps> = (props) =>
  props.spec.props?.traffic ? <Traffic {...props} y={860} /> : null;

// ================================================================== STREET
export const Street: React.FC<EnvProps> = (props) => {
  const { palette: p, t, seed } = props;
  const ground = 860;
  const names = ["CAFÉ", "BOOKS", "BAKERY", "MARKET", "FLOWERS", "TECH", "PHARMACY", "DINER"];
  const walls = ["#e9c46a", "#f4a261", "#84a59d", "#b5838d", "#a3c4f3", "#e5989b", "#90be6d", "#f6bd60"];
  return (
    <>
      <Sky p={p} t={t} horizon={700} seed={seed} />
      <Clouds p={p} t={t} seed={seed} count={4} depth={0.06} />
      <Skyline {...props} depth={0.25} baseY={700} minH={200} maxH={420} color="#7c86b8" haze={0.55} windows={false} keyName="sfar" />
      <SvgLayer depth={0.85}>
        {Array.from({ length: 12 }).map((_, i) => {
          const x = WORLD_L + 100 + i * 430;
          return (
            <g key={i}>
              <rect x={x - 215} y={ground - 90 - 560} width={430} height={300} fill={lit(p, darken(walls[i % walls.length], 0.15))} />
              {[0, 1, 2].map((k) => (
                <rect key={k} x={x - 170 + k * 120} y={ground - 90 - 520} width={80} height={110} rx={6} fill={p.lightsOn && rnd(seed, "sw" + i + k) > 0.4 ? "#ffd77a" : lit(p, "#9fc9e6")} />
              ))}
              <Obj type="shop" x={x} y={ground - 90} s={1.075} t={t} color={walls[i % walls.length]} color2={["#e63946", "#2a9d8f", "#3a86ff", "#6a4c93"][i % 4]} props={{ text: names[i % names.length] }} />
            </g>
          );
        })}
      </SvgLayer>
      <Road {...props} y={ground} />
      <SvgLayer depth={1}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Obj key={i} type="streetlamp" x={WORLD_L + 450 + i * 860} y={ground - 70} s={0.95} t={t} />
        ))}
        <Obj type="plant" x={700} y={ground - 74} s={0.6} t={t} />
        <Obj type="bench" x={1300} y={ground - 72} s={0.85} t={t} />
      </SvgLayer>
    </>
  );
};

// ================================================================== SUBURB
export const Suburb: React.FC<EnvProps> = (props) => {
  const { palette: p, t, seed } = props;
  const ground = 850;
  const houseColors = ["#f4a261", "#a8dadc", "#e9c46a", "#f6bd60", "#cdb4db", "#b7e4c7"];
  return (
    <>
      <Sky p={p} t={t} horizon={680} seed={seed} />
      <Clouds p={p} t={t} seed={seed} count={6} depth={0.08} />
      <Hills p={p} seed={seed} color="#7fb77e" baseY={640} amp={120} depth={0.15} haze={0.55} keyName="h1" />
      <Hills p={p} seed={seed} color="#5fa55a" baseY={700} amp={90} depth={0.3} haze={0.3} keyName="h2" />
      <SvgLayer depth={0.5}>
        {Array.from({ length: 16 }).map((_, i) => (
          <Obj key={i} type={i % 3 === 0 ? "pine" : "tree"} x={WORLD_L + i * 330 + rnd(seed, "tx" + i) * 120} y={720} s={0.45 + rnd(seed, "ts" + i) * 0.2} t={t} color={i % 2 ? "#52b788" : "#40916c"} />
        ))}
      </SvgLayer>
      <SvgLayer depth={0.75}>
        <rect x={WORLD_L - 600} y={730} width={WORLD_W + 1200} height={400} fill={lit(p, "#74c69d")} />
        {Array.from({ length: 10 }).map((_, i) => (
          <Obj key={i} type="house" x={WORLD_L + 250 + i * 560} y={780} s={0.8} t={t} color={houseColors[i % houseColors.length]} color2={["#9d4b3a", "#3d405b", "#6d597a"][i % 3]} seed={"house" + i} />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <Obj key={"f" + i} type="fence" x={WORLD_L + 530 + i * 560} y={790} s={0.6} t={t} props={{ posts: 7 }} />
        ))}
      </SvgLayer>
      <Ground p={p} y={790} color="#80c98a" haze={0.05} />
      <SvgLayer depth={1}>
        <rect x={WORLD_L - 800} y={ground} width={WORLD_W + 1600} height={70} fill={lit(p, "#d6d0c4")} />
        <rect x={WORLD_L - 800} y={ground + 70} width={WORLD_W + 1600} height={600} fill={lit(p, "#4a4e5c")} />
        {Array.from({ length: 50 }).map((_, i) => (
          <rect key={i} x={WORLD_L - 800 + i * 160} y={ground + 150} width={90} height={10} rx={5} fill={lit(p, "#f1f1f1")} />
        ))}
        {Array.from({ length: 8 }).map((_, i) => (
          <Obj key={i} type="bush" x={WORLD_L + 120 + i * 650} y={ground - 2} s={0.6} t={t} />
        ))}
        <Obj type="streetlamp" x={1650} y={ground} s={0.9} t={t} />
      </SvgLayer>
    </>
  );
};

// ================================================================== FOREST
export const Forest: React.FC<EnvProps> = (props) => {
  const { palette: p, t, seed } = props;
  const ground = 880;
  const layer = (depth: number, y: number, s: number, haze: number, key: string, n: number) => (
    <SvgLayer depth={depth}>
      <path d={hillPath(seed, key, y + 30, 40)} fill={lit(p, "#2d6a4f", haze)} />
      {Array.from({ length: n }).map((_, i) => {
        const x = WORLD_L - 300 + (i * (WORLD_W + 600)) / n + rnd(seed, key + i) * 120;
        const ss = s * (0.8 + rnd(seed, key + "s" + i) * 0.5);
        return (
          <g key={i} transform={`translate(${x} ${y + 40}) scale(${ss})`}>
            <ObjectView type={rnd(seed, key + "k" + i) > 0.3 ? "pine" : "tree"} t={t} color={mix("#2d6a4f", p.haze, haze)} seed={key + i} lighting={1} />
          </g>
        );
      })}
    </SvgLayer>
  );
  return (
    <>
      <Sky p={p} t={t} horizon={620} seed={seed} sunX={1150} />
      <Hills p={p} seed={seed} color="#6a8caf" baseY={560} amp={220} depth={0.08} haze={0.6} keyName="m" step={340} />
      {layer(0.2, 600, 0.55, 0.62, "f1", 30)}
      {layer(0.4, 680, 0.8, 0.4, "f2", 24)}
      <SvgLayer depth={0.5}>
        <LightRays x={1150} y={-120} color={p.sun} t={t} opacity={p.time === "night" ? 0.05 : 0.22} spread={50} length={1400} angle={8} />
      </SvgLayer>
      {layer(0.65, 760, 1.05, 0.18, "f3", 16)}
      <Ground p={p} y={ground - 40} color="#5a8f3d" haze={0.05} />
      <SvgLayer depth={1}>
        <path d={smoothPath([[WORLD_L - 800, 900], [300, 880], [900, 905], [1500, 885], [2400, 900], [WORLD_R + 800, 890]] as Pt[], false) + ` L${WORLD_R + 800},960 L${WORLD_L - 800},960 Z`} fill={lit(p, "#a98467")} opacity={0.75} />
        {Array.from({ length: 26 }).map((_, i) => (
          <g key={i} transform={`translate(${WORLD_L + i * 190} ${ground - 30 + rnd(seed, "gy" + i) * 40}) scale(0.9)`}>
            <ObjectView type={i % 5 === 0 ? "flower" : "grass"} t={t} seed={"g" + i} color={i % 5 === 0 ? ["#ff6b9d", "#ffd166", "#c77dff"][i % 3] : undefined} />
          </g>
        ))}
        <Obj type="rock" x={1700} y={ground + 10} s={0.6} t={t} />
      </SvgLayer>
    </>
  );
};

/** Foreground bushes framing the forest shot (in front of characters). */
export const ForestFront: React.FC<EnvProps> = ({ t }) => (
  <SvgLayer depth={1.35}>
    {Array.from({ length: 6 }).map((_, i) => (
      <g key={i} transform={`translate(${WORLD_L + 300 + i * 900} 1120) scale(1.4)`}>
        <ObjectView type="bush" t={t} color="#1b4332" seed={"fb" + i} />
      </g>
    ))}
  </SvgLayer>
);

// =================================================================== OCEAN
const Waves: React.FC<{ y: number; amp: number; color: string; t: number; speed: number; wl: number; opacity?: number }> = ({ y, amp, color, t, speed, wl, opacity = 1 }) => {
  const pts: Pt[] = [];
  for (let x = WORLD_L - 900; x <= WORLD_R + 900; x += wl / 4) {
    pts.push([x, y + Math.sin((x / wl) * Math.PI * 2 + t * speed) * amp]);
  }
  return <path d={`${smoothPath(pts, false)} L${WORLD_R + 900},2000 L${WORLD_L - 900},2000 Z`} fill={color} opacity={opacity} />;
};

export const Ocean: React.FC<EnvProps> = (props) => {
  const { palette: p, t, seed, spec } = props;
  const horizon = 600;
  const sea = lit(p, "#1f7a8c");
  const shimmerId = useSvgId("shim");
  const beach = spec.props?.beach !== false;
  return (
    <>
      <Sky p={p} t={t} horizon={horizon} seed={seed} sunX={1300} />
      <Clouds p={p} t={t} seed={seed} count={5} depth={0.06} y={60} />
      <SvgLayer depth={0.12}>
        <path d={`M1700,${horizon + 2} Q1800,${horizon - 90} 1920,${horizon - 60} Q2050,${horizon - 120} 2200,${horizon + 2} Z`} fill={lit(p, "#2d6a4f", 0.55)} />
        <rect x={-2000} y={horizon} width={6000} height={1200} fill={sea} />
        <defs>
          <linearGradient id={shimmerId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={p.horizonGlow} stopOpacity={0.6} />
            <stop offset="1" stopColor={p.horizonGlow} stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect x={-2000} y={horizon} width={6000} height={120} fill={`url(#${shimmerId})`} />
        {Array.from({ length: 22 }).map((_, i) => {
          const w = 60 + rnd(seed, "sh" + i) * 140;
          const y = horizon + 12 + i * 14;
          const x = 1300 - w / 2 + Math.sin(t * 2 + i) * 30;
          return <rect key={i} x={x} y={y} width={w} height={4} rx={2} fill={p.sun} opacity={0.5 - i * 0.02} />;
        })}
      </SvgLayer>
      <SvgLayer depth={0.3}>
        <g transform={`translate(${400 + t * 12} ${horizon + 40}) scale(0.35)`}>
          <ObjectView type="sailboat" t={t} />
        </g>
        <Waves y={horizon + 70} amp={6} wl={260} color={lighten(sea, 0.06)} t={t} speed={1.2} opacity={0.6} />
      </SvgLayer>
      <SvgLayer depth={0.6}>
        <Waves y={horizon + 160} amp={10} wl={380} color={darken(sea, 0.05)} t={t} speed={1.6} opacity={0.8} />
      </SvgLayer>
      {beach ? (
        <>
          <SvgLayer depth={0.85}>
            <Waves y={790} amp={8} wl={500} color={lit(p, "#e9f5f9")} t={t} speed={1.4} opacity={0.8} />
            <Waves y={805} amp={6} wl={500} color={darken(sea, 0.08)} t={t + 0.3} speed={1.4} />
          </SvgLayer>
          <SvgLayer depth={1}>
            <path d={`${smoothPath([[WORLD_L - 900, 840], [0, 830], [900, 845], [1800, 828], [2700, 842], [WORLD_R + 900, 835]] as Pt[], false)} L${WORLD_R + 900},2000 L${WORLD_L - 900},2000 Z`} fill={lit(p, "#f2d7a1")} />
            <path d={`${smoothPath([[WORLD_L - 900, 960], [500, 950], [1500, 970], [WORLD_R + 900, 955]] as Pt[], false)} L${WORLD_R + 900},2000 L${WORLD_L - 900},2000 Z`} fill={lit(p, "#e9c88a")} />
            <Obj type="palm" x={140} y={880} s={1} t={t} />
            <Obj type="palm" x={1820} y={890} s={0.9} t={t} flip />
            <Obj type="rock" x={1550} y={870} s={0.4} t={t} />
          </SvgLayer>
        </>
      ) : (
        <SvgLayer depth={1}>
          <Waves y={850} amp={16} wl={520} color={darken(sea, 0.1)} t={t} speed={2} />
          <Waves y={930} amp={14} wl={460} color={darken(sea, 0.18)} t={t + 1} speed={2.2} />
        </SvgLayer>
      )}
    </>
  );
};

// ============================================================== UNDERWATER
/**
 * props (animatable [[t, v]…]): { murk: 0..1 (water clouds over), murkColor: "#4a3320",
 * life: 0..1 (fish & whale), oxygen: 0..1 (bubbles), dead: number of fish floating up belly-up }
 */
export const Underwater: React.FC<EnvProps> = (props) => {
  const { t, seed, spec } = props;
  const pr = spec.props ?? {};
  const cl = (v: number) => Math.max(0, Math.min(1, v));
  const murk = cl(tweenNum(pr.murk, t, 0));
  const murkC = tweenColor(pr.murkColor, t, "#4a3320");
  const life = cl(tweenNum(pr.life, t, 1));
  const oxygen = cl(tweenNum(pr.oxygen, t, 1));
  const dead = Math.max(0, Math.round(tweenNum(pr.dead, t, 0)));
  const W = (c: string, k = 1) => mix(c, murkC, murk * 0.8 * k);
  const bg = useSvgId("uw");
  const caust = useSvgId("cau");
  return (
    <>
      <SvgLayer depth={0.02}>
        <defs>
          <linearGradient id={bg} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={W("#3fc1d6")} />
            <stop offset="0.45" stopColor={W("#13729a")} />
            <stop offset="1" stopColor={W("#062c4d", 0.7)} />
          </linearGradient>
          <radialGradient id={caust}>
            <stop offset="0" stopColor="#bff6ff" stopOpacity={0.35} />
            <stop offset="1" stopColor="#bff6ff" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect x={-2000} y={-1500} width={6000} height={4000} fill={`url(#${bg})`} />
        <LightRays x={900} y={-200} color="#c8f7ff" t={t} opacity={0.25 * (1 - murk * 0.85)} spread={70} length={1500} angle={6} />
        {Array.from({ length: Math.round(14 * (1 - murk * 0.8)) }).map((_, i) => (
          <ellipse key={i} cx={(i * 210 + Math.sin(t * 0.6 + i) * 60) % 2400 - 200} cy={30 + Math.sin(t * 0.9 + i * 2) * 20} rx={160} ry={40} fill={`url(#${caust})`} />
        ))}
      </SvgLayer>
      <SvgLayer depth={0.2}>
        <path d={hillPath(seed, "uw1", 800, 160)} fill={W("#0b4f6c")} opacity={0.7} />
        {Array.from({ length: Math.round(12 * life) }).map((_, i) => {
          const x = ((i * 90 + t * 40) % 1400) - 200;
          const y = 380 + Math.sin(i * 1.7) * 60 + Math.sin(t * 2 + i) * 6;
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(0.22)`} opacity={0.55}>
              <ObjectView type="fish" t={t} color="#9bd4e4" seed={"sf" + i} lighting={0} />
            </g>
          );
        })}
      </SvgLayer>
      <SvgLayer depth={0.45}>
        <path d={hillPath(seed, "uw2", 880, 120)} fill={W("#0e6b80")} />
        <g transform={`translate(${1500 - t * 25} 300) scale(-0.55 0.55)`} opacity={0.9 * life}>
          <ObjectView type="whale" t={t} lighting={0} />
        </g>
      </SvgLayer>
      <SvgLayer depth={1}>
        <path d={`${smoothPath([[WORLD_L - 900, 900], [100, 880], [800, 910], [1600, 885], [2600, 905], [WORLD_R + 900, 890]] as Pt[], false)} L${WORLD_R + 900},2000 L${WORLD_L - 900},2000 Z`} fill="#d9c08d" />
        <path d={`${smoothPath([[WORLD_L - 900, 990], [600, 975], [1500, 995], [WORLD_R + 900, 980]] as Pt[], false)} L${WORLD_R + 900},2000 L${WORLD_L - 900},2000 Z`} fill="#c7a970" />
        {Array.from({ length: 22 }).map((_, i) => {
          const x = WORLD_L + i * 230 + rnd(seed, "sw" + i) * 80;
          const kind = i % 4 === 0 ? "coral" : i % 4 === 2 ? "rock" : "seaweed";
          const colors = ["#ff7f6e", "#ffb4a2", "#c77dff", "#f9c74f"];
          return (
            <g key={i} transform={`translate(${x} ${905 + rnd(seed, "sy" + i) * 30}) scale(${kind === "rock" ? 0.45 : 0.7 + rnd(seed, "ss" + i) * 0.5})`}>
              <ObjectView type={kind} t={t} color={kind === "coral" ? colors[i % 4] : kind === "seaweed" ? (i % 3 ? "#2a9d8f" : "#52b788") : "#6c757d"} seed={"u" + i} lighting={0} />
            </g>
          );
        })}
      </SvgLayer>
      <SvgLayer depth={1.05}>
        {Array.from({ length: Math.round(30 * oxygen) }).map((_, i) => {
          const ph = (t * (0.08 + rnd(seed, "bs" + i) * 0.1) + rnd(seed, "bp" + i)) % 1;
          const x = WORLD_L + rnd(seed, "bx" + i) * WORLD_W + Math.sin(t * 2 + i) * 12;
          const y = 1100 - ph * 1300;
          const r = 4 + rnd(seed, "br" + i) * 10;
          return <circle key={i} cx={x} cy={y} r={r} fill="none" stroke="#e0fbff" strokeWidth={2} opacity={0.6} />;
        })}
        {Array.from({ length: dead }).map((_, i) => {
          const x = 150 + rnd(seed, "dx" + i) * 1620;
          const rise = (t * (12 + rnd(seed, "dv" + i) * 10) + rnd(seed, "dy" + i) * 500) % 700;
          const y = 820 - rise + Math.sin(t + i) * 8;
          return (
            <g key={"d" + i} transform={`translate(${x} ${y}) rotate(${172 + Math.sin(t * 0.7 + i) * 6}) scale(${0.35 + rnd(seed, "ds" + i) * 0.2})`} opacity={0.85}>
              <ObjectView type="fish" t={0} color="#b8b2a0" seed={"df" + i} lighting={0} />
            </g>
          );
        })}
        {murk > 0 ? <rect x={-2000} y={-1500} width={6000} height={4000} fill={murkC} opacity={murk * 0.35} /> : null}
      </SvgLayer>
    </>
  );
};

// ================================================================== DESERT
export const Desert: React.FC<EnvProps> = (props) => {
  const { palette: p, t, seed } = props;
  return (
    <>
      <Sky p={p} t={t} horizon={650} seed={seed} sunX={1450} />
      <Hills p={p} seed={seed} color="#e0b77a" baseY={640} amp={60} depth={0.1} haze={0.5} keyName="d0" step={420} />
      <SvgLayer depth={0.22}>
        <Obj type="pyramid" x={600} y={680} s={0.75} t={t} />
        <Obj type="pyramid" x={1150} y={690} s={1.05} t={t} />
        <Obj type="pyramid" x={1620} y={680} s={0.55} t={t} />
      </SvgLayer>
      <Hills p={p} seed={seed} color="#e9c46a" baseY={760} amp={70} depth={0.45} haze={0.18} keyName="d1" step={500} />
      <SvgLayer depth={0.6}>
        <Obj type="palm" x={150} y={800} s={0.6} t={t} />
        <Obj type="palm" x={300} y={790} s={0.5} t={t} flip />
        <Obj type="palm" x={2200} y={800} s={0.65} t={t} />
      </SvgLayer>
      <Ground p={p} y={830} color="#f2cc8f" haze={0.05} />
      <SvgLayer depth={1}>
        {Array.from({ length: 14 }).map((_, i) => (
          <path key={i} d={`M${WORLD_L + i * 360},${900 + (i % 3) * 30} q60,-14 120,0`} stroke={lit(p, "#d4a373")} strokeWidth={5} fill="none" strokeLinecap="round" />
        ))}
        <Obj type="cactus" x={1880} y={880} s={0.7} t={t} />
        <Obj type="rock" x={-80} y={900} s={0.5} t={t} color="#c08552" />
      </SvgLayer>
    </>
  );
};

// ================================================================ MEDIEVAL
export const Medieval: React.FC<EnvProps> = (props) => {
  const { palette: p, t, seed } = props;
  return (
    <>
      <Sky p={p} t={t} horizon={660} seed={seed} sunX={500} />
      <Clouds p={p} t={t} seed={seed} count={5} depth={0.07} />
      <Hills p={p} seed={seed} color="#7a9e7e" baseY={600} amp={160} depth={0.12} haze={0.55} keyName="m1" step={380} />
      <SvgLayer depth={0.28}>
        <path d={hillPath(seed, "ch", 690, 60)} fill={lit(p, "#6a994e", 0.25)} />
        <Obj type="castle" x={1200} y={660} s={0.62} t={t} />
      </SvgLayer>
      <SvgLayer depth={0.55}>
        <path d={hillPath(seed, "m2", 790, 50)} fill={lit(p, "#6a994e", 0.1)} />
        {Array.from({ length: 7 }).map((_, i) => (
          <Obj key={i} type="hut" x={WORLD_L + 400 + i * 700} y={800} s={0.65} t={t} color={i % 2 ? "#c8a27a" : "#d4b483"} />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <Obj key={"t" + i} type="tree" x={WORLD_L + 100 + i * 520} y={800} s={0.55} t={t} color="#588157" />
        ))}
      </SvgLayer>
      <Ground p={p} y={830} color="#7cb518" haze={0.05} />
      <SvgLayer depth={1}>
        <path d={`${smoothPath([[WORLD_L - 900, 870], [600, 860], [1500, 880], [WORLD_R + 900, 865]] as Pt[], false)} L${WORLD_R + 900},990 L${WORLD_L - 900},990 Z`} fill={lit(p, "#b08968")} />
        {Array.from({ length: 30 }).map((_, i) => (
          <ellipse key={i} cx={WORLD_L + i * 170 + rnd(seed, "st" + i) * 60} cy={900 + rnd(seed, "sy" + i) * 70} rx={18} ry={7} fill={lit(p, "#9c7a5b")} />
        ))}
        <Obj type="flag" x={1820} y={880} s={0.7} t={t} />
      </SvgLayer>
    </>
  );
};

// ================================================================== ANCIENT
export const Ancient: React.FC<EnvProps> = (props) => {
  const { palette: p, t, seed } = props;
  return (
    <>
      <Sky p={p} t={t} horizon={680} seed={seed} />
      <Clouds p={p} t={t} seed={seed} count={4} depth={0.07} />
      <Hills p={p} seed={seed} color="#a3b18a" baseY={620} amp={140} depth={0.12} haze={0.5} keyName="a1" step={420} />
      <SvgLayer depth={0.35}>
        <Obj type="temple" x={1150} y={760} s={0.9} t={t} />
        {[-500, 300, 1900, 2600].map((x, i) => (
          <Obj key={i} type="pine" x={x} y={770} s={0.45} t={t} color="#3a5a40" />
        ))}
      </SvgLayer>
      <Ground p={p} y={800} color="#d6c7a1" haze={0.08} />
      <SvgLayer depth={1}>
        {Array.from({ length: 40 }).map((_, i) => (
          <rect key={i} x={WORLD_L + (i % 20) * 260 + (i >= 20 ? 130 : 0)} y={870 + (i >= 20 ? 60 : 0)} width={250} height={56} rx={6} fill={lit(p, i % 3 ? "#cbb994" : "#bfae88")} stroke={lit(p, "#a8977a")} strokeWidth={3} />
        ))}
        <Obj type="pine" x={-250} y={860} s={0.8} t={t} color="#344e41" />
        <Obj type="pine" x={2150} y={860} s={0.75} t={t} color="#344e41" />
      </SvgLayer>
    </>
  );
};

// =================================================================== PARK
export const Park: React.FC<EnvProps> = (props) => {
  const { palette: p, t, seed } = props;
  return (
    <>
      <Sky p={p} t={t} horizon={700} seed={seed} />
      <Clouds p={p} t={t} seed={seed} count={6} depth={0.07} />
      <Skyline {...props} depth={0.15} baseY={700} minH={150} maxH={360} color="#7c86b8" haze={0.6} windows={false} keyName="pk" />
      <Hills p={p} seed={seed} color="#74c69d" baseY={720} amp={60} depth={0.3} haze={0.25} keyName="p1" step={500} />
      <SvgLayer depth={0.55}>
        {Array.from({ length: 14 }).map((_, i) => (
          <Obj key={i} type="tree" x={WORLD_L + i * 380 + rnd(seed, "px" + i) * 100} y={790} s={0.6 + rnd(seed, "ps" + i) * 0.25} t={t} color={["#52b788", "#40916c", "#74c69d"][i % 3]} />
        ))}
      </SvgLayer>
      <Ground p={p} y={800} color="#80c98a" haze={0.05} />
      <SvgLayer depth={1}>
        <path d={`${smoothPath([[WORLD_L - 900, 880], [500, 870], [1400, 890], [WORLD_R + 900, 875]] as Pt[], false)} L${WORLD_R + 900},960 L${WORLD_L - 900},960 Z`} fill={lit(p, "#e5d3b3")} />
        <Obj type="bench" x={1500} y={872} s={0.9} t={t} />
        <Obj type="streetlamp" x={300} y={872} s={0.9} t={t} />
        {Array.from({ length: 10 }).map((_, i) => (
          <g key={i} transform={`translate(${WORLD_L + 200 + i * 480} ${1000 + (i % 2) * 40})`}>
            <ObjectView type="flower" t={t} color={["#ff6b9d", "#ffd166", "#c77dff"][i % 3]} seed={"pf" + i} />
          </g>
        ))}
      </SvgLayer>
    </>
  );
};
