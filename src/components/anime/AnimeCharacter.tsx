/**
 * Premium cel-shaded anime character (front view, head + shoulders).
 *
 * Drawn in a 1000×1200 box; head centre ≈ (500, 340), eyes at (428|572, 375),
 * bottom edge of the bust at y = 1200. Everything that moves is a prop so the
 * engine (or a hand-made shot) can direct the performance.
 *
 *   look      – colours, hair length, outfit, lashes, glasses, hair clip
 *   wind      – hair / ribbon sway (0 calm … 2 storm)
 *   blink     – 0 open … 1 closed        wink – right eye closed
 *   mouth     – 0 closed … 1 wide open (talking / shouting)
 *   mouthShape– closed-mouth shape: smile | flat | frown | o | grin
 *   eyes      – normal | happy (^ ^ arcs)
 *   brow      – -1 sad (outer lids droop) … 0 soft … 1 determined (inner lids slant)
 *   look2     – iris offset [x, y] in px      tilt – head roll (deg)
 *   pupil     – pupil scale (0.6 shocked … 1)  sweat – 0..1 anime sweat drop
 *   light     – sunset | night | day rim light
 *   detail    – iris striations + single lashes for extreme close-ups
 */
import React from "react";
import { lerp, mix } from "./palette";

export type AnimeHair = "long" | "medium" | "short";
export type AnimeOutfit = "sailor" | "gakuran" | "blazer" | "hoodie" | "casual";
export type MouthShape = "smile" | "flat" | "frown" | "o" | "grin";

export type AnimeLook = {
  hairColor: string;
  eyeColor: string;
  skin: string;
  hair: AnimeHair;
  outfit: AnimeOutfit;
  /** main outfit colour (collar / jacket / hoodie / t-shirt) */
  top: string;
  /** ribbon / tie colour */
  accent: string;
  /** long upper lashes + flick (feminine) or a plain lash line */
  lashes: boolean;
  clip: boolean;
  glasses: boolean;
};

export const HIKARI: AnimeLook = {
  hairColor: "#2b2f5c", eyeColor: "#6b3fd1", skin: "#ffe6d8", hair: "long", outfit: "sailor",
  top: "#1f2950", accent: "#e8344e", lashes: true, clip: true, glasses: false,
};

export type CharProps = {
  frame: number;
  look?: AnimeLook;
  wind?: number;
  blink?: number;
  wink?: boolean;
  mouth?: number;
  mouthShape?: MouthShape;
  eyes?: "normal" | "happy";
  brow?: number;
  look2?: [number, number];
  tilt?: number;
  light?: "sunset" | "night" | "day";
  detail?: boolean;
  pupil?: number;
  sweat?: number;
  blush?: number;
  id?: string;
};

const LINE = "#2a1830";
const WHITE = "#f7f6ff";
const WHITE_SHADE = "#c9c6e6";

/** Hair highlight: same hue, lifted lightness and saturation (navy → periwinkle, brown → caramel). */
const shineOf = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d > 0) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  const l = Math.min(0.78, (max + min) / 2 + 0.38);
  const s = d === 0 ? 0 : Math.max(0.55, d / (1 - Math.abs(max + min - 1)));
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [rr, gg, bb] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return `#${[rr, gg, bb].map((v) => Math.round((v + m) * 255).toString(16).padStart(2, "0")).join("")}`;
};

const palette = (look: AnimeLook) => ({
  hair: {
    base: look.hairColor,
    shadow: mix(look.hairColor, "#0a0820", 0.45),
    mid: mix(look.hairColor, "#ffffff", 0.14),
    shine: shineOf(look.hairColor),
  },
  eye: {
    dark: mix(look.eyeColor, "#0b0620", 0.65),
    mid: look.eyeColor,
    light: mix(look.eyeColor, "#ffffff", 0.35),
    glow: mix(look.eyeColor, "#ffffff", 0.78),
  },
  skin: {
    base: look.skin,
    shadow: mix(look.skin, "#d9786a", 0.38),
    deep: mix(look.skin, "#a8483d", 0.55),
    rim: mix(look.skin, "#ffd9a8", 0.5),
  },
});

/** Hair-length remap: points below the ear line are pulled up for shorter cuts. */
const lengthK: Record<AnimeHair, number> = { long: 1, medium: 0.5, short: 0.24 };

const windField = (frame: number, wind: number, k: number) => (x: number, y0: number, phase = 0) => {
  const y = y0 <= 330 ? y0 : 330 + (y0 - 330) * k;
  const d = Math.max(0, (y - 180) / 700);
  const wave = Math.sin(frame * 0.11 + phase + y * 0.012) * 0.45 + 0.75;
  const dx = wind * d * d * 120 * wave;
  const dy = -wind * d * 22 * Math.sin(frame * 0.09 + phase);
  return `${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}`;
};
type W = ReturnType<typeof windField>;

const FACE = "M352 290 C 348 380, 362 440, 405 492 C 435 527, 470 546, 500 549 C 530 546, 565 527, 595 492 C 638 440, 652 380, 648 290 C 640 175, 360 175, 352 290 Z";

/** Bangs outline: skull top then a zig-zag of curved tips (right → left). */
const bangsPath = (w: W) => {
  const pts: [number, number][] = [
    [650, 405], [624, 290], [600, 340], [576, 284], [550, 328], [528, 286], [510, 360],
    [488, 284], [464, 326], [440, 284], [412, 344], [392, 290], [352, 408],
  ];
  let d = `M340 262 C 322 140, 430 92, 500 92 C 570 92, 680 140, 662 262 L ${w(664, 330, 0)} Q ${w(670, 382, 0)} ${w(650, 405, 0)}`;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const toTip = i % 2 === 0;
    const bow = (bx + ax) / 2 > 500 ? 7 : -7;
    const cx = (ax + bx) / 2 + (toTip ? bow : -bow * 0.4);
    const cy = (ay + by) / 2 + (toTip ? -6 : 4);
    d += ` Q ${w(cx, cy, i)} ${w(bx, by, i)}`;
  }
  d += ` Q ${w(334, 362, 12)} ${w(338, 300, 12)} Z`;
  return d;
};

const backHairPath = (w: W, hair: AnimeHair) =>
  hair === "short"
    ? `M500 96 C 360 96, 268 190, 274 330 C 276 400, 290 440, ${w(300, 500, 1)} L ${w(332, 470, 2)} L ${w(346, 520, 3)} L ${w(380, 480, 4)} ` +
      `L 620 480 L ${w(654, 520, 5)} L ${w(668, 470, 6)} L ${w(700, 500, 7)} C 710 440, 724 400, 726 330 C 732 190, 640 96, 500 96 Z`
    : `M500 96 C 360 96, 268 190, 270 330 C ${w(272, 470)}, ${w(240, 600)}, ${w(188, 760)} ` +
      `L ${w(150, 900, 1)} L ${w(222, 852, 2)} L ${w(190, 990, 3)} L ${w(275, 900, 4)} L ${w(282, 1010, 5)} L ${w(340, 900, 6)} ` +
      `L ${w(660, 900)} L ${w(718, 1010, 7)} L ${w(735, 900, 8)} L ${w(812, 990, 9)} L ${w(790, 852, 10)} L ${w(862, 900, 11)} ` +
      `L ${w(812, 760)} C ${w(760, 600)}, ${w(728, 470)}, 730 330 C 732 190, 640 96, 500 96 Z`;

const sideLock = (w: W, side: 1 | -1) => {
  const X = (x: number) => 500 + (x - 500) * side;
  return (
    `M ${X(346)} 236 C ${X(318)} 340, ${w(X(316), 480, 1)}, ${w(X(326), 620, 2)} ` +
    `C ${w(X(332), 720, 3)}, ${w(X(316), 800, 3)}, ${w(X(292), 880, 4)} ` +
    `C ${w(X(340), 810, 4)}, ${w(X(356), 720, 3)}, ${w(X(362), 610, 2)} ` +
    `C ${w(X(368), 480, 1)}, ${X(372)} 360, ${X(388)} 262 Z`
  );
};

type EyeP = {
  cx: number; cy: number; m: 1 | -1; open: number; happy: boolean; look2: [number, number]; detail: boolean; frame: number;
  pupil: number; brow: number; light: string; id: string; lashes: boolean; pal: ReturnType<typeof palette>;
};

const Eye: React.FC<EyeP> = ({ cx, cy, m, open, happy, look2, detail, frame, pupil, brow, light, id, lashes, pal }) => {
  const E = pal.eye;
  const lx = look2[0] * m;
  const shimmer = Math.sin(frame * 0.25) * 1.2;
  const lidDrop = (1 - open) * 52;
  const ys = lashes ? 1 : 0.86;
  const SCLERA = "M-48 -18 C -32 -44, 26 -50, 46 -30 C 52 -6, 46 32, 24 46 C 2 56, -30 50, -42 30 C -50 14, -52 -4, -48 -18 Z";
  return (
    <g transform={`translate(${cx} ${cy}) scale(${m} ${ys})`}>
      <defs>
        <clipPath id={`${id}-eclip`}>
          <path d={SCLERA} />
        </clipPath>
        <clipPath id={`${id}-lid`}>
          <rect x={-80} y={-40 + lidDrop * 0.95} width={160} height={140} />
        </clipPath>
        <linearGradient id={`${id}-iris`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={E.dark} />
          <stop offset="0.45" stopColor={E.mid} />
          <stop offset="0.85" stopColor={E.light} />
          <stop offset="1" stopColor={E.glow} />
        </linearGradient>
      </defs>
      <path transform={`translate(0 ${-82 + brow * 10}) rotate(${brow * 14})`} d="M-44 4 C -20 -10, 14 -12, 40 -2" stroke={pal.hair.shadow} strokeWidth={5.5} fill="none" strokeLinecap="round" />
      {happy ? (
        <path d="M-48 14 C -30 -22, 22 -22, 42 10" stroke={LINE} strokeWidth={7} fill="none" strokeLinecap="round" />
      ) : open > 0.12 ? (
        <>
          <g clipPath={`url(#${id}-lid)`}>
            <g clipPath={`url(#${id}-eclip)`}>
              <path d={SCLERA} fill="#fbf7ff" />
              <path d="M-48 -18 C -32 -44, 26 -50, 46 -30 L 46 -5 C 20 -24, -30 -22, -48 0 Z" fill="#cfc6ee" opacity={0.8} />
              <g transform={`translate(${2 + lx} ${8 + look2[1]})`}>
                <ellipse rx={34} ry={44} fill={`url(#${id}-iris)`} />
                {detail &&
                  Array.from({ length: 28 }, (_, i) => {
                    const a = (i / 28) * Math.PI * 2;
                    return <line key={i} x1={Math.cos(a) * 14} y1={Math.sin(a) * 20} x2={Math.cos(a) * 31} y2={Math.sin(a) * 40} stroke={E.dark} strokeOpacity={0.25} strokeWidth={1} />;
                  })}
                <ellipse cy={-20} rx={34} ry={22} fill={E.dark} opacity={0.55} />
                <ellipse rx={13 * pupil} ry={21 * pupil} cy={-2} fill="#0d0826" />
                <ellipse rx={34} ry={44} fill="none" stroke={E.dark} strokeWidth={2.5} />
                <path d="M-24 22 C -14 38, 14 38, 24 22 C 14 30, -14 30, -24 22 Z" fill={E.glow} opacity={0.85} />
                <ellipse cx={14 * m} cy={22} rx={6} ry={2.5} fill={light} opacity={0.55} />
                <ellipse cx={-14 * m + shimmer} cy={-16} rx={10} ry={13} fill="#fff" />
                <circle cx={16 * m} cy={-4 + shimmer} r={4.5} fill="#fff" opacity={0.95} />
                {detail && <circle cx={-2 * m} cy={-30} r={2.5} fill="#fff" />}
              </g>
            </g>
          </g>
          <g transform={`translate(0 ${lidDrop * 0.92})`}>
            {lashes ? (
              <>
                <path d="M46 -30 C 22 -54, -30 -52, -52 -22 L -66 -12 L -54 -10 C -32 -38, 20 -42, 46 -22 Z" fill={LINE} />
                <path d="M-52 -22 L -70 -28 L -58 -16 Z" fill={LINE} />
              </>
            ) : (
              <path d="M46 -28 C 22 -50, -30 -50, -52 -20 L -54 -12 C -32 -38, 20 -40, 46 -22 Z" fill={LINE} />
            )}
            {detail && lashes &&
              [-40, -26, -12, 4].map((x, i) => (
                <path key={i} d={`M${x} ${-42 + i} q -8 -10 -18 -12`} stroke={LINE} strokeWidth={2.5} fill="none" strokeLinecap="round" />
              ))}
            <path d="M40 -32 C 20 -48, -20 -48, -40 -32" stroke="#6b3f6a" strokeWidth={2} fill="none" opacity={0.6} transform="translate(0 -9)" />
          </g>
          <path d="M-42 30 C -28 48, 8 54, 28 44" stroke={LINE} strokeWidth={3} fill="none" opacity={lashes ? 0.65 : 0.35} strokeLinecap="round" />
          {brow > 0.05 && (
            <g>
              <path d={`M-14 -58 L 60 ${-40 + brow * 26} L 60 -90 L -14 -90 Z`} fill={pal.skin.base} />
              <path d={`M-14 -58 L 52 ${-41 + brow * 25}`} stroke={LINE} strokeWidth={4 + brow * 4} strokeLinecap="round" />
            </g>
          )}
          {brow < -0.05 && (
            // sad / worried: outer lids droop
            <g>
              <path d={`M10 -60 L -66 ${-38 - brow * 22} L -66 -90 L 10 -90 Z`} fill={pal.skin.base} />
              <path d={`M10 -58 L -58 ${-39 - brow * 21}`} stroke={LINE} strokeWidth={4 - brow * 3} strokeLinecap="round" />
            </g>
          )}
        </>
      ) : (
        <>
          <path d="M-54 6 C -26 28, 22 28, 46 8" stroke={LINE} strokeWidth={7} fill="none" strokeLinecap="round" />
          {lashes && <path d="M-54 6 L -68 0" stroke={LINE} strokeWidth={5} strokeLinecap="round" />}
        </>
      )}
    </g>
  );
};

// ------------------------------------------------------------------- bodies
type BodyP = { look: AnimeLook; rim: string; sway: (p: number) => number; pal: ReturnType<typeof palette> };

const Neck: React.FC<{ pal: BodyP["pal"]; bottom?: number }> = ({ pal, bottom = 800 }) => (
  <>
    <path d={`M462 470 L 462 620 L 500 ${bottom} L 538 620 L 538 470 Z`} fill={pal.skin.base} />
    <path d="M462 505 C 480 552, 520 552, 538 505 L 538 600 C 520 585, 480 585, 462 600 Z" fill={pal.skin.shadow} />
  </>
);

const TORSO = "M465 600 C 420 640, 300 660, 240 690 C 190 715, 165 770, 155 860 L 140 1240 L 860 1240 L 845 860 C 835 770, 810 715, 760 690 C 700 660, 580 640, 535 600 Z";
const TORSO_SHADE = "M155 860 L 140 1240 L 330 1240 C 300 1080, 270 960, 250 820 Z";
const TORSO_RIM = "M845 860 C 835 770, 810 715, 760 690 L 790 760 C 805 800, 820 830, 845 860 Z";

const Sailor: React.FC<BodyP> = ({ look, rim, sway, pal }) => {
  const navyShade = mix(look.top, "#000010", 0.4);
  const scarfShade = mix(look.accent, "#200010", 0.35);
  return (
    <>
      <path d={TORSO} fill={WHITE} />
      <path d={TORSO_SHADE} fill={WHITE_SHADE} />
      <path d={TORSO_RIM} fill={rim} opacity={0.5} />
      <Neck pal={pal} />
      <path d="M462 600 L 250 690 C 262 730, 280 770, 300 800 L 500 890 L 700 800 C 720 770, 738 730, 750 690 L 538 600 C 526 660, 514 730, 500 800 C 486 730, 474 660, 462 600 Z" fill={look.top} />
      <path d="M250 690 C 262 730, 280 770, 300 800 L 500 890 L 500 860 L 320 780 C 300 760, 282 730, 270 700 Z" fill={navyShade} opacity={0.6} />
      <path d="M268 712 C 280 748, 294 772, 312 788 L 500 870 L 688 788 C 706 772, 720 748, 732 712" stroke={WHITE} strokeWidth={8} fill="none" />
      <path d="M282 704 C 292 734, 304 756, 320 770 L 500 848 L 680 770 C 696 756, 708 734, 718 704" stroke={WHITE} strokeWidth={3} fill="none" opacity={0.9} />
      <path d={`M488 820 C 470 880, ${450 + sway(0)} 960, ${438 + sway(0) * 1.6} 1030 L ${478 + sway(0) * 1.6} 1010 C ${488 + sway(0)} 950, 498 880, 500 830 Z`} fill={scarfShade} />
      <path d={`M512 820 C 530 880, ${560 + sway(1)} 960, ${574 + sway(1) * 1.6} 1036 L ${534 + sway(1) * 1.6} 1020 C ${524 + sway(1)} 950, 508 880, 500 830 Z`} fill={look.accent} />
      <path d={`M490 812 C 450 780, ${396 + sway(2) * 0.4} 770, ${392 + sway(2) * 0.4} 812 C 390 852, 450 846, 490 828 Z`} fill={look.accent} />
      <path d={`M510 812 C 550 780, ${604 + sway(3) * 0.4} 770, ${608 + sway(3) * 0.4} 812 C 610 852, 550 846, 510 828 Z`} fill={look.accent} />
      <path d="M420 800 C 440 795, 460 805, 480 816" stroke={scarfShade} strokeWidth={4} fill="none" />
      <path d="M580 800 C 560 795, 540 805, 520 816" stroke={scarfShade} strokeWidth={4} fill="none" />
      <rect x={482} y={804} width={36} height={34} rx={9} fill={scarfShade} />
      <rect x={486} y={806} width={20} height={10} rx={5} fill={mix(look.accent, "#ffffff", 0.35)} opacity={0.8} />
    </>
  );
};

const Gakuran: React.FC<BodyP> = ({ look, rim, pal }) => {
  const shade = mix(look.top, "#000000", 0.35);
  const hi = mix(look.top, "#ffffff", 0.18);
  return (
    <>
      <path d={TORSO} fill={look.top} />
      <path d={TORSO_SHADE} fill={shade} />
      <path d={TORSO_RIM} fill={rim} opacity={0.55} />
      <Neck pal={pal} bottom={640} />
      {/* stand collar */}
      <path d="M452 560 C 470 600, 530 600, 548 560 L 556 640 C 530 668, 470 668, 444 640 Z" fill={look.top} stroke={LINE} strokeWidth={2.5} strokeOpacity={0.5} />
      <path d="M452 600 C 478 624, 522 624, 548 600" stroke={hi} strokeWidth={3} fill="none" />
      <line x1={500} y1={655} x2={500} y2={1240} stroke={LINE} strokeWidth={3} strokeOpacity={0.5} />
      {[720, 820, 920, 1020, 1120].map((y) => (
        <g key={y}>
          <circle cx={500} cy={y} r={11} fill="#e8c35a" />
          <circle cx={497} cy={y - 3} r={4} fill="#fff4c4" />
        </g>
      ))}
      <path d="M240 690 C 300 720, 330 760, 340 830" stroke={hi} strokeWidth={4} fill="none" opacity={0.6} />
    </>
  );
};

const Blazer: React.FC<BodyP> = ({ look, rim, pal }) => {
  const shade = mix(look.top, "#000010", 0.35);
  const tieShade = mix(look.accent, "#200010", 0.35);
  return (
    <>
      <path d={TORSO} fill={look.top} />
      <path d={TORSO_SHADE} fill={shade} />
      <path d={TORSO_RIM} fill={rim} opacity={0.5} />
      {/* shirt V */}
      <path d="M440 590 L 560 590 L 540 900 L 500 960 L 460 900 Z" fill={WHITE} />
      <Neck pal={pal} bottom={650} />
      <path d="M452 600 L 500 680 L 548 600 L 560 625 L 500 700 L 440 625 Z" fill={WHITE} stroke={WHITE_SHADE} strokeWidth={2} />
      {/* tie */}
      <path d="M486 690 L 514 690 L 520 712 L 500 724 L 480 712 Z" fill={tieShade} />
      <path d="M484 718 L 516 718 L 530 920 L 500 960 L 470 920 Z" fill={look.accent} />
      <path d="M492 760 L 524 790 M488 830 L 528 868" stroke={tieShade} strokeWidth={6} />
      {/* lapels */}
      <path d="M440 600 L 380 680 L 430 720 L 405 760 L 470 960 L 500 1240 L 140 1240 L 155 860 C 165 770, 190 715, 240 690 C 300 660, 400 640, 440 600 Z" fill={look.top} />
      <path d="M560 600 L 620 680 L 570 720 L 595 760 L 530 960 L 500 1240 L 860 1240 L 845 860 C 835 770, 810 715, 760 690 C 700 660, 600 640, 560 600 Z" fill={look.top} />
      <path d="M440 600 L 380 680 L 430 720 L 405 760 L 470 960" stroke={shade} strokeWidth={4} fill="none" />
      <path d="M560 600 L 620 680 L 570 720 L 595 760 L 530 960" stroke={shade} strokeWidth={4} fill="none" />
      <path d="M155 860 L 140 1240 L 330 1240 C 300 1080, 270 960, 250 820 Z" fill={shade} />
      <path d={TORSO_RIM} fill={rim} opacity={0.5} />
      <g transform="translate(330 900)">
        <rect x={-40} y={-30} width={80} height={60} rx={6} fill={shade} />
        <path d="M-14 -16 L 14 -16 L 14 6 L 0 18 L -14 6 Z" fill="#e8c35a" />
      </g>
    </>
  );
};

const Hoodie: React.FC<BodyP> = ({ look, rim, sway, pal }) => {
  const shade = mix(look.top, "#000010", 0.32);
  const hi = mix(look.top, "#ffffff", 0.2);
  return (
    <>
      <path d={TORSO} fill={look.top} />
      <path d={TORSO_SHADE} fill={shade} />
      <path d={TORSO_RIM} fill={rim} opacity={0.5} />
      <Neck pal={pal} bottom={640} />
      {/* hood bunched around the neck */}
      <path d="M380 610 C 400 560, 600 560, 620 610 C 640 660, 600 700, 500 700 C 400 700, 360 660, 380 610 Z" fill={shade} />
      <path d="M420 612 C 450 650, 550 650, 580 612 C 570 660, 430 660, 420 612 Z" fill={mix(look.top, "#000010", 0.55)} />
      <path d="M380 610 C 400 560, 600 560, 620 610" stroke={hi} strokeWidth={5} fill="none" />
      {/* drawstrings */}
      <path d={`M470 680 C 468 760, ${466 + sway(0) * 0.5} 820, ${464 + sway(0) * 0.7} 880`} stroke={WHITE} strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d={`M530 680 C 532 760, ${534 + sway(1) * 0.5} 820, ${536 + sway(1) * 0.7} 870`} stroke={WHITE} strokeWidth={7} fill="none" strokeLinecap="round" />
      {/* pouch pocket */}
      <path d="M340 1080 L 660 1080 L 700 1240 L 300 1240 Z" fill={shade} opacity={0.6} />
      <path d="M340 1080 L 660 1080" stroke={hi} strokeWidth={4} />
    </>
  );
};

const Casual: React.FC<BodyP> = ({ look, rim, pal }) => {
  const shade = mix(look.top, "#000010", 0.3);
  return (
    <>
      <path d={TORSO} fill={look.top} />
      <path d={TORSO_SHADE} fill={shade} />
      <path d={TORSO_RIM} fill={rim} opacity={0.5} />
      <Neck pal={pal} bottom={640} />
      <path d="M452 600 C 470 660, 530 660, 548 600 L 560 612 C 540 690, 460 690, 440 612 Z" fill={mix(look.top, "#ffffff", 0.25)} />
      <path d="M300 900 C 400 940, 600 940, 700 900" stroke={look.accent} strokeWidth={26} fill="none" opacity={0.85} />
    </>
  );
};

const BODIES: Record<AnimeOutfit, React.FC<BodyP>> = { sailor: Sailor, gakuran: Gakuran, blazer: Blazer, hoodie: Hoodie, casual: Casual };

const Mouth: React.FC<{ mouth: number; shape: MouthShape }> = ({ mouth, shape }) => {
  const open = shape === "grin" ? Math.max(mouth, 0.45) : shape === "o" ? Math.max(mouth, 0.35) : mouth;
  if (open < 0.15) {
    if (shape === "flat") return <path d="M484 491 L 516 491" stroke={LINE} strokeWidth={3.2} strokeLinecap="round" />;
    if (shape === "frown") return <path d="M482 496 C 492 488, 508 488, 518 496" stroke={LINE} strokeWidth={3.2} fill="none" strokeLinecap="round" />;
    return <path d="M480 492 C 492 499, 508 499, 520 490" stroke={LINE} strokeWidth={3.2} fill="none" strokeLinecap="round" />;
  }
  if (shape === "o") {
    return (
      <g>
        <ellipse cx={500} cy={494} rx={10 + open * 4} ry={9 + open * 12} fill="#6e1c33" stroke={LINE} strokeWidth={2.4} />
        <ellipse cx={500} cy={500 + open * 6} rx={7} ry={4} fill="#ea6f82" />
      </g>
    );
  }
  const top = shape === "grin" ? 484 : 486;
  return (
    <g>
      <path d={`M474 ${top} C 490 ${482 - open * 3}, 510 ${482 - open * 3}, 526 ${top} C 522 ${492 + open * 26}, 478 ${492 + open * 26}, 474 ${top} Z`} fill="#6e1c33" stroke={LINE} strokeWidth={2.4} />
      <ellipse cx={500} cy={486 + open * 18} rx={14} ry={5 + open * 3} fill="#ea6f82" />
      <path d="M480 487 L 520 487 L 518 491 L 482 491 Z" fill="#fff" opacity={open > 0.4 ? 0.9 : 0} />
    </g>
  );
};

export const AnimeCharacter: React.FC<CharProps> = ({
  frame, look = HIKARI, wind = 0.6, blink = 0, wink = false, mouth = 0, mouthShape = "smile", eyes = "normal", brow = 0,
  look2 = [0, 0], tilt = 0, light = "sunset", detail = false, pupil = 1, sweat = 0, blush = 1, id = "anime",
}) => {
  const pal = palette(look);
  const H = pal.hair;
  const S = pal.skin;
  const w = windField(frame, wind, lengthK[look.hair]);
  const rim = light === "sunset" ? "#ffb47a" : light === "night" ? "#9fb4ff" : "#fff1d0";
  const skinRim = light === "sunset" ? "#ffcf9e" : light === "night" ? "#c6d2ff" : S.rim;
  const reflect = light === "sunset" ? "#ffd27a" : light === "night" ? "#cfe0ff" : "#ffffff";
  const open = 1 - blink;
  const sway = (p: number) => Math.sin(frame * 0.16 + p) * wind * 14;
  const breathe = Math.sin(frame * 0.07) * 3;
  const Body = BODIES[look.outfit];
  const happy = eyes === "happy";
  const strandLines = ["M440 120 Q 400 200 410 330", "M480 105 Q 470 210 462 315", "M530 108 Q 548 220 545 320", "M580 125 Q 610 210 600 330"];
  const eyeCommon = { look2, detail, frame, pupil, brow, light: reflect, lashes: look.lashes, pal };

  return (
    <svg viewBox="0 0 1000 1200" width="100%" height="100%" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`${id}-hairg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={H.mid} />
          <stop offset="0.45" stopColor={H.base} />
          <stop offset="1" stopColor={H.shadow} />
        </linearGradient>
        <clipPath id={`${id}-face`}>
          <path d={FACE} />
        </clipPath>
        <filter id={`${id}-blur`}><feGaussianBlur stdDeviation="6" /></filter>
      </defs>

      <g transform={`rotate(${tilt} 500 540)`}>
        <path d={backHairPath(w, look.hair)} fill={rim} transform="translate(7 -2)" opacity={0.9} />
        <path d={backHairPath(w, look.hair)} fill={`url(#${id}-hairg)`} stroke={LINE} strokeWidth={2.5} strokeOpacity={0.5} strokeLinejoin="round" />
      </g>

      <g transform={`translate(0 ${breathe})`}>
        <Body look={look} rim={rim} sway={sway} pal={pal} />
      </g>

      <g transform={`rotate(${tilt} 500 540)`}>
        <path d={FACE} fill={skinRim} transform="translate(6 0)" />
        <path d={FACE} fill={S.base} stroke={S.deep} strokeWidth={2.5} strokeOpacity={0.7} />
        <g clipPath={`url(#${id}-face)`}>
          <ellipse cx={318} cy={420} rx={70} ry={190} fill={S.shadow} opacity={0.75} />
          <path d={bangsPath(w)} fill={S.shadow} transform="translate(-4 18)" />
          <g opacity={blush}>
            <ellipse cx={420} cy={452} rx={38} ry={13} fill="#ff8f9a" opacity={0.45} filter={`url(#${id}-blur)`} />
            <ellipse cx={580} cy={452} rx={38} ry={13} fill="#ff8f9a" opacity={0.45} filter={`url(#${id}-blur)`} />
            {[0, 1, 2].map((i) => (
              <React.Fragment key={i}>
                <line x1={402 + i * 13} y1={458} x2={410 + i * 13} y2={446} stroke={S.deep} strokeWidth={2.2} strokeLinecap="round" opacity={0.6} />
                <line x1={566 + i * 13} y1={458} x2={574 + i * 13} y2={446} stroke={S.deep} strokeWidth={2.2} strokeLinecap="round" opacity={0.6} />
              </React.Fragment>
            ))}
          </g>
        </g>

        <Eye id={`${id}-l`} cx={428} cy={375} m={1} open={open} happy={happy} {...eyeCommon} />
        <Eye id={`${id}-r`} cx={572} cy={375} m={-1} open={wink ? 0 : open} happy={happy || wink} {...eyeCommon} />

        {look.glasses && (
          <g fill="none" stroke="#3a2a4a" strokeWidth={5}>
            <rect x={370} y={322} width={118} height={100} rx={26} />
            <rect x={512} y={322} width={118} height={100} rx={26} />
            <path d="M488 360 Q 500 350 512 360" />
            <path d="M380 340 L 396 330" stroke="#ffffff" strokeWidth={4} opacity={0.7} />
            <path d="M522 340 L 538 330" stroke="#ffffff" strokeWidth={4} opacity={0.7} />
          </g>
        )}

        <path d="M506 436 L 500 452 L 508 452" stroke={S.deep} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Mouth mouth={mouth} shape={mouthShape} />

        {([-1, 1] as const).map((s) => (
          <g key={s}>
            <path d={sideLock(w, s)} fill={rim} transform="translate(5 0)" opacity={s === -1 ? 0.9 : 0} />
            <path d={sideLock(w, s)} fill={`url(#${id}-hairg)`} stroke={LINE} strokeWidth={2.5} strokeOpacity={0.55} strokeLinejoin="round" />
          </g>
        ))}

        <path d={bangsPath(w)} fill={rim} transform="translate(5 -1)" opacity={0.9} />
        <path d={bangsPath(w)} fill={`url(#${id}-hairg)`} stroke={LINE} strokeWidth={2.5} strokeOpacity={0.55} strokeLinejoin="round" />
        {strandLines.map((d, i) => (
          <path key={i} d={d} stroke={H.shadow} strokeWidth={3} fill="none" opacity={0.55} strokeLinecap="round" />
        ))}
        <g opacity={0.85}>
          {Array.from({ length: 9 }, (_, i) => {
            const t = i / 8;
            const x = lerp(372, 628, t);
            const y = 178 - Math.sin(t * Math.PI) * 52;
            const h = 10 + Math.sin(t * Math.PI) * 10;
            return <path key={i} d={`M${x - 14} ${y} L ${x} ${y - h} L ${x + 14} ${y} L ${x} ${y + h * 0.6} Z`} fill={H.shine} />;
          })}
        </g>
        {look.clip && (
          <g transform="translate(612 236) rotate(-24)">
            <rect x={-34} y={-6} width={68} height={12} rx={6} fill="#ffd36b" />
            <rect x={-30} y={8} width={60} height={9} rx={4.5} fill="#ffb03b" />
            <path d="M44 -14 L 48 -3 L 59 -2 L 50 5 L 53 16 L 44 10 L 35 16 L 38 5 L 29 -2 L 40 -3 Z" fill="#fff0a8" stroke="#e59a2b" strokeWidth={2} />
          </g>
        )}
        {sweat > 0 && (
          <g transform={`translate(640 ${300 + (1 - sweat) * -20})`} opacity={sweat}>
            <path d="M0 -26 C 10 -8, 16 4, 16 12 C 16 22, 8 28, 0 28 C -8 28, -16 22, -16 12 C -16 4, -10 -8, 0 -26 Z" fill="#bfe6ff" stroke="#5a9fd6" strokeWidth={3} />
            <ellipse cx={-5} cy={12} rx={4} ry={7} fill="#fff" />
          </g>
        )}
      </g>
    </svg>
  );
};
