import type React from "react";
import type { Palette } from "../../utils/lighting";

/**
 * Every object is an SVG drawing whose origin (0,0) is its bottom-centre
 * ("where it stands on the ground"), unless noted (e.g. flying objects use
 * their centre). Sizes are in px at scale 1 on a 1920×1080 stage.
 */
export type ObjectProps = {
  /** scene time, seconds */
  t: number;
  /** seconds since this element appeared (for one-shot animations) */
  local: number;
  color?: string;
  color2?: string;
  /** animation speed multiplier */
  speed: number;
  props: Record<string, unknown>;
  /** applies scene lighting to a colour */
  L: (c: string) => string;
  p: Palette;
  /** deterministic seed for variation */
  seed: string;
};

export type ObjectComponent = React.FC<ObjectProps>;

export type ObjectDef = {
  component: ObjectComponent;
  /** approximate size, used by galleries / auto layout */
  w: number;
  h: number;
  category: string;
  /** "ground" (origin bottom-centre) or "center" */
  anchor?: "ground" | "center";
  description?: string;
};

export const str = (v: unknown, d: string) => (typeof v === "string" ? v : d);
export const num = (v: unknown, d: number) => (typeof v === "number" ? v : d);
