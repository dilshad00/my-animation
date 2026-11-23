/**
 * UG-004 "China GPU Has 2x the VRAM of an RTX 5090" — full film.
 * Photoreal hero stills (ChatGPT-generated, public/ug-004/img) animated 2.5D + credited real photos (public/ug-004/ref)
 * + motion graphics. Timeline from narration word cues (ug004.data.ts ← E:/youtube/china-64gb-gpu/tools/gen_data.py).
 */
import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Freeze, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { pr, sp, Stamp } from "../ug/blocks";
import { clamp, Glitch, Grain, shake, SourceTag, Vignette } from "../ug/fx";
import { C, DISPLAY, INTER, MONO } from "../ug/theme";
import { Big, ChapterTag, Checks, EndScreen, Karaoke, Padlock, Roll, Tag, type Cap } from "../ug3/Gfx3";
import { Embers, HeroShot, Plate } from "../ug3/Hero";
import { CAPTIONS, CUE, TOTAL_FRAMES, VO_FRAMES, VOX } from "./ug004.data";

export const UG004_FRAMES = TOTAL_FRAMES;
const XF = 6;
const GOLD = "#ffc247";
const NVG = "#76b900";
const c = (k: string) => {
  const v = CUE[k];
  if (v === undefined) throw new Error(`cue ${k}`);
  return v;
};
type SceneP = { f: number; d: number; o: number };
const L = (o: number, k: string) => c(k) - o;
const ez = (f: number, a: number, b: number) => pr(f, a, b);
const I = (n: string) => `ug-004/img/${n}.jpg`;
const R = (n: string) => `ug-004/ref/${n}`;

const Pos: React.FC<{ x?: number; y?: number; r?: number; b?: number; w?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, r, b, w, children, style }) => (
  <div style={{ position: "absolute", left: x, top: y, right: r, bottom: b, width: w, ...style }}>{children}</div>
);
const BG: React.FC<{ f: number; accent?: string; x?: number; y?: number; dim?: number }> = ({ f, accent = "rgba(255,194,71,0.10)", x = 60, y = 45, dim = 0.55 }) => (
  <Plate f={f} accent={accent} x={x} y={y} dim={dim} src={I("plate")} />
);
const LeftShade: React.FC<{ k?: number }> = ({ k = 0.75 }) => <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(0,0,0,${k}) 0%, rgba(0,0,0,${k * 0.5}) 38%, transparent 62%)` }} />;
const BotShade: React.FC<{ k?: number }> = ({ k = 0.85 }) => <AbsoluteFill style={{ background: `linear-gradient(0deg, rgba(0,0,0,${k}) 0%, rgba(0,0,0,0) 55%)` }} />;
const Credit: React.FC<{ text: string; d: number }> = ({ text, d }) => <SourceTag text={text} at={4} until={Math.max(30, d)} />;

/** Friend's GTA 6 gameplay (UG-002 footage, permission given). */
const Game: React.FC<{ src: string; dim?: number; blur?: number; sat?: number }> = ({ src, dim = 0.3, blur = 0, sat = 1 }) => (
  <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
    <OffthreadVideo src={staticFile(`ug-002/footage/${src}.mp4`)} muted style={{ width: "100%", height: "100%", objectFit: "cover", filter: `brightness(${1 - dim}) blur(${blur}px) saturate(${sat})` }} />
  </AbsoluteFill>
);

/** Real photo in a floating frame (credited). */
const Frame: React.FC<{ f: number; at?: number; src: string; x: number; y: number; w: number; h: number; rot?: number; border?: string; pos?: string; fit?: "cover" | "contain" }> = ({ f, at = 0, src, x, y, w, h, rot = 0, border = "rgba(255,255,255,0.18)", pos = "50% 50%", fit = "cover" }) => {
  const s = sp(f, at, 15, 140);
  const sw = interpolate(f, [at + 8, at + 50], [-30, 130], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 18, overflow: "hidden", border: `3px solid ${border}`, boxShadow: "0 40px 90px rgba(0,0,0,0.7)", opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 60}px) rotate(${rot}deg) scale(${0.9 + 0.1 * s})`, background: "#000" }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: fit, objectPosition: pos, transform: `scale(${1.02 + 0.04 * interpolate(f, [at, at + 200], [0, 1], clamp)})` }} />
      <AbsoluteFill style={{ background: `linear-gradient(110deg, transparent ${sw - 12}%, rgba(255,255,255,0.22) ${sw}%, transparent ${sw + 12}%)`, mixBlendMode: "screen" }} />
    </div>
  );
};

/** News headline card (source + quoted headline). */
const Headline: React.FC<{ f: number; at: number; src: string; text: string; color?: string; w?: number; rot?: number }> = ({ f, at, src, text, color = C.red, w = 1100, rot = -1.5 }) => {
  if (f < at) return null;
  const s = sp(f, at, 13, 170);
  return (
    <div style={{ width: w, padding: "26px 34px", borderRadius: 16, background: "rgba(245,246,248,0.96)", boxShadow: "0 30px 70px rgba(0,0,0,0.6)", transform: `rotate(${rot}deg) scale(${0.85 + 0.15 * s})`, opacity: Math.min(1, s * 1.5), borderLeft: `12px solid ${color}` }}>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, color: "#666", letterSpacing: 3, marginBottom: 10 }}>{src.toUpperCase()}</div>
      <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 44, color: "#111", lineHeight: 1.2 }}>{text}</div>
    </div>
  );
};

/** Big slam number/text with glow. */
const Slam: React.FC<{ f: number; at: number; children: React.ReactNode; size?: number; color?: string; sub?: string; align?: "left" | "center" }> = ({ f, at, children, size = 200, color = GOLD, sub, align = "left" }) => {
  if (f < at) return null;
  const s = sp(f, at, 11, 220);
  return (
    <div style={{ textAlign: align, transform: `scale(${1.6 - 0.6 * s})`, opacity: Math.min(1, s * 2), transformOrigin: align === "center" ? "50% 50%" : "0% 50%" }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: size, lineHeight: 0.95, color, textShadow: `0 0 60px ${color}88, 0 8px 30px rgba(0,0,0,0.8)` }}>{children}</div>
      {sub ? <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, color: C.mute, letterSpacing: 3, marginTop: 8 }}>{sub}</div> : null}
    </div>
  );
};

/** Strike-through label ("Not from NVIDIA"). */
const Strike: React.FC<{ f: number; at: number; children: React.ReactNode; color?: string; size?: number }> = ({ f, at, children, color = C.ink, size = 80 }) => {
  if (f < at) return null;
  const a = ez(f, at, at + 8);
  const line = ez(f, at + 8, at + 18);
  return (
    <div style={{ position: "relative", display: "inline-block", alignSelf: "flex-start", opacity: a, fontFamily: DISPLAY, fontWeight: 700, fontSize: size, color, transform: `translateX(${(1 - a) * -40}px)` }}>
      {children}
      <div style={{ position: "absolute", left: -10, top: "52%", height: 10, width: `calc(${line * 100}% + 20px)`, background: C.red, boxShadow: `0 0 20px ${C.red}` }} />
    </div>
  );
};

/** VRAM stack: column of memory chips (n GB, 4 GB per chip). */
const Stack: React.FC<{ f: number; at: number; gb: number; color: string; label: string; chipGb?: number; h?: number; over?: number }> = ({ f, at, gb, color, label, chipGb = 4, h = 46, over = 0 }) => {
  const n = Math.round(gb / chipGb);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ display: "flex", flexDirection: "column-reverse", gap: 6 }}>
        {Array.from({ length: n }, (_, i) => {
          const k = ez(f, at + i * 2, at + i * 2 + 8);
          return <div key={i} style={{ width: 190, height: h, borderRadius: 6, background: `linear-gradient(180deg, ${color}, ${color}88)`, boxShadow: `0 0 ${18 * k}px ${color}aa`, opacity: k, transform: `translateY(${(1 - k) * -30}px)`, border: "1px solid rgba(255,255,255,0.25)" }} />;
        })}
      </div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 70, color, textShadow: `0 0 30px ${color}88` }}>
        <Roll f={f} from={0} to={gb} at={at} len={Math.max(10, n * 2)} size={70} color={color} suffix="GB" />
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: C.mute, letterSpacing: 3 }}>{label}</div>
      {over ? null : null}
    </div>
  );
};

/* ===================================================================== HOOK */
const S5090: React.FC<SceneP> = ({ f, d, o }) => {
  const tp = L(o, "h_price");
  const t32 = L(o, "h_32");
  const tm = L(o, "h_most");
  return (
    <AbsoluteFill>
      <HeroShot f={f} d={d} a={R("nv_5090.jpg")} zoom={[1.02, 1.16]} origin="55% 50%" pan={[60, 0, 0, 0]} sweepAt={14} bloom={0.35} tilt={[-3, 3]} />
      <LeftShade k={0.7} />
      <Credit text="Image: NVIDIA" d={d} />
      <Pos x={110} y={170}>
        <Tag f={f} at={2} color={NVG}>
          NVIDIA GEFORCE
        </Tag>
        <div style={{ marginTop: 14 }}>
          <Slam f={f} at={4} size={170} color={C.ink}>
            RTX 5090
          </Slam>
        </div>
        <div style={{ height: 20 }} />
        {f >= tp ? <Roll f={f} from={0} to={2000} at={tp} len={14} size={110} color={GOLD} prefix="$" comma /> : null}
        {f >= t32 ? (
          <div style={{ marginTop: 10 }}>
            <Slam f={f} at={t32} size={130} color={NVG}>
              32 GB VRAM
            </Slam>
          </div>
        ) : null}
        {f >= tm ? <div style={{ marginTop: 18, fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.ink, letterSpacing: 3, opacity: ez(f, tm, tm + 10) }}>MOST MEMORY NVIDIA HAS EVER PUT ON A GAMING CARD</div> : null}
      </Pos>
    </AbsoluteFill>
  );
};

const SDouble: React.FC<SceneP> = ({ f, d, o }) => {
  const t64 = L(o, "h_64");
  const tn = L(o, "h_notnv");
  const ta = L(o, "h_notamd");
  const tc = L(o, "h_china");
  const hero = f >= t64;
  const flash = interpolate(f, [t64, t64 + 2, t64 + 12], [0, 0.9, 0], clamp);
  return (
    <AbsoluteFill style={{ transform: shake(f, t64, 14, 20) }}>
      {hero ? (
        <>
          <HeroShot f={f - t64} d={d - t64} a={I("hero")} zoom={[1.15, 1.28]} origin="62% 55%" sweepAt={4} bloom={0.55} />
          <Embers f={f} color={GOLD} n={60} speed={1.6} />
          <LeftShade k={0.72} />
        </>
      ) : (
        <BG f={f} accent="rgba(118,185,0,0.15)" x={35} y={45} />
      )}
      <Pos x={110} y={130}>
        <Roll f={f} from={32} to={64} at={Math.max(0, t64 - 10)} len={12} size={hero ? 250 : 200} color={hero ? GOLD : NVG} suffix="GB" />
        <div style={{ height: 24 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <Strike f={f} at={tn} size={70}>
            NVIDIA
          </Strike>
          <Strike f={f} at={ta} size={70}>
            AMD
          </Strike>
        </div>
        {f >= tc ? (
          <div style={{ marginTop: 20 }}>
            <Stamp f={f} at={tc} color={C.red} rot={-4} size={110}>
              FROM CHINA
            </Stamp>
          </div>
        ) : null}
      </Pos>
      {f < t64 ? (
        <Pos x={110} y={760}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 34, color: C.ink, letterSpacing: 4, opacity: ez(f, 4, 14) }}>NOW IMAGINE… DOUBLE</div>
        </Pos>
      ) : null}
      <AbsoluteFill style={{ background: "#fff4d6", opacity: flash, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

const STwist: React.FC<SceneP> = ({ f, d, o }) => {
  const tl = L(o, "h_lost");
  const t80 = L(o, "h_80");
  return (
    <AbsoluteFill>
      <HeroShot f={f} d={d} a={I("oldcard")} zoom={[1.0, 1.12]} origin="50% 55%" sweepAt={200} bloom={0.2} dim={0.1} />
      <BotShade k={0.6} />
      <Pos x={110} y={110}>
        <Big f={f} at={2} size={64} color={C.mute}>
          {"THE SAME COMPANY'S\nFIRST GAMING CARD…"}
        </Big>
      </Pos>
      {f >= tl ? (
        <Pos x={0} w={1920} y={420} style={{ textAlign: "center" }}>
          <Stamp f={f} at={tl} color={C.red} rot={-5} size={130}>
            LOST TO A GT 1030
          </Stamp>
        </Pos>
      ) : null}
      {f >= t80 ? (
        <Pos x={0} w={1920} y={640} style={{ textAlign: "center" }}>
          <Tag f={f} at={t80} color={GOLD} size={34}>
            AN $80 CARD FROM 2017
          </Tag>
        </Pos>
      ) : null}
      {f >= tl + 10 ? <Frame f={f} at={tl + 10} src={R("th_gt1030.jpg")} x={1380} y={120} w={440} h={250} rot={3} /> : null}
      {f >= tl + 10 ? <SourceTag text="Photo: BullsLab Jay via Tom's Hardware" at={tl + 10} until={d} /> : null}
    </AbsoluteFill>
  );
};

const SPromise: React.FC<SceneP> = ({ f, d, o }) => {
  const t15 = L(o, "h_15");
  const t50 = L(o, "h_50");
  const tv = L(o, "h_vram");
  const tr = L(o, "h_reveal");
  return (
    <AbsoluteFill>
      <HeroShot f={f} d={d} a={I("hero")} zoom={[1.0, 1.12]} origin="65% 55%" pan={[0, 0, -40, 0]} sweepAt={t15} bloom={0.5} />
      <Embers f={f} color={GOLD} n={50} />
      <LeftShade k={0.8} />
      <Pos x={110} y={110}>
        <Big f={f} at={2} size={60} color={C.mute}>
          4 YEARS LATER, THEY PROMISE…
        </Big>
        <div style={{ display: "flex", gap: 60, marginTop: 30 }}>
          <Slam f={f} at={t15} size={210} color={GOLD} sub="GAMING PERFORMANCE*">
            15×
          </Slam>
          <Slam f={f} at={t50} size={210} color={C.red} sub="RAY TRACING*">
            50×
          </Slam>
        </div>
        {f >= tv ? (
          <div style={{ marginTop: 30 }}>
            <Slam f={f} at={tv} size={84} color={C.ink}>
              + MOST VRAM EVER
            </Slam>
          </div>
        ) : null}
      </Pos>
      {f >= tr ? (
        <Pos x={110} y={820}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 18, padding: "14px 26px", borderRadius: 14, border: `3px solid ${GOLD}`, background: "rgba(0,0,0,0.6)", opacity: ez(f, tr, tr + 8), boxShadow: `0 0 30px ${GOLD}55` }}>
            <span style={{ width: 16, height: 16, borderRadius: 8, background: C.red, opacity: Math.sin(f * 0.4) > 0 ? 1 : 0.2 }} />
            <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color: C.ink, letterSpacing: 3 }}>FULL REVEAL: WEEKS AWAY</span>
          </div>
        </Pos>
      ) : null}
      <Pos x={110} y={1010}>
        <div style={{ fontFamily: MONO, fontSize: 20, color: C.mute }}>*company claims, "up to", vs its own previous cards</div>
      </Pos>
    </AbsoluteFill>
  );
};

const SBluff: React.FC<SceneP> = ({ f, d, o }) => {
  const tb = L(o, "h_bluff");
  const ts = L(o, "h_stick");
  return (
    <AbsoluteFill>
      <HeroShot f={f} d={d} a={I("duel")} zoom={[1.02, 1.14]} origin="50% 55%" sweepAt={tb} bloom={0.5} dim={ts > 0 && f > ts ? 0.35 : 0} />
      <BotShade k={0.75} />
      <Pos x={0} w={1920} y={120} style={{ textAlign: "center" }}>
        <Stamp f={f} at={4} color={C.red} rot={-3} size={70}>
          BLACKLISTED BY THE US
        </Stamp>
      </Pos>
      {f >= tb && f < ts ? (
        <Pos x={0} w={1920} y={720} style={{ textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 70, alignItems: "baseline" }}>
            <Slam f={f} at={tb} size={150} color={C.green} align="center">
              REAL?
            </Slam>
            <Slam f={f} at={tb + 30} size={150} color={C.red} align="center">
              BLUFF?
            </Slam>
          </div>
        </Pos>
      ) : null}
      {f >= ts ? (
        <Pos x={0} w={1920} y={560} style={{ textAlign: "center" }}>
          <div style={{ display: "inline-block", transform: `scale(${sp(f, ts, 12)})` }}>
            <Padlock size={170} color={GOLD} shake={f - ts} />
          </div>
          <div style={{ marginTop: 16, fontFamily: DISPLAY, fontWeight: 700, fontSize: 80, color: C.ink, opacity: ez(f, ts + 6, ts + 16) }}>1 NUMBER THEY HAVEN'T TOLD ANYONE</div>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

/* ===================================================================== CH1 */
const Founder: React.FC<SceneP> = ({ f, d, o }) => {
  const tz = L(o, "zhang");
  const t15 = L(o, "nv15");
  const tr = L(o, "rival");
  return (
    <AbsoluteFill>
      <HeroShot f={f} d={d} a={R("th_lushan64.jpg")} zoom={[1.0, 1.15]} origin="50% 50%" sweepAt={10} bloom={0.4} dim={0.35} />
      <LeftShade k={0.85} />
      <Credit text="Image: Moore Threads via Tom's Hardware" d={d} />
      <Pos x={110} y={170}>
        <Slam f={f} at={2} size={140} color={C.ink}>
          MOORE THREADS
        </Slam>
        <div style={{ marginTop: 12 }}>
          <Tag f={f} at={tz} color={GOLD} size={30}>
            FOUNDED 2020 · BEIJING
          </Tag>
        </div>
        {f >= tz + 20 ? (
          <div style={{ marginTop: 40, padding: "22px 30px", borderRadius: 16, background: "rgba(0,0,0,0.6)", border: `2px solid ${NVG}`, width: 760, opacity: ez(f, tz + 20, tz + 32) }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, color: C.ink }}>ZHANG JIANZHONG</div>
            <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 30, color: NVG, marginTop: 6 }}>Former head of NVIDIA China</div>
          </div>
        ) : null}
        <div style={{ display: "flex", gap: 30, alignItems: "center", marginTop: 34 }}>
          {f >= t15 ? (
            <Slam f={f} at={t15} size={90} color={NVG}>
              15 YRS @ NVIDIA
            </Slam>
          ) : null}
          {f >= tr ? (
            <Slam f={f} at={tr} size={90} color={GOLD}>
              → BUILT A RIVAL
            </Slam>
          ) : null}
        </div>
      </Pos>
    </AbsoluteFill>
  );
};

const S80Intro: React.FC<SceneP> = ({ f, d, o }) => {
  const ts = L(o, "s80");
  const t16 = L(o, "s16");
  const tp = L(o, "pcie");
  const tl = L(o, "launch");
  const spec = (at: number, big: string, small: string, col: string) =>
    f >= at ? (
      <div style={{ padding: "18px 26px", borderRadius: 14, background: "rgba(0,0,0,0.65)", border: `2px solid ${col}`, transform: `scale(${sp(f, at, 12)})`, boxShadow: `0 0 30px ${col}44` }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 76, color: col }}>{big}</div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, color: C.mute, letterSpacing: 2 }}>{small}</div>
      </div>
    ) : null;
  return (
    <AbsoluteFill>
      <HeroShot f={f} d={d} a={R("nbc_s80.jpg")} zoom={[1.05, 1.18]} origin="45% 50%" sweepAt={ts} bloom={0.3} tilt={[-2, 3]} />
      <BotShade k={0.8} />
      <Credit text="Image: Moore Threads via Notebookcheck" d={d} />
      <Pos x={110} y={120}>
        <Tag f={f} at={2} color={GOLD} size={30}>
          2022 · WITHIN 2 YEARS
        </Tag>
        <div style={{ marginTop: 12 }}>
          <Slam f={f} at={6} size={130} color={C.ink}>
            MTT S80
          </Slam>
        </div>
      </Pos>
      <Pos x={110} y={720}>
        <div style={{ display: "flex", gap: 26 }}>
          {spec(t16, "16 GB", "WHEN MOST HAD 8", GOLD)}
          {spec(tp, "PCIe 5.0", "ONE OF THE FIRST", C.teal)}
          {spec(tl, "~$370", "CHINA LAUNCH · MOBO BUNDLE", C.ink)}
        </div>
      </Pos>
    </AbsoluteFill>
  );
};

const ErrorBox: React.FC<{ f: number; at: number; title: string; body: string; x: number; y: number }> = ({ f, at, title, body, x, y }) => {
  if (f < at) return null;
  const s = sp(f, at, 12, 220);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 620, borderRadius: 10, overflow: "hidden", background: "#f2f2f2", boxShadow: "0 30px 60px rgba(0,0,0,0.7)", transform: `scale(${0.7 + 0.3 * s})`, opacity: Math.min(1, s * 2) }}>
      <div style={{ background: "#c42b1c", color: "#fff", fontFamily: INTER, fontWeight: 700, fontSize: 26, padding: "10px 18px" }}>{title}</div>
      <div style={{ padding: "22px 20px", fontFamily: INTER, fontWeight: 600, fontSize: 28, color: "#222", display: "flex", gap: 16, alignItems: "center" }}>
        <span style={{ width: 44, height: 44, borderRadius: 22, background: "#c42b1c", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>✕</span>
        {body}
      </div>
    </div>
  );
};
const Flop: React.FC<SceneP> = ({ f, o }) => {
  const tw = L(o, "wont");
  const tc = L(o, "crashed");
  const tb = L(o, "barely");
  const fps = Math.round(interpolate(f, [tb, tb + 40], [60, 9], clamp));
  const frozen = f >= tc && f < tb;
  return (
    <AbsoluteFill style={{ transform: shake(f, tc, 10, 14) }}>
      <Game src={frozen ? "g4_highway" : "g2_fight"} dim={0.35} blur={f >= tb ? 2 : 0} sat={f >= tc ? 0.3 : 1} />
      <Pos x={110} y={100}>
        <Big f={f} at={2} size={70}>
          {"THEN REVIEWERS\nPLAYED GAMES ON IT"}
        </Big>
      </Pos>
      <ErrorBox f={f} at={tw} title="Application Error" body="Game failed to launch." x={1150} y={220} />
      <ErrorBox f={f} at={tc} title="Display driver stopped responding" body="The game has crashed." x={1100} y={420} />
      {f >= tb ? (
        <Pos r={90} y={680}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 90, color: fps < 25 ? C.red : C.green, textShadow: "0 4px 20px #000" }}>{fps} FPS</div>
        </Pos>
      ) : null}
      <Pos x={110} y={1000}>
        <div style={{ fontFamily: MONO, fontSize: 20, color: C.mute }}>Gameplay for illustration only · not an S80 capture</div>
      </Pos>
    </AbsoluteFill>
  );
};

const Headlines: React.FC<SceneP> = ({ f, o }) => {
  const t3 = L(o, "r3060");
  const th = L(o, "hwthere");
  const td = L(o, "drivers");
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(255,61,82,0.14)" x={50} y={40} />
      <Pos x={180} y={140}>
        <Headline f={f} at={2} src="Tom's Hardware" text="China's Moore Threads MTT S80 GPU Lags Behind GT 1030 in Gaming Showdown" />
      </Pos>
      <Pos x={620} y={390}>
        <Headline f={f} at={t3} src="PC Gamer" text="Moore Threads Chinese GPU benchmarked, beaten handily by RTX 3060" rot={1.5} />
      </Pos>
      {f >= th ? (
        <Pos x={0} w={1920} y={700} style={{ textAlign: "center" }}>
          <div style={{ display: "inline-flex", gap: 60 }}>
            <Slam f={f} at={th} size={100} color={C.green}>
              HARDWARE ✓
            </Slam>
            {f >= td ? (
              <Slam f={f} at={td} size={100} color={C.red}>
                DRIVERS ✕
              </Slam>
            ) : null}
          </div>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const Entity: React.FC<SceneP> = ({ f, o }) => {
  const tb = L(o, "blacklist");
  const tx = L(o, "oxygen");
  const tj = L(o, "jobs");
  const o2 = interpolate(f, [tx, tx + 60], [100, 8], clamp);
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(255,61,82,0.2)" x={50} y={45} />
      <Pos x={0} w={1920} y={110} style={{ textAlign: "center" }}>
        <Tag f={f} at={2} color={C.red} size={32}>
          OCTOBER 2023 · US COMMERCE DEPT.
        </Tag>
        <div style={{ marginTop: 20 }}>
          <Stamp f={f} at={10} color={C.red} rot={-3} size={150}>
            ENTITY LIST
          </Stamp>
        </div>
      </Pos>
      {f >= tb ? (
        <Pos x={260} y={520}>
          <Checks
            f={f}
            size={52}
            items={[
              { t: "American chip technology", at: tb + 8, ok: false },
              { t: "World's most advanced chip factories", at: tb + 50, ok: false },
            ]}
          />
        </Pos>
      ) : null}
      {f >= tx ? (
        <Pos r={200} y={500}>
          <div style={{ width: 200, height: 330, borderRadius: 20, border: `4px solid ${C.ink}`, position: "relative", overflow: "hidden", opacity: ez(f, tx, tx + 8) }}>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${o2}%`, background: o2 > 40 ? C.teal : C.red, boxShadow: `0 0 30px ${o2 > 40 ? C.teal : C.red}` }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: "#fff", textShadow: "0 2px 10px #000" }}>O₂</div>
          </div>
        </Pos>
      ) : null}
      {f >= tj ? (
        <Pos x={0} w={1920} y={880} style={{ textAlign: "center" }}>
          <Tag f={f} at={tj} color={C.red} size={40}>
            WITHIN WEEKS: JOB CUTS
          </Tag>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const Forgot: React.FC<SceneP> = ({ f, d, o }) => {
  const tf = L(o, "forgot");
  const fade = ez(f, tf, tf + 50);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: `grayscale(${fade}) brightness(${1 - fade * 0.5})` }}>
        <HeroShot f={f} d={d} a={R("th_s80.jpg")} zoom={[1.1, 1.0]} origin="50% 50%" sweepAt={500} bloom={0.15} />
      </AbsoluteFill>
      <LeftShade k={0.8} />
      <Credit text="Image: Moore Threads via Tom's Hardware" d={d} />
      <Pos x={110} y={260}>
        <Tag f={f} at={2} color={C.mute} size={30}>
          MTT S80 PRICE
        </Tag>
        <div style={{ marginTop: 10 }}>
          <Roll f={f} from={370} to={164} at={4} len={30} size={200} color={GOLD} prefix="$" />
        </div>
        {f >= tf ? (
          <div style={{ marginTop: 30, fontFamily: DISPLAY, fontWeight: 700, fontSize: 90, color: C.mute, letterSpacing: 10, opacity: ez(f, tf, tf + 20) }}>FORGOTTEN.</div>
        ) : null}
      </Pos>
    </AbsoluteFill>
  );
};

const Comeback: React.FC<SceneP> = ({ f, d, o }) => {
  const tu = L(o, "updates");
  const t40 = L(o, "g40");
  const t100 = L(o, "g100");
  const tus = L(o, "usable");
  const n = Math.max(0, Math.min(14, Math.floor((f - tu) / 3)));
  const bar = (at: number, pct: number, label: string, col: string) => (
    <div style={{ marginBottom: 26 }}>
      <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 30, color: C.ink, marginBottom: 8 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 300, height: 34, borderRadius: 8, background: "rgba(255,255,255,0.25)" }} />
        <div style={{ width: (300 * pct * ez(f, at, at + 24)) / 100, height: 34, borderRadius: 8, background: col, boxShadow: `0 0 24px ${col}`, marginLeft: -20 }} />
        {f >= at ? <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: col }}>+{Math.round(pct * ez(f, at, at + 24))}%</span> : null}
      </div>
    </div>
  );
  return (
    <AbsoluteFill>
      <HeroShot f={f} d={d} a={R("th_drivers.png")} zoom={[1.0, 1.1]} origin="70% 50%" sweepAt={tus} bloom={0.4} dim={0.45} />
      <LeftShade k={0.85} />
      <Credit text="Image: Moore Threads via Tom's Hardware" d={d} />
      <Pos x={110} y={110}>
        <Slam f={f} at={2} size={110} color={C.ink}>
          BUT THEY DIDN'T QUIT
        </Slam>
      </Pos>
      <Pos x={110} y={300}>
        <div style={{ fontFamily: MONO, fontSize: 26, color: C.green, lineHeight: 1.5 }}>
          {Array.from({ length: n }, (_, i) => (
            <div key={i} style={{ opacity: 0.4 + 0.6 * (i === n - 1 ? 1 : 0.6) }}>
              ✓ driver update v{(240 + i * 4).toFixed(0)}.{(i * 37) % 100} installed
            </div>
          )).slice(-6)}
        </div>
      </Pos>
      <Pos x={1000} y={330}>
        {f >= t40 ? bar(t40, 40, "Some games", GOLD) : null}
        {f >= t100 ? bar(t100, 120, "Some games", C.green) : null}
        {f >= tus ? (
          <div style={{ marginTop: 20 }}>
            <Stamp f={f} at={tus + 20} color={C.green} rot={-3} size={80}>
              …USABLE
            </Stamp>
          </div>
        ) : null}
      </Pos>
    </AbsoluteFill>
  );
};

/* ===================================================================== CH2 */
const Reveal: React.FC<SceneP> = ({ f, d, o }) => {
  const th = L(o, "huagang");
  const tl = L(o, "lushan");
  const spot = ez(f, 0, 30);
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(255,194,71,0.14)" x={50} y={30} dim={0.45} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 30% 70% at 50% 0%, rgba(255,230,180,${0.35 * spot}), transparent 70%)` }} />
      <Pos x={0} w={1920} y={140} style={{ textAlign: "center" }}>
        <Tag f={f} at={4} color={GOLD} size={32}>
          DECEMBER 2025 · MUSA DEVELOPER CONFERENCE
        </Tag>
      </Pos>
      {f >= th ? (
        <Pos x={0} w={1920} y={330} style={{ textAlign: "center" }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.mute, letterSpacing: 6, opacity: ez(f, th, th + 10) }}>NEW GPU ARCHITECTURE</div>
          <Slam f={f} at={th + 6} size={190} color={C.ink} align="center">
            HUAGANG
          </Slam>
        </Pos>
      ) : null}
      {f >= tl ? (
        <Pos x={0} w={1920} y={640} style={{ textAlign: "center" }}>
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.mute, letterSpacing: 6 }}>NEW GAMING CHIP · CODENAME</div>
          <Slam f={f} at={tl} size={230} color={GOLD} align="center">
            LUSHAN
          </Slam>
        </Pos>
      ) : null}
      {f >= tl ? <Embers f={f} color={GOLD} n={50} speed={1.4} /> : null}
    </AbsoluteFill>
  );
};

const Claims: React.FC<SceneP> = ({ f, d, o }) => {
  const t50 = L(o, "x50");
  const tdx = L(o, "dx12");
  const t4 = L(o, "x4");
  const card = (at: number, big: string, small: string, col: string) =>
    f >= at ? (
      <div style={{ width: 400, padding: "24px 26px", borderRadius: 18, background: "rgba(0,0,0,0.7)", border: `3px solid ${col}`, boxShadow: `0 0 40px ${col}55`, transform: `scale(${sp(f, at, 12)})` }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, color: C.mute, letterSpacing: 3 }}>UP TO*</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 110, color: col, lineHeight: 1 }}>{big}</div>
        <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 28, color: C.ink, marginTop: 6 }}>{small}</div>
      </div>
    ) : null;
  return (
    <AbsoluteFill>
      <HeroShot f={f} d={d} a={I("hero")} zoom={[1.1, 1.2]} origin="70% 50%" sweepAt={30} bloom={0.45} dim={0.4} />
      <BotShade k={0.5} />
      <Pos x={110} y={110}>
        <Slam f={f} at={2} size={100} color={C.ink}>
          THE CLAIMS
        </Slam>
      </Pos>
      <Pos x={110} y={330}>
        <div style={{ display: "flex", gap: 26, flexWrap: "wrap", width: 1720 }}>
          {card(4, "15×", "AAA gaming", GOLD)}
          {card(t50, "50×", "Ray tracing", C.red)}
          {card(tdx, "DX12", "Ultimate support", C.teal)}
          {card(t4, "4×", "Memory capacity", C.green)}
        </div>
      </Pos>
      <Pos x={110} y={1000}>
        <div style={{ fontFamily: MONO, fontSize: 22, color: C.mute }}>*Moore Threads claims vs its own previous generation · not independently tested</div>
      </Pos>
    </AbsoluteFill>
  );
};

const MathScene: React.FC<SceneP> = ({ f, d, o }) => {
  const ts = L(o, "s80has");
  const tt = L(o, "times16");
  const tr = L(o, "r32");
  const tdb = L(o, "double");
  const tw = L(o, "twice");
  const duel = f >= tw;
  return (
    <AbsoluteFill>
      {duel ? (
        <>
          <HeroShot f={f - tw} d={d - tw} a={I("duel")} zoom={[1.0, 1.08]} origin="50% 55%" sweepAt={2} bloom={0.55} />
          <BotShade k={0.7} />
        </>
      ) : (
        <BG f={f} accent="rgba(255,194,71,0.12)" x={50} y={50} />
      )}
      {!duel ? (
        <>
          <Pos x={0} w={1920} y={90} style={{ textAlign: "center" }}>
            <Big f={f} at={2} size={80} align="center">
              NOW DO THE MATH
            </Big>
          </Pos>
          <Pos x={190} y={240}>
            {f >= ts ? <Stack f={f} at={ts} gb={16} color={C.mute} label="MTT S80" h={24} /> : null}
          </Pos>
          {f >= tt ? (
            <Pos x={480} y={420}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 120, color: C.ink, opacity: ez(f, tt, tt + 8) }}>× 4 =</div>
            </Pos>
          ) : null}
          <Pos x={820} y={130}>
            {f >= tt + 20 ? <Stack f={f} at={tt + 20} gb={64} color={GOLD} label="LUSHAN (4× CLAIM)" h={24} /> : null}
          </Pos>
          <Pos x={1400} y={130}>
            {f >= tr ? <Stack f={f} at={tr} gb={32} color={NVG} label="RTX 5090" h={24} /> : null}
          </Pos>
          {f >= tdb ? (
            <Pos x={0} w={1920} y={880} style={{ textAlign: "center" }}>
              <Stamp f={f} at={tdb} color={GOLD} rot={-3} size={100}>
                EXACTLY DOUBLE
              </Stamp>
            </Pos>
          ) : null}
        </>
      ) : (
        <Pos x={0} w={1920} y={740} style={{ textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 120, alignItems: "baseline" }}>
            <Slam f={f} at={tw} size={150} color={NVG} align="center" sub="RTX 5090">
              32 GB
            </Slam>
            <Slam f={f} at={tw + 8} size={190} color={GOLD} align="center" sub="LUSHAN (EXPECTED)">
              64 GB
            </Slam>
          </div>
        </Pos>
      )}
    </AbsoluteFill>
  );
};

const Timeline: React.FC<SceneP> = ({ f, o }) => {
  const tq = L(o, "q4");
  const tt = L(o, "teased");
  const td = L(o, "decrev");
  const pts: [number, string, string, string][] = [
    [2, "DEC 2025", "Lushan unveiled", C.teal],
    [tq, "SEPT 2026", "Q4 launch confirmed", GOLD],
    [tt, "TEASER", "Most VRAM of any consumer card", C.green],
    [td, "END OF DEC", "Full reveal (reported)", C.red],
  ];
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(255,194,71,0.12)" x={50} y={55} />
      <Pos x={110} y={120}>
        <Slam f={f} at={2} size={90} color={C.ink}>
          NOT JUST A SLIDE ANYMORE
        </Slam>
      </Pos>
      <div style={{ position: "absolute", left: 160, right: 160, top: 560, height: 6, background: "rgba(255,255,255,0.12)" }}>
        <div style={{ height: "100%", width: `${interpolate(f, [0, td + 30], [0, 100], clamp)}%`, background: `linear-gradient(90deg, ${C.teal}, ${GOLD}, ${C.red})`, boxShadow: `0 0 20px ${GOLD}` }} />
      </div>
      {pts.map(([at, when, what, col], i) =>
        f >= at ? (
          <div key={i} style={{ position: "absolute", left: 160 + i * 520, top: 520, width: 440, opacity: ez(f, at, at + 10), transform: `translateY(${(1 - ez(f, at, at + 10)) * 30}px)` }}>
            <div style={{ width: 46, height: 46, borderRadius: 23, background: col, boxShadow: `0 0 30px ${col}`, marginLeft: -10, marginTop: 0 }} />
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 32, color: col, marginTop: 30, letterSpacing: 2 }}>{when}</div>
            <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 36, color: C.ink, marginTop: 8, lineHeight: 1.2 }}>{what}</div>
          </div>
        ) : null,
      )}
    </AbsoluteFill>
  );
};

/* ===================================================================== CH3 */
const AiMem: React.FC<SceneP> = ({ f, d, o }) => {
  const ta = L(o, "ai");
  const tf = L(o, "fit");
  const tc = L(o, "crawl");
  return (
    <AbsoluteFill>
      {f < ta ? (
        <>
          <Game src="g5_bridge_beach" dim={0.4} />
          <Pos x={110} y={140}>
            <Big f={f} at={L(o, "games")} size={90}>
              {"VRAM ISN'T JUST\nFOR GAMES ANYMORE"}
            </Big>
          </Pos>
        </>
      ) : (
        <>
          <HeroShot f={f - ta} d={d - ta} a={I("brain")} zoom={[1.0, 1.12]} origin="50% 40%" sweepAt={6} bloom={0.55} />
          <Embers f={f} color={C.teal} n={40} />
          <LeftShade k={0.7} />
          <Pos x={110} y={150}>
            <Slam f={f} at={ta} size={200} color={C.teal}>
              IT'S FOR AI
            </Slam>
            {f >= tf ? (
              <div style={{ marginTop: 30, fontFamily: INTER, fontWeight: 800, fontSize: 52, color: C.ink, opacity: ez(f, tf, tf + 10), width: 820, lineHeight: 1.2 }}>The whole model must fit in your GPU's memory</div>
            ) : null}
            {f >= tc ? (
              <div style={{ marginTop: 30, display: "flex", gap: 20 }}>
                <Tag f={f} at={tc} color={C.red} size={34}>
                  DOESN'T FIT → CRAWLS
                </Tag>
                <Tag f={f} at={tc + 30} color={C.red} size={34}>
                  OR WON'T RUN
                </Tag>
              </div>
            ) : null}
          </Pos>
        </>
      )}
    </AbsoluteFill>
  );
};

const Box: React.FC<{ f: number; at: number; cap: number; need: number; label: string; color: string }> = ({ f, at, cap, need, label, color }) => {
  const k = ez(f, at, at + 30);
  const fill = Math.min(need, cap) * k;
  const over = need > cap;
  const H = 520;
  const px = H / 64;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, opacity: ez(f, at - 6, at + 4) }}>
      <div style={{ position: "relative", width: 300, height: cap * px, border: `5px solid ${color}`, borderRadius: 16, boxShadow: `0 0 30px ${color}55`, marginTop: H - cap * px }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: fill * px, background: over ? `${C.red}cc` : `${C.teal}bb`, borderRadius: 10 }} />
        {over && k > 0.95 ? (
          <div style={{ position: "absolute", left: -5, width: 300, bottom: cap * px, height: (need - cap) * px * ez(f, at + 30, at + 44), background: `repeating-linear-gradient(45deg, ${C.red}, ${C.red} 12px, transparent 12px, transparent 24px)`, border: `4px dashed ${C.red}` }} />
        ) : null}
      </div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color }}>{cap} GB</div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.mute, letterSpacing: 2 }}>{label}</div>
    </div>
  );
};
const Fit: React.FC<SceneP> = ({ f, o }) => {
  const tr = L(o, "r5090q");
  const tc = L(o, "cant");
  const t64 = L(o, "c64");
  const tf = L(o, "fits");
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(40,215,255,0.12)" x={50} y={50} />
      <Pos x={110} y={90}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ padding: "16px 26px", borderRadius: 14, background: `${C.teal}22`, border: `3px solid ${C.teal}`, fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, color: C.ink, opacity: ez(f, 2, 12) }}>70B AI MODEL</div>
          <Roll f={f} from={0} to={40} at={10} len={20} size={90} color={C.teal} prefix="≈ " suffix="GB" />
        </div>
      </Pos>
      <Pos x={430} y={300}>
        <div style={{ display: "flex", gap: 260, alignItems: "flex-end" }}>
          {f >= tr - 4 ? <Box f={f} at={tr} cap={32} need={40} label="RTX 5090" color={NVG} /> : null}
          {f >= t64 - 4 ? <Box f={f} at={t64} cap={64} need={40} label="LUSHAN (64 GB)" color={GOLD} /> : null}
        </div>
      </Pos>
      {f >= tc ? (
        <Pos x={370} y={230}>
          <Stamp f={f} at={tc} color={C.red} rot={-6} size={64}>
            CAN'T HOLD IT
          </Stamp>
        </Pos>
      ) : null}
      {f >= tf ? (
        <Pos x={1150} y={230}>
          <Stamp f={f} at={tf} color={C.green} rot={-4} size={64}>
            FITS + ROOM TO SPARE
          </Stamp>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const Mods: React.FC<SceneP> = ({ f, d, o }) => {
  const tw = L(o, "workshops");
  const tl = L(o, "listings");
  const tr = L(o, "rebuild");
  return (
    <AbsoluteFill>
      <HeroShot f={f} d={d} a={I("vram")} zoom={[1.0, 1.22]} origin="50% 50%" sweepAt={tw} bloom={0.45} dim={0.3} />
      <Embers f={f} color={C.red} n={36} />
      <LeftShade k={0.85} />
      <Pos x={110} y={110}>
        <Slam f={f} at={2} size={90} color={C.ink}>
          DESPERATE FOR MEMORY
        </Slam>
      </Pos>
      {f >= tw ? (
        <Pos x={110} y={300}>
          <div style={{ padding: "24px 30px", borderRadius: 18, background: "rgba(0,0,0,0.7)", border: `3px solid ${GOLD}`, width: 780, opacity: ez(f, tw, tw + 10) }}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: C.mute, letterSpacing: 3 }}>WORKSHOPS IN CHINA · RTX 4090</div>
            <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 10 }}>
              <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 90, color: C.mute }}>24 GB</span>
              <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 70, color: GOLD }}>→</span>
              <Roll f={f} from={24} to={48} at={tw + 70} len={20} size={110} color={GOLD} suffix="GB" />
            </div>
            <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 28, color: C.ink, marginTop: 6 }}>Desolder the memory, solder on bigger chips</div>
          </div>
        </Pos>
      ) : null}
      {f >= tl ? (
        <Pos x={110} y={640}>
          <div style={{ padding: "22px 30px", borderRadius: 18, background: "rgba(0,0,0,0.7)", border: `3px solid ${C.red}`, width: 780, opacity: ez(f, tl, tl + 10), transform: `rotate(-1deg)` }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: C.mute, letterSpacing: 3 }}>LISTING · MODIFIED RTX 5090</span>
              <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 22, color: C.red }}>UNVERIFIED</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 30, marginTop: 8 }}>
              <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 100, color: C.red }}>96 GB</span>
              <Roll f={f} from={0} to={3888} at={tl + 20} len={20} size={80} color={C.ink} prefix="$" comma />
            </div>
          </div>
        </Pos>
      ) : null}
      {f >= tr ? (
        <Pos x={1050} y={850}>
          <Stamp f={f} at={tr} color={GOLD} rot={-4} size={74}>
            REBUILT BY HAND
          </Stamp>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const Gap: React.FC<SceneP> = ({ f, o }) => {
  const tch = L(o, "chooses");
  const tg = L(o, "gap");
  const bars: [string, number, string][] = [
    ["RTX 5060", 8, NVG],
    ["RTX 5070", 12, NVG],
    ["RTX 5080", 16, NVG],
    ["RTX 5090", 32, NVG],
  ];
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(118,185,0,0.12)" x={40} y={50} />
      <Pos x={110} y={100}>
        <Big f={f} at={2} size={74}>
          {"VRAM NVIDIA GIVES GAMERS"}
        </Big>
      </Pos>
      <Pos x={140} y={330}>
        {bars.map(([n, gb, col], i) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 24 }}>
            <div style={{ width: 220, fontFamily: INTER, fontWeight: 800, fontSize: 34, color: C.ink }}>{n}</div>
            <div style={{ width: gb * 30 * ez(f, 6 + i * 6, 22 + i * 6), height: 54, borderRadius: 8, background: col, boxShadow: `0 0 20px ${col}66` }} />
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 50, color: col }}>{gb} GB</div>
          </div>
        ))}
        {f >= tg ? (
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ width: 220, fontFamily: INTER, fontWeight: 800, fontSize: 34, color: GOLD }}>LUSHAN?</div>
            <div style={{ width: 64 * 30 * ez(f, tg, tg + 30), height: 54, borderRadius: 8, background: `repeating-linear-gradient(90deg, ${GOLD}, ${GOLD} 20px, ${GOLD}99 20px, ${GOLD}99 24px)`, boxShadow: `0 0 30px ${GOLD}` }} />
          </div>
        ) : null}
      </Pos>
      {f >= tch ? (
        <Pos r={120} y={140}>
          <Tag f={f} at={tch} color={C.red} size={32}>
            NVIDIA'S CHOICE, NOT A LIMIT
          </Tag>
        </Pos>
      ) : null}
      <Pos x={140} y={1000}>
        <div style={{ fontFamily: MONO, fontSize: 20, color: C.mute }}>RTX 50 desktop base configs · Lushan capacity unconfirmed</div>
      </Pos>
    </AbsoluteFill>
  );
};

/* ===================================================================== CH4 */
const Verdict: React.FC<SceneP> = ({ f, o }) => {
  const tc = L(o, "cap");
  const tw = L(o, "wins");
  const te = L(o, "else");
  const row = (at: number, label: string, a: string, b: string, res: string, col: string) =>
    f >= at ? (
      <div style={{ display: "grid", gridTemplateColumns: "560px 260px 260px 320px", alignItems: "center", padding: "22px 30px", borderRadius: 16, background: "rgba(0,0,0,0.6)", border: `2px solid ${col}55`, marginBottom: 20, opacity: ez(f, at, at + 10), transform: `translateX(${(1 - ez(f, at, at + 10)) * -60}px)` }}>
        <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 40, color: C.ink }}>{label}</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, color: NVG }}>{a}</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, color: GOLD }}>{b}</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, color: col }}>{res}</div>
      </div>
    ) : null;
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(255,194,71,0.1)" x={50} y={50} />
      <Pos x={110} y={100}>
        <Slam f={f} at={2} size={100} color={C.ink}>
          THE HONEST ANSWER
        </Slam>
      </Pos>
      <Pos x={110} y={300}>
        <div style={{ display: "grid", gridTemplateColumns: "560px 260px 260px 320px", padding: "0 30px 14px", fontFamily: MONO, fontWeight: 700, fontSize: 24, color: C.mute, letterSpacing: 3 }}>
          <div />
          <div>RTX 5090</div>
          <div>LUSHAN</div>
          <div>RESULT</div>
        </div>
        {row(tc, "Memory capacity", "32 GB", "64 GB?", f >= tw ? "WINS*" : "…", C.green)}
        {row(te, "Games · bandwidth · AI speed", "known", "???", "UNKNOWN", C.red)}
      </Pos>
    </AbsoluteFill>
  );
};

const Bandwidth: React.FC<SceneP> = ({ f, o }) => {
  const tb = L(o, "bw");
  const ts = L(o, "size");
  const tf = L(o, "bwfast");
  const tt = L(o, "tb18");
  const tn = L(o, "noword");
  const tp = L(o, "pool");
  const flow = (f * 0.08) % 1;
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(40,215,255,0.12)" x={50} y={50} />
      <Pos x={0} w={1920} y={90} style={{ textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.mute, letterSpacing: 6, opacity: ez(f, 2, 12) }}>THE NUMBER THEY HAVEN'T TOLD ANYONE</div>
        {f >= tb ? (
          <Slam f={f} at={tb} size={170} color={C.teal} align="center">
            BANDWIDTH
          </Slam>
        ) : null}
      </Pos>
      {f >= ts ? (
        <Pos x={160} y={420}>
          <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 40, color: C.ink, opacity: ez(f, ts, ts + 10) }}>SIZE = how much it holds</div>
          {f >= tf ? <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 40, color: C.teal, marginTop: 14, opacity: ez(f, tf, tf + 10) }}>BANDWIDTH = how fast it can use it</div> : null}
        </Pos>
      ) : null}
      {f >= tt ? (
        <Pos x={160} y={620}>
          {[
            ["RTX 5090", 1792, NVG, true],
            ["LUSHAN", 0, GOLD, false],
          ].map(([n, v, col, known], i) => (
            <div key={String(n)} style={{ display: "flex", alignItems: "center", gap: 26, marginBottom: 30, opacity: ez(f, i ? tn : tt, (i ? tn : tt) + 10) }}>
              <div style={{ width: 240, fontFamily: INTER, fontWeight: 800, fontSize: 38, color: C.ink }}>{n as string}</div>
              <div style={{ position: "relative", width: 1000, height: 60, borderRadius: 30, overflow: "hidden", background: "rgba(255,255,255,0.08)", border: `2px solid ${col}` }}>
                {known ? (
                  <div style={{ position: "absolute", inset: 0, background: `repeating-linear-gradient(90deg, ${col}, ${col} 30px, ${col}55 30px, ${col}55 60px)`, backgroundPosition: `${flow * 60}px 0`, width: `${100 * ez(f, tt, tt + 30)}%` }} />
                ) : (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, color: GOLD }}>???</div>
                )}
              </div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 54, color: col as string }}>{known ? "≈1.8 TB/s" : "NOT ANNOUNCED"}</div>
            </div>
          ))}
        </Pos>
      ) : null}
      {f >= tp ? (
        <Pos x={0} w={1920} y={900} style={{ textAlign: "center" }}>
          <Tag f={f} at={tp} color={C.red} size={34}>
            BIG + SLOW CAN LOSE TO SMALLER + FAST
          </Tag>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const Caveats: React.FC<SceneP> = ({ f, o }) => {
  const items = [
    { t: "64 GB is math (4 × 16), not a confirmed spec", at: L(o, "math64") },
    { t: "Some reports: could launch with less", at: L(o, "less") },
    { t: "15× / 50× are vs its OWN older cards, not NVIDIA", at: L(o, "claims2") },
    { t: "\"Up to\" = best possible case", at: L(o, "upto") },
    { t: "Drivers: the S80's weak spot", at: L(o, "drv") },
    { t: "Mostly sold in China + trade restrictions", at: L(o, "mostly") },
  ];
  return (
    <AbsoluteFill>
      <HeroShot f={f} d={1000} a={I("oldcard")} zoom={[1.1, 1.2]} origin="60% 50%" sweepAt={900} bloom={0.15} dim={0.6} />
      <LeftShade k={0.9} />
      <Pos x={110} y={100}>
        <Slam f={f} at={2} size={100} color={GOLD}>
          THERE'S MORE…
        </Slam>
      </Pos>
      <Pos x={110} y={300}>
        <Checks f={f} size={46} items={items.map((x) => ({ ...x, ok: false }))} />
      </Pos>
    </AbsoluteFill>
  );
};

const NotYet: React.FC<SceneP> = ({ f, d, o }) => {
  const tn = L(o, "notyet");
  return (
    <AbsoluteFill>
      <HeroShot f={f} d={d} a={I("duel")} zoom={[1.08, 1.0]} origin="50% 55%" sweepAt={500} bloom={0.4} dim={0.45} />
      <BotShade k={0.6} />
      <Pos x={0} w={1920} y={280} style={{ textAlign: "center" }}>
        <Big f={f} at={2} size={80} align="center">
          {"BEATS THE RTX 5090 IN GAMES?"}
        </Big>
        {f >= tn ? (
          <div style={{ marginTop: 50 }}>
            <Stamp f={f} at={tn} color={C.red} rot={-4} size={150}>
              NOT YET.
            </Stamp>
          </div>
        ) : null}
      </Pos>
    </AbsoluteFill>
  );
};

/* ===================================================================== CH5 */
const Arc: React.FC<SceneP> = ({ f, d, o }) => {
  const td = L(o, "doubling");
  const th = L(o, "halfway");
  const split = ez(f, td, td + 16);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `inset(0 ${50 * split}% 0 0)` }}>
        <HeroShot f={f} d={d} a={I("oldcard")} zoom={[1.05, 1.1]} origin="40% 55%" sweepAt={900} bloom={0.2} dim={0.25} />
      </AbsoluteFill>
      {split > 0 ? (
        <AbsoluteFill style={{ clipPath: `inset(0 0 0 ${100 - 50 * split}%)` }}>
          <HeroShot f={f - td} d={d - td} a={I("hero")} zoom={[1.1, 1.18]} origin="62% 55%" sweepAt={4} bloom={0.55} />
          <Embers f={f} color={GOLD} n={30} />
        </AbsoluteFill>
      ) : null}
      {split > 0 ? <div style={{ position: "absolute", left: "50%", top: -20, bottom: -20, width: 8, background: "#fff", boxShadow: "0 0 30px #fff", transform: "rotate(4deg)", opacity: split }} /> : null}
      <BotShade k={0.75} />
      <Pos x={110} y={760}>
        <Tag f={f} at={2} color={C.red} size={34}>
          2022 · LOST TO A GT 1030
        </Tag>
      </Pos>
      {f >= td ? (
        <Pos r={110} y={760}>
          <Tag f={f} at={td} color={GOLD} size={34}>
            2026 · 2× THE RTX 5090'S VRAM?
          </Tag>
        </Pos>
      ) : null}
      {f >= th ? (
        <Pos x={0} w={1920} y={150} style={{ textAlign: "center" }}>
          <Big f={f} at={th} size={74} align="center">
            {"EVEN HALFWAY THERE…"}
          </Big>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const Comp: React.FC<SceneP> = ({ f, o }) => {
  const tm = L(o, "moment");
  const ts = L(o, "stingy");
  const names: [string, string, number][] = [
    ["NVIDIA", NVG, 4],
    ["AMD", C.red, 10],
    ["INTEL", C.teal, 16],
    ["MOORE THREADS", GOLD, 34],
  ];
  const gauge = ez(f, tm, ts + 40);
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(255,194,71,0.12)" x={50} y={40} />
      <Pos x={0} w={1920} y={120} style={{ textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.mute, letterSpacing: 6 }}>GPU COMPETITION</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 50, marginTop: 30 }}>
          {names.map(([n, col, at]) => (
            <div key={n} style={{ padding: "18px 30px", borderRadius: 14, border: `3px solid ${col}`, fontFamily: DISPLAY, fontWeight: 700, fontSize: n.length > 6 ? 60 : 70, color: col, transform: `scale(${sp(f, at, 12)})`, boxShadow: n === "MOORE THREADS" ? `0 0 40px ${col}` : "none" }}>
              {n}
            </div>
          ))}
        </div>
      </Pos>
      {f >= tm ? (
        <Pos x={0} w={1920} y={520} style={{ textAlign: "center" }}>
          <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 46, color: C.ink, opacity: ez(f, tm, tm + 10) }}>Pressure to stop being stingy with VRAM</div>
          <div style={{ width: 1100, height: 50, margin: "30px auto 0", borderRadius: 25, background: "rgba(255,255,255,0.08)", border: "2px solid rgba(255,255,255,0.3)", overflow: "hidden" }}>
            <div style={{ width: `${gauge * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.teal}, ${GOLD}, ${C.red})`, boxShadow: `0 0 30px ${GOLD}` }} />
          </div>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const Question: React.FC<SceneP> = ({ f, d, o }) => {
  const tc = L(o, "charging");
  const tr = L(o, "reveal2");
  const ts = L(o, "subscribed");
  return (
    <AbsoluteFill>
      <HeroShot f={f} d={d} a={R("nv_5090.jpg")} zoom={[1.0, 1.1]} origin="55% 50%" sweepAt={tc} bloom={0.3} dim={f >= tr ? 0.6 : 0.2} />
      <LeftShade k={0.8} />
      <Credit text="Image: NVIDIA" d={tr} />
      {f < tr ? (
        <Pos x={110} y={220}>
          <Big f={f} at={2} size={70} color={C.mute}>
            THE REAL QUESTION:
          </Big>
          {f >= tc ? (
            <div style={{ marginTop: 30 }}>
              <Slam f={f} at={tc} size={150} color={GOLD}>
                $2,000…
              </Slam>
              <Slam f={f} at={tc + 40} size={150} color={NVG}>
                FOR 32 GB?
              </Slam>
            </div>
          ) : null}
        </Pos>
      ) : (
        <Pos x={0} w={1920} y={300} style={{ textAlign: "center" }}>
          <Big f={f} at={tr} size={80} align="center">
            {"WHEN LUSHAN IS REVEALED:\nREAL SPECS + FIRST BENCHMARKS"}
          </Big>
          {f >= ts ? (
            <div style={{ marginTop: 50, display: "inline-block", padding: "22px 60px", borderRadius: 16, background: f > ts + 20 ? "#333" : C.red, fontFamily: INTER, fontWeight: 800, fontSize: 56, color: "#fff", transform: `scale(${sp(f, ts, 10)})` }}>
              {f > ts + 20 ? "SUBSCRIBED ✓" : "SUBSCRIBE"}
            </div>
          ) : null}
        </Pos>
      )}
    </AbsoluteFill>
  );
};

const Poll: React.FC<SceneP> = ({ f, o }) => {
  const tt = L(o, "trust");
  const tc = L(o, "comments");
  const opt = (at: number, k: string, t: string, col: string) =>
    f >= at ? (
      <div style={{ width: 640, padding: "34px 36px", borderRadius: 20, border: `4px solid ${col}`, background: "rgba(0,0,0,0.6)", boxShadow: `0 0 40px ${col}55`, transform: `scale(${sp(f, at, 12)})` }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 90, color: col }}>{k}</div>
        <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 46, color: C.ink, lineHeight: 1.2 }}>{t}</div>
      </div>
    ) : null;
  return (
    <AbsoluteFill>
      <HeroShot f={f} d={300} a={I("duel")} zoom={[1.0, 1.06]} origin="50% 50%" sweepAt={900} bloom={0.3} dim={0.65} />
      <Pos x={0} w={1920} y={110} style={{ textAlign: "center" }}>
        <Big f={f} at={2} size={86} align="center">
          WOULD YOU BUY IT?
        </Big>
      </Pos>
      <Pos x={0} w={1920} y={330}>
        <div style={{ display: "flex", justifyContent: "center", gap: 70 }}>
          {opt(10, "A", "Yes, 64 GB of VRAM? Take my money", GOLD)}
          {opt(tt, "B", "Never. I don't trust the drivers", C.red)}
        </div>
      </Pos>
      {f >= tc ? (
        <Pos x={0} w={1920} y={800} style={{ textAlign: "center" }}>
          <Tag f={f} at={tc} color={C.teal} size={36}>
            💬 TELL ME IN THE COMMENTS
          </Tag>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const Outro: React.FC<SceneP> = ({ f }) => (
  <AbsoluteFill>
    <BG f={f} accent="rgba(255,194,71,0.10)" x={30} y={45} />
    <EndScreen f={f} at={4} />
  </AbsoluteFill>
);

/* ===================================================================== timeline */
type Block = { id: string; from: number; to: number; C: React.FC<SceneP>; ch?: [number, string] };
const mk = (id: string, from: number, to: number, Cm: React.FC<SceneP>, ch?: [number, string]): Block => ({ id, from, to, C: Cm, ch });
const BLOCKS: Block[] = [
  mk("s5090", 0, c("h_imagine"), S5090),
  mk("double", c("h_imagine"), c("h_crazy"), SDouble),
  mk("twist", c("h_crazy"), c("h_four"), STwist),
  mk("promise", c("h_four"), c("h_how"), SPromise),
  mk("bluff", c("h_how"), c("mt"), SBluff),
  mk("founder", c("mt"), c("fast"), Founder, [1, "THE CARD THAT FLOPPED"]),
  mk("s80", c("fast"), c("played"), S80Intro),
  mk("flop", c("played"), c("gt1030"), Flop),
  mk("headlines", c("gt1030"), c("worse"), Headlines),
  mk("entity", c("worse"), c("p164"), Entity),
  mk("forgot", c("p164"), c("quit"), Forgot),
  mk("comeback", c("quit"), c("dec2025"), Comeback),
  mk("reveal", c("dec2025"), c("claims"), Reveal, [2, "THE COMEBACK"]),
  mk("claims", c("claims"), c("math"), Claims),
  mk("math", c("math"), c("slide"), MathScene),
  mk("timeline", c("slide"), c("why"), Timeline),
  mk("aimem", c("why"), c("b70"), AiMem, [3, "WHY 64 GB MATTERS"]),
  mk("fit", c("b70"), c("desperate"), Fit),
  mk("mods", c("desperate"), c("could"), Mods),
  mk("gap", c("could"), c("beat"), Gap),
  mk("verdict", c("beat"), c("remember"), Verdict, [4, "REALITY CHECK"]),
  mk("bandwidth", c("remember"), c("more"), Bandwidth),
  mk("caveats", c("more"), c("no"), Caveats),
  mk("notyet", c("no"), c("matters"), NotYet),
  mk("arc", c("matters"), c("comp"), Arc, [5, "WHAT IT MEANS"]),
  mk("comp", c("comp"), c("question"), Comp),
  mk("question", c("question"), c("hear"), Question),
  mk("poll", c("hear"), c("missed"), Poll),
  mk("outro", c("missed"), TOTAL_FRAMES, Outro),
];

const Host: React.FC<{ b: Block }> = ({ b }) => {
  const f = useCurrentFrame();
  const fadeIn = b.from === 0 ? 1 : pr(f, 0, XF);
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <b.C f={f} d={b.to - b.from} o={b.from} />
      {b.ch ? <ChapterTag n={b.ch[0]} title={b.ch[1]} /> : null}
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
const MUSIC: [string, number, number, number][] = [
  ["c5_twist", 0, c("mt"), 0.3],
  ["c2_ram", c("mt"), c("dec2025"), 0.3],
  ["c1_hook", c("dec2025"), c("why"), 0.3],
  ["c3_ai", c("why"), c("beat"), 0.3],
  ["c7_bf", c("beat"), c("matters"), 0.3],
  ["c9_outro", c("matters"), TOTAL_FRAMES, 0.3],
];
const FADE = 24;
const S3 = (n: string) => `ug-003/audio/${n}.wav`;
const W1 = "sfx/swoosh.wav";
const WD = "ug-001/audio/whoosh_down.wav";
const IMP = "sfx/impact.wav";
const BIG = "sfx/tech/big-impact.mp3";
const DEEP = "sfx/tech/deep-impact.mp3";
type Sfx = [number, string, number];
const SFX: Sfx[] = [
  ...BLOCKS.slice(1).map((b, i) => [b.from - 4, i % 2 ? W1 : WD, 0.14] as Sfx),
  [c("h_price"), S3("tick"), 0.3],
  [c("h_32"), IMP, 0.35],
  [c("h_64") - 2, S3("sub_boom"), 0.75],
  [c("h_64"), BIG, 0.5],
  [c("h_notnv") + 8, S3("click"), 0.35],
  [c("h_notamd") + 8, S3("click"), 0.35],
  [c("h_china"), DEEP, 0.5],
  [c("h_lost"), IMP, 0.45],
  [c("h_15"), BIG, 0.4],
  [c("h_50"), BIG, 0.4],
  [c("h_reveal"), S3("beep"), 0.3],
  [c("h_how") + 4, IMP, 0.4],
  [c("h_stick"), S3("lock"), 0.5],
  [c("h_change"), S3("riser"), 0.25],
  [c("wont"), S3("beep"), 0.35],
  [c("crashed"), S3("power_down"), 0.5],
  [c("drivers"), IMP, 0.35],
  [c("worse") + 10, DEEP, 0.5],
  [c("jobs"), IMP, 0.35],
  [c("p164") + 4, S3("power_down"), 0.4],
  [c("usable") + 20, S3("power_up"), 0.4],
  [c("huagang") + 6, BIG, 0.4],
  [c("lushan"), DEEP, 0.55],
  [c("claims") + 4, IMP, 0.35],
  [c("x50"), IMP, 0.35],
  [c("x4"), IMP, 0.35],
  [c("double"), BIG, 0.45],
  [c("twice"), S3("sub_boom"), 0.6],
  [c("ai"), BIG, 0.45],
  [c("cant"), S3("power_down"), 0.45],
  [c("fits"), S3("power_up"), 0.4],
  [c("rebuild"), IMP, 0.4],
  [c("wins"), S3("beep"), 0.3],
  [c("bw"), BIG, 0.45],
  [c("noword"), S3("lock"), 0.4],
  ...["math64", "less", "claims2", "upto", "drv", "mostly"].map((k) => [c(k), S3("click"), 0.3] as Sfx),
  [c("notyet"), DEEP, 0.55],
  [c("doubling"), S3("riser"), 0.3],
  [c("subscribed") + 20, S3("click"), 0.4],
];

const Mix: React.FC = () => (
  <>
    <Audio src={staticFile("ug-004/audio/narration.mp3")} volume={1} />
    {MUSIC.map(([file, a, b, lvl], i) => {
      const dur = b - a + FADE;
      return (
        <Sequence key={file + i} from={a} durationInFrames={dur} layout="none">
          <Audio
            src={staticFile(`ug-001/audio/music/${file}.mp3`)}
            loop
            volume={(fr) => {
              const abs = fr + a;
              const base = lvl - 0.21 * voice(abs);
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
      <Sequence key={i} from={Math.max(0, at)} durationInFrames={90} layout="none">
        <Audio src={staticFile(src)} volume={v} />
      </Sequence>
    ))}
  </>
);

/* ===================================================================== root */
const CHAPTER_AT = BLOCKS.filter((b) => b.ch).map((b) => b.from);
const Progress: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 5, background: "rgba(255,255,255,0.06)" }}>
      <div style={{ width: `${(f / TOTAL_FRAMES) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.red}, ${GOLD})` }} />
      {CHAPTER_AT.map((a) => (
        <div key={a} style={{ position: "absolute", left: `${(a / TOTAL_FRAMES) * 100}%`, top: 0, width: 3, height: 5, background: C.bg }} />
      ))}
    </div>
  );
};

export const UgFour: React.FC<{ audio?: boolean }> = ({ audio = true }) => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    {BLOCKS.map((b) => (
      <Sequence key={b.id} from={b.from} durationInFrames={b.to - b.from + XF} name={b.id}>
        <Host b={b} />
      </Sequence>
    ))}
    {[c("h_64"), ...CHAPTER_AT].map((a) => (
      <Sequence key={a} from={a - 3} durationInFrames={10} layout="none">
        <Glitch at={0} len={7} />
      </Sequence>
    ))}
    <Vignette strength={0.5} />
    <Grain opacity={0.05} />
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
  return [0.25, 0.6, 0.92].map((p) => b.from + Math.floor(d * p));
});
export const UG004_SHEET_FRAMES = SAMPLES.length;
export const UgFourSheet: React.FC = () => {
  const f = useCurrentFrame();
  const t = SAMPLES[Math.min(f, SAMPLES.length - 1)];
  return (
    <AbsoluteFill>
      <Freeze frame={t}>
        <UgFour audio={false} />
      </Freeze>
      <div style={{ position: "absolute", right: 10, top: 10, padding: "4px 10px", background: "#ff0", color: "#000", fontFamily: MONO, fontSize: 22, fontWeight: 800 }}>
        {Math.floor(t / 1800)}:{String(Math.floor((t / 30) % 60)).padStart(2, "0")} · f{t}
      </div>
    </AbsoluteFill>
  );
};
