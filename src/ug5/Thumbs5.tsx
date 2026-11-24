/** UG-005 thumbnails (render as stills → 1280×720). Real phone footage + procedural 3D RTX card. */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, DISPLAY, INTER } from "../ug/theme";
import { Cam, Scene3D, type V3 } from "../ug3/Three3D";
import { RtxCard } from "./Three5";

const GOLD = "#ffc247";
const NV = "#76b900";
const PH = "#28d7ff";
const img = (n: string) => staticFile(`ug-005/img/${n}`);
const Stroke = (c: string, w = 10) => ({ WebkitTextStroke: `${w}px #000`, paintOrder: "stroke fill" as const, color: c });
const Brand = () => (
  <div style={{ position: "absolute", right: 50, top: 34, fontFamily: INTER, fontWeight: 600, fontSize: 30, letterSpacing: 10, color: "#fff", opacity: 0.9, borderBottom: `3px solid ${C.red}`, paddingBottom: 6 }}>UNKNOWN GAMER</div>
);
/** Hand-cam: real phone running RDR2 in a glowing frame. */
const HandShot: React.FC<{ x: number; y: number; w: number; rot?: number; glow?: string }> = ({ x, y, w, rot = -3, glow = PH }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: (w * 720) / 1536, transform: `rotate(${rot}deg)`, borderRadius: 30, overflow: "hidden", border: `8px solid ${glow}`, boxShadow: `0 0 90px ${glow}, 0 40px 80px rgba(0,0,0,0.8)` }}>
    <Img src={img("hand.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  </div>
);
const Card3D: React.FC<{ cam: { pos: V3; target: V3; fov: number }; heat?: number }> = ({ cam, heat = 0 }) => (
  <Scene3D rimA={NV} rimB="#ffffff">
    <Cam {...cam} />
    <RtxCard p={[0, 0, 0]} r={[0.25, -0.5, 0.1]} spin={0.4} heat={heat} accentK={1.6} plug={heat} />
  </Scene3D>
);
const Pill: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = GOLD, style }) => (
  <div style={{ position: "absolute", padding: "8px 30px", borderRadius: 18, background: "rgba(0,0,0,0.82)", border: `5px solid ${color}`, boxShadow: `0 0 34px ${color}`, fontFamily: DISPLAY, fontWeight: 700, fontSize: 70, color: "#fff", whiteSpace: "nowrap", ...style }}>{children}</div>
);
const Bg: React.FC<{ tint: string; blur?: number }> = ({ tint, blur = 6 }) => (
  <>
    <Img src={img("rdr.jpg")} style={{ position: "absolute", inset: -40, width: "calc(100% + 80px)", height: "calc(100% + 80px)", objectFit: "cover", filter: `blur(${blur}px) brightness(0.55) saturate(1.3)` }} />
    <AbsoluteFill style={{ background: tint }} />
  </>
);

/** A — curiosity: a PC game on a phone. */
export const Ug5ThumbA: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Bg tint="radial-gradient(circle at 30% 55%, rgba(40,215,255,0.25), rgba(0,0,0,0.55) 70%)" blur={3} />
    <HandShot x={40} y={300} w={1120} rot={-4} />
    <Brand />
    <div style={{ position: "absolute", right: 60, top: 120, textAlign: "right" }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 190, lineHeight: 0.9, ...Stroke("#fff", 12) }}>PC GAME</div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 150, lineHeight: 1, ...Stroke(GOLD, 12) }}>ON A</div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 190, lineHeight: 0.95, ...Stroke(PH, 12) }}>PHONE?!</div>
    </div>
    <Pill color={C.red} style={{ right: 70, bottom: 90, transform: "rotate(-3deg)" }}>
      ✕ NO CLOUD
    </Pill>
  </AbsoluteFill>
);

/** B — numbers: 10 W phone vs 575 W RTX. */
export const Ug5ThumbB: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 960, height: 1080, overflow: "hidden" }}>
      <Bg tint="linear-gradient(180deg, rgba(40,215,255,0.25), rgba(0,0,0,0.5))" />
    </div>
    <div style={{ position: "absolute", left: 960, top: 0, width: 960, height: 1080, overflow: "hidden", background: "radial-gradient(circle at 50% 55%, #3a1010, #000 75%)" }}>
      <div style={{ position: "absolute", left: -480, top: 0, width: 1920, height: 1080 }}>
        <Card3D cam={{ pos: [0, 16, 30], target: [0, 0, 0], fov: 34 }} heat={0.5} />
      </div>
    </div>
    <HandShot x={40} y={380} w={860} rot={-4} />
    <div style={{ position: "absolute", left: 952, top: 0, width: 16, height: 1080, background: "#fff", boxShadow: "0 0 40px #fff" }} />
    <div style={{ position: "absolute", left: 60, top: 60, fontFamily: DISPLAY, fontWeight: 700, fontSize: 250, lineHeight: 1, ...Stroke(PH, 14) }}>10W</div>
    <div style={{ position: "absolute", right: 60, top: 60, fontFamily: DISPLAY, fontWeight: 700, fontSize: 250, lineHeight: 1, ...Stroke(C.red, 14) }}>575W</div>
    <div style={{ position: "absolute", left: 0, width: 1920, top: 420, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 150, ...Stroke(GOLD, 12) }}>VS</div>
    <Pill color={NV} style={{ right: 60, bottom: 70 }}>
      RTX 5090
    </Pill>
  </AbsoluteFill>
);

/** C — price shock: $6,000 GPU vs a 4-year-old phone. */
export const Ug5ThumbC: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <AbsoluteFill style={{ background: "radial-gradient(circle at 70% 40%, rgba(118,185,0,0.35), #000 70%)" }} />
    <div style={{ position: "absolute", left: 560, top: -60, width: 1920, height: 1080 }}>
      <Card3D cam={{ pos: [0, 18, 34], target: [0, 0, 0], fov: 34 }} />
    </div>
    <HandShot x={30} y={470} w={960} rot={3} glow={GOLD} />
    <Brand />
    <div style={{ position: "absolute", left: 60, top: 70 }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 200, lineHeight: 0.9, ...Stroke(NV, 12) }}>$6,000 GPU</div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 120, lineHeight: 1.05, ...Stroke("#fff", 10) }}>
        vs <span style={{ color: GOLD }}>OLD PHONE</span>
      </div>
    </div>
    <Pill color={C.red} style={{ right: 70, bottom: 110, transform: "rotate(-4deg)", fontSize: 84 }}>
      WHO WINS?
    </Pill>
  </AbsoluteFill>
);
