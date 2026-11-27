/**
 * UG-006 "No More RTX 50" — procedural 3D library, part 1 (stage, materials, hero hardware).
 * Original models only (no logos, no external meshes). Units ≈ cm, Y up. Every value is a pure
 * function of props → deterministic frames on the render farm.
 */
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import React, { useEffect, useLayoutEffect, useMemo } from "react";
import { useVideoConfig } from "remotion";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type V3 = [number, number, number];
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const mixV = (a: V3, b: V3, t: number): V3 => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
export const hash = (n: number) => {
  const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return v - Math.floor(v);
};
export const sat = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => {
  const t = sat(x);
  return t * t * (3 - 2 * t);
};

/* ===================================================================== palette */
export const P = {
  bg: "#0b0c0e",
  char: "#16181c",
  gun: "#2a2e35",
  orange: "#ff7a2f",
  coral: "#ff5a4e",
  white: "#f4f2ee",
  amber: "#ffb547",
  cool: "#bcd6ff",
};

/* ===================================================================== stage */
const Env: React.FC<{ intensity: number; exposure: number }> = ({ intensity, exposure }) => {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = exposure;
    gl.outputColorSpace = THREE.SRGBColorSpace;
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = tex;
    scene.environmentIntensity = intensity;
    return () => {
      tex.dispose();
      pm.dispose();
    };
  }, [gl, scene, intensity, exposure]);
  return null;
};

export type CamP = { pos: V3; target: V3; fov?: number; roll?: number };
export const Cam: React.FC<CamP> = ({ pos, target, fov = 32, roll = 0 }) => {
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

/** Scene fog (exp2) in the frame's background colour, for depth falloff in big environments. */
const Fog: React.FC<{ color: string; density: number }> = ({ color, density }) => {
  const { scene } = useThree();
  useLayoutEffect(() => {
    scene.fog = density > 0 ? new THREE.FogExp2(color, density) : null;
  }, [scene, color, density]);
  return null;
};

/**
 * Standard UG-006 studio: warm key, cool-white rim, orange kicker. Transparent canvas (CSS bg below).
 * light: overall multiplier (0 = dark, used for power-on / light-up beats).
 */
export const Stage: React.FC<{
  children: React.ReactNode;
  cam: CamP;
  light?: number;
  env?: number;
  exposure?: number;
  fog?: number;
  fogColor?: string;
  rim?: string;
  kick?: string;
  keyPos?: V3;
}> = ({ children, cam, light = 1, env = 0.55, exposure = 1.0, fog = 0, fogColor = P.bg, rim = P.cool, kick = P.orange, keyPos = [14, 26, 20] }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} camera={{ fov: 32, near: 0.1, far: 2000, position: [0, 20, 40] }}>
      <Env intensity={env * light} exposure={exposure} />
      <Fog color={fogColor} density={fog} />
      <Cam {...cam} />
      <ambientLight intensity={0.08 * light} />
      <directionalLight position={keyPos} intensity={2.0 * light} color="#ffe9d2" />
      <pointLight position={[-34, 12, -26]} intensity={1600 * light} distance={180} color={rim} />
      <pointLight position={[30, 4, -20]} intensity={1300 * light} distance={150} color={kick} />
      <spotLight position={[0, 46, 8]} angle={0.5} penumbra={0.9} intensity={700 * light} distance={200} color="#ffffff" />
      {children}
    </ThreeCanvas>
  );
};

/* ===================================================================== textures */
const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat: [number, number] = [1, 1]) => {
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  draw(cv.getContext("2d") as CanvasRenderingContext2D);
  const t = new THREE.CanvasTexture(cv);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.anisotropy = 8;
  return t;
};
const memo = <T,>(fn: () => T) => {
  let v: T | null = null;
  return () => (v ??= fn());
};
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

export const brushedTex = memo(() =>
  canvasTex(1024, 256, (g) => {
    g.fillStyle = "#808080";
    g.fillRect(0, 0, 1024, 256);
    const r = rng(7);
    for (let i = 0; i < 2600; i++) {
      const v = Math.floor(90 + r() * 90);
      g.fillStyle = `rgba(${v},${v},${v},${0.25 + r() * 0.35})`;
      g.fillRect(r() * 1024 - 200, r() * 256, 200 + r() * 700, 0.6 + r() * 1.2);
    }
  }, [1.5, 3]),
);
/** PCB: dark solder mask with faint copper traces. */
export const pcbTex = memo(() =>
  canvasTex(1024, 512, (g) => {
    g.fillStyle = "#0c1611";
    g.fillRect(0, 0, 1024, 512);
    const r = rng(11);
    g.strokeStyle = "rgba(120,160,120,0.16)";
    g.lineWidth = 2;
    for (let i = 0; i < 260; i++) {
      let x = r() * 1024;
      let y = r() * 512;
      g.beginPath();
      g.moveTo(x, y);
      for (let k = 0; k < 4; k++) {
        if (r() > 0.5) x += (r() - 0.5) * 220;
        else y += (r() - 0.5) * 160;
        g.lineTo(x, y);
      }
      g.stroke();
    }
    g.fillStyle = "rgba(200,180,120,0.25)";
    for (let i = 0; i < 400; i++) g.fillRect(r() * 1024, r() * 512, 3, 3);
  }),
);
/** Wafer die grid (square dies on a disc, colour variation), emissive-friendly. */
export const waferTex = memo(() =>
  canvasTex(1024, 1024, (g) => {
    const grd = g.createLinearGradient(0, 0, 1024, 1024);
    grd.addColorStop(0, "#3a3550");
    grd.addColorStop(0.35, "#1d4b5c");
    grd.addColorStop(0.6, "#5a3a2a");
    grd.addColorStop(1, "#2a3a5a");
    g.fillStyle = grd;
    g.fillRect(0, 0, 1024, 1024);
    const n = 26;
    const s = 1024 / n;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        g.strokeStyle = "rgba(10,10,14,0.85)";
        g.lineWidth = 3;
        g.strokeRect(i * s, j * s, s, s);
        g.fillStyle = `rgba(255,255,255,${0.03 + ((i * 7 + j * 13) % 5) * 0.012})`;
        g.fillRect(i * s + 6, j * s + 6, s - 12, s - 12);
        g.fillStyle = "rgba(255,200,140,0.10)";
        g.fillRect(i * s + 10, j * s + 10, s * 0.35, s * 0.25);
      }
  }),
);
/** Die floorplan (compute tiles + cache stripes) for macro shots. */
export const dieTex = memo(() =>
  canvasTex(1024, 1024, (g) => {
    g.fillStyle = "#16181e";
    g.fillRect(0, 0, 1024, 1024);
    const r = rng(5);
    for (let i = 0; i < 12; i++)
      for (let j = 0; j < 8; j++) {
        const x = 40 + i * 79;
        const y = 120 + j * 100;
        g.fillStyle = `rgb(${40 + r() * 20},${44 + r() * 20},${58 + r() * 24})`;
        g.fillRect(x, y, 70, 88);
        g.fillStyle = "rgba(255,150,80,0.18)";
        g.fillRect(x + 6, y + 8, 58, 18);
        g.fillStyle = "rgba(180,200,255,0.10)";
        for (let k = 0; k < 5; k++) g.fillRect(x + 6, y + 34 + k * 10, 58, 4);
      }
    g.fillStyle = "#2a2f3a";
    g.fillRect(40, 30, 944, 70);
    g.fillRect(40, 924, 944, 70);
    g.fillStyle = "rgba(255,255,255,0.06)";
    for (let k = 0; k < 90; k++) g.fillRect(40 + k * 10.5, 36, 6, 58);
  }),
);

/* ===================================================================== materials */
export const useMats = () =>
  useMemo(
    () => ({
      alu: new THREE.MeshPhysicalMaterial({ color: "#c9ccd1", metalness: 1, roughness: 0.28, roughnessMap: brushedTex(), clearcoat: 0.4, clearcoatRoughness: 0.2 }),
      gunmetal: new THREE.MeshPhysicalMaterial({ color: "#3a3e45", metalness: 1, roughness: 0.32, roughnessMap: brushedTex(), bumpMap: brushedTex(), bumpScale: 0.4, clearcoat: 0.5 }),
      black: new THREE.MeshPhysicalMaterial({ color: "#0c0d10", metalness: 0.6, roughness: 0.4, clearcoat: 0.4 }),
      satin: new THREE.MeshStandardMaterial({ color: "#16181c", metalness: 0.3, roughness: 0.55 }),
      fin: new THREE.MeshStandardMaterial({ color: "#1c1f24", metalness: 0.9, roughness: 0.35 }),
      finSilver: new THREE.MeshStandardMaterial({ color: "#aeb4bc", metalness: 1, roughness: 0.25 }),
      blade: new THREE.MeshStandardMaterial({ color: "#121316", metalness: 0.2, roughness: 0.5, side: THREE.DoubleSide }),
      pcb: new THREE.MeshStandardMaterial({ color: "#ffffff", map: pcbTex(), metalness: 0.25, roughness: 0.55 }),
      gold: new THREE.MeshStandardMaterial({ color: "#e3b450", metalness: 1, roughness: 0.22 }),
      chip: new THREE.MeshStandardMaterial({ color: "#121316", metalness: 0.35, roughness: 0.42 }),
      die: new THREE.MeshPhysicalMaterial({ color: "#ffffff", map: dieTex(), metalness: 0.9, roughness: 0.15, clearcoat: 1 }),
      silicon: new THREE.MeshPhysicalMaterial({ color: "#454b57", metalness: 0.95, roughness: 0.12, clearcoat: 1, iridescence: 0.6, iridescenceIOR: 1.6 }),
      substrate: new THREE.MeshStandardMaterial({ color: "#2b5a3e", metalness: 0.3, roughness: 0.5 }),
      interposer: new THREE.MeshStandardMaterial({ color: "#6a7079", metalness: 0.8, roughness: 0.25 }),
      copper: new THREE.MeshStandardMaterial({ color: "#c8794a", metalness: 1, roughness: 0.26 }),
      plastic: new THREE.MeshStandardMaterial({ color: "#0f1012", metalness: 0.05, roughness: 0.75 }),
      // No `transmission`: SwiftShader (Actions CPU render) draws the transmission pass as an opaque dark sheet,
      // which hid everything inside the tower. Plain alpha glass + clearcoat sheen renders the same everywhere.
      glass: new THREE.MeshPhysicalMaterial({ color: "#a9b6c4", metalness: 0, roughness: 0.04, transparent: true, opacity: 0.1, depthWrite: false, clearcoat: 1, clearcoatRoughness: 0.05 }),
      rubber: new THREE.MeshStandardMaterial({ color: "#090909", metalness: 0, roughness: 0.9 }),
      white: new THREE.MeshStandardMaterial({ color: "#e9e6e1", metalness: 0.1, roughness: 0.45 }),
      velvet: new THREE.MeshStandardMaterial({ color: "#2a0f12", metalness: 0, roughness: 1 }),
      concrete: new THREE.MeshStandardMaterial({ color: "#2a2b2e", metalness: 0.05, roughness: 0.9 }),
      steel: new THREE.MeshStandardMaterial({ color: "#6b7079", metalness: 0.9, roughness: 0.4 }),
      floor: new THREE.MeshStandardMaterial({ color: "#0a0b0d", metalness: 0.7, roughness: 0.3 }),
    }),
    [],
  );
export type Mats = ReturnType<typeof useMats>;

/** Emissive material whose intensity is set per render (cheap: one material per call site). */
export const useGlow = (color: string, k: number) => {
  const m = useMemo(() => new THREE.MeshStandardMaterial({ color: "#050505", emissive: color, emissiveIntensity: 1, toneMapped: false }), [color]);
  m.emissiveIntensity = k;
  return m;
};
/** Fades every material under a group (for dissolves) — clones materials once. */
export const Fade: React.FC<{ o: number; children: React.ReactNode }> = ({ o, children }) => {
  const ref = React.useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    ref.current?.traverse((n) => {
      const m = (n as THREE.Mesh).material as THREE.Material | undefined;
      if (!m || Array.isArray(m)) return;
      if (!m.userData.faded) {
        const c = m.clone();
        c.userData.faded = true;
        c.userData.baseOpacity = m.opacity;
        (n as THREE.Mesh).material = c;
      }
      const mm = (n as THREE.Mesh).material as THREE.Material;
      mm.transparent = true;
      mm.opacity = (mm.userData.baseOpacity ?? 1) * o;
      mm.depthWrite = o > 0.98;
    });
  });
  if (o <= 0.001) return null;
  return <group ref={ref}>{children}</group>;
};

/* ===================================================================== primitives */
export const Box: React.FC<{ p?: V3; s: V3; m: THREE.Material; r?: V3 }> = ({ p = [0, 0, 0], s, m, r }) => (
  <mesh position={p} rotation={r} material={m}>
    <boxGeometry args={s} />
  </mesh>
);
export const RBox: React.FC<{ p?: V3; s: V3; m: THREE.Material; rad?: number; r?: V3 }> = ({ p = [0, 0, 0], s, m, rad = 0.12, r }) => {
  const g = useMemo(() => new RoundedBoxGeometry(s[0], s[1], s[2], 3, Math.min(rad, s[0] / 2, s[1] / 2, s[2] / 2)), [s[0], s[1], s[2], rad]);
  return <mesh position={p} rotation={r} geometry={g} material={m} />;
};
export const Cyl: React.FC<{ p?: V3; r?: V3; rt: number; rb?: number; h: number; m: THREE.Material; seg?: number }> = ({ p = [0, 0, 0], r, rt, rb, h, m, seg = 32 }) => (
  <mesh position={p} rotation={r} material={m}>
    <cylinderGeometry args={[rt, rb ?? rt, h, seg]} />
  </mesh>
);
/** Instanced boxes from a list of transforms. Reuses one InstancedMesh (capacity grows in powers of 2)
 * and only rewrites the matrices each frame, so per-frame item lists don't leak GPU buffers. */
const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);
export const Inst: React.FC<{ items: { p: V3; s?: V3; r?: V3 }[]; m: THREE.Material; geo?: THREE.BufferGeometry }> = ({ items, m, geo }) => {
  const g = geo ?? UNIT_BOX;
  const cap = Math.max(16, 2 ** Math.ceil(Math.log2(Math.max(1, items.length))));
  const mesh = useMemo(() => {
    const im = new THREE.InstancedMesh(g, m, cap);
    im.frustumCulled = false;
    return im;
  }, [g, m, cap]);
  useEffect(() => () => void mesh.dispose(), [mesh]);
  const o = TMP;
  items.forEach((it, i) => {
    o.position.set(...it.p);
    o.rotation.set(...(it.r ?? ZERO));
    o.scale.set(...(it.s ?? ONE));
    o.updateMatrix();
    mesh.setMatrixAt(i, o.matrix);
  });
  mesh.count = items.length;
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};
const TMP = new THREE.Object3D();
const ZERO: V3 = [0, 0, 0];
const ONE: V3 = [1, 1, 1];

/** Soft radial contact shadow. */
const shadowTex = memo(() =>
  canvasTex(256, 256, (g) => {
    const r = g.createRadialGradient(128, 128, 8, 128, 128, 128);
    r.addColorStop(0, "rgba(0,0,0,0.9)");
    r.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, 256, 256);
  }),
);
export const Shadow: React.FC<{ p?: V3; w?: number; d?: number; o?: number }> = ({ p = [0, -0.05, 0], w = 36, d = 20, o = 0.85 }) => (
  <mesh position={p} rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[w, d]} />
    <meshBasicMaterial map={shadowTex()} transparent opacity={o} depthWrite={false} />
  </mesh>
);
/** Glossy dark studio floor (reflective-looking), radius r. */
export const Floor: React.FC<{ y?: number; r?: number; color?: string }> = ({ y = 0, r = 120, color = "#08090b" }) => (
  <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
    <circleGeometry args={[r, 72]} />
    <meshStandardMaterial color={color} metalness={0.75} roughness={0.32} />
  </mesh>
);
/** Additive glow sprite (fake bloom). */
const glowTex = memo(() =>
  canvasTex(128, 128, (g) => {
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, "rgba(255,255,255,1)");
    r.addColorStop(0.25, "rgba(255,255,255,0.45)");
    r.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
  }),
);
export const Glow: React.FC<{ p: V3; s: number; color: string; o?: number }> = ({ p, s, color, o = 1 }) =>
  o <= 0 ? null : (
    <sprite position={p} scale={[s, s, s]}>
      <spriteMaterial map={glowTex()} color={color} transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </sprite>
  );

const SPHERE = new THREE.SphereGeometry(1, 6, 6);
/** Deterministic particle cloud (instanced tiny spheres), positions computed by fn(i) each frame. */
export const Particles: React.FC<{ n: number; fn: (i: number) => { p: V3; s: number } | null; color: string; k?: number }> = ({ n, fn, color, k = 3 }) => {
  const mat = useGlow(color, k);
  const mesh = useMemo(() => {
    const im = new THREE.InstancedMesh(SPHERE, mat, n);
    im.frustumCulled = false;
    return im;
  }, [n, mat]);
  const o = new THREE.Object3D();
  let c = 0;
  for (let i = 0; i < n; i++) {
    const r = fn(i);
    if (!r || r.s <= 0) continue;
    o.position.set(...r.p);
    o.scale.setScalar(r.s);
    o.updateMatrix();
    mesh.setMatrixAt(c++, o.matrix);
  }
  mesh.count = c;
  mesh.instanceMatrix.needsUpdate = true;
  return <primitive object={mesh} />;
};

/* ===================================================================== fan */
export const Fan: React.FC<{ r?: number; spin: number; M: Mats; ring?: THREE.Material; blades?: number; frame?: THREE.Material }> = ({ r = 4.3, spin, M, ring, blades = 9, frame }) => (
  <group>
    <mesh rotation={[Math.PI / 2, 0, 0]} material={frame ?? M.black}>
      <torusGeometry args={[r + 0.15, 0.22, 10, 56]} />
    </mesh>
    {ring ? (
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.08, 0]} material={ring}>
        <torusGeometry args={[r - 0.05, 0.06, 8, 56]} />
      </mesh>
    ) : null}
    <group rotation={[0, spin, 0]}>
      <Cyl rt={r * 0.27} rb={r * 0.3} h={0.45} m={M.black} />
      <Cyl p={[0, 0.24, 0]} rt={r * 0.2} h={0.04} m={M.alu} />
      {Array.from({ length: blades }, (_, i) => (
        <group key={i} rotation={[0, (i / blades) * Math.PI * 2, 0]}>
          <mesh position={[r * 0.62, 0, 0]} rotation={[0.42, 0, 0.1]} material={M.blade}>
            <boxGeometry args={[r * 0.7, 0.04, r * 0.3]} />
          </mesh>
        </group>
      ))}
    </group>
  </group>
);

/* ===================================================================== RTX 50 Founders-style card */
/**
 * Dual-fan, double flow-through card (silver frame, dark fin stack visible between the fans,
 * light bar on the top edge). No logos — model names are on-screen text only.
 * cls: "90"/"80" → 30.4 × 13.7 cm; "70" → 24.2 × 11.2 cm. Lies flat, fans facing +Y.
 */
export const FE_DIMS = { "90": [30.4, 13.7], "80": [30.4, 13.7], "70": [24.2, 11.2] } as const;
export const FeCard: React.FC<{ cls?: "90" | "80" | "70"; spin?: number; light?: number; p?: V3; r?: V3; s?: number; lightColor?: string }> = ({
  cls = "90",
  spin = 0,
  light = 1,
  p = [0, 0, 0],
  r = [0, 0, 0],
  s = 1,
  lightColor = "#f4f2ee",
}) => {
  const M = useMats();
  const [L, W] = FE_DIMS[cls];
  const T = 3.9;
  const bar = useGlow(lightColor, 2.2 * light);
  const ringM = useGlow(lightColor, 0.6 * light);
  const fanR = W * 0.36;
  const fanX = L / 2 - fanR - 1.1;
  const fins = useMemo(() => {
    const n = Math.round((L - 4 * fanR - 3) / 0.32);
    return Array.from({ length: Math.max(0, n) }, (_, i) => ({ p: [-(L - 4 * fanR - 3) / 2 + i * 0.32, 0, 0] as V3, s: [0.07, T - 0.8, W - 1.8] as V3 }));
  }, [L, W, fanR]);
  return (
    <group position={p} rotation={r} scale={s}>
      {/* frame: top + bottom rails and end caps in brushed aluminium */}
      <RBox p={[0, 0, W / 2 - 0.45]} s={[L, T, 0.9]} m={M.alu} rad={0.35} />
      <RBox p={[0, 0, -W / 2 + 0.45]} s={[L, T, 0.9]} m={M.alu} rad={0.35} />
      <RBox p={[L / 2 - 0.5, 0, 0]} s={[1.0, T, W]} m={M.alu} rad={0.3} />
      <RBox p={[-L / 2 + 0.5, 0, 0]} s={[1.0, T, W]} m={M.alu} rad={0.3} />
      {/* fan housings (dark faces) */}
      {[fanX, -fanX].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <RBox p={[0, 0, 0]} s={[fanR * 2 + 1.0, T - 0.2, W - 1.6]} m={M.gunmetal} rad={0.2} />
          <group position={[0, T / 2 - 0.05, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
              <circleGeometry args={[fanR + 0.2, 48]} />
              <meshStandardMaterial color="#030304" />
            </mesh>
            <Fan r={fanR} spin={spin * (x > 0 ? 1 : -1)} M={M} ring={ringM} blades={7} frame={M.alu} />
          </group>
        </group>
      ))}
      {/* exposed fin stack between the fans (flow-through) */}
      <group position={[0, 0, 0]}>
        <Inst items={fins} m={M.fin} />
        <Box p={[0, T / 2 - 0.25, 0]} s={[L - 4 * fanR - 3, 0.1, W - 1.8]} m={M.black} />
      </group>
      {/* light bar on the top edge (+Z face) */}
      <Box p={[0, 0.1, W / 2 + 0.01]} s={[L * 0.42, 0.28, 0.04]} m={bar} />
      <Glow p={[0, 0.1, W / 2 + 0.6]} s={L * 0.5} color={lightColor} o={0.25 * light} />
      {/* power connector + bracket + PCIe fingers */}
      <Box p={[L * 0.12, 0.2, W / 2 + 0.3]} s={[1.8, 0.8, 0.6]} m={M.plastic} />
      <group position={[-L / 2 - 0.15, 0, 0]}>
        <Box s={[0.12, T + 0.3, W + 0.6]} m={M.alu} />
        {[-3.5, -1.2, 1.2].map((z) => (
          <Box key={z} p={[-0.07, -0.4, z * (W / 13.7)]} s={[0.05, 1.2, 1.6]} m={M.plastic} />
        ))}
      </group>
      <Box p={[-L * 0.12, -T / 2 + 0.1, -W / 2 - 0.4]} s={[L * 0.28, 0.16, 0.8]} m={M.gold} />
    </group>
  );
};

/* ===================================================================== DDR5 */
/**
 * DDR5 UDIMM (13.3 × 3.1 cm), standing on its edge connector (long axis X, height Y, faces ±Z).
 * spreader: 1 = heat spreader on, 0 = slid off upward. rgb: top light bar intensity. kind "rdimm" = server (no spreader, 10 chips/side, taller).
 */
export const DIMM_L = 13.3;
export const Dimm: React.FC<{ spreader?: number; rgb?: number; phase?: number; p?: V3; r?: V3; s?: number; kind?: "udimm" | "rdimm"; chipGlow?: number; accent?: string }> = ({
  spreader = 1,
  rgb = 0,
  phase = 0,
  p = [0, 0, 0],
  r = [0, 0, 0],
  s = 1,
  kind = "udimm",
  chipGlow = 0,
  accent = P.orange,
}) => {
  const M = useMats();
  const H = kind === "rdimm" ? 3.1 : 3.1;
  const chipsN = kind === "rdimm" ? 5 : 4;
  const cg = useGlow(accent, chipGlow * 1.5);
  const rgbA = useGlow(P.orange, rgb * (1.6 + 0.8 * Math.sin(phase)));
  const rgbB = useGlow(P.coral, rgb * (1.6 + 0.8 * Math.sin(phase + 2)));
  const pins = useMemo(() => Array.from({ length: 64 }, (_, i) => ({ p: [-DIMM_L / 2 + 0.6 + i * 0.19 + (i >= 30 ? 0.5 : 0), 0.2, 0] as V3, s: [0.12, 0.38, 0.1] as V3 })), []);
  const lift = (1 - spreader) * 5;
  return (
    <group position={p} rotation={r} scale={s}>
      <Box p={[0, H / 2, 0]} s={[DIMM_L, H, 0.1]} m={M.pcb} />
      <Inst items={pins} m={M.gold} />
      {[1, -1].map((side) => (
        <group key={side} position={[0, 0, side * 0.09]}>
          {Array.from({ length: chipsN * 2 }, (_, i) => {
            const half = i < chipsN ? -1 : 1;
            const k = i % chipsN;
            const x = half * (0.9 + k * (kind === "rdimm" ? 1.1 : 1.35)) + (half > 0 ? 0 : 0);
            return <Box key={i} p={[x, H * 0.55, 0]} s={[0.95, 1.1, 0.12]} m={chipGlow > 0 ? cg : M.chip} />;
          })}
          {/* PMIC + SPD hub */}
          <Box p={[0, H * 0.35, 0]} s={[0.55, 0.55, 0.1]} m={M.chip} />
          <Box p={[0, H * 0.78, 0]} s={[0.35, 0.3, 0.08]} m={M.chip} />
        </group>
      ))}
      {kind === "udimm" && spreader > 0.001 ? (
        <group position={[0, lift, 0]}>
          {[1, -1].map((side) => (
            <group key={side}>
              <RBox p={[0, H * 0.62, side * 0.26]} s={[DIMM_L + 0.1, H * 0.95, 0.14]} m={M.gunmetal} rad={0.05} />
              <Box p={[3.2, H * 0.6, side * 0.34]} s={[4.2, 0.12, 0.02]} m={rgbA} />
            </group>
          ))}
          <RBox p={[0, H + 0.35, 0]} s={[DIMM_L + 0.1, 0.55, 0.62]} m={M.black} rad={0.1} />
          {/* light diffuser on top */}
          <Box p={[-DIMM_L / 4, H + 0.66, 0]} s={[DIMM_L / 2 - 0.2, 0.1, 0.4]} m={rgbA} />
          <Box p={[DIMM_L / 4, H + 0.66, 0]} s={[DIMM_L / 2 - 0.2, 0.1, 0.4]} m={rgbB} />
          {rgb > 0 ? <Glow p={[0, H + 0.9, 0]} s={DIMM_L * 0.9} color={P.orange} o={0.18 * rgb} /> : null}
        </group>
      ) : null}
    </group>
  );
};

/* ===================================================================== HBM stack */
/**
 * HBM stack: base logic die + n DRAM dies, TSV columns, micro-bumps. explode: vertical separation.
 * tsv: 0..1 glow of the TSV columns (data flowing). Footprint ≈ 1.1 × 1.0 (scale up for macro).
 */
export const Hbm: React.FC<{ n?: number; explode?: number; tsv?: number; p?: V3; r?: V3; s?: number }> = ({ n = 8, explode = 0, tsv = 0, p = [0, 0, 0], r = [0, 0, 0], s = 1 }) => {
  const M = useMats();
  const tsvM = useGlow(P.orange, 0.3 + tsv * 4);
  const gap = 0.07 + explode * 0.55;
  const cols = useMemo(() => {
    const out: { p: V3; s: V3 }[] = [];
    for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) out.push({ p: [-0.38 + i * 0.152, 0, -0.27 + j * 0.18], s: [0.022, 1, 0.022] });
    return out;
  }, []);
  const h = 0.06;
  const top = 0.12 + n * (h + gap);
  return (
    <group position={p} rotation={r} scale={s}>
      <Box p={[0, 0.06, 0]} s={[1.1, 0.12, 1.0]} m={M.die} />
      {Array.from({ length: n }, (_, i) => (
        <group key={i} position={[0, 0.12 + gap + i * (h + gap) + h / 2, 0]}>
          <Box s={[1.05, h, 0.95]} m={M.silicon} />
        </group>
      ))}
      <group position={[0, top / 2, 0]} scale={[1, top, 1]}>
        <Inst items={cols} m={tsvM} />
      </group>
      {tsv > 0 ? <Glow p={[0, top / 2, 0]} s={2.2} color={P.orange} o={0.25 * tsv} /> : null}
    </group>
  );
};

/* ===================================================================== AI accelerator package */
/**
 * Substrate → silicon interposer → 2 compute dies + 8 HBM stacks. explode separates the layers
 * vertically; label positions are exported for HTML callouts. Footprint ≈ 10 × 8.
 */
export const Accel: React.FC<{ explode?: number; hbmGlow?: number; dieGlow?: number; p?: V3; r?: V3; s?: number }> = ({ explode = 0, hbmGlow = 0, dieGlow = 0, p = [0, 0, 0], r = [0, 0, 0], s = 1 }) => {
  const M = useMats();
  const dg = useGlow(P.orange, dieGlow * 1.2);
  const e = explode;
  const balls = useMemo(() => {
    const out: { p: V3; s: V3 }[] = [];
    for (let i = 0; i < 26; i++) for (let j = 0; j < 20; j++) out.push({ p: [-4.6 + i * 0.37, -0.32, -3.6 + j * 0.38], s: [0.16, 0.16, 0.16] });
    return out;
  }, []);
  const ball = useMemo(() => new THREE.SphereGeometry(0.5, 8, 6), []);
  return (
    <group position={p} rotation={r} scale={s}>
      {/* substrate + BGA */}
      <Box p={[0, -0.12, 0]} s={[10.2, 0.32, 8.2]} m={M.substrate} />
      <Inst items={balls} m={M.gold} geo={ball} />
      {/* interposer */}
      <group position={[0, 0.12 + e * 2.2, 0]}>
        <Box p={[0, 0.06, 0]} s={[8.2, 0.12, 5.8]} m={M.interposer} />
        {/* compute dies */}
        <group position={[0, 0.25 + e * 1.6, 0]}>
          {[-1.35, 1.35].map((x) => (
            <group key={x}>
              <Box p={[x, 0, 0]} s={[2.5, 0.26, 4.0]} m={M.die} />
              {dieGlow > 0 ? <Box p={[x, 0.14, 0]} s={[2.3, 0.02, 3.8]} m={dg} /> : null}
            </group>
          ))}
        </group>
        {/* HBM stacks: 4 per side */}
        <group position={[0, 0.12 + e * 3.2, 0]}>
          {[-1, 1].map((side) =>
            [-1.95, -0.65, 0.65, 1.95].map((z) => <Hbm key={`${side}${z}`} p={[side * 3.4, 0, z * 0.95]} s={1.05} n={8} tsv={hbmGlow} />),
          )}
        </group>
      </group>
      {/* stiffener ring */}
      <Box p={[0, 0.16, 3.85]} s={[10.2, 0.28, 0.4]} m={M.alu} />
      <Box p={[0, 0.16, -3.85]} s={[10.2, 0.28, 0.4]} m={M.alu} />
    </group>
  );
};

/* ===================================================================== wafer */
/**
 * 300 mm wafer (radius 15). sectors: optional colour allocation (array of [fraction, colour]) shown
 * as an emissive overlay; sweep: angle of a highlight band. glow: die-grid emissive.
 */
export const Wafer: React.FC<{ p?: V3; r?: V3; s?: number; sectors?: [number, string][]; sectorK?: number; glow?: number }> = ({ p = [0, 0, 0], r = [0, 0, 0], s = 1, sectors, sectorK = 0, glow = 0 }) => {
  const mat = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#ffffff", map: waferTex(), metalness: 0.95, roughness: 0.1, clearcoat: 1, iridescence: 0.9, iridescenceIOR: 1.8, emissive: "#ff9a5a", emissiveMap: waferTex(), emissiveIntensity: 0 }),
    [],
  );
  mat.emissiveIntensity = glow;
  const sk = sectors ? sectors.map(([fr, col]) => `${fr.toFixed(3)}${col}`).join("|") : "";
  const segs = useMemo(() => {
    if (!sectors) return [];
    let a = 0;
    return sectors.map(([fr, col]) => {
      const g = new THREE.CircleGeometry(15.02, 64, a, fr * Math.PI * 2);
      a += fr * Math.PI * 2;
      return { g, col };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sk]);
  useEffect(() => () => segs.forEach((x) => x.g.dispose()), [segs]);
  return (
    <group position={p} rotation={r} scale={s}>
      <mesh material={mat} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[15, 96]} />
      </mesh>
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[15, 15, 0.1, 96]} />
        <meshStandardMaterial color="#8d939c" metalness={1} roughness={0.2} />
      </mesh>
      {segs.map(({ g, col }, i) => (
        <mesh key={i} geometry={g} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <meshBasicMaterial color={col} transparent opacity={0.55 * sectorK} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

/* ===================================================================== DRAM cell array */
/**
 * Microscopic 1T1C DRAM array: capacitor pillars on a transistor (word-line/bit-line) grid.
 * charge(i, j) → 0..1 lights a cell. Grid n×n, pitch 1.
 */
export const DramArray: React.FC<{ n?: number; charge: (i: number, j: number) => number; p?: V3; s?: number }> = ({ n = 18, charge, p = [0, 0, 0], s = 1 }) => {
  const M = useMats();
  const lit = useGlow(P.orange, 3);
  const off = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#5c6470", metalness: 0.9, roughness: 0.2, clearcoat: 1 }), []);
  const geo = useMemo(() => new THREE.CylinderGeometry(0.22, 0.26, 1, 14), []);
  const on: { p: V3; s: V3 }[] = [];
  const dark: { p: V3; s: V3 }[] = [];
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) {
      const c = charge(i, j);
      const it = { p: [i - n / 2 + 0.5, 1.6, j - n / 2 + 0.5] as V3, s: [1, 2.6, 1] as V3 };
      (c > 0.5 ? on : dark).push(it);
    }
  const lines = useMemo(() => {
    const out: { p: V3; s: V3 }[] = [];
    for (let i = 0; i < n; i++) out.push({ p: [i - n / 2 + 0.5, 0.15, 0], s: [0.16, 0.1, n] });
    for (let j = 0; j < n; j++) out.push({ p: [0, 0.32, j - n / 2 + 0.5], s: [n, 0.1, 0.12] });
    return out;
  }, [n]);
  return (
    <group position={p} scale={s}>
      <Box p={[0, -0.2, 0]} s={[n + 1, 0.4, n + 1]} m={M.silicon} />
      <Inst items={lines} m={M.copper} />
      <Inst items={dark} m={off} geo={geo} />
      <Inst items={on} m={lit} geo={geo} />
    </group>
  );
};

/** FinFET-style transistor cross-section (source / gate / drain on a fin) for the macro dive. */
export const Transistor: React.FC<{ p?: V3; s?: number; on?: number }> = ({ p = [0, 0, 0], s = 1, on = 0 }) => {
  const M = useMats();
  const ch = useGlow(P.orange, on * 3);
  return (
    <group position={p} scale={s}>
      <Box p={[0, -0.5, 0]} s={[8, 1, 4]} m={M.silicon} />
      <Box p={[0, 0.4, 0]} s={[7, 0.8, 0.8]} m={M.interposer} />
      <Box p={[0, 0.82, 0]} s={[5.4, 0.05, 0.82]} m={ch} />
      <Box p={[-2.8, 0.9, 0]} s={[1.4, 1.0, 2.2]} m={M.copper} />
      <Box p={[2.8, 0.9, 0]} s={[1.4, 1.0, 2.2]} m={M.copper} />
      <Box p={[0, 1.2, 0]} s={[1.6, 1.6, 2.6]} m={M.gold} />
    </group>
  );
};
