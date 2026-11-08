import React, { createContext, useContext } from "react";
import type { Palette } from "../utils/lighting";
import { PALETTES } from "../utils/lighting";
import type { Word } from "../utils/narration";
import { resolveTime } from "../utils/narration";
import type { CharacterLook, ElementT, TimeValue } from "../utils/schema";

export type Theme = {
  accent: string;
  accent2: string;
  text: string;
  dark: string;
  font: string;
};

export const DEFAULT_THEME: Theme = {
  accent: "#ffb703",
  accent2: "#3a86ff",
  text: "#ffffff",
  dark: "#14213d",
  font: "Poppins",
};

export type CameraState = { x: number; y: number; zoom: number; rotate: number };

export type SceneCtx = {
  sceneId: string;
  /** scene duration in seconds */
  duration: number;
  fps: number;
  words: Word[];
  palette: Palette;
  theme: Theme;
  cast: Record<string, Partial<CharacterLook>>;
  elements: ElementT[];
  /** y where characters/objects stand by default */
  groundY: number;
  resolve: (v: TimeValue | undefined, fallback?: number) => number;
};

const defaultCtx: SceneCtx = {
  sceneId: "preview",
  duration: 10,
  fps: 30,
  words: [],
  palette: PALETTES.day,
  theme: DEFAULT_THEME,
  cast: {},
  elements: [],
  groundY: 900,
  resolve: (v, f = 0) =>
    resolveTime(v, { words: [], duration: 10, sceneId: "preview" }, f),
};

export const SceneContext = createContext<SceneCtx>(defaultCtx);
export const useScene = () => useContext(SceneContext);

export const CameraContext = createContext<CameraState>({
  x: 960,
  y: 540,
  zoom: 1,
  rotate: 0,
});
export const useCamera = () => useContext(CameraContext);

export const makeSceneCtx = (p: {
  sceneId: string;
  duration: number;
  fps: number;
  words: Word[];
  palette: Palette;
  theme?: Theme;
  cast?: Record<string, Partial<CharacterLook>>;
  elements?: ElementT[];
  groundY?: number;
}): SceneCtx => {
  const tctx = { words: p.words, duration: p.duration, sceneId: p.sceneId };
  return {
    ...p,
    theme: p.theme ?? DEFAULT_THEME,
    cast: p.cast ?? {},
    elements: p.elements ?? [],
    groundY: p.groundY ?? 900,
    resolve: (v, f = 0) => resolveTime(v, tctx, f),
  };
};

export const SceneProvider: React.FC<{
  value: SceneCtx;
  children: React.ReactNode;
}> = ({ value, children }) => (
  <SceneContext.Provider value={value}>{children}</SceneContext.Provider>
);
