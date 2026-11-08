import React from "react";
import { darken, lighten, mix } from "../../utils/color";
import { smoothPath, type Pt } from "../../utils/svg";
import type { Face } from "./expressions";

export type HeadProps = {
  R: number;
  skin: string;
  hairColor: string;
  eyeColor: string;
  face: Face;
  /** 0..1 talking mouth openness */
  talk: number;
  /** 0 open … 1 fully closed */
  blink: number;
  lookX: number;
  lookY: number;
  glasses: boolean;
  beard: boolean;
  gradId: string;
};

const Eye: React.FC<{
  cx: number;
  cy: number;
  R: number;
  open: number;
  happy: number;
  narrow: number;
  lookX: number;
  lookY: number;
  eyeColor: string;
  line: string;
}> = ({ cx, cy, R, open, happy, narrow, lookX, lookY, eyeColor, line }) => {
  const rx = R * 0.155 * narrow;
  const ry = R * 0.2;
  if (happy > 0.5 || open < 0.12) {
    // closed / happy arc
    const up = happy > 0.5 ? -1 : 1;
    return (
      <path
        d={`M${cx - rx},${cy} Q${cx},${cy + up * ry * 0.75} ${cx + rx},${cy}`}
        stroke={line}
        strokeWidth={R * 0.055}
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  const o = Math.min(1.3, open);
  const iy = cy + lookY * R * 0.06;
  const ix = cx + lookX * R * 0.06;
  const irisR = R * 0.105 * Math.min(1, 0.6 + o * 0.4);
  const eyeRy = ry * o;
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={eyeRy} fill="#ffffff" stroke={line} strokeWidth={R * 0.03} />
      <ellipse cx={ix} cy={iy} rx={irisR * narrow} ry={Math.min(irisR, eyeRy * 0.95)} fill={eyeColor} />
      <ellipse cx={ix} cy={iy} rx={irisR * 0.55 * narrow} ry={Math.min(irisR * 0.55, eyeRy * 0.6)} fill="#0b0b10" />
      <circle cx={ix - irisR * 0.35} cy={iy - irisR * 0.4} r={irisR * 0.32} fill="#ffffff" />
      {/* upper lid line */}
      <path
        d={`M${cx - rx * 1.05},${cy - eyeRy * 0.2} Q${cx},${cy - eyeRy * 1.25} ${cx + rx * 1.1},${cy - eyeRy * 0.35}`}
        stroke={line}
        strokeWidth={R * 0.05}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
};

export const Head: React.FC<HeadProps> = ({
  R,
  skin,
  hairColor,
  eyeColor,
  face,
  talk,
  blink,
  lookX,
  lookY,
  glasses,
  beard,
  gradId,
}) => {
  const line = darken(mix(skin, "#3b1d14", 0.5), 0.35);
  const skinShade = darken(skin, 0.14);
  const fx = R * 0.16;
  const headPts: Pt[] = [
    [0, -R * 1.0],
    [R * 0.76, -R * 0.78],
    [R * 0.99, -R * 0.12],
    [R * 0.88, R * 0.48],
    [R * 0.45, R * 0.9],
    [-R * 0.12, R * 0.98],
    [-R * 0.68, R * 0.74],
    [-R * 0.96, R * 0.1],
    [-R * 0.82, -R * 0.68],
  ];
  const open = face.eyeOpen * (1 - blink);
  const eyeY = -R * 0.04;
  const nearX = fx + R * 0.34;
  const farX = fx - R * 0.3;
  const browY = eyeY - R * 0.33 + face.browY * R;
  const browCol = darken(hairColor, 0.15);
  const browLen = R * 0.17;
  const tilt = face.browTilt * R * 0.08;

  // mouth
  const mo = Math.max(0, Math.min(1, face.mouthOpen + talk * (1 - face.mouthOpen * 0.5)));
  const mx = fx + R * 0.08 + face.mouthShift * R;
  const my = R * 0.47;
  const mw = face.mouthW * R * (1 - mo * 0.25);
  const curve = face.mouthCurve;
  let mouth: React.ReactNode;
  if (mo < 0.07) {
    mouth = (
      <path
        d={`M${mx - mw},${my - curve * R * 0.03} Q${mx},${my + curve * R * 0.17} ${mx + mw},${my - curve * R * 0.05}`}
        stroke={line}
        strokeWidth={R * 0.06}
        strokeLinecap="round"
        fill="none"
      />
    );
  } else {
    const h = mo * R * 0.36;
    const top = my - curve * R * 0.02;
    mouth = (
      <g>
        <path
          d={`M${mx - mw},${top} Q${mx},${top + curve * R * 0.05 - h * 0.12} ${mx + mw},${top}
            Q${mx + mw * 0.2},${top + h + curve * R * 0.12} ${mx},${top + h + curve * R * 0.1}
            Q${mx - mw * 0.2},${top + h + curve * R * 0.12} ${mx - mw},${top} Z`}
          fill="#5b1a22"
          stroke={line}
          strokeWidth={R * 0.035}
          strokeLinejoin="round"
        />
        {mo > 0.25 ? (
          <path
            d={`M${mx - mw * 0.75},${top + h * 0.06} Q${mx},${top + h * 0.2} ${mx + mw * 0.75},${top + h * 0.06}`}
            stroke="#ffffff"
            strokeWidth={Math.min(h * 0.22, R * 0.07)}
            strokeLinecap="round"
            fill="none"
          />
        ) : null}
        {mo > 0.3 ? (
          <ellipse cx={mx} cy={top + h * 0.78} rx={mw * 0.45} ry={h * 0.18} fill="#e8707a" />
        ) : null}
      </g>
    );
  }

  return (
    <g>
      {/* ear (visible on the back side in 3/4 view) */}
      <ellipse cx={-R * 0.84} cy={R * 0.1} rx={R * 0.17} ry={R * 0.25} fill={skin} />
      <ellipse cx={-R * 0.84} cy={R * 0.1} rx={R * 0.08} ry={R * 0.14} fill={skinShade} />
      {/* skull */}
      <path d={smoothPath(headPts)} fill={skin} />
      <path d={smoothPath(headPts)} fill={`url(#${gradId})`} />
      {beard ? (
        <path
          d={`M${-R * 0.72},${R * 0.2} C${-R * 0.6},${R * 1.15} ${R * 0.75},${R * 1.2} ${R * 0.9},${R * 0.3}
            C${R * 0.7},${R * 0.55} ${R * 0.4},${R * 0.62} ${mx},${R * 0.62}
            C${-R * 0.1},${R * 0.62} ${-R * 0.45},${R * 0.55} ${-R * 0.72},${R * 0.2} Z`}
          fill={hairColor}
        />
      ) : null}
      {/* cheeks */}
      <ellipse cx={nearX + R * 0.08} cy={R * 0.3} rx={R * 0.15} ry={R * 0.09} fill="#ff6b6b" opacity={0.18 + face.blush * 0.22} />
      <ellipse cx={farX - R * 0.12} cy={R * 0.3} rx={R * 0.11} ry={R * 0.08} fill="#ff6b6b" opacity={0.12 + face.blush * 0.18} />
      {/* eyes */}
      <Eye cx={farX} cy={eyeY} R={R} open={open} happy={face.happyEyes} narrow={0.84} lookX={lookX} lookY={lookY + face.lookY} eyeColor={eyeColor} line={line} />
      <Eye cx={nearX} cy={eyeY} R={R} open={face.wink > 0.5 ? 0 : open} happy={face.wink > 0.5 ? 1 : face.happyEyes} narrow={1} lookX={lookX} lookY={lookY + face.lookY} eyeColor={eyeColor} line={line} />
      {/* brows */}
      <path
        d={`M${farX - browLen},${browY - tilt * 0.2} L${farX + browLen},${browY - tilt}`}
        stroke={browCol}
        strokeWidth={R * 0.075}
        strokeLinecap="round"
      />
      <path
        d={`M${nearX - browLen},${browY - tilt} L${nearX + browLen},${browY - tilt * 0.2}`}
        stroke={browCol}
        strokeWidth={R * 0.075}
        strokeLinecap="round"
      />
      {/* nose */}
      <path
        d={`M${fx + R * 0.1},${R * 0.06} Q${fx + R * 0.26},${R * 0.27} ${fx + R * 0.04},${R * 0.29}`}
        stroke={skinShade}
        strokeWidth={R * 0.055}
        strokeLinecap="round"
        fill="none"
      />
      {mouth}
      {glasses ? (
        <g fill={lighten("#9fd3ff", 0.5)} fillOpacity={0.18} stroke="#1f2230" strokeWidth={R * 0.05}>
          <rect x={farX - R * 0.22} y={eyeY - R * 0.2} width={R * 0.42} height={R * 0.38} rx={R * 0.12} />
          <rect x={nearX - R * 0.23} y={eyeY - R * 0.2} width={R * 0.48} height={R * 0.38} rx={R * 0.12} />
          <path d={`M${farX + R * 0.2},${eyeY - R * 0.05} Q${(farX + nearX) / 2},${eyeY - R * 0.12} ${nearX - R * 0.23},${eyeY - R * 0.05}`} fill="none" />
          <path d={`M${farX - R * 0.22},${eyeY - R * 0.04} L${-R * 0.8},${-R * 0.02}`} fill="none" />
        </g>
      ) : null}
    </g>
  );
};
