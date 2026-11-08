import React from "react";
import { darken, lighten } from "../../utils/color";
import { ease } from "../../utils/easing";
import type { ObjectDef, ObjectProps } from "./types";
import { num, str } from "./types";

/**
 * Tear-off wall calendar (centre origin, ≈ 520×620).
 * The top page shows the previous day and tears away at `tearAt`, revealing `day`.
 * Props: { "day": 3, "label": "DAY", "from": "2", "tearAt": 0.5 }   color = header colour
 */
export const Calendar: React.FC<ObjectProps> = ({ local, color, props, L }) => {
  const day = String(props.day ?? 1);
  const label = str(props.label, "DAY");
  const prev = props.from !== undefined ? String(props.from) : String(Math.max(0, Number(day) - 1) || "");
  const tearAt = num(props.tearAt, 0.5);
  const header = color ?? "#b5121b";
  const k = ease("in", (local - tearAt) / 0.75);
  const lift = ease("out", (local - tearAt + 0.25) / 0.25) * (1 - k);

  const Page: React.FC<{ text: string; torn?: boolean }> = ({ text, torn }) => (
    <g>
      <rect x={-230} y={-230} width={460} height={500} rx={14} fill={L("#fbf8f1")} />
      <path d={`M-230,-216 Q-230,-230 -216,-230 L216,-230 Q230,-230 230,-216 L230,-110 L-230,-110 Z`} fill={L(header)} />
      {torn ? (
        <path
          d={`M-230,-232 ${Array.from({ length: 24 })
            .map((_, i) => `L${-230 + (i + 1) * 20},${-232 + (i % 2 ? 8 : -2)}`)
            .join(" ")}`}
          fill="none"
          stroke={L(darken(header, 0.2))}
          strokeWidth={3}
        />
      ) : null}
      <text x={0} y={-148} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={58} letterSpacing={10} fill="#ffffff">
        {label}
      </text>
      <text x={0} y={180} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={250} fill={L("#1d2233")}>
        {text}
      </text>
      <rect x={-230} y={240} width={460} height={30} rx={14} fill={L("#ece6d8")} opacity={0.8} />
    </g>
  );

  return (
    <g>
      <ellipse cx={0} cy={330} rx={250} ry={22} fill="#000" opacity={0.25} />
      {/* backing board */}
      <rect x={-260} y={-290} width={520} height={600} rx={22} fill={L("#2b2d42")} />
      <rect x={-260} y={-290} width={520} height={30} rx={14} fill={L(lighten("#2b2d42", 0.12))} />
      {/* stacked page edges */}
      {[3, 2, 1].map((d) => (
        <rect key={d} x={-230 + d} y={-230 + d * 5} width={460} height={500} rx={14} fill={L(darken("#fbf8f1", 0.05 * d))} />
      ))}
      <Page text={day} />
      {/* the page that tears off */}
      {k < 1 ? (
        <g
          transform={`translate(${-k * 380} ${k * 760 - lift * 14}) rotate(${-k * 48 - lift * 3} ${230} ${-230})`}
          opacity={1 - Math.pow(k, 3)}
        >
          <Page text={prev} torn={k > 0} />
        </g>
      ) : null}
      {/* binder rings */}
      {Array.from({ length: 6 }).map((_, i) => {
        const x = -200 + i * 80;
        return (
          <g key={i}>
            <circle cx={x} cy={-236} r={9} fill={L("#1a1b29")} />
            <path d={`M${x - 6},-236 L${x - 6},-270 Q${x - 6},-282 ${x + 6},-282 L${x + 6},-282 Q${x + 12},-282 ${x + 12},-270`} stroke={L("#c9ced8")} strokeWidth={6} fill="none" strokeLinecap="round" />
          </g>
        );
      })}
    </g>
  );
};

export const STORY: Record<string, ObjectDef> = {
  calendar: {
    component: Calendar,
    w: 520,
    h: 640,
    category: "story",
    anchor: "center",
    description: 'Tear-off calendar. props: { "day": 3, "label": "DAY", "from": "2", "tearAt": 0.5 } — color = header',
  },
};
