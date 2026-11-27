/**
 * Original Xbox-style controller (offset sticks, ABXY, bumpers, triggers, d-pad) drawn in SVG,
 * driven by an input track. No logos/trademarks — a generic layout.
 *
 * Input track: per-frame samples, either from motion analysis of the gameplay (sticks) or hand-keyed
 * events (buttons). `inputAt(track, f)` returns the interpolated state for frame f.
 */
import React from "react";
import { C, MONO } from "../ug/theme";

export type Btn = "A" | "B" | "X" | "Y" | "LB" | "RB" | "LT" | "RT" | "UP" | "DOWN" | "LEFT" | "RIGHT" | "LS" | "RS" | "MENU" | "VIEW";
export type PadState = { lx: number; ly: number; rx: number; ry: number; lt: number; rt: number; down: Partial<Record<Btn, number>> };
/** Stick keyframes: [frame, lx, ly, rx, ry]; button events: [btn, startFrame, endFrame]; trigger keys: [frame, lt, rt]. */
export type InputTrack = { sticks: [number, number, number, number, number][]; buttons: [Btn, number, number][]; triggers?: [number, number, number][] };

const lerpKeys = (keys: number[][], f: number, idx: number) => {
  if (!keys.length) return 0;
  if (f <= keys[0][0]) return keys[0][idx];
  for (let i = 1; i < keys.length; i++) {
    if (f <= keys[i][0]) {
      const [a, b] = [keys[i - 1], keys[i]];
      const t = (f - a[0]) / Math.max(1, b[0] - a[0]);
      return a[idx] + (b[idx] - a[idx]) * t;
    }
  }
  return keys[keys.length - 1][idx];
};

export const inputAt = (tr: InputTrack, f: number): PadState => {
  const down: PadState["down"] = {};
  for (const [b, s, e] of tr.buttons) {
    if (f >= s - 1 && f <= e + 3) {
      // 0..1 press depth with a 1-frame attack and 3-frame release
      const v = f < s ? 0.5 : f <= e ? 1 : 1 - (f - e) / 3;
      down[b] = Math.max(down[b] ?? 0, v);
    }
  }
  const tk = (tr.triggers ?? []) as number[][];
  return {
    lx: lerpKeys(tr.sticks, f, 1),
    ly: lerpKeys(tr.sticks, f, 2),
    rx: lerpKeys(tr.sticks, f, 3),
    ry: lerpKeys(tr.sticks, f, 4),
    lt: Math.max(lerpKeys(tk, f, 1), down.LT ?? 0),
    rt: Math.max(lerpKeys(tk, f, 2), down.RT ?? 0),
    down,
  };
};

const FACE: Record<"A" | "B" | "X" | "Y", string> = { A: "#3ddc6a", B: "#ff4d5e", X: "#3aa0ff", Y: "#ffc93a" };

const Stick: React.FC<{ cx: number; cy: number; x: number; y: number; pressed: number; accent: string }> = ({ cx, cy, x, y, pressed, accent }) => {
  const mag = Math.min(1, Math.hypot(x, y));
  const px = cx + x * 26;
  const py = cy + y * 26;
  return (
    <g>
      <circle cx={cx} cy={cy} r={58} fill="#0c0f13" stroke="#2a3038" strokeWidth={4} />
      {/* direction glow ring */}
      <circle cx={cx} cy={cy} r={54} fill="none" stroke={accent} strokeWidth={6} opacity={mag * 0.9} strokeDasharray={`${40 + mag * 60} 400`} transform={`rotate(${(Math.atan2(y, x) * 180) / Math.PI - 30} ${cx} ${cy})`} />
      <circle cx={px} cy={py + 6} r={42} fill="rgba(0,0,0,0.5)" />
      <circle cx={px} cy={py} r={42 - pressed * 4} fill="url(#stickTop)" stroke={mag > 0.15 || pressed ? accent : "#3b424c"} strokeWidth={4} />
      <circle cx={px} cy={py} r={28 - pressed * 3} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={3} />
    </g>
  );
};

const Face: React.FC<{ cx: number; cy: number; k: "A" | "B" | "X" | "Y"; v: number }> = ({ cx, cy, k, v }) => (
  <g transform={`translate(${cx} ${cy + v * 3}) scale(${1 - v * 0.08})`}>
    {v > 0 ? <circle r={40} fill={FACE[k]} opacity={0.35 * v} /> : null}
    <circle r={27} fill={v > 0 ? FACE[k] : "#14181d"} stroke={FACE[k]} strokeWidth={4} />
    <text y={11} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={30} fill={v > 0 ? "#0a0c0f" : FACE[k]}>
      {k}
    </text>
  </g>
);

export const Controller: React.FC<{ s: PadState; scale?: number; accent?: string; labels?: boolean }> = ({ s, scale = 1, accent = C.teal, labels = true }) => {
  const d = (b: Btn) => s.down[b] ?? 0;
  const dp = (b: Btn, path: string) => <path d={path} fill={d(b) ? accent : "#14181d"} stroke={d(b) ? accent : "#3b424c"} strokeWidth={3} />;
  return (
    <svg width={900 * scale} height={620 * scale} viewBox="0 0 900 620" style={{ overflow: "visible", filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.7))" }}>
      <defs>
        <linearGradient id="shell" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b3139" />
          <stop offset="0.5" stopColor="#1a1f25" />
          <stop offset="1" stopColor="#101317" />
        </linearGradient>
        <radialGradient id="stickTop" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#3a414b" />
          <stop offset="1" stopColor="#161a1f" />
        </radialGradient>
      </defs>
      {/* triggers */}
      {(["LT", "RT"] as const).map((t, i) => {
        const v = t === "LT" ? s.lt : s.rt;
        const x = i ? 640 : 150;
        return (
          <g key={t} transform={`translate(0 ${v * 10})`}>
            <rect x={x} y={-44} width={110} height={70} rx={22} fill={v > 0.05 ? accent : "#181c21"} opacity={0.35 + 0.65 * Math.max(0.3, v)} stroke="#3b424c" strokeWidth={3} />
            {labels ? (
              <text x={x + 55} y={-6} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={24} fill={v > 0.05 ? "#0a0c0f" : C.mute}>
                {t}
              </text>
            ) : null}
          </g>
        );
      })}
      {/* bumpers */}
      {(["LB", "RB"] as const).map((b, i) => (
        <g key={b} transform={`translate(0 ${d(b) * 5})`}>
          <path d={i ? "M590 108 Q680 74 760 110 L752 132 Q676 106 596 134 Z" : "M310 108 Q220 74 140 110 L148 132 Q224 106 304 134 Z"} fill={d(b) ? accent : "#1c2127"} stroke="#3b424c" strokeWidth={3} />
          {labels ? (
            <text x={i ? 676 : 224} y={100} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={20} fill={d(b) ? accent : C.mute}>
              {b}
            </text>
          ) : null}
        </g>
      ))}
      {/* shell */}
      <path
        d="M170 130 Q450 96 730 130 Q820 140 852 260 Q890 420 872 520 Q858 596 790 600 Q730 602 680 520 Q640 456 600 446 L300 446 Q260 456 220 520 Q170 602 110 600 Q42 596 28 520 Q10 420 48 260 Q80 140 170 130 Z"
        fill="url(#shell)"
        stroke="#3b424c"
        strokeWidth={4}
      />
      <path d="M200 150 Q450 122 700 150" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
      {/* guide button (plain circle, no logo) */}
      <circle cx={450} cy={196} r={30} fill="#14181d" stroke={accent} strokeWidth={3} opacity={0.9} />
      <circle cx={450} cy={196} r={12} fill={accent} opacity={0.5} />
      {/* view / menu */}
      <circle cx={390} cy={266} r={15} fill={d("VIEW") ? accent : "#14181d"} stroke="#3b424c" strokeWidth={3} />
      <circle cx={510} cy={266} r={15} fill={d("MENU") ? accent : "#14181d"} stroke="#3b424c" strokeWidth={3} />
      {/* left stick (upper-left), d-pad (lower-left), right stick (lower-right), ABXY (upper-right) */}
      <Stick cx={232} cy={262} x={s.lx} y={s.ly} pressed={d("LS")} accent={accent} />
      <g transform="translate(330 384)">
        <circle r={62} fill="#0c0f13" stroke="#2a3038" strokeWidth={4} />
        {dp("UP", "M-16 -50 H16 V-16 H-16 Z")}
        {dp("DOWN", "M-16 16 H16 V50 H-16 Z")}
        {dp("LEFT", "M-50 -16 H-16 V16 H-50 Z")}
        {dp("RIGHT", "M16 -16 H50 V16 H16 Z")}
        <rect x={-16} y={-16} width={32} height={32} fill="#14181d" />
      </g>
      <Stick cx={570} cy={384} x={s.rx} y={s.ry} pressed={d("RS")} accent={accent} />
      <g>
        <circle cx={668} cy={262} r={92} fill="#0c0f13" stroke="#2a3038" strokeWidth={4} />
        <Face cx={668} cy={318} k="A" v={d("A")} />
        <Face cx={724} cy={262} k="B" v={d("B")} />
        <Face cx={612} cy={262} k="X" v={d("X")} />
        <Face cx={668} cy={206} k="Y" v={d("Y")} />
      </g>
    </svg>
  );
};

/** Floating action label shown when a button is pressed (e.g. "A · JUMP"). */
export const ActionPop: React.FC<{ f: number; events: [Btn, number, number, string][]; color?: string }> = ({ f, events, color = C.ink }) => {
  const cur = events.filter(([, s, e]) => f >= s && f <= e + 12);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      {cur.map(([b, s, e, label], i) => {
        const a = Math.min(1, (f - s) / 4) * (f > e ? 1 - (f - e) / 12 : 1);
        const col = b in FACE ? FACE[b as keyof typeof FACE] : color;
        return (
          <div key={i} style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color: "#0a0c0f", background: col, padding: "6px 18px", borderRadius: 10, opacity: a, transform: `translateY(${(1 - a) * 14}px)` }}>
            {b} · {label}
          </div>
        );
      })}
    </div>
  );
};
