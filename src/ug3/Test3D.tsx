/** UG-003 3D look test: six short shots of every model (render with [gl:swangle] on CI). */
import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { Stage } from "../ug/blocks";
import { Bridge, Cam, Card, FuseField, Ga100, Glitcher, mix, Scene3D, Wire } from "./Three3D";

export const UG003_TEST_FRAMES = 300;
const k = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Hero: React.FC = () => {
  const f = useCurrentFrame();
  const a = -0.6 + f * 0.012;
  return (
    <Scene3D>
      <Cam pos={[Math.sin(a) * 34, 14, Math.cos(a) * 34]} target={[0, 1.5, 0]} fov={30} />
      <Card accentK={k(f, 0, 30)} />
    </Scene3D>
  );
};
const Explode: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene3D>
      <Cam pos={[mix(24, 12, k(f, 0, 50)), mix(20, 26, k(f, 0, 50)), 22]} target={[-1, 2, 0]} fov={30} />
      <Card explode={k(f, 5, 40)} smOn={70} memGB={8} />
    </Scene3D>
  );
};
const Chip: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene3D>
      <Cam pos={[mix(6, 3, k(f, 0, 50)), mix(9, 6.5, k(f, 0, 50)), 6]} target={[0, 0, 0]} fov={30} />
      <Ga100 smOn={mix(70, 128, k(f, 10, 40))} memGB={mix(8, 80, k(f, 10, 45))} />
    </Scene3D>
  );
};
const Fuses: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene3D>
      <Cam pos={[mix(-10, 6, k(f, 0, 50)), 6, 12]} target={[0, 0, 0]} fov={36} />
      <FuseField sweep={k(f, 5, 45)} />
    </Scene3D>
  );
};
const Rig: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene3D>
      <Cam pos={[16, 14, 16]} target={[6, 0, 0]} fov={30} />
      <Card hideCover vrmGlow={f % 10 < 3 ? 1 : 0} />
      <Glitcher p={[9, 0.2, 9]} led={f % 10 < 3 ? 1 : 0} />
      <Wire pts={[[8, 0.4, 8], [8.5, 2, 5], [7, 1.2, 1], [6.6, 0.3, -1.2]]} draw={k(f, 0, 30)} />
      <Wire pts={[[9.5, 0.4, 8], [10, 2.5, 4], [9, 1, 0], [8.2, 0.3, -2]]} draw={k(f, 10, 40)} color="#c86a32" />
    </Scene3D>
  );
};
const Link: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene3D>
      <Cam pos={[30, 20, 30]} target={[0, 4, 0]} fov={30} />
      <Card p={[0, 0, -4]} r={[Math.PI / 2, 0, 0]} />
      <Card p={[0, 0, 4]} r={[Math.PI / 2, 0, 0]} />
      <Bridge a={[2, 6.5, -4]} b={[2, 6.5, 4]} on={k(f, 5, 20)} t={f} />
    </Scene3D>
  );
};

const SHOTS = [Hero, Explode, Chip, Fuses, Rig, Link];
export const Test3D: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Stage f={f} accent="rgba(40,215,255,0.16)" x={50} y={40} />
      {SHOTS.map((S, i) => (
        <Sequence key={i} from={i * 50} durationInFrames={50}>
          <S />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
