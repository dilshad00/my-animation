/**
 * SH-DDR6 — "DDR6 is coming… but your next gaming PC might still be stuck with DDR5" (YouTube Short).
 * Narration: Higgs Audio v2 expressive take, pauses tightened (public/short-ddr6/audio/narration.wav).
 * Music: Kevin MacLeod (incompetech.com, CC BY 4.0). SFX: Mixkit (Mixkit License).
 */
import React from "react";
import { makeSheet, Mix, ShortMaster, type Bed, type SCap, type Sfx } from "../engine/Engine";
import { CAPTIONS, TOTAL_FRAMES, VO_FRAMES, VOX } from "./data";
import { BEAT_STARTS, c, Picture } from "./Scenes";

export const SH_DDR6_FRAMES = TOTAL_FRAMES;
const S = (n: string) => `ug-006/sfx/${n}.mp3`;
const MU = (n: string) => `ug-006/music/${n}.mp3`;

const BEDS: Bed[] = [
  [MU("Investigations"), 0, c("question") + 10, 0.2],
  [MU("Heroic_Age"), c("question"), TOTAL_FRAMES, 0.24],
];
const SFX: Sfx[] = [
  [0, S("trailer_impact"), 0.55],
  [0, S("bass_rumble"), 0.4],
  [4, S("sweep_cine"), 0.3],
  [c("pc") - 4, S("whoosh_fast"), 0.45],
  [c("pc") + 6, S("power_up"), 0.4],
  [c("stuck") - 4, S("whoosh_air"), 0.3],
  [c("ddr5a") - 4, S("hammer_metal"), 0.5],
  [c("ddr5a"), S("hammer"), 0.35],
  [c("gen") - 2, S("shutter"), 0.35],
  [c("gen") + 4, S("typing"), 0.18, 60],
  [c("prev"), S("stapler"), 0.45],
  [c("perf"), S("riser_heli"), 0.3],
  [c("serious") + 15, S("epic_impact"), 0.5],
  [c("called") - 2, S("shutter"), 0.3],
  [c("called") + 6, S("swell"), 0.35],
  [c("std") - 4, S("whoosh_tunnel"), 0.35],
  [c("std"), S("tech_hum"), 0.15, c("catch") - c("std")],
  [c("pct") - 2, S("slot_wheel"), 0.35],
  [c("pct") + 14, S("whoosh_impact"), 0.45],
  [c("launch") - 4, S("ui_tone"), 0.3],
  [c("catch") - 2, S("glitch_rewind"), 0.5],
  [c("catch") + 2, S("big_impact"), 0.5],
  [c("dev"), S("machine_hum"), 0.18, c("buy") - c("dev")],
  [c("dev") + 4, S("welding"), 0.2],
  [c("buy"), S("ui_select"), 0.35],
  [c("buy") + 44, S("bleep"), 0.4],
  [c("tomorrow") - 4, S("ui_click"), 0.35],
  [c("tomorrow") + 10, S("stapler"), 0.4],
  [c("arrive"), S("crate_pickup"), 0.4],
  [c("arrive") + 12, S("swell"), 0.3],
  [c("cpu"), S("mech_move"), 0.35],
  [c("cpu") + 20, S("click_scifi"), 0.35],
  [c("mobo") + 7, S("whoosh_metal"), 0.35],
  [c("mobo") + 12, S("machine_activate"), 0.3],
  [c("existing"), S("tech_slide"), 0.3],
  [c("magic") + 8, S("glitch_break"), 0.45],
  [c("magic") + 10, S("heartbeat_impact"), 0.4],
  [c("another"), S("deep_impact"), 0.55],
  [c("another") + 2, S("bleep"), 0.25],
  [c("waiting"), S("countdown"), 0.2, c("ai") - c("waiting")],
  [c("ai") - 6, S("whoosh_tunnel"), 0.45],
  [c("ai"), S("computer_amb"), 0.2, c("pressure") - c("ai")],
  [c("enormous") - 2, S("swell"), 0.4],
  [c("pressure"), S("robot_mech"), 0.35],
  [c("pressure") + 40, S("hammer_metal"), 0.45],
  [c("means"), S("power_up"), 0.3],
  [c("cheaper"), S("whoosh_fast2"), 0.35],
  [c("ram") - 4, S("coins"), 0.35],
  [c("ram") + 16, S("stapler"), 0.4],
  [c("question"), S("bass_pulse"), 0.45],
  [c("faster"), S("whoosh_air"), 0.4],
  [c("faster") + 29, S("whoosh_impact"), 0.4],
  [c("aff") - 6, S("whoosh_air"), 0.35],
  [c("aff") + 6, S("coins"), 0.3],
  [c("actually") + 10, S("ui_select"), 0.35],
  [c("because"), S("mech_move"), 0.3],
  [c("second"), S("epic_impact"), 0.55],
  [VO_FRAMES, S("trailer_whoosh_hit"), 0.4],
  [VO_FRAMES + 8, S("ui_click"), 0.4],
];

/** Accent words in captions. */
const ACCENT = /^(DDR6|DDR5|50%|catch|AI|RAM|cheaper|faster|affordable|problem|development|tomorrow|compatible|magically|enormous|pressure|question|second)$/i;
/** Hide captions where big type on screen already says the same words. */
const hideCaps = (f: number) => (f >= c("catch") && f < c("dev")) || (f >= c("another") && f < c("waiting"));
/** Topic chip is hidden while a beat uses the top band for a big title. */
const hideChip = (f: number) => f < c("pc") || (f >= c("catch") && f < c("dev")) || f >= c("faster");

export const Ddr6Short: React.FC<{ audio?: boolean; offset?: number }> = ({ audio = true, offset = 0 }) => (
  <ShortMaster
    offset={offset}
    audio={audio}
    total={TOTAL_FRAMES}
    voFrames={VO_FRAMES}
    picture={(f) => <Picture f={f} />}
    caps={CAPTIONS as SCap[]}
    accent={ACCENT}
    hideCaps={hideCaps}
    topic="DDR6 · MEMORY"
    hideChip={hideChip}
    mix={<Mix narration="short-ddr6/audio/narration.wav" beds={BEDS} sfx={SFX} vox={VOX} total={TOTAL_FRAMES} />}
  />
);

/** QC sheet: one still per beat (mid-beat + 1 s in). */
const SAMPLES = (() => {
  const s = BEAT_STARTS();
  return s.map((a, i) => Math.min(TOTAL_FRAMES - 1, Math.round(i + 1 < s.length ? a + Math.min(30, (s[i + 1] - a) * 0.6) : a + 30)));
})();
export const SH_DDR6_SHEET_FRAMES = SAMPLES.length;
export const Ddr6Sheet = makeSheet(Ddr6Short, SAMPLES);
