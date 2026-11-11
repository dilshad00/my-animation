import { TransitionSeries } from "@remotion/transitions";
import React from "react";
import { AbsoluteFill, type CalculateMetadataFunction } from "remotion";
import { MusicTrack } from "./MusicTrack";
import { PROJECTS } from "../projects.generated";
import type { Theme } from "../scenes/context";
import type { Timeline } from "../utils/narration";
import { normalizeCaptionsJson, parseProject, projectTimeline } from "../utils/project";
import { SceneRenderer } from "../scenes/SceneRenderer";
import type { ProjectT } from "../utils/schema";
import { makeTransition } from "../scenes/transitions";

export type VideoProps = {
  /** Folder name in projects/ */
  projectId: string;
  /** Filled by calculateMetadata */
  project?: ProjectT;
  timeline?: Timeline;
  /** narration file inside public/ (set once transcribed) */
  narration?: string | null;
};

export const calculateVideoMetadata: CalculateMetadataFunction<VideoProps> = async ({ props }) => {
  const entry = PROJECTS[props.projectId];
  if (!entry) {
    throw new Error(`Project "${props.projectId}" not found. Run "npm run sync" after adding projects/${props.projectId}/storyboard.json`);
  }
  const project = parseProject(entry.storyboard, `projects/${props.projectId}/storyboard.json`);
  const captions = entry.captions ? normalizeCaptionsJson(entry.captions) : null;
  const timeline = projectTimeline(project, captions);
  for (const w of timeline.warnings) console.warn(`[${project.id}] ${w}`);
  return {
    durationInFrames: Math.max(1, timeline.totalFrames),
    fps: project.fps,
    width: project.width,
    height: project.height,
    props: { ...props, project, timeline, narration: captions ? entry.narration : null },
    defaultOutName: project.id,
  };
};

export const VideoComposition: React.FC<VideoProps> = ({ project, timeline, narration }) => {
  if (!project || !timeline) return null;
  const theme: Theme = project.theme;
  const subs = project.subtitles.enabled
    ? {
        enabled: true,
        position: project.subtitles.position,
        highlight: project.subtitles.highlight ?? theme.accent,
        maxWords: project.subtitles.maxWords,
        size: project.subtitles.size,
      }
    : null;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <TransitionSeries>
        {project.scenes.map((scene, i) => {
          const timing = timeline.scenes[i];
          const tSpec = scene.transition ?? project.defaultTransition;
          const tr = i > 0 && tSpec && timing.transitionIn > 0 ? makeTransition({ ...tSpec, duration: timing.transitionIn / project.fps }, project.fps, project.width, project.height) : null;
          return (
            <React.Fragment key={scene.id}>
              {tr ? <TransitionSeries.Transition presentation={tr.presentation} timing={tr.timing} /> : null}
              <TransitionSeries.Sequence durationInFrames={timing.durationInFrames} name={scene.id}>
                <SceneRenderer
                  scene={scene}
                  timing={timing}
                  theme={theme}
                  cast={project.cast}
                  subtitles={subs}
                  voiceover={narration ?? undefined}
                  voiceVolume={project.audio.voiceVolume}
                  defaultTag={project.defaultTag}
                  style={project.style}
                />
              </TransitionSeries.Sequence>
            </React.Fragment>
          );
        })}
      </TransitionSeries>
      {project.audio.music ? <MusicTrack music={project.audio.music} timeline={timeline} /> : null}
    </AbsoluteFill>
  );
};
