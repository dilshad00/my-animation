/** UG-006 thumbnails (render as stills → 1280×720). Original 3D models only, no logos or official renders. */
import React from "react";
import { AbsoluteFill } from "remotion";
import { HEAD, INTER } from "./Look6";
import { Dimm, FeCard, Glow, P, Stage } from "./Three6";
import { Hall, JewelCase, Tower } from "./World6";

const Stroke = (c: string, w = 10) => ({ WebkitTextStroke: `${w}px #000`, paintOrder: "stroke fill" as const, color: c });
const Brand = () => (
  <div style={{ position: "absolute", right: 50, top: 34, fontFamily: INTER, fontWeight: 600, fontSize: 30, letterSpacing: 10, color: "#fff", opacity: 0.9, borderBottom: `3px solid ${P.orange}`, paddingBottom: 6 }}>UNKNOWN GAMER</div>
);
const Pill: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = P.coral, style }) => (
  <div style={{ position: "absolute", padding: "8px 34px", borderRadius: 18, background: "rgba(0,0,0,0.85)", border: `6px solid ${color}`, boxShadow: `0 0 40px ${color}`, fontFamily: HEAD, fontWeight: 800, fontSize: 84, color: "#fff", whiteSpace: "nowrap", ...style }}>{children}</div>
);
const Big: React.FC<{ size: number; color: string; children: React.ReactNode }> = ({ size, color, children }) => (
  <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: size, lineHeight: 0.9, letterSpacing: 2, ...Stroke(color, 14) }}>{children}</div>
);

/** A — scarcity: the RTX 50 card fading out of a red-lit void. */
export const Ug6ThumbA: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#060607" }}>
    <AbsoluteFill style={{ background: "radial-gradient(circle at 66% 55%, rgba(255,90,78,0.45), rgba(0,0,0,0) 55%)" }} />
    <Stage cam={{ pos: [0, 18, 46], target: [0, 0, 0], fov: 34 }} keyPos={[30, 40, 30]} kick={P.coral}>
      <group position={[10, -1, 0]}>
        <FeCard cls="90" r={[0.75, -0.55, 0.12]} light={1} spin={0.6} />
      </group>
      <Glow p={[10, -4, -6]} s={46} color={P.coral} o={0.35} />
    </Stage>
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 45%, transparent 70%)" }} />
    <Brand />
    <div style={{ position: "absolute", left: 60, top: 150 }}>
      <Big size={250} color="#fff">NO MORE</Big>
      <Big size={300} color={P.orange}>RTX 50?</Big>
    </div>
    <Pill style={{ left: 70, bottom: 110, transform: "rotate(-3deg)" }}>SUPPLY −30%?</Pill>
    <Pill color={P.white} style={{ right: 80, bottom: 80, transform: "rotate(4deg)", fontSize: 76 }}>SOLD OUT</Pill>
  </AbsoluteFill>
);

/** B — RAM is the new gold: DDR5 stick in a jewellery case. */
export const Ug6ThumbB: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#070605" }}>
    <AbsoluteFill style={{ background: "radial-gradient(circle at 68% 52%, rgba(255,181,71,0.5), rgba(0,0,0,0) 55%)" }} />
    <Stage cam={{ pos: [-2, 30, 95], target: [8, 4, 0], fov: 30 }} keyPos={[20, 40, 30]} kick={P.amber}>
      <group position={[16, 0, 0]} rotation={[0.15, -0.35, 0]}>
        <JewelCase>
          <Dimm s={1.15} p={[0, 1.2, 0]} rgb={1} phase={2} />
        </JewelCase>
      </group>
      <Glow p={[16, 4, 0]} s={44} color={P.amber} o={0.45} />
    </Stage>
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 45%, transparent 70%)" }} />
    <Brand />
    <div style={{ position: "absolute", left: 60, top: 140 }}>
      <Big size={230} color="#fff">RAM IS</Big>
      <Big size={230} color={P.amber}>THE NEW</Big>
      <Big size={260} color={P.amber}>GOLD</Big>
    </div>
    <Pill color={P.orange} style={{ right: 80, bottom: 90, transform: "rotate(-3deg)" }}>UNTIL 2030?</Pill>
  </AbsoluteFill>
);

/** C — AI vs gamers: endless data-centre hall swallowing one lonely gaming PC. */
export const Ug6ThumbC: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#050506" }}>
    <Stage cam={{ pos: [0, 9, 44], target: [0, 9, -60], fov: 50 }} fog={0.008} keyPos={[0, 40, 20]} kick={P.orange}>
      <Hall f={0} aisles={7} len={14} leds={1} strips={1} />
      <group position={[0, 0, 4]} scale={0.14} rotation={[0, -0.5, 0]}>
        <Tower power={1} spin={0.5} accent={P.orange} />
      </group>
      <Glow p={[0, 3, 4]} s={16} color={P.orange} o={0.55} />
    </Stage>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.75) 0%, transparent 40%, transparent 70%, rgba(0,0,0,0.8) 100%)" }} />
    <Brand />
    <div style={{ position: "absolute", left: 0, right: 0, top: 70, textAlign: "center" }}>
      <Big size={210} color="#fff">
        AI ATE YOUR <span style={{ ...Stroke(P.orange, 14) }}>GPU</span>
      </Big>
    </div>
    <Pill color={P.coral} style={{ left: "50%", bottom: 80, transform: "translateX(-50%) rotate(-2deg)" }}>PC GAMING IN 2030?</Pill>
  </AbsoluteFill>
);
