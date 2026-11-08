import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { AnimatedCharacter } from "../components/characters/AnimatedCharacter";
import { ArrowView } from "../components/objects/diagrams/Arrow";
import { DiagramView } from "../components/objects/diagrams/registry";
import { TextBlock } from "../components/typography/TextBlock";
import { EffectView } from "../components/effects/Effects";
import { ObjectView, OBJECTS } from "../components/objects/registry";
import { animState, IDLE_ANIM, normalizeAnim, type AnimState } from "../utils/anim";
import { Layer } from "../components/camera/Camera";
import { useScene } from "./context";
import { samplePath } from "../utils/keyframes";
import type { AnimPreset, ElementT } from "../utils/schema";

const isScreenKind = (el: ElementT) => el.kind === "text" || el.kind === "diagram";

const defaultEnter = (el: ElementT, start: number): AnimPreset => {
  switch (el.kind) {
    case "character":
    case "object":
      return start > 0.01 ? "pop" : "none";
    case "text":
      return "fade";
    case "diagram":
      return "zoom";
    case "arrow":
      return "draw";
    case "image":
      return "pop";
    default:
      return "fade";
  }
};

const SvgOrigin: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    {children}
  </svg>
);

const Content: React.FC<{ el: ElementT; t: number; local: number; anim: AnimState }> = ({ el, t, local, anim }) => {
  switch (el.kind) {
    case "character":
      return (
        <SvgOrigin>
          <AnimatedCharacter el={el} t={t} />
        </SvgOrigin>
      );
    case "object":
      return (
        <SvgOrigin>
          <ObjectView type={el.type} t={t} local={local} color={el.color} color2={el.color2} speed={el.speed} props={el.props} seed={el.id ?? el.type} />
        </SvgOrigin>
      );
    case "text":
      return <TextBlock el={el} local={local} />;
    case "diagram": {
      const build = el.build ?? 1.6;
      return <DiagramView el={el} k={Math.max(0, Math.min(1, local / build))} local={local} />;
    }
    case "effect":
      return (
        <SvgOrigin>
          <EffectView el={el} local={local} />
        </SvgOrigin>
      );
    case "arrow": {
      const build = el.build ?? 0.8;
      const reveal = Math.min(anim.reveal, Math.max(0, Math.min(1, local / build)));
      return <ArrowView el={el} reveal={anim.reveal < 1 ? anim.reveal : reveal} local={local} />;
    }
    case "image": {
      const w = el.width ?? 600;
      const h = el.height;
      return (
        <Img
          src={staticFile(el.src)}
          style={{
            position: "absolute",
            left: -w / 2,
            top: h ? -h / 2 : undefined,
            width: w,
            height: h,
            translate: h ? undefined : "0 -50%",
            borderRadius: el.radius ?? (el.frame ? 24 : 0),
            border: el.frame ? "10px solid #fff" : undefined,
            boxShadow: el.frame ? "0 24px 60px rgba(0,0,0,0.35)" : undefined,
            objectFit: "cover",
          }}
        />
      );
    }
    case "group":
      return (
        <>
          {el.children.map((c, i) => (
            <ElementNode key={c.id ?? i} el={c} t={t} nested />
          ))}
        </>
      );
    default:
      return null;
  }
};

/** Renders a single element with its timing, motion path and enter/exit animation. */
export const ElementNode: React.FC<{ el: ElementT; t: number; nested?: boolean }> = ({ el, t, nested }) => {
  const scene = useScene();
  const start = scene.resolve(el.at, 0);
  const hasUntil = el.until !== undefined;
  const until = hasUntil ? scene.resolve(el.until) : Infinity;
  const enter = normalizeAnim(el.enter, defaultEnter(el, start), el.kind === "arrow" ? el.build ?? 0.8 : 0.6);
  const exit = normalizeAnim(el.exit, "fade", 0.45);
  if (t < start) return null;
  if (hasUntil && t > until + exit.duration) return null;

  const local = t - start;
  let anim = IDLE_ANIM;
  if (local < enter.duration && enter.type !== "none") {
    anim = animState(enter.type, local / enter.duration, enter.ease);
  }
  if (hasUntil && t > until) {
    anim = animState(exit.type, 1 - (t - until) / exit.duration, exit.ease, true);
  }

  const groundDefault =
    el.kind === "character" ||
    (el.kind === "object" && (OBJECTS[el.type.toLowerCase()]?.anchor ?? "ground") === "ground");
  const base = {
    x: el.x ?? (el.kind === "arrow" ? 0 : 960),
    y: el.y ?? (el.kind === "arrow" ? 0 : groundDefault && !nested ? scene.groundY : 540),
    scale: el.scale ?? 1,
    rotate: el.rotate ?? 0,
    opacity: el.opacity ?? 1,
  };
  const tr = samplePath(base, el.path, t, scene.resolve);
  const floatY = el.float ? Math.sin(t * 1.6 + (el.id?.length ?? 0)) * el.float : 0;

  const wrapperStyle: React.CSSProperties = {
    position: "absolute",
    left: tr.x + anim.dx,
    top: tr.y + anim.dy + floatY,
    width: 0,
    height: 0,
    transform: `rotate(${tr.rotate + anim.rotate}deg) scale(${(el.flip ? -1 : 1) * tr.scale * anim.scale}, ${tr.scale * anim.scale})`,
    opacity: tr.opacity * anim.opacity,
    filter: anim.blur > 0.1 ? `blur(${anim.blur}px)` : undefined,
    clipPath: anim.wipe > 0 ? `inset(-3000px ${-(-1000 + (1 - anim.wipe / 100) * 2000)}px -3000px -3000px)` : undefined,
    zIndex: el.zIndex,
  };

  const node = (
    <div style={wrapperStyle}>
      {el.shadow ? (
        <div style={{ position: "absolute", left: -120, top: -16, width: 240, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.25)", filter: "blur(6px)" }} />
      ) : null}
      <Content el={el} t={t} local={local} anim={anim} />
    </div>
  );
  if (nested) return node;
  const screen = el.screen ?? isScreenKind(el);
  if (screen) return <AbsoluteFill style={{ zIndex: el.zIndex }}>{node}</AbsoluteFill>;
  return (
    <Layer depth={el.depth ?? 1} style={{ zIndex: el.zIndex }}>
      {node}
    </Layer>
  );
};

export const ElementsLayer: React.FC<{ elements: ElementT[]; t: number }> = ({ elements, t }) => (
  <>
    {elements.map((el, i) => (
      <ElementNode key={el.id ?? `${el.kind}-${i}`} el={el} t={t} />
    ))}
  </>
);
