import React from "react";
import { random } from "remotion";
import { SvgLayer } from "../camera/Camera";
import { darken, lighten, withAlpha } from "../../utils/color";
import type { Palette } from "../../utils/lighting";
import { lit } from "../../utils/lighting";
import { useSvgId } from "../../utils/svg";
import { ObjectView } from "../objects/registry";
import { ScreenContent } from "../objects/tech";
import { Cloud, rnd, type EnvProps } from "./common";

const Obj: React.FC<{ type: string; x: number; y: number; s?: number; t: number; color?: string; props?: Record<string, unknown>; flip?: boolean }> = ({
  type,
  x,
  y,
  s = 1,
  t,
  color,
  props,
  flip,
}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
    <ObjectView type={type} t={t} color={color} props={props} seed={`${type}${x}`} lighting={0.5} />
  </g>
);

/** A window that shows the outside sky for the current time of day. */
export const SkyWindow: React.FC<{ x: number; y: number; w: number; h: number; p: Palette; t: number; city?: boolean; frame?: string; seed: number; rain?: string }> = ({
  rain,
  x,
  y,
  w,
  h,
  p,
  t,
  city,
  frame = "#f8f9fa",
  seed,
}) => {
  const clip = useSvgId("win");
  const g = useSvgId("wsky");
  return (
    <g>
      <defs>
        <clipPath id={clip}>
          <rect x={x} y={y} width={w} height={h} />
        </clipPath>
        <linearGradient id={g} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={p.skyTop} />
          <stop offset="1" stopColor={p.skyBottom} />
        </linearGradient>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect x={x} y={y} width={w} height={h} fill={`url(#${g})`} />
        {p.stars > 0
          ? Array.from({ length: 30 }).map((_, i) => (
              <circle key={i} cx={x + random(`${seed}ws${i}`) * w} cy={y + random(`${seed}wy${i}`) * h * 0.6} r={1.5} fill="#fff" opacity={p.stars * (0.5 + 0.5 * Math.sin(t * 2 + i))} />
            ))
          : null}
        <Cloud x={x + ((t * 8) % (w + 300)) - 100} y={y + h * 0.3} s={0.5} color={p.time === "night" ? "#3a4677" : "#ffffff"} shade={p.time === "night" ? "#2a3460" : "#e6eef5"} />
        {city
          ? Array.from({ length: 14 }).map((_, i) => {
              const bw = 50 + random(`${seed}cb${i}`) * 70;
              const bh = h * (0.25 + random(`${seed}ch${i}`) * 0.5);
              const bx = x + i * (w / 12) - 20;
              return (
                <g key={i}>
                  <rect x={bx} y={y + h - bh} width={bw} height={bh} fill={lit(p, "#6c7a9c", 0.4)} />
                  {p.lightsOn
                    ? Array.from({ length: 6 }).map((__, k) => (
                        <rect key={k} x={bx + 8 + (k % 2) * 22} y={y + h - bh + 12 + Math.floor(k / 2) * 30} width={10} height={14} fill="#ffd77a" opacity={random(`${seed}${i}${k}`) > 0.4 ? 0.9 : 0} />
                      ))
                    : null}
                </g>
              );
            })
          : null}
        {rain
          ? Array.from({ length: Math.round((w * h) / 4500) }).map((_, i) => {
              const sp = 700 + random(`${seed}rv${i}`) * 400;
              const yy = y + ((random(`${seed}ry${i}`) * (h + 60) + t * sp) % (h + 60)) - 40;
              const xx = x + random(`${seed}rx${i}`) * w;
              return <line key={"r" + i} x1={xx} y1={yy} x2={xx - 4} y2={yy + 26} stroke={rain} strokeWidth={2.4} strokeLinecap="round" opacity={0.75} />;
            })
          : null}
      </g>
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={frame} strokeWidth={18} />
      <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke={frame} strokeWidth={10} />
      <line x1={x} y1={y + h * 0.45} x2={x + w} y2={y + h * 0.45} stroke={frame} strokeWidth={10} />
      <rect x={x - 20} y={y + h + 4} width={w + 40} height={18} rx={4} fill={darken(frame, 0.08)} />
    </g>
  );
};

const Room: React.FC<{ p: Palette; wall: string; floor: string; floorY: number; planks?: boolean; tiles?: boolean }> = ({ p, wall, floor, floorY, planks, tiles }) => {
  const g = useSvgId("wall");
  const lightOn = p.lightsOn;
  return (
    <>
      <SvgLayer depth={0.88}>
        <defs>
          <radialGradient id={g} cx="0.5" cy="0.25" r="0.9">
            <stop offset="0" stopColor={lighten(lit(p, wall), lightOn ? 0.12 : 0.06)} />
            <stop offset="1" stopColor={darken(lit(p, wall), 0.12)} />
          </radialGradient>
        </defs>
        <rect x={-1600} y={-800} width={5120} height={floorY + 800} fill={`url(#${g})`} />
        <rect x={-1600} y={floorY - 26} width={5120} height={26} fill={darken(lit(p, wall), 0.25)} />
      </SvgLayer>
      <SvgLayer depth={1}>
        <rect x={-1600} y={floorY} width={5120} height={1200} fill={lit(p, floor)} />
        {planks
          ? Array.from({ length: 8 }).map((_, i) => (
              <line key={i} x1={-1600} y1={floorY + 14 + i * i * 9} x2={3520} y2={floorY + 14 + i * i * 9} stroke={darken(lit(p, floor), 0.12)} strokeWidth={3} />
            ))
          : null}
        {tiles
          ? Array.from({ length: 40 }).map((_, i) => (
              <line key={i} x1={-1600 + i * 140} y1={floorY} x2={-1600 + i * 140 + (i * 140 - 2560) * 0.5} y2={floorY + 400} stroke={lighten(lit(p, floor), 0.12)} strokeWidth={2} opacity={0.6} />
            ))
          : null}
        <rect x={-1600} y={floorY} width={5120} height={60} fill="#000" opacity={0.08} />
      </SvgLayer>
    </>
  );
};

/** Rain colour seen through windows (undefined when it isn't raining). */
const windowRain = (p: Palette, spec: EnvProps["spec"]): string | undefined =>
  p.weather === "rain" || p.weather === "storm" || spec.rainColor ? ((spec.rainColor as string | undefined) ?? "#cfe3ff") : undefined;

// =============================================================== APARTMENT
export const Apartment: React.FC<EnvProps> = ({ palette: p, t, seed, spec }) => {
  const floorY = 880;
  const wall = (spec.color as string) ?? "#e8d5c4";
  return (
    <>
      <Room p={p} wall={wall} floor="#b08968" floorY={floorY} planks />
      <SvgLayer depth={0.88}>
        <SkyWindow x={1180} y={180} w={460} h={420} p={p} t={t} city seed={seed} rain={windowRain(p, spec)} />
        {/* curtains */}
        <path d={`M1130,150 Q1160,${400 + Math.sin(t) * 6} 1110,640 L1190,640 Q1210,400 1200,150 Z`} fill={lit(p, "#e76f51")} />
        <path d={`M1690,150 Q1660,${400 + Math.sin(t + 1) * 6} 1710,640 L1630,640 Q1610,400 1620,150 Z`} fill={lit(p, "#e76f51")} />
        <rect x={1100} y={140} width={620} height={14} rx={7} fill={lit(p, "#5c4033")} />
        {/* frames */}
        <rect x={260} y={250} width={170} height={130} fill={lit(p, "#ffffff")} stroke={lit(p, "#5c4033")} strokeWidth={10} />
        <path d="M275,365 L330,300 L370,340 L395,315 L420,365 Z" fill={lit(p, "#2a9d8f")} />
        <circle cx={390} cy={285} r={14} fill={lit(p, "#ffd166")} />
        <rect x={470} y={290} width={110} height={150} fill={lit(p, "#ffffff")} stroke={lit(p, "#5c4033")} strokeWidth={10} />
        <circle cx={525} cy={365} r={34} fill={lit(p, "#ef476f")} opacity={0.8} />
        <Obj type="clock" x={820} y={270} s={0.55} t={t} />
      </SvgLayer>
      <SvgLayer depth={1}>
        <ellipse cx={900} cy={floorY + 90} rx={520} ry={60} fill={lit(p, "#6d597a")} opacity={0.8} />
        <ellipse cx={900} cy={floorY + 90} rx={470} ry={48} fill="none" stroke={lit(p, "#ffd166")} strokeWidth={4} strokeDasharray="10 10" opacity={0.6} />
        <Obj type="bookshelf" x={-200} y={floorY} t={t} />
        <Obj type="sofa" x={420} y={floorY + 20} s={0.95} t={t} />
        <Obj type="floorlamp" x={1000} y={floorY + 10} t={t} props={{ on: p.lightsOn }} />
        <Obj type="plant" x={1800} y={floorY + 10} s={0.9} t={t} />
        <Obj type="table" x={2350} y={floorY + 10} t={t} />
      </SvgLayer>
      {p.lightsOn ? (
        <SvgLayer depth={1}>
          <circle cx={1000} cy={560} r={520} fill="#ffcf7a" opacity={0.07} />
        </SvgLayer>
      ) : null}
    </>
  );
};

// ================================================================== OFFICE
export const Office: React.FC<EnvProps> = ({ palette: p, t, seed, spec }) => {
  const floorY = 880;
  return (
    <>
      <Room p={p} wall={(spec.color as string) ?? "#dfe7ef"} floor="#8d99ae" floorY={floorY} tiles />
      <SvgLayer depth={0.88}>
        {[-700, 0, 700, 1400, 2100].map((x, i) => (
          <SkyWindow key={i} x={x} y={120} w={560} h={500} p={p} t={t} city seed={seed + i} frame="#cfd8e3" rain={windowRain(p, spec)} />
        ))}
        <Obj type="whiteboard" x={2950} y={780} t={t} props={{ text: String(spec.props?.board ?? "Q3 Goals") }} />
      </SvgLayer>
      <SvgLayer depth={1}>
        <Obj type="plant" x={-160} y={floorY + 6} t={t} />
        {[180, 1560].map((x, i) => (
          <g key={x}>
            <Obj type="desk" x={x} y={floorY + 4} t={t} />
            <Obj type="monitor" x={x - 60} y={floorY - 146} s={0.6} t={t} props={{ screen: i ? "code" : "chart" }} />
            <Obj type="chair" x={x + 150} y={floorY + 8} s={0.9} t={t} />
          </g>
        ))}
        <Obj type="server" x={2600} y={floorY + 4} s={0.95} t={t} />
        <Obj type="plant" x={2380} y={floorY + 6} s={0.8} t={t} />
      </SvgLayer>
    </>
  );
};

// ===================================================================== LAB
export const Lab: React.FC<EnvProps> = ({ t, seed, spec }) => {
  const floorY = 880;
  const glow = (spec.color as string) ?? "#4cc9f0";
  const bg = useSvgId("lab");
  const fl = useSvgId("labf");
  return (
    <>
      <SvgLayer depth={0.88}>
        <defs>
          <linearGradient id={bg} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#0b132b" />
            <stop offset="1" stopColor="#1c2541" />
          </linearGradient>
        </defs>
        <rect x={-1600} y={-800} width={5120} height={floorY + 800} fill={`url(#${bg})`} />
        {/* wall panels */}
        {Array.from({ length: 16 }).map((_, i) => (
          <g key={i}>
            <rect x={-1500 + i * 320} y={60} width={300} height={floorY - 120} rx={18} fill="#16213e" stroke="#243b6b" strokeWidth={3} />
            <rect x={-1500 + i * 320 + 30} y={90} width={240} height={6} rx={3} fill={glow} opacity={0.35 + 0.25 * Math.sin(t * 2 + i)} />
          </g>
        ))}
        {/* holographic displays */}
        {[[200, 180, "chart"], [760, 150, "globe"], [1320, 180, "code"]].map(([x, y, kind], i) => (
          <g key={i} transform={`translate(${x} ${(y as number) + Math.sin(t * 1.2 + i) * 6})`} opacity={0.9}>
            <rect x={-12} y={-12} width={404} height={264} rx={16} fill={withAlpha(glow, 0.08)} stroke={glow} strokeWidth={3} />
            <g opacity={0.85}>
              <ScreenContent w={380} h={240} t={t} kind={kind as string} accent={glow} seed={`${seed}h${i}`} />
            </g>
            <rect x={-12} y={-12} width={404} height={264} rx={16} fill="none" stroke={glow} strokeWidth={8} opacity={0.15} />
          </g>
        ))}
        {/* tubes */}
        {[1560, 1730].map((x, i) => (
          <g key={x}>
            <rect x={x} y={300} width={120} height={floorY - 330} rx={60} fill={withAlpha(glow, 0.12)} stroke={lighten(glow, 0.3)} strokeWidth={4} />
            <rect x={x + 10} y={420 + Math.sin(t + i) * 10} width={100} height={floorY - 470} rx={50} fill={i ? "#06d6a0" : "#f72585"} opacity={0.45} />
            {Array.from({ length: 6 }).map((_, k) => {
              const ph = (t * 0.4 + rnd(seed, `tb${i}${k}`)) % 1;
              return <circle key={k} cx={x + 30 + rnd(seed, `tx${i}${k}`) * 60} cy={floorY - 60 - ph * 380} r={6} fill="#fff" opacity={0.6 * (1 - ph)} />;
            })}
            <rect x={x - 10} y={280} width={140} height={30} rx={8} fill="#2b3a67" />
            <rect x={x - 10} y={floorY - 40} width={140} height={40} rx={8} fill="#2b3a67" />
          </g>
        ))}
      </SvgLayer>
      <SvgLayer depth={1}>
        <defs>
          <linearGradient id={fl} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#1f2a4d" />
            <stop offset="1" stopColor="#0b1020" />
          </linearGradient>
        </defs>
        <rect x={-1600} y={floorY} width={5120} height={1200} fill={`url(#${fl})`} />
        <rect x={-1600} y={floorY} width={5120} height={6} fill={glow} opacity={0.6} />
        {Array.from({ length: 30 }).map((_, i) => (
          <line key={i} x1={-1600 + i * 180} y1={floorY} x2={-1600 + i * 180 + (i * 180 - 2560) * 0.6} y2={floorY + 400} stroke={glow} strokeWidth={1.5} opacity={0.18} />
        ))}
        <Obj type="server" x={-300} y={floorY + 4} t={t} />
        <Obj type="server" x={-80} y={floorY + 4} t={t} />
        <g transform={`translate(2350 ${floorY + 4})`}>
          <rect x={-220} y={-150} width={440} height={150} rx={10} fill="#2b3a67" />
          <rect x={-230} y={-160} width={460} height={20} rx={6} fill="#3a4c86" />
          <g transform="translate(-110 -160)">
            <ObjectView type="flask" t={t} color="#f72585" seed="f1" lighting={0} />
          </g>
          <g transform="translate(20 -160) scale(0.8)">
            <ObjectView type="flask" t={t} color="#06d6a0" seed="f2" lighting={0} />
          </g>
          <g transform="translate(150 -160) scale(0.7)">
            <ObjectView type="microscope" t={t} lighting={0} />
          </g>
        </g>
      </SvgLayer>
      <SvgLayer depth={0.88}>
        <ellipse cx={960} cy={-40} rx={1300} ry={160} fill={glow} opacity={0.06} />
      </SvgLayer>
    </>
  );
};

// =============================================================== CLASSROOM
export const Classroom: React.FC<EnvProps> = ({ palette: p, t, seed, spec }) => {
  const floorY = 880;
  return (
    <>
      <Room p={p} wall={(spec.color as string) ?? "#f1e3c8"} floor="#c9a27e" floorY={floorY} planks />
      <SvgLayer depth={0.88}>
        <rect x={420} y={150} width={1080} height={520} rx={12} fill={lit(p, "#2f5d50")} stroke={lit(p, "#8b5e34")} strokeWidth={24} />
        <text x={960} y={330} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={64} fill="#f1f1f1" opacity={0.92}>
          {String(spec.props?.board ?? "")}
        </text>
        <rect x={440} y={672} width={1040} height={18} fill={lit(p, "#8b5e34")} />
        <SkyWindow x={-560} y={180} w={420} h={420} p={p} t={t} seed={seed} rain={windowRain(p, spec)} />
        <SkyWindow x={2060} y={180} w={420} h={420} p={p} t={t} seed={seed + 3} rain={windowRain(p, spec)} />
        <Obj type="clock" x={1700} y={250} s={0.5} t={t} />
      </SvgLayer>
      <SvgLayer depth={1}>
        <Obj type="bookshelf" x={-1000} y={floorY} t={t} />
        <Obj type="plant" x={1760} y={floorY + 6} s={0.8} t={t} />
        <Obj type="globe" x={2900} y={floorY - 300} s={0.6} t={t} />
      </SvgLayer>
    </>
  );
};
