/** Controller animation test: synthetic inputs (sticks sweeping, button taps) over a stand-in backdrop. */
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Stage } from "../ug/blocks";
import { C, MONO } from "../ug/theme";
import { ActionPop, Controller, inputAt, type InputTrack } from "./Controller";

const sticks: InputTrack["sticks"] = [];
for (let f = 0; f <= 240; f += 4) {
  const t = f / 30;
  sticks.push([f, Math.sin(t * 1.6) * (f > 30 ? 1 : 0), -Math.abs(Math.cos(t * 0.8)) * (f > 30 ? 1 : 0), Math.sin(t * 2.4) * 0.8, Math.sin(t * 1.3) * 0.4]);
}
const TRACK: InputTrack = {
  sticks,
  buttons: [["A", 60, 66], ["X", 90, 94], ["RB", 120, 126], ["B", 150, 156], ["Y", 175, 180], ["UP", 200, 206], ["LS", 215, 230]],
  triggers: [[0, 0, 0], [100, 0, 0], [108, 1, 0], [140, 1, 0], [146, 0, 1], [190, 0, 1], [196, 0, 0]],
};
const EVENTS: [import("./Controller").Btn, number, number, string][] = [["A", 60, 66, "JUMP"], ["X", 90, 94, "RELOAD"], ["RT", 146, 190, "FIRE"], ["B", 150, 156, "COVER"]];

export const ControllerTest: React.FC = () => {
  const f = useCurrentFrame();
  const s = inputAt(TRACK, f);
  return (
    <AbsoluteFill>
      <Stage f={f} accent="rgba(255,120,200,0.18)" x={60} y={40} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily: MONO, fontSize: 40, color: C.mute, paddingBottom: 300 }}>[ gameplay ]</AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 30 }}>
        <div style={{ position: "relative" }}>
          <Controller s={s} scale={0.62} />
          <div style={{ position: "absolute", left: "50%", top: -150, transform: "translateX(-50%)" }}>
            <ActionPop f={f} events={EVENTS} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
