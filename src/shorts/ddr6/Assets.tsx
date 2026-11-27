/**
 * SH-DDR6 — new procedural 3D assets for this Short (original designs, no logos, no external meshes).
 * Units ≈ cm, Y up. DDR6 = orange-gold concept module (not a real product render), DDR5 = silver-blue.
 */
import { useThree } from "@react-three/fiber";
import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { Box, Cyl, Glow, hash, P, Particles, pcbTex, RBox, useGlow, useMats, type V3 } from "../../ug6/Three6";
import { Text3D } from "../../ug6/World6";

export const DDR6_ORANGE = "#ff8a2a";
export const DDR5_BLUE = "#7fb4ff";

/** Enables per-material clipping planes in the current canvas (needed for scan / build-up effects). */
export const ClipOn: React.FC = () => {
  const { gl } = useThree();
  useLayoutEffect(() => {
    gl.localClippingEnabled = true;
  }, [gl]);
  return null;
};

/* ===================================================================== memory module (DDR6 / DDR5) */
export const MOD_L = 13.3;
export const MOD_H = 3.4;
/** Key-notch position along the edge (x, from centre). The two generations are keyed differently. */
export const NOTCH = { ddr6: 2.35, ddr5: -0.55 } as const;

/**
 * Memory module, standing on its contact edge (bottom edge at y = 0), long axis = X, faces ±Z.
 * gen: "ddr6" (concept: angular orange-gold spreader, chevron vents, light bar) or "ddr5" (flat silver-blue fins).
 * wire: 0..1 blueprint wireframe overlay; solid: 0..1 build-up (solid only for x < -L/2 + solid·L, the rest wireframe).
 * glow: light-bar / edge glow; label: show the engraved generation name.
 */
export const Module: React.FC<{ gen: "ddr6" | "ddr5"; p?: V3; r?: V3; s?: number; glow?: number; wire?: number; solid?: number; label?: boolean; phase?: number; draw?: number }> = ({
  gen,
  p = [0, 0, 0],
  r = [0, 0, 0],
  s = 1,
  glow = 1,
  wire = 0,
  solid = 1,
  label = true,
  phase = 0,
  draw = 1,
}) => {
  const six = gen === "ddr6";
  const acc = six ? DDR6_ORANGE : DDR5_BLUE;
  // clip plane: keep x < cut (local units scaled by s → plane works in world space, so compute in props)
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0), []);
  const planeW = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), 0), []);
  const planeD = useMemo(() => new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0), []);
  const mats = useMemo(() => {
    const pcb = new THREE.MeshStandardMaterial({ color: "#ffffff", map: pcbTex(), metalness: 0.25, roughness: 0.55 });
    const gold = new THREE.MeshStandardMaterial({ color: "#e3b450", metalness: 1, roughness: 0.22 });
    const spreader = six
      ? new THREE.MeshPhysicalMaterial({ color: "#2a1d14", metalness: 0.95, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.2 })
      : new THREE.MeshPhysicalMaterial({ color: "#aeb9c8", metalness: 1, roughness: 0.3, clearcoat: 0.6 });
    const trim = six
      ? new THREE.MeshStandardMaterial({ color: "#d9893a", metalness: 1, roughness: 0.25 })
      : new THREE.MeshStandardMaterial({ color: "#4f6f9c", metalness: 0.9, roughness: 0.3 });
    const chip = new THREE.MeshStandardMaterial({ color: "#121316", metalness: 0.35, roughness: 0.42 });
    const wireM = new THREE.MeshBasicMaterial({ color: six ? "#ffb36b" : "#9cc8ff", wireframe: true, transparent: true, opacity: 0.85, toneMapped: false });
    return { pcb, gold, spreader, trim, chip, wireM };
  }, [six]);
  const bar = useGlow(acc, 2.6 * glow * (0.85 + 0.15 * Math.sin(phase)));
  const clipping = solid < 1;
  // world-space cut: group transform is simple (no rotation used with solid < 1 in scenes), so x_world = p.x + x_local*s
  const cut = p[0] + (-MOD_L / 2 + solid * MOD_L) * s;
  plane.constant = cut;
  planeW.constant = -cut;
  for (const m of [mats.pcb, mats.gold, mats.spreader, mats.trim, mats.chip]) m.clippingPlanes = clipping ? [plane] : null;
  planeD.constant = p[0] + (-MOD_L / 2 + draw * MOD_L) * s;
  mats.wireM.clippingPlanes = draw < 1 ? [planeD] : clipping ? [planeW] : null;
  mats.wireM.opacity = clipping ? 0.9 : 0.85 * wire;

  const body = (m: { pcb: THREE.Material; gold: THREE.Material; spreader: THREE.Material; trim: THREE.Material; chip: THREE.Material }, isWire = false) => (
    <>
      {/* PCB */}
      <Box p={[0, MOD_H / 2, 0]} s={[MOD_L, MOD_H, 0.12]} m={m.pcb} />
      {/* contact fingers, split by the key notch */}
      {Array.from({ length: isWire ? 0 : 74 }, (_, i) => {
        const x = -MOD_L / 2 + 0.35 + i * ((MOD_L - 0.7) / 73);
        if (Math.abs(x - NOTCH[gen]) < 0.22) return null;
        return <Box key={i} p={[x, 0.22, 0]} s={[0.11, 0.42, 0.14]} m={m.gold} />;
      })}
      {/* spreaders (both faces) */}
      {[-1, 1].map((side) =>
        six ? (
          <group key={side} position={[0, MOD_H / 2 + 0.35, side * 0.2]}>
            <RBox s={[MOD_L - 0.2, MOD_H - 0.4, 0.14]} m={m.spreader} rad={0.06} />
            {/* chevron vents */}
            {Array.from({ length: 7 }, (_, i) => (
              <group key={i} position={[-4.6 + i * 1.55, 0.1, side * 0.09]}>
                <Box p={[-0.28, 0, 0]} s={[0.9, 0.12, 0.05]} r={[0, 0, 0.7]} m={m.trim} />
                <Box p={[0.28, 0, 0]} s={[0.9, 0.12, 0.05]} r={[0, 0, -0.7]} m={m.trim} />
              </group>
            ))}
            <Box p={[0, -1.15, side * 0.09]} s={[MOD_L - 0.6, 0.08, 0.04]} m={m.trim} />
          </group>
        ) : (
          <group key={side} position={[0, MOD_H / 2 + 0.25, side * 0.17]}>
            <RBox s={[MOD_L - 0.3, MOD_H - 0.6, 0.1]} m={m.spreader} rad={0.04} />
            {Array.from({ length: 12 }, (_, i) => (
              <Box key={i} p={[-5.5 + i * 1.0, 0.3, side * 0.07]} s={[0.08, 1.6, 0.05]} m={m.trim} />
            ))}
          </group>
        ),
      )}
      {/* top edge: DDR6 angular crown with light bar, DDR5 flat cap */}
      {six ? (
        <>
          <Box p={[0, MOD_H + 0.28, 0]} s={[MOD_L - 0.2, 0.36, 0.56]} m={m.spreader} />
          <Box p={[-2.2, MOD_H + 0.5, 0]} s={[4.2, 0.22, 0.6]} r={[0, 0, 0.06]} m={m.trim} />
          {isWire ? null : <Box p={[0, MOD_H + 0.48, 0]} s={[MOD_L - 0.8, 0.1, 0.3]} m={bar} />}
        </>
      ) : (
        <>
          <Box p={[0, MOD_H + 0.12, 0]} s={[MOD_L - 0.3, 0.22, 0.44]} m={m.spreader} />
          {isWire ? null : <Box p={[0, MOD_H + 0.25, 0]} s={[MOD_L - 1.4, 0.05, 0.2]} m={bar} />}
        </>
      )}
    </>
  );
  return (
    <group position={p} rotation={r} scale={s}>
      {solid > 0 ? body(mats) : null}
      {wire > 0 || clipping ? body({ pcb: mats.wireM, gold: mats.wireM, spreader: mats.wireM, trim: mats.wireM, chip: mats.wireM }, true) : null}
      {label && solid > 0.6 ? <Text3D text={six ? "DDR6" : "DDR5"} h={0.55} depth={0.06} p={[3.6, MOD_H / 2 + 0.5, 0.32]} mat={six ? mats.trim : mats.trim} /> : null}
      {glow > 0 ? <Glow p={[0, MOD_H + 0.5, 0]} s={MOD_L * 1.3} color={acc} o={0.16 * glow} /> : null}
    </group>
  );
};

/* ===================================================================== DIMM slot */
/** Black DIMM slot (long axis X, opening up, top at y = 1.0). latch: 0 closed .. 1 open. key at NOTCH[gen]. */
export const Slot: React.FC<{ gen: "ddr6" | "ddr5"; p?: V3; r?: V3; s?: number; latch?: number; glow?: number; color?: string }> = ({ gen, p = [0, 0, 0], r = [0, 0, 0], s = 1, latch = 0, glow = 0, color }) => {
  const M = useMats();
  const acc = color ?? (gen === "ddr6" ? DDR6_ORANGE : DDR5_BLUE);
  const g = useGlow(acc, 2.2 * glow);
  const L = MOD_L + 0.6;
  return (
    <group position={p} rotation={r} scale={s}>
      <Box p={[0, 0.5, -0.32]} s={[L, 1, 0.3]} m={M.plastic} />
      <Box p={[0, 0.5, 0.32]} s={[L, 1, 0.3]} m={M.plastic} />
      <Box p={[0, 0.08, 0]} s={[L, 0.16, 0.95]} m={M.plastic} />
      {/* key bump */}
      <Box p={[NOTCH[gen], 0.3, 0]} s={[0.3, 0.5, 0.5]} m={g ?? M.plastic} />
      <Box p={[NOTCH[gen], 0.3, 0]} s={[0.26, 0.46, 0.46]} m={M.plastic} />
      {/* latches */}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * (L / 2 + 0.1), 0.2, 0]} rotation={[0, 0, side * latch * 0.6]}>
          <Box p={[0, 0.8, 0]} s={[0.3, 1.6, 0.9]} m={M.plastic} />
        </group>
      ))}
      {glow > 0 ? <Box p={[0, 1.02, 0]} s={[L, 0.04, 0.95]} m={g} /> : null}
    </group>
  );
};

/* ===================================================================== clamp bars (stuck) */
export const Clamp: React.FC<{ down: number; p?: V3; w?: number }> = ({ down, p = [0, 0, 0], w = 16 }) => {
  const M = useMats();
  const warn = useGlow(P.coral, 1.6);
  return (
    <group position={[p[0], p[1] + (1 - down) * 9, p[2]]}>
      <Box s={[w, 0.9, 2.6]} m={M.steel} />
      {Array.from({ length: 8 }, (_, i) => (
        <Box key={i} p={[-w / 2 + 1 + i * (w - 2) / 7, 0, 1.31]} s={[0.9, 0.9, 0.02]} r={[0, 0, 0.785]} m={i % 2 ? M.black : warn} />
      ))}
      {[-1, 1].map((sd) => (
        <group key={sd}>
          <Cyl p={[sd * (w / 2 - 0.8), 0, 1.35]} rt={0.35} h={0.2} r={[Math.PI / 2, 0, 0]} m={M.gunmetal} />
          <Cyl p={[sd * (w / 2 - 0.8), -3, 0]} rt={0.22} h={6} m={M.steel} />
        </group>
      ))}
    </group>
  );
};

/* ===================================================================== data tube */
/** Horizontal glass tube along X (length len) carrying glowing packets. flow: packets/units, speed: units/frame. */
export const DataTube: React.FC<{ f: number; p?: V3; len?: number; rad?: number; color: string; density: number; speed: number; seed?: number; on?: number }> = ({ f, p = [0, 0, 0], len = 60, rad = 2, color, density, speed, seed = 0, on = 1 }) => {
  const glass = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#cfe0ff", metalness: 0, roughness: 0.05, transparent: true, opacity: 0.12, depthWrite: false, clearcoat: 1 }), []);
  const ring = useGlow(color, 1.4 * on);
  const n = Math.round(len * density);
  return (
    <group position={p}>
      <Cyl rt={rad} h={len} r={[0, 0, Math.PI / 2]} m={glass} seg={40} />
      {[-1, 1].map((e) => (
        <Cyl key={e} p={[(e * len) / 2, 0, 0]} rt={rad + 0.25} h={0.6} r={[0, 0, Math.PI / 2]} m={ring} seg={40} />
      ))}
      <Particles
        n={n}
        color={color}
        k={3.2}
        fn={(i) => {
          if (on <= 0) return null;
          const off = hash(i + seed * 101) * len;
          const x = ((off + f * speed) % len) - len / 2;
          const a = hash(i * 7 + seed) * Math.PI * 2;
          const rr = rad * 0.65 * Math.sqrt(hash(i * 13 + seed));
          return { p: [x, Math.sin(a) * rr, Math.cos(a) * rr], s: 0.22 + 0.12 * hash(i * 3) };
        }}
      />
    </group>
  );
};

/* ===================================================================== shipping box */
export const ShipBox: React.FC<{ open: number; p?: V3; s?: number }> = ({ open, p = [0, 0, 0], s = 1 }) => {
  const M = useMats();
  const card = useMemo(() => new THREE.MeshStandardMaterial({ color: "#3a2c20", metalness: 0.05, roughness: 0.85 }), []);
  const tape = useGlow(P.orange, 0.9);
  const W = 20;
  const D = 10;
  const H = 8;
  return (
    <group position={p} scale={s}>
      <Box p={[0, H / 2, 0]} s={[W, H, D]} m={card} />
      <Box p={[0, H / 2, D / 2 + 0.02]} s={[W, 1.2, 0.04]} m={tape} />
      {/* flaps hinge open around the long edges */}
      {[-1, 1].map((sd) => (
        <group key={sd} position={[0, H, (sd * D) / 2]} rotation={[sd * open * 2.1, 0, 0]}>
          <Box p={[0, 0.1, (-sd * D) / 4]} s={[W, 0.2, D / 2]} m={card} />
        </group>
      ))}
      <Box p={[0, H - 0.4, 0]} s={[W - 0.6, 0.2, D - 0.6]} m={M.black} />
    </group>
  );
};

/* ===================================================================== hourglass with falling RAM chips */
export const Hourglass: React.FC<{ f: number; p?: V3; s?: number }> = ({ f, p = [0, 0, 0], s = 1 }) => {
  const M = useMats();
  const glass = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#d7e6ff", roughness: 0.05, transparent: true, opacity: 0.14, depthWrite: false, clearcoat: 1, side: THREE.DoubleSide }), []);
  const chipsTop = 26;
  const flow = (f * 0.18) % 1;
  return (
    <group position={p} scale={s}>
      <Cyl p={[0, 0.6, 0]} rt={9} h={1.2} m={M.gunmetal} seg={6} />
      <Cyl p={[0, 33.4, 0]} rt={9} h={1.2} m={M.gunmetal} seg={6} />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return <Cyl key={i} p={[Math.cos(a) * 8, 17, Math.sin(a) * 8]} rt={0.3} h={32} m={M.alu} />;
      })}
      <Cyl p={[0, 25, 0]} rt={6.5} rb={0.6} h={15} m={glass} seg={32} />
      <Cyl p={[0, 9, 0]} rt={0.6} rb={6.5} h={15} m={glass} seg={32} />
      {/* top pile shrinking, bottom pile growing, a stream of chips in the neck */}
      {Array.from({ length: chipsTop }, (_, i) => {
        const lvl = Math.floor(i / 6);
        const a = (i % 6) * 1.05 + lvl;
        return <Box key={`t${i}`} p={[Math.cos(a) * (3.6 - lvl * 0.7), 20.5 + lvl * 0.7, Math.sin(a) * (3.6 - lvl * 0.7)]} s={[1.3, 0.25, 0.7]} r={[0, a, 0.2]} m={M.chip} />;
      })}
      {Array.from({ length: 6 }, (_, i) => {
        const t = (flow + i / 6) % 1;
        return <Box key={`s${i}`} p={[0, 16.5 - t * 11, 0]} s={[0.9, 0.2, 0.5]} r={[t * 6, i, t * 3]} m={M.chip} />;
      })}
      {Array.from({ length: 22 }, (_, i) => {
        const lvl = Math.floor(i / 6);
        const a = (i % 6) * 1.05 + lvl * 0.5;
        return <Box key={`b${i}`} p={[Math.cos(a) * (4.5 - lvl), 2 + lvl * 0.6, Math.sin(a) * (4.5 - lvl)]} s={[1.3, 0.25, 0.7]} r={[0, a, 0.1]} m={M.chip} />;
      })}
      <Glow p={[0, 17, 0]} s={14} color={P.amber} o={0.25} />
    </group>
  );
};

/* ===================================================================== hydraulic press */
export const Press: React.FC<{ down: number; p?: V3; s?: number; children?: React.ReactNode; strain?: number }> = ({ down, p = [0, 0, 0], s = 1, children, strain = 0 }) => {
  const M = useMats();
  const warn = useGlow(P.coral, 1.2 + strain * 2);
  const travel = 16;
  return (
    <group position={p} scale={s}>
      <Box p={[0, 1, 0]} s={[30, 2, 16]} m={M.gunmetal} />
      {[-1, 1].map((sd) => (
        <Box key={sd} p={[sd * 13, 20, 0]} s={[3, 38, 4]} m={M.steel} />
      ))}
      <Box p={[0, 39, 0]} s={[32, 4, 6]} m={M.gunmetal} />
      <Cyl p={[0, 33, 0]} rt={3.2} h={8} m={M.alu} />
      <Cyl p={[0, 33 - travel * down * 0.5, 0]} rt={2} h={10 + travel * down} m={M.steel} />
      <group position={[0, 27 - travel * down, 0]}>
        <Box s={[24, 2.2, 12]} m={M.black} />
        {Array.from({ length: 10 }, (_, i) => (
          <Box key={i} p={[-11 + i * 2.45, -1.12, 6.01]} s={[1.2, 0.4, 0.02]} m={i % 2 ? M.black : warn} />
        ))}
      </group>
      <group position={[0, 2, 0]}>{children}</group>
    </group>
  );
};

/* ===================================================================== alarm beacon */
export const Beacon: React.FC<{ f: number; p?: V3; s?: number }> = ({ f, p = [0, 0, 0], s = 1 }) => {
  const M = useMats();
  const red = useGlow("#ff2a2a", 2.4);
  const a = f * 0.22;
  return (
    <group position={p} scale={s}>
      <Cyl p={[0, 1, 0]} rt={5} h={2} m={M.black} seg={40} />
      <Cyl p={[0, 5, 0]} rt={3.6} rb={4} h={6} m={red} seg={40} />
      <mesh position={[0, 8, 0]}>
        <sphereGeometry args={[3.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <primitive object={red} attach="material" />
      </mesh>
      {[0, Math.PI].map((o) => (
        <group key={o} position={[0, 5.5, 0]} rotation={[0, a + o, 0]}>
          <Glow p={[9, 0, 0]} s={22} color="#ff3030" o={0.55} />
          <Glow p={[22, 0, 0]} s={30} color="#ff3030" o={0.25} />
        </group>
      ))}
    </group>
  );
};

/* ===================================================================== price tag */
export const PriceTag: React.FC<{ p?: V3; r?: V3; s?: number }> = ({ p = [0, 0, 0], r = [0, 0, 0], s = 1 }) => {
  const M = useMats();
  const face = useMemo(() => new THREE.MeshStandardMaterial({ color: "#f1e9dc", roughness: 0.7 }), []);
  const edge = useGlow(P.orange, 1.2);
  return (
    <group position={p} rotation={r} scale={s}>
      <RBox s={[8, 4.6, 0.12]} m={face} rad={0.05} />
      <Box p={[0, 1.6, 0.07]} s={[7.4, 0.25, 0.02]} m={edge} />
      <Cyl p={[-3.3, 0, 0]} rt={0.35} h={0.2} r={[Math.PI / 2, 0, 0]} m={M.black} />
    </group>
  );
};

/* ===================================================================== question mark */
export const QMark: React.FC<{ p?: V3; r?: V3; glow?: number }> = ({ p = [0, 0, 0], r = [0, 0, 0], glow = 1 }) => {
  const gold = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#ffb36b", metalness: 1, roughness: 0.18, clearcoat: 1 }), []);
  return (
    <group position={p} rotation={r}>
      <Text3D text="?" h={22} depth={6} mat={gold} accent={glow} />
      <Glow p={[0, 0, -4]} s={60} color={P.orange} o={0.25 * glow} />
    </group>
  );
};

/* ===================================================================== RAM vortex (data-centre appetite) */
export const Vortex: React.FC<{ f: number; n?: number; p?: V3; pull: number }> = ({ f, n = 70, p = [0, 0, 0], pull }) => {
  const M = useMats();
  const items = useMemo(() => Array.from({ length: n }, (_, i) => i), [n]);
  return (
    <group position={p}>
      {items.map((i) => {
        const t = (hash(i * 3.1) + f * 0.008 * (1 + pull)) % 1;
        const rad = 34 * (1 - t) + 2;
        const a = hash(i) * Math.PI * 2 + t * 9;
        const y = (hash(i * 7) - 0.5) * 30 * (1 - t) + 12;
        const sc = 0.32 * (0.4 + 0.6 * (1 - t));
        return (
          <group key={i} position={[Math.cos(a) * rad, y, Math.sin(a) * rad]} rotation={[a, a * 0.5, t * 4]} scale={sc}>
            <Box p={[0, 1.7, 0]} s={[13.3, 3.4, 0.3]} m={i % 3 === 0 ? M.gold : M.black} />
            <Box p={[0, 3.5, 0]} s={[13, 0.2, 0.5]} m={M.alu} />
          </group>
        );
      })}
    </group>
  );
};
