/**
 * UG-002 "GTA 6 on Mobile? I Tried EVERY Method" — full film.
 * Timeline is driven by the narration word cues in ug002.data.ts (tools/gen_data.py).
 * Footage: friend's GTA 6 gameplay (used with permission, no credit requested) + the creator's own Xbox app recording.
 */
import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Freeze, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Badge, Chip, Head, Kicker, pr, sp, Stage, Stamp } from "../ug/blocks";
import { Captions, clamp, Glitch, Grain, shake, Vignette, type Phrase } from "../ug/fx";
import { C, DISPLAY, INTER, MONO } from "../ug/theme";
import { inputAt, type Btn, type InputTrack } from "./Controller";
import {
  CloudConsoleOnly,
  IfInstalled,
  LowerThird,
  MethodCard,
  Platforms,
  PriceCard,
  RedFlags,
  RemotePlayDiagram,
  ScamTypes,
  SearchHook,
  SubscribeNudge,
  VerdictBoard,
  type Verdict,
} from "./Gfx";
import { PhoneLandscape } from "./PhoneCloud";
import { CAPTIONS, CUE, MOTION, TOTAL_FRAMES, VO_FRAMES, VOX } from "./ug002.data";

export const UG002_FRAMES = TOTAL_FRAMES;
const S = (p: string) => staticFile(`ug-002/${p}`);
const XF = 6; // cross-fade frames between scenes
const c = (k: string) => CUE[k];

/* ------------------------------------------------------------ footage */
const LEN: Record<string, number> = { g1_pickup: 16, g2_fight: 40, g3_traffic: 40, g4_highway: 24, g5_bridge_beach: 40, g6_docks: 17, g7a_phone: 10, g7b_phone: 12, g7c_phone: 12, g8_safe: 10 };
/** Gameplay clip; slows down (min 0.6×) rather than running out inside a scene. */
const Game: React.FC<{ src: string; d: number; from?: number; zoom?: [number, number]; dim?: number; blur?: number; vol?: number }> = ({ src, d, from = 0, zoom = [1.0, 1.06], dim = 0, blur = 0, vol = 0 }) => {
  const f = useCurrentFrame();
  const avail = (LEN[src] ?? 10) - from - 0.1;
  const rate = Math.max(0.6, Math.min(1, avail / Math.max(0.1, d / 30)));
  const z = interpolate(f, [0, Math.max(1, d)], zoom, clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${z})` }}>
        <OffthreadVideo
          src={S(`footage/${src}.mp4`)}
          muted={vol === 0}
          volume={vol}
          trimBefore={Math.round(from * 30)}
          playbackRate={rate}
          style={{ width: "100%", height: "100%", objectFit: "cover", filter: `brightness(${1 - dim}) blur(${blur}px) saturate(1.05) contrast(1.04)` }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** A timed phase inside a scene: children get a local frame (and their video starts) at `a`. */
const PhaseInner: React.FC<{ d: number; children: (f: number, d: number) => React.ReactNode }> = ({ d, children }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ opacity: pr(f, 0, XF) }}>{children(f, d)}</AbsoluteFill>;
};
const Phase: React.FC<{ a: number; b: number; children: (f: number, d: number) => React.ReactNode }> = ({ a, b, children }) => (
  <Sequence from={a} durationInFrames={Math.max(1, b - a + XF)} layout="none">
    <PhaseInner d={b - a}>{children}</PhaseInner>
  </Sequence>
);

/* ------------------------------------------------------------ Xbox app recording in a portrait phone */
type Box = { x: number; y: number; w: number; h: number; at: number; color?: string };
const XC_RATIO = 720 / 1608;
/** freeze = hold one moment of the recording (seconds); otherwise play it from `from` at `rate`. */
const XcPhone: React.FC<{ f: number; freeze?: number; from?: number; rate?: number; boxes?: Box[]; zoomAt?: number; zoomK?: number; focusY?: number; x?: number; dim?: number }> = ({
  f,
  freeze,
  from = 0,
  rate = 1,
  boxes = [],
  zoomAt,
  zoomK = 1.6,
  focusY = 0.5,
  x = 560,
  dim = 0,
}) => {
  const H = 940;
  const W = Math.round(H * XC_RATIO);
  const inA = sp(f, 0, 16);
  const z = zoomAt === undefined ? 0 : pr(f, zoomAt, zoomAt + 18);
  const k = 1 + z * (zoomK - 1);
  const vid = <OffthreadVideo src={S("footage/xcloud.mp4")} muted trimBefore={Math.round(from * 30)} playbackRate={rate} style={{ width: W, height: H, objectFit: "cover", display: "block" }} />;
  return (
    <div style={{ position: "absolute", left: x - W / 2 - 14, top: (1080 - H) / 2 - 14, opacity: Math.min(1, inA * 1.4), transform: `translateY(${(1 - inA) * 60}px) scale(${k})`, transformOrigin: `50% ${focusY * 100}%` }}>
      <div style={{ padding: 14, borderRadius: 54, background: "linear-gradient(135deg,#2a2f36,#0b0d10)", boxShadow: "0 50px 120px rgba(0,0,0,0.75), inset 0 0 0 2px rgba(255,255,255,0.08)" }}>
        <div style={{ position: "relative", width: W, height: H, borderRadius: 42, overflow: "hidden", background: "#000" }}>
          {freeze !== undefined ? <Freeze frame={Math.round(freeze * 30)}>{vid}</Freeze> : vid}
          <AbsoluteFill style={{ background: `rgba(0,0,0,${dim})` }} />
          {boxes.map((b, i) => {
            const a = pr(f, b.at, b.at + 10);
            if (a <= 0) return null;
            const col = b.color ?? C.amber;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: b.x * W - 6,
                  top: b.y * H - 6,
                  width: b.w * W * (0.6 + 0.4 * a),
                  height: b.h * H + 12,
                  border: `4px solid ${col}`,
                  borderRadius: 12,
                  boxShadow: `0 0 0 2000px rgba(0,0,0,${0.45 * a}), 0 0 30px ${col}`,
                  opacity: a,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

/** Right-hand text column next to the phone. */
const Side: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 1000, top: 0, bottom: 0, width: 820, display: "flex", flexDirection: "column", justifyContent: "center", gap: 24 }}>{children}</div>
);

/* ------------------------------------------------------------ intro input track (from optical-flow analysis) */
const DRIVE = MOTION.drive;
const FIGHT = MOTION.fight;
type K5 = [number, number, number, number, number];
const INTRO_TRACK: InputTrack = {
  sticks: [...DRIVE.sticks.map((s) => [s[0], s[1], s[2], s[3], s[4]] as K5), ...FIGHT.sticks.map((s) => [s[0] + DRIVE.len, s[1], s[2], s[3], s[4]] as K5)],
  buttons: [["A", 2, 6], ...FIGHT.buttons.map((b) => [b[0] as Btn, b[1] + DRIVE.len, b[2] + DRIVE.len] as [Btn, number, number])],
  triggers: [
    [0, 0, 0],
    [6, 0, 1],
    [DRIVE.len - 4, 0, 1],
    [DRIVE.len, 0, 0],
  ],
};
const STILL = inputAt({ sticks: [], buttons: [] }, 0);

/* ------------------------------------------------------------ scenes */
type SceneP = { f: number; d: number };

const Intro: React.FC<SceneP> = ({ f }) => {
  const s = inputAt(INTRO_TRACK, f);
  const words: [string, string][] = [
    ["smooth", "SMOOTH"],
    ["touch", "TOUCH CONTROLS"],
    ["launch", "LAUNCH DAY"],
  ];
  return (
    <AbsoluteFill>
      <Stage f={f} accent="rgba(40,215,255,0.14)" x={50} y={50} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `scale(${interpolate(f, [0, 240], [0.9, 1.0], clamp)})` }}>
        <PhoneLandscape s={s} tilt={-7 + f * 0.035}>
          <Sequence durationInFrames={DRIVE.len} layout="none">
            <Game src="g1_pickup" from={9} d={DRIVE.len} zoom={[1, 1]} vol={0.22} />
          </Sequence>
          <Sequence from={DRIVE.len} layout="none">
            <Game src="g2_fight" from={19.5} d={140} zoom={[1, 1]} vol={0.22} />
          </Sequence>
        </PhoneLandscape>
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 40 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 70, color: C.ink, textShadow: "0 6px 30px rgba(0,0,0,0.8)", opacity: pr(f, c("look") + 30, c("look") + 44) }}>GTA 6… ON A PHONE?</div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 150, flexDirection: "row", gap: 20 }}>
        {words.map(([k, t]) =>
          f >= c(k) ? (
            <Chip key={k} f={f} at={c(k)} bg={C.green} fg="#04140b" size={40}>
              ✓ {t}
            </Chip>
          ) : null,
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const PLAYABLE_ON: Omit<Box, "at"> = { x: 0.02, y: 0.255, w: 0.96, h: 0.055, color: C.red };
const Reveal: React.FC<SceneP> = ({ f }) => (
  <AbsoluteFill style={{ transform: shake(f, 0, 12, 18) }}>
    <Stage f={f} accent="rgba(255,61,82,0.16)" x={30} y={50} />
    <XcPhone f={f} freeze={48.5} boxes={[{ ...PLAYABLE_ON, at: 14 }]} zoomAt={14} zoomK={1.5} focusY={0.28} />
    <Side>
      <Kicker f={f} at={6} color={C.mute}>
        Xbox app · GTA VI store page
      </Kicker>
      <Head f={f} at={10} size={84}>
        &quot;PLAYABLE ON: CLOUD GAMING ON XBOX CONSOLES&quot;
      </Head>
      <div>
        <Stamp f={f} at={24} size={96}>
          NOT SO FAST
        </Stamp>
      </div>
    </Side>
  </AbsoluteFill>
);

const Hook: React.FC<SceneP> = ({ f }) => <SearchHook f={f} per={68} />;

const BoardAll: React.FC<SceneP> = ({ f }) => {
  const o = c("onlyone") - c("tested");
  const b = c("bank") - c("tested");
  return (
    <AbsoluteFill>
      <VerdictBoard f={f} states={["?", "?", "?", "?"]} />
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 150, flexDirection: "row", gap: 24 }}>
        {f >= o ? (
          <Chip f={f} at={o} bg={C.green} fg="#04140b" size={40}>
            ONLY 1 WORKS
          </Chip>
        ) : null}
        {f >= b ? (
          <Chip f={f} at={b} bg={C.red} size={40}>
            1 CAN EMPTY YOUR BANK ACCOUNT
          </Chip>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Broll: React.FC<SceneP & { src: string; from?: number; title?: string; sub?: string; color?: string; dim?: number }> = ({ f, d, src, from, title, sub, color, dim }) => (
  <AbsoluteFill>
    <Game src={src} from={from} d={d} dim={dim} />
    {title ? <LowerThird f={f} title={title} sub={sub} color={color} len={d} /> : null}
  </AbsoluteFill>
);

const M1Intro: React.FC<SceneP> = ({ f, d }) => (
  <AbsoluteFill>
    <Phase a={50} b={d}>
      {(ff, dd) => <Broll f={ff} d={dd} src="g4_highway" title="Xbox Cloud Gaming" sub="Supports GTA 6 from day one… but where?" />}
    </Phase>
    {f < 62 ? <MethodCard f={f} n={1} len={56} /> : null}
  </AbsoluteFill>
);

/** Xbox app walkthrough: search → store page → "Playable on" → free tier → not available. */
const XcWalk: React.FC<SceneP> = ({ f: F0, d: D0 }) => {
  const t = (k: string) => c(k) - c("opened");
  return (
    <AbsoluteFill>
      <Stage f={F0} accent="rgba(40,215,255,0.10)" x={30} y={50} />
      <Phase a={0} b={t("ultimate")}>
        {(f) => (
          <>
            <XcPhone f={f} from={26.5} />
            <Side>
              <Kicker f={f}>My phone · Xbox app</Kicker>
              <Head f={f} at={4} size={84}>
                SEARCH: GTA
              </Head>
            </Side>
          </>
        )}
      </Phase>
      <Phase a={t("ultimate")} b={t("scroll")}>
        {(f) => {
          const st = t("standard") - t("ultimate");
          return (
            <>
              <XcPhone f={f + 20} freeze={36} boxes={[{ x: 0.03, y: 0.465, w: 0.93, h: 0.07, at: 26, color: C.green }]} zoomAt={26} zoomK={1.25} focusY={0.5} />
              <Side>
                <Kicker f={f}>GTA VI · Xbox Store India</Kicker>
                <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 90, color: C.ink, opacity: pr(f, 4, 14) }}>₹7,499</div>
                <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 36, color: C.mute, opacity: pr(f, 4, 14) }}>Ultimate Edition</div>
                <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 90, color: C.ink, opacity: pr(f, st, st + 10) }}>₹5,999</div>
                <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 36, color: C.mute, opacity: pr(f, st, st + 10) }}>Standard Edition</div>
              </Side>
            </>
          );
        }}
      </Phase>
      <Phase a={t("scroll")} b={t("playableonly")}>
        {(f, d) => <XcPhone f={f + 20} from={42} rate={Math.min(4, Math.max(1, 6.5 / Math.max(0.5, d / 30)))} />}
      </Phase>
      <Phase a={t("playableonly")} b={t("notphones")}>
        {(f) => {
          const pon = t("playableon") - t("playableonly");
          const con = t("consoles2") - t("playableonly");
          return (
            <>
              <XcPhone
                f={f + 20}
                freeze={48.5}
                boxes={[
                  { x: 0.02, y: 0.795, w: 0.96, h: 0.045, at: 26, color: C.amber },
                  { ...PLAYABLE_ON, at: pon + 20 },
                ]}
                zoomAt={pon + 20}
                zoomK={1.5}
                focusY={0.28}
              />
              <Side>
                {f < pon ? (
                  <>
                    <Kicker f={f} color={C.amber}>
                      Store page says
                    </Kicker>
                    <Head f={f} size={70}>
                      &quot;Cloud playable only with game purchase&quot;
                    </Head>
                  </>
                ) : (
                  <>
                    <Kicker f={f - pon} color={C.red}>
                      But look at this line
                    </Kicker>
                    <Head f={f - pon} size={84}>
                      PLAYABLE ON: XBOX CONSOLES
                    </Head>
                    <div style={{ marginTop: 20 }}>
                      <Stamp f={f} at={con} size={80}>
                        NOT PHONES
                      </Stamp>
                    </div>
                  </>
                )}
              </Side>
            </>
          );
        }}
      </Phase>
      <Phase a={t("notphones")} b={t("rightnow")}>
        {(f) => <CloudConsoleOnly f={f} />}
      </Phase>
      <Phase a={t("rightnow")} b={t("funny")}>
        {(f, d) => (
          <AbsoluteFill>
            <Game src="g3_traffic" from={2} d={d} />
            <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
              <Chip f={f} at={20} bg={C.amber} fg="#111" size={48}>
                Cloud GTA 6 = for Xbox owners (e.g. Xbox One)
              </Chip>
            </AbsoluteFill>
          </AbsoluteFill>
        )}
      </Phase>
      <Phase a={t("funny")} b={t("butphone")}>
        {(f) => {
          const ss = t("seestream") - t("funny");
          return (
            <>
              <XcPhone f={f} freeze={19} boxes={[{ x: 0.03, y: 0.548, w: 0.7, h: 0.04, at: ss, color: C.green }]} zoomAt={ss} zoomK={1.4} focusY={0.56} />
              <Side>
                <Kicker f={f} color={C.green}>
                  The funny part
                </Kicker>
                <Head f={f} size={80}>
                  FREE CLOUD TIER (WITH ADS) IS LIVE IN INDIA
                </Head>
              </Side>
            </>
          );
        }}
      </Phase>
      <Phase a={t("butphone")} b={D0}>
        {(f) => {
          const na = t("notavail") - t("butphone");
          return (
            <AbsoluteFill style={{ transform: shake(f, na, 10, 14) }}>
              <XcPhone f={f + 20} freeze={48.5} dim={0.5} />
              <Side>
                <Head f={f} size={80}>
                  GTA 6 ON YOUR PHONE?
                </Head>
                <div>
                  <Stamp f={f} at={na} size={96}>
                    NOT AVAILABLE
                  </Stamp>
                </div>
              </Side>
            </AbsoluteFill>
          );
        }}
      </Phase>
    </AbsoluteFill>
  );
};

const M2: React.FC<SceneP> = ({ f: F0, d: D0 }) => {
  const t = (k: string) => c(k) - c("m2");
  const sub = t("subscribe1") - t("daydrops") - 6;
  return (
    <AbsoluteFill>
      <Phase a={50} b={t("problem")}>
        {(f, d) => <Broll f={f} d={d} src="g4_highway" from={8} title="GeForce Now" sub="Streams PC games you own · now in India" color={C.green} />}
      </Phase>
      <Phase a={t("problem")} b={t("daydrops")}>
        {(f) => <Platforms f={f} />}
      </Phase>
      <Phase a={t("daydrops")} b={D0}>
        {(f, d) => (
          <>
            <Broll f={f} d={d} src="g5_bridge_beach" from={0} />
            {f >= sub ? <SubscribeNudge f={f - sub} text="I'll test GTA 6 on GeForce Now the day the PC version launches" len={d - sub} /> : null}
          </>
        )}
      </Phase>
      {F0 < 62 ? <MethodCard f={F0} n={2} len={56} /> : null}
    </AbsoluteFill>
  );
};

const M3: React.FC<SceneP> = ({ f: F0, d: D0 }) => {
  const t = (k: string) => c(k) - c("m3");
  const per = Math.floor((t("clear") - t("searchapk") - 50) / 3);
  return (
    <AbsoluteFill>
      <Stage f={F0} accent="rgba(255,61,82,0.12)" x={50} y={50} />
      <Phase a={t("searchapk")} b={t("clear")}>
        {(f) => <SearchHook f={f} per={per} queries={["gta 6 apk download", "gta 6 mobile beta apk", "gta 6 android free download"]} stamp="THERE IS NO GTA 6 APK" />}
      </Phase>
      <Phase a={t("clear")} b={t("jason")}>
        {(f, d) => (
          <AbsoluteFill>
            <Game src="g7a_phone" d={d} dim={0.55} blur={6} />
            <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 140 }}>
              <Head f={f} size={110} align="center">
                THERE IS NO GTA 6 FOR ANDROID OR iPHONE
              </Head>
            </AbsoluteFill>
          </AbsoluteFill>
        )}
      </Phase>
      <Phase a={t("jason")} b={t("whatare")}>
        {(f, d) => (
          <AbsoluteFill>
            <Game src="g7b_phone" from={1} d={d} zoom={[1.05, 1.18]} />
            <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 170 }}>
              <Stamp f={f} at={34} color={C.green} size={70}>
                THE ONLY PHONE IT RUNS ON: JASON&apos;S
              </Stamp>
            </AbsoluteFill>
          </AbsoluteFill>
        )}
      </Phase>
      <Phase a={t("whatare")} b={t("flags")}>
        {(f) => <ScamTypes f={f} ats={[t("one") - t("whatare"), t("two") - t("whatare"), t("three") - t("whatare")]} stampAt={t("three") - t("whatare") + 150} />}
      </Phase>
      <Phase a={t("flags")} b={t("installed")}>
        {(f) => <RedFlags f={f} ats={[t("flagapk") - t("flags"), t("flagunknown") - t("flags"), t("flagverify") - t("flags")]} />}
      </Phase>
      <Phase a={t("installed")} b={D0}>
        {(f, d) => <IfInstalled f={f} gap={Math.floor((d - 60) / 4)} />}
      </Phase>
      {F0 < 62 ? <MethodCard f={F0} n={3} len={56} /> : null}
    </AbsoluteFill>
  );
};

const M4: React.FC<SceneP> = ({ f: F0, d: D0 }) => {
  const t = (k: string) => c(k) - c("m4");
  const wifi = t("wifi") - t("yesphone");
  return (
    <AbsoluteFill>
      <Phase a={50} b={t("howworks")}>
        {(f, d) => <Broll f={f} d={d} src="g6_docks" title="PS Remote Play · Xbox Remote Play" sub="Supported by Rockstar for GTA 6" color={C.green} />}
      </Phase>
      <Phase a={t("howworks")} b={t("yesphone")}>
        {(f) => <RemotePlayDiagram f={f} />}
      </Phase>
      <Phase a={t("yesphone")} b={t("catch")}>
        {(f, d) => (
          <AbsoluteFill>
            <Stage f={f} accent="rgba(53,242,154,0.12)" x={50} y={50} />
            <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
              <PhoneLandscape s={STILL} showTouch={false} w={1400} tilt={6 - f * 0.03}>
                <Game src="g5_bridge_beach" from={8} d={d} zoom={[1, 1]} />
              </PhoneLandscape>
            </AbsoluteFill>
            <div style={{ position: "absolute", left: 60, top: 50 }}>
              <Badge>ILLUSTRATION · CONSOLE GAMEPLAY SHOWN IN A PHONE FRAME</Badge>
            </div>
            <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 150 }}>
              {f >= wifi ? (
                <Chip f={f} at={wifi} bg={C.amber} fg="#111" size={40}>
                  Best on home Wi-Fi · more lag on mobile data
                </Chip>
              ) : null}
            </AbsoluteFill>
          </AbsoluteFill>
        )}
      </Phase>
      <Phase a={t("catch")} b={D0}>
        {(f, d) => (
          <AbsoluteFill>
            <Game src="g1_pickup" from={0} d={d} dim={0.35} />
            <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 30 }}>
              <Kicker f={f} color={C.amber} size={34}>
                The catch
              </Kicker>
              <Stamp f={f} at={20} size={84} color={C.amber}>
                YOU NEED YOUR OWN PS5 / XBOX SERIES X|S
              </Stamp>
            </AbsoluteFill>
          </AbsoluteFill>
        )}
      </Phase>
      {F0 < 62 ? <MethodCard f={F0} n={4} len={56} /> : null}
    </AbsoluteFill>
  );
};

const Cost: React.FC<SceneP> = ({ d: D0 }) => {
  const t = (k: string) => c(k) - c("cost");
  const g = t("game");
  return (
    <AbsoluteFill>
      <Phase a={0} b={t("console")}>
        {(f) => (
          <>
            <Stage f={f} accent="rgba(255,182,72,0.12)" x={30} y={50} />
            <XcPhone f={f} freeze={36} boxes={[{ x: 0.03, y: 0.465, w: 0.93, h: 0.07, at: g + 10, color: C.green }]} zoomAt={g} zoomK={1.25} focusY={0.5} />
            <Side>
              <Kicker f={f}>What it costs to play GTA 6 in India</Kicker>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 100, color: C.ink, opacity: pr(f, g + 20, g + 30) }}>₹5,999</div>
              <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 36, color: C.mute, opacity: pr(f, g + 20, g + 30) }}>Standard</div>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 100, color: C.ink, opacity: pr(f, g + 80, g + 90) }}>₹7,499</div>
              <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 36, color: C.mute, opacity: pr(f, g + 80, g + 90) }}>Ultimate</div>
            </Side>
          </>
        )}
      </Phase>
      <Phase a={t("console")} b={t("nextvid")}>
        {(f) => <PriceCard f={f} consoles={[{ name: "XBOX SERIES S", price: "≈720p", note: "often under 30 fps · Digital Foundry testing", warn: true }]} />}
      </Phase>
      <Phase a={t("nextvid")} b={D0}>
        {(f, d) => <Broll f={f} d={d} src="g8_safe" title="NEXT VIDEO" sub="The cheapest way to play GTA 6 in India" color={C.amber} />}
      </Phase>
    </AbsoluteFill>
  );
};

const VerdictScene: React.FC<SceneP> = ({ f }) => {
  const t = (k: string) => c(k) - c("verdict");
  const focus = f >= t("v4") ? 3 : f >= t("v3") ? 2 : f >= t("v2") ? 1 : f >= t("v1") ? 0 : -1;
  return <VerdictBoard f={f} states={["no", "later", "scam", "yes"]} reveal={focus} revealAt={-999} footnote />;
};

const Possible: React.FC<SceneP> = ({ f, d }) => (
  <AbsoluteFill>
    <Game src="g5_bridge_beach" from={14} d={d} zoom={[1.02, 1.1]} />
    <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(5,7,10,0.7) 0%, rgba(5,7,10,0) 55%)" }} />
    <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 0 180px 110px" }}>
      <Kicker f={f} color={C.green}>
        GTA 6 on your phone, today
      </Kicker>
      <Head f={f} at={6} size={96}>
        ONLY THROUGH REMOTE PLAY
      </Head>
    </AbsoluteFill>
  </AbsoluteFill>
);

const Outro: React.FC<SceneP> = ({ f, d }) => {
  const cm = c("comments") - c("saved");
  return (
    <AbsoluteFill>
      <Game src="g6_docks" from={0} d={d} zoom={[1.02, 1.1]} />
      <SubscribeNudge f={f} text="If this saved you from a fake APK, like & subscribe" len={cm} />
      {f >= cm ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <Chip f={f} at={cm} bg={C.ink} fg="#111" size={50}>
            Which method were you hoping for? 👇
          </Chip>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

const EndCard: React.FC<SceneP> = ({ f }) => (
  <AbsoluteFill>
    <Stage f={f} accent="rgba(255,182,72,0.10)" x={50} y={30} />
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 90 }}>
      <Kicker f={f} color={C.amber}>
        Unknown Gamer
      </Kicker>
      <Head f={f} at={4} size={84} align="center">
        WATCH NEXT
      </Head>
      <div style={{ display: "flex", gap: 60, marginTop: 70 }}>
        {[0, 1].map((i) => (
          <div key={i} style={{ width: 640, height: 360, borderRadius: 20, border: `2px dashed ${C.line}`, background: "rgba(255,255,255,0.03)", opacity: pr(f, 8 + i * 6, 22 + i * 6) }} />
        ))}
      </div>
      <div style={{ position: "absolute", bottom: 40, fontFamily: MONO, fontSize: 20, color: "rgba(255,255,255,0.4)" }}>Music: Kevin MacLeod (incompetech.com), CC BY 4.0</div>
    </AbsoluteFill>
  </AbsoluteFill>
);

type Block = { id: string; from: number; to: number; C: React.FC<SceneP> };
const CH = (n: number): Verdict[] => (["no", "later", "scam", "yes"] as Verdict[]).map((v, i) => (i < n ? v : "?"));
const mk = (id: string, a: number, b: number, Comp: React.FC<SceneP>): Block => ({ id, from: a, to: b, C: Comp });
const Board = (n: number, footnote = false): React.FC<SceneP> => {
  const B: React.FC<SceneP> = ({ f }) => <VerdictBoard f={f} states={CH(n)} reveal={n - 1} footnote={footnote} />;
  return B;
};
const BrollFacts: React.FC<SceneP> = (p) => <Broll {...p} src="g3_traffic" from={10} title="4 methods" sub="Tested one by one" />;
const BLOCKS: Block[] = [
  mk("intro", 0, c("no"), Intro),
  mk("reveal", c("no"), c("finally"), Reveal),
  mk("hook", c("finally"), c("tested"), Hook),
  mk("board0", c("tested"), c("facts"), BoardAll),
  mk("facts", c("facts"), c("sowant"), ({ f }) => <Platforms f={f} />),
  mk("broll1", c("sowant"), c("m1"), BrollFacts),
  mk("m1", c("m1"), c("opened"), M1Intro),
  mk("xcwalk", c("opened"), c("m1fail"), XcWalk),
  mk("board1", c("m1fail"), c("m2"), Board(1)),
  mk("m2", c("m2"), c("m2notyet"), M2),
  mk("board2", c("m2notyet"), c("m3"), Board(2)),
  mk("m3", c("m3"), c("m3scam"), M3),
  mk("board3", c("m3scam"), c("m4"), Board(3)),
  mk("m4", c("m4"), c("m4works"), M4),
  mk("board4", c("m4works"), c("cost"), Board(4, true)),
  mk("cost", c("cost"), c("verdict"), Cost),
  mk("verdict", c("verdict"), c("possible"), VerdictScene),
  mk("possible", c("possible"), c("saved"), Possible),
  mk("outro", c("saved"), VO_FRAMES + 10, Outro),
  mk("end", VO_FRAMES + 10, TOTAL_FRAMES, EndCard),
];

const Host: React.FC<{ b: Block }> = ({ b }) => {
  const f = useCurrentFrame();
  const fadeIn = b.from === 0 ? 1 : pr(f, 0, XF);
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <b.C f={f} d={b.to - b.from} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ audio */
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
const MUSIC: [string, number, number][] = [
  ["c4_msrp", 0, c("m1")],
  ["c7_bf", c("m1"), c("m3")],
  ["c5_twist", c("m3"), c("m4")],
  ["c6_regions", c("m4"), c("verdict")],
  ["c9_outro", c("verdict"), TOTAL_FRAMES],
];
const FADE = 24;
const W1 = "sfx/swoosh.wav";
const IMP = "sfx/impact.wav";
const BIG = "sfx/tech/big-impact.mp3";
const DEEP = "sfx/tech/deep-impact.mp3";
const BLIP = "ug-001/audio/blip.wav";
const GL = "ug-001/audio/glitch.wav";
type Sfx = [number, string, number];
const SFX: Sfx[] = [
  ...BLOCKS.slice(1).map((b, i) => [b.from - 4, i % 2 ? W1 : "ug-001/audio/whoosh_down.wav", 0.16] as Sfx),
  [c("no") - 3, GL, 0.45],
  [c("no"), DEEP, 0.5],
  [c("no") + 24, IMP, 0.4],
  [c("smooth"), BLIP, 0.25],
  [c("touch"), BLIP, 0.25],
  [c("launch"), BLIP, 0.25],
  [c("finally"), "sfx/riser.wav", 0.15],
  [c("onlyone"), BLIP, 0.3],
  [c("bank"), IMP, 0.35],
  ...(["m1", "m2", "m3", "m4"] as const).map((k) => [c(k), DEEP, 0.4] as Sfx),
  ...(["m1fail", "m2notyet", "m3scam", "m4works"] as const).map((k) => [c(k) + 18, IMP, 0.4] as Sfx),
  [c("consoles2"), IMP, 0.4],
  [c("notavail"), BIG, 0.45],
  [c("searchapk") + Math.floor((c("clear") - c("searchapk") - 50) / 3) * 3 - 6, BIG, 0.4],
  [c("jason") + 34, BLIP, 0.3],
  [c("one"), IMP, 0.25],
  [c("two"), IMP, 0.3],
  [c("three"), IMP, 0.3],
  [c("flagapk"), BLIP, 0.25],
  [c("flagunknown"), BLIP, 0.25],
  [c("flagverify"), BLIP, 0.25],
  [c("catch") + 20, IMP, 0.4],
  [c("possible"), "sfx/riser.wav", 0.12],
];

const Mix: React.FC = () => (
  <>
    <Audio src={S("audio/narration.mp3")} volume={1} />
    {MUSIC.map(([file, a, b], i) => {
      const dur = b - a + FADE;
      return (
        <Sequence key={file} from={a} durationInFrames={dur} layout="none">
          <Audio
            src={staticFile(`ug-001/audio/music/${file}.mp3`)}
            loop
            volume={(fr) => {
              const abs = fr + a;
              const base = (i === 0 && abs < c("no") ? 0.2 : 0.32) - 0.22 * voice(abs);
              const fin = interpolate(fr, [0, FADE], [0, 1], clamp);
              const fout = interpolate(fr, [dur - FADE, dur], [1, 0], clamp);
              const tail = interpolate(abs, [TOTAL_FRAMES - 50, TOTAL_FRAMES - 4], [1, 0], clamp);
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

/* ------------------------------------------------------------ root */
const PHRASES: Phrase[] = CAPTIONS.map(([s, e, t]) => ({ s, e, t }));
const CHAPTER_AT = ["m1", "m2", "m3", "m4"].map((k) => c(k));

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

export const UgTwo: React.FC<{ audio?: boolean }> = ({ audio = true }) => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    {BLOCKS.map((b) => (
      <Sequence key={b.id} from={b.from} durationInFrames={b.to - b.from + XF} name={b.id}>
        <Host b={b} />
      </Sequence>
    ))}
    {[c("no"), ...CHAPTER_AT].map((a) => (
      <Sequence key={a} from={a - 3} durationInFrames={10} layout="none">
        <Glitch at={0} len={7} />
      </Sequence>
    ))}
    <Vignette strength={0.45} />
    <Grain opacity={0.05} />
    <Sequence durationInFrames={VO_FRAMES + 10} layout="none">
      <Captions phrases={PHRASES} />
    </Sequence>
    <Progress />
    {audio ? <Mix /> : null}
  </AbsoluteFill>
);

/** QC sheet: several frames per block. Register with the full duration and render frames 0..N-1. */
const SAMPLES = BLOCKS.flatMap((b) => {
  const d = b.to - b.from;
  return [0.2, 0.5, 0.85].map((p) => b.from + Math.floor(d * p));
});
export const UG002_SHEET_FRAMES = SAMPLES.length;
export const UgTwoSheet: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Freeze frame={SAMPLES[Math.min(f, SAMPLES.length - 1)]}>
      <UgTwo audio={false} />
    </Freeze>
  );
};
