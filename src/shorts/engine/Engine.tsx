/**
 * UNKNOWN GAMER · SHORTS engine (1080×1920, 30 fps). Reusable for every technology Short.
 *
 * A Short = src/shorts/<id>/ with a generated data.ts (scripts/shorts/gen_data.py), Assets.tsx (new
 * 3D models for that story), Scenes.tsx (beats) and a master built with <ShortMaster>.
 *
 * Layout (mobile safe zones, YouTube Shorts UI):
 *   y 0–1380   main visual (≈72%)          y 210–300   HUD chip (topic)
 *   y ~1470    caption band (centre)       y > 1590    keep clear (title / channel UI)
 *   x > 930    keep text clear (like / comment / share buttons)
 * Everything is a pure function of the frame → deterministic chunked renders on Actions.
 */
import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { clamp, E, Grain, HEAD, lin, MONO, sp, Vignette } from "../../ug6/Look6";
import { P } from "../../ug6/Three6";

export const SW = 1080;
export const SH = 1920;
export const CAP_Y = 1470;
export const SAFE = { top: 210, bottom: 1590, left: 60, right: 930 };

/* ===================================================================== cues */
export const cueFn = (CUE: Record<string, number>) => (k: string) => {
  const v = CUE[k];
  if (v === undefined) throw new Error(`cue ${k}`);
  return v;
};

/* ===================================================================== layout atoms */
export const At: React.FC<{ x?: number; y?: number; w?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, w, children, style }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, ...style }}>{children}</div>
);
/** Horizontally centred block in the 1080-wide frame (centre of the safe column, nudged off the button rail). */
export const Mid: React.FC<{ y: number; children: React.ReactNode; style?: React.CSSProperties; shift?: number }> = ({ y, children, style, shift = 0 }) => (
  <div style={{ position: "absolute", left: 40 + shift, width: SW - 80, top: y, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", ...style }}>{children}</div>
);

/* ===================================================================== beats + transitions */
export type Tin = "cut" | "fade" | "whip" | "whipUp" | "flash" | "glitch" | "zoom" | "iris" | "wipe" | "drop";
const TIN_LEN: Record<Tin, number> = { cut: 0, fade: 8, whip: 7, whipUp: 7, flash: 6, glitch: 6, zoom: 8, iris: 10, wipe: 9, drop: 8 };

/**
 * A visual beat active in [a, b) (absolute frames). Enters with a transition, holds a few frames past b
 * (hold) so the next beat can cover it. Children get (lf = local frame, d = length).
 */
export const Beat: React.FC<{ f: number; a: number; b: number; tin?: Tin; hold?: number; children: (lf: number, d: number) => React.ReactNode; filter?: string }> = ({ f, a, b, tin = "cut", hold = 10, children, filter }) => {
  if (f < a || f >= b + hold) return null;
  const lf = f - a;
  const L = TIN_LEN[tin];
  const t = L > 0 ? E.out(f, a, a + L) : 1;
  const st: React.CSSProperties = { filter };
  if (tin === "fade") st.opacity = t;
  if (tin === "whip") {
    st.transform = `translateX(${(1 - t) * 100}%)`;
    st.filter = `${filter ?? ""} blur(${(1 - t) * 14}px)`;
  }
  if (tin === "whipUp") {
    st.transform = `translateY(${(1 - t) * 100}%)`;
    st.filter = `${filter ?? ""} blur(${(1 - t) * 14}px)`;
  }
  if (tin === "zoom") {
    st.transform = `scale(${1.25 - 0.25 * t})`;
    st.opacity = t;
    st.filter = `${filter ?? ""} blur(${(1 - t) * 10}px)`;
  }
  if (tin === "iris") st.clipPath = `circle(${t * 120}% at 50% 42%)`;
  if (tin === "wipe") st.clipPath = `polygon(0 0, ${t * 160}% 0, ${t * 160 - 60}% 100%, 0 100%)`;
  if (tin === "drop") st.transform = `translateY(${(1 - t) * -100}%)`;
  if (tin === "glitch" && lf < L) {
    const j = Math.sin(lf * 91.7) * 30;
    st.transform = `translateX(${j}px)`;
    st.filter = `${filter ?? ""} hue-rotate(${j * 3}deg) saturate(2)`;
  }
  return (
    <AbsoluteFill style={{ ...st, overflow: "hidden" }}>
      <BeatBody fn={children} lf={lf} d={b - a} />
      {tin === "flash" && lf < L ? <AbsoluteFill style={{ background: "#fff", opacity: 1 - t }} /> : null}
      {tin === "whip" && lf < L ? <AbsoluteFill style={{ background: `linear-gradient(90deg, transparent, ${P.orange}55, transparent)`, opacity: 1 - t }} /> : null}
    </AbsoluteFill>
  );
};

/** Runs a beat's render callback as its own component, so hooks inside it mount/unmount with the beat. */
const BeatBody: React.FC<{ fn: (lf: number, d: number) => React.ReactNode; lf: number; d: number }> = ({ fn, lf, d }) => <>{fn(lf, d)}</>;

/** Camera / value path: eased interpolation between keyframes [frame, value][] (power3.inOut). */
export const path = (f: number, keys: [number, number][]) => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [fa, va] = keys[i];
    const [fb, vb] = keys[i + 1];
    if (f <= fb) return va + (vb - va) * E.io(f, fa, fb);
  }
  return keys[keys.length - 1][1];
};
export const pathV = (f: number, keys: [number, [number, number, number]][]): [number, number, number] =>
  [0, 1, 2].map((k) => path(f, keys.map(([fr, v]) => [fr, v[k]]))) as [number, number, number];
/** Small camera shake (impacts): amplitude decays over `len` frames from `at`. */
export const shake = (f: number, at: number, amp = 1, len = 14) => {
  const k = f < at ? 0 : Math.max(0, 1 - (f - at) / len);
  return [Math.sin(f * 37.1) * amp * k, Math.cos(f * 23.7) * amp * k] as const;
};

/* ===================================================================== backgrounds (one per beat family) */
export const Bg: React.FC<{ f: number; kind?: "studio" | "blueprint" | "cold" | "alarm" | "lab" | "void" | "split"; warm?: number; hue?: string }> = ({ f, kind = "studio", warm = 0.25, hue = P.orange }) => {
  if (kind === "blueprint")
    return (
      <AbsoluteFill style={{ background: "#07131c" }}>
        <AbsoluteFill
          style={{
            backgroundImage: "linear-gradient(rgba(120,190,255,0.10) 2px, transparent 2px), linear-gradient(90deg, rgba(120,190,255,0.10) 2px, transparent 2px), linear-gradient(rgba(120,190,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(120,190,255,0.05) 1px, transparent 1px)",
            backgroundSize: "120px 120px, 120px 120px, 24px 24px, 24px 24px",
            backgroundPosition: `0 ${f * 0.6}px, 0 ${f * 0.6}px, 0 ${f * 0.6}px, 0 ${f * 0.6}px`,
          }}
        />
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 45% at 50% 42%, rgba(80,160,255,0.18), transparent 70%)" }} />
      </AbsoluteFill>
    );
  if (kind === "cold")
    return (
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #050a12 0%, #0a1422 60%, #04070c 100%)" }}>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 40% at 50% 40%, rgba(120,180,255,0.22), transparent 70%)" }} />
      </AbsoluteFill>
    );
  if (kind === "alarm")
    return (
      <AbsoluteFill style={{ background: "#0a0506" }}>
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 50% at 50% 40%, rgba(255,40,40,${0.12 + 0.1 * Math.max(0, Math.sin(f * 0.35))}), transparent 70%)` }} />
      </AbsoluteFill>
    );
  if (kind === "lab")
    return (
      <AbsoluteFill style={{ background: "linear-gradient(180deg, #0d1013 0%, #12161a 55%, #08090b 100%)" }}>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 35% at 50% 38%, rgba(160,255,220,0.10), transparent 70%)" }} />
        <AbsoluteFill style={{ background: "repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0 2px, transparent 2px 160px)" }} />
      </AbsoluteFill>
    );
  if (kind === "void") return <AbsoluteFill style={{ background: "#030304" }} />;
  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 85% 45% at ${50 + Math.sin(f * 0.01) * 4}% 40%, ${hue}${Math.round(warm * 255).toString(16).padStart(2, "0")}, transparent 70%)` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 30% at 20% 12%, rgba(188,214,255,0.08), transparent 70%)" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.6) 100%)" }} />
    </AbsoluteFill>
  );
};

/* ===================================================================== typography */
/** Big impact word(s): punches in from 1.6× with a ring flash. [brackets] = accent colour. */
export const Impact: React.FC<{ f: number; at: number; text: string; size?: number; color?: string; accent?: string; rot?: number; out?: number }> = ({ f, at, text, size = 150, color = P.white, accent = P.orange, rot = 0, out }) => {
  if (f < at) return null;
  const s = sp(f, at, 11, 240);
  const xo = out !== undefined ? lin(f, out, out + 8) : 0;
  let acc = false;
  return (
    <div style={{ transform: `rotate(${rot}deg) scale(${(1.6 - 0.6 * s) * (1 - xo * 0.2)})`, opacity: Math.min(1, s * 2) * (1 - xo), fontFamily: HEAD, fontWeight: 800, fontSize: size, lineHeight: 0.9, textTransform: "uppercase", textAlign: "center", letterSpacing: 1 }}>
      {text.split("\n").map((ln, i) => (
        <div key={i}>
          {ln.split(" ").map((w, j) => {
            const open = w.startsWith("[");
            const close = w.endsWith("]");
            const a = acc || open;
            if (open && !close) acc = true;
            if (close) acc = false;
            return (
              <span key={j} style={{ color: a ? accent : color, textShadow: a ? `0 0 50px ${accent}88, 0 8px 30px rgba(0,0,0,0.8)` : "0 8px 30px rgba(0,0,0,0.85)", marginRight: size * 0.18 }}>
                {w.replace(/[[\]]/g, "")}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

/** Small HUD chip: "● LIVE"-style kicker label with a scan underline. */
export const Chip: React.FC<{ f: number; at: number; children: React.ReactNode; color?: string; size?: number }> = ({ f, at, children, color = P.orange, size = 30 }) => {
  if (f < at) return null;
  const a = E.out(f, at, at + 12);
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: `${size * 0.35}px ${size * 0.75}px`, borderRadius: 999, background: "rgba(10,11,13,0.78)", border: `2px solid ${color}`, fontFamily: MONO, fontWeight: 800, fontSize: size, letterSpacing: 3, color, opacity: a, transform: `translateY(${(1 - a) * -20}px)`, boxShadow: `0 0 30px ${color}44`, whiteSpace: "nowrap" }}>
      <span style={{ width: size * 0.4, height: size * 0.4, borderRadius: 99, background: color, boxShadow: `0 0 12px ${color}` }} />
      {children}
    </div>
  );
};

/* ===================================================================== Shorts captions */
export type SCap = [number, number, [string, number][]];
/**
 * Shorts captions: 1–3 words, big condensed caps, word-by-word pop. Words matching `accent` are orange,
 * the active word lifts slightly. Frames, not seconds.
 */
export const ShortCaps: React.FC<{ caps: SCap[]; accent: RegExp; hide?: (f: number) => boolean; y?: number; frame?: number }> = ({ caps, accent, hide, y = CAP_Y, frame }) => {
  const cur = useCurrentFrame();
  const f = frame ?? cur;
  if (hide?.(f)) return null;
  const c = caps.find((x) => f >= x[0] - 1 && f < x[1] + 2);
  if (!c) return null;
  const pop = sp(f, c[0] - 1, 12, 300);
  return (
    <div style={{ position: "absolute", left: 50, width: SW - 100, top: y - 80, height: 160, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
      <div style={{ transform: `scale(${0.82 + 0.18 * pop})`, textAlign: "center", fontFamily: HEAD, fontWeight: 800, fontSize: 96, lineHeight: 1, textTransform: "uppercase", letterSpacing: 1 }}>
        {c[2].map(([w, s], i) => {
          const on = f >= s - 1;
          const isAcc = accent.test(w.replace(/[^\w%]/g, ""));
          const active = on && (i + 1 >= c[2].length || f < c[2][i + 1][1] - 1);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: 22,
                color: isAcc ? P.amber : "#fff",
                opacity: on ? 1 : 0.35,
                transform: `translateY(${active ? -6 : 0}px) scale(${active ? 1.06 : 1})`,
                WebkitTextStroke: "3px rgba(0,0,0,0.85)",
                paintOrder: "stroke fill",
                textShadow: isAcc ? `0 0 36px ${P.orange}aa, 0 6px 0 rgba(0,0,0,0.9)` : "0 6px 0 rgba(0,0,0,0.9), 0 0 30px rgba(0,0,0,0.6)",
              }}
            >
              {w.replace(/[,.]$/, "")}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/* ===================================================================== HUD: topic chip + retention bar */
export const Hud: React.FC<{ f: number; total: number; topic: string; hideChip?: boolean }> = ({ f, total, topic, hideChip }) => (
  <>
    <div style={{ position: "absolute", left: 0, top: 0, height: 8, width: (SW * f) / total, background: `linear-gradient(90deg, ${P.orange}, ${P.amber})`, boxShadow: `0 0 18px ${P.orange}` }} />
    {hideChip ? null : (
      <div style={{ position: "absolute", left: SAFE.left, top: SAFE.top, display: "flex", alignItems: "center", gap: 14, fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 4, color: "rgba(244,242,238,0.85)" }}>
        <span style={{ padding: "6px 14px", background: P.orange, color: "#120a04", borderRadius: 6 }}>UG</span>
        {topic}
      </div>
    )}
  </>
);

/* ===================================================================== audio mix */
export type Bed = [file: string, from: number, to: number, level: number];
export type Sfx = [frame: number, file: string, vol: number, dur?: number];
const FADE = 30;
/** SFX never mask the voice-over: global gain, per-cue cap, and ducking under speech. */
const SFX_GAIN = 0.8;
const SFX_MAX = 0.45;
const SFX_DUCK = 0.65;
export const Mix: React.FC<{ narration: string; beds: Bed[]; sfx: Sfx[]; vox: string; total: number }> = ({ narration, beds, sfx, vox, total }) => {
  const voice = (fr: number) => {
    let s = 0;
    for (let k = -6; k <= 6; k++) s += vox.charCodeAt(Math.max(0, Math.min(vox.length - 1, fr + k))) === 49 ? 1 : 0;
    return s / 13;
  };
  return (
    <>
      <Audio src={staticFile(narration)} volume={1} />
      {beds.map(([file, a, b, lvl], i) => {
        const dur = b - a + FADE;
        return (
          <Sequence key={file + i} from={a} durationInFrames={dur} layout="none">
            <Audio
              src={staticFile(file)}
              loop
              volume={(fr) => {
                const abs = fr + a;
                const base = lvl * (1 - 0.6 * voice(abs));
                const fin = interpolate(fr, [0, FADE], [0, 1], clamp);
                const fout = interpolate(fr, [dur - FADE, dur], [1, 0], clamp);
                const tail = interpolate(abs, [total - 40, total - 2], [1, 0], clamp);
                return Math.max(0, base) * fin * fout * tail;
              }}
            />
          </Sequence>
        );
      })}
      {sfx.map(([at, src, v, dur], i) => (
        <Sequence key={i} from={Math.max(0, at)} durationInFrames={dur ?? 150} layout="none">
          <Audio
            src={staticFile(src)}
            loop={dur !== undefined}
            volume={(fr) => {
              // Voice always wins: SFX are capped and dip under narration (−9 dB while speaking).
              const env = dur !== undefined ? interpolate(fr, [0, 12, dur - 12, dur], [0, 1, 1, 0], clamp) : 1;
              const duck = 1 - SFX_DUCK * voice(Math.max(0, at) + fr);
              return Math.min(v, SFX_MAX) * SFX_GAIN * duck * env;
            }}
          />
        </Sequence>
      ))}
    </>
  );
};

/* ===================================================================== master */
export const ShortMaster: React.FC<{
  offset?: number;
  audio?: boolean;
  total: number;
  voFrames: number;
  picture: (f: number) => React.ReactNode;
  caps: SCap[];
  accent: RegExp;
  hideCaps?: (f: number) => boolean;
  topic: string;
  hideChip?: (f: number) => boolean;
  mix: React.ReactNode;
}> = ({ offset = 0, audio = true, total, voFrames, picture, caps, accent, hideCaps, topic, hideChip, mix }) => {
  const f = useCurrentFrame() + offset;
  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      {picture(f)}
      <Vignette k={0.45} />
      <Grain opacity={0.045} />
      <Hud f={f} total={total} topic={topic} hideChip={hideChip?.(f)} />
      {f < voFrames + 6 ? (
        <Sequence from={-offset} layout="none">
          <ShortCaps caps={caps} accent={accent} hide={hideCaps} frame={f} />
        </Sequence>
      ) : null}
      {audio ? (
        <Sequence from={-offset} layout="none">
          {mix}
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

/* ===================================================================== QC sheet (one still per beat) */
export const makeSheet = (Master: React.FC<{ audio?: boolean; offset?: number }>, samples: number[]) => {
  const Sheet: React.FC = () => {
    const f = useCurrentFrame();
    const t = samples[Math.min(f, samples.length - 1)];
    return (
      <AbsoluteFill>
        <Master audio={false} offset={t - f} />
        <div style={{ position: "absolute", right: 12, top: 40, padding: "4px 12px", background: "#ff0", color: "#000", fontFamily: MONO, fontSize: 30, fontWeight: 800 }}>
          {(t / 30).toFixed(1)}s · f{t}
        </div>
      </AbsoluteFill>
    );
  };
  return Sheet;
};
