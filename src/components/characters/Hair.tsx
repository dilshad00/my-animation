import React from "react";
import { darken, lighten } from "../../utils/color";

/**
 * Hair is drawn in two passes around the head (radius R, centre 0,0,
 * character facing +x in three-quarter view):
 *  - "back": behind the head/body (long hair, ponytail, afro volume)
 *  - "front": over the skull (cap, fringe)
 */
export const Hair: React.FC<{
  style: string;
  color: string;
  R: number;
  layer: "back" | "front";
  sway: number;
  elder?: boolean;
}> = ({ style, color, R, layer, sway }) => {
  const shade = darken(color, 0.25);
  const hi = lighten(color, 0.22);
  const sw = sway * R * 0.12;

  const cap = (
    <path
      d={`M${-R * 0.99},${R * 0.12}
        C${-R * 1.12},${-R * 0.9} ${-R * 0.3},${-R * 1.24} ${R * 0.36},${-R * 1.1}
        C${R * 0.86},${-R * 1.0} ${R * 1.07},${-R * 0.58} ${R * 0.99},${-R * 0.26}
        C${R * 0.62},${-R * 0.52} ${R * 0.12},${-R * 0.58} ${-R * 0.34},${-R * 0.44}
        C${-R * 0.58},${-R * 0.34} ${-R * 0.7},${-R * 0.1} ${-R * 0.7},${R * 0.16} Z`}
      fill={color}
    />
  );
  const capHighlight = (
    <path
      d={`M${-R * 0.4},${-R * 0.92} Q${R * 0.15},${-R * 1.12} ${R * 0.62},${-R * 0.86}`}
      stroke={hi}
      strokeWidth={R * 0.07}
      strokeLinecap="round"
      fill="none"
      opacity={0.7}
    />
  );

  if (layer === "back") {
    switch (style) {
      case "bob":
        return (
          <path
            d={`M${-R * 1.08},${R * 0.75} C${-R * 1.3},${-R * 0.4} ${-R * 0.7},${-R * 1.25} ${R * 0.1},${-R * 1.18}
              C${R * 0.9},${-R * 1.1} ${R * 1.2},${-R * 0.3} ${R * 1.06},${R * 0.62}
              C${R * 0.8},${R * 0.82} ${-R * 0.6},${R * 0.95} ${-R * 1.08},${R * 0.75} Z`}
            fill={shade}
          />
        );
      case "long":
        return (
          <path
            d={`M${-R * 1.05},${R * 0.2} C${-R * 1.3},${-R * 0.9} ${-R * 0.4},${-R * 1.3} ${R * 0.3},${-R * 1.15}
              C${R * 1.0},${-R * 1.0} ${R * 1.15},${-R * 0.2} ${R * 1.02},${R * 0.6}
              C${R * 0.95},${R * 1.5} ${R * 0.4 + sw},${R * 2.3} ${-R * 0.2 + sw},${R * 2.4}
              C${-R * 0.9 + sw},${R * 2.45} ${-R * 1.3 + sw},${R * 1.7} ${-R * 1.05},${R * 0.2} Z`}
            fill={shade}
          />
        );
      case "ponytail":
        return (
          <path
            d={`M${-R * 0.7},${-R * 0.75} C${-R * 1.4},${-R * 0.7} ${-R * 1.55 + sw},${R * 0.3} ${-R * 1.35 + sw * 1.6},${R * 1.35}
              C${-R * 1.3 + sw * 1.6},${R * 1.55} ${-R * 1.05 + sw},${R * 1.3} ${-R * 1.0 + sw},${R * 0.9}
              C${-R * 0.95},${R * 0.2} ${-R * 0.85},${-R * 0.3} ${-R * 0.55},${-R * 0.55} Z`}
            fill={color}
            stroke={shade}
            strokeWidth={2}
          />
        );
      case "afro":
        return (
          <g fill={color}>
            <circle cx={-R * 0.12} cy={-R * 0.38} r={R * 1.38} />
            {Array.from({ length: 14 }).map((_, i) => {
              const a = (i / 14) * Math.PI * 2;
              return (
                <circle
                  key={i}
                  cx={-R * 0.12 + Math.cos(a) * R * 1.3}
                  cy={-R * 0.38 + Math.sin(a) * R * 1.3}
                  r={R * 0.28}
                />
              );
            })}
          </g>
        );
      case "bun":
        return (
          <g>
            <circle cx={-R * 0.42} cy={-R * 1.1} r={R * 0.4} fill={color} />
            <path
              d={`M${-R * 0.7},${-R * 1.15} Q${-R * 0.42},${-R * 1.3} ${-R * 0.14},${-R * 1.12}`}
              stroke={shade}
              strokeWidth={R * 0.05}
              fill="none"
            />
          </g>
        );
      case "curly":
        return (
          <g fill={shade}>
            {[-0.95, -1.0, -0.8].map((x, i) => (
              <circle key={i} cx={x * R} cy={(i * 0.35 - 0.2) * R} r={R * 0.3} />
            ))}
          </g>
        );
      default:
        return null;
    }
  }

  // front layer
  switch (style) {
    case "bald":
      return (
        <path
          d={`M${-R * 0.98},${R * 0.1} Q${-R * 1.04},${-R * 0.3} ${-R * 0.85},${-R * 0.5} Q${-R * 0.82},${-R * 0.1} ${-R * 0.72},${R * 0.12} Z`}
          fill={color}
        />
      );
    case "spiky": {
      const spikes: string[] = [];
      const n = 7;
      for (let i = 0; i <= n; i++) {
        const a = Math.PI * (1.02 + (i / n) * 0.95);
        const r1 = R * 1.08;
        const r2 = R * 1.36;
        const am = a + (Math.PI * 0.95) / n / 2;
        spikes.push(`${Math.cos(a) * r1},${Math.sin(a) * r1 - R * 0.05}`);
        if (i < n) spikes.push(`${Math.cos(am) * r2},${Math.sin(am) * r2 - R * 0.1}`);
      }
      return (
        <g>
          {cap}
          <polygon points={spikes.join(" ")} fill={color} strokeLinejoin="round" stroke={color} strokeWidth={6} />
          {capHighlight}
        </g>
      );
    }
    case "side":
      return (
        <g>
          {cap}
          <path
            d={`M${-R * 0.4},${-R * 1.0} C${R * 0.2},${-R * 1.25} ${R * 1.1},${-R * 0.9} ${R * 1.02},${-R * 0.2}
              C${R * 0.8},${-R * 0.55} ${R * 0.4},${-R * 0.5} ${R * 0.0},${-R * 0.62} Z`}
            fill={color}
          />
          {capHighlight}
        </g>
      );
    case "bob":
    case "long":
      return (
        <g>
          {cap}
          <path
            d={`M${-R * 0.5},${-R * 0.95} C${R * 0.1},${-R * 1.22} ${R * 1.15},${-R * 0.95} ${R * 1.05},${-R * 0.15}
              C${R * 0.75},${-R * 0.42} ${R * 0.35},${-R * 0.34} ${R * 0.05},${-R * 0.5}
              C${-R * 0.2},${-R * 0.4} ${-R * 0.35},${-R * 0.45} ${-R * 0.5},${-R * 0.95} Z`}
            fill={color}
          />
          {style === "long" ? (
            <path
              d={`M${-R * 1.0},${-R * 0.2} C${-R * 1.15},${R * 0.6} ${-R * 0.95 + sw},${R * 1.4} ${-R * 0.75 + sw},${R * 1.9}
                C${-R * 0.7},${R * 1.2} ${-R * 0.72},${R * 0.5} ${-R * 0.68},${R * 0.1} Z`}
              fill={color}
            />
          ) : null}
          {capHighlight}
        </g>
      );
    case "curly":
    case "afro": {
      const big = style === "afro";
      const circles = [] as React.ReactNode[];
      const n = big ? 9 : 10;
      for (let i = 0; i < n; i++) {
        const a = Math.PI * (1.0 + (i / (n - 1)) * 1.0);
        const rr = R * (big ? 1.05 : 0.98);
        circles.push(
          <circle
            key={i}
            cx={Math.cos(a) * rr}
            cy={Math.sin(a) * rr * 0.98 - R * 0.08}
            r={R * (big ? 0.3 : 0.26)}
          />,
        );
      }
      return (
        <g fill={color}>
          <path
            d={`M${-R * 0.98},${R * 0.1} C${-R * 1.1},${-R * 0.9} ${R * 0.9},${-R * 1.3} ${R * 0.98},${-R * 0.3} C${R * 0.4},${-R * 0.55} ${-R * 0.4},${-R * 0.55} ${-R * 0.7},${R * 0.1} Z`}
          />
          {circles}
        </g>
      );
    }
    case "ponytail":
    case "bun":
      return (
        <g>
          {cap}
          <path
            d={`M${-R * 0.2},${-R * 1.0} C${R * 0.4},${-R * 1.15} ${R * 1.05},${-R * 0.8} ${R * 1.0},${-R * 0.25} C${R * 0.6},${-R * 0.5} ${R * 0.2},${-R * 0.55} ${-R * 0.2},${-R * 1.0} Z`}
            fill={color}
          />
          {capHighlight}
        </g>
      );
    case "short":
    default:
      return (
        <g>
          {cap}
          <path
            d={`M${R * 0.2},${-R * 1.05} Q${R * 0.75},${-R * 0.85} ${R * 0.92},${-R * 0.45} Q${R * 0.55},${-R * 0.62} ${R * 0.15},${-R * 0.6} Z`}
            fill={color}
          />
          {capHighlight}
        </g>
      );
  }
};
