// Video-003 environments: the world before metal. Registered additively in src/components/environments/registry.tsx.
import React from "react";
import { SvgLayer } from "../../../src/components/camera/Camera";
import { Clouds, Ground, Hills, rnd, Sky, WORLD_L, WORLD_R, type EnvProps } from "../../../src/components/environments/common";
import { lit } from "../../../src/utils/lighting";
import { tweenNum } from "../../../src/utils/tween";

const span = WORLD_R - WORLD_L;

/** Flat-topped acacia silhouette drawn at a ground point. */
const Acacia: React.FC<{ x: number; y: number; s: number; c: string; leaf: string }> = ({ x, y, s, c, leaf }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-12,0 L-6,-150 L-90,-230 L-82,-238 L-2,-178 L4,-260 L14,-258 L12,-170 L90,-240 L98,-232 L10,-140 L14,0 Z" fill={c} />
    <ellipse cx={-90} cy={-262} rx={118} ry={36} fill={leaf} />
    <ellipse cx={80} cy={-274} rx={136} ry={40} fill={leaf} />
    <ellipse cx={0} cy={-298} rx={96} ry={30} fill={leaf} />
  </g>
);

/** Open East African grassland with far hills and scattered acacias. Props: { "lake": true } */
export const Savanna: React.FC<EnvProps> = ({ palette: p, t, seed, spec }) => {
  const pr = spec.props ?? {};
  return (
    <>
      <Sky p={p} t={t} horizon={700} seed={seed} />
      <Clouds p={p} t={t} seed={seed} count={4} depth={0.06} />
      <Hills p={p} seed={seed} color="#7d7a78" baseY={660} amp={90} depth={0.12} haze={0.65} keyName="sv1" step={420} />
      <Hills p={p} seed={seed} color="#a08a55" baseY={720} amp={46} depth={0.28} haze={0.35} keyName="sv2" step={300} />
      {pr.lake ? (
        <SvgLayer depth={0.34}>
          <rect x={WORLD_L} y={716} width={span} height={70} fill={lit(p, "#5f93a8")} />
          {Array.from({ length: 22 }).map((_, i) => (
            <rect key={i} x={WORLD_L + i * 260 + 40 + Math.sin(t + i) * 30} y={726 + (i % 4) * 14} width={150} height={3} fill={lit(p, "#a9d0dc")} opacity={0.6} />
          ))}
        </SvgLayer>
      ) : null}
      <Ground p={p} y={770} color="#b79b57" haze={0.08} />
      <SvgLayer depth={0.55}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Acacia key={i} x={WORLD_L + 200 + i * 460 + rnd(seed, "ax" + i) * 200} y={790} s={0.5 + rnd(seed, "as" + i) * 0.5} c={lit(p, "#4a3626")} leaf={lit(p, "#5d7339")} />
        ))}
      </SvgLayer>
      <SvgLayer depth={1}>
        {Array.from({ length: 150 }).map((_, i) => {
          const x = WORLD_L + (i / 150) * span + rnd(seed, "gx" + i) * 40;
          const y = 830 + rnd(seed, "gy" + i) * 240;
          const sway = Math.sin(t * 1.5 + i) * 6;
          return <path key={i} d={`M${x},${y} q${sway / 2},-26 ${sway},-52`} stroke={lit(p, i % 3 ? "#8d7a3e" : "#a8914b")} strokeWidth={5} fill="none" />;
        })}
      </SvgLayer>
    </>
  );
};

/** Forager camp: hide shelters at a forest edge. */
export const Camp: React.FC<EnvProps> = ({ palette: p, t, seed }) => (
  <>
    <Sky p={p} t={t} horizon={700} seed={seed} />
    <Clouds p={p} t={t} seed={seed} count={3} depth={0.06} />
    <Hills p={p} seed={seed} color="#4d6155" baseY={640} amp={100} depth={0.14} haze={0.6} keyName="cp1" step={360} />
    <Hills p={p} seed={seed} color="#35513d" baseY={710} amp={70} depth={0.3} haze={0.3} keyName="cp2" step={240} />
    <Ground p={p} y={790} color="#6b5a3a" haze={0.08} />
    <SvgLayer depth={0.7}>
      {Array.from({ length: 9 }).map((_, i) => {
        const x = WORLD_L + 340 + i * 640 + rnd(seed, "tx" + i) * 200;
        const w = 180 + rnd(seed, "tw" + i) * 70;
        return (
          <g key={i} transform={`translate(${x} 830)`}>
            <path d={`M${-w},0 Q${-w * 0.5},-250 0,-280 Q${w * 0.5},-250 ${w},0 Z`} fill={lit(p, "#8b6a45")} />
            <path d={`M${-w * 0.28},0 Q0,-160 ${w * 0.28},0 Z`} fill={lit(p, "#2a1d14")} />
            <path d={`M${-w * 0.6},-120 Q0,-170 ${w * 0.6},-120`} fill="none" stroke={lit(p, "#5f4630")} strokeWidth={7} />
            <path d="M-12,-276 L-40,-330 M12,-276 L40,-330" stroke={lit(p, "#4a3626")} strokeWidth={9} />
          </g>
        );
      })}
    </SvgLayer>
  </>
);

/** Hilltop stone circle under construction. Props (animatable): { "raised": 0..1 } */
export const Tepe: React.FC<EnvProps> = ({ palette: p, t, seed, spec }) => {
  const raised = tweenNum((spec.props ?? {}).raised as never, t, 1);
  const pillars = [
    { x: 330, s: 0.72 },
    { x: 620, s: 0.88 },
    { x: 960, s: 1.02 },
    { x: 1300, s: 0.88 },
    { x: 1590, s: 0.72 },
  ];
  return (
    <>
      <Sky p={p} t={t} horizon={700} seed={seed} />
      <Clouds p={p} t={t} seed={seed} count={4} depth={0.06} />
      <Hills p={p} seed={seed} color="#a58f6c" baseY={690} amp={60} depth={0.16} haze={0.5} keyName="te1" step={380} />
      <Ground p={p} y={760} color="#b49a6b" haze={0.06} />
      <SvgLayer depth={0.8}>
        <ellipse cx={960} cy={950} rx={920} ry={190} fill={lit(p, "#8c7650")} />
        <ellipse cx={960} cy={960} rx={820} ry={150} fill={lit(p, "#a18a60")} />
        {pillars.map((c, i) => {
          const lift = Math.max(0, Math.min(1, raised * pillars.length - i));
          const y = 930 + (1 - lift) * 560;
          const d = "#d6c8a8";
          return (
            <g key={i} transform={`translate(${c.x} ${y}) scale(${c.s})`} opacity={lift > 0 ? 1 : 0}>
              <rect x={-54} y={-500} width={108} height={500} fill={lit(p, d)} />
              <rect x={24} y={-500} width={30} height={500} fill={lit(p, "#b5a988")} />
              <rect x={-170} y={-620} width={340} height={124} rx={8} fill={lit(p, "#e0d4b6")} />
              <path d="M-30,-400 Q0,-450 34,-404 L18,-392 L34,-340 L-4,-368 L-34,-340 Z" fill={lit(p, "#94886a")} />
            </g>
          );
        })}
      </SvgLayer>
    </>
  );
};

/** Hand-dug Stone Age plots with mud huts. Props (animatable): { "crop": 0..1, "dry": 0..1 } */
export const Fields: React.FC<EnvProps> = ({ palette: p, t, seed, spec }) => {
  const pr = spec.props ?? {};
  const crop = tweenNum(pr.crop as never, t, 1);
  const dry = tweenNum(pr.dry as never, t, 0);
  const soil = dry > 0.5 ? "#a58a63" : "#6d4d30";
  return (
    <>
      <Sky p={p} t={t} horizon={660} seed={seed} />
      <Clouds p={p} t={t} seed={seed} count={4} depth={0.06} />
      <Hills p={p} seed={seed} color="#8a8466" baseY={620} amp={80} depth={0.14} haze={0.55} keyName="fd1" step={420} />
      <SvgLayer depth={0.34}>
        {Array.from({ length: 12 }).map((_, i) => {
          const x = WORLD_L + 240 + i * 520 + rnd(seed, "hx" + i) * 180;
          return (
            <g key={i} transform={`translate(${x} 690)`}>
              <rect x={-70} y={-82} width={140} height={82} fill={lit(p, "#a9835a")} />
              <path d="M-92,-80 L0,-150 L92,-80 Z" fill={lit(p, "#7a6236")} />
              <rect x={-16} y={-52} width={32} height={52} fill={lit(p, "#33251a")} />
            </g>
          );
        })}
      </SvgLayer>
      <Ground p={p} y={690} color={soil} haze={0.05} />
      <SvgLayer depth={0.9}>
        {Array.from({ length: 6 }).map((_, row) => {
          const y = 730 + row * 62;
          return (
            <g key={row}>
              <rect x={WORLD_L} y={y + 22} width={span} height={16} fill={lit(p, "#4b3522")} opacity={0.6} />
              {Array.from({ length: 56 }).map((_, i) => {
                const x = WORLD_L + i * (span / 56) + (row % 2) * 26;
                const h = (40 + row * 12) * crop;
                const sway = Math.sin(t * 1.5 + i + row) * 5 * crop;
                const c = dry > 0.5 ? "#a58b4a" : row % 2 ? "#c9a94c" : "#b6a040";
                return h > 2 ? <path key={i} d={`M${x},${y + 24} q${sway / 2},${-h / 2} ${sway},${-h}`} stroke={lit(p, c)} strokeWidth={5 + row} fill="none" strokeLinecap="round" /> : null;
              })}
            </g>
          );
        })}
      </SvgLayer>
    </>
  );
};

/** Catalhoyuk: mud-brick houses packed wall to wall, no streets; roof hatches. */
export const Catal: React.FC<EnvProps> = ({ palette: p, t, seed }) => {
  const rows = [
    { y: 620, h: 92, w: 190, c: "#b89567", depth: 0.42 },
    { y: 760, h: 130, w: 280, c: "#c6a273", depth: 0.65 },
    { y: 950, h: 190, w: 420, c: "#d3b083", depth: 0.92 },
  ];
  return (
    <>
      <Sky p={p} t={t} horizon={600} seed={seed} />
      <Clouds p={p} t={t} seed={seed} count={4} depth={0.06} />
      <Hills p={p} seed={seed} color="#99917b" baseY={560} amp={46} depth={0.12} haze={0.6} keyName="ct1" step={420} />
      {rows.map((r, ri) => (
        <SvgLayer depth={r.depth} key={ri}>
          {Array.from({ length: Math.ceil(span / r.w) + 2 }).map((_, i) => {
            const x = WORLD_L + i * r.w;
            const up = rnd(seed, `r${ri}u${i}`) * r.h * 0.34;
            return (
              <g key={i}>
                <rect x={x} y={r.y - up} width={r.w} height={1300 - r.y} fill={lit(p, i % 2 ? r.c : "#b98f60")} />
                <rect x={x} y={r.y - up} width={r.w} height={r.h * 0.12} fill={lit(p, "#e0c49a")} />
                <rect x={x} y={r.y - up} width={6} height={1300} fill={lit(p, "#8c6a44")} opacity={0.65} />
                <rect x={x + r.w * 0.38} y={r.y - up + 6} width={r.w * 0.24} height={r.h * 0.09} fill={lit(p, "#2b1e14")} />
                <rect x={x + r.w * 0.48} y={r.y - up - r.h * 0.5} width={r.w * 0.02} height={r.h * 0.55} fill={lit(p, "#6d4a2c")} />
                <rect x={x + r.w * 0.55} y={r.y - up - r.h * 0.5} width={r.w * 0.02} height={r.h * 0.55} fill={lit(p, "#6d4a2c")} />
                {i % 3 === 0 ? <circle cx={x + r.w * 0.25} cy={r.y - up - 10 - Math.sin(t + i) * 4} r={r.h * 0.06} fill={lit(p, "#cfc6b6")} opacity={0.4} /> : null}
              </g>
            );
          })}
        </SvgLayer>
      ))}
    </>
  );
};

/** Andes: terraced peaks with a stone road running across the slope. */
export const Andes: React.FC<EnvProps> = ({ palette: p, t, seed }) => (
  <>
    <Sky p={p} t={t} horizon={640} seed={seed} />
    <Clouds p={p} t={t} seed={seed} count={5} depth={0.08} y={210} />
    <SvgLayer depth={0.12}>
      <path d={`M${WORLD_L},900 L-300,420 L60,250 L330,400 L620,170 L980,430 L1280,210 L1640,420 L2020,260 L2500,560 L${WORLD_R},900 Z`} fill={lit(p, "#6f7f93")} />
      <path d="M520,230 L620,170 L730,250 L650,240 L600,290 Z M1190,265 L1280,210 L1390,290 L1300,275 L1240,320 Z M1930,310 L2020,260 L2120,330 L2030,320 Z" fill={lit(p, "#eef2f6")} />
    </SvgLayer>
    <Hills p={p} seed={seed} color="#5c7a4f" baseY={700} amp={120} depth={0.36} haze={0.3} keyName="an2" step={340} />
    <SvgLayer depth={0.6}>
      {Array.from({ length: 7 }).map((_, i) => (
        <path key={i} d={`M${WORLD_L},${640 + i * 40} Q960,${590 + i * 40} ${WORLD_R},${650 + i * 40}`} fill="none" stroke={lit(p, "#4b5f3e")} strokeWidth={8} />
      ))}
    </SvgLayer>
    <Ground p={p} y={800} color="#5e7648" haze={0.06} />
    <SvgLayer depth={1}>
      <path d={`M${WORLD_L},900 Q960,850 ${WORLD_R},900 L${WORLD_R},990 Q960,930 ${WORLD_L},990 Z`} fill={lit(p, "#a79a83")} />
      {Array.from({ length: 70 }).map((_, i) => {
        const x = WORLD_L + i * (span / 70);
        return <rect key={i} x={x} y={918 + ((i * 17) % 34) - Math.abs(x - 960) * -0.012 - 22} width={70} height={7} rx={3} fill={lit(p, "#8d8069")} />;
      })}
    </SvgLayer>
  </>
);

/** Australian coast; the sea rises and swallows it. Props (animatable): { "level": 0..1 } */
export const Shore: React.FC<EnvProps> = ({ palette: p, t, seed, spec }) => {
  const level = tweenNum((spec.props ?? {}).level as never, t, 0);
  const y = 760 - level * 260;
  return (
    <>
      <Sky p={p} t={t} horizon={600} seed={seed} />
      <Clouds p={p} t={t} seed={seed} count={4} depth={0.06} />
      <SvgLayer depth={0.6}>
        <path d={`M${WORLD_L},1300 L${WORLD_L},540 C200,500 700,560 960,640 C1300,740 1600,760 ${WORLD_R},780 L${WORLD_R},1300 Z`} fill={lit(p, "#b77a43")} />
        <path d={`M${WORLD_L},640 C200,590 700,640 960,720 C1300,820 1600,840 ${WORLD_R},860 L${WORLD_R},1300 L${WORLD_L},1300 Z`} fill={lit(p, "#94612f")} opacity={0.7} />
        {[160, 420, 700].map((x, i) => (
          <g key={x} transform={`translate(${x} ${556 + i * 18}) scale(0.7)`}>
            <path d="M-10,0 L-5,-180 L5,-180 L10,0 Z" fill={lit(p, "#4a3626")} />
            <ellipse cx={0} cy={-210} rx={92} ry={56} fill={lit(p, "#68773c")} />
          </g>
        ))}
      </SvgLayer>
      <SvgLayer depth={0.75}>
        <rect x={WORLD_L} y={y} width={span} height={1300 - y} fill={lit(p, "#2f7b96")} opacity={0.94} />
        {Array.from({ length: 34 }).map((_, i) => (
          <rect key={i} x={WORLD_L + i * 170 + Math.sin(t * 0.8 + i) * 40} y={y + 12 + (i % 7) * 42} width={120} height={4} rx={2} fill={lit(p, "#a8dcea")} opacity={0.55} />
        ))}
      </SvgLayer>
    </>
  );
};

/** The untouched planet: forests, a clean river; at night props.milky = 1 lights the galaxy. */
export const Wilds: React.FC<EnvProps> = ({ palette: p, t, seed, spec }) => {
  const milky = tweenNum((spec.props ?? {}).milky as never, t, 0);
  return (
    <>
      <Sky p={p} t={t} horizon={640} seed={seed} noSun={p.time === "night"} />
      {milky > 0 ? (
        <SvgLayer depth={0.03}>
          <g opacity={milky}>
            <path d="M-400,720 C300,520 900,360 2300,-60" fill="none" stroke="#c7d4ff" strokeWidth={230} opacity={0.11} strokeLinecap="round" />
            <path d="M-400,720 C300,520 900,360 2300,-60" fill="none" stroke="#efe4ff" strokeWidth={100} opacity={0.17} strokeLinecap="round" />
            {Array.from({ length: 520 }).map((_, i) => {
              const u = rnd(seed, "mx" + i);
              const off = (rnd(seed, "my" + i) - 0.5) * 300;
              const x = -300 + u * 2500;
              const y = 700 - u * 760 + off;
              return <circle key={i} cx={x} cy={y} r={1 + (i % 3) * 0.9} fill="#ffffff" opacity={0.45 + 0.45 * Math.sin(t * 2 + i) ** 2} />;
            })}
          </g>
        </SvgLayer>
      ) : null}
      {p.time === "night" ? null : <Clouds p={p} t={t} seed={seed} count={4} depth={0.06} />}
      <Hills p={p} seed={seed} color="#54745f" baseY={620} amp={110} depth={0.13} haze={0.55} keyName="wd1" step={400} />
      <Hills p={p} seed={seed} color="#2f5c3b" baseY={700} amp={80} depth={0.3} haze={0.25} keyName="wd2" step={250} />
      <SvgLayer depth={0.5}>
        {Array.from({ length: 58 }).map((_, i) => {
          const x = WORLD_L + i * (span / 58) + rnd(seed, "fx" + i) * 50;
          const h = 130 + rnd(seed, "fh" + i) * 120;
          const y = 780 + (i % 3) * 10;
          return <path key={i} d={`M${x - 58},${y} L${x},${y - h} L${x + 58},${y} Z`} fill={lit(p, i % 2 ? "#23492f" : "#2c5a39")} />;
        })}
      </SvgLayer>
      <Ground p={p} y={780} color="#3d6a3e" haze={0.05} />
      <SvgLayer depth={0.85}>
        <path d={`M${WORLD_L},880 C300,820 600,900 960,860 C1400,810 1700,900 ${WORLD_R},850 L${WORLD_R},980 C1700,1020 1400,940 960,990 C600,1030 300,950 ${WORLD_L},1000 Z`} fill={lit(p, "#4f9dbc")} />
        {Array.from({ length: 30 }).map((_, i) => (
          <rect key={i} x={WORLD_L + i * 200 + ((t * 40) % 200)} y={880 + (i % 5) * 22} width={110} height={4} rx={2} fill={lit(p, "#bde4ef")} opacity={0.6} />
        ))}
      </SvgLayer>
    </>
  );
};

/** Firelit hut interior: dark wattle walls with hanging herbs. */
export const HutInside: React.FC<EnvProps> = ({ palette: p, t, seed }) => (
  <>
    <SvgLayer depth={0.5}>
      <rect x={WORLD_L} y={-600} width={span} height={2200} fill={lit(p, "#3a2a1c")} />
      {Array.from({ length: Math.ceil(span / 70) }).map((_, i) => (
        <rect key={i} x={WORLD_L + i * 70} y={-200} width={12} height={1300} fill={lit(p, "#2c1f14")} />
      ))}
      {Array.from({ length: 24 }).map((_, i) => (
        <path key={i} d={`M${-800 + i * 170},${70} q12,${70 + (i % 3) * 20} ${(i % 2) * 8},${130 + (i % 3) * 30}`} stroke={lit(p, i % 2 ? "#6f8a3c" : "#8b7b3f")} strokeWidth={12} fill="none" strokeLinecap="round" />
      ))}
      <rect x={WORLD_L} y={0} width={span} height={44} fill={lit(p, "#1f150d")} />
      <circle cx={960} cy={760} r={840 + Math.sin(t * 9 + seed) * 16} fill="#ffb066" opacity={0.13} />
      <circle cx={960} cy={780} r={480 + Math.sin(t * 11) * 12} fill="#ffc98a" opacity={0.15} />
    </SvgLayer>
    <Ground p={p} y={900} color="#5a4228" haze={0} />
  </>
);

export const STONE_AGE_ENVS = {
  savanna: { component: Savanna, groundY: 880, description: 'Open grassland with acacias. props: { "lake": true }' },
  camp: { component: Camp, groundY: 880, description: "Forager camp with hide shelters." },
  tepe: { component: Tepe, groundY: 930, description: 'Hilltop stone circle. props (animatable): { "raised": 0..1 }' },
  fields: { component: Fields, groundY: 880, description: 'Hand-dug plots. props (animatable): { "crop": 0..1, "dry": 0..1 }' },
  catal: { component: Catal, groundY: 880, description: "Packed mud-brick rooftops with hatches and no streets." },
  andes: { component: Andes, groundY: 925, description: "Andes terraces with a stone road." },
  shore: { component: Shore, groundY: 880, description: 'Coast with rising sea. props (animatable): { "level": 0..1 }' },
  wilds: { component: Wilds, groundY: 880, description: 'Untouched forest and river. props (animatable): { "milky": 0..1 }' },
  hutinside: { component: HutInside, groundY: 930, description: "Firelit hut interior with hanging herbs." },
};
