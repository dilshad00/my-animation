/** UG-006 asset turntable reel: every procedural model on the studio stage, 60 frames each. */
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Backdrop, Grain, HEAD, MONO, Vignette } from "./Look6";
import { Accel, DramArray, Floor, FeCard, Hbm, P, Shadow, Stage, Transistor, Wafer, type V3, Dimm } from "./Three6";
import { Aio, Arm, Balance, Console, Conveyor, Cpu, Crates, Desk, Fab, Foup, Hall, JewelCase, Laptop, Litho, Mobo, PhoneSlab, Psu, Rack, Shelf, Ssd, Text3D, Tower } from "./World6";
import { RtxCard } from "../ug5/Three5";

type Item = { name: string; dist: number; y: number; fov?: number; el?: number; node: (f: number) => React.ReactNode; light?: number; floor?: boolean };
const T = 60;
const ITEMS: Item[] = [
  { name: "RTX 5090-class · dual flow-through", dist: 48, y: 0, node: (f) => <FeCard cls="90" spin={f * 0.3} r={[0.5, 0, 0]} p={[0, 4, 0]} /> },
  { name: "RTX 5070-class", dist: 40, y: 0, node: (f) => <FeCard cls="70" spin={f * 0.3} r={[0.5, 0, 0]} p={[0, 4, 0]} /> },
  { name: "Partner triple-fan card (alt. brands)", dist: 50, y: 0, node: (f) => <RtxCard spin={f * 0.3} accent={P.coral} p={[0, 4, 0]} r={[0.5, 0, 0]} /> },
  { name: "Gaming tower", dist: 120, y: 24, node: (f) => <Tower power={1} spin={f * 0.35} phase={f * 0.1} p={[0, 0, 0]} /> },
  { name: "DDR5 UDIMM", dist: 26, y: 2, node: (f) => <Dimm rgb={1} phase={f * 0.15} spreader={f < 30 ? 1 : Math.max(0, 1 - (f - 30) / 20)} /> },
  { name: "Server RDIMM", dist: 24, y: 2, node: () => <Dimm kind="rdimm" spreader={0} /> },
  { name: "HBM stack (exploded)", dist: 7, y: 0.8, node: (f) => <Hbm explode={Math.min(1, f / 40)} tsv={Math.min(1, f / 30)} s={1.6} /> },
  { name: "AI accelerator package", dist: 30, y: 2, node: (f) => <Accel explode={Math.min(1, f / 45)} hbmGlow={0.6} p={[0, 1, 0]} /> },
  { name: "300 mm wafer", dist: 60, y: 0, el: 0.9, node: (f) => <Wafer glow={0.2} sectors={[[0.7, P.orange], [0.3, P.coral]]} sectorK={Math.min(1, f / 30)} p={[0, 2, 0]} /> },
  { name: "DRAM cell array (1T1C)", dist: 36, y: 0, el: 0.7, node: (f) => <DramArray n={14} charge={(i, j) => ((i * 3 + j * 5 + Math.floor(f / 4)) % 7 < 2 ? 1 : 0)} /> },
  { name: "Transistor cross-section", dist: 16, y: 0.5, node: (f) => <Transistor on={0.5 + 0.5 * Math.sin(f * 0.2)} /> },
  { name: "Server rack + sled", dist: 70, y: 10, node: (f) => <Rack f={f} open={Math.min(1, f / 40)} openRow={8} accel={0.8} /> },
  { name: "Data-centre hall (instanced)", dist: 1, y: 10, fov: 50, floor: false, node: (f) => <Hall f={f} aisles={7} len={36} /> },
  { name: "GPU production line + arm", dist: 110, y: 6, node: (f) => (
      <>
        <Conveyor f={f} speed={0.5} item="die" len={100} />
        <Arm p={[0, -1.3, -12]} a={0.3 + Math.sin(f * 0.1) * 0.4} b={0.5} c={-1.3 + Math.sin(f * 0.1) * 0.2} s={0.8} />
      </>
    ) },
  { name: "Allocation crates", dist: 80, y: 8, node: (f) => <Crates n={25} vis={(i) => (i < 25 - Math.floor(f / 8) ? 1 : 0)} /> },
  { name: "Retail shelves", dist: 90, y: 20, node: () => <Shelf filled={(l, s) => (l * 7 + s * 3) % 5 === 0} tag={(l, s) => ((l + s) % 3 === 0 ? 1 : 0)} p={[0, 0, 0]} /> },
  { name: "Fab construction (5 stages)", dist: 260, y: 10, el: 0.45, node: (f) => <Fab stage={f / 12} f={f} /> },
  { name: "Lithography scanner + FOUP", dist: 95, y: 12, node: () => (
      <>
        <Litho beam={1} />
        <Foup p={[28, 0, 6]} s={1.6} />
      </>
    ) },
  { name: "PC parts: CPU · board · SSD · PSU · AIO", dist: 110, y: 8, node: (f) => (
      <>
        <Mobo p={[-28, 0, 0]} r={[0.4, 0, 0]} s={0.9} />
        <Cpu p={[-2, 4, 10]} s={2} r={[0.5, f * 0.04, 0]} />
        <Ssd p={[10, 4, 10]} s={1.6} r={[0.5, 0, 0]} />
        <Psu p={[26, 0, 0]} spin={f * 0.3} />
        <Aio p={[2, 18, -16]} spin={f * 0.3} s={0.9} />
      </>
    ) },
  { name: "Desk setup", dist: 320, y: 70, node: (f) => <Desk power={1} spin={f * 0.3} f={f} /> },
  { name: "Console · laptop · phone", dist: 110, y: 10, node: () => (
      <>
        <Console p={[-30, 0, 0]} />
        <Laptop p={[14, 0, 0]} />
        <PhoneSlab p={[38, 0, 0]} s={1.4} />
      </>
    ) },
  { name: "Jewellery case + balance", dist: 140, y: 18, node: (f) => (
      <>
        <JewelCase p={[-34, 0, 0]}>
          <Dimm rgb={1} phase={f * 0.1} p={[0, 0, 0]} />
        </JewelCase>
        <Balance p={[30, 0, 0]} tilt={Math.sin(f * 0.08)} />
      </>
    ) },
  { name: "3D numerals", dist: 120, y: 0, node: () => <Text3D text="2030" h={20} depth={5} accent={2} /> },
];
export const ASSETS_FRAMES = ITEMS.length * T;

const One: React.FC<{ it: Item }> = ({ it }) => {
  const f = useCurrentFrame();
  const a = (f / T) * 1.4 - 0.7;
  const el = it.el ?? 0.32;
  const pos: V3 = it.name.startsWith("Data-centre") ? [0, 12, 40 - f * 1.5] : [Math.sin(a) * it.dist * Math.cos(el), it.y + it.dist * Math.sin(el), Math.cos(a) * it.dist * Math.cos(el)];
  const target: V3 = it.name.startsWith("Data-centre") ? [0, 9, -200] : [0, it.y, 0];
  return (
    <AbsoluteFill>
      <Backdrop f={f} />
      <Stage cam={{ pos, target, fov: it.fov ?? 32 }} fog={it.name.startsWith("Data-centre") ? 0.006 : 0}>
        {it.floor === false ? null : <Floor y={-0.02} r={600} />}
        {it.floor === false ? null : <Shadow w={it.dist * 0.8} d={it.dist * 0.5} />}
        {it.node(f)}
      </Stage>
      <div style={{ position: "absolute", left: 60, top: 50, fontFamily: MONO, fontWeight: 700, fontSize: 22, color: P.orange, letterSpacing: 4 }}>UG-006 · ASSET</div>
      <div style={{ position: "absolute", left: 60, top: 84, fontFamily: HEAD, fontWeight: 800, fontSize: 64, color: P.white, textTransform: "uppercase" }}>{it.name}</div>
      <Vignette k={0.55} />
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};

export const UgSixAssets: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: P.bg }}>
    {ITEMS.map((it, i) => (
      <Sequence key={it.name} from={i * T} durationInFrames={T}>
        <One it={it} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
