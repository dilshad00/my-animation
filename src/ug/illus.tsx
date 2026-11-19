/** Original procedural illustrations for UNKNOWN GAMER (no third-party art). */
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { clamp } from "./fx";
import { C, DISPLAY, MONO } from "./theme";

const rnd = (n: number) => {
  const v = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return v - Math.floor(v);
};

/** One-point-perspective data-centre aisle with blinking rack LEDs; the camera dollies forward. */
export const ServerHall: React.FC<{ f: number; speed?: number; dim?: number; tint?: string }> = ({ f, speed = 0.012, dim = 0, tint = "40,215,255" }) => {
  const N = 14;
  const vx = 960;
  const vy = 470;
  const racks: React.ReactNode[] = [];
  for (let i = N - 1; i >= 0; i--) {
    const z = ((i + 1 - ((f * speed) % 1)) / N) * 6 + 0.35; // depth
    const s = 1 / z;
    const W = 1500 * s;
    const H = 1400 * s;
    const rw = 260 * s;
    const fog = Math.min(1, z / 6);
    for (const side of [-1, 1]) {
      const x = side < 0 ? vx - W / 2 - rw : vx + W / 2;
      const leds = Array.from({ length: 12 }, (_, k) => {
        const on = rnd(i * 31 + k * 7 + Math.floor(f / (6 + (k % 5))) + side * 3) > 0.45;
        const col = rnd(i * 5 + k) > 0.8 ? "255,182,72" : tint;
        return <rect key={k} x={x + rw * (0.15 + (k % 3) * 0.28)} y={vy - H * 0.42 + Math.floor(k / 3) * H * 0.2} width={rw * 0.1} height={Math.max(1.5, H * 0.012)} fill={`rgba(${col},${on ? 0.95 : 0.15})`} />;
      });
      racks.push(
        <g key={`${i}${side}`} opacity={1 - fog * 0.85}>
          <rect x={x} y={vy - H / 2} width={rw} height={H} fill="#0b1016" stroke={`rgba(${tint},0.25)`} strokeWidth={Math.max(0.5, 2 * s)} />
          {Array.from({ length: 6 }, (_, k) => (
            <line key={k} x1={x} x2={x + rw} y1={vy - H / 2 + (H * (k + 1)) / 7} y2={vy - H / 2 + (H * (k + 1)) / 7} stroke="rgba(255,255,255,0.06)" strokeWidth={Math.max(0.5, 1.5 * s)} />
          ))}
          {leds}
        </g>,
      );
    }
  }
  return (
    <AbsoluteFill style={{ backgroundColor: "#03060a", filter: `brightness(${1 - dim})` }}>
      <svg width={1920} height={1080}>
        <defs>
          <linearGradient id="sh-floor" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={`rgba(${tint},0.0)`} />
            <stop offset="100%" stopColor={`rgba(${tint},0.18)`} />
          </linearGradient>
          <radialGradient id="sh-glow" cx="50%" cy="44%" r="35%">
            <stop offset="0%" stopColor={`rgba(${tint},0.35)`} />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>
        </defs>
        <rect x={0} y={vy} width={1920} height={1080 - vy} fill="url(#sh-floor)" />
        {Array.from({ length: 9 }, (_, k) => (
          <line key={k} x1={vx} y1={vy} x2={(k / 8) * 1920 * 2 - 960} y2={1080} stroke={`rgba(${tint},0.10)`} strokeWidth={1.5} />
        ))}
        <rect width={1920} height={1080} fill="url(#sh-glow)" />
        {racks}
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- simple line icons
const ico = (children: React.ReactNode, size: number, color: string, vb = "0 0 100 100") => (
  <svg width={size} height={size} viewBox={vb} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);
export const IconLaptop = ({ size = 120, color = C.ink }) => ico(<><rect x={18} y={22} width={64} height={42} rx={4} /><path d="M8 74 H92 L86 82 H14 Z" /></>, size, color);
export const IconTower = ({ size = 120, color = C.ink }) => ico(<><rect x={30} y={10} width={40} height={80} rx={5} /><circle cx={50} cy={34} r={9} /><circle cx={50} cy={58} r={9} /><path d="M40 80 H60" /></>, size, color);
export const IconGpu = ({ size = 120, color = C.ink }) => ico(<><rect x={8} y={28} width={84} height={40} rx={5} /><circle cx={32} cy={48} r={12} /><circle cx={66} cy={48} r={12} /><path d="M14 68 V78 M24 68 V78" /></>, size, color);
export const IconRam = ({ size = 60, color = C.green }) => ico(<><rect x={6} y={30} width={88} height={34} rx={3} /><path d="M18 40 h10 v14 h-10z M38 40 h10 v14 h-10z M58 40 h10 v14 h-10z M78 40 h6 v14 h-6z" /><path d="M10 64 v8 M20 64 v8 M30 64 v8 M40 64 v8 M60 64 v8 M70 64 v8 M80 64 v8 M90 64 v8" /></>, size, color);
export const IconBot = ({ size = 160, color = C.ink }) => ico(<><rect x={22} y={30} width={56} height={44} rx={8} /><circle cx={40} cy={50} r={6} /><circle cx={60} cy={50} r={6} /><path d="M40 64 H60 M50 30 V18 M44 18 H56 M22 52 H12 M78 52 H88" /></>, size, color);
export const IconPick = ({ size = 160, color = C.ink }) => ico(<><path d="M20 30 Q50 6 80 30" /><path d="M50 18 L50 90" /><rect x={30} y={70} width={40} height={16} rx={3} /></>, size, color);
export const IconTrophy = ({ size = 160, color = C.amber }) => ico(<><path d="M30 14 H70 V38 Q70 60 50 62 Q30 60 30 38 Z" /><path d="M30 22 H14 Q14 42 32 44 M70 22 H86 Q86 42 68 44" /><path d="M50 62 V76 M34 88 H66 L62 76 H38 Z" /></>, size, color);
export const IconCar = ({ size = 360, color = C.ink }) => (
  <svg width={size} height={size * 0.5} viewBox="0 0 200 100" fill="none" stroke={color} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 70 V56 Q14 50 22 48 L48 44 L70 24 Q74 20 82 20 H128 Q136 20 142 26 L160 44 L182 50 Q188 52 188 60 V70 Z" />
    <path d="M76 44 L86 28 H124 L138 44 Z" />
    <circle cx={52} cy={72} r={14} fill={C.bg} />
    <circle cx={150} cy={72} r={14} fill={C.bg} />
    <path d="M30 36 l-6 -6 M100 12 l0 -6" opacity={0.5} />
  </svg>
);

/** Arrow-up badge. */
export const UpArrow: React.FC<{ size?: number; color?: string }> = ({ size = 50, color = C.red }) => (
  <svg width={size} height={size} viewBox="0 0 50 50">
    <path d="M25 6 L44 28 H32 V44 H18 V28 H6 Z" fill={color} />
  </svg>
);

/** Confetti that freezes and falls grey after `freezeAt`. */
export const Confetti: React.FC<{ f: number; at: number; freezeAt: number }> = ({ f, at, freezeAt }) => {
  if (f < at) return null;
  const pieces = Array.from({ length: 80 }, (_, i) => {
    const x0 = rnd(i) * 1920;
    const v = 6 + rnd(i + 99) * 8;
    const t = Math.min(f, freezeAt) - at;
    const after = Math.max(0, f - freezeAt);
    const y = -40 + v * t + after * after * 0.9;
    const rot = (rnd(i + 7) * 360 + (Math.min(f, freezeAt) - at) * 9) % 360;
    const col = f >= freezeAt ? "rgba(139,151,164,0.8)" : [C.green, C.teal, C.amber, "#fff"][i % 4];
    return <rect key={i} x={x0 + Math.sin((Math.min(f, freezeAt) + i) / 9) * 20} y={y} width={14} height={8} fill={col} transform={`rotate(${rot} ${x0} ${y})`} />;
  });
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {pieces}
    </svg>
  );
};

/** Theatre curtains closing at `at`. */
export const Curtains: React.FC<{ f: number; at: number; label?: string }> = ({ f, at, label }) => {
  const p = interpolate(f, [at, at + 18], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  if (p <= 0) return null;
  const panel = (side: number) => (
    <div
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        width: 980,
        left: side < 0 ? -980 + 980 * p : undefined,
        right: side > 0 ? -980 + 980 * p : undefined,
        background: "repeating-linear-gradient(90deg, #5a0710 0px, #8c1020 40px, #5a0710 80px)",
        boxShadow: "0 0 80px rgba(0,0,0,0.8)",
      }}
    />
  );
  return (
    <AbsoluteFill>
      {panel(-1)}
      {panel(1)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 120, background: "linear-gradient(180deg, #3a0409, #6b0a16)", boxShadow: "0 10px 40px rgba(0,0,0,0.7)" }} />
      {label ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: interpolate(f, [at + 14, at + 22], [0, 1], clamp) }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 150, color: "#ffd9a0", letterSpacing: 6, textShadow: "0 0 40px rgba(255,182,72,0.6)" }}>{label}</div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/** Tug of war: tiny PC vs a giant server rack over a RAM stick. */
export const TugOfWar: React.FC<{ f: number; yankAt: number }> = ({ f, yankAt }) => {
  const wobble = Math.sin(f / 4) * 14;
  const yank = interpolate(f, [yankAt, yankAt + 14], [0, 1], { ...clamp, easing: (x) => x * x });
  const shift = wobble * (1 - yank) + yank * 900;
  const pcX = 330 + shift;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <line x1={0} x2={1920} y1={760} y2={760} stroke="rgba(255,255,255,0.12)" strokeWidth={2} />
      {/* rope */}
      <path d={`M${pcX + 90} 640 Q ${(pcX + 1380) / 2} ${660 + 10 * Math.sin(f / 3)} 1380 610`} stroke="#c9a06a" strokeWidth={10} fill="none" />
      {/* RAM stick on the rope */}
      <g transform={`translate(${(pcX + 1380) / 2 + shift * 0.2 - 90}, ${600 + yank * -40}) rotate(${-4 + yank * 30})`}>
        <rect width={180} height={44} rx={4} fill="#1a2a20" stroke={C.green} strokeWidth={3} />
        {[0, 1, 2, 3].map((k) => (
          <rect key={k} x={14 + k * 42} y={10} width={30} height={20} fill="#2d3b33" />
        ))}
      </g>
      {/* tiny PC */}
      <g transform={`translate(${pcX}, 600) rotate(${yank * 40})`}>
        <rect width={90} height={160} rx={8} fill="#11161d" stroke={C.teal} strokeWidth={4} />
        <circle cx={45} cy={50} r={16} fill="none" stroke={C.teal} strokeWidth={3} />
        <circle cx={45} cy={100} r={16} fill="none" stroke={C.teal} strokeWidth={3} />
        <text x={45} y={-16} textAnchor="middle" fill={C.ink} fontFamily={DISPLAY} fontWeight={700} fontSize={34}>YOUR PC</text>
      </g>
      {/* giant rack */}
      <g transform="translate(1380, 140)">
        <rect width={360} height={620} rx={10} fill="#0b1016" stroke={C.red} strokeWidth={5} />
        {Array.from({ length: 10 }, (_, k) => (
          <g key={k}>
            <rect x={24} y={24 + k * 58} width={312} height={44} fill="#121a22" />
            {[0, 1, 2, 3].map((j) => (
              <rect key={j} x={44 + j * 26} y={40 + k * 58} width={12} height={8} fill={rnd(k * 9 + j + Math.floor(f / 5)) > 0.4 ? C.red : "rgba(255,61,82,0.2)"} />
            ))}
          </g>
        ))}
        <text x={180} y={-24} textAnchor="middle" fill={C.ink} fontFamily={DISPLAY} fontWeight={700} fontSize={54}>AI BUILD-OUT</text>
      </g>
      <text x={960} y={140} textAnchor="middle" fill={C.mute} fontFamily={MONO} fontWeight={700} fontSize={26} letterSpacing={4}>ILLUSTRATION</text>
    </svg>
  );
};
