import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedCharacter } from "../components/characters/AnimatedCharacter";
import { PRESETS } from "../components/characters/presets";
import { makeSceneCtx, SceneProvider } from "../scenes/context";
import { PALETTES } from "../utils/lighting";
import { estimateWords } from "../utils/narration";
import type { ActionName, CharacterElementT, ExpressionName } from "../utils/schema";

const LABEL: React.CSSProperties = {
  position: "absolute",
  fontFamily: "Poppins, sans-serif",
  fontWeight: 600,
  fontSize: 22,
  color: "#22304a",
  textAlign: "center",
  width: 200,
};

const words = estimateWords(
  "Hello there! This is a lip sync test for every character in the cast, speaking clearly and naturally.",
  150,
).map((w) => ({ ...w, start: w.start + 0.5, end: w.end + 0.5 }));

/** Every built-in cast member, talking with lip-sync. */
export const CastGallery: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const ids = Object.keys(PRESETS);
  const ctx = makeSceneCtx({
    sceneId: "cast",
    duration: durationInFrames / fps,
    fps,
    words,
    palette: PALETTES.day,
  });
  const exprs: ExpressionName[] = ["happy", "neutral", "confident", "surprised", "joy", "thinking", "wink", "worried", "happy", "confident", "sad"];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#eef4ff, #d8e6fb)" }}>
      <SceneProvider value={ctx}>
        {ids.map((id, i) => {
          const col = i % 6;
          const row = Math.floor(i / 6);
          const x = 160 + col * 320;
          const y = 470 + row * 500;
          const el: CharacterElementT = {
            kind: "character",
            who: id,
            x,
            y,
            speaks: true,
            expression: exprs[i % exprs.length],
          };
          return (
            <React.Fragment key={id}>
              <svg width={1} height={1} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
                <g transform="scale(0.95)">
                  <AnimatedCharacter el={el} t={t} />
                </g>
              </svg>
              <div style={{ ...LABEL, left: x - 100, top: y + 14 }}>{PRESETS[id].name} · {PRESETS[id].body}</div>
            </React.Fragment>
          );
        })}
      </SceneProvider>
    </AbsoluteFill>
  );
};

const ACTION_LIST: ActionName[] = [
  "idle", "walk", "run", "talk", "point", "present", "wave", "sit",
  "type", "cheer", "think", "shrug", "react", "jump", "nod", "sitTalk",
];

/** One character performing every action. */
export const ActionGallery: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const ctx = makeSceneCtx({
    sceneId: "actions",
    duration: durationInFrames / fps,
    fps,
    words,
    palette: PALETTES.day,
  });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(#fff7ec, #f4dfc4)" }}>
      <SceneProvider value={ctx}>
        {ACTION_LIST.map((a, i) => {
          const col = i % 8;
          const row = Math.floor(i / 8);
          const x = 125 + col * 238;
          const y = 470 + row * 500;
          const walking = a === "walk" || a === "run";
          const el: CharacterElementT = {
            kind: "character",
            who: i % 2 ? "maya" : "alex",
            x,
            y,
            facing: "right",
            actions: walking ? [] : [{ t: 0.3, do: a }],
            // walkers move on a treadmill path that loops back each 2s
            path: walking ? [{ t: 100, x: x + (a === "run" ? 60000 : 16000) }] : undefined,
            expression: a === "react" ? "surprised" : a === "cheer" ? "joy" : a === "think" ? "thinking" : "happy",
            speaks: a === "talk" || a === "sitTalk",
          };
          return (
            <React.Fragment key={a}>
              <svg width={1} height={1} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
                {/* cancel horizontal travel for walkers so they walk in place */}
                <g transform="scale(0.85)">
                  <AnimatedCharacter el={el} t={t} />
                </g>
              </svg>
              <div style={{ ...LABEL, left: x - 100, top: y + 14 }}>{a}</div>
            </React.Fragment>
          );
        })}
      </SceneProvider>
    </AbsoluteFill>
  );
};
