/**
 * SH-PENCIL beats — "The pencil that overclocked a CPU". Every beat explains its narration line;
 * a new focal point lands every ~2 s. Absolute frames on the narration (see data.ts cues).
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { E, HEAD, lin, MetalType, MONO, sp, Stamp, Tag } from "../../ug6/Look6";
import { Box, Glow, hash, P, Particles, Stage, useGlow, useMats } from "../../ug6/Three6";
import { Mobo } from "../../ug6/World6";
import { At, Beat, Bg, Chip, cueFn, Impact, Mid, path, pathV, shake, SW } from "../engine/Engine";
import { bridgePos, Macro, ModernCpu, OldCpu, Pencil, RetroPc } from "./Assets";
import { CUE, VO_FRAMES } from "./data";

export const c = cueFn(CUE);
type F = { f: number };
const AMB = P.amber;
const OR = P.orange;

/** Reflective studio floor. */
const Floor: React.FC<{ y?: number }> = ({ y = 0 }) => {
  const M = useMats();
  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} material={M.floor}>
      <circleGeometry args={[160, 64]} />
    </mesh>
  );
};
/** Dust motes in the key light (depth / volumetric feel). */
const Motes: React.FC<{ f: number; n?: number; spread?: number; y?: number }> = ({ f, n = 70, spread = 40, y = 10 }) => (
  <Particles
    n={n}
    color="#ffd7a8"
    k={0.9}
    fn={(i) => ({ p: [(hash(i) - 0.5) * spread, y + (hash(i * 3) - 0.5) * spread * 0.8 + Math.sin(f * 0.02 + i) * 0.6, (hash(i * 7) - 0.5) * spread * 0.6], s: 0.05 + 0.06 * hash(i * 11) })}
  />
);
/** DOM sparks burst. */
const Sparks: React.FC<{ f: number; at: number; x: number; y: number; n?: number; color?: string; spread?: number }> = ({ f, at, x, y, n = 34, color = AMB, spread = 420 }) => {
  if (f < at || f > at + 28) return null;
  const t = (f - at) / 28;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const a = hash(i) * Math.PI * 2;
        const d = spread * (0.3 + 0.7 * hash(i * 3)) * E.out(f, at, at + 28);
        return <div key={i} style={{ position: "absolute", left: x + Math.cos(a) * d, top: y + Math.sin(a) * d + t * t * 160, width: 9, height: 9, borderRadius: 9, background: color, opacity: 1 - t, boxShadow: `0 0 14px ${color}` }} />;
      })}
    </>
  );
};
/** Callout: ring + leader line + label (DOM, screen-space). */
const Callout: React.FC<{ f: number; at: number; x: number; y: number; r?: number; lx: number; ly: number; title: string; sub?: string; color?: string }> = ({ f, at, x, y, r = 70, lx, ly, title, sub, color = OR }) => {
  const k = E.out(f, at, at + 10);
  const l = E.out(f, at + 4, at + 14);
  if (k <= 0) return null;
  return (
    <>
      <svg width={SW} height={1920} style={{ position: "absolute", inset: 0 }}>
        <circle cx={x} cy={y} r={r * (1.4 - 0.4 * k)} fill="none" stroke={color} strokeWidth={5} opacity={k} style={{ filter: `drop-shadow(0 0 12px ${color})` }} />
        <line x1={x} y1={y - r} x2={x + (lx - x) * l} y2={y - r + (ly - (y - r)) * l} stroke={color} strokeWidth={4} opacity={k} />
      </svg>
      <At x={lx - 20} y={ly - 80}>
        <div style={{ opacity: l, transform: `translateY(${(1 - l) * 16}px)` }}>
          <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 64, color: P.white, textShadow: "0 4px 20px #000" }}>{title}</div>
          {sub ? <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color, letterSpacing: 3 }}>{sub}</div> : null}
        </div>
      </At>
    </>
  );
};

/* ===================================================================== S1 hook: pencil in the dark → tip */
const B1: React.FC<F> = ({ f }) => (
  <Beat f={f} a={0} b={c("pencil")} tin="cut">
    {(lf, d) => (
      <>
        <Bg f={lf} kind="void" />
        <Stage cam={{ pos: pathV(lf, [[0, [0, 12, 46]], [d, [3, 4, 22]]]), target: [0, path(lf, [[0, 9], [d, 3]]), 0], fov: 38 }} light={0.4 + 0.8 * E.out(lf, 0, 8)} rim={OR}>
          <Pencil p={[0, 0, 0]} r={[0.15, lf * 0.04, -0.35]} spark={lin(lf, 6, d)} core={0.25} />
          <Glow p={[0, 0, 0]} s={8} color={OR} o={0.25 + 0.25 * Math.sin(lf * 0.4)} />
          <Motes f={lf} spread={30} />
        </Stage>
        <Mid y={290}>
          <Impact f={lf} at={2} text="[FASTER]" size={170} />
        </Mid>
      </>
    )}
  </Beat>
);
/* the spark lands on a processor */
const B1b: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("pencil")} b={c("ridic")} tin="flash">
    {(lf, d) => {
      const [sx, sy] = shake(lf, 3, 0.4);
      return (
        <>
          <Bg f={lf} warm={0.3} />
          <Stage cam={{ pos: pathV(lf, [[0, [6 + sx, 20 + sy, 18]], [d, [2, 15, 14]]]), target: [-1.5, 0, -1.5], fov: 40 }} light={1} rim={OR}>
            <OldCpu r={[0, 0.5, 0]} glow={E.out(lf, 2, 10) * (1 - lin(lf, 14, 30))} cut={0} fill={1} />
            <Pencil p={[-2.6, 1.2 + 4 * (1 - E.out(lf, 0, 14)), -2.6]} r={[0.5, 0, 0.45]} s={0.7} />
            <Glow p={[-2.6, 0.4, -2.6]} s={6} color={AMB} o={1 - lin(lf, 4, 24)} />
          </Stage>
          <Sparks f={lf} at={3} x={560} y={760} />
          <Mid y={290}>
            <Impact f={lf} at={0} text={"FASTER WITH\nA [PENCIL?]"} size={130} />
          </Mid>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== "Sounds ridiculous, right?" */
const B2: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("ridic")} b={c("back")} tin="glitch">
    {(lf) => (
      <>
        <Bg f={lf} kind="void" />
        <Stage cam={{ pos: [0, 8, 44], target: [0, 9, 0], fov: 40 }} light={0.9}>
          <Floor />
          <Pencil p={[0, 0.2, 0]} r={[0, lf * 0.12, Math.sin(lf * 0.35) * 0.25]} s={0.9} />
        </Stage>
        <Mid y={300}>
          <Impact f={lf} at={1} text="[RIDICULOUS?]" size={150} accent={P.coral} />
        </Mid>
        <At x={640} y={980}>
          <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 220, color: OR, transform: `rotate(${12 + Math.sin(lf * 0.3) * 6}deg) scale(${sp(lf, 6, 9, 260)})`, textShadow: `0 0 40px ${OR}` }}>?!</div>
        </At>
      </>
    )}
  </Beat>
);

/* ===================================================================== early 2000s: retro PC */
const B3: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("back")} b={c("real")} tin="iris">
    {(lf, d) => (
      <>
        <Bg f={lf} warm={0.22} hue="#ffb070" />
        <Stage cam={{ pos: pathV(lf, [[0, [-6, 22, 66]], [d, [6, 16, 52]]]), target: [-4, 9, 0], fov: 40 }} light={1} keyPos={[-10, 30, 30]}>
          <RetroPc power={E.out(lf, 4, 14)} mhz={600} />
          <Motes f={lf} spread={60} y={12} />
        </Stage>
        <Mid y={300}>
          <MetalType f={lf} at={2} size={210} sweepAt={8} tint="#ffd2a6">
            2000s
          </MetalType>
        </Mid>
        <Mid y={530}>
          <Chip f={lf} at={8}>
            EARLY 2000s
          </Chip>
        </Mid>
      </>
    )}
  </Beat>
);
const B4: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("real")} b={c("some")} tin="whip">
    {(lf, d) => (
      <>
        <Bg f={lf} warm={0.18} />
        <Stage cam={{ pos: pathV(lf, [[0, [26, 14, 30]], [d, [14, 12, 24]]]), target: [2, 9, -2], fov: 38 }} light={0.9}>
          <RetroPc power={1} mhz={600} />
        </Stage>
        <Mid y={300}>
          <Impact f={lf} at={2} text="A [REAL] TRICK" size={130} />
        </Mid>
        <At x={90} y={1220}>
          <Tag f={lf} at={c("enth") - c("real")} size={30}>
            USED BY PC ENTHUSIASTS
          </Tag>
        </At>
      </>
    )}
  </Beat>
);

/* ===================================================================== Athlon / Duron era CPU */
const B5: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("some")} b={c("tiny")} tin="zoom">
    {(lf) => (
      <>
        <Bg f={lf} warm={0.3} />
        <Stage cam={{ pos: [Math.sin(0.4 + lf * 0.02) * 26, 15, Math.cos(0.4 + lf * 0.02) * 26], target: [0, 0, 0], fov: 38 }} light={1.1} rim={OR}>
          <OldCpu r={[0.25, 0, 0.15]} cut={1} />
          <Glow p={[0, -2, 0]} s={30} color={OR} o={0.2} />
        </Stage>
        <Mid y={300}>
          <Impact f={lf} at={2} text={"ATHLON &\n[DURON] ERA"} size={120} />
        </Mid>
        <At x={90} y={1230}>
          <Tag f={lf} at={10} size={26}>
            ILLUSTRATION · GENERIC CPU · NO LOGOS
          </Tag>
        </At>
      </>
    )}
  </Beat>
);

/* ===================================================================== macro: tiny electrical connections → L1 bridges */
const B6: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("tiny")} b={c("cut")} tin="zoom">
    {(lf, d) => {
      const lb = c("bridges") - c("tiny");
      const bp = bridgePos(1.5);
      return (
        <>
          <Bg f={lf} warm={0.25} />
          <Stage cam={{ pos: pathV(lf, [[0, [bp[0] + 5, 9, bp[2] + 7]], [lb, [bp[0] + 1.2, 3.2, bp[2] + 2.6]], [d, [bp[0] + 0.6, 2.4, bp[2] + 2.2]]]), target: [bp[0], 0.2, bp[2]], fov: 38 }} light={1.1} rim={OR}>
            <OldCpu cut={0} glow={0.15 * Math.max(0, Math.sin(lf * 0.3))} />
          </Stage>
          <Mid y={300}>
            <Chip f={lf} at={2}>
              TINY ELECTRICAL CONNECTIONS
            </Chip>
          </Mid>
          <Callout f={lf} at={lb} x={540} y={900} r={240} lx={120} ly={500} title="L1 BRIDGES" sub="ON THE CPU SURFACE" />
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== AMD cut them (laser) → multiplier locked */
const B7: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("cut")} b={c("crazy")} tin="wipe">
    {(lf, d) => {
      const lk = c("lock") - c("cut");
      const cut = E.io(lf, 6, lk);
      const bp = bridgePos(1.5);
      const lx = bp[0] - 0.63 + 1.26 * cut;
      const lock = E.back(lf, lk + 6, lk + 18);
      return (
        <>
          <Bg f={lf} kind="lab" />
          <Stage cam={{ pos: pathV(lf, [[0, [bp[0] - 3, 6, bp[2] + 5]], [d, [bp[0] - 1, 4, bp[2] + 3.6]]]), target: [bp[0], 0.2, bp[2]], fov: 38 }} light={0.8} rim="#ff4a3a">
            <OldCpu cut={cut} />
            {lf > 4 && lf < lk + 4 ? (
              <>
                <Box p={[lx, 3, bp[2]]} s={[0.03, 6, 0.03]} m={useGlow("#ff3b2f", 4)} />
                <Glow p={[lx, 0.3, bp[2]]} s={1.6} color="#ff6a3a" o={1} />
              </>
            ) : null}
          </Stage>
          <Mid y={300}>
            <Impact f={lf} at={2} text="[CUT] AT THE FACTORY" size={104} accent={P.coral} />
          </Mid>
          {lf >= lk ? (
            <Mid y={1080}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 26, padding: "26px 40px", borderRadius: 28, background: "rgba(12,13,16,0.86)", border: `3px solid ${P.coral}`, transform: `scale(${0.6 + 0.4 * lock})`, opacity: lock }}>
                <Padlock open={0} color={P.coral} />
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, color: "rgba(244,242,238,0.7)", letterSpacing: 4 }}>CLOCK MULTIPLIER</div>
                  <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 84, color: P.coral, lineHeight: 1 }}>LOCKED</div>
                </div>
              </div>
            </Mid>
          ) : null}
        </>
      );
    }}
  </Beat>
);

/** SVG padlock; open 0..1 lifts the shackle. */
const Padlock: React.FC<{ open: number; color: string; size?: number }> = ({ open, color, size = 110 }) => (
  <svg width={size} height={size * 1.2} viewBox="0 0 100 120">
    <path d={`M 28 ${52 - open * 18} V ${34 - open * 18} a 22 22 0 0 1 44 0 V ${open > 0.5 ? 20 : 52 - open * 18}`} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" transform={`rotate(${open * -20} 72 40)`} />
    <rect x={14} y={50} width={72} height={60} rx={12} fill={color} />
    <circle cx={50} cy={76} r={8} fill="#111" />
    <rect x={46} y={78} width={8} height={18} rx={3} fill="#111" />
  </svg>
);

/* ===================================================================== "But here's where things get crazy" */
const B8: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("crazy")} b={c("graphite")} tin="glitch">
    {(lf) => (
      <>
        <Bg f={lf} kind="void" />
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 60% 40% at 50% 45%, ${OR}33, transparent 70%)` }} />
        <Stage cam={{ pos: [0, 0, 40], target: [0, 0, 0], fov: 40 }} light={1}>
          <Pencil p={[0, -9, 0]} r={[0.2, lf * 0.25, 0.1]} s={0.85} core={0.6} />
        </Stage>
        <Mid y={330}>
          <Impact f={lf} at={2} text={"HERE'S WHERE IT\nGETS [CRAZY]"} size={124} />
        </Mid>
      </>
    )}
  </Beat>
);

/* ===================================================================== graphite inside a pencil */
const B9: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("graphite")} b={c("conduct")} tin="zoom">
    {(lf, d) => (
      <>
        <Bg f={lf} warm={0.2} />
        <Stage cam={{ pos: pathV(lf, [[0, [10, 4, 12]], [d, [4, 2.5, 7]]]), target: [0, 1.2, 0], fov: 40 }} light={1.2} rim={OR}>
          <Pencil p={[0, 0, 0]} r={[0, 0, Math.PI / 2 - 0.25]} core={E.out(lf, 6, 20)} />
          <Motes f={lf} spread={14} y={1} />
        </Stage>
        <Mid y={300}>
          <MetalType f={lf} at={2} size={170} sweepAt={6} tint="#d6dbe2">
            GRAPHITE
          </MetalType>
        </Mid>
        <At x={90} y={1200}>
          <Tag f={lf} at={10} size={28}>
            THE &quot;LEAD&quot; IN A PENCIL IS GRAPHITE
          </Tag>
        </At>
      </>
    )}
  </Beat>
);
/* graphite conducts: a pencil line completes a circuit, bulb lights */
const B10: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("conduct")} b={c("discovered")} tin="wipe">
    {(lf, d) => {
      const draw = E.io(lf, 4, Math.min(d - 10, 34));
      const on = lin(lf, Math.min(d - 10, 34), Math.min(d - 4, 40));
      const L = 1700;
      return (
        <>
          <Bg f={lf} kind="blueprint" />
          <svg width={SW} height={1920} style={{ position: "absolute", inset: 0 }}>
            {/* paper */}
            <rect x={90} y={470} width={900} height={760} rx={24} fill="#efe9dc" opacity={0.96} />
            {/* battery */}
            <rect x={170} y={560} width={110} height={220} rx={14} fill="#2a2e35" />
            <rect x={200} y={540} width={50} height={24} rx={6} fill="#c9ccd1" />
            <text x={225} y={690} fill={AMB} fontFamily={MONO} fontWeight={800} fontSize={60} textAnchor="middle">
              +
            </text>
            {/* pencil-drawn graphite path */}
            <path d="M 225 540 V 520 H 840 V 640 M 225 780 V 1140 H 840 V 860" fill="none" stroke="#3d3f44" strokeWidth={16} strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - draw)} />
            {on > 0 ? <path d="M 225 540 V 520 H 840 V 640 M 225 780 V 1140 H 840 V 860" fill="none" stroke={AMB} strokeWidth={6} strokeLinecap="round" strokeDasharray="30 50" strokeDashoffset={-lf * 6} opacity={on} /> : null}
            {/* bulb */}
            <circle cx={840} cy={750} r={100} fill={on > 0 ? `rgba(255,190,90,${0.35 + 0.6 * on})` : "rgba(200,200,200,0.25)"} stroke="#55585e" strokeWidth={8} style={{ filter: on > 0 ? `drop-shadow(0 0 ${60 * on}px ${AMB})` : undefined }} />
            <rect x={800} y={840} width={80} height={40} rx={6} fill="#8a8f97" />
          </svg>
          {/* pencil drawing tip follows path start */}
          <At x={140 + 700 * draw} y={420 + 660 * draw}>
            <div style={{ width: 22, height: 220, background: `linear-gradient(180deg, #e6807a 0 8%, #c9ccd1 8% 14%, ${'#f0a21a'} 14% 86%, #d9b083 86% 96%, #3a3c40 96%)`, transform: "rotate(30deg)", transformOrigin: "bottom center", opacity: 1 - on, borderRadius: 4 }} />
          </At>
          <Mid y={300}>
            <Impact f={lf} at={2} text={"GRAPHITE [CONDUCTS]\nELECTRICITY"} size={96} />
          </Mid>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== enthusiasts reconnect the bridges with a pencil */
const B11: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("discovered")} b={c("reconnect")} tin="whip">
    {(lf, d) => {
      const bp = bridgePos(1.5);
      const fill = E.io(lf, 10, d);
      const px = bp[0] - 0.63 + 1.26 * fill;
      return (
        <>
          <Bg f={lf} warm={0.28} />
          <Stage cam={{ pos: pathV(lf, [[0, [bp[0] + 8, 10, bp[2] + 9]], [d, [bp[0] + 4, 6, bp[2] + 6]]]), target: [bp[0], 0.5, bp[2]], fov: 40 }} light={1.1} rim={OR}>
            <OldCpu cut={1} fill={fill} />
            <Pencil p={[px, 0.32 + 2 * (1 - E.out(lf, 0, 10)), bp[2] + 0.1]} r={[0.35, 0, -0.5]} s={0.45} />
          </Stage>
          <Mid y={300}>
            <Impact f={lf} at={2} text="[ENTHUSIASTS] DISCOVERED" size={92} />
          </Mid>
          <At x={90} y={1220}>
            <Tag f={lf} at={14} size={26}>
              PENCIL LINE ACROSS EACH CUT BRIDGE
            </Tag>
          </At>
        </>
      );
    }}
  </Beat>
);
/* macro cross-section: graphite fills the laser cut */
const B12: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("reconnect")} b={c("unlock")} tin="iris">
    {(lf, d) => (
      <>
        <Bg f={lf} warm={0.2} />
        <Stage cam={{ pos: pathV(lf, [[0, [14, 12, 30]], [d, [8, 8, 24]]]), target: [0, -1, 0], fov: 40 }} light={1} rim={OR}>
          <Macro f={lf} fill={E.io(lf, 0, d - 4)} flow={0} />
          <Pencil p={[3, 14.5, 4]} r={[0.45, 0, -0.35]} s={0.9} />
        </Stage>
        <Mid y={300}>
          <Chip f={lf} at={2}>
            CROSS-SECTION · ONE BRIDGE
          </Chip>
        </Mid>
        <Mid y={420}>
          <Impact f={lf} at={4} text="[RECONNECTING] THE GAP" size={96} />
        </Mid>
      </>
    )}
  </Beat>
);
/* circuit restored → multiplier unlocked */
const B13: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("unlock")} b={c("meant")} tin="flash">
    {(lf) => {
      const open = E.back(lf, 12, 24);
      return (
        <>
          <Bg f={lf} warm={0.35} />
          <Stage cam={{ pos: [-12, 9, 26], target: [0, -1, 0], fov: 40 }} light={1.1} rim={OR}>
            <Macro f={lf} fill={1} flow={E.out(lf, 0, 10)} />
          </Stage>
          <Mid y={300}>
            <Impact f={lf} at={2} text="CIRCUIT [RESTORED]" size={108} />
          </Mid>
          <Mid y={1080}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 26, padding: "26px 40px", borderRadius: 28, background: "rgba(12,13,16,0.86)", border: `3px solid ${AMB}`, opacity: E.out(lf, 8, 14), boxShadow: `0 0 50px ${OR}55` }}>
              <Padlock open={open} color={AMB} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, color: "rgba(244,242,238,0.7)", letterSpacing: 4 }}>MULTIPLIER</div>
                <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 84, color: AMB, lineHeight: 1 }}>UNLOCKED</div>
              </div>
            </div>
          </Mid>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== clock = FSB × multiplier → beyond stock speed */
const B14: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("meant")} b={c("example")} tin="wipe">
    {(lf, d) => {
      const by = c("beyond") - c("meant");
      const m = 6 + 4 * E.io(lf, by - 6, by + 30);
      const mhz = Math.round(100 * m);
      const hot = lin(lf, by, by + 30);
      return (
        <>
          <Bg f={lf} kind="blueprint" />
          <Mid y={300}>
            <Chip f={lf} at={2} color="#8cc4ff">
              HOW CPU CLOCK SPEED WAS SET
            </Chip>
          </Mid>
          <Mid y={470}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 22, fontFamily: HEAD, fontWeight: 800, color: P.white, opacity: E.out(lf, 4, 12) }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 110 }}>100</div>
                <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: 3, color: "#8cc4ff" }}>BUS MHz</div>
              </div>
              <div style={{ fontSize: 90, color: "#8cc4ff" }}>×</div>
              <div style={{ textAlign: "center", padding: "0 20px", borderRadius: 20, border: `4px solid ${hot > 0 ? AMB : "#8cc4ff"}`, boxShadow: hot > 0 ? `0 0 40px ${OR}88` : undefined }}>
                <div style={{ fontSize: 110, color: hot > 0 ? AMB : P.white }}>{m.toFixed(1)}</div>
                <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: 3, color: hot > 0 ? AMB : "#8cc4ff" }}>MULTIPLIER</div>
              </div>
            </div>
          </Mid>
          <Mid y={760}>
            <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 200, color: hot > 0 ? AMB : P.white, textShadow: hot > 0 ? `0 0 50px ${OR}` : undefined, opacity: E.out(lf, 8, 16) }}>
              {mhz}
              <span style={{ fontSize: 80 }}> MHz</span>
            </div>
          </Mid>
          {/* slider */}
          <At x={110} y={1050}>
            <div style={{ width: 860, height: 18, borderRadius: 9, background: "rgba(140,196,255,0.18)" }}>
              <div style={{ width: `${((m - 5) / 6) * 100}%`, height: "100%", borderRadius: 9, background: `linear-gradient(90deg, #8cc4ff, ${AMB})` }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontFamily: MONO, fontWeight: 700, fontSize: 24, color: "rgba(244,242,238,0.6)", letterSpacing: 2 }}>
              <span>STOCK</span>
              <span style={{ color: hot > 0 ? AMB : undefined }}>OVERCLOCKED</span>
            </div>
          </At>
          <At x={90} y={1220}>
            <Tag f={lf} at={by + 10} size={26}>
              THE PENCIL UNLOCKS · OVERCLOCKING ADDS SPEED
            </Tag>
          </At>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== famous example: Duron 600 → ~1 GHz */
const Gauge: React.FC<{ v: number; hot: number }> = ({ v, hot }) => {
  const R = 330;
  const a0 = Math.PI * 0.8;
  const a1 = Math.PI * 2.2;
  const at = (t: number) => a0 + (a1 - a0) * t;
  const arc = (t0: number, t1: number) => `M ${R * Math.cos(at(t0))} ${R * Math.sin(at(t0))} A ${R} ${R} 0 ${(t1 - t0) * (a1 - a0) > Math.PI ? 1 : 0} 1 ${R * Math.cos(at(t1))} ${R * Math.sin(at(t1))}`;
  const na = at(v);
  return (
    <svg width={820} height={820} viewBox="-410 -410 820 820">
      <path d={arc(0, 1)} stroke="rgba(255,255,255,0.08)" strokeWidth={42} fill="none" />
      <path d={arc(0, Math.min(v, 0.5))} stroke="#8cc4ff" strokeWidth={42} fill="none" />
      {v > 0.5 ? <path d={arc(0.5, v)} stroke={AMB} strokeWidth={42} fill="none" style={{ filter: `drop-shadow(0 0 ${20 + 30 * hot}px ${OR})` }} /> : null}
      {[0, 200, 400, 600, 800, 1000, 1200].map((mhz) => {
        const a = at(mhz / 1200);
        return (
          <g key={mhz}>
            <line x1={(R - 60) * Math.cos(a)} y1={(R - 60) * Math.sin(a)} x2={(R - 96) * Math.cos(a)} y2={(R - 96) * Math.sin(a)} stroke="#fff" strokeWidth={6} />
            <text x={(R - 140) * Math.cos(a)} y={(R - 140) * Math.sin(a) + 12} fill="rgba(244,242,238,0.75)" fontFamily={MONO} fontWeight={800} fontSize={32} textAnchor="middle">
              {mhz}
            </text>
          </g>
        );
      })}
      <line x1={0} y1={0} x2={(R - 30) * Math.cos(na)} y2={(R - 30) * Math.sin(na)} stroke="#fff" strokeWidth={10} strokeLinecap="round" />
      <circle r={30} fill="#16181c" stroke={hot > 0 ? AMB : "#fff"} strokeWidth={6} />
      <text y={150} fill="rgba(244,242,238,0.6)" fontFamily={MONO} fontWeight={800} fontSize={30} textAnchor="middle">
        MHz
      </text>
    </svg>
  );
};
const B15: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("example")} b={c("cheap")} tin="cut">
    {(lf) => (
      <>
        <Bg f={lf} kind="void" />
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 45% 30% at 50% 50%, rgba(255,190,140,${0.2 * E.out(lf, 0, 10)}), transparent 70%)` }} />
        <Stage cam={{ pos: [0, 22, 24], target: [0, 0, 0], fov: 40 }} light={E.out(lf, 0, 10)} rim={OR}>
          <OldCpu r={[0, lf * 0.03, 0]} cut={1} fill={1} />
        </Stage>
        <Mid y={300}>
          <Chip f={lf} at={2}>
            ONE FAMOUS EXAMPLE
          </Chip>
        </Mid>
      </>
    )}
  </Beat>
);
const B16: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("cheap")} b={c("guaranteed")} tin="flash">
    {(lf, d) => {
      const g = c("ghz") - c("cheap");
      const ms = c("massive") - c("cheap");
      const v = 0.5 * E.out(lf, 2, 14) + (1000 / 1200 - 0.5) * E.io(lf, g - 8, g + 10);
      const hot = lin(lf, g - 2, g + 6);
      const [sx, sy] = shake(lf, g + 6, 16);
      return (
        <>
          <Bg f={lf} warm={0.16 + 0.2 * hot} />
          <Mid y={250}>
            <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 92, color: P.white, opacity: E.out(lf, 0, 8) }}>
              DURON <span style={{ color: "#8cc4ff" }}>600 MHz</span>
            </div>
          </Mid>
          <div style={{ position: "absolute", left: 130 + sx, top: 380 + sy }}>
            <Gauge v={v} hot={hot} />
          </div>
          {lf >= g - 4 ? (
            <Mid y={1010}>
              <div style={{ transform: `scale(${1.4 - 0.4 * sp(lf, g - 4, 11, 240)})` }}>
                <span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 128, color: AMB, textShadow: `0 0 40px ${OR}` }}>~1 GHz</span>
              </div>
            </Mid>
          ) : null}
          <Sparks f={lf} at={g + 6} x={540} y={700} color={AMB} />
          {lf >= ms ? (
            <Mid y={1205}>
              <Stamp f={lf} at={ms} color={AMB} size={56} rot={-3}>
                BUDGET CPU · MASSIVE JUMP
              </Stamp>
            </Mid>
          ) : null}
          <At x={90} y={1350}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 25, color: "rgba(244,242,238,0.7)", letterSpacing: 2, opacity: E.out(lf, g, g + 10) }}>REPORTED OVERCLOCKING RESULT — NOT GUARANTEED</div>
          </At>
          {void d}
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== not guaranteed: stability + cooling */
const B17: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("guaranteed")} b={c("no")} tin="glitch">
    {(lf, d) => {
      const heat = E.io(lf, 4, d);
      return (
        <>
          <Bg f={lf} warm={0.1 + 0.3 * heat} hue={P.coral} />
          <Stage cam={{ pos: [path(lf, [[0, -10], [d, 8]]), 16, 22], target: [0, 0, 0], fov: 40 }} light={1} kick="#ff3a2a">
            <OldCpu r={[0, 0.6, 0]} cut={1} fill={1} dieGlow={heat} />
            <Glow p={[0, 1, 0]} s={8 + 10 * heat} color="#ff4a2a" o={0.6 * heat} />
            <Particles n={40} color="#ff7a3a" k={2} fn={(i) => ({ p: [(hash(i) - 0.5) * 3, ((lf * 0.15 + i * 0.4) % 12) * heat, (hash(i * 3) - 0.5) * 3], s: 0.08 * heat })} />
          </Stage>
          <Mid y={300}>
            <Impact f={lf} at={2} text="NOT [GUARANTEED]" size={124} accent={P.coral} />
          </Mid>
          <At x={70} y={1100} style={{ padding: "22px 30px 10px", borderRadius: 24, background: "rgba(10,11,13,0.82)", border: "2px solid rgba(255,90,78,0.4)", opacity: E.out(lf, 8, 14) }}>
            {["STABILITY", "COOLING", "EACH CHIP IS DIFFERENT"].map((t, i) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 14, opacity: E.out(lf, 10 + i * 10, 18 + i * 10), transform: `translateX(${(1 - E.out(lf, 10 + i * 10, 18 + i * 10)) * -40}px)` }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, border: `4px solid ${P.coral}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontWeight: 800, color: P.coral, fontSize: 30 }}>!</div>
                <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 46, color: P.white }}>{t}</div>
              </div>
            ))}
          </At>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== modern CPUs: won't work */
const B18: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("no")} b={c("today")} tin="whip">
    {(lf, d) => {
      const mo = c("modern") - c("no");
      const swap = E.io(lf, mo - 6, mo + 10);
      return (
        <>
          <Bg f={lf} kind="cold" />
          <Stage cam={{ pos: [Math.sin(lf * 0.02) * 6, 18, 22], target: [0, 0, 0], fov: 40 }} light={1} rim={P.cool} kick="#3a7bff">
            <group position={[-14 * swap, 0, 0]} scale={1 - 0.5 * swap}>
              <OldCpu cut={1} fill={1} pins={false} />
            </group>
            <group position={[14 * (1 - swap), 0, 0]}>
              <ModernCpu glow={swap} />
            </group>
          </Stage>
          <Mid y={300}>
            <Impact f={lf} at={mo} text={"MODERN RYZEN\n& INTEL CPUs"} size={110} accent="#9cc8ff" />
          </Mid>
          {lf >= mo + 10 ? (
            <Mid y={1110}>
              <Stamp f={lf} at={mo + 10} color={P.coral} size={92} rot={-5}>
                ✕ WON&apos;T WORK
              </Stamp>
            </Mid>
          ) : null}
          {void d}
        </>
      );
    }}
  </Beat>
);
const B19: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("today")} b={c("imagine2")} tin="zoom">
    {(lf, d) => {
      const so = c("sophisticated") - c("today");
      const z = E.io(lf, 0, so);
      return (
        <>
          <Bg f={lf} kind="cold" />
          <Stage cam={{ pos: pathV(lf, [[0, [0, 40, 30]], [so, [-3, 9, 10]], [d, [-2.4, 7, 8]]]), target: [-1.1, -0.2, 0], fov: 42 }} light={1} rim={P.cool} kick="#3a7bff">
            <Mobo p={[0, -1.2, 0]} s={0.9} glow={0.5} />
            <ModernCpu p={[0, -0.6, 0]} s={0.6} lift={E.io(lf, 6, so - 4)} glow={0.6 + 0.6 * z} />
          </Stage>
          <Mid y={300}>
            <Impact f={lf} at={2} text={"MODERN CPUs ARE\n[DIFFERENT]"} size={108} accent="#9cc8ff" />
          </Mid>
          <At x={90} y={1220}>
            <Tag f={lf} at={so} color="#9cc8ff" size={28}>
              BILLIONS OF TRANSISTORS · NO PENCIL MODS
            </Tag>
          </At>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== final: pencil beside the old CPU, pull back */
const B20: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("imagine2")} b={c("believe")} tin="iris">
    {(lf, d) => (
      <>
        <Bg f={lf} warm={0.3} />
        <Stage cam={{ pos: pathV(lf, [[0, [8, 12, 36]], [d, [12, 20, 60]]]), target: [0, 6, 0], fov: 40 }} light={1.1} rim={OR}>
          <Floor y={-4} />
          <OldCpu p={[-5, 2, 0]} r={[0.9, 0.3 + lf * 0.01, 0]} s={0.9} cut={1} fill={1} glow={0.4} />
          <Pencil p={[6, 0, 0]} r={[0, -lf * 0.02, 0.2]} s={0.75} />
          <Motes f={lf} spread={50} y={8} />
        </Stage>
        <Mid y={300}>
          <Impact f={lf} at={c("pencilonce") - c("imagine2")} text={"A [PENCIL] ONCE\nOVERCLOCKED A PC"} size={110} />
        </Mid>
      </>
    )}
  </Beat>
);
const End: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("believe")} b={VO_FRAMES + 400} tin="flash">
    {(lf) => {
      const fo = VO_FRAMES - c("believe");
      return (
        <>
          <Bg f={lf} warm={0.36} />
          <Stage cam={{ pos: [0, 10, 46 - 6 * E.out(lf, 0, 30)], target: [0, 6, 0], fov: 40 }} light={1.2} rim={OR}>
            <Floor y={-2} />
            <Pencil p={[3.2, 0.5, 0]} r={[0, lf * 0.06, 0.18]} s={0.62} spark={(lf % 40) / 40} />
            <OldCpu p={[-4.6, 3, 0]} r={[1.1, lf * 0.02, 0]} s={0.8} cut={1} fill={1} glow={0.6 + 0.4 * Math.sin(lf * 0.2)} />
          </Stage>
          <Mid y={290}>
            <Impact f={lf} at={0} text={"WOULD YOU\n[BELIEVE] THIS?"} size={140} />
          </Mid>
          {lf >= fo ? (
            <Mid y={1150}>
              <div style={{ transform: `scale(${sp(lf, fo, 11, 260)})`, padding: "22px 40px", borderRadius: 22, background: OR, fontFamily: HEAD, fontWeight: 800, fontSize: 52, color: "#1a0d04", boxShadow: `0 0 60px ${OR}` }}>FOLLOW FOR MORE TECH STORIES</div>
            </Mid>
          ) : null}
          <Sparks f={lf} at={fo} x={540} y={1150} n={40} />
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== picture */
export const Picture: React.FC<F> = ({ f }) => (
  <AbsoluteFill>
    <B1 f={f} />
    <B1b f={f} />
    <B2 f={f} />
    <B3 f={f} />
    <B4 f={f} />
    <B5 f={f} />
    <B6 f={f} />
    <B7 f={f} />
    <B8 f={f} />
    <B9 f={f} />
    <B10 f={f} />
    <B11 f={f} />
    <B12 f={f} />
    <B13 f={f} />
    <B14 f={f} />
    <B15 f={f} />
    <B16 f={f} />
    <B17 f={f} />
    <B18 f={f} />
    <B19 f={f} />
    <B20 f={f} />
    <End f={f} />
  </AbsoluteFill>
);
export const BEAT_STARTS = (): number[] =>
  ["pencil", "ridic", "back", "real", "some", "tiny", "bridges", "cut", "lock", "crazy", "graphite", "conduct", "discovered", "reconnect", "unlock", "meant", "beyond", "example", "cheap", "ghz", "massive", "guaranteed", "no", "modern", "today", "sophisticated", "imagine2", "believe"].map((k) => c(k));
