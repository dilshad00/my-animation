import React from "react";
import { SvgLayer } from "../camera/Camera";
import { darken, lighten, mix, withAlpha } from "../../utils/color";
import { lit } from "../../utils/lighting";
import { FONT_FAMILY } from "../../utils/fonts";
import { smoothPath, useSvgId, type Pt } from "../../utils/svg";
import { tweenColor, tweenNum } from "../../utils/tween";
import { ObjectView } from "../objects/registry";
import { rnd, type EnvProps } from "./common";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Deterministic wandering (Brownian-ish) drift for particle i. */
const drift = (seed: number, key: string, t: number, amp: number): [number, number] => {
  const a = rnd(seed, key + "a") * 6.28;
  const b = rnd(seed, key + "b") * 6.28;
  const s = 0.25 + rnd(seed, key + "s") * 0.35;
  return [Math.sin(t * s + a) * amp + Math.sin(t * s * 2.3 + b) * amp * 0.35, Math.cos(t * s * 0.8 + b) * amp + Math.sin(t * s * 1.7 + a) * amp * 0.3];
};

// ===================================================================== MICRO
/**
 * Microscope field of view. Props (counts are animatable → new ones pop in):
 *   fluid: "#f4ead2" background     cells: 0 red blood cells     spores: 0 (red-orange algae spores)
 *   bacteria: 0 rods                cocci: 0 round bacteria       dust: 0 mineral grains
 *   scale: "10 µm" scale-bar label  vignette: true
 */
export const Micro: React.FC<EnvProps> = ({ t, seed, spec }) => {
  const pr = spec.props ?? {};
  const fluid = tweenColor(pr.fluid ?? spec.color, t, "#f4ead2");
  const count = (k: string) => tweenNum(pr[k], t, 0);
  const R = 490;
  const cx = 960;
  const cy = 540;
  const grad = useSvgId("mf");
  const clip = useSvgId("mc");
  const vig = useSvgId("mv");
  // positions are spread over the disc using a sunflower pattern + jitter so they never clump
  const place = (i: number, n: number, key: string): [number, number] => {
    const k = (i + 0.5 + rnd(seed, key + "o") * 7) / Math.max(n, 12);
    const r = Math.sqrt(k % 1) * R * 0.92;
    const th = i * 2.39996 + rnd(seed, key + "th") * 0.8;
    return [cx + Math.cos(th) * r, cy + Math.sin(th) * r];
  };
  const pop = (c: number, i: number) => clamp01(c - i); // 0..1 grow-in for fractional counts

  const items: React.ReactNode[] = [];
  const dust = count("dust");
  for (let i = 0; i < Math.ceil(dust); i++) {
    const [x, y] = place(i, Math.ceil(dust), "du" + i);
    const [dx, dy] = drift(seed, "du" + i, t, 14);
    const pts: Pt[] = Array.from({ length: 7 }).map((_, k) => {
      const a = (k / 7) * Math.PI * 2;
      const rr = (10 + rnd(seed, `dur${i}${k}`) * 14) * (0.8 + rnd(seed, "dus" + i));
      return [Math.cos(a) * rr, Math.sin(a) * rr];
    });
    items.push(
      <g key={"d" + i} transform={`translate(${x + dx} ${y + dy}) rotate(${t * 8 + i * 40}) scale(${pop(dust, i)})`}>
        <path d={smoothPath(pts, true, 0.3)} fill={["#a0764b", "#c49a6c", "#8a6a4a"][i % 3]} stroke="#5c4128" strokeWidth={2} opacity={0.9} />
      </g>,
    );
  }
  const cells = count("cells");
  for (let i = 0; i < Math.ceil(cells); i++) {
    const [x, y] = place(i, Math.ceil(cells), "rc" + i);
    const [dx, dy] = drift(seed, "rc" + i, t, 22);
    const tilt = Math.sin(t * 0.5 + i) * 0.35;
    items.push(
      <g key={"c" + i} transform={`translate(${x + dx} ${y + dy}) rotate(${i * 37 + t * 6}) scale(${pop(cells, i)})`}>
        <ellipse rx={46} ry={46 * (1 - Math.abs(tilt))} fill="#c1121f" />
        <ellipse rx={24} ry={24 * (1 - Math.abs(tilt))} fill="#e5383b" />
        <ellipse rx={46} ry={46 * (1 - Math.abs(tilt))} fill="none" stroke="#7a0b13" strokeWidth={4} />
      </g>,
    );
  }
  const spores = count("spores");
  for (let i = 0; i < Math.ceil(spores); i++) {
    const [x, y] = place(i, Math.ceil(spores), "sp" + i);
    const [dx, dy] = drift(seed, "sp" + i, t, 18);
    const r = 26 + rnd(seed, "spr" + i) * 14;
    // slightly irregular outline so they read as organic cells, not discs
    const outline: Pt[] = Array.from({ length: 9 }).map((_, k) => {
      const a = (k / 9) * Math.PI * 2;
      const rr = r * (0.93 + rnd(seed, `spo${i}${k}`) * 0.14);
      return [Math.cos(a) * rr, Math.sin(a) * rr * 0.94];
    });
    items.push(
      <g key={"s" + i} transform={`translate(${x + dx} ${y + dy}) rotate(${i * 50 + t * 4}) scale(${pop(spores, i)})`}>
        <path d={smoothPath(outline.map(([a, b]) => [a * 1.22, b * 1.22] as Pt), true, 0.5)} fill="#f1d3b3" opacity={0.55} stroke="#b5651d" strokeWidth={1.5} />
        <path d={smoothPath(outline, true, 0.5)} fill="#c2410c" />
        <path d={smoothPath(outline.map(([a, b]) => [a * 0.78 - r * 0.08, b * 0.78 - r * 0.08] as Pt), true, 0.5)} fill="#ea580c" opacity={0.85} />
        {Array.from({ length: 11 }).map((_, k) => {
          const a = rnd(seed, `sg${i}${k}`) * 6.28;
          const d = Math.sqrt(rnd(seed, `sgd${i}${k}`)) * r * 0.7;
          return <circle key={k} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={r * (0.05 + rnd(seed, `sgr${i}${k}`) * 0.08)} fill={k % 3 ? "#7c2d12" : "#fdba74"} opacity={0.75} />;
        })}
        <ellipse cx={-r * 0.38} cy={-r * 0.4} rx={r * 0.22} ry={r * 0.13} fill="#ffffff" opacity={0.45} transform={`rotate(-35 ${-r * 0.38} ${-r * 0.4})`} />
      </g>,
    );
  }
  const bact = count("bacteria");
  for (let i = 0; i < Math.ceil(bact); i++) {
    const [x, y] = place(i, Math.ceil(bact), "ba" + i);
    const sp = 30 + rnd(seed, "bas" + i) * 30;
    const heading = rnd(seed, "bah" + i) * 360 + Math.sin(t * 0.6 + i) * 30;
    const travel = t * sp;
    const hx = Math.cos((heading * Math.PI) / 180);
    const hy = Math.sin((heading * Math.PI) / 180);
    // wrap inside a box around the field
    const wx = ((((x - cx + hx * travel + R) % (2 * R)) + 2 * R) % (2 * R)) - R + cx;
    const wy = ((((y - cy + hy * travel + R) % (2 * R)) + 2 * R) % (2 * R)) - R + cy;
    const col = ["#6a994e", "#7b2cbf", "#2a9d8f"][i % 3];
    const wig = (k: number) => Math.sin(t * 12 + i + k) * 6;
    items.push(
      <g key={"b" + i} transform={`translate(${wx} ${wy}) rotate(${heading}) scale(${pop(bact, i) * (0.75 + rnd(seed, "baz" + i) * 0.4)})`}>
        <path d={`M-34,0 Q-50,${wig(0)} -66,0 T-98,0`} stroke={darken(col, 0.3)} strokeWidth={3} fill="none" strokeLinecap="round" />
        <rect x={-36} y={-14} width={72} height={28} rx={14} fill={col} />
        <rect x={-28} y={-8} width={40} height={6} rx={3} fill={lighten(col, 0.35)} opacity={0.7} />
        <circle cx={14} cy={3} r={4} fill={darken(col, 0.35)} />
      </g>,
    );
  }
  const cocci = count("cocci");
  for (let i = 0; i < Math.ceil(cocci); i++) {
    const [x, y] = place(i, Math.ceil(cocci), "co" + i);
    const [dx, dy] = drift(seed, "co" + i, t, 26);
    const col = ["#9d4edd", "#e76f51"][i % 2];
    items.push(
      <g key={"o" + i} transform={`translate(${x + dx} ${y + dy}) scale(${pop(cocci, i)})`}>
        {[0, 1, 2].map((k) => (
          <circle key={k} cx={k * 22 - 22} cy={Math.sin(k + i) * 6} r={12} fill={col} stroke={darken(col, 0.3)} strokeWidth={2} />
        ))}
      </g>,
    );
  }

  return (
    <>
      <SvgLayer depth={0}>
        <rect x={-2000} y={-1500} width={6000} height={4000} fill="#050507" />
      </SvgLayer>
      <SvgLayer depth={1}>
        <defs>
          <radialGradient id={grad}>
            <stop offset="0" stopColor={lighten(fluid, 0.25)} />
            <stop offset="0.75" stopColor={fluid} />
            <stop offset="1" stopColor={darken(fluid, 0.25)} />
          </radialGradient>
          <radialGradient id={vig}>
            <stop offset="0.72" stopColor="#000" stopOpacity={0} />
            <stop offset="1" stopColor="#000" stopOpacity={0.55} />
          </radialGradient>
          <clipPath id={clip}>
            <circle cx={cx} cy={cy} r={R} />
          </clipPath>
        </defs>
        <circle cx={cx} cy={cy} r={R} fill={`url(#${grad})`} />
        <g clipPath={`url(#${clip})`}>
          {/* faint out-of-focus blobs for depth */}
          {Array.from({ length: 10 }).map((_, i) => {
            const [dx, dy] = drift(seed, "bg" + i, t, 30);
            return <circle key={i} cx={cx - R + rnd(seed, "bgx" + i) * 2 * R + dx} cy={cy - R + rnd(seed, "bgy" + i) * 2 * R + dy} r={40 + rnd(seed, "bgr" + i) * 80} fill={darken(fluid, 0.12)} opacity={0.25} />;
          })}
          {items}
          {/* reticle */}
          <path d={`M${cx - R},${cy} L${cx + R},${cy} M${cx},${cy - R} L${cx},${cy + R}`} stroke="#000" strokeWidth={1.5} opacity={0.12} />
        </g>
        {pr.vignette !== false ? <circle cx={cx} cy={cy} r={R} fill={`url(#${vig})`} /> : null}
        <circle cx={cx} cy={cy} r={R + 6} fill="none" stroke="#1b1b22" strokeWidth={14} />
        <circle cx={cx} cy={cy} r={R + 18} fill="none" stroke="#2c2c36" strokeWidth={10} />
        {pr.scale !== false ? (
          <g transform={`translate(${cx + R * 0.45} ${cy + R * 0.72})`}>
            <rect x={0} y={0} width={110} height={8} rx={2} fill="#14141a" />
            <text x={55} y={-10} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={700} fontSize={22} fill="#14141a">
              {typeof pr.scale === "string" ? pr.scale : "10 µm"}
            </text>
          </g>
        ) : null}
      </SvgLayer>
    </>
  );
};

// ================================================================== CUTAWAY
const SoilLayers: React.FC<{ top: number; seed: number; L: (c: string) => string; wet: number; water: string }> = ({ top, seed, L, wet, water }) => {
  const bands = ["#8b5e3c", "#7a4f31", "#6b4429", "#5a3a24"];
  return (
    <g>
      {bands.map((c, i) => {
        const y0 = top + i * ((1100 - top) / bands.length);
        const pts: Pt[] = Array.from({ length: 12 }).map((_, k) => [-900 + k * 330, y0 + (i ? rnd(seed, `sl${i}${k}`) * 30 - 15 : 0)]);
        return <path key={i} d={`${smoothPath(pts, false)} L2730,1400 L-900,1400 Z`} fill={L(mix(c, darken(water, 0.4), wet * 0.35))} />;
      })}
      {Array.from({ length: 70 }).map((_, i) => {
        const x = -400 + rnd(seed, "st" + i) * 2800;
        const y = top + 30 + rnd(seed, "sty" + i) * (1080 - top);
        const r = 5 + rnd(seed, "str" + i) * 16;
        return <ellipse key={i} cx={x} cy={y} rx={r * 1.3} ry={r} fill={L(["#a68a6d", "#94785d", "#b49a7c"][i % 3])} opacity={0.7} />;
      })}
    </g>
  );
};

/**
 * Cross-section of the ground. Props (animatable):
 *   mode: "street" | "soil"
 *   street → liquid: "#4f8fc0", level: 0.35 (sewer fill 0..1), flow: 1, clog: 0 (0..1 clots + slow flow), puddle: 0
 *   soil   → water: "#4f8fc0", wet: 0 (0..1 saturation), oxygen: 1 (air pockets), bacteria: 0, rot: 0 (roots darken), worms: 2
 */
export const Cutaway: React.FC<EnvProps> = (props) => (props.spec.props?.mode === "soil" ? <SoilCutaway {...props} /> : <StreetCutaway {...props} />);

const SurfaceSky: React.FC<{ p: EnvProps["palette"]; y: number }> = ({ p, y }) => {
  const g = useSvgId("csky");
  return (
    <SvgLayer depth={0.1}>
      <defs>
        <linearGradient id={g} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={p.skyTop} />
          <stop offset="1" stopColor={p.skyBottom} />
        </linearGradient>
      </defs>
      <rect x={-2000} y={-1500} width={6000} height={1500 + y + 40} fill={`url(#${g})`} />
    </SvgLayer>
  );
};

const StreetCutaway: React.FC<EnvProps> = ({ palette: p, t, seed, spec }) => {
  const pr = spec.props ?? {};
  const L = (c: string) => lit(p, c);
  const liquid = tweenColor(pr.liquid, t, spec.rainColor ?? "#4f8fc0");
  const clog = clamp01(tweenNum(pr.clog, t, 0));
  const level = clamp01(tweenNum(pr.level, t, 0.35) + clog * 0.45);
  const flow = tweenNum(pr.flow, t, 1) * (1 - clog * 0.9);
  const puddle = clamp01(tweenNum(pr.puddle, t, 0));
  const road = 400;
  const pipeY = 760;
  const pipeH = 190;
  const drainX = 620;
  const clip = useSvgId("pipe");
  const travel = t * 160 * flow;
  const liquidTop = pipeY + pipeH * (1 - level);
  const raining = p.weather === "rain" || p.weather === "storm";
  return (
    <>
      <SurfaceSky p={p} y={road} />
      <SvgLayer depth={0.35}>
        {Array.from({ length: 12 }).map((_, i) => {
          const h = 160 + rnd(seed, "cb" + i) * 200;
          const x = -500 + i * 260;
          return (
            <g key={i}>
              <rect x={x} y={road - 40 - h} width={220} height={h} fill={L(["#5c677d", "#7d8597", "#4a5568"][i % 3])} />
              {Array.from({ length: Math.floor(h / 50) }).map((_, k) => (
                <rect key={k} x={x + 30} y={road - 40 - h + 20 + k * 50} width={160} height={18} fill={p.lightsOn ? "#ffd27a" : L("#a9c4dd")} opacity={0.7} />
              ))}
            </g>
          );
        })}
      </SvgLayer>
      {raining ? <SurfaceRain t={t} seed={seed} bottom={road - 4} color={spec.rainColor ?? "#cfe3ff"} coloured={!!spec.rainColor} /> : null}
      <SvgLayer depth={1}>
        {/* sidewalk + kerb + road slab */}
        <rect x={-900} y={road - 40} width={1300} height={40} fill={L("#c9c2b5")} />
        <rect x={400} y={road - 40} width={14} height={40} fill={L("#9d968a")} />
        <rect x={-900} y={road} width={3700} height={50} fill={L("#3d3d45")} />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x={900 + i * 260} y={road - 6} width={140} height={6} fill={L("#f1f1f1")} opacity={0.8} />
        ))}
        {/* puddle on the road surface */}
        {puddle > 0 ? <ellipse cx={1200} cy={road - 2} rx={500 * puddle} ry={10 * puddle} fill={L(liquid)} opacity={0.9} /> : null}
        <SoilLayers top={road + 50} seed={seed} L={L} wet={level * 0.5} water={liquid} />
        {/* storm drain grate + vertical shaft */}
        <rect x={drainX - 60} y={road - 4} width={120} height={10} fill={L("#1f1f24")} />
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={drainX - 52 + i * 19} y={road - 4} width={8} height={10} fill={L("#5c5c66")} />
        ))}
        <rect x={drainX - 50} y={road + 6} width={100} height={pipeY - road + 10} fill={L("#3a3f47")} />
        <rect x={drainX - 40} y={road + 6} width={80} height={pipeY - road + 10} fill={L("#1d2127")} />
        {/* water pouring down the shaft */}
        {raining || puddle > 0 || level > 0.05
          ? Array.from({ length: 10 }).map((_, i) => {
              const y = road + 10 + ((t * 420 + i * 60) % (pipeY - road));
              return <rect key={i} x={drainX - 16 + (i % 3) * 10} y={y} width={6} height={40} rx={3} fill={L(liquid)} opacity={0.85} />;
            })
          : null}
        {/* service pipes */}
        <rect x={-900} y={560} width={3700} height={34} fill={L("#a3714f")} />
        <rect x={-900} y={560} width={3700} height={8} fill={L("#c48a62")} />
        <rect x={1500} y={road + 50} width={40} height={pipeY - road - 50} fill={L("#71797e")} />
        {/* main sewer pipe (side view) */}
        <defs>
          <clipPath id={clip}>
            <rect x={-900} y={pipeY} width={3700} height={pipeH} rx={20} />
          </clipPath>
        </defs>
        <rect x={-900} y={pipeY - 18} width={3700} height={pipeH + 36} rx={30} fill={L("#6c757d")} />
        <rect x={-900} y={pipeY} width={3700} height={pipeH} fill={L("#1b1e22")} />
        <g clipPath={`url(#${clip})`}>
          <path
            d={`${smoothPath(Array.from({ length: 30 }).map((_, k) => [-900 + k * 130, liquidTop + Math.sin(k * 0.9 - t * 4 * flow) * 4] as Pt), false)} L2900,${pipeY + pipeH + 10} L-900,${pipeY + pipeH + 10} Z`}
            fill={L(liquid)}
          />
          {Array.from({ length: 26 }).map((_, i) => {
            const x = ((rnd(seed, "fl" + i) * 3800 + travel) % 3800) - 900;
            const y = liquidTop + 12 + rnd(seed, "fly" + i) * Math.max(4, pipeY + pipeH - liquidTop - 20);
            return <rect key={i} x={x} y={y} width={60 + rnd(seed, "flw" + i) * 80} height={4} rx={2} fill={lighten(liquid, 0.35)} opacity={0.4} />;
          })}
          {/* clots that build up and stick */}
          {Array.from({ length: Math.ceil(clog * 14) }).map((_, i) => {
            const x = 1100 + i * 46 + rnd(seed, "cl" + i) * 30;
            const r = 22 + rnd(seed, "clr" + i) * 30;
            return <ellipse key={i} cx={x} cy={pipeY + pipeH - r * 0.7} rx={r * 1.3} ry={r} fill={L(darken(liquid, 0.45))} opacity={clamp01(clog * 14 - i)} />;
          })}
        </g>
        {Array.from({ length: 9 }).map((_, i) => (
          <rect key={i} x={-860 + i * 440} y={pipeY - 24} width={22} height={pipeH + 48} rx={6} fill={L("#555d63")} />
        ))}
      </SvgLayer>
    </>
  );
};

/** Rain that stops at a ground line (cutaways draw weather themselves). */
const SurfaceRain: React.FC<{ t: number; seed: number; bottom: number; color: string; coloured: boolean }> = ({ t, seed, bottom, color, coloured }) => (
  <SvgLayer depth={1}>
    {Array.from({ length: 120 }).map((_, i) => {
      const span = bottom + 140;
      const y = ((rnd(seed, "cr" + i) * span + t * 1500) % span) - 120;
      const len = Math.min(44, bottom - y);
      if (len <= 0) return null;
      const x = -300 + rnd(seed, "crx" + i) * 2600 - y * 0.15;
      return <line key={i} x1={x} y1={y} x2={x - len * 0.15} y2={y + len} stroke={coloured ? mix(color, "#ff3344", 0.3) : color} strokeWidth={coloured ? 3.4 : 2} opacity={0.75} strokeLinecap="round" />;
    })}
    {Array.from({ length: 24 }).map((_, i) => {
      const ph = (t * 3 + rnd(seed, "cs" + i)) % 1;
      return <ellipse key={"s" + i} cx={-100 + rnd(seed, "csx" + i) * 2200} cy={bottom} rx={4 + ph * 14} ry={1 + ph * 3} fill="none" stroke={coloured ? mix(color, "#ff3344", 0.3) : color} strokeWidth={2} opacity={0.7 * (1 - ph)} />;
    })}
  </SvgLayer>
);

const SoilCutaway: React.FC<EnvProps> = ({ palette: p, t, seed, spec }) => {
  const pr = spec.props ?? {};
  const L = (c: string) => lit(p, c);
  const water = tweenColor(pr.water, t, spec.rainColor ?? "#4f8fc0");
  const wet = clamp01(tweenNum(pr.wet, t, 0));
  const oxygen = clamp01(tweenNum(pr.oxygen, t, 1));
  const bacteria = clamp01(tweenNum(pr.bacteria, t, 0));
  const rot = clamp01(tweenNum(pr.rot, t, 0));
  const worms = Math.round(tweenNum(pr.worms, t, 2));
  const surface = 380;
  const plantC = mix("#5aa846", "#6b5a2e", rot);
  const rootC = mix("#e9d8a6", "#3b2a1a", rot);
  const plants = [180, 560, 940, 1320, 1700];
  return (
    <>
      <SurfaceSky p={p} y={surface} />
      {p.weather === "rain" || p.weather === "storm" ? <SurfaceRain t={t} seed={seed} bottom={surface - 14} color={spec.rainColor ?? "#cfe3ff"} coloured={!!spec.rainColor} /> : null}
      <SvgLayer depth={1}>
        <SoilLayers top={surface} seed={seed} L={L} wet={wet} water={water} />
        {/* water seeping down from the surface */}
        {wet > 0 ? (
          <rect x={-900} y={surface} width={3700} height={(1080 - surface) * wet} fill={L(water)} opacity={0.32} />
        ) : null}
        {wet > 0
          ? Array.from({ length: 40 }).map((_, i) => {
              const x = -200 + rnd(seed, "sw" + i) * 2400;
              const y = surface + ((t * 50 + rnd(seed, "swy" + i) * 700) % ((1080 - surface) * wet + 1));
              return <ellipse key={i} cx={x} cy={y} rx={4} ry={9} fill={L(water)} opacity={0.7} />;
            })
          : null}
        {/* roots */}
        {plants.map((x, i) => (
          <g key={i} stroke={L(rootC)} fill="none" strokeLinecap="round">
            {Array.from({ length: 6 }).map((_, k) => {
              const dx = (k - 2.5) * 40 + rnd(seed, `rt${i}${k}`) * 30;
              const d = 220 + rnd(seed, `rd${i}${k}`) * 220;
              return (
                <g key={k}>
                  <path d={`M${x},${surface} Q${x + dx * 0.4},${surface + d * 0.4} ${x + dx},${surface + d}`} strokeWidth={9 - k * 0.6} />
                  <path d={`M${x + dx * 0.5},${surface + d * 0.55} q${dx > 0 ? 40 : -40},20 ${dx > 0 ? 60 : -60},70`} strokeWidth={4} />
                </g>
              );
            })}
          </g>
        ))}
        {/* air pockets (oxygen) */}
        {Array.from({ length: 46 }).map((_, i) => {
          const x = -100 + rnd(seed, "ox" + i) * 2200;
          const y = surface + 40 + rnd(seed, "oy" + i) * (1040 - surface);
          const vis = clamp01(oxygen * 46 - i);
          const r = 7 + rnd(seed, "or" + i) * 9;
          return vis > 0 ? (
            <g key={i} opacity={vis}>
              <circle cx={x} cy={y + Math.sin(t * 2 + i) * 2} r={r * (0.6 + 0.4 * vis)} fill="#d9f2ff" stroke="#7cc4e8" strokeWidth={2} />
              {i % 6 === 0 && vis > 0.9 ? (
                <text x={x} y={y + 4} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={800} fontSize={10} fill="#2b6b8f">
                  O₂
                </text>
              ) : null}
            </g>
          ) : null;
        })}
        {/* bacteria colonies spreading */}
        {Array.from({ length: 60 }).map((_, i) => {
          const vis = clamp01(bacteria * 60 - i);
          if (vis <= 0) return null;
          const x = -100 + rnd(seed, "bx" + i) * 2200 + Math.sin(t + i) * 3;
          const y = surface + 30 + rnd(seed, "by" + i) * (1040 - surface);
          return <rect key={i} x={x - 9} y={y - 4} width={18} height={8} rx={4} fill={["#7b2cbf", "#6a994e"][i % 2]} opacity={0.85 * vis} transform={`rotate(${rnd(seed, "br" + i) * 180} ${x} ${y})`} />;
        })}
        {/* earthworms */}
        {Array.from({ length: worms }).map((_, i) => {
          const y = 640 + i * 230;
          const x0 = ((t * 30 + i * 900) % 2400) - 200;
          const pts: Pt[] = Array.from({ length: 8 }).map((_, k) => [x0 - k * 18, y + Math.sin(t * 4 - k * 0.8 + i) * 8]);
          return <path key={i} d={smoothPath(pts, false)} stroke={L("#d4867a")} strokeWidth={14} fill="none" strokeLinecap="round" />;
        })}
        {/* surface: grass strip and crops */}
        <rect x={-900} y={surface - 14} width={3700} height={22} fill={L(mix("#6aa84f", "#6b5a2e", rot * 0.8))} />
        {plants.map((x, i) => {
          const sway = Math.sin(t * 1.5 + i) * 6;
          const droop = rot * 40;
          return (
            <g key={i} stroke={L(plantC)} strokeLinecap="round" fill="none">
              <path d={`M${x},${surface} Q${x + sway},${surface - 120} ${x + sway + droop * 0.5},${surface - 230 + droop}`} strokeWidth={10} />
              {[0, 1, 2, 3].map((k) => {
                const yy = surface - 60 - k * 45;
                const side = k % 2 ? 1 : -1;
                return <path key={k} d={`M${x + sway * (k / 4)},${yy} q${side * 50},${-30 + droop * 0.6} ${side * 90},${10 + droop}`} strokeWidth={8} />;
              })}
            </g>
          );
        })}
      </SvgLayer>
    </>
  );
};

// =================================================================== WINDOW
/**
 * Close-up of a window from inside. Props (animatable):
 *   open: 1 (curtains 0 = closed … 1 = open)    streaks: 1 (amount of running drops on the glass, 0..2)
 *   drops: drop colour (defaults to environment rainColor or pale blue)
 *   wall: "#e8d5c4"   curtain: "#e76f51"   view: "city" | "suburb" | "sky"
 */
export const WindowEnv: React.FC<EnvProps> = ({ palette: p, t, seed, spec }) => {
  const pr = spec.props ?? {};
  const L = (c: string) => lit(p, c);
  const open = clamp01(tweenNum(pr.open, t, 1));
  const streaks = tweenNum(pr.streaks, t, 1);
  const dropC = tweenColor(pr.drops, t, spec.rainColor ?? "#bcd7ee");
  const wall = (pr.wall as string) ?? spec.color ?? "#e8d5c4";
  const curtain = (pr.curtain as string) ?? "#e76f51";
  const view = (pr.view as string) ?? "city";
  const W = { x: 380, y: 110, w: 1160, h: 760 };
  const sky = useSvgId("wsky");
  const glass = useSvgId("wgl");
  const trail = useSvgId("tr");
  const raining = p.weather === "rain" || p.weather === "storm" || !!spec.rainColor;
  const coloured = !!spec.rainColor || pr.drops !== undefined;
  const nStreak = Math.round(26 * streaks);
  return (
    <>
      <SvgLayer depth={0.3}>
        <defs>
          <linearGradient id={sky} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={p.skyTop} />
            <stop offset="1" stopColor={p.skyBottom} />
          </linearGradient>
          <clipPath id={glass}>
            <rect x={W.x} y={W.y} width={W.w} height={W.h} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${glass})`}>
          <rect x={W.x - 200} y={W.y - 200} width={W.w + 400} height={W.h + 400} fill={`url(#${sky})`} />
          {(raining ? [0.3, 0.6, 0.85] : [0.2, 0.5]).map((k, i) => (
            <ellipse key={i} cx={W.x + ((k * W.w + t * 8 * (i + 1)) % (W.w + 400)) - 100} cy={W.y + 90 + i * 40} rx={220} ry={50} fill={raining ? mix("#8a94a6", spec.rainColor ?? "#8a94a6", 0.35) : "#ffffff"} opacity={0.75} />
          ))}
          {view !== "sky"
            ? Array.from({ length: 11 }).map((_, i) => {
                const h = view === "suburb" ? 120 + rnd(seed, "wh" + i) * 60 : 220 + rnd(seed, "wh" + i) * 330;
                const x = W.x - 60 + i * 120;
                const c = L(view === "suburb" ? ["#d98e73", "#c9b79c", "#a3b18a"][i % 3] : ["#6c7a93", "#59657d", "#7f8ba3"][i % 3]);
                return (
                  <g key={i} opacity={0.85}>
                    <rect x={x} y={W.y + W.h - h} width={110} height={h} fill={mix(c, p.haze, 0.35)} />
                    {view === "suburb" ? <path d={`M${x - 8},${W.y + W.h - h} L${x + 55},${W.y + W.h - h - 50} L${x + 118},${W.y + W.h - h} Z`} fill={mix(L("#7f4f3a"), p.haze, 0.3)} /> : null}
                    {Array.from({ length: Math.floor(h / 60) }).map((_, k) => (
                      <rect key={k} x={x + 20} y={W.y + W.h - h + 20 + k * 60} width={70} height={22} fill={p.lightsOn ? "#ffd27a" : "#cfe0f0"} opacity={0.6} />
                    ))}
                  </g>
                );
              })
            : null}
          {/* falling rain outside */}
          {raining
            ? Array.from({ length: 90 }).map((_, i) => {
                const y = ((rnd(seed, "or" + i) * 1000 + t * 1300) % 1000) + W.y - 100;
                const x = W.x + rnd(seed, "orx" + i) * W.w - (y - W.y) * 0.12;
                return <line key={i} x1={x} y1={y} x2={x - 5} y2={y + 34} stroke={coloured ? dropC : "#dbe9f7"} strokeWidth={coloured ? 3 : 2} opacity={0.55} strokeLinecap="round" />;
              })
            : null}
          {/* glass tint + reflection */}
          <rect x={W.x} y={W.y} width={W.w} height={W.h} fill="#bcd7ee" opacity={0.08} />
          <path d={`M${W.x + 80},${W.y} L${W.x + 260},${W.y} L${W.x + 60},${W.y + W.h} L${W.x - 120},${W.y + W.h} Z`} fill="#ffffff" opacity={0.08} />
          {/* beads stuck on the glass */}
          {raining
            ? Array.from({ length: 70 }).map((_, i) => {
                const x = W.x + rnd(seed, "bd" + i) * W.w;
                const y = W.y + rnd(seed, "bdy" + i) * W.h;
                const r = 3 + rnd(seed, "bdr" + i) * 6;
                return (
                  <g key={i}>
                    <ellipse cx={x} cy={y} rx={r} ry={r * 1.15} fill={dropC} opacity={coloured ? 0.8 : 0.45} />
                    <circle cx={x - r * 0.3} cy={y - r * 0.35} r={r * 0.3} fill="#ffffff" opacity={0.6} />
                  </g>
                );
              })
            : null}
          {/* running drops that leave trails */}
          {raining
            ? Array.from({ length: nStreak }).map((_, i) => {
                const period = 2.2 + rnd(seed, "rp" + i) * 3;
                const ph = ((t + rnd(seed, "ro" + i) * period) % period) / period;
                const x0 = W.x + 20 + rnd(seed, "rx" + i) * (W.w - 40);
                const yStart = W.y - 20 + rnd(seed, "ry" + i) * 200;
                const y = yStart + ph * (W.h + 60);
                const wob = Math.sin(ph * 14 + i) * 5;
                const w = coloured ? 7 + rnd(seed, "rw" + i) * 5 : 5 + rnd(seed, "rw" + i) * 3;
                const tail = Math.min(y - yStart, 140 + rnd(seed, "rt" + i) * 160);
                return (
                  <g key={"r" + i}>
                    <defs>
                      <linearGradient id={trail + i} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0" stopColor={dropC} stopOpacity={0} />
                        <stop offset="1" stopColor={dropC} stopOpacity={coloured ? 0.8 : 0.4} />
                      </linearGradient>
                    </defs>
                    <path d={`M${x0 - w * 0.25},${y - tail} L${x0 + w * 0.25},${y - tail} L${x0 + wob * 0.6 + w * 0.3},${y} L${x0 + wob * 0.6 - w * 0.3},${y} Z`} fill={`url(#${trail + i})`} />
                    <ellipse cx={x0 + wob * 0.6} cy={y + w * 0.5} rx={w * 0.85} ry={w * 1.1} fill={coloured ? darken(dropC, 0.1) : dropC} opacity={coloured ? 0.95 : 0.6} />
                    <circle cx={x0 + wob * 0.6 - w * 0.25} cy={y + w * 0.2} r={w * 0.25} fill="#ffffff" opacity={0.6} />
                  </g>
                );
              })
            : null}
        </g>
      </SvgLayer>
      <SvgLayer depth={1}>
        {/* wall with a hole for the window */}
        <path d={`M-900,-600 L2800,-600 L2800,1700 L-900,1700 Z M${W.x},${W.y} L${W.x},${W.y + W.h} L${W.x + W.w},${W.y + W.h} L${W.x + W.w},${W.y} Z`} fill={L(wall)} fillRule="evenodd" />
        {/* frame + mullions */}
        <rect x={W.x - 26} y={W.y - 26} width={W.w + 52} height={W.h + 52} fill="none" stroke={L("#f6f1ea")} strokeWidth={34} />
        <rect x={W.x - 44} y={W.y - 44} width={W.w + 88} height={W.h + 88} fill="none" stroke={L(darken(wall, 0.12))} strokeWidth={4} />
        <rect x={W.x + W.w / 2 - 12} y={W.y} width={24} height={W.h} fill={L("#f6f1ea")} />
        <rect x={W.x} y={W.y + W.h * 0.42 - 10} width={W.w} height={20} fill={L("#f6f1ea")} />
        {/* sill */}
        <rect x={W.x - 90} y={W.y + W.h + 18} width={W.w + 180} height={36} rx={6} fill={L("#efe7dc")} />
        <rect x={W.x - 90} y={W.y + W.h + 50} width={W.w + 180} height={12} fill={L(darken(wall, 0.2))} opacity={0.5} />
        <g transform={`translate(${W.x + 150} ${W.y + W.h + 22}) scale(0.55)`}>
          <ObjectView type="plant" t={t} />
        </g>
        {/* rail */}
        <rect x={W.x - 160} y={W.y - 90} width={W.w + 320} height={16} rx={8} fill={L("#5c4033")} />
        {/* curtains: each covers half the window when closed */}
        {[-1, 1].map((side) => {
          const half = W.w / 2 + 100;
          const minW = 150;
          const cw = minW + (half - minW) * (1 - open);
          const x0 = side < 0 ? W.x - 130 : W.x + W.w + 130 - cw;
          const folds = 6;
          const sway = Math.sin(t * 1.2 + side) * 6;
          const bottom = W.y + W.h + 120;
          return (
            <g key={side}>
              <path d={`M${x0},${W.y - 84} L${x0 + cw},${W.y - 84} Q${x0 + cw + sway},${(W.y + bottom) / 2} ${x0 + cw + sway * 1.5},${bottom} L${x0 + sway},${bottom} Q${x0 + sway * 0.5},${(W.y + bottom) / 2} ${x0},${W.y - 84} Z`} fill={L(curtain)} />
              {Array.from({ length: folds }).map((_, k) => {
                const fx = x0 + ((k + 0.5) / folds) * cw;
                return <path key={k} d={`M${fx},${W.y - 84} Q${fx + sway},${(W.y + bottom) / 2} ${fx + sway * 1.5},${bottom}`} stroke={L(darken(curtain, 0.18))} strokeWidth={Math.max(3, cw / folds / 4)} fill="none" opacity={0.7} />;
              })}
              {Array.from({ length: 8 }).map((_, k) => (
                <circle key={k} cx={x0 + 12 + (k / 7) * (cw - 24)} cy={W.y - 82} r={9} fill={L("#3b2a20")} />
              ))}
            </g>
          );
        })}
      </SvgLayer>
      {/* room light falling on the wall */}
      <SvgLayer depth={1}>
        <rect x={-900} y={-600} width={3700} height={2300} fill={withAlpha(p.time === "night" ? "#0b1030" : "#000000", p.time === "night" ? 0.25 : 0.04)} />
      </SvgLayer>
    </>
  );
};
