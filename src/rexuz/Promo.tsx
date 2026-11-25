/**
 * REXUZ AI — promo films (version A: no voice-over, kinetic type + music).
 * YouTube 16:9 (3:13) and Reel 9:16 (45 s). Every cut sits on a bar of the music (108 BPM, 1 bar = 66.67 f).
 * Real phone footage: hook.mp4 (REXUZ Lab in airplane mode + Offline mode, answering on-device).
 * AI-made showcase media (ChatGPT stills, Gemini clips) carry an "Illustrative" note.
 * Music: "Synthwave" by jonasblakewood (Pixabay Content License, not Content-ID registered).
 */
import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Img, OffthreadVideo, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Grain, Vignette } from "../ug/fx";
import {
  ANTON,
  bar,
  Bg,
  BotMsg,
  ChatPanel,
  Converge,
  Devices,
  DocPage,
  Dots,
  Dust,
  Fact,
  FileCard,
  FilesFan,
  Flash,
  GameBoard,
  Globe,
  HwPanel,
  K,
  Kicker,
  life,
  lin,
  Logo,
  MicRing,
  mix,
  MONO,
  ModelCard,
  Note,
  Paint,
  Phone,
  PHONE_RATIO,
  pr,
  R,
  Racks,
  Scan,
  Screen,
  SG,
  Stamp,
  Toggle,
  typed,
  UserMsg,
  VideoFrame,
  Wordmark,
  Words,
} from "./Kit";

const shakeX = (f: number, at: number, amp = 18, len = 12) => (f >= at && f < at + len ? Math.sin((f - at) * 2.7) * amp * (1 - (f - at) / len) : 0);
const Abs: React.FC<{ x?: number; y?: number; w?: number; h?: number; children?: React.ReactNode; style?: React.CSSProperties }> = ({ x = 0, y = 0, w, h, children, style }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, ...style }}>{children}</div>
);
const ILLU = "Illustrative. Actual results vary.";

/** Scene shell: zoom-in entrance, fade exit. */
const Shell: React.FC<{ d: number; children: React.ReactNode }> = ({ d, children }) => {
  const f = useCurrentFrame();
  const i = pr(f, 0, 14);
  const o = 1 - lin(f, d - 6, d);
  return (
    <AbsoluteFill style={{ opacity: Math.min(lin(f, 0, 5), o), transform: `scale(${mix(1.07, 1, i)})` }}>{children}</AbsoluteFill>
  );
};

/* =========================================================== HOOK */
const Hook: React.FC<{ reel?: boolean }> = ({ reel = false }) => {
  const f = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  // phase starts: airplane toggle, typing clip, answering clip, end
  const T = reel ? { a: 0, b: 50, c: 120, e: 267, rateB: 2.4, rateC: 2.04 } : { a: 0, b: 90, c: 200, e: 400, rateB: 1.5, rateC: 1.5 };
  const pw = reel ? 600 : 420;
  const ph = pw * PHONE_RATIO;
  const px = reel ? (W - pw) / 2 - 21 : 330;
  const py = reel ? 470 : (H - ph) / 2 - 21;
  const zoomAt = reel ? 170 : 300;
  const zoom = pr(f, zoomAt, zoomAt + 50);
  const qs = pr(f, 10, 24) * (1 - pr(f, T.b - 14, T.b - 2));
  const plane = pr(f, reel ? 22 : 40, reel ? 28 : 46);
  const tile = (label: string, on: number, icon: string) => (
    <div
      style={{
        flex: 1,
        borderRadius: 28,
        padding: "22px 20px",
        background: on > 0.5 ? "#8AB4F8" : "rgba(255,255,255,0.12)",
        color: on > 0.5 ? "#0b1b3a" : "#eee",
        fontFamily: SG,
        fontSize: 26,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span style={{ fontSize: 34 }}>{icon}</span>
      {label}
    </div>
  );
  return (
    <AbsoluteFill>
      <Abs
        x={px}
        y={py}
        style={{
          transform: `translateY(${(1 - pr(f, 0, 30)) * 90}px) translateX(${shakeX(f, zoomAt + 4, 10)}px) scale(${mix(1, reel ? 1.18 : 1.3, zoom)})`,
          transformOrigin: "50% 22%",
          opacity: pr(f, 0, 20),
        }}
      >
        <Phone w={pw} glow={mix(0.6, 1.4, zoom)}>
          {f < T.b ? <Screen src="scr_home.jpg" /> : null}
          <Sequence from={T.b} durationInFrames={T.c - T.b} layout="none">
            <OffthreadVideo muted src={R("hook.mp4")} startFrom={60} playbackRate={T.rateB} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
            {/* keyboard area: the keyboard theme may show a personal photo, so it is frosted */}
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "38%", backdropFilter: "blur(18px) brightness(0.55) saturate(0.4)", WebkitBackdropFilter: "blur(18px) brightness(0.55) saturate(0.4)", background: "rgba(11,9,32,0.35)" }} />
          </Sequence>
          <Sequence from={T.c} durationInFrames={T.e - T.c} layout="none">
            <OffthreadVideo muted src={R("hook.mp4")} startFrom={855} playbackRate={T.rateC} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
          </Sequence>
          {qs > 0 ? (
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                padding: `${pw * 0.12}px ${pw * 0.05}px ${pw * 0.06}px`,
                background: "rgba(18,18,24,0.96)",
                borderRadius: `0 0 ${pw * 0.08}px ${pw * 0.08}px`,
                transform: `translateY(${(qs - 1) * 105}%)`,
                transformOrigin: "top",
                zoom: pw / 600,
              }}
            >
              <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>
                {tile("Wi-Fi", 1 - plane, "◉")}
                {tile("Mobile data", 1 - plane, "▲")}
              </div>
              <div style={{ display: "flex", gap: 14 }}>
                {tile("Airplane mode", plane, "✈")}
                {tile("Bluetooth", 0, "✱")}
              </div>
            </div>
          ) : null}
        </Phone>
      </Abs>
      {/* red "no connection" pill */}
      {f > (reel ? 30 : 50) && f < T.e ? (
        <Abs
          x={reel ? W / 2 - 190 : px + pw / 2 - 165}
          y={reel ? 560 : py - 56 < 10 ? 14 : py - 56}
          style={{
            opacity: life(f, reel ? 30 : 50, T.c - 10),
            fontFamily: SG,
            fontWeight: 700,
            fontSize: 30,
            color: "#fff",
            background: K.red,
            borderRadius: 999,
            padding: "10px 28px",
            boxShadow: `0 0 40px ${K.red}`,
            width: reel ? 380 : 330,
            textAlign: "center",
          }}
        >
          ✈ No connection
        </Abs>
      ) : null}
      {reel ? (
        <>
          <Abs x={60} y={170} w={W - 120}>
            <Words f={f} at={4} text="I TURNED OFF | THE *INTERNET." size={130} align="center" out={T.c + 12} stagger={5} />
          </Abs>
          <Abs x={60} y={170} w={W - 120}>
            <Words f={f} at={T.c + 22} text="MY AI KEPT | *TALKING." size={150} align="center" glow />
          </Abs>
        </>
      ) : (
        <Abs x={960} y={0} w={880} h={H} style={{ display: "flex", flexDirection: "column", justifyContent: "center", transform: `translateX(${shakeX(f, 300)}px)` }}>
          <Kicker f={f} at={6} text="The airplane test" out={T.b - 4} />
          <div style={{ height: 20 }} />
          <Words f={f} at={20} text="AIRPLANE MODE. | NO WI-FI. | NO SIGNAL." size={100} stagger={9} out={T.b - 6} />
          <Words f={f} at={T.b + 2} text="NOW ASK IT | *ANYTHING." size={124} out={T.c - 6} />
          <Words f={f} at={T.c + 2} text="NO | *INTERNET." size={180} out={296} />
          <Words f={f} at={302} text="IT STILL | *ANSWERED." size={196} glow />
        </Abs>
      )}
      <Note f={f} at={T.c} text="Real recording · airplane mode on · runs on the phone" style={reel ? { left: 140, top: 1840 - 30 } : { left: px - 10, bottom: 18 }} />
      <Flash f={f} at={reel ? T.c + 20 : 302} len={8} />
    </AbsoluteFill>
  );
};

/* =========================================================== CLOUD */
const Cloud: React.FC = () => {
  const f = useCurrentFrame();
  const off = pr(f, 330, 420);
  const gone = pr(f, 425, 445);
  const cut = 495;
  const lines = new Array(12).fill(0);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: (1 - off * 0.85) * (1 - gone) }}>
        {lines.map((_, i) => {
          const y = 140 + i * 72;
          return (
            <path
              key={i}
              d={`M -50 ${540 + (i - 6) * 14} C 500 ${540 + (i - 6) * 20}, 700 ${y}, 1000 ${y}`}
              fill="none"
              stroke={i % 2 ? K.cyan : K.violet}
              strokeWidth={3}
              strokeDasharray="30 22"
              strokeDashoffset={-f * 6 - i * 13}
              opacity={0.75}
              style={{ filter: `drop-shadow(0 0 8px ${K.cyan})` }}
            />
          );
        })}
      </svg>
      <Abs x={960} y={150} style={{ opacity: 1 - gone, transform: `perspective(1400px) rotateY(-14deg) scale(${mix(0.95, 1.05, lin(f, 0, 430))})` }}>
        <Racks f={f} off={off} w={880} />
      </Abs>
      {/* the single surviving line, then the cut */}
      {f > 420 ? (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
          <line x1={0} y1={700} x2={f < cut ? 1920 * pr(f, 420, 450) : 940 - pr(f, cut, cut + 20) * 200} y2={700} stroke={K.cyan} strokeWidth={5} style={{ filter: `drop-shadow(0 0 14px ${K.cyan})` }} />
          {f >= cut ? (
            <line x1={980 + pr(f, cut, cut + 20) * 200} y1={700} x2={1920} y2={700} stroke={K.cyan} strokeWidth={5} opacity={1 - pr(f, cut, cut + 30)} />
          ) : null}
          {f >= cut && f < cut + 14
            ? new Array(18).fill(0).map((_, i) => {
                const a = (i / 18) * Math.PI * 2;
                const d = (f - cut) * 14;
                return <circle key={i} cx={960 + Math.cos(a) * d} cy={700 + Math.sin(a) * d * 0.6} r={4} fill={K.red} />;
              })
            : null}
        </svg>
      ) : null}
      <Flash f={f} at={cut} len={10} color={K.red} />
      <Abs x={110} y={0} w={820} h={1080} style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Words f={f} at={18} text="EVERY AI YOU USE | LIVES ON SOMEONE | ELSE'S *SERVERS." size={92} stagger={5} out={172} />
        <Words f={f} at={180} text="YOUR WORDS. | THEIR *CLOUD." size={128} out={322} />
        <Words f={f} at={332} text="WHAT IF IT | DIDN'T NEED | THE *CLOUD?" size={112} out={440} />
      </Abs>
      <Abs x={0} y={250} w={1920}>
        <Words f={f} at={450} text="WHAT IF IT RAN | *RIGHT *HERE?" size={130} align="center" glow />
      </Abs>
    </AbsoluteFill>
  );
};

/* =========================================================== LOGO */
const LogoReveal: React.FC<{ reel?: boolean }> = ({ reel = false }) => {
  const f = useCurrentFrame();
  const { width: W } = useVideoConfig();
  const size = reel ? 620 : 420;
  const lift = reel ? 0 : pr(f, 190, 230) * 90;
  const cy = reel ? 760 : 380 - lift;
  return (
    <AbsoluteFill>
      <Converge f={f} at={0} len={reel ? 40 : 60} cx={W / 2} cy={cy} />
      <Abs x={W / 2 - size / 2} y={cy - size / 2}>
        <Logo f={f} at={reel ? 34 : 52} size={size} />
      </Abs>
      <Flash f={f} at={reel ? 36 : 56} len={12} />
      <Abs x={0} y={cy + size / 2 + (reel ? 40 : 24)} w={W} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <Kicker f={f} at={reel ? 44 : 66} text="Introducing" align="center" size={reel ? 40 : 32} />
        <Wordmark f={f} at={reel ? 50 : 82} size={reel ? 150 : 140} />
        {reel ? (
          <Kicker f={f} at={70} text="The AI that lives on your phone" align="center" size={40} color={K.ink} />
        ) : (
          <div style={{ marginTop: 18 }}>
            <Words f={f} at={200} text="YOUR HARDWARE. YOUR AI. YOUR *RULES." size={78} align="center" stagger={6} />
          </div>
        )}
      </Abs>
    </AbsoluteFill>
  );
};

/* =========================================================== BRAIN + HARDWARE */
const MODELS = [
  { name: "Qwen3.5 0.8B", size: "tiny · fastest", badge: "RECOMMENDED" },
  { name: "Qwen3.5 2B", size: "small · quick", badge: "RECOMMENDED" },
  { name: "Qwen3.5 4B", size: "4 billion parameters · smartest here", badge: "BEST FOR THIS PHONE" },
  { name: "Llama 3.2", size: "3B · all-rounder", badge: "RECOMMENDED" },
];
const Brain: React.FC = () => {
  const f = useCurrentFrame();
  const cardsOut = 1 - pr(f, 245, 262);
  return (
    <AbsoluteFill>
      <Abs x={110} y={0} w={760} h={1080} style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 24 }}>
        <div style={{ position: "relative", height: 330 }}>
          <Abs>
            <Kicker f={f} at={6} text="Small and fast — or big and clever" out={248} />
            <div style={{ height: 18 }} />
            <Words f={f} at={10} text="PICK A | *BRAIN." size={170} out={250} />
          </Abs>
          <Abs>
            <Kicker f={f} at={262} text="RAM · storage · processor — checked first" />
            <div style={{ height: 18 }} />
            <Words f={f} at={266} text="IT KNOWS | YOUR *PHONE." size={150} />
          </Abs>
        </div>
        <div style={{ height: 120 }}>
          <Words f={f} at={420} text="THEN IT ALL RUNS | *ON *DEVICE." size={64} font={ANTON} stagger={5} />
        </div>
      </Abs>
      {cardsOut > 0
        ? MODELS.map((m, i) => {
            const t = pr(f, 20 + i * 8, 46 + i * 8);
            const hot = pr(f, 140, 170);
            const isHot = i === 2;
            const gx = 960 + (i % 2) * 450;
            const gy = 230 + Math.floor(i / 2) * 290;
            const x = isHot ? mix(gx, 1150, hot) : gx;
            const y = isHot ? mix(gy, 380, hot) : gy;
            return (
              <Abs
                key={m.name}
                x={x}
                y={y + Math.sin(f / 30 + i) * 8}
                style={{
                  opacity: t * cardsOut * (isHot ? 1 : mix(1, 0.25, hot)),
                  transform: `perspective(1200px) rotateY(${(1 - t) * -50}deg) translateX(${(1 - t) * 200}px) scale(${isHot ? mix(1, 1.35, hot) : 1})`,
                  zIndex: isHot ? 2 : 1,
                }}
              >
                <ModelCard {...m} hot={isHot ? hot : 0} />
              </Abs>
            );
          })
        : null}
      <Abs x={1010} y={150} style={{ opacity: pr(f, 268, 284), transform: `perspective(1400px) rotateY(${mix(-25, -8, pr(f, 268, 320))}deg)` }}>
        <HwPanel f={f} at={272} w={760} />
      </Abs>
    </AbsoluteFill>
  );
};

/* =========================================================== INTERFACE */
const Interface: React.FC = () => {
  const f = useCurrentFrame();
  const rot = mix(-22, 14, lin(f, 0, 533));
  const build = pr(f, 470, 533);
  const pw = 400;
  const chips = [
    { t: "✏  Write", x: -330, y: 250, at: 40, c: K.violet },
    { t: "</>  Code", x: 480, y: 200, at: 52, c: K.cyan },
    { t: "🎓  Learn", x: -360, y: 560, at: 64, c: "#34D399" },
    { t: "✦  Create", x: 470, y: 620, at: 76, c: "#FB923C" },
  ];
  return (
    <AbsoluteFill>
      <Abs x={110} y={0} w={760} h={1080} style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Words f={f} at={8} text="FAST. | DARK. | *NEON." size={170} stagger={8} out={250} />
        <Words f={f} at={262} text="WRITE. CODE. | LEARN. *CREATE." size={110} stagger={6} out={398} />
        <Words f={f} at={408} text="AND IT'S MORE | THAN A *CHATBOT." size={112} glow />
      </Abs>
      <Abs x={1150} y={60} style={{ perspective: 1600, transform: `scale(${mix(1, 1.5, build)})`, filter: `blur(${build * 6}px)`, transformOrigin: "50% 40%" }}>
        <div style={{ position: "relative", transform: `rotateY(${rot}deg) rotateX(4deg)`, transformStyle: "preserve-3d" }}>
          <Phone w={pw} style={{ position: "relative" }}>
            <Screen src="scr_home.jpg" />
            <Screen src="scr_chat.jpg" o={pr(f, 180, 196)} />
            <Screen src="scr_home_offline.jpg" o={pr(f, 360, 376)} />
          </Phone>
          {chips.map((c) => {
            const t = pr(f, c.at, c.at + 18);
            return (
              <Abs
                key={c.t}
                x={pw / 2 + (c.x - pw / 2) * t - 90}
                y={c.y + Math.sin(f / 25 + c.at) * 10}
                style={{
                  transform: `translateZ(${120 * t}px) scale(${mix(0.4, 1, t)})`,
                  opacity: t * (1 - pr(f, 250, 270)),
                  fontFamily: SG,
                  fontWeight: 700,
                  fontSize: 36,
                  color: K.ink,
                  background: K.glass,
                  border: `2px solid ${c.c}`,
                  borderRadius: 26,
                  padding: "16px 28px",
                  whiteSpace: "nowrap",
                  boxShadow: `0 0 40px ${c.c}66`,
                }}
              >
                {c.t}
              </Abs>
            );
          })}
        </div>
      </Abs>
      {/* speed lines into the drop */}
      {build > 0 ? (
        <AbsoluteFill style={{ opacity: build }}>
          {new Array(40).fill(0).map((_, i) => {
            const a = (i / 40) * Math.PI * 2;
            const r0 = 200 + ((f * 30 + i * 47) % 900);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 960 + Math.cos(a) * r0,
                  top: 540 + Math.sin(a) * r0,
                  width: 120,
                  height: 3,
                  background: i % 2 ? K.cyan : K.magenta,
                  transform: `rotate(${(a * 180) / Math.PI}deg)`,
                  opacity: 0.7,
                }}
              />
            );
          })}
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/* =========================================================== FEATURE SCENES (16:9) */
const LeftTitle: React.FC<{ f: number; kicker: string; text: string; size?: number; extra?: React.ReactNode }> = ({ f, kicker, text, size = 160, extra }) => (
  <Abs x={110} y={0} w={800} h={1080} style={{ display: "flex", flexDirection: "column", justifyContent: "center", transform: `translateX(${shakeX(f, 0, 14)}px)` }}>
    <Kicker f={f} at={10} text={kicker} />
    <div style={{ height: 18 }} />
    <Words f={f} at={0} text={text} size={size} stagger={3} glow />
    {extra}
  </Abs>
);

const Game: React.FC = () => {
  const f = useCurrentFrame();
  const sw = pr(f, 118, 140);
  return (
    <AbsoluteFill>
      <LeftTitle
        f={f}
        kicker="Games & apps from one message"
        text="SAY IT. | *PLAY IT."
        size={180}
        extra={
          <div style={{ marginTop: 30 }}>
            <Words f={f} at={210} text="BROKEN? TAP *FIX *IT." size={62} stagger={4} />
          </div>
        }
      />
      <ChatPanel w={760} style={{ left: mix(1060, 980, sw), top: 150, opacity: 1 - sw, transform: `scale(${mix(1, 0.85, sw)})` }}>
        <UserMsg f={f} at={4} text={typed("Make a tic tac toe game", f, 6, 1.4) || " "} />
        {f > 30 && f < 52 ? <Dots f={f} label="Writing your game…" /> : null}
        <BotMsg f={f} at={52}>
          I made a Tic Tac Toe game for you. Tap Play!
          <div style={{ marginTop: 18 }}>
            <FileCard name="tic-tac-toe.html" kind="HTML" color={K.blue} w={560} play={f} />
          </div>
        </BotMsg>
      </ChatPanel>
      <Abs
        x={1040}
        y={150}
        w={720}
        h={780}
        style={{
          opacity: sw,
          transform: `perspective(1400px) rotateY(${mix(30, -8, sw)}deg) scale(${mix(0.7, 1, sw)})`,
          borderRadius: 40,
          background: "linear-gradient(180deg, #17142f, #0b0920)",
          border: `2px solid ${K.line}`,
          boxShadow: "0 0 100px rgba(139,92,246,0.4)",
          padding: 50,
        }}
      >
        <div style={{ fontFamily: SG, fontWeight: 700, fontSize: 40, color: K.ink, textAlign: "center", marginBottom: 30 }}>
          Tic Tac Toe <span style={{ fontSize: 26, color: K.dim, fontWeight: 500 }}>· tic-tac-toe.html</span>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <GameBoard f={f} at={130} size={580} />
        </div>
      </Abs>
    </AbsoluteFill>
  );
};

const Files: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <LeftTitle f={f} kicker="PDF · Word · Excel · code" text="FILES, NOT | JUST *TEXT." size={150} />
      <Abs x={900} y={200}>
        <FilesFan f={f} at={6} />
      </Abs>
    </AbsoluteFill>
  );
};

const PromptBar: React.FC<{ f: number; at: number; text: string; w: number }> = ({ f, at, text, w }) => (
  <div
    style={{
      width: w,
      borderRadius: 34,
      border: "2px solid transparent",
      background: `linear-gradient(${K.navy}, ${K.navy}) padding-box, linear-gradient(90deg, ${K.cyan}, ${K.violet}, ${K.magenta}) border-box`,
      padding: "22px 28px",
      fontFamily: SG,
      fontSize: 32,
      color: K.ink,
      display: "flex",
      alignItems: "center",
      gap: 18,
      boxShadow: "0 0 50px rgba(139,92,246,0.35)",
    }}
  >
    <span style={{ background: "linear-gradient(90deg, #22D3EE, #8B5CF6)", borderRadius: 999, padding: "8px 20px", fontSize: 24, fontWeight: 700, color: "#fff" }}>✦ Image</span>
    <span>
      {typed(text, f, at, 1.5)}
      <span style={{ opacity: Math.floor(f / 8) % 2 ? 1 : 0, color: K.cyan }}>|</span>
    </span>
  </div>
);

const PaintScene: React.FC = () => {
  const f = useCurrentFrame();
  const gal = pr(f, 160, 190);
  const others = ["img_islands.jpg", "img_robot.jpg", "img_car.jpg"];
  return (
    <AbsoluteFill>
      <LeftTitle f={f} kicker="Describe it. It paints it." text="IT *PAINTS." size={190} extra={<div style={{ marginTop: 26 }}><Words f={f} at={30} text="NO SERVER. NO *CLOUD." size={64} stagger={4} /></div>} />
      <Abs x={1000} y={70} style={{ opacity: 1 - gal }}>
        <PromptBar f={f} at={4} text="anime girl, neon city, rain, cinematic" w={780} />
      </Abs>
      <Abs x={mix(1110, 1190, gal)} y={mix(200, 250, gal)} style={{ transform: `scale(${mix(1, 0.92, gal)})`, zIndex: 3 }}>
        <Paint f={f} at={36} src="img_anime.jpg" size={600} stepLen={13} />
      </Abs>
      {others.map((s, i) => {
        const t = pr(f, 160 + i * 8, 190 + i * 8);
        const pos = [
          { x: 900, y: 130, r: -10 },
          { x: 1500, y: 120, r: 9 },
          { x: 1460, y: 600, r: -6 },
        ][i];
        return (
          <Abs key={s} x={pos.x} y={pos.y} style={{ opacity: t, transform: `perspective(1200px) rotate(${pos.r}deg) rotateY(${(1 - t) * 70}deg) scale(${mix(0.6, 1, t)})`, zIndex: 2 }}>
            <Img src={R(s)} style={{ width: 360, height: 360, borderRadius: 24, objectFit: "cover", boxShadow: "0 30px 80px rgba(0,0,0,0.7), 0 0 0 2px rgba(139,92,246,0.6)" }} />
          </Abs>
        );
      })}
      <Note f={f} at={40} text={ILLU} style={{ right: 40, bottom: 30 }} />
    </AbsoluteFill>
  );
};

const VideoScene: React.FC = () => {
  const f = useCurrentFrame();
  const sw = pr(f, 96, 116);
  return (
    <AbsoluteFill>
      <LeftTitle f={f} kicker="On powerful phones" text="EVEN | *VIDEO." size={190} />
      <Sequence durationInFrames={120} layout="none">
        <VideoFrame src="gem_anime.mp4" w={980} style={{ left: mix(880, 760, sw), top: 220, opacity: 1 - sw, transform: `perspective(1600px) rotateY(-12deg) scale(${mix(0.9, 1, pr(f, 0, 20))})` }} />
      </Sequence>
      <Sequence from={96} durationInFrames={104} layout="none">
        <VideoFrame src="gem_robot.mp4" w={980} startFrom={30} style={{ left: mix(1100, 880, sw), top: 220, opacity: sw, transform: `perspective(1600px) rotateY(-12deg)` }} />
      </Sequence>
      <Note f={f} at={8} text={ILLU} style={{ right: 40, bottom: 30 }} />
    </AbsoluteFill>
  );
};

const Vision: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <LeftTitle f={f} kicker="Show it a photo. Ask anything." text="IT *SEES." size={200} />
      <Abs x={1000} y={90}>
        <Scan f={f} at={0} src="img_car.jpg" w={780} h={500} />
      </Abs>
      <Abs x={1000} y={630} w={780} style={{ display: "flex", flexDirection: "column", gap: 18, fontFamily: SG, color: K.ink }}>
        <UserMsg f={f} at={30} text="What's in this photo?" />
        <BotMsg f={f} at={60}>{typed("A red sports car racing through a neon-lit tunnel at night, with cyan and pink light trails.", f, 62, 2.2)}</BotMsg>
      </Abs>
      <Note f={f} at={10} text={ILLU} style={{ right: 40, bottom: 30 }} />
    </AbsoluteFill>
  );
};

const Voice: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <LeftTitle f={f} kicker="English · Hindi · and more" text="IT LISTENS. | IT *TALKS." size={150} />
      <Abs x={1080} y={110}>
        <MicRing f={f} size={620} />
      </Abs>
      <Abs x={980} y={790} w={820} style={{ fontFamily: SG, fontSize: 40, color: K.ink, textAlign: "center", opacity: pr(f, 20, 30) }}>
        “{typed("Explain black holes simply", f, 22, 1.2)}”
      </Abs>
      <Abs x={1240} y={880} style={{ opacity: pr(f, 90, 102), fontFamily: SG, fontSize: 28, color: K.cyan, border: `1.5px solid ${K.cyan}`, borderRadius: 999, padding: "10px 24px" }}>
        🔊 Reading the answer aloud
      </Abs>
    </AbsoluteFill>
  );
};

const Docs: React.FC = () => {
  const f = useCurrentFrame();
  const fly = pr(f, 40, 70);
  return (
    <AbsoluteFill>
      <LeftTitle f={f} kicker="With the page it came from" text="YOUR DOCUMENTS, | *ANSWERED." size={120} />
      <Abs x={940} y={220} style={{ opacity: pr(f, 0, 12) }}>
        <DocPage f={f} at={0} />
      </Abs>
      {fly > 0 && fly < 1 ? (
        <Abs x={mix(1050, 1420, fly)} y={mix(430, 440, fly) - Math.sin(fly * Math.PI) * 120} style={{ width: 240, height: 22, borderRadius: 11, background: "rgba(250,204,21,0.9)", boxShadow: "0 0 30px rgba(250,204,21,0.8)" }}>
          {null}
        </Abs>
      ) : null}
      <Abs x={1420} y={330} w={440} style={{ display: "flex", flexDirection: "column", fontFamily: SG, color: K.ink }}>
        <BotMsg f={f} at={66} size={28}>
          {typed("Photosynthesis turns light into chemical energy stored as glucose.", f, 68, 2.2)}
          <div style={{ marginTop: 14 }}>
            <span style={{ fontFamily: MONO, fontSize: 22, color: K.night, background: "rgba(250,204,21,0.95)", borderRadius: 8, padding: "4px 12px", opacity: pr(f, 110, 120) }}>Biology notes · p. 12</span>
          </div>
        </BotMsg>
      </Abs>
    </AbsoluteFill>
  );
};

const Web: React.FC = () => {
  const f = useCurrentFrame();
  const cards = [
    { t: "Today's top headlines", s: "News", x: 900, y: 150 },
    { t: "Gold price today", s: "Web", x: 1480, y: 250 },
    { t: "Last night's match score", s: "Wikipedia", x: 940, y: 760 },
  ];
  return (
    <AbsoluteFill>
      <LeftTitle f={f} kicker="Live news, prices & scores" text="ONLINE? IT | KNOWS *TODAY." size={140} />
      <Abs x={1120} y={240}>
        <Globe f={f} size={560} />
      </Abs>
      {cards.map((c, i) => (
        <Abs key={c.t} x={c.x} y={c.y + Math.sin(f / 22 + i) * 10} style={{ opacity: pr(f, 30 + i * 14, 44 + i * 14), transform: `scale(${mix(0.7, 1, pr(f, 30 + i * 14, 44 + i * 14))})` }}>
          <div style={{ fontFamily: SG, color: K.ink, background: K.glass, border: `1.5px solid ${K.line}`, borderRadius: 22, padding: "18px 24px", fontSize: 30, boxShadow: "0 0 40px rgba(34,211,238,0.25)" }}>
            {c.t}
            <div style={{ marginTop: 10 }}>
              <span style={{ fontSize: 20, color: K.night, background: K.cyan, borderRadius: 999, padding: "4px 14px", fontWeight: 700 }}>
                [{i + 1}] {c.s}
              </span>
            </div>
          </div>
        </Abs>
      ))}
      <Abs x={1420} y={830} style={{ opacity: pr(f, 120, 135) }}>
        <div style={{ fontFamily: SG, fontSize: 28, color: K.ink, background: "rgba(30,27,58,0.95)", border: `1px solid ${K.line}`, borderRadius: 22, padding: "14px 22px" }}>
          Answer ready · <span style={{ color: K.cyan }}>3 sources</span>
        </div>
      </Abs>
    </AbsoluteFill>
  );
};

const FACTS = [
  { t: "Call me Sam", x: -330, y: -230 },
  { t: "Answer in Hindi", x: 140, y: -280 },
  { t: "Keep answers short", x: -420, y: 20 },
  { t: "I code in Kotlin", x: 180, y: -40 },
  { t: "I'm vegetarian", x: -260, y: 250 },
  { t: "No emojis, please", x: 190, y: 210 },
];
const Constellation: React.FC<{ f: number; cx: number; cy: number; del: number; scale?: number }> = ({ f, cx, cy, del, scale = 1 }) => {
  const gone = pr(f, del, del + 40);
  const bin = { x: cx + 330 * scale, y: cy + 330 * scale };
  return (
    <>
      <svg width={3000} height={3000} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
        {FACTS.map((a, i) =>
          FACTS.slice(i + 1).map((b, j) => {
            if ((i + j) % 2) return null;
            const o = pr(f, 30 + i * 10, 50 + i * 10) * (i === 4 || i + j + 1 === 4 ? 1 - gone : 1);
            return <line key={`${i}-${j}`} x1={cx + a.x * scale + 120} y1={cy + a.y * scale + 30} x2={cx + b.x * scale + 120} y2={cy + b.y * scale + 30} stroke="rgba(139,92,246,0.5)" strokeWidth={2} opacity={o} />;
          }),
        )}
      </svg>
      {FACTS.map((fa, i) => {
        const t = pr(f, 10 + i * 10, 30 + i * 10);
        const del4 = i === 4 ? gone : 0;
        return (
          <Fact
            key={fa.t}
            text={fa.t}
            o={t * (1 - del4)}
            style={{
              left: mix(cx + fa.x * scale, bin.x, del4),
              top: mix(cy + fa.y * scale, bin.y, del4) + Math.sin(f / 28 + i) * 8,
              transform: `scale(${mix(0.6, 1, t) * mix(1, 0.2, del4) * scale})`,
              transformOrigin: "left top",
              border: i === 4 && f > del - 10 ? `2px solid ${K.red}` : undefined,
            }}
          />
        );
      })}
      <div
        style={{
          position: "absolute",
          left: bin.x - 10,
          top: bin.y - 10,
          width: 90 * scale,
          height: 90 * scale,
          borderRadius: 22,
          display: "grid",
          placeItems: "center",
          fontSize: 46 * scale,
          background: "rgba(244,63,94,0.15)",
          border: `2px solid ${K.red}`,
          boxShadow: `0 0 ${20 + 40 * Math.sin(Math.PI * gone)}px ${K.red}`,
          opacity: pr(f, del - 20, del - 5) * (1 - pr(f, del + 70, del + 85)),
        }}
      >
        <svg width={46 * scale} height={52 * scale} viewBox="0 0 24 26" fill="none" stroke={K.red} strokeWidth={2.2} strokeLinecap="round">
          <path d="M3 6h18M8 6V3h8v3M5 6l1.5 18h11L19 6M10 11v9M14 11v9" />
        </svg>
      </div>
    </>
  );
};
const Learn: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Abs x={110} y={0} w={760} h={1080} style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Kicker f={f} at={8} text="Tell it once. It remembers." out={220} />
        <Kicker f={f} at={232} text="Every item. Your choice." />
        <div style={{ height: 18 }} />
        <Words f={f} at={0} text="IT LEARNS | *YOU." size={180} out={222} glow />
        <Words f={f} at={232} text="SEE IT. | *DELETE IT." size={170} glow />
      </Abs>
      <Constellation f={f} cx={1250} cy={480} del={250} />
    </AbsoluteFill>
  );
};

const Privacy: React.FC = () => {
  const f = useCurrentFrame();
  const lock = pr(f, 30, 50);
  const chips = ["No account", "No sign-up", "Chats encrypted on your device", "Every connection listed"];
  const log = ["Web search ............ allowed", "Model download ........ allowed", "Licence check ......... allowed", "OFFLINE MODE .......... all blocked"];
  return (
    <AbsoluteFill>
      <Abs x={110} y={0} w={760} h={1080} style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <Words f={f} at={0} text="NO ACCOUNT. | NO *SIGN-UP." size={140} out={200} />
        <Words f={f} at={208} text="YOUR DATA. | YOUR DEVICE. | YOUR *CONTROL." size={118} stagger={6} glow />
      </Abs>
      <Abs x={1000} y={150} style={{ transform: `scale(${mix(0.9, 1, pr(f, 0, 30))})` }}>
        <Phone w={300}>
          <Screen src="scr_home_offline.jpg" />
        </Phone>
      </Abs>
      {/* lock */}
      <Abs x={1105} y={30} style={{ opacity: pr(f, 10, 24) }}>
        <svg width={110} height={130} viewBox="0 0 110 130" style={{ filter: `drop-shadow(0 0 20px ${K.violet})` }}>
          <path d={`M25 ${70 - lock * 0} V40 a30 30 0 0 1 60 0 V${mix(30, 60, lock)}`} fill="none" stroke={K.cyan} strokeWidth={10} strokeLinecap="round" />
          <rect x={10} y={60} width={90} height={66} rx={14} fill={K.violet} />
          <circle cx={55} cy={92} r={9} fill={K.night} />
        </svg>
      </Abs>
      {chips.map((c, i) => {
        const t = pr(f, 40 + i * 16, 58 + i * 16);
        return (
          <Abs key={c} x={1390} y={180 + i * 118} style={{ opacity: t, transform: `translateX(${(1 - t) * 80}px)` }}>
            <div style={{ fontFamily: SG, fontWeight: 700, fontSize: 28, color: K.ink, background: K.glass, border: `1.5px solid ${K.cyan}`, borderRadius: 999, padding: "14px 26px", whiteSpace: "nowrap", boxShadow: `0 0 30px rgba(34,211,238,0.3)` }}>
              ✓ {c}
            </div>
          </Abs>
        );
      })}
      <Abs x={1390} y={680} style={{ opacity: pr(f, 130, 145) }}>
        <Toggle on={pr(f, 160, 172)} label="Offline mode" w={470} />
      </Abs>
      <Abs x={1395} y={820} w={470} style={{ fontFamily: MONO, fontSize: 19, color: K.dim, opacity: pr(f, 150, 165) }}>
        {log.map((l, i) => (
          <div key={l} style={{ color: i === 3 && f > 172 ? K.red : K.dim, opacity: pr(f, 150 + i * 6, 158 + i * 6), whiteSpace: "nowrap" }}>
            {l}
          </div>
        ))}
      </Abs>
    </AbsoluteFill>
  );
};

const Soon: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Abs x={410} y={90}>
        <Devices f={f} at={6} />
      </Abs>
      <Abs x={0} y={600} w={1920}>
        <Words f={f} at={30} text="AGENTS. YOUR PC. | *EVERYWHERE." size={130} align="center" stagger={6} />
      </Abs>
      <Abs x={0} y={900} w={1920} style={{ display: "flex", justifyContent: "center" }}>
        <Stamp f={f} at={120} text="COMING SOON" size={64} />
      </Abs>
    </AbsoluteFill>
  );
};

const Finale: React.FC<{ reel?: boolean; d: number }> = ({ reel = false, d }) => {
  const f = useCurrentFrame();
  const { width: W } = useVideoConfig();
  const size = reel ? 440 : 300;
  return (
    <AbsoluteFill style={{ opacity: 1 - lin(f, d - 24, d) }}>
      <Converge f={f} at={0} len={26} cx={W / 2} cy={reel ? 560 : 230} n={80} />
      <Abs x={W / 2 - size / 2} y={(reel ? 560 : 230) - size / 2}>
        <Logo f={f} at={14} size={size} />
      </Abs>
      <Flash f={f} at={16} />
      <Abs x={0} y={reel ? 820 : 400} w={W} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: reel ? 26 : 16 }}>
        <Wordmark f={f} at={24} size={reel ? 140 : 120} />
        <Words f={f} at={reel ? 40 : 50} text={reel ? "YOUR AI. | YOUR *RULES." : "NOT JUST ANOTHER *AI."} size={reel ? 120 : 70} align="center" />
        <div
          style={{
            marginTop: reel ? 30 : 20,
            opacity: pr(f, reel ? 70 : 100, reel ? 82 : 112),
            transform: `scale(${mix(0.8, 1, pr(f, reel ? 70 : 100, reel ? 82 : 112))})`,
            fontFamily: SG,
            fontWeight: 700,
            fontSize: reel ? 52 : 44,
            color: K.night,
            background: `linear-gradient(90deg, ${K.cyan}, ${K.violet}, ${K.magenta})`,
            borderRadius: 999,
            padding: reel ? "22px 56px" : "18px 48px",
            boxShadow: "0 0 60px rgba(139,92,246,0.7)",
          }}
        >
          ▶ Free on Google Play
        </div>
        {!reel ? (
          <div style={{ marginTop: 34, fontFamily: SG, fontSize: 34, color: K.dim, textAlign: "center", lineHeight: 1.5, opacity: pr(f, 150, 170) }}>
            I wasn't created to follow the future.
            <br />
            <span style={{ color: K.ink }}>I was created to help build it.</span>
          </div>
        ) : null}
      </Abs>
    </AbsoluteFill>
  );
};

/* =========================================================== YOUTUBE */
type Sc = { id: string; from: number; to: number; C: React.FC; tint?: string };
const YT_SCENES: Sc[] = [
  { id: "hook", from: 0, to: bar(6), C: () => <Hook /> },
  { id: "cloud", from: bar(6), to: bar(14), C: Cloud, tint: "rgba(99,102,241,0.30)" },
  { id: "logo", from: bar(14), to: bar(20), C: () => <LogoReveal /> },
  { id: "brain", from: bar(20), to: bar(28), C: Brain },
  { id: "ui", from: bar(28), to: bar(36), C: Interface },
  { id: "game", from: bar(36), to: bar(41), C: Game, tint: "rgba(244,63,94,0.28)" },
  { id: "files", from: bar(41), to: bar(45), C: Files, tint: "rgba(59,130,246,0.35)" },
  { id: "paint", from: bar(45), to: bar(50), C: PaintScene, tint: "rgba(217,70,239,0.35)" },
  { id: "video", from: bar(50), to: bar(53), C: VideoScene },
  { id: "vision", from: bar(53), to: bar(56), C: Vision, tint: "rgba(34,211,238,0.30)" },
  { id: "voice", from: bar(56), to: bar(59), C: Voice },
  { id: "docs", from: bar(59), to: bar(62), C: Docs, tint: "rgba(250,204,21,0.18)" },
  { id: "web", from: bar(62), to: bar(67), C: Web, tint: "rgba(34,211,238,0.30)" },
  { id: "learn", from: bar(67), to: bar(73), C: Learn },
  { id: "privacy", from: bar(73), to: bar(79), C: Privacy, tint: "rgba(99,102,241,0.35)" },
  { id: "soon", from: bar(79), to: bar(83), C: Soon },
];
export const YT_FRAMES = 5796; // music length 193.2 s
const FINALE_FROM = bar(83);

export const RexuzYouTube: React.FC = () => {
  const f = useCurrentFrame();
  const cur = YT_SCENES.find((s) => f >= s.from && f < s.to);
  return (
    <AbsoluteFill style={{ background: K.night }}>
      <Bg f={f} tint={cur?.tint} />
      <Dust f={f} />
      {YT_SCENES.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from} name={s.id}>
          <Shell d={s.to - s.from}>
            <s.C />
          </Shell>
        </Sequence>
      ))}
      <Sequence from={FINALE_FROM} durationInFrames={YT_FRAMES - FINALE_FROM} name="finale">
        <Finale d={YT_FRAMES - FINALE_FROM} />
      </Sequence>
      {YT_SCENES.slice(1).map((s) => (
        <Flash key={s.id} f={f} at={s.from} len={s.id === "game" ? 14 : 7} color={s.id === "game" ? "#fff" : "rgba(180,200,255,1)"} />
      ))}
      <Flash f={f} at={FINALE_FROM} len={8} />
      <Vignette strength={0.7} />
      <Grain opacity={0.06} />
      <Audio src={R("music_youtube.mp3")} />
    </AbsoluteFill>
  );
};

/* =========================================================== REEL */
const ReelFeature: React.FC<{ title: string; kicker?: string; note?: boolean; children: React.ReactNode }> = ({ title, kicker, note, children }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Abs x={50} y={230} w={980} style={{ transform: `translateX(${shakeX(f, 0, 12)}px)` }}>
        {kicker ? <Kicker f={f} at={4} text={kicker} align="center" size={34} /> : null}
        <div style={{ height: 10 }} />
        <Words f={f} at={0} text={title} size={150} align="center" stagger={3} glow />
      </Abs>
      <AbsoluteFill style={{ top: 620, height: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</AbsoluteFill>
      {note ? <Note f={f} at={6} text={ILLU} style={{ left: 290, top: 1640 }} /> : null}
    </AbsoluteFill>
  );
};
const RF = (title: string, el: (f: number) => React.ReactNode, kicker?: string, note?: boolean): React.FC => {
  const C: React.FC = () => {
    const f = useCurrentFrame();
    return (
      <ReelFeature title={title} kicker={kicker} note={note}>
        {el(f)}
      </ReelFeature>
    );
  };
  return C;
};
const FastBoard: React.FC<{ f: number }> = ({ f }) => <GameBoard f={f * 2} at={0} size={720} />;
const REEL_SCENES: Sc[] = [
  { id: "hook", from: 0, to: bar(4), C: () => <Hook reel /> },
  { id: "logo", from: bar(4), to: bar(6), C: () => <LogoReveal reel /> },
  { id: "game", from: bar(6), to: bar(7), C: RF("BUILDS | *GAMES.", (f) => <FastBoard f={f} />, "From one message"), tint: "rgba(244,63,94,0.28)" },
  { id: "files", from: bar(7), to: bar(8), C: RF("WRITES | *FILES.", (f) => <div style={{ transform: "scale(0.98) translateX(40px)" }}><FilesFan f={f} at={0} /></div>, "PDF · Word · Excel · code") },
  { id: "paint", from: bar(8), to: bar(9), C: RF("PAINTS | *OFFLINE.", (f) => <Paint f={f} at={0} src="img_anime.jpg" size={820} stepLen={6} />, undefined, true), tint: "rgba(217,70,239,0.35)" },
  {
    id: "video",
    from: bar(9),
    to: bar(10),
    C: RF("EVEN | *VIDEO.", () => <div style={{ position: "relative", width: 1000, height: 562 }}><VideoFrame src="gem_robot.mp4" w={1000} startFrom={60} /></div>, "On powerful phones", true),
  },
  { id: "vision", from: bar(10), to: bar(11), C: RF("SEES YOUR | *PHOTOS.", (f) => <Scan f={f} at={0} src="img_car.jpg" w={920} h={700} />, undefined, true), tint: "rgba(34,211,238,0.30)" },
  { id: "voice", from: bar(11), to: bar(12), C: RF("HEARS | *YOU.", (f) => <MicRing f={f} size={760} />, "English · Hindi · and more") },
  { id: "docs", from: bar(12), to: bar(13), C: RF("READS YOUR | *PDFS.", (f) => <div style={{ transform: "scale(1.45)" }}><DocPage f={f} at={0} /></div>, "With page numbers") },
  { id: "web", from: bar(13), to: bar(14.5), C: RF("KNOWS | *TODAY.", (f) => <Globe f={f} size={760} />, "Live news · prices · scores"), tint: "rgba(34,211,238,0.30)" },
  {
    id: "learn",
    from: bar(14.5),
    to: bar(16),
    C: RF("LEARNS | *YOU.", (f) => <div style={{ position: "relative", width: 1080, height: 1000 }}><Constellation f={f} cx={560} cy={420} del={9999} scale={1.05} /></div>, "Only you"),
  },
  {
    id: "privacy",
    from: bar(16),
    to: bar(18),
    C: RF(
      "NO ACCOUNT. | NO *CLOUD.",
      (f) => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40 }}>
          <Toggle on={pr(f, 30, 42)} label="Offline mode" w={760} />
          {["Chats encrypted on your device", "Every connection listed"].map((c, i) => (
            <div key={c} style={{ opacity: pr(f, 50 + i * 14, 64 + i * 14), fontFamily: SG, fontWeight: 700, fontSize: 40, color: K.ink, background: K.glass, border: `1.5px solid ${K.cyan}`, borderRadius: 999, padding: "18px 36px" }}>
              ✓ {c}
            </div>
          ))}
        </div>
      ),
      "Your device. Your rules.",
    ),
    tint: "rgba(99,102,241,0.35)",
  },
];
export const REEL_FRAMES = 1350;
const REEL_FINALE = bar(18);

export const RexuzReel: React.FC = () => {
  const f = useCurrentFrame();
  const cur = REEL_SCENES.find((s) => f >= s.from && f < s.to);
  return (
    <AbsoluteFill style={{ background: K.night }}>
      <Bg f={f} tint={cur?.tint} />
      <Dust f={f} n={30} />
      {REEL_SCENES.map((s) => (
        <Sequence key={s.id} from={s.from} durationInFrames={s.to - s.from} name={s.id}>
          <Shell d={s.to - s.from}>
            <s.C />
          </Shell>
        </Sequence>
      ))}
      <Sequence from={REEL_FINALE} durationInFrames={REEL_FRAMES - REEL_FINALE} name="finale">
        <Finale reel d={REEL_FRAMES - REEL_FINALE} />
      </Sequence>
      {REEL_SCENES.slice(1).map((s) => (
        <Flash key={s.id} f={f} at={s.from} len={7} />
      ))}
      <Flash f={f} at={REEL_FINALE} len={8} />
      <Vignette strength={0.65} />
      <Grain opacity={0.06} />
      <Audio src={R("music_reel.mp3")} />
    </AbsoluteFill>
  );
};
