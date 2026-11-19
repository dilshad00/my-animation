/**
 * UG-001 thumbnails (designed at 1920×1080, rendered as stills at 1280×720 via --scale).
 * Every number is from research.md: F01 RAM $72→$474 (+558%), F30 RTX 5090 EU −33.6%,
 * RTX 5060 cheapest new listing incl. tax: USA ≈$450, Europe ≈$533, India ≈$522.
 */
import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { A } from "./blocks";
import { EU, WorldMap } from "./charts";
import { RamStick3D } from "./RamStick3D";
import { C, DISPLAY, INTER, MONO } from "./theme";

const outline = (px: number, col = "#000") =>
  `${px}px ${px}px 0 ${col}, -${px}px ${px}px 0 ${col}, ${px}px -${px}px 0 ${col}, -${px}px -${px}px 0 ${col}, 0 ${px * 2}px ${px * 4}px rgba(0,0,0,0.8)`;

const Big: React.FC<{ children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties }> = ({ children, size, color = C.ink, style }) => (
  <div
    style={{
      fontFamily: DISPLAY,
      fontWeight: 700,
      fontSize: size,
      lineHeight: 0.92,
      color,
      letterSpacing: 1,
      textShadow: outline(Math.round(size / 30)),
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

const Fire: React.FC<{ x: number; y: number; w: number; h: number; id: string }> = ({ x, y, w, h, id }) => (
  <svg width={w} height={h} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
    <defs>
      <filter id={`fl${id}`} x="-20%" y="-30%" width="140%" height="160%">
        <feTurbulence type="fractalNoise" baseFrequency="0.012 0.035" numOctaves={3} seed={7} />
        <feDisplacementMap in="SourceGraphic" scale={110} />
        <feGaussianBlur stdDeviation={6} />
      </filter>
      <radialGradient id={`fg${id}`} cx="50%" cy="100%" r="80%">
        <stop offset="0%" stopColor="#fff6c8" />
        <stop offset="25%" stopColor="#ffc23a" />
        <stop offset="55%" stopColor="#ff5a1f" />
        <stop offset="85%" stopColor="#c0101e" stopOpacity={0.6} />
        <stop offset="100%" stopColor="#600" stopOpacity={0} />
      </radialGradient>
    </defs>
    <g filter={`url(#fl${id})`}>
      {[0.04, 0.24, 0.44, 0.64].map((p, i) => (
        <path
          key={i}
          d={`M ${w * p} ${h} C ${w * (p - 0.06)} ${h * 0.55}, ${w * (p + 0.1)} ${h * 0.35}, ${w * (p + 0.12)} ${h * (0.02 + (i % 2) * 0.14)} C ${w * (p + 0.2)} ${h * 0.4}, ${w * (p + 0.32)} ${h * 0.6}, ${w * (p + 0.3)} ${h} Z`}
          fill={`url(#fg${id})`}
        />
      ))}
    </g>
  </svg>
);

const Brand: React.FC<{ x?: number; y?: number }> = ({ x = 48, y = 40 }) => (
  <div style={{ position: "absolute", left: x, top: y, fontFamily: MONO, fontWeight: 800, fontSize: 30, letterSpacing: 6, color: C.amber, textShadow: outline(2) }}>
    UNKNOWN GAMER
  </div>
);

const Bg: React.FC<{ left: string; right: string }> = ({ left, right }) => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 22% 60%, ${left} 0%, transparent 55%), radial-gradient(circle at 80% 55%, ${right} 0%, transparent 55%), #07080b` }} />
);

/** A — "FINALLY CHEAPER?": burning RAM +558% vs RTX 5090 −34%? */
export const ThumbA: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <Bg left="rgba(255,50,40,0.55)" right="rgba(40,242,150,0.32)" />
    <div style={{ position: "absolute", left: 960, top: -100, width: 14, height: 1400, background: "#fff", transform: "rotate(12deg)", boxShadow: "0 0 40px #fff" }} />
    <Fire x={-40} y={360} w={1000} h={780} id="a" />
    <div style={{ position: "absolute", left: 470, top: 650, transform: "translate(-50%,-50%) rotate(-14deg)", perspective: 1600 }}>
      <RamStick3D rotY={-22} rotX={14} scale={0.78} glow={1} hue={350} />
    </div>
    <Img
      src={A("img/gpu5090_cutout.webp")}
      style={{ position: "absolute", left: 1010, top: 330, width: 900, transform: "rotate(-6deg)", filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.9)) saturate(1.1)" }}
    />
    <Big size={250} color={C.red} style={{ position: "absolute", left: 60, top: 760 }}>
      +558%
    </Big>
    <div style={{ position: "absolute", left: 1170, top: 790, padding: "4px 30px", background: C.green, borderRadius: 18, transform: "rotate(-4deg)", boxShadow: "0 16px 40px rgba(0,0,0,0.7)", border: "6px solid #000" }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 190, lineHeight: 1, color: "#04140b" }}>−34%?</div>
    </div>
    <Big size={170} style={{ position: "absolute", left: 0, width: 1920, top: 60, textAlign: "center" }}>
      FINALLY <span style={{ color: "#ffd23a" }}>CHEAPER?</span>
    </Big>
  </AbsoluteFill>
);

/** B — "$72 → $474": the RAM kit price jump. */
export const ThumbB: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <Bg left="rgba(255,40,40,0.5)" right="rgba(255,90,20,0.35)" />
    <Fire x={140} y={520} w={1640} h={640} id="b" />
    <div style={{ position: "absolute", left: 960, top: 800, transform: "translate(-50%,-50%) rotate(-6deg)", perspective: 1600 }}>
      <RamStick3D rotY={-18} rotX={16} scale={1.25} glow={1} hue={350} />
    </div>
    <div style={{ position: "absolute", left: 90, top: 150 }}>
      <Big size={250} color="#c8ced6">
        $72
      </Big>
      <div style={{ position: "absolute", left: -20, right: -20, top: 110, height: 26, background: C.red, transform: "rotate(-10deg)", boxShadow: "0 0 0 6px #000" }} />
    </div>
    <Big size={230} color="#ffd23a" style={{ position: "absolute", left: 520, top: 150 }}>
      →
    </Big>
    <Big size={380} color={C.red} style={{ position: "absolute", left: 830, top: 60 }}>
      $474
    </Big>
    <div style={{ position: "absolute", left: 100, top: 470, padding: "8px 24px", background: "#000", border: `4px solid ${C.amber}`, borderRadius: 10, fontFamily: INTER, fontWeight: 800, fontSize: 52, color: C.ink }}>
      SAME 32GB RAM KIT
    </div>
    <Brand x={1450} y={34} />
  </AbsoluteFill>
);

/** C — "WHERE IS IT CHEAPEST?": RTX 5060 price tags on the map. */
const Tag: React.FC<{ x: number; y: number; place: string; price: string; color: string; rot: number }> = ({ x, y, place, price, color, rot }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg)`, textAlign: "center" }}>
    <div style={{ background: color, borderRadius: 18, padding: "8px 28px 12px", boxShadow: "0 18px 40px rgba(0,0,0,0.8)", border: "5px solid #000" }}>
      <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 46, color: "#000", letterSpacing: 2 }}>{place}</div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 150, lineHeight: 0.95, color: "#000" }}>{price}</div>
    </div>
  </div>
);

export const ThumbC: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden", background: "#07080b" }}>
    <div style={{ position: "absolute", inset: 0, transform: "scale(1.3) translateY(150px)" }}>
      <WorldMap f={999} at={0} pins={[]} highlight={[...EU, "India", "United States of America"]} />
    </div>
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 60%, transparent 30%, rgba(0,0,0,0.7) 100%)" }} />
    <Tag x={370} y={470} place="USA" price="$450" color={C.green} rot={-5} />
    <Tag x={1040} y={420} place="EUROPE" price="$533" color={C.red} rot={4} />
    <Tag x={1450} y={600} place="INDIA" price="$522" color={C.amber} rot={-3} />
    <Big size={150} style={{ position: "absolute", left: 0, width: 1920, top: 40, textAlign: "center" }}>
      WHERE IS IT <span style={{ color: "#ffd23a" }}>CHEAPEST?</span>
    </Big>
    <div style={{ position: "absolute", left: 60, bottom: 50, fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.ink, textShadow: outline(2) }}>RTX 5060 · same card</div>
  </AbsoluteFill>
);
