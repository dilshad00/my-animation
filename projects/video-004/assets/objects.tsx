// Video-004 props: the music box, the scan, the horde and the close-ups. Registered additively in src/components/objects/registry.tsx.
import React from "react";
import { darken, lighten, mix } from "../../../src/utils/color";
import { tweenNum } from "../../../src/utils/tween";
import { random } from "remotion";
import type { ObjectDef, ObjectProps } from "../../../src/components/objects/types";
import { Halo } from "./environments";

const r = (seed: string, k: string | number) => random(`${seed}-${k}`);
const clamp = (v: number) => Math.max(0, Math.min(1, v));
const WOOD = "#7a4a2a";
const BABY = "#efcdb4";
const MARA = "#c08a62";
const PALE = "#c9d3d8";
const BROWN = "#6b3f22";

/** Wind-up music box (ground origin, ≈ 260×240). props: { open: 0..1, turning: true, rust: 0..1, notes: true } */
const MusicBox: React.FC<ObjectProps> = ({ L, t, props }) => {
  const rust = tweenNum(props.rust, t, 0);
  const open = tweenNum(props.open, t, 1);
  const wood = mix(WOOD, "#8a4b2a", rust);
  const crank = props.turning ? t * 140 : 20;
  return (
    <g>
      <rect x={-120} y={-120} width={240} height={120} rx={8} fill={L(wood)} />
      <rect x={-120} y={-120} width={240} height={14} fill={L(lighten(wood, 0.18))} />
      <rect x={-104} y={-96} width={208} height={80} rx={4} fill="none" stroke={L(darken(wood, 0.3))} strokeWidth={4} />
      <path d="M-30,-58 q30,-30 60,0 q-30,30 -60,0" fill="none" stroke={L("#d4a84a")} strokeWidth={4} />
      {rust > 0.05
        ? Array.from({ length: 9 }).map((_, i) => <circle key={i} cx={-100 + ((i * 53) % 200)} cy={-20 - ((i * 37) % 90)} r={4 + (i % 3) * 3} fill={L("#5a2c16")} opacity={rust * 0.7} />)
        : null}
      {/* lid, hinged at the back edge: seen from the front it rises behind the box, showing its felt lining */}
      {open > 0.02 ? (
        <g>
          <path d={`M-120,-120 L-112,${-120 - 150 * open} L112,${-120 - 150 * open} L120,-120 Z`} fill={L(lighten(wood, 0.06))} />
          <path d={`M-104,-124 L-98,${-114 - 136 * open} L98,${-114 - 136 * open} L104,-124 Z`} fill={L("#8c1f2a")} />
          <rect x={-40} y={-120 - 110 * open} width={80} height={70 * open} rx={6} fill={L("#c9d6df")} opacity={0.7} />
        </g>
      ) : (
        <rect x={-124} y={-136} width={248} height={18} rx={4} fill={L(lighten(wood, 0.08))} />
      )}
      {open > 0.2 ? (
        <g opacity={open}>
          <rect x={-100} y={-132} width={200} height={16} fill={L("#8c1f2a")} />
          <rect x={-60} y={-150} width={110} height={20} rx={10} fill={L("#c9b27a")} />
          {Array.from({ length: 10 }).map((_, i) => <rect key={i} x={-56 + i * 11} y={-148} width={3} height={16} fill={L("#8a7440")} />)}
        </g>
      ) : null}
      {/* crank */}
      <g transform={`translate(126 -60) rotate(${crank})`}>
        <rect x={-4} y={-4} width={46} height={8} rx={4} fill={L("#b9a06a")} />
        <circle cx={42} cy={0} r={9} fill={L("#e2d2a0")} />
      </g>
      <circle cx={126} cy={-60} r={8} fill={L("#8a7440")} />
      {props.notes
        ? Array.from({ length: 5 }).map((_, i) => {
            const k = (t * 0.45 + i * 0.2) % 1;
            const x = -40 + i * 26 + Math.sin(t * 2 + i) * 30 + k * 60;
            const y = -170 - k * 260;
            return (
              <g key={i} opacity={Math.sin(k * Math.PI) * 0.9} transform={`translate(${x} ${y}) scale(${1 + k * 0.4})`}>
                <ellipse cx={0} cy={0} rx={11} ry={8} fill="#ffe9b0" transform="rotate(-20)" />
                <rect x={8} y={-40} width={4} height={40} fill="#ffe9b0" />
                {i % 2 ? <path d="M12,-40 q16,6 14,22" stroke="#ffe9b0" strokeWidth={4} fill="none" /> : null}
              </g>
            );
          })
        : null}
    </g>
  );
};

/** ECG line through a box, scrolling with time. */
const trace = (w: number, h: number, t: number, period: number, phase: number, amp: number) => {
  const pts: string[] = [];
  const step = 6;
  for (let x = 0; x <= w; x += step) {
    const ph = ((x / w) * 2.4 + t / period + phase) % 1;
    let y = 0;
    if (ph > 0.42 && ph < 0.46) y = -amp * 0.25;
    else if (ph >= 0.46 && ph < 0.49) y = amp;
    else if (ph >= 0.49 && ph < 0.52) y = -amp * 1.1;
    else if (ph >= 0.52 && ph < 0.55) y = amp * 0.3;
    else if (ph > 0.65 && ph < 0.75) y = -amp * 0.2 * Math.sin(((ph - 0.65) / 0.1) * Math.PI);
    pts.push(`${x},${(h / 2 + y).toFixed(1)}`);
  }
  return "M" + pts.join(" L");
};

/** Cracked old monitor with one or two heartbeat traces (ground origin, ≈ 620×520).
 * props: { traces: 1|2, label: "…", crack: true, full: true (screen only, centre origin) } */
const ScanMonitor: React.FC<ObjectProps> = ({ L, t, props }) => {
  const n = (props.traces as number) ?? 2;
  const full = !!props.full;
  const W = full ? 1500 : 520, H = full ? 760 : 330;
  const screen = (
    <g>
      <rect x={0} y={0} width={W} height={H} rx={full ? 0 : 18} fill="#04140e" />
      {Array.from({ length: Math.floor(W / 40) }).map((_, i) => <rect key={i} x={i * 40} y={0} width={1} height={H} fill="#0f3a2a" />)}
      {Array.from({ length: Math.floor(H / 40) }).map((_, i) => <rect key={"h" + i} x={0} y={i * 40} width={W} height={1} fill="#0f3a2a" />)}
      <g transform={`translate(0 ${n === 2 ? -H * 0.2 : 0})`}>
        <path d={trace(W, H, t, 0.82, 0, H * 0.18)} stroke="#7be0a2" strokeWidth={full ? 6 : 4} fill="none" />
      </g>
      {n === 2 ? (
        <g transform={`translate(0 ${H * 0.2})`}>
          <path d={trace(W, H, t, 1.31, 0.37, H * 0.15)} stroke="#bcd7ff" strokeWidth={full ? 6 : 4} fill="none" opacity={0.95} />
        </g>
      ) : null}
      <text x={W - 30} y={full ? 70 : 40} textAnchor="end" fontSize={full ? 48 : 24} fontFamily="monospace" fill="#7be0a2">{(props.label as string) ?? "♥ 142"}</text>
      {n === 2 ? <text x={W - 30} y={H - 30} textAnchor="end" fontSize={full ? 48 : 24} fontFamily="monospace" fill="#bcd7ff">♥ ??</text> : null}
      {props.crack !== false ? <path d={`M${W * 0.62},0 L${W * 0.55},${H * 0.3} L${W * 0.7},${H * 0.45} L${W * 0.6},${H}`} stroke="#9fb3a8" strokeWidth={2} fill="none" opacity={0.5} /> : null}
      <rect x={0} y={0} width={W} height={H} fill="#7be0a2" opacity={0.04 + 0.02 * Math.sin(t * 30)} />
    </g>
  );
  if (full) return <g transform={`translate(${-W / 2} ${-H / 2})`}>{screen}</g>;
  return (
    <g>
      <rect x={-60} y={-40} width={120} height={40} fill={L("#3a3a3a")} />
      <rect x={-310} y={-520} width={620} height={480} rx={28} fill={L("#cfc8b4")} />
      <rect x={-300} y={-510} width={600} height={20} rx={10} fill={L("#e2dccb")} />
      <g transform="translate(-260 -470)">{screen}</g>
      {[-200, -140].map((x) => <circle key={x} cx={x} cy={-80} r={12} fill={L("#6b6455")} />)}
      <rect x={120} y={-90} width={120} height={18} rx={6} fill={L("#6b6455")} />
    </g>
  );
};

/** Open notebook (centre origin, ≈ 940×600). props: { marks: 0..1 (animatable), word: "…", write: 0..1 (animatable) } */
const Notebook: React.FC<ObjectProps> = ({ L, t, props, seed }) => {
  const marks = tweenNum(props.marks, t, 1);
  const write = tweenNum(props.write, t, 1);
  const word = props.word as string | undefined;
  const nQ = Math.round(marks * 22);
  return (
    <g>
      <path d="M-470,-280 Q-240,-310 0,-270 Q240,-310 470,-280 L470,300 Q240,270 0,300 Q-240,270 -470,300 Z" fill={L("#5a4030")} />
      <path d="M-450,-262 Q-230,-290 -6,-256 L-6,282 Q-230,252 -450,280 Z" fill={L("#efe6cf")} />
      <path d="M450,-262 Q230,-290 6,-256 L6,282 Q230,252 450,280 Z" fill={L("#f3ead4")} />
      <rect x={-8} y={-270} width={16} height={566} fill={L("#3a2a20")} opacity={0.5} />
      {Array.from({ length: 11 }).map((_, i) => (
        <g key={i}>
          <path d={`M-420,${-210 + i * 44} L-40,${-206 + i * 44}`} stroke={L("#a9c0d0")} strokeWidth={2} />
          {!word ? <path d={`M40,${-206 + i * 44} L420,${-210 + i * 44}`} stroke={L("#a9c0d0")} strokeWidth={2} /> : null}
          <path d={`M-410,${-218 + i * 44} q${40 + r(seed, i) * 60},-6 ${120 + r(seed, "w" + i) * 160},0`} stroke={L("#3a3a52")} strokeWidth={3} fill="none" opacity={0.7} />
        </g>
      ))}
      {Array.from({ length: nQ }).map((_, i) => (
        <text key={i} x={(word ? -380 : -380 + (i % 2) * 460) + r(seed, "qx" + i) * 300} y={-190 + r(seed, "qy" + i) * 440} fontSize={34 + r(seed, "qs" + i) * 30} fontFamily="Georgia, serif" fontStyle="italic" fill={L("#8c2b2b")} transform={`rotate(${(r(seed, "qr" + i) - 0.5) * 30})`}>?</text>
      ))}
      {word ? (
        <g>
          <defs>
            <clipPath id={`nbclip-${seed}`}>
              <rect x={40} y={-200} width={400 * clamp(write)} height={400} />
            </clipPath>
          </defs>
          <text x={230} y={40} textAnchor="middle" fontSize={130} fontFamily="Georgia, serif" fontStyle="italic" fill={L("#23233a")} clipPath={`url(#nbclip-${seed})`}>{word}</text>
        </g>
      ) : null}
    </g>
  );
};

/** Hanging or standing lantern (ground origin, ≈ 90×200). props: { lit: 0..1 } */
const Lantern: React.FC<ObjectProps> = ({ L, t, props }) => {
  const lit = tweenNum(props.lit, t, 1);
  const f = 1 + Math.sin(t * 13) * 0.08 + Math.sin(t * 7.3) * 0.05;
  return (
    <g>
      <Halo x={0} y={-100} r={230 * f} color="#ffb84d" a={0.45 * lit} />
      <rect x={-42} y={-30} width={84} height={30} rx={6} fill={L("#2e2a26")} />
      <path d="M-36,-30 L-30,-160 L30,-160 L36,-30 Z" fill={lit > 0 ? "#ffe3a3" : L("#59544c")} opacity={0.35 + 0.55 * lit} />
      <ellipse cx={0} cy={-90} rx={12 * f} ry={26 * f} fill="#fff1c4" opacity={lit} />
      {[-34, 34].map((x) => <rect key={x} x={x - 4} y={-165} width={8} height={140} fill={L("#2e2a26")} />)}
      <path d="M-40,-160 L0,-200 L40,-160 Z" fill={L("#2e2a26")} />
      <path d="M-16,-200 q16,-30 32,0" stroke={L("#2e2a26")} strokeWidth={6} fill="none" />
    </g>
  );
};

/** Torch on a pole with a live flame (ground origin, ≈ 60×300). */
const Torch: React.FC<ObjectProps> = ({ L, t, seed }) => {
  const ph = r(seed, "p") * 10;
  const f = Math.sin(t * 17 + ph) * 6;
  return (
    <g>
      <Halo x={0} y={-270} r={220 + f * 3} color="#ff8c3a" a={0.42} />
      <rect x={-7} y={-230} width={14} height={230} fill={L("#5a3a22")} />
      <rect x={-13} y={-240} width={26} height={30} rx={4} fill={L("#3a2a20")} />
      <path d={`M-22,-240 Q${-24 + f},-290 ${f * 0.8},-${330 + f} Q${22 + f},-290 22,-240 Z`} fill="#ff9f43" />
      <path d={`M-12,-240 Q${-10 + f * 0.6},-276 ${f * 0.5},-${300 + f * 0.6} Q${12},-276 12,-240 Z`} fill="#ffe08a" />
    </g>
  );
};

/** One shambling silhouette, feet at 0. front = 0 side … 1 facing camera. */
const Shambler: React.FC<{ c: string; eye: string; front: boolean; lean: number; arm: number; s: number; eyes: number }> = ({ c, eye, front, lean, arm, s, eyes }) => (
  <g transform={`scale(${s}) rotate(${lean})`}>
    <rect x={-17} y={-70} width={14} height={70} fill={c} transform="rotate(3 -10 -70)" />
    <rect x={3} y={-70} width={14} height={70} fill={c} transform="rotate(-4 10 -70)" />
    <path d="M-28,-132 Q0,-142 28,-132 L22,-66 L-22,-66 Z" fill={c} />
    {front ? (
      <>
        <path d={`M-28,-128 Q-40,-100 ${-36 + arm},-62`} stroke={c} strokeWidth={11} strokeLinecap="round" fill="none" />
        <path d={`M28,-128 Q40,-100 ${36 - arm},-62`} stroke={c} strokeWidth={11} strokeLinecap="round" fill="none" />
      </>
    ) : (
      <path d={`M10,-126 Q${34 + arm},-110 ${46 + arm},-96`} stroke={c} strokeWidth={11} strokeLinecap="round" fill="none" />
    )}
    <circle cx={front ? 0 : 8} cy={-152} r={19} fill={c} />
    {eyes > 0 ? (
      front ? (
        <g fill={eye} opacity={eyes}>
          <circle cx={-7} cy={-154} r={3.4} />
          <circle cx={7} cy={-154} r={3.4} />
        </g>
      ) : (
        <circle cx={18} cy={-154} r={3.4} fill={eye} opacity={eyes} />
      )
    ) : null}
  </g>
);

/** A crowd of shambling silhouettes in rows (ground origin of the front row, ≈ width×300).
 * props (animatable unless noted): { count: 14 (per row), rows: 3, width: 1800, turn: 0..1 (face the camera),
 * still: 0..1 (stop moving), back: 0..1 (shrink away from the centre), eyes: 0..1, eyeColor, march: px/s (static) } */
const Horde: React.FC<ObjectProps> = ({ t, props, seed, p, L, color }) => {
  const count = (props.count as number) ?? 14;
  const rows = (props.rows as number) ?? 3;
  const width = (props.width as number) ?? 1800;
  const turn = tweenNum(props.turn, t, 0);
  const still = tweenNum(props.still, t, 0);
  const back = tweenNum(props.back, t, 0);
  const eyes = tweenNum(props.eyes, t, 0.9);
  const eyeC = (props.eyeColor as string) ?? "#d6efe6";
  const march = ((props.march as number) ?? 0) * (1 - still);
  const base = color ?? "#1d2422";
  const haze = p.time === "night" ? "#55687a" : p.time === "dawn" ? "#9aa4b2" : "#8d989c";
  const out: React.ReactNode[] = [];
  for (let row = rows - 1; row >= 0; row--) {
    const k = row / Math.max(1, rows - 1);
    const s = 1 - k * 0.45;
    const y = -k * 120;
    const c = L(mix(base, haze, k * 0.55));
    for (let i = 0; i < count; i++) {
      const id = `${row}-${i}`;
      const fx = (i + 0.5 + (r(seed, "x" + id) - 0.5) * 0.7) / count - 0.5;
      let x = fx * width * (1 + k * 0.1) + march * t * (0.7 + r(seed, "m" + id) * 0.6);
      const w2 = width / 2;
      x = ((((x + w2) % width) + width) % width) - w2;
      const spread = 1 + back * 0.6;
      const motion = 1 - still;
      const ph = r(seed, "ph" + id) * 6.28;
      const lean = Math.sin(t * 1.6 + ph) * 7 * motion + (r(seed, "l" + id) - 0.5) * 10;
      const bob = Math.abs(Math.sin(t * 1.6 + ph)) * 6 * motion;
      const front = r(seed, "f" + id) < turn;
      const flip = r(seed, "d" + id) > 0.5 && !front;
      out.push(
        <g key={id} transform={`translate(${x * spread} ${y - bob - back * 40 * (1 - k)}) scale(${(flip ? -1 : 1) * (1 - back * 0.25)} ${1 - back * 0.25})`}>
          <Shambler c={c} eye={eyeC} front={front} lean={lean} arm={Math.sin(t * 1.3 + ph) * 8 * motion} s={s * (0.92 + r(seed, "s" + id) * 0.16)} eyes={eyes * (1 - k * 0.3)} />
        </g>,
      );
    }
  }
  return <g>{out}</g>;
};

/** Newborn close-up, swaddled (centre origin, ≈ 640×620). props: { eyes: 0..1 (animatable), cry: true, mark: 0..1 glow, details: 0..1 (animatable) } */
const Baby: React.FC<ObjectProps> = ({ L, t, props }) => {
  const eyes = tweenNum(props.eyes, t, 1);
  const glow = tweenNum(props.mark, t, 0.6);
  const det = tweenNum(props.details, t, 1);
  const cry = tweenNum(props.cry, t, 0) > 0.5;
  const breathe = 1 + Math.sin(t * 2.4) * 0.012;
  return (
    <g transform={`scale(${breathe})`}>
      <path d="M-300,320 Q-330,40 -150,-60 Q0,-130 150,-60 Q330,40 300,320 Z" fill={L("#d9cbb0")} />
      <path d="M-300,320 Q-250,160 -60,120 Q120,90 300,320 Z" fill={L("#c7b797")} />
      <path d="M-220,60 Q0,160 220,50" stroke={L("#b3a37f")} strokeWidth={8} fill="none" />
      {/* left arm out of the blanket, with the frost mark */}
      <g transform="translate(-170 120) rotate(-28)">
        <rect x={-40} y={-30} width={170} height={66} rx={33} fill={L(BABY)} />
        <circle cx={140} cy={4} r={40} fill={L(BABY)} />
        <g stroke="#e9f6ff" strokeWidth={4} strokeLinecap="round" fill="none" opacity={det * (0.55 + 0.35 * glow)}>
          {[0, 40, 80].map((x) => (
            <path key={x} d={`M${x - 6},${-14} L${x + 10},${2} L${x - 6},${18} M${x + 10},2 L${x + 30},2`} />
          ))}
        </g>
        {glow > 0 ? <ellipse cx={40} cy={2} rx={110} ry={48} fill="#cfe9ff" opacity={0.15 * glow * det} /> : null}
      </g>
      {/* head */}
      <circle cx={0} cy={-150} r={150} fill={L(BABY)} />
      <path d="M-150,-170 Q-140,-320 10,-306 Q150,-300 152,-180 Q80,-250 -10,-240 Q-90,-236 -150,-170 Z" fill={L("#2a1d16")} />
      <path d="M30,-302 Q70,-262 64,-208" stroke={det > 0 ? mix("#2a1d16", "#f4f4f4", det) : L("#2a1d16")} strokeWidth={22} strokeLinecap="round" fill="none" />
      <ellipse cx={-90} cy={-100} rx={30} ry={18} fill="#ff8a8a" opacity={0.25} />
      <ellipse cx={90} cy={-100} rx={30} ry={18} fill="#ff8a8a" opacity={0.25} />
      {/* eyes: Mara's brown (screen-left), the cold pale grey (screen-right) */}
      {[
        [-56, BROWN],
        [56, PALE],
      ].map(([x, c]) => (
        <g key={x as number}>
          {eyes > 0.1 ? (
            <>
              <ellipse cx={x as number} cy={-150} rx={30} ry={30 * eyes} fill="#fbfbf7" />
              <circle cx={x as number} cy={-150} r={20 * Math.min(1, eyes + 0.2)} fill={c as string} />
              <circle cx={x as number} cy={-150} r={9 * eyes} fill="#111" />
              <circle cx={(x as number) + 7} cy={-158} r={5} fill="#fff" opacity={eyes} />
              {(c as string) === PALE ? <circle cx={x as number} cy={-150} r={34} fill="#dff0ff" opacity={0.12 * det * eyes} /> : null}
            </>
          ) : (
            <path d={`M${(x as number) - 26},-150 q26,14 52,0`} stroke="#5a3a2a" strokeWidth={6} fill="none" strokeLinecap="round" />
          )}
        </g>
      ))}
      <path d="M-14,-96 q14,8 28,0" stroke="#c98a70" strokeWidth={5} fill="none" />
      {cry ? <ellipse cx={0} cy={-60} rx={26} ry={16 + Math.abs(Math.sin(t * 6)) * 10} fill="#7a3a3a" /> : <path d="M-20,-64 q20,12 40,0" stroke="#b46a5a" strokeWidth={6} fill="none" strokeLinecap="round" />}
    </g>
  );
};

/** Newborn hand gripping an adult finger (centre origin, ≈ 900×420). props: { grip: 0..1 (animatable), mark: 0..1 } */
const BabyHand: React.FC<ObjectProps> = ({ L, t, props }) => {
  const grip = tweenNum(props.grip, t, 1);
  const mark = tweenNum(props.mark, t, 1);
  const hand = "#d3d6d4";
  return (
    <g>
      {/* adult finger from the right */}
      <path d="M480,-70 L60,-60 Q-20,-58 -24,0 Q-20,58 60,60 L480,70 Z" fill={L(MARA)} />
      <path d="M-10,-30 Q-26,0 -10,30 L20,28 Q4,0 20,-28 Z" fill={L(lighten(MARA, 0.25))} />
      <path d="M200,-62 q6,62 0,124 M330,-66 q6,66 0,132" stroke={L(darken(MARA, 0.2))} strokeWidth={4} fill="none" opacity={0.6} />
      {/* baby hand from the left, fingers wrapping over the finger */}
      <path d="M-480,140 Q-300,120 -160,90 Q-80,80 -40,60 L-40,-40 Q-140,-30 -200,0 Q-330,60 -480,60 Z" fill={L(hand)} />
      {Array.from({ length: 4 }).map((_, i) => {
        const x = 30 + i * 46;
        const curl = grip * 70;
        return <path key={i} d={`M${x - 120},40 Q${x - 60},${-90 + i * 4} ${x},${-60 + i * 4} Q${x + 20},${-60 + curl * 0.2} ${x + 4},${-60 + curl}`} stroke={L(hand)} strokeWidth={34} strokeLinecap="round" fill="none" />;
      })}
      <path d="M-120,70 Q-40,96 10,60" stroke={L(hand)} strokeWidth={36} strokeLinecap="round" fill="none" />
      <g stroke="#f3fbff" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.75 * mark}>
        {[-400, -330, -260].map((x) => (
          <path key={x} d={`M${x},70 L${x + 20},90 L${x},110 M${x + 20},90 L${x + 44},90`} />
        ))}
      </g>
      {mark > 0 ? <ellipse cx={-330} cy={95} rx={140} ry={40} fill="#d8efff" opacity={0.12 * mark} /> : null}
    </g>
  );
};

/** A leaf with an ant clamped to its vein; a fungal stalk grows from the ant (centre origin, ≈ 900×520). props: { stalk: 0..1 (animatable) } */
const AntLeaf: React.FC<ObjectProps> = ({ L, t, props }) => {
  const stalk = tweenNum(props.stalk, t, 0);
  const sway = Math.sin(t * 0.8) * 2;
  return (
    <g transform={`rotate(${sway})`}>
      <path d="M-440,-40 Q-120,-260 380,-120 Q420,-90 380,-60 Q-80,40 -440,-40 Z" fill={L("#4f7a3a")} />
      <path d="M-440,-40 Q-40,-110 390,-90" stroke={L("#2f4f24")} strokeWidth={6} fill="none" />
      {[-300, -160, -20, 120, 260].map((x, i) => <path key={i} d={`M${x},${-70 - i * 6} q60,-50 120,-70 M${x},${-70 - i * 6} q60,30 110,40`} stroke={L("#3c6330")} strokeWidth={3} fill="none" />)}
      <path d="M-440,-40 L-520,60" stroke={L("#3c6330")} strokeWidth={10} />
      {/* ant hanging under the vein, jaws on the leaf */}
      <g transform="translate(0 -60)">
        <ellipse cx={-70} cy={60} rx={56} ry={36} fill={L("#2a1a12")} />
        <ellipse cx={0} cy={44} rx={30} ry={22} fill={L("#3a2418")} />
        <circle cx={44} cy={26} r={24} fill={L("#3a2418")} />
        <path d="M60,10 L68,-10 M54,8 L52,-14" stroke={L("#2a1a12")} strokeWidth={6} strokeLinecap="round" />
        {[-24, 0, 22].map((x, i) => (
          <path key={i} d={`M${x},54 q${-20 + i * 10},40 ${-36 + i * 22},70`} stroke={L("#2a1a12")} strokeWidth={5} fill="none" strokeLinecap="round" />
        ))}
        <path d="M44,4 q-30,-40 -70,-50" stroke={L("#2a1a12")} strokeWidth={3} fill="none" />
        {stalk > 0 ? (
          <g>
            <path d={`M40,${8} q${-10},${-90 * stalk} ${-30 * stalk},${-200 * stalk}`} stroke={L("#c9b98a")} strokeWidth={9} strokeLinecap="round" fill="none" />
            <ellipse cx={40 - 30 * stalk} cy={8 - 200 * stalk} rx={14 * stalk} ry={20 * stalk} fill={L("#e2d3a0")} />
          </g>
        ) : null}
      </g>
    </g>
  );
};

/** Gifts left on the counter (ground origin, ≈ 200×150). props: { kind: "bandage" | "seeds" | "drawing" } */
const Gift: React.FC<ObjectProps> = ({ L, props }) => {
  const k = (props.kind as string) ?? "bandage";
  if (k === "seeds")
    return (
      <g>
        <rect x={-70} y={-170} width={140} height={170} rx={6} fill={L("#e8d9a8")} />
        <rect x={-70} y={-170} width={140} height={30} fill={L("#6a8a3a")} />
        <circle cx={0} cy={-80} r={34} fill={L("#e9a13b")} />
        <path d="M0,-46 L0,-20 M0,-34 q-20,-6 -26,-20 M0,-30 q20,-6 26,-20" stroke={L("#4f7a3a")} strokeWidth={5} fill="none" />
        <text x={0} y={-150} textAnchor="middle" fontSize={20} fontWeight={700} fontFamily="Poppins, sans-serif" fill="#f3ead4">SEEDS</text>
      </g>
    );
  if (k === "drawing")
    return (
      <g transform="rotate(-4)">
        <rect x={-150} y={-210} width={300} height={210} fill={L("#f4efe2")} />
        <path d="M-150,-50 Q-60,-80 30,-50 Q100,-30 150,-60 L150,0 L-150,0 Z" fill={L("#5aa0d8")} opacity={0.8} />
        <rect x={-100} y={-140} width={90} height={80} fill="none" stroke={L("#c0392b")} strokeWidth={5} />
        <path d="M-112,-136 L-55,-186 L2,-136" fill="none" stroke={L("#c0392b")} strokeWidth={5} />
        <rect x={-66} y={-100} width={22} height={40} fill="none" stroke={L("#7a4a2a")} strokeWidth={4} />
        <circle cx={90} cy={-160} r={26} fill="none" stroke={L("#e9a13b")} strokeWidth={5} />
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return <line key={i} x1={90 + Math.cos(a) * 34} y1={-160 + Math.sin(a) * 34} x2={90 + Math.cos(a) * 46} y2={-160 + Math.sin(a) * 46} stroke={L("#e9a13b")} strokeWidth={4} />;
        })}
      </g>
    );
  return (
    <g>
      <ellipse cx={0} cy={-60} rx={70} ry={60} fill={L("#f1ede3")} />
      <ellipse cx={0} cy={-60} rx={26} ry={22} fill={L("#cfc8b4")} />
      <path d="M60,-30 L170,-6 L170,0 L50,0 Z" fill={L("#e9e4d6")} />
    </g>
  );
};

/** Forearm close-up with an old, healed bite scar (centre origin, ≈ 1100×360). props: { scar: 0..1 (animatable), sleeve: colour } */
const Wrist: React.FC<ObjectProps> = ({ L, t, props }) => {
  const scar = tweenNum(props.scar, t, 1);
  const sleeve = (props.sleeve as string) ?? "#4d5a3a";
  return (
    <g>
      <path d="M-560,-120 L160,-104 Q230,-100 270,-96 L270,100 Q230,104 160,108 L-560,120 Z" fill={L(MARA)} />
      {/* back of the hand and fingers */}
      <path d="M250,-100 Q330,-118 400,-96 L400,92 Q330,112 250,100 Z" fill={L(MARA)} />
      {[-78, -28, 22, 70].map((y, i) => (
        <rect key={y} x={380} y={y - 20} width={150 - Math.abs(i - 1.5) * 26} height={42} rx={21} fill={L(i % 2 ? darken(MARA, 0.04) : MARA)} />
      ))}
      <path d="M300,-96 Q360,-170 430,-160 Q456,-150 440,-128 Q380,-120 340,-80 Z" fill={L(darken(MARA, 0.06))} />
      <path d="M270,-96 Q262,0 270,100" stroke={L(darken(MARA, 0.15))} strokeWidth={4} fill="none" opacity={0.5} />
      <path d="M-560,-150 L-260,-140 L-240,140 L-560,150 Z" fill={L(sleeve)} />
      <path d="M-260,-140 L-240,140" stroke={L(darken(sleeve, 0.3))} strokeWidth={8} />
      <path d="M-240,-60 L120,-56" stroke={L(darken(MARA, 0.12))} strokeWidth={3} opacity={0.5} />
      <g opacity={scar}>
        <ellipse cx={0} cy={0} rx={110} ry={62} fill={L(lighten(MARA, 0.22))} />
        {Array.from({ length: 9 }).map((_, i) => {
          const a = Math.PI * (0.15 + (i / 8) * 0.7);
          return <ellipse key={"u" + i} cx={Math.cos(a) * 96 * -1} cy={-Math.sin(a) * 46} rx={8} ry={5} fill={L(darken(MARA, 0.3))} />;
        })}
        {Array.from({ length: 9 }).map((_, i) => {
          const a = Math.PI * (0.15 + (i / 8) * 0.7);
          return <ellipse key={"l" + i} cx={Math.cos(a) * 96 * -1} cy={Math.sin(a) * 46} rx={8} ry={5} fill={L(darken(MARA, 0.3))} />;
        })}
      </g>
    </g>
  );
};

/** Mother and baby silhouette; glowing cells drift from baby into mother (centre origin, ≈ 900×900).
 * props: { flow: 0..1 (animatable), color } */
const MotherCells: React.FC<ObjectProps> = ({ t, props, color, seed }) => {
  const flow = tweenNum(props.flow, t, 1);
  const c = color ?? "#9fd8c9";
  const body = "#4b6470";
  const rim = "#8fb3bf";
  // a pregnant figure in profile facing right; the baby curls inside the belly and its cells drift up into her body
  const outline = "M-40,-420 Q40,-430 52,-350 Q58,-300 30,-268 L34,-230 Q80,-210 96,-150 Q104,-110 80,-70 Q190,-40 210,70 Q222,170 120,230 Q60,262 20,270 L30,430 L-170,430 Q-190,250 -170,80 Q-160,-60 -120,-180 Q-150,-230 -150,-300 Q-140,-410 -40,-420 Z";
  return (
    <g>
      <path d={outline} fill={body} />
      <path d={outline} fill="none" stroke={rim} strokeWidth={6} opacity={0.6} />
      <ellipse cx={95} cy={90} rx={80} ry={66} fill="#2e434c" />
      <path d="M60,120 Q40,60 80,40 Q130,30 140,80 Q150,130 100,140 Q90,110 70,130 Z" fill={c} opacity={0.75} />
      <circle cx={112} cy={60} r={26} fill={c} opacity={0.85} />
      <Halo x={95} y={90} r={150} color={c} a={0.35} />
      {Array.from({ length: 28 }).map((_, i) => {
        const k = (t * 0.12 + r(seed, "c" + i)) % 1;
        const vis = r(seed, "v" + i) < flow;
        if (!vis) return null;
        const x0 = 95, y0 = 80;
        const x1 = -140 + r(seed, "tx" + i) * 200, y1 = -380 + r(seed, "ty" + i) * 760;
        const x = x0 + (x1 - x0) * k + Math.sin(k * 6 + i) * 30;
        const y = y0 + (y1 - y0) * k;
        return (
          <g key={i} opacity={Math.min(1, k * 4) * (k > 0.9 ? 0.85 : 1)}>
            <circle cx={x} cy={y} r={22} fill={c} opacity={0.18} />
            <circle cx={x} cy={y} r={8} fill={lighten(c, 0.4)} />
          </g>
        );
      })}
    </g>
  );
};

/** Shop counter, front view (ground origin, ≈ 800×190). Characters placed behind it with a lower zIndex stand behind it. */
const Counter: React.FC<ObjectProps> = ({ L }) => (
  <g>
    <rect x={-380} y={-160} width={760} height={160} fill={L("#4a3a2e")} />
    <rect x={-400} y={-182} width={800} height={26} fill={L("#6b5440")} />
    <rect x={-380} y={-130} width={760} height={6} fill={L("#2e241c")} />
    {[-250, 0, 250].map((x) => <rect key={x} x={x - 90} y={-110} width={180} height={90} fill="none" stroke={L("#3a2d23")} strokeWidth={6} />)}
    <rect x={-380} y={-8} width={760} height={8} fill={L("#2a2019")} />
  </g>
);

const def = (component: React.FC<ObjectProps>, w: number, h: number, description: string, anchor?: "center"): ObjectDef => ({
  component,
  w,
  h,
  category: "zombie story",
  description,
  ...(anchor ? { anchor } : {}),
});

export const ZOMBIE_STORY: Record<string, ObjectDef> = {
  counter: def(Counter, 800, 190, "Shop counter (front view)"),
  musicbox: def(MusicBox, 260, 240, 'Wind-up music box. props: { "open": 0..1, "turning": true, "rust": 0..1, "notes": true }'),
  scanmonitor: def(ScanMonitor, 620, 520, 'Old monitor with heartbeat traces. props: { "traces": 1|2, "label": "…", "full": true (screen only, centre origin) }'),
  notebook: def(Notebook, 940, 600, 'Open notebook. props: { "marks": 0..1, "word": "…", "write": 0..1 }', "center"),
  lantern: def(Lantern, 90, 200, 'Lantern. props: { "lit": 0..1 }'),
  torch: def(Torch, 60, 300, "Burning torch on a pole"),
  horde: def(Horde, 1800, 300, 'Rows of shambling silhouettes. props: { "count", "rows", "width", "turn", "still", "back", "eyes", "eyeColor", "march" }'),
  baby: def(Baby, 640, 620, 'Swaddled newborn close-up with odd eyes, white streak, frost mark. props: { "eyes": 0..1, "cry": true, "mark": 0..1, "details": 0..1 }', "center"),
  babyhand: def(BabyHand, 900, 420, 'Newborn hand gripping an adult finger. props: { "grip": 0..1, "mark": 0..1 }', "center"),
  antleaf: def(AntLeaf, 900, 520, 'Ant on a leaf with a fungal stalk. props: { "stalk": 0..1 }', "center"),
  gift: def(Gift, 300, 210, 'Counter gift. props: { "kind": "bandage|seeds|drawing" }'),
  wrist: def(Wrist, 1100, 360, 'Forearm with an old bite scar. props: { "scar": 0..1, "sleeve": colour }', "center"),
  mothercells: def(MotherCells, 900, 900, 'Mother-and-baby silhouette, cells drifting across. props: { "flow": 0..1 } color = cells', "center"),
};
