/**
 * Anime-style environments for the engine registry (scene.environment.type = "anime-…").
 * They follow `time` (dawn/day → bright blue sky, sunset, night) and work with the
 * engine's weather layer. Characters in anime style stand with the bust's bottom edge
 * at groundY (just below the frame), so groundY is 1120 for every anime environment.
 */
import React from "react";
import { AbsoluteFill, random } from "remotion";
import { Layer } from "../camera/Camera";
import type { EnvProps } from "../environments/common";
import { useScene } from "../../scenes/context";
import { AnimeSkyline, RooftopFence } from "./AnimeCity";
import { GodRays, SpeedLines } from "./AnimeFx";
import { DaySky, NightSky, SunsetSky } from "./AnimeSky";
import { mix } from "./palette";

export const ANIME_GROUND_Y = 1120;

type Tod = "day" | "sunset" | "night";
const tod = (spec: EnvProps["spec"]): Tod => (spec.time === "night" ? "night" : spec.time === "sunset" ? "sunset" : "day");

/** Wraps a 1920×1080 painting in a camera layer, over-scaled so camera moves never reveal edges. */
const Plate: React.FC<{ depth: number; children: React.ReactNode; over?: number }> = ({ depth, children, over = 1.12 }) => (
  <Layer depth={depth}>
    <AbsoluteFill style={{ transform: `scale(${over})` }}>{children}</AbsoluteFill>
  </Layer>
);

const SkyFor: React.FC<{ time: Tod; frame: number }> = ({ time, frame }) =>
  time === "night" ? <NightSky frame={frame} shootAt={90} /> : time === "sunset" ? <SunsetSky frame={frame} /> : <DaySky frame={frame} />;

const useFrame = (t: number) => Math.round(t * useScene().fps);

export const AnimeSkyEnv: React.FC<EnvProps> = ({ spec, t }) => {
  const frame = useFrame(t);
  const time = tod(spec);
  return (
    <>
      <Plate depth={0.08}><SkyFor time={time} frame={frame} /></Plate>
      {time === "sunset" ? <GodRays frame={frame} x={1350} y={760} opacity={0.3} /> : null}
    </>
  );
};

export const AnimeCityEnv: React.FC<EnvProps> = ({ spec, t }) => {
  const frame = useFrame(t);
  const time = tod(spec);
  return (
    <>
      <Plate depth={0.08}><SkyFor time={time} frame={frame} /></Plate>
      <Plate depth={0.3}><AnimeSkyline frame={frame} night={time === "night"} day={time === "day"} pan={-frame * 0.3} /></Plate>
      {time === "sunset" ? <GodRays frame={frame} x={1350} y={760} opacity={0.3} /> : null}
    </>
  );
};

export const AnimeRooftopEnv: React.FC<EnvProps> = ({ spec, t }) => {
  const frame = useFrame(t);
  const time = tod(spec);
  return (
    <>
      <Plate depth={0.08}><SkyFor time={time} frame={frame} /></Plate>
      <Plate depth={0.25}>
        <AbsoluteFill style={{ transform: "translateY(-110px)" }}>
          <AnimeSkyline frame={frame} night={time === "night"} day={time === "day"} pan={-120} />
        </AbsoluteFill>
      </Plate>
      <Plate depth={0.6} over={1.08}><RooftopFence y={960} night={time === "night"} day={time === "day"} /></Plate>
      {time === "sunset" ? <GodRays frame={frame} x={1450} y={700} opacity={0.35} /> : null}
    </>
  );
};

/** Sunlit classroom: windows with sky + city, chalkboard (props.board), desks, light shafts. */
export const AnimeClassroomEnv: React.FC<EnvProps> = ({ spec, t }) => {
  const frame = useFrame(t);
  const time = tod(spec);
  const board = typeof spec.props?.board === "string" ? (spec.props.board as string) : "";
  const wall = spec.color ?? (time === "night" ? "#3a3f6e" : time === "sunset" ? "#f2d2b8" : "#f4ead9");
  const wallShade = mix(wall, "#3a2850", 0.25);
  const beam = time === "sunset" ? "#ffb070" : time === "night" ? "#9fb4ff" : "#fff6dc";
  const windows = [1010, 1310, 1610];
  const hole = (x: number) => `M${x} 150 h 260 v 520 h -260 Z`;
  return (
    <>
      <Plate depth={0.05}>
        <SkyFor time={time} frame={frame} />
        <AbsoluteFill style={{ transform: "translateY(-20px)" }}>
          <AnimeSkyline frame={frame} night={time === "night"} day={time === "day"} pan={-300} horizon={720} />
        </AbsoluteFill>
      </Plate>
      <Plate depth={0.5} over={1.06}>
        <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="cls-wall" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={wallShade} />
              <stop offset="0.6" stopColor={wall} />
            </linearGradient>
            <linearGradient id="cls-floor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={time === "night" ? "#2a2440" : "#b98a62"} />
              <stop offset="1" stopColor={time === "night" ? "#151225" : "#7a5238"} />
            </linearGradient>
            <linearGradient id="cls-beam" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={beam} stopOpacity="0.55" />
              <stop offset="1" stopColor={beam} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* wall with window holes */}
          <path d={`M0 0 H1920 V800 H0 Z ${windows.map(hole).join(" ")}`} fill="url(#cls-wall)" fillRule="evenodd" />
          {windows.map((x) => (
            <g key={x}>
              <rect x={x - 10} y={140} width={280} height={540} fill="none" stroke="#7d6a5c" strokeWidth={20} />
              <line x1={x + 130} y1={150} x2={x + 130} y2={670} stroke="#7d6a5c" strokeWidth={12} />
              <line x1={x} y1={410} x2={x + 260} y2={410} stroke="#7d6a5c" strokeWidth={10} />
              <rect x={x - 10} y={140} width={8} height={540} fill="#fff" opacity={0.4} />
              {/* curtain */}
              <path d={`M${x + 236} 130 C ${x + 250 + Math.sin(frame * 0.05 + x) * 8} 300, ${x + 230} 500, ${x + 252 + Math.sin(frame * 0.05 + x) * 10} 690 L ${x + 290} 690 L ${x + 290} 130 Z`} fill="#f7f1e6" opacity={0.92} />
            </g>
          ))}
          {/* chalkboard */}
          <rect x={90} y={170} width={780} height={420} rx={8} fill="#7a5a3e" />
          <rect x={110} y={190} width={740} height={380} fill="#2f5a46" />
          <rect x={110} y={190} width={740} height={380} fill="#ffffff" opacity={0.05} />
          <rect x={100} y={588} width={760} height={18} fill="#8d6a4a" />
          {[0, 1, 2].map((i) => <rect key={i} x={160 + i * 60} y={580} width={34} height={8} rx={3} fill={["#ffffff", "#ffd6e6", "#fff3a8"][i]} />)}
          {/* wall clock */}
          <g transform="translate(940 120)">
            <circle r={44} fill="#fff" stroke="#5c4a3c" strokeWidth={8} />
            <line x1={0} y1={0} x2={0} y2={-28} stroke="#2a1830" strokeWidth={5} strokeLinecap="round" transform={`rotate(${frame * 0.5})`} />
            <line x1={0} y1={0} x2={18} y2={0} stroke="#2a1830" strokeWidth={6} strokeLinecap="round" />
          </g>
          <rect x={0} y={790} width={1920} height={20} fill="#6e5848" />
          <rect x={0} y={800} width={1920} height={280} fill="url(#cls-floor)" />
          {/* light shafts through the windows */}
          {windows.map((x) => (
            <path key={`b${x}`} d={`M${x} 150 L ${x + 260} 150 L ${x - 260} 1080 L ${x - 760} 1080 Z`} fill="url(#cls-beam)" style={{ mixBlendMode: "screen" }} opacity={0.6} />
          ))}
          {/* dust motes in the light */}
          {Array.from({ length: 30 }, (_, i) => (
            <circle key={i} cx={(random(`dm${i}`) * 1200 + 600 + Math.sin(frame * 0.02 + i) * 30) % 1920} cy={(random(`dmy${i}`) * 800 + 150 - frame * 0.2 * (0.5 + random(`dms${i}`))) % 900 + 150}
              r={1.5 + random(`dmr${i}`) * 2.5} fill={beam} opacity={0.6} />
          ))}
        </svg>
        {board ? (
          <div style={{ position: "absolute", left: 140, top: 220, width: 680, height: 320, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#f4f8f2", fontSize: 58, fontWeight: 700, fontFamily: "'Comic Sans MS', 'Segoe Print', sans-serif", opacity: 0.88, lineHeight: 1.2 }}>
            {board}
          </div>
        ) : null}
      </Plate>
      {/* foreground desks */}
      <Plate depth={1.2} over={1.04}>
        <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          {[[-60, 960], [1500, 980]].map(([x, y], i) => (
            <g key={i}>
              <path d={`M${x} ${y} L ${x + 520} ${y} L ${x + 560} ${y + 40} L ${x - 30} ${y + 40} Z`} fill="#d4a373" />
              <rect x={x - 30} y={y + 40} width={590} height={18} fill="#a57548" />
              <rect x={x + 20} y={y + 58} width={14} height={120} fill="#5d6175" />
              <rect x={x + 470} y={y + 58} width={14} height={120} fill="#5d6175" />
            </g>
          ))}
        </svg>
      </Plate>
    </>
  );
};

/** Dramatic action backdrop: radial burst + flickering focus lines. color = burst colour. */
export const AnimeActionEnv: React.FC<EnvProps> = ({ spec, t }) => {
  const frame = useFrame(t);
  const c = spec.color ?? "#ff4f7a";
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, ${mix(c, "#ffffff", 0.75)} 0%, ${c} 35%, ${mix(c, "#10052a", 0.75)} 100%)` }}>
      <SpeedLines frame={frame} cy={430} inner={360} opacity={0.7} />
    </AbsoluteFill>
  );
};

/** Soft bokeh backdrop for close-ups and reaction shots. color = base tint. */
export const AnimeCloseupEnv: React.FC<EnvProps> = ({ spec, t }) => {
  const frame = useFrame(t);
  const time = tod(spec);
  const c = spec.color ?? (time === "night" ? "#28306e" : time === "sunset" ? "#d0608e" : "#8ec5ff");
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${mix(c, "#ffffff", 0.35)}, ${c} 55%, ${mix(c, "#10052a", 0.5)})` }}>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="bokeh"><stop offset="0" stopColor="#fff" stopOpacity="0.55" /><stop offset="0.8" stopColor="#fff" stopOpacity="0.25" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        </defs>
        {Array.from({ length: 26 }, (_, i) => (
          <circle key={i} cx={random(`bk${i}`) * 1920 + Math.sin(frame * 0.01 + i) * 40} cy={random(`bky${i}`) * 1080 + Math.cos(frame * 0.012 + i) * 30}
            r={30 + random(`bkr${i}`) * 110} fill="url(#bokeh)" opacity={0.35 + random(`bko${i}`) * 0.4} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

type EnvEntry = { component: React.FC<EnvProps>; groundY: number; description: string; ownWeather?: boolean };

export const ANIME_ENVS: Record<string, EnvEntry> = {
  "anime-city": { component: AnimeCityEnv, groundY: ANIME_GROUND_Y, description: "ANIME: painted sky (follows time) over a layered skyline with lit windows." },
  "anime-rooftop": { component: AnimeRooftopEnv, groundY: ANIME_GROUND_Y, description: "ANIME: school rooftop – chain-link fence, city below, sky by time (sunset adds god rays)." },
  "anime-sky": { component: AnimeSkyEnv, groundY: ANIME_GROUND_Y, description: "ANIME: open sky only – towering cel-shaded clouds (day/sunset) or stars + shooting star (night)." },
  "anime-classroom": { component: AnimeClassroomEnv, ownWeather: true, groundY: ANIME_GROUND_Y, description: "ANIME: classroom with windows, curtains, light shafts, desks. props: { board: \"chalk text\" }, color = wall." },
  "anime-action": { component: AnimeActionEnv, groundY: ANIME_GROUND_Y, description: "ANIME: dramatic burst with flickering focus lines for big moments. color = burst colour." },
  "anime-closeup": { component: AnimeCloseupEnv, groundY: ANIME_GROUND_Y, description: "ANIME: soft bokeh gradient for close-ups / reactions. color = tint." },
};

/** In anime-style projects, classic environment names are swapped for their anime equivalent. */
export const ANIME_ENV_ALIASES: Record<string, string> = {
  city: "anime-city",
  street: "anime-city",
  suburb: "anime-city",
  apartment: "anime-closeup",
  office: "anime-classroom",
  classroom: "anime-classroom",
  studio: "anime-closeup",
  gradient: "anime-closeup",
};
