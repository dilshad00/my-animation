import React from "react";
import { interpolate } from "remotion";
import { clamp, ease } from "./fx";
import { C, INTER, MONO } from "./theme";

type Pt = { day: number; v: number; label: string; price: string };

/** RTX 5090 EU price — Pro-Gamer European GPU Barometer, 14 Nov 2026 (research.md F30). */
const PTS: Pt[] = [
  { day: 0, v: 5699.9, label: "18 SEP", price: "€5,699" },
  { day: 42, v: 8129.9, label: "30 OCT", price: "€8,129" },
  { day: 49, v: 8449.9, label: "6 NOV", price: "€8,449" },
  { day: 57, v: 5609.9, label: "14 NOV", price: "€5,609" },
];

const W = 1000;
const H = 500;
const X = (d: number) => (d / 57) * W;
const Y = (v: number) => H - ((v - 5000) / 4000) * H;

const len = (pts: Pt[]) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(X(p.day) - X(pts[i].day), Y(p.v) - Y(pts[i].v)), 0);

/** riseP: draw 18 Sep → 6 Nov; dropP: draw the cliff 6 → 14 Nov. */
export const CliffChart: React.FC<{ f: number; riseP: number; dropP: number; appear: number }> = ({ f, riseP, dropP, appear }) => {
  const rise = PTS.slice(0, 3);
  const drop = PTS.slice(2);
  const rl = len(rise);
  const dl = len(drop);
  const poly = (pts: Pt[]) => pts.map((p) => `${X(p.day)},${Y(p.v)}`).join(" ");
  const shown = [true, riseP > 0.82, riseP >= 1, dropP >= 1];
  const gridO = interpolate(f, [appear, appear + 15], [0, 1], clamp);
  return (
    <svg width={W + 260} height={H + 120} viewBox={`-150 -40 ${W + 260} ${H + 120}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="riseFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={C.red} stopOpacity={0.35} />
          <stop offset="100%" stopColor={C.red} stopOpacity={0} />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="riseClip">
          <rect x={-10} y={-50} width={X(PTS[2].day) * riseP + 10} height={H + 60} />
        </clipPath>
      </defs>
      <g opacity={gridO}>
        {[5000, 6000, 7000, 8000, 9000].map((v) => (
          <g key={v}>
            <line x1={0} x2={W} y1={Y(v)} y2={Y(v)} stroke={C.line} strokeDasharray="4 8" />
            <text x={-24} y={Y(v) + 8} textAnchor="end" fill={C.mute} fontFamily={MONO} fontSize={22}>
              €{v / 1000}k
            </text>
          </g>
        ))}
      </g>
      {/* area under the rise */}
      <polygon
        clipPath="url(#riseClip)"
        points={`${poly(rise)} ${X(PTS[2].day)},${H} 0,${H}`}
        fill="url(#riseFill)"
      />
      <polyline
        points={poly(rise)}
        fill="none"
        stroke={C.red}
        strokeWidth={7}
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray={rl}
        strokeDashoffset={rl * (1 - riseP)}
        filter="url(#glow)"
      />
      <polyline
        points={poly(drop)}
        fill="none"
        stroke={C.green}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={dl}
        strokeDashoffset={dl * (1 - dropP)}
        filter="url(#glow)"
      />
      {PTS.map((p, i) => {
        const o = shown[i] ? 1 : 0;
        const up = i === 3 ? 1 : -1;
        return (
          <g key={p.label} opacity={o}>
            <circle cx={X(p.day)} cy={Y(p.v)} r={11} fill={C.bg} stroke={i === 3 ? C.green : C.red} strokeWidth={5} />
            <text
              x={X(p.day)}
              y={Y(p.v) + (up > 0 ? 58 : -30)}
              textAnchor={i === 0 ? "start" : "middle"}
              fill={C.ink}
              fontFamily={MONO}
              fontWeight={700}
              fontSize={30}
            >
              {p.price}
            </text>
            <text x={X(p.day)} y={H + 52} textAnchor={i === 0 ? "start" : "middle"} fill={C.mute} fontFamily={INTER} fontWeight={600} fontSize={22} letterSpacing={2}>
              {p.label}
            </text>
          </g>
        );
      })}
      <text x={0} y={-6} fill={C.mute} fontFamily={INTER} fontWeight={700} fontSize={22} letterSpacing={3} opacity={gridO}>
        RTX 5090 · CHEAPEST LISTING · EU RETAIL (INCL. VAT)
      </text>
      {/* tiny progress marker on the drop */}
      <circle
        cx={interpolate(dropP, [0, 1], [X(PTS[2].day), X(PTS[3].day)], { ...clamp, easing: ease })}
        cy={interpolate(dropP, [0, 1], [Y(PTS[2].v), Y(PTS[3].v)], { ...clamp, easing: ease })}
        r={dropP > 0 && dropP < 1 ? 9 : 0}
        fill={C.green}
      />
    </svg>
  );
};
