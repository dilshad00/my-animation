/**
 * UG-006 Scenes 1–2: THE GAMING PC DREAM (intro) and THE RTX 50 SERIES PROBLEM (chapter 1).
 * All frames absolute; cues from ug006.data.ts.
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { c, path, pathV, Shot } from "./Core6";
import { Backdrop, Bars, Blade, Center, ChapterCard, E, Flap, Flare, HEAD, INTER, Kinetic, Label, lin, LineChart, MetalType, MONO, Pos, Source, Stamp, Tag } from "./Look6";
import { FeCard, Floor, Glow, hash, Particles, P, Shadow, Stage, type V3, Dimm } from "./Three6";
import { Arm, Conveyor, Crates, Hall, JewelCase, Shelf, Tower } from "./World6";

const Dim: React.FC<{ k: number }> = ({ k }) => <AbsoluteFill style={{ background: `rgba(0,0,0,${k})` }} />;

/* ===================================================================== SCENE 1 */
const S1Title: React.FC<{ f: number }> = ({ f }) => (
  <Shot f={f} a={0} b={c("imagine") - 8} fin={0} fout={14}>
    {(lf) => {
      const at2030 = c("t2030");
      return (
        <AbsoluteFill>
          <Backdrop f={lf} warm={0.1 + 0.12 * E.out(lf, 0, 60)} y={55} />
          <Stage cam={{ pos: [path(lf, [[0, 6], [180, -6]]), 4, path(lf, [[0, 150], [180, 120]])], target: [0, 2, 0], fov: 28 }} light={E.out(lf, 0, 40)}>
            <FeCard cls="90" p={[0, -6, -30]} r={[1.2, lf * 0.004, 0]} s={2.2} light={0.6} spin={lf * 0.02} />
            <Floor y={-14} r={300} />
          </Stage>
          <Dim k={0.35} />
          <Blade f={lf} a={2} b={34} />
          <Center y={300}>
            <MetalType f={lf} at={4} size={170} sweepAt={14}>
              NO MORE RTX 50 GPUs?
            </MetalType>
          </Center>
          <Center y={520}>
            <Kinetic f={lf} at={at2030 - 34} text="RAM prices could stay high until" size={64} weight={700} stagger={2} color="rgba(244,242,238,0.9)" />
          </Center>
          <Center y={610}>
            <Flap f={lf} seq={[{ v: "2026", at: at2030 - 30 }, { v: "2027", at: at2030 - 22 }, { v: "2028", at: at2030 - 14 }, { v: "2029", at: at2030 - 6 }, { v: "2030", at: at2030 + 4 }]} size={150} />
          </Center>
          <Flare x={960} y={300} k={lin(lf, 12, 22) * (1 - lin(lf, 22, 60))} w={1800} />
        </AbsoluteFill>
      );
    }}
  </Shot>
);

/** Tower beats: dream → power on → freeze → GPU dissolves → UNAVAILABLE / price tag. */
const GPU_POS: V3 = [-2, 18, 6];
const S1Dream: React.FC<{ f: number }> = ({ f }) => {
  const a = c("imagine") - 8;
  const b = c("worse");
  return (
    <Shot f={f} a={a} b={b} fin={14}>
      {(lf) => {
        const on = c("dream") + 6 - a;
        const freeze = c("unavail") - 22 - a;
        const tf = Math.min(lf, freeze);
        const power = E.out(lf, on, on + 36);
        const spinAcc = Math.max(0, tf - on);
        const spin = spinAcc * spinAcc * 0.0012 * (tf > on + 30 ? 0 : 1) + (tf > on + 30 ? 1.08 + (tf - on - 30) * 0.4 : 0);
        const frozen = lf >= freeze;
        const dis = lin(lf, freeze + 8, freeze + 40);
        const cam: V3 = pathV(tf, [
          [0, [70, 48, 150]],
          [on, [46, 36, 104]],
          [freeze, [22, 26, 62]],
        ]);
        const camAfter: V3 = pathV(lf, [
          [freeze, cam],
          [freeze + 60, [12, 22, 48]],
        ]);
        const save = E.out(lf, 10, on);
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"];
        const mi = Math.min(5, Math.floor(save * 6));
        return (
          <AbsoluteFill style={{ filter: frozen ? `saturate(${1 - 0.75 * lin(lf, freeze, freeze + 6)}) contrast(1.08)` : undefined }}>
            <Backdrop f={lf} warm={0.08 + 0.18 * power} x={45} y={45} />
            <Stage cam={{ pos: frozen ? camAfter : cam, target: [0, 20, 0], fov: 30 }} light={0.45 + 0.55 * power}>
              <Floor r={400} />
              <Shadow w={70} d={40} p={[0, 0.02, 0]} />
              <Tower power={power} spin={spin} phase={tf * 0.08} parts={{ gpu: 1 - dis }} />
              <Particles
                n={260}
                color={P.orange}
                k={3}
                fn={(i) => {
                  const t = lin(lf, freeze + 8 + hash(i) * 20, freeze + 70 + hash(i) * 30);
                  if (t <= 0 || t >= 1) return null;
                  const ang = hash(i * 3) * Math.PI * 2;
                  return { p: [GPU_POS[0] + (hash(i * 5) - 0.5) * 30 + Math.cos(ang) * t * 25, GPU_POS[1] + (hash(i * 7) - 0.5) * 3 + t * 18 * hash(i * 9), GPU_POS[2] + Math.sin(ang) * t * 25 + t * 10], s: 0.18 * (1 - t) };
                }}
              />
              <Glow p={GPU_POS} s={40} color={P.orange} o={0.4 * (dis > 0 && dis < 1 ? Math.sin(dis * Math.PI) : 0)} />
            </Stage>
            {/* savings UI */}
            <Pos x={70} y={70} style={{ opacity: 1 - lin(lf, on + 20, on + 40) }}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: 4, color: P.orange }}>PC BUILD FUND · {months[mi]}</div>
              <div style={{ width: 420, height: 10, background: "rgba(255,255,255,0.08)", borderRadius: 5, marginTop: 14 }}>
                <div style={{ width: 420 * save, height: 10, background: `linear-gradient(90deg, ${P.coral}, ${P.orange})`, borderRadius: 5, boxShadow: `0 0 20px ${P.orange}` }} />
              </div>
            </Pos>
            {frozen ? <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, transparent ${lin(lf, freeze, freeze + 8) * 140}%, rgba(255,255,255,0.18) ${lin(lf, freeze, freeze + 8) * 140 + 2}%, transparent ${lin(lf, freeze, freeze + 8) * 140 + 8}%)` }} /> : null}
            <Pos x={1120} y={260}>
              <Stamp f={lf} at={c("unavail") - a} size={92}>
                UNAVAILABLE
              </Stamp>
            </Pos>
            {lf >= c("hundreds") - a ? (
              <Pos x={1180} y={470}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 18, padding: "18px 30px", borderRadius: 14, background: "rgba(11,12,14,0.85)", border: `3px solid ${P.coral}`, transform: `translateY(${-E.out(lf, c("hundreds") - a, c("hundreds") - a + 40) * 40}px)` }}>
                  <span style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 96, color: P.coral }}>▲ +$$$</span>
                  <span style={{ fontFamily: MONO, fontSize: 22, color: "rgba(244,242,238,0.8)", lineHeight: 1.3 }}>
                    GPU PRICE
                    <br />
                    OVER MSRP
                  </span>
                </div>
                <div style={{ marginTop: 14 }}>
                  <Tag f={lf} at={c("hundreds") - a + 8}>ILLUSTRATIVE</Tag>
                </div>
              </Pos>
            ) : null}
          </AbsoluteFill>
        );
      }}
    </Shot>
  );
};

/** RAM macro with racing price counters, then the jewellery case. */
const SlotDigits: React.FC<{ f: number; seed: number; label: string; x: number }> = ({ f, seed, label, x }) => {
  const rise = Math.floor(100 + f * (2 + hash(seed) * 2));
  return (
    <Pos x={x} y={190} style={{ textAlign: "center" }}>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, color: "rgba(244,242,238,0.7)", letterSpacing: 3 }}>{label}</div>
      <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 84, color: P.coral, textShadow: `0 0 30px ${P.coral}88`, fontVariantNumeric: "tabular-nums" }}>▲{rise}</div>
    </Pos>
  );
};
const S1Ram: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Shot f={f} a={c("worse")} b={c("luxury") - 6} fin={10}>
      {(lf, d) => (
        <AbsoluteFill>
          <Backdrop f={lf} warm={0.2} />
          <Stage cam={{ pos: [path(lf, [[0, 14], [d, 4]]), path(lf, [[0, 34], [d, 31]]), path(lf, [[0, 30], [d, 18]])], target: [5, 30, -9], fov: 26 }}>
            <Tower power={1} spin={lf * 0.4} phase={lf * 0.12} parts={{ gpu: 0 }} />
          </Stage>
          {lf > c("ramprice") - c("worse") ? (
            <>
              <SlotDigits f={lf - (c("ramprice") - c("worse"))} seed={1} label="DDR5 16GB" x={420} />
              <SlotDigits f={lf - (c("ramprice") - c("worse")) - 6} seed={2} label="DDR5 32GB" x={860} />
              <SlotDigits f={lf - (c("ramprice") - c("worse")) - 12} seed={3} label="DDR5 64GB" x={1300} />
              <Pos x={70} y={70}>
                <Tag f={lf} at={c("ramprice") - c("worse")}>PRICE INDEX · ILLUSTRATIVE</Tag>
              </Pos>
            </>
          ) : null}
        </AbsoluteFill>
      )}
    </Shot>
    <Shot f={f} a={c("luxury") - 6} b={c("ordinary")} fin={0}>
      {(lf, d) => {
        const ang = path(lf, [[0, -0.5], [d, 0.4]]);
        return (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.12} y={30} />
            <AbsoluteFill style={{ background: "radial-gradient(ellipse 22% 60% at 50% 0%, rgba(255,240,220,0.22), transparent 80%)" }} />
            <Stage cam={{ pos: [Math.sin(ang) * 46, 26, Math.cos(ang) * 46], target: [0, 15, 0], fov: 28 }} light={0.8}>
              <Floor r={300} />
              <Shadow w={50} d={30} />
              <JewelCase>
                <Dimm rgb={1} phase={lf * 0.08} p={[0, 0.2, 0]} />
              </JewelCase>
              <Glow p={[0, 16, 0]} s={30} color="#fff2df" o={0.25} />
            </Stage>
            <Pos x={120} y={800}>
              <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 40, letterSpacing: 8, color: "rgba(244,242,238,0.85)", opacity: E.out(lf, 10, 30) }}>THE LUXURY COLLECTION</div>
              <div style={{ fontFamily: MONO, fontSize: 22, color: P.orange, letterSpacing: 4, marginTop: 6, opacity: E.out(lf, 18, 36) }}>DDR5 · 32GB · HANDLE WITH CARE</div>
            </Pos>
          </AbsoluteFill>
        );
      }}
    </Shot>
  </>
);

/** Parts vanish; THINK AGAIN; pull back through the glass to reveal the data-centre hall. */
const S1Think: React.FC<{ f: number }> = ({ f }) => {
  const a = c("ordinary");
  const b = c("nvred");
  return (
    <Shot f={f} a={a} b={b} fin={0}>
      {(lf, d) => {
        const big = c("bigger") - a;
        const v = (k: number) => 1 - lin(lf, 6 + k * 14, 18 + k * 14);
        const back = E.io(lf, big - 4, d);
        const cam: V3 = [20 - back * 10, 24 + back * 30, 60 + back * 420];
        return (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.1} />
            <Stage cam={{ pos: cam, target: [0, 20 + back * 5, -40 * back], fov: 30 + back * 10 }} fog={0.0035 * back} light={1}>
              <Floor r={800} />
              <Tower power={0.6 * v(4)} spin={lf * 0.3} parts={{ gpu: 0, ram: v(0), cooler: v(1), psu: v(2), fans: v(3) }} />
              {back > 0 ? (
                <group position={[0, 0, -120]}>
                  <Hall f={lf} aisles={11} len={30} leds={back} strips={back} />
                </group>
              ) : null}
            </Stage>
            <AbsoluteFill style={{ background: `linear-gradient(180deg, rgba(0,0,0,${0.5 * (1 - back)}) 0%, transparent 40%)` }} />
            <Center y={130}>
              <Kinetic f={lf} at={4} text="Your next [gaming] PC?" size={120} out={d - 10} />
            </Center>
            <Center y={290}>
              <Kinetic f={lf} at={big} text="[Think] [again.]" size={170} accent={P.orange} stagger={5} out={d - 10} />
            </Center>
            <Bars k={E.out(lf, big, big + 20) * 0.6} />
          </AbsoluteFill>
        );
      }}
    </Shot>
  );
};

/** Preview montage: narrowing gate · wafer split · timeline to 2029/2030. */
const S1Preview: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Shot f={f} a={c("nvred")} b={c("shift")} fin={0}>
      {(lf, d) => {
        const gate = E.io(lf, 10, d - 10);
        return (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.16} />
            <Stage cam={{ pos: [path(lf, [[0, -40], [d, -20]]), 26, 70], target: [0, 2, 0], fov: 30 }}>
              <Floor r={500} />
              <Conveyor f={lf} speed={0.9} item="card" len={140} gap={14} p={[0, 0, 0]} />
              {[-1, 1].map((s) => (
                <group key={s} position={[18, 6, s * (14 - gate * 8)]}>
                  <mesh>
                    <boxGeometry args={[1.5, 14, 10]} />
                    <meshStandardMaterial color="#1a1b1f" metalness={0.8} roughness={0.3} emissive={P.coral} emissiveIntensity={0.3 + gate * 0.6} />
                  </mesh>
                </group>
              ))}
              <Glow p={[18, 6, 0]} s={30} color={P.coral} o={0.3 * gate} />
            </Stage>
            <Pos x={80} y={80}>
              <Kinetic f={lf} at={4} text="NVIDIA gaming GPU supply" size={78} align="left" />
              <div style={{ marginTop: 14 }}>
                <Tag f={lf} at={14}>REPORTED · REDUCED</Tag>
              </div>
            </Pos>
          </AbsoluteFill>
        );
      }}
    </Shot>
    <Shot f={f} a={c("shift")} b={c("forecast")} fin={6}>
      {(lf, d) => {
        const flow = E.io(lf, 6, d - 10);
        return (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.12} x={30} />
            <Stage cam={{ pos: [0, 70, 70], target: [0, 0, 0], fov: 32 }}>
              <group position={[-40, 0, 0]} rotation={[0, lf * 0.004, 0]}>
                <Glow p={[0, 0, 0]} s={50} color={P.orange} o={0.2} />
              </group>
              <Particles
                n={420}
                color={P.orange}
                k={3}
                fn={(i) => {
                  const big = i < 340;
                  const t = (hash(i) + lf * (0.004 + hash(i * 2) * 0.004)) % 1;
                  if (t > flow) return null;
                  const tx = 42;
                  const tz = big ? -26 : 30;
                  const x = -40 + (tx + 40) * t;
                  const z = (hash(i * 3) - 0.5) * 20 * (1 - t) + tz * Math.sin((t * Math.PI) / 2);
                  const y = Math.sin(t * Math.PI) * 14 + (hash(i * 5) - 0.5) * 3;
                  return { p: [x, y, z], s: big ? 0.45 : 0.3 };
                }}
              />
              <group position={[-40, 0, 0]} rotation={[0.25, lf * 0.01, 0]}>
                <WaferMini />
              </group>
            </Stage>
            <Label f={lf} at={14} x={1430} y={300} title="AI · data centres" sub="HIGH-VALUE MEMORY" dx={60} dy={-60} />
            <Label f={lf} at={22} x={1440} y={760} title="Gaming PCs" sub="WHAT'S LEFT" dx={60} dy={60} color={P.coral} />
            <Pos x={80} y={80}>
              <Kinetic f={lf} at={2} text="Memory makers shift to [AI]" size={78} align="left" />
            </Pos>
          </AbsoluteFill>
        );
      }}
    </Shot>
    <Shot f={f} a={c("forecast")} b={c("q1")} fin={6}>
      {(lf, d) => {
        const years = ["2026", "2027", "2028", "2029", "2030"];
        const run = E.io(lf, 10, c("y2029") - c("forecast") + 10);
        const x0 = 1700 - run * 1500;
        return (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.1} y={60} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 560, height: 4, background: "linear-gradient(90deg, transparent, rgba(244,242,238,0.4), transparent)" }} />
            {years.map((y, i) => {
              const x = x0 + i * 420;
              const hot = i >= 3 && lf > c(i === 3 ? "y2029" : "y2030a") - c("forecast") - 4;
              return (
                <div key={y} style={{ position: "absolute", left: x - 160, top: 420, width: 320, textAlign: "center" }}>
                  <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: hot ? 170 : 120, color: hot ? P.orange : "rgba(244,242,238,0.35)", textShadow: hot ? `0 0 50px ${P.orange}88` : "none" }}>{y}</div>
                  <div style={{ margin: "6px auto", width: 18, height: 18, borderRadius: 9, background: hot ? P.orange : "rgba(244,242,238,0.4)" }} />
                </div>
              );
            })}
            <Pos x={80} y={80}>
              <Kinetic f={lf} at={2} text="Memory supply could stay tight for [years]" size={70} align="left" />
            </Pos>
            <Source f={lf} at={20}>INDUSTRY FORECASTS, E.G. DELOITTE INSIGHTS (2026)</Source>
            <Flare x={960} y={560} k={lin(lf, d - 40, d - 30) * (1 - lin(lf, d - 30, d))} />
          </AbsoluteFill>
        );
      }}
    </Shot>
  </>
);
const WaferMini: React.FC = () => {
  return (
    <group scale={0.9}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[15, 72]} />
        <meshPhysicalMaterial color="#5a6170" metalness={1} roughness={0.1} iridescence={1} iridescenceIOR={1.8} clearcoat={1} />
      </mesh>
    </group>
  );
};

/** Three questions over a dark GPU orbit, whip into chapter 1. */
const S1Questions: React.FC<{ f: number }> = ({ f }) => {
  const a = c("q1");
  return (
    <Shot f={f} a={a} b={c("ch1")} fin={8} fout={0}>
      {(lf, d) => {
        const qs: [string, number, number][] = [
          ["What is [happening?]", c("q1") - a, c("q2") - a],
          ["Why is [AI] hitting\ngaming hardware?", c("q2") - a, c("q3") - a],
          ["Will a gaming PC\ncost [more?]", c("q3") - a, c("startnv") - a],
        ];
        const whip = E.get("power4.in")(lin(lf, d - 12, d));
        return (
          <AbsoluteFill style={{ transform: `translateX(${-whip * 1900}px)`, filter: whip > 0 ? `blur(${whip * 30}px)` : undefined }}>
            <Backdrop f={lf} warm={0.06} />
            <Stage cam={{ pos: [Math.sin(lf * 0.006) * 60, 18, Math.cos(lf * 0.006) * 60], target: [0, 2, 0], fov: 30 }} light={0.5} rim={P.orange}>
              <FeCard cls="90" r={[0.9, 0, 0.15]} p={[16, 2, 0]} light={0.4} spin={lf * 0.05} />
            </Stage>
            <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 55%, transparent 80%)" }} />
            {qs.map(([t, s, e], i) =>
              lf >= s && lf < e + 6 ? (
                <Pos key={i} x={110} y={330}>
                  <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: P.orange, letterSpacing: 6, marginBottom: 20 }}>QUESTION {i + 1} / 3</div>
                  <Kinetic f={lf} at={s} text={t} size={110} align="left" out={e - 6} />
                </Pos>
              ) : null,
            )}
            {lf >= c("startnv") - a ? (
              <Pos x={110} y={330}>
                <Kinetic f={lf} at={c("startnv") - a} text="Let's start with [NVIDIA]" size={110} align="left" />
              </Pos>
            ) : null}
          </AbsoluteFill>
        );
      }}
    </Shot>
  );
};

export const Scene1: React.FC<{ f: number }> = ({ f }) => {
  if (f >= c("ch1") + 10) return null;
  return (
    <>
      <S1Title f={f} />
      <S1Dream f={f} />
      <S1Ram f={f} />
      <S1Think f={f} />
      <S1Preview f={f} />
      <S1Questions f={f} />
    </>
  );
};

/* ===================================================================== SCENE 2 */
const HERO_END = () => c("ch1") + 150;
const S2Card: React.FC<{ f: number }> = ({ f }) => (
  <Shot f={f} a={c("ch1")} b={HERO_END()} fin={0}>
    {(lf, d) => <ChapterCard f={lf} n={1} title="The RTX 50 Series Problem" variant={0} len={d + 8} />}
  </Shot>
);

const S2Hero: React.FC<{ f: number }> = ({ f }) => (
  <Shot f={f} a={HERO_END()} b={c("blackwell")}>
    {(lf, d) => {
      const rise = (k: number) => E.out(lf, 4 + k * 10, 40 + k * 10);
      const ang = path(lf, [[0, -0.35], [d, 0.25]]);
      const cam: V3 = [Math.sin(ang) * 120, 34, Math.cos(ang) * 120];
      const cards: { cls: "90" | "80" | "70"; x: number; name: string }[] = [
        { cls: "80", x: -36, name: "RTX 5080" },
        { cls: "90", x: 0, name: "RTX 5090" },
        { cls: "70", x: 34, name: "RTX 5070" },
      ];
      return (
        <AbsoluteFill>
          <Backdrop f={lf} warm={0.18} y={50} />
          <Stage cam={{ pos: cam, target: [0, 12, 0], fov: 30 }}>
            <Floor r={500} />
            {cards.map((cd, k) => (
              <group key={cd.cls + k}>
                <mesh position={[cd.x, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[12, 48]} />
                  <meshStandardMaterial color="#120c08" emissive={P.orange} emissiveIntensity={0.5 * rise(k)} />
                </mesh>
                <Glow p={[cd.x, 2, 0]} s={30} color={P.orange} o={0.25 * rise(k)} />
                <FeCard cls={cd.cls} p={[cd.x, -12 + 26 * rise(k), 0]} r={[Math.PI / 2 - 0.05, lf * 0.006 + k, 0]} s={cd.cls === "70" ? 1 : 0.92} spin={lf * 0.2} light={rise(k)} />
              </group>
            ))}
          </Stage>
          {cards.map((cd, k) => {
            const xs = [560, 960, 1360][k];
            return (
              <Pos key={k} x={xs - 200} y={860} w={400} style={{ textAlign: "center", opacity: E.out(lf, 30 + k * 10, 50 + k * 10) }}>
                <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 58, color: P.white, letterSpacing: 2 }}>{cd.name}</div>
                <div style={{ width: 120, height: 3, background: P.orange, margin: "6px auto" }} />
              </Pos>
            );
          })}
          <Pos x={80} y={70}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, color: "rgba(244,242,238,0.6)", letterSpacing: 3, opacity: E.out(lf, 50, 70) }}>ORIGINAL 3D ILLUSTRATION · NOT OFFICIAL RENDERS</div>
          </Pos>
        </AbsoluteFill>
      );
    }}
  </Shot>
);

const S2Die: React.FC<{ f: number }> = ({ f }) => (
  <Shot f={f} a={c("blackwell")} b={c("hands")}>
    {(lf, d) => {
      const z = path(lf, [[0, 60], [40, 26], [d, 20]]);
      const wave = (lf * 0.6) % 14;
      return (
        <AbsoluteFill>
          <Backdrop f={lf} warm={0.08} />
          <Stage cam={{ pos: [path(lf, [[0, -8], [d, 8]]), z, z * 0.55], target: [0, 0, 0], fov: 34 }}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[42, 42]} />
              <meshPhysicalMaterial color="#ffffff" metalness={0.9} roughness={0.18} clearcoat={1} map={undefined} />
            </mesh>
            <DieGrid lf={lf} wave={wave} />
          </Stage>
          <Pos x={90} y={90}>
            <MetalType f={lf} at={6} size={120}>
              Blackwell
            </MetalType>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: P.orange, letterSpacing: 6, marginTop: 6, opacity: E.out(lf, 14, 30) }}>GPU ARCHITECTURE · RTX 50 SERIES</div>
          </Pos>
          <Pos x={1240} y={560}>
            {["5th-gen Tensor Cores", "4th-gen RT Cores", "DLSS 4 · Multi Frame Generation"].map((t, i) => (
              <div key={t} style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 46, color: P.white, opacity: E.out(lf, 40 + i * 14, 56 + i * 14), transform: `translateX(${(1 - E.out(lf, 40 + i * 14, 56 + i * 14)) * 40}px)`, marginBottom: 10, textShadow: "0 4px 20px rgba(0,0,0,0.9)" }}>
                <span style={{ color: P.orange }}>▸ </span>
                {t}
              </div>
            ))}
          </Pos>
        </AbsoluteFill>
      );
    }}
  </Shot>
);
/** Die floorplan: SM tiles that light in a travelling wave. */
const DieGrid: React.FC<{ lf: number; wave: number }> = ({ lf, wave }) => {
  const tiles: React.ReactNode[] = [];
  for (let i = 0; i < 12; i++)
    for (let j = 0; j < 8; j++) {
      const dist = Math.abs(i - wave) + Math.abs(j - 4) * 0.3;
      const k = Math.max(0, 1 - dist / 2.5);
      tiles.push(
        <mesh key={`${i}-${j}`} position={[-17 + i * 3.1, 0.15, -12 + j * 3.4]}>
          <boxGeometry args={[2.6, 0.25, 2.9]} />
          <meshStandardMaterial color="#1c2028" metalness={0.9} roughness={0.25} emissive={P.orange} emissiveIntensity={0.08 + k * 2.2} />
        </mesh>,
      );
    }
  return (
    <group>
      {tiles}
      <mesh position={[0, 0.12, -16]}>
        <boxGeometry args={[38, 0.2, 2]} />
        <meshStandardMaterial color="#2a2f3a" metalness={0.9} roughness={0.2} emissive={P.cool} emissiveIntensity={0.2 + 0.2 * Math.sin(lf * 0.2)} />
      </mesh>
      <mesh position={[0, 0.12, 16]}>
        <boxGeometry args={[38, 0.2, 2]} />
        <meshStandardMaterial color="#2a2f3a" metalness={0.9} roughness={0.2} emissive={P.cool} emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
};

const S2Window: React.FC<{ f: number }> = ({ f }) => (
  <Shot f={f} a={c("hands")} b={c("reports")}>
    {(lf, d) => {
      const fog = E.io(lf, 20, d);
      return (
        <AbsoluteFill>
          <Backdrop f={lf} warm={0.2} />
          <Stage cam={{ pos: [0, 10, 52], target: [0, 8, 0], fov: 30 }}>
            <FeCard cls="90" p={[0, 8, -path(lf, [[0, 0], [d, 40]])]} r={[Math.PI / 2 - 0.1, 0.4 + lf * 0.004, 0]} light={1} spin={lf * 0.2} />
            <Floor r={300} y={-6} />
          </Stage>
          <AbsoluteFill style={{ backdropFilter: `blur(${fog * 14}px)`, background: `rgba(200,210,220,${0.04 + fog * 0.1})` }} />
          <AbsoluteFill style={{ background: "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.07) 38%, transparent 46%)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 470, height: 140, transform: `translateX(${(1 - E.out(lf, 30, 50)) * -2000}px) rotate(-4deg)`, background: P.coral, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
            <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 110, color: "#14080a", letterSpacing: 18 }}>OUT OF STOCK</div>
          </div>
        </AbsoluteFill>
      );
    }}
  </Shot>
);

/** Production line → slowdown → allocation comparison. */
const S2Line: React.FC<{ f: number }> = ({ f }) => {
  const a = c("reports");
  const cmpAt = c("pct2030") - 40;
  return (
    <>
      <Shot f={f} a={a} b={cmpAt}>
        {(lf, d) => {
          const slowAt = c("onereport") - a;
          // integrate speed so the line decelerates smoothly
          const v0 = 0.9;
          const t1 = Math.max(0, lf - slowAt);
          const T = 70;
          const dist = Math.min(lf, slowAt) * v0 + (t1 < T ? v0 * t1 - (v0 * 0.85 * t1 * t1) / (2 * T) : v0 * T - (v0 * 0.85 * T) / 2 + v0 * 0.15 * (t1 - T));
          const camX = path(lf, [[0, -70], [d, 30]]);
          const slow = lin(lf, slowAt, slowAt + T);
          return (
            <AbsoluteFill style={{ filter: `saturate(${1 - slow * 0.35})` }}>
              <Backdrop f={lf} warm={0.14} cool={0.14} />
              <Stage cam={{ pos: [camX, 30, 58], target: [camX + 18, 2, 0], fov: 32 }} rim={P.cool}>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, 0]}>
                  <planeGeometry args={[600, 200]} />
                  <meshStandardMaterial color="#0d0e11" metalness={0.6} roughness={0.4} />
                </mesh>
                <Conveyor f={lf} speed={0} dist={dist} item="die" len={220} gap={10} />
                {[-60, -10, 40].map((x, i) => (
                  <Arm key={x} p={[x, -1.4, -10]} s={0.8} a={0.2 + Math.sin(dist * 0.12 + i) * 0.4} b={0.55} c={-1.3 + Math.sin(dist * 0.12 + i) * 0.25} />
                ))}
                <Crates n={20} cols={5} vis={() => 1} p={[130, -1.4, -6]} />
              </Stage>
              <Label f={lf} at={20} x={1500} y={420} title="Board partners" sub="CARD MAKERS · ILLUSTRATION" dx={-60} dy={-120} align="right" />
              <Pos x={80} y={80}>
                <Tag f={lf} at={6}>REPORTED SUPPLY-CHAIN CLAIM</Tag>
              </Pos>
              {slow > 0 ? (
                <Pos x={80} y={150}>
                  <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: P.coral, letterSpacing: 4, opacity: slow }}>LINE OUTPUT ▼ (ILLUSTRATIVE)</div>
                </Pos>
              ) : null}
            </AbsoluteFill>
          );
        }}
      </Shot>
      <Shot f={f} a={cmpAt} b={c("detail")}>
        {(lf, d) => {
          const cut = E.io(lf, 30, 70);
          const removed = Math.round(25 * 0.25);
          return (
            <AbsoluteFill>
              <Backdrop f={lf} warm={0.12} y={60} />
              <Stage cam={{ pos: [path(lf, [[0, 0], [d, 8]]), 40, 120], target: [0, 12, 0], fov: 30 }}>
                <Floor r={500} />
                <Crates n={25} cols={5} vis={() => 1} p={[-34, 0, 0]} />
                <Crates n={25} cols={5} vis={(i) => (i >= 25 - removed && cut > (i - (25 - removed)) / removed ? 0 : 1)} p={[34, 0, 0]} color={P.coral} />
              </Stage>
              <Pos x={300} y={850} w={520} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 50, color: P.white }}>NORMAL GPU ALLOCATION</div>
              </Pos>
              <Pos x={1100} y={850} w={520} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 50, color: P.coral }}>REDUCED GPU ALLOCATION</div>
              </Pos>
              <Center y={110}>
                <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 170, color: P.coral, opacity: E.out(lf, 36, 52), transform: `scale(${1.3 - 0.3 * E.out(lf, 36, 52)})`, textShadow: `0 0 50px ${P.coral}66` }}>−20–30%</div>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, color: P.white, letterSpacing: 5, opacity: E.out(lf, 46, 60) }}>NOV 2026 → JAN 2027 · BOARD-PARTNER ALLOCATION</div>
              </Center>
              <Pos x={80} y={60}>
                <Tag f={lf} at={0}>REPORTED CLAIM · NOT CONFIRMED BY NVIDIA</Tag>
              </Pos>
            </AbsoluteFill>
          );
        }}
      </Shot>
    </>
  );
};

const S2Fact: React.FC<{ f: number }> = ({ f }) => (
  <Shot f={f} a={c("detail")} b={c("firstwarn")}>
    {(lf) => {
      const a = c("detail");
      const rows: [string, string, string, number][] = [
        ["SOURCE", "Chinese supply-chain report, relayed by media", "?", c("chinese") - a],
        ["NVIDIA", "Has not officially confirmed this reduction", "✕", c("notconf") - a],
        ["SCOPE", "Not confirmed to apply worldwide", "✕", c("worldwide") - a - 10],
      ];
      return (
        <AbsoluteFill>
          <Backdrop f={lf} warm={0.06} />
          <Pos x={260} y={170} w={1400}>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, letterSpacing: 8, color: P.amber, opacity: E.out(lf, 0, 14) }}>IMPORTANT DETAIL</div>
            <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 96, color: P.white, marginTop: 8, opacity: E.out(lf, 4, 20) }}>WHAT WE ACTUALLY KNOW</div>
            <div style={{ height: 3, background: P.amber, width: 1400 * E.out(lf, 10, 40), margin: "20px 0 30px" }} />
            {rows.map(([k, v, ic, at]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 36, padding: "22px 0", borderBottom: "1px solid rgba(255,255,255,0.08)", opacity: E.out(lf, at, at + 14), transform: `translateY(${(1 - E.out(lf, at, at + 14)) * 20}px)` }}>
                <div style={{ width: 70, height: 70, borderRadius: 35, border: `3px solid ${ic === "?" ? P.amber : P.coral}`, color: ic === "?" ? P.amber : P.coral, fontFamily: INTER, fontWeight: 900, fontSize: 38, display: "flex", alignItems: "center", justifyContent: "center" }}>{ic}</div>
                <div style={{ width: 220, fontFamily: MONO, fontWeight: 800, fontSize: 30, color: "rgba(244,242,238,0.6)", letterSpacing: 4 }}>{k}</div>
                <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 46, color: P.white }}>{v}</div>
              </div>
            ))}
          </Pos>
        </AbsoluteFill>
      );
    }}
  </Shot>
);

const S2Earlier: React.FC<{ f: number }> = ({ f }) => (
  <Shot f={f} a={c("firstwarn")} b={c("limited")}>
    {(lf, d) => {
      const a = c("firstwarn");
      const strug = c("struggling") - a;
      return (
        <AbsoluteFill>
          <Backdrop f={lf} warm={0.1} y={70} />
          <Stage cam={{ pos: [path(lf, [[0, -30], [d, 20]]), 30, 110], target: [0, 6, 0], fov: 30 }} light={0.7}>
            <Floor r={500} />
            {[-45, -15, 15, 45].map((x, i) => (
              <group key={x}>
                <mesh position={[x, 0.6, 0]}>
                  <boxGeometry args={[22, 1.2, 16]} />
                  <meshStandardMaterial color="#4a3a28" roughness={0.9} />
                </mesh>
                <Crates n={i === 2 ? 2 : 0} cols={2} vis={() => 1} p={[x, 1.2, 0]} />
              </group>
            ))}
          </Stage>
          <div style={{ position: "absolute", left: 120, right: 120, top: 120, height: 4, background: "rgba(244,242,238,0.25)" }} />
          {["JAN", "MAR", "MAY", "JUL", "SEP", "NOV"].map((m, i) => (
            <div key={m} style={{ position: "absolute", left: 120 + i * 336, top: 136, fontFamily: MONO, fontSize: 22, color: "rgba(244,242,238,0.6)" }}>{m}</div>
          ))}
          <div style={{ position: "absolute", left: 1800, top: 100, fontFamily: HEAD, fontWeight: 800, fontSize: 40, color: "rgba(244,242,238,0.6)" }}>2026</div>
          {[
            [250, 16],
            [820, 30],
          ].map(([x, at], i) => (
            <div key={i} style={{ position: "absolute", left: x, top: 90, opacity: E.out(lf, at, at + 14) }}>
              <div style={{ width: 22, height: 22, borderRadius: 11, background: P.amber, marginTop: 12, boxShadow: `0 0 20px ${P.amber}` }} />
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, color: P.amber, marginTop: 40, letterSpacing: 2, whiteSpace: "nowrap" }}>EARLIER REPORT · REDUCED RTX 50 SUPPLY</div>
            </div>
          ))}
          <Pos x={120} y={800}>
            <Kinetic f={lf} at={strug} text="Card makers [struggling] for GPUs" size={84} align="left" />
          </Pos>
          <Pos x={120} y={230}>
            <Tag f={lf} at={8}>EARLIER 2026 REPORTS · UNCONFIRMED</Tag>
          </Pos>
        </AbsoluteFill>
      );
    }}
  </Shot>
);

const S2Shelves: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Shot f={f} a={c("limited")} b={c("pinc") - 8}>
      {(lf) => (
        <AbsoluteFill>
          <Backdrop f={lf} warm={0.08} />
          <Center y={190}>
            <LineChart
              f={lf}
              at={0}
              w={1500}
              h={640}
              xLabels={["", "", "", "", "", ""]}
              title="SUPPLY vs DEMAND · ILLUSTRATIVE"
              series={[
                { vals: [0.62, 0.66, 0.7, 0.72, 0.75, 0.78], color: P.white, label: "DEMAND", at: 6, len: 60 },
                { vals: [0.6, 0.62, 0.5, 0.4, 0.32, 0.28], color: P.coral, label: "SUPPLY", at: 14, len: 60 },
              ]}
              shadeBetween={[0, 1]}
              shadeLabel="SHORTAGE"
              shadeAt={60}
            />
          </Center>
        </AbsoluteFill>
      )}
    </Shot>
    <Shot f={f} a={c("pinc") - 8} b={c("whynv")} fin={0}>
      {(lf, d) => {
        const a = c("pinc") - 8;
        const icons: [string, string, number][] = [
          ["⧗", "WAIT", c("wait") - a],
          ["▲", "PAY MORE", c("paymore") - a - 6],
          ["◧", "OLDER HARDWARE", c("older") - a],
        ];
        const iconsOn = lf >= icons[0][2];
        const x = path(lf, [[0, -90], [d, 40]]);
        return (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.12} />
            <AbsoluteFill style={{ filter: iconsOn ? `blur(${E.out(lf, icons[0][2], icons[0][2] + 10) * 8}px) brightness(0.55)` : undefined }}>
              <Stage cam={{ pos: [x, 22, 30], target: [x + 30, 18, -14], fov: 36 }} rim={P.cool}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[600, 200]} />
                  <meshStandardMaterial color="#0e0f12" metalness={0.6} roughness={0.35} />
                </mesh>
                {[-120, -72, -24, 24, 72, 120].map((sx, k) => (
                  <Shelf key={sx} p={[sx, 0, -16]} levels={4} slots={6} filled={(l, s) => hash(k * 31 + l * 7 + s) > 0.82} tag={(l, s) => (lin(lf, 10 + ((k * 6 + s + l) % 9) * 6, 16 + ((k * 6 + s + l) % 9) * 6) > 0.5 ? 1 : 0)} />
                ))}
              </Stage>
            </AbsoluteFill>
            {!iconsOn ? (
              <Pos x={80} y={80}>
                <Kinetic f={lf} at={4} text="Prices [up.] Shelves [empty.]" size={92} align="left" />
                <div style={{ marginTop: 14 }}>
                  <Tag f={lf} at={14}>ILLUSTRATIVE</Tag>
                </div>
              </Pos>
            ) : null}
            {icons.map(([ic, t, at], i) =>
              lf >= at ? (
                <Pos key={t} x={250 + i * 520} y={370} w={420} style={{ textAlign: "center" }}>
                  <div style={{ width: 200, height: 200, margin: "0 auto", borderRadius: 100, border: `5px solid ${i === 1 ? P.coral : P.orange}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 100, color: P.white, transform: `scale(${E.back(lf, at, at + 14)})`, background: "rgba(11,12,14,0.7)" }}>{ic}</div>
                  <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 64, color: P.white, marginTop: 20, opacity: E.out(lf, at + 4, at + 16) }}>{t}</div>
                </Pos>
              ) : null,
            )}
          </AbsoluteFill>
        );
      }}
    </Shot>
  </>
);

const S2Beyond: React.FC<{ f: number }> = ({ f }) => (
  <Shot f={f} a={c("whynv")} b={c("ch2")} fout={12}>
    {(lf, d) => {
      const up = E.io(lf, 10, d);
      return (
        <AbsoluteFill>
          <Backdrop f={lf} warm={0.05 + 0.15 * up} y={70} />
          <Stage cam={{ pos: [0, 20 + up * 140, 60 + up * 100], target: [0, 10 + up * 30, -200], fov: 40 }} fog={0.004} light={0.8}>
            {[-60, -20, 20, 60].map((sx, k) => (
              <Shelf key={sx} p={[sx, 0, 0]} levels={4} slots={5} filled={(l, s) => hash(k * 11 + l * 5 + s) > 0.85} />
            ))}
            <group position={[0, 0, -420]}>
              <Hall f={lf} aisles={15} len={20} leds={up} strips={up} />
            </group>
          </Stage>
          <Center y={200}>
            <Kinetic f={lf} at={c("beyond") - c("whynv")} text="Far beyond [gaming]" size={120} />
          </Center>
        </AbsoluteFill>
      );
    }}
  </Shot>
);

export const Scene2: React.FC<{ f: number }> = ({ f }) => {
  if (f < c("ch1") - 2 || f >= c("ch2") + 14) return null;
  return (
    <>
      <S2Card f={f} />
      <S2Hero f={f} />
      <S2Die f={f} />
      <S2Window f={f} />
      <S2Line f={f} />
      <S2Fact f={f} />
      <S2Earlier f={f} />
      <S2Shelves f={f} />
      <S2Beyond f={f} />
    </>
  );
};
