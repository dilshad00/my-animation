/**
 * SH-DDR6 beats (see E:/youtube/SHORTS/ddr6/storyboard.md). Every beat explains its narration;
 * a new focal point lands every ~2 s. Absolute frames on the tightened narration.
 */
import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import * as THREE from "three";
import { E, HEAD, INTER, lin, MetalType, MONO, Roll, sp, Stamp, Tag } from "../../ug6/Look6";
import { Box, Cyl, Glow, hash, P, Particles, RBox, Stage, useGlow, useMats, type V3 } from "../../ug6/Three6";
import { Balance, Console, Hall, Laptop, PhoneSlab, Rack, Text3D, Tower } from "../../ug6/World6";
import { At, Beat, Bg, Chip, cueFn, Impact, Mid, path, pathV, shake, SW } from "../engine/Engine";
import { Beacon, ClipOn, Clamp, DataTube, DDR5_BLUE, DDR6_ORANGE, Hourglass, MOD_H, MOD_L, Module, NOTCH, PriceTag, Press, QMark, ShipBox, Slot, Vortex } from "./Assets";
import { CUE, VO_FRAMES } from "./data";

export const c = cueFn(CUE);
type F = { f: number };
const BLUE = DDR5_BLUE;
const GOLD = DDR6_ORANGE;

/** Module centred on its own middle (for rotations). */
const Mod: React.FC<{ gen: "ddr6" | "ddr5"; p?: V3; r?: V3; s?: number; glow?: number; phase?: number; label?: boolean }> = ({ gen, p = [0, 0, 0], r = [0, 0, 0], s = 1, glow = 1, phase = 0, label = true }) => (
  <group position={p} rotation={r} scale={s}>
    <Module gen={gen} p={[0, -MOD_H / 2, 0]} glow={glow} phase={phase} label={label} />
  </group>
);
/** Plain studio floor disc that catches reflections. */
const Floor9: React.FC<{ y?: number; r?: number; color?: string }> = ({ y = 0, r = 120, color = "#0c0d10" }) => {
  const m = useMemo(() => new THREE.MeshStandardMaterial({ color, metalness: 0.75, roughness: 0.32 }), [color]);
  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} material={m}>
      <circleGeometry args={[r, 64]} />
    </mesh>
  );
};
/** Sparks: DOM particle burst from (x, y) at frame `at`. */
const Sparks: React.FC<{ f: number; at: number; x: number; y: number; n?: number; color?: string; spread?: number }> = ({ f, at, x, y, n = 36, color = P.amber, spread = 520 }) => {
  if (f < at || f > at + 30) return null;
  const t = (f - at) / 30;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const a = hash(i) * Math.PI * 2;
        const d = spread * (0.3 + 0.7 * hash(i * 3)) * E.out(f, at, at + 30);
        return <div key={i} style={{ position: "absolute", left: x + Math.cos(a) * d, top: y + Math.sin(a) * d + t * t * 200, width: 10, height: 10, borderRadius: 9, background: color, opacity: 1 - t, boxShadow: `0 0 16px ${color}` }} />;
      })}
    </>
  );
};

/* ===================================================================== B1 hook: DDR6 module + title */
const B1: React.FC<F> = ({ f }) => (
  <Beat f={f} a={0} b={c("pc")} tin="cut">
    {(lf) => {
      const sw = lin(lf, 0, 34, -0.8, 1.2);
      return (
        <>
          <Bg f={lf} warm={0.32} />
          <Stage cam={{ pos: [path(lf, [[0, -3], [45, 2]]), 2, path(lf, [[0, 30], [45, 24]])], target: [0, 1.2, 0], fov: 36 }} light={0.9 + 0.3 * E.out(lf, 0, 10)}>
            <Mod gen="ddr6" p={[0, 0, 0]} r={[0.28, -0.55 + lf * 0.006, 1.05]} s={1.45} glow={1.2} phase={lf * 0.2} />
            <pointLight position={[sw * 20, 6, 12]} intensity={1800} distance={60} color="#ffffff" />
          </Stage>
          <Mid y={250}>
            <MetalType f={lf} at={0} size={300} sweepAt={4} tint="#ffd2a6">
              DDR6
            </MetalType>
          </Mid>
          <Mid y={560}>
            <div style={{ opacity: E.out(lf, 6, 16), transform: `translateY(${(1 - E.out(lf, 6, 16)) * 20}px)` }}>
              <Tag f={lf} at={6} color={P.amber} size={30}>
                CONCEPT DESIGN · NOT FINAL HARDWARE
              </Tag>
            </div>
          </Mid>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== B2 gaming PC powers on */
const B2: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("pc")} b={c("stuck")} tin="whip">
    {(lf) => {
      const power = E.out(lf, 6, 30);
      return (
        <>
          <Bg f={lf} warm={0.1 + 0.2 * power} />
          <Stage cam={{ pos: pathV(lf, [[0, [48, 30, 96]], [52, [30, 26, 74]]]), target: [0, 23, 0], fov: 36 }} light={0.35 + 0.65 * power}>
            <Floor9 />
            <Tower power={power} spin={lf * 0.5 * power} phase={lf * 0.1} />
          </Stage>
          <Mid y={300}>
            <Impact f={lf} at={12} text="YOUR [NEXT] BUILD" size={110} />
          </Mid>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== B3 stuck with DDR5 (clamps) */
const B3: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("stuck")} b={c("gen")} tin="zoom">
    {(lf) => {
      const hit = c("ddr5a") - c("stuck") - 4;
      const down = E.back(lf, hit - 6, hit + 4);
      const [sx, sy] = shake(lf, hit + 2, 0.6);
      return (
        <>
          <Bg f={lf} warm={0.08} hue={BLUE} />
          <Stage cam={{ pos: [4 + sx + path(lf, [[0, 4], [80, -2]]), 13 + sy, 21], target: [0, 2.5, 0], fov: 40 }} rim={BLUE}>
            <Box p={[0, -0.1, 0]} s={[24, 0.2, 14]} m={useMats().pcb} />
            {[-2.2, 0, 2.2].map((z, i) => (
              <group key={z} position={[0, 0, z]}>
                <Slot gen="ddr5" glow={0.4} />
                {i < 2 ? <Module gen="ddr5" p={[0, 0.25, 0]} glow={0.9} label={i === 1} /> : null}
              </group>
            ))}
            <Clamp down={down} p={[0, 5.2, -1.1]} />
            <Clamp down={E.back(lf, hit - 2, hit + 8)} p={[0, 5.2, 1.6]} />
          </Stage>
          <Mid y={330}>
            <Chip f={lf} at={6} color={BLUE}>
              TODAY: DDR5
            </Chip>
          </Mid>
          <Mid y={1080}>
            <Stamp f={lf} at={hit + 2} color={P.coral} size={130} rot={-6}>
              STUCK
            </Stamp>
          </Mid>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== B4 blueprint: new generation previewed */
const B4: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("gen")} b={c("perf")} tin="flash">
    {(lf, d) => {
      const draw = E.io(lf, 4, 52);
      return (
        <>
          <Bg f={lf} kind="blueprint" />
          <Stage cam={{ pos: [path(lf, [[0, -6], [d, 4]]), 6, 26], target: [0, 1.7, 0], fov: 38 }} light={0.6}>
            <ClipOn />
            <Module gen="ddr6" wire={1} solid={0} draw={draw} glow={0} label={false} s={1.3} />
          </Stage>
          {/* dimension lines */}
          <svg width={SW} height={1920} style={{ position: "absolute", inset: 0 }}>
            <g opacity={E.out(lf, 30, 46)} stroke="#8cc4ff" strokeWidth={3} fill="none">
              <line x1={110} y1={1060} x2={110 + 860 * E.out(lf, 30, 50)} y2={1060} />
              <line x1={110} y1={1040} x2={110} y2={1080} />
              <line x1={970} y1={1040} x2={970} y2={1080} opacity={E.out(lf, 46, 50)} />
            </g>
          </svg>
          <At x={110} y={1095}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: "#8cc4ff", letterSpacing: 4, opacity: E.out(lf, 40, 52) }}>NEXT-GEN DESKTOP MEMORY · CONCEPT</div>
          </At>
          <Mid y={330}>
            <Impact f={lf} at={8} text="NEW RAM [GENERATION]" size={104} color="#dff0ff" accent="#8cc4ff" />
          </Mid>
          <Mid y={1180}>
            <Stamp f={lf} at={c("prev") - c("gen")} color={P.amber} size={92} rot={-4}>
              PREVIEWED
            </Stamp>
          </Mid>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== B5/B6 performance gauge → redline */
const Gauge: React.FC<{ v: number; hot: number }> = ({ v, hot }) => {
  const R = 360;
  const a0 = Math.PI * 0.8;
  const a1 = Math.PI * 2.2;
  const arc = (from: number, to: number) => {
    const s = a0 + (a1 - a0) * from;
    const e = a0 + (a1 - a0) * to;
    return `M ${R * Math.cos(s)} ${R * Math.sin(s)} A ${R} ${R} 0 ${e - s > Math.PI ? 1 : 0} 1 ${R * Math.cos(e)} ${R * Math.sin(e)}`;
  };
  const na = a0 + (a1 - a0) * v;
  return (
    <svg width={900} height={900} viewBox="-450 -450 900 900">
      <path d={arc(0, 1)} stroke="rgba(255,255,255,0.08)" strokeWidth={46} fill="none" />
      <path d={arc(0, Math.min(v, 0.72))} stroke={BLUE} strokeWidth={46} fill="none" opacity={0.9} />
      {v > 0.72 ? <path d={arc(0.72, v)} stroke={GOLD} strokeWidth={46} fill="none" style={{ filter: `drop-shadow(0 0 ${20 + hot * 30}px ${GOLD})` }} /> : null}
      {Array.from({ length: 41 }, (_, i) => {
        const t = i / 40;
        const a = a0 + (a1 - a0) * t;
        const on = t <= v;
        const L = i % 5 === 0 ? 40 : 20;
        return <line key={i} x1={(R - 70) * Math.cos(a)} y1={(R - 70) * Math.sin(a)} x2={(R - 70 - L) * Math.cos(a)} y2={(R - 70 - L) * Math.sin(a)} stroke={on ? (t > 0.72 ? GOLD : "#fff") : "rgba(255,255,255,0.2)"} strokeWidth={i % 5 === 0 ? 6 : 3} />;
      })}
      <line x1={0} y1={0} x2={(R - 40) * Math.cos(na)} y2={(R - 40) * Math.sin(na)} stroke="#fff" strokeWidth={10} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 14px ${hot > 0 ? GOLD : "#fff"})` }} />
      <circle r={34} fill="#16181c" stroke={hot > 0 ? GOLD : "#fff"} strokeWidth={6} />
      <text x={-R * 0.8} y={R * 0.82} fill={BLUE} fontFamily={MONO} fontWeight={800} fontSize={34}>
        DDR5
      </text>
      <text x={R * 0.5} y={R * 0.82} fill={GOLD} fontFamily={MONO} fontWeight={800} fontSize={34}>
        DDR6
      </text>
    </svg>
  );
};
const B5: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("perf")} b={c("called")} tin="iris">
    {(lf) => {
      const slam = c("serious") + 15 - c("perf");
      const v = lf < slam ? 0.08 + 0.62 * E.io(lf, 4, slam - 6) : 0.7 + 0.27 * E.back(lf, slam - 6, slam + 6);
      const hot = lin(lf, slam - 4, slam);
      const [sx, sy] = shake(lf, slam, 18);
      return (
        <>
          <Bg f={lf} warm={0.12 + 0.25 * hot} hue={hot > 0 ? P.orange : "#3a6aa8"} />
          <div style={{ position: "absolute", left: 90 + sx, top: 330 + sy }}>
            <Gauge v={v} hot={hot} />
          </div>
          <Mid y={330}>
            <Chip f={lf} at={2}>
              PERFORMANCE TARGETS
            </Chip>
          </Mid>
          <Sparks f={lf} at={slam} x={540 + 300} y={780 - 40} n={44} color={GOLD} />
          <Mid y={1170}>
            <Impact f={lf} at={slam} text="[NEXT-LEVEL]" size={130} />
          </Mid>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== B7 "It's called DDR6" hero */
const B7: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("called")} b={c("std")} tin="flash">
    {(lf, d) => {
      const name = c("called") + 12 - c("called");
      const rise = E.out(lf, name - 6, name + 14);
      return (
        <>
          <Bg f={lf} warm={0.3} />
          <Stage cam={{ pos: [Math.sin(lf * 0.02) * 30, 9, Math.cos(lf * 0.02) * 30], target: [0, 6, 0], fov: 40 }} light={1.1}>
            <Floor9 y={-3} />
            <Text3D text="DDR6" h={5.2} depth={1.6} p={[0, 11 + (1 - rise) * 6, 0]} accent={1.4 * rise} />
            <Mod gen="ddr6" p={[0, 1.6, 0]} r={[0.12, lf * 0.03, 0]} s={1.1} glow={1.3} phase={lf * 0.2} />
            <Glow p={[0, 4, 0]} s={40} color={GOLD} o={0.25} />
          </Stage>
          <Mid y={1180}>
            <div style={{ opacity: lin(lf, d - 30, d - 20) }}>
              <Chip f={lf} at={d - 30}>
                THE NEXT RAM STANDARD
              </Chip>
            </div>
          </Mid>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== B8-B10 bandwidth: data tubes, +50 %, lateral track */
const B8: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("std")} b={c("catch")} tin="whipUp">
    {(lf, d) => {
      const p50 = c("pct") - c("std");
      const trk = c("bw") - c("std") + 6;
      const grow = E.back(lf, p50 + 4, p50 + 22);
      const cam: V3 = pathV(lf, [
        [0, [0, 0, 92]],
        [p50, [0, 0, 80]],
        [trk, [0, 0, 74]],
        [d, [-26, 4, 46]],
      ]);
      const tgt: V3 = pathV(lf, [
        [trk, [0, 0, 0]],
        [d, [10, 0, 0]],
      ]);
      return (
        <>
          <Bg f={lf} warm={0.12} hue="#2a5fff" />
          <Stage cam={{ pos: cam, target: tgt, fov: 42 }} light={0.8}>
            <DataTube f={lf} p={[0, 9, 0]} len={90} rad={2.6 + 2.2 * grow} color={GOLD} density={0.9 + 1.3 * grow} speed={0.9 + 0.5 * grow} seed={1} />
            <DataTube f={lf} p={[0, -9, 0]} len={90} rad={2.6} color={BLUE} density={0.9} speed={0.9} seed={2} />
          </Stage>
          <At x={70} y={470}>
            <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 62, color: GOLD, opacity: E.out(lf, 6, 16), textShadow: `0 0 30px ${GOLD}88` }}>DDR6</div>
          </At>
          <At x={70} y={1150}>
            <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 62, color: BLUE, opacity: E.out(lf, 10, 20) }}>DDR5</div>
          </At>
          {lf >= p50 - 2 ? (
            <Mid y={760}>
              <div style={{ transform: `scale(${1.5 - 0.5 * sp(lf, p50 - 2, 11, 240)})`, opacity: 1 - lin(lf, trk + 20, trk + 34) }}>
                <Roll f={lf} at={p50 - 2} len={16} from={0} to={50} prefix="+" suffix="%" size={230} color={P.white} />
              </div>
            </Mid>
          ) : null}
          <Mid y={330}>
            <Chip f={lf} at={4} color={P.amber}>
              MEMORY BANDWIDTH
            </Chip>
          </Mid>
          <At x={70} y={1250}>
            <Tag f={lf} at={c("launch") - c("std") - 4} size={30}>
              TARGET · AT LAUNCH vs DDR5
            </Tag>
          </At>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== B11 "But here's the catch" */
const Hazard: React.FC<{ t: number; y: number; rot: number; dir?: number }> = ({ t, y, rot, dir = 1 }) => (
  <div style={{ position: "absolute", left: -400, top: y, width: 1900, height: 110, transform: `rotate(${rot}deg) translateX(${(1 - t) * 1900 * dir}px)`, background: `repeating-linear-gradient(45deg, ${P.amber} 0 50px, #111 50px 100px)`, boxShadow: "0 10px 40px rgba(0,0,0,0.7)" }} />
);
const B11: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("catch")} b={c("dev")} tin="glitch">
    {(lf) => (
      <>
        <Bg f={lf} kind="void" />
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 40% at 50% 42%, ${P.coral}33, transparent 70%)` }} />
        <Hazard t={E.out(lf, 0, 10)} y={430} rot={-14} />
        <Hazard t={E.out(lf, 4, 14)} y={1080} rot={-14} dir={-1} />
        <Mid y={640}>
          <Impact f={lf} at={2} text={"THE\n[CATCH]"} size={250} accent={P.amber} />
        </Mid>
      </>
    )}
  </Beat>
);

/* ===================================================================== B12 under development: scan build-up */
const B12: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("dev")} b={c("buy")} tin="wipe">
    {(lf, d) => {
      const solid = 0.12 + 0.5 * E.io(lf, 6, d - 6);
      const s = 1.5;
      const cutX = (-MOD_L / 2 + solid * MOD_L) * s;
      const M = useMats();
      return (
        <>
          <Bg f={lf} kind="lab" />
          <Stage cam={{ pos: pathV(lf, [[0, [6, 12, 34]], [d, [-4, 9, 28]]]), target: [0, 2.6, 0], fov: 40 }} light={0.85} rim="#9fffe0">
            <ClipOn />
            <Box p={[0, -0.6, 0]} s={[30, 1.2, 12]} m={M.gunmetal} />
            <Module gen="ddr6" s={s} solid={solid} glow={0.6} label={false} />
            {/* scan laser at the build front */}
            <Box p={[cutX, 3, 0]} s={[0.08, 8, 0.08]} m={useGlow("#7dffd6", 3)} />
            <Glow p={[cutX, 3, 0]} s={10} color="#7dffd6" o={0.6} />
            {[-1, 1].map((sd) => (
              <Cyl key={sd} p={[cutX, 8, sd * 2.4]} rt={0.5} h={1.4} m={M.steel} />
            ))}
          </Stage>
          <Mid y={330}>
            <Chip f={lf} at={4} color="#7dffd6">
              STATUS: IN DEVELOPMENT
            </Chip>
          </Mid>
          <At x={90} y={1150}>
            <div style={{ width: 900, height: 18, borderRadius: 9, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{ width: `${solid * 100}%`, height: "100%", background: "repeating-linear-gradient(45deg, #7dffd6 0 18px, #3fbf99 18px 36px)", backgroundPosition: `${lf * 2}px 0` }} />
            </div>
            <div style={{ marginTop: 14, fontFamily: MONO, fontWeight: 700, fontSize: 28, color: "rgba(244,242,238,0.7)", letterSpacing: 3 }}>STANDARD STILL BEING FINALISED</div>
          </At>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== B13 can't buy it tomorrow (shop card + calendar) */
const B13: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("buy")} b={c("arrive")} tin="whip">
    {(lf) => {
      const flip = c("buy") + 44 - c("buy");
      const fl = E.io(lf, flip, flip + 10);
      const cal = c("tomorrow") - c("buy");
      const calIn = sp(lf, cal - 4, 13, 200);
      const x = lin(lf, cal + 10, cal + 18);
      return (
        <>
          <Bg f={lf} warm={0.14} />
          <Mid y={300}>
            <div style={{ width: 820, padding: 40, borderRadius: 36, background: "linear-gradient(180deg, #1b1e23, #121418)", border: "2px solid rgba(255,255,255,0.08)", boxShadow: "0 40px 90px rgba(0,0,0,0.6)", transform: `translateY(${(1 - E.out(lf, 0, 14)) * 80}px)`, opacity: E.out(lf, 0, 10), textAlign: "left" }}>
              <div style={{ height: 300, borderRadius: 24, background: "radial-gradient(ellipse at 50% 60%, #3a2616, #121316)", position: "relative", overflow: "hidden" }}>
                {/* product illustration: stylised module */}
                <div style={{ position: "absolute", left: 90, top: 115, width: 560, height: 96, borderRadius: 10, background: "linear-gradient(180deg, #3a281a, #1a120c)", border: `3px solid ${GOLD}`, boxShadow: `0 0 40px ${GOLD}55`, transform: "rotate(-6deg)" }}>
                  <div style={{ position: "absolute", left: 20, right: 20, top: 10, height: 8, background: GOLD, borderRadius: 4, boxShadow: `0 0 18px ${GOLD}` }} />
                  <div style={{ position: "absolute", left: 12, right: 12, bottom: -14, height: 14, background: "repeating-linear-gradient(90deg, #e3b450 0 6px, transparent 6px 9px)" }} />
                </div>
              </div>
              <div style={{ marginTop: 28, fontFamily: HEAD, fontWeight: 800, fontSize: 64, color: P.white }}>DDR6 MEMORY KIT</div>
              <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 30, color: "rgba(244,242,238,0.6)" }}>Next-gen desktop RAM · ships: —</div>
              <div style={{ marginTop: 30, height: 110, borderRadius: 22, perspective: 800 }}>
                <div style={{ position: "relative", height: "100%", transformStyle: "preserve-3d", transform: `rotateX(${fl * 180}deg)` }}>
                  <div style={{ position: "absolute", inset: 0, borderRadius: 22, background: P.orange, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontWeight: 800, fontSize: 56, color: "#1a0d04", backfaceVisibility: "hidden" }}>ADD TO CART</div>
                  <div style={{ position: "absolute", inset: 0, borderRadius: 22, background: "#2a2c31", border: `3px solid ${P.coral}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontWeight: 800, fontSize: 56, color: P.coral, transform: "rotateX(180deg)", backfaceVisibility: "hidden" }}>NOT AVAILABLE</div>
                </div>
              </div>
            </div>
          </Mid>
          {lf >= cal - 4 ? (
            <div style={{ position: "absolute", left: 600, top: 1060, transform: `scale(${calIn}) rotate(${6 - 6 * calIn}deg)`, width: 300, borderRadius: 24, overflow: "hidden", background: "#f1ece4", boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>
              <div style={{ background: P.coral, padding: "10px 0", textAlign: "center", fontFamily: MONO, fontWeight: 800, fontSize: 28, color: "#fff", letterSpacing: 3 }}>TOMORROW</div>
              <div style={{ textAlign: "center", fontFamily: HEAD, fontWeight: 800, fontSize: 130, color: "#1a1a1a", lineHeight: 1.1, position: "relative" }}>
                ?
                <svg width={300} height={160} style={{ position: "absolute", left: 0, top: 0 }}>
                  <line x1={40} y1={20} x2={40 + 220 * x} y2={20 + 120 * x} stroke={P.coral} strokeWidth={14} strokeLinecap="round" />
                  <line x1={260} y1={20} x2={260 - 220 * x} y2={20 + 120 * x} stroke={P.coral} strokeWidth={14} strokeLinecap="round" />
                </svg>
              </div>
            </div>
          ) : null}
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== B14 when it arrives: box opens */
const B14: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("arrive")} b={c("cpu")} tin="iris">
    {(lf) => {
      const open = E.out(lf, 4, 18);
      const up = E.out(lf, 12, 34);
      return (
        <>
          <Bg f={lf} warm={0.2 + 0.2 * up} />
          <Stage cam={{ pos: pathV(lf, [[0, [0, 30, 44]], [42, [8, 22, 36]]]), target: [0, 9, 0], fov: 40 }}>
            <Floor9 />
            <ShipBox open={open} p={[0, 0, 0]} />
            <Mod gen="ddr6" p={[0, 6 + up * 10, 0]} r={[0.2, up * 1.4, 0.1]} s={1.15} glow={0.4 + up} phase={lf * 0.2} />
            <Glow p={[0, 9, 0]} s={30 * up} color={GOLD} o={0.4 * up} />
          </Stage>
          <Mid y={330}>
            <Chip f={lf} at={8}>
              ON ARRIVAL…
            </Chip>
          </Mid>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== B15 needs a compatible CPU (memory controller) */
const CpuBig: React.FC<{ lift: number; imc: number }> = ({ lift, imc }) => {
  const M = useMats();
  const g = useGlow(GOLD, 2.4 * imc);
  const substrate = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1f4a33", metalness: 0.3, roughness: 0.5 }), []);
  return (
    <group>
      <Box p={[0, 0.3, 0]} s={[18, 0.6, 18]} m={substrate} />
      {/* dies on the package */}
      <Box p={[-3, 0.9, -2]} s={[6, 0.4, 7]} m={M.silicon} />
      <Box p={[3.5, 0.9, -2]} s={[4.5, 0.4, 7]} m={M.silicon} />
      {/* memory controller block */}
      <Box p={[0, 0.95, 5]} s={[10, 0.5, 3]} m={g} />
      <Box p={[0, 0.9, 5]} s={[10.2, 0.4, 3.2]} m={M.chip} />
      {/* heat spreader lifting off */}
      <group position={[0, 1.8 + lift * 9, 0]} rotation={[lift * 0.35, 0, lift * -0.15]}>
        <RBox s={[16, 1.4, 16]} m={M.alu} rad={0.4} />
      </group>
      {Array.from({ length: 12 }, (_, i) => (
        <Box key={i} p={[-8.6 + (i % 2) * 17.2, 0.62, -7.5 + Math.floor(i / 2) * 3]} s={[0.4, 0.05, 1.6]} m={M.gold} />
      ))}
    </group>
  );
};
const B15: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("cpu")} b={c("mobo") + 9} tin="zoom">
    {(lf) => {
      const lift = E.io(lf, 4, 24);
      const imc = E.out(lf, 20, 32);
      return (
        <>
          <Bg f={lf} warm={0.18} />
          <Stage cam={{ pos: pathV(lf, [[0, [0, 30, 34]], [60, [10, 24, 26]]]), target: [0, 2, 1], fov: 42 }}>
            <CpuBig lift={lift} imc={imc} />
            <Glow p={[0, 2, 5]} s={22} color={GOLD} o={0.4 * imc} />
          </Stage>
          <Mid y={330}>
            <Impact f={lf} at={6} text="NEW [CPU]" size={120} />
          </Mid>
          <Mid y={1150}>
            <Tag f={lf} at={24} size={32}>
              MEMORY CONTROLLER MUST SUPPORT DDR6
            </Tag>
          </Mid>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== B16 new motherboards */
const Board: React.FC<{ gen: "ddr6" | "ddr5"; glow: number }> = ({ gen, glow }) => {
  const M = useMats();
  return (
    <group>
      <Box p={[0, -0.15, 0]} s={[26, 0.3, 30]} m={M.pcb} />
      <Box p={[-5, 0.6, -6]} s={[8, 1.2, 8]} m={M.gunmetal} />
      <Box p={[-5, 1.3, -6]} s={[5, 0.3, 5]} m={M.alu} />
      {[0, 1, 2, 3].map((i) => (
        <Slot key={i} gen={gen} p={[6 + i * 1.4, 0, -4]} r={[0, Math.PI / 2, 0]} s={1} glow={glow} />
      ))}
      <Box p={[-1, 0.5, 9]} s={[22, 1, 1.4]} m={M.plastic} />
      <Box p={[-11.5, 1.4, -2]} s={[2.4, 2.8, 14]} m={M.gunmetal} />
    </group>
  );
};
const B16: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("mobo") + 9} b={c("existing")} tin="whip">
    {(lf) => (
      <>
        <Bg f={lf} warm={0.22} />
        <Stage cam={{ pos: [Math.sin(0.6 + lf * 0.018) * 46, 34, Math.cos(0.6 + lf * 0.018) * 46], target: [0, 0, 0], fov: 40 }}>
          <Board gen="ddr6" glow={E.out(lf, 4, 14)} />
        </Stage>
        <Mid y={330}>
          <Impact f={lf} at={2} text="NEW [MOTHERBOARD]" size={110} />
        </Mid>
        <Mid y={1170}>
          <Chip f={lf} at={10}>
            DDR6 SLOTS
          </Chip>
        </Mid>
      </>
    )}
  </Beat>
);

/* ===================================================================== B17/B18 DDR5 board + DDR6 won't fit */
const B17: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("existing")} b={c("another")} tin="drop">
    {(lf, d) => {
      const m0 = c("magic") - c("existing");
      const tilt = E.io(lf, m0 - 14, m0 + 4);
      const drop = lf < m0 ? 0 : lf - m0;
      // fall from 14 → slot top (1.0 + bump 0.5) at drop 10, bounce back up and settle hovering (it can't seat)
      const y = drop <= 10 ? 14 - 12.5 * Math.pow(drop / 10, 2) : 1.5 + 2.2 * Math.abs(Math.sin((drop - 10) * 0.32)) * Math.exp(-(drop - 10) * 0.08);
      const hit = m0 + 10;
      const [sx, sy] = shake(lf, hit, 0.7);
      const cam: V3 = [sx + 0.001, mix3(42, 9, tilt) + sy, mix3(0.5, 22, tilt)];
      return (
        <>
          <Bg f={lf} warm={0.06} hue={BLUE} />
          <Stage cam={{ pos: cam, target: [mix3(0, 2.4, tilt), mix3(0, 1.2, tilt), 0], fov: 40 }} rim={BLUE}>
            <group position={[-8, 0, 0]} rotation={[0, 0, 0]}>
              <Box p={[8, -0.15, 0]} s={[30, 0.3, 26]} m={useMats().pcb} />
              {[-3, 0, 3].map((z) => (
                <Slot key={z} gen="ddr5" p={[8, 0, z]} glow={0.9} />
              ))}
            </group>
            {lf >= m0 - 2 ? <Module gen="ddr6" p={[0, y, 0]} glow={1} label={false} /> : null}
            {lf >= hit ? <Glow p={[NOTCH.ddr6, 1.3, 0]} s={6} color={P.coral} o={0.9 * (1 - lin(lf, hit + 20, d))} /> : null}
          </Stage>
          <Mid y={330}>
            <Chip f={lf} at={4} color={BLUE}>
              YOUR DDR5 BOARD
            </Chip>
          </Mid>
          {lf >= hit ? (
            <>
              <Sparks f={lf} at={hit} x={600} y={900} n={30} color={P.coral} spread={300} />
              <Mid y={1040}>
                <Stamp f={lf} at={hit + 2} color={P.coral} size={96} rot={-5}>
                  ✕ WON&apos;T FIT
                </Stamp>
              </Mid>
              <At x={90} y={1230}>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, color: "rgba(244,242,238,0.75)", letterSpacing: 2, opacity: lin(lf, hit + 8, hit + 16) }}>DIFFERENT KEY NOTCH · DIFFERENT SLOT</div>
              </At>
            </>
          ) : null}
        </>
      );
    }}
  </Beat>
);
const mix3 = (a: number, b: number, t: number) => a + (b - a) * t;

/* ===================================================================== B19 another problem: alarm */
const B19: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("another")} b={c("waiting")} tin="cut">
    {(lf) => (
      <>
        <Bg f={lf} kind="alarm" />
        <Stage cam={{ pos: [0, 16, 40], target: [0, 5, 0], fov: 40 }} light={0.5} kick="#ff2a2a">
          <Floor9 />
          <Beacon f={lf} s={1.3} />
        </Stage>
        <Mid y={330}>
          <Impact f={lf} at={4} text={"ANOTHER\n[PROBLEM]"} size={170} accent="#ff4a3a" />
        </Mid>
      </>
    )}
  </Beat>
);

/* ===================================================================== B20 waiting: RAM hourglass */
const B20: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("waiting")} b={c("ai")} tin="fade">
    {(lf) => (
      <>
        <Bg f={lf} warm={0.2} hue={P.amber} />
        <Stage cam={{ pos: [Math.sin(lf * 0.012) * 70, 26, Math.cos(lf * 0.012) * 70], target: [0, 17, 0], fov: 38 }}>
          <Floor9 />
          <Hourglass f={lf} />
        </Stage>
        <Mid y={330}>
          <Chip f={lf} at={6} color={P.amber}>
            WAITING FOR FASTER RAM…
          </Chip>
        </Mid>
      </>
    )}
  </Beat>
);

/* ===================================================================== B21 AI data centres: corridor fly-through */
const B21: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("ai")} b={c("enormous")} tin="zoom">
    {(lf) => {
      const z = 30 - lf * 3.2;
      return (
        <>
          <Bg f={lf} kind="cold" />
          <Stage cam={{ pos: [0, 10, z], target: [0, 9, z - 40], fov: 60 }} light={0.7} fog={0.006} fogColor="#060b13" rim={P.cool} kick="#3a7bff">
            <Hall f={lf} aisles={3} len={60} />
          </Stage>
          <Mid y={330}>
            <Impact f={lf} at={4} text="AI [DATA CENTRES]" size={110} accent="#9cc8ff" />
          </Mid>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== B22 RAM vortex into a rack */
const B22: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("enormous")} b={c("pressure")} tin="flash">
    {(lf) => (
      <>
        <Bg f={lf} kind="cold" />
        <Stage cam={{ pos: [0, 18, path(lf, [[0, 92], [44, 76]])], target: [0, 12, 0], fov: 44 }} light={0.9} rim={P.cool} kick="#3a7bff">
          <Rack f={lf} p={[0, 0, 0]} leds={1} seed={3} />
          <Vortex f={lf} p={[0, 0, 0]} pull={E.io(lf, 0, 40)} />
          <Glow p={[0, 12, 4]} s={40} color="#6fa8ff" o={0.35} />
        </Stage>
        <Mid y={330}>
          <Chip f={lf} at={4} color="#9cc8ff">
            MEMORY DEMAND ↑↑↑
          </Chip>
        </Mid>
      </>
    )}
  </Beat>
);

/* ===================================================================== B23 pressure on the industry: press */
const B23: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("pressure")} b={c("means")} tin="wipe">
    {(lf, d) => {
      const down = E.io(lf, 6, d - 10) * 0.62;
      const strain = lin(lf, d * 0.5, d);
      const [sx, sy] = shake(lf, d - 22, 0.6, 22);
      return (
        <>
          <Bg f={lf} warm={0.12 + 0.2 * strain} hue={P.coral} />
          <Stage cam={{ pos: [12 + sx, 26 + sy, 64], target: [0, 16, 0], fov: 42 }}>
            <Floor9 />
            <Press down={down} strain={strain}>
              <Laptop p={[-6, 0, 0]} s={0.32} screen={0.6} />
              <PhoneSlab p={[5, 0, 2]} r={[-Math.PI / 2, 0, 0.3]} s={0.7} screen={0.6} />
              <Console p={[7, 0, -3]} s={0.28} />
              <Mod gen="ddr5" p={[0, 3.2, 3]} r={[Math.PI / 2, 0, 0.2]} s={0.9} glow={0.6} label={false} />
            </Press>
          </Stage>
          <Mid y={330}>
            <Chip f={lf} at={4} color={P.coral}>
              WHOLE INDUSTRY UNDER PRESSURE
            </Chip>
          </Mid>
          <At x={90} y={1170}>
            <div style={{ width: 900, height: 26, borderRadius: 13, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{ width: `${20 + 78 * E.io(lf, 4, d)}%`, height: "100%", background: `linear-gradient(90deg, ${P.amber}, ${P.coral})`, boxShadow: `0 0 30px ${P.coral}` }} />
            </div>
            <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", fontFamily: MONO, fontWeight: 700, fontSize: 26, color: "rgba(244,242,238,0.7)", letterSpacing: 3 }}>
              <span>PCS · PHONES · CONSOLES</span>
              <span style={{ color: P.coral }}>PRESSURE</span>
            </div>
          </At>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== B24 DDR6 performance (illustrative bars) */
const B24: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("means")} b={c("cheaper")} tin="iris">
    {(lf, d) => (
      <>
        <Bg f={lf} warm={0.3} />
        <Stage cam={{ pos: [path(lf, [[0, 18], [d, -14]]), 8, 34], target: [0, 3, 0], fov: 38 }} light={1.1}>
          <Floor9 y={-2} />
          <Mod gen="ddr6" p={[0, 3, 0]} r={[0, -0.3 + lf * 0.006, 0]} s={1.5} glow={1.5} phase={lf * 0.25} />
          {Array.from({ length: 7 }, (_, i) => {
            const h = (4 + i * 2.6) * E.back(lf, 6 + i * 4, 20 + i * 4);
            const x = -15 + i * 5;
            return (
              <group key={i} position={[x, -2, -10]}>
                <Box p={[0, h / 2, 0]} s={[3, Math.max(0.01, h), 3]} m={i > 3 ? useGlow(GOLD, 1.3) : useGlow(BLUE, 0.7)} />
              </group>
            );
          })}
        </Stage>
        <Mid y={330}>
          <Impact f={lf} at={6} text="[IMPRESSIVE] PERFORMANCE" size={96} />
        </Mid>
        <At x={90} y={1180}>
          <Tag f={lf} at={20} size={26}>
            ILLUSTRATIVE · NO BENCHMARK DATA YET
          </Tag>
        </At>
      </>
    )}
  </Beat>
);

/* ===================================================================== B25 won't make today's RAM cheaper */
const B25: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("cheaper")} b={c("question")} tin="whip">
    {(lf, d) => {
      const ram = c("ram") - c("cheaper");
      // the tag sags (hope) then springs back up when "today's RAM" lands
      const sag = lf < ram ? E.io(lf, 6, ram - 4) : 1 - E.back(lf, ram - 4, ram + 10);
      const strike = E.out(lf, ram + 16, ram + 24);
      return (
        <>
          <Bg f={lf} warm={0.16} hue={BLUE} />
          <Stage cam={{ pos: [path(lf, [[0, -10], [d, 8]]), 8, 36], target: [0, 4, 0], fov: 38 }} rim={BLUE}>
            <Floor9 y={-1} />
            <Mod gen="ddr5" p={[0, 2, 0]} r={[0, 0.35, 0]} s={1.5} glow={0.8} />
            <Cyl p={[6.5, 9 - sag * 3.5, 1]} rt={0.05} h={6} m={useMats().steel} />
            <PriceTag p={[6.5, 5.6 - sag * 7, 1.2]} r={[0, -0.3, sag * -0.6]} s={1.2} />
          </Stage>
          <Mid y={330}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <Impact f={lf} at={4} text="[CHEAPER] RAM?" size={130} />
              <div style={{ position: "absolute", left: -20, top: "52%", height: 16, width: `${strike * 110}%`, background: P.coral, borderRadius: 8, transform: "rotate(-4deg)", boxShadow: `0 0 30px ${P.coral}` }} />
            </div>
          </Mid>
          <At x={90} y={1180}>
            <Tag f={lf} at={8} size={26}>
              ILLUSTRATIVE · NOT A PRICE FORECAST
            </Tag>
          </At>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== B26 the real question */
const B26: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("question")} b={c("faster")} tin="cut">
    {(lf) => {
      const lit = E.out(lf, 2, 14);
      return (
        <>
          <Bg f={lf} kind="void" />
          <AbsoluteFill style={{ background: `radial-gradient(ellipse 45% 32% at 50% 38%, rgba(255,200,150,${0.22 * lit}), transparent 70%)` }} />
          <Stage cam={{ pos: [0, 4, 70], target: [0, 4, 0], fov: 40 }} light={lit}>
            <QMark p={[0, 6, 0]} r={[0, Math.sin(lf * 0.06) * 0.6, 0]} glow={lit} />
          </Stage>
          <Mid y={300}>
            <Chip f={lf} at={6} color={P.amber}>
              THE REAL QUESTION
            </Chip>
          </Mid>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== B27/B28 split: faster DDR6 vs affordable DDR5 */
const Half: React.FC<{ top: boolean; open: number; children: React.ReactNode }> = ({ top, open, children }) => (
  <div style={{ position: "absolute", left: 0, width: SW, top: top ? 0 : 960, height: 960, overflow: "hidden", clipPath: top ? `inset(${(1 - open) * 100}% 0 0 0)` : `inset(0 0 ${(1 - open) * 100}% 0)` }}>
    <div style={{ position: "absolute", left: 0, top: top ? 0 : -960, width: SW, height: 1920 }}>{children}</div>
  </div>
);
const B27: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("faster")} b={c("because")} tin="cut">
    {(lf) => {
      const fa = c("faster") + 29 - c("faster");
      const af = c("aff") - c("faster");
      const buy = c("actually") - c("faster");
      return (
        <>
          <Bg f={lf} kind="void" />
          <Half top open={E.io(lf, 0, 12)}>
            <Bg f={lf} warm={0.35} />
            <Stage cam={{ pos: [0, 1, 28], target: [0, 10.5, 0], fov: 34 }} light={1.1}>
              <Mod gen="ddr6" p={[0, 12, 0]} r={[0.15, -0.4 + lf * 0.01, 0.12]} s={1.3} glow={1.4} phase={lf * 0.25} />
            </Stage>
            <At x={70} y={660}>
              <Impact f={lf} at={fa} text="⚡ [FASTER]" size={120} />
            </At>
            <At x={70} y={250}>
              <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 70, color: GOLD, opacity: E.out(lf, 6, 14) }}>DDR6</div>
            </At>
          </Half>
          <Half top={false} open={E.io(lf, af - 6, af + 6)}>
            <Bg f={lf} warm={0.28} hue="#2a6aff" />
            <Stage cam={{ pos: [0, -1, 28], target: [0, -10.5, 0], fov: 34 }} light={1} rim={BLUE}>
              <Mod gen="ddr5" p={[0, -10, 0]} r={[0.15, 0.4 - lf * 0.01, -0.12]} s={1.3} glow={1} />
            </Stage>
            <At x={70} y={1500}>
              <Impact f={lf} at={af + 6} text="💰 [AFFORDABLE]" size={110} accent={BLUE} />
            </At>
            <At x={70} y={1090}>
              <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 70, color: BLUE, opacity: E.out(lf, af, af + 8) }}>DDR5</div>
            </At>
            <At x={640} y={1090}>
              <Tag f={lf} at={buy + 10} color="#7fe0a0" size={30} icon="✔">
                IN STOCK
              </Tag>
            </At>
          </Half>
          <div style={{ position: "absolute", left: 0, top: 956, width: SW * E.io(lf, af - 6, af + 6), height: 8, background: `linear-gradient(90deg, ${GOLD}, ${BLUE})`, boxShadow: "0 0 30px rgba(255,255,255,0.4)" }} />
          <div style={{ position: "absolute", left: 470, top: 900, width: 140, height: 120, borderRadius: 70, background: "#0b0c0e", border: "4px solid rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontWeight: 800, fontSize: 64, color: "#fff", transform: `scale(${sp(lf, af - 2, 12, 260)})` }}>OR</div>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== B29 the balance tips to DDR5 + final reveal */
const B29: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("because")} b={VO_FRAMES} tin="zoom">
    {(lf) => {
      const sec = c("second") - c("because");
      const tilt = lf < sec ? Math.sin(lf * 0.12) * 0.25 : 0.25 * Math.cos((lf - sec) * 0.5) * Math.exp(-(lf - sec) * 0.12) + E.back(lf, sec, sec + 14) * 1;
      return (
        <>
          <Bg f={lf} warm={0.24} />
          <Stage cam={{ pos: [0, 30, path(lf, [[0, 100], [90, 88]])], target: [0, 18, 0], fov: 40 }}>
            <Floor9 />
            <Balance tilt={tilt} s={1.1} left={<Mod gen="ddr6" p={[0, 1.2, 0]} r={[0, 0, 0]} s={0.7} glow={1} label={false} />} right={<Mod gen="ddr5" p={[0, 1.2, 0]} s={0.7} glow={1} label={false} />} />
          </Stage>
          <At x={80} y={1150}>
            <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 64, color: GOLD }}>DDR6</div>
          </At>
          <At x={780} y={1150}>
            <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 64, color: BLUE }}>DDR5</div>
          </At>
          <Mid y={300}>
            <Impact f={lf} at={sec + 4} text={"GAMERS NEED\n[DDR5] MORE"} size={130} accent={BLUE} />
          </Mid>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== end card: comment question */
const End: React.FC<F> = ({ f }) => (
  <Beat f={f} a={VO_FRAMES} b={VO_FRAMES + 200} tin="flash">
    {(lf) => (
      <>
        <Bg f={lf} warm={0.3} />
        <Mid y={520}>
          <Impact f={lf} at={0} text={"[DDR6] OR\nDDR5?"} size={200} />
        </Mid>
        <Mid y={1000}>
          <div style={{ display: "flex", gap: 30, transform: `scale(${sp(lf, 8, 12, 220)})` }}>
            <div style={{ padding: "22px 34px", borderRadius: 20, border: `4px solid ${GOLD}`, fontFamily: HEAD, fontWeight: 800, fontSize: 52, color: GOLD, background: "rgba(10,11,13,0.8)" }}>⚡ FASTER</div>
            <div style={{ padding: "22px 34px", borderRadius: 20, border: `4px solid ${BLUE}`, fontFamily: HEAD, fontWeight: 800, fontSize: 52, color: BLUE, background: "rgba(10,11,13,0.8)" }}>💰 AFFORDABLE</div>
          </div>
        </Mid>
        <Mid y={1230}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, letterSpacing: 5, color: P.white, opacity: E.out(lf, 16, 26), transform: `translateY(${Math.sin(lf * 0.25) * 6}px)` }}>COMMENT BELOW 👇</div>
        </Mid>
      </>
    )}
  </Beat>
);

/* ===================================================================== picture */
export const Picture: React.FC<F> = ({ f }) => (
  <AbsoluteFill>
    <B1 f={f} />
    <B2 f={f} />
    <B3 f={f} />
    <B4 f={f} />
    <B5 f={f} />
    <B7 f={f} />
    <B8 f={f} />
    <B11 f={f} />
    <B12 f={f} />
    <B13 f={f} />
    <B14 f={f} />
    <B15 f={f} />
    <B16 f={f} />
    <B17 f={f} />
    <B19 f={f} />
    <B20 f={f} />
    <B21 f={f} />
    <B22 f={f} />
    <B23 f={f} />
    <B24 f={f} />
    <B25 f={f} />
    <B26 f={f} />
    <B27 f={f} />
    <B29 f={f} />
    <End f={f} />
  </AbsoluteFill>
);
/** Beat start frames (for QC sheet + scene previews). */
export const BEAT_STARTS = (): number[] =>
  [0, c("pc"), c("stuck"), c("gen"), c("perf"), c("serious"), c("called"), c("std"), c("pct"), c("bw"), c("catch"), c("dev"), c("buy"), c("tomorrow"), c("arrive"), c("cpu"), c("mobo") + 9, c("existing"), c("magic"), c("another"), c("waiting"), c("ai"), c("enormous"), c("pressure"), c("means"), c("cheaper"), c("question"), c("faster"), c("aff"), c("because"), c("second"), VO_FRAMES];
export { Particles };
