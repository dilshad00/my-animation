import React from "react";
import type { Palette } from "../../utils/lighting";
import type { EnvironmentSpecT } from "../../utils/schema";
import { Blueprint, Gradient, Studio } from "./abstract";
import type { EnvProps } from "./common";
import { Apartment, Classroom, Lab, Office } from "./indoor";
import { Ancient, City, Desert, Forest, ForestFront, Medieval, Ocean, Park, Street, Suburb, TrafficFront, Underwater } from "./outdoor";
import { PlanetSurface, Space } from "./space";
import { WeatherFront } from "./weather";
import { Farm, River } from "./landscape";
import { Cutaway, Micro, WindowEnv } from "./closeup";
import { Acropolis, Aegean, Frieze, Hall, Kitchen, Olympia, Olympus, Ruins, Village, Wall } from "./mythic";
import { STONE_AGE_ENVS } from "../../../projects/video-003/assets/environments";

export type EnvDef = {
  component: React.FC<EnvProps>;
  /** optional foreground drawn in front of the scene's elements */
  front?: React.FC<EnvProps>;
  description: string;
  /** environment draws its own precipitation (skip the global rain/fog layer) */
  ownWeather?: boolean;
  /** y coordinate where characters should stand */
  groundY: number;
};

/** Every environment usable in storyboard.json → scene.environment.type */
export const ENVIRONMENTS: Record<string, EnvDef> = {
  city: { component: City, front: TrafficFront, groundY: 860, description: "Downtown skyline with 3 parallax layers, sidewalk & road. props: { traffic: true }" },
  street: { component: Street, front: TrafficFront, groundY: 860, description: "Close-up shop fronts along a sidewalk. props: { traffic: true }" },
  suburb: { component: Suburb, groundY: 850, description: "Houses, lawns, fences and trees." },
  park: { component: Park, groundY: 880, description: "City park with path, bench and trees." },
  forest: { component: Forest, front: ForestFront, groundY: 900, description: "Layered pine forest with god-rays and foreground bushes." },
  ocean: { component: Ocean, groundY: 900, description: "Sea with beach, palms and sailboat. props: { beach: false } for open sea." },
  underwater: { component: Underwater, groundY: 920, description: "Reef with caustics, coral, seaweed, fish, whale and bubbles. props (animatable): { murk: 0, murkColor: \"#4a3320\", life: 1, oxygen: 1, dead: 0 }" },
  desert: { component: Desert, groundY: 900, description: "Ancient Egypt: dunes, pyramids, palms." },
  medieval: { component: Medieval, groundY: 900, description: "Castle on a hill, village huts, dirt road." },
  ancient: { component: Ancient, groundY: 900, description: "Greco-Roman temple with paved stone plaza." },
  space: { component: Space, groundY: 900, description: "Deep space: nebulae, star layers, ringed planet, comet. props: { earth: true }" },
  planet: { component: PlanetSurface, groundY: 900, description: "Alien/Mars surface with craters and a habitat dome. color = ground colour." },
  apartment: { component: Apartment, ownWeather: true, groundY: 900, description: "Living room with window to the city. color = wall colour." },
  office: { component: Office, ownWeather: true, groundY: 900, description: "Open office with city windows. props: { board: 'text' }" },
  lab: { component: Lab, ownWeather: true, groundY: 900, description: "Futuristic lab with holograms and glowing tubes. color = glow colour." },
  classroom: { component: Classroom, ownWeather: true, groundY: 900, description: "Classroom with chalkboard. props: { board: 'text' }" },
  studio: { component: Studio, groundY: 910, description: "Clean presentation backdrop for diagrams. color = base tint." },
  blueprint: { component: Blueprint, groundY: 900, description: "Technical blueprint grid. color = base tint." },
  river: { component: River, groundY: 975, description: "River from its bank: far trees, flowing water, reeds, jumping fish. props (animatable [[t,v]…]): { water: \"#3d8fc4\", flow: 1, life: 1, fish: 3, dead: 0, murk: 0 }" },
  farm: { component: Farm, groundY: 1010, description: "Farmland: crop rows in perspective, barn, silo, wind turbine, fence. props (animatable): { crop: 1, flood: 0, water: \"#5c8fbf\", barn: true }" },
  micro: { component: Micro, groundY: 900, description: "Microscope field of view. props (animatable counts): { fluid, cells, spores, bacteria, cocci, dust, scale: \"10 µm\" }" },
  cutaway: { component: Cutaway, ownWeather: true, groundY: 380, description: "Ground cross-section. props.mode \"street\": { liquid, level, flow, clog, puddle } · mode \"soil\": { water, wet, oxygen, bacteria, rot, worms }" },
  window: { component: WindowEnv, ownWeather: true, groundY: 1000, description: "Window close-up from inside with curtains and drops running down the glass. props (animatable): { open: 1, streaks: 1, drops, wall, curtain, view: city|suburb|sky }" },
  gradient: { component: Gradient, groundY: 900, description: "Plain animated gradient. color + props.color2." },
  olympus: { component: Olympus, groundY: 930, description: "Mount Olympus, summit at about x=960, y=210." },
  village: { component: Village, groundY: 880, description: "Greek mountain village with Olympus behind." },
  ruins: { component: Ruins, groundY: 880, description: "Temple of Olympian Zeus with a city behind. props (animatable): { columns: 15, built: 1 }, { city: false }" },
  acropolis: { component: Acropolis, groundY: 930, description: "The Parthenon on its hill. props: { scaffold: false }" },
  olympia: { component: Olympia, groundY: 900, description: "Low sanctuary ruins with an empty statue base." },
  aegean: { component: Aegean, groundY: 900, description: "Open sea with a bare island. props (animatable): { island: 0..1, boil: 0..1, flat: 0..1 }" },
  frieze: { component: Frieze, groundY: 960, description: "Terracotta black-figure backdrop with Greek-key borders. color = clay." },
  hall: { component: Hall, ownWeather: true, groundY: 880, description: "Official room. props: { kind: council|press|control } color = wall." },
  kitchen: { component: Kitchen, ownWeather: true, groundY: 900, description: "Tiny flat lit by one warm bulb." },
  wall: { component: Wall, ownWeather: true, groundY: 950, description: "Plain exterior wall and pavement. color = wall." },
  ...STONE_AGE_ENVS,
};

export const EnvironmentView: React.FC<{
  spec: EnvironmentSpecT;
  palette: Palette;
  t: number;
  sceneId: string;
}> = ({ spec, palette, t, sceneId }) => {
  const def = ENVIRONMENTS[spec.type.toLowerCase()];
  if (!def) {
    throw new Error(
      `Scene "${sceneId}": unknown environment "${spec.type}". Available: ${Object.keys(ENVIRONMENTS).join(", ")}`,
    );
  }
  const C = def.component;
  const seed = spec.seed ?? 1;
  return <C spec={spec} palette={palette} t={t} seed={seed} />;
};

export const EnvironmentFront: React.FC<{ spec: EnvironmentSpecT; palette: Palette; t: number }> = ({ spec, palette, t }) => {
  const def = ENVIRONMENTS[spec.type.toLowerCase()];
  const Front = def?.front;
  return (
    <>
      {Front ? <Front spec={spec} palette={palette} t={t} seed={spec.seed ?? 1} /> : null}
      {def?.ownWeather ? null : <WeatherFront weather={spec.weather} t={t} seed={spec.seed ?? 1} p={palette} intensity={spec.intensity ?? 1} />}
    </>
  );
};
