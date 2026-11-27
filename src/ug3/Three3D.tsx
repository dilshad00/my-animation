/**
 * UG-003 real-time 3D (three.js via @remotion/three). Every model is procedural (no external
 * meshes) and every value is a pure function of the props, so frames render deterministically.
 *
 * Units ≈ centimetres. A card lies flat: X = length, Y = up (thickness), Z = height of the board.
 */
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import React, { useLayoutEffect, useMemo } from "react";
import { useVideoConfig } from "remotion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

/* ------------------------------------------------------------------ helpers */
export type V3 = [number, number, number];
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const mixV = (a: V3, b: V3, t: number): V3 => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
const hash = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};

/** Environment map (procedural studio room) for metal reflections + tone mapping. */
const Env: React.FC<{ intensity?: number }> = ({ intensity = 0.9 }) => {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
    gl.outputColorSpace = THREE.SRGBColorSpace;
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = tex;
    scene.environmentIntensity = intensity;
    return () => {
      tex.dispose();
      pm.dispose();
    };
  }, [gl, scene, intensity]);
  return null;
};

/** Sets the camera every frame (position, target, fov, optional roll). */
export const Cam: React.FC<{ pos: V3; target: V3; fov?: number; roll?: number }> = ({ pos, target, fov = 32, roll = 0 }) => {
  const { camera } = useThree();
  const c = camera as THREE.PerspectiveCamera;
  c.position.set(...pos);
  c.up.set(Math.sin(roll), Math.cos(roll), 0);
  c.lookAt(...target);
  if (c.fov !== fov) {
    c.fov = fov;
    c.updateProjectionMatrix();
  }
  return null;
};

/** Standard UG-003 3D stage: transparent canvas, studio env, key + coloured rims. */
export const Scene3D: React.FC<{ children: React.ReactNode; rimA?: string; rimB?: string; key1?: number; env?: number }> = ({
  children,
  rimA = "#28d7ff",
  rimB = "#35f29a",
  key1 = 2.2,
  env = 0.85,
}) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} camera={{ fov: 32, near: 0.1, far: 500, position: [0, 20, 40] }}>
      <Env intensity={env} />
      <ambientLight intensity={0.15} />
      <directionalLight position={[12, 30, 18]} intensity={key1} color="#fff6ea" />
      <pointLight position={[-30, 8, -20]} intensity={1400} distance={140} color={rimA} />
      <pointLight position={[30, 6, -24]} intensity={1100} distance={140} color={rimB} />
      <spotLight position={[0, 40, 6]} angle={0.5} penumbra={0.8} intensity={900} distance={160} color="#ffffff" />
      {children}
    </ThreeCanvas>
  );
};

/* ------------------------------------------------------------------ materials */
/** Procedural brushed-metal streak texture (used as roughness + bump map). */
const brushed = (() => {
  let t: THREE.CanvasTexture | null = null;
  return () => {
    if (t) return t;
    const cv = document.createElement("canvas");
    cv.width = 1024;
    cv.height = 256;
    const g = cv.getContext("2d")!;
    g.fillStyle = "#808080";
    g.fillRect(0, 0, 1024, 256);
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 2600; i++) {
      const v = Math.floor(90 + rnd() * 90);
      g.fillStyle = `rgba(${v},${v},${v},${0.25 + rnd() * 0.35})`;
      g.fillRect(rnd() * 1024 - 200, rnd() * 256, 200 + rnd() * 700, 0.6 + rnd() * 1.2);
    }
    t = new THREE.CanvasTexture(cv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1.5, 3);
    return t;
  };
})();

const useMats = () =>
  useMemo(
    () => ({
      shroud: new THREE.MeshPhysicalMaterial({ color: "#3b4048", metalness: 1, roughness: 0.34, roughnessMap: brushed(), bumpMap: brushed(), bumpScale: 0.6, clearcoat: 0.6, clearcoatRoughness: 0.12 }),
      shroudDark: new THREE.MeshPhysicalMaterial({ color: "#0d0f12", metalness: 0.85, roughness: 0.38, roughnessMap: brushed(), clearcoat: 0.5, clearcoatRoughness: 0.2 }),
      rib: new THREE.MeshStandardMaterial({ color: "#a9b0ba", metalness: 1, roughness: 0.18 }),
      smd: new THREE.MeshStandardMaterial({ color: "#2a2a2a", metalness: 0.4, roughness: 0.4 }),
      smdTan: new THREE.MeshStandardMaterial({ color: "#8a6a45", metalness: 0.3, roughness: 0.5 }),
      fin: new THREE.MeshStandardMaterial({ color: "#c9ced6", metalness: 0.95, roughness: 0.22 }),
      copper: new THREE.MeshStandardMaterial({ color: "#c8794a", metalness: 1, roughness: 0.28 }),
      pcb: new THREE.MeshStandardMaterial({ color: "#0b1f17", metalness: 0.2, roughness: 0.55 }),
      gold: new THREE.MeshStandardMaterial({ color: "#e0b04a", metalness: 1, roughness: 0.25 }),
      back: new THREE.MeshStandardMaterial({ color: "#16191d", metalness: 0.8, roughness: 0.45 }),
      choke: new THREE.MeshStandardMaterial({ color: "#3a3f46", metalness: 0.6, roughness: 0.5 }),
      cap: new THREE.MeshStandardMaterial({ color: "#151515", metalness: 0.3, roughness: 0.35 }),
      ic: new THREE.MeshStandardMaterial({ color: "#111214", metalness: 0.2, roughness: 0.5 }),
      substrate: new THREE.MeshStandardMaterial({ color: "#1d3b2c", metalness: 0.3, roughness: 0.5 }),
      interposer: new THREE.MeshStandardMaterial({ color: "#5d636b", metalness: 0.7, roughness: 0.3 }),
      die: new THREE.MeshStandardMaterial({ color: "#20242c", metalness: 0.95, roughness: 0.12 }),
      dummy: new THREE.MeshStandardMaterial({ color: "#2b2f35", metalness: 0.6, roughness: 0.5 }),
      plastic: new THREE.MeshStandardMaterial({ color: "#0e0f11", metalness: 0.1, roughness: 0.7 }),
      blue: new THREE.MeshStandardMaterial({ color: "#123a7a", metalness: 0.2, roughness: 0.5 }),
    }),
    [],
  );

const Box: React.FC<{ p: V3; s: V3; m: THREE.Material; r?: V3 }> = ({ p, s, m, r }) => (
  <mesh position={p} rotation={r} material={m}>
    <boxGeometry args={s} />
  </mesh>
);

const RBox: React.FC<{ p: V3; s: V3; m: THREE.Material; rad?: number }> = ({ p, s, m, rad = 0.12 }) => {
  const g = useMemo(() => new RoundedBoxGeometry(s[0], s[1], s[2], 3, Math.min(rad, s[0] / 2, s[1] / 2, s[2] / 2)), [s[0], s[1], s[2], rad]);
  return <mesh position={p} geometry={g} material={m} />;
};

/** Scattered SMD parts (caps/resistors) on the PCB — stable random layout. */
const Smd: React.FC<{ n?: number; m: THREE.Material; m2: THREE.Material; avoid: (x: number, z: number) => boolean }> = ({ n = 260, m, m2, avoid }) => {
  const meshes = useMemo(() => {
    const g = new THREE.BoxGeometry(0.22, 0.1, 0.12);
    const a = new THREE.InstancedMesh(g, m, n);
    const b = new THREE.InstancedMesh(g, m2, n);
    const o = new THREE.Object3D();
    let ia = 0;
    let ib = 0;
    for (let i = 0; i < n * 3 && ia + ib < n; i++) {
      const x = (hash(i * 3.1) - 0.5) * (CARD_L - 1.5);
      const z = (hash(i * 7.7) - 0.5) * (CARD_H - 1.2);
      if (avoid(x, z)) continue;
      o.position.set(x, 0.13, z);
      o.rotation.set(0, hash(i * 1.3) > 0.5 ? Math.PI / 2 : 0, 0);
      o.updateMatrix();
      if (hash(i * 5.3) > 0.5) a.setMatrixAt(ia++, o.matrix);
      else b.setMatrixAt(ib++, o.matrix);
    }
    a.count = ia;
    b.count = ib;
    a.instanceMatrix.needsUpdate = true;
    b.instanceMatrix.needsUpdate = true;
    return [a, b];
  }, [n, m, m2, avoid]);
  return (
    <>
      <primitive object={meshes[0]} />
      <primitive object={meshes[1]} />
    </>
  );
};

/** Soft contact shadow under an object (radial-gradient texture). */
let shadowTex: THREE.Texture | null = null;
const getShadowTex = () => {
  if (shadowTex) return shadowTex;
  const cv = document.createElement("canvas");
  cv.width = 256;
  cv.height = 256;
  const ctx = cv.getContext("2d") as CanvasRenderingContext2D;
  const g = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
  g.addColorStop(0, "rgba(0,0,0,0.85)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  shadowTex = new THREE.CanvasTexture(cv);
  return shadowTex;
};
export const ContactShadow: React.FC<{ p?: V3; w?: number; d?: number; opacity?: number }> = ({ p = [0, -0.6, 0], w = 36, d = 20, opacity = 0.9 }) => (
  <mesh position={p} rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[w, d]} />
    <meshBasicMaterial map={getShadowTex()} transparent opacity={opacity} depthWrite={false} />
  </mesh>
);

/** Instanced thin plates (heatsink fins). */
const Fins: React.FC<{ n: number; len: number; h: number; span: number; t?: number; m: THREE.Material; y: number }> = ({ n, len, h, span, t = 0.035, m, y }) => {
  const mesh = useMemo(() => {
    const g = new THREE.BoxGeometry(len, h, t);
    const im = new THREE.InstancedMesh(g, m, n);
    const o = new THREE.Object3D();
    for (let i = 0; i < n; i++) {
      o.position.set(0, y + h / 2, -span / 2 + (span * i) / (n - 1));
      o.updateMatrix();
      im.setMatrixAt(i, o.matrix);
    }
    im.instanceMatrix.needsUpdate = true;
    return im;
  }, [n, len, h, span, t, m, y]);
  return <primitive object={mesh} />;
};

/* ------------------------------------------------------------------ GA100 package */
export const SM_TOTAL = 128;
/** Which SMs are on for a given count (stable order so lighting "spreads" across the die). */
const SM_ORDER = (() => {
  const idx = Array.from({ length: SM_TOTAL }, (_, i) => i);
  return idx.sort((a, b) => hash(a + 3) - hash(b + 3));
})();
const HBM_LAYERS = 8; // each layer shown = 2 GB → 5 stacks × 8 = 80 GB

/**
 * The GPU package: substrate, interposer, die with 128 SM tiles (8 GPCs × 16), and six HBM sites
 * (five real stacks + one dummy spacer, as on GA100 boards).
 * smOn: SMs lit (0..128). memGB: lit memory (0..80). glow: emissive boost. pulse: flash 0..1.
 */
export const Ga100: React.FC<{ smOn: number; memGB: number; glow?: number; pulse?: number; lockedColor?: string; p?: V3; s?: number }> = ({
  smOn,
  memGB,
  glow = 1,
  pulse = 0,
  lockedColor = "#ff3d52",
  p = [0, 0, 0],
  s = 1,
}) => {
  const M = useMats();
  const DIE_W = 3.0;
  const DIE_D = 2.5;
  const smMesh = useMemo(() => {
    const g = new THREE.BoxGeometry(0.29, 0.03, 0.235);
    const m = new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false });
    const im = new THREE.InstancedMesh(g, m, SM_TOTAL);
    const o = new THREE.Object3D();
    // 8 GPCs in 2 rows × 4 cols; each GPC = 4 × 4 SMs
    for (let i = 0; i < SM_TOTAL; i++) {
      const gpc = Math.floor(i / 16);
      const k = i % 16;
      const gx = gpc % 4;
      const gz = Math.floor(gpc / 4);
      const x = -DIE_W / 2 + 0.17 + gx * 0.705 + (k % 4) * 0.155 + 0.04;
      const z = -DIE_D / 2 + 0.16 + gz * 1.19 + Math.floor(k / 4) * 0.255 + 0.06;
      o.position.set(x + 0.0, 0.09, z);
      o.scale.set(0.5, 1, 0.9);
      o.updateMatrix();
      im.setMatrixAt(i, o.matrix);
    }
    im.instanceMatrix.needsUpdate = true;
    return im;
  }, []);
  // colour per SM every frame
  const on = new THREE.Color("#35f29a");
  const off = new THREE.Color(lockedColor).multiplyScalar(0.2);
  const n = Math.round(smOn);
  for (let r = 0; r < SM_TOTAL; r++) {
    const i = SM_ORDER[r];
    const c = r < n ? on.clone().multiplyScalar(0.75 + 0.3 * glow + pulse * 1.2) : off;
    smMesh.setColorAt(i, c);
  }
  if (smMesh.instanceColor) smMesh.instanceColor.needsUpdate = true;

  // HBM: 6 sites; site 5 (index) is the dummy
  const sites: V3[] = [
    [-2.05, 0, -0.95],
    [-2.05, 0, 0],
    [-2.05, 0, 0.95],
    [2.05, 0, -0.95],
    [2.05, 0, 0],
    [2.05, 0, 0.95],
  ];
  const real = [0, 1, 2, 3, 4];
  const litLayers = Math.max(0, Math.min(40, memGB / 2));
  return (
    <group position={p} scale={s}>
      <Box p={[0, -0.12, 0]} s={[6.4, 0.16, 4.4]} m={M.substrate} />
      <Box p={[0, 0.0, 0]} s={[5.6, 0.08, 3.4]} m={M.interposer} />
      <Box p={[0, 0.07, 0]} s={[DIE_W, 0.06, DIE_D]} m={M.die} />
      <primitive object={smMesh} />
      {sites.map((st, si) => {
        const isDummy = !real.includes(si);
        const order = real.indexOf(si);
        return (
          <group key={si} position={[st[0], 0.05, st[2]]}>
            {Array.from({ length: HBM_LAYERS }, (_, l) => {
              const li = order * HBM_LAYERS + l; // fill stack by stack
              const lit = !isDummy && li < litLayers ? Math.min(1, litLayers - li) : 0;
              const col = new THREE.Color(isDummy ? "#24272c" : "#1b1f26");
              const em = new THREE.Color("#28d7ff").multiplyScalar(lit * (1 + pulse));
              return (
                <mesh key={l} position={[0, l * 0.055, 0]}>
                  <boxGeometry args={[0.95, 0.04, 0.8]} />
                  <meshStandardMaterial color={col} metalness={0.6} roughness={0.4} emissive={em} emissiveIntensity={4 * glow} toneMapped={false} />
                </mesh>
              );
            })}
            {isDummy ? null : <Box p={[0, HBM_LAYERS * 0.055 + 0.01, 0]} s={[0.95, 0.02, 0.8]} m={M.interposer} />}
          </group>
        );
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ the mining card */
const SMD_AVOID = (x: number, z: number) =>
  (Math.abs(x + 2.2) < 3.6 && Math.abs(z) < 2.6) || (x > 3.4 && x < 10.4 && z < -2.9) || (x > 3.4 && x < 9.8 && z > 1.9) || x > CARD_L / 2 - 2.2;
export const CARD_L = 26.7;
export const CARD_H = 11.1;
/**
 * CMP-170HX-style passive data-centre card (original procedural model, no logos).
 * explode 0..1 lifts shroud + heatsink. hideCover hides them entirely. smOn/memGB/glow drive the chip.
 * accent: colour of the edge light strip.
 */
export const Card: React.FC<{
  explode?: number;
  hideCover?: boolean;
  smOn?: number;
  memGB?: number;
  glow?: number;
  pulse?: number;
  accent?: string;
  accentK?: number;
  p?: V3;
  r?: V3;
  s?: number;
  vrmGlow?: number;
}> = ({ explode = 0, hideCover = false, smOn = 70, memGB = 8, glow = 1, pulse = 0, accent = "#35f29a", accentK = 1, p = [0, 0, 0], r = [0, 0, 0], s = 1, vrmGlow = 0 }) => {
  const M = useMats();
  const L = CARD_L;
  const H = CARD_H;
  const lift = explode * 7.5;
  const accentMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#0c0c0c", emissive: accent, emissiveIntensity: 2 }), [accent]);
  accentMat.emissiveIntensity = 2.2 * accentK;
  const vrmMat = useMemo(() => new THREE.MeshStandardMaterial({ color: "#111214", emissive: "#ffb648", emissiveIntensity: 0 }), []);
  vrmMat.emissiveIntensity = vrmGlow * 3;
  return (
    <group position={p} rotation={r} scale={s}>
      {/* PCB + backplate */}
      <Box p={[0, 0, 0]} s={[L, 0.16, H]} m={M.pcb} />
      <Box p={[0, -0.25, 0]} s={[L - 0.4, 0.3, H - 0.3]} m={M.back} />
      {/* PCIe gold fingers on the bottom edge (z+) */}
      <Box p={[-1.5, 0, H / 2 + 0.4]} s={[8.6, 0.17, 0.8]} m={M.gold} />
      <Smd m={M.smd} m2={M.smdTan} avoid={SMD_AVOID} />
      {/* GA100 package */}
      <Ga100 p={[-2.2, 0.2, 0]} smOn={smOn} memGB={memGB} glow={glow} pulse={pulse} />
      {/* VRM: chokes, caps, controller */}
      {Array.from({ length: 12 }, (_, i) => (
        <Box key={`c${i}`} p={[4.0 + (i % 6) * 1.05, 0.45, -3.6 + Math.floor(i / 6) * 1.2]} s={[0.85, 0.7, 0.85]} m={M.choke} />
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={`k${i}`} position={[4.0 + (i % 5) * 1.3, 0.35, 2.4 + Math.floor(i / 5) * 0.9]} material={M.cap}>
          <cylinderGeometry args={[0.3, 0.3, 0.55, 18]} />
        </mesh>
      ))}
      <Box p={[6.6, 0.15, -1.2]} s={[0.9, 0.12, 0.9]} m={vrmMat} />
      {/* 8-pin power at the back end */}
      <Box p={[L / 2 - 1.3, 0.75, -3.0]} s={[1.4, 1.3, 2.3]} m={M.plastic} />
      {/* bracket: vents only, no display outputs */}
      <group position={[-L / 2 - 0.08, 1.6, 0]}>
        <Box p={[0, 0, 0]} s={[0.12, 4.2, H + 0.4]} m={M.shroud} />
        {Array.from({ length: 9 }, (_, i) => (
          <Box key={i} p={[-0.05, 0.4 - (i % 3) * 1.0 + 0.6, -4 + Math.floor(i / 3) * 4]} s={[0.04, 0.55, 2.8]} m={M.back} />
        ))}
      </group>
      {hideCover ? null : (
        <>
          {/* heatsink: base + vapour plate + fins */}
          <group position={[0, lift * 0.55, 0]}>
            <Box p={[-1.5, 0.85, 0]} s={[L - 5, 0.3, H - 1.4]} m={M.copper} />
            <Fins n={46} len={L - 1.6} h={2.6} span={H - 1.0} m={M.fin} y={1.0} />
          </group>
          {/* shroud: open-ended U channel */}
          <group position={[0, lift, 0]}>
            <RBox p={[0, 3.85, 0]} s={[L, 0.22, H + 0.3]} m={M.shroud} rad={0.1} />
            <RBox p={[0, 2.05, H / 2 + 0.07]} s={[L, 3.8, 0.22]} m={M.shroud} rad={0.1} />
            <RBox p={[0, 2.05, -H / 2 - 0.07]} s={[L, 3.8, 0.22]} m={M.shroud} rad={0.1} />
            {/* dark inset panel with ribs + accent strips on the top */}
            <RBox p={[1.5, 3.97, 0]} s={[L - 7, 0.06, H - 3.2]} m={M.shroudDark} rad={0.03} />
            {Array.from({ length: 14 }, (_, i) => (
              <Box key={i} p={[1.5 - (L - 8) / 2 + (i * (L - 8)) / 13, 4.02, 0]} s={[0.12, 0.05, H - 4]} m={M.rib} />
            ))}
            {/* side-panel grooves */}
            {[-0.9, 0, 0.9].map((y, i) => (
              <Box key={`g${i}`} p={[1, 2.05 + y, H / 2 + 0.19]} s={[L - 6, 0.08, 0.03]} m={M.shroudDark} />
            ))}
            <Box p={[1.5, 3.96, H / 2 - 1.1]} s={[L - 7, 0.03, 0.12]} m={accentMat} />
            <Box p={[1.5, 3.96, -H / 2 + 1.1]} s={[L - 7, 0.03, 0.12]} m={accentMat} />
          </group>
        </>
      )}
    </group>
  );
};

/* ------------------------------------------------------------------ fuse field (16,384 eFuses) */
/**
 * 128 × 128 grid of eFuses. blown: fraction of "factory blown" fuses shown dark (stable pattern).
 * burnAt: frame-like progress 0..1 for a sweep of newly burned fuses (override records).
 * hi: highlight a row band (0..1 position, width) in amber.
 */
export const FuseField: React.FC<{ blown?: number; sweep?: number; hiRow?: number; flash?: number }> = ({ blown = 0.35, sweep = -1, hiRow = -1, flash = 0 }) => {
  const N = 128;
  const mesh = useMemo(() => {
    const g = new THREE.BoxGeometry(0.16, 0.08, 0.16);
    const m = new THREE.MeshStandardMaterial({ color: "#ffffff", metalness: 0.85, roughness: 0.3 });
    const im = new THREE.InstancedMesh(g, m, N * N);
    const o = new THREE.Object3D();
    for (let i = 0; i < N * N; i++) {
      o.position.set((i % N) * 0.22 - (N * 0.22) / 2, 0, Math.floor(i / N) * 0.22 - (N * 0.22) / 2);
      o.updateMatrix();
      im.setMatrixAt(i, o.matrix);
    }
    im.instanceMatrix.needsUpdate = true;
    return im;
  }, []);
  const gold = new THREE.Color("#d9a441");
  const dark = new THREE.Color("#1a1c20");
  const hot = new THREE.Color("#ffd27a");
  const amber = new THREE.Color("#ff8a3d");
  const green = new THREE.Color("#35f29a");
  for (let i = 0; i < N * N; i++) {
    const x = i % N;
    const z = Math.floor(i / N);
    const h = hash(i * 1.7);
    let c = h < blown ? dark : gold;
    if (hiRow >= 0 && Math.abs(z / N - hiRow) < 0.035) c = h < blown ? amber.clone().multiplyScalar(0.5) : amber;
    if (sweep >= 0) {
      const d = x / N + z / N / 6 - sweep * 1.3;
      if (d < 0 && hash(i * 3.3) < 0.18) c = green;
      else if (d < 0.03 && d >= 0) c = hot;
    }
    if (flash > 0 && h > 0.5) c = c.clone().lerp(hot, flash);
    mesh.setColorAt(i, c);
  }
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return <primitive object={mesh} />;
};

/* ------------------------------------------------------------------ glitch rig parts */
/** Thin enamelled wire drawn progressively (0..1) along a curve. */
export const Wire: React.FC<{ pts: V3[]; draw: number; color?: string; r?: number }> = ({ pts, draw, color = "#d0763c", r = 0.05 }) => {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q)));
    return new THREE.TubeGeometry(curve, 120, r, 8, false);
  }, [pts, r]);
  const total = geo.index ? geo.index.count : 0;
  geo.setDrawRange(0, Math.floor(total * Math.max(0, Math.min(1, draw)) / 6) * 6);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} metalness={0.9} roughness={0.3} emissive={color} emissiveIntensity={0.15} />
    </mesh>
  );
};

/** STM32-based glitcher board (original model): blue PCB, MCU, header pins, status LED. */
export const Glitcher: React.FC<{ p?: V3; r?: V3; s?: number; led?: number }> = ({ p = [0, 0, 0], r = [0, 0, 0], s = 1, led = 0 }) => {
  const M = useMats();
  return (
    <group position={p} rotation={r} scale={s}>
      <Box p={[0, 0, 0]} s={[4.2, 0.14, 2.6]} m={M.blue} />
      <Box p={[-0.2, 0.15, 0]} s={[1.1, 0.14, 1.1]} m={M.ic} />
      {Array.from({ length: 10 }, (_, i) => (
        <Box key={i} p={[-1.8 + i * 0.4, 0.3, 1.05]} s={[0.12, 0.5, 0.12]} m={M.gold} />
      ))}
      <mesh position={[1.5, 0.15, -0.8]}>
        <boxGeometry args={[0.25, 0.12, 0.18]} />
        <meshStandardMaterial color="#300" emissive="#ff3d52" emissiveIntensity={led * 6} />
      </mesh>
      <Box p={[1.4, 0.2, 0.2]} s={[0.7, 0.25, 0.5]} m={M.plastic} />
    </group>
  );
};

/** NVLink bridge between two standing cards with travelling light pulses. */
export const Bridge: React.FC<{ a: V3; b: V3; on: number; t: number }> = ({ a, b, on, t }) => {
  const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const mid: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  const M = useMats();
  const yaw = -Math.atan2(b[2] - a[2], b[0] - a[0]);
  return (
    <group position={mid} rotation={[0, yaw, 0]}>
      <Box p={[0, 0, 0]} s={[len, 0.5, 2.2]} m={M.shroudDark} />
      {Array.from({ length: 6 }, (_, i) => {
        const x = (((t * 0.05 + i / 6) % 1) - 0.5) * len;
        return (
          <mesh key={i} position={[x, 0.3, 0]}>
            <boxGeometry args={[0.6, 0.08, 1.6]} />
            <meshStandardMaterial color="#000" emissive="#35f29a" emissiveIntensity={on * 5} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Floor reflection-ish plane (dark glossy) for hero shots. */
export const Floor: React.FC<{ y?: number; opacity?: number }> = ({ y = -0.5, opacity = 1 }) => (
  <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
    <circleGeometry args={[60, 64]} />
    <meshStandardMaterial color="#07090c" metalness={0.6} roughness={0.38} transparent opacity={opacity} />
  </mesh>
);

/** Projects a world point to 1920×1080 screen pixels for a camera (same maths as <Cam>), for HTML callouts. */
export const project = (pt: V3, cam: { pos: V3; target: V3; fov?: number; roll?: number }): [number, number] => {
  const c = new THREE.PerspectiveCamera(cam.fov ?? 32, 1920 / 1080, 0.1, 500);
  c.position.set(...cam.pos);
  const roll = cam.roll ?? 0;
  c.up.set(Math.sin(roll), Math.cos(roll), 0);
  c.lookAt(...cam.target);
  c.updateMatrixWorld();
  const v = new THREE.Vector3(...pt).project(c);
  return [(v.x * 0.5 + 0.5) * 1920, (-v.y * 0.5 + 0.5) * 1080];
};
