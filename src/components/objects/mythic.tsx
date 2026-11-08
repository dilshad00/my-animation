import React from "react";
import { random } from "remotion";
import { darken, lighten, withAlpha } from "../../utils/color";
import { tweenNum } from "../../utils/tween";
import { useSvgId } from "../../utils/svg";
import type { ObjectDef, ObjectProps } from "./types";
import { num, str } from "./types";

const INK = "#17110d";
const CLAY = "#c8703c";

/** Quad-copter drone (centre origin, ≈ 200×80). */
const Drone: React.FC<ObjectProps> = ({ t, color, L }) => {
  const body = L(color ?? "#3b4252");
  const spin = Math.abs(Math.sin(t * 40));
  return (
    <g>
      <rect x={-90} y={-14} width={180} height={8} rx={4} fill={L("#20242e")} />
      {[-88, 88].map((x) => (
        <g key={x}>
          <rect x={x - 6} y={-30} width={12} height={22} fill={L("#20242e")} />
          <ellipse cx={x} cy={-32} rx={18 + 42 * spin} ry={5} fill={L("#cfd6e4")} opacity={0.55} />
        </g>
      ))}
      <path d="M-46,-16 L46,-16 L58,14 Q0,34 -58,14 Z" fill={body} />
      <circle cx={0} cy={18} r={11} fill={L("#14171f")} />
      <circle cx={0} cy={18} r={4} fill="#ff4d4d" opacity={0.6 + 0.4 * Math.sin(t * 8)} />
    </g>
  );
};

/** Roof section with a slim lightning rod (ground origin, ≈ 420×420). */
const LightningRod: React.FC<ObjectProps> = ({ L }) => (
  <g>
    <path d="M-210,0 L-150,-110 L150,-110 L210,0 Z" fill={L("#7b3f2a")} />
    <rect x={-7} y={-410} width={14} height={302} fill={L("#c9cfd8")} />
    <path d="M-7,-410 L0,-446 L7,-410 Z" fill={L("#e8edf4")} />
    <path d="M0,-110 C40,-70 120,-60 190,0" fill="none" stroke={L("#b87333")} strokeWidth={7} />
  </g>
);

/** Fluted stone column (ground origin, ≈ 120×620). Props: { "broken": true, "height": 620 } */
const Column: React.FC<ObjectProps> = ({ props, L, color }) => {
  const h = num(props.height, 620);
  const c = L(color ?? "#d9cfb6");
  const shade = L(darken(color ?? "#d9cfb6", 0.22));
  const top = props.broken ? `L38,${-h + 26} L10,${-h + 4} L-16,${-h + 34} L-42,${-h + 12}` : `L40,${-h} L-40,${-h}`;
  return (
    <g>
      <rect x={-62} y={-26} width={124} height={26} rx={3} fill={shade} />
      <path d={`M-46,-26 L46,-26 ${top} Z`} fill={c} />
      {[-28, -12, 4, 20].map((x) => (
        <line key={x} x1={x} y1={-30} x2={x * 0.92} y2={-h + 38} stroke={shade} strokeWidth={5} opacity={0.65} />
      ))}
      {props.broken ? null : (
        <>
          <rect x={-58} y={-h - 18} width={116} height={22} rx={3} fill={c} />
          <rect x={-70} y={-h - 40} width={140} height={22} rx={3} fill={shade} />
        </>
      )}
    </g>
  );
};

/** Greek storage jar (ground origin, ≈ 240×400). Props: { "glow": 0..1, "lid": true }, color = glow colour */
const Jar: React.FC<ObjectProps> = ({ t, color, props, L }) => {
  const glow = tweenNum(props.glow, t, 0);
  const c = color ?? "#ffd166";
  return (
    <g>
      {glow > 0 ? <ellipse cx={0} cy={-200} rx={210} ry={260} fill={c} opacity={0.18 * glow} /> : null}
      <path d="M-60,-370 L60,-370 L50,-320 C150,-280 140,-90 50,0 L-50,0 C-140,-90 -150,-280 -50,-320 Z" fill={L(CLAY)} />
      <path d="M-122,-210 C-60,-190 60,-190 122,-210 L114,-150 C60,-132 -60,-132 -114,-150 Z" fill={L(INK)} />
      <rect x={-70} y={-386} width={140} height={20} rx={6} fill={L(INK)} />
      {glow > 0 ? <ellipse cx={0} cy={-376} rx={54} ry={9} fill={lighten(c, 0.4)} opacity={glow} /> : null}
    </g>
  );
};

/** A plain house door (ground origin, ≈ 300×600). Props: { "lit": 0..1, "open": 0..1 }, color = door colour */
const Door: React.FC<ObjectProps> = ({ t, color, props, L }) => {
  const lit = tweenNum(props.lit, t, 0);
  const open = tweenNum(props.open, t, 0);
  const door = L(color ?? "#6b4226");
  const frame = L(darken(color ?? "#6b4226", 0.35));
  return (
    <g>
      {lit > 0 ? <ellipse cx={0} cy={-280} rx={330} ry={420} fill="#ffcf8a" opacity={0.2 * lit} /> : null}
      <rect x={-150} y={-590} width={300} height={590} fill={frame} />
      <rect x={-130} y={-570} width={260} height={570} fill={lit > 0 ? "#ffd9a0" : "#17120f"} opacity={Math.max(0.5, lit)} />
      <g transform={`translate(-130 0) scale(${1 - open * 0.85} 1)`}>
        <rect x={0} y={-570} width={260} height={570} fill={door} />
        <rect x={32} y={-530} width={196} height={190} rx={6} fill={L(lighten(color ?? "#6b4226", 0.1))} />
        <rect x={32} y={-300} width={196} height={260} rx={6} fill={L(lighten(color ?? "#6b4226", 0.1))} />
        <circle cx={226} cy={-290} r={12} fill={L("#d4af37")} />
      </g>
    </g>
  );
};

/** Simple round bowl (ground origin, ≈ 180×80). Props: { "steam": true } */
const Bowl: React.FC<ObjectProps> = ({ t, color, props, L }) => (
  <g>
    <ellipse cx={0} cy={-68} rx={92} ry={18} fill={L("#e9dcc3")} />
    <ellipse cx={0} cy={-68} rx={78} ry={12} fill={L("#b5743a")} />
    <path d="M-92,-68 C-84,-10 -40,0 0,0 C40,0 84,-10 92,-68 Z" fill={L(color ?? "#d7c7a7")} />
    {props.steam
      ? [-34, 0, 34].map((x, i) => {
          const k = (t * 0.5 + i * 0.33) % 1;
          return <path key={x} d={`M${x},${-84 - k * 90} q14,-22 0,-44 q-14,-22 0,-44`} fill="none" stroke="#ffffff" strokeWidth={5} opacity={0.3 * (1 - k)} strokeLinecap="round" />;
        })
      : null}
  </g>
);

/** Domed covered dish, never shows what is inside (ground origin, ≈ 280×170). */
const CoveredDish: React.FC<ObjectProps> = ({ L }) => (
  <g>
    <ellipse cx={0} cy={-8} rx={140} ry={16} fill={L("#a68a4f")} />
    <path d="M-110,-14 C-100,-140 100,-140 110,-14 Z" fill={L("#c9a227")} />
    <circle cx={0} cy={-122} r={13} fill={L("#e7c75a")} />
  </g>
);

/** Stone in swaddling cloth (centre origin, ≈ 200×130). */
const ClothStone: React.FC<ObjectProps> = ({ L }) => (
  <g>
    <ellipse cx={0} cy={0} rx={100} ry={64} fill={L("#efe3c8")} />
    <path d="M-92,-20 C-30,30 40,-40 94,18 M-82,34 C-20,-20 40,50 82,-34" fill="none" stroke={L("#c4b28c")} strokeWidth={8} />
    <ellipse cx={18} cy={-46} rx={38} ry={20} fill={L("#6d6a66")} />
  </g>
);

/** Classical thunderbolt (centre origin, ≈ 180×460). color = glow */
const Thunderbolt: React.FC<ObjectProps> = ({ t, color }) => {
  const c = color ?? "#fff1a8";
  const pulse = 0.75 + 0.25 * Math.sin(t * 14);
  const d = "M30,-230 L-60,-20 L4,-20 L-34,230 L74,-58 L10,-58 L56,-230 Z";
  return (
    <g>
      <ellipse cx={0} cy={0} rx={190} ry={320} fill={c} opacity={0.2 * pulse} />
      <path d={d} fill="none" stroke={c} strokeWidth={26} opacity={0.35 * pulse} strokeLinejoin="round" />
      <path d={d} fill="#ffffff" stroke={c} strokeWidth={5} strokeLinejoin="round" />
    </g>
  );
};

/** Bronze trident (ground origin, ≈ 160×640). */
const Trident: React.FC<ObjectProps> = ({ L, color }) => {
  const c = L(color ?? "#c9a227");
  return (
    <g fill={c}>
      <rect x={-7} y={-540} width={14} height={540} />
      <path d="M-70,-540 L70,-540 L70,-520 L-70,-520 Z" />
      <path d="M-70,-540 L-70,-610 L-86,-610 L-64,-650 L-44,-610 L-56,-610 L-56,-540 Z" />
      <path d="M56,-540 L56,-610 L44,-610 L64,-650 L86,-610 L70,-610 L70,-540 Z" />
      <path d="M-8,-540 L-8,-630 L-22,-630 L0,-680 L22,-630 L8,-630 L8,-540 Z" />
    </g>
  );
};

/** Wall-mounted security camera (centre origin, ≈ 220×130). */
const Cctv: React.FC<ObjectProps> = ({ t, L }) => (
  <g transform={`rotate(${Math.sin(t * 0.8) * 7})`}>
    <rect x={-20} y={-74} width={40} height={36} fill={L("#555d6b")} />
    <rect x={-104} y={-42} width={190} height={70} rx={10} fill={L("#e4e8ee")} />
    <rect x={84} y={-30} width={22} height={46} rx={4} fill={L("#2a2f3a")} />
    <circle cx={-82} cy={-26} r={6} fill="#ff3b3b" opacity={0.55 + 0.45 * Math.sin(t * 6)} />
  </g>
);

/** Small stone altar (ground origin, ≈ 240×180). */
const Altar: React.FC<ObjectProps> = ({ L }) => (
  <g>
    <rect x={-120} y={-24} width={240} height={24} fill={L("#a79f8c")} />
    <rect x={-92} y={-136} width={184} height={112} fill={L("#c7bea8")} />
    <rect x={-112} y={-160} width={224} height={24} fill={L("#a79f8c")} />
  </g>
);

/** Soft glowing orb of light (centre origin). Props: { "r": 60 }, color */
const LightOrb: React.FC<ObjectProps> = ({ t, color, props }) => {
  const r = num(props.r, 60);
  const c = color ?? "#ffe9a8";
  const pulse = 0.85 + 0.15 * Math.sin(t * 3);
  return (
    <g>
      <circle r={r * 3 * pulse} fill={c} opacity={0.14} />
      <circle r={r * 1.7 * pulse} fill={c} opacity={0.28} />
      <circle r={r} fill={lighten(c, 0.5)} />
    </g>
  );
};

/** Billowing storm mass that opens and closes like a hand (centre origin, ≈ 1200×420). */
const StormHand: React.FC<ObjectProps> = ({ t, color, L }) => {
  const c = L(color ?? "#3c4358");
  const open = 0.5 + 0.5 * Math.sin(t * 1.4);
  return (
    <g>
      {[-3, -2, -1, 0, 1, 2, 3].map((i) => {
        const a = (i * (9 + open * 13) * Math.PI) / 180;
        const len = 340 + (3 - Math.abs(i)) * 30;
        return (
          <g key={i} transform={`rotate(${(a * 180) / Math.PI})`}>
            <ellipse cx={0} cy={len * 0.55} rx={80} ry={len * 0.55} fill={c} />
            <circle cx={0} cy={len} r={82} fill={L(lighten(color ?? "#3c4358", 0.08))} />
          </g>
        );
      })}
      <ellipse cx={0} cy={-20} rx={360} ry={140} fill={c} />
    </g>
  );
};

/** Colossal dark crowned silhouette with burning eyes (ground origin, ≈ 800×1040). Props: { "eyes": "#ffb703", "crown": true } */
const ShadowKing: React.FC<ObjectProps> = ({ t, color, props }) => {
  const c = color ?? "#120d0b";
  const eye = str(props.eyes, "#ffb703");
  const sway = Math.sin(t * 0.7) * 6;
  return (
    <g transform={`translate(${sway} 0)`}>
      <path d="M-400,0 C-380,-420 -300,-650 -130,-700 L130,-700 C300,-650 380,-420 400,0 Z" fill={c} />
      <ellipse cx={0} cy={-810} rx={140} ry={160} fill={c} />
      {props.crown === false ? null : <path d="M-126,-930 L-136,-1040 L-66,-970 L0,-1060 L66,-970 L136,-1040 L126,-930 Z" fill={c} />}
      <ellipse cx={-52} cy={-830} rx={18} ry={9} fill={eye} />
      <ellipse cx={52} cy={-830} rx={18} ry={9} fill={eye} />
    </g>
  );
};

/** Serpent-headed titan silhouette for Typhon (ground origin, ≈ 1100×1040). */
const Typhon: React.FC<ObjectProps> = ({ t, color }) => {
  const c = color ?? INK;
  return (
    <g>
      <path d="M-300,0 C-280,-360 -200,-560 0,-580 C200,-560 280,-360 300,0 Z" fill={c} />
      {Array.from({ length: 13 }).map((_, i) => {
        const x = -480 + i * 80;
        const w = Math.sin(t * 2 + i) * 34;
        const top = -660 - (6 - Math.abs(i - 6)) * 50;
        return (
          <g key={i}>
            <path d={`M${x * 0.42},-480 C${x * 0.7 + w},-540 ${x - w},${top + 110} ${x},${top}`} fill="none" stroke={c} strokeWidth={34} strokeLinecap="round" />
            <ellipse cx={x} cy={top} rx={40} ry={24} fill={c} />
            <circle cx={x + 16} cy={top - 5} r={5} fill="#ffb703" />
          </g>
        );
      })}
    </g>
  );
};

type Pose = "stand" | "raise" | "strike" | "reach" | "sit" | "walk";

/**
 * Black-figure vase painting (ground origin, ≈ 300×600) – the look of every GREEK MYTH scene.
 * Props: { "pose": stand|raise|strike|reach|sit|walk, "crown": bool, "helm": bool, "beard": bool, "long": bool, "eye": "#hex" }
 */
const VaseFigure: React.FC<ObjectProps> = ({ t, color, props, seed }) => {
  const c = color ?? INK;
  const pose = str(props.pose, "stand") as Pose;
  const inc = CLAY;
  const ph = random(seed) * 6;
  const swing = Math.sin(t * 2.4 + ph);
  const stroke = 30;
  const armEnd =
    pose === "raise" ? [96, -600 + swing * 8] : pose === "strike" ? [134 + swing * 30, -480 - swing * 70] : pose === "reach" ? [170, -390 + swing * 8] : [62, -270 + swing * 6];
  const legs =
    pose === "walk" || pose === "strike"
      ? [`M-10,-250 L${-70 - swing * 30},0`, `M10,-250 L${70 + swing * 30},0`]
      : pose === "sit"
        ? ["M-10,-200 L90,-190 L90,0", "M10,-200 L120,-190 L120,0"]
        : ["M-14,-250 L-30,0", "M14,-250 L30,0"];
  const lift = pose === "sit" ? 58 : 0;
  return (
    <g>
      <g fill="none" stroke={c} strokeLinecap="round" strokeLinejoin="round">
        {legs.map((d) => (
          <path key={d} d={d} strokeWidth={stroke} />
        ))}
      </g>
      <g transform={`translate(0 ${lift})`}>
        {props.long ? <path d="M-58,-420 L58,-420 L102,-20 L-102,-20 Z" fill={c} /> : null}
        <path d="M-66,-470 L66,-470 L38,-240 L-38,-240 Z" fill={c} />
        <path d={`M-58,-452 L-86,-330 L-62,-${260 - swing * 6}`} fill="none" stroke={c} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M58,-452 L${(58 + armEnd[0]) / 2 + 18},${(-452 + armEnd[1]) / 2} L${armEnd[0]},${armEnd[1]}`} fill="none" stroke={c} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
        <rect x={-17} y={-510} width={34} height={46} fill={c} />
        <ellipse cx={4} cy={-548} rx={48} ry={56} fill={c} />
        <path d="M46,-556 L74,-534 L46,-522 Z" fill={c} />
        {props.beard ? <path d="M18,-516 C40,-474 58,-458 50,-420 C20,-440 -8,-470 -8,-510 Z" fill={c} /> : null}
        <path d="M-42,-560 C-84,-540 -92,-470 -72,-430 C-44,-470 -38,-520 -24,-540 Z" fill={c} />
        <ellipse cx={22} cy={-554} rx={11} ry={5.5} fill={str(props.eye, "#f3d9a4")} />
        <circle cx={24} cy={-554} r={3} fill={c} />
        {props.crown ? <path d="M-44,-596 L-52,-650 L-20,-614 L6,-662 L30,-614 L60,-650 L50,-596 Z" fill={c} /> : null}
        {props.helm ? <path d="M-50,-580 C-40,-640 50,-640 54,-580 L-50,-580 Z M-30,-630 C-10,-720 60,-700 100,-610 C50,-660 10,-640 -30,-630 Z" fill={c} /> : null}
        <path d="M-40,-420 L40,-420 M-34,-370 L34,-370 M-30,-320 L30,-320" stroke={inc} strokeWidth={4} opacity={0.7} />
      </g>
    </g>
  );
};

const NUCLEAR_BLUE = "#a7e0ff";
/** Glowing warhead icon, deliberately abstract (centre origin, ≈ 70×190). */
const WarheadIcon: React.FC<ObjectProps> = ({ t, color }) => {
  const c = color ?? NUCLEAR_BLUE;
  const id = useSvgId("wh");
  return (
    <g opacity={0.8 + 0.2 * Math.sin(t * 4)}>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor={c} />
        </linearGradient>
      </defs>
      <path d="M0,-96 C34,-50 34,70 28,80 L40,96 L-40,96 L-28,80 C-34,70 -34,-50 0,-96 Z" fill={`url(#${id})`} />
      <circle r={82} fill={withAlpha(c, 0.14)} />
    </g>
  );
};

const def = (component: React.FC<ObjectProps>, w: number, h: number, description: string, anchor?: "center"): ObjectDef => ({
  component,
  w,
  h,
  category: "myth",
  description,
  anchor,
});

export const MYTHIC: Record<string, ObjectDef> = {
  drone: def(Drone, 200, 80, "Quad-copter drone", "center"),
  lightningrod: def(LightningRod, 420, 440, "Roof section with lightning rod"),
  column: def(Column, 130, 660, 'Fluted column. props: { "broken": true, "height": 620 }'),
  jar: def(Jar, 240, 400, 'Greek storage jar. props: { "glow": 0..1 (animatable) } color = glow'),
  door: def(Door, 300, 600, 'House door. props: { "lit": 0..1, "open": 0..1 } (animatable) color = door'),
  bowl: def(Bowl, 180, 90, 'Bowl. props: { "steam": true }'),
  covereddish: def(CoveredDish, 280, 170, "Domed covered dish"),
  clothstone: def(ClothStone, 200, 130, "Stone wrapped in cloth", "center"),
  thunderbolt: def(Thunderbolt, 180, 460, "Glowing classical thunderbolt. color = glow", "center"),
  trident: def(Trident, 160, 680, "Bronze trident"),
  cctv: def(Cctv, 220, 130, "Security camera", "center"),
  altar: def(Altar, 240, 180, "Small stone altar"),
  lightorb: def(LightOrb, 200, 200, 'Glowing orb. props: { "r": 60 } color', "center"),
  stormhand: def(StormHand, 1200, 800, "Storm mass that opens and closes like a hand", "center"),
  shadowking: def(ShadowKing, 800, 1060, 'Colossal crowned silhouette. props: { "eyes": "#hex", "crown": false }'),
  typhon: def(Typhon, 1100, 1040, "Serpent-headed titan silhouette"),
  vasefigure: def(VaseFigure, 300, 620, 'Black-figure vase painting. props: { "pose": stand|raise|strike|reach|sit|walk, "crown", "helm", "beard", "long", "eye" }'),
  warheadicon: def(WarheadIcon, 80, 200, "Abstract glowing warhead icon", "center"),
};
