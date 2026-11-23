/** UG-003 thumbnails v2 — price angle ("This $2,500 GPU Beat a $20,000 NVIDIA A100"), bright warm style like the UG-001 winner. */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { DISPLAY, INTER } from "../ug/theme";

const YEL = "#ffd21f";
const RED = "#ff2a3d";
const GRN = "#21e07a";
const Stroke = (c: string, w = 10) => ({ WebkitTextStroke: `${w}px #000`, paintOrder: "stroke fill" as const, color: c });
const Full: React.FC<{ src: string; style?: React.CSSProperties }> = ({ src, style }) => (
  <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", ...style }} />
);
const Brand = () => (
  <div style={{ position: "absolute", right: 50, top: 34, fontFamily: INTER, fontWeight: 600, fontSize: 30, letterSpacing: 10, color: "#fff", opacity: 0.9, borderBottom: `3px solid ${RED}`, paddingBottom: 6 }}>UNKNOWN GAMER</div>
);
const RoughDefs = () => (
  <svg width="0" height="0" style={{ position: "absolute" }}>
    <filter id="rough2">
      <feTurbulence type="fractalNoise" baseFrequency="0.035 0.6" numOctaves="3" seed="7" />
      <feDisplacementMap in="SourceGraphic" scale="38" />
    </filter>
  </svg>
);
const Brush: React.FC<{ color: string; children: React.ReactNode; rot?: number }> = ({ color, children, rot = -2 }) => (
  <div style={{ position: "relative", display: "inline-block", padding: "0 30px", transform: `rotate(${rot}deg)` }}>
    <div style={{ position: "absolute", inset: "6% -2%", background: color, filter: "url(#rough2)", borderRadius: 10, boxShadow: `0 0 50px ${color}` }} />
    <div style={{ position: "relative" }}>{children}</div>
  </div>
);
const Tag: React.FC<{ color: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ color, children, style }) => (
  <div style={{ position: "absolute", padding: "8px 26px", borderRadius: 16, background: "rgba(0,0,0,0.82)", border: `4px solid ${color}`, boxShadow: `0 0 26px ${color}`, fontFamily: DISPLAY, fontWeight: 700, fontSize: 58, color: "#fff", whiteSpace: "nowrap", ...style }}>{children}</div>
);
const Hot = () => <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 80% at 30% 40%, rgba(255,40,30,0.55), transparent 70%)", mixBlendMode: "screen" }} />;
const OLD = "ug-004/img/oldcard.jpg";
const A100 = "ug-003/img/hero_green.jpg";
const SMOKE = "ug-004/img/plate.jpg";

/** A: cheap dusty card WINS vs $20,000 A100 (split, crown/✓ vs ✗). */
export const Ug3V2A: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <RoughDefs />
    <Full src={OLD} style={{ transform: "scale(1.25)", transformOrigin: "30% 55%", filter: "saturate(1.3) brightness(1.15)" }} />
    <Full src={A100} style={{ clipPath: "polygon(60% 0, 100% 0, 100% 100%, 50% 100%)", transform: "scale(1.15)", transformOrigin: "80% 55%", filter: "grayscale(0.6) brightness(0.7)" }} />
    <div style={{ position: "absolute", left: "55%", top: -40, bottom: -40, width: 12, background: YEL, transform: "rotate(6deg)", boxShadow: `0 0 40px ${YEL}, 0 0 90px ${YEL}` }} />
    <Brand />
    <div style={{ position: "absolute", left: 50, top: 70 }}>
      <Brush color={YEL} rot={-3}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 230, lineHeight: 1, ...Stroke("#fff", 14) }}>$2,500</div>
      </Brush>
    </div>
    <Tag color={GRN} style={{ left: 70, bottom: 70, fontSize: 80 }}>
      WINNER <span style={{ color: GRN }}>✓</span>
    </Tag>
    <div style={{ position: "absolute", right: 60, top: 140, textAlign: "right" }}>
      <div style={{ position: "relative", display: "inline-block", fontFamily: DISPLAY, fontWeight: 700, fontSize: 170, lineHeight: 0.9, ...Stroke("#fff", 12) }}>
        $20,000
        <div style={{ position: "absolute", left: -14, right: -14, top: "46%", height: 26, background: RED, transform: "rotate(-8deg)", boxShadow: "0 0 30px #000" }} />
      </div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, marginTop: 8, ...Stroke(RED, 9) }}>NVIDIA A100</div>
    </div>
  </AbsoluteFill>
);

/** B: hot red smoke, "$2,500 GPU > $20,000 GPU" like the UG-001 winner layout. */
export const Ug3V2B: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <RoughDefs />
    <Full src={SMOKE} style={{ filter: "saturate(1.5) brightness(1.3)" }} />
    <Hot />
    <Img src={staticFile(OLD)} style={{ position: "absolute", right: -60, bottom: -40, width: 1150, height: 650, objectFit: "cover", borderRadius: 30, transform: "rotate(-4deg)", boxShadow: "0 40px 100px #000", border: `6px solid ${YEL}`, filter: "saturate(1.3) brightness(1.15)" }} />
    <Brand />
    <div style={{ position: "absolute", left: 50, top: 60 }}>
      <Brush color={RED} rot={-3}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 210, lineHeight: 1, ...Stroke(YEL, 14) }}>$2,500</div>
      </Brush>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 120, lineHeight: 1.1, marginTop: 14, ...Stroke("#fff", 10) }}>BEAT A</div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 160, lineHeight: 0.95, ...Stroke(GRN, 12) }}>$20,000</div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 90, ...Stroke("#fff", 9) }}>NVIDIA GPU</div>
    </div>
  </AbsoluteFill>
);

/** C: the hack — "2 WIRES + $8" unlocked a $20,000 GPU. */
export const Ug3V2C: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <RoughDefs />
    <Full src={OLD} style={{ transform: "scale(1.15)", transformOrigin: "60% 55%", filter: "saturate(1.3) brightness(1.1)" }} />
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 45%, transparent 65%)" }} />
    <Hot />
    {/* two glowing wires across the card */}
    <svg width="1920" height="1080" style={{ position: "absolute", inset: 0 }}>
      {[
        ["M 1900 120 C 1500 300, 1450 500, 1180 560", YEL],
        ["M 1900 220 C 1600 420, 1500 640, 1240 640", RED],
      ].map(([d, c], i) => (
        <g key={i}>
          <path d={d} stroke={c} strokeWidth={34} fill="none" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 18px ${c})` }} />
          <path d={d} stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.6} />
        </g>
      ))}
      <circle cx={1180} cy={560} r={22} fill="#fff" style={{ filter: `drop-shadow(0 0 30px ${YEL})` }} />
      <circle cx={1240} cy={640} r={22} fill="#fff" style={{ filter: `drop-shadow(0 0 30px ${RED})` }} />
    </svg>
    <Brand />
    <div style={{ position: "absolute", left: 60, top: 70 }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 190, lineHeight: 0.95, ...Stroke("#fff", 12) }}>2 WIRES</div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 150, lineHeight: 1, ...Stroke(YEL, 11) }}>+ $8 CHIP</div>
      <div style={{ marginTop: 20 }}>
        <Brush color={GRN} rot={-3}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 150, lineHeight: 1, ...Stroke("#fff", 12) }}>= $20,000</div>
        </Brush>
      </div>
    </div>
  </AbsoluteFill>
);
