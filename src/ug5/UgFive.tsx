/**
 * UG-005 "Phone GPU vs RTX" — full film.
 * Creator footage (public/ug-005/footage: RDR2 on a OnePlus 10T via the creator's own emulator + hand-cam,
 * Crimson Desert on an RTX 5090) + procedural 3D (./Three5) + motion graphics.
 * Timeline from narration word cues (ug005.data.ts ← E:/youtube/phone-GPU-vs-pc-RTX-GPU/tools/gen_data.py).
 */
import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Freeze, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { pr, sp, Stamp } from "../ug/blocks";
import { clamp, Glitch, Grain, LightLeak, shake, Vignette } from "../ug/fx";
import { C, DISPLAY, INTER, MONO } from "../ug/theme";
import { Callout, EndScreen, Karaoke, Roll, Tag, type Cap } from "../ug3/Gfx3";
import { Embers, Plate } from "../ug3/Hero";
import { Cam, ContactShadow, Floor, mix, mixV, project, Scene3D, type V3 } from "../ug3/Three3D";
import { Phone, RtxCard, Soc, SOC_BLOCKS } from "./Three5";
import { CAPTIONS, CUE, TOTAL_FRAMES, VO_FRAMES, VOX } from "./ug005.data";

export const UG005_FRAMES = TOTAL_FRAMES;
const XF = 6;
const NV = "#76b900"; // RTX corner
const PH = "#28d7ff"; // phone corner
const GOLD = "#ffc247";
const c = (k: string) => {
  const v = CUE[k];
  if (v === undefined) throw new Error(`cue ${k}`);
  return v;
};
type SceneP = { f: number; d: number; o: number };
const L = (o: number, k: string) => c(k) - o;
const ez = (f: number, a: number, b: number) => pr(f, a, b);

const Pos: React.FC<{ x?: number; y?: number; r?: number; b?: number; w?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, r, b, w, children, style }) => (
  <div style={{ position: "absolute", left: x, top: y, right: r, bottom: b, width: w, ...style }}>{children}</div>
);
const Center: React.FC<{ y: number; children: React.ReactNode }> = ({ y, children }) => (
  <Pos x={0} w={1920} y={y} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
    {children}
  </Pos>
);
const BG: React.FC<{ f: number; accent?: string; x?: number; y?: number; dim?: number }> = ({ f, accent = "rgba(40,215,255,0.12)", x = 50, y = 45, dim = 0.45 }) => (
  <Plate f={f} accent={accent} x={x} y={y} dim={dim} src="ug-004/img/plate.jpg" />
);
const Shade: React.FC<{ k?: number; side?: "left" | "bottom" | "all" | "right" }> = ({ k = 0.8, side = "left" }) => (
  <AbsoluteFill
    style={{
      background:
        side === "all"
          ? `rgba(0,0,0,${k * 0.7})`
          : side === "bottom"
            ? `linear-gradient(0deg, rgba(0,0,0,${k}) 0%, rgba(0,0,0,0) 60%)`
            : `linear-gradient(${side === "left" ? 90 : 270}deg, rgba(0,0,0,${k}) 0%, rgba(0,0,0,${k * 0.55}) 40%, transparent 70%)`,
    }}
  />
);

/* ===================================================================== footage */
/** mob.mp4 = 9 concatenated segments of the RDR2 recording (start seconds inside mob.mp4). */
const MSEG = [0, 18, 42, 60, 80, 98, 126, 151, 177];
type Src = "mob" | "hand" | "cd";
const Foot: React.FC<{ src: Src; at: number; f: number; d: number; zoom?: [number, number]; pan?: [number, number]; dim?: number; blur?: number; sat?: number; thermal?: number; origin?: string }> = ({
  src,
  at,
  f,
  d,
  zoom = [1.04, 1.12],
  pan = [0, 0],
  dim = 0.15,
  blur = 0,
  sat = 1,
  thermal = 0,
  origin = "50% 50%",
}) => {
  const p = interpolate(f, [0, Math.max(1, d)], [0, 1], clamp);
  const z = zoom[0] + (zoom[1] - zoom[0]) * p;
  const x = pan[0] + (pan[1] - pan[0]) * p;
  const filt = thermal > 0 ? `grayscale(1) contrast(1.6) brightness(${1.1 - dim}) sepia(1) hue-rotate(${-30 + thermal * 10}deg) saturate(${4 + thermal * 3}) blur(${blur}px)` : `contrast(1.1) saturate(${sat}) brightness(${1 - dim}) blur(${blur}px)`;
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${z}) translateX(${x}px)`, transformOrigin: origin }}>
        <OffthreadVideo src={staticFile(`ug-005/footage/${src}.mp4`)} muted trimBefore={Math.round(at * 30)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: filt }} />
      </AbsoluteFill>
      {thermal > 0 ? null : <AbsoluteFill style={{ mixBlendMode: "soft-light", opacity: 0.35, background: "linear-gradient(115deg, rgba(0,140,170,0.85) 0%, rgba(0,0,0,0) 50%, rgba(255,140,40,0.7) 100%)" }} />}
    </AbsoluteFill>
  );
};
/* ===================================================================== atoms */
const Slam: React.FC<{ f: number; at: number; children: React.ReactNode; size?: number; color?: string; sub?: string; align?: "left" | "center" }> = ({ f, at, children, size = 200, color = GOLD, sub, align = "left" }) => {
  if (f < at) return null;
  const s = sp(f, at, 11, 220);
  return (
    <div style={{ textAlign: align, transform: `scale(${1.6 - 0.6 * s})`, opacity: Math.min(1, s * 2), transformOrigin: align === "center" ? "50% 50%" : "0% 50%" }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: size, lineHeight: 0.95, color, textShadow: `0 0 60px ${color}88, 0 8px 30px rgba(0,0,0,0.85)`, whiteSpace: "pre-line" }}>{children}</div>
      {sub ? <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, color: C.ink, letterSpacing: 3, marginTop: 10, textShadow: "0 4px 18px rgba(0,0,0,0.9)" }}>{sub}</div> : null}
    </div>
  );
};
const Line: React.FC<{ f: number; at: number; children: React.ReactNode; size?: number; color?: string; font?: string }> = ({ f, at, children, size = 44, color = C.ink, font = INTER }) => {
  if (f < at) return null;
  const a = ez(f, at, at + 10);
  return <div style={{ fontFamily: font, fontWeight: 800, fontSize: size, color, opacity: a, transform: `translateY(${(1 - a) * 22}px)`, textShadow: "0 4px 20px rgba(0,0,0,0.9)", whiteSpace: "pre-line" }}>{children}</div>;
};
/** Crossed tag ("NO CLOUD ✕"). */
const XTag: React.FC<{ f: number; at: number; children: React.ReactNode; ok?: boolean }> = ({ f, at, children, ok = false }) => {
  if (f < at) return null;
  const s = sp(f, at, 12, 240);
  const col = ok ? C.green : C.red;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 16, padding: "10px 22px", borderRadius: 14, background: "rgba(5,7,10,0.82)", border: `3px solid ${col}`, transform: `scale(${0.6 + 0.4 * s})`, opacity: Math.min(1, s * 1.6), boxShadow: `0 0 30px ${col}55` }}>
      <span style={{ fontFamily: INTER, fontWeight: 900, fontSize: 44, color: col }}>{ok ? "✓" : "✕"}</span>
      <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 54, color: C.ink, letterSpacing: 2 }}>{children}</span>
    </div>
  );
};
const Beta: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  if (f < at) return null;
  const s = sp(f, at, 12, 200);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "8px 18px", borderRadius: 10, border: `3px solid ${GOLD}`, background: "rgba(5,7,10,0.85)", transform: `scale(${s}) rotate(-3deg)`, fontFamily: MONO, fontWeight: 800, fontSize: 28, color: GOLD, letterSpacing: 3 }}>
      <span style={{ width: 12, height: 12, borderRadius: 6, background: C.red, opacity: Math.sin(f * 0.3) > 0 ? 1 : 0.25 }} />
      BETA · NOT RELEASED
    </div>
  );
};
const Note: React.FC<{ children: React.ReactNode; y?: number }> = ({ children, y = 1040 }) => (
  <Pos x={60} y={y}>
    <div style={{ fontFamily: MONO, fontSize: 19, color: "rgba(243,246,248,0.7)", letterSpacing: 1 }}>{children}</div>
  </Pos>
);

/** Boxing-style round card. */
const RoundCard: React.FC<{ f: number; d: number; n: number; title: string; color?: string }> = ({ f, d, n, title, color = GOLD }) => {
  const s = sp(f, 0, 10, 200);
  const t = sp(f, 8, 13, 180);
  const out = ez(f, d - 8, d);
  const streak = interpolate(f, [0, 30], [-40, 140], clamp);
  return (
    <AbsoluteFill style={{ opacity: 1 - out, transform: shake(f, 1, 12, 18) }}>
      <BG f={f} accent={`${color}33`} x={50} y={50} dim={0.4} />
      <AbsoluteFill style={{ background: `linear-gradient(100deg, transparent ${streak - 8}%, ${color}55 ${streak}%, transparent ${streak + 8}%)`, mixBlendMode: "screen" }} />
      <Embers f={f} color={color} n={50} speed={2} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 52, color, letterSpacing: 18, opacity: Math.min(1, t * 1.5) }}>ROUND</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 420, lineHeight: 0.9, color: "transparent", WebkitTextStroke: `6px ${color}`, transform: `scale(${2.4 - 1.4 * s})`, opacity: Math.min(1, s * 2), textShadow: `0 0 80px ${color}` }}>{n}</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 130, color: C.ink, letterSpacing: 8, transform: `translateY(${(1 - t) * 60}px)`, opacity: Math.min(1, t * 1.5), textShadow: "0 10px 40px rgba(0,0,0,0.8)" }}>{title}</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "#fff", opacity: interpolate(f, [0, 2, 10], [0.85, 0.5, 0], clamp) }} />
    </AbsoluteFill>
  );
};

/** Horizontal bar. */
const HBar: React.FC<{ f: number; at: number; label: string; sub?: string; v: number; max: number; color: string; w?: number; dec?: number; unit?: string; h?: number }> = ({ f, at, label, sub, v, max, color, w = 1500, dec = 1, unit = "", h = 70 }) => {
  if (f < at) return <div style={{ height: h + 70 }} />;
  const p = interpolate(f, [at, at + 28], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  return (
    <div style={{ width: w, marginBottom: 30, opacity: ez(f, at, at + 6) }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, color: C.ink, letterSpacing: 1 }}>
          {label} {sub ? <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: 24, color: C.mute }}>{sub}</span> : null}
        </span>
        <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 60, color }}>
          {(v * p).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec })}
          <span style={{ fontSize: 26, color: C.mute }}> {unit}</span>
        </span>
      </div>
      <div style={{ height: h, borderRadius: 14, background: "rgba(255,255,255,0.06)", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ width: `${Math.max(0.4, (v / max) * 100 * p)}%`, height: "100%", borderRadius: 14, background: `linear-gradient(90deg, ${color}55, ${color})`, boxShadow: `0 0 40px ${color}aa` }} />
      </div>
    </div>
  );
};

/** Persistent round scoreboard (top-left), from round 1 to the verdict. */
const SCORE: { at: string; who: "rtx" | "phone" }[] = [
  { at: "x26", who: "rtx" },
  { at: "gapb", who: "rtx" },
  { at: "x20", who: "rtx" },
  { at: "half", who: "rtx" },
  { at: "twice", who: "phone" },
];
const scoreAt = (fr: number) => {
  let rtx = 0;
  let ph = 0;
  let last = -1e9;
  let lastWho: "rtx" | "phone" = "rtx";
  for (const s of SCORE) {
    if (fr >= c(s.at)) {
      if (s.who === "rtx") rtx++;
      else ph++;
      last = c(s.at);
      lastWho = s.who;
    }
  }
  return { rtx, ph, last, lastWho };
};
const ScoreHUD: React.FC = () => {
  const fr = useCurrentFrame();
  const from = c("r1");
  const to = c("verdict");
  if (fr < from + 40 || fr > to) return null;
  const { rtx, ph, last, lastWho } = scoreAt(fr);
  const a = ez(fr, from + 40, from + 55) * (1 - ez(fr, to - 12, to));
  const pop = fr - last < 20 ? Math.sin(((fr - last) / 20) * Math.PI) : 0;
  const cell = (label: string, v: number, col: string, hot: boolean) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 20, color: col, letterSpacing: 3 }}>{label}</span>
      <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 46, color: C.ink, transform: `scale(${hot ? 1 + pop * 0.5 : 1})`, textShadow: hot ? `0 0 ${30 * pop}px ${col}` : undefined, display: "inline-block", minWidth: 26, textAlign: "center" }}>{v}</span>
    </div>
  );
  return (
    <div style={{ position: "absolute", left: 54, top: 40, opacity: a, display: "flex", alignItems: "center", gap: 20, padding: "8px 22px", borderRadius: 14, background: "rgba(5,7,10,0.75)", border: "1.5px solid rgba(255,255,255,0.14)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
      {cell("PHONE", ph, PH, lastWho === "phone")}
      <span style={{ fontFamily: DISPLAY, fontSize: 34, color: C.mute }}>–</span>
      {cell("RTX", rtx, NV, lastWho === "rtx")}
    </div>
  );
};

/* ===================================================================== HOOK */
const HookPhone: React.FC<SceneP> = ({ f, d, o }) => {
  const shrink = ez(f, 52, 80);
  const tNo = L(o, "h_nocloud");
  const tNs = L(o, "h_nostream");
  const tE = L(o, "h_emu");
  const flash = interpolate(f, [tE, tE + 2, tE + 12], [0, 0.7, 0], clamp);
  // hand-cam starts full-screen, then becomes a framed PiP on the right
  const x = mix(0, 1080, shrink);
  const y = mix(0, 150, shrink);
  const w = mix(1920, 760, shrink);
  const h = mix(1080, 356, shrink);
  return (
    <AbsoluteFill>
      <Foot src="mob" at={MSEG[1] + 2} f={f} d={d} zoom={[1.18, 1.05]} dim={0.15} />
      <Shade k={0.85} />
      <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 26 * shrink, overflow: "hidden", border: shrink > 0.05 ? `3px solid ${PH}` : undefined, boxShadow: shrink > 0.05 ? `0 0 60px ${PH}66, 0 40px 90px rgba(0,0,0,0.7)` : undefined }}>
        <OffthreadVideo src={staticFile("ug-005/footage/hand.mp4")} muted trimBefore={Math.round((MSEG[1] + 2) * 30)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      {shrink > 0.9 ? (
        <Pos x={1100} y={530}>
          <Tag f={f} at={82} color={PH} size={24}>
            REAL PHONE · REAL GAME · LIVE
          </Tag>
        </Pos>
      ) : null}
      <Pos x={100} y={170}>
        <Line f={f} at={L(o, "h_pc") - 6} size={34} color={PH} font={MONO}>
          PC VERSION
        </Line>
        <div style={{ marginTop: 8 }}>
          <Slam f={f} at={L(o, "h_pc") - 4} size={128} color={C.ink}>
            {"RED DEAD\nREDEMPTION 2"}
          </Slam>
        </div>
        <div style={{ marginTop: 24 }}>
          <Slam f={f} at={L(o, "h_old")} size={72} color={GOLD}>
            ON A 4-YEAR-OLD PHONE
          </Slam>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 30, alignItems: "flex-start" }}>
          <XTag f={f} at={tNo}>
            NO CLOUD
          </XTag>
          <XTag f={f} at={tNs}>
            NO STREAMING
          </XTag>
        </div>
        {f >= tE ? (
          <div style={{ marginTop: 26 }}>
            <Stamp f={f} at={tE} color={PH} rot={-3} size={70}>
              MY OWN EMULATOR
            </Stamp>
          </div>
        ) : null}
      </Pos>
      <AbsoluteFill style={{ background: PH, opacity: flash, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

const HookCD: React.FC<SceneP> = ({ f, d, o }) => {
  const t5 = L(o, "h_5090");
  const tm = L(o, "h_most");
  return (
    <AbsoluteFill style={{ transform: shake(f, t5, 14, 14) }}>
      <Foot src="cd" at={139} f={f} d={d} zoom={[1.02, 1.16]} dim={0.05} sat={1.1} />
      <Shade k={0.75} side="bottom" />
      <Shade k={0.6} />
      <Pos x={100} y={150}>
        <Line f={f} at={4} size={34} color={C.mute} font={MONO}>
          CRIMSON DESERT
        </Line>
        <div style={{ marginTop: 10 }}>
          <Slam f={f} at={t5} size={190} color={NV}>
            RTX 5090
          </Slam>
        </div>
        {f >= tm ? (
          <div style={{ marginTop: 16 }}>
            <Tag f={f} at={tm} color={NV} size={32}>
              THE MOST POWERFUL GAMING GPU YOU CAN BUY
            </Tag>
          </div>
        ) : null}
      </Pos>
    </AbsoluteFill>
  );
};

/** One 3D stage: phone chip (left) vs RTX card (right); the camera travels from one to the other. */
const HookChips: React.FC<SceneP> = ({ f, d, o }) => {
  const tn = L(o, "h_nail");
  const tl = L(o, "h_led");
  const to = L(o, "h_other");
  const t575 = L(o, "h_575");
  const tc = L(o, "h_cable");
  const tm = L(o, "h_melt");
  const k = ez(f, to - 6, to + 26);
  const cam = { pos: mixV([-16, 7, 11], [10, 22, 34], k), target: mixV([-16, 0, 0], [6, 0, 0], k), fov: 30 };
  const plug = f >= tc ? Math.min(1, (f - tc) / 30) * (0.7 + 0.3 * Math.sin(f * 0.9)) : 0;
  const melt = f >= tm ? 1 : 0;
  const [sx, sy] = project([-16, 0.6, 0], cam);
  const [px, py] = project([9.5, 0.5, -RTXH], cam);
  return (
    <AbsoluteFill style={{ transform: shake(f, tm, 16, 12) }}>
      <BG f={f} accent={k < 0.5 ? "rgba(40,215,255,0.16)" : "rgba(118,185,0,0.16)"} x={k < 0.5 ? 30 : 65} />
      <Scene3D rimA={PH} rimB={NV}>
        <Cam {...cam} />
        <Floor y={-1.2} />
        <Soc p={[-16, 0, 0]} s={1} explode={0} lit={{ gpu: 1, cpu: 0.4, npu: 0.4, isp: 0.4, modem: 0.4 }} r={[0, f * 0.006, 0]} />
        <ContactShadow p={[-16, -1.15, 0]} w={10} d={10} />
        <RtxCard p={[6, 0, 0]} spin={f * 0.35} plug={plug} heat={melt * 0.4} r={[0, -0.25, 0]} />
        <ContactShadow p={[6, -1.15, 0]} w={44} d={24} />
      </Scene3D>
      {f >= tn && k < 0.4 ? <Callout f={f} at={tn} x={sx} y={sy} dx={220} dy={-200} color={PH} title="≈ FINGERNAIL SIZE" sub="the whole phone chip" until={to - 4} /> : null}
      {f >= tl && k < 0.4 ? (
        <Pos x={1150} y={640}>
          <div style={{ display: "flex", alignItems: "center", gap: 26, opacity: ez(f, tl, tl + 10) }}>
            <Bulb size={150} on={ez(f, tl, tl + 14)} />
            <div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 86, color: C.ink }}>≈ 1 LED BULB</div>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: PH, letterSpacing: 2 }}>GRAPHICS POWER · UNDER ~10 W</div>
            </div>
          </div>
        </Pos>
      ) : null}
      {f >= t575 ? (
        <Pos x={110} y={110}>
          <Watt f={f} at={t575} />
        </Pos>
      ) : null}
      {f >= tc && k > 0.6 ? <Callout f={f} at={tc} x={px} y={py} dx={-260} dy={150} color={C.red} title="16-PIN POWER CABLE" sub={melt ? "some have melted" : "600 W rated"} until={d} /> : null}
      {melt ? (
        <Pos x={1180} y={760}>
          <Stamp f={f} at={tm} color={C.red} rot={-6} size={96}>
            MELTED
          </Stamp>
        </Pos>
      ) : null}
      {melt ? <Embers f={f} color="#ff6a2a" n={70} speed={2.4} opacity={ez(f, tm, tm + 10)} /> : null}
    </AbsoluteFill>
  );
};
const RTXH = 7.4;
const Bulb: React.FC<{ size: number; on: number }> = ({ size, on }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{ filter: `drop-shadow(0 0 ${30 * on}px #ffe08a)` }}>
    <path d="M50 8 A28 28 0 0 1 70 58 Q64 64 64 72 H36 Q36 64 30 58 A28 28 0 0 1 50 8 Z" fill={`rgba(255,224,138,${0.15 + 0.75 * on})`} stroke="#ffe08a" strokeWidth={4} />
    <rect x={37} y={74} width={26} height={8} rx={2} fill="#9aa3ad" />
    <rect x={39} y={84} width={22} height={7} rx={2} fill="#9aa3ad" />
  </svg>
);
/** Power meter that slams into the red at 575 W. */
const Watt: React.FC<{ f: number; at: number }> = ({ f, at }) => {
  const p = interpolate(f, [at, at + 26], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const w = 575 * p;
  const ang = -120 + 240 * (w / 600);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 30, opacity: ez(f, at, at + 8) }}>
      <svg width={260} height={190} viewBox="0 0 260 190">
        <path d="M30 170 A100 100 0 1 1 230 170" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={22} />
        <path d="M30 170 A100 100 0 1 1 230 170" fill="none" stroke={p > 0.8 ? C.red : NV} strokeWidth={22} strokeDasharray={`${p * 470} 999`} style={{ filter: `drop-shadow(0 0 12px ${p > 0.8 ? C.red : NV})` }} />
        <line x1={130} y1={130} x2={130 + Math.sin((ang * Math.PI) / 180) * 88} y2={130 - Math.cos((ang * Math.PI) / 180) * 88} stroke={C.ink} strokeWidth={6} strokeLinecap="round" />
        <circle cx={130} cy={130} r={10} fill={C.ink} />
      </svg>
      <div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 130, color: p > 0.8 ? C.red : C.ink, lineHeight: 1, textShadow: `0 0 40px ${C.red}66` }}>{Math.round(w)} W</div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.mute, letterSpacing: 3 }}>RTX 5090 · TOTAL GRAPHICS POWER</div>
      </div>
    </div>
  );
};

const HookGap: React.FC<SceneP> = ({ f, d, o }) => {
  const t10 = L(o, "h_10");
  const t100 = L(o, "h_100");
  const split = ez(f, 0, 14);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, top: 0, width: 960, height: 1080, overflow: "hidden", transform: `translateX(${(1 - split) * -400}px)` }}>
        <div style={{ position: "absolute", left: -480, top: 0, width: 1920, height: 1080 }}>
          <Foot src="mob" at={MSEG[5] + 4} f={f} d={d} zoom={[1.1, 1.18]} dim={0.3} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 960, top: 0, width: 960, height: 1080, overflow: "hidden", transform: `translateX(${(1 - split) * 400}px)` }}>
        <div style={{ position: "absolute", left: -480, top: 0, width: 1920, height: 1080 }}>
          <Foot src="cd" at={164} f={f} d={d} zoom={[1.1, 1.18]} dim={0.3} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 957, top: 0, width: 6, height: 1080, background: C.ink, boxShadow: `0 0 30px ${C.ink}` }} />
      <Pos x={60} y={60}>
        <Tag f={f} at={4} color={PH}>
          PHONE
        </Tag>
      </Pos>
      <Pos r={60} y={60}>
        <Tag f={f} at={6} color={NV}>
          RTX 5090
        </Tag>
      </Pos>
      <Center y={330}>
        <Line f={f} at={2} size={60} font={DISPLAY}>
          HOW BIG IS THE GAP?
        </Line>
        <div style={{ display: "flex", gap: 60, marginTop: 20 }}>
          <Slam f={f} at={t10} size={240} color={GOLD} align="center">
            10×?
          </Slam>
          <Slam f={f} at={t100} size={240} color={C.red} align="center">
            100×?
          </Slam>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

const HookRan: React.FC<SceneP> = ({ f, d, o }) => {
  const ts = L(o, "h_same");
  const tsu = L(o, "h_surp");
  const tone = L(o, "h_one");
  const tw = L(o, "h_wins");
  const cut = Math.floor(f / 14) % 2;
  const bars = [0.25, 0.9, 0.55, 0.35, 0.75];
  return (
    <AbsoluteFill style={{ transform: shake(f, tw, 16, 20) }}>
      {f < tsu ? (
        <Foot src={cut ? "cd" : "mob"} at={cut ? 40 + (f % 300) / 30 : MSEG[2] + 3} f={f} d={d} dim={0.55} blur={2} />
      ) : (
        <Foot src="hand" at={MSEG[6] + 2} f={f - tsu} d={d - tsu} zoom={[1.0, 1.15]} dim={0.4} />
      )}
      <Shade k={0.5} side="all" />
      {f < tsu ? (
        <>
          <Pos x={1150} y={250}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 22, height: 520 }}>
              {bars.map((b, i) => {
                const p = ez(f, 6 + i * 5, 26 + i * 5);
                return <div key={i} style={{ width: 90, height: 520 * b * p, borderRadius: 10, background: i % 2 ? `linear-gradient(0deg, ${NV}55, ${NV})` : `linear-gradient(0deg, ${PH}55, ${PH})`, boxShadow: `0 0 30px ${i % 2 ? NV : PH}88` }} />;
              })}
            </div>
          </Pos>
          <Pos x={110} y={260}>
            <Slam f={f} at={2} size={110} color={C.ink}>
              I RAN THE NUMBERS
            </Slam>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 30, alignItems: "flex-start" }}>
              <XTag f={f} at={ts} ok>
                SAME BENCHMARKS
              </XTag>
              <XTag f={f} at={ts + 24} ok>
                SAME TESTS
              </XTag>
              <XTag f={f} at={ts + 48} ok>
                PHONE vs PC
              </XTag>
            </div>
          </Pos>
        </>
      ) : (
        <Center y={250}>
          <Line f={f} at={tsu} size={70} font={DISPLAY} color={C.mute}>
            THE ANSWER SURPRISED ME…
          </Line>
          <div style={{ height: 40 }} />
          {f >= tone && f < tw ? (
            <Slam f={f} at={tone} size={170} color={GOLD} align="center">
              IN ONE ROUND
            </Slam>
          ) : null}
          {f >= tw ? (
            <Stamp f={f} at={tw} color={PH} rot={-4} size={150}>
              THE PHONE WINS
            </Stamp>
          ) : null}
        </Center>
      )}
      <AbsoluteFill style={{ background: PH, opacity: interpolate(f, [tw, tw + 2, tw + 14], [0, 0.6, 0], clamp), mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

/** Title: phone and RTX card fly in and clash. */
const Title: React.FC<SceneP> = ({ f, o }) => {
  const hit = 22;
  const a = ez(f, 0, hit);
  const ts = L(o, "settle");
  const after = Math.max(0, f - hit);
  const cam = { pos: [0, 16 - after * 0.02, 46 - after * 0.04] as V3, target: [0, 0, 0] as V3, fov: 32 };
  const flash = interpolate(f, [hit, hit + 2, hit + 16], [0, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ transform: shake(f, hit, 18, 24) }}>
      <BG f={f} accent="rgba(255,194,71,0.18)" />
      <Scene3D rimA={PH} rimB={NV}>
        <Cam {...cam} />
        <Phone p={[mix(-60, -12, a), 1.2, 2]} r={[0.35, 0.5 - after * 0.004, -0.15]} s={1.0} />
        <RtxCard p={[mix(70, 12, a), 0.5, -1]} r={[0.35, -0.45 + after * 0.004, 0.12]} s={0.85} spin={f * 0.4} />
      </Scene3D>
      <Embers f={f} color={GOLD} n={60} speed={1.8} opacity={ez(f, hit, hit + 10)} />
      <Center y={720}>
        {f >= hit ? (
          <div style={{ transform: `scale(${1.5 - 0.5 * sp(f, hit, 11, 220)})` }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 150, letterSpacing: 6, lineHeight: 1, textShadow: "0 10px 50px rgba(0,0,0,0.9)" }}>
              <span style={{ color: PH, textShadow: `0 0 50px ${PH}` }}>PHONE GPU</span>
              <span style={{ color: C.ink, fontSize: 90, margin: "0 34px", verticalAlign: "middle" }}>VS</span>
              <span style={{ color: NV, textShadow: `0 0 50px ${NV}` }}>RTX</span>
            </div>
          </div>
        ) : null}
        <div style={{ marginTop: 24 }}>
          <Line f={f} at={ts} size={46} font={MONO} color={GOLD}>
            LET'S SETTLE THIS.
          </Line>
        </div>
      </Center>
      <AbsoluteFill style={{ background: "#fff", opacity: flash * 0.8 }} />
    </AbsoluteFill>
  );
};

/* ===================================================================== FIGHTERS */
const StatRow: React.FC<{ f: number; at: number; k: string; v: string; col: string }> = ({ f, at, k, v, col }) => {
  if (f < at) return null;
  const a = ez(f, at, at + 12);
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 20, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.1)", opacity: a, transform: `translateX(${(1 - a) * -40}px)` }}>
      <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, color: col, letterSpacing: 3, width: 190 }}>{k}</span>
      <span style={{ fontFamily: INTER, fontWeight: 800, fontSize: 40, color: C.ink }}>{v}</span>
    </div>
  );
};
const Corner: React.FC<{ f: number; label: string; col: string; right?: boolean }> = ({ f, label, col, right }) => {
  const a = sp(f, 0, 12, 200);
  return (
    <div style={{ position: "absolute", top: 70, [right ? "right" : "left"]: 90, transform: `translateX(${(1 - a) * (right ? 200 : -200)}px)`, opacity: Math.min(1, a * 1.5) }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, color: col, letterSpacing: 8, textAlign: right ? "right" : "left" }}>{label}</div>
      <div style={{ height: 6, width: 380, marginTop: 10, marginLeft: right ? "auto" : 0, background: col, boxShadow: `0 0 20px ${col}` }} />
    </div>
  );
};

const FighterPhone: React.FC<SceneP> = ({ f, d, o }) => {
  const cam = { pos: [mix(-4, 4, f / Math.max(1, d)), 14, 24] as V3, target: [0, 0, 0] as V3, fov: 30 };
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(40,215,255,0.2)" x={70} y={50} />
      <Scene3D rimA={PH} rimB="#7a5cff">
        <Cam {...cam} />
        <Phone p={[7, 1, 0]} r={[0.5, -0.4 + f * 0.004, -0.2]} s={1.15} />
        <ContactShadow p={[7, -3, 0]} w={30} d={14} opacity={0.6} />
      </Scene3D>
      <Corner f={f} label="IN THE LEFT CORNER" col={PH} />
      <Pos x={90} y={200}>
        <Slam f={f} at={L(o, "left") + 30} size={170} color={PH}>
          THE PHONE
        </Slam>
        <div style={{ marginTop: 30, width: 860 }}>
          <StatRow f={f} at={L(o, "s26")} k="FLAGSHIP" v="Galaxy S26 Ultra" col={PH} />
          <StatRow f={f} at={L(o, "snap")} k="CHIP" v="Snapdragon 8 Elite Gen 5" col={PH} />
          <StatRow f={f} at={L(o, "adreno")} k="GPU" v="Adreno 840" col={PH} />
          <StatRow f={f} at={L(o, "iphone")} k="RIVAL" v="iPhone 18 Pro" col="#b07aff" />
          <StatRow f={f} at={L(o, "a20")} k="CHIP" v="Apple A20 Pro · brand new" col="#b07aff" />
        </div>
      </Pos>
    </AbsoluteFill>
  );
};

const FighterSoc: React.FC<SceneP> = ({ f, d, o }) => {
  const ex = ez(f, 6, 40);
  const cam = { pos: [mix(0, 2, f / Math.max(1, d)), 10, 9.5] as V3, target: [0, 1.4, 0] as V3, fov: 34 };
  const keys = ["cpu", "gfx", "ai", "cam", "modem"];
  const blockFor: Record<string, string> = { cpu: "cpu", gfx: "gpu", ai: "npu", cam: "isp", modem: "modem" };
  const lit: Record<string, number> = {};
  keys.forEach((k) => (lit[blockFor[k]] = ez(f, L(o, k), L(o, k) + 8)));
  const one = L(o, "onesi");
  const merge = ez(f, one, one + 20);
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(40,215,255,0.16)" />
      <Scene3D rimA={PH} rimB="#b07aff">
        <Cam {...cam} />
        <Soc explode={ex * (1 - merge)} lit={lit} r={[0, 0.5 + f * 0.003, 0]} s={1.25} glow={1 + merge} />
      </Scene3D>
      {SOC_BLOCKS.map((b, i) => {
        const k = keys[["cpu", "gpu", "npu", "isp", "modem"].indexOf(b.k)];
        const at = L(o, k);
        if (f < at || merge > 0.5) return null;
        // approximate label anchor: block position after explode, rotated with the chip
        const ang = 0.5 + f * 0.003;
        const lx = b.p[0] * Math.cos(ang) + b.p[1] * Math.sin(ang);
        const lz = -b.p[0] * Math.sin(ang) + b.p[1] * Math.cos(ang);
        const [x, y] = project([lx * 1.25, (0.12 + ex * (0.8 + i * 0.35)) * 1.25, lz * 1.25], cam);
        const s = sp(f, at, 12, 220);
        return (
          <div key={b.k} style={{ position: "absolute", left: x + (i % 2 ? 90 : -90), top: y - 40, transform: `translate(-50%, -50%) scale(${s})`, padding: "8px 18px", borderRadius: 10, background: "rgba(5,7,10,0.85)", border: `2.5px solid ${b.col}`, fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, color: b.col, boxShadow: `0 0 26px ${b.col}66`, whiteSpace: "nowrap" }}>
            {b.label === "AI" ? "AI" : b.label}
          </div>
        );
      })}
      <Pos x={90} y={90}>
        <Line f={f} at={2} size={64} font={DISPLAY}>
          TINY CHIPS THAT DO EVERYTHING
        </Line>
      </Pos>
      {f >= one ? (
        <Center y={860}>
          <Stamp f={f} at={one} color={PH} rot={-2} size={84}>
            ALL ON ONE PIECE OF SILICON
          </Stamp>
        </Center>
      ) : null}
    </AbsoluteFill>
  );
};

const FighterRtx: React.FC<SceneP> = ({ f, d, o }) => {
  const t = f / Math.max(1, d);
  const cam = { pos: [mix(-30, -10, t), mix(18, 12, t), mix(26, 30, t)] as V3, target: [-6, 0, 0] as V3, fov: 30 };
  const tl = L(o, "launch");
  const t6 = L(o, "six2");
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(118,185,0,0.2)" x={30} y={50} />
      <Scene3D rimA={NV} rimB="#ffffff">
        <Cam {...cam} />
        <RtxCard p={[-8, 0, 0]} r={[0, 0.3 + f * 0.0025, 0]} spin={f * 0.3} accentK={1 + 0.3 * Math.sin(f * 0.1)} />
        <Floor y={-1.2} />
        <ContactShadow p={[-8, -1.15, 0]} w={44} d={24} />
      </Scene3D>
      <Corner f={f} label="IN THE RIGHT CORNER" col={NV} right />
      <Pos r={90} y={200} style={{ textAlign: "right" }}>
        <Slam f={f} at={20} size={170} color={NV}>
          RTX 5090
        </Slam>
        <div style={{ marginTop: 6 }}>
          <Line f={f} at={L(o, "monster")} size={40} font={MONO} color={C.mute}>
            NVIDIA'S MONSTER
          </Line>
        </div>
      </Pos>
      <Pos r={90} y={520} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 22 }}>
        {f >= L(o, "trans") ? <Roll f={f} from={0} to={92.2} at={L(o, "trans")} len={24} dec={1} size={96} color={C.ink} suffix=" B transistors" /> : null}
        {f >= L(o, "mem32") ? <Roll f={f} from={0} to={32} at={L(o, "mem32")} len={18} size={96} color={C.ink} suffix=" GB GDDR7" /> : null}
        {f >= tl ? (
          <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
            <div style={{ position: "relative", fontFamily: MONO, fontWeight: 800, fontSize: 96, color: f >= t6 ? C.mute : GOLD, opacity: ez(f, tl, tl + 8) }}>
              $1,999
              {f >= t6 ? <div style={{ position: "absolute", left: -8, right: -8, top: "52%", height: 8, background: C.red, width: `${ez(f, t6, t6 + 10) * 105}%` }} /> : null}
            </div>
            {f >= t6 ? (
              <Stamp f={f} at={t6 + 6} color={C.red} rot={-5} size={96}>
                ~$6,000
              </Stamp>
            ) : null}
          </div>
        ) : null}
        {f >= t6 ? <div style={{ fontFamily: MONO, fontSize: 22, color: C.mute }}>US street price, Nov 2026 · see my GPU price video</div> : null}
      </Pos>
    </AbsoluteFill>
  );
};

const FiveRounds: React.FC<SceneP> = ({ f, o }) => {
  const items: [string, string][] = [
    ["rl_raw", "RAW POWER"],
    ["rl_bench", "REAL BENCHMARK"],
    ["rl_mem", "MEMORY"],
    ["rl_heat", "HEAT"],
    ["rl_eff", "EFFICIENCY"],
  ];
  const tg = L(o, "letsgo");
  return (
    <AbsoluteFill style={{ transform: shake(f, tg, 14, 16) }}>
      <BG f={f} accent="rgba(255,194,71,0.16)" />
      <Center y={110}>
        <Slam f={f} at={0} size={130} color={GOLD} align="center">
          5 ROUNDS
        </Slam>
      </Center>
      <Pos x={0} w={1920} y={420} style={{ display: "flex", justifyContent: "center", gap: 28 }}>
        {items.map(([k, t], i) => {
          const at = Math.min(L(o, k), 30 + i * 12);
          const s = sp(f, at, 12, 200);
          if (f < at) return <div key={k} style={{ width: 320 }} />;
          return (
            <div key={k} style={{ width: 320, height: 380, borderRadius: 22, background: "linear-gradient(180deg, rgba(27,33,41,0.95), rgba(8,11,15,0.95))", border: `2px solid ${i === 4 ? PH : GOLD}88`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `translateY(${(1 - s) * 120}px) rotate(${(1 - s) * (i - 2) * 6}deg)`, opacity: Math.min(1, s * 1.5), boxShadow: `0 0 40px ${GOLD}22` }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 180, color: "transparent", WebkitTextStroke: `4px ${GOLD}`, lineHeight: 1 }}>{i + 1}</div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, color: C.ink, letterSpacing: 2, textAlign: "center", padding: "0 16px" }}>{t}</div>
            </div>
          );
        })}
      </Pos>
      {f >= tg ? (
        <Center y={860}>
          <Stamp f={f} at={tg} color={C.red} rot={-3} size={100}>
            LET'S GO
          </Stamp>
        </Center>
      ) : null}
    </AbsoluteFill>
  );
};

/* ===================================================================== ROUND 1 */
const Tflops: React.FC<SceneP> = ({ f, o }) => {
  const tt = L(o, "tril");
  const t840 = L(o, "a840");
  const t5090 = L(o, "r5090");
  const tv = L(o, "v1048");
  const trill = interpolate(f, [tt, tt + 60], [0, 1e12], clamp);
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(255,194,71,0.12)" />
      <Pos x={150} y={110}>
        <Line f={f} at={2} size={40} font={MONO} color={GOLD}>
          HOW TO MEASURE A GPU
        </Line>
        <div style={{ display: "flex", alignItems: "baseline", gap: 30, marginTop: 10 }}>
          <Slam f={f} at={6} size={150} color={C.ink}>
            TFLOPS
          </Slam>
          {f >= tt ? <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 52, color: GOLD, opacity: ez(f, tt, tt + 8) }}>= {Math.round(trill).toLocaleString("en-US")} / sec</div> : null}
        </div>
      </Pos>
      <Pos x={150} y={470}>
        <HBar f={f} at={t840} label="ADRENO 840" sub="phone · Snapdragon 8 Elite Gen 5" v={4.0} max={104.8} color={PH} unit="TFLOPS" w={1620} />
        <HBar f={f} at={Math.max(t5090, tv - 30)} label="RTX 5090" sub="desktop" v={104.8} max={104.8} color={NV} unit="TFLOPS" w={1620} />
      </Pos>
      <Note>FP32. Adreno 840 ≈ 3.7–4.0 TFLOPS depending on clock (cpu-monkey, NanoReview). RTX 5090: 104.8 TFLOPS (NVIDIA spec).</Note>
    </AbsoluteFill>
  );
};

const X26: React.FC<SceneP> = ({ f, o }) => {
  const tg = L(o, "glued");
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(118,185,0,0.14)" />
      <Pos x={120} y={140}>
        <Slam f={f} at={0} size={330} color={NV}>
          26×
        </Slam>
        <Line f={f} at={8} size={50} font={DISPLAY}>
          MORE RAW POWER
        </Line>
      </Pos>
      <Pos x={900} y={170} w={900}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(9, 80px)", gap: 14 }}>
          {Array.from({ length: 26 }, (_, i) => {
            const at = tg + i * 2;
            if (f < at) return <div key={i} style={{ width: 80, height: 150 }} />;
            const s = sp(f, at, 10, 260);
            return <div key={i} style={{ width: 80, height: 150, borderRadius: 14, border: `3px solid ${PH}`, background: `linear-gradient(160deg, ${PH}55, #0b1220)`, transform: `translateY(${(1 - s) * -200}px)`, opacity: Math.min(1, s * 2), boxShadow: `0 0 18px ${PH}55` }} />;
          })}
        </div>
        {f >= tg + 60 ? (
          <div style={{ marginTop: 26, display: "flex", alignItems: "center", gap: 20, opacity: ez(f, tg + 60, tg + 72) }}>
            <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, color: C.ink }}>26 PHONES</span>
            <span style={{ fontFamily: DISPLAY, fontSize: 60, color: GOLD }}>=</span>
            <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, color: NV }}>1 GRAPHICS CARD</span>
          </div>
        ) : null}
      </Pos>
    </AbsoluteFill>
  );
};

const Consoles: React.FC<SceneP> = ({ f, d, o }) => {
  const ts = L(o, "seriess");
  const tp = L(o, "ps4");
  const tpk = L(o, "pocket");
  const tg = L(o, "gow");
  const tl = L(o, "lies");
  const tr = L(o, "realtest");
  const rip = ez(f, tl + 10, tl + 26);
  return (
    <AbsoluteFill>
      {f < tpk ? <BG f={f} accent="rgba(255,194,71,0.14)" /> : <Foot src="hand" at={MSEG[4] + 1} f={f - tpk} d={d - tpk} dim={0.5} />}
      {f >= tpk ? <Shade k={0.7} /> : null}
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${rip * 30}px) rotate(${rip * -4}deg)`, opacity: 1 - rip * 0.85, clipPath: rip > 0 ? `polygon(0 0, 100% 0, 100% ${100 - rip * 30}%, 60% ${100 - rip * 18}%, 30% ${100 - rip * 40}%, 0 ${100 - rip * 22}%)` : undefined }}>
        <Pos x={150} y={110}>
          <Line f={f} at={2} size={64} font={DISPLAY} color={GOLD}>
            BUT HERE'S SOMETHING WILD…
          </Line>
        </Pos>
        {f < tpk ? (
          <Pos x={150} y={300}>
            <HBar f={f} at={10} label="PHONE" sub="Adreno 840" v={4.0} max={4.4} color={PH} unit="TFLOPS" w={1620} h={60} />
            <HBar f={f} at={ts} label="XBOX SERIES S" v={4.0} max={4.4} color="#35f29a" unit="TFLOPS" w={1620} h={60} />
            <HBar f={f} at={tp} label="PLAYSTATION 4" v={1.84} max={4.4} color={C.mute} unit="TFLOPS" w={1620} h={60} />
          </Pos>
        ) : (
          <Pos x={150} y={300}>
            <Slam f={f} at={tpk} size={110} color={C.ink}>
              {"THE PHONE IN YOUR POCKET\n> THE PS4"}
            </Slam>
            <div style={{ marginTop: 30 }}>
              <Line f={f} at={tg} size={44}>
                the console that ran God of War & Red Dead Redemption 2
              </Line>
            </div>
          </Pos>
        )}
      </div>
      {f >= tl ? (
        <Center y={420}>
          <Stamp f={f} at={tl} color={C.red} rot={-6} size={150}>
            ON PAPER
          </Stamp>
          {f >= tr ? (
            <div style={{ marginTop: 50 }}>
              <Slam f={f} at={tr} size={90} color={GOLD} align="center">
                LET'S RUN A REAL TEST
              </Slam>
            </div>
          ) : null}
        </Center>
      ) : null}
      <Note>Peak FP32 on paper. Xbox Series S 4 TFLOPS, PS4 1.84 TFLOPS (manufacturer specs).</Note>
    </AbsoluteFill>
  );
};

/* ===================================================================== ROUND 2 */
type VB = { k: string; label: string; v: number; col: string; at: number; sub?: string };
const VBars: React.FC<{ f: number; bars: VB[]; max: number; H?: number; hl?: string[]; hlAt?: number; dimOthers?: number }> = ({ f, bars, max, H = 560, hl = [], hlAt = 1e9, dimOthers = 0 }) => (
  <div style={{ display: "flex", alignItems: "flex-end", gap: 50, height: H + 150 }}>
    {bars.map((b) => {
      if (f < b.at) return <div key={b.k} style={{ width: 230 }} />;
      const p = interpolate(f, [b.at, b.at + 26], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
      const isHl = hl.includes(b.k) && f >= hlAt;
      const dim = !hl.includes(b.k) && f >= hlAt ? dimOthers : 0;
      return (
        <div key={b.k} style={{ width: 230, display: "flex", flexDirection: "column", alignItems: "center", opacity: 1 - dim }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 50, color: b.col, marginBottom: 10 }}>{Math.round(b.v * p).toLocaleString("en-US")}</div>
          <div style={{ width: 170, height: Math.max(4, (H * b.v * p) / max), borderRadius: "14px 14px 0 0", background: `linear-gradient(0deg, ${b.col}44, ${b.col})`, boxShadow: isHl ? `0 0 60px ${b.col}, 0 0 0 4px ${C.ink}` : `0 0 30px ${b.col}77` }} />
          <div style={{ height: 3, width: 220, background: "rgba(255,255,255,0.25)" }} />
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, color: C.ink, marginTop: 14, textAlign: "center", lineHeight: 1.05 }}>{b.label}</div>
          {b.sub ? <div style={{ fontFamily: MONO, fontSize: 20, color: C.mute, marginTop: 4, textAlign: "center" }}>{b.sub}</div> : null}
        </div>
      );
    })}
  </div>
);
const benchBars = (o: number, extra?: VB): VB[] => [
  { k: "s26", label: "GALAXY S26 ULTRA", sub: "phone", v: 3000, col: PH, at: L(o, "b_s26") },
  { k: "1650", label: "GTX 1650", sub: "desktop · 2019", v: 3400, col: GOLD, at: L(o, "b1650") },
  { k: "3050", label: "RTX 3050", sub: "desktop", v: 6300, col: "#8fd14f", at: L(o, "b3050") },
  { k: "4060", label: "RTX 4060", sub: "desktop", v: 10600, col: NV, at: L(o, "b4060") },
  ...(extra ? [extra] : []),
];

const Bench: React.FC<SceneP> = ({ f, o }) => {
  const ta = L(o, "again");
  const tb = L(o, "best");
  const zoom = ez(f, ta, ta + 16);
  return (
    <AbsoluteFill style={{ transform: shake(f, ta, 10, 14) }}>
      <BG f={f} accent="rgba(40,215,255,0.12)" />
      <Pos x={120} y={70}>
        <Line f={f} at={2} size={34} font={MONO} color={GOLD}>
          3DMARK · STEEL NOMAD LIGHT
        </Line>
        <Line f={f} at={L(o, "samechart")} size={58} font={DISPLAY}>
          SAME TEST ON PHONES AND PCs → ONE CHART
        </Line>
      </Pos>
      <div style={{ position: "absolute", left: 160, top: 230, transform: `scale(${1 + zoom * 0.18})`, transformOrigin: "20% 90%" }}>
        <VBars f={f} bars={benchBars(o)} max={10600} hl={["s26", "1650"]} hlAt={ta} dimOthers={0.75} />
      </div>
      {f >= ta ? (
        <Pos x={380} y={330}>
          <Slam f={f} at={ta + 4} size={170} color={C.ink}>
            ≈
          </Slam>
        </Pos>
      ) : null}
      {f >= tb ? (
        <Pos x={1120} y={300} w={720}>
          <div style={{ padding: "26px 30px", borderRadius: 20, background: "rgba(5,7,10,0.88)", border: `2px solid ${GOLD}`, opacity: ez(f, tb, tb + 12) }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, color: C.ink, lineHeight: 1.1 }}>
              BEST ANDROID PHONE <span style={{ color: GOLD }}>≈ GTX 1650</span>
            </div>
            <div style={{ marginTop: 16 }}>
              <Line f={f} at={L(o, "steam")} size={32} color={C.mute}>
                a 2019 budget card · for years one of the most used GPUs on Steam
              </Line>
            </div>
          </div>
        </Pos>
      ) : null}
      <Note>Scores ≈ (UL/3DMark, TechARP, The Elec, NanoReview). S26 Ultra (Snapdragon) 2,813–3,026.</Note>
    </AbsoluteFill>
  );
};

const Budget: React.FC<SceneP> = ({ f, d, o }) => {
  const tt = L(o, "toy");
  const tb = L(o, "budget");
  return (
    <AbsoluteFill>
      <Foot src="mob" at={MSEG[6] + 3} f={f} d={d} zoom={[1.05, 1.15]} dim={0.3} />
      <Shade k={0.85} />
      <Pos x={110} y={260}>
        <Line f={f} at={2} size={50} font={DISPLAY} color={C.mute}>
          MILLIONS PLAYED EVERY BIG PC GAME AT THIS LEVEL
        </Line>
        <div style={{ marginTop: 40 }}>
          <Slam f={f} at={tt} size={120} color={C.ink}>
            {"YOUR PHONE\nISN'T A TOY"}
          </Slam>
        </div>
        <div style={{ marginTop: 30 }}>
          <Slam f={f} at={tb} size={80} color={PH}>
            = A BUDGET GAMING PC 🎮
          </Slam>
        </div>
      </Pos>
    </AbsoluteFill>
  );
};

const MyPhone: React.FC<SceneP> = ({ f, d, o }) => {
  const t870 = L(o, "b870");
  const tq = L(o, "quarter");
  const ts = L(o, "still");
  const tr = L(o, "remember");
  const chart = f >= t870 - 10;
  return (
    <AbsoluteFill>
      <Foot src="hand" at={MSEG[3] + 2} f={f} d={d} zoom={[1.0, 1.1]} dim={chart ? 0.65 : 0.1} blur={chart ? 6 : 0} />
      {!chart ? (
        <>
          <Shade k={0.7} side="bottom" />
          <Pos x={110} y={760}>
            <Tag f={f} at={L(o, "oneplus")} color={PH} size={34}>
              MY PHONE · ONEPLUS 10T
            </Tag>
            <div style={{ marginTop: 14 }}>
              <Line f={f} at={L(o, "oneplus") + 20} size={52} font={DISPLAY}>
                SNAPDRAGON 8+ GEN 1 · ADRENO 730 · 2022
              </Line>
            </div>
          </Pos>
        </>
      ) : (
        <>
          <div style={{ position: "absolute", left: 300, top: 120 }}>
            <VBars
              f={f}
              bars={[
                { k: "10t", label: "ONEPLUS 10T", sub: "my phone · 2022", v: 870, col: "#b07aff", at: t870 - 10 },
                { k: "1650", label: "GTX 1650", sub: "desktop · 2019", v: 3400, col: GOLD, at: t870 - 4 },
                { k: "s26", label: "GALAXY S26 ULTRA", sub: "phone · 2026", v: 3000, col: PH, at: t870 },
              ]}
              max={3400}
              H={520}
            />
          </div>
          <Pos x={1230} y={240} w={620}>
            <Slam f={f} at={tq} size={150} color="#b07aff">
              ¼
            </Slam>
            <Line f={f} at={tq + 6} size={50} font={DISPLAY}>
              OF A GTX 1650
            </Line>
            <div style={{ marginTop: 30 }}>
              <XTag f={f} at={ts} ok>
                STILL RUNS RDR 2
              </XTag>
            </div>
            {f >= tr ? (
              <div style={{ marginTop: 40 }}>
                <Stamp f={f} at={tr} color={GOLD} rot={-7} size={70}>
                  REMEMBER THIS
                </Stamp>
              </div>
            ) : null}
          </Pos>
          <Note>OnePlus 10T Steel Nomad Light ≈ 865–869 (UL Benchmarks).</Note>
        </>
      )}
    </AbsoluteFill>
  );
};

const Brutal: React.FC<SceneP> = ({ f, d, o }) => {
  const tg = L(o, "gapb");
  return (
    <AbsoluteFill style={{ transform: shake(f, tg, 14, 16) }}>
      <Foot src="cd" at={155} f={f} d={d} zoom={[1.05, 1.2]} dim={0.45} />
      <Shade k={0.6} side="all" />
      <Center y={300}>
        <div style={{ display: "flex", alignItems: "center", gap: 50 }}>
          <Slam f={f} at={2} size={150} color={GOLD} align="center">
            GTX 1650
          </Slam>
          <Slam f={f} at={14} size={170} color={C.red} align="center">
            ≠
          </Slam>
          <Slam f={f} at={24} size={150} color={NV} align="center">
            RTX 5090
          </Slam>
        </div>
        {f >= tg ? (
          <div style={{ marginTop: 50 }}>
            <Stamp f={f} at={tg} color={C.red} rot={-3} size={110}>
              THE GAP GETS BRUTAL
            </Stamp>
          </div>
        ) : null}
      </Center>
    </AbsoluteFill>
  );
};

/* ===================================================================== ROUND 3 */
/** Data pipe with moving packets. */
const Pipe: React.FC<{ f: number; w: number; h: number; col: string; speed: number; density: number; label: string; value: string; at: number }> = ({ f, w, h, col, speed, density, label, value, at }) => {
  if (f < at) return <div style={{ height: h + 90 }} />;
  const a = ez(f, at, at + 14);
  const n = Math.round(w / density);
  return (
    <div style={{ opacity: a, transform: `translateX(${(1 - a) * -60}px)`, marginBottom: 40 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", width: w, marginBottom: 10 }}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 50, color: C.ink }}>{label}</span>
        <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 56, color: col }}>{value}</span>
      </div>
      <div style={{ position: "relative", width: w, height: h, borderRadius: h / 2, background: "rgba(255,255,255,0.05)", border: `2px solid ${col}66`, overflow: "hidden", boxShadow: `inset 0 0 30px ${col}22` }}>
        {Array.from({ length: n }, (_, i) => {
          const x = (((i * density + f * speed) % (w + 80)) + w + 80) % (w + 80) - 60;
          const r = ((Math.sin(i * 91.7) * 43758.5) % 1 + 1) % 1;
          return <div key={i} style={{ position: "absolute", left: x, top: h * (0.15 + 0.7 * r) - Math.min(14, h * 0.18), width: 44, height: Math.min(28, h * 0.36), borderRadius: 6, background: col, boxShadow: `0 0 14px ${col}` }} />;
        })}
      </div>
    </div>
  );
};
const Memory: React.FC<SceneP> = ({ f, o }) => {
  const tb = L(o, "bw5090");
  const tp = L(o, "b85");
  const tsh = L(o, "share");
  const tfi = L(o, "fight");
  const t20 = L(o, "x20");
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(118,185,0,0.12)" />
      <Pos x={130} y={90}>
        <Line f={f} at={2} size={58} font={DISPLAY}>
          A GPU IS ONLY AS FAST AS THE DATA YOU FEED IT
        </Line>
      </Pos>
      <Pos x={130} y={240}>
        <Pipe f={f} w={1660} h={150} col={NV} speed={34} density={70} label="RTX 5090 · private GDDR7" value="1,792 GB/s" at={tb} />
        <Pipe f={f} w={1660} h={26} col={PH} speed={4} density={160} label="FLAGSHIP PHONE · shared LPDDR5X" value="~85 GB/s" at={tp} />
      </Pos>
      {f >= tsh ? (
        <Pos x={130} y={760} style={{ display: "flex", gap: 24 }}>
          {["CPU", "AI CHIP", "CAMERA", "GPU"].map((t, i) => {
            const at = (i < 3 ? tfi - 30 : tsh) + i * 6;
            if (f < at) return null;
            const s = sp(f, at, 12, 220);
            const col = t === "GPU" ? PH : C.red;
            return (
              <div key={t} style={{ padding: "12px 26px", borderRadius: 12, border: `3px solid ${col}`, background: "rgba(5,7,10,0.85)", fontFamily: DISPLAY, fontWeight: 700, fontSize: 48, color: col, transform: `scale(${s}) translateX(${t === "GPU" ? 0 : Math.sin(f * 0.6 + i) * 4}px)` }}>
                {t}
              </div>
            );
          })}
          {f >= tfi ? <div style={{ alignSelf: "center", fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.mute, opacity: ez(f, tfi, tfi + 10) }}>← all fighting over the same memory</div> : null}
        </Pos>
      ) : null}
      {f >= t20 ? (
        <Pos r={110} y={720}>
          <Slam f={f} at={t20} size={180} color={C.red}>
            20× LESS
          </Slam>
        </Pos>
      ) : null}
      <Note>RTX 5090 bandwidth: NVIDIA spec. Phone ≈ 64-bit LPDDR5X-10667 (estimate).</Note>
    </AbsoluteFill>
  );
};

const Highway: React.FC<SceneP> = ({ f, o }) => {
  const tr = L(o, "road");
  const treason = L(o, "reason");
  const tthe = L(o, "theroad");
  const lanes = 12;
  const W = 1920;
  const car = (x: number, y: number, w: number, h: number, col: string, key: string | number, label?: string) => (
    <div key={key} style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 8, background: col, boxShadow: `0 0 16px ${col}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: Math.min(22, h * 0.55), color: "#05070a" }}>
      {label}
    </div>
  );
  const jam = f >= tr ? 1 : 0;
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(255,194,71,0.1)" />
      {/* highway */}
      <div style={{ position: "absolute", left: 0, top: 150, width: W, height: 420, opacity: ez(f, 0, 12), background: "#0b0e12", borderTop: `3px solid ${NV}`, borderBottom: `3px solid ${NV}` }}>
        {Array.from({ length: lanes - 1 }, (_, i) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, top: ((i + 1) * 420) / lanes, height: 2, backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.35) 50%, transparent 50%)", backgroundSize: "60px 2px", backgroundPosition: `${-f * 30}px 0` }} />
        ))}
        {Array.from({ length: lanes * 3 }, (_, i) => {
          const lane = i % lanes;
          const sp0 = 26 + (i % 5) * 4;
          const x = ((i * 233 + f * sp0) % (W + 200)) - 100;
          return car(x, lane * 35 + 6, 70, 23, NV, i);
        })}
        <div style={{ position: "absolute", left: 30, top: -64, fontFamily: DISPLAY, fontWeight: 700, fontSize: 48, color: NV }}>RTX · 12-LANE HIGHWAY</div>
      </div>
      {/* single shared road */}
      {f >= tr ? (
        <div style={{ position: "absolute", left: 0, top: 700, width: W, height: 90, background: "#0b0e12", borderTop: `3px solid ${PH}`, borderBottom: `3px solid ${PH}`, opacity: ez(f, tr, tr + 12) }}>
          {[
            ["BUS · CPU", 260, C.amber, 0.8],
            ["TRUCK · AI", 230, "#b07aff", 1.0],
            ["BIKE · CAM", 120, "#ff5c8a", 1.3],
            ["GPU", 120, PH, 0.6],
          ].map(([lbl, w, col, s], i) => {
            const x = ((i * 520 + (f - tr) * (s as number) * (jam ? 3 : 6)) % (W + 300)) - 150;
            return car(x, 18, w as number, 54, col as string, `r${i}`, lbl as string);
          })}
          <div style={{ position: "absolute", left: 30, top: -64, fontFamily: DISPLAY, fontWeight: 700, fontSize: 48, color: PH }}>PHONE · ONE SHARED ROAD</div>
        </div>
      ) : null}
      {f >= treason ? (
        <Pos x={110} y={850}>
          <Line f={f} at={treason} size={46}>
            {"why phones struggle with high resolution & heavy textures"}
          </Line>
        </Pos>
      ) : null}
      {f >= tthe ? (
        <Pos r={110} y={860}>
          <Stamp f={f} at={tthe} color={GOLD} rot={-4} size={90}>
            IT'S THE ROAD
          </Stamp>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

/* ===================================================================== ROUND 4 */
const Cooling: React.FC<SceneP> = ({ f, o }) => {
  const tf = L(o, "fans");
  const tp = L(o, "phonecool");
  const tg = L(o, "glass");
  const th = L(o, "hand");
  const k = ez(f, tp - 8, tp + 20);
  const cam = { pos: mixV([-6, 22, 30], [14, 9, 14], k), target: mixV([-4, 2, 0], [14, 0, 0], k), fov: 30 };
  const spin = f < tf ? f * 0.05 : f * 0.05 + Math.pow(Math.max(0, f - tf), 1.4) * 0.02;
  return (
    <AbsoluteFill>
      <BG f={f} accent={k < 0.5 ? "rgba(118,185,0,0.14)" : "rgba(40,215,255,0.14)"} x={k < 0.5 ? 35 : 65} />
      <Scene3D rimA={NV} rimB={PH}>
        <Cam {...cam} />
        <RtxCard p={[-6, 0, 0]} spin={spin} explode={ez(f, 10, 40) * 0.9} r={[0, 0.2, 0]} />
        <Phone p={[14, 0, 0]} r={[0, -0.3 + f * 0.002, 0]} s={0.9} />
        <Floor y={-1.2} />
      </Scene3D>
      {k < 0.5 ? (
        <Pos x={110} y={110}>
          <Slam f={f} at={6} size={90} color={NV}>
            GIANT HEATSINK
          </Slam>
          <div style={{ marginTop: 10 }}>
            <Slam f={f} at={tf} size={90} color={NV}>
              + 3 FANS
            </Slam>
          </div>
          <div style={{ marginTop: 10 }}>
            <Line f={f} at={tf + 20} size={44}>
              + a whole PC case breathing air
            </Line>
          </div>
        </Pos>
      ) : (
        <Pos x={110} y={110}>
          <Slam f={f} at={tg - 10} size={110} color={PH}>
            A SLAB OF GLASS
          </Slam>
          <div style={{ marginTop: 12 }}>
            <Slam f={f} at={th} size={80} color={C.ink}>
              … AND YOUR HAND ✋
            </Slam>
          </div>
        </Pos>
      )}
    </AbsoluteFill>
  );
};

const Stress: React.FC<SceneP> = ({ f, d, o }) => {
  const ts = L(o, "stress");
  const th = L(o, "hold");
  const thf = L(o, "half");
  const tdk = L(o, "desk");
  const t5 = L(o, "five5");
  const tdr = L(o, "drop");
  const tpr = L(o, "protect");
  const W = 1150;
  const H = 440;
  const draw = interpolate(f, [ts, th + 40], [0, 1], clamp);
  const N = 20;
  const phoneV = (i: number) => (i === 0 ? 100 : 100 - 34 * (1 - Math.exp(-i / 3.5)) - Math.sin(i * 1.7) * 1.5);
  const rtxV = (i: number) => 99.3 + Math.sin(i * 2.1) * 0.4;
  const pts = (fn: (i: number) => number) => {
    const out: string[] = [];
    for (let i = 0; i <= N * draw; i++) out.push(`${(i / N) * W},${H - ((fn(i) - 30) / 75) * H}`);
    return out.join(" ");
  };
  const fpsShow = f >= t5;
  const fps = Math.round(interpolate(f, [tdr, tdr + 60], [60, 38], clamp));
  const temp = Math.round(interpolate(f, [ts, thf], [34, 47], clamp));
  return (
    <AbsoluteFill>
      <Foot src="hand" at={MSEG[2] + 2} f={f} d={d} dim={0.25} thermal={interpolate(f, [0, d], [0, 1], clamp)} />
      <Shade k={0.85} side="all" />
      <Pos x={110} y={70}>
        <Line f={f} at={2} size={58} font={DISPLAY}>
          WHAT HAPPENS AFTER 20 MINUTES?
        </Line>
        <Line f={f} at={ts} size={28} font={MONO} color={C.mute}>
          3DMARK STRESS TEST · SAME SCENE, 20 LOOPS
        </Line>
      </Pos>
      <div style={{ position: "absolute", left: 110, top: 260, width: W, height: H, borderLeft: "2px solid rgba(255,255,255,0.25)", borderBottom: "2px solid rgba(255,255,255,0.25)" }}>
        {/* 56–77% band */}
        {f >= th ? <div style={{ position: "absolute", left: 0, right: 0, top: H - ((77 - 30) / 75) * H, height: ((77 - 56) / 75) * H, background: "rgba(255,61,82,0.15)", borderTop: `2px dashed ${C.red}`, borderBottom: `2px dashed ${C.red}`, opacity: ez(f, th, th + 12) }} /> : null}
        <svg width={W} height={H} style={{ position: "absolute", overflow: "visible" }}>
          {f >= tdk ? <polyline points={pts(rtxV)} fill="none" stroke={NV} strokeWidth={7} style={{ filter: `drop-shadow(0 0 10px ${NV})` }} opacity={ez(f, tdk, tdk + 10)} /> : null}
          <polyline points={pts(phoneV)} fill="none" stroke={PH} strokeWidth={7} style={{ filter: `drop-shadow(0 0 10px ${PH})` }} />
        </svg>
        <div style={{ position: "absolute", left: -90, top: -16, fontFamily: MONO, fontSize: 24, color: C.mute }}>100%</div>
        <div style={{ position: "absolute", left: 0, bottom: -40, fontFamily: MONO, fontSize: 22, color: C.mute }}>loop 1</div>
        <div style={{ position: "absolute", right: 0, bottom: -40, fontFamily: MONO, fontSize: 22, color: C.mute }}>loop 20 (~20 min)</div>
        {f >= th ? <div style={{ position: "absolute", right: 10, top: H - ((77 - 30) / 75) * H - 50, fontFamily: MONO, fontWeight: 800, fontSize: 30, color: C.red, opacity: ez(f, th, th + 12) }}>S26 ULTRA HOLDS 56–77%</div> : null}
        {f >= tdk ? <div style={{ position: "absolute", left: 20, top: H - ((99 - 30) / 75) * H - 50, fontFamily: MONO, fontWeight: 800, fontSize: 30, color: NV, opacity: ez(f, tdk, tdk + 12) }}>DESKTOP RTX · FLAT FOR HOURS</div> : null}
      </div>
      <Pos x={1360} y={260} w={480}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.mute, letterSpacing: 3 }}>PHONE TEMP (illustration)</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 110, color: temp > 43 ? C.red : C.amber }}>{temp}°C</div>
        {f >= thf ? (
          <div style={{ marginTop: 10 }}>
            <Slam f={f} at={thf} size={86} color={C.red}>
              {"UP TO\n~½ GONE"}
            </Slam>
          </div>
        ) : null}
        {fpsShow ? (
          <div style={{ marginTop: 26, opacity: ez(f, t5, t5 + 10) }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.mute, letterSpacing: 3 }}>FPS (illustration)</div>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 100, color: fps < 50 ? C.red : C.green }}>{fps}</div>
          </div>
        ) : null}
      </Pos>
      {f >= tpr ? (
        <Center y={800}>
          <Stamp f={f} at={tpr} color={PH} rot={-2} size={70}>
            🛡 NOT BROKEN · PROTECTING ITSELF
          </Stamp>
        </Center>
      ) : null}
      <Note>Stability 56–77% from HotHardware, The Elec, MakeUseOf (Steel Nomad Light Stress Test). Temperature & FPS shown are illustrative.</Note>
    </AbsoluteFill>
  );
};

const SoFar: React.FC<SceneP> = ({ f, o }) => {
  const tc = L(o, "changes");
  const g = f >= tc;
  return (
    <AbsoluteFill>
      <BG f={f} accent={g ? "rgba(40,215,255,0.2)" : "rgba(118,185,0,0.18)"} />
      <Center y={250}>
        <Line f={f} at={2} size={50} font={MONO} color={C.mute}>
          AFTER 4 ROUNDS
        </Line>
        <div style={{ display: "flex", alignItems: "center", gap: 60, marginTop: 30 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 300, color: PH, lineHeight: 1 }}>0</div>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 36, color: PH, letterSpacing: 6 }}>PHONE</div>
          </div>
          <div style={{ fontFamily: DISPLAY, fontSize: 200, color: C.mute }}>–</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 300, color: NV, lineHeight: 1, textShadow: `0 0 70px ${NV}` }}>4</div>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 36, color: NV, letterSpacing: 6 }}>RTX</div>
          </div>
        </div>
        {g ? (
          <div style={{ marginTop: 40 }}>
            <Slam f={f} at={tc} size={100} color={GOLD} align="center">
              BUT ROUND 5 CHANGES EVERYTHING
            </Slam>
          </div>
        ) : null}
      </Center>
    </AbsoluteFill>
  );
};

/* ===================================================================== ROUND 5 */
const Efficiency: React.FC<SceneP> = ({ f, o }) => {
  const t5 = L(o, "e5090");
  const tw = L(o, "e575");
  const t18 = L(o, "e018");
  const tp = L(o, "ephone");
  const t10 = L(o, "e10w");
  const t4 = L(o, "e04");
  const tt = L(o, "twice");
  const tilt = interpolate(f, [t18, t18 + 20, t4, t4 + 24], [0, 10, 10, -14], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const card = (at: number, title: string, tf: string, w: string, ratio: string, col: string, ratioAt: number, wAt: number) =>
    f >= at ? (
      <div style={{ width: 640, padding: "28px 32px", borderRadius: 22, background: "rgba(5,7,10,0.88)", border: `3px solid ${col}`, boxShadow: `0 0 40px ${col}44`, opacity: ez(f, at, at + 12) }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, color: col }}>{title}</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 44, color: C.ink, marginTop: 10 }}>
          {tf} <span style={{ color: C.mute, fontSize: 30 }}>TFLOPS</span>
          {f >= wAt ? <span style={{ color: C.mute }}> ÷ {w}</span> : null}
        </div>
        {f >= ratioAt ? (
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 92, color: col, marginTop: 6, transform: `scale(${sp(f, ratioAt, 12, 220)})`, transformOrigin: "left center" }}>
            {ratio} <span style={{ fontSize: 30, color: C.mute }}>TFLOPS / WATT</span>
          </div>
        ) : null}
      </div>
    ) : null;
  return (
    <AbsoluteFill style={{ transform: shake(f, tt, 14, 14) }}>
      <BG f={f} accent="rgba(40,215,255,0.16)" />
      <Pos x={110} y={70} style={{ display: "flex", alignItems: "center", gap: 40 }}>
        <div style={{ position: "relative" }}>
          <Slam f={f} at={2} size={90} color={C.mute}>
            FASTER?
          </Slam>
          {f >= 30 ? <div style={{ position: "absolute", left: -6, top: "48%", height: 8, width: `${ez(f, 30, 40) * 105}%`, background: C.red }} /> : null}
        </div>
        <Slam f={f} at={40} size={110} color={GOLD}>
          SMARTER?
        </Slam>
      </Pos>
      <Pos x={110} y={260}>{card(t5, "RTX 5090", "~105", "575 W", "0.18", NV, t18, tw)}</Pos>
      <Pos r={110} y={260}>{card(tp, "PHONE GPU", "~4", "<10 W", "0.4+", PH, t4, t10)}</Pos>
      {/* balance scale */}
      <div style={{ position: "absolute", left: 660, top: 690, width: 600, height: 300 }}>
        <div style={{ position: "absolute", left: 290, top: 40, width: 20, height: 230, background: "#9aa3ad", borderRadius: 6 }} />
        <div style={{ position: "absolute", left: 0, top: 30, width: 600, height: 14, background: "#c9ced6", borderRadius: 7, transform: `rotate(${tilt}deg)`, transformOrigin: "50% 50%" }}>
          <div style={{ position: "absolute", left: -10, top: 14, width: 120, height: 50, borderRadius: "0 0 60px 60px", background: `${NV}aa`, boxShadow: `0 0 20px ${NV}` }} />
          <div style={{ position: "absolute", right: -10, top: 14, width: 120, height: 50, borderRadius: "0 0 60px 60px", background: `${PH}aa`, boxShadow: `0 0 20px ${PH}` }} />
        </div>
      </div>
      {f >= tt ? (
        <Center y={540}>
          <Stamp f={f} at={tt} color={PH} rot={-4} size={120}>
            PHONE: 2× MORE EFFICIENT
          </Stamp>
        </Center>
      ) : null}
      {f >= tt ? <Embers f={f} color={PH} n={60} speed={2} opacity={ez(f, tt, tt + 10)} /> : null}
      <Note>Phone GPU power varies by chip & load (~6–10 W class). Efficiency here = peak FP32 TFLOPS ÷ rated power.</Note>
    </AbsoluteFill>
  );
};

const Starved: React.FC<SceneP> = ({ f, d, o }) => {
  const tn = L(o, "notweak");
  const ts = L(o, "starved");
  const items: [string, string, string][] = [
    ["sp", "POWER", "🔋"],
    ["sc", "COOLING", "❄️"],
    ["sm", "MEMORY", "🧠"],
  ];
  return (
    <AbsoluteFill>
      <Foot src="hand" at={MSEG[7] + 2} f={f} d={d} dim={0.55} sat={0.4} />
      <Shade k={0.7} side="all" />
      <Pos x={110} y={110}>
        <Line f={f} at={2} size={50} font={MONO} color={GOLD}>
          THE WHOLE STORY IN ONE LINE
        </Line>
        <div style={{ position: "relative", display: "inline-block", marginTop: 20 }}>
          <Slam f={f} at={tn} size={130} color={C.ink}>
            PHONES ARE WEAK
          </Slam>
          {f >= tn + 18 ? (
            <div style={{ position: "absolute", top: "35%", fontFamily: DISPLAY, fontWeight: 700, fontSize: 70, color: C.red, transform: `rotate(-8deg) scale(${sp(f, tn + 18, 10, 240)})`, left: 330 }}>
              NOT
            </div>
          ) : null}
        </div>
      </Pos>
      {f >= ts ? (
        <Pos x={110} y={420}>
          <Slam f={f} at={ts} size={200} color={C.red}>
            STARVED
          </Slam>
        </Pos>
      ) : null}
      <Pos x={110} y={720} style={{ display: "flex", gap: 30 }}>
        {items.map(([k, t, ic]) => {
          const at = L(o, k);
          if (f < at) return null;
          const s = sp(f, at, 10, 240);
          return (
            <div key={k} style={{ padding: "16px 28px", borderRadius: 16, border: `3px solid ${C.red}`, background: "rgba(5,7,10,0.85)", transform: `scale(${1.8 - 0.8 * s}) rotate(${-3 + (k === "sc" ? 4 : 0)}deg)`, opacity: Math.min(1, s * 2), fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: C.ink }}>
              {ic} {t}
            </div>
          );
        })}
      </Pos>
    </AbsoluteFill>
  );
};

const Battery: React.FC<SceneP> = ({ f, o }) => {
  const tb = L(o, "batt");
  const tr = L(o, "runit");
  const td = L(o, "dead");
  const drain = interpolate(f, [tr + 10, td], [1, 0], clamp);
  const secs = Math.round(interpolate(f, [tr + 10, td], [0, 120], clamp));
  const col = drain > 0.5 ? C.green : drain > 0.2 ? C.amber : C.red;
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(255,61,82,0.12)" />
      <Pos x={110} y={90}>
        <Line f={f} at={2} size={56} font={DISPLAY} color={GOLD}>
          A CRAZY WAY TO PICTURE IT
        </Line>
      </Pos>
      <div style={{ position: "absolute", left: 200, top: 260, width: 760, height: 380, opacity: ez(f, tb, tb + 12) }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 40, border: `10px solid ${C.ink}` }} />
        <div style={{ position: "absolute", right: -50, top: 130, width: 40, height: 120, borderRadius: 10, background: C.ink }} />
        <div style={{ position: "absolute", left: 24, top: 24, bottom: 24, width: `${(760 - 48) * drain}px`, borderRadius: 22, background: col, boxShadow: `0 0 50px ${col}` }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 110, color: "#05070a", mixBlendMode: "normal" }}>{Math.round(drain * 100)}%</div>
      </div>
      <Pos x={200} y={680}>
        <Line f={f} at={tb} size={56} font={DISPLAY}>
          PHONE BATTERY ≈ 19 Wh
        </Line>
      </Pos>
      {f >= tr ? (
        <Pos x={1110} y={260}>
          <Line f={f} at={tr} size={44} font={MONO} color={NV}>
            + RTX 5090 @ 575 W
          </Line>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 200, color: col, marginTop: 10 }}>
            {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}
          </div>
        </Pos>
      ) : null}
      {f >= td ? (
        <Pos x={1110} y={600}>
          <Stamp f={f} at={td} color={C.red} rot={-5} size={110}>
            DEAD IN ~2 MIN
          </Stamp>
        </Pos>
      ) : null}
      <Note>19 Wh ÷ 575 W ≈ 0.033 h ≈ 2 minutes. Thought experiment only.</Note>
    </AbsoluteFill>
  );
};

/* ===================================================================== REAL GAMES */
const RealGames: React.FC<SceneP> = ({ f, d, o }) => {
  const tr = L(o, "real");
  return (
    <AbsoluteFill>
      <Foot src="mob" at={MSEG[0] + 2} f={f} d={d} zoom={[1.3, 1.1]} dim={0.35} blur={interpolate(f, [0, 20], [12, 0], clamp)} />
      <Shade k={0.6} side="all" />
      <Center y={380}>
        <Line f={f} at={2} size={60} font={DISPLAY} color={C.mute}>
          BENCHMARKS ✓
        </Line>
        <div style={{ marginTop: 20 }}>
          <Slam f={f} at={tr} size={160} color={C.ink} align="center">
            NOW, REAL GAMES
          </Slam>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

const Rdr: React.FC<SceneP> = ({ f, d, o }) => {
  const tn = L(o, "notcloud");
  const tc = L(o, "chip");
  return (
    <AbsoluteFill>
      <Foot src="mob" at={MSEG[5]} f={f} d={d} zoom={[1.0, 1.08]} dim={0.05} />
      <Shade k={0.75} side="bottom" />
      <Pos x={100} y={780}>
        <Tag f={f} at={4} color={PH} size={30}>
          RED DEAD REDEMPTION 2 · PC VERSION · ONEPLUS 10T
        </Tag>
        <div style={{ display: "flex", gap: 20, marginTop: 18 }}>
          <XTag f={f} at={tn}>
            CLOUD GAMING
          </XTag>
          <XTag f={f} at={tc} ok>
            RUNS ON THE CHIP IN MY HAND
          </XTag>
        </div>
      </Pos>
    </AbsoluteFill>
  );
};

const Box2: React.FC<{ f: number; at: number; title: string; lines: string[]; col: string; w?: number }> = ({ f, at, title, lines, col, w = 560 }) => {
  if (f < at) return null;
  const s = sp(f, at, 13, 190);
  return (
    <div style={{ width: w, padding: "28px 30px", borderRadius: 22, background: "rgba(5,7,10,0.9)", border: `3px solid ${col}`, boxShadow: `0 0 40px ${col}44`, transform: `translateY(${(1 - s) * 60}px)`, opacity: Math.min(1, s * 1.5) }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, color: col, letterSpacing: 4 }}>{title}</div>
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: C.ink, marginTop: 6 }}>
          {l}
        </div>
      ))}
    </div>
  );
};
const Translate: React.FC<SceneP> = ({ f, d, o }) => {
  const tx = L(o, "x86");
  const ta = L(o, "arm");
  const tl = L(o, "lang");
  const tt = L(o, "translate");
  const tlv = L(o, "live");
  const tfr = L(o, "frame");
  const flow = f >= tt;
  return (
    <AbsoluteFill>
      <Foot src="mob" at={MSEG[6]} f={f} d={d} dim={0.7} blur={8} />
      <Pos x={0} w={1920} y={90} style={{ textAlign: "center" }}>
        <Line f={f} at={2} size={60} font={DISPLAY}>
          A PC GAME CAN'T JUST RUN ON A PHONE
        </Line>
      </Pos>
      <Pos x={120} y={300}>
        <Box2 f={f} at={tx} title="PC GAME IS BUILT FOR" lines={["x86 CPU", "WINDOWS"]} col={NV} />
      </Pos>
      <Pos r={120} y={300}>
        <Box2 f={f} at={ta} title="PHONE SPEAKS" lines={["ARM CPU", "ANDROID"]} col={PH} />
      </Pos>
      {f >= tl && !flow ? (
        <Pos x={820} y={340}>
          <Slam f={f} at={tl} size={200} color={C.red}>
            ≠
          </Slam>
        </Pos>
      ) : null}
      {flow ? (
        <>
          <div style={{ position: "absolute", left: 700, top: 420, width: 520, height: 40 }}>
            {Array.from({ length: 8 }, (_, i) => {
              const x = ((f - tt) * 9 + i * 65) % 520;
              return <div key={i} style={{ position: "absolute", left: x, top: 8, width: 34, height: 24, borderRadius: 5, background: x < 260 ? NV : PH, boxShadow: `0 0 14px ${x < 260 ? NV : PH}` }} />;
            })}
          </div>
          <div style={{ position: "absolute", left: 870, top: 330, width: 180, height: 220, borderRadius: 20, border: `4px solid ${GOLD}`, background: "rgba(5,7,10,0.9)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${sp(f, tt, 12, 200)})`, boxShadow: `0 0 60px ${GOLD}77`, fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, color: GOLD, textAlign: "center" }}>
            TRANS-
            <br />
            LATE
          </div>
        </>
      ) : null}
      <Center y={720}>
        <div style={{ display: "flex", gap: 30 }}>
          {f >= tlv ? (
            <Slam f={f} at={tlv} size={110} color={C.red} align="center">
              LIVE
            </Slam>
          ) : null}
          {f >= tfr ? (
            <Slam f={f} at={tfr} size={110} color={C.ink} align="center">
              {`· EVERY FRAME · ${String(Math.max(0, f - tfr)).padStart(5, "0")}`}
            </Slam>
          ) : null}
        </div>
      </Center>
    </AbsoluteFill>
  );
};

const Emu: React.FC<SceneP> = ({ f, d, o }) => {
  const ts = L(o, "snap2");
  const tc = L(o, "code");
  const tv = L(o, "vulkan");
  const ta = L(o, "app");
  const tn = L(o, "native");
  const tb = L(o, "beta");
  const node = (at: number, x: number, y: number, t: string, sub: string, col: string, w = 330) =>
    f >= at ? (
      <div style={{ position: "absolute", left: x, top: y, width: w, padding: "16px 20px", borderRadius: 16, border: `3px solid ${col}`, background: "rgba(5,7,10,0.9)", transform: `scale(${sp(f, at, 12, 220)})`, boxShadow: `0 0 30px ${col}44` }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 46, color: C.ink }}>{t}</div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, color: col, letterSpacing: 2 }}>{sub}</div>
      </div>
    ) : null;
  const arrow = (at: number, x: number, y: number, w: number, col: string) =>
    f >= at ? <div style={{ position: "absolute", left: x, top: y, width: w * ez(f, at, at + 14), height: 6, background: col, boxShadow: `0 0 14px ${col}`, borderRadius: 3 }} /> : null;
  return (
    <AbsoluteFill>
      <Foot src="mob" at={MSEG[7]} f={f} d={d} dim={0.72} blur={6} />
      <Pos x={110} y={70} style={{ display: "flex", alignItems: "center", gap: 30 }}>
        <Slam f={f} at={2} size={100} color={GOLD}>
          MY EMULATOR
        </Slam>
        <Beta f={f} at={10} />
      </Pos>
      <Pos x={110} y={200}>
        <Line f={f} at={ts} size={36} font={MONO} color={C.red}>
          BUILT SPECIFICALLY FOR SNAPDRAGON
        </Line>
      </Pos>
      {/* CPU path */}
      {node(tc, 110, 330, "GAME CODE", "x86 · WINDOWS", NV)}
      {arrow(tc + 10, 445, 380, 200, GOLD)}
      {node(tc + 18, 650, 330, "MY EMULATOR", "TRANSLATES LIVE", GOLD, 380)}
      {arrow(tc + 28, 1035, 380, 200, GOLD)}
      {node(tc + 36, 1240, 330, "ARM CPU", "SNAPDRAGON", PH)}
      {/* GPU path */}
      {node(tv - 10, 110, 520, "GRAPHICS", "GAME RENDERER", NV)}
      {arrow(tv, 445, 570, 200, GOLD)}
      {node(tv + 6, 650, 520, "VULKAN", "STRAIGHT THROUGH", "#e8433a", 380)}
      {arrow(tv + 14, 1035, 570, 200, GOLD)}
      {node(tv + 20, 1240, 520, "ADRENO GPU", "THE PHONE'S GPU", PH)}
      {f >= ta ? (
        <Pos x={110} y={740} style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <div style={{ width: 150, height: 150, borderRadius: 36, background: "linear-gradient(145deg, #b8312f, #5b0f0e)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, color: "#fff", transform: `scale(${sp(f, ta, 10, 220)})`, boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>RDR2</div>
          <div>
            <Line f={f} at={ta + 6} size={52} font={DISPLAY}>
              LAUNCHES LIKE A NORMAL ANDROID APP
            </Line>
            <Line f={f} at={tn} size={40} font={MONO} color={C.green}>
              → FEELS LIKE A NATIVE GAME
            </Line>
          </div>
        </Pos>
      ) : null}
      {f >= tb ? (
        <Pos r={110} y={780}>
          <Stamp f={f} at={tb} color={GOLD} rot={-5} size={74}>
            STILL IN BETA · NOT RELEASED
          </Stamp>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const Meant: React.FC<SceneP> = ({ f, d, o }) => {
  const tq = L(o, "q1650");
  const th = L(o, "hwhalf");
  const ts = L(o, "soft");
  return (
    <AbsoluteFill>
      <Foot src="mob" at={MSEG[8] + 2} f={f} d={d} dim={0.35} />
      <Shade k={0.85} />
      <Pos x={110} y={170}>
        <Line f={f} at={2} size={50} font={MONO} color={GOLD}>
          REMEMBER THIS?
        </Line>
        <div style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 20 }}>
          <Slam f={f} at={tq} size={110} color="#b07aff">
            ¼ GTX 1650
          </Slam>
          <Slam f={f} at={tq + 20} size={110} color={C.ink}>
            → RDR 2 ✓
          </Slam>
        </div>
      </Pos>
      <Pos x={110} y={560} w={1100}>
        {f >= th ? (
          <div style={{ display: "flex", height: 120, borderRadius: 20, overflow: "hidden", border: "3px solid rgba(255,255,255,0.2)" }}>
            <div style={{ width: `${50 * ez(f, th, th + 16)}%`, background: `linear-gradient(90deg, ${PH}66, ${PH})`, display: "flex", alignItems: "center", paddingLeft: 26, fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, color: "#05070a" }}>HARDWARE</div>
            <div style={{ width: `${50 * ez(f, ts, ts + 16)}%`, background: `linear-gradient(90deg, ${GOLD}, ${GOLD}aa)`, display: "flex", alignItems: "center", paddingLeft: 26, fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, color: "#05070a" }}>SOFTWARE</div>
          </div>
        ) : null}
        {f >= ts ? (
          <div style={{ marginTop: 20 }}>
            <Line f={f} at={ts + 10} size={44}>
              software is the other half of the story
            </Line>
          </div>
        ) : null}
      </Pos>
    </AbsoluteFill>
  );
};

const CdTricks: React.FC<SceneP> = ({ f, d, o }) => {
  const tfo = L(o, "foliage");
  const tli = L(o, "lighting");
  const tdi = L(o, "distance");
  const ttr = L(o, "tricks");
  const tdl = L(o, "dlss");
  const tpa = L(o, "path");
  const dark = f >= ttr ? 0.55 : 0.05;
  return (
    <AbsoluteFill>
      <Foot src="cd" at={f < ttr ? 79 : 123} f={f} d={d} zoom={[1.02, 1.1]} dim={dark} />
      <Shade k={0.6} side="bottom" />
      <Pos x={60} y={60}>
        <Tag f={f} at={4} color={NV} size={30}>
          CRIMSON DESERT · RTX 5090
        </Tag>
      </Pos>
      {f < ttr ? (
        <>
          <Callout f={f} at={tfo} x={520} y={700} dx={-60} dy={-260} color={NV} title="FOLIAGE" until={ttr - 6} />
          <Callout f={f} at={tli} x={1200} y={260} dx={180} dy={-80} color={GOLD} title="LIGHTING" until={ttr - 6} />
          <Callout f={f} at={tdi} x={1480} y={520} dx={120} dy={160} color={PH} title="DRAW DISTANCE" until={ttr - 6} />
        </>
      ) : (
        <>
          <Pos x={110} y={170}>
            <Line f={f} at={ttr} size={58} font={DISPLAY}>
              PC TRICKS PHONES DON'T HAVE (YET)
            </Line>
          </Pos>
          {f >= tdl ? (
            <Pos x={110} y={320}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: NV }}>DLSS 4 · MULTI FRAME GENERATION</div>
              <div style={{ display: "flex", gap: 18, marginTop: 20 }}>
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                  const ai = i % 4 !== 0;
                  const at = tdl + 10 + i * 5;
                  if (f < at) return null;
                  return (
                    <div key={i} style={{ width: 170, height: 110, borderRadius: 12, border: `3px solid ${ai ? GOLD : C.ink}`, background: ai ? `${GOLD}22` : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 26, color: ai ? GOLD : C.ink, transform: `scale(${sp(f, at, 12, 240)})` }}>
                      {ai ? "AI" : "RENDERED"}
                    </div>
                  );
                })}
              </div>
            </Pos>
          ) : null}
          {f >= tpa ? (
            <Pos x={110} y={640}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: GOLD }}>FULL PATH TRACING</div>
              <svg width={1200} height={260} style={{ marginTop: 10 }}>
                <circle cx={80} cy={60} r={36} fill="#ffe08a" style={{ filter: "drop-shadow(0 0 20px #ffe08a)" }} />
                {[0, 1, 2, 3, 4].map((i) => {
                  const p = ez(f, tpa + i * 6, tpa + i * 6 + 24);
                  const pts = [
                    [80, 60],
                    [320 + i * 120, 230],
                    [520 + i * 110, 40 + i * 20],
                    [900 + i * 50, 220],
                  ];
                  const len = Math.max(1, Math.floor(p * 3));
                  const d = pts
                    .slice(0, len + 1)
                    .map((q, j) => `${j ? "L" : "M"}${q[0]},${q[1]}`)
                    .join(" ");
                  return <path key={i} d={d} fill="none" stroke="#ffe08a" strokeWidth={3} opacity={0.8} style={{ filter: "drop-shadow(0 0 6px #ffe08a)" }} />;
                })}
              </svg>
            </Pos>
          ) : null}
        </>
      )}
    </AbsoluteFill>
  );
};

const FightBack: React.FC<SceneP> = ({ f, d, o }) => {
  const tr = L(o, "prt");
  const tp = L(o, "ports");
  const tg = L(o, "gamehub");
  const tm = L(o, "myemu");
  const pill = (at: number, t: string, col: string) =>
    f >= at ? (
      <div style={{ padding: "16px 30px", borderRadius: 999, border: `3px solid ${col}`, background: "rgba(5,7,10,0.88)", fontFamily: DISPLAY, fontWeight: 700, fontSize: 54, color: C.ink, transform: `scale(${sp(f, at, 12, 220)})`, boxShadow: `0 0 30px ${col}44` }}>{t}</div>
    ) : null;
  return (
    <AbsoluteFill>
      <Foot src="hand" at={MSEG[8]} f={f} d={d} dim={0.45} />
      <Shade k={0.8} />
      <Pos x={110} y={120}>
        <Slam f={f} at={2} size={120} color={PH}>
          PHONES ARE FIGHTING BACK
        </Slam>
      </Pos>
      <Pos x={110} y={360} style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "flex-start" }}>
        {f >= tr ? (
          <XTag f={f} at={tr} ok>
            HARDWARE RAY TRACING
          </XTag>
        ) : null}
        {f >= tp ? (
          <XTag f={f} at={tp} ok>
            CONSOLE PORTS ON iPHONE · RESIDENT EVIL · ASSASSIN'S CREED
          </XTag>
        ) : null}
        <div style={{ display: "flex", gap: 22, marginTop: 10 }}>
          {pill(tg + 14, "GameHub", "#ff8a3d")}
          {pill(tg + 26, "Winlator", "#b07aff")}
          {f >= tm ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {pill(tm, "MY EMULATOR", GOLD)}
              <Beta f={f} at={tm + 8} />
            </div>
          ) : null}
        </div>
      </Pos>
    </AbsoluteFill>
  );
};

const Honest: React.FC<SceneP> = ({ f, d, o }) => {
  const items: [string, string][] = [
    ["lowres", "LOWER RESOLUTION"],
    ["lowset", "LOWER SETTINGS"],
    ["batt2", "BATTERY CRYING FOR HELP 🪫"],
  ];
  return (
    <AbsoluteFill>
      <Foot src="mob" at={MSEG[2] + 4} f={f} d={d} dim={0.45} sat={0.8} />
      <Shade k={0.85} />
      <Pos x={110} y={180}>
        <Line f={f} at={2} size={60} font={DISPLAY} color={GOLD}>
          TO BE HONEST, ON A PHONE YOU USUALLY GET…
        </Line>
        <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 40, alignItems: "flex-start" }}>
          {items.map(([k, t]) => (
            <XTag key={k} f={f} at={L(o, k)}>
              {t}
            </XTag>
          ))}
        </div>
      </Pos>
    </AbsoluteFill>
  );
};

/* ===================================================================== VERDICT */
const Verdict: React.FC<SceneP> = ({ f, o }) => {
  const tq = L(o, "q1");
  const tn = L(o, "no");
  const t26 = L(o, "v26");
  const t20 = L(o, "v20");
  const tt = L(o, "tired");
  return (
    <AbsoluteFill style={{ transform: shake(f, tn, 12, 14) }}>
      <BG f={f} accent="rgba(118,185,0,0.16)" />
      <Center y={60}>
        <Line f={f} at={2} size={44} font={MONO} color={GOLD}>
          FINAL VERDICT · PHONE 1 – 4 RTX
        </Line>
      </Center>
      <Center y={180}>
        <Line f={f} at={tq} size={72} font={DISPLAY}>
          IS A PHONE GPU AS POWERFUL AS AN RTX?
        </Line>
        {f >= tn ? (
          <div style={{ marginTop: 20 }}>
            <Stamp f={f} at={tn} color={C.red} rot={-3} size={160}>
              NO. NOT EVEN CLOSE.
            </Stamp>
          </div>
        ) : null}
      </Center>
      <Pos x={0} w={1920} y={640} style={{ display: "flex", justifyContent: "center", gap: 60 }}>
        <Slam f={f} at={t26} size={130} color={NV} sub="RAW POWER" align="center">
          26×
        </Slam>
        <Slam f={f} at={t20} size={130} color={NV} sub="MEMORY BANDWIDTH" align="center">
          20×
        </Slam>
        <Slam f={f} at={tt} size={130} color={NV} sub="NEVER GETS TIRED" align="center">
          ∞
        </Slam>
      </Pos>
    </AbsoluteFill>
  );
};

const NotWeak: React.FC<SceneP> = ({ f, d, o }) => {
  const ta = L(o, "absno");
  const tb = L(o, "best1650");
  const tw = L(o, "watts");
  return (
    <AbsoluteFill>
      <Foot src="hand" at={MSEG[5] + 6} f={f} d={d} dim={0.45} />
      <Shade k={0.8} />
      <Pos x={110} y={120}>
        <Line f={f} at={2} size={64} font={DISPLAY}>
          BUT IS A PHONE GPU WEAK?
        </Line>
        {f >= ta ? (
          <div style={{ marginTop: 20 }}>
            <Stamp f={f} at={ta} color={PH} rot={-3} size={130}>
              ABSOLUTELY NOT
            </Stamp>
          </div>
        ) : null}
      </Pos>
      <Pos x={110} y={560} style={{ display: "flex", flexDirection: "column", gap: 18, alignItems: "flex-start" }}>
        <XTag f={f} at={tb} ok>
          ≈ GTX 1650 LEVEL
        </XTag>
        <XTag f={f} at={tb + 70} ok>
          XBOX SERIES S COMPUTE (ON PAPER)
        </XTag>
        <XTag f={f} at={tw} ok>
          A FEW WATTS · ZERO FANS
        </XTag>
      </Pos>
    </AbsoluteFill>
  );
};

const Future: React.FC<SceneP> = ({ f, o }) => {
  const ta = L(o, "a20b");
  const tp = L(o, "pace");
  const tc = L(o, "chase");
  const H = 520;
  const max = 7000;
  const ys = [
    { y: "2026", v: 3000, at: 20 },
    { y: "+1 YR", v: 4200, at: tp },
    { y: "+2 YRS", v: 5880, at: tp + 24 },
  ];
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(40,215,255,0.16)" />
      <Pos x={110} y={70}>
        <Line f={f} at={2} size={56} font={DISPLAY} color={GOLD}>
          WHAT SHOULD REALLY GET YOU THINKING
        </Line>
      </Pos>
      <Pos x={110} y={190}>
        {f >= ta ? (
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <Tag f={f} at={ta} color="#b07aff" size={30}>
              APPLE A20 PRO
            </Tag>
            <Slam f={f} at={ta + 10} size={90} color={C.green}>
              +40% GRAPHICS
            </Slam>
            <span style={{ fontFamily: MONO, fontSize: 24, color: C.mute }}>Apple claim, "up to", vs last year</span>
          </div>
        ) : null}
      </Pos>
      <div style={{ position: "absolute", left: 320, top: 340, width: 1300, height: H }}>
        {/* RTX 3050 line */}
        {f >= tc - 30 ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: H - (6300 / max) * H, borderTop: `4px dashed ${NV}`, opacity: ez(f, tc - 30, tc - 15) }}>
            <span style={{ position: "absolute", right: 0, top: -50, fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, color: NV }}>RTX 3050 ≈ 6,300</span>
          </div>
        ) : null}
        <div style={{ position: "absolute", left: 60, bottom: 0, display: "flex", gap: 120, alignItems: "flex-end" }}>
          {ys.map((b, i) => {
            if (f < b.at) return <div key={i} style={{ width: 200 }} />;
            const p = ez(f, b.at, b.at + 24);
            return (
              <div key={i} style={{ width: 200, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 44, color: i ? GOLD : PH }}>{Math.round(b.v * p).toLocaleString("en-US")}</div>
                <div style={{ width: 160, height: ((H - 60) * b.v * p) / max, borderRadius: "12px 12px 0 0", background: i ? `repeating-linear-gradient(45deg, ${GOLD}aa 0 12px, ${GOLD}55 12px 24px)` : `linear-gradient(0deg, ${PH}55, ${PH})`, boxShadow: `0 0 30px ${i ? GOLD : PH}66` }} />
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, color: C.ink, marginTop: 10 }}>{b.y}</div>
              </div>
            );
          })}
        </div>
      </div>
      {f >= tc ? (
        <Pos r={110} y={880}>
          <Stamp f={f} at={tc} color={GOLD} rot={-4} size={70}>
            YOUR NEXT PHONE vs RTX 3050?
          </Stamp>
        </Pos>
      ) : null}
      <Note>ILLUSTRATION ONLY: S26 Ultra Steel Nomad Light ≈ 3,000, then +40%/year IF that pace continued. Not a forecast.</Note>
    </AbsoluteFill>
  );
};

const Wins: React.FC<SceneP> = ({ f, d, o }) => {
  const tf = L(o, "future");
  const split = ez(f, 0, 14);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, top: 0, width: 960, height: 1080, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: -480, width: 1920, height: 1080 }}>
          <Foot src="cd" at={30} f={f} d={d} dim={0.4} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 960, top: 0, width: 960, height: 1080, overflow: "hidden", opacity: ez(f, tf - 10, tf + 6) }}>
        <div style={{ position: "absolute", left: -480, width: 1920, height: 1080 }}>
          <Foot src="hand" at={MSEG[1] + 6} f={f} d={d} dim={0.35} />
        </div>
      </div>
      <Pos x={0} w={960} y={430} style={{ textAlign: "center", transform: `translateX(${(1 - split) * -200}px)` }}>
        <Slam f={f} at={2} size={100} color={NV} align="center">
          {"THE RTX\nWINS THE FIGHT"}
        </Slam>
      </Pos>
      {f >= tf ? (
        <Pos x={960} w={960} y={430} style={{ textAlign: "center" }}>
          <Slam f={f} at={tf} size={100} color={PH} align="center">
            {"THE PHONE\nWINS THE FUTURE"}
          </Slam>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const Cta: React.FC<SceneP> = ({ f, o }) => {
  const te = L(o, "emucta");
  const tw = L(o, "which");
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(255,194,71,0.14)" />
      <Center y={110}>
        <Line f={f} at={2} size={60} font={DISPLAY}>
          COMMENT BOTH 👇
        </Line>
        <div style={{ display: "flex", gap: 40, marginTop: 30 }}>
          {[
            ["📱", "YOUR PHONE", PH, 10],
            ["🎮", "YOUR GPU", NV, 22],
          ].map(([ic, t, col, at]) => (
            <div key={t as string} style={{ width: 520, padding: "30px 0", borderRadius: 24, border: `3px solid ${col}`, background: "rgba(5,7,10,0.88)", transform: `scale(${sp(f, at as number, 12, 200)})`, textAlign: "center" }}>
              <div style={{ fontSize: 90 }}>{ic}</div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: col as string }}>{t}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 26 }}>
          <Line f={f} at={L(o, "whose")} size={44} font={MONO} color={GOLD}>
            whose phone is beating whose PC?
          </Line>
        </div>
      </Center>
      {f >= te ? (
        <Pos x={0} w={1920} y={720} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 40 }}>
          <div style={{ padding: "20px 40px", borderRadius: 18, background: C.red, fontFamily: INTER, fontWeight: 900, fontSize: 56, color: "#fff", transform: `scale(${sp(f, te + 30, 10, 220)})`, boxShadow: `0 0 50px ${C.red}88` }}>SUBSCRIBE 🔔</div>
          <div>
            <Line f={f} at={te} size={52} font={DISPLAY}>
              GET MY EMULATOR FIRST
            </Line>
            <Beta f={f} at={te + 10} />
          </div>
        </Pos>
      ) : null}
      {f >= tw ? (
        <Center y={940}>
          <Line f={f} at={tw} size={40} font={MONO} color={C.ink}>
            💬 which PC game should I test on it next?
          </Line>
        </Center>
      ) : null}
    </AbsoluteFill>
  );
};

const Outro: React.FC<SceneP> = ({ f }) => (
  <AbsoluteFill>
    <BG f={f} accent="rgba(255,194,71,0.10)" x={30} />
    <EndScreen f={f} at={4} />
  </AbsoluteFill>
);

const Round = (n: number, title: string, color?: string): React.FC<SceneP> => {
  const R: React.FC<SceneP> = ({ f, d }) => <RoundCard f={f} d={d} n={n} title={title} color={color} />;
  return R;
};

/* ===================================================================== timeline */
type Block = { id: string; from: number; to: number; C: React.FC<SceneP> };
const mk = (id: string, from: number, to: number, Cm: React.FC<SceneP>): Block => ({ id, from, to, C: Cm });
const BLOCKS: Block[] = [
  mk("phone", 0, c("h_cd"), HookPhone),
  mk("cd", c("h_cd"), c("h_chips"), HookCD),
  mk("chips", c("h_chips"), c("h_gap"), HookChips),
  mk("gap", c("h_gap"), c("h_ran"), HookGap),
  mk("ran", c("h_ran"), c("title"), HookRan),
  mk("title", c("title"), c("left"), Title),
  mk("fphone", c("left"), c("tiny"), FighterPhone),
  mk("fsoc", c("tiny"), c("right"), FighterSoc),
  mk("frtx", c("right"), c("five"), FighterRtx),
  mk("five", c("five"), c("r1"), FiveRounds),
  mk("r1", c("r1"), c("tf"), Round(1, "RAW POWER")),
  mk("tflops", c("tf"), c("x26"), Tflops),
  mk("x26", c("x26"), c("wild"), X26),
  mk("consoles", c("wild"), c("r2"), Consoles),
  mk("r2", c("r2"), c("steel"), Round(2, "THE BENCHMARK")),
  mk("bench", c("steel"), c("millions"), Bench),
  mk("budget", c("millions"), c("myphone"), Budget),
  mk("myphone", c("myphone"), c("brutal"), MyPhone),
  mk("brutal", c("brutal"), c("r3"), Brutal),
  mk("r3", c("r3"), c("feed"), Round(3, "MEMORY")),
  mk("memory", c("feed"), c("highway"), Memory),
  mk("highway", c("highway"), c("r4"), Highway),
  mk("r4", c("r4"), c("rtxcool"), Round(4, "HEAT", C.red)),
  mk("cooling", c("rtxcool"), c("twenty"), Cooling),
  mk("stress", c("twenty"), c("far"), Stress),
  mk("sofar", c("far"), c("r5"), SoFar),
  mk("r5", c("r5"), c("smarter"), Round(5, "EFFICIENCY", PH)),
  mk("eff", c("smarter"), c("story"), Efficiency),
  mk("starved", c("story"), c("crazy"), Starved),
  mk("battery", c("crazy"), c("bench"), Battery),
  mk("real", c("bench"), c("rdr"), RealGames),
  mk("rdr", c("rdr"), c("cant"), Rdr),
  mk("translate", c("cant"), c("emu"), Translate),
  mk("emu", c("emu"), c("meant"), Emu),
  mk("meant", c("meant"), c("cd2"), Meant),
  mk("cdtricks", c("cd2"), c("back"), CdTricks),
  mk("fightback", c("back"), c("honest"), FightBack),
  mk("honest", c("honest"), c("verdict"), Honest),
  mk("verdict", c("verdict"), c("q2"), Verdict),
  mk("notweak", c("q2"), c("think"), NotWeak),
  mk("future", c("think"), c("wins"), Future),
  mk("wins", c("wins"), c("want"), Wins),
  mk("cta", c("want"), c("ug"), Cta),
  mk("outro", c("ug"), TOTAL_FRAMES, Outro),
];

const Host: React.FC<{ b: Block }> = ({ b }) => {
  const f = useCurrentFrame();
  const fadeIn = b.from === 0 ? 1 : pr(f, 0, XF);
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <b.C f={f} d={b.to - b.from} o={b.from} />
    </AbsoluteFill>
  );
};

/* ===================================================================== audio */
const voice = (frame: number) => {
  const i = Math.floor(frame / 3);
  let s = 0;
  let n = 0;
  for (let k = i - 3; k <= i + 3; k++) {
    if (k >= 0 && k < VOX.length) {
      s += VOX[k] === "1" ? 1 : 0;
      n++;
    }
  }
  return n ? s / n : 0;
};
const M1 = (n: string) => `ug-001/audio/music/${n}.mp3`;
const MUSIC: [string, number, number, number][] = [
  [M1("c5_twist"), 0, c("title"), 0.3],
  ["music/tech/epical-drums-03.mp3", c("title"), c("r1"), 0.26],
  [M1("c3_ai"), c("r1"), c("r3"), 0.28],
  [M1("c2_ram"), c("r3"), c("r5"), 0.28],
  [M1("c1_title"), c("r5"), c("bench"), 0.28],
  [M1("c4_msrp"), c("bench"), c("verdict"), 0.26],
  [M1("c9_outro"), c("verdict"), TOTAL_FRAMES, 0.3],
];
const FADE = 24;
const S5 = (n: string) => `ug-005/audio/${n}.wav`;
const S3 = (n: string) => `ug-003/audio/${n}.wav`;
const W1 = "sfx/swoosh.wav";
const WD = "ug-001/audio/whoosh_down.wav";
const IMP = "sfx/impact.wav";
const BIG = "sfx/tech/big-impact.mp3";
const DEEP = "sfx/tech/deep-impact.mp3";
const PUNCH = "sfx/tech/punch.mp3";
type Sfx = [number, string, number];
const ROUNDS = ["r1", "r2", "r3", "r4", "r5"];
const SFX: Sfx[] = [
  ...BLOCKS.slice(1)
    .filter((b) => !b.id.match(/^r\d$/))
    .map((b, i) => [b.from - 4, i % 2 ? W1 : WD, 0.13] as Sfx),
  ...ROUNDS.flatMap((r) => [[c(r) - 2, S5("bell"), 0.55] as Sfx, [c(r), S5("slam"), 0.5] as Sfx, [c(r) + 4, S5("crowd"), 0.22] as Sfx]),
  [c("h_pc") - 4, IMP, 0.35],
  [c("h_old"), S3("click"), 0.3],
  [c("h_nocloud"), PUNCH, 0.3],
  [c("h_nostream"), PUNCH, 0.3],
  [c("h_emu"), BIG, 0.45],
  [c("h_5090"), DEEP, 0.55],
  [c("h_nail"), S3("beep"), 0.25],
  [c("h_led"), "sfx/chime.wav", 0.25],
  [c("h_575") - 2, S3("power_up"), 0.4],
  [c("h_575") + 20, IMP, 0.4],
  [c("h_melt"), S5("sizzle"), 0.5],
  [c("h_10"), PUNCH, 0.35],
  [c("h_100"), BIG, 0.45],
  [c("h_same"), S3("tick"), 0.3],
  [c("h_same") + 24, S3("tick"), 0.3],
  [c("h_same") + 48, S3("tick"), 0.3],
  [c("h_one") - 30, S3("riser"), 0.3],
  [c("h_wins"), S3("sub_boom"), 0.7],
  [c("h_wins"), BIG, 0.5],
  [c("title") + 18, S3("sub_boom"), 0.7],
  [c("title") + 22, BIG, 0.55],
  [c("settle"), S5("bell3"), 0.4],
  [c("left"), S5("crowd"), 0.3],
  [c("left") + 30, PUNCH, 0.35],
  [c("tiny") + 6, S3("power_up"), 0.3],
  ...["cpu", "gfx", "ai", "cam", "modem"].map((k) => [c(k), S3("tick"), 0.32] as Sfx),
  [c("onesi"), IMP, 0.4],
  [c("right"), S5("crowd"), 0.3],
  [c("right") + 20, S5("fan"), 0.35],
  [c("trans"), S5("scan"), 0.3],
  [c("mem32"), S5("scan"), 0.3],
  [c("six2") + 6, IMP, 0.45],
  ...["rl_raw", "rl_bench", "rl_mem", "rl_heat", "rl_eff"].map((k) => [c(k), PUNCH, 0.25] as Sfx),
  [c("letsgo"), S5("bell3"), 0.5],
  [c("a840"), S5("scan"), 0.3],
  [c("r5090"), S5("scan"), 0.35],
  [c("x26"), BIG, 0.45],
  [c("glued"), S3("click"), 0.3],
  [c("lies"), S3("lock"), 0.4],
  [c("lies") + 10, "sfx/tear.wav", 0.45],
  [c("b_s26"), S5("scan"), 0.3],
  [c("b4060"), S5("scan"), 0.3],
  [c("b3050"), S5("scan"), 0.3],
  [c("b1650"), S5("scan"), 0.3],
  [c("again"), S5("scratch"), 0.55],
  [c("toy"), IMP, 0.35],
  [c("b870") - 10, S5("scan"), 0.3],
  [c("quarter"), IMP, 0.35],
  [c("remember"), "sfx/pop.wav", 0.4],
  [c("gapb"), DEEP, 0.55],
  [c("bw5090"), S5("fan"), 0.25],
  [c("x20"), BIG, 0.45],
  [c("theroad"), IMP, 0.4],
  [c("fans"), S5("fan"), 0.5],
  [c("hand"), "sfx/pop.wav", 0.35],
  [c("half"), S3("power_down"), 0.5],
  [c("drop"), S3("power_down"), 0.3],
  [c("protect"), S3("lock"), 0.35],
  [c("changes"), S3("riser"), 0.35],
  [c("e018"), S3("tick"), 0.3],
  [c("e04"), S3("tick"), 0.3],
  [c("twice"), S3("sub_boom"), 0.6],
  [c("twice"), S5("crowd"), 0.35],
  [c("starved"), DEEP, 0.5],
  [c("sp"), PUNCH, 0.3],
  [c("sc"), PUNCH, 0.3],
  [c("sm"), PUNCH, 0.3],
  [c("runit") + 10, S3("power_up"), 0.3],
  [c("dead") - 30, S5("lowbat"), 0.5],
  [c("dead"), S3("power_down"), 0.55],
  [c("notcloud"), PUNCH, 0.3],
  [c("chip"), S3("beep"), 0.3],
  [c("lang"), S3("lock"), 0.35],
  [c("translate"), S3("power_up"), 0.35],
  [c("emu"), BIG, 0.4],
  [c("code"), S5("scan"), 0.25],
  [c("vulkan"), S5("scan"), 0.25],
  [c("app"), "sfx/pop.wav", 0.35],
  [c("beta"), IMP, 0.35],
  [c("q1650"), IMP, 0.35],
  [c("dlss") + 10, S5("scan"), 0.3],
  [c("path"), "sfx/sparkle.wav", 0.3],
  [c("prt"), S3("tick"), 0.3],
  [c("ports"), S3("tick"), 0.3],
  [c("myemu"), IMP, 0.35],
  [c("verdict") - 2, S5("bell3"), 0.5],
  [c("no"), DEEP, 0.55],
  [c("v26"), PUNCH, 0.3],
  [c("v20"), PUNCH, 0.3],
  [c("tired"), PUNCH, 0.3],
  [c("absno"), BIG, 0.45],
  [c("a20b") + 10, S5("scan"), 0.3],
  [c("chase"), IMP, 0.35],
  [c("future"), S3("sub_boom"), 0.6],
  [c("future"), S5("crowd"), 0.3],
  [c("emucta") + 30, "sfx/pop.wav", 0.4],
];

const Mix: React.FC = () => (
  <>
    <Audio src={staticFile("ug-005/audio/narration.mp3")} volume={1} />
    {MUSIC.map(([file, a, b, lvl], i) => {
      const dur = b - a + FADE;
      return (
        <Sequence key={file + i} from={a} durationInFrames={dur} layout="none">
          <Audio
            src={staticFile(file)}
            loop
            volume={(fr) => {
              const abs = fr + a;
              const base = lvl - 0.2 * voice(abs);
              const fin = interpolate(fr, [0, FADE], [0, 1], clamp);
              const fout = interpolate(fr, [dur - FADE, dur], [1, 0], clamp);
              const tail = interpolate(abs, [TOTAL_FRAMES - 60, TOTAL_FRAMES - 4], [1, 0], clamp);
              return Math.max(0, base) * fin * fout * tail;
            }}
          />
        </Sequence>
      );
    })}
    {SFX.map(([at, src, v], i) => (
      <Sequence key={i} from={Math.max(0, at)} durationInFrames={110} layout="none">
        <Audio src={staticFile(src)} volume={v} />
      </Sequence>
    ))}
  </>
);

/* ===================================================================== root */
const ROUND_AT = ROUNDS.map((r) => c(r));
const Progress: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 5, background: "rgba(255,255,255,0.06)" }}>
      <div style={{ width: `${(f / TOTAL_FRAMES) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${PH}, ${GOLD}, ${NV})` }} />
      {ROUND_AT.map((a) => (
        <div key={a} style={{ position: "absolute", left: `${(a / TOTAL_FRAMES) * 100}%`, top: 0, width: 3, height: 5, background: C.bg }} />
      ))}
    </div>
  );
};

export const UgFive: React.FC<{ audio?: boolean }> = ({ audio = true }) => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    {BLOCKS.map((b) => (
      <Sequence key={b.id} from={b.from} durationInFrames={b.to - b.from + XF} name={b.id}>
        <Host b={b} />
      </Sequence>
    ))}
    {[c("h_cd"), c("title"), c("h_wins"), c("twice"), c("rdr"), ...ROUND_AT].map((a) => (
      <Sequence key={a} from={a - 3} durationInFrames={10} layout="none">
        <Glitch at={0} len={7} />
      </Sequence>
    ))}
    {[c("left"), c("right"), c("cd2"), c("future")].map((a) => (
      <Sequence key={`l${a}`} from={a - 8} durationInFrames={20} layout="none">
        <LightLeak at={8} len={16} />
      </Sequence>
    ))}
    <Vignette strength={0.45} />
    <Grain opacity={0.045} />
    <ScoreHUD />
    <Sequence durationInFrames={VO_FRAMES + 10} layout="none">
      <Karaoke caps={CAPTIONS as Cap[]} />
    </Sequence>
    <Progress />
    {audio ? <Mix /> : null}
  </AbsoluteFill>
);

/** QC sheet: frames from every block. */
const SAMPLES = BLOCKS.flatMap((b) => {
  const d = b.to - b.from;
  return [0.3, 0.7, 0.95].map((p) => b.from + Math.floor(d * p));
});
export const UG005_SHEET_FRAMES = SAMPLES.length;
export const UgFiveSheet: React.FC = () => {
  const f = useCurrentFrame();
  const t = SAMPLES[Math.min(f, SAMPLES.length - 1)];
  return (
    <AbsoluteFill>
      <Freeze frame={t}>
        <UgFive audio={false} />
      </Freeze>
      <div style={{ position: "absolute", right: 10, top: 10, padding: "4px 10px", background: "#ff0", color: "#000", fontFamily: MONO, fontSize: 22, fontWeight: 800 }}>
        {Math.floor(t / 1800)}:{String(Math.floor((t / 30) % 60)).padStart(2, "0")} · f{t}
      </div>
    </AbsoluteFill>
  );
};
