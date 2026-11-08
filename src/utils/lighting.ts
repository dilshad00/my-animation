import { mix, multiply } from "./color";

export type TimeOfDay = "dawn" | "day" | "sunset" | "night";

export type Palette = {
  time: TimeOfDay;
  skyTop: string;
  skyBottom: string;
  horizonGlow: string;
  sun: string;
  /** Multiplied onto illustrated colours to simulate ambient light */
  ambient: string;
  /** Atmospheric haze colour, mixed into distant layers */
  haze: string;
  /** Shadow colour */
  shadow: string;
  /** Whether lights (windows, lamps) are on */
  lightsOn: boolean;
  /** 0..1 strength of rim/back light */
  rim: number;
  stars: number;
  weather?: string;
  /** Colour of falling rain (default pale blue) */
  rainColor?: string;
};

export const PALETTES: Record<TimeOfDay, Palette> = {
  dawn: {
    time: "dawn",
    skyTop: "#5b6fb3",
    skyBottom: "#f6b9a0",
    horizonGlow: "#ffd4a3",
    sun: "#ffe2a8",
    ambient: "#f2dcd6",
    haze: "#e8b7b0",
    shadow: "#3a2f5a",
    lightsOn: true,
    rim: 0.6,
    stars: 0.15,
  },
  day: {
    time: "day",
    skyTop: "#4aa3f0",
    skyBottom: "#bfe6ff",
    horizonGlow: "#e6f6ff",
    sun: "#fff6c9",
    ambient: "#ffffff",
    haze: "#cfe9fb",
    shadow: "#2d4a6b",
    lightsOn: false,
    rim: 0.2,
    stars: 0,
  },
  sunset: {
    time: "sunset",
    skyTop: "#3b2e6e",
    skyBottom: "#ff8c5a",
    horizonGlow: "#ffc06b",
    sun: "#ffb35c",
    ambient: "#ffd2b3",
    haze: "#e88a74",
    shadow: "#3b1f4a",
    lightsOn: true,
    rim: 0.9,
    stars: 0.05,
  },
  night: {
    time: "night",
    skyTop: "#070b24",
    skyBottom: "#1e2a5c",
    horizonGlow: "#34407a",
    sun: "#e8eeff",
    ambient: "#7f8fc4",
    haze: "#2a3670",
    shadow: "#05081a",
    lightsOn: true,
    rim: 0.5,
    stars: 1,
  },
};

/**
 * Applies ambient light to a base colour, and optionally atmospheric haze
 * (0 = foreground, 1 = fully hazed horizon).
 */
export const lit = (p: Palette, base: string, haze = 0): string => {
  const ambiented = p.ambient === "#ffffff" ? base : multiply(base, p.ambient);
  // keep a bit of the original saturation so night isn't muddy
  const blended = mix(ambiented, base, p.time === "night" ? 0.12 : 0.25);
  return haze > 0 ? mix(blended, p.haze, haze) : blended;
};

/** Overcast / rain / storm desaturate and darken the sky and ambient light. */
export const withWeather = (p: Palette, weather?: string, rainColor?: string): Palette => {
  if (!weather || weather === "clear" || weather === "wind") return { ...p, weather };
  const k = weather === "storm" ? 0.55 : weather === "rain" ? 0.4 : weather === "snow" ? 0.5 : weather === "fog" ? 0.35 : 0.22;
  // coloured rain (blood, dust…) also stains the overcast sky and the light
  const wet = (weather === "rain" || weather === "storm") && rainColor;
  const grey = weather === "snow" || weather === "fog" ? "#c9d2dc" : wet ? mix("#5f6b7a", rainColor, 0.45) : "#5f6b7a";
  const amb = weather === "snow" ? "#e6ecf5" : wet ? mix("#9aa5b8", rainColor, 0.35) : "#9aa5b8";
  return {
    ...p,
    weather,
    rainColor: wet ? rainColor : undefined,
    skyTop: mix(p.skyTop, grey, k),
    skyBottom: mix(p.skyBottom, grey, k),
    horizonGlow: mix(p.horizonGlow, grey, k),
    ambient: mix(p.ambient, amb, k * 0.8),
    haze: mix(p.haze, grey, k),
    stars: p.stars * (1 - k * 1.5 > 0 ? 1 - k * 1.5 : 0),
  };
};
