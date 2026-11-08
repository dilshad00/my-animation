import React from "react";
import { useScene } from "../../../scenes/context";
import { FONT_FAMILY } from "../../../utils/fonts";
import type { ArrowElementT } from "../../../utils/schema";

/** Hand-drawn style arrow drawn on with `reveal` 0..1 (absolute coordinates). */
export const ArrowView: React.FC<{ el: ArrowElementT; reveal: number; local: number }> = ({ el, reveal, local }) => {
  const { theme } = useScene();
  const [x1, y1] = el.from;
  const [x2, y2] = el.to;
  const c = el.color ?? theme.accent;
  const w = el.thickness ?? 10;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const curve = el.curve ?? 0.2;
  // control point perpendicular to the segment
  const cx = (x1 + x2) / 2 - (dy / len) * len * curve;
  const cy = (y1 + y2) / 2 + (dx / len) * len * curve;
  const q = (t: number): [number, number] => [
    (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2,
    (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2,
  ];
  let L = 0;
  let prev = q(0);
  for (let i = 1; i <= 24; i++) {
    const p = q(i / 24);
    L += Math.hypot(p[0] - prev[0], p[1] - prev[1]);
    prev = p;
  }
  const d = `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
  const tip = q(Math.max(0.001, reveal));
  const before = q(Math.max(0, reveal - 0.02));
  const ang = (Math.atan2(tip[1] - before[1], tip[0] - before[0]) * 180) / Math.PI;
  const head = w * 2.6;
  const mid = q(0.5);
  return (
    <svg width={1} height={1} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <path d={d} stroke="#000" strokeOpacity={0.22} strokeWidth={w} fill="none" strokeLinecap="round" strokeDasharray={`${L * reveal} ${L}`} transform="translate(0 5)" />
      <path d={d} stroke={c} strokeWidth={w} fill="none" strokeLinecap="round" strokeDasharray={el.dashed ? `${w * 2} ${w * 2}` : `${L * reveal} ${L}`} opacity={el.dashed ? Math.min(1, reveal * 3) : 1} />
      {el.flow && reveal >= 1 ? (
        <path d={d} stroke="#fff" strokeWidth={w * 0.4} fill="none" strokeLinecap="round" strokeDasharray={`2 ${w * 4}`} strokeDashoffset={-local * 160} opacity={0.75} />
      ) : null}
      {reveal > 0.05 ? (
        <path d={`M0,0 L${-head},${-head * 0.6} L${-head * 0.7},0 L${-head},${head * 0.6} Z`} fill={c} transform={`translate(${tip[0]} ${tip[1]}) rotate(${ang})`} strokeLinejoin="round" stroke={c} strokeWidth={3} />
      ) : null}
      {el.label && reveal > 0.6 ? (
        <g opacity={Math.min(1, (reveal - 0.6) * 2.5)}>
          <rect x={mid[0] - el.label.length * 10 - 22} y={mid[1] - 32} width={el.label.length * 20 + 44} height={56} rx={28} fill={theme.dark} opacity={0.9} />
          <text x={mid[0]} y={mid[1] + 7} textAnchor="middle" fontFamily={FONT_FAMILY} fontWeight={700} fontSize={30} fill="#fff">
            {el.label}
          </text>
        </g>
      ) : null}
    </svg>
  );
};
