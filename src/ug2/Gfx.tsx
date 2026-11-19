/**
 * UG-002 "GTA 6 on Mobile?" — motion-graphics kit (original graphics only; no Rockstar/Google/Xbox logos).
 * Every component takes the local frame `f`. `bg` = render its own dark stage (else it is an overlay for footage).
 * Facts: see E:/youtube/gta6-on-phone/script.md (Sources).
 */
import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { Card, Chip, Head, Kicker, pr, sp, Stage, Stamp } from "../ug/blocks";
import { clamp, shake } from "../ug/fx";
import { C, DISPLAY, INTER, MONO } from "../ug/theme";

/* ---------- icons (stroke SVG, 100×100 viewBox) ---------- */
const ico = (paths: React.ReactNode, size: number, color: string, sw = 6) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {paths}
  </svg>
);
type IP = { size?: number; color?: string };
export const IcoPhone = ({ size = 120, color = C.ink }: IP) => ico(<><rect x={30} y={8} width={40} height={84} rx={8} /><path d="M44 80 h12" /></>, size, color);
export const IcoCloud = ({ size = 120, color = C.ink }: IP) => ico(<path d="M28 74 H74 A16 16 0 0 0 72 42 A22 22 0 0 0 30 40 A17 17 0 0 0 28 74 Z" />, size, color);
export const IcoPad = ({ size = 120, color = C.ink }: IP) =>
  ico(<><path d="M24 34 H76 Q92 34 94 58 Q96 80 82 80 Q74 80 66 68 H34 Q26 80 18 80 Q4 80 6 58 Q8 34 24 34 Z" /><path d="M26 50 v14 M19 57 h14" /><circle cx={70} cy={52} r={2.5} /><circle cx={78} cy={60} r={2.5} /></>, size, color);
export const IcoConsole = ({ size = 120, color = C.ink }: IP) => ico(<><rect x={32} y={6} width={36} height={88} rx={6} /><circle cx={50} cy={22} r={5} /><path d="M40 82 h20" /></>, size, color);
export const IcoPc = ({ size = 120, color = C.ink }: IP) => ico(<><rect x={8} y={14} width={84} height={54} rx={5} /><path d="M38 86 h24 M50 68 v18" /></>, size, color);
export const IcoBrowser = ({ size = 120, color = C.ink }: IP) => ico(<><rect x={8} y={14} width={84} height={72} rx={6} /><path d="M8 32 H92" /><circle cx={20} cy={23} r={2} /><circle cx={30} cy={23} r={2} /></>, size, color);
export const IcoSkull = ({ size = 120, color = C.ink }: IP) =>
  ico(<><path d="M20 50 Q20 12 50 12 Q80 12 80 50 Q80 62 70 66 V84 H30 V66 Q20 62 20 50 Z" /><circle cx={38} cy={46} r={8} /><circle cx={62} cy={46} r={8} /><path d="M44 84 v-10 M56 84 v-10" /></>, size, color);
export const IcoWifi = ({ size = 120, color = C.ink }: IP) => ico(<><path d="M10 40 Q50 4 90 40" /><path d="M24 56 Q50 32 76 56" /><path d="M38 70 Q50 60 62 70" /><circle cx={50} cy={82} r={3} /></>, size, color);
export const IcoHome = ({ size = 120, color = C.ink }: IP) => ico(<><path d="M10 50 L50 14 L90 50" /><path d="M22 42 V88 H78 V42" /></>, size, color);
export const IcoTick = ({ size = 80, color = C.green }: IP) => ico(<path d="M18 52 L40 74 L84 26" />, size, color, 12);
export const IcoCross = ({ size = 80, color = C.red }: IP) => ico(<path d="M22 22 L78 78 M78 22 L22 78" />, size, color, 12);

const Bg: React.FC<{ f: number; on?: boolean; accent?: string; x?: number; y?: number }> = ({ f, on, accent, x, y }) => (on ? <Stage f={f} accent={accent} x={x} y={y} /> : null);

/* ---------- 1. Hook: search bar typing the queries everyone is searching ---------- */
const QUERIES = ["gta 6 mobile download", "gta 6 apk android", "how to play gta 6 on phone", "gta 6 cloud gaming mobile"];
export const SearchHook: React.FC<{ f: number; bg?: boolean; per?: number; queries?: string[]; stamp?: string; stampColor?: string }> = ({ f, bg = true, per = 40, queries = QUERIES, stamp = "MILLIONS ARE SEARCHING", stampColor = C.red }) => {
  const i = Math.min(queries.length - 1, Math.floor(f / per));
  const lf = f - i * per;
  const q = queries[i];
  const typed = q.slice(0, Math.floor(interpolate(lf, [0, per * 0.55], [0, q.length], clamp)));
  const caret = Math.floor(f / 8) % 2 === 0;
  const drop = pr(f, per * 0.6, per * 0.8);
  const end = queries.length * per;
  const stampAt = end - 6;
  return (
    <AbsoluteFill>
      <Bg f={f} on={bg} accent="rgba(255,61,82,0.14)" x={50} y={40} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 210 }}>
        <Kicker f={f}>GTA 6 · out now on PS5 & Xbox Series X|S · 19 Nov 2026</Kicker>
        <div
          style={{
            marginTop: 40,
            width: 1240,
            padding: "34px 46px",
            borderRadius: 60,
            background: "#151a21",
            border: "2px solid rgba(255,255,255,0.18)",
            boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            gap: 30,
            transform: `scale(${0.9 + 0.1 * sp(f, 0, 14)})`,
          }}
        >
          <svg width={56} height={56} viewBox="0 0 100 100" fill="none" stroke={C.mute} strokeWidth={10} strokeLinecap="round">
            <circle cx={42} cy={42} r={28} />
            <path d="M64 64 L88 88" />
          </svg>
          <div style={{ fontFamily: INTER, fontWeight: 500, fontSize: 64, color: C.ink, whiteSpace: "nowrap" }}>
            {typed}
            <span style={{ opacity: caret ? 1 : 0, color: C.teal }}>|</span>
          </div>
        </div>
        <div style={{ width: 1180, marginTop: 10, opacity: drop * (f < stampAt ? 1 : 0.4) }}>
          {["", " free", " 2026", " real"].map((s, k) => (
            <div key={k} style={{ fontFamily: INTER, fontSize: 40, color: C.mute, padding: "14px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)", transform: `translateY(${(1 - drop) * -10 * (k + 1)}px)` }}>
              <span style={{ color: "#5d6873", marginRight: 22 }}>↗</span>
              {q}
              <b style={{ color: C.ink }}>{s}</b>
            </div>
          ))}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: shake(f, stampAt, 10, 14) }}>
        <Stamp f={f} at={stampAt} size={130} rot={-7} color={stampColor}>
          {stamp}
        </Stamp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export const SEARCH_HOOK_LEN = QUERIES.length * 40 + 50;

/* ---------- 2. Platforms card ---------- */
const Plat: React.FC<{ f: number; at: number; icon: React.ReactNode; name: string; ok: boolean; note?: string }> = ({ f, at, icon, name, ok, note }) => {
  const s = sp(f, at, 13);
  return (
    <div style={{ width: 360, textAlign: "center", opacity: Math.min(1, s * 1.4), transform: `translateY(${(1 - s) * 50}px)` }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        {icon}
        <div style={{ position: "absolute", right: -40, bottom: -10, transform: `scale(${sp(f, at + 10, 9, 260)})` }}>{ok ? <IcoTick size={86} /> : <IcoCross size={86} />}</div>
      </div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 54, color: ok ? C.ink : C.mute, marginTop: 24, whiteSpace: "nowrap" }}>{name}</div>
      <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 28, color: ok ? C.green : C.red, marginTop: 6, letterSpacing: 2 }}>{note}</div>
    </div>
  );
};
export const Platforms: React.FC<{ f: number; bg?: boolean }> = ({ f, bg = true }) => (
  <AbsoluteFill>
    <Bg f={f} on={bg} />
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 130 }}>
      <Kicker f={f}>Where GTA 6 runs today</Kicker>
      <div style={{ display: "flex", gap: 30, marginTop: 120 }}>
        <Plat f={f} at={8} icon={<IcoConsole size={190} color={C.ink} />} name="PS5" ok note="OUT NOW" />
        <Plat f={f} at={18} icon={<IcoConsole size={190} color={C.ink} />} name="XBOX SERIES X|S" ok note="OUT NOW" />
        <Plat f={f} at={34} icon={<IcoPc size={190} color={C.mute} />} name="PC" ok={false} note="NO DATE YET" />
        <Plat f={f} at={46} icon={<IcoPhone size={190} color={C.mute} />} name="MOBILE" ok={false} note="NO OFFICIAL VERSION" />
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

/* ---------- 3. Verdict board (reused 6×: all "?", then one row at a time, then final) ---------- */
export type Verdict = "?" | "no" | "later" | "scam" | "yes";
export const METHODS = [
  { name: "XBOX CLOUD GAMING", icon: IcoCloud },
  { name: "GEFORCE NOW", icon: IcoPc },
  { name: '"GTA 6 MOBILE APK"', icon: IcoSkull },
  { name: "REMOTE PLAY", icon: IcoPad },
];
const VERDICT: Record<Verdict, { t: string; c: string }> = {
  "?": { t: "?", c: C.mute },
  no: { t: "CONSOLE ONLY", c: C.red },
  later: { t: "NO PC VERSION YET", c: C.red },
  scam: { t: "SCAM", c: C.red },
  yes: { t: "WORKS*", c: C.green },
};
export const VerdictBoard: React.FC<{ f: number; states: Verdict[]; reveal?: number; revealAt?: number; bg?: boolean; footnote?: boolean }> = ({
  f,
  states,
  reveal = -1,
  revealAt = 18,
  bg = true,
  footnote,
}) => (
  <AbsoluteFill>
    <Bg f={f} on={bg} accent="rgba(40,215,255,0.10)" x={50} y={20} />
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 90 }}>
      <Head f={f} size={84} align="center">
        GTA 6 ON YOUR PHONE?
      </Head>
      <div style={{ marginTop: 50, width: 1500, display: "flex", flexDirection: "column", gap: 22 }}>
        {METHODS.map((m, i) => {
          const st = states[i];
          const v = VERDICT[st];
          const isRev = i === reveal;
          const a = pr(f, 4 + i * 5, 18 + i * 5);
          const focus = reveal >= 0 ? (isRev ? 1 : 0.45) : 1;
          const Icon = m.icon;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 36,
                padding: "22px 40px",
                borderRadius: 20,
                background: isRev ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.03)",
                border: `2px solid ${st === "?" ? C.line : v.c}55`,
                opacity: a * focus,
                transform: `translateX(${(1 - a) * -60}px) scale(${isRev ? 1.03 : 1})`,
              }}
            >
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 40, color: C.mute, width: 60 }}>{i + 1}</div>
              <Icon size={84} color={C.ink} />
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 66, color: C.ink, flex: 1 }}>{m.name}</div>
              {st === "?" ? (
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 80, color: C.mute }}>?</div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  {isRev ? (
                    <Stamp f={f} at={revealAt} color={v.c} rot={-4} size={54}>
                      {v.t}
                    </Stamp>
                  ) : (
                    <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 54, color: v.c, letterSpacing: 2 }}>{v.t}</div>
                  )}
                  {(!isRev || f >= revealAt) && (st === "yes" ? <IcoTick size={70} /> : st === "scam" ? <IcoSkull size={70} color={C.red} /> : <IcoCross size={66} />)}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {footnote ? (
        <div style={{ marginTop: 36, fontFamily: INTER, fontWeight: 600, fontSize: 34, color: C.mute, opacity: pr(f, 30, 44) }}>* needs your own PS5 or Xbox Series X|S + the game</div>
      ) : null}
    </AbsoluteFill>
  </AbsoluteFill>
);

/* ---------- 4. Method title card ---------- */
export const MethodCard: React.FC<{ f: number; n: number; len?: number }> = ({ f, n, len = 54 }) => {
  const m = METHODS[n - 1];
  const inP = pr(f, 0, 14);
  const out = pr(f, len - 6, len + 6);
  const Icon = m.icon;
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      <Stage f={f} accent={n === 3 ? "rgba(255,61,82,0.16)" : n === 4 ? "rgba(53,242,154,0.12)" : "rgba(40,215,255,0.12)"} x={25} y={50} />
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 170 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 60, opacity: inP, transform: `translateX(${(1 - inP) * 80}px)` }}>
          <div style={{ transform: `scale(${sp(f, 2, 11)})` }}>
            <Icon size={300} color={n === 3 ? C.red : n === 4 ? C.green : C.teal} />
          </div>
          <div>
            <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 48, letterSpacing: 10, color: C.amber }}>METHOD {n}</div>
            <div style={{ height: 4, width: 640 * pr(f, 6, 30), background: C.amber, margin: "16px 0 20px", boxShadow: `0 0 20px ${C.amber}` }} />
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 130, lineHeight: 1, color: C.ink }}>{m.name}</div>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- 5. Xbox Cloud: console-only at launch ---------- */
export const CloudConsoleOnly: React.FC<{ f: number; bg?: boolean }> = ({ f, bg = true }) => {
  const items = [
    { icon: IcoConsole, name: "XBOX", ok: true, at: 10 },
    { icon: IcoPhone, name: "PHONES", ok: false, at: 34 },
    { icon: IcoBrowser, name: "BROWSER", ok: false, at: 44 },
    { icon: IcoPc, name: "PC", ok: false, at: 54 },
  ];
  return (
    <AbsoluteFill>
      <Bg f={f} on={bg} accent="rgba(40,215,255,0.10)" x={50} y={30} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 }}>
        <Kicker f={f}>Xbox Cloud Gaming · GTA 6 at launch</Kicker>
        <Head f={f} at={4} size={92} align="center">
          WHERE CAN YOU STREAM IT?
        </Head>
        <div style={{ display: "flex", gap: 50, marginTop: 90 }}>
          {items.map((it, i) => {
            const s = sp(f, it.at, 12);
            const Icon = it.icon;
            return (
              <div key={i} style={{ width: 330, height: 380, borderRadius: 28, border: `3px solid ${it.ok ? C.green : C.red}88`, background: "rgba(255,255,255,0.03)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", opacity: Math.min(1, s * 1.4), transform: `scale(${0.8 + 0.2 * s})` }}>
                <div style={{ position: "relative" }}>
                  <Icon size={170} color={it.ok ? C.ink : C.mute} />
                  <div style={{ position: "absolute", right: -46, bottom: -16, transform: `scale(${sp(f, it.at + 8, 9, 260)})` }}>{it.ok ? <IcoTick size={90} /> : <IcoCross size={90} />}</div>
                </div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, marginTop: 34, color: it.ok ? C.ink : C.mute }}>{it.name}</div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 60, opacity: pr(f, 70, 84) }}>
          <Chip f={f} at={70} bg={C.amber} fg="#111" size={40}>
            You still need an Xbox + the game
          </Chip>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- 6. Scam: 3 red flags ---------- */
const FLAGS = [
  { t: "A download link for an .APK file", d: "There is no official GTA 6 for Android or iPhone." },
  { t: '"Allow installs from unknown sources"', d: "That's how malware gets onto your phone." },
  { t: '"Verify you are human"', d: "A form that collects your details and phone number." },
];
export const RedFlags: React.FC<{ f: number; bg?: boolean; gap?: number; ats?: number[] }> = ({ f, bg = true, gap = 50, ats }) => (
  <AbsoluteFill>
    <Bg f={f} on={bg} accent="rgba(255,61,82,0.18)" x={15} y={20} />
    <AbsoluteFill style={{ padding: "100px 150px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
        <IcoSkull size={110} color={C.red} />
        <Head f={f} size={110} color={C.red}>
          3 RED FLAGS
        </Head>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 30, marginTop: 50 }}>
        {FLAGS.map((x, i) => {
          const at = ats ? ats[i] : 16 + i * gap;
          const s = sp(f, at, 14);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 40, padding: "28px 40px", borderRadius: 22, background: "rgba(255,61,82,0.08)", border: `2px solid ${C.red}66`, opacity: Math.min(1, s * 1.4), transform: `translateX(${(1 - s) * 120}px)` }}>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 84, color: C.red, width: 90 }}>{i + 1}</div>
              <div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 70, color: C.ink }}>{x.t}</div>
                <div style={{ fontFamily: INTER, fontWeight: 500, fontSize: 38, color: C.mute, marginTop: 6 }}>{x.d}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);

/* ---------- 7. What the fake apps do ---------- */
export const ScamTypes: React.FC<{ f: number; bg?: boolean; ats?: number[]; stampAt?: number }> = ({ f, bg = true, ats = [8, 40, 72], stampAt = 110 }) => {
  const cards = [
    { h: "AD-SPAM APPS", d: "Screenshots of GTA 6 wrapped in ads. No game.", c: C.amber, at: ats[0] },
    { h: "SMS-STEALING MALWARE", d: "Reads your messages, including bank & UPI OTPs.", c: C.red, at: ats[1] },
    { h: '"HUMAN VERIFICATION"', d: "Harvests your personal details. Still no game.", c: C.red, at: ats[2] },
  ];
  return (
    <AbsoluteFill>
      <Bg f={f} on={bg} accent="rgba(255,61,82,0.14)" x={50} y={30} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 110 }}>
        <Kicker f={f} color={C.red}>
          What &quot;GTA 6 Mobile&quot; downloads really are
        </Kicker>
        <div style={{ display: "flex", gap: 40, marginTop: 80 }}>
          {cards.map((c, i) => (
            <Card key={i} f={f} at={c.at} w={500} border={`${c.c}88`}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, color: c.c, lineHeight: 1.05 }}>{c.h}</div>
              <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 38, color: C.ink, marginTop: 20, lineHeight: 1.3 }}>{c.d}</div>
            </Card>
          ))}
        </div>
        <div style={{ marginTop: 80 }}>
          <Stamp f={f} at={stampAt} size={76} rot={-3} color={C.red}>
            ONLY BUY FROM PS STORE / XBOX STORE
          </Stamp>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- 8. Already installed one? ---------- */
export const IfInstalled: React.FC<{ f: number; bg?: boolean; gap?: number }> = ({ f, bg = true, gap = 22 }) => {
  const steps = ["Uninstall the app now", "Change your passwords — from another device", "Check your bank & UPI apps for strange activity", "Use an authenticator app instead of SMS codes"];
  return (
    <AbsoluteFill>
      <Bg f={f} on={bg} accent="rgba(255,182,72,0.12)" x={20} y={30} />
      <AbsoluteFill style={{ padding: "120px 170px" }}>
        <Kicker f={f} color={C.amber}>
          Already installed one?
        </Kicker>
        <Head f={f} at={4} size={100}>
          DO THIS NOW
        </Head>
        <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: 50 }}>
          {steps.map((s, i) => {
            const a = pr(f, 20 + i * gap, 34 + i * gap);
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 30, opacity: a, transform: `translateX(${(1 - a) * 40}px)` }}>
                <div style={{ width: 70, height: 70, borderRadius: 14, border: `4px solid ${C.green}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ transform: `scale(${sp(f, 30 + i * gap, 9, 260)})` }}>
                    <IcoTick size={56} />
                  </div>
                </div>
                <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 56, color: C.ink }}>{s}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- 9. How Remote Play works ---------- */
export const RemotePlayDiagram: React.FC<{ f: number; bg?: boolean }> = ({ f, bg = true }) => {
  const flow = pr(f, 40, 90);
  const dots = Array.from({ length: 7 }, (_, i) => ((f * 0.02 + i / 7) % 1));
  return (
    <AbsoluteFill>
      <Bg f={f} on={bg} accent="rgba(53,242,154,0.10)" x={50} y={40} />
      <AbsoluteFill style={{ alignItems: "center", paddingTop: 100 }}>
        <Kicker f={f} color={C.green}>
          How Remote Play works
        </Kicker>
        <div style={{ position: "relative", width: 1600, height: 640, marginTop: 50 }}>
          {/* home + console */}
          <div style={{ position: "absolute", left: 40, top: 60, width: 460, textAlign: "center", opacity: pr(f, 6, 20) }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <IcoHome size={300} color={C.mute} />
              <div style={{ position: "absolute", left: 95, top: 120 }}>
                <IcoConsole size={140} color={C.ink} />
              </div>
            </div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, color: C.ink, marginTop: 10 }}>YOUR PS5 / XBOX</div>
            <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 36, color: C.green, marginTop: 6 }}>the game runs HERE</div>
          </div>
          {/* link */}
          <div style={{ position: "absolute", left: 540, top: 250, width: 520, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.12)" }}>
            <div style={{ width: `${flow * 100}%`, height: "100%", borderRadius: 4, background: C.green, boxShadow: `0 0 24px ${C.green}` }} />
            {flow >= 1 && dots.map((d, i) => <div key={i} style={{ position: "absolute", left: `${d * 100}%`, top: -8, width: 24, height: 24, borderRadius: 12, background: C.green, opacity: 0.8 }} />)}
          </div>
          <div style={{ position: "absolute", left: 700, top: 120, opacity: pr(f, 30, 44) }}>
            <IcoWifi size={180} color={C.teal} />
          </div>
          <div style={{ position: "absolute", left: 590, top: 300, width: 420, textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 30, color: C.mute, opacity: pr(f, 50, 64) }}>
            video stream + your button presses
          </div>
          {/* phone */}
          <div style={{ position: "absolute", left: 1100, top: 60, width: 460, textAlign: "center", opacity: pr(f, 60, 74) }}>
            <div style={{ display: "inline-flex", alignItems: "flex-end" }}>
              <IcoPhone size={300} color={C.ink} />
              <IcoPad size={150} color={C.mute} />
            </div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, color: C.ink, marginTop: 10 }}>YOUR PHONE</div>
            <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 36, color: C.teal, marginTop: 6 }}>you just watch & control it</div>
          </div>
        </div>
        <div style={{ marginTop: -20, opacity: pr(f, 100, 114) }}>
          <Chip f={f} at={100} bg={C.amber} fg="#111" size={40}>
            Best on home Wi-Fi · works on mobile data, with more lag
          </Chip>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- 10. Price card (India) ---------- */
export type ConsolePrice = { name: string; price: string | null; note?: string; warn?: boolean };
export const PriceCard: React.FC<{ f: number; bg?: boolean; consoles: ConsolePrice[] }> = ({ f, bg = true, consoles }) => (
  <AbsoluteFill>
    <Bg f={f} on={bg} accent="rgba(255,182,72,0.12)" x={25} y={30} />
    <AbsoluteFill style={{ padding: "100px 140px" }}>
      <Kicker f={f} color={C.amber}>
        What it costs in India · Nov 2026
      </Kicker>
      <div style={{ display: "flex", gap: 40, marginTop: 40 }}>
        <Card f={f} at={6} w={620}>
          <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 32, color: C.mute, letterSpacing: 3 }}>GTA 6 · STANDARD</div>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 120, color: C.ink }}>₹5,999</div>
        </Card>
        <Card f={f} at={16} w={620}>
          <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 32, color: C.mute, letterSpacing: 3 }}>GTA 6 · ULTIMATE</div>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 120, color: C.ink }}>₹7,499</div>
        </Card>
      </div>
      <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 32, color: C.mute, letterSpacing: 3, marginTop: 56, opacity: pr(f, 30, 42) }}>+ A CONSOLE</div>
      <div style={{ display: "flex", gap: 30, marginTop: 18 }}>
        {consoles.map((c, i) => {
          const a = pr(f, 36 + i * 10, 50 + i * 10);
          return (
            <div key={i} style={{ flex: 1, padding: "26px 32px", borderRadius: 20, border: `2px solid ${c.warn ? C.red : C.line}`, background: "rgba(255,255,255,0.03)", opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 50, color: C.ink }}>{c.name}</div>
              <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 60, color: c.price ? C.ink : C.amber, marginTop: 6 }}>{c.price ?? "₹ — TBC"}</div>
              {c.note ? <div style={{ fontFamily: INTER, fontWeight: 700, fontSize: 30, color: c.warn ? C.red : C.mute, marginTop: 10 }}>{c.note}</div> : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
export const CONSOLES_TBC: ConsolePrice[] = [
  { name: "PS5", price: null },
  { name: "XBOX SERIES X", price: null },
  { name: "XBOX SERIES S", price: null, note: "≈720p · often under 30 fps (Digital Foundry)", warn: true },
];

/* ---------- 11. Lower thirds / overlays ---------- */
export const LowerThird: React.FC<{ f: number; title: string; sub?: string; color?: string; len?: number }> = ({ f, title, sub, color = C.teal, len = 120 }) => {
  const a = pr(f, 0, 12) * (1 - pr(f, len - 10, len));
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 0 90px 90px" }}>
      <div style={{ display: "flex", opacity: a, transform: `translateX(${(1 - a) * -60}px)` }}>
        <div style={{ width: 10, background: color, borderRadius: 4, boxShadow: `0 0 20px ${color}` }} />
        <div style={{ padding: "16px 30px", background: "rgba(5,7,10,0.86)", borderRadius: "0 14px 14px 0" }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 54, color: C.ink }}>{title}</div>
          {sub ? <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 30, color: C.mute, marginTop: 2 }}>{sub}</div> : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const SubscribeNudge: React.FC<{ f: number; text: string; len?: number }> = ({ f, text, len = 150 }) => {
  const s = sp(f, 0, 12) * (1 - pr(f, len - 10, len));
  const click = f > 40 && f < len - 10;
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-end", padding: "0 90px 90px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 26, padding: "18px 26px", borderRadius: 18, background: "rgba(5,7,10,0.9)", border: `1px solid ${C.line}`, opacity: Math.min(1, s * 1.3), transform: `translateY(${(1 - s) * 60}px)` }}>
        <div style={{ padding: "14px 28px", borderRadius: 40, background: click ? "#2a2f36" : C.red, fontFamily: INTER, fontWeight: 800, fontSize: 34, color: "#fff", transform: `scale(${f > 38 && f < 46 ? 0.92 : 1})` }}>{click ? "SUBSCRIBED ✓" : "SUBSCRIBE"}</div>
        <div style={{ fontFamily: INTER, fontWeight: 600, fontSize: 32, color: C.ink, maxWidth: 620 }}>{text}</div>
      </div>
    </AbsoluteFill>
  );
};

/** On-screen credit for footage used with permission. */
export const CreditTag: React.FC<{ f: number; text: string }> = ({ f, text }) => (
  <AbsoluteFill style={{ alignItems: "flex-end", padding: "40px 46px" }}>
    <div style={{ padding: "8px 18px", borderRadius: 10, background: "rgba(5,7,10,0.75)", fontFamily: MONO, fontWeight: 700, fontSize: 24, color: C.ink, opacity: pr(f, 0, 10) }}>{text}</div>
  </AbsoluteFill>
);
