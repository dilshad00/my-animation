import type { TransitionPresentation, TransitionPresentationComponentProps, TransitionTiming } from "@remotion/transitions";
import { linearTiming, springTiming } from "@remotion/transitions";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { fade } from "@remotion/transitions/fade";
import { flip } from "@remotion/transitions/flip";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import React from "react";
import { AbsoluteFill, Easing } from "remotion";
import type { TransitionSpecT } from "../utils/schema";

type NoProps = Record<string, never>;

/** Circular iris reveal of the entering scene. */
const IrisPresentation: React.FC<TransitionPresentationComponentProps<NoProps>> = ({ children, presentationDirection, presentationProgress }) => {
  if (presentationDirection === "exiting") return <AbsoluteFill>{children}</AbsoluteFill>;
  const r = Easing.bezier(0.65, 0, 0.35, 1)(presentationProgress) * 120;
  return <AbsoluteFill style={{ clipPath: `circle(${r}% at 50% 50%)` }}>{children}</AbsoluteFill>;
};

/** Fast camera whip-pan with motion blur. */
const WhipPresentation: React.FC<TransitionPresentationComponentProps<{ dir: number }>> = ({ children, presentationDirection, presentationProgress, passedProps }) => {
  const p = Easing.bezier(0.7, 0, 0.3, 1)(presentationProgress);
  const blur = Math.sin(presentationProgress * Math.PI) * 28;
  const x = presentationDirection === "entering" ? (1 - p) * 100 * passedProps.dir : -p * 100 * passedProps.dir;
  return <AbsoluteFill style={{ translate: `${x}% 0`, filter: `blur(${blur}px)` }}>{children}</AbsoluteFill>;
};

/** Zoom through: outgoing scene zooms in & fades, incoming scales down into place. */
const ZoomPresentation: React.FC<TransitionPresentationComponentProps<NoProps>> = ({ children, presentationDirection, presentationProgress }) => {
  const p = Easing.bezier(0.65, 0, 0.35, 1)(presentationProgress);
  if (presentationDirection === "exiting") {
    return <AbsoluteFill style={{ scale: String(1 + p * 0.8), opacity: 1 - p, filter: `blur(${p * 10}px)` }}>{children}</AbsoluteFill>;
  }
  return <AbsoluteFill style={{ scale: String(1.25 - 0.25 * p), opacity: p, filter: `blur(${(1 - p) * 10}px)` }}>{children}</AbsoluteFill>;
};

const dirMap = { left: "from-right", right: "from-left", up: "from-bottom", down: "from-top" } as const;

export const transitionDuration = (spec: TransitionSpecT | undefined) =>
  !spec || spec.type === "none" ? 0 : spec.duration ?? (spec.type === "whip" ? 0.5 : 0.8);

export const makeTransition = (
  spec: TransitionSpecT,
  fps: number,
  width: number,
  height: number,
): { presentation: TransitionPresentation<Record<string, unknown>>; timing: TransitionTiming } | null => {
  if (spec.type === "none") return null;
  const frames = Math.max(1, Math.round(transitionDuration(spec) * fps));
  const timing = spec.type === "slide" || spec.type === "flip" ? springTiming({ config: { damping: 200 }, durationInFrames: frames }) : linearTiming({ durationInFrames: frames });
  const d = dirMap[spec.direction ?? "left"];
  let presentation: TransitionPresentation<Record<string, unknown>>;
  switch (spec.type) {
    case "fade":
      presentation = fade() as TransitionPresentation<Record<string, unknown>>;
      break;
    case "slide":
      presentation = slide({ direction: d }) as TransitionPresentation<Record<string, unknown>>;
      break;
    case "wipe":
      presentation = wipe({ direction: d }) as TransitionPresentation<Record<string, unknown>>;
      break;
    case "flip":
      presentation = flip({ direction: d }) as TransitionPresentation<Record<string, unknown>>;
      break;
    case "clock":
      presentation = clockWipe({ width, height }) as unknown as TransitionPresentation<Record<string, unknown>>;
      break;
    case "iris":
      presentation = { component: IrisPresentation, props: {} } as unknown as TransitionPresentation<Record<string, unknown>>;
      break;
    case "whip":
      presentation = { component: WhipPresentation, props: { dir: spec.direction === "right" ? -1 : 1 } } as unknown as TransitionPresentation<Record<string, unknown>>;
      break;
    case "zoom":
      presentation = { component: ZoomPresentation, props: {} } as unknown as TransitionPresentation<Record<string, unknown>>;
      break;
    default:
      presentation = fade() as TransitionPresentation<Record<string, unknown>>;
  }
  return { presentation, timing };
};
