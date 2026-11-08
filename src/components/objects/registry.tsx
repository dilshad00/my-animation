import React from "react";
import { mix } from "../../utils/color";
import { useScene } from "../../scenes/context";
import { lit } from "../../utils/lighting";
import { ANIMALS } from "./animals";
import { BUILDINGS } from "./buildings";
import { FURNITURE } from "./furniture";
import { MISC } from "./misc";
import { MYTHIC } from "./mythic";
import { NATURE } from "./nature";
import { EVERYDAY } from "./everyday";
import { STORY } from "./story";
import { TECH } from "./tech";
import type { ObjectDef } from "./types";
import { VEHICLES } from "./vehicles";
import { WILDLIFE } from "./wildlife";

/** Every object type usable in storyboard.json → { "kind": "object", "type": … } */
export const OBJECTS: Record<string, ObjectDef> = {
  ...NATURE,
  ...VEHICLES,
  ...BUILDINGS,
  ...TECH,
  ...FURNITURE,
  ...ANIMALS,
  ...MISC,
  ...STORY,
  ...EVERYDAY,
  ...WILDLIFE,
  ...MYTHIC,
};

export const ObjectView: React.FC<{
  type: string;
  t: number;
  local?: number;
  color?: string;
  color2?: string;
  speed?: number;
  props?: Record<string, unknown>;
  seed?: string;
  /** 0 = unlit (UI-like), 1 = full scene lighting */
  lighting?: number;
}> = ({ type, t, local, color, color2, speed = 1, props = {}, seed = type, lighting = 1 }) => {
  const scene = useScene();
  const def = OBJECTS[type.toLowerCase()];
  if (!def) {
    throw new Error(
      `Scene "${scene.sceneId}": unknown object type "${type}". Available: ${Object.keys(OBJECTS).join(", ")}`,
    );
  }
  const C = def.component;
  const L = (c: string) => (lighting <= 0 ? c : mix(c, lit(scene.palette, c), lighting * 0.8));
  return <C t={t} local={local ?? t} color={color} color2={color2} speed={speed} props={props} L={L} p={scene.palette} seed={seed} />;
};
