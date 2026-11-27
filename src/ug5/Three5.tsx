/**
 * UG-005 procedural 3D models (three.js via @remotion/three). Original designs, no logos.
 * - RtxCard: open-air triple-fan flagship-style graphics card (units ≈ cm, lies flat, fans face +Y).
 * - Phone: slim glass slab with an emissive screen.
 * - Soc: a phone chip package whose blocks (CPU/GPU/NPU/ISP/MODEM) can explode upward.
 * - BigDie: a large bare GPU die (for the size comparison).
 * Every value is a pure function of props, so frames render deterministically.
 */
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import type { V3 } from "../ug3/Three3D";

const Box: React.FC<{ p: V3; s: V3; m: THREE.Material; r?: V3 }> = ({ p, s, m, r }) => (
  <mesh position={p} rotation={r} material={m}>
    <boxGeometry args={s} />
  </mesh>
);
const RBox: React.FC<{ p: V3; s: V3; m: THREE.Material; rad?: number; r?: V3 }> = ({ p, s, m, rad = 0.12, r }) => {
  const g = useMemo(() => new RoundedBoxGeometry(s[0], s[1], s[2], 4, Math.min(rad, s[0] / 2, s[1] / 2, s[2] / 2)), [s[0], s[1], s[2], rad]);
  return <mesh position={p} rotation={r} geometry={g} material={m} />;
};

const useMats = () =>
  useMemo(
    () => ({
      shroud: new THREE.MeshPhysicalMaterial({ color: "#2b3038", metalness: 0.9, roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.15 }),
      dark: new THREE.MeshPhysicalMaterial({ color: "#0b0d10", metalness: 0.7, roughness: 0.35, clearcoat: 0.5 }),
      silver: new THREE.MeshStandardMaterial({ color: "#b9c0c9", metalness: 1, roughness: 0.2 }),
      fin: new THREE.MeshStandardMaterial({ color: "#8d949d", metalness: 1, roughness: 0.3 }),
      blade: new THREE.MeshStandardMaterial({ color: "#121418", metalness: 0.3, roughness: 0.45, side: THREE.DoubleSide }),
      hub: new THREE.MeshPhysicalMaterial({ color: "#1a1d22", metalness: 0.8, roughness: 0.25, clearcoat: 1 }),
      pcb: new THREE.MeshStandardMaterial({ color: "#0a1a12", metalness: 0.2, roughness: 0.6 }),
      gold: new THREE.MeshStandardMaterial({ color: "#e0b04a", metalness: 1, roughness: 0.25 }),
      plastic: new THREE.MeshStandardMaterial({ color: "#0e0f11", metalness: 0.1, roughness: 0.7 }),
      glass: new THREE.MeshPhysicalMaterial({ color: "#05070a", metalness: 0.2, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.02, reflectivity: 1 }),
      frame: new THREE.MeshStandardMaterial({ color: "#5d6570", metalness: 1, roughness: 0.25 }),
      lens: new THREE.MeshPhysicalMaterial({ color: "#020203", metalness: 0.4, roughness: 0.05, clearcoat: 1 }),
      substrate: new THREE.MeshStandardMaterial({ color: "#1d3b2c", metalness: 0.3, roughness: 0.5 }),
      die: new THREE.MeshStandardMaterial({ color: "#20242c", metalness: 0.95, roughness: 0.12 }),
    }),
    [],
  );

/* ------------------------------------------------------------------ RTX-style card */
export const RTX_L = 30.4;
export const RTX_W = 13.7;
const FAN_X = [-9.4, 0, 9.4];

const Fan: React.FC<{ x: number; spin: number; m: ReturnType<typeof useMats>; ring: THREE.Material }> = ({ x, spin, m, ring }) => {
  const blades = 11;
  return (
    <group position={[x, 2.05, 0]}>
      {/* ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} material={ring}>
        <torusGeometry args={[4.35, 0.12, 12, 64]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} material={m.dark}>
        <torusGeometry args={[4.55, 0.22, 12, 64]} />
      </mesh>
      {/* rotor */}
      <group rotation={[0, spin, 0]}>
        <mesh material={m.hub}>
          <cylinderGeometry args={[1.25, 1.35, 0.5, 40]} />
        </mesh>
        {Array.from({ length: blades }, (_, i) => (
          <group key={i} rotation={[0, (i / blades) * Math.PI * 2, 0]}>
            <mesh position={[2.75, 0, 0]} rotation={[0.38, 0, 0.12]} material={m.blade}>
              <boxGeometry args={[2.9, 0.05, 1.15]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};

/**
 * Open-air triple-fan card. spin: fan angle (radians). accent: emissive strip colour.
 * heat: 0..1 makes the shroud glow warm (for the 575 W / heat beats). plug: glow on the 16-pin connector.
 * explode: lifts the shroud + fans to show the heatsink fins.
 */
export const RtxCard: React.FC<{ spin?: number; accent?: string; accentK?: number; heat?: number; plug?: number; explode?: number; p?: V3; r?: V3; s?: number }> = ({
  spin = 0,
  accent = "#76b900",
  accentK = 1,
  heat = 0,
  plug = 0,
  explode = 0,
  p = [0, 0, 0],
  r = [0, 0, 0],
  s = 1,
}) => {
  const M = useMats();
  const ring = useMemo(() => new THREE.MeshStandardMaterial({ color: "#111", emissive: accent, emissiveIntensity: 2 }), [accent]);
  ring.emissiveIntensity = 2.4 * accentK;
  const heatMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#2b3038", metalness: 0.8, roughness: 0.35, emissive: "#ff5a1f", emissiveIntensity: 0 }), []);
  heatMat.emissiveIntensity = heat * 1.6;
  const plugMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#111", emissive: "#ff3d1f", emissiveIntensity: 0 }), []);
  plugMat.emissiveIntensity = plug * 5;
  const lift = explode * 6;
  const finMesh = useMemo(() => {
    const n = 70;
    const g = new THREE.BoxGeometry(0.04, 2.4, RTX_W - 1.4);
    const im = new THREE.InstancedMesh(g, M.fin, n);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      o.position.set(-RTX_L / 2 + 1.2 + (i * (RTX_L - 2.4)) / (n - 1), 0.75, 0);
      o.updateMatrix();
      im.setMatrixAt(i, o.matrix);
    }
    im.instanceMatrix.needsUpdate = true;
    return im;
  }, [M.fin]);
  return (
    <group position={p} rotation={r} scale={s}>
      {/* PCB + backplate */}
      <Box p={[0, -0.6, 0]} s={[RTX_L - 1, 0.16, RTX_W - 0.6]} m={M.pcb} />
      <RBox p={[0, -0.85, 0]} s={[RTX_L, 0.3, RTX_W]} m={M.dark} rad={0.12} />
      <Box p={[-4, -0.6, RTX_W / 2 + 0.45]} s={[8.6, 0.17, 0.9]} m={M.gold} />
      {/* heatsink fins */}
      <primitive object={finMesh} />
      {/* shroud + fans lift together */}
      <group position={[0, lift, 0]}>
        <RBox p={[0, 1.75, 0]} s={[RTX_L, 0.35, RTX_W]} m={heat > 0 ? heatMat : M.shroud} rad={0.15} />
        <RBox p={[0, 0.85, RTX_W / 2 - 0.15]} s={[RTX_L, 2.1, 0.3]} m={M.shroud} rad={0.12} />
        <RBox p={[0, 0.85, -RTX_W / 2 + 0.15]} s={[RTX_L, 2.1, 0.3]} m={M.shroud} rad={0.12} />
        {/* silver accent bars between fans */}
        {[-4.7, 4.7].map((x) => (
          <Box key={x} p={[x, 1.96, 0]} s={[0.5, 0.08, RTX_W - 1.6]} m={M.silver} />
        ))}
        {/* edge light strip (top edge) */}
        <Box p={[0, 1.2, -RTX_W / 2 - 0.02]} s={[RTX_L - 3, 0.18, 0.04]} m={ring} />
        {FAN_X.map((x, i) => (
          <Fan key={i} x={x} spin={spin * (i % 2 ? -1 : 1) + i} m={M} ring={ring} />
        ))}
      </group>
      {/* 16-pin power connector on the top edge */}
      <group position={[3.5, 0.5, -RTX_W / 2 - 0.55]}>
        <Box p={[0, 0, 0]} s={[2.3, 0.9, 1.0]} m={M.plastic} />
        <Box p={[0, 0, -0.52]} s={[2.0, 0.6, 0.06]} m={plugMat} />
      </group>
      {/* bracket */}
      <group position={[-RTX_L / 2 - 0.1, 0.3, 0]}>
        <Box p={[0, 0, 0]} s={[0.12, 3.6, RTX_W + 0.8]} m={M.silver} />
        {[-3, -1, 1, 3].map((z) => (
          <Box key={z} p={[-0.07, -0.6, z]} s={[0.05, 0.8, 1.3]} m={M.plastic} />
        ))}
      </group>
    </group>
  );
};

/* ------------------------------------------------------------------ phone */
/** Slim phone in landscape, screen facing +Y. glow: screen brightness. hue: screen colour pair. */
export const Phone: React.FC<{ glow?: number; colA?: string; colB?: string; p?: V3; r?: V3; s?: number; heat?: number }> = ({
  glow = 1,
  colA = "#28d7ff",
  colB = "#7a5cff",
  p = [0, 0, 0],
  r = [0, 0, 0],
  s = 1,
  heat = 0,
}) => {
  const M = useMats();
  const screen = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 512;
    cv.height = 256;
    const g = cv.getContext("2d")!;
    const gr = g.createLinearGradient(0, 0, 512, 256);
    gr.addColorStop(0, colA);
    gr.addColorStop(1, colB);
    g.fillStyle = gr;
    g.fillRect(0, 0, 512, 256);
    // stylised game HUD: horizon + mountains
    g.fillStyle = "rgba(0,0,0,0.35)";
    g.beginPath();
    g.moveTo(0, 200);
    for (let x = 0; x <= 512; x += 32) g.lineTo(x, 150 + Math.sin(x * 0.03) * 30 + Math.cos(x * 0.011) * 20);
    g.lineTo(512, 256);
    g.lineTo(0, 256);
    g.fill();
    g.strokeStyle = "rgba(255,255,255,0.7)";
    g.lineWidth = 4;
    g.beginPath();
    g.arc(60, 196, 34, 0, Math.PI * 2);
    g.stroke();
    g.beginPath();
    g.arc(452, 196, 18, 0, Math.PI * 2);
    g.stroke();
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [colA, colB]);
  const scrMat = useMemo(() => new THREE.MeshBasicMaterial({ map: screen, toneMapped: false }), [screen]);
  scrMat.color.setScalar(Math.max(0.05, glow));
  const backMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1a1e24", metalness: 0.6, roughness: 0.3, emissive: "#ff4a1a", emissiveIntensity: 0 }), []);
  backMat.emissiveIntensity = heat * 1.4;
  const L = 16.3;
  const W = 7.5;
  const T = 0.82;
  return (
    <group position={p} rotation={r} scale={s}>
      <RBox p={[0, 0, 0]} s={[L, T, W]} m={M.frame} rad={0.4} />
      <RBox p={[0, -0.02, 0]} s={[L - 0.06, T + 0.02, W - 0.06]} m={backMat} rad={0.38} />
      <mesh position={[0, T / 2 + 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]} material={M.glass}>
        <planeGeometry args={[L - 0.25, W - 0.25]} />
      </mesh>
      <mesh position={[0, T / 2 + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} material={scrMat}>
        <planeGeometry args={[L - 0.55, W - 0.55]} />
      </mesh>
      {/* camera bump on the back */}
      <RBox p={[-5.6, -T / 2 - 0.12, -1.6]} s={[3.6, 0.3, 3.6]} m={M.dark} rad={0.5} />
      {[
        [-6.4, -2.4],
        [-4.8, -2.4],
        [-6.4, -0.8],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, -T / 2 - 0.3, z]} material={M.lens}>
          <cylinderGeometry args={[0.55, 0.55, 0.12, 32]} />
        </mesh>
      ))}
    </group>
  );
};

/* ------------------------------------------------------------------ phone SoC (exploded) */
export const SOC_BLOCKS: { k: string; label: string; col: string; p: [number, number]; s: [number, number] }[] = [
  { k: "cpu", label: "CPU", col: "#ffb648", p: [-0.95, -0.6], s: [1.4, 1.1] },
  { k: "gpu", label: "GPU", col: "#28d7ff", p: [0.7, -0.35], s: [1.6, 1.6] },
  { k: "npu", label: "AI", col: "#b07aff", p: [-0.95, 0.75], s: [1.4, 1.1] },
  { k: "isp", label: "CAMERA", col: "#ff5c8a", p: [0.25, 1.05], s: [0.8, 0.6] },
  { k: "modem", label: "MODEM", col: "#35f29a", p: [1.15, 1.05], s: [0.7, 0.6] },
];
/** explode 0..1 lifts each block; lit[k] 0..1 lights a block; glow scales emissive. */
export const Soc: React.FC<{ explode?: number; lit?: Record<string, number>; p?: V3; r?: V3; s?: number; glow?: number }> = ({ explode = 0, lit = {}, p = [0, 0, 0], r = [0, 0, 0], s = 1, glow = 1 }) => {
  const M = useMats();
  return (
    <group position={p} rotation={r} scale={s}>
      <RBox p={[0, -0.1, 0]} s={[4.2, 0.18, 4.2]} m={M.substrate} rad={0.08} />
      <Box p={[0, 0.03, 0]} s={[3.6, 0.08, 3.4]} m={M.die} />
      {SOC_BLOCKS.map((b, i) => {
        const k = lit[b.k] ?? 0;
        const y = 0.12 + explode * (0.8 + i * 0.35);
        return (
          <mesh key={b.k} position={[b.p[0], y, b.p[1]]}>
            <boxGeometry args={[b.s[0], 0.12, b.s[1]]} />
            <meshStandardMaterial color="#14181e" metalness={0.8} roughness={0.25} emissive={b.col} emissiveIntensity={(0.25 + k * 2.6) * glow} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ big GPU die (size compare) */
/** A large bare die on a package. size in cm (GB202 ≈ 2.9 cm × 2.6 cm ≈ 750 mm²). */
export const BigDie: React.FC<{ p?: V3; r?: V3; s?: number; glow?: number; col?: string }> = ({ p = [0, 0, 0], r = [0, 0, 0], s = 1, glow = 1, col = "#76b900" }) => {
  const M = useMats();
  const grid = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 512;
    cv.height = 460;
    const g = cv.getContext("2d")!;
    g.fillStyle = "#0b0e12";
    g.fillRect(0, 0, 512, 460);
    for (let y = 0; y < 12; y++)
      for (let x = 0; x < 14; x++) {
        const v = Math.sin(x * 12.9 + y * 78.2) * 43758.5;
        const k = v - Math.floor(v);
        g.fillStyle = `rgba(118,185,0,${0.25 + k * 0.6})`;
        g.fillRect(14 + x * 35.5, 14 + y * 36, 30, 30);
      }
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const dieMat = useMemo(() => new THREE.MeshStandardMaterial({ map: grid, emissiveMap: grid, emissive: new THREE.Color(col), metalness: 0.9, roughness: 0.15, toneMapped: false }), [grid, col]);
  dieMat.emissiveIntensity = glow * 1.4;
  return (
    <group position={p} rotation={r} scale={s}>
      <RBox p={[0, -0.12, 0]} s={[6.2, 0.2, 6.2]} m={M.substrate} rad={0.1} />
      <mesh position={[0, 0.02, 0]} material={dieMat}>
        <boxGeometry args={[2.9, 0.1, 2.6]} />
      </mesh>
    </group>
  );
};
