/**
 * UNKNOWN GAMER #001 — "The GPU & RAM Price Crisis" (full film, ~10:31).
 * Standalone composition "UG-001". Scene starts and word cues come from the owner's
 * ElevenLabs narration (local Whisper word timings → ug001.data.ts). Every figure on
 * screen is from E:/youtube/gpu-ram-crisis/research.md (fact ids noted per scene).
 */
import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Freeze, Img, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { CardGrid, Checklist, Donut, EU, Forecast, HbmStack, LineChart, MsrpBars, Podium, Split, Table, Wafer, WorldMap, type GridCard } from "./charts";
import { CliffChart } from "./CliffChart";
import { A, Badge, Card, Chapter, Chip, Clip, Head, Kicker, Lines, Num, Phone, Photo, Pos, pr, Shade, sp, Stage, Stamp } from "./blocks";
import { clamp, Glitch, Grain, LightLeak, shake, SourceTag, Vignette } from "./fx";
import { Confetti, Curtains, IconBot, IconCar, IconGpu, IconLaptop, IconPick, IconRam, IconTower, IconTrophy, ServerHall, TugOfWar, UpArrow } from "./illus";
import { PriceRoll } from "./PriceRoll";
import { RamStick3D } from "./RamStick3D";
import { C, DISPLAY, INTER, MONO } from "./theme";
import { CAPTIONS, SCENE_STARTS, TOTAL_FRAMES, VOX, WORDS } from "./ug001.data";
import { COLD_OPEN_END, UgColdOpen, UgColdOpenAudio } from "./UgDemo";

export const UG001_FRAMES = TOTAL_FRAMES;

// ---------------------------------------------------------------- timeline helpers
const START: Record<string, number> = Object.fromEntries(SCENE_STARTS);
const IDX: Record<string, number> = Object.fromEntries(SCENE_STARTS.map(([id], i) => [id, i]));
const endOf = (id: string) => (IDX[id] + 1 < SCENE_STARTS.length ? SCENE_STARTS[IDX[id] + 1][1] : TOTAL_FRAMES);
/** Frame (relative to scene start) of the n-th word in scene `id` starting with `w`. */
const cue = (id: string, w: string, n = 0, fb = 0) => {
  const s = START[id];
  const e = endOf(id);
  let k = 0;
  for (const [fr, t] of WORDS) {
    if (fr >= s && fr < e && t.replace(/^[$€₹]/, "").startsWith(w)) {
      if (k === n) return fr - s;
      k++;
    }
  }
  return fb;
};
/** Absolute frame of a word cue. */
const G = (id: string, w: string, n = 0) => START[id] + cue(id, w, n);

type P = { f: number; d: number; c: (w: string, n?: number, fb?: number) => number };

const Src: React.FC<{ t: string; at?: number; until?: number; d: number }> = ({ t, at = 12, until, d }) => <SourceTag text={t} at={at} until={until ?? d - 4} />;

// ---------------------------------------------------------------- scenes
const s06: React.FC<P> = ({ f, c }) => (
  <AbsoluteFill>
    <Stage f={f} accent="rgba(40,215,255,0.10)" x={50} y={50} />
    <WorldMap
      f={f}
      at={0}
      highlight={["United States of America", "India", ...EU]}
      pins={[
        { lon: -98, lat: 39, label: "USA", sub: "USD $", at: c("america") },
        { lon: 10, lat: 50, label: "EUROPE", sub: "EUR €", at: c("europe") },
        { lon: 78, lat: 21, label: "INDIA", sub: "INR ₹", at: c("india") },
      ]}
    />
    <Pos x={0} y={70} w={1920} style={{ display: "flex", justifyContent: "center", gap: 26 }}>
      {[
        ["PRICE TRACKERS", c("trackers")],
        ["INDUSTRY FORECASTS", c("forecasts")],
        ["STORE LISTINGS", c("listings")],
      ].map(([t, at]) => (
        <Card key={t as string} f={f} at={at as number} pad="14px 28px">
          <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 30, letterSpacing: 4, color: C.ink }}>{t}</div>
        </Card>
      ))}
    </Pos>
    <Pos x={0} y={820} w={1920} style={{ textAlign: "center" }}>
      <Head f={f} at={c("answer")} size={70} align="center" color={C.amber}>
        THE ANSWER ISN'T WHAT MOST PEOPLE THINK
      </Head>
    </Pos>
  </AbsoluteFill>
);

const s07: React.FC<P> = ({ f, c }) => {
  const s = sp(f, 4, 16);
  const split = interpolate(f, [4, 20], [16, 0], clamp);
  const gpuIn = sp(f, 0, 18);
  return (
    <AbsoluteFill style={{ transform: shake(f, 4, 10, 10) }}>
      <Stage f={f} accent="rgba(255,61,82,0.16)" x={50} y={45} />
      <AbsoluteFill style={{ perspective: 1800, alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: `translate(${-560 - (1 - s) * 600}px, -330px)`, opacity: s * 0.9 }}>
          <RamStick3D rotY={-30 + f * 0.3} rotX={12} scale={0.36} glow={1} hue={350} />
        </div>
      </AbsoluteFill>
      <Img src={A("img/gpu5090_cutout.webp")} style={{ position: "absolute", width: 560, left: 1300 + (1 - gpuIn) * 700, top: 660, opacity: gpuIn * 0.9, filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.8)) brightness(0.85)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", transform: `scale(${1.15 - 0.15 * s})`, opacity: Math.min(1, s * 1.4) }}>
          <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 28, letterSpacing: 12, color: C.amber }}>UNKNOWN GAMER PRESENTS</div>
          <div style={{ position: "relative", marginTop: 16 }}>
            {[
              { col: "rgba(40,215,255,0.85)", x: -split },
              { col: "rgba(255,61,82,0.85)", x: split },
              { col: C.ink, x: 0 },
            ].map((l, i) => (
              <div key={i} style={{ position: i === 2 ? "relative" : "absolute", inset: 0, transform: `translateX(${l.x}px)`, fontFamily: DISPLAY, fontWeight: 700, fontSize: 150, lineHeight: 1, letterSpacing: 4, color: l.col, mixBlendMode: i < 2 ? "screen" : undefined }}>
                THE GPU <span style={{ color: i === 2 ? C.red : l.col }}>&</span> RAM
                <br />
                PRICE CRISIS
              </div>
            ))}
          </div>
          <div style={{ marginTop: 30, display: "inline-block" }}>
            <Kicker f={f} at={c("follow")} color={C.amber} size={40}>
              → FOLLOW THE MONEY
            </Kicker>
          </div>
        </div>
      </AbsoluteFill>
      <LightLeak at={2} len={20} />
    </AbsoluteFill>
  );
};

const s08: React.FC<P> = ({ f, d, c }) => {
  const ram = c("ram");
  return (
    <AbsoluteFill>
      <Clip f={f} src="hands_mobo" d={d} dim={0.35} zoom={[1.05, 1.18]} />
      <Shade side="left" />
      <Pos x={130} y={210}>
        <Head f={f} at={ram} size={250} color={C.green}>
          RAM.
        </Head>
        <div style={{ marginTop: 10 }}>
          <Stamp f={f} at={c("boring")} color={C.mute} rot={-4} size={60}>
            THE BORING BIT
          </Stamp>
        </div>
        <div style={{ marginTop: 50 }}>
          <Lines
            f={f}
            size={44}
            items={[
              { t: "① Buy whatever kit is on sale", at: c("grabbed") },
              { t: "② Plug it in", at: c("plugged") },
              { t: "③ Forget it exists", at: c("forgot") },
            ]}
          />
        </div>
      </Pos>
      <Chapter f={f} n="01" title="THE RAM APOCALYPSE" len={Math.max(50, ram - 2)} />
    </AbsoluteFill>
  );
};

const s09: React.FC<P> = ({ f, c }) => (
  <AbsoluteFill>
    <Stage f={f} accent="rgba(255,61,82,0.12)" x={30} y={60} />
    <Pos x={90} y={250}>
      <LineChart f={f} labels={["ALL-TIME LOW", "AUG 2026", "17 NOV 2026"]} values={[72, 392, 474]} min={0} max={500} ticks={[0, 250, 500]} prefix="$" at={8} until={Math.max(40, c("august") + 30)} w={1000} h={500} title="32GB DDR5-6000 · CHEAPEST KIT · US" pointLabels={[0, 1, 2]} />
    </Pos>
    <Pos r={100} y={300} style={{ textAlign: "right" }}>
      <Kicker f={f} at={c("vertical")} color={C.red}>
        Memory went vertical
      </Kicker>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
        <Num f={f} at={c("500")} color={C.red} size={140}>
          ~500%
        </Num>
      </div>
      <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 34, color: C.ink, opacity: pr(f, c("12"), c("12") + 10) }}>in 12 months (some kits)</div>
    </Pos>
    <Src t="Tom's Hardware · Aug 2026 + RAM price index 17 Nov 2026" at={c("august")} d={300} until={9999} />
  </AbsoluteFill>
);

const s10: React.FC<P> = ({ f, c }) => {
  const listed = c("listed");
  const p = pr(f, listed, listed + 34);
  const red = p > 0.5;
  return (
    <AbsoluteFill style={{ transform: shake(f, listed + 34, 12, 14) }}>
      <Stage f={f} accent={red ? "rgba(255,61,82,0.16)" : "rgba(53,242,154,0.10)"} x={30} y={50} />
      <Pos x={130} y={230}>
        <Kicker f={f} at={0}>
          128GB DDR5-6400 kit · US
        </Kicker>
        <div style={{ marginTop: 16 }}>
          <PriceRoll from={329} to={3399} p={p} size={200} color={red ? C.red : C.green} glow={0.5} />
        </div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 3, color: red ? C.red : C.green, marginTop: 8 }}>{red ? "LISTED · AUG 2026" : "HISTORICAL LOW"}</div>
        <div style={{ marginTop: 24 }}>
          <Chip f={f} at={listed + 36}>
            +933%
          </Chip>
        </div>
      </Pos>
      <Pos x={1130} y={190}>
        <Stamp f={f} at={c("typo")} rot={6}>
          NOT A TYPO
        </Stamp>
      </Pos>
      <Pos x={1050} y={430} style={{ opacity: pr(f, c("car"), c("car") + 10), transform: `translateX(${(1 - pr(f, c("car"), c("car") + 14)) * 300}px)` }}>
        <IconCar size={640} color={C.ink} />
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginTop: 10, justifyContent: "center" }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: C.amber }}>≈ A USED CAR</div>
          <Badge>JOKE</Badge>
        </div>
      </Pos>
      <Src t="Tom's Hardware · Aug 2026 (via GadgetScout)" at={listed + 30} d={9999} />
    </AbsoluteFill>
  );
};

const s11: React.FC<P> = ({ f, d, c }) => {
  const g = pr(f, c("474"), c("474") + 30);
  return (
    <AbsoluteFill>
      <Clip f={f} src="chipset_close" d={d} blur={6} dim={0.55} />
      <Shade side="all" k={0.6} />
      <Pos x={160} y={200}>
        <Kicker f={f}>Tom's Hardware RAM index · 17 Nov 2026</Kicker>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 70, color: C.ink, marginTop: 10, opacity: pr(f, 4, 16) }}>Cheapest 32GB DDR5 kit</div>
        <div style={{ marginTop: 50, display: "flex", flexDirection: "column", gap: 34 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24, opacity: pr(f, 10, 22) }}>
            <div style={{ width: 230, fontFamily: INTER, fontWeight: 700, fontSize: 28, color: C.mute }}>LOWEST EVER</div>
            <div style={{ height: 70, width: (72 / 474) * 1100, background: C.green, borderRadius: 8, boxShadow: `0 0 30px ${C.green}66` }} />
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 60, color: C.green }}>$72</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 24, opacity: pr(f, c("474") - 6, c("474")) }}>
            <div style={{ width: 230, fontFamily: INTER, fontWeight: 700, fontSize: 28, color: C.mute }}>TODAY</div>
            <div style={{ height: 70, width: 1100 * g, background: `linear-gradient(90deg, #b81f33, ${C.red})`, borderRadius: 8, boxShadow: `0 0 30px ${C.red}66` }} />
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 60, color: C.red }}>${Math.round(72 + 402 * g)}</div>
          </div>
        </div>
        <div style={{ marginTop: 40 }}>
          <Chip f={f} at={c("550")} size={60}>
            +558%
          </Chip>
        </div>
      </Pos>
      <Src t="Tom's Hardware RAM price index · US · 17 Nov 2026" d={d} />
    </AbsoluteFill>
  );
};

const s12: React.FC<P> = ({ f, d, c }) => (
  <AbsoluteFill>
    <Stage f={f} accent="rgba(255,182,72,0.10)" x={50} y={50} />
    <WorldMap f={f} at={0} zoomTo={[78, 22]} zoomK={3.3} zoomAt={0} highlight={["India"]} pins={[{ lon: 78, lat: 22, label: "INDIA", at: 30 }]} />
    <Pos r={90} y={220}>
      <Card f={f} at={c("smart", 0, 40)} w={640}>
        <Kicker f={f} at={c("smart", 0, 40)} color={C.amber}>
          32GB DDR5 kit · India
        </Kicker>
        <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ opacity: pr(f, c("6500"), c("6500") + 10) }}>
            <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 24, color: C.mute, letterSpacing: 3 }}>EARLY 2025</div>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 90, color: C.green }}>₹6,500</div>
          </div>
          <div style={{ opacity: pr(f, c("40000"), c("40000") + 10) }}>
            <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 24, color: C.mute, letterSpacing: 3 }}>JULY 2026</div>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 90, color: C.red }}>₹40,000</div>
          </div>
          <div>
            <Chip f={f} at={c("40000") + 16}>
              +515%
            </Chip>
          </div>
        </div>
      </Card>
    </Pos>
    <Src t="Smartprix (Amazon India listings) · Jul 2026" at={c("smart", 0, 40)} d={d} />
  </AbsoluteFill>
);

const s13: React.FC<P> = ({ f, d, c }) => (
  <AbsoluteFill>
    <Stage f={f} accent="rgba(255,182,72,0.10)" x={50} y={40} />
    <Pos x={0} y={130} w={1920} style={{ textAlign: "center" }}>
      <Kicker f={f}>32GB DDR5-6000 class · today · different SKUs</Kicker>
    </Pos>
    <Pos x={0} y={250} w={1920} style={{ display: "flex", justifyContent: "center" }}>
      <Split
        f={f}
        at={4}
        left={{ title: "INDIA · ACER PALLAS II", value: "₹66,269", sub: "≈ $706 at ₹93.9/$", color: C.amber }}
        right={{ title: "USA · CHEAPEST KIT", value: "$474", sub: "Tom's Hardware index", color: C.ink }}
        stamp="≈ +49%"
        stampAt={c("50")}
      />
    </Pos>
    <Src t="PrimeABGB listing 19 Nov 2026 · Tom's Hardware 17 Nov 2026" d={d} />
  </AbsoluteFill>
);

const s13b: React.FC<P> = ({ f, d, c }) => {
  const items: [string, React.ReactNode, number][] = [
    ["LAPTOPS", <IconLaptop key="l" size={170} />, c("laptop")],
    ["PREBUILTS", <IconTower key="t" size={170} />, c("prebuilt")],
    ["GAMING PCs & GPUs", <IconGpu key="g" size={170} />, c("gaming")],
  ];
  return (
    <AbsoluteFill>
      <Clip f={f} src="keyboard" d={d} dim={0.55} blur={3} />
      <Shade side="all" k={0.6} />
      <Pos x={0} y={200} w={1920} style={{ display: "flex", justifyContent: "center", gap: 60 }}>
        {items.map(([t, icon, at]) => {
          const s = sp(f, at, 13);
          return (
            <Card key={t} f={f} at={at} w={460} pad="40px 30px">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                {icon}
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 54, color: C.ink }}>{t}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, transform: `scale(${s})` }}>
                  <IconRam size={70} color={C.red} />
                  <UpArrow size={56} />
                </div>
              </div>
            </Card>
          );
        })}
      </Pos>
      <Pos x={0} y={790} w={1920}>
        <Head f={f} at={c("everything")} size={64} align="center" color={C.red}>
          RAM INSIDE = PRICE UP
        </Head>
      </Pos>
    </AbsoluteFill>
  );
};

const s14: React.FC<P> = ({ f, d, c }) => {
  const giant = c("giant");
  return (
    <AbsoluteFill>
      <Clip f={f} src="gamer_play" d={d} dim={0.3} />
      <Pos x={0} y={360} w={1920} style={{ textAlign: "center" }}>
        <Stamp f={f} at={Math.max(56, c("not"))} rot={-6} size={110}>
          NOT GAMERS
        </Stamp>
      </Pos>
      {f >= giant - 4 ? (
        <AbsoluteFill style={{ opacity: pr(f, giant - 4, giant + 8) }}>
          <ServerHall f={f} />
          <Pos x={0} y={130} w={1920}>
            <Head f={f} at={giant + 4} size={84} align="center">
              GIANT, HUMMING BUILDINGS
            </Head>
          </Pos>
        </AbsoluteFill>
      ) : null}
      <Chapter f={f} n="02" title="WHO IS EATING THE MEMORY?" len={54} />
    </AbsoluteFill>
  );
};

const s15: React.FC<P> = ({ f, c }) => {
  const ev = c("every");
  return (
    <AbsoluteFill>
      <ServerHall f={f + 400} dim={0.25} />
      <AbsoluteFill style={{ opacity: 1 - pr(f, ev - 6, ev + 6), alignItems: "center", justifyContent: "center" }}>
        <Head f={f} at={0} size={150} align="center" color={C.teal}>
          AI DATA CENTRES
        </Head>
      </AbsoluteFill>
      {f >= ev - 6 ? (
        <AbsoluteFill style={{ opacity: pr(f, ev - 6, ev + 8), backgroundColor: "rgba(5,7,10,0.88)" }}>
          <Pos x={40} y={170}>
            <HbmStack f={f - ev} at={6} />
          </Pos>
          <Pos x={1100} y={240}>
            <Kicker f={f} at={ev}>
              Inside every AI accelerator
            </Kicker>
            <Head f={f} at={c("hbm")} size={200} color={C.teal}>
              HBM
            </Head>
            <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 40, color: C.ink, opacity: pr(f, c("high"), c("high") + 10) }}>High Bandwidth Memory</div>
            <div style={{ display: "flex", gap: 16, marginTop: 40, flexWrap: "wrap", width: 720 }}>
              <Chip f={f} at={c("stacked")} bg={C.teal} fg="#05070a" size={36}>
                STACKED
              </Chip>
              <Chip f={f} at={c("fast")} bg={C.teal} fg="#05070a" size={36}>
                INSANELY FAST
              </Chip>
              <Chip f={f} at={c("profitable")} bg={C.amber} fg="#05070a" size={36}>
                INSANELY PROFITABLE
              </Chip>
            </div>
          </Pos>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

const s16: React.FC<P> = ({ f, d, c }) => {
  const k = c("three");
  const grow = pr(f, k, k + 24);
  return (
    <AbsoluteFill>
      <Stage f={f} accent="rgba(40,215,255,0.12)" x={70} y={50} />
      <Pos x={1240} y={180} style={{ opacity: 0.5 }}>
        <Wafer f={f} at={0} takeAt={k} frac={0.3} />
      </Pos>
      <Pos x={140} y={200}>
        <Kicker f={f}>TrendForce · 18 Nov 2026</Kicker>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 70, marginTop: 50 }}>
          <div style={{ textAlign: "center", opacity: pr(f, 6, 18) }}>
            <div style={{ width: 120, height: 120, background: C.green, borderRadius: 8, margin: "0 auto", boxShadow: `0 0 30px ${C.green}66` }} />
            <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 30, color: C.ink, marginTop: 16 }}>1 DRAM BIT</div>
          </div>
          <div style={{ textAlign: "center", opacity: pr(f, k - 6, k + 4) }}>
            <div style={{ width: 120 + 120 * grow, height: 120 + 90 * grow, background: C.teal, borderRadius: 8, margin: "0 auto", boxShadow: `0 0 30px ${C.teal}66` }} />
            <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 30, color: C.ink, marginTop: 16 }}>1 HBM BIT</div>
          </div>
        </div>
        <div style={{ marginTop: 40 }}>
          <Num f={f} at={k + 10} color={C.teal} size={84}>
            3–4× the wafer area
          </Num>
        </div>
        <div style={{ marginTop: 30 }}>
          <Stamp f={f} at={c("never")} rot={-3} size={56}>
            NEVER BECOMES YOUR RAM STICK
          </Stamp>
        </div>
      </Pos>
      <Src t="TrendForce Roadshow Korea (via TechTimes) · 18 Nov 2026" at={k} d={d} />
    </AbsoluteFill>
  );
};

const s17: React.FC<P> = ({ f, d, c }) => (
  <AbsoluteFill>
    <Clip f={f} src="dollars_flip" d={d} dim={0.6} blur={4} />
    <Shade side="all" k={0.7} />
    <Pos x={150} y={260}>
      <Kicker f={f} color={C.amber}>
        Memory makers follow the money
      </Kicker>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: C.ink, marginTop: 14, width: 760, opacity: pr(f, 6, 18) }}>HBM share of all DRAM wafers</div>
      <div style={{ marginTop: 40 }}>
        <Lines
          f={f}
          size={58}
          font={MONO}
          items={[
            { t: <span>2026 · <span style={{ color: C.teal }}>23%</span></span>, at: c("23", 0, 60) },
            { t: <span>2027 · <span style={{ color: C.teal }}>~30%</span></span>, at: c("30") },
          ]}
        />
      </div>
    </Pos>
    <Pos x={1150} y={190}>
      <Donut f={f} from={23} to={30} at={4} land={c("30")} label="HBM SHARE" sub0="2026" sub1="2027 forecast" />
    </Pos>
    <Src t="TrendForce Roadshow Korea (via TechTimes) · 18 Nov 2026" d={d} />
  </AbsoluteFill>
);

const s18: React.FC<P> = ({ f, d, c }) => {
  const q = c("warned");
  return (
    <AbsoluteFill>
      <ServerHall f={f + 900} dim={0.55} speed={0.006} />
      <Pos x={260} y={170}>
        <Card f={f} at={0} w={1400} pad="50px 60px">
          <Kicker f={f} at={4} color={C.mute}>
            TrendForce press release · 30 Sep 2026
          </Kicker>
          <div style={{ display: "flex", alignItems: "baseline", gap: 30, marginTop: 20 }}>
            <Num f={f} at={c("10")} color={C.red} size={130}>
              +10–15%
            </Num>
            <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 34, color: C.ink, opacity: pr(f, c("10") + 4, c("10") + 14) }}>DRAM contract prices · Q4 2026</div>
          </div>
          <div style={{ marginTop: 40, fontFamily: INTER, fontWeight: 600, fontSize: 46, lineHeight: 1.35, color: C.ink, opacity: pr(f, q, q + 10) }}>
            “the PC DRAM supply{" "}
            <span style={{ background: `linear-gradient(90deg, rgba(255,61,82,0.45) ${pr(f, q + 10, q + 40) * 100}%, transparent 0)`, padding: "0 6px" }}>could decline in 2027</span> as more capacity shifts to server applications.”
          </div>
        </Card>
      </Pos>
      <Src t="TrendForce · 30 Sep 2026" d={d} />
    </AbsoluteFill>
  );
};

const s18b: React.FC<P> = ({ f, d, c }) => {
  const W = 1300;
  const H = 360;
  const p = pr(f, 20, d - 60);
  const N = 60;
  const spot = Array.from({ length: N + 1 }, (_, i) => {
    const x = i / N;
    const y = x < 0.62 ? 0.15 + x * 1.15 + Math.sin(i * 1.7) * 0.03 : 0.865 - (x - 0.62) * 1.6 + Math.sin(i * 1.7) * 0.03;
    return [x * W, H - y * H * 0.9];
  });
  const contract = Array.from({ length: N + 1 }, (_, i) => {
    const x = i / N;
    const y = x < 0.85 ? 0.12 + x * 0.85 : 0.84 - (x - 0.85) * 0.4;
    return [x * W, H - y * H * 0.9];
  });
  const path = (pts: number[][]) => pts.map((q, i) => `${i ? "L" : "M"}${q[0]},${q[1]}`).join(" ");
  const warn = c("warning");
  return (
    <AbsoluteFill>
      <Stage f={f} accent="rgba(40,215,255,0.10)" x={50} y={60} />
      <Pos x={130} y={110} style={{ display: "flex", gap: 30 }}>
        <Card f={f} at={c("contract")} w={780} border={C.amber} pad="22px 30px">
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, color: C.amber }}>CONTRACT</div>
          <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 30, color: C.ink }}>Long-term deals (PC makers) · moves slowly</div>
        </Card>
        <Card f={f} at={c("spot")} w={780} border={C.teal} pad="22px 30px">
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, color: C.teal }}>SPOT</div>
          <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 30, color: C.ink }}>Day-to-day market · moves first</div>
        </Card>
      </Pos>
      <Pos x={310} y={400}>
        <svg width={W} height={H + 20} style={{ overflow: "visible" }}>
          <clipPath id="cvsclip">
            <rect x={0} y={-50} width={W * p} height={H + 100} />
          </clipPath>
          <g clipPath="url(#cvsclip)">
            <path d={path(contract)} stroke={C.amber} strokeWidth={7} fill="none" />
            <path d={path(spot)} stroke={C.teal} strokeWidth={7} fill="none" />
          </g>
          <line x1={0} x2={W} y1={H} y2={H} stroke={C.line} />
        </svg>
      </Pos>
      <Pos x={310} y={800}>
        <Badge>ILLUSTRATION · NOT REAL DATA</Badge>
      </Pos>
      <Pos x={700} y={790}>
        <Stamp f={f} at={warn} color={C.teal} rot={-4} size={54}>
          SPOT FALLS FIRST = EARLY WARNING
        </Stamp>
      </Pos>
    </AbsoluteFill>
  );
};

const s19: React.FC<P> = ({ f, c }) => {
  const y = c("not", 0, 200);
  return (
    <AbsoluteFill>
      <Stage f={f} accent="rgba(255,61,82,0.10)" x={70} y={50} />
      <TugOfWar f={f} yankAt={y} />
      <Pos x={0} y={820} w={1920} style={{ textAlign: "center" }}>
        <Stamp f={f} at={y + 10} rot={0} size={70}>
          YOUR PC 0 — AI 1
        </Stamp>
      </Pos>
    </AbsoluteFill>
  );
};

const s20: React.FC<P> = ({ f, d, c }) => (
  <AbsoluteFill>
    <Stage f={f} accent="rgba(255,61,82,0.10)" x={50} y={40} />
    <Pos x={260} y={110}>
      <div style={{ width: 1400, height: 588, background: "#f4f5f6", borderRadius: 20, overflow: "hidden", opacity: pr(f, 60, 76), boxShadow: "0 40px 90px rgba(0,0,0,0.6)" }}>
        <Img src={A("img/rtx50_pcb.jpg")} style={{ width: "100%", height: "100%", objectFit: "contain", transform: `scale(${1 + f * 0.0004})` }} />
      </div>
    </Pos>
    <Pos x={0} y={730} w={1920} style={{ display: "flex", justifyContent: "center", gap: 30 }}>
      <Chip f={f} at={c("gddr6")} size={40}>
        GDDR6 · BEING PHASED OUT
      </Chip>
      <Chip f={f} at={c("gddr7")} bg={C.amber} fg="#05070a" size={40}>
        GDDR7 · OUTPUT LIMITED
      </Chip>
    </Pos>
    <Pos x={0} y={820} w={1920}>
      <Head f={f} at={c("same")} size={56} align="center" color={C.red}>
        SAME FACTORIES. SAME SQUEEZE.
      </Head>
    </Pos>
    <Src t="TrendForce · 30 Sep 2026 · Photo: Geekerwan, CC BY 3.0" at={70} d={d} />
    <Chapter f={f} n="03" title="MSRP vs REALITY" len={56} />
  </AbsoluteFill>
);

/** s21–s24: one continuous MSRP-vs-street board. */
const Board: React.FC<P> = ({ f, d }) => {
  const b = START.s21_chart_intro;
  const g = (id: string, w: string, n = 0) => G(id, w, n) - b;
  const photo = (src: string, from: number, to: number) => (
    <Sequence from={from} durationInFrames={to - from} layout="none">
      <Photo f={f - from} src={src} d={to - from} x={1420} y={70} w={420} h={260} radius={18} dim={0.15} />
    </Sequence>
  );
  const s23 = START.s23_5090 - b;
  const triple = g("s23_5090", "more");
  return (
    <AbsoluteFill style={{ transform: shake(f, s23 + 30, 12, 12) }}>
      <Stage f={f} accent="rgba(255,61,82,0.10)" x={60} y={40} />
      <Pos x={120} y={110}>
        <Kicker f={f}>MSRP vs street · USA · November 2026</Kicker>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 76, color: C.ink, opacity: pr(f, 4, 16) }}>The damage</div>
      </Pos>
      {photo("rtx5070ti.jpg", START.s22_mid - b, s23)}
      {photo("gpu5090_fan.jpg", s23, START.s24_budget - b)}
      <Pos x={120} y={290}>
        <MsrpBars
          f={f}
          at={10}
          max={2000}
          w={1680}
          items={[
            { name: "RTX 5070", msrp: 549, street: 899, at: g("s22_mid", "lowest"), note: "~$899" },
            { name: "RTX 5070 Ti", msrp: 749, street: 1340, at: g("s22_mid", "5070", 1) },
            { name: "RTX 5090", msrp: 1999, street: 6199, at: s23 + 10, note: "$6,199" },
            { name: "RTX 5050", msrp: 249, street: 500, at: g("s24_budget", "5050"), note: "$499.99" },
            { name: "RX 9070 XT", msrp: 599, street: 949, at: g("s24_budget", "amd"), note: "$949–1,100", pctText: "+58–84%" },
          ]}
        />
      </Pos>
      <Pos x={980} y={110}>
        <Stamp f={f} at={triple} rot={-8} size={110}>
          ×3.1
        </Stamp>
      </Pos>
      <SourceTag text="shattered.io · computingforgeeks · capitalandcompute · bestvaluegpu · Nov 2026" at={20} until={d - 4} />
    </AbsoluteFill>
  );
};

const s25: React.FC<P> = ({ f, d, c }) => {
  const best = c("best");
  const sink = c("sink");
  const droop = pr(f, sink, sink + 20);
  return (
    <AbsoluteFill>
      <Stage f={f} accent="rgba(255,182,72,0.12)" x={30} y={50} />
      <Photo f={f} src="arc_b580.jpg" d={d} x={90} y={150} w={900} h={675} radius={24} dim={0.05} />
      <Pos x={1080} y={200}>
        <Kicker f={f} at={best}>
          Intel Arc B580
        </Kicker>
        <div style={{ fontFamily: MONO, fontSize: 40, color: C.mute, textDecoration: "line-through", marginTop: 20, opacity: pr(f, best + 6, best + 14) }}>MSRP $249</div>
        <Num f={f} at={c("329")} color={C.amber} size={170}>
          $329
        </Num>
        <div style={{ marginTop: 10 }}>
          <Chip f={f} at={c("third")} bg={C.amber} fg="#05070a">
            +32% · a third over MSRP
          </Chip>
        </div>
      </Pos>
      <Pos x={120} y={130} style={{ transformOrigin: "0% 50%", transform: `rotate(${-6 + droop * 24}deg) translateY(${droop * 30}px)`, opacity: pr(f, c("bargain"), c("bargain") + 8) }}>
        <div style={{ padding: "14px 40px", background: "linear-gradient(90deg, #c8961e, #ffd36b, #c8961e)", color: "#2a1c00", fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, letterSpacing: 3, boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>BEST OF A BAD MARKET</div>
      </Pos>
      <Src t="Tom's Hardware GPU price tracker · Nov 2026 · Photo: Jiahwang, CC0" d={d} />
    </AbsoluteFill>
  );
};

const s26: React.FC<P> = ({ f, d, c }) => (
  <AbsoluteFill>
    <Clip f={f} src="mobo_zoom" d={d} dim={0.5} />
    <Shade side="left" />
    <Pos x={140} y={220}>
      <Kicker f={f} color={C.amber}>
        Reported · first half of 2026
      </Kicker>
      <Num f={f} at={c("30")} color={C.red} size={170}>
        −30–40%
      </Num>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, color: C.ink, opacity: pr(f, c("30") + 6, c("30") + 16) }}>GeForce supply</div>
      <div style={{ marginTop: 30 }}>
        <Stamp f={f} at={c("never")} color={C.amber} rot={-5} size={64}>
          UNCONFIRMED BY NVIDIA
        </Stamp>
      </div>
      <div style={{ marginTop: 40 }}>
        <Card f={f} at={c("admit")} w={860} pad="22px 30px">
          <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 34, color: C.ink }}>NVIDIA: memory supply is constrained</div>
        </Card>
      </div>
    </Pos>
    <Src t="PC Gamer (relaying Benchlife) · NVIDIA statement via Tom's Hardware" d={d} />
  </AbsoluteFill>
);

const s27: React.FC<P> = ({ f, d, c }) => {
  const b = c("because", 0, 60);
  const flip = pr(f, b, b + 16);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: "grayscale(1)" }}>
        <Clip f={0} src="mobo_zoom" d={d} from={300} dim={0.6} rate={0.3} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 1 - flip }}>
        <Head f={f} at={c("deep", 0, 20)} size={150} align="center">
          DEEP BREATH.
        </Head>
      </AbsoluteFill>
      {f >= b ? (
        <AbsoluteFill style={{ perspective: 1400 }}>
          <AbsoluteFill style={{ transform: `rotateX(${(1 - flip) * 180}deg)`, backfaceVisibility: "hidden" }}>
            <Chapter f={f - b + 14} n="04" title="THE PLOT TWIST" len={400} />
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

const s28: React.FC<P> = ({ f, d, c }) => {
  const six = c("6");
  const ft = c("14");
  return (
    <AbsoluteFill>
      <Stage f={f} accent="rgba(53,242,154,0.10)" x={30} y={30} />
      <Pos x={110} y={110}>
        <Kicker f={f}>Pro-Gamer EU GPU barometer · RTX 5090 · cheapest listing</Kicker>
      </Pos>
      <Pos x={60} y={250}>
        <CliffChart f={f} riseP={pr(f, 4, Math.max(30, six))} dropP={pr(f, ft, ft + 26)} appear={0} />
      </Pos>
      <Pos r={90} y={260} style={{ display: "flex", flexDirection: "column", gap: 26, alignItems: "flex-end" }}>
        <Card f={f} at={six} w={420} pad="20px 28px" border={C.red}>
          <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: C.mute }}>6 NOV 2026</div>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 64, color: C.red }}>€8,449.90</div>
        </Card>
        <Card f={f} at={ft} w={420} pad="20px 28px" border={C.green}>
          <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: C.mute }}>14 NOV 2026</div>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 64, color: C.green }}>€5,609.90</div>
        </Card>
      </Pos>
      <Src t="Pro-Gamer European GPU Barometer · 14 Nov 2026" d={d} />
    </AbsoluteFill>
  );
};

const s29: React.FC<P> = ({ f, d, c }) => (
  <AbsoluteFill style={{ transform: shake(f, 6, 12, 16) }}>
    <Clip f={f} src="banknotes" d={d} dim={0.55} />
    <Shade side="all" k={0.55} />
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 20 }}>
      <Num f={f} at={4} color={C.green} size={230}>
        −€2,840
      </Num>
      <Chip f={f} at={c("34")} bg={C.green} fg="#05070a" size={64}>
        −33.6% in 8 days
      </Chip>
      <div style={{ marginTop: 30, fontFamily: INTER, fontWeight: 600, fontStyle: "italic", fontSize: 48, color: C.ink, opacity: pr(f, c("fresh"), c("fresh") + 12) }}>“fresh retail stock” → price collapsed</div>
    </AbsoluteFill>
    <Src t="Pro-Gamer European GPU Barometer · 14 Nov 2026" d={d} />
  </AbsoluteFill>
);

const EU_CARDS = (deltas: Record<string, { d: string; up: boolean; at: number }>, glow: string[] = []): GridCard[] =>
  [
    ["RTX 5090", "32GB"],
    ["RTX 5080", "16GB"],
    ["RTX 5070 Ti", "16GB"],
    ["RTX 5070", "12GB"],
    ["RTX 5060 Ti", "16GB"],
    ["RTX 5060", "8GB"],
    ["RX 9070 XT", "16GB"],
    ["RX 9070", "16GB"],
    ["RX 9060 XT", "16GB"],
    ["Arc B580", "12GB"],
  ].map(([n, v]) => ({ name: n, vram: v, delta: deltas[n]?.d, up: deltas[n]?.up, at: deltas[n]?.at, dim: glow.length > 0 && !glow.includes(n) }));

const Grid: React.FC<P & { cards: GridCard[]; title: string; children?: React.ReactNode }> = ({ f, d, cards, title, children }) => (
  <AbsoluteFill>
    <Stage f={f} accent="rgba(40,215,255,0.08)" x={50} y={40} />
    <Pos x={166} y={150}>
      <Kicker f={f}>{title}</Kicker>
    </Pos>
    <Pos x={166} y={260}>
      <CardGrid f={f} cards={cards} at={0} />
    </Pos>
    {children}
    <Src t="Pro-Gamer European GPU Barometer · 6 → 14 Nov 2026" d={d} />
  </AbsoluteFill>
);

const s30: React.FC<P> = (p) => (
  <Grid
    {...p}
    title="Same week · Europe · 6 → 14 Nov"
    cards={EU_CARDS({ "RTX 5090": { d: "33.6%", up: false, at: 4 }, "RTX 5060": { d: "4.0%", up: false, at: p.c("5060") }, "RX 9070": { d: "1.2%", up: false, at: p.c("9070") } })}
  />
);

const s31: React.FC<P> = ({ f, d, c }) => (
  <AbsoluteFill>
    <Clip f={f} src="microchip" d={d} dim={0.5} blur={4} />
    <Shade side="left" />
    <Pos x={150} y={230}>
      <Kicker f={f} color={C.green}>
        RamRadar index · desktop DDR5 · average $/GB
      </Kicker>
      <div style={{ display: "flex", alignItems: "center", gap: 30, marginTop: 20 }}>
        <Num f={f} at={c("fell", 0, 90)} color={C.green} size={190}>
          −10.8%
        </Num>
        <div style={{ transform: `rotate(180deg) scale(${sp(f, c("fell", 0, 90) + 6, 12)})` }}>
          <UpArrow size={110} color={C.green} />
        </div>
      </div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 40, color: C.ink, opacity: pr(f, c("between", 0, 120), c("between", 0, 120) + 10) }}>19 Oct → 18 Nov 2026 · now $17.69/GB</div>
    </Pos>
    <Src t="RamRadar RAM Price Index · 18 Nov 2026" d={d} />
  </AbsoluteFill>
);

const s32: React.FC<P> = ({ f, d, c }) => {
  const q = c("second");
  const steps = ["NOV 2026", "1Q 2027", "2Q 2027"];
  return (
    <AbsoluteFill>
      <Clip f={f} src="mobo_shiny" d={d} dim={0.6} blur={3} />
      <Shade side="all" k={0.6} />
      <Pos x={150} y={170}>
        <Kicker f={f} color={C.teal}>
          TrendForce · 17–19 Nov 2026
        </Kicker>
        <div style={{ display: "flex", alignItems: "baseline", gap: 30, marginTop: 10 }}>
          <Num f={f} at={c("20")} color={C.teal} size={180}>
            −20%
          </Num>
          <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 40, color: C.ink, opacity: pr(f, c("20") + 4, c("20") + 14) }}>NAND flash spot prices · in 2 weeks</div>
        </div>
      </Pos>
      <Pos x={150} y={560} w={1620}>
        <div style={{ position: "relative", height: 220 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 60, height: 6, background: C.line }} />
          <div style={{ position: "absolute", left: 0, width: `${pr(f, q - 20, q + 10) * 100}%`, top: 60, height: 6, background: C.teal, boxShadow: `0 0 20px ${C.teal}` }} />
          {steps.map((s, i) => (
            <div key={s} style={{ position: "absolute", left: `${i * 50}%`, top: 0, transform: i === 2 ? "translateX(-100%)" : i === 1 ? "translateX(-50%)" : undefined, textAlign: i === 2 ? "right" : i === 1 ? "center" : "left" }}>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 34, color: i === 2 ? C.green : C.mute, whiteSpace: "nowrap" }}>{s}</div>
              <div style={{ width: 22, height: 22, borderRadius: 11, background: i === 2 ? C.green : C.mute, margin: i === 2 ? "14px 0 0 auto" : i === 1 ? "14px auto 0" : "14px 0 0" }} />
            </div>
          ))}
          <div style={{ position: "absolute", right: 0, top: 110, textAlign: "right", opacity: pr(f, q, q + 12) }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 54, color: C.green }}>NAND CONTRACT PRICES START FALLING</div>
            <div style={{ marginTop: 10 }}>
              <Badge>SSD SHELF PRICES: NOT YET</Badge>
            </div>
          </div>
        </div>
      </Pos>
      <Src t="TrendForce · 17 & 19 Nov 2026" d={d} />
    </AbsoluteFill>
  );
};

const s33: React.FC<P> = ({ f, c }) => {
  const n = c("not", 0, 50);
  return (
    <AbsoluteFill style={{ transform: shake(f, n, 12, 18) }}>
      <Stage f={f} accent={f < n ? "rgba(53,242,154,0.18)" : "rgba(255,61,82,0.18)"} x={50} y={50} />
      <Confetti f={f} at={0} freezeAt={n} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 30 }}>
        <div style={{ opacity: f < n ? 1 : 0.35, filter: f < n ? undefined : "grayscale(1)" }}>
          <Head f={f} at={0} size={150} align="center" color={C.green}>
            TURNING POINT?
          </Head>
        </div>
        <Stamp f={f} at={n} size={110} rot={-6}>
          …NOT SO FAST
        </Stamp>
      </AbsoluteFill>
      <Glitch at={n} />
    </AbsoluteFill>
  );
};

const s34: React.FC<P> = (p) => (
  <Grid
    {...p}
    title="Same tracker · same week · 6 → 14 Nov"
    cards={EU_CARDS({ "RTX 5060 Ti": { d: "14.3%", up: true, at: p.c("5060") }, "RX 9060 XT": { d: "13.0%", up: true, at: p.c("9060") }, "RTX 5080": { d: "5.6%", up: true, at: p.c("5080") } })}
  />
);

const s35: React.FC<P> = (p) => {
  const { f, c } = p;
  return (
    <Grid
      {...p}
      title="The pattern"
      cards={EU_CARDS({ "RTX 5060 Ti": { d: "14.3%", up: true, at: 0 }, "RX 9060 XT": { d: "13.0%", up: true, at: 0 }, "RTX 5080": { d: "5.6%", up: true, at: 0 } }, ["RTX 5060 Ti", "RX 9060 XT", "RTX 5080"])}
    >
      <Pos x={0} y={680} w={1920} style={{ display: "flex", justifyContent: "center", gap: 40, alignItems: "center" }}>
        <Chip f={f} at={c("vram", 1, 90)} bg={C.teal} fg="#05070a" size={48}>
          VRAM = MEMORY
        </Chip>
        <div style={{ fontFamily: DISPLAY, fontSize: 60, color: C.mute, opacity: pr(f, c("memory", 1, 120), c("memory", 1, 120) + 8) }}>→</div>
        <Chip f={f} at={c("eating", 0, 150)} size={48}>
          WHAT AI IS EATING
        </Chip>
      </Pos>
    </Grid>
  );
};

const s36: React.FC<P> = ({ f, d, c }) => {
  const spike = c("spike");
  return (
    <AbsoluteFill>
      <Stage f={f} accent="rgba(255,61,82,0.10)" x={30} y={30} />
      <Pos x={130} y={150}>
        <Kicker f={f}>Pro-Gamer EU barometer · 18 Sep → 14 Nov 2026</Kicker>
      </Pos>
      <Pos x={130} y={250} style={{ display: "flex", gap: 40 }}>
        <Card f={f} at={c("31")} w={560}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, color: C.ink }}>RTX 5080</div>
          <Num f={f} at={c("31")} color={C.red} size={120}>
            +31.0%
          </Num>
        </Card>
        <Card f={f} at={c("32")} w={560}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, color: C.ink }}>ARC B580</div>
          <Num f={f} at={c("32")} color={C.red} size={120}>
            +32.1%
          </Num>
        </Card>
      </Pos>
      <Pos x={130} y={620} style={{ opacity: pr(f, c("5090", 0, 200), c("5090", 0, 200) + 12) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, color: C.ink }}>RTX 5090 · 18 SEP €5,699.90 → 14 NOV €5,609.90</div>
          <Chip f={f} at={c("5090", 0, 200) + 10} bg={C.mute} size={44}>
            −1.6%
          </Chip>
        </div>
        <div style={{ marginTop: 26 }}>
          <Stamp f={f} at={spike} color={C.amber} rot={-3} size={60}>
            NOT HEALING — A SPIKE CALMING DOWN
          </Stamp>
        </div>
      </Pos>
      <Src t="Pro-Gamer European GPU Barometer · 14 Nov 2026" d={d} />
    </AbsoluteFill>
  );
};

const s37: React.FC<P> = ({ f, c }) => (
  <AbsoluteFill>
    <Stage f={f} accent="rgba(40,215,255,0.10)" x={50} y={50} />
    <WorldMap
      f={f}
      at={60}
      highlight={["United States of America", "India", ...EU]}
      pins={[
        { lon: -98, lat: 39, label: "USA", sub: "$", at: c("same", 0, 150) },
        { lon: 10, lat: 50, label: "EUROPE", sub: "€ → $", at: c("three", 0, 160) },
        { lon: 78, lat: 21, label: "INDIA", sub: "₹ → $", at: c("regions", 0, 170) },
      ]}
    />
    <Pos x={0} y={860} w={1920} style={{ display: "flex", justifyContent: "center" }}>
      <Card f={f} at={c("converted", 0, 200)} pad="16px 34px">
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 38, color: C.ink }}>₹93.9 = $1 · €1 = $1.11 · ALL IN US DOLLARS</div>
      </Card>
    </Pos>
    <Chapter f={f} n="05" title="WHERE IS IT CHEAPEST?" len={66} />
  </AbsoluteFill>
);

/** s38–s39: RTX 5060 podium, then taxes peel off. */
const Pods: React.FC<P> = ({ f, d }) => {
  const b = START.s38_5060_tax;
  const g = (id: string, w: string, n = 0) => G(id, w, n) - b;
  const untax = g("s39_remove_tax", "strip");
  const ident = g("s39_remove_tax", "almost");
  return (
    <AbsoluteFill>
      <Stage f={f} accent="rgba(40,215,255,0.10)" x={50} y={30} />
      <Pos x={0} y={120} w={1920} style={{ textAlign: "center" }}>
        <Kicker f={f}>RTX 5060 · cheapest new listing · converted to USD</Kicker>
      </Pos>
      <Pos x={420} y={190}>
        <Podium
          f={f}
          at={0}
          fillAt={g("s38_5060_tax", "america")}
          untaxAt={untax + 20}
          max={600}
          cols={[
            { name: "USA", local: "~$450 (before sales tax)", usd: 450 },
            { name: "EUROPE", local: "€479.90 incl. VAT", usd: 533, exTax: 444, tax: "20% VAT" },
            { name: "INDIA", local: "₹48,980 incl. GST", usd: 522, exTax: 442, tax: "18% GST" },
          ]}
        />
      </Pos>
      <Pos x={0} y={460} w={1920} style={{ textAlign: "center" }}>
        <Stamp f={f} at={ident} color={C.green} rot={-4} size={84}>
          ALMOST IDENTICAL
        </Stamp>
      </Pos>
      <SourceTag text="TechSpot Q3 2026 · Pro-Gamer 14 Nov · PickPCParts 19 Nov · ₹93.9/$ · $1.11/€" at={20} until={d - 4} />
    </AbsoluteFill>
  );
};

const s39b: React.FC<P> = ({ f, c }) => {
  const p = pr(f, c("checkout", 0, 90), c("checkout", 0, 90) + 30);
  return (
    <AbsoluteFill>
      <Stage f={f} accent="rgba(40,215,255,0.08)" x={50} y={50} />
      <AbsoluteFill style={{ opacity: 0.8 }}>
        <WorldMap f={f} at={0} zoomTo={[-98, 39]} zoomK={2.6} zoomAt={0} highlight={["United States of America"]} pins={[]} />
      </AbsoluteFill>
      <Pos x={1250} y={100}>
        <div style={{ width: 520, overflow: "hidden", height: 120 + 520 * p }}>
          <div style={{ width: 520, padding: "30px 34px", background: "#f2efe6", color: "#1b1b1b", fontFamily: MONO, fontSize: 30, lineHeight: 1.7, boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ fontWeight: 800, textAlign: "center", fontSize: 34 }}>CHECKOUT · USA</div>
            <div>RTX 5060 ........ ~$450</div>
            <div style={{ color: "#b0102a", fontWeight: 800 }}>+ SALES TAX ... BY STATE</div>
            <div>— — — — — — — — — —</div>
            <div style={{ fontWeight: 800 }}>TOTAL .......... MORE</div>
          </div>
        </div>
      </Pos>
      <Pos x={120} y={820}>
        <Head f={f} at={c("checkout", 0, 90)} size={60} color={C.amber}>
          US PRICES: SALES TAX ADDED AT CHECKOUT
        </Head>
      </Pos>
    </AbsoluteFill>
  );
};

const s40: React.FC<P> = ({ f, d, c }) => {
  const panels: [string, string, number][] = [
    ["TAX", "no_money", c("tax", 0, 100)],
    ["IMPORT", "dollars_flip", c("import", 0, 130)],
    ["MARGIN", "phone_shop", c("whatever", 0, 160)],
  ];
  return (
    <AbsoluteFill>
      <Stage f={f} accent="rgba(255,182,72,0.08)" x={50} y={50} />
      <Pos x={0} y={90} w={1920}>
        <Head f={f} at={0} size={74} align="center">
          SAME SILICON. DIFFERENT PRICE.
        </Head>
      </Pos>
      <Pos x={90} y={250} style={{ display: "flex", gap: 30 }}>
        {panels.map(([t, src, at]) => {
          const a = pr(f, at, at + 14);
          return (
            <div key={t} style={{ position: "relative", width: 560, height: 560, borderRadius: 20, overflow: "hidden", opacity: a, transform: `translateY(${(1 - a) * 60}px)`, border: `1px solid ${C.line}` }}>
              <Sequence from={at} layout="none">
                <Clip f={f - at} src={src} d={d - at} dim={0.35} />
              </Sequence>
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "18px 26px", background: "linear-gradient(0deg, rgba(5,7,10,0.95), rgba(5,7,10,0))", fontFamily: DISPLAY, fontWeight: 700, fontSize: 80, color: C.amber }}>{t}</div>
            </div>
          );
        })}
      </Pos>
    </AbsoluteFill>
  );
};

const s41: React.FC<P> = ({ f, d, c }) => (
  <AbsoluteFill>
    <Stage f={f} accent="rgba(255,182,72,0.08)" x={30} y={30} />
    <Pos x={130} y={110}>
      <Kicker f={f}>High-end cards · local price → USD</Kicker>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 70, color: C.ink, opacity: pr(f, 4, 14) }}>It gets weirder</div>
    </Pos>
    <Pos x={130} y={300}>
      <Table
        f={f}
        widths={[340, 360, 420, 520]}
        head={["CARD", "WHERE", "LOCAL PRICE", "IN USD"]}
        rows={[
          { cells: ["RTX 5090", "USA", "$6,199.99", "$6,199"], at: c("strip", 0, 30) },
          { cells: ["RTX 5090", "EU · ex-VAT", "€5,609.90", "≈ $5,189 · CHEAPER"], at: c("cheaper", 0, 150), hl: 3 },
          { cells: ["RTX 5080", "INDIA", "₹2,41,220", "≈ $2,569 · MOST"], at: c("5080", 0, 280), hl: 3 },
          { cells: ["RTX 5080", "INDIA · 12-mo low", "₹2,15,500", "now +11.9%"], at: c("12", 0, 420), hl: 3 },
        ]}
      />
    </Pos>
    <Src t="shattered.io 13 Nov · Pro-Gamer 14 Nov · GPUTracker.in 13 Nov 2026" d={d} />
  </AbsoluteFill>
);

const s42: React.FC<P> = ({ f, d, c }) => {
  const g = c("gigabyte", 0, 250);
  return (
    <AbsoluteFill>
      <Stage f={f} accent="rgba(255,182,72,0.10)" x={60} y={50} />
      <AbsoluteFill style={{ opacity: 0.35 }}>
        <WorldMap f={f} at={0} zoomTo={[78, 22]} zoomK={3.3} zoomAt={-60} highlight={["India"]} pins={[]} />
      </AbsoluteFill>
      <Pos x={140} y={170}>
        <Kicker f={f} color={C.amber}>
          India · the real pain is RAM
        </Kicker>
        <div style={{ display: "flex", gap: 30, alignItems: "baseline", marginTop: 20 }}>
          <Num f={f} at={c("94", 0, 100)} size={150} color={C.amber}>
            ₹93.9
          </Num>
          <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 40, color: C.ink, opacity: pr(f, c("94", 0, 100) + 4, c("94", 0, 100) + 14) }}>= $1</div>
        </div>
        <div style={{ marginTop: 20 }}>
          <Chip f={f} at={c("imported", 0, 160)} bg={C.amber} fg="#05070a" size={42}>
            NEARLY ALL MEMORY IS IMPORTED
          </Chip>
        </div>
        <div style={{ marginTop: 50 }}>
          <Card f={f} at={g} w={1100} pad="26px 36px">
            <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 44, color: C.ink }}>Real relief before 2028? <span style={{ color: C.red }}>Don't expect it.</span></div>
            <div style={{ fontFamily: MONO, fontSize: 26, color: C.mute, marginTop: 8 }}>— Gigabyte India (via Smartprix), paraphrased</div>
          </Card>
        </div>
      </Pos>
      <Src t="Smartprix · 2026 · USD/INR ≈ 93.9" d={d} />
    </AbsoluteFill>
  );
};

const s43: React.FC<P> = ({ f, d, c }) => {
  const flash = Math.floor(f / 8) % 2 === 0;
  return (
    <AbsoluteFill>
      <Clip f={f} src="phone_shop" d={d} dim={0.35} />
      <Shade side="right" />
      <Pos r={110} y={170} style={{ textAlign: "right" }}>
        <div style={{ display: "inline-block", padding: "10px 40px", background: flash ? C.red : "#b81f33", color: "#fff", fontFamily: DISPLAY, fontWeight: 700, fontSize: 150, transform: `rotate(-4deg) scale(${sp(f, c("giant", 0, 90), 10)})` }}>−50%</div>
        <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 48, color: C.amber, marginTop: 30, opacity: pr(f, c("november", 0, 70), c("november", 0, 70) + 10) }}>BLACK FRIDAY · 27 NOV 2026</div>
        <div style={{ marginTop: 40 }}>
          <Head f={f} at={c("real", 0, 200)} size={86} align="right">
            ARE THESE DEALS REAL?
          </Head>
        </div>
      </Pos>
      <Chapter f={f} n="06" title="BLACK FRIDAY: REAL OR THEATRE?" len={60} />
    </AbsoluteFill>
  );
};

const s44: React.FC<P> = ({ f, d, c }) => {
  const sale = c("discount", 0, 150);
  return (
    <AbsoluteFill>
      <Stage f={f} accent="rgba(255,61,82,0.10)" x={40} y={50} />
      <Pos x={130} y={110} style={{ display: "flex", gap: 20, alignItems: "center" }}>
        <Kicker f={f}>Example RAM kit · price history</Kicker>
        <Badge>ILLUSTRATION</Badge>
      </Pos>
      <Pos x={110} y={260}>
        <LineChart f={f} labels={["4 WEEKS BEFORE", "PRICE HIKE", "'SALE'"]} values={[100, 175, 104]} min={0} max={200} ticks={[]} prefix="" at={10} until={sale + 20} w={1000} h={460} pointLabels={[]} color={C.amber} />
      </Pos>
      <Pos x={1010} y={500}>
        <Stamp f={f} at={sale + 20} color={C.red} rot={-8} size={70}>
          −40% SALE!
        </Stamp>
        <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 32, color: C.mute, marginTop: 20, opacity: pr(f, sale + 34, sale + 44) }}>…back to where it already was</div>
      </Pos>
      <Pos x={1300} y={170}>
        <Card f={f} at={c("reviewer", 0, 250)} w={520} pad="24px 30px">
          <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 32, color: C.ink }}>One reviewer tracking 47 RAM kits:</div>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 52, color: C.red, marginTop: 6 }}>+50–100%</div>
          <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 28, color: C.mute }}>bumps before some “sales”</div>
        </Card>
      </Pos>
      <Src t="powersof10.com (one reviewer) · Nov 2026" at={c("reviewer", 0, 250)} d={d} />
    </AbsoluteFill>
  );
};

const s45: React.FC<P> = ({ f, d, c }) => (
  <AbsoluteFill>
    <Stage f={f} accent="rgba(40,215,255,0.10)" x={30} y={50} />
    <Phone f={f} src="scroll_sale" x={210} y={110} h={820} at={0} />
    <Pos x={860} y={300}>
      <Lines
        f={f}
        size={62}
        gap={34}
        items={[
          { t: <span><span style={{ color: C.red }}>✕</span> IGNORE THE <span style={{ textDecoration: "line-through" }}>STRIKETHROUGH</span></span>, at: c("ignore", 0, 30) },
          { t: <span><span style={{ color: C.green }}>✓</span> CHECK THE PRICE HISTORY</span>, at: c("check", 0, 80) },
          { t: <span style={{ color: C.amber }}>LAST MONTH'S PRICE ≠ A DEAL</span>, at: c("last", 0, 140) },
        ]}
      />
    </Pos>
    <Curtains f={f} at={c("theater", 0, d - 40) - 8} label="IT'S THEATRE." />
  </AbsoluteFill>
);

const s46: React.FC<P> = ({ f, d, c }) => (
  <AbsoluteFill>
    <Photo f={f} src="rtx5060.jpg" d={d} dim={0.35} pos="70% 50%" />
    <Shade side="left" k={0.92} />
    <Pos x={140} y={170}>
      <div style={{ transform: `scale(${sp(f, c("msrp", 0, 40), 12)})`, transformOrigin: "left center" }}>
        <IconTrophy size={170} />
      </div>
      <Head f={f} at={c("msrp", 0, 40)} size={150} color={C.green}>
        MSRP = WIN
      </Head>
      <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 34, color: C.mute, opacity: pr(f, c("msrp", 0, 40) + 8, c("msrp", 0, 40) + 18) }}>in 2026</div>
      <div style={{ marginTop: 40 }}>
        <Card f={f} at={c("real", 0, 160)} w={900} pad="24px 32px">
          <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 36, color: C.ink }}>A real Black Friday GPU deal:</div>
          <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 32, color: C.green, marginTop: 6 }}>back to launch price — not below it</div>
          <div style={{ fontFamily: MONO, fontSize: 24, color: C.mute, marginTop: 10 }}>Expected cuts: ~$30–100 off inflated prices (computingforgeeks)</div>
        </Card>
      </div>
    </Pos>
    <Src t="Photo: 4300streetcar, CC BY 4.0 · computingforgeeks Nov 2026" d={d} />
  </AbsoluteFill>
);

const s47: React.FC<P> = ({ f, d }) => <Chapter f={f} n="07" title="BUY NOW OR WAIT?" len={d + 20} />;

const s48: React.FC<P> = ({ f, d, c }) => (
  <AbsoluteFill>
    <Stage f={f} accent="rgba(53,242,154,0.08)" x={50} y={70} />
    <Pos x={0} y={100} w={1920} style={{ textAlign: "center" }}>
      <Kicker f={f}>TrendForce · DRAM contract price forecast · quarter on quarter</Kicker>
    </Pos>
    <Pos x={449} y={200}>
      <Forecast
        f={f}
        at={c("projected", 0, 90) - 30}
        items={[
          { q: "1Q 2027", lo: 5, hi: 10 },
          { q: "2Q 2027", lo: 3, hi: 8 },
          { q: "3Q 2027", lo: 0, hi: 5 },
          { q: "4Q 2027", lo: 0, hi: 5 },
        ]}
      />
    </Pos>
    <Pos x={0} y={760} w={1920} style={{ textAlign: "center" }}>
      <Head f={f} at={c("slowing", 0, 300)} size={60} align="center" color={C.green}>
        STILL RISING — JUST SLOWER
      </Head>
    </Pos>
    <Src t="TrendForce Roadshow Korea · 18 Nov 2026" d={d} />
  </AbsoluteFill>
);

const s49: React.FC<P> = ({ f, d, c }) => (
  <AbsoluteFill>
    <Photo f={f} src="wafer_researcher.jpg" d={d} dim={0.55} />
    <Shade side="left" k={0.9} />
    <Pos x={140} y={170}>
      <Lines
        f={f}
        size={54}
        gap={24}
        font={MONO}
        items={[
          { t: <span><span style={{ color: C.teal }}>2H 2027</span> · new DRAM capacity ramps</span>, at: c("ramping", 0, 30) },
          { t: <span><span style={{ color: C.teal }}>2028</span> · big output</span>, at: c("2028", 0, 90) },
        ]}
      />
      <div style={{ marginTop: 50 }}>
        <Card f={f} at={c("hbm", 0, 150)} w={980} pad="24px 32px" border={C.red}>
          <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 28, letterSpacing: 3, color: C.mute }}>HBM4 PRICE PER GIGABIT</div>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 64, color: C.ink }}>
            $2.05 <span style={{ color: C.mute }}>→</span> <span style={{ color: C.red }}>$3.00–5.50</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 24, color: C.mute }}>2026 → 2027 forecast</div>
        </Card>
      </div>
      <div style={{ marginTop: 40 }}>
        <Stamp f={f} at={c("outbidding", 0, 330)} rot={-3} size={64}>
          AI KEEPS OUTBIDDING YOU
        </Stamp>
      </div>
    </Pos>
    <Src t="TrendForce Roadshow Korea (TechTimes / Seoul Economic Daily) · 18 Nov 2026 · Photo: US DOE, public domain" d={d} />
  </AbsoluteFill>
);

const s50: React.FC<P> = ({ f, d, c }) => {
  const cr = c("crash", 0, 60);
  return (
    <AbsoluteFill>
      <Photo f={f} src="wafer_macro.jpg" d={d} dim={0.55} />
      <Shade side="all" k={0.6} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 30 }}>
        <Head f={f} at={0} size={130} align="center">
          STOP RISING <span style={{ color: C.red }}>≠</span> CRASH
        </Head>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 90, color: C.mute, opacity: pr(f, cr, cr + 8) * (1 - pr(f, cr + 30, cr + 60)), filter: `blur(${pr(f, cr + 30, cr + 60) * 12}px)` }}>CRASH?</div>
      </AbsoluteFill>
      <Src t="Photo: Rob Bulmahn, CC BY 2.0" d={d} />
    </AbsoluteFill>
  );
};

const s51: React.FC<P> = ({ f, d, c }) => {
  const up = c("upscaling", 0, 120);
  const on = pr(f, up, up + 10);
  return (
    <AbsoluteFill>
      <Clip f={f} src="gamer_win" d={d} dim={0.3} />
      <Shade side="right" />
      <Pos r={120} y={190} style={{ textAlign: "right" }}>
        <Head f={f} at={c("wait", 0, 40)} size={120} align="right" color={C.green}>
          IF IT WORKS: WAIT.
        </Head>
        <div style={{ marginTop: 40, display: "inline-block" }}>
          <Card f={f} at={up - 10} w={620} pad="26px 32px">
            {[
              ["UPSCALING", on],
              ["SETTINGS", pr(f, c("tweak", 0, 170), c("tweak", 0, 170) + 10)],
            ].map(([t, v]) => (
              <div key={t as string} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
                <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 36, color: C.ink }}>{t}</div>
                <div style={{ width: 110, height: 54, borderRadius: 27, background: (v as number) > 0.5 ? C.green : "rgba(255,255,255,0.15)", position: "relative" }}>
                  <div style={{ position: "absolute", top: 6, left: 6 + 56 * (v as number), width: 42, height: 42, borderRadius: 21, background: "#fff" }} />
                </div>
              </div>
            ))}
          </Card>
        </div>
      </Pos>
    </AbsoluteFill>
  );
};

const s52: React.FC<P> = ({ f, d, c }) => (
  <AbsoluteFill>
    <Clip f={f} src="pen_chip" d={d} dim={0.55} blur={2} />
    <Shade side="left" k={0.92} />
    <Pos x={150} y={170}>
      <Kicker f={f} color={C.amber}>
        If you have to buy
      </Kicker>
      <div style={{ marginTop: 40 }}>
        <Checklist
          f={f}
          items={[
            { t: "GPU at or near MSRP", at: c("grab", 0, 40) },
            { t: "Keep your DDR4 platform alive", at: c("keep", 0, 140) },
            { t: "Value cards — like the Arc B580", at: c("value", 0, 240) },
          ]}
        />
      </div>
    </Pos>
  </AbsoluteFill>
);

const s52b: React.FC<P> = ({ f, d, c }) => {
  const buy = c("buy", 0, 150);
  return (
    <AbsoluteFill>
      <Clip f={f} src="creator_edit" d={d} dim={0.4} />
      <Shade side="left" />
      <Pos x={140} y={170} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <Stamp f={f} at={c("died", 0, 20)} rot={-4} size={66}>
          CARD JUST DIED?
        </Stamp>
        <Stamp f={f} at={c("bills", 0, 60)} color={C.amber} rot={3} size={66}>
          PC PAYS THE BILLS?
        </Stamp>
        <div style={{ marginTop: 30 }}>
          <Head f={f} at={buy} size={100} color={C.green}>
            BUY WHAT YOU NEED
          </Head>
        </div>
        <Card f={f} at={c("16", 0, 280)} w={900} pad="22px 30px">
          <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 38, color: C.ink }}>
            16GB card at a fair price <span style={{ color: C.green }}>&gt;</span> a dream card you can't afford
          </div>
        </Card>
      </Pos>
    </AbsoluteFill>
  );
};

const s53: React.FC<P> = ({ f, d, c }) => {
  const parts: [string, string, boolean][] = [
    ["CPU", "your choice", false],
    ["GPU", "your choice", false],
    ["RAM · 32GB DDR5-6000", "₹66,269", true],
    ["SSD · PSU · CASE", "your choice", false],
  ];
  return (
    <AbsoluteFill>
      <Stage f={f} accent="rgba(255,61,82,0.10)" x={70} y={50} />
      <Pos x={140} y={130}>
        <Kicker f={f} color={C.amber}>
          India build tip
        </Kicker>
        <Head f={f} at={c("price", 0, 30)} size={96}>
          PRICE THE RAM FIRST
        </Head>
      </Pos>
      <Pos x={140} y={400} style={{ display: "flex", gap: 20 }}>
        {parts.map(([n, v, hot], i) => {
          const a = pr(f, 10 + i * 6, 22 + i * 6);
          return (
            <div key={n} style={{ width: 390, height: 260, borderRadius: 18, padding: "26px 28px", background: hot ? "rgba(255,61,82,0.18)" : "rgba(27,33,41,0.85)", border: `2px solid ${hot ? C.red : C.line}`, opacity: a, transform: `translateY(${(1 - a) * 30}px) scale(${hot ? 1 + 0.06 * sp(f, c("wreck", 0, 100), 10) : 1})`, boxShadow: hot ? `0 0 40px ${C.red}55` : undefined }}>
              <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 30, color: C.mute, letterSpacing: 2 }}>{n}</div>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: hot ? 66 : 40, color: hot ? C.red : C.mute, marginTop: 30 }}>{v}</div>
            </div>
          );
        })}
      </Pos>
      <Src t="PrimeABGB listing · 19 Nov 2026" d={d} />
    </AbsoluteFill>
  );
};

const s54: React.FC<P> = ({ f, c }) => {
  const ai = c("ai", 0, 150);
  const big = pr(f, ai, ai + 30);
  return (
    <AbsoluteFill>
      {f >= ai - 6 ? (
        <AbsoluteFill style={{ opacity: pr(f, ai - 6, ai + 10) }}>
          <ServerHall f={f + 1500} tint="255,61,82" />
        </AbsoluteFill>
      ) : (
        <Stage f={f} accent="rgba(255,182,72,0.08)" x={50} y={50} />
      )}
      <Pos x={0} y={240} w={1920} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 50 }}>
        {[
          ["CRYPTO MINERS", <IconPick key="p" size={180} />, c("crypto", 0, 20)],
          ["SCALPERS", <IconBot key="b" size={180} />, c("scalpers", 0, 70)],
        ].map(([t, icon, at]) => (
          <div key={t as string} style={{ textAlign: "center", opacity: pr(f, at as number, (at as number) + 10) * (1 - 0.6 * big), transform: `scale(${1 - 0.3 * big})` }}>
            {icon}
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, color: C.ink, textDecoration: f > (at as number) + 30 ? "line-through" : undefined }}>{t as string}</div>
          </div>
        ))}
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 120 + 160 * big, color: C.red, opacity: big, textShadow: `0 0 60px ${C.red}` }}>AI</div>
      </Pos>
      <Pos x={0} y={780} w={1920}>
        <Head f={f} at={ai + 20} size={60} align="center">
          THE BUYER OUTBIDDING YOU
        </Head>
      </Pos>
    </AbsoluteFill>
  );
};

const s55: React.FC<P> = ({ f, c }) => {
  const s = sp(f, 0, 18);
  const ch = c("changing", 0, 100);
  return (
    <AbsoluteFill>
      <Stage f={f} accent="rgba(255,182,72,0.12)" x={50} y={45} />
      <AbsoluteFill style={{ perspective: 1800, alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: `translate(${-430 - (1 - s) * 500}px, -60px)`, opacity: s }}>
          <RamStick3D rotY={-20 + f * 0.4} rotX={10} scale={0.4} glow={1} hue={40} />
        </div>
      </AbsoluteFill>
      <Img src={A("img/gpu5090_cutout.webp")} style={{ position: "absolute", width: 700, left: 1120 + (1 - s) * 600, top: 230, opacity: s, filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.8)) brightness(0.85)" }} />
      <Pos x={0} y={720} w={1920}>
        <Head f={f} at={ch} size={84} align="center" color={C.amber}>
          THE CRISIS IS CHANGING SHAPE
        </Head>
      </Pos>
    </AbsoluteFill>
  );
};

const s56: React.FC<P> = ({ f, c }) => {
  const endAt = c("next", 0, 250) + 40;
  const end = pr(f, endAt, endAt + 20);
  const pins = [
    [-74, 40],
    [-46, -23],
    [2, 48],
    [13, 52],
    [28, 41],
    [37, 55],
    [72.8, 19],
    [77, 28.6],
    [88, 22.5],
    [103, 1.3],
    [139, 35.7],
    [151, -33.9],
    [18, -33.9],
    [-99, 19.4],
    [55, 25],
  ].map(([lon, lat], i) => ({ lon, lat, label: "?", at: c("tell", 0, 10) + 10 + i * 5 }));
  return (
    <AbsoluteFill>
      <Stage f={f} accent="rgba(40,215,255,0.10)" x={50} y={50} />
      <AbsoluteFill style={{ opacity: 1 - end }}>
        <WorldMap f={f} at={0} pins={pins} />
        <Pos x={0} y={80} w={1920}>
          <Head f={f} at={c("tell", 0, 10)} size={76} align="center">
            WHAT DID YOU PAY? <span style={{ color: C.amber }}>+ YOUR COUNTRY</span>
          </Head>
        </Pos>
        <Pos x={0} y={860} w={1920} style={{ textAlign: "center" }}>
          <Kicker f={f} at={c("build", 0, 150)} color={C.amber} size={34}>
            Let's build the real price map ↓ comments
          </Kicker>
        </Pos>
      </AbsoluteFill>
      {f >= endAt ? (
        <AbsoluteFill style={{ opacity: end }}>
          <Stage f={f} accent="rgba(255,182,72,0.10)" x={50} y={30} />
          <Pos x={0} y={90} w={1920} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 30, letterSpacing: 12, color: C.amber }}>UNKNOWN GAMER</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 80, color: C.ink, marginTop: 8 }}>WATCH NEXT</div>
          </Pos>
          {/* empty slots for YouTube end-screen elements */}
          {[150, 990].map((x) => (
            <div key={x} style={{ position: "absolute", left: x, top: 300, width: 780, height: 440, borderRadius: 18, border: `2px solid ${C.line}`, background: "rgba(255,255,255,0.03)" }} />
          ))}
          <Pos x={0} y={985} w={1920} style={{ textAlign: "center", fontFamily: MONO, fontSize: 20, color: C.mute, letterSpacing: 1 }}>
            Music: Kevin MacLeod (incompetech.com), CC BY 4.0 · Footage: Mixkit · Photos: Wikimedia Commons contributors (credits in description)
          </Pos>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/** Registry; `null` = covered by a multi-scene board. */
const SCENES: Record<string, React.FC<P> | null> = {
  s06_hook_promise: s06,
  s07_title: s07,
  s08_ram_boring: s08,
  s09_ram_vertical: s09,
  s10_ram_128: s10,
  s11_ram_now: s11,
  s12_india_ram: s12,
  s13_india_now: s13,
  s13b_everything: s13b,
  s14_who: s14,
  s15_hbm: s15,
  s16_wafer: s16,
  s17_share: s17,
  s18_contract: s18,
  s18b_contract_vs_spot: s18b,
  s19_tugofwar: s19,
  s20_gddr: s20,
  s21_chart_intro: Board,
  s22_mid: null,
  s23_5090: null,
  s24_budget: null,
  s25_b580: s25,
  s26_supply: s26,
  s27_breath: s27,
  s28_5090_drop: s28,
  s29_restock: s29,
  s30_others: s30,
  s31_ram_ease: s31,
  s32_nand: s32,
  s33_not_so_fast: s33,
  s34_vram_up: s34,
  s35_pattern: s35,
  s36_restock_spike: s36,
  s37_regions: s37,
  s38_5060_tax: Pods,
  s39_remove_tax: null,
  s39b_us_tax: s39b,
  s40_silicon_global: s40,
  s41_high_end: s41,
  s42_india_ram_pain: s42,
  s43_bf: s43,
  s44_inflate: s44,
  s45_rule: s45,
  s46_msrp_win: s46,
  s47_buy_wait: s47,
  s48_forecast: s48,
  s49_capacity: s49,
  s50_no_crash: s50,
  s51_advice_wait: s51,
  s52_advice_buy: s52,
  s52b_who_buys: s52b,
  s53_advice_india: s53,
  s54_outro_blame: s54,
  s55_outro_shape: s55,
  s56_cta: s56,
};

/** Blocks: scene id → [from, to) frames (boards span the following null scenes). */
const BLOCKS = (() => {
  const out: { id: string; from: number; to: number; C: React.FC<P> }[] = [];
  SCENE_STARTS.forEach(([id, from]) => {
    if (from < COLD_OPEN_END - 10) return; // s01–s05 come from the cold open
    const comp = SCENES[id];
    if (comp === undefined) throw new Error(`no scene for ${id}`);
    if (comp === null) {
      out[out.length - 1].to = endOf(id);
      return;
    }
    out.push({ id, from, to: endOf(id), C: comp });
  });
  return out;
})();

const CHAPTER_IDS = ["s08_ram_boring", "s14_who", "s20_gddr", "s27_breath", "s37_regions", "s43_bf", "s47_buy_wait"];
const XF = 8; // cross-fade frames

const SceneHost: React.FC<{ C: React.FC<P>; d: number; id: string }> = ({ C: Comp, d, id }) => {
  const f = useCurrentFrame();
  const c = (w: string, n = 0, fb = 0) => cue(id, w, n, fb);
  const a = interpolate(f, [0, XF], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ opacity: a, transform: `scale(${1.02 - 0.02 * a})` }}>
      <Comp f={f} d={d} c={c} />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- captions (data-driven)
const Caps: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / 30;
  const p = CAPTIONS.find((x) => t >= x[0] - 0.05 && t <= x[1] + 0.25);
  if (!p || f >= G("s56_cta", "next") + 40) return null;
  const o = interpolate(t, [p[0] - 0.05, p[0] + 0.08, p[1] + 0.12, p[1] + 0.25], [0, 1, 1, 0], clamp);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 64, display: "flex", justifyContent: "center", opacity: o }}>
      <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 40, color: C.ink, padding: "10px 26px", borderRadius: 12, background: "rgba(5,7,10,0.66)", textShadow: "0 2px 8px rgba(0,0,0,0.6)", maxWidth: 1500, textAlign: "center" }}>{p[2]}</div>
    </div>
  );
};

/** Thin progress bar with chapter ticks (top edge). */
const Progress: React.FC = () => {
  const f = useCurrentFrame();
  if (f < COLD_OPEN_END) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 5, background: "rgba(255,255,255,0.06)" }}>
      <div style={{ width: `${(f / TOTAL_FRAMES) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.teal}, ${C.amber})` }} />
      {CHAPTER_IDS.map((id) => (
        <div key={id} style={{ position: "absolute", left: `${(START[id] / TOTAL_FRAMES) * 100}%`, top: 0, width: 3, height: 5, background: C.bg }} />
      ))}
    </div>
  );
};

// ---------------------------------------------------------------- audio
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

const MUSIC: [string, string][] = [
  ["c1_title", "s06_hook_promise"],
  ["c2_ram", "s08_ram_boring"],
  ["c3_ai", "s14_who"],
  ["c4_msrp", "s20_gddr"],
  ["c5_twist", "s27_breath"],
  ["c6_regions", "s37_regions"],
  ["c7_bf", "s43_bf"],
  ["c8_advice", "s47_buy_wait"],
  ["c9_outro", "s54_outro_blame"],
];
const FADE = 24;

type Sfx = [number, string, number];
const SFX: Sfx[] = (() => {
  const L: Sfx[] = [];
  const W = "sfx/swoosh.wav";
  const IMP = "sfx/impact.wav";
  const BIG = "sfx/tech/big-impact.mp3";
  const DEEP = "sfx/tech/deep-impact.mp3";
  const BLIP = "ug-001/audio/blip.wav";
  BLOCKS.forEach((b, i) => {
    if (CHAPTER_IDS.includes(b.id)) {
      L.push([b.from, DEEP, 0.45], [b.from + 2, "ug-001/audio/glitch.wav", 0.2]);
    } else if (i > 0) {
      L.push([b.from - 4, i % 2 ? W : "ug-001/audio/whoosh_down.wav", 0.18]);
    }
  });
  L.push(
    [START.s07_title + 4, BIG, 0.5],
    [G("s08_ram_boring", "ram"), IMP, 0.35],
    [G("s09_ram_vertical", "500"), IMP, 0.3],
    [G("s10_ram_128", "listed"), "ug-001/audio/odometer.wav", 0.4],
    [G("s10_ram_128", "listed") + 34, BIG, 0.4],
    [G("s10_ram_128", "typo"), IMP, 0.3],
    [G("s11_ram_now", "550"), BLIP, 0.25],
    [G("s12_india_ram", "40000") + 16, BLIP, 0.25],
    [G("s13_india_now", "50"), IMP, 0.35],
    [G("s14_who", "not"), IMP, 0.3],
    [G("s15_hbm", "hbm"), "ug-001/audio/sub_drop.wav", 0.4],
    [G("s16_wafer", "never"), IMP, 0.3],
    [G("s18b_contract_vs_spot", "warning"), BLIP, 0.25],
    [G("s19_tugofwar", "not"), "ug-001/audio/whoosh_down.wav", 0.4],
    [G("s23_5090", "more"), BIG, 0.45],
    [G("s25_b580", "sink"), "ug-001/audio/sub_drop.wav", 0.3],
    [G("s26_supply", "never"), IMP, 0.3],
    [G("s28_5090_drop", "14"), "ug-001/audio/sub_drop.wav", 0.6],
    [START.s29_restock + 4, BIG, 0.45],
    [G("s33_not_so_fast", "not"), "ug-001/audio/glass_crack.wav", 0.4],
    [G("s33_not_so_fast", "not"), DEEP, 0.4],
    [G("s36_restock_spike", "spike"), IMP, 0.3],
    [G("s39_remove_tax", "strip") + 20, "ug-001/audio/whoosh_down.wav", 0.35],
    [G("s39_remove_tax", "almost"), IMP, 0.35],
    [G("s43_bf", "giant"), IMP, 0.3],
    [G("s44_inflate", "discount") + 20, IMP, 0.3],
    [G("s45_rule", "theater") - 8, "ug-001/audio/whoosh_down.wav", 0.4],
    [G("s46_msrp_win", "msrp"), BLIP, 0.3],
    [G("s49_capacity", "outbidding"), IMP, 0.3],
    [G("s52_advice_buy", "grab"), BLIP, 0.25],
    [G("s52_advice_buy", "keep"), BLIP, 0.25],
    [G("s52_advice_buy", "value"), BLIP, 0.25],
    [G("s54_outro_blame", "ai"), BIG, 0.45],
    [G("s55_outro_shape", "changing"), DEEP, 0.35],
  );
  return L.filter(([at]) => at >= COLD_OPEN_END - 4);
})();

const FullMix: React.FC = () => (
  <>
    <Audio src={A("audio/narration.mp3")} volume={1} />
    <Sequence durationInFrames={COLD_OPEN_END + 40} layout="none">
      <UgColdOpenAudio />
    </Sequence>
    {MUSIC.map(([file, from], i) => {
      const a = START[from];
      const b = i + 1 < MUSIC.length ? START[MUSIC[i + 1][1]] : TOTAL_FRAMES;
      const dur = b - a + FADE;
      return (
        <Sequence key={file} from={a} durationInFrames={dur} layout="none">
          <Audio
            src={staticFile(`ug-001/audio/music/${file}.mp3`)}
            volume={(fr) => {
              const abs = fr + a;
              const base = 0.34 - 0.23 * voice(abs);
              const fin = interpolate(fr, [0, FADE], [0, 1], clamp);
              const fout = interpolate(fr, [dur - FADE, dur], [1, 0], clamp);
              const tail = interpolate(abs, [TOTAL_FRAMES - 60, TOTAL_FRAMES - 4], [1, 0], clamp);
              return base * fin * fout * tail;
            }}
          />
        </Sequence>
      );
    })}
    {SFX.map(([at, src, v], i) => (
      <Sequence key={i} from={at} durationInFrames={90} layout="none">
        <Audio src={staticFile(src)} volume={v} />
      </Sequence>
    ))}
  </>
);

// ---------------------------------------------------------------- root
export const UgFull: React.FC<{ audio?: boolean }> = ({ audio = true }) => (
  <AbsoluteFill style={{ backgroundColor: C.bg }}>
    <Sequence durationInFrames={COLD_OPEN_END + 6} name="cold open (s01–s05)">
      <UgColdOpen />
    </Sequence>
    {BLOCKS.map((b) => (
      <Sequence key={b.id} from={b.from} durationInFrames={b.to - b.from + XF} name={b.id}>
        <SceneHost C={b.C} d={b.to - b.from} id={b.id} />
      </Sequence>
    ))}
    {CHAPTER_IDS.map((id) => (
      <Sequence key={id} from={START[id] - 2} durationInFrames={10} layout="none">
        <Glitch at={2} />
      </Sequence>
    ))}
    <Vignette strength={0.65} />
    <Grain opacity={0.08} />
    <Progress />
    <Caps />
    {audio ? <FullMix /> : null}
  </AbsoluteFill>
);

// ---------------------------------------------------------------- QC contact sheet (2 frozen frames per scene)
const SAMPLES: [number, string][] = [
  ...[30, 200, 330, 420, 600, 760, 880].map((x) => [x, "cold open"] as [number, string]),
  ...BLOCKS.flatMap((b) => [
    [b.from + Math.round((b.to - b.from) * 0.45), b.id] as [number, string],
    [b.to - 14, b.id] as [number, string],
  ]),
];
/** Render only frames 0..SAMPLES.length-1 (the composition is full length so Freeze isn't clamped). */
export const UG001_SHEET_FRAMES = SAMPLES.length;
export const UgSheet: React.FC = () => {
  const f = useCurrentFrame();
  const [t, id] = SAMPLES[Math.min(f, SAMPLES.length - 1)];
  return (
    <AbsoluteFill>
      <Freeze frame={t}>
        <UgFull audio={false} />
      </Freeze>
      <div style={{ position: "absolute", right: 10, top: 10, padding: "4px 10px", background: "#ff0", color: "#000", fontFamily: MONO, fontSize: 22, fontWeight: 800 }}>
        {id} · {Math.floor(t / 1800)}:{String(Math.floor((t / 30) % 60)).padStart(2, "0")} · f{t}
      </div>
    </AbsoluteFill>
  );
};
