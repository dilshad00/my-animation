/**
 * UG-003 "Someone Turned an 8GB NVIDIA GPU Into an 80GB GPU" — full film.
 * Timeline is driven by narration word cues (ug003.data.ts ← E:/youtube/8gb-to-80gb/tools/gen_data.py).
 * 3D: procedural three.js models (Three3D.tsx). Render on CI with [gl:swangle].
 */
import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Freeze, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Clip, pr, Shade, sp, Stamp } from "../ug/blocks";
import { clamp, Glitch, Grain, shake, SourceTag, Vignette } from "../ug/fx";
import { C, DISPLAY, INTER, MONO } from "../ug/theme";
import {
  Big,
  BenchBars,
  Callout,
  ChapterTag,
  Checks,
  CryptoTimeline,
  EndScreen,
  HoursClock,
  Karaoke,
  LoopRing,
  MemBar,
  Padlock,
  Panel,
  PriceClash,
  Quote,
  Records,
  ResultChip,
  Roll,
  Scope,
  StatRow,
  Tag,
  Terminal,
  ToolTrio,
  U,
  VramFit,
  Wafer,
  type Cap,
} from "./Gfx3";
import { Bridge, Cam, Card, ContactShadow, FuseField, Ga100, Glitcher, mix, mixV, project, Scene3D, Wire, type V3 } from "./Three3D";
import { CAPTIONS, CUE, TOTAL_FRAMES, VO_FRAMES, VOX } from "./ug003.data";
import { Embers, HeroShot, Plate } from "./Hero";

export const UG003_FRAMES = TOTAL_FRAMES;
const XF = 6;
const c = (k: string) => {
  const v = CUE[k];
  if (v === undefined) throw new Error(`cue ${k}`);
  return v;
};
type SceneP = { f: number; d: number; o: number };
/** local frame of a cue inside a scene starting at o */
const L = (o: number, k: string) => c(k) - o;
const ez = (f: number, a: number, b: number) => pr(f, a, b);

const Pos: React.FC<{ x?: number; y?: number; r?: number; b?: number; w?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, r, b, w, children, style }) => (
  <div style={{ position: "absolute", left: x, top: y, right: r, bottom: b, width: w, ...style }}>{children}</div>
);

/** Gameplay clip from UG-002 (friend's GTA 6 footage, permission given). */
const Game: React.FC<{ src: string; dim?: number; blur?: number }> = ({ src, dim = 0.35, blur = 0 }) => (
  <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
    <OffthreadVideo src={staticFile(`ug-002/footage/${src}.mp4`)} muted style={{ width: "100%", height: "100%", objectFit: "cover", filter: `brightness(${1 - dim}) blur(${blur}px) saturate(0.9)` }} />
  </AbsoluteFill>
);

const BG: React.FC<{ f: number; accent?: string; x?: number; y?: number }> = ({ f, accent = "rgba(40,215,255,0.14)", x = 60, y = 45 }) => <Plate f={f} accent={accent} x={x} y={y} />;
const LeftShade: React.FC<{ k?: number }> = ({ k = 0.75 }) => <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(0,0,0,${k}) 0%, rgba(0,0,0,${k * 0.5}) 35%, transparent 60%)` }} />;

/* ===================================================================== HOOK */
const Hook8: React.FC<SceneP> = ({ f, o }) => {
  const same = L(o, "h_same");
  const cut = f >= same;
  const push = 0;
  return (
    <AbsoluteFill>
      {cut ? (
        <HeroShot f={f - same} d={70} a="hero_red.jpg" zoom={[1.55, 1.7 + push * 0]} origin="72% 52%" sweepAt={4} bloom={0.4} />
      ) : (
        <HeroShot f={f} d={same} a="hero_red.jpg" zoom={[1.0, 1.1]} pan={[30, 0, 0, 0]} origin="62% 55%" sweepAt={30} bloom={0.38} />
      )}
      <Embers f={f} color="#ff6a3d" />
      <LeftShade k={0.55} />
      <Pos x={110} y={150}>
        <Tag f={f} at={8} color={C.red}>
          VRAM
        </Tag>
        <div style={{ marginTop: 10 }}>{f >= L(o, "h_8") - 6 ? <Roll f={f} from={0} to={8} at={L(o, "h_8") - 6} len={14} size={230} color={C.ink} suffix="GB" /> : null}</div>
      </Pos>
      {cut ? (
        <Pos x={110} y={520}>
          <Big f={f} at={same} size={70} color={C.mute}>
            SAME CARD.
          </Big>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const Hook80: React.FC<SceneP> = ({ f, d }) => {
  const flash = interpolate(f, [0, 2, 10], [0.9, 0.6, 0], clamp);
  return (
    <AbsoluteFill style={{ transform: shake(f, 0, 16, 22) }}>
      <HeroShot f={f} d={d} a="hero_red.jpg" b="hero_green.jpg" k={ez(f, 0, 6)} zoom={[1.18, 1.3]} origin="64% 55%" sweepAt={2} bloom={0.6} />
      <Embers f={f} color="#35f29a" speed={2.2} n={60} />
      <LeftShade k={0.5} />
      <Pos x={110} y={150}>
        <Tag f={f} at={0} color={C.green}>
          VRAM
        </Tag>
        <div style={{ marginTop: 10 }}>
          <Roll f={f} from={8} to={80} at={0} len={12} size={260} color={C.green} suffix="GB" />
        </div>
      </Pos>
      <AbsoluteFill style={{ background: "#eafff4", opacity: flash, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

const Nobody: React.FC<SceneP> = ({ f, d, o }) => {
  const sw = L(o, "h_swap");
  return (
    <AbsoluteFill>
      <HeroShot f={f} d={d} a="chip.jpg" zoom={[1.0, 1.22]} pan={[0, 0, 120, 40]} origin="50% 55%" sweepAt={12} bloom={0.45} />
      <Embers f={f} color="#35f29a" n={30} opacity={0.7} />
      <LeftShade k={0.8} />
      <Pos x={110} y={200}>
        <Big f={f} at={4} size={84}>
          {"+0 MEMORY CHIPS"}
        </Big>
        <div style={{ height: 24 }} />
        {f >= sw ? (
          <Big f={f} at={sw} size={84} color={C.teal}>
            {"SAME PROCESSOR"}
          </Big>
        ) : null}
      </Pos>
    </AbsoluteFill>
  );
};

const RIG_W1: V3[] = [[10.4, 0.45, 9.2], [10.2, 2.2, 6.2], [7.6, 1.6, 1.8], [6.6, 0.32, -1.2]];
const RIG_W2: V3[] = [[11.6, 0.45, 9.2], [12, 2.8, 5.5], [7.4, 1.8, 2.4], [5.2, 0.3, 0.0]];
const Tools: React.FC<SceneP> = ({ f, d, o }) => {
  const tw = L(o, "h_wires");
  const tc = L(o, "h_chip");
  const tg = L(o, "h_glitch");
  const tt = L(o, "h_tricked");
  const tf = L(o, "h_forever");
  const zap = f >= tg && f < tt ? ((f - tg) % 14 < 3 ? 1 : 0) : 0;
  const unlocked = f >= tt + 20;
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(255,182,72,0.12)" x={70} y={40} />
      <Scene3D rimA="#ffb648" rimB="#28d7ff">
        <Cam pos={mixV([30, 22, 30], [24, 19, 26], ez(f, 0, d))} target={[5, 0, 4]} fov={30} />
        <Card hideCover vrmGlow={zap} smOn={unlocked ? 128 : 70} memGB={unlocked ? 80 : 8} pulse={zap * 0.4} />
        <Glitcher p={[11, 0.2, 10]} led={zap} />
        <Wire pts={RIG_W1} draw={ez(f, tw, tw + 24)} />
        <Wire pts={RIG_W2} draw={ez(f, tw + 8, tw + 32)} color="#b8602c" />
      </Scene3D>
      <Pos x={110} y={110}>
        <ToolTrio f={f} at={[tw, tc, tg]} />
      </Pos>
      {f >= tt ? (
        <Pos x={110} y={420}>
          <Big f={f} at={tt} size={76} color={C.ink}>
            {"TRICKED THE GPU INTO\nUNLOCKING ITSELF"}
          </Big>
        </Pos>
      ) : null}
      {f >= tf ? (
        <Pos x={1400} y={120}>
          <div style={{ transform: `scale(${sp(f, tf, 12)})` }}>
            <Padlock size={200} open={ez(f, tf + 8, tf + 22)} color={f > tf + 12 ? C.green : C.red} shake={f - tf} />
          </div>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const Price: React.FC<SceneP> = ({ f, o }) => {
  const t20 = L(o, "h_20k");
  const tt = L(o, "h_test");
  const tb = L(o, "h_beat");
  const showBench = f >= tt;
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(53,242,154,0.12)" x={50} y={45} />
      <AbsoluteFill style={{ opacity: 1 - ez(f, tt - 4, tt + 8), transform: `scale(${1 - 0.06 * ez(f, tt - 4, tt + 8)})` }}>
        <PriceClash f={f} at={4} at2={t20} />
      </AbsoluteFill>
      {showBench ? (
        <Pos x={360} y={260}>
          <BenchBars
            f={f}
            title="ONE FP16 COMPUTE TEST"
            titleAt={tt}
            max={95}
            bars={[
              { label: "Real A100", v: 72.5, color: C.teal, at: tt + 4 },
              { label: "Unlocked mining card", v: 85.9, color: C.green, at: tb + 4 },
            ]}
          />
          {f >= tb + 26 ? (
            <div style={{ marginTop: 20 }}>
              <Stamp f={f} at={tb + 26} color={C.green} rot={-4} size={72}>
                IT WON.
              </Stamp>
            </div>
          ) : null}
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const PKG_CAM = (f: number, d: number): { pos: V3; target: V3; fov: number } => ({ pos: mixV([5.2, 7.2, 6.4], [2.6, 5.6, 5.0], ez(f, 0, d)), target: [0, 0.2, 0.1], fov: 30 });
const Hidden: React.FC<SceneP> = ({ f, d, o }) => {
  const tn = L(o, "h_never");
  const ts = L(o, "h_sitting");
  const toff = L(o, "h_off");
  const cam = PKG_CAM(f, d);
  // before "sitting": only 8 GB lit; at "sitting": show all stacks lit briefly (present), at "off": back to 8 GB with red
  const present = f >= ts && f < toff ? ez(f, ts, ts + 16) : 0;
  const mem = f >= ts && f < toff ? mix(8, 80, present) : 8;
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(40,215,255,0.14)" x={50} y={50} />
      <Scene3D>
        <Cam pos={cam.pos} target={cam.target} fov={cam.fov} />
        <Ga100 smOn={70} memGB={mem} glow={1} lockedColor="#ff3d52" />
      </Scene3D>
      {f >= tn ? (
        <Pos x={110} y={130}>
          <Big f={f} at={tn} size={92}>
            {"NEVER MISSING."}
          </Big>
        </Pos>
      ) : null}
      {f >= ts && f < toff ? <Callout f={f} at={ts + 4} x={project([2.05, 0.4, 0], cam)[0]} y={project([2.05, 0.4, 0], cam)[1]} dx={-120} dy={190} color={C.teal} title="80 GB of HBM2e" sub="physically on the card" /> : null}
      {f >= toff ? (
        <Pos x={110} y={300}>
          <Stamp f={f} at={toff + 8} color={C.red} rot={-5} size={90}>
            SWITCHED OFF
          </Stamp>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const Title: React.FC<SceneP> = ({ f, d, o }) => {
  const tb = L(o, "h_break");
  const glow = 0.5 + 0.5 * Math.sin(f * 0.15);
  return (
    <AbsoluteFill>
      <HeroShot f={f} d={d} a="hero_red.jpg" b="hero_green.jpg" k={ez(f, 20, 60)} zoom={[1.08, 1.0]} pan={[-60, -40, -120, -80]} origin="60% 50%" sweepAt={50} bloom={0.4 + glow * 0.15} />
      <Embers f={f} color="#35f29a" n={50} />
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(5,7,10,0.9) 0%, rgba(5,7,10,0) 55%)" }} />
      <Pos x={0} w={1920} y={630} style={{ textAlign: "center" }}>
        <Big f={f} at={2} size={118} align="center" glow color={C.ink}>
          {"8GB → 80GB"}
        </Big>
        <div style={{ height: 10 }} />
        <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 40, color: C.mute, opacity: ez(f, 10, 24) }}>How do you switch on something that was switched off forever?</div>
        {f >= tb ? (
          <div style={{ marginTop: 20 }}>
            <Tag f={f} at={tb} color={C.green}>
              Let's break it down
            </Tag>
          </div>
        ) : null}
      </Pos>
    </AbsoluteFill>
  );
};

/* ===================================================================== CH1: the card */
const Meet: React.FC<SceneP> = ({ f, d, o }) => {
  const t21 = L(o, "y2021");
  const tp = L(o, "passive");
  const tn = L(o, "nodisp");
  const tj = L(o, "onejob");
  const tm = L(o, "mining");
  // camera: orbit, then go to the bracket for "no display outputs"
  const toBracket = ez(f, tn - 6, tn + 20) * (1 - ez(f, tj + 10, tj + 30));
  const a = 0.9 + f * 0.003;
  const orbit: V3 = [Math.sin(a) * 32, 12, Math.cos(a) * 32];
  const bracket: V3 = [-36, 10, 13];
  const cam = { pos: mixV(orbit, bracket, toBracket), target: mixV([0, 1.4, 0], [-13.4, 1.6, 0], toBracket) as V3, fov: 30 };
  const bp = project([-13.5, 2.6, 0], cam);
  const sp2 = project([2, 3.9, 0], cam);
  return (
    <AbsoluteFill>
      <BG f={f} />
      <Scene3D>
        <Cam pos={cam.pos} target={cam.target} fov={cam.fov} />
        <Card accentK={0.7} />
        <ContactShadow />
      </Scene3D>
      <Pos x={110} y={110}>
        <Tag f={f} at={4} color={C.teal}>
          NVIDIA CMP 170HX
        </Tag>
        <div style={{ height: 14 }} />
        {f >= t21 ? (
          <Big f={f} at={t21} size={78}>
            {"2021 · SOLD TO\nCRYPTO MINERS"}
          </Big>
        ) : null}
      </Pos>
      <Callout f={f} at={tp} until={tn - 8} x={sp2[0]} y={sp2[1]} dx={180} dy={-160} title="PASSIVE COOLER" sub="no fans of its own" color={C.teal} />
      {f >= tn && f < tj + 20 ? <Callout f={f} at={tn + 14} x={bp[0]} y={bp[1]} dx={220} dy={-180} title="NO DISPLAY OUTPUTS" sub="you can't plug in a monitor" color={C.red} /> : null}
      {f >= tm ? (
        <Pos x={0} w={1920} y={700} style={{ textAlign: "center" }}>
          <Stamp f={f} at={tm} color={C.amber} rot={-3} size={110}>
            MINING ONLY
          </Stamp>
        </Pos>
      ) : null}
      <SourceTag text="3D model: illustration, not the exact board" at={10} until={140} />
    </AbsoluteFill>
  );
};

const Monster: React.FC<SceneP> = ({ f, d, o }) => {
  const tg = L(o, "ga100");
  const ta = L(o, "a100");
  const dive = ez(f, tg - 8, tg + 40);
  const cam = { pos: mixV([16, 22, 20], [1.2, 7.5, 6.2], dive) as V3, target: mixV([0, 2, 0], [-2.2, 0.3, 0], dive) as V3, fov: 30 };
  const die = project([-2.2, 0.4, 0], cam);
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(53,242,154,0.12)" />
      <Scene3D rimA="#35f29a">
        <Cam pos={cam.pos} target={cam.target} fov={cam.fov} />
        <Card explode={ez(f, 4, 40)} hideCover={f > tg - 14} glow={1 + 0.3 * Math.sin(f * 0.2)} />
      </Scene3D>
      <Pos x={110} y={130}>
        <Big f={f} at={6} size={84}>
          {"UNDER THE HEATSINK…"}
        </Big>
      </Pos>
      {f >= tg + 20 ? <Callout f={f} at={tg + 20} x={die[0]} y={die[1]} dx={-260} dy={-200} title="GA100" sub="the chip inside" color={C.green} /> : null}
      {f >= ta ? (
        <Pos x={1150} y={720}>
          <Panel f={f} at={ta} w={660} pad={28} border={`${C.green}88`}>
            <div style={{ fontFamily: MONO, fontSize: 24, color: C.green, letterSpacing: 3 }}>SAME SILICON AS</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 74, color: C.ink }}>NVIDIA A100</div>
            <div style={{ fontFamily: INTER, fontSize: 28, color: C.mute }}>one of the GPUs behind the AI boom</div>
          </Panel>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const Binning: React.FC<SceneP> = ({ f, o }) => {
  const ti = L(o, "imperfect");
  const td = L(o, "defects");
  const ts = L(o, "switchoff");
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(255,182,72,0.10)" x={70} y={50} />
      <Pos x={1120} y={170}>
        <Wafer f={f} at={0} defAt={td} offAt={ts} />
      </Pos>
      <Pos x={110} y={200} w={900}>
        <Big f={f} at={4} size={70} color={C.mute}>
          {"WHY A DATA-CENTRE\nCHIP IN A MINING CARD?"}
        </Big>
        <div style={{ height: 30 }} />
        {f >= ti ? (
          <Big f={f} at={ti} size={96}>
            {"CHIPS AREN'T PERFECT"}
          </Big>
        ) : null}
        <div style={{ height: 30 }} />
        {f >= ts ? (
          <Checks
            f={f}
            size={42}
            items={[
              { t: "Defects → switch parts off", at: ts + 4 },
              { t: "Sell as a cheaper product", at: ts + 40, ok: true },
            ]}
          />
        ) : null}
      </Pos>
    </AbsoluteFill>
  );
};

const Cutdown: React.FC<SceneP> = ({ f, d, o }) => {
  const t128 = L(o, "sm128");
  const t70 = L(o, "sm70");
  const tp = L(o, "pcie");
  const tm = L(o, "mem8");
  const smOn = f < t128 ? 70 : f < t70 + 10 ? mix(70, 128, ez(f, t128, t128 + 20)) : mix(128, 70, ez(f, t70 + 10, t70 + 34));
  const cam = PKG_CAM(f, d);
  const showPcie = f >= tp && f < tm;
  const sm = project([0, 0.1, -1.4], cam);
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(255,61,82,0.10)" />
      <Scene3D rimA="#ff3d52" rimB="#35f29a">
        <Cam pos={showPcie ? mixV(cam.pos, [8, 9, 9], 0.5) : cam.pos} target={cam.target} fov={cam.fov} />
        <Ga100 smOn={smOn} memGB={f >= tm ? 8 : 8} glow={1.1} pulse={f >= tm ? 0.3 * (0.5 + 0.5 * Math.sin(f * 0.3)) : 0} />
      </Scene3D>
      <Pos x={110} y={120}>
        <Tag f={f} at={0} color={C.red}>
          Nvidia didn't switch off a little
        </Tag>
        <div style={{ height: 16 }} />
        {f >= t128 ? (
          <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
            <Roll f={f} from={f < t70 ? 70 : 128} to={f < t70 ? 128 : 70} at={f < t70 ? t128 : t70 + 10} len={20} size={150} color={f >= t70 + 10 ? C.red : C.green} />
            <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 60, color: C.mute }}>/ 128 SMs</span>
          </div>
        ) : null}
      </Pos>
      {f >= t128 && f < tp ? <Callout f={f} at={t128 + 6} x={sm[0]} y={sm[1]} dx={200} dy={-120} title="SM = compute unit" sub="8 clusters × 16" color={C.green} /> : null}
      {showPcie ? (
        <Pos x={110} y={560} w={1200}>
          <Panel f={f} at={tp} w={1180} pad={30}>
            <div style={{ fontFamily: MONO, fontSize: 26, color: C.mute, letterSpacing: 3, marginBottom: 14 }}>LINK TO YOUR PC</div>
            {[
              { k: "PCIe Gen 1 (2003)", w: 0.0625, col: C.red, at: tp + 4 },
              { k: "PCIe Gen 4 (what the chip supports)", w: 1, col: C.green, at: tp + 26 },
            ].map((r) => (
              <div key={r.k} style={{ marginBottom: 14, opacity: ez(f, r.at, r.at + 8) }}>
                <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 30, color: C.ink }}>{r.k}</div>
                <div style={{ height: 34, borderRadius: 8, background: "rgba(255,255,255,0.06)" }}>
                  <div style={{ width: `${Math.max(2, r.w * 100 * ez(f, r.at, r.at + 22))}%`, height: "100%", borderRadius: 8, background: r.col, boxShadow: `0 0 24px ${r.col}` }} />
                </div>
              </div>
            ))}
            <div style={{ fontFamily: INTER, fontSize: 20, color: C.mute }}>Per-lane bandwidth, to scale (Gen 4 ≈ 8× Gen 1 per lane)</div>
          </Panel>
        </Pos>
      ) : null}
      {f >= tm ? (
        <Pos x={110} y={600}>
          <Panel f={f} at={tm} w={880} pad={30} border={`${C.teal}88`}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
              <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 120, color: C.teal }}>8</span>
              <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 50, color: C.mute }}>/ 80 GB usable</span>
            </div>
          </Panel>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const Eth: React.FC<SceneP> = ({ f, o }) => {
  const tp = L(o, "paper");
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(255,61,82,0.10)" x={60} y={40} />
      <Pos x={210} y={260}>
        <CryptoTimeline f={f} at={0} at2022={4} atPaper={tp} />
      </Pos>
      {f >= tp + 10 ? (
        <Pos x={0} w={1920} y={800} style={{ textAlign: "center" }}>
          <Stamp f={f} at={tp + 10} color={C.red} rot={-4} size={96}>
            EXPENSIVE PAPERWEIGHTS
          </Stamp>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

/* ===================================================================== CH2: why 80 GB */
const Today: React.FC<SceneP> = ({ f, o }) => {
  const tl = L(o, "lastvid");
  const ta = L(o, "ai");
  const tm = L(o, "aimem");
  return (
    <AbsoluteFill>
      <Clip f={f} src="chipset_close" d={300} dim={0.55} blur={f >= ta ? 6 : 0} />
      <Shade side="all" k={0.6} />
      {f >= tl && f < ta + 6 ? (
        <Pos x={1050} y={220}>
          <div style={{ width: 720, height: 405, borderRadius: 18, overflow: "hidden", border: `3px solid ${C.teal}`, boxShadow: `0 0 60px ${C.teal}55`, opacity: ez(f, tl, tl + 12), transform: `rotate(2deg) scale(${0.9 + 0.1 * ez(f, tl, tl + 12)})` }}>
            <img src={U("img/ug001_thumb.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div style={{ marginTop: 14, fontFamily: MONO, fontSize: 24, color: C.teal, letterSpacing: 3 }}>LAST VIDEO · GPU & RAM PRICE CRISIS</div>
        </Pos>
      ) : null}
      <Pos x={110} y={200}>
        <Big f={f} at={2} size={70} color={C.mute}>
          {"2026"}
        </Big>
        <div style={{ height: 16 }} />
        <Big f={f} at={8} size={84}>
          {"WHERE IS ALL\nTHE MEMORY GOING?"}
        </Big>
      </Pos>
      {f >= ta ? (
        <Pos x={0} w={1920} y={520} style={{ textAlign: "center" }}>
          <Big f={f} at={ta} size={300} align="center" glow color={C.green}>
            AI
          </Big>
          {f >= tm ? (
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: C.ink, opacity: ez(f, tm, tm + 10) }}>MEMORY IS EVERYTHING</div>
          ) : null}
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const Llm: React.FC<SceneP> = ({ f, o }) => {
  const tg = L(o, "gaming");
  const tl = L(o, "league");
  return (
    <AbsoluteFill>
      {f >= tg - 4 ? <Game src="g3_traffic" dim={0.6} blur={4} /> : <BG f={f} />}
      <Shade side="all" k={0.55} />
      <Pos x={110} y={150} w={700}>
        <Big f={f} at={4} size={74}>
          {"A BIG AI MODEL\nMUST FIT IN VRAM"}
        </Big>
        <div style={{ marginTop: 24, fontFamily: INTER, fontSize: 28, color: C.mute, opacity: ez(f, 12, 24) }}>Model size shown is illustrative.</div>
        {f >= tg ? (
          <div style={{ marginTop: 40 }}>
            <Tag f={f} at={tg} color={C.amber}>
              Your gaming card
            </Tag>
          </div>
        ) : null}
      </Pos>
      <Pos x={940} y={240}>
        <VramFit f={f} at={Math.max(10, tg)} at80={tl} />
      </Pos>
    </AbsoluteFill>
  );
};

const Cost20k: React.FC<SceneP> = ({ f }) => (
  <AbsoluteFill>
    <Clip f={f} src="banknotes" d={180} dim={0.5} />
    <Shade side="left" k={0.9} />
    <Pos x={110} y={300}>
      <Tag f={f} at={2} color={C.green}>
        NVIDIA A100 · 80 GB
      </Tag>
      <div style={{ height: 20 }} />
      <Roll f={f} from={0} to={20000} at={4} len={24} size={190} color={C.green} prefix="$" suffix="+" comma />
      <div style={{ fontFamily: MONO, fontSize: 24, color: C.mute, marginTop: 14, opacity: ez(f, 20, 30) }}>PCIe version · price via Tom's Hardware</div>
    </Pos>
  </AbsoluteFill>
);

const Forgotten: React.FC<SceneP> = ({ f, d, o }) => {
  const tt = L(o, "turnon");
  const on = ez(f, tt, tt + 30);
  const cards: V3[] = [
    [-15, 0, -8],
    [0, 0, -9],
    [15, 0, -8],
    [-15, 0, 6],
    [0, 0, 5],
    [15, 0, 6],
  ];
  return (
    <AbsoluteFill>
      <BG f={f} accent={`rgba(53,242,154,${0.05 + on * 0.15})`} />
      <Scene3D rimA={on > 0.5 ? "#35f29a" : "#5a6677"} rimB="#28d7ff" key1={1.4 + on}>
        <Cam pos={mixV([0, 44, 46], [0, 36, 38], ez(f, 0, d))} target={[0, 0, -1]} fov={34} />
        {cards.map((p, i) => (
          <Card key={i} p={p} r={[0, (i % 3) * 0.12 - 0.12, 0]} s={0.5} accent="#35f29a" accentK={on * (i === 4 ? 1.6 : 1)} memGB={mix(8, 80, on)} smOn={mix(70, 128, on)} glow={0.5 + on} />
        ))}
      </Scene3D>
      <Pos x={110} y={110}>
        <Big f={f} at={4} size={70} color={C.mute}>
          {"FORGOTTEN MINING CARDS"}
        </Big>
        <Big f={f} at={20} size={70}>
          {"SAME CHIP INSIDE"}
        </Big>
      </Pos>
      {f >= tt ? (
        <Pos x={0} w={1920} y={800} style={{ textAlign: "center" }}>
          <Big f={f} at={tt} size={96} align="center" glow color={C.green}>
            WHAT IF WE TURN IT ALL BACK ON?
          </Big>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

/* ===================================================================== CH3: the lock */
const Fuses: React.FC<SceneP> = ({ f, d, o }) => {
  const tw = L(o, "oneway");
  const tb = L(o, "burn");
  const flash = f >= tb && f < tb + 14 ? 1 - (f - tb) / 14 : 0;
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(255,182,72,0.12)" x={50} y={40} />
      <Scene3D rimA="#ffb648" rimB="#28d7ff">
        <Cam pos={mixV([-16, 7, 16], [8, 4.5, 9], ez(f, 0, d))} target={[0, 0, 0]} fov={36} roll={0.05} />
        <FuseField blown={f >= tb ? 0.38 : 0.3} flash={flash} />
      </Scene3D>
      <Pos x={110} y={120}>
        <Roll f={f} from={0} to={16384} at={6} len={30} size={170} color={C.amber} comma />
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, color: C.ink, letterSpacing: 3 }}>TINY ELECTRONIC FUSES</div>
      </Pos>
      {f >= tw ? (
        <Pos x={1150} y={560}>
          <Panel f={f} at={tw} w={650} pad={30} border={`${C.amber}88`}>
            <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
              <svg width={240} height={90} viewBox="0 0 240 90">
                <line x1={0} y1={45} x2={90} y2={45} stroke={C.amber} strokeWidth={8} />
                <line x1={150} y1={45} x2={240} y2={45} stroke={C.amber} strokeWidth={8} />
                {f < tb ? <line x1={90} y1={45} x2={150} y2={45} stroke={C.amber} strokeWidth={8} /> : <circle cx={120} cy={45} r={10 + flash * 30} fill={C.amber} opacity={flash} />}
              </svg>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, color: f >= tb ? C.red : C.ink }}>{f >= tb ? "BURNED FOREVER" : "ONE-WAY SWITCH"}</div>
            </div>
          </Panel>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const OffList: React.FC<SceneP> = ({ f, d, o }) => {
  const tm = L(o, "memoff");
  const tf = L(o, "featoff");
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(255,61,82,0.10)" />
      <Scene3D rimA="#ff3d52">
        <Cam pos={mixV([10, 9, 10], [6, 7, 12], ez(f, 0, d))} target={[0, 0, 0]} fov={38} />
        <FuseField blown={0.38} hiRow={0.3 + 0.2 * Math.floor(Math.max(0, f - 0) / 50)} />
      </Scene3D>
      <Pos x={110} y={200}>
        <Terminal
          f={f}
          at={0}
          w={1100}
          title="fuse map (simplified)"
          lines={[
            { t: "SM 71–128 ............ OFF", at: 2, color: C.red },
            { t: "MEMORY 9–80 GB ....... OFF", at: tm, color: C.red },
            { t: "NVLINK · PCIe GEN 4 .. OFF", at: tf, color: C.red },
          ]}
        />
      </Pos>
    </AbsoluteFill>
  );
};

const Soft64: React.FC<SceneP> = ({ f, o }) => {
  const th = L(o, "hostage");
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(255,182,72,0.10)" />
      <Pos x={260} y={300}>
        <MemBar f={f} at={0} soft={6} />
      </Pos>
      {f >= th ? (
        <Pos x={1300} y={160}>
          <div style={{ transform: `scale(${sp(f, th, 12)})` }}>
            <Padlock size={180} color={C.red} shake={f - th} />
          </div>
        </Pos>
      ) : null}
      {f >= th ? (
        <Pos x={260} y={180}>
          <Big f={f} at={th} size={80} color={C.red}>
            THE REST: HELD HOSTAGE
          </Big>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const Rule: React.FC<SceneP> = ({ f, o }) => {
  const tr = L(o, "restrict");
  const tt = L(o, "takeaway");
  const tg = L(o, "giveback0");
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(40,215,255,0.10)" />
      <Pos x={0} w={1920} y={170} style={{ textAlign: "center" }}>
        <Tag f={f} at={2} color={C.teal}>
          The rule every chip engineer follows
        </Tag>
        <div style={{ height: 30 }} />
        {f >= Math.min(tr, 24) ? (
          <Big f={f} at={Math.min(tr, 24)} size={100} align="center">
            {"BURN A FUSE = MORE LOCKED"}
          </Big>
        ) : null}
      </Pos>
      <Pos x={360} y={520}>
        <Checks
          f={f}
          size={64}
          items={[
            { t: "Take features away", at: tt, ok: true },
            { t: "Give them back", at: tg, ok: false },
          ]}
        />
      </Pos>
    </AbsoluteFill>
  );
};

const Kate: React.FC<SceneP> = ({ f, o }) => {
  const tov = L(o, "override");
  const tb = L(o, "boots");
  const tn = L(o, "newer");
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(40,215,255,0.12)" x={30} y={30} />
      <Pos x={110} y={110}>
        <Panel f={f} at={0} w={820} pad={30} border={`${C.teal}88`}>
          <div style={{ fontFamily: MONO, fontSize: 24, color: C.teal, letterSpacing: 3 }}>SECURITY RESEARCHER</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 86, color: C.ink }}>“KATE”</div>
          <div style={{ fontFamily: MONO, fontSize: 26, color: C.mute }}>blog.kate.land · write-up published Nov 10, 2026</div>
        </Panel>
      </Pos>
      {f < tov + 6 ? (
        <Pos x={110} y={470}>
          <div style={{ opacity: ez(f, 16, 30) * (1 - ez(f, tov - 4, tov + 6)) }}>
            <div style={{ fontFamily: MONO, fontSize: 24, color: C.mute, letterSpacing: 3, marginBottom: 12 }}>HER WRITE-UP</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 70, color: C.ink, lineHeight: 1.1, width: 1500 }}>“Using voltage glitching to unleash the A100 in my mining card”</div>
          </div>
        </Pos>
      ) : null}
      {f >= tov ? (
        <Pos x={300} y={460}>
          <Records f={f} at={tov} newAt={tn} bootAt={tb} />
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const QuoteScene: React.FC<SceneP> = ({ f }) => (
  <AbsoluteFill>
    <BG f={f} accent="rgba(53,242,154,0.12)" x={30} y={40} />
    <Pos x={260} y={250}>
      <Quote f={f} at={4} text="NVIDIA's design allows one to relax restrictions by blowing more fuses!" who="Kate" src="blog.kate.land" hi="relax more fuses" size={76} />
    </Pos>
  </AbsoluteFill>
);

const Problem: React.FC<SceneP> = ({ f, d, o }) => {
  const tp = L(o, "problem");
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(53,242,154,0.12)" />
      <Scene3D rimA="#35f29a">
        <Cam pos={mixV([0, 14, 12], [4, 10, 10], ez(f, 0, d))} target={[0, 0, 0]} fov={36} />
        <FuseField blown={0.38} sweep={ez(f, 4, tp)} />
      </Scene3D>
      <Pos x={110} y={130}>
        <Big f={f} at={4} size={84} color={C.green}>
          {"MORE FUSES =\nFEATURES BACK?"}
        </Big>
      </Pos>
      {f >= tp ? (
        <AbsoluteFill style={{ background: `rgba(5,7,10,${0.65 * ez(f, tp, tp + 10)})`, alignItems: "center", justifyContent: "center" }}>
          <div style={{ transform: `scale(${sp(f, tp + 4, 11)})` }}>
            <Padlock size={260} color={C.red} shake={f - tp - 4} />
          </div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 80, color: C.red, marginTop: 20, opacity: ez(f, tp + 10, tp + 20) }}>SECURITY LOCK: WRITES BLOCKED</div>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* ===================================================================== CH4: the glitch */
const Wild: React.FC<SceneP> = ({ f, o }) => {
  const tc = L(o, "code");
  const te = L(o, "elec");
  const zap = f >= te ? (Math.floor((f - te) / 3) % 3 === 0 ? 1 : 0) * (1 - ez(f, te + 20, te + 40)) : 0;
  return (
    <AbsoluteFill style={{ transform: f >= te ? shake(f, te, 14, 18) : undefined }}>
      <Clip f={f} src="microchip" d={200} dim={0.55} />
      <Shade side="all" k={0.55} />
      <Pos x={0} w={1920} y={300} style={{ textAlign: "center" }}>
        {f >= tc ? (
          <div style={{ display: "inline-block", position: "relative" }}>
            <Big f={f} at={tc} size={150} align="center" color={C.mute}>
              {"</> CODE"}
            </Big>
            <div style={{ position: "absolute", left: -20, right: -20, top: "52%", height: 10, background: C.red, transform: `scaleX(${ez(f, tc + 14, tc + 22)}) rotate(-4deg)`, boxShadow: `0 0 20px ${C.red}` }} />
          </div>
        ) : null}
        {f >= te ? (
          <Big f={f} at={te} size={170} align="center" glow color={C.amber}>
            ⚡ ELECTRICITY
          </Big>
        ) : null}
      </Pos>
      <AbsoluteFill style={{ background: C.amber, opacity: zap * 0.25, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

const Vg: React.FC<SceneP> = ({ f, o }) => {
  const ts = L(o, "stable");
  const td = L(o, "drop");
  const tk = L(o, "skip");
  const dipped = f >= td + 10;
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(53,242,154,0.10)" />
      <Pos x={110} y={100}>
        <Big f={f} at={2} size={96} glow color={C.amber}>
          VOLTAGE GLITCHING
        </Big>
      </Pos>
      <Pos x={110} y={270}>
        <Scope f={f} scan={ez(f, ts - 10, td + 30)} label={dipped ? "CORE VOLTAGE · SPLIT-SECOND DIP" : "CORE VOLTAGE · STABLE"} dips={dipped ? [{ x: 0.72, depth: 0.85 * ez(f, td + 10, td + 16), wd: 0.03 }] : []} w={1100} h={480} />
      </Pos>
      <Pos x={1300} y={330}>
        <Panel f={f} at={td} w={520} pad={30}>
          <div style={{ fontFamily: MONO, fontSize: 24, color: C.mute, letterSpacing: 3, marginBottom: 16 }}>CHIP BOOT SEQUENCE</div>
          {["power on", "security check", "read fuses", "run"].map((s, i) => {
            const skipped = i === 1 && f >= tk;
            return (
              <div key={s} style={{ fontFamily: MONO, fontSize: 34, padding: "8px 0", color: skipped ? C.red : C.ink, textDecoration: skipped ? "line-through" : "none", opacity: f >= td + i * 6 ? 1 : 0.2 }}>
                {i + 1}. {s} {skipped ? <span style={{ fontFamily: INTER, fontWeight: 800, fontSize: 30, color: C.red, textDecoration: "none", marginLeft: 10 }}>SKIPPED</span> : null}
              </div>
            );
          })}
        </Panel>
      </Pos>
    </AbsoluteFill>
  );
};

const Setup: React.FC<SceneP> = ({ f, d, o }) => {
  const tst = L(o, "stm32");
  const t8 = L(o, "costs8");
  const tw = L(o, "wires");
  const tr = L(o, "resistor");
  const tv = L(o, "vrm");
  const tdp = L(o, "dip");
  const phase = f < tw ? 0 : f < tv ? 1 : 2;
  const camA = { pos: [17, 9, 17] as V3, target: [10.5, 0.4, 9.5] as V3, fov: 28 };
  const camB = { pos: [13, 14, 13] as V3, target: [7, 0.2, 3] as V3, fov: 30 };
  const camC = { pos: [11, 9, 6] as V3, target: [6.3, 0.2, -1.4] as V3, fov: 30 };
  const k1 = ez(f, tw - 10, tw + 20);
  const k2 = ez(f, tv - 10, tv + 20);
  const cam = { pos: mixV(mixV(camA.pos, camB.pos, k1), camC.pos, k2), target: mixV(mixV(camA.target, camB.target, k1), camC.target, k2), fov: 30 };
  const zap = f >= tdp ? ((f - tdp) % 12 < 3 ? 1 : 0) : 0;
  const resGone = ez(f, tr + 14, tr + 24);
  const board = project([11, 0.6, 10], cam);
  const ctrl = project([6.6, 0.3, -1.2], cam);
  const res = project([5.6, 0.2, 0.6], cam);
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(40,215,255,0.12)" x={60} y={50} />
      <Scene3D rimA="#28d7ff" rimB="#ffb648">
        <Cam pos={cam.pos} target={cam.target} fov={cam.fov} />
        <Card hideCover vrmGlow={zap + (phase === 2 ? 0.25 : 0)} pulse={zap * 0.3} />
        <Glitcher p={[11, 0.2, 10]} led={zap || (f % 30 < 15 ? 0.3 : 0)} />
        <Wire pts={RIG_W1} draw={ez(f, tw, tw + 30)} />
        <Wire pts={RIG_W2} draw={ez(f, tw + 10, tw + 40)} color="#b8602c" />
        <mesh position={[5.6, 0.14 + resGone * 1.5, 0.6]} scale={1 - resGone}>
          <boxGeometry args={[0.3, 0.1, 0.16]} />
          <meshStandardMaterial color="#222" emissive="#ff3d52" emissiveIntensity={f >= tr ? 2 : 0} />
        </mesh>
      </Scene3D>
      <Pos x={110} y={110}>
        <Big f={f} at={2} size={70}>
          {"HER SETUP"}
        </Big>
      </Pos>
      {phase === 0 && f >= tst ? <Callout f={f} at={tst + 4} x={board[0]} y={board[1]} dx={-300} dy={-200} title="STM32 GLITCHER BOARD" sub={f >= t8 ? "microcontroller ≈ $8" : "designed by Kate"} color={C.teal} /> : null}
      {phase === 1 && f >= tr ? <Callout f={f} at={tr} x={res[0]} y={res[1]} dx={-260} dy={160} title="1 TINY RESISTOR REMOVED" sub="0402 size" color={C.red} /> : null}
      {phase === 1 && f >= tw ? (
        <Pos x={110} y={240}>
          <Tag f={f} at={tw + 4} color={C.amber}>
            2 enamelled wires
          </Tag>
        </Pos>
      ) : null}
      {phase === 2 ? <Callout f={f} at={tv + 16} x={ctrl[0]} y={ctrl[1]} dx={-280} dy={-210} title="CARD'S OWN POWER REGULATOR" sub="now taking orders from the glitcher" color={C.amber} /> : null}
      {f >= tdp ? (
        <Pos x={1220} y={760}>
          <Scope f={f} scan={1} w={560} h={200} noise={0.006} dips={[0.2, 0.5, 0.8].map((x, i) => ({ x, depth: (zap && i === Math.floor(f / 12) % 3 ? 0.8 : 0.5), wd: 0.04 }))} label="VDD" />
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const Timing: React.FC<SceneP> = ({ f, o }) => {
  const tp = L(o, "pulses");
  const t1 = L(o, "onesec");
  const tl = L(o, "missl");
  const tlot = L(o, "misslot");
  const bad = f >= tlot;
  const little = f >= tl && f < tlot;
  return (
    <AbsoluteFill style={{ transform: bad ? shake(f, tlot + 6, 14, 16) : undefined }}>
      <BG f={f} accent={bad ? "rgba(255,61,82,0.16)" : "rgba(255,182,72,0.12)"} />
      <Pos x={110} y={100}>
        <Big f={f} at={2} size={96} color={C.amber}>
          THE TIMING IS INSANE
        </Big>
      </Pos>
      <Pos x={110} y={270}>
        <Scope
          f={f}
          scan={ez(f, 4, tp + 10)}
          w={1700}
          h={420}
          trigger={0.04}
          xLabels={["0 ms", "≈ 1,000 ms"]}
          color={bad ? C.red : C.green}
          label={bad ? "MISSED BY A LOT → CARD WAKES UP CONFUSED" : little ? "MISSED BY A LITTLE → NOTHING HAPPENS" : "3 PULSES · ~2 ms EACH"}
          dips={
            f >= tp
              ? bad
                ? [{ x: 0.5, depth: 0.95, wd: 0.05 }, { x: 0.56, depth: 0.9, wd: 0.04 }]
                : little
                  ? [{ x: 0.9, depth: 0.7, wd: 0.008 }, { x: 0.915, depth: 0.7, wd: 0.008 }, { x: 0.93, depth: 0.7, wd: 0.008 }]
                  : [{ x: 0.945, depth: 0.7, wd: 0.006 }, { x: 0.96, depth: 0.7, wd: 0.006 }, { x: 0.975, depth: 0.7, wd: 0.006 }]
              : []
          }
        />
      </Pos>
      {f >= t1 && !little && !bad ? (
        <Pos x={1300} y={720}>
          <Tag f={f} at={t1} color={C.green} size={30}>
            ≈ 1 second after trigger
          </Tag>
        </Pos>
      ) : null}
      {little ? (
        <Pos x={110} y={740}>
          <Big f={f} at={tl} size={64} color={C.mute}>
            …nothing happens
          </Big>
        </Pos>
      ) : null}
      {bad ? (
        <Pos x={110} y={730}>
          <Stamp f={f} at={tlot + 6} color={C.red} rot={-3} size={80}>
            CONFUSED · UNUSABLE
          </Stamp>
        </Pos>
      ) : null}
      <SourceTag text="Timing from Kate's write-up · graph simplified" at={tp} until={tp + 150} />
    </AbsoluteFill>
  );
};

const Auto: React.FC<SceneP> = ({ f, o }) => {
  const ts = L(o, "sleep");
  const a1 = L(o, "again1");
  const a2 = L(o, "again2");
  const a3 = L(o, "again3");
  const tsb = L(o, "sbc");
  const th = L(o, "hours");
  const speed = f < a1 ? 1 : f < tsb ? 2.2 : 3.5;
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(40,215,255,0.12)" x={30} y={50} />
      <Pos x={140} y={150}>
        <LoopRing f={f} at={Math.max(0, ts - 6)} speed={speed} />
      </Pos>
      <Pos x={950} y={150} w={850}>
        <Big f={f} at={2} size={88}>
          {"SO SHE\nAUTOMATED IT"}
        </Big>
        <div style={{ height: 30 }} />
        {[a1, a2, a3].map((t, i) =>
          f >= t ? (
            <div key={i} style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 64 + i * 14, color: [C.teal, C.green, C.amber][i], opacity: ez(f, t, t + 6), transform: `translateX(${(1 - ez(f, t, t + 8)) * 40}px)` }}>
              AGAIN{"!".repeat(i + 1)}
            </div>
          ) : null,
        )}
        {f >= tsb && f < th ? (
          <div style={{ marginTop: 20 }}>
            <Panel f={f} at={tsb} w={760} pad={26} border={`${C.teal}88`}>
              <div style={{ fontFamily: MONO, fontSize: 24, color: C.teal, letterSpacing: 3 }}>WATCHDOG · SINGLE-BOARD COMPUTER</div>
              <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 38, color: C.ink, marginTop: 6 }}>PC froze? → presses RESET</div>
            </Panel>
          </div>
        ) : null}
        {f >= th ? (
          <div style={{ marginTop: 20 }}>
            <HoursClock f={f} at={th} len={Math.max(30, L(o, "failed") - th - 10)} />
          </div>
        ) : null}
      </Pos>
    </AbsoluteFill>
  );
};

const Unlock: React.FC<SceneP> = ({ f, d, o }) => {
  const tw = L(o, "writes");
  const ts = L(o, "allsm");
  const tm = L(o, "allmem");
  const tfs = L(o, "fullspeed");
  const brk = ez(f, 6, 20);
  const showChip = f >= tw - 10;
  const smOn = f < ts ? 70 : mix(70, 128, ez(f, ts, ts + 22));
  const mem = f < tm ? 8 : mix(8, 80, ez(f, tm, tm + 22));
  const cam = PKG_CAM(f, d);
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(53,242,154,0.14)" />
      {showChip ? (
        <AbsoluteFill style={{ opacity: ez(f, tw - 10, tw + 6) }}>
          <Scene3D rimA="#35f29a" rimB="#28d7ff">
            <Cam pos={cam.pos} target={cam.target} fov={cam.fov} />
            <Ga100 smOn={smOn} memGB={mem} glow={1.2} pulse={f >= tfs ? 0.4 * (1 - ez(f, tfs, tfs + 20)) : 0} />
          </Scene3D>
        </AbsoluteFill>
      ) : null}
      {f < tw + 6 ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 1 - ez(f, tw - 6, tw + 6), background: "rgba(5,7,10,0.85)" }}>
          <Padlock size={300} color={brk > 0.5 ? C.green : C.red} broken={brk} shake={f} />
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, color: C.green, opacity: ez(f, 14, 24), marginTop: 20 }}>THE LOCK FAILED</div>
        </AbsoluteFill>
      ) : null}
      {f >= tw ? (
        <Pos x={110} y={120}>
          <Terminal
            f={f}
            at={tw}
            w={760}
            title="writing new fuse records"
            cps={3}
            lines={[
              { t: "> all SMs ........ ON", at: ts, color: C.green },
              { t: "> all memory ..... ON", at: tm, color: C.green },
              { t: "> full speed ..... ON", at: tfs, color: C.green },
            ]}
          />
        </Pos>
      ) : null}
      {f >= ts ? (
        <Pos x={110} y={600}>
          <div style={{ display: "flex", gap: 110 }}>
            <div>
              <Roll f={f} from={70} to={128} at={ts} len={22} size={110} color={C.green} />
              <div style={{ fontFamily: MONO, fontSize: 26, color: C.mute }}>SMs (max)</div>
            </div>
            {f >= tm ? (
              <div>
                <Roll f={f} from={8} to={80} at={tm} len={22} size={110} color={C.teal} suffix=" GB" />
                <div style={{ fontFamily: MONO, fontSize: 26, color: C.mute }}>memory</div>
              </div>
            ) : null}
          </div>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const Perm: React.FC<SceneP> = ({ f, o }) => {
  const tp = L(o, "perm");
  const tt = L(o, "tailored");
  const tw = L(o, "wrongbit");
  return (
    <AbsoluteFill style={{ transform: f >= tw ? shake(f, tw + 20, 12, 14) : undefined }}>
      <BG f={f} accent="rgba(255,61,82,0.12)" />
      <Pos x={110} y={120}>
        <Big f={f} at={2} size={110} color={C.red}>
          NO UNDO BUTTON
        </Big>
        {f >= tp ? (
          <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 44, color: C.ink, marginTop: 16, opacity: ez(f, tp, tp + 10) }}>Fuses are permanent.</div>
        ) : null}
      </Pos>
      {f >= tt ? (
        <Pos x={110} y={420}>
          <div style={{ display: "flex", gap: 40 }}>
            {[0, 1, 2].map((k) => (
              <Panel key={k} f={f} at={tt + k * 8} w={480} pad={22}>
                <div style={{ fontFamily: MONO, fontSize: 24, color: C.mute, marginBottom: 10 }}>CHIP #{k + 1} · defect map</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(16, 1fr)", gap: 4 }}>
                  {Array.from({ length: 64 }, (_, i) => {
                    const v = Math.sin((i + 1) * (k + 3) * 12.9898) * 43758.5453;
                    const bad = v - Math.floor(v) < 0.08;
                    const wrong = k === 1 && i === 27 && f >= tw + 12;
                    return <div key={i} style={{ height: 22, borderRadius: 3, background: wrong ? C.red : bad ? "#5a2630" : "rgba(53,242,154,0.45)", boxShadow: wrong ? `0 0 20px ${C.red}` : undefined }} />;
                  })}
                </div>
              </Panel>
            ))}
          </div>
          <div style={{ marginTop: 26, fontFamily: INTER, fontWeight: 600, fontSize: 32, color: C.mute, opacity: ez(f, tt + 20, tt + 30) }}>Every chip is different, so every burn must be tailored to it.</div>
        </Pos>
      ) : null}
      {f >= tw + 20 ? (
        <Pos x={1150} y={830}>
          <Stamp f={f} at={tw + 20} color={C.red} rot={-4} size={70}>
            BROKEN FOREVER
          </Stamp>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

/* ===================================================================== CH5: results */
const GRID: V3[] = Array.from({ length: 10 }, (_, i) => [(i % 5) * 9.6 - 19.2, 0, Math.floor(i / 5) * 9 - 4.5] as V3);
const Ten: React.FC<SceneP> = ({ f, d, o }) => {
  const tn = L(o, "nine");
  const t1 = L(o, "one64");
  const cam = { pos: mixV([0, 46, 34], [0, 40, 30], ez(f, 0, d)) as V3, target: [0, 0, 0.5] as V3, fov: 34 };
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(53,242,154,0.12)" />
      <Scene3D rimA="#35f29a" rimB="#28d7ff">
        <Cam pos={cam.pos} target={cam.target} fov={cam.fov} />
        {GRID.map((p, i) => {
          const res = i === 7 ? 64 : 80;
          const at = i === 7 ? t1 : tn + i * 2;
          const on = f >= at ? ez(f, at, at + 14) : 0;
          return <Card key={i} p={p} s={0.32} accent={res === 64 ? "#ffb648" : "#35f29a"} accentK={on * 1.6} memGB={mix(8, res, on)} smOn={mix(70, 124, on)} glow={0.6 + on} r={[0, 0, 0]} />;
        })}
      </Scene3D>
      <Pos x={110} y={70}>
        <Big f={f} at={2} size={74}>
          {"10 CARDS TESTED"}
        </Big>
      </Pos>
      {GRID.map((p, i) => {
        const [x, y] = project([p[0] + 1.6, 2, p[2] + 2.4], cam);
        return <ResultChip key={i} f={f} at={i === 7 ? t1 + 6 : tn + i * 2 + 8} gb={i === 7 ? 64 : 80} x={x} y={y} />;
      })}
      {f >= t1 + 20 ? (
        <Pos x={0} w={1920} y={930} style={{ textAlign: "center" }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, color: C.ink, opacity: ez(f, t1 + 20, t1 + 30) }}>
            <span style={{ color: C.green }}>9 × 80 GB</span> · <span style={{ color: C.amber }}>1 × 64 GB</span>
          </div>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const Specs: React.FC<SceneP> = ({ f, o }) => {
  const ta = L(o, "a100108");
  const tg = L(o, "gen4");
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(53,242,154,0.10)" />
      <Pos x={180} y={150} w={1560}>
        <StatRow f={f} at={4} label="SMs ON" from="70" to="120–128" note="depends on the chip" />
        {f >= ta ? (
          <div style={{ padding: "18px 0 18px 300px", fontFamily: INTER, fontWeight: 700, fontSize: 40, color: C.teal, opacity: ez(f, ta, ta + 10) }}>
            Real A100 ships with <span style={{ fontFamily: MONO, fontSize: 54 }}>108</span> SMs on
          </div>
        ) : null}
        <StatRow f={f} at={tg} label="PCIe" from="Gen 1" to="Gen 4" note="with a small capacitor mod" />
      </Pos>
    </AbsoluteFill>
  );
};

const NvLink: React.FC<SceneP> = ({ f, d }) => {
  const on = ez(f, 20, 40);
  const a = 0.6 + f * 0.004;
  const cam = { pos: [Math.sin(a) * 46, 18, Math.cos(a) * 46] as V3, target: [0, -1, 1.5] as V3, fov: 30 };
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(53,242,154,0.14)" />
      <Scene3D rimA="#35f29a">
        <Cam pos={cam.pos} target={cam.target} fov={cam.fov} />
        <Card p={[0, 0, -3]} r={[Math.PI / 2, 0, 0]} accentK={on} memGB={80} smOn={124} />
        <Card p={[0, 0, 3.6]} r={[Math.PI / 2, 0, 0]} accentK={on} memGB={80} smOn={124} />
        <Bridge a={[3, 6.0, -1.2]} b={[3, 6.0, 5.4]} on={on} t={f} />
        <ContactShadow p={[0, -6.4, 1]} w={40} d={24} />
      </Scene3D>
      <Pos x={110} y={110}>
        <Big f={f} at={2} size={96} glow color={C.green}>
          NVLINK: ALIVE
        </Big>
        <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 34, color: C.mute, marginTop: 10, opacity: ez(f, 14, 24) }}>Two GPUs working as one (board mod needed)</div>
      </Pos>
      {f >= 40 ? (
        <Pos x={110} y={820}>
          <Tag f={f} at={40} color={C.green}>
            nvidia-smi topo: GPU0 ↔ NV12 ↔ GPU1
          </Tag>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const Bench: React.FC<SceneP> = ({ f, o }) => {
  const ta = L(o, "a100score");
  const ts = L(o, "soft50");
  const th = L(o, "v859");
  const tp = L(o, "pct18");
  const tv = L(o, "vllm");
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(53,242,154,0.12)" />
      <Pos x={110} y={100}>
        <Big f={f} at={2} size={84}>
          THE BENCHMARK
        </Big>
      </Pos>
      <Pos x={110} y={260}>
        <BenchBars
          f={f}
          w={1300}
          max={95}
          title="FP16 COMPUTE · OPENCL · HIGHER IS BETTER"
          titleAt={ta}
          bars={[
            { label: "Real A100", sub: "retail", v: 72.5, color: C.teal, at: ta + 10 },
            { label: "Mining card", sub: "software unlock", v: 50.1, color: C.amber, at: ts + 6 },
            { label: "Mining card", sub: "hardware unlock", v: 85.9, color: C.green, at: th - 10 },
          ]}
        />
      </Pos>
      {f >= tp ? (
        <Pos x={1480} y={300}>
          <div style={{ transform: `scale(${sp(f, tp, 11)})`, textAlign: "center" }}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 150, color: C.green, textShadow: `0 0 60px ${C.green}88` }}>+18%</div>
            <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 30, color: C.ink }}>vs the $20,000 GPU</div>
          </div>
        </Pos>
      ) : null}
      {f >= tv ? (
        <Pos x={1440} y={620}>
          <Checks
            f={f}
            size={40}
            items={[
              { t: "vLLM runs", at: tv + 10, ok: true },
              { t: "SGLang runs", at: tv + 22, ok: true },
            ]}
          />
        </Pos>
      ) : null}
      <SourceTag text="Kate's own benchmark · 1 test · not independently verified" at={ta} until={tv + 120} />
    </AbsoluteFill>
  );
};

/* ===================================================================== CH6: reality check */
const Honest: React.FC<SceneP> = ({ f, o }) => {
  const t1 = L(o, "first");
  const tv = L(o, "verify");
  const th = L(o, "heat");
  return (
    <AbsoluteFill>
      <Clip f={f} src="phone_shop" d={500} dim={0.6} blur={f >= t1 ? 8 : 0} />
      <Shade side="all" k={0.6} />
      <Pos x={110} y={110}>
        <Big f={f} at={2} size={90}>
          {"BEFORE YOU RUN TO EBAY…"}
        </Big>
      </Pos>
      {f >= t1 ? (
        <Pos x={110} y={330}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.amber, letterSpacing: 4, marginBottom: 20, opacity: ez(f, t1, t1 + 8) }}>1 · THE NUMBER</div>
          <Checks
            f={f}
            size={50}
            items={[
              { t: "One benchmark, one researcher", at: t1 + 10 },
              { t: "Not independently verified", at: tv, ok: false },
              { t: "Heat on a passive cooler? Long-term stability?", at: th },
            ]}
          />
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const Second: React.FC<SceneP> = ({ f, o }) => {
  const ts = L(o, "solder");
  const tn = L(o, "nohelp");
  return (
    <AbsoluteFill>
      <Clip f={f} src="pen_chip" d={450} dim={0.55} />
      <Shade side="left" k={0.92} />
      <Pos x={110} y={110}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.amber, letterSpacing: 4, marginBottom: 14 }}>2 · NOT DOWNLOAD-AND-PLAY</div>
        <Checks
          f={f}
          size={46}
          items={[
            { t: "Soldering", at: ts + 4 },
            { t: "Custom hardware", at: ts + 22 },
            { t: "Hours of glitching", at: ts + 44 },
            { t: "Settings unique to every chip", at: ts + 70 },
          ]}
        />
      </Pos>
      {f >= tn ? (
        <Pos x={110} y={720} w={1500}>
          <Panel f={f} at={tn} w={1400} pad={26} border={`${C.amber}88`}>
            <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 38, color: C.ink }}>“Please note that I cannot provide assistance in unlocking your or someone else's GPU!”</div>
            <div style={{ fontFamily: MONO, fontSize: 22, color: C.mute, marginTop: 10 }}>— Kate, blog.kate.land</div>
          </Panel>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const Third: React.FC<SceneP> = ({ f, o }) => {
  const tn = L(o, "nodisp2");
  const td = L(o, "device");
  const cam = { pos: [-34, 10, 15] as V3, target: [-11, 1.6, 0] as V3, fov: 30 };
  const bp = project([-13.5, 2.6, 0], cam);
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(255,61,82,0.10)" />
      <AbsoluteFill style={{ opacity: 1 - ez(f, td - 6, td + 6) }}>
        <Scene3D rimA="#ff3d52">
          <Cam pos={mixV(cam.pos, [-32, 9, 18], ez(f, 0, 150))} target={cam.target} fov={cam.fov} />
          <Card accentK={0.5} />
        </Scene3D>
        <Pos x={110} y={110}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.amber, letterSpacing: 4, marginBottom: 14 }}>3 · STILL NOT A GAMING CARD</div>
        </Pos>
        {f >= tn ? <Callout f={f} at={tn} x={bp[0]} y={bp[1]} dx={260} dy={-160} title="NO DISPLAY OUTPUTS" sub="nothing to plug a monitor into" color={C.red} /> : null}
      </AbsoluteFill>
      {f >= td - 6 ? (
        <Pos x={160} y={250}>
          <Terminal
            f={f}
            at={td - 6}
            w={1600}
            title="nvidia-smi (recreated from Kate's write-up)"
            cps={4}
            lines={[
              { t: "$ nvidia-smi --query-gpu=name,memory.total", at: td - 4, color: C.mute },
              { t: "name                    memory.total", at: td + 14, color: C.mute },
              { t: "NVIDIA Graphics Device  81920 MiB", at: td + 22, color: C.green },
              { t: "NVIDIA Graphics Device  81920 MiB", at: td + 30, color: C.green },
            ]}
          />
          <div style={{ marginTop: 24, fontFamily: INTER, fontWeight: 700, fontSize: 40, color: C.ink, opacity: ez(f, td + 40, td + 50) }}>
            Not “A100”. Just <span style={{ color: C.green }}>NVIDIA Graphics Device</span>.
          </div>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const Nvidia: React.FC<SceneP> = ({ f, o }) => {
  const tr = L(o, "reported");
  const ta = L(o, "another");
  const tn = L(o, "nocomment");
  const tt = L(o, "toms");
  const steps = [
    { t: "Kate reports the flaw to NVIDIA product security", at: tr + 4, col: C.teal },
    { t: "Another researcher had found it independently", at: ta + 4, col: C.amber },
    { t: "NVIDIA: no public comment so far", at: tn + 4, col: C.mute },
    { t: "Tom's Hardware: used card prices expected to climb", at: tt + 4, col: C.green },
  ];
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(40,215,255,0.10)" />
      <Pos x={110} y={110}>
        <Big f={f} at={2} size={100}>
          {"AND NVIDIA?"}
        </Big>
      </Pos>
      <Pos x={160} y={330}>
        <div style={{ position: "relative", paddingLeft: 60 }}>
          <div style={{ position: "absolute", left: 18, top: 10, width: 4, height: 440 * ez(f, tr, tt + 30), background: "rgba(255,255,255,0.2)" }} />
          {steps.map((s, i) =>
            f >= s.at ? (
              <div key={i} style={{ position: "relative", marginBottom: 46, opacity: ez(f, s.at, s.at + 10), transform: `translateX(${(1 - ez(f, s.at, s.at + 12)) * 40}px)` }}>
                <div style={{ position: "absolute", left: -54, top: 10, width: 28, height: 28, borderRadius: 14, background: s.col, boxShadow: `0 0 20px ${s.col}` }} />
                <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 46, color: C.ink }}>{s.t}</div>
              </div>
            ) : null,
          )}
        </div>
      </Pos>
      {f >= tt + 10 ? (
        <Pos x={1550} y={700}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 200, color: C.green, transform: `translateY(${(1 - sp(f, tt + 10, 12)) * 80}px)`, opacity: ez(f, tt + 10, tt + 18) }}>↗</div>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

/* ===================================================================== CH7: what it means + outro */
const Mean: React.FC<SceneP> = ({ f, o }) => {
  const ts = L(o, "switchon");
  const tn = L(o, "normal");
  const tiers = [
    { n: "A100 80GB", on: 108, col: C.green },
    { n: "CMP 170HX", on: 70, col: C.amber },
  ];
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(53,242,154,0.10)" />
      <Pos x={110} y={110} w={1700}>
        <Big f={f} at={4} size={80}>
          {"NOT LIMITED BY WHAT'S INSIDE…"}
        </Big>
        {f >= ts ? (
          <Big f={f} at={ts} size={80} color={C.green}>
            {"…BUT BY WHAT'S SWITCHED ON"}
          </Big>
        ) : null}
      </Pos>
      <Pos x={160} y={430}>
        <div style={{ fontFamily: MONO, fontSize: 26, color: C.mute, letterSpacing: 3, marginBottom: 20, opacity: ez(f, ts, ts + 10) }}>SAME GA100 DIE · DIFFERENT SWITCHES (SMs ON OF 128)</div>
        {tiers.map((t, i) => {
          const at = ts + 10 + i * 12;
          if (f < at) return null;
          return (
            <div key={t.n} style={{ display: "flex", alignItems: "center", gap: 30, marginBottom: 26, opacity: ez(f, at, at + 10) }}>
              <div style={{ width: 360, fontFamily: DISPLAY, fontWeight: 700, fontSize: 54, color: C.ink }}>{t.n}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(32, 1fr)", gap: 4, width: 1040 }}>
                {Array.from({ length: 128 }, (_, k) => (
                  <div key={k} style={{ height: 14, borderRadius: 2, background: k < t.on * ez(f, at, at + 24) ? t.col : "rgba(255,255,255,0.08)" }} />
                ))}
              </div>
            </div>
          );
        })}
        {f >= tn ? (
          <div style={{ marginTop: 30 }}>
            <Tag f={f} at={tn} color={C.teal} size={30}>
              Cutting down chips is normal: it's how imperfect silicon gets sold
            </Tag>
          </div>
        ) : null}
      </Pos>
    </AbsoluteFill>
  );
};

const Bigger: React.FC<SceneP> = ({ f, d, o }) => {
  const tj = L(o, "junk");
  const on = ez(f, tj + 20, tj + 60);
  const a = 2.0 + f * 0.004;
  return (
    <AbsoluteFill>
      <BG f={f} accent={`rgba(53,242,154,${0.06 + 0.12 * on})`} />
      <Scene3D rimA={on > 0.5 ? "#35f29a" : "#5a6677"} rimB="#ffb648">
        <Cam pos={[Math.sin(a) * mix(42, 34, ez(f, 0, d)), 22, Math.cos(a) * mix(42, 34, ez(f, 0, d))]} target={[0, 2.5, 0]} fov={30} />
        <Card explode={on * 0.7} accentK={on * 1.5} memGB={mix(8, 80, on)} smOn={mix(70, 128, on)} glow={0.6 + on} />
        <ContactShadow />
      </Scene3D>
      <Pos x={110} y={110}>
        <Big f={f} at={4} size={70} color={C.mute}>
          {"THROWN AWAY AS CRYPTO JUNK"}
        </Big>
      </Pos>
      {f >= tj + 20 ? (
        <Pos x={0} w={1920} y={760} style={{ textAlign: "center" }}>
          <Big f={f} at={tj + 20} size={104} align="center" glow color={C.green}>
            A $20,000 AI GPU HIDING INSIDE
          </Big>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const World: React.FC<SceneP> = ({ f, d, o }) => {
  const tt = L(o, "trick");
  const rows = Array.from({ length: 7 }, (_, i) => i);
  return (
    <AbsoluteFill>
      {f < tt ? <Clip f={f} src="mobo_zoom" d={tt} dim={0.55} /> : <BG f={f} accent="rgba(53,242,154,0.14)" />}
      {f < tt ? <Shade side="all" k={0.5} /> : null}
      {f < tt ? (
        <Pos x={110} y={300}>
          <Big f={f} at={4} size={84}>
            {"AI IS SWALLOWING\nEVERY GIGABYTE"}
          </Big>
          <div style={{ marginTop: 20 }}>
            <Tag f={f} at={40} color={C.red}>
              RAM & GPU prices → through the roof
            </Tag>
          </div>
        </Pos>
      ) : (
        <>
          <Scene3D rimA="#35f29a">
            <Cam pos={mixV([-26, 30, 34], [26, 30, 34], ez(f, tt, d))} target={[0, 0, 0]} fov={34} />
            {rows.map((p, i) => {
              const on = ez(f, tt + 10 + i * 8, tt + 24 + i * 8);
              return <Card key={i} p={[0, 0, (i - 3) * 5.2]} s={0.45} accentK={on * 1.5} memGB={mix(8, 80, on)} smOn={mix(70, 128, on)} glow={0.5 + on} />;
            })}
          </Scene3D>
          <Pos x={0} w={1920} y={110} style={{ textAlign: "center" }}>
            <Big f={f} at={tt + 4} size={84} align="center">
              {"OLD MINING CARDS → 80 GB AI MACHINES"}
            </Big>
          </Pos>
        </>
      )}
    </AbsoluteFill>
  );
};

const TellMe: React.FC<SceneP> = ({ f, o }) => {
  const tr = L(o, "risky");
  const tc = L(o, "comments");
  return (
    <AbsoluteFill>
      <BG f={f} accent="rgba(40,215,255,0.14)" />
      <Pos x={0} w={1920} y={150} style={{ textAlign: "center" }}>
        <Big f={f} at={2} size={96} align="center">
          WOULD YOU TRY THIS?
        </Big>
      </Pos>
      <Pos x={260} y={420}>
        <div style={{ display: "flex", gap: 80 }}>
          {[
            { k: "A", t: "Buy a mining card & mod it", col: C.green, at: 10 },
            { k: "B", t: "Way too risky", col: C.red, at: tr },
          ].map((it) =>
            f >= it.at ? (
              <div key={it.k} style={{ width: 620, padding: "36px 40px", borderRadius: 26, border: `3px solid ${it.col}`, background: "rgba(8,11,15,0.88)", boxShadow: `0 0 60px ${it.col}44`, transform: `scale(${sp(f, it.at, 12)})` }}>
                <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 90, color: it.col }}>{it.k}</div>
                <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 48, color: C.ink }}>{it.t}</div>
              </div>
            ) : (
              <div key={it.k} style={{ width: 620 }} />
            ),
          )}
        </div>
      </Pos>
      {f >= tc ? (
        <Pos x={0} w={1920} y={830} style={{ textAlign: "center" }}>
          <Tag f={f} at={tc} color={C.teal} size={34}>
            💬 Tell me in the comments
          </Tag>
        </Pos>
      ) : null}
    </AbsoluteFill>
  );
};

const Outro: React.FC<SceneP> = ({ f }) => (
  <AbsoluteFill>
    <BG f={f} accent="rgba(40,215,255,0.12)" x={30} y={45} />
    <EndScreen f={f} at={4} />
  </AbsoluteFill>
);

/* ===================================================================== timeline */
type Block = { id: string; from: number; to: number; C: React.FC<SceneP>; ch?: [number, string] };
const mk = (id: string, from: number, to: number, C: React.FC<SceneP>, ch?: [number, string]): Block => ({ id, from, to, C, ch });
const BLOCKS: Block[] = [
  mk("hook8", 0, c("h_80"), Hook8),
  mk("hook80", c("h_80"), c("h_nobody"), Hook80),
  mk("nobody", c("h_nobody"), c("h_one"), Nobody),
  mk("tools", c("h_one"), c("h_price"), Tools),
  mk("price", c("h_price"), c("h_crazy"), Price),
  mk("hidden", c("h_crazy"), c("h_how"), Hidden),
  mk("title", c("h_how"), c("meet"), Title),
  mk("meet", c("meet"), c("monster"), Meet, [1, "THE CARD NOBODY WANTED"]),
  mk("monster", c("monster"), c("why"), Monster),
  mk("binning", c("why"), c("little"), Binning),
  mk("cutdown", c("little"), c("eth"), Cutdown),
  mk("eth", c("eth"), c("today"), Eth),
  mk("today", c("today"), c("llm"), Today, [2, "WHY 80 GB MATTERS"]),
  mk("llm", c("llm"), c("cost20k"), Llm),
  mk("cost20k", c("cost20k"), c("forgotten"), Cost20k),
  mk("forgotten", c("forgotten"), c("lock"), Forgotten),
  mk("fuses", c("lock"), c("smoff"), Fuses, [3, "THE LOCK"]),
  mk("offlist", c("smoff"), c("soft64"), OffList),
  mk("soft64", c("soft64"), c("rule"), Soft64),
  mk("rule", c("rule"), c("kate"), Rule),
  mk("kate", c("kate"), c("quote"), Kate),
  mk("quote", c("quote"), c("giveback"), QuoteScene),
  mk("problem", c("giveback"), c("wild"), Problem),
  mk("wild", c("wild"), c("vg"), Wild, [4, "THE GLITCH"]),
  mk("vg", c("vg"), c("setup"), Vg),
  mk("setup", c("setup"), c("timing"), Setup),
  mk("timing", c("timing"), c("auto"), Timing),
  mk("auto", c("auto"), c("failed"), Auto),
  mk("unlock", c("failed"), c("noundo"), Unlock),
  mk("perm", c("noundo"), c("work"), Perm),
  mk("ten", c("work"), c("smjump"), Ten, [5, "DID IT WORK?"]),
  mk("specs", c("smjump"), c("nvlink"), Specs),
  mk("nvlink", c("nvlink"), c("bench"), NvLink),
  mk("bench", c("bench"), c("honest"), Bench),
  mk("honest", c("honest"), c("second"), Honest, [6, "REALITY CHECK"]),
  mk("second", c("second"), c("third"), Second),
  mk("third", c("third"), c("nvidia"), Third),
  mk("nvidia", c("nvidia"), c("mean"), Nvidia),
  mk("mean", c("mean"), c("bigger"), Mean, [7, "WHAT IT MEANS"]),
  mk("bigger", c("bigger"), c("world"), Bigger),
  mk("world", c("world"), c("tellme"), World),
  mk("tellme", c("tellme"), c("missed"), TellMe),
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
  // file, from, to, level
  ["c5_twist", 0, c("meet"), 0.3],
  ["c2_ram", c("meet"), c("today"), 0.3],
  ["c3_ai", c("today"), c("lock"), 0.3],
  ["c7_bf", c("lock"), c("wild"), 0.32],
  ["c4_msrp", c("wild"), c("work"), 0.3],
  ["c6_regions", c("work"), c("honest"), 0.3],
  ["c8_advice", c("honest"), c("mean"), 0.3],
  ["c9_outro", c("mean"), TOTAL_FRAMES, 0.3],
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
  [c("h_8"), S3("tick"), 0.3],
  [c("h_80") - 2, S3("sub_boom"), 0.75],
  [c("h_80"), BIG, 0.5],
  [c("h_nobody") + 4, S3("click"), 0.35],
  [c("h_swap"), S3("click"), 0.35],
  [c("h_wires"), S3("pulse"), 0.3],
  [c("h_chip"), S3("pulse"), 0.3],
  [c("h_glitch"), S3("zap"), 0.4],
  [c("h_forever") + 12, S3("lock"), 0.5],
  [c("h_20k"), IMP, 0.45],
  [c("h_beat") + 26, DEEP, 0.45],
  [c("h_off") + 8, S3("power_down"), 0.5],
  [c("h_how"), S3("riser"), 0.25],
  [c("mining"), IMP, 0.45],
  [c("ga100") + 20, S3("beep"), 0.3],
  [c("sm128"), S3("power_up"), 0.35],
  [c("sm70") + 10, S3("power_down"), 0.45],
  [c("paper") + 10, DEEP, 0.45],
  [c("ai"), BIG, 0.45],
  [c("league"), S3("power_up"), 0.3],
  [c("cost20k") + 4, S3("tick"), 0.3],
  [c("turnon"), S3("power_up"), 0.4],
  [c("burn"), S3("fuse_pop"), 0.55],
  [c("smoff") + 2, S3("click"), 0.3],
  [c("memoff"), S3("click"), 0.3],
  [c("featoff"), S3("click"), 0.3],
  [c("hostage"), S3("lock"), 0.5],
  [c("giveback0"), IMP, 0.35],
  [c("newer"), S3("beep"), 0.3],
  [c("problem") + 4, S3("lock"), 0.55],
  [c("elec"), S3("zap"), 0.6],
  [c("drop") + 10, S3("pulse"), 0.45],
  [c("skip"), S3("zap"), 0.4],
  [c("wires"), S3("click"), 0.3],
  [c("resistor") + 14, S3("click"), 0.35],
  ...[0, 12, 24, 36, 48, 60, 72].map((k) => [c("dip") + k, S3("pulse"), 0.22] as Sfx),
  ...[0, 4, 8].map((k) => [c("pulses") + 30 + k, S3("pulse"), 0.4] as Sfx),
  [c("misslot") + 6, S3("power_down"), 0.5],
  [c("again1"), S3("thump"), 0.5],
  [c("again2"), S3("thump"), 0.55],
  [c("again3"), S3("thump"), 0.6],
  [c("sbc"), S3("click"), 0.35],
  [c("failed") + 8, S3("fuse_pop"), 0.6],
  [c("failed") + 10, BIG, 0.5],
  [c("allsm"), S3("power_up"), 0.4],
  [c("allmem"), S3("power_up"), 0.4],
  [c("fullspeed"), S3("beep"), 0.35],
  [c("wrongbit") + 20, DEEP, 0.5],
  ...Array.from({ length: 10 }, (_, i) => [i === 7 ? c("one64") + 6 : c("nine") + i * 2 + 8, S3("tick"), 0.35] as Sfx),
  [c("nvlink") + 20, S3("power_up"), 0.35],
  [c("pct18"), IMP, 0.45],
  [c("verify"), S3("click"), 0.3],
  [c("nohelp"), S3("click"), 0.3],
  [c("device") + 22, S3("beep"), 0.3],
  [c("toms") + 10, IMP, 0.35],
  [c("junk") + 20, S3("power_up"), 0.45],
  [c("trick") + 4, S3("riser"), 0.25],
];

const Mix: React.FC = () => (
  <>
    <Audio src={U("audio/narration.mp3")} volume={1} />
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
      <div style={{ width: `${(f / TOTAL_FRAMES) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.teal}, ${C.green})` }} />
      {CHAPTER_AT.map((a) => (
        <div key={a} style={{ position: "absolute", left: `${(a / TOTAL_FRAMES) * 100}%`, top: 0, width: 3, height: 5, background: C.bg }} />
      ))}
    </div>
  );
};

export const UgThree: React.FC<{ audio?: boolean }> = ({ audio = true }) => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    {BLOCKS.map((b) => (
      <Sequence key={b.id} from={b.from} durationInFrames={b.to - b.from + XF} name={b.id}>
        <Host b={b} />
      </Sequence>
    ))}
    {[c("h_80"), ...CHAPTER_AT].map((a) => (
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

/** QC sheet: frames from every block. Register with the full duration and render frames 0..N-1. */
const SAMPLES = BLOCKS.flatMap((b) => {
  const d = b.to - b.from;
  return [0.25, 0.6, 0.92].map((p) => b.from + Math.floor(d * p));
});
export const UG003_SHEET_FRAMES = SAMPLES.length;
export const UgThreeSheet: React.FC = () => {
  const f = useCurrentFrame();
  const t = SAMPLES[Math.min(f, SAMPLES.length - 1)];
  return (
    <AbsoluteFill>
      <Freeze frame={t}>
        <UgThree audio={false} />
      </Freeze>
      <div style={{ position: "absolute", right: 10, top: 10, padding: "4px 10px", background: "#ff0", color: "#000", fontFamily: MONO, fontSize: 22, fontWeight: 800 }}>
        {Math.floor(t / 1800)}:{String(Math.floor((t / 30) % 60)).padStart(2, "0")} · f{t}
      </div>
    </AbsoluteFill>
  );
};
