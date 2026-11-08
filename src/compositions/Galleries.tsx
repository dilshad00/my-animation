import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { DIAGRAMS } from "../components/objects/diagrams/registry";
import { EFFECTS } from "../components/effects/Effects";
import { CameraProvider } from "../components/camera/Camera";
import { makeSceneCtx, SceneProvider } from "../scenes/context";
import { ElementNode } from "../scenes/ElementRenderer";
import { FONT_FAMILY } from "../utils/fonts";
import { PALETTES, withWeather, type TimeOfDay } from "../utils/lighting";
import type { ElementT } from "../utils/schema";
import { EnvironmentFront, ENVIRONMENTS, EnvironmentView } from "../components/environments/registry";
import { OBJECTS } from "../components/objects/registry";

const Label: React.FC<{ text: string; sub?: string }> = ({ text, sub }) => (
  <div style={{ position: "absolute", left: 40, top: 30, fontFamily: FONT_FAMILY, color: "#fff", background: "rgba(10,14,30,0.7)", padding: "10px 24px", borderRadius: 16 }}>
    <div style={{ fontSize: 40, fontWeight: 800 }}>{text}</div>
    {sub ? <div style={{ fontSize: 24, opacity: 0.8 }}>{sub}</div> : null}
  </div>
);

const EnvShot: React.FC<{ type: string; time: TimeOfDay; weather?: string; pan?: boolean }> = ({ type, time, weather, pan }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const palette = withWeather(PALETTES[time], weather);
  const groundY = ENVIRONMENTS[type].groundY;
  const ctx = makeSceneCtx({ sceneId: type, duration: durationInFrames / fps, fps, words: [], palette, groundY });
  const spec = { type, time, weather: weather as never };
  const char: ElementT = { kind: "character", who: "maya", x: 760, y: groundY, path: [{ t: 0.3, x: 760 }, { t: 3, x: 1160 }] };
  return (
    <SceneProvider value={ctx}>
      <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
        <CameraProvider spec={pan ? { keys: [{ t: 0, x: 860, zoom: 1.05 }, { t: 3, x: 1060, zoom: 1.12 }] } : undefined} t={t}>
          <EnvironmentView spec={spec} palette={palette} t={t} sceneId={type} />
          <ElementNode el={char} t={t} />
          <EnvironmentFront spec={spec} palette={palette} t={t} />
        </CameraProvider>
        <Label text={type} sub={`${time}${weather ? " · " + weather : ""} — ${ENVIRONMENTS[type].description}`} />
      </AbsoluteFill>
    </SceneProvider>
  );
};

const ENV_SHOTS: { type: string; time: TimeOfDay; weather?: string }[] = [
  { type: "city", time: "day" },
  { type: "city", time: "night", weather: "rain" },
  { type: "street", time: "sunset" },
  { type: "suburb", time: "day" },
  { type: "park", time: "dawn" },
  { type: "forest", time: "day" },
  { type: "forest", time: "night" },
  { type: "ocean", time: "sunset" },
  { type: "underwater", time: "day" },
  { type: "desert", time: "day" },
  { type: "medieval", time: "dawn", weather: "fog" },
  { type: "ancient", time: "day" },
  { type: "space", time: "night" },
  { type: "planet", time: "day" },
  { type: "apartment", time: "night" },
  { type: "office", time: "day" },
  { type: "lab", time: "day" },
  { type: "classroom", time: "day" },
  { type: "studio", time: "day" },
  { type: "blueprint", time: "day" },
  { type: "suburb", time: "day", weather: "snow" },
  { type: "city", time: "sunset", weather: "storm" },
];

export const ENV_SHOT_FRAMES = 90;
export const ENV_GALLERY_FRAMES = ENV_SHOTS.length * ENV_SHOT_FRAMES;

/** Each environment for 3 s, with a walking character and a camera move. */
export const EnvironmentGallery: React.FC = () => (
  <AbsoluteFill>
    {ENV_SHOTS.map((s, i) => (
      <Sequence key={i} from={i * ENV_SHOT_FRAMES} durationInFrames={ENV_SHOT_FRAMES} name={`${s.type} ${s.time}`}>
        <EnvShot {...s} pan />
      </Sequence>
    ))}
  </AbsoluteFill>
);

/** Grid of every object in the library, animated. */
export const ObjectGallery: React.FC<{ page: number }> = ({ page }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const keys = Object.keys(OBJECTS);
  const per = 32;
  const list = keys.slice(page * per, page * per + per);
  const ctx = makeSceneCtx({ sceneId: "objects", duration: 10, fps, words: [], palette: PALETTES.day });
  const cols = 8;
  const cw = 1920 / cols;
  const ch = 1080 / 4;
  return (
    <SceneProvider value={ctx}>
      <AbsoluteFill style={{ background: "linear-gradient(#e9f1ff, #cfdcf3)" }}>
        {list.map((k, i) => {
          const def = OBJECTS[k];
          const cx = (i % cols) * cw + cw / 2;
          const row = Math.floor(i / cols);
          const s = Math.min((cw - 30) / def.w, (ch - 70) / def.h, 1.1);
          const cy = def.anchor === "center" ? row * ch + (ch - 40) / 2 + 6 : row * ch + ch - 46;
          return (
            <React.Fragment key={k}>
              <svg width={1} height={1} style={{ position: "absolute", left: cx, top: cy, overflow: "visible" }}>
                <g transform={`scale(${s})`}>
                  {React.createElement(def.component, { t, local: t, speed: 1, props: k === "speech" ? { text: "Hello!" } : k === "thought" ? { text: "Hmm…" } : k === "whiteboard" ? { text: "E=mc²" } : {}, L: (c: string) => c, p: PALETTES.day, seed: k })}
                </g>
              </svg>
              <div style={{ position: "absolute", left: cx - 100, width: 200, top: row * ch + ch - 38, textAlign: "center", fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 22, color: "#22304a" }}>{k}</div>
            </React.Fragment>
          );
        })}
      </AbsoluteFill>
    </SceneProvider>
  );
};

const SAMPLE_DIAGRAMS: ElementT[] = [
  { kind: "diagram", type: "bar", title: "Energy use by sector", data: { items: [{ label: "Homes", value: 27 }, { label: "Industry", value: 33 }, { label: "Transport", value: 28 }, { label: "Other", value: 12 }], unit: "%" } },
  { kind: "diagram", type: "line", title: "Global temperature", data: { labels: ["1900", "1940", "1980", "2000", "2020"], series: [{ name: "Anomaly °C", values: [-0.2, 0.0, 0.1, 0.4, 1.0] }] } },
  { kind: "diagram", type: "donut", title: "Electricity sources", data: [{ label: "Fossil", value: 61 }, { label: "Renewable", value: 30 }, { label: "Nuclear", value: 9 }] },
  { kind: "diagram", type: "pie", title: "Ocean life", data: [{ label: "Fish", value: 40 }, { label: "Plankton", value: 35 }, { label: "Mammals", value: 25 }] },
  { kind: "diagram", type: "counter", data: { from: 0, to: 8100000000, label: "people on Earth" } },
  { kind: "diagram", type: "progress", data: { value: 0.72, label: "Battery charge" } },
  { kind: "diagram", type: "flow", title: "How solar power reaches you", width: 1600, data: { nodes: [{ id: "s", label: "Sunlight", object: "sun" }, { id: "p", label: "Solar panel", object: "solarpanel" }, { id: "g", label: "Grid", object: "windturbine" }, { id: "h", label: "Your home", object: "house" }], edges: [["s", "p", "photons"], ["p", "g", "DC→AC"], ["g", "h"]] } },
  { kind: "diagram", type: "timeline", title: "Space race", data: [{ label: "1957", text: "Sputnik" }, { label: "1961", text: "First human in space" }, { label: "1969", text: "Moon landing" }, { label: "1998", text: "ISS begins" }, { label: "2020s", text: "Mars missions" }] },
  { kind: "diagram", type: "list", title: "Why it matters", data: [{ text: "Cheaper every year", icon: "dollar" }, { text: "No emissions", icon: "check" }, { text: "Needs storage", icon: "warning" }] },
  { kind: "diagram", type: "compare", data: { left: { title: "Coal", items: ["Polluting", "Finite", "Rising cost"] }, right: { title: "Solar", items: ["Clean", "Renewable", "Cheaper"] } } },
  { kind: "diagram", type: "map", title: "Shipping route", data: { pins: [{ lon: 121, lat: 31, label: "Shanghai" }, { lon: 4.5, lat: 51.9, label: "Rotterdam" }, { lon: -74, lat: 40.7, label: "New York" }], route: [[121, 31], [80, 5], [44, 12], [32, 31], [4.5, 51.9], [-74, 40.7]] } },
];

export const DIAGRAM_SHOT_FRAMES = 120;
export const DIAGRAM_GALLERY_FRAMES = SAMPLE_DIAGRAMS.length * DIAGRAM_SHOT_FRAMES;

const DiagramShot: React.FC<{ el: ElementT }> = ({ el }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const ctx = makeSceneCtx({ sceneId: "diagrams", duration: 4, fps, words: [], palette: PALETTES.day });
  const spec = { type: "studio" };
  return (
    <SceneProvider value={ctx}>
      <AbsoluteFill style={{ overflow: "hidden" }}>
        <CameraProvider spec={undefined} t={t}>
          <EnvironmentView spec={spec} palette={PALETTES.day} t={t} sceneId="d" />
          <ElementNode el={{ ...el, at: 0.2 } as ElementT} t={t} />
        </CameraProvider>
        <Label text={`diagram: ${(el as { type: string }).type}`} sub={DIAGRAMS[(el as { type: string }).type].description} />
      </AbsoluteFill>
    </SceneProvider>
  );
};

export const DiagramGallery: React.FC = () => (
  <AbsoluteFill>
    {SAMPLE_DIAGRAMS.map((el, i) => (
      <Sequence key={i} from={i * DIAGRAM_SHOT_FRAMES} durationInFrames={DIAGRAM_SHOT_FRAMES} name={(el as { type: string }).type}>
        <DiagramShot el={el} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

/** Grid of every effect. */
export const EffectGallery: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const ctx = makeSceneCtx({ sceneId: "effects", duration: 10, fps, words: [], palette: PALETTES.night });
  const keys = Object.keys(EFFECTS);
  const cols = 5;
  const cw = 1920 / cols;
  const ch = 1080 / 3;
  return (
    <SceneProvider value={ctx}>
      <AbsoluteFill style={{ background: "radial-gradient(#22305a, #0b1020)" }}>
        {keys.map((k, i) => {
          const def = EFFECTS[k];
          const cx = (i % cols) * cw + cw / 2;
          const row = Math.floor(i / cols);
          const s = Math.min((cw - 40) / def.w, (ch - 60) / def.h, 1);
          const base = ["fire", "smoke", "bubbles"].includes(k);
          const cy = base ? row * ch + ch - 50 : row * ch + ch / 2 - 10;
          const el: ElementT = { kind: "effect", type: k, x: cx, y: cy, scale: s, at: 0, enter: "none", screen: true, seed: i };
          return (
            <React.Fragment key={k}>
              <div style={{ position: "absolute", left: (i % cols) * cw + 6, top: row * ch + 6, width: cw - 12, height: ch - 12, borderRadius: 18, border: "2px solid rgba(255,255,255,0.08)", overflow: "hidden" }} />
              <ElementNode el={el} t={k === "confetti" || k === "explosion" ? t % 3 : t} />
              <div style={{ position: "absolute", left: cx - 100, width: 200, top: row * ch + ch - 40, textAlign: "center", fontFamily: FONT_FAMILY, fontWeight: 700, fontSize: 24, color: "#fff" }}>{k}</div>
            </React.Fragment>
          );
        })}
      </AbsoluteFill>
    </SceneProvider>
  );
};
