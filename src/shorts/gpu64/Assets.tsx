/**
 * SH-GPU64 original 3D assets (no logos, no official product designs):
 *  - LushanConcept: a speculative triple-fan card (charcoal shroud, amber light seams) — NOT the real product.
 *  - Cloth: a drape over a card footprint that can be pulled off (teaser reveal).
 *  - GpuBoard: bare graphics PCB — GPU die surrounded by GDDR memory packages (per-chip glow).
 *  - GbTower: a tower of glowing 1 GB cubes (solid = confirmed, ghost wireframe = unconfirmed).
 *  - LightCone: fake volumetric spotlight cone.
 * The RTX 5090-style card is ug6/Three6 FeCard (reused).
 */
import React, { useMemo } from "react";
import * as THREE from "three";
import { Box, Cyl, Fan, Glow, hash, Inst, P, RBox, useGlow, useMats, type V3 } from "../../ug6/Three6";

export const AMB = P.amber;
export const OR = P.orange;

/* ===================================================================== speculative Lushan concept card */
export const LU_L = 32;
export const LU_W = 14;
const LU_T = 4.6;
/**
 * Concept card lying flat, fans facing +Y. light: amber seam intensity. spin: fan angle.
 * Distinct silhouette from the FE-style card: matte charcoal angular shroud, three fans, V-shaped amber seams,
 * full-length backplate.
 */
export const LushanConcept: React.FC<{ p?: V3; r?: V3; s?: number; spin?: number; light?: number; color?: string }> = ({ p = [0, 0, 0], r = [0, 0, 0], s = 1, spin = 0, light = 1, color = AMB }) => {
  const M = useMats();
  const seam = useGlow(color, 2.4 * light);
  const ring = useGlow(color, 0.9 * light);
  const shroud = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#16171b", metalness: 0.55, roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.3 }), []);
  const fanR = 4.4;
  const xs = [-10.2, 0, 10.2];
  const fins = useMemo(() => Array.from({ length: 70 }, (_, i) => ({ p: [-LU_L / 2 + 1.4 + i * 0.42, -0.7, 0] as V3, s: [0.08, 1.6, LU_W - 2.2] as V3 })), []);
  return (
    <group position={p} rotation={r} scale={s}>
      {/* fin stack visible along the sides */}
      <Inst items={fins} m={M.fin} />
      {/* backplate */}
      <RBox p={[0, -LU_T / 2 + 0.15, 0]} s={[LU_L, 0.3, LU_W]} m={M.gunmetal} rad={0.12} />
      {/* shroud: main plate + angular bevel panels */}
      <RBox p={[0, LU_T / 2 - 0.55, 0]} s={[LU_L, 1.1, LU_W]} m={shroud} rad={0.4} />
      {[1, -1].map((side) => (
        <group key={side}>
          <Box p={[0, LU_T / 2 - 0.2, side * (LU_W / 2 - 0.55)]} s={[LU_L - 1, 0.5, 1.0]} r={[side * 0.35, 0, 0]} m={M.gunmetal} />
          {/* V-shaped amber seams between fans */}
          {[-5.1, 5.1].map((x) => (
            <Box key={x} p={[x + side * 0.9, LU_T / 2 + 0.02, side * 2.6]} s={[0.22, 0.06, 5.4]} r={[0, side * 0.45, 0]} m={seam} />
          ))}
          {/* edge light strip */}
          <Box p={[0, 0, side * (LU_W / 2 + 0.02)]} s={[LU_L * 0.7, 0.24, 0.05]} m={seam} />
        </group>
      ))}
      {/* fans */}
      {xs.map((x, i) => (
        <group key={x} position={[x, LU_T / 2 + 0.02, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
            <circleGeometry args={[fanR + 0.25, 48]} />
            <meshStandardMaterial color="#040405" />
          </mesh>
          <Fan r={fanR} spin={spin * (i % 2 ? -1 : 1) + i} M={M} ring={ring} blades={11} frame={M.gunmetal} />
        </group>
      ))}
      {/* end cap + bracket + power connector + PCIe fingers */}
      <RBox p={[LU_L / 2 - 0.4, 0, 0]} s={[0.8, LU_T, LU_W]} m={M.gunmetal} rad={0.25} />
      <group position={[-LU_L / 2 - 0.15, 0, 0]}>
        <Box s={[0.12, LU_T + 0.4, LU_W + 0.6]} m={M.alu} />
        {[-4, -1.4, 1.2].map((z) => (
          <Box key={z} p={[-0.07, -0.3, z]} s={[0.05, 1.3, 1.7]} m={M.plastic} />
        ))}
      </group>
      <Box p={[LU_L * 0.18, 0.4, LU_W / 2 + 0.35]} s={[2.2, 0.9, 0.7]} m={M.plastic} />
      <Box p={[-LU_L * 0.12, -LU_T / 2, -LU_W / 2 - 0.4]} s={[LU_L * 0.3, 0.16, 0.8]} m={M.gold} />
      {light > 0 ? <Glow p={[0, 0, LU_W / 2 + 1]} s={LU_L * 0.6} color={color} o={0.22 * light} /> : null}
    </group>
  );
};

/* ===================================================================== cloth drape */
/**
 * A sheet draped over a w × d footprint whose top is at height h (sheet hangs down over the edges).
 * lift 0 = resting, 1 = pulled off up/right. f = frame (wrinkle flutter).
 */
export const Cloth: React.FC<{ w: number; d: number; h: number; lift: number; f: number; p?: V3; drop?: number }> = ({ w, d, h, lift, f, p = [0, 0, 0], drop = 5 }) => {
  const W = w + 2 * drop;
  const D = d + 2 * drop;
  const geo = useMemo(() => new THREE.PlaneGeometry(W, D, 72, 44), [W, D]);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array as Float32Array), [geo]);
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#1b1b1f", metalness: 0.05, roughness: 0.78, sheen: 1, sheenColor: new THREE.Color("#ffb070"), sheenRoughness: 0.45, side: THREE.DoubleSide }),
    [],
  );
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const L = lift;
  for (let i = 0; i < pos.count; i++) {
    const u = base[i * 3];
    const v = -base[i * 3 + 1];
    const ex = Math.max(0, Math.abs(u) - w / 2);
    const ez = Math.max(0, Math.abs(v) - d / 2);
    const e = Math.max(ex, ez);
    let x = u - Math.sign(u) * ex * 0.78;
    let z = v - Math.sign(v) * ez * 0.78;
    let y = h - e * 0.92;
    // folds: hanging part ripples, top gets soft wrinkles
    const fold = Math.sin(u * 1.3 + v * 0.4) * 0.35 + Math.sin(v * 1.7 - u * 0.3) * 0.25;
    y += e > 0 ? 0 : 0.18 * fold;
    x += e > 0 ? Math.sign(u) * 0.5 * fold * (ex > 0 ? 1 : 0) : 0;
    z += e > 0 ? Math.sign(v) * 0.5 * fold * (ez > 0 ? 1 : 0) : 0;
    // pull-off: rises, slides to +x, hanging edges straighten, flutter grows
    const k = L * L;
    const flutter = Math.sin(u * 0.6 + f * 0.5) * Math.cos(v * 0.5 + f * 0.37) * 2.2 * L * (1 - L * 0.5);
    y = y + (h + e * 0.92 - y) * L * 0.85 + L * 14 + flutter + (u / W) * 10 * k;
    x = x + (u - x) * L + k * 40;
    z = z + (v - z) * L;
    pos.setXYZ(i, x, y, z);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  if (L >= 0.999) return null;
  return <mesh geometry={geo} material={mat} position={p} />;
};

/* ===================================================================== bare GPU board */
export const BOARD_L = 26;
export const BOARD_W = 13;
/** chip i position (16 chips ringing the die: 5 top, 5 bottom, 3 left, 3 right). */
export const chipPos = (i: number): V3 => {
  if (i < 5) return [-4.8 + i * 2.4, 0.3, -4.6];
  if (i < 10) return [-4.8 + (i - 5) * 2.4, 0.3, 4.6];
  if (i < 13) return [-7.6, 0.3, -2.2 + (i - 10) * 2.2];
  return [7.6, 0.3, -2.2 + (i - 13) * 2.2];
};
/**
 * Graphics PCB with a central GPU die (on substrate) and 16 GDDR packages. chip(i) → 0..1 glow, die → glow,
 * trace: 0..1 data pulses on traces between die and chips.
 */
export const GpuBoard: React.FC<{ p?: V3; r?: V3; s?: number; chip?: (i: number) => number; die?: number; trace?: number; f?: number }> = ({ p = [0, 0, 0], r = [0, 0, 0], s = 1, chip = () => 0, die = 0.4, trace = 0, f = 0 }) => {
  const M = useMats();
  const dg = useGlow(OR, die * 1.6);
  const cg = useGlow(AMB, 2.2);
  const tg = useGlow(AMB, 3);
  const caps = useMemo(() => {
    const out: { p: V3; s: V3 }[] = [];
    for (let i = 0; i < 90; i++) out.push({ p: [9 + (i % 6) * 0.6, 0.18, -5.4 + Math.floor(i / 6) * 0.72], s: [0.34, 0.22, 0.5] });
    for (let i = 0; i < 40; i++) out.push({ p: [-3 + (i % 10) * 0.6, 0.12, (i < 20 ? -2.9 : 2.9) + Math.floor((i % 20) / 10) * 0.3 * (i < 20 ? -1 : 1)], s: [0.3, 0.12, 0.18] });
    return out;
  }, []);
  const lit: { p: V3; s: V3 }[] = [];
  const dark: { p: V3; s: V3 }[] = [];
  for (let i = 0; i < 16; i++) {
    const g = chip(i);
    const cp = chipPos(i);
    const vert = i >= 10;
    (g > 0.5 ? lit : dark).push({ p: cp, s: vert ? [1.5, 0.22, 1.8] : [1.8, 0.22, 1.5] });
  }
  const pulses: { p: V3; s: V3 }[] = [];
  if (trace > 0)
    for (let i = 0; i < 16; i++) {
      const c = chipPos(i);
      for (let k = 0; k < 2; k++) {
        const t = (f * 0.05 + hash(i) + k * 0.5) % 1;
        pulses.push({ p: [c[0] * t, 0.36, c[2] * t], s: [0.22, 0.08, 0.22] });
      }
    }
  return (
    <group position={p} rotation={r} scale={s}>
      <Box p={[0, -0.08, 0]} s={[BOARD_L, 0.16, BOARD_W]} m={M.pcb} />
      <Box p={[-BOARD_L * 0.1, -0.18, -BOARD_W / 2 - 0.35]} s={[BOARD_L * 0.36, 0.12, 0.7]} m={M.gold} />
      {/* VRM caps + chokes */}
      <Inst items={caps} m={M.chip} />
      {Array.from({ length: 6 }, (_, i) => (
        <RBox key={i} p={[11.8, 0.4, -5 + i * 2]} s={[1.3, 0.8, 1.3]} m={M.gunmetal} rad={0.15} />
      ))}
      {/* GPU package */}
      <Box p={[0, 0.12, 0]} s={[6.2, 0.24, 6.2]} m={M.substrate} />
      <Box p={[0, 0.34, 0]} s={[4.6, 0.2, 4.6]} m={M.die} />
      {die > 0 ? <Box p={[0, 0.45, 0]} s={[4.4, 0.02, 4.4]} m={dg} /> : null}
      {die > 0 ? <Glow p={[0, 0.8, 0]} s={9} color={OR} o={0.4 * die} /> : null}
      {/* memory */}
      <Inst items={dark} m={M.chip} />
      <Inst items={lit} m={cg} />
      {lit.length ? <Glow p={[0, 0.6, 0]} s={22} color={AMB} o={0.12 * (lit.length / 16)} /> : null}
      {pulses.length ? <Inst items={pulses} m={tg} /> : null}
    </group>
  );
};

/* ===================================================================== GB cube tower */
const CUBE = new THREE.BoxGeometry(0.86, 0.86, 0.86);
const EDGES = new THREE.EdgesGeometry(CUBE);
/**
 * n cubes (1 GB each) stacked cols × cols per layer, bottom-up. shown: how many are built (fractional = the
 * next cube drops in). ghost: cubes from index `solidN` on are wireframe (unconfirmed).
 */
export const GbTower: React.FC<{ n: number; shown: number; cols?: number; p?: V3; s?: number; color?: string; solidN?: number; spin?: number }> = ({ n, shown, cols = 4, p = [0, 0, 0], s = 1, color = AMB, solidN, spin = 0 }) => {
  const solid = useGlow(color, 1.4);
  const body = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#2a2016", metalness: 0.6, roughness: 0.3, clearcoat: 1, emissive: color, emissiveIntensity: 0.35 }), [color]);
  const line = useMemo(() => new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85, toneMapped: false }), [color]);
  const per = cols * cols;
  const items: { p: V3; s: V3 }[] = [];
  const ghosts: V3[] = [];
  const sN = solidN ?? n;
  for (let i = 0; i < n; i++) {
    const t = Math.max(0, Math.min(1, shown - i));
    if (t <= 0) continue;
    const L = Math.floor(i / per);
    const k = i % per;
    const x = (k % cols) - (cols - 1) / 2;
    const z = Math.floor(k / cols) - (cols - 1) / 2;
    const y = 0.5 + L + (1 - t) * 6;
    if (i >= sN) ghosts.push([x, y, z]);
    else items.push({ p: [x, y, z], s: [t, t, t] });
  }
  void solid;
  return (
    <group position={p} scale={s} rotation={[0, spin, 0]}>
      <Inst items={items} m={body} geo={CUBE} />
      {ghosts.map((g, i) => (
        <lineSegments key={i} geometry={EDGES} material={line} position={g} />
      ))}
    </group>
  );
};

/* ===================================================================== volumetric spotlight cone */
export const LightCone: React.FC<{ p?: V3; h?: number; r?: number; color?: string; o?: number }> = ({ p = [0, 0, 0], h = 40, r = 12, color = "#ffd2a0", o = 0.1 }) => {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false }), [color, o]);
  return (
    <group position={p}>
      {[1, 0.7, 0.45].map((k) => (
        <mesh key={k} position={[0, -h / 2, 0]} material={mat}>
          <coneGeometry args={[r * k, h, 48, 1, true]} />
        </mesh>
      ))}
    </group>
  );
};

/** Lab test stand: two posts + clamps holding a card, plus probe wires (for the reality-check lab). */
export const TestStand: React.FC<{ p?: V3; s?: number; probe?: number }> = ({ p = [0, 0, 0], s = 1, probe = 1 }) => {
  const M = useMats();
  const g = useGlow("#7fe0ff", 2 * probe);
  return (
    <group position={p} scale={s}>
      <RBox p={[0, -0.5, 0]} s={[44, 1, 22]} m={M.steel} rad={0.3} />
      {[-14, 14].map((x) => (
        <group key={x}>
          <Cyl p={[x, 4, -6]} rt={0.5} h={9} m={M.alu} />
          <Box p={[x, 8.4, -4]} s={[1.6, 1.2, 5]} m={M.gunmetal} />
        </group>
      ))}
      {[-6, 0, 6].map((x) => (
        <group key={x}>
          <Cyl p={[x, 9, 6]} rt={0.12} h={10} m={g} />
          <Glow p={[x, 4, 6]} s={2} color="#7fe0ff" o={0.6 * probe} />
        </group>
      ))}
    </group>
  );
};
