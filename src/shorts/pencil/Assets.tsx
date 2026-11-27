/**
 * SH-PENCIL original 3D assets: pencil, Socket-A-era CPU package (generic, no logos) with L1 bridges,
 * macro bridge cross-section, graphite grains, retro beige PC + CRT, modern CPU die.
 */
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cyl, Glow, hash, Inst, P, Particles, RBox, useGlow, useMats, type V3 } from "../../ug6/Three6";

export const GRAPHITE = "#3a3c40";
export const PAINT = "#f0a21a";
export const CERAMIC = "#9a5f36";

const useStd = (color: string, metalness: number, roughness: number) => useMemo(() => new THREE.MeshStandardMaterial({ color, metalness, roughness }), [color, metalness, roughness]);

/* ===================================================================== pencil (tip at origin, body along +Y) */
export const PENCIL_L = 21;
export const Pencil: React.FC<{ p?: V3; r?: V3; s?: number; spark?: number; core?: number }> = ({ p = [0, 0, 0], r = [0, 0, 0], s = 1, spark = -1, core = 0 }) => {
  const M = useMats();
  const paint = useMemo(() => new THREE.MeshPhysicalMaterial({ color: PAINT, metalness: 0.05, roughness: 0.35, clearcoat: 1, clearcoatRoughness: 0.15, flatShading: true }), []);
  const wood = useStd("#d9b083", 0, 0.8);
  const graphite = useMemo(() => new THREE.MeshPhysicalMaterial({ color: GRAPHITE, metalness: 0.75, roughness: 0.32, clearcoat: 0.6 }), []);
  const eraser = useStd("#e5807a", 0, 0.9);
  const coreGlow = useGlow(P.orange, 3 * core);
  return (
    <group position={p} rotation={r} scale={s}>
      {/* graphite tip + sharpened wood cone */}
      <Cyl p={[0, 0.45, 0]} rt={0.26} rb={0.01} h={0.9} m={graphite} seg={24} />
      <Cyl p={[0, 1.65, 0]} rt={0.8} rb={0.26} h={1.5} m={wood} seg={6} />
      {/* hex painted body */}
      <Cyl p={[0, 2.4 + 7.8, 0]} rt={0.8} h={15.6} m={paint} seg={6} />
      <Box p={[0, 9, 0.7]} s={[0.5, 4, 0.02]} m={M.black} />
      {/* ferrule + eraser */}
      <Cyl p={[0, 18.7, 0]} rt={0.86} h={1.4} m={M.alu} seg={24} />
      {[18.2, 18.7, 19.2].map((y) => (
        <Cyl key={y} p={[0, y, 0]} rt={0.9} h={0.12} m={M.gold} seg={24} />
      ))}
      <Cyl p={[0, 20.2, 0]} rt={0.82} h={1.6} m={eraser} seg={24} />
      {core > 0 ? <Cyl p={[0, 8, 0]} rt={0.12} h={16} m={coreGlow} seg={8} /> : null}
      {spark >= 0 && spark <= 1 ? (
        <>
          <Glow p={[0, 17 - 17 * spark, 0]} s={4} color={P.amber} o={1} />
          <Glow p={[0, 17 - 17 * spark, 0]} s={1.4} color="#ffffff" o={1} />
        </>
      ) : null}
    </group>
  );
};

/* ===================================================================== bridge pair helper */
/** One L1 bridge: two gold pads joined by a trace (cut → laser pit, fill → graphite stroke, glow → current). */
const Bridge: React.FC<{ p: V3; cut: number; fill: number; glow: number; s?: number }> = ({ p, cut, fill, glow, s = 1 }) => {
  const M = useMats();
  const pit = useStd("#0b0b0c", 0.2, 0.9);
  const graphite = useStd(GRAPHITE, 0.7, 0.35);
  const g = useGlow(P.orange, 2.6 * glow);
  return (
    <group position={p} scale={s}>
      <Cyl p={[0, 0.02, -0.22]} rt={0.11} h={0.05} m={M.gold} seg={16} />
      <Cyl p={[0, 0.02, 0.22]} rt={0.11} h={0.05} m={M.gold} seg={16} />
      <Box p={[0, 0.015, 0]} s={[0.07, 0.03, 0.44]} m={glow > 0.02 ? g : M.gold} />
      {cut > 0 ? <Box p={[0, 0.03, 0]} s={[0.12 * cut, 0.035, 0.14]} m={pit} /> : null}
      {fill > 0 ? <Box p={[0, 0.05, -0.22 + 0.22 * fill]} s={[0.1, 0.03, 0.44 * fill]} m={glow > 0.02 ? g : graphite} /> : null}
    </group>
  );
};

/* ===================================================================== Socket-A-era CPU package */
export const CPU_W = 10;
/** Generic early-2000s CPU: ceramic package, exposed die, foam pads, pin grid, L1 bridge row (4 bridges). */
export const OldCpu: React.FC<{ p?: V3; r?: V3; s?: number; cut?: number; fill?: number; glow?: number; pins?: boolean; dieGlow?: number }> = ({
  p = [0, 0, 0],
  r = [0, 0, 0],
  s = 1,
  cut = 1,
  fill = 0,
  glow = 0,
  pins = true,
  dieGlow = 0,
}) => {
  const M = useMats();
  const ceramic = useMemo(() => new THREE.MeshPhysicalMaterial({ color: CERAMIC, metalness: 0.15, roughness: 0.5, clearcoat: 0.5, clearcoatRoughness: 0.4 }), []);
  const foam = useStd("#5d5f63", 0, 1);
  const dg = useGlow(P.orange, dieGlow * 2);
  const pinItems = useMemo(() => {
    const out: { p: V3; s: V3 }[] = [];
    const n = 19;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const x = -4.3 + (8.6 * i) / (n - 1);
        const z = -4.3 + (8.6 * j) / (n - 1);
        if (Math.abs(x) < 1.6 && Math.abs(z) < 1.6) continue;
        out.push({ p: [x, -0.55, z], s: [0.05, 0.7, 0.05] });
      }
    return out;
  }, []);
  return (
    <group position={p} rotation={r} scale={s}>
      <RBox p={[0, 0, 0]} s={[CPU_W, 0.4, CPU_W]} m={ceramic} rad={0.08} />
      {/* die */}
      <Box p={[0, 0.27, 0]} s={[1.3, 0.14, 1.75]} m={M.silicon} />
      {dieGlow > 0 ? <Box p={[0, 0.35, 0]} s={[1.2, 0.02, 1.6]} m={dg} /> : null}
      {/* foam pads */}
      {[
        [-3.6, -3.6],
        [3.6, -3.6],
        [-3.6, 3.6],
        [3.6, 3.6],
      ].map(([x, z]) => (
        <Box key={`${x}${z}`} p={[x, 0.27, z]} s={[1.1, 0.14, 1.1]} m={foam} />
      ))}
      {/* SMD caps around die */}
      {Array.from({ length: 10 }, (_, i) => (
        <Box key={i} p={[-1.8 + (i % 5) * 0.9, 0.24, i < 5 ? 1.8 : -1.8]} s={[0.25, 0.08, 0.12]} m={i % 2 ? M.steel : M.chip} />
      ))}
      {/* L1 bridge row (the hero) — top-left of die */}
      <group position={[-2.6, 0.2, -2.6]}>
        {[0, 1, 2, 3].map((i) => (
          <Bridge key={i} p={[i * 0.42 - 0.63, 0, 0]} cut={cut} fill={sat01(fill * 4 - i)} glow={glow} />
        ))}
      </group>
      {/* other bridge groups (decor) */}
      {[
        [2.4, -2.6],
        [2.6, 2.4],
        [-2.6, 2.5],
      ].map(([x, z], k) => (
        <group key={k} position={[x, 0.2, z]} rotation={[0, k % 2 ? Math.PI / 2 : 0, 0]}>
          {[0, 1, 2].map((i) => (
            <Bridge key={i} p={[i * 0.42 - 0.42, 0, 0]} cut={0} fill={0} glow={0} />
          ))}
        </group>
      ))}
      {/* corner key mark */}
      <Box p={[-4.55, 0.21, -4.55]} s={[0.5, 0.02, 0.06]} m={M.gold} />
      {pins ? <Inst items={pinItems} m={M.gold} /> : null}
    </group>
  );
};
const sat01 = (x: number) => Math.max(0, Math.min(1, x));
/** World position of L1 bridge i on an OldCpu at origin, scale 1. */
export const bridgePos = (i: number): V3 => [-2.6 + i * 0.42 - 0.63, 0.25, -2.6];

/* ===================================================================== macro cross-section */
/**
 * Big cut-away of ONE bridge: ceramic block, two gold pads, laser trench in the middle.
 * fill: graphite grains settle into the trench; flow: current particles travel pad → pad.
 * Spans x −12..12; trench at x −2..2; surface at y = 0.
 */
export const Macro: React.FC<{ f: number; fill: number; flow: number; cut?: number; src?: V3 }> = ({ f, fill, flow, cut = 1, src = [3, 16, 4] }) => {
  const M = useMats();
  const ceramic = useStd(CERAMIC, 0.15, 0.55);
  const pit = useStd("#120d0a", 0.1, 0.95);
  const g = useGlow(P.orange, 0.4 + 2.4 * flow);
  const grainM = useStd(GRAPHITE, 0.75, 0.35);
  const N = 220;
  const grains = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 0);
    const im = new THREE.InstancedMesh(geo, grainM, N);
    im.frustumCulled = false;
    return im;
  }, [grainM]);
  const o = new THREE.Object3D();
  let c = 0;
  for (let i = 0; i < N; i++) {
    // each grain launches at its own time, flies from the pencil tip and lands in the trench
    const t0 = (i / N) * 0.8;
    const t = sat01((fill - t0) / 0.2);
    if (t <= 0) continue;
    const end: V3 = [-1.9 + 3.8 * hash(i * 7.1), -1.3 + 1.45 * (i / N) + 0.15 * hash(i * 3.3), -2.6 + 5.2 * hash(i * 1.7)];
    const e = 1 - Math.pow(1 - t, 3);
    o.position.set(src[0] + (end[0] - src[0]) * e, src[1] + (end[1] - src[1]) * e + Math.sin(e * Math.PI) * 2, src[2] + (end[2] - src[2]) * e);
    o.rotation.set(i, i * 2.1, f * 0.05 * (1 - t));
    o.scale.setScalar(0.2 + 0.18 * hash(i * 5.9));
    o.updateMatrix();
    grains.setMatrixAt(c++, o.matrix);
  }
  grains.count = c;
  grains.instanceMatrix.needsUpdate = true;
  return (
    <group>
      {/* ceramic block, split around the trench */}
      <Box p={[-7.5, -3, 0]} s={[11, 6, 8]} m={ceramic} />
      <Box p={[7.5, -3, 0]} s={[11, 6, 8]} m={ceramic} />
      <Box p={[0, -4.2, 0]} s={[4, 3.6, 8]} m={ceramic} />
      <Box p={[0, -2.35, 0]} s={[4, 0.1, 8]} m={pit} />
      {/* gold pads + trace stubs */}
      <Box p={[-8, 0.35, 0]} s={[8, 0.7, 5.4]} m={M.gold} />
      <Box p={[8, 0.35, 0]} s={[8, 0.7, 5.4]} m={M.gold} />
      <Box p={[-3, 0.2, 0]} s={[2 + 2 * (1 - cut), 0.4, 2]} m={M.gold} />
      <Box p={[3, 0.2, 0]} s={[2 + 2 * (1 - cut), 0.4, 2]} m={M.gold} />
      {/* conducting path lights up (thin strip on top) */}
      {flow > 0 ? (
        <>
          <Box p={[-8, 0.72, 0]} s={[8, 0.04, 0.5]} m={g} />
          <Box p={[8, 0.72, 0]} s={[8, 0.04, 0.5]} m={g} />
        </>
      ) : null}
      <primitive object={grains} />
      {/* current particles */}
      {flow > 0 ? (
        <Particles
          n={60}
          color={P.amber}
          k={4}
          fn={(i) => {
            const x = -12 + (((f * 0.35 + i * 0.4) % 24) + 24) % 24;
            const inGap = Math.abs(x) < 2;
            const y = inGap ? -0.3 + 0.4 * Math.sin(i + f * 0.2) : 0.8;
            return { p: [x, y, -1.6 + 3.2 * hash(i * 9.1)], s: 0.14 * flow };
          }}
        />
      ) : null}
      {flow > 0 ? <Glow p={[0, 0, 0]} s={10 * flow} color={P.orange} o={0.6 * flow} /> : null}
    </group>
  );
};

/* ===================================================================== retro PC (beige tower + CRT) */
const screenTex = (lines: string[], hot: boolean) => {
  const cv = document.createElement("canvas");
  cv.width = 512;
  cv.height = 384;
  const g = cv.getContext("2d") as CanvasRenderingContext2D;
  g.fillStyle = "#04120a";
  g.fillRect(0, 0, 512, 384);
  g.font = "bold 30px monospace";
  lines.forEach((l, i) => {
    g.fillStyle = i === lines.length - 1 && hot ? "#ffb547" : "#7dffa8";
    g.fillText(l, 26, 56 + i * 44);
  });
  for (let y = 0; y < 384; y += 4) {
    g.fillStyle = "rgba(0,0,0,0.25)";
    g.fillRect(0, y, 512, 2);
  }
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
};
/** Beige tower + CRT + keyboard on a desk. Desk top at y=0. `mhz` is printed on the CRT boot screen. */
export const RetroPc: React.FC<{ p?: V3; s?: number; power?: number; mhz?: number; hot?: boolean }> = ({ p = [0, 0, 0], s = 1, power = 1, mhz = 600, hot = false }) => {
  const M = useMats();
  const beige = useStd("#d6ccb4", 0.05, 0.6);
  const beige2 = useStd("#c2b79d", 0.05, 0.65);
  const deskM = useStd("#3b2a1e", 0.1, 0.6);
  const tex = useMemo(() => screenTex(["BIOS v1.0  (c) 2000", "Memory Test: 262144K OK", "", `CPU  : ${mhz} MHz`], hot), [mhz, hot]);
  const scr = useMemo(() => new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), [tex]);
  scr.color.setScalar(0.1 + 0.9 * power);
  const led = useGlow("#4bff7a", 2 * power);
  const keys = useMemo(() => {
    const out: { p: V3; s: V3 }[] = [];
    for (let r = 0; r < 5; r++) for (let k = 0; k < 15; k++) out.push({ p: [-7.7 + k * 1.1, 0.75, 6.5 + r * 1.05], s: [0.9, 0.35, 0.85] });
    return out;
  }, []);
  return (
    <group position={p} scale={s}>
      {/* desk */}
      <Box p={[0, -0.6, 2]} s={[52, 1.2, 22]} m={deskM} />
      {/* tower */}
      <group position={[-17, 0, -1]}>
        <Box p={[0, 9, 0]} s={[8, 18, 17]} m={beige} />
        {[15, 13].map((y) => (
          <Box key={y} p={[0, y, 8.55]} s={[6.4, 1.6, 0.2]} m={beige2} />
        ))}
        <Box p={[0, 10.6, 8.55]} s={[3.6, 1, 0.2]} m={beige2} />
        <Box p={[0, 10.6, 8.66]} s={[2.8, 0.12, 0.05]} m={M.black} />
        <Cyl p={[0, 6, 8.6]} r={[Math.PI / 2, 0, 0]} rt={0.7} h={0.3} m={beige2} />
        <Box p={[2, 4.2, 8.62]} s={[0.4, 0.4, 0.05]} m={led} />
        {Array.from({ length: 6 }, (_, i) => (
          <Box key={i} p={[0, 1.5 + i * 0.5, 8.56]} s={[5, 0.18, 0.05]} m={M.black} />
        ))}
      </group>
      {/* CRT */}
      <group position={[2, 0, -2]}>
        <Box p={[0, 0.6, 0]} s={[8, 1.2, 8]} m={beige2} />
        <Box p={[0, 9.2, -1]} s={[17, 15, 9]} m={beige} />
        <Box p={[0, 9.6, -7.5]} s={[12, 11, 6]} m={beige2} />
        <Box p={[0, 9.4, 3.55]} s={[15, 12.6, 0.2]} m={beige2} />
        <mesh position={[0, 9.6, 3.7]} material={scr}>
          <planeGeometry args={[12.6, 9.45]} />
        </mesh>
        <Glow p={[0, 9.6, 5]} s={22} color="#5dff9a" o={0.12 * power} />
      </group>
      {/* keyboard */}
      <Box p={[0, 0.3, 8.6]} s={[18, 0.6, 6.4]} m={beige} />
      <Inst items={keys} m={beige2} />
      {/* mouse */}
      <RBox p={[13, 0.45, 9]} s={[2.2, 0.9, 3.4]} m={beige} rad={0.4} />
    </group>
  );
};

/* ===================================================================== modern CPU */
/** Modern LGA-style package: substrate, heat spreader that can lift, glowing chiplet die with transistor grid. */
export const ModernCpu: React.FC<{ p?: V3; r?: V3; s?: number; lift?: number; glow?: number }> = ({ p = [0, 0, 0], r = [0, 0, 0], s = 1, lift = 0, glow = 0.5 }) => {
  const M = useMats();
  const g = useGlow(P.orange, glow * 1.4);
  const lgaPads = useMemo(() => {
    const out: { p: V3; s: V3 }[] = [];
    for (let i = 0; i < 24; i++) for (let j = 0; j < 24; j++) out.push({ p: [-4.4 + i * 0.38, -0.02, -4.4 + j * 0.38], s: [0.16, 0.02, 0.16] });
    return out;
  }, []);
  return (
    <group position={p} rotation={r} scale={s}>
      <Box p={[0, 0.12, 0]} s={[10, 0.24, 10]} m={M.substrate} />
      <Inst items={lgaPads} m={M.gold} />
      {/* chiplets */}
      <Box p={[-1.9, 0.36, 0]} s={[2.6, 0.22, 3.6]} m={M.die} />
      <Box p={[1.9, 0.36, -1]} s={[2.2, 0.22, 2.2]} m={M.die} />
      <Box p={[1.9, 0.36, 1.6]} s={[2.2, 0.22, 1.6]} m={M.silicon} />
      <Box p={[-1.9, 0.48, 0]} s={[2.4, 0.02, 3.4]} m={g} />
      {/* IHS */}
      <group position={[0, 0.85 + lift * 6, 0]} rotation={[lift * 0.3, 0, -lift * 0.12]}>
        <RBox s={[8.6, 0.7, 8.6]} m={M.alu} rad={0.3} />
      </group>
    </group>
  );
};
