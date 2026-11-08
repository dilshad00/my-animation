import React from "react";
import { random } from "remotion";
import { darken, lighten } from "../../utils/color";
import type { ObjectDef, ObjectProps } from "./types";
import { num } from "./types";

/*
 * Wildlife & farm animals. Quadrupeds share one parametric rig so they move alike.
 * All quadrupeds face RIGHT, origin = bottom-centre (on the ground).
 * Common props: { "walking": true } | { "running": true } | { "sniffing": true }, "speed": 1
 */

type Ear = "point" | "round" | "cow" | "none";
type Tail = "bushy" | "thin" | "long" | "tuft";
type Pattern = "none" | "stripes" | "spots" | "patches" | "tip";
type Spec = {
  body: [number, number]; // rx, ry
  legLen: number;
  legW: number;
  head: [number, number]; // rx, ry
  snout: [number, number]; // length, height
  neck: number; // head lift above body top
  ear: Ear;
  tail: Tail;
  pattern: Pattern;
  base: string;
  belly: string;
  dark: string;
  nose: string;
  horns?: boolean;
  udder?: boolean;
  whiskers?: boolean;
};

const SPECS: Record<string, Spec> = {
  fox: { body: [100, 36], legLen: 62, legW: 14, head: [44, 36], snout: [52, 20], neck: 20, ear: "point", tail: "bushy", pattern: "tip", base: "#d9692a", belly: "#f6efe3", dark: "#3b2418", nose: "#1d1d1d" },
  wolf: { body: [125, 46], legLen: 82, legW: 18, head: [52, 42], snout: [56, 24], neck: 26, ear: "point", tail: "bushy", pattern: "none", base: "#8d939b", belly: "#d8dade", dark: "#4a4e55", nose: "#1d1d1d" },
  wilddog: { body: [112, 40], legLen: 78, legW: 15, head: [46, 38], snout: [44, 22], neck: 20, ear: "round", tail: "bushy", pattern: "patches", base: "#a8773f", belly: "#e0c9a0", dark: "#2b2420", nose: "#1d1d1d" },
  tiger: { body: [170, 62], legLen: 88, legW: 26, head: [66, 58], snout: [34, 30], neck: 8, ear: "round", tail: "long", pattern: "stripes", base: "#e8862e", belly: "#fbf3e4", dark: "#2a1d14", nose: "#d9786e", whiskers: true },
  cow: { body: [175, 78], legLen: 92, legW: 26, head: [52, 54], snout: [40, 38], neck: 4, ear: "cow", tail: "tuft", pattern: "spots", base: "#f4f1ea", belly: "#f4f1ea", dark: "#262626", nose: "#e9a3a3", horns: true, udder: true },
  rat: { body: [58, 24], legLen: 16, legW: 8, head: [26, 20], snout: [26, 12], neck: 2, ear: "round", tail: "thin", pattern: "none", base: "#7a6f68", belly: "#a99e96", dark: "#4f4743", nose: "#e48a9a", whiskers: true },
};

const Quadruped: React.FC<ObjectProps & { kind: string }> = ({ t, color, props, L, speed, kind, seed }) => {
  const s = SPECS[kind];
  const base = L(color ?? s.base);
  const shade = darken(base, 0.18);
  const belly = L(s.belly);
  const dark = L(s.dark);
  const running = props.running === true;
  const walking = running || props.walking === true;
  const sniff = props.sniffing === true;
  const sp = num(props.speed, 1) * speed;
  const freq = (running ? 16 : 9) * sp;
  const amp = running ? 38 : 24;
  const [rx, ry] = s.body;
  const bodyY = s.legLen + ry * 0.7;
  const bob = walking ? Math.abs(Math.sin(t * freq)) * (running ? 8 : 3) : Math.sin(t * 2) * 1.5;
  const by = -bodyY - bob;
  const leg = (x: number, ph: number, back: boolean) => {
    const a = walking ? Math.sin(t * freq + ph) * amp : 0;
    const top = by + ry * 0.35;
    return (
      <g key={`${x}${ph}`} transform={`rotate(${a} ${x} ${top})`}>
        <rect x={x - s.legW / 2} y={top} width={s.legW} height={-top} rx={s.legW / 2} fill={back ? shade : base} />
        <rect x={x - s.legW / 2 - 1} y={-s.legW * 0.6} width={s.legW + 4} height={s.legW * 0.6} rx={s.legW * 0.3} fill={kind === "cow" ? dark : back ? darken(shade, 0.15) : darken(base, 0.1)} />
      </g>
    );
  };
  const tailSwing = Math.sin(t * (walking ? freq * 0.5 : 2.5)) * (s.tail === "tuft" ? 12 : 8);
  const tx = -rx * 0.92;
  const ty = by - ry * 0.3;
  const tail = (() => {
    switch (s.tail) {
      case "bushy":
        return (
          <g transform={`rotate(${tailSwing - (running ? 25 : 0)} ${tx} ${ty})`}>
            <path d={`M${tx},${ty} Q${tx - rx * 0.5},${ty - 10} ${tx - rx * 0.85},${ty + ry * 0.6} Q${tx - rx * 0.55},${ty + ry * 0.9} ${tx},${ty + ry * 0.25} Z`} fill={base} />
            {s.pattern === "tip" ? <path d={`M${tx - rx * 0.7},${ty + ry * 0.3} Q${tx - rx * 0.9},${ty + ry * 0.6} ${tx - rx * 0.85},${ty + ry * 0.62} Q${tx - rx * 0.72},${ty + ry * 0.7} ${tx - rx * 0.62},${ty + ry * 0.55} Z`} fill={belly} /> : null}
            {kind === "wilddog" ? <path d={`M${tx - rx * 0.62},${ty + ry * 0.4} L${tx - rx * 0.85},${ty + ry * 0.62} L${tx - rx * 0.6},${ty + ry * 0.66} Z`} fill={L("#f4f1ea")} /> : null}
          </g>
        );
      case "thin":
        return <path d={`M${tx},${ty + 6} Q${tx - rx * 0.8},${ty - 30 + tailSwing} ${tx - rx * 1.7},${ty + 10 + tailSwing * 2}`} stroke={L(s.nose)} strokeWidth={5} fill="none" strokeLinecap="round" />;
      case "long":
        return (
          <g>
            <path d={`M${tx},${ty} Q${tx - rx * 0.45},${ty + 10} ${tx - rx * 0.62},${ty - 40 + tailSwing * 2}`} stroke={base} strokeWidth={18} fill="none" strokeLinecap="round" />
            {[0.25, 0.42, 0.56].map((k, i) => (
              <circle key={i} cx={tx - rx * 0.62 * k * 1.3} cy={ty + 6 - k * 40} r={9} fill={dark} opacity={0.85} />
            ))}
            <circle cx={tx - rx * 0.62} cy={ty - 40 + tailSwing * 2} r={10} fill={dark} />
          </g>
        );
      case "tuft":
        return (
          <g transform={`rotate(${tailSwing} ${tx} ${ty})`}>
            <path d={`M${tx},${ty} Q${tx - 18},${ty + 50} ${tx - 12},${ty + 110}`} stroke={base} strokeWidth={8} fill="none" strokeLinecap="round" />
            <ellipse cx={tx - 12} cy={ty + 118} rx={9} ry={18} fill={dark} />
          </g>
        );
    }
  })();
  // head
  const hx = rx * 0.92;
  const hy = by - ry * 0.55 - s.neck + (sniff ? ry * 0.9 + Math.sin(t * 8) * 4 : 0) + (running ? 8 : 0);
  const [hrx, hry] = s.head;
  const [sl, sh] = s.snout;
  const blink = random(`${seed}blink${Math.floor(t * 0.7)}`) > 0.85 && (t * 0.7) % 1 < 0.1;
  const ears = (() => {
    switch (s.ear) {
      case "point":
        return [-0.35, 0.15].map((o, i) => (
          <path key={i} d={`M${hx + hrx * o - 16},${hy - hry * 0.55} L${hx + hrx * o},${hy - hry * 1.45} L${hx + hrx * o + 18},${hy - hry * 0.6} Z`} fill={i ? base : shade} />
        ));
      case "round":
        return [-0.4, 0.15].map((o, i) => (
          <g key={i}>
            <circle cx={hx + hrx * o} cy={hy - hry * 0.85} r={hrx * (kind === "wilddog" ? 0.45 : 0.3)} fill={i ? base : shade} />
            <circle cx={hx + hrx * o} cy={hy - hry * 0.85} r={hrx * (kind === "wilddog" ? 0.28 : 0.17)} fill={kind === "rat" ? L(s.nose) : dark} opacity={0.7} />
          </g>
        ));
      case "cow":
        return (
          <g>
            <ellipse cx={hx - hrx * 0.9} cy={hy - hry * 0.45} rx={30} ry={13} fill={shade} transform={`rotate(-20 ${hx - hrx * 0.9} ${hy - hry * 0.45})`} />
            <ellipse cx={hx + hrx * 0.85} cy={hy - hry * 0.5} rx={28} ry={12} fill={base} transform={`rotate(20 ${hx + hrx * 0.85} ${hy - hry * 0.5})`} />
          </g>
        );
      default:
        return null;
    }
  })();
  const spots =
    s.pattern === "spots"
      ? Array.from({ length: 5 }).map((_, i) => {
          const x = -rx * 0.7 + i * rx * 0.35 + random(`${seed}sp${i}`) * 20;
          const y = by - ry * 0.2 + (random(`${seed}spy${i}`) - 0.5) * ry * 0.9;
          const r = ry * (0.25 + random(`${seed}spr${i}`) * 0.25);
          return <path key={i} d={`M${x - r},${y} Q${x - r},${y - r * 1.1} ${x},${y - r} Q${x + r * 1.3},${y - r * 0.8} ${x + r},${y + r * 0.2} Q${x + r * 0.4},${y + r * 1.1} ${x - r * 0.3},${y + r * 0.8} Z`} fill={dark} />;
        })
      : s.pattern === "patches"
        ? Array.from({ length: 9 }).map((_, i) => {
            const x = -rx * 0.8 + random(`${seed}pa${i}`) * rx * 1.6;
            const y = by - ry * 0.6 + random(`${seed}pay${i}`) * ry * 1.2;
            return <ellipse key={i} cx={x} cy={y} rx={10 + random(`${seed}par${i}`) * 16} ry={7 + random(`${seed}pq${i}`) * 10} fill={i % 3 ? dark : L("#efe4cf")} opacity={0.9} />;
          })
        : s.pattern === "stripes"
          ? Array.from({ length: 8 }).map((_, i) => {
              const x = -rx * 0.75 + i * rx * 0.21;
              return <path key={i} d={`M${x},${by - ry * 0.98} Q${x + 14},${by - ry * 0.35} ${x - 4},${by + ry * 0.1}`} stroke={dark} strokeWidth={9} fill="none" strokeLinecap="round" />;
            })
          : null;
  return (
    <g>
      <ellipse cx={0} cy={0} rx={rx * 1.05} ry={8 + rx * 0.04} fill="#000" opacity={0.15} />
      {tail}
      {leg(-rx * 0.6, Math.PI, true)}
      {leg(rx * 0.55, 0, true)}
      <ellipse cx={0} cy={by} rx={rx} ry={ry} fill={base} />
      <ellipse cx={rx * 0.1} cy={by + ry * 0.45} rx={rx * 0.7} ry={ry * 0.45} fill={belly} />
      {s.udder ? <ellipse cx={-rx * 0.35} cy={by + ry * 0.95} rx={26} ry={16} fill={L("#f2b8b8")} /> : null}
      {spots}
      {leg(-rx * 0.45, 0, false)}
      {leg(rx * 0.7, Math.PI, false)}
      {/* neck */}
      <path d={`M${rx * 0.55},${by - ry * 0.7} Q${hx - hrx * 0.2},${hy - hry * 0.2} ${hx},${hy + hry * 0.5} L${rx * 0.75},${by + ry * 0.5} Z`} fill={base} />
      {ears}
      {s.horns ? (
        <g fill={L("#efe3c4")}>
          <path d={`M${hx - hrx * 0.4},${hy - hry * 0.8} q-10,-28 -26,-34 q22,4 34,28 Z`} />
          <path d={`M${hx + hrx * 0.35},${hy - hry * 0.85} q8,-30 24,-36 q-20,6 -30,32 Z`} />
        </g>
      ) : null}
      <ellipse cx={hx} cy={hy} rx={hrx} ry={hry} fill={base} />
      {kind === "fox" || kind === "wolf" ? <path d={`M${hx - hrx * 0.1},${hy + hry * 0.15} Q${hx + hrx * 0.5},${hy + hry * 0.95} ${hx + hrx * 0.9 + sl * 0.4},${hy + hry * 0.35} Z`} fill={belly} /> : null}
      {/* snout */}
      <ellipse cx={hx + hrx * 0.55 + sl * 0.45} cy={hy + hry * 0.2} rx={sl * 0.62} ry={sh * 0.75} fill={kind === "cow" ? L("#e9cfc4") : kind === "tiger" ? belly : base} />
      <ellipse cx={hx + hrx * 0.55 + sl} cy={hy + hry * 0.12} rx={Math.max(5, sh * 0.32)} ry={Math.max(4, sh * 0.26)} fill={L(s.nose)} />
      {s.pattern === "stripes"
        ? [-0.5, -0.2, 0.15].map((o, i) => <path key={i} d={`M${hx + hrx * o},${hy - hry * 0.95} q6,${hry * 0.35} 0,${hry * 0.5}`} stroke={dark} strokeWidth={6} fill="none" strokeLinecap="round" />)
        : null}
      {s.pattern === "patches" ? <ellipse cx={hx + hrx * 0.6 + sl * 0.5} cy={hy + hry * 0.15} rx={sl * 0.55} ry={sh * 0.6} fill={dark} opacity={0.85} /> : null}
      {/* eye */}
      {blink ? (
        <path d={`M${hx + hrx * 0.22 - 7},${hy - hry * 0.2} q7,4 14,0`} stroke="#1d1d1d" strokeWidth={3} fill="none" />
      ) : (
        <g>
          <circle cx={hx + hrx * 0.22} cy={hy - hry * 0.2} r={Math.max(3.5, hrx * 0.13)} fill={kind === "tiger" || kind === "wolf" ? L("#e8c547") : "#1d1d1d"} />
          {kind === "tiger" || kind === "wolf" ? <circle cx={hx + hrx * 0.24} cy={hy - hry * 0.2} r={Math.max(2, hrx * 0.06)} fill="#1d1d1d" /> : null}
          <circle cx={hx + hrx * 0.22 + 2} cy={hy - hry * 0.2 - 2} r={Math.max(1.2, hrx * 0.04)} fill="#fff" />
        </g>
      )}
      {s.whiskers
        ? [-6, 0, 6].map((d, i) => <path key={i} d={`M${hx + hrx * 0.55 + sl * 0.8},${hy + hry * 0.2 + d * 0.5} l${sl * 0.9},${d}`} stroke={kind === "tiger" ? "#ffffff" : "#2b2b2b"} strokeWidth={1.5} opacity={0.8} />)
        : null}
      {kind === "cow" ? (
        <g>
          <circle cx={hx + hrx * 0.55 + sl * 0.9} cy={hy + hry * 0.35} r={4} fill={darken(L(s.nose), 0.4)} />
          <path d={`M${hx + hrx * 0.4},${hy + hry * 0.65 + Math.max(0, Math.sin(t * 3)) * 4} q${sl * 0.4},6 ${sl * 0.8},0`} stroke={darken(L(s.nose), 0.4)} strokeWidth={3} fill="none" />
        </g>
      ) : null}
    </g>
  );
};

const q = (kind: string): React.FC<ObjectProps> => {
  const C: React.FC<ObjectProps> = (p) => <Quadruped {...p} kind={kind} />;
  C.displayName = kind;
  return C;
};

/** Centre-anchored house fly; buzzes in place (props.buzz: true makes it zig-zag). */
export const Fly: React.FC<ObjectProps> = ({ t, L, speed, props, seed }) => {
  const r = random(seed);
  const buzz = props.buzz !== false;
  const jx = buzz ? Math.sin(t * 7 * speed + r * 9) * 18 + Math.sin(t * 13 * speed) * 6 : 0;
  const jy = buzz ? Math.cos(t * 5 * speed + r * 7) * 12 : 0;
  const wing = Math.sin(t * 90) > 0 ? 1 : 0.35;
  return (
    <g transform={`translate(${jx} ${jy}) rotate(${Math.sin(t * 3 + r * 6) * 15})`}>
      <ellipse cx={-6} cy={-22} rx={20} ry={13 * wing} fill="#dcecff" opacity={0.65} transform="rotate(-25 -6 -22)" />
      <ellipse cx={8} cy={-22} rx={20} ry={13 * wing} fill="#dcecff" opacity={0.65} transform="rotate(25 8 -22)" />
      <ellipse cx={-10} cy={0} rx={22} ry={12} fill={L("#2b2b33")} />
      <ellipse cx={14} cy={-2} rx={11} ry={11} fill={L("#1f1f26")} />
      <circle cx={20} cy={-6} r={7} fill={L("#a1272b")} />
      {[-14, -4, 6].map((x, i) => (
        <path key={i} d={`M${x},8 l${-6 + i * 4},12`} stroke={L("#1f1f26")} strokeWidth={2.5} strokeLinecap="round" />
      ))}
      <path d="M-22,-2 h-6" stroke={L("#565663")} strokeWidth={3} />
    </g>
  );
};

/** Ground crow; pecks at the ground. Props: { "pecking": true, "caw": true } */
export const Crow: React.FC<ObjectProps> = ({ t, color, L, props, seed }) => {
  const c = L(color ?? "#25262d");
  const peck = props.pecking === true ? Math.max(0, Math.sin(t * 5 + random(seed) * 6)) : 0;
  const caw = props.caw === true && Math.sin(t * 3) > 0.6;
  return (
    <g>
      <ellipse cx={0} cy={0} rx={50} ry={6} fill="#000" opacity={0.15} />
      <path d="M-8,-30 L-12,0 M8,-30 L10,0" stroke={L("#3d3d3d")} strokeWidth={5} strokeLinecap="round" />
      <path d="M-50,-60 L-95,-45 L-60,-48 Z" fill={darken(c, 0.2)} />
      <ellipse cx={-5} cy={-60} rx={50} ry={32} fill={c} />
      <path d="M-40,-70 Q0,-95 30,-65 Q0,-55 -40,-55 Z" fill={lighten(c, 0.12)} />
      <g transform={`rotate(${peck * 55} 30 -70)`}>
        <circle cx={40} cy={-88} r={24} fill={c} />
        <path d={`M58,-94 L${92},-86 L58,${caw ? -70 : -80} Z`} fill={L("#3a3a3a")} />
        {caw ? <path d="M58,-82 L88,-72 L58,-74 Z" fill={L("#3a3a3a")} /> : null}
        <circle cx={46} cy={-94} r={4.5} fill="#f0f0f0" />
        <circle cx={47} cy={-94} r={2.5} fill="#111" />
      </g>
    </g>
  );
};

/** Centre-anchored flying seagull (flaps). */
export const Gull: React.FC<ObjectProps> = ({ t, L, speed, seed }) => {
  const f = Math.sin(t * 7 * speed + random(seed) * 6);
  const w = (side: number) => `M0,-4 Q${side * 40},${-34 - f * 30} ${side * 95},${-10 - f * 55} Q${side * 60},${16 - f * 14} ${side * 8},14 Z`;
  return (
    <g>
      <path d={w(-1)} fill={L("#e6e9ee")} stroke={L("#9aa3ad")} strokeWidth={2} />
      <path d={`M-95,${-10 - f * 55} l14,4`} stroke={L("#2b2b2b")} strokeWidth={6} strokeLinecap="round" />
      <ellipse cx={0} cy={6} rx={38} ry={14} fill={L("#ffffff")} />
      <circle cx={34} cy={-2} r={12} fill={L("#ffffff")} />
      <path d="M44,-2 L60,2 L44,5 Z" fill={L("#f2b134")} />
      <circle cx={38} cy={-5} r={2.5} fill="#111" />
      <path d="M-36,4 L-56,-2 L-50,12 Z" fill={L("#d5d9df")} />
      <path d={w(1)} fill={L("#f4f6f8")} stroke={L("#9aa3ad")} strokeWidth={2} />
      <path d={`M95,${-10 - f * 55} l-14,4`} stroke={L("#2b2b2b")} strokeWidth={6} strokeLinecap="round" />
    </g>
  );
};

/** Ground frog. Props: { "hop": true, "struggling": true } (struggling = gasping, slumped) */
export const Frog: React.FC<ObjectProps> = ({ t, color, L, props, seed }) => {
  const c = L(color ?? "#5fa84a");
  const hopping = props.hop === true;
  const struggling = props.struggling === true;
  const ph = (t * 1.2 + random(seed)) % 1;
  const hop = hopping && ph < 0.35 ? Math.sin((ph / 0.35) * Math.PI) : 0;
  const throat = struggling ? 0.6 + 0.4 * Math.abs(Math.sin(t * 6)) : 0.8 + 0.2 * Math.sin(t * 4);
  const slump = struggling ? 10 : 0;
  return (
    <g transform={`translate(${hop * 30} ${-hop * 60})`}>
      <ellipse cx={0} cy={hop * 60} rx={60} ry={7} fill="#000" opacity={0.15 * (1 - hop * 0.6)} />
      <ellipse cx={-30} cy={-18} rx={34} ry={20} fill={darken(c, 0.12)} transform={`rotate(${-hop * 40} -30 -18)`} />
      <path d={`M-58,-2 L-80,${2 + hop * 20} L-46,0 Z`} fill={darken(c, 0.12)} />
      <ellipse cx={0} cy={-30 + slump} rx={52} ry={32 - slump * 0.6} fill={c} />
      <ellipse cx={22} cy={-12 + slump} rx={20 * throat} ry={13 * throat} fill={lighten(c, 0.45)} />
      <path d={`M22,-4 L30,${hop * 10} M38,-10 L48,${hop * 10 - 2}`} stroke={darken(c, 0.1)} strokeWidth={8} strokeLinecap="round" />
      <circle cx={10} cy={-60 + slump} r={14} fill={c} />
      <circle cx={36} cy={-56 + slump} r={14} fill={c} />
      <circle cx={10} cy={-62 + slump} r={8} fill="#f6f2c8" />
      <circle cx={36} cy={-58 + slump} r={8} fill="#f6f2c8" />
      <ellipse cx={11} cy={-62 + slump} rx={3} ry={struggling ? 1.5 : 5} fill="#111" />
      <ellipse cx={37} cy={-58 + slump} rx={3} ry={struggling ? 1.5 : 5} fill="#111" />
      <path d={`M20,${-34 + slump} q14,${struggling ? 8 : 6} 30,0`} stroke={darken(c, 0.4)} strokeWidth={3} fill="none" />
      {Array.from({ length: 4 }).map((_, i) => (
        <circle key={i} cx={-30 + i * 14} cy={-42 + (i % 2) * 8 + slump} r={4} fill={darken(c, 0.25)} opacity={0.7} />
      ))}
    </g>
  );
};

export const WILDLIFE: Record<string, ObjectDef> = {
  fox: { component: q("fox"), w: 300, h: 190, category: "animals", description: 'props: { "walking" | "running" | "sniffing": true }' },
  wolf: { component: q("wolf"), w: 370, h: 250, category: "animals", description: 'props: { "walking" | "running" | "sniffing": true }' },
  wilddog: { component: q("wilddog"), w: 330, h: 220, category: "animals", description: 'Feral/wild dog. props: { "walking" | "running" | "sniffing": true }' },
  tiger: { component: q("tiger"), w: 480, h: 290, category: "animals", description: 'props: { "walking" | "running" | "sniffing": true }' },
  cow: { component: q("cow"), w: 500, h: 330, category: "animals", description: 'props: { "walking": true, "sniffing": true (grazing) }' },
  rat: { component: q("rat"), w: 200, h: 80, category: "animals", description: 'props: { "walking" | "running" | "sniffing": true }' },
  fly: { component: Fly, w: 70, h: 50, category: "animals", anchor: "center", description: 'House fly, buzzes about. props: { "buzz": false } to hold still' },
  crow: { component: Crow, w: 190, h: 120, category: "animals", description: 'props: { "pecking": true, "caw": true }' },
  gull: { component: Gull, w: 200, h: 90, category: "animals", anchor: "center", description: "Flying seagull" },
  frog: { component: Frog, w: 160, h: 90, category: "animals", description: 'props: { "hop": true, "struggling": true }' },
};

