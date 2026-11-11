/**
 * 30-second, silent style test: "premium 2D anime".
 *
 *  0.0– 6.3s  S1 sunset sky establishing (tilt-down to the city, flare, petals)
 *  5.8–13.3s  S2 rooftop medium shot — wind in hair, blinks, glance to camera
 * 13.3–18.2s  S3 extreme eye close-up — iris detail, pupil reacts, sparkle
 * 18.2–24.2s  S4 action beat — focus lines, shout, impact frames, camera shake
 * 23.8–30.0s  S5 night — stars, shooting star, title card, fade out
 */
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { AnimeSkyline, RooftopFence } from "../components/anime/AnimeCity";
import { AnimeGrade, Flash, GodRays, LensFlare, Letterbox, SakuraPetals, Sparkles, SpeedLines } from "../components/anime/AnimeFx";
import { AnimeGirl, type GirlProps } from "../components/anime/AnimeGirl";
import { NightSky, SunsetSky } from "../components/anime/AnimeSky";
import { DISPLAY_FONT, UI_FONT } from "../components/anime/fonts";
import { ANIME, easeBack, easeInOut, easeOut, prog } from "../components/anime/palette";

export const ANIME_DEMO_FRAMES = 900;

const blinkAt = (f: number, starts: number[]) => {
  for (const s of starts) {
    const t = f - s;
    if (t >= 0 && t < 7) return t < 3 ? t / 3 : 1 - (t - 3) / 4;
  }
  return 0;
};
const shake = (f: number, amp: number) => [Math.sin(f * 1.9) * amp + Math.sin(f * 3.7) * amp * 0.5, Math.cos(f * 2.3) * amp * 0.8];

/** Places the 1000×1200 character box: (x, y) = top-left in px, s = scale. */
const Girl: React.FC<GirlProps & { x: number; y: number; s: number }> = ({ x, y, s, ...p }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 1000 * s, height: 1200 * s }}>
    <AnimeGirl {...p} />
  </div>
);

const Fade: React.FC<{ from: number; to: number; inLen?: number; outLen?: number; children: React.ReactNode }> = ({ from, to, inLen = 0, outLen = 0, children }) => {
  const f = useCurrentFrame();
  const a = inLen ? prog(f, from, from + inLen) : 1;
  const b = outLen ? 1 - prog(f, to - outLen, to) : 1;
  return <AbsoluteFill style={{ opacity: a * b }}>{children}</AbsoluteFill>;
};

const S1: React.FC = () => {
  const f = useCurrentFrame();
  const k = prog(f, 0, 170, easeInOut);
  const ty = 380 * (1 - k);
  const sc = 1.18 - 0.1 * k;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: ANIME.sunset.top }} />
      <AbsoluteFill style={{ transform: `translateY(${ty}px) scale(${sc})`, transformOrigin: "50% 80%" }}>
        <SunsetSky frame={f + 200} />
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${(1 - k) * 160}px)` }}>
          <AnimeSkyline frame={f} pan={-f * 0.6} />
        </div>
      </AbsoluteFill>
      <GodRays frame={f} x={1350} y={760 - ty * 0.6} opacity={0.3 + k * 0.15} />
      <LensFlare x={1350} y={760 - ty * 0.6} opacity={0.35 + 0.4 * k} />
      <SakuraPetals frame={f} count={30} opacity={prog(f, 50, 110)} seed="s1" />
    </AbsoluteFill>
  );
};

const S2: React.FC = () => {
  const f = useCurrentFrame(); // local, 0..225
  const push = 1 + prog(f, 0, 225, easeInOut) * 0.07;
  const lookK = prog(f, 95, 120, easeInOut);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${1.04 + (push - 1) * 0.4}) translateX(${-f * 0.15}px)` }}>
        <SunsetSky frame={f + 380} sunX={1450} sunY={700} />
        <div style={{ position: "absolute", inset: 0, transform: "translateY(-120px)" }}>
          <AnimeSkyline frame={f} pan={-120} />
        </div>
        <RooftopFence y={960} pan={f * 0.3} />
      </AbsoluteFill>
      <GodRays frame={f} x={1450} y={700} opacity={0.4} />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 40%" }}>
        <Girl x={430} y={110} s={0.95} frame={f + 400} wind={0.75} blink={blinkAt(f, [52, 150, 200])} look={[-12 + lookK * 12, 2 - lookK * 2]} tilt={-3 + lookK * 3} id="s2" />
      </AbsoluteFill>
      <SakuraPetals frame={f + 190} count={34} seed="s2" />
      <SakuraPetals frame={f + 190} count={6} size={3} seed="s2near" speed={1.4} opacity={0.85} />
    </AbsoluteFill>
  );
};

const EYE_X = 428;
const EYE_Y = 375;
const S3: React.FC = () => {
  const f = useCurrentFrame(); // 0..145
  const z = 5 + prog(f, 0, 145, easeInOut) * 0.9;
  const react = prog(f, 62, 72, easeOut);
  const glint = prog(f, 66, 92);
  return (
    <AbsoluteFill style={{ background: ANIME.skin.base, overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 1000 * z, height: 1200 * z, left: 960 - EYE_X * z + 40 * (1 - react), top: 560 - EYE_Y * z }}>
        <AnimeGirl frame={f + 600} detail wind={0.5} blink={blinkAt(f, [28])} pupil={1 - react * 0.32} look={[react * 3, -react * 2]} brow={react * 0.35} id="s3" />
      </div>
      {glint > 0 && glint < 1 && (
        <AbsoluteFill style={{ background: `linear-gradient(115deg, transparent ${glint * 140 - 30}%, rgba(255,255,255,.55) ${glint * 140 - 22}%, transparent ${glint * 140 - 14}%)`, mixBlendMode: "screen" }} />
      )}
      <Sparkles frame={f} count={14} area={[560, 220, 800, 640]} seed="s3" size={1.6 * react + 0.2} />
      <Flash k={react > 0 && react < 1 ? 0.18 * (1 - react) : 0} />
    </AbsoluteFill>
  );
};

const S4: React.FC = () => {
  const f = useCurrentFrame(); // 0..180
  const hit2 = f - 92;
  const punch = hit2 >= 0 && hit2 < 14 ? 1 + 0.08 * (1 - hit2 / 14) : 1;
  const [sx, sy] = shake(f, f < 10 || (hit2 >= 0 && hit2 < 16) ? 14 : 3);
  const shout = prog(f, 40, 52, easeBack);
  const zoom = 1 + prog(f, 0, 180) * 0.12;
  const bg = f < 92 ? "radial-gradient(circle at 50% 42%, #ffd0e0 0%, #ff4f7a 35%, #5a1460 100%)" : "radial-gradient(circle at 50% 42%, #e6f0ff 0%, #5d7dff 35%, #170c4a 100%)";
  return (
    <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
      <SpeedLines frame={f} cy={430} inner={360} opacity={0.75} />
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) scale(${zoom * punch})`, transformOrigin: "50% 38%" }}>
        <Girl x={385} y={-40} s={1.15} frame={f * 2 + 800} wind={1.8} brow={prog(f, 0, 10)} mouth={0.25 + shout * 0.75} pupil={0.78} look={[0, -1]} light={f < 92 ? "sunset" : "night"} id="s4" />
      </AbsoluteFill>
      <SakuraPetals frame={f * 3} count={45} wind={6} speed={1.5} seed="s4" />
      <SpeedLines frame={f + 1} cy={430} inner={760} count={40} color={f < 92 ? "#fff3f6" : "#e9eeff"} opacity={0.5} hold={1} />
      <Flash k={f < 6 ? 1 - f / 6 : hit2 >= 0 && hit2 < 5 ? 1 - hit2 / 5 : 0} />
      {/* impact frame: 2 inverted-silhouette frames */}
      {(hit2 === 0 || hit2 === 1) && <AbsoluteFill style={{ background: "#120626", mixBlendMode: "difference" }} />}
    </AbsoluteFill>
  );
};

const S5: React.FC = () => {
  const f = useCurrentFrame(); // 0..176
  const title = prog(f, 70, 92, easeBack);
  const sub = prog(f, 88, 108, easeOut);
  const shine = prog(f, 100, 130);
  const end = 1 - prog(f, 160, 176);
  return (
    <AbsoluteFill style={{ opacity: end }}>
      <AbsoluteFill style={{ transform: `translateY(${-f * 0.25}px) scale(1.05)` }}>
        <NightSky frame={f} shootAt={30} tint={0.4} />
        <div style={{ position: "absolute", inset: 0, transform: "translateY(-60px)" }}>
          <AnimeSkyline frame={f} night pan={-260} />
        </div>
        <RooftopFence y={1010} night pan={-40} />
      </AbsoluteFill>
      <Girl x={-40 - f * 0.12} y={150} s={0.92} frame={f + 1100} wind={0.45} light="night" look={[6, -9]} tilt={4} blink={blinkAt(f, [56, 140])} id="s5" />
      <SakuraPetals frame={f + 900} count={22} seed="s5" opacity={0.75} />
      <Sparkles frame={f} count={18} area={[980, 260, 860, 520]} seed="s5" color="#dfe6ff" />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 34% 30% at 74% 50%, rgba(8,8,40,.72), transparent)", opacity: title }} />
      <div style={{ position: "absolute", left: 1000, top: 360, width: 840, textAlign: "center", transform: `scale(${0.6 + 0.4 * title})`, opacity: Math.min(1, title * 1.4) }}>
        <div
          style={{
            fontFamily: DISPLAY_FONT, fontSize: 168, lineHeight: 1, letterSpacing: 10,
            backgroundImage: `linear-gradient(100deg, #ffe0f0 0%, #ffffff ${shine * 100 - 10}%, #ffd36b ${shine * 100}%, #ffffff ${shine * 100 + 10}%, #c9b8ff 100%)`,
            WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            filter: "drop-shadow(0 0 22px rgba(255,140,200,.75)) drop-shadow(0 6px 0 #2a1060)",
          }}
        >
          HIKARI
        </div>
        <div style={{ height: 4, margin: "26px auto 22px", width: `${sub * 70}%`, background: "linear-gradient(90deg, transparent, #ffd36b, transparent)" }} />
        <div style={{ fontFamily: UI_FONT, fontWeight: 700, fontSize: 38, letterSpacing: 12, color: "#eef0ff", opacity: sub, textShadow: "0 0 18px rgba(140,160,255,.9)" }}>
          PREMIUM 2D ANIME STYLE
        </div>
        <div style={{ fontFamily: UI_FONT, fontWeight: 500, fontSize: 26, letterSpacing: 8, color: "#b9c3ff", opacity: sub, marginTop: 14 }}>STYLE TEST · DEMO</div>
      </div>
    </AbsoluteFill>
  );
};

export const AnimeDemo: React.FC = () => {
  const f = useCurrentFrame();
  const night = f >= 715;
  return (
    <AbsoluteFill style={{ background: "#05030c" }}>
      <Sequence durationInFrames={190}>
        <Fade from={0} to={190} inLen={20} outLen={15}><S1 /></Fade>
      </Sequence>
      <Sequence from={175} durationInFrames={225}>
        <Fade from={0} to={225} inLen={15}><S2 /></Fade>
      </Sequence>
      <Sequence from={400} durationInFrames={145}>
        <S3 />
      </Sequence>
      <Sequence from={545} durationInFrames={180}>
        <S4 />
      </Sequence>
      <Sequence from={715} durationInFrames={185}>
        <Fade from={0} to={185} inLen={12}><S5 /></Fade>
      </Sequence>
      {/* whip-flash between S2→S3 */}
      <Flash k={f >= 396 && f < 408 ? 1 - Math.abs(f - 400) / 8 : 0} />
      <Flash k={f >= 712 && f < 730 ? 1 - Math.abs(f - 716) / 14 : 0} color="#e9eeff" />
      <AnimeGrade frame={f} warmth={night ? "#7a8cff" : "#ff9a6b"} />
      <Letterbox amount={1} />
    </AbsoluteFill>
  );
};
