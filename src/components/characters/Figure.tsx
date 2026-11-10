import React from "react";
import { darken, lighten } from "../../utils/color";
import type { CharacterLook } from "../../utils/schema";
import { add, dir, smoothPath, useSvgId, type Pt } from "../../utils/svg";
import { getBuild, legLength } from "./builds";
import type { Face } from "./expressions";
import { Hair } from "./Hair";
import { Head } from "./Head";
import type { HandShape, Pose } from "./poses";

const LONG_SLEEVES = new Set(["hoodie", "shirt", "suit", "labcoat", "jacket", "spacesuit", "robe", "armor", "hivis"]);

export type FigureProps = {
  look: CharacterLook;
  pose: Pose;
  face: Face;
  talk: number;
  blink: number;
  lookX: number;
  /** -1..1 hair / cloth sway */
  sway: number;
  /** tint applied by scene lighting (multiply colour), "#ffffff" for none */
  light?: (c: string) => string;
};

const Hand: React.FC<{
  at: Pt;
  angle: number;
  r: number;
  shape: HandShape;
  color: string;
  line: string;
}> = ({ at, angle, r, shape, color, line }) => {
  const d = dir(angle);
  if (shape === "point") {
    const tip = add(at, d, r * 2.1);
    return (
      <g>
        <line x1={at[0]} y1={at[1]} x2={tip[0]} y2={tip[1]} stroke={color} strokeWidth={r * 0.75} strokeLinecap="round" />
        <circle cx={at[0]} cy={at[1]} r={r * 0.95} fill={color} stroke={line} strokeWidth={1.5} />
      </g>
    );
  }
  if (shape === "palm") {
    const c = add(at, d, r * 0.4);
    return (
      <g>
        <ellipse
          cx={c[0]}
          cy={c[1]}
          rx={r * 0.85}
          ry={r * 1.25}
          transform={`rotate(${-angle} ${c[0]} ${c[1]})`}
          fill={color}
          stroke={line}
          strokeWidth={1.5}
        />
        <ellipse
          cx={c[0] + d[1] * r * 0.8}
          cy={c[1] - d[0] * r * 0.8}
          rx={r * 0.32}
          ry={r * 0.6}
          transform={`rotate(${-angle + 35} ${c[0] + d[1] * r * 0.8} ${c[1] - d[0] * r * 0.8})`}
          fill={color}
          stroke={line}
          strokeWidth={1.2}
        />
      </g>
    );
  }
  return (
    <circle
      cx={at[0]}
      cy={at[1]}
      r={shape === "fist" ? r * 0.95 : r}
      fill={color}
      stroke={line}
      strokeWidth={1.5}
    />
  );
};

export const Figure: React.FC<FigureProps> = ({
  look,
  pose,
  face,
  talk,
  blink,
  lookX,
  sway,
  light = (c) => c,
}) => {
  const b = getBuild(look.body);
  const gradTorso = useSvgId("gt");
  const gradHead = useSvgId("gh");
  const L = legLength(b);
  const R = b.headR;
  const outfit = look.outfit;

  const skin = light(look.skin);
  const skinBack = darken(skin, 0.12);
  const hairColor = light(look.hairColor);
  const top = light(
    outfit === "labcoat" ? "#f3f6f9" : outfit === "spacesuit" ? "#eef1f5" : outfit === "armor" ? "#b7c0ca" : look.top,
  );
  const inner = light(outfit === "labcoat" || outfit === "jacket" ? look.top : look.accent ?? "#ffffff");
  const bottom = light(outfit === "spacesuit" ? "#e3e7ed" : outfit === "armor" ? "#9aa4af" : look.bottom);
  const shoes = light(outfit === "spacesuit" ? "#c9ced6" : outfit === "armor" ? "#7d8691" : look.shoes);
  const accent = light(look.accent ?? "#e63946");
  const lineSkin = darken(skin, 0.35);

  const hipY = -L + pose.bodyY;
  const hipCenter: Pt = [0, hipY];
  const torsoTop = hipY - b.torso;
  const lean = pose.lean + b.stoop;

  const legW = outfit === "spacesuit" ? b.legW * 1.25 : b.legW;
  const armW = outfit === "spacesuit" ? b.armW * 1.3 : outfit === "robe" || outfit === "armor" ? b.armW * 1.25 : b.armW;
  const bareLegs = outfit === "dress";
  const longRobe = outfit === "robe";

  // ------------------------------------------------------------ legs
  const leg = (side: "back" | "front") => {
    const [h, k] = side === "back" ? pose.legBack : pose.legFront;
    const hip: Pt = [side === "back" ? -b.hipW * 0.2 : b.hipW * 0.2, hipY];
    const knee = add(hip, dir(h), b.thigh);
    const shinA = h - k;
    const ankle = add(knee, dir(shinA), b.shin);
    const footA = Math.max(-35, Math.min(45, shinA * 0.45));
    const dark = side === "back" ? 0.16 : 0;
    const pant = darken(bareLegs ? skin : bottom, dark);
    const shoe = darken(shoes, dark);
    const fl = b.ankle + 4;
    const footLen = b.legW * 1.45;
    return (
      <g key={side}>
        <path
          d={`M${hip[0]},${hip[1]} L${knee[0]},${knee[1]} L${ankle[0]},${ankle[1]}`}
          stroke={pant}
          strokeWidth={legW}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* shoe */}
        <g transform={`translate(${ankle[0]} ${ankle[1]}) rotate(${-footA})`}>
          <path
            d={`M${-legW * 0.45},${-4} Q${-legW * 0.6},${fl} ${-legW * 0.25},${fl}
              L${footLen},${fl} Q${footLen + 10},${fl - 2} ${footLen + 4},${fl - 12}
              Q${footLen * 0.6},${-6} ${legW * 0.3},${-8} Z`}
            fill={shoe}
          />
          <path d={`M${-legW * 0.3},${fl - 1} L${footLen + 2},${fl - 1}`} stroke={lighten(shoe, 0.35)} strokeWidth={3} strokeLinecap="round" />
        </g>
      </g>
    );
  };

  // ------------------------------------------------------------ arms
  const shoulderY = torsoTop + 16 - pose.shoulderLift;
  const arm = (side: "back" | "front") => {
    const [a, e] = side === "back" ? pose.armBack : pose.armFront;
    const sh: Pt = [side === "back" ? -b.shoulderW * 0.34 : b.shoulderW * 0.36, shoulderY];
    const elbow = add(sh, dir(a), b.upperArm);
    const fa = a + e;
    const wrist = add(elbow, dir(fa), b.foreArm);
    const dark = side === "back" ? 0.18 : 0;
    const sleeve = darken(top, dark);
    const hand = darken(outfit === "spacesuit" ? "#f6f7f9" : skin, dark);
    const long = LONG_SLEEVES.has(outfit);
    const midUpper = add(sh, dir(a), b.upperArm * 0.62);
    return (
      <g key={side}>
        <path
          d={`M${sh[0]},${sh[1]} L${elbow[0]},${elbow[1]} L${wrist[0]},${wrist[1]}`}
          stroke={long ? sleeve : darken(skin, dark)}
          strokeWidth={armW}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {!long ? (
          <path
            d={`M${sh[0]},${sh[1]} L${midUpper[0]},${midUpper[1]}`}
            stroke={sleeve}
            strokeWidth={armW + 6}
            strokeLinecap="round"
          />
        ) : (
          <circle cx={wrist[0]} cy={wrist[1]} r={armW * 0.52} fill={darken(sleeve, 0.12)} />
        )}
        {look.mark && side === "front" && !long ? (
          <g stroke={light(look.mark)} strokeWidth={Math.max(2, armW * 0.09)} strokeLinecap="round" fill="none" opacity={0.85}>
            {[0.2, 0.45, 0.7].map((k) => {
              const p = add(elbow, dir(fa), b.foreArm * k);
              const q = add(p, dir(fa + 35), armW * 0.32);
              const r2 = add(p, dir(fa - 35), armW * 0.32);
              return <path key={k} d={`M${q[0]},${q[1]} L${p[0]},${p[1]} L${r2[0]},${r2[1]}`} />;
            })}
          </g>
        ) : null}
        <Hand
          at={add(wrist, dir(fa), armW * 0.35)}
          angle={fa}
          r={armW * 0.58}
          shape={side === "back" ? pose.handBack : pose.handFront}
          color={hand}
          line={darken(lineSkin, dark)}
        />
      </g>
    );
  };

  // ------------------------------------------------------------ torso
  const sw = b.shoulderW / 2;
  const ww = b.waistW / 2;
  const hw = b.hipW / 2;
  const bel = b.belly * 16;
  const coatTail = outfit === "labcoat" ? b.thigh * 0.62 : outfit === "suit" ? 14 : outfit === "jacket" ? 8 : 6;
  const torsoPts: Pt[] = [
    [-12, torsoTop - 2],
    [-sw + 8, torsoTop + 4],
    [-sw, torsoTop + 30],
    [-sw + 4, torsoTop + 60],
    [-ww, torsoTop + b.torso * 0.66],
    [-hw - (coatTail > 20 ? 6 : 0), hipY + coatTail],
    [hw + (coatTail > 20 ? 8 : 0), hipY + coatTail],
    [ww + bel, torsoTop + b.torso * 0.62],
    [sw - 2 + bel * 0.3, torsoTop + 60],
    [sw, torsoTop + 30],
    [sw - 8, torsoTop + 4],
    [12, torsoTop - 2],
  ];
  const torsoD = smoothPath(torsoPts, true, 0.42);

  const neckW = R * 0.42;
  const headC: Pt = [R * 0.06, torsoTop - b.neck - R * 0.9 + pose.headLift];

  // skirt / robe / coat
  let skirt: React.ReactNode = null;
  if (outfit === "dress" || longRobe) {
    const hem = longRobe ? -b.ankle - 6 + pose.bodyY * 0.2 : hipY + b.thigh * 0.95;
    const flare = longRobe ? 26 : 34;
    skirt = (
      <path
        d={`M${-ww},${torsoTop + b.torso * 0.62}
          L${ww + bel},${torsoTop + b.torso * 0.62}
          Q${hw + flare * 0.6},${hipY + 20} ${hw + flare + sway * 6},${hem}
          Q${0},${hem + 10} ${-hw - flare + sway * 6},${hem}
          Q${-hw - flare * 0.6},${hipY + 20} ${-ww},${torsoTop + b.torso * 0.62} Z`}
        fill={top}
        stroke={darken(top, 0.18)}
        strokeWidth={2}
      />
    );
  }

  const details: React.ReactNode[] = [];
  const midY = torsoTop + b.torso * 0.5;
  switch (outfit) {
    case "tshirt":
      details.push(
        <path key="n" d={`M-18,${torsoTop - 1} Q2,${torsoTop + 18} 22,${torsoTop - 1}`} fill={skin} stroke={darken(top, 0.25)} strokeWidth={4} />,
      );
      break;
    case "hoodie":
      details.push(
        <path key="hood" d={`M-30,${torsoTop + 2} Q-4,${torsoTop + 26} 30,${torsoTop + 2}`} fill="none" stroke={darken(top, 0.25)} strokeWidth={8} strokeLinecap="round" />,
        <path key="pk" d={`M${-ww * 0.6},${hipY - 40} L${ww * 0.7},${hipY - 40} L${ww * 0.85},${hipY - 4} L${-ww * 0.75},${hipY - 4} Z`} fill={darken(top, 0.12)} />,
        <path key="s1" d={`M-6,${torsoTop + 16} L-9,${torsoTop + 50}`} stroke="#f1f1f1" strokeWidth={3} strokeLinecap="round" />,
        <path key="s2" d={`M10,${torsoTop + 16} L13,${torsoTop + 48}`} stroke="#f1f1f1" strokeWidth={3} strokeLinecap="round" />,
      );
      break;
    case "shirt":
      details.push(
        <path key="c1" d={`M-16,${torsoTop - 2} L2,${torsoTop + 18} L-4,${torsoTop + 4} Z`} fill={lighten(top, 0.35)} stroke={darken(top, 0.2)} strokeWidth={2} />,
        <path key="c2" d={`M20,${torsoTop - 2} L2,${torsoTop + 18} L10,${torsoTop + 4} Z`} fill={lighten(top, 0.35)} stroke={darken(top, 0.2)} strokeWidth={2} />,
        <path key="bl" d={`M2,${torsoTop + 18} L4,${hipY}`} stroke={darken(top, 0.18)} strokeWidth={2} />,
        ...[0, 1, 2, 3].map((i) => <circle key={"b" + i} cx={3.5 + i * 0.3} cy={torsoTop + 34 + i * 26} r={2.6} fill={darken(top, 0.3)} />),
      );
      break;
    case "suit":
    case "labcoat":
    case "jacket": {
      const vDepth = outfit === "labcoat" ? b.torso * 0.5 : b.torso * 0.48;
      details.push(
        <path key="v" d={`M-16,${torsoTop - 2} L22,${torsoTop - 2} L4,${torsoTop + vDepth} Z`} fill={outfit === "suit" ? "#f7f7f7" : inner} />,
      );
      if (outfit === "suit") {
        details.push(
          <path key="tie" d={`M1,${torsoTop + 6} L8,${torsoTop + 6} L10,${torsoTop + vDepth - 8} L4,${torsoTop + vDepth + 4} L-1,${torsoTop + vDepth - 8} Z`} fill={accent} />,
        );
      }
      details.push(
        <path key="l1" d={`M-16,${torsoTop - 2} L-4,${torsoTop + 30} L4,${torsoTop + vDepth}`} fill="none" stroke={darken(top, 0.22)} strokeWidth={4} strokeLinejoin="round" />,
        <path key="l2" d={`M22,${torsoTop - 2} L14,${torsoTop + 30} L4,${torsoTop + vDepth}`} fill="none" stroke={darken(top, 0.22)} strokeWidth={4} strokeLinejoin="round" />,
        <path key="cl" d={`M4,${torsoTop + vDepth} L${outfit === "labcoat" ? 8 : 4},${hipY + coatTail}`} stroke={darken(top, 0.2)} strokeWidth={3} />,
      );
      if (outfit === "labcoat") {
        details.push(
          <rect key="p1" x={ww * 0.25} y={hipY - 10} width={ww * 0.6} height={26} rx={4} fill="none" stroke={darken(top, 0.18)} strokeWidth={3} />,
          <rect key="p0" x={ww * 0.2} y={torsoTop + 40} width={22} height={16} rx={3} fill="none" stroke={darken(top, 0.18)} strokeWidth={3} />,
          <line key="pen" x1={ww * 0.2 + 7} y1={torsoTop + 32} x2={ww * 0.2 + 7} y2={torsoTop + 50} stroke={light("#3a86ff")} strokeWidth={4} strokeLinecap="round" />,
        );
      }
      if (outfit === "jacket") {
        details.push(<path key="z" d={`M-2,${torsoTop + 20} L-4,${hipY + coatTail}`} stroke={darken(top, 0.3)} strokeWidth={2} strokeDasharray="4 3" />);
      }
      break;
    }
    case "spacesuit":
      details.push(
        <rect key="panel" x={-ww * 0.55} y={midY - 22} width={ww * 1.2} height={46} rx={8} fill={light("#b8c2d1")} />,
        <circle key="l1" cx={-ww * 0.3} cy={midY} r={6} fill={accent} />,
        <circle key="l2" cx={-ww * 0.05} cy={midY} r={6} fill={light("#06d6a0")} />,
        <rect key="l3" x={ww * 0.1} y={midY - 8} width={ww * 0.45} height={16} rx={4} fill={light("#118ab2")} />,
        <rect key="belt" x={-hw - 2} y={hipY - 18} width={hw * 2 + 4} height={14} rx={6} fill={light("#9aa5b5")} />,
        <path key="collar" d={`M-34,${torsoTop + 2} Q4,${torsoTop + 22} 38,${torsoTop + 2}`} stroke={light("#9aa5b5")} strokeWidth={12} fill="none" strokeLinecap="round" />,
      );
      break;
    case "robe":
      details.push(
        <path key="drape" d={`M${-sw + 8},${torsoTop + 4} Q4,${midY + 10} ${ww},${hipY - 6}`} stroke={lighten(top, 0.2)} strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.8} />,
        <rect key="belt" x={-ww - 2} y={torsoTop + b.torso * 0.6} width={b.waistW + bel + 4} height={10} rx={4} fill={accent} />,
      );
      break;
    case "overalls":
      details.push(
        <path key="bib" d={`M${-ww * 0.6},${midY - 10} L${ww * 0.65},${midY - 10} L${ww + bel},${hipY + 8} L${-hw},${hipY + 8} Z`} fill={bottom} />,
        <line key="st1" x1={-ww * 0.5} y1={midY - 8} x2={-sw * 0.55} y2={torsoTop + 2} stroke={bottom} strokeWidth={7} />,
        <line key="st2" x1={ww * 0.55} y1={midY - 8} x2={sw * 0.6} y2={torsoTop + 2} stroke={bottom} strokeWidth={7} />,
        <circle key="bt1" cx={-ww * 0.48} cy={midY - 4} r={4} fill={light("#ffd166")} />,
        <circle key="bt2" cx={ww * 0.52} cy={midY - 4} r={4} fill={light("#ffd166")} />,
      );
      break;
    case "armor":
      details.push(
        ...[0.22, 0.44, 0.66].map((k) => <path key={"pl" + k} d={`M${-ww},${torsoTop + b.torso * k} Q4,${torsoTop + b.torso * k + 8} ${ww + bel},${torsoTop + b.torso * k}`} stroke={darken(top, 0.25)} strokeWidth={3} fill="none" />),
        <path key="tab" d={`M${-ww * 0.55},${torsoTop + 8} L${ww * 0.65},${torsoTop + 8} L${ww * 0.8},${hipY + 34} L${-ww * 0.7},${hipY + 34} Z`} fill={accent} stroke={darken(accent, 0.25)} strokeWidth={2} />,
        <path key="crs" d={`M4,${torsoTop + 26} L4,${hipY + 10} M${-ww * 0.35},${midY - 6} L${ww * 0.45},${midY - 6}`} stroke={light("#f4d35e")} strokeWidth={7} strokeLinecap="round" />,
        <rect key="belt" x={-hw - 2} y={hipY - 16} width={hw * 2 + 4} height={12} rx={4} fill={light("#5c4033")} />,
        <circle key="buck" cx={4} cy={hipY - 10} r={6} fill={light("#f4d35e")} />,
        <ellipse key="pa" cx={sw * 0.55} cy={torsoTop + 6} rx={sw * 0.42} ry={b.torso * 0.12} fill={lighten(top, 0.12)} stroke={darken(top, 0.3)} strokeWidth={3} />,
      );
      break;
    case "hivis": {
      const vest = light(look.accent ?? "#d4ff3a");
      details.push(
        <path key="vl" d={`M${-ww},${torsoTop + 4} L-10,${torsoTop + 4} L-6,${hipY + 6} L${-hw},${hipY + 6} Z`} fill={vest} />,
        <path key="vr" d={`M18,${torsoTop + 4} L${ww + bel},${torsoTop + 4} L${ww + bel + 4},${hipY + 6} L14,${hipY + 6} Z`} fill={vest} />,
        ...[midY, hipY - 22].map((y, i) => <rect key={"rf" + i} x={-hw} y={y} width={hw * 2 + 4} height={9} fill={light("#e9eef2")} opacity={0.95} />),
      );
      break;
    }
    default:
      break;
  }

  const hairBack = (
    <g transform={`translate(${headC[0]} ${headC[1]}) rotate(${pose.headTilt})`}>
      <Hair style={look.hair} color={hairColor} R={R} layer="back" sway={sway} />
    </g>
  );

  return (
    <g>
      <defs>
        <linearGradient id={gradTorso} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity={0.22} />
          <stop offset="0.45" stopColor="#000" stopOpacity={0} />
          <stop offset="0.85" stopColor="#fff" stopOpacity={0.06} />
          <stop offset="1" stopColor="#000" stopOpacity={0.12} />
        </linearGradient>
        <radialGradient id={gradHead} cx="0.62" cy="0.38" r="0.75">
          <stop offset="0.55" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.16} />
        </radialGradient>
      </defs>

      <g transform={`rotate(${lean} ${hipCenter[0]} ${hipCenter[1]})`}>
        {arm("back")}
        {hairBack}
      </g>
      {leg("back")}
      {leg("front")}
      <g transform={`rotate(${lean} ${hipCenter[0]} ${hipCenter[1]})`}>
        {outfit === "hoodie" ? (
          <ellipse cx={-10} cy={torsoTop - 6} rx={R * 0.75} ry={R * 0.4} fill={darken(top, 0.18)} />
        ) : null}
        {/* neck */}
        <rect x={headC[0] - neckW / 2 - 4} y={torsoTop - b.neck - 18} width={neckW} height={b.neck + 30} rx={neckW / 3} fill={skinBack} />
        <path d={torsoD} fill={top} />
        {skirt}
        <path d={torsoD} fill={`url(#${gradTorso})`} />
        {details}
        <g transform={`translate(${headC[0]} ${headC[1]}) rotate(${pose.headTilt})`}>
          <Head
            R={R}
            skin={skin}
            hairColor={hairColor}
            eyeColor={look.eyeColor}
            eyeColor2={look.eyeColor2}
            sockets={look.sockets}
            face={face}
            talk={talk}
            blink={blink}
            lookX={lookX}
            lookY={pose.lookY}
            glasses={look.glasses}
            beard={look.beard}
            gradId={gradHead}
          />
          <Hair style={look.hair} color={hairColor} R={R} layer="front" sway={sway} />
          {look.hairStreak && look.hair !== "bald" ? (
            <path d={`M${R * 0.12},${-R * 1.0} Q${R * 0.36},${-R * 0.8} ${R * 0.3},${-R * 0.48}`} stroke={light(look.hairStreak)} strokeWidth={R * 0.16} strokeLinecap="round" fill="none" opacity={0.95} />
          ) : null}
          {look.mask ? (
            <g>
              <path d={`M${-R * 0.82},${R * 0.05} L${-R * 0.42},${R * 0.3} M${-R * 0.82},${R * 0.2} L${-R * 0.42},${R * 0.62}`} stroke={light("#dfe9f1")} strokeWidth={R * 0.05} />
              <path d={`M${-R * 0.45},${R * 0.18} Q${R * 0.3},${R * 0.08} ${R * 1.02},${R * 0.2} Q${R * 0.98},${R * 0.7} ${R * 0.35},${R * 0.92} Q${-R * 0.2},${R * 0.92} ${-R * 0.45},${R * 0.7} Z`} fill={light("#a8d8f0")} stroke={light("#7fb8d6")} strokeWidth={R * 0.03} />
              {[0.36, 0.52, 0.68].map((k) => <path key={k} d={`M${-R * 0.35},${R * k} Q${R * 0.3},${R * (k - 0.04)} ${R * 0.95},${R * k}`} stroke={light("#7fb8d6")} strokeWidth={R * 0.02} fill="none" />)}
            </g>
          ) : null}
          {look.headwear === "crown" ? (
            <g transform={`translate(0 ${-R * 0.92})`}>
              <path d={`M${-R * 0.75},0 L${-R * 0.85},${-R * 0.62} L${-R * 0.4},${-R * 0.28} L0,${-R * 0.75} L${R * 0.4},${-R * 0.28} L${R * 0.85},${-R * 0.62} L${R * 0.75},0 Z`} fill={light("#f4c430")} stroke={light("#b8860b")} strokeWidth={R * 0.04} strokeLinejoin="round" />
              <rect x={-R * 0.78} y={-R * 0.14} width={R * 1.56} height={R * 0.18} rx={R * 0.05} fill={light("#e0a800")} />
              {[-0.45, 0, 0.45].map((k, i) => <circle key={k} cx={R * k} cy={-R * 0.05} r={R * 0.07} fill={light(["#e63946", "#3a86ff", "#2a9d8f"][i])} />)}
              {[-0.85, 0, 0.85].map((k) => <circle key={"t" + k} cx={R * k} cy={k === 0 ? -R * 0.78 : -R * 0.65} r={R * 0.07} fill={light("#fff3b0")} />)}
            </g>
          ) : look.headwear === "helmet" ? (
            <g>
              <path d={`M${-R * 1.02},${R * 0.05} Q${-R * 1.05},${-R * 1.15} ${R * 0.05},${-R * 1.12} Q${R * 1.08},${-R * 1.1} ${R * 1.04},${R * 0.0} L${R * 0.9},${-R * 0.25} Q${R * 0.1},${-R * 0.42} ${-R * 0.6},${-R * 0.2} Z`} fill={light("#a9b2bc")} stroke={darken(light("#a9b2bc"), 0.3)} strokeWidth={R * 0.04} />
              <rect x={R * 0.34} y={-R * 0.42} width={R * 0.14} height={R * 0.7} rx={R * 0.06} fill={light("#8d97a2")} />
              <path d={`M${-R * 0.6},${-R * 0.85} Q${R * 0.1},${-R * 1.0} ${R * 0.7},${-R * 0.8}`} stroke="#ffffff" strokeOpacity={0.45} strokeWidth={R * 0.08} fill="none" strokeLinecap="round" />
            </g>
          ) : look.headwear === "hardhat" || look.headwear === "cap" ? (
            <g>
              <path d={`M${-R * 0.95},${-R * 0.35} Q${-R * 0.9},${-R * 1.2} ${R * 0.1},${-R * 1.15} Q${R * 0.95},${-R * 1.1} ${R * 0.95},${-R * 0.4} Z`} fill={light(look.headwear === "hardhat" ? "#ffcc00" : look.accent ?? "#e63946")} />
              <path d={`M${-R * 1.05},${-R * 0.36} L${R * (look.headwear === "cap" ? 1.55 : 1.1)},${-R * 0.36}`} stroke={darken(light(look.headwear === "hardhat" ? "#ffcc00" : look.accent ?? "#e63946"), 0.2)} strokeWidth={R * 0.14} strokeLinecap="round" />
              {look.headwear === "hardhat" ? <path d={`M0,${-R * 1.15} L0,${-R * 0.42}`} stroke={light("#e6b800")} strokeWidth={R * 0.16} /> : null}
            </g>
          ) : null}
          {outfit === "spacesuit" ? (
            <g>
              <circle cx={R * 0.05} cy={R * 0.02} r={R * 1.42} fill={light("#bfe3ff")} fillOpacity={0.18} stroke={light("#dfe6ee")} strokeWidth={10} />
              <path d={`M${-R * 0.6},${-R * 0.95} Q${-R * 0.1},${-R * 1.3} ${R * 0.5},${-R * 1.1}`} stroke="#ffffff" strokeOpacity={0.7} strokeWidth={R * 0.12} fill="none" strokeLinecap="round" />
            </g>
          ) : null}
        </g>
        {arm("front")}
      </g>
    </g>
  );
};
