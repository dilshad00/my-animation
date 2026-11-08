import React from "react";
import { darken, lighten } from "../../utils/color";
import { Cloud as CloudShape } from "../environments/common";
import type { ObjectDef, ObjectProps } from "./types";
import { num, str } from "./types";

const wrap = (text: string, max: number) => {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max) {
      if (cur) lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
};

/**
 * Speech bubble – origin is the TIP of the tail (place it near a mouth).
 * Props: { "text": "Hi!", "side": "left|right", "width": 360 }
 */
export const Speech: React.FC<ObjectProps> = ({ color, props, L }) => {
  const text = str(props.text, "…");
  const w = num(props.width, 380);
  const lines = wrap(text, Math.floor(w / 19));
  const h = 40 + lines.length * 44;
  const left = str(props.side, "right") === "left";
  const bx = left ? -w + 40 : -40;
  const by = -h - 50;
  const c = color ?? "#ffffff";
  return (
    <g>
      <g fill={c} stroke={darken(c, 0.25)} strokeWidth={4}>
        <rect x={bx} y={by} width={w} height={h} rx={34} />
        <path d={left ? `M-10,${by + h - 2} L0,0 L-60,${by + h - 2}` : `M10,${by + h - 2} L0,0 L60,${by + h - 2}`} />
      </g>
      <rect x={bx + 4} y={by + h - 8} width={w - 8} height={10} fill={c} />
      {lines.map((ln, i) => (
        <text key={i} x={bx + w / 2} y={by + 58 + i * 44} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={34} fill={L("#1d2433")}>
          {ln}
        </text>
      ))}
    </g>
  );
};

/** Thought bubble – origin near the head. Props: { "text": "…", "icon": "idea" } */
export const Thought: React.FC<ObjectProps> = ({ t, props }) => {
  const text = str(props.text, "");
  const lines = wrap(text, 16);
  const w = 340;
  const h = Math.max(150, 60 + lines.length * 44);
  const cy = -h / 2 - 120;
  return (
    <g>
      <circle cx={10} cy={-20} r={10} fill="#fff" />
      <circle cx={30} cy={-60} r={18} fill="#fff" />
      <g transform={`translate(70 ${cy}) scale(${1 + Math.sin(t * 2) * 0.015})`}>
        {Array.from({ length: 10 }).map((_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <circle key={i} cx={Math.cos(a) * (w / 2 - 30)} cy={Math.sin(a) * (h / 2 - 25)} r={52} fill="#fff" />;
        })}
        <ellipse rx={w / 2 - 20} ry={h / 2 - 10} fill="#fff" />
        {lines.map((ln, i) => (
          <text key={i} x={0} y={(i - (lines.length - 1) / 2) * 44 + 12} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={32} fill="#1d2433">
            {ln}
          </text>
        ))}
      </g>
    </g>
  );
};

const ICON_PATHS: Record<string, (c: string) => React.ReactNode> = {
  virus: (c) => (
    <g>
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <g key={i} transform={`rotate(${(a * 180) / Math.PI})`}>
            <rect x={-5} y={-86} width={10} height={30} fill={darken(c, 0.2)} />
            <circle cx={0} cy={-88} r={13} fill={darken(c, 0.2)} />
          </g>
        );
      })}
      <circle r={60} fill={c} />
      <circle cx={-20} cy={-14} r={12} fill={darken(c, 0.25)} />
      <circle cx={22} cy={8} r={9} fill={darken(c, 0.25)} />
      <circle cx={-6} cy={28} r={7} fill={darken(c, 0.25)} />
    </g>
  ),
  skull: (c) => (
    <g>
      <path d="M0,-80 C50,-80 78,-48 78,-8 C78,20 62,34 50,40 L50,66 Q50,78 38,78 L-38,78 Q-50,78 -50,66 L-50,40 C-62,34 -78,20 -78,-8 C-78,-48 -50,-80 0,-80 Z" fill={c} />
      <ellipse cx={-30} cy={-6} rx={20} ry={22} fill="#1d1d1d" />
      <ellipse cx={30} cy={-6} rx={20} ry={22} fill="#1d1d1d" />
      <path d="M0,22 L-10,40 L10,40 Z" fill="#1d1d1d" />
      <path d="M-24,58 L-24,78 M-8,58 L-8,78 M8,58 L8,78 M24,58 L24,78" stroke="#1d1d1d" strokeWidth={5} />
    </g>
  ),
  shield: (c) => (
    <g>
      <path d="M0,-86 L72,-60 L72,0 C72,46 40,74 0,88 C-40,74 -72,46 -72,0 L-72,-60 Z" fill={c} stroke={darken(c, 0.25)} strokeWidth={8} strokeLinejoin="round" />
      <path d="M-30,0 L-6,24 L34,-24" stroke="#fff" strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  drop: (c) => (
    <g>
      <path d="M0,-86 C20,-52 60,-14 60,24 C60,60 33,84 0,84 C-33,84 -60,60 -60,24 C-60,-14 -20,-52 0,-86 Z" fill={c} />
      <path d="M-28,16 C-28,-4 -18,-24 -8,-36" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.6} />
    </g>
  ),
  nose: (c) => (
    <g>
      <circle r={80} fill={c} />
      <path d="M-4,-50 C-8,-10 -30,10 -30,26 C-30,42 -14,44 -4,36 C4,44 20,44 26,30" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M36,-20 q16,-8 26,4 M40,0 q18,-4 26,10" stroke="#fff" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.8} />
    </g>
  ),
  molecule: (c) => (
    <g>
      <path d="M0,0 L-55,-40 M0,0 L60,-30 M0,0 L10,62" stroke={darken(c, 0.3)} strokeWidth={12} strokeLinecap="round" />
      <circle r={36} fill={c} />
      <circle cx={-55} cy={-40} r={24} fill="#ffffff" stroke={darken(c, 0.3)} strokeWidth={5} />
      <circle cx={60} cy={-30} r={24} fill="#ffffff" stroke={darken(c, 0.3)} strokeWidth={5} />
      <circle cx={10} cy={62} r={24} fill={lighten(c, 0.3)} stroke={darken(c, 0.3)} strokeWidth={5} />
    </g>
  ),
  check: (c) => (
    <g>
      <circle r={80} fill={c} />
      <path d="M-38,2 L-10,30 L42,-28" stroke="#fff" strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  cross: (c) => (
    <g>
      <circle r={80} fill={c} />
      <path d="M-30,-30 L30,30 M30,-30 L-30,30" stroke="#fff" strokeWidth={18} strokeLinecap="round" />
    </g>
  ),
  star: (c) => (
    <path
      d={Array.from({ length: 10 })
        .map((_, i) => {
          const r = i % 2 ? 36 : 84;
          const a = (i * Math.PI) / 5 - Math.PI / 2;
          return `${i ? "L" : "M"}${Math.cos(a) * r},${Math.sin(a) * r}`;
        })
        .join(" ") + "Z"}
      fill={c}
      stroke={darken(c, 0.2)}
      strokeWidth={6}
      strokeLinejoin="round"
    />
  ),
  heart: (c) => <path d="M0,70 C-90,10 -90,-60 -40,-70 C-15,-75 0,-50 0,-40 C0,-50 15,-75 40,-70 C90,-60 90,10 0,70 Z" fill={c} />,
  warning: (c) => (
    <g>
      <path d="M0,-80 L85,70 L-85,70 Z" fill={c} stroke={darken(c, 0.2)} strokeWidth={10} strokeLinejoin="round" />
      <rect x={-8} y={-30} width={16} height={60} rx={8} fill="#1d1d1d" />
      <circle cx={0} cy={48} r={10} fill="#1d1d1d" />
    </g>
  ),
  bolt: (c) => <path d="M20,-90 L-50,10 L-5,10 L-25,90 L50,-15 L5,-15 Z" fill={c} stroke={darken(c, 0.2)} strokeWidth={6} strokeLinejoin="round" />,
  question: (c) => (
    <g>
      <circle r={80} fill={c} />
      <text y={36} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={110} fill="#fff">?</text>
    </g>
  ),
  exclaim: (c) => (
    <g>
      <circle r={80} fill={c} />
      <text y={38} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={110} fill="#fff">!</text>
    </g>
  ),
  plus: (c) => (
    <g>
      <circle r={80} fill={c} />
      <path d="M0,-40 L0,40 M-40,0 L40,0" stroke="#fff" strokeWidth={18} strokeLinecap="round" />
    </g>
  ),
  clock: (c) => (
    <g>
      <circle r={80} fill={c} />
      <circle r={62} fill="#fff" />
      <path d="M0,-40 L0,0 L30,18" stroke={c} strokeWidth={12} fill="none" strokeLinecap="round" />
    </g>
  ),
  pin: (c) => (
    <g>
      <path d="M0,90 C-20,40 -70,10 -70,-30 A70,70 0 1,1 70,-30 C70,10 20,40 0,90 Z" fill={c} />
      <circle cx={0} cy={-30} r={26} fill="#fff" />
    </g>
  ),
  dollar: (c) => (
    <g>
      <circle r={80} fill={c} />
      <text y={38} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={110} fill="#fff">$</text>
    </g>
  ),
};

/**
 * Centre-anchored icon badge.
 * Props: { "name": "check|cross|star|heart|warning|bolt|question|exclaim|plus|clock|pin|dollar" }
 */
export const Icon: React.FC<ObjectProps> = ({ color, props, t }) => {
  const name = str(props.name, "star");
  const defaults: Record<string, string> = {
    check: "#06d6a0", cross: "#ef476f", star: "#ffd166", heart: "#ef476f", warning: "#ffd166",
    bolt: "#ffd166", question: "#3a86ff", exclaim: "#f77f00", plus: "#3a86ff", clock: "#8338ec", pin: "#ef476f", dollar: "#2a9d8f",
    virus: "#7cb518", skull: "#f1ede4", shield: "#2a9d8f", drop: "#c1121f", nose: "#e76f51", molecule: "#3a86ff",
  };
  const c = color ?? defaults[name] ?? "#3a86ff";
  const draw = ICON_PATHS[name] ?? ICON_PATHS.star;
  return (
    <g transform={`scale(${1 + Math.sin(t * 3) * 0.03})`}>
      <ellipse cx={0} cy={96} rx={60} ry={10} fill="#000" opacity={0.12} />
      {draw(c)}
    </g>
  );
};

/** Centre-anchored spinning coin. Props: { "symbol": "$" } */
export const Coin: React.FC<ObjectProps> = ({ t, speed, props, color }) => {
  const c = color ?? "#ffc300";
  const sx = Math.cos(t * 4 * speed);
  return (
    <g transform={`scale(${Math.max(0.08, Math.abs(sx))} 1)`}>
      <circle r={70} fill={darken(c, 0.15)} />
      <circle r={60} fill={c} />
      <circle r={48} fill="none" stroke={lighten(c, 0.4)} strokeWidth={4} />
      {sx > 0 ? (
        <text y={28} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={76} fill={darken(c, 0.35)}>
          {str(props.symbol, "$")}
        </text>
      ) : null}
    </g>
  );
};

export const Crate: React.FC<ObjectProps> = ({ color, L }) => {
  const c = L(color ?? "#c08552");
  return (
    <g>
      <rect x={-80} y={-160} width={160} height={160} fill={c} stroke={darken(c, 0.3)} strokeWidth={8} />
      <path d="M-76,-156 L76,-4 M76,-156 L-76,-4" stroke={darken(c, 0.25)} strokeWidth={12} />
      <rect x={-80} y={-160} width={160} height={20} fill={darken(c, 0.12)} />
    </g>
  );
};

/** Waving flag on a pole. Props: { "colors": ["#e63946", "#fff"] } */
export const Flag: React.FC<ObjectProps> = ({ t, color, color2, L }) => {
  const a = L(color ?? "#e63946");
  const b = L(color2 ?? "#ffffff");
  const wave = (x: number) => Math.sin(t * 5 - x / 40) * (x / 20);
  const top = (dy: number) =>
    Array.from({ length: 11 })
      .map((_, i) => {
        const x = i * 18;
        return `${i ? "L" : "M"}${x},${-400 + dy + wave(x)}`;
      })
      .join(" ");
  const bottomBack = (dy: number) =>
    Array.from({ length: 11 })
      .map((_, i) => {
        const x = 180 - i * 18;
        return `L${x},${-400 + dy + wave(x)}`;
      })
      .join(" ");
  return (
    <g>
      <rect x={-6} y={-410} width={12} height={410} fill={L("#8d99ae")} />
      <circle cx={0} cy={-414} r={10} fill={L("#ffd166")} />
      <path d={`${top(0)} ${bottomBack(55)} Z`} fill={a} />
      <path d={`${top(55)} ${bottomBack(110)} Z`} fill={b} />
    </g>
  );
};

/** Signpost. Props: { "text": "EXIT" } */
export const Sign: React.FC<ObjectProps> = ({ color, props, L }) => {
  const c = L(color ?? "#2a9d8f");
  return (
    <g>
      <rect x={-8} y={-260} width={16} height={260} fill={L("#6b4226")} />
      <path d="M-150,-300 L130,-300 L170,-255 L130,-210 L-150,-210 Z" fill={c} stroke={darken(c, 0.25)} strokeWidth={6} />
      <text x={-10} y={-240} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={42} fill="#fff">
        {str(props.text, "THIS WAY")}
      </text>
    </g>
  );
};

/** Centre-anchored cloud object (e.g. "the cloud" in tech explainers) */
export const CloudObj: React.FC<ObjectProps> = ({ t, color }) => {
  const c = color ?? "#ffffff";
  return (
    <g transform={`translate(0 ${Math.sin(t * 1.2) * 6})`}>
      <CloudShape x={0} y={0} s={1} color={c} shade={darken(c, 0.12)} />
    </g>
  );
};

/** Centre-anchored sun with rotating rays */
export const SunObj: React.FC<ObjectProps> = ({ t, color }) => {
  const c = color ?? "#ffd166";
  return (
    <g>
      <circle r={180} fill={c} opacity={0.18} />
      <g transform={`rotate(${t * 10})`}>
        {Array.from({ length: 12 }).map((_, i) => (
          <path key={i} d="M-14,-110 L0,-160 L14,-110 Z" fill={darken(c, 0.05)} transform={`rotate(${i * 30})`} />
        ))}
      </g>
      <circle r={95} fill={c} />
      <circle r={95} fill="none" stroke={darken(c, 0.12)} strokeWidth={8} />
      <circle cx={-30} cy={-30} r={30} fill="#fff" opacity={0.3} />
    </g>
  );
};

/** A stack of banknotes. */
export const Money: React.FC<ObjectProps> = ({ L }) => (
  <g>
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i} transform={`translate(${i % 2 ? 6 : -4} ${-i * 18})`}>
        <rect x={-110} y={-26} width={220} height={26} rx={4} fill={L("#52b788")} stroke={L("#2d6a4f")} strokeWidth={3} />
        <circle cx={0} cy={-13} r={9} fill={L("#2d6a4f")} />
      </g>
    ))}
    <rect x={-20} y={-110} width={40} height={110} fill={L("#ffd166")} opacity={0.9} />
  </g>
);

export const MISC: Record<string, ObjectDef> = {
  speech: { component: Speech, w: 380, h: 200, category: "callouts", description: 'origin = tail tip. props: { "text": "…", "side": "left|right", "width": 380 }' },
  thought: { component: Thought, w: 360, h: 280, category: "callouts", description: 'props: { "text": "…" }' },
  icon: { component: Icon, w: 180, h: 180, category: "icons", anchor: "center", description: 'props: { "name": "check|cross|star|heart|warning|bolt|question|exclaim|plus|clock|pin|dollar|virus|skull|shield|drop|nose|molecule" }' },
  coin: { component: Coin, w: 140, h: 140, category: "icons", anchor: "center", description: 'props: { "symbol": "$" }' },
  money: { component: Money, w: 220, h: 110, category: "icons" },
  crate: { component: Crate, w: 160, h: 160, category: "misc" },
  flag: { component: Flag, w: 200, h: 420, category: "misc" },
  sign: { component: Sign, w: 320, h: 300, category: "misc", description: 'props: { "text": "…" }' },
  cloud: { component: CloudObj, w: 320, h: 160, category: "misc", anchor: "center" },
  sun: { component: SunObj, w: 340, h: 340, category: "misc", anchor: "center" },
};
