/**
 * UG-006 Scenes 3–4: THE AI TAKEOVER (chapter 2) and THE RAM CRISIS (chapter 3).
 */
import React from "react";
import { AbsoluteFill } from "remotion";
import { c, path, Shot } from "./Core6";
import { Backdrop, Bars, Center, ChapterCard, E, HEAD, INTER, Kinetic, Label, lin, LineChart, MetalType, MONO, Pos, RangeBar, Source, Tag } from "./Look6";
import { Accel, Dimm, DramArray, FeCard, Floor, Glow, Hbm, hash, Particles, P, Shadow, Stage, Transistor, Wafer, type V3 } from "./Three6";
import { Arm, Balance, Console, Crates, Hall, Laptop, PhoneSlab, Rack, Tv } from "./World6";

/* ===================================================================== SCENE 3 */
const S3Card: React.FC<{ f: number }> = ({ f }) => (
  <Shot f={f} a={c("ch2")} b={c("decades")} fin={10}>
    {(lf, d) => <ChapterCard f={lf} n={2} title="AI Is Changing the GPU Industry" variant={1} len={d + 8} />}
  </Shot>
);

const S3Decades: React.FC<{ f: number }> = ({ f }) => {
  const a = c("decades");
  return (
    <Shot f={f} a={a} b={c("today")}>
      {(lf) => {
        const at = [8, c("rendering") - a - 6, c("scientific") - a];
        const on = (k: number) => E.out(lf, at[k], at[k] + 18);
        const atoms: V3[] = [
          [0, 0, 0],
          [3, 1.5, 0],
          [-3, 1.5, 0.5],
          [0, -3, 1],
          [2, -1, -3],
          [-2, -1.5, -2.5],
        ];
        return (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.14} />
            <Stage cam={{ pos: [0, 10, 95], target: [0, 4, 0], fov: 32 }}>
              {/* gaming: wireframe terrain */}
              <group position={[-38, 2, 0]} rotation={[0.9, lf * 0.006, 0]} scale={on(0)}>
                <mesh>
                  <planeGeometry args={[22, 22, 18, 18]} />
                  <meshBasicMaterial color={P.orange} wireframe transparent opacity={0.85} />
                </mesh>
              </group>
              {/* rendering: path-traced-look object */}
              <group position={[0, 4, 0]} rotation={[lf * 0.01, lf * 0.012, 0]} scale={on(1)}>
                <mesh>
                  <torusKnotGeometry args={[5, 1.6, 160, 24]} />
                  <meshPhysicalMaterial color="#d9d4cc" metalness={1} roughness={0.12} clearcoat={1} />
                </mesh>
              </group>
              {/* science: molecule */}
              <group position={[38, 4, 0]} rotation={[0.3, lf * 0.015, 0]} scale={on(2) * 1.3}>
                {atoms.map((p, i) => (
                  <mesh key={i} position={p}>
                    <sphereGeometry args={[i === 0 ? 1.6 : 1.1, 24, 16]} />
                    <meshPhysicalMaterial color={i === 0 ? P.coral : "#cfd6df"} metalness={0.2} roughness={0.2} clearcoat={1} />
                  </mesh>
                ))}
              </group>
              <FeCard cls="70" p={[0, -16, 10]} r={[1.1, 0, 0]} s={0.7} light={1} spin={lf * 0.2} />
            </Stage>
            <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
              {[380, 960, 1540].map((x, k) => (
                <line key={x} x1={960} y1={820} x2={x} y2={600} stroke={P.orange} strokeWidth={3} strokeDasharray="8 10" strokeDashoffset={-lf * 2} opacity={on(k) * 0.7} />
              ))}
            </svg>
            {["GAMING", "PRO RENDERING", "SCIENTIFIC COMPUTING"].map((t, k) => (
              <Pos key={t} x={[380, 960, 1540][k] - 250} w={500} y={190} style={{ textAlign: "center", opacity: on(k) }}>
                <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 52, color: P.white }}>{t}</div>
              </Pos>
            ))}
            <Pos x={80} y={70}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: P.orange, letterSpacing: 5 }}>FOR DECADES, GPUs MEANT…</div>
            </Pos>
          </AbsoluteFill>
        );
      }}
    </Shot>
  );
};

const S3Hall: React.FC<{ f: number }> = ({ f }) => (
  <Shot f={f} a={c("today")} b={c("thousands")} fin={0}>
    {(lf, d) => {
      const z = path(lf, [[0, 40], [d, -180]]);
      const aiAt = c("ai") - c("today");
      return (
        <AbsoluteFill>
          <AbsoluteFill style={{ background: "linear-gradient(180deg, #050506 0%, #0b0c0e 60%, #120c09 100%)" }} />
          <Stage cam={{ pos: [Math.sin(lf * 0.01) * 2, 7, z], target: [0, 9, z - 100], fov: 46 }} fog={0.0055} light={0.7}>
            <Hall f={lf} aisles={9} len={28} />
            <Particles
              n={300}
              color="#ffd0b0"
              k={1.2}
              fn={(i) => {
                const t = (hash(i) + lf * 0.0015) % 1;
                return { p: [(hash(i * 2) - 0.5) * 16, 1 + hash(i * 3) * 18, z - 10 - t * 200], s: 0.05 };
              }}
            />
          </Stage>
          <Center y={420}>
            <div style={{ opacity: E.out(lf, aiAt, aiAt + 14) * (1 - lin(lf, d - 20, d)) }}>
              <MetalType f={lf} at={aiAt} size={150} sweepAt={aiAt + 8}>
                Artificial Intelligence
              </MetalType>
            </div>
          </Center>
          <Pos x={80} y={70}>
            <Kinetic f={lf} at={c("enormousdc") - c("today")} text="Enormous [AI] data centres" size={70} align="left" />
          </Pos>
          <Bars k={0.7} />
        </AbsoluteFill>
      );
    }}
  </Shot>
);

const S3Aerial: React.FC<{ f: number }> = ({ f }) => (
  <Shot f={f} a={c("thousands")} b={c("nvsupply")}>
    {(lf, d) => {
      const up = E.io(lf, 0, d);
      const camY = 14 + up * 190;
      const arcs = 70;
      return (
        <AbsoluteFill>
          <AbsoluteFill style={{ background: "#060607" }} />
          <Stage cam={{ pos: [0, camY, 60 - up * 40], target: [0, 0, -120], fov: 44 }} fog={0.003} light={0.7}>
            <Hall f={lf} aisles={13} len={24} />
            <Particles
              n={arcs * 14}
              color={P.orange}
              k={4}
              fn={(i) => {
                const arc = Math.floor(i / 14);
                const k = i % 14;
                const t0 = ((lf * 0.012 + hash(arc)) % 1) - k * 0.012;
                if (t0 < 0 || t0 > 1) return null;
                const ax = Math.round((hash(arc * 3) - 0.5) * 12) * 30 + (hash(arc * 5) > 0.5 ? 9 : -9);
                const az = -hash(arc * 7) * 250;
                const bx = Math.round((hash(arc * 11) - 0.5) * 12) * 30 + 9;
                const bz = -hash(arc * 13) * 250;
                return { p: [ax + (bx - ax) * t0, 22 + Math.sin(t0 * Math.PI) * 30, az + (bz - az) * t0], s: 0.6 * (1 - k / 14) };
              }}
            />
          </Stage>
          <Pos x={80} y={70}>
            <Kinetic f={lf} at={8} text="[Thousands] of processors" size={80} align="left" />
            <div style={{ fontFamily: MONO, fontSize: 24, color: "rgba(244,242,238,0.7)", letterSpacing: 4, marginTop: 10, opacity: E.out(lf, 20, 34) }}>TRAINING + RUNNING AI MODELS</div>
          </Pos>
        </AbsoluteFill>
      );
    }}
  </Shot>
);

const S3Money: React.FC<{ f: number }> = ({ f }) => (
  <>
    <Shot f={f} a={c("nvsupply")} b={c("revenue")}>
      {(lf, d) => {
        const open = E.io(lf, 10, 50);
        const arm = E.io(lf, 30, d - 10);
        return (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.16} cool={0.12} />
            <Stage cam={{ pos: [path(lf, [[0, 26], [d, 14]]), 18, path(lf, [[0, 34], [d, 26]])], target: [0, 10, 4], fov: 34 }}>
              <Floor r={300} />
              <Rack f={lf} open={open} openRow={8} accel={arm} p={[0, 0, 0]} />
              <Rack f={lf + 30} seed={2} p={[-6.5, 0, 0]} />
              <Rack f={lf + 60} seed={3} p={[6.5, 0, 0]} />
              <Arm p={[10, 0, 14]} s={0.7} a={-2.2 + arm * 0.5} b={0.7 - arm * 0.2} c={-1.6 + arm * 0.4} />
            </Stage>
            <Pos x={80} y={70}>
              <Kinetic f={lf} at={6} text="NVIDIA: a top supplier of [AI] chips" size={72} align="left" />
            </Pos>
            <Label f={lf} at={40} x={980} y={520} title="AI accelerators" sub="INSTALLED INTO SERVER SLEDS" dx={140} dy={-120} />
          </AbsoluteFill>
        );
      }}
    </Shot>
    <Shot f={f} a={c("revenue")} b={c("complicated")}>
      {(lf, d) => {
        const flow = E.io(lf, 0, 30);
        return (
          <AbsoluteFill>
            <AbsoluteFill style={{ background: "linear-gradient(180deg, #060607, #120b08)" }} />
            <Stage cam={{ pos: [path(lf, [[0, -100], [d, -60]]), 60, 160], target: [40, 10, -60], fov: 40 }} fog={0.003}>
              <group position={[120, 0, -40]}>
                <Hall f={lf} aisles={5} len={14} />
              </group>
              {/* city blocks (sources of capital) */}
              {Array.from({ length: 22 }, (_, i) => (
                <mesh key={i} position={[-180 + (i % 11) * 14, (6 + hash(i) * 30) / 2, -40 - Math.floor(i / 11) * 30]}>
                  <boxGeometry args={[10, 6 + hash(i) * 30, 10]} />
                  <meshStandardMaterial color="#121316" metalness={0.5} roughness={0.5} emissive={P.amber} emissiveIntensity={0.08} />
                </mesh>
              ))}
              <Particles
                n={700}
                color={P.amber}
                k={3}
                fn={(i) => {
                  const t = (hash(i) + lf * (0.006 + hash(i * 2) * 0.004)) % 1;
                  if (hash(i * 9) > flow) return null;
                  const sx = -180 + hash(i * 3) * 150;
                  const sz = -40 - hash(i * 5) * 30;
                  const tx = 100 + hash(i * 7) * 40;
                  const tz = -40 - hash(i * 11) * 90;
                  return { p: [sx + (tx - sx) * t, 30 + Math.sin(t * Math.PI) * 50 + hash(i * 13) * 10, sz + (tz - sz) * t], s: 0.7 };
                }}
              />
            </Stage>
            <Pos x={80} y={70}>
              <Kinetic f={lf} at={4} text="Money + resources flow to [AI]" size={78} align="left" />
              <div style={{ marginTop: 12 }}>
                <Tag f={lf} at={14}>ILLUSTRATIVE · NO FIGURES IMPLIED</Tag>
              </div>
            </Pos>
          </AbsoluteFill>
        );
      }}
    </Shot>
  </>
);

const S3Ingredients: React.FC<{ f: number }> = ({ f }) => {
  const a = c("complicated");
  return (
    <Shot f={f} a={a} b={c("worth")}>
      {(lf, d) => {
        const ex = E.io(lf, 6, 60);
        const con = c("constrained") - a;
        const shrink = E.io(lf, con - 4, con + 26);
        const labels: [string, number, number, number][] = [
          ["Production facilities", c("facilities") - a, 1240, 300],
          ["Advanced packaging", c("packaging") - a, 1250, 470],
          ["Specialized components", c("specialized") - a, 1250, 640],
          ["MEMORY", c("memory1") - a, 1250, 800],
        ];
        const memOn = lf >= c("memory1") - a;
        return (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.14} />
            <Stage cam={{ pos: [path(lf, [[0, 18], [d, 26]]) - shrink * 20, 30, 34], target: [shrink * 8, 3, 0], fov: 34 }}>
              <Floor r={200} y={-1} />
              <Accel explode={ex} hbmGlow={memOn ? 0.6 + 0.4 * Math.sin(lf * 0.3) : 0.1} dieGlow={0.2} r={[0, lf * 0.004, 0]} />
            </Stage>
            {lf < con + 10
              ? labels.map(([t, at, x, y], i) => (
                  <Pos key={t} x={x} y={y} style={{ opacity: E.out(lf, at, at + 12) * (1 - shrink) }}>
                    <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: i === 3 ? 84 : 52, color: i === 3 ? P.orange : P.white, textShadow: i === 3 ? `0 0 40px ${P.orange}88` : "0 4px 18px #000" }}>
                      <span style={{ fontFamily: MONO, fontSize: 26, color: "rgba(244,242,238,0.5)", marginRight: 18 }}>0{i + 1}</span>
                      {t}
                    </div>
                  </Pos>
                ))
              : null}
            {shrink > 0 ? <Funnel lf={lf - con} k={shrink} /> : null}
            <Pos x={80} y={70}>
              <Kinetic f={lf} at={4} text="Advanced chips are [hard] to make" size={72} align="left" out={con} />
            </Pos>
          </AbsoluteFill>
        );
      }}
    </Shot>
  );
};
/** Valve: a wide stream narrows and splits — limited supply has to be allocated. */
const Funnel: React.FC<{ lf: number; k: number }> = ({ lf, k }) => (
  <Pos x={980} y={180} style={{ opacity: k }}>
    <svg width={860} height={700}>
      <defs>
        <linearGradient id="fg" x1="0" x2="1">
          <stop offset="0" stopColor={P.orange} stopOpacity={0.9} />
          <stop offset="1" stopColor={P.coral} stopOpacity={0.9} />
        </linearGradient>
      </defs>
      <path d="M0,120 L320,300 L320,380 L0,560 Z" fill="url(#fg)" opacity={0.18} />
      {Array.from({ length: 40 }, (_, i) => {
        const t = ((i / 40 + lf * 0.01) % 1) * 1.0;
        const y0 = 130 + (i % 10) * 42;
        const x = t * 820;
        const y = x < 320 ? y0 + (340 - y0) * (x / 320) : 340 + (i % 3 === 0 ? -1 : 1) * Math.min(1, (x - 320) / 300) * (i % 3 === 0 ? 220 : 60);
        return <circle key={i} cx={x} cy={y} r={7} fill={i % 3 === 0 ? P.orange : P.coral} />;
      })}
      <text x={600} y={100} fill={P.orange} fontFamily={HEAD} fontWeight={800} fontSize={44}>
        AI / ENTERPRISE
      </text>
      <text x={600} y={460} fill={P.coral} fontFamily={HEAD} fontWeight={800} fontSize={44}>
        GAMING
      </text>
      <text x={0} y={660} fill="rgba(244,242,238,0.7)" fontFamily={MONO} fontWeight={700} fontSize={24} letterSpacing={3}>
        LIMITED SUPPLY → WHERE DOES IT GO?
      </text>
    </svg>
  </Pos>
);

const S3Balance: React.FC<{ f: number }> = ({ f }) => {
  const a = c("worth");
  return (
    <Shot f={f} a={a} b={c("thinkabout")}>
      {(lf, d) => {
        const tilt = E.get("elastic.out(1, 0.5)")(lin(lf, 24, 70));
        return (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.16} y={55} />
            <Stage cam={{ pos: [path(lf, [[0, -10], [d, 10]]), 32, 92], target: [0, 18, 0], fov: 32 }}>
              <Floor r={300} />
              <Shadow w={80} d={30} />
              <Balance
                tilt={tilt}
                left={<FeCard cls="90" s={0.3} p={[0, 1.2, 0]} light={0.8} />}
                right={lf > 14 ? <Accel s={0.55} p={[0, 0.4 + Math.max(0, 1 - lin(lf, 14, 24)) * 20, 0]} hbmGlow={0.6} dieGlow={0.4} /> : null}
              />
            </Stage>
            <Pos x={250} y={760} w={500} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 46, color: P.white, opacity: E.out(lf, 6, 20) }}>GAMING GRAPHICS CARD</div>
            </Pos>
            <Pos x={1180} y={820} w={540} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 46, color: P.orange, opacity: E.out(lf, 20, 34) }}>DATA-CENTRE ACCELERATOR</div>
            </Pos>
            <Center y={90}>
              <Kinetic f={lf} at={c("incentive") - a} text="Enterprise & [AI] → [priority]" size={96} />
            </Center>
          </AbsoluteFill>
        );
      }}
    </Shot>
  );
};

const S3Split: React.FC<{ f: number }> = ({ f }) => {
  const a = c("thinkabout");
  return (
    <Shot f={f} a={a} b={c("pressure")}>
      {(lf, d) => {
        const comp = c("company") - a;
        const n = Math.min(25, Math.floor(1 + E.io(lf, comp, d - 10) * 24));
        const label = lf < comp + 30 ? "×10" : lf < comp + 60 ? "×100" : "×1,000s";
        return (
          <AbsoluteFill>
            <AbsoluteFill style={{ width: 960, overflow: "hidden" }}>
              <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(255,170,90,0.28), #0b0c0e 70%)" }} />
              <div style={{ position: "absolute", left: -480, width: 1920, height: 1080 }}>
                <Stage cam={{ pos: [0, 30, 70], target: [0, 8, 0], fov: 30 }} light={0.9}>
                  <Floor r={200} />
                  <mesh position={[0, 6, 0]} rotation={[0, 0.5 + lf * 0.003, 0]}>
                    <boxGeometry args={[16, 10, 34]} />
                    <meshStandardMaterial color="#1b1712" roughness={0.6} />
                  </mesh>
                  <FeCard cls="80" p={[0, 13, 0]} r={[0.2, 0.5 + lf * 0.003, 0]} s={0.9} light={1} />
                </Stage>
              </div>
              <Pos x={60} y={70}>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: P.orange }}>ONE GAMER</div>
                <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 120, color: P.white }}>×1</div>
              </Pos>
            </AbsoluteFill>
            <AbsoluteFill style={{ left: 960, width: 960, overflow: "hidden" }}>
              <AbsoluteFill style={{ background: "linear-gradient(180deg, #08090b, #0e1013)" }} />
              <div style={{ position: "absolute", left: -480, width: 1920, height: 1080 }}>
                <Stage cam={{ pos: [0, 50, 130], target: [0, 14, 0], fov: 34 }} rim={P.cool}>
                  <Floor r={300} />
                  {[-1, 0, 1].map((k) => (
                    <Crates key={k} n={n} cols={5} vis={() => 1} p={[k * 26, 0, -k * k * 10]} />
                  ))}
                  <Arm p={[44, 0, 10]} s={0.9} a={-2.4 + Math.sin(lf * 0.08) * 0.5} b={0.6} c={-1.2 + Math.sin(lf * 0.08) * 0.3} />
                </Stage>
              </div>
              <Pos x={60} y={70}>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, letterSpacing: 4, color: P.orange }}>ONE COMPANY</div>
                <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 120, color: P.orange }}>{lf >= comp ? label : "…"}</div>
                <div style={{ fontFamily: MONO, fontSize: 22, color: "rgba(244,242,238,0.6)", letterSpacing: 3 }}>AI ACCELERATORS · ILLUSTRATIVE</div>
              </Pos>
            </AbsoluteFill>
            <div style={{ position: "absolute", left: 958, top: 0, width: 4, height: 1080, background: P.orange, boxShadow: `0 0 20px ${P.orange}` }} />
            <Center y={880}>
              <Kinetic f={lf} at={c("gamer1") - a} text="A completely [different] budget" size={76} />
            </Center>
          </AbsoluteFill>
        );
      }}
    </Shot>
  );
};

const S3Scale: React.FC<{ f: number }> = ({ f }) => (
  <Shot f={f} a={c("pressure")} b={c("abandoned")} fin={0}>
    {(lf, d) => {
      const back = E.get("expo.inOut")(lin(lf, 8, d - 6));
      return (
        <AbsoluteFill>
          <AbsoluteFill style={{ background: "#060607" }} />
          <Stage cam={{ pos: [0, 4 + back * 170, 20 + back * 200], target: [0, 2, -back * 120], fov: 34 + back * 12 }} fog={0.0025 * back}>
            <FeCard cls="90" p={[0, 2, 0]} r={[1.1, 0.3, 0]} s={0.5} light={1} spin={lf * 0.2} />
            <Glow p={[0, 2, 0]} s={20} color={P.orange} o={0.4} />
            {back > 0.02 ? (
              <group position={[0, -20, -60]}>
                <Hall f={lf} aisles={17} len={26} leds={back} strips={back} />
              </group>
            ) : null}
          </Stage>
          <Pos x={110} y={420} style={{ opacity: 1 - lin(lf, 30, 46) }}>
            <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 130, color: P.white }}>1 GAMING GPU</div>
          </Pos>
          <Center y={100}>
            <div style={{ opacity: E.out(lf, d - 50, d - 30) }}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, color: P.orange, letterSpacing: 8 }}>VS</div>
              <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 120, color: P.white }}>AN ENTIRE AI DATA CENTRE</div>
            </div>
          </Center>
        </AbsoluteFill>
      );
    }}
  </Shot>
);

const S3Statement: React.FC<{ f: number }> = ({ f }) => {
  const a = c("abandoned");
  return (
    <>
      <Shot f={f} a={a} b={c("avail")}>
        {(lf) => (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.1} />
            <AbsoluteFill style={{ filter: "blur(10px) brightness(0.5)" }}>
              <Stage cam={{ pos: [Math.sin(lf * 0.008) * 50, 14, Math.cos(lf * 0.008) * 50], target: [0, 0, 0], fov: 30 }}>
                <FeCard cls="90" r={[1.2, 0, 0]} light={1} spin={lf * 0.1} />
              </Stage>
            </AbsoluteFill>
            <Pos x={200} y={170}>
              <Kinetic f={lf} at={4} text="Has NVIDIA [abandoned] gamers?" size={96} align="left" />
            </Pos>
            {lf >= c("statement") - a ? (
              <Pos x={200} y={420} w={1500}>
                <div style={{ borderLeft: `6px solid ${P.orange}`, paddingLeft: 40, opacity: E.out(lf, c("statement") - a, c("statement") - a + 20) }}>
                  <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 52, color: P.white, lineHeight: 1.3 }}>
                    NVIDIA says it continues shipping GeForce GPUs while working with suppliers to <span style={{ color: P.orange }}>maximize memory availability</span>.
                  </div>
                  <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: "rgba(244,242,238,0.6)", letterSpacing: 4, marginTop: 24 }}>— NVIDIA STATEMENT (PARAPHRASED)</div>
                </div>
              </Pos>
            ) : null}
          </AbsoluteFill>
        )}
      </Shot>
      <Shot f={f} a={c("avail")} b={c("half")}>
        {(lf) => {
          const flick = Math.floor(lf / 11) % 2 === 0;
          return (
            <AbsoluteFill>
              <Backdrop f={lf} warm={0.08} />
              <Pos x={560} y={170} w={800}>
                <div style={{ borderRadius: 26, background: "#121317", border: "1px solid rgba(255,255,255,0.08)", padding: 40, boxShadow: "0 40px 100px rgba(0,0,0,0.6)" }}>
                  <div style={{ height: 300, borderRadius: 16, background: "radial-gradient(ellipse at 50% 60%, #2a1a10, #0c0d10)", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", inset: 0 }}>
                      <div style={{ position: "absolute", left: -560, top: -170, width: 1920, height: 1080, transform: "scale(0.5)", transformOrigin: "960px 340px" }}>
                        <Stage cam={{ pos: [0, 30, 50], target: [0, 0, 0], fov: 30 }}>
                          <FeCard cls="80" r={[0.3, 0.6 + lf * 0.004, 0]} light={1} />
                        </Stage>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontFamily: INTER, fontWeight: 800, fontSize: 40, color: P.white, marginTop: 26 }}>Graphics card · current generation</div>
                  <div style={{ fontFamily: MONO, fontSize: 24, color: "rgba(244,242,238,0.5)", marginTop: 6 }}>GENERIC STORE · ILLUSTRATION</div>
                  <div style={{ display: "flex", gap: 20, marginTop: 28, alignItems: "center" }}>
                    <div style={{ padding: "12px 28px", borderRadius: 10, fontFamily: MONO, fontWeight: 800, fontSize: 30, letterSpacing: 3, background: flick ? "rgba(90,200,120,0.15)" : "rgba(255,90,78,0.15)", color: flick ? "#7fe0a0" : P.coral, border: `2px solid ${flick ? "#7fe0a0" : P.coral}` }}>{flick ? "IN STOCK" : "SOLD OUT"}</div>
                    <div style={{ padding: "12px 28px", borderRadius: 10, fontFamily: INTER, fontWeight: 800, fontSize: 30, background: P.orange, color: "#1a0e06", opacity: 0.6 + 0.4 * Math.sin(lf * 0.2) }}>Notify me</div>
                  </div>
                </div>
              </Pos>
              <Center y={830}>
                <Kinetic f={lf} at={c("difficult") - c("avail")} text="Available ≠ [easy to buy]" size={70} />
              </Center>
            </AbsoluteFill>
          );
        }}
      </Shot>
    </>
  );
};

const S3Half: React.FC<{ f: number }> = ({ f }) => (
  <Shot f={f} a={c("half")} b={c("ch3")} fout={10}>
    {(lf, d) => {
      const drop = E.get("bounce.out")(lin(lf, c("memind") - c("half") - 30, c("memind") - c("half")));
      const take = E.io(lf, d - 26, d);
      const split = 960 - take * 960;
      return (
        <AbsoluteFill>
          <AbsoluteFill style={{ width: split, overflow: "hidden" }}>
            <Backdrop f={lf} warm={0.12} />
            <div style={{ position: "absolute", left: -480, width: 1920, height: 1080 }}>
              <Stage cam={{ pos: [0, 30, 60], target: [0, 2, 0], fov: 30 }}>
                <FeCard cls="90" r={[0.6, lf * 0.006, 0]} light={1} spin={lf * 0.2} />
              </Stage>
            </div>
            <Pos x={60} y={820}>
              <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 60, color: P.white }}>GRAPHICS CARDS</div>
            </Pos>
          </AbsoluteFill>
          <AbsoluteFill style={{ left: split, width: 1920 - split, overflow: "hidden" }}>
            <Backdrop f={lf} warm={0.2} x={60} />
            <div style={{ position: "absolute", left: -480 - (960 - split) / 2, width: 1920, height: 1080 }}>
              <Stage cam={{ pos: [0, 10, 34], target: [0, 4, 0], fov: 30 }}>
                <Dimm p={[0, 30 - drop * 30, 0]} r={[0, lf * 0.006, 0]} rgb={1} phase={lf * 0.1} s={1.3} />
                <Floor r={200} y={-0.1} />
              </Stage>
            </div>
            <Pos x={60} y={820}>
              <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 60, color: P.orange }}>…AND MEMORY</div>
            </Pos>
          </AbsoluteFill>
          <div style={{ position: "absolute", left: split - 2, top: 0, width: 4, height: 1080, background: P.orange, opacity: 1 - take }} />
          <Center y={90}>
            <Kinetic f={lf} at={4} text="Only [half] of the problem" size={80} out={d - 30} />
          </Center>
        </AbsoluteFill>
      );
    }}
  </Shot>
);

export const Scene3: React.FC<{ f: number }> = ({ f }) => {
  if (f < c("ch2") - 2 || f >= c("ch3") + 14) return null;
  return (
    <>
      <S3Card f={f} />
      <S3Decades f={f} />
      <S3Hall f={f} />
      <S3Aerial f={f} />
      <S3Money f={f} />
      <S3Ingredients f={f} />
      <S3Balance f={f} />
      <S3Split f={f} />
      <S3Scale f={f} />
      <S3Statement f={f} />
      <S3Half f={f} />
    </>
  );
};

/* ===================================================================== SCENE 4 */
const S4Card: React.FC<{ f: number }> = ({ f }) => (
  <Shot f={f} a={c("ch3")} b={c("ddr5") + 40} fin={10}>
    {(lf, d) => <ChapterCard f={lf} n={3} title="The RAM Crisis" variant={2} len={d + 8} />}
  </Shot>
);

const S4Hero: React.FC<{ f: number }> = ({ f }) => {
  const a = c("ddr5") + 40;
  return (
    <Shot f={f} a={a} b={c("aimem")}>
      {(lf, d) => {
        const off = E.io(lf, c("pressure2") - a, c("pressure2") - a + 50);
        const ang = path(lf, [[0, -0.7], [d, 0.5]]);
        return (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.2} />
            <Stage cam={{ pos: [Math.sin(ang) * 22, 6 + off * 2, Math.cos(ang) * 22], target: [0, 2.2, 0], fov: 28 }}>
              <Floor r={200} />
              <Shadow w={20} d={6} />
              <Dimm spreader={1 - off} rgb={1 - off * 0.7} phase={lf * 0.1} p={[0, 0.05, 0]} />
            </Stage>
            {off > 0.8 ? (
              <>
                <Label f={lf} at={c("pressure2") - a + 50} x={820} y={560} title="DRAM chips" sub="8 PER SIDE ON THIS MODULE" dx={-120} dy={-200} align="right" />
                <Label f={lf} at={c("pressure2") - a + 62} x={970} y={620} title="PMIC" sub="ON-MODULE POWER (DDR5)" dx={160} dy={150} />
              </>
            ) : null}
            <Pos x={80} y={70}>
              <MetalType f={lf} at={4} size={110}>
                DDR5
              </MetalType>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: P.orange, letterSpacing: 5, opacity: E.out(lf, 12, 26) }}>DESKTOP MEMORY MODULE · ORIGINAL 3D</div>
            </Pos>
          </AbsoluteFill>
        );
      }}
    </Shot>
  );
};

const S4NotSame: React.FC<{ f: number }> = ({ f }) => {
  const a = c("aimem");
  return (
    <Shot f={f} a={a} b={c("hbm")}>
      {(lf) => {
        const ne = E.out(lf, c("samesticks") - a - 10, c("samesticks") - a + 10);
        return (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.14} />
            <Stage cam={{ pos: [0, 26, 52], target: [0, 2, 0], fov: 32 }}>
              <Floor r={200} />
              <Dimm p={[-18, 0, 0]} r={[0, 0.5 + lf * 0.004, 0]} rgb={0.6} phase={lf * 0.1} s={1.4} />
              <Accel p={[18, 1, 0]} r={[0.2, -0.5 + lf * 0.004, 0]} s={1.05} hbmGlow={0.5} />
            </Stage>
            <Center y={370}>
              <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 240, color: P.orange, opacity: ne, transform: `scale(${1.5 - 0.5 * ne})`, textShadow: `0 0 60px ${P.orange}` }}>≠</div>
            </Center>
            <Pos x={240} y={820} w={560} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 50, color: P.white }}>YOUR PC'S MEMORY STICK</div>
            </Pos>
            <Pos x={1120} y={820} w={600} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 50, color: P.orange }}>AI ACCELERATOR + HBM</div>
            </Pos>
            <Pos x={80} y={70}>
              <Kinetic f={lf} at={4} text="AI needs [enormous] memory…" size={70} align="left" />
            </Pos>
          </AbsoluteFill>
        );
      }}
    </Shot>
  );
};

const S4Hbm: React.FC<{ f: number }> = ({ f }) => {
  const a = c("hbm");
  return (
    <Shot f={f} a={a} b={c("serverdram")} fin={0}>
      {(lf, d) => {
        const dive = E.get("expo.inOut")(lin(lf, 0, 50));
        const ex = E.io(lf, 40, 110);
        const bw = c("hbmdesign") - a;
        const lanes = E.io(lf, bw, bw + 40);
        return (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.12} y={50} />
            <Stage cam={{ pos: [path(lf, [[0, 30], [50, 9], [d, 6]]), path(lf, [[0, 34], [50, 8], [d, 7]]), path(lf, [[0, 40], [50, 10], [d, 9]])], target: [0, 2 + ex * 1.5, 0], fov: 32 }}>
              {dive < 0.98 ? <Accel s={1} hbmGlow={0.4} p={[-3.4 * 0, 0, 0]} /> : null}
              <Hbm s={2.2} explode={ex} tsv={E.out(lf, 70, 100)} p={[dive * 0, 0, 0]} />
              <Floor r={100} y={-0.3} />
            </Stage>
            {lf > 70 ? (
              <>
                <Label f={lf} at={76} x={1100} y={330} title="DRAM dies, stacked" sub="UP TO 8–12 LAYERS" dx={120} dy={-80} />
                <Label f={lf} at={90} x={980} y={560} title="TSVs" sub="THROUGH-SILICON VIAS" dx={260} dy={60} />
                <Label f={lf} at={104} x={900} y={760} title="Base logic die" sub="SITS ON THE INTERPOSER" dx={-160} dy={90} align="right" />
              </>
            ) : null}
            {lanes > 0 ? (
              <Pos x={80} y={430} style={{ opacity: lanes }}>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, color: "rgba(244,242,238,0.7)", letterSpacing: 3, marginBottom: 10 }}>HBM · VERY WIDE INTERFACE</div>
                <svg width={520} height={150}>
                  {Array.from({ length: 32 }, (_, i) => (
                    <rect key={i} x={0} y={i * 4.5} width={520 * lanes} height={3} fill={P.orange} opacity={0.4 + 0.6 * (((i + Math.floor(lf / 2)) % 5) / 5)} />
                  ))}
                </svg>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, color: "rgba(244,242,238,0.7)", letterSpacing: 3, margin: "18px 0 10px" }}>DESKTOP DDR5 · NARROWER CHANNELS</div>
                <svg width={520} height={30}>
                  {Array.from({ length: 4 }, (_, i) => (
                    <rect key={i} x={0} y={i * 7} width={520 * lanes} height={3} fill={P.white} opacity={0.5} />
                  ))}
                </svg>
              </Pos>
            ) : null}
            <Pos x={80} y={70}>
              <MetalType f={lf} at={4} size={96}>
                High Bandwidth Memory
              </MetalType>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: P.orange, letterSpacing: 5, opacity: E.out(lf, 12, 26) }}>HBM · STACKED DRAM NEXT TO THE GPU</div>
            </Pos>
          </AbsoluteFill>
        );
      }}
    </Shot>
  );
};

const S4Server: React.FC<{ f: number }> = ({ f }) => (
  <Shot f={f} a={c("serverdram")} b={c("important")}>
    {(lf, d) => {
      const slide = E.io(lf, 0, 30);
      return (
        <AbsoluteFill>
          <Backdrop f={lf} warm={0.1} cool={0.16} />
          <Stage cam={{ pos: [path(lf, [[0, 10], [d, -6]]), 26, 34], target: [0, 4, 0], fov: 32 }} rim={P.cool}>
            <group position={[0, 0, -20 + slide * 20]}>
              <mesh position={[0, -0.5, 0]}>
                <boxGeometry args={[44, 1, 40]} />
                <meshStandardMaterial color="#2c3036" metalness={0.9} roughness={0.35} />
              </mesh>
              {Array.from({ length: 16 }, (_, i) => {
                const lit = Math.max(0, 1 - Math.abs(((lf * 0.4) % 20) - i) / 2);
                return <Dimm key={i} kind="rdimm" spreader={0} p={[-15 + i * 2, 0, 4]} r={[0, Math.PI / 2, 0]} chipGlow={lit} />;
              })}
              <Accel p={[0, 0, -10]} s={0.9} hbmGlow={0.3} />
            </group>
          </Stage>
          <Pos x={80} y={70}>
            <Kinetic f={lf} at={4} text="+ lots of [server DRAM]" size={80} align="left" />
            <div style={{ fontFamily: MONO, fontSize: 24, color: "rgba(244,242,238,0.7)", letterSpacing: 4, marginTop: 8, opacity: E.out(lf, 16, 30) }}>REGISTERED DIMMs (RDIMM) IN AI SERVERS</div>
          </Pos>
        </AbsoluteFill>
      );
    }}
  </Shot>
);

const S4Connected: React.FC<{ f: number }> = ({ f }) => {
  const a = c("important");
  return (
    <Shot f={f} a={a} b={c("capacity")}>
      {(lf) => {
        const diff = c("different") - a;
        const con = c("connected") - a;
        const lines = E.io(lf, con, con + 30);
        return (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.14} y={70} />
            <Stage cam={{ pos: [0, 30, 120], target: [0, 18, 0], fov: 30 }}>
              {[
                [-40, 0],
                [0, 1],
                [40, 2],
              ].map(([x, k]) => (
                <group key={k} position={[x, 30 + Math.sin(lf * 0.04 + k) * 0.8, 0]} scale={E.back(lf, diff + k * 6, diff + k * 6 + 16)} rotation={[0.2, lf * 0.01, 0]}>
                  {k === 0 ? <Hbm s={5} tsv={0.5} /> : k === 1 ? <Dimm kind="rdimm" spreader={0} s={1.6} p={[0, -2, 0]} /> : <Dimm rgb={1} phase={lf * 0.1} s={1.6} p={[0, -2, 0]} />}
                </group>
              ))}
              <mesh position={[0, 0, 0]}>
                <boxGeometry args={[130, 2, 30]} />
                <meshStandardMaterial color="#1a1c20" metalness={0.8} roughness={0.3} emissive={P.orange} emissiveIntensity={0.25 * lines} />
              </mesh>
            </Stage>
            <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
              {[560, 960, 1360].map((x) => (
                <line key={x} x1={x} y1={560} x2={x} y2={560 + 230 * lines} stroke={P.orange} strokeWidth={4} style={{ filter: `drop-shadow(0 0 8px ${P.orange})` }} />
              ))}
            </svg>
            {["HBM", "SERVER DRAM", "PC DDR5"].map((t, k) => (
              <Pos key={t} x={[560, 960, 1360][k] - 200} w={400} y={180} style={{ textAlign: "center", opacity: E.out(lf, diff + k * 6, diff + k * 6 + 14) }}>
                <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 54, color: P.white }}>{t}</div>
              </Pos>
            ))}
            <Center y={870}>
              <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 54, color: P.orange, letterSpacing: 2, opacity: lines }}>ONE SEMICONDUCTOR MANUFACTURING ECOSYSTEM</div>
            </Center>
            <Pos x={80} y={70}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: "rgba(244,242,238,0.7)", letterSpacing: 4, opacity: E.out(lf, diff, diff + 14) }}>DIFFERENT PRODUCTS…</div>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: P.orange, letterSpacing: 4, opacity: lines }}>…CONNECTED</div>
            </Pos>
          </AbsoluteFill>
        );
      }}
    </Shot>
  );
};

const S4Micro: React.FC<{ f: number }> = ({ f }) => {
  const a = c("capacity");
  return (
    <Shot f={f} a={a} b={c("incent2")} fin={0}>
      {(lf, d) => {
        const ph1 = E.get("expo.inOut")(lin(lf, 0, d * 0.4));
        const ph2 = E.get("expo.inOut")(lin(lf, d * 0.45, d * 0.8));
        const tags: [string, number][] = [
          ["CAPACITY", 6],
          ["PROCESS", 22],
          ["PACKAGING", 38],
          ["INVESTMENT", c("investment") - a],
        ];
        return (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.1} />
            <Stage cam={{ pos: [path(lf, [[0, 0], [d, 12]]), path(lf, [[0, 70], [d * 0.4, 30], [d * 0.8, 18], [d, 14]]), path(lf, [[0, 40], [d * 0.4, 26], [d, 20]])], target: [0, 0, 0], fov: 34 }}>
              {ph2 < 1 ? (
                <group scale={1 + ph1 * 6 + ph2 * 8} position={[0, -ph2 * 2, 0]}>
                  <Wafer glow={0.15 + ph1 * 0.3} />
                </group>
              ) : null}
              {ph1 > 0.6 ? (
                <group position={[0, 0.5, 0]} scale={0.6 + ph2 * 0.6}>
                  <DramArray n={16} charge={(i, j) => (((i * 5 + j * 3 + Math.floor(lf / 3)) % 11) < 3 ? 1 : 0)} />
                </group>
              ) : null}
              {ph2 > 0.5 ? <Transistor p={[0, 6, 6]} s={0.8} on={0.5 + 0.5 * Math.sin(lf * 0.3)} /> : null}
            </Stage>
            <Pos x={80} y={70}>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 24, color: P.orange, letterSpacing: 5 }}>{ph2 > 0.5 ? "DRAM CELLS · 1 TRANSISTOR + 1 CAPACITOR" : "SILICON WAFER"}</div>
            </Pos>
            <Pos x={1380} y={250}>
              {tags.map(([t, at]) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 22, opacity: E.out(lf, at, at + 12), transform: `translateX(${(1 - E.out(lf, at, at + 12)) * 40}px)` }}>
                  <div style={{ width: 14, height: 14, borderRadius: 7, background: P.orange, boxShadow: `0 0 14px ${P.orange}` }} />
                  <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 56, color: P.white }}>{t}</div>
                </div>
              ))}
            </Pos>
          </AbsoluteFill>
        );
      }}
    </Shot>
  );
};

const S4Alloc: React.FC<{ f: number }> = ({ f }) => (
  <Shot f={f} a={c("incent2")} b={c("trendforce")}>
    {(lf, d) => {
      const sh = E.io(lf, 20, d - 20);
      const server = 0.45 + sh * 0.27;
      return (
        <AbsoluteFill>
          <Backdrop f={lf} warm={0.12} />
          <Stage cam={{ pos: [0, 54, 30], target: [0, 0, 0], fov: 34 }}>
            <group rotation={[0, lf * 0.003, 0]}>
              <Wafer sectors={[[server, P.orange], [1 - server, P.coral]]} sectorK={1} glow={0.1} />
            </group>
          </Stage>
          <Pos x={1300} y={330}>
            <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 60, color: P.orange }}>SERVER / AI ▲</div>
            <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 60, color: P.coral, marginTop: 20 }}>CONSUMER ▼</div>
          </Pos>
          <Pos x={80} y={70}>
            <Kinetic f={lf} at={4} text="Capacity follows [value]" size={80} align="left" />
            <div style={{ marginTop: 12 }}>
              <Tag f={lf} at={12}>WAFER ALLOCATION · ILLUSTRATIVE</Tag>
            </div>
          </Pos>
        </AbsoluteFill>
      );
    }}
  </Shot>
);

const S4Trend: React.FC<{ f: number }> = ({ f }) => {
  const a = c("trendforce");
  return (
    <>
      <Shot f={f} a={a} b={c("decline")}>
        {(lf) => (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.1} />
            <Pos x={80} y={70}>
              <Kinetic f={lf} at={4} text="TrendForce [forecast]" size={84} align="left" />
              <div style={{ fontFamily: MONO, fontSize: 24, color: "rgba(244,242,238,0.7)", letterSpacing: 4, marginTop: 8, opacity: E.out(lf, 14, 28) }}>SUPPLIERS PRIORITISING HIGH-PERFORMANCE SERVER PRODUCTS</div>
            </Pos>
            <Pos x={360} y={420}>
              <RangeBar f={lf} at={24} growAt={c("pct1015") - a - 20} lo={10} hi={15} max={20} w={1200} label="CONVENTIONAL DRAM CONTRACT PRICES · Q4 2026 vs Q3 (QoQ)" />
            </Pos>
            <Source f={lf} at={20}>TRENDFORCE, Q4 2026 FORECAST</Source>
          </AbsoluteFill>
        )}
      </Shot>
      <Shot f={f} a={c("decline")} b={c("morethan")}>
        {(lf) => (
          <AbsoluteFill>
            <Backdrop f={lf} warm={0.1} />
            <Pos x={80} y={70}>
              <Kinetic f={lf} at={4} text="PC DRAM supply could [shrink] in 2027" size={80} align="left" />
              <div style={{ marginTop: 12 }}>
                <Tag f={lf} at={12}>CHART SHAPE ILLUSTRATIVE · DIRECTION PER TRENDFORCE</Tag>
              </div>
            </Pos>
            <Pos x={240} y={300}>
              <LineChart
                f={lf}
                at={0}
                w={1440}
                h={620}
                xLabels={["2024", "2025", "2026", "2027"]}
                series={[
                  { vals: [0.3, 0.45, 0.7, 0.92], color: P.orange, label: "AI / SERVER DEMAND", at: 10, len: 60 },
                  { vals: [0.55, 0.52, 0.45, 0.33], color: P.coral, label: "PC DRAM SHARE", at: 24, len: 60 },
                ]}
              />
            </Pos>
            <Source f={lf} at={30}>TRENDFORCE (DIRECTION OF TREND)</Source>
          </AbsoluteFill>
        )}
      </Shot>
    </>
  );
};

const S4Devices: React.FC<{ f: number }> = ({ f }) => {
  const a = c("morethan");
  return (
    <>
      <Shot f={f} a={a} b={c("absorb")}>
        {(lf, d) => {
          const hit = (k: string) => E.out(lf, c(k) - a - 4, c(k) - a + 8);
          const items: [string, string, V3][] = [
            ["laptops", "LAPTOPS", [-60, 0, 0]],
            ["phones", "PHONES", [-30, 0, 0]],
            ["consoles", "CONSOLES", [0, 0, 0]],
            ["gcards", "GRAPHICS CARDS", [30, 0, 0]],
            ["electronics", "EVERYTHING ELSE", [60, 0, 0]],
          ];
          return (
            <AbsoluteFill>
              <Backdrop f={lf} warm={0.12} />
              <Stage cam={{ pos: [path(lf, [[0, -20], [d, 20]]), 34, 120], target: [0, 8, 0], fov: 34 }}>
                <Floor r={400} />
                <Laptop p={[-60, 0, 0]} s={0.7} r={[0, 0.3, 0]} />
                <PhoneSlab p={[-30, 0, 0]} s={1.2} />
                <Console p={[-2, 0, 0]} s={0.6} />
                <FeCard cls="80" p={[30, 4, 0]} s={0.6} r={[1.2, 0, 0]} light={0.8} />
                <Tv p={[60, 0, 0]} s={0.45} />
                {items.map(([k, , p]) => (
                  <Glow key={k} p={[p[0], 8, 6]} s={26} color={P.orange} o={0.55 * hit(k)} />
                ))}
              </Stage>
              {items.map(([k, t], i) => (
                <Pos key={k} x={170 + i * 340} y={820} w={300} style={{ textAlign: "center", opacity: 0.35 + 0.65 * hit(k) }}>
                  <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 40, color: hit(k) > 0.5 ? P.orange : P.white }}>{t}</div>
                  <div style={{ fontFamily: MONO, fontSize: 20, color: "rgba(244,242,238,0.6)" }}>MEMORY INSIDE</div>
                </Pos>
              ))}
              <Pos x={80} y={70}>
                <Kinetic f={lf} at={4} text="It's not just [gaming PCs]" size={80} align="left" />
              </Pos>
            </AbsoluteFill>
          );
        }}
      </Shot>
      <Shot f={f} a={c("absorb")} b={c("terrible")}>
        {(lf) => {
          const tiles: [string, number][] = [
            ["ABSORB THE COST", c("absorb") - c("absorb") - 10],
            ["REDUCE SPECS", c("reduce") - c("absorb")],
            ["PASS IT TO YOU", c("pass") - c("absorb")],
          ];
          return (
            <AbsoluteFill>
              <Backdrop f={lf} warm={0.12} />
              <Center y={140}>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: "rgba(244,242,238,0.7)", letterSpacing: 6 }}>WHEN MEMORY COSTS MORE, MAKERS CAN…</div>
              </Center>
              {tiles.map(([t, at], i) => {
                const fl = E.out(lf, Math.max(0, at), Math.max(0, at) + 18);
                const last = i === 2 && lf > at + 20;
                return (
                  <Pos key={t} x={180 + i * 540} y={360} w={480}>
                    <div style={{ height: 360, borderRadius: 20, perspective: 800 }}>
                      <div style={{ height: "100%", borderRadius: 20, background: last ? `linear-gradient(160deg, ${P.coral}, ${P.orange})` : "#16181c", border: `2px solid ${i === 2 ? P.orange : "rgba(255,255,255,0.1)"}`, transform: `rotateY(${(1 - fl) * 90}deg)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: last ? `0 0 80px ${P.orange}66` : "none" }}>
                        <div style={{ fontFamily: MONO, fontSize: 30, color: last ? "#1a0b05" : P.orange }}>0{i + 1}</div>
                        <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 64, color: last ? "#1a0b05" : P.white, textAlign: "center", lineHeight: 1 }}>{t}</div>
                      </div>
                    </div>
                  </Pos>
                );
              })}
            </AbsoluteFill>
          );
        }}
      </Shot>
    </>
  );
};

const S4Budget: React.FC<{ f: number }> = ({ f }) => (
  <Shot f={f} a={c("terrible")} b={c("ch4")} fout={14}>
    {(lf, d) => {
      const fill = E.io(lf, 6, d - 30);
      const fade = lin(lf, d - 24, d);
      return (
        <AbsoluteFill>
          <Backdrop f={lf} warm={0.06 + fill * 0.12} />
          <Center y={330}>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, color: "rgba(244,242,238,0.7)", letterSpacing: 6 }}>YOUR PC BUILD BUDGET</div>
            <div style={{ width: 1100, height: 70, borderRadius: 35, background: "rgba(255,255,255,0.06)", marginTop: 30, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div style={{ width: `${30 + fill * 75}%`, height: "100%", background: fill > 0.6 ? `linear-gradient(90deg, ${P.orange}, ${P.coral})` : `linear-gradient(90deg, #6fd39a, ${P.orange})`, boxShadow: `0 0 40px ${P.coral}88` }} />
            </div>
            <div style={{ fontFamily: HEAD, fontWeight: 800, fontSize: 110, color: fill > 0.7 ? P.coral : P.white, marginTop: 30 }}>{fill > 0.7 ? "OVER BUDGET" : "…"}</div>
          </Center>
          <AbsoluteFill style={{ background: `rgba(0,0,0,${fade})` }} />
        </AbsoluteFill>
      );
    }}
  </Shot>
);

export const Scene4: React.FC<{ f: number }> = ({ f }) => {
  if (f < c("ch3") - 2 || f >= c("ch4") + 16) return null;
  return (
    <>
      <S4Card f={f} />
      <S4Hero f={f} />
      <S4NotSame f={f} />
      <S4Hbm f={f} />
      <S4Server f={f} />
      <S4Connected f={f} />
      <S4Micro f={f} />
      <S4Alloc f={f} />
      <S4Trend f={f} />
      <S4Devices f={f} />
      <S4Budget f={f} />
    </>
  );
};
