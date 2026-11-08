import React from "react";
import { random } from "remotion";
import { darken, lighten } from "../../utils/color";
import type { ObjectDef, ObjectProps } from "./types";
import { str } from "./types";

/** Desk top at y = -150. Place a laptop at the same x, y-150. */
export const Desk: React.FC<ObjectProps> = ({ color, L }) => {
  const c = L(color ?? "#b07d56");
  return (
    <g>
      <ellipse cx={0} cy={0} rx={240} ry={14} fill="#000" opacity={0.15} />
      <rect x={-230} y={-150} width={460} height={22} rx={6} fill={c} />
      <rect x={-230} y={-130} width={460} height={6} fill={darken(c, 0.25)} />
      <rect x={-215} y={-128} width={18} height={128} fill={darken(c, 0.2)} />
      <rect x={197} y={-128} width={18} height={128} fill={darken(c, 0.2)} />
      <rect x={90} y={-128} width={105} height={90} rx={4} fill={darken(c, 0.08)} />
      <rect x={128} y={-92} width={30} height={6} rx={3} fill={darken(c, 0.35)} />
    </g>
  );
};

/** Seat height ≈ 92 – matches a seated average adult (use same x as the character). */
export const Chair: React.FC<ObjectProps> = ({ color, L }) => {
  const c = L(color ?? "#3d405b");
  return (
    <g>
      <rect x={-60} y={-100} width={120} height={20} rx={8} fill={c} />
      <rect x={-72} y={-240} width={24} height={150} rx={10} fill={darken(c, 0.1)} />
      <rect x={-6} y={-82} width={12} height={60} fill={L("#8d99ae")} />
      <path d="M-50,-6 L0,-24 L50,-6" stroke={L("#8d99ae")} strokeWidth={8} fill="none" strokeLinecap="round" />
      <circle cx={-50} cy={-4} r={6} fill={L("#2b2d42")} />
      <circle cx={50} cy={-4} r={6} fill={L("#2b2d42")} />
    </g>
  );
};

export const Sofa: React.FC<ObjectProps> = ({ color, L }) => {
  const c = L(color ?? "#2a9d8f");
  return (
    <g>
      <ellipse cx={0} cy={0} rx={280} ry={16} fill="#000" opacity={0.15} />
      <rect x={-250} y={-250} width={500} height={150} rx={40} fill={darken(c, 0.12)} />
      <rect x={-240} y={-130} width={480} height={100} rx={22} fill={c} />
      <rect x={-235} y={-150} width={230} height={50} rx={20} fill={lighten(c, 0.08)} />
      <rect x={5} y={-150} width={230} height={50} rx={20} fill={lighten(c, 0.08)} />
      <rect x={-290} y={-190} width={70} height={170} rx={30} fill={darken(c, 0.05)} />
      <rect x={220} y={-190} width={70} height={170} rx={30} fill={darken(c, 0.05)} />
      <rect x={-250} y={-30} width={14} height={30} fill={L("#5c4033")} />
      <rect x={236} y={-30} width={14} height={30} fill={L("#5c4033")} />
      <rect x={-200} y={-215} width={80} height={70} rx={16} fill={L("#ffd166")} transform="rotate(-8 -160 -180)" />
    </g>
  );
};

export const Table: React.FC<ObjectProps> = ({ color, L }) => {
  const c = L(color ?? "#8d6346");
  return (
    <g>
      <ellipse cx={0} cy={-120} rx={150} ry={26} fill={c} />
      <ellipse cx={0} cy={-114} rx={150} ry={26} fill={darken(c, 0.25)} />
      <ellipse cx={0} cy={-122} rx={150} ry={26} fill={c} />
      <rect x={-10} y={-110} width={20} height={106} fill={darken(c, 0.25)} />
      <ellipse cx={0} cy={-4} rx={60} ry={10} fill={darken(c, 0.3)} />
    </g>
  );
};

export const FloorLamp: React.FC<ObjectProps> = ({ color, props, L }) => {
  const on = props.on !== false;
  const c = L(color ?? "#f4a261");
  return (
    <g>
      {on ? <circle cx={0} cy={-350} r={110} fill="#ffd77a" opacity={0.22} /> : null}
      <rect x={-4} y={-320} width={8} height={310} fill={L("#3d405b")} />
      <ellipse cx={0} cy={-6} rx={50} ry={10} fill={L("#3d405b")} />
      <path d="M-70,-300 L-40,-400 L40,-400 L70,-300 Z" fill={on ? lighten(c, 0.3) : c} />
      {on ? <path d="M-70,-300 L70,-300 L130,0 L-130,0 Z" fill="#ffe7a8" opacity={0.1} /> : null}
    </g>
  );
};

export const Bookshelf: React.FC<ObjectProps> = ({ color, L, seed }) => {
  const c = L(color ?? "#9c6644");
  const cols = ["#e63946", "#457b9d", "#2a9d8f", "#e9c46a", "#f4a261", "#6d597a", "#1d3557"];
  return (
    <g>
      <rect x={-140} y={-400} width={280} height={400} fill={darken(c, 0.2)} />
      {[0, 1, 2, 3].map((r) => (
        <g key={r}>
          <rect x={-140} y={-400 + r * 98 + 86} width={280} height={12} fill={c} />
          {(() => {
            let x = -128;
            const books: React.ReactNode[] = [];
            let i = 0;
            while (x < 110 && i < 14) {
              const w = 16 + random(seed + r + "w" + i) * 14;
              const h = 56 + random(seed + r + "h" + i) * 26;
              const lean = random(seed + r + "l" + i) > 0.88;
              books.push(
                <rect key={i} x={x} y={-400 + r * 98 + 86 - h} width={w} height={h} rx={2} fill={L(cols[(i + r * 3) % cols.length])} transform={lean ? `rotate(12 ${x + w} ${-400 + r * 98 + 86})` : undefined} />,
              );
              x += w + 3;
              i++;
            }
            return books;
          })()}
        </g>
      ))}
      <rect x={-150} y={-410} width={300} height={14} fill={c} />
    </g>
  );
};

export const Plant: React.FC<ObjectProps> = ({ t, color, L, seed }) => {
  const pot = L(color ?? "#e76f51");
  const leaf = L("#2d6a4f");
  return (
    <g>
      {Array.from({ length: 7 }).map((_, i) => {
        const a = -70 + i * 23 + Math.sin(t * 1.2 + i) * 3;
        const len = 120 + random(seed + i) * 60;
        return (
          <g key={i} transform={`translate(0 -90) rotate(${a})`}>
            <path d={`M0,0 Q${-25},${-len / 2} 0,${-len} Q25,${-len / 2} 0,0 Z`} fill={i % 2 ? leaf : lighten(leaf, 0.15)} />
          </g>
        );
      })}
      <path d="M-55,-100 L55,-100 L40,0 L-40,0 Z" fill={pot} />
      <rect x={-62} y={-112} width={124} height={22} rx={6} fill={darken(pot, 0.12)} />
    </g>
  );
};

/** Wall clock (centre-anchored). Props: { "fast": true } spins the hands. */
export const Clock: React.FC<ObjectProps> = ({ t, props, L }) => {
  const k = props.fast === true ? 30 : 1;
  const m = (t * 6 * k) % 360;
  const h = (t * 0.5 * k) % 360;
  return (
    <g>
      <circle r={90} fill={L("#fefae0")} stroke={L("#3d405b")} strokeWidth={12} />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={-3} y={-76} width={6} height={i % 3 ? 10 : 18} fill={L("#3d405b")} transform={`rotate(${i * 30})`} />
      ))}
      <rect x={-5} y={-48} width={10} height={52} rx={5} fill={L("#3d405b")} transform={`rotate(${h + 60})`} />
      <rect x={-3} y={-68} width={6} height={72} rx={3} fill={L("#3d405b")} transform={`rotate(${m})`} />
      <rect x={-1.5} y={-72} width={3} height={80} fill="#e63946" transform={`rotate(${t * 360 * k / 60})`} />
      <circle r={8} fill="#e63946" />
    </g>
  );
};

/** Props: { "text": "E = mc²" } – board bottom at the origin */
export const Whiteboard: React.FC<ObjectProps> = ({ props, L }) => (
  <g>
    <path d="M-200,0 L-170,-120 M200,0 L170,-120" stroke={L("#8d99ae")} strokeWidth={10} />
    <rect x={-260} y={-460} width={520} height={340} rx={10} fill={L("#fdfdfd")} stroke={L("#adb5bd")} strokeWidth={12} />
    <text x={0} y={-270} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={56} fill={L("#1d3557")}>
      {str(props.text, "")}
    </text>
    <rect x={-120} y={-126} width={240} height={10} rx={5} fill={L("#adb5bd")} />
  </g>
);

/** Lab flask with bubbling liquid */
export const Flask: React.FC<ObjectProps> = ({ t, color, L, seed }) => {
  const liquid = L(color ?? "#06d6a0");
  return (
    <g>
      <path d="M-22,-200 L-22,-120 L-90,-10 Q-96,0 -84,0 L84,0 Q96,0 90,-10 L22,-120 L22,-200 Z" fill="#e8f6ff" fillOpacity={0.35} stroke={L("#bcd")} strokeWidth={5} />
      <path d="M-58,-60 L58,-60 L88,-10 Q92,-3 84,-3 L-84,-3 Q-92,-3 -88,-10 Z" fill={liquid} opacity={0.85} />
      {Array.from({ length: 6 }).map((_, i) => {
        const ph = (t * 0.8 + random(seed + i)) % 1;
        return <circle key={i} cx={-40 + random(seed + "x" + i) * 80} cy={-10 - ph * 180} r={4 + random(seed + "r" + i) * 6} fill="#fff" opacity={0.7 * (1 - ph)} />;
      })}
      <rect x={-28} y={-212} width={56} height={14} rx={4} fill={L("#bcd")} />
    </g>
  );
};

export const Microscope: React.FC<ObjectProps> = ({ L }) => (
  <g>
    <rect x={-90} y={-24} width={180} height={24} rx={8} fill={L("#2b2d42")} />
    <path d="M40,-24 Q70,-140 10,-220" stroke={L("#3d405b")} strokeWidth={30} fill="none" strokeLinecap="round" />
    <rect x={-60} y={-110} width={100} height={14} rx={4} fill={L("#5c677d")} />
    <g transform="rotate(-25 -10 -230)">
      <rect x={-30} y={-300} width={40} height={130} rx={8} fill={L("#f1faee")} />
      <rect x={-34} y={-310} width={48} height={20} rx={6} fill={L("#3d405b")} />
      <rect x={-22} y={-172} width={24} height={40} fill={L("#8d99ae")} />
    </g>
    <circle cx={50} cy={-130} r={16} fill={L("#5c677d")} />
  </g>
);

export const FURNITURE: Record<string, ObjectDef> = {
  desk: { component: Desk, w: 460, h: 150, category: "furniture" },
  chair: { component: Chair, w: 140, h: 240, category: "furniture" },
  sofa: { component: Sofa, w: 580, h: 250, category: "furniture" },
  table: { component: Table, w: 300, h: 150, category: "furniture" },
  floorlamp: { component: FloorLamp, w: 140, h: 400, category: "furniture" },
  bookshelf: { component: Bookshelf, w: 300, h: 410, category: "furniture" },
  plant: { component: Plant, w: 200, h: 280, category: "furniture" },
  clock: { component: Clock, w: 200, h: 200, category: "furniture", anchor: "center", description: 'props: { "fast": true }' },
  whiteboard: { component: Whiteboard, w: 540, h: 460, category: "furniture", description: 'props: { "text": "…" }' },
  flask: { component: Flask, w: 190, h: 210, category: "science" },
  microscope: { component: Microscope, w: 200, h: 320, category: "science" },
};
