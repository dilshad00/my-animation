/**
 * SH-GPU64 beats — "China's 64GB GPU: NVIDIA's new competitor?". Every beat explains its narration line.
 * Facts on screen: 64GB = UNCONFIRMED ESTIMATE (4× the MTT S80's 16GB); 15×/50× = company claims vs MTT S80;
 * RTX 5090 = 32GB GDDR7; reveal expected at the MUSA Developer Conference (Dec 29, Beijing).
 * The Lushan card is a speculative concept model, the 5090-style card is generic (no logos).
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { E, HEAD, lin, MetalType, MONO, sp, Stamp, Tag } from "../../ug6/Look6";
import { FeCard, Glow, hash, P, Particles, Stage, useMats } from "../../ug6/Three6";
import { Tower } from "../../ug6/World6";
import { At, Beat, Bg, Chip, cueFn, Impact, Mid, path, shake, SW } from "../engine/Engine";
import { AMB, Cloth, GbTower, GpuBoard, LightCone, LU_L, LU_W, LushanConcept, OR, TestStand } from "./Assets";
import { CUE, VO_FRAMES } from "./data";

export const c = cueFn(CUE);
type F = { f: number };
const COOL = "#cfe0ff";
const RED = P.coral;

/* ===================================================================== helpers */
const Floor: React.FC<{ y?: number }> = ({ y = 0 }) => {
  const M = useMats();
  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} material={M.floor}>
      <circleGeometry args={[180, 64]} />
    </mesh>
  );
};
const Motes: React.FC<{ f: number; n?: number; spread?: number; y?: number; color?: string }> = ({ f, n = 80, spread = 50, y = 10, color = "#ffd7a8" }) => (
  <Particles
    n={n}
    color={color}
    k={0.9}
    fn={(i) => ({ p: [(hash(i) - 0.5) * spread, y + (hash(i * 3) - 0.5) * spread * 0.8 + Math.sin(f * 0.02 + i) * 0.6, (hash(i * 7) - 0.5) * spread * 0.6], s: 0.06 + 0.07 * hash(i * 11) })}
  />
);
/** Low smoke: big soft glow sprites drifting along the floor. */
const Smoke: React.FC<{ f: number; y?: number; color?: string; o?: number; n?: number }> = ({ f, y = 0, color = "#8a7060", o = 0.12, n = 9 }) => (
  <>
    {Array.from({ length: n }, (_, i) => (
      <Glow key={i} p={[((hash(i) - 0.5) * 70 + f * 0.05 * (i % 2 ? 1 : -1)) % 45, y + 1 + hash(i * 5) * 3, (hash(i * 9) - 0.5) * 30]} s={22 + 14 * hash(i * 2)} color={color} o={o} />
    ))}
  </>
);
/** Card standing upright, fans facing the camera (+Z). Length runs vertically. */
const Upright: React.FC<{ p?: [number, number, number]; ry?: number; rz?: number; s?: number; children: React.ReactNode }> = ({ p = [0, 0, 0], ry = 0, rz = 0, s = 1, children }) => (
  <group position={p} rotation={[0, ry, rz]} scale={s}>
    <group rotation={[0, 0, Math.PI / 2]}>
      <group rotation={[Math.PI / 2, 0, 0]}>{children}</group>
    </group>
  </group>
);
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
/** Card label (screen space): name + spec line. */
const CardLabel: React.FC<{ f: number; at: number; x: number; y: number; name: string; spec: string; color?: string; w?: number; align?: "left" | "center" }> = ({ f, at, x, y, name, spec, color = AMB, w = 440, align = "center" }) => {
  const k = E.out(f, at, at + 12);
  if (k <= 0) return null;
  return (
    <At x={x} y={y} w={w} style={{ textAlign: align, opacity: k, transform: `translateY(${(1 - k) * 20}px)` }}>
      <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 56, color: P.white, lineHeight: 1, textShadow: "0 4px 20px #000" }}>{name}</div>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, color, letterSpacing: 3, marginTop: 6, textShadow: "0 2px 10px #000" }}>{spec}</div>
    </At>
  );
};
const Note: React.FC<{ f: number; at: number; y?: number; children: React.ReactNode; color?: string }> = ({ f, at, y = 1250, children, color = AMB }) => (
  <Mid y={y}>
    <Tag f={f} at={at} size={26} color={color}>
      {children}
    </Tag>
  </Mid>
);

/* ===================================================================== S1 hook: 5090-style card → mystery card → 64GB */
const B1: React.FC<F> = ({ f }) => (
  <Beat f={f} a={0} b={c("double")} tin="cut">
    {(lf, d) => {
      const k = c("vram") - 14;
      const inn = E.out(lf, 30, 50);
      const [sx, sy] = shake(lf, k, 1.2);
      return (
        <>
          <Bg f={lf} kind="void" />
          <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 40% at 60% 45%, ${OR}${Math.round(40 * inn).toString(16).padStart(2, "0")}, transparent 70%)` }} />
          <Stage cam={{ pos: [sx + path(lf, [[0, 6], [d, 0]]), 4 + sy, path(lf, [[0, 120], [50, 52], [d, 74]])], target: [0, 1, 0], fov: 38 }} light={0.4 + 0.8 * E.out(lf, 0, 6)} rim={COOL} kick={OR}>
            <Upright p={[-8.6 * inn, 0, 0]} ry={0.25 * inn + lf * 0.004} s={0.9}>
              <FeCard cls="90" spin={lf * 0.5} light={1} />
            </Upright>
            <Upright p={[path(lf, [[30, 46], [50, 8.6]]), 0, 0]} ry={-0.25} s={0.9}>
              <LushanConcept spin={lf * 0.6} light={inn} />
            </Upright>
            <Glow p={[8.6, 0, 2]} s={30} color={OR} o={0.35 * inn} />
            <Motes f={lf} spread={60} y={0} />
          </Stage>
          <Mid y={300}>
            <Chip f={lf} at={4} size={28}>
              CHINA · NEW GAMING GPU
            </Chip>
          </Mid>
          <Mid y={1040}>
            <div style={{ transform: `scale(${lf >= k ? 1.5 - 0.5 * sp(lf, k, 10, 260) : 0})` }}>
              <MetalType f={lf} at={k} size={300} sweepAt={k + 4} tint="#ffd9a6">
                64GB
              </MetalType>
            </div>
          </Mid>
          <Sparks f={lf} at={k} x={540} y={1150} n={40} />
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== DOUBLE the memory of an RTX 5090 */
const B2: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("double")} b={c("card")} tin="flash">
    {(lf, d) => {
      const r = c("rtx") - c("double");
      const [sx, sy] = shake(lf, 6, 0.8);
      return (
        <>
          <Bg f={lf} warm={0.22} />
          <Stage cam={{ pos: [sx, 3 + sy, path(lf, [[0, 86], [d, 76]])], target: [0, 1, 0], fov: 40 }} light={1.1} rim={COOL} kick={OR}>
            <Upright p={[-8.8, 0, 0]} ry={0.3} s={0.85}>
              <FeCard cls="90" spin={lf * 0.4} />
            </Upright>
            <Upright p={[8.8, 0, 0]} ry={-0.3} s={0.85}>
              <LushanConcept spin={lf * 0.6} />
            </Upright>
            <Floor y={-17} />
          </Stage>
          <Mid y={300}>
            <Impact f={lf} at={2} text={"[2X] RTX 5090\nVRAM?"} size={130} />
          </Mid>
          <Mid y={620}>
            <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 260, color: AMB, transform: `scale(${sp(lf, 6, 9, 260)})`, textShadow: `0 0 60px ${OR}` }}>×2</div>
          </Mid>
          <CardLabel f={lf} at={r} x={30} y={1150} name="RTX 5090" spec="32GB GDDR7" color={COOL} />
          <CardLabel f={lf} at={r + 6} x={560} y={1150} name="LUSHAN" spec="64GB?" />
          <Note f={lf} at={r + 10} y={1300}>
            64GB = UNCONFIRMED ESTIMATE
          </Note>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== "A 64GB graphics card." — hero orbit */
const B3: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("card")} b={c("twice")} tin="zoom">
    {(lf, d) => {
      const a = 0.8 + lf * 0.025;
      return (
        <>
          <Bg f={lf} kind="void" />
          <AbsoluteFill style={{ background: `radial-gradient(ellipse 50% 35% at 50% 52%, rgba(255,170,90,0.18), transparent 70%)` }} />
          <Stage cam={{ pos: [Math.sin(a) * 40, path(lf, [[0, 26], [d, 16]]), Math.cos(a) * 40], target: [0, 0, 0], fov: 40 }} light={1.15} rim={COOL} kick={OR} keyPos={[0, 40, 6]}>
            <LushanConcept p={[0, 2, 0]} r={[0.12, 0, 0.05]} spin={lf * 0.7} />
            <LightCone p={[0, 40, 0]} h={42} r={18} o={0.05} />
            <Floor y={-3} />
            <Smoke f={lf} y={-3} />
            <Motes f={lf} spread={60} y={8} />
          </Stage>
          <Mid y={300}>
            <MetalType f={lf} at={1} size={250} sweepAt={6} tint="#ffd9a6">
              64GB
            </MetalType>
          </Mid>
          <Mid y={550}>
            <Chip f={lf} at={8}>
              GRAPHICS CARD
            </Chip>
          </Mid>
          <Note f={lf} at={10} y={1250} color="rgba(244,242,238,0.8)">
            CONCEPT VISUALIZATION · NOT THE REAL CARD
          </Note>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== twice the VRAM: 32 vs 64 GB towers */
const B4: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("twice")} b={c("claims")} tin="wipe">
    {(lf, d) => {
      const pw = c("powerful") - c("twice");
      const L = 32 * E.io(lf, 2, 22);
      const R = 64 * E.io(lf, 8, 40);
      return (
        <>
          <Bg f={lf} warm={0.2} />
          <Stage cam={{ pos: [path(lf, [[0, -8], [d, 6]]), path(lf, [[0, 5], [d, 10]]), 58], target: [0, 10, 0], fov: 40 }} light={1.1} rim={COOL} kick={OR}>
            <Floor y={0} />
            <GbTower n={32} shown={L} cols={2} p={[-6, 0, 0]} s={1.05} color={COOL} spin={0.5} />
            <GbTower n={64} shown={R} cols={2} p={[6, 0, 0]} s={1.05} color={AMB} spin={-0.5} />
            <Glow p={[6, 8, 0]} s={26} color={OR} o={0.2 * (R / 64)} />
          </Stage>
          <Mid y={300}>
            <Impact f={lf} at={1} text="[TWICE] THE VRAM" size={120} />
          </Mid>
          <At x={60} y={500} w={420} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 110, color: COOL, opacity: E.out(lf, 4, 12) }}>{Math.round(L)}GB</div>
          </At>
          <At x={600} y={420} w={420} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 130, color: AMB, textShadow: `0 0 40px ${OR}`, opacity: E.out(lf, 8, 16) }}>
              {Math.round(R)}GB<span style={{ fontSize: 80 }}>?</span>
            </div>
          </At>
          <CardLabel f={lf} at={pw - 6} x={40} y={1250} name="RTX 5090" spec="NVIDIA'S TOP GAMING GPU" color={COOL} w={480} />
          <CardLabel f={lf} at={14} x={570} y={1250} name="LUSHAN" spec="UNCONFIRMED" w={460} />
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== performance claims: insane */
const B5: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("claims")} b={c("interesting")} tin="whip">
    {(lf, d) => {
      const ins = c("insane") - c("claims");
      const surge = E.out(lf, ins - 4, ins + 6);
      const [sx, sy] = shake(lf, ins, 1.4, 20);
      return (
        <>
          <Bg f={lf} warm={0.2 + 0.25 * surge} />
          <Stage cam={{ pos: [6 + sx, -4 + sy, path(lf, [[0, 46], [d, 36]])], target: [0, 0, 0], fov: 42, roll: -0.08 + 0.05 * surge }} light={1 + 0.4 * surge} rim={COOL} kick={OR}>
            <Upright p={[0, 2, 0]} ry={-0.45 + lf * 0.01} s={1}>
              <LushanConcept spin={lf * (0.3 + 1.5 * surge)} light={0.6 + 1.4 * surge} />
            </Upright>
            <Particles n={60} color={AMB} k={2.5} fn={(i) => ({ p: [(hash(i) - 0.5) * 30, ((lf * (0.4 + hash(i * 3)) + i * 3) % 40) - 18, (hash(i * 5) - 0.5) * 10 + 4], s: 0.1 * surge })} />
          </Stage>
          <Mid y={300}>
            <Chip f={lf} at={2}>
              PERFORMANCE CLAIMS
            </Chip>
          </Mid>
          <Mid y={380}>
            <Impact f={lf} at={ins} text="[INSANE]" size={210} />
          </Mid>
          <Sparks f={lf} at={ins} x={540} y={800} n={44} spread={520} />
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== here's where it gets interesting: the draped card */
const B6: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("interesting")} b={c("figure")} tin="iris">
    {(lf, d) => (
      <>
        <Bg f={lf} kind="void" />
        <Stage cam={{ pos: [path(lf, [[0, 14], [d, 6]]), path(lf, [[0, 22], [d, 16]]), path(lf, [[0, 52], [d, 40]])], target: [0, 1, 0], fov: 40 }} light={0.9} rim={COOL} kick={OR} keyPos={[0, 40, 4]}>
          <LushanConcept p={[0, 2.3, 0]} light={0} />
          <Cloth w={LU_L + 0.6} d={LU_W + 0.6} h={4.8} lift={0} f={lf} drop={4} />
          <LightCone p={[0, 42, 0]} h={44} r={20} o={0.06} />
          <Floor y={0} />
          <Smoke f={lf} y={0} o={0.1} />
          <Motes f={lf} spread={50} y={10} />
        </Stage>
        <Mid y={300}>
          <Impact f={lf} at={2} text={"HERE'S WHERE IT GETS\n[INTERESTING]"} size={100} />
        </Mid>
      </>
    )}
  </Beat>
);

/* ===================================================================== 64GB figure isn't officially confirmed */
const B7: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("figure")} b={c("based")} tin="glitch">
    {(lf, d) => {
      const nc = c("confirmed") - c("figure");
      return (
        <>
          <Bg f={lf} kind="blueprint" />
          <Stage cam={{ pos: [path(lf, [[0, -4], [d, 4]]), 30, 18], target: [0, 0, 0], fov: 40 }} light={1} rim={COOL} kick={OR}>
            <GpuBoard r={[0, 0.2, 0]} s={1} chip={(i) => (hash(i * 13 + Math.floor(lf / 3)) > 0.5 ? 1 : 0)} die={0.6} />
          </Stage>
          <Mid y={300}>
            <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 230, color: AMB, textShadow: `0 0 50px ${OR}`, opacity: E.out(lf, 0, 6) }}>
              64GB<span style={{ color: P.white }}>?</span>
            </div>
          </Mid>
          {lf >= nc ? (
            <Mid y={1080}>
              <Stamp f={lf} at={nc} color={RED} size={70} rot={-5}>
                NOT OFFICIALLY CONFIRMED
              </Stamp>
            </Mid>
          ) : null}
          <Note f={lf} at={8} y={1260} color="#9cc8ff">
            MEMORY LAYOUT ILLUSTRATIVE
          </Note>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== estimate: 16GB × 4 = 64GB */
const B8: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("based")} b={c("moore")} tin="wipe">
    {(lf, d) => {
      const s4 = c("suggesting") - c("based");
      const pv = c("previous") - c("based");
      const grow = E.io(lf, pv + 16, Math.min(d - 6, pv + 50));
      const shown = 16 * E.out(lf, 4, 22) + 48 * grow;
      const done = grow >= 1;
      const [sx, sy] = shake(lf, Math.min(d - 6, pv + 50), 0.8);
      return (
        <>
          <Bg f={lf} warm={0.22} />
          <Stage cam={{ pos: [14 + sx, 15 + sy, 28], target: [0, -1.5, 0], fov: 40 }} light={1.1} rim={COOL} kick={OR}>
            <Floor y={0} />
            <GbTower n={64} shown={shown} cols={4} p={[0, 0, 0]} s={1.25} color={AMB} solidN={16} spin={lf * 0.006} />
            <Glow p={[0, 3, 0]} s={20} color={OR} o={0.25 * grow} />
          </Stage>
          <Mid y={300}>
            <Chip f={lf} at={2}>
              BASED ON EARLIER COMPANY CLAIMS
            </Chip>
          </Mid>
          <Mid y={1050}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 26, fontFamily: HEAD, fontWeight: 800, fontSize: 118, color: P.white, textShadow: "0 6px 30px #000" }}>
              <span style={{ opacity: E.out(lf, 4, 12), color: lf >= pv ? AMB : P.white }}>16GB</span>
              <span style={{ color: AMB, opacity: E.out(lf, s4, s4 + 8), transform: `scale(${lf >= s4 ? 1.6 - 0.6 * sp(lf, s4, 10, 260) : 1})`, display: "inline-block" }}>×4</span>
              <span style={{ color: AMB, opacity: lf < s4 ? 0 : done ? 1 : 0.2 + 0.3 * grow, textShadow: done ? `0 0 40px ${OR}` : undefined }}>= 64GB</span>
            </div>
          </Mid>
          <At x={60} y={1190} w={960} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, color: "rgba(244,242,238,0.8)", letterSpacing: 2, opacity: E.out(lf, 8, 18) }}>
              MTT S80 · 16GB GDDR6 &nbsp;→&nbsp; &quot;4×&quot; MEMORY CLAIM
            </div>
          </At>
          <Note f={lf} at={pv + 10} y={1280}>
            ESTIMATE · NOT AN OFFICIAL SPEC
          </Note>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== Moore Threads reveal: cloth pulled off */
const B9: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("moore")} b={c("talked")} tin="cut">
    {(lf, d) => {
      const lift = E.io(lf, 2, 26);
      const amb = c("ambitious") - c("moore");
      return (
        <>
          <Bg f={lf} kind="void" />
          <AbsoluteFill style={{ background: `radial-gradient(ellipse 55% 35% at 50% 55%, rgba(255,150,70,${0.25 * lift}), transparent 70%)` }} />
          <Stage cam={{ pos: [path(lf, [[0, 8], [d, -8]]), path(lf, [[0, 16], [d, 20]]), path(lf, [[0, 40], [d, 34]])], target: [0, 1, 0], fov: 40 }} light={0.8 + 0.4 * lift} rim={COOL} kick={OR} keyPos={[0, 40, 4]}>
            <LushanConcept p={[0, 2.3, 0]} light={lift} spin={lf * 0.5 * lift} />
            <Cloth w={LU_L + 0.6} d={LU_W + 0.6} h={4.8} lift={lift} f={lf} drop={4} />
            <LightCone p={[0, 42, 0]} h={44} r={20} o={0.06} />
            <Floor y={0} />
            <Smoke f={lf} y={0} o={0.1} />
          </Stage>
          <Mid y={300}>
            <MetalType f={lf} at={10} size={150} sweepAt={16}>
              MOORE THREADS
            </MetalType>
          </Mid>
          <Mid y={470}>
            <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 120, letterSpacing: 18, color: AMB, textShadow: `0 0 40px ${OR}`, opacity: E.out(lf, 20, 30), transform: `scale(${1.2 - 0.2 * E.out(lf, 20, 30)})` }}>LUSHAN</div>
          </Mid>
          <Mid y={1110}>
            <Chip f={lf} at={amb}>
              SERIOUSLY AMBITIOUS CLAIMS
            </Chip>
          </Mid>
          <Note f={lf} at={24} y={1240} color="rgba(244,242,238,0.8)">
            CONCEPT ART · NOT THE OFFICIAL DESIGN
          </Note>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== 15× gaming, 50× ray tracing (claimed vs MTT S80) */
const Bar: React.FC<{ f: number; at: number; label: string; x: number; color: string; y: number }> = ({ f, at, label, x, color, y }) => {
  const k = E.io(f, at, at + 26);
  const v = 1 + (x - 1) * k;
  return (
    <At x={70} y={y} w={940} style={{ opacity: E.out(f, at - 6, at) }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: "rgba(244,242,238,0.85)" }}>{label}</span>
        <span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 120, color, textShadow: `0 0 40px ${color}88`, lineHeight: 1 }}>{Math.round(v)}X</span>
      </div>
      <div style={{ height: 30, borderRadius: 15, background: "rgba(255,255,255,0.08)", marginTop: 8, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(v / 50) * 100}%`, minWidth: 18, borderRadius: 15, background: `linear-gradient(90deg, #9cc8ff, ${color})`, boxShadow: `0 0 30px ${color}` }} />
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, color: "#9cc8ff", letterSpacing: 2, marginTop: 6 }}>1X = MTT S80</div>
    </At>
  );
};
const B10: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("talked")} b={c("confuse")} tin="flash">
    {(lf, d) => {
      const g = c("gaming") - c("talked");
      const r = c("ray") - c("talked");
      const o = c("older") - c("talked");
      const morph = E.io(lf, 0, 22);
      return (
        <>
          <Bg f={lf} kind="blueprint" />
          <Stage cam={{ pos: [Math.sin(lf * 0.012) * 18, 8, 46], target: [0, 1, 0], fov: 40 }} light={1} rim={COOL} kick={OR}>
            <Upright p={[0, 7.5, 0]} ry={-0.3 + lf * 0.008} s={0.5 * (1 - morph) + 0.0001}>
              <FeCard cls="70" spin={lf * 0.3} lightColor="#9cc8ff" />
            </Upright>
            <Upright p={[0, 7.5, 0]} ry={-0.3 + lf * 0.008} s={0.0001 + 0.52 * morph}>
              <LushanConcept spin={lf * 0.8} light={0.6 + 0.6 * lin(lf, r, r + 20)} />
            </Upright>
            <Particles n={70} color={AMB} k={2.5} fn={(i) => (morph > 0 && morph < 1 ? { p: [(hash(i) - 0.5) * 30 * morph, (hash(i * 3) - 0.5) * 30, (hash(i * 5) - 0.5) * 10], s: 0.25 * (1 - Math.abs(morph - 0.5) * 2) } : null)} />
            {/* ray-tracing light rays */}
            <Particles n={40} color="#ffffff" k={3} fn={(i) => (lf > r ? { p: [-20 + ((lf * 1.4 + i * 7) % 40), 12 - (i % 8) * 3, -6 + (i % 5)], s: 0.12 } : null)} />
          </Stage>
          <Mid y={300}>
            <Tag f={lf} at={2} size={28}>
              COMPANY CLAIMS · VS MTT S80
            </Tag>
          </Mid>
          <Bar f={lf} at={g} label="GAMING" x={15} color={AMB} y={830} />
          <Bar f={lf} at={r} label="RAY TRACING" x={50} color={OR} y={1060} />
          {lf >= o ? (
            <At x={70} y={360} w={940} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, color: "#9cc8ff", letterSpacing: 3, opacity: E.out(lf, o, o + 10) }}>BASELINE: OLDER MTT S80 · NOT RTX 5090</div>
            </At>
          ) : null}
          {void d}
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== not an RTX 5090 benchmark */
const B11: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("confuse")} b={c("know")} tin="glitch">
    {(lf, d) => {
      const bm = c("bench") - c("confuse");
      const strike = E.out(lf, bm - 4, bm + 6);
      return (
        <>
          <Bg f={lf} kind="cold" />
          <Stage cam={{ pos: [path(lf, [[0, -10], [d, -4]]), 4, 50], target: [-4, 0, 0], fov: 40 }} light={1} rim={COOL} kick="#3a7bff">
            <Upright p={[-6, -2, -6]} ry={0.5} s={0.95}>
              <FeCard cls="90" spin={lf * 0.3} />
            </Upright>
          </Stage>
          <Mid y={300}>
            <Impact f={lf} at={2} text="DON'T [CONFUSE] THESE" size={110} accent="#9cc8ff" />
          </Mid>
          <Mid y={520}>
            <div style={{ position: "relative", fontFamily: HEAD, fontWeight: 800, fontSize: 86, color: P.white, lineHeight: 1.05, textAlign: "center", opacity: E.out(lf, 6, 14) }}>
              15X / 50X FASTER
              <br />
              THAN AN RTX 5090
              <div style={{ position: "absolute", left: -20, right: -20, top: "50%", height: 14, borderRadius: 7, background: RED, transform: `rotate(-6deg) scaleX(${strike})`, boxShadow: `0 0 30px ${RED}` }} />
            </div>
          </Mid>
          {lf >= bm + 4 ? (
            <Mid y={1080}>
              <Stamp f={lf} at={bm + 4} color={RED} size={64} rot={-4}>
                ✕ NOT A 5090 BENCHMARK
              </Stamp>
            </Mid>
          ) : null}
          <Note f={lf} at={bm + 12} y={1240} color="#9cc8ff">
            NO INDEPENDENT LUSHAN BENCHMARKS YET
          </Note>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== reality check: unknowns (lab) */
const QS: [string, string][] = [
  ["know", "FINAL SPECS?"],
  ["price", "FINAL PRICE?"],
  ["realg", "REAL GAMING PERFORMANCE?"],
  ["drivers", "DRIVER COMPATIBILITY?"],
];
const B12: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("know")} b={c("reveal")} tin="fade">
    {(lf, d) => {
      const scan = (lf * 0.35) % 18;
      return (
        <>
          <Bg f={lf} kind="lab" />
          <Stage cam={{ pos: [path(lf, [[0, 24], [d, 16]]), 26, path(lf, [[0, 44], [d, 40]])], target: [0, 2, 0], fov: 40 }} light={0.95} rim="#9fe8ff" kick={OR}>
            <TestStand p={[0, 0, 0]} probe={0.6 + 0.4 * Math.sin(lf * 0.3)} />
            <LushanConcept p={[0, 8.6, -1]} r={[0.25, 0, 0]} s={0.85} spin={lf * 0.15} light={0.5} />
            <Glow p={[-16 + scan * 1.8, 9, 3]} s={6} color="#7fe0ff" o={0.7} />
          </Stage>
          <Mid y={300}>
            <Impact f={lf} at={2} text="WE STILL [DON'T KNOW]" size={110} accent="#7fe0ff" />
          </Mid>
          <At x={70} y={830} style={{ padding: "26px 34px 12px", borderRadius: 24, background: "rgba(8,12,14,0.84)", border: "2px solid rgba(127,224,255,0.4)" }}>
            {QS.map(([k, t]) => {
              const at = c(k) - c("know") + (k === "know" ? 4 : 0);
              const a = E.out(lf, at, at + 8);
              return (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 14, opacity: 0.12 + 0.88 * a, transform: `translateX(${(1 - a) * -30}px)` }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, border: `4px solid ${a > 0.5 ? AMB : "#7fe0ff"}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: HEAD, fontWeight: 800, color: AMB, fontSize: 32 }}>?</div>
                  <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 52, color: P.white }}>{t}</div>
                </div>
              );
            })}
          </At>
          <Note f={lf} at={c("drivers") - c("know") + 14} y={1310} color="#7fe0ff">
            MORE VRAM ≠ MORE FPS
          </Note>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== reveal: December 29 */
const MONTHS = ["JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const B13: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("reveal")} b={c("ifchina")} tin="iris">
    {(lf, d) => {
      const dc = c("december") - c("reveal");
      const flip = Math.min(MONTHS.length - 1, Math.floor(lin(lf, dc - 14, dc + 4) * (MONTHS.length - 1) + 0.0001));
      const day = lf < dc ? 1 + Math.floor(lin(lf, 0, dc) * 27) : 29;
      const landed = lf >= dc + 4;
      const shrink = E.io(lf, dc + 30, dc + 46);
      const orb = 0.3 + lf * 0.03;
      return (
        <>
          <Bg f={lf} kind="void" />
          <Stage cam={{ pos: [Math.sin(orb) * 44, 20, Math.cos(orb) * 44], target: [0, 2, 0], fov: 40 }} light={0.5 + 0.4 * shrink} rim={OR} kick={OR} keyPos={[0, 40, 2]}>
            <LushanConcept p={[0, 2.3, 0]} light={0} />
            <Cloth w={LU_L + 0.6} d={LU_W + 0.6} h={4.8} lift={0} f={lf} drop={4} />
            <LightCone p={[0, 42, 0]} h={44} r={20} o={0.07} />
            <Floor y={0} />
            <Smoke f={lf} y={0} o={0.12} />
          </Stage>
          <Mid y={300}>
            <Chip f={lf} at={2}>
              THE BIG REVEAL
            </Chip>
          </Mid>
          <Mid y={380 - 40 * shrink}>
            <div style={{ transform: `scale(${1 - 0.35 * shrink})`, transformOrigin: "top center", width: 470, borderRadius: 28, overflow: "hidden", background: "#f4f2ee", boxShadow: `0 30px 80px rgba(0,0,0,0.8), 0 0 ${landed ? 80 : 0}px ${OR}`, opacity: E.out(lf, 0, 8) }}>
              <div style={{ background: landed ? OR : "#3a3e45", padding: "14px 0", fontFamily: HEAD, fontWeight: 800, fontSize: 70, color: "#fff", letterSpacing: 10, textAlign: "center" }}>{landed ? "DECEMBER" : MONTHS[flip]}</div>
              <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 250, color: "#121316", textAlign: "center", lineHeight: 1.05, transform: `scale(${landed ? 1.2 - 0.2 * sp(lf, dc + 4, 10, 260) : 1})` }}>{day}</div>
            </div>
          </Mid>
          {landed ? (
            <Mid y={1060}>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, color: AMB, letterSpacing: 3, opacity: E.out(lf, dc + 10, dc + 20) }}>MUSA DEVELOPER CONFERENCE · BEIJING</div>
            </Mid>
          ) : null}
          <Note f={lf} at={dc + 18} y={1150} color="rgba(244,242,238,0.8)">
            REVEAL EXPECTED · DETAILS NOT YET OFFICIAL
          </Note>
          {void d}
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== powerful + affordable 64GB gaming GPU (in a gaming PC) */
const B14: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("ifchina")} b={c("alternative")} tin="whip">
    {(lf, d) => {
      const af = c("affordable") - c("ifchina");
      return (
        <>
          <Bg f={lf} warm={0.3} />
          <Stage cam={{ pos: [path(lf, [[0, 56], [d, 42]]), 34, path(lf, [[0, 82], [d, 92]])], target: [0, 9, 0], fov: 40 }} light={1} rim={COOL} kick={OR}>
            <Tower power={1} spin={lf * 0.5} accent={OR} s={0.55} r={[0, -0.5 + lf * 0.003, 0]} />
            <Floor y={0} />
            <Motes f={lf} spread={70} y={24} />
          </Stage>
          <Mid y={300}>
            <Impact f={lf} at={2} text={"IF CHINA\n[DELIVERS]..."} size={130} />
          </Mid>
          <Mid y={1080}>
            <div style={{ display: "flex", gap: 18, opacity: E.out(lf, af - 10, af) }}>
              {["POWERFUL", "AFFORDABLE", "64GB"].map((t, i) => {
                const k = E.back(lf, af - 10 + i * 8, af + i * 8);
                return (
                  <div key={t} style={{ padding: "14px 22px", borderRadius: 16, border: `3px solid ${AMB}`, background: "rgba(10,11,13,0.82)", fontFamily: HEAD, fontWeight: 800, fontSize: 50, color: i === 1 ? AMB : P.white, transform: `scale(${k})` }}>
                    {t}?
                  </div>
                );
              })}
            </div>
          </Mid>
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== face-off: alternative to NVIDIA? */
const B15: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("alternative")} b={c("number")} tin="flash">
    {(lf, d) => {
      const push = E.io(lf, 0, d);
      return (
        <>
          <Bg f={lf} kind="split" />
          <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(150,190,255,0.16), transparent 45%, transparent 55%, ${OR}33)` }} />
          <Stage cam={{ pos: [0, path(lf, [[0, 0], [d, 4]]), 64 - 10 * push], target: [0, 0, 0], fov: 40 }} light={1.1} rim={COOL} kick={OR}>
            <Upright p={[-9.5 + 1.5 * push, 0, 0]} ry={0.7} s={0.9}>
              <FeCard cls="90" spin={lf * 0.4} />
            </Upright>
            <Upright p={[9.5 - 1.5 * push, 0, 0]} ry={-0.7} s={0.9}>
              <LushanConcept spin={lf * 0.6} light={1.2} />
            </Upright>
            <Particles n={60} color="#ffffff" k={3} fn={(i) => ({ p: [(hash(i) - 0.5) * 6, ((i * 0.7 + lf * 0.6) % 30) - 15, Math.sin(i + lf * 0.3) * 1.5], s: 0.06 + 0.1 * hash(i * 3) })} />
            <Glow p={[0, 0, 2]} s={14 + 4 * Math.sin(lf * 0.5)} color="#ffffff" o={0.35} />
            <Floor y={-17} />
          </Stage>
          <Mid y={300}>
            <Impact f={lf} at={2} text={"CAN CHINA CHALLENGE\n[NVIDIA]?"} size={110} />
          </Mid>
          <CardLabel f={lf} at={10} x={30} y={1150} name="RTX 5090" spec="32GB · ON SALE" color={COOL} />
          <CardLabel f={lf} at={14} x={560} y={1150} name="LUSHAN" spec="64GB? · UNRELEASED" />
        </>
      );
    }}
  </Beat>
);

/* ===================================================================== end: just a number? → would you buy it? */
const End: React.FC<F> = ({ f }) => (
  <Beat f={f} a={c("number")} b={VO_FRAMES + 400} tin="glitch">
    {(lf) => {
      const fo = VO_FRAMES - c("number");
      const burst = E.out(lf, fo - 4, fo + 26);
      const [sx, sy] = shake(lf, fo, 1.6, 18);
      return (
        <>
          <Bg f={lf} warm={0.3 + 0.2 * burst} />
          <Stage cam={{ pos: [sx + Math.sin(lf * 0.02) * 6, 9 + sy, 30 + 8 * burst], target: [0, 5, 0], fov: 40 }} light={1.1} rim={COOL} kick={OR}>
            <Floor y={0} />
            <group scale={1 + 0.0 * burst}>
              {burst <= 0.001 ? (
                <GbTower n={64} shown={64 * E.out(lf, 0, 20)} cols={4} p={[0, 0, 0]} s={1.4} color={AMB} spin={lf * 0.01} />
              ) : (
                <Particles n={64} color={AMB} k={1.6} fn={(i) => ({ p: [(hash(i) - 0.5) * 50 * burst, 0.7 + Math.floor(i / 16) * 1.4 + (hash(i * 3) - 0.3) * 30 * burst, (hash(i * 7) - 0.5) * 30 * burst], s: 0.55 * (1 - 0.6 * burst) })} />
              )}
            </group>
            <Glow p={[0, 4, 0]} s={30} color={OR} o={0.4 * burst * (1 - burst)} />
          </Stage>
          <Mid y={300}>
            <Impact f={lf} at={2} text={"OR IS 64GB\nJUST A [NUMBER?]"} size={124} out={fo - 6} />
          </Mid>
          {lf >= fo ? (
            <>
              <Mid y={300}>
                <Impact f={lf} at={fo} text={"WOULD YOU\n[BUY IT?]"} size={160} />
              </Mid>
              <Mid y={1110}>
                <div style={{ transform: `scale(${sp(lf, fo + 8, 11, 260)})`, padding: "22px 40px", borderRadius: 22, background: OR, fontFamily: HEAD, fontWeight: 800, fontSize: 52, color: "#1a0d04", boxShadow: `0 0 60px ${OR}` }}>COMMENT YES OR NO</div>
              </Mid>
            </>
          ) : null}
          <Sparks f={lf} at={fo} x={540} y={800} n={50} spread={560} />
          {lf >= fo && lf < fo + 5 ? <AbsoluteFill style={{ background: "#fff", opacity: 1 - (lf - fo) / 5 }} /> : null}
        </>
      );
    }}
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
    <End f={f} />
  </AbsoluteFill>
);
export const BEAT_STARTS = (): number[] =>
  ["vram", "double", "card", "twice", "powerful", "claims", "insane", "interesting", "figure", "confirmed", "based", "previous", "moore", "ambitious", "talked", "gaming", "ray", "confuse", "bench", "know", "drivers", "reveal", "december", "ifchina", "affordable", "alternative", "number", "just"].map((k) => c(k));
export { SW };
