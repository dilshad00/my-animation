import React from "react";
import { random } from "remotion";
import { darken } from "../../utils/color";
import type { ObjectDef, ObjectProps } from "./types";
import { num, str } from "./types";

const windowColor = (lightsOn: boolean, seed: string, i: number, L: (c: string) => string) => {
  if (lightsOn && random(seed + "w" + i) > 0.35) return "#ffd77a";
  return L("#8fc3e8");
};

export const House: React.FC<ObjectProps> = ({ color, color2, L, p, seed }) => {
  const wall = L(color ?? "#f4a261");
  const roof = L(color2 ?? "#9d4b3a");
  return (
    <g>
      <rect x={-170} y={-230} width={340} height={230} fill={wall} />
      <rect x={-170} y={-230} width={60} height={230} fill={darken(wall, 0.08)} />
      <path d="M-200,-225 L0,-380 L200,-225 Z" fill={roof} />
      <path d="M0,-380 L200,-225 L170,-225 L0,-355 Z" fill={darken(roof, 0.2)} />
      <rect x={90} y={-370} width={34} height={70} fill={darken(roof, 0.1)} />
      <rect x={-40} y={-130} width={80} height={130} rx={6} fill={L("#6b3e26")} />
      <circle cx={24} cy={-62} r={5} fill={L("#ffd166")} />
      {[-120, 70].map((x, i) => (
        <g key={x}>
          <rect x={x} y={-190} width={70} height={66} fill={windowColor(p.lightsOn, seed, i, L)} stroke={L("#fff")} strokeWidth={6} />
          <line x1={x + 35} y1={-190} x2={x + 35} y2={-124} stroke={L("#fff")} strokeWidth={4} />
        </g>
      ))}
      <rect x={-200} y={-6} width={400} height={6} fill={darken(wall, 0.3)} />
    </g>
  );
};

/** Props: { "floors": 12 } */
export const Skyscraper: React.FC<ObjectProps> = ({ color, props, L, p, seed }) => {
  const c = L(color ?? "#5c7aa6");
  const floors = num(props.floors, 14);
  const cols = num(props.columns, 5);
  const h = floors * 46 + 30;
  const w = cols * 40 + 30;
  return (
    <g>
      <rect x={-w / 2} y={-h} width={w} height={h} fill={c} />
      <rect x={w / 2 - w * 0.28} y={-h} width={w * 0.28} height={h} fill={darken(c, 0.18)} />
      <rect x={-w / 2 - 6} y={-h - 12} width={w + 12} height={14} fill={darken(c, 0.25)} />
      <line x1={0} y1={-h - 12} x2={0} y2={-h - 90} stroke={darken(c, 0.3)} strokeWidth={5} />
      <circle cx={0} cy={-h - 90} r={6} fill="#ff4d4d" />
      {Array.from({ length: floors }).map((_, r) =>
        Array.from({ length: cols }).map((__, k) => (
          <rect
            key={`${r}-${k}`}
            x={-w / 2 + 18 + k * 40}
            y={-h + 26 + r * 46}
            width={24}
            height={28}
            fill={windowColor(p.lightsOn, seed, r * 10 + k, L)}
            opacity={0.95}
          />
        )),
      )}
    </g>
  );
};

/** Props: { "text": "CAFÉ" } */
export const Shop: React.FC<ObjectProps> = ({ color, color2, props, L, p }) => {
  const wall = L(color ?? "#e9c46a");
  const awning = L(color2 ?? "#e63946");
  return (
    <g>
      <rect x={-200} y={-300} width={400} height={300} fill={wall} />
      <rect x={-200} y={-300} width={400} height={20} fill={darken(wall, 0.2)} />
      <rect x={-150} y={-270} width={300} height={56} rx={8} fill={L("#264653")} />
      <text x={0} y={-230} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={36} fill={L("#ffd166")}>
        {str(props.text, "SHOP")}
      </text>
      {Array.from({ length: 8 }).map((_, i) => (
        <path key={i} d={`M${-210 + i * 52.5},-205 L${-157.5 + i * 52.5},-205 L${-157.5 + i * 52.5},-170 Q${-183.75 + i * 52.5},-150 ${-210 + i * 52.5},-170 Z`} fill={i % 2 ? awning : L("#fff")} />
      ))}
      <rect x={-170} y={-150} width={200} height={130} fill={p.lightsOn ? "#ffe3a3" : L("#9fd8ff")} />
      <rect x={60} y={-150} width={90} height={150} fill={L("#6b3e26")} />
    </g>
  );
};

export const Factory: React.FC<ObjectProps> = ({ t, color, L, p, seed }) => {
  const c = L(color ?? "#adb5bd");
  return (
    <g>
      {[0, 1].map((i) => {
        const x = 80 + i * 80;
        return (
          <g key={i}>
            <rect x={x} y={-420} width={44} height={420} fill={darken(c, 0.2)} />
            <rect x={x - 4} y={-430} width={52} height={16} fill={darken(c, 0.35)} />
            {Array.from({ length: 6 }).map((_, k) => {
              const ph = ((t * 0.35 + k / 6 + i * 0.37) % 1);
              return (
                <circle
                  key={k}
                  cx={x + 22 + ph * 120 + Math.sin(ph * 6 + k) * 10}
                  cy={-440 - ph * 260}
                  r={20 + ph * 50}
                  fill={L("#d0d4da")}
                  opacity={0.65 * (1 - ph)}
                />
              );
            })}
          </g>
        );
      })}
      <path d="M-260,0 L-260,-200 L-180,-260 L-180,-200 L-100,-260 L-100,-200 L-20,-260 L-20,-200 L60,-260 L60,-200 L260,-200 L260,0 Z" fill={c} />
      {Array.from({ length: 6 }).map((_, i) => (
        <rect key={i} x={-230 + i * 80} y={-150} width={50} height={60} fill={windowColor(p.lightsOn, seed, i, L)} />
      ))}
      <rect x={140} y={-110} width={90} height={110} fill={darken(c, 0.3)} />
    </g>
  );
};

export const WindTurbine: React.FC<ObjectProps> = ({ t, speed, L, seed }) => {
  const rot = t * 70 * speed + random(seed) * 120;
  return (
    <g>
      <path d="M-14,0 L-6,-420 L6,-420 L14,0 Z" fill={L("#eef1f5")} />
      <path d="M2,0 L6,-420 L14,0 Z" fill={L("#cfd5dd")} />
      <g transform={`translate(0 -425) rotate(${rot})`}>
        {[0, 120, 240].map((a) => (
          <path key={a} d="M-8,0 Q-12,-120 0,-230 Q12,-120 8,0 Z" fill={L("#f8f9fb")} stroke={L("#c9ced6")} strokeWidth={2} transform={`rotate(${a})`} />
        ))}
        <circle r={16} fill={L("#dfe4ea")} />
      </g>
    </g>
  );
};

export const StreetLamp: React.FC<ObjectProps> = ({ L, p }) => (
  <g>
    {p.lightsOn ? <ellipse cx={60} cy={0} rx={160} ry={30} fill="#ffd77a" opacity={0.22} /> : null}
    {p.lightsOn ? <polygon points="60,-318 -40,0 160,0" fill="#ffe7a8" opacity={0.12} /> : null}
    <rect x={-8} y={-340} width={16} height={340} fill={L("#3d405b")} />
    <path d="M0,-336 Q0,-370 50,-360 L70,-350" stroke={L("#3d405b")} strokeWidth={12} fill="none" />
    <path d="M40,-352 L80,-352 L72,-320 L48,-320 Z" fill={L("#3d405b")} />
    <ellipse cx={60} cy={-318} rx={14} ry={7} fill={p.lightsOn ? "#fff1c1" : L("#e9ecef")} />
    {p.lightsOn ? <circle cx={60} cy={-318} r={50} fill="#ffe7a8" opacity={0.3} /> : null}
    <rect x={-20} y={-14} width={40} height={14} rx={4} fill={L("#2b2d42")} />
  </g>
);

/** Props: { "state": "red" | "yellow" | "green" | "cycle" } */
export const TrafficLight: React.FC<ObjectProps> = ({ t, props, L }) => {
  const st = str(props.state, "cycle");
  const cur = st === "cycle" ? ["green", "yellow", "red"][Math.floor(t / 2) % 3] : st;
  const lamp = (c: string, y: number, on: boolean) => (
    <g>
      {on ? <circle cx={0} cy={y} r={34} fill={c} opacity={0.3} /> : null}
      <circle cx={0} cy={y} r={20} fill={on ? c : darken(c, 0.65)} />
    </g>
  );
  return (
    <g>
      <rect x={-7} y={-260} width={14} height={260} fill={L("#3d405b")} />
      <rect x={-34} y={-400} width={68} height={160} rx={14} fill={L("#2b2d42")} />
      {lamp("#ff4d4d", -370, cur === "red")}
      {lamp("#ffd166", -320, cur === "yellow")}
      {lamp("#06d6a0", -270, cur === "green")}
    </g>
  );
};

export const Bench: React.FC<ObjectProps> = ({ color, L }) => {
  const c = L(color ?? "#9c6644");
  return (
    <g>
      <rect x={-130} y={-96} width={260} height={16} rx={4} fill={c} />
      <rect x={-130} y={-150} width={260} height={14} rx={4} fill={c} />
      <rect x={-130} y={-126} width={260} height={14} rx={4} fill={darken(c, 0.1)} />
      {[-110, 100].map((x) => (
        <path key={x} d={`M${x},0 L${x},-160 M${x + 10},0 L${x + 10},-90`} stroke={L("#2b2d42")} strokeWidth={8} />
      ))}
    </g>
  );
};

export const Fence: React.FC<ObjectProps> = ({ color, props, L }) => {
  const c = L(color ?? "#f8f9fa");
  const n = num(props.posts, 10);
  return (
    <g>
      <rect x={-n * 20} y={-80} width={n * 40} height={12} fill={darken(c, 0.1)} />
      <rect x={-n * 20} y={-40} width={n * 40} height={12} fill={darken(c, 0.1)} />
      {Array.from({ length: n }).map((_, i) => (
        <path key={i} d={`M${-n * 20 + i * 40 + 6},0 L${-n * 20 + i * 40 + 6},-100 L${-n * 20 + i * 40 + 20},-116 L${-n * 20 + i * 40 + 34},-100 L${-n * 20 + i * 40 + 34},0 Z`} fill={c} />
      ))}
    </g>
  );
};

export const Pyramid: React.FC<ObjectProps> = ({ color, L }) => {
  const c = L(color ?? "#e9c46a");
  return (
    <g>
      <path d="M-400,0 L0,-380 L400,0 Z" fill={c} />
      <path d="M0,-380 L400,0 L120,0 Z" fill={darken(c, 0.22)} />
      {Array.from({ length: 9 }).map((_, i) => {
        const y = -i * 42;
        const w = 400 - (i * 42 * 400) / 380;
        return <line key={i} x1={-w} y1={y} x2={w * 0.3} y2={y} stroke={darken(c, 0.12)} strokeWidth={2} />;
      })}
    </g>
  );
};

export const Castle: React.FC<ObjectProps> = ({ color, t, L, p, seed }) => {
  const c = L(color ?? "#b8b8c8");
  const d = darken(c, 0.15);
  const crenel = (x: number, y: number, w: number) =>
    Array.from({ length: Math.floor(w / 30) }).map((_, i) => (
      <rect key={i} x={x + i * 30} y={y - 22} width={18} height={24} fill={c} />
    ));
  const flag = (x: number, y: number) => (
    <g>
      <line x1={x} y1={y} x2={x} y2={y - 80} stroke={L("#333")} strokeWidth={4} />
      <path d={`M${x},${y - 80} Q${x + 30},${y - 90 + Math.sin(t * 4) * 6} ${x + 60},${y - 75} Q${x + 30},${y - 60 + Math.sin(t * 4 + 1) * 6} ${x},${y - 50} Z`} fill={L("#e63946")} />
    </g>
  );
  return (
    <g>
      <rect x={-260} y={-260} width={520} height={260} fill={c} />
      {crenel(-260, -260, 520)}
      {[-320, 220].map((x) => (
        <g key={x}>
          <rect x={x} y={-420} width={100} height={420} fill={d} />
          {crenel(x, -420, 110)}
          {flag(x + 50, -440)}
          <rect x={x + 38} y={-360} width={24} height={44} rx={12} fill={windowColor(p.lightsOn, seed, x, L)} />
        </g>
      ))}
      <path d="M-70,0 L-70,-130 Q0,-200 70,-130 L70,0 Z" fill={L("#4a3426")} />
      {[-40, -10, 20, 50].map((x) => (
        <line key={x} x1={x} y1={-150} x2={x} y2={0} stroke={L("#2b1d14")} strokeWidth={5} />
      ))}
    </g>
  );
};

export const Temple: React.FC<ObjectProps> = ({ color, L }) => {
  const c = L(color ?? "#f1ead8");
  return (
    <g>
      <rect x={-330} y={-30} width={660} height={30} fill={darken(c, 0.12)} />
      <rect x={-300} y={-55} width={600} height={28} fill={darken(c, 0.06)} />
      {Array.from({ length: 7 }).map((_, i) => (
        <g key={i}>
          <rect x={-270 + i * 88} y={-330} width={36} height={275} fill={c} />
          <rect x={-270 + i * 88 + 24} y={-330} width={12} height={275} fill={darken(c, 0.12)} />
          <rect x={-278 + i * 88} y={-345} width={52} height={16} fill={darken(c, 0.05)} />
        </g>
      ))}
      <rect x={-310} y={-380} width={620} height={36} fill={darken(c, 0.04)} />
      <path d="M-330,-380 L0,-480 L330,-380 Z" fill={c} />
      <path d="M-250,-392 L0,-462 L250,-392 Z" fill={darken(c, 0.1)} />
    </g>
  );
};

export const Hut: React.FC<ObjectProps> = ({ color, L, p }) => {
  const c = L(color ?? "#c8a27a");
  return (
    <g>
      <rect x={-140} y={-170} width={280} height={170} fill={c} />
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={i} x1={-140 + i * 35} y1={-170} x2={-140 + i * 35} y2={0} stroke={darken(c, 0.12)} strokeWidth={3} />
      ))}
      <path d="M-190,-160 L0,-320 L190,-160 Z" fill={L("#a47148")} />
      <path d="M-190,-160 L0,-320 L190,-160" stroke={L("#7f5539")} strokeWidth={10} fill="none" />
      <rect x={-35} y={-110} width={70} height={110} fill={L("#4a3426")} />
      <rect x={60} y={-130} width={50} height={44} fill={p.lightsOn ? "#ffcf6b" : L("#4a3426")} />
    </g>
  );
};

export const BUILDINGS: Record<string, ObjectDef> = {
  house: { component: House, w: 400, h: 380, category: "buildings" },
  skyscraper: { component: Skyscraper, w: 230, h: 680, category: "buildings", description: 'props: { "floors": 14, "columns": 5 }' },
  shop: { component: Shop, w: 400, h: 300, category: "buildings", description: 'props: { "text": "CAFÉ" }' },
  factory: { component: Factory, w: 520, h: 700, category: "buildings" },
  windturbine: { component: WindTurbine, w: 460, h: 660, category: "buildings" },
  streetlamp: { component: StreetLamp, w: 140, h: 370, category: "street" },
  trafficlight: { component: TrafficLight, w: 70, h: 400, category: "street", description: 'props: { "state": "red|yellow|green|cycle" }' },
  bench: { component: Bench, w: 260, h: 160, category: "street" },
  fence: { component: Fence, w: 400, h: 116, category: "street", description: 'props: { "posts": 10 }' },
  pyramid: { component: Pyramid, w: 800, h: 380, category: "historical" },
  castle: { component: Castle, w: 640, h: 520, category: "historical" },
  temple: { component: Temple, w: 660, h: 480, category: "historical" },
  hut: { component: Hut, w: 380, h: 320, category: "historical" },
};
