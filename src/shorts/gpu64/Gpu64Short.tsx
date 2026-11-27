/**
 * SH-GPU64 — "China's 64GB GPU: NVIDIA's new competitor?" (YouTube Short).
 * Narration: Higgs Audio v2 expressive voice (public/short-gpu64/audio/narration.wav).
 * Music: Kevin MacLeod (incompetech.com, CC BY 4.0). SFX: Mixkit (Mixkit License) — see public/short-gpu64/CREDITS.md.
 */
import React from "react";
import { makeSheet, Mix, ShortMaster, type Bed, type SCap, type Sfx } from "../engine/Engine";
import { CAPTIONS, TOTAL_FRAMES, VO_FRAMES, VOX } from "./data";
import { BEAT_STARTS, c, Picture } from "./Scenes";

export const SH_GPU64_FRAMES = TOTAL_FRAMES;
const S = (n: string) => `ug-006/sfx/${n}.mp3`;
const N = (n: string) => `short-gpu64/sfx/${n}.mp3`;
const PN = (n: string) => `short-pencil/sfx/${n}.mp3`;
const MU = (n: string) => `ug-006/music/${n}.mp3`;

const BEDS: Bed[] = [
  [MU("Lightless_Dawn"), 0, c("know") + 10, 0.2],
  [MU("Investigations"), c("know"), c("ifchina") + 10, 0.2],
  [MU("Heroic_Age"), c("ifchina"), TOTAL_FRAMES, 0.2],
];
const SFX: Sfx[] = [
  // hook
  [0, S("bass_rumble"), 0.4],
  [1, S("trailer_impact"), 0.45],
  [4, N("fan_start"), 0.25, 60],
  [c("vram") - 30, S("whoosh_metal"), 0.4],
  [c("vram") - 14, S("epic_impact"), 0.45],
  [c("vram") - 12, PN("elec_sparks"), 0.35],
  // double
  [c("double"), S("big_impact"), 0.45],
  [c("double") + 6, S("whoosh_impact"), 0.35],
  [c("rtx"), S("ui_select"), 0.3],
  [c("card") - 3, S("whoosh_fast"), 0.35],
  [c("card") + 2, S("sweep_cine"), 0.3],
  [c("twice"), S("tech_slide"), 0.3],
  [c("twice") + 4, S("crate_pickup"), 0.25],
  [c("twice") + 14, S("calculations"), 0.2, 40],
  [c("powerful"), S("ui_tone"), 0.3],
  // claims
  [c("claims") - 3, S("whoosh_fast2"), 0.35],
  [c("claims") + 2, N("fan_start"), 0.3, c("interesting") - c("claims")],
  [c("insane") - 4, PN("elec_shockwave"), 0.4],
  [c("insane"), S("deep_impact"), 0.45],
  // interesting: draped card
  [c("interesting") - 2, N("suspense_swell"), 0.35],
  [c("interesting") + 4, N("glass_hit"), 0.3],
  // not confirmed
  [c("figure"), S("glitch_text"), 0.35],
  [c("confirmed"), S("stapler"), 0.4],
  [c("confirmed") + 2, S("heartbeat_impact"), 0.3],
  // estimate
  [c("based") - 2, S("whoosh_air"), 0.3],
  [c("suggesting"), S("click_scifi"), 0.35],
  [c("previous"), S("ui_select"), 0.3],
  [c("previous") + 16, S("construction_done"), 0.25],
  [c("moore") - 10, S("riser_heli"), 0.3],
  // Moore Threads reveal
  [c("moore") + 2, N("cloth_slide"), 0.45],
  [c("moore") + 8, S("trailer_whoosh_hit"), 0.4],
  [c("moore") + 22, S("epic_impact"), 0.4],
  [c("ambitious"), S("swell"), 0.25],
  // 15x / 50x
  [c("talked"), PN("elec_powerup"), 0.35],
  [c("talked") + 4, N("scan_waves"), 0.2, c("confuse") - c("talked")],
  [c("gaming"), S("bass_pulse"), 0.4],
  [c("ray"), S("whoosh_impact"), 0.4],
  [c("ray") + 4, PN("elec_whoosh"), 0.35],
  [c("older"), S("ui_tone"), 0.3],
  // not a 5090 benchmark
  [c("confuse") - 2, S("glitch_rewind"), 0.35],
  [c("bench") + 4, S("hammer_metal"), 0.4],
  // reality check
  [c("know") - 2, S("reverse_impact"), 0.3],
  [c("know") + 4, N("data_scan"), 0.3],
  [c("price"), S("ui_click"), 0.35],
  [c("realg"), S("ui_click"), 0.35],
  [c("drivers"), S("ui_click"), 0.35],
  [c("drivers") + 14, PN("device_fail"), 0.3],
  // reveal date
  [c("reveal") - 2, S("whoosh_tunnel"), 0.35],
  [c("december") - 14, N("page_turn"), 0.4],
  [c("december") - 9, N("page_turn"), 0.4],
  [c("december") - 4, N("paper_slide"), 0.4],
  [c("december") + 4, S("countdown"), 0.3, 30],
  [c("december") + 4, S("trailer_impact"), 0.4],
  // if China delivers
  [c("ifchina") - 3, S("whoosh_fast"), 0.35],
  [c("ifchina") + 2, S("machine_start"), 0.3],
  [c("affordable") - 10, S("coins"), 0.3],
  // face-off
  [c("alternative") - 2, S("sweep_cine"), 0.35],
  [c("alternative") + 2, PN("charge_hum"), 0.3, c("number") - c("alternative")],
  [c("alternative") + 6, S("big_impact"), 0.4],
  // ending
  [c("number") - 2, S("glitch_break"), 0.35],
  [c("just"), S("heartbeat_impact"), 0.35],
  [VO_FRAMES - 4, PN("elec_shockwave"), 0.4],
  [VO_FRAMES, S("epic_impact"), 0.45],
];

/** Accent words in captions. */
const ACCENT = /^(64gb|64|gb|vram|double|twice|5090|nvidia|nvidias|insane|interesting|confirmed|officially|four|16gb|16|moore|threads|15|50|ray|tracing|benchmark|price|drivers|december|29|29th|affordable|alternative|number|china|chinese)$/i;
/** Hide captions while big type on screen already says the same words. */
const hideCaps = (f: number) => (f >= c("insane") - 2 && f < c("interesting")) || (f >= c("number") && f < c("number") + 6);
const hideChip = (f: number) => f < c("double") || f >= c("number");

export const Gpu64Short: React.FC<{ audio?: boolean; offset?: number }> = ({ audio = true, offset = 0 }) => (
  <ShortMaster
    offset={offset}
    audio={audio}
    total={TOTAL_FRAMES}
    voFrames={VO_FRAMES}
    picture={(f) => <Picture f={f} />}
    caps={CAPTIONS as SCap[]}
    accent={ACCENT}
    hideCaps={hideCaps}
    topic="GPU · NEWS"
    hideChip={hideChip}
    mix={<Mix narration="short-gpu64/audio/narration.wav" beds={BEDS} sfx={SFX} vox={VOX} total={TOTAL_FRAMES} />}
  />
);

/** QC sheet: one still per beat (rendered via the master's frame offset). */
const SAMPLES = (() => {
  const s = [0, ...BEAT_STARTS(), VO_FRAMES];
  return s.map((a, i) => Math.min(TOTAL_FRAMES - 1, Math.round(i + 1 < s.length ? a + Math.min(30, (s[i + 1] - a) * 0.6) : a + 30)));
})();
export const SH_GPU64_SHEET_FRAMES = SAMPLES.length;
export const Gpu64Sheet = makeSheet(Gpu64Short, SAMPLES);
