import { Audio } from "@remotion/media";
import React from "react";
import { Sequence, staticFile, useVideoConfig } from "remotion";
import type { Timeline } from "../utils/narration";

export type MusicSpecT = {
  src: string;
  from?: string;
  crossfade: number;
  volume: number;
  duckTo: number;
  loop: boolean;
  fadeIn: number;
  fadeOut: number;
};

/** Absolute [start, end] seconds where narration is being spoken. */
export const speechSpans = (timeline: Timeline): [number, number][] => {
  const spans: [number, number][] = [];
  for (const s of timeline.scenes) {
    if (s.words.length === 0) continue;
    const off = s.from / timeline.fps;
    spans.push([off + s.words[0].start, off + s.words[s.words.length - 1].end]);
  }
  return spans;
};

/** 0..1 how much the music should be ducked at absolute time t. */
const duckAt = (spans: [number, number][], t: number, ramp = 0.5) => {
  let duck = 0;
  for (const [a, b] of spans) {
    if (t >= a - ramp && t <= b + ramp) {
      const k = t < a ? (t - (a - ramp)) / ramp : t > b ? 1 - (t - b) / ramp : 1;
      duck = Math.max(duck, Math.max(0, Math.min(1, k)));
    }
  }
  return duck;
};

export type MusicCuePlan = { spec: MusicSpecT; start: number; end: number; fadeIn: number; fadeOut: number };

/** Turns one track or a list of scene-anchored cues into absolute time ranges with crossfades. */
export const planMusic = (music: MusicSpecT | MusicSpecT[], timeline: Timeline, total: number): MusicCuePlan[] => {
  const list = Array.isArray(music) ? music : [music];
  const startOf = (c: MusicSpecT, i: number) => {
    if (i === 0 && !c.from) return 0;
    const s = timeline.scenes.find((x) => x.id === c.from);
    if (!s) throw new Error(`Music cue "${c.src}": unknown scene "${c.from}" in "from".`);
    return s.from / timeline.fps;
  };
  const starts = list.map(startOf);
  return list.map((spec, i) => {
    const last = i === list.length - 1;
    const end = last ? total : Math.min(total, starts[i + 1] + list[i + 1].crossfade);
    return {
      spec,
      start: starts[i],
      end,
      fadeIn: i === 0 ? spec.fadeIn : spec.crossfade,
      fadeOut: last ? spec.fadeOut : list[i + 1].crossfade,
    };
  });
};

/** Background music: one or more tracks, crossfaded, with automatic ducking under narration. */
export const MusicTrack: React.FC<{ music: MusicSpecT | MusicSpecT[]; timeline: Timeline }> = ({ music, timeline }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const total = durationInFrames / fps;
  const spans = React.useMemo(() => speechSpans(timeline), [timeline]);
  const plan = React.useMemo(() => planMusic(music, timeline, total), [music, timeline, total]);
  return (
    <>
      {plan.map((c, i) => {
        const len = c.end - c.start;
        const volume = (f: number) => {
          const local = f / fps;
          const abs = c.start + local;
          const base = c.spec.volume + (c.spec.duckTo - c.spec.volume) * duckAt(spans, abs);
          const fin = Math.min(1, local / Math.max(0.01, c.fadeIn));
          const fout = Math.min(1, (len - local) / Math.max(0.01, c.fadeOut));
          return Math.max(0, base * fin * fout);
        };
        return (
          <Sequence key={i} from={Math.round(c.start * fps)} durationInFrames={Math.max(1, Math.round(len * fps))} name={`Music ${c.spec.src}`} layout="none">
            <Audio src={/^https?:\/\//.test(c.spec.src) ? c.spec.src : staticFile(c.spec.src)} loop={c.spec.loop} volume={volume} />
          </Sequence>
        );
      })}
    </>
  );
};
