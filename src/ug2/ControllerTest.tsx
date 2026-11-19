/**
 * Intro test: gameplay "running" on a phone with a cloud-gaming touch layout reacting to inputs,
 * then a glitch reveal to the real "not available" screen (placeholder here until the recording arrives).
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Stage, Stamp } from "../ug/blocks";
import { clamp, Glitch, shake } from "../ug/fx";
import { C, DISPLAY, MONO } from "../ug/theme";
import { inputAt, type InputTrack } from "./Controller";
import { PhoneLandscape } from "./PhoneCloud";

const REVEAL = 160;
const sticks: InputTrack["sticks"] = [];
for (let f = 0; f <= REVEAL; f += 4) {
  const t = f / 30;
  sticks.push([f, Math.sin(t * 1.4) * 0.8, -0.9, Math.sin(t * 2.2) * 0.7, Math.sin(t * 1.1) * 0.3]);
}
const TRACK: InputTrack = {
  sticks,
  buttons: [
    ["A", 40, 46],
    ["X", 75, 80],
    ["RB", 100, 105],
    ["B", 130, 136],
  ],
  triggers: [
    [0, 0, 0],
    [52, 0, 0],
    [56, 1, 1],
    [90, 1, 1],
    [94, 0, 0],
  ],
};

/** Stand-in "gameplay": a moving road scene so the overlay can be judged against motion. */
const FakeGame: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg,#ff8a5c 0%,#ff5f7e 35%,#3b1d4a 60%,#121018 100%)" }}>
    {Array.from({ length: 14 }, (_, i) => {
      const x = (((i * 160 - f * 9) % 2240) + 2240) % 2240;
      return <div key={i} style={{ position: "absolute", left: x - 160, bottom: 300, width: 40, height: 120 + (i % 4) * 60, background: "#140c1c" }} />;
    })}
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 300, background: "#1b1b22" }} />
    {Array.from({ length: 8 }, (_, i) => (
      <div key={i} style={{ position: "absolute", left: ((((i * 280 - f * 22) % 2240) + 2240) % 2240) - 200, bottom: 140, width: 140, height: 12, background: "#e8e0c8" }} />
    ))}
    <div style={{ position: "absolute", left: "50%", top: "50%", fontFamily: MONO, fontSize: 30, color: "rgba(255,255,255,0.6)", transform: "translate(-50%,-50%)" }}>[ friend&apos;s GTA 6 gameplay ]</div>
  </AbsoluteFill>
);

export const ControllerTest: React.FC = () => {
  const f = useCurrentFrame();
  const s = inputAt(TRACK, Math.min(f, REVEAL));
  const push = interpolate(f, [0, REVEAL], [0.92, 1.0], clamp);
  const after = f >= REVEAL;
  return (
    <AbsoluteFill>
      <Stage f={f} accent="rgba(40,215,255,0.12)" x={50} y={50} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `${shake(f, REVEAL, 10, 18)} scale(${push})` }}>
        <PhoneLandscape s={s} tilt={-6 + f * 0.03} showTouch={!after}>
          {!after ? (
            <FakeGame f={f} />
          ) : (
            <AbsoluteFill style={{ background: "#101317", justifyContent: "center", alignItems: "center", fontFamily: MONO, fontSize: 34, color: C.mute }}>[ your real Xbox Cloud recording: GTA 6 not available ]</AbsoluteFill>
          )}
        </PhoneLandscape>
      </AbsoluteFill>
      {f < REVEAL ? (
        <AbsoluteFill style={{ alignItems: "center", paddingTop: 50 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: C.ink, textShadow: "0 6px 30px rgba(0,0,0,0.8)", opacity: interpolate(f, [10, 24], [0, 1], clamp) }}>GTA 6… ON A PHONE?</div>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 60 }}>
          <Stamp f={f} at={REVEAL + 8} size={90}>
            NOT SO FAST
          </Stamp>
        </AbsoluteFill>
      )}
      <Glitch at={REVEAL - 3} len={8} />
    </AbsoluteFill>
  );
};
