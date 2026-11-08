// Video-003 props: Stone Age tools and a few story objects. Registered additively in src/components/objects/registry.tsx.
import React from "react";
import { darken, lighten } from "../../../src/utils/color";
import { tweenNum } from "../../../src/utils/tween";
import type { ObjectDef, ObjectProps } from "../../../src/components/objects/types";
import { num } from "../../../src/components/objects/types";

const WOOD = "#8a5a33";
const STONE = "#8d8678";
const FIBRE = "#c9a66b";
const CLAY = "#b98a58";

/** Knapped flint hand tool (centre origin, ≈ 180×260). */
const StoneTool: React.FC<ObjectProps> = ({ L, color }) => {
  const c = color ?? STONE;
  return (
    <g>
      <path d="M0,-130 L62,-70 L88,30 L52,118 L-46,126 L-90,40 L-64,-66 Z" fill={L(c)} />
      <path d="M0,-130 L24,-48 L-20,8 L-64,-66 Z" fill={L(lighten(c, 0.2))} />
      <path d="M24,-48 L88,30 L30,48 L-20,8 Z" fill={L(lighten(c, 0.08))} />
      <path d="M-20,8 L30,48 L52,118 L-46,126 Z" fill={L(darken(c, 0.14))} />
      <path d="M-64,-66 L-20,8 L-46,126 L-90,40 Z" fill={L(darken(c, 0.26))} />
    </g>
  );
};

/** Sharpened stick (centre origin, ≈ 60×520), burnt point at the top. */
const SharpStick: React.FC<ObjectProps> = ({ L }) => (
  <g>
    <path d="M-12,260 L-9,-180 L0,-260 L9,-180 L12,260 Z" fill={L(WOOD)} />
    <path d="M-9,-180 L0,-260 L9,-180 Q0,-170 -9,-180 Z" fill={L("#2b1d14")} />
    <path d="M3,-150 L5,240" stroke={L(darken(WOOD, 0.25))} strokeWidth={4} fill="none" />
  </g>
);

/** Rope tied in an overhand knot (centre origin, ≈ 520×200). */
const Knot: React.FC<ObjectProps> = ({ L, color }) => {
  const c = color ?? FIBRE;
  const rope = (d: string) => (
    <>
      <path d={d} fill="none" stroke={L(darken(c, 0.35))} strokeWidth={34} strokeLinecap="round" />
      <path d={d} fill="none" stroke={L(c)} strokeWidth={24} strokeLinecap="round" />
    </>
  );
  return (
    <g>
      {rope("M-260,20 C-120,30 -80,-80 10,-70 C90,-60 90,50 10,60")}
      {rope("M260,-10 C130,-20 80,70 -10,60 C-90,50 -70,-60 20,-40")}
    </g>
  );
};

/** Woven basket (ground origin, ≈ 300×220). Props: { "full": true } */
const Basket: React.FC<ObjectProps> = ({ L, props }) => (
  <g>
    {props.full ? <ellipse cx={0} cy={-214} rx={130} ry={46} fill={L("#c9a227")} /> : null}
    <path d="M-150,-210 L150,-210 L108,0 L-108,0 Z" fill={L(FIBRE)} />
    {[-168, -126, -84, -42].map((y, i) => (
      <path key={y} d={`M${-146 + i * 10},${y} Q0,${y + 16} ${146 - i * 10},${y}`} fill="none" stroke={L(darken(FIBRE, 0.3))} strokeWidth={7} />
    ))}
    {[-100, -50, 0, 50, 100].map((x) => (
      <path key={x} d={`M${x},-208 L${x * 0.72},-4`} fill="none" stroke={L(darken(FIBRE, 0.18))} strokeWidth={6} />
    ))}
    <ellipse cx={0} cy={-210} rx={152} ry={22} fill="none" stroke={L(darken(FIBRE, 0.4))} strokeWidth={13} />
  </g>
);

/** Weighted digging stick (ground origin, ≈ 90×520). */
const DiggingStick: React.FC<ObjectProps> = ({ L }) => (
  <g>
    <path d="M-9,-520 L9,-520 L10,-30 L0,0 L-10,-30 Z" fill={L(WOOD)} />
    <ellipse cx={0} cy={-150} rx={40} ry={32} fill={L(STONE)} />
    <ellipse cx={-10} cy={-160} rx={16} ry={10} fill={L(lighten(STONE, 0.25))} />
  </g>
);

/** Flint-toothed wooden sickle (centre origin, ≈ 300×260). */
const Sickle: React.FC<ObjectProps> = ({ L }) => (
  <g>
    <path d="M-120,110 C-150,-40 -30,-130 120,-100 C20,-90 -70,-30 -82,110 Z" fill={L(WOOD)} />
    {[0, 1, 2, 3, 4].map((i) => {
      const a = i / 4;
      const x = -74 + a * 180 - 10 * Math.sin(a * 3.1);
      const y = 40 - a * 130 + 36 * Math.sin(a * 3.1) * 0.2;
      return <path key={i} d={`M${x - 12},${y} L${x + 18},${y - 16} L${x + 20},${y + 18} Z`} fill={L("#e4e0d4")} />;
    })}
  </g>
);

/** T-shaped carved limestone pillar (ground origin, ≈ 340×620). Props: { "carving": "fox|bird|none" } */
const TPillar: React.FC<ObjectProps> = ({ L, props, color }) => {
  const c = color ?? "#d6c8a8";
  const relief = L(darken(c, 0.3));
  return (
    <g>
      <rect x={-54} y={-500} width={108} height={500} fill={L(c)} />
      <rect x={24} y={-500} width={30} height={500} fill={L(darken(c, 0.16))} />
      <rect x={-170} y={-620} width={340} height={124} rx={8} fill={L(lighten(c, 0.07))} />
      <rect x={-170} y={-520} width={340} height={24} fill={L(darken(c, 0.2))} />
      {props.carving === "bird" ? (
        <path d="M-30,-400 Q0,-450 34,-404 L18,-392 L34,-340 L-4,-368 L-34,-340 Z" fill={relief} />
      ) : props.carving === "none" ? null : (
        <path d="M-34,-300 L-20,-372 L-6,-340 L8,-340 L22,-372 L34,-300 L10,-254 L-10,-254 Z M-40,-212 L40,-212 L26,-120 L-26,-120 Z" fill={relief} />
      )}
    </g>
  );
};

/** Clay accounting tablet (centre origin, ≈ 420×300). Props: { "marks": 0..1 animatable } */
const ClayTablet: React.FC<ObjectProps> = ({ L, props, t }) => {
  const marks = tweenNum(props.marks as never, t, 1);
  const cells = Array.from({ length: 24 });
  return (
    <g>
      <rect x={-210} y={-150} width={420} height={300} rx={46} fill={L(darken(CLAY, 0.22))} transform="translate(8 10)" />
      <rect x={-210} y={-150} width={420} height={300} rx={46} fill={L(CLAY)} />
      {cells.map((_, i) => {
        if (i / cells.length >= marks) return null;
        const x = -168 + (i % 6) * 66;
        const y = -106 + Math.floor(i / 6) * 66;
        return i % 3 === 0 ? (
          <circle key={i} cx={x + 18} cy={y + 18} r={15} fill={L(darken(CLAY, 0.45))} />
        ) : (
          <path key={i} d={`M${x},${y} L${x + 36},${y + 8} L${x},${y + 16} Z M${x + 8},${y + 18} L${x + 30},${y + 38}`} fill={L(darken(CLAY, 0.45))} stroke={L(darken(CLAY, 0.45))} strokeWidth={6} />
        );
      })}
    </g>
  );
};

/** Inca khipu: main cord with hanging knotted strings (top-centre origin, ≈ 760×460). */
const Khipu: React.FC<ObjectProps> = ({ L, t }) => {
  const cols = ["#b5541a", "#e0c070", "#3f6c8f", "#7a3b52", "#6f8a3c"];
  return (
    <g>
      <path d="M-390,0 Q0,28 390,0" fill="none" stroke={L("#6b4a2b")} strokeWidth={18} strokeLinecap="round" />
      {Array.from({ length: 15 }).map((_, i) => {
        const x = -350 + i * 50;
        const len = 300 + ((i * 53) % 140);
        const sway = Math.sin(t * 1.2 + i * 0.7) * 9;
        const c = L(cols[i % cols.length]);
        return (
          <g key={i}>
            <path d={`M${x},12 Q${x + sway / 2},${len / 2} ${x + sway},${len}`} fill="none" stroke={c} strokeWidth={9} strokeLinecap="round" />
            {Array.from({ length: 1 + ((i * 7) % 4) }).map((__, k) => {
              const y = 90 + k * 62 + ((i * 11) % 30);
              return <ellipse key={k} cx={x + (sway * y) / len} cy={y} rx={13} ry={17} fill={c} stroke={L("#2a1c10")} strokeWidth={2} />;
            })}
          </g>
        );
      })}
    </g>
  );
};

/** Wooden ladder (ground origin, ≈ 120×420). */
const Ladder: React.FC<ObjectProps> = ({ L, props }) => {
  const h = num(props.height, 420);
  return (
    <g>
      <rect x={-54} y={-h} width={13} height={h} fill={L(WOOD)} />
      <rect x={41} y={-h} width={13} height={h} fill={L(WOOD)} />
      {Array.from({ length: Math.floor(h / 60) }).map((_, i) => (
        <rect key={i} x={-46} y={-44 - i * 60} width={92} height={12} rx={4} fill={L(lighten(WOOD, 0.14))} />
      ))}
    </g>
  );
};

/** Human skull with a surgical hole; props.heal 0..1 (animatable) grows new bone round it (centre origin, ≈ 420×480). */
const Skull: React.FC<ObjectProps> = ({ L, props, t }) => {
  const heal = tweenNum(props.heal as never, t, 0);
  const bone = L("#e7dcc2");
  const dark = L("#2a2118");
  return (
    <g>
      <path d="M0,-240 C150,-240 214,-130 200,-20 C192,50 140,70 126,120 L116,190 L-116,190 L-126,120 C-140,70 -192,50 -200,-20 C-214,-130 -150,-240 0,-240 Z" fill={bone} />
      <ellipse cx={-78} cy={10} rx={54} ry={60} fill={dark} />
      <ellipse cx={78} cy={10} rx={54} ry={60} fill={dark} />
      <path d="M0,60 L-28,120 L28,120 Z" fill={dark} />
      {[-72, -36, 0, 36, 72].map((x) => (
        <rect key={x} x={x - 12} y={146} width={24} height={44} rx={3} fill={L("#cfc2a4")} stroke={dark} strokeWidth={3} />
      ))}
      <circle cx={46} cy={-150} r={58} fill={L("#c4b48f")} opacity={heal} />
      <circle cx={46} cy={-150} r={46 - heal * 12} fill={dark} />
    </g>
  );
};

/** Stone-ringed hearth (ground origin, ≈ 300×60); pair with the fire effect. */
const Hearth: React.FC<ObjectProps> = ({ L }) => (
  <g>
    <ellipse cx={0} cy={-8} rx={130} ry={24} fill={L("#231a14")} />
    {[-132, -92, -44, 6, 52, 98, 136].map((x, i) => (
      <ellipse key={x} cx={x} cy={-8 + (i % 2) * 14} rx={32} ry={22} fill={L(i % 2 ? "#6f695d" : "#857e70")} />
    ))}
  </g>
);

/** Flint-tipped spear (centre origin, ≈ 50×640). */
const Spear: React.FC<ObjectProps> = ({ L }) => (
  <g>
    <rect x={-6} y={-240} width={12} height={560} fill={L(WOOD)} />
    <path d="M0,-320 L24,-250 L10,-226 L-10,-226 L-24,-250 Z" fill={L("#6d7782")} />
    <rect x={-10} y={-234} width={20} height={26} fill={L(FIBRE)} />
  </g>
);

/** Earth at night from orbit, city lights controlled by props.lights 0..1 (animatable), centre origin, r≈380. */
const NightEarth: React.FC<ObjectProps> = ({ t, props }) => {
  const lights = tweenNum(props.lights as never, t, 1);
  const land = ["M-290,-150 C-180,-260 -60,-230 -20,-130 C10,-40 -100,10 -190,-30 C-260,-50 -320,-90 -290,-150 Z", "M60,-280 C190,-290 310,-180 320,-40 C260,20 170,-30 120,-100 C80,-160 20,-220 60,-280 Z", "M-120,70 C-40,50 60,90 70,180 C60,280 -40,330 -100,290 C-150,220 -180,110 -120,70 Z", "M180,110 C250,90 310,140 290,200 C240,250 170,210 180,110 Z"];
  const dots = Array.from({ length: 150 }).map((_, i) => {
    const a = (i * 137.5 * Math.PI) / 180;
    const r = 355 * Math.sqrt((i + 0.5) / 150);
    return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.98, on: ((i * 29) % 100) / 100, s: 2 + (i % 4) * 1.5 };
  });
  return (
    <g>
      <circle r={410} fill="#2f6fd0" opacity={0.2} />
      <circle r={392} fill="#3f86e8" opacity={0.28} />
      <circle r={380} fill="#071427" />
      {land.map((d) => (
        <path key={d} d={d} fill="#14283a" />
      ))}
      {dots.map((d, i) => (d.on < lights ? <circle key={i} cx={d.x} cy={d.y} r={d.s} fill="#ffd27a" opacity={0.7 + 0.3 * Math.sin(t * 4 + i)} /> : null))}
      <path d="M-380,0 A380,380 0 0 0 380,0 A420,330 0 0 1 -380,0 Z" fill="#000000" opacity={0.32} />
    </g>
  );
};

/** Grain sack with fertiliser marking (ground origin). */
const Fertiliser: React.FC<ObjectProps> = ({ L }) => (
  <g>
    <path d="M-120,0 C-150,-120 -120,-260 -92,-290 L92,-290 C120,-260 150,-120 120,0 Z" fill={L("#e7e1d1")} />
    <rect x={-96} y={-214} width={192} height={108} fill={L("#2f7d4f")} />
    <path d="M-90,-292 Q0,-326 90,-292" fill="none" stroke={L("#b0a78f")} strokeWidth={14} strokeLinecap="round" />
    <text x={0} y={-146} fontSize={58} fontWeight={800} fontFamily="Poppins" fill="#ffffff" textAnchor="middle">N</text>
  </g>
);

/** Ripe barley stalk clump (ground origin, ≈ 180×260). */
const Barley: React.FC<ObjectProps> = ({ L, t, seed }) => {
  const off = seed.length;
  return (
    <g>
      {[-60, -30, 0, 30, 60].map((x, i) => {
        const sway = Math.sin(t * 1.6 + i + off) * 8;
        return (
          <g key={x}>
            <path d={`M${x},0 Q${x},-120 ${x + sway},-200`} fill="none" stroke={L("#b1923f")} strokeWidth={6} />
            {[0, 1, 2, 3].map((k) => (
              <ellipse key={k} cx={x + sway + (k % 2 ? 7 : -7)} cy={-204 - k * 16} rx={8} ry={13} fill={L("#d9b85a")} />
            ))}
          </g>
        );
      })}
    </g>
  );
};

/** Stone sling or arrow point flying (centre origin), plain flint arrow. */
const Arrow: React.FC<ObjectProps> = ({ L }) => (
  <g>
    <rect x={-160} y={-3} width={300} height={6} fill={L(WOOD)} />
    <path d="M190,0 L130,-20 L142,0 L130,20 Z" fill={L("#646c76")} />
    <path d="M-160,0 L-200,-20 L-175,0 L-200,20 Z" fill={L("#b5541a")} />
  </g>
);

const def = (component: React.FC<ObjectProps>, w: number, h: number, description: string, anchor?: "center"): ObjectDef => ({
  component,
  w,
  h,
  category: "stone age",
  description,
  ...(anchor ? { anchor } : {}),
});

export const STONE_AGE: Record<string, ObjectDef> = {
  stonetool: def(StoneTool, 180, 260, "Knapped flint hand tool", "center"),
  sharpstick: def(SharpStick, 60, 520, "Fire-hardened sharpened stick", "center"),
  knot: def(Knot, 520, 200, "Rope knot", "center"),
  basket: def(Basket, 300, 220, 'Woven basket. props: { "full": true }'),
  diggingstick: def(DiggingStick, 90, 520, "Stone-weighted digging stick"),
  sickle: def(Sickle, 300, 260, "Flint-toothed sickle", "center"),
  tpillar: def(TPillar, 340, 620, 'Carved T-pillar. props: { "carving": "fox|bird|none" }'),
  claytablet: def(ClayTablet, 420, 300, 'Clay tablet. props: { "marks": 0..1 }', "center"),
  khipu: def(Khipu, 760, 460, "Knotted cord record", "center"),
  ladder: def(Ladder, 120, 420, 'Wooden ladder. props: { "height": 420 }'),
  skull: def(Skull, 420, 480, 'Trepanned skull. props: { "heal": 0..1 }', "center"),
  hearth: def(Hearth, 300, 60, "Stone-ringed hearth"),
  spear: def(Spear, 50, 640, "Flint-tipped spear", "center"),
  nightearth: def(NightEarth, 820, 820, 'Earth at night. props: { "lights": 0..1 }', "center"),
  fertiliser: def(Fertiliser, 300, 320, "Fertiliser sack"),
  barley: def(Barley, 180, 260, "Barley clump"),
  flintarrow: def(Arrow, 400, 40, "Flint-tipped arrow", "center"),
};
