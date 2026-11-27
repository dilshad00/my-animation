/**
 * Intro device: a landscape phone showing gameplay with a semi-transparent cloud-gaming touch layout
 * (left stick, ABXY, bumpers/triggers, d-pad, view/menu) that reacts to the same InputTrack as Controller.tsx.
 * Original/generic UI — no Xbox logo or branding.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { C, INTER, MONO } from "../ug/theme";
import type { Btn, PadState } from "./Controller";

const FACE: Record<"A" | "B" | "X" | "Y", string> = { A: "#3ddc6a", B: "#ff4d5e", X: "#3aa0ff", Y: "#ffc93a" };
const glass = (on: number) => ({
  background: on ? "rgba(255,255,255,0.32)" : "rgba(255,255,255,0.10)",
  border: `2px solid rgba(255,255,255,${on ? 0.85 : 0.35})`,
  backdropFilter: "blur(2px)",
  boxShadow: on ? "0 0 18px rgba(255,255,255,0.45)" : undefined,
});

/** Fingertip touch ripple. */
const Touch: React.FC<{ x: number; y: number; v: number }> = ({ x, y, v }) =>
  v > 0 ? (
    <div style={{ position: "absolute", left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: 34, background: `rgba(255,255,255,${0.22 * v})`, border: `2px solid rgba(255,255,255,${0.6 * v})`, transform: `scale(${0.8 + 0.3 * v})` }} />
  ) : null;

/** The touch overlay, sized to the phone screen (W×H). */
export const TouchLayout: React.FC<{ s: PadState; W: number; H: number }> = ({ s, W, H }) => {
  const d = (b: Btn) => s.down[b] ?? 0;
  const k = H / 720; // layout designed for a 720-tall screen
  const lsX = 190 * k;
  const lsY = H - 200 * k;
  const R = 92 * k;
  const knobX = lsX + s.lx * R * 0.55;
  const knobY = lsY + s.ly * R * 0.55;
  const lMag = Math.min(1, Math.hypot(s.lx, s.ly));
  const fx = W - 210 * k;
  const fy = H - 230 * k;
  const face = (key: "A" | "B" | "X" | "Y", dx: number, dy: number) => {
    const v = d(key);
    return (
      <React.Fragment key={key}>
        <div style={{ position: "absolute", left: fx + dx * k - 40 * k, top: fy + dy * k - 40 * k, width: 80 * k, height: 80 * k, borderRadius: 40 * k, ...glass(v), display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 - v * 0.08})` }}>
          <span style={{ fontFamily: INTER, fontWeight: 800, fontSize: 34 * k, color: v ? FACE[key] : "rgba(255,255,255,0.75)" }}>{key}</span>
        </div>
        <Touch x={fx + dx * k} y={fy + dy * k} v={v} />
      </React.Fragment>
    );
  };
  const pill = (label: string, x: number, y: number, v: number, w = 120) => (
    <div style={{ position: "absolute", left: x, top: y, width: w * k, height: 54 * k, borderRadius: 14 * k, ...glass(v), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: INTER, fontWeight: 800, fontSize: 24 * k, color: "rgba(255,255,255,0.85)" }}>{label}</div>
  );
  return (
    <AbsoluteFill>
      {/* top bar: generic stream status */}
      <div style={{ position: "absolute", left: W / 2 - 150 * k, top: 14 * k, width: 300 * k, height: 40 * k, borderRadius: 20 * k, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 * k, fontFamily: MONO, fontWeight: 700, fontSize: 20 * k, color: "rgba(255,255,255,0.8)" }}>
        <span style={{ width: 10 * k, height: 10 * k, borderRadius: 5 * k, background: C.green }} /> CLOUD · 1080p
      </div>
      {/* triggers + bumpers */}
      {pill("LT", 40 * k, 30 * k, s.lt > 0.1 ? 1 : 0)}
      {pill("LB", 40 * k, 100 * k, d("LB"))}
      {pill("RT", W - 160 * k, 30 * k, s.rt > 0.1 ? 1 : 0)}
      {pill("RB", W - 160 * k, 100 * k, d("RB"))}
      {/* view / menu */}
      {pill("⧉", W / 2 - 140 * k, H - 80 * k, d("VIEW"), 70)}
      {pill("≡", W / 2 + 70 * k, H - 80 * k, d("MENU"), 70)}
      {/* left stick */}
      <div style={{ position: "absolute", left: lsX - R, top: lsY - R, width: R * 2, height: R * 2, borderRadius: R, ...glass(0), border: `2px solid rgba(255,255,255,${0.3 + lMag * 0.5})` }} />
      <div style={{ position: "absolute", left: knobX - 46 * k, top: knobY - 46 * k, width: 92 * k, height: 92 * k, borderRadius: 46 * k, ...glass(lMag > 0.15 ? 1 : 0) }} />
      <Touch x={knobX} y={knobY} v={lMag > 0.15 ? 1 : 0} />
      {/* d-pad */}
      {(["UP", "DOWN", "LEFT", "RIGHT"] as const).map((b) => {
        const [dx, dy] = { UP: [0, -1], DOWN: [0, 1], LEFT: [-1, 0], RIGHT: [1, 0] }[b];
        return <div key={b} style={{ position: "absolute", left: 400 * k + dx * 50 * k - 22 * k, top: H - 130 * k + dy * 50 * k - 22 * k, width: 44 * k, height: 44 * k, borderRadius: 8 * k, ...glass(d(b)) }} />;
      })}
      {/* right side: ABXY */}
      {face("A", 0, 90)}
      {face("B", 90, 0)}
      {face("X", -90, 0)}
      {face("Y", 0, -90)}
      {/* right-stick look area hint (cloud layouts use a swipe zone) */}
      <Touch x={W - 470 * k + s.rx * 60 * k} y={H / 2 - 40 * k + s.ry * 40 * k} v={Math.min(1, Math.hypot(s.rx, s.ry)) > 0.2 ? 0.8 : 0} />
    </AbsoluteFill>
  );
};

/** Landscape phone frame with `children` as the screen content. */
export const PhoneLandscape: React.FC<{ children: React.ReactNode; w?: number; tilt?: number; s: PadState; showTouch?: boolean }> = ({ children, w = 1500, tilt = 0, s, showTouch = true }) => {
  const h = w * 0.462; // ~19.5:9
  const bez = w * 0.022;
  const W = w - bez * 2;
  const H = h - bez * 2;
  return (
    <div style={{ width: w, height: h, borderRadius: h * 0.11, background: "linear-gradient(135deg,#2a2f36,#0b0d10)", padding: bez, boxShadow: "0 50px 120px rgba(0,0,0,0.75), inset 0 0 0 2px rgba(255,255,255,0.08)", transform: `perspective(2400px) rotateX(${tilt * 0.4}deg) rotateY(${tilt}deg)` }}>
      <div style={{ position: "relative", width: W, height: H, borderRadius: h * 0.085, overflow: "hidden", background: "#000" }}>
        {children}
        {showTouch ? <TouchLayout s={s} W={W} H={H} /> : null}
        {/* punch-hole camera */}
        <div style={{ position: "absolute", left: 18, top: H / 2 - 9, width: 18, height: 18, borderRadius: 9, background: "#050505" }} />
      </div>
    </div>
  );
};
