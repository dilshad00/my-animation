import React from "react";
import { random } from "remotion";
import { darken, lighten } from "../../utils/color";
import { smoothPath, type Pt } from "../../utils/svg";
import type { ObjectDef, ObjectProps } from "./types";

const sway = (t: number, seed: string, amp = 1.5) =>
  Math.sin(t * 1.3 + random(seed) * 6) * amp;

export const Tree: React.FC<ObjectProps> = ({ t, color, color2, L, seed }) => {
  const leaf = L(color ?? "#4caf50");
  const trunk = L(color2 ?? "#7a4e2d");
  const s = sway(t, seed);
  const blobs: [number, number, number][] = [
    [-70, -250, 80], [60, -260, 85], [0, -330, 95], [-30, -200, 70], [55, -195, 66], [-95, -300, 60], [90, -320, 58],
  ];
  return (
    <g>
      <path d="M-18,0 L-12,-180 L-40,-240 L-28,-244 L-4,-205 L6,-260 L18,-258 L14,-190 L46,-232 L56,-224 L20,-160 L22,0 Z" fill={trunk} />
      <path d="M4,0 L8,-170 L14,-170 L20,0 Z" fill={darken(trunk, 0.2)} />
      <g transform={`rotate(${s} 0 -150)`}>
        {blobs.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={darken(leaf, 0.18)} />
        ))}
        {blobs.map(([x, y, r], i) => (
          <circle key={"h" + i} cx={x - 8} cy={y - 10} r={r * 0.82} fill={leaf} />
        ))}
        {blobs.slice(0, 4).map(([x, y, r], i) => (
          <circle key={"l" + i} cx={x - 22} cy={y - 26} r={r * 0.35} fill={lighten(leaf, 0.18)} />
        ))}
      </g>
    </g>
  );
};

export const Pine: React.FC<ObjectProps> = ({ t, color, L, seed }) => {
  const c = L(color ?? "#2d6a4f");
  const s = sway(t, seed, 1);
  return (
    <g transform={`rotate(${s} 0 0)`}>
      <rect x={-12} y={-60} width={24} height={60} fill={L("#6b4226")} />
      {[0, 1, 2, 3].map((i) => {
        const y = -60 - i * 70;
        const w = 120 - i * 24;
        return (
          <g key={i}>
            <path d={`M${-w},${y} L0,${y - 140} L${w},${y} Q0,${y + 18} ${-w},${y} Z`} fill={darken(c, 0.15)} />
            <path d={`M${-w * 0.2},${y + 6} L0,${y - 140} L${w},${y} Q${w * 0.4},${y + 14} ${-w * 0.2},${y + 6} Z`} fill={c} />
          </g>
        );
      })}
    </g>
  );
};

export const Palm: React.FC<ObjectProps> = ({ t, color, L, seed }) => {
  const leaf = L(color ?? "#43a047");
  const s = sway(t, seed, 3);
  const top: Pt = [60, -380];
  return (
    <g>
      <path d={`M-14,0 Q10,-200 ${top[0] - 8},${top[1]} L${top[0] + 10},${top[1] + 4} Q30,-200 14,0 Z`} fill={L("#9c6b3c")} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M-6,${-40 - i * 55} Q10,${-50 - i * 55} 22,${-42 - i * 55}`} stroke={L("#7a5230")} strokeWidth={5} fill="none" />
      ))}
      <g transform={`translate(${top[0]} ${top[1]}) rotate(${s})`}>
        {[-150, -110, -60, -20, 25, 70, 200].map((a, i) => (
          <g key={i} transform={`rotate(${a + Math.sin(t * 2 + i) * 3})`}>
            <path d="M0,0 Q90,-40 190,20 Q100,0 0,10 Z" fill={i % 2 ? leaf : darken(leaf, 0.15)} />
          </g>
        ))}
        <circle cx={-6} cy={14} r={14} fill={L("#6d4c2f")} />
        <circle cx={12} cy={16} r={13} fill={L("#5d3f26")} />
      </g>
    </g>
  );
};

export const Bush: React.FC<ObjectProps> = ({ color, L }) => {
  const c = L(color ?? "#52b788");
  return (
    <g>
      <ellipse cx={0} cy={-2} rx={110} ry={14} fill="#000" opacity={0.12} />
      <circle cx={-55} cy={-40} r={45} fill={darken(c, 0.15)} />
      <circle cx={50} cy={-42} r={48} fill={darken(c, 0.15)} />
      <circle cx={0} cy={-62} r={58} fill={c} />
      <circle cx={-48} cy={-46} r={38} fill={c} />
      <circle cx={-14} cy={-82} r={18} fill={lighten(c, 0.2)} />
      <rect x={-95} y={-40} width={190} height={40} rx={20} fill={darken(c, 0.1)} />
    </g>
  );
};

export const Rock: React.FC<ObjectProps> = ({ color, L }) => {
  const c = L(color ?? "#8d99ae");
  return (
    <g>
      <path d="M-90,0 L-70,-60 L-20,-95 L40,-80 L85,-30 L95,0 Z" fill={c} />
      <path d="M-20,-95 L40,-80 L85,-30 L20,-40 Z" fill={lighten(c, 0.15)} />
      <path d="M-90,0 L-70,-60 L-30,-30 L0,0 Z" fill={darken(c, 0.15)} />
    </g>
  );
};

export const Flower: React.FC<ObjectProps> = ({ t, color, L, seed }) => {
  const c = L(color ?? "#ff6b9d");
  const s = sway(t, seed, 4);
  return (
    <g transform={`rotate(${s} 0 0)`}>
      <path d="M0,0 Q-6,-50 0,-90" stroke={L("#2d6a4f")} strokeWidth={5} fill="none" />
      <path d="M0,-40 Q-28,-50 -30,-30 Q-14,-28 0,-40" fill={L("#40916c")} />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx={0} cy={-108} rx={10} ry={18} fill={c} transform={`rotate(${a} 0 -90)`} />
      ))}
      <circle cx={0} cy={-90} r={10} fill={L("#ffd166")} />
    </g>
  );
};

export const Grass: React.FC<ObjectProps> = ({ t, color, L, seed }) => {
  const c = L(color ?? "#74c69d");
  return (
    <g>
      {Array.from({ length: 9 }).map((_, i) => {
        const x = (i - 4) * 9;
        const h = 30 + random(seed + i) * 35;
        const s = Math.sin(t * 2 + i) * 6;
        return <path key={i} d={`M${x - 4},0 Q${x + s / 2},${-h / 2} ${x + s},${-h} Q${x + 2},${-h / 2} ${x + 4},0 Z`} fill={i % 2 ? c : darken(c, 0.15)} />;
      })}
    </g>
  );
};

export const Cactus: React.FC<ObjectProps> = ({ color, L }) => {
  const c = L(color ?? "#2a9d8f");
  return (
    <g fill={c}>
      <rect x={-22} y={-200} width={44} height={200} rx={22} />
      <path d="M-22,-90 L-55,-90 Q-70,-90 -70,-110 L-70,-150 Q-70,-162 -58,-162 Q-46,-162 -46,-150 L-46,-114 L-22,-114 Z" />
      <path d="M22,-120 L52,-120 Q66,-120 66,-140 L66,-170 Q66,-182 55,-182 Q44,-182 44,-170 L44,-142 L22,-142 Z" />
      <rect x={-6} y={-190} width={8} height={180} rx={4} fill={lighten(c, 0.15)} />
    </g>
  );
};

export const Seaweed: React.FC<ObjectProps> = ({ t, color, L, seed }) => {
  const c = L(color ?? "#2a9d8f");
  const ph = random(seed) * 6;
  const pts: Pt[] = [];
  for (let i = 0; i <= 8; i++) {
    pts.push([Math.sin(t * 1.4 + i * 0.7 + ph) * (i * 3.5), -i * 34]);
  }
  return (
    <g>
      <path d={smoothPath(pts, false)} stroke={darken(c, 0.15)} strokeWidth={22} fill="none" strokeLinecap="round" />
      <path d={smoothPath(pts, false)} stroke={c} strokeWidth={12} fill="none" strokeLinecap="round" />
    </g>
  );
};

export const Coral: React.FC<ObjectProps> = ({ color, L }) => {
  const c = L(color ?? "#ff7f6e");
  const br = (x: number, y: number, a: number, len: number, d: number): React.ReactNode[] => {
    if (d === 0) return [];
    const r = (a * Math.PI) / 180;
    const x2 = x + Math.sin(r) * len;
    const y2 = y - Math.cos(r) * len;
    return [
      <line key={`${x}-${y}-${a}-${d}`} x1={x} y1={y} x2={x2} y2={y2} stroke={c} strokeWidth={d * 6} strokeLinecap="round" />,
      ...br(x2, y2, a - 28, len * 0.75, d - 1),
      ...br(x2, y2, a + 26, len * 0.72, d - 1),
    ];
  };
  return (
    <g>
      {br(0, 0, 0, 70, 4)}
      <ellipse cx={0} cy={0} rx={50} ry={10} fill={darken(c, 0.3)} />
    </g>
  );
};

export const NATURE: Record<string, ObjectDef> = {
  tree: { component: Tree, w: 260, h: 430, category: "nature" },
  pine: { component: Pine, w: 240, h: 420, category: "nature" },
  palm: { component: Palm, w: 380, h: 420, category: "nature" },
  bush: { component: Bush, w: 220, h: 120, category: "nature" },
  rock: { component: Rock, w: 190, h: 95, category: "nature" },
  flower: { component: Flower, w: 60, h: 130, category: "nature" },
  grass: { component: Grass, w: 80, h: 60, category: "nature" },
  cactus: { component: Cactus, w: 140, h: 200, category: "nature" },
  seaweed: { component: Seaweed, w: 60, h: 280, category: "nature" },
  coral: { component: Coral, w: 200, h: 200, category: "nature" },
};
