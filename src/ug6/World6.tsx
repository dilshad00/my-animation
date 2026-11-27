/**
 * UG-006 procedural 3D library, part 2: environments + PC parts.
 * Tower, data-centre hall, server rack + sled, GPU production line, retail shelves, fab construction,
 * lithography scanner, wafer robot, CPU / motherboard / SSD / PSU / AIO, desk setup, console,
 * jewellery case, balance scale, crates, 3D numerals.
 */
import React, { useMemo } from "react";
import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import helv from "three/examples/fonts/helvetiker_bold.typeface.json";
import { Accel, Box, Cyl, Dimm, Fade, Fan, FeCard, Glow, hash, Inst, P, RBox, sat, useGlow, useMats, type V3 } from "./Three6";

/* ===================================================================== gaming tower */
/**
 * Mid-tower with a glass side (+Z). Visible parts can be removed one by one (each 0..1 = present).
 * power: 0..1 (fans spin, lights). gpuGone: 0..1 dissolve handled by caller via `gpu` presence.
 */
export type TowerParts = { gpu: number; ram: number; cooler: number; psu: number; fans: number; mobo: number };
export const Tower: React.FC<{ power?: number; spin?: number; parts?: Partial<TowerParts>; p?: V3; r?: V3; s?: number; phase?: number; accent?: string }> = ({
  power = 1,
  spin = 0,
  parts = {},
  p = [0, 0, 0],
  r = [0, 0, 0],
  s = 1,
  phase = 0,
  accent = P.orange,
}) => {
  const M = useMats();
  const pt: TowerParts = { gpu: 1, ram: 1, cooler: 1, psu: 1, fans: 1, mobo: 1, ...parts };
  const ring = useGlow(accent, 2.4 * power);
  const strip = useGlow(accent, 1.6 * power);
  const W = 23;
  const H = 48;
  const D = 46;
  const fanSpin = spin * power;
  return (
    <group position={p} rotation={r} scale={s}>
      {/* chassis: back panel, top, bottom, front, frame edges */}
      <Box p={[0, H / 2, -W / 2 + 0.3]} s={[D, H, 0.6]} m={M.black} />
      <Box p={[0, H - 0.3, 0]} s={[D, 0.6, W]} m={M.black} />
      <Box p={[0, 0.3, 0]} s={[D, 0.6, W]} m={M.black} />
      <Box p={[D / 2 - 0.4, H / 2, 0]} s={[0.8, H, W]} m={M.gunmetal} />
      <Box p={[-D / 2 + 0.3, H / 2, 0]} s={[0.6, H, W]} m={M.black} />
      {/* glass panel + edges */}
      <mesh position={[0, H / 2, W / 2]} material={M.glass}>
        <boxGeometry args={[D - 0.4, H - 0.4, 0.4]} />
      </mesh>
      {[[0, H - 0.2], [0, 0.2]].map(([x, y], i) => (
        <Box key={i} p={[x, y, W / 2]} s={[D, 0.4, 0.5]} m={M.gunmetal} />
      ))}
      {/* front intake fans (×3) visible through glass */}
      {pt.fans > 0 ? (
        <Fade o={pt.fans}>
          {[11, 24, 37].map((y) => (
            <group key={y} position={[D / 2 - 2.2, y, 0]} rotation={[0, 0, Math.PI / 2]}>
              <Fan r={5.6} spin={fanSpin * 1.2 + y} M={M} ring={ring} blades={9} />
            </group>
          ))}
        </Fade>
      ) : null}
      {/* motherboard */}
      {pt.mobo > 0 ? (
        <Fade o={pt.mobo}>
          <Box p={[-3, H / 2 + 6, -W / 2 + 1.2]} s={[30.5, 30.5, 0.2]} m={M.pcb} />
          <Box p={[-3, H / 2 + 6, -W / 2 + 1.35]} s={[6, 30, 0.3]} m={M.gunmetal} />
          <Box p={[-12, H / 2 + 14, -W / 2 + 2]} s={[3, 10, 2]} m={M.gunmetal} />
        </Fade>
      ) : null}
      {/* CPU AIO pump block */}
      {pt.cooler > 0 ? (
        <Fade o={pt.cooler}>
          <group position={[-4, H / 2 + 13, -W / 2 + 3.2]}>
            <Cyl rt={3.1} h={3.4} m={M.black} r={[Math.PI / 2, 0, 0]} />
            <mesh position={[0, 0, 1.75]}>
              <circleGeometry args={[2.6, 40]} />
              <meshStandardMaterial color="#050505" emissive={accent} emissiveIntensity={1.2 * power} toneMapped={false} />
            </mesh>
            <mesh position={[0, 0, 1.76]}>
              <ringGeometry args={[2.6, 3.0, 40]} />
              <meshStandardMaterial color="#050505" emissive={P.white} emissiveIntensity={0.8 * power} toneMapped={false} />
            </mesh>
          </group>
          {/* tubes to the top radiator */}
          <Cyl p={[2, H - 6, -W / 2 + 4]} rt={0.5} h={12} m={M.rubber} r={[0, 0, 0.4]} />
          <Cyl p={[3.5, H - 6, -W / 2 + 6]} rt={0.5} h={12} m={M.rubber} r={[0, 0, 0.35]} />
          <Box p={[0, H - 2.6, 0]} s={[36, 2.6, 13]} m={M.black} />
        </Fade>
      ) : null}
      {/* RAM (2 sticks) */}
      {pt.ram > 0 ? (
        <Fade o={pt.ram}>
          {[0, 1].map((i) => (
            <Dimm key={i} p={[4 + i * 1.6, H / 2 + 7, -W / 2 + 1.4]} r={[Math.PI / 2, Math.PI / 2, 0]} s={1.02} rgb={power} phase={phase + i} />
          ))}
        </Fade>
      ) : null}
      {/* GPU (horizontal, fans facing down; light bar faces the glass) */}
      {pt.gpu > 0 ? (
        <Fade o={pt.gpu}>
          <FeCard cls="90" p={[-2, H / 2 - 6, -W / 2 + 8.5]} r={[Math.PI, Math.PI, 0]} spin={fanSpin} light={power} lightColor={P.white} />
        </Fade>
      ) : null}
      {/* PSU shroud + under-glow strip */}
      {pt.psu > 0 ? (
        <Fade o={pt.psu}>
          <Box p={[0, 6.5, 0]} s={[D - 1.4, 0.5, W - 1]} m={M.gunmetal} />
          <Box p={[-8, 3.4, -1]} s={[16, 6, 15]} m={M.black} />
          <Box p={[0, 6.9, W / 2 - 1.2]} s={[D - 4, 0.16, 0.16]} m={strip} />
        </Fade>
      ) : null}
      <Glow p={[0, H / 2, 0]} s={60} color={accent} o={0.07 * power} />
    </group>
  );
};

/* ===================================================================== server rack */
/** Rack: 60 × 200 × 120 cm, front faces +Z. leds: 0..1, f: frame (blink). open: sled slide-out 0..1 (row k). */
export const RACK = { w: 6, h: 20, d: 12 };
export const Rack: React.FC<{ f?: number; leds?: number; seed?: number; open?: number; openRow?: number; p?: V3; r?: V3; accel?: number }> = ({
  f = 0,
  leds = 1,
  seed = 0,
  open = 0,
  openRow = 9,
  p = [0, 0, 0],
  r = [0, 0, 0],
  accel = 0,
}) => {
  const M = useMats();
  const on = useGlow(P.orange, 3 * leds);
  const cool = useGlow(P.cool, 2 * leds);
  const rows = 18;
  const ledsOn: { p: V3; s: V3 }[] = [];
  const ledsCool: { p: V3; s: V3 }[] = [];
  for (let k = 0; k < rows; k++)
    for (let j = 0; j < 4; j++) {
      const b = hash(seed * 31 + k * 7 + j * 3 + Math.floor((f + hash(k + seed) * 20) / (6 + j * 3)));
      if (b > 0.55) (j % 2 ? ledsCool : ledsOn).push({ p: [-2.3 + j * 0.35, 1 + k * 1.02, RACK.d / 2 + 0.05], s: [0.16, 0.12, 0.05] });
    }
  return (
    <group position={p} rotation={r}>
      <Box p={[0, RACK.h / 2, 0]} s={[RACK.w, RACK.h, RACK.d]} m={M.black} />
      {/* door mesh look: horizontal server faces */}
      {Array.from({ length: rows }, (_, k) =>
        k === openRow && open > 0 ? null : <Box key={k} p={[0, 1 + k * 1.02, RACK.d / 2 + 0.02]} s={[RACK.w - 0.6, 0.86, 0.04]} m={M.satin} />,
      )}
      <Inst items={ledsOn} m={on} />
      <Inst items={ledsCool} m={cool} />
      {open > 0 ? (
        <group position={[0, 1 + openRow * 1.02, RACK.d / 2 - RACK.d / 2 + open * 9]}>
          <Box p={[0, -0.35, 0]} s={[RACK.w - 0.6, 0.12, RACK.d - 0.4]} m={M.steel} />
          {[-1.4, 1.4].map((x) => (
            <Accel key={x} p={[x, -0.2, 0]} s={0.22} hbmGlow={accel} dieGlow={accel} r={[0, Math.PI / 2, 0]} />
          ))}
        </group>
      ) : null}
      <Box p={[0, RACK.h + 0.2, 0]} s={[RACK.w + 0.2, 0.4, RACK.d + 0.2]} m={M.gunmetal} />
    </group>
  );
};

/**
 * Data-centre hall: `aisles` × 2 rows × `len` racks, instanced. Blinking LEDs via instanced emissive
 * cubes recomputed per frame. Orange overhead light strips, glossy floor. Aisle k centre at x = k * 30.
 */
export const Hall: React.FC<{ f: number; aisles?: number; len?: number; leds?: number; strips?: number }> = ({ f, aisles = 9, len = 40, leds = 1, strips = 1 }) => {
  const M = useMats();
  const racks = useMemo(() => {
    const out: { p: V3; s: V3 }[] = [];
    for (let a = 0; a < aisles; a++)
      for (const side of [-1, 1])
        for (let i = 0; i < len; i++) out.push({ p: [(a - (aisles - 1) / 2) * 30 + side * 9, RACK.h / 2, -i * (RACK.w + 0.3)], s: [RACK.d, RACK.h, RACK.w] });
    return out;
  }, [aisles, len]);
  const face = useMemo(() => {
    const out: { p: V3; s: V3 }[] = [];
    for (let a = 0; a < aisles; a++)
      for (const side of [-1, 1])
        for (let i = 0; i < len; i++) out.push({ p: [(a - (aisles - 1) / 2) * 30 + side * (9 - RACK.d / 2 - 0.03), RACK.h / 2, -i * (RACK.w + 0.3)], s: [0.05, RACK.h - 1, RACK.w - 0.6] });
    return out;
  }, [aisles, len]);
  const on = useGlow(P.orange, 3.2 * leds);
  const cool = useGlow(P.cool, 2.4 * leds);
  const strip = useGlow(P.orange, 1.8 * strips);
  const lo: { p: V3; s: V3 }[] = [];
  const lc: { p: V3; s: V3 }[] = [];
  const cells = 10;
  for (let idx = 0; idx < face.length; idx++) {
    const fp = face[idx].p;
    for (let k = 0; k < cells; k++) {
      const b = hash(idx * 13.1 + k * 3.7 + Math.floor((f + hash(idx + k) * 40) / 9));
      if (b < 0.5) continue;
      const side = fp[0] > Math.round(fp[0] / 30) * 30 ? 1 : -1;
      const it = { p: [fp[0] - side * 0.04, 1.4 + k * 1.8, fp[2] - 2 + hash(idx * 3 + k) * 4] as V3, s: [0.06, 0.12, 0.3] as V3 };
      (b > 0.8 ? lc : lo).push(it);
    }
  }
  const stripItems = useMemo(() => {
    const out: { p: V3; s: V3 }[] = [];
    for (let a = 0; a < aisles; a++) for (const side of [-1, 1]) out.push({ p: [(a - (aisles - 1) / 2) * 30 + side * 2.4, RACK.h + 6, -(len * (RACK.w + 0.3)) / 2], s: [0.4, 0.15, len * (RACK.w + 0.3)] });
    return out;
  }, [aisles, len]);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -len * 3]}>
        <planeGeometry args={[aisles * 30 + 200, len * 7 + 300]} />
        <meshStandardMaterial color="#0a0b0d" metalness={0.8} roughness={0.25} />
      </mesh>
      <Inst items={racks} m={M.black} />
      <Inst items={face} m={M.satin} />
      <Inst items={lo} m={on} />
      <Inst items={lc} m={cool} />
      <Inst items={stripItems} m={strip} />
      {/* ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, RACK.h + 9, -len * 3]}>
        <planeGeometry args={[aisles * 30 + 200, len * 7 + 300]} />
        <meshStandardMaterial color="#060607" />
      </mesh>
    </group>
  );
};

/* ===================================================================== production line */
/** Conveyor along X from -len/2 → +len/2. items move at `speed` cm/frame: pos(i) = ((i*gap + f*speed) mod len). */
export const Conveyor: React.FC<{ f: number; len?: number; speed: number; dist?: number; p?: V3; item: "die" | "card"; gap?: number }> = ({ f, len = 120, speed, dist = 0, p = [0, 0, 0], item, gap = 12 }) => {
  const M = useMats();
  const n = Math.floor(len / gap);
  const rollers = useMemo(() => Array.from({ length: Math.floor(len / 2) }, (_, i) => ({ p: [-len / 2 + i * 2, 0, 0] as V3, r: [Math.PI / 2, 0, 0] as V3, s: [0.5, 8, 0.5] as V3 })), [len]);
  const rg = useMemo(() => new THREE.CylinderGeometry(1, 1, 1, 12), []);
  const glow = useGlow(P.orange, 2);
  const travel = dist || f * speed;
  return (
    <group position={p}>
      <Box p={[0, -0.8, 0]} s={[len, 1, 9]} m={M.gunmetal} />
      <Inst items={rollers} m={M.steel} geo={rg} />
      <Box p={[0, -0.2, 4.4]} s={[len, 0.25, 0.25]} m={glow} />
      {Array.from({ length: n }, (_, i) => {
        const x = ((i * gap + travel) % len) - len / 2;
        return item === "die" ? (
          <group key={i} position={[x, 0.6, 0]}>
            <Box s={[4.2, 0.3, 4.2]} m={M.substrate} />
            <Box p={[0, 0.3, 0]} s={[2.6, 0.3, 2.6]} m={M.die} />
          </group>
        ) : (
          <FeCard key={i} cls="80" p={[x, 2.2, 0]} s={0.3} r={[0, Math.PI / 2, 0]} light={0.3} />
        );
      })}
    </group>
  );
};

/** Industrial pick-and-place arm. a = base yaw, b = shoulder, c = elbow (radians). */
export const Arm: React.FC<{ a?: number; b?: number; c?: number; p?: V3; s?: number; grip?: React.ReactNode }> = ({ a = 0, b = 0.4, c = -1.0, p = [0, 0, 0], s = 1, grip }) => {
  const M = useMats();
  const acc = useGlow(P.orange, 1.6);
  return (
    <group position={p} scale={s}>
      <Cyl rt={3} rb={3.6} h={2} m={M.gunmetal} p={[0, 1, 0]} />
      <group rotation={[0, a, 0]} position={[0, 2, 0]}>
        <Cyl rt={1.8} h={3} m={M.white} p={[0, 1.5, 0]} />
        <group position={[0, 3, 0]} rotation={[0, 0, b]}>
          <RBox p={[0, 6, 0]} s={[2.2, 12, 2.2]} m={M.white} rad={0.8} />
          <Box p={[1.15, 6, 0]} s={[0.1, 9, 0.6]} m={acc} />
          <group position={[0, 12, 0]} rotation={[0, 0, c]}>
            <Cyl rt={1.3} h={2.6} m={M.gunmetal} r={[Math.PI / 2, 0, 0]} />
            <RBox p={[0, 5, 0]} s={[1.7, 10, 1.7]} m={M.white} rad={0.6} />
            <group position={[0, 10.5, 0]}>
              <Cyl rt={0.9} h={1.4} m={M.gunmetal} />
              {grip}
            </group>
          </group>
        </group>
      </group>
    </group>
  );
};

/** Stack of crates (allocation). n crates in rows of `cols`; fade(i) 0..1 opacity per crate (wireframe ghost when low). */
export const Crates: React.FC<{ n: number; cols?: number; vis: (i: number) => number; p?: V3; color?: string }> = ({ n, cols = 5, vis, p = [0, 0, 0], color = P.orange }) => {
  const M = useMats();
  const ghost = useMemo(() => new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity: 0.35 }), [color]);
  const band = useGlow(color, 1.2);
  return (
    <group position={p}>
      {Array.from({ length: n }, (_, i) => {
        const x = (i % cols) - (cols - 1) / 2;
        const y = Math.floor(i / cols);
        const v = vis(i);
        return (
          <group key={i} position={[x * 4.3, 2 + y * 4.1, 0]}>
            {v > 0.5 ? (
              <>
                <RBox s={[4, 3.8, 4]} m={M.gunmetal} rad={0.2} />
                <Box p={[0, 0, 2.01]} s={[3.2, 0.3, 0.02]} m={band} />
              </>
            ) : (
              <mesh material={ghost}>
                <boxGeometry args={[4, 3.8, 4]} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
};

/* ===================================================================== retail shelves */
/** One shelving unit: `levels` shelves × `slots` boxes; filled(level, slot) → box present. Front faces +Z. */
export const Shelf: React.FC<{ p?: V3; levels?: number; slots?: number; filled: (l: number, s: number) => boolean; tag?: (l: number, s: number) => number }> = ({ p = [0, 0, 0], levels = 4, slots = 6, filled, tag }) => {
  const M = useMats();
  const boxM = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1b1d22", metalness: 0.3, roughness: 0.5 }), []);
  const boxFace = useGlow(P.white, 0.25);
  const tagM = useGlow(P.coral, 1.6);
  const tagW = useGlow(P.white, 0.9);
  const W = slots * 7;
  return (
    <group position={p}>
      <Box p={[0, levels * 9 / 2 + 2, -3.5]} s={[W + 2, levels * 9 + 4, 0.4]} m={M.satin} />
      {Array.from({ length: levels }, (_, l) => (
        <group key={l} position={[0, 3 + l * 9, 0]}>
          <Box s={[W + 2, 0.5, 7]} m={M.steel} />
          <Box p={[0, -0.1, 3.6]} s={[W + 2, 1.2, 0.2]} m={M.black} />
          {Array.from({ length: slots }, (_, s) => {
            const x = -W / 2 + 3.5 + s * 7;
            const t = tag ? tag(l, s) : 0;
            return (
              <group key={s}>
                {filled(l, s) ? (
                  <group position={[x, 3.4, 0]}>
                    <Box s={[5.6, 6.4, 5.4]} m={boxM} />
                    <Box p={[0, 0.6, 2.71]} s={[4.4, 0.3, 0.02]} m={boxFace} />
                  </group>
                ) : null}
                <Box p={[x, -0.1, 3.75]} s={[2.4, 1.0, 0.06]} m={t > 0 ? tagM : tagW} />
              </group>
            );
          })}
        </group>
      ))}
    </group>
  );
};

/* ===================================================================== fab */
/**
 * Fab building in stages. stage 0..5: 0 empty lot → 1 foundations → 2 steel frame → 3 shell →
 * 4 utility towers + tools → 5 lights on. Fractional values animate inside a stage. Footprint 120 × 70.
 */
export const Fab: React.FC<{ stage: number; p?: V3; s?: number; f?: number }> = ({ stage, p = [0, 0, 0], s = 1, f = 0 }) => {
  const M = useMats();
  const st = (k: number) => sat(stage - k);
  const win = useGlow(P.amber, 2.4 * st(4));
  const beacon = useGlow(P.coral, 2 + Math.sin(f * 0.2) * 1.5);
  const cols = useMemo(() => {
    const out: { p: V3; s: V3 }[] = [];
    for (let i = 0; i <= 12; i++) for (let j = 0; j <= 6; j++) out.push({ p: [-60 + i * 10, 0, -35 + j * (70 / 6)], s: [0.8, 1, 0.8] });
    return out;
  }, []);
  const frameH = 24 * st(1);
  const beams = useMemo(() => {
    const out: { p: V3; s: V3 }[] = [];
    for (let j = 0; j <= 6; j++) out.push({ p: [0, 0, -35 + j * (70 / 6)], s: [120, 0.7, 0.7] });
    for (let i = 0; i <= 12; i++) out.push({ p: [-60 + i * 10, 0, 0], s: [0.7, 0.7, 70] });
    return out;
  }, []);
  const shell = st(2);
  const craneM = useMemo(() => new THREE.MeshStandardMaterial({ color: "#e0a030", metalness: 0.4, roughness: 0.5 }), []);
  return (
    <group position={p} scale={s}>
      {/* lot + foundation slab */}
      <Box p={[0, -0.3, 0]} s={[180, 0.6, 120]} m={M.concrete} />
      <Box p={[0, 0.4 * st(0), 0]} s={[124, 0.8 * st(0) + 0.01, 74]} m={M.white} />
      {/* steel frame */}
      {frameH > 0.1 ? (
        <>
          <group scale={[1, frameH, 1]} position={[0, frameH / 2 / frameH, 0]}>
            <Inst items={cols.map((c) => ({ ...c, p: [c.p[0], 0.5, c.p[2]] as V3 }))} m={M.steel} />
          </group>
          {st(1) > 0.6 ? (
            <group position={[0, frameH, 0]}>
              <Inst items={beams} m={M.steel} />
            </group>
          ) : null}
        </>
      ) : null}
      {/* shell (cladding grows upward) */}
      {shell > 0 ? (
        <group>
          <Box p={[0, 12 * shell, 35.2]} s={[120.5, 24 * shell, 0.6]} m={M.white} />
          <Box p={[0, 12 * shell, -35.2]} s={[120.5, 24 * shell, 0.6]} m={M.white} />
          <Box p={[60.2, 12 * shell, 0]} s={[0.6, 24 * shell, 70]} m={M.white} />
          <Box p={[-60.2, 12 * shell, 0]} s={[0.6, 24 * shell, 70]} m={M.white} />
          {shell > 0.98 ? <Box p={[0, 24.2, 0]} s={[121, 0.6, 71]} m={M.steel} /> : null}
          {/* window band */}
          {shell > 0.98 ? <Box p={[0, 15, 35.6]} s={[110, 1.4, 0.1]} m={win} /> : null}
        </group>
      ) : null}
      {/* utility towers + roof units */}
      {st(3) > 0
        ? [-40, -20, 0, 20, 40].map((x, i) => (
            <group key={x} position={[x, 24.5, -20]} scale={[1, Math.max(0.01, sat(st(3) * 5 - i)), 1]}>
              <Box p={[0, 5, 0]} s={[8, 10, 8]} m={M.steel} />
              <Cyl p={[0, 11, 0]} rt={3} h={2} m={M.gunmetal} />
            </group>
          ))
        : null}
      {st(3) > 0 ? <Box p={[70, 10, 0]} s={[14, 20, 40]} m={M.gunmetal} /> : null}
      {/* tower crane while building */}
      {stage < 4.2 && stage > 0.5 ? (
        <group position={[-75, 0, -50]}>
          <Box p={[0, 25, 0]} s={[2, 50, 2]} m={craneM} />
          <group position={[0, 50, 0]} rotation={[0, 0.6 + Math.sin(f * 0.01) * 0.5, 0]}>
            <Box p={[25, 0, 0]} s={[60, 1.4, 1.4]} m={M.steel} />
            <Box p={[-8, 0, 0]} s={[6, 3, 3]} m={M.concrete} />
            <Box p={[0, 2, 0]} s={[1, 4, 1]} m={beacon} />
          </group>
        </group>
      ) : null}
    </group>
  );
};

/** Lithography scanner (EUV-style procedural block machine). beam: 0..1 light inside the window. */
export const Litho: React.FC<{ p?: V3; r?: V3; s?: number; beam?: number; f?: number }> = ({ p = [0, 0, 0], r = [0, 0, 0], s = 1, beam = 1, f = 0 }) => {
  const M = useMats();
  const bm = useGlow("#b98cff", 2.5 * beam * (0.8 + 0.2 * Math.sin(f * 0.6)));
  const ui = useGlow(P.orange, 1.4);
  return (
    <group position={p} rotation={r} scale={s}>
      <RBox p={[0, 9, 0]} s={[40, 18, 16]} m={M.white} rad={0.8} />
      <RBox p={[14, 22, 0]} s={[12, 10, 14]} m={M.white} rad={0.8} />
      <RBox p={[-14, 21, 0]} s={[10, 8, 12]} m={M.alu} rad={0.6} />
      <Box p={[0, 10, 8.05]} s={[10, 6, 0.1]} m={M.glass} />
      <Box p={[0, 10, 7.6]} s={[0.4, 5.6, 0.4]} m={bm} />
      <Glow p={[0, 10, 8.4]} s={9} color="#b98cff" o={0.5 * beam} />
      {[-15, -11, 11, 15].map((x) => (
        <Box key={x} p={[x, 14, 8.05]} s={[2.4, 0.5, 0.06]} m={ui} />
      ))}
      <Box p={[0, 0.5, 0]} s={[42, 1, 18]} m={M.gunmetal} />
    </group>
  );
};

/** FOUP (front-opening wafer carrier). */
export const Foup: React.FC<{ p?: V3; s?: number }> = ({ p = [0, 0, 0], s = 1 }) => {
  const M = useMats();
  const win = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#ffb070", transmission: 0.6, transparent: true, opacity: 0.6, roughness: 0.1 }), []);
  return (
    <group position={p} scale={s}>
      <RBox p={[0, 2, 0]} s={[4.4, 4, 4.4]} m={M.white} rad={0.5} />
      <Box p={[0, 2, 2.21]} s={[3.4, 3, 0.05]} m={win} />
      <Box p={[0, 4.3, 0]} s={[2, 0.6, 2]} m={M.gunmetal} />
    </group>
  );
};

/* ===================================================================== PC parts */
export const Cpu: React.FC<{ p?: V3; r?: V3; s?: number }> = ({ p = [0, 0, 0], r = [0, 0, 0], s = 1 }) => {
  const M = useMats();
  return (
    <group position={p} rotation={r} scale={s}>
      <Box p={[0, 0.1, 0]} s={[4, 0.2, 4]} m={M.substrate} />
      <RBox p={[0, 0.42, 0]} s={[3.3, 0.45, 3.3]} m={M.alu} rad={0.15} />
      <Box p={[0, 0.66, 0]} s={[1.4, 0.02, 0.3]} m={useGlow(P.orange, 1)} />
    </group>
  );
};
export const Mobo: React.FC<{ p?: V3; r?: V3; s?: number; glow?: number }> = ({ p = [0, 0, 0], r = [0, 0, 0], s = 1, glow = 0.6 }) => {
  const M = useMats();
  const g = useGlow(P.orange, glow);
  return (
    <group position={p} rotation={r} scale={s}>
      <Box p={[0, 0.1, 0]} s={[30.5, 0.2, 24.4]} m={M.pcb} />
      <Box p={[-3, 0.35, -4]} s={[5, 0.3, 5]} m={M.gunmetal} />
      <Box p={[-11, 1.2, -2]} s={[3, 2.2, 12]} m={M.gunmetal} />
      <Box p={[-3, 1.2, -10.5]} s={[14, 2.2, 3]} m={M.gunmetal} />
      {[4, 5.2, 6.4, 7.6].map((x) => (
        <Box key={x} p={[x, 0.5, -4]} s={[0.6, 0.6, 13.5]} m={M.black} />
      ))}
      {[3, 9].map((z) => (
        <Box key={z} p={[-3, 0.5, z]} s={[17, 0.7, 0.9]} m={M.alu} />
      ))}
      <Box p={[6, 0.6, 8]} s={[10, 0.8, 7]} m={M.gunmetal} />
      <Box p={[-11, 2.35, -2]} s={[0.1, 0.1, 11]} m={g} />
    </group>
  );
};
export const Ssd: React.FC<{ p?: V3; r?: V3; s?: number }> = ({ p = [0, 0, 0], r = [0, 0, 0], s = 1 }) => {
  const M = useMats();
  return (
    <group position={p} rotation={r} scale={s}>
      <Box p={[0, 0.05, 0]} s={[8, 0.1, 2.2]} m={M.pcb} />
      <Box p={[-0.8, 0.2, 0]} s={[5.5, 0.22, 1.8]} m={M.gunmetal} />
      <Box p={[3.85, 0.06, 0]} s={[0.4, 0.1, 1.9]} m={M.gold} />
      <Box p={[2.5, 0.16, 0]} s={[0.9, 0.12, 1.2]} m={M.chip} />
    </group>
  );
};
export const Psu: React.FC<{ p?: V3; r?: V3; s?: number; spin?: number }> = ({ p = [0, 0, 0], r = [0, 0, 0], s = 1, spin = 0 }) => {
  const M = useMats();
  return (
    <group position={p} rotation={r} scale={s}>
      <RBox p={[0, 4.3, 0]} s={[15, 8.6, 14]} m={M.black} rad={0.3} />
      <group position={[0, 8.61, 0]}>
        <Fan r={5.2} spin={spin} M={M} blades={7} />
      </group>
      <Box p={[7.52, 4.3, 0]} s={[0.05, 1.6, 8]} m={useGlow(P.orange, 0.8)} />
    </group>
  );
};
export const Aio: React.FC<{ p?: V3; r?: V3; s?: number; spin?: number; glow?: number }> = ({ p = [0, 0, 0], r = [0, 0, 0], s = 1, spin = 0, glow = 1 }) => {
  const M = useMats();
  const ring = useGlow(P.orange, 2 * glow);
  return (
    <group position={p} rotation={r} scale={s}>
      <Box p={[0, 1.4, 0]} s={[36, 2.8, 12.4]} m={M.black} />
      {[-12, 0, 12].map((x) => (
        <group key={x} position={[x, 2.85, 0]}>
          <Fan r={5.4} spin={spin + x} M={M} ring={ring} blades={9} />
        </group>
      ))}
      <Cyl p={[-17, 1.4, 3]} rt={0.5} h={14} m={M.rubber} r={[Math.PI / 2, 0, 0]} />
      <Cyl p={[-17, 1.4, -3]} rt={0.5} h={14} m={M.rubber} r={[Math.PI / 2, 0, 0]} />
      <group position={[-17, 1.4, 11]}>
        <Cyl rt={3.1} h={3} m={M.black} />
        <mesh position={[0, 1.51, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.6, 40]} />
          <meshStandardMaterial color="#050505" emissive={P.orange} emissiveIntensity={1.3 * glow} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};

/* ===================================================================== desk setup, console, devices */
export const Monitor: React.FC<{ p?: V3; r?: V3; s?: number; screen?: number; color?: string }> = ({ p = [0, 0, 0], r = [0, 0, 0], s = 1, screen = 1, color = P.orange }) => {
  const M = useMats();
  const sc = useGlow(color, 1.1 * screen);
  return (
    <group position={p} rotation={r} scale={s}>
      <RBox p={[0, 22, 0]} s={[62, 36, 2]} m={M.black} rad={0.6} />
      <Box p={[0, 22.4, 1.02]} s={[60, 33.6, 0.05]} m={sc} />
      <Box p={[0, 9, -2]} s={[4, 16, 2]} m={M.gunmetal} />
      <RBox p={[0, 0.4, -2]} s={[22, 0.8, 16]} m={M.gunmetal} rad={0.3} />
      <Glow p={[0, 22, 6]} s={70} color={color} o={0.18 * screen} />
    </group>
  );
};
export const Desk: React.FC<{ p?: V3; power?: number; spin?: number; screenColor?: string; f?: number }> = ({ p = [0, 0, 0], power = 1, spin = 0, screenColor = P.orange, f = 0 }) => {
  const M = useMats();
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ color: "#1a1410", metalness: 0.1, roughness: 0.6 }), []);
  const kb = useGlow(P.orange, 0.8 * power);
  return (
    <group position={p}>
      <Box p={[0, 74, 0]} s={[160, 3, 75]} m={wood} />
      {[-75, 75].map((x) => (
        <Box key={x} p={[x, 36, 0]} s={[4, 72, 66]} m={M.gunmetal} />
      ))}
      <Monitor p={[-12, 75.5, -16]} s={1.05} screen={power} color={screenColor} />
      <RBox p={[-12, 76.3, 14]} s={[44, 1.6, 14]} m={M.black} rad={0.4} />
      <Box p={[-12, 77.15, 14]} s={[42, 0.05, 12.4]} m={kb} />
      <RBox p={[24, 76, 15]} s={[6.5, 1.6, 11]} m={M.black} rad={0.8} />
      <Tower p={[58, 75.5, -8]} r={[0, -Math.PI / 2, 0]} s={0.85} power={power} spin={spin} phase={f * 0.08} />
    </group>
  );
};
/** Generic modern console (tower form, no brand) + controller. */
export const Console: React.FC<{ p?: V3; r?: V3; s?: number; glow?: number }> = ({ p = [0, 0, 0], r = [0, 0, 0], s = 1, glow = 1 }) => {
  const M = useMats();
  const g = useGlow(P.white, 1.4 * glow);
  return (
    <group position={p} rotation={r} scale={s}>
      <RBox p={[0, 15, 0]} s={[10, 30, 26]} m={M.white} rad={1.2} />
      <RBox p={[0, 15, 0]} s={[6, 30.2, 26.2]} m={M.black} rad={0.6} />
      <Box p={[5.02, 26, 10]} s={[0.05, 0.4, 4]} m={g} />
      <group position={[22, 2, 8]} rotation={[0, -0.5, 0]}>
        <RBox p={[0, 1.6, 0]} s={[15, 3.2, 9]} m={M.black} rad={1.4} />
        <Cyl p={[-3.6, 3.4, -1]} rt={1.1} h={0.8} m={M.gunmetal} />
        <Cyl p={[3.6, 3.4, 1.5]} rt={1.1} h={0.8} m={M.gunmetal} />
      </group>
    </group>
  );
};
export const Laptop: React.FC<{ p?: V3; r?: V3; s?: number; screen?: number }> = ({ p = [0, 0, 0], r = [0, 0, 0], s = 1, screen = 1 }) => {
  const M = useMats();
  const sc = useGlow(P.cool, 0.7 * screen);
  return (
    <group position={p} rotation={r} scale={s}>
      <RBox p={[0, 0.8, 0]} s={[32, 1.6, 22]} m={M.alu} rad={0.5} />
      <group position={[0, 1.6, -11]} rotation={[-0.25, 0, 0]}>
        <RBox p={[0, 10.5, 0]} s={[32, 21, 0.8]} m={M.alu} rad={0.4} />
        <Box p={[0, 10.8, 0.42]} s={[30, 19, 0.04]} m={sc} />
      </group>
    </group>
  );
};
export const PhoneSlab: React.FC<{ p?: V3; r?: V3; s?: number; screen?: number }> = ({ p = [0, 0, 0], r = [0, 0, 0], s = 1, screen = 1 }) => {
  const M = useMats();
  const sc = useGlow(P.coral, 0.7 * screen);
  return (
    <group position={p} rotation={r} scale={s}>
      <RBox p={[0, 7.5, 0]} s={[7.4, 15.5, 0.85]} m={M.black} rad={0.9} />
      <Box p={[0, 7.5, 0.44]} s={[6.8, 14.8, 0.02]} m={sc} />
    </group>
  );
};
export const Tv: React.FC<{ p?: V3; r?: V3; s?: number; screen?: number }> = ({ p = [0, 0, 0], r = [0, 0, 0], s = 1, screen = 1 }) => <Monitor p={p} r={r} s={s} screen={screen} color={P.cool} />;

/* ===================================================================== jewellery case + scale */
export const JewelCase: React.FC<{ p?: V3; s?: number; children?: React.ReactNode }> = ({ p = [0, 0, 0], s = 1, children }) => {
  const M = useMats();
  const glass = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#ffffff", metalness: 0, roughness: 0.02, transmission: 0.95, thickness: 0.6, transparent: true, opacity: 0.14, clearcoat: 1 }), []);
  return (
    <group position={p} scale={s}>
      <RBox p={[0, 6, 0]} s={[26, 12, 16]} m={M.black} rad={0.6} />
      <Box p={[0, 12.2, 0]} s={[24, 0.6, 14]} m={M.velvet} />
      <Box p={[0, 12.1, 0]} s={[26.2, 0.3, 16.2]} m={M.gold} />
      <mesh position={[0, 21, 0]} material={glass}>
        <boxGeometry args={[25, 17, 15]} />
      </mesh>
      <group position={[0, 12.5, 0]}>{children}</group>
    </group>
  );
};
/** Balance scale: tilt -1..1 (positive = right pan down). */
export const Balance: React.FC<{ tilt: number; p?: V3; s?: number; left?: React.ReactNode; right?: React.ReactNode }> = ({ tilt, p = [0, 0, 0], s = 1, left, right }) => {
  const M = useMats();
  const a = -tilt * 0.32;
  const arm = 22;
  const glow = useGlow(P.orange, 1.5);
  return (
    <group position={p} scale={s}>
      <Cyl p={[0, 0.6, 0]} rt={6} rb={7} h={1.2} m={M.gunmetal} />
      <Cyl p={[0, 13, 0]} rt={0.6} h={24} m={M.alu} />
      <group position={[0, 25, 0]} rotation={[0, 0, a]}>
        <Box s={[arm * 2, 0.8, 0.8]} m={M.alu} />
        <Box p={[0, 0.5, 0]} s={[arm * 2 - 2, 0.08, 0.3]} m={glow} />
        {[-1, 1].map((side) => (
          <group key={side} position={[side * arm, 0, 0]} rotation={[0, 0, -a]}>
            <Cyl p={[0, -5, 0]} rt={0.08} h={10} m={M.steel} />
            <Cyl p={[0, -10, 0]} rt={7} rb={6} h={0.6} m={M.gunmetal} />
            <group position={[0, -9.6, 0]}>{side < 0 ? left : right}</group>
          </group>
        ))}
      </group>
    </group>
  );
};

/* ===================================================================== 3D numerals */
const font = new FontLoader().parse(helv as unknown as Parameters<FontLoader["parse"]>[0]);
/** Extruded metal text (helvetiker bold), centred. h = cap height. */
export const Text3D: React.FC<{ text: string; h?: number; depth?: number; p?: V3; r?: V3; mat?: THREE.Material; accent?: number }> = ({ text, h = 10, depth = 2, p = [0, 0, 0], r = [0, 0, 0], mat, accent = 0 }) => {
  const M = useMats();
  const geo = useMemo(() => {
    const g = new TextGeometry(text, { font, size: h, depth, curveSegments: 8, bevelEnabled: true, bevelThickness: h * 0.03, bevelSize: h * 0.025, bevelSegments: 3 });
    g.computeBoundingBox();
    const b = g.boundingBox!;
    g.translate(-(b.max.x + b.min.x) / 2, -(b.max.y + b.min.y) / 2, -depth / 2);
    return g;
  }, [text, h, depth]);
  const edge = useGlow(P.orange, accent);
  return (
    <group position={p} rotation={r}>
      <mesh geometry={geo} material={mat ?? M.alu} />
      {accent > 0 ? <mesh geometry={geo} material={edge} position={[0, 0, -0.15]} scale={[1.004, 1.004, 1]} /> : null}
    </group>
  );
};
