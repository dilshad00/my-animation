import { noise2D } from "@remotion/noise";
import React from "react";
import { AbsoluteFill } from "remotion";
import { CameraContext, useCamera, useScene } from "../../scenes/context";
import { ease } from "../../utils/easing";
import { samplePath } from "../../utils/keyframes";
import type { ElementT, EaseName, TimeValue } from "../../utils/schema";

export type CameraSpecT = {
  keys?: {
    t: TimeValue;
    x?: number;
    y?: number;
    zoom?: number;
    rotate?: number;
    ease?: EaseName;
  }[];
  follow?: string;
  shake?: number;
  drift?: boolean;
};

const findElement = (els: ElementT[], id: string): ElementT | undefined => {
  for (const e of els) {
    if (e.id === id) return e;
    if (e.kind === "group") {
      const f = findElement(e.children, id);
      if (f) return f;
    }
  }
  return undefined;
};

type CamValues = { x: number; y: number; zoom: number; rotate: number };

const sampleKeys = (
  keys: NonNullable<CameraSpecT["keys"]>,
  t: number,
  resolve: (v: TimeValue | undefined, f?: number) => number,
): CamValues => {
  const res = keys
    .map((k) => ({ ...k, t: resolve(k.t) }))
    .sort((a, b) => a.t - b.t);
  const out: CamValues = { x: 960, y: 540, zoom: 1, rotate: 0 };
  (["x", "y", "zoom", "rotate"] as const).forEach((p) => {
    const def = res.filter((k) => k[p] !== undefined);
    if (def.length === 0) return;
    if (t <= def[0].t) {
      out[p] = def[0][p] as number;
      return;
    }
    let v = def[def.length - 1][p] as number;
    for (let i = 1; i < def.length; i++) {
      if (t <= def[i].t) {
        const a = def[i - 1];
        const b = def[i];
        const k = (t - a.t) / Math.max(1e-6, b.t - a.t);
        v = (a[p] as number) + ((b[p] as number) - (a[p] as number)) * ease(b.ease ?? "smooth", k);
        break;
      }
    }
    out[p] = v;
  });
  return out;
};

export const computeCamera = (
  spec: CameraSpecT | undefined,
  t: number,
  duration: number,
  elements: ElementT[],
  resolve: (v: TimeValue | undefined, f?: number) => number,
): CamValues => {
  let cam: CamValues = { x: 960, y: 540, zoom: 1, rotate: 0 };
  if (spec?.keys && spec.keys.length > 0) {
    cam = sampleKeys(spec.keys, t, resolve);
  } else if (spec?.drift !== false) {
    // subtle "breathing" push-in keeps still shots alive
    const k = duration > 0 ? t / duration : 0;
    cam.zoom = 1 + 0.045 * ease("inOut", k);
    cam.x = 960 + 18 * Math.sin(k * Math.PI);
  }
  if (spec?.follow) {
    const el = findElement(elements, spec.follow);
    if (el) {
      // average a short window → smooth, slightly lagging follow
      let sum = 0;
      const N = 7;
      for (let i = 0; i < N; i++) {
        const tt = Math.max(0, t - 0.35 + (i * 0.35) / (N - 1));
        sum += samplePath(
          { x: el.x ?? 960, y: el.y ?? 540 },
          el.path,
          tt,
          resolve,
        ).x;
      }
      cam.x = sum / N;
    }
  }
  if (spec?.shake) {
    cam.x += noise2D("shx", t * 9, 0) * spec.shake;
    cam.y += noise2D("shy", 0, t * 9) * spec.shake;
    cam.rotate += noise2D("shr", t * 5, 3) * spec.shake * 0.02;
  }
  return cam;
};

export const CameraProvider: React.FC<{
  spec: CameraSpecT | undefined;
  t: number;
  children: React.ReactNode;
}> = ({ spec, t, children }) => {
  const scene = useScene();
  const cam = computeCamera(spec, t, scene.duration, scene.elements, scene.resolve);
  return <CameraContext.Provider value={cam}>{children}</CameraContext.Provider>;
};

/**
 * A parallax layer. depth 0 = fixed to the screen (infinitely far),
 * 1 = world plane, >1 = foreground that moves faster than the world.
 */
export const Layer: React.FC<{
  depth: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ depth, children, style }) => {
  const cam = useCamera();
  const z = Math.max(0.05, 1 + (cam.zoom - 1) * depth);
  const ox = (cam.x - 960) * depth;
  const oy = (cam.y - 540) * depth;
  return (
    <AbsoluteFill
      style={{
        transformOrigin: "0 0",
        transform: `translate(960px, 540px) rotate(${cam.rotate * Math.min(1, depth)}deg) scale(${z}) translate(${-960 - ox}px, ${-540 - oy}px)`,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** A full-stage SVG (1920×1080 viewBox) that may draw outside its bounds. */
export const Stage: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => (
  <svg
    width={1920}
    height={1080}
    viewBox="0 0 1920 1080"
    style={{ position: "absolute", left: 0, top: 0, overflow: "visible", ...style }}
  >
    {children}
  </svg>
);

/** Shorthand: a parallax layer containing an SVG stage. */
export const SvgLayer: React.FC<{ depth: number; children: React.ReactNode }> = ({
  depth,
  children,
}) => (
  <Layer depth={depth}>
    <Stage>{children}</Stage>
  </Layer>
);
