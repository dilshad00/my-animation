import { ease } from "./easing";
import type { Anim, AnimPreset, EaseName } from "./schema";

export type AnimState = {
  opacity: number;
  dx: number;
  dy: number;
  scale: number;
  rotate: number;
  blur: number;
  /** 0..1 for "draw"/"wipe" style reveals (consumed by content) */
  reveal: number;
  /** clip-path inset (percent from right) for wipe */
  wipe: number;
};

export const IDLE_ANIM: AnimState = { opacity: 1, dx: 0, dy: 0, scale: 1, rotate: 0, blur: 0, reveal: 1, wipe: 0 };

export const normalizeAnim = (a: Anim | undefined, fallback: AnimPreset, defDuration = 0.6) => {
  if (!a) return { type: fallback, duration: defDuration, ease: undefined as EaseName | undefined };
  if (typeof a === "string") return { type: a, duration: defDuration, ease: undefined as EaseName | undefined };
  return { type: a.type, duration: a.duration ?? defDuration, ease: a.ease };
};

/**
 * k = 0 → hidden, 1 → fully shown. Exit animations use the same presets
 * with k running from 1 down to 0.
 */
export const animState = (type: AnimPreset, k: number, easeName: EaseName | undefined, exiting = false): AnimState => {
  const defaultEase: EaseName = type === "pop" || type === "drop" ? (exiting ? "in" : "back") : exiting ? "in" : "out";
  const e = ease(easeName ?? defaultEase, k);
  const lin = Math.max(0, Math.min(1, k));
  const s: AnimState = { ...IDLE_ANIM };
  switch (type) {
    case "none":
      return s;
    case "fade":
      s.opacity = lin;
      return s;
    case "pop":
      s.opacity = Math.min(1, lin * 3);
      s.scale = Math.max(0.001, e);
      return s;
    case "rise":
      s.opacity = Math.min(1, lin * 2);
      s.dy = (1 - e) * 80;
      return s;
    case "drop":
      s.opacity = Math.min(1, lin * 4);
      s.dy = -(1 - ease("bounce", k)) * 260;
      return s;
    case "slideLeft":
      s.opacity = Math.min(1, lin * 2);
      s.dx = (1 - e) * 500;
      return s;
    case "slideRight":
      s.opacity = Math.min(1, lin * 2);
      s.dx = -(1 - e) * 500;
      return s;
    case "slideUp":
      s.opacity = Math.min(1, lin * 2);
      s.dy = (1 - e) * 400;
      return s;
    case "slideDown":
      s.opacity = Math.min(1, lin * 2);
      s.dy = -(1 - e) * 400;
      return s;
    case "zoom":
      s.opacity = lin;
      s.scale = 0.4 + 0.6 * e;
      return s;
    case "spin":
      s.opacity = Math.min(1, lin * 2);
      s.scale = Math.max(0.001, e);
      s.rotate = (1 - e) * -180;
      return s;
    case "blur":
      s.opacity = lin;
      s.blur = (1 - e) * 24;
      s.scale = 1.08 - 0.08 * e;
      return s;
    case "draw":
      s.reveal = e;
      s.opacity = Math.min(1, lin * 6);
      return s;
    case "wipe":
      s.wipe = (1 - e) * 100;
      return s;
    default:
      return s;
  }
};
