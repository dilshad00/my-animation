/**
 * "Hikari" — premium cel-shaded anime heroine (front view, head + shoulders, sailor uniform).
 *
 * Drawn in a 1000×1200 box; head centre ≈ (500, 340), eyes at (428|572, 375).
 * Everything that moves is a prop so shots can direct the performance:
 *   wind   – hair / ribbon sway strength (0 calm … 2 storm)
 *   blink  – 0 open … 1 closed          mouth – 0 closed smile … 1 open shout
 *   brow   – 0 soft … 1 determined      look  – iris offset [x, y] in px
 *   tilt   – head roll in degrees       light – "sunset" | "night" rim light
 *   detail – extra iris striations / lashes for extreme close-ups
 */
import React from "react";
import { ANIME, lerp } from "./palette";

export type GirlProps = {
  frame: number;
  wind?: number;
  blink?: number;
  mouth?: number;
  brow?: number;
  look?: [number, number];
  tilt?: number;
  light?: "sunset" | "night";
  detail?: boolean;
  pupil?: number;
  id?: string;
};

const H = ANIME.hair;
const S = ANIME.skin;
const U = ANIME.uniform;
const E = ANIME.eye;
const LINE = ANIME.line;

/** Displacement field for wind: grows with distance below the crown, rippling over time. */
const windAt = (frame: number, wind: number) => (x: number, y: number, phase = 0) => {
  const k = Math.max(0, (y - 180) / 700);
  const wave = Math.sin(frame * 0.11 + phase + y * 0.012) * 0.45 + 0.75;
  const dx = wind * k * k * 120 * wave;
  const dy = -wind * k * 22 * Math.sin(frame * 0.09 + phase);
  return `${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}`;
};

const FACE = "M352 290 C 348 380, 362 440, 405 492 C 435 527, 470 546, 500 549 C 530 546, 565 527, 595 492 C 638 440, 652 380, 648 290 C 640 175, 360 175, 352 290 Z";

/** Bangs outline: skull top then a zig-zag of curved tips (right → left). */
const bangsPath = (w: (x: number, y: number, p?: number) => string) => {
  // right → left, alternating tip / notch
  const pts: [number, number][] = [
    [650, 405], [624, 290], [600, 340], [576, 284], [550, 328], [528, 286], [510, 360],
    [488, 284], [464, 326], [440, 284], [412, 344], [392, 290], [352, 408],
  ];
  let d = `M340 262 C 322 140, 430 92, 500 92 C 570 92, 680 140, 662 262 L ${w(664, 330, 0)} Q ${w(670, 382, 0)} ${w(650, 405, 0)}`;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1];
    const [bx, by] = pts[i];
    const toTip = i % 2 === 0;
    // strands bow outward from the centre parting so tips hook like brush strokes
    const bow = (bx + ax) / 2 > 500 ? 7 : -7;
    const cx = (ax + bx) / 2 + (toTip ? bow : -bow * 0.4);
    const cy = (ay + by) / 2 + (toTip ? -6 : 4);
    d += ` Q ${w(cx, cy, i)} ${w(bx, by, i)}`;
  }
  d += ` Q ${w(334, 362, 12)} ${w(338, 300, 12)} Z`;
  return d;
};

const backHairPath = (w: (x: number, y: number, p?: number) => string) =>
  `M500 96 C 360 96, 268 190, 270 330 C 272 470, 240 600, 188 760 ` +
  `L ${w(150, 900, 1)} L ${w(222, 852, 2)} L ${w(190, 990, 3)} L ${w(275, 900, 4)} L ${w(282, 1010, 5)} L ${w(340, 900, 6)} ` +
  `L 660 900 L ${w(718, 1010, 7)} L ${w(735, 900, 8)} L ${w(812, 990, 9)} L ${w(790, 852, 10)} L ${w(862, 900, 11)} ` +
  `L 812 760 C 760 600, 728 470, 730 330 C 732 190, 640 96, 500 96 Z`;

const sideLock = (w: (x: number, y: number, p?: number) => string, side: 1 | -1) => {
  const X = (x: number) => 500 + (x - 500) * side;
  return (
    `M ${X(346)} 236 C ${X(318)} 340, ${X(316)} 480, ${w(X(326), 620, 2)} ` +
    `C ${w(X(332), 720, 3)}, ${w(X(316), 800, 3)}, ${w(X(292), 880, 4)} ` +
    `C ${w(X(340), 810, 4)}, ${w(X(356), 720, 3)}, ${w(X(362), 610, 2)} ` +
    `C ${X(368)} 480, ${X(372)} 360, ${X(388)} 262 Z`
  );
};

const Eye: React.FC<{ cx: number; cy: number; m: 1 | -1; open: number; look: [number, number]; detail: boolean; frame: number; pupil: number; brow: number; light: string; id: string }> = ({
  cx, cy, m, open, look, detail, frame, pupil, brow, light, id,
}) => {
  const lx = look[0] * m;
  const shimmer = Math.sin(frame * 0.25) * 1.2;
  const lidDrop = (1 - open) * 52;
  const SCLERA = "M-48 -18 C -32 -44, 26 -50, 46 -30 C 52 -6, 46 32, 24 46 C 2 56, -30 50, -42 30 C -50 14, -52 -4, -48 -18 Z";
  return (
    <g transform={`translate(${cx} ${cy}) scale(${m} 1)`}>
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
      {/* brow (rotates for determination) */}
      <path transform={`translate(0 ${-82 + brow * 10}) rotate(${brow * 14 * 1})`} d="M-44 4 C -20 -10, 14 -12, 40 -2" stroke={H.shadow} strokeWidth={5.5} fill="none" strokeLinecap="round" />
      {open > 0.12 ? (
        <>
          <g clipPath={`url(#${id}-lid)`}>
            <g clipPath={`url(#${id}-eclip)`}>
              <path d={SCLERA} fill={E.white} />
              <path d="M-48 -18 C -32 -44, 26 -50, 46 -30 L 46 -5 C 20 -24, -30 -22, -48 0 Z" fill="#cfc6ee" opacity={0.8} />
              <g transform={`translate(${2 + lx} ${8 + look[1]})`}>
                <ellipse rx={34} ry={44} fill={`url(#${id}-iris)`} />
                {detail &&
                  Array.from({ length: 28 }, (_, i) => {
                    const a = (i / 28) * Math.PI * 2;
                    return <line key={i} x1={Math.cos(a) * 14} y1={Math.sin(a) * 20} x2={Math.cos(a) * 31} y2={Math.sin(a) * 40} stroke={E.dark} strokeOpacity={0.25} strokeWidth={1} />;
                  })}
                <ellipse cy={-20} rx={34} ry={22} fill={E.dark} opacity={0.55} />
                <ellipse rx={13 * pupil} ry={21 * pupil} cy={-2} fill="#0d0826" />
                <ellipse rx={34} ry={44} fill="none" stroke={E.dark} strokeWidth={2.5} />
                {/* lower glow crescent */}
                <path d="M-24 22 C -14 38, 14 38, 24 22 C 14 30, -14 30, -24 22 Z" fill={E.glow} opacity={0.85} />
                {/* sunset / moon reflection */}
                <ellipse cx={14 * m} cy={22} rx={6} ry={2.5} fill={light} opacity={0.55} />
                {/* main highlights (always on the viewer's upper-left) */}
                <ellipse cx={-14 * m + shimmer} cy={-16} rx={10} ry={13} fill="#fff" />
                <circle cx={16 * m} cy={-4 + shimmer} r={4.5} fill="#fff" opacity={0.95} />
                {detail && <circle cx={-2 * m} cy={-30} r={2.5} fill="#fff" />}
              </g>
            </g>
          </g>
          {/* upper lash line, follows the lid */}
          <g transform={`translate(0 ${lidDrop * 0.92})`}>
            <path d="M46 -30 C 22 -54, -30 -52, -52 -22 L -66 -12 L -54 -10 C -32 -38, 20 -42, 46 -22 Z" fill={LINE} />
            <path d="M-52 -22 L -70 -28 L -58 -16 Z" fill={LINE} />
            {detail &&
              [-40, -26, -12, 4].map((x, i) => (
                <path key={i} d={`M${x} ${-42 + i} q -8 -10 -18 -12`} stroke={LINE} strokeWidth={2.5} fill="none" strokeLinecap="round" />
              ))}
            <path d="M40 -32 C 20 -48, -20 -48, -40 -32" stroke="#6b3f6a" strokeWidth={2} fill="none" opacity={0.6} transform="translate(0 -9)" />
          </g>
          <path d="M-42 30 C -28 48, 8 54, 28 44" stroke={LINE} strokeWidth={3} fill="none" opacity={0.65} strokeLinecap="round" />
          {brow > 0.05 && (
            // determined: the inner upper lid slants down (classic "serious" anime eye)
            <g>
              <path d={`M-14 -58 L 60 ${-40 + brow * 26} L 60 -90 L -14 -90 Z`} fill={ANIME.skin.base} />
              <path d={`M-14 -58 L 52 ${-41 + brow * 25}`} stroke={LINE} strokeWidth={4 + brow * 4} strokeLinecap="round" />
            </g>
          )}
        </>
      ) : (
        <>
          <path d="M-54 6 C -26 28, 22 28, 46 8" stroke={LINE} strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d="M-54 6 L -68 0" stroke={LINE} strokeWidth={5} strokeLinecap="round" />
        </>
      )}
    </g>
  );
};

export const AnimeGirl: React.FC<GirlProps> = ({
  frame, wind = 0.6, blink = 0, mouth = 0, brow = 0, look = [0, 0], tilt = 0, light = "sunset", detail = false, pupil = 1, id = "girl",
}) => {
  const w = windAt(frame, wind);
  const rim = light === "sunset" ? H.rim : "#9fb4ff";
  const skinRim = light === "sunset" ? "#ffcf9e" : "#c6d2ff";
  const reflect = light === "sunset" ? "#ffd27a" : "#cfe0ff";
  const open = 1 - blink;
  const ribbonSway = (p: number) => Math.sin(frame * 0.16 + p) * wind * 14;
  const breathe = Math.sin(frame * 0.07) * 3;

  const strandLines = [
    "M440 120 Q 400 200 410 330", "M480 105 Q 470 210 462 315", "M530 108 Q 548 220 545 320", "M580 125 Q 610 210 600 330",
  ];

  return (
    <svg viewBox="0 0 1000 1200" width="100%" height="100%" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`${id}-hairg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={H.mid} />
          <stop offset="0.45" stopColor={H.base} />
          <stop offset="1" stopColor={H.shadow} />
        </linearGradient>
        <linearGradient id={`${id}-collar`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={U.navy} />
          <stop offset="1" stopColor={U.navyShade} />
        </linearGradient>
        <clipPath id={`${id}-face`}>
          <path d={FACE} />
        </clipPath>
        <filter id={`${id}-blur`}><feGaussianBlur stdDeviation="6" /></filter>
      </defs>

      <g transform={`rotate(${tilt} 500 540)`}>
        {/* back hair: rim copy then body */}
        <path d={backHairPath(w)} fill={rim} transform="translate(7 -2)" opacity={0.9} />
        <path d={backHairPath(w)} fill={`url(#${id}-hairg)`} stroke={LINE} strokeWidth={2.5} strokeOpacity={0.5} strokeLinejoin="round" />
        <path d={backHairPath(w)} fill={H.shadow} opacity={0.35} transform="translate(0 40) scale(1 0.96)" />
      </g>

      {/* body (breathing) */}
      <g transform={`translate(0 ${breathe})`}>
        <path d="M465 600 C 420 640, 300 660, 240 690 C 190 715, 165 770, 155 860 L 140 1240 L 860 1240 L 845 860 C 835 770, 810 715, 760 690 C 700 660, 580 640, 535 600 Z" fill={U.white} />
        <path d="M155 860 L 140 1240 L 330 1240 C 300 1080, 270 960, 250 820 Z" fill={U.whiteShade} />
        <path d="M845 860 C 835 770, 810 715, 760 690 L 790 760 C 805 800, 820 830, 845 860 Z" fill={rim} opacity={0.5} />
        {/* neck + chest in the collar V */}
        <path d="M462 470 L 462 620 L 500 800 L 538 620 L 538 470 Z" fill={S.base} />
        <path d="M462 505 C 480 552, 520 552, 538 505 L 538 600 C 520 585, 480 585, 462 600 Z" fill={S.shadow} />
        {/* sailor collar */}
        <path d="M462 600 L 250 690 C 262 730, 280 770, 300 800 L 500 890 L 700 800 C 720 770, 738 730, 750 690 L 538 600 C 526 660, 514 730, 500 800 C 486 730, 474 660, 462 600 Z" fill={`url(#${id}-collar)`} />
        <path d="M268 712 C 280 748, 294 772, 312 788 L 500 870 L 688 788 C 706 772, 720 748, 732 712" stroke={U.white} strokeWidth={8} fill="none" />
        <path d="M282 704 C 292 734, 304 756, 320 770 L 500 848 L 680 770 C 696 756, 708 734, 718 704" stroke={U.white} strokeWidth={3} fill="none" opacity={0.9} />
        {/* scarf ribbon: tails flutter with wind */}
        <path d={`M488 820 C 470 880, ${450 + ribbonSway(0)} 960, ${438 + ribbonSway(0) * 1.6} 1030 L ${478 + ribbonSway(0) * 1.6} 1010 C ${488 + ribbonSway(0)} 950, 498 880, 500 830 Z`} fill={U.scarfShade} />
        <path d={`M512 820 C 530 880, ${560 + ribbonSway(1)} 960, ${574 + ribbonSway(1) * 1.6} 1036 L ${534 + ribbonSway(1) * 1.6} 1020 C ${524 + ribbonSway(1)} 950, 508 880, 500 830 Z`} fill={U.scarf} />
        <path d={`M490 812 C 450 780, ${396 + ribbonSway(2) * 0.4} 770, ${392 + ribbonSway(2) * 0.4} 812 C 390 852, 450 846, 490 828 Z`} fill={U.scarf} />
        <path d={`M510 812 C 550 780, ${604 + ribbonSway(3) * 0.4} 770, ${608 + ribbonSway(3) * 0.4} 812 C 610 852, 550 846, 510 828 Z`} fill={U.scarf} />
        <path d="M420 800 C 440 795, 460 805, 480 816" stroke={U.scarfShade} strokeWidth={4} fill="none" />
        <path d="M580 800 C 560 795, 540 805, 520 816" stroke={U.scarfShade} strokeWidth={4} fill="none" />
        <rect x={482} y={804} width={36} height={34} rx={9} fill={U.scarfShade} />
        <rect x={486} y={806} width={20} height={10} rx={5} fill="#ff7088" opacity={0.8} />
      </g>

      <g transform={`rotate(${tilt} 500 540)`}>
        {/* face with rim + cel shading */}
        <path d={FACE} fill={skinRim} transform="translate(6 0)" />
        <path d={FACE} fill={S.base} stroke={S.deep} strokeWidth={2.5} strokeOpacity={0.7} />
        <g clipPath={`url(#${id}-face)`}>
          <ellipse cx={318} cy={420} rx={70} ry={190} fill={S.shadow} opacity={0.75} />
          <path d={bangsPath(w)} fill={S.shadow} transform="translate(-4 18)" />
          <ellipse cx={420} cy={452} rx={38} ry={13} fill={S.blush} opacity={0.45} filter={`url(#${id}-blur)`} />
          <ellipse cx={580} cy={452} rx={38} ry={13} fill={S.blush} opacity={0.45} filter={`url(#${id}-blur)`} />
          {[0, 1, 2].map((i) => (
            <React.Fragment key={i}>
              <line x1={402 + i * 13} y1={458} x2={410 + i * 13} y2={446} stroke={S.deep} strokeWidth={2.2} strokeLinecap="round" opacity={0.6} />
              <line x1={566 + i * 13} y1={458} x2={574 + i * 13} y2={446} stroke={S.deep} strokeWidth={2.2} strokeLinecap="round" opacity={0.6} />
            </React.Fragment>
          ))}
        </g>

        <Eye id={`${id}-l`} cx={428} cy={375} m={1} open={open} look={look} detail={detail} frame={frame} pupil={pupil} brow={brow} light={reflect} />
        <Eye id={`${id}-r`} cx={572} cy={375} m={-1} open={open} look={look} detail={detail} frame={frame} pupil={pupil} brow={brow} light={reflect} />

        {/* nose + mouth */}
        <path d="M506 436 L 500 452 L 508 452" stroke={S.deep} strokeWidth={2.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {mouth < 0.15 ? (
          <path d="M480 492 C 492 499, 508 499, 520 490" stroke={LINE} strokeWidth={3.2} fill="none" strokeLinecap="round" />
        ) : (
          <g>
            <path d={`M474 486 C 490 ${482 - mouth * 3}, 510 ${482 - mouth * 3}, 526 486 C 522 ${492 + mouth * 26}, 478 ${492 + mouth * 26}, 474 486 Z`} fill="#6e1c33" stroke={LINE} strokeWidth={2.4} />
            <ellipse cx={500} cy={486 + mouth * 18} rx={14} ry={5 + mouth * 3} fill="#ea6f82" />
            <path d="M480 487 L 520 487 L 518 491 L 482 491 Z" fill="#fff" opacity={mouth > 0.4 ? 0.9 : 0} />
          </g>
        )}

        {/* side locks (in front of face edge + shoulders) */}
        {([-1, 1] as const).map((s) => (
          <g key={s}>
            <path d={sideLock(w, s)} fill={rim} transform="translate(5 0)" opacity={s === -1 ? 0.9 : 0} />
            <path d={sideLock(w, s)} fill={`url(#${id}-hairg)`} stroke={LINE} strokeWidth={2.5} strokeOpacity={0.55} strokeLinejoin="round" />
          </g>
        ))}

        {/* bangs */}
        <path d={bangsPath(w)} fill={rim} transform="translate(5 -1)" opacity={0.9} />
        <path d={bangsPath(w)} fill={`url(#${id}-hairg)`} stroke={LINE} strokeWidth={2.5} strokeOpacity={0.55} strokeLinejoin="round" />
        {strandLines.map((d, i) => (
          <path key={i} d={d} stroke={H.shadow} strokeWidth={3} fill="none" opacity={0.55} strokeLinecap="round" />
        ))}
        {/* angel-ring shine: band of sharp diamonds across the crown */}
        <g opacity={0.85}>
          {Array.from({ length: 9 }, (_, i) => {
            const t = i / 8;
            const x = lerp(372, 628, t);
            const y = 178 - Math.sin(t * Math.PI) * 52;
            const h = 10 + Math.sin(t * Math.PI) * 10;
            return <path key={i} d={`M${x - 14} ${y} L ${x} ${y - h} L ${x + 14} ${y} L ${x} ${y + h * 0.6} Z`} fill={H.shine} />;
          })}
        </g>
        {/* hair clip */}
        <g transform="translate(612 236) rotate(-24)">
          <rect x={-34} y={-6} width={68} height={12} rx={6} fill="#ffd36b" />
          <rect x={-30} y={8} width={60} height={9} rx={4.5} fill="#ffb03b" />
          <path d="M44 -14 L 48 -3 L 59 -2 L 50 5 L 53 16 L 44 10 L 35 16 L 38 5 L 29 -2 L 40 -3 Z" fill="#fff0a8" stroke="#e59a2b" strokeWidth={2} />
        </g>
      </g>
    </svg>
  );
};
