import React from "react";
import { random } from "remotion";
import { darken, lighten } from "../../utils/color";
import type { ObjectDef, ObjectProps } from "./types";

const Wheel: React.FC<{ x: number; r: number; t: number; speed: number; L: (c: string) => string }> = ({ x, r, t, speed, L }) => (
  <g transform={`translate(${x} ${-r}) rotate(${t * speed * 360})`}>
    <circle r={r} fill={L("#1d1d24")} />
    <circle r={r * 0.55} fill={L("#c9ced6")} />
    {[0, 60, 120].map((a) => (
      <rect key={a} x={-r * 0.5} y={-2.5} width={r} height={5} fill={L("#8d939c")} transform={`rotate(${a})`} />
    ))}
    <circle r={r * 0.15} fill={L("#5c636e")} />
  </g>
);

const Headlight: React.FC<{ x: number; y: number; on: boolean }> = ({ x, y, on }) =>
  on ? (
    <g>
      <polygon points={`${x},${y - 6} ${x + 380},${y - 60} ${x + 380},${y + 70} ${x},${y + 6}`} fill="#fff6c9" opacity={0.18} />
      <circle cx={x} cy={y} r={9} fill="#fff6c9" />
    </g>
  ) : (
    <circle cx={x} cy={y} r={8} fill="#fff3c4" />
  );

/** Faces right. Props: { "moving": true } spins the wheels. */
export const Car: React.FC<ObjectProps> = ({ t, color, speed, props, L, p }) => {
  const body = L(color ?? "#e63946");
  const moving = props.moving !== false;
  const bounce = moving ? Math.sin(t * 22) * 1.2 : 0;
  return (
    <g>
      <ellipse cx={0} cy={0} rx={190} ry={14} fill="#000" opacity={0.2} />
      <g transform={`translate(0 ${bounce})`}>
        <path d="M-185,-40 Q-188,-92 -150,-98 L-95,-104 Q-60,-170 10,-172 L70,-170 Q115,-168 150,-110 L170,-104 Q195,-98 192,-56 L190,-40 Z" fill={body} />
        <path d="M-80,-106 Q-50,-158 8,-160 L22,-160 L22,-106 Z" fill={L("#9fd8ff")} />
        <path d="M36,-106 L36,-160 L66,-158 Q100,-156 130,-106 Z" fill={L("#9fd8ff")} />
        <path d="M-70,-110 Q-46,-150 -10,-154" stroke="#fff" strokeOpacity={0.5} strokeWidth={6} fill="none" strokeLinecap="round" />
        <rect x={-185} y={-62} width={377} height={8} fill={lighten(body, 0.25)} opacity={0.7} />
        <path d="M-185,-40 L190,-40 L188,-30 L-183,-30 Z" fill={darken(body, 0.3)} />
        <rect x={22} y={-80} width={22} height={5} rx={2} fill={darken(body, 0.35)} />
        <rect x={-60} y={-80} width={22} height={5} rx={2} fill={darken(body, 0.35)} />
        <Headlight x={186} y={-70} on={p.lightsOn} />
        <rect x={-190} y={-78} width={10} height={18} rx={3} fill={L("#ff4d4d")} />
      </g>
      <Wheel x={-110} r={36} t={t} speed={moving ? speed * 1.6 : 0} L={L} />
      <Wheel x={115} r={36} t={t} speed={moving ? speed * 1.6 : 0} L={L} />
    </g>
  );
};

export const Bus: React.FC<ObjectProps> = ({ t, color, speed, props, L, p }) => {
  const body = L(color ?? "#ffb703");
  const moving = props.moving !== false;
  return (
    <g>
      <ellipse cx={0} cy={0} rx={300} ry={16} fill="#000" opacity={0.2} />
      <rect x={-290} y={-250} width={580} height={215} rx={28} fill={body} />
      <rect x={-290} y={-80} width={580} height={30} fill={darken(body, 0.15)} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={-262 + i * 92} y={-222} width={78} height={80} rx={10} fill={L(p.lightsOn ? "#ffe8a3" : "#9fd8ff")} />
      ))}
      <rect x={200} y={-222} width={70} height={170} rx={10} fill={L("#7fc8f8")} />
      <line x1={235} y1={-222} x2={235} y2={-52} stroke={darken(body, 0.3)} strokeWidth={4} />
      <rect x={-290} y={-262} width={580} height={20} rx={10} fill={lighten(body, 0.2)} />
      <Headlight x={286} y={-70} on={p.lightsOn} />
      <Wheel x={-180} r={40} t={t} speed={moving ? speed * 1.3 : 0} L={L} />
      <Wheel x={170} r={40} t={t} speed={moving ? speed * 1.3 : 0} L={L} />
    </g>
  );
};

export const Truck: React.FC<ObjectProps> = ({ t, color, color2, speed, props, L, p }) => {
  const cab = L(color ?? "#2a9d8f");
  const box = L(color2 ?? "#f1faee");
  const moving = props.moving !== false;
  return (
    <g>
      <ellipse cx={0} cy={0} rx={300} ry={16} fill="#000" opacity={0.2} />
      <rect x={-300} y={-270} width={400} height={225} rx={10} fill={box} />
      <rect x={-300} y={-270} width={400} height={20} fill={darken(box, 0.08)} />
      <text x={-100} y={-150} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={44} fill={darken(cab, 0.1)}>
        {String(props.text ?? "CARGO")}
      </text>
      <path d="M110,-45 L110,-200 L210,-200 Q250,-196 268,-130 L290,-118 L290,-45 Z" fill={cab} />
      <path d="M130,-185 L205,-185 Q232,-180 248,-128 L130,-128 Z" fill={L("#9fd8ff")} />
      <rect x={-300} y={-60} width={590} height={18} fill={L("#3d405b")} />
      <Headlight x={288} y={-80} on={p.lightsOn} />
      <Wheel x={-210} r={38} t={t} speed={moving ? speed * 1.4 : 0} L={L} />
      <Wheel x={-120} r={38} t={t} speed={moving ? speed * 1.4 : 0} L={L} />
      <Wheel x={200} r={38} t={t} speed={moving ? speed * 1.4 : 0} L={L} />
    </g>
  );
};

export const Bicycle: React.FC<ObjectProps> = ({ t, color, speed, L }) => {
  const c = L(color ?? "#3a86ff");
  const wheel = (x: number) => (
    <g transform={`translate(${x} -48) rotate(${t * speed * 400})`}>
      <circle r={48} fill="none" stroke={L("#1d1d24")} strokeWidth={7} />
      {[0, 30, 60, 90, 120, 150].map((a) => (
        <line key={a} x1={-46} y1={0} x2={46} y2={0} stroke={L("#aab")} strokeWidth={1.5} transform={`rotate(${a})`} />
      ))}
    </g>
  );
  return (
    <g>
      {wheel(-70)}
      {wheel(75)}
      <path d="M-70,-48 L-10,-48 L40,-120 L-30,-120 Z M-10,-48 L-40,-130 M75,-48 L45,-140 L70,-150" stroke={c} strokeWidth={8} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <rect x={-58} y={-140} width={40} height={10} rx={5} fill={L("#222")} />
      <circle cx={-10} cy={-48} r={10} fill={L("#555")} />
    </g>
  );
};

/** Centre-anchored. Faces right. */
export const Airplane: React.FC<ObjectProps> = ({ t, color, L }) => {
  const c = L(color ?? "#f1faee");
  const accent = L("#e63946");
  return (
    <g transform={`rotate(${Math.sin(t * 1.2) * 2})`}>
      <path d="M-220,-10 Q-230,-40 -200,-40 L160,-40 Q230,-36 250,0 Q230,30 160,30 L-200,30 Q-226,28 -220,-10 Z" fill={c} />
      <path d="M-200,-40 L-250,-130 L-200,-130 L-130,-40 Z" fill={accent} />
      <path d="M-30,10 L-120,140 L-60,140 L60,10 Z" fill={darken(c, 0.12)} />
      <path d="M-30,-30 L-90,-110 L-50,-110 L40,-30 Z" fill={darken(c, 0.2)} />
      {Array.from({ length: 8 }).map((_, i) => (
        <circle key={i} cx={-130 + i * 34} cy={-12} r={9} fill={L("#5aa9e6")} />
      ))}
      <path d="M190,-28 Q225,-20 238,-4 L200,-4 Z" fill={L("#5aa9e6")} />
      <rect x={-200} y={6} width={360} height={8} fill={accent} />
    </g>
  );
};

/** Centre-anchored, points up. Props: { "thrust": 1 } controls the flame. */
export const Rocket: React.FC<ObjectProps> = ({ t, color, props, L }) => {
  const c = L(color ?? "#f1faee");
  const accent = L("#e63946");
  const thrust = typeof props.thrust === "number" ? props.thrust : 1;
  const flick = 1 + Math.sin(t * 40) * 0.08 + Math.sin(t * 23) * 0.06;
  return (
    <g>
      {thrust > 0 ? (
        <g transform={`translate(0 150) scale(1 ${thrust * flick})`}>
          <path d="M-45,0 Q-30,120 0,230 Q30,120 45,0 Z" fill="#ff7b00" opacity={0.9} />
          <path d="M-28,0 Q-18,80 0,160 Q18,80 28,0 Z" fill="#ffd166" />
          <path d="M-12,0 Q-6,40 0,80 Q6,40 12,0 Z" fill="#fff" />
        </g>
      ) : null}
      <path d="M-60,120 L-120,180 L-110,90 L-60,40 Z" fill={accent} />
      <path d="M60,120 L120,180 L110,90 L60,40 Z" fill={darken(accent, 0.2)} />
      <path d="M0,-220 Q80,-130 70,60 L60,150 L-60,150 L-70,60 Q-80,-130 0,-220 Z" fill={c} />
      <path d="M0,-220 Q80,-130 70,60 L60,150 L20,150 Q40,-60 0,-220 Z" fill={darken(c, 0.12)} />
      <path d="M0,-220 Q40,-185 55,-140 L-55,-140 Q-40,-185 0,-220 Z" fill={accent} />
      <circle cx={0} cy={-40} r={38} fill={L("#3d5a80")} stroke={L("#c9ced6")} strokeWidth={10} />
      <circle cx={-12} cy={-52} r={10} fill="#fff" opacity={0.6} />
      <rect x={-62} y={140} width={124} height={22} rx={6} fill={L("#5c636e")} />
    </g>
  );
};

export const Boat: React.FC<ObjectProps> = ({ t, color, L }) => {
  const c = L(color ?? "#e76f51");
  const bob = Math.sin(t * 1.6) * 6;
  return (
    <g transform={`translate(0 ${bob}) rotate(${Math.sin(t * 1.3) * 2})`}>
      <path d="M-200,-60 L200,-60 L160,20 L-170,20 Z" fill={c} />
      <rect x={-200} y={-66} width={400} height={14} fill={lighten(c, 0.3)} />
      <rect x={-80} y={-150} width={160} height={90} rx={8} fill={L("#f1faee")} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={-50 + i * 50} cy={-110} r={14} fill={L("#5aa9e6")} />
      ))}
      <rect x={20} y={-200} width={26} height={52} fill={L("#264653")} />
    </g>
  );
};

export const Sailboat: React.FC<ObjectProps> = ({ t, color, L, seed }) => {
  const c = L(color ?? "#f1faee");
  const bob = Math.sin(t * 1.4 + random(seed) * 5) * 6;
  const billow = Math.sin(t * 0.9) * 8;
  return (
    <g transform={`translate(0 ${bob}) rotate(${Math.sin(t * 1.1) * 3})`}>
      <path d="M-150,-40 L150,-40 L110,10 L-120,10 Z" fill={L("#8b5e34")} />
      <rect x={-6} y={-330} width={10} height={290} fill={L("#5c4033")} />
      <path d={`M10,-320 Q${120 + billow},-180 120,-60 L10,-60 Z`} fill={c} />
      <path d={`M-10,-280 Q${-90 - billow},-170 -110,-70 L-10,-70 Z`} fill={darken(c, 0.08)} />
      <path d="M4,-330 L50,-315 L4,-300 Z" fill={L("#e63946")} />
    </g>
  );
};

export const VEHICLES: Record<string, ObjectDef> = {
  car: { component: Car, w: 390, h: 180, category: "vehicles", description: 'props: { "moving": false } stops the wheels' },
  bus: { component: Bus, w: 600, h: 270, category: "vehicles" },
  truck: { component: Truck, w: 600, h: 280, category: "vehicles", description: 'props: { "text": "CARGO" }' },
  bicycle: { component: Bicycle, w: 250, h: 150, category: "vehicles" },
  airplane: { component: Airplane, w: 500, h: 280, category: "vehicles", anchor: "center" },
  rocket: { component: Rocket, w: 240, h: 600, category: "vehicles", anchor: "center", description: 'props: { "thrust": 0..1.5 }' },
  boat: { component: Boat, w: 400, h: 220, category: "vehicles" },
  sailboat: { component: Sailboat, w: 300, h: 340, category: "vehicles" },
};
