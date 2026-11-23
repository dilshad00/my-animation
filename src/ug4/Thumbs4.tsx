/** UG-004 thumbnails — photoreal hero style (render as stills → 1280×720). */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, DISPLAY, INTER } from "../ug/theme";

const GOLD = "#ffc247";
const NVG = "#76b900";
const img = (n: string) => staticFile(`ug-004/${n}`);
const Stroke = (c: string, w = 10) => ({ WebkitTextStroke: `${w}px #000`, paintOrder: "stroke fill" as const, color: c });
const Full: React.FC<{ src: string; style?: React.CSSProperties }> = ({ src, style }) => (
  <Img src={img(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", ...style }} />
);
const Brand = () => (
  <div style={{ position: "absolute", right: 50, top: 34, fontFamily: INTER, fontWeight: 600, fontSize: 30, letterSpacing: 10, color: "#fff", opacity: 0.9, borderBottom: `3px solid ${C.red}`, paddingBottom: 6 }}>UNKNOWN GAMER</div>
);
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
const Pill: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = GOLD, style }) => (
  <div style={{ position: "absolute", padding: "10px 30px", borderRadius: 18, background: "rgba(0,0,0,0.78)", border: `4px solid ${color}`, boxShadow: `0 0 30px ${color}`, fontFamily: DISPLAY, fontWeight: 700, fontSize: 66, color: "#fff", ...style }}>{children}</div>
);

/** A: green vs red-gold duel, 32GB vs 64GB. */
export const Ug4ThumbA: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <RoughDefs />
    <Full src="img/duel.jpg" style={{ transform: "scale(1.05)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.55), transparent 50%)" }} />
    <Brand />
    <div style={{ position: "absolute", left: 60, top: 70, textAlign: "center" }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 210, lineHeight: 0.9, ...Stroke(NVG, 12) }}>32GB</div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, ...Stroke("#fff", 8) }}>RTX 5090</div>
    </div>
    <div style={{ position: "absolute", right: 50, top: 70, textAlign: "center" }}>
      <Brush color="rgba(230,40,40,0.95)" rot={-3}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 280, lineHeight: 1, ...Stroke(GOLD, 14) }}>64GB</div>
      </Brush>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 72, marginTop: 6, ...Stroke("#fff", 8) }}>CHINA</div>
    </div>
    <Pill style={{ left: "50%", bottom: 60, transform: "translateX(-50%)", fontSize: 90 }}>
      <span style={{ color: GOLD }}>2×</span> VRAM
    </Pill>
  </AbsoluteFill>
);

/** B: red-gold hero card, giant 64GB, 5090's 32GB crossed. */
export const Ug4ThumbB: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <RoughDefs />
    <Full src="img/hero.jpg" style={{ transform: "scale(1.12)", transformOrigin: "80% 60%" }} />
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 40%, transparent 62%)" }} />
    <Brand />
    <div style={{ position: "absolute", left: 70, top: 80 }}>
      <div style={{ position: "relative", display: "inline-block", fontFamily: DISPLAY, fontWeight: 700, fontSize: 150, lineHeight: 0.9, ...Stroke("#fff", 10) }}>
        RTX 5090: 32GB
        <div style={{ position: "absolute", left: -12, right: -12, top: "46%", height: 22, background: C.red, transform: "rotate(-4deg)", boxShadow: "0 0 30px #000" }} />
      </div>
      <div style={{ marginTop: 20 }}>
        <Brush color="rgba(230,40,40,0.95)">
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 340, lineHeight: 1, ...Stroke(GOLD, 14) }}>64GB</div>
        </Brush>
      </div>
    </div>
    <Pill color={C.red} style={{ left: 80, bottom: 70 }}>
      MADE IN <span style={{ color: GOLD }}>CHINA</span>
    </Pill>
  </AbsoluteFill>
);

/** C: real RTX 5090 (NVIDIA press image) | red-gold hero split. */
export const Ug4ThumbC: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <RoughDefs />
    <Full src="ref/nv_5090.jpg" style={{ transform: "scale(1.15) translateX(-12%)" }} />
    <Full src="img/hero.jpg" style={{ clipPath: "polygon(58% 0, 100% 0, 100% 100%, 46% 100%)", transform: "scale(1.1)", transformOrigin: "85% 55%" }} />
    <div style={{ position: "absolute", left: "52%", top: -40, bottom: -40, width: 10, background: "#fff", transform: "rotate(7deg)", boxShadow: "0 0 40px #fff, 0 0 90px #fff" }} />
    <Brand />
    <div style={{ position: "absolute", left: 60, bottom: 70, textAlign: "left" }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 70, ...Stroke("#fff", 8) }}>$2,000</div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 200, lineHeight: 0.9, ...Stroke(NVG, 12) }}>32GB</div>
    </div>
    <div style={{ position: "absolute", right: 60, bottom: 60 }}>
      <Brush color="rgba(230,40,40,0.95)" rot={-3}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 260, lineHeight: 1, ...Stroke(GOLD, 14) }}>64GB?!</div>
      </Brush>
    </div>
    <Pill color={C.red} style={{ left: "50%", top: 120, transform: "translateX(-50%)", fontSize: 76 }}>
      CHINA <span style={{ color: GOLD }}>vs</span> NVIDIA
    </Pill>
  </AbsoluteFill>
);
