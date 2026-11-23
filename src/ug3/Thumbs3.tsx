/** UG-003 thumbnails — photoreal hero style (render as stills, scale 0.6667 → 1280×720). */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, DISPLAY, INTER } from "../ug/theme";
import { Padlock } from "./Gfx3";

const img = (n: string) => staticFile(`ug-003/img/${n}`);
const Stroke = (c: string, w = 10) => ({ WebkitTextStroke: `${w}px #000`, paintOrder: "stroke fill" as const, color: c });
const Full: React.FC<{ src: string; style?: React.CSSProperties }> = ({ src, style }) => (
  <Img src={img(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", ...style }} />
);
const Brand = () => (
  <div style={{ position: "absolute", right: 50, top: 34, fontFamily: INTER, fontWeight: 600, fontSize: 30, letterSpacing: 10, color: "#fff", opacity: 0.9, borderBottom: `3px solid ${C.red}`, paddingBottom: 6 }}>UNKNOWN GAMER</div>
);
const Shade = ({ k = 0.85 }: { k?: number }) => (
  <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(0,0,0,${k}) 0%, rgba(0,0,0,${k * 0.55}) 38%, transparent 62%)` }} />
);
/** red brush swipe behind text */
const Brush: React.FC<{ color: string; children: React.ReactNode; rot?: number }> = ({ color, children, rot = -2 }) => (
  <div style={{ position: "relative", display: "inline-block", padding: "0 34px", transform: `rotate(${rot}deg)` }}>
    <div style={{ position: "absolute", inset: "8% -2%", background: color, filter: "url(#rough)", borderRadius: 10, boxShadow: `0 0 60px ${color}` }} />
    <div style={{ position: "relative" }}>{children}</div>
  </div>
);
const RoughDefs = () => (
  <svg width="0" height="0" style={{ position: "absolute" }}>
    <filter id="rough">
      <feTurbulence type="fractalNoise" baseFrequency="0.035 0.6" numOctaves="3" seed="4" />
      <feDisplacementMap in="SourceGraphic" scale="38" />
    </filter>
  </svg>
);

/** A: green unlocked hero, 8GB crossed → 80GB. */
export const Ug3ThumbA: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <RoughDefs />
    <Full src="hero_green.jpg" style={{ transform: "scale(1.12)", transformOrigin: "75% 60%" }} />
    <Shade k={0.8} />
    <Brand />
    <div style={{ position: "absolute", left: 70, top: 90 }}>
      <div style={{ position: "relative", display: "inline-block", fontFamily: DISPLAY, fontWeight: 700, fontSize: 230, lineHeight: 0.9, ...Stroke("#fff", 12) }}>
        8GB
        <div style={{ position: "absolute", left: -16, right: -16, top: "46%", height: 26, background: C.red, transform: "rotate(-9deg)", boxShadow: "0 0 30px #000" }} />
      </div>
      <div style={{ marginTop: 10 }}>
        <Brush color="rgba(20,170,100,0.95)">
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 330, lineHeight: 1, ...Stroke("#fff", 14) }}>80GB</div>
        </Brush>
      </div>
    </div>
    <div style={{ position: "absolute", left: 80, bottom: 70, padding: "12px 34px", borderRadius: 18, background: "rgba(0,0,0,0.75)", border: `4px solid ${C.amber}`, boxShadow: `0 0 30px ${C.amber}`, fontFamily: DISPLAY, fontWeight: 700, fontSize: 70, color: "#fff" }}>
      SAME <span style={{ color: C.amber }}>$8</span> HACK
    </div>
  </AbsoluteFill>
);

/** B: same card split red | green. */
export const Ug3ThumbB: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <RoughDefs />
    <Full src="hero_red.jpg" />
    <Full src="hero_green.jpg" style={{ clipPath: "polygon(64% 0, 100% 0, 100% 100%, 50% 100%)" }} />
    <div style={{ position: "absolute", left: "57%", top: -40, bottom: -40, width: 10, background: "#fff", transform: "rotate(8deg)", boxShadow: "0 0 40px #fff, 0 0 90px #fff" }} />
    <Shade k={0.6} />
    <Brand />
    <div style={{ position: "absolute", left: 60, top: 80, fontFamily: DISPLAY, fontWeight: 700, fontSize: 250, lineHeight: 0.9, ...Stroke("#ff3d52", 12) }}>8GB</div>
    <div style={{ position: "absolute", left: 470, top: 130, fontFamily: DISPLAY, fontWeight: 700, fontSize: 150, ...Stroke(C.amber, 10) }}>→</div>
    <div style={{ position: "absolute", right: 70, bottom: 60 }}>
      <Brush color="rgba(20,170,100,0.95)" rot={-3}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 280, lineHeight: 1, ...Stroke("#fff", 14) }}>80GB</div>
      </Brush>
    </div>
    <div style={{ position: "absolute", left: 70, bottom: 80, padding: "10px 30px", borderRadius: 18, background: "rgba(0,0,0,0.75)", border: `4px solid ${C.amber}`, fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: "#fff" }}>
      SAME <span style={{ color: C.amber }}>CARD</span>
    </div>
  </AbsoluteFill>
);

/** C: glowing chip + "NVIDIA LOCKED THIS" + open padlock. */
export const Ug3ThumbC: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <RoughDefs />
    <Full src="chip.jpg" style={{ transform: "scale(1.1)", transformOrigin: "60% 60%" }} />
    <Shade k={0.85} />
    <Brand />
    <div style={{ position: "absolute", left: 60, top: 70, fontFamily: DISPLAY, fontWeight: 700, fontSize: 170, lineHeight: 0.95, ...Stroke("#fff", 12) }}>
      NVIDIA
      <br />
      <Brush color="rgba(220,30,50,0.95)">
        <span>LOCKED</span>
      </Brush>{" "}
      THIS
    </div>
    <div style={{ position: "absolute", right: 120, top: 150, filter: `drop-shadow(0 0 40px ${C.green})` }}>
      <Padlock size={320} color={C.green} open={1} />
    </div>
    <div style={{ position: "absolute", left: 70, bottom: 70, padding: "10px 30px", borderRadius: 18, background: "rgba(0,0,0,0.75)", border: `4px solid ${C.green}`, boxShadow: `0 0 30px ${C.green}`, fontFamily: DISPLAY, fontWeight: 700, fontSize: 80, color: "#fff" }}>
      8GB → <span style={{ color: C.green }}>80GB</span>
    </div>
  </AbsoluteFill>
);
