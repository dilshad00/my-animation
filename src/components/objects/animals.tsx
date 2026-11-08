import React from "react";
import { random } from "remotion";
import { darken, lighten } from "../../utils/color";
import type { ObjectDef, ObjectProps } from "./types";

/** Faces right. Props: { "walking": true } animates legs. */
export const Dog: React.FC<ObjectProps> = ({ t, color, props, L }) => {
  const c = L(color ?? "#c68b59");
  const d = darken(c, 0.2);
  const walking = props.walking === true;
  const leg = (x: number, ph: number) => {
    const a = walking ? Math.sin(t * 10 + ph) * 25 : 0;
    return <rect key={x} x={x - 9} y={-70} width={18} height={70} rx={9} fill={ph > 1 ? d : c} transform={`rotate(${a} ${x} -64)`} />;
  };
  const wag = Math.sin(t * 14) * 25;
  return (
    <g>
      <ellipse cx={0} cy={0} rx={110} ry={10} fill="#000" opacity={0.15} />
      {leg(-55, Math.PI)}
      {leg(55, 0)}
      <g transform={`rotate(${-30 + wag} -90 -100)`}>
        <path d="M-90,-100 Q-130,-130 -125,-170" stroke={c} strokeWidth={16} fill="none" strokeLinecap="round" />
      </g>
      <ellipse cx={0} cy={-100} rx={105} ry={48} fill={c} />
      <ellipse cx={10} cy={-82} rx={70} ry={26} fill={lighten(c, 0.2)} />
      {leg(-40, 0)}
      {leg(70, Math.PI)}
      <g transform={`rotate(${Math.sin(t * 2) * 4} 90 -120)`}>
        <ellipse cx={115} cy={-150} rx={55} ry={48} fill={c} />
        <ellipse cx={160} cy={-130} rx={32} ry={22} fill={lighten(c, 0.2)} />
        <circle cx={186} cy={-138} r={10} fill="#1d1d1d" />
        <circle cx={128} cy={-160} r={8} fill="#1d1d1d" />
        <circle cx={131} cy={-163} r={3} fill="#fff" />
        <path d="M85,-185 Q60,-150 78,-110 Q100,-140 100,-180 Z" fill={d} />
        <path d="M150,-118 Q165,-100 178,-118" stroke="#1d1d1d" strokeWidth={3} fill="none" />
        <ellipse cx={168} cy={-106} rx={8} ry={12} fill="#ef476f" opacity={Math.sin(t * 3) > 0 ? 1 : 0} />
      </g>
    </g>
  );
};

export const Cat: React.FC<ObjectProps> = ({ t, color, L }) => {
  const c = L(color ?? "#f4a261");
  const d = darken(c, 0.2);
  const blink = (t % 3.3) < 0.12;
  return (
    <g>
      <ellipse cx={0} cy={0} rx={80} ry={8} fill="#000" opacity={0.15} />
      <path d={`M-60,-20 Q-140,-40 ${-120 + Math.sin(t * 1.5) * 20},-${140 + Math.sin(t * 2) * 10}`} stroke={c} strokeWidth={14} fill="none" strokeLinecap="round" />
      <ellipse cx={-10} cy={-55} rx={70} ry={55} fill={c} />
      {[-40, 20].map((x) => (
        <ellipse key={x} cx={x} cy={-8} rx={18} ry={10} fill={lighten(c, 0.15)} />
      ))}
      {[-30, 0].map((x) => (
        <path key={x} d={`M${x - 20},-90 Q${x},-100 ${x + 20},-90`} stroke={d} strokeWidth={6} fill="none" />
      ))}
      <g transform={`translate(55 -110) rotate(${Math.sin(t * 0.8) * 6})`}>
        <path d="M-40,-20 L-38,-72 L-8,-40 Z" fill={c} />
        <path d="M40,-20 L38,-72 L8,-40 Z" fill={c} />
        <path d="M-30,-30 L-30,-60 L-14,-40 Z" fill="#ffb4a2" />
        <circle r={46} fill={c} />
        {blink ? (
          <g stroke="#1d1d1d" strokeWidth={4}>
            <line x1={-26} y1={-6} x2={-10} y2={-6} />
            <line x1={10} y1={-6} x2={26} y2={-6} />
          </g>
        ) : (
          <g>
            <ellipse cx={-18} cy={-6} rx={9} ry={12} fill="#2b9348" />
            <ellipse cx={18} cy={-6} rx={9} ry={12} fill="#2b9348" />
            <ellipse cx={-18} cy={-6} rx={3} ry={10} fill="#111" />
            <ellipse cx={18} cy={-6} rx={3} ry={10} fill="#111" />
          </g>
        )}
        <path d="M-6,10 L6,10 L0,17 Z" fill="#ff8fa3" />
        <path d="M0,17 Q-8,26 -14,20 M0,17 Q8,26 14,20" stroke="#1d1d1d" strokeWidth={2.5} fill="none" />
        {[-1, 1].map((s) => (
          <g key={s} stroke="#fff" strokeWidth={2}>
            <line x1={s * 20} y1={16} x2={s * 60} y2={8} />
            <line x1={s * 20} y1={20} x2={s * 60} y2={24} />
          </g>
        ))}
      </g>
    </g>
  );
};

/** Centre-anchored flying bird. Faces right. */
export const Bird: React.FC<ObjectProps> = ({ t, color, speed, L, seed }) => {
  const c = L(color ?? "#3a86ff");
  const flap = Math.sin(t * 14 * speed + random(seed) * 6);
  return (
    <g>
      <path d={`M-10,-4 Q-40,${-40 * flap} -80,${-30 * flap - 6} Q-40,${-8 * flap} -10,6 Z`} fill={darken(c, 0.2)} />
      <ellipse cx={0} cy={0} rx={44} ry={20} fill={c} />
      <path d="M-40,0 L-70,-12 L-66,12 Z" fill={darken(c, 0.15)} />
      <circle cx={36} cy={-12} r={18} fill={c} />
      <circle cx={42} cy={-16} r={4} fill="#111" />
      <path d="M52,-12 L70,-6 L52,-2 Z" fill={L("#ffb703")} />
      <ellipse cx={8} cy={8} rx={26} ry={9} fill={lighten(c, 0.35)} />
      <path d={`M0,-4 Q-30,${-50 * flap} -70,${-44 * flap - 4} Q-30,${-14 * flap} 4,4 Z`} fill={lighten(c, 0.1)} />
    </g>
  );
};

/** Centre-anchored fish. Faces right. */
export const Fish: React.FC<ObjectProps> = ({ t, color, speed, L, seed }) => {
  const c = L(color ?? "#ff9f1c");
  const wag = Math.sin(t * 8 * speed + random(seed) * 6) * 14;
  return (
    <g>
      <path d={`M-50,0 L-95,${-30 + wag} L-90,${30 + wag} Z`} fill={darken(c, 0.15)} />
      <ellipse cx={0} cy={0} rx={60} ry={34} fill={c} />
      <path d="M-10,-32 Q10,-60 30,-28 Z" fill={darken(c, 0.15)} />
      <path d="M-15,-30 Q-5,0 -15,30" stroke="#fff" strokeWidth={8} fill="none" opacity={0.8} />
      <path d="M10,-32 Q20,0 10,32" stroke="#fff" strokeWidth={6} fill="none" opacity={0.6} />
      <circle cx={34} cy={-8} r={9} fill="#fff" />
      <circle cx={36} cy={-8} r={5} fill="#111" />
      <path d="M50,10 Q56,14 50,16" stroke="#7a2e00" strokeWidth={3} fill="none" />
    </g>
  );
};

/** Centre-anchored whale. Faces right. */
export const Whale: React.FC<ObjectProps> = ({ t, color, L }) => {
  const c = L(color ?? "#4a6fa5");
  const tail = Math.sin(t * 2) * 12;
  return (
    <g>
      <g transform={`rotate(${tail} -220 0)`}>
        <path d="M-200,-10 Q-260,-20 -300,-80 Q-270,-30 -250,-10 Q-280,30 -310,60 Q-260,30 -200,20 Z" fill={darken(c, 0.15)} />
      </g>
      <path d="M-220,0 Q-150,-120 60,-110 Q240,-100 260,20 Q240,90 60,90 Q-120,90 -220,0 Z" fill={c} />
      <path d="M-180,30 Q-60,100 100,88 Q220,80 250,40 Q180,70 60,70 Q-80,70 -180,30 Z" fill={lighten(c, 0.5)} />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M${60 + i * 30},${70} L${60 + i * 30},${86}`} stroke={lighten(c, 0.3)} strokeWidth={4} />
      ))}
      <path d="M0,40 Q-40,100 -80,90 Q-50,60 -20,30 Z" fill={darken(c, 0.15)} />
      <circle cx={180} cy={0} r={10} fill="#111" />
      <circle cx={183} cy={-3} r={3} fill="#fff" />
      <path d="M200,40 Q230,46 250,30" stroke={darken(c, 0.3)} strokeWidth={4} fill="none" />
    </g>
  );
};

/** Centre-anchored butterfly */
export const Butterfly: React.FC<ObjectProps> = ({ t, color, speed, L, seed }) => {
  const c = L(color ?? "#f72585");
  const f = 0.25 + 0.75 * Math.abs(Math.sin(t * 9 * speed + random(seed) * 6));
  return (
    <g>
      {[-1, 1].map((s) => (
        <g key={s} transform={`scale(${s * f} 1)`}>
          <path d="M0,0 Q50,-70 80,-40 Q90,0 0,4 Z" fill={c} />
          <path d="M0,4 Q60,10 60,50 Q30,70 0,10 Z" fill={darken(c, 0.15)} />
          <circle cx={50} cy={-30} r={10} fill={lighten(c, 0.5)} />
        </g>
      ))}
      <rect x={-4} y={-30} width={8} height={60} rx={4} fill="#222" />
      <path d="M0,-30 Q-10,-50 -18,-54 M0,-30 Q10,-50 18,-54" stroke="#222" strokeWidth={2} fill="none" />
    </g>
  );
};

export const Jellyfish: React.FC<ObjectProps> = ({ t, color, L, seed }) => {
  const c = L(color ?? "#c77dff");
  const pulse = 1 + Math.sin(t * 3 + random(seed) * 6) * 0.08;
  return (
    <g transform={`translate(0 ${Math.sin(t * 1.5) * 12})`}>
      {Array.from({ length: 6 }).map((_, i) => {
        const x = -45 + i * 18;
        const w = Math.sin(t * 2.5 + i) * 12;
        return <path key={i} d={`M${x},0 Q${x + w},50 ${x - w},100 Q${x + w},140 ${x},180`} stroke={c} strokeWidth={5} fill="none" opacity={0.7} strokeLinecap="round" />;
      })}
      <g transform={`scale(${pulse} ${2 - pulse})`}>
        <path d="M-70,0 Q-70,-90 0,-90 Q70,-90 70,0 Q35,-12 0,0 Q-35,-12 -70,0 Z" fill={c} opacity={0.85} />
        <path d="M-40,-50 Q-30,-75 0,-78" stroke="#fff" strokeWidth={8} opacity={0.5} fill="none" strokeLinecap="round" />
      </g>
    </g>
  );
};

export const ANIMALS: Record<string, ObjectDef> = {
  dog: { component: Dog, w: 300, h: 200, category: "animals", description: 'props: { "walking": true }' },
  cat: { component: Cat, w: 230, h: 180, category: "animals" },
  bird: { component: Bird, w: 150, h: 80, category: "animals", anchor: "center" },
  fish: { component: Fish, w: 190, h: 80, category: "animals", anchor: "center" },
  whale: { component: Whale, w: 570, h: 220, category: "animals", anchor: "center" },
  butterfly: { component: Butterfly, w: 170, h: 120, category: "animals", anchor: "center" },
  jellyfish: { component: Jellyfish, w: 150, h: 280, category: "animals", anchor: "center" },
};
