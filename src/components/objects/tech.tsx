import React from "react";
import { random } from "remotion";
import { darken, lighten } from "../../utils/color";
import { useSvgId } from "../../utils/svg";
import { tweenColor } from "../../utils/tween";
import type { ObjectDef, ObjectProps } from "./types";
import { num, str } from "./types";

/** Animated screen contents: props.screen = code | chart | video | text | globe | off */
export const ScreenContent: React.FC<{ w: number; h: number; t: number; kind: string; text?: string; accent: string; seed: string }> = ({
  w,
  h,
  t,
  kind,
  text,
  accent,
  seed,
}) => {
  const clip = useSvgId("scr");
  let inner: React.ReactNode = null;
  if (kind === "code") {
    const lines = Math.floor(h / 18);
    const scroll = (t * 20) % 18;
    inner = Array.from({ length: lines + 2 }).map((_, i) => {
      const k = i + Math.floor(t * 20 / 18);
      const indent = (random(seed + "i" + k) * 3) | 0;
      const len = 0.25 + random(seed + "l" + k) * 0.5;
      const col = ["#7bdff2", "#f7aef8", "#b2f7ef", "#ffd166"][k % 4];
      return <rect key={i} x={10 + indent * 14} y={8 + i * 18 - scroll} width={(w - 40) * len} height={8} rx={4} fill={col} opacity={0.85} />;
    });
  } else if (kind === "chart") {
    inner = (
      <g>
        {Array.from({ length: 6 }).map((_, i) => {
          const v = 0.3 + 0.6 * Math.abs(Math.sin(t * 0.8 + i * 0.9));
          const bw = (w - 30) / 6;
          return <rect key={i} x={15 + i * bw + 3} y={h - 12 - v * (h - 30)} width={bw - 8} height={v * (h - 30)} rx={3} fill={i % 2 ? accent : lighten(accent, 0.4)} />;
        })}
      </g>
    );
  } else if (kind === "video") {
    inner = (
      <g>
        <rect width={w} height={h} fill="#2a9d8f" />
        <circle cx={w * 0.7 + Math.sin(t) * 10} cy={h * 0.3} r={h * 0.12} fill="#ffd166" />
        <path d={`M0,${h} L${w * 0.35},${h * 0.45} L${w * 0.6},${h} Z`} fill="#264653" />
        <path d={`M${w * 0.3},${h} L${w * 0.65},${h * 0.55} L${w},${h} Z`} fill="#1b3a40" />
        <circle cx={w / 2} cy={h / 2} r={h * 0.14} fill="#000" opacity={0.35} />
        <path d={`M${w / 2 - 6},${h / 2 - 12} L${w / 2 + 12},${h / 2} L${w / 2 - 6},${h / 2 + 12} Z`} fill="#fff" />
      </g>
    );
  } else if (kind === "text") {
    inner = (
      <text x={w / 2} y={h / 2 + 10} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={Math.min(36, h * 0.3)} fill="#fff">
        {text ?? ""}
      </text>
    );
  } else if (kind === "globe") {
    inner = (
      <g transform={`translate(${w / 2} ${h / 2})`}>
        <circle r={h * 0.38} fill="#1d4e89" />
        {[0, 1, 2].map((i) => (
          <ellipse key={i} rx={h * 0.38 * Math.abs(Math.cos(t + i * 1.05))} ry={h * 0.38} fill="none" stroke="#7bdff2" strokeWidth={2} />
        ))}
        <line x1={-h * 0.38} y1={0} x2={h * 0.38} y2={0} stroke="#7bdff2" strokeWidth={2} />
      </g>
    );
  }
  return (
    <g>
      <defs>
        <clipPath id={clip}>
          <rect width={w} height={h} rx={4} />
        </clipPath>
      </defs>
      <rect width={w} height={h} rx={4} fill={kind === "off" ? "#1b1f2a" : "#14213d"} />
      <g clipPath={`url(#${clip})`}>{inner}</g>
      {kind !== "off" ? <path d={`M0,0 L${w * 0.35},0 L0,${h * 0.6} Z`} fill="#fff" opacity={0.06} /> : null}
    </g>
  );
};

export const Laptop: React.FC<ObjectProps> = ({ t, color, props, L, seed }) => {
  const c = L(color ?? "#c9ced6");
  return (
    <g>
      <path d="M-140,-180 Q-140,-190 -130,-190 L130,-190 Q140,-190 140,-180 L140,-10 L-140,-10 Z" fill={darken(c, 0.35)} />
      <g transform="translate(-128 -178)">
        <ScreenContent w={256} h={160} t={t} kind={str(props.screen, "code")} text={str(props.text, "")} accent="#ffb703" seed={seed} />
      </g>
      <path d="M-175,-10 L175,-10 L190,6 Q190,10 185,10 L-185,10 Q-190,10 -190,6 Z" fill={c} />
      <rect x={-30} y={-6} width={60} height={5} rx={2} fill={darken(c, 0.2)} />
    </g>
  );
};

export const Monitor: React.FC<ObjectProps> = ({ t, color, props, L, seed }) => {
  const c = L(color ?? "#2b2d42");
  return (
    <g>
      <rect x={-60} y={-10} width={120} height={10} rx={4} fill={c} />
      <rect x={-12} y={-70} width={24} height={62} fill={lighten(c, 0.1)} />
      <rect x={-190} y={-310} width={380} height={244} rx={14} fill={c} />
      <g transform="translate(-176 -296)">
        <ScreenContent w={352} h={210} t={t} kind={str(props.screen, "chart")} text={str(props.text, "")} accent="#3a86ff" seed={seed} />
      </g>
    </g>
  );
};

/** Centre-anchored. */
export const Phone: React.FC<ObjectProps> = ({ t, color, props, L, seed }) => {
  const c = L(color ?? "#1b1f2a");
  const notif = props.notify === true && Math.sin(t * 6) > 0;
  return (
    <g>
      <rect x={-70} y={-140} width={140} height={280} rx={24} fill={c} />
      <g transform="translate(-60 -122)">
        <ScreenContent w={120} h={244} t={t} kind={str(props.screen, "video")} text={str(props.text, "")} accent="#06d6a0" seed={seed} />
      </g>
      <rect x={-20} y={-132} width={40} height={6} rx={3} fill="#000" opacity={0.6} />
      {notif ? <circle cx={52} cy={-122} r={14} fill="#ff4d6d" /> : null}
    </g>
  );
};

export const TV: React.FC<ObjectProps> = ({ t, props, L, seed }) => (
  <g>
    <rect x={-150} y={-14} width={300} height={14} rx={6} fill={L("#3d405b")} />
    <rect x={-20} y={-40} width={40} height={30} fill={L("#3d405b")} />
    <rect x={-300} y={-370} width={600} height={340} rx={14} fill={L("#14161d")} />
    <g transform="translate(-286 -356)">
      <ScreenContent w={572} h={312} t={t} kind={str(props.screen, "video")} text={str(props.text, "")} accent="#ef476f" seed={seed} />
    </g>
  </g>
);

export const ServerRack: React.FC<ObjectProps> = ({ t, L, seed }) => (
  <g>
    <rect x={-90} y={-420} width={180} height={420} rx={8} fill={L("#1f2433")} />
    {Array.from({ length: 9 }).map((_, i) => (
      <g key={i}>
        <rect x={-76} y={-404 + i * 44} width={152} height={36} rx={4} fill={L("#2d3448")} />
        {Array.from({ length: 4 }).map((__, k) => {
          const on = Math.sin(t * (3 + random(seed + i + k) * 8) + i * 2 + k) > 0;
          return <circle key={k} cx={-60 + k * 14} cy={-386 + i * 44} r={4} fill={on ? (k % 2 ? "#06d6a0" : "#4cc9f0") : "#394056"} />;
        })}
        <rect x={10} y={-392 + i * 44} width={56} height={10} rx={3} fill={L("#141826")} />
      </g>
    ))}
  </g>
);

export const Robot: React.FC<ObjectProps> = ({ t, color, L }) => {
  const c = L(color ?? "#cfd8e3");
  const bob = Math.sin(t * 3) * 4;
  const eye = 0.5 + 0.5 * Math.sin(t * 2);
  return (
    <g>
      <ellipse cx={0} cy={0} rx={80} ry={12} fill="#000" opacity={0.18} />
      <rect x={-40} y={-50} width={80} height={44} rx={10} fill={darken(c, 0.25)} />
      <circle cx={-30} cy={-14} r={16} fill={L("#3d405b")} />
      <circle cx={30} cy={-14} r={16} fill={L("#3d405b")} />
      <g transform={`translate(0 ${bob})`}>
        <rect x={-70} y={-200} width={140} height={150} rx={30} fill={c} />
        <rect x={-40} y={-170} width={80} height={60} rx={10} fill={L("#3d405b")} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={-30 + i * 22} y={-160} width={14} height={40} rx={4} fill={i === Math.floor(t * 3) % 3 ? "#06d6a0" : "#118ab2"} />
        ))}
        <path d={`M-70,-160 Q-110,-120 ${-100 + Math.sin(t * 2) * 10},-80`} stroke={darken(c, 0.15)} strokeWidth={18} fill="none" strokeLinecap="round" />
        <path d={`M70,-160 Q110,-130 ${105 + Math.sin(t * 2 + 1) * 10},-90`} stroke={darken(c, 0.15)} strokeWidth={18} fill="none" strokeLinecap="round" />
        <g transform={`rotate(${Math.sin(t * 1.5) * 6} 0 -215)`}>
          <rect x={-60} y={-310} width={120} height={95} rx={26} fill={c} />
          <rect x={-46} y={-292} width={92} height={56} rx={18} fill={L("#14213d")} />
          <ellipse cx={-20} cy={-264} rx={10} ry={12 * (0.3 + 0.7 * eye)} fill="#4cc9f0" />
          <ellipse cx={20} cy={-264} rx={10} ry={12 * (0.3 + 0.7 * eye)} fill="#4cc9f0" />
          <line x1={0} y1={-310} x2={0} y2={-340} stroke={darken(c, 0.3)} strokeWidth={5} />
          <circle cx={0} cy={-344} r={9} fill={Math.sin(t * 5) > 0 ? "#ff4d6d" : "#a4161a"} />
        </g>
      </g>
    </g>
  );
};

/** Centre-anchored */
export const Satellite: React.FC<ObjectProps> = ({ t, L }) => (
  <g transform={`rotate(${Math.sin(t * 0.5) * 8})`}>
    {[-1, 1].map((s) => (
      <g key={s}>
        <line x1={s * 50} y1={0} x2={s * 80} y2={0} stroke={L("#999")} strokeWidth={6} />
        <rect x={s > 0 ? 80 : -230} y={-45} width={150} height={90} fill={L("#1d4e89")} stroke={L("#c9ced6")} strokeWidth={4} />
        {[1, 2].map((k) => (
          <line key={k} x1={s > 0 ? 80 + k * 50 : -230 + k * 50} y1={-45} x2={s > 0 ? 80 + k * 50 : -230 + k * 50} y2={45} stroke={L("#4cc9f0")} strokeWidth={2} />
        ))}
        <line x1={s > 0 ? 80 : -230} y1={0} x2={s > 0 ? 230 : -80} y2={0} stroke={L("#4cc9f0")} strokeWidth={2} />
      </g>
    ))}
    <rect x={-50} y={-60} width={100} height={120} rx={10} fill={L("#e9c46a")} />
    <rect x={-50} y={-60} width={100} height={20} fill={L("#f4a261")} />
    <path d="M0,-60 L0,-100 M-30,-130 Q0,-90 30,-130" stroke={L("#c9ced6")} strokeWidth={5} fill="none" />
    <circle cx={0} cy={-110} r={6} fill={Math.sin(t * 4) > 0 ? "#ff4d6d" : "#555"} />
  </g>
);

export const SolarPanel: React.FC<ObjectProps> = ({ t, L }) => (
  <g>
    <rect x={-8} y={-110} width={16} height={110} fill={L("#5c636e")} />
    <g transform="translate(0 -120) skewX(-18)">
      <rect x={-150} y={-70} width={300} height={90} fill={L("#1d3557")} stroke={L("#c9ced6")} strokeWidth={6} />
      {[1, 2, 3, 4, 5].map((k) => (
        <line key={k} x1={-150 + k * 50} y1={-70} x2={-150 + k * 50} y2={20} stroke={L("#457b9d")} strokeWidth={2} />
      ))}
      <line x1={-150} y1={-25} x2={150} y2={-25} stroke={L("#457b9d")} strokeWidth={2} />
      <rect x={-150 + ((t * 150) % 400) - 60} y={-70} width={40} height={90} fill="#fff" opacity={0.15} />
    </g>
  </g>
);

/** Centre-anchored. Props: { "level": 0..1 } */
export const Battery: React.FC<ObjectProps> = ({ t, props, L }) => {
  const level = num(props.level, 0.5 + 0.5 * Math.sin(t * 0.6));
  const col = level > 0.6 ? "#06d6a0" : level > 0.3 ? "#ffd166" : "#ef476f";
  return (
    <g>
      <rect x={-60} y={-130} width={120} height={240} rx={18} fill={L("#2b2d42")} />
      <rect x={-25} y={-150} width={50} height={24} rx={6} fill={L("#2b2d42")} />
      <rect x={-46} y={96 - 212 * level} width={92} height={212 * level} rx={10} fill={col} />
      <path d="M8,-40 L-18,10 L2,10 L-8,50 L20,-4 L0,-4 Z" fill="#fff" opacity={0.85} />
    </g>
  );
};

/** Centre-anchored. Props: { "on": true } */
export const Lightbulb: React.FC<ObjectProps> = ({ t, props, L }) => {
  const on = props.on !== false;
  const pulse = 0.85 + 0.15 * Math.sin(t * 4);
  return (
    <g>
      {on ? (
        <g opacity={pulse}>
          <circle cx={0} cy={-30} r={150} fill="#ffd166" opacity={0.18} />
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={i} x1={0} y1={-125} x2={0} y2={-165} stroke="#ffd166" strokeWidth={8} strokeLinecap="round" transform={`rotate(${i * 36 - 90 + 18} 0 -30)`} />
          ))}
        </g>
      ) : null}
      <path d="M-70,-40 A80,80 0 1,1 70,-40 Q50,0 40,40 L-40,40 Q-50,0 -70,-40 Z" fill={on ? "#ffe066" : L("#e9ecef")} stroke={on ? "#f4a261" : L("#adb5bd")} strokeWidth={5} />
      <path d="M-20,30 L-10,-20 L0,10 L10,-20 L20,30" stroke={on ? "#e76f51" : L("#868e96")} strokeWidth={5} fill="none" />
      <rect x={-40} y={40} width={80} height={44} rx={8} fill={L("#8d99ae")} />
      <line x1={-40} y1={56} x2={40} y2={56} stroke={L("#5c677d")} strokeWidth={4} />
      <line x1={-40} y1={70} x2={40} y2={70} stroke={L("#5c677d")} strokeWidth={4} />
      <path d="M-30,-90 Q-50,-60 -40,-30" stroke="#fff" strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.6} />
    </g>
  );
};

/** Centre-anchored, rotates. Props: { "teeth": 12 } */
export const Gear: React.FC<ObjectProps> = ({ t, color, speed, props, L }) => {
  const c = L(color ?? "#adb5bd");
  const teeth = num(props.teeth, 12);
  const r = num(props.radius, 100);
  return (
    <g transform={`rotate(${t * 40 * speed})`}>
      {Array.from({ length: teeth }).map((_, i) => (
        <rect key={i} x={-r * 0.13} y={-r * 1.18} width={r * 0.26} height={r * 0.3} rx={4} fill={c} transform={`rotate(${(i * 360) / teeth})`} />
      ))}
      <circle r={r} fill={c} />
      <circle r={r * 0.75} fill={darken(c, 0.1)} />
      <circle r={r * 0.28} fill={lighten(c, 0.3)} stroke={darken(c, 0.3)} strokeWidth={6} />
    </g>
  );
};

/** Centre-anchored */
export const Chip: React.FC<ObjectProps> = ({ t, color, L }) => {
  const c = L(color ?? "#2b2d42");
  return (
    <g>
      {Array.from({ length: 6 }).map((_, i) =>
        [-1, 1].map((s) => (
          <g key={`${i}${s}`}>
            <rect x={-100 + i * 36} y={s > 0 ? 100 : -130} width={14} height={30} fill={L("#c9a227")} />
            <rect x={s > 0 ? 100 : -130} y={-100 + i * 36} width={30} height={14} fill={L("#c9a227")} />
          </g>
        )),
      )}
      <rect x={-110} y={-110} width={220} height={220} rx={16} fill={c} />
      <rect x={-70} y={-70} width={140} height={140} rx={8} fill={lighten(c, 0.12)} stroke="#4cc9f0" strokeWidth={3} opacity={0.6 + 0.4 * Math.sin(t * 3)} />
      <circle cx={-86} cy={-86} r={8} fill={lighten(c, 0.3)} />
    </g>
  );
};

/** Centre-anchored spinning Earth. Props: { "clouds": colour or [[t, colour]…] (adds drifting cloud bands), "rain": true (streaks under the clouds) } */
export const Globe: React.FC<ObjectProps> = ({ t, local, color, speed, L, props }) => {
  const cloudC = props.clouds !== undefined ? L(tweenColor(props.clouds, local, "#ffffff")) : null;
  const ocean = L(color ?? "#3a86ff");
  const land = L("#57cc99");
  const clip = useSvgId("glb");
  const shade = useSvgId("gsh");
  const shine = useSvgId("gsn");
  const R = 140;
  const off = ((t * 40 * speed) % 560) - 280;
  const continents = [
    "M-60,-80 Q-10,-110 30,-70 Q50,-30 10,-10 Q-20,20 -50,-20 Q-80,-50 -60,-80 Z",
    "M40,10 Q80,0 95,40 Q90,90 60,110 Q35,80 40,10 Z",
    "M-120,20 Q-80,10 -70,50 Q-90,90 -120,70 Z",
    "M110,-90 Q160,-100 180,-60 Q150,-30 120,-50 Z",
  ];
  return (
    <g>
      <defs>
        <clipPath id={clip}>
          <circle r={R} />
        </clipPath>
        <radialGradient id={shade} cx="0.36" cy="0.32" r="0.78">
          <stop offset="0.55" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.42} />
        </radialGradient>
        <radialGradient id={shine} cx="0.32" cy="0.28" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity={0.28} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={R} fill={ocean} />
      <g clipPath={`url(#${clip})`}>
        {[-560, 0, 560].map((dx) => (
          <g key={dx} transform={`translate(${off + dx} 0)`}>
            {continents.map((d, i) => (
              <path key={i} d={d} fill={land} />
            ))}
            {continents.map((d, i) => (
              <path key={"b" + i} d={d} fill={land} transform="translate(280 30) scale(0.9)" />
            ))}
          </g>
        ))}
        {cloudC
          ? [-0.62, -0.25, 0.12, 0.5].map((band, i) => (
              <g key={"cl" + i}>
                {[-1, 0, 1].map((rep) => {
                  const x = ((t * (26 + i * 9) * speed + i * 140) % 560) - 280 + rep * 560;
                  return (
                    <g key={rep} transform={`translate(${x} ${band * R})`}>
                      <ellipse cx={0} cy={0} rx={90} ry={14} fill={cloudC} opacity={0.85} />
                      <ellipse cx={70} cy={-6} rx={50} ry={12} fill={cloudC} opacity={0.85} />
                      <ellipse cx={-150} cy={6} rx={60} ry={10} fill={cloudC} opacity={0.7} />
                      {props.rain === true
                        ? [-60, -20, 20, 60].map((dx) => <path key={dx} d={`M${dx},12 l-4,16`} stroke={cloudC} strokeWidth={3} strokeLinecap="round" opacity={0.8} />)
                        : null}
                    </g>
                  );
                })}
              </g>
            ))
          : null}
      </g>
      <circle r={R} fill={`url(#${shade})`} />
      <circle r={R} fill={`url(#${shine})`} />
      <circle r={R} fill="none" stroke={darken(ocean, 0.3)} strokeWidth={4} />
    </g>
  );
};

/** Centre-anchored */
export const Atom: React.FC<ObjectProps> = ({ t, color, speed, L }) => {
  const c = L(color ?? "#4cc9f0");
  return (
    <g>
      <circle r={30} fill={L("#ef476f")} />
      <circle cx={-10} cy={-10} r={10} fill="#fff" opacity={0.4} />
      {[0, 60, 120].map((a, i) => {
        const ang = t * 3 * speed + i * 2;
        return (
          <g key={a} transform={`rotate(${a})`}>
            <ellipse rx={150} ry={50} fill="none" stroke={c} strokeWidth={5} opacity={0.8} />
            <circle cx={150 * Math.cos(ang)} cy={50 * Math.sin(ang)} r={13} fill={lighten(c, 0.3)} />
          </g>
        );
      })}
    </g>
  );
};

/** Centre-anchored, vertical double helix */
export const DNA: React.FC<ObjectProps> = ({ t, color, color2, speed, L }) => {
  const a = L(color ?? "#4cc9f0");
  const b = L(color2 ?? "#f72585");
  const n = 16;
  return (
    <g>
      {Array.from({ length: n }).map((_, i) => {
        const y = -240 + i * 32;
        const ph = t * 2 * speed + i * 0.5;
        const x1 = Math.sin(ph) * 80;
        const x2 = -x1;
        const front = Math.cos(ph) > 0;
        return (
          <g key={i}>
            <line x1={x1} y1={y} x2={x2} y2={y} stroke={L("#adb5bd")} strokeWidth={5} />
            <circle cx={x1} cy={y} r={front ? 13 : 9} fill={a} />
            <circle cx={x2} cy={y} r={front ? 9 : 13} fill={b} />
          </g>
        );
      })}
    </g>
  );
};

export const TECH: Record<string, ObjectDef> = {
  laptop: { component: Laptop, w: 380, h: 200, category: "tech", description: 'props: { "screen": "code|chart|video|text|globe|off", "text": "…" }' },
  monitor: { component: Monitor, w: 380, h: 310, category: "tech", description: 'props: { "screen": … }' },
  phone: { component: Phone, w: 140, h: 280, category: "tech", anchor: "center", description: 'props: { "screen": …, "notify": true }' },
  tv: { component: TV, w: 600, h: 370, category: "tech" },
  server: { component: ServerRack, w: 180, h: 420, category: "tech" },
  robot: { component: Robot, w: 220, h: 350, category: "tech" },
  satellite: { component: Satellite, w: 460, h: 260, category: "tech", anchor: "center" },
  solarpanel: { component: SolarPanel, w: 340, h: 210, category: "tech" },
  battery: { component: Battery, w: 120, h: 260, category: "tech", anchor: "center", description: 'props: { "level": 0..1 }' },
  lightbulb: { component: Lightbulb, w: 200, h: 260, category: "tech", anchor: "center", description: 'props: { "on": true }' },
  gear: { component: Gear, w: 240, h: 240, category: "tech", anchor: "center", description: 'props: { "teeth": 12, "radius": 100 }' },
  chip: { component: Chip, w: 260, h: 260, category: "tech", anchor: "center" },
  globe: { component: Globe, w: 280, h: 280, category: "science", anchor: "center", description: 'props: { "clouds": "#ffffff" or [[t, colour]…], "rain": true }' },
  atom: { component: Atom, w: 320, h: 320, category: "science", anchor: "center" },
  dna: { component: DNA, w: 200, h: 500, category: "science", anchor: "center" },
};
