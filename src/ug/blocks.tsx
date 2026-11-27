/**
 * Layout building blocks for UNKNOWN GAMER long-form videos. Everything takes `f`
 * (frame relative to the scene start) so scenes stay pure functions of time.
 */
import React from "react";
import { AbsoluteFill, Img, interpolate, OffthreadVideo, spring, staticFile } from "remotion";
import { clamp, ease } from "./fx";
import { C, DISPLAY, INTER, MONO } from "./theme";

export const sp = (f: number, at: number, damping = 14, stiffness = 170) => spring({ frame: f - at, fps: 30, config: { damping, stiffness } });
export const pr = (f: number, a: number, b: number) => interpolate(f, [a, Math.max(a + 1, b)], [0, 1], { ...clamp, easing: ease });
export const A = (p: string) => staticFile(`ug-001/${p}`);

/** Dark graphic stage: drifting grid + coloured glow. */
export const Stage: React.FC<{ f: number; accent?: string; x?: number; y?: number; grid?: boolean }> = ({ f, accent = "rgba(40,215,255,0.12)", x = 30, y = 30, grid = true }) => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    {grid ? (
      <AbsoluteFill
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          backgroundPosition: `0px ${-f * 0.4}px`,
        }}
      />
    ) : null}
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${x}% ${y}%, ${accent}, transparent 62%)` }} />
  </AbsoluteFill>
);

/** Clip lengths (s) — used to slow a clip down so it never runs out inside a scene. */
export const LEN: Record<string, number> = {
  banknotes: 15.9, board_b: 5, chipset_a: 6, chipset_close: 9.2, city_night: 15, creator_edit: 12.1, dollars_burn: 11.7, dollars_flip: 11.8, fingers_mouse: 4,
  gamer_play: 8.7, gamer_upset: 6, gamer_win: 10.7, hands_mobo: 12.1, headset_close: 4, keyboard: 12.1, microchip: 11, mobo_shiny: 7.9, mobo_zoom: 11.4,
  no_money: 15.4, pen_chip: 7.2, phone_shop: 14.9, scroll_sale: 10.5,
};
/** Graded stock footage (teal/orange), slow push-in. */
export const Clip: React.FC<{ f: number; src: string; d: number; from?: number; zoom?: [number, number]; pan?: [number, number]; blur?: number; dim?: number; rate?: number }> = ({
  f,
  src,
  d,
  from = 0,
  zoom = [1.04, 1.14],
  pan = [0, 0],
  blur = 0,
  dim = 0.2,
  rate = 1,
}) => {
  const p = interpolate(f, [0, Math.max(1, d)], [0, 1], clamp);
  const avail = (LEN[src] ?? 60) - from / 30 - 0.2;
  const r = Math.max(0.3, Math.min(rate, avail / Math.max(0.1, d / 30)));
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: C.bg }}>
      <AbsoluteFill style={{ transform: `scale(${zoom[0] + (zoom[1] - zoom[0]) * p}) translateX(${pan[0] + (pan[1] - pan[0]) * p}px)` }}>
        <OffthreadVideo
          src={A(`footage/${src}.mp4`)}
          muted
          trimBefore={from}
          playbackRate={r}
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: `contrast(1.12) saturate(0.85) brightness(${1 - dim}) blur(${blur}px)` }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ mixBlendMode: "soft-light", opacity: 0.5, background: "linear-gradient(115deg, rgba(0,140,170,0.85) 0%, rgba(0,0,0,0) 50%, rgba(255,140,40,0.7) 100%)" }} />
    </AbsoluteFill>
  );
};

/** Vertical clip shown inside a phone frame. */
export const Phone: React.FC<{ f: number; src: string; x: number; y: number; h?: number; at?: number; tilt?: number }> = ({ f, src, x, y, h = 820, at = 0, tilt = -6 }) => {
  const s = sp(f, at, 16);
  const w = (h * 9) / 16;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w + 28, height: h + 28, borderRadius: 54, background: "#0d1015", border: "2px solid rgba(255,255,255,0.18)", padding: 14, boxShadow: "0 50px 90px rgba(0,0,0,0.7)", transform: `rotate(${tilt * s}deg) translateY(${(1 - s) * 200}px)`, opacity: s }}>
      <div style={{ width: w, height: h, borderRadius: 42, overflow: "hidden" }}>
        <OffthreadVideo src={A(`footage/${src}.mp4`)} muted style={{ width: "100%", height: "100%", objectFit: "cover", filter: "contrast(1.08) saturate(0.9)" }} />
      </div>
    </div>
  );
};

/** Product / press photo with slow push and light sweep. */
export const Photo: React.FC<{ f: number; src: string; d: number; x?: number; y?: number; w?: number; h?: number; fit?: "cover" | "contain"; dim?: number; at?: number; radius?: number; pos?: string }> = ({
  f,
  src,
  d,
  x = 0,
  y = 0,
  w = 1920,
  h = 1080,
  fit = "cover",
  dim = 0.1,
  at = 0,
  radius = 0,
  pos = "50% 50%",
}) => {
  const a = pr(f, at, at + 14);
  const z = 1.03 + 0.07 * interpolate(f, [0, Math.max(1, d)], [0, 1], clamp);
  const sweep = interpolate(f, [at + 6, at + 56], [-30, 130], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, overflow: "hidden", borderRadius: radius, opacity: a, boxShadow: radius ? "0 40px 80px rgba(0,0,0,0.6)" : undefined }}>
      <Img src={A(`img/${src}`)} style={{ width: "100%", height: "100%", objectFit: fit, objectPosition: pos, transform: `scale(${z})`, filter: `brightness(${1 - dim}) contrast(1.06)` }} />
      <AbsoluteFill style={{ background: `linear-gradient(110deg, rgba(255,255,255,0) ${sweep - 12}%, rgba(255,255,255,0.18) ${sweep}%, rgba(255,255,255,0) ${sweep + 12}%)`, mixBlendMode: "screen" }} />
    </div>
  );
};

/** Darkening gradient for legible text over footage. side: where the text sits. */
export const Shade: React.FC<{ side?: "left" | "right" | "bottom" | "all"; k?: number }> = ({ side = "left", k = 0.85 }) => {
  const g =
    side === "all"
      ? `rgba(5,7,10,${k * 0.7})`
      : side === "bottom"
        ? `linear-gradient(0deg, rgba(5,7,10,${k}) 0%, rgba(5,7,10,0) 60%)`
        : `linear-gradient(${side === "left" ? 90 : 270}deg, rgba(5,7,10,${k}) 0%, rgba(5,7,10,${k * 0.6}) 40%, rgba(5,7,10,0) 75%)`;
  return <AbsoluteFill style={{ background: g }} />;
};

export const Kicker: React.FC<{ f: number; at?: number; children: React.ReactNode; color?: string; size?: number }> = ({ f, at = 0, children, color = C.teal, size = 26 }) => {
  const a = pr(f, at, at + 12);
  return (
    <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: size, letterSpacing: 6, color, opacity: a, transform: `translateX(${(1 - a) * -20}px)`, textTransform: "uppercase" }}>{children}</div>
  );
};

export const Head: React.FC<{ f: number; at?: number; children: React.ReactNode; size?: number; color?: string; align?: "left" | "center" | "right" }> = ({ f, at = 0, children, size = 110, color = C.ink, align = "left" }) => {
  const s = sp(f, at, 16);
  return (
    <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: size, lineHeight: 1.02, letterSpacing: 2, color, textAlign: align, opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 40}px)`, textShadow: "0 10px 40px rgba(0,0,0,0.6)" }}>
      {children}
    </div>
  );
};

/** Big monospace figure with a pop-in. */
export const Num: React.FC<{ f: number; at?: number; children: React.ReactNode; size?: number; color?: string; glow?: boolean }> = ({ f, at = 0, children, size = 150, color = C.ink, glow = true }) => {
  const s = sp(f, at, 12, 200);
  return (
    <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: size, lineHeight: 1.05, color, opacity: Math.min(1, s * 1.5), transform: `scale(${0.85 + 0.15 * s})`, transformOrigin: "left center", textShadow: glow ? `0 0 50px ${color}66` : undefined, whiteSpace: "nowrap" }}>
      {children}
    </div>
  );
};

export const Chip: React.FC<{ f: number; at?: number; children: React.ReactNode; bg?: string; size?: number; fg?: string }> = ({ f, at = 0, children, bg = C.red, size = 44, fg = "#fff" }) => {
  const s = sp(f, at, 11);
  return (
    <div style={{ display: "inline-block", padding: "6px 18px", borderRadius: 10, background: bg, color: fg, fontFamily: MONO, fontWeight: 800, fontSize: size, transform: `scale(${s})`, transformOrigin: "left center", boxShadow: `0 0 40px ${bg}88`, whiteSpace: "nowrap" }}>
      {children}
    </div>
  );
};

/** Rubber-stamp slam. */
export const Stamp: React.FC<{ f: number; at: number; children: React.ReactNode; color?: string; rot?: number; size?: number }> = ({ f, at, children, color = C.red, rot = -8, size = 80 }) => {
  if (f < at) return null;
  const s = sp(f, at, 9, 260);
  return (
    <div style={{ display: "inline-block", padding: "10px 28px", border: `6px solid ${color}`, borderRadius: 14, color, fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: 3, background: "rgba(5,7,10,0.8)", transform: `rotate(${rot}deg) scale(${2.2 - 1.2 * s})`, opacity: Math.min(1, s * 2), whiteSpace: "nowrap" }}>
      {children}
    </div>
  );
};

/** Glass info card. */
export const Card: React.FC<{ f: number; at?: number; w?: number; children: React.ReactNode; border?: string; pad?: string }> = ({ f, at = 0, w, children, border = C.line, pad = "34px 40px" }) => {
  const a = pr(f, at, at + 16);
  return (
    <div style={{ width: w, padding: pad, borderRadius: 22, background: "linear-gradient(180deg, rgba(27,33,41,0.9), rgba(10,13,18,0.92))", border: `1px solid ${border}`, boxShadow: "0 30px 70px rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", opacity: a, transform: `translateY(${(1 - a) * 34}px)` }}>
      {children}
    </div>
  );
};

/** Chapter title card that plays over the first ~2.4 s of a chapter-opening scene. */
export const Chapter: React.FC<{ f: number; n: string; title: string; len?: number }> = ({ f, n, title, len = 72 }) => {
  if (f > len + 10) return null;
  const inP = pr(f, 0, 14);
  const out = pr(f, len - 4, len + 8);
  const line = pr(f, 4, 30);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, opacity: 1 - out, transform: `translateY(${-out * 60}px)` }}>
      <Stage f={f} accent="rgba(255,182,72,0.10)" x={20} y={50} />
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 160 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 40, opacity: inP }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 200, color: "transparent", WebkitTextStroke: `3px ${C.amber}`, lineHeight: 1 }}>{n}</div>
          <div>
            <div style={{ height: 4, width: 520 * line, background: C.amber, boxShadow: `0 0 20px ${C.amber}` }} />
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 108, color: C.ink, letterSpacing: 3, marginTop: 18, transform: `translateX(${(1 - inP) * 60}px)` }}>{title}</div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Lines of text that appear one by one (e.g. a quote). */
export const Lines: React.FC<{ f: number; items: { t: React.ReactNode; at: number }[]; size?: number; color?: string; gap?: number; font?: string }> = ({ f, items, size = 56, color = C.ink, gap = 16, font = INTER }) => (
  <div style={{ display: "flex", flexDirection: "column", gap }}>
    {items.map((it, i) => {
      const a = pr(f, it.at, it.at + 12);
      return (
        <div key={i} style={{ fontFamily: font, fontWeight: 700, fontSize: size, color, opacity: a, transform: `translateY(${(1 - a) * 20}px)` }}>
          {it.t}
        </div>
      );
    })}
  </div>
);

export const Pos: React.FC<{ x?: number; y?: number; r?: number; b?: number; w?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, r, b, w, children, style }) => (
  <div style={{ position: "absolute", left: x, top: y, right: r, bottom: b, width: w, ...style }}>{children}</div>
);

/** Small "ILLUSTRATION" / note badge. */
export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = C.amber }) => (
  <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 6, border: `2px solid ${color}`, color, fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: 3 }}>{children}</span>
);
