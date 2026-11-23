/** UG-003 thumbnails (render as stills with [gl:swangle], scale 0.6667 → 1280×720). */
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, DISPLAY, MONO } from "../ug/theme";
import { Padlock } from "./Gfx3";
import { Cam, Card, ContactShadow, Ga100, Scene3D } from "./Three3D";

const Bg: React.FC<{ a: string; b: string }> = ({ a, b }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse at 70% 50%, ${a} 0%, #05070a 60%), radial-gradient(ellipse at 10% 90%, ${b} 0%, transparent 50%)`, backgroundColor: "#05070a" }} />
);
const Stroke = (c: string, w = 10) => ({ WebkitTextStroke: `${w}px #000`, paintOrder: "stroke fill" as const, color: c });

/** A: giant 8GB → 80GB with the glowing exploded card. */
export const Ug3ThumbA: React.FC = () => (
  <AbsoluteFill>
    <Bg a="rgba(53,242,154,0.35)" b="rgba(255,61,82,0.25)" />
    <AbsoluteFill style={{ left: 520 }}>
      <Scene3D rimA="#35f29a" rimB="#28d7ff" key1={2.8}>
        <Cam pos={[20, 24, 24]} target={[1, 2.5, 0]} fov={34} />
        <Card explode={0.55} memGB={80} smOn={128} glow={1.6} accentK={2} />
        <ContactShadow />
      </Scene3D>
    </AbsoluteFill>
    <div style={{ position: "absolute", left: 60, top: 60 }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 250, lineHeight: 0.9, ...Stroke("#ff3d52", 12), position: "relative", display: "inline-block" }}>
        8GB
        <div style={{ position: "absolute", left: -10, right: -10, top: "48%", height: 22, background: "#fff", transform: "rotate(-8deg)", boxShadow: "0 0 30px #000" }} />
      </div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 380, lineHeight: 0.9, ...Stroke(C.green, 14), textShadow: `0 0 80px ${C.green}` }}>80GB</div>
    </div>
    <div style={{ position: "absolute", left: 70, bottom: 70, padding: "10px 30px", background: C.amber, borderRadius: 14, fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, color: "#000", transform: "rotate(-3deg)" }}>$8 HACK?!</div>
  </AbsoluteFill>
);

/** B: the chip with every memory stack lit + price jump. */
export const Ug3ThumbB: React.FC = () => (
  <AbsoluteFill>
    <Bg a="rgba(40,215,255,0.35)" b="rgba(53,242,154,0.25)" />
    <Scene3D rimA="#28d7ff" rimB="#35f29a" key1={2.4}>
      <Cam pos={[3.2, 6.4, 5.4]} target={[0.6, -0.4, 0.4]} fov={34} />
      <Ga100 smOn={128} memGB={80} glow={1.6} />
    </Scene3D>
    <div style={{ position: "absolute", left: 50, top: 40 }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 150, ...Stroke("#ffb648", 10) }}>$2,500</div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 120, ...Stroke("#fff", 10), lineHeight: 1 }}>→ $20,000 GPU</div>
    </div>
    <div style={{ position: "absolute", right: 50, bottom: 50, fontFamily: DISPLAY, fontWeight: 700, fontSize: 170, ...Stroke(C.green, 12), textShadow: `0 0 60px ${C.green}` }}>80GB</div>
  </AbsoluteFill>
);

/** C: "NVIDIA LOCKED THIS" with broken padlock over the card. */
export const Ug3ThumbC: React.FC = () => (
  <AbsoluteFill>
    <Bg a="rgba(255,61,82,0.3)" b="rgba(53,242,154,0.2)" />
    <Scene3D rimA="#ff3d52" rimB="#35f29a" key1={2.6}>
      <Cam pos={[26, 18, 26]} target={[-3, 1, 0]} fov={32} />
      <Card explode={0.4} memGB={80} smOn={128} glow={1.4} accent="#35f29a" accentK={1.8} />
      <ContactShadow />
    </Scene3D>
    <div style={{ position: "absolute", left: 60, top: 50, fontFamily: DISPLAY, fontWeight: 700, fontSize: 170, lineHeight: 0.95, ...Stroke("#fff", 12) }}>
      NVIDIA
      <br />
      <span style={{ color: C.red }}>LOCKED</span> THIS
    </div>
    <div style={{ position: "absolute", right: 120, top: 80 }}>
      <Padlock size={300} color={C.green} open={1} />
    </div>
    <div style={{ position: "absolute", left: 60, bottom: 60, padding: "8px 26px", background: C.green, borderRadius: 14, fontFamily: DISPLAY, fontWeight: 700, fontSize: 90, color: "#000" }}>8GB → 80GB</div>
  </AbsoluteFill>
);
