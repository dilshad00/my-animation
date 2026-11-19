/**
 * UNKNOWN GAMER — "GPU & RAM Price Crisis" style demo (cold open, 0:00–0:31).
 * Standalone composition "UG-Demo" (no projects/ folder). Timed to the owner's
 * ElevenLabs narration using local Whisper word timings.
 */
import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CliffChart } from "./CliffChart";
import { Captions, clamp, ease, Footage, Glitch, Grain, LightLeak, type Phrase, shake, SourceTag, Vignette, whip } from "./fx";
import { PriceRoll } from "./PriceRoll";
import { RamStick3D } from "./RamStick3D";
import { C, DISPLAY, INTER, MONO } from "./theme";

export const UG_DEMO_FRAMES = 945;

const A = (f: string) => staticFile(`ug-001/${f}`);

/** Frame cues (30 fps), from word timings of narration.mp3. */
const T = {
  s2: 58, today: 189, roll: 211, land: 258, s3: 280, msrp: 329, crack: 393, s4: 463, cut: 468,
  drop: 562, minus: 573, cal: 656, s5: 693, m2: 740, m3: 783, cracking: 798, m4: 826, m5: 870, worse: 879, end: 918,
};

const PHRASES: Phrase[] = [
  { s: 0.0, e: 1.55, t: "$72." },
  { s: 1.74, e: 4.48, t: "That's what 32 gigs of fast DDR5" },
  { s: 4.48, e: 5.85, t: "cost at its cheapest." },
  { s: 6.32, e: 6.7, t: "Today?" },
  { s: 7.04, e: 8.95, t: "$474." },
  { s: 9.4, e: 12.14, t: "A graphics card that launched at $1,999" },
  { s: 12.14, e: 15.3, t: "is selling for over $6,000 in America." },
  { s: 15.6, e: 17.6, t: "And yet, earlier this month in Europe," },
  { s: 17.98, e: 20.8, t: "that same card dropped €2,840" },
  { s: 20.8, e: 22.65, t: "in eight days." },
  { s: 23.34, e: 24.45, t: "So which is it?" },
  { s: 24.72, e: 27.05, t: "Is the PC gaming market finally cracking?" },
  { s: 27.54, e: 29.7, t: "Or are we being set up for something even worse?" },
];

const speaking = (t: number) => PHRASES.some((p) => t >= p.s - 0.08 && t <= p.e + 0.15);
/** 0 = silence, 1 = voice; smoothed over ±0.2 s for a soft duck. */
const voice = (t: number) => {
  let s = 0;
  for (let k = -4; k <= 4; k++) s += speaking(t + k * 0.05) ? 1 : 0;
  return s / 9;
};

// ---------------------------------------------------------------- scene 1+2: RAM
const RamScene: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bgO = interpolate(f, [T.s2 - 4, T.s2 + 10], [0, 1], clamp);
  const enter = interpolate(f, [0, 14], [0, 1], { ...clamp, easing: ease });
  const install = f >= T.s2 && f < T.s2 + 8 ? Math.sin(((f - T.s2) / 8) * Math.PI) * 22 : 0;
  const rotY = interpolate(f, [0, T.s2, T.s3 + 10], [-40, -20, -4], clamp);
  const rotX = interpolate(f, [0, T.s3], [16, 9], clamp);
  const sc = interpolate(f, [0, T.s2, T.s3], [0.78, 0.72, 0.76], clamp);
  const tagIn = spring({ frame: f - 4, fps, config: { damping: 14, stiffness: 180 } });
  const rollP = interpolate(f, [T.roll, T.land], [0, 1], clamp);
  const isRed = f >= T.land - 3;
  const priceColor = isRed ? C.red : C.green;
  const twitch = f >= T.today && f < T.today + 10 ? Math.sin(f * 3) * 4 * (1 - (f - T.today) / 10) : 0;
  const chip = spring({ frame: f - (T.land + 4), fps, config: { damping: 12 } });
  const redFlash = interpolate(f, [T.land, T.land + 2, T.land + 10], [0, 0.35, 0], clamp);
  const w = whip(f, T.s3 - 4, null);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, transform: `${w.transform} ${shake(f, T.land, 14, 18)}`, filter: w.filter }}>
      <AbsoluteFill style={{ opacity: bgO }}>
        <Sequence from={T.s2 - 4} durationInFrames={T.today - T.s2 + 4} layout="none">
          <Footage src="ug-001/footage/chipset_a.mp4" dur={135} zoom={[1.08, 1.2]} pan={[20, -40]} blur={2.5} dim={0.42} />
        </Sequence>
        <Sequence from={T.today} durationInFrames={T.s3 - T.today + 12} layout="none">
          <Footage src="ug-001/footage/board_b.mp4" dur={100} zoom={[1.15, 1.05]} pan={[-30, 10]} blur={2.5} dim={0.45} />
        </Sequence>
        <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(5,7,10,0.2) 0%, rgba(5,7,10,0.35) 50%, rgba(5,7,10,0.85) 100%)" }} />
      </AbsoluteFill>
      {/* rim light behind the module */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 34% 50%, rgba(53,242,154,${0.18 * enter}) 0%, rgba(0,0,0,0) 45%)`,
          opacity: isRed ? 0 : 1,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 34% 50%, rgba(255,61,82,0.22) 0%, rgba(0,0,0,0) 45%)`,
          opacity: interpolate(f, [T.land - 3, T.land + 6], [0, 1], clamp),
        }}
      />
      <AbsoluteFill style={{ perspective: 1800, alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: `translate(${-330}px, ${install + (1 - enter) * 60}px)`, opacity: enter }}>
          <RamStick3D rotY={rotY} rotX={rotX} scale={sc} glow={interpolate(f, [0, 20], [0, 1], clamp)} hue={isRed ? 350 : 150} />
        </div>
      </AbsoluteFill>
      {/* price tag */}
      <div style={{ position: "absolute", left: 1180, top: 330, transform: `translateX(${twitch}px) scale(${0.8 + 0.2 * tagIn})`, opacity: tagIn, transformOrigin: "left center" }}>
        <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: C.mute, marginBottom: 6 }}>32GB DDR5-6000</div>
        <PriceRoll from={72} to={474} p={rollP} size={200} color={priceColor} glow={0.5} />
        <div style={{ marginTop: 10, fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: 3, color: priceColor }}>
          {isRed ? "CHEAPEST KIT · 17 NOV 2026" : "LOWEST PRICE EVER TRACKED"}
        </div>
        <div
          style={{
            marginTop: 26,
            display: "inline-block",
            padding: "8px 18px",
            borderRadius: 10,
            background: C.red,
            color: "#fff",
            fontFamily: MONO,
            fontWeight: 800,
            fontSize: 44,
            transform: `scale(${chip})`,
            transformOrigin: "left center",
            boxShadow: `0 0 40px rgba(255,61,82,0.55)`,
          }}
        >
          +558%
        </div>
      </div>
      <AbsoluteFill style={{ background: C.red, opacity: redFlash, mixBlendMode: "screen" }} />
      <SourceTag text="Tom's Hardware RAM price index · US · 17 Nov 2026" at={T.land + 6} until={T.s3 - 2} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- scene 3: RTX 5090
const Crack: React.FC<{ f: number; at: number; w: number; h: number }> = ({ f, at, w, h }) => {
  if (f < at) return null;
  const p = interpolate(f, [at, at + 6], [0, 1], clamp);
  const cx = w * 0.45;
  const cy = h * 0.5;
  const lines = Array.from({ length: 11 }, (_, i) => {
    const a = (i / 11) * Math.PI * 2 + Math.sin(i * 7.1) * 0.4;
    const r = (0.55 + ((i * 37) % 10) / 22) * w * 0.55;
    const mid = r * 0.5;
    const ja = a + Math.sin(i * 3.3) * 0.25;
    return `M${cx},${cy} L${cx + Math.cos(ja) * mid},${cy + Math.sin(ja) * mid} L${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
  });
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      {lines.map((d, i) => (
        <path key={i} d={d} stroke="rgba(255,255,255,0.9)" strokeWidth={2.4} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p} />
      ))}
    </svg>
  );
};

const GpuScene: React.FC = () => {
  const g = useCurrentFrame(); // local, starts at T.s3 - 4
  const f = g + T.s3 - 4;
  const { fps } = useVideoConfig();
  const p = interpolate(f, [T.s3, T.s4 + 8], [0, 1], clamp);
  const x = interpolate(p, [0, 1], [260, 120], { easing: ease });
  const rotY = interpolate(p, [0, 1], [-26, -12]);
  const sweep = interpolate(f, [T.s3 + 10, T.s3 + 70], [-30, 130], clamp);
  const msrpIn = spring({ frame: f - T.msrp, fps, config: { damping: 14 } });
  const flipped = f >= T.crack + 5;
  const flip = interpolate(f, [T.crack + 3, T.crack + 9], [0, 1], clamp);
  const chip = spring({ frame: f - (T.crack + 12), fps, config: { damping: 11 } });
  const wIn = whip(f, null, T.s3 - 4, 10);
  const GW = 1250;
  const GH = (GW * 1511) / 2200;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, transform: `${wIn.transform} ${shake(f, T.crack, 10, 10)}`, filter: wIn.filter }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 62% 42%, rgba(40,215,255,0.16) 0%, rgba(0,0,0,0) 55%), radial-gradient(ellipse at 50% 100%, rgba(255,182,72,0.10) 0%, rgba(0,0,0,0) 50%)" }} />
      {/* floor line */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 850, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)" }} />
      <div style={{ position: "absolute", left: 960 - GW / 2 + x + 140, top: 850 - GH + 50, width: GW, height: GH, perspective: 2200 }}>
        <div style={{ width: GW, height: GH, transform: `rotateY(${rotY}deg) rotateX(4deg)`, transformStyle: "preserve-3d" }}>
          <Img src={A("img/gpu5090_cutout.webp")} style={{ width: GW, height: GH, filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.8)) brightness(0.92) contrast(1.08)" }} />
          {/* light sweep masked to the card */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              WebkitMaskImage: `url(${A("img/gpu5090_cutout.webp")})`,
              WebkitMaskSize: "100% 100%",
              maskImage: `url(${A("img/gpu5090_cutout.webp")})`,
              maskSize: "100% 100%",
              background: `linear-gradient(110deg, rgba(255,255,255,0) ${sweep - 12}%, rgba(255,255,255,0.45) ${sweep}%, rgba(255,255,255,0) ${sweep + 12}%)`,
              mixBlendMode: "screen",
            }}
          />
          {/* floor reflection */}
          <Img
            src={A("img/gpu5090_cutout.webp")}
            style={{
              position: "absolute",
              left: 0,
              top: GH - 10,
              width: GW,
              height: GH,
              transform: "scaleY(-1)",
              opacity: 0.16,
              WebkitMaskImage: "linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 35%)",
              maskImage: "linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 35%)",
              filter: "blur(2px)",
            }}
          />
        </div>
      </div>
      {/* headline */}
      <div style={{ position: "absolute", left: 110, top: 150, opacity: interpolate(f, [T.s3 + 6, T.s3 + 18], [0, 1], clamp) }}>
        <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 24, letterSpacing: 6, color: C.teal }}>NVIDIA FLAGSHIP</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 120, color: C.ink, lineHeight: 1, letterSpacing: 2 }}>RTX 5090</div>
      </div>
      {/* price block */}
      <div style={{ position: "absolute", left: 110, top: 600, opacity: msrpIn, transform: `translateY(${(1 - msrpIn) * 30}px)` }}>
        <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 24, letterSpacing: 5, color: flipped ? C.red : C.mute }}>
          {flipped ? "CHEAPEST NEW LISTING · US" : "LAUNCH PRICE (MSRP)"}
        </div>
        <div style={{ position: "relative", height: 150, perspective: 900 }}>
          <div
            style={{
              fontFamily: MONO,
              fontWeight: 800,
              fontSize: 140,
              lineHeight: "150px",
              color: flipped ? C.red : C.ink,
              transform: `rotateX(${flipped ? (1 - flip) * -90 : flip * 90}deg)`,
              textShadow: flipped ? `0 0 40px rgba(255,61,82,0.6)` : undefined,
            }}
          >
            {flipped ? "$6,199" : "$1,999"}
          </div>
          {!flipped ? <Crack f={f} at={T.crack} w={520} h={150} /> : null}
        </div>
        {flipped ? (
          <div style={{ display: "flex", gap: 16, marginTop: 14, alignItems: "center" }}>
            <div style={{ padding: "6px 16px", borderRadius: 10, background: C.red, color: "#fff", fontFamily: MONO, fontWeight: 800, fontSize: 40, transform: `scale(${chip})`, transformOrigin: "left center" }}>+210%</div>
            <div style={{ fontFamily: MONO, fontSize: 26, color: C.mute, textDecoration: "line-through", opacity: chip }}>MSRP $1,999</div>
          </div>
        ) : null}
      </div>
      <SourceTag text="Street: shattered.io tracker · 13 Nov 2026 · Photo: PantheraLeo1359531, CC BY 4.0" at={T.crack + 8} until={T.s4 + 4} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- scene 4: the EU cliff
const ChartScene: React.FC = () => {
  const g = useCurrentFrame();
  const f = g + T.s4;
  const { fps } = useVideoConfig();
  const riseP = interpolate(f, [T.cut + 6, T.drop - 6], [0, 1], { ...clamp, easing: ease });
  const dropP = interpolate(f, [T.drop, T.drop + 26], [0, 1], { ...clamp, easing: ease });
  const zoom = interpolate(f, [T.drop, T.s5], [1, 1.07], clamp);
  const minus = spring({ frame: f - T.minus, fps, config: { damping: 12 } });
  const pct = spring({ frame: f - (T.minus + 24), fps, config: { damping: 14 } });
  const calP = interpolate(f, [T.cal, T.cal + 10], [0, 1], { ...clamp, easing: ease });
  const calIn = interpolate(f, [T.cal - 30, T.cal - 18], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          transform: `translateY(${-g * 0.4}px)`,
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 30% 30%, rgba(40,215,255,0.10), transparent 60%)" }} />
      <div style={{ position: "absolute", left: 110, top: 100, fontFamily: INTER, fontWeight: 700, fontSize: 26, letterSpacing: 6, color: C.teal, opacity: interpolate(f, [T.cut, T.cut + 12], [0, 1], clamp) }}>
        EUROPE · NOVEMBER 2026
      </div>
      <div style={{ position: "absolute", left: 60, top: 250, transform: `scale(${zoom})`, transformOrigin: "80% 80%" }}>
        <CliffChart f={f} riseP={riseP} dropP={dropP} appear={T.cut} />
      </div>
      {/* callout */}
      <div style={{ position: "absolute", right: 100, top: 260, textAlign: "right" }}>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 112, color: C.green, lineHeight: 1, transform: `scale(${minus})`, transformOrigin: "right center", textShadow: "0 0 50px rgba(53,242,154,0.5)" }}>
          −€2,840
        </div>
        <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 34, color: C.ink, marginTop: 12, opacity: pct, letterSpacing: 2 }}>
          −33.6% <span style={{ color: C.mute }}>in just</span>
        </div>
      </div>
      {/* calendar flip */}
      <div style={{ position: "absolute", right: 100, top: 470, opacity: calIn, display: "flex", alignItems: "center", gap: 22, perspective: 800 }}>
        <div style={{ position: "relative", width: 230, height: 120 }}>
          {[
            { t: "6 NOV", show: 1 - calP, rot: calP * -90 },
            { t: "14 NOV", show: calP, rot: (1 - calP) * 90 },
          ].map((c) => (
            <div
              key={c.t}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 14,
                background: "linear-gradient(180deg, #1b2129, #0e1217)",
                border: `1px solid ${C.line}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: 64,
                color: C.ink,
                opacity: c.show > 0.02 ? 1 : 0,
                transform: `rotateX(${c.rot}deg)`,
                backfaceVisibility: "hidden",
              }}
            >
              {c.t}
            </div>
          ))}
        </div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 70, color: C.green, opacity: calP }}>8 DAYS</div>
      </div>
      <SourceTag text="Pro-Gamer European GPU Barometer · 14 Nov 2026" at={T.minus} until={T.s5 + 2} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- scene 5: montage
const Word: React.FC<{ text: string; at: number; color: string }> = ({ text, at, color }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 10, stiffness: 200 } });
  if (f < at) return null;
  const jit = f - at < 5 ? (f % 2 ? 8 : -8) : 0;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", transform: `scale(${1.25 - 0.25 * s})`, opacity: s }}>
        {[
          { c: "rgba(40,215,255,0.8)", x: -jit },
          { c: "rgba(255,61,82,0.8)", x: jit },
          { c: color, x: 0 },
        ].map((l, i) => (
          <div
            key={i}
            style={{
              position: i === 2 ? "relative" : "absolute",
              left: 0,
              top: 0,
              transform: `translateX(${l.x}px)`,
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 230,
              letterSpacing: 8,
              color: l.c,
              mixBlendMode: i < 2 ? "screen" : undefined,
              textShadow: i === 2 ? "0 10px 50px rgba(0,0,0,0.7)" : undefined,
            }}
          >
            {text}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Montage: React.FC = () => {
  const g = useCurrentFrame();
  const f = g + T.s5;
  const shots: { from: number; to: number; el: React.ReactNode }[] = [
    { from: T.s5, to: T.m2, el: <Footage src="ug-001/footage/gamer_upset.mp4" from={50} dur={47} zoom={[1.05, 1.16]} dim={0.2} /> },
    { from: T.m2, to: T.m3, el: <Footage src="ug-001/footage/headset_close.mp4" from={10} dur={43} zoom={[1.0, 1.12]} pan={[0, -30]} dim={0.15} /> },
    {
      from: T.m3,
      to: T.m4,
      el: (
        <AbsoluteFill style={{ overflow: "hidden" }}>
          <Img src={A("img/gpu5090_fan.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1.05 + (f - T.m3) * 0.004})`, filter: "brightness(0.55) contrast(1.15) saturate(0.8)" }} />
          <AbsoluteFill style={{ left: 560, top: 300 }}>
            <Crack f={f} at={T.cracking} w={800} h={480} />
          </AbsoluteFill>
        </AbsoluteFill>
      ),
    },
    { from: T.m4, to: T.m5, el: <Footage src="ug-001/footage/fingers_mouse.mp4" from={0} dur={44} zoom={[1.1, 1.2]} pan={[0, 30]} dim={0.4} /> },
    { from: T.m5, to: T.end, el: <Footage src="ug-001/footage/gamer_upset.mp4" from={95} dur={48} zoom={[1.18, 1.3]} dim={0.25} /> },
  ];
  const redPulse = interpolate(f, [T.worse, T.worse + 3, T.end], [0, 0.35, 0.2], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {shots.map((s, i) => (
        <Sequence key={i} from={s.from - T.s5} durationInFrames={s.to - s.from} layout="none">
          <AbsoluteFill style={{ transform: `translateX(${f - s.from < 3 ? (i % 2 ? 30 : -30) * (1 - (f - s.from) / 3) : 0}px)` }}>{s.el}</AbsoluteFill>
        </Sequence>
      ))}
      <AbsoluteFill style={{ background: C.red, mixBlendMode: "multiply", opacity: redPulse }} />
      <Sequence from={T.cracking - T.s5} durationInFrames={T.m4 - T.cracking} layout="none">
        <Word text="CRACKING?" at={0} color={C.ink} />
      </Sequence>
      <Sequence from={T.worse - T.s5} durationInFrames={T.end - T.worse} layout="none">
        <Word text="OR WORSE?" at={0} color={C.red} />
      </Sequence>
      {[T.m2, T.m3, T.m4, T.m5].map((at) => (
        <Sequence key={at} from={at - T.s5 - 2} durationInFrames={10} layout="none">
          <Glitch at={2} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const EndCard: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 16 } });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", alignItems: "center", justifyContent: "center", transform: shake(f, 0, 10, 12) }}>
      <div style={{ textAlign: "center", transform: `scale(${1.1 - 0.1 * s})`, opacity: s }}>
        <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 26, letterSpacing: 10, color: C.amber }}>UNKNOWN GAMER</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 118, color: C.ink, letterSpacing: 4, lineHeight: 1.05, marginTop: 14 }}>
          THE GPU <span style={{ color: C.red }}>&</span> RAM
          <br />
          PRICE CRISIS
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- audio
type Sfx = [number, string, number];
const SFX: Sfx[] = [
  [0, "sfx/tech/deep-impact.mp3", 0.3],
  [5, "ug-001/audio/blip.wav", 0.25],
  [T.s2 + 2, "ug-001/audio/ram_click.wav", 0.55],
  [T.today, "ug-001/audio/blip.wav", 0.2],
  [T.roll, "ug-001/audio/odometer.wav", 0.4],
  [T.land, "sfx/impact.wav", 0.5],
  [T.s3 - 6, "sfx/swoosh.wav", 0.45],
  [T.msrp, "ug-001/audio/blip.wav", 0.25],
  [T.crack, "ug-001/audio/glass_crack.wav", 0.45],
  [T.crack, "sfx/tech/big-impact.mp3", 0.3],
  [T.s4 - 6, "ug-001/audio/whoosh_down.wav", 0.5],
  [500, "ug-001/audio/blip.wav", 0.15],
  [528, "ug-001/audio/blip.wav", 0.15],
  [554, "ug-001/audio/blip.wav", 0.18],
  [T.drop, "ug-001/audio/sub_drop.wav", 0.75],
  [T.minus, "sfx/impact.wav", 0.25],
  [T.cal, "sfx/tick.wav", 0.4],
  [T.s5 - 2, "ug-001/audio/glitch.wav", 0.3],
  [T.m2 - 1, "ug-001/audio/glitch.wav", 0.25],
  [T.m3 - 1, "ug-001/audio/glitch.wav", 0.25],
  [T.cracking, "ug-001/audio/glass_crack.wav", 0.4],
  [T.m4 - 1, "ug-001/audio/glitch.wav", 0.25],
  [T.m5 - 1, "ug-001/audio/glitch.wav", 0.25],
  [T.worse, "sfx/tech/deep-impact.mp3", 0.35],
  [T.end, "sfx/tech/big-impact.mp3", 0.55],
];

const Mix: React.FC<{ narration?: boolean }> = ({ narration = true }) => {
  const musicA = (f: number) => {
    const t = f / 30;
    const base = 0.3 - 0.2 * voice(t);
    const fadeIn = Math.min(1, f / 6);
    const cut = interpolate(f, [T.cut - 6, T.cut], [1, 0], clamp);
    return base * fadeIn * cut;
  };
  const musicB = (f: number) => {
    const abs = f + T.s5 - 4;
    const t = abs / 30;
    const base = 0.32 - 0.2 * voice(t);
    const fadeIn = Math.min(1, f / 10);
    const out = interpolate(abs, [T.end, T.end + 24], [1, 0], clamp);
    return base * fadeIn * out;
  };
  return (
    <>
      {narration ? <Audio src={A("audio/narration_demo.mp3")} volume={1} /> : null}
      <Sequence  durationInFrames={T.cut + 2} layout="none">
        <Audio src={A("audio/music_a.mp3")} volume={musicA} />
      </Sequence>
      <Sequence from={T.s5 - 4} durationInFrames={UG_DEMO_FRAMES - T.s5 + 4} layout="none">
        <Audio src={A("audio/music_b.mp3")} volume={musicB} />
      </Sequence>
      {SFX.map(([at, src, v], i) => (
        <Sequence key={i} from={at} durationInFrames={90} layout="none">
          <Audio src={staticFile(src)} volume={v} />
        </Sequence>
      ))}
    </>
  );
};

// ---------------------------------------------------------------- reuse in the full film
/** Cold open visuals (0:00 → T.end) + its music/SFX, without narration or captions. */
export const COLD_OPEN_END = T.end;
export const UgColdOpen: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    <Sequence durationInFrames={T.s3 + 8} name="s01-s02 RAM">
      <RamScene />
    </Sequence>
    <Sequence from={T.s3 - 4} durationInFrames={T.s4 - T.s3 + 12} name="s03 RTX 5090">
      <GpuScene />
    </Sequence>
    <Sequence from={T.s4} durationInFrames={T.s5 - T.s4} name="s04 EU cliff">
      <ChartScene />
    </Sequence>
    <Sequence from={T.s5} durationInFrames={T.end - T.s5 + 6} name="s05 montage">
      <Montage />
    </Sequence>
    <LightLeak at={T.s4} len={18} />
    <Glitch at={T.s5} />
  </AbsoluteFill>
);
export const UgColdOpenAudio: React.FC = () => <Mix narration={false} />;

// ---------------------------------------------------------------- root
export const UgDemo: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Sequence  durationInFrames={T.s3 + 8} name="s01-s02 RAM">
        <RamScene />
      </Sequence>
      <Sequence from={T.s3 - 4} durationInFrames={T.s4 - T.s3 + 12} name="s03 RTX 5090">
        <GpuScene />
      </Sequence>
      <Sequence from={T.s4} durationInFrames={T.s5 - T.s4} name="s04 EU cliff">
        <ChartScene />
      </Sequence>
      <Sequence from={T.s5} durationInFrames={T.end - T.s5} name="s05 montage">
        <Montage />
      </Sequence>
      <Sequence from={T.end} durationInFrames={UG_DEMO_FRAMES - T.end} name="end card">
        <EndCard />
      </Sequence>
      <LightLeak at={T.s4} len={18} />
      <Glitch at={T.s5} />
      <Vignette strength={0.7} />
      <Grain opacity={0.1} />
      {f < T.end ? <Captions phrases={PHRASES} /> : null}
      <Mix />
    </AbsoluteFill>
  );
};
