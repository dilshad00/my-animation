/**
 * UG-002 thumbnails. Designed at 1920×1080, rendered as 1280×720 stills.
 * Imagery: friend's GTA 6 gameplay frames + the creator's own Xbox app recording (public/ug-002/thumb).
 * Claims stay true to the video: Remote Play is the one method that works; the APK is a scam; Xbox app says consoles.
 */
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C, DISPLAY, INTER, MONO } from "../ug/theme";
import { IcoCloud, IcoPad, IcoPc, IcoSkull } from "./Gfx";

const T = (f: string) => staticFile(`ug-002/thumb/${f}`);
const outline = (px: number, col = "#000") =>
  `${px}px ${px}px 0 ${col}, -${px}px ${px}px 0 ${col}, ${px}px -${px}px 0 ${col}, -${px}px -${px}px 0 ${col}, 0 ${px * 2}px ${px * 5}px rgba(0,0,0,0.85)`;

const Big: React.FC<{ children: React.ReactNode; size: number; color?: string; style?: React.CSSProperties }> = ({ children, size, color = "#fff", style }) => (
  <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: size, lineHeight: 0.9, color, letterSpacing: 1, textShadow: outline(Math.round(size / 28)), whiteSpace: "nowrap", ...style }}>{children}</div>
);

const Bg: React.FC<{ src: string; pos?: string; zoom?: number; dark?: string; filter?: string }> = ({ src, pos = "50% 50%", zoom = 1, dark, filter = "saturate(1.35) contrast(1.15) brightness(1.05)" }) => (
  <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
    <Img src={T(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transform: `scale(${zoom})`, transformOrigin: pos, filter }} />
    {dark ? <AbsoluteFill style={{ background: dark }} /> : null}
  </AbsoluteFill>
);

/** Landscape phone showing a gameplay frame. */
const Phone: React.FC<{ src: string; x: number; y: number; w: number; rot?: number; glow?: string; pos?: string; zoom?: number }> = ({ src, x, y, w, rot = 0, glow = C.teal, pos = "50% 50%", zoom = 1.08 }) => {
  const h = Math.round(w * 0.47);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: `rotate(${rot}deg)`, padding: 18, borderRadius: 64, background: "linear-gradient(135deg,#3a4049,#0b0d10)", boxShadow: `0 40px 90px rgba(0,0,0,0.85), 0 0 80px ${glow}, inset 0 0 0 3px rgba(255,255,255,0.12)` }}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 48, overflow: "hidden" }}>
        <Img src={T(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, transform: `scale(${zoom})`, filter: "saturate(1.35) contrast(1.15)" }} />
        <div style={{ position: "absolute", left: "48%", top: 0, width: 40, height: 22, borderRadius: "0 0 14px 14px", background: "#0b0d10" }} />
      </div>
    </div>
  );
};

const Mark: React.FC<{ ok: boolean; size: number }> = ({ ok, size }) => (
  <div style={{ width: size, height: size, borderRadius: size, background: ok ? C.green : C.red, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${size / 2}px ${ok ? C.green : C.red}, 0 8px 20px rgba(0,0,0,0.7)`, border: "5px solid #fff" }}>
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none" stroke={ok ? "#04140b" : "#fff"} strokeWidth={4.2} strokeLinecap="round" strokeLinejoin="round">
      {ok ? <path d="M4 12.5l5 5L20 6.5" /> : <path d="M6 6l12 12M18 6L6 18" />}
    </svg>
  </div>
);

/* A — "ONLY 1 WORKS": method scoreboard + phone with gameplay */
export const Ug2ThumbA: React.FC = () => {
  const rows: [React.ReactNode, string, boolean][] = [
    [<IcoCloud key="c" size={70} color="#fff" />, "CLOUD", false],
    [<IcoPc key="p" size={70} color="#fff" />, "GEFORCE NOW", false],
    [<IcoSkull key="s" size={70} color="#fff" />, "APK", false],
    [<IcoPad key="r" size={70} color="#fff" />, "REMOTE PLAY", true],
  ];
  return (
    <AbsoluteFill>
      <Bg src="bridge.jpg" pos="70% 40%" zoom={1.05} dark="linear-gradient(90deg, rgba(4,6,10,0.96) 0%, rgba(4,6,10,0.85) 38%, rgba(4,6,10,0.15) 70%)" />
      <Phone src="kick.jpg" x={930} y={330} w={960} rot={-6} glow="rgba(53,242,154,0.55)" pos="45% 70%" zoom={1.15} />
      <div style={{ position: "absolute", left: 70, top: 50 }}>
        <Big size={150}>GTA 6 ON</Big>
        <Big size={150} color={C.amber}>
          PHONE?
        </Big>
      </div>
      <div style={{ position: "absolute", left: 70, top: 410, display: "flex", flexDirection: "column", gap: 22 }}>
        {rows.map(([ic, t, ok]) => (
          <div key={t} style={{ display: "flex", alignItems: "center", gap: 22, padding: "14px 26px 14px 22px", borderRadius: 22, background: ok ? "rgba(53,242,154,0.22)" : "rgba(0,0,0,0.55)", border: `4px solid ${ok ? C.green : "rgba(255,255,255,0.15)"}`, width: 690, opacity: ok ? 1 : 0.88 }}>
            {ic}
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: ok ? "#fff" : "rgba(255,255,255,0.75)", flex: 1, textDecoration: ok ? "none" : "line-through", textDecorationColor: C.red, textDecorationThickness: 7 }}>{t}</div>
            <Mark ok={ok} size={80} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", right: 60, top: 70, transform: "rotate(5deg)", padding: "10px 34px 18px", borderRadius: 20, background: C.green, boxShadow: "0 16px 40px rgba(0,0,0,0.7), 0 0 60px rgba(53,242,154,0.6)" }}>
        <Big size={130} color="#04140b" style={{ textShadow: "none" }}>
          ONLY 1 WORKS
        </Big>
      </div>
    </AbsoluteFill>
  );
};

/* B — Proof: the Xbox app itself says consoles */
export const Ug2ThumbB: React.FC = () => (
  <AbsoluteFill>
    <Bg src="kick.jpg" pos="50% 65%" zoom={1.12} dark="linear-gradient(270deg, rgba(4,6,10,0.92) 0%, rgba(4,6,10,0.65) 45%, rgba(4,6,10,0.05) 75%)" />
    {/* cropped Xbox app screenshot */}
    <div style={{ position: "absolute", right: 60, top: 300, width: 940, height: 330, borderRadius: 28, overflow: "hidden", transform: "rotate(-3deg)", boxShadow: "0 40px 90px rgba(0,0,0,0.9)", border: "6px solid #fff" }}>
      <Img src={T("xbox.jpg")} style={{ position: "absolute", left: 0, top: -0.205 * 940 * (1608 / 720), width: 940, filter: "contrast(1.2) brightness(1.15)" }} />
      <div style={{ position: "absolute", left: 18, right: 18, top: 0.05 * 940 * (1608 / 720) - 20, height: 0.06 * 940 * (1608 / 720) + 40, border: `9px solid ${C.red}`, borderRadius: 30, boxShadow: `0 0 40px ${C.red}` }} />
    </div>
    <div style={{ position: "absolute", left: 60, top: 50 }}>
      <Big size={170}>GTA 6</Big>
      <Big size={170} color={C.teal}>
        MOBILE?
      </Big>
    </div>
    <div style={{ position: "absolute", right: 70, top: 60, textAlign: "right" }}>
      <Big size={64} color="#fff" style={{ fontSize: 58 }}>
        XBOX&apos;S OWN APP SAYS:
      </Big>
    </div>
    <div style={{ position: "absolute", right: 120, top: 700, transform: "rotate(-4deg)", padding: "8px 34px 16px", borderRadius: 18, background: C.red, boxShadow: "0 16px 40px rgba(0,0,0,0.75)" }}>
      <Big size={150} style={{ textShadow: "none" }}>
        CONSOLES ONLY?!
      </Big>
    </div>
    <div style={{ position: "absolute", left: 60, bottom: 50, padding: "10px 26px", borderRadius: 14, background: "rgba(0,0,0,0.75)", fontFamily: INTER, fontWeight: 800, fontSize: 44, color: "#fff" }}>I tried EVERY method</div>
  </AbsoluteFill>
);

/* C — Warning: the fake APK */
const ApkFile: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 300 * s, height: 380 * s, transform: "rotate(8deg)", filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.85))" }}>
    <svg width={300 * s} height={380 * s} viewBox="0 0 300 380">
      <path d="M20 10 H210 L290 90 V360 a10 10 0 0 1 -10 10 H20 a10 10 0 0 1 -10 -10 V20 a10 10 0 0 1 10 -10z" fill="#fff" stroke="#111" strokeWidth={6} />
      <path d="M210 10 V90 H290" fill="#ddd" stroke="#111" strokeWidth={6} />
      <rect x={10} y={250} width={280} height={90} fill={C.red} />
      <text x={150} y={318} textAnchor="middle" fontFamily="Oswald, Impact, sans-serif" fontWeight={700} fontSize={74} fill="#fff">
        .APK
      </text>
    </svg>
    <div style={{ position: "absolute", left: 60 * s, top: 60 * s }}>
      <IcoSkull size={180 * s} color="#111" />
    </div>
  </div>
);
export const Ug2ThumbC: React.FC = () => (
  <AbsoluteFill>
    <Bg src="phone.jpg" pos="70% 50%" zoom={1.05} dark="linear-gradient(90deg, rgba(40,0,6,0.95) 0%, rgba(30,0,6,0.8) 42%, rgba(0,0,0,0.1) 72%)" filter="saturate(1.2) contrast(1.15)" />
    <AbsoluteFill style={{ boxShadow: `inset 0 0 0 16px ${C.red}` }} />
    <div style={{ position: "absolute", left: 70, top: 60 }}>
      <Big size={120} color={C.amber}>
        &quot;GTA 6 MOBILE&quot;
      </Big>
      <Big size={210} style={{ marginTop: 14 }}>
        IS A
      </Big>
      <Big size={250} color={C.red} style={{ marginTop: 6 }}>
        SCAM
      </Big>
    </div>
    <ApkFile x={1180} y={160} s={1.75} />
    <div style={{ position: "absolute", left: 70, bottom: 60, padding: "14px 30px", borderRadius: 16, background: "#fff", fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: "#111" }}>DON&apos;T DOWNLOAD THIS</div>
  </AbsoluteFill>
);

/* D — Clickbait (still true: Remote Play does put GTA 6 on a phone) */
export const Ug2ThumbD: React.FC = () => (
  <AbsoluteFill>
    <Bg src="beach.jpg" pos="50% 50%" zoom={1.1} dark="radial-gradient(ellipse at 62% 55%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 70%)" filter="saturate(1.6) contrast(1.2) brightness(1.1)" />
    <Phone src="bridge.jpg" x={560} y={330} w={1260} rot={-8} glow="rgba(255,182,72,0.85)" pos="75% 40%" zoom={1.25} />
    {/* big arrow */}
    <svg width={360} height={300} style={{ position: "absolute", left: 230, top: 470, overflow: "visible", filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.8))" }}>
      <path d="M10 60 C 120 40, 220 90, 270 200" fill="none" stroke="#fff" strokeWidth={58} strokeLinecap="round" />
      <path d="M10 60 C 120 40, 220 90, 270 200" fill="none" stroke={C.red} strokeWidth={40} strokeLinecap="round" />
      <path d="M200 190 L300 290 L330 150 Z" fill={C.red} stroke="#fff" strokeWidth={9} strokeLinejoin="round" />
    </svg>
    <div style={{ position: "absolute", left: 60, top: 40 }}>
      <Big size={190}>GTA 6 ON</Big>
      <Big size={190} color={C.amber}>
        MY PHONE?!
      </Big>
    </div>
    <div style={{ position: "absolute", right: 60, top: 70, transform: "rotate(6deg)", padding: "8px 30px 14px", borderRadius: 18, background: C.green, boxShadow: "0 0 60px rgba(53,242,154,0.7), 0 16px 40px rgba(0,0,0,0.7)" }}>
      <Big size={96} color="#04140b" style={{ textShadow: "none" }}>
        IT WORKS
      </Big>
    </div>
    <div style={{ position: "absolute", left: 60, bottom: 46, padding: "8px 22px", borderRadius: 12, background: "rgba(0,0,0,0.7)", fontFamily: MONO, fontWeight: 800, fontSize: 40, color: "#fff" }}>ANDROID + iPHONE</div>
  </AbsoluteFill>
);
