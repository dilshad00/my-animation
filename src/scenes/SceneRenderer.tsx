import { Audio } from "@remotion/media";
import React, { useMemo } from "react";
import { AbsoluteFill, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { EnvironmentFront, ENVIRONMENTS, EnvironmentView } from "../components/environments/registry";
import { Subtitles, type SubtitleStyle } from "../components/typography/Subtitles";
import { sfxSrc } from "../utils/sfx";
import { CameraProvider } from "../components/camera/Camera";
import { makeSceneCtx, SceneProvider, type Theme } from "./context";
import { ElementsLayer } from "./ElementRenderer";
import { PALETTES, withWeather } from "../utils/lighting";
import type { SceneTiming } from "../utils/narration";
import type { CharacterLook, EnvironmentSpecT, SceneT, SceneTagT } from "../utils/schema";
import { SceneTag } from "../components/typography/SceneTag";
import { ANIME_ENV_ALIASES } from "../components/anime/environments";
import { AnimeGrade } from "../components/anime/AnimeFx";

type SfxCueT = NonNullable<SceneT["sfx"]>[number];

const GRADES: Record<string, string | undefined> = {
  none: undefined,
  warm: "sepia(0.12) saturate(1.12) brightness(1.02)",
  cool: "hue-rotate(-6deg) saturate(0.95) brightness(1.02)",
  dramatic: "contrast(1.14) saturate(1.18) brightness(0.96)",
  vintage: "sepia(0.32) contrast(0.94) saturate(0.85)",
  dream: "saturate(1.25) brightness(1.06) contrast(0.95)",
  /** aged, historical */
  sepia: "sepia(0.55) contrast(0.96) saturate(0.9) brightness(1.02)",
  /** blood storm: pushes everything toward deep red */
  crimson: "sepia(0.4) hue-rotate(-14deg) saturate(1.5) contrast(1.1) brightness(0.88)",
  /** polluted water: green-brown and dull */
  murky: "sepia(0.45) hue-rotate(28deg) saturate(0.75) contrast(1.06) brightness(0.86)",
  /** dried, rust-coloured aftermath */
  rust: "sepia(0.5) hue-rotate(-12deg) saturate(1.25) contrast(1.04) brightness(0.97)",
  /** fresh, clear and bright */
  clean: "saturate(1.15) contrast(1.03) brightness(1.05)",
  /** premium anime: punchy colour; bloom, vignette and grain are drawn as overlays */
  anime: "saturate(1.12) contrast(1.04)",
};

export type SceneRendererProps = {
  scene: SceneT;
  timing: SceneTiming;
  theme: Theme;
  cast: Record<string, Partial<CharacterLook>>;
  subtitles: (SubtitleStyle & { enabled: boolean }) | null;
  voiceover?: string;
  voiceVolume?: number;
  /** project.defaultTag, used when the scene sets no tag */
  defaultTag?: SceneTagT;
  /** project art style */
  style?: "classic" | "anime";
};

const FADE = 0.35;

/** One sound cue; looped cues play until `until` (or the scene end) with short fades. */
const SfxPlayer: React.FC<{ cue: SfxCueT; fromSec: number; untilSec: number; fps: number }> = ({ cue, fromSec, untilSec, fps }) => {
  const vol = cue.volume ?? 0.6;
  if (!cue.loop) return <Audio src={sfxSrc(cue.src)} volume={vol} />;
  const len = Math.max(0.1, untilSec - fromSec);
  return (
    <Audio
      src={sfxSrc(cue.src)}
      loop
      volume={(f) => {
        const t = f / fps;
        return vol * Math.max(0, Math.min(1, t / FADE, (len - t) / FADE));
      }}
    />
  );
};

/**
 * Renders one scene: environment (with parallax camera), elements,
 * weather, grading, subtitles, its slice of the voiceover and SFX cues.
 * Frame 0 = the first frame of the scene (including its transition-in).
 */
export const SceneRenderer: React.FC<SceneRendererProps> = ({ scene, timing, theme, cast, subtitles, voiceover, voiceVolume = 1, defaultTag, style = "classic" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const duration = timing.durationInFrames / fps;
  const anime = style === "anime";
  const rawEnv: EnvironmentSpecT = scene.environment ?? { type: "studio" };
  const env: EnvironmentSpecT = anime && ANIME_ENV_ALIASES[rawEnv.type.toLowerCase()] ? { ...rawEnv, type: ANIME_ENV_ALIASES[rawEnv.type.toLowerCase()] } : rawEnv;
  const palette = useMemo(() => withWeather(PALETTES[env.time ?? "day"], env.weather, env.rainColor), [env.time, env.weather, env.rainColor]);
  const groundY = ENVIRONMENTS[env.type.toLowerCase()]?.groundY ?? 900;
  const ctx = useMemo(
    () =>
      makeSceneCtx({
        sceneId: scene.id,
        duration,
        fps,
        words: timing.words,
        palette,
        theme,
        cast,
        elements: scene.elements,
        groundY,
        style,
      }),
    [scene.id, scene.elements, duration, fps, timing.words, palette, theme, cast, groundY, style],
  );

  const grade = scene.grade ?? (anime ? "anime" : "none");
  const vignette = scene.vignette ?? (grade === "anime" ? 0 : 0.35);
  return (
    <SceneProvider value={ctx}>
      <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000", filter: GRADES[grade] }}>
        <CameraProvider spec={scene.camera} t={t}>
          <EnvironmentView spec={env} palette={palette} t={t} sceneId={scene.id} />
          <ElementsLayer elements={scene.elements} t={t} />
          <EnvironmentFront spec={env} palette={palette} t={t} />
        </CameraProvider>
        {grade === "anime" ? <AnimeGrade frame={frame} warmth={palette.time === "night" ? "#7a8cff" : palette.time === "sunset" ? "#ff9a6b" : "#ffe2b8"} /> : null}
        {vignette > 0 ? (
          <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,${vignette}) 100%)`, pointerEvents: "none" }} />
        ) : null}
        <SceneTag tag={scene.tag ?? defaultTag} t={t} duration={duration} />
        {subtitles?.enabled && scene.subtitles !== false && timing.words.length > 0 ? (
          <Subtitles words={timing.words} t={t} style={subtitles} />
        ) : null}
      </AbsoluteFill>
      {voiceover && timing.audio ? (
        <Sequence from={Math.round(timing.narrationStart * fps)} name="Voiceover" layout="none">
          <Audio
            src={staticFile(voiceover)}
            trimBefore={Math.round(timing.audio.start * fps)}
            trimAfter={Math.round(timing.audio.end * fps)}
            volume={voiceVolume}
          />
        </Sequence>
      ) : null}
      {(scene.sfx ?? []).map((cue, i) => {
        const from = Math.max(0, ctx.resolve(cue.at));
        const until = cue.until !== undefined ? Math.min(duration, ctx.resolve(cue.until)) : duration;
        const len = cue.loop ? Math.max(1, Math.round((until - from) * fps)) : undefined;
        return (
          <Sequence key={i} from={Math.round(from * fps)} durationInFrames={len} name={`SFX ${cue.src}`} layout="none">
            <SfxPlayer cue={cue} fromSec={from} untilSec={until} fps={fps} />
          </Sequence>
        );
      })}
      {scene.transition?.sfx ? (
        <Audio src={sfxSrc(scene.transition.sfx)} volume={0.5} />
      ) : null}
    </SceneProvider>
  );
};
