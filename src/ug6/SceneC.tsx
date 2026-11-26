/**
 * UG-006 Scenes 5–7: THE ROAD TO 2030 (ch4), THE COST OF BUILDING A PC (ch5), THE FUTURE OF PC GAMING (ch5 tail + ch6 + CTA).
 */
import { geoAlbersUsa, geoPath } from "d3-geo";
import React from "react";
import { AbsoluteFill } from "remotion";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import usStates from "us-atlas/states-10m.json";
import { c, path, Shot } from "./Core6";
import { Backdrop, Bars, Center, ChapterCard, E, Flare, HEAD, INTER, Kinetic, Label, lin, LineChart, MetalType, MONO, Pos, Source, Stamp, Tag } from "./Look6";
import { Cam as _Cam, Dimm, FeCard, Floor, Glow, hash, Particles, P, Shadow, Stage, Wafer, type V3 } from "./Three6";
import { Aio, Arm, Console, Cpu, Desk, Fab, Foup, Litho, Mobo, Psu, Ssd, Text3D, Tower } from "./World6";
import { RtxCard } from "../ug5/Three5";
import { TOTAL_FRAMES, VO_FRAMES } from "./ug006.data";

void _Cam;

/* ===================================================================== SCENE 5 */
const S5Card: React.FC<{ f: number }> = ({ f }) => {
  const a = c("ch4");
  return (
    <Shot f={f} a={a} b={c("youthink")} fin={10}>
      {(lf, d) => {
        const x = path(lf, [[0, -40], [d, 30]]);
        return (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.16} y={60} />
            <Stage cam={{ pos: [x, 8, 70 - lf * 0.05], target: [x * 0.4, 6, 0], fov: 32 }} keyPos={[Math.sin(lf * 0.02) * 40, 30, 30]}>
              <Text3D text="2030" h={22} depth={7} p={[0, 8, 0]} accent={1.2} />
              <Floor r={300} y={-8} />
            </Stage>
            <Center y={760}>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, letterSpacing: 12, color: P.orange, opacity: E.out(lf, 4, 18) }}>CHAPTER 4</div>
              <div style={{ marginTop: 14 }}>
                <MetalType f={lf} at={8} size={76}>
                  Why does everyone keep talking about 2030?
                </MetalType>
              </div>
            </Center>
            <Pos x={80} y={70}>
              <Kinetic f={lf} at={c("last") - a} text="Why could this last [so long?]" size={64} align="left" />
            </Pos>
          </AbsoluteFill>
        );
      }}
    </Shot>
  );
};

const S5Naive: React.FC<{ f: number }> = ({ f }) => {
  const a = c("youthink");
  return (
    <Shot f={f} a={a} b={c("years")}>
      {(lf) => {
        const rw = c("dontwork") - a;
        const build = lin(lf, 40, 70) * 5;
        const rewind = lin(lf, rw, rw + 24);
        const stage = Math.max(0, build * (1 - rewind));
        const glitch = rewind > 0 && rewind < 1;
        return (
          <AbsoluteFill style={{ filter: glitch ? `hue-rotate(${Math.sin(lf) * 30}deg) contrast(1.3)` : undefined }}>
            <Backdrop f={lf} warm={0.14} />
            <Stage cam={{ pos: [140, 110, 220], target: [0, 10, 0], fov: 32 }}>
              <Fab stage={stage} f={lf} />
            </Stage>
            {glitch ? (
              <AbsoluteFill style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 6px)", transform: `translateX(${Math.sin(lf * 3) * 20}px)` }} />
            ) : null}
            <Pos x={80} y={70}>
              <Kinetic f={lf} at={6} text="Just build more [factories?]" size={84} align="left" out={rw - 4} />
            </Pos>
            {lf > 40 && lf < rw ? (
              <Pos x={1500} y={80}>
                <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, color: P.amber }}>▶▶ ×100</div>
              </Pos>
            ) : null}
            {glitch ? (
              <Pos x={1500} y={80}>
                <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, color: P.coral }}>◀◀ REWIND</div>
              </Pos>
            ) : null}
            <Center y={760}>
              <Stamp f={lf} at={rw + 18} size={84}>
                DOESN'T WORK LIKE THAT
              </Stamp>
            </Center>
          </AbsoluteFill>
        );
      }}
    </Shot>
  );
};

const S5Build: React.FC<{ f: number }> = ({ f }) => {
  const a = c("years");
  return (
    <Shot f={f} a={a} b={c("evenafter")}>
      {(lf, d) => {
        const stage = E.io(lf, 0, d) * 4.2;
        const bil = c("billions") - a;
        const ang = path(lf, [[0, 0.9], [d, 0.3]]);
        return (
          <AbsoluteFill>
            <AbsoluteFill style={{ background: "linear-gradient(180deg, #1b1210 0%, #3a1c10 45%, #0b0c0e 46%, #0b0c0e 100%)" }} />
            <Stage cam={{ pos: [Math.sin(ang) * 260, 90, Math.cos(ang) * 260], target: [0, 12, 0], fov: 32 }} keyPos={[-60, 30, 40]} kick={P.amber}>
              <Fab stage={stage} f={lf} />
            </Stage>
            <Pos x={80} y={70}>
              <Kinetic f={lf} at={6} text="A memory fab takes [years]" size={84} align="left" />
            </Pos>
            <Pos x={80} y={200}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: "rgba(244,242,238,0.7)", letterSpacing: 4 }}>
                {["SITE PREP", "FOUNDATIONS", "STEEL FRAME", "CLEANROOM SHELL", "UTILITIES + TOOLS"][Math.min(4, Math.floor(stage))]}
              </div>
              <div style={{ width: 420, height: 6, background: "rgba(255,255,255,0.1)", marginTop: 10 }}>
                <div style={{ width: (420 * stage) / 5, height: 6, background: P.amber }} />
              </div>
            </Pos>
            {lf >= bil - 10 ? (
              <Pos x={1400} y={300}>
                {Array.from({ length: 8 }, (_, i) => (
                  <div key={i} style={{ width: 300, height: 34, marginBottom: 6, borderRadius: 4, background: `linear-gradient(90deg, ${P.amber}, ${P.orange})`, opacity: E.out(lf, bil - 10 + (7 - i) * 3, bil + (7 - i) * 3), transform: `translateY(${(1 - E.out(lf, bil - 10 + (7 - i) * 3, bil + (7 - i) * 3)) * -60}px)`, boxShadow: `0 0 20px ${P.orange}55` }} />
                ))}
                <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 56, color: P.white, marginTop: 14 }}>BILLIONS OF DOLLARS</div>
              </Pos>
            ) : null}
          </AbsoluteFill>
        );
      }}
    </Shot>
  );
};

const S5Clean: React.FC<{ f: number }> = ({ f }) => {
  const a = c("evenafter");
  return (
    <Shot f={f} a={a} b={c("deloitte")}>
      {(lf, d) => {
        const steps: [string, number][] = [
          ["INSTALL", c("install") - a],
          ["QUALIFY", c("qualify") - a],
          ["YIELD", c("yields") - a],
          ["OUTPUT", c("output") - a],
        ];
        const ramp = E.io(lf, steps[0][1], d);
        const robot = Math.sin(lf * 0.05);
        return (
          <AbsoluteFill>
            <AbsoluteFill style={{ background: "linear-gradient(180deg, #2a220e, #120f08)" }} />
            <Stage cam={{ pos: [path(lf, [[0, -60], [d, 20]]), 34, 95], target: [0, 14, 0], fov: 34 }} kick={P.amber} rim="#fff1c4" env={0.7}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[400, 200]} />
                <meshStandardMaterial color="#d8d4c8" metalness={0.2} roughness={0.35} />
              </mesh>
              <Litho p={[-10, 0, -10]} beam={1} f={lf} />
              <Arm p={[26, 0, 12]} s={0.8} a={0.8 + robot * 0.6} b={0.5} c={-1.2 + robot * 0.2} grip={<Foup p={[0, 0.5, 0]} s={0.6} />} />
              <Foup p={[40, 0, 4]} s={1.4} />
              <Foup p={[46, 0, 4]} s={1.4} />
            </Stage>
            <AbsoluteFill style={{ background: "rgba(255,200,80,0.06)", mixBlendMode: "screen" }} />
            <Pos x={80} y={70}>
              <Kinetic f={lf} at={4} text="Then a [slow] ramp-up" size={80} align="left" />
            </Pos>
            <Pos x={1220} y={300}>
              <div style={{ padding: 30, borderRadius: 18, background: "rgba(11,12,14,0.8)", border: "1px solid rgba(255,255,255,0.08)", width: 600 }}>
                {steps.map(([t, at], i) => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 12, opacity: 0.3 + 0.7 * E.out(lf, at, at + 10) }}>
                    <div style={{ width: 44, height: 44, borderRadius: 22, background: lf >= at ? P.amber : "transparent", border: `2px solid ${P.amber}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, color: "#140e05" }}>{i + 1}</div>
                    <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 48, color: P.white }}>{t}</div>
                  </div>
                ))}
                <svg width={540} height={160} style={{ marginTop: 10 }}>
                  <path d={Array.from({ length: 50 }, (_, i) => `${i ? "L" : "M"}${(i / 49) * 540},${150 - 140 / (1 + Math.exp(-((i / 49) * 10 - 5)))}`).join(" ")} fill="none" stroke={P.amber} strokeWidth={5} strokeDasharray={1200} strokeDashoffset={1200 * (1 - ramp)} />
                  <text x={0} y={18} fill="rgba(244,242,238,0.6)" fontFamily={MONO} fontSize={18}>OUTPUT (ILLUSTRATIVE)</text>
                </svg>
              </div>
            </Pos>
          </AbsoluteFill>
        );
      }}
    </Shot>
  );
};

const S5Timeline: React.FC<{ f: number }> = ({ f }) => {
  const a = c("deloitte");
  return (
    <Shot f={f} a={a} b={c("micron")}>
      {(lf, d) => {
        const years = ["2026", "2027", "2028", "2029", "2030"];
        const prog = E.io(lf, 6, d - 30) * 4.999;
        const yi = Math.floor(prog);
        const hot = c("d2029") - a;
        return (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.12} y={40} />
            <Stage cam={{ pos: [200, 120, 240], target: [0, 10, 0], fov: 30 }} light={0.7 + 0.3 * (yi / 4)}>
              <Fab stage={1 + prog * 0.99 + (yi === 4 ? 0.5 : 0)} f={lf} />
            </Stage>
            <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.85) 0%, transparent 45%)" }} />
            <div style={{ position: "absolute", left: 160, right: 160, top: 860, height: 4, background: "rgba(244,242,238,0.2)" }}>
              <div style={{ width: `${(prog / 4.999) * 100}%`, height: 4, background: P.orange }} />
            </div>
            {years.map((y, i) => {
              const on = yi >= i;
              const isHot = i >= 3 && lf >= hot;
              return (
                <div key={y} style={{ position: "absolute", left: 160 + i * 400 - 100, top: 880, width: 200, textAlign: "center" }}>
                  <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: isHot ? 96 : 72, color: isHot ? P.orange : on ? P.white : "rgba(244,242,238,0.3)", textShadow: isHot ? `0 0 40px ${P.orange}` : "none" }}>{y}</div>
                </div>
              );
            })}
            {lf >= hot ? (
              <div style={{ position: "absolute", left: 160 + 3 * 400 - 120, top: 790, width: 640, height: 60, borderRadius: "16px 16px 0 0", border: `3px solid ${P.orange}`, borderBottom: "none", opacity: E.out(lf, hot, hot + 14) }}>
                <div style={{ position: "absolute", top: -54, left: 0, right: 0, textAlign: "center", fontFamily: HEAD, fontWeight: 800, fontSize: 40, color: P.orange }}>SIGNIFICANT NEW SUPPLY?</div>
              </div>
            ) : null}
            <Pos x={80} y={70}>
              <Kinetic f={lf} at={4} text="New capacity: [2029 or 2030]" size={80} align="left" />
            </Pos>
            <Source f={lf} at={20} y={1010}>DELOITTE INSIGHTS, 2026 ANALYSIS</Source>
          </AbsoluteFill>
        );
      }}
    </Shot>
  );
};

/* New York State outline (us-atlas, Albers USA). */
const topo = usStates as unknown as Topology<{ states: GeometryCollection<{ name: string }> }>;
const STATES = feature(topo, topo.objects.states);
const NY = STATES.features.filter((s) => s.properties?.name === "New York");
const PROJ = geoAlbersUsa().fitExtent([[-900, -500], [3400, 2300]], { type: "FeatureCollection", features: NY } as never);
const GP = geoPath(PROJ);
const STATE_D = STATES.features.map((s) => ({ name: s.properties?.name ?? "", d: GP(s) ?? "" }));
const CLAY = PROJ([-76.17, 43.18]) ?? [960, 540];

const S5Micron: React.FC<{ f: number }> = ({ f }) => {
  const a = c("micron");
  return (
    <Shot f={f} a={a} b={c("beclear")}>
      {(lf, d) => {
        const pin = c("newyork") - a;
        const z = 1 + E.io(lf, 0, d) * 0.15;
        const flag = c("m2030") - a;
        return (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.08} />
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, transform: `scale(${z})`, transformOrigin: `${CLAY[0]}px ${CLAY[1]}px` }}>
              {STATE_D.map((s) => (
                <path key={s.name} d={s.d} fill={s.name === "New York" ? "rgba(255,122,47,0.16)" : "rgba(160,170,185,0.05)"} stroke={s.name === "New York" ? P.orange : "rgba(160,170,185,0.25)"} strokeWidth={s.name === "New York" ? 3 : 1} />
              ))}
              {lf >= pin ? (
                <g transform={`translate(${CLAY[0]},${CLAY[1]})`}>
                  <circle r={10 + (((lf - pin) % 40) / 40) * 50} fill="none" stroke={P.orange} strokeWidth={3} opacity={1 - ((lf - pin) % 40) / 40} />
                  <circle r={12 * E.back(lf, pin, pin + 12)} fill={P.orange} />
                </g>
              ) : null}
            </svg>
            {lf >= pin ? (
              <Pos x={CLAY[0] + 60} y={CLAY[1] - 120}>
                <div style={{ opacity: E.out(lf, pin + 6, pin + 20) }}>
                  <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 70, color: P.white }}>MICRON · NEW YORK</div>
                  <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: P.orange, letterSpacing: 3 }}>PLANNED MEMORY FAB (CLAY, NY)</div>
                </div>
              </Pos>
            ) : null}
            {lf >= flag ? (
              <Pos x={CLAY[0] + 60} y={CLAY[1] + 30}>
                <div style={{ padding: "16px 26px", borderRadius: 12, background: "rgba(11,12,14,0.88)", border: `3px solid ${P.orange}`, opacity: E.out(lf, flag, flag + 14), transform: `scale(${E.back(lf, flag, flag + 16)})`, transformOrigin: "0 0" }}>
                  <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, color: "rgba(244,242,238,0.7)", letterSpacing: 3 }}>INITIAL WAFER OUTPUT EXPECTED</div>
                  <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 110, color: P.orange, lineHeight: 1 }}>2030</div>
                  <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, color: P.white, letterSpacing: 2 }}>⚑ POTENTIAL MAJOR CAPACITY MILESTONE</div>
                </div>
              </Pos>
            ) : null}
            <Source f={lf} at={20}>MICRON TECHNOLOGY, FY2026 ANNUAL REPORT (10-K)</Source>
          </AbsoluteFill>
        );
      }}
    </Shot>
  );
};

const S5Clear: React.FC<{ f: number }> = ({ f }) => {
  const a = c("beclear");
  return (
    <>
      <Shot f={f} a={a} b={c("cycles")}>
        {(lf) => {
          const strike = E.io(lf, c("noimprove") - a - 6, c("noimprove") - a + 14);
          return (
            <AbsoluteFill>
              <Backdrop f={lf} warm={0.08} />
              <Center y={330}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 120, color: strike > 0.5 ? "rgba(244,242,238,0.4)" : P.white, opacity: E.out(lf, 4, 18) }}>"RAM EXPENSIVE UNTIL 2030"</div>
                  <div style={{ position: "absolute", left: -10, top: "52%", height: 10, width: `${strike * 104}%`, background: P.white, boxShadow: "0 0 20px #fff" }} />
                </div>
              </Center>
              <Center y={560}>
                <Stamp f={lf} at={c("noimprove") - a + 16} color={P.orange} rot={-3} size={96}>
                  NOT A GUARANTEED DATE
                </Stamp>
              </Center>
            </AbsoluteFill>
          );
        }}
      </Shot>
      <Shot f={f} a={c("cycles")} b={c("concern")}>
        {(lf) => {
          const a2 = c("cycles");
          const draw = E.io(lf, 0, 70);
          const W = 1500;
          const pts = Array.from({ length: 120 }, (_, i) => {
            const x = (i / 119) * W;
            const y = 260 - Math.sin((i / 119) * Math.PI * 3.2 + 0.4) * 140 * (1 - (i / 119) * 0.35);
            return [x, y];
          });
          const di = Math.floor(draw * 119);
          const marks: [string, number, number][] = [
            ["RISE", c("rise") - a2, 18],
            ["FALL", c("fall") - a2, 50],
            ["STABILIZE", c("stabilize") - a2 + 6, 104],
          ];
          return (
            <AbsoluteFill>
              <Backdrop f={lf} warm={0.1} />
              <Pos x={80} y={70}>
                <Kinetic f={lf} at={4} text="Memory moves in [cycles]" size={84} align="left" />
                <div style={{ marginTop: 12 }}>
                  <Tag f={lf} at={12}>ILLUSTRATIVE PRICE CYCLE</Tag>
                </div>
              </Pos>
              <Pos x={210} y={360}>
                <svg width={W} height={520}>
                  <line x1={0} x2={W} y1={260} y2={260} stroke="rgba(255,255,255,0.12)" strokeDasharray="6 8" />
                  <path d={pts.slice(0, di + 1).map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ")} fill="none" stroke={P.orange} strokeWidth={7} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 12px ${P.orange})` }} />
                  <circle cx={pts[di][0]} cy={pts[di][1]} r={14} fill="#fff" />
                  {marks.map(([t, at, idx]) => (
                    <g key={t} opacity={E.out(lf, at, at + 10)}>
                      <circle cx={pts[idx][0]} cy={pts[idx][1]} r={10} fill={P.white} />
                      <text x={pts[idx][0]} y={pts[idx][1] - 34} fill={P.white} fontFamily={HEAD} fontWeight={800} fontSize={52} textAnchor="middle">
                        {t}
                      </text>
                    </g>
                  ))}
                </svg>
              </Pos>
            </AbsoluteFill>
          );
        }}
      </Shot>
    </>
  );
};

const S5Diverge: React.FC<{ f: number }> = ({ f }) => (
  <Shot f={f} a={c("concern")} b={c("ch5")} fout={12}>
    {(lf, d) => (
      <AbsoluteFill>
        <Backdrop f={lf} warm={0.1} />
        <Pos x={80} y={70}>
          <Kinetic f={lf} at={4} text="The real worry: [AI demand] outruns supply" size={70} align="left" />
          <div style={{ marginTop: 12 }}>
            <Tag f={lf} at={12}>ILLUSTRATIVE</Tag>
          </div>
        </Pos>
        <Pos x={200} y={280}>
          <LineChart
            f={lf}
            at={0}
            w={1480}
            h={640}
            xLabels={["2026", "2027", "2028", "2029", "2030"]}
            series={[
              { vals: [0.3, 0.45, 0.6, 0.76, 0.92], color: P.orange, label: "AI DEMAND", at: 8, len: 70 },
              { vals: [0.28, 0.33, 0.38, 0.44, 0.55], color: P.white, label: "CONSUMER SUPPLY", at: 18, len: 70 },
            ]}
            shadeBetween={[0, 1]}
            shadeLabel="UNPREDICTABLE PRICES · LIMITED AVAILABILITY"
            shadeAt={c("unpredict") - c("concern")}
          />
        </Pos>
        <Pos x={1520} y={250}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, color: P.orange, opacity: E.out(lf, 60, 76) }}>⚑ 2030 · CAPACITY MILESTONE?</div>
        </Pos>
        <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${lin(lf, d - 20, d)})` }} />
      </AbsoluteFill>
    )}
  </Shot>
);

export const Scene5: React.FC<{ f: number }> = ({ f }) => {
  if (f < c("ch4") - 2 || f >= c("ch5") + 14) return null;
  return (
    <>
      <S5Card f={f} />
      <S5Naive f={f} />
      <S5Build f={f} />
      <S5Clean f={f} />
      <S5Timeline f={f} />
      <S5Micron f={f} />
      <S5Clear f={f} />
      <S5Diverge f={f} />
    </>
  );
};

/* ===================================================================== SCENE 6 */
type PartK = "cpu" | "gpu" | "mobo" | "ram" | "ssd" | "psu" | "aio";
const RING: { k: PartK; name: string; ang: number; cue?: string }[] = [
  { k: "gpu", name: "GRAPHICS CARD", ang: 0, cue: "gpu" },
  { k: "cpu", name: "CPU", ang: 0.9, cue: "cpu" },
  { k: "mobo", name: "MOTHERBOARD", ang: 1.8 },
  { k: "ram", name: "32GB DDR5", ang: 2.7, cue: "ram32" },
  { k: "ssd", name: "NVMe SSD", ang: 3.6, cue: "ssd" },
  { k: "psu", name: "POWER SUPPLY", ang: 4.5 },
  { k: "aio", name: "LIQUID COOLER", ang: 5.4 },
];
const PartNode: React.FC<{ k: PartK; lf: number }> = ({ k, lf }) => {
  switch (k) {
    case "gpu":
      return <FeCard cls="90" s={0.55} r={[1.0, lf * 0.01, 0.2]} light={1} spin={lf * 0.2} />;
    case "cpu":
      return <Cpu s={2.4} r={[0.8, lf * 0.012, 0]} />;
    case "mobo":
      return <Mobo s={0.5} r={[1.1, lf * 0.008, 0]} />;
    case "ram":
      return (
        <group rotation={[0, lf * 0.012, 0]}>
          <Dimm s={0.9} p={[-0.6, -1.4, 0]} rgb={1} phase={lf * 0.1} />
          <Dimm s={0.9} p={[0.6, -1.4, 0]} rgb={1} phase={lf * 0.1 + 1} />
        </group>
      );
    case "ssd":
      return <Ssd s={1.3} r={[0.9, lf * 0.012, 0]} />;
    case "psu":
      return <Psu s={0.5} r={[0.5, lf * 0.01, 0]} spin={lf * 0.2} />;
    case "aio":
      return <Aio s={0.35} r={[1.0, lf * 0.01, 0]} spin={lf * 0.3} />;
  }
};
const ringPos = (ang: number, lf: number, R = 34): V3 => [Math.sin(ang + lf * 0.003) * R, 8 + Math.sin(lf * 0.03 + ang * 2) * 1.2, Math.cos(ang + lf * 0.003) * R];

const S6Card: React.FC<{ f: number }> = ({ f }) => (
  <Shot f={f} a={c("ch5")} b={c("planning")} fin={10}>
    {(lf, d) => <ChapterCard f={lf} n={5} title="What Does This Mean for PC Gamers?" variant={3} len={d + 8} />}
  </Shot>
);

const S6Ring: React.FC<{ f: number }> = ({ f }) => {
  const a = c("planning");
  return (
    <Shot f={f} a={a} b={c("whathappens")}>
      {(lf) => {
        const most = c("mostexp") - a;
        const share = E.io(lf, most, most + 30);
        return (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.18} y={50} />
            <Stage cam={{ pos: [Math.sin(lf * 0.004) * 30, 46, 92], target: [0, 6, 0], fov: 34 }}>
              <Floor r={300} y={-6} />
              {RING.map((r) => {
                const hl = r.cue ? E.out(lf, c(r.cue) - a - 4, c(r.cue) - a + 10) * (1 - lin(lf, c(r.cue) - a + 50, c(r.cue) - a + 70)) : 0;
                const p = ringPos(r.ang, lf);
                return (
                  <group key={r.k} position={[p[0], p[1] + hl * 3, p[2]]} scale={1 + hl * 0.25}>
                    <PartNode k={r.k} lf={lf} />
                    <Glow p={[0, 0, 0]} s={18} color={P.orange} o={0.15 + hl * 0.4} />
                  </group>
                );
              })}
            </Stage>
            {RING.filter((r) => r.cue).map((r) => {
              const at = c(r.cue!) - a;
              return lf >= at && lf < at + 70 ? (
                <Center key={r.k} y={110}>
                  <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 92, color: P.white, opacity: E.out(lf, at, at + 10) * (1 - lin(lf, at + 55, at + 70)) }}>{r.name}</div>
                </Center>
              ) : null;
            })}
            {share > 0 ? (
              <Pos x={360} y={900} w={1200}>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, color: "rgba(244,242,238,0.7)", letterSpacing: 3, marginBottom: 8, opacity: share }}>SHARE OF A TYPICAL GAMING BUILD · ILLUSTRATIVE</div>
                <div style={{ display: "flex", height: 46, borderRadius: 8, overflow: "hidden", opacity: share }}>
                  {[
                    ["GPU", 0.42, P.orange],
                    ["CPU", 0.17, "#c9ccd1"],
                    ["BOARD", 0.12, "#8b9099"],
                    ["RAM", 0.1, P.coral],
                    ["SSD", 0.07, "#6b7079"],
                    ["PSU+COOLING", 0.12, "#4a4e55"],
                  ].map(([t, w, col]) => (
                    <div key={t as string} style={{ width: `${(w as number) * 100 * share}%`, background: col as string, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 800, fontSize: 18, color: "#111" }}>
                      {t as string}
                    </div>
                  ))}
                </div>
              </Pos>
            ) : null}
          </AbsoluteFill>
        );
      }}
    </Shot>
  );
};

const S6Rise: React.FC<{ f: number }> = ({ f }) => {
  const a = c("whathappens");
  return (
    <Shot f={f} a={a} b={c("worst")}>
      {(lf) => {
        const up = (k: PartK) => {
          const at = k === "gpu" ? 6 : k === "ram" ? c("ramup") - a : c("others") - a + RING.findIndex((r) => r.k === k) * 4;
          return E.out(lf, at, at + 30);
        };
        const total = (RING.reduce((s, r) => s + up(r.k) * (r.k === "gpu" ? 3 : r.k === "ram" ? 2 : 1), 0) / 10) * 100;
        const ent = c("entire") - a;
        return (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.14 + total / 600} />
            <Stage cam={{ pos: [Math.sin(lf * 0.004 + 0.4) * 30, 50, 96], target: [0, 8, 0], fov: 34 }}>
              <Floor r={300} y={-6} />
              {RING.map((r) => {
                const p = ringPos(r.ang, lf + 300);
                return (
                  <group key={r.k} position={p}>
                    <PartNode k={r.k} lf={lf + 300} />
                    <Glow p={[0, 0, 0]} s={18} color={P.coral} o={0.4 * up(r.k)} />
                  </group>
                );
              })}
            </Stage>
            {/* price tags (index) */}
            {RING.map((r, i) => {
              const u = up(r.k);
              if (u <= 0) return null;
              return (
                <Pos key={r.k} x={60 + (i % 4) * 230} y={130 + Math.floor(i / 4) * 80}>
                  <div style={{ display: "inline-flex", gap: 10, alignItems: "center", padding: "6px 14px", borderRadius: 8, background: "rgba(11,12,14,0.85)", border: `2px solid ${P.coral}`, opacity: Math.min(1, u * 2) }}>
                    <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 20, color: P.white }}>{r.k.toUpperCase()}</span>
                    <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, color: P.coral }}>▲</span>
                  </div>
                </Pos>
              );
            })}
            <Pos x={60} y={60}>
              <Tag f={lf} at={4}>ILLUSTRATIVE · NO REAL PRICES</Tag>
            </Pos>
            {/* gamer silhouette watching the total */}
            <Pos x={1210} y={600}>
              <div style={{ width: 640, height: 400, position: "relative" }}>
                <div style={{ position: "absolute", left: 120, top: 0, width: 500, height: 290, borderRadius: 12, background: "#0c0d10", border: "3px solid #2a2e35", boxShadow: `0 0 80px ${P.coral}55` }}>
                  <div style={{ padding: 26 }}>
                    <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, color: "rgba(244,242,238,0.6)", letterSpacing: 3 }}>BUILD TOTAL (INDEX)</div>
                    <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 96, color: total > 40 ? P.coral : P.white, fontVariantNumeric: "tabular-nums" }}>{Math.round(100 + total)}</div>
                    <div style={{ width: 440, height: 14, background: "rgba(255,255,255,0.08)", borderRadius: 7 }}>
                      <div style={{ width: `${Math.min(100, 50 + total / 2)}%`, height: 14, background: `linear-gradient(90deg, ${P.orange}, ${P.coral})`, borderRadius: 7 }} />
                    </div>
                  </div>
                </div>
                <svg width={300} height={300} style={{ position: "absolute", left: -60, top: 120 }}>
                  <circle cx={150} cy={95} r={62} fill="#050506" />
                  <path d="M20 300 Q30 175 150 168 Q270 175 280 300 Z" fill="#050506" />
                  <path d="M206 60 Q215 95 206 130" stroke={P.coral} strokeOpacity={0.6} strokeWidth={4} fill="none" />
                </svg>
              </div>
            </Pos>
            <Center y={840}>
              <Kinetic f={lf} at={ent} text="Your [entire build] costs more" size={84} />
            </Center>
          </AbsoluteFill>
        );
      }}
    </Shot>
  );
};

const S6Receipts: React.FC<{ f: number }> = ({ f }) => {
  const a = c("worst");
  return (
    <Shot f={f} a={a} b={c("upgrade")}>
      {(lf) => {
        const items = ["Processor", "Graphics card", "Motherboard", "32GB DDR5", "1TB NVMe SSD", "Power supply", "Liquid cooler"];
        const same = c("same") - a;
        const R: React.FC<{ title: string; x: number; at: number; longer: number; color: string }> = ({ title, x, at, longer, color }) => (
          <Pos x={x} y={140} w={600}>
            <div style={{ background: "#ecebe6", borderRadius: 6, padding: "34px 40px", boxShadow: "0 40px 90px rgba(0,0,0,0.6)", transform: `translateY(${(1 - E.out(lf, at, at + 20)) * 600}px) rotate(${x < 900 ? -2 : 2}deg)`, fontFamily: MONO, color: "#1b1b1b" }}>
              <div style={{ fontWeight: 800, fontSize: 30, letterSpacing: 4, textAlign: "center" }}>{title}</div>
              <div style={{ borderTop: "2px dashed #888", margin: "18px 0" }} />
              {items.map((t) => (
                <div key={t} style={{ fontSize: 26, padding: "6px 0", display: "flex", justifyContent: "space-between" }}>
                  <span>{t}</span>
                  <span>✓</span>
                </div>
              ))}
              <div style={{ borderTop: "2px dashed #888", margin: "18px 0" }} />
              <div style={{ fontWeight: 800, fontSize: 26 }}>TOTAL</div>
              <div style={{ height: 30, width: `${60 + longer * 40 * E.out(lf, at + 20, at + 50)}%`, background: color, marginTop: 8 }} />
              <div style={{ fontWeight: 800, fontSize: 24, marginTop: 18 }}>PERFORMANCE</div>
              <div style={{ height: 30, width: "70%", background: "#555", marginTop: 8 }} />
            </div>
          </Pos>
        );
        return (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.12} />
            <R title="MONTHS EARLIER" x={230} at={0} longer={0} color="#555" />
            <R title="TODAY" x={1090} at={10} longer={1} color={P.coral} />
            <Center y={40}>
              <Kinetic f={lf} at={same} text="Same hardware. [Higher] total." size={74} />
            </Center>
            <Pos x={880} y={760}>
              <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 120, color: P.orange, opacity: E.out(lf, same + 20, same + 34) }}>=</div>
            </Pos>
            <Pos x={60} y={1000}>
              <Tag f={lf} at={6}>ILLUSTRATIVE</Tag>
            </Pos>
          </AbsoluteFill>
        );
      }}
    </Shot>
  );
};

const S6Paths: React.FC<{ f: number }> = ({ f }) => {
  const a = c("upgrade");
  return (
    <Shot f={f} a={a} b={c("possib")}>
      {(lf) => {
        const k1 = c("keep") - a;
        const k2 = c("lowercap") - a;
        const k3 = c("consoles2") - a - 30;
        const pp = c("postpone") - a;
        const cx = path(lf, [[0, 0], [k1, 0], [k1 + 30, -46], [k2 - 10, -46], [k2 + 20, 0], [k3 - 10, 0], [k3 + 20, 46], [pp, 46], [pp + 30, 0]]);
        const cz = path(lf, [[0, 120], [k1 + 30, 40], [pp, 40], [pp + 30, 150]]);
        const lab: [string, string, number, number][] = [
          ["① UPGRADE LESS", "KEEP THE CURRENT PC ANOTHER YEAR", k1, 0],
          ["② OLDER / LOWER-SPEC", "LESS RAM · OLDER GPUs · REFURBISHED", k2, 1],
          ["③ CONSOLES", "OR OTHER ALTERNATIVES", k3, 2],
        ];
        return (
          <AbsoluteFill>
            <AbsoluteFill style={{ background: "linear-gradient(180deg, #050506, #0d0b0a)" }} />
            <Stage cam={{ pos: [cx, 26, cz], target: [cx * 1.1, 6, cz - 80], fov: 40 }} fog={0.006}>
              <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[600, 600]} />
                <meshStandardMaterial color="#09090a" metalness={0.5} roughness={0.5} />
              </mesh>
              {[-1, 0, 1].map((s) => (
                <mesh key={s} position={[s * 23, 0.05, 0]} rotation={[-Math.PI / 2, 0, -s * 0.48]}>
                  <planeGeometry args={[7, 180]} />
                  <meshStandardMaterial color="#110a06" emissive={s === 0 ? P.orange : s < 0 ? P.amber : P.coral} emissiveIntensity={0.7} />
                </mesh>
              ))}
              <Tower p={[-46, 0, -60]} s={0.5} power={0.6} spin={lf * 0.2} />
              <group position={[0, 2, -64]}>
                <RtxCard p={[0, 3, 0]} s={0.5} r={[0.6, lf * 0.01, 0]} accent="#888" spin={lf * 0.1} />
                <Dimm p={[0, 10, 4]} s={1.2} r={[0, lf * 0.01, 0]} />
              </group>
              <Console p={[46, 0, -60]} s={0.7} r={[0, -0.4, 0]} />
            </Stage>
            {lab.map(([t, s, at, i]) =>
              lf >= at && lf < at + 150 ? (
                <Pos key={t} x={80} y={80}>
                  <div style={{ opacity: E.out(lf, at, at + 12) * (1 - lin(lf, at + 130, at + 150)) }}>
                    <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 92, color: [P.amber, P.orange, P.coral][i] }}>{t}</div>
                    <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: P.white, letterSpacing: 3 }}>{s}</div>
                  </div>
                </Pos>
              ) : null,
            )}
            {lf < k1 ? (
              <Center y={100}>
                <Kinetic f={lf} at={4} text="Three [paths] for gamers" size={96} />
              </Center>
            ) : null}
            <Center y={760}>
              <Stamp f={lf} at={pp + 10} color={P.white} rot={-4} size={70}>
                …OR JUST POSTPONE
              </Stamp>
            </Center>
          </AbsoluteFill>
        );
      }}
    </Shot>
  );
};

export const Scene6: React.FC<{ f: number }> = ({ f }) => {
  if (f < c("ch5") - 2 || f >= c("possib") + 14) return null;
  return (
    <>
      <S6Card f={f} />
      <S6Ring f={f} />
      <S6Rise f={f} />
      <S6Receipts f={f} />
      <S6Paths f={f} />
    </>
  );
};

/* ===================================================================== SCENE 7 */
const S7Alt: React.FC<{ f: number }> = ({ f }) => {
  const a = c("possib");
  return (
    <>
      <Shot f={f} a={a} b={c("however5")}>
        {(lf, d) => {
          const amd = c("amd") - a;
          const on = (k: number) => E.out(lf, amd + k * 12, amd + k * 12 + 20);
          const pods: [number, string, string, string][] = [
            [-40, "#ff3b3b", "AMD RADEON", "ALTERNATIVE GPUs"],
            [0, "#3b7bff", "INTEL ARC", "ALTERNATIVE GPUs"],
            [40, "#c9ccd1", "PREVIOUS-GEN", "OLDER PRODUCTS"],
          ];
          return (
            <AbsoluteFill>
              <Backdrop f={lf} warm={0.08} />
              <Stage cam={{ pos: [path(lf, [[0, -14], [d, 14]]), 34, 120], target: [0, 10, 0], fov: 32 }} light={0.8}>
                <Floor r={300} />
                {pods.map(([x, col], k) => (
                  <group key={x} position={[x, 0, 0]}>
                    <mesh position={[0, 2, 0]}>
                      <cylinderGeometry args={[12, 13, 4, 48]} />
                      <meshStandardMaterial color="#141518" metalness={0.8} roughness={0.3} emissive={col} emissiveIntensity={0.15 * on(k)} />
                    </mesh>
                    <spotLight position={[0, 60, 20]} angle={0.25} penumbra={0.6} intensity={2500 * on(k)} distance={160} color={col} />
                    <RtxCard p={[0, 12, 0]} s={0.75} r={[0.9, lf * 0.006 + k, 0]} accent={col} accentK={on(k)} spin={lf * 0.2} />
                  </group>
                ))}
                <FeCard cls="90" p={[0, 6, -50]} r={[1.1, 0, 0]} s={0.8} light={0.25} />
              </Stage>
              {pods.map(([, col, t, s], k) => (
                <Pos key={t} x={[460, 960, 1460][k] - 220} y={860} w={440} style={{ textAlign: "center", opacity: on(k) }}>
                  <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 56, color: P.white }}>{t}</div>
                  <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, color: col, letterSpacing: 3 }}>{s}</div>
                </Pos>
              ))}
              <Pos x={80} y={70}>
                <Kinetic f={lf} at={4} text="Another [possibility]" size={80} align="left" />
                <div style={{ fontFamily: MONO, fontSize: 22, color: "rgba(244,242,238,0.6)", letterSpacing: 3, marginTop: 8, opacity: E.out(lf, 20, 34) }}>GENERIC DESIGNS · NAMES FOR IDENTIFICATION ONLY</div>
              </Pos>
            </AbsoluteFill>
          );
        }}
      </Shot>
      <Shot f={f} a={c("however5")} b={c("ch6")} fout={12}>
        {(lf, d) => {
          const nodes: [string, number, number][] = [
            ["MEMORY", 960, 520],
            ["GPUs", 560, 300],
            ["CPUs", 1360, 300],
            ["SSDs", 470, 700],
            ["CONSOLES", 1450, 720],
            ["LAPTOPS", 960, 880],
            ["PHONES", 960, 190],
            ["BOARDS", 300, 500],
            ["SERVERS", 1620, 500],
          ];
          const tug = c("magic") - c("however5");
          const pull = Math.sin(lin(lf, tug, tug + 40) * Math.PI) * 40;
          const ic = c("intercon") - c("however5");
          const pos = (i: number): [number, number] => {
            const [, x, y] = nodes[i];
            if (i === 0) return [x, y + pull];
            const dx = nodes[0][1] - x;
            const dy = nodes[0][2] + pull - y;
            const k = 0.12 * Math.max(0, Math.sin(lin(lf, tug + 4, tug + 50) * Math.PI));
            return [x + dx * k, y + dy * k];
          };
          return (
            <AbsoluteFill>
              <Backdrop f={lf} warm={0.1} />
              <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
                {nodes.map((_, i) =>
                  nodes.map((__, j) =>
                    j > i && (i === 0 || (j - i) % 3 === 1) ? (
                      <line key={`${i}-${j}`} x1={pos(i)[0]} y1={pos(i)[1]} x2={pos(j)[0]} y2={pos(j)[1]} stroke={i === 0 ? P.orange : "rgba(244,242,238,0.25)"} strokeWidth={i === 0 ? 3 : 1.5} opacity={E.out(lf, 6 + j * 3, 20 + j * 3)} />
                    ) : null,
                  ),
                )}
                {nodes.map(([t], i) => (
                  <g key={t} transform={`translate(${pos(i)[0]},${pos(i)[1]})`} opacity={E.out(lf, i * 3, i * 3 + 14)}>
                    <circle r={i === 0 ? 46 : 26} fill={i === 0 ? P.orange : "#16181c"} stroke={i === 0 ? "#fff" : P.orange} strokeWidth={3} />
                    <text y={i === 0 ? 90 : 62} fill={P.white} fontFamily={HEAD} fontWeight={800} fontSize={i === 0 ? 46 : 34} textAnchor="middle">
                      {t}
                    </text>
                  </g>
                ))}
              </svg>
              <Pos x={80} y={70}>
                <Kinetic f={lf} at={4} text="Switching brands won't [magically] fix it" size={70} align="left" />
              </Pos>
              <Center y={960}>
                <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 64, letterSpacing: 10, color: P.orange, opacity: E.out(lf, ic, ic + 14) }}>INTERCONNECTED</div>
              </Center>
              <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${lin(lf, d - 16, d) * 0.9})` }} />
            </AbsoluteFill>
          );
        }}
      </Shot>
    </>
  );
};

const S7Dying: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Shot f={f} a={c("ch6")} b={c("dying")} fin={10}>
      {(lf, d) => <ChapterCard f={lf} n={6} title="Is PC Gaming Really in Trouble?" variant={0} len={d + 8} />}
    </Shot>
    <Shot f={f} a={c("dying")} b={c("evolving")} fin={0}>
      {(lf) => {
        const no = c("no") - c("dying");
        return (
          <AbsoluteFill>
            <AbsoluteFill style={{ background: "#050506" }} />
            <Center y={200}>
              <Kinetic f={lf} at={2} text="Is PC gaming dying?" size={110} weight={700} out={no - 2} />
            </Center>
            {lf >= no ? (
              <Center y={300}>
                <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 420, lineHeight: 1, color: P.orange, transform: `scale(${1.6 - 0.6 * E.out(lf, no, no + 10)})`, opacity: E.out(lf, no, no + 6), textShadow: `0 0 120px ${P.orange}88` }}>NO.</div>
              </Center>
            ) : null}
            <Flare x={960} y={520} k={lf >= no ? 1 - lin(lf, no, no + 20) : 0} />
          </AbsoluteFill>
        );
      }}
    </Shot>
  </>
);

const S7Future: React.FC<{ f: number }> = ({ f }) => {
  const a = c("evolving");
  return (
    <>
      <Shot f={f} a={a} b={c("economics")}>
        {(lf) => {
          const ph: [string, number][] = [
            ["NEW ARCHITECTURES", c("archs") - a],
            ["MORE MEMORY CAPACITY", c("expand") - a],
            ["COMPETITION", c("competition") - a],
          ];
          const lit = (k: number) => E.out(lf, ph[k][1], ph[k][1] + 14);
          return (
            <AbsoluteFill>
              <Backdrop f={lf} warm={0.18} />
              <Stage cam={{ pos: [0, 30, 120], target: [0, 4, 0], fov: 34 }}>
                <group position={[-44, 0, 0]} scale={lit(0)} rotation={[0.9, lf * 0.01, 0]}>
                  <mesh>
                    <boxGeometry args={[22, 1, 22]} />
                    <meshPhysicalMaterial color="#20242c" metalness={0.9} roughness={0.15} clearcoat={1} emissive={P.orange} emissiveIntensity={0.2 + 0.2 * Math.sin(lf * 0.1)} />
                  </mesh>
                </group>
                {Array.from({ length: 5 }, (_, i) => (
                  <group key={i} position={[0, -2 + i * 3 * lit(1), -i * 3]} scale={0.6 * lit(1)}>
                    <Wafer glow={0.2} r={[0.5, lf * 0.01 + i, 0]} />
                  </group>
                ))}
                {(["#ff3b3b", "#3b7bff", P.orange] as const).map((col, k) => (
                  <group key={col} position={[38 + k * 6, -10 + lit(2) * 20 + Math.sin(lf * 0.05 + k) * 3, 0]}>
                    <Glow p={[0, 0, 0]} s={14} color={col} o={lit(2)} />
                  </group>
                ))}
              </Stage>
              {ph.map(([t, at], k) => (
                <Pos key={t} x={[260, 760, 1300][k]} y={850} w={420} style={{ textAlign: "center", opacity: E.out(lf, at, at + 14) }}>
                  <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 50, color: P.white }}>{t}</div>
                </Pos>
              ))}
              <Pos x={80} y={70}>
                <Kinetic f={lf} at={4} text="Hardware will keep [evolving]" size={80} align="left" />
              </Pos>
            </AbsoluteFill>
          );
        }}
      </Shot>
      <Shot f={f} a={c("economics")} b={c("bigq")}>
        {(lf, d) => {
          const bend = c("competing") - c("economics");
          const pie = E.io(lf, bend - 20, bend + 10);
          return (
            <AbsoluteFill>
              <Backdrop f={lf} warm={0.12} />
              <AbsoluteFill style={{ opacity: 1 - pie }}>
                <Pos x={80} y={70}>
                  <Kinetic f={lf} at={4} text="The [expectation]" size={80} align="left" />
                  <div style={{ marginTop: 12 }}>
                    <Tag f={lf} at={12}>ILLUSTRATIVE</Tag>
                  </div>
                </Pos>
                <Pos x={200} y={300}>
                  <LineChart
                    f={lf}
                    at={0}
                    w={1500}
                    h={600}
                    xLabels={["GEN 1", "GEN 2", "GEN 3", "GEN 4", "GEN 5"]}
                    series={[
                      { vals: [0.2, 0.35, 0.5, 0.66, 0.82], color: P.white, label: "PERFORMANCE", at: 8, len: 60 },
                      { vals: [0.3, 0.31, 0.32, 0.33 + lin(lf, c("expectation") - c("economics"), c("expectation") - c("economics") + 40) * 0.2, 0.34 + lin(lf, c("expectation") - c("economics"), c("expectation") - c("economics") + 40) * 0.4], color: P.coral, label: "PRICE", at: 20, len: 60 },
                    ]}
                  />
                </Pos>
              </AbsoluteFill>
              {pie > 0 ? (
                <AbsoluteFill style={{ opacity: pie }}>
                  <Stage cam={{ pos: [0, 80, 70], target: [0, 0, 0], fov: 36 }}>
                    <Wafer glow={0.25} r={[0, lf * 0.004, 0]} />
                    {Array.from({ length: 6 }, (_, i) => {
                      const ang = (i / 6) * Math.PI * 2;
                      return <Arm key={i} p={[Math.cos(ang) * 34, -2, Math.sin(ang) * 34]} s={0.9} a={-ang + Math.PI} b={0.9 + Math.sin(lf * 0.06 + i) * 0.1} c={-1.6} />;
                    })}
                  </Stage>
                  <Pos x={80} y={70}>
                    <Kinetic f={lf} at={bend} text="Competing for the [same] factories" size={74} align="left" />
                  </Pos>
                  <Center y={900}>
                    <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, letterSpacing: 4, color: "rgba(244,242,238,0.75)" }}>
                      <span style={{ color: P.orange }}>■</span> AI COMPANIES ×6 &nbsp;&nbsp; <span style={{ color: P.white }}>🎮</span> GAMERS ×1
                    </div>
                  </Center>
                </AbsoluteFill>
              ) : null}
              <Bars k={0.4} />
              {d < 0 ? null : null}
            </AbsoluteFill>
          );
        }}
      </Shot>
    </>
  );
};

const S7Prism: React.FC<{ f: number }> = ({ f }) => {
  const a = c("bigq");
  return (
    <Shot f={f} a={a} b={c("rightnow")}>
      {(lf, d) => {
        const st = c("sametech") - a;
        const beams = E.io(lf, st, st + 30);
        return (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.06} />
            <Stage cam={{ pos: [path(lf, [[0, -20], [d, 20]]), 22, 120], target: [0, 18, 0], fov: 34 }} light={0.8}>
              <Floor r={300} />
              <mesh position={[30, 40, -40]}>
                <boxGeometry args={[30, 80, 30]} />
                <meshStandardMaterial color="#0d0f12" metalness={0.8} roughness={0.25} emissive={P.cool} emissiveIntensity={0.15 + beams * 0.25} />
              </mesh>
              <group position={[-30, 0, 10]}>
                <mesh position={[0, 3.5, 0]}>
                  <capsuleGeometry args={[1.2, 3.5, 6, 12]} />
                  <meshStandardMaterial color="#050506" />
                </mesh>
                <mesh position={[0, 7.4, 0]}>
                  <sphereGeometry args={[1.1, 16, 12]} />
                  <meshStandardMaterial color="#050506" />
                </mesh>
              </group>
              <group position={[0, 20, 20]} rotation={[0.6, lf * 0.01, 0.3]}>
                <mesh>
                  <boxGeometry args={[8, 0.8, 8]} />
                  <meshPhysicalMaterial color="#20242c" metalness={0.9} roughness={0.1} clearcoat={1} emissive={P.orange} emissiveIntensity={0.4} />
                </mesh>
              </group>
              <Glow p={[0, 20, 20]} s={30} color={P.white} o={0.3} />
            </Stage>
            <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
              <defs>
                <linearGradient id="bw" x1="0" x2="1">
                  <stop offset="0" stopColor={P.orange} stopOpacity={0} />
                  <stop offset="1" stopColor={P.orange} stopOpacity={0.9} />
                </linearGradient>
                <linearGradient id="bc" x1="1" x2="0">
                  <stop offset="0" stopColor={P.cool} stopOpacity={0} />
                  <stop offset="1" stopColor={P.cool} stopOpacity={0.9} />
                </linearGradient>
              </defs>
              <polygon points={`960,430 ${960 - 700 * beams},250 ${960 - 700 * beams},560`} fill="url(#bw)" opacity={0.35} />
              <polygon points={`960,430 ${960 + 700 * beams},250 ${960 + 700 * beams},560`} fill="url(#bc)" opacity={0.35} />
              {Array.from({ length: 26 }, (_, i) => {
                const x = 1300 + hash(i) * 520;
                const y = 220 + hash(i * 3) * 380;
                return <circle key={i} cx={x} cy={y} r={5} fill={P.cool} opacity={beams * (0.5 + 0.5 * Math.sin(lf * 0.2 + i))} />;
              })}
              {Array.from({ length: 30 }, (_, i) => {
                const a1 = Math.floor(hash(i * 7) * 26);
                const b1 = Math.floor(hash(i * 11) * 26);
                return <line key={i} x1={1300 + hash(a1) * 520} y1={220 + hash(a1 * 3) * 380} x2={1300 + hash(b1) * 520} y2={220 + hash(b1 * 3) * 380} stroke={P.cool} strokeWidth={1.2} opacity={beams * 0.4} />;
              })}
              <path d={`M80,${560} L260,380 L380,470 L520,320 L700,560 Z`} fill={P.orange} opacity={beams * 0.25} />
            </svg>
            <Pos x={120} y={600} style={{ opacity: beams }}>
              <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 54, color: P.orange }}>GAMES</div>
            </Pos>
            <Pos x={1500} y={640} style={{ opacity: beams }}>
              <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 54, color: P.cool }}>AI SYSTEMS</div>
            </Pos>
            <Pos x={80} y={70}>
              <Kinetic f={lf} at={c("lessimp") - a} text="Are gamers becoming [less important?]" size={72} align="left" />
            </Pos>
          </AbsoluteFill>
        );
      }}
    </Shot>
  );
};

const S7Recap: React.FC<{ f: number }> = ({ f }) => {
  const a = c("rightnow");
  return (
    <Shot f={f} a={a} b={c("soif")}>
      {(lf, d) => {
        const ps: [string, string, number][] = [
          ["RTX 50 SUPPLY REPORTS", "card", c("warn1") - a],
          ["RISING MEMORY PRICES", "dimm", c("warn2") - a],
          ["LONG CAPACITY TIMELINES", "fab", c("warn3") - a],
        ];
        return (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.1} />
            {ps.map(([t, k, at], i) => {
              const s = E.out(lf, at, at + 18);
              return (
                <AbsoluteFill key={t} style={{ left: 40 + i * 620, width: 600, top: 160, height: 700, opacity: s, transform: `translateY(${(1 - s) * 80}px)` }}>
                  <div style={{ position: "absolute", inset: 0, borderRadius: 22, overflow: "hidden", border: `2px solid ${P.amber}55`, background: "#101114" }}>
                    {lf >= at - 2 ? (
                      <div style={{ position: "absolute", left: -660, top: -190, width: 1920, height: 1080, transform: "scale(0.55)", transformOrigin: "960px 470px" }}>
                        <Stage cam={{ pos: [Math.sin((lf - at) * 0.01) * 50, 26, Math.cos((lf - at) * 0.01) * 50], target: [0, k === "fab" ? 4 : 2, 0], fov: k === "fab" ? 70 : 30 }}>
                          {k === "card" ? <FeCard cls="90" r={[1, 0, 0]} light={0.7} /> : k === "dimm" ? <Dimm rgb={1} phase={lf * 0.1} s={2} p={[0, -3, 0]} /> : <group scale={0.25}><Fab stage={3.5} f={lf} /></group>}
                        </Stage>
                      </div>
                    ) : null}
                  </div>
                  <div style={{ position: "absolute", left: 30, bottom: 30, right: 30 }}>
                    <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 24, color: P.amber, letterSpacing: 4 }}>⚠ WARNING SIGN {i + 1}</div>
                    <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 54, color: P.white, lineHeight: 1 }}>{t}</div>
                  </div>
                </AbsoluteFill>
              );
            })}
            <Center y={920}>
              <Kinetic f={lf} at={c("overnight") - a - 20} text="Not going away [overnight]" size={64} out={d - 8} />
            </Center>
          </AbsoluteFill>
        );
      }}
    </Shot>
  );
};

const S7Final: React.FC<{ f: number }> = ({ f }) => {
  const a = c("soif");
  return (
    <>
      <Shot f={f} a={a} b={c("balance")} fin={14}>
        {(lf, d) => {
          const lightUp = E.get("power2.inOut")(lin(lf, 0, d * 0.6));
          const bat = c("battle") - a;
          const split = E.io(lf, bat, bat + 40);
          const camZ = path(lf, [[0, 320], [d, 230]]);
          return (
            <AbsoluteFill>
              <AbsoluteFill style={{ background: `linear-gradient(90deg, rgba(255,140,60,${0.12 * lightUp}) 0%, #07080a 50%, rgba(140,180,255,${0.12 * split}) 100%)`, backgroundColor: "#07080a" }} />
              <Stage cam={{ pos: [path(lf, [[0, -60], [d, -20]]), 120, camZ], target: [0, 82, 0], fov: 32 }} light={0.1 + 0.9 * lightUp} rim={split > 0 ? P.cool : "#ffd9b0"} kick={P.orange}>
                <Floor r={600} />
                <Desk power={lightUp} spin={lf * 0.3} f={lf} screenColor={P.orange} />
                <Particles
                  n={160}
                  color="#ffe2c4"
                  k={0.8 * lightUp}
                  fn={(i) => ({ p: [(hash(i) - 0.5) * 220, 40 + hash(i * 3) * 120 + Math.sin(lf * 0.01 + i) * 3, (hash(i * 5) - 0.5) * 120], s: 0.25 })}
                />
              </Stage>
              {split > 0 ? <AbsoluteFill style={{ background: `linear-gradient(90deg, transparent ${50 - split * 2}%, rgba(255,255,255,${0.25 * split}) 50%, transparent ${50 + split * 2}%)`, mixBlendMode: "screen" }} /> : null}
              {lf >= bat ? (
                <>
                  <Pos x={100} y={120}>
                    <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 70, color: P.orange, opacity: split }}>CONSUMER TECH</div>
                  </Pos>
                  <Pos r={100} y={120} style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 70, color: P.cool, opacity: split }}>AI DEMAND</div>
                  </Pos>
                </>
              ) : (
                <Pos x={80} y={70}>
                  <Kinetic f={lf} at={c("notbecause") - a} text="Gaming isn't disappearing…" size={70} align="left" out={bat - 10} />
                </Pos>
              )}
              <Bars k={0.6} />
            </AbsoluteFill>
          );
        }}
      </Shot>
      <Shot f={f} a={c("balance")} b={c("whatthink")} fin={10} fout={6}>
        {(lf) => {
          const pay = c("paying") - c("balance") - 6;
          return (
            <AbsoluteFill>
              <AbsoluteFill style={{ background: "#050506" }} />
              {lf < pay ? (
                <Center y={400}>
                  <MetalType f={lf} at={4} size={150} sweepAt={14}>
                    The Future of PC Gaming
                  </MetalType>
                </Center>
              ) : (
                <Center y={380}>
                  <Kinetic f={lf} at={pay} text="Who will [pay] the [price?]" size={170} stagger={4} />
                </Center>
              )}
              <Flare x={960} y={480} k={lf >= pay ? 1 - lin(lf, pay, pay + 24) : 0} w={1900} />
            </AbsoluteFill>
          );
        }}
      </Shot>
      <Shot f={f} a={c("whatthink")} b={VO_FRAMES}>
        {(lf) => {
          const sub = c("subscribe") - c("whatthink");
          return (
            <AbsoluteFill>
              <Backdrop f={lf} warm={0.16} />
              <Center y={180}>
                <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 28, color: P.orange, letterSpacing: 8, opacity: E.out(lf, 0, 12) }}>WHAT DO YOU THINK?</div>
                <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 64, color: P.white, marginTop: 20, maxWidth: 1400, lineHeight: 1.2, opacity: E.out(lf, 8, 24) }}>Is AI making tech better for everyone — or making powerful hardware unaffordable?</div>
              </Center>
              <Center y={560}>
                <div style={{ display: "flex", gap: 40 }}>
                  {["🚀  BETTER FOR EVERYONE", "💸  UNAFFORDABLE"].map((t, i) => (
                    <div key={t} style={{ padding: "22px 44px", borderRadius: 16, border: `3px solid ${i ? P.coral : P.orange}`, fontFamily: HEAD, fontWeight: 800, fontSize: 52, color: P.white, background: "rgba(11,12,14,0.8)", transform: `scale(${E.back(lf, 40 + i * 8, 56 + i * 8)})` }}>
                      {t}
                    </div>
                  ))}
                </div>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, color: "rgba(244,242,238,0.75)", letterSpacing: 4, marginTop: 40, opacity: E.out(lf, c("comments") - c("whatthink"), c("comments") - c("whatthink") + 12) }}>TELL ME IN THE COMMENTS ↓</div>
              </Center>
              {lf >= sub - 8 ? (
                <Center y={820}>
                  <div style={{ padding: "18px 56px", borderRadius: 14, background: "#e8382f", fontFamily: INTER, fontWeight: 900, fontSize: 50, color: "#fff", transform: `scale(${E.back(lf, sub - 8, sub + 8)})`, boxShadow: "0 0 60px rgba(232,56,47,0.5)" }}>SUBSCRIBE</div>
                </Center>
              ) : null}
            </AbsoluteFill>
          );
        }}
      </Shot>
      <Shot f={f} a={VO_FRAMES} b={TOTAL_FRAMES} fout={0}>
        {(lf) => (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.12} />
            <Particles_2D f={lf} />
            <Pos x={140} y={280}>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 26, color: P.orange, letterSpacing: 6, marginBottom: 16 }}>WATCH NEXT</div>
              <div style={{ display: "flex", gap: 40 }}>
                {[0, 1].map((i) => (
                  <div key={i} style={{ width: 700, height: 394, borderRadius: 18, border: "2px dashed rgba(244,242,238,0.25)", background: "rgba(255,255,255,0.03)" }} />
                ))}
              </div>
            </Pos>
            <Pos x={1520} y={830}>
              <div style={{ width: 200, height: 200, borderRadius: 100, border: `3px solid ${P.orange}`, boxShadow: `0 0 40px ${P.orange}55` }} />
            </Pos>
          </AbsoluteFill>
        )}
      </Shot>
    </>
  );
};
const Particles_2D: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill>
    {Array.from({ length: 40 }, (_, i) => {
      const t = ((f * 0.002 + hash(i)) % 1) * 1.2;
      return <div key={i} style={{ position: "absolute", left: hash(i * 3) * 1920, top: 1100 - t * 1200, width: 4, height: 4, borderRadius: 2, background: P.orange, opacity: 0.4 * Math.sin(Math.min(1, t) * Math.PI), boxShadow: `0 0 10px ${P.orange}` }} />;
    })}
  </AbsoluteFill>
);

export const Scene7: React.FC<{ f: number }> = ({ f }) => {
  if (f < c("possib") - 2) return null;
  return (
    <>
      <S7Alt f={f} />
      <S7Dying f={f} />
      <S7Future f={f} />
      <S7Prism f={f} />
      <S7Recap f={f} />
      <S7Final f={f} />
    </>
  );
};

/* keep imports referenced */
void Shadow;
void Label;
