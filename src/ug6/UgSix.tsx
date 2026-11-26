/**
 * UG-006 "No More RTX 50 GPUs? The RAM Crisis of 2030" — master composition.
 * Timeline = the creator's ElevenLabs narration (public/ug-006/audio/narration.mp3, untouched).
 * Music: Kevin MacLeod (incompetech.com, CC BY 4.0). SFX: Mixkit (Mixkit License).
 */
import { Audio } from "@remotion/media";
import React from "react";
import { AbsoluteFill, Freeze, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { c } from "./Core6";
import { Captions, clamp, Grain, MONO, Vignette, type Cap } from "./Look6";
import { P } from "./Three6";
import { Scene1, Scene2 } from "./SceneA";
import { Scene3, Scene4 } from "./SceneB";
import { Scene5, Scene6, Scene7 } from "./SceneC";
import { CAPTIONS, TOTAL_FRAMES, VO_FRAMES, VOX } from "./ug006.data";

export const UG006_FRAMES = TOTAL_FRAMES;

/* ===================================================================== picture */
const Picture: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ backgroundColor: P.bg }}>
    <Scene1 f={f} />
    <Scene2 f={f} />
    <Scene3 f={f} />
    <Scene4 f={f} />
    <Scene5 f={f} />
    <Scene6 f={f} />
    <Scene7 f={f} />
  </AbsoluteFill>
);

/** Captions hidden while big on-screen type would collide (chapter cards, title, final words, CTA). */
const HIDE: [string, number][] = [];
const hideCaps = (f: number) => {
  if (f < c("imagine") - 4) return true;
  for (const k of ["ch1", "ch2", "ch3", "ch4", "ch5", "ch6"]) if (f >= c(k) && f < c(k) + 75) return true;
  if (f >= c("balance") && f < c("whatthink")) return true;
  if (f >= c("whatthink")) return true;
  void HIDE;
  return false;
};

/* ===================================================================== sound */
const S = (n: string) => `ug-006/sfx/${n}.mp3`;
const M = (n: string) => `ug-006/music/${n}.mp3`;
const voice = (fr: number) => {
  let s = 0;
  for (let k = -8; k <= 8; k++) s += VOX.charCodeAt(Math.max(0, Math.min(VOX.length - 1, fr + k))) === 49 ? 1 : 0;
  return s / 17;
};
/** [file, from, to, level] — beds crossfade over FADE frames. */
const FADE = 45;
const MUSIC: [string, number, number, number][] = [
  [M("Lightless_Dawn"), 0, c("ch1") + 20, 0.26],
  [M("Investigations"), c("ch1"), c("ch2") + 20, 0.22],
  [M("Echoes_of_Time"), c("ch2"), c("ch3") + 20, 0.22],
  [M("Stormfront"), c("ch3"), c("ch4") + 20, 0.2],
  [M("Five_Armies"), c("ch4"), c("ch5") + 20, 0.22],
  [M("Healing"), c("ch5"), c("ch6") + 20, 0.2],
  [M("Lasting_Hope"), c("ch6"), c("battle") + 20, 0.22],
  [M("Heroic_Age"), c("battle"), TOTAL_FRAMES, 0.26],
];
/** [frame, file, volume, durationFrames?(loops beds)] */
type Sfx = [number, string, number, number?];
const CH = ["ch1", "ch2", "ch3", "ch4", "ch5", "ch6"];
const SFX: Sfx[] = [
  // S1
  [0, S("bass_rumble"), 0.45],
  [8, S("trailer_impact"), 0.5],
  ...[-30, -22, -14, -6].map((d) => [c("t2030") + d, S("ui_click"), 0.25] as Sfx),
  [c("t2030") + 4, S("epic_impact"), 0.45],
  [c("imagine"), S("computer_amb"), 0.12, c("discover") - c("imagine")],
  [c("dream") + 6, S("power_up"), 0.45],
  [c("unavail") - 22, S("reverse_impact"), 0.4],
  [c("unavail"), S("hammer"), 0.45],
  [c("hundreds"), S("coins"), 0.35],
  [c("ramprice"), S("slot_wheel"), 0.35],
  [c("luxury") - 6, S("glass_metal"), 0.4],
  [c("ordinary"), S("whoosh_air"), 0.35],
  [c("bigger"), S("deep_impact"), 0.55],
  [c("nvred"), S("engine_hum"), 0.18, c("shift") - c("nvred")],
  [c("nvred") + 20, S("metal_door"), 0.35],
  [c("shift"), S("swell"), 0.35],
  [c("forecast"), S("whoosh_tunnel"), 0.35],
  [c("y2029"), S("ui_tone"), 0.4],
  [c("y2030a"), S("ui_tone"), 0.4],
  [c("q1"), S("ui_select"), 0.3],
  [c("q2"), S("ui_select"), 0.3],
  [c("q3"), S("ui_select"), 0.3],
  [c("ch1") - 12, S("whoosh_fast"), 0.5],
  // chapter cards
  ...CH.flatMap((k) => [[c(k), S("big_impact"), 0.42] as Sfx, [c(k) + 6, S("sweep_cine"), 0.3] as Sfx]),
  // S2
  [c("ch1") + 150, S("machine_activate"), 0.35],
  [c("blackwell"), S("whoosh_tunnel"), 0.35],
  [c("blackwell") + 20, S("calculations"), 0.25],
  [c("hands"), S("glass_metal"), 0.3],
  [c("hands") + 30, S("hammer"), 0.35],
  [c("reports"), S("workshop_amb"), 0.22, c("pct2030") - 40 - c("reports")],
  [c("reports") + 20, S("robot_mech"), 0.3],
  [c("onereport"), S("tape_rewind"), 0.3],
  [c("pct2030") + 2, S("epic_impact"), 0.45],
  [c("detail"), S("glitch_text"), 0.3],
  [c("chinese"), S("ui_tone"), 0.3],
  [c("notconf"), S("ui_tone"), 0.3],
  [c("worldwide") - 10, S("ui_tone"), 0.3],
  [c("firstwarn") + 16, S("bleep"), 0.3],
  [c("firstwarn") + 30, S("bleep"), 0.3],
  [c("limited"), S("swell"), 0.3],
  [c("pinc") - 8, S("tech_slide"), 0.35],
  [c("wait"), S("ui_click"), 0.4],
  [c("paymore") - 6, S("ui_click"), 0.4],
  [c("older"), S("heartbeat_impact"), 0.4],
  [c("whynv") + 10, S("riser_heli"), 0.3],
  // S3
  [c("decades") + 8, S("ui_select"), 0.3],
  [c("rendering") - 6, S("ui_select"), 0.3],
  [c("scientific"), S("ui_select"), 0.3],
  [c("today"), S("computer_amb"), 0.22, c("nvsupply") - c("today")],
  [c("ai"), S("trailer_whoosh_hit"), 0.45],
  [c("thousands"), S("whoosh_air"), 0.35],
  [c("nvsupply") + 10, S("metal_door"), 0.3],
  [c("nvsupply") + 30, S("robot_mech"), 0.3],
  [c("revenue"), S("coins"), 0.3],
  [c("revenue") + 4, S("swell"), 0.3],
  [c("complicated") + 6, S("mech_move"), 0.35],
  [c("memory1"), S("bass_pulse"), 0.35],
  [c("constrained"), S("whoosh_metal"), 0.3],
  [c("worth") + 24, S("hammer"), 0.45],
  [c("incentive"), S("ui_tone"), 0.3],
  [c("company"), S("crate_pickup"), 0.35],
  [c("company") + 30, S("crate_pickup"), 0.35],
  [c("pressure") + 8, S("whoosh_tunnel"), 0.4],
  [c("pressure") + 40, S("deep_impact"), 0.45],
  [c("statement"), S("ui_tone"), 0.3],
  [c("avail"), S("click_scifi"), 0.3],
  [c("avail") + 22, S("click_scifi"), 0.3],
  [c("half"), S("whoosh_metal"), 0.35],
  [c("memind"), S("hammer_metal"), 0.4],
  // S4
  [c("pressure2"), S("metal_door"), 0.3],
  [c("samesticks") - 8, S("glitch_break"), 0.3],
  [c("hbm"), S("whoosh_tunnel"), 0.45],
  [c("hbmdesign"), S("swell"), 0.3],
  [c("serverdram"), S("metal_door"), 0.3],
  [c("different"), S("ui_select"), 0.3],
  [c("connected"), S("sweep_cine"), 0.35],
  [c("capacity"), S("whoosh_air"), 0.4],
  [c("capacity") + 10, S("calculations"), 0.25],
  [c("incent2") + 20, S("tech_slide"), 0.3],
  [c("pct1015") - 30, S("bass_pulse"), 0.3],
  [c("pct1015") + 20, S("epic_impact"), 0.4],
  [c("decline"), S("bleep"), 0.3],
  ...["laptops", "phones", "consoles", "gcards", "electronics"].map((k) => [c(k), S("ui_click"), 0.3] as Sfx),
  [c("reduce"), S("tech_slide"), 0.3],
  [c("pass"), S("tech_slide"), 0.3],
  [c("pass") + 20, S("hammer"), 0.35],
  [c("terrible"), S("heartbeat_impact"), 0.4],
  // S5
  [c("ch4"), S("bass_rumble"), 0.35],
  [c("youthink") + 40, S("construction_done"), 0.35],
  [c("dontwork"), S("glitch_rewind"), 0.45],
  [c("dontwork") + 18, S("hammer"), 0.45],
  [c("years"), S("construction_amb"), 0.2, c("evenafter") - c("years")],
  [c("billions") - 10, S("coins"), 0.35],
  [c("evenafter"), S("machine_hum"), 0.18, c("deloitte") - c("evenafter")],
  ...["install", "qualify", "yields", "output"].map((k) => [c(k), S("ui_select"), 0.3] as Sfx),
  [c("deloitte"), S("whoosh_air"), 0.3],
  [c("d2029"), S("ui_tone"), 0.35],
  [c("newyork"), S("bleep"), 0.35],
  [c("m2030"), S("epic_impact"), 0.4],
  [c("noimprove") - 6, S("whoosh_fast2"), 0.35],
  [c("noimprove") + 16, S("hammer"), 0.4],
  ...["rise", "fall", "stabilize"].map((k) => [c(k), S("ui_tone"), 0.3] as Sfx),
  [c("unpredict"), S("bass_pulse"), 0.35],
  // S6
  [c("ch5") + 4, S("crate_pickup"), 0.3],
  ...["cpu", "gpu", "ram32", "ssd"].map((k) => [c(k), S("ui_select"), 0.3] as Sfx),
  [c("mostexp"), S("tech_slide"), 0.3],
  [c("whathappens"), S("slot_wheel"), 0.3],
  [c("entire"), S("heartbeat_impact"), 0.45],
  [c("worst"), S("stapler"), 0.35],
  [c("worst") + 10, S("stapler"), 0.35],
  [c("upgrade"), S("whoosh_tunnel"), 0.3],
  ...["keep", "lowercap"].map((k) => [c(k), S("whoosh_air"), 0.3] as Sfx),
  [c("consoles2") - 30, S("whoosh_air"), 0.3],
  [c("postpone") + 10, S("hammer"), 0.35],
  // S7
  ...[0, 12, 24].map((d) => [c("amd") + d, S("metal_door"), 0.3] as Sfx),
  [c("magic"), S("glitch_text"), 0.3],
  [c("intercon"), S("deep_impact"), 0.45],
  [c("no"), S("big_impact"), 0.65],
  ...["archs", "expand", "competition"].map((k) => [c(k), S("ui_select"), 0.3] as Sfx),
  [c("competing") - 20, S("robot_mech"), 0.3],
  [c("sametech"), S("sweep_cine"), 0.35],
  ...["warn1", "warn2", "warn3"].map((k) => [c(k), S("trailer_impact"), 0.3] as Sfx),
  [c("soif"), S("power_up"), 0.3],
  [c("battle"), S("whoosh_tunnel"), 0.4],
  [c("balance") - 10, S("riser_heli"), 0.3],
  [c("paying") - 6, S("epic_impact"), 0.65],
  [c("subscribe") - 8, S("ui_click"), 0.4],
];

const Mix: React.FC = () => (
  <>
    <Audio src={staticFile("ug-006/audio/narration.mp3")} volume={1} />
    {MUSIC.map(([file, a, b, lvl], i) => {
      const dur = b - a + FADE;
      return (
        <Sequence key={file + i} from={a} durationInFrames={dur} layout="none">
          <Audio
            src={staticFile(file)}
            loop
            volume={(fr) => {
              const abs = fr + a;
              const base = lvl * (1 - 0.55 * voice(abs));
              const fin = interpolate(fr, [0, FADE], [0, 1], clamp);
              const fout = interpolate(fr, [dur - FADE, dur], [1, 0], clamp);
              const tail = interpolate(abs, [TOTAL_FRAMES - 75, TOTAL_FRAMES - 3], [1, 0], clamp);
              return Math.max(0, base) * fin * fout * tail;
            }}
          />
        </Sequence>
      );
    })}
    {SFX.map(([at, src, v, dur], i) => (
      <Sequence key={i} from={Math.max(0, at)} durationInFrames={dur ?? 240} layout="none">
        <Audio
          src={staticFile(src)}
          loop={dur !== undefined}
          volume={(fr) => (dur !== undefined ? v * interpolate(fr, [0, 20, dur - 20, dur], [0, 1, 1, 0], clamp) : v)}
        />
      </Sequence>
    ))}
  </>
);

/* ===================================================================== root */
export const UgSix: React.FC<{ audio?: boolean; offset?: number }> = ({ audio = true, offset = 0 }) => {
  const f = useCurrentFrame() + offset;
  return (
    <AbsoluteFill style={{ backgroundColor: P.bg }}>
      <Picture f={f} />
      <Vignette k={0.5} />
      <Grain opacity={0.05} />
      {f < VO_FRAMES + 10 ? <Captions caps={CAPTIONS as Cap[]} hide={hideCaps} /> : null}
      {audio ? (
        <Sequence from={-offset} layout="none">
          <Mix />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

/* ===================================================================== previews */
export const SCENES: { id: string; a: () => number; b: () => number }[] = [
  { id: "S1", a: () => 0, b: () => c("ch1") },
  { id: "S2", a: () => c("ch1"), b: () => c("ch2") },
  { id: "S3", a: () => c("ch2"), b: () => c("ch3") },
  { id: "S4", a: () => c("ch3"), b: () => c("ch4") },
  { id: "S5", a: () => c("ch4"), b: () => c("ch5") },
  { id: "S6", a: () => c("ch5"), b: () => c("possib") },
  { id: "S7", a: () => c("possib"), b: () => TOTAL_FRAMES },
];
/** QC contact sheet: 3 frames per ~4 s window → one frame per output frame. */
const SAMPLES = Array.from({ length: Math.floor(TOTAL_FRAMES / 90) }, (_, i) => i * 90 + 45);
export const UG006_SHEET_FRAMES = SAMPLES.length;
export const UgSixSheet: React.FC = () => {
  const f = useCurrentFrame();
  const t = SAMPLES[Math.min(f, SAMPLES.length - 1)];
  return (
    <AbsoluteFill>
      <Freeze frame={t}>
        <UgSix audio={false} />
      </Freeze>
      <div style={{ position: "absolute", right: 10, top: 10, padding: "4px 10px", background: "#ff0", color: "#000", fontFamily: MONO, fontSize: 22, fontWeight: 800 }}>
        {Math.floor(t / 1800)}:{String(Math.floor((t / 30) % 60)).padStart(2, "0")} · f{t}
      </div>
    </AbsoluteFill>
  );
};
