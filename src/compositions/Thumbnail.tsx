/**
 * YouTube thumbnail = one engine scene (same environments, characters and objects as the video)
 * frozen at a moment, plus thumbnail-style overlays: heavy outlined text, banners, drips,
 * colour punch and vignette.
 *
 * Specs live in projects/<id>/thumbnails.json and are rendered by `npm run thumbnails -- <id>`.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { Drips } from "../components/typography/TextBlock";
import type { CharacterLook } from "../utils/schema";
import type { Theme } from "../scenes/context";
import { SceneRenderer } from "../scenes/SceneRenderer";
import { FONT_FAMILY } from "../utils/fonts";
import type { ThumbSpecT, ThumbTextT } from "../utils/thumbnail-schema";

export type ThumbnailProps = {
  spec?: ThumbSpecT;
  theme?: Theme;
  cast?: Record<string, Partial<CharacterLook>>;
  fps?: number;
};

const Text: React.FC<{ t: ThumbTextT }> = ({ t }) => {
  const drip = t.drip ? (typeof t.drip === "string" ? t.drip : "#9b111e") : null;
  const lines = t.text.split("\n");
  return (
    <div
      style={{
        position: "absolute",
        left: t.x,
        top: t.y,
        translate: t.align === "center" ? "-50% -50%" : t.align === "right" ? "-100% -50%" : "0 -50%",
        rotate: `${t.rotate}deg`,
        width: "max-content",
        fontFamily: FONT_FAMILY,
        fontWeight: 800,
        fontSize: t.size,
        lineHeight: 0.98,
        letterSpacing: `${t.tracking}em`,
        textAlign: t.align,
        color: t.color,
        background: t.background,
        padding: t.background ? "0.12em 0.45em 0.16em" : undefined,
        borderRadius: t.background ? "0.18em" : undefined,
        boxShadow: t.background ? "0 0.08em 0 rgba(0,0,0,0.55), 0 0.2em 0.5em rgba(0,0,0,0.45)" : undefined,
        textTransform: "uppercase",
      }}
    >
      {lines.map((line, li) => (
        <div key={li}>
          {line.split(/(\s+)/).map((w, wi) =>
            /^\s+$/.test(w) ? (
              <span key={wi}>{w}</span>
            ) : (
              <span key={wi} style={{ position: "relative", display: "inline-block" }}>
                                <span
                  style={{
                    position: "relative",
                    WebkitTextStroke: t.background ? undefined : `${t.strokeWidth}px ${t.stroke}`,
                    paintOrder: "stroke fill",
                    textShadow: t.background ? "0 0.04em 0 rgba(0,0,0,0.35)" : `0 ${t.strokeWidth * 0.6}px 0 ${t.stroke}, 0 0.06em 0.25em rgba(0,0,0,0.6)`,
                  }}
                >
                  {w}
                </span>
                {drip ? (
                  <span style={{ position: "absolute", inset: 0, top: "-0.07em" }}>
                    <Drips word={w} idx={wi + li * 7} local={30} color={drip} length={t.dripLength} />
                  </span>
                ) : null}
              </span>
            ),
          )}
        </div>
      ))}
    </div>
  );
};

export const Thumbnail: React.FC<ThumbnailProps> = ({ spec, theme, cast, fps = 30 }) => {
  if (!spec || !theme) return <AbsoluteFill style={{ background: "#111" }} />;
  const { look } = spec;
  const dur = Math.round((spec.at + 1) * fps);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: `saturate(${look.saturate}) contrast(${look.contrast}) brightness(${look.brightness})` }}>
        <SceneRenderer
          scene={spec.scene}
          timing={{ id: spec.id, index: 0, from: 0, durationInFrames: dur, transitionIn: 0, audio: null, narrationStart: 0, words: [] }}
          theme={theme}
          cast={cast ?? {}}
          subtitles={null}
          defaultTag="none"
        />
      </AbsoluteFill>
      {look.tint ? <AbsoluteFill style={{ background: look.tint, mixBlendMode: "multiply" }} /> : null}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,${look.vignette}) 100%)` }} />
      {spec.texts.map((t, i) => (
        <Text key={i} t={t} />
      ))}
    </AbsoluteFill>
  );
};
